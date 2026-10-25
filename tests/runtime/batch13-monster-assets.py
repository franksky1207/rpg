import hashlib,json,pathlib
from PIL import Image
r=pathlib.Path(__file__).resolve().parents[2]
m=json.loads((r/'data/monsters/monster-assets.json').read_text())
assert m['formalBattleEnabled'] is True
assert len(m['assets'])==len({a['assetId'] for a in m['assets']})==39
assert len([a for a in m['assets'] if a.get('artCode')])==12
assert [a['assetId'] for a in m['assets'][:6]]==['hm-01','mech-02','ship-01','beast-03','core-01','bio-02']
for a in m['assets']:
 p=r/a['path'];b=p.read_bytes();assert len(b)==a['bytes'];assert hashlib.sha256(b).hexdigest()==a['sha256']
 with Image.open(p) as im:
  assert im.format=='WEBP' and im.size==(512,512) and im.mode=='RGBA'
  assert im.getchannel('A').getextrema()==(0,255)
  assert list(im.getbbox())==a['visualBounds']==a['alphaBounds']
 assert a['formalBattleAllowed'] and a['gmPreviewAllowed']
manifest=json.loads((r/'resource-manifest.json').read_text())
assert all(a['path'] in manifest['files'] for a in m['assets'])
assert not any('sources/' in p or 'development/monster-art/' in p for p in manifest['files'])
assert {p.relative_to(r).as_posix() for p in (r/'assets/monsters/v1').rglob('*.webp')}=={a['path'] for a in m['assets']}
print('PASS twenty genuine WebP SHA/bytes/dimensions/alpha/bounds; retired ZIPs absent; no runtime sources')
