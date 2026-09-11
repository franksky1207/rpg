(function(){
 const SAVE_SCHEMA_VERSION=8;
 const STAT_KEYS=["hp","atk","def","crit","dodge"];

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function finiteNonNegative(value,fallback=0){const n=Number(value);return Number.isFinite(n)&&n>=0?n:fallback;}
 function sourceVersionOf(value,fallback=1){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=1?n:fallback;}
 function defaultMainStat(type){return typeof mainStatForType==="function"?mainStatForType(type):(type==="weapon"?"atk":type==="helmet"||type==="shoes"?"hp":type==="armor"?"def":"crit");}

 function prepareLegacyItem(item,forcedType=null){
  if(!isObject(item))return item;
  const type=forcedType||item.type;
  if(!Array.isArray(EQUIPMENT_TYPES)||!EQUIPMENT_TYPES.includes(type))return item;
  item.type=type;
  item.locked=item.locked===true;
  const totals={};
  STAT_KEYS.forEach(key=>{totals[key]=finiteNonNegative(item[key],0);});
  const mainKey=isObject(item.mainStat)&&STAT_KEYS.includes(item.mainStat.stat)?item.mainStat.stat:defaultMainStat(type);
  const rawMain=Number(item.mainStat?.value);
  const mainValue=Number.isFinite(rawMain)&&rawMain>=0?rawMain:totals[mainKey];
  item.mainStat={stat:mainKey,value:typeof round1==="function"?round1(mainValue):mainValue};
  if(!Array.isArray(item.affixes)||item.affixes.length===0){
   const affixes=[];
   STAT_KEYS.forEach(key=>{
    const residual=Math.max(0,totals[key]-(key===mainKey?mainValue:0));
    if(residual>0){affixes.push({stat:key,value:typeof round1==="function"?round1(residual):residual});}
   });
   item.affixes=affixes;
  }
  return item;
 }

 function prepareAllGear(target){
  if(!isObject(target))return;
  if(isObject(target.equipment))EQUIPMENT_TYPES.forEach(type=>prepareLegacyItem(target.equipment[type],type));
  if(Array.isArray(target.inventory))target.inventory.forEach(item=>prepareLegacyItem(item));
  if(Array.isArray(target.lostGear))target.lostGear.forEach(entry=>prepareLegacyItem(entry?.item));
  if(isObject(target.shop)&&Array.isArray(target.shop.items))target.shop.items.forEach(item=>prepareLegacyItem(item));
 }

 function normalizeVoidMirage(target){
  if(!isObject(target))return;
  if(!isObject(target.dungeon))target.dungeon={};
  if(!isObject(target.dungeon.voidMirage))target.dungeon.voidMirage={};
  target.dungeon.voidMirage.highestCleared=Math.floor(finiteNonNegative(target.dungeon.voidMirage.highestCleared,0));
 }

 window.SAVE_SCHEMA_VERSION=SAVE_SCHEMA_VERSION;
 window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){
  let target=isObject(rawState)?rawState:(typeof newState==="function"?newState():{});
  const source=isObject(sourceRaw)?sourceRaw:target;
  const version=sourceVersionOf(fromVersion??source.saveVersion,1);
  const sourceShop=isObject(source.shop)?source.shop:null;
  const shopHadInitialized=!!sourceShop&&typeof sourceShop.initialized==="boolean";
  const shopInitializedValue=shopHadInitialized?sourceShop.initialized:false;
  const introWasBoolean=typeof source.introSeen==="boolean";
  const introValue=introWasBoolean?source.introSeen:true;

  prepareAllGear(target);
  if(!introWasBoolean)target.introSeen=true;
  if(version<4){
   if(!isObject(target.shop))target.shop={};
   target.shop.items=[];
   target.shop.initialized=false;
  }

  const normalize=typeof normalizer==="function"?normalizer:null;
  if(normalize)target=normalize(target);

  prepareAllGear(target);
  if(typeof normalizeWorldSaveState==="function")normalizeWorldSaveState(target);
  if(typeof normalizeVipState==="function")normalizeVipState(target);
  if(typeof normalizeSpecializationState==="function")normalizeSpecializationState(target);
  if(typeof normalizeDungeonSaveState==="function")normalizeDungeonSaveState(target);
  normalizeVoidMirage(target);

  if(!isObject(target.shop))target.shop=typeof newShopState==="function"?newShopState():{items:[],refreshIndex:0,resetAvailableAt:0,initialized:false};
  if(!Array.isArray(target.shop.items))target.shop.items=[];
  if(version<4){
   target.shop.items=[];
   target.shop.initialized=false;
  }else if(shopHadInitialized){
   target.shop.initialized=shopInitializedValue;
  }else{
   target.shop.initialized=target.shop.items.length>0;
  }

  target.introSeen=introValue;
  target.saveVersion=SAVE_SCHEMA_VERSION;
  return target;
 };

 const baseLoad=typeof window.load==="function"?window.load:null;
 if(baseLoad){
  window.load=function(){
   let rawSnapshot=null,sourceVersion=SAVE_SCHEMA_VERSION;
   try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw){rawSnapshot=JSON.parse(raw);sourceVersion=sourceVersionOf(rawSnapshot?.saveVersion,1);}
   }catch(e){rawSnapshot=null;}
   baseLoad();
   const normalizer=typeof window.normalizeSaveState==="function"?window.normalizeSaveState:null;
   state=window.migrateSave(state,sourceVersion,normalizer,rawSnapshot);
   selectedMap=Math.max(0,Math.min(Number(state.unlockedMap)||0,MAPS.length-1));
   if(typeof normalizeHP==="function")normalizeHP();
   if(typeof ensureShop==="function")ensureShop();
   if(typeof save==="function")save(false);
  };
 }
})();
