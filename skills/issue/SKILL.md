---
name: issue
description: Save a bug to a local project queue with minimal interruption; reproduce it only when requested.
---

# Capture a local issue

Read [the queue contract](references/queue.md). Use the current project's local `.issues/` queue, independently of any external issue tracker.

## Save and finish

Save the user's words immediately as a new report with a short title, unique ID, `state: ready-for-repro`, and `autonomy: ask`. Preserve supplied context and attachments by reference; leave missing details unknown. If no bug description was supplied, ask for one sentence, then save it.

Capture ends after saving. Do not investigate, start the app, attempt reproduction, or interview the user during ordinary capture. Return a brief acknowledgment with the ID and report link, followed by `Reply repro <ID> to try reproducing it.` Substitute the saved ID; this text command must always be available.

Saving is complete without another choice. Do not open a post-capture dialog asking whether to reproduce or keep the issue. Persistent inline actions are desirable, but use them only when the current host provides a verified working mechanism; always retain the text command as a fallback. Do not describe plain text as a working button.

Explicit requests to reproduce an existing report, including `repro <ID>`, enter the workflow below directly. Resume the exact saved report instead of creating a duplicate.

## Reproduce on request

1. Read the saved report and applicable project instructions. Inspect available app setup and supplied evidence before asking for facts. If the steps or expected behavior are unclear, ask focused questions before attempting reproduction. Persist answers and unanswered questions; wait when necessary. This clarification belongs to the requested reproduction, not ordinary capture.
2. Find the project's web app URL from project configuration, a running development server, or an existing app tab. Reuse the app's preview if already open; otherwise open it in Codex's right panel using `open_in_codex` with `placement: right` and a browser target. Use available browser controls to inspect tabs and interact with the app; opening a preview alone does not perform reproduction. Start the documented local development server if needed and permitted by project instructions. Ask for the URL or access only when it cannot be established locally. If the web version cannot exercise the reported behavior, record that limitation and clarify the appropriate environment.
3. Attempt reproduction for at most two minutes of active elapsed investigation, including setup. User-answer waiting time is outside that budget. Avoid starting commands whose expected duration exceeds the remaining budget; stop or interrupt unfinished attempts at the deadline. Record exact steps, observed results, and useful evidence. An inaccessible environment or unrun check is not a reproduction. Keep this workflow limited to reproduction; do not implement a fix.
4. If reproduced, record evidence and move to `ready-to-fix` when expected behavior and evidence support a bounded fix. Otherwise record remaining uncertainty and ask focused questions that could resolve the failed attempt. Use `ready-for-grilling` when user information is needed; otherwise retain `ready-for-repro`. Keep the report updated as answers arrive. A new reproduction request can begin another bounded attempt.
5. Accept the queue contract's short replies at every question. With `go`, record current-issue autonomy and continue reproduction within the remaining budget; leave further implementation to the fixer. Deferral parks the report with the explicit request for later grilling. Finish with the ID, brief outcome, report link, and any verification limitations.

Do not create GitHub issues or run the fix queue as a side effect.
