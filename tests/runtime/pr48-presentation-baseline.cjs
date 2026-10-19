'use strict';
// Exact reviewed presentation edits, applied to immutable latest-main sources.
// Historic guards still compare EVERY byte outside this explicit patch set.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const patch=require('./pr48-approved-presentation.json');
function original(p){
 const row=patch.files[p];if(!row)return fs.readFileSync(p);
 const before=cp.execFileSync('git',['show',patch.baseline+':'+p],{maxBuffer:8*1024*1024});
 assert.equal(crypto.createHash('sha256').update(before).digest('hex'),row.beforeSha256);
 const lines=before.toString().split('\n');for(const [start,end,text] of [...row.edits].reverse())lines.splice(start,end-start,...text);const expected=lines.join('\n');
 let approved=expected;
 if(p==='index.html'){
  const amendments=[
   ['combatsettlementpolish.css?v=20260914-maintenance1','combatsettlementpolish.css?v=20261020-combat-glass1'],
   ['3d-test/t3b-formal-renderer.js?v=20261019-batch12-rising-cut1','3d-test/t3b-formal-renderer.js?v=20261020-sprite-repair1']
  ];
  for(const [oldValue,newValue] of amendments){
   assert.equal(approved.split(oldValue).length,2,'approved PR49 cache version anchor must be unique');
   approved=approved.replace(oldValue,newValue);
  }
 }
 assert.equal(fs.readFileSync(p,'utf8'),approved,'source differs from exact approved PR48 + PR49 presentation patches: '+p);
 return before;
}
module.exports={original};
