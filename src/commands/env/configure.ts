import { flags } from "@oclif/command"
import chalk from "chalk"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"
import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"

import environmentsManager from "../../lib/environments"

/**
 * Represents the "scaffold env:configure" command
 * used to configure an environment.
 */
class EnvConfigure extends BaseInfrastructureCommand {
  static args = [{
    name: "environment",
    required: true,
  }]

  static description = "configure passed environment"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  async run() {
    const { args } = this.parse(EnvConfigure)

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

    const environmentToConfigure = args.environment as string

    const environments = await environmentsManager.findAll(infrastructurePath)

    if (!environments.all.includes(environmentToConfigure)) {
      this.error(`"${chalk.bold(environmentToConfigure)}" environment not found.`)
    }

    if (environments.configured.includes(environmentToConfigure)) {
      this.error(`"${chalk.bold(environmentToConfigure)}" environment already configured.`)
    }

    const cdktfPath = this.cdktfPath(infrastructurePath)
    const terraformBinaryPath = BaseInfrastructureCommand.terraformBinaryPath()
    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)

    await environmentsManager.configure(
      environmentToConfigure,
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

export default EnvConfigure
