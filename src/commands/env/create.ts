import { flags } from "@oclif/command"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"
import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../../lib/environments"
import environmentNameValidator from "../../lib/environments/validators/environmentNameValidator"

/**
 * Represents the "scaffold env:create" command
 * used to create an environment.
 */
class EnvCreate extends BaseInfrastructureCommand {
  static args = [{
    name: "environment_name",
    required: false,
  }]

  static description = "create environment"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  async run() {
    const { args } = this.parse(EnvCreate)

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

    let environmentToCreate = args.environment_name as string|undefined

    if (!environmentToCreate) {
      this.log("No environment name passed. Asking for one.\n")
      environmentToCreate = await environmentsManager.create(infrastructurePath)
    }

    const environmentValidationError = await environmentNameValidator(infrastructurePath, environmentToCreate)

    if (typeof environmentValidationError === "string") {
      this.error(environmentValidationError)
    }

    const cdktfPath = this.cdktfPath(infrastructurePath)
    const terraformBinaryPath = BaseInfrastructureCommand.terraformBinaryPath()
    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)

    await environmentsManager.configure(
      environmentToCreate,
      false,
      infrastructure,
      infrastructurePath,
      this.configFilePath,
      cdktfPath,
      terraformBinaryPath,
      terraformPlanPath
    )
  }
}

export default EnvCreate
