import { flags } from "@oclif/command"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"
import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../../lib/environments"

/**
 * Represents the "scaffold sandbox:list" command
 * used to list the created sandboxes.
 */
class SandboxList extends BaseInfrastructureCommand {
  static args = []

  static description = "list created sandboxes"

  static flags = {
    help: flags.help({
      char: "h",
    }),
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

    if (environments.sandboxed.length === 0) {
      this.log("No sandboxes.")
      return
    }

    for (const environment of environments.sandboxed) {
      this.log(environment)
    }
  }
}

export default SandboxList
