import inquirer from "inquirer"

/**
 * Asks to confirm environment deletion for environment.
 * @param environment The environment to delete.
 *
 * @returns A promise object representing the confirmation.
 */
const confirmEnvironmentDeletionPrompt = async (environment: string) => {
  const { confirm_environment_deletion: confirmEnvironmentDeletion } = await inquirer.prompt<{
    confirm_environment_deletion: boolean;
  }>([{
    name: "confirm_environment_deletion",
    message: `Do you really want to remove your "${environment}" environment?`,
    type: "confirm",
    default: false,
  }])

  return confirmEnvironmentDeletion
}

export default confirmEnvironmentDeletionPrompt
