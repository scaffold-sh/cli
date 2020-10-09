import chalk from "chalk"
import inquirer from "inquirer"

import ux from "cli-ux"

/**
 * Asks for a Docker container listen port.
 * @param defaultDockerContainerListenPort The port to use as default.
 *
 * @returns A promise object representing the listen port.
 */
const dockerContainerListenPort = async (
  defaultDockerContainerListenPort?: string
) => {
  ux.log(chalk.bold("\n› Set your Docker container listen port"))
  ux.log(chalk.hex("#bbb")("  On which port do your Docker container listen to?"))

  const { docker_container_listen_port: dockerContainerListenPort } = await inquirer.prompt<{docker_container_listen_port: string}>([{
    name: "docker_container_port",
    message: "Docker container listen port:",
    type: "input",
    default: defaultDockerContainerListenPort || undefined,
    validate: (rawContainerPort) => {
      const port = Number(rawContainerPort)

      if (!port) {
        return false
      }

      if (port < 1 || port > 65535) {
        return false
      }

      return true
    }
  }])

  return dockerContainerListenPort
}

export default dockerContainerListenPort
