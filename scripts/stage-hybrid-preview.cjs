#!/usr/bin/env node
"use strict";
// Stage only the still-used GM B renderer support files AFTER official release gates.
// Retired standalone A/B/C comparison pages are not a published entry.
// This intentionally does not modify the official resource-manifest or game runtime.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'.publish-stage3');
const prefix='development/hybrid-comparison/';
const manifest=JSON.parse(fs.readFileSync(path.join(root,prefix,'t2b3-v1/manifest.json'),'utf8'));
if(manifest.schema!=='cw.t2b3.assets'||manifest.publish!==false)throw Error('Unexpected preview manifest');
if(!fs.existsSync(path.join(dest,'.publish-candidate')))throw Error('Official validated release missing');
const safe=p=>typeof p==='string'&&!p.startsWith('/')&&!p.split('/').includes('..')&&!p.includes('\\')&&!p.includes('\0');
const copy=(p,expected)=>{
 if(!safe(p))throw Error('Unsafe preview path '+p);
 const src=path.join(root,p),out=path.join(dest,p);
 if(!fs.existsSync(src)||!fs.statSync(src).isFile()||fs.lstatSync(src).isSymbolicLink())throw Error('Missing/non-file preview dependency '+p);
 const bytes=fs.readFileSync(src),digest=crypto.createHash('sha256').update(bytes).digest('hex');
 if(expected&&(bytes.length!==expected.bytes||digest!==expected.sha256))throw Error('Preview asset SHA/size changed '+p);
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,bytes);
 return bytes.length;
};
const files=new Map();
const add=(p,expected)=>{if(!files.has(p))files.set(p,expected||null);};
// Exact B-only request closure from the batch-1 GM audit. Every selected file
// retains its original SHA/byte integrity gate in the immutable source manifest.
// Do not publish retired A/C art simply because it remains in that ledger.
const isBRequest=p=>{
 if(/^assets\/3d\/equipment\/ancient-ruins-v1\/(?:weapon|helmet|armor|shoes|accessory)-(?:low|medium|high)\.glb$/.test(p))return true;
 const prefix='development/hybrid-comparison/t2b2-v1/';
 if(!p.startsWith(prefix))return p==='development/hybrid-comparison/t2b3-v1/lighting/player-studio.hdr';
 const rel=p.slice(prefix.length);
 if(/^enemies\/(?:normal|elite|boss)\/atlases\/(?:atlas\.json|(?:idle|attack|hit|dodge|return|defeat)-enemy(?:-depth)?\.png)$/.test(rel))return true;
 if(/^repair-r1\/tiers\/(?:low|medium)\/(?:normal|elite|boss)\/(?:atlas\.json|(?:idle|attack|hit|dodge|return|defeat)-enemy(?:-depth)?\.png)$/.test(rel))return true;
 if(/^player\/(?:atlases\/atlas\.json|candidate-(?:low|medium|high)\.glb)$/.test(rel))return true;
 if(/^repair-r1\/cues\/(?:crit|counter|drain)-0[0-7]\.png$/.test(rel))return true;
 if(rel==='repair-r2/color-source-contract.json')return true;
 if(/^shared\/(?:background|midground|foreground|contact-shadow|impact-0[0-7])\.png$/.test(rel))return true;
 return false;
};
const selected=Object.entries(manifest.files).filter(([p])=>isBRequest(p));
if(selected.length!==174||Object.keys(manifest.files).length-selected.length!==374)
 throw Error('GM B-only art request inventory diverged from Batch 1 audit: '+selected.length);
for(const [p,record] of selected)add(p,record);
for(const [p,record] of Object.entries(manifest.vendor))add(p,record);
for(const p of ['playback.mjs','fixture-input.mjs','t2a-v1/owner-fixtures.json','t2a-v1/comparison-controls.json',
 't2b3-v1/manifest.json','t2b3-v1/icon.svg','t2b3-v1/renderer.mjs','t2b3-v1/assets.mjs','t2b3-v1/atlas.mjs','t2b3-v1/native.mjs','t2b3-v1/contract.mjs','t2b3-v1/vendor.mjs'])add(prefix+p);
for(const p of ['data.js','worldmaps-earth.js','engine.js','balance.js','alternateuniversedata.js','traits.js','combatmath.js','combatcore.js','combat-events.js','3d-test/appearance-snapshot.js','3d-test/formal-snapshots.js','assets/3d/asset-registry.json','development/3d-source/equipment/ancient-ruins-v1/rig-contract.json'])add(p);
for(const p of ['development/3d-source/equipment/ancient-ruins-v1/refinement-source-evolution.json','development/3d-source/equipment/ancient-ruins-v1/history/original-asset-registry.source.txt'])add(p);
let added=0,bytes=0;
for(const [p,record] of files){const out=path.join(dest,p);if(fs.existsSync(out)){if(record){const b=fs.readFileSync(out);if(b.length!==record.bytes||crypto.createHash('sha256').update(b).digest('hex')!==record.sha256)throw Error('Published common asset SHA mismatch '+p);}continue;}bytes+=copy(p,record);added++;}
for(const p of [prefix+'playback.mjs',prefix+'fixture-input.mjs',prefix+'t2b3-v1/renderer.mjs',prefix+'t2b3-v1/manifest.json'])if(!fs.existsSync(path.join(dest,p)))throw Error('Required GM B dependency missing '+p);
for(const p of [prefix+'index.html',prefix+'comparison.css',prefix+'comparison.mjs'])if(fs.existsSync(path.join(dest,p)))throw Error('Retired A/B/C comparison entry unexpectedly published '+p);
console.log(JSON.stringify({preview:'gm-b-renderer-dependencies',added,bytes,totalDeps:files.size,officialReleaseUnmodified:true}));
