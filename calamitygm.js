(function(){
 const GM_CALAMITY_TEST_VERSION=1;
 const GM_MARK_MANAGEMENT_VERSION=2;
 const GM_MARK_CONFIG_OWNER_VERSION=1;
 const GM_MARK_FORMAL_PHASE_LOCK_VERSION=1;
 const FULL_KILL_SAFETY_LIMIT=100000;
 const FULL_KILL_NO_PROGRESS_LIMIT=100;
 let singleResultHtml="";
 let fullResultHtml="";
 let gmCalamityLastResult=null;
 let gmCalamitySelectedId=null;
 let busy=false;

 function markRows(){return Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);}
 function keys(){return markRows().map(row=>row.markId);}
 function calamities(){return typeof window.getCivilizationCalamityDefinitions==="function"?window.getCivilizationCalamityDefinitions():[];}
 function clampMark(value){return typeof window.markClampLevel==="function"?window.markClampLevel(value):Math.max(0,Math.min(10,Math.floor(Number(value)||0)));}
 function formalMarks(){return typeof window.markFormalSnapshot==="function"?window.markFormalSnapshot():{};}
 function testMarks(){return typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):Object.fromEntries(keys().map(key=>[key,0]));}
 function formalMarkMinimum(target=state){
  const phase=typeof window.currentWorldPhase==="function"?window.currentWorldPhase(target):(target?.thirdWorld?.entered===true?3:target?.secondWorld?.entered===true?2:1);
  return phase>=2?10:0;
 }
 function markOptions(value){
  const n=clampMark(value);
  return Array.from({length:11},(_,i)=>`<option value="${i}" ${i===n?"selected":""}>Lv.${i}</option>`).join("");
 }
 function formalOptions(entry,target=state){
  const minimum=formalMarkMinimum(target);
  if(minimum>=10)return '<option value="10" selected>Lv.10</option>';
  const acquired=entry?.acquired===true,level=clampMark(entry?.level);
  let html=`<option value="none" ${!acquired?"selected":""}>未取得</option>`;
  for(let i=0;i<=10;i++)html+=`<option value="${i}" ${acquired&&level===i?"selected":""}>Lv.${i}</option>`;
  return html;
 }
 function testGrid(){
  const levels=testMarks();
  return `<div class="gm-specialization-grid gm-mark-grid">${keys().map(key=>`<label><span>${String(markRows().find(row=>row.markId===key)?.markName||key)}</span><select class="btn" id="gmMark-test-${key}" onchange="gmSetTestMarkLevelUi('${key}',this.value)">${markOptions(levels[key])}</select></label>`).join("")}</div>`;
 }
 function manageGrid(){
  const formal=formalMarks(),locked=formalMarkMinimum()>=10;
  return `<div class="gm-specialization-grid gm-mark-grid">${keys().map(key=>`<label><span>${String(markRows().find(row=>row.markId===key)?.markName||key)}</span><select class="btn" id="gmMark-manage-${key}" ${locked?"disabled":""}>${formalOptions(formal[key])}</select></label>`).join("")}</div>`;
 }
 window.gmTestMarkLabel=function(){
  const levels=testMarks();
  return `印記｜${markRows().map(row=>`${String(row.markName||row.markId).replace("印記","")} Lv.${levels[row.markId]||0}`).join("｜")}`;
 };
 window.refreshGmMarkTestControls=function(){
  const levels=testMarks();
  keys().forEach(key=>{const el=document.getElementById(`gmMark-test-${key}`);if(el)el.value=String(levels[key]||0);});
  const info=document.getElementById("gmMarkTestInfo");if(info)info.textContent=window.gmTestMarkLabel();
  return levels;
 };
 window.gmSetTestMarkLevelUi=function(key,value){
  if(typeof window.gmSetTestMarkLevel!=="function")return false;
  const ok=window.gmSetTestMarkLevel(key,value);
  if(typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  else window.refreshGmMarkTestControls();
  return ok;
 };
 window.gmMarkManagementHtml=function(){
  const locked=formalMarkMinimum()>=10;
  const note=locked?"目前已進入宇宙紀元或高維紀元；正式角色的 10 枚印記依紀元進入條件固定為 Lv.10，不可向下調整。GM 測試區仍可自由測試 Lv.0～Lv.10。":"直接修改玩家正式印記狀態。每枚可設為「未取得」或 Lv.0～Lv.10；套用時該印記目前升級進度歸 0，並寫入正式存檔。";
  return `<div class="muted gm-hub-note">${note}</div>${manageGrid()}<div class="controls"><button class="btn blue" onclick="gmApplyFormalMarks()">套用印記狀態</button></div>`;
 };
 window.gmApplyFormalMarks=function(){
  const minimum=formalMarkMinimum(state),values={};
  keys().forEach(key=>{
   if(minimum>=10){values[key]=10;return;}
   const el=document.getElementById(`gmMark-manage-${key}`),raw=el?.value??"none";
   values[key]=raw==="none"?null:clampMark(raw);
  });
  if(typeof window.gmCommitFormalMarkMutation!=="function")return alert("正式印記 transaction owner 尚未載入。"),false;
  const tx=window.gmCommitFormalMarkMutation(values);
  if(!tx?.ok){if(typeof render==="function")render();alert(`正式印記更新失敗：${tx?.reason||tx?.value?.reason||"未知錯誤"}`);return false;}
  if(typeof render==="function")render();
  alert(minimum>=10?"正式印記已維持於 Lv.10。":"正式印記狀態已更新。");
  return true;
 };
 window.gmMarkTestHtml=function(){
  return `<div class="muted gm-hub-note">本區只調整 GM 戰鬥測試使用的印記等級；Lv.0 與未取得在戰鬥效果上相同，因此測試僅提供 Lv.0～Lv.10，不修改正式存檔。</div>${testGrid()}<div id="gmMarkTestInfo" class="muted" style="margin-top:10px">${window.gmTestMarkLabel()}</div>`;
 };

 function calamityOptions(){
  const list=calamities();if(!gmCalamitySelectedId)gmCalamitySelectedId=String(list[0]?.id||"");
  return list.map(def=>`<option value="${def.id}" ${String(def.id)===gmCalamitySelectedId?"selected":""}>${def.name}（Lv.${def.unlockLevel}）</option>`).join("");
 }
 function selectedCalamityId(){const id=String(document.getElementById("gmCalamityTarget")?.value||gmCalamitySelectedId||calamities()[0]?.id||"");gmCalamitySelectedId=id;return id;}
 window.gmSetCalamityTestTarget=function(value){gmCalamitySelectedId=String(value||calamities()[0]?.id||"");return gmCalamitySelectedId;};
 function player(){
  return typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():createSpecialPlayerSnapshot(playerCombatStats());
 }
 function testContext(){
  return typeof window.gmTestContextSnapshot==="function"?window.gmTestContextSnapshot():null;
 }
 function contextRevision(context){
  return Math.max(0,Math.floor(Number(context?.revision)||0));
 }
 function summary(title,runLabel){
  const vipText=typeof window.gmTestVipLabel==="function"?window.gmTestVipLabel():`VIP${Math.max(0,Number(window.gmTestVipLevel)||0)}`;
  return typeof window.gmTestSummaryHtml==="function"?window.gmTestSummaryHtml(title,runLabel,vipText):`<div class="gm-test-summary-title">${title}・${runLabel}</div>`;
 }
 function simulateAttempt(calamityId,startHp=null,rng=null,capturedContext=null,overrides={}){
  const enemy=window.buildCivilizationCalamityEnemy?.(calamityId);if(!enemy)return null;
  const context=capturedContext||testContext();
  const p=overrides.player&&typeof overrides.player==="object"?{...overrides.player}:player(),enemyStart=startHp==null?enemy.hp:Math.max(1,Math.min(enemy.hp,Math.floor(Number(startHp)||enemy.hp)));
  const markLevels=overrides.markLevels&&typeof overrides.markLevels==="object"?overrides.markLevels:testMarks();
  const breakthroughLevel=context?.breakthroughLevel??(typeof window.gmTestBreakthroughLevelValue==="function"?Math.max(0,Math.floor(Number(window.gmTestBreakthroughLevelValue())||0)):0);
  const finalDamageMultiplier=Number(overrides.playerFinalDamageMultiplier)||(Number(context?.finalDamage?.multiplier)||(typeof window.gmTestFinalDamageMultiplier==="function"?window.gmTestFinalDamageMultiplier(1,0,breakthroughLevel):1));
  const useTestSpecializations=overrides.useTestSpecializations!==false;
  const result=window.runCombatCore(p,enemy,p.hp,{logs:false,useTestSpecializations,markLevels,enemyStartHp:enemyStart,rng:typeof rng==="function"?rng:undefined,playerFinalDamageMultiplier:finalDamageMultiplier});
  return {enemy,player:p,enemyStart,result,testContext:context,breakthroughLevel,finalDamageMultiplier,damage:Math.max(0,enemyStart-Math.max(0,Number(result.enemyHp)||0))};
 }
 function shouldStopForNoProgress(streak){return Math.max(0,Math.floor(Number(streak)||0))>=FULL_KILL_NO_PROGRESS_LIMIT;}
 function singleHtml(data){
  if(!data)return `<div class="notice">找不到文明災厄測試資料。</div>`;
  const def=window.getCivilizationCalamityDefinition?.(data.enemy.calamityId),remaining=Math.max(0,Number(data.result.enemyHp)||0),pct=data.enemy.hp?Math.round(remaining/data.enemy.hp*1000)/10:0;
  return `<div class="notice">${summary(def?.name||data.enemy.name,"單次挑戰模擬")}<div class="muted gm-test-context">災厄由滿血開始；玩家每次以 GM 測試能力滿血進場。只做沙盒模擬，不修改正式災厄 HP、印記或存檔。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">災厄最大 HP<b>${data.enemy.hp.toLocaleString()}</b></div><div class="stat">本場造成傷害<b>${data.damage.toLocaleString()}</b></div><div class="stat">剩餘 HP<b>${remaining.toLocaleString()}</b></div><div class="stat">剩餘比例<b>${pct}%</b></div><div class="stat">戰鬥回合<b>${data.result.turns}</b></div><div class="stat">玩家結果<b>${data.result.win?`勝利・剩 ${data.result.hp}`:"戰敗"}</b></div></div></div>`;
 }
 async function simulateFullKill(calamityId,onProgress=null){
  const enemy=window.buildCivilizationCalamityEnemy?.(calamityId);if(!enemy)return null;
  const context=testContext(),startRevision=contextRevision(context);
  let hp=enemy.hp,attempts=0,totalTurns=0,totalDamage=0,lastPlayerHp=0,completed=false,stale=false,noProgressStreak=0,noProgress=false;
  while(hp>0&&attempts<FULL_KILL_SAFETY_LIMIT){
   if(typeof window.gmTestContextRevision==="function"&&window.gmTestContextRevision()!==startRevision){stale=true;break;}
   const attempt=simulateAttempt(calamityId,hp,null,context);
   if(!attempt)break;
   attempts++;
   totalTurns+=Math.max(0,Number(attempt.result.turns)||0);
   totalDamage+=attempt.damage;
   hp=Math.max(0,Number(attempt.result.enemyHp)||0);
   noProgressStreak=attempt.damage>0?0:noProgressStreak+1;
   lastPlayerHp=Math.max(0,Number(attempt.result.hp)||0);
   if(attempt.result.win||hp<=0){hp=0;completed=true;break;}
   if(shouldStopForNoProgress(noProgressStreak)){noProgress=true;break;}
   if(attempts%100===0){
    if(onProgress)onProgress(attempts,hp,enemy.hp);
    await new Promise(resolve=>setTimeout(resolve,0));
   }
  }
  if(typeof window.gmTestContextRevision==="function"&&window.gmTestContextRevision()!==startRevision)stale=true;
  const breakthroughLevel=context?.breakthroughLevel??0;
  const finalDamageMultiplier=Number(context?.finalDamage?.multiplier)||1;
  return {enemy,attempts,totalTurns,totalDamage,remainingHp:hp,completed:completed&&!stale,stale,noProgress,lastPlayerHp,testContext:context,breakthroughLevel,finalDamageMultiplier,avgDamage:attempts?Math.round(totalDamage/attempts):0,avgTurns:attempts?Math.round(totalTurns/attempts*10)/10:0,safetyLimit:FULL_KILL_SAFETY_LIMIT,noProgressLimit:FULL_KILL_NO_PROGRESS_LIMIT};
 }
 function fullHtml(data){
  if(!data)return `<div class="notice">找不到文明災厄測試資料。</div>`;
  const def=window.getCivilizationCalamityDefinition?.(data.enemy.calamityId),pct=data.enemy.hp?Math.round(data.remainingHp/data.enemy.hp*1000)/10:0;
  const resultLabel=data.completed?"完整擊殺":data.noProgress?"無有效進度":"達安全上限";
  const note=data.completed?"":data.noProgress?`<div class="muted" style="margin-top:10px">已連續 ${data.noProgressLimit.toLocaleString()} 場造成 0 傷害，判定目前角色無法形成有效削血，提前停止模擬。</div>`:`<div class="muted" style="margin-top:10px">已達 ${data.safetyLimit.toLocaleString()} 場安全上限；結果未以平均值外推，因此不偽造完整擊殺次數。</div>`;
  return `<div class="notice">${summary(def?.name||data.enemy.name,"完整擊殺模擬")}<div class="muted gm-test-context">每一次挑戰玩家都重新滿血，災厄剩餘 HP 跨挑戰延續；逐場呼叫正式 Combat Core，直到完整擊殺、無有效進度或達安全上限。此測試不修改正式資料。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">結果<b>${resultLabel}</b></div><div class="stat">需要挑戰次數<b>${data.attempts.toLocaleString()}</b></div><div class="stat">總戰鬥回合<b>${data.totalTurns.toLocaleString()}</b></div><div class="stat">平均每場回合<b>${data.avgTurns}</b></div><div class="stat">平均每場傷害<b>${data.avgDamage.toLocaleString()}</b></div><div class="stat">災厄最大 HP<b>${data.enemy.hp.toLocaleString()}</b></div><div class="stat">剩餘 HP<b>${data.remainingHp.toLocaleString()}（${pct}%）</b></div></div>${note}</div>`;
 }

 window.gmCalamitySingle=function(){
  if(busy)return false;
  const id=selectedCalamityId(),box=document.getElementById("gmCalamityResult");
  busy=true;
  try{
   const data=simulateAttempt(id);
   gmCalamityLastResult=data?{type:"single",calamityId:id,enemy:{name:data.enemy.name,hp:data.enemy.hp},testContext:data.testContext,breakthroughLevel:data.breakthroughLevel,finalDamageMultiplier:data.finalDamageMultiplier,damage:data.damage,remainingHp:Math.max(0,Number(data.result.enemyHp)||0),turns:data.result.turns,win:!!data.result.win,playerHp:Math.max(0,Number(data.result.hp)||0)}:null;
   singleResultHtml=singleHtml(data);
   if(box)box.innerHTML=singleResultHtml;
   if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();
  }finally{busy=false;}
  return true;
 };
 window.gmCalamityFullKill=async function(){
  if(busy)return false;
  const id=selectedCalamityId(),button=document.getElementById("gmCalamityFullBtn"),box=document.getElementById("gmCalamityResult");
  busy=true;if(button){button.disabled=true;button.textContent="模擬中…";}
  try{
   const data=await simulateFullKill(id,(attempts,hp,maxHp)=>{if(box)box.innerHTML=`<div class="notice">完整擊殺模擬中…<div class="muted" style="margin-top:8px">已完成 ${attempts.toLocaleString()} 場｜災厄 HP ${hp.toLocaleString()} / ${maxHp.toLocaleString()}</div></div>`;});
   if(data?.stale){
    gmCalamityLastResult=null;
    fullResultHtml='<div class="notice">測試期間角色設定已變更，本次完整擊殺結果已作廢；請以目前設定重新測試。</div>';
   }else{
    gmCalamityLastResult=data?{type:"full",calamityId:id,enemy:{name:data.enemy.name,hp:data.enemy.hp},testContext:data.testContext,breakthroughLevel:data.breakthroughLevel,finalDamageMultiplier:data.finalDamageMultiplier,attempts:data.attempts,totalTurns:data.totalTurns,totalDamage:data.totalDamage,remainingHp:data.remainingHp,completed:!!data.completed,avgDamage:data.avgDamage,avgTurns:data.avgTurns}:null;
    fullResultHtml=fullHtml(data);
   }
   if(box)box.innerHTML=fullResultHtml;
   if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();
  }finally{busy=false;if(button){button.disabled=false;button.textContent="完整擊殺模擬";}}
  return true;
 };
 window.gmCalamityTestHtml=function(){
  return `<div class="muted gm-hub-note">文明災厄 GM 模擬不受正式解鎖狀態限制。玩家使用目前 GM 測試 VIP／專精／強化／印記；災厄固定使用正式數值。所有結果皆為沙盒，不修改正式災厄 HP 或印記。</div><div class="controls" style="align-items:end"><label>文明災厄<br><select id="gmCalamityTarget" class="btn" onchange="gmSetCalamityTestTarget(this.value)">${calamityOptions()}</select></label><button class="btn blue" onclick="gmCalamitySingle()">單次挑戰模擬</button><button id="gmCalamityFullBtn" class="btn gm-create" onclick="gmCalamityFullKill()">完整擊殺模擬</button></div><div id="gmCalamityResult" style="margin-top:12px">${fullResultHtml||singleResultHtml}</div>`;
 };

 window.runGmCalamitySingleSimulation=function(id,options={}){return simulateAttempt(id,options.startHp??null,options.rng,options.testContext||null,options);};
 window.runGmCalamityFullKillSimulation=simulateFullKill;
 window.GM_CALAMITY_TEST_VERSION=GM_CALAMITY_TEST_VERSION;
 window.GM_MARK_MANAGEMENT_VERSION=GM_MARK_MANAGEMENT_VERSION;
 window.GM_MARK_CONFIG_OWNER_VERSION=GM_MARK_CONFIG_OWNER_VERSION;
 window.GM_MARK_FORMAL_PHASE_LOCK_VERSION=GM_MARK_FORMAL_PHASE_LOCK_VERSION;
 window.GM_MARK_FORMAL_TRANSACTION_VERSION=1;
 window.gmFormalMarkMinimum=formalMarkMinimum;
 window.GM_CALAMITY_FULL_KILL_SAFETY_LIMIT=FULL_KILL_SAFETY_LIMIT;
 window.GM_CALAMITY_FULL_KILL_NO_PROGRESS_LIMIT=FULL_KILL_NO_PROGRESS_LIMIT;
 window.gmCalamityShouldStopForNoProgress=shouldStopForNoProgress;
 window.gmCalamityTestResultSnapshot=function(){return gmCalamityLastResult?JSON.parse(JSON.stringify(gmCalamityLastResult)):null;};
 window.gmClearCalamityTestResult=function(){singleResultHtml="";fullResultHtml="";gmCalamityLastResult=null;return true;};
 window.GM_CALAMITY_TEST_EMBEDDED_VERSION=1;
 window.GM_CALAMITY_TEST_CONTEXT_SNAPSHOT_VERSION=1;
 window.GM_CALAMITY_TEST_STALE_RESULT_GUARD_VERSION=1;
 window.GM_CALAMITY_NO_PROGRESS_GUARD_VERSION=1;
 window.GM_CALAMITY_SUMMARY_EXPORT_VERSION=1;
 window.GM_CALAMITY_SESSION_SETTINGS_VERSION=1;
 window.GM_CALAMITY_LEGACY_TITLE_PREVIEW_RETIRED_VERSION=1;

 if(typeof window.registerGmHubSection==="function"){
  window.registerGmHubSection("manage","印記管理",window.gmMarkManagementHtml,{id:"marks-manage",position:"append"});
 }
})();
