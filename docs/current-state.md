# Current state (as of PM-0010)

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
| PM-0008 | UI foundation: RMZ-UI tokens + MUI dark theme, app shell (sidebar, top bar, breadcrumbs, current actor), alert context, project routes by prefix |
| PM-0009 | Projects and Home redesigned on the PM-0008 app shell: Projects is a dense table (prefix, status, per-status issue breakdown, updated) with search; Home is a real overview (stat tiles, projects/issues status breakdowns, recent projects), replacing the recharts pie chart |
| PM-0010 | Project workspace: shared project layout and header (no tabs), issues as a dense table with search, filters and sorting kept in the URL, issue creation integrated in the header |

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
  - `GET /api/projects/{prefix}` (project by issue prefix)
  - `GET /api/actors` (active actors)
- `IssueActivity`: actor, timestamp, type, old/new value (max 100), body (no limit); index on
  `(IssueId, OccurredAt)`. `Created` was backfilled for existing issues.
- The acting actor is resolved by `ICurrentActorResolver` from the `X-Actor-Identifier` header.
- Migrations are applied automatically at startup. No tests, no CI.

## Frontend

- Routes: `/` (dashboard), `/projects`, `/projects/:prefix` (project workspace layout; index
  redirects to issues), `/projects/:prefix/issues`, `/issues/:issueIdentifier`.
- App shell (`src/app/shell`): left sidebar with global navigation plus a contextual section for
  the project of the current route, top bar with breadcrumbs and the current actor chip.
- RMZ-UI (`src/rmz-ui`): tokens, MUI dark theme via `RmzThemeProvider`, generic shell
  components and `useAlert()`; no application concepts inside.
- Actor identity is injected on state-changing requests from `VITE_ACTOR_IDENTIFIER` and shown
  in the top bar.
- Dashboard and Projects are redesigned (PM-0009) on RMZ-UI: Projects is a dense, searchable
  table; Home is an overview with stat tiles, projects/issues status breakdowns (`StatusBar`)
  and a recent-projects panel. Both derive their data client-side via `useProjectsOverview`
  (fetches every project's issues; no aggregate endpoint yet).
- Project workspace (PM-0010): `ProjectWorkspace` layout with the project header (prefix, name,
  status, description, issue breakdown) and issue creation; the issues page is a dense table with
  search, status/assignee/priority filters and column sorting, client-side and kept in the URL.
  Issues without a due date (the `DateTime.MinValue` sentinel) are shown as "—".
- The issue detail is still the provisional page; it is redesigned in PM-0011.

## Known gaps and rough edges

- No way to change an issue's status or edit its fields after creation (backend or frontend).
- The actor header is trusted as-is; there is no authentication.
- `IssueNumber` is computed as MAX+1 without a transaction (concurrent creation can fail on the
  unique index).
- The issue list endpoint returns the `DateTime.MinValue` sentinel for issues with no due date.
- API base URL is hardcoded in the frontend; the frontend `.env` is committed.
- Per-project and total issue counts on Projects/Home are computed client-side by fetching
  every project's issues; there is no aggregate endpoint. Fine while the number of projects
  stays small, but it is N+1 requests.
