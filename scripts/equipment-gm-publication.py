#!/usr/bin/env python3
"""Deterministic, exact allowlist export; source validation remains mandatory in CI."""
import copy,hashlib,json,sys,runpy,importlib.util
import equipment_sprite_assets as sprites
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=Path('assets/gm-equipment-2_5d/v1'); RUNTIME=Path('3d-test/equipment-sprites-v1')
SOURCE=Path('development/equipment-2_5d/v1')
def build():
    runpy.run_path(str(ROOT/'scripts/equipment-weapon-assets.py'))['validate'](ROOT)
    outputs={}
    registry=json.loads((ROOT/SOURCE/'registry.json').read_text())
    spec=importlib.util.spec_from_file_location('formal_equipment_identities',ROOT/'scripts/formal-equipment-identities.py')
    formal=importlib.util.module_from_spec(spec);spec.loader.exec_module(formal)
    rows=formal.validate_formal(ROOT); entries=[]
    assert len(rows)==210
    for original in registry['entries']:
        assert original['id'] in ('g005','g007','g018') and original['status']=='complete'
        row=next(r for r in rows if r['id']==original['id'])
        assert original==sprites.verified_entry(ROOT,row,True)
        e={k:copy.deepcopy(original[k]) for k in ('id','formalIdentity','version','facing','pivot','status','asset','gmTestStatus','formalReleaseAllowed')}
        e['formalIdentity'].pop('directory',None);e['gmPreviewAllowed']=True
        weapons=json.loads((ROOT/'development/equipment-2_5d/weapons-v1/registry.json').read_text())
        w=copy.deepcopy(next(w for w in weapons['entries'] if w['id']==e['id']))
        assert w['weaponAnimationStatus']=='complete' and w['template']=='one-hand-blade'
        for layer in ('body','weapon'):
            raw=(ROOT/w[layer]['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==w[layer]['sha256'] and len(raw)==w[layer]['bytes']
            w[layer]['path']=(BASE/(e['id']+'-'+('attack-body' if layer=='body' else 'weapon')+'.webp')).as_posix();outputs[w[layer]['path']]=raw
        w.pop('source',None);w.pop('review',None);e['weaponAnimation']=w
        data=(ROOT/e['asset']['path']).read_bytes();assert hashlib.sha256(data).hexdigest()==e['asset']['sha256']
        e['asset']['path']=(BASE/(e['id']+'.webp')).as_posix();outputs[e['asset']['path']]=data;entries.append(e)
    assert sorted(e['id'] for e in entries)==['g005','g007','g018']
    catalog=[{**{k:r[k] for k in ('id','epoch','sourceKey','regionOrBoss','equipmentNames')},'weaponAnimationStatus':'complete' if r['id'] in ('g005','g007','g018') else 'not-started'} for r in rows]
    catalog_path=(BASE/'catalog.json').as_posix()
    catalog_bytes=(json.dumps({'schema':'cw.gm.whole-suit.v1','formalBattleEnabled':False,'entries':entries,'sets':catalog},ensure_ascii=False,indent=2)+'\n').encode()
    # Keep the already published catalog's exact locked bytes when the authoritative
    # 210 formal names and three delivered sprite metadata records are equivalent.
    # This preserves release SHA and avoids a format-only publication cascade.
    published=ROOT/catalog_path
    if published.is_file() and json.loads(published.read_bytes())==json.loads(catalog_bytes):
        catalog_bytes=published.read_bytes()
    outputs[catalog_path]=catalog_bytes
    for name in ('actor.mjs','animation.mjs','assets.mjs'):
        code=(ROOT/SOURCE/name).read_text()
        if name=='animation.mjs':code=code.replace('../../hybrid-comparison/t2b3-v1/contract.mjs','./contract.mjs')
        if name=='assets.mjs':
            code=code.replace('maxPending=2}={}', "maxPending=2,usage='gm'}={}")
            code=code.replace("if(entry?.status!=='complete'","if(entry?.gmPreviewAllowed!==true||entry?.status!=='complete'")
            code=code.replace('development/equipment-2_5d/v1/characters/${id}/v1/character.webp','assets/gm-equipment-2_5d/v1/${id}.webp').replace("'../../../'+a.path","'../../'+a.path")
            code=code.replace("development/equipment-2_5d/weapons-v1/${id}/${layer==='body'?'attack-body':'weapon'}.webp","assets/gm-equipment-2_5d/v1/${id}-${layer==='body'?'attack-body':'weapon'}.webp")
        code=code.replace("if(entry?.gmPreviewAllowed!==true||entry?.status", "if((usage==='formal'?entry?.formalBattleAllowed!==true:entry?.gmPreviewAllowed!==true)||entry?.status")
        if name=='assets.mjs':
            code=code.replace("new URL('../../'+a.path,import.meta.url)","new URL('../../'+a.path+(usage==='formal'?'?sha='+a.sha256:''),import.meta.url)").replace("cache:'no-store'","cache:usage==='formal'?'force-cache':'no-store'")
        outputs[(RUNTIME/name).as_posix()]=code.encode()
    outputs[(RUNTIME/'contract.mjs').as_posix()]=(ROOT/'development/hybrid-comparison/t2b3-v1/contract.mjs').read_bytes()
    lock={'schema':'cw.gm.sprite-publication.v1','formalBattleEnabled':False,'ids':['g005','g007','g018'],'files':{p:{'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)} for p,b in sorted(outputs.items())}}
    outputs['development/equipment-2_5d/gm-publication.json']=(json.dumps(lock,indent=2)+'\n').encode()
    if '--check' in sys.argv:
        for p,b in outputs.items():
            actual=(ROOT/p).read_bytes()
            if p==(BASE/'catalog.json').as_posix():
                # Existing approved published catalog may differ in JSON key order.
                # Enforce all 210 formal values and all three asset records without
                # rewriting a live byte-locked catalog solely for serialization.
                assert json.loads(actual)==json.loads(b),p+' content stale'
            else:
                assert actual==b,p+' stale'
    else:
        for p,b in outputs.items():(ROOT/p).parent.mkdir(parents=True,exist_ok=True);(ROOT/p).write_bytes(b)
    print('GM export verified: 3 sprites, 210 identities, 4 reused runtime modules; formal battle disabled')
if __name__=='__main__':build()
