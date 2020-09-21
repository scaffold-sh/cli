import environmentNamePrompt from "../prompts/environmentNamePrompt"

/**
 * Creates a new environment by asking user for a name.
 * @param infrastructurePath The path to the infrastructure.
 * @param defaultEnvironmentName The default environment name to use.
 *
 * @returns Promise object representing the environment name.
 */
const create = async (infrastructurePath: string, defaultEnvironmentName?: string) => {
  const environment = await environmentNamePrompt(infrastructurePath, defaultEnvironmentName)

  return environment
}

export default create
