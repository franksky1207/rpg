/* Civilization Audio A01 - one presentation-only audio owner. */
(function(g){"use strict";
const KEY="civilization.audio.preferences.v1";
const tracks=Object.freeze({
 "era-galaxy-theme":{label:"銀河紀元主題｜The Fall of Arcana",kind:"music",url:"audio/assets/era-themes/galaxy-theme-loop.ogg",author:"Matthew Pablo",license:"CC BY 3.0",source:"https://opengameart.org/content/the-fall-of-arcana-epic-game-theme-music",sample:true},
 "era-universe-theme":{label:"宇宙紀元主題｜Epic Orchestral Fantasy Theme",kind:"music",url:"audio/assets/era-themes/universe-theme-loop.ogg",author:"Markus Lindner",license:"CC BY 4.0",source:"https://opengameart.org/content/epic-orchestral-fantasy-theme",sample:true},
 "era-higher-theme":{label:"高維紀元主題｜Exploration Theme",kind:"music",url:"audio/assets/era-themes/higher-theme-loop.ogg",author:"Cleyton Kauffman",license:"CC0",source:"https://opengameart.org/content/exploration-theme",sample:true},
 "battle-normal-preview":{label:"普通戰鬥｜JRPG Battle Theme",kind:"music",url:"audio/assets/battle-themes/normal-battle-loop.ogg",author:"North Fantasy Music",license:"CC BY 4.0",source:"https://opengameart.org/content/jrpg-battle-theme",sample:true},
 "battle-medium-preview":{label:"中等戰鬥｜Boss Battle",kind:"music",url:"audio/assets/battle-themes/medium-battle-loop.ogg",author:"tcarisland",license:"CC BY 4.0",source:"https://opengameart.org/content/boss-battle-5",sample:true},
 "battle-high-preview":{label:"高等戰鬥｜I'm Boss Here!",kind:"music",url:"audio/assets/battle-themes/high-battle-loop.ogg",author:"Fato Shadow",license:"CC BY 4.0",source:"https://opengameart.org/content/im-boss-here-soundtrack",sample:true},

});
/* Warm the currently active era music first; other eras are cached lazily.
   Browsers may still require the user's first gesture before audible playback. */
let prioritizedTheme=null;
function prioritizeEraTheme(era){
 const id=({galaxy:"era-galaxy-theme",universe:"era-universe-theme",higher:"era-higher-theme"})[era];
 if(!id||prioritizedTheme===id)return false;
 prioritizedTheme=id;
 const href=tracks[id].url;
 if(!document.querySelector('link[data-era-theme-preload]')){
  const link=document.createElement("link");link.rel="preload";link.as="fetch";link.href=href;link.crossOrigin="anonymous";link.setAttribute("data-era-theme-preload","1");document.head.appendChild(link);
 }else {const link=document.querySelector('link[data-era-theme-preload]');link.href=href;}
 return true;
}
function currentEraForAudio(){
 try{const p=Number(g.currentWorldPhase?.(typeof state!=="undefined"?state:null));if(p===3)return "higher";if(p===2)return "universe";}catch(_){}
 const raw=typeof state!=="undefined"?state:null;
 if(Number(raw?.worldPhase??raw?.world)===3)return "higher";
 if(Number(raw?.worldPhase??raw?.world)===2)return "universe";
 return "galaxy";
}
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

const defaults={enabled:true,musicEnabled:true,effectsEnabled:true,master:0.7,music:0.45,ambient:0.6,battle:0.65,ui:0.6,notice:0.75};
let gmPreviewVolume=1;
let prefs={...defaults},previewLevels={master:defaults.master,music:defaults.music,ambient:defaults.ambient,battle:defaults.battle,ui:defaults.ui,notice:defaults.notice},music=null,session=null,unlocked=false,token=0;
try{const saved=JSON.parse(localStorage.getItem(KEY)||"{}");for(const key of channels)if(Number.isFinite(saved[key]))prefs[key]=Math.max(0,Math.min(1,saved[key]));if(typeof saved.enabled==="boolean")prefs.enabled=saved.enabled;for(const key of ["musicEnabled","effectsEnabled"])if(typeof saved[key]==="boolean")prefs[key]=saved[key];}catch(_){}
const minimal=()=>document.body.classList.contains("main-minimal-mode-open")||document.body.classList.contains("civilization-3d-minimal")||g.isMinimalModeOpen?.()===true||g.Civilization3DMode?.current?.()==="3d-minimal";
const prohibited=()=>minimal()||document.hidden||!prefs.enabled;
const musicMuted=()=>prohibited()||!prefs.musicEnabled;
const effectsMuted=()=>prohibited()||!prefs.effectsEnabled;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}}
function stop(){musicFadeSeq++;stopCombat();stopSfx();token++;retireOtherMusicVoices();if(music)retireMusicVoice(music);music=null;if(session){session.pause();session.removeAttribute("src");session.load();session=null;}}
function reconcile(){if(prohibited()){stop();return;}if(!prefs.musicEnabled){musicFadeSeq++;retireOtherMusicVoices();if(music)retireMusicVoice(music);music=null;}if(!prefs.effectsEnabled){stopCombat();stopSfx();}}
function settings(){return {...prefs};}
function previewSettings(){return {...previewLevels,gmVolume:gmPreviewVolume};}
function previewGain(_channel){return gmPreviewVolume;}
function setPreviewVolume(value){gmPreviewVolume=Math.max(0,Math.min(1,Number(value)||0));if(session){const channel=session.dataset.channel||"music";session.volume=previewGain(channel);previewReport({id:session.dataset.trackId||"",status:"volume",volume:session.volume,channel,url:session.src});}for(const voice of combatVoices)if(voice.dataset?.gmPreviewVoice==="1")voice.volume=previewGain("battle");for(const voice of sfxVoices)if(voice.dataset?.gmPreviewVoice==="1")voice.volume=gmPreviewVolume;document.dispatchEvent(new CustomEvent("civilization-audio-preview-volume-changed",{detail:{gmVolume:gmPreviewVolume}}));return true;}
function previewLevel(key,value){
 if(!channels.includes(key))return false;
 previewLevels[key]=Math.max(0,Math.min(1,Number(value)||0));
 if(session){
  const channel=session.dataset.channel||"music";
  session.volume=normalizeVolume(channel,previewLevels.master,previewLevels[channel]??prefs[channel]??0.6);
  previewReport({id:session.dataset.trackId||"",status:"volume",volume:session.volume,channel,url:session.src});
 }
 document.dispatchEvent(new CustomEvent("civilization-audio-preview-volume-changed",{detail:{levels:{...previewLevels}}}));
 return true;
}
function resetPreview({resetLevels=false}={}){stopCombat();stopPreview();if(resetLevels)previewLevels={master:defaults.master,music:defaults.music,ambient:defaults.ambient,battle:defaults.battle,ui:defaults.ui,notice:defaults.notice};}
function setLevel(key,value){if(!channels.includes(key)&&!["enabled","musicEnabled","effectsEnabled"].includes(key))return false;if(["enabled","musicEnabled","effectsEnabled"].includes(key))prefs[key]=!!value;else prefs[key]=Math.max(0,Math.min(1,Number(value)||0));persist();reconcile();document.dispatchEvent(new CustomEvent("civilization-audio-settings-changed",{detail:{key}}));if(music)music.volume=normalizeVolume("music",prefs.master,prefs.music);if(session)session.volume=previewGain(session.dataset.channel||"music");return true;}
function unlock(){const first=!unlocked;unlocked=true;reconcile();if(first)warmCombatSfx();if(first)document.dispatchEvent(new Event("civilization-audio-unlocked"));}
let previewRequest=0;
function previewReport(detail){document.dispatchEvent(new CustomEvent("civilization-audio-preview-status",{detail}));}
function playbackError(error){return String(error?.name||"Error")+": "+String(error?.message||error||"未知播放失敗");}
function begin(id,{preview=false,loop=true}={}){
 const item=tracks[id];if(!item){if(preview)previewReport({id,status:"failed",reason:"找不到音檔"});return false;}
 if(prohibited()||(!preview&&musicMuted())){if(preview)previewReport({id,status:"blocked",reason:document.hidden?"分頁在背景":minimal()?"極簡模式禁止播放":"音訊已停用"});return false;}
 if(!unlocked){if(preview)previewReport({id,status:"blocked",reason:"需要先點擊網頁解除瀏覽器播放限制"});return false;}
 if(preview&&music){musicFadeSeq++;retireOtherMusicVoices(music);music.pause();}
 const request=preview?++previewRequest:0,previous=preview?session:music;
 if(previous){previous.pause();previous.removeAttribute("src");previous.load();}
 const el=new Audio();el.preload="auto";el.src=item.url;el.loop=!!loop;el.dataset.channel=item.kind;el.dataset.trackId=id;
 const level=preview?(previewLevels[item.kind]??prefs[item.kind]):prefs[item.kind];
 el.volume=preview?previewGain(item.kind):normalizeVolume(item.kind,prefs.master,level);
 const active=()=>preview?session===el&&previewRequest===request:music===el;
 const report=(status,reason="")=>{if(preview&&active())previewReport({id,status,reason,volume:el.volume,channel:item.kind,url:item.url,readyState:el.readyState,networkState:el.networkState});};
 el.addEventListener("playing",()=>report("playing"));
 el.addEventListener("error",()=>report("failed","音訊媒體錯誤 "+(el.error?.code||"unknown")));
 if(preview)session=el;else {musicFadeSeq++;retireOtherMusicVoices();musicVoices.add(el);music=el;}
 report("requested");
 el.play().catch(error=>{if(active()){report("failed",playbackError(error));if(!preview)document.dispatchEvent(new CustomEvent("civilization-audio-music-failed",{detail:{id,reason:playbackError(error)}}));}});
 return true;
}
function preview(id){if(!(typeof state!=="undefined"&&state?.gm===true))return false;return begin(id,{preview:true,loop:tracks[id]?.kind==="music"});}
function previewSeam(id,seconds=8){
 if(!(typeof state!=="undefined"&&state?.gm===true)||!tracks[id])return false;
 const ok=begin(id,{preview:true,loop:false});if(!ok||!session)return false;
 const el=session,windowSeconds=Math.max(3,Math.min(12,Number(seconds)||8));
 let stage=0,started=false,finished=false;
 const active=()=>session===el&&!finished;
 const seekTail=()=>{if(!active()||started||!Number.isFinite(el.duration)||el.duration<windowSeconds*2+2)return;started=true;stage=1;try{el.currentTime=el.duration-windowSeconds;previewReport({id,status:"seam-tail",reason:"開始試聽曲尾 "+windowSeconds+" 秒",volume:el.volume});}catch(e){started=false;previewReport({id,status:"failed",reason:"無法跳至曲尾"});}};
 el.addEventListener("loadedmetadata",seekTail);
 el.addEventListener("durationchange",seekTail);
 el.addEventListener("timeupdate",()=>{
  if(!active()||!started)return;
  if(stage===1&&el.currentTime>=el.duration-.13){stage=2;el.currentTime=0;previewReport({id,status:"seam",reason:"曲尾已接回曲頭",volume:el.volume});}
  else if(stage===2&&el.currentTime>=windowSeconds){finished=true;stopPreview();previewReport({id,status:"seam-done",reason:"接縫試聽完成",volume:el.volume});}
 });
 el.addEventListener("ended",()=>{if(active()&&stage===1){stage=2;el.currentTime=0;previewReport({id,status:"seam",reason:"已從曲尾銜接回曲頭",volume:el.volume});el.play().catch(()=>{});}});
 if(el.readyState>=1)seekTail();
 return true;
}

