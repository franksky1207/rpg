#!/usr/bin/env python3
"""Bake source-derived body / intact forearm+weapon layers; no generated artwork.
Original Batch7 masters and their published full-figure fallbacks stay immutable.
Only Batch12 reviewed derivatives receive the short-rising-cut runtime template.
"""
from PIL import Image,ImageDraw,ImageChops
from pathlib import Path
import json,math,hashlib,sys,io
ROOT=Path(__file__).resolve().parents[1]
trial=ROOT/'development/combat-animation/batch12/rendered'
manifest_path=ROOT/'assets/era-player/v1/manifest.json'
m=json.loads(manifest_path.read_text());outputs={}
inputs=json.loads((trial/'trial-inputs.json').read_text())
for row,e in zip(inputs['entries'],m['entries']):
 assert e['epoch']==row['era']
 for source in row['sources']:
  assert hashlib.sha256((ROOT/source['path']).read_bytes()).hexdigest()==source['sha256']
 original=Image.open(trial/row['body']).convert('RGBA');weapon=Image.open(ROOT/row['weapon']).convert('RGBA')
 gx,gy=row['grip'];ex,ey=row['elbow'];wgx,wgy=row['weaponGrip'];dx=row['weaponTip'][0]-wgx;dy=row['weaponTip'][1]-wgy
 scale=row['weaponLength']/math.hypot(dx,dy);angle=.66-math.atan2(dy,dx);co=math.cos(angle)/scale;si=math.sin(angle)/scale
 mapped=weapon.transform((512,512),Image.Transform.AFFINE,(co,si,wgx-co*gx-si*gy,-si,co,wgy+si*gx-co*gy),Image.Resampling.BICUBIC)
 # Same polygon as the refined elbow prototype, with an overlapping original elbow plate.
 points=[(ex-20,ey-8),(ex+18,ey-5),(gx+21,gy+18),(gx-23,gy+24),(gx-28,gy-24)]
 mask=Image.new('L',(512,512));ImageDraw.Draw(mask).polygon(points,fill=255)
 limb=Image.new('RGBA',(512,512));arm=original.copy();arm.putalpha(ImageChops.multiply(original.getchannel('A'),mask))
 limb.alpha_composite(mapped);limb.alpha_composite(arm)
 # Preserve the closed/curling hand silhouette above the handle, just as in trial.
 hand=original.crop((round(gx-16),round(gy-17),round(gx+14),round(gy+13)));limb.alpha_composite(hand,(round(gx-16),round(gy-17)))
 body=original.copy();keep=ImageChops.invert(mask);ImageDraw.Draw(keep).ellipse((ex-19,ey-19,ex+19,ey+19),fill=255);body.putalpha(ImageChops.multiply(original.getchannel('A'),keep))
 config=dict(weaponAnimationStatus='complete',template='short-rising-cut',joint=[ex/512,ey/512],capRadius=19/512,windup=.12,strike=-.88,grip=[gx/512,gy/512],sourceSha256=[r['sha256'] for r in row['sources']])
 atlas=Image.new('RGBA',(512,512));atlas.alpha_composite(body.resize((256,256),Image.Resampling.LANCZOS),(0,0));atlas.alpha_composite(limb.resize((256,256),Image.Resampling.LANCZOS),(256,0))
 path=ROOT/f"assets/era-player/v1/{e['id']}-attack-atlas.webp";buffer=io.BytesIO();atlas.save(buffer,'WEBP',lossless=True,method=6,exact=True);raw=buffer.getvalue();outputs[path]=raw
 config['body']=dict(path=path.relative_to(ROOT).as_posix(),width=512,height=512,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
 config['atlas']=dict(body=[0,0,256,256],arm=[256,0,256,256])
 e['weaponAnimation']=config
m['attackRevision']='20261019-batch12-rising-cut1'
outputs[manifest_path]=(json.dumps(m,ensure_ascii=False,indent=2)+'\n').encode()
runtime=json.loads(json.dumps(m))
for e in runtime['entries']:e['source'].pop('file',None)
outputs[ROOT/'3d-test/era-player-sprites.mjs']=('// Generated source metadata; original fallbacks preserved, Batch12 reviewed local attack layers.\nconst data='+json.dumps(runtime,ensure_ascii=False,separators=(',',':'))+';\nfunction freeze(x){if(x&&typeof x===\'object\'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}\nexport const release=freeze(data);\n').encode()
for path,data in outputs.items():
 if '--check' in sys.argv:assert path.read_bytes()==data,str(path)+' stale'
 else:path.write_bytes(data)
print('Built 3 source-derived packed atlases; original 3 full-figure fallback bytes unchanged.')
