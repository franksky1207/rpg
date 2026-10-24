'use strict';
// Compose this authorized presentation revision above sealed historical source locks.
// Any other byte fails closed. Gameplay owners and original assertions stay intact.
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
function original(p,encoding){
 const record=require('./monster-appearance-approved.json'),entry=record.files[p];let bytes=fs.readFileSync(p);
 if(entry){const digest=b=>crypto.createHash('sha256').update(b).digest('hex');assert.equal(digest(bytes),entry.afterSha256,'unregistered appearance edit: '+p);const old=cp.execFileSync('git',['show',record.baseline+':'+p],{maxBuffer:16*1024*1024});assert.equal(digest(old),entry.beforeSha256,'appearance baseline: '+p);bytes=old;}
 return encoding?bytes.toString(encoding):bytes;
}
function verifyNew(){
 const entries=require('./monster-appearance-approved.json').newFiles;
 assert.deepEqual(Object.keys(entries).sort(),['3d-test/monster-appearance-designs.mjs','3d-test/monster-appearance-review.html','3d-test/monster-appearance-review.mjs','3d-test/monster-appearance.mjs','3d-test/monster-art-samples-review.mjs','3d-test/monster-art-samples.html','3d-test/monster-art-samples.mjs']);
 for(const [p,sha] of Object.entries(entries))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),sha,'unregistered new appearance source: '+p);
 return new Set(Object.keys(entries));
}
module.exports={original,verifyNew};
