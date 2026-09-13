(()=>{
 const mq=window.matchMedia("(min-width:761px)");
 const version="20260913-preparebg-desktop2";
 const localSrc=`assets/bg-prepare-desktop.webp?v=${version}`;
 const fallbackSrc=`https://raw.githubusercontent.com/franksky1207/rpg/main/assets/bg-prepare-desktop.webp?v=${version}`;
 let ready=false;
 let loadedSrc="";
 function sync(){
  const active=mq.matches&&ready&&!!document.querySelector("#main .prepare-screen");
  document.body.classList.toggle("prepare-background-active",active);
 }
 function load(src,fallback){
  const img=new Image();
  img.onload=()=>{
   ready=true;
   loadedSrc=src;
   document.documentElement.style.setProperty("--prepare-bg-image",`url("${src}")`);
   sync();
  };
  img.onerror=()=>{
   if(fallback)load(fallback,"");
   else console.warn("Desktop prepare background failed to load");
  };
  img.src=src;
 }
 const main=document.getElementById("main");
 if(main)new MutationObserver(sync).observe(main,{childList:true,subtree:true});
 if(mq.addEventListener)mq.addEventListener("change",sync);
 else if(mq.addListener)mq.addListener(sync);
 if(mq.matches)load(localSrc,fallbackSrc);
 sync();
})();
