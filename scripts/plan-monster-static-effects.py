"""Read-only analysis of frozen alpha; choose peripheral pockets inside 512px."""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt,binary_fill_holes
r=Path('development/monster-art/full-review');d=json.loads((r/'manifest.json').read_text());geometry={}
yy,xx=np.mgrid[:512,:512];edges=np.minimum.reduce([xx-8,503-xx,yy-8,503-yy])
ideals={'top':[(205,35),(307,35)],'bottom':[(205,477),(307,477)],'flanks':[(35,200),(477,312)],'diagonal':[(65,65),(447,447)],'corners':[(65,447),(447,65)]}
for a in d['assets']:
 s=next(s for s in d['specs'] if s['assetId']==a['assetId']);alpha=np.array(Image.open(r/'body'/(s['id']+'.webp')).convert('RGBA'))[:,:,3]
 dist=np.minimum(distance_transform_edt(~binary_fill_holes(alpha>0)),edges)
 pockets={}
 for pos,targets in ideals.items():
  pockets[pos]=[]
  for tx,ty in targets:
   score=np.minimum(dist,42)*1.6-np.hypot(xx-tx,yy-ty)*.35;score[dist<12]=-1e9
   iy,ix=np.unravel_index(np.argmax(score),score.shape);pockets[pos].append({'point':[int(ix),int(iy)],'radius':float(dist[iy,ix])})
 geometry[a['assetId']]={'pockets':pockets,'bodyBounds':a['alphaBounds'],'alphaPixels':int((alpha>0).sum())}
(r/'effects-audit'/'geometry.json').write_text(json.dumps(geometry,indent=2));print('Measured peripheral pockets:',len(geometry))
