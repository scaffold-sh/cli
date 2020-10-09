import { IncomingMessage, Server, ServerResponse, createServer } from "http"
import { AddressInfo } from "net"

import ux from "cli-ux"
import chalk from "chalk"

import open from "open"

import IConfig, { IConfigAuth } from "../config/interfaces/IConfig"
import config from "../config"

/**
 * Represents the decoded payload set in query string during login.
 * @internal
 * @property accessToken The API access token.
 * @property userId The user ID as ObjectID.
 * @property githubOauthToken The GitHub OAuth token.
 */
interface ILoginRequestPayload {
  accessToken?: string;
  githubOauthToken?: string;
  userId?: string;
}

/**
 * Log in user by redirecting him to default browser.
 * @param configFilePath The path to the user config file.
 *
 * @returns Promise object representing the user config.
 */
const login = async (configFilePath: string) => {
  const userConfig = await config.read(configFilePath)

  if (userConfig.auth && userConfig.auth.accessToken && userConfig.auth.userId) {
    return ({
      auth: userConfig.auth,
    }) as IConfig
  }

  const server = await new Promise<Server>(resolve => {
    const s = createServer()
    s.listen(0, () => resolve(s))
  })

  const { port } = server.address() as AddressInfo

  let loggedIn = false
  const loginTimeout = setTimeout(() => {
    if (!loggedIn) {
      ux.action.stop()
      throw new Error("Timed out")
    }
  }, 1000 * 60 * 10)

  /* eslint-disable-next-line no-async-promise-executor */
  const authCreds = await new Promise<IConfigAuth>(async (resolve, reject) => {
    try {
      server.on("request", (request: IncomingMessage, response: ServerResponse) => {
        const throwError = () => {
          response.end("An unknown error occurred. Please try again.")
          return reject(new Error("An unknown error occurred during login. Please try again."))
        }

        const urlParts = new URL(request.url ?? "", "http://localhost").searchParams
        const payload = urlParts.get("payload")

        if (!payload) {
          return throwError()
        }

        let decodedPayload: ILoginRequestPayload

        try {
          decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString("utf8"))
        } catch (error) {
          return throwError()
        }

        const accessToken = decodedPayload.accessToken
        const userId = decodedPayload.userId
        const githubOauthToken = decodedPayload.githubOauthToken

        loggedIn = true

        if (!accessToken || !userId || !githubOauthToken) {
          return throwError()
        }

        response.end("Success! You can close this window and return to the Scaffold CLI.")

        resolve({
          accessToken: accessToken,
          userId: userId,
          githubOauthToken: githubOauthToken,
        })
      })

      const loginURL = `${process.env.BASE_URL}/github/login?port=${port}`

      await ux.anykey(`\nWe need to open up the browser to connect your GitHub account.\nPress any key to proceed or ${chalk.yellow("q")} to exit`)

      ux.warn(`If browser does not open, visit\n${chalk.blueBright(loginURL)}`)

      let urlDisplayed = false

      const showUrl = () => {
        if (!urlDisplayed) {
          ux.warn(`Cannot open browser, visit\n${chalk.blueBright(loginURL)}`)
        }

        urlDisplayed = true
      }

      const cp = await open(loginURL)

      cp.on("error", err => {
        ux.warn(err)

        showUrl()
      })

      cp.on("close", code => {
        if (code !== 0) {
          showUrl()
        }
      })

      ux.action.start("scaffold: Waiting for login")
    } catch (error) {
      reject(error)
    }
  })

  ux.action.start("Logging in")

  server.close()
  clearTimeout(loginTimeout)

  userConfig.auth = {
    userId: authCreds.userId,
    accessToken: authCreds.accessToken,
    githubOauthToken: authCreds.githubOauthToken,
  }

  await config.write(configFilePath, userConfig)

  ux.action.stop()

  return {
    auth: userConfig.auth!,
  } as IConfig
}

export default login
