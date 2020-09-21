/**
 * Represents the parsed "cdktf.json" file.
 * @property language The language used for infrastructure code.
 * @property app The command used to generate Terraform code.
 * @property terraformProviders The Terraform providers required by infrastructure code.
 * @property codeMakerOutput The path to the downloaded Terraform providers code.
 * @property output The path to the generated Terraform code.
 */
interface ICDKTFPackage {
  language: string;
  app: string;
  terraformProviders: string[];
  codeMakerOutput?: string;
  output?: string;
}

export default ICDKTFPackage
