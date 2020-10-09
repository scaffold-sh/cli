import { flags } from "@oclif/command"
import chalk from "chalk"

import ux from "cli-ux"
import execa from "execa"

import open from "open"

import BaseInfrastructureCommand from "../BaseInfrastructureCommand"
import InfrastructureFactory from "../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../lib/environments"
import getNodeEnv from "../lib/environments/getNodeEnv"

/**
 * Represents the "scaffold apply {environment}" command
 * used to update the infrastructure of an environment.
 */
class Apply extends BaseInfrastructureCommand {
  static args = [{
    name: "environment",
    required: true,
  }]

  static description = "update infrastructure for passed environment"

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
    const { args, flags } = this.parse(Apply)

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

    const { stdout } = await execa(terraformPath, ["state", "pull"], {
      cwd: terraformPlanPath,
    })

    const state = JSON.parse(stdout)
    const isFirstCreation = state.serial === 0 && !state.resources.length

    ux.action.stop()

    this.log("")

    // Remove ["node", "{path}", "apply", "{environment}"]
    const argsToPassToTF = process.argv.slice(4).filter(arg => !["--sandbox", "-sandbox"].includes(arg))

    const terraformApply = execa(terraformPath, ["apply"].concat(argsToPassToTF), {
      cwd: terraformPlanPath,
    })

    terraformApply.stderr.pipe(process.stderr)
    terraformApply.stdout.pipe(process.stdout)
    process.stdin.pipe(terraformApply.stdin)

    try {
      await terraformApply

      if (isFirstCreation && (environments.all.length + environments.sandboxed.length) === 1) {
        const afterInstallURL = infrastructure.afterInstallURL()

        let urlDisplayed = false

        const showUrl = () => {
          if (!urlDisplayed) {
            ux.warn(`\nCannot open browser, visit\n${chalk.blueBright(afterInstallURL)}`)
          }

          urlDisplayed = true
        }

        const cp = await open(afterInstallURL)

        cp.on("error", err => {
          ux.warn(`\n${err}`)

          showUrl()
        })

        cp.on("close", code => {
          if (code !== 0) {
            showUrl()
          }
        })
      }
    } catch (error) {
      this.exit(1)
    }
  }
}

export default Apply
