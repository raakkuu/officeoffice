# Office Office: Agent Collaboration Architecture

Status: design specification; implementation is tracked in [Issue #1](https://github.com/raakkuu/officeoffice/issues/1).

## Product goal

Office Office should behave like a local-first AI company. Michael is the supervisor/CEO. He plans work, recruits or activates the specialists needed for a task, coordinates their work, and reviews the final result. Specialist agents must be able to exchange useful information and artifacts instead of acting as isolated subprocesses.

This document describes the intended architecture. It does not claim these capabilities are already implemented.

## Core concepts

### Agent profiles

Agent profiles are user-manageable records rather than a fixed list of four hard-coded workers. A profile contains:

- Stable ID and display name
- Role, specialty, and system instructions
- Provider ID and optional model
- Assigned skills
- Allowed tools, workspace access, and network permissions
- Optional per-agent and per-run budgets

Michael may propose new agents for a task, but creating or running them must respect user policy, resource limits, provider limits, and the configured maximum concurrency. The starter Michael/Dwight/Pam/Jim profiles remain useful defaults, not a product limit.

### Tasks and delegation

Tasks form a dependency-aware project graph. Each task has an owner, status, dependencies, input references, output artifact references, retry count, timestamps, and error details. Michael should delegate bounded tasks with clear expected outputs. Agents must not be allowed to spawn unlimited work recursively.

Every run should have limits for elapsed time, model/provider calls, parallel tasks, and agent creation. Users can cancel a run and inspect why a task failed or was blocked.

### Agent message bus

Agent communication should use persisted, structured messages, not only shared prompt text. A message contains:

- Message ID, project/run/task IDs
- Sender and recipient (agent ID, room ID, or supervisor)
- Message type: request, response, question, handoff, progress, finding, review, or decision
- Human-readable body and optional structured payload
- References to relevant artifacts
- Creation timestamp and delivery/status metadata

Messages are delivered through a local message service and stored in the project's local state. Agents should receive only messages relevant to their assignments and permissions. Credentials and secrets must be redacted before messages are persisted or displayed.

### Shared project knowledge and artifacts

Agents can publish findings, source notes, decisions, files, reports, test results, and code changes as named artifacts. Each artifact records its producer, timestamp, task/run association, source references when available, and visibility.

Use explicit scopes:
- **Private notes:** visible only to the owning agent and supervisor where required.
- **Project shared:** available to authorized agents in that project.
- **User approved export:** leaves the local project only after an explicit action.

Agents should reference artifacts by ID instead of repeatedly copying entire transcripts. The shared workspace must not silently expose arbitrary files outside the configured project root.

## Rooms

Rooms are visible collaboration sessions in the local dashboard. They are not evidence of background activity unless model calls are actually running.

### Meeting Room

A meeting is a bounded, user-visible session with a topic, selected participants, and a clear objective. Michael can invite relevant agents to contribute. The facilitator asks for evidence, identifies disagreement, requests follow-up when necessary, and produces a decision record with action items and owners.

Required controls:
- Start, pause, resume, and end
- Add/remove participants
- Set a topic and context/artifact references
- View the live transcript and per-agent status
- Set turn, time, and provider-call budgets
- Stop runaway discussions
- Save the decision summary and action items to the project

### Cafeteria

The Cafeteria is an optional, lightweight team space for user-triggered status exchange or bounded informal conversation. It must not run an endless autonomous chat loop or make provider calls merely to animate a room. Clearly distinguish simulated/persisted conversation from currently executing model calls. Users can disable it entirely.

Additional rooms such as Engineering, Research, Marketing, and QA can use the same room model with different templates and default participants.

## Dashboard information architecture

Planned dashboard areas:

1. **Overview:** health, current run, recent tasks, configured providers, and errors.
2. **Agents:** create/edit profiles, choose provider/skills, inspect availability and task history.
3. **Projects:** tasks, dependencies, artifacts, shared notes, and decisions.
4. **Rooms:** Meeting Room, Cafeteria, transcript, participants, and action items.
5. **Skills:** browse, install, edit, assign, and disable skills.
6. **Connections:** provider setup and safe connection tests.
7. **Settings:** concurrency, budgets, permissions, retention, and local workspace.

Every navigation item must lead to a real working view or be visibly marked as planned/disabled. Empty states and API failures should be explained rather than silently appearing broken.

## Skills

Skills are reusable, versioned instruction/tool bundles that agents can be assigned. A skill should define its purpose, instructions, allowed tools, input/output expectations, dependencies, risk level, and examples. Installing a skill must not automatically grant access to sensitive files or unrestricted shell/network permissions. Third-party skills should be inspectable before activation.

Initial skill groups may include software engineering, testing, research, documentation, data analysis, design, marketing, finance, and domain-specific research. Medical/legal/scientific skills must be presented as assistance and research support, not as a substitute for qualified professional judgment.

## Persistence and local-first operation

Use a versioned local state schema for agent profiles, projects, tasks, messages, rooms, artifacts, and decisions. Keep secrets in a separate credential mechanism; never persist API keys in task JSON, logs, transcripts, project artifacts, or Git. Provide migration handling and back up user state before schema changes.

The local dashboard should bind to loopback by default. Any remote-access mode requires deliberate configuration and authentication. Treat all external content and agent-generated text as untrusted input when passed to tools.

## Safety and reliability requirements

- Enforce configured workspace boundaries and explicit tool permissions.
- Ask before destructive operations, external data uploads, or sensitive exports.
- Apply message-size limits, timeouts, cancellation, retry ceilings, and per-run budgets.
- Prevent agent loops and unbounded recursive delegation.
- Redact secrets from provider output, errors, logs, and transcripts.
- Record provenance for findings and decisions; separate verified facts from hypotheses.
- Make data retention and deletion inspectable by the user.
- Never claim an agent is active when it is not executing.

## Implementation sequence

### Phase 1 — Reliability and observability
Fix repeated terminal/banner/output rendering, duplicate task execution, configuration readability, dashboard navigation, API error display, and provider login diagnostics. Add regression tests before expanding orchestration.

### Phase 2 — Persistent collaboration primitives
Implement versioned agent profiles, message records, artifact references, project-shared knowledge, and tests for access control and persistence.

### Phase 3 — Dynamic delegation and skills
Move from a hard-coded roster to user-managed profiles, a skill registry, and bounded dynamic team selection. Keep a safe default team for new installations.

### Phase 4 — Rooms
Add meeting lifecycle, participant selection, transcripts, decision records, and action items. Add the Cafeteria only as a bounded opt-in session.

### Phase 5 — Dashboard and provider experience
Connect the UI to real APIs for agents, skills, rooms, tasks, credentials, and diagnostics. Ensure every visible control has a working action and every unfinished area is clearly labeled.

### Phase 6 — Validation and packaging
Run unit/integration tests, CI, migration tests, and local smoke tests. Document the update procedure and eventually add an opt-in updater with backups, release notes, and rollback guidance.

## Acceptance checklist

- [ ] Two real agents can exchange messages during one run.
- [ ] An agent can publish an artifact and another authorized agent can consume it by reference.
- [ ] Michael can delegate to a dynamically selected team within configured limits.
- [ ] Users can create, edit, disable, and assign agent profiles and skills.
- [ ] A Meeting Room can be started and ended, and saves decisions and action items.
- [ ] Cafeteria sessions are opt-in, bounded, cancellable, and transparent about actual model activity.
- [ ] No runaway message/delegation loop can exceed configured budgets.
- [ ] Secrets are absent from persisted messages, logs, project files, and Git.
- [ ] Dashboard navigation and error states are tested.
- [ ] Existing CLI workflows and local configuration remain compatible through migrations.
