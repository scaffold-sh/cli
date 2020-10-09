import inquirer from "inquirer"

/**
 * Asks to confirm sandbox deletion for environment.
 * @param environment The environment that contains the sandbox.
 *
 * @returns A promise object representing the confirmation.
 */
const confirmSandboxDeletionPrompt = async (environment: string) => {
  const { confirmSandboxDeletion } = await inquirer.prompt<{confirmSandboxDeletion: boolean}>([{
    name: "confirmSandboxDeletion",
    message: `Do you really want to remove your sandbox for the "${environment}" environment?`,
    type: "confirm",
    default: false,
  }])

  return confirmSandboxDeletion
}

export default confirmSandboxDeletionPrompt
