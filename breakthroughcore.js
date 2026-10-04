(function(){
 const BREAKTHROUGH_CORE_VERSION=2;
 const BREAKTHROUGH_CANONICAL_REBUILD_VERSION=1;
 const BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL=2.5;
 const BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL=.05;
 const BREAKTHROUGH_MAX_PER_LIFE=10;
 const BREAKTHROUGH_STAT_IDS=Object.freeze(["hp","atk","def"]);
 const BREAKTHROUGH_MILESTONE_LEVELS=Object.freeze((Array.isArray(window.BREAKTHROUGH_MILESTONES)?window.BREAKTHROUGH_MILESTONES:[100,200,300,400,500,600,700,800,900,1000]).map(v=>Math.floor(Number(v))).filter(v=>Number.isFinite(v)&&v>0));

 function isObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
 function wholeNonNegative(value){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0;}
 function finiteNonNegative(value){const n=Number(value);return Number.isFinite(n)&&n>=0?n:0;}
 function targetState(target=null){
  if(isObject(target))return target;
  try{return typeof state!=="undefined"&&isObject(state)?state:null;}catch(_){return null;}
 }
 function level(target=null){
  const s=targetState(target);
  if(typeof window.permanentBreakthroughLevel==="function")return wholeNonNegative(window.permanentBreakthroughLevel(s));
  return wholeNonNegative(s?.reincarnation?.breakthrough?.permanent);
 }
 function currentLifeEarned(target=null){
  const s=targetState(target);
  if(typeof window.currentLifeBreakthrough==="function")return Math.min(BREAKTHROUGH_MAX_PER_LIFE,wholeNonNegative(window.currentLifeBreakthrough(s)));
  return 0;
 }
 function equipmentBonusPercent(target=null){return level(target)*BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL;}
 function equipmentMultiplier(target=null){return 1+equipmentBonusPercent(target)/100;}
 function finalDamageAdd(target=null){return level(target)*BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL;}
 function rawEquipmentStatBonus(rawValue,target=null){return finiteNonNegative(rawValue)*equipmentBonusPercent(target)/100;}
 function rawEquipmentBonuses(rawStats,target=null){
  const source=isObject(rawStats)?rawStats:{};
  return Object.freeze({
   hp:rawEquipmentStatBonus(source.hp,target),
   atk:rawEquipmentStatBonus(source.atk,target),
   def:rawEquipmentStatBonus(source.def,target)
  });
 }
 function milestoneLevelsCrossed(fromLevel,toLevel){
  const from=Math.max(0,wholeNonNegative(fromLevel)),to=Math.max(0,wholeNonNegative(toLevel));
  if(to<=from)return [];
  return BREAKTHROUGH_MILESTONE_LEVELS.filter(milestone=>milestone>from&&milestone<=to);
 }
 function grantMilestonesForLevelCrossing(fromLevel,toLevel,target=null){
  const s=targetState(target),before=level(s),lifeBefore=currentLifeEarned(s);
  if(!s||typeof window.isReincarnationRun!=="function"||window.isReincarnationRun(s)!==true)return Object.freeze({ok:true,awarded:0,milestones:Object.freeze([]),permanentBefore:before,permanentAfter:before,currentLifeBefore:lifeBefore,currentLifeAfter:lifeBefore,reason:"first-run"});
  if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(s);
  const breakthrough=s?.reincarnation?.breakthrough;
  if(!isObject(breakthrough)||!isObject(breakthrough.milestones))return Object.freeze({ok:false,awarded:0,milestones:Object.freeze([]),permanentBefore:before,permanentAfter:before,currentLifeBefore:lifeBefore,currentLifeAfter:lifeBefore,reason:"state-missing"});
  const eligible=milestoneLevelsCrossed(fromLevel,toLevel),awarded=[];
  eligible.forEach(milestone=>{
   const key=String(milestone);
   if(breakthrough.milestones[key]===true)return;
   breakthrough.milestones[key]=true;
   awarded.push(milestone);
  });
  breakthrough.permanent=wholeNonNegative(breakthrough.permanent)+awarded.length;
  const after=level(s),lifeAfter=currentLifeEarned(s);
  return Object.freeze({ok:true,awarded:awarded.length,milestones:Object.freeze(awarded.slice()),permanentBefore:before,permanentAfter:after,currentLifeBefore:lifeBefore,currentLifeAfter:lifeAfter,reason:awarded.length?"awarded":"none"});
 }
 function planFromPermanentTotal(total){
  const value=Number(total);
  if(!Number.isSafeInteger(value)||value<0)return Object.freeze({ok:false,reason:"invalid-value"});
  const count=Math.max(1,Math.ceil(value/BREAKTHROUGH_MAX_PER_LIFE));
  const currentLife=value===0?0:value-(count-1)*BREAKTHROUGH_MAX_PER_LIFE;
  return Object.freeze({ok:true,total:value,count,currentLife,currentLifeMax:BREAKTHROUGH_MAX_PER_LIFE});
 }
 function milestonesForCurrentLife(currentLife){
  const earned=Math.max(0,Math.min(BREAKTHROUGH_MAX_PER_LIFE,wholeNonNegative(currentLife)));
  return Object.fromEntries(BREAKTHROUGH_MILESTONE_LEVELS.map((milestone,index)=>[String(milestone),index<earned]));
 }
 function rebuildFromPermanentTotal(total,target=null){
  const s=targetState(target);
  if(!s)return {ok:false,reason:"invalid-target"};
  if(typeof window.isReincarnationRun!=="function"||window.isReincarnationRun(s)!==true)return {ok:false,reason:"first-run-locked"};
  const next=planFromPermanentTotal(total);if(!next.ok)return next;
  if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(s);
  if(!isObject(s.reincarnation))return {ok:false,reason:"reincarnation-owner-missing"};
  const beforeCount=Math.max(0,Math.floor(Number(s.reincarnation.count)||0));
  const au=isObject(s.reincarnation.alternateUniverse)?s.reincarnation.alternateUniverse:null;
  s.reincarnation.count=next.count;
  s.reincarnation.breakthrough={permanent:next.total,milestoneLifeId:next.count,milestones:milestonesForCurrentLife(next.currentLife)};
  if(au&&beforeCount!==next.count){
   au.activeAttempt=null;
   au.lifeFailures={lifeId:next.count,failures:{}};
  }
  if(typeof window.normalizeReincarnationState==="function")window.normalizeReincarnationState(s);
  return {ok:true,total:next.total,count:next.count,currentLife:next.currentLife,currentLifeMax:next.currentLifeMax,beforeCount,afterCount:next.count};
 }
 function snapshot(target=null){
  const s=targetState(target),permanent=level(s),currentLife=currentLifeEarned(s);
  return Object.freeze({
   version:BREAKTHROUGH_CORE_VERSION,
   permanent,
   currentLife,
   currentLifeMax:BREAKTHROUGH_MAX_PER_LIFE,
   equipmentPercentPerLevel:BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL,
   equipmentBonusPercent:permanent*BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL,
   equipmentMultiplier:1+permanent*BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL/100,
   finalDamageAddPerLevel:BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL,
   finalDamageAdd:permanent*BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL
  });
 }
 function validate(){
  const errors=[];
  const makeState=(count,permanent=0)=>({saveVersion:17,reincarnation:{count,breakthrough:{permanent,milestoneLifeId:count,milestones:Object.fromEntries(BREAKTHROUGH_MILESTONE_LEVELS.map(v=>[String(v),false]))},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}}});
  const b0=makeState(0,0),b10=makeState(1,10),b37=makeState(4,37);
  const s0=snapshot(b0),s10=snapshot(b10),s37=snapshot(b37);
  if(s0.equipmentBonusPercent!==0||s0.finalDamageAdd!==0||s0.equipmentMultiplier!==1)errors.push({code:"B0_ZERO_EFFECT",actual:s0});
  const bonus10=rawEquipmentBonuses({hp:100,atk:80,def:40,crit:12,dodge:9},b10);
  if(bonus10.hp!==25||bonus10.atk!==20||bonus10.def!==10||Object.prototype.hasOwnProperty.call(bonus10,"crit")||Object.prototype.hasOwnProperty.call(bonus10,"dodge"))errors.push({code:"RAW_EQUIPMENT_STATS_ONLY",actual:bonus10});
  if(s10.equipmentBonusPercent!==25||s10.finalDamageAdd!==.5||s10.equipmentMultiplier!==1.25)errors.push({code:"B10_FORMULA",actual:s10});
  if(s37.equipmentBonusPercent!==92.5||Math.abs(s37.finalDamageAdd-1.85)>1e-12)errors.push({code:"B37_FORMULA",actual:s37});
  if(JSON.stringify(milestoneLevelsCrossed(73,312))!==JSON.stringify([100,200,300]))errors.push({code:"MULTI_MILESTONE_PREVIEW",actual:milestoneLevelsCrossed(73,312)});
  const firstRun=makeState(0,0),firstGrant=grantMilestonesForLevelCrossing(73,312,firstRun);
  if(firstGrant.awarded!==0||firstRun.reincarnation.breakthrough.permanent!==0)errors.push({code:"FIRST_RUN_NO_AWARD",actual:firstGrant,state:firstRun.reincarnation.breakthrough});
  const reincarnated=makeState(1,0),grant=grantMilestonesForLevelCrossing(73,312,reincarnated),repeat=grantMilestonesForLevelCrossing(73,312,reincarnated),late=grantMilestonesForLevelCrossing(950,1200,reincarnated);
  if(grant.awarded!==3||grant.permanentAfter!==3||grant.currentLifeAfter!==3||JSON.stringify(grant.milestones)!==JSON.stringify([100,200,300]))errors.push({code:"MULTI_MILESTONE_GRANT",actual:grant});
  if(repeat.awarded!==0||repeat.permanentAfter!==3)errors.push({code:"DUPLICATE_AWARD_GUARD",actual:repeat});
  if(late.awarded!==1||late.milestones[0]!==1000||late.permanentAfter!==4||late.currentLifeAfter!==4)errors.push({code:"MILESTONE_CAP_1000",actual:late});
  if(BREAKTHROUGH_MILESTONE_LEVELS.length!==BREAKTHROUGH_MAX_PER_LIFE||BREAKTHROUGH_MILESTONE_LEVELS[0]!==100||BREAKTHROUGH_MILESTONE_LEVELS[BREAKTHROUGH_MILESTONE_LEVELS.length-1]!==1000)errors.push({code:"MILESTONE_CONTRACT",actual:BREAKTHROUGH_MILESTONE_LEVELS});
  const plans=[[0,1,0],[1,1,1],[10,1,10],[11,2,1],[25,3,5],[30,3,10],[31,4,1]];
  plans.forEach(([total,count,currentLife])=>{const plan=planFromPermanentTotal(total);if(!plan.ok||plan.count!==count||plan.currentLife!==currentLife)errors.push({code:"CANONICAL_REBUILD_PLAN",total,actual:plan});});
  if(planFromPermanentTotal(-1).ok||planFromPermanentTotal(1.5).ok)errors.push({code:"CANONICAL_REBUILD_INPUT_GUARD"});
  const rebuildFixture=makeState(2,20);rebuildFixture.reincarnation.alternateUniverse={unlocked:true,deepestCleared:40,activeAttempt:{lifeId:2,depth:41,attemptId:"core-rebuild",traits:["strong","swift"]},lifeFailures:{lifeId:2,failures:{"41":3}}};
  const rebuilt=rebuildFromPermanentTotal(25,rebuildFixture);
  if(!rebuilt.ok||rebuildFixture.reincarnation.count!==3||rebuildFixture.reincarnation.breakthrough.permanent!==25||currentLifeEarned(rebuildFixture)!==5||rebuildFixture.reincarnation.alternateUniverse.activeAttempt!==null||rebuildFixture.reincarnation.alternateUniverse.lifeFailures.lifeId!==3)errors.push({code:"CANONICAL_REBUILD_STATE",actual:{rebuilt,state:rebuildFixture.reincarnation}});
  const firstRebuild=makeState(0,0),firstSnapshot=JSON.stringify(firstRebuild),locked=rebuildFromPermanentTotal(5,firstRebuild);
  if(locked?.reason!=="first-run-locked"||JSON.stringify(firstRebuild)!==firstSnapshot)errors.push({code:"CANONICAL_REBUILD_FIRST_RUN_LOCK",actual:locked});
  return Object.freeze({version:BREAKTHROUGH_CORE_VERSION,canonicalRebuildVersion:BREAKTHROUGH_CANONICAL_REBUILD_VERSION,passed:errors.length===0,errors:Object.freeze(errors)});
 }

 window.BREAKTHROUGH_CORE_VERSION=BREAKTHROUGH_CORE_VERSION;
 window.BREAKTHROUGH_CANONICAL_REBUILD_VERSION=BREAKTHROUGH_CANONICAL_REBUILD_VERSION;
 window.BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL=BREAKTHROUGH_EQUIPMENT_PERCENT_PER_LEVEL;
 window.BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL=BREAKTHROUGH_FINAL_DAMAGE_ADD_PER_LEVEL;
 window.BREAKTHROUGH_MAX_PER_LIFE=BREAKTHROUGH_MAX_PER_LIFE;
 window.BREAKTHROUGH_STAT_IDS=Array.from(BREAKTHROUGH_STAT_IDS);
 window.BREAKTHROUGH_MILESTONE_LEVELS=Array.from(BREAKTHROUGH_MILESTONE_LEVELS);
 window.breakthroughLevel=level;
 window.breakthroughCurrentLifeEarned=currentLifeEarned;
 window.breakthroughEquipmentBonusPercent=equipmentBonusPercent;
 window.breakthroughEquipmentMultiplier=equipmentMultiplier;
 window.breakthroughFinalDamageAdd=finalDamageAdd;
 window.breakthroughRawEquipmentStatBonus=rawEquipmentStatBonus;
 window.breakthroughRawEquipmentBonuses=rawEquipmentBonuses;
 window.breakthroughMilestoneLevelsCrossed=milestoneLevelsCrossed;
 window.grantBreakthroughMilestonesForLevelCrossing=grantMilestonesForLevelCrossing;
 window.breakthroughPlanFromPermanentTotal=planFromPermanentTotal;
 window.rebuildBreakthroughFromPermanentTotal=rebuildFromPermanentTotal;
 window.breakthroughSnapshot=snapshot;
 window.BREAKTHROUGH_CORE_INTEGRITY=validate();
 if(!window.BREAKTHROUGH_CORE_INTEGRITY.passed)console.error("[文明戰線] Breakthrough core integrity error",window.BREAKTHROUGH_CORE_INTEGRITY.errors);
})();