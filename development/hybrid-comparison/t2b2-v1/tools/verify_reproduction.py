"""Compare actual independent source re-exports and rerendered pixel samples.
--exports /tmp/t2b2-reexport --frames /tmp/t2b2-repro-frames
"""
import pathlib,json,argparse,hashlib,numpy as np
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--exports',required=True);p.add_argument('--frames',required=True);a=p.parse_args();exports=pathlib.Path(a.exports);frames=pathlib.Path(a.frames);rows=[]
for actor in ['normal','elite','boss','player']:
 folder=HERE/'player' if actor=='player' else HERE/'enemies'/actor;files=['candidate-low.glb','candidate-medium.glb','candidate-high.glb'] if actor=='player' else ['candidate.glb']
 for file in files:
  assert (folder/file).read_bytes()==(exports/actor/file).read_bytes(),('Non-reproducible saved-source export',actor,file)
  rows.append({'actor':actor,'file':file,'exactBytes':True,'sha256':hashlib.sha256((folder/file).read_bytes()).hexdigest()})
 meta=json.loads((folder/'atlases/atlas.json').read_text());bake=json.loads((frames/actor/'bake.json').read_text());assert bake['sourceSHA']==meta['sourceSHA']
 for row in meta['rows']:
  im=Image.open(folder/'atlases'/row['rgba']);z=Image.open(folder/'atlases'/row['depth'])
  for f in [0,9,21]:
   raw=frames/actor/row['action']/row['layer'];full=np.array(Image.open(raw/f'{f:02}.png').convert('RGBA'));full[full[:,:,3]==0]=0;rect=row['frames'][f]['rect'];x,y,w,h=rect;tx,ty,tw,th=row['frames'][f]['trim'];colors=full[ty:ty+th,tx:tx+tw]
   assert np.array_equal(np.array(im.crop((x,y,x+w,y+h))),colors),('Rerendered color differs',actor,row['action'],row['layer'],f)
   rawz=np.array(Image.open(next(raw.glob(f'depth-{f:02}-*.png'))));rawz[full[:,:,3]==0]=65535;assert np.array_equal(np.array(z.crop((x,y,x+w,y+h))),rawz[ty:ty+th,tx:tx+tw])
print('PASS exact six GLB source re-exports and independent 234 RGBA/depth frame sample pairs')
(HERE/'review/reproduction.json').write_text(json.dumps({'schema':'cw.t2b2.reproduction','version':1,'GLBs':rows,'independentFrameSamples':234,'colorAndDepthExact':True,'BlenderVersion':'4.3.2','scope':'saved source->GLB and Cycles 32 samples->atlas; .blend container byte determinism on reconstruct not claimed'},indent=2)+'\n')
