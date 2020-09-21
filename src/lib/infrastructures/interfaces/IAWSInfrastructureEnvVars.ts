import IInfrastructureEnvVars from "./IInfrastructureEnvVars"

/**
 * Represents the environment variables shared by all AWS infrastructures.
 * @property scaffold_aws_region The AWS region where infrastructure needs to be created.
 * @property scaffold_aws_profile The AWS named profile used to created infrastructure.
 */
interface IAWSInfrastructureEnvVars extends IInfrastructureEnvVars {
  scaffold_aws_region: string;
  scaffold_aws_profile: string;
}

export default IAWSInfrastructureEnvVars
