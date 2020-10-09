/**
 * Represents the environment files paths for an infrastructure.
 * @property global The path to the ".env" file.
 * @property local The path to the ".env.{environment}.local" file.
 * @property sandbox The path to the ".env.{environment}.sandbox.local" file.
 * @property specific The path to the ".env.{environment}" file.
 */
interface IEnvironmentPaths {
  global: string;
  local: string;
  sandbox: string;
  specific: string;
}

export default IEnvironmentPaths
