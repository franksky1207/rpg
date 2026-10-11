#!/usr/bin/env node
"use strict";
// Stage 3: create an isolated artifact, NEVER publish or alter game source.
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const dest=path.resolve(root,process.env.PUBLISH_STAGE_DIR||".publish-stage3");
if(dest===root||!dest.startsWith(root+path.sep))throw Error("Output must be a subdirectory of repository");
const tracked=cp.execFileSync("git",["ls-files","-z"],{cwd:root,encoding:"utf8"}).split("\0").filter(Boolean);
const files=tracked.filter(p=>fs.existsSync(path.join(root,p))&&fs.statSync(path.join(root,p)).isFile());
const tracks=[
 "era-themes/galaxy-theme-loop.ogg","era-themes/universe-theme-loop.ogg","era-themes/higher-theme-loop.ogg",
 "battle-themes/normal-battle-loop.ogg","battle-themes/medium-battle-loop.ogg","battle-themes/high-battle-loop.ogg"
].map(x=>"audio/assets/"+x);
const choices={"normal-attack":[1,2,3],critical:[1,2,3],dodge:[1],"heavy-hit":[4,5,29],victory:[1]};
for(const [kind,nums] of Object.entries(choices))for(const n of nums)
 tracks.push("audio/assets/common-sfx/"+kind+"/sfx-"+String(n).padStart(3,"0")+".ogg");
const selected=new Set(tracks);
const skipped=p=>p.startsWith(".github/")||p.startsWith("docs/")||p.startsWith("tests/")||p.startsWith("scripts/")||p.startsWith("development/")||p.startsWith("assets/backgrounds-source/")||p.startsWith("audio/assets/")&&!selected.has(p)||p.endsWith(".docx");
const keep=files.filter(p=>!skipped(p));
for(const p of selected)if(!files.includes(p))throw Error("Missing official audio file: "+p);
const backgrounds=keep.filter(p=>p.startsWith("assets/backgrounds/")&&p.endsWith(".webp"));
if(backgrounds.length!==32)throw Error("Expected 32 official WebP backgrounds; got "+backgrounds.length);
const audioCore=fs.readFileSync(path.join(root,"audio/audio-core.js"),"utf8");
const pools=audioCore.match(/const warmChoices=(\{[^;]+\});/);
if(!pools)throw Error("Cannot confirm actual audio pools");
const actual=JSON.parse(pools[1].replace(/([a-z][\w-]*):/g,'"$1":'));
if(JSON.stringify(actual)!==JSON.stringify(choices))throw Error("Live SFX pool changed: reconcile publish audio selection");
const bytes=p=>fs.statSync(path.join(root,p)).size;
const totals={trackedBytes:files.reduce((a,p)=>a+bytes(p),0),selectedBytes:keep.reduce((a,p)=>a+bytes(p),0)};
if(fs.existsSync(dest))fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
for(const p of keep){const out=path.join(dest,p);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(root,p),out);}
const manifestScript=path.join(root,"scripts/generate-resource-manifest.py");

// Existing manifest generator is source-root-relative; it would scan the unfiltered tree.
// Instead preserve only fingerprint entries for files present in the dry-run artifact.
const originalManifest=JSON.parse(fs.readFileSync(path.join(root,"resource-manifest.json"),"utf8"));
const manifest={...originalManifest,files:Object.fromEntries(Object.entries(originalManifest.files).filter(([p])=>fs.existsSync(path.join(dest,p))))};
fs.writeFileSync(path.join(dest,"resource-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
const relative=dest.slice(root.length+1).replaceAll(path.sep,"/");
const report={schema:1,stage:"dry-run",deploy:false,output:relative,trackedCount:files.length,artifactCount:keep.length,officialBackgrounds:backgrounds.length,officialMusic:6,officialSfxCategories:5,officialSfxFiles:tracks.length-6,officialAudioFiles:tracks.length,trackedBytes:totals.trackedBytes,artifactBytes:totals.selectedBytes+Buffer.byteLength(JSON.stringify(manifest,null,2)+"\n")-bytes("resource-manifest.json"),savedBytes:totals.trackedBytes-totals.selectedBytes,excluded:files.filter(p=>skipped(p)).map(p=>({path:p,bytes:bytes(p)}))};
const refs=[];
for(const p of keep.filter(x=>x.endsWith(".html")||x.endsWith(".css"))){
 const data=fs.readFileSync(path.join(dest,p),"utf8");
 const pattern=p.endsWith(".html")?/(?:src|href|data-src)=["']([^"'?#]+)[^"']*["']/g:/url\(\s*["']?([^)'"]+)["']?\s*\)/g;
 for(const m of data.matchAll(pattern)){const u=m[1].split(/[?#]/)[0];if(!u||/^(?:https?:|data:|\/\/|#)/.test(u))continue;const f=path.posix.normalize(path.posix.join(path.posix.dirname(p),u));if(f.startsWith("../"))continue;if(!fs.existsSync(path.join(dest,f)))refs.push({from:p,missing:f});}
}
report.missingDirectRefs=refs;
const out=path.join(root,"publish-stage3-report.json");
fs.writeFileSync(out,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({artifactMB:+(report.artifactBytes/1e6).toFixed(2),savedMB:+(report.savedBytes/1e6).toFixed(2),files:report.artifactCount,missingRefs:refs.length,music:6,sfxFiles:11,backgrounds:32},null,2));
if(refs.length){console.error("Missing direct dependencies: "+JSON.stringify(refs.slice(0,20)));process.exitCode=1;}
