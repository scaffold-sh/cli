/**
 * Represents the environment variables shared by all infrastructures.
 * @property SCAFFOLD_RESOURCE_NAMES_PREFIX An unique custom prefix used to avoid name colision with existing resources.
 */
interface IInfrastructureEnvVars {
  SCAFFOLD_RESOURCE_NAMES_PREFIX: string;
}

export default IInfrastructureEnvVars
