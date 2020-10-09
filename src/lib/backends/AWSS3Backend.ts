import AWS from "aws-sdk"

import IBackend from "./interfaces/IBackend"
import IAWSInfrastructureEnvVars from "../infrastructures/interfaces/IAWSInfrastructureEnvVars"

import IAWSS3BackendEnvVars from "./interfaces/IAWSS3BackendEnvVars"

/**
 * Represents the AWS S3 backend.
 * @class
 * @implement IBackend
 */
class AWSS3Backend implements IBackend<IAWSInfrastructureEnvVars, IAWSS3BackendEnvVars> {
  readonly dynamoDB: AWS.DynamoDB

  readonly profile: string

  readonly region: string

  readonly s3: AWS.S3

  /**
   * Creates an AWS S3 backend.
   * @param region The AWS region where backend will be created.
   * @param profile The AWS named profile used to create the backend.
   */
  constructor(region: string, profile: string) {
    this.region = region
    this.profile = profile

    const credentials = new AWS.SharedIniFileCredentials({
      profile: profile,
    })

    AWS.config.credentials = credentials

    this.s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      region: this.region,
    })

    this.dynamoDB = new AWS.DynamoDB({
      apiVersion: "2012-08-10",
      region: this.region,
    })
  }

  async create(backendEnvVars: IAWSS3BackendEnvVars) {
    await this.s3.createBucket({
      Bucket: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_BUCKET,
      // Fix "InvalidLocationConstraint: The specified location-constraint is not valid" error
      // See: https://github.com/boto/boto3/issues/125
      CreateBucketConfiguration: this.region === "us-east-1" ? undefined : {
        LocationConstraint: this.region,
      },
    }).promise()

    try {
      await this.s3.putBucketVersioning({
        Bucket: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_BUCKET,
        VersioningConfiguration: {
          Status: "Enabled",
        },
      }).promise()

      await this.dynamoDB.createTable({
        TableName: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_DYNAMODB_TABLE,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [{
          AttributeName: "LockID",
          AttributeType: "S",
        }],
        KeySchema: [{
          AttributeName: "LockID",
          KeyType: "HASH",
        }],
      }).promise()
    } catch (error) {
      await this.s3.deleteBucket({
        Bucket: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_BUCKET,
      }).promise()

      throw error
    }
  }

  /**
   * Deletes versioned state bucket.
   * @param backendEnvVars The backend env vars.
   *
   * @returns Empty promise object.
   */
  private async deleteStateBucket(backendEnvVars: IAWSS3BackendEnvVars) {
    let versionList = await this.s3.listObjectVersions({
      Bucket: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_BUCKET,
      Prefix: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_KEY,
    }).promise()

    /* eslint-disable no-constant-condition */
    while (true) {
      const versions = versionList.Versions

      if (!versions) {
        break
      }

      const deleteObjectsPromises = []

      for (const version of versions) {
        deleteObjectsPromises.push(this.s3.deleteObject({
          Bucket: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_BUCKET,
          Key: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_KEY,
          VersionId: version.VersionId,
        }).promise())
      }

      /* eslint-disable no-await-in-loop */
      await Promise.all(deleteObjectsPromises)

      if (versionList.IsTruncated) {
        /* eslint-disable no-await-in-loop */
        versionList = await this.s3.listObjectVersions({
          Bucket: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_BUCKET,
          Prefix: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_KEY,
          VersionIdMarker: versions[versions.length - 1].VersionId,
        }).promise()
      } else {
        break
      }
    }

    await this.s3.deleteBucket({
      Bucket: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_BUCKET,
    }).promise()
  }

  async destroy(backendEnvVars: IAWSS3BackendEnvVars) {
    try {
      await this.deleteStateBucket(backendEnvVars)
    } catch (error) {
      if (!["ResourceNotFoundException", "NoSuchBucket"].includes(error.code)) {
        throw error
      }
    }

    try {
      await this.dynamoDB.deleteTable({
        TableName: backendEnvVars.SCAFFOLD_AWS_S3_BACKEND_DYNAMODB_TABLE,
      }).promise()
    } catch (error) {
      if (error.code !== "ResourceNotFoundException") {
        throw error
      }
    }
  }

  generateBackendEnvVarsFromInfraEnvVars(infrastructureEnvVars: IAWSInfrastructureEnvVars) {
    const s3BackendBucket = this.sanitizeS3BucketName(
      `${infrastructureEnvVars.SCAFFOLD_RESOURCE_NAMES_PREFIX}_state`
    )

    const s3BackendDynamoDBTable = `${infrastructureEnvVars.SCAFFOLD_RESOURCE_NAMES_PREFIX}_state_locks`
    const s3BackendKey = "terraform.tfstate"

    const backendVars: IAWSS3BackendEnvVars = {
      SCAFFOLD_AWS_S3_BACKEND_KEY: s3BackendKey,
      SCAFFOLD_AWS_S3_BACKEND_BUCKET: s3BackendBucket,
      SCAFFOLD_AWS_S3_BACKEND_DYNAMODB_TABLE: s3BackendDynamoDBTable,
    }

    return backendVars
  }

  /**
   * Sanitizes the S3 bucket name by replacing invalid characters with "-".
   * @param bucketName The bucket name.
   *
   * @returns The sanitized bucket name.
   */
  private sanitizeS3BucketName(bucketName: string) {
    return bucketName.replace(/[^a-z0-9.-]/gi, "-")
  }
}

export default AWSS3Backend
