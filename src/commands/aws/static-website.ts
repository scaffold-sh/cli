import { join } from "path"
import { flags } from "@oclif/command"

import { pathExists, readdirSync } from "fs-extra"
import sanitizeFilename from "sanitize-filename"

import slugify from "slugify"
import ux from "cli-ux"

import AWSStaticWebsite from "../../lib/infrastructures/aws/AWSStaticWebsite"
import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"

import InfrastructureInstallManager from "../../lib/infrastructures/InfrastructureInstallManager"
import projectNamePrompt from "../../lib/prompts/projectNamePrompt"

/**
 * Represents the "scaffold aws:static-website" command
 * used to download and install the AWS static website infrastructure.
 */
export default class AwsStaticWebsite extends BaseInfrastructureCommand {
  static description = "download static website infrastructure code"

  static flags = {
    help: flags.help({ char: "h" }),
  }

  static args = [{
    name: "project_name",
    required: false,
  }]

  async run() {
    await this.ensureAllRequirements()

    const { args } = this.parse(AwsStaticWebsite)

    let projectName: string = args.project_name

    if (!projectName) {
      projectName = await projectNamePrompt()

      this.log("")
    }

    const projectDirName = slugify(sanitizeFilename(projectName))

    if (!projectDirName) {
      this.error("Invalid project name")
    }

    const projectPath = join(process.cwd(), projectDirName)
    const projectPathExists = await pathExists(projectPath)

    if (projectPathExists) {
      if (readdirSync(projectPath).filter(f => !f.startsWith(".")).length > 0) {
        this.error("Cannot download infrastructure code in a non-empty directory")
      }
    }

    ux.action.start("Downloading")

    const awsStaticWebsite = new AWSStaticWebsite()

    await awsStaticWebsite.install(projectPath)

    ux.action.stop()

    InfrastructureInstallManager.displaySuccessfulInstallMessage(projectPath)
  }
}
