#!/usr/bin/env python3
"""Development-only formal equipment catalog. No runtime/source-asset writes."""
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
_review_spec=importlib.util.spec_from_file_location('equipment_art_review', pathlib.Path(__file__).with_name('equipment-art-review.py'))
art_review=importlib.util.module_from_spec(_review_spec)
_review_spec.loader.exec_module(art_review)

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

def identities(root, rows):
    ledger = load(root / BASE / '_concept-identities.json')['sets']
    if len(ledger) != 210 or len({r['id'] for r in ledger}) != 210 or len({r['directory'] for r in ledger}) != 210:
        fail('Identity ledger count/duplicate ID/directory')
    mapping = {r['id']:r for r in ledger}
    for row in rows:
        identity = mapping.get(row['id'])
        if not identity or identity['sourceKey'] != row['sourceKey']:
            fail(f'{row["id"]}: permanent identity/sourceKey changed; review official ordering before modifying ledger')
        if not re.fullmatch(f"{row['epoch']}/{row['id']}-[a-z0-9]+(?:-[a-z0-9]+)*",identity['directory']):
            fail(f'{row["id"]}: invalid directory/slug')
        row['directory'] = (BASE / identity['directory']).as_posix()
    if rows[6]['directory'] != (BASE / 'galaxy/g007-ancient-tech-ruins').as_posix():
        fail('G007 directory must be retained')
    return rows

def image_info(file):
    data = file.read_bytes()
    if len(data) < 20 or data[:4] != b'RIFF' or data[8:12] != b'WEBP' or struct.unpack('<I',data[4:8])[0]+8 != len(data):
        fail(f'Invalid WebP RIFF: {file}')
    pos, dimensions, bitstream = 12, None, False
    while pos < len(data):
        if pos+8 > len(data): fail(f'Truncated WebP chunk: {file}')
        kind, size = data[pos:pos+4], struct.unpack('<I',data[pos+4:pos+8])[0]
        chunk = data[pos+8:pos+8+size]
        if len(chunk) != size: fail(f'Truncated WebP payload: {file}')
        if kind == b'VP8X' and size >= 10:
            dimensions = (1+int.from_bytes(chunk[4:7],'little'),1+int.from_bytes(chunk[7:10],'little'))
        elif kind == b'VP8 ' and size >= 10 and chunk[3:6] == b'\x9d\x01\x2a':
            bitstream=True
            dimensions=dimensions or (int.from_bytes(chunk[6:8],'little')&0x3fff,int.from_bytes(chunk[8:10],'little')&0x3fff)
        elif kind == b'VP8L' and size >= 5 and chunk[0] == 0x2f:
            bitstream=True
            bits=int.from_bytes(chunk[1:5],'little')
            dimensions=dimensions or ((bits&0x3fff)+1,((bits>>14)&0x3fff)+1)
        pos += 8 + size + (size & 1)
    if pos != len(data) or not dimensions or not bitstream or min(dimensions) < 1:
        fail(f'Missing/invalid WebP dimensions or static image stream: {file}')
    # Full decoding is mandatory: a plausible RIFF header cannot prove a usable image.
    try:
        from PIL import Image
    except ImportError as error:
        raise ValueError('Pillow required for full concept image decoding') from error
    else:
        with Image.open(file) as image:
            image.load()
            if image.size != dimensions: fail(f'WebP decoded dimensions disagree: {file}')
    return dict(file=file.name,width=dimensions[0],height=dimensions[1],bytes=len(data),sha256=sha(data))

