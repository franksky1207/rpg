#!/usr/bin/env node
"use strict";
// Stage 3: create an isolated artifact, NEVER publish or alter game source.
const fs=require("node:fs"),path=require("node:path");
const policy=require("./publish-assets.cjs");
const root=path.resolve(__dirname,"..");
const dest=path.resolve(root,process.env.PUBLISH_STAGE_DIR||".publish-stage3");
if(path.dirname(dest)!==root||!/^\.publish-stage[\w-]*$/.test(path.basename(dest)))throw Error("Output must be a dedicated .publish-stage* directory directly under repository");
const plan=policy.inspect(root);
const files=plan.files,keep=plan.keep,tracks=plan.audio.files,backgrounds=plan.backgrounds;
if(plan.missing.length)throw Error("Missing dependencies: "+JSON.stringify(plan.missing));
if(fs.existsSync(dest)){
 if(fs.lstatSync(dest).isSymbolicLink())throw Error("Output must not be a symlink");
 let old;try{old=JSON.parse(fs.readFileSync(path.join(root,"publish-stage3-report.json"),"utf8"));}catch(_){}
 if(!fs.existsSync(path.join(dest,".publish-candidate"))&&old?.output!==path.basename(dest))throw Error("Refusing to replace unrecognized output directory");
 fs.rmSync(dest,{recursive:true,force:true});
}
fs.mkdirSync(dest,{recursive:true});
for(const p of keep){const out=path.join(dest,p);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(root,p),out);}

// Recompute fingerprints from the actual copied bytes, never reuse stale source hashes.
fs.writeFileSync(path.join(dest,".publish-candidate"),"Generated Stage 4 candidate; no deployment.\n");
fs.writeFileSync(path.join(dest,".nojekyll"),"");
const manifest=policy.manifest(dest,policy.walk(dest));
fs.writeFileSync(path.join(dest,"resource-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
const outputFiles=policy.walk(dest),scan=policy.references(dest,outputFiles),outputSet=new Set(outputFiles);
const missing=scan.refs.filter(r=>!outputSet.has(r.path));
const inventory=outputFiles.map(p=>({path:p,bytes:fs.statSync(path.join(dest,p)).size}));
const trackedBytes=plan.files.reduce((s,p)=>s+plan.sizes.get(p),0),artifactBytes=inventory.reduce((s,p)=>s+p.bytes,0);
const report={schema:2,stage:"dry-run",deploy:false,output:path.basename(dest),trackedCount:files.length,artifactCount:inventory.length,
 officialBackgrounds:backgrounds.length,officialMusic:plan.audio.music.length,officialSfxCategories:Object.keys(plan.audio.pools).length,
 officialSfxFiles:plan.audio.sfx.length,officialAudioFiles:tracks.length,officialAudio:plan.audio,
 trackedBytes,artifactBytes,savedBytes:trackedBytes-artifactBytes,excludedBytes:plan.excluded.reduce((s,p)=>s+p.bytes,0),excludedCount:plan.excluded.length,
 excluded:plan.excluded,retainedSourceReferences:plan.retained,missingDirectRefs:missing,referenceCount:scan.refs.length,
 fingerprintCount:Object.keys(manifest.files).length,inventory,registeredAssets:plan.registeredAssets,
 notes:["Actual output files measured after manifest regeneration, not a static estimate.","Git history and live Pages artifact are not measured by this report.","Dynamic concatenation is additionally exercised by Stage 4 browser validation."]};
fs.writeFileSync(path.join(root,"publish-stage3-report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({artifactMB:artifactBytes/1e6,savedMB:report.savedBytes/1e6,files:inventory.length,excluded:report.excludedCount,missingRefs:missing.length,music:report.officialMusic,sfxFiles:report.officialSfxFiles,backgrounds:report.officialBackgrounds},null,2));
if(missing.length){console.error(JSON.stringify(missing));process.exitCode=1;}
