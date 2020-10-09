/**
 * Represents all the environments for an infrastructure.
 * @property all All the environments (i.e. .env.{environment} files).
 * @property configured The configured environments (i.e. with .env.{environment}.local files).
 * @property sandboxed The environments with sandboxes (i.e. with .env.{environment}.sandbox.local files).
 * @property unconfigured The unconfigured environments (i.e. without .env.{environment}.local files).
 */
interface IEnvironments {
  all: string[];
  configured: string[];
  sandboxed: string[];
  unconfigured: string[];
}

export default IEnvironments
