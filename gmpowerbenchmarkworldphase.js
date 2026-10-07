(function(){
 const VERSION=10;
 const WORLD3_MAP_TEST_VERSION=4;
 const WORLD3_ANALYTICS_VERSION=3;
 const WORLD3_RESULT_CONSISTENCY_VERSION=1;
 const WORLD3_RESULT_CONTEXT_VERSION=1;
 const WORLD3_ANALYTICS_REGRESSION_VERSION=1;
 const world3={modeOverride:null,bossIndex:0,stage:0,runs:100,busy:false,result:null};
 function clampWorld(value){const world=Math.floor(Number(value));return world===2||world===3?world:1;}
 function whole(value,min=0,max=Number.MAX_SAFE_INTEGER){const n=Math.floor(Number(value));return Math.max(min,Math.min(max,Number.isFinite(n)?n:min));}
 function one(value){const n=Number(value);return Number.isFinite(n)?Math.round(n*10)/10:0;}
 function pct3(value){const n=Number(value);return Number.isFinite(n)?(Math.round(n*1000)/1000).toFixed(3):"0.000";}
 function fmt(value){const n=Number(value);return Math.round(Number.isFinite(n)?n:0).toLocaleString();}
 function cloneValue(value){if(value==null)return value;try{return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}catch(e){try{return JSON.parse(JSON.stringify(value));}catch(_){return value;}}}
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
 function testFinalDamageMultiplier(world=benchmarkWorld()){
  if(typeof window.gmTestFinalDamageMultiplier!=="function")throw new Error("GM formal final damage owner unavailable.");
  return window.gmTestFinalDamageMultiplier(clampWorld(world),testCivilizationLevel());
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
  out.breakthroughLevel=Math.max(0,Math.floor(Number(current.breakthroughLevel)||0));
  out.civilizationDamageMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world:out.characterWorld,civilizationLevel}):1;
  out.finalDamageMultiplier=testFinalDamageMultiplier(out.characterWorld);
  return out;
 }
 function runCharacterSnapshot(){
  const source=typeof window.gmPowerBenchmarkSnapshot==="function"?window.gmPowerBenchmarkSnapshot():null;
  return source&&typeof source==="object"?cloneValue(source):null;
 }
 function runCharacterText(snapshot){
  if(!snapshot||typeof snapshot!=="object")return "本次角色快照不可用";
  const world=clampWorld(snapshot.characterWorld??snapshot.world),label=world===3?"高維紀元":world===2?"宇宙紀元":"銀河紀元",stats=snapshot.stats||{};
  const source=snapshot.equipmentSource==="synced"?"正式角色實穿裝備":"GM 預測裝備";
  return `${label}｜Lv.${whole(snapshot.level,1,2000)}｜VIP${whole(snapshot.vipLevel,0)}｜突破 Lv.${whole(snapshot.breakthroughLevel,0)}｜HP ${fmt(stats.hp)}｜ATK ${fmt(stats.atk)}｜DEF ${fmt(stats.def)}｜文明 Lv.${whole(snapshot.civilizationLevel,0,10)}｜總最終傷害 ×${Number(snapshot.finalDamageMultiplier||1).toFixed(2)}｜${source}`;
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
 function metric(label,value){return `<div class="item gmpb-metric"><div class="muted">${label}</div><b>${value}</b></div>`;}
 function ratePerRun(count,runs){return runs>0?one(Number(count||0)/runs):0;}
 function abilityLine(label,row,runs,extra=""){
  const count=Number(row?.count)||0;
  return `<div class="muted">${label}：${fmt(count)} 次｜平均 ${ratePerRun(count,runs)} / 場${extra}</div>`;
 }
 function stageAbilityLines(r){
  const s=r.stageAbilities||{},rows=[],completed=Math.max(0,whole(r.completed));
  if(s.composure?.active)rows.push(`<div class="muted">鎮心：實際阻止暴擊 ${fmt(s.composure.count)} 次｜平均 ${ratePerRun(s.composure.count,completed)} / 場</div>`);
  if(s.suppression?.active)rows.push(`<div class="muted">壓制：實際阻止閃避 ${fmt(s.suppression.count)} 次｜平均 ${ratePerRun(s.suppression.count,completed)} / 場</div>`);
  if(s.resilience?.active)rows.push(`<div class="muted">韌性：削減暴擊傷害 ${fmt(s.resilience.count)} 次｜累計減傷 ${fmt(s.resilience.preventedDamage)}</div>`);
  if(s.revenge?.active)rows.push(`<div class="muted">復仇：進入待命 ${fmt(s.revenge.ready)} 次｜實際必暴 ${fmt(s.revenge.consume)} 次</div>`);
  if(s.backlash?.active)rows.push(`<div class="muted">反噬：觸發 ${fmt(s.backlash.count)} 次｜累計反噬傷害 ${fmt(s.backlash.damage)}</div>`);
  if(s.ignore?.active)rows.push(`<div class="muted">無視：觸發 ${fmt(s.ignore.count)} 次｜平均 ${ratePerRun(s.ignore.count,completed)} / 場</div>`);
  if(s.battleSpirit?.active)rows.push(`<div class="muted">戰意：啟動 ${fmt(s.battleSpirit.activations)} / ${fmt(completed)} 場｜平均最高層數 ${one(s.battleSpirit.avgPeakLayer)}</div>`);
  return rows.length?rows.join(""):'<div class="muted">此 Stage 尚未解鎖階段能力。</div>';
 }
 function thirdResultHtml(){
  const r=world3.result;if(!r)return '<div class="muted">尚未執行高維存在實戰基準。</div>';
  const player=r.playerAbilities||{},boss=r.bossAbilities||{},completed=Math.max(0,whole(r.completed)),failed=Math.max(0,whole(r.failed));
  const nextEstimate=r.stage>=9?"":metric("推進下一 Stage",r.estimatedDeathsToNextStage==null?"—":fmt(r.estimatedDeathsToNextStage)+" 死");
  const failureNote=failed>0?`<div class="notice" style="margin-top:8px"><b>有效測試未全部完成</b><div class="muted" style="margin-top:5px">要求 ${fmt(r.runs)} 場｜有效完成 ${fmt(completed)} 場｜失敗 ${fmt(failed)} 場${r.firstFailureReason?`<br>首個失敗原因：${String(r.firstFailureReason)}`:""}</div></div>`:"";
  return `<div style="margin-top:10px"><div class="muted">${r.name}｜Stage ${r.stage}｜要求 ${r.runs.toLocaleString()} 場｜有效 ${fmt(completed)}｜失敗 ${fmt(failed)}｜正式高維戰鬥 owner</div>`+
   `<div class="muted" style="margin-top:4px">本次角色快照：${runCharacterText(r.characterSnapshot)}</div>${failureNote}`+
   `<div class="gmpb-metrics">${metric("平均每場永久削血",fmt(r.avgPermanentDamage))}${metric("平均每回合削血",fmt(r.avgDamagePerTurn))}${metric("平均存活回合",r.avgTurns)}${metric("測試總削血",fmt(r.totalPermanentDamage))}${metric("等效 Boss HP 削減",pct3(r.equivalentBossHpPercent)+"%")} ${metric("依目前 Stage 效率推估擊破",r.estimatedDeathsToDefeat==null?"—":fmt(r.estimatedDeathsToDefeat)+" 死")}${nextEstimate}</div>`+
   `<details style="margin-top:9px"><summary><b>玩家戰鬥表現</b></summary><div style="margin-top:7px;line-height:1.65">`+
    `<div class="muted">實際暴擊率：${one(r.playerCritRate)}%｜實際閃避率：${one(r.playerDodgeRate)}%</div>`+
    abilityLine("先制",player.initiative,completed)+abilityLine("連擊",player.combo,completed)+abilityLine("穿透",player.penetration,completed)+abilityLine("反擊",player.counter,completed)+abilityLine("汲取",player.drain,completed,`｜回血 ${fmt(player.drain?.healed||0)}`)+
   `</div></details>`+
   `<details style="margin-top:8px"><summary><b>Boss 五能力實測</b></summary><div style="margin-top:7px;line-height:1.65">`+
    abilityLine("先制",boss.initiative,completed)+abilityLine("連擊",boss.combo,completed)+abilityLine("穿透",boss.penetration,completed)+abilityLine("反擊",boss.counter,completed)+abilityLine("汲取",boss.drain,completed,`｜回血 ${fmt(boss.drain?.healed||0)}`)+
   `</div></details>`+
   `<details style="margin-top:8px"><summary><b>Stage 能力實測</b></summary><div style="margin-top:7px;line-height:1.65">${stageAbilityLines(r)}</div></details>`+
   `</div>`;
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
   `<div class="item"><b>實戰基準</b><div class="muted" style="margin-top:5px">每場直接呼叫正式 runThirdWorldBossCombat；沿用 GM 測試角色、專精、印記與文明最終傷害，但不進行 settlement。第三紀元以永久削血效率、存活回合與能力觸發為主要平衡指標。</div>`+
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
 function emptyAbilityStats(){return {initiative:{count:0},combo:{count:0},penetration:{count:0},counter:{count:0},drain:{count:0,healed:0}};}
 function emptyStageStats(abilities){
  const active=id=>abilities?.[id]?.active===true;
  return {
   composure:{active:active("composure"),count:0},suppression:{active:active("suppression"),count:0},
   resilience:{active:active("resilience"),count:0,preventedDamage:0},revenge:{active:active("revenge"),ready:0,consume:0},
   backlash:{active:active("backlash"),count:0,damage:0},ignore:{active:active("ignore"),count:0},
   battleSpirit:{active:active("battleSpirit"),activations:0,totalPeakLayer:0,avgPeakLayer:0}
  };
 }
 function recordAbilityEvent(stats,event,side){
  if(event?.type==="attack"&&event.actor===side){if(event.initiative)stats.initiative.count++;if(event.penetration)stats.penetration.count++;return;}
  if(event?.type==="dodge"&&event.actor===side){if(event.initiative)stats.initiative.count++;return;}
  if(event?.type==="combo"&&event.actor===side){stats.combo.count++;return;}
  if(event?.type==="counter"&&event.actor===side){stats.counter.count++;return;}
  if(event?.type==="drain"&&event.actor===side){stats.drain.count++;stats.drain.healed+=Math.max(0,Number(event.healed)||0);}
 }
 function recordStageEvent(stats,event){
  if(event?.type!=="mark"||event.owner!=="enemy")return;
  const mark=String(event.mark||""),action=String(event.action||"");
  if(mark==="composure"&&action==="preventCrit")stats.composure.count++;
  else if(mark==="suppression"&&action==="preventDodge")stats.suppression.count++;
  else if(mark==="resilience"&&action==="reduceCritDamage"){stats.resilience.count++;stats.resilience.preventedDamage+=Math.max(0,(Number(event.originalDamage)||0)-(Number(event.finalDamage)||0));}
  else if(mark==="revenge"&&action==="ready")stats.revenge.ready++;
  else if(mark==="revenge"&&action==="consume")stats.revenge.consume++;
  else if(mark==="backlash"&&action==="trigger"){stats.backlash.count++;stats.backlash.damage+=Math.max(0,Number(event.actualDamage??event.damage)||0);}
  else if(mark==="ignore"&&action==="trigger")stats.ignore.count++;
  else if(mark==="battleSpirit"&&action==="activate")stats.battleSpirit.activations++;
 }
 async function runThirdWorldMapBenchmark(){
  if(world3.busy)return false;
  const boss=thirdBoss();if(!boss||typeof window.runThirdWorldBossCombat!=="function")return false;
  const player=typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():null;if(!player)return false;
  const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):null;
  const civilizationLevel=testCivilizationLevel(),runs=world3.runs,startBossHp=stageHp(),bossMaxHp=Math.max(1,Number(boss.maxHp)||startBossHp),characterSnapshot=runCharacterSnapshot();
  const testContext=typeof window.gmTestContextSnapshot==="function"?window.gmTestContextSnapshot():null,startRevision=Math.max(0,Math.floor(Number(testContext?.revision)||0));
  const playerAbilities=emptyAbilityStats(),bossAbilities=emptyAbilityStats(),stageAbilities=emptyStageStats(thirdBossAbilities());
  world3.busy=true;world3.result=null;if(typeof render==="function")render();
  await new Promise(resolve=>setTimeout(resolve,0));
  let completed=0,failed=0,firstFailureReason="",totalTurns=0,totalPermanentDamage=0,playerAttackHits=0,playerCrits=0,enemyAttackAttempts=0,playerDodges=0;
  try{
   for(let i=0;i<runs;i++){
    if(typeof window.gmTestContextRevision==="function"&&window.gmTestContextRevision()!==startRevision){world3.result=null;return false;}
    const result=window.runThirdWorldBossCombat(world3.bossIndex,{
     ignoreUnlock:true,formalStartHp:startBossHp,player:{...player},startHp:player.hp,playerHealCap:player.hp,
     civilizationLevel,logs:false,preparePresentation:false,useTestSpecializations:true,useTestMarks:true,markLevels:marks
    });
    if(!result?.ok){failed++;if(!firstFailureReason)firstFailureReason=String(result?.reason||result?.error?.message||result?.error||"未知錯誤");continue;}
    completed++;
    const turns=Math.max(0,Number(result.turns)||0);totalTurns+=turns;
    totalPermanentDamage+=Math.max(0,Number(result.effectivePermanentDamage??result.effectiveDamagePreview)||0);
    let peakSpiritLayer=0;
    (Array.isArray(result.events)?result.events:[]).forEach(event=>{
     recordAbilityEvent(playerAbilities,event,"player");recordAbilityEvent(bossAbilities,event,"enemy");recordStageEvent(stageAbilities,event);
     if(event?.type==="attack"&&event.actor==="player"){playerAttackHits++;if(event.crit)playerCrits++;}
     if(event?.type==="attack"&&event.actor==="enemy")enemyAttackAttempts++;
     if(event?.type==="dodge"&&event.target==="player")playerDodges++;
     if(event?.type==="mark"&&event.owner==="enemy"&&event.mark==="battleSpirit"&&event.action==="layer")peakSpiritLayer=Math.max(peakSpiritLayer,Math.max(0,Number(event.layer)||0));
    });
    stageAbilities.battleSpirit.totalPeakLayer+=peakSpiritLayer;
    if((i+1)%25===0&&i+1<runs)await new Promise(resolve=>setTimeout(resolve,0));
   }
   const divisor=Math.max(1,completed),avgPermanentDamage=completed>0?totalPermanentDamage/divisor:0,avgTurns=completed>0?totalTurns/divisor:0;
   const avgDamagePerTurn=totalTurns>0?totalPermanentDamage/totalTurns:0;
   const stageGapHp=Math.max(1,Math.floor(bossMaxHp*.10));
   stageAbilities.battleSpirit.avgPeakLayer=completed>0?stageAbilities.battleSpirit.totalPeakLayer/divisor:0;
   const spec=thirdBossSpecialization();
   if(typeof window.gmTestContextRevision==="function"&&window.gmTestContextRevision()!==startRevision){world3.result=null;return false;}
   const payload={
    world:3,bossIndex:world3.bossIndex,name:String(boss.name||"高維存在"),stage:world3.stage,runs,completed,failed,firstFailureReason,formalStartHp:startBossHp,bossMaxHp,civilizationLevel,characterSnapshot,
    specialization:{label:String(spec?.label||"個體特化"),effect:String(spec?.effect||"—")},activeAbilities:activeAbilityText(),
    avgTurns:one(avgTurns),totalPermanentDamage,avgPermanentDamage,avgDamagePerTurn,equivalentBossHpPercent:totalPermanentDamage/bossMaxHp*100,
    estimatedDeathsToDefeat:avgPermanentDamage>0?Math.ceil(startBossHp/avgPermanentDamage):null,
    estimatedDeathsToNextStage:world3.stage<9&&avgPermanentDamage>0?Math.ceil(stageGapHp/avgPermanentDamage):null,
    playerCritRate:playerAttackHits>0?playerCrits/playerAttackHits*100:0,playerDodgeRate:enemyAttackAttempts+playerDodges>0?playerDodges/(enemyAttackAttempts+playerDodges)*100:0,
    playerAbilities,bossAbilities,stageAbilities
   };
   world3.result=typeof window.gmAttachTestResultContext==="function"?window.gmAttachTestResultContext(payload,testContext):{...payload,testContext};
   return true;
  }finally{
   world3.busy=false;if(typeof render==="function")render();
  }
 }
 function abilitySummary(label,row,runs,extra=""){const count=Number(row?.count)||0;return `${label} ${fmt(count)} 次（${ratePerRun(count,runs)} / 場）${extra}`;}
 function appendWorld3Summary(text){
  if(!world3.result)return String(text||"");
  const r=world3.result,p=r.playerAbilities||{},b=r.bossAbilities||{},s=r.stageAbilities||{},completed=Math.max(0,whole(r.completed)),failed=Math.max(0,whole(r.failed));
  const lines=["",`【高維紀元・地圖怪】`,`目標：${r.name}｜Stage ${r.stage}｜${r.specialization?.label||"個體特化"}｜${r.specialization?.effect||"—"}`,`階段能力：${r.activeAbilities}`,`本次角色快照：${runCharacterText(r.characterSnapshot)}`,`測試量：要求 ${r.runs} 場｜有效完成 ${completed} 場｜失敗 ${failed} 場`];
  if(failed>0&&r.firstFailureReason)lines.push(`首個失敗原因：${r.firstFailureReason}`);
  lines.push(`平均每場永久削血：${fmt(r.avgPermanentDamage)}｜平均每回合削血：${fmt(r.avgDamagePerTurn)}｜平均存活回合：${r.avgTurns}`);
  lines.push(`測試總削血：${fmt(r.totalPermanentDamage)}｜等效 Boss HP 削減：${pct3(r.equivalentBossHpPercent)}%`);
  lines.push(`依目前 Stage 效率推估擊破：${r.estimatedDeathsToDefeat==null?"—":fmt(r.estimatedDeathsToDefeat)+" 死"}`);
  if(r.stage<9)lines.push(`預估推進下一 Stage：${r.estimatedDeathsToNextStage==null?"—":fmt(r.estimatedDeathsToNextStage)+" 死"}`);
  else lines.push("Stage 9：已無下一 Stage，以上述擊破推估為準");
  lines.push(`玩家實際暴擊率：${one(r.playerCritRate)}%｜玩家實際閃避率：${one(r.playerDodgeRate)}%`,`【玩家五能力】`,abilitySummary("先制",p.initiative,completed),abilitySummary("連擊",p.combo,completed),abilitySummary("穿透",p.penetration,completed),abilitySummary("反擊",p.counter,completed),abilitySummary("汲取",p.drain,completed,`｜回血 ${fmt(p.drain?.healed||0)}`),`【Boss 五能力】`,abilitySummary("先制",b.initiative,completed),abilitySummary("連擊",b.combo,completed),abilitySummary("穿透",b.penetration,completed),abilitySummary("反擊",b.counter,completed),abilitySummary("汲取",b.drain,completed,`｜回血 ${fmt(b.drain?.healed||0)}`),`【Stage 能力】`);
  if(s.composure?.active)lines.push(`鎮心：實際阻止暴擊 ${fmt(s.composure.count)} 次`);
  if(s.suppression?.active)lines.push(`壓制：實際阻止閃避 ${fmt(s.suppression.count)} 次`);
  if(s.resilience?.active)lines.push(`韌性：削減暴擊傷害 ${fmt(s.resilience.count)} 次｜累計減傷 ${fmt(s.resilience.preventedDamage)}`);
  if(s.revenge?.active)lines.push(`復仇：進入待命 ${fmt(s.revenge.ready)} 次｜實際必暴 ${fmt(s.revenge.consume)} 次`);
  if(s.backlash?.active)lines.push(`反噬：觸發 ${fmt(s.backlash.count)} 次｜累計反噬傷害 ${fmt(s.backlash.damage)}`);
  if(s.ignore?.active)lines.push(`無視：觸發 ${fmt(s.ignore.count)} 次｜平均 ${ratePerRun(s.ignore.count,completed)} / 場`);
  if(s.battleSpirit?.active)lines.push(`戰意：啟動 ${fmt(s.battleSpirit.activations)} / ${fmt(completed)} 場｜平均最高層數 ${one(s.battleSpirit.avgPeakLayer)}`);
  if(!Object.values(s).some(row=>row?.active===true))lines.push("尚未解鎖階段能力");
  return String(text||"")+lines.join("\n");
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
  if(typeof window.gmPowerBenchmarkRegisterTestContextInvalidator==="function")window.gmPowerBenchmarkRegisterTestContextInvalidator(()=>{world3.result=null;});
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
  if(typeof window.gmPowerBenchmarkRegisterTestContextInvalidator==="function"){
   window.gmPowerBenchmarkRegisterTestContextInvalidator(()=>{world3.result=null;});
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
 function buildWorld3AnalyticsRegression(){
  const errors=[];const check=(ok,code,data=null)=>{if(!ok)errors.push({code,data});};
  try{
   const ability=emptyAbilityStats();
   [{type:"attack",actor:"player",initiative:true,penetration:true},{type:"dodge",actor:"player",initiative:true},{type:"combo",actor:"player"},{type:"counter",actor:"player"},{type:"drain",actor:"player",healed:25}].forEach(event=>recordAbilityEvent(ability,event,"player"));
   check(ability.initiative.count===2,"ability-initiative-count",ability.initiative.count);
   check(ability.penetration.count===1&&ability.combo.count===1&&ability.counter.count===1&&ability.drain.count===1&&ability.drain.healed===25,"ability-event-counts",ability);
   const active={composure:{active:true},suppression:{active:true},resilience:{active:true},revenge:{active:true},backlash:{active:true},ignore:{active:true},battleSpirit:{active:true}},stageStats=emptyStageStats(active);
   [{type:"mark",owner:"enemy",mark:"composure",action:"preventCrit"},{type:"mark",owner:"enemy",mark:"suppression",action:"preventDodge"},{type:"mark",owner:"enemy",mark:"resilience",action:"reduceCritDamage",originalDamage:150,finalDamage:120},{type:"mark",owner:"enemy",mark:"revenge",action:"ready"},{type:"mark",owner:"enemy",mark:"revenge",action:"consume"},{type:"mark",owner:"enemy",mark:"backlash",action:"trigger",actualDamage:40},{type:"mark",owner:"enemy",mark:"ignore",action:"trigger"},{type:"mark",owner:"enemy",mark:"battleSpirit",action:"activate"}].forEach(event=>recordStageEvent(stageStats,event));
   check(stageStats.composure.count===1&&stageStats.suppression.count===1&&stageStats.resilience.count===1&&stageStats.resilience.preventedDamage===30&&stageStats.revenge.ready===1&&stageStats.revenge.consume===1&&stageStats.backlash.count===1&&stageStats.backlash.damage===40&&stageStats.ignore.count===1&&stageStats.battleSpirit.activations===1,"stage-event-counts",stageStats);
   check(ratePerRun(6,3)===2,"completed-denominator",ratePerRun(6,3));
   if(typeof window.runCombatCore==="function"){
    const dodgeProbe=window.runCombatCore({hp:100,atk:1,def:0,crit:0,dodge:100},{name:"initiative-dodge-probe",hp:100,atk:10,def:0,crit:0,dodge:0},100,{logs:false,preparePresentation:false,skipPlayerAction:true,maxTurns:1,enemyAbilityProfile:{initiativeBonusPercent:60},rng:()=>0});
    const dodgeEvent=(dodgeProbe?.events||[]).find(event=>event?.type==="dodge"&&event.actor==="enemy");
    check(dodgeEvent?.initiative===true,"combat-dodge-initiative-event",dodgeEvent||null);
   }else errors.push({code:"combat-core-missing",data:null});
   const previousResult=world3.result;
   world3.result={world:3,bossIndex:0,name:"回歸測試",stage:9,runs:4,completed:3,failed:1,firstFailureReason:"probe",formalStartHp:1000,bossMaxHp:1000,civilizationLevel:10,characterSnapshot:{characterWorld:3,level:1000,vipLevel:20,stats:{hp:100,atk:10,def:5},civilizationLevel:10,equipmentSource:"generated"},specialization:{label:"測試",effect:"—"},activeAbilities:"測試",avgTurns:2,totalPermanentDamage:300,avgPermanentDamage:100,avgDamagePerTurn:50,equivalentBossHpPercent:30,estimatedDeathsToDefeat:10,estimatedDeathsToNextStage:null,playerCritRate:0,playerDodgeRate:0,playerAbilities:{initiative:{count:6},combo:{count:0},penetration:{count:0},counter:{count:0},drain:{count:0,healed:0}},bossAbilities:emptyAbilityStats(),stageAbilities:emptyStageStats({})};
   const summary=appendWorld3Summary("");
   check(summary.includes("有效完成 3 場｜失敗 1 場"),"summary-completed-failed",summary);
   check(summary.includes("先制 6 次（2 / 場）"),"summary-completed-denominator",summary);
   check(summary.includes("Stage 9：已無下一 Stage"),"summary-stage9",summary);
   if(typeof window.gmPowerBenchmarkInvalidateTestContext==="function"){window.gmPowerBenchmarkInvalidateTestContext({reason:"world3-regression"});check(world3.result===null,"result-invalidation",world3.result);}else errors.push({code:"invalidation-owner-missing",data:null});
   world3.result=previousResult;
   if(typeof window.runThirdWorldBossCombat==="function"){
    const holder=typeof state!=="undefined"&&state&&typeof state==="object"?state:null;
    const before=holder?.thirdWorld?.bosses?JSON.stringify(holder.thirdWorld.bosses.map(row=>row?.currentHp??null)):null;
    const boss=thirdBoss(0),formalStartHp=Math.max(1,Math.floor(Number(boss?.maxHp)||1));
    const probe=window.runThirdWorldBossCombat(0,{ignoreUnlock:true,formalStartHp,player:{hp:1,atk:1,def:0,crit:0,dodge:0},startHp:1,playerHealCap:1,civilizationLevel:0,logs:false,preparePresentation:false,rng:()=>.99,maxTurns:10});
    const after=holder?.thirdWorld?.bosses?JSON.stringify(holder.thirdWorld.bosses.map(row=>row?.currentHp??null)):null;
    check(probe?.ok===true,"third-world-headless-probe",probe?.reason||null);
    if(probe?.ok)check(Number(probe.effectivePermanentDamage)===Math.max(0,Number(probe.formalStartHp)-Number(probe.combatEndHp)),"permanent-damage-contract",{formalStartHp:probe.formalStartHp,combatEndHp:probe.combatEndHp,effectivePermanentDamage:probe.effectivePermanentDamage});
    check(before===after,"formal-boss-hp-mutated",{before,after});
   }else errors.push({code:"third-world-combat-owner-missing",data:null});
  }catch(error){errors.push({code:"regression-exception",data:String(error?.message||error)});}
  return Object.freeze({version:WORLD3_ANALYTICS_REGRESSION_VERSION,passed:errors.length===0,errors:Object.freeze(errors),checkedAt:Date.now()});
 }
 window.GM_POWER_BENCHMARK_WORLD_PHASE_ADAPTER_VERSION=VERSION;
 window.GM_POWER_BENCHMARK_WORLD3_CIVILIZATION_DAMAGE_VERSION=2;
 window.GM_POWER_BENCHMARK_FORMAL_SYNC_REFRESH_VERSION=2;
 window.GM_POWER_BENCHMARK_WORLD3_COPY_SUMMARY_VERSION=3;
 window.GM_POWER_BENCHMARK_WORLD3_MAP_TEST_VERSION=WORLD3_MAP_TEST_VERSION;
 window.GM_POWER_BENCHMARK_WORLD3_ANALYTICS_VERSION=WORLD3_ANALYTICS_VERSION;
 window.GM_POWER_BENCHMARK_WORLD3_RESULT_CONSISTENCY_VERSION=WORLD3_RESULT_CONSISTENCY_VERSION;
 window.GM_POWER_BENCHMARK_WORLD3_RESULT_CONTEXT_VERSION=WORLD3_RESULT_CONTEXT_VERSION;
 window.GM_POWER_BENCHMARK_WORLD3_ANALYTICS_REGRESSION_VERSION=WORLD3_ANALYTICS_REGRESSION_VERSION;
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
 const analyticsRegression=buildWorld3AnalyticsRegression();
 window.GM_POWER_BENCHMARK_WORLD3_ANALYTICS_REGRESSION=analyticsRegression;
 const integrityErrors=[];
 if(typeof window.thirdWorldBoss!=="function"||typeof window.thirdWorldBossStats!=="function"||typeof window.thirdWorldBossAbilities!=="function")integrityErrors.push("third-world-data-owner-missing");
 if(typeof window.runThirdWorldBossCombat!=="function")integrityErrors.push("third-world-combat-owner-missing");
 if(Number(window.COMBAT_DODGE_INITIATIVE_EVENT_VERSION)!==1)integrityErrors.push("combat-dodge-initiative-event-version");
 if(thirdBossCount()!==10)integrityErrors.push("third-world-boss-count");
 for(let stage=0;stage<=9;stage++){
  const boss=thirdBoss(0),hp=(()=>{const max=Math.max(1,Math.floor(Number(boss?.maxHp)||1));return stage===0?max:Math.max(1,Math.floor(max*(100-stage*10)/100));})();
  const actual=typeof window.thirdWorldBossStage==="function"?window.thirdWorldBossStage(hp,boss?.maxHp):stage;
  if(Number(actual)!==stage)integrityErrors.push(`third-world-stage-${stage}`);
 }
 if(WORLD3_ANALYTICS_VERSION!==3)integrityErrors.push("world3-analytics-version");
 if(WORLD3_RESULT_CONSISTENCY_VERSION!==1)integrityErrors.push("world3-result-consistency-version");
 if(WORLD3_RESULT_CONTEXT_VERSION!==1||typeof window.gmAttachTestResultContext!=="function")integrityErrors.push("world3-result-context-version");
 if(WORLD3_ANALYTICS_REGRESSION_VERSION!==1)integrityErrors.push("world3-analytics-regression-version");
 if(typeof window.gmPowerBenchmarkRegisterTestContextInvalidator!=="function")integrityErrors.push("world3-result-invalidation-registry");
 if(!analyticsRegression.passed)analyticsRegression.errors.forEach(row=>integrityErrors.push(`world3-regression:${row.code}`));
 const runSource=Function.prototype.toString.call(runThirdWorldMapBenchmark),resultSource=Function.prototype.toString.call(thirdResultHtml),summarySource=Function.prototype.toString.call(appendWorld3Summary),abilitySource=Function.prototype.toString.call(recordAbilityEvent);
 if(!runSource.includes("firstFailureReason")||!runSource.includes("characterSnapshot")||!runSource.includes("failed++"))integrityErrors.push("world3-run-result-consistency");
 if(!resultSource.includes("r.completed")||!resultSource.includes("r.failed")||!resultSource.includes("依目前 Stage 效率推估擊破"))integrityErrors.push("world3-result-presentation-consistency");
 if(!summarySource.includes("有效完成")||!summarySource.includes("失敗")||!summarySource.includes("本次角色快照")||!summarySource.includes("Stage 9：已無下一 Stage"))integrityErrors.push("world3-summary-consistency");
 if(!abilitySource.includes('event?.type==="dodge"')||!abilitySource.includes("event.initiative"))integrityErrors.push("world3-dodge-initiative-counter");
 window.GM_POWER_BENCHMARK_WORLD3_MAP_TEST_INTEGRITY={passed:integrityErrors.length===0,errors:integrityErrors,analyticsRegression,checkedAt:Date.now()};
})();