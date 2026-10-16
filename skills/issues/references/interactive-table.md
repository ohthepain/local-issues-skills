# Interactive issue table in Codex

Use the host's inline visualization renderer, not a Markdown table containing button-looking text. This skill bundles a real HTML fragment with native buttons wired to `window.openai.sendFollowUpMessage({prompt})`. Follow the available visualization skill's rendering instructions when present. No MCP server or network service is needed for this fragment.

1. After reading the reports and local states, write a reviewed JSON manifest in a temporary task directory:

```json
{
  "project_root": "/absolute/path/to/project",
  "issues": [
    {
      "id": "full-saved-id",
      "title": "Original report title",
      "state": "ready-to-close",
      "next_state": "closed"
    }
  ]
}
```

Use full saved IDs. Include `next_state` only when the progression and prerequisites are established from the report and project definitions; otherwise omit it and provide a short `blocked_reason`. Closed reports automatically get Delete. Preserve unknown state labels; malformed reports may be listed separately in prose rather than fabricating IDs. This is a presentation manifest, never competing queue state. Do not include secrets or attachment contents.

2. Run `python3 <this-skill>/scripts/render_table.py <manifest.json> <absolute-output.html>`. Choose a unique durable output path in the thread's writable visualization directory, or another task-owned output directory readable by the conversation; do not render from a system temporary output path.
3. Return the following content reference in the final response, substituting the generated absolute path. This invokes the interactive renderer; a Markdown file link, code fence, raw HTML in a message, or ordinary browser preview does not provide the same chat bridge.

```text
visualize{"path":"/absolute/output/issue-table.html"}
```

The rendered table places the status button beneath the status, and a Work on issue button in each row. Actions submit their original project, full ID, expected state, and explicit target; they never mutate the report in browser JavaScript. Read the actual report on dispatch and enforce the queue contract before updating it. Render a fresh table after a status action; do not optimistically show a saved transition or deletion before the model completes it. Old tables are snapshots, so stale dispatch must be checked even if an old button still looks active.

The bridge is feature-detected. If missing or rejected/cancelled, the component displays a copyable follow-up request rather than claiming success. A successful dispatch disables that button to avoid repeat requests. The host may require confirmation before posting a message. This is a persistent row action, not the model's Repro/Keep choice dialog. Actual rendering and dispatch must be verified in a live chat; a local browser without a host bridge cannot test host integration.
