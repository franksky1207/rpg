"""Real bound art attestations, refusal cases, pixel boundaries and model gate."""
import copy
import importlib.util
import json
import pathlib
import unittest
from unittest.mock import patch
import test_database as db
m=db.m
REPO=db.REPO

spec=importlib.util.spec_from_file_location('model_gate',REPO/'scripts/equipment-modeling-gate.py')
gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)

class AutonomousReviewTests(unittest.TestCase):
    setUp=db.DatabaseTests.setUp
    tearDown=db.DatabaseTests.tearDown
    snapshot=db.DatabaseTests.snapshot
    def row(self,identity='g026'):
        return next(r for r in m.load(self.index)['sets'] if r['id']==identity)
    def record(self,identity='g026'):
        row=self.row(identity)
        return m.load(self.root/row['directory']/'art-review.json')
    def check(self,record=None,identity='g026'):
        row=self.row(identity)
        return m.art_review.verify(self.root,row,row['images'],record or self.record(identity))
    def force_pass(self,record,identity):
        row=self.row(identity);file=self.root/row['directory']/record['evidenceFile'];text=file.read_text()
        for stage in record['stages']:
            stage['passed']=True
            for check in stage['checks'].values():check['result']='pass'
        record.update(conceptApproved=True,outcome='pass',outstandingDefects=[])
        record['evidenceSha256']=m.sha(text.encode())
        return record
    def test_four_existing_sets_have_verified_two_stage_passes(self):
        for identity in ('g026','g027','g028','g029'):
            self.assertTrue(self.check(identity=identity)[0])
    def test_legacy_failures_preserved_but_v3_allows_production(self):
        self.assertEqual(self.check(identity='g024')[2],'needs-local-correction')
        self.assertEqual(self.check(identity='g030')[2],'needs-art-evidence')
        self.assertTrue(self.row('g024')['assetProductionEligible'])
        self.assertTrue(self.row('g030')['assetProductionEligible'])
    def test_missing_stage_rejected(self):
        record=self.record();record['stages'].pop()
        with self.assertRaisesRegex(ValueError,'two review stages'):self.check(record)
    def test_one_flag_does_not_approve_failure(self):
        record=self.record('g030');record['conceptApproved']=True
        with self.assertRaisesRegex(ValueError,'contradicts evidence'):self.check(record,'g030')
    def test_stage_cannot_self_pass_unverified_criterion(self):
        record=self.record();record['stages'][1]['checks']['fiveSlotOwnership']['result']='unverified'
        with self.assertRaisesRegex(ValueError,'contradicts checks'):self.check(record)
    def test_incomplete_criteria_rejected(self):
        record=self.record();record['stages'][0]['checks'].pop('pairedShoes')
        with self.assertRaisesRegex(ValueError,'complete art criteria'):self.check(record)
    def test_observation_must_appear_in_hashed_evidence(self):
        record=self.record();record['stages'][0]['checks']['pairedShoes']['observation']='This invented observation was never recorded in the evidence.'
        with self.assertRaisesRegex(ValueError,'observations required'):self.check(record)
    def test_open_defect_cannot_be_passed(self):
        record=self.record();record['outstandingDefects']=[record['stages'][0]['checks']['pairedShoes']['observation']]
        with self.assertRaisesRegex(ValueError,'contradicts evidence'):self.check(record)
    def test_current_images_and_stage_images_bound(self):
        for location in ('imageSha256','stage'):
            record=self.record()
            target=record['imageSha256'] if location=='imageSha256' else record['stages'][1]['imageSha256']
            target[m.IMAGES[0]]='0'*64
            with self.assertRaisesRegex(ValueError,'image evidence stale'):self.check(record)
    def test_formal_identity_and_sop_hash_bound(self):
        for key in ('formalSha256','authorizationSha256','evidenceSha256','generationEvidenceSha256'):
            record=self.record();record[key]='0'*64
            with self.assertRaises(ValueError):self.check(record)
    def test_review_order_is_enforced(self):
        record=self.record();record['stages'].reverse()
        with self.assertRaisesRegex(ValueError,'reviewer/order'):self.check(record)
    def test_fake_g024_pass_cannot_launder_original_disc(self):
        record=self.force_pass(self.record('g024'),'g024')
        with self.assertRaisesRegex(ValueError,'unresolved original knee-disc'):self.check(record,'g024')
    def test_fake_g030_pass_cannot_launder_missing_back_view(self):
        record=self.force_pass(self.record('g030'),'g030')
        with self.assertRaisesRegex(ValueError,'armor-back visual evidence'):self.check(record,'g030')
    def test_model_gate_accepts_only_verified_art_and_never_releases(self):
        result=gate.eligible(self.root,'G026')
        self.assertEqual(result['conceptStatus'],'pass-with-advisory')
        self.assertEqual(result['modelStatus'],'not-started')
        self.assertIs(result['formalReleaseAllowed'],False)
        for identity in ('g081','u001','h01'):
            with self.assertRaisesRegex(ValueError,'verified art review required'):gate.eligible(self.root,identity)
    def test_model_gate_revalidates_tampered_approval(self):
        data=m.load(self.index);next(r for r in data['sets'] if r['id']=='g081').update(conceptApproved=True,modelingEligible=True)
        self.index.write_text(m.dumps(data))
        with self.assertRaises(ValueError):gate.eligible(self.root,'g081')
    def test_legacy_approvals_preserved_byte_exact(self):
        for identity in ('g006','g007'):
            row=self.row(identity);directory=self.root/row['directory']
            self.assertIs(row['conceptApproved'],True)
            self.assertEqual(row['artReviewMode'],'two-stage-2.5d')
            for name in ('art-review.json',):
                self.assertEqual((directory/name).read_bytes(),(REPO/row['directory']/name).read_bytes())
        before=self.snapshot()
        gate.eligible(self.root,'g007')
        self.assertEqual(before,self.snapshot())
    def test_missing_image_cannot_be_approved(self):
        row=self.row();row['images'].pop()
        with self.assertRaisesRegex(ValueError,'image evidence stale'):m.art_review.verify(self.root,row,row['images'],self.record())
    def test_repair_verifies_pixels_not_declared_zero(self):
        row=self.row('g024');directory=self.root/row['directory'];archive=directory/'history/2026-10-15/equipment-five-slots.webp';archive.parent.mkdir(parents=True,exist_ok=True)
        archive.write_bytes((directory/m.IMAGES[1]).read_bytes())
        original_sha=m.sha(archive.read_bytes());current=directory/m.IMAGES[1]
        # Use a real rejected image-gen edit, not procedural artwork; exercise only technical diff guard.
        candidate=REPO/'docs/evidence/batch28-autonomous-review/g024-rejected-mask.webp'
        current.write_bytes(candidate.read_bytes())
        measured=m.load(REPO/'docs/evidence/batch28-autonomous-review/g024-local-attempts.json')
        record={'localRepair':{'originalSha256':original_sha,'imageSha256':m.sha(current.read_bytes()),'targetBoxes':measured['targetBoxes'],'outsideChangedPixels':0,'insideChangedPixels':measured['insideChangedPixels']}}
        m.art_review.verify_g024_repair(self.root,row,record)
        # A pixel outside the target is changed only in a mocked decoder test fixture.
        from PIL import Image
        original_open=Image.open
        def altered_open(path):
            image=original_open(path)
            if pathlib.Path(path)==current:
                image.load();image=image.convert('RGB');image.putpixel((10,10),(255,0,0))
            return image
        with patch('PIL.Image.open',side_effect=altered_open):
            with self.assertRaisesRegex(ValueError,'non-target pixels'):m.art_review.verify_g024_repair(self.root,row,record)
        record['localRepair']['targetBoxes']=[[0,0,1491,1055]]
        with self.assertRaisesRegex(ValueError,'target exceeds'):m.art_review.verify_g024_repair(self.root,row,record)

if __name__=='__main__':unittest.main()
