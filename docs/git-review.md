# Git review workflow

Office Office should treat generated changes as reviewable work, not automatically trusted work.

## Recommended flow

1. Run a mission in a clean or backed-up working tree.
2. Inspect the mission and task errors in the dashboard.
3. Run `git status --short`.
4. Run `git diff --check` to catch whitespace errors.
5. Inspect `git diff` and confirm only expected files changed.
6. Run the target project's tests, type checks, and build.
7. Only after review, commit and push the changes.
8. Open a pull request and wait for CI and review before merging.

GitHub status checks are useful merge gates: a required check must pass on the relevant pull-request commit before a protected branch can be merged.

## Recovery after failure

If an agent or test fails:

- preserve the failure message and changed files;
- do not silently discard unrelated user work;
- inspect the diff before retrying;
- retry only the failed or dependent task when safe;
- rerun verification after recovery;
- if recovery would require destructive or irreversible action, stop and ask for explicit approval.

A successful provider exit code is not proof that the resulting code is correct.
