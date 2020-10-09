import { flags } from "@oclif/command"
import chalk from "chalk"

import inquirer from "inquirer"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"
import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../../lib/environments"

/**
 * Represents the "scaffold sandbox:create" command
 * used to create a sandbox for an environment.
 */
class SandboxCreate extends BaseInfrastructureCommand {
  static args = [{
    name: "environment",
    required: false,
  }]

  static description = "create sandbox for passed environment"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  async run() {
    const { args } = this.parse(SandboxCreate)

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

    const environments = await environmentsManager.findAll(infrastructurePath)

    if (environments.all.length === 0) {
      this.error("No environments found.")
    }

    let environmentToSandbox = args.environment as string|undefined

    if (!environmentToSandbox) {
      this.log("No environment name passed. Asking to choose one.\n")
      const environmentChoices = environments.all

      const { chosenEnvironment } = await inquirer.prompt<{ chosenEnvironment: string }>([{
        name: "chosenEnvironment",
        message: "Environment to create a sandbox from:",
        type: "list",
        choices: environmentChoices,
      }])

      environmentToSandbox = chosenEnvironment
    }

    if (!environments.all.includes(environmentToSandbox)) {
      this.error(`"${chalk.bold(environmentToSandbox)}" environment doesn't exist.`)
    }

    if (environments.sandboxed.includes(environmentToSandbox)) {
      this.error(`"${chalk.bold(environmentToSandbox)}" environment already sandboxed.`)
    }

    const cdktfPath = this.cdktfPath(infrastructurePath)
    const terraformBinaryPath = BaseInfrastructureCommand.terraformBinaryPath()
    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)

    await environmentsManager.configure(
      environmentToSandbox,
      true,
      infrastructure,
      infrastructurePath,
      this.configFilePath,
      cdktfPath,
      terraformBinaryPath,
      terraformPlanPath
    )
  }
}

export default SandboxCreate
