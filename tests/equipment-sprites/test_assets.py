"""Real sprite integrity negatives in isolated development copies; not visual approvals."""
import copy,importlib.util,json,pathlib,shutil,tempfile,unittest
ROOT=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('sprite_assets',ROOT/'scripts/equipment_sprite_assets.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class SpriteTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name);shutil.copytree(ROOT/m.BASE,self.root/m.BASE)
  self.rows=json.loads((ROOT/'development/3d-source/equipment/concepts/_concept-index.json').read_text())['sets']
 def tearDown(self):self.tmp.cleanup()
 def row(self,id='g007'):return next(r for r in self.rows if r['id']==id)
 def entry(self,id='g007'):return next(e for e in m.load(self.root/m.REGISTRY)['entries'] if e['id']==id)
 def change(self,id,fn):
  data=m.load(self.root/m.REGISTRY);fn(next(e for e in data['entries'] if e['id']==id));(self.root/m.REGISTRY).write_text(json.dumps(data))
 def check(self,id='g007'):return m.verified_entry(self.root,self.row(id),True)
 def test_three_formal_trials_and_release_isolation(self):
  self.assertEqual({e['id'] for e in m.load(self.root/m.REGISTRY)['entries']},{'g005','g007','g018'})
  for id in ('g005','g007','g018'):
   entry=self.check(id);self.assertIn(entry['status'],('not-started','awaiting-art-review','complete'));self.assertFalse(entry['formalReleaseAllowed']);self.assertEqual(entry['gmTestStatus'],'not-tested')
 def test_identity_source_and_names_are_bound(self):
  for field in m.FIELDS:
   with self.subTest(field=field):
    data=m.load(self.root/m.REGISTRY);original=copy.deepcopy(data);next(e for e in data['entries'] if e['id']=='g007')['formalIdentity'][field]='wrong';(self.root/m.REGISTRY).write_text(json.dumps(data))
    with self.assertRaisesRegex(ValueError,'identity mismatch'):self.check()
    (self.root/m.REGISTRY).write_text(json.dumps(original))
 def test_unapproved_concept_refused(self):
  with self.assertRaisesRegex(ValueError,'concept eligibility'):m.verified_entry(self.root,self.row(),False)
 def test_missing_and_corrupt_actual_sprite_refused(self):
  entry=self.entry();self.assertIsNotNone(entry['asset']);file=self.root/entry['asset']['path'];original=file.read_bytes();file.unlink()
  with self.assertRaisesRegex(ValueError,'file missing'):self.check()
  file.write_bytes(b'not-an-image')
  with self.assertRaises((ValueError,OSError)):self.check()
  file.write_bytes(original)
 def test_wrong_sha_and_version_refused(self):
  for field,value in (('sha256','0'*64),('bytes',10),('width',128)):
   data=m.load(self.root/m.REGISTRY);original=copy.deepcopy(data);next(e for e in data['entries'] if e['id']=='g007')['asset'][field]=value;(self.root/m.REGISTRY).write_text(json.dumps(data))
   with self.assertRaisesRegex(ValueError,'metadata mismatch'):self.check()
   (self.root/m.REGISTRY).write_text(json.dumps(original))
  self.change('g007',lambda e:e.update(version='2.0.0'))
  with self.assertRaisesRegex(ValueError,'version'):self.check()
 def test_other_suit_file_cannot_be_assigned(self):
  self.change('g007',lambda e:e['asset'].update(path=str(m.BASE/'characters/g005/v1/character.webp')))
  with self.assertRaisesRegex(ValueError,'another set'):self.check()
 def test_unmade_cannot_claim_complete(self):
  self.change('g007',lambda e:e.update(status='complete',asset=None,review=None))
  with self.assertRaises((ValueError,AttributeError)):self.check()
 def test_no_real_visual_review_cannot_complete(self):
  self.change('g007',lambda e:e.update(status='complete',review=None))
  with self.assertRaises((ValueError,AttributeError)):self.check()
 def test_review_and_source_fingerprints_required(self):
  e=self.entry();self.assertEqual(e['status'],'complete');proof=self.root/e['review']['path'];proof.write_text('invented review')
  with self.assertRaisesRegex(ValueError,'fingerprint'):self.check()
 def test_fake_release_or_gm_success_refused(self):
  for field,value in (('gmTestStatus','passed'),('formalReleaseAllowed',True)):
   data=m.load(self.root/m.REGISTRY);original=copy.deepcopy(data);next(e for e in data['entries'] if e['id']=='g007')[field]=value;(self.root/m.REGISTRY).write_text(json.dumps(data))
   with self.assertRaisesRegex(ValueError,'GM/release'):self.check()
   (self.root/m.REGISTRY).write_text(json.dumps(original))
 def test_concept_version_change_refused(self):
  self.change('g007',lambda e:e['conceptSha256'].update({'equipment-five-slots.webp':'0'*64}))
  with self.assertRaisesRegex(ValueError,'concept version'):self.check()
 def test_path_traversal_and_empty_asset_refused(self):
  with self.assertRaisesRegex(ValueError,'escapes'):m.local(self.root,'../secret.png')
  from PIL import Image
  blank=self.root/'blank.png';Image.new('RGBA',(512,512)).save(blank)
  with self.assertRaisesRegex(ValueError,'opaque subject'):m.image_info(blank)
 def test_duplicate_registry_identity_refused(self):
  data=m.load(self.root/m.REGISTRY);data['entries'].append(copy.deepcopy(data['entries'][0]));(self.root/m.REGISTRY).write_text(json.dumps(data))
  with self.assertRaisesRegex(ValueError,'duplicate'):self.check()
 def test_opaque_background_refused(self):
  from PIL import Image
  opaque=self.root/'opaque.png';Image.new('RGBA',(512,512),(100,100,100,255)).save(opaque)
  with self.assertRaisesRegex(ValueError,'transparency'):m.image_info(opaque)
 def pipeline(self):
  import sys
  sys.path.insert(0,str(ROOT/'scripts'))
  spec=importlib.util.spec_from_file_location('pipeline',ROOT/'scripts/equipment-sprites.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p);return p
 def test_import_never_overwrites_completed_version(self):
  from unittest.mock import patch
  p=self.pipeline();before={str(f.relative_to(self.root)):m.sha(f.read_bytes()) for f in self.root.rglob('*') if f.is_file()}
  with patch.object(p,'rows',return_value=self.rows):
   with self.assertRaisesRegex(ValueError,'never overwrite'):p.import_image(self.root,'g007',ROOT/self.entry()['source']['path'],'Real generation instructions '+('x'*100))
  after={str(f.relative_to(self.root)):m.sha(f.read_bytes()) for f in self.root.rglob('*') if f.is_file()};self.assertEqual(before,after)
 def test_planning_unmade_concept_rejected_and_approved_next_set_stays_unmade(self):
  from unittest.mock import patch
  p=self.pipeline()
  with patch.object(p,'rows',return_value=self.rows):
   with self.assertRaisesRegex(ValueError,'verified concept'):p.plan(self.root,'g051','Actual distinctive silhouette selection justification')
   for identity,reason in [('g026','White ring crown silhouette selected for future production'),('g031','Square colonial shoulders and command box selected for future production'),('g036','Alien crescent shoulders and translation ring selected for future production'),('g041','Orion twin fins and spiral navigation beacon selected for future production')]:
    p.plan(self.root,identity,reason)
    row=self.row(identity);entry=m.verified_entry(self.root,row,True);self.assertEqual(entry['status'],'not-started');self.assertIsNone(entry['asset'])
 def test_import_missing_prompt_rejected_before_any_write(self):
  p=self.pipeline();before=(self.root/m.REGISTRY).read_bytes()
  with self.assertRaisesRegex(ValueError,'prompt required'):p.import_image(self.root,'g026',ROOT/self.entry()['source']['path'],'')
  self.assertEqual(before,(self.root/m.REGISTRY).read_bytes())
if __name__=='__main__':unittest.main()
