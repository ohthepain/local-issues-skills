# local-issues-skills

Preserve the existing issue workflow unless the user requests a behavior change. Keep project-specific rules in the consuming project's AGENTS.md.

Edit shared queue rules in `references/queue.md`; `skills/*/references/queue.md` are committed standalone bundles. Run `python3 scripts/check.py --sync` after shared edits, then `python3 scripts/check.py`. Each skill must work without its sibling installed.

For workflow changes, use `docs/validation.md` in a disposable project and distinguish packaging checks from observed agent behavior. Keep supported-agent claims limited to verified evidence. Public publication is a separate user-authorized action.
