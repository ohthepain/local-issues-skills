---
name: handoff-issue
description: Summarize the current conversation into a temporary handoff document so a fresh agent can continue a task, feature, bug, or the entire discussion.
---

# Handoff issue

Create a structured Markdown handoff from the current conversation. This captures continuation context; it does not continue implementation, update existing artifacts, or send anything to another agent.

## Select scope

Treat the string after the skill name as the requested task, feature, or bug: `$handoff-issue "audio import freeze"` (or `/handoff-issue "audio import freeze"` in hosts with slash commands). Include related context needed to continue it. If an explicit argument cannot be matched reliably, ask which topic it refers to before writing a misleading handoff.

With no argument, summarize the entire available discussion. If it contains multiple independent tasks or no identifiable single task, warn the user and explain: “Use `$handoff-issue "task, feature, or bug"` for a focused handoff; `$handoff-issue` covers the entire discussion.” Still produce the whole-discussion handoff, separating distinct topics and leaving priorities unresolved unless the user established them. Do not silently choose the latest topic. Identify any unavailable or compacted context that limits the summary.

## Capture continuation context

Preserve the user's latest intent, corrections, decisions, constraints, authorization boundaries, unresolved questions, and the next useful actions. Distinguish completed and observed work from proposals, user reports, assumptions, failed attempts, and unverified claims. Include relevant checks and their limitations; a plan to test is not a passed test.

Use existing specs, plans, ADRs, issues, commits, diffs, and other artifacts as sources of truth. Reference them by path or URL with a brief description of what the next agent should read there; do not copy their contents into the handoff. Capture only discussion context or decisions absent from those artifacts. Use absolute paths for local artifacts and repository plus commit/branch identifiers for Git references when known. Verify pointers when practical and mark unverified, missing, or session-local references. Do not invent artifact locations or reconstruct unseen conversation history. Record known workspace/branch and uncommitted-work context without copying patches; the next agent must inspect live state before editing.

Redact secrets and personally identifiable information everywhere, including titles, filenames, commands, paths, and URLs. Use descriptive placeholders such as `[API_KEY]` or `[PERSON]`; retain only the non-sensitive context needed to continue. Strip credentials and access-bearing URL parameters. Where a path contains personal information, use a clearly labeled path template such as `$HOME/projects/example/spec.md` and explain how to resolve it. Reference an authorized source for sensitive details rather than embedding them. Review the entire document for sensitive data before saving.

## Document structure

Use the sections below as appropriate to the available discussion. Always include scope, current goal and status, artifact references, next steps, and suggested skills; include the other sections when relevant. Mark material gaps explicitly rather than inventing details. For multiple tasks, group task-specific material under separate topic headings. The artifact-reference rule applies to every section: point to existing answers, docs, reports, or diffs instead of repeating their contents.

- **Scope and objective:** selected topic or whole discussion, desired outcome, and context limits.
- **Current goal and status:** immediate goal, completed work, active work, blockers, and relevant verification evidence or pointers.
- **Issue type:** bug, feature, task, or another supported classification; mark uncertain classifications as tentative.
- **Grill-me answers:** relevant questions and user answers from any `grill-me` sessions, preserving unresolved questions and later corrections. Reference saved session results when available.
- **Grill-me-with-docs answers and documents:** relevant answers and document paths or URLs from any `grill-me-with-docs` sessions, including which decisions they inform and any unresolved conflicts. These session names describe available discussion context, not required installed skills; do not initiate new grilling sessions to fill this report.
- **Reproduction steps:** known setup and ordered steps, when available; distinguish user-provided steps from an agent-observed reproduction and identify missing prerequisites.
- **Observed and expected behavior:** each when available, with the source of observations and any uncertainty. Preserve the user's actual finding even if it differs from the original issue.
- **Key architectural decisions:** chosen approach, discussion-only rationale, and consequential tradeoffs; reference existing ADRs or specs for recorded detail.
- **Touched or modified files:** relevant paths and their role in the work, distinguishing actual changes from proposed edits; reference diffs or commits for change details.
- **Failed attempts and rejected approaches:** what was tried, the observed result or reason for rejection, and any conditions that would justify retrying. Distinguish an unsuccessful experiment from an idea rejected without trying it, so the fresh session can avoid repeating mistakes.
- **Decisions and constraints:** discussion-only rationale, user corrections, preferences, and approval boundaries that affect continuation.
- **Artifact references:** paths or URLs with purpose and any access or freshness caveats. Keep artifact-owned detail here as pointers.
- **Open questions:** unresolved decisions and assumptions requiring verification.
- **Exact next steps or shell commands:** ordered, concrete continuation steps and known commands, with their working directory, prerequisites, and expected result when established. Label unrun commands and redact sensitive arguments; avoid guessing commands or presenting destructive actions as approved. Separate proposals from already authorized work and state conditions requiring user input.
- **Suggested skills:** exact names of available skills the next agent should call the **Skill tool** for, with a short reason and when to invoke each. Recommend only relevant skills known to be available; do not invent names or invoke them merely to write the handoff. If none apply, say so. If the receiving host lacks a Skill tool, instruct it to use its supported skill-loading mechanism and report unavailable skills.

## Save and deliver

Write only to the user's OS temporary directory: `$TMPDIR` when set, otherwise `/tmp` on Unix-like systems; `%TEMP%` on Windows. Resolve the environment value as a path, never as shell code. If Windows TEMP is missing or the selected directory is unavailable, report the problem rather than falling back to the workspace.

Create a unique file such as `handoff-issue-<random>.md` using an exclusive temporary-file API (for example, `tempfile.mkstemp` with an explicit directory). Use a generic filename without user or task identifiers; use owner-only permissions where supported. Avoid overwriting another handoff or creating a workspace copy. Temporary storage may be cleaned by the OS, so explain that the file is temporary.

Verify the saved file exists in the selected temporary directory and contains the intended redacted handoff. Return a clickable absolute path, its scope, and any multi-task warning or material context limitation. Provide a short prompt the user can give a fresh agent: “Read the handoff at <path>, load its suggested skills, inspect current state, and continue within the recorded scope and authorization.” Use a redacted path template in visible text if the actual path contains personal information. Do not claim the next agent has received or read it.
