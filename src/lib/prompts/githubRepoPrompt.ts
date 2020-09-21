import chalk from "chalk"
import inquirer from "inquirer"

import bent from "bent"
import ora from "ora"

import ux from "cli-ux"

/**
 * Asks for a GitHub repository.
 * @param api The authenticated Bent API object.
 * @param defaultRepo The repository to be selected as default value.
 *
 * @returns A promise object representing the GitHub repository and GitHub repository owner.
 */
const githubRepoPrompt = async (api: bent.RequestFunction<bent.ValidResponse>, defaultRepo?: string) => {
  ux.log(chalk.bold("\n› Pick a GitHub repository"))
  ux.log(chalk.hex("#bbb")("  Which repository contains your source code?"))

  const loader = ora("").start()

  const githubRepos = await api("/github/repositories") as {owner: string; name: string}[]

  loader.stop()

  const { fully_qualified_github_repo: fullyQualifiedGithubRepo } = await inquirer.prompt<{fully_qualified_github_repo: string}>([{
    name: "fully_qualified_github_repo",
    message: "Repository:",
    type: "list",
    choices: githubRepos.map(repo => `${repo.owner}/${repo.name}`),
    default: defaultRepo || undefined,
  }])

  const [githubRepoOwner, githubRepo] = fullyQualifiedGithubRepo.split("/")

  return {
    github_repo_owner: githubRepoOwner,
    github_repo: githubRepo,
  }
}

export default githubRepoPrompt
