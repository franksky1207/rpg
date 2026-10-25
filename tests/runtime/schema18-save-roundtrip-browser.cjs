'use strict';
// Optional private fixture stays outside Git; the report contains no save values.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),{isDeepStrictEqual}=require('node:util'),{chromium}=require('playwright');
(async()=>{
 const raw=process.env.RPG_SAVE_FIXTURE?JSON.parse(fs.readFileSync(process.env.RPG_SAVE_FIXTURE,'utf8')):null;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
 try{
  const snapshots=[];const now=Date.now();
  for(const baseline of [true,false]){
   const page=await browser.newPage();
   if(baseline)for(const name of ['savemigration.js','savehookcore.js','combatlifecycle.js']){
    const source=cp.execFileSync('git',['show','ee1978ea2d9c60cad53a112250b1f5f214fc33ea:'+name],{encoding:'utf8'});
    await page.route('**/'+name+'?*',r=>r.fulfill({contentType:'text/javascript',body:source}));
   }
   await page.addInitScript(at=>{Date.now=()=>at;let seed=123456;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);},now);
   await page.goto((process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html')+'?production=1');
   await page.waitForFunction(()=>typeof ensureCivilizationScriptGroup==='function'&&typeof normalizeSaveState==='function');
   await page.evaluate(()=>ensureCivilizationScriptGroup('gm'));
   await page.waitForFunction(()=>typeof gmValidateImportedSave==='function');
   snapshots.push(await page.evaluate(async input=>{
    const clone=x=>JSON.parse(JSON.stringify(x)),s=input||newState();
    if(!input){s.inventory=[clone(s.equipment.weapon)];s.lostGear=[{id:'roundtrip',item:clone(s.equipment.armor),cost:100,lostAt:Date.now()}];}
    if(s.saveVersion!==18)throw Error('fixture must be Schema18');
    const normalized=migrateSave(clone(s),18,normalizeSaveState,clone(s));
    const repeated=migrateSave(clone(normalized),18,normalizeSaveState,clone(normalized));
    const imported=gmValidateImportedSave(clone(normalized));if(!imported.ok)throw Error(imported.error);
    state=clone(normalized);markSaveLoadResolved('roundtrip-test');
    if(!save(false))throw Error('local save failed');
    const persisted=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!load())throw Error('local reload failed');
    const loaded=clone(state);
    let stored=null;
    const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:stored,error:null})})}),upsert:row=>({select:()=>({single:async()=>{stored=clone(row);return {data:stored,error:null};}})})})};
    window.civilizationAuth={getClient:()=>db,getUser:()=>({id:'schema18-test-owner'})};window.confirm=()=>true;
    await civilizationCloudSave.upload();if(!stored?.save_data)throw Error('cloud upload failed');
    const uploaded=clone(stored.save_data);state=newState();await civilizationCloudSave.download();
    const downloaded=clone(state);
    return {normalized,repeated,imported:imported.save,persisted,loaded,uploaded,downloaded,roots:Object.keys(s).sort()};
   },raw));
   await page.close();
  }
  assert.equal(isDeepStrictEqual(snapshots[1],snapshots[0]),true,'all normalized, local, JSON and cloud fields must equal latest-main behavior');
  assert.equal(isDeepStrictEqual(snapshots[1].repeated,snapshots[1].normalized),true,'Schema18 normalization must be idempotent');
  console.log(JSON.stringify({passed:true,privateFixture:!!raw,schema:18,rootCount:snapshots[1].roots.length,baseline:'ee1978ea2d9c60cad53a112250b1f5f214fc33ea',fullFieldParity:true,idempotent:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
