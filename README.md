# Project Monitor

Project Monitor is the working hub for RMZ Softwares projects and for **Iris**, the AI agent that
works on them. It is not meant to be another task tracker or a Jira clone: the goal is to bring
into one place the things that are normally spread across issues, documentation, repositories,
commits/PRs, agent sessions, approvals, activity, builds/tests and deployments. GitHub keeps
providing repository infrastructure underneath; Project Monitor is meant to become the everyday
interface.

**Guiding principle: sessions are disposable, project knowledge and state are not.**
A session of Iris (or any agent) may end, lose its context or be replaced. Everything needed to
understand and continue the work must live in Project Monitor, not in a conversation.

See [`docs/`](docs/README.md) for product vision, the conceptual model and what is decided vs. open.
Agents working on this repository must read [`AGENTS.md`](AGENTS.md) first.

## Repository layout

```
ProjectMonitor.sln
src/back/
  ProjectMonitor.Core/        Entities, enums, DTOs, IRepository<T>
  ProjectMonitor.DataAccess/  EF Core DbContext, IEntityTypeConfiguration, repositories, migrations
  ProjectMonitor.API/         ASP.NET Core Web API (controllers, Program.cs, Dockerfile)
src/front/rmz-project-monitor/  React + Vite + TypeScript frontend
docs/                         Product and project documentation
AGENTS.md                     Rules for agent sessions working on this repo
```

## Stack

- Backend: .NET 10, ASP.NET Core Web API, EF Core 10 with SQL Server. Repository pattern over
  `IQueryable`, Fluent API configurations, code-first migrations applied automatically on startup.
- Frontend: React 19, TypeScript, Vite, MUI, axios, dayjs, recharts. Package manager: pnpm.
- UI: **RMZ-UI** (`src/rmz-ui/`): design tokens, a MUI dark theme built from them, and generic
  shell components (sidebar, top bar, breadcrumbs, alerts). Reusable by design: nothing in it
  knows about Project Monitor concepts. Not a separate package yet. See
  [`docs/ui-architecture.md`](docs/ui-architecture.md).

## Running in development

### Backend

Requires the .NET 10 SDK and a reachable SQL Server. Configuration is read from the standard
`appsettings*.json` files (never committed with real credentials) and needs:

- `ConnectionStrings:DefaultConnection`
- `CorsOrigins` (array of allowed frontend origins)

```
dotnet run --project src/back/ProjectMonitor.API
```

The `http` launch profile listens on `http://localhost:5023`. Pending EF Core migrations are
applied on startup. OpenAPI is mapped only in the `Development` environment.

### Frontend

```
cd src/front/rmz-project-monitor
pnpm install
pnpm dev
```

The frontend expects the API at `http://localhost:5023/api` (hardcoded in `src/serivces/ApiService.ts`
for now). Copy `.env.example` to `.env` and set `VITE_ACTOR_IDENTIFIER` to the identifier of the
actor you are acting as (`ruben` or `iris`). This header-based identity is a temporary stand-in
for real authentication.

`pnpm build` runs the TypeScript build and the Vite production build.

## Current state (short)

Projects can be created and listed; each project has an issue prefix. Issues can be created and
listed per project, have a stable GUID plus a human identifier like `PM-001`, a status, a priority,
a creator and an optional assignee. Actors can be humans or agents (Rubén and Iris are seeded). An
issue detail view allows changing the assignee, commenting, and shows the issue's activity
(append-only history of creation, reassignments and comments, attributed to an actor). There is
no endpoint yet to change an issue's status or edit it, no session/handoff model, and the UI is
provisional.

Details and history: [`docs/current-state.md`](docs/current-state.md).
