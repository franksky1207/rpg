(function(){
 const BACKGROUND_CREDIT_RATE=.96;
 const CONTINUOUS_BACKGROUND_MAX_MS=12*60*60*1000;
 const nativeSleep=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
 const CATCH_UP_FAST_YIELDS_PER_PAINT=8;
 const FAST_CATCH_UP_POLICY_VERSION=1;
 const FAST_CATCH_UP_UI_INTERVALS=Object.freeze([
  Object.freeze({max:30,interval:5}),
  Object.freeze({max:100,interval:10}),
  Object.freeze({max:500,interval:25}),
  Object.freeze({max:Infinity,interval:50})
 ]);
 const FAST_CATCH_UP_CHECKPOINT_INTERVALS=Object.freeze([
  Object.freeze({max:100,interval:50}),
  Object.freeze({max:500,interval:100}),
  Object.freeze({max:Infinity,interval:200})
 ]);
 const FAST_CATCH_UP_PRESENTATION_INTERVAL=100;
 function nextPaintBoundary(){
  if(typeof window.requestAnimationFrame!=="function")return nativeSleep(0).then(()=>true);
  return new Promise(resolve=>{
   let settled=false;
   const finish=value=>{if(settled)return;settled=true;resolve(value);};
   const fallback=setTimeout(()=>finish(false),80);
   window.requestAnimationFrame(()=>{clearTimeout(fallback);finish(true);});
  });
 }
 let flow=null;
 let pageHidden=document.visibilityState==="hidden";
 let windowBlurred=typeof document.hasFocus==="function"?!document.hasFocus():false;
 let environmentBackground=pageHidden||windowBlurred;
 const environmentListeners=new Set();
 const pageHideListeners=new Set();

 function now(){return Date.now();}
 function policyInterval(rows,count,fallback){
  const n=Math.max(1,Math.floor(Number(count)||1));
  const row=rows.find(entry=>n<=entry.max);
  return Math.max(1,Math.floor(Number(row?.interval)||fallback));
 }
 function fastCatchUpActive(kind=null){
  return activeFor(kind)&&flow.hiddenAt==null&&!isBackground()&&Number(flow.credit)>0;
 }
 function catchUpUiInterval(count){return policyInterval(FAST_CATCH_UP_UI_INTERVALS,count,50);}
 function catchUpCheckpointInterval(count){return policyInterval(FAST_CATCH_UP_CHECKPOINT_INTERVALS,count,200);}
 function catchUpPolicySnapshot(kind=null,count=null,final=false){
  const active=fastCatchUpActive(kind);
  const completed=count==null?Math.max(0,Math.floor(Number(flow?.catchUpPolicyCount)||0)):Math.max(0,Math.floor(Number(count)||0));
  const basis=Math.max(1,completed||1);
  const uiInterval=catchUpUiInterval(basis);
  const checkpointInterval=catchUpCheckpointInterval(basis);
  const presentationInterval=FAST_CATCH_UP_PRESENTATION_INTERVAL;
  const forceFinal=final===true;
  return {
   version:FAST_CATCH_UP_POLICY_VERSION,
   kind:flow?.kind||null,
   active,
   completed,
   uiInterval,
   checkpointInterval,
   presentationInterval,
   shouldRefreshUi:active&&(forceFinal||completed>0&&completed%uiInterval===0),
   shouldCheckpoint:active&&(forceFinal||completed>0&&completed%checkpointInterval===0),
   shouldPresentBattle:active&&!forceFinal&&completed>0&&completed%presentationInterval===0,
   final:forceFinal
  };
 }
 function isBackground(){return environmentBackground;}
 function activeFor(kind=null){return !!flow&&(!kind||flow.kind===kind);}
 function hasBackgroundCap(){return !!flow&&flow.maxBackgroundMs!=null&&Number.isFinite(Number(flow.maxBackgroundMs));}
 function flowOptions(kind,options={}){
  const mode=String(options?.mode||"");
  const continuous=mode==="continuous";
  return {mode:continuous?"continuous":"finite",maxBackgroundMs:continuous?CONTINUOUS_BACKGROUND_MAX_MS:null};
 }
 function configureExistingFlow(kind,options={}){
  if(!flow||flow.kind!==kind)return;
  const next=flowOptions(kind,options);
  if(next.mode==="continuous"&&flow.mode!=="continuous"){
   flow.mode="continuous";
   flow.maxBackgroundMs=CONTINUOUS_BACKGROUND_MAX_MS;
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
  const t=now();flow.hiddenAt=t;flow.catchUpPolicyCount=0;
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
 window.backgroundProgressHasCatchUpCredit=function(kind=null){return fastCatchUpActive(kind);};
 window.backgroundProgressFastCatchUpActive=fastCatchUpActive;
 window.backgroundProgressCatchUpUiInterval=catchUpUiInterval;
 window.backgroundProgressCatchUpCheckpointInterval=catchUpCheckpointInterval;
 window.backgroundProgressCatchUpPolicy=function(kind=null,count=null,final=false){return catchUpPolicySnapshot(kind,count,final);};
 window.backgroundProgressCatchUpStep=function(kind=null){
  if(!fastCatchUpActive(kind))return catchUpPolicySnapshot(kind,0,false);
  flow.catchUpPolicyCount=Math.max(0,Math.floor(Number(flow.catchUpPolicyCount)||0))+1;
  return catchUpPolicySnapshot(kind,flow.catchUpPolicyCount,false);
 };
 window.backgroundProgressCatchUpFinalPolicy=function(kind=null){return catchUpPolicySnapshot(kind,null,true);};
 window.BACKGROUND_PROGRESS_CORE_VERSION=1;
 window.BACKGROUND_PROGRESS_SINGLE_ACTIVE_FLOW_VERSION=1;
 window.BACKGROUND_PROGRESS_VISIBILITY_OWNER_VERSION=3;
 window.BACKGROUND_PROGRESS_UI_YIELD_VERSION=3;
 window.BACKGROUND_PROGRESS_FAST_CATCH_UP_VERSION=1;
 window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION=FAST_CATCH_UP_POLICY_VERSION;
 window.BACKGROUND_PROGRESS_FAST_CATCH_UP_UI_INTERVALS=FAST_CATCH_UP_UI_INTERVALS.map(row=>({max:row.max,interval:row.interval}));
 window.BACKGROUND_PROGRESS_FAST_CATCH_UP_CHECKPOINT_INTERVALS=FAST_CATCH_UP_CHECKPOINT_INTERVALS.map(row=>({max:row.max,interval:row.interval}));
 window.BACKGROUND_PROGRESS_FAST_CATCH_UP_PRESENTATION_INTERVAL=FAST_CATCH_UP_PRESENTATION_INTERVAL;
 window.BACKGROUND_PROGRESS_FAST_YIELDS_PER_PAINT=CATCH_UP_FAST_YIELDS_PER_PAINT;

 window.backgroundProgressStart=function(kind,options={}){
  const nextKind=String(kind||"");if(!nextKind)return null;
  if(flow&&flow.kind===nextKind){
   configureExistingFlow(nextKind,options);
   return {kind:flow.kind,mode:flow.mode,credit:flow.credit};
  }
  if(flow)window.backgroundProgressStop(flow.kind);
  const config=flowOptions(nextKind,options);
  flow={kind:nextKind,mode:config.mode,maxBackgroundMs:config.maxBackgroundMs,backgroundElapsedUsed:0,credit:0,hiddenAt:null,sleeper:null,catchUpYieldCount:0,catchUpPolicyCount:0};
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
 window.backgroundProgressActiveKind=function(){return flow?.kind||null;};
 window.backgroundProgressSleep=async function(ms,kind=null){
  let remaining=Math.max(0,Number(ms)||0);
  if(!activeFor(kind))return nativeSleep(remaining);
  if(flow.hiddenAt==null&&!isBackground()&&flow.credit>0&&remaining>0){
   const used=Math.min(flow.credit,remaining);flow.credit-=used;remaining-=used;
  }
  if(remaining<=0)return nativeSleep(0);
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
  return {kind:flow.kind,mode:flow.mode,credit:Math.max(0,Math.round(flow.credit)),background:isBackground(),waiting:!!flow.sleeper,backgroundElapsedUsed:Math.max(0,Math.round(Number(flow.backgroundElapsedUsed)||0)),backgroundMax:hasBackgroundCap()?Number(flow.maxBackgroundMs):null,catchUpPolicyCount:Math.max(0,Math.floor(Number(flow.catchUpPolicyCount)||0)),fastCatchUp:fastCatchUpActive(flow.kind)};
 };
 window.backgroundProgressUiYield=function(kind=null){
  if(!activeFor(kind)||isBackground()||Number(flow.credit)<=0)return Promise.resolve(false);
  flow.catchUpYieldCount=Math.max(0,Math.floor(Number(flow.catchUpYieldCount)||0))+1;
  if(flow.catchUpYieldCount%CATCH_UP_FAST_YIELDS_PER_PAINT===0)return nextPaintBoundary();
  return nativeSleep(0).then(()=>true);
 };

 window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_INTEGRITY=(function(){
  const errors=[];
  const expected=[[1,5],[30,5],[31,10],[100,10],[101,25],[500,25],[501,50],[5000,50]];
  expected.forEach(([count,interval])=>{if(catchUpUiInterval(count)!==interval)errors.push({code:"UI_INTERVAL",count,actual:catchUpUiInterval(count),expected:interval});});
  if(catchUpCheckpointInterval(1)!==50||catchUpCheckpointInterval(100)!==50||catchUpCheckpointInterval(101)!==100||catchUpCheckpointInterval(500)!==100||catchUpCheckpointInterval(501)!==200)errors.push({code:"CHECKPOINT_INTERVAL"});
  if(FAST_CATCH_UP_PRESENTATION_INTERVAL!==100)errors.push({code:"PRESENTATION_INTERVAL"});
  return {passed:errors.length===0,version:FAST_CATCH_UP_POLICY_VERSION,errors};
 })();

 document.addEventListener("visibilitychange",()=>{pageHidden=document.visibilityState==="hidden";syncEnvironment("visibilitychange");});
 window.addEventListener("blur",()=>{windowBlurred=true;syncEnvironment("blur");});
 window.addEventListener("focus",()=>{windowBlurred=false;pageHidden=document.visibilityState==="hidden";syncEnvironment("focus");});
 window.addEventListener("pagehide",()=>{
  pageHidden=true;syncEnvironment("pagehide");
  pageHideListeners.forEach(listener=>{try{listener();}catch(e){console.error(e);}});
 });
 window.addEventListener("pageshow",()=>{pageHidden=document.visibilityState==="hidden";windowBlurred=typeof document.hasFocus==="function"?!document.hasFocus():false;syncEnvironment("pageshow");});

})();