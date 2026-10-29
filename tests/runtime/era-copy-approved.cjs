'use strict';
// Exact copy-only revision projected solely for sealed historical assertions.
// Behavior and copy acceptance tests run against live files.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const record=require('./era-copy-approved.json');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function historicalBytes(p,bytes){
 const row=record.files[p];if(!row)return bytes;
 assert.equal(sha(bytes),row.after,'unregistered era copy edit: '+p);
 const before=cp.execFileSync('git',['show',record.baseline+':'+p],{maxBuffer:16*1024*1024});
 assert.equal(sha(before),row.before,'era copy baseline: '+p);
 return before;
}
module.exports={historicalBytes};
