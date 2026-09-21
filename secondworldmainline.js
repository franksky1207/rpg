(function(){
 const VERSION=1;
 let busy=false;

 function battleModal(){
  return {
   title:typeof document!=="undefined"?document.getElementById("battleResultTitle"):null,
   detail:typeof document!=="undefined"?document.getElementById("battleResultDetail"):null,
   modal:typeof document!=="undefined"?document.getElementById("battleResultModal"):null
  };
 }
 function rewardItemHtml(item){
  if(!item)return '<div class="muted">裝備：無</div>';
  const base=typeof itemHtml==="function"?itemHtml(item,true):item.name;
  const ability=typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):"";
  return `<div style="margin-top:10px"><b>主線裝備</b><div class="item">${base}${ability}</div></div>`;
 }
 function showVictory(result,combat){
  const {title,detail,modal}=battleModal();if(!title||!detail||!modal)return;
  title.textContent="宇宙紀元・戰鬥勝利";
  const levelUp=Number(result.levelAfter)>Number(result.levelBefore)?`<div class="notice" style="margin-top:10px"><b>升級至 Lv.${result.levelAfter}</b></div>`:"";
  const first=result.firstKill?'<div class="notice" style="margin-top:10px"><b>主線首次擊破，後續 Boss 解鎖條件已更新。</b></div>':"";
  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${result.boss.name} Lv.${result.boss.level}</div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${result.xp.toLocaleString()}</b></div><div class="stat">暗物質<b>+${result.darkMatter.toLocaleString()}</b></div><div class="stat">暗能量<b>+${result.darkEnergy}</b></div></div>${rewardItemHtml(result.item)}${levelUp}${first}<div class="muted" style="margin-top:10px">戰鬥回合：${Math.max(0,Number(combat?.turns)||0)}</div></div>`;
  modal.classList.add("show");
 }
 function showDefeat(penalty,boss,combat){
  const {title,detail,modal}=battleModal();if(!title||!detail||!modal)return;
  title.textContent="宇宙紀元・戰鬥失敗";
  const dropped=penalty?.dropped;
  const item=dropped?(typeof itemHtml==="function"?itemHtml(dropped,true):dropped.name):"";
  const pending=penalty?.redemptionPending?'<div class="notice" style="margin-top:10px"><b>銀河紀元裝備的宇宙贖回價格尚未定案；裝備已安全記錄於遺失裝備，不會被自動刪除。</b></div>':"";
  const world2Cost=dropped&&!penalty?.redemptionPending&&Number.isFinite(Number(penalty?.cost))?`<div class="muted" style="margin-top:6px">贖回成本：${Number(penalty.cost).toLocaleString()} 暗物質</div>`:"";
  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${boss?.name||"宇宙紀元 Boss"}</div><div class="item"><b>EXP 損失：${Number(penalty?.expLost)||0}</b></div>${dropped?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${item}</div>${world2Cost}</div>`:'<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>'}${penalty?.protectedByVip20?'<div class="vip-event">【VIP20】裝備受到保護，本次死亡沒有遺失裝備。</div>':""}${pending}<div class="muted" style="margin-top:10px">戰鬥回合：${Math.max(0,Number(combat?.turns)||0)}</div></div>`;
  modal.classList.add("show");
 }
 window.startSecondWorldBossBattle=async function(value){
  if(busy||typeof battleBusy!=="undefined"&&battleBusy)return false;
  const index=Math.floor(Number(value));
  if(!(typeof window.canChallengeSecondWorldBoss==="function"&&window.canChallengeSecondWorldBoss(index)))return alert("此 Boss 尚未解鎖。");
  if(window.SECOND_WORLD_COMBAT_SETTLEMENT_READY!==true||typeof window.settleSecondWorldBossVictory!=="function")return alert("宇宙紀元結算系統尚未載入。");
  const boss=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(index):null;if(!boss)return false;
  busy=true;if(typeof battleBusy!=="undefined")battleBusy=true;
  try{
   state.hp=playerCombatStats().hp;
   const combat=window.runSecondWorldBossCombat(index,{startHp:state.hp,logs:false,preparePresentation:false});
   if(!combat?.ok)return alert(combat?.reason||"戰鬥啟動失敗。");
   if(combat.win){
    state.hp=Math.max(0,Math.floor(Number(combat.hp)||0));
    const settled=window.settleSecondWorldBossVictory(index);
    if(!settled.ok)return alert(settled.reason||"戰鬥結算失敗。");
    if(typeof render==="function")render();
    setTimeout(()=>showVictory(settled,combat),0);
   }else{
    state.hp=0;
    const penalty=typeof window.applySecondWorldDeathPenalty==="function"?window.applySecondWorldDeathPenalty():{ok:false,reason:"死亡懲罰 owner 尚未載入。"};
    if(!penalty.ok)return alert(penalty.reason||"死亡懲罰結算失敗。");
    if(typeof render==="function")render();
    setTimeout(()=>showDefeat(penalty,boss,combat),0);
   }
   return true;
  }finally{
   busy=false;if(typeof battleBusy!=="undefined")battleBusy=false;
  }
 };
 window.SECOND_WORLD_MAINLINE_VERSION=VERSION;
 window.SECOND_WORLD_MAINLINE_INTEGRITY={passed:typeof window.startSecondWorldBossBattle==="function"&&window.SECOND_WORLD_COMBAT_SETTLEMENT_READY===true,version:VERSION};
})();
