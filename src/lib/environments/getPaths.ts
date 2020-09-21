import { join } from "path"

import IEnvironmentPaths from "./interfaces/IEnvironmentPaths"

/**
 * Returns paths to the environment files for passed environment.
 * @param infrastructurePath The path to the infrastructure.
 * @param environment The environment name.
 *
 * @returns The paths to the environment files.
 */
const getPaths = (infrastructurePath: string, environment: string) => {
  const globalEnvPath = join(infrastructurePath, ".env")
  const specificEnvPath = join(infrastructurePath, `.env.${environment}`)

  const localEnvPath = join(infrastructurePath, `.env.${environment}.local`)
  const sandboxEnvPath = join(infrastructurePath, `.env.${environment}.sandbox.local`)

  return {
    global: globalEnvPath,
    specific: specificEnvPath,
    local: localEnvPath,
    sandbox: sandboxEnvPath,
  } as IEnvironmentPaths
}

export default getPaths
