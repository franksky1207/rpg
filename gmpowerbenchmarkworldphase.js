(function(){
 const VERSION=5;
 function clampWorld(value){const world=Math.floor(Number(value));return world===2||world===3?world:1;}
 function testCharacter(){return typeof window.gmTestCharacterSnapshot==="function"?window.gmTestCharacterSnapshot():null;}
 function benchmarkWorld(){
  const character=testCharacter(),characterWorld=clampWorld(character?.world);
  if(characterWorld===3)return 3;
  const session=typeof window.gmPowerBenchmarkSession==="function"?window.gmPowerBenchmarkSession():null;
  return clampWorld(session?.world);
 }
 function testCivilizationLevel(){return typeof window.gmTestCivilizationLevelValue==="function"?Math.max(0,Math.floor(Number(window.gmTestCivilizationLevelValue())||0)):0;}
 function testCivilizationMultiplier(world=benchmarkWorld()){
  const level=testCivilizationLevel();
  return typeof window.civilizationCombatDamageMultiplier==="function"
   ?window.civilizationCombatDamageMultiplier({world:clampWorld(world),civilizationLevel:level})
   :1;
 }
 function testCivilizationBonusPercent(){
  const level=testCivilizationLevel();
  return typeof window.civilizationDamageBonusPercentForLevel==="function"?Number(window.civilizationDamageBonusPercentForLevel(level))||0:level*5;
 }
 async function runWithBenchmarkWorld(base,args){
  if(typeof base!=="function")return false;
  const originalSnapshot=window.gmTestCharacterSnapshot;
  const originalCombat=window.runCombatCore;
  const modeWorld=benchmarkWorld();
  const forceWorld3Civilization=modeWorld===3;
  if(typeof originalSnapshot==="function"){
   window.gmTestCharacterSnapshot=function(){const snapshot=originalSnapshot();return snapshot&&typeof snapshot==="object"?{...snapshot,world:modeWorld}:snapshot;};
  }
  if(forceWorld3Civilization&&typeof originalCombat==="function"){
   window.runCombatCore=function(player,enemy,startHp,options={}){
    const multiplier=testCivilizationMultiplier(3);
    return originalCombat(player,enemy,startHp,{...(options&&typeof options==="object"?options:{}),playerFinalDamageMultiplier:multiplier});
   };
  }
  try{return await base(...args);}finally{
   if(typeof originalSnapshot==="function")window.gmTestCharacterSnapshot=originalSnapshot;
   if(typeof originalCombat==="function")window.runCombatCore=originalCombat;
  }
 }
 function correctedSnapshot(baseSnapshot){
  const current=testCharacter();
  if(!baseSnapshot||!current)return baseSnapshot;
  const out={...baseSnapshot,characterWorld:clampWorld(current.world),level:Math.max(1,Math.floor(Number(current.level)||1))};
  if(typeof window.gmTestPlayerStats==="function"){
   const stats=window.gmTestPlayerStats();
   out.stats={hp:Math.max(1,Math.round(Number(stats?.hp)||1)),atk:Math.max(1,Math.round(Number(stats?.atk)||1)),def:Math.max(0,Math.round(Number(stats?.def)||0)),crit:Number(stats?.crit)||0,dodge:Number(stats?.dodge)||0};
  }
  if(current.equipment&&typeof current.equipment==="object")out.equipment=JSON.parse(JSON.stringify(current.equipment));
  const civilizationLevel=testCivilizationLevel();
  out.civilizationLevel=civilizationLevel;
  out.civilizationDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:out.characterWorld,civilizationLevel}):1;
  return out;
 }
 function patchWorld3Text(html){
  const current=testCharacter();
  if(clampWorld(current?.world)!==3)return String(html||"");
  const level=Math.max(1000,Math.min(2000,Math.floor(Number(current?.level)||1000)));
  const civilizationLevel=testCivilizationLevel(),bonus=testCivilizationBonusPercent(),multiplier=testCivilizationMultiplier(3);
  const civInline=`文明 Lv.${civilizationLevel}｜最終傷害 +${bonus}%｜×${Number(multiplier).toFixed(2)}`;
  const civSummary=`文明等級：Lv.${civilizationLevel}｜高維紀元最終傷害 ×${Number(multiplier).toFixed(2)}`;
  return String(html||"")
   .replace(/(?:銀河紀元角色|宇宙紀元角色)｜Lv\.\d+/,`高維紀元角色｜Lv.${level}`)
   .replace(/(<div class="muted" style="font-size:12px">角色紀元<\/div><b[^>]*>)(?:銀河紀元|宇宙紀元)(<\/b>)/,`$1高維紀元$2`)
   .replace(/角色紀元：(銀河紀元|宇宙紀元)｜Lv\.\d+/,`角色紀元：高維紀元｜Lv.${level}`)
   .replace(/文明等級｜銀河紀元不套用/g,civInline)
   .replace(/文明 Lv\.\d+｜最終傷害 \+[\d.]+%｜×[\d.]+/g,civInline)
   .replace(/文明等級：Lv\.\d+｜(?:宇宙紀元|高維紀元)最終傷害 ×[\d.]+/g,civSummary)
   .replace(/文明等級：Lv\.(\d+)｜宇宙紀元最終傷害/,"文明等級：Lv.$1｜高維紀元最終傷害");
 }
 function refreshBenchmarkAfterFormalSync(){
  if(typeof render==="function"){render();return true;}
  return false;
 }
 function install(){
  const baseOutput=window.gmPowerBenchmarkRunOutput;
  if(typeof baseOutput==="function"&&!baseOutput.__worldPhaseAdapter){
   const wrapped=function(...args){return runWithBenchmarkWorld(baseOutput,args);};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkRunOutput=wrapped;
  }
  const baseDefense=window.gmPowerBenchmarkRunDefense;
  if(typeof baseDefense==="function"&&!baseDefense.__worldPhaseAdapter){
   const wrapped=function(...args){return runWithBenchmarkWorld(baseDefense,args);};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkRunDefense=wrapped;
  }
  const baseCombat=window.gmPowerBenchmarkRunCombat;
  if(typeof baseCombat==="function"&&!baseCombat.__worldPhaseAdapter){
   const wrapped=function(...args){return runWithBenchmarkWorld(baseCombat,args);};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkRunCombat=wrapped;
  }
  const baseSnapshot=window.gmPowerBenchmarkSnapshot;
  if(typeof baseSnapshot==="function"&&!baseSnapshot.__worldPhaseAdapter){
   const wrapped=function(){return correctedSnapshot(baseSnapshot());};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkSnapshot=wrapped;
  }
  const baseSummary=window.gmPowerBenchmarkSummaryText;
  if(typeof baseSummary==="function"&&!baseSummary.__worldPhaseAdapter){
   const wrapped=function(){return patchWorld3Text(baseSummary());};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkSummaryText=wrapped;
  }
  const baseHtml=window.gmPowerBenchmarkHtml;
  if(typeof baseHtml==="function"&&!baseHtml.__worldPhaseAdapter){
   const wrapped=function(){return patchWorld3Text(baseHtml());};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkHtml=wrapped;
   if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("test","power-benchmark-test",wrapped,"戰力基準測試");
  }
  const baseFormalSync=window.gmUseCurrentTestStatus;
  if(typeof baseFormalSync==="function"&&!baseFormalSync.__benchmarkRefreshAdapter){
   const wrapped=function(...args){
    const result=baseFormalSync(...args);
    refreshBenchmarkAfterFormalSync();
    return result;
   };
   wrapped.__benchmarkRefreshAdapter=VERSION;
   window.gmUseCurrentTestStatus=wrapped;
  }
  return true;
 }
 window.GM_POWER_BENCHMARK_WORLD_PHASE_ADAPTER_VERSION=VERSION;
 window.GM_POWER_BENCHMARK_WORLD3_CIVILIZATION_DAMAGE_VERSION=2;
 window.GM_POWER_BENCHMARK_FORMAL_SYNC_REFRESH_VERSION=2;
 window.gmPowerBenchmarkModeWorld=function(){return benchmarkWorld();};
 window.gmPowerBenchmarkWorld3CivilizationMultiplier=function(){return testCivilizationMultiplier(3);};
 window.gmPowerBenchmarkRefreshAfterFormalSync=refreshBenchmarkAfterFormalSync;
 window.gmPowerBenchmarkCorrectedSnapshot=function(){const base=typeof window.gmPowerBenchmarkSnapshot==="function"?window.gmPowerBenchmarkSnapshot():null;return base?JSON.parse(JSON.stringify(base)):null;};
 install();
})();