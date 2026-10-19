#!/usr/bin/env python3
"""Exploratory source-preserving cutouts. NOT release assets; no generated pixels.
Flood-fill only exterior neutral matte, plus explicit higher arm-gap seed.
Keep rendered failure evidence separate from the production asset manifest.
"""
from PIL import Image,ImageFilter
import numpy as np
from collections import deque
from pathlib import Path
import json,hashlib,math
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'development/combat-animation/batch7/layer-sources'
OUT=ROOT/'development/combat-animation/batch12/rendered';OUT.mkdir(parents=True,exist_ok=True)
landmarks={
 'galaxy':dict(foot=[650,1237],head=10,grip=[421,621],shoulder=[535,340],elbow=[455,475],wg=[230,320],wt=[1230,1120],length=215),
 'universe':dict(foot=[650,1240],head=10,grip=[422,620],shoulder=[530,335],elbow=[450,470],wg=[245,235],wt=[1230,1200],length=215),
 'higher':dict(foot=[535,1518],head=20,grip=[313,770],shoulder=[365,398],elbow=[310,575],wg=[190,280],wt=[996,1478],length=220)}
rows=[]
for era,p in landmarks.items():
 body=BASE/('higher_body_no_weapon_v2.png' if era=='higher' else era+'_attack_body.jpeg');weapon=BASE/('higher_weapon_independent_v2.png' if era=='higher' else era+'_weapon.png')
 im=Image.open(body).convert('RGBA');a=np.array(im);h,w=a.shape[:2];rgb=a[:,:,:3].astype('int16');neutral=(rgb.min(2)>=180)&((rgb.max(2)-rgb.min(2))<30);seen=np.zeros((h,w),bool);q=deque()
 for x,y in ([(0,0),(400,520)] if era=='higher' else [(0,0)]):
  assert neutral[y,x];seen[y,x]=True;q.append((x,y))
 while q:
  x,y=q.popleft()
  for nx,ny in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   if 0<=nx<w and 0<=ny<h and neutral[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;q.append((nx,ny))
 a[:,:,3]=np.array(Image.fromarray((~seen).astype('uint8')*255).filter(ImageFilter.GaussianBlur(.4)))
 scale=430/(p['foot'][1]-p['head']);off=[round(256-p['foot'][0]*scale),round(461-p['foot'][1]*scale)]
 im=Image.fromarray(a).resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS);res=Image.new('RGBA',(512,512));res.alpha_composite(im,tuple(off));res.save(OUT/f'{era}-body-trial.png')
 def norm(point):return [round(point[0]*scale+off[0],2),round(point[1]*scale+off[1],2)]
 rows.append(dict(era=era,grip=norm(p['grip']),shoulder=norm(p['shoulder']),elbow=norm(p['elbow']),weaponGrip=p['wg'],weaponTip=p['wt'],weaponLength=p['length'],body=f'{era}-body-trial.png',weapon=weapon.relative_to(ROOT).as_posix(),formal=f'assets/era-player/v1/era-{era}.webp',sources=[dict(path=f.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(f.read_bytes()).hexdigest()) for f in [body,weapon]]))
(OUT/'trial-inputs.json').write_text(json.dumps(dict(releaseAllowed=False,landmarksApproximate=True,entries=rows),indent=2)+'\n')
print('Prepared source-preserving trial inputs; no production catalog modified.')
