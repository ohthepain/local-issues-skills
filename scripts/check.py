"""Check standalone skill bundles; --sync refreshes bundled queue contracts."""
from pathlib import Path
import argparse
import re

ROOT = Path(__file__).resolve().parents[1]
NAMES = ("issue", "fix-issues", "issues", "setup-local-issues")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sync", action="store_true")
    args = parser.parse_args()
    contract = (ROOT / "references/queue.md").read_bytes()
    template = (ROOT / "skills/setup-local-issues/triage-labels.md").read_bytes()
    errors = []
    for name in NAMES:
        folder = ROOT / "skills" / name
        target = folder / "references/queue.md"
        if args.sync:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(contract)
        if not target.is_file() or target.read_bytes() != contract:
            errors.append(f"{name}: bundled contract differs; run with --sync")
        seed = folder / "triage-labels.md"
        if args.sync and name != "setup-local-issues":
            seed.write_bytes(template)
        if not seed.is_file() or seed.read_bytes() != template:
            errors.append(f"{name}: bundled lifecycle template differs; run with --sync")
        text = (folder / "SKILL.md").read_text()
        parts = text.split("---", 2)
        if len(parts) != 3 or parts[0].strip():
            errors.append(f"{name}: missing YAML frontmatter")
            continue
        fields = dict(re.findall(r"^(name|description): (.+)$", parts[1], re.M))
        if fields.get("name") != name or not fields.get("description", "").strip():
            errors.append(f"{name}: expected matching name and nonempty description")
        for link in re.findall(r"\[[^\]]*\]\(([^)]+)\)", parts[2]):
            path = (folder / link).resolve()
            if not path.is_relative_to(folder.resolve()) or not path.is_file():
                errors.append(f"{name}: missing or nonlocal reference: {link}")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"All {len(NAMES)} skill bundles pass metadata, reference, and contract checks.")

if __name__ == "__main__":
    main()
