'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
async function verify(asset){
const body=fs.readFileSync(asset.path),scope='https://example.test/rpg/',storage=new Map(),events={};let loads=0,fault=null;
const url=x=>typeof x==='string'?x:x.url||x.href;
function basic(r){Object.defineProperty(r,'type',{value:'basic'});const clone=r.clone.bind(r);r.clone=()=>basic(clone());return r;}
const cache={keys:async()=>[...storage.keys()].map(u=>new Request(u)),match:async u=>storage.get(url(u))?.clone(),put:async(u,r)=>storage.set(url(u),r.clone()),delete:async u=>storage.delete(url(u))};
const manifest={schema:1,algorithm:'sha256-96',files:{[asset.path]:asset.sha256.slice(0,24),'assets/monsters/v1/void/unapproved.webp':'a'.repeat(24),'development/monster-art/batch16-v01/reference/void-phantom-v01-preview.png':'b'.repeat(24)}};
const ctx=vm.createContext({URL,Request,Response,Headers,TextEncoder,crypto:webcrypto,console,caches:{open:async()=>cache,keys:async()=>['civilization-resource-v1-media'],delete:async()=>{storage.clear();return true;}},self:{registration:{scope},addEventListener:(k,v)=>events[k]=v,skipWaiting:async()=>{},clients:{claim:async()=>{}}},fetch:async req=>{
 if(url(req).includes('resource-manifest.json'))return new Response(JSON.stringify(manifest));
 assert.ok(url(req).includes(asset.path));loads++;if(fault==='http')return basic(new Response('offline',{status:503}));const data=Buffer.from(body);if(fault==='sha')data[100]^=1;return basic(new Response(data));
}});vm.runInContext(fs.readFileSync('resource-cache-sw.js','utf8'),ctx);
await (async()=>{
 assert.equal(ctx.shouldPreload('assets/monsters/v1/boss/unapproved.webp'),false);assert.equal(ctx.shouldPreload('development/monster-art/batch17/preview/contact_sheet.png'),false);assert.equal(ctx.shouldPreload('development/monster-art/batch17/images/png/C-03_eyes_shared.png'),false);
 assert.equal(ctx.shouldPreload(asset.path),true);assert.equal(ctx.shouldPreload('assets/monsters/v1/void/unapproved.webp'),false);assert.equal(ctx.shouldPreload('development/monster-art/batch16-v01/reference/void-phantom-v01-preview.png'),false);
 await ctx.refresh();let status=[];await ctx.preloadAssets(v=>status.push(v));assert.equal(status.at(-1).saved,1);assert.equal(loads,1);
 await ctx.media(new Request(scope+asset.path));assert.equal(loads,1,'preloaded bytes reused');await ctx.preloadAssets(()=>{});assert.equal(loads,1,'no repeated background download');
 const key=[...storage.keys()][0];storage.set(key,basic(new Response('corrupt')));await ctx.refresh();await ctx.media(new Request(scope+asset.path));assert.equal(loads,2,'corrupt disk cache repaired');assert.deepEqual(Buffer.from(await storage.get(key).clone().arrayBuffer()),body);
 let clearing;events.message({data:{type:'CIV_CACHE_CLEAR'},ports:[{postMessage(){}}],waitUntil:p=>clearing=p});await clearing;assert.equal(storage.size,0);await ctx.preloadAssets(()=>{});assert.equal(loads,3,'clear then redownload');
 for(const kind of ['http','sha']){storage.clear();fault=kind;status=[];await ctx.preloadAssets(v=>status.push(v));assert.equal(status.at(-1).failed,1);assert.equal(storage.size,0);fault=null;await ctx.preloadAssets(()=>{});assert.equal(storage.size,1);}
 console.log(asset.assetId,'PASS selected background download, manifest SHA, warm reuse, cache clear, corrupt disk, HTTP/SHA recovery; unapproved/source media excluded');
})();
}
(async()=>{const assets=JSON.parse(fs.readFileSync('data/monsters/monster-assets.json')).assets.filter(a=>a.alternateArtCode);assert.equal(assets.length,6);for(const asset of assets)await verify(asset);})().catch(e=>{console.error(e);process.exitCode=1;});
