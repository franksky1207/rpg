"""G09 independent generation originals and single-stage evidence stay bound."""
import hashlib
import json
from pathlib import Path
import unittest
from PIL import Image
import test_database as db

ROOT=Path(__file__).resolve().parents[2]


class G09ArtifactTests(unittest.TestCase):
    def test_g001_g040_all_historical_bytes_unchanged(self):
        lock=json.loads((ROOT/'tests/equipment-concepts/g001-g040-sha256.json').read_text())
        self.assertEqual(len(lock['files']),262)
        for path,expected in lock['files'].items():
            self.assertEqual(hashlib.sha256((ROOT/path).read_bytes()).hexdigest(),expected,path)

    def test_historical_index_and_unmade_g061_unchanged(self):
        import subprocess
        base=json.loads(subprocess.check_output(['git','show','1c00f711feb897772dad671cdfc73b3aafa461ea:'+str(db.m.BASE/'_concept-index.json')]))['sets']
        current=json.loads((ROOT/db.m.BASE/'_concept-index.json').read_text())['sets']
        self.assertEqual(current[:40],base[:40])
        self.assertEqual(current[60:],base[60:])
        unmade=current[60]
        self.assertEqual(unmade['id'],'g061')
        self.assertEqual(unmade['images'],[])
        self.assertFalse(unmade['conceptApproved'])

    def test_five_sets_ten_independent_outputs_and_originals(self):
        rows=json.loads((ROOT/db.m.BASE/'_concept-index.json').read_text())['sets']
        originals=set();outputs=set()
        for identity in (f'g{i:03}' for i in range(41,46)):
            row=next(r for r in rows if r['id']==identity)
            directory=ROOT/row['directory']
            record=json.loads((directory/'review-2_5d.json').read_text())
            self.assertEqual(record['schema'],4)
            self.assertEqual([s['reviewer'] for s in record['stages']],['Codex'])
            self.assertEqual(record['blockers'],[])
            self.assertTrue(db.m.art_review.verify(ROOT,row,row['images'],record)[0])
            self.assertTrue(row['conceptApproved'])
            self.assertFalse(row['formalReleaseAllowed'])
            self.assertEqual(row['asset2_5dStatus'],'not-started')
            self.assertEqual(row['gm2_5dTestStatus'],'not-tested')
            source=json.loads((directory/'sources/generation.json').read_text())
            self.assertEqual(source['set'],identity)
            self.assertEqual([e['kind'] for e in source['outputs']],['overview','slots'])
            for item in source['outputs']:
                original=ROOT/item['archivedOriginal']
                data=original.read_bytes()
                self.assertEqual(hashlib.sha256(data).hexdigest(),item['originalSha256'])
                self.assertEqual(len(data),item['originalBytes'])
                with Image.open(original) as image:
                    image.load()
                    self.assertEqual(image.format,'PNG')
                    self.assertEqual(image.size,(1536,1024))
                actual=db.m.image_info(directory/item['output']['file'])
                self.assertEqual(actual,item['output'])
                self.assertEqual(record['imageSha256'][actual['file']],actual['sha256'])
                self.assertNotIn(item['originalSha256'],originals)
                self.assertNotIn(actual['sha256'],outputs)
                originals.add(item['originalSha256']);outputs.add(actual['sha256'])
            self.assertIsNone(source['outputs'][0]['referenceOriginalSha256'])
            self.assertEqual(source['outputs'][1]['referenceOriginalSha256'],source['outputs'][0]['originalSha256'])
        self.assertEqual(len(originals),10)
        self.assertEqual(len(outputs),10)


if __name__=='__main__':unittest.main()
