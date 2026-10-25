// Exact authorized integration layer above historical source locks. Behavioral
// tests still exercise LIVE code; this projection is only for historical seals.
const fs=require('fs'),cp=require('child_process'),crypto=require('crypto'),assert=require('node:assert/strict');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function original(p){const record=require('./monster-integrated-approved.json'),entry=record.files[p];let bytes=require('./postrelease-ui-copy-approval.cjs').historicalBytes(p,require('./gm-preview-approved.cjs').historicalBytes(p,fs.readFileSync(p)));
 const batch3=require('./optimization-batch3-approved.json'),performanceEdit=batch3.files[p];
 if(performanceEdit){assert.equal(sha(bytes),performanceEdit.after,'unregistered Batch3 cache edit: '+p);const old=cp.execFileSync('git',['show',batch3.baseline+':'+p]);assert.equal(sha(old),performanceEdit.before,'Batch3 source baseline: '+p);bytes=old;}
 // Only the four Batch2 cache tokens are projected before the unchanged exact HTML seal.
 if(p==='index.html')bytes=Buffer.from(bytes.toString().replace('savehookcore.js?v=20261025-optimization-batch2','savehookcore.js?v=20261005-code-cleanup-batch1-fix1').replace('combatlifecycle.js?v=20261025-optimization-batch2','combatlifecycle.js?v=20261023-foreground1').replace('cloudsave.js?v=20261025-optimization-batch2','cloudsave.js?v=20260924-save-hook-batch6').replace('mirrordungeonrun.js?v=20261025-optimization-batch2&previous=','mirrordungeonrun.js?v='));
 const batch2=require('./optimization-batch2-approved.json'),changed=batch2.files[p];
 if(changed){assert.equal(sha(bytes),changed.after,'unregistered Batch2 core edit: '+p);const old=cp.execFileSync('git',['show',batch2.baseline+':'+p]);assert.equal(sha(old),changed.before,'Batch2 source baseline: '+p);bytes=old;}
 if(!entry)return bytes;assert.equal(sha(bytes),entry.after,'unregistered integrated appearance edit: '+p);const old=cp.execFileSync('git',['show',record.baseline+':'+p],{maxBuffer:20*1024*1024});assert.equal(sha(old),entry.before,'integration source baseline: '+p);return old;}
function verify(){const record=require('./monster-integrated-approved.json');for(const p of Object.keys(record.files))original(p);for(const [p,h] of Object.entries(record.newFiles))assert.equal(sha(fs.readFileSync(p)),h,p);return record;}
module.exports={original,verify};
