/* A03 single scene director: no progress/save writes; same audio core for text and 3D. */
(function(g){"use strict";
const catalog=Object.freeze({
 galaxy:Object.freeze({home:["dark-title",null],explore:["dark-sector","dark-airy"],battle:["galaxy-battle",null],elite:["dark-urgent",null],boss:["boss-orchestra","dark-airy"],calamity:["boss-orchestra","dark-pulse"],review:["dark-pulse",null],arena:["dark-urgent",null],bounty:["galaxy-battle",null],special:["dark-urgent",null],record:[null,null]}),
 universe:Object.freeze({home:["dark-title",null],explore:["dark-pulse","dark-airy"],boss:["boss-orchestra","dark-pulse"],calamity:["boss-orchestra","dark-pulse"],review:["dark-pulse",null],arena:["dark-urgent",null],bounty:["galaxy-battle",null],special:["dark-urgent",null],record:[null,null]}),
 higher:Object.freeze({front:["dark-urgent","dark-airy"],frontStage:["boss-orchestra","dark-airy"],frontReview:["dark-pulse",null],core:[null,null],alternateSelect:["dark-pulse","dark-airy"],alternateBattle:["dark-urgent","dark-airy"],arenaFixed:["dark-urgent",null],arenaAlternate:["dark-pulse",null],record:[null,null]}),
 shared:Object.freeze({main:["dark-title",null],mirror:["boss-orchestra",null],void:["dark-pulse","dark-airy"],victory:["dark-victory",null],defeat:[null,null],reincarnation:["dark-transmission",null],inventory:[null,null],equipment:[null,null],enhance:[null,null],expertise:[null,null],mark:[null,null],civilization:[null,null],character:[null,null],story:[null,null],guide:[null,null],cloud:[null,null],settings:[null,null],account:[null,null],offline:[null,null],shop:[null,null],redeem:[null,null],notice:["dark-hover",null],gm:[null,null]})
});
let selected=null,ambient=null,ambientId=null,activeMusicId=null,returnTimer=null,wasSilent=false,previewAmbient=null;
function phase(){
 try{
  if(typeof g.currentWorldPhase==="function"){const index=Number(g.currentWorldPhase(typeof state!=="undefined"?state:null));if(index===3)return "higher";if(index===2)return "universe";if(index===1)return "galaxy";}
  const raw=typeof state!=="undefined"?state:null;
  const world=Number(raw?.worldPhase??raw?.world??0);
  if(world===3||raw?.thirdWorld?.unlocked===true)return "higher";
  if(world===2||raw?.secondWorld?.unlocked===true)return "universe";
 }catch(_){}
 return "galaxy";
}
function resolve(era,scene){
 const family=catalog[era];if(!family)return null;
 const pair=family[scene];if(!pair)return null;
 const basic=new Set(["home","explore","main","character","inventory","equipment","enhance","expertise","mark","civilization","shop","redeem","story","guide","cloud","settings","account","offline","record","core","alternateSelect","frontReview","review"]);
 if(basic.has(scene)){
  const actualEra=era==="shared"?phase():era;
  const theme=({galaxy:"era-galaxy-theme",universe:"era-universe-theme",higher:"era-higher-theme"})[actualEra];
  return {era,scene,music:theme||null,ambient:null};
 }
 return {era,scene,music:pair[0],ambient:pair[1]};
}
function prohibited(){return !!g.CivilizationAudio?.isSilent?.();}
function ambientVolume(preview=false){if(preview)return g.CivilizationAudio?.previewGain?.("ambient")??0;const p=g.CivilizationAudio?.settings?.();return Math.min(1,Math.max(0,(Number(p?.master)||0)*(Number(p?.ambient??.6)||0)*.75*.55));}
function stopAmbient(){if(ambient){ambient.pause();ambient.removeAttribute("src");ambient.load();ambient=null;}ambientId=null;}
function syncAmbient(id){
 if(!id||prohibited()){stopAmbient();return;}
 if(ambientId===id&&ambient&&!ambient.paused)return;
 stopAmbient();
 const track=g.CivilizationAudio?.tracks?.[id];if(!track)return;
 const el=new Audio(track.url);el.loop=true;el.preload="none";el.volume=ambientVolume();
 ambient=el;ambientId=id;el.play().catch(()=>{if(ambient===el)stopAmbient();});
}
function apply(){
 if(selected?.music?.startsWith("era-"))g.CivilizationAudio?.prioritizeEraTheme?.(selected.era==="shared"?phase():selected.era);
 if(!selected||prohibited()){stopAmbient();if(prohibited())g.CivilizationAudio?.stopMusic?.();return false;}
 if(selected.music!==activeMusicId){g.CivilizationAudio?.stopMusic?.();activeMusicId=selected.music;if(selected.music)g.CivilizationAudio?.playMusic?.(selected.music);}
 syncAmbient(selected.ambient);return true;
}
function stopPreview(){
 if(previewAmbient){previewAmbient.pause();previewAmbient.removeAttribute("src");previewAmbient.load();previewAmbient=null;}
 g.CivilizationAudio?.stopPreview?.();
}
function previewContext(era,scene){
 const item=resolve(era,scene);
 if(!item||typeof state==="undefined"||state?.gm!==true)return false;
 stopPreview();
 if(g.CivilizationAudio?.isSilent?.())return false;
 stopAmbient();g.CivilizationAudio?.stopMusic?.();activeMusicId=null;
 let ok=false;
 if(item.music)ok=g.CivilizationAudio?.preview?.(item.music)===true;
 if(item.ambient){
  const track=g.CivilizationAudio?.tracks?.[item.ambient];
  if(track){
   const el=new Audio(track.url);el.loop=true;el.preload="none";el.volume=ambientVolume(true);
   previewAmbient=el;
   const report=(status,reason="")=>{if(previewAmbient===el)document.dispatchEvent(new CustomEvent("civilization-audio-ambient-preview-status",{detail:{id:item.ambient,status,reason,volume:el.volume}}));};
   el.addEventListener("playing",()=>report("playing"));
   el.addEventListener("error",()=>report("failed","音檔解碼或載入失敗"));
   el.play().catch(error=>{report("failed",String(error?.name||error));if(previewAmbient===el){el.pause();previewAmbient=null;}});
   report("requested");
   ok=true;
  }
 }
 return ok;
}
function setContext(era,scene,{preview=false}={}){
 const item=resolve(era,scene);if(!item)return false;
 if(preview)return previewContext(era,scene);
 if(selected?.era===era&&selected?.scene===scene)return true;
 selected=item;return apply();
}
function restore(){if(prohibited()){stopAmbient();g.CivilizationAudio?.stopMusic?.();activeMusicId=null;return;}
 if(selected){activeMusicId=null;apply();}}
function stop(){clearTimeout(returnTimer);returnTimer=null;selected=null;activeMusicId=null;stopAmbient();g.CivilizationAudio?.stopMusic?.();}
function syncView(viewName,subScreen=""){
 const name=String(viewName||"");
 const era=phase();
 // GM's isolated audio audition must never be driven by the ordinary page.
 if(document.querySelector('[data-gm-section="gm-audio-test"][open]'))return false;
 if(name==="home")return setContext(era,"home");
 if(name==="adventure"){
  if(era==="higher")return setContext("higher","front");
  if(subScreen==="review-combat"||subScreen==="review-prepare")return setContext(era,"review");
  return setContext(era,subScreen==="combat"?(era==="universe"?"boss":"battle"):"explore");
 }
 if(name==="calamity")return era==="higher"?false:setContext(era,"calamity");
 if(name==="storyrecord")return setContext(era,"record");
 const common={character:"character",enhancement:"enhance",specialization:"expertise",inventory:"inventory",settings:"settings",guide:"guide"};
 if(common[name])return setContext(era,common[name]);
 return false;
}
function notify(type,detail={}){
 const era=detail.era||phase();
 if(type==="combat-start"){
  clearTimeout(returnTimer);returnTimer=null;
  if(era==="higher"){
   if(selected?.era==="higher"&&["alternateSelect","alternateBattle"].includes(selected.scene))return setContext("higher","alternateBattle");
   if(selected?.era==="higher"&&["arenaFixed","arenaAlternate"].includes(selected.scene))return true;
   return setContext("higher","front");
  }
  if(selected?.era===era&&["arena","bounty","calamity","review","special"].includes(selected.scene))return true;
  return setContext(era,era==="universe"?"boss":detail.calamity?"calamity":detail.boss?"boss":"battle");
 }
 if(type==="combat-end"){
  clearTimeout(returnTimer);
  const last=selected;
  returnTimer=setTimeout(()=>{
   returnTimer=null;
   if(selected!==last)return;
   if(era==="higher"){
    if(last?.scene==="alternateBattle")setContext("higher","alternateSelect");
    else if(last?.scene==="frontStage")setContext("higher","front");
    return;
   }
   if(["arena","bounty","calamity","review","special"].includes(last?.scene))return;
   setContext(era,"explore");
  },3500);
  return true;
 }
 if(type==="boss")return setContext(era,era==="higher"?"front":"boss");
 if(type==="higher-stage")return setContext("higher","frontStage");
 if(type==="higher-review")return setContext("higher","frontReview");
 if(type==="higher-core")return setContext("higher","core");
 if(type==="arena-fixed")return setContext("higher","arenaFixed");
 if(type==="arena-alternate")return setContext("higher","arenaAlternate");
 if(type==="calamity")return era==="higher"?false:setContext(era,"calamity");
 if(type==="explore")return setContext(era,era==="higher"?"front":"explore");
 if(type==="alternate")return setContext("higher","alternateBattle");
 if(type==="reincarnation")return setContext("shared","reincarnation");
 if(type==="main")return setContext("shared","main");
 if(type==="mirror"||type==="void")return setContext("shared",type);
 if(type==="navigation")return syncView(detail.view,detail.subScreen);
 return false;
}
document.addEventListener("civilization-audio-unlocked",()=>{if(typeof view!=="undefined")syncView(view,typeof adventureScreen==="string"?adventureScreen:"");restore();});
document.addEventListener("civilization-audio-scene",e=>{if(e.detail?.type)notify(e.detail.type,e.detail);else if(e.detail?.era&&e.detail?.scene)setContext(e.detail.era,e.detail.scene);});
document.addEventListener("visibilitychange",()=>{if(document.hidden){stopPreview();stopAmbient();activeMusicId=null;}else if(!document.querySelector('[data-gm-section="gm-audio-test"][open]'))restore();});
document.addEventListener("civilization-audio-preview-volume-changed",()=>{if(previewAmbient){previewAmbient.volume=ambientVolume(true);document.dispatchEvent(new CustomEvent("civilization-audio-ambient-preview-status",{detail:{id:g.CivilizationAudio?.tracks&&Object.entries(g.CivilizationAudio.tracks).find(([id,t])=>t.url===previewAmbient.src)?.[0]||"環境聲",status:"volume",volume:previewAmbient.volume}}));}});
document.addEventListener("civilization-audio-settings-changed",()=>{if(prohibited()){stopPreview();stopAmbient();activeMusicId=null;return;}if(ambient)ambient.volume=ambientVolume();if(previewAmbient)previewAmbient.volume=ambientVolume(true);});
new MutationObserver(()=>{const silent=prohibited();if(silent){stopPreview();stopAmbient();g.CivilizationAudio?.stopMusic?.();activeMusicId=null;}else if(wasSilent&&selected)restore();wasSilent=silent;}).observe(document.body,{attributes:true,attributeFilter:["class"]});
g.CivilizationAudioScenes=Object.freeze({version:4,catalog,phase,resolve,syncView,setContext,previewContext,stopPreview,notify,restore,stop,current:()=>selected?{...selected}:null});
})(window);
