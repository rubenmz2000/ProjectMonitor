# Domain model: conceptual state

This document separates what is **decided**, what is **implemented**, and what is still **open**.
Do not treat the conceptual parts as implemented; check [current-state.md](current-state.md) and
the code.

## Issue

Concept: a generic unit of work. Not limited to software development; it can represent
programming, hardware, research, documentation, configuration, testing or other kinds of work.
It is the persistent source of truth about that work.

Decided:

- An issue belongs to a project.
- Technical identity is an immutable GUID. A human identifier is computed from the project's
  prefix and a per-project sequential number (`PM-001`). Prefixes are unique among active projects.
- Who created the issue (reporter) is recorded.
- An issue may be unassigned. The assignee is whoever currently has the responsibility to move it
  forward, and may be a human or an agent.
- State and assignment are independent dimensions.

- The name is `Issue`, in code, database, API, UI and docs (decided in PM-0006; the entity was
  previously called `ProjectTask`).
- The description has no length limit: it is where the persistent context of the issue lives.

Implemented today: title, description, status (`ToDo`, `InProgress`, `Blocked`, `Done`,
`Cancelled`), priority, due date, creator, assignee, soft delete. Status is set to `ToDo` on
creation and there is no way to change it yet. These states are **provisional**.

Open:

- Definitive workflow: states, their meaning as phases, and allowed transitions.
- What an issue must contain to be a real source of truth (context, decisions, pending items,
  acceptance...) and which of those belong directly to the issue vs. to related entities.

## Actor and assignment

Concept: actors are the parties that create, own and move work. They are not only people; Iris
participates as an actor of the system.

Decided and implemented (PM-0005):

- `Actor { Id, Kind (Human | Agent), DisplayName, Identifier (unique), IsActive }`.
- Rubén (`ruben`, Human) and Iris (`iris`, Agent) are seeded by migration.
- Issues have a required `CreatedBy` and an optional `Assignee`, both actors.
- The acting actor is identified by an `X-Actor-Identifier` HTTP header. This is a transitory
  mechanism, explicitly meant to be replaced by real authentication. Since PM-0007 it is
  mandatory on every issue mutation (create, assign, comment) and every change is attributed to
  the resolved actor.

Open:

- Real authentication/identity for actors (a prerequisite for letting Iris act autonomously).
- Which actions Iris may perform autonomously and which require human approval.

## Session

Concept: a concrete execution of Iris working on an issue. Sessions are disposable: they can end,
lose their context or be replaced. An issue can use several sessions over its life.

Decided (direction only, nothing implemented):

- A session must be able to continue work from the persistent state in Project Monitor.
- A session should return a structured result (conceptual examples: work completed; needs feedback
  or a decision; blocked; needs a human test or action; found information that changes the
  approach; proposes changing the plan). Project Monitor interprets and stores the result and
  decides what follows; the session does not change the workflow arbitrarily.

Open:

- The Session model itself and what is persisted per session.
- How a session is technically started or resumed, and the conditions that allow Project Monitor
  to do so.
- The exact shape of the result a session returns.
- How Project Monitor provides context to a new session.

## Issue activity (history)

Concept: an append-only record of what happened to an issue — who did it, when, and what. The
issue keeps its current state; activities explain how it got there and are the persistent base
on which handoffs, sessions and other history will be built.

Decided and implemented (PM-0007):

- `IssueActivity { Id, IssueId, ActorId, OccurredAt, Type, OldValue?, NewValue?, Body? }`.
  Never updated or deleted.
- Structured: type, actor, timestamp, old/new value. Text: `Body` (a comment, or an optional note
  attached to a change). Text is never parsed.
- Types today: `Created` (also backfilled for pre-existing issues), `AssigneeChanged`
  (old/new value = actor id or null for unassigned) and `Comment`. A reassignment to the same
  assignee records nothing; a comment is the way to leave text without a change.
- New activity types are added only when a producer exists (e.g. a status change endpoint).
- Read through `GET /api/issues/{id}/activity`, in chronological order, with values resolved to
  labels by the API.

Open:

- How a `Session` relates to issues and activities is not designed. It might reference
  activities, own them, or be a separate model; nothing is assumed yet.
- Whether structured metadata (JSON) or links to external artifacts (commits, PRs) belong on the
  activity or elsewhere.

## Handoffs and related concepts

Decided (direction): responsibility passes explicitly between Iris and Rubén, and those handoffs
are represented in Project Monitor rather than remembered from a conversation. Today a handoff
can be expressed as a reassignment with a note; that is a stepping stone, not the model.

Open:

- How handoffs are represented (operation, activity entry, state, combination...).
- Whether `Decision`, `Approval`, `Artifact` and similar need their own models.
- Integration architecture with Iris and with GitHub (commits, PRs, builds, deployments).
- Definitive navigation and screens.

## Summary table

| Area | Decided | Implemented | Open |
| --- | --- | --- | --- |
| Issue identity (GUID + `PREFIX-NNN`) | yes | yes | — |
| Reporter / assignee as actors | yes | yes | — |
| State ≠ assignment | yes | data model only | states, transitions, endpoint |
| `Issue` naming | yes | yes | — |
| Actor identity | transitory header | partial | real authentication |
| Issue activity | yes | yes (Created, AssigneeChanged, Comment) | metadata, external links |
| Session | direction | no | model, start, result, relation to activity |
| Handoffs | direction | reassignment + note only | representation, models |
