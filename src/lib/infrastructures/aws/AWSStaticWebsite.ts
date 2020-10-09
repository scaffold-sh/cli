import ObjectID from "bson-objectid"
import { ParseResultListed, fromUrl, parseDomain } from "parse-domain"

import bent from "bent"

import IInfrastructure from "../interfaces/IInfrastructure"
import InfrastructureInstallManager from "../InfrastructureInstallManager"

import generateToken from "../../../utils/security/generateToken"
import domainNamePrompt from "../../prompts/domainNamePrompt"

import githubRepoPrompt from "../../prompts/githubRepoPrompt"
import githubBranchPrompt from "../../prompts/githubBranchPrompt"

import buildCommandPrompt from "../../prompts/buildCommandPrompt"
import awsAccountPrompt from "../../prompts/awsAccountPrompt"

import awsRegionPrompt from "../../prompts/awsRegionPrompt"
import IAWSInfrastructureEnvVars from "../interfaces/IAWSInfrastructureEnvVars"

import users from "../../../lib/users"
import IConfig from "../../config/interfaces/IConfig"

/**
 * Represents the AWS static website infrastructure environement variables.
 * @property BUILD_COMMAND The command that needs to be run to build this website.
 * @property BUILD_OUTPUT_DIR The directory where the build command output this website.
 * @property DOMAIN_NAMES The domain name(s) used for the website.
 * @property ENABLE_HTTPS The ACM certificate needs to be "issued" before enabling HTTPS.
 * @property GITHUB_BRANCH The branch from which this website will be deployed.
 * @property GITHUB_OAUTH_TOKEN The GitHub Oauth token that will be used by CodePipeline to pull website source code from repository.
 * @property GITHUB_REPO The GitHub repository that contains the website source code.
 * @property GITHUB_REPO_OWNER The owner of the GitHub repository.
 * @property GITHUB_WEBHOOK_TOKEN A random token that will be used by CodePipeline and GitHub to prevent impersonation.
 */
interface IAWSStaticWebsiteEnvVars extends IAWSInfrastructureEnvVars {
  BUILD_COMMAND: string;
  BUILD_OUTPUT_DIR: string;
  DOMAIN_NAMES: string;
  ENABLE_HTTPS: string;
  GITHUB_BRANCH: string;
  GITHUB_OAUTH_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_REPO_OWNER: string;
  GITHUB_WEBHOOK_TOKEN: string;
}

/**
 * Represents the AWS static website infrastructure.
 */
class AWSStaticWebsite implements IInfrastructure<IAWSStaticWebsiteEnvVars> {
  sourceContainerFolderName = "aws-static-website-master"

  sourceUrl = "https://github.com/scaffold-sh/aws-static-website/archive/master.zip"

  afterInstallURL() {
    return `${process.env.BASE_URL}/docs/infrastructures/aws/static-website/after-install`
  }

