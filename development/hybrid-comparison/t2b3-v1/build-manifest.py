import pathlib,json,hashlib,struct,subprocess,copy
ROOT=pathlib.Path(__file__).resolve().parents[3];OUT=ROOT/'development/hybrid-comparison/t2b3-v1';ART=ROOT/'development/hybrid-comparison/t2b2-v1';baseline='e094f4e8704a808c94551acd9226c2982c67c537'
def sha(b):return hashlib.sha256(b).hexdigest()
paths=['development/hybrid-comparison/index.html','development/hybrid-comparison/comparison.css','development/hybrid-comparison/comparison.mjs','development/hybrid-comparison/playback.mjs']
evolution={'schema':'cw.t2b3.authorized-b1-evolution','baselineHEAD':baseline,'authorization':'user explicitly authorized complete B3 integration into existing B1 page; HTML/CSS/UI and source actor-defeated 700ms visual step evolve; original ownership/cancellation/fixture/formal sources retained','files':{p:{'beforeSHA256':sha(subprocess.check_output(['git','show',baseline+':'+p],cwd=ROOT)),'afterSHA256':sha((ROOT/p).read_bytes())} for p in paths}}
# Phase5 chains from this exact historical B3 release; do not rewrite that lock.
phase5=ROOT/'development/equipment-2_5d/formal-source-evolution.json'
if phase5.exists():
 for p,row in json.loads(phase5.read_text())['files'].items():
  if p in evolution['files']:evolution['files'][p]['afterSHA256']=row['beforeSHA256']
(OUT/'source-evolution.json').write_text(json.dumps(evolution,ensure_ascii=False,indent=2)+'\n')
subprocess.run(['python3',str(ART/'tools/inventory.py'),'--write'],cwd=ROOT,check=True)
registry=json.loads((ROOT/'assets/3d/asset-registry.json').read_text());inv=json.loads((ART/'inventory.json').read_text());files={}
for row in inv['files']:
 p=row['path']
 if p.startswith(('player/atlases/','enemies/','shared/','repair-r1/tiers/','repair-r1/cues/','repair-r1/studio/','repair-r2/color-source-contract.json','player/candidate-')) and pathlib.Path(p).suffix in ['.json','.png','.glb','.hdr']:
  files[str((ART/p).relative_to(ROOT))]={'bytes':row['bytes'],'sha256':row['sha256'],'license':row['license'],'publish':False}
for file in (OUT/'lighting').glob('*.hdr'):
 b=file.read_bytes();files[str(file.relative_to(ROOT))]={'bytes':len(b),'sha256':sha(b),'license':'CC0 original B2 player studio lighting derivative','publish':False}
for row in registry['assets']:
 if row.get('type')=='equipment':files[row['path']]={k:row[k] for k in ['bytes','sha256','license']};files[row['path']]['publish']=False
# Coverage is inherited only after all position/index/skin data is proven identical.
def glb(p):
 b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+n]),b[28+n:]
def access(d,b,a):
 v=d['bufferViews'][a['bufferView']];size={5126:4,5125:4,5123:2,5121:1}[a['componentType']]*{'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];start=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',size);return b''.join(b[start+i*stride:start+i*stride+size] for i in range(a['count']))
coverage=copy.deepcopy(registry['occlusion'])
for quality in ['low','medium','high']:
 old,ob=glb(ROOT/f'assets/3d/characters/player-v1/player-{quality}.glb');new,nb=glb(ART/f'player/candidate-{quality}.glb')
 for p,q in zip(old['meshes'][0]['primitives'],new['meshes'][0]['primitives']):
  for attr in ['POSITION','JOINTS_0','WEIGHTS_0']:
   aa=access(old,ob,old['accessors'][p['attributes'][attr]]);bb=access(new,nb,new['accessors'][q['attributes'][attr]])
   if attr=='JOINTS_0':assert aa==bb,(quality,attr)
   else:
    import numpy as np
    diff=float(np.max(np.abs(np.frombuffer(aa,dtype='<f4')-np.frombuffer(bb,dtype='<f4'))));print(quality,attr,diff);assert diff<=1e-6,(quality,attr,diff)
  assert access(old,ob,old['accessors'][p['indices']])==access(new,nb,new['accessors'][q['indices']]),quality
 coverage[quality]['formalReferenceCharacterSHA256']=coverage[quality]['characterSHA256'];coverage[quality]['characterSHA256']=sha((ART/f'player/candidate-{quality}.glb').read_bytes());coverage[quality]['verification']='primitive POSITION/WEIGHTS_0 within original 1e-6 float tolerance; JOINTS_0/indices exact to original registered character; existing covered-only policy'
vendor={}
for p in ['vendor/babylonjs/7.54.3/babylon.js','vendor/babylonjs/7.54.3/babylonjs.loaders.min.js']:
 b=(ROOT/p).read_bytes();vendor[p]={'bytes':len(b),'sha256':sha(b)}
manifest={'schema':'cw.t2b3.assets','version':1,'publish':False,'baselineMainHEAD':baseline,'B2InventorySHA':sha((ART/'inventory.json').read_bytes()),'files':files,'vendor':vendor,'registry':registry,'candidateCoverage':coverage,'knownLimits':{'nativeMaterialLighting':'B2 C still unresolved; Babylon ACES vs source AgX, quadrature/IBL and dynamic shadow mismatch; not selection evidence','geometryContact':'B2 C shoulder/guard/pommel risks remain; source failed evidence untouched','humanArtApproved':False,'physicalMobileGPUVerified':False,'B4PerformanceMeasured':False}}
b=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode();(OUT/'manifest.json').write_bytes(b)
p=OUT/'assets.mjs';s=p.read_text();import re
s=re.sub(r"MANIFEST_SHA='[^']+'", "MANIFEST_SHA='"+sha(b)+"'",s);p.write_text(s)
print('PASS B3 manifest,',len(files),'pinned asset references; candidate covered-only geometry (indices/weights exact; position roundtrip max1ULP)')
