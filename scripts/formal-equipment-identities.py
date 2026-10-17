#!/usr/bin/env python3
"""Read-only formal equipment identity extraction from authoritative game data.\nNo concept art, review ledger, or production eligibility dependencies.\n"""
import importlib.util
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import struct
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = pathlib.Path('development/3d-source/equipment/concepts')
MASTER = pathlib.Path('docs/3D_EQUIPMENT_210_SET_MASTER_INDEX.md')
SLOTS = ('weapon', 'helmet', 'armor', 'shoes', 'accessory')
LABELS = ('武器', '頭盔', '鎧甲', '鞋子', '飾品')
EPOCH_LABELS = {'galaxy':'銀河紀元','universe':'宇宙紀元','higher':'高維紀元'}
IMAGES = ('overview-front-side-back.webp', 'equipment-five-slots.webp')
START, END = '<!-- formal-equipment:start -->', '<!-- formal-equipment:end -->'

G007_HASHES = {
    IMAGES[0]: '0f9ad6179ac17fbd94f46897c433ce9003f19cb4290bc46c49ddbfd21ff67645',
    IMAGES[1]: 'ac1beed76e607a70e3d83b46deaf0bb9866e9d481ba77f3d2ff9b1ad34a7f38c',
}
# Execute only formal owners in an isolated VM, with no filesystem/network/process
# bindings. Galaxy registration uses the real registerRegionMaps implementation.
EXTRACT = r'''
const fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const data=read('data.js'),begin=data.indexOf('const WORLD_REGIONS='),end=data.indexOf('function validateWorldMapRegistration');
if(begin<0||end<=begin)throw Error('Galaxy owner declaration boundaries changed');
const c=vm.createContext({});
vm.runInContext(data.slice(begin,end)+';this.regions=WORLD_REGIONS;this.maps=MAPS;',c,{timeout:1000});
for(const r of c.regions)vm.runInContext(read(`worldmaps-${r.id}.js`),c,{timeout:1000});
const w={};vm.runInNewContext(read('secondworlddata.js'),{window:w,console:{warn(){},error(){}}},{timeout:1000});
if(!w.SECOND_WORLD_DATA_INTEGRITY.passed)throw Error(JSON.stringify(w.SECOND_WORLD_DATA_INTEGRITY));
const loot=read('thirdworldloot.js'),match=loot.match(/const NAME_ROWS=(Object\.freeze\(\[[\s\S]*?\]\));/);
if(!match)throw Error('Higher NAME_ROWS declaration changed');
const high=vm.runInNewContext(match[1],{}, {timeout:1000});
const slotDecl=read('engine.js').match(/const EQUIPMENT_TYPES=(\[[^;]+\]);/);
if(!slotDecl)throw Error('Formal slot declaration missing');
const slots=vm.runInNewContext(slotDecl[1],{}, {timeout:1000});
const owner=read('thirdworlddata.js'),a=owner.indexOf('function thirdWorldEquipmentNameBandForRemainingHp('),b=owner.indexOf('function thirdWorldEquipmentNameBand(',a);
if(a<0||b<=a)throw Error('Higher band owner boundaries changed');
const ctx=vm.createContext({finiteWhole:(v,f=0)=>Number.isFinite(Number(v))?Math.floor(Number(v)):f});
vm.runInContext(owner.slice(a,b),ctx,{timeout:1000});
const bands=Array.from({length:1001},(_,hp)=>ctx.thirdWorldEquipmentNameBandForRemainingHp(hp,1000));
console.log(JSON.stringify({regions:c.regions,maps:c.maps,universe:w.SECOND_WORLD_BOSSES,universeRegions:w.SECOND_WORLD_REGIONS,higher:high,bands,slots}));
'''

def fail(message):
    raise ValueError(message)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def load(path):
    return json.loads(path.read_text(encoding='utf-8'))

def dumps(data):
    return json.dumps(data, ensure_ascii=False, indent=2) + '\n'

def location(root, file, needle, symbol):
    text = (root / file).read_text(encoding='utf-8')
    offset = text.find(needle)
    if offset < 0:
        fail(f'Source location missing: {file}: {needle}')
    return {'file': file, 'line': text[:offset].count('\n') + 1, 'symbol': symbol}

