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
  tier:index+1
 })));
 const IDS=Object.freeze(DEFS.map(row=>row.id));
 const BY_ID=Object.freeze(Object.fromEntries(DEFS.map(row=>[row.id,row])));

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function createBlankPlayerTitleState(){return {version:PLAYER_TITLE_STATE_VERSION,unlocked:[],equipped:null,pendingNotice:null};}
 function normalizePlayerTitleState(target){
  if(!isObject(target))return target;
  const source=isObject(target.titles)?target.titles:createBlankPlayerTitleState();
  const unlocked=new Set(Array.isArray(source.unlocked)?source.unlocked.filter(id=>IDS.includes(id)):[]);
  DEFS.forEach(def=>{
   if(target?.marks?.entries?.[def.markId]?.acquired===true)unlocked.add(def.id);
  });
  const equipped=typeof source.equipped==="string"&&unlocked.has(source.equipped)?source.equipped:null;
  const pendingNotice=typeof source.pendingNotice==="string"&&unlocked.has(source.pendingNotice)?source.pendingNotice:null;
  target.titles={version:PLAYER_TITLE_STATE_VERSION,unlocked:IDS.filter(id=>unlocked.has(id)),equipped,pendingNotice};
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
  const unlocked=new Set(Array.isArray(source.unlocked)?source.unlocked.filter(id=>IDS.includes(id)):[]);
  const firstAcquisition=!unlocked.has(def.id);
  if(firstAcquisition){
   unlocked.add(def.id);
   source.unlocked=IDS.filter(id=>unlocked.has(id));
   source.pendingNotice=def.id;
  }
  source.version=PLAYER_TITLE_STATE_VERSION;
  source.equipped=typeof source.equipped==="string"&&unlocked.has(source.equipped)?source.equipped:null;
  target.titles=source;
  return {changed:firstAcquisition,firstAcquisition,title:def};
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
 function unlockedTitleDefinitions(target=state){
  const unlocked=new Set(Array.isArray(target?.titles?.unlocked)?target.titles.unlocked:[]);
  return DEFS.filter(def=>unlocked.has(def.id));
 }

 window.PLAYER_TITLE_STATE_VERSION=PLAYER_TITLE_STATE_VERSION;
 window.CIVILIZATION_PLAYER_TITLE_DEFS=DEFS;
 window.CIVILIZATION_PLAYER_TITLE_IDS=IDS;
 window.createBlankPlayerTitleState=createBlankPlayerTitleState;
 window.normalizePlayerTitleState=normalizePlayerTitleState;
 window.getPlayerTitleDefinition=titleDefinition;\n window.getPlayerTitleDefinitionForCalamity=titleForCalamity;\n window.grantPlayerTitleForCalamityFirstKill=grantFirstKillTitle;\n window.getPendingPlayerTitleNotice=pendingTitleNotice;\n window.clearPendingPlayerTitleNotice=clearPendingTitleNotice;
 window.getUnlockedPlayerTitleDefinitions=unlockedTitleDefinitions;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePlayerTitleState);
})();
