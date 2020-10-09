import chalk from "chalk"
import inquirer from "inquirer"

import ux from "cli-ux"

/**
 * Asks for a build command.
 * @param defaultBuildCommand The build command to use as default value.
 * @param defaultBuildOutputDir The build output directory to use as default value.
 *
 * @returns A promise object representing the build command and build output directory.
 */
const buildCommandPrompt = async (defaultBuildCommand?: string, defaultBuildOutputDir?: string) => {
  ux.log(chalk.bold(`\n› Set a build command ${chalk.yellowBright("(optional)")}`))
  ux.log(chalk.hex("#bbb")("  Do your website needs to be build (e.g. npm i && npm run build)?"))

  const { buildCommand, buildOutputDir } = await inquirer.prompt<{buildCommand: string|undefined;buildOutputDir: string|undefined}>([{
    name: "buildCommand",
    message: "Build command:",
    type: "input",
    default: defaultBuildCommand || undefined,
  }, {
    name: "buildOutputDir",
    message: "Build output directory:",
    default: defaultBuildOutputDir || "build",
    type: "input",
    when: (answers: any) => Boolean(answers.buildCommand),
  }])

  return {
    buildCommand: buildCommand,
    buildOutputDir: buildOutputDir,
  }
}

export default buildCommandPrompt
