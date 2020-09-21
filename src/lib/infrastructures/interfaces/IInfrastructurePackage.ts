import Infrastructures from "../enums/Infrastructures"

/**
 * Represents the parsed "scaffold.json" file.
 * @property name The name of the infrastructure.
 * @property provider The cloud provider of the infrastructure.
 * @property type The unique type used to instantiate infrastructure object.
 * @property version The version of the infrastructure.
 * @property source_url The infrastructure source code url.
 * @property docs_url The infrastructure documentation url.
 */
interface IInfrastructurePackage {
  name: string;
  provider: string;
  type: Infrastructures;
  version: string;
  source_url: string;
  docs_url: string;
}

export default IInfrastructurePackage
