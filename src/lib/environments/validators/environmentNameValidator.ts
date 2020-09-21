import findAll from "../findAll"

/**
 * Validates an environment name.
 * @param infrastructurePath The path to the infrastructure.
 * @param environmentName The environment name to validate.
 *
 * @returns A string containing the error message if invalid. "true" otherwise.
 */
const environmentNameValidator = async (infrastructurePath: string, environmentName: string) => {
  const environments = await findAll(infrastructurePath)

  if (environments.all.includes(environmentName)) {
    return "Environment already exists"
  }

  if (!environmentName.match(/^[-a-z0-9_]+$/g)) {
    return "Environment name must match [-a-z0-9_] format."
  }

  return true
}

export default environmentNameValidator
