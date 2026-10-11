/* One scene music owner: three era themes, three shared battle themes. */
(function(g){"use strict";
const eraTracks=Object.freeze({galaxy:"era-galaxy-theme",universe:"era-universe-theme",higher:"era-higher-theme"});
const catalog=Object.freeze(Object.fromEntries(Object.entries(eraTracks).map(([era,id])=>[era,Object.freeze({home:[id,null],explore:[id,null],battle:[id,null],boss:[id,null],front:[id,null]})])));
let selected=null,previewing=false,combatLocked=false,exitSequence=0,activeRunId=null,runSerial=0,pendingExit=false,combatViewSettled=false;
function phase(){
 try{const n=Number(g.currentWorldPhase?.(typeof state!=="undefined"?state:null));if(n===3)return "higher";if(n===2)return "universe";if(n===1)return "galaxy";}catch(_){}
 const st=typeof state!=="undefined"?state:null;
 const p=Number(st?.worldPhase??st?.world);
 return p===3?"higher":p===2?"universe":"galaxy";
}
const tiers=Object.freeze({normal:"battle-normal-preview",medium:"battle-medium-preview",high:"battle-high-preview"});
function tierForScene(scene,detail={}){
 const key=String(scene||"").toLowerCase();
 const actualEra=detail.era||phase();
 if(/mirror|void/.test(key))return "medium";
 if(/alternate.*battle|arena(?:fixed|alternate)|higher.*(?:combat|stage|battle)|frontstage/.test(key))return "high";
 if(/calamity/.test(key))return "high";
 if(/arena/.test(key))return actualEra==="higher"?"high":"medium";
 if(/bounty/.test(key))return "normal";
 if(/boss/.test(key))return "medium";
 if(/elite|normal|battle|combat/.test(key))return actualEra==="universe"?"medium":actualEra==="higher"?"high":"normal";
 return detail?.tier||null;
}
function resolve(era,scene,detail={}){
 const actual=eraTracks[era]?era:phase();
 const tier=detail?.combat===true?(detail.tier||tierForScene(scene,{...detail,era:actual})):null;
 return {era:actual,scene:scene||"home",music:tier&&tiers[tier]?tiers[tier]:eraTracks[actual],ambient:null,tier};
}
function auditionOpen(){return !!document.querySelector('[data-gm-section="gm-audio-test"][open]');}
function apply(){
 if(!selected||auditionOpen()||previewing)return false;
 const audio=g.CivilizationAudio;
 audio?.prioritizeEraTheme?.(selected.era);
 if(audio?.isSilent?.()||audio?.settings?.().musicEnabled===false)return false;
 const id=selected.music;
 if(audio?.currentMusicId?.()===id)return audio?.resumeMusic?.()===true;
 return audio?.playMusic?.(id)===true;
}
function setContext(era,scene,{preview=false,combat=false,tier=null}={}){
 if(preview)return previewContext(era,scene);
 // Formal battle owns the music until its settlement exits; UI renders cannot override it.
 if(combatLocked&&selected?.tier)return apply();
 const item=resolve(era,scene,{combat,tier});
 if(combat){combatLocked=true;exitSequence++;}
 if(selected?.music===item.music){selected=item;return apply();}
 selected=item;return apply();
}
function syncView(viewName,subScreen=""){
 const name=String(viewName||"");
 const sub=String(subScreen||"");
 const combat=name==="dungeon-mirror-combat"||name==="dungeon-void-combat"
  ||name==="thirdworld-combat"||name==="third-world-combat"
  ||(name==="adventure"&&(sub==="combat"||sub==="review-combat"));
 const encounter=typeof currentCombatEncounter!=="undefined"?currentCombatEncounter:null;
 const mainKind=phase()==="universe"||encounter?.kind==="boss"?"boss":"battle";
 const mode=name==="dungeon-mirror-combat"?"mirror":name==="dungeon-void-combat"?"void":name==="adventure"&&sub==="combat"?mainKind:name;
 // A combat-looking DOM/view is not an authoritative battle start. The formal
 // combat-start owner is the ONLY entry that may acquire the music lock.
 // Settlement modals leave adventureScreen='combat' until the user closes them.
 if(combatLocked&&selected?.tier)return apply();
 if(combat){
  // Legacy mainline/review routes can enter combat via a view transition.
  // Restore their music only before formal settlement, never behind a result modal.
  if(!combatViewSettled)return setContext(phase(),mode,{combat:true});
  return setContext(phase(),"combat-settled");
 }
 combatViewSettled=false;
 return setContext(phase(),name+(sub?":"+sub:""));
}
function previewContext(era,scene){
 if(typeof state==="undefined"||state?.gm!==true)return false;
 previewing=true;return g.CivilizationAudio?.preview?.(resolve(era,scene).music)===true;
}
function stopPreview(){g.CivilizationAudio?.stopPreview?.();previewing=false;}
function restore(){previewing=false;return apply();}
function stop(){exitSequence++;activeRunId=null;pendingExit=false;selected=null;previewing=false;combatLocked=false;g.CivilizationAudio?.stopBattleSfx?.();g.CivilizationAudio?.stopMusic?.();}
function notify(type,detail={}){
 if(type==="navigation")return syncView(detail.view,detail.subScreen);
 const era=detail.era||phase();
 if(type==="combat-start"){
  g.CivilizationAudio?.warmCombatSfx?.();
  // Existing callers may start each round of a continuous run. Preserve the
  // active score for identical unlabelled rounds; explicit IDs can replace it.
  const requested=detail.runId==null?null:String(detail.runId);
  if(combatLocked&&selected?.tier&&!pendingExit&&(requested===null||requested===activeRunId))return apply();
  const key=detail.mode||detail.scene||detail.kind||((detail.boss||era==="universe")?"boss":"battle");
  const nextTier=detail.tier||tierForScene(key,{...detail,era});
  activeRunId=requested||"legacy-"+(++runSerial);
  pendingExit=false;combatViewSettled=false;combatLocked=false;
  return setContext(era,key,{combat:true,tier:nextTier});
 }
 if(type==="combat-end")return true; // Each completed round is not a run exit.
 if(type==="combat-exit"){
  if(!combatLocked)return false; // Duplicate or late exit: never reacquire.
  if(detail.runId!=null&&String(detail.runId)!==activeRunId)return false;
  const generation=++exitSequence,runAtExit=activeRunId;
  pendingExit=true;
  const release=()=>{
   if(generation!==exitSequence||!combatLocked||activeRunId!==runAtExit)return false;
   g.CivilizationAudio?.stopBattleSfx?.();
   combatLocked=false;activeRunId=null;pendingExit=false;combatViewSettled=true;
   // Read the actual current era at RELEASE, not the era captured at start.
   return setContext(phase(),"combat-settled");
  };
  if(g.isCombatPresentationActive?.()===true){
   let attempts=0;
   const afterAnimation=()=>{
    if(generation!==exitSequence||activeRunId!==runAtExit)return;
    if(g.isCombatPresentationActive?.()===true&&++attempts<300){setTimeout(afterAnimation,50);return;}
    // combat-exit is an authoritative run-end event. A stale presentation
    // marker must not keep battle music playing forever after settlement.
    if(g.isCombatPresentationActive?.()===true)console.warn("[文明戰線] 戰鬥演出未清除；已收到正式退出事件，恢復紀元配樂");
    release();
   };
   setTimeout(afterAnimation,50);return true;
  }
  return release();
 }
 if(type==="explore"||type==="main"||type==="reincarnation"){exitSequence++;combatLocked=false;activeRunId=null;pendingExit=false;return setContext(phase(),type);}
 if(["mirror","void","calamity","arena-fixed","arena-alternate","alternate"].includes(type))return setContext(era,type,{combat:detail.active===true});
 return setContext(era,type||"home",{combat:detail.active===true});
}
document.addEventListener("civilization-audio-unlocked",()=>{if(typeof view!=="undefined")syncView(view,typeof adventureScreen==="string"?adventureScreen:"");restore();});
document.addEventListener("civilization-audio-scene",e=>{if(e.detail?.type)notify(e.detail.type,e.detail);else if(e.detail?.era)setContext(e.detail.era,e.detail.scene);});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!auditionOpen())restore();});
document.addEventListener("civilization-audio-settings-changed",e=>{
 if(e.detail?.key==="musicEnabled"&&g.CivilizationAudio?.settings?.().musicEnabled!==false)restore();
});
new MutationObserver(()=>{if(!g.CivilizationAudio?.isSilent?.()&&!auditionOpen())restore();}).observe(document.body,{attributes:true,attributeFilter:["class"]});
g.CivilizationAudioScenes=Object.freeze({version:7,catalog,phase,resolve,syncView,setContext,previewContext,stopPreview,notify,restore,stop,current:()=>selected?{...selected,combatLocked,activeRunId,pendingExit}:null});
})(window);
