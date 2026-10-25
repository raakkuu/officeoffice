# Office Office architecture roadmap

Office Office is evolving toward a local-first coding workspace that can build, test, review, and preview a project from the terminal or dashboard.

## Current priorities

1. **Reliable execution** — bounded retries, dependency blocking, read-only review, cancellation, and persistent run state.
2. **Terminal UX** — readable event stream, pixel-art identity, clear agent phases, errors, and completion without raw provider protocol output.
3. **Live preview** — start the project's dev server and show the real localhost application in the dashboard when embedding is permitted.
4. **Resource-aware scheduling** — avoid exhausting local RAM by limiting concurrent heavy provider processes and favoring sequential work when appropriate.
5. **Product workflow** — plan a complete vertical slice, ask for missing external credentials, implement backend/frontend/tests, review, and then offer the preview.

## Non-goals

- Office Office must not silently commit, push, merge, reset, delete branches, or modify files outside the current workspace.
- Provider output is implementation detail; the main user interface should show concise, human-readable events.
- A preview must never imply success merely because a process started; the UI should report whether a reachable local URL was detected.

## Verification loop

Every substantial change should be checked with `npm run check`, `npm test`, and `npm run build` before it is merged. Changes that affect the dashboard should also be manually exercised from a separate test project when possible.
