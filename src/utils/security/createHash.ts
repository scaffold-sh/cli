import crypto from "crypto"

/**
 * Creates hashed value of passed string or buffer with passed algorithm.
 * @param algorithm The algorithm to use.
 * @param stringToHash The string or buffer to hash.
 *
 * @returns The hashed value as string.
 */
const createHash = (algorithm: string, stringToHash: string|Buffer) => {
  return crypto
    .createHash(algorithm)
    .update(stringToHash)
    .digest("hex")
}

export default createHash
