# Instructions for agent sessions

These rules apply to any agent (Iris, Claude, others) working on this repository. They exist so
that a new session can work without the basics being repeated every time. Keep them short.

## Before working

1. Read `README.md`, `docs/README.md` and the docs relevant to the task, in particular
   `docs/current-state.md` and `docs/domain-model.md`.
2. Work from the real state of the repository. The conceptual design in `docs/` is direction, not
   implementation: never assume something is implemented because it is described there.
3. Check the repository state (`git status`, current branch, recent log) before touching anything.
   Note any local changes that are already there: they are not yours.

## Branching and delivery

- `develop` is the base branch. Never commit directly on it.
- Every piece of work follows: Issue → branch (or worktree) → implementation → PR → human review
  → squash merge → cleanup. See `docs/development-workflow.md`.
- One issue, one branch, one PR, one scope. Do not fold unrelated work into it.
- Prepare the PR for a human reviewer; do not merge.

## Scope discipline

- Keep changes limited to what the issue asks for. No redesigns, refactors, renames or "while
  we're here" improvements that were not requested; if you spot something, mention it instead.
- Do not start features that are still open questions in `docs/domain-model.md`.
- The UI is being rebuilt issue by issue (see `docs/ui-architecture.md`): do not do isolated
  visual redesigns outside that plan, keep `src/rmz-ui/` free of application concepts, and take
  colors from the theme/tokens — no per-component color patches.

## Other people's changes and local environment

- Do not mix the developer's local changes with yours. Stage and commit only the files your task
  touched.
- Do not revert, modify or commit changes you did not make without explicit authorisation.
- `appsettings.json` contains local credentials: do not open, read, search, print or commit it.

## After working

- Review the full diff of the branch before considering it done: it must contain only the changes
  of the task.
- Check the repository state again (`git status`) and make sure nothing unrelated is staged or
  left behind.
- If your change or a decision taken during the task makes any document in `README.md` or `docs/`
  obsolete, update it in the same PR.
