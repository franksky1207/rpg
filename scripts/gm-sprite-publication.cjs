'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
module.exports=function verify(root,files){
 const lock=JSON.parse(fs.readFileSync(path.join(root,'development/equipment-2_5d/gm-publication.json')));
 assert.equal(lock.schema,'cw.gm.sprite-publication.v1');assert.equal(lock.formalBattleEnabled,false);assert.deepEqual(lock.ids,['g005','g007','g018']);
 const expected=['assets/gm-equipment-2_5d/v1/catalog.json',...lock.ids.flatMap(id=>[`${id}.webp`,`${id}-attack-body.webp`,`${id}-weapon.webp`].map(n=>`assets/gm-equipment-2_5d/v1/${n}`)),...['actor','animation','assets','contract'].map(n=>`3d-test/equipment-sprites-v1/${n}.mjs`)].sort();
 assert.deepEqual(Object.keys(lock.files).sort(),expected,'Exact GM publication allowlist');
 assert.deepEqual(files.filter(p=>/^(?:assets\/gm-equipment-2_5d\/|3d-test\/equipment-sprites-v1\/)/.test(p)).sort(),expected,'Unapproved GM file');
 for(const p of expected){const data=fs.readFileSync(path.join(root,p));assert.equal(data.length,lock.files[p].bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),lock.files[p].sha256,p);}
 const manifest=JSON.parse(fs.readFileSync(path.join(root,expected.find(p=>p.endsWith('.json')))));
 assert.equal(manifest.formalBattleEnabled,false);assert.deepEqual(manifest.entries.map(e=>e.id).sort(),lock.ids);assert.equal(manifest.sets.length,210);
 for(const e of manifest.entries){assert.equal(e.gmPreviewAllowed,true);assert.equal(e.formalReleaseAllowed,false);assert.equal(e.weaponAnimation?.weaponAnimationStatus,'complete');assert.equal(e.weaponAnimation.id,e.id);assert.equal(e.weaponAnimation.template,'one-hand-blade');assert.ok(e.weaponAnimation.grip.length===2&&e.weaponAnimation.grip.every(x=>Number.isFinite(x)&&x>.1&&x<.9));for(const [k,n] of [['body','attack-body'],['weapon','weapon']]){const a=e.weaponAnimation[k];assert.equal(a.path,`assets/gm-equipment-2_5d/v1/${e.id}-${n}.webp`);assert.equal(a.sha256,lock.files[a.path].sha256);assert.equal(a.bytes,lock.files[a.path].bytes);assert.equal(a.width,512);assert.equal(a.height,512);}assert.equal(e.asset.path,`assets/gm-equipment-2_5d/v1/${e.id}.webp`);}
 return expected;
};
