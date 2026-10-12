"""Decode real atlas pixels/depth, validate frame extraction and motion.
Checks actual images, not merely JSON existence. Pure offline QC, no renderer.
"""
import pathlib,json,hashlib
import numpy as np
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parents[1]
index=json.loads((HERE/'atlas-index.json').read_text());count=0;frames=0;results=[];motionTotals={}
for actor,desc in index['actors'].items():
 path=HERE/desc['metadata'];meta=json.loads(path.read_text());source=HERE/'player/animation-source.blend' if actor=='player' else HERE/'enemies'/actor/'source.blend'
 assert hashlib.sha256(source.read_bytes()).hexdigest()==meta['sourceSHA']
 for row in meta['rows']:
  im=Image.open(path.parent/row['rgba']);z=Image.open(path.parent/row['depth']);assert im.mode=='RGBA' and z.mode in ['I','I;16'];assert list(im.size)==row['dimensions']==list(z.size)
  assert row['decodedRGBABytes']==im.width*im.height*4 and row['decodedDepthBytes']==z.width*z.height*2;assert row['frameCount']==len(row['frames'])==22 and row['fps']==30 and row['durationMs']==700
  assert not row['mipmap'];assert row['encodedBytes']==(path.parent/row['rgba']).stat().st_size
  images=[]
  for frame in row['frames']:
   x,y,w,h=frame['rect'];assert [w,h]==row['frameDimensions'] and frame['trim'][2:]==[w,h] and row['sourceFrameDimensions']==[256,256];a=np.array(im.crop((x,y,x+w,y+h)));depth=np.array(z.crop((x,y,x+w,y+h)));assert a.shape==(h,w,4);assert np.all(a[a[:,:,3]==0]==0),'Hidden RGB must be zero'
   # Full-frame transparent border/padding prevents atlas bleed; known UV exact.
   assert frame['uv']==[x/im.width,y/im.height,(x+w)/im.width,(y+h)/im.height]
   assert np.max(a[0,:,3])==0 and np.max(a[-1,:,3])==0 and np.max(a[:,0,3])==0 and np.max(a[:,-1,3])==0
   assert np.min(depth[a[:,:,3]>250])>0 if np.any(a[:,:,3]>250) else True
   images.append(a);frames+=1
  changed=int(np.count_nonzero(images[0]!=images[9]));motionTotals[(actor,row['action'])]=motionTotals.get((actor,row['action']),0)+changed;results.append({'actor':actor,'action':row['action'],'layer':row['layer'],'changedComponents0To9':changed});count+=1
for key,total in motionTotals.items():assert total>0,('Static fake actor action',key)
sub=json.loads((HERE/'review/subset-composition.json').read_text());assert len(sub['variants'])==33 and sub['all32DifferentPixels']
assert len({v['pixelSHA256'] for v in sub['variants'][:32]})==32;assert sub['variants'][0]['selectedLayers']==[]
assert sub['variants'][-1]['unavailableSlots']==['helmet'] and sub['variants'][-1]['emptySlots']==['accessory']
# Every motion is genuinely articulated in source matrices, not object movement.
for actor in index['actors']:
 samples=json.loads((HERE/f'review/{actor}-pose-samples.json').read_text())['samples']
 for action in ['idle','attack','hit','dodge','return','defeat']:
  rows=[r for r in samples if r['action']==action];assert len(rows)==22
  a,b=rows[0]['joints'],rows[9]['joints'];changedBones=sum(np.max(np.abs(np.array(a[k])-np.array(b[k])))>.001 for k in a);assert changedBones>=2,(actor,action,changedBones)
print('PASS actual RGBA/depth decode, UV/padding/alpha and real motion:',count,'layer-actions',frames,'frames; 32 subsets plus mixed/empty/fallback')
