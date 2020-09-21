import { https } from "follow-redirects"

/**
 * Downloads a file from an URL.
 * @param url The URL to download from.
 *
 * @returns Promise object representing the file content.
 */
const downloadFileFromURL = async (url: string) => {
  return new Promise<Buffer>((resolve, reject) => {
    https.get(url, res => {
      const rawData: Buffer[] = []

      res
        .on("data", chunk => rawData.push(chunk))
        .on("end", () => resolve(Buffer.concat(rawData)))
        .on("error", reject)
    }).on("error", reject)
  })
}

export default downloadFileFromURL
