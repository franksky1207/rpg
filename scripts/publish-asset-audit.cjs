#!/usr/bin/env node
"use strict";
/*
 * Publish plan stage 2: report/CI only. Never copies, deletes or deploys.
 * Git index is the source of truth. Conservative keep-on-uncertainty policy.
 */
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
process.chdir(root);
const list=cp.execFileSync("git",["ls-files","-z"],{encoding:"utf8"}).split("\0").filter(Boolean);
const runtimeExt=/\.(?:html|js|css|json)$/i;
const sourceExt=/\.(?:blend|blend1|blend2|psd|psb|kra|xcf|flac|7z|zip)$/i;
const sourceNamed=/(?:^|\/)(?:[^/]*-original|[^/]*-source)\.(?:mp3|wav|ogg|flac)$/i;
const excludedPrefix=[".github/","docs/","tests/","scripts/","assets/backgrounds-source/","development/"];
const rulesFile="docs/PUBLISH_ASSET_PLAN_STAGE2_2026-10-11.md";
const stat=p=>fs.statSync(p).size;
const files=list.filter(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
const fileSet=new Set(files);
const runtimeFiles=files.filter(p=>runtimeExt.test(p)&&!excludedPrefix.some(x=>p.startsWith(x))&&p!=="resource-manifest.json");
const content=new Map(runtimeFiles.map(p=>[p,fs.readFileSync(p,"utf8")]));
const references=new Map();
function add(target,source,kind){
 const normal=path.posix.normalize(target.replace(/^\/+/, ""));
 if(!normal||normal.startsWith("../")||normal.includes("://"))return;
 if(!references.has(normal))references.set(normal,[]);
 references.get(normal).push({source,kind});
}
for(const [p,s] of content) {
 // Real HTML resource references, including lazy GM scripts via data-src.
 if(p.endsWith(".html")){
  for(const m of s.matchAll(/(?:src|href|data-src)\s*=\s*["']([^"'?#]+(?:\?[^"']*)?)["']/gi)){
   const uri=m[1].replace(/&amp;/g,"&").split(/[?#]/)[0];
   if(/^(?:https?:)?\/\//i.test(uri)||uri.startsWith("data:")||uri.startsWith("#"))continue;
   add(path.posix.join(path.posix.dirname(p),uri),p,"html");
  }
 }
 // Explicit CSS URLs with optional query/hash.
 if(p.endsWith(".css"))for(const m of s.matchAll(/url\(\s*["']?([^)'"]+)["']?\s*\)/gi)){
  const uri=m[1].trim().split(/[?#]/)[0];
  if(uri&&!/^(?:data:|https?:|\/\/)/i.test(uri))add(path.posix.join(path.posix.dirname(p),uri),p,"css");
 }
 // Literal official media URLs, not arbitrary document text or dynamic prefix.
 for(const m of s.matchAll(/["'` ]((?:assets\/backgrounds\/|assets\/3d\/|assets\/models\/|3d-test\/assets\/|audio\/assets\/|vendor\/)[^"'\s`),;]+\.(?:ogg|mp3|wav|webp|png|jpe?g|glb|gltf|bin|ktx2|basis|avif|js))(?:\?[^"'\s`]*)?/gi))
  add(m[1],p,"literal");
}
const hardMissing=[],review=[];
for(const [p,uses] of references){
 if(fileSet.has(p))continue;
 if(uses.some(x=>x.kind==="html"&&/\.(?:js|css|html)$/i.test(p)))hardMissing.push({path:p,uses});
 else if(uses.some(x=>x.kind==="css"&&/\.(?:png|webp|jpg|jpeg|woff2?|svg|gif)$/i.test(p)))hardMissing.push({path:p,uses});
 else review.push({path:p,uses});
}
function classify(p){
 if(p.startsWith("assets/backgrounds-source/"))return "source";
 if(p.startsWith("development/"))return "source";
 if(p.startsWith(".github/")||p.startsWith("docs/")||p.startsWith("tests/")||p.startsWith("scripts/"))return "development";
 if(p.startsWith("audio/assets/")&&(sourceExt.test(p)||sourceNamed.test(p)))return "source-candidate";
 if(sourceExt.test(p))return "source-candidate";
 return "runtime";
}
const rows=files.map(p=>({path:p,bytes:stat(p),category:classify(p)}));
const candidates=rows.filter(x=>x.category!=="runtime");
const unsafe=candidates.filter(x=>references.has(x.path));
const retained=new Set(rows.filter(x=>x.category==="runtime"||references.has(x.path)).map(x=>x.path));
const included=rows.filter(x=>retained.has(x.path));
const totals={};
for(const x of rows){const v=totals[x.category]||{files:0,bytes:0};v.files++;v.bytes+=x.bytes;totals[x.category]=v;}
const sum=items=>items.reduce((s,x)=>s+x.bytes,0);
const output={schema:1,policy:"conservative-audit-only",files:rows.length,totalBytes:sum(rows),includedBytes:sum(included),candidateExcludedBytes:sum(rows)-sum(included),counts:totals,retainedSourceReferences:unsafe.map(x=>({path:x.path,bytes:x.bytes,references:references.get(x.path)})),hardMissing,reviewNeeded:review.slice(0,100),notes:["No deployment was changed.","Source candidates referenced by runtime were retained.","Dynamic constructed URLs cannot be proven by static inspection; deployment requires later browser tests."]};
const json=JSON.stringify(output,null,2)+"\n";
if(process.argv.includes("--json"))process.stdout.write(json);
else{
 console.log("Publish Stage 2 (audit only): "+rows.length+" tracked files; "+(sum(rows)/1e6).toFixed(2)+" MB total");
 console.log("Conservative proposed artifact: "+(sum(included)/1e6).toFixed(2)+" MB; candidate savings: "+((sum(rows)-sum(included))/1e6).toFixed(2)+" MB");
 console.log("Classification: "+JSON.stringify(totals));
 console.log("Retained referenced source candidates: "+unsafe.length+"; hard missing direct references: "+hardMissing.length+"; review-only references: "+review.length);
 for(const x of hardMissing)console.error("MISSING "+x.path+" referenced by "+x.uses.map(v=>v.source).join(", "));
 for(const x of unsafe)console.log("RETAIN SOURCE REFERENCE "+x.path);
 console.log("No file was moved, removed, published or copied.");
}
if(hardMissing.length)process.exitCode=1;
