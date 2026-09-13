(()=>{
 const IMG_CLASS="mobile-battle-bg-img";
 function mobile(){return !!(window.matchMedia&&window.matchMedia("(max-width:760px)").matches)}
 function extractDataUri(screen){
  const inline=screen.style.getPropertyValue("background-image")||"";
  const match=inline.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/);
  return match?match[0]:"";
 }
 function sync(){
  document.querySelectorAll("#main .combat-screen").forEach(screen=>{
   let img=screen.querySelector(`:scope > .${IMG_CLASS}`);
   if(!mobile()){if(img)img.remove();return;}
   const src=extractDataUri(screen);
   if(!src){
    if(img)img.remove();
    requestAnimationFrame(()=>setTimeout(sync,0));
    return;
   }
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
 function schedule(){requestAnimationFrame(()=>setTimeout(sync,0))}
 const main=document.getElementById("main");
 if(main)new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
 window.addEventListener("resize",schedule,{passive:true});
 schedule();
})();
