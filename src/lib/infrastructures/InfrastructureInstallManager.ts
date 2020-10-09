import { basename, join } from "path"
import { copy, outputFile, remove } from "fs-extra"

import ux from "cli-ux"
import chalk from "chalk"

import downloadFileFromURL from "../../utils/files/downloadFileFromUrl"
import unzip from "../../utils/files/unzip"

/**
 * Manage infrastructures installation.
 */
class InfrastructureInstallManager {
  /**
   * Removes downloaded infrastructure.
   * @param infrastructureZipPath The path to the downloaded infrastructure.
   * @param extractedZipFolder The path to the extracted infrastructure folder.
   *
   * @returns Empty Promise object.
   */
  static async cleanDownloadedZip(infrastructureZipPath: string, extractedZipFolder: string) {
    await remove(extractedZipFolder)
    await remove(infrastructureZipPath)
  }

  /**
   * Displays successful installation message.
   * @param infrastructurePath The path to the installed infrastructure.
   *
   * @returns Nothing.
   */
  static displaySuccessfulInstallMessage(infrastructurePath: string) {
    ux.log(`\n${chalk.bold.green("Success!")} Downloaded infrastructure code at ${chalk.bold(infrastructurePath)}`)

    ux.log("\nInside that directory, you will be able to run all the Scaffold commands.")
    ux.log("But first, start by typing:")

    ux.log(`\n  ${chalk.bold.cyan("cd")} ${basename(infrastructurePath)}`)
    ux.log(`  ${chalk.bold.cyan("scaffold")} init`)
  }

  /**
   * Downloads an infrastructure as zip in a specified path.
   * @param inPath The path to download the infrastructure to.
   * @param url The URL to download the infrastructure from.
   *
   * @returns The infrastructure zip file path
   */
  static async download(inPath: string, url: string) {
    const infrastructureZipPath = join(inPath, "master.zip")
    const infrastructureZip = await downloadFileFromURL(url)

    await outputFile(infrastructureZipPath, infrastructureZip)

    return infrastructureZipPath
  }

  /**
   * Extracts downloaded infrastructure.
   * @param inPath The path to extract the infrastructure to.
   * @param infrastructureZipPath The path to the downloaded infrastructure.
   * @param infrastructureZipContainerFolder The name of the container folder in the infrastructure zip.
   *
   * @returns The path to the extracted container folder.
   */
  static async extractDownloadedZip(inPath: string, infrastructureZipPath: string, infrastructureZipContainerFolder: string) {
    await unzip(infrastructureZipPath, inPath)

    const containerFolderPath = join(inPath, infrastructureZipContainerFolder)

    // Move files out of container folder
    await copy(containerFolderPath, inPath, {
      overwrite: true,
    })

    return containerFolderPath
  }
}

export default InfrastructureInstallManager