/* A single active formal music voice; no overlapping crossfades.
   An obsolete fade callback must never leave an orphan player sounding. */
let musicFadeSeq=0;
const musicVoices=new Set();
function retireMusicVoice(el){
 if(!el)return;
 try{el.pause();el.removeAttribute("src");el.load();}catch(_){}
 musicVoices.delete(el);
}
function retireOtherMusicVoices(keep=null){
 for(const el of [...musicVoices])if(el!==keep)retireMusicVoice(el);
}
function fadeMusic(id){
 // No zero-volume pending state: switch ownership synchronously and play at
 // the configured level. Previous fading players are all retired first.
 if(!tracks[id]||musicMuted())return false;
 if(music?.dataset?.trackId===id)return resumeMusic();
 musicFadeSeq++;
 retireOtherMusicVoices();
 if(music)retireMusicVoice(music);
 music=null;
 return begin(id,{preview:false,loop:true});
}
function playMusic(id){
 if(music?.dataset?.trackId===id)return resumeMusic();
 if(musicMuted())return false;
 if(music)return fadeMusic(id);
 return begin(id,{preview:false,loop:true});
}
function currentMusicId(){return music?.dataset?.trackId||null;}
function stopMusic(){musicFadeSeq++;token++;retireOtherMusicVoices();if(music)retireMusicVoice(music);music=null;}
function stopPreview(){token++;previewRequest++;if(session){session.pause();session.removeAttribute("src");session.load();session=null;}}
function resumeMusic(){if(music)retireOtherMusicVoices(music);if(!music||musicMuted()||document.querySelector('[data-gm-section="gm-audio-test"][open]'))return false;if(!music.paused)return true;music.play().catch(()=>{});return true;}


