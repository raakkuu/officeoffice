# Office Office

**A local-first multi-agent coding orchestrator for real developer workflows.**

[![CI](https://github.com/raakkuu/officeoffice/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/raakkuu/officeoffice/actions/workflows/ci.yml)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-43853d?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

Turn one engineering request into a coordinated plan for specialist coding agents. **Office Office is a terminal-first tool, not a hosted web application.** Its optional local web dashboard lets you submit tasks and monitor run history. Office Office is the orchestrator—not a model or an AI subscription. You choose and configure the provider CLIs you trust.

<p align="center">
  <img src="docs/images/terminal-preview.svg" alt="Illustrative Office Office terminal workflow concept, not a live screenshot" width="100%">
</p>

<p align="center">
  <strong>Plan work · Delegate tasks · Track runs · Review results</strong>
</p>

## At a glance

- **Michael** plans and coordinates the work.
- **Dwight** specializes in backend and systems tasks.
- **Pam** specializes in frontend and user experience.
- **Jim** focuses on testing and quality.
- Dependency-aware scheduling with configurable parallelism.
- Persistent task and run history in the local `.hive/` directory.
- Optional responsive local web dashboard with a task composer and run tracking.
- Provider adapters for Claude Code, Codex CLI, Gemini CLI, Ollama, and custom CLI configurations.
- Node.js-based process execution; no native PTY dependency is required.

## Optional web dashboard

The web interface is a local companion to the CLI. It is not a hosted product, and it currently has no login or multi-user access control. The terminal visual above is explicitly an **illustration** of the CLI workflow, not a capture of a real run. For a dashboard view, see the [dashboard preview illustration](docs/images/dashboard-preview.svg).

## How it works

<p align="center">
  <img src="docs/images/architecture.svg" alt="Office Office architecture: CLI and dashboard send work to Michael, who delegates tasks to specialist agents; run data is stored locally and reviewed." width="100%">
</p>

1. You submit a coding request through the CLI or dashboard.
2. Michael asks the configured supervisor provider to turn it into a task plan.
3. Specialist providers execute eligible tasks, respecting dependencies and the parallelism limit.
4. Task and run state is saved under `.hive/`.
5. The supervisor reviews the result and records a final run status.

> **Important:** Agents can execute commands and modify files in the selected workspace. Use a Git-managed project, inspect diffs, and avoid running untrusted tasks against sensitive workspaces.

## Requirements

- Node.js **20 or newer**
- Git recommended
- At least one supported provider CLI installed and authenticated, or a custom CLI provider configured
- Provider usage may incur charges depending on your account and provider

## Install from source

Clone the repository and install dependencies:

```bash
git clone https://github.com/raakkuu/officeoffice.git
cd officeoffice
npm install
npm run check
npm test
npm run build
npm link
```

Then check your environment and inspect the available commands:

```bash
office doctor
office --help
office agents
```

## Run your first task

From the root of the repository you want the agents to work on:

```bash
office "Inspect this project, identify the highest-priority bug, and add a regression test"
```

Start the local dashboard instead:

```bash
office web
```

Open the local URL printed in your terminal (by default, `http://127.0.0.1:4311`). The optional dashboard can submit tasks and display saved run progress. In GitHub Codespaces, open the **Ports** panel and use the forwarded URL for port **4311**. The dashboard is a companion interface; the CLI remains a first-class way to use Office Office.

The dashboard is intended for local development. Do not expose it publicly or forward it to an untrusted network.

## Configure providers

Office Office does not silently install or authenticate third-party AI services. Install the provider CLI you want to use and follow that provider's official setup instructions.

Check what is available:

```bash
office doctor
office config
```

The default configuration lives at `~/.office-office/config.json`. Use `office config set supervisor <provider-id>` to select the supervisor provider. Provider IDs must match entries in your configuration.

Common API-key environment variables include:

| Provider | Environment variable |
| --- | --- |
| Claude | `ANTHROPIC_API_KEY` |
| Codex / OpenAI | `OPENAI_API_KEY` |
| Gemini | `GEMINI_API_KEY` |
| Ollama | Usually local; no cloud key required |

Set only the credentials you need. `office doctor` reports key presence, not the secret value. CLI authentication behavior varies by provider; a key may not be required when you use an already-authenticated CLI.

### Ollama

Ollama can run local models. Make sure the Ollama CLI and selected model are installed, then verify your local configuration before starting a task. The default model in the generated configuration is `qwen2.5-coder:7b`.

## CLI reference

| Command | Purpose |
| --- | --- |
| `office --help` | Show command help |
| `office agents` | Show the agent roster |
| `office doctor` | Check Node, Git, provider executables, and key visibility |
| `office status` | Show Git status for the current directory |
| `office web` | Start the local dashboard |
| `office config` | Print configuration with provider environment values omitted |
| `office config set supervisor <provider-id>` | Change the configured supervisor |
| `office "<task>"` | Run a coding task |

## Project layout

```text
officeoffice/
├── bin/                 # Installed CLI entry point
├── src/
│   ├── cli.ts           # CLI commands
│   ├── config.ts        # Local provider configuration
│   ├── providers.ts     # Provider process execution
│   ├── scheduler.ts     # Task dependency scheduling
│   ├── server.ts        # Local dashboard API
│   ├── supervisor.ts    # Planning, delegation, and review
│   └── hive.ts          # Local task and memory persistence
├── web/
│   └── index.html       # Dashboard UI
├── docs/images/         # README diagrams and visual previews
├── test/                # Automated tests
└── .hive/               # Runtime data created in a target workspace
```

## Security and privacy

- The dashboard binds to `127.0.0.1` by default.
- Treat a coding-agent run as granting the provider CLI access to the selected workspace and whatever permissions that CLI has.
- Use least-privilege credentials and a clean Git working tree; review changes before merging or deploying.
- Never commit API keys, OAuth tokens, SSH keys, or other secrets.
- Review `.hive/` before sharing a project; it may contain prompts, task descriptions, and agent output.
- Provider commands can have broad permissions. Understand each provider's own approval and sandbox settings.
- Do not expose the dashboard to the public internet without adding appropriate authentication and access controls.

Read [SECURITY.md](SECURITY.md) to report a potential vulnerability.

## Development and checks

```bash
npm install
npm run check
npm test
npm run build
```

The GitHub Actions workflow runs these checks on Node.js 20 and 22. Tests should use mocked provider execution and must not require paid APIs or real credentials.

## Known limitations

- Agent quality, tool access, and costs depend on the configured provider and its CLI permissions.
- A successful provider process does not guarantee that its code changes are correct; inspect the diff and test results.
- The dashboard is local-first and currently has no user login or multi-user access control.
- The dashboard run guard applies to a single running server process; it is not a cross-process job lock.
- Runtime state is local to the workspace and is not a hosted team database.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the project workflow. Please include tests for behavior changes and never include real secrets in fixtures.

## License

MIT. See [LICENSE](LICENSE).
