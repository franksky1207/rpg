"""Precise r2 regression assertions. Technical evidence != visual Gate pass."""
import pathlib,json,hashlib,struct,subprocess,io
import numpy as np
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parents[1];out=HERE/'repair-r2';rev=json.loads((out/'revision.json').read_text());base=rev['baselineHEAD']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def glb(b):
 assert b[:4]==b'glTF';n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+n]),b[28+n:]
def accessor(d,b,a):
 v=d['bufferViews'][a['bufferView']];start=v.get('byteOffset',0)+a.get('byteOffset',0);size={5126:4,5125:4,5123:2,5121:1,5122:2,5120:1}[a['componentType']]*{'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']];stride=v.get('byteStride',size)
 return b''.join(b[start+i*stride:start+i*stride+size] for i in range(a['count']))
sourceContract=json.loads((out/'color-source-contract.json').read_text());assert sourceContract['actualSavedBlenderRead'] and sourceContract['sourceLightAndDisplayValuesExactR1']
for actor,desc in sourceContract['actors'].items():
 source=HERE/'player/animation-source.blend' if actor=='player' else HERE/'enemies'/actor/'source.blend'
 assert desc['sourceSHA']==sha(source)
rep=json.loads((out/'material-repair.json').read_text());image=np.asarray(Image.open(out/'panel-roughness-linear.png').convert('RGBA'))
oldImage=np.asarray(Image.open(io.BytesIO(subprocess.check_output(['git','show',base+':development/hybrid-comparison/t2b2-v1/textures/original-panel-roughness.png'],cwd=HERE))).convert('RGBA'))[:,:,0]/255
expected=np.where(oldImage<=.04045,oldImage/12.92,((oldImage+.055)/1.055)**2.4)
assert np.max(np.abs(expected-image[:,:,0]/255))<=1/510+1e-7,'Source roughness changed beyond nearest 8-bit scalar quantization'
for row in rep['rows']:
 actor=row['actor'];folder=HERE/'enemies'/actor;assert sha(folder/'source.blend')==row['afterSourceSHA'];meta=json.loads((folder/'atlases/atlas.json').read_text());assert meta['sourceSHA']==row['afterSourceSHA']
 d,b=glb((folder/'candidate.glb').read_bytes());old,ob=glb(subprocess.check_output(['git','show',base+':development/hybrid-comparison/t2b2-v1/enemies/'+actor+'/candidate.glb'],cwd=HERE))
 assert d['nodes']==old['nodes'] and d['skins']==old['skins'] and d['animations']==old['animations'],'Material-only repair changed skeleton/animation'
 assert len(d['accessors'])==len(old['accessors'])
 for a,oa in zip(d['accessors'],old['accessors']):assert accessor(d,b,a)==accessor(old,ob,oa),'Changed vertex/normal/UV/skin/animation buffer'
 material=next(m for m in d['materials'] if m['name']=='Relic_Forged_Panels');tex=d['textures'][material['pbrMetallicRoughness']['metallicRoughnessTexture']['index']];im=d['images'][tex['source']];view=d['bufferViews'][im['bufferView']];packed=np.asarray(Image.open(io.BytesIO(b[view['byteOffset']:view['byteOffset']+view['byteLength']])).convert('RGBA'))
 assert np.array_equal(packed[:,:,1],image[:,:,0]),'GLB roughness must match full Non-Color source texture, not only first pixel'
 assert abs(material['pbrMetallicRoughness']['metallicFactor']-.78)<1e-6
print('PASS exact three-enemy geometry/animation accessors unchanged; all 4096 scalar texels matched GLB G')
display=json.loads((out/'display-reference.json').read_text());assert len(display['rows'])==15 and display['actualRendered'];assert display['maximumChannelError']<1/255,'Shared AgX reference error beyond one output code value'
color=json.loads((out/'color-difference.json').read_text());assert len(color['rows'])==54 and color['actualNative'] and not color['physicalGPU'];assert set(color['byActor'])=={'normal','elite','boss'}
for r in color['rows']:
 for revision in ['r1','r2']:
  assert set(r['metrics'][revision]['regions'])=={'all','dark','mid','bright'}
  assert sum(r['metrics'][revision]['regions'][k]['pixels'] for k in ['dark','mid','bright'])==r['metrics'][revision]['regions']['all']['pixels']
if color['meanRGBRMSE']['r2']>=color['meanRGBRMSE']['r1']:assert color['status']=='failed-RMSE-worsened','Worse metrics must remain failed'
for nativePath in ['native/report.json','native-aligned-r1/report.json']:
 native=json.loads((out/nativePath).read_text());assert len(native['results'])==54
 for r in native['results']:assert abs(r['nativeFrame']-(r['tick']+1)*2)<1e-5 and abs(r['clipStartSeconds']-1/30)<1e-9,'Do not sample loader-added zero frame'
contacts=json.loads((out/'contact-localization.json').read_text());assert len(contacts['frames'])==132;assert contacts['sourceSHA']==sha(HERE/'player/animation-source.blend')
oldfiles={r['path']:r for r in rev['before']}
for path in ['player/animation-source.blend','player/candidate-low.glb','player/candidate-medium.glb','player/candidate-high.glb']:
 assert sha(HERE/path)==oldfiles[path]['sha256'],'No unverified player replacement in r2'
raw=json.loads((out/'geometry-after.json').read_text());assert len(raw['frames'])==132 and raw['sourceSHA']==contacts['sourceSHA'];assert max(s['maxThreeRayInsideMetres'] for r in raw['frames'] for s in r['slots'] if s['mesh']=='CW_Relic_armor')>.04,'Unfixed shoulder risk must remain reported'
poses=json.loads((out/'pose-views/samples.json').read_text());assert len(poses['samples'])==18;assert all(r['allMeshesVisible'] and r['sourceSHA']==contacts['sourceSHA'] for r in poses['samples'])
for r in poses['samples']:Image.open(out/'pose-views'/r['file']).load()
print('PASS reference mapping, actual per-region metrics, 132 contact samples, 18 visible poses, unchanged player candidates')
print('VISUAL GATE FAILED: native parity and shoulder/grip approval remain C; no safe-B3 recommendation')
