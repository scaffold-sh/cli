import { join, resolve } from "path"
import { readJSON } from "fs-extra"

import findParentDir from "find-parent-dir"

import BaseCommand from "./BaseCommand"
import IInfrastructurePackage from "./lib/infrastructures/interfaces/IInfrastructurePackage"

import ICDKTFPackage from "./lib/infrastructures/interfaces/ICDKTFPackage"

/**
 * Represents an infrastructure command.
 * @class
 * @extends BaseCommand
 */
abstract class BaseInfrastructureCommand extends BaseCommand {
  static INFRASTRUCTURE_PACKAGE_NAME = "scaffold.json"

  static CDKTF_PACKAGE_NAME = "cdktf.json"

  /**
   * Returns the Terraform binary name depending on platform.
   *
   * @returns The Terraform binary name.
   */
  static terraformBinaryName() {
    return process.platform === "win32" ? "terraform.exe" : "terraform"
  }

  /**
   * Returns the infrastructure path by searching for the Scaffold package JSON file.
   *
   * @returns Promise representing the infrastructure path or "null" if not found.
   */
  async infrastructurePath() {
    return new Promise<string|null>((resolve, reject) => {
      findParentDir(process.cwd(), BaseInfrastructureCommand.INFRASTRUCTURE_PACKAGE_NAME, (err, dir) => {
        if (err) {
          return reject(err)
        }

        return resolve(dir)
      })
    })
  }

  /**
   * Returns path to the CDKTF binary file relative to passed infrastructure path.
   * @param infrastructurePath The path to the infrastructure.
   *
   * @returns The path to the CDKTF binary file.
   */
  cdktfPath(infrastructurePath: string) {
    return resolve(infrastructurePath, "node_modules", ".bin", "cdktf")
  }

  /**
   * Returns path to the Terraform working directory relative to passed infrastructure path.
   * @param infrastructurePath The path to the infrastructure.
   *
   * @returns Promise representing the path to the Terraform working directory.
   */
  async terraformPlanPath(infrastructurePath: string) {
    const cdktf: ICDKTFPackage = await readJSON(
      join(infrastructurePath, BaseInfrastructureCommand.CDKTF_PACKAGE_NAME)
    )

    return resolve(infrastructurePath, cdktf.output || "out")
  }

  /**
   * Returns path to the downloaded Terraform binary file.
   *
   * @returns The path to the Terraform binary file.
   */
  static terraformBinaryPath() {
    return join(
      BaseCommand.binariesFolderPath(),
      BaseInfrastructureCommand.terraformBinaryName()
    )
  }

  /**
   * Returns the Scaffold package JSON file content for passed infrastructure.
   * @param infrastructurePath The path to the infrastructure.
   *
   * @returns The Scaffold package JSON file content or "null" if not found.
   */
  async infrastructurePackage(infrastructurePath: string): Promise<IInfrastructurePackage|null> {
    try {
      const infrastructurePackage: IInfrastructurePackage = await readJSON(join(
        infrastructurePath,
        BaseInfrastructureCommand.INFRASTRUCTURE_PACKAGE_NAME
      ))

      return infrastructurePackage
    } catch (error) {
      return null
    }
  }
}

export default BaseInfrastructureCommand
