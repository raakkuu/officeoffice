# 🏢 Office Office

**A local-first multi-agent coding orchestrator for real developer workflows.**

Office Office turns one engineering request into a coordinated plan executed by specialist AI coding agents. It is an orchestrator, not a model: you bring the provider accounts/keys and coding CLIs you trust.

## What it does

- **Michael** plans and coordinates work.
- **Dwight** handles backend/systems tasks.
- **Pam** handles frontend/UX tasks.
- **Jim** handles testing/review.
- Dependency-aware task scheduling with bounded parallelism.
- Persistent `.hive/` task, message, memory, and run state.
- Local-only web dashboard.
- Git-aware workflow.
- Works with Claude Code, Codex CLI, Gemini CLI, Ollama, and custom CLI providers.
- API keys can be supplied through environment variables; they are never written to project files or Hive.
- Termux-friendly architecture: uses Node child processes rather than requiring a native PTY package.

## Install from source

```bash
npm install
npm run build
npm link
```

Then:

```bash
office doctor
office "Build authentication with tests"
```

## Provider setup

Office Office does **not** silently install or authenticate third-party AI services. Install the provider CLI you choose, then authenticate it according to that provider's official instructions.

For API-key based providers, environment variables are recommended:

```bash
export ANTHROPIC_API_KEY="..."
export OPENAI_API_KEY="..."
export GEMINI_API_KEY="..."
```

Only set the key(s) for the provider(s) you actually use. `office doctor` reports whether a key is visible without printing its value.

### Ollama

Ollama can run locally and does not require a cloud API key. Configure the model in `office config` / `~/.office-office/config.json`.

## Commands

```text
office "<task>"       Run an autonomous coding task
office agents         Show the office roster
office doctor         Check Node, Git, providers, and key visibility
office status         Show Git status
office web            Start the local dashboard
office config         Show safe configuration
office config set supervisor <provider>
```

## Security model

- Runs against the current working directory.
- No API keys are committed to the repository.
- Provider environment variables are passed only to child provider processes.
- Office Office binds its dashboard to `127.0.0.1` by default.
- Review `.hive/` before sharing a project if it may contain sensitive agent output.
- Autonomous coding agents can execute commands and modify files. Use it only in workspaces you trust and keep Git history clean.

## Architecture

```text
User
  │
  ▼
Michael (supervisor)
  │
  ├── Dwight ── backend
  ├── Pam ───── frontend
  └── Jim ───── testing
       │
       ▼
     .hive/
       │
       ▼
Review + verification
```

## Development

```bash
npm run check
npm test
npm run build
```

The CI suite uses mocked provider execution; it does not require paid AI APIs.

## License

MIT
