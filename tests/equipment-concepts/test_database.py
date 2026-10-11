"""Real-source catalog checks and destructive negative cases in temporary copies."""
import contextlib
import copy
import importlib.util
import io
import json
import pathlib
import shutil
import tempfile
import unittest

REPO=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('concepts',REPO/'scripts/equipment-concepts.py')
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=pathlib.Path(self.temp.name)
        files=['data.js','engine.js','secondworlddata.js','secondworldrewards.js','thirdworlddata.js','thirdworldloot.js',
               'resource-manifest.json','resource-cache-sw.js','resource-cache-client.js','assets/3d/asset-registry.json',str(m.MASTER)]
        files += [p.name for p in REPO.glob('worldmaps-*.js')]
        registry=m.load(REPO/'assets/3d/asset-registry.json')
        files += [a['path'] for a in registry['assets'] if a['type']=='equipment']
        for file in files:
            dest=self.root/file;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(REPO/file,dest)
        shutil.copytree(REPO/m.BASE,self.root/m.BASE)
        self.index=self.root/m.BASE/'_concept-index.json'
    def tearDown(self): self.temp.cleanup()
    def run_db(self,generate=False):
        with contextlib.redirect_stdout(io.StringIO()): return m.run(self.root,generate)
    def mutate_index(self,fn):
        d=m.load(self.index);fn(d);self.index.write_text(m.dumps(d))
    def snapshot(self):
        return {p.relative_to(self.root).as_posix():m.sha(p.read_bytes()) for p in self.root.rglob('*') if p.is_file()}
    def note(self,id='g001'):
        row=next(r for r in m.load(self.index)['sets'] if r['id']==id)
        return self.root/row['directory']/'concept-notes.md'
    def test_actual_counts_names_statuses(self):
        rows=self.run_db()
        self.assertEqual([sum(r['epoch']==e for r in rows) for e in ('galaxy','universe','higher')],[100,100,10])
        self.assertEqual(sum(len(r['equipmentNames']) for r in rows),1050)
        self.assertEqual(sum(bool(r['images']) for r in rows),1)
        self.assertFalse(any(r['conceptApproved'] for r in rows))
        self.assertEqual(rows[6]['regionOrBoss'],'地球戰爭 → 古代科技遺址')
        self.assertEqual(rows[6]['modelStatus'],'existing-model-concept-alignment-unverified')
        self.assertEqual(rows[-1]['level']['fixedLevel'],None)
    def test_rerun_byte_identical(self):
        before=self.snapshot();self.run_db(True);self.run_db(True);self.assertEqual(before,self.snapshot())
    def test_manual_text_preserved(self):
        note=self.note();manual='\n## 人工追加：請保留\n使用者候選配色與修改尚待批准。\n'
        note.write_text(note.read_text()+manual)
        before=note.read_bytes();self.run_db(True);self.assertEqual(before,note.read_bytes())
    def test_legacy_note_adoption_preserves_original(self):
        row=self.run_db()[0]
        text='## 人工造型\n不能覆蓋的原始手稿\n'
        self.assertTrue(m.note_text(row,text).endswith(text))
    def test_duplicate_index_id_rejected(self):
        self.mutate_index(lambda d:d['sets'].append(copy.deepcopy(d['sets'][0])))
        with self.assertRaisesRegex(ValueError,'duplicate ID'):self.run_db()
    def test_missing_slot_rejected(self):
        self.mutate_index(lambda d:d['sets'][0]['equipmentNames'].pop('helmet'))
        with self.assertRaisesRegex(ValueError,'Index differs'):self.run_db()
    def test_wrong_name_rejected(self):
        self.mutate_index(lambda d:d['sets'][0]['equipmentNames'].update(weapon='假名稱'))
        with self.assertRaisesRegex(ValueError,'Index differs'):self.run_db()
    def test_formal_missing_slot_rejected(self):
        file=self.root/'worldmaps-earth.js';file.write_text(file.read_text().replace(',"戰場識別牌"','',1))
        with self.assertRaisesRegex(ValueError,'slots inconsistent'):self.run_db()
    def test_missing_notes_rejected_and_generated(self):
        note=self.note();note.unlink()
        with self.assertRaisesRegex(ValueError,'missing/stale notes'):self.run_db()
        self.run_db(True);self.assertTrue(note.is_file())
    def test_stale_notes_rejected(self):
        note=self.note();note.write_text(note.read_text().replace('| 破門短刃 |','| 假名稱 |',1))
        with self.assertRaisesRegex(ValueError,'missing/stale notes'):self.run_db()
    def test_wrong_missing_image_status_rejected(self):
        self.mutate_index(lambda d:d['sets'][0].update(conceptStatus='approved',conceptApproved=True))
        with self.assertRaisesRegex(ValueError,'Index differs'):self.run_db()
    def test_g007_tampering_rejected_without_writes(self):
        file=self.note('g007').parent/m.IMAGES[0]
        file.write_bytes(file.read_bytes()+b'x');before=self.snapshot()
        with self.assertRaisesRegex(ValueError,'WebP|Protected G007'):self.run_db(True)
        self.assertEqual(before,self.snapshot())
    def test_corrupt_webp_rejected(self):
        file=self.note().parent/m.IMAGES[0];file.write_bytes(b'RIFF-not-an-image')
        with self.assertRaisesRegex(ValueError,'Invalid WebP'):self.run_db()
    def test_real_image_dimensions_bytes(self):
        info=m.image_info(self.note('g007').parent/m.IMAGES[0])
        self.assertEqual((info['width'],info['height'],info['bytes']),(1491,1055,224974))
    def test_identity_reordering_rejected_before_writes(self):
        file=self.root/'secondworlddata.js';text=file.read_text();text=text.replace('"id": "universe-boss-001"','"id": "temporary"',1).replace('"id": "universe-boss-002"','"id": "universe-boss-001"',1).replace('"id": "temporary"','"id": "universe-boss-002"',1);file.write_text(text)
        before=self.snapshot()
        with self.assertRaisesRegex(ValueError,'identity/sourceKey changed'):self.run_db(True)
        self.assertEqual(before,self.snapshot())
    def test_changed_directory_rejected(self):
        self.mutate_index(lambda d:d['sets'][0].update(directory='galaxy/wrong'))
        with self.assertRaisesRegex(ValueError,'identity moved/renamed'):self.run_db(True)
    def test_extra_directory_rejected(self):
        extra=self.root/m.BASE/'galaxy/g001-duplicate';extra.mkdir();(extra/'concept-notes.md').write_text('duplicate')
        with self.assertRaisesRegex(ValueError,'Directory/notes mismatch'):self.run_db()
    def test_approval_without_evidence_rejected(self):
        (self.note().parent/'art-review.json').write_text(m.dumps({'conceptApproved':True}))
        with self.assertRaisesRegex(ValueError,'approval needs'):self.run_db(True)
    def test_valid_approval_requires_current_images_and_keeps_manual_text(self):
        rows=self.run_db();row=rows[0];directory=self.note().parent
        for name in m.IMAGES:shutil.copyfile(self.note('g007').parent/name,directory/name)
        evidence=directory/'acceptance.md';evidence.write_text('g001 使用者驗收紀錄：測試治具，非真實批准。確認兩張圖片與當下五槽身份；僅供負向測試。')
        images=[m.image_info(directory/n) for n in m.IMAGES]
        record={'conceptApproved':True,'reviewer':'user','approvedAt':'2026-10-11','evidenceFile':evidence.name,
                'imageSha256':{i['file']:i['sha256'] for i in images},
                'formalSha256':m.sha(m.dumps({k:row[k] for k in ('id','sourceKey','regionOrBoss','equipmentNames')}).encode())}
        review=directory/'art-review.json';review.write_text(m.dumps(record))
        note=self.note();manual=note.read_text().split(m.END,1)[1]
        self.assertTrue(self.run_db(True)[0]['conceptApproved']);self.run_db()
        self.assertEqual(note.read_text().split(m.END,1)[1],manual)
        record['imageSha256'][m.IMAGES[0]]='0'*64;review.write_text(m.dumps(record))
        before=self.snapshot()
        with self.assertRaisesRegex(ValueError,'does not bind'):self.run_db(True)
        self.assertEqual(before,self.snapshot())
    def test_runtime_concept_reference_rejected(self):
        file=self.root/'resource-cache-sw.js';file.write_text(file.read_text()+'\n// '+str(m.BASE))
        with self.assertRaisesRegex(ValueError,'referenced by runtime'):self.run_db()
    def test_master_index_stale_rejected(self):
        (self.root/m.MASTER).write_text('stale')
        with self.assertRaisesRegex(ValueError,'master index missing/stale'):self.run_db()

if __name__=='__main__':unittest.main()
