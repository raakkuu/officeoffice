# Git review and recovery

Office Office keeps Git-changing actions explicit. The orchestrator does not commit, push, merge, or delete branches unless the user explicitly authorizes that action.

## Review a mission result

From the target repository:

```bash
office review
```

Use `office review --diff` when you also want the full tracked diff. The command is read-only and shows the current branch, working-tree state, changed files, diff statistics, and the recommended verification commands.

GitHub pull requests provide the next review layer: inspect the Files changed tab, checks, dependency findings, and review comments before merging. GitHub's documented review workflow supports comments, suggestions, approvals, and requests for changes. url references are intentionally not used inside repository files.

## Failure recovery

Each task already records its attempt count. The orchestrator now automatically retries a failed task once. A task that fails twice remains failed, and tasks depending on it become `blocked` instead of hanging indefinitely.

The run remains in `.hive/runs/` with task errors and attempt counts so a later run or human can diagnose the failure.

## What recovery does not do

Recovery does not blindly retry forever, reset the working tree, discard changes, or rewrite Git history. A failed task may have partially changed files, so review the diff before retrying a mission that failed after making edits.
