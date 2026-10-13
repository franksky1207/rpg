"""Batch progress is derived from the verified catalog and actual image presence."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("batch_planner",ROOT/"scripts/equipment-concept-batches.py")
planner=importlib.util.module_from_spec(spec)
spec.loader.exec_module(planner)


class BatchPlannerTests(unittest.TestCase):
    def test_all_buckets_and_complete_first_galaxy_batch(self):
        groups=planner.plan()
        self.assertEqual(len(groups),21)
        self.assertEqual([g["epoch"] for g in groups].count("galaxy"),10)
        self.assertEqual([g["epoch"] for g in groups].count("universe"),10)
        self.assertEqual([g["epoch"] for g in groups].count("higher"),1)
        self.assertEqual(groups[0]["batch"],"G01")
        self.assertEqual(groups[0]["imagesPresent"],20)
        self.assertEqual(groups[0]["imagesMissing"],0)
        self.assertEqual(groups[0]["approvedSets"],2)
        self.assertEqual(groups[0]["status"],"images-ready-awaiting-review")
    def test_next_batch_is_safe_to_resume(self):
        group=planner.plan(batch="g02")[0]
        self.assertEqual(group["range"],"g011..g020")
        self.assertEqual(len(group["sets"]),10)
        catalog=json.loads((ROOT/planner.BASE/"_concept-index.json").read_text())["sets"]
        missing=0
        for row in group["sets"]:
            present=[name for name in planner.IMAGES if (ROOT/row["directory"]/name).is_file()]
            absent=[name for name in planner.IMAGES if name not in present]
            self.assertEqual(row["present"],present)
            self.assertEqual(row["missing"],absent)
            self.assertFalse(set(row["present"]) & set(row["missing"]))
            self.assertEqual(len(row["equipmentNames"]),5)
            self.assertEqual(row["equipmentNames"],next(r["equipmentNames"] for r in catalog if r["id"]==row["id"]))
            missing+=len(absent)
        self.assertEqual(group["imagesMissing"],missing)
        self.assertEqual(group["imagesPresent"],20-missing)
    def test_actual_first_batch_is_not_redrawn(self):
        group=planner.plan(batch="G01")[0]
        self.assertFalse(any(row["missing"] for row in group["sets"]))
    def test_bad_batch_rejected(self):
        with self.assertRaisesRegex(ValueError,"Unknown batch"):
            planner.plan(batch="G11")
    def test_index_missing_file_drift_rejected(self):
        import tempfile
        from unittest.mock import patch
        original=planner.plan
        # Pure planner lists actual files; a missing file must be seen as drift, not drawn over.
        first=original(batch="G01")[0]["sets"][0]
        self.assertTrue(first["present"])
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            base=root/planner.BASE
            base.mkdir(parents=True)
            source=json.loads((ROOT/planner.BASE/"_concept-index.json").read_text())
            (base/"_concept-index.json").write_text(json.dumps(source),encoding="utf-8")
            for row in source["sets"]:
                directory=root/row["directory"]
                directory.mkdir(parents=True,exist_ok=True)
                (directory/"concept-notes.md").write_text("test",encoding="utf-8")
                for image in row["images"]:
                    # Only create an image placeholder for presence tests, not in real repo.
                    if row["id"] != "g001":
                        (directory/image["file"]).write_bytes(b"test")
            with self.assertRaisesRegex(ValueError,"image list differs"):
                planner.plan(root=root,batch="G01")

if __name__=="__main__":
    unittest.main()
