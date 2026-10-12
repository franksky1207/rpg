"""SHA/bytes/license ledger for isolated B3 sources and actual review evidence."""
import pathlib,json,hashlib,argparse
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[2]
def collect():
 rows=[]
 for p in sorted(HERE.rglob('*')):
  if not p.is_file() or p.name=='inventory.json' or '__pycache__' in p.parts:continue
  b=p.read_bytes();rows.append({'path':str(p.relative_to(HERE)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'publish':False,'license':'CC0-1.0 original project asset derivative' if p.suffix in ['.png','.hdr','.blend','.svg'] else 'Original repository source / provenance / technical evidence; see LICENSE.md'})
 return {'schema':'cw.t2b3.development-inventory','version':1,'publish':False,'baselineMainHEAD':'e094f4e8704a808c94551acd9226c2982c67c537','fixtureSHA256':'5a74c2eeb00014b208bcb175d2bd6f7668e430112dc7ebec8a7b5ac3ced83d99','playerStudioOriginalSourceSHA256':hashlib.sha256((HERE.parent/'t2b2-v1/player/animation-source.blend').read_bytes()).hexdigest(),'realGPUVerified':False,'artApproved':False,'files':rows,'totalBytes':sum(r['bytes'] for r in rows)}
p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');p.add_argument('--check',action='store_true');a=p.parse_args();d=collect();file=HERE/'inventory.json'
if a.write:file.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
else:assert json.loads(file.read_text())==d,'B3 inventory SHA/bytes/license mismatch'
print('PASS B3 development-only inventory',len(d['files']),d['totalBytes'],'bytes; not a GPU measurement')
