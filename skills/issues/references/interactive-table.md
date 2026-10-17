# Interactive issue table in Codex

## Manual fallback and reviewed manifests

The normal listing uses `scripts/list-issues.mjs` as described in SKILL.md. It offers candidate transitions as requests and checks evidence on click. The procedure below is only for a manual fallback or a separately reviewed manifest. If Node.js is unavailable, read reports and lifecycle definitions together and show a Markdown table with saved ID/title/status, explicit request commands, counts, and malformed-file warnings. Preserve oldest-first creation sorting (ID tie-break), requested filters, custom states, and read-only behavior.


Use the host's inline visualization renderer, not a Markdown table containing button-looking text. This skill bundles a real HTML fragment with native buttons wired to `window.openai.sendFollowUpMessage({prompt})`. Follow the available visualization skill's rendering instructions when present. No MCP server or network service is needed for this fragment.

1. After reading the reports and local states, write a reviewed JSON manifest in a temporary task directory:

```json
{
  "project_root": "/absolute/path/to/project",
  "acceptance_state": "resolved",
  "closed_state": "done",
  "issues": [
    {
      "id": "full-saved-id",
      "title": "Original report title",
      "state": "resolved",
      "next_state": "done"
    }
  ]
}
```

Set `acceptance_state` and `closed_state` to the State values mapped to the ready-to-close and closed roles in the project lifecycle. Legacy manifests without these fields retain canonical defaults. Use full saved IDs. Include `next_state` only when the progression and prerequisites are established from the report and project definitions; otherwise omit it and provide a short `blocked_reason`. Reports in `closed_state` automatically get Delete. Preserve unknown state labels; malformed reports may be listed separately in prose rather than fabricating IDs. This is a presentation manifest, never competing queue state. Do not include secrets or attachment contents.

2. Run `python3 <this-skill>/scripts/render_table.py <manifest.json> <absolute-output.html>`. Choose a unique durable output path in the thread's writable visualization directory, or another task-owned output directory readable by the conversation; do not render from a system temporary output path.
3. Return the following content reference in the final response, substituting the generated absolute path. This invokes the interactive renderer; a Markdown file link, code fence, raw HTML in a message, or ordinary browser preview does not provide the same chat bridge.

```text
visualize{"path":"/absolute/output/issue-table.html"}
```

The rendered table places the status button beneath the status, and a Work on issue button in each row. Row checkboxes and Select all collect a local selection. Close selected includes only acceptance-role reports with the configured terminal state as their next state; Advance selected includes other valid open transitions; Delete selected includes only reports in the configured terminal state. Each button shows its eligible count and submits one batch message; ineligible selected rows are explicitly skipped. Actions submit their original project, full ID, expected state, and explicit target; they never mutate the report in browser JavaScript. Read the actual report on dispatch and enforce the queue contract before updating it. Render a fresh table after a status action; do not optimistically show a saved transition or deletion before the model completes it. Old tables are snapshots, so stale dispatch must be checked even if an old button still looks active.

The bridge is feature-detected. If missing or rejected/cancelled, the component displays a copyable follow-up request rather than claiming success. While sending, controls are disabled. A successful mutation dispatch disables those rows until a refreshed table arrives, preventing repeat submission through individual or batch buttons. Rejection preserves selection and enables retry; dispatch does not optimistically update saved statuses. The host may require confirmation before posting a message. This is a persistent row action, not the model's Repro/Keep choice dialog. Actual rendering and dispatch must be verified in a live chat; a local browser without a host bridge cannot test host integration.
