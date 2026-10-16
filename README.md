# local-issues-skills

Agent skills for capturing, triaging, and fixing local project issues through a lightweight Markdown queue.

- **issue** saves your report immediately, attempts reproduction for up to two minutes, and asks focused follow-up questions.
- **fix-issues** resumes the queue, investigates and fixes actionable reports, verifies changes, and optionally commits them. You accept closure separately.

Reports live in the active project's `.issues/` directory. The skills keep this queue separate from external trackers and follow the project's `AGENTS.md` instructions. They do not automatically create GitHub issues, push code, or release changes.

## Install

Once these files are published to GitHub:

```sh
npx skills add ohthepain/local-issues-skills --skill issue --skill fix-issues
```

Either skill can also be installed alone by selecting only its name. Each includes its own queue contract. See the [skills CLI documentation](https://github.com/vercel-labs/skills) for agent and installation options.

Codex is the initial target. Other agents have not been behaviorally validated. Invoke the installed skill by name (for example, `$issue` or `$fix-issues` in Codex); interfaces may display them as slash commands.

## Workflow

Ask `issue` to capture a bug, then invoke `fix-issues` when ready to work the queue. First use initializes local triage definitions and preferences; the first fix run asks whether to commit unless you already supplied a choice. Git projects exclude the queue locally, preserving any already tracked reports.

Standalone replies apply to the current report:

| Reply | Effect |
| --- | --- |
| `go` | Continue independently on this issue; required verification still applies. |
| `later` / `l8` | Save questions and defer the report. |
| `close` | Close the report with user acceptance or an explicit closure reason. |
| `x` | Delete the current report, leaving code and commits intact. |

The full behavior is defined in [the queue contract](references/queue.md). Project-specific requirements belong in each project's `AGENTS.md`, and local state customizations belong in `.issues/triage-labels.md`.

## Develop locally

Requires Python 3.9 or newer for the repository checks; the installed skills themselves require no Python scripts.

Edit `skills/issue/SKILL.md` or `skills/fix-issues/SKILL.md`. Edit shared workflow rules only in `references/queue.md`, then refresh the committed standalone bundles:

```sh
python3 scripts/check.py --sync
python3 scripts/check.py
```

For immediate Codex development, link the two skill folders into your Codex skills directory. Existing installations should be moved to a backup outside that directory before creating links:

```sh
ln -s /absolute/path/to/local-issues-skills/skills/issue ~/.codex/skills/issue
ln -s /absolute/path/to/local-issues-skills/skills/fix-issues ~/.codex/skills/fix-issues
```

Repository edits are then available through those links without reinstalling. After changing shared rules, run `--sync` before invoking either skill. Start a new chat if the current chat has already loaded an older version.

Run the [manual behavior checklist](docs/validation.md) when changing workflow behavior. Packaging checks do not prove agent behavior. An HTML queue view with links into the app is deferred.

## Publication

Before publishing, run the checks, review the complete diff, and record any manual validation limitations. Commit and push only when explicitly requested. This repository uses the standard `skills/<name>/SKILL.md` layout; it does not require an npm package. See [skills.sh documentation](https://skills.sh/docs) for installation and directory information. No skills.sh listing or public release is implied by local validation.

## License

[MIT](LICENSE)