def statuses(root, row):
    directory = root / row['directory']
    images = [image_info(directory / name) for name in IMAGES if (directory / name).is_file()]
    if len(images) == 2 and images[0]['sha256'] == images[1]['sha256']:
        fail(f'{row["id"]}: two concept images must differ')
    if row['id'] == 'g007':
        for name, expected in G007_HASHES.items():
            file = directory / name
            if not file.is_file() or sha(file.read_bytes()) != expected:
                fail(f'Protected G007 original image changed/missing: {name}')
    if row['id'] == 'g007':
        original = directory / 'history/2026-10-14/equipment-five-slots.webp'
        if not original.is_file() or sha(original.read_bytes()) != '2959fd08a50d7968ec228a4c8115f65988d018a4c57d045d876eec5c107d0ac0':
            fail('Protected G007 archived original changed/missing')
    approved, evidence = False, None
    review_mode, review_outcome = 'unreviewed', None
    review = directory / 'art-review.json'
    if review.exists():
        record = load(review)
        if record.get('schema') == 2:
            approved, evidence, review_outcome = art_review.verify(root,row,images,record)
            review_mode = 'autonomous-two-stage'
        elif record.get('schema') == 3:
            approved, evidence, review_outcome = art_review.verify(root,row,images,record)
            review_mode = 'two-stage-2.5d'
        elif record.get('conceptApproved') is True:
            review_mode = 'legacy-user-approval'
            proof = record.get('evidenceFile','')
            if not re.fullmatch(r'[a-zA-Z0-9_-]+\.md',proof) or not (directory / proof).is_file():
                fail(f'{row["id"]}: approval needs local Markdown user acceptance evidence')
            proof_text = (directory / proof).read_text(encoding='utf-8').strip()
            if row['id'] not in proof_text or '使用者' not in proof_text or len(proof_text) < 30:
                fail(f'{row["id"]}: incomplete user approval evidence')
            formal_hash = sha(dumps({k:row[k] for k in ('id','sourceKey','regionOrBoss','equipmentNames')}).encode())
            if record.get('reviewer') not in ('user', 'user-delegated-chatgpt') or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',record.get('approvedAt','')):
                fail(f'{row["id"]}: explicit user/date approval required')
            if record.get('reviewer') == 'user-delegated-chatgpt':
                authority = 'docs/BATCH28_DELEGATED_ART_REVIEW_AND_CONSOLIDATED_EXECUTION_2026-10-14.md'
                auth = root / authority
                if record.get('authorizationFile') != authority or not auth.is_file() or record.get('authorizationSha256') != sha(auth.read_bytes()) or '代理' not in proof_text or 'ChatGPT' not in proof_text:
                    fail(f'{row["id"]}: delegated approval needs exact authorization and proxy evidence')
            if len(images) != 2 or record.get('imageSha256') != {x['file']:x['sha256'] for x in images} or record.get('formalSha256') != formal_hash:
                fail(f'{row["id"]}: approval does not bind current images and formal identity')
            historical_approvals = {
                'g006': '812d586155d30452d89fcd26f4852629452f4faf37d07f33e19ba815a5d8a8e2',
                'g007': 'ef42ea891133e3bf0f36fc35281629ad6fbd2cbf26d6d08b21ad44e4aeb9fca0',
            }
            if sha(review.read_bytes()) != historical_approvals.get(row['id']):
                fail(f'{row["id"]}: new approval requires verified schema3; legacy evidence is historical only')
            approved, evidence = True, (pathlib.Path(row['directory']) / proof).as_posix()
    review_2_5d = directory / 'review-2_5d.json'
    if review_2_5d.exists():
        approved, evidence, review_outcome = art_review.verify(root,row,images,load(review_2_5d))
        review_mode = 'two-stage-2.5d'
    registry = load(root / 'assets/3d/asset-registry.json')
    world = {'galaxy':1,'universe':2,'higher':3}[row['epoch']]
    models = []
    for a in registry['assets']:
        if a.get('type') != 'equipment' or a.get('identity',{}).get('world') != world: continue
        slot = a.get('slot')
        if slot not in SLOTS or row['equipmentNames'][slot] not in a.get('names',[]): continue
        identity=a['identity']
        if world == 1 and row['regionOrBoss'] != f"{identity.get('chapter')} → {identity.get('area')}": continue
        if world == 2 and identity.get('bossId') != row['sourceKey'].split(':',1)[1]: continue
        if world == 3 and identity.get('band') != row['nameBand']['band']: continue
        file = root / a['path']
        if not file.is_file() or sha(file.read_bytes()) != a['sha256']: fail(f'{row["id"]}: registry model missing/hash mismatch')
        models.append(a['id'])
    model_status='existing-model-concept-alignment-unverified' if models else 'not-started'
    model_review=directory/'model-review.json'
    if models and model_review.is_file():
        mr=load(model_review);actual={a['id']:a['sha256'] for a in registry['assets'] if a['id'] in models}
        proof=directory/mr.get('evidenceFile','')
        authority=root/'docs/BATCH28_DELEGATED_ART_REVIEW_AND_CONSOLIDATED_EXECUTION_2026-10-14.md'
        if mr.get('reviewer')!='user-delegated-chatgpt' or not re.fullmatch(r'[a-zA-Z0-9_-]+\.md',mr.get('evidenceFile','')) or mr.get('authorizationFile')!='docs/BATCH28_DELEGATED_ART_REVIEW_AND_CONSOLIDATED_EXECUTION_2026-10-14.md' or mr.get('formalReleaseApproved') is not False or mr.get('assetSha256')!=actual or any(a['source']['sha256']!=mr.get('sourceSha256') for a in registry['assets'] if a['id'] in models) or not proof.is_file() or '代理' not in proof.read_text() or not authority.is_file() or sha(authority.read_bytes())!=mr.get('authorizationSha256'):
            fail(f'{row["id"]}: model review does not bind current assets/source/delegation')
        model_status='refined-model-art-reviewed'
    if approved:
        concept_status = (review_outcome if review_mode=='two-stage-2.5d' else
                          'auto-art-reviewed' if review_mode=='autonomous-two-stage' else 'approved')
    else:
        concept_status = review_outcome or ('images-present-awaiting-art-review' if len(images)==2
                                           else 'partial-images' if images else 'not-generated')
    return dict(notesStatus='generated-formal-manual-art-separated',conceptStatus=concept_status,
        conceptApproved=approved,artReviewMode=review_mode,modelingEligible=approved,
        assetProductionEligible=approved,asset2_5dStatus='not-started',gm2_5dTestStatus='not-tested',
        formalReleaseAllowed=False,modelStatus=model_status,
        images=images,approvalEvidence=evidence,modelEvidence=models)

