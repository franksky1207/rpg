'use strict';
// Exact Batch19-4 source registration for historical presentation-only guards.
// Every registered live byte and pre-change main byte is SHA256 locked. This is
// NOT a wildcard exception: future edits must update evidence and registration.
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const lock=require('./foreground-approved-runtime.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function original(p,encoding){
 const actual=fs.readFileSync(p),row=lock.files[p];if(!row)return encoding?actual.toString(encoding):actual;
 assert.equal(sha(actual),row.afterSha256,'unregistered foreground runtime edit: '+p);
 const before=cp.execFileSync('git',['show',lock.baseline+':'+p],{maxBuffer:8*1024*1024});
 assert.equal(sha(before),row.beforeSha256,'foreground main baseline digest: '+p);
 if(p==='combatcore.js')assert.equal(actual.toString().split('window.COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1;')[0],before.toString().split('window.COMBAT_FULL_HP_LOCK_START_NORMALIZATION_VERSION=1;')[0],'entire combat kernel stays byte-exact; only settlement wrapper changes');
 return encoding?before.toString(encoding):before;
}
function verifyAll(){for(const p of Object.keys(lock.files))original(p);return Object.keys(lock.files);}
module.exports={original,verifyAll};
if(require.main===module)console.log('PASS exact Batch19-4 runtime registration and unchanged damage kernel',verifyAll().length);
