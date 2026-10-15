"""Explicit --write creates only B2 development inventory; default --check.
Never re-generates T2-A fixtures or the production manifest/registry.
"""
import pathlib,json,hashlib,struct,argparse,subprocess
HERE=pathlib.Path(__file__).resolve().parents[1];ROOT=HERE.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def glb(p):
 b=p.read_bytes();assert b[:4]==b'glTF';return json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]])
def collect():
 lock=json.loads((HERE/'source-lock.json').read_text())
 evolved=[]
 allowed={'development/hybrid-comparison/index.html','development/hybrid-comparison/comparison.css','development/hybrid-comparison/comparison.mjs','development/hybrid-comparison/playback.mjs'}
 for s,h in lock['sources'].items():
  if s in json.loads((ROOT/'development/retired-formal-previews/20261013/source-evolution.json').read_text())['files']:
   subprocess.check_call(['node','-e',"require('./development/hybrid-comparison/t2b3-v1/source-version.cjs')(process.argv[1],process.argv[2])",s,h],cwd=ROOT)
   continue
  refinement=ROOT/'development/3d-source/equipment/ancient-ruins-v1/refinement-source-evolution.json'
  if refinement.exists() and s in json.loads(refinement.read_text())['files']:
   subprocess.check_call(['node','-e',"require('./development/hybrid-comparison/t2b3-v1/source-version.cjs')(process.argv[1],process.argv[2])",s,h],cwd=ROOT)
   continue
  if s in {'development/hybrid-comparison/fixture-input.mjs','scripts/hybrid-comparison-fixtures.cjs'}:
   # Exact original/archive/current chains, not a new permissive allowlist.
   subprocess.check_call(['node','-e',"require('./development/hybrid-comparison/t2b3-v1/source-version.cjs')(process.argv[1],process.argv[2])",s,h],cwd=ROOT)
   continue
  phase4=ROOT/'development/equipment-2_5d/gm-source-evolution.json'
  phase5=ROOT/'development/equipment-2_5d/formal-source-evolution.json'
  if (phase4.exists() and s in json.loads(phase4.read_text())['files']) or (phase5.exists() and s in json.loads(phase5.read_text())['files']):
   # Same exact historical/source chain as Node; original B2 lock remains immutable.
   subprocess.check_call(['node','-e',"require('./development/hybrid-comparison/t2b3-v1/source-version.cjs')(process.argv[1],process.argv[2])",s,h],cwd=ROOT)
   continue
  current=sha(ROOT/s)
  if current==h:continue
  assert s in allowed,('Protected non-B1 source changed',s)
  version=json.loads((HERE.parent/'t2b3-v1/source-evolution.json').read_text())
  assert version['schema']=='cw.t2b3.authorized-b1-evolution' and version['baselineHEAD']=='e094f4e8704a808c94551acd9226c2982c67c537'
  assert set(version['files'])==allowed and version['files'][s]['beforeSHA256']==h and version['files'][s]['afterSHA256']==current
  previous=subprocess.check_output(['git','show',version['baselineHEAD']+':'+s],cwd=ROOT)
  assert hashlib.sha256(previous).hexdigest()==h,('Original B1 history lock',s)
  evolved.append(s)

 evolved.sort() # order remains the locked B1/B3 source-path order
 rows=[]
 for p in sorted(HERE.rglob('*')):
  if not p.is_file() or p.name=='inventory.json' or '__pycache__' in p.parts or p.suffix in ['.pyc','.blend1']:continue
  row={'path':str(p.relative_to(HERE)),'bytes':p.stat().st_size,'sha256':sha(p),'license':'CC0-1.0 original or derivative of existing CC0 reference','status':'prototype-pending-user-approval','publish':False}
  if p.suffix=='.glb':
   d=glb(p);row['metrics']={'triangles':sum(d['accessors'][q['indices']]['count']//3 for m in d['meshes'] for q in m['primitives']),'meshes':len(d['meshes']),'materials':len(d.get('materials',[])),'embeddedImages':len(d.get('images',[])),'joints':[len(s['joints']) for s in d.get('skins',[])],'animations':[a['name'] for a in d.get('animations',[])],'clipRanges':{a['name']:{'startSeconds':min(d['accessors'][s['input']]['min'][0] for s in a['samplers']),'endSeconds':max(d['accessors'][s['input']]['max'][0] for s in a['samplers'])} for a in d.get('animations',[])},'timeContract':'elapsed=sampleTime-clipStart; B2 clips 700ms, authored GLB origin 1/30s; no extra initial wait'}
  rows.append(row)
 return {'schema':'cw.t2b2.development-assets','version':1,'baseline':lock['baseline'],'fixtureSHA':lock['fixtureSHA'],'formalIds':'unavailable/null; paths are development asset locators, never formal IDs','scope':'B2 original art, offline baking and QC only; no A/B/C renderer','sourcesUnchanged':not bool(evolved),'originalSourceHistoryVerified':True,'authorizedB3B1Evolution':evolved,'userArtApproval':False,'files':rows,'totalBytes':sum(r['bytes'] for r in rows),'largestFileBytes':max(r['bytes'] for r in rows)}
p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');p.add_argument('--check',action='store_true');args=p.parse_args();result=collect();file=HERE/'inventory.json'
if args.write:file.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
else:assert json.loads(file.read_text())==result,'Inventory/source SHA mismatch; investigate before explicit update'
print('PASS B2 inventory and original source locks',len(result['files']),result['totalBytes'],'bytes')
