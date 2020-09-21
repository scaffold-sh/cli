import { flags } from "@oclif/command"
import ux from "cli-ux"

import inquirer from "inquirer"

import environmentsManager from "../lib/environments"
import BaseInfrastructureCommand from "../BaseInfrastructureCommand"

import InfrastructureFactory from "../lib/infrastructures/InfrastructureFactory"

/**
 * Represents the "scaffold init" command
 * used to initialize an infrastructure.
 */
class Init extends BaseInfrastructureCommand {
  static description = "initialize an infrastructure"

  static flags = {
    help: flags.help({ char: "h" }),
  }

  async run() {
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

    const cdktfPath = this.cdktfPath(infrastructurePath)
    const terraformBinaryPath = BaseInfrastructureCommand.terraformBinaryPath()
    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)

    if (environments.all.length === 0) {
      ux.log("No environments found. Creating a new one.\n")

      const environment = await environmentsManager.create(infrastructurePath, "dev")

      await environmentsManager.configure(
        environment,
        false,
        infrastructure,
        infrastructurePath,
        this.configFilePath,
        cdktfPath,
        terraformBinaryPath,
        terraformPlanPath
      )

      return
    }

    if (environments.sandboxed.length > 0 || environments.configured.length > 0) {
      ux.log("Infrastructure already initialized. Nothing to do.")
      return
    }

    ux.log("No sandboxes found. Choose an environment to create a sandbox from.\n")

    const environmentChoices = environments.all

    const { environment_to_sandbox: environmentToSandbox } = await inquirer.prompt<{ environment_to_sandbox: string }>([{
      name: "environment_to_sandbox",
      message: "Environment to create a sandbox from:",
      type: "list",
      choices: environmentChoices,
    }])

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

export default Init
