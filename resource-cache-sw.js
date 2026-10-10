/* Civilization resource cache v1: media-only, fail-open and save-data isolated. */
"use strict";
const PREFIX="civilization-resource-v1-", ACTIVE=PREFIX+"media";
const MANIFEST="resource-manifest.json";
const MEDIA=/\.(?:ogg|mp3|wav|png|jpe?g|webp|avif|glb|gltf|bin|ktx2|basis)$/i;
let known=null, refreshJob=null, manifestTag=null;
const asPath=url=>{const u=new URL(url);const scope=new URL(self.registration.scope);if(u.origin!==scope.origin||!u.pathname.startsWith(scope.pathname))return null;return decodeURIComponent(u.pathname.slice(scope.pathname.length));};
const hex=s=>typeof s==="string"&&/^[a-f0-9]{24}$/.test(s);
async function refresh(){
 if(refreshJob)return refreshJob;
 refreshJob=(async()=>{
  const url=new URL(MANIFEST,self.registration.scope);
  const response=await fetch(url,{cache:"no-store",credentials:"same-origin"});
  if(!response.ok)throw Error("manifest-network-failed");
  const doc=await response.json();
  if(doc.schema!==1||doc.algorithm!=="sha256-96"||!doc.files||typeof doc.files!=="object")throw Error("manifest-invalid");
  const entries=new Map(Object.entries(doc.files).filter(([p,h])=>hex(h)&&!p.includes("..")&&!p.startsWith("/")));
  if(!entries.size)throw Error("manifest-empty");
  manifestTag=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(doc))).then(x=>Array.from(new Uint8Array(x),b=>b.toString(16).padStart(2,"0")).join("").slice(0,16));
  await clean(entries);
  known=entries;
  return entries;
 })().finally(()=>refreshJob=null);
 return refreshJob;
}
async function clean(entries){
 const cache=await caches.open(ACTIVE);
 const keys=await cache.keys();
 for(const req of keys){
  const p=asPath(req.url);
  if(!p||!entries.has(p)||new URL(req.url).searchParams.get("asset")!==entries.get(p))await cache.delete(req);
 }
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==ACTIVE)await caches.delete(name);
}
function keyFor(path,digest){const url=new URL(path,self.registration.scope);url.searchParams.set("asset",digest);return url.href;}
async function media(request){
 let path=asPath(request.url);if(!path||!MEDIA.test(path)||!known?.has(path))return fetch(request);
 const digest=known.get(path);
 const specified=new URL(request.url).searchParams.get("asset");
 if(specified&&specified!==digest)return fetch(request);
 const cache=await caches.open(ACTIVE),key=keyFor(path,digest);
 const saved=await cache.match(key);
 if(saved)return saved;
 const fetched=await fetch(request,{cache:"no-store"});
 if(!fetched.ok||fetched.type!=="basic"||request.headers.has("range"))return fetched;
 // A deployed file can race a manifest update. Never attach stale bytes to a new digest.
 try{
  const bytes=await fetched.clone().arrayBuffer();
  const hash=await crypto.subtle.digest("SHA-256",bytes);
  const actual=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("").slice(0,24);
  if(actual!==digest)return fetched; // deployment in progress; never cache mismatched bytes
  try{await cache.put(key,fetched.clone());}catch(_){} // quota errors must not block playback
 }catch(_){return fetched;} // hashing unavailable: return uncached response
 return fetched;
}
// Background preload is deliberately limited to shipped gameplay media, not raw source/audio libraries.
let preloadJob=null,preloadGeneration=0;
function shouldPreload(p){
 if(p.startsWith("assets/backgrounds/"))return MEDIA.test(p);
 if(p.startsWith("audio/assets/era-themes/"))return p.endsWith("-theme-loop.ogg");
 if(p.startsWith("audio/assets/battle-themes/"))return p.endsWith("-battle-loop.ogg");
 if(p.startsWith("audio/assets/common-sfx/")){
  const m=p.match(/\/(normal-attack|critical|dodge|heavy-hit|victory)\/sfx-(\d+)\.ogg$/);
  if(!m)return false;
  const n=Number(m[2]);
  return m[1]==="normal-attack"||m[1]==="critical"?n<=3:m[1]==="dodge"||m[1]==="victory"?n===1:[4,5,29].includes(n);
 }
 if(p.startsWith("3d-test/assets/")||p.startsWith("assets/3d/")||p.startsWith("assets/models/"))return MEDIA.test(p);
 return false;
}
async function preloadAssets(report){
 if(preloadJob)return preloadJob;
 const generation=preloadGeneration;
 preloadJob=(async()=>{
  const entries=known||await refresh();
  const cache=await caches.open(ACTIVE);
  const paths=[...entries.keys()].filter(shouldPreload);
  let done=0,saved=0,failed=0;
  report({phase:"start",total:paths.length,done,saved,failed});
  // Run gently behind the home screen; failures are nonfatal and retried next visit.
  for(const path of paths){
   if(generation!==preloadGeneration)break;
   const digest=entries.get(path),key=keyFor(path,digest);
   if(await cache.match(key)){done++;continue;}
   try{
    const request=new Request(new URL(path,self.registration.scope),{credentials:"same-origin"});
    const response=await fetch(request,{cache:"no-store"});
    if(!response.ok||response.type!=="basic")throw Error("fetch");
    const data=await response.clone().arrayBuffer();
    const hash=await crypto.subtle.digest("SHA-256",data);
    const actual=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("").slice(0,24);
    if(actual!==digest)throw Error("digest");
    if(generation!==preloadGeneration)break;
    await cache.put(key,response.clone());saved++;
   }catch(_){failed++;}
   done++;
   if(done%3===0||done===paths.length)report({phase:"progress",total:paths.length,done,saved,failed});
  }
  report({phase:"complete",total:paths.length,done,saved,failed});
 })().finally(()=>preloadJob=null);
 return preloadJob;
}
self.addEventListener("install",event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{try{await refresh();}catch(_){}await self.clients.claim();})());});
self.addEventListener("fetch",event=>{
 const req=event.request;if(req.method!=="GET")return;
 const path=asPath(req.url);if(!path)return;
 if(req.mode==="navigate"){
  event.respondWith(fetch(req,{cache:"no-store"}));event.waitUntil(refresh().catch(()=>{}));return;
 }
 if(!MEDIA.test(path))return; // JS/CSS and manifest use browser networking and existing versions.
 event.respondWith((async()=>{if(refreshJob)await refreshJob.catch(()=>{});return media(req);})());
});
self.addEventListener("message",event=>{
 const data=event.data||{},port=event.ports&&event.ports[0];
 const respond=msg=>{try{port?.postMessage(msg);}catch(_){}};
 if(data.type==="CIV_CACHE_PRELOAD")event.waitUntil(preloadAssets(respond).catch(e=>respond({phase:"error",error:String(e)})));
 if(data.type==="CIV_CACHE_REFRESH")event.waitUntil(refresh().then(()=>respond({ok:true,version:manifestTag,count:known.size})).catch(e=>respond({ok:false,error:String(e.message||e)})));
 if(data.type==="CIV_CACHE_STATUS")event.waitUntil(caches.open(ACTIVE).then(async c=>{
  const keys=await c.keys();let bytes=0,measured=0;
  for(const key of keys){
   const response=await c.match(key);
   const rawLength=response?.headers?.get("content-length");
   const length=rawLength===null?NaN:Number(rawLength);
   if(Number.isFinite(length)&&length>=0){bytes+=length;measured++;}
   else if(response){try{bytes+=(await response.blob()).size;measured++;}catch(_){}}
  }
  respond({ok:true,version:manifestTag,entries:keys.length,bytes,measured});
 }).catch(()=>respond({ok:false})));
 if(data.type==="CIV_CACHE_CLEAR")event.waitUntil((async()=>{preloadGeneration++;for(const name of await caches.keys())if(name.startsWith(PREFIX))await caches.delete(name);respond({ok:true});})().catch(()=>respond({ok:false})));
});
