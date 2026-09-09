# Product vision and principles

## What Project Monitor is

Project Monitor is meant to become the working hub for Rubén's projects and for Iris, his AI
assistant/agent. It is not just a task manager and not a Jira clone. The intention is to bring
progressively into one application the functions that are normally spread across issues,
documentation, repositories, commits/PRs, agents, conversations, approvals, activity, builds/tests,
deployments and model usage/costs.

GitHub can keep acting as repository infrastructure; Project Monitor is intended to be the
everyday interface for working.

## Fundamental principle

**Sessions are disposable. Project knowledge and state are not.**

A session (an execution of Iris or any other agent working on something) can end, lose its
context or be replaced by a new one. A future session must be able to continue the work from the
persistent state in Project Monitor, without relying on the conversation of a previous session
still existing.

The long-term goal is that Rubén does not have to open a new session of Iris and explain the whole
context of an issue again: Project Monitor should hold enough persistent knowledge to give a new
session the context it needs, and afterwards collect its result.

## Product principles agreed so far

- **The Issue is the persistent source of truth about the work.** It must keep the context needed
  to understand what is being done, what has been decided, where things stand and what is pending,
  independently of any conversation.
- **Issue and Session are different things.** An issue can exist without any session and can use
  many sessions over its life.
- **State and assignment are different dimensions.** State says which phase the work is in;
  assignment says who currently has the responsibility to move it forward. No artificial states
  just to represent "who has the ball".
- **Iris does not work simply because an issue exists**, nor merely because its state changes.
  For Iris to work, the issue must be assigned to her and be in a situation of the workflow where
  it is appropriate for her to act. The exact conditions are not designed yet.
- **Handoffs between Iris and Rubén must be explicit and recorded** in Project Monitor: when Iris
  needs a decision, information, feedback, a manual test or an approval, she must be able to state
  what she needs and hand responsibility back; when Rubén answers, he hands it back to her.
- **A session should not arbitrarily modify the workflow.** It returns a structured result;
  Project Monitor interprets it, keeps it and decides what happens next according to the rules
  that end up being designed.
- **The history of an issue should eventually be reconstructible from Project Monitor** (state
  and assignment changes, handoffs, decisions, sessions, commits/PRs, approvals, builds, deployments,
  other artifacts). This is direction, not a commitment to build a generic system for all of it now.

## What this does not mean yet

The current UI, navigation, state names and screen structure are provisional. Isolated visual
redesigns are not a priority until product, navigation and the overall workflow are better
defined. See [domain-model.md](domain-model.md) for the list of open questions.
