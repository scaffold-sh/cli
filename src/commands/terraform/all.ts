import execa from "execa"
import { flags } from "@oclif/command"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"
import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"

/**
 * Represents the "scaffold terraform:{command}" command
 * used to forward commands to the Terraform binary.
 */
class TerraformAll extends BaseInfrastructureCommand {
  static description = "forward commands to the Terraform binary"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  static args = []

  static aliases = [
    "apply",
    "console",
    "destroy",
    "env",
    "fmt",
    "get",
    "graph",
    "import",
    "init",
    "login",
    "logout",
    "output",
    "plan",
    "providers",
    "refresh",
    "show",
    "taint",
    "untaint",
    "validate",
    "version",
    "workspace",
    "0.12upgrade",
    "0.13upgrade",
    "debug",
    "force-unlock",
    "push",
    "state",
  ].map(alias => `terraform:${alias}`)

  async run() {
    await this.ensureAllRequirements()

    const infrastructurePath = await this.infrastructurePath()

    if (!infrastructurePath) {
      this.error("No infrastructures found.")
    }

    const infrastructurePackage = await this.infrastructurePackage(infrastructurePath)

    if (!infrastructurePackage) {
      this.error("Invalid scaffold.json file.")
    }

    const infrastructure = InfrastructureFactory.infrastructure(infrastructurePackage.type)

    if (!infrastructure) {
      this.error("Unknown infrastructure.")
    }

    const terraformPlanPath = await this.terraformPlanPath(infrastructurePath)
    const terraformPath = BaseInfrastructureCommand.terraformBinaryPath()

    // Remove ["node", "{path}"]
    const passedArgs = process.argv.slice(2)

    passedArgs[0] = passedArgs[0].replace(/^terraform:/, "")

    const terraformCommand = execa(terraformPath, passedArgs, {
      cwd: terraformPlanPath,
    })

    terraformCommand.stderr.pipe(process.stderr)
    terraformCommand.stdout.pipe(process.stdout)
    process.stdin.pipe(terraformCommand.stdin)

    try {
      await terraformCommand
    } catch (error) {
      this.exit(1)
    }
  }
}

export default TerraformAll
