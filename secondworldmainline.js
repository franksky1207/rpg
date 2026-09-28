(function(){
 const VERSION=10;
 const BACKGROUND_GM_GATE_VERSION=1;
 const REVIEW_FLOW_VERSION=1;
 const REVIEW_STATE_ISOLATION_VERSION=1;
 const REVIEW_RESULT_LOCK_VERSION=1;
 let busy=false;
 let activeContext=null;

 function battleModal(){
  return {
   title:typeof document!=="undefined"?document.getElementById("battleResultTitle"):null,
   detail:typeof document!=="undefined"?document.getElementById("battleResultDetail"):null,
   modal:typeof document!=="undefined"?document.getElementById("battleResultModal"):null
  };
 }
 function rewardItemHtml(item,label="主線裝備"){
  if(!item)return '<div class="muted">裝備：無</div>';
  const base=typeof itemHtml==="function"?itemHtml(item,true):item.name;
  const ability=typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):"";
  return `<div style="margin-top:10px"><b>${label}</b><div class="item">${base}${ability}</div></div>`;
 }
 function rewardRows(result){
  const rows=typeof window.secondWorldEquipmentRewardRows==="function"?window.secondWorldEquipmentRewardRows(result):[];
  return rows.map(row=>{
   const label=row.vip16Extra?"VIP16 額外主線裝備":"主線裝備";
   if(row.kept)return rewardItemHtml(row.item,label);
   if(row.sale&&typeof window.equipmentSaleText==="function")return `<div class="notice" style="margin-top:10px"><b>${label}已依自動出售設定處理</b><div class="muted" style="margin-top:5px">獲得 ${window.equipmentSaleText(row.sale)}</div></div>`;
   return rewardItemHtml(row.item,label);
  }).join("");
 }
 function showVictory(result,combat){
  const {title,detail,modal}=battleModal();if(!title||!detail||!modal)return;
  title.textContent="宇宙紀元・戰鬥勝利";
  const levelUp=Number(result.levelAfter)>Number(result.levelBefore)?`<div class="notice" style="margin-top:10px"><b>升級至 Lv.${result.levelAfter}</b></div>`:"";
  const first=result.firstKill?'<div class="notice" style="margin-top:10px"><b>主線首次擊破，後續 Boss 解鎖條件已更新。</b></div>':"";
  const gearHtml=rewardRows(result);
  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${result.boss.name} Lv.${result.boss.level}</div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${result.xp.toLocaleString()}</b></div><div class="stat">暗物質<b>+${result.darkMatter.toLocaleString()}</b></div><div class="stat">暗能量<b>+${result.darkEnergy}</b></div></div>${gearHtml}${levelUp}${first}<div class="muted" style="margin-top:10px">戰鬥回合：${Math.max(0,Number(combat?.turns)||0)}</div></div>`;
  modal.classList.add("show");
 }
 function showContinuousResult(ctx){
  const {title,detail,modal}=battleModal();if(!title||!detail||!modal)return;
  title.textContent="宇宙紀元・連續戰鬥結算";
  const rows=ctx.items.slice(-20).map(item=>{
   const base=typeof itemHtml==="function"?itemHtml(item,true):item.name;
   return `<div class="item">${base}</div>`;
  }).join("");
  const omitted=Math.max(0,ctx.items.length-20),penalty=ctx.lastPenalty||null,dropped=penalty?.dropped;
  const droppedHtml=dropped?`<div style="margin-top:10px"><b>戰敗遺失裝備</b><div class="item">${typeof itemHtml==="function"?itemHtml(dropped,true):dropped.name}</div>${Number(dropped.world)===2&&Number.isFinite(Number(penalty.cost))?`<div class="muted">贖回成本：${Number(penalty.cost).toLocaleString()} 暗物質</div>`:'<div class="muted">此銀河紀元裝備可免費贖回。</div>'}</div>`:"";
  const deathHtml=penalty?`<div class="notice" style="margin-top:10px"><b>戰敗結束</b>${penalty.protectedByVip20?'<div class="muted">VIP20 已保護裝備</div>':""}</div>${droppedHtml}`:"";
  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${ctx.boss.name} Lv.${ctx.boss.level}</div><div class="notice"><b>完成 ${ctx.wins.toLocaleString()} 場</b></div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${ctx.totalXp.toLocaleString()}</b></div><div class="stat">暗物質<b>+${ctx.totalDarkMatter.toLocaleString()}</b></div><div class="stat">暗能量<b>+${ctx.totalDarkEnergy.toLocaleString()}</b></div><div class="stat">保留裝備<b>${ctx.items.length.toLocaleString()} 件</b></div>${ctx.autoSoldCount?`<div class="stat">自動出售<b>${ctx.autoSoldCount.toLocaleString()} 件</b></div>`:""}</div>${rows?`<div style="margin-top:10px"><b>最近掉落</b>${rows}${omitted?`<div class="muted">另有 ${omitted.toLocaleString()} 件已收入背包。</div>`:""}</div>`:""}${deathHtml}<div class="muted" style="margin-top:10px">${ctx.stopReason==="death"?"因戰敗結束。":ctx.stopReason==="manual"?"已依要求停止。":ctx.stopReason==="calamity-appeared"?"區域最終 Boss 首次擊破，新的文明災厄已現身。":"連續戰鬥已結束。"}</div></div>`;
  modal.classList.add("show");
 }
 function showDefeat(penalty,boss,combat){
  const {title,detail,modal}=battleModal();if(!title||!detail||!modal)return;
  title.textContent="宇宙紀元・戰鬥失敗";
  const dropped=penalty?.dropped;
  const item=dropped?(typeof itemHtml==="function"?itemHtml(dropped,true):dropped.name):"";
  const world2Cost=dropped&&Number(dropped.world)===2&&Number.isFinite(Number(penalty?.cost))?`<div class="muted" style="margin-top:6px">贖回成本：${Number(penalty.cost).toLocaleString()} 暗物質</div>`:dropped?'<div class="muted" style="margin-top:6px">此銀河紀元裝備可免費贖回。</div>':"";
  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${boss?.name||"宇宙紀元 Boss"}</div>${dropped?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${item}</div>${world2Cost}</div>`:'<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>'}${penalty?.protectedByVip20?'<div class="vip-event">【VIP20】裝備受到保護，本次死亡沒有遺失裝備。</div>':""}<div class="muted" style="margin-top:10px">戰鬥回合：${Math.max(0,Number(combat?.turns)||0)}</div></div>`;
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
 function catchUpActive(){
  return typeof window.backgroundProgressHasCatchUpCredit==="function"&&window.backgroundProgressHasCatchUpCredit("main")===true;
 }
 function catchUpPreviewPolicy(){
  if(!catchUpActive()||typeof window.backgroundProgressCatchUpPolicy!=="function")return null;
  const snapshot=typeof window.backgroundProgressSnapshot==="function"?window.backgroundProgressSnapshot():null;
  const next=Math.max(0,Math.floor(Number(snapshot?.catchUpPolicyCount)||0))+1;
  return window.backgroundProgressCatchUpPolicy("main",next,false);
 }
 function catchUpStep(){
  return typeof window.backgroundProgressCatchUpStep==="function"?window.backgroundProgressCatchUpStep("main"):null;
 }
 function catchUpFinal(){
  return typeof window.backgroundProgressCatchUpFinalPolicy==="function"?window.backgroundProgressCatchUpFinalPolicy("main"):null;
 }
 function structuredDuration(result){
  return typeof window.structuredCombatPresentationDurationMs==="function"?Math.max(0,Number(window.structuredCombatPresentationDurationMs(result))||0):0;
 }
 async function consumeCatchUpDelay(ms){
  const delay=Math.max(0,Number(ms)||0);
  if(delay<=0)return true;
  if(catchUpActive()&&typeof window.backgroundProgressConsumeCatchUpCredit==="function"){
   const consumed=window.backgroundProgressConsumeCatchUpCredit(delay,"main");
   if(Number(consumed?.remaining)>0)await flowSleep(consumed.remaining);
   return Number(consumed?.remaining)<=0;
  }
  await flowSleep(delay);
  return false;
 }
 function refreshCatchUpUi(){
  if(typeof render==="function")render();
  if(typeof window.syncMinimalMode==="function"&&window.getMinimalModeAdapterId?.()==="main")window.syncMinimalMode();
 }
 function presentationEnabled(ctx){
  if(!ctx)return false;
  if(environmentIsBackground())return false;
  if(catchUpActive())return false;
  return typeof window.animateStructuredCombatPresentation==="function";
 }
 async function presentCombat(combat){
  if(!combat||typeof window.animateStructuredCombatPresentation!=="function")return;
  const sleep=typeof window.mainBattlePresentationSleep==="function"?window.mainBattlePresentationSleep:undefined;
  await window.animateStructuredCombatPresentation(combat,{mode:"main",sleep,clearAfter:true,clearReason:"second-world-main-battle-end"});
 }
 function createContext(index,boss,continuous,review=false){
  return {
   bossIndex:index,boss,continuous:continuous===true,review:review===true,stopRequested:false,stopReason:null,
   completed:0,wins:0,totalXp:0,totalDarkMatter:0,totalDarkEnergy:0,items:[],autoSoldCount:0,
   startedAt:Date.now(),backgroundStarted:false,lastCombat:null,lastPenalty:null,currentEncounter:null,presenting:false,catchUpNeedsFinalSync:false,reviewPlayerStartHp:0,reviewPlayerMaxHp:0
  };
 }
 function showReviewResult(boss,combat){
  const {title,detail,modal}=battleModal();if(!title||!detail||!modal){if(typeof window.setAdventureReviewBattleActive==="function")window.setAdventureReviewBattleActive(false);return false;}
  title.textContent="宇宙紀元・回顧";
  detail.innerHTML=`<div class="settlement-section"><div class="settlement-section-title">${boss?.name||"宇宙紀元 Boss"} Lv.${boss?.level||"—"}</div><div class="notice"><b>${combat?.win===true?"回顧勝利":"回顧挑戰結束"}</b><div class="muted" style="margin-top:6px">本場為單場純回顧挑戰，不產生 EXP、暗物質、暗能量、裝備、主線進度、文明災厄、特殊遭遇、離線樣本或死亡懲罰；正式角色 HP 與所有正式 state 皆不變。</div></div><div class="muted" style="margin-top:10px">戰鬥回合：${Math.max(0,Number(combat?.turns)||0)}</div></div>`;
  modal.classList.add("show");return true;
 }
 function publishContext(ctx){activeContext=ctx;window.activeSecondWorldMainlineContext=ctx;}
 function clearContext(ctx){if(activeContext===ctx)activeContext=null;if(window.activeSecondWorldMainlineContext===ctx)window.activeSecondWorldMainlineContext=null;}
 function accumulate(ctx,settled){
  ctx.wins++;ctx.totalXp+=Math.max(0,Number(settled.xp)||0);
  ctx.totalDarkMatter+=Math.max(0,Number(settled.darkMatter)||0);
  ctx.totalDarkEnergy+=Math.max(0,Number(settled.darkEnergy)||0);
  const rows=typeof window.secondWorldEquipmentRewardRows==="function"?window.secondWorldEquipmentRewardRows(settled):[];
  rows.forEach(row=>{
   ctx.totalDarkMatter+=Math.max(0,Number(row.sale?.quote?.darkMatter)||0);
   ctx.totalDarkEnergy+=Math.max(0,Number(row.sale?.quote?.darkEnergy)||0);
   if(row.kept&&row.item)ctx.items.push(row.item);
   else if(row.sale)ctx.autoSoldCount++;
  });
 }
 async function runReviewFlow(index){
  if(busy||typeof battleBusy!=="undefined"&&battleBusy)return false;
  const targetState=typeof state!=="undefined"&&state&&typeof state==="object"?state:null;
  if(!(typeof window.canRunSecondWorldBossReview==="function"&&window.canRunSecondWorldBossReview(index,targetState)))return alert("此宇宙紀元 Boss 尚未完成，無法回顧。");
  const boss=typeof window.secondWorldBoss==="function"?window.secondWorldBoss(index):null;if(!boss)return false;
  const player=typeof window.playerCombatStats==="function"?window.playerCombatStats():null;if(!player)return false;
  const encounter=typeof window.secondWorldBossEncounter==="function"?window.secondWorldBossEncounter(index):null;if(!encounter)return false;
  const ctx=createContext(index,boss,false,true);ctx.currentEncounter=encounter;ctx.reviewPlayerMaxHp=Math.max(1,Number(player.hp)||1);ctx.reviewPlayerStartHp=ctx.reviewPlayerMaxHp;publishContext(ctx);
  const before=JSON.stringify(targetState);busy=true;if(typeof battleBusy!=="undefined")battleBusy=true;if(typeof window.setAdventureReviewBattleActive==="function")window.setAdventureReviewBattleActive(true,"universe");
  let combat=null,reviewResultQueued=false;
  try{
   if(typeof render==="function")render();
   combat=window.runSecondWorldBossCombat(index,{review:true,state:targetState,player,startHp:ctx.reviewPlayerStartHp,encounter,logs:true,preparePresentation:true});ctx.lastCombat=combat;
   if(!combat?.ok||combat.review!==true||combat.settlementReady!==false)throw new Error(combat?.reason||"宇宙回顧戰建立失敗。");
   ctx.presenting=true;try{await presentCombat(combat);}finally{ctx.presenting=false;}
   if(JSON.stringify(targetState)!==before)throw new Error("宇宙回顧戰不應修改正式 state。");
   reviewResultQueued=true;setTimeout(()=>showReviewResult(boss,combat),0);
   return true;
  }catch(error){console.error("[文明戰線] 宇宙紀元回顧失敗",error);alert("宇宙紀元回顧發生錯誤，正式進度未受影響。");return false;}
  finally{
   ctx.currentEncounter=null;ctx.presenting=false;
   if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("second-world-review-finalize");
   if(!reviewResultQueued&&typeof window.setAdventureReviewBattleActive==="function")window.setAdventureReviewBattleActive(false);
   busy=false;if(typeof battleBusy!=="undefined")battleBusy=false;clearContext(ctx);
   if(typeof render==="function")render();
  }
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
    const fastCatchUp=catchUpActive();
    const previewPolicy=fastCatchUp?catchUpPreviewPolicy():null;
    const showPresentation=presentationEnabled(ctx)||previewPolicy?.shouldPresentBattle===true;
    const sampleToken=typeof window.beginSecondWorldOfflineBattleSample==="function"?window.beginSecondWorldOfflineBattleSample(index,boss):null;
    const encounter=typeof window.secondWorldBossEncounter==="function"?window.secondWorldBossEncounter(index):null;
    if(!encounter){ctx.stopReason="error";alert("無法建立宇宙紀元 Boss。");break;}
    ctx.currentEncounter=encounter;
    if(showPresentation&&typeof render==="function")render();

    const combat=window.runSecondWorldBossCombat(index,{startHp:state.hp,encounter,logs:showPresentation,preparePresentation:showPresentation});
    ctx.lastCombat=combat;
    if(!combat?.ok){ctx.currentEncounter=null;ctx.stopReason="error";alert(combat?.reason||"戰鬥啟動失敗。");break;}
    const catchUpPolicy=fastCatchUp?catchUpStep():null;
    if(fastCatchUp)ctx.catchUpNeedsFinalSync=true;
    if(showPresentation){
     ctx.presenting=true;
     try{await presentCombat(combat);}
     finally{ctx.presenting=false;}
    }else if(fastCatchUp)await consumeCatchUpDelay(structuredDuration(combat));
    ctx.completed++;
    if(typeof window.finishSecondWorldOfflineBattleSample==="function")window.finishSecondWorldOfflineBattleSample(sampleToken,combat,battleGapMs());

    if(combat.win){
     state.hp=Math.max(0,Math.floor(Number(combat.hp)||0));
     const settled=window.settleSecondWorldBossVictory(index);
     if(!settled.ok){ctx.stopReason="error";alert(settled.reason||"戰鬥結算失敗。");break;}
     accumulate(ctx,settled);
     const appeared=settled.firstKill===true&&typeof window.getSecondWorldCalamityForBoss==="function"?window.getSecondWorldCalamityForBoss(index):null;
     if(appeared&&typeof window.queueSecondWorldCalamityAppearanceNotice==="function")window.queueSecondWorldCalamityAppearanceNotice(appeared);
     let specialOutcome=false;
     if(!appeared&&typeof window.maybeHandleSpecialEncounter==="function"){
      specialOutcome=await window.maybeHandleSpecialEncounter(ctx,{...combat,win:true,e:encounter},{world:2,bossIndex:index});
      if(specialOutcome?.triggered&&!specialOutcome.win){
       ctx.stopReason="special-defeat";
       if(!continuous)return true;
       break;
      }
     }
     if(!continuous){
      if(!specialOutcome?.triggered)setTimeout(()=>showVictory(settled,combat),0);
      else if(typeof render==="function")render();
      return true;
     }
     if(appeared){ctx.stopReason="calamity-appeared";break;}
    }else{
     state.hp=0;
     const penalty=typeof window.applySecondWorldDeathPenalty==="function"?window.applySecondWorldDeathPenalty():{ok:false,reason:"死亡懲罰 owner 尚未載入。"};
     if(!penalty.ok){ctx.stopReason="error";alert(penalty.reason||"死亡懲罰結算失敗。");break;}
     ctx.lastPenalty=penalty;ctx.stopReason="death";
     if(!continuous){setTimeout(()=>showDefeat(penalty,boss,combat),0);return true;}
     break;
    }

    // Fast catch-up keeps formal combat/settlement per battle, but samples presentation/UI through the shared owner.
    if(fastCatchUp){
     if(catchUpPolicy?.shouldRefreshUi&&!showPresentation)refreshCatchUpUi();
     if((catchUpPolicy?.shouldRefreshUi||showPresentation)&&typeof window.backgroundProgressUiYield==="function"&&ctx.backgroundStarted)await window.backgroundProgressUiYield("main");
    }
    if(ctx.stopRequested){ctx.stopReason="manual";break;}
    await consumeCatchUpDelay(battleGapMs());
    if(ctx.catchUpNeedsFinalSync&&!catchUpActive()){
     const finalPolicy=catchUpFinal();
     if(finalPolicy?.shouldRefreshUi)refreshCatchUpUi();
     ctx.catchUpNeedsFinalSync=false;
    }
   }while(continuous);

   if(continuous){
    if(!ctx.stopReason)ctx.stopReason=ctx.stopRequested?"manual":"complete";
    setTimeout(()=>showContinuousResult(ctx),0);
   }else if(ctx.stopReason==="error"&&typeof render==="function"){
    ctx.currentEncounter=null;
    render();
   }
   return true;
  }finally{
   ctx.currentEncounter=null;ctx.presenting=false;
   if(typeof window.clearCombatPresentation==="function")window.clearCombatPresentation("second-world-mainline-finalize");
   stopBackgroundFlow(ctx.backgroundStarted);
   busy=false;if(typeof battleBusy!=="undefined")battleBusy=false;
   clearContext(ctx);
  }
 }

 window.startSecondWorldBossBattle=function(value){return runFlow(Math.floor(Number(value)),false);};
 window.startSecondWorldBossContinuous=function(value){return runFlow(Math.floor(Number(value)),true);};
 window.startSecondWorldBossReview=function(value){return runReviewFlow(Math.floor(Number(value)));};
 window.requestSecondWorldContinuousStop=function(){
  const ctx=activeContext;
  if(!ctx?.continuous)return false;
  ctx.stopRequested=true;
  return true;
 };
 window.secondWorldMainlineBusy=function(){return busy;};
 window.secondWorldMainlinePresentationActive=function(){return activeContext?.presenting===true;};
 window.secondWorldBackgroundBattleEnabled=function(){return gmBackgroundEnabled();};
 window.SECOND_WORLD_MAINLINE_VERSION=VERSION;
 window.SECOND_WORLD_MAINLINE_REVIEW_FLOW_VERSION=REVIEW_FLOW_VERSION;
 window.SECOND_WORLD_MAINLINE_REVIEW_STATE_ISOLATION_VERSION=REVIEW_STATE_ISOLATION_VERSION;
 window.SECOND_WORLD_MAINLINE_REVIEW_RESULT_LOCK_VERSION=REVIEW_RESULT_LOCK_VERSION;
 window.SECOND_WORLD_BACKGROUND_GM_GATE_VERSION=BACKGROUND_GM_GATE_VERSION;
 window.SECOND_WORLD_FAST_CATCH_UP_POLICY_VERSION=1;
 window.SECOND_WORLD_FAST_CATCH_UP_ATOMIC_SAVE_POLICY_VERSION=1;
 window.SECOND_WORLD_CALAMITY_APPEARANCE_TRIGGER_VERSION=1;
 window.SECOND_WORLD_SPECIAL_ENCOUNTER_HOOK_VERSION=1;
 window.SECOND_WORLD_MAINLINE_INTEGRITY={
  passed:typeof window.startSecondWorldBossBattle==="function"&&typeof window.startSecondWorldBossContinuous==="function"&&typeof window.startSecondWorldBossReview==="function"&&typeof window.requestSecondWorldContinuousStop==="function"&&typeof window.secondWorldMainlinePresentationActive==="function"&&window.SECOND_WORLD_COMBAT_SETTLEMENT_READY===true&&Number(window.SECOND_WORLD_COMBAT_REVIEW_POLICY_VERSION)===1&&Number(window.BACKGROUND_PROGRESS_FAST_CATCH_UP_POLICY_VERSION)===1&&Number(window.SECOND_WORLD_ATOMIC_SETTLEMENT_VERSION)===1,
  version:VERSION,backgroundGmGateVersion:BACKGROUND_GM_GATE_VERSION,reviewFlowVersion:REVIEW_FLOW_VERSION,reviewStateIsolationVersion:REVIEW_STATE_ISOLATION_VERSION,reviewResultLockVersion:REVIEW_RESULT_LOCK_VERSION
 };
})();
