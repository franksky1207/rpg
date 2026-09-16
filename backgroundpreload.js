(function(){
 const BACKGROUND_PATH_TOKEN="/assets/backgrounds/";
 const SOURCE_PATH_TOKEN="/backgrounds-source/";
 const MAX_WAIT_MS=12000;

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
    const image=rule.style?.backgroundImage||"";
    if(!image||!image.includes("url("))return;
    const re=/url\((['"]?)(.*?)\1\)/g;
    let match;
    while((match=re.exec(image))){
     try{
      const url=new URL(match[2],document.baseURI);
      if(url.pathname.includes(BACKGROUND_PATH_TOKEN)&&!url.pathname.includes(SOURCE_PATH_TOKEN))urls.add(url.href);
     }catch(e){}
    }
   });
  }
  Array.from(document.styleSheets).forEach(sheet=>{
   try{collectRules(sheet.cssRules);}catch(e){}
  });
  return Array.from(urls);
 }

 function updateProgress(done,total){
  const text=document.getElementById("backgroundPreloadStatus");
  const bar=document.getElementById("backgroundPreloadBar");
  if(text)text.textContent=total>0?`背景載入中 ${done} / ${total}`:"準備遊戲中…";
  if(bar)bar.style.width=total>0?`${Math.max(0,Math.min(100,done/total*100))}%`:"100%";
 }

 function preloadOne(url){
  return new Promise(resolve=>{
   const image=new Image();
   let settled=false;
   const finish=()=>{if(settled)return;settled=true;resolve();};
   image.onload=finish;
   image.onerror=finish;
   image.decoding="async";
   image.src=url;
   if(image.complete)finish();
  });
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

 window.preloadGameBackgrounds=async function(){
  const urls=collectActiveBackgroundUrls();
  window.BACKGROUND_PRELOAD_URLS=urls.slice();
  updateProgress(0,urls.length);
  let done=0;
  const jobs=urls.map(url=>preloadOne(url).then(()=>{done++;updateProgress(done,urls.length);}));
  const timeout=new Promise(resolve=>setTimeout(resolve,MAX_WAIT_MS));
  await Promise.race([Promise.all(jobs),timeout]);
  signalReadyBeforeReveal();
  revealGame();
  return {total:urls.length,loaded:done};
 };

 Promise.resolve().then(()=>window.preloadGameBackgrounds()).catch(()=>{signalReadyBeforeReveal();revealGame();});
})();