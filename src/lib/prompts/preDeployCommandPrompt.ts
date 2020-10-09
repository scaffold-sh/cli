import chalk from "chalk"
import inquirer from "inquirer"

import ux from "cli-ux"

/**
 * Asks for a pre-deploy command.
 * @param defaultPreDeployCommand The pre-deploy command to use as default value.
 *
 * @returns A promise object representing the pre-deploy command.
 */
const preDeployCommandPrompt = async (defaultPreDeployCommand?: string) => {
  ux.log(chalk.bold(`\n› Set a pre-deploy command ${chalk.yellowBright("(optional)")}`))
  ux.log(chalk.hex("#bbb")("  This command is run in a newly created production container, just before deployment."))

  const {
    pre_deploy_command: preDeployCommand,
  } = await inquirer.prompt<{
    pre_deploy_command: string;
  }>([{
    name: "pre_deploy_command",
    message: "Pre-deploy command:",
    type: "input",
    default: defaultPreDeployCommand || undefined,
  }])

  return preDeployCommand
}

export default preDeployCommandPrompt