const sfxCategories=Object.freeze({"ui-click":{count:1,indices:[85],channel:"ui",interval:65},"normal-attack":{count:10,indices:[1,2,3],channel:"battle",interval:130},"critical":{count:37,indices:[1,2,3],channel:"battle",interval:210},"dodge":{count:1,channel:"battle",interval:180},"heavy-hit":{count:50,indices:[4,5,29],channel:"battle",interval:300},"victory":{count:1,channel:"notice",interval:0}});
const sfxLastPick=new Map(),sfxLastTime=new Map(),sfxVoices=new Set();
const settledVictoryKeys=new Set();
const preparedSfx=new Map(),sfxTiming={requested:0,started:0,failed:0,lastStartMs:0};
const sfxCleanup=new WeakMap();
const warmChoices={"ui-click":[85],"normal-attack":[1,2,3],critical:[1,2,3],dodge:[1],"heavy-hit":[4,5,29],victory:[1]};
function preparedSample(category,index){
 const url="audio/assets/common-sfx/"+category+"/sfx-"+String(index).padStart(3,"0")+".ogg";
 if(preparedSfx.has(url))return preparedSfx.get(url);
 const audio=new Audio();audio.preload="auto";audio.loop=false;audio.src=url;audio.dataset.sfxCategory=category;
 const slot={audio,busy:false,ready:false};
 audio.addEventListener("loadeddata",()=>slot.ready=true,{once:true});
 preparedSfx.set(url,slot);audio.load();return slot;
}
function warmCombatSfx(){
 for(const [category,indices] of Object.entries(warmChoices))for(const index of indices)preparedSample(category,index);
 return true;
}
function sfxDiagnostics(){return {...sfxTiming,prepared:preparedSfx.size,ready:[...preparedSfx.values()].filter(x=>x.ready).length,active:sfxVoices.size};}

