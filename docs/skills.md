# Office Office skills

Office Office is an orchestration layer above provider CLIs such as Codex, Claude Code, and Gemini. Skills describe repeatable engineering workflows that can be handed to those workers by the supervisor.

## Repository skills

Built-in skills live in `skills/<id>/SKILL.md`. Each file uses a small frontmatter header:

```text
---
name: testing
description: Verify changes with focused, reproducible tests and checks.
---
# Testing
...
```

The loader reads the `name`, `description`, and Markdown body. Invalid skill files are ignored rather than making the whole run fail.

Current built-in skills:

- `planning` — mission decomposition and dependencies
- `review` — correctness, regressions, and verification
- `engineering` — safe implementation work
- `design` — professional, accessible product UI
- `testing` — focused and reproducible verification
- `debugging` — evidence-first diagnosis
- `security-review` — secret handling and security boundaries
- `release-manager` — release readiness and final diff checks

## Workspace overrides

For a particular project, `.hive/skills/<id>/SKILL.md` can override a repository skill with the same ID. This is intentionally local to the workspace and is not written into the source repository automatically.

Skills created through the dashboard are also available to orchestration runs as workspace skills.

## How skills are used

Michael receives planning/review guidance when creating the task graph. Each worker receives the skills assigned to its agent profile. The final review uses `review`, `testing`, and `security-review` when those built-ins exist.

Skills are guidance, not permissions. User requests, repository instructions, and security constraints remain higher priority. Skill text and other project data are treated as untrusted input.

## CLI

Use `office skills` to list the skills available in the current workspace.
