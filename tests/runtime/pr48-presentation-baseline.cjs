'use strict';
// Exact reviewed presentation edits, applied to immutable latest-main sources.
// Historic guards still compare EVERY byte outside this explicit patch set.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const patch=require('./pr48-approved-presentation.json');
// PR #50, 2026-10-20: two exact reviewed post-seal updates. Keep the old
// baseline return value for historical invariants while rejecting all other edits.
const approvedFollowup=Object.freeze({
 '3d-test/t3b-formal-controller.js':'f95cfcae5bf1c50fb816ccfd607bf65f14435513',
 'index.html':'5b26acc48685a006c895c8c8c30bd6dba48440c0'
});
function original(p){
 if(Object.hasOwn(approvedFollowup,p)){
  const gitBlob=cp.execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();
  assert.equal(gitBlob,approvedFollowup[p],'unauthorized followup edit: '+p);
  // Controller remains subject to the older immutable-owner baseline;
  // index uses the pre-PR50 version for its legacy cache-token comparisons.
  if(p==='index.html')return cp.execFileSync('git',['show',patch.baseline+':'+p]);
  return cp.execFileSync('git',['show',patch.baseline+':'+p]);
 }
 const row=patch.files[p];if(!row)return fs.readFileSync(p);
 const before=cp.execFileSync('git',['show',patch.baseline+':'+p],{maxBuffer:8*1024*1024});
 assert.equal(crypto.createHash('sha256').update(before).digest('hex'),row.beforeSha256);
 const lines=before.toString().split('\n');for(const [start,end,text] of [...row.edits].reverse())lines.splice(start,end-start,...text);const expected=lines.join('\n');
 assert.equal(fs.readFileSync(p,'utf8'),expected,'source differs from exact approved PR48 presentation patch: '+p);
 return before;
}
module.exports={original};
