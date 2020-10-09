import { flags } from "@oclif/command"
import chalk from "chalk"

import ux from "cli-ux"
import execa from "execa"

import BaseInfrastructureCommand from "../BaseInfrastructureCommand"
import InfrastructureFactory from "../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../lib/environments"
import getNodeEnv from "../lib/environments/getNodeEnv"

/**
 * Represents the "scaffold plan {environment}" command used to plan
 * the infrastructure modifications for an environment.
 */
class Plan extends BaseInfrastructureCommand {
  static args = [{
    name: "environment",
    required: true,
  }]

  static description = "plan infrastructure modifications for passed environment"

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
    const { args, flags } = this.parse(Plan)

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
        this.error(`"${chalk.bold(environment)}" environment not configured. Run "${chalk.bold(chalk.cyan("scaffold") + " env:configure " + environment)}" first.`)
      }
    } else if (!environments.sandboxed.includes(environment)) {
      this.error(`Sandbox for "${chalk.bold(environment)}" environment doesn't exist. Run "${chalk.bold(chalk.cyan("scaffold") + " sandbox:create " + environment)}" first.`)
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

    // Remove ["node", "{path}", "plan", "{environment}"]
    const argsToPassToTF = process.argv.slice(4).filter(arg => !["--sandbox", "-sandbox"].includes(arg))

    const terraformPlan = execa(terraformPath, ["plan"].concat(argsToPassToTF), {
      cwd: terraformPlanPath,
    })

    terraformPlan.stderr.pipe(process.stderr)
    terraformPlan.stdout.pipe(process.stdout)
    process.stdin.pipe(terraformPlan.stdin)

    try {
      await terraformPlan
    } catch (error) {
      this.exit(1)
    }
  }
}

export default Plan
