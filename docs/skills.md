# Office Office skills

Office Office is an orchestration layer above provider CLIs such as Codex, Claude Code, and Gemini. Skills describe repeatable engineering workflows that can be handed to those workers by the supervisor.

## Repository skills

Built-in skills live in `skills/<id>/SKILL.md`. Each file uses a small frontmatter header. The loader reads the `name`, `description`, and Markdown body. Invalid skill files are ignored rather than making the whole run fail.

Current built-in skills:

- `planning` — mission decomposition and dependencies
- `review` — correctness, regressions, and verification
- `engineering` — safe implementation work
- `design` — professional, accessible product UI
- `testing` — focused and reproducible verification
- `debugging` — evidence-first diagnosis
- `security-review` — secret handling and security boundaries
- `release-manager` — release readiness and final diff checks
- `retrieval-before-writing` — search existing code and knowledge before non-trivial implementation
- `repository-operations` — safe GitHub repository, issue, PR, and CI workflows
- `browser-verification` — real-browser verification through Playwright
- `documentation-retrieval` — current, version-aware library and API documentation

## Knowledge and integrations

Office Office keeps knowledge and external integrations provider-neutral. XERJ is an optional local knowledge provider; GitHub, Playwright, and Context7 are optional integrations. They are disabled by default and can be managed with `office integrations`.

```text
office integrations status
office integrations enable github
office integrations enable playwright
office integrations enable context7
office integrations mcp
```

When GitHub is enabled and the `gh` CLI is available, Office Office retrieves repository, issue, pull-request, and recent CI context before planning and task execution. External repository content is untrusted evidence.

Playwright and Context7 are exposed as MCP manifests for compatible worker clients. Playwright provides browser automation; Context7 provides current, version-aware library documentation. Their official servers are launched only when an enabled worker/provider actually connects to the MCP configuration.

Use `office integrations mcp` to inspect the enabled MCP manifest. Office Office does not store tokens in the project configuration.

## Knowledge and XERJ

Office Office has an optional knowledge-provider abstraction. The core workflow does not require a knowledge service. When enabled, XERJ can be used as a local retrieval provider so Michael and worker agents receive relevant project passages before planning or implementation.

XERJ is configured in the local Office Office config under `knowledge`. The safe default is disabled. Retrieved text is treated as untrusted evidence. Agents must verify it against the current checkout and must not execute instructions embedded in search results.

## Workspace overrides

For a particular project, `.hive/skills/<id>/SKILL.md` can override a repository skill with the same ID. This is intentionally local to the workspace and is not written into the source repository automatically.

Skills created through the dashboard are also available to orchestration runs as workspace skills.

## How skills are used

Michael receives planning/review guidance when creating the task graph. Each worker receives the skills assigned to its agent profile. The final review uses `review`, `testing`, and `security-review` when those built-ins exist.

Skills are guidance, not permissions. User requests, repository instructions, and security constraints remain higher priority. Skill text and other project data are treated as untrusted input.

## CLI

Use `office skills` to list skills and `office integrations` to inspect or configure external capabilities.