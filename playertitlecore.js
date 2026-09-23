(function(){
 const PLAYER_TITLE_STATE_VERSION=1;
 const CONFIG=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
 if(CONFIG.length!==10)throw new Error("Player title core requires exactly 10 Civilization Calamity configs.");
 const DEFS=Object.freeze(CONFIG.map((entry,index)=>{
  const id=String(entry?.titleId||"");
  const name=String(entry?.titleName||"");
  if(!id||!name)throw new Error(`Civilization Calamity title metadata missing at index ${index}.`);
  return Object.freeze({
   id,
   name,
   calamityId:entry.id,
   markId:entry.markId,
   tier:index+1,
   series:"calamity",
   order:index+1
  });
 }));
 const UNIVERSE_CONFIG=Array.from(window.SECOND_WORLD_CALAMITY_DEFINITIONS||[]);
 if(UNIVERSE_CONFIG.length!==10)throw new Error("Player title core requires exactly 10 Universe Calamity configs.");
 const UNIVERSE_DEFS=Object.freeze(UNIVERSE_CONFIG.map((entry,index)=>{
  const id=String(entry?.titleId||"");
  const name=String(entry?.titleName||"");
  if(!id||!name)throw new Error(`Universe Calamity title metadata missing at index ${index}.`);
  return Object.freeze({
   id,
   name,
   calamityId:String(entry.id||""),
   tier:Math.max(1,Math.floor(Number(entry.titleTier)||index+1)),
   series:"universe-calamity",
   order:DEFS.length+index+1
  });
 }));
 const MIRROR_UNLOCKS=Array.from(window.MIRROR_DUNGEON_CONFIG?.titleUnlocks||[]);
 if(MIRROR_UNLOCKS.length!==6)throw new Error("Player title core requires exactly 6 Mirror Dungeon title unlocks.");
 const MIRROR_DEFS=Object.freeze(MIRROR_UNLOCKS.map((entry,index)=>Object.freeze({
  id:String(entry.id),
  name:String(entry.name),
  mirrorWins:Math.floor(Number(entry.wins)||0),
  series:"mirror",
  order:DEFS.length+UNIVERSE_DEFS.length+index+1
 })));
 const ALL_DEFS=Object.freeze([...DEFS,...UNIVERSE_DEFS,...MIRROR_DEFS]);
 const IDS=Object.freeze(DEFS.map(row=>row.id));
 const UNIVERSE_IDS=Object.freeze(UNIVERSE_DEFS.map(row=>row.id));
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
  UNIVERSE_DEFS.forEach((def,index)=>{
   const kills=Math.max(0,Math.floor(Number(target?.secondWorld?.calamities?.[index]?.trueKills)||0));
   if(kills>=1)unlocked.add(def.id);
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
 function titleForUniverseCalamity(id){return UNIVERSE_DEFS.find(def=>def.calamityId===String(id||""))||null;}
 function ensureTitleState(target=state){
  if(!isObject(target))return null;
  normalizePlayerTitleState(target);
  return target.titles;
 }
 function grantDefinition(def,target=state){
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
 function grantFirstKillTitle(calamityId,target=state){return grantDefinition(titleForCalamity(calamityId),target);}
 function grantUniverseFirstKillTitle(calamityId,target=state){return grantDefinition(titleForUniverseCalamity(calamityId),target);}
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
  if(noticeTitle)source.pendingNotice=noticeTitle.id;
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

 function equippedTitleDefinition(target=state){
  const id=target?.titles?.equipped;
  return typeof id==="string"&&Array.isArray(target?.titles?.unlocked)&&target.titles.unlocked.includes(id)?titleDefinition(id):null;
 }
 function equipPlayerTitle(id,target=state){
  const titles=ensureTitleState(target);if(!titles)return false;
  if(id==null||id===""){titles.equipped=null;return true;}
  const value=String(id);
  if(!Array.isArray(titles.unlocked)||!titles.unlocked.includes(value)||!BY_ID[value])return false;
  titles.equipped=value;return true;
 }
 function unlockedTitleDefinitions(target=state){
  const unlocked=new Set(Array.isArray(target?.titles?.unlocked)?target.titles.unlocked:[]);
  return ALL_DEFS.filter(def=>unlocked.has(def.id));
 }

 window.PLAYER_TITLE_STATE_VERSION=PLAYER_TITLE_STATE_VERSION;
 window.CIVILIZATION_PLAYER_TITLE_DEFS=DEFS;
 window.CIVILIZATION_PLAYER_TITLE_IDS=IDS;
 window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS=UNIVERSE_DEFS;
 window.UNIVERSE_CALAMITY_PLAYER_TITLE_IDS=UNIVERSE_IDS;
 window.MIRROR_PLAYER_TITLE_DEFS=MIRROR_DEFS;
 window.MIRROR_PLAYER_TITLE_IDS=MIRROR_IDS;
 window.PLAYER_TITLE_DEFS=ALL_DEFS;
 window.PLAYER_TITLE_IDS=ALL_IDS;
 window.createBlankPlayerTitleState=createBlankPlayerTitleState;
 window.normalizePlayerTitleState=normalizePlayerTitleState;
 window.getPlayerTitleDefinition=titleDefinition;
 window.getPlayerTitleDefinitionForCalamity=titleForCalamity;
 window.getPlayerTitleDefinitionForUniverseCalamity=titleForUniverseCalamity;
 window.getPlayerTitleDefinitionForMirrorWins=titleForMirrorWins;
 window.grantPlayerTitleForCalamityFirstKill=grantFirstKillTitle;
 window.grantPlayerTitleForUniverseCalamityFirstKill=grantUniverseFirstKillTitle;
 window.grantPlayerTitlesForMirrorWins=grantMirrorTitlesForWins;
 window.getPendingPlayerTitleNotice=pendingTitleNotice;
 window.clearPendingPlayerTitleNotice=clearPendingTitleNotice;
 window.getUnlockedPlayerTitleDefinitions=unlockedTitleDefinitions;
 window.getEquippedPlayerTitleDefinition=equippedTitleDefinition;
 window.equipPlayerTitle=equipPlayerTitle;
 window.UNIVERSE_CALAMITY_TITLE_BACKFILL_VERSION=1;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePlayerTitleState);
})();
