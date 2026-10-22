import json,pathlib,hashlib,subprocess
from PIL import Image
r=pathlib.Path(__file__).resolve().parents[2];dev=r/'development/monster-art/batch18'
a=json.loads((r/'data/monsters/monster-assets.json').read_text())['assets'];m=json.loads((dev/'manifest.json').read_text())
assert len(m['assets'])==6
for row in m['assets']:
 for f in row['files']:
  p=dev/f['path'];raw=p.read_bytes();assert len(raw)==f['bytes'] and hashlib.sha256(raw).hexdigest()==f['sha256']
  with Image.open(p) as im:
   assert im.mode=='RGBA' and im.size==(512,512) and im.getchannel('A').getextrema()==(0,255)
   bounds=list(im.getchannel('A').getbbox());assert bounds==f['visible_bbox_xyxy_exclusive'];assert min(bounds[0],bounds[1],512-bounds[2],512-bounds[3])>=24
  if p.suffix=='.webp':assert raw==(r/next(a['path'] for a in a if a.get('alternateArtCode')==row['code'])).read_bytes()
files=json.loads((r/'resource-manifest.json').read_text())['files']
assert not any(p.startswith('development/') for p in files)
assert len([a for a in a if a.get('alternateArtCode')])==6
print('PASS 12 handoff originals SHA/bytes/true Alpha/safe margins and six original WebP deployments; PNG sources excluded')
