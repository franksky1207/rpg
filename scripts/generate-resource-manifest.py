#!/usr/bin/env python3
"""Create a content-addressed inventory of deployed local web resources."""
import hashlib
import json
import pathlib
import re

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
for file in (root / "3d-test").glob("*.js"):
    paths.add(file.relative_to(root).as_posix())
# The worker is fetched network-fresh (updateViaCache=none), but still needs a
# fingerprint for startup version diagnostics and candidate integrity checks.
paths.add("resource-cache-sw.js")
if (root / 'assets/3d/asset-registry.json').is_file():
    paths.add('assets/3d/asset-registry.json')
    registry = json.loads((root / 'assets/3d/asset-registry.json').read_text(encoding='utf-8'))
    for asset in registry['assets']:
        paths.add(asset['path'])
# Include only deployable binary media, not source archives or player saves.
MEDIA_SUFFIXES = {".ogg", ".mp3", ".wav", ".webp", ".png", ".jpg", ".jpeg",
                  ".glb", ".gltf", ".bin", ".ktx2", ".basis", ".avif"}
for directory in ("audio/assets", "3d-test/assets", "assets/3d", "assets/models"):
    base = root / directory
    if base.exists():
        for file in base.rglob("*"):
            if file.is_file() and file.suffix.lower() in MEDIA_SUFFIXES:
                paths.add(file.relative_to(root).as_posix())
# Controlled GM assets and copied whole-suit runtime; never development sources.
for directory in ('assets/gm-equipment-2_5d/v1', '3d-test/equipment-sprites-v1', 'assets/era-player/v1', 'assets/monsters/v1'):
    for file in (root / directory).rglob('*'):
        if file.is_file():
            paths.add(file.relative_to(root).as_posix())
for file in (root / '3d-test').glob('monster-*.mjs'):
    paths.add(file.relative_to(root).as_posix())
paths.add('monstercodeximage.mjs')
paths.add('3d-test/gm-era-sprites.mjs')
paths.add('3d-test/era-player-sprites.mjs')
paths.add('3d-test/fixture-owner-history.json')
# index.html stays network-fresh and is not a cache-first resource.

files = {}
for path in sorted(paths):
    local = root / path
    if not local.is_file():
        raise SystemExit(f"Resource is missing: {path}")
    files[path] = hashlib.sha256(local.read_bytes()).hexdigest()[:24]
manifest = {"schema": 1, "algorithm": "sha256-96", "files": files}
print(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", end="")
