#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {glb,sha}=require('./asset-registry.cjs');
const root=path.resolve(__dirname,'..'),source='development/3d-source/characters/player-v1/player-foundation.blend';
const slots={weapon:'socket.weapon.R',helmet:'socket.helmet',armor:'socket.armor',shoes:'socket.shoes.L',accessory:'socket.accessory.back'};
const src=p=>({path:p,sha256:sha(fs.readFileSync(path.join(root,p)))});
const entry=(id,p,quality,type,license,sourcePath,dependencies)=>{
 const b=fs.readFileSync(path.join(root,p));
 const a={id,path:p,sha256:sha(b),bytes:b.length,type,quality,epochs:[1,2,3],scenes:type==='character'?['character-formal','gm-character']:['character-decoder'],lod:quality,
  source:src(sourcePath),license,dependencies,preload:false,fallback:'procedural-geometry'};
 if(type==='character'){
  const d=glb(b,id),bin=b.subarray(20+b.readUInt32LE(12)+8);a.metrics={triangles:d.meshes.reduce((s,m)=>s+m.primitives.reduce((s,p)=>s+d.accessors[p.indices].count/3,0),0),vertices:d.meshes.reduce((s,m)=>s+m.primitives.reduce((s,p)=>s+d.accessors[p.attributes.POSITION].count,0),0),joints:d.skins[0].joints.length,materials:d.materials.length,embeddedImages:d.images.length,textureDimensions:d.images.map(image=>{const v=d.bufferViews[image.bufferView],png=bin.subarray(v.byteOffset||0);if(image.mimeType!=='image/png'||png.toString('ascii',1,4)!=='PNG')throw Error('Expected embedded original PNG');return [png.readUInt32BE(16),png.readUInt32BE(20)];}),animations:d.animations.map(a=>a.name)};
 }
 return a;
};
const doc={schema:1,version:'player-foundation-v1-b27-art-r2',rigContract:'cw.humanoid.rig.v1',artStatus:'human-sci-fi-art-revision-awaiting-user-acceptance',
 coordinates:{unit:'metre',height:1.9,gltf:'right-handed +Y up +Z forward',source:'Blender +Z up -Y forward',scale:[1,1,1],rotation:'socket-local quaternion; equipment pivot matches socket origin'},slots,
 sourceRevision:{baseCommit:'993ec3823997281f3445888848cc25c7b56b244f',socketChanges:'none; same local transforms and 53-bone rig',hideRegions:['region.head','region.torso','region.legs','region.feet','region.back'],hidePolicy:'source masks only; equipment hiding deferred to batches 28-30'},
 player:Object.fromEntries(['low','medium','high'].map(q=>[q,'player.foundation.v1.'+q])),
 assets:[entry('babylon.gltf-loader.v7.54.3','vendor/babylonjs/7.54.3/babylonjs.loaders.min.js','shared','decoder','Apache-2.0','vendor/babylonjs/7.54.3/SOURCE.md',[]),
  ...['low','medium','high'].map(q=>entry('player.foundation.v1.'+q,'assets/3d/characters/player-v1/player-'+q+'.glb',q,'character','CC0-1.0; original anatomy, textile and face atlases',source,['babylon.gltf-loader.v7.54.3']))]};
fs.writeFileSync(path.join(root,'assets/3d/asset-registry.json'),JSON.stringify(doc,null,2)+'\n');
console.log('Updated registry from actual source and GLB bytes');
