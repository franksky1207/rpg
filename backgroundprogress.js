(function(){
 const BACKGROUND_CREDIT_RATE=.96;
 const nativeSleep=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
 let flow=null;
 let pageHidden=document.visibilityState==="hidden";
 let windowBlurred=typeof document.hasFocus==="function"?!document.hasFocus():false;

 function now(){return Date.now();}
 function isBackground(){return pageHidden||windowBlurred;}
 function activeFor(kind=null){return !!flow&&(!kind||flow.kind===kind);}
 function clearSleeperTimer(){if(flow?.sleeper?.timer){clearTimeout(flow.sleeper.timer);flow.sleeper.timer=null;}}
 function resolveSleeper(){
  if(!flow?.sleeper)return;
  const sleeper=flow.sleeper;flow.sleeper=null;
  if(typeof sleeper.resolve==="function")sleeper.resolve();
 }
 function scheduleSleeper(){
  if(!flow?.sleeper||isBackground())return;
  const sleeper=flow.sleeper;
  if(sleeper.remaining<=0){resolveSleeper();return;}
  sleeper.dueAt=now()+sleeper.remaining;
  sleeper.timer=setTimeout(()=>{
   if(!flow||flow.sleeper!==sleeper)return;
   sleeper.timer=null;sleeper.remaining=0;resolveSleeper();
  },sleeper.remaining);
 }
 function enterBackground(){
  if(!flow||flow.hiddenAt!=null)return;
  const t=now();flow.hiddenAt=t;
  if(flow.sleeper){
   clearSleeperTimer();
   if(flow.sleeper.dueAt)flow.sleeper.remaining=Math.max(0,flow.sleeper.dueAt-t);
  }
 }
 function leaveBackground(){
  if(!flow||flow.hiddenAt==null)return;
  const elapsed=Math.max(0,now()-flow.hiddenAt);flow.hiddenAt=null;
  if(flow.sleeper){
   const used=Math.min(elapsed,Math.max(0,flow.sleeper.remaining));
   flow.sleeper.remaining=Math.max(0,flow.sleeper.remaining-used);
   flow.credit+=Math.max(0,elapsed-used)*BACKGROUND_CREDIT_RATE;
   if(flow.sleeper.remaining<=0)resolveSleeper();else scheduleSleeper();
  }else flow.credit+=elapsed*BACKGROUND_CREDIT_RATE;
 }
 function syncBackgroundState(){if(isBackground())enterBackground();else leaveBackground();}

 window.backgroundProgressStart=function(kind){
  const nextKind=String(kind||"");if(!nextKind)return null;
  if(flow&&flow.kind===nextKind)return {kind:flow.kind,credit:flow.credit};
  if(flow)window.backgroundProgressStop(flow.kind);
  flow={kind:nextKind,credit:0,hiddenAt:null,sleeper:null,instantSkips:0};
  if(isBackground())flow.hiddenAt=now();
  return {kind:flow.kind,credit:0};
 };
 window.backgroundProgressStop=function(kind=null){
  if(!flow||kind&&flow.kind!==kind)return false;
  clearSleeperTimer();
  const sleeper=flow.sleeper;flow=null;
  if(sleeper&&typeof sleeper.resolve==="function")sleeper.resolve();
  return true;
 };
 window.backgroundProgressIsActive=function(kind=null){return activeFor(kind);};
 window.backgroundProgressSleep=async function(ms,kind=null){
  let remaining=Math.max(0,Number(ms)||0);
  if(!activeFor(kind))return nativeSleep(remaining);
  if(flow.hiddenAt==null&&!isBackground()&&flow.credit>0&&remaining>0){
   const used=Math.min(flow.credit,remaining);flow.credit-=used;remaining-=used;
  }
  if(remaining<=0){
   flow.instantSkips=(flow.instantSkips||0)+1;
   if(flow.instantSkips%24===0)return nativeSleep(0);
   return;
  }
  flow.instantSkips=0;
  if(isBackground()){
   // 背景中若剛好進到下一個等待點，從這個等待點重新計時；不把同步運算時間當成可跳過動畫的額度。
   flow.hiddenAt=now();
   return new Promise(resolve=>{flow.sleeper={remaining,dueAt:0,timer:null,resolve};});
  }
  return new Promise(resolve=>{
   flow.sleeper={remaining,dueAt:now()+remaining,timer:null,resolve};
   scheduleSleeper();
  });
 };
 window.backgroundProgressSnapshot=function(){return flow?{kind:flow.kind,credit:Math.max(0,Math.round(flow.credit)),background:isBackground(),waiting:!!flow.sleeper}:null;};

 document.addEventListener("visibilitychange",()=>{pageHidden=document.visibilityState==="hidden";syncBackgroundState();});
 window.addEventListener("blur",()=>{windowBlurred=true;syncBackgroundState();});
 window.addEventListener("focus",()=>{windowBlurred=false;pageHidden=document.visibilityState==="hidden";syncBackgroundState();});
 window.addEventListener("pagehide",()=>{pageHidden=true;syncBackgroundState();});
 window.addEventListener("pageshow",()=>{pageHidden=document.visibilityState==="hidden";windowBlurred=typeof document.hasFocus==="function"?!document.hasFocus():false;syncBackgroundState();});

 const baseBeginCombat=typeof window.beginCombat==="function"?window.beginCombat:null;
 if(baseBeginCombat){
  const wrappedBeginCombat=function(count,...args){
   if(Number(count)>1)window.backgroundProgressStart("main");
   return baseBeginCombat.call(this,count,...args);
  };
  window.beginCombat=wrappedBeginCombat;
  try{beginCombat=wrappedBeginCombat;}catch(e){}
 }

 const baseRunBattles=typeof window.runBattles==="function"?window.runBattles:null;
 if(baseRunBattles){
  const wrappedRunBattles=async function(count,...args){
   const useBackground=Number(count)>1;
   if(useBackground)window.backgroundProgressStart("main");
   try{return await baseRunBattles.call(this,count,...args);}
   finally{if(useBackground)window.backgroundProgressStop("main");}
  };
  window.runBattles=wrappedRunBattles;
  try{runBattles=wrappedRunBattles;}catch(e){}
 }
})();
