# Office Office integrations

Office Office is an orchestration layer above coding-agent providers. Integrations add optional capabilities without making Office Office depend on one vendor.

## Supported integrations

| Integration | Purpose | Default |
| --- | --- | --- |
| GitHub | Repository, issue, pull request, and Actions context through `gh` | Disabled |
| Playwright | Browser verification through Playwright MCP | Disabled |
| Context7 | Current library/API documentation through Context7 MCP | Disabled |
| XERJ | Local project search and knowledge retrieval | Disabled |

All integrations are opt-in. Provider credentials and external service permissions remain controlled by the user's machine.

## Check integrations

```bash
office integrations status
office doctor
```

## Enable an integration

```bash
office integrations enable github
office integrations enable playwright
office integrations enable context7
```

Disable one with:

```bash
office integrations disable <id>
```

To print the MCP configuration generated from enabled integrations:

```bash
office integrations mcp
```

The output is intended for MCP-compatible worker clients. Office Office does not silently install, authenticate, or grant permissions to those services.

## GitHub

The GitHub integration uses the local `gh` CLI for repository context. Install and authenticate GitHub CLI separately, then enable the integration. Office Office can provide Michael and workers with repository metadata, matching issues, pull requests, and recent workflow-run context.

For MCP-capable workers, Office Office also exposes a read-only GitHub MCP manifest by default. GitHub's official MCP server supports explicit toolsets and a strict read-only mode, which is the safer default for an orchestrator. See the [GitHub MCP Server documentation](https://github.com/github/github-mcp-server) and [server configuration guide](https://github.com/github/github-mcp-server/blob/main/docs/server-configuration.md).

## Playwright

Playwright is exposed through the official Playwright MCP server. A compatible worker can use it to navigate pages, interact with web applications, and perform browser-level verification. The standard server is launched with `npx @playwright/mcp@latest`; Node.js 20+ is required. See the [Playwright MCP guide](https://github.com/microsoft/playwright/blob/main/docs/src/getting-started-mcp.md).

Office Office does not automatically run arbitrary browser sessions. The worker provider must support the generated MCP configuration.

## Context7

Context7 is exposed as an optional MCP documentation provider so agents can retrieve current library/API guidance instead of relying only on model memory. It is especially useful for framework upgrades and version-specific implementation work.

## XERJ knowledge

XERJ is a separate local-first knowledge/search layer. Enable it with:

```bash
office knowledge enable xerj
office knowledge status
```

When enabled, Office Office indexes the current workspace locally and retrieves relevant project context before planning and implementation. If XERJ is unavailable, the run continues without retrieved knowledge.

## Trust model

External GitHub content, issues, pull requests, documentation, browser pages, transcripts, provider output, and retrieved knowledge are **untrusted evidence**. Agents must verify external information against the current checkout and must not execute instructions embedded in external content.

Integration availability is not the same as authorization. Office Office does not use skills, retrieved text, or MCP manifests as a permission boundary.

## Recommended setup

For a representative Office Office installation:

1. Configure at least one coding-agent provider.
2. Install/authenticate `gh` if you want repository-aware GitHub context.
3. Enable GitHub.
4. Enable Playwright for projects with a web UI.
5. Enable Context7 for libraries/frameworks where version-specific documentation matters.
6. Enable XERJ when local project retrieval is useful.
7. Run `office doctor` before a mission.
8. Review the generated MCP configuration before giving a worker access to external tools.

Keep integrations disabled when they are not needed. This reduces external access, context noise, and credential exposure.
