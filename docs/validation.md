# Manual behavior validation

Use a disposable Git repository with a small reproducible bug. These scenarios are a checklist, not a record of passed tests. Record the agent/version, scenario, observed outcome, and limitations when running them.

- Install each skill separately into an isolated skill directory. Confirm its queue reference resolves without the sibling.
- List issues in an absent or empty queue: report no saved issues and create no files or exclusions. List a populated queue with open, closed, custom-state, and malformed reports: show saved statuses or explicit limitations, links and counts; honor requested filters. Compare the disposable project before and after listing to confirm no mutations.
- Select `/issues ebbb` in a disposable web project: resolve its unique saved report and open or reuse the app preview without changing source or report state. Give “it needs to be even darker”: update that report, make a bounded visual revision, invalidate affected verification, and inspect it in the same preview. Repeat feedback without a duplicate report, tab, or automatic closure. Verify the skill works without companion skills installed.
- Select an ambiguous prefix, a nonexistent ID, or give feedback after losing selection/project context: resolve the target before writing. Select a second issue and confirm feedback now applies only to that report. Mere questions do not authorize source edits.
- List status actions beneath each saved status: include a targeted advance with the expected state, or explicit Delete for closed reports. Advance a report with satisfied prerequisites: update only its state, timestamp, and transition note; refresh the row/counts without code edits or preview changes.
- Try advances with missing reproduction/fix/verification/commit evidence: leave state unchanged and explain the requirement. With commits disabled, verified work skips the commit stage. Custom states require project-defined progression. Advancing `ready-to-close` explicitly accepts closure.
- Delete a closed report: remove only that report, preserve source/commits and other rows, and clear selection only if it was selected. Replay a stale/duplicate action: leave the now-different state unchanged, including when the report has become closed. A bare `next` on closed does not delete; explicit `delete` does.
- In a disposable queue, select multiple reports across ready-to-close, other open, and closed states. Selection alone writes nothing. Close selected sends one follow-up for only eligible closure rows; Advance selected excludes closures/deletions; Delete selected includes only closed rows. Verify eligible counts, skipped IDs, and one final refresh. Repeat with typed batch commands, ambiguous prefixes, duplicates, and stale/missing reports; valid entries apply and other outcomes are explicit. A blocked report does not imply the batch succeeded for all rows.
- Reject/cancel a batch dispatch: preserve selection and allow retry. During dispatch block duplicate actions; after success disable submitted mutation rows without changing displayed saved states or removing rows. Confirm the live host sends only one follow-up for the entire selection.
- Capture a bug: save the original wording, return its ID/link and a concrete `repro <ID>` command, and end without investigation, app startup, reproduction, or clarification questions. Missing details remain unknown.
- Finish capture without a Repro / Keep dialog. If a host supports persistent inline actions, verify actual click dispatch in a live trial before relying on them; retain the text command.
- Reply `repro <ID>`: resume the exact saved report without duplication. Reuse an existing app preview or open the web app on the right. With clear steps, attempt immediately; with unclear steps, clarify first. Record observed failure and exact steps, or ask focused questions after an unsuccessful attempt. Stop investigation within two minutes, excluding user-answer waiting time; make no fix.
- Reproduction access is unavailable or the bug is native-only: record the limitation without claiming reproduction; ask only for information that cannot be inspected locally.
- Defer with `l8`, then resume: questions and `grill_later` persist; deferred reports stay parked when fixing actionable reports.
- Give `go` for one issue: autonomy applies only there, without skipping required verification or permission boundaries.
- Fix a reproducible bug with commits disabled: verify the change, record uncommitted files, and stop at `ready-to-close` until explicit acceptance.
- Present two actionable reports with the same root cause and an unrelated third report: announce `grouping issues:` with IDs/descriptions before edits, keep the original ID explicit, and group only the related pair. Verify each symptom and preserve independent acceptance; a cohesive shared commit references both IDs.
- Present deferred reports or reports needing a user decision alongside a related actionable report: grouping preserves their boundaries and does not transfer `go` authorization.
- Steer with `don't group` before edits: fix only the original issue for this run and retain the other reports for later. Repeat after edits: preserve shared changes needed by the original and unrelated work; remove only separable group-only edits. Ambiguous rollback pauses for a question; existing commits are preserved. Resume after interruption and verify original ID and cancellation persist. Clarify stale actions rather than affecting a different group.
- A group contains one unresolved symptom or failed required check: do not claim all reports completed or commit the group as verified.
- Enable commits with unrelated staged work present: preserve unrelated changes; commit only isolated, verified issue changes, or ask when isolation is impossible.
- Fail a required check or require device verification: keep the report unresolved and record the blocker accurately.
- Close and delete explicitly: closure preserves the report and reason; `x` deletes only the selected report and leaves source changes intact.
- Capture a new report while a fixer runs: refresh between issues and preserve both reports. Do not run concurrent fixers in the same checkout.
- Initialize inside a Git worktree: resolve its actual exclude file, preserve tracked reports and existing triage customizations. Also check initialization outside Git.

Initial extraction validation covers packaging and comparison with the original files. Fresh end-to-end agent behavior remains unverified until these scenarios are executed.

Known limitation: a user reported the Markdown follow-up directive rendering as an inert list item in Codex. The skill now always supplies a text command and does not open a post-capture choice dialog. Persistent inline buttons remain an unverified host capability; repository checks cannot verify rendering or click dispatch.

