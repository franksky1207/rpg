'use strict';
// Dependency evidence supplements browser gates; lexical references never authorize deletion.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),policy=require('./publish-assets.cjs'),plan=policy.inspect(root);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const formal=new Set(plan.references.filter(r=>r.from==='index.html').map(r=>r.path));
const modules=plan.keep.filter(p=>p.startsWith('3d-test/')&&/\.(?:m?js|css)$/.test(p)).map(p=>({path:p,sha256:sha(p),bytes:plan.sizes.get(p),classification:formal.has(p)?'formal-entry-or-shared':p.includes('equipment-sprites-v1/')?'shared-2.5d-lazy':'gm-or-legacy-lazy',consumers:[...new Set(plan.references.filter(r=>r.path===p).map(r=>r.from))].sort()}));
// The old atlas-review user entry was removed from GM in batch 2-2.
// It is still tracked and published until batch 2-3 confirms all dependencies.
// Never silently accept any other unclassified runtime module.
const pending23=['3d-test/atlas-review.js'];
const unclassified=modules.filter(r=>r.consumers.length===0).map(r=>r.path).sort();
assert.deepEqual(unclassified,pending23.filter(p=>plan.keep.includes(p)).sort(),
  'Unexpected unclassified published modules; investigate before removing sources');

const entry=read('3d-test/t3b-formal-entry.js');
assert.ok(entry.includes('if(context.wholeSuit===true)return;'));
assert.ok(entry.indexOf('if(context.wholeSuit===true)return;')<entry.indexOf('ensure?.("engine")'));
assert.ok(read('3d-test/mode-foundation.js').includes('const FULL_3D_AVAILABLE=false'));
assert.ok(read('3d-test/t3b-formal-controller.js').includes('const FORMAL_B_RELEASED=false'));
const retired=['3d-test/formal-home.js','3d-test/formal-dom.js','3d-test/preview-expand.css'];
for(const p of retired){assert.ok(!fs.existsSync(path.join(root,p)));assert.ok(!plan.keep.includes(p));assert.ok(!plan.references.some(r=>r.path===p));}
const sources=plan.files.filter(p=>/\.(?:blend[12]?|py)$/.test(p)&&p.startsWith('development/3d-source/'));
assert.ok(sources.some(p=>p.endsWith('ancient-ruins.blend')),'Keep original G007 Blender');
assert.ok(sources.every(p=>!plan.keep.includes(p)),'Never publish Blender/build tools');
const registry=JSON.parse(read('assets/3d/asset-registry.json'));
const glbs=registry.assets.filter(a=>a.path.includes('equipment/ancient-ruins-v1/')&&a.path.endsWith('.glb'));
assert.equal(glbs.length,15,'G007 five slots x three LOD retained');
for(const a of glbs){assert.equal(sha(a.path),a.sha256);assert.equal(plan.sizes.get(a.path),a.bytes);assert.ok(plan.keep.includes(a.path));assert.ok(a.license?.trim());assert.equal(a.preload,false);}
const factories=[...read('3d-test/prototype-engine.js').matchAll(/function (create\w+Scene)\(/g)].map(m=>({name:m[1],consumers:plan.keep.filter(p=>p!=='3d-test/prototype-engine.js'&&/\.(?:m?js|html)$/.test(p)&&read(p).includes(m[1]))}));
assert.ok(factories.every(f=>f.consumers.length),'Investigate orphan factory instead of silently publishing');
assert.equal(plan.missing.length,0);
const report={schema:'cw.equipment.phase6.dependencies.v1',baselineMain:'987767dc3d443d6b1f1dc1b359cf2a086100456c',modules,factories,g007:glbs.map(a=>({path:a.path,sha256:a.sha256,bytes:a.bytes,license:a.license})),preservedSourceTools:sources,retired,removedThisBatch:[],release:{selectedFiles:plan.keep.length,selectedBytes:plan.keep.reduce((n,p)=>n+plan.sizes.get(p),0),backgrounds:plan.backgrounds.length,music:plan.audio.music.length,sfx:plan.audio.sfx.length,missing:plan.missing},limitations:['Lexical consumers prove a reason to retain, not actual runtime execution or absence of dynamic consumers.','Controlled B3 preview is staged separately after official release audit; it is not an unrestricted development directory publication.','Browser request assertions and original GM/G007 tests are required alongside this audit.']};
console.log(JSON.stringify(report,null,2));