def level_text(row):
    level=row['level']
    if row['epoch']=='galaxy': return f"Lv.{level['min']}～{level['max']}（區域範圍）"
    if row['epoch']=='universe': return f"Boss Lv.{level['bossLevel']}；裝備 min(玩家等級, Boss 等級)，下限 500"
    return f"玩家當下等級，非固定等級；{row['nameBand']['rule']} 決定名稱階數"

def formal_block(row):
    links=[]
    for source in row['sources']:
        links.append(f"- `{source['file']}:{source['line']}` — `{source['symbol']}`")
    text = [START,'## A. 正式身份（此區由工具維護）',f"- 套裝 ID：`{row['id']}`；紀元：{EPOCH_LABELS[row['epoch']]}（`{row['epoch']}`）",f"- 正式區域／Boss／階數：{row['regionOrBoss']}",f"- 對應等級：{level_text(row)}",f"- 永久來源鍵：`{row['sourceKey']}`",'', '| 槽位 | 正式中文名稱 |','| --- | --- |']
    text += [f'| {slot}（{label}） | {row["equipmentNames"][slot]} |' for slot,label in zip(SLOTS,LABELS)]
    text += ['', '程式資料來源：', *links, '', f"狀態：notes 已建立；概念圖 `{row['conceptStatus']}`；概念審查通過 `{str(row['conceptApproved']).lower()}`；審查模式 `{row['artReviewMode']}`；2.5D素材製作資格 `{str(row['assetProductionEligible']).lower()}`；2.5D素材 `{row['asset2_5dStatus']}`；GM `{row['gm2_5dTestStatus']}`；正式發布允許 `false`；模型 `{row['modelStatus']}`。",'', END]
    return '\n'.join(text)+'\n'

