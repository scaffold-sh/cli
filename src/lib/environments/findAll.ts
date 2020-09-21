import { extname } from "path"

import files from "../../utils/files"
import IEnvironments from "./interfaces/IEnvironments"

import getPaths from "./getPaths"

/**
 * Finds all the environments
 * in the specified infrastructure path.
 * @param infrastructurePath The path to the infrastructure.
 *
 * @returns Promise object representing the environments found.
 */
const findAll = async (infrastructurePath: string) => {
  const envFilePaths = await files.find(infrastructurePath, ".env.*")
  const allEnvironments = envFilePaths.map(envFilePath => extname(envFilePath).slice(1)).filter(env => env !== "local")

  const environments: IEnvironments = {
    configured: [],
    unconfigured: [],
    all: [],
    sandboxed: [],
  }

  allEnvironments.forEach(environment => {
    const environmentPaths = getPaths(infrastructurePath, environment)

    const isConfigured = Boolean(envFilePaths.filter(envFilePath => envFilePath === environmentPaths.local).length)
    const hasSandbox = Boolean(envFilePaths.filter(envFilePath => envFilePath === environmentPaths.sandbox).length)

    if (!environments.all.includes(environment)) {
      environments.all.push(environment)
    }

    if (hasSandbox && !environments.sandboxed.includes(environment)) {
      environments.sandboxed.push(environment)
    }

    if (isConfigured) {
      if (!environments.configured.includes(environment)) {
        environments.configured.push(environment)
      }
    } else if (!environments.unconfigured.includes(environment)) {
      environments.unconfigured.push(environment)
    }
  })

  return environments
}

export default findAll
