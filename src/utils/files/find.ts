import { join } from "path"
import { glob } from "glob"

/**
 * Find the files matching the passed pattern in the specified directory.
 * @param dirPath The directory to search into.
 * @param pattern The pattern that files must match.
 *
 * @returns Promise object representing the matched files.
 */
const find = async (dirPath: string, pattern: string) => {
  return new Promise<string[]>((resolve, reject) => {
    glob(join(dirPath, pattern), (err, files) => {
      if (err) {
        return reject(err)
      }

      return resolve(files)
    })
  })
}

export default find
