import chalk from "chalk"
import inquirer from "inquirer"

import { parseDomain, fromUrl, ParseResultListed } from "parse-domain"
import ux from "cli-ux"

/**
 * Asks for a domain name.
 * @param defaultDomainName The domain name to use as default value.
 *
 * @returns A promise object representing the domain name.
 */
const domainNamePrompt = async (defaultDomainName?: string) => {
  ux.log(chalk.bold("\n› Set your domain name"))
  ux.log(chalk.hex("#bbb")("  On which domain (or subdomain) should your application be accessible?"))

  const { domain } = await inquirer.prompt<{domain: string}>([{
    name: "domain",
    message: "Domain name:",
    type: "input",
    default: defaultDomainName || undefined,
    validate: (rawDomain: string) => {
      const parseResults = parseDomain(fromUrl(rawDomain))
      const invalidDomainErr = "Invalid domain name"

      if (parseResults.type !== "LISTED") {
        return invalidDomainErr
      }

      const { domain, topLevelDomains, subDomains } = parseResults as ParseResultListed

      if (topLevelDomains.length === 0 || !domain) {
        return invalidDomainErr
      }

      let domainName = ""

      if (subDomains.length === 0) {
        domainName = `${domain}.${topLevelDomains.join(".")}`
      } else {
        domainName = `${subDomains.join(".")}.${domain}.${topLevelDomains.join(".")}`
      }

      if (!domainName.match(/^(\*\.)?(((?!-)[A-Za-z0-9-]{0,62}[A-Za-z0-9])\.)+((?!-)[A-Za-z0-9-]{1,62}[A-Za-z0-9])$/)) {
        return invalidDomainErr
      }

      return true
    },
  }])

  return domain
}

export default domainNamePrompt
