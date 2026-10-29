'use strict';
// Named, reversible UI/control edits only. Live browser and function tests never
// use this projection; every pre-existing historical source guard still runs.
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const record=require('./formal-stop-approved.json');
const baseline='215cb89207363b0ed16e08fae9b8532ee67390a3';
const paths=["3d-test/formal-player-sprites.css","battle-mobile-viewport.css","battlepipeline.js","calamityrun.js","calamityui.css","calamityui.js","combat-viewport-coordinator.js","combatlifecycle.js","dungeonarena.js","dungeonbounty.js","dungeonvoid.css","dungeonvoid.js","dungeonvoidui.js","index.html","mainminimalmode.css","mainminimalmode.js","secondworldcalamityminimalmode.js","secondworldcalamityrun.js","secondworldcalamityui.js","secondworldmainline.js","specialencounter.js","thirdworldarena.js","thirdworldarenaui.js","thirdworldrun.js","thirdworldui.css","thirdworldui.js","ui.js","worldmapui.js"];
const scopes=new Set(['readonly-viewport-primary-region','retire-legacy-minimal-entry-injector','retire-stop-layout-overrides','retire-unused-stop-style','calamity-stop-constructor','combat-stop-ui-constructor','compatibility-ui-stop-dispatch','exact-affected-asset-cache-token','higher-home-stop-entry','higher-stop-constructor','lifecycle-begin-notification','lifecycle-cancel-notification','lifecycle-finish-notification','owner-read-request-adapter','remove-per-mode-stop-dom-state','remove-special-css-reordering-and-style-common-control','shared-stop-render-dispatch-state','special-remove-bottom-stop','special-stop-before-animation','universe-home-stop-entry','void-owner-state-only','void-refresh-common-control','void-remove-duplicate-flag','void-remove-outer-stop','void-stop-after-combat-heading']);
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(record.baseline,baseline);assert.deepEqual(Object.keys(record.files).sort(),paths);
function historicalBytes(path,bytes){
 bytes=require("./era-copy-approved.cjs").historicalBytes(path,bytes);
 const row=record.files[path];if(!row)return bytes;
 const before=cp.execFileSync('git',['show',baseline+':'+path],{maxBuffer:16*1024*1024});
 assert.equal(sha(before),row.beforeSha256,'formal stop immutable baseline '+path);
 let expected=before.toString('utf8');
 for(const edit of row.edits){
  assert.ok(scopes.has(edit.scope),'unapproved stop scope '+edit.scope);
  assert.ok(edit.before.length&&edit.after!==edit.before,'exact named edit required '+path);
  assert.equal(expected.split(edit.before).length-1,1,'formal stop patch must match once '+path+' '+edit.scope);
  expected=expected.replace(edit.before,edit.after);
 }
 assert.equal(sha(expected),row.afterSha256,'formal stop exact patch registration '+path);
 assert.equal(sha(bytes),row.afterSha256,'unregistered formal stop source edit '+path);
 assert.equal(Buffer.from(bytes).toString('utf8'),expected,'only named stop substitutions allowed '+path);
 return before;
}
function verify(){for(const path of paths)historicalBytes(path,fs.readFileSync(path));return paths;}
module.exports={historicalBytes,verify};
if(require.main===module)console.log('PASS formal stop exact named authorization; all other bytes remain sealed:',verify().length);
