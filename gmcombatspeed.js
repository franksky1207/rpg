(function(){
 const VERSION=1;

 function speedLabel(value){
  const n=Number(value);
  return n===1.5?"1.5×":n===2?"2×":"1×";
 }
 function managementHtml(){
  const formal=typeof window.playerCombatSpeed==="function"?window.playerCombatSpeed():1;
  const override=typeof window.gmCombatSpeedOverride==="function"?window.gmCombatSpeedOverride():null;
  const effective=typeof window.effectiveCombatSpeed==="function"?window.effectiveCombatSpeed():formal;
  const buttons=[1,1.5,2].map(speed=>{
   const selected=Number(override)===speed;
   return `<button class="btn ${selected?"blue":""}" type="button" onclick="gmSetCombatSpeedOverride(${speed})" ${selected?"disabled":""}>${speedLabel(speed)}</button>`;
  }).join("");
  return `<div class="muted gm-hub-note">一般玩家 Lv.1～500 的正式速度目前固定為 1×。此處只設定目前登入帳號的 GM 覆寫；設定會保留到正式登出，不寫入角色存檔或雲端存檔。</div><div class="controls">${buttons}</div><div class="item" style="margin-top:10px"><div><b>目前有效速度：${speedLabel(effective)}</b></div><div class="muted" style="margin-top:5px">玩家正式速度：${speedLabel(formal)}　｜　GM 覆寫：${override==null?"未設定":speedLabel(override)}</div><div class="muted" style="margin-top:5px">本批先建立倍速設定核心；正式戰鬥節奏會在下一批接入。場與場之間固定 140ms，不屬於倍速範圍。</div></div>`;
 }
 window.gmSetCombatSpeedOverride=function(value){
  if(typeof window.setGmCombatSpeedOverride!=="function"||!window.setGmCombatSpeedOverride(value)){
   alert("戰鬥速度設定無法寫入目前帳號。");
   return false;
  }
  if(typeof render==="function")render();
  return true;
 };
 window.gmCombatSpeedManagementHtml=managementHtml;
 window.GM_COMBAT_SPEED_VERSION=VERSION;
 if(typeof window.registerGmHubSection==="function")window.registerGmHubSection("manage","戰鬥速度",managementHtml,{id:"gm-combat-speed"});
})();