import { join, resolve } from "path"
import Command from "@oclif/command"

import * as Config from "@oclif/config"
import ux from "cli-ux"

import chalk from "chalk"
import commandExists from "command-exists"

import { getAWSProfiles } from "aws-get-credentials"
import semver from "semver"

/**
 * Represents a command.
 * @class
 * @extends Command
 */
abstract class BaseCommand extends Command {
  readonly configFilePath: string

  /**
   * Creates a command.
   * @param argv The passed argument values.
   * @param config The CLI configuration.
   */
  constructor(argv: string[], config: Config.IConfig) {
    super(argv, config)

    this.configFilePath = join(config.configDir, "config.json")
  }

  /**
   * Returns path to the binaries folder.
   *
   * @returns The path to the binaries folder.
   */
  static binariesFolderPath() {
    return resolve(__dirname, "..", "bin")
  }

  /**
   * Ensures the AWS CLI is installed and configured.
   *
   * @returns Empty promise object.
   */
  private async ensureAWSCLI() {
    try {
      await commandExists("aws")

      const configuredAWSProfiles = await getAWSProfiles()

      if (configuredAWSProfiles.length === 0) {
        throw new Error("no profile configured")
      }
    } catch (error) {
      ux.error(`The AWS CLI must be installed and configured using the "${chalk.bold("aws configure")}" command.`)
    }
  }

  /**
   * Ensures all requirements are met to run the CLI.
   *
   * @returns Empty promise object.
   */
  async ensureAllRequirements() {
    await this.ensureAWSCLI()
    this.ensureNodeVersion()
  }

  /**
   * Ensures the Node version match requirements.
   *
   * @returns Nothing.
   */
  private ensureNodeVersion() {
    if (semver.lt(process.version, "12.16.0")) {
      ux.error("Needs at least Node v12.16 to run.")
    }
  }
}

export default BaseCommand
