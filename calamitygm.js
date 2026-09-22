(function(){
 const GM_CALAMITY_TEST_VERSION=1;
 const GM_MARK_MANAGEMENT_VERSION=1;
 const GM_MARK_CONFIG_OWNER_VERSION=1;
 const GM_PLAYER_TITLE_PREVIEW_VERSION=3;
 const FULL_KILL_SAFETY_LIMIT=100000;
 let singleResultHtml="";
 let fullResultHtml="";
 let gmCalamityLastResult=null;
 let busy=false;
 let gmTitlePreviewId=null;

 function markRows(){return Array.from(window.CIVILIZATION_CALAMITY_CONFIG||[]);}
 function keys(){return markRows().map(row=>row.markId);}
 function calamities(){return typeof window.getCivilizationCalamityDefinitions==="function"?window.getCivilizationCalamityDefinitions():[];}
 function clampMark(value){return typeof window.markClampLevel==="function"?window.markClampLevel(value):Math.max(0,Math.min(10,Math.floor(Number(value)||0)));}
 function formalMarks(){return typeof window.markFormalSnapshot==="function"?window.markFormalSnapshot():{};}
 function testMarks(){return typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):Object.fromEntries(keys().map(key=>[key,0]));}
 function markOptions(value){
  const n=clampMark(value);
  return Array.from({length:11},(_,i)=>`<option value="${i}" ${i===n?"selected":""}>Lv.${i}</option>`).join("");
 }
 function formalOptions(entry){
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
  const formal=formalMarks();
  return `<div class="gm-specialization-grid gm-mark-grid">${keys().map(key=>`<label><span>${String(markRows().find(row=>row.markId===key)?.markName||key)}</span><select class="btn" id="gmMark-manage-${key}">${formalOptions(formal[key])}</select></label>`).join("")}</div>`;
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
  return `<div class="muted gm-hub-note">直接修改玩家正式印記狀態。每枚可設為「未取得」或 Lv.0～Lv.10；套用時該印記目前升級進度歸 0，並寫入正式存檔。</div>${manageGrid()}<div class="controls"><button class="btn blue" onclick="gmApplyFormalMarks()">套用印記狀態</button></div>`;
 };
 window.gmApplyFormalMarks=function(){
  if(typeof window.ensureCivilizationCalamityState==="function")window.ensureCivilizationCalamityState();
  if(!state?.marks?.entries)return false;
  keys().forEach(key=>{
   const el=document.getElementById(`gmMark-manage-${key}`),raw=el?.value??"none",entry=state.marks.entries[key]||(state.marks.entries[key]={acquired:false,level:0,progress:0});
   if(raw==="none"){entry.acquired=false;entry.level=0;entry.progress=0;}
   else{entry.acquired=true;entry.level=clampMark(raw);entry.progress=0;}
  });
  if(typeof window.normalizeCivilizationCalamityState==="function")window.normalizeCivilizationCalamityState(state);
  if(typeof save==="function")save();
  if(typeof render==="function")render();
  alert("正式印記狀態已更新。");
  return true;
 };
 window.gmMarkTestHtml=function(){
  return `<div class="muted gm-hub-note">本區只調整 GM 戰鬥測試使用的印記等級；Lv.0 與未取得在戰鬥效果上相同，因此測試僅提供 Lv.0～Lv.10，不修改正式存檔。</div>${testGrid()}<div id="gmMarkTestInfo" class="muted" style="margin-top:10px">${window.gmTestMarkLabel()}</div>`;
 };


 function titleDefs(){return Array.from(window.PLAYER_TITLE_DEFS||[]);}
 function titlePreviewDefinition(){
  const defs=titleDefs();
  if(!gmTitlePreviewId&&defs.length)gmTitlePreviewId=defs[0].id;
  return defs.find(def=>def.id===gmTitlePreviewId)||defs[0]||null;
 }
 function titlePreviewLabel(def){
  if(!def)return "";
  return def.series==="mirror"?`鏡像 ${def.mirrorWins} 勝｜${def.name}`:`災厄第 ${def.tier} 階｜${def.name}`;
 }
 function titlePreviewOptions(){
  return titleDefs().map((def,index)=>{
   const divider=index===10?'<option disabled>──── 鏡像戰稱號 ────</option>':"";
   const label=titlePreviewLabel(def);
   return divider+`<option value="${def.id}" ${def.id===gmTitlePreviewId?"selected":""}>${label}</option>`;
  }).join("");
 }
 function titlePreviewPlayerName(){
  const name=typeof state?.playerName==="string"?state.playerName.trim():"";
  return name||"玩家";
 }
 function titleCombatPreviewHtml(def){
  const identity=def&&typeof window.playerIdentityNameHtml==="function"
   ?window.playerIdentityNameHtml({name:titlePreviewPlayerName(),titleId:def.id,compact:true,allowUnownedTitle:true})
   :titlePreviewPlayerName();
  return `<div class="gm-player-title-combat-preview"><div class="combatant player"><h2>${identity}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span>100 / 100</span></div><div class="bar"><span class="hp" style="width:100%"></span></div></div></div></div>`;
 }
 window.gmSetPlayerTitlePreviewTier=function(value){
  const defs=titleDefs(),id=String(value||"");
  gmTitlePreviewId=defs.some(def=>def.id===id)?id:(defs[0]?.id||null);
  const box=document.getElementById("gmPlayerTitlePreviewBox"),def=titlePreviewDefinition();
  if(box&&def)box.innerHTML=`${titleCombatPreviewHtml(def)}<div class="muted" style="text-align:center;margin-top:8px">${titlePreviewLabel(def)}</div>`;
  return gmTitlePreviewId;
 };
 window.gmPlayerTitlePreviewHtml=function(){
  const def=titlePreviewDefinition();
  return `<div class="muted gm-hub-note">實戰名稱預覽全部 16 個正式稱號；直接使用目前正式玩家名稱與正式 playerIdentityNameHtml()，前 10 個為文明災厄、後 6 個為鏡像戰。此區不解鎖、不裝備、不修改任何正式狀態，也不寫入存檔。</div><div class="controls" style="align-items:end"><label>稱號<br><select class="btn" onchange="gmSetPlayerTitlePreviewTier(this.value)">${titlePreviewOptions()}</select></label></div><div id="gmPlayerTitlePreviewBox" class="notice" style="margin-top:12px">${titleCombatPreviewHtml(def)}<div class="muted" style="text-align:center;margin-top:8px">${titlePreviewLabel(def)}</div></div>`;
 };
 function calamityOptions(){
  return calamities().map((def,index)=>`<option value="${def.id}" ${index===0?"selected":""}>${def.name}（Lv.${def.unlockLevel}）</option>`).join("");
 }
 function selectedCalamityId(){return String(document.getElementById("gmCalamityTarget")?.value||calamities()[0]?.id||"");}
 function player(){
  return typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats():createSpecialPlayerSnapshot(playerCombatStats());
 }
 function summary(title,runLabel){
  const vipText=typeof window.gmTestVipLabel==="function"?window.gmTestVipLabel():`VIP${Math.max(0,Number(window.gmTestVipLevel)||0)}`;
  return typeof window.gmTestSummaryHtml==="function"?window.gmTestSummaryHtml(title,runLabel,vipText):`<div class="gm-test-summary-title">${title}・${runLabel}</div>`;
 }
 function simulateAttempt(calamityId,startHp=null,rng=null){
  const enemy=window.buildCivilizationCalamityEnemy?.(calamityId);if(!enemy)return null;
  const p=player(),enemyStart=startHp==null?enemy.hp:Math.max(1,Math.min(enemy.hp,Math.floor(Number(startHp)||enemy.hp)));
  const markLevels=testMarks();
  const result=window.runCombatCore(p,enemy,p.hp,{logs:false,useTestSpecializations:true,markLevels,enemyStartHp:enemyStart,rng:typeof rng==="function"?rng:undefined});
  return {enemy,player:p,enemyStart,result,damage:Math.max(0,enemyStart-Math.max(0,Number(result.enemyHp)||0))};
 }
 function singleHtml(data){
  if(!data)return `<div class="notice">找不到文明災厄測試資料。</div>`;
  const def=window.getCivilizationCalamityDefinition?.(data.enemy.calamityId),remaining=Math.max(0,Number(data.result.enemyHp)||0),pct=data.enemy.hp?Math.round(remaining/data.enemy.hp*1000)/10:0;
  return `<div class="notice">${summary(def?.name||data.enemy.name,"單次挑戰模擬")}<div class="muted gm-test-context">災厄由滿血開始；玩家每次以 GM 測試能力滿血進場。只做沙盒模擬，不修改正式災厄 HP、印記或存檔。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">災厄最大 HP<b>${data.enemy.hp.toLocaleString()}</b></div><div class="stat">本場造成傷害<b>${data.damage.toLocaleString()}</b></div><div class="stat">剩餘 HP<b>${remaining.toLocaleString()}</b></div><div class="stat">剩餘比例<b>${pct}%</b></div><div class="stat">戰鬥回合<b>${data.result.turns}</b></div><div class="stat">玩家結果<b>${data.result.win?`勝利・剩 ${data.result.hp}`:"戰敗"}</b></div></div></div>`;
 }
 async function simulateFullKill(calamityId,onProgress=null){
  const enemy=window.buildCivilizationCalamityEnemy?.(calamityId);if(!enemy)return null;
  let hp=enemy.hp,attempts=0,totalTurns=0,totalDamage=0,lastPlayerHp=0,completed=false;
  while(hp>0&&attempts<FULL_KILL_SAFETY_LIMIT){
   const attempt=simulateAttempt(calamityId,hp);
   if(!attempt)break;
   attempts++;
   totalTurns+=Math.max(0,Number(attempt.result.turns)||0);
   totalDamage+=attempt.damage;
   hp=Math.max(0,Number(attempt.result.enemyHp)||0);
   lastPlayerHp=Math.max(0,Number(attempt.result.hp)||0);
   if(attempt.result.win||hp<=0){hp=0;completed=true;break;}
   if(attempts%100===0){
    if(onProgress)onProgress(attempts,hp,enemy.hp);
    await new Promise(resolve=>setTimeout(resolve,0));
   }
  }
  return {enemy,attempts,totalTurns,totalDamage,remainingHp:hp,completed,lastPlayerHp,avgDamage:attempts?Math.round(totalDamage/attempts):0,avgTurns:attempts?Math.round(totalTurns/attempts*10)/10:0,safetyLimit:FULL_KILL_SAFETY_LIMIT};
 }
 function fullHtml(data){
  if(!data)return `<div class="notice">找不到文明災厄測試資料。</div>`;
  const def=window.getCivilizationCalamityDefinition?.(data.enemy.calamityId),pct=data.enemy.hp?Math.round(data.remainingHp/data.enemy.hp*1000)/10:0;
  return `<div class="notice">${summary(def?.name||data.enemy.name,"完整擊殺模擬")}<div class="muted gm-test-context">每一次挑戰玩家都重新滿血，災厄剩餘 HP 跨挑戰延續；逐場呼叫正式 Combat Core，直到完整擊殺或達安全上限。此測試不修改正式資料。</div><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">結果<b>${data.completed?"完整擊殺":"達安全上限"}</b></div><div class="stat">需要挑戰次數<b>${data.attempts.toLocaleString()}</b></div><div class="stat">總戰鬥回合<b>${data.totalTurns.toLocaleString()}</b></div><div class="stat">平均每場回合<b>${data.avgTurns}</b></div><div class="stat">平均每場傷害<b>${data.avgDamage.toLocaleString()}</b></div><div class="stat">災厄最大 HP<b>${data.enemy.hp.toLocaleString()}</b></div><div class="stat">剩餘 HP<b>${data.remainingHp.toLocaleString()}（${pct}%）</b></div></div>${data.completed?"":`<div class="muted" style="margin-top:10px">已達 ${data.safetyLimit.toLocaleString()} 場安全上限；結果未以平均值外推，因此不偽造完整擊殺次數。</div>`}</div>`;
 }

 window.gmCalamitySingle=function(){
  if(busy)return false;
  const id=selectedCalamityId(),box=document.getElementById("gmCalamityResult");
  busy=true;
  try{
   const data=simulateAttempt(id);
   gmCalamityLastResult=data?{type:"single",calamityId:id,enemy:{name:data.enemy.name,hp:data.enemy.hp},damage:data.damage,remainingHp:Math.max(0,Number(data.result.enemyHp)||0),turns:data.result.turns,win:!!data.result.win,playerHp:Math.max(0,Number(data.result.hp)||0)}:null;
   singleResultHtml=singleHtml(data);
   if(box)box.innerHTML=singleResultHtml;
  }finally{busy=false;}
  return true;
 };
 window.gmCalamityFullKill=async function(){
  if(busy)return false;
  const id=selectedCalamityId(),button=document.getElementById("gmCalamityFullBtn"),box=document.getElementById("gmCalamityResult");
  busy=true;if(button){button.disabled=true;button.textContent="模擬中…";}
  try{
   const data=await simulateFullKill(id,(attempts,hp,maxHp)=>{if(box)box.innerHTML=`<div class="notice">完整擊殺模擬中…<div class="muted" style="margin-top:8px">已完成 ${attempts.toLocaleString()} 場｜災厄 HP ${hp.toLocaleString()} / ${maxHp.toLocaleString()}</div></div>`;});
   gmCalamityLastResult=data?{type:"full",calamityId:id,enemy:{name:data.enemy.name,hp:data.enemy.hp},attempts:data.attempts,totalTurns:data.totalTurns,totalDamage:data.totalDamage,remainingHp:data.remainingHp,completed:!!data.completed,avgDamage:data.avgDamage,avgTurns:data.avgTurns}:null;
   fullResultHtml=fullHtml(data);
   if(box)box.innerHTML=fullResultHtml;
  }finally{busy=false;if(button){button.disabled=false;button.textContent="完整擊殺模擬";}}
  return true;
 };
 window.gmCalamityTestHtml=function(){
  return `<div class="muted gm-hub-note">文明災厄 GM 模擬不受正式解鎖狀態限制。玩家使用目前 GM 測試 VIP／專精／強化／印記；災厄固定使用正式數值。所有結果皆為沙盒，不修改正式災厄 HP 或印記。</div><div class="controls" style="align-items:end"><label>文明災厄<br><select id="gmCalamityTarget" class="btn">${calamityOptions()}</select></label><button class="btn blue" onclick="gmCalamitySingle()">單次挑戰模擬</button><button id="gmCalamityFullBtn" class="btn gm-create" onclick="gmCalamityFullKill()">完整擊殺模擬</button></div><div id="gmCalamityResult" style="margin-top:12px">${fullResultHtml||singleResultHtml}</div>`;
 };

 window.runGmCalamitySingleSimulation=function(id,options={}){return simulateAttempt(id,options.startHp??null,options.rng);};
 window.runGmCalamityFullKillSimulation=simulateFullKill;
 window.GM_CALAMITY_TEST_VERSION=GM_CALAMITY_TEST_VERSION;
 window.GM_MARK_MANAGEMENT_VERSION=GM_MARK_MANAGEMENT_VERSION;
 window.GM_MARK_CONFIG_OWNER_VERSION=GM_MARK_CONFIG_OWNER_VERSION;
 window.GM_PLAYER_TITLE_PREVIEW_VERSION=GM_PLAYER_TITLE_PREVIEW_VERSION;
 window.GM_CALAMITY_FULL_KILL_SAFETY_LIMIT=FULL_KILL_SAFETY_LIMIT;
 window.gmCalamityTestResultSnapshot=function(){return gmCalamityLastResult?JSON.parse(JSON.stringify(gmCalamityLastResult)):null;};
 window.gmClearCalamityTestResult=function(){singleResultHtml="";fullResultHtml="";gmCalamityLastResult=null;return true;};
 window.GM_CALAMITY_TEST_EMBEDDED_VERSION=1;
 window.GM_CALAMITY_SUMMARY_EXPORT_VERSION=1;

 if(typeof window.registerGmHubSection==="function"){
  window.registerGmHubSection("manage","印記管理",window.gmMarkManagementHtml,{id:"marks-manage",position:"append"});
  window.registerGmHubSection("test","稱號預覽",window.gmPlayerTitlePreviewHtml,{id:"player-title-preview",position:"append"});
 }
})();