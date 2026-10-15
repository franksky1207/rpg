'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
module.exports=function(root,files){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'development/equipment-2_5d/formal-publication.json')));
 assert.equal(lock.schema,'cw.formal.player-sprites.v1');assert.deepEqual(lock.ids,['g005','g007','g018']);assert.equal(lock.playerSpritesEnabled,true);assert.equal(lock.legacy3DEnabled,false);
 assert.deepEqual(Object.keys(lock.files),['3d-test/formal-player-sprites.js']);
 for(const [p,row] of Object.entries(lock.files)){assert.ok(files.includes(p));const b=fs.readFileSync(path.join(root,p));assert.equal(b.length,row.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),row.sha256);}
 const vm=require('node:vm'),w={};vm.runInNewContext(fs.readFileSync(path.join(root,'3d-test/formal-player-sprites.js'),'utf8'),{window:w});const release=w.CivilizationFormalPlayerSprites,gm=JSON.parse(fs.readFileSync(path.join(root,'assets/gm-equipment-2_5d/v1/catalog.json')));
 assert.equal(release.playerSpritesEnabled,true);assert.equal(release.legacy3DEnabled,false);assert.deepEqual(Array.from(release.ids),lock.ids);assert.equal(release.entries.length,3);assert.equal(release.sets.length,3);
 for(const e of release.entries){const source=gm.entries.find(r=>r.id===e.id);assert.ok(source);assert.equal(e.formalBattleAllowed,true);assert.equal(JSON.stringify({...e,formalBattleAllowed:undefined}),JSON.stringify(source));assert.equal(JSON.stringify(release.sets.find(r=>r.id===e.id)),JSON.stringify(gm.sets.find(r=>r.id===e.id)));}
 assert.match(fs.readFileSync(path.join(root,'3d-test/mode-foundation.js'),'utf8'),/FULL_3D_AVAILABLE=false/);
 assert.match(fs.readFileSync(path.join(root,'3d-test/t3b-formal-controller.js'),'utf8'),/FORMAL_B_RELEASED=false/);
 return Object.keys(lock.files);
};
