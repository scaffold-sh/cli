import inquirer from "inquirer"

import environmentNameValidator from "../environments/validators/environmentNameValidator"

/**
 * Asks for an environment name.
 * @param infrastructurePath The path to the infrastructure.
 * @param defaultEnvironmentName The environment name to use as default value.
 *
 * @returns A promise object representing the environment name.
 */
const environmentNamePrompt = async (infrastructurePath: string, defaultEnvironmentName?: string) => {
  const { environment } = await inquirer.prompt<{
    environment: string;
  }>([{
    name: "environment",
    message: "Environment name:",
    type: "input",
    default: defaultEnvironmentName,
    validate: async (environmentName: string) => {
      return environmentNameValidator(infrastructurePath, environmentName)
    },
  }])

  return environment
}

export default environmentNamePrompt
