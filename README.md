# local-issues-skills

Agent skills for capturing, triaging, and fixing local project issues through a lightweight Markdown queue.

- **edit-mode** adds hover outlines, element and general comments, deletion marks, live element resizing, and typography proposals to a local website. Review checkboxes select concrete changes for confirmation before implementation. It works without a local issue queue.
- **proto-tutorial** builds one guided walkthrough over the real app or a labeled reproduction, with an info panel, target arrow, navigation controls, and a copyable results summary. It works without a local issue queue.
- **setup-local-issues** copies an editable lifecycle to `.issues/triage-labels.md`, preserving existing configuration on reruns.
- **issues** lists saved reports and statuses. Select one with `/issues <ID>`, then iterate on it while keeping the app preview open.
- **issue** saves one report per distinct issue in your message and returns immediately with a `repro <ID>` or `fix <ID>` command. Reproduction and clarification happen only when requested.
- **fix-issues** resumes the queue, investigates and fixes actionable reports, can group related issues into a shared fix, verifies changes, and optionally commits them. You accept closure separately.

Reports live in the active project's `.issues/` directory. The skills keep this queue separate from external trackers and follow the project's `AGENTS.md` instructions. They do not automatically create GitHub issues, push code, or release changes.

## Why keep issues locally?

Issues are specs for work. Keeping them in `.issues/` puts them beside the code and project instructions your coding agent already uses. You can read and edit them in your editor, and the agent can search and review them directly without navigating to GitHub or Jira or requiring a tracker integration. Saved reports also preserve context between coding sessions.

Having the queue in the workspace makes a few common tasks easier:

- **Bulk operations:** review several reports together and advance, close, or delete eligible issues in one request or table action.
- **Related fixes:** let the agent identify issues that share a cause and group them into a single fix, with verification recorded for each report.
- **One-click fixes:** use **Quick fix** for issues assessed as ready for a bounded implementation. The button starts the fix and checks; accepting closure remains a separate step. Hosts without interactive buttons provide copyable commands.
- **Working with other skills:** use local reports as context for planning and review. For example, ask the agent to review locally stored Wayfinder tickets together, or use grilling to challenge an issue's assumptions and scope before implementation. The files provide shared context; these skills do not need a dedicated integration with this queue.

GitHub and Jira remain useful for team coordination. A local queue is a convenient place to work through issues with a coding agent, whether or not you also use an external tracker.

## Install

Once these files are published to GitHub:

```sh
npx skills add ohthepain/local-issues-skills --skill setup-local-issues --skill issue --skill fix-issues --skill issues
```

