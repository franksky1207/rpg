'use strict';
// A precise live -> main projection for historical source seals only. Runtime
// and reward tests always load live files. Historical baselines remain intact.
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function historicalBytes(path,bytes){
 const lock=require('./issue106-approved-sources.json'),row=lock.files[path];
 if(!row)return bytes;
 assert.equal(lock.baseline,'314fe6814ea17e3ff2cd8deafe25ef6943204513');
 // Batch 1-3 combat UI: only approved asset URL cache tokens may be
 // projected away for historical source seals; live HTML remains untouched.
 if(path==='index.html'){
  let source=bytes.toString('utf8');
  for(const [token,count] of [['&combatUiB1=20261026',5],['&combatUiB2=20261026',9],['&combatUiB3=20261026',3]]){
   assert.equal(source.split(token).length-1,count,'combat UI approved cache token count: '+token);
   source=source.split(token).join('');
  }
  assert.doesNotMatch(source,/combatUiB[123]=20261026/,'unregistered combat UI cache tokens');
  bytes=Buffer.from(source);
 }
 assert.equal(digest(bytes),row.after,'unregistered Issue106 source edit: '+path);
 const before=cp.execFileSync('git',['show',lock.baseline+':'+path],{maxBuffer:16*1024*1024});
 assert.equal(digest(before),row.before,'Issue106 main baseline digest: '+path);
 if(path==='combatcore.js')assert.equal(bytes.toString().split('window.COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1;')[0],before.toString().split('window.COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1;')[0],'Issue106 must preserve the full damage kernel');
 return before;
}
function verify(){
 const lock=require('./issue106-approved-sources.json');
 for(const path of Object.keys(lock.files))historicalBytes(path,fs.readFileSync(path));
 for(const root of ['savemigration.js','offlinestatecore.js','reincarnationstate.js','breakthroughcore.js','thirdworldcombat.js','thirdworldloot.js']){
  const baseline=cp.execFileSync('git',['show',lock.baseline+':'+root],{maxBuffer:16*1024*1024});
  assert.equal(digest(fs.readFileSync(root)),digest(baseline),'Schema, migration, milestones and high-dimensional economy sealed: '+root);
 }
 return Object.keys(lock.files).length;
}
module.exports={historicalBytes,verify};
if(require.main===module)console.log('PASS Issue106 exact-source registration; damage/save/high-dimensional owners remain sealed:',verify());
