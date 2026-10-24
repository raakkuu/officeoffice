# Changelog

## Unreleased

- Added an `office setup` first-run checklist and provider detection.
- Dashboard mission cards show task-level error details when tasks fail.
- Strengthened supervisor, worker, and review prompt guidance against unauthorized destructive actions.
- Added optional `OFFICE_BLOCK_DIRTY_WORKTREE=1` preflight protection for uncommitted Git workspaces.
- Added `office diff` to inspect tracked changes.
- Added `office review` for read-only branch, working-tree, changed-file, diff-stat, and optional full-diff review.
- Added automatic one-time task retry and explicit `blocked` propagation for failed prerequisites.
- Added scheduler tests for retry limits and blocked dependencies, plus Git review helper tests.
- Expanded CI to Node.js 20/22 on Linux and Windows.
- Added safety and first-run documentation, README links, and a tag-based release workflow.

## 2.0.0 — 2026-10-22

- Rebuilt Office Office as a local-first multi-agent orchestrator.
- Added supervisor planning, dependency-aware task scheduling, specialist agents, review pass, Hive persistence, provider diagnostics, CLI commands, local web dashboard, Git awareness, API-key environment support, Termux-friendly process execution, CI, security policy, and contributor documentation.
