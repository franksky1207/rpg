'use strict';
// B2 retains its historical lock. B3 explicitly evolves the B1 page and the original death-event visual duration.
const fs=require('fs'),crypto=require('crypto'),cp=require('child_process'),assert=require('assert/strict');
const allowed=new Set(['development/hybrid-comparison/index.html','development/hybrid-comparison/comparison.css','development/hybrid-comparison/comparison.mjs','development/hybrid-comparison/playback.mjs']);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
module.exports=function verifySource(path,oldSHA){
 const current=sha(fs.readFileSync(path));if(current===oldSHA)return;
 assert.ok(allowed.has(path),'Protected non-B1 source changed '+path);const version=JSON.parse(fs.readFileSync('development/hybrid-comparison/t2b3-v1/source-evolution.json'));
 assert.equal(version.schema,'cw.t2b3.authorized-b1-evolution');assert.equal(version.baselineHEAD,'e094f4e8704a808c94551acd9226c2982c67c537');assert.deepEqual(Object.keys(version.files).sort(),[...allowed].sort());const row=version.files[path];assert.equal(row.beforeSHA256,oldSHA);assert.equal(sha(cp.execFileSync('git',['show',version.baselineHEAD+':'+path])),oldSHA,'Original B1 history lock');assert.equal(current,row.afterSHA256,'Exact B3 source version');
};
