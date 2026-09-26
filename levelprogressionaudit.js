(function(){
 const VERSION=2;

 function auditTarget(target=null){
  if(target&&typeof target==="object")return target;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}
 }
 function auditWorld(target){
  const s=auditTarget(target);
  const raw=typeof window.currentLevelWorldPhase==="function"?window.currentLevelWorldPhase(s):typeof window.currentWorldPhase==="function"?window.currentWorldPhase(s):null;
  const world=Number(raw);
  return Number.isInteger(world)?world:null;
 }

 window.levelExpFactor=window.expProgressionFactor;
 window.sameLevelNormalKillsToLevel=function(level,target=null){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const s=auditTarget(target);
  const need=typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(l,s):typeof expNeed==="function"?expNeed(l):0;
  return round1(Math.max(0,Number(need)||0)/Math.max(1,sameExp(l)));
 };

 window.levelProgressionAudit=function(level,target=null){
  const l=Math.max(1,Math.floor(Number(level)||1));
  const s=auditTarget(target);
  const need=typeof window.effectiveExpNeed==="function"?window.effectiveExpNeed(l,s):typeof expNeed==="function"?expNeed(l):0;
  const world=auditWorld(s),thirdWorld=world===3;
  return {
   level:l,
   world,
   expPerSameLevelNormal:thirdWorld?null:sameExp(l),
   expNeed:Math.max(0,Number(need)||0),
   sameLevelNormalKills:thirdWorld?null:window.sameLevelNormalKillsToLevel(l,s),
   permanentDamageNeeded:thirdWorld?Math.max(0,Number(need)||0):null,
   progressionMetric:thirdWorld?"permanentBossHpDamage":"sameLevelNormalKills",
   baseHp:baseHP(l),
   baseAtk:baseATK(l),
   baseDef:baseDEF(l),
   effectiveCap:typeof window.effectiveLevelCap==="function"?window.effectiveLevelCap(s):null
  };
 };

 // 純讀 audit：模擬既有 Level/EXP owner 的跨級結果，不修改正式 state。
 window.levelProgressionTransitionAudit=function(level,exp,gain,target=null){
  const s=auditTarget(target);
  const cap=typeof window.effectiveLevelCap==="function"?Math.max(1,Math.floor(Number(window.effectiveLevelCap(s))||1)):Math.max(1,Math.floor(Number(window.MAX_LEVEL)||500));
  let current=Math.max(1,Math.min(cap,Math.floor(Number(level)||1)));
  let currentExp=current>=cap?0:Math.max(0,Number(exp)||0);
  const added=Math.max(0,Number(gain)||0);
  currentExp+=added;
  let levelsGained=0;
  while(current<cap){
   const need=typeof window.effectiveExpNeed==="function"?Math.max(0,Number(window.effectiveExpNeed(current,s))||0):0;
   if(!(need>0)||currentExp<need)break;
   currentExp-=need;
   current++;
   levelsGained++;
  }
  if(current>=cap){current=cap;currentExp=0;}
  const world=auditWorld(s);
  return {startLevel:Math.max(1,Math.floor(Number(level)||1)),startExp:Math.max(0,Number(exp)||0),gain:added,level:current,exp:Math.max(0,Math.floor(currentExp)),levelsGained,cap,atCap:current>=cap,world};
 };

 window.LEVEL_PROGRESSION_AUDIT_VERSION=VERSION;
 window.LEVEL_PROGRESSION_AUDIT_WORLD_PHASE_VERSION=1;
 window.LEVEL_PROGRESSION_TRANSITION_AUDIT_VERSION=1;
 window.THIRD_WORLD_LEVEL_AUDIT_SEMANTICS_VERSION=1;
 window.LEVEL_MIGRATION_REGRESSION_AUDIT_VERSION=1;
 const hadLiveMigrationReport=Object.prototype.hasOwnProperty.call(window,"LAST_SAVE_MIGRATION_REPORT"),liveMigrationReport=window.LAST_SAVE_MIGRATION_REPORT;
 window.LEVEL_MIGRATION_REGRESSION_AUDIT_REPORT=typeof window.runLevelMigrationRegression==="function"?window.runLevelMigrationRegression():{version:1,passed:false,errors:[{code:"MIGRATION_REGRESSION_OWNER_MISSING"}],cases:[],checkedAt:Date.now()};
 if(hadLiveMigrationReport)window.LAST_SAVE_MIGRATION_REPORT=liveMigrationReport;else delete window.LAST_SAVE_MIGRATION_REPORT;
 const universeProbe={level:999,secondWorld:{entered:true},thirdWorld:{entered:false}},higherProbe={level:1000,secondWorld:{entered:true},thirdWorld:{entered:true}};
 const universeAudit=window.levelProgressionAudit(999,universeProbe),higherAudit=window.levelProgressionAudit(1000,higherProbe);
 const helperBoundaryPassed=typeof window.thirdWorldExpNeed==="function"&&window.thirdWorldExpNeed(999)===0&&window.thirdWorldExpNeed(1000)===10000000&&window.thirdWorldExpNeed(1999)===10000000&&window.thirdWorldExpNeed(2000)===0;
 const auditSemanticsPassed=helperBoundaryPassed&&universeAudit?.world===2&&typeof universeAudit?.sameLevelNormalKills==="number"&&universeAudit?.permanentDamageNeeded===null&&universeAudit?.progressionMetric==="sameLevelNormalKills"&&higherAudit?.world===3&&higherAudit?.expNeed===10000000&&higherAudit?.expPerSameLevelNormal===null&&higherAudit?.sameLevelNormalKills===null&&higherAudit?.permanentDamageNeeded===10000000&&higherAudit?.progressionMetric==="permanentBossHpDamage";
 window.THIRD_WORLD_LEVEL_AUDIT_SEMANTICS_REPORT={version:1,passed:auditSemanticsPassed,helperBoundaryPassed,universe:universeAudit,higher:higherAudit,checkedAt:Date.now()};
 if(window.LEVEL_MIGRATION_REGRESSION_AUDIT_REPORT?.passed!==true||auditSemanticsPassed!==true){
  if(window.LEVEL_MIGRATION_REGRESSION_AUDIT_REPORT?.passed!==true)console.error("[文明戰線] Level migration regression audit failed",window.LEVEL_MIGRATION_REGRESSION_AUDIT_REPORT);
  if(auditSemanticsPassed!==true)console.error("[文明戰線] Third-world level audit semantics failed",window.THIRD_WORLD_LEVEL_AUDIT_SEMANTICS_REPORT);
  window.LEVEL_PROGRESSION_AUDIT_VERSION=0;
 }
})();