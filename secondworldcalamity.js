(function(){
 const VERSION=1;
 const COUNT=10;
 const TRUE_KILLS_REQUIRED=30;
 const FIRST_HP=1000000;
 const HP_STEP=200000;
 const ATK_MULTIPLIER=1.10;
 const DEF_MULTIPLIER=1.05;
 const FIXED_CRIT=10;
 const FIXED_DODGE=10;

 const NAMES=Object.freeze([
  "彼岸黑潮","群星焚爐","邊星獵皇","萬軍葬艦","超域蝕核",
  "無盡兵災","星脈噬巢","巨牆戰堡","深域吞星","終戰天穹"
 ]);

 function int(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)?n:fallback;}
 function clamp(value,min,max){return Math.max(min,Math.min(max,int(value,min)));}
 function currentState(){try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}}
 function targetState(target){return target&&typeof target==="object"?target:currentState();}

 const DEFS=Object.freeze(Array.from({length:COUNT},(_,index)=>{
  const level=550+index*50;
  const bossIndex=9+index*10;
  const region=Array.isArray(window.SECOND_WORLD_REGIONS)?window.SECOND_WORLD_REGIONS[index]:null;
  const boss=Array.isArray(window.SECOND_WORLD_BOSSES)?window.SECOND_WORLD_BOSSES[bossIndex]:null;
  return Object.freeze({
   index,
   id:`universe-calamity-${String(index+1).padStart(2,"0")}`,
   name:NAMES[index],
   level,
   regionIndex:index,
   regionId:region?.id||"",
   regionName:region?.name||"",
   bossIndex,
   bossId:boss?.id||"",
   bossName:boss?.name||"",
   targetCivilizationLevel:index+1,
   previousCivilizationLevel:index,
   maxHp:FIRST_HP+index*HP_STEP,
   atkMultiplier:ATK_MULTIPLIER,
   defMultiplier:DEF_MULTIPLIER,
   crit:FIXED_CRIT,
   dodge:FIXED_DODGE,
   trueKillsRequired:TRUE_KILLS_REQUIRED
  });
 }));

 function indexOf(value){
  if(typeof value==="string"){
   const byId=DEFS.findIndex(def=>def.id===value);
   if(byId>=0)return byId;
  }
  const n=int(value,-1);
  return n>=0&&n<COUNT?n:-1;
 }
 function definition(value){
  const index=indexOf(value);
  return index>=0?DEFS[index]:null;
 }
 function rawEntry(def,target=null){
  const s=targetState(target);
  const row=s?.secondWorld?.calamities?.[def?.index];
  return row&&typeof row==="object"?row:null;
 }
 function trueKills(value,target=null){
  const def=definition(value);if(!def)return 0;
  return clamp(rawEntry(def,target)?.trueKills,0,TRUE_KILLS_REQUIRED);
 }
 function civilization(target=null){
  const s=targetState(target);
  return clamp(s?.secondWorld?.civilizationLevel,0,10);
 }
 function completed(value,target=null){
  const def=definition(value);if(!def)return false;
  return trueKills(def,target)>=TRUE_KILLS_REQUIRED||civilization(target)>=def.targetCivilizationLevel;
 }
 function mainBossCleared(def,target=null){
  const s=targetState(target);
  return s?.secondWorld?.mainline?.bossKilled?.[def.bossIndex]===true;
 }
 function unlockStatus(value,target=null){
  const def=definition(value),s=targetState(target);
  if(!def||!s)return {unlocked:false,reason:"invalid",definition:def};
  if(s?.secondWorld?.entered!==true)return {unlocked:false,reason:"world-locked",definition:def};
  const bossCleared=mainBossCleared(def,s);
  const civLevel=civilization(s);
  const previousCivilizationComplete=civLevel>=def.previousCivilizationLevel;
  const unlocked=bossCleared&&previousCivilizationComplete;
  return {
   unlocked,
   reason:unlocked?"":(!bossCleared?"main-boss": "previous-civilization"),
   definition:def,
   mainBossCleared:bossCleared,
   previousCivilizationComplete,
   civilizationLevel:civLevel,
   requiredCivilizationLevel:def.previousCivilizationLevel
  };
 }
 function canChallenge(value,target=null){return unlockStatus(value,target).unlocked===true;}
 function maxHp(value){return definition(value)?.maxHp||0;}
 function currentHp(value,target=null){
  const def=definition(value);if(!def)return 0;
  if(completed(def,target))return def.maxHp;
  const raw=Number(rawEntry(def,target)?.currentHp);
  return Number.isFinite(raw)&&raw>0?Math.max(1,Math.min(def.maxHp,Math.floor(raw))):def.maxHp;
 }
 function progressPercent(value,target=null){
  return Math.round(trueKills(value,target)/TRUE_KILLS_REQUIRED*10000)/100;
 }
 function status(value,target=null){
  const def=definition(value);if(!def)return null;
  const kills=trueKills(def,target),isCompleted=completed(def,target),unlock=unlockStatus(def,target);
  return {
   definition:def,
   unlocked:unlock.unlocked,
   unlock,
   trueKills:kills,
   trueKillsRequired:TRUE_KILLS_REQUIRED,
   progressPercent:progressPercent(def,target),
   completed:isCompleted,
   currentHp:currentHp(def,target),
   maxHp:def.maxHp,
   hpPercent:def.maxHp>0?currentHp(def,target)/def.maxHp*100:0,
   targetCivilizationLevel:def.targetCivilizationLevel,
   replayFullHp:isCompleted,
   continuousStopsAfterBattleWhenCompleted:isCompleted
  };
 }
 function normalizeSecondWorldCalamityState(target){
  const s=targetState(target);
  if(!s?.secondWorld)return target;
  if(!Array.isArray(s.secondWorld.calamities))s.secondWorld.calamities=[];
  s.secondWorld.calamities=Array.from({length:COUNT},(_,index)=>{
   const def=DEFS[index],source=s.secondWorld.calamities[index];
   const row=source&&typeof source==="object"?source:{};
   const kills=clamp(row.trueKills,0,TRUE_KILLS_REQUIRED);
   const achieved=kills>=TRUE_KILLS_REQUIRED||clamp(s.secondWorld.civilizationLevel,0,10)>=def.targetCivilizationLevel;
   const hp=Number(row.currentHp);
   return {
    currentHp:achieved?null:(Number.isFinite(hp)&&hp>0?Math.max(1,Math.min(def.maxHp,Math.floor(hp))):null),
    trueKills:kills
   };
  });
  return target;
 }
 function validate(){
  const errors=[];
  if(DEFS.length!==COUNT)errors.push({code:"COUNT",actual:DEFS.length});
  DEFS.forEach((def,index)=>{
   const region=window.SECOND_WORLD_REGIONS?.[index],boss=window.SECOND_WORLD_BOSSES?.[def.bossIndex];
   if(def.index!==index)errors.push({code:"INDEX",index});
   if(def.level!==550+index*50)errors.push({code:"LEVEL",index,actual:def.level});
   if(def.bossIndex!==9+index*10)errors.push({code:"BOSS_INDEX",index,actual:def.bossIndex});
   if(def.maxHp!==FIRST_HP+index*HP_STEP)errors.push({code:"HP",index,actual:def.maxHp});
   if(def.targetCivilizationLevel!==index+1||def.previousCivilizationLevel!==index)errors.push({code:"CIVILIZATION_LINK",index});
   if(!region||def.regionId!==region.id||def.regionName!==region.name)errors.push({code:"REGION_LINK",index});
   if(!boss||boss.level!==def.level||def.bossId!==boss.id||def.bossName!==boss.name)errors.push({code:"BOSS_LINK",index});
  });
  return {passed:errors.length===0,version:VERSION,count:DEFS.length,errors};
 }

 window.SECOND_WORLD_CALAMITY_DATA_VERSION=VERSION;
 window.SECOND_WORLD_CALAMITY_STATE_VERSION=1;
 window.SECOND_WORLD_CALAMITY_UNLOCK_VERSION=1;
 window.SECOND_WORLD_CALAMITY_REPLAY_POLICY_VERSION=1;
 window.SECOND_WORLD_CALAMITY_COUNT=COUNT;
 window.SECOND_WORLD_CALAMITY_TRUE_KILLS_REQUIRED=TRUE_KILLS_REQUIRED;
 window.SECOND_WORLD_CALAMITY_FIRST_HP=FIRST_HP;
 window.SECOND_WORLD_CALAMITY_HP_STEP=HP_STEP;
 window.SECOND_WORLD_CALAMITY_ATK_MULTIPLIER=ATK_MULTIPLIER;
 window.SECOND_WORLD_CALAMITY_DEF_MULTIPLIER=DEF_MULTIPLIER;
 window.SECOND_WORLD_CALAMITY_FIXED_CRIT=FIXED_CRIT;
 window.SECOND_WORLD_CALAMITY_FIXED_DODGE=FIXED_DODGE;
 window.SECOND_WORLD_CALAMITY_DEFINITIONS=DEFS;
 window.getSecondWorldCalamityDefinition=definition;
 window.getSecondWorldCalamityDefinitions=()=>DEFS.slice();
 window.getSecondWorldCalamityTrueKills=trueKills;
 window.getSecondWorldCalamityMaxHp=maxHp;
 window.getSecondWorldCalamityCurrentHp=currentHp;
 window.getSecondWorldCalamityProgressPercent=progressPercent;
 window.getSecondWorldCalamityUnlockStatus=unlockStatus;
 window.canChallengeSecondWorldCalamity=canChallenge;
 window.isSecondWorldCalamityCompleted=completed;
 window.getSecondWorldCalamityStatus=status;
 window.normalizeSecondWorldCalamityState=normalizeSecondWorldCalamityState;
 window.SECOND_WORLD_CALAMITY_DATA_INTEGRITY=validate();
 if(typeof registerNewStateNormalizer==="function")registerNewStateNormalizer(normalizeSecondWorldCalamityState);
 if(!window.SECOND_WORLD_CALAMITY_DATA_INTEGRITY.passed)console.error("[文明戰線] Second World Calamity data integrity error",window.SECOND_WORLD_CALAMITY_DATA_INTEGRITY.errors);
})();