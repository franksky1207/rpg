'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=process.cwd(),verify=require('../../scripts/gm-sprite-publication.cjs');
const files=cp.execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean),paths=verify(root,files);
assert.throws(()=>verify(root,[...files,'assets/gm-equipment-2_5d/v1/unapproved.png']),/Unapproved/);
const original=fs.readFileSync,p='assets/gm-equipment-2_5d/v1/g007.webp';try{
 fs.readFileSync=function(file,...args){const bytes=original.call(fs,file,...args);if(file===root+'/'+p){const copy=Buffer.from(bytes);copy[10]^=255;return copy;}return bytes;};assert.throws(()=>verify(root,files));
}finally{fs.readFileSync=original;}
const plan=require('../../scripts/publish-assets.cjs').inspect(root);for(const p of paths)assert.ok(plan.keep.includes(p));
assert.equal(plan.missing.length,0);assert.equal(plan.keep.some(p=>p.startsWith('development/')),false);
assert.equal(plan.keep.some(p=>p.includes('gm-equipment')&&p.endsWith('.png')),false);
assert.equal(fs.readFileSync('3d-test/gm-whole-suit.mjs','utf8').includes('development/'),false);
console.log('PASS exact GM allowlist, corrupt bytes/extra source refused, 3 sprites only, zero development dependencies');