def formal_sets(root):
    result = subprocess.run(['node', '-e', EXTRACT], cwd=root, text=True, capture_output=True, check=True)
    data = json.loads(result.stdout)
    if data['slots'] != list(SLOTS): fail('Formal slot ordering changed; review gear-array mapping')
    if [len(data[k]) for k in ('regions', 'maps', 'universe', 'universeRegions', 'higher')] != [10, 100, 100, 10, 10]:
        fail('Formal counts differ from 10 regions / 100 maps / 100 bosses / 10 bands; investigate before generating')
    rows = []
    for i, m in enumerate(data['maps']):
        region = next(r for r in data['regions'] if r['mapStart'] <= i <= r['mapEnd'])
        if region['mapEnd'] - region['mapStart'] != 9 or m['chapter'] != region['name'] or len(m['gear']) != 5:
            fail(f'Galaxy registration/slots inconsistent: {i}')
        file = f"worldmaps-{region['id']}.js"
        local = i - region['mapStart']
        symbol = 'EARTH_MAPS' if region['id'] == 'earth' else 'SOLAR_MAPS' if region['id'] == 'solar' else 'REGION_MAPS'
        rows.append(dict(id=f'g{i+1:03}', epoch='galaxy', sourceKey=f"galaxy:{region['id']}:map:{local}",
            regionOrBoss=f"{m['chapter']} → {m['name']}", level={'kind':'region-range','min':m['min'],'max':m['max']},
            equipmentNames=dict(zip(SLOTS,m['gear'])), sourceIndex=i,
            sources=[location(root,file,f'name:"{m["name"]}"',f'{symbol}[{local}].gear'),
                     location(root,'data.js','const WORLD_REGIONS=', 'WORLD_REGIONS / registerRegionMaps'),
                     location(root,'engine.js','function makeItem(', 'makeItem / MAPS[mapIdx].gear')]))
    for i, b in enumerate(data['universe']):
        if b['index'] != i or b['regionIndex'] != i // 10:
            fail(f'Universe index/region inconsistent: {i}')
        rows.append(dict(id=f'u{i+1:03}',epoch='universe',sourceKey='universe:'+b['id'],
            regionOrBoss=f"{b['regionName']} → {b['name']}",level={'kind':'boss-reference','bossLevel':b['level'],'equipmentRule':'min(playerLevel, bossLevel), floor 500'},
            equipmentNames=b['equipment'],sourceIndex=i,
            sources=[location(root,'secondworlddata.js',f'"id": "{b["id"]}"',f'SECOND_WORLD_BOSSES[{i}].equipment'),
                     location(root,'secondworldrewards.js','function makeSecondWorldEquipmentForBoss(', 'makeSecondWorldEquipmentForBoss')]))
    for i, h in enumerate(data['higher']):
        band = h['band']
        if band != i + 1:
            fail(f'Higher bands are not ordered 1..10: {band}')
        actual = [hp for hp, b in enumerate(data['bands']) if b == band]
        # Preserve boundary inclusivity from the actual HP owner, not a guessed level range.
        rows.append(dict(id=f'h{band:02}',epoch='higher',sourceKey=f'higher:band:{band}',
            regionOrBoss=f'第 {band} 階 → {h["theme"]}',level={'kind':'player-current','fixedLevel':None,
                'equipmentRule':'thirdworldloot.js: playerEquipmentLevel / makeThirdWorldEquipment'},
            nameBand={'band':band,'theme':h['theme'],'remainingHpPercent':{'lower':round((min(actual)-1)/10,1) if band<10 else 0,'upper':max(actual)/10,'lowerInclusive':band==10,'upperInclusive':True},
                'rule':f'{max(0,100-band*10)}% < HP ≤ {110-band*10}%' if band < 10 else '0% ≤ HP ≤ 10%'},
            equipmentNames={slot:h[slot] for slot in SLOTS},sourceIndex=i,
            sources=[location(root,'thirdworldloot.js',f'Object.freeze({{band:{band},',f'THIRD_WORLD_EQUIPMENT_NAME_ROWS[{i}]'),
                     location(root,'thirdworlddata.js','function thirdWorldEquipmentNameBandForRemainingHp(', 'thirdWorldEquipmentNameBandForRemainingHp'),
                     location(root,'thirdworldloot.js','function makeThirdWorldEquipment(', 'makeThirdWorldEquipment')]))
    if len({r['id'] for r in rows}) != 210 or len({r['sourceKey'] for r in rows}) != 210:
        fail('Duplicate formal IDs/sourceKeys')
    for r in rows:
        if set(r['equipmentNames']) != set(SLOTS) or any(not isinstance(n,str) or not n.strip() for n in r['equipmentNames'].values()):
            fail(f'{r["id"]}: incomplete five-slot names')
    return rows

def validate_formal(root=ROOT):
    rows=formal_sets(root)
    expected=[f'g{i:03}' for i in range(1,101)]+[f'u{i:03}' for i in range(1,101)]+[f'h{i:02}' for i in range(1,11)]
    if [r['id'] for r in rows]!=expected:
        fail('Formal ID order differs from G001-G100 / U001-U100 / H01-H10')
    if sum(len(r['equipmentNames']) for r in rows)!=1050:
        fail('Formal five-slot total differs from 1050')
    return rows

if __name__=='__main__':
    rows=validate_formal()
    print(json.dumps({'schema':'cw.formal-equipment-identity.v1','sets':len(rows),'slots':1050,'ids':[r['id'] for r in rows],'rows':[{k:r[k] for k in ('id','epoch','sourceKey','regionOrBoss','equipmentNames')} for r in rows]},ensure_ascii=False))
