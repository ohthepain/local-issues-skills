---
name: issue
description: Capture bugs and feature requests in a local project queue with minimal interruption; investigate only when requested.
---

# Capture a local issue

Read [the queue contract](references/queue.md). Use the current project's local `.issues/` queue, independently of any external issue tracker.

## Save and finish

Save the user's words immediately using the contract's capture and routing rules, with a short title, unique ID, mapped initial state, and `autonomy: ask` for each report. Infer distinct issues from meaning and cues such as numbered items or separate requested outcomes. Numbered reproduction steps, examples, and supporting details for one outcome stay in one report. Preserve each item's original wording and relevant shared context or attachment references; leave missing details unknown. When separation is uncertain, keep the related material together and note the uncertainty without interviewing the user. If no issue description was supplied, ask for one sentence, then save it.

Capture ends after saving. Do not investigate, start the app, attempt reproduction, or interview the user during ordinary capture. Return each saved ID and report link. For a bug needing reproduction, include `Reply repro <ID> to try reproducing it.` For a feature or other report that skips reproduction, include `Reply fix <ID> to work on it.` Substitute each saved ID; retain the text command fallback for every report.

Saving is complete without another choice. Do not open a post-capture dialog asking whether to reproduce or keep the issue. Persistent inline actions are desirable, but use them only when the current host provides a verified working mechanism; always retain the text command as a fallback. Do not describe plain text as a working button.

Explicit requests to reproduce an existing report, including `repro <ID>`, enter the workflow below directly. Resume the exact saved report instead of creating a duplicate. For `fix <ID>`, use the shared contract and the scoped implementation, verification, and commit workflow described below; no companion skill is required.

## Work on a captured enhancement

For `fix <ID>`, resolve an exact ID or unique prefix, refresh the report and project instructions, inspect existing source/staged changes, and follow the contract's routing and optional prototype stage. Clarify only necessary decisions, implement within this report's scope, run relevant verification, apply the commit preference, and persist changes and evidence. Stop at the mapped `ready-to-close` state until explicit acceptance. Keep a needed prototype open for user design feedback before production implementation; capture or selection alone authorizes neither. Never push or publish automatically.

## Reproduce on request

1. Read the saved report and applicable project instructions. Apply the contract's routing first: if reproduction is inapplicable, record why and route to clarification, prototyping, or implementation without inventing a failure. An explicit `repro` request for such a report does not authorize implementation. Otherwise continue below. Inspect available app setup and supplied evidence before asking for facts. If the steps or expected behavior are unclear, ask focused questions before attempting reproduction. Persist answers and unanswered questions; wait when necessary. This clarification belongs to the requested reproduction, not ordinary capture.
2. Find the project's web app URL from project configuration, a running development server, or an existing app tab. Reuse the app's preview if already open; otherwise open it in Codex's right panel using `open_in_codex` with `placement: right` and a browser target. Use available browser controls to inspect tabs and interact with the app; opening a preview alone does not perform reproduction. Start the documented local development server if needed and permitted by project instructions. Ask for the URL or access only when it cannot be established locally. If the web version cannot exercise the reported behavior, record that limitation and clarify the appropriate environment.
3. Attempt reproduction for at most two minutes of active elapsed investigation, including setup. User-answer waiting time is outside that budget. Avoid starting commands whose expected duration exceeds the remaining budget; stop or interrupt unfinished attempts at the deadline. Record exact steps, observed results, and useful evidence. An inaccessible environment or unrun check is not a reproduction. Keep this workflow limited to reproduction; do not implement a fix.
4. If reproduced, record evidence and move to `ready-to-fix` when expected behavior and evidence support a bounded fix. When the contract's quick-fix readiness conditions are met, save the assessment so a subsequent issues listing can offer Quick fix. Otherwise record remaining uncertainty and ask focused questions that could resolve the failed attempt. Use `ready-for-grilling` when user information is needed; otherwise retain `ready-for-repro`. Keep the report updated as answers arrive. A new reproduction request can begin another bounded attempt.
5. Accept the queue contract's short replies at every question. With `go`, record current-issue autonomy and continue reproduction within the remaining budget; leave further implementation to the fixer. Deferral parks the report with the explicit request for later grilling. Finish with the ID, brief outcome, report link, and any verification limitations.

Do not create GitHub issues or run the fix queue as a side effect.
