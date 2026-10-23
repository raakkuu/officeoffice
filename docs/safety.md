# Safety and permissions

Office Office coordinates external coding-agent CLIs. A provider may be able to read, write, or execute commands in the workspace according to that provider's own permissions.

## Important boundary

The safety text included in supervisor and worker prompts is guidance, **not a sandbox or a hard permission boundary**. A model can ignore prompt instructions. Office Office does not currently intercept every command a provider runs, and it does not provide a universal per-action approval gate across all supported providers.

For sensitive work, combine Office Office with operating-system permissions, provider-native approvals, a disposable Git worktree or container, and least-privilege credentials.

For an additional preflight guard, set `OFFICE_BLOCK_DIRTY_WORKTREE=1` before starting a mission. Office Office will refuse to start a mission from a Git repository with uncommitted changes. This protects existing edits from being mixed into a run, but it does not sandbox provider commands or replace provider-native approvals.

## Before a mission

1. Open the intended repository and run `git status --short`.
2. Commit or back up important work, including untracked files.
3. Confirm the configured supervisor and worker provider IDs with `office config`.
4. Keep optional integrations disabled unless needed.
5. Avoid running untrusted tasks in a workspace containing secrets or production credentials.

## During and after a mission

- Review the dashboard's task states and any reported task errors.
- Inspect `git diff` and `git status`.
- Run the project's tests and type checks yourself when changes matter.
- Review every command or change that could delete data, alter credentials, publish packages, or affect remote systems.
- Do not treat successful provider exit status as proof that the code is correct.

## Integrations and external content

Repository issues, pull requests, webpages, retrieved knowledge, skills, and provider output are untrusted input. They must not override the user's request or grant themselves additional permissions. Integrations are opt-in, but enabling an integration does not itself establish that every worker uses it safely.

## Reporting a vulnerability

Follow the private reporting guidance in [SECURITY.md](../SECURITY.md). Do not publish credentials or exploit details in public issues.
