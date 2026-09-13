(()=>{
 const mq=window.matchMedia("(min-width:761px)");
 function sync(){
  const active=mq.matches&&!!document.querySelector("#main .prepare-screen");
  document.body.classList.toggle("prepare-background-active",active);
 }
 const main=document.getElementById("main");
 if(main)new MutationObserver(sync).observe(main,{childList:true,subtree:true});
 if(mq.addEventListener)mq.addEventListener("change",sync);
 else if(mq.addListener)mq.addListener(sync);
 sync();
})();
