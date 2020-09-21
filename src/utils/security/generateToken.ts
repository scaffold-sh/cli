import crypto from "crypto"

import createHash from "./createHash"

/**
 * Generates random SHA1 token.
 *
 * @returns Promise object representing the generated token.
 */
const generateToken = () => {
  return new Promise<string>((resolve, reject) => {
    crypto.randomBytes(256, (err, randomBytesBuffer) => {
      if (err) {
        return reject(err)
      }

      resolve(createHash("sha1", randomBytesBuffer))
    })
  })
}

export default generateToken
