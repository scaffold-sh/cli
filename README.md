<p align="center">
  <img src="/assets/scaffold.png" alt="AWS" width="200" height="200" />
</p>

<h1 align="center">Scaffold CLI</h1>

<h4 align="center">
  <a href="https://scaffold.sh/docs">Documentation</a> |
  <a href="https://scaffold.sh">Website</a> |
  <a href="https://medium.com/scaffold">Blog</a> |
  <a href="https://twitter.com/scaffold_sh">Twitter</a> |
  <a href="https://www.linkedin.com/company/scaffold-sh">LinkedIn</a>
</h4>

<p align="center">
  <a href="https://github.com/scaffold-sh/cli/blob/master/package.json"><img src="https://img.shields.io/node/v/@scaffold.sh/cli" alt="Node version"></a>
  <a href="https://yarnpkg.com/en/docs/install"><img src="https://img.shields.io/badge/yarn-%3E%3D1.21-blue" alt="Yarn version"></a>
    <a href="https://aws.amazon.com/cli/?nc1=h_ls"><img src="https://img.shields.io/badge/aws-%3E%3D2.0-0b1b2c" alt="AWS version"></a>
  <a href="https://www.terraform.io/downloads.html"><img src="https://img.shields.io/badge/terraform-13.0-5c44db" alt="Terraform version"></a>
  <a href="https://github.com/hashicorp/terraform-cdk"><img src="https://img.shields.io/badge/cdktf-%3E%3D0.14-green" alt="CDKTF version"></a>
  <a href="https://github.com/scaffold-sh/cli/blob/master/LICENSE"><img src="https://img.shields.io/github/license/scaffold-sh/cli" alt="License"></a>
</p>

