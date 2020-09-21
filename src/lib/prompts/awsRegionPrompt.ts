import chalk from "chalk"
import inquirer from "inquirer"

import awsRegions from "aws-regions"
import ux from "cli-ux"

/**
 * Asks for an AWS region.
 * @param defaultAWSRegion The AWS region to use as default value.
 *
 * @returns A promise object representing the AWS region.
 */
const awsRegionPrompt = async (defaultAWSRegion?: string) => {
  ux.log(chalk.bold("\n› Choose an AWS region"))
  ux.log(chalk.hex("#bbb")("  On which region do you want to create this infrastructure?"))

  const regions = awsRegions.list().map(region => region.code)

  const { aws_region: awsRegion } = await inquirer.prompt<{aws_region: string}>([{
    name: "aws_region",
    message: "AWS region:",
    type: "list",
    choices: regions,
    default: defaultAWSRegion,
  }])

  return awsRegion
}

export default awsRegionPrompt
