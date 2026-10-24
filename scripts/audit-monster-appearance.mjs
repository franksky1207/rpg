import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {mappings} from '../3d-test/monster-sprites.mjs';
import {resolveMonsterAppearance,appearanceFingerprint} from '../3d-test/monster-appearance.mjs';
const context={window:{}};vm.runInNewContext(fs.readFileSync('monstercodexdata.js','utf8'),context);
const rows=context.window.MONSTER_CODEX_CATALOGUE.map(r=>({id:r.id,name:r.name,assetId:r.assetId,mode:r.mode,world:r.world,universeNumber:r.universeNumber,appearance:resolveMonsterAppearance(r),fingerprint:appearanceFingerprint(r)}));
assert.equal(rows.length,1705);const groups=Map.groupBy?Map.groupBy(rows,r=>r.fingerprint):rows.reduce((m,r)=>m.set(r.fingerprint,[...(m.get(r.fingerprint)||[]),r]),new Map());
const whitelist=[],illegal=[];
for(const group of groups.values())if(group.length>1){
 const au=group.length===5&&group.every(r=>r.mode==='alternate'&&r.universeNumber===group[0].universeNumber);
 const projection=group.length===2&&group.some(r=>r.id==='projection-'+group.find(x=>!x.id.startsWith('projection-'))?.id);
 (au||projection?whitelist:illegal).push({reason:au?'same-alternate-universe-five':projection?'higher-king-projection':'illegal',ids:group.map(r=>r.id)});
}
assert.deepEqual(illegal,[]);assert.equal(whitelist.filter(r=>r.reason==='same-alternate-universe-five').length,200);assert.equal(whitelist.filter(r=>r.reason==='higher-king-projection').length,10);
const summary={baseline:'658d5db2c14cd10598e648e2fafdfe3ad75f80dd',reviewSource:'20c7f286b32da7fc3533d34ed7561266f6969cc4',identities:rows.length,formalMappings:Object.keys(mappings).length,effectiveAppearances:groups.size,illegalDuplicates:illegal.length,
 colors:new Set(rows.map(r=>JSON.stringify(r.appearance.colors))).size,effectCombinations:new Set(rows.map(r=>JSON.stringify(r.appearance.effect.members.map(m=>m.id).sort()))).size,visualAcceptance:'user-approved-review-designs; engineering-integration-under-test',realIPhone:'not-tested'};
const out=process.argv[2]||'work/visual-integration/fingerprints.json';fs.mkdirSync(out.slice(0,out.lastIndexOf('/')),{recursive:true});fs.writeFileSync(out,JSON.stringify({summary,whitelist,rows},null,2)+'\n');console.log(summary);
