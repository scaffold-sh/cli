import { join } from "path"
import { chmod, outputFile, remove } from "fs-extra"

import ux from "cli-ux"

import getTerraformBinaryURLDependingOnPlatform from "./utils/getTerraformBinaryUrlDependingOnPlatform"
import downloadFileFromURL from "./utils/files/downloadFileFromUrl"

import unzip from "./utils/files/unzip"
import BaseCommand from "./BaseCommand"

import BaseInfrastructureCommand from "./BaseInfrastructureCommand"

// Run as a "postinstall" script.
// See "package.json" to learn more.
(async () => {
  try {
    ux.action.start("Downloading Terraform")

    const binariesFolderPath = BaseCommand.binariesFolderPath()
    const terraformBinaryPath = BaseInfrastructureCommand.terraformBinaryPath()

    const terraformZipPath = join(binariesFolderPath, "tf.zip")
    const terraformZip = await downloadFileFromURL(
      getTerraformBinaryURLDependingOnPlatform(
        process.platform,
        process.arch
      )
    )

    await outputFile(terraformZipPath, terraformZip)
    await unzip(terraformZipPath, binariesFolderPath)

    await chmod(terraformBinaryPath, 0o755)
    await remove(terraformZipPath)

    ux.action.stop()
    ux.log("")
  } catch (error) {
    ux.error(error, {
      exit: 1,
    })
  }
})()
