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
        self.assertEqual(len(groups),42)
        self.assertEqual([g["epoch"] for g in groups].count("galaxy"),20)
        self.assertEqual([g["epoch"] for g in groups].count("universe"),20)
        self.assertEqual([g["epoch"] for g in groups].count("higher"),2)
        self.assertEqual(groups[0]["batch"],"G01")
        self.assertEqual(groups[0]["imagesPresent"],10)
        self.assertEqual(groups[0]["imagesMissing"],0)
        self.assertEqual(groups[0]["approvedSets"],5)
        self.assertEqual(groups[0]["status"],"approved")
    def test_next_batch_is_safe_to_resume(self):
        group=planner.plan(batch="g03")[0]
        self.assertEqual(group["range"],"g011..g015")
        self.assertEqual(len(group["sets"]),5)
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
        self.assertEqual(group["imagesPresent"],10-missing)
    def test_g07_completed_five_set_batch(self):
        group=planner.plan(batch="G07")[0]
        self.assertEqual(group["range"],"g031..g035")
        self.assertEqual(len(group["sets"]),5)
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")
        next_group=planner.plan(batch="G15")[0]
        self.assertEqual(next_group["range"],"g071..g075")
        self.assertEqual(next_group["imagesMissing"],10)
        self.assertEqual(next_group["status"],"not-started")
    def test_g08_completed_five_set_batch(self):
        group=planner.plan(batch="G08")[0]
        self.assertEqual(group["range"],"g036..g040")
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")
    def test_g09_completed_five_set_batch(self):
        group=planner.plan(batch="G09")[0]
        self.assertEqual(group["range"],"g041..g045")
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")
    def test_g10_completed_five_set_batch(self):
        group=planner.plan(batch="G10")[0]
        self.assertEqual(group["range"],"g046..g050")
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")
    def test_g11_completed_five_set_batch(self):
        group=planner.plan(batch="G11")[0]
        self.assertEqual(group["range"],"g051..g055")
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")

    def test_g12_completed_five_set_batch(self):
        group=planner.plan(batch="G12")[0]
        self.assertEqual(group["range"],"g056..g060")
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")

    def test_g13_completed_five_set_batch(self):
        group=planner.plan(batch="G13")[0]
        self.assertEqual(group["range"],"g061..g065")
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")

    def test_g14_completed_five_set_batch(self):
        group=planner.plan(batch="G14")[0]
        self.assertEqual(group["range"],"g066..g070")
        self.assertEqual(group["imagesMissing"],0)
        self.assertEqual(group["imagesPresent"],10)
        self.assertEqual(group["approvedSets"],5)
        self.assertEqual(group["status"],"approved")

    def test_higher_uses_two_five_set_batches(self):
        self.assertEqual(planner.plan(batch="H01")[0]["range"],"h01..h05")
        self.assertEqual(planner.plan(batch="H02")[0]["range"],"h06..h10")
    def test_all_five_set_ranges_are_contiguous_and_unique(self):
        groups=planner.plan()
        self.assertEqual(len(groups),42)
        ids=[row['id'] for group in groups for row in group['sets']]
        self.assertEqual(len(ids),210)
        self.assertEqual(len(set(ids)),210)
        for group in groups:
            self.assertEqual(len(group['sets']),5)
            self.assertEqual(group['range'],f"{group['sets'][0]['id']}..{group['sets'][-1]['id']}")
            self.assertEqual(group['imagesPresent']+group['imagesMissing'],10)

    def test_partially_completed_batch_is_resumable_without_overwriting(self):
        import tempfile
        from unittest.mock import patch
        source=json.loads((ROOT/planner.BASE/"_concept-index.json").read_text())
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            base=root/planner.BASE
            base.mkdir(parents=True)
            for row in source['sets']:
                directory=root/row['directory']
                directory.mkdir(parents=True,exist_ok=True)
                (directory/"concept-notes.md").write_text("fixture",encoding="utf-8")
                if row['id']=="g031":
                    image=directory/planner.IMAGES[0]
                    image.write_bytes(b"existing-image-must-be-preserved")
                    row['images']=[{"file":planner.IMAGES[0],"sha256":"fixture"}]
                    row['conceptApproved']=False
                    row['conceptStatus']='partial-images'
                elif row['id'] in ('g032','g033','g034','g035'):
                    # Isolate the one-existing-image scenario from real batch progress.
                    row['images']=[]
                    row['conceptApproved']=False
                    row['conceptStatus']='not-generated'
                else:
                    for item in row["images"]:
                        (directory/item["file"]).write_bytes(b"fixture-preserved-image")
            (base/"_concept-index.json").write_text(json.dumps(source),encoding="utf-8")
            with patch.object(planner.catalog,"run",return_value=None):
                group=planner.plan(root=root,batch="G07")[0]
            self.assertEqual(group['status'],"partial-needs-resume")
            self.assertEqual(group['imagesPresent'],1)
            self.assertEqual(group['imagesMissing'],9)
            self.assertEqual(group['sets'][0]['present'],[planner.IMAGES[0]])
            self.assertEqual(group['sets'][0]['missing'],[planner.IMAGES[1]])
            self.assertEqual((root/group['sets'][0]['directory']/planner.IMAGES[0]).read_bytes(),b"existing-image-must-be-preserved")

    def test_actual_first_batch_is_not_redrawn(self):
        group=planner.plan(batch="G01")[0]
        self.assertFalse(any(row["missing"] for row in group["sets"]))
    def test_bad_batch_rejected(self):
        with self.assertRaisesRegex(ValueError,"Unknown batch"):
            planner.plan(batch="G21")
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
