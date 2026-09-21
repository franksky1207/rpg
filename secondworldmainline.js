(function(){
 const VERSION=2;
 const BACKGROUND_GM_GATE_VERSION=1;
 let busy=false;
 let activeContext=null;

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
 function showContinuousResult(ctx){
  const {title,detail,modal}=battleModal();if(!title||!detail||!modal)return;
  title.textContent="宇宙紀元・連續戰鬥結算";
  const rows=ctx.items.slice(-20).map(item=>{
   const base=typeof itemHtml==="function"?itemHtml(item,true):item.name;
   return `<div class="item">${base}</div>`;
  }).join("");
  const omitted=Math.max(0,ctx.items.length-20);
  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${ctx.boss.name} Lv.${ctx.boss.level}</div><div class="notice"><b>完成 ${ctx.wins.toLocaleString()} 場</b></div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${ctx.totalXp.toLocaleString()}</b></div><div class="stat">暗物質<b>+${ctx.totalDarkMatter.toLocaleString()}</b></div><div class="stat">暗能量<b>+${ctx.totalDarkEnergy.toLocaleString()}</b></div><div class="stat">裝備<b>${ctx.items.length.toLocaleString()} 件</b></div></div>${rows?`<div style="margin-top:10px"><b>最近掉落</b>${rows}${omitted?`<div class="muted">另有 ${omitted.toLocaleString()} 件已收入背包。</div>`:""}</div>`:""}<div class="muted" style="margin-top:10px">${ctx.stopReason==="death"?"因戰敗結束。":ctx.stopReason==="manual"?"已依要求停止。":"連續戰鬥已結束。"}</div></div>`;
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

 function gmBackgroundEnabled(){
  return typeof window.gmBackgroundBattleEnabled==="function"&&window.gmBackgroundBattleEnabled()===true;
 }
 function environmentIsBackground(){
  return typeof window.backgroundProgressEnvironmentIsBackground==="function"&&window.backgroundProgressEnvironmentIsBackground()===true;
 }
 function startBackgroundFlow(ctx){
  if(!ctx?.continuous||!gmBackgroundEnabled()||typeof window.backgroundProgressStart!=="function")return false;
  window.backgroundProgressStart("main",{mode:"continuous"});
  return true;
 }
 function stopBackgroundFlow(started){
  if(started&&typeof window.backgroundProgressStop==="function")window.backgroundProgressStop("main");
 }
 async function waitForForegroundIfBackgroundDisabled(ctx){
  if(!ctx?.continuous||gmBackgroundEnabled()||!environmentIsBackground())return;
  if(typeof window.backgroundProgressOnEnvironmentChange!=="function")return;
  await new Promise(resolve=>{
   let done=false,unsubscribe=null;
   const finish=()=>{if(done)return;done=true;if(typeof unsubscribe==="function")unsubscribe();resolve();};
   unsubscribe=window.backgroundProgressOnEnvironmentChange(isBackground=>{
    if(!isBackground||gmBackgroundEnabled())finish();
   });
   if(!environmentIsBackground()||gmBackgroundEnabled())finish();
  });
 }
 function battleGapMs(){
  const base=typeof window.mainBattleGapMs==="function"?window.mainBattleGapMs():140;
  return typeof window.combatSpeedScaledDelay==="function"?window.combatSpeedScaledDelay(base):base;
 }
 async function flowSleep(ms){
  if(typeof window.mainBattleFlowSleep==="function")return window.mainBattleFlowSleep(ms);
  return new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
 }
 function createContext(index,boss,continuous){
  return {
   bossIndex:index,boss,continuous:continuous===true,stopRequested:false,stopReason:null,
   completed:0,wins:0,totalXp:0,totalDarkMatter:0,totalDarkEnergy:0,items:[],
   startedAt:Date.now(),backgroundStarted:false,lastCombat:null,lastPenalty:null
  };
 }
 function publishContext(ctx){activeContext=ctx;window.activeSecondWorldMainlineContext=ctx;}
 function clearContext(ctx){if(activeContext===ctx)activeContext=null;if(window.activeSecondWorldMainlineContext===ctx)window.activeSecondWorldMainlineContext=null;}
 function accumulate(ctx,settled){
  ctx.wins++;ctx.totalXp+=Math.max(0,Number(settled.xp)||0);ctx.totalDarkMatter+=Math.max(0,Number(settled.darkMatter)||0);ctx.totalDarkEnergy+=Math.max(0,Number(settled.darkEnergy)||0);
  if(settled.item)ctx.items.push(settled.item);
 }
 async function runFlow(index,continuous){
  if(busy||typeof battleBusy!=="undefined"&&battleBusy)return false;
  if(!(typeof window.canChallengeSecondWorldBoss==="function"&&window.canChallengeSecondWorldBoss(index)))return alert("此 Boss 尚未解鎖。");
  if(window.SECOND_WORLD_COMBAT_SETTLEMENT_READY!==true||typeof window.settleSecondWorldBossVictory!=="function")return alert("宇宙紀元結算系統尚未載入。");
  const boss=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(index):null;if(!boss)return false;

  const ctx=createContext(index,boss,continuous);publishContext(ctx);
  busy=true;if(typeof battleBusy!=="undefined")battleBusy=true;
  ctx.backgroundStarted=startBackgroundFlow(ctx);
  try{
   do{
    if(ctx.stopRequested){ctx.stopReason="manual";break;}
    await waitForForegroundIfBackgroundDisabled(ctx);
    if(ctx.stopRequested){ctx.stopReason="manual";break;}

    state.hp=playerCombatStats().hp;
    const combat=window.runSecondWorldBossCombat(index,{startHp:state.hp,logs:false,preparePresentation:false});
    ctx.lastCombat=combat;
    if(!combat?.ok){ctx.stopReason="error";alert(combat?.reason||"戰鬥啟動失敗。");break;}
    ctx.completed++;

    if(combat.win){
     state.hp=Math.max(0,Math.floor(Number(combat.hp)||0));
     const settled=window.settleSecondWorldBossVictory(index);
     if(!settled.ok){ctx.stopReason="error";alert(settled.reason||"戰鬥結算失敗。");break;}
     accumulate(ctx,settled);
     if(!continuous){if(typeof render==="function")render();setTimeout(()=>showVictory(settled,combat),0);return true;}
    }else{
     state.hp=0;
     const penalty=typeof window.applySecondWorldDeathPenalty==="function"?window.applySecondWorldDeathPenalty():{ok:false,reason:"死亡懲罰 owner 尚未載入。"};
     if(!penalty.ok){ctx.stopReason="error";alert(penalty.reason||"死亡懲罰結算失敗。");break;}
     ctx.lastPenalty=penalty;ctx.stopReason="death";
     if(!continuous){if(typeof render==="function")render();setTimeout(()=>showDefeat(penalty,boss,combat),0);return true;}
     break;
    }

    if(typeof render==="function"&&!environmentIsBackground())render();
    if(typeof window.backgroundProgressUiYield==="function"&&ctx.backgroundStarted)await window.backgroundProgressUiYield("main");
    if(ctx.stopRequested){ctx.stopReason="manual";break;}
    await flowSleep(battleGapMs());
   }while(continuous);

   if(continuous){
    if(!ctx.stopReason)ctx.stopReason=ctx.stopRequested?"manual":"complete";
    if(typeof render==="function")render();
    if(ctx.stopReason==="death"&&ctx.lastPenalty)setTimeout(()=>{showContinuousResult(ctx);showDefeat(ctx.lastPenalty,boss,ctx.lastCombat);},0);
    else setTimeout(()=>showContinuousResult(ctx),0);
   }
   return true;
  }finally{
   stopBackgroundFlow(ctx.backgroundStarted);
   busy=false;if(typeof battleBusy!=="undefined")battleBusy=false;
   clearContext(ctx);
  }
 }

 window.startSecondWorldBossBattle=function(value){return runFlow(Math.floor(Number(value)),false);};
 window.startSecondWorldBossContinuous=function(value){return runFlow(Math.floor(Number(value)),true);};
 window.requestSecondWorldContinuousStop=function(){
  const ctx=activeContext;
  if(!ctx?.continuous)return false;
  ctx.stopRequested=true;
  return true;
 };
 window.secondWorldMainlineBusy=function(){return busy;};
 window.secondWorldBackgroundBattleEnabled=function(){return gmBackgroundEnabled();};
 window.SECOND_WORLD_MAINLINE_VERSION=VERSION;
 window.SECOND_WORLD_BACKGROUND_GM_GATE_VERSION=BACKGROUND_GM_GATE_VERSION;
 window.SECOND_WORLD_MAINLINE_INTEGRITY={
  passed:typeof window.startSecondWorldBossBattle==="function"&&typeof window.startSecondWorldBossContinuous==="function"&&typeof window.requestSecondWorldContinuousStop==="function"&&window.SECOND_WORLD_COMBAT_SETTLEMENT_READY===true,
  version:VERSION,backgroundGmGateVersion:BACKGROUND_GM_GATE_VERSION
 };
})();
