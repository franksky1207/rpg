(function(){
 const VERSION=3;
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
  const text=document.getElementById("backgroundPreloadStatus");
  const bar=document.getElementById("backgroundPreloadBar");
  if(text)text.textContent=total>0?`必要背景載入中 ${done} / ${total}`:"準備遊戲中…";
  if(bar)bar.style.width=total>0?`${Math.max(0,Math.min(100,done/total*100))}%`:"100%";
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

 window.preloadGameBackgrounds=async function(){
  const urls=collectActiveBackgroundUrls();
  const critical=collectCurrentSceneBackgroundUrls(urls);
  const criticalSet=new Set(critical);
  const deferred=urls.filter(url=>!criticalSet.has(url));
  window.BACKGROUND_PRELOAD_URLS=urls.slice();
  window.BACKGROUND_PRELOAD_CRITICAL_URLS=critical.slice();
  window.BACKGROUND_PRELOAD_DEFERRED_URLS=deferred.slice();
  updateProgress(0,critical.length);
  let done=0;
  const jobs=critical.map(url=>preloadOne(url).then(()=>{done++;updateProgress(done,critical.length);}));
  let timedOut=false;
  const timeout=new Promise(resolve=>setTimeout(()=>{timedOut=true;resolve();},CRITICAL_MAX_WAIT_MS));
  await Promise.race([Promise.all(jobs),timeout]);
  await waitForDomReady();
  window.BACKGROUND_PRELOAD_REPORT={version:VERSION,total:urls.length,criticalTotal:critical.length,criticalLoaded:done,criticalTimedOut:timedOut,deferredTotal:deferred.length,deferredLoaded:0,deferredComplete:deferred.length===0};
  signalReadyBeforeReveal();
  revealGame();
  scheduleDeferredPreload(deferred);
  return {...window.BACKGROUND_PRELOAD_REPORT};
 };

 window.BACKGROUND_PRELOAD_POLICY_VERSION=VERSION;
 window.BACKGROUND_PRELOAD_CRITICAL_MAX_WAIT_MS=CRITICAL_MAX_WAIT_MS;
 window.BACKGROUND_PRELOAD_DEFERRED_CONCURRENCY=DEFERRED_CONCURRENCY;
 Promise.resolve().then(()=>window.preloadGameBackgrounds()).catch(async()=>{await waitForDomReady();signalReadyBeforeReveal();revealGame();});
})();