(function(){
 const PLAYER_TITLE_STATE_VERSION=1;
 const CONFIG=Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);
 if(CONFIG.length!==10)throw new Error("Player title core requires exactly 10 Civilization Calamity configs.");
 const DEFS=Object.freeze(CONFIG.map((entry,index)=>{
  const id=String(entry?.titleId||"");
  const name=String(entry?.titleName||"");
  if(!id||!name)throw new Error(`Civilization Calamity title metadata missing at index ${index}.`);
  return Object.freeze({id,name,calamityId:entry.id,markId:entry.markId,tier:index+1,series:"calamity",order:index+1});
 }));
 const UNIVERSE_CONFIG=Array.from(window.SECOND_WORLD_CALAMITY_DEFINITIONS||[]);
 if(UNIVERSE_CONFIG.length!==10)throw new Error("Player title core requires exactly 10 Universe Calamity configs.");
 const UNIVERSE_DEFS=Object.freeze(UNIVERSE_CONFIG.map((entry,index)=>{
  const id=String(entry?.titleId||"");
  const name=String(entry?.titleName||"");
  if(!id||!name)throw new Error(`Universe Calamity title metadata missing at index ${index}.`);
  return Object.freeze({id,name,calamityId:String(entry.id||""),tier:Math.max(1,Math.floor(Number(entry.titleTier)||index+1)),series:"universe-calamity",order:DEFS.length+index+1});
 }));
 const THIRD_WORLD_SOURCE=Array.from(window.THIRD_WORLD_TITLE_DEFINITIONS||[]);
 if(THIRD_WORLD_SOURCE.length!==10)throw new Error("Player title core requires exactly 10 Higher-dimensional title definitions.");
 const THIRD_WORLD_DEFS=Object.freeze(THIRD_WORLD_SOURCE.map((entry,index)=>{
  const id=String(entry?.id||""),name=String(entry?.name||""),tier=Math.max(1,Math.floor(Number(entry?.tier)||index+1));
  if(!id||!name||tier!==index+1)throw new Error(`Higher-dimensional title metadata missing at index ${index}.`);
  return Object.freeze({id,name,tier,series:"higher-dimensional",thresholdRemainingPercentSum:Number(entry?.thresholdRemainingPercentSum),thresholdRemainingHp:Number(entry?.thresholdRemainingHp),order:DEFS.length+UNIVERSE_DEFS.length+index+1});
 }));
 const ALTERNATE_UNIVERSE_SOURCE=Array.from(window.ALTERNATE_UNIVERSE_TITLE_ROWS||[]);
 if(ALTERNATE_UNIVERSE_SOURCE.length!==10)throw new Error("Player title core requires exactly 10 Alternate Universe title definitions.");
 const ALTERNATE_UNIVERSE_DEFS=Object.freeze(ALTERNATE_UNIVERSE_SOURCE.map((entry,index)=>{
  const id=String(entry?.id||""),name=String(entry?.name||""),tier=Math.floor(Number(entry?.tier)),depthThreshold=Math.floor(Number(entry?.depthThreshold));
  const previousThreshold=index>0?Math.floor(Number(ALTERNATE_UNIVERSE_SOURCE[index-1]?.depthThreshold)):0;
  if(!id||!name||name.length!==4||tier!==index+1||!Number.isInteger(depthThreshold)||depthThreshold<=previousThreshold||depthThreshold<=0)throw new Error(`Alternate Universe title metadata missing at index ${index}.`);
  return Object.freeze({id,name,tier,depthThreshold,series:"alternate-universe",order:DEFS.length+UNIVERSE_DEFS.length+THIRD_WORLD_DEFS.length+index+1});
 }));
 const MIRROR_UNLOCKS=Array.from(window.MIRROR_DUNGEON_CONFIG?.titleUnlocks||[]);
 if(MIRROR_UNLOCKS.length!==6)throw new Error("Player title core requires exactly 6 Mirror Dungeon title unlocks.");
 const MIRROR_DEFS=Object.freeze(MIRROR_UNLOCKS.map((entry,index)=>Object.freeze({id:String(entry.id),name:String(entry.name),mirrorWins:Math.floor(Number(entry.wins)||0),series:"mirror",order:DEFS.length+UNIVERSE_DEFS.length+THIRD_WORLD_DEFS.length+ALTERNATE_UNIVERSE_DEFS.length+index+1})));
 // Canonical display/persistence order policy: chronological era titles first; Mirror titles are always last because they are the rarest series.
 const CATALOG_DEFS=Object.freeze([...DEFS,...UNIVERSE_DEFS,...THIRD_WORLD_DEFS,...ALTERNATE_UNIVERSE_DEFS,...MIRROR_DEFS]);
 const IDS=Object.freeze(DEFS.map(row=>row.id));
 const UNIVERSE_IDS=Object.freeze(UNIVERSE_DEFS.map(row=>row.id));
 const MIRROR_IDS=Object.freeze(MIRROR_DEFS.map(row=>row.id));
 const THIRD_WORLD_IDS=Object.freeze(THIRD_WORLD_DEFS.map(row=>row.id));
 const ALTERNATE_UNIVERSE_IDS=Object.freeze(ALTERNATE_UNIVERSE_DEFS.map(row=>row.id));
 const CATALOG_IDS=Object.freeze(CATALOG_DEFS.map(row=>row.id));
 const BY_ID=Object.freeze(Object.fromEntries(CATALOG_DEFS.map(row=>[row.id,row])));

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function createBlankPlayerTitleState(){return {version:PLAYER_TITLE_STATE_VERSION,unlocked:[],equipped:null,pendingNotice:null};}
 function validUnlockedSet(values){
  const unlocked=new Set();
  if(Array.isArray(values))values.forEach(id=>{if(typeof id==="string"&&BY_ID[id])unlocked.add(id);});
  return unlocked;
 }
 function sanitizePlayerTitleState(sourceLike,unlockedValues=null){
  const source=isObject(sourceLike)?sourceLike:createBlankPlayerTitleState();
  const unlocked=unlockedValues instanceof Set?new Set(Array.from(unlockedValues).filter(id=>typeof id==="string"&&BY_ID[id])):validUnlockedSet(source.unlocked);
  source.version=PLAYER_TITLE_STATE_VERSION;
  source.unlocked=CATALOG_IDS.filter(id=>unlocked.has(id));
  source.equipped=typeof source.equipped==="string"&&unlocked.has(source.equipped)?source.equipped:null;
  source.pendingNotice=typeof source.pendingNotice==="string"&&unlocked.has(source.pendingNotice)?source.pendingNotice:null;
  return {source,unlocked};
 }
 function universeCalamityRow(target,def,index){
  const rows=Array.isArray(target?.secondWorld?.calamities)?target.secondWorld.calamities:[];
  return rows.find(row=>row&&typeof row==="object"&&row.calamityId===def.calamityId)||rows[index]||null;
 }
 function thirdWorldEligibleTier(target){
  if(target?.thirdWorld?.entered!==true||typeof window.thirdWorldTitleTier!=="function")return 0;
  return Math.max(0,Math.min(10,Math.floor(Number(window.thirdWorldTitleTier(target))||0)));
 }
 function alternateUniverseEligibleTierForDepth(value){
  const deepest=Math.max(0,Math.floor(Number(value)||0));
  return ALTERNATE_UNIVERSE_DEFS.filter(def=>deepest>=def.depthThreshold).length;
 }
 function alternateUniverseEligibleTier(target){
  const raw=typeof window.alternateUniverseDeepestCleared==="function"?window.alternateUniverseDeepestCleared(target):target?.reincarnation?.alternateUniverse?.deepestCleared;
  return alternateUniverseEligibleTierForDepth(raw);
 }
 function normalizePlayerTitleState(target){
  if(!isObject(target))return target;
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState();
  const beforeUnlocked=validUnlockedSet(source.unlocked),beforeIds=CATALOG_IDS.filter(id=>beforeUnlocked.has(id));
  const unlocked=new Set(beforeUnlocked);
  DEFS.forEach(def=>{if(target?.marks?.entries?.[def.markId]?.acquired===true)unlocked.add(def.id);});
  UNIVERSE_DEFS.forEach((def,index)=>{const kills=Math.max(0,Math.floor(Number(universeCalamityRow(target,def,index)?.trueKills)||0));if(kills>=1)unlocked.add(def.id);});
  const mirrorBestWins=Math.max(0,Math.floor(Number(target?.dungeon?.mirror?.history?.bestWins)||0));
  MIRROR_DEFS.forEach(def=>{if(mirrorBestWins>=def.mirrorWins)unlocked.add(def.id);});
  const higherTier=thirdWorldEligibleTier(target);
  THIRD_WORLD_DEFS.forEach(def=>{if(higherTier>=def.tier)unlocked.add(def.id);});
  const alternateTier=alternateUniverseEligibleTier(target);
  ALTERNATE_UNIVERSE_DEFS.forEach(def=>{if(alternateTier>=def.tier)unlocked.add(def.id);});
  target.titles=sanitizePlayerTitleState(source,unlocked).source;
  const afterIds=Array.isArray(target.titles?.unlocked)?target.titles.unlocked.slice():[];
  const addedIds=afterIds.filter(id=>!beforeUnlocked.has(id)),removedIds=beforeIds.filter(id=>!afterIds.includes(id));
  const alternateUniverseBackfilledIds=addedIds.filter(id=>ALTERNATE_UNIVERSE_IDS.includes(id));
  window.LAST_PLAYER_TITLE_NORMALIZATION_REPORT=Object.freeze({version:1,addedCount:addedIds.length,removedCount:removedIds.length,addedIds:Object.freeze(addedIds),removedIds:Object.freeze(removedIds),alternateUniverseBackfilledCount:alternateUniverseBackfilledIds.length,alternateUniverseBackfilledIds:Object.freeze(alternateUniverseBackfilledIds)});
  return target;
 }
 function titleDefinition(id){return BY_ID[String(id||"")]||null;}
 function titleForCalamity(id){return DEFS.find(def=>def.calamityId===String(id||""))||null;}
 function titleForUniverseCalamity(id){return UNIVERSE_DEFS.find(def=>def.calamityId===String(id||""))||null;}
 function titleForMirrorWins(value){const wins=Math.floor(Number(value)||0);return MIRROR_DEFS.find(def=>def.mirrorWins===wins)||null;}
 function titleForThirdWorldTier(value){const tier=Math.floor(Number(value)||0);return THIRD_WORLD_DEFS.find(def=>def.tier===tier)||null;}
 function titleForAlternateUniverseTier(value){const tier=Math.floor(Number(value)||0);return ALTERNATE_UNIVERSE_DEFS.find(def=>def.tier===tier)||null;}
 function titleForAlternateUniverseDepth(value){const depth=Math.max(0,Math.floor(Number(value)||0));return ALTERNATE_UNIVERSE_DEFS.find(def=>def.depthThreshold===depth)||null;}
 function ensureTitleState(target=state){if(!isObject(target))return null;normalizePlayerTitleState(target);return target.titles;}
 function grantDefinition(def,target=state){
  if(!def||!isObject(target))return {changed:false,firstAcquisition:false,title:null};
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState();
  const unlocked=validUnlockedSet(source.unlocked);
  const firstAcquisition=!unlocked.has(def.id);
  if(firstAcquisition)unlocked.add(def.id);
  const sanitized=sanitizePlayerTitleState(source,unlocked).source;
  if(firstAcquisition)sanitized.pendingNotice=def.id;
  target.titles=sanitized;
  return {changed:firstAcquisition,firstAcquisition,title:def};
 }
 function grantFirstKillTitle(calamityId,target=state){return grantDefinition(titleForCalamity(calamityId),target);}
 function grantUniverseFirstKillTitle(calamityId,target=state){return grantDefinition(titleForUniverseCalamity(calamityId),target);}
 function grantMirrorTitlesForWins(bestWins,target=state,options={}){
  if(!isObject(target))return {changed:false,unlockedTitles:[],noticeTitle:null,bestWins:0};
  const wins=Math.max(0,Math.floor(Number(bestWins)||0));
  const previousBestWins=Math.max(0,Math.floor(Number(options?.previousBestWins)||0));
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState();
  const unlocked=validUnlockedSet(source.unlocked);
  const eligible=MIRROR_DEFS.filter(def=>wins>=def.mirrorWins),newlyUnlocked=[];
  eligible.forEach(def=>{if(!unlocked.has(def.id)){unlocked.add(def.id);newlyUnlocked.push(def);}});
  const sanitized=sanitizePlayerTitleState(source,unlocked).source;
  const noticeCandidates=newlyUnlocked.filter(def=>wins>previousBestWins&&def.mirrorWins>previousBestWins);
  const noticeTitle=noticeCandidates.length?noticeCandidates[noticeCandidates.length-1]:null;
  if(noticeTitle)sanitized.pendingNotice=noticeTitle.id;
  target.titles=sanitized;
  return {changed:newlyUnlocked.length>0,unlockedTitles:newlyUnlocked,noticeTitle,bestWins:wins,previousBestWins};
 }
 function grantThirdWorldTitlesForTier(tier,target=state,options={}){
  if(!isObject(target))return {changed:false,unlockedTitles:[],noticeTitle:null,tier:0,previousTier:0};
  const currentTier=Math.max(0,Math.min(10,Math.floor(Number(tier)||0))),previousTier=Math.max(0,Math.min(10,Math.floor(Number(options?.previousTier)||0)));
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState(),unlocked=validUnlockedSet(source.unlocked),newlyUnlocked=[];
  THIRD_WORLD_DEFS.filter(def=>currentTier>=def.tier).forEach(def=>{if(!unlocked.has(def.id)){unlocked.add(def.id);newlyUnlocked.push(def);}});
  const sanitized=sanitizePlayerTitleState(source,unlocked).source;
  const noticeCandidates=newlyUnlocked.filter(def=>currentTier>previousTier&&def.tier>previousTier);
  const noticeTitle=noticeCandidates.length?noticeCandidates[noticeCandidates.length-1]:null;
  if(noticeTitle)sanitized.pendingNotice=noticeTitle.id;
  target.titles=sanitized;
  return {changed:newlyUnlocked.length>0,unlockedTitles:newlyUnlocked,noticeTitle,tier:currentTier,previousTier};
 }
 function grantAlternateUniverseTitlesForDepth(depth,target=state,options={}){
  if(!isObject(target))return {changed:false,unlockedTitles:[],noticeTitle:null,depth:0,previousDepth:0,tier:0,previousTier:0};
  const lastThreshold=ALTERNATE_UNIVERSE_DEFS.length?ALTERNATE_UNIVERSE_DEFS[ALTERNATE_UNIVERSE_DEFS.length-1].depthThreshold:0,maxDepth=Math.max(lastThreshold,Math.floor(Number(window.ALTERNATE_UNIVERSE_MAX_DEPTH)||lastThreshold));
  const currentDepth=Math.max(0,Math.min(maxDepth,Math.floor(Number(depth)||0))),previousDepth=Math.max(0,Math.min(maxDepth,Math.floor(Number(options?.previousDepth)||0)));
  const currentTier=alternateUniverseEligibleTierForDepth(currentDepth),previousTier=alternateUniverseEligibleTierForDepth(previousDepth);
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState(),unlocked=validUnlockedSet(source.unlocked),newlyUnlocked=[];
  ALTERNATE_UNIVERSE_DEFS.filter(def=>currentDepth>=def.depthThreshold).forEach(def=>{if(!unlocked.has(def.id)){unlocked.add(def.id);newlyUnlocked.push(def);}});
  const sanitized=sanitizePlayerTitleState(source,unlocked).source;
  const noticeCandidates=newlyUnlocked.filter(def=>currentTier>previousTier&&def.tier>previousTier);
  const noticeTitle=noticeCandidates.length?noticeCandidates[noticeCandidates.length-1]:null;
  if(noticeTitle)sanitized.pendingNotice=noticeTitle.id;
  target.titles=sanitized;
  return {changed:newlyUnlocked.length>0,unlockedTitles:newlyUnlocked,noticeTitle,depth:currentDepth,previousDepth,tier:currentTier,previousTier};
 }
 function pendingTitleNotice(target=state){const titles=ensureTitleState(target),id=titles?.pendingNotice;return typeof id==="string"?titleDefinition(id):null;}
 function clearPendingTitleNotice(target=state){const titles=ensureTitleState(target);if(!titles?.pendingNotice)return false;titles.pendingNotice=null;return true;}
 function equippedTitleDefinition(target=state){const id=target?.titles?.equipped;return typeof id==="string"&&Array.isArray(target?.titles?.unlocked)&&target.titles.unlocked.includes(id)?titleDefinition(id):null;}
 function equipPlayerTitle(id,target=state){const titles=ensureTitleState(target);if(!titles)return false;if(id==null||id===""){titles.equipped=null;return true;}const value=String(id);if(!Array.isArray(titles.unlocked)||!titles.unlocked.includes(value)||!BY_ID[value])return false;titles.equipped=value;return true;}
 function unlockedTitleDefinitions(target=state){const unlocked=new Set(Array.isArray(target?.titles?.unlocked)?target.titles.unlocked:[]);return CATALOG_DEFS.filter(def=>unlocked.has(def.id));}

 window.PLAYER_TITLE_STATE_VERSION=PLAYER_TITLE_STATE_VERSION;
 window.CIVILIZATION_PLAYER_TITLE_DEFS=DEFS;
 window.CIVILIZATION_PLAYER_TITLE_IDS=IDS;
 window.UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS=UNIVERSE_DEFS;
 window.UNIVERSE_CALAMITY_PLAYER_TITLE_IDS=UNIVERSE_IDS;
 window.MIRROR_PLAYER_TITLE_DEFS=MIRROR_DEFS;
 window.MIRROR_PLAYER_TITLE_IDS=MIRROR_IDS;
 window.THIRD_WORLD_PLAYER_TITLE_DEFS=THIRD_WORLD_DEFS;
 window.THIRD_WORLD_PLAYER_TITLE_IDS=THIRD_WORLD_IDS;
 window.ALTERNATE_UNIVERSE_PLAYER_TITLE_DEFS=ALTERNATE_UNIVERSE_DEFS;
 window.ALTERNATE_UNIVERSE_PLAYER_TITLE_IDS=ALTERNATE_UNIVERSE_IDS;
 window.PLAYER_TITLE_DEFS=CATALOG_DEFS;
 window.PLAYER_TITLE_IDS=CATALOG_IDS;
 window.PLAYER_TITLE_CATALOG_DEFS=CATALOG_DEFS;
 window.PLAYER_TITLE_CATALOG_IDS=CATALOG_IDS;
 window.PLAYER_TITLE_ALL_DEFS=CATALOG_DEFS;
 window.PLAYER_TITLE_ALL_IDS=CATALOG_IDS;
 window.PLAYER_TITLE_CATALOG_VERSION=5;
 window.PLAYER_TITLE_CANONICAL_CATALOG_VERSION=4;
 window.PLAYER_TITLE_THIRD_WORLD_CATALOG_EXTENSION_VERSION=1;
 window.PLAYER_TITLE_UNIFIED_DEFS_VERSION=2;
 window.PLAYER_TITLE_ALTERNATE_UNIVERSE_CATALOG_EXTENSION_VERSION=1;
 window.PLAYER_TITLE_ALTERNATE_UNIVERSE_THRESHOLD_OWNER_VERSION=1;
 window.PLAYER_TITLE_NORMALIZATION_DIAGNOSTICS_VERSION=1;
 window.PLAYER_TITLE_MIRROR_LAST_ORDER_VERSION=1;
 window.createBlankPlayerTitleState=createBlankPlayerTitleState;
 window.normalizePlayerTitleState=normalizePlayerTitleState;
 window.getPlayerTitleDefinition=titleDefinition;
 window.getPlayerTitleDefinitionForCalamity=titleForCalamity;
 window.getPlayerTitleDefinitionForUniverseCalamity=titleForUniverseCalamity;
 window.getPlayerTitleDefinitionForMirrorWins=titleForMirrorWins;
 window.getPlayerTitleDefinitionForThirdWorldTier=titleForThirdWorldTier;
 window.getPlayerTitleDefinitionForAlternateUniverseTier=titleForAlternateUniverseTier;
 window.getPlayerTitleDefinitionForAlternateUniverseDepth=titleForAlternateUniverseDepth;
 window.getAlternateUniversePlayerTitleEligibleTierForDepth=alternateUniverseEligibleTierForDepth;
 window.grantPlayerTitleForCalamityFirstKill=grantFirstKillTitle;
 window.grantPlayerTitleForUniverseCalamityFirstKill=grantUniverseFirstKillTitle;
 window.grantPlayerTitlesForMirrorWins=grantMirrorTitlesForWins;
 window.grantPlayerTitlesForThirdWorldTier=grantThirdWorldTitlesForTier;
 window.grantPlayerTitlesForAlternateUniverseDepth=grantAlternateUniverseTitlesForDepth;
 window.getPendingPlayerTitleNotice=pendingTitleNotice;
 window.clearPendingPlayerTitleNotice=clearPendingTitleNotice;
 window.getUnlockedPlayerTitleDefinitions=unlockedTitleDefinitions;
 window.getEquippedPlayerTitleDefinition=equippedTitleDefinition;
 window.equipPlayerTitle=equipPlayerTitle;
 window.UNIVERSE_CALAMITY_TITLE_BACKFILL_VERSION=1;
 window.UNIVERSE_CALAMITY_TITLE_ID_BACKFILL_VERSION=1;
 window.THIRD_WORLD_TITLE_BACKFILL_VERSION=1;
 window.ALTERNATE_UNIVERSE_TITLE_BACKFILL_VERSION=1;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePlayerTitleState);
})();
