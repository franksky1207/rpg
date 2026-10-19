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
 assert.equal(fs.readFileSync(p,'utf8'),expected,'source differs from exact approved PR48 presentation patch: '+p);
 return before;
}
module.exports={original};
