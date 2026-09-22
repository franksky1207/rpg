(function(){
 const VERSION=1;
 const FORMAL_VERSION=1;
 const TEST_VERSION=1;
 const BENCHMARK_VERSION=1;
 let selectedIndex=0;
 let testResultHtml="";
 let benchmarkResultHtml="";

 function defs(){return typeof window.getSecondWorldCalamityDefinitions==="function"?window.getSecondWorldCalamityDefinitions():[];}
 function clampIndex(v){const list=defs();return Math.max(0,Math.min(Math.max(0,list.length-1),Math.floor(Number(v)||0)));}
 function def(v=selectedIndex){return defs()[clampIndex(v)]||null;}
 function entered(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state);}
 function row(d,target=state){return target?.secondWorld?.calamities?.[d?.index]||null;}
 function fmt(v){return Math.max(0,Math.floor(Number(v)||0)).toLocaleString();}
 function pct(v){return Math.round(Math.max(0,Math.min(100,Number(v)||0))*100)/100;}
 function cloneState(){try{return JSON.parse(JSON.stringify(state));}catch(e){return null;}}
 function restoreStateSnapshot(snapshot){if(!snapshot||typeof snapshot!=="object")return false;state=snapshot;return true;}
 function atomicFormalMutation(mutator){
  const snapshot=cloneState();if(!snapshot)return {ok:false,reason:"snapshot-failed"};
  try{
   const result=mutator();
   if(typeof window.normalizeSecondWorldCalamityState==="function")window.normalizeSecondWorldCalamityState(state);
   const saved=typeof save==="function"&&save(false)===true;
   if(!saved){restoreStateSnapshot(snapshot);return {ok:false,reason:"save-failed",rolledBack:true};}
   return {ok:true,result};
  }catch(error){
   restoreStateSnapshot(snapshot);
   return {ok:false,reason:"mutation-failed",error:String(error?.message||error),rolledBack:true};
  }
 }
 function options(){return defs().map((d,i)=>`<option value="${i}" ${i===selectedIndex?"selected":""}>${d.name}｜Lv.${d.level}</option>`).join("");}
 function selectedFromDom(id="gmSecondWorldCalamityManageTarget"){
  const el=typeof document!=="undefined"?document.getElementById(id):null;
  selectedIndex=clampIndex(el?.value??selectedIndex);
  return def();
 }
 function formalStatus(d=def()){
  return d&&typeof window.getSecondWorldCalamityStatus==="function"?window.getSecondWorldCalamityStatus(d.id,state):null;
 }
 function formalSummary(d=def()){
  const st=formalStatus(d),r=row(d);
  if(!d||!st)return "";
  const rawHp=r?.currentHp==null?d.maxHp:Math.max(1,Math.min(d.maxHp,Math.floor(Number(r.currentHp)||d.maxHp)));
  return `<div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">
   <div class="stat">狀態<b>${st.completed?"已完成":st.challengeable?"可挑戰":st.visible?"已現身・鎖定":"未現身"}</b></div>
   <div class="stat">文明進度<b>${pct(st.progressPercent)}%</b></div>
   <div class="stat">紀錄 True Kills<b>${st.recordedTrueKills} / 30</b></div>
   <div class="stat">目前 HP<b>${fmt(st.currentHp)} / ${fmt(st.maxHp)}</b></div>
   <div class="stat">State HP<b>${r?.currentHp==null?"滿血／null":fmt(rawHp)}</b></div>
   <div class="stat">目標文明<b>Lv.${d.targetCivilizationLevel}</b></div>
  </div>`;
 }
 function refreshFormalBox(){
  const d=selectedFromDom(),box=document.getElementById("gmSecondWorldCalamityManageBox");
  if(box&&d){
   const r=row(d)||{};
   box.innerHTML=`<div class="controls" style="align-items:end">
    <label>True Kills<br><input id="gmSecondWorldCalamityTrueKills" class="btn" type="number" min="0" max="30" value="${Math.max(0,Math.min(30,Math.floor(Number(r.trueKills)||0)))}"></label>
    <label>目前 HP<br><input id="gmSecondWorldCalamityCurrentHp" class="btn" type="number" min="1" max="${d.maxHp}" value="${r.currentHp==null?d.maxHp:Math.max(1,Math.min(d.maxHp,Math.floor(Number(r.currentHp)||d.maxHp)))}"></label>
    <button class="btn blue" onclick="gmApplySecondWorldCalamityFormal()">套用本災厄</button>
   </div>
   <div class="controls"><button class="btn" onclick="gmSecondWorldCalamitySetFullHp()">滿血</button><button class="btn danger" onclick="gmSecondWorldCalamitySetNearDeath()">瀕死 1 HP</button><button class="btn" onclick="gmSecondWorldCalamityResetSelected()">重置進度資料（保留文明）</button><button class="btn blue" onclick="gmSyncCivilizationFromCalamities()">同步文明等級</button></div>
   ${formalSummary(d)}`;
  }
  return d;
 }
 window.gmSecondWorldCalamitySelectFormal=function(value){selectedIndex=clampIndex(value);refreshFormalBox();return selectedIndex;};
 window.gmSecondWorldCalamityManagementHtml=function(){
  if(!entered())return '<div class="muted gm-hub-note">宇宙紀元文明災厄只在正式角色進入宇宙紀元後提供管理。</div>';
  const d=def();
  return `<div class="muted gm-hub-note">直接管理正式宇宙文明災厄進度。True Kills 範圍 0～30；完成後 HP 會依正式規則回到滿血重打狀態。使用「同步文明等級」可依連續完成的災厄重新計算 Civilization Lv.。</div>
   <div class="controls"><label>文明災厄<br><select id="gmSecondWorldCalamityManageTarget" class="btn" onchange="gmSecondWorldCalamitySelectFormal(this.value)">${options()}</select></label></div>
   <div id="gmSecondWorldCalamityManageBox">${d?`<div class="controls" style="align-items:end"><label>True Kills<br><input id="gmSecondWorldCalamityTrueKills" class="btn" type="number" min="0" max="30" value="${Math.max(0,Math.min(30,Math.floor(Number(row(d)?.trueKills)||0)))}"></label><label>目前 HP<br><input id="gmSecondWorldCalamityCurrentHp" class="btn" type="number" min="1" max="${d.maxHp}" value="${row(d)?.currentHp==null?d.maxHp:Math.max(1,Math.min(d.maxHp,Math.floor(Number(row(d)?.currentHp)||d.maxHp)))}"></label><button class="btn blue" onclick="gmApplySecondWorldCalamityFormal()">套用本災厄</button></div><div class="controls"><button class="btn" onclick="gmSecondWorldCalamitySetFullHp()">滿血</button><button class="btn danger" onclick="gmSecondWorldCalamitySetNearDeath()">瀕死 1 HP</button><button class="btn" onclick="gmSecondWorldCalamityResetSelected()">重置本災厄</button><button class="btn blue" onclick="gmSyncCivilizationFromCalamities()">同步文明等級</button></div>${formalSummary(d)}`:""}</div>`;
 };
 window.gmApplySecondWorldCalamityFormal=function(){
  const d=selectedFromDom();if(!d||!entered())return false;
  if(typeof window.normalizeSecondWorldCalamityState==="function")window.normalizeSecondWorldCalamityState(state);
  const r=row(d);if(!r)return false;
  const kills=Math.max(0,Math.min(30,Math.floor(Number(document.getElementById("gmSecondWorldCalamityTrueKills")?.value)||0)));
  const hp=Math.max(1,Math.min(d.maxHp,Math.floor(Number(document.getElementById("gmSecondWorldCalamityCurrentHp")?.value)||d.maxHp)));
  const committed=atomicFormalMutation(()=>{
   const target=row(d);if(!target)throw new Error("missing-calamity-row");
   target.trueKills=kills;
   if(kills>=30){
    target.currentHp=null;
    state.secondWorld.civilizationLevel=Math.max(Math.floor(Number(state.secondWorld.civilizationLevel)||0),d.targetCivilizationLevel);
   }else{
    const completedByCiv=Math.floor(Number(state.secondWorld.civilizationLevel)||0)>=d.targetCivilizationLevel;
    target.currentHp=completedByCiv?null:(hp>=d.maxHp?null:hp);
   }
  });
  if(!committed.ok){if(typeof render==="function")render();alert("存檔失敗，已回復文明災厄修改前狀態。");return false;}
  if(typeof render==="function")render();
  return true;
 };
 window.gmSecondWorldCalamitySetFullHp=function(){
  const d=selectedFromDom();if(!d)return false;
  const input=document.getElementById("gmSecondWorldCalamityCurrentHp");if(input)input.value=String(d.maxHp);
  return true;
 };
 window.gmSecondWorldCalamitySetNearDeath=function(){
  const input=document.getElementById("gmSecondWorldCalamityCurrentHp");if(input)input.value="1";
  return true;
 };
 window.gmSecondWorldCalamityResetSelected=function(){
  const d=selectedFromDom();if(!d||!row(d))return false;
  const committed=atomicFormalMutation(()=>{const target=row(d);target.trueKills=0;target.currentHp=null;});
  if(!committed.ok){if(typeof render==="function")render();alert("存檔失敗，已回復災厄重置前狀態。");return false;}
  if(typeof render==="function")render();
  return true;
 };
 window.gmSyncCivilizationFromCalamities=function(){
  if(!entered())return false;
  let lv=0;
  for(const d of defs()){
   if(Math.max(0,Math.floor(Number(row(d)?.trueKills)||0))>=30)lv=d.targetCivilizationLevel;
   else break;
  }
  const committed=atomicFormalMutation(()=>{state.secondWorld.civilizationLevel=Math.max(0,Math.min(10,lv));});
  if(!committed.ok){if(typeof render==="function")render();alert("存檔失敗，已回復文明同步前狀態。");return false;}
  if(typeof render==="function")render();
  return lv;
 };

 function testPlayer(snapshot=null){
  if(snapshot?.stats)return {...snapshot.stats};
  return typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():window.playerCombatStats?.();
 }
 function testCiv(snapshot=null){
  if(snapshot&&Number.isFinite(Number(snapshot.civilizationLevel)))return Math.max(0,Math.min(10,Math.floor(Number(snapshot.civilizationLevel))));
  return typeof window.gmTestCivilizationLevelValue==="function"?window.gmTestCivilizationLevelValue():0;
 }
 function simulate(d,options={}){
  if(!d||typeof window.runCombatCore!=="function"||typeof window.buildSecondWorldCalamityEnemy!=="function")return null;
  const e=window.buildSecondWorldCalamityEnemy(d.id),p=testPlayer(options.snapshot);if(!e||!p)return null;
  const startHp=options.startHp==null?e.hp:Math.max(1,Math.min(e.hp,Math.floor(Number(options.startHp)||e.hp)));
  const civ=testCiv(options.snapshot);
  const multi=typeof window.civilizationDamageMultiplierForLevel==="function"?window.civilizationDamageMultiplierForLevel(civ):1+civ*.05;
  const markLevels=options.snapshot?.marks||(typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):null);
  const result=window.runCombatCore(p,e,p.hp,{logs:false,preparePresentation:false,enemyStartHp:startHp,playerFinalDamageMultiplier:multi,markLevels,useTestSpecializations:!options.snapshot,useTestMarks:!options.snapshot});
  return {definition:d,enemy:e,player:p,startHp,civilizationLevel:civ,civilizationDamageMultiplier:multi,result,damage:Math.max(0,startHp-Math.max(0,Number(result.enemyHp)||0))};
 }
 function singleTestHtml(data){
  if(!data)return '<div class="notice">無法建立宇宙文明災厄測試。</div>';
  return `<div class="notice"><b>${data.definition.name}・單場沙盒</b><div class="muted" style="margin-top:5px">文明 Lv.${data.civilizationLevel}｜最終傷害 ×${Number(data.civilizationDamageMultiplier).toFixed(2)}｜不修改正式 HP、進度或存檔。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(130px,1fr))"><div class="stat">最大 HP<b>${fmt(data.enemy.hp)}</b></div><div class="stat">造成傷害<b>${fmt(data.damage)}</b></div><div class="stat">剩餘 HP<b>${fmt(data.result.enemyHp)}</b></div><div class="stat">玩家結果<b>${data.result.win?"勝利":"未擊殺"}</b></div><div class="stat">回合<b>${fmt(data.result.turns)}</b></div></div></div>`;
 }
 async function fullKill(d,snapshot=null){
  if(!d)return null;
  let hp=d.maxHp,attempts=0,totalDamage=0,totalTurns=0;
  while(hp>0&&attempts<100000){
   const r=simulate(d,{startHp:hp,snapshot});if(!r)break;
   attempts++;totalDamage+=r.damage;totalTurns+=Math.max(0,Number(r.result.turns)||0);
   hp=Math.max(0,Number(r.result.enemyHp)||0);
   if(r.result.win||hp<=0){hp=0;break;}
   if(attempts%100===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  return {definition:d,attempts,totalDamage,totalTurns,remainingHp:hp,completed:hp<=0};
 }
 function unlockProbe(d,bossCleared,civLevel){
  if(!d)return null;
  const civ=Math.max(0,Math.min(10,Math.floor(Number(civLevel)||0)));
  const visible=bossCleared===true;
  const previousCivilizationComplete=civ>=d.previousCivilizationLevel;
  return {visible,challengeable:visible&&previousCivilizationComplete,bossCleared:visible,civilizationLevel:civ,requiredCivilizationLevel:d.previousCivilizationLevel,previousCivilizationComplete};
 }
 window.gmSecondWorldCalamityUnlockProbe=function(value,bossCleared,civLevel){
  return unlockProbe(def(value),bossCleared,civLevel);
 };
 window.gmSecondWorldCalamityTestHtml=function(){
  const d=def(),civ=testCiv();
  return `<div class="muted gm-hub-note">宇宙文明災厄沙盒不受正式解鎖限制，使用目前 GM 共用測試 VIP／專精／強化／印記／文明等級。所有測試不修改正式災厄 HP、trueKills、文明等級或存檔。</div><div class="controls" style="align-items:end"><label>文明災厄<br><select id="gmSecondWorldCalamityTestTarget" class="btn" onchange="gmSecondWorldCalamitySelectTest(this.value)">${options()}</select></label><button class="btn blue" onclick="gmSecondWorldCalamitySingleTest()">單場沙盒</button><button class="btn" onclick="gmSecondWorldCalamityFullKillTest()">完整擊殺沙盒</button></div><div class="notice" style="margin-top:10px"><b>雙條件解鎖沙盒</b><div class="controls" style="align-items:end"><label>章末 Boss<br><select id="gmSecondWorldCalamityUnlockBoss" class="btn"><option value="0">未完成</option><option value="1" selected>已完成</option></select></label><span class="muted">使用目前 GM 測試文明 Lv.${civ}</span><button class="btn" onclick="gmSecondWorldCalamityRunUnlockProbe()">測解鎖判定</button></div><div id="gmSecondWorldCalamityUnlockResult" class="muted"></div></div><div id="gmSecondWorldCalamityTestResult" style="margin-top:10px">${testResultHtml}</div>`;
 };
 window.gmSecondWorldCalamityRunUnlockProbe=function(){
  const d=selectedFromDom("gmSecondWorldCalamityTestTarget");
  const boss=document.getElementById("gmSecondWorldCalamityUnlockBoss")?.value==="1";
  const result=unlockProbe(d,boss,testCiv());
  const box=document.getElementById("gmSecondWorldCalamityUnlockResult");
  if(box&&result)box.textContent=`現身：${result.visible?"是":"否"}｜可挑戰：${result.challengeable?"是":"否"}｜前置文明 Lv.${result.requiredCivilizationLevel} ${result.previousCivilizationComplete?"✓":"✕"}`;
  return result;
 };
 window.gmSecondWorldCalamitySelectTest=function(v){selectedIndex=clampIndex(v);testResultHtml="";if(typeof render==="function")render();return selectedIndex;};
 window.gmSecondWorldCalamitySingleTest=function(){
  const d=selectedFromDom("gmSecondWorldCalamityTestTarget"),data=simulate(d);
  testResultHtml=singleTestHtml(data);
  const box=document.getElementById("gmSecondWorldCalamityTestResult");if(box)box.innerHTML=testResultHtml;
  return data;
 };
 window.gmSecondWorldCalamityFullKillTest=async function(){
  const d=selectedFromDom("gmSecondWorldCalamityTestTarget"),data=await fullKill(d);
  testResultHtml=data?`<div class="notice"><b>${d.name}・完整擊殺沙盒</b><div class="stats" style="margin-top:10px"><div class="stat">結果<b>${data.completed?"完整擊殺":"安全上限"}</b></div><div class="stat">需要場次<b>${fmt(data.attempts)}</b></div><div class="stat">總傷害<b>${fmt(data.totalDamage)}</b></div><div class="stat">總回合<b>${fmt(data.totalTurns)}</b></div></div></div>`:'<div class="notice">測試失敗。</div>';
  const box=document.getElementById("gmSecondWorldCalamityTestResult");if(box)box.innerHTML=testResultHtml;
  return data;
 };

 async function benchmark(d,runs=100,snapshot=null){
  if(!d)return null;
  const n=Number(runs)===1000?1000:100;
  let damage=0,turns=0,wins=0,survivals=0,remaining=0;
  for(let i=0;i<n;i++){
   const r=simulate(d,{snapshot});if(!r)continue;
   damage+=r.damage;turns+=Math.max(0,Number(r.result.turns)||0);remaining+=Math.max(0,Number(r.result.enemyHp)||0);
   if(r.result.win)wins++;if(Number(r.result.hp)>0)survivals++;
   if((i+1)%25===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  return {definition:d,runs:n,avgDamage:damage/n,avgTurns:turns/n,avgRemainingHp:remaining/n,winRate:wins/n*100,survivalRate:survivals/n*100};
 }
 window.gmSecondWorldCalamityBenchmarkHtml=function(){
  const d=def();
  return `<div class="item"><b>文明災厄基準</b><div class="muted" style="margin-top:5px">使用同一份戰力基準 snapshot 與文明倍率，從災厄滿 HP 重複測試單場表現；不修改任何正式進度。</div><div class="gmpb-controls"><label>文明災厄<br><select class="btn" id="gmPowerBenchmarkCalamityTarget" onchange="gmPowerBenchmarkSetCalamity(this.value)">${options()}</select></label><label>測試量<br><select class="btn" id="gmPowerBenchmarkCalamityRuns"><option value="100">100</option><option value="1000">1000</option></select></label><button class="btn blue" onclick="gmPowerBenchmarkRunCalamity()">開始災厄基準</button></div><div id="gmPowerBenchmarkCalamityResult" style="margin-top:8px">${benchmarkResultHtml}</div></div>`;
 };
 window.gmPowerBenchmarkSetCalamity=function(v){selectedIndex=clampIndex(v);benchmarkResultHtml="";if(typeof render==="function")render();return selectedIndex;};
 window.gmPowerBenchmarkRunCalamity=async function(){
  const d=selectedFromDom("gmPowerBenchmarkCalamityTarget");
  const runs=Number(document.getElementById("gmPowerBenchmarkCalamityRuns")?.value)===1000?1000:100;
  const snap=typeof window.gmPowerBenchmarkSnapshot==="function"?window.gmPowerBenchmarkSnapshot():null;
  const data=await benchmark(d,runs,snap);
  benchmarkResultHtml=data?`<div class="gmpb-metrics"><div class="item gmpb-metric"><span>平均單場傷害</span><b>${fmt(data.avgDamage)}</b></div><div class="item gmpb-metric"><span>平均剩餘 HP</span><b>${fmt(data.avgRemainingHp)}</b></div><div class="item gmpb-metric"><span>平均回合</span><b>${Number(data.avgTurns).toFixed(1)}</b></div><div class="item gmpb-metric"><span>單場擊殺率</span><b>${pct(data.winRate)}%</b></div><div class="item gmpb-metric"><span>玩家存活率</span><b>${pct(data.survivalRate)}%</b></div></div>`:'<div class="notice">災厄基準失敗。</div>';
  const box=document.getElementById("gmPowerBenchmarkCalamityResult");if(box)box.innerHTML=benchmarkResultHtml;
  return data;
 };

 window.runGmSecondWorldCalamitySimulation=simulate;
 window.runGmSecondWorldCalamityFullKill=fullKill;
 window.runGmSecondWorldCalamityBenchmark=benchmark;
 window.GM_SECOND_WORLD_CALAMITY_VERSION=VERSION;
 window.GM_SECOND_WORLD_CALAMITY_FORMAL_VERSION=FORMAL_VERSION;
 window.GM_SECOND_WORLD_CALAMITY_ATOMIC_MUTATION_VERSION=1;
 window.GM_SECOND_WORLD_CALAMITY_TEST_VERSION=TEST_VERSION;
 window.GM_SECOND_WORLD_CALAMITY_MANAGE_RETIRED_VERSION=1;
 window.GM_POWER_BENCHMARK_CALAMITY_VERSION=BENCHMARK_VERSION;

 if(typeof window.registerGmHubSection==="function"){
  window.registerGmHubSection("test","宇宙文明災厄測試",window.gmSecondWorldCalamityTestHtml,{id:"second-world-calamity-test"});
 }
})();