'use strict';
// New release has its own exact identity and SHA gate; candidate permission is unchanged.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
module.exports=function(root,files){
 const read=p=>fs.readFileSync(path.join(root,p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 const manifest=JSON.parse(read('assets/era-player/v1/manifest.json'));
 assert.equal(manifest.schema,'cw.era-player-sprites.v1');assert.equal(manifest.version,'20261018-lightweight1');assert.deepEqual(manifest.higherDesign,{version:2,cape:false,rings:false,floatingBodies:0});
 const ids=['era-galaxy','era-universe','era-higher'];assert.deepEqual(manifest.entries.map(e=>e.id),ids);
 const expected=['assets/era-player/v1/manifest.json',...ids.flatMap(id=>[`assets/era-player/v1/${id}.webp`,`assets/era-player/v1/${id}-attack-atlas.webp`])];assert.deepEqual(files.filter(p=>p.startsWith('assets/era-player/')).sort(),expected.sort());
 for(const e of manifest.entries){assert.equal(e.releaseKind,'era-player-v1');assert.equal(e.singleLayer,true);assert.equal(e.status,'complete');assert.equal(e.formalBattleAllowed,true);assert.equal(e.formalReleaseAllowed,true);assert.equal(e.gmPreviewAllowed,true);assert.equal(e.gmTestStatus,'lightweight-accepted');assert.equal(e.facing,'right-3/4');assert.deepEqual(e.pivot,[.5,.9]);assert.equal(e.asset.path,`assets/era-player/v1/${e.id}.webp`);assert.equal(e.asset.width,512);assert.equal(e.asset.height,512);const b=read(e.asset.path);assert.equal(b.length,e.asset.bytes);assert.equal(hash(b),e.asset.sha256);assert.ok(e.asset.bytes<200000);assert.ok(e.asset.alphaBounds[0]>0&&e.asset.alphaBounds[1]>0&&e.asset.alphaBounds[2]<512&&e.asset.alphaBounds[3]<512);}
 for(const e of manifest.entries){const w=e.weaponAnimation;assert.equal(w.template,'short-rising-cut');assert.equal(w.weaponAnimationStatus,'complete');assert.deepEqual(w.atlas,{body:[0,0,256,256],arm:[256,0,256,256]});assert.equal(w.body.path,`assets/era-player/v1/${e.id}-attack-atlas.webp`);assert.equal(w.body.width,512);assert.equal(w.body.height,512);const b=read(w.body.path);assert.equal(b.length,w.body.bytes);assert.equal(hash(b),w.body.sha256);assert.ok(b.length<200000);assert.ok(w.joint.every(v=>v>0&&v<1));assert.ok(w.strike<-.5&&w.strike>-1.1);}
 // Require the compiled module to be exactly the same release, with source file
 // names omitted from runtime URLs (full provenance stays in the JSON manifest).
 const compiled=JSON.parse(read('3d-test/era-player-sprites.mjs').toString().match(/const data=(.*);\nfunction freeze/)[1]);const runtime=JSON.parse(JSON.stringify(manifest));for(const e of runtime.entries)delete e.source.file;assert.deepEqual(compiled,runtime);
 return expected;
};
