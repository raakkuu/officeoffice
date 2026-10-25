# Office Office — Project Workflow Plan

## Goal
Make Office Office feel like a local coding teammate: open any project folder, run `office start` or `office run "..."`, describe the outcome in normal language, watch a readable terminal-style progress stream, and optionally preview the running web app locally.

## Problems to solve
1. Provider output currently leaks supervisor JSON into the user-facing terminal, which is difficult to read.
2. The dashboard suppresses orchestrator output, so the web UI can appear stuck while work is happening.
3. The existing dashboard is a run-history page rather than a live coding console.
4. Project targeting must remain based on the current working directory so Office Office can be used from any project, not only the Office Office repository.
5. A web project needs an explicit, safe local preview workflow instead of a broken/implicit WebView assumption.
6. Existing workspace agent profiles can retain stale provider assignments; effective provider selection must honor the workspace configuration.
7. A user should be able to ask for a complete project outcome (for example, an invoice website) and get a human-readable plan, implementation, tests, and review rather than raw JSON.

## Implementation plan

### Phase 1 — readable execution
- Keep the current-working-directory contract.
- Add explicit `office run` and `office start` entry points.
- Keep supervisor JSON internal; display only a concise human-readable plan.
- Emit structured, human-readable progress events for planning, each agent task, review, errors, and completion.
- Persist run events under `.hive/runs/` so the terminal and dashboard can show the same history.

### Phase 2 — live dashboard / terminal console
- Add a dark terminal-style live console to the dashboard.
- Poll a lightweight run-event endpoint so the UI remains responsive on slower machines.
- Show current task, agent, progress, failures, and a final plain-English summary.
- Keep detailed raw provider output hidden behind an optional details area.

### Phase 3 — local web preview
- Detect common Node web scripts (`dev`, `start`, `serve`) from the target project's `package.json`.
- Add `office preview start|status|stop`.
- Start only the selected project-local package script, bind to localhost where supported, capture output, detect a localhost URL, and expose it to the dashboard.
- Add a dashboard preview card with an iframe and open-in-browser action.
- Never expose a LAN listener by default and never execute an arbitrary shell command from the web UI.

### Phase 4 — build-oriented workflow
- Improve the supervisor prompt so natural-language product requests produce small implementation tasks, tests, documentation, and a review step.
- If a task needs an external API, credential, or other missing input, the agent must report the requirement instead of inventing credentials or silently contacting an unrelated service.
- Preserve the existing safety rules: no destructive actions, no secret logging, no Git history changes, and no parent-directory edits without explicit authorization.

### Phase 5 — verification
- Add tests for provider routing, readable event generation, project-local execution, preview lifecycle, and API error handling.
- Run typecheck, unit tests, and build in CI.

## Intended user workflow

```powershell
cd C:\Projects\Raqib
office start
```

Then use the dashboard, or directly:

```powershell
office run "Build a small invoice website. Use a clean responsive UI, create the backend needed to save invoices, add tests, and ask me before using any external API or secret."
```

For a web project preview:

```powershell
office preview start
office preview status
office preview stop
```

The Office Office source repository is not required to be the current directory. The target project's current directory is the workspace.
