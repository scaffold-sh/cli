import { flags } from "@oclif/command"
import chalk from "chalk"

import ux from "cli-ux"
import execa from "execa"

import BaseInfrastructureCommand from "../BaseInfrastructureCommand"
import InfrastructureFactory from "../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../lib/environments"
import getNodeEnv from "../lib/environments/getNodeEnv"

/**
 * Represents the "scaffold destroy {environment}" command
 * used to destroy the infrastructure of an environment.
 */
class Destroy extends BaseInfrastructureCommand {
  static args = [{
    name: "environment",
    required: true,
  }]

  static description = "destroy infrastructure for passed environment"

  static flags = {
    help: flags.help({
      char: "h",
    }),

    sandbox: flags.boolean({
      default: false,
    }),
  }

  static strict = false

  async run() {
    const { args, flags } = this.parse(Destroy)

    await this.ensureAllRequirements()

    const environment: string = args.environment

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

    const environments = await environmentsManager.findAll(infrastructurePath)

    if (!environments.all.includes(environment)) {
      this.error(`"${chalk.bold(environment)}" environment doesn't exist.`)
    }

    if (!flags.sandbox) {
      if (!environments.configured.includes(environment)) {
        this.error(`"${chalk.bold(environment)}" environment not configured.`)
      }
    } else if (!environments.sandboxed.includes(environment)) {
      this.error(`Sandbox for "${chalk.bold(environment)}" environment doesn't exist.`)
    }

    const cdktfPath = this.cdktfPath(infrastructurePath)
    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)
    const terraformPath = BaseInfrastructureCommand.terraformBinaryPath()

    ux.action.start("Synthesizing")

    await execa(cdktfPath, ["synth"], {
      cwd: infrastructurePath,
      env: {
        NODE_ENV: getNodeEnv(environment, flags.sandbox),
      },
    })

    await execa(terraformPath, ["init", "-reconfigure"], {
      cwd: terraformPlanPath,
    })

    ux.action.stop()

    this.log("")

    // Remove ["node", "{path}", "destroy", "{environment}"]
    const argsToPassToTF = process.argv.slice(4).filter(arg => !["--sandbox", "-sandbox"].includes(arg))

    const terraformDestroy = execa(terraformPath, ["destroy"].concat(argsToPassToTF), {
      cwd: terraformPlanPath,
    })

    terraformDestroy.stderr.pipe(process.stderr)
    terraformDestroy.stdout.pipe(process.stdout)
    process.stdin.pipe(terraformDestroy.stdin)

    try {
      await terraformDestroy
    } catch (error) {
      this.exit(1)
    }
  }
}

export default Destroy
