/**
 * Represents supported infrastructures type.
 * Used in "scaffold.json" to instantiate corresponding infrastructure.
 * @property AWS_STATIC_WEBSITE The AWS static website infrastructure.
 * @property AWS_SERVERLESS_DOCKER The AWS serverless docker infrastructure.
 */
enum Infrastructures {
  AWS_STATIC_WEBSITE = "aws_static_website",
  AWS_SERVERLESS_DOCKER = "aws_serverless_docker",
}

export default Infrastructures
