'use strict';
// Exact reviewed presentation edits, applied to immutable latest-main sources.
// Historic guards still compare EVERY byte outside this explicit patch set.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const patch=require('./pr48-approved-presentation.json');
// PR #50, 2026-10-20: two exact reviewed post-seal updates. Keep the old
// baseline return value for historical invariants while rejecting all other edits.
const approvedFollowup=Object.freeze({
 '3d-test/t3b-formal-controller.js':'f95cfcae5bf1c50fb816ccfd607bf65f14435513',
 'index.html':'feca31e9a962a97e4e687df0f3e10a41c9430e52'
});
function original(p){
 if(Object.hasOwn(approvedFollowup,p)){
  // Batch13 authorizes exactly one GM cache-token replacement; every other byte stays locked.
  let bytes=fs.readFileSync(p);
  if(p==='index.html')bytes=Buffer.from(bytes.toString()
   .replace('gm3dprototype.js?v=20261021-batch16-dungeons2','gm3dprototype.js?v=20261021-batch16-dungeons1')
   .replace('t3b-formal-renderer.js?v=20261021-batch16-dungeons2','t3b-formal-renderer.js?v=20261021-batch16-dungeons1'));

  if(p==='3d-test/t3b-formal-controller.js')bytes=Buffer.from(bytes.toString()
   .replace('name:frame.actorNames.enemy,playerName:frame.actorNames.player,mode:','name:frame.actorNames.enemy,mode:'));
  if(p==='index.html')bytes=Buffer.from(bytes.toString()
   .replace('gm3dprototype.js?v=20261021-batch16-dungeons1','gm3dprototype.js?v=20261021-batch15-pair1')
   .replace('t3b-formal-renderer.js?v=20261021-batch16-dungeons1','t3b-formal-renderer.js?v=20261020-sprite-recovery2')
   .replace('t3b-formal-controller.js?v=20261021-batch16-dungeons1','t3b-formal-controller.js?v=20261020-recovery1'));

  const reviewed=p==='index.html'?bytes.toString()
   .replace('gm3dprototype.js?v=20261021-batch15-pair1','gm3dprototype.js?v=20261020-twenty-gm1')
   .replace('gm3dprototype.js?v=20261020-twenty-gm1','gm3dprototype.js?v=20261019-batch12-rising-cut1')
   .replace('&batch14=20261021-formal1','').replace('&batch14=20261021-map-monsters1','')
   // Batch15-1: exact reviewed cache-only renderer revision; preserve all other bytes.
   .replace('&batch15=20261021-monster-scale1','').replace('&batch15=20261021-pair1',''):bytes;
  const gitBlob=cp.execFileSync('git',['hash-object','--stdin'],{input:reviewed,encoding:'utf8'}).trim();
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
 const source=fs.readFileSync(p,'utf8');
 const reviewed=p==='3d-test/index.html'?source.replace('test-center.js?v=20261021-batch16-dungeons2','test-center.js?v=20261021-batch16-dungeons1').replace('test-center.js?v=20261021-batch16-dungeons1','test-center.js?v=20261021-batch15-pair1').replace('test-center.js?v=20261021-batch15-pair1','test-center.js?v=20261020-twenty-gm1').replace('test-center.js?v=20261020-twenty-gm1','test-center.js?v=20261019-batch12-rising-cut1'):source;
 assert.equal(reviewed,expected,'source differs from exact approved PR48 presentation patch: '+p);
 return before;
}
module.exports={original};
