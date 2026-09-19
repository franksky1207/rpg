(function(){
 const PLAYER_TITLE_STATE_VERSION=1;
 const DEFS=Object.freeze([
  {id:"calamity_title_01",name:"灰潮餘燼",calamityId:"gray_tide",markId:"ward",tier:1},
  {id:"calamity_title_02",name:"蝕日王冠",calamityId:"eclipse_throne",markId:"suppression",tier:2},
  {id:"calamity_title_03",name:"星骸殘響",calamityId:"starbone_corridor",markId:"composure",tier:3},
  {id:"calamity_title_04",name:"黑域孤星",calamityId:"dark_domain_shepherd",markId:"indomitable",tier:4},
  {id:"calamity_title_05",name:"天環墜落",calamityId:"world_end_ring",markId:"resilience",tier:5},
  {id:"calamity_title_06",name:"寂滅遠航",calamityId:"silent_ark",markId:"battleSpirit",tier:6},
  {id:"calamity_title_07",name:"萬域寂滅",calamityId:"myriad_devouring_tide",markId:"absorption",tier:7},
  {id:"calamity_title_08",name:"黑核權柄",calamityId:"deep_core_singularity",markId:"revenge",tier:8},
  {id:"calamity_title_09",name:"無聲王權",calamityId:"silent_judgment",markId:"backlash",tier:9},
  {id:"calamity_title_10",name:"萬星終寂",calamityId:"end_eye",markId:"ignore",tier:10}
 ].map(row=>Object.freeze(row)));
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
 function unlockedTitleDefinitions(target=state){
  const unlocked=new Set(Array.isArray(target?.titles?.unlocked)?target.titles.unlocked:[]);
  return DEFS.filter(def=>unlocked.has(def.id));
 }

 window.PLAYER_TITLE_STATE_VERSION=PLAYER_TITLE_STATE_VERSION;
 window.CIVILIZATION_PLAYER_TITLE_DEFS=DEFS;
 window.CIVILIZATION_PLAYER_TITLE_IDS=IDS;
 window.createBlankPlayerTitleState=createBlankPlayerTitleState;
 window.normalizePlayerTitleState=normalizePlayerTitleState;
 window.getPlayerTitleDefinition=titleDefinition;
 window.getUnlockedPlayerTitleDefinitions=unlockedTitleDefinitions;
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizePlayerTitleState);
})();
