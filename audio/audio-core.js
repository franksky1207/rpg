/* Civilization Audio A01 - one presentation-only audio owner. */
(function(g){"use strict";
const KEY="civilization.audio.preferences.v1";
const tracks=Object.freeze({
 "dark-sector":{label:"深空區域｜Sector",kind:"music",url:"https://opengameart.org/sites/default/files/sector_0.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "dark-airy":{label:"異質環境｜Airy",kind:"ambient",url:"https://opengameart.org/sites/default/files/airy_0.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "dark-pulse":{label:"未知脈動｜Pulse",kind:"music",url:"https://opengameart.org/sites/default/files/pulse_0.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "dark-urgent":{label:"危險迫近｜Urgent",kind:"music",url:"https://opengameart.org/sites/default/files/urgent_0.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "dark-transmission":{label:"轉換與傳輸｜Transmission",kind:"music",url:"https://opengameart.org/sites/default/files/transmission_1.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "dark-victory":{label:"勝利音樂｜Victory",kind:"notice",url:"https://opengameart.org/sites/default/files/victory_4.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "dark-hover":{label:"介面反饋｜Hover",kind:"ui",url:"https://opengameart.org/sites/default/files/hover_0.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "dark-title":{label:"選單主題｜Title",kind:"music",url:"https://opengameart.org/sites/default/files/title_6.mp3",author:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",sample:true},
 "galaxy-battle":{label:"銀河／宇宙戰鬥候選｜Space Battle",kind:"music",url:"https://opengameart.org/sites/default/files/space_battle_bpm130_0.ogg",author:"MintoDog",license:"CC0",source:"https://opengameart.org/content/space-battle",sample:true},
 "boss-orchestra":{label:"史詩 Boss 候選｜The Final Battle",kind:"music",url:"https://opengameart.org/sites/default/files/the_final_battle.ogg",author:"skrjablin",license:"CC0",source:"https://opengameart.org/content/the-final-battle",sample:true},
 "laser-preview":{label:"雷射射擊候選｜Laser Pew",kind:"battle",url:"https://opengameart.org/sites/default/files/laserpew.ogg",author:"sketcherskt",license:"CC0",source:"https://opengameart.org/content/pew-laser-fire-sound",sample:true}
});
const channels=["master","music","ambient","battle","ui","notice"];
// Short UI cues need more prominence than long ambient/music beds. True LUFS
// measurement/limiting requires local audio assets; this is a safe playback gain cap.
const categoryGain=Object.freeze({music:0.85,ambient:0.75,battle:1,ui:1.8,notice:1.35});
const normalizeVolume=(channel,master,level)=>Math.max(0,Math.min(1,master*level*(categoryGain[channel]||1)));
const availability=new Map();
async function probeTrack(id){
 const item=tracks[id];if(!item?.url)return "missing";
 const existing=availability.get(id);
 if(existing&&existing!=="checking")return existing;
 if(document.hidden)return "unchecked";
 availability.set(id,"checking");
 return await new Promise(resolve=>{
  const el=document.createElement("audio");el.preload="metadata";
  let finished=false;
  const done=status=>{if(finished)return;finished=true;clearTimeout(timer);el.pause();el.removeAttribute("src");el.load();availability.set(id,status);document.dispatchEvent(new CustomEvent("civilization-audio-availability",{detail:{id,status}}));resolve(status);};
  const timer=setTimeout(()=>done("failed"),9000);
  el.addEventListener("loadedmetadata",()=>done("ready"),{once:true});
  el.addEventListener("error",()=>done("failed"),{once:true});
  el.src=item.url;el.load();
 });
}
function trackStatus(id){return tracks[id]?.url?(availability.get(id)||"unchecked"):"missing";}
async function checkTracks(ids){for(const id of [...new Set(ids)].filter(x=>tracks[x]?.url)){if(document.hidden)break;await probeTrack(id);}return ids.map(id=>[id,trackStatus(id)]);}

const defaults={enabled:true,master:0.7,music:0.45,ambient:0.6,battle:0.65,ui:0.6,notice:0.75};
let prefs={...defaults},previewLevels={master:defaults.master,music:defaults.music,battle:defaults.battle},music=null,session=null,unlocked=false,token=0;
try{const saved=JSON.parse(localStorage.getItem(KEY)||"{}");for(const key of channels)if(Number.isFinite(saved[key]))prefs[key]=Math.max(0,Math.min(1,saved[key]));if(typeof saved.enabled==="boolean")prefs.enabled=saved.enabled;}catch(_){}
const minimal=()=>document.body.classList.contains("main-minimal-mode-open")||document.body.classList.contains("civilization-3d-minimal")||g.isMinimalModeOpen?.()===true||g.Civilization3DMode?.current?.()==="3d-minimal";
const prohibited=()=>minimal()||document.hidden||!prefs.enabled;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}}
function stop(){stopCombat();token++;if(music){music.pause();music.removeAttribute("src");music.load();music=null;}if(session){session.pause();session.removeAttribute("src");session.load();session=null;}}
function reconcile(){if(prohibited()){stop();return;}/* No obsolete sounds are replayed. */ }
function settings(){return {...prefs};}
function previewSettings(){return {...previewLevels};}
function previewLevel(key,value){
 if(!["master","music","battle"].includes(key))return false;
 previewLevels[key]=Math.max(0,Math.min(1,Number(value)||0));
 if(session)session.volume=normalizeVolume(session.dataset.channel||"music",previewLevels.master,previewLevels[session.dataset.channel]??prefs[session.dataset.channel]??0.6);
 return true;
}
function resetPreview(){stopCombat();stopPreview();previewLevels={master:defaults.master,music:defaults.music,battle:defaults.battle};}
function setLevel(key,value){if(!channels.includes(key)&&key!=="enabled")return false;if(key==="enabled")prefs.enabled=!!value;else prefs[key]=Math.max(0,Math.min(1,Number(value)||0));persist();reconcile();document.dispatchEvent(new CustomEvent("civilization-audio-settings-changed",{detail:{key}}));if(music)music.volume=normalizeVolume("music",prefs.master,prefs.music);if(session)session.volume=normalizeVolume(session.dataset.channel||"music",previewLevels.master,previewLevels[session.dataset.channel||"music"]??prefs[session.dataset.channel||"music"]);return true;}
function unlock(){const first=!unlocked;unlocked=true;reconcile();if(first)document.dispatchEvent(new Event("civilization-audio-unlocked"));}
function begin(id,{preview=false,loop=true}={}){
 if(!tracks[id]||prohibited())return false;
 if(!unlocked)return false;
 const item=tracks[id],stamp=++token;const previous=preview?session:music;
 if(previous){previous.pause();previous.removeAttribute("src");previous.load();}
 const el=new Audio();el.preload="none";el.src=item.url;el.loop=!!loop;el.dataset.channel=item.kind;el.volume=preview?normalizeVolume(item.kind,previewLevels.master,previewLevels[item.kind]??prefs[item.kind]):normalizeVolume(item.kind,prefs.master,prefs[item.kind]);el.addEventListener("playing",()=>{if(stamp===token&&preview)document.dispatchEvent(new CustomEvent("civilization-audio-preview-status",{detail:{id,status:"playing"}}));});el.addEventListener("error",()=>{if(stamp===token){g.console.warn("Civilization audio source could not load",id);if(preview)document.dispatchEvent(new CustomEvent("civilization-audio-preview-status",{detail:{id,status:"failed"}}));}});
 if(preview)session=el;else music=el;
 el.play().catch(()=>{if(stamp===token){g.console.warn("Audio unavailable or autoplay restricted",id);if(preview)document.dispatchEvent(new CustomEvent("civilization-audio-preview-status",{detail:{id,status:"failed"}}));}});return true;
}
function preview(id){if(!(typeof state!=="undefined"&&state?.gm===true))return false;return begin(id,{preview:true,loop:tracks[id]?.kind==="music"});}
function playMusic(id){return begin(id,{preview:false,loop:true});}
function stopMusic(){if(music){music.pause();music.removeAttribute("src");music.load();music=null;}}
function stopPreview(){if(session){session.pause();session.removeAttribute("src");session.load();session=null;}}

const combatCatalog=Object.freeze({
 attack:{label:"普通攻擊",asset:"laser-preview",status:"candidate"},
 critical:{label:"暴擊",asset:null,status:"awaiting-asset"},
 dodge:{label:"閃避",asset:null,status:"awaiting-asset"},
 combo:{label:"連擊",asset:null,status:"awaiting-asset"},
 counter:{label:"反擊",asset:null,status:"awaiting-asset"},
 shield:{label:"護盾承傷",asset:null,status:"awaiting-asset"},
 drain:{label:"汲取",asset:null,status:"awaiting-asset"},
 penetration:{label:"穿透",asset:null,status:"awaiting-asset"},
 mark:{label:"印記",asset:null,status:"awaiting-asset"},
 berserk:{label:"狂暴",asset:null,status:"awaiting-asset"},
 victory:{label:"勝利",asset:"dark-victory",status:"candidate"},
 defeat:{label:"失敗",asset:null,status:"awaiting-asset"}
});
let lastCombat=0;
const combatVoices=new Set();
function stopCombat(){
 for(const audio of combatVoices){audio.pause();audio.removeAttribute("src");audio.load();}
 combatVoices.clear();
}
function combatEvent(evt,{simulation=false}={}){
 if(!evt||prohibited()||!unlocked)return false;
 if(typeof g.backgroundProgressFastCatchUpActive==="function"&&["main","universe","third","void","mirror"].some(k=>g.backgroundProgressFastCatchUpActive(k)===true))return false;
 const type=evt.type==="attack"?(evt.crit?"critical":Number(evt.shieldAbsorbed)>0?"shield":"attack"):evt.type==="mark"?"mark":evt.type;
 const entry=combatCatalog[type];if(!entry?.asset)return false;
 const now=Date.now();if(now-lastCombat<240)return false;lastCombat=now;
 const track=tracks[entry.asset];if(!track)return false;
 const audio=new Audio(track.url);audio.volume=normalizeVolume("battle",simulation?previewLevels.master:prefs.master,simulation?previewLevels.battle:prefs.battle);
 audio.preload="none";combatVoices.add(audio);
 audio.addEventListener("ended",()=>combatVoices.delete(audio),{once:true});
 audio.addEventListener("error",()=>combatVoices.delete(audio),{once:true});
 if(combatVoices.size>3){const old=combatVoices.values().next().value;old.pause();combatVoices.delete(old);}
 audio.play().catch(()=>combatVoices.delete(audio));return true;
}

function update(){reconcile();}
// A04 spatial contract: position is presentation metadata until a dedicated Web Audio spatial voice is attached.
const listener={x:0,y:0,z:0};
function setListenerPosition(pos={}){for(const axis of ["x","y","z"])if(Number.isFinite(Number(pos[axis])))listener[axis]=Math.max(-1e6,Math.min(1e6,Number(pos[axis])));return {...listener};}
function spatialMetadata(position={}){const p={};for(const axis of ["x","y","z"])p[axis]=Number.isFinite(Number(position[axis]))?Math.max(-1e6,Math.min(1e6,Number(position[axis]))):0;const dx=p.x-listener.x,dy=p.y-listener.y,dz=p.z-listener.z;const distance=Math.hypot(dx,dy,dz);return {position:p,distance,pan:Math.max(-1,Math.min(1,dx/Math.max(1,Math.abs(dx)+Math.abs(dz))))};}
// Spatial one-shots share the official battle budget and never affect combat outcomes.
// Text mode uses centered stereo; 3D standard may supply a world-space position.
let spatialContext=null;
function playSpatial(id,{position=null,volume=1,simulation=false}={}){
 const track=tracks[id];if(!track||prohibited()||!unlocked)return false;
 if(typeof g.backgroundProgressFastCatchUpActive==="function"&&["main","universe","third","void","mirror"].some(k=>g.backgroundProgressFastCatchUpActive(k)===true))return false;
 if(combatVoices.size>=3){const oldest=combatVoices.values().next().value;if(oldest){oldest.pause();oldest.removeAttribute("src");oldest.load();combatVoices.delete(oldest);}}
 const audio=new Audio(track.url);
 audio.preload="none";audio.loop=false;
 const base=simulation?previewLevels:prefs;
 audio.volume=Math.max(0,Math.min(1,normalizeVolume(track.kind==="ui"?"ui":"battle",base.master,base.battle??prefs.battle)*Math.max(0,Math.min(1,Number(volume)||0))));
 let source=null,panNode=null;
 try{
  const mode=g.Civilization3DMode?.current?.();
  // Cross-origin HTMLMediaElement → Web Audio can output silence without CORS.
  // Remote candidates stay plain stereo until locally hosted or CORS-enabled.
  const sameOrigin=track.url?.startsWith("/")||track.url?.startsWith("./")||(!/^https?:\/\//i.test(track.url||""))||(typeof location!=="undefined"&&new URL(track.url,location.href).origin===location.origin);
  const spatial=position&&mode==="3d-standard"&&sameOrigin;
  const Ctx=g.AudioContext||g.webkitAudioContext;
  if(spatial&&Ctx){
   spatialContext=spatialContext||new Ctx();
   source=spatialContext.createMediaElementSource(audio);
   panNode=spatialContext.createStereoPanner();
   panNode.pan.value=spatialMetadata(position).pan;
   source.connect(panNode);panNode.connect(spatialContext.destination);
   if(spatialContext.state==="suspended")spatialContext.resume().catch(()=>{});
  }
 }catch(_){source=null;}
 combatVoices.add(audio);
 const release=()=>{combatVoices.delete(audio);if(source)try{source.disconnect();panNode?.disconnect();}catch(_){}};
 audio.addEventListener("ended",release,{once:true});audio.addEventListener("error",release,{once:true});
 audio.play().catch(release);return true;
}
function runtimeStats(){return {music:!!music,preview:!!session,combatVoices:combatVoices.size,unlocked,prohibited:prohibited(),listener:{...listener}};}
document.addEventListener("visibilitychange",update);
document.addEventListener("pointerdown",unlock,{passive:true});
document.addEventListener("keydown",unlock);
new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:["class"]});
g.CivilizationAudio=Object.freeze({version:3,tracks,trackStatus,checkTracks,categoryGain,combatCatalog,combatEvent,settings,setLevel,previewSettings,previewLevel,resetPreview,preview,playMusic,stopMusic,stopPreview,stop,update,isSilent:prohibited,isUnlocked:()=>unlocked,setListenerPosition,spatialMetadata,playSpatial,runtimeStats});
})(window);
