import inquirer from "inquirer"
import sanitizeFilename from "sanitize-filename"

import chalk from "chalk"
import ux from "cli-ux"

/**
 * Asks for a project name.
 *
 * @returns A promise object representing the project name.
 */
const projectNamePrompt = async () => {
  ux.log(chalk.bold("\n› Choose a project name"))
  ux.log(chalk.hex("#bbb")("  What is the name of your project?"))

  const { projectName } = await inquirer.prompt<{
    projectName: string;
  }>([{
    name: "projectName",
    message: "Project name:",
    type: "input",
    validate: async (projectName: string) => {
      const projectDirName = sanitizeFilename(projectName)

      if (!projectDirName) {
        return "Invalid project name"
      }

      return true
    },
  }])

  return projectName
}

export default projectNamePrompt
