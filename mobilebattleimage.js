(()=>{
 const IMG_CLASS="mobile-battle-bg-img";
 const VERSION="20260913-battleimg3";
 const parts=[1,2,3,4].map(n=>`assets/bg-battle-mobile-final-${String(n).padStart(2,"0")}.b64?v=${VERSION}`);
 let src="";
 let loading=false;
 function mobile(){return !!(window.matchMedia&&window.matchMedia("(max-width:760px)").matches)}
 function ensureSource(){
  if(src||loading)return;
  loading=true;
  Promise.all(parts.map(url=>fetch(url,{cache:"no-store"}).then(r=>{
   if(!r.ok)throw new Error(`mobile battle background asset ${r.status}`);
   return r.text();
  }))).then(chunks=>{
   const data=chunks.join("").replace(/\s+/g,"");
   const candidate=`data:image/webp;base64,${data}`;
   const probe=new Image();
   probe.onload=()=>{src=candidate;sync()};
   probe.onerror=()=>console.warn("Mobile battle background decode failed");
   probe.src=candidate;
  }).catch(err=>console.warn("Mobile battle background failed to load",err)).finally(()=>{loading=false});
 }
 function sync(){
  if(!mobile()){
   document.querySelectorAll(`#main .${IMG_CLASS}`).forEach(img=>img.remove());
   return;
  }
  ensureSource();
  if(!src)return;
  document.querySelectorAll("#main .combat-screen").forEach(screen=>{
   let img=screen.querySelector(`:scope > .${IMG_CLASS}`);
   if(!img){
    img=document.createElement("img");
    img.className=IMG_CLASS;
    img.alt="";
    img.setAttribute("aria-hidden","true");
    img.decoding="async";
    img.addEventListener("load",()=>screen.setAttribute("data-mobile-battle-img","loaded"),{once:true});
    img.addEventListener("error",()=>screen.setAttribute("data-mobile-battle-img","error"),{once:true});
    screen.insertBefore(img,screen.firstChild);
   }
   if(img.src!==src)img.src=src;
  });
 }
 function schedule(){requestAnimationFrame(sync)}
 const main=document.getElementById("main");
 if(main)new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
 window.addEventListener("resize",schedule,{passive:true});
 ensureSource();
 schedule();
})();