def manual_template(row):
    names=row['equipmentNames']
    themes={'galaxy':'區域任務型科技裝備：耐用機能分區、清楚工業結構', 'universe':'Boss 身份型星際裝備：保留來源 Boss 的輪廓主題與權能尺度', 'higher':'高維認知型裝備：以非實體截面、層疊輪廓及遮蔽場表達階數'}
    accent=('青藍','琥珀','銀紫','冷白','暗紅')[row['sourceIndex']%5]
    def suggestion(name, rules, fallback):
        return next((hint for terms,hint in rules if any(term in name for term in terms)),fallback)
    weapon=suggestion(names['weapon'],[(('炮',),'以炮口、散熱段與握持段形成明確前後重量分布'),(('槍',),'以修長槍身／槍尖和握持區建立方向性，先確認是射擊槍或長柄槍'),(('戟',),'以長柄與側刃形成多方向刃部輪廓'),(('杖',),'以握持杖身與頂端能量焦點形成垂直輪廓'),(('劍',),'以劍身、護手與握柄形成清楚單手持握輪廓'),(('刀','刃','鋒'),'以作用刃、刀背厚度與握柄區分切斬方向')],'以名稱中的場／線／式／相構成可辨識作用端，另保留實體持握核心')
    helmet=suggestion(names['helmet'],[(('冠','冕','環'),'保留冠冕／環狀主輪廓，另外加完整不透明能量面或懸浮遮面結構'),(('視','眼','覺','識','感','觀','知','思'),'採視域／感知場的非傳統頭部結構，以全臉維度遮罩隔絕五官'),(('盔','面甲'),'採有厚度的完整封閉面罩，分開額頂、感知面與下顎保護')],'依正式名稱建立頭部特徵，採完整不透明遮面而非露臉裝飾')
    armor=suggestion(names['armor'],[(('衣','披','幕','織','層'),'以柔性層次、垂覆邊界與關節織層形成衣裝輪廓'),(('甲','鎧','壁'),'以胸背護片厚度、肩腰分段與內層柔性關節形成裝甲輪廓')],'以包絡／場／相的層疊截面形成軀幹邊界，避免只換色')
    shoes=suggestion(names['shoes'],[(('浮','航','推進'),'以腳踝推進結構與可辨識鞋底分離層表達航行／浮行'),(('步','履','靴'),'以鞋頭、腳踝與鞋底抓地／導向分區表達步行方向')],'以成對足部投影與穩定接地輪廓表達特殊移動語意')
    accessory=suggestion(names['accessory'],[(('鑰','印','標'),'以鑰／印／標的中央識別符號與外框表達身份'),(('核','矩陣','主控','模組'),'以可讀核心、分層外殼與少量連結線表達控制裝置'),(('權','座','冠'),'以權柄／座／冠的秩序符號與階級輪廓表達統御'),(('式','公理','源','點'),'以幾何節點、截面與規律框架表達抽象原理')],'以正式名稱主題的單體符號和外框建立背部識別點')

    return f'''\n## B. 美術設計（人工維護）

**以下全部為「待確認的美術方向」；由正式名稱推導，並非既有正式設定或使用者已批准的設計。**

- 整體主題：以「{row['regionOrBoss']}」及五槽名稱為中心；{themes[row['epoch']]}。
- 武器「{names['weapon']}」：{weapon}；調整主體比例與作用端；持握接口沿用正式掛點。
- 頭盔「{names['helmet']}」：{helmet}；不能露出五官，也不把所有名稱變同款鋼盔。
- 鎧甲「{names['armor']}」：{armor}；胸背主輪廓與腰肩分區表達本套主題，保留關節活動與五槽邊界。
- 鞋子「{names['shoes']}」：左右成對；{shoes}。
- 飾品「{names['accessory']}」：{accessory}，與背部掛點及武器避讓。
- 色彩與材質：暫試中性主材＋{accent}小面積識別；硬質外殼、柔性關節與能源層分開。配色僅為候選，不以強發光掩蓋結構。
- 同紀元視覺區別：本套以「{row['regionOrBoss']}」及「{names['weapon']}」作用端／「{names['helmet']}」遮面家族／「{names['accessory']}」符號三者的組合區別相鄰套裝；配色不足以構成差異。概念圖生成前需比對總索引鄰近套裝，確認一個獨有輪廓要點。
- 人工補充／使用者回饋：待填；工具再次執行不覆寫本節。

## C. 技術限制（人工維護）

- 遵守全遮臉規則：頭盔、冠冕、光環、特殊視域都須完整遮住可辨識五官；卸除恢復第 27 批原頭臉。
- 相容第 27 批 53 骨骼與 9 正式掛點，不重建 rig / bind pose / skin weights 架構。
- 五槽可分離穿戴、卸除、混搭；雙鞋為一槽，不永久刪除人物網格。
- 預留 low／medium／high LOD；不改裝備名稱、戰力、掉落、存檔或遊戲邏輯。

## D. 概念圖規格（人工維護）

- `overview-front-side-back.webp`：同套正面、側面、背面及材質參考。
- `equipment-five-slots.webp`：五槽單品、遮面、接點與結構拆解。
- 每張建議 300～800 KB 以下；若建模細節仍清楚可更小。超過 800 KB 由驗證工具提示，並非自動壓縮授權。
- 未生成時不建立圖片；有圖片不等於概念審查通過、模型完成或正式發布允許。
- 只留 GitHub 開發資料，不進 GitHub Pages 或 Service Worker 預載。
'''

