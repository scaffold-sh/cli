
import { outputJson } from "fs-extra"

import IConfig from "./interfaces/IConfig"

/**
 * Writes to the user config file.
 * @param configFilePath The path to the user config file.
 * @param data The data to write.
 *
 * @returns Empty Promise object.
 */
const write = async (configFilePath: string, data: IConfig) => {
  await outputJson(configFilePath, data)
}

export default write