Any skill can also be installed alone by selecting only its name. Each queue skill includes its own queue contract; `proto-tutorial` and `edit-mode` are independent of the queue. See the [skills CLI documentation](https://github.com/vercel-labs/skills) for agent and installation options.

Codex is the initial target. Other agents have not been behaviorally validated. Invoke the installed skill by name (for example, `$issue`, `$fix-issues`, or `$issues` in Codex); interfaces may display them as slash commands.

## Workflow

Use `/issues` (or `$issues` in Codex) to list the queue. Select a report with `/issues ebbb`; then follow-up feedback such as “it needs to be even darker” applies to that same report. Selection opens or reuses the relevant web preview, and concrete revision requests update the issue and app without starting the entire fix queue. Listing is read-only; selection may open the preview but does not edit source or change report state. Each status includes Request advance for a valid configured successor, or Delete for closed reports. Evidence is checked when an action is requested. Use `/issues ebbb next` to advance when prerequisites are met, or `/issues ebbb delete` to remove a report without reverting code. Status changes do not run the fixer or claim unperformed verification. In Codex, the skill renders an interactive inline table with Work on issue and status buttons using `window.openai.sendFollowUpMessage`. Buttons submit a scoped request; the model validates and updates the saved report. Hosts without the chat bridge get a copyable command fallback. Actual host dispatch needs a live chat trial.

A report assessed by the model as ready for a bounded fix without further input can show **Quick fix** beneath **Work on issue**. Clicking it authorizes that issue’s implementation, checks, and saved local commit policy, with readiness rechecked before edits. Closure still requires acceptance. Listing uses saved assessments rather than investigating each report.

For several updates, check the relevant rows and use **Close selected**, **Advance selected**, or **Delete selected**. Each sends one message and refreshes the table once. Closing accepts only reports awaiting closure; deletion applies only to closed reports. Mixed selections skip ineligible rows and report the results. Typed equivalents include `/issues close f838 0db3 d1cf 9394`, `/issues next <ID> <ID>`, and `/issues delete <ID> <ID>`.

Ask `issue` to capture bugs or feature requests; independent numbered items become separate reports, while reproduction steps stay together. Features and workflow enhancements can skip reproduction. After clarification, the model decides whether an optional `ready-to-prototype` stage would help settle design decisions before implementation. Existing lifecycle files remain valid without that optional role. Ask `issue` to capture a bug. Reply `repro <ID>` to investigate it in the web app preview, with clarification before unclear steps or after an unsuccessful attempt. You can also invoke `fix-issues` directly when ready to work the queue. Run `setup-local-issues` to configure Jira-style states (`backlog`, `to-do`, `in-progress`, `in-review`, `ready-for-commit`, `resolved`, `closed`). Edit the State and Next state columns to rename or insert stages; transitions follow those explicit links. Existing lifecycle files are preserved. First capture also initializes local triage definitions and preferences; the first fix run asks whether to commit unless you already supplied a choice. Git projects exclude the queue locally, preserving any already tracked reports.

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

Requires Python 3.9 or newer for the repository checks; the fast issues listing requires Node.js 22+. Its TypeScript source is built into standalone JavaScript with a bundled YAML parser; installed skills need no package installation. Python remains available for the manual reviewed-manifest renderer.

Edit the relevant `skills/<name>/SKILL.md`. Edit the lifecycle seed in `skills/setup-local-issues/triage-labels.md`; `--sync` bundles it with every standalone queue skill. Edit shared workflow rules only in `references/queue.md`, then refresh the committed standalone bundles:

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

For helper development, run `npm ci`, `npm run build`, `npm run typecheck`, and `npm test`. Commit the generated `skills/issues/scripts/list-issues.mjs` and YAML license with source changes. Listing uses one helper invocation; the model still invokes it and displays the output.

## Publication

Before publishing, run the checks, review the complete diff, and record any manual validation limitations. Commit and push only when explicitly requested. This repository uses the standard `skills/<name>/SKILL.md` layout; it does not require an npm package. See [skills.sh documentation](https://skills.sh/docs) for installation and directory information. No skills.sh listing or public release is implied by local validation.

## License

[MIT](LICENSE)

## Guided verification and reproduction

Invoke `/repro-steps` (or `$repro-steps` in Codex) to build a lightweight recorder in a web app. The user drives; Start recording, Restart, Stop recording, and Bug reproduced produce a copyable Markdown recipe and ordered action log. Collection stays in memory, survives same-document navigation, and clears on full reload. Stop recording ends capture without marking a bug as reproduced. Reports are neither saved nor submitted automatically. The skill works alone or alongside tutorial, with independent controls. Install the standalone `skills/repro-steps` folder. This is an instruction bundle that generates app-specific tooling, not a prebuilt recorder extension.

Invoke `/proto-tutorial` (or `$proto-tutorial` in Codex) with a fix, issue, or reproduction steps. The skill creates one explicitly launched walkthrough, preferably in the actual app, with Back, Next, Skip, Restart, Close, and Reopen controls. Navigation alone does not verify a fix. Restart resets safe tutorial-owned fixtures while preserving real app changes. Results stay in memory with a Copy report action; issue transitions remain separate.

For local installation, link `skills/proto-tutorial` into your agent's skill directory as `proto-tutorial`. It requires no sibling skill or queue setup.

## Visual feedback and editing

Invoke `/edit-mode on` (or `$edit-mode on` in Codex) with accessible website source; bare `/edit-mode` also enables it. First use generates local development tooling; subsequent uses reuse it. `/edit-mode off` disables it without deleting drafts or tooling. Fresh app launches and full reloads default off; feedback drafts survive same-origin navigation. Overlay files stay locally excluded through Git info/exclude and outside production build inputs, without persistent tracked integration changes. **Done** exits edit mode and opens review with checked-by-default checkboxes. **Confirm and send** submits the selected requests for implementation; ambiguous interpretations require clarification before edits. It then runs available checks and reloads the app with edit mode off when browser access permits.

The bundle contains integration instructions, not a prebuilt extension. Browser access and feedback transfer depend on the host; Copy/export and chat confirmation provide a fallback. For local installation, link `skills/edit-mode` into your agent's skill directory as `edit-mode`.

Edit-mode resizing previews actual element dimensions and layout. A bold italic **f** button on text elements previews font family, size, and color. These browser-only previews are reversible; Done/off restores app styling while preserving requests for confirmation.
