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
import confirmEnvironmentDeletionPrompt from "../../lib/prompts/confirmEnvironmentDeletionPrompt"

/**
 * Represents the "scaffold env:delete {environment}" command
 * used to delete an environment.
 */
class EnvDelete extends BaseInfrastructureCommand {
  static description = "delete passed environment"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  static args = [{
    name: "environment",
    required: true,
  }]

  async run() {
    const { args } = this.parse(EnvDelete)

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

    const environmentToDelete = args.environment as string

    const environments = await environmentsManager.findAll(infrastructurePath)

    if (!environments.all.includes(environmentToDelete)) {
      this.error(`"${chalk.bold(environmentToDelete)}" environment doesn't exist.`)
    }

    if (environments.sandboxed.includes(environmentToDelete)) {
      this.error(`Sandbox found. Run "${chalk.bold(chalk.cyan("scaffold") + " sandbox:delete " + environmentToDelete)}" first.`)
    }

    const cdktfPath = this.cdktfPath(infrastructurePath)
    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)
    const terraformPath = BaseInfrastructureCommand.terraformBinaryPath()

    if (environments.configured.includes(environmentToDelete)) {
      ux.action.start("Checking out Terraform state")

      await execa(cdktfPath, ["synth"], {
        cwd: infrastructurePath,
        env: {
          NODE_ENV: environmentToDelete,
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
          this.error(`Non-empty Terraform state. Run "${chalk.bold(chalk.cyan("scaffold") + " destroy " + environmentToDelete)}" first.`)
        }

        this.log("")
      } catch (error) {
        if (!error.message.match(/S3 bucket does not exist/)) {
          throw error
        }
      }
    }

    const confirmDeletion = await confirmEnvironmentDeletionPrompt(environmentToDelete)

    if (!confirmDeletion) {
      this.log("\nDeletion cancelled.")
      this.exit(0)
    }

    this.log("")
    ux.action.start("Removing environment")

    const {
      global: globalEnvPath,
      specific: specificEnvPath,
      local: localEnvPath,
    } = environmentsManager.getPaths(infrastructurePath, environmentToDelete)

    if (environments.configured.includes(environmentToDelete)) {
      const uppercasedEnvVars = dotenv.parse([
        globalEnvPath,
        specificEnvPath,
        localEnvPath,
      ])

      const envVars: any = {}

      Object.keys(uppercasedEnvVars).forEach(uppercasedKey => {
        envVars[uppercasedKey.toLowerCase()] = uppercasedEnvVars[uppercasedKey]
      })

      const s3Backend = new AWSS3Backend(
        envVars.scaffold_aws_region,
        envVars.scaffold_aws_profile
      )

      const backendEnvVars = s3Backend.generateBackendEnvVarsFromInfraEnvVars(
        envVars
      )

      await s3Backend.destroy(backendEnvVars)

      await remove(localEnvPath)
    }

    await remove(specificEnvPath)

    ux.action.stop()

    this.log(`\n${chalk.bold.green("Success!")} Deleted "${chalk.bold(environmentToDelete)}" environment at ${chalk.bold(infrastructurePath)}`)
  }
}

export default EnvDelete
