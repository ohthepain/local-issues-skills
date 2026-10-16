---
name: issue
description: Quickly capture a bug in a local project queue, try reproducing it, and refine only what is needed.
---

# Capture a local issue

Read [the queue contract](references/queue.md). Use the current project's local `.issues/` queue, independently of any external issue tracker.

1. Save the user's words immediately as a new report before investigating or interviewing. Give it a short title and unique ID; acknowledge that it is saved. Preserve useful supplied context and attachments by reference. If the user supplied no bug description, ask for one sentence, then save it.
2. Try reproducing the bug for at most two minutes of elapsed investigation, including setup. Use existing tools and evidence; avoid starting commands whose expected duration exceeds the remaining budget. Stop or interrupt unfinished attempts at the deadline. Capture the observed result and exact steps. An inaccessible environment or unrun check is not a reproduction. Do not implement a fix in this capture workflow.
3. If reproduced, record evidence and move to `ready-to-fix`. Otherwise ask a small round of focused questions that would materially help reproduction, with suggested answers when useful. Do not ask for facts you can inspect. Keep the saved report updated as answers arrive. This is lightweight clarification; grill deeply only if requested.
4. Accept the queue contract's short replies at every question. After `go`, record current-issue autonomy and leave it `ready-for-repro` for the fixer; the capture budget still applies. After deferral, record the explicit request for later grilling. Finish with the ID, brief status, and report link.

Capture never requires a complete form. Missing information remains explicitly unknown. Do not create GitHub issues or run the fix queue as a side effect.
