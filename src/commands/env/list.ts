import { flags } from "@oclif/command"
import chalk from "chalk"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"
import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../../lib/environments"

/**
 * Represents the "scaffold env:list" command
 * used to list the created environments.
 */
class EnvList extends BaseInfrastructureCommand {
  static description = "list environments"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  static args = []

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

    this.log(`${chalk.bold("Configured:")}`)

    for (const environment of environments.configured) {
      this.log(`  ${environment}`)
    }

    if (environments.configured.length === 0) {
      this.log(`  ${chalk.gray("No environments")}`)
    }

    this.log(`\n${chalk.bold("Unconfigured:")}`)

    for (const environment of environments.unconfigured) {
      this.log(`  ${environment}`)
    }

    if (environments.unconfigured.length === 0) {
      this.log(`  ${chalk.gray("No environments")}`)
    }
  }
}

export default EnvList
