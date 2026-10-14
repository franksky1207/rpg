#!/usr/bin/env python3
"""Read-only equipment concept batch planner; never creates/replaces artwork."""
import contextlib
import importlib.util
import io
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = Path("development/3d-source/equipment/concepts")
IMAGES = ("overview-front-side-back.webp", "equipment-five-slots.webp")


spec=importlib.util.spec_from_file_location('catalog',ROOT/'scripts/equipment-concepts.py')
catalog=importlib.util.module_from_spec(spec);spec.loader.exec_module(catalog)

def plan(root=ROOT, batch=None):
    data = json.loads((root / BASE / "_concept-index.json").read_text(encoding="utf-8"))
    rows = data["sets"]
    if len(rows) != 210 or len({r["id"] for r in rows}) != 210:
        raise ValueError("210 unique indexed sets required")
    groups = []
    for epoch, prefix, count in (("galaxy", "g", 100), ("universe", "u", 100), ("higher", "h", 10)):
        expected = [r for r in rows if r["epoch"] == epoch]
        if len(expected) != count:
            raise ValueError(f"{epoch}: expected {count} sets")
        for start in range(1, count + 1, 10):
            ids = [f"{prefix}{i:03d}" if epoch != "higher" else f"h{i:02d}" for i in range(start, start + 10)]
            subset = []
            for identity in ids:
                matches = [r for r in expected if r["id"] == identity]
                if len(matches) != 1:
                    raise ValueError(f"Missing/duplicate formal ID: {identity}")
                r = matches[0]
                directory = root / r["directory"]
                if not directory.is_dir() or not (directory / "concept-notes.md").is_file():
                    raise ValueError(f"{identity}: missing notes directory")
                actual = [name for name in IMAGES if (directory / name).is_file()]
                recorded = [item["file"] for item in r["images"]]
                if actual != recorded:
                    raise ValueError(f"{identity}: image list differs from index; run catalog generate/validate first")
                if bool(r["conceptApproved"]) != (r["conceptStatus"] in ("approved", "auto-art-reviewed")):
                    raise ValueError(f"{identity}: approval status contradiction")
                if r["conceptApproved"] and len(actual) != 2:
                    raise ValueError(f"{identity}: approved without two images")
                subset.append({
                    "id": identity, "sourceKey": r["sourceKey"], "regionOrBoss": r["regionOrBoss"],
                    "equipmentNames": r["equipmentNames"], "directory": r["directory"],
                    "present": actual, "missing": [name for name in IMAGES if name not in actual],
                    "approved": r["conceptApproved"], "conceptStatus": r["conceptStatus"],
                    "modelStatus": r["modelStatus"],
                })
            missing = sum(len(r["missing"]) for r in subset)
            approved = sum(r["approved"] for r in subset)
            groups.append({
                "batch": f"{prefix.upper()}{(start-1)//10+1:02d}",
                "range": f"{ids[0]}..{ids[-1]}", "epoch": epoch,
                "status": "images-ready-awaiting-review" if not missing and approved < 10 else "approved" if approved == 10 else "not-started" if missing == 20 else "partial-needs-resume",
                "imagesPresent": 20 - missing, "imagesMissing": missing, "approvedSets": approved,
                "sets": subset,
            })
    if batch:
        groups = [g for g in groups if g["batch"].lower() == batch.lower()]
        if not groups:
            raise ValueError(f"Unknown batch {batch!r}; examples G01, U01, H01")
    with contextlib.redirect_stdout(io.StringIO()): catalog.run(root)
    return groups


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("status", "plan"))
    parser.add_argument("--batch", help="e.g. G02 (g011..g020), U01, H01")
    args = parser.parse_args()
    try:
        groups = plan(batch=args.batch)
        if args.command == "plan":
            for group in groups:
                for row in group["sets"]:
                    if row["missing"]:
                        print(json.dumps({"batch": group["batch"], "id": row["id"],
                            "sourceKey": row["sourceKey"], "regionOrBoss": row["regionOrBoss"],
                            "equipmentNames": row["equipmentNames"], "directory": row["directory"],
                            "missing": row["missing"], "preserveExisting": row["present"],
                            "requiresUserApproval": False, "requiresVerifiedTwoStageArtReview": True}, ensure_ascii=False))
        else:
            print(json.dumps({"batches": [{k: v for k, v in g.items() if k != "sets"} for g in groups],
                "totalImagesPresent": sum(g["imagesPresent"] for g in groups),
                "totalImagesMissing": sum(g["imagesMissing"] for g in groups)}, ensure_ascii=False, indent=2))
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as exc:
        parser.exit(1, f"Equipment batch plan failed: {exc}\n")


if __name__ == "__main__":
    main()
