'use strict';
// Exact registration of this UI change, before the unchanged historical copy seals.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const record=require('./cloudsave-progression-approved.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function historicalBytes(p,bytes){
 const row=record.files[p];if(!row)return bytes;
 assert.equal(sha(bytes),row.after,'unregistered player-copy change (cloud-save summary): '+p);
 const before=cp.execFileSync('git',['show',record.baseline+':'+p],{maxBuffer:16*1024*1024});
 assert.equal(sha(before),row.before,'cloud-save baseline: '+p);
 return before;
}
module.exports={historicalBytes};
