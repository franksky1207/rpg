#!/usr/bin/env python3
"""Pin the two historical public JS owners used by the immutable GM fixture.
No art, concept, review, or development source assets are exported.
"""
import hashlib,json,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE='fbe46d9004eb38afbac55b8de03f832237ca56df'
rows={}
for p in ['combat-events.js','3d-test/appearance-snapshot.js']:
    source=subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT).decode()
    rows[p]={'beforeSHA256':hashlib.sha256(source.encode()).hexdigest(),'afterSHA256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest(),'source':source}
raw=(json.dumps({'schema':'cw.phase5.immutable-fixture-owners.v1','baselineHEAD':BASE,'sources':rows},ensure_ascii=False,indent=2)+'\n').encode()
p=ROOT/'3d-test/fixture-owner-history.json'
if '--check' in sys.argv:assert p.read_bytes()==raw
else:
 p.write_bytes(raw)
 f=ROOT/'development/hybrid-comparison/fixture-input.mjs';code=f.read_text();import re
 code=re.sub(r"PHASE5_SOURCES_SHA='[^']*'", "PHASE5_SOURCES_SHA='"+hashlib.sha256(raw).hexdigest()+"'",code);f.write_text(code)
print('Two exact historical public JS owners retained; immutable fixture bytes unchanged')
