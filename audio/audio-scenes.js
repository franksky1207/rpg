/* A03 single scene director: no progress/save writes; same audio core for text and 3D. */
(function(g){"use strict";
const catalog=Object.freeze({
 galaxy:Object.freeze({home:["dark-title",null],explore:["dark-sector","dark-airy"],battle:["galaxy-battle",null],boss:["boss-orchestra","dark-airy"],calamity:["boss-orchestra","dark-pulse"],review:["dark-pulse",null],arena:["dark-urgent",null],bounty:["galaxy-battle",null]}),
 universe:Object.freeze({home:["dark-title",null],explore:["dark-pulse","dark-airy"],battle:["galaxy-battle",null],boss:["boss-orchestra","dark-pulse"],calamity:["boss-orchestra","dark-pulse"],review:["dark-pulse",null],arena:["dark-urgent",null],bounty:["galaxy-battle",null]}),
 higher:Object.freeze({home:["dark-title",null],explore:["dark-airy",null],battle:["dark-urgent","dark-airy"],boss:["boss-orchestra","dark-airy"],alternate:["dark-pulse","dark-airy"],calamity:["boss-orchestra","dark-pulse"],arena:["dark-urgent",null]}),
 shared:Object.freeze({main:["dark-title",null],mirror:["boss-orchestra",null],void:["dark-pulse","dark-airy"],victory:["dark-victory",null],reincarnation:["dark-transmission",null],inventory:[null,null],enhance:[null,null],expertise:[null,null],cloud:[null,null]})
});
let selected=null,ambient=null,ambientId=null,activeMusicId=null,returnTimer=null;
function phase(){
 try{
  const raw=typeof state!=="undefined"?state:null;
  const world=Number(raw?.worldPhase??raw?.world??0);
  if(world===3||raw?.thirdWorld?.unlocked===true)return "higher";
  if(world===2||raw?.secondWorld?.unlocked===true)return "universe";
 }catch(_){}
 return "galaxy";
}
function resolve(era,scene){const family=catalog[era]||catalog.shared;const pair=family[scene];return pair?{era,scene,music:pair[0],ambient:pair[1]}:null;}
function prohibited(){return !!g.CivilizationAudio?.isSilent?.();}
function stopAmbient(){if(ambient){ambient.pause();ambient.removeAttribute("src");ambient.load();ambient=null;}ambientId=null;}
function syncAmbient(id){
 if(!id||prohibited()){stopAmbient();return;}
 if(ambientId===id&&ambient&&!ambient.paused)return;
 stopAmbient();
 const track=g.CivilizationAudio?.tracks?.[id];if(!track)return;
 const el=new Audio(track.url);el.loop=true;el.preload="none";el.volume=.18;
 ambient=el;ambientId=id;el.play().catch(()=>{if(ambient===el)stopAmbient();});
}
function apply(){
 if(!selected||prohibited()){stopAmbient();if(prohibited())g.CivilizationAudio?.stopMusic?.();return false;}
 if(selected.music!==activeMusicId){g.CivilizationAudio?.stopMusic?.();activeMusicId=selected.music;if(selected.music)g.CivilizationAudio?.playMusic?.(selected.music);}
 syncAmbient(selected.ambient);return true;
}
function setContext(era,scene,{preview=false}={}){
 const item=resolve(era,scene);if(!item)return false;
 if(preview){stopAmbient();if(item.music)return g.CivilizationAudio?.preview?.(item.music)===true;g.CivilizationAudio?.stopPreview?.();return false;}
 if(selected?.era===era&&selected?.scene===scene)return true;
 selected=item;return apply();
}
function restore(){if(prohibited()){stopAmbient();g.CivilizationAudio?.stopMusic?.();activeMusicId=null;return;}
 if(selected){activeMusicId=null;apply();}}
function stop(){clearTimeout(returnTimer);returnTimer=null;selected=null;activeMusicId=null;stopAmbient();g.CivilizationAudio?.stopMusic?.();}
function notify(type,detail={}){
 const era=detail.era||phase();
 if(type==="combat-start"){clearTimeout(returnTimer);returnTimer=null;return setContext(era,detail.boss?"boss":"battle");}
 if(type==="combat-end"){clearTimeout(returnTimer);returnTimer=setTimeout(()=>{returnTimer=null;setContext(era,"explore");},3500);return true;}
 if(type==="boss")return setContext(era,"boss");
 if(type==="calamity")return setContext(era,"calamity");
 if(type==="explore")return setContext(era,"explore");
 if(type==="alternate")return setContext("higher","alternate");
 if(type==="reincarnation")return setContext("shared","reincarnation");
 if(type==="main")return setContext("shared","main");
 if(type==="mirror"||type==="void")return setContext("shared",type);
 return false;
}
document.addEventListener("civilization-audio-scene",e=>{if(e.detail?.type)notify(e.detail.type,e.detail);else if(e.detail?.era&&e.detail?.scene)setContext(e.detail.era,e.detail.scene);});
document.addEventListener("visibilitychange",()=>{if(document.hidden){stopAmbient();activeMusicId=null;}else restore();});
new MutationObserver(()=>{if(prohibited()){stopAmbient();activeMusicId=null;}else if(selected&&!ambient&&selected.ambient)restore();}).observe(document.body,{attributes:true,attributeFilter:["class"]});
g.CivilizationAudioScenes=Object.freeze({version:1,catalog,phase,resolve,setContext,notify,restore,stop,current:()=>selected?{...selected}:null});
})(window);
