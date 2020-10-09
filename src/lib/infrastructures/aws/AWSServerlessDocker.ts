import ObjectID from "bson-objectid"
import { parseDomain, fromUrl, ParseResultListed } from "parse-domain"

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
 * @property container_listen_port The port that needs to be used to send requests to your Docker container.
 * @property domain_names The domain names that need to be covered by the SSL certificate.
 * @property enable_auto_scaling Do auto-scaling needs to be enabled?
 * @property enable_https We need to wait for the ACM certificate to be "issued" to enable HTTPS.
 * @property fargate_tasks_cpu The CPU used by the Fargate tasks.
 * @property fargate_tasks_memory The memory used by the Fargate tasks.
 * @property github_branch The branch from which CodePipeline will deploy.
 * @property github_oauth_token The GitHub Oauth token that will be used by CodePipeline to pull website source code from repository.
 * @property github_repo_owner The owner of the GitHub repository.
 * @property github_repo The GitHub repository that contains the source code.
 * @property github_webhook_token A random token that will be used by CodePipeline and GitHub to prevent impersonation.
 */
interface IAWSServerlessDockerEnvVars extends IAWSInfrastructureEnvVars {
  container_listen_port: string;
  domain_names: string;
  enable_auto_scaling: string;
  enable_https: string;
  fargate_tasks_cpu: string;
  fargate_tasks_memory: string;
  github_branch: string;
  github_oauth_token: string;
  github_repo: string;
  github_repo_owner: string;
  github_webhook_token: string;
  number_of_availability_zones_used: string;
  pre_deploy_command: string;
}

/**
 * Represents the AWS serverless Docker infrastructure.
 */
class AWSServerlessDocker implements IInfrastructure<IAWSServerlessDockerEnvVars> {
  source_url = "https://github.com/scaffold-sh/aws-serverless-docker/archive/master.zip"

  source_container_folder_name = "aws-serverless-docker-master"

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

  async configureEnv(configFilePath: string, defaults: Partial<IAWSServerlessDockerEnvVars>, hasGlobalEnv: boolean) {
    const envVars: Partial<IAWSServerlessDockerEnvVars> = {}

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
        typeof defaults.github_oauth_token !== "undefined" ||
        typeof defaults.container_listen_port !== "undefined") {
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

    if (!hasGlobalEnv || typeof defaults.container_listen_port !== "undefined") {
      
      if (envVars.github_repo && envVars.github_repo_owner) {
        const containerListenPort = await api!(
          `/github/repositories/dockerfile-port?repo=${encodeURIComponent(envVars.github_repo)}&repo_owner=${encodeURIComponent(envVars.github_repo_owner)}`
        ) as {error?: string, port?: string}

        if (containerListenPort.port) {
          envVars.container_listen_port = containerListenPort.port
        }
        
        if (containerListenPort.error === "no_dockerfile_found") {
          throw new Error("Your repository must contain a Dockerfile at the root path.")
        }
      }

      if (!envVars.container_listen_port) {
        envVars.container_listen_port = await dockerContainerListenPort(defaults.container_listen_port)
      }

    }

    if (!hasGlobalEnv || typeof defaults.pre_deploy_command !== "undefined") {
      envVars.pre_deploy_command = await preDeployCommandPrompt(defaults.pre_deploy_command)
    }

    if (!hasGlobalEnv || typeof defaults.enable_auto_scaling !== "undefined") {
      envVars.enable_auto_scaling = "true"
    }

    if (!hasGlobalEnv || typeof defaults.enable_https !== "undefined") {
      envVars.enable_https = "false"
    }

    if (!hasGlobalEnv || typeof defaults.fargate_tasks_cpu !== "undefined") {
      envVars.fargate_tasks_cpu = "256"
    }

    if (!hasGlobalEnv || typeof defaults.fargate_tasks_memory !== "undefined") {
      envVars.fargate_tasks_memory = "512"
    }

    if (!hasGlobalEnv || typeof defaults.number_of_availability_zones_used !== "undefined") {
      envVars.number_of_availability_zones_used = "1"
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
    const values: (keyof IAWSServerlessDockerEnvVars)[] = [
      "github_repo",
      "github_repo_owner",
      "pre_deploy_command",
      "container_listen_port",
    ]

    return values
  }

  specificEnvVars() {
    const values: (keyof IAWSServerlessDockerEnvVars)[] = [
      "github_branch",
      "domain_names",
      "enable_auto_scaling",
      "number_of_availability_zones_used",
      "fargate_tasks_cpu",
      "fargate_tasks_memory",
    ]

    return values
  }

  afterInstallURL() {
    return `${process.env.BASE_URL}/docs/infrastructures/aws/serverless-docker/after-install`
  }
}

export default AWSServerlessDocker
