import inquirer from "inquirer"

/**
 * Asks to confirm environment deletion for environment.
 * @param environment The environment to delete.
 *
 * @returns A promise object representing the confirmation.
 */
const confirmEnvironmentDeletionPrompt = async (environment: string) => {
  const { confirmEnvironmentDeletion } = await inquirer.prompt<{
    confirmEnvironmentDeletion: boolean;
  }>([{
    name: "confirmEnvironmentDeletion",
    message: `Do you really want to remove the "${environment}" environment?`,
    type: "confirm",
    default: false,
  }])

  return confirmEnvironmentDeletion
}

export default confirmEnvironmentDeletionPrompt
