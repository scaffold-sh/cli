/**
 * Represents the environment variables shared by all infrastructures.
 * @property scaffold_resource_names_prefix An unique custom prefix used to avoid name colision with existing resources.
 */
interface IInfrastructureEnvVars {
  scaffold_resource_names_prefix: string;
}

export default IInfrastructureEnvVars
