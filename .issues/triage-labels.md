# Triage Labels

This file defines this project's local issue lifecycle. State values are exact strings saved in issue reports. Roles connect the lifecycle to the skills' workflow; they are not external tracker labels.

| Role | State | Next state | Meaning / exit condition |
| --- | --- | --- | --- |
| `ready-for-grilling` | `backlog` | `to-do` | Needs clarification; record unanswered questions. Deferral sets `grill_later: true`. |
| `ready-for-repro` | `to-do` | `ready-to-prototype` | Ready to investigate. Advance once evidence and intended behavior support a bounded fix. |
| `ready-to-prototype` | `ready-to-prototype` | `in-progress` | Optional design experiment. Enter when a recorded design question benefits from a prototype; skip when unnecessary. Advance after user feedback resolves design decisions and scope. |
| `ready-to-fix` | `in-progress` | `in-review` | Ready to implement. Advance once a fix exists. |
| `ready-to-verify` | `in-review` | `ready-for-commit` | Advance after relevant checks and required manual/device verification pass. |
| `ready-for-commit` | `ready-for-commit` | `resolved` | Advance after the selected commit is recorded, or commits are explicitly disabled. |
| `ready-to-close` | `resolved` | `closed` | Implementation, verification, and selected commit complete; advance requires user acceptance. |
| `closed` | `closed` | — | Terminal. Preserve the report and closure reason. |

Edit State and Next state to use your vocabulary. Keep each role and state unique. Add rows with Role `custom` for additional stages, and update the preceding row's Next state to enter them. Give every added stage a concrete exit condition. Use `—` for no next state. Explicit Next state links, not row order, determine progression. Multiple `custom` rows are allowed; the seven workflow roles each occur once.

For example, insert `custom | qa | resolved | Required QA passed` between `ready-for-commit` and `resolved` by changing the former's Next state to `qa` (format state strings with backticks as above).

With commits disabled, skip only the row with role `ready-for-commit`, following its Next state; retain custom verification or approval stages. Renaming a state requires explicitly migrating reports that use its old value. Unknown states or ambiguous/broken transitions remain unchanged until clarified. These definitions never establish evidence or waive the queue's verification and acceptance requirements.

The optional `ready-to-prototype` role is now configured. Its Role and State happen to share the same name; the preceding row references that State as its successor. Skip this optional stage when a recorded model assessment finds no design experiment necessary, preserving other custom stages.
