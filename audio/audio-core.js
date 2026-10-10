/* Civilization Audio A01 - one presentation-only audio owner. */
(function(g){"use strict";
const KEY="civilization.audio.preferences.v1";
const tracks=Object.freeze({
 "galaxy-battle":{label:"銀河／宇宙戰鬥候選｜Space Battle",kind:"music",url:"https://opengameart.org/sites/default/files/space_battle_bpm130_0.ogg",author:"MintoDog",license:"CC0",source:"https://opengameart.org/content/space-battle",sample:true},
 "boss-orchestra":{label:"史詩 Boss 候選｜The Final Battle",kind:"music",url:"https://opengameart.org/sites/default/files/the_final_battle.ogg",author:"skrjablin",license:"CC0",source:"https://opengameart.org/content/the-final-battle",sample:true},
 "laser-preview":{label:"雷射射擊候選｜Laser Pew",kind:"battle",url:"https://opengameart.org/sites/default/files/laserpew.ogg",author:"sketcherskt",license:"CC0",source:"https://opengameart.org/content/pew-laser-fire-sound",sample:true}
});
const channels=["master","music","ambient","battle","ui","notice"];
const defaults={enabled:true,master:0.7,music:0.45,ambient:0.6,battle:0.65,ui:0.6,notice:0.75};
let prefs={...defaults},previewLevels={master:defaults.master,music:defaults.music,battle:defaults.battle},music=null,session=null,unlocked=false,token=0;
try{const saved=JSON.parse(localStorage.getItem(KEY)||"{}");for(const key of channels)if(Number.isFinite(saved[key]))prefs[key]=Math.max(0,Math.min(1,saved[key]));if(typeof saved.enabled==="boolean")prefs.enabled=saved.enabled;}catch(_){}
const minimal=()=>document.body.classList.contains("main-minimal-mode-open")||document.body.classList.contains("civilization-3d-minimal")||g.isMinimalModeOpen?.()===true||g.Civilization3DMode?.current?.()==="3d-minimal";
const prohibited=()=>minimal()||document.hidden||!prefs.enabled;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}}
function stop(){token++;if(music){music.pause();music.removeAttribute("src");music.load();music=null;}if(session){session.pause();session.removeAttribute("src");session.load();session=null;}}
function reconcile(){if(prohibited()){stop();return;}/* No obsolete sounds are replayed. */ }
function settings(){return {...prefs};}
function previewSettings(){return {...previewLevels};}
function previewLevel(key,value){
 if(!["master","music","battle"].includes(key))return false;
 previewLevels[key]=Math.max(0,Math.min(1,Number(value)||0));
 if(session)session.volume=previewLevels.master*previewLevels[session.dataset.channel] ;
 return true;
}
function resetPreview(){stopPreview();previewLevels={master:defaults.master,music:defaults.music,battle:defaults.battle};}
function setLevel(key,value){if(!channels.includes(key)&&key!=="enabled")return false;if(key==="enabled")prefs.enabled=!!value;else prefs[key]=Math.max(0,Math.min(1,Number(value)||0));persist();reconcile();if(music)music.volume=prefs.master*prefs.music;if(session)session.volume=previewLevels.master*previewLevels[session.dataset.channel||"music"];return true;}
function unlock(){unlocked=true;reconcile();}
function begin(id,{preview=false,loop=true}={}){
 if(!tracks[id]||prohibited())return false;
 if(!unlocked)return false;
 const item=tracks[id],stamp=++token;const previous=preview?session:music;
 if(previous){previous.pause();previous.src="";}
 const el=new Audio();el.preload="none";el.src=item.url;el.loop=!!loop;el.dataset.channel=item.kind;el.volume=preview?previewLevels.master*(previewLevels[item.kind]??prefs[item.kind]):prefs.master*prefs[item.kind];el.addEventListener("error",()=>{if(stamp===token)g.console.warn("Civilization audio source could not load",id);});
 if(preview)session=el;else music=el;
 el.play().catch(()=>{if(stamp===token)g.console.warn("Audio unavailable or autoplay restricted",id);});return true;
}
function preview(id){if(!(typeof state!=="undefined"&&state?.gm===true))return false;return begin(id,{preview:true,loop:tracks[id]?.kind==="music"});}
function stopPreview(){if(session){session.pause();session.src="";session=null;}}
function update(){reconcile();}
document.addEventListener("visibilitychange",update);
document.addEventListener("pointerdown",unlock,{passive:true});
document.addEventListener("keydown",unlock);
new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:["class"]});
g.CivilizationAudio=Object.freeze({version:1,tracks,settings,setLevel,previewSettings,previewLevel,resetPreview,preview,stopPreview,stop,update,isSilent:prohibited,isUnlocked:()=>unlocked});
})(window);
