#!/usr/bin/env python3
"""Create a content-addressed inventory of deployed local web resources."""
import hashlib
import json
import pathlib
import re
import subprocess

root = pathlib.Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
paths = set()
for attr in re.findall(r'(?:src|data-src|href)="([^"]+)"', html):
    path = attr.split("?", 1)[0].split("#", 1)[0]
    if "://" not in path and path.endswith((".js", ".css")):
        paths.add(path)
# Lazy 3D engine and official images must remain independently versioned.
for path in ["3d-test/prototype-engine.js", "vendor/babylonjs/7.54.3/babylon.js"]:
    paths.add(path)
for file in (root / "assets/backgrounds").rglob("*"):
    if file.is_file() and file.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg"):
        paths.add(file.relative_to(root).as_posix())
for file in (root / "3d-test").glob("*.css"):
    paths.add(file.relative_to(root).as_posix())

files = {}
for path in sorted(paths):
    local = root / path
    if not local.is_file():
        raise SystemExit(f"Resource is missing: {path}")
    files[path] = hashlib.sha256(local.read_bytes()).hexdigest()[:24]
manifest = {"schema": 1, "algorithm": "sha256-96", "files": files}
print(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", end="")
