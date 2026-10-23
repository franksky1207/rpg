'use strict';
// Exercises the unchanged production cloud owner against an in-memory transport; no real account.
const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true}),p=await b.newPage();await p.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');await p.waitForFunction(()=>window.civilizationCloudSave&&window.gmValidateImportedSave);
const result=await p.evaluate(async()=>{
 state=newState();state.playerName='圖鑑契約測試';recordMonsterCodexEncounter({mode:'main',world:1,owner:'combatcore.js',location:'0:0'},monsterObj(0,0));const id='galaxy-map-001';let stored=null;
 const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:stored,error:null})})}),upsert:row=>({select:()=>({single:async()=>{stored=JSON.parse(JSON.stringify(row));return {data:stored,error:null};}})})})};
 window.civilizationAuth={getClient:()=>db,getUser:()=>({id:'batch20-in-memory-user'})};window.confirm=()=>true;
 await civilizationCloudSave.upload();const uploaded=stored?.save_data?.monsterCodex?.encountered?.includes(id)===true;
 const imported=gmValidateImportedSave(stored?.save_data);const importedOk=imported.ok&&imported.save.monsterCodex.encountered.includes(id);
 state=newState();await civilizationCloudSave.download();const downloaded=state.monsterCodex.encountered.includes(id);
 return {uploaded,importedOk,downloaded,transport:'in-memory; real account untested'};
});console.log(JSON.stringify(result));await b.close();assert.equal(result.uploaded,true);assert.equal(result.importedOk,true);assert.equal(result.downloaded,true);})();
