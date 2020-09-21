import Infrastructures from "./enums/Infrastructures"
import IInfrastructure from "./interfaces/IInfrastructure"

import AWSStaticWebsite from "./aws/AWSStaticWebsite"

/**
 * Manage infrastructures instantiations.
 */
class InfrastructureFactory {
  /**
   * Instantiate an infrastructure from passed type.
   * @param type The infrastructure type.
   *
   * @returns The instantiated infrastructure or "null" if not found.
   */
  static infrastructure(type: Infrastructures): IInfrastructure<any>|null {
    if (type === Infrastructures.AWS_STATIC_WEBSITE) {
      return new AWSStaticWebsite()
    }

    return null
  }
}

export default InfrastructureFactory
