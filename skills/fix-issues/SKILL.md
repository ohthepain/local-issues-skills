---
name: fix-issues
description: Work through a project's local issue queue, refining reports, implementing fixes and enhancements, verifying changes, and optionally committing them.
---

# Fix local issues

Read [the shared queue contract](references/queue.md), then the project's `.issues/triage-labels.md` and preferences. If the bundled reference is unavailable, report the incomplete installation rather than guessing the workflow. This queue is local and independent of external issue trackers.

## Start or resume

Inspect report states and existing worktree/staged changes. Resolve an unset commit preference as specified in the contract. Keep startup concise: combine independent choices into one short prompt when necessary.

If reports await closure, show their IDs, short fix summaries, and verification limitations; offer to close selected reports or leave them open. Never infer acceptance from silence. Leaving a ready-to-close report open does not block fixing another report.

If deferred or incomplete reports exist, offer `refine reports first` or `fix what's actionable`. The latter leaves deferred reports parked. The user may select an issue and answer `go` to make it actionable without further refinement. Do not apply one issue's `go` to the whole queue. If no actionable issue exists, offer refinement or `go` for a specific report and wait.

## Work the queue

Process oldest actionable reports first unless the user specifies a priority. Resume existing fixes/verification/commits before duplicating work. Refresh the queue between issues so newly captured bugs can be included. Before implementing, review the queue for cohesive shared fixes under the contract's grouping rules. Keep the originally selected issue as the group anchor; announce any group before source edits and honor `don't group` steering.

For each issue (or cohesive group, retaining separate report states):

1. Read its evidence and inspect the relevant code. Apply the contract's routing: reproduce applicable bugs or establish enough intended behavior for a bounded enhancement, recording why reproduction is skipped. Unlike capture, diagnosis here has no two-minute limit. Record unsuccessful attempts and uncertainty.
2. When user information is necessary, persist the question and wait. Offer `go`, `later`/`l8`, `close`, and `x` with brief meanings when useful. Do not move to another issue without an answer authorizing it. With existing `go`, investigate autonomously until a genuine decision or verification boundary requires the user.
3. After grilling, use the model to decide whether the contract's optional prototype stage would help settle design choices. Record the decision; when useful, enter `ready-to-prototype`, build and show the disposable prototype, and wait for necessary user design decisions before production implementation. Otherwise skip the optional stage. Implement the smallest adequate fix within project requirements. Record changed files and reasoning sufficient to resume. Move each affected report to `ready-to-verify` only when its fix exists.
4. Run relevant checks and obtain required manual verification. Failures remain unresolved; repair them or ask about a blocker. Persist commands, results, and limitations for each report, including checks covering each grouped symptom. A user reply of `go` does not substitute for required verification.
5. Apply the selected commit policy, recording the commit hash or that changes remain uncommitted. Move to `ready-to-close`; user acceptance is separate from permission to commit.
6. After `don't group`, finish only the original issue for this run. Otherwise continue to the next actionable issue without asking permission at every successful step. Honor explicit closure/deletion/deferral commands under the shared contract.

Stop when all actionable work has reached `ready-to-close`/`closed`, or when a blocking question, execution limit, or user stop requires a pause. Do not busy-loop on unfixable issues or wait for future reports. Persist enough evidence and state for the next invocation to resume accurately.

At the end, summarize fixes, verification, commits/uncommitted changes, and remaining reports. Offer to close newly completed issues, identifying them clearly; keep them `ready-to-close` until the user accepts. If the user accepts closure, persist it. If interrupted, save progress when possible and report the exact next action.
