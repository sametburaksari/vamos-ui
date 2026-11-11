# Security policy

## Reporting a vulnerability

Please report security problems **privately** through GitHub's private vulnerability reporting:

1. Open <https://github.com/sametburaksari/vamos-ui/security/advisories/new>
   (repository → **Security** → **Report a vulnerability**).
2. Describe the issue, the affected package and version (`@vamos-ui/react`, `vamos-ui` CLI,
   `@vamos-ui/mcp`, the registry at `ui.vamos.ist/r`, or the hosted MCP server at `mcp.vamos.ist`),
   and the steps to reproduce it. A minimal proof of concept helps.

Do not open a public issue, pull request or discussion for a vulnerability.

What to expect:

- We acknowledge a report within **3 working days**.
- We confirm or reject it, and agree on a fix and disclosure timeline, within **14 days**.
- Fixes are released as a patch version and published as a GitHub security advisory. You are
  credited in the advisory unless you ask us not to be.

## Supported versions

Vamos UI is in early preview (0.x). Only the **latest minor release** of each package receives
security fixes. Upgrade to the newest version before reporting.

| Package | Supported |
| --- | --- |
| `@vamos-ui/react` | latest 0.x minor |
| `vamos-ui` (CLI) | latest 0.x minor |
| `@vamos-ui/mcp` | latest 0.x minor |

## What the CLI does and does not do

`npx vamos-ui` copies component source into your project. Specifically:

- It **reads JSON** from the registry (`https://ui.vamos.ist/r` by default, or the `--registry`,
  `VAMOS_REGISTRY` or `vamos.json` value) and **writes the source files** listed in each item into
  your `uiDir` / `blocksDir`. Registry paths that would escape those folders (`../`, absolute
  paths, drive letters) are refused.
- It records every file it writes, with a sha256 hash, in `<uiDir>/.vamos-lock.json`, so `diff`
  and `upgrade` can show you exactly what changed before anything is replaced.
- It **never downloads and runs remote code.** Registry content is written to disk as text; it is
  not evaluated, imported or executed by the CLI.
- `add`, `init` and `upgrade` run your own package manager (`pnpm add`, `npm install`, `yarn add`,
  `bun add`) for the npm dependencies an item declares. Those packages come from the npm registry
  and may run their own install scripts, exactly as if you had installed them yourself. Use
  `--no-install` to skip this and install manually, and `--dry-run` to see every file and command
  first.
- `brand import <url>` fetches the page, up to 8 stylesheets and logo files to propose a brand. It
  parses them as text and never executes their scripts.
- Registry items are not signed. A custom registry is trusted input: only point the CLI at
  registries you control or trust, and review the files with `--dry-run` or `vamos-ui diff`.

## MCP server

`@vamos-ui/mcp` gives AI agents read access to the registry, rules and tokens.

- **Local (stdio) mode** runs on your machine with your permissions. It writes nothing to your
  project except when an agent calls `apply_design_system` with `write: true`, and then only inside
  the given `projectDir`.
- **Remote mode** (`--http`, and the hosted server at `https://mcp.vamos.ist/mcp`) is stateless and
  has no sign-in. It cannot see your files: tools that read a local project (`get_brand`,
  `apply_design_system`, `update_design`, `verify_design` with `projectDir`) and URL import are
  disabled. Do not send secrets in tool arguments to a hosted server. When you run your own with
  `--http`, it binds to `127.0.0.1` by default and allows any origin (CORS `*`); put it behind your
  own proxy and authentication before exposing it on a network.

## Scope

In scope: the packages in this repository, the registry JSON served at `ui.vamos.ist/r`, the docs
site and the hosted MCP server. Out of scope: vulnerabilities in third-party dependencies that are
already public (report those upstream; we update promptly), and issues that need a compromised
machine or a malicious registry you chose to configure.

## Notes for apps built with the kit

- `Prose` with the `html` prop inserts the string as HTML unchanged. Only pass HTML you produced
  or sanitised; never pass user input directly.
- `can()` on `VamosProvider` hides navigation and actions. Hiding is not access control: enforce
  permissions on the server.
