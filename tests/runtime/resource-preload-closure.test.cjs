'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const manifest=JSON.parse(fs.readFileSync('resource-manifest.json','utf8'));
const sw=fs.readFileSync('resource-cache-sw.js','utf8');
// Compile the genuine preloader predicate and its exact declared sets. No manually
// copied rules: a future whitelist edit must be visible to this test.
const prefix=sw.slice(sw.indexOf('const APPEARANCE_MODULES='),sw.indexOf('let known='));
const sprites=sw.slice(sw.indexOf('const BATCH17_SPRITES='),sw.indexOf('const isFormalSprite='));
const predicate=sw.slice(sw.indexOf('function shouldPreload(p){'),sw.indexOf('async function preloadAssets(report){'));
assert(prefix.includes('APPEARANCE_MODULES')&&sprites.includes('BATCH18_SPRITES')&&predicate.includes('return false;'),'preload source boundaries changed');
const context=vm.createContext({});
const shouldPreload=vm.runInContext(prefix+'\n'+sprites+'\n'+predicate+'\nshouldPreload',context);
const files=Object.keys(manifest.files),selected=files.filter(shouldPreload);
const classify=p=>p.startsWith('assets/monsters/')?'monster':p.startsWith('assets/backgrounds/')?'background':p.startsWith('assets/era-player/')?'player':p.startsWith('audio/')?'audio':'appearance';
test('published manifest is valid and every declared path exists',()=>{
 assert.equal(manifest.schema,1);
 assert.equal(manifest.algorithm,'sha256-96');
 for(const p of files){
  assert(!p.includes('..')&&!p.startsWith('/'),'unsafe path: '+p);
  assert.match(manifest.files[p],/^[a-f0-9]{24}$/,'invalid digest: '+p);
  assert(fs.existsSync(p),'missing resource: '+p);
 }
});
test('background preload stays limited to approved gameplay closure',()=>{
 const expected={monster:39,background:32,player:6,audio:17,appearance:7};
 const counts={monster:0,background:0,player:0,audio:0,appearance:0};
 for(const p of selected)counts[classify(p)]++;
 assert.deepEqual(counts,expected);
 assert.equal(selected.length,101);
 assert(selected.every(p=>!p.endsWith('.glb')),'GM/old 3D GLB must not preload');
 assert(selected.every(p=>!p.includes('/gm-equipment-2_5d/')),'GM-only visuals must not preload');
});
test('approved painting dependency chain and formal appearances are retained',()=>{
 const v2=fs.readFileSync('3d-test/monster-body-v2.mjs','utf8');
 const appearance=fs.readFileSync('3d-test/monster-appearance.mjs','utf8');
 const manager=fs.readFileSync('3d-test/monster-appearance-manager.mjs','utf8');
 const codex=fs.readFileSync('monstercodeximage.mjs','utf8');
 const assetLoader=fs.readFileSync('3d-test/character-assets.js','utf8');
 assert.match(v2,/from ['"]\.\/monster-body-v1\.mjs/);
 assert.match(appearance,/from ['"]\.\/monster-body-v2\.mjs/);
 assert.match(appearance,/from ['"]\.\/monster-static-effects\.mjs/);
 assert.match(manager,/from ['"]\.\/monster-appearance\.mjs/);
 assert.match(codex,/from ['"]\.\/3d-test\/monster-appearance-manager\.mjs/);
 assert.match(assetLoader,/asset-registry\.json/);
 assert.match(assetLoader,/\.glb/);
});
