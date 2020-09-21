
import { readJson, pathExists } from "fs-extra"

import write from "./write"
import IConfig from "./interfaces/IConfig"

/**
 * Reads from the user config file and creates it if not exists.
 * @param configFilePath The path to the user config file.
 *
 * @returns Promise object representing the user configuration object.
 */
const read = async (configFilePath: string) => {
  if (!(await pathExists(configFilePath))) {
    await write(configFilePath, {})
  }

  const configContent = await readJson(configFilePath) as IConfig

  return configContent
}

export default read
