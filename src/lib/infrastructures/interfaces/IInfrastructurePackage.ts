import Infrastructures from "../enums/Infrastructures"

/**
 * Represents the parsed "scaffold.json" file.
 * @property docsUrl The infrastructure documentation url.
 * @property name The name of the infrastructure.
 * @property provider The cloud provider of the infrastructure.
 * @property sourceUrl The infrastructure source code url.
 * @property type The unique type used to instantiate infrastructure object.
 * @property version The version of the infrastructure.
 */
interface IInfrastructurePackage {
  docsUrl: string;
  name: string;
  provider: string;
  sourceUrl: string;
  type: Infrastructures;
  version: string;
}

export default IInfrastructurePackage
