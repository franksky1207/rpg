// Exact authorized integration layer above historical source locks. Behavioral
// tests still exercise LIVE code; this projection is only for historical seals.
const fs=require('fs'),cp=require('child_process'),crypto=require('crypto'),assert=require('node:assert/strict');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function original(p){const record=require('./monster-integrated-approved.json'),entry=record.files[p],bytes=fs.readFileSync(p);if(!entry)return bytes;assert.equal(sha(bytes),entry.after,'unregistered integrated appearance edit: '+p);const old=cp.execFileSync('git',['show',record.baseline+':'+p],{maxBuffer:20*1024*1024});assert.equal(sha(old),entry.before,'integration source baseline: '+p);return old;}
function verify(){const record=require('./monster-integrated-approved.json');for(const p of Object.keys(record.files))original(p);for(const [p,h] of Object.entries(record.newFiles))assert.equal(sha(fs.readFileSync(p)),h,p);return record;}
module.exports={original,verify};
