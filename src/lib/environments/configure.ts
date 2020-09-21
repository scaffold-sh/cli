import inquirer from "inquirer"
import ux from "cli-ux"

import chalk from "chalk"
import execa from "execa"

import { outputFile, pathExists } from "fs-extra"
import dotenv from "dotenv-flow"

import { basename } from "path"

import findAll from "./findAll"
import IInfrastructure from "../infrastructures/interfaces/IInfrastructure"

import IAWSInfrastructureEnvVars from "../infrastructures/interfaces/IAWSInfrastructureEnvVars"
import AWSS3Backend from "../backends/AWSS3Backend"

import getPaths from "./getPaths"
import IAWSS3BackendEnvVars from "../backends/interfaces/IAWSS3BackendEnvVars"

import getNodeEnv from "./getNodeEnv"

/**
 * Configures an environment by asking required values from user.
 * @param environment The environment to configure.
 * @param isSandbox Do this environment is a sandbox?
 * @param infrastructure The current infrastructure.
 * @param infrastructurePath The path to the infrastructure.
 * @param configFilePath The config file path.
 * @param cdktfPath The path to the CDKTF binary.
 * @param terraformBinaryPath The path to the Terraform binary.
 * @param terraformPlanPath The path to the Terraform plan.
 *
 * @returns Promise object representing the environment configured.
 */
