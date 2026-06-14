from pathlib import Path
import hashlib
import json
import os


def load_env(path):
    values = {}
    env_path = Path(path)
    if not env_path.exists():
        raise SystemExit(f"Missing env file: {env_path}")
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def split_csv(value):
    return [item.strip() for item in value.split(",") if item.strip()]


def sha256_file(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def text_stats(path):
    data = Path(path).read_bytes()
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return {"binary": True}
    return {
        "binary": False,
        "line_count": len(text.splitlines()),
        "nonempty_line_count": sum(1 for line in text.splitlines() if line.strip())
    }


def find_project_roots(root):
    root = Path(root)
    markers = [
        Path("docker-compose.yml"),
        Path(".env.example"),
        Path("services/org-core/package.json"),
        Path("services/org-core/src")
    ]
    candidates = set()
    for marker in markers:
        if (root / marker).exists():
            candidates.add(root)
        for match in root.rglob(marker.name):
            for marker_path in markers:
                parts = marker_path.parts
                match_parts = match.parts
                if len(match_parts) >= len(parts) and match_parts[-len(parts):] == parts:
                    candidates.add(Path(*match_parts[:-len(parts)]))
    scored = []
    for candidate in candidates:
        score = sum(1 for marker in markers if (candidate / marker).exists())
        scored.append((score, str(candidate), candidate))
    return [item[2] for item in sorted(scored, key=lambda item: (-item[0], item[1]))]


def manifest_for_root(root):
    root = Path(root)
    files = []
    for path in sorted(root.rglob("*")):
        if path.is_file():
            rel = str(path.relative_to(root)).replace("\\", "/")
            item = {
                "path": rel,
                "size": path.stat().st_size,
                "sha256": sha256_file(path)
            }
            item.update(text_stats(path))
            files.append(item)
    return files


def main():
    env = load_env(os.environ.get("AUDIT_ENV", ".env.audit-roots"))
    roots = split_csv(env.get("AUDIT_ROOTS", ""))
    if not roots:
        raise SystemExit("AUDIT_ROOTS is required")
    output_dir = Path(env.get("AUDIT_OUTPUT_DIR", "actual-tree-audit"))
    output_dir.mkdir(parents=True, exist_ok=True)
    report = {}

    for root_name in roots:
        root = Path(root_name)
        root_report = {"exists": root.exists(), "project_roots": []}
        if root.exists():
            for project_root in find_project_roots(root):
                files = manifest_for_root(project_root)
                paths = {item["path"] for item in files}
                src_dir = project_root / "services/org-core/src"
                root_report["project_roots"].append({
                    "root": str(project_root),
                    "file_count": len(files),
                    "has_services_org_core_src_app_routes": "services/org-core/src/app/routes.js" in paths,
                    "has_services_org_core_src_app_server": "services/org-core/src/app/server.js" in paths,
                    "top_level_entries": sorted(item.name for item in project_root.iterdir()) if project_root.exists() else [],
                    "services_org_core_src_entries": sorted(item.name for item in src_dir.iterdir()) if src_dir.exists() else [],
                    "files": files
                })
        report[root_name] = root_report

    output_path = output_dir / "actual-tree-audit.json"
    output_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    summary_path = output_dir / "actual-tree-summary.txt"
    lines = []
    for root_name, root_report in report.items():
        lines.append(root_name)
        lines.append(f"  exists: {root_report['exists']}")
        for project_root in root_report["project_roots"]:
            lines.append(f"  root: {project_root['root']}")
            lines.append(f"    file_count: {project_root['file_count']}")
            lines.append(f"    has routes.js: {project_root['has_services_org_core_src_app_routes']}")
            lines.append(f"    has server.js: {project_root['has_services_org_core_src_app_server']}")
            lines.append(f"    src entries: {', '.join(project_root['services_org_core_src_entries'])}")
        lines.append("")

    summary_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {output_path}")
    print(f"wrote {summary_path}")


if __name__ == "__main__":
    main()