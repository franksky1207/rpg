import hashlib,json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2]
m=json.loads((root/'assets/era-player/v1/manifest.json').read_text())
fixed={'galaxy':'06e4bf6bb0ce50f4b90d8111db3608821ef0d582400cc760920abbfb45a54e56','universe':'e1b438fb7f7221d05a0468277f3e53e62173e95fd553d22cf333bea31e016239','higher':'d0a934a3d44bd36f3da12d2169b089020cb37d818cbd41dca8fd2053f24bf661'}
for e in m['entries']:
 assert e['source']['sha256']==fixed[e['epoch']] # immutable approved provenance, original in Git history
 p=root/e['asset']['path'];b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==e['asset']['sha256'];assert len(b)==e['asset']['bytes']
 im=Image.open(p);assert im.format=='WEBP' and im.size==(512,512) and im.mode=='RGBA'
 a=im.getchannel('A');assert a.getextrema()==(0,255)
 for edge in [(0,0,512,1),(0,511,512,512),(0,0,1,512),(511,0,512,512)]:assert a.crop(edge).getextrema()==(0,0)
 assert a.histogram()[0]>150000 and sum(a.histogram()[250:])>20000
 print('PASS',e['id'],'real Alpha, intact silhouette, exact approved source and WebP SHA',len(b))
