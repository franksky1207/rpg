"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const {chromium}=require("playwright");
const policy=require("../../scripts/publish-assets.cjs");
(async()=>{
 const report=JSON.parse(fs.readFileSync("publish-stage3-report.json","utf8"));
 const root=path.resolve(report.output),base=new URL("./",process.env.RUNTIME_SMOKE_URL||"http://127.0.0.1:4173/index.html");
 const files=policy.walk(root),manifest=JSON.parse(fs.readFileSync(path.join(root,"resource-manifest.json"),"utf8"));
 assert.equal(files.length,report.artifactCount);
 assert.equal(files.reduce((s,p)=>s+fs.statSync(path.join(root,p)).size,0),report.artifactBytes,"report must equal actual output bytes");
 for(const [file,hash] of Object.entries(manifest.files))assert.equal(policy.digest(fs.readFileSync(path.join(root,file))),hash,file);
 const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader"]});
 const metrics={artifactBytes:report.artifactBytes,files:files.length,verifiedResponses:0,audio:[],viewports:[],missing:[],pageErrors:[]};
 try{
  const context=await browser.newContext(),page=await context.newPage();
  const cdp=await context.newCDPSession(page);await cdp.send("Network.enable");
  let transferred=0;cdp.on("Network.loadingFinished",e=>transferred+=e.encodedDataLength);
  page.on("pageerror",e=>metrics.pageErrors.push(String(e)));
  page.on("response",r=>{if(new URL(r.url()).origin===base.origin&&r.status()>=400)metrics.missing.push({url:r.url(),status:r.status()});});
  await page.goto(new URL("index.html",base).href,{waitUntil:"domcontentloaded",timeout:45000});
  await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready",null,{timeout:45000});
  metrics.initialTransferredBytes=transferred;
  // Check every shipped file over HTTP, not merely the homepage's requests.
  // Also compare response bytes to disk; a fallback HTML response must fail.
  for(let i=0;i<files.length;i+=8)await Promise.all(files.slice(i,i+8).map(async file=>{
   const response=await context.request.get(new URL(file,base).href);
   assert.equal(response.status(),200,file);
   const body=await response.body(),local=fs.readFileSync(path.join(root,file));
   assert.equal(crypto.createHash("sha256").update(body).digest("hex"),crypto.createHash("sha256").update(local).digest("hex"),file);
   metrics.verifiedResponses++;await response.dispose();
  }));
  const urls=await page.evaluate(()=>Object.values(window.CivilizationAudio.tracks).map(x=>x.url));
  assert.deepEqual([...new Set(urls)].sort(),[...report.officialAudio.music].sort(),"runtime music must match artifact policy");
  const kinds=await page.evaluate(()=>Object.keys(window.CivilizationAudio.sfxCategories));
  assert.deepEqual(kinds.sort(),Object.keys(report.officialAudio.pools).sort());
  // Exercise all eleven random-pool members, not just one per SFX category.
  for(const file of report.officialAudio.files){
   const audio=await page.evaluate(url=>new Promise((resolve,reject)=>{
    const a=new Audio();const timer=setTimeout(()=>finish(new Error("audio metadata timeout: "+url)),15000);
    function finish(error){clearTimeout(timer);const duration=a.duration;a.removeAttribute("src");a.load();error?reject(error):resolve({url,duration});}
    a.addEventListener("loadedmetadata",()=>finish(),{once:true});a.addEventListener("error",()=>finish(new Error("audio decode failed: "+url)),{once:true});
    a.preload="metadata";a.src=url;a.load();
   }),new URL(file,base).href);
   assert.ok(Number.isFinite(audio.duration)&&audio.duration>0.05,file);metrics.audio.push(audio);
  }
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   await page.evaluate(()=>window.go("settings"));
   assert.equal(await page.locator("#settingsCloudSaveSlot").count(),1);
   assert.equal(await page.locator("#settingsAccountSlot").count(),1);
   assert.equal(await page.locator("#localResourceCacheStatus").count(),1);
   metrics.viewports.push(viewport);
  }
  // Register the real worker on secure localhost explicitly: the production
  // client intentionally requires HTTPS, which this HTTP test server lacks.
  await page.evaluate(async()=>{await navigator.serviceWorker.register("resource-cache-sw.js",{scope:"./",updateViaCache:"none"});await navigator.serviceWorker.ready;});
  // Validate the controlled subsequent visit, not just installation/claim.
  await page.reload({waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==="ready"&&!!navigator.serviceWorker.controller,null,{timeout:45000});
  const cache=await page.evaluate(async()=>{
   const reg=await navigator.serviceWorker.register("resource-cache-sw.js",{scope:"./",updateViaCache:"none"});
   await navigator.serviceWorker.ready;
   if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener("controllerchange",resolve,{once:true}));
   const send=type=>new Promise((resolve,reject)=>{
    const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error("worker timeout "+type));},60000);
    channel.port1.onmessage=event=>{const data=event.data;if(type==="CIV_CACHE_PRELOAD"&&!['complete','error'].includes(data.phase))return;clearTimeout(timer);channel.port1.close();resolve(data);};
    navigator.serviceWorker.controller.postMessage({type},[channel.port2]);
   });
   const saved=localStorage.getItem("frank_text_rpg_save");
   localStorage.setItem("publish-gm-preference-sentinel","unchanged");
   await send("CIV_CACHE_CLEAR");await send("CIV_CACHE_REFRESH");
   const preload=await send("CIV_CACHE_PRELOAD"),status=await send("CIV_CACHE_STATUS");
   const manifest=await (await fetch("resource-manifest.json",{cache:"no-store"})).json();
   const url=Object.keys(manifest.files).find(x=>x.endsWith("galaxy-theme-loop.ogg"));
   const response=await fetch(url+"?asset="+manifest.files[url],{headers:{Range:"bytes=2-5"}}),body=new Uint8Array(await response.arrayBuffer());
   const range={status:response.status,header:response.headers.get("content-range"),bytes:body.length};
   const clear=await send("CIV_CACHE_CLEAR"),after=await send("CIV_CACHE_STATUS");
   const preserved=saved===localStorage.getItem("frank_text_rpg_save")&&localStorage.getItem("publish-gm-preference-sentinel")==="unchanged";
   localStorage.removeItem("publish-gm-preference-sentinel");await reg.unregister();
   return {preload,status,range,clear,after,preserved};
  });
  metrics.cache=cache;
  // Existing 49 gameplay media + six released player Sprite/attack-atlas assets.
  const formalPlayerSprites=["galaxy","universe","higher"].flatMap(era=>[
   "assets/era-player/v1/era-"+era+".webp",
   "assets/era-player/v1/era-"+era+"-attack-atlas.webp"
  ]);
  const formalMonsterSprites=JSON.parse(fs.readFileSync("data/monsters/monster-assets.json","utf8")).assets.map(a=>a.path);
  assert.equal(formalMonsterSprites.length,33,"21 sealed prototypes plus 12 approved Batch17 prototypes");
  assert.ok(formalMonsterSprites.includes("assets/monsters/v1/void/void-phantom-v01.webp"));
  for(const asset of formalMonsterSprites)assert.ok(manifest.files[asset],"missing formal monster asset: "+asset);
  const expectedCachedMedia=49+formalPlayerSprites.length+formalMonsterSprites.length;
  for(const asset of formalPlayerSprites)assert.ok(manifest.files[asset],"missing formal player asset: "+asset);
  assert.equal(cache.preload.failed,0);assert.equal(cache.preload.total,expectedCachedMedia);
  assert.equal(cache.status.entries,expectedCachedMedia);assert.ok(cache.status.bytes>0);
  assert.equal(cache.range.status,206);assert.equal(cache.range.bytes,4);assert.match(cache.range.header,/^bytes 2-5\/\d+$/);
  assert.equal(cache.clear.ok,true);assert.equal(cache.after.entries,0);assert.equal(cache.preserved,true);
  metrics.cache=cache;assert.deepEqual(metrics.missing,[]);assert.deepEqual(metrics.pageErrors,[]);
  metrics.passed=true;console.log("PASS isolated candidate: all HTTP bytes/digests, 17 audio decodes, desktop/mobile settings, 88 cached media (49 existing + six formal player sprites + 33 formal monster sprites), Range, clear/save isolation");
 }catch(error){metrics.passed=false;metrics.error=String(error.stack||error);throw error;}
 finally{fs.writeFileSync("publish-stage4-browser-report.json",JSON.stringify(metrics,null,2)+"\n");await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
