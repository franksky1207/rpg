(function(){
 const VERSION=7;
 const WORLD3_MAP_TEST_VERSION=1;
 const world3={modeOverride:null,bossIndex:0,stage:0,runs:100,busy:false,result:null};
 function clampWorld(value){const world=Math.floor(Number(value));return world===2||world===3?world:1;}
 function whole(value,min=0,max=Number.MAX_SAFE_INTEGER){const n=Math.floor(Number(value));return Math.max(min,Math.min(max,Number.isFinite(n)?n:min));}
 function one(value){const n=Number(value);return Number.isFinite(n)?Math.round(n*10)/10:0;}
 function fmt(value){const n=Number(value);return Math.round(Number.isFinite(n)?n:0).toLocaleString();}
 function option(value,label,selected){return `<option value="${value}" ${selected?"selected":""}>${label}</option>`;}
 function testCharacter(){return typeof window.gmTestCharacterSnapshot==="function"?window.gmTestCharacterSnapshot():null;}
 function baseSession(){return typeof window.gmPowerBenchmarkSession==="function"?window.gmPowerBenchmarkSession():null;}
 function benchmarkWorld(){
  if(world3.modeOverride!=null)return clampWorld(world3.modeOverride);
  const sessionWorld=clampWorld(baseSession()?.world);
  const characterWorld=clampWorld(testCharacter()?.world);
  return characterWorld===3?3:sessionWorld;
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
  let text=String(html||"")
   .replace("模式紀元可以獨立切換，因此即使正式角色仍在銀河紀元，也能直接預測宇宙紀元戰鬥。","模式紀元可以獨立切換，可直接測試銀河、宇宙與高維紀元戰鬥，不受正式角色目前紀元與解鎖限制。")
   .replace("銀河與宇宙紀元可自由切換，不受正式角色目前紀元與解鎖限制。","銀河、宇宙與高維紀元可自由切換，不受正式角色目前紀元與解鎖限制。");
  if(clampWorld(current?.world)!==3)return text;
  const level=Math.max(1000,Math.min(2000,Math.floor(Number(current?.level)||1000)));
  const civilizationLevel=testCivilizationLevel(),bonus=testCivilizationBonusPercent(),multiplier=testCivilizationMultiplier(3);
  const civInline=`文明 Lv.${civilizationLevel}｜最終傷害 +${bonus}%｜×${Number(multiplier).toFixed(2)}`;
  const civSummary=`文明等級：Lv.${civilizationLevel}｜高維紀元最終傷害 ×${Number(multiplier).toFixed(2)}`;
  return text
   .replace(/(?:銀河紀元角色|宇宙紀元角色)｜Lv\.\d+/,`高維紀元角色｜Lv.${level}`)
   .replace(/(<div class="muted" style="font-size:12px">角色紀元<\/div><b[^>]*>)(?:銀河紀元|宇宙紀元)(<\/b>)/,`$1高維紀元$2`)
   .replace(/角色紀元：(銀河紀元|宇宙紀元)｜Lv\.\d+/,`角色紀元：高維紀元｜Lv.${level}`)
   .replace(/文明等級｜銀河紀元不套用/g,civInline)
   .replace(/文明 Lv\.\d+｜最終傷害 \+[\d.]+%｜×[\d.]+/g,civInline)
   .replace(/文明等級：Lv\.\d+｜(?:宇宙紀元|高維紀元)最終傷害 ×[\d.]+/g,civSummary)
   .replace(/文明等級：Lv\.(\d+)｜宇宙紀元最終傷害/,"文明等級：Lv.$1｜高維紀元最終傷害");
 }
 function addWorld3Option(html){
  return String(html||"").replace(/(<select class="btn"[^>]*onchange="gmPowerBenchmarkSetWorld\(this\.value\)"[^>]*>)([\s\S]*?)(<\/select>)/g,(all,start,body,end)=>{
   if(/value="3"/.test(body))return all;
   return start+body+option(3,"高維紀元",false)+end;
  });
 }
 function thirdBossCount(){return Math.max(0,Math.floor(Number(window.THIRD_WORLD_BOSS_COUNT)||10));}
 function thirdBoss(index=world3.bossIndex){return typeof window.thirdWorldBoss==="function"?window.thirdWorldBoss(whole(index,0,Math.max(0,thirdBossCount()-1))):null;}
 function stageHp(stage=world3.stage){
  const boss=thirdBoss();if(!boss)return 0;
  const max=Math.max(1,Math.floor(Number(boss.maxHp)||Number(window.THIRD_WORLD_BOSS_MAX_HP)||1));
  const s=whole(stage,0,9);
  return s===0?max:Math.max(1,Math.floor(max*(100-s*10)/100));
 }
 function thirdBossStats(){return typeof window.thirdWorldBossStats==="function"?window.thirdWorldBossStats(world3.bossIndex,stageHp()):null;}
 function thirdBossAbilities(){return typeof window.thirdWorldBossAbilities==="function"?window.thirdWorldBossAbilities(world3.bossIndex,stageHp()):null;}
 function thirdBossSpecialization(){return typeof window.thirdWorldBossSpecializationPresentation==="function"?window.thirdWorldBossSpecializationPresentation(world3.bossIndex):null;}
 function thirdBossOptions(){
  const rows=[];for(let i=0;i<thirdBossCount();i++){const boss=thirdBoss(i);if(boss)rows.push(option(i,`${i+1}. ${boss.name}`,i===world3.bossIndex));}return rows.join("");
 }
 function stageOptions(){
  const rows=[];for(let i=0;i<=9;i++){const remain=i===0?100:100-i*10;rows.push(option(i,`Stage ${i}｜約 ${remain}% HP`,i===world3.stage));}return rows.join("");
 }
 function activeAbilityText(){
  const abilities=thirdBossAbilities();if(!abilities)return "無";
  const active=Object.values(abilities).filter(row=>row?.active===true).map(row=>String(row.name||row.id||""));
  return active.length?active.join("、"):"尚未解鎖階段能力";
 }
 function thirdSelectedSummary(){
  const boss=thirdBoss(),stats=thirdBossStats(),spec=thirdBossSpecialization();
  if(!boss||!stats)return '<div class="muted">高維存在資料尚未載入。</div>';
  return `<div class="item"><b>目前基準高維存在</b><div class="muted" style="margin-top:6px">高維紀元｜${boss.name}｜Stage ${world3.stage}｜${spec?.label||"個體特化"}</div>`+
   `<div style="margin-top:5px">HP ${fmt(stageHp())} / ${fmt(boss.maxHp)}　ATK ${fmt(stats.atk)}　DEF ${fmt(stats.def)}　暴擊 ${one(stats.crit)}%　閃避 ${one(stats.dodge)}%</div>`+
   `<div class="muted" style="margin-top:5px">特化：${spec?.effect||"—"}｜先制 +${one(stats.initiativeBonusPercent)}%｜連擊 ${one(stats.comboRate)}%｜穿透 ${one(stats.penetrationRate)}%｜反擊 ${one(stats.counterRate)}%｜汲取 ${one(stats.drainRate)}%</div>`+
   `<div class="muted" style="margin-top:5px">階段能力：${activeAbilityText()}</div></div>`;
 }
 function thirdResultHtml(){
  const r=world3.result;if(!r)return '<div class="muted">尚未執行高維存在實戰基準。</div>';
  return `<div style="margin-top:10px"><div class="muted">${r.name}｜Stage ${r.stage}｜${r.runs.toLocaleString()} 場｜正式高維戰鬥 owner</div>`+
   `<div class="gmpb-metrics"><div class="item gmpb-metric"><div class="muted">勝率</div><b>${r.winRate}%</b></div>`+
   `<div class="item gmpb-metric"><div class="muted">平均戰鬥回合</div><b>${r.avgTurns}</b></div>`+
   `<div class="item gmpb-metric"><div class="muted">勝利平均剩餘 HP</div><b>${r.avgWinHpPct}%</b></div>`+
   `<div class="item gmpb-metric"><div class="muted">失敗時 Boss 剩餘 HP</div><b>${r.avgLossBossHpPct}%</b></div>`+
   `<div class="item gmpb-metric"><div class="muted">勝／敗</div><b>${r.wins} / ${r.losses}</b></div>`+
   `<div class="item gmpb-metric"><div class="muted">Stage</div><b>${r.stage}</b></div></div></div>`;
 }
 function thirdWorldMapSectionHtml(){
  const open=typeof window.gmPowerBenchmarkModeIsOpen==="function"&&window.gmPowerBenchmarkModeIsOpen("map");
  const toggle=typeof window.gmPowerBenchmarkModeToggle==="function"?" ontoggle=\"gmPowerBenchmarkModeToggle('map',this.open)\"":"";
  const disabled=world3.busy?" disabled":"";
  return `<details class="gm-ability-test-sub gmpb-mode-sub" data-gmpb-mode="map" ${open?"open ":""}${toggle}><summary>地圖怪測試</summary><div class="gm-ability-test-sub-body">`+
   `<div class="muted gm-hub-note">第三紀元地圖怪測試直接使用正式十名高維存在資料與正式高維戰鬥 owner；Stage 0～9 可自由指定，只做 GM 沙盒模擬，不修改正式永久 HP。</div>`+
   `<div class="item"><b>高維存在設定</b><div class="gmpb-controls">`+
   `<label>紀元<br><select class="btn"${disabled} onchange="gmPowerBenchmarkSetWorld(this.value)">${option(1,"銀河紀元",false)+option(2,"宇宙紀元",false)+option(3,"高維紀元",true)}</select></label>`+
   `<label style="grid-column:span 2">高維存在<br><select class="btn"${disabled} onchange="gmPowerBenchmarkSetThirdWorldBoss(this.value)">${thirdBossOptions()}</select></label>`+
   `<label>Stage<br><select class="btn"${disabled} onchange="gmPowerBenchmarkSetThirdWorldStage(this.value)">${stageOptions()}</select></label>`+
   `<label>測試量<br><select class="btn"${disabled} onchange="gmPowerBenchmarkSetThirdWorldRuns(this.value)">${option(100,"100",world3.runs===100)+option(1000,"1000",world3.runs===1000)}</select></label>`+
   `</div><div class="gmpb-actions"><button class="btn" type="button"${disabled} onclick="gmPowerBenchmarkResetThirdWorldMap()">重置高維測試</button></div></div>`+
   thirdSelectedSummary()+
   `<div class="item"><b>實戰基準</b><div class="muted" style="margin-top:5px">每場直接呼叫正式 runThirdWorldBossCombat；沿用 GM 測試角色、專精、印記與文明最終傷害，但不進行 settlement。</div>`+
   `<div class="gmpb-actions"><button class="btn blue" type="button"${disabled} onclick="gmPowerBenchmarkRunCombat('single')">${world3.busy?"測試中…":"測目前高維存在"}</button></div>${thirdResultHtml()}</div>`+
   `</div></details>`;
 }
 function replaceMapSection(html){
  const text=String(html||""),marker='data-gmpb-mode="map"',nextMarker='data-gmpb-mode="special"';
  const markerIndex=text.indexOf(marker);if(markerIndex<0)return text;
  const start=text.lastIndexOf("<details",markerIndex);const nextIndex=text.indexOf(nextMarker,markerIndex);if(start<0||nextIndex<0)return text;
  const end=text.lastIndexOf("<details",nextIndex);if(end<=start)return text;
  return text.slice(0,start)+thirdWorldMapSectionHtml()+text.slice(end);
 }
 function decorateBenchmarkHtml(html){
  let out=patchWorld3Text(addWorld3Option(html));
  if(benchmarkWorld()===3)out=replaceMapSection(out);
  return out;
 }
 async function runThirdWorldMapBenchmark(){
  if(world3.busy)return false;
  const boss=thirdBoss();if(!boss||typeof window.runThirdWorldBossCombat!=="function")return false;
  const player=typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():null;if(!player)return false;
  const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):null;
  const civilizationLevel=testCivilizationLevel(),runs=world3.runs,startBossHp=stageHp();
  world3.busy=true;world3.result=null;if(typeof render==="function")render();
  await new Promise(resolve=>setTimeout(resolve,0));
  let wins=0,losses=0,totalTurns=0,winHpPct=0,lossBossPct=0;
  try{
   for(let i=0;i<runs;i++){
    const result=window.runThirdWorldBossCombat(world3.bossIndex,{
     ignoreUnlock:true,formalStartHp:startBossHp,player:{...player},startHp:player.hp,playerHealCap:player.hp,
     civilizationLevel,logs:false,preparePresentation:false,useTestSpecializations:true,useTestMarks:true,markLevels:marks
    });
    if(!result?.ok)continue;
    totalTurns+=Math.max(0,Number(result.turns)||0);
    if(result.win===true){wins++;winHpPct+=Math.max(0,Number(result.hp)||0)/Math.max(1,Number(player.hp)||1)*100;}
    else{losses++;lossBossPct+=Math.max(0,Number(result.combatEndHp)||0)/Math.max(1,startBossHp)*100;}
    if((i+1)%25===0&&i+1<runs)await new Promise(resolve=>setTimeout(resolve,0));
   }
   const completed=Math.max(1,wins+losses);
   world3.result={world:3,bossIndex:world3.bossIndex,name:String(boss.name||"高維存在"),stage:world3.stage,runs,wins,losses,
    winRate:one(wins/completed*100),avgTurns:one(totalTurns/completed),avgWinHpPct:wins?one(winHpPct/wins):0,avgLossBossHpPct:losses?one(lossBossPct/losses):0,
    formalStartHp:startBossHp,civilizationLevel};
   return true;
  }finally{
   world3.busy=false;if(typeof render==="function")render();
  }
 }
 function appendWorld3Summary(text){
  if(!world3.result)return String(text||"");
  const r=world3.result;
  return String(text||"")+`\n\n【高維紀元・地圖怪】\n目標：${r.name}｜Stage ${r.stage}｜測試量 ${r.runs}\n實戰：${r.wins}勝/${r.losses}敗｜勝率 ${r.winRate}%｜平均回合 ${r.avgTurns}｜勝利剩餘HP ${r.avgWinHpPct}%｜失敗時Boss剩餘HP ${r.avgLossBossHpPct}%`;
 }
 async function copyCurrentSummary(){
  const text=typeof window.gmPowerBenchmarkSummaryText==="function"?String(window.gmPowerBenchmarkSummaryText()||""):"";
  let ok=false;
  try{if(typeof navigator!=="undefined"&&navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){await navigator.clipboard.writeText(text);ok=true;}}catch(e){}
  if(!ok&&typeof document!=="undefined"){
   const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();try{ok=document.execCommand("copy");}catch(e){}ta.remove();
  }
  if(typeof alert==="function")alert(ok?"測試摘要已複製。":"無法自動複製，請長按下方摘要文字手動複製。");
  return ok;
 }
 function refreshBenchmarkAfterFormalSync(){if(typeof render==="function"){render();return true;}return false;}
 function install(){
  const baseOutput=window.gmPowerBenchmarkRunOutput;
  if(typeof baseOutput==="function"&&!baseOutput.__worldPhaseAdapter){const wrapped=function(...args){if(benchmarkWorld()===3)return false;return runWithBenchmarkWorld(baseOutput,args);};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkRunOutput=wrapped;}
  const baseDefense=window.gmPowerBenchmarkRunDefense;
  if(typeof baseDefense==="function"&&!baseDefense.__worldPhaseAdapter){const wrapped=function(...args){if(benchmarkWorld()===3)return false;return runWithBenchmarkWorld(baseDefense,args);};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkRunDefense=wrapped;}
  const baseCombat=window.gmPowerBenchmarkRunCombat;
  if(typeof baseCombat==="function"&&!baseCombat.__worldPhaseAdapter){const wrapped=function(...args){return benchmarkWorld()===3?runThirdWorldMapBenchmark():runWithBenchmarkWorld(baseCombat,args);};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkRunCombat=wrapped;}
  const baseSetWorld=window.gmPowerBenchmarkSetWorld;
  if(typeof baseSetWorld==="function"&&!baseSetWorld.__worldPhaseAdapter){
   const wrapped=function(value){const world=clampWorld(value);world3.modeOverride=world;world3.result=null;if(world===3){if(typeof render==="function")render();return 3;}return baseSetWorld(world);};
   wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkSetWorld=wrapped;
  }
  const baseSnapshot=window.gmPowerBenchmarkSnapshot;
  if(typeof baseSnapshot==="function"&&!baseSnapshot.__worldPhaseAdapter){const wrapped=function(){return correctedSnapshot(baseSnapshot());};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkSnapshot=wrapped;}
  const baseSummary=window.gmPowerBenchmarkSummaryText;
  if(typeof baseSummary==="function"&&!baseSummary.__worldPhaseAdapter){const wrapped=function(){return appendWorld3Summary(patchWorld3Text(baseSummary()));};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkSummaryText=wrapped;}
  if(typeof window.gmPowerBenchmarkCopySummary==="function"&&!window.gmPowerBenchmarkCopySummary.__worldPhaseAdapter){const wrapped=function(){return copyCurrentSummary();};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkCopySummary=wrapped;}
  const baseHtml=window.gmPowerBenchmarkHtml;
  if(typeof baseHtml==="function"&&!baseHtml.__worldPhaseAdapter){
   const wrapped=function(){return decorateBenchmarkHtml(baseHtml());};wrapped.__worldPhaseAdapter=VERSION;window.gmPowerBenchmarkHtml=wrapped;
   if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("test","power-benchmark-test",wrapped,"戰力基準測試");
  }
  const baseFormalSync=window.gmUseCurrentTestStatus;
  if(typeof baseFormalSync==="function"&&!baseFormalSync.__benchmarkRefreshAdapter){const wrapped=function(...args){const result=baseFormalSync(...args);refreshBenchmarkAfterFormalSync();return result;};wrapped.__benchmarkRefreshAdapter=VERSION;window.gmUseCurrentTestStatus=wrapped;}
  return true;
 }
 window.GM_POWER_BENCHMARK_WORLD_PHASE_ADAPTER_VERSION=VERSION;
 window.GM_POWER_BENCHMARK_WORLD3_CIVILIZATION_DAMAGE_VERSION=2;
 window.GM_POWER_BENCHMARK_FORMAL_SYNC_REFRESH_VERSION=2;
 window.GM_POWER_BENCHMARK_WORLD3_COPY_SUMMARY_VERSION=1;
 window.GM_POWER_BENCHMARK_WORLD3_MAP_TEST_VERSION=WORLD3_MAP_TEST_VERSION;
 window.gmPowerBenchmarkModeWorld=function(){return benchmarkWorld();};
 window.gmPowerBenchmarkWorld3CivilizationMultiplier=function(){return testCivilizationMultiplier(3);};
 window.gmPowerBenchmarkRefreshAfterFormalSync=refreshBenchmarkAfterFormalSync;
 window.gmPowerBenchmarkCorrectedSnapshot=function(){const base=typeof window.gmPowerBenchmarkSnapshot==="function"?window.gmPowerBenchmarkSnapshot():null;return base?JSON.parse(JSON.stringify(base)):null;};
 window.gmPowerBenchmarkSetThirdWorldBoss=function(value){if(world3.busy)return;world3.modeOverride=3;world3.bossIndex=whole(value,0,Math.max(0,thirdBossCount()-1));world3.result=null;if(typeof render==="function")render();};
 window.gmPowerBenchmarkSetThirdWorldStage=function(value){if(world3.busy)return;world3.modeOverride=3;world3.stage=whole(value,0,9);world3.result=null;if(typeof render==="function")render();};
 window.gmPowerBenchmarkSetThirdWorldRuns=function(value){if(world3.busy)return;world3.runs=Number(value)===1000?1000:100;world3.result=null;if(typeof render==="function")render();};
 window.gmPowerBenchmarkResetThirdWorldMap=function(){if(world3.busy)return false;world3.bossIndex=0;world3.stage=0;world3.runs=100;world3.result=null;if(typeof render==="function")render();return true;};
 window.gmPowerBenchmarkThirdWorldResultSnapshot=function(){return world3.result?JSON.parse(JSON.stringify(world3.result)):null;};
 window.gmPowerBenchmarkThirdWorldSelection=function(){return {bossIndex:world3.bossIndex,stage:world3.stage,runs:world3.runs,formalStartHp:stageHp()};};
 install();
 const integrityErrors=[];
 if(typeof window.thirdWorldBoss!=="function"||typeof window.thirdWorldBossStats!=="function"||typeof window.thirdWorldBossAbilities!=="function")integrityErrors.push("third-world-data-owner-missing");
 if(typeof window.runThirdWorldBossCombat!=="function")integrityErrors.push("third-world-combat-owner-missing");
 if(thirdBossCount()!==10)integrityErrors.push("third-world-boss-count");
 for(let stage=0;stage<=9;stage++){
  const boss=thirdBoss(0),hp=(()=>{const max=Math.max(1,Math.floor(Number(boss?.maxHp)||1));return stage===0?max:Math.max(1,Math.floor(max*(100-stage*10)/100));})();
  const actual=typeof window.thirdWorldBossStage==="function"?window.thirdWorldBossStage(hp,boss?.maxHp):stage;
  if(Number(actual)!==stage)integrityErrors.push(`third-world-stage-${stage}`);
 }
 window.GM_POWER_BENCHMARK_WORLD3_MAP_TEST_INTEGRITY={passed:integrityErrors.length===0,errors:integrityErrors,checkedAt:Date.now()};
})();
