import chalk from "chalk"
import inquirer from "inquirer"

import bent from "bent"
import ora from "ora"

import ux from "cli-ux"

/**
 * Asks for a GitHub repository branch.
 * @param githubRepoOwner The GitHub repository owner.
 * @param githubRepo The GitHub repository.
 * @param api The authenticated Bent API object.
 * @param defaultBranch The branch to be selected as default value.
 *
 * @returns A promise object representing the GitHub branch.
 */
const githubBranchPrompt = async (
  githubRepoOwner: string,
  githubRepo: string,
  api: bent.RequestFunction<bent.ValidResponse>,
  defaultBranch?: string
) => {
  ux.log(chalk.bold("\n› Choose a branch to deploy from"))
  ux.log(chalk.hex("#bbb")("  From which branch do you want to deploy?"))

  const loader = ora("").start()

  const githubBranches = await api(`/github/repositories/${githubRepoOwner}/${githubRepo}/branches`) as {name: string}[]

  loader.stop()

  const { github_branch: githubBranch } = await inquirer.prompt<{github_branch: string}>([{
    name: "github_branch",
    message: "Branch:",
    type: "list",
    choices: githubBranches.map(branch => branch.name),
    default: defaultBranch || undefined,
  }])

  return githubBranch
}

export default githubBranchPrompt
