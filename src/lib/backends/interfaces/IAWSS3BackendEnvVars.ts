/**
 * Represents the AWS S3 backend environment variables.
 * @property SCAFFOLD_AWS_S3_BACKEND_BUCKET The AWS S3 bucket that will contain the Terraform state of the infrastructure.
 * @property SCAFFOLD_AWS_S3_BACKEND_DYNAMODB_TABLE The AWS DynamoDB table that will be used to store the Terraform state locks.
 * @property SCAFFOLD_AWS_S3_BACKEND_KEY The S3 bucket key under which the Terraform state will be saved.
 */
interface IAWSS3BackendEnvVars {
  SCAFFOLD_AWS_S3_BACKEND_BUCKET: string;
  SCAFFOLD_AWS_S3_BACKEND_DYNAMODB_TABLE: string;
  SCAFFOLD_AWS_S3_BACKEND_KEY: string;
}

export default IAWSS3BackendEnvVars