  async configureEnv(configFilePath: string, defaults: Partial<IAWSStaticWebsiteEnvVars>, hasGlobalEnv: boolean) {
    const envVars: Partial<IAWSStaticWebsiteEnvVars> = {}

    envVars.SCAFFOLD_AWS_PROFILE = await awsAccountPrompt(defaults.SCAFFOLD_AWS_PROFILE)
    envVars.SCAFFOLD_AWS_REGION = await awsRegionPrompt(defaults.SCAFFOLD_AWS_REGION)

    if (!hasGlobalEnv || typeof defaults.DOMAIN_NAMES !== "undefined") {
      const rawDomain = await domainNamePrompt(defaults.DOMAIN_NAMES?.split(",")[0])

      const parseResults = parseDomain(fromUrl(rawDomain)) as ParseResultListed
      const { domain, topLevelDomains, subDomains } = parseResults

      let domainNames = ""

      if (subDomains.length === 0 || (subDomains.length === 1 && subDomains[0] === "www")) {
        domainNames = `${domain}.${topLevelDomains.join(".")},www.${domain}.${topLevelDomains.join(".")}`
      } else {
        domainNames = `${subDomains.join(".")}.${domain}.${topLevelDomains.join(".")}`
      }

      envVars.DOMAIN_NAMES = domainNames
    }

    let login: IConfig|null = null
    let api: bent.RequestFunction<bent.ValidResponse>|null = null

    if (!hasGlobalEnv ||
        typeof defaults.GITHUB_REPO !== "undefined" ||
        typeof defaults.GITHUB_REPO_OWNER !== "undefined" ||
        typeof defaults.GITHUB_BRANCH !== "undefined" ||
        typeof defaults.GITHUB_OAUTH_TOKEN !== "undefined") {
      login = await users.login(configFilePath)
      api = users.constructAPI(login!.auth!)
    }

    if (!hasGlobalEnv ||
        typeof defaults.GITHUB_REPO !== "undefined" ||
        typeof defaults.GITHUB_REPO_OWNER !== "undefined" ||
        typeof defaults.GITHUB_BRANCH !== "undefined") {
      const {
        githubRepoOwner,
        githubRepo,
      } = await githubRepoPrompt(
        api!,
        defaults.GITHUB_REPO_OWNER && defaults.GITHUB_REPO ?
          `${defaults.GITHUB_REPO_OWNER}/${defaults.GITHUB_REPO}` :
          undefined
      )

      if (!hasGlobalEnv ||
          typeof defaults.GITHUB_REPO !== "undefined" ||
          typeof defaults.GITHUB_REPO_OWNER !== "undefined") {
        envVars.GITHUB_REPO_OWNER = githubRepoOwner
        envVars.GITHUB_REPO = githubRepo
      }

      if (!hasGlobalEnv || typeof defaults.GITHUB_BRANCH !== "undefined") {
        envVars.GITHUB_BRANCH = await githubBranchPrompt(
          githubRepoOwner,
          githubRepo,
          api!,
          defaults.GITHUB_BRANCH
        )
      }
    }

    if (!hasGlobalEnv ||
        typeof defaults.BUILD_COMMAND !== "undefined") {
      const {
        buildCommand,
        buildOutputDir,
      } = await buildCommandPrompt(defaults.BUILD_COMMAND, defaults.BUILD_OUTPUT_DIR)

      envVars.BUILD_COMMAND = buildCommand
      envVars.BUILD_OUTPUT_DIR = buildOutputDir
    }

    if (!hasGlobalEnv || typeof defaults.ENABLE_HTTPS !== "undefined") {
      envVars.ENABLE_HTTPS = "false"
    }

    if (!hasGlobalEnv || typeof defaults.GITHUB_WEBHOOK_TOKEN !== "undefined") {
      envVars.GITHUB_WEBHOOK_TOKEN = await generateToken()
    }

    if (!hasGlobalEnv || typeof defaults.GITHUB_OAUTH_TOKEN !== "undefined") {
      envVars.GITHUB_OAUTH_TOKEN = login!.auth!.githubOauthToken
    }

    envVars.SCAFFOLD_RESOURCE_NAMES_PREFIX = `scaffold_${(new ObjectID()).toHexString()}`

    return envVars
  }

  globalEnvVars() {
    const values: (keyof IAWSStaticWebsiteEnvVars)[] = [
      "GITHUB_REPO",
      "GITHUB_REPO_OWNER",
      "BUILD_COMMAND",
      "BUILD_OUTPUT_DIR",
    ]

    return values
  }

  async install(inPath: string) {
    const architectureZipPath  = await InfrastructureInstallManager.download(inPath, this.sourceUrl)

    const extractedZipFolderPath = await InfrastructureInstallManager.extractDownloadedZip(
      inPath,
      architectureZipPath,
      this.sourceContainerFolderName
    )

    await InfrastructureInstallManager.cleanDownloadedZip(
      architectureZipPath,
      extractedZipFolderPath
    )
  }

  specificEnvVars() {
    const values: (keyof IAWSStaticWebsiteEnvVars)[] = [
      "GITHUB_BRANCH",
      "DOMAIN_NAMES",
    ]

    return values
  }
}

export default AWSStaticWebsite
