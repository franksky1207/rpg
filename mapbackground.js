(()=>{
 function loadBackground(parts,varName,label){
  return Promise.all(parts.map(url=>fetch(url,{cache:"force-cache"}).then(r=>{
   if(!r.ok)throw new Error(`${label} background asset ${r.status}`);
   return r.text();
  }))).then(chunks=>new Promise((resolve,reject)=>{
   const data=chunks.join("").replace(/\s+/g,"");
   const src=`data:image/webp;base64,${data}`;
   const probe=new Image();
   probe.onload=()=>{
    document.documentElement.style.setProperty(varName,`url("${src}")`);
    resolve();
   };
   probe.onerror=()=>reject(new Error(`${label} background decode failed`));
   probe.src=src;
  }));
 }

 const version="20260913-mapbg-mobile1";
 const desktopParts=Array.from({length:6},(_,i)=>`assets/bg-map-reupload-${String(i+1).padStart(2,"0")}.b64?v=${version}`);
 const mobileParts=[
  `assets/bg-map-mobile-01.b64?v=${version}`,
  `assets/bg-map-mobile-02.b64?v=${version}`,
  `assets/bg-map-mobile-03.b64?v=${version}`,
  `assets/bg-map-mobile-04.b64?v=${version}`,
  `assets/bg-map-mobile-05.b64?v=${version}`,
  `assets/bg-map-mobile-06.b64?v=${version}`,
  `assets/bg-map-mobile-07a.b64?v=${version}`,
  `assets/bg-map-mobile-07b.b64?v=${version}`,
  `assets/bg-map-mobile-08a.b64?v=${version}`,
  `assets/bg-map-mobile-08b.b64?v=${version}`,
  `assets/bg-map-mobile-09a.b64?v=${version}`,
  `assets/bg-map-mobile-09b.b64?v=${version}`,
  `assets/bg-map-mobile-10a.b64?v=${version}`,
  `assets/bg-map-mobile-10b.b64?v=${version}`
 ];
 let desktopReady=false;
 let mobileReady=false;

 function sync(){
  const mobile=!!(window.matchMedia&&window.matchMedia("(max-width:760px)").matches);
  const ready=mobile?mobileReady:desktopReady;
  const active=ready&&!!document.querySelector("#main .map-screen");
  document.body.classList.toggle("map-background-active",active);
 }

 loadBackground(desktopParts,"--map-bg-image","Desktop adventure map")
  .then(()=>{desktopReady=true;sync()})
  .catch(err=>console.warn("Desktop adventure map background failed to load",err));
 loadBackground(mobileParts,"--map-mobile-bg-image","Mobile adventure map")
  .then(()=>{mobileReady=true;sync()})
  .catch(err=>console.warn("Mobile adventure map background failed to load",err));

 const main=document.getElementById("main");
 if(main)new MutationObserver(sync).observe(main,{childList:true,subtree:true});
 window.addEventListener("resize",sync,{passive:true});
 sync();
})();
