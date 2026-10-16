# local-issues-skills

Agent skills for capturing, triaging, and fixing local project issues through a lightweight Markdown queue.

- **issues** lists saved reports and statuses. Select one with `/issues <ID>`, then iterate on it while keeping the app preview open.
- **issue** saves your report and returns immediately with a `repro <ID>` command. Reproduction and clarification happen only when requested.
- **fix-issues** resumes the queue, investigates and fixes actionable reports, can group related issues into a shared fix, verifies changes, and optionally commits them. You accept closure separately.

Reports live in the active project's `.issues/` directory. The skills keep this queue separate from external trackers and follow the project's `AGENTS.md` instructions. They do not automatically create GitHub issues, push code, or release changes.

## Install

Once these files are published to GitHub:

```sh
npx skills add ohthepain/local-issues-skills --skill issue --skill fix-issues --skill issues
```

Any skill can also be installed alone by selecting only its name. Each includes its own queue contract. See the [skills CLI documentation](https://github.com/vercel-labs/skills) for agent and installation options.

Codex is the initial target. Other agents have not been behaviorally validated. Invoke the installed skill by name (for example, `$issue`, `$fix-issues`, or `$issues` in Codex); interfaces may display them as slash commands.

## Workflow

Use `/issues` (or `$issues` in Codex) to list the queue. Select a report with `/issues ebbb`; then follow-up feedback such as “it needs to be even darker” applies to that same report. Selection opens or reuses the relevant web preview, and concrete revision requests update the issue and app without starting the entire fix queue. Listing is read-only; selection may open the preview but does not edit source or change report state. Each status also includes a next-status action, or Delete for closed reports. Use `/issues ebbb next` to advance when prerequisites are met, or `/issues ebbb delete` to remove a report without reverting code. Status changes do not run the fixer or claim unperformed verification. In Codex, the skill renders an interactive inline table with Work on issue and status buttons using `window.openai.sendFollowUpMessage`. Buttons submit a scoped request; the model validates and updates the saved report. Hosts without the chat bridge get a copyable command fallback. Actual host dispatch needs a live chat trial.

Ask `issue` to capture a bug. Reply `repro <ID>` to investigate it in the web app preview, with clarification before unclear steps or after an unsuccessful attempt. You can also invoke `fix-issues` directly when ready to work the queue. First capture initializes local triage definitions and preferences; the first fix run asks whether to commit unless you already supplied a choice. Git projects exclude the queue locally, preserving any already tracked reports.

Standalone replies apply to the current report:

| Reply | Effect |
| --- | --- |
| `don't group` | Narrow an announced group to its original issue for this run. |
| `go` | Continue independently on this issue; required verification still applies. |
| `later` / `l8` | Save questions and defer the report. |
| `close` | Close the report with user acceptance or an explicit closure reason. |
| `x` | Delete the current report, leaving code and commits intact. |

The full behavior is defined in [the queue contract](references/queue.md). Project-specific requirements belong in each project's `AGENTS.md`, and local state customizations belong in `.issues/triage-labels.md`.

## Develop locally

Requires Python 3.9 or newer for the repository checks; the inline issues table also uses Python 3.9+ to render its HTML fragment.

Edit the relevant `skills/<name>/SKILL.md`. Edit shared workflow rules only in `references/queue.md`, then refresh the committed standalone bundles:

```sh
python3 scripts/check.py --sync
python3 scripts/check.py
```

For immediate Codex development, link the skill folders into your Codex skills directory. Existing installations should be moved to a backup outside that directory before creating links:

```sh
ln -s /absolute/path/to/local-issues-skills/skills/issue ~/.codex/skills/issue
ln -s /absolute/path/to/local-issues-skills/skills/fix-issues ~/.codex/skills/fix-issues
ln -s /absolute/path/to/local-issues-skills/skills/issues ~/.codex/skills/issues
```

Repository edits are then available through those links without reinstalling. After changing shared rules, run `--sync` before invoking a skill. Start a new chat if the current chat has already loaded an older version.

Run the [manual behavior checklist](docs/validation.md) when changing workflow behavior. Packaging checks do not prove agent behavior. An HTML queue view with links into the app is deferred.

## Publication

Before publishing, run the checks, review the complete diff, and record any manual validation limitations. Commit and push only when explicitly requested. This repository uses the standard `skills/<name>/SKILL.md` layout; it does not require an npm package. See [skills.sh documentation](https://skills.sh/docs) for installation and directory information. No skills.sh listing or public release is implied by local validation.

## License

[MIT](LICENSE)
