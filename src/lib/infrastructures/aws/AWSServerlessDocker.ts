import ObjectID from "bson-objectid"
import { ParseResultListed, fromUrl, parseDomain } from "parse-domain"

import bent from "bent"

import IInfrastructure from "../interfaces/IInfrastructure"
import InfrastructureInstallManager from "../InfrastructureInstallManager"

import generateToken from "../../../utils/security/generateToken"
import domainNamePrompt from "../../prompts/domainNamePrompt"

import githubRepoPrompt from "../../prompts/githubRepoPrompt"
import githubBranchPrompt from "../../prompts/githubBranchPrompt"

import awsAccountPrompt from "../../prompts/awsAccountPrompt"
import preDeployCommandPrompt from "../../prompts/preDeployCommandPrompt"

import awsRegionPrompt from "../../prompts/awsRegionPrompt"
import IAWSInfrastructureEnvVars from "../interfaces/IAWSInfrastructureEnvVars"

import users from "../../../lib/users"
import IConfig from "../../config/interfaces/IConfig"

import dockerContainerListenPort from "../../prompts/dockerContainerListenPort"

/**
 * Represents the AWS serverless Docker infrastructure environement variables.
 * @property CONTAINER_LISTEN_PORT The port that needs to be used to send requests to your Docker container.
 * @property DOMAIN_NAMES The domain names that need to be covered by the SSL certificate.
 * @property ENABLE_AUTO_SCALING Do auto-scaling needs to be enabled?
 * @property ENABLE_HTTPS We need to wait for the ACM certificate to be "issued" to enable HTTPS.
 * @property FARGATE_TASKS_CPU The CPU used by the Fargate tasks.
 * @property FARGATE_TASKS_MEMORY The memory used by the Fargate tasks.
 * @property GITHUB_BRANCH The branch from which CodePipeline will deploy.
 * @property GITHUB_OAUTH_TOKEN The GitHub OAuth token that will be used by CodePipeline to pull website source code from repository.
 * @property GITHUB_REPO The GitHub repository that contains the source code.
 * @property GITHUB_REPO_OWNER The owner of the GitHub repository.
 * @property GITHUB_WEBHOOK_TOKEN A random token that will be used by CodePipeline and GitHub to prevent impersonation.
 * @property NUMBER_OF_AVAILABILITY_ZONES_USED The number of availability zones used by your infrastructure.
 * @property PRE_DEPLOY_COMMAND A command that will run in a newly created production container, just before deployment.
 */
interface IAWSServerlessDockerEnvVars extends IAWSInfrastructureEnvVars {
  CONTAINER_LISTEN_PORT: string;
  DOMAIN_NAMES: string;
  ENABLE_AUTO_SCALING: string;
  ENABLE_HTTPS: string;
  FARGATE_TASKS_CPU: string;
  FARGATE_TASKS_MEMORY: string;
  GITHUB_BRANCH: string;
  GITHUB_OAUTH_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_REPO_OWNER: string;
  GITHUB_WEBHOOK_TOKEN: string;
  NUMBER_OF_AVAILABILITY_ZONES_USED: string;
  PRE_DEPLOY_COMMAND: string;
}

/**
 * Represents the AWS serverless Docker infrastructure.
 */
class AWSServerlessDocker implements IInfrastructure<IAWSServerlessDockerEnvVars> {
  sourceContainerFolderName = "aws-serverless-docker-master"

  sourceUrl = "https://github.com/scaffold-sh/aws-serverless-docker/archive/master.zip"

  afterInstallURL() {
    return `${process.env.BASE_URL}/docs/infrastructures/aws/serverless-docker/after-install`
  }

  async configureEnv(configFilePath: string, defaults: Partial<IAWSServerlessDockerEnvVars>, hasGlobalEnv: boolean) {
    const envVars: Partial<IAWSServerlessDockerEnvVars> = {}

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
        typeof defaults.GITHUB_OAUTH_TOKEN !== "undefined" ||
        typeof defaults.CONTAINER_LISTEN_PORT !== "undefined") {
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

    if (!hasGlobalEnv || typeof defaults.CONTAINER_LISTEN_PORT !== "undefined") {
      if (envVars.GITHUB_REPO && envVars.GITHUB_REPO_OWNER) {
        const containerListenPort = await api!(
          `/github/repositories/dockerfile-port?repo=${encodeURIComponent(envVars.GITHUB_REPO)}&repo_owner=${encodeURIComponent(envVars.GITHUB_REPO_OWNER)}`
        ) as {error?: string; port?: string}

        if (containerListenPort.port) {
          envVars.CONTAINER_LISTEN_PORT = containerListenPort.port
        }

        if (containerListenPort.error === "no_dockerfile_found") {
          throw new Error("Your repository must contain a Dockerfile at the root path.")
        }
      }

      if (!envVars.CONTAINER_LISTEN_PORT) {
        envVars.CONTAINER_LISTEN_PORT = await dockerContainerListenPort(defaults.CONTAINER_LISTEN_PORT)
      }
    }

    if (!hasGlobalEnv || typeof defaults.PRE_DEPLOY_COMMAND !== "undefined") {
      envVars.PRE_DEPLOY_COMMAND = await preDeployCommandPrompt(defaults.PRE_DEPLOY_COMMAND)
    }

    if (!hasGlobalEnv || typeof defaults.ENABLE_AUTO_SCALING !== "undefined") {
      envVars.ENABLE_AUTO_SCALING = "true"
    }

    if (!hasGlobalEnv || typeof defaults.ENABLE_HTTPS !== "undefined") {
      envVars.ENABLE_HTTPS = "false"
    }

    if (!hasGlobalEnv || typeof defaults.FARGATE_TASKS_CPU !== "undefined") {
      envVars.FARGATE_TASKS_CPU = "256"
    }

    if (!hasGlobalEnv || typeof defaults.FARGATE_TASKS_MEMORY !== "undefined") {
      envVars.FARGATE_TASKS_MEMORY = "512"
    }

    if (!hasGlobalEnv || typeof defaults.NUMBER_OF_AVAILABILITY_ZONES_USED !== "undefined") {
      envVars.NUMBER_OF_AVAILABILITY_ZONES_USED = "1"
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
    const values: (keyof IAWSServerlessDockerEnvVars)[] = [
      "GITHUB_REPO",
      "GITHUB_REPO_OWNER",
      "PRE_DEPLOY_COMMAND",
      "CONTAINER_LISTEN_PORT",
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
    const values: (keyof IAWSServerlessDockerEnvVars)[] = [
      "GITHUB_BRANCH",
      "DOMAIN_NAMES",
      "ENABLE_AUTO_SCALING",
      "NUMBER_OF_AVAILABILITY_ZONES_USED",
      "FARGATE_TASKS_CPU",
      "FARGATE_TASKS_MEMORY",
    ]

    return values
  }
}

export default AWSServerlessDocker
