/**
 * Represents the environment files paths for an infrastructure.
 * @property global The path to the ".env" file.
 * @property specific The path to the ".env.{environment}" file.
 * @property local The path to the ".env.{environment}.local" file.
 * @property sandbox The path to the ".env.{environment}.sandbox.local" file.
 */
interface IEnvironmentPaths {
  global: string;
  specific: string;
  local: string;
  sandbox: string;
}

export default IEnvironmentPaths
