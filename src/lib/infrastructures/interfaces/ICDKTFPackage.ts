/**
 * Represents the parsed "cdktf.json" file.
 * @property app The command used to generate Terraform code.
 * @property codeMakerOutput The path to the downloaded Terraform providers code.
 * @property language The language used for infrastructure code.
 * @property output The path to the generated Terraform code.
 * @property terraformProviders The Terraform providers required by infrastructure code.
 */
interface ICDKTFPackage {
  app: string;
  codeMakerOutput?: string;
  language: string;
  output?: string;
  terraformProviders: string[];
}

export default ICDKTFPackage
