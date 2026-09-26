(function(){
 const VERSION=1;
 const FIRST_WORLD_LEVEL_CAP=500;
 const SECOND_WORLD_LEVEL_CAP=1000;
 const THIRD_WORLD_LEVEL_CAP=2000;
 const ABSOLUTE_MAX_LEVEL=2000;
 const THIRD_WORLD_EXP_PER_LEVEL=10000000;

 function currentState(){
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}
  catch(e){return null;}
 }
 function targetState(target){return target&&typeof target==="object"?target:currentState();}
 function currentLevelWorldPhase(target=null){
  const s=targetState(target);
  if(!s)return 1;
  if(typeof window.currentWorldPhase==="function"){
   try{
    const phase=Number(window.currentWorldPhase(s));
    if(Number.isInteger(phase)&&phase>=1&&phase<=3)return phase;
   }catch(e){}
  }
  if(s?.thirdWorld?.entered===true)return 3;
  if(s?.secondWorld?.entered===true)return 2;
  return 1;
 }
 function effectiveLevelCap(target=null){
  const phase=currentLevelWorldPhase(target);
  if(phase===3)return THIRD_WORLD_LEVEL_CAP;
  if(phase===2)return SECOND_WORLD_LEVEL_CAP;
  return FIRST_WORLD_LEVEL_CAP;
 }
 function clampEffectiveGameLevel(level,target=null){
  const cap=effectiveLevelCap(target);
  return Math.max(1,Math.min(cap,Math.floor(Number(level)||1)));
 }
 function atEffectiveLevelCap(target=null){
  const s=targetState(target);
  if(!s)return false;
  return Math.floor(Number(s.level)||1)>=effectiveLevelCap(s);
 }
 function universeExpNeed(level){
  const l=Math.max(FIRST_WORLD_LEVEL_CAP,Math.floor(Number(level)||FIRST_WORLD_LEVEL_CAP));
  if(l>=SECOND_WORLD_LEVEL_CAP)return 0;
  const base=Math.ceil(25+4*l);
  return Math.ceil(base*250);
 }
 function thirdWorldExpNeed(level){
  const l=Math.floor(Number(level));
  if(!Number.isFinite(l)||l<SECOND_WORLD_LEVEL_CAP||l>=THIRD_WORLD_LEVEL_CAP)return 0;
  return THIRD_WORLD_EXP_PER_LEVEL;
 }

 const originalExpNeed=typeof expNeed==="function"?expNeed:null;
 function effectiveExpNeed(level,target=null){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const phase=currentLevelWorldPhase(target);
  if(l>=THIRD_WORLD_LEVEL_CAP)return 0;
  if(l>=SECOND_WORLD_LEVEL_CAP)return phase===3?thirdWorldExpNeed(l):0;
  if(l>=FIRST_WORLD_LEVEL_CAP)return phase>=2?universeExpNeed(l):0;
  return originalExpNeed?Math.max(1,Math.ceil(Number(originalExpNeed(l))||1)):Math.ceil((25+4*l)*250);
 }

 function normalizeLevelProgressionState(target){
  if(!target||typeof target!=="object")return target;
  target.level=clampEffectiveGameLevel(target.level,target);
  const cap=effectiveLevelCap(target);
  if(target.level>=cap){
   target.level=cap;
   target.exp=0;
   return target;
  }
  const need=effectiveExpNeed(target.level,target);
  const raw=Math.max(0,Math.floor(Number(target.exp)||0));
  target.exp=need>0?Math.min(raw,Math.max(0,need-1)):0;
  return target;
 }

 function gainEffectiveExp(amount,logs=[]){
  const s=currentState();
  if(!s)return 0;
  const add=Math.max(0,Number(amount)||0);
  const cap=effectiveLevelCap(s);
  if(s.level>=cap){
   s.level=cap;
   s.exp=0;
   return 0;
  }
  s.exp=Math.max(0,Number(s.exp)||0)+add;
  let ups=0;
  while(s.level<cap){
   const need=effectiveExpNeed(s.level,s);
   if(!(need>0)||s.exp<need)break;
   s.exp-=need;
   s.level++;
   ups++;
   if(typeof playerCombatStats==="function")s.hp=playerCombatStats().hp;
   if(Array.isArray(logs))logs.push(`升級！你到達 Lv.${s.level}，HP 已完全恢復。`);
  }
  if(s.level>=cap){
   s.level=cap;
   s.exp=0;
  }
  return ups;
 }

 function levelProgressSnapshot(target=null){
  const s=targetState(target);
  if(!s)return {level:1,cap:FIRST_WORLD_LEVEL_CAP,atCap:false,exp:0,need:1,percent:0,world:1};
  const cap=effectiveLevelCap(s);
  const level=Math.max(1,Math.min(cap,Math.floor(Number(s.level)||1)));
  const atCap=level>=cap;
  const need=atCap?0:effectiveExpNeed(level,s);
  const exp=atCap?0:Math.max(0,Math.floor(Number(s.exp)||0));
  const percent=atCap?100:(need>0?Math.max(0,Math.min(100,exp/need*100)):0);
  return {level,cap,atCap,exp,need,percent,world:currentLevelWorldPhase(s)};
 }

 // 正式 runtime 的等級上限只由 effectiveLevelCap owner 決定；舊 MAX_LEVEL 僅允許歷史 migration 相容使用。
 if(typeof expNeed==="function")expNeed=function(level){return effectiveExpNeed(level,currentState());};
 if(typeof gainExp==="function")gainExp=gainEffectiveExp;
 if(typeof clampGameLevel==="function")clampGameLevel=function(level){return clampEffectiveGameLevel(level,currentState());};

 window.FIRST_WORLD_LEVEL_CAP=FIRST_WORLD_LEVEL_CAP;
 window.SECOND_WORLD_LEVEL_CAP=SECOND_WORLD_LEVEL_CAP;
 window.THIRD_WORLD_LEVEL_CAP=THIRD_WORLD_LEVEL_CAP;
 window.ABSOLUTE_MAX_LEVEL=ABSOLUTE_MAX_LEVEL;
 window.THIRD_WORLD_EXP_PER_LEVEL=THIRD_WORLD_EXP_PER_LEVEL;
 window.LEVEL_PROGRESSION_VERSION=VERSION;
 window.LEVEL_RUNTIME_WORLD_CAP_OWNER_VERSION=1;
 window.LEVEL_WORLD_PHASE_CAP_OWNER_VERSION=1;
 window.THIRD_WORLD_LEVEL_PROGRESSION_VERSION=1;
 window.THIRD_WORLD_EXP_OWNER_VERSION=1;
 window.THIRD_WORLD_EXP_HELPER_STRICT_RANGE_VERSION=1;
 window.LEGACY_MAX_LEVEL_MIGRATION_ONLY_VERSION=1;
 window.currentLevelWorldPhase=currentLevelWorldPhase;
 window.effectiveLevelCap=effectiveLevelCap;
 window.clampEffectiveGameLevel=clampEffectiveGameLevel;
 window.atEffectiveLevelCap=atEffectiveLevelCap;
 window.universeExpNeed=universeExpNeed;
 window.thirdWorldExpNeed=thirdWorldExpNeed;
 window.effectiveExpNeed=effectiveExpNeed;
 window.normalizeLevelProgressionState=normalizeLevelProgressionState;
 window.levelProgressSnapshot=levelProgressSnapshot;
 window.gainEffectiveExp=gainEffectiveExp;
 window.clampGameLevel=clampGameLevel;
 window.expNeed=expNeed;
 window.gainExp=gainExp;

 window.LEVEL_PROGRESSION_INTEGRITY=(function(){
  const errors=[];
  const galaxy={secondWorld:{entered:false},thirdWorld:{entered:false}};
  const universe={secondWorld:{entered:true},thirdWorld:{entered:false}};
  const higher={secondWorld:{entered:true},thirdWorld:{entered:true}};
  if(FIRST_WORLD_LEVEL_CAP!==500||SECOND_WORLD_LEVEL_CAP!==1000||THIRD_WORLD_LEVEL_CAP!==2000||ABSOLUTE_MAX_LEVEL!==2000)errors.push({code:"CAP_CONSTANTS"});
  if(effectiveLevelCap(galaxy)!==500||effectiveLevelCap(universe)!==1000||effectiveLevelCap(higher)!==2000)errors.push({code:"WORLD_CAP_OWNER"});
  if(universeExpNeed(500)!==506250)errors.push({code:"EXP_500",actual:universeExpNeed(500)});
  if(universeExpNeed(999)!==1005250)errors.push({code:"EXP_999",actual:universeExpNeed(999)});
  if(universeExpNeed(1000)!==0)errors.push({code:"UNIVERSE_EXP_1000",actual:universeExpNeed(1000)});
  if(effectiveExpNeed(1000,universe)!==0)errors.push({code:"WORLD2_EXP_1000",actual:effectiveExpNeed(1000,universe)});
  if(thirdWorldExpNeed(500)!==0||thirdWorldExpNeed(999)!==0||thirdWorldExpNeed(1000)!==THIRD_WORLD_EXP_PER_LEVEL||thirdWorldExpNeed(1999)!==THIRD_WORLD_EXP_PER_LEVEL||thirdWorldExpNeed(2000)!==0||thirdWorldExpNeed(2001)!==0)errors.push({code:"THIRD_WORLD_EXP_HELPER_STRICT_RANGE",values:{lv500:thirdWorldExpNeed(500),lv999:thirdWorldExpNeed(999),lv1000:thirdWorldExpNeed(1000),lv1999:thirdWorldExpNeed(1999),lv2000:thirdWorldExpNeed(2000),lv2001:thirdWorldExpNeed(2001)}});
  if(effectiveExpNeed(1000,higher)!==THIRD_WORLD_EXP_PER_LEVEL||effectiveExpNeed(1999,higher)!==THIRD_WORLD_EXP_PER_LEVEL||effectiveExpNeed(2000,higher)!==0)errors.push({code:"WORLD3_EXP_OWNER"});
  const world3Snapshot=levelProgressSnapshot({level:1000,exp:0,secondWorld:{entered:true},thirdWorld:{entered:true}});
  if(world3Snapshot.world!==3||world3Snapshot.cap!==2000||world3Snapshot.need!==THIRD_WORLD_EXP_PER_LEVEL||world3Snapshot.atCap!==false)errors.push({code:"WORLD3_SNAPSHOT",actual:world3Snapshot});
  return {passed:errors.length===0,version:VERSION,errors};
 })();
})();