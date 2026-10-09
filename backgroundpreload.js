(function(){
 const VERSION=4;
 const startupTasks=new Map();let running=null,finished=false,lastFailure=null,startupAttempt=0;
 function registerStartupTask(id,run){if(running||finished||typeof run!=="function"||!id||startupTasks.has(id))return false;startupTasks.set(id,run);return true;}
 function startupSnapshot(){return Object.freeze({version:VERSION,status:finished?"ready":lastFailure?"failed":running?"loading":"pending",tasks:startupTasks.size,failed:!!lastFailure});}
 const BACKGROUND_PATH_TOKEN="/assets/backgrounds/";
 const SOURCE_PATH_TOKEN="/backgrounds-source/";
 const CRITICAL_MAX_WAIT_MS=4500;
 const DEFERRED_IDLE_TIMEOUT_MS=1500;
 const DEFERRED_START_DELAY_MS=350;
 const DEFERRED_CONCURRENCY=2;

 function isFormalBackgroundUrl(raw){
  try{
   const url=new URL(raw,document.baseURI);
   return url.pathname.includes(BACKGROUND_PATH_TOKEN)&&!url.pathname.includes(SOURCE_PATH_TOKEN);
  }catch(e){return false;}
 }
 function extractUrls(imageValue){
  const urls=[];
  const image=String(imageValue||"");
  if(!image.includes("url("))return urls;
  const re=/url\((['"]?)(.*?)\1\)/g;
  let match;
  while((match=re.exec(image))){
   try{
    const url=new URL(match[2],document.baseURI);
    if(isFormalBackgroundUrl(url.href))urls.push(url.href);
   }catch(e){}
  }
  return urls;
 }
 function collectActiveBackgroundUrls(){
  const urls=new Set();
  function collectRules(rules){
   if(!rules)return;
   Array.from(rules).forEach(rule=>{
    if(rule.type===CSSRule.MEDIA_RULE){
     let active=false;
     try{active=window.matchMedia(rule.conditionText).matches;}catch(e){}
     if(active)collectRules(rule.cssRules);
     return;
    }
    extractUrls(rule.style?.backgroundImage).forEach(url=>urls.add(url));
   });
  }
  Array.from(document.styleSheets).forEach(sheet=>{
   try{collectRules(sheet.cssRules);}catch(e){}
  });
  return Array.from(urls);
 }
 function collectCurrentSceneBackgroundUrls(allUrls){
  const current=new Set();
  const scene=document.querySelector("#main > *");
  if(scene){
   try{extractUrls(getComputedStyle(scene).backgroundImage).forEach(url=>current.add(url));}catch(e){}
  }
  if(!current.size){
   const home=allUrls.find(url=>{
    try{return new URL(url).pathname.includes("/assets/backgrounds/home/");}catch(e){return false;}
   });
   if(home)current.add(home);
  }
  return Array.from(current);
 }
 function updateProgress(done,total){
  const value=total?Math.min(99,Math.floor(done/total*100)):0;
  const text=document.getElementById("backgroundPreloadStatus");
  const bar=document.getElementById("backgroundPreloadBar");
  const percent=document.getElementById("backgroundPreloadPercent");
  if(text)text.textContent="正在載入遊戲資源…";
  if(percent)percent.textContent=value+"%";
  if(bar)bar.style.width=value+"%";
 }
 function showFailure(){
  const status=document.getElementById("backgroundPreloadStatus"),retry=document.getElementById("backgroundPreloadRetry");
  if(status)status.textContent="部分資源載入失敗，請重新嘗試。";
  if(retry)retry.hidden=false;
 }
 function preloadOne(url){
  return new Promise(resolve=>{
   const image=new Image();
   let settled=false;
   const finish=()=>{if(settled)return;settled=true;resolve(url);};
   image.onload=finish;
   image.onerror=finish;
   image.decoding="async";
   image.src=url;
   if(image.complete)finish();
  });
 }
 function waitForDomReady(){
  if(document.readyState!=="loading")return Promise.resolve();
  return new Promise(resolve=>document.addEventListener("DOMContentLoaded",resolve,{once:true}));
 }
 function signalReadyBeforeReveal(){
  window.BACKGROUND_PRELOAD_READY=true;
  try{window.dispatchEvent(new CustomEvent("civilization-background-ready-before-reveal"));}catch(e){}
 }
 function revealGame(){
  document.body.classList.remove("background-preloading");
  document.body.classList.add("background-preload-complete");
  const screen=document.getElementById("backgroundPreloadScreen");
  if(screen){screen.classList.add("done");setTimeout(()=>screen.remove(),220);}
 }
 async function preloadDeferred(urls){
  const queue=Array.isArray(urls)?urls.slice():[];
  let loaded=0;
  async function worker(){
   while(queue.length){
    const url=queue.shift();
    await preloadOne(url);
    loaded++;
    window.BACKGROUND_PRELOAD_DEFERRED_LOADED=loaded;
   }
  }
  await Promise.all(Array.from({length:Math.min(DEFERRED_CONCURRENCY,queue.length)},()=>worker()));
  return loaded;
 }
 function scheduleDeferredPreload(urls){
  if(!urls.length)return;
  const start=()=>{
   window.BACKGROUND_PRELOAD_DEFERRED_STARTED=true;
   preloadDeferred(urls).then(loaded=>{
    window.BACKGROUND_PRELOAD_DEFERRED_COMPLETE=true;
    window.BACKGROUND_PRELOAD_REPORT={...(window.BACKGROUND_PRELOAD_REPORT||{}),deferredLoaded:loaded,deferredComplete:true};
   }).catch(()=>{});
  };
  const schedule=()=>{
   if(typeof window.requestIdleCallback==="function")window.requestIdleCallback(start,{timeout:DEFERRED_IDLE_TIMEOUT_MS});
   else setTimeout(start,0);
  };
  setTimeout(schedule,DEFERRED_START_DELAY_MS);
 }

 async function startStartup(){
  if(running)return running;
  const attempt=++startupAttempt;
  running=(async()=>{
   const retry=document.getElementById("backgroundPreloadRetry");
   if(retry)retry.hidden=true;
   lastFailure=null;
   const urls=collectActiveBackgroundUrls();
   const critical=collectCurrentSceneBackgroundUrls(urls),criticalSet=new Set(critical);
   const deferred=urls.filter(url=>!criticalSet.has(url));
   window.BACKGROUND_PRELOAD_URLS=urls.slice();
   window.BACKGROUND_PRELOAD_CRITICAL_URLS=critical.slice();
   window.BACKGROUND_PRELOAD_DEFERRED_URLS=deferred.slice();
   // Each completed prerequisite contributes one actual step; no timer-driven progress.
   const total=2+critical.length+startupTasks.size;
   let done=0;
   const complete=()=>{done++;if(attempt===startupAttempt)updateProgress(done,total);};
   updateProgress(0,total);
   await waitForDomReady();complete();
   if(!document.getElementById("main")||typeof window.render!=="function")throw new Error("startup-main-not-ready");
   complete();
   let loaded=0,failed=0,timedOut=false;
   const criticalJobs=critical.map(url=>new Promise(resolve=>{
    const image=new Image();let settled=false;
    const finish=ok=>{if(settled)return;settled=true;loaded+=ok?1:0;failed+=ok?0:1;complete();resolve();};
    image.onload=()=>finish(true);
    image.onerror=()=>finish(false);
    image.decoding="async";image.src=url;
    if(image.complete&&image.naturalWidth>0)finish(true);
   }));
   // A timeout is a failure, never false readiness. Clear the timer after success.
   let timeoutId=null;
   const deadline=new Promise((_,reject)=>{
    if(criticalJobs.length)timeoutId=setTimeout(()=>{timedOut=true;reject(new Error("startup-critical-background-timeout"));},CRITICAL_MAX_WAIT_MS);
   });
   try{await Promise.race([Promise.all(criticalJobs),deadline]);}
   finally{if(timeoutId!==null)clearTimeout(timeoutId);}
   if(failed)throw new Error("startup-critical-background-failed");
   for(const [id,run] of startupTasks){await run();complete();}
   window.BACKGROUND_PRELOAD_REPORT={version:VERSION,total:urls.length,criticalTotal:critical.length,criticalLoaded:loaded,criticalTimedOut:timedOut,deferredTotal:deferred.length,deferredLoaded:0,deferredComplete:deferred.length===0};
   const bar=document.getElementById("backgroundPreloadBar"),pct=document.getElementById("backgroundPreloadPercent");
   if(bar)bar.style.width="100%";if(pct)pct.textContent="100%";
   signalReadyBeforeReveal();finished=true;revealGame();scheduleDeferredPreload(deferred);
   return {...window.BACKGROUND_PRELOAD_REPORT};
  })().catch(error=>{lastFailure=error;showFailure();throw error;}).finally(()=>{running=null;});
  return running;
 }
 for(const entry of window.CivilizationStartupPreTasks||[]){if(Array.isArray(entry))registerStartupTask(entry[0],entry[1]);}
 window.preloadGameBackgrounds=startStartup;
 window.CivilizationStartupCoordinator=Object.freeze({version:VERSION,register:registerStartupTask,snapshot:startupSnapshot,retry:()=>startStartup()});
 window.BACKGROUND_PRELOAD_POLICY_VERSION=VERSION;
 window.BACKGROUND_PRELOAD_CRITICAL_MAX_WAIT_MS=CRITICAL_MAX_WAIT_MS;
 window.BACKGROUND_PRELOAD_DEFERRED_CONCURRENCY=DEFERRED_CONCURRENCY;
 const retry=document.getElementById("backgroundPreloadRetry");
 if(retry)retry.addEventListener("click",()=>startStartup().catch(()=>{}));
 Promise.resolve().then(()=>startStartup()).catch(()=>{});

})();