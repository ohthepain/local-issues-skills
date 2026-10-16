# Manual behavior validation

Use a disposable Git repository with a small reproducible bug. These scenarios are a checklist, not a record of passed tests. Record the agent/version, scenario, observed outcome, and limitations when running them.

- Install each skill separately into an isolated skill directory. Confirm its queue reference resolves without the sibling.
- Capture a bug: the original wording is saved before investigation; no fix is made; observed failure and exact steps are recorded. An unsuccessful attempt stops within two minutes, with uncertainty preserved.
- Defer with `l8`, then resume: questions and `grill_later` persist; deferred reports stay parked when fixing actionable reports.
- Give `go` for one issue: autonomy applies only there, without skipping required verification or permission boundaries.
- Fix a reproducible bug with commits disabled: verify the change, record uncommitted files, and stop at `ready-to-close` until explicit acceptance.
- Enable commits with unrelated staged work present: preserve unrelated changes; commit only isolated, verified issue changes, or ask when isolation is impossible.
- Fail a required check or require device verification: keep the report unresolved and record the blocker accurately.
- Close and delete explicitly: closure preserves the report and reason; `x` deletes only the selected report and leaves source changes intact.
- Capture a new report while a fixer runs: refresh between issues and preserve both reports. Do not run concurrent fixers in the same checkout.
- Initialize inside a Git worktree: resolve its actual exclude file, preserve tracked reports and existing triage customizations. Also check initialization outside Git.

Initial extraction validation covers packaging and comparison with the original files. Fresh end-to-end agent behavior remains unverified until these scenarios are executed.