def note_text(row, old=None):
    block=formal_block(row)
    if old is None:
        return f"# {row['id'].upper()}｜{row['regionOrBoss']}｜裝備概念設計\n\n"+block+manual_template(row)
    if START in old or END in old:
        if old.count(START)!=1 or old.count(END)!=1 or old.index(START)>old.index(END): fail(f'{row["id"]}: malformed formal block markers')
        a,b=old.index(START),old.index(END)+len(END)
        return old[:a]+block.rstrip('\n')+old[b:]
    # First adoption of a hand-written note: retain every original byte as text.
    return (f"# {row['id'].upper()}｜正式資料與人工設計\n\n"+block+manual_template(row)+
        '\n## 既有人工 notes 原文（完整保留）\n\n'
        '> 下方「尚未上傳／尚不存在／PNG」為入庫前歷史描述。目前實際 WebP 狀態以上方 A 節與索引為準；圖片存在不代表使用者已批准，既有美術方向仍待確認。\n\n'+old)

def overview(rows):
    text=['# 《文明戰線》210 套正式裝備概念資料庫','',
        '正式名稱從最新程式 owner 讀取；ID 是永久身份，英文 slug 僅為檔案標籤。',
        '工具及維護方法：[資料庫維護規格](3D_EQUIPMENT_210_SET_DATABASE_MAINTENANCE.md)。',
        '概念審查、2.5D素材製作資格、素材完成、GM通過及正式發布是五個獨立階段；modelingEligible僅為素材資格的相容別名，既有G007模型另計。','']
    for epoch,label in [('galaxy','銀河紀元'),('universe','宇宙紀元'),('higher','高維紀元')]:
        group=[r for r in rows if r['epoch']==epoch]
        text += [f'## {label}（{len(group)} 套）','','| ID / notes 目錄 | 正式區域／Boss／階數 | 等級 | 武器 | 頭盔 | 鎧甲 | 鞋子 | 飾品 | 概念／批准／模型 |','| --- | --- | --- | --- | --- | --- | --- | --- | --- |']
        for r in group:
            link=f"[{r['id'].upper()}](../{r['directory']}/concept-notes.md)"
            text.append('| '+' | '.join([link,r['regionOrBoss'],level_text(r),*[r['equipmentNames'][s] for s in SLOTS],f"{r['conceptStatus']} / {str(r['conceptApproved']).lower()} / {r['modelStatus']}"])+' |')
        text.append('')
    return '\n'.join(text).rstrip()+'\n'

def write_if_changed(file, text):
    if file.exists() and file.read_text(encoding='utf-8')==text: return False
    file.parent.mkdir(parents=True,exist_ok=True)
    file.write_text(text,encoding='utf-8')
    return True

