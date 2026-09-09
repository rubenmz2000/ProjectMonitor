# Current state (as of PM-0005)

What actually exists in the repository. Update this when an issue is merged; keep it a snapshot,
not a changelog (the git history is the changelog).

## Completed issues

| Issue | Outcome |
| --- | --- |
| PM-0001 | Stabilisation of the initial state (TypeScript compilation, existing features completed) |
| PM-0002 | Project list and creation |
| PM-0003 | Tasks per project: GUID identity, `TaskNumber` sequence per project, configurable `TaskPrefix`, computed identifier `PREFIX-NNN`, data migration |
| PM-0004 | Task detail view reached by human identifier (`/issues/PM-001`) |
| PM-0005 | `Actor` model (Human/Agent), `CreatedBy` and `Assignee` on tasks, actor header, assignee change |

PM-0001 to PM-0003 were numbered provisionally, before Project Monitor could manage its own
workflow.

## Backend

- Entities: `Project`, `ProjectTask`, `Actor`. Enums stored as strings.
- `Project`: name, description, `TaskPrefix` (max 5, unique among non-deleted projects, auto-suggested
  from the name), status (`NotStarted`, `InProgress`, `Paused`, `Completed`, `Archived`), soft delete.
- `ProjectTask`: `TaskNumber` (unique per project), title (50), description (300), status
  (`ToDo`, `InProgress`, `Blocked`, `Done`, `Cancelled`), priority, due date, `CreatedById`
  (required), `AssigneeId` (optional), soft delete. Identifier `PREFIX-NNN` is computed, not stored.
- `Actor`: kind, display name, unique identifier, active flag. Seeded: Rubén (`ruben`), Iris (`iris`).
- Endpoints:
  - `GET/POST /api/projects`, `GET /api/projects/{id}`, `GET /api/projects/latest`,
    `GET /api/projects/status-count`, `PUT/DELETE /api/projects/{id}`
  - `GET/POST /api/projects/{projectId}/tasks` (POST requires `X-Actor-Identifier`)
  - `GET /api/issues/{PREFIX-NNN}`, `PATCH /api/issues/{PREFIX-NNN}/assign`
  - `GET /api/actors` (active actors)
- Migrations are applied automatically at startup. No tests, no CI.

## Frontend

- Routes: `/` (dashboard), `/projects`, `/projects/:projectId/tasks`, `/issues/:taskIdentifier`.
- Navigation: Dashboard and Projects only.
- Actor identity is injected on state-changing requests from `VITE_ACTOR_IDENTIFIER`.
- The UI is provisional; RMZ-UI is a CSS theme file plus Navbar/Footer, and MUI runs with its
  default palette.

## Known gaps and rough edges

- No way to change a task's status or edit its fields after creation (backend or frontend).
- Assignee changes are not attributed to an actor and nothing keeps history beyond `UpdatedAt`.
- The actor header is trusted as-is; there is no authentication.
- `TaskNumber` is computed as MAX+1 without a transaction (concurrent creation can fail on the
  unique index).
- The task list endpoint returns the `DateTime.MinValue` sentinel for tasks with no due date.
- API base URL is hardcoded in the frontend; the frontend `.env` is committed.
- Naming is mixed: `ProjectTask`/`Tasks` in code and database, `issues` in routes and UI.
