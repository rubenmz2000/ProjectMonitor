# UI architecture

Direction approved in September 2026 (PM-0008): Jira-like in structure and utility, Project
Monitor in identity and purpose. This document records the decisions the frontend is built on
and the shape of the screens to come. Screens that do not exist yet are direction, not spec.

## Principles

- **Dense work application, not a landing page.** A persistent frame (sidebar, top bar,
  content), tables over card lists, and an issue that is a workspace, not a record card.
- **The UI only shows what exists.** No placeholders for Sessions, repositories, builds or
  deployments. The architecture leaves room for them (navigation sections, tabs, activity types),
  the screens do not.
- **RMZ-UI is reusable.** Tokens, the MUI theme and the generic shell components live in
  `src/rmz-ui/` and know nothing about projects, issues, actors or Iris. Application-specific
  composition lives in `src/app/`. RMZ-UI is not a separate package yet, but it must stay
  extractable.
- **Colors come from the theme, never from per-component patches.** MUI runs with a real dark
  theme built from the RMZ-UI tokens; `sx` color overrides, `!important` and `color: inherit`
  workarounds are not accepted.

## Frontend layers

```
src/rmz-ui/            Reusable (generic) — tokens, theme, shell, feedback
  theme/tokens.ts        Single source of truth: colors, fonts, spacing, radius, layout sizes
  theme/createRmzTheme   MUI dark theme derived from the tokens
  theme/RmzThemeProvider ThemeProvider + CssBaseline + CSS custom properties (--bg, --text, ...)
  shell/                 AppShell (grid), Sidebar (data-driven sections), TopBar, Breadcrumbs, Brand
  feedback/              AlertProvider / useAlert (snackbar notifications)
src/app/               Project Monitor composition
  shell/ProjectMonitorShell  Sidebar sections, breadcrumbs and current actor for this app
  shell/RouteProject*        Resolves the project of the current route (by prefix)
  shell/CurrentActorChip     Who the app is acting as (from VITE_ACTOR_IDENTIFIER, for now)
src/pages/, src/components/, src/models/, src/serivces/   Feature code (pages are still provisional)
```

Plain CSS files may use the CSS custom properties (`var(--text-muted)`, `var(--space-4)`...);
MUI components get their colors from the theme. Both come from `tokens.ts`.

## Navigation

- Left sidebar is the main navigation: a global section (Dashboard, Projects) and, when the
  route belongs to a project, a contextual section for that project. Sections are data, so
  future areas are new entries, not new components.
- Top bar: breadcrumbs (Projects › Project › Issue) on the left, the current actor on the right.
- URLs use the project's human prefix; the GUID stays internal:
  - `/` dashboard
  - `/projects`
  - `/projects/:prefix` (redirects to the project's issues until the project page exists)
  - `/projects/:prefix/issues`
  - `/issues/:identifier` — the identifier carries the project, so the shell derives context
    from it; the route is not duplicated under `/projects`.
- The API resolves a project by prefix (`GET /api/projects/{prefix}`).

## Screens (direction)

**Projects / Dashboard.** A dense list (table or grid) with prefix, status and issue counts.
The current dashboard (recent projects + status pie) is provisional and will be replaced.

**Project page.** Header with name, prefix, status and description; a list of issues as a
table with search, filters (status, assignee, priority) and sorting, done client-side while
volumes are small. The concrete structure of the page (tabs, overview content) is decided in the
issue that builds it, not here.

**Issue workspace.** Two columns. Left, *what the issue is and what happened*: identifier and
title, the description as real content (it is the source of truth), and the activity timeline
with a comment composer. Right, *what state it is in*: status (read-only badge until real
status changes exist), assignee (with an optional note on change), priority, reporter, dates,
project. New activity types render through a `type → renderer` map so adding one is an entry,
not a redesign.

## Open questions

- Where Sessions / Iris will appear (a tab next to Activity, a block in the state column, or
  elsewhere) — decided together with the Session model.
- Whether RMZ-UI becomes a separate package, and when.
- The final dashboard / "my work" content, which depends on cross-project queries and on how
  handoffs end up being modelled.
