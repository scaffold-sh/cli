import execa from "execa"
import { flags } from "@oclif/command"

import BaseInfrastructureCommand from "../../BaseInfrastructureCommand"
import InfrastructureFactory from "../../lib/infrastructures/InfrastructureFactory"

/**
 * Represents the "scaffold cdktf:{command}" command
 * used to forward commands to the CDKTF binary.
 */
class CdktfAll extends BaseInfrastructureCommand {
  static description = "forward commands to the CDKTF binary"

  static flags = {
    help: flags.help({
      char: "h",
    }),
  }

  static args = []

  static aliases = [
    "deploy",
    "destroy",
    "diff",
    "get",
    "init",
    "login",
    "synth",
  ].map(alias => `cdktf:${alias}`)

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

    const cdktfPath = this.cdktfPath(infrastructurePath)

    // Remove ["node", "{path}"]
    const passedArgs = process.argv.slice(2)

    passedArgs[0] = passedArgs[0].replace(/^cdktf:/, "")

    const cdktfCommand = execa(cdktfPath, passedArgs, {
      cwd: infrastructurePath,
    })

    cdktfCommand.stderr.pipe(process.stderr)
    cdktfCommand.stdout.pipe(process.stdout)
    process.stdin.pipe(cdktfCommand.stdin)

    try {
      await cdktfCommand
    } catch (error) {
      this.exit(1)
    }
  }
}

export default CdktfAll
