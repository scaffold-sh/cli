import chalk from "chalk"
import inquirer from "inquirer"

import { getAWSProfiles } from "aws-get-credentials"
import ux from "cli-ux"

/**
 * Asks for an AWS account.
 * @param defaultAWSAccount The AWS account to use as default value.
 *
 * @returns A promise object representing the AWS account.
 */
const awsAccountPrompt = async (defaultAWSAccount?: string) => {
  ux.log(chalk.bold("\n› Choose an AWS account"))
  ux.log(chalk.hex("#bbb")("  On which AWS account do you want to create this infrastructure?"))

  const profiles = await getAWSProfiles()

  const { aws_profile: awsProfile } = await inquirer.prompt<{aws_profile: string}>([{
    name: "aws_profile",
    message: "AWS account:",
    type: "list",
    choices: profiles,
    default: defaultAWSAccount,
  }])

  return awsProfile
}

export default awsAccountPrompt
