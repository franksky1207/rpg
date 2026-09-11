(function(){
 const BACKGROUND_CREDIT_RATE=.96;
 const INFINITE_BACKGROUND_MAX_MS=12*60*60*1000;
 const nativeSleep=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
 let flow=null;
 let pageHidden=document.visibilityState==="hidden";
 let windowBlurred=typeof document.hasFocus==="function"?!document.hasFocus():false;
 let environmentBackground=pageHidden||windowBlurred;
 const environmentListeners=new Set();
 const pageHideListeners=new Set();

 function now(){return Date.now();}
 function isBackground(){return environmentBackground;}
 function activeFor(kind=null){return !!flow&&(!kind||flow.kind===kind);}
 function hasBackgroundCap(){return !!flow&&flow.maxBackgroundMs!=null&&Number.isFinite(Number(flow.maxBackgroundMs));}
 function mainBattleMode(count,ctx=null){
  const marker=window.INFINITE_BATTLE_COUNT||"infinite";
  if(count===marker||count==="infinite"||ctx?.infinite===true)return "infinite";
  return Number(count)>1?"finite":"single";
 }
 function flowOptions(kind,options={}){
  const mode=String(options?.mode||"");
  const infinite=kind==="main"&&mode==="infinite";
  return {mode:infinite?"infinite":"finite",maxBackgroundMs:infinite?INFINITE_BACKGROUND_MAX_MS:null};
 }
 function configureExistingFlow(kind,options={}){
  if(!flow||flow.kind!==kind)return;
  const next=flowOptions(kind,options);
  if(next.mode==="infinite"&&flow.mode!=="infinite"){
   flow.mode="infinite";
   flow.maxBackgroundMs=INFINITE_BACKGROUND_MAX_MS;
   flow.backgroundElapsedUsed=Math.max(0,Number(flow.backgroundElapsedUsed)||0);
  }
 }
 function remainingBackgroundAllowance(){
  if(!hasBackgroundCap())return Infinity;
  return Math.max(0,Number(flow.maxBackgroundMs)-(Number(flow.backgroundElapsedUsed)||0));
 }
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
  const rawElapsed=Math.max(0,now()-flow.hiddenAt);flow.hiddenAt=null;
  const allowed=Math.min(rawElapsed,remainingBackgroundAllowance());
  if(hasBackgroundCap())flow.backgroundElapsedUsed=(Number(flow.backgroundElapsedUsed)||0)+allowed;
  if(flow.sleeper){
   const used=Math.min(allowed,Math.max(0,flow.sleeper.remaining));
   flow.sleeper.remaining=Math.max(0,flow.sleeper.remaining-used);
   flow.credit+=Math.max(0,allowed-used)*BACKGROUND_CREDIT_RATE;
   if(flow.sleeper.remaining<=0)resolveSleeper();else scheduleSleeper();
  }else flow.credit+=allowed*BACKGROUND_CREDIT_RATE;
 }
 function syncEnvironment(source="unknown"){
  const next=pageHidden||windowBlurred;
  if(next===environmentBackground)return;
  environmentBackground=next;
  if(next)enterBackground();else leaveBackground();
  environmentListeners.forEach(listener=>{try{listener(next,source);}catch(e){console.error(e);}});
 }

 window.backgroundProgressOnEnvironmentChange=function(listener){
  if(typeof listener!=="function")return ()=>{};
  environmentListeners.add(listener);
  return ()=>environmentListeners.delete(listener);
 };
 window.backgroundProgressOnPageHide=function(listener){
  if(typeof listener!=="function")return ()=>{};
  pageHideListeners.add(listener);
  return ()=>pageHideListeners.delete(listener);
 };
 window.backgroundProgressEnvironmentIsBackground=function(){return isBackground();};
 window.backgroundProgressMainBattleMode=mainBattleMode;

 window.backgroundProgressStart=function(kind,options={}){
  const nextKind=String(kind||"");if(!nextKind)return null;
  if(flow&&flow.kind===nextKind){
   configureExistingFlow(nextKind,options);
   return {kind:flow.kind,mode:flow.mode,credit:flow.credit};
  }
  if(flow)window.backgroundProgressStop(flow.kind);
  const config=flowOptions(nextKind,options);
  flow={kind:nextKind,mode:config.mode,maxBackgroundMs:config.maxBackgroundMs,backgroundElapsedUsed:0,credit:0,hiddenAt:null,sleeper:null,instantSkips:0};
  if(isBackground())flow.hiddenAt=now();
  return {kind:flow.kind,mode:flow.mode,credit:0};
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
   flow.hiddenAt=now();
   return new Promise(resolve=>{flow.sleeper={remaining,dueAt:0,timer:null,resolve};});
  }
  return new Promise(resolve=>{
   flow.sleeper={remaining,dueAt:now()+remaining,timer:null,resolve};
   scheduleSleeper();
  });
 };
 window.backgroundProgressSnapshot=function(){
  if(!flow)return null;
  return {kind:flow.kind,mode:flow.mode,credit:Math.max(0,Math.round(flow.credit)),background:isBackground(),waiting:!!flow.sleeper,backgroundElapsedUsed:Math.max(0,Math.round(Number(flow.backgroundElapsedUsed)||0)),backgroundMax:hasBackgroundCap()?Number(flow.maxBackgroundMs):null};
 };

 document.addEventListener("visibilitychange",()=>{pageHidden=document.visibilityState==="hidden";syncEnvironment("visibilitychange");});
 window.addEventListener("blur",()=>{windowBlurred=true;syncEnvironment("blur");});
 window.addEventListener("focus",()=>{windowBlurred=false;pageHidden=document.visibilityState==="hidden";syncEnvironment("focus");});
 window.addEventListener("pagehide",()=>{
  pageHidden=true;syncEnvironment("pagehide");
  pageHideListeners.forEach(listener=>{try{listener();}catch(e){console.error(e);}});
 });
 window.addEventListener("pageshow",()=>{pageHidden=document.visibilityState==="hidden";windowBlurred=typeof document.hasFocus==="function"?!document.hasFocus():false;syncEnvironment("pageshow");});

 const baseBeginCombat=typeof window.beginCombat==="function"?window.beginCombat:null;
 if(baseBeginCombat){
  const wrappedBeginCombat=function(count,...args){
   const mode=mainBattleMode(count);
   if(mode!=="single")window.backgroundProgressStart("main",{mode});
   return baseBeginCombat.call(this,count,...args);
  };
  window.beginCombat=wrappedBeginCombat;
  try{beginCombat=wrappedBeginCombat;}catch(e){}
 }

 const baseRunBattles=typeof window.runBattles==="function"?window.runBattles:null;
 if(baseRunBattles){
  const wrappedRunBattles=async function(count,...args){
   const ctx=args[0]&&typeof args[0]==="object"?args[0]:null;
   const mode=mainBattleMode(count,ctx),useBackground=mode!=="single";
   if(useBackground)window.backgroundProgressStart("main",{mode});
   try{return await baseRunBattles.call(this,count,...args);}
   finally{if(useBackground)window.backgroundProgressStop("main");}
  };
  window.runBattles=wrappedRunBattles;
  try{runBattles=wrappedRunBattles;}catch(e){}
 }
})();
