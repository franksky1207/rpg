/* One scene music owner: three era themes, three shared battle themes. */
(function(g){"use strict";
const eraTracks=Object.freeze({galaxy:"era-galaxy-theme",universe:"era-universe-theme",higher:"era-higher-theme"});
const catalog=Object.freeze(Object.fromEntries(Object.entries(eraTracks).map(([era,id])=>[era,Object.freeze({home:[id,null],explore:[id,null],battle:[id,null],boss:[id,null],front:[id,null]})])));
let selected=null,previewing=false,combatLocked=false,activeRunId=null,runSerial=0,pendingExit=false,lifecycle="IDLE";
function phase(){
 try{const n=Number(g.currentWorldPhase?.(typeof state!=="undefined"?state:null));if(n===3)return "higher";if(n===2)return "universe";if(n===1)return "galaxy";}catch(_){}
 const st=typeof state!=="undefined"?state:null;
 const p=Number(st?.worldPhase??st?.world);
 return p===3?"higher":p===2?"universe":"galaxy";
}
function sceneEra(){
 const actual=phase();
 if(typeof view!=="undefined"&&view==="adventure"){
  const visible=g.getAdventureEraView?.();
  if(visible==="galaxy-review")return "galaxy";
  if(visible==="universe-review"||visible==="universe")return "universe";
 }
 if(typeof view!=="undefined"&&view==="calamity"&&actual!=="galaxy"){
  return g.getCivilizationCalamityEraView?.()==="galaxy-review"?"galaxy":"universe";
 }
 return actual;
}
const tiers=Object.freeze({normal:"battle-normal-preview",medium:"battle-medium-preview",high:"battle-high-preview"});
function tierForScene(scene,detail={}){
 const era=detail.era||phase();
 const mapping={normal:"normal",elite:"normal",boss:"medium",bounty:"normal",mirror:"medium",void:"medium",calamity:"high","higher-stage":"high","arena-fixed":"high","arena-alternate":"high",alternateBattle:"high"};
 if(scene==="arena")return era==="higher"?"high":"medium";
 if(scene==="battle"||scene==="combat")return era==="higher"?"high":era==="universe"?"medium":"normal";
 return detail.tier||mapping[scene]||null;
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
function selectContext(era,scene,{preview=false,combat=false,tier=null}={}){
 if(preview)return previewContext(era,scene);
 // Formal battle owns the music until its settlement exits; UI renders cannot override it.
 if(combatLocked&&selected?.tier)return apply();
 const item=resolve(era,scene,{combat,tier});
 if(combat){combatLocked=true;}
 if(selected?.music===item.music){selected=item;return apply();}
 selected=item;return apply();
}
function setContext(era,scene,{preview=false}={}){
 return preview?previewContext(era,scene):selectContext(era,scene);
}
function syncView(viewName,subScreen=""){
 // Rendering, result DOM, unlocking and returning from hidden state never start a run.
 if(combatLocked)return apply();
 return setContext(sceneEra(),String(viewName||"home")+(subScreen?":"+subScreen:""));
}
function previewContext(era,scene){
 if(typeof state==="undefined"||state?.gm!==true)return false;
 previewing=true;return g.CivilizationAudio?.preview?.(resolve(era,scene).music)===true;
}
function stopPreview(){g.CivilizationAudio?.stopPreview?.();previewing=false;}
function restore(){previewing=false;return apply();}
function stop(){activeRunId=null;pendingExit=false;lifecycle="IDLE";selected=null;previewing=false;combatLocked=false;g.CivilizationAudio?.stopBattleSfx?.();g.CivilizationAudio?.stopMusic?.();}
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
  pendingExit=false;lifecycle="COMBAT";combatLocked=false;
  return selectContext(era,key,{combat:true,tier:nextTier});
 }
 if(type==="combat-end"||type==="presentation-end")return true; // Each completed round is not a run exit.
 if(type==="combat-exit"){
  if(!combatLocked)return false; // Duplicate or late exit: never reacquire.
  if(detail.runId==null||String(detail.runId)!==activeRunId)return false;
  // Formal settlement owns exit. Presentation markers cannot delay it.
  lifecycle="SETTLING";pendingExit=true;
  g.CivilizationAudio?.stopBattleSfx?.();
  combatLocked=false;activeRunId=null;pendingExit=false;
  lifecycle="IDLE";
  return setContext(detail.returnEra||sceneEra(),"combat-settled");
 }
 if(type==="explore"||type==="main")return syncView(type);
 if(type==="reincarnation"){combatLocked=false;activeRunId=null;pendingExit=false;lifecycle="IDLE";return setContext(phase(),type);}
 if(["mirror","void","calamity","arena-fixed","arena-alternate","alternate"].includes(type))return setContext(era,type);
 return setContext(era,type||"home");
}
document.addEventListener("civilization-audio-unlocked",()=>{if(typeof view!=="undefined")syncView(view,typeof adventureScreen==="string"?adventureScreen:"");restore();});
document.addEventListener("civilization-audio-scene",e=>{if(e.detail?.type)notify(e.detail.type,e.detail);else if(e.detail?.era)setContext(e.detail.era,e.detail.scene);});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!auditionOpen())restore();});
document.addEventListener("civilization-audio-settings-changed",e=>{
 if(["musicEnabled","enabled"].includes(e.detail?.key)&&g.CivilizationAudio?.settings?.().musicEnabled!==false)restore();
});
new MutationObserver(()=>{if(!g.CivilizationAudio?.isSilent?.()&&!auditionOpen())restore();}).observe(document.body,{attributes:true,attributeFilter:["class"]});
function createRunToken(){return "audio-run-"+(++runSerial);}
function startRun(detail={}){
 const runId=detail.runId==null?createRunToken():String(detail.runId);
 notify("combat-start",{...detail,runId});return runId;
}
function endRun(runId,detail={}){
 // Every formal caller holds its token locally; unlabelled callbacks have no authority.
 if(runId==null)return false;
 return notify("combat-exit",{...detail,runId});
}
g.CivilizationAudioScenes=Object.freeze({version:8,catalog,phase,resolve,createRunToken,startRun,endRun,syncView,setContext,previewContext,stopPreview,notify,restore,stop,current:()=>selected?{...selected,combatLocked,activeRunId,pendingExit,lifecycle}:null});
})(window);
