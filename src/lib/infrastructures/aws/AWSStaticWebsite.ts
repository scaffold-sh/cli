import ObjectID from "bson-objectid"
import { parseDomain, fromUrl, ParseResultListed } from "parse-domain"

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
 * @property domain_names The domain name(s) used for the website.
 * @property enable_https The ACM certificate needs to be "issued" before enabling HTTPS.
 * @property build_command The command that needs to be run to build this website.
 * @property build_output_dir The directory where the build command output this website.
 * @property github_repo_owner The owner of the GitHub repository.
 * @property github_repo The GitHub repository that contains the website source code.
 * @property github_branch The branch from which this website will be deployed.
 * @property github_oauth_token The GitHub Oauth token that will be used by CodePipeline to pull website source code from repository.
 * @property github_webhook_token A random token that will be used by CodePipeline and GitHub to prevent impersonation.
 */
interface IAWSStaticWebsiteEnvVars extends IAWSInfrastructureEnvVars {
  domain_names: string;
  enable_https: string;
  build_command: string;
  build_output_dir: string;
  github_repo_owner: string;
  github_repo: string;
  github_branch: string;
  github_oauth_token: string;
  github_webhook_token: string;
}

/**
 * Represents the AWS static website infrastructure.
 */
class AWSStaticWebsite implements IInfrastructure<IAWSStaticWebsiteEnvVars> {
  source_url = "https://github.com/scaffold-sh/aws-static-website/archive/master.zip"

  source_container_folder_name = "aws-static-website-master"

  async install(inPath: string) {
    const architectureZipPath  = await InfrastructureInstallManager.download(inPath, this.source_url)

    const extractedZipFolderPath = await InfrastructureInstallManager.extractDownloadedZip(
      inPath,
      architectureZipPath,
      this.source_container_folder_name
    )

    await InfrastructureInstallManager.cleanDownloadedZip(
      architectureZipPath,
      extractedZipFolderPath
    )
  }

  async configureEnv(configFilePath: string, defaults: Partial<IAWSStaticWebsiteEnvVars>, hasGlobalEnv: boolean) {
    const envVars: Partial<IAWSStaticWebsiteEnvVars> = {}

    envVars.scaffold_aws_profile = await awsAccountPrompt(defaults.scaffold_aws_profile)
    envVars.scaffold_aws_region = await awsRegionPrompt(defaults.scaffold_aws_region)

    if (!hasGlobalEnv || typeof defaults.domain_names !== "undefined") {
      const rawDomain = await domainNamePrompt(defaults.domain_names?.split(",")[0])

      const parseResults = parseDomain(fromUrl(rawDomain)) as ParseResultListed
      const { domain, topLevelDomains, subDomains } = parseResults

      let domainNames = ""

      if (subDomains.length === 0 || (subDomains.length === 1 && subDomains[0] === "www")) {
        domainNames = `${domain}.${topLevelDomains.join(".")},www.${domain}.${topLevelDomains.join(".")}`
      } else {
        domainNames = `${subDomains.join(".")}.${domain}.${topLevelDomains.join(".")}`
      }

      envVars.domain_names = domainNames
    }

    let login: IConfig|null = null
    let api: bent.RequestFunction<bent.ValidResponse>|null = null

    if (!hasGlobalEnv ||
        typeof defaults.github_repo !== "undefined" ||
        typeof defaults.github_repo_owner !== "undefined" ||
        typeof defaults.github_branch !== "undefined" ||
        typeof defaults.github_oauth_token !== "undefined") {
      login = await users.login(configFilePath)
      api = users.constructAPI(login!.auth!)
    }

    if (!hasGlobalEnv ||
        typeof defaults.github_repo !== "undefined" ||
        typeof defaults.github_repo_owner !== "undefined" ||
        typeof defaults.github_branch !== "undefined") {
      const {
        github_repo_owner: githubRepoOwner,
        github_repo: githubRepo,
      } = await githubRepoPrompt(
        api!,
        defaults.github_repo_owner && defaults.github_repo ?
          `${defaults.github_repo_owner}/${defaults.github_repo}` :
          undefined
      )

      if (!hasGlobalEnv ||
          typeof defaults.github_repo !== "undefined" ||
          typeof defaults.github_repo_owner !== "undefined") {
        envVars.github_repo_owner = githubRepoOwner
        envVars.github_repo = githubRepo
      }

      if (!hasGlobalEnv || typeof defaults.github_branch !== "undefined") {
        envVars.github_branch = await githubBranchPrompt(
          githubRepoOwner,
          githubRepo,
          api!,
          defaults.github_branch
        )
      }
    }

    if (!hasGlobalEnv ||
        typeof defaults.build_command !== "undefined") {
      const {
        build_command: buildCommand,
        build_output_dir: buildOutputDir,
      } = await buildCommandPrompt(defaults.build_command, defaults.build_output_dir)

      envVars.build_command = buildCommand
      envVars.build_output_dir = buildOutputDir
    }

    if (!hasGlobalEnv || typeof defaults.enable_https !== "undefined") {
      envVars.enable_https = "false"
    }

    if (!hasGlobalEnv || typeof defaults.github_webhook_token !== "undefined") {
      envVars.github_webhook_token = await generateToken()
    }

    if (!hasGlobalEnv || typeof defaults.github_oauth_token !== "undefined") {
      envVars.github_oauth_token = login!.auth!.github_oauth_token
    }

    envVars.scaffold_resource_names_prefix = `scaffold_${(new ObjectID()).toHexString()}`

    return envVars
  }

  globalEnvVars() {
    const values: (keyof IAWSStaticWebsiteEnvVars)[] = [
      "github_repo",
      "github_repo_owner",
      "build_command",
      "build_output_dir",
    ]

    return values
  }

  specificEnvVars() {
    const values: (keyof IAWSStaticWebsiteEnvVars)[] = [
      "github_branch",
      "domain_names",
    ]

    return values
  }

  afterInstallURL() {
    return `${process.env.BASE_URL}/docs/infrastructures/aws/static-website/after-install`
  }
}

export default AWSStaticWebsite
