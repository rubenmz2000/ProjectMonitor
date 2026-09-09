# Development workflow

This is the workflow currently in use. Project Monitor is not yet used operationally to manage
its own development; work items are numbered `PM-000X` by hand and tracked in conversation and
git history.

```
develop → Issue/Task → branch (or worktree) → implementation → PR → human review → squash merge → cleanup
```

- `develop` is the base branch. Nothing is committed directly on it.
- Each piece of work is an issue with an identifier `PM-000X` and a scope. The branch and the PR
  belong to that issue and stay within its scope.
- Squash merge into `develop`. The resulting commit title follows the pattern
  `PM-000X: Short description (#PR)`; commits inside the branch use conventional-commit style
  such as `feat(PM-0005): ...` or `fix: ...`.
- After the merge, the branch (and worktree, if any) is deleted.
- Review is human: Rubén reviews every PR before merging, whether it was written by him or by an
  agent.

Housekeeping work that is not a product issue (documentation, repository hygiene) follows the
same branch → PR → review → squash merge path with a descriptive branch name (e.g. `chore/...`).

## Practical notes

- Database changes go through EF Core migrations that must work on an existing database with
  data (see the migrations in `src/back/ProjectMonitor.DataAccess/Migrations` for the pattern:
  add nullable, backfill, then constrain).
- Local, uncommitted changes in the working tree may belong to the developer (for example a
  launch profile switched to another environment). They are not part of any issue and must not be
  reverted, modified or committed by someone else.
- `appsettings.json` holds local credentials and is git-ignored. Do not read it, print it, or
  commit it.
