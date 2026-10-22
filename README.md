# Office Office

**A local-first multi-agent coding orchestrator for real developer workflows.**

[![CI](https://github.com/raakkuu/officeoffice/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/raakkuu/officeoffice/actions/workflows/ci.yml)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-43853d?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

Turn one engineering request into a coordinated plan for specialist coding agents. **Office Office is a terminal-first tool, not a hosted web application.** Its optional local web dashboard lets you submit tasks and monitor run history. Office Office is the orchestrator—not a model or an AI subscription. You choose and configure the provider CLIs you trust.

## Core feature: a coordinated AI team

Office Office is built around a supervisor and specialist agents—not just a single chatbot. Michael plans work and delegates tasks to enabled specialists. The local dashboard also lets you start a bounded discussion where configured AI agents take turns responding to one another, with each reply saved in the room transcript.

<p align="center">
  <img src="docs/images/agent-communication.svg" alt="A simple Office Office collaboration map with pixel-style agent faces, specialist handoffs, and shared local project knowledge." width="100%">
</p>

### See it in the dashboard

The **Team flow** section uses small pixel-style agent faces, role labels, connecting arrows, and a shared-workspace panel to make the collaboration flow easy to understand at a glance. Open the local dashboard with `office web` and look for **Team flow**.

In **Rooms**, create or open a room and click **Run agent discussion** to let its enabled participants take bounded turns through their configured provider CLIs. Replies are saved locally. This is an explicit action—not a continuous background conversation—and provider usage may incur charges.

Agent profiles, room records, skills, messages, and project artifacts are stored locally under `.hive/collaboration/`. Task dependency results are also passed to downstream task prompts as handoff context.


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
- **Jim** focuses on testing and quality in the current default team.
- Dependency-aware scheduling with configurable parallelism.
- A concise CLI experience: the pixel logo is shown for help/discovery rather than repeated before every operational command.
- Human-readable `office config` output, with `office config --json` available for scripting.
- Persistent task and run history in the local `.hive/` directory.
- Optional responsive local web dashboard with task submission, dynamic agent profiles, saved skills, collaboration rooms, shared project artifacts, and run tracking.
- Provider adapters for Claude Code, Codex CLI, Gemini CLI, Ollama, and custom CLI configurations.
- Node.js-based process execution; no native PTY dependency is required.

## Optional web dashboard

The web interface is a local companion to the CLI. It is not a hosted product, and it currently has no login or multi-user access control. The dashboard includes Overview, task submission, built-in and user-created agent profiles, a pixel-style team-flow map, Meeting Room/Cafeteria room records, bounded AI discussions, a local skills library, shared project knowledge/artifacts, Run history, and Workspace health. Room discussions are explicitly started by you and use configured provider CLIs; they stop at the room's turn limit. The terminal visual above is explicitly an **illustration** of the CLI workflow, not a capture of a real run. For a dashboard view, see the [dashboard preview illustration](docs/images/dashboard-preview.svg).

## Terminal identity

The CLI uses a pixel-inspired block-letter logo with a coral accent and a minimal gold wordmark. The artwork is terminal text, not a cloud-hosted architecture or a screenshot of a completed run. Accent colors are used only in interactive terminals and can be disabled with `NO_COLOR`.

```text
 ██████╗ ███████╗███████╗██╗ ██████╗███████╗
██╔═══██╗██╔════╝██╔════╝██║██╔════╝██╔════╝
██║   ██║█████╗  █████╗  ██║██║     █████╗  
██║   ██║██╔══╝  ██╔══╝  ██║██║     ██╔══╝  
╚██████╔╝██║     ██║     ██║╚██████╗███████╗
 ╚═════╝ ╚═╝     ╚═╝     ╚═╝ ╚═════╝╚══════╝
             O F F I C E   O F F I C E
```
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

## Install from source (Windows, macOS, Linux, and Termux)

Office Office needs **Node.js 20+** and Git. Commands below are for a fresh install. Use the section after this one to update an existing checkout without losing your work.

### Windows — Command Prompt (CMD) or PowerShell

Install Git and Node.js if they are missing (using Windows Package Manager):

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Close and reopen the terminal, then check versions:

```cmd
git --version
node --version
npm --version
```

Clone and build (these commands work in CMD and PowerShell):

```cmd
git clone https://github.com/raakkuu/officeoffice.git
cd officeoffice
npm install
npm run check
npm test
npm run build
npm link
```

If Windows asks for administrator permission for `npm link`, reopen the terminal with the appropriate permission or use the project locally with `npm run dev` if that script is available. Do not run commands from inside a different project directory.

### macOS or Linux terminal

Install Git and Node.js 20+ using your operating system's package manager or the official installers, then run:

```bash
git clone https://github.com/raakkuu/officeoffice.git
cd officeoffice
npm install
npm run check
npm test
npm run build
npm link
```

For Ubuntu/Debian, `sudo apt install git` installs Git, but the distribution's Node.js package may be older than version 20; verify `node --version` and use a current Node.js 20+ installation.

### Android — Termux

Install Termux from a trusted source such as F-Droid or the official Termux GitHub releases. In Termux, run:

```bash
pkg update
pkg upgrade
pkg install git nodejs-lts
git --version
node --version
npm --version
git clone https://github.com/raakkuu/officeoffice.git
cd officeoffice
npm install
npm run check
npm test
npm run build
```

Termux package availability can vary. If `nodejs-lts` is unavailable, run `pkg search nodejs` and install the current supported Node.js package. You can run the CLI inside Termux; provider CLIs (Claude Code, Codex, Gemini, or other providers) must separately support Android/Termux and be installed/authenticated there. Some providers may not support Termux.

After building, use `npm link` where supported to expose the `office` command globally. If global linking is unavailable, run the CLI through the repository's documented npm scripts or use the project-local binary after checking `package.json` scripts.

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
| `office config` | Show a human-readable configuration summary without secrets |
| `office config --json` | Print machine-readable configuration with provider environment values omitted |
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

## Updating an existing checkout safely (keep changes synchronized)

**Run these steps in order, one at a time.** Updating Git itself does not update Office Office. These steps update the repository code from GitHub.

1. Open the terminal in your Office Office repository folder.
2. Check for local edits before pulling:

```bash
git status
git branch --show-current
```

3. If you have changes you want to keep, commit them or stash them before continuing. Do not overwrite uncommitted work.
4. Switch to the branch you want to update and pull its latest commits. For the stable version, use `main`:

```bash
git switch main
git pull --ff-only origin main
```

To test the collaboration work before it is merged, use `git switch feat/agent-collaboration` and then `git pull --ff-only origin feat/agent-collaboration` instead. That branch may change while the pull request is being reviewed.

5. Install dependencies, check, test, and build in order:

```bash
npm install
npm run check
npm test
npm run build
```

6. If you originally used `npm link` for a source install, relink after the build if your environment requires it:

```bash
npm link
```

7. Verify the command points to the updated install:

```bash
office --help
office doctor
```

If `git pull` says you have divergent branches or local changes, stop and resolve that before running a reset. **Do not use `git reset --hard` as a routine update command**—it can delete local work. If you downloaded a ZIP instead of cloning with Git, download/extract the new version separately and migrate your local configuration/workspace carefully rather than running `git pull`.

### Development and checks

```bash
npm install
npm run check
npm test
npm run build
```

The GitHub Actions workflow runs these checks on Node.js 20 and 22. Tests should use mocked provider execution and must not require paid APIs or real credentials.

## Collaboration roadmap

The core collaboration flow is now available in the feature branch: a visual team map, user-triggered bounded AI room discussions, saved transcripts, agent profiles, and local project artifacts. The full design is documented in [Agent Collaboration Architecture](docs/agent-collaboration.md), and planning is tracked in [GitHub issue #1](https://github.com/raakkuu/officeoffice/issues/1).

Still planned:

- Structured messages for questions, handoffs, progress reports, findings, and reviews.
- Automatic task-triggered agent communication and richer handoff coordination.
- Meeting summaries, decisions, and action items.
- Optional Cafeteria sessions with strict limits.
- Skill-to-agent assignment and controlled skill execution.
- More granular workspace/network permissions, artifact provenance, retention controls, and secret redaction.

**Current limits:** discussions only run when you click the button, stop at the room's turn limit (maximum 20 turns), and may incur provider usage charges. Agents do not run an always-on autonomous conversation, independently launch other agents, or automatically execute saved skills.

## Known limitations

- Agent quality, tool access, and costs depend on the configured provider and its CLI permissions.
- A successful provider process does not guarantee that its code changes are correct; inspect the diff and test results.
- The dashboard is local-first and currently has no user login or multi-user access control.
- The dashboard run guard applies to a single running server process; it is not a cross-process job lock.
- Runtime state is local to the workspace and is not a hosted team database.
- Collaboration data is saved in `.hive/collaboration/`; back it up with care and review it before sharing.
- User-created agent profiles must reference a provider ID present in the local configuration. Profile creation does not install or authenticate that provider.
- Room messages and shared artifacts are local project data; avoid putting credentials or sensitive information in them.
- `office doctor` checks provider executable/key presence; it does not make a live authenticated request to each provider.
- Updating GitHub does not update an existing local installation automatically. Source installs must pull changes and rebuild/relink as appropriate; packaged installs must install a newer release.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the project workflow. Please include tests for behavior changes and never include real secrets in fixtures.

## License

MIT. See [LICENSE](LICENSE).
