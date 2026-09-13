(()=>{
 const IMG_CLASS="mobile-battle-bg-img";
 const SRC="assets/bg-battle-mobile.webp?v=20260913-battleimg1";
 function sync(){
  const mobile=window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
  document.querySelectorAll("#main .combat-screen").forEach(screen=>{
   let img=screen.querySelector(`:scope > .${IMG_CLASS}`);
   if(!mobile){if(img)img.remove();return;}
   if(!img){
    img=document.createElement("img");
    img.className=IMG_CLASS;
    img.alt="";
    img.setAttribute("aria-hidden","true");
    img.decoding="async";
    img.src=SRC;
    img.addEventListener("load",()=>screen.setAttribute("data-mobile-battle-img","loaded"),{once:true});
    img.addEventListener("error",()=>screen.setAttribute("data-mobile-battle-img","error"),{once:true});
    screen.insertBefore(img,screen.firstChild);
   }
  });
 }
 function schedule(){requestAnimationFrame(sync)}
 const main=document.getElementById("main");
 if(main)new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
 window.addEventListener("resize",schedule,{passive:true});
 schedule();
})();
