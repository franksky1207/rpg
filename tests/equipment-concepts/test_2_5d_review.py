"""Policy migration, real blockers, scoped exceptions and separate production milestones."""
import copy
import json
import test_database as db
import unittest
m=db.m

class Review25DTests(unittest.TestCase):
    setUp=db.DatabaseTests.setUp
    tearDown=db.DatabaseTests.tearDown
    snapshot=db.DatabaseTests.snapshot
    run_db=db.DatabaseTests.run_db
    # Inherit the same isolated real-source database fixture, not duplicate its tests.
    def record(self,identity='g024'):
        row=next(r for r in m.load(self.index)['sets'] if r['id']==identity)
        return row,m.load(self.root/row['directory']/'review-2_5d.json')
    def verify(self,record=None,identity='g024',row=None):
        actual,original=self.record(identity)
        return m.art_review.verify(self.root,row or actual,actual['images'],record or original)
    def seal(self,record):
        record['evidenceFingerprint']=m.art_review.fingerprint(record)
        return record
    def test_g024_g030_originals_accepted_and_not_released(self):
        for identity in ('g024','g030'):
            row,record=self.record(identity)
            self.assertEqual(self.verify(identity=identity)[::2],(True,'pass-with-advisory'))
            self.assertEqual(record['imageSha256'],{i['file']:i['sha256'] for i in row['images']})
            self.assertEqual(record['explicitlyAcceptedExceptions'][0]['acceptedBy'],'user')
            self.assertTrue(row['assetProductionEligible'])
            self.assertFalse(row['formalReleaseAllowed'])
            self.assertEqual(row['asset2_5dStatus'],'not-started')
            self.assertEqual(row['gm2_5dTestStatus'],'not-tested')
    def test_acceptance_cannot_move_to_another_set(self):
        _,accepted=self.record()
        for identity in ('g001','g030'):
            row,record=self.record(identity)
            record['explicitlyAcceptedExceptions']=accepted['explicitlyAcceptedExceptions']
            with self.assertRaisesRegex(ValueError,'exception'):self.verify(self.seal(record),identity)
    def test_acceptance_required_for_original_versions(self):
        for identity in ('g024','g030'):
            _,r=self.record(identity);r['explicitlyAcceptedExceptions']=[]
            with self.assertRaisesRegex(ValueError,'explicit accepted exception'):self.verify(self.seal(r),identity)
    def test_changed_exception_authorization_rejected(self):
        p=self.root/m.art_review.ACCEPTANCE;p.write_text(p.read_text()+'\n')
        with self.assertRaisesRegex(ValueError,'authorization changed'):self.verify()
    def test_exception_cannot_waive_true_blocker(self):
        row,r=self.record();r['stages'][1]['checks']['contentIdentity']['result']='fail'
        r['stages'][1]['passed']=False
        r['blockers']=[{'criterion':'contentIdentity','observation':r['stages'][1]['checks']['contentIdentity']['observation']}]
        with self.assertRaisesRegex(ValueError,'contradicts verified evidence'):self.verify(self.seal(r))
        r.update(conceptApproved=False,outcome='blocked')
        self.assertEqual(self.verify(self.seal(r))[::2],(False,'blocked'))
    def test_each_real_blocker_remains_blocking(self):
        for criterion in m.art_review.BLOCKERS:
            _,r=self.record('g026');check=r['stages'][1]['checks'][criterion];check['result']='unverified'
            r['stages'][1]['passed']=False;r['blockers']=[{'criterion':criterion,'observation':check['observation']}]
            r.update(conceptApproved=False,outcome='blocked')
            self.assertFalse(self.verify(self.seal(r),'g026')[0])
    def test_actual_missing_and_changed_image_rejected(self):
        row,r=self.record();p=self.root/row['directory']/m.IMAGES[0];original=p.read_bytes()
        p.unlink()
        with self.assertRaisesRegex(ValueError,'SHA changed/missing'):self.verify()
        p.write_bytes(original+b'tamper')
        with self.assertRaisesRegex(ValueError,'SHA changed/missing'):self.verify()
    def test_replaced_image_cannot_regenerate_approval(self):
        row,_=self.record();other,_=self.record('g025')
        p=self.root/row['directory']/m.IMAGES[0];p.write_bytes((self.root/other['directory']/m.IMAGES[0]).read_bytes())
        before=self.snapshot()
        with self.assertRaisesRegex(ValueError,'image evidence stale'):self.run_db(True)
        self.assertEqual(before,self.snapshot())
    def test_each_identity_field_is_bound(self):
        for field in m.art_review.IDENTITY_FIELDS:
            row,r=self.record();r['formalIdentity'][field]='wrong'
            with self.assertRaisesRegex(ValueError,'formal identity mismatch'):self.verify(self.seal(r))
    def test_fingerprint_tampering_rejected(self):
        _,r=self.record();r['reviewedAt']='2026-10-16'
        with self.assertRaisesRegex(ValueError,'fingerprint mismatch'):self.verify(r)
    def test_source_missing_or_changed_rejected(self):
        row,r=self.record('g026');p=self.root/r['sources'][0]['path'];p.unlink()
        with self.assertRaisesRegex(ValueError,'source missing/hash'):self.verify(identity='g026')
    def test_no_real_stage_evidence_cannot_pass(self):
        for field in ('source','historicalSource'):
            _,r=self.record('g026');r['stages'][0].pop(field)
            with self.assertRaisesRegex(ValueError,'review source required'):self.verify(self.seal(r),'g026')
    def test_fabricated_observation_rejected_even_resealed(self):
        _,r=self.record();r['stages'][1]['checks']['imageIntegrity']['observation']='A fabricated review never observed either real image, despite a true flag.'
        with self.assertRaisesRegex(ValueError,'sourced observations'):self.verify(self.seal(r))
    def test_missing_or_unverified_stage_cannot_pass(self):
        _,r=self.record();r['stages'].pop()
        with self.assertRaisesRegex(ValueError,'two review stages'):self.verify(self.seal(r))
        _,r=self.record();r['stages'][0]['checks']['imageIntegrity']['result']='unverified'
        with self.assertRaisesRegex(ValueError,'stage pass contradicts'):self.verify(self.seal(r))
    def test_unknown_policy_and_modified_policy_block(self):
        _,r=self.record();r['policyVersion']='future-v4'
        with self.assertRaisesRegex(ValueError,'unsupported review policy'):self.verify(self.seal(r))
        p=self.root/m.art_review.POLICY_FILE;p.write_text(p.read_text()+'\n')
        with self.assertRaisesRegex(ValueError,'policy changed/missing'):self.verify()
    def test_editorial_sop_update_does_not_invalidate_history(self):
        p=self.root/m.art_review.AUTHORITY;p.write_text(p.read_text()+'\nEditorial-only update.\n')
        self.assertEqual(len(self.run_db()),210)
        for identity in ('g024','g026','g030'):
            row,_=self.record(identity)
            legacy=m.load(self.root/row['directory']/'art-review.json')
            expected=identity=='g026'
            self.assertIs(m.art_review.verify(self.root,row,row['images'],legacy)[0],expected)
    def test_legacy_archive_sha_not_optional(self):
        p=self.root/m.art_review.LEGACY_AUTHORITY;p.write_text('invented historical SOP')
        with self.assertRaisesRegex(ValueError,'authorization changed/missing'):self.run_db()
    def test_unmade_180_cannot_gain_production_or_milestones(self):
        rows=self.run_db()
        unmade=[r for r in rows if not r['images']]
        self.assertEqual(len(unmade),180)
        self.assertFalse(any(r['conceptApproved'] or r['assetProductionEligible'] or r['formalReleaseAllowed'] for r in unmade))
        self.assertEqual([r['id'] for r in rows if r['epoch']=='higher'],[f'h{i:02}' for i in range(1,11)])
        for field in ('conceptApproved','assetProductionEligible','asset2_5dStatus','gm2_5dTestStatus','formalReleaseAllowed'):
            data=m.load(self.index);target=next(r for r in data['sets'] if r['id']=='g031');target[field]=True
            self.index.write_text(m.dumps(data))
            with self.assertRaisesRegex(ValueError,'Index differs'):self.run_db()
            data['sets']=rows;self.index.write_text(m.dumps(data))
    def test_unapproved_concepts_cannot_enter_release_manifests(self):
        for name in ('resource-manifest.json','assets/3d/asset-registry.json'):
            p=self.root/name;original=p.read_bytes();data=m.load(p)
            data['unauthorizedConcept']='development/3d-source/equipment/concepts/galaxy/g031-frontier-colonies/overview-front-side-back.webp'
            p.write_text(m.dumps(data))
            with self.assertRaisesRegex(ValueError,'referenced by runtime'):self.run_db()
            p.write_bytes(original)
    def test_g007_supplement_does_not_replace_legacy_or_models(self):
        row,_=self.record('g007');directory=self.root/row['directory']
        (directory/'review-2_5d.json').unlink()
        actual=m.statuses(self.root,row)
        self.assertTrue(actual['conceptApproved'])
        self.assertEqual(actual['artReviewMode'],'legacy-user-approval')
        self.assertEqual(actual['modelStatus'],'refined-model-art-reviewed')
        self.assertFalse(actual['formalReleaseAllowed'])

    def test_decoder_unavailable_cannot_approve_structural_header(self):
        from unittest.mock import patch
        import builtins
        original=builtins.__import__
        def missing(name,*args,**kwargs):
            if name=='PIL':raise ImportError('fixture unavailable decoder')
            return original(name,*args,**kwargs)
        row,_=self.record()
        with patch('builtins.__import__',side_effect=missing):
            with self.assertRaisesRegex(ValueError,'full concept image decoding'):
                m.image_info(self.root/row['directory']/m.IMAGES[0])
