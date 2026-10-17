"""Trial sprite integrity negatives after retirement of concept-art approval gates."""
import copy,importlib.util,json,pathlib,shutil,tempfile,unittest
ROOT=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('sprite_assets',ROOT/'scripts/equipment_sprite_assets.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
formalspec=importlib.util.spec_from_file_location('formal_equipment_identities',ROOT/'scripts/formal-equipment-identities.py')
formal=importlib.util.module_from_spec(formalspec);formalspec.loader.exec_module(formal)

class SpriteTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name)
  shutil.copytree(ROOT/m.BASE,self.root/m.BASE)
  self.rows=formal.validate_formal(ROOT)
 def tearDown(self):self.tmp.cleanup()
 def row(self,identity='g007'):return next(r for r in self.rows if r['id']==identity)
 def entry(self,identity='g007'):return next(e for e in m.load(self.root/m.REGISTRY)['entries'] if e['id']==identity)
 def change(self,identity,fn):
  data=m.load(self.root/m.REGISTRY);fn(next(e for e in data['entries'] if e['id']==identity))
  (self.root/m.REGISTRY).write_text(json.dumps(data))
 def check(self,identity='g007'):return m.verified_entry(self.root,self.row(identity),True)
 def test_formal_210_sets_1050_slots(self):
  self.assertEqual(len(self.rows),210);self.assertEqual(sum(len(r['equipmentNames']) for r in self.rows),1050)
  self.assertEqual(self.rows[0]['id'],'g001');self.assertEqual(self.rows[-1]['id'],'h10')
 def test_three_trial_assets_remain_isolated(self):
  self.assertEqual({e['id'] for e in m.load(self.root/m.REGISTRY)['entries']},{'g005','g007','g018'})
  for identity in ('g005','g007','g018'):
   entry=self.check(identity);self.assertEqual(entry['status'],'complete')
   self.assertFalse(entry['formalReleaseAllowed']);self.assertEqual(entry['gmTestStatus'],'not-tested')
 def test_formal_identity_mismatch_rejected(self):
  for field in m.FIELDS:
   with self.subTest(field=field):
    self.change('g007',lambda e:e['formalIdentity'].__setitem__(field,'wrong'))
    with self.assertRaisesRegex(ValueError,'identity mismatch'):self.check()
    data=m.load(ROOT/m.REGISTRY);(self.root/m.REGISTRY).write_text(json.dumps(data))
 def test_missing_and_corrupt_sprite_rejected(self):
  e=self.entry();f=self.root/e['asset']['path'];original=f.read_bytes();f.unlink()
  with self.assertRaisesRegex(ValueError,'file missing'):self.check()
  f.write_bytes(b'not an image')
  with self.assertRaises((ValueError,OSError)):self.check()
  f.write_bytes(original)
 def test_wrong_sha_bytes_and_version_rejected(self):
  original=(self.root/m.REGISTRY).read_bytes()
  for field,value in (('sha256','0'*64),('bytes',10),('width',128)):
   self.change('g007',lambda e:e['asset'].__setitem__(field,value))
   with self.assertRaisesRegex(ValueError,'metadata mismatch'):self.check()
   (self.root/m.REGISTRY).write_bytes(original)
  self.change('g007',lambda e:e.update(version='2.0.0'))
  with self.assertRaisesRegex(ValueError,'version'):self.check()
 def test_cross_suit_asset_substitution_rejected(self):
  self.change('g007',lambda e:e['asset'].update(path=str(m.BASE/'characters/g005/v1/character.webp')))
  with self.assertRaisesRegex(ValueError,'another set'):self.check()
 def test_unmade_cannot_claim_complete(self):
  self.change('g007',lambda e:e.update(status='complete',asset=None,review=None))
  with self.assertRaises((ValueError,AttributeError)):self.check()
 def test_old_art_review_no_longer_a_gate(self):
  self.assertNotIn('review',self.entry())
  self.assertEqual(self.check()['id'],'g007')
 def test_old_source_png_no_longer_a_gate(self):
  self.assertNotIn('path',self.entry()['source'])
  self.assertNotIn('conceptSha256',self.entry())
  self.assertEqual(self.check()['id'],'g007')
 def test_license_metadata_still_required(self):
  self.change('g007',lambda e:e['source'].update(licenseBasis='unknown'))
  with self.assertRaisesRegex(ValueError,'license'):self.check()
 def test_no_false_formal_release(self):
  for field,value in (('gmTestStatus','passed'),('formalReleaseAllowed',True)):
   original=(self.root/m.REGISTRY).read_bytes()
   self.change('g007',lambda e:e.update({field:value}))
   with self.assertRaisesRegex(ValueError,'GM/release'):self.check()
   (self.root/m.REGISTRY).write_bytes(original)
 def test_traversal_and_opaque_background_rejected(self):
  with self.assertRaisesRegex(ValueError,'escapes'):m.local(self.root,'../secret.png')
  from PIL import Image
  opaque=self.root/'opaque.png';Image.new('RGBA',(512,512),(100,100,100,255)).save(opaque)
  with self.assertRaisesRegex(ValueError,'transparency'):m.image_info(opaque)
 def test_duplicate_registry_identity_rejected(self):
  data=m.load(self.root/m.REGISTRY);data['entries'].append(copy.deepcopy(data['entries'][0]))
  (self.root/m.REGISTRY).write_text(json.dumps(data))
  with self.assertRaisesRegex(ValueError,'duplicate'):self.check()
 def test_concept_index_no_longer_required(self):
  self.assertFalse((self.root/'development/3d-source/equipment/concepts/_concept-index.json').exists())
  self.assertEqual(self.check()['id'],'g007')
 def test_legacy_import_planning_cli_retired(self):
  script=(ROOT/'scripts/equipment-sprites.py').read_text()
  self.assertIn("choices=('validate',)",script)
  self.assertNotIn('equipment-concepts.py',script)

if __name__=='__main__':unittest.main()
