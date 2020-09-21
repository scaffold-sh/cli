/**
 * Represents the AWS S3 backend environment variables.
 * @property scaffold_aws_s3_backend_key The S3 bucket key under which the Terraform state will be saved.
 * @property scaffold_aws_s3_backend_bucket The AWS S3 bucket that will contain the Terraform state of the infrastructure.
 * @property scaffold_aws_s3_backend_dynamodb_table The AWS DynamoDB table that will be used to store the Terraform state locks.
 */
interface IAWSS3BackendEnvVars {
  scaffold_aws_s3_backend_key: string;
  scaffold_aws_s3_backend_bucket: string;
  scaffold_aws_s3_backend_dynamodb_table: string;
}

export default IAWSS3BackendEnvVars
