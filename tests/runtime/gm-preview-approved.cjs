'use strict';
// Exact GM-only authorization above the unchanged historical seals. Browser
// acceptance exercises live sources; this adapter reconstructs only old baselines.
const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const record=require('./gm-preview-approved.json');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(record.baseline,'98ff788b80610f1b750857eecc0eb83909d489a3');
assert.deepEqual(Object.keys(record.files).sort(),['3d-test/gm-era-sprites.mjs','3d-test/index.html','3d-test/test-center.css','3d-test/test-center.js','gm3dprototype.js','index.html']);
assert.deepEqual(Object.keys(record.newFiles),['3d-test/gm-preview-layout.mjs']);
function historicalBytes(path,bytes){
 const entry=record.files[path];if(!entry)return bytes;
 assert.equal(sha(bytes),entry.after,'unregistered GM preview edit: '+path);
 const before=cp.execFileSync('git',['show',record.baseline+':'+path],{maxBuffer:8*1024*1024});
 assert.equal(sha(before),entry.before,'GM preview baseline: '+path);return before;
}
function verify(){
 for(const path of Object.keys(record.files))historicalBytes(path,fs.readFileSync(path));
 for(const [path,digest] of Object.entries(record.newFiles))assert.equal(sha(fs.readFileSync(path)),digest,'unregistered GM preview adapter: '+path);
 return new Set(Object.keys(record.newFiles));
}
module.exports={historicalBytes,verify};
if(require.main===module){verify();console.log('PASS exact GM preview sources; historical gameplay, images and assertions remain sealed');}