const configure = async (
  environment: string,
  isSandbox: boolean,
  infrastructure: IInfrastructure,
  infrastructurePath: string,
  configFilePath: string,
  cdktfPath: string,
  terraformBinaryPath: string,
  terraformPlanPath: string
) => {
  const environments = await findAll(infrastructurePath)

  if (environments.configured.includes(environment) && !isSandbox) {
    throw new Error("Environment already configured")
  }

  if (environments.sandboxed.includes(environment) && isSandbox) {
    throw new Error("Environment already sandboxed")
  }

  if (!environments.all.includes(environment) && isSandbox) {
    throw new Error("Environment doesn't exist")
  }

  if (isSandbox) {
    ux.log(`\nConfiguring a sandbox for ${chalk.cyan.bold(environment)} environment:`)
  } else {
    ux.log(`\nConfiguring ${chalk.cyan.bold(environment)}:`)
  }

  const {
    global: globalEnvPath,
    specific: specificEnvPath,
    local: localEnvPath,
    sandbox: sandboxEnvPath,
  } = getPaths(infrastructurePath, environment)

  let uppercasedDefaultEnvVars: {[key: string]: string} = {}

  const hasGlobalEnv = await pathExists(globalEnvPath)
  const hasSpecificEnv = environments.all.includes(environment)

  if (hasGlobalEnv) {
    uppercasedDefaultEnvVars = Object.assign(uppercasedDefaultEnvVars, dotenv.parse(globalEnvPath))
  }

  if (hasSpecificEnv) {
    uppercasedDefaultEnvVars = Object.assign(uppercasedDefaultEnvVars, dotenv.parse(specificEnvPath))
  }

  const defaultEnvVars: {[key: string]: string} = {}

  Object.keys(uppercasedDefaultEnvVars).forEach(uppercasedKey => {
    defaultEnvVars[uppercasedKey.toLowerCase()] = uppercasedDefaultEnvVars[uppercasedKey]
  })

  let infrastructureEnvVars = await infrastructure.configureEnv(
    configFilePath,
    defaultEnvVars,
    hasGlobalEnv
  ) as IAWSInfrastructureEnvVars

  // Backend doesn't need to be created when user
  // configure a live environment.
  const createBackend = !hasSpecificEnv || isSandbox

  const s3Backend = new AWSS3Backend(
    infrastructureEnvVars.scaffold_aws_region,
    infrastructureEnvVars.scaffold_aws_profile
  )

  let backendEnvVars: IAWSS3BackendEnvVars|null = null

  if (createBackend) {
    backendEnvVars = s3Backend.generateBackendEnvVarsFromInfraEnvVars(infrastructureEnvVars)

    infrastructureEnvVars = Object.assign(infrastructureEnvVars, backendEnvVars)
  }

  const additionalEnvVarsQuestions: inquirer.InputQuestion[] = []

  Object.keys(defaultEnvVars).forEach(envVarName => {
    if (!(envVarName in infrastructureEnvVars)) {
      additionalEnvVarsQuestions.push({
        type: "input",
        name: envVarName,
        message: `${envVarName.toUpperCase()}:`,
        default: defaultEnvVars[envVarName] || undefined,
      })
    }
  })

  let additionalEnvVars: {[key: string]: string} = {}

  if (additionalEnvVarsQuestions.length > 0) {
    ux.log("\nAdditional environment variables:\n")
    additionalEnvVars = await inquirer.prompt<{[key: string]: string}>(additionalEnvVarsQuestions)
  }

  ux.log("")
  ux.action.start("Configuring your " + (isSandbox ? "sandbox" : "environment"))

  await execa("npm", ["install"], {
    cwd: infrastructurePath,
  })

  await execa(cdktfPath, ["get"], {
    cwd: infrastructurePath,
  })

  if (createBackend) {
    await s3Backend.create(backendEnvVars as IAWSS3BackendEnvVars)
  }

  const allEnvVars = Object.assign(additionalEnvVars, infrastructureEnvVars)

  if (!hasGlobalEnv) {
    let globalEnvVarsAsString = ""

    Object.keys(allEnvVars).forEach(envVarName => {
      const infrastructureGlobalEnvVars = infrastructure.globalEnvVars() as string[]
      let value = ""

      if (infrastructureGlobalEnvVars.includes(envVarName)) {
        value = allEnvVars[envVarName]
      }

      globalEnvVarsAsString += `${envVarName.toUpperCase()}=${value}\n`
    })

    await outputFile(globalEnvPath, globalEnvVarsAsString.trim())
  }

  if (!hasSpecificEnv) {
    let specificEnvVarsAsString = ""

    Object.keys(allEnvVars).forEach(envVarName => {
      const infrastructureSpecificEnvVars = infrastructure.specificEnvVars() as string[]

      if (infrastructureSpecificEnvVars.includes(envVarName) || Object.keys(backendEnvVars!).includes(envVarName)) {
        specificEnvVarsAsString += `${envVarName.toUpperCase()}=${allEnvVars[envVarName]}\n`
      }
    })

    await outputFile(specificEnvPath, specificEnvVarsAsString.trim())
  }

  let localEnvVarsAsString = ""

  Object.keys(allEnvVars).forEach(envVarName => {
    localEnvVarsAsString += `${envVarName.toUpperCase()}=${allEnvVars[envVarName]}\n`
  })

  localEnvVarsAsString = localEnvVarsAsString.trim()

  await outputFile(isSandbox ? sandboxEnvPath : localEnvPath, localEnvVarsAsString)

  await execa(cdktfPath, ["synth"], {
    cwd: infrastructurePath,
    env: {
      NODE_ENV: getNodeEnv(environment, isSandbox),
    },
  })

  await execa(terraformBinaryPath, ["init", "-reconfigure"], {
    cwd: terraformPlanPath,
  })

  ux.action.stop()

  ux.log("")

  if (!hasGlobalEnv) {
    ux.log(`${chalk.green("Created")} ${chalk.bold(basename(globalEnvPath))}`)
  }

  if (!hasSpecificEnv) {
    ux.log(`${chalk.green("Created")} ${chalk.bold(basename(specificEnvPath))}`)
  }

  ux.log(`${chalk.green("Created")} ${chalk.bold(basename(isSandbox ? sandboxEnvPath : localEnvPath))}`)

  if (createBackend) {
    ux.log(`\n${chalk.green("Created")} AWS S3 Backend`)
    ux.log(`\n  S3 bucket:      ${chalk.bold(backendEnvVars!.scaffold_aws_s3_backend_bucket)}`)
    ux.log(`  DynamoDB table: ${chalk.bold(backendEnvVars!.scaffold_aws_s3_backend_dynamodb_table)}`)
  }

  if (isSandbox) {
    ux.log(`\n${chalk.bold.green("Success!")} Configured sandbox for "${chalk.bold(environment)}" environment at ${chalk.bold(infrastructurePath)}`)
  } else {
    ux.log(`\n${chalk.bold.green("Success!")} Configured "${chalk.bold(environment)}" environment at ${chalk.bold(infrastructurePath)}`)
  }

  ux.log("\nYou can now review the generated code or create this infrastructure by running:")

  if (isSandbox) {
    ux.log(`\n  ${chalk.bold.cyan("scaffold")} apply ${environment} --sandbox`)
  } else {
    ux.log(`\n  ${chalk.bold.cyan("scaffold")} apply ${environment}`)
  }

  return environment
}

export default configure
