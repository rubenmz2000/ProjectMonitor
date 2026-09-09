# Current state (as of PM-0007)

What actually exists in the repository. Update this when an issue is merged; keep it a snapshot,
not a changelog (the git history is the changelog).

## Completed issues

| Issue | Outcome |
| --- | --- |
| PM-0001 | Stabilisation of the initial state (TypeScript compilation, existing features completed) |
| PM-0002 | Project list and creation |
| PM-0003 | Tasks per project (renamed to issues in PM-0006): GUID identity, sequential number per project, configurable prefix, computed identifier `PREFIX-NNN`, data migration |
| PM-0004 | Detail view reached by human identifier (`/issues/PM-001`) |
| PM-0005 | `Actor` model (Human/Agent), `CreatedBy` and `Assignee`, actor header, assignee change |
| PM-0006 | Rename `ProjectTask` → `Issue` everywhere (code, database via rename migration, API, UI, docs); description length limit removed |
| PM-0007 | `IssueActivity` append-only history (`Created`, `AssigneeChanged`, `Comment`), actor mandatory on all issue mutations, comments and activity endpoints, activity panel in the issue detail |

PM-0001 to PM-0003 were numbered provisionally, before Project Monitor could manage its own
workflow.

## Backend

- Entities: `Project`, `Issue`, `Actor`, `IssueActivity`. Enums stored as strings.
- `Project`: name, description, `IssuePrefix` (max 5, unique among non-deleted projects, auto-suggested
  from the name), status (`NotStarted`, `InProgress`, `Paused`, `Completed`, `Archived`), soft delete.
- `Issue`: `IssueNumber` (unique per project), title (50), description (no limit), status
  (`ToDo`, `InProgress`, `Blocked`, `Done`, `Cancelled`), priority, due date, `CreatedById`
  (required), `AssigneeId` (optional), soft delete. Identifier `PREFIX-NNN` is computed, not stored.
- `Actor`: kind, display name, unique identifier, active flag. Seeded: Rubén (`ruben`), Iris (`iris`).
- Endpoints:
  - `GET/POST /api/projects`, `GET /api/projects/{id}`, `GET /api/projects/latest`,
    `GET /api/projects/status-count`, `PUT/DELETE /api/projects/{id}`
  - `GET/POST /api/projects/{projectId}/issues` (POST requires `X-Actor-Identifier`)
  - `GET /api/issues/{PREFIX-NNN}`, `PATCH /api/issues/{PREFIX-NNN}/assign` (`{ assigneeId, note? }`, requires actor)
  - `GET /api/issues/{PREFIX-NNN}/activity`, `POST /api/issues/{PREFIX-NNN}/comments` (requires actor)
  - `GET /api/actors` (active actors)
- `IssueActivity`: actor, timestamp, type, old/new value (max 100), body (no limit); index on
  `(IssueId, OccurredAt)`. `Created` was backfilled for existing issues.
- The acting actor is resolved by `ICurrentActorResolver` from the `X-Actor-Identifier` header.
- Migrations are applied automatically at startup. No tests, no CI.

## Frontend

- Routes: `/` (dashboard), `/projects`, `/projects/:projectId/issues`, `/issues/:issueIdentifier`.
- Navigation: Dashboard and Projects only.
- Actor identity is injected on state-changing requests from `VITE_ACTOR_IDENTIFIER`.
- The UI is provisional; RMZ-UI is a CSS theme file plus Navbar/Footer, and MUI runs with its
  default palette.

## Known gaps and rough edges

- No way to change an issue's status or edit its fields after creation (backend or frontend).
- The actor header is trusted as-is; there is no authentication.
- `IssueNumber` is computed as MAX+1 without a transaction (concurrent creation can fail on the
  unique index).
- The issue list endpoint returns the `DateTime.MinValue` sentinel for issues with no due date.
- API base URL is hardcoded in the frontend; the frontend `.env` is committed.