def run(root, generate=False):
    rows=identities(root,formal_sets(root))
    index=root/BASE/'_concept-index.json'
    # Fail preflight before touching any generated note or index.
    wanted={row['directory'] for row in rows}
    existing={p.relative_to(root).as_posix() for epoch in ('galaxy','universe','higher')
              if (root/BASE/epoch).exists() for p in (root/BASE/epoch).iterdir() if p.is_dir()}
    if existing-wanted: fail(f'Directory/notes mismatch: extra={sorted(existing-wanted)}')
    for file in ('resource-manifest.json','assets/3d/asset-registry.json','resource-cache-sw.js','resource-cache-client.js'):
        if any(token in (root/file).read_text(encoding='utf-8') for token in (BASE.as_posix(), *IMAGES)): fail(f'Development concepts referenced by runtime: {file}')
    previous=load(index) if index.exists() else {'sets':[]}
    old_rows=previous.get('sets',[])
    if len({r['id'] for r in old_rows})!=len(old_rows): fail('Existing index duplicate ID')
    prior={r['id']:r for r in old_rows}
    warnings=[]
    changed=0
    planned=[]
    for row in rows:
        old=prior.get(row['id'])
        if old and (old['sourceKey']!=row['sourceKey'] or old['regionOrBoss']!=row['regionOrBoss'] or old['directory']!=row['directory']):
            fail(f'{row["id"]}: formal identity moved/renamed; explicit human mapping review required')
        row.update(statuses(root,row))
        comparable={k:v for k,v in row.items() if k!='lastUpdated'}
        row['lastUpdated']=old['lastUpdated'] if old and {k:v for k,v in old.items() if k!='lastUpdated'}==comparable else datetime.date.today().isoformat()
        file=root/row['directory']/'concept-notes.md'
        current=file.read_text(encoding='utf-8') if file.exists() else None
        expected=note_text(row,current)
        if generate: planned.append((file,expected))
        elif current is None or current!=expected: fail(f'{row["id"]}: missing/stale notes formal block; run generate')
        for image in row['images']:
            if image['bytes']>800_000: warnings.append(f"{row['id']}/{image['file']}: {image['bytes']} bytes exceeds suggested 800 KB")
    expected={'schema':1,'counts':{'galaxy':100,'universe':100,'higher':10,'total':210,'equipmentPositions':1050},'sets':rows}
    if generate:
        # All identities, approvals, images and notes are checked before any write.
        for file,text in planned: changed+=write_if_changed(file,text)
        changed+=write_if_changed(index,dumps(expected))
        changed+=write_if_changed(root/MASTER,overview(rows))
    elif not index.exists() or load(index)!=expected: fail('Index differs from formal sources, file evidence, or statuses; run generate')
    elif not (root/MASTER).exists() or (root/MASTER).read_text(encoding='utf-8')!=overview(rows): fail('Readable master index missing/stale')
    wanted={row['directory'] for row in rows}
    actual={(p.parent).relative_to(root).as_posix() for epoch in ('galaxy','universe','higher') for p in (root/BASE/epoch).glob('*/concept-notes.md')}
    directories={p.relative_to(root).as_posix() for epoch in ('galaxy','universe','higher') for p in (root/BASE/epoch).iterdir() if p.is_dir()}
    if actual!=wanted or directories!=wanted: fail(f'Directory/notes mismatch: missing={sorted(wanted-actual)}, extra={sorted((actual|directories)-wanted)}')
    occurrences={}
    for row in rows:
        for slot,name in row['equipmentNames'].items(): occurrences.setdefault(name,[]).append(f"{row['id']}:{slot}")
    duplicates={n:ids for n,ids in occurrences.items() if len(ids)>1}
    print(dumps(dict(passed=True,counts=expected['counts'],changedFiles=changed,
        conceptImages=sum(len(r['images']) for r in rows),setsWithBothImages=sum(len(r['images'])==2 for r in rows),
        conceptApproved=sum(r['conceptApproved'] for r in rows),setsWithoutImages=sum(not r['images'] for r in rows),
        setsWithExistingModels=sum(bool(r['modelEvidence']) for r in rows),officialRepeatedNames=duplicates,warnings=warnings)),end='')
    return rows

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=('generate','validate'))
    args=parser.parse_args()
    try: run(ROOT,args.command=='generate')
    except (ValueError,KeyError,OSError,subprocess.CalledProcessError,json.JSONDecodeError) as error:
        print(f'FAIL equipment concepts: {error}',file=sys.stderr)
        if isinstance(error,subprocess.CalledProcessError): print(error.stderr,file=sys.stderr)
        return 1
    return 0

if __name__=='__main__': sys.exit(main())
