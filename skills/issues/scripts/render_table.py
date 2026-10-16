"""Render a reviewed issue manifest as an inline HTML fragment (no queue writes)."""
import argparse
import html
import json
from pathlib import Path
import uuid


def render(data):
    if not isinstance(data.get('project_root'), str) or not Path(data['project_root']).is_absolute():
        raise ValueError('project_root must be an absolute path')
    if not isinstance(data.get('issues'), list):
        raise ValueError('issues must be a list')
    seen = set()
    for issue in data['issues']:
        for key in ('id', 'title', 'state'):
            if not isinstance(issue.get(key), str) or not issue[key]:
                raise ValueError(f'each issue needs a nonempty {key}')
        if issue['id'] in seen:
            raise ValueError('duplicate issue ID')
        seen.add(issue['id'])
        for key in ('next_state', 'blocked_reason', 'display_id'):
            if issue.get(key) is not None and not isinstance(issue[key], str):
                raise ValueError(f'{key} must be a string or null')
    # Escape script terminators and Unicode separators; titles are rendered with textContent.
    payload = json.dumps(data, ensure_ascii=True).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    template = (Path(__file__).resolve().parents[1] / 'assets/issue-table.html').read_text()
    caption = html.escape(data.get('caption', f"Local issues — {Path(data['project_root']).name}"))
    return template.replace('__ROOT__', 'issues-' + uuid.uuid4().hex).replace('__CAPTION__', caption).replace('__DATA__', payload)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    fragment = render(json.loads(args.manifest.read_text()))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(fragment)
    print(args.output.resolve())


if __name__ == '__main__':
    main()
