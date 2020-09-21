/**
 * Returns the "NODE_ENV" environment variable to use
 * depending on environment name and sandbox property.
 * @param environment The environment name.
 * @param isSandbox Do this environment is a sandbox?
 *
 * @returns The "NODE_ENV" environment variable.
 */
const getNodeEnv = (environment: string, isSandbox: boolean) => {
  return isSandbox ? `${environment}.sandbox` : environment
}

export default getNodeEnv
