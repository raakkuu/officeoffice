# Git review and recovery

Office Office treats generated changes as reviewable work. It does not commit, push, merge, reset, or delete branches automatically.

## Review a mission

From the target project:

```bash
office review
```

Use `office review --diff` to include the full tracked diff. The command is read-only and reports the current branch, working-tree state, changed files, and diff statistics, followed by recommended verification commands.

## Recovery after failure

A failed task is retried at most once. If the second attempt fails, dependent queued tasks are marked `blocked` instead of hanging forever. Unrelated queued work remains eligible to run.

Task attempts, errors, and run state are stored under `.hive/runs/` so failures can be inspected later.

Recovery never resets the working tree, discards unrelated changes, rewrites Git history, or retries indefinitely. A failed task may have partially edited files, so review the diff before asking Office Office to continue.

## Recommended review flow

1. Inspect the mission result and task errors.
2. Run `office review`.
3. Run the project's type checks, tests, and build.
4. Inspect the final diff.
5. Commit and push only after the changes are understood.
6. Use the normal pull-request review and CI process before merging.
