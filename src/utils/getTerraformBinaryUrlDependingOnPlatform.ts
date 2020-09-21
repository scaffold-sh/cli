/**
 * The Terraform releases base URI that will
 * prepend Terraform binary URL.
 * @internal
 */
const TERRAFORM_RELEASES_BASE_URI = "https://releases.hashicorp.com/terraform/0.13.0/terraform_0.13.0_"

/**
 * The Terraform binary zip files
 * depending on architecture and platform.
 * @internal
 * @property DARWIN The zip file for the Darwin x64 platform.
 * @property FREEBSD_32 The zip file for the FREEBSD x32 platform.
 * @property FREEBSD_64 The zip file for the FREEBSD x64 platform.
 * @property FREEBSD_ARM The zip file for the FREEBSD ARM platform.
 * @property LINUX_32 The zip file for the LINUX x32 platform.
 * @property LINUX_64 The zip file for the LINUX x64 platform.
 * @property LINUX_ARM The zip file for the LINUX ARM platform.
 * @property OPENBSD_32 The zip file for the OPENBSD x32 platform.
 * @property OPENBSD_64 The zip file for the OPENBSD x64 platform.
 * @property SOLARIS The zip file for the SOLARIS x64 platform.
 * @property WINDOWS_32 The zip file for the WINDOWS x32 platform.
 * @property WINDOWS_64 The zip file for the WINDOWS x64 platform.
 */
const TERRAFORM_BINARY_ZIP_FILES: any = {
  DARWIN: "darwin_amd64.zip",
  FREEBSD_32: "freebsd_386.zip",
  FREEBSD_64: "freebsd_amd64.zip",
  FREEBSD_ARM: "freebsd_arm.zip",
  LINUX_32: "linux_386.zip",
  LINUX_64: "linux_amd64.zip",
  LINUX_ARM: "linux_arm.zip",
  OPENBSD_32: "openbsd_386.zip",
  OPENBSD_64: "openbsd_amd64.zip",
  SOLARIS: "solaris_amd64.zip",
  WINDOWS_32: "windows_386.zip",
  WINDOWS_64: "windows_amd64.zip",
}

/**
 * The Terraform binary zip files possible suffixes.
 * @internal
 */
type TerraformBinaryZipFileKeySuffix = "_32"|"_64"|"_ARM"

/**
 * Gets Terraform binary zip file key suffix depending on current execution architecture.
 * @internal
 * @param architecture The execution architecture.
 *
 * @returns The Terraform binary zip file key suffix or "null" if unsupported architecture.
 */
const getTerraformBinaryZipFileKeySuffix = (architecture: string) => {
  let terraformBinaryZipFileKeySuffix: null|TerraformBinaryZipFileKeySuffix = null

  if (["x32", "ia32"].includes(architecture)) {
    terraformBinaryZipFileKeySuffix = "_32"
  }

  if (architecture === "x64") {
    terraformBinaryZipFileKeySuffix = "_64"
  }

  if (["arm", "arm64"].includes(architecture)) {
    terraformBinaryZipFileKeySuffix = "_ARM"
  }

  return terraformBinaryZipFileKeySuffix
}

/**
 * Gets Terraform binary zip file key depending on current execution platform and architecture.
 * @internal
 * @param platform The execution platform.
 * @param architecture The execution architecture.
 * @param terraformBinaryZipFileKeySuffix The Terraform binary zip file key suffix.
 *
 * @returns The Terraform binary zip file key or "null" if unsupported platform.
 */
const getTerraformBinaryZipFileKey = (platform: string, architecture: string, terraformBinaryZipFileKeySuffix: TerraformBinaryZipFileKeySuffix) => {
  let terraformBinaryZipFileKey: null|string = null

  switch (platform) {
    case "linux":
      terraformBinaryZipFileKey = "LINUX" + terraformBinaryZipFileKeySuffix
      break
    case "darwin":
      if (architecture === "x64") {
        terraformBinaryZipFileKey = "DARWIN"
      }
      break
    case "freebsd":
      terraformBinaryZipFileKey = "FREEBSD" + terraformBinaryZipFileKeySuffix
      break
    case "openbsd":
      terraformBinaryZipFileKey = "OPENBSD" + terraformBinaryZipFileKeySuffix
      break
    case "sunos":
      if (architecture === "x64") {
        terraformBinaryZipFileKey = "SOLARIS"
      }
      break
    case "win32":
      terraformBinaryZipFileKey = "WINDOWS" + terraformBinaryZipFileKeySuffix
  }

  return terraformBinaryZipFileKey
}

/**
 * Gets Terraform binary URL depending on platform and architecture.
 * @param platform The execution platform.
 * @param architecture The execution architecture.
 *
 * @returns The Terraform binary URL.
 *
 * @throws Will throw an error if the platform or architecture is unsupported.
 */
const getTerraformBinaryURLDependingOnPlatform = (platform: string, architecture: string) => {
  const terraformBinaryZipFileKeySuffix = getTerraformBinaryZipFileKeySuffix(architecture)

  if (!terraformBinaryZipFileKeySuffix) {
    throw new Error("Unsupported architecture")
  }

  const terraformBinaryZipFileKey = getTerraformBinaryZipFileKey(platform, architecture, terraformBinaryZipFileKeySuffix)

  if (!terraformBinaryZipFileKey) {
    throw new Error("Unsupported platform")
  }

  return TERRAFORM_RELEASES_BASE_URI + TERRAFORM_BINARY_ZIP_FILES[terraformBinaryZipFileKey]
}

export default getTerraformBinaryURLDependingOnPlatform
