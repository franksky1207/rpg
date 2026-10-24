"""Exact RGBA merge, never re-encode or write any frozen body file."""
from pathlib import Path
import hashlib,json,time,sys
import numpy as np
from PIL import Image
r=Path('development/monster-art/full-review');baseline=json.loads((r/'effects-audit/frozen-before.json').read_text())
def hashes():
 return {p:hashlib.sha256((r/p).read_bytes()).hexdigest() for p in baseline['files']}
def check_frozen():
 current=hashes();assert {str(p.relative_to(r)) for p in (r/'body').glob('*.webp')}=={p for p in baseline['files'] if p.startswith('body/')};different=[p for p,h in baseline['files'].items() if current.get(p)!=h]
 assert not different,different
 return current
check_frozen();data=json.loads((r/'effects-manifest.json').read_text());rows=[];start=time.monotonic()
for i,c in enumerate(data['configs']):
 body=np.array(Image.open(r/'body'/(c['id']+'.webp')).convert('RGBA'));fx=np.array(Image.open(r/'effects'/(c['id']+'.png')).convert('RGBA'));mask=body[:,:,3]>0
 assert not fx[mask].any(),c['id']+' effect contaminates body pixels'
 border=np.concatenate([fx[:8,:,3].ravel(),fx[-8:,:,3].ravel(),fx[:,:8,3].ravel(),fx[:,-8:,3].ravel()]);assert not border.any(),c['id']+' clipped'
 merged=fx.copy();merged[mask]=body[mask];dest=r/'effects-full'/(c['id']+'.webp');
 if '--level5' not in sys.argv or c['level']==5:Image.fromarray(merged).save(dest,format='WEBP',lossless=True,exact=True,method=4)
 decoded=np.array(Image.open(dest).convert('RGBA'));assert np.array_equal(decoded[mask],body[mask]),c['id']+' merged body pixels changed'
 assert (fx[:,:,3]>0).any(),c['id']+' has no effects'
 rows.append({'id':c['id'],'bodyNontransparentPixels':int(mask.sum()),'effectVisiblePixels':int((fx[:,:,3]>0).sum()),'effectOnBodyPixels':0,'fullBodyRgbaExact':True,'outer8pxClear':True})
 if (i+1)%100==0:print('Composed',i+1,flush=True)
current=check_frozen();report={'sourceCommit':baseline['sourceCommit'],'bodyFiles':895,'allLockedFiles':len(current),'missing':[],'changed':[],'addedBodyFiles':[],'allBodyBytesIdentical':True,'fullBodyRgbaExact':True,'allEffectsOutsideNontransparentBody':True,'canvas':512,'border':8,'elapsedSeconds':round(time.monotonic()-start,2),'files':current,'composites':rows}
(r/'effects-audit/frozen-after.json').write_text(json.dumps(report,indent=2));print('Verified:',len(current),'frozen files,',len(rows),'exact-body composites')
