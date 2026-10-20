import json,pathlib
r=pathlib.Path(__file__).resolve().parents[1]
m=json.loads((r/'data/monsters/monster-assets.json').read_text())
d=json.loads((r/'docs/MONSTER_MAP_MAPPING_BATCH13_STEP1_2026-10-20.json').read_text())
code='// Six-image trial only. Planned identities never enable formal battle.\nconst data='+json.dumps(m,ensure_ascii=False,separators=(',',':'))+';\n'
code+='const planned='+json.dumps({x['id']:x['assetId'] for x in d['records']},separators=(',',':'))+';\n'
code+='''function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export const registry=freeze(data);
export function findAsset(id){return registry.assets.find(a=>a.assetId===id)||null;}
export function plannedAssetId(identity){return Object.hasOwn(planned,identity)?planned[identity]:null;}
'''
import sys
p=r/'3d-test/monster-sprites.mjs'
if '--check' in sys.argv:
 assert p.read_text()==code,'monster registry differs from verified manifest/planned mapping'
else:
 p.write_text(code)