function settlementVictory(key,{success=false}={}){
 if(success!==true||typeof key!=="string"||!key||settledVictoryKeys.has(key))return false;
 // Mark even when muted; reopening the same settlement must never play again.
 settledVictoryKeys.add(key);
 if(settledVictoryKeys.size>128)settledVictoryKeys.delete(settledVictoryKeys.values().next().value);
 return playSfx("victory");
}
function pickSfx(category){
 const spec=sfxCategories[category];if(!spec)return null;
 const pool=spec.indices||Array.from({length:spec.count},(_,i)=>i+1);
 const prior=sfxLastPick.get(category)||0;
 let index=pool[Math.floor(Math.random()*pool.length)];
 if(pool.length>1&&index===prior)index=pool[(pool.indexOf(index)+1)%pool.length];
 sfxLastPick.set(category,index);
 return {category,index,url:"audio/assets/common-sfx/"+category+"/sfx-"+String(index).padStart(3,"0")+".ogg"};
}
function releaseSfx(audio){
 if(!audio)return;sfxVoices.delete(audio);
 const cleanup=sfxCleanup.get(audio);if(cleanup){audio.removeEventListener("ended",cleanup);audio.removeEventListener("error",cleanup);sfxCleanup.delete(audio);}
 const slot=[...preparedSfx.values()].find(x=>x.audio===audio);if(slot)slot.busy=false;try{audio.pause();audio.currentTime=0;}catch(_){}if(slot)return;try{audio.removeAttribute("src");audio.load();}catch(_){}
}
function stopSfx(){for(const a of [...sfxVoices])releaseSfx(a);sfxLastTime.clear();}
function stopBattleSfx(){for(const a of [...sfxVoices])if(a.dataset.sfxCategory==="normal-attack"||a.dataset.sfxCategory==="critical"||a.dataset.sfxCategory==="dodge"||a.dataset.sfxCategory==="heavy-hit")releaseSfx(a);for(const k of ["normal-attack","critical","dodge","heavy-hit"])sfxLastTime.delete(k);stopCombat();}
function playSfx(category,{simulation=false,volume=1}={}){
 const spec=sfxCategories[category];if(!spec||effectsMuted()||!unlocked)return false;
 if(simulation&&!(typeof state!=="undefined"&&state?.gm===true))return false;
 if(typeof g.backgroundProgressFastCatchUpActive==="function"&&["main","universe","third","void","mirror"].some(k=>g.backgroundProgressFastCatchUpActive(k)===true))return false;
 const now=Date.now();if(now-(sfxLastTime.get(category)||0)<spec.interval)return false;
 const sample=pickSfx(category);sfxLastTime.set(category,now);
 // Short combat sounds must be allowed to load and start before later events reclaim voices.
 // Preload metadata aggressively; leave victory in its own protected voice budget.
 const slot=preparedSample(category,sample.index);const a=!slot.busy?slot.audio:new Audio(sample.url);if(a===slot.audio)slot.busy=true;a.preload="auto";a.loop=false;a.dataset.sfxCategory=category;
 if(simulation)a.dataset.gmPreviewVoice="1";
 const gain=simulation?gmPreviewVolume:normalizeVolume(spec.channel,prefs.master,prefs[spec.channel]);
 a.volume=Math.max(0,Math.min(1,gain*Math.max(0,Math.min(1,Number(volume)||0))));
 const isNotice=category==="victory";
 const categoryLimit=isNotice?2:3;
 const totalLimit=8;
 const owned=[...sfxVoices].filter(x=>x.dataset.sfxCategory===category);
 if(owned.length>=categoryLimit)releaseSfx(owned[0]);
 if(!isNotice){
  const battleVoices=[...sfxVoices].filter(x=>x.dataset.sfxCategory!=="victory");
  if(battleVoices.length>=totalLimit-2)releaseSfx(battleVoices[0]);
 }else{
  while(sfxVoices.size>=totalLimit)releaseSfx([...sfxVoices].find(x=>x.dataset.sfxCategory!=="victory")||sfxVoices.values().next().value);
 }
 sfxVoices.add(a);
 const finish=()=>{if(sfxCleanup.get(a)===finish)releaseSfx(a);};
 sfxCleanup.set(a,finish);a.addEventListener("ended",finish);a.addEventListener("error",finish);
 if(a!==slot.audio)a.src=sample.url;
 const began=performance.now();sfxTiming.requested++;
 a.play().then(()=>{if(sfxCleanup.get(a)===finish){sfxTiming.started++;sfxTiming.lastStartMs=Math.round(performance.now()-began);}}).catch(error=>{if(sfxCleanup.get(a)===finish){sfxTiming.failed++;console.warn("[文明戰線] 音效播放失敗",category,error?.name||error);releaseSfx(a);}});
 return true;
}

