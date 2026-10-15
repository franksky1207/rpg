#!/usr/bin/env python3
"""Separate, narrow player-sprite release. Never grants the legacy 3D release."""
import hashlib,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
catalog=json.loads((ROOT/'assets/gm-equipment-2_5d/v1/catalog.json').read_text())
ids=['g005','g007','g018']
assert sorted(e['id'] for e in catalog['entries'])==ids
entries=[]
for original in catalog['entries']:
    e=json.loads(json.dumps(original));e['formalBattleAllowed']=True
    raw=(ROOT/e['asset']['path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==e['asset']['sha256'] and len(raw)==e['asset']['bytes']
    assert e['status']=='complete' and e['gmPreviewAllowed'] is True
    entries.append(e)
data={'schema':'cw.formal.player-sprites.v1','playerSpritesEnabled':True,'legacy3DEnabled':False,'ids':ids,'entries':entries,'sets':[r for r in catalog['sets'] if r['id'] in ids]}
code=('/* Generated narrow release; source art / GM / full 3D permissions remain independent. */\n(function(g){const data='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';function freeze(x){if(x&&typeof x==="object"){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}g.CivilizationFormalPlayerSprites=freeze(data);})(window);\n').encode()
outputs={'3d-test/formal-player-sprites.js':code}
lock={'schema':data['schema'],'ids':ids,'playerSpritesEnabled':True,'legacy3DEnabled':False,'files':{p:{'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)} for p,b in outputs.items()}}
outputs['development/equipment-2_5d/formal-publication.json']=(json.dumps(lock,indent=2)+'\n').encode()
for p,b in outputs.items():
    if '--check' in sys.argv: assert (ROOT/p).read_bytes()==b,p+' stale'
    else:(ROOT/p).write_bytes(b)
print('Formal player-only release: G005/G007/G018; legacy 3D disabled')
