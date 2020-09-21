import inquirer from "inquirer"

/**
 * Asks to confirm sandbox deletion for environment.
 * @param environment The environment that contains the sandbox.
 *
 * @returns A promise object representing the confirmation.
 */
const confirmSandboxDeletionPrompt = async (environment: string) => {
  const { confirm_sandbox_delete: confirmSandboxDelete } = await inquirer.prompt<{
    confirm_sandbox_delete: boolean;
  }>([{
    name: "confirm_sandbox_delete",
    message: `Do you really want to remove your sandbox for the "${environment}" environment?`,
    type: "confirm",
    default: false,
  }])

  return confirmSandboxDelete
}

export default confirmSandboxDeletionPrompt
