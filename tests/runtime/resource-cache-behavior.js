"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const {createHash,webcrypto}=require("node:crypto");
const handlers={},urls=new Map(),net=[];
let manifestFiles={};
const scope="https://example.test/rpg/";
const sha=s=>createHash("sha256").update(s).digest("hex").slice(0,24);
const get=u=>typeof u==="string"?u:u.url;
const cache={
 async keys(){return [...urls.keys()].map(u=>new Request(u));},
 async match(u){return urls.get(get(u))?.clone();},
 async put(u,r){urls.set(get(u),r.clone());},
 async delete(u){return urls.delete(get(u));}
};
const caches={
 async open(name){assert.equal(name,"civilization-resource-v1-media");return cache;},
 async keys(){return ["civilization-resource-v1-media"];},
 async delete(name){if(name==="civilization-resource-v1-media"){urls.clear();return true;}return false;}
};
async function fetchMock(req){
 const url=get(req);net.push(url);
 if(url.endsWith("resource-manifest.json"))return new Response(JSON.stringify({schema:1,algorithm:"sha256-96",files:manifestFiles}),{status:200,headers:{"content-type":"application/json"}});
 if(url.includes("theme.ogg"))return new Response("sound-data",{status:200});
 return new Response("missing",{status:404});
}
const self={registration:{scope},addEventListener(k,v){handlers[k]=v;},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
vm.runInNewContext(fs.readFileSync("resource-cache-sw.js","utf8"),{self,URL,Request,Response,TextEncoder,crypto:webcrypto,caches,fetch:fetchMock,console,Map,Set,Uint8Array});
async function activate(){let p;handlers.activate({waitUntil(q){p=q;}});await p;}
async function requestMedia(){let p;handlers.fetch({request:new Request(scope+"theme.ogg"),respondWith(q){p=q;},waitUntil(){}});return p;}
async function message(type){let promise,resolve;const returned=new Promise(r=>resolve=r);handlers.message({data:{type},ports:[{postMessage(x){resolve(x);}}],waitUntil(q){promise=q;}});await promise;return returned;}
(async()=>{
 manifestFiles={"theme.ogg":sha("sound-data")};
 await activate();
 assert.equal((await requestMedia()).status,200);
 assert.equal(urls.size,1,"valid resource must enter cache");
 const first=net.length;
 assert.equal((await requestMedia()).status,200);
 assert.equal(net.length,first,"unchanged resource must reuse persistent cache");
 let status=await message("CIV_CACHE_STATUS");
 assert.equal(status.entries,1);
 assert.equal(status.bytes,10,"missing content-length must use blob size");
 manifestFiles={"theme.ogg":sha("updated-sound")};
 await message("CIV_CACHE_REFRESH");
 assert.equal(urls.size,0,"obsolete digest must be removed");
 assert.equal((await requestMedia()).status,200,"mismatch must fall back to response, not a synthetic failure");
 assert.equal(urls.size,0,"mismatched deployment bytes must never be cached");
 assert.equal((await message("CIV_CACHE_CLEAR")).ok,true);
 assert.equal(urls.size,0);
 assert.doesNotMatch(fs.readFileSync("resource-cache-sw.js","utf8"),/localStorage|indexedDB/);
 console.log("PASS: reuse, content validation, stale cleanup, usage bytes, manual clear, fallback, save isolation");
})().catch(e=>{console.error(e);process.exitCode=1;});