Interactive table handler checks: run `node scripts/test-issue-table.cjs` (Node.js required only for this development check). These exercise generated fragment code with a simulated DOM and host bridge: selection, advance/delete identity, batch eligibility and one-message dispatch, duplicate dispatch, rejection/missing bridge, unchanged saved display, and hostile title escaping. They do not prove live host rendering or user approval dispatch. In a live Codex chat, verify the table renders real buttons and a click offers/sends the expected follow-up; then verify a fresh table reflects a model-applied change and an old stale action does not apply again.


## Configurable lifecycle validation

In a disposable project, run setup alone; inspect copied template, preferences, and actual Git exclusion. Edit labels and add a `qa` stage with an explicit successor; rerun setup and verify customizations/reports are preserved. Repeat without Git and with a legacy two-column file. Capture should use the configured reproduction role. Advance individual/batch reports through `qa` only with its exit evidence, then close/delete using renamed acceptance/terminal states. Test missing targets, duplicate roles/states, cycles, stale configuration, and commits disabled (skip only the commit role). Listing an absent queue remains read-only.

Packaging checks and simulated table handlers cover bundled templates and custom acceptance/terminal labels. Setup execution and model-driven custom progression have not yet been observed in a fresh agent session; this checklist does not claim those scenarios passed.

## 2026-10-17 deterministic listing validation

The `issues` fast path now runs bundled TypeScript-generated JavaScript with Node.js 22+. Advance controls offer configured candidate transitions as requests; evidence remains checked by the agent on dispatch. This deliberately moves evidence review out of listing.

Observed automated checks on Node.js 24.4.1:

- `npm run build` and `npm run typecheck` passed.
- `npm test`: seven disposable-project CLI scenarios passed, plus existing simulated table handlers. Covered absent/empty queues without initialization, unchanged queue bytes, exact-state filters, creation sorting and tie-breaks, counts, custom and legacy lifecycle tables, no-commit bypass retaining QA, malformed YAML, invalid dates, lifecycle cycles, unusual state names, escaped titles, and output rejection inside the queue. A copied `issues` bundle ran without sibling skills or node_modules.
- `python3 scripts/check.py --sync` then `python3 scripts/check.py` passed for all four standalone bundles; `git diff --check` passed.
- An independent agent executed the helper in a disposable project and observed unchanged queue hashes, custom transitions, sorting/filtering, empty queues, and explicit malformed/cyclic configuration warnings. This tests helper execution, not the complete host-driven skill workflow.
- A disposable Git project with 500 generated reports rendered in 123.8, 101.1, 98.2, 103.3, and 99.1 ms (median 101.1 ms), including process startup. No old-workflow or end-to-end model-latency comparison was measured.

Live host rendering, click dispatch, and actual model adherence to the new one-call fast path remain unverified. No claim of zero-model invocation or new supported agents follows from these checks. The system skill validator could not run under the default Python because PyYAML is unavailable; repository metadata/reference/contract checks passed separately.

## Enhancement capture and optional prototype routing

Run these scenarios in a disposable project with each skill installed alone. Record actual model behavior separately from helper/packaging results.

- Capture “1. Add CSV export. 2. Add a dark theme.” Save two reports with separate original wording, IDs, mapped states, and command fallbacks; shared context survives in both. End without implementation or a questionnaire.
- Capture “Export crashes: 1. Open a report. 2. Click Export.” Save one bug with both steps and a repro command. Numbers alone must not create multiple reports. Repeat with examples, ambiguous related items, and mixed bug/feature input.
- Capture a clear workflow enhancement: record reproduction as inapplicable and use the implementation role. Capture a feature with unresolved behavior: use grilling. `fix <ID>` works with only the issue skill installed and preserves scope, verification, commit policy, and separate acceptance. `repro <ID>` on a feature records why reproduction does not apply without authorizing source edits.
- After grilling an uncertain new interaction, record the model's prototype decision and design question, enter the mapped prototype role, show a disposable prototype, and persist user refinements. Keep the issue there while design choices remain. Agreed decisions allow implementation; prototype checks alone cannot establish production verification.
- For a bounded bug or well-defined enhancement, record why a prototype adds no value and skip it. An explicit skip-reproduction request records the reason and verification plan; it does not waive tests or acceptance.
- Repeat with renamed states, a custom stage before implementation, an older seven-role lifecycle, and legacy two-column definitions. Existing configurations remain unchanged unless a needed prototype stage must be inserted. Preserve other custom stages and reports. Reject duplicate prototype roles and stale targets. Listing only offers candidates and cannot decide whether a prototype is useful or accept a design.

Automated helper tests cover the optional role with a renamed state, old files without it, duplicate-role rejection, and unchanged queue bytes. These checks do not establish model routing, capture splitting, prototype quality, or live preview behavior.

2026-10-18 validation in this Codex session: build, typecheck, nine disposable-project CLI tests, simulated table handlers, synchronized bundle checks, and whitespace checks passed. A self-directed disposable Git project at `/tmp/issues-enhancements-o6ez3mq7` exercised the routing examples by saving two independent feature reports, one bug containing numbered steps, and one unresolved prototype design report. The helper listed all four with their configured states, no diagnostics, and unchanged queue bytes. This was a manual model walkthrough with constructed inputs, not an independent agent trial or a live prototype/refinement session. Fresh-session capture adherence and end-to-end prototype feedback remain unverified; no additional supported-agent claim is made.