Scaffold is a framework for [IAC](https://en.wikipedia.org/wiki/Infrastructure_as_code) build around [Terraform](https://www.terraform.io) and the [CDKTF](https://learn.hashicorp.com/tutorials/terraform/cdktf), coupled with a [catalog](https://scaffold.sh/docs/infrastructures/aws/static-website) that you could use to create a complete [AWS](https://aws.amazon.com) infrastructure, defined as code, in seconds.

All infrastructures are [**open sourced**](https://github.com/scaffold-sh) and defined as **Typescript code** using the [CDK for Terraform](https://learn.hashicorp.com/tutorials/terraform/cdktf). 

The CDK (Cloud Development Kit) for Terraform allows developers to use familiar programming languages to define cloud infrastructure and provision it through [HashiCorp Terraform](https://www.terraform.io/). 

Scaffold enhances Terraform and the CDKTF with many features like [environments](https://scaffold.sh/docs/environments) and [sandboxes](https://scaffold.sh/docs/sandboxes) without using any configuration files, black box or lock-in.

**You are free to go back to raw Terraform at any time.**

## Prerequisites

In order to use Scaffold, you'll need Node.js, Yarn and the AWS CLI:

*   [Node.js](https://nodejs.org/) >= v12.16
*   [Yarn](https://yarnpkg.com/en/docs/install) >= v1.21
*   [AWS CLI](https://aws.amazon.com/cli/?nc1=h_ls) >= v2.0

[Node.js](https://nodejs.org/) publishes a graphical installer that will install Node.js and NPM on your platform.

[Yarn](https://yarnpkg.com/en/docs/install) is an alternate JavaScript package manager required by the CDK for Terraform.

To install the AWS CLI on your operating system, you could read the [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

## Install Scaffold

To install the most recent stable release of Scaffold, use npm:

```console
$ npm install --global @scaffold.sh/cli
```

## Usage
```sh-session
$ scaffold COMMAND
running command...
$ scaffold (-v|--version|version)
@scaffold.sh/cli/0.0.0 darwin-x64 node-v14.7.0
$ scaffold --help [COMMAND]
USAGE
  $ scaffold COMMAND
...
```
## Commands
* [`scaffold help [COMMAND]`](#scaffold-help-command)
* [`scaffold init`](#scaffold-init)
* [`scaffold plan ENVIRONMENT`](#scaffold-plan-environment)
* [`scaffold apply ENVIRONMENT`](#scaffold-apply-environment)
* [`scaffold destroy ENVIRONMENT`](#scaffold-destroy-environment)
* [`scaffold env:create [ENVIRONMENT_NAME]`](#scaffold-envcreate-environment_name)
* [`scaffold env:list`](#scaffold-envlist)
* [`scaffold env:configure ENVIRONMENT`](#scaffold-envconfigure-environment)
* [`scaffold env:delete ENVIRONMENT`](#scaffold-envdelete-environment)
* [`scaffold sandbox:create [ENVIRONMENT]`](#scaffold-sandboxcreate-environment)
* [`scaffold sandbox:list`](#scaffold-sandboxlist)
* [`scaffold sandbox:delete ENVIRONMENT`](#scaffold-sandboxdelete-environment)
* [`scaffold terraform:all`](#scaffold-terraformall)
* [`scaffold cdktf:all`](#scaffold-cdktfall)
* [`scaffold aws:static-website [PROJECT_NAME]`](#scaffold-awsstatic-website-project_name)
* [`scaffold aws:serverless-docker [PROJECT_NAME]`](#scaffold-awsserverless-docker-project_name)

### `scaffold help [COMMAND]`

Display help for the Scaffold CLI.

```
USAGE
  $ scaffold help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

### `scaffold init`

Initialize an infrastructure.

```
USAGE
  $ scaffold init

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/init.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/init.ts)_

### `scaffold plan ENVIRONMENT`

Plan the infrastructure modifications for an environment.

```
USAGE
  $ scaffold plan ENVIRONMENT

OPTIONS
  -h, --help  show CLI help
  --sandbox
```

_See code: [src/commands/plan.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/plan.ts)_

### `scaffold apply ENVIRONMENT`

Update the infrastructure of an environment.

```
USAGE
  $ scaffold apply ENVIRONMENT

OPTIONS
  -h, --help  show CLI help
  --sandbox
```

_See code: [src/commands/apply.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/apply.ts)_

### `scaffold destroy ENVIRONMENT`

Destroy the infrastructure of an environment.

```
USAGE
  $ scaffold destroy ENVIRONMENT

OPTIONS
  -h, --help  show CLI help
  --sandbox
```

_See code: [src/commands/destroy.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/destroy.ts)_

### `scaffold env:create [ENVIRONMENT_NAME]`

Create a new environment.

```
USAGE
  $ scaffold env:create [ENVIRONMENT_NAME]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/env/create.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/env/create.ts)_

### `scaffold env:list`

List all created environments.

```
USAGE
  $ scaffold env:list

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/env/list.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/env/list.ts)_

### `scaffold env:configure ENVIRONMENT`

Configure an existing environment.

```
USAGE
  $ scaffold env:configure ENVIRONMENT

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/env/configure.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/env/configure.ts)_

### `scaffold env:delete ENVIRONMENT`

Delete an environment.

```
USAGE
  $ scaffold env:delete ENVIRONMENT

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/env/delete.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/env/delete.ts)_

### `scaffold sandbox:create [ENVIRONMENT]`

Create a new sandbox for an environment.

```
USAGE
  $ scaffold sandbox:create [ENVIRONMENT]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/sandbox/create.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/sandbox/create.ts)_

### `scaffold sandbox:list`

List all created sandboxes.

```
USAGE
  $ scaffold sandbox:list

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/sandbox/list.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/sandbox/list.ts)_

### `scaffold sandbox:delete ENVIRONMENT`

Delete sandbox for an environment.

```
USAGE
  $ scaffold sandbox:delete ENVIRONMENT

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/sandbox/delete.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/sandbox/delete.ts)_

### `scaffold terraform:all`

Forward commands to the Terraform binary.

```
USAGE
  $ scaffold terraform:all

OPTIONS
  -h, --help  show CLI help

ALIASES
  $ scaffold terraform:apply
  $ scaffold terraform:console
  $ scaffold terraform:destroy
  $ scaffold terraform:env
  $ scaffold terraform:fmt
  $ scaffold terraform:get
  $ scaffold terraform:graph
  $ scaffold terraform:import
  $ scaffold terraform:init
  $ scaffold terraform:login
  $ scaffold terraform:logout
  $ scaffold terraform:output
  $ scaffold terraform:plan
  $ scaffold terraform:providers
  $ scaffold terraform:refresh
  $ scaffold terraform:show
  $ scaffold terraform:taint
  $ scaffold terraform:untaint
  $ scaffold terraform:validate
  $ scaffold terraform:version
  $ scaffold terraform:workspace
  $ scaffold terraform:0.12upgrade
  $ scaffold terraform:0.13upgrade
  $ scaffold terraform:debug
  $ scaffold terraform:force-unlock
  $ scaffold terraform:push
  $ scaffold terraform:state
```

_See code: [src/commands/terraform/all.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/terraform/all.ts)_

### `scaffold cdktf:all`

Forward commands to the CDKTF binary.

```
USAGE
  $ scaffold cdktf:all

OPTIONS
  -h, --help  show CLI help

ALIASES
  $ scaffold cdktf:deploy
  $ scaffold cdktf:destroy
  $ scaffold cdktf:diff
  $ scaffold cdktf:get
  $ scaffold cdktf:init
  $ scaffold cdktf:login
  $ scaffold cdktf:synth
```

_See code: [src/commands/cdktf/all.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/cdktf/all.ts)_

### `scaffold aws:static-website [PROJECT_NAME]`

Download the Terraform code for the [static website infrastructure](https://github.com/scaffold-sh/aws-static-website).

```
USAGE
  $ scaffold aws:static-website [PROJECT_NAME]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/aws/static-website.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/aws/static-website.ts)_

### `scaffold aws:serverless-docker [PROJECT_NAME]`

Download the Terraform code for the [serverless Docker infrastructure](https://github.com/scaffold-sh/aws-serverless-docker).

```
USAGE
  $ scaffold aws:serverless-docker [PROJECT_NAME]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/aws/serverless-docker.ts](https://github.com/scaffold-sh/cli/blob/master/src/commands/aws/serverless-docker.ts)_
