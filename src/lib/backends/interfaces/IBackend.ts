/**
 * Represents a Terraform backend.
 * @type T The infrastructure environment variables.
 * @type U The specific backend environment variables.
 */
interface IBackend<T, U> {
  /**
   * Creates a new backend.
   * @param envVars The specific backend environment variables.
   *
   * @returns Empty Promise object.
   */
  create(envVars: U): Promise<void>;

  /**
   * Destroy a backend.
   * @param envVars The specific backend environment variables.
   *
   * @returns Empty Promise object.
   */
  destroy(envVars: U): Promise<void>;

  /**
   * Generates specific backend environment
   * variables from infrastructure environment variables.
   * @param envVars The infrastructure environment variables.
   *
   * @returns The specific backed environment variables.
   */
  generateBackendEnvVarsFromInfraEnvVars(envVars: T): U;
}

export default IBackend
