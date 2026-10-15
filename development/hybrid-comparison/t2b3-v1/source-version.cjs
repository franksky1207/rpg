'use strict';
// B2 retains its historical lock. B3 explicitly evolves the B1 page and the original death-event visual duration.
const fs=require('fs'),crypto=require('crypto'),cp=require('child_process'),assert=require('assert/strict');
const allowed=new Set(['development/hybrid-comparison/index.html','development/hybrid-comparison/comparison.css','development/hybrid-comparison/comparison.mjs','development/hybrid-comparison/playback.mjs']);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
module.exports=function verifySource(path,oldSHA,history=false,phase5History=false,weaponHistory=false){
 const weapon='development/equipment-2_5d/weapon-source-evolution.json';
 if(!weaponHistory&&fs.existsSync(weapon)){
  const ledger=JSON.parse(fs.readFileSync(weapon)),row=ledger.files[path];
  if(row){
   assert.equal(ledger.schema,'cw.phase5.weapon-integration.v1');assert.equal(ledger.baselineHEAD,'d247d7bca45b0ee0334a6c48ca4d8f6247c86744');
   assert.deepEqual(Object.keys(ledger.files).sort(),['index.html','3d-test/index.html','3d-test/test-center.js','gm3dprototype.js','3d-test/gm-battle-simulation.js','development/hybrid-comparison/comparison.mjs','development/hybrid-comparison/index.html'].sort());
   const before=cp.execFileSync('git',['show',ledger.baselineHEAD+':'+path]);assert.equal(sha(before),row.beforeSHA256);
   const read=fs.readFileSync,current=read(path);
   try{fs.readFileSync=function(file,...args){return file===path?(args[0]==='utf8'?before.toString():before):read.call(fs,file,...args);};verifySource(path,oldSHA,history,phase5History,true);}finally{fs.readFileSync=read;}
   assert.equal(sha(current),row.afterSHA256,'Only authorized GM cache-bust changes / exact weapon integration');return;
  }
 }
 const phase5='development/equipment-2_5d/formal-source-evolution.json';
 if(!phase5History&&fs.existsSync(phase5)){
  const ledger=JSON.parse(fs.readFileSync(phase5)),row=ledger.files[path];
  if(row){
   assert.equal(ledger.schema,'cw.phase5.authorized-formal-player.v1');
   assert.equal(ledger.baselineHEAD,'fbe46d9004eb38afbac55b8de03f832237ca56df');
   assert.deepEqual(Object.keys(ledger.files).sort(),['3d-test/appearance-snapshot.js','combat-events.js','3d-test/index.html','3d-test/test-center.js','index.html','combatfx.js','scripts/publish-assets.cjs','scripts/hybrid-comparison-fixtures.cjs','development/hybrid-comparison/fixture-input.mjs','development/hybrid-comparison/comparison.mjs','development/hybrid-comparison/index.html','development/hybrid-comparison/playback.mjs','gm3dprototype.js','3d-test/gm-battle-simulation.js'].sort());
   const before=cp.execFileSync('git',['show',ledger.baselineHEAD+':'+path]);assert.equal(sha(before),row.beforeSHA256);
   const read=fs.readFileSync,current=read(path);
   try{fs.readFileSync=function(file,...args){return file===path?(args[0]==='utf8'?before.toString():before):read.call(fs,file,...args);};verifySource(path,oldSHA,history,true,true);}finally{fs.readFileSync=read;}
   assert.equal(sha(current),row.afterSHA256,'Only authorized GM cache-bust changes / exact phase5 formal integration');return;
  }
 }

 const phase4='development/equipment-2_5d/gm-source-evolution.json';
 if(!history&&fs.existsSync(phase4)){
  const ledger=JSON.parse(fs.readFileSync(phase4)),row=ledger.files[path];
  if(row){
   assert.equal(ledger.schema,'cw.phase4.authorized-gm-integration.v1');
   assert.equal(ledger.baselineHEAD,'b4dc54c0d6a28cc033a20d8a51812c1081f674e2');
   assert.deepEqual(Object.keys(ledger.files).sort(),['3d-test/index.html','3d-test/test-center.js','gm3dprototype.js','index.html','scripts/publish-assets.cjs'].sort());
   const before=cp.execFileSync('git',['show',ledger.baselineHEAD+':'+path]);assert.equal(sha(before),row.beforeSHA256);
   const read=fs.readFileSync,current=read(path);
   try{fs.readFileSync=function(file,...args){return file===path?(args[0]==='utf8'?before.toString():before):read.call(fs,file,...args);};verifySource(path,oldSHA,true,true,true);}finally{fs.readFileSync=read;}
   assert.equal(sha(current),row.afterSHA256,'Only authorized GM cache-bust changes / exact phase4 integration');return;
  }
 }

 if(path==='scripts/hybrid-comparison-fixtures.cjs'){
  const row=JSON.parse(fs.readFileSync('development/3d-source/equipment/ancient-ruins-v1/fixture-producer-evolution.json'));
  assert.equal(row.schema,'cw.batch28.authorized-fixture-history-reader.v1');assert.equal(row.path,path);
  assert.equal(row.baselineHEAD,'ff91116c655fbec22047d01e61e3554fa47451e9');assert.equal(row.beforeSHA256,oldSHA);
  assert.equal(sha(fs.readFileSync(row.archive)),oldSHA);assert.equal(sha(cp.execFileSync('git',['show',row.baselineHEAD+':'+path])),oldSHA);
  assert.equal(sha(fs.readFileSync(path)),row.afterSHA256);return;
 }
 if(path==='development/hybrid-comparison/fixture-input.mjs'){
  const row=JSON.parse(fs.readFileSync('development/3d-source/equipment/ancient-ruins-v1/fixture-adapter-evolution.json'));
  assert.equal(row.schema,'cw.batch28.authorized-visual-adapter.v1');assert.equal(row.path,path);
  assert.equal(row.baselineHEAD,'ff91116c655fbec22047d01e61e3554fa47451e9');
  assert.equal(row.beforeSHA256,oldSHA);assert.equal(sha(fs.readFileSync(row.archive)),oldSHA);
  assert.equal(sha(cp.execFileSync('git',['show',row.baselineHEAD+':'+path])),oldSHA);
  assert.equal(sha(fs.readFileSync(path)),row.afterSHA256);
  assert.equal(JSON.parse(fs.readFileSync('development/hybrid-comparison/t2a-v1/owner-fixtures.json')).sha256,row.fixtureSHA256);
  return;
 }
 const refinementPath='development/3d-source/equipment/ancient-ruins-v1/refinement-source-evolution.json';
 if(fs.existsSync(refinementPath)){
  const version=JSON.parse(fs.readFileSync(refinementPath)),row=version.files[path];
  if(row){
   assert.equal(version.schema,'cw.batch28.authorized-g007-refinement.v1');
   assert.equal(Object.keys(version.files).length,17);
   assert.ok(path==='assets/3d/asset-registry.json'||path==='development/3d-source/equipment/ancient-ruins-v1/ancient-ruins.blend'||/^assets\/3d\/equipment\/ancient-ruins-v1\/(weapon|helmet|armor|shoes|accessory)-(low|medium|high)\.glb$/.test(path),'Only the exact G007 refinement scope');
   assert.equal(version.baselineHEAD,'ff91116c655fbec22047d01e61e3554fa47451e9');
   assert.equal(row.beforeSHA256,oldSHA);
   assert.equal(sha(cp.execFileSync('git',['show',version.baselineHEAD+':'+path],{maxBuffer:32e6})),oldSHA,'Original G007 baseline');
   assert.equal(sha(cp.execFileSync('tar',['-xOf',row.archive,path],{maxBuffer:32e6})),oldSHA,'Archived exact original G007');
   assert.equal(sha(fs.readFileSync(path)),row.afterSHA256,'Exact refined G007 version');return;
  }
 }
 const archiveRoot='development/retired-formal-previews/20261013/';
 const retirement=JSON.parse(fs.readFileSync(archiveRoot+'source-evolution.json'));
 if(Object.prototype.hasOwnProperty.call(retirement.files,path)){
  assert.equal(retirement.schema,'cw.t4.authorized-preview-retirement.v1');
  const row=retirement.files[path];assert.ok(row);
  assert.equal(sha(fs.readFileSync(row.archive)),row.beforeSHA256,'Retired exact source preserved');
  assert.equal(sha(cp.execFileSync('git',['show',retirement.baselineHEAD+':'+path])),row.beforeSHA256,'Retirement baseline exact source');
  assert.equal(sha(cp.execFileSync('git',['show','10ef9222427050eadf42b8f61b4d153da7b049b6:'+path])),oldSHA,'Original B2 history lock');
  if(row.afterSHA256===null)assert.ok(!fs.existsSync(path),'Retired controller cannot return to formal root');
  else if(path==='3d-test/test-center.js'||path==='3d-test/index.html'){
   // Keep the T4 lock intact. This task only changes the GM import query.
   const previous=cp.execFileSync('git',['show','ff91116c655fbec22047d01e61e3554fa47451e9:'+path]);
   assert.equal(sha(previous),row.afterSHA256,'Exact pre-refinement GM source');
   const script=path.endsWith('.html')?'test-center.js':'gm-battle-simulation.js';
   const from=script+'?v=20261013-gm-b1',to=script+'?v=20261014-b28-hp-visual1';
   assert.equal(previous.toString().split(from).length,2,'One GM cache version only');
   assert.equal(fs.readFileSync(path,'utf8'),previous.toString().replace(from,to),'Only authorized GM cache-bust changes');
  }else assert.equal(sha(fs.readFileSync(path)),row.afterSHA256,'Exact authorized T4 source');
  return;
 }
 const current=sha(fs.readFileSync(path));if(current===oldSHA)return;
 assert.ok(allowed.has(path),'Protected non-B1 source changed '+path);const version=JSON.parse(fs.readFileSync('development/hybrid-comparison/t2b3-v1/source-evolution.json'));
 assert.equal(version.schema,'cw.t2b3.authorized-b1-evolution');assert.equal(version.baselineHEAD,'e094f4e8704a808c94551acd9226c2982c67c537');assert.deepEqual(Object.keys(version.files).sort(),[...allowed].sort());const row=version.files[path];assert.equal(row.beforeSHA256,oldSHA);assert.equal(sha(cp.execFileSync('git',['show',version.baselineHEAD+':'+path])),oldSHA,'Original B1 history lock');assert.equal(current,row.afterSHA256,'Exact B3 source version');
};
