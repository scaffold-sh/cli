import IInfrastructureEnvVars from "./IInfrastructureEnvVars"

/**
 * Represents the environment variables shared by all AWS infrastructures.
 * @property SCAFFOLD_AWS_PROFILE The AWS named profile used to created infrastructure.
 * @property SCAFFOLD_AWS_REGION The AWS region where infrastructure needs to be created.
 */
interface IAWSInfrastructureEnvVars extends IInfrastructureEnvVars {
  SCAFFOLD_AWS_PROFILE: string;
  SCAFFOLD_AWS_REGION: string;
}

export default IAWSInfrastructureEnvVars
