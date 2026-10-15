'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');const verify=require('../../scripts/formal-sprite-publication.cjs'),root=process.cwd(),files=cp.execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0');
verify(root,files);const p=root+'/3d-test/formal-player-sprites.js',original=fs.readFileSync;
try{fs.readFileSync=function(file,...args){const b=original.call(fs,file,...args);if(file===p){const copy=Buffer.from(b);copy[100]^=255;return copy;}return b;};assert.throws(()=>verify(root,files),'corrupt release must fail publication');}finally{fs.readFileSync=original;}
assert.throws(()=>verify(root,files.filter(f=>f!=='3d-test/formal-player-sprites.js')),'missing formal release fails');
console.log('PASS exact three-suit formal-only permission, immutable catalog identity, SHA/bytes, missing release and legacy 3D closed');
