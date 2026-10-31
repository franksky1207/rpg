'use strict';
// Exact copy-only projection for historical seals; live acceptance uses current files.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const record=require('./player-copy-approved.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function historicalBytes(p,bytes){
 bytes=require("./cloudsave-progression-approved.cjs").historicalBytes(p,bytes);
 const row=record.files[p];if(!row)return bytes;
 assert.equal(sha(bytes),row.after,'unregistered player-copy change: '+p);
 const before=cp.execFileSync('git',['show',record.baseline+':'+p],{maxBuffer:16*1024*1024});
 assert.equal(sha(before),row.before,'player-copy baseline: '+p);
 let expected=before.toString('utf8');
 for(const edit of record.edits.filter(e=>e.file===p)){
  assert.equal(expected.split(edit.before).length-1,edit.count,'exact copy substitution count: '+p);
  expected=expected.split(edit.before).join(edit.after);
 }
 assert.equal(expected,Buffer.from(bytes).toString('utf8'),'only enumerated copy substitutions allowed: '+p);
 return before;
}
module.exports={historicalBytes};
