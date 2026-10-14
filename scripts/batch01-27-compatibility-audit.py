#!/usr/bin/env python3
"""Reproducible dependency/asset evidence; never writes game data or approvals."""
import hashlib,json,pathlib,re,struct,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
def digest(path):return hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
texts={p:(ROOT/p).read_text(errors='replace') for p in tracked if p and p.endswith(('.js','.mjs','.html','.css')) and not p.startswith(('.', 'development/','docs/','tests/','scripts/','vendor/'))}
modules=[]
for path in sorted(p for p in tracked if p.startswith('3d-test/') and p.endswith(('.js','.css'))):
 name=path.rsplit('/',1)[1]
 modules.append({'path':path,'sha256':digest(path),'consumers':sorted(p for p,s in texts.items() if p!=path and (path in s or name in s)),'classification':'KEEP'})
registry=json.loads((ROOT/'assets/3d/asset-registry.json').read_text());assets=[]
for a in registry['assets']:
 b=(ROOT/a['path']).read_bytes();assert len(b)==a['bytes'] and hashlib.sha256(b).hexdigest()==a['sha256'],a['path'];assert a['license'] and a['preload'] is False
 assets.append({'path':a['path'],'id':a['id'],'type':a['type'],'quality':a['quality'],'bytes':len(b),'sha256':a['sha256'],'license':a['license'],'classification':'KEEP'})
rigs=[]
for p in sorted((ROOT/'assets/3d/characters/player-v1').glob('*.glb')):
 b=p.read_bytes();d=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]]);bones=[d['nodes'][i]['name'] for i in d['skins'][0]['joints']];mounts=[n['name'] for n in d['nodes'] if re.match(r'^(socket\.|fx\.)',n.get('name',''))];assert len(bones)==53 and len(mounts)==9
 rigs.append({'path':str(p.relative_to(ROOT)),'bones':bones,'mounts':mounts,'sha256':digest(str(p.relative_to(ROOT)))})
assert all(x['bones']==rigs[0]['bones'] for x in rigs)
index='development/3d-source/equipment/concepts/_concept-index.json';concept=json.loads((ROOT/index).read_text());assert concept['counts']=={'galaxy':100,'universe':100,'higher':10,'total':210,'equipmentPositions':1050}
images=[]
for row in concept['sets']:
 if row['id'] not in ['g'+str(i).zfill(3) for i in range(1,21)]:continue
 assert len(row['images'])==2 and row['formalReleaseAllowed'] is False
 for image in row['images']:
  p=row['directory']+'/'+image['file'];b=(ROOT/p).read_bytes();assert len(b)==image['bytes'] and digest(p)==image['sha256'];images.append({'path':p,'sha256':image['sha256'],'bytes':image['bytes'],'conceptApproved':row['conceptApproved'],'classification':'FUTURE-28-40'})
assert len(images)==40
factories=re.findall(r'function (create\w+Scene)\(',texts['3d-test/prototype-engine.js'])
factory_consumers={f:sorted(p for p,s in texts.items() if p!='3d-test/prototype-engine.js' and f in s) for f in factories}
assert all(factory_consumers.values()),factory_consumers
removed=['3d-test/formal-home.js','3d-test/formal-dom.js','3d-test/preview-expand.css']
for p in removed:
 assert not (ROOT/p).exists()
 assert not any(p in s for s in texts.values()),p
ledger=json.loads((ROOT/'development/retired-formal-previews/20261013/source-evolution.json').read_text())
for p,row in ledger['files'].items():
 assert digest(row['archive'])==row['beforeSHA256']
 if row['afterSHA256'] is not None:assert digest(p)==row['afterSHA256']
assert 'const FULL_3D_AVAILABLE=false' in texts['3d-test/mode-foundation.js']
assert 'const FORMAL_B_RELEASED=false' in texts['3d-test/t3b-formal-controller.js']
output={'schema':'cw.batch01-27.compatibility.v1','baselineMain':'b2e4f3c69a387f7c86412ed4cd4687f6b13a6552','approvedFormalRelease':False,'modules':modules,'factoryConsumers':factory_consumers,'registeredAssets':assets,'rigs':rigs,'conceptIndexSHA256':digest(index),'futureConceptImages':images,'removedFormalControllers':removed,'historicalArchives':ledger,'limitations':['Lexical reverse references supplement actual browser/contract tests, not replace them.','Linux Chromium/WebKit and SwiftShader are not physical iPhone GPU or OS App switching.']}
print(json.dumps(output,ensure_ascii=False,indent=2))
