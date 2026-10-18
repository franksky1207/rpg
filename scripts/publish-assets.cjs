"use strict";
// Shared audit/build policy. Only the generated candidate is filtered.
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process"),vm=require("node:vm"),crypto=require("node:crypto");
const RESOURCE=/\.(?:html|mjs|js|css|json|png|webp|jpe?g|svg|gif|woff2?|ico|ogg|mp3|wav|glb|gltf|bin|ktx2|basis|avif)$/i;
const FINGERPRINT=/\.(?:mjs|js|css|png|webp|jpe?g|svg|gif|woff2?|ico|ogg|mp3|wav|glb|gltf|bin|ktx2|basis|avif)$/i;
const digest=bytes=>crypto.createHash("sha256").update(bytes).digest("hex").slice(0,24);
const {inspectRegistry}=require('./asset-registry.cjs');
function audioSelection(root){
 const core=fs.readFileSync(path.join(root,"audio/audio-core.js"),"utf8");
 const match=core.match(/const warmChoices=(\{[^;]+\});/);
 if(!match)throw Error("Cannot confirm runtime SFX pool");
 const pools=JSON.parse(JSON.stringify(vm.runInNewContext("("+match[1]+")",Object.create(null),{timeout:1000})));
 const kinds=["normal-attack","critical","dodge","heavy-hit","victory"];
 if(Object.keys(pools).length!==5||kinds.some(k=>!Array.isArray(pools[k])||!pools[k].length))throw Error("Expected five active SFX categories");
 const music=[...core.matchAll(/url:\s*["'](audio\/assets\/(?:era-themes|battle-themes)\/[^"']+\.ogg)["']/g)].map(m=>m[1]);
 if(new Set(music).size!==6)throw Error("Expected six runtime music tracks");
 const sfx=[];
 for(const [kind,indices] of Object.entries(pools))for(const n of indices){
  if(!Number.isSafeInteger(n)||n<1)throw Error("Invalid runtime SFX index");
  sfx.push(`audio/assets/common-sfx/${kind}/sfx-${String(n).padStart(3,"0")}.ogg`);
 }
 if(new Set(sfx).size!==11)throw Error("Expected eleven runtime SFX pool files");
 return {music,sfx,pools,files:[...music,...sfx]};
}
function references(root,files,available=files){
 const known=new Set(available),refs=[],unresolved=[];
 const add=(from,raw,kind)=>{
  const uri=raw.trim().replaceAll("&amp;","&").split(/[?#]/)[0];
  if(!uri||/^(?:[a-z]+:|\/\/|#)/i.test(uri)||!RESOURCE.test(uri))return;
  if(uri.includes("${")){unresolved.push({from,uri,kind});return;}
  const relative=path.posix.normalize(path.posix.join(path.posix.dirname(from),uri));
  const absolute=path.posix.normalize(uri.replace(/^\/+/,""));
  // JS creates document-relative URLs; code also carries iframe-relative fallback
  // filenames. Resolve only existing paths, and fail when neither exists.
  const target=uri.startsWith("/")?absolute:kind==="js"?(known.has(absolute)||/^(?:audio|assets|3d-test|vendor)\//.test(uri)?absolute:relative):relative;
  if(target.startsWith("../"))throw Error("Dependency escapes website: "+from+" -> "+uri);
  refs.push({from,path:target,kind});
 };
 for(const file of files){
  if(!/\.(?:html|css|mjs|js)$/.test(file)||file.startsWith("vendor/"))continue;
  const s=fs.readFileSync(path.join(root,file),"utf8");
  if(file.endsWith(".html"))for(const m of s.matchAll(/\b(?:src|href|data-src)\s*=\s*["']([^"']+)["']/gi))add(file,m[1],"html");
  if(file.endsWith(".css"))for(const m of s.matchAll(/url\(\s*["']?([^)'"]+)["']?\s*\)/gi))add(file,m[1],"css");
  if(/\.m?js$/.test(file))for(const m of s.matchAll(/["'`]((?:\.?\.?\/)?[a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+(?:\?[^"'`\s]*)?)["'`]/g)){
   // Suffix/string predicates are not resource requests (including retired names).
   if(/\.(?:endsWith|startsWith|includes)\(\s*$/.test(s.slice(Math.max(0,m.index-30),m.index)))continue;
   if(/new URL\(\s*$/.test(s.slice(Math.max(0,m.index-20),m.index))&&/^,root\)/.test(s.slice(m.index+m[0].length)))continue; // separately SHA-gated B preview closure
   add(file,m[1],"js");
  }
 }
 return {refs,unresolved};
}
function inspect(root){
 const files=cp.execFileSync("git",["ls-files","-z"],{cwd:root,encoding:"utf8"}).split("\0").filter(Boolean).sort();
 require('./gm-sprite-publication.cjs')(root,files);
 require('./formal-sprite-publication.cjs')(root,files);
 require('./era-sprite-publication.cjs')(root,files);
 for(const file of files){
  const local=path.join(root,file);
  if(!fs.existsSync(local)||!fs.lstatSync(local).isFile())throw Error("Tracked source missing or not a regular file: "+file);
 }
 const audio=audioSelection(root),selected=new Set(audio.files),sizes=new Map(files.map(p=>[p,fs.statSync(path.join(root,p)).size]));
 for(const file of selected)if(!sizes.has(file))throw Error("Missing official audio: "+file);
 const registered=inspectRegistry(root,new Set(files)),registeredPaths=new Set(registered.paths);
 const category=p=>{
  if(p==='3d-test/atlas-review.js')return 'retired-gm-art-review';
  if(p==='3d-test/gm-whole-suit.mjs')return 'retired-gm-equipment-selector';
  if(p.startsWith("."))return "development";
  if(/^(?:\.github|docs|tests|scripts|development)\//.test(p))return "development";
  if(p.startsWith("assets/backgrounds-source/"))return "source";
  if(p.startsWith('assets/3d/')&&!registeredPaths.has(p))return 'unregistered-3d-source';
  if(p.startsWith("audio/assets/")&&!selected.has(p))return "unused-audio-or-source";
  if(/\.(?:md|docx|blend[12]?|psd|psb|kra|xcf|flac|7z|zip)$/i.test(p)&&!p.startsWith("vendor/"))return "development-or-source";
  if(!RESOURCE.test(p)&&!/^vendor\/.*\/(?:LICENSE|SOURCE\.md)$/.test(p))return 'unknown-source-format';
  return "runtime";
 };
 const keep=new Set(files.filter(p=>category(p)==="runtime")),retained=[];
 // Retain referenced candidates instead of deleting a dependency by category.
 let scan;
 for(;;){
  scan=references(root,[...keep],files);
  let added=false;
  for(const ref of scan.refs)if(sizes.has(ref.path)&&!keep.has(ref.path)){
   if(ref.path.startsWith("development/")||/unregistered-3d-source|unknown-source-format/.test(category(ref.path))||/\.(?:blend[12]?|fbx|exr|psd|tiff?|usd[acz]?|sbsar)$/i.test(ref.path))throw Error('Runtime references forbidden source: '+ref.path);
   keep.add(ref.path);retained.push(ref);added=true;
  }
  if(!added)break;
 }
 const missing=scan.refs.filter(r=>!sizes.has(r.path));
 const backgrounds=[...keep].filter(p=>/^assets\/backgrounds\/.*\.webp$/.test(p));
 if(backgrounds.length!==32)throw Error("Expected 32 runtime WebP backgrounds; got "+backgrounds.length);
 return {files,keep:[...keep].sort(),excluded:files.filter(p=>!keep.has(p)).map(p=>({path:p,bytes:sizes.get(p),category:category(p)})),sizes,audio,backgrounds,missing,retained,unresolved:scan.unresolved,references:scan.refs,registeredAssets:registered.entries};
}
function walk(root){
 const files=[];
 for(const entry of fs.readdirSync(root,{withFileTypes:true})){
  const local=path.join(root,entry.name);
  if(entry.isDirectory())for(const child of walk(local))files.push(entry.name+"/"+child);
  else if(entry.isFile())files.push(entry.name);
  else throw Error("Unexpected output entry: "+local);
 }
 return files.sort();
}
function manifest(root,files){
 return {schema:1,algorithm:"sha256-96",files:Object.fromEntries(files.filter(p=>FINGERPRINT.test(p)||p==='assets/3d/asset-registry.json').map(p=>[p,digest(fs.readFileSync(path.join(root,p)))]))};
}
module.exports={inspect,references,walk,manifest,digest};
