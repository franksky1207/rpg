import assert from 'node:assert/strict';
import {mappings} from '../../3d-test/monster-sprites.mjs';
import {resolveFormalMonster} from '../../3d-test/monster-formal-resolver.mjs';

// Real approved identities, not arbitrary name-based fallback.
let tested=0;
for(const row of Object.values(mappings)){
 let world,location,id=null;
 if(row.mode==='main'&&row.world==='galaxy'){
  world=1;location=String(((row.region-1)*10+(row.mapIndex-1)))+':'+String(row.slot-1);
 }else if(row.mode==='main'&&row.world==='universe'){
  world=2;id=row.id;location=String(Number(row.id.slice(-3))-1);
 }else if(row.mode==='main'&&row.world==='higher'){
  world=3;id=row.id;location=String(row.bossIndex);
 }else if(row.mode==='calamity'&&['galaxy','universe'].includes(row.world)){
  world=row.world==='galaxy'?1:2;id=row.bossId;location=row.bossId;
 }else continue;
 const query={world,mode:row.mode,kind:row.kind,name:row.name,location,id};
 const normal=resolveFormalMonster(query);
 assert.ok(normal,'approved historical owner identity must be resolvable: '+row.id);
 const historical=resolveFormalMonster({...query,mode:'review'});
 assert.ok(historical,'review must have approved monster sprite: '+row.id);
 assert.equal(historical.mapping.id,normal.mapping.id,'review must reuse the exact original identity: '+row.id);
 assert.equal(historical.asset.assetId,normal.asset.assetId,'review must reuse original image: '+row.id);
 assert.equal(resolveFormalMonster({...query,mode:'review',name:row.name+'（錯誤）'}),null,'reject guessed/altered names');
 if(id!==null)assert.equal(resolveFormalMonster({...query,mode:'review',id:id+'-invalid'}),null,'reject altered owner ids');
 tested++;
}
assert.ok(tested>=630,'cover all 500 galaxy maps, 100 universe bosses, 10 higher bosses and 20 calamities; got '+tested);
assert.equal(resolveFormalMonster({world:3,mode:'review',kind:'civilization-calamity',name:'invalid',location:'0'}),null);
console.log('PASS review monster identities: '+tested+' exact approved map/boss/calamity mappings, no fuzzy fallback');