const combatCatalog=Object.freeze({
 attack:{label:"普通攻擊",asset:null,status:"awaiting-asset"},
 critical:{label:"暴擊",asset:null,status:"awaiting-asset"},
 dodge:{label:"閃避",asset:null,status:"awaiting-asset"},
 victory:{label:"勝利",asset:null,status:"awaiting-asset"}

});
let lastCombat=0;
const combatVoices=new Set();
function stopCombat(){
 for(const audio of combatVoices){audio.pause();audio.removeAttribute("src");audio.load();}
 combatVoices.clear();
}
function combatEvent(evt,{simulation=false,major=false}={}){
 if(!evt||typeof evt!=="object")return false;
 // Presentation only: the authoritative combat result has already been decided.
 // Mutually exclusive priority: a critical replaces ordinary attack, never layers with it.
 let category=null;
 if(evt.type==="attack"){
  if(major===true&&Number(evt.actualDamage)>0)category="heavy-hit";
  else if(evt.miss===true||evt.dodged===true||evt.dodge===true||evt.evaded===true)category="dodge";
  else category=evt.crit===true||evt.critical===true?"critical":"normal-attack";
 }else if(evt.type==="dodge"||evt.type==="evade")category="dodge";
 // No invented heavy-hit threshold or automatic Boss classification.
 else if(evt.type==="specialHeavyImpact"||evt.type==="majorImpact")category="heavy-hit";
 else if(evt.type==="victory")category="victory";
 return category?playSfx(category,{simulation}):false;
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
 const track=tracks[id];if(!track||effectsMuted()||!unlocked)return false;
 if(typeof g.backgroundProgressFastCatchUpActive==="function"&&["main","universe","third","void","mirror"].some(k=>g.backgroundProgressFastCatchUpActive(k)===true))return false;
 if(combatVoices.size>=3){const oldest=combatVoices.values().next().value;if(oldest){oldest.pause();oldest.removeAttribute("src");oldest.load();combatVoices.delete(oldest);}}
 const audio=new Audio(track.url);
 audio.preload="none";audio.loop=false;
 audio.volume=Math.max(0,Math.min(1,(simulation?previewGain("battle"):normalizeVolume(track.kind==="ui"?"ui":"battle",prefs.master,prefs.battle))*Math.max(0,Math.min(1,Number(volume)||0))));if(simulation)audio.dataset.gmPreviewVoice="1";
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
function runtimeStats(){return {sfxVoices:sfxVoices.size,music:!!music,formalMusicVoices:musicVoices.size,preview:!!session,combatVoices:combatVoices.size,unlocked,prohibited:prohibited(),listener:{...listener}};}
document.addEventListener("DOMContentLoaded",()=>prioritizeEraTheme(currentEraForAudio()),{once:true});
document.addEventListener("visibilitychange",update);
window.addEventListener("pagehide",()=>{stop();if(spatialContext&&spatialContext.state!=="closed"){spatialContext.close().catch(()=>{});spatialContext=null;}},{passive:true});
document.addEventListener("pointerdown",()=>{prioritizeEraTheme(currentEraForAudio());unlock();if(music&&music.paused&&!musicMuted()&&!document.querySelector('[data-gm-section="gm-audio-test"][open]'))resumeMusic();},{passive:true});
// Single delegated UI interaction path; keyboard activation uses click as well.
// Skip disabled controls and GM audition to prevent feedback loops.
document.addEventListener("click",event=>{
 const node=event.target?.closest?.("button,[role=button],a[href],input[type=checkbox],input[type=radio],select");
 if(!node||node.disabled||node.getAttribute("aria-disabled")==="true"||node.closest('[data-gm-section="gm-audio-test"]'))return;
 playSfx("ui-click");
},{passive:true});

document.addEventListener("keydown",()=>{prioritizeEraTheme(currentEraForAudio());unlock();});
new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:["class"]});
g.CivilizationAudio=Object.freeze({version:10,tracks,sfxCategories,pickSfx,playSfx,stopSfx,stopBattleSfx,warmCombatSfx,sfxDiagnostics,settlementVictory,currentMusicId,resumeMusic,fadeMusic,prioritizeEraTheme,trackStatus,checkTracks,categoryGain,combatCatalog,combatEvent,settings,setLevel,previewSettings,previewLevel,setPreviewVolume,previewGain,resetPreview,preview,previewSeam,playMusic,stopMusic,stopPreview,stop,update,isSilent:prohibited,isUnlocked:()=>unlocked,setListenerPosition,spatialMetadata,playSpatial,runtimeStats});
})(window);
