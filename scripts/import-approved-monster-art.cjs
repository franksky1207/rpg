// Transfer fixed accepted specifications; no design/generation algorithms run here.
const fs=require('fs'),cp=require('child_process'),crypto=require('crypto'),zlib=require('zlib');
const SOURCE='20c7f286b32da7fc3533d34ed7561266f6969cc4',ROOT='development/monster-art/full-review/';
const read=p=>cp.execFileSync('git',['show',SOURCE+':'+p],{maxBuffer:20*1024*1024}),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const data=JSON.parse(read(ROOT+'manifest.json')),fx=JSON.parse(read(ROOT+'effects-manifest.json')),before=JSON.parse(read(ROOT+'effects-audit/frozen-before.json'));
const bodies={},effects={},references={source:SOURCE,bodyVersion:'approved-body-ab521304',effectVersion:fx.version,entries:{}};
const fields=(obj,keys)=>Object.fromEntries(keys.filter(k=>obj[k]!==undefined).map(k=>[k,obj[k]]));
for(const s of data.specs){bodies[s.id]=fields(s,['retained','original','groups','rules']);const f=fx.configs.find(c=>c.id===s.id);effects[s.id]=fields(f,['level','strength','members']);references.entries[s.id]={assetId:s.assetId,bodySha256:before.files['body/'+s.id+'.webp'],specSha256:sha(JSON.stringify(bodies[s.id])),effectSha256:sha(JSON.stringify(effects[s.id]))};}
const payload={source:SOURCE,bodyVersion:references.bodyVersion,effectVersion:fx.version,bodies,effects,effectHashes:Object.fromEntries(Object.entries(references.entries).map(([id,e])=>[id,e.effectSha256])),bodyHashes:Object.fromEntries(Object.entries(references.entries).map(([id,e])=>[id,e.bodySha256]))};
fs.writeFileSync('3d-test/monster-approved-art.mjs','// Fixed accepted data; generated only by lossless specification transfer.\nexport const approvedArt='+JSON.stringify(payload)+';\n');
const v1=read('3d-test/monster-art-samples.mjs').toString(),v2=read('3d-test/monster-art-samples-v2.mjs').toString();
fs.writeFileSync('3d-test/monster-body-v1.mjs','// Frozen painter from approved PR98; no palette allocation.\n'+v1.slice(v1.indexOf('function hsv(')));
fs.writeFileSync('3d-test/monster-body-v2.mjs',"// Frozen luma/material painter; specs are fixed, bodyOnly is always used.\nimport {paintArtSample} from './monster-body-v1.mjs?v=20261024-approved1';\nexport const BODY_VERSION='approved-body-ab521304';\n"+v2.slice(v2.indexOf('export function sourceHSV')));
let engine=read(ROOT+'static-effects.js').toString();engine=engine.slice(engine.indexOf("'use strict';"));engine=engine.slice(0,engine.indexOf('const api='));const first=engine.indexOf('function tagsFor('),last=engine.indexOf('function createCanvas(');engine=engine.slice(0,first)+engine.slice(last);engine=engine.slice(0,engine.indexOf('class EffectCache'));
fs.writeFileSync('3d-test/monster-static-effects.mjs','// Exact accepted painters/render; selector and review UI intentionally omitted.\n'+engine+'\nexport {VERSION,render,library,families};\n');
references.painters={v1:sha(v1.slice(v1.indexOf('function hsv('))),v2:sha(v2.slice(v2.indexOf('export function sourceHSV'))),effects:sha(fs.readFileSync('3d-test/monster-static-effects.mjs'))};
fs.writeFileSync('tests/runtime/monster-approved-reference.json',JSON.stringify(references,null,2)+'\n');
console.log('Transferred',Object.keys(bodies).length,'fixed specifications;',fs.statSync('3d-test/monster-approved-art.mjs').size,'bytes raw;',zlib.gzipSync(fs.readFileSync('3d-test/monster-approved-art.mjs')).length,'gzip bytes; no images');
