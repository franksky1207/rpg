(function(){
 function maxLevel(){return Math.max(0,Math.floor(Number(window.CIVILIZATION_LEVEL_MAX)||10));}
 function clamp(value){return typeof window.clampCivilizationLevel==="function"?window.clampCivilizationLevel(value):Math.max(0,Math.min(maxLevel(),Math.floor(Number(value)||0)));}
 function cloneState(){try{return JSON.parse(JSON.stringify(state));}catch(e){return null;}}
 function restoreStateSnapshot(snapshot){if(!snapshot||typeof snapshot!=="object")return false;state=snapshot;return true;}
 function saveOrRollback(snapshot){
  const ok=typeof save==="function"&&save(false)===true;
  if(ok)return true;
  restoreStateSnapshot(snapshot);
  return false;
 }
 window.gmTestCivilizationLevel=0;

 function testLevel(){return clamp(window.gmTestCivilizationLevel);}
 function entered(){return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered(state);}
 function testOptions(){return Array.from({length:maxLevel()+1},(_,i)=>`<option value="${i}" ${i===testLevel()?"selected":""}>Lv.${i}</option>`).join("");}
 function formalOptions(){
  const current=typeof window.civilizationLevel==="function"?window.civilizationLevel(state):clamp(state?.secondWorld?.civilizationLevel);
  return Array.from({length:maxLevel()+1},(_,i)=>`<option value="${i}" ${i===current?"selected":""}>Lv.${i}</option>`).join("");
 }
 function label(level=testLevel()){
  const lv=clamp(level);
  const bonus=typeof window.civilizationDamageBonusPercentForLevel==="function"?window.civilizationDamageBonusPercentForLevel(lv):lv*5;
  const multi=typeof window.civilizationDamageMultiplierForLevel==="function"?window.civilizationDamageMultiplierForLevel(lv):1+bonus/100;
  return `文明 Lv.${lv}｜最終傷害 +${bonus}%｜×${Number(multi).toFixed(2)}`;
 }

 window.gmTestCivilizationLevelValue=testLevel;
 window.gmCivilizationTestOptionsHtml=testOptions;
 window.gmTestCivilizationLabel=function(){return label(testLevel());};
 window.gmSetTestCivilizationLevel=function(value,refresh=true){
  window.gmTestCivilizationLevel=clamp(value);
  if(refresh&&typeof window.gmPowerBenchmarkInvalidateSnapshot==="function")window.gmPowerBenchmarkInvalidateSnapshot();
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return testLevel();
 };
 window.refreshGmCivilizationTestControls=function(){
  const select=document.getElementById("gmTestCivilizationLevel");
  if(select)select.value=String(testLevel());
  const info=document.getElementById("gmCivilizationTestInfo");
  if(info)info.textContent=window.gmTestCivilizationLabel();
  return true;
 };
 window.gmUseCurrentCivilizationTestStatus=function(refresh=true){
  const current=entered()&&typeof window.civilizationLevel==="function"?window.civilizationLevel(state):0;
  window.gmTestCivilizationLevel=clamp(current);
  if(refresh&&typeof window.gmRefreshTestControls==="function")window.gmRefreshTestControls();
  return testLevel();
 };

 window.gmCivilizationManagementHtml=function(){
  if(!entered())return '<div class="muted gm-hub-note">文明等級只屬於宇宙紀元；目前正式角色仍在銀河紀元，沒有可修改的文明等級。</div>';
  const current=typeof window.civilizationLevel==="function"?window.civilizationLevel(state):0;
  return `<div class="muted gm-hub-note">直接修改正式角色文明等級，範圍 Lv.0～Lv.${maxLevel()}；每級提高宇宙戰鬥最終傷害 5%。</div><div class="controls" style="align-items:end"><label>文明等級<br><select id="gmCivilizationManageLevel" class="btn">${formalOptions()}</select></label><span class="muted">${label(current)}</span><button class="btn blue" onclick="gmApplyCivilizationLevel()">套用文明等級</button></div>`;
 };
 window.gmApplyCivilizationLevel=function(){
  if(!entered())return alert("目前尚未進入宇宙紀元。");
  const el=document.getElementById("gmCivilizationManageLevel");
  const lv=clamp(el?el.value:state?.secondWorld?.civilizationLevel);
  if(!state.secondWorld||typeof state.secondWorld!=="object")return alert("宇宙紀元 state 尚未載入。");
  const snapshot=cloneState();if(!snapshot)return alert("無法建立文明等級修改前存檔快照。");
  state.secondWorld.civilizationLevel=lv;
  if(typeof normalizeSecondWorldState==="function")normalizeSecondWorldState(state);
  if(!saveOrRollback(snapshot)){if(typeof render==="function")render();return alert("存檔失敗，已回復文明等級修改前狀態。");}
  if(typeof render==="function")render();
  alert(`文明等級已更新為 Lv.${lv}。`);
  return lv;
 };
 window.gmCivilizationTestHtml=function(){
  return `<div class="muted gm-hub-note">設定宇宙紀元戰鬥使用的文明等級測試值；沙盒固定 Lv.0～Lv.${maxLevel()}，不修改正式角色資料。銀河紀元測試永遠不套文明傷害倍率。</div><div class="controls" style="align-items:end"><label>測試文明等級<br><select id="gmTestCivilizationLevel" class="btn" onchange="gmSetTestCivilizationLevel(this.value)">${testOptions()}</select></label><span id="gmCivilizationTestInfo" class="muted">${window.gmTestCivilizationLabel()}</span></div>`;
 };

 window.GM_CIVILIZATION_VERSION=1;
 window.GM_CIVILIZATION_FORMAL_RANGE_VERSION=1;
 window.GM_CIVILIZATION_TEST_RANGE_VERSION=1;
 window.GM_CIVILIZATION_ATOMIC_MUTATION_VERSION=1;
 window.GM_CIVILIZATION_TEST_BATCH_SYNC_VERSION=1;
})();