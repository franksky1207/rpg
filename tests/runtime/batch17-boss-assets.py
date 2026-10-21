"""Validate handoff bytes independently of the generated runtime registry."""
import pathlib,json,hashlib,csv
from PIL import Image
r=pathlib.Path(__file__).resolve().parents[2]
dev=r/'development/monster-art/batch17'
manifest=json.loads((dev/'metadata/asset_manifest.json').read_text())
assert manifest['art_count']==12
assets=json.loads((r/'data/monsters/monster-assets.json').read_text())['assets']
assert len(manifest['image_records'])==12
for row in manifest['image_records']:
 for f in row['files']:
  p=dev/f['path'];raw=p.read_bytes()
  assert len(raw)==f['bytes'] and hashlib.sha256(raw).hexdigest()==f['sha256'],f['path']
  with Image.open(p) as im:
   assert im.format.lower()==f['format'] and im.size==(512,512) and im.mode=='RGBA'
   alpha=im.getchannel('A');assert alpha.getextrema()==(0,255)
   assert list(alpha.point(lambda a:255 if a>=16 else 0).getbbox())==f['alpha_ge_16_bounds_right_bottom_exclusive']
  if f['format']=='webp':
   formal=next(a for a in assets if a.get('artCode')==row['art_code'])
   assert (r/formal['path']).read_bytes()==raw,'formal WebP must not be recompressed'
for line in (dev/'metadata/sha256sums.txt').read_text().splitlines():
 sha,path=line.split(None,1);assert hashlib.sha256((dev/path.strip()).read_bytes()).hexdigest()==sha
runtime=json.loads((r/'resource-manifest.json').read_text())['files']
assert not any(p.startswith('development/') for p in runtime)
assert len([p for p in runtime if p.startswith('assets/monsters/v1/boss/')])==12
planned=json.loads((dev/'metadata/boss_30_mapping.json').read_text())
csv_rows=list(csv.DictReader((dev/'metadata/boss_30_mapping.csv').open(encoding='utf-8-sig')))
assert len(planned)==len(csv_rows)==30
for row,record in zip(planned,csv_rows):
 for key in ['era','index','boss_name','art_code_or_existing_asset']:
  assert str(row[key])==record[key]
 assert row['suggested_visible_height_to_player']==float(record['suggested_visible_height_to_player'])
print('PASS 24 original image bytes/SHA/dimensions/alpha/safe margins and 12 unmodified formal WebP; no development preload')
