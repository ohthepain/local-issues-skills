---
name: repro-steps
description: Build a lightweight web-app recorder that follows user actions and produces copyable bug reproduction steps, independently or alongside a tutorial.
---

# Repro steps

Add a small recorder to the actual web app so the user can demonstrate a bug and copy useful evidence into a fixing prompt. The user drives every application action. This skill builds the recorder; it does not implement the underlying bug fix or change issue status. It works without any other skill installed.

## Build and launch

Read the project instructions and relevant app entry points. Use the existing UI and development conventions. Provide an explicit development/preview-only launch control or URL opt-in; keep recorder code clearly named and removable, outside production behavior. Preserve unrelated work and normal app interactions. Deliver a working launch command or link and open the available preview.

Use three collection controls: **Start recording**, **Restart**, and **Bug reproduced**, with a compact recording indicator. Start begins a fresh collection from the current location. Restart clears the current collection and immediately starts again from wherever the user is. Before clearing a nonempty collection, make the destructive effect clear in the control label or adjacent text. Bug reproduced flushes the pending edit, stops collection, and opens the report. Disable controls when their operation is unavailable. Keep controls accessible by keyboard and clear of application targets.

Keep collection in memory only. Same-document navigation retains the ordered steps; a full page load or reload clears them and returns to Start recording. Explain this briefly near the controls. Do not add pause/resume, recovery, saved reports, browser storage, or a file-writing service. The user may navigate anywhere and restart collection when ready.

## Capture actions

Record meaningful application actions in order: clicks on named controls, accepted edits, selections, toggles, form submissions, and navigation. Combine typing and paste into one edit with the accepted value rather than logging keystrokes. Flush edits on commit, focus change, the next meaningful action, and Bug reproduced. Preserve repeated intentional actions; avoid duplicate entries from bubbling, synthetic events, or click-plus-submit handling. Include scrolling, dragging, hover, or keyboard gestures when they affect the demonstrated workflow; use semantic descriptions and useful endpoints rather than raw event streams.

Capture the starting route and relevant observable setup, plus useful non-sensitive target identity such as an accessible name, stable application identifier, and page path. Record only context actually available. Distinguish user-reported prerequisites from observed actions. Treat URLs as sensitive: omit credentials, tokens, and private query/hash values. Mask password, secret, payment, and personal text fields; use a placeholder that tells the fixing model what kind of value is needed. Capture ordinary non-sensitive settings when useful. Avoid full DOM snapshots and logging arbitrary page text. Render captured strings as text, never executable HTML.

Use delegated listeners or stable application hooks that survive rerenders and same-document route changes. Listeners must observe rather than intercept actions: preserve focus, typing, scrolling, navigation, and app event behavior. Exclude recorder and tutorial interface actions. Tear down handlers on completion or disposal, and prevent duplicate listeners when reopened. Preserve the final action even if it causes a same-document transition.

Report capture gaps explicitly. Browser chrome, full document navigation, cross-origin content, inaccessible frames/shadow roots, native dialogs, physical actions, and external devices require suitable supported hooks or user-supplied notes. Do not describe an unobserved action as captured or promise complete coverage from a generic click listener.

## Coexist with tutorial

When a tutorial exists, reuse suitable UI/event utilities if that simplifies integration, while keeping recorder state and controls independent. Tutorial opening, closing, skipping, or finishing neither starts nor stops recording. Capture actual application actions, including exploration outside the guide; suggested tutorial steps are not completed actions. Optional tutorial context may annotate the report but must not replace the chronological journal. No sibling skill or tutorial runtime is required for standalone use.

## Finish and copy

After Bug reproduced, show editable **Expected behavior** and **Actual behavior** fields, prefilled only from known context, plus optional notes for missing setup or actions. Mark the endpoint as the user's report that the bug appeared, not independently verified reproduction. Keep the report available while the user edits these fields; copying uses the latest text.

Produce Markdown containing:

- Starting page and known prerequisites, with unknown setup or capture gaps called out.
- Concise numbered reproduction steps derived from the recorded actions.
- Expected and actual behavior and the user-marked failure point.
- The complete ordered semantic action log, preserving detours and repeated actions even if omitted from the shorter recipe.

Keep the recipe faithful: preserve causally uncertain actions or identify their omission as an untested simplification. Never claim the sequence was replayed or minimized unless it actually was. File inputs refer to a non-sensitive file description or prerequisite, not captured file contents or private paths.

Provide **Copy repro steps** for the complete report and visible selectable text as a clipboard fallback. Show copied success only after the clipboard operation succeeds. Keep the report in the current page session; no automatic submission, saving, fixing, or issue updates. The user can paste it into this or another fixing chat. Starting another recording clears the old report with that effect made clear.

## Verify and hand off

Exercise the generated recorder in a disposable app with safe data. Check ordered clicks, repeated actions, combined typing/paste, final unblurred edits, selection/toggle, submit deduplication, same-document navigation, rerendered targets, and Restart from a different route. Verify full reload clears collection, stopping detaches capture, controls remain usable, and sensitive fields are masked in both recipe and journal. Check Bug reproduced, editable expected/actual text, copy success and failure fallback, and empty/no-failure sessions without fabricated steps.

When tutorial integration is available, close or navigate the tutorial while recording and verify collection remains independent and tutorial controls never enter the journal. Check keyboard access and an unobstructed app on a narrow screen. Verify recorder tooling stays out of production behavior. Separate packaging checks, simulated behavior, observed app interactions, and the user's failure verdict in the handoff. State specific untested branches when browser access is unavailable.
