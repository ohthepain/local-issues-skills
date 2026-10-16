---
name: setup-local-issues
description: Set up a project's local issue queue and editable lifecycle labels, or customize an existing local lifecycle.
---

# Set up local issues

Read [the queue contract](references/queue.md). Resolve the active project's root and inspect its instructions and existing `.issues/` configuration.

Copy [triage-labels.md](triage-labels.md), beside this skill, to `.issues/triage-labels.md` when absent. Initialize preferences and local Git exclusion as described in the contract. Preserve existing reports, preferences, and lifecycle definitions on reruns. Setup requires no sibling skill.

If definitions already exist, read and retain them. Apply requested customizations in place, checking unique roles/states, transition targets, terminal behavior, and exit conditions. When renaming saved states, identify affected reports and migrate them only within the user's requested scope; otherwise explain the mismatch. Preserve legacy two-column State / Meaning files unless customization was requested.

Tell the user which files were created or changed and that they can edit `.issues/triage-labels.md` to rename states, insert stages, and specify Next state links. Setup configures a local queue; it does not create external tracker labels or change source code.
