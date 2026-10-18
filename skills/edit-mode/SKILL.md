---
name: edit-mode
description: Open a local app or website with element-level feedback controls, collect comments and proposed deletions or resizing, then apply only user-confirmed changes.
---

# Edit mode

Give the user a working feedback mode over the current project's running website. This is a standalone skill for any project with accessible web source; it requires no issue queue or sibling skill. Follow the consuming project's instructions and preserve unrelated work.

## Open feedback mode

Inspect the app, launch commands, existing preview, and available browser tools. Reuse the running app where possible. Build a clearly named, removable development-only integration, enabled explicitly by a launch control or URL option. Installing this feedback interface is authorized by invoking the skill; changing the underlying product in response to feedback requires the later confirmation below.

Read [the interaction contract](references/interaction.md) before building. Adapt implementation to the project's framework. Prefer integration that survives route changes and full same-origin navigation over transient browser injection. Keep normal app controls and navigation working. Open the enabled app through the available browser tool and give the user its launch link or command. If browser control is unavailable, provide a working launch path and state what you could not exercise. Do not substitute a simulation for feedback on the actual app without agreement.

## Collect and review

Let the user explore and collect element comments, general complaints, deletion marks, and resize requests across pages. Preserve drafts through navigation. Changes collected here are proposals, including gestures; they do not authorize product code edits.

**Review changes** ends collection and presents every request with a checkbox, checked by default. The user can uncheck entries to disregard them, revise feedback, or return to collection. Transfer this selection to the agent using an actually available host connection, or provide Copy/export with selectable text fallback. Do not assume the webpage can message the chat or that a browser button resumes the model automatically.

Read the selected feedback and relevant source. Resolve target identity against the current app; do not guess when a target has become ambiguous. Turn each selected request into a concrete proposed fix. Ask focused questions for complaints with materially different interpretations. Then present the numbered proposals, retain the per-change checkbox selection in the review UI, and request explicit confirmation of that exact selected set. If the host cannot connect the review UI to chat, accept numbered selections and confirmation in chat and reconcile them before edits. Export, collection completion, and checkbox selection alone are not approval. Changed proposals or newly checked entries need confirmation before implementation.

## Apply and verify

After confirmation, implement only the approved entries in source. Translate resize intent into suitable responsive styling rather than blindly copying pixel dimensions. Preserve normal behavior except where the approved change specifically alters it. Flag conflicts or unavailable targets instead of silently expanding scope.

Run relevant project checks and inspect the affected app pages with available browser tools. Report what actually passed and what remains unverified. Show the updated app when possible and offer another feedback round. Keep feedback tooling opt-in and out of production builds; remove temporary integration when the session is finished, preserving approved product changes. Do not discard pending feedback without the user's agreement. Commit, publish, and issue-state transitions follow separate project/user authorization.
