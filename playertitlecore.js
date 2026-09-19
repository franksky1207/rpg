(function(){
 const PLAYER_TITLE_STATE_VERSION=1;
 const TITLE_NAMES=Object.freeze([
  "灰潮餘燼","蝕日王冠","星骸殘響","黑域孤星","天環墜落",
  "寂滅遠航","萬域寂滅","黑核權柄","無聲王權","萬星終寂"
 ]);
 const CONFIG=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
 if(CONFIG.length!==TITLE_NAMES.length)throw new Error("Player title core requires exactly 10 Civilization Calamity configs.");
 const DEFS=Object.freeze(CONFIG.map((entry,index)=>Object.freeze({
  id:`calamity_title_${String(index+1).padStart(2,"0")}`,
  name:TITLE_NAMES[index],
  calamityId:entry.id,
  markId:entry.markId,
  tier:index+1,
  series:"calamity",
  order:index+1
 })));
 const MIRROR_UNLOCKS=Array.from(window.MIRROR_DUNGEON_CONFIG?.titleUnlocks||[]);
 if(MIRROR_UNLOCKS.length!==6)throw new Error("Player title core requires exactly 6 Mirror Dungeon title unlocks.");
 const MIRROR_DEFS=Object.freeze(MIRROR_UNLOCKS.map((entry,index)=>Object.freeze({
  id:String(entry.id),
  name:String(entry.name),
  mirrorWins:Math.floor(Number(entry.wins)||0),
  series:"mirror",
  order:DEFS.length+index+1
 })));
 const ALL_DEFS=Object.freeze([...DEFS,...MIRROR_DEFS]);
 const IDS=Object.freeze(DEFS.map(row=>row.id));
 const MIRROR_IDS=Object.freeze(MIRROR_DEFS.map(row=>row.id));
 const ALL_IDS=Object.freeze(ALL_DEFS.map(row=>row.id));
 const BY_ID=Object.freeze(Object.fromEntries(ALL_DEFS.map(row=>[row.id,row])));

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function createBlankPlayerTitleState(){return {version:PLAYER_TITLE_STATE_VERSION,unlocked:[],equipped:null,pendingNotice:null};}
 function normalizePlayerTitleState(target){
  if(!isObject(target))return target;
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState();
  const unlocked=new Set(Array.isArray(source.unlocked)?source.unlocked.filter(id=>ALL_IDS.includes(id)):[]);
  DEFS.forEach(def=>{
   if(target?.marks?.entries?.[def.markId]?.acquired===true)unlocked.add(def.id);
  });
  const mirrorBestWins=Math.max(0,Math.floor(Number(target?.dungeon?.mirror?.history?.bestWins)||0));
  MIRROR_DEFS.forEach(def=>{if(mirrorBestWins>=def.mirrorWins)unlocked.add(def.id);});
  const equipped=typeof source.equipped==="string"&&unlocked.has(source.equipped)?source.equipped:null;
  const pendingNotice=typeof source.pendingNotice==="string"&&unlocked.has(source.pendingNotice)?source.pendingNotice:null;
  target.titles={version:PLAYER_TITLE_STATE_VERSION,unlocked:ALL_IDS.filter(id=>unlocked.has(id)),equipped,pendingNotice};
  return target;
 }
 function titleDefinition(id){return BY_ID[String(id||"")]||null;}

 function titleForCalamity(id){return DEFS.find(def=>def.calamityId===String(id||""))||null;}
 function ensureTitleState(target=state){
  if(!isObject(target))return null;
  normalizePlayerTitleState(target);
  return target.titles;
 }
 function grantFirstKillTitle(calamityId,target=state){
  const def=titleForCalamity(calamityId);
  if(!def||!isObject(target))return {changed:false,firstAcquisition:false,title:null};
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState();
  const unlocked=new Set(Array.isArray(source.unlocked)?source.unlocked.filter(id=>ALL_IDS.includes(id)):[]);
  const firstAcquisition=!unlocked.has(def.id);
  if(firstAcquisition){
   unlocked.add(def.id);
   source.unlocked=ALL_IDS.filter(id=>unlocked.has(id));
   source.pendingNotice=def.id;
  }
  source.version=PLAYER_TITLE_STATE_VERSION;
  source.equipped=typeof source.equipped==="string"&&unlocked.has(source.equipped)?source.equipped:null;
  target.titles=source;
  return {changed:firstAcquisition,firstAcquisition,title:def};
 }
 function titleForMirrorWins(value){
  const wins=Math.floor(Number(value)||0);
  return MIRROR_DEFS.find(def=>def.mirrorWins===wins)||null;
 }
 function grantMirrorTitlesForWins(bestWins,target=state,options={}){
  if(!isObject(target))return {changed:false,unlockedTitles:[],noticeTitle:null,bestWins:0};
  const wins=Math.max(0,Math.floor(Number(bestWins)||0));
  const previousBestWins=Math.max(0,Math.floor(Number(options?.previousBestWins)||0));
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState();
  const unlocked=new Set(Array.isArray(source.unlocked)?source.unlocked.filter(id=>ALL_IDS.includes(id)):[]);
  const eligible=MIRROR_DEFS.filter(def=>wins>=def.mirrorWins);
  const newlyUnlocked=[];
  eligible.forEach(def=>{if(!unlocked.has(def.id)){unlocked.add(def.id);newlyUnlocked.push(def);}});
  source.version=PLAYER_TITLE_STATE_VERSION;
  source.unlocked=ALL_IDS.filter(id=>unlocked.has(id));
  source.equipped=typeof source.equipped==="string"&&unlocked.has(source.equipped)?source.equipped:null;
  const noticeCandidates=newlyUnlocked.filter(def=>wins>previousBestWins&&def.mirrorWins>previousBestWins);
  const noticeTitle=noticeCandidates.length?noticeCandidates[noticeCandidates.length-1]:null;
  target.titles=source;
  return {changed:newlyUnlocked.length>0,unlockedTitles:newlyUnlocked,noticeTitle,bestWins:wins,previousBestWins};
 }

 function pendingTitleNotice(target=state){
  const titles=ensureTitleState(target),id=titles?.pendingNotice;
  return typeof id==="string"?titleDefinition(id):null;
 }
 function clearPendingTitleNotice(target=state){
  const titles=ensureTitleState(target);
  if(!titles?.pendingNotice)return false;
  titles.pendingNotice=null;
  return true;
 }

 function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
 function equippedTitleDefinition(target=state){
  const id=target?.titles?.equipped;
  return typeof id==="string"&&Array.isArray(target?.titles?.unlocked)&&target.titles.unlocked.includes(id)?titleDefinition(id):null;
 }
 function playerTitleHtml(id){
  const def=titleDefinition(id);
  if(!def)return "";
  const series=def.series==="mirror"?"mirror":"calamity";
  const visualClass=series==="mirror"
   ?`player-title--mirror player-title--mirror-${def.mirrorWins}`
   :`player-title--tier-${def.tier}`;
  return `<span class="player-title player-title--${series} ${visualClass}" data-player-title-id="${esc(def.id)}">${esc(def.name)}</span>`;
 }
 function playerIdentityNameHtml(options={}){
  const target=options.target&&typeof options.target==="object"?options.target:state;
  const rawName=options.name!=null?String(options.name):String(target?.playerName||"玩家");
  const name=rawName.trim()||"玩家";
  const titleId=options.titleId!==undefined?options.titleId:equippedTitleDefinition(target)?.id;
  const title=titleId?playerTitleHtml(titleId):"";
  const prefix=options.prefix?esc(options.prefix):"";
  const nameHtml=`<span class="player-identity-name">${prefix}${esc(name)}</span>`;
  return `<span class="player-identity${options.compact?" player-identity--compact":""}">${title}${nameHtml}</span>`;
 }
 function equipPlayerTitle(id,target=state){
  const titles=ensureTitleState(target);if(!titles)return false;
  if(id==null||id===""){titles.equipped=null;return true;}
  const value=String(id);
  if(!Array.isArray(titles.unlocked)||!titles.unlocked.includes(value)||!BY_ID[value])return false;
  titles.equipped=value;return true;
 }
 function titleChoiceHtml(target=state){
  const unlocked=unlockedTitleDefinitions(target);
  const equipped=target?.titles?.equipped||null;
  const none=`<button class="player-title-choice ${equipped?"":"active"}" onclick="selectPlayerTitle(null)"><span class="player-title-choice-name">不裝備稱號</span></button>`;
  return none+unlocked.map(def=>`<button class="player-title-choice ${equipped===def.id?"active":""}" onclick="selectPlayerTitle('${esc(def.id)}')">${playerTitleHtml(def.id)}</button>`).join("");
 }
 function ensureTitlePickerModal(){
  let modal=document.getElementById("playerTitlePickerModal");
  if(modal)return modal;
  modal=document.createElement("div");modal.id="playerTitlePickerModal";modal.className="modal";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");document.body.appendChild(modal);return modal;
 }
 function openPlayerTitlePicker(){
  const unlocked=unlockedTitleDefinitions(state);if(!unlocked.length)return false;
  const modal=ensureTitlePickerModal();
  modal.innerHTML=`<div class="modal-box player-title-picker"><h3>選擇稱號</h3><div class="player-title-choice-list">${titleChoiceHtml(state)}</div><div class="controls"><button class="btn" onclick="closePlayerTitlePicker()">關閉</button></div></div>`;
  modal.classList.add("show");return true;
 }
 function closePlayerTitlePicker(){const modal=document.getElementById("playerTitlePickerModal");if(modal){modal.classList.remove("show");modal.remove();}return true;}
 function selectPlayerTitle(id){
  if(!equipPlayerTitle(id,state))return false;
  if(typeof save==="function")save(false);
  closePlayerTitlePicker();
  if(typeof render==="function")render();
  return true;
 }
 function unlockedTitleDefinitions(target=state){
  const unlocked=new Set(Array.isArray(target?.titles?.unlocked)?target.titles.unlocked:[]);
  return ALL_DEFS.filter(def=>unlocked.has(def.id));
 }

 window.PLAYER_TITLE_STATE_VERSION=PLAYER_TITLE_STATE_VERSION;
 window.CIVILIZATION_PLAYER_TITLE_DEFS=DEFS;
 window.CIVILIZATION_PLAYER_TITLE_IDS=IDS;
 window.MIRROR_PLAYER_TITLE_DEFS=MIRROR_DEFS;
 window.MIRROR_PLAYER_TITLE_IDS=MIRROR_IDS;
 window.PLAYER_TITLE_DEFS=ALL_DEFS;
 window.PLAYER_TITLE_IDS=ALL_IDS;
 window.createBlankPlayerTitleState=createBlankPlayerTitleState;
 window.normalizePlayerTitleState=normalizePlayerTitleState;
 window.getPlayerTitleDefinition=titleDefinition;
 window.getPlayerTitleDefinitionForCalamity=titleForCalamity;
 window.getPlayerTitleDefinitionForMirrorWins=titleForMirrorWins;
 window.grantPlayerTitleForCalamityFirstKill=grantFirstKillTitle;
 window.grantPlayerTitlesForMirrorWins=grantMirrorTitlesForWins;
 window.getPendingPlayerTitleNotice=pendingTitleNotice;
 window.clearPendingPlayerTitleNotice=clearPendingTitleNotice;
 window.getUnlockedPlayerTitleDefinitions=unlockedTitleDefinitions;
 window.getEquippedPlayerTitleDefinition=equippedTitleDefinition;
 window.playerTitleHtml=playerTitleHtml;
 window.playerIdentityNameHtml=playerIdentityNameHtml;
 window.equipPlayerTitle=equipPlayerTitle;
 window.openPlayerTitlePicker=openPlayerTitlePicker;
 window.closePlayerTitlePicker=closePlayerTitlePicker;
 window.selectPlayerTitle=selectPlayerTitle;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePlayerTitleState);
})();
