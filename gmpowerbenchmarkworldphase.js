(function(){
 const VERSION=1;
 function clampWorld(value){const world=Math.floor(Number(value));return world===2||world===3?world:1;}
 function testCharacter(){return typeof window.gmTestCharacterSnapshot==="function"?window.gmTestCharacterSnapshot():null;}
 function benchmarkWorld(){const session=typeof window.gmPowerBenchmarkSession==="function"?window.gmPowerBenchmarkSession():null;return clampWorld(session?.world);}
 async function runWithBenchmarkWorld(base,args){
  if(typeof base!=="function")return false;
  const original=window.gmTestCharacterSnapshot;
  if(typeof original!=="function")return base(...args);
  const modeWorld=benchmarkWorld();
  window.gmTestCharacterSnapshot=function(){const snapshot=original();return snapshot&&typeof snapshot==="object"?{...snapshot,world:modeWorld}:snapshot;};
  try{return await base(...args);}finally{window.gmTestCharacterSnapshot=original;}
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
  const civilizationLevel=typeof window.gmTestCivilizationLevelValue==="function"?window.gmTestCivilizationLevelValue():Number(out.civilizationLevel)||0;
  out.civilizationLevel=civilizationLevel;
  out.civilizationDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:out.characterWorld,civilizationLevel}):1;
  return out;
 }
 function patchWorld3Text(html){
  const current=testCharacter();
  if(clampWorld(current?.world)!==3)return String(html||"");
  const level=Math.max(1000,Math.min(2000,Math.floor(Number(current?.level)||1000)));
  return String(html||"")
   .replace(/(?:銀河紀元角色|宇宙紀元角色)｜Lv\.\d+/,`高維紀元角色｜Lv.${level}`)
   .replace(/(<div class="muted" style="font-size:12px">角色紀元<\/div><b[^>]*>)(?:銀河紀元|宇宙紀元)(<\/b>)/,`$1高維紀元$2`)
   .replace(/角色紀元：(銀河紀元|宇宙紀元)｜Lv\.\d+/,`角色紀元：高維紀元｜Lv.${level}`)
   .replace(/文明等級：Lv\.(\d+)｜宇宙紀元最終傷害/,"文明等級：Lv.$1｜高維紀元最終傷害");
 }
 function install(){
  const baseOutput=window.gmPowerBenchmarkRunOutput;
  if(typeof baseOutput==="function"&&!baseOutput.__worldPhaseAdapter){
   const wrapped=function(...args){return runWithBenchmarkWorld(baseOutput,args);};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkRunOutput=wrapped;
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
  return true;
 }
 window.GM_POWER_BENCHMARK_WORLD_PHASE_ADAPTER_VERSION=VERSION;
 window.gmPowerBenchmarkModeWorld=function(){return benchmarkWorld();};
 window.gmPowerBenchmarkCorrectedSnapshot=function(){const base=typeof window.gmPowerBenchmarkSnapshot==="function"?window.gmPowerBenchmarkSnapshot():null;return base?JSON.parse(JSON.stringify(base)):null;};
 install();
})();