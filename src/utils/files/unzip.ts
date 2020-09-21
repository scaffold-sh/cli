import * as yauzl from "yauzl"
import { outputFile } from "fs-extra"

import { join } from "path"

/**
 * Unzips a specified file.
 * @param zipPath The path to the target zip file.
 * @param destPath The path for the unzipped files.
 *
 * @returns Empty Promise object.
 */
const unzip = (zipPath: string, destPath: string) => {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, {
      lazyEntries: true,
    }, (err, zipfile) => {
      if (err) {
        return reject(err)
      }

      zipfile!.readEntry()

      zipfile!.on("end", resolve)

      zipfile!.on("entry", (entry: yauzl.Entry) => {
        if (/\/$/.test(entry.fileName)) {
          // directory
          zipfile!.readEntry()
        } else {
          // file
          zipfile!.openReadStream(entry, (err, readStream) => {
            if (err) {
              return reject(err)
            }

            const buffers: Buffer[] = []

            readStream!.on("end", async () => {
              const content = Buffer.concat(buffers)

              try {
                await outputFile(join(destPath, entry.fileName), content)
              } catch (error) {
                reject(error)
              }

              zipfile!.readEntry()
            })

            readStream!.on("error", reject)

            readStream!.on("data", data => buffers.push(data))
          })
        }
      })
    })
  })
}

export default unzip
