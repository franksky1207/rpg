/* Simplified era music director. Three local themes only; battles use the era
   theme until the three shared battle tracks are selected. No legacy sounds. */
(function(g){"use strict";
const eraTracks=Object.freeze({galaxy:"era-galaxy-theme",universe:"era-universe-theme",higher:"era-higher-theme"});
const catalog=Object.freeze(Object.fromEntries(Object.entries(eraTracks).map(([era,id])=>[era,Object.freeze({home:[id,null],explore:[id,null],battle:[id,null],boss:[id,null],front:[id,null]})])));
let selected=null,previewing=false,lastCombatView=null;
function phase(){
 try{const n=Number(g.currentWorldPhase?.(typeof state!=="undefined"?state:null));if(n===3)return "higher";if(n===2)return "universe";if(n===1)return "galaxy";}catch(_){}
 const st=typeof state!=="undefined"?state:null;
 const p=Number(st?.worldPhase??st?.world);
 return p===3?"higher":p===2?"universe":"galaxy";
}
const tiers=Object.freeze({normal:"battle-normal-preview",medium:"battle-medium-preview",high:"battle-high-preview"});
function tierForScene(scene,detail={}){
 const key=String(scene||"").toLowerCase();
 if(/mirror|void/.test(key))return "medium";
 if(/alternate.*battle|arena(?:fixed|alternate)|higher.*(?:combat|stage|battle)|frontstage/.test(key))return "high";
 if(/calamity/.test(key))return "high";
 if(/arena/.test(key))return phase()==="higher"?"high":"medium";
 if(/bounty/.test(key))return "normal";
 if(/boss/.test(key))return "medium";
 if(/elite|normal|battle|combat/.test(key))return phase()==="universe"?"medium":phase()==="higher"?"high":"normal";
 return detail?.tier||null;
}
function resolve(era,scene,detail={}){
 const actual=eraTracks[era]?era:phase();
 const tier=detail?.combat===true?(detail.tier||tierForScene(scene,detail)):null;
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
 const item=resolve(era,scene,{combat,tier});
 if(combat&&typeof view==="string")lastCombatView=view;
 else if(!combat)lastCombatView=null;
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
 if(combat)return setContext(phase(),mode,{combat:true});
 // Re-renders during an active dungeon run must not restart the music.
 if(selected?.tier&&selected.scene===mode)return apply();
 if(selected?.tier&&name===lastCombatView)return apply();
 return setContext(phase(),name+(sub?":"+sub:""));
}
function previewContext(era,scene){
 if(typeof state==="undefined"||state?.gm!==true)return false;
 previewing=true;return g.CivilizationAudio?.preview?.(resolve(era,scene).music)===true;
}
function stopPreview(){g.CivilizationAudio?.stopPreview?.();previewing=false;}
function restore(){previewing=false;return apply();}
function stop(){selected=null;previewing=false;g.CivilizationAudio?.stopMusic?.();}
function notify(type,detail={}){
 if(type==="navigation")return syncView(detail.view,detail.subScreen);
 const era=detail.era||phase();
 if(type==="combat-start"){
  const key=detail.mode||detail.scene||detail.kind||((detail.boss||era==="universe")?"boss":"battle");
  return setContext(era,key,{combat:true,tier:detail.tier||tierForScene(key,detail)});
 }
 if(type==="combat-end")return true; // Settlement, not end of a continuous run.
 if(type==="explore"||type==="main"||type==="reincarnation"||type==="combat-exit")return setContext(era,type);
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
g.CivilizationAudioScenes=Object.freeze({version:6,catalog,phase,resolve,syncView,setContext,previewContext,stopPreview,notify,restore,stop,current:()=>selected?{...selected}:null});
})(window);
