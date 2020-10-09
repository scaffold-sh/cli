import { flags } from "@oclif/command"
import dotenv from "dotenv-flow"

import ux from "cli-ux"
import { remove } from "fs-extra"

import chalk from "chalk"
import execa from "execa"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"

import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"
import environmentsManager from "../../lib/environments"

import AWSS3Backend from "../../lib/backends/AWSS3Backend"
import confirmSandboxDeletionPrompt from "../../lib/prompts/confirmSandboxDeletionPrompt"

import getNodeEnv from "../../lib/environments/getNodeEnv"
import IAWSInfrastructureEnvVars from "../../lib/infrastructures/interfaces/IAWSInfrastructureEnvVars"

/**
 * Represents the "scaffold sandbox:delete {environment}" command
 * used to delete a sandbox for an environment.
 */
class SandboxDelete extends BaseInfrastructureCommand {
  static args = [{
    name: "environment",
    required: true,
  }]

  static description = "delete sandbox for passed environment"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  async run() {
    const { args } = this.parse(SandboxDelete)

    await this.ensureAllRequirements()

    const infrastructurePath = await this.infrastructurePath()

    if (!infrastructurePath) {
      this.error("No infrastructures found.")
    }

    const infrastructurePackage = await this.infrastructurePackage(infrastructurePath)

    if (!infrastructurePackage) {
      this.error("Invalid scaffold.json file.")
    }

    const infrastructure = InfrastructureFactory.infrastructure(infrastructurePackage.type)

    if (!infrastructure) {
      this.error("Unknown infrastructure.")
    }

    const environmentSandboxToDelete = args.environment as string

    const environments = await environmentsManager.findAll(infrastructurePath)

    if (!environments.sandboxed.includes(environmentSandboxToDelete)) {
      this.error(`Sandbox for "${chalk.bold(environmentSandboxToDelete)}" environment doesn't exist.`)
    }

    const cdktfPath = this.cdktfPath(infrastructurePath)
    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)
    const terraformPath = BaseInfrastructureCommand.terraformBinaryPath()

    ux.action.start("Checking out Terraform state")

    await execa(cdktfPath, ["synth"], {
      cwd: infrastructurePath,
      env: {
        NODE_ENV: getNodeEnv(environmentSandboxToDelete, true),
      },
    })

    try {
      await execa(terraformPath, ["init", "-reconfigure"], {
        cwd: terraformPlanPath,
      })

      const { stdout } = await execa(terraformPath, ["state", "pull"], {
        cwd: terraformPlanPath,
      })

      const state = JSON.parse(stdout)

      ux.action.stop()

      if (state.resources.length > 0) {
        this.error(`Non-empty Terraform state. Run "${chalk.bold(chalk.cyan("scaffold") + " destroy " + environmentSandboxToDelete + " --sandbox")}" first.`)
      }

      this.log("")
    } catch (error) {
      if (!error.message.match(/S3 bucket does not exist/)) {
        throw error
      }
    }

    const confirmDeletion = await confirmSandboxDeletionPrompt(environmentSandboxToDelete)

    if (!confirmDeletion) {
      this.log("\nDeletion cancelled.")
      this.exit(0)
    }

    this.log("")
    ux.action.start("Removing sandbox")

    const {
      sandbox: sandboxEnvPath,
    } = environmentsManager.getPaths(infrastructurePath, environmentSandboxToDelete)

    const envVars = dotenv.parse([
      sandboxEnvPath,
    ]) as any as IAWSInfrastructureEnvVars

    const s3Backend = new AWSS3Backend(
      envVars.SCAFFOLD_AWS_REGION,
      envVars.SCAFFOLD_AWS_PROFILE
    )

    const backendEnvVars = s3Backend.generateBackendEnvVarsFromInfraEnvVars(
      envVars
    )

    await s3Backend.destroy(backendEnvVars)

    await remove(sandboxEnvPath)

    ux.action.stop()

    this.log(`\n${chalk.bold.green("Success!")} Deleted sandbox for "${chalk.bold(environmentSandboxToDelete)}" environment at ${chalk.bold(infrastructurePath)}`)
  }
}

export default SandboxDelete
