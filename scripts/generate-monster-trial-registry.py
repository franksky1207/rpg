"""Generate the single shared GM/formal registry with explicit map/dungeon consumer approval."""
import json,pathlib,sys
r=pathlib.Path(__file__).resolve().parents[1]
read=lambda p:json.loads((r/p).read_text())
m=read('data/monsters/monster-assets.json')
d=read('docs/MONSTER_MAP_MAPPING_BATCH13_STEP1_2026-10-20.json')
mappings=read('data/monsters/monster-mappings.json')
variants=read('data/monsters/monster-variants.json')
assert m['formalBattleEnabled'] is mappings['formalBattleEnabled'] is True
assert all(a['formalBattleAllowed'] is True for a in m['assets'])
assert len(m['assets'])==len({a['assetId'] for a in m['assets']})==33
assert len(mappings['records'])==len({x['id'] for x in mappings['records']})==695
assert {x['assetId'] for x in mappings['records']}=={a['assetId'] for a in m['assets']}
encode=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
code='// Approved map, dungeon and boss presentation data; formal consumers enforce explicit scope.\nconst data='+encode(m)+';\n'
code+='const planned='+encode({x['id']:x['assetId'] for x in d['records']})+';\n'
code+='const identities='+encode({x['id']:x for x in mappings['records']})+';\n'
code+='const colors='+encode(variants['palettes'])+';\n'
code+='''function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export const registry=freeze(data);
export const mappings=freeze(identities);
export const palettes=freeze(colors);
export function findAsset(id){return registry.assets.find(a=>a.assetId===id)||null;}
export function findMapping(identity){return Object.hasOwn(mappings,identity)?mappings[identity]:null;}
export function identitiesForAsset(assetId){return Object.values(mappings).filter(row=>row.assetId===assetId);}
export function plannedAssetId(identity){return Object.hasOwn(planned,identity)?planned[identity]:null;}
'''
p=r/'3d-test/monster-sprites.mjs'
if '--check' in sys.argv:
 assert p.read_text()==code,'monster registry differs from verified assets/mappings/variants'
else:p.write_text(code)
