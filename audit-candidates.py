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


def normalize_rel(path):
    return str(path).replace("\\", "/")


def candidate_root_from_match(match, marker):
    marker_parts = marker.parts
    current = Path(match)
    for _ in marker_parts:
        current = current.parent
    return current


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
        direct = root / marker
        if direct.exists():
            candidates.add(root)
        if len(marker.parts) == 1:
            matches = root.rglob(marker.name)
        else:
            matches = root.rglob(marker.parts[-1])
        for match in matches:
            match_path = Path(match)
            if tuple(match_path.parts[-len(marker.parts):]) == marker.parts:
                candidates.add(candidate_root_from_match(match_path, marker))
    scored = []
    for candidate in candidates:
        if not candidate.exists() or not candidate.is_dir():
            continue
        score = sum(1 for marker in markers if (candidate / marker).exists())
        score += 3 if (candidate / "services/org-core/src/api").exists() else 0
        score += 3 if (candidate / "services/org-core/src/db").exists() else 0
        score += 3 if (candidate / "services/org-core/src/app/routes.js").exists() else 0
        scored.append((score, normalize_rel(candidate), candidate))
    return [item[2] for item in sorted(scored, key=lambda item: (-item[0], item[1]))]


def manifest_for_root(root):
    root = Path(root)
    files = []
    for path in sorted(root.rglob("*")):
        if path.is_file():
            rel = normalize_rel(path.relative_to(root))
            item = {
                "path": rel,
                "size": path.stat().st_size,
                "sha256": sha256_file(path)
            }
            item.update(text_stats(path))
            files.append(item)
    return files


def dir_entries(path):
    p = Path(path)
    if not p.exists() or not p.is_dir():
        return []
    return sorted(item.name for item in p.iterdir())


def score_project(files):
    paths = {item["path"]: item for item in files}
    text_files = [item for item in files if not item.get("binary")]
    code_exts = (".js", ".ts", ".tsx", ".jsx", ".py", ".sql", ".yml", ".yaml", ".json", ".md", ".txt", "Dockerfile")
    code_or_doc = [item for item in text_files if item["path"].endswith(code_exts) or item["path"].endswith("Dockerfile")]
    substantial = [item for item in code_or_doc if item.get("nonempty_line_count", 0) >= 20]
    required = [
        "docker-compose.yml",
        ".env.example",
        "services/org-core/package.json",
        "services/org-core/Dockerfile",
        "services/org-core/src/app/routes.js",
        "services/org-core/src/app/server.js",
        "services/org-core/src/api",
        "services/org-core/src/db",
        "services/org-core/migrations"
    ]
    presence = {}
    for req in required:
        if req.endswith("/api") or req.endswith("/db") or req.endswith("/migrations"):
            presence[req] = any(path == req or path.startswith(req + "/") for path in paths)
        else:
            presence[req] = req in paths
    return {
        "file_count": len(files),
        "text_file_count": len(text_files),
        "code_or_doc_file_count": len(code_or_doc),
        "substantial_code_or_doc_file_count": len(substantial),
        "total_size": sum(item.get("size", 0) for item in files),
        "total_nonempty_lines": sum(item.get("nonempty_line_count", 0) for item in text_files),
        "required_presence": presence
    }


def main():
    env = load_env(os.environ.get("AUDIT_ENV", ".env.audit-candidates"))
    roots = split_csv(env.get("AUDIT_ROOTS", ""))
    if not roots:
        raise SystemExit("AUDIT_ROOTS is required")
    output_dir = Path(env.get("AUDIT_OUTPUT_DIR", "audit-report"))
    output_dir.mkdir(parents=True, exist_ok=True)
    report = {}
    summary_lines = []
    ranking = []
    for root_name in roots:
        root = Path(root_name)
        root_report = {"exists": root.exists(), "project_roots": []}
        if root.exists():
            project_roots = find_project_roots(root)
            for project_root in project_roots:
                files = manifest_for_root(project_root)
                paths = {item["path"] for item in files}
                src_dir = project_root / "services/org-core/src"
                scored = score_project(files)
                root_report["project_roots"].append({
                    "root": normalize_rel(project_root),
                    "score": scored,
                    "has_services_org_core_src_app_routes": "services/org-core/src/app/routes.js" in paths,
                    "has_services_org_core_src_app_server": "services/org-core/src/app/server.js" in paths,
                    "top_level_entries": dir_entries(project_root),
                    "services_org_core_src_entries": dir_entries(src_dir),
                    "files": files
                })
                rank_score = (
                    scored["total_nonempty_lines"]
                    + scored["substantial_code_or_doc_file_count"] * 100
                    + sum(1 for value in scored["required_presence"].values() if value) * 500
                )
                ranking.append({
                    "artifact": root_name,
                    "root": normalize_rel(project_root),
                    "rank_score": rank_score,
                    "file_count": scored["file_count"],
                    "total_nonempty_lines": scored["total_nonempty_lines"],
                    "substantial_code_or_doc_file_count": scored["substantial_code_or_doc_file_count"],
                    "required_presence": scored["required_presence"]
                })
        report[root_name] = root_report
    ranking = sorted(ranking, key=lambda item: (-item["rank_score"], item["artifact"], item["root"]))
    report["_ranking"] = ranking
    output_json = output_dir / "actual-candidates-audit.json"
    output_json.write_text(json.dumps(report, indent=2), encoding="utf-8")
    summary_lines.append("# Actual candidates audit")
    summary_lines.append("")
    summary_lines.append("## Ranking")
    for item in ranking:
        summary_lines.append(f"- {item['artifact']} :: {item['root']}")
        summary_lines.append(f"  - rank_score: {item['rank_score']}")
        summary_lines.append(f"  - file_count: {item['file_count']}")
        summary_lines.append(f"  - total_nonempty_lines: {item['total_nonempty_lines']}")
        summary_lines.append(f"  - substantial_code_or_doc_file_count: {item['substantial_code_or_doc_file_count']}")
        missing = [key for key, value in item["required_presence"].items() if not value]
        summary_lines.append(f"  - missing_required: {', '.join(missing) if missing else 'none'}")
    summary_lines.append("")
    summary_lines.append("## Candidate details")
    for root_name, root_report in report.items():
        if root_name == "_ranking":
            continue
        summary_lines.append(f"### {root_name}")
        summary_lines.append(f"exists: {root_report['exists']}")
        if not root_report["project_roots"]:
            summary_lines.append("project_roots: none detected")
        for project_root in root_report["project_roots"]:
            score = project_root["score"]
            summary_lines.append(f"root: {project_root['root']}")
            summary_lines.append(f"file_count: {score['file_count']}")
            summary_lines.append(f"total_nonempty_lines: {score['total_nonempty_lines']}")
            summary_lines.append(f"substantial_code_or_doc_file_count: {score['substantial_code_or_doc_file_count']}")
            summary_lines.append(f"has routes.js: {project_root['has_services_org_core_src_app_routes']}")
            summary_lines.append(f"has server.js: {project_root['has_services_org_core_src_app_server']}")
            summary_lines.append(f"src entries: {', '.join(project_root['services_org_core_src_entries'])}")
        summary_lines.append("")
    output_md = output_dir / "summary.md"
    output_md.write_text("\n".join(summary_lines).rstrip() + "\n", encoding="utf-8")
    print(f"wrote {output_json}")
    print(f"wrote {output_md}")


if __name__ == "__main__":
    main()