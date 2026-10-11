"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const {createHash,webcrypto}=require("node:crypto");
const handlers={},urls=new Map(),net=[];
let manifestFiles={};
const scope="https://example.test/rpg/";
const modelPath='assets/3d/characters/player-v1/player-low.glb';
const model=fs.readFileSync(modelPath);
const sha=s=>createHash("sha256").update(s).digest("hex").slice(0,24);
const get=u=>typeof u==="string"?u:u.url||u.href;
// Node-created Responses are synthetic ('default'); real same-origin fetches
// are 'basic'. Keep this property through clone, as browser Responses do.
function basic(response){
 Object.defineProperty(response,"type",{value:"basic"});
 const clone=response.clone.bind(response);
 response.clone=()=>basic(clone());
 return response;
}
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
 if(url.includes("theme.ogg"))return basic(new Response("sound-data",{status:200}));
 if(url.includes(modelPath))return basic(new Response(model,{status:200}));
 return new Response("missing",{status:404});
}
const self={registration:{scope},addEventListener(k,v){handlers[k]=v;},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
vm.runInNewContext(fs.readFileSync("resource-cache-sw.js","utf8"),{self,URL,Request,Response,Headers,TextEncoder,crypto:webcrypto,caches,fetch:fetchMock,console,Map,Set,Uint8Array});
async function activate(){let p;handlers.activate({waitUntil(q){p=q;}});await p;}
async function requestMedia(range){let p;handlers.fetch({request:new Request(scope+"theme.ogg",{headers:range?{range}:{}}),respondWith(q){p=q;},waitUntil(){}});return p;}
async function requestModel(range){let p;handlers.fetch({request:new Request(scope+modelPath,{headers:range?{range}:{}}),respondWith(q){p=q;},waitUntil(){}});return p;}
async function message(type){let promise,resolve;const returned=new Promise(r=>resolve=r);handlers.message({data:{type},ports:[{postMessage(x){resolve(x);}}],waitUntil(q){promise=q;}});await promise;return returned;}
(async()=>{
 manifestFiles={"theme.ogg":sha("sound-data")};
 await activate();
 assert.equal((await requestMedia()).status,200);
 assert.equal(urls.size,1,"valid resource must enter cache");
 const first=net.length;
 assert.equal((await requestMedia()).status,200);
 assert.equal(net.length,first,"unchanged resource must reuse persistent cache");
 for(const [range,body,header] of [["bytes=2-5","und-","bytes 2-5/10"],["bytes=7-","ata","bytes 7-9/10"],["bytes=-4","data","bytes 6-9/10"]]){
  const response=await requestMedia(range);
  assert.equal(response.status,206,range);
  assert.equal(response.headers.get("content-range"),header);
  assert.equal(await response.text(),body);
 }
 assert.equal(net.length,first,"cached byte ranges must not request network");
 let status=await message("CIV_CACHE_STATUS");
 assert.equal(status.entries,1);
 assert.equal(status.bytes,10,"missing content-length must use blob size");
 manifestFiles[modelPath]=sha(model);await message('CIV_CACHE_REFRESH');
 await message('CIV_CACHE_PRELOAD');assert.ok(!net.some(u=>u.includes(modelPath)),'registered GLB must never enter global media preload');
 assert.equal((await requestModel()).status,200);const modelNet=net.length;
 const modelRange=await requestModel('bytes=0-7');assert.equal(modelRange.status,206);
 assert.equal(modelRange.headers.get('content-range'),'bytes 0-7/'+model.length);
 assert.deepEqual(Buffer.from(await modelRange.arrayBuffer()),model.subarray(0,8));
 assert.equal(net.length,modelNet,'GLB Range must reuse verified cache');
 manifestFiles[modelPath]=sha('new-model-version');await message('CIV_CACHE_REFRESH');
 assert.equal(urls.size,1,'model version update must remove only the obsolete GLB, retaining unchanged audio');
 manifestFiles={"theme.ogg":sha("updated-sound")};
 await message("CIV_CACHE_REFRESH");
 assert.equal(urls.size,0,"obsolete digest must be removed");
 assert.equal((await requestMedia()).status,200,"mismatch must fall back to response, not a synthetic failure");
 assert.equal(urls.size,0,"mismatched deployment bytes must never be cached");
 assert.equal((await message("CIV_CACHE_CLEAR")).ok,true);
 assert.equal(urls.size,0);
 assert.doesNotMatch(fs.readFileSync("resource-cache-sw.js","utf8"),/localStorage|indexedDB/);
 console.log("PASS: audio/GLB reuse, no model preload, GLB Range, incremental version cleanup, usage bytes, clear, fallback, save isolation");
})().catch(e=>{console.error(e);process.exitCode=1;});
