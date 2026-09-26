(function(){
 const VERSION=1;
 const BOSS_COUNT=100;
 const REGION_COUNT=10;
 const EQUIPMENT_SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
 const REGIONS=Object.freeze([
  {"index":0,"id":"galaxy-beyond","name":"銀河彼端","minLevel":505,"maxLevel":550,"firstBossIndex":0,"lastBossIndex":9},
  {"index":1,"id":"local-group-war","name":"本星系群戰爭","minLevel":555,"maxLevel":600,"firstBossIndex":10,"lastBossIndex":19},
  {"index":2,"id":"star-cluster-frontier","name":"星群邊疆","minLevel":605,"maxLevel":650,"firstBossIndex":20,"lastBossIndex":29},
  {"index":3,"id":"stellar-battlefront","name":"群星會戰","minLevel":655,"maxLevel":700,"firstBossIndex":30,"lastBossIndex":39},
  {"index":4,"id":"trans-domain-frontier","name":"超域邊境","minLevel":705,"maxLevel":750,"firstBossIndex":40,"lastBossIndex":49},
  {"index":5,"id":"myriad-domain-frontline","name":"萬域戰線","minLevel":755,"maxLevel":800,"firstBossIndex":50,"lastBossIndex":59},
  {"index":6,"id":"cosmic-filament","name":"宇宙纖維帶","minLevel":805,"maxLevel":850,"firstBossIndex":60,"lastBossIndex":69},
  {"index":7,"id":"stellar-great-wall","name":"星海巨牆","minLevel":855,"maxLevel":900,"firstBossIndex":70,"lastBossIndex":79},
  {"index":8,"id":"cosmic-deep-domain","name":"宇宙深域","minLevel":905,"maxLevel":950,"firstBossIndex":80,"lastBossIndex":89},
  {"index":9,"id":"cosmic-unification-war","name":"宇宙統合戰爭","minLevel":955,"maxLevel":1000,"firstBossIndex":90,"lastBossIndex":99}
 ].map(row=>Object.freeze({...row})));
 const BOSS_NAMES=["彼岸守門者","裂星王座","黑潮母艦","逐日征服者","天穹殲滅體","銀河殘光主腦","星海霸皇","遠境戰爭中樞","群星墓主","彼岸統合體"];
 const BOSSES=Object.freeze(Array.from({length:BOSS_COUNT},(_,index)=>{
  const regionIndex=Math.floor(index/10),region=REGIONS[regionIndex],level=505+index*5;
  const fallbackName=index===99?"文明終焉核心":`${region.name}・第${index%10+1}戰體`;
  const name=index<10?BOSS_NAMES[index]:fallbackName;
  return Object.freeze({index,id:`universe-boss-${String(index+1).padStart(3,"0")}`,regionIndex,regionId:region.id,regionName:region.name,level,name,equipment:Object.freeze({weapon:`${name}武裝`,helmet:`${name}頭甲`,armor:`${name}戰甲`,shoes:`${name}戰靴`,accessory:`${name}核心`})});
 }));
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}}
 function targetState(target){return target&&typeof target==="object"?target:currentState();}
 function bossIndex(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0&&n<BOSS_COUNT?n:-1;}
 function regionIndex(value){if(typeof value==="string"){const byId=REGIONS.findIndex(row=>row.id===value);if(byId>=0)return byId;}const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0&&n<REGION_COUNT?n:-1;}
 function secondWorldBoss(value){const index=bossIndex(value);return index>=0?BOSSES[index]:null;}
 function secondWorldRegion(value){const index=regionIndex(value);return index>=0?REGIONS[index]:null;}
 function secondWorldBossesForRegion(value){const region=secondWorldRegion(value);return region?BOSSES.slice(region.firstBossIndex,region.lastBossIndex+1):[];}
 function secondWorldBossKilled(value,target=null){const index=bossIndex(value),s=targetState(target);return index>=0&&s?.secondWorld?.mainline?.bossKilled?.[index]===true;}
 function secondWorldBossIndexForPlayerLevel(level){const lv=Math.max(500,Math.min(1000,Math.floor(Number(level)||500)));return Math.max(0,Math.min(BOSS_COUNT-1,Math.floor((lv-500)/5)));}
 function secondWorldBossForPlayerLevel(level){return BOSSES[secondWorldBossIndexForPlayerLevel(level)]||null;}
 function secondWorldBossLevelRequirement(value){const boss=secondWorldBoss(value);return boss?Math.max(500,boss.level-5):null;}
 function secondWorldFormalProgressionEnabled(s){return typeof window.secondWorldProgressionEnabled==="function"?window.secondWorldProgressionEnabled(s)===true:s?.secondWorld?.entered===true&&s?.thirdWorld?.entered!==true;}
 function canChallengeSecondWorldBoss(value,target=null){
  const index=bossIndex(value),s=targetState(target);
  if(index<0||!s||!secondWorldFormalProgressionEnabled(s))return false;
  const boss=BOSSES[index],playerLevel=Math.max(1,Math.floor(Number(s.level)||1));
  if(playerLevel<boss.level-5)return false;
  return index===0||s?.secondWorld?.mainline?.bossKilled?.[index-1]===true;
 }
 function secondWorldBossVisible(value,target=null){const index=bossIndex(value),s=targetState(target);if(index<0||!s||s?.secondWorld?.entered!==true)return false;return secondWorldBossKilled(index,s)||canChallengeSecondWorldBoss(index,s);}
 function secondWorldHighestClearedBossIndex(target=null){const s=targetState(target);if(!s)return -1;let highest=-1;for(let i=0;i<BOSS_COUNT;i++){if(s?.secondWorld?.mainline?.bossKilled?.[i]===true)highest=i;else break;}return highest;}
 function secondWorldHighestUnlockedBossIndex(target=null){const s=targetState(target);if(!s||s?.secondWorld?.entered!==true)return -1;let highest=-1;for(let i=0;i<BOSS_COUNT;i++){if(secondWorldBossKilled(i,s)||canChallengeSecondWorldBoss(i,s))highest=i;else break;}return highest;}
 function secondWorldRegionVisible(value,target=null){const region=secondWorldRegion(value);if(!region)return false;for(let i=region.firstBossIndex;i<=region.lastBossIndex;i++)if(secondWorldBossVisible(i,target))return true;return false;}
 function secondWorldEquipmentNamesForBoss(value){const boss=secondWorldBoss(value);return boss?{...boss.equipment}:null;}
 function validateSecondWorldData(){
  const errors=[],warnings=[];
  if(REGIONS.length!==REGION_COUNT)errors.push({code:"REGION_COUNT",actual:REGIONS.length});
  if(BOSSES.length!==BOSS_COUNT)errors.push({code:"BOSS_COUNT",actual:BOSSES.length});
  const expectedLevels=Array.from({length:BOSS_COUNT},(_,i)=>505+i*5),actualLevels=BOSSES.map(row=>row.level);if(JSON.stringify(actualLevels)!==JSON.stringify(expectedLevels))errors.push({code:"LEVEL_SEQUENCE"});
  REGIONS.forEach((region,index)=>{const rows=secondWorldBossesForRegion(index);if(rows.length!==10)errors.push({code:"REGION_BOSS_COUNT",region:index,actual:rows.length});if(rows.some(row=>row.regionIndex!==index||row.regionId!==region.id||row.regionName!==region.name))errors.push({code:"REGION_LINK",region:index});if(rows[0]?.level!==region.minLevel||rows[rows.length-1]?.level!==region.maxLevel)errors.push({code:"REGION_LEVEL_RANGE",region:index});});
  const bossIds=new Set(BOSSES.map(row=>row.id));if(bossIds.size!==BOSS_COUNT)errors.push({code:"BOSS_ID_DUPLICATE"});
  const gearNames=BOSSES.flatMap(row=>EQUIPMENT_SLOTS.map(slot=>row.equipment?.[slot])).filter(Boolean);if(gearNames.length!==BOSS_COUNT*EQUIPMENT_SLOTS.length)errors.push({code:"GEAR_COUNT",actual:gearNames.length});
  return {passed:errors.length===0,version:VERSION,regionCount:REGIONS.length,bossCount:BOSSES.length,equipmentNameCount:gearNames.length,errors,warnings};
 }
 window.SECOND_WORLD_DATA_VERSION=VERSION;
 window.SECOND_WORLD_REGION_COUNT=REGION_COUNT;
 window.SECOND_WORLD_BOSS_COUNT=BOSS_COUNT;
 window.SECOND_WORLD_EQUIPMENT_SLOTS=EQUIPMENT_SLOTS.slice();
 window.SECOND_WORLD_REGIONS=REGIONS;
 window.SECOND_WORLD_BOSSES=BOSSES;
 window.secondWorldBoss=secondWorldBoss;
 window.secondWorldRegion=secondWorldRegion;
 window.secondWorldBossesForRegion=secondWorldBossesForRegion;
 window.secondWorldBossKilled=secondWorldBossKilled;
 window.secondWorldBossIndexForPlayerLevel=secondWorldBossIndexForPlayerLevel;
 window.secondWorldBossForPlayerLevel=secondWorldBossForPlayerLevel;
 window.SECOND_WORLD_PLAYER_LEVEL_BOSS_OWNER_VERSION=1;
 window.secondWorldBossLevelRequirement=secondWorldBossLevelRequirement;
 window.canChallengeSecondWorldBoss=canChallengeSecondWorldBoss;
 window.secondWorldBossVisible=secondWorldBossVisible;
 window.secondWorldRegionVisible=secondWorldRegionVisible;
 window.secondWorldHighestClearedBossIndex=secondWorldHighestClearedBossIndex;
 window.secondWorldHighestUnlockedBossIndex=secondWorldHighestUnlockedBossIndex;
 window.secondWorldEquipmentNamesForBoss=secondWorldEquipmentNamesForBoss;
 window.SECOND_WORLD_FORMAL_PROGRESSION_GATE_VERSION=1;
 window.validateSecondWorldData=validateSecondWorldData;
 window.SECOND_WORLD_DATA_INTEGRITY=validateSecondWorldData();
 if(!window.SECOND_WORLD_DATA_INTEGRITY.passed)console.error("[文明戰線] Second World data integrity error",window.SECOND_WORLD_DATA_INTEGRITY.errors);else if(window.SECOND_WORLD_DATA_INTEGRITY.warnings?.length)console.warn("[文明戰線] Second World data integrity warning",window.SECOND_WORLD_DATA_INTEGRITY.warnings);
})();
