(function(){
 function ensureSpecialEncounterAlert(){
  if(document.getElementById("specialEncounterAlert"))return;
  const el=document.createElement("div");
  el.id="specialEncounterAlert";
  el.innerHTML=`<div class="special-alert-card"><div class="special-alert-title">⚠ 特殊遭遇！</div><div class="special-alert-sub" id="specialEncounterAlertSub">偵測到異常敵影</div><div class="special-alert-name" id="specialEncounterAlertName"></div></div>`;
  document.body.appendChild(el);
 }

 async function showSpecialEncounterAlert(special,blackMarketForced=false){
  ensureSpecialEncounterAlert();
  const el=document.getElementById("specialEncounterAlert"),name=document.getElementById("specialEncounterAlertName"),sub=document.getElementById("specialEncounterAlertSub");
  if(sub)sub.textContent=blackMarketForced?"黑市情報生效・鎖定特殊目標":"偵測到異常敵影";
  if(name)name.textContent=`「${special?.name||"未知特殊怪"}」出現！`;
  if(!el)return;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  await sleep(850);
  el.classList.remove("show");
  await sleep(140);
 }

 function specialBattlePage(enemy,special){
  const s=playerCombatStats(),hpPct=s.hp?state.hp/s.hp*100:0;
  const continuous=window.activeMainBattleContext?.continuous===true,requested=window.activeMainBattleContext?.exitRequested===true;
  const stop=continuous?`<div class="continuous-stop-wrap"><button id="continuousBattleStopBtn" class="btn danger" onclick="requestContinuousBattleStop()" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連續戰鬥"}</button></div>`:"";
  return `<section class="combat-screen"><div class="combat-head">⚠ 特殊遭遇</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${state.playerName||"玩家"} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard" style="border-color:#c99b45;box-shadow:0 0 22px rgba(201,155,69,.22)"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">✦ ${special.name} Lv.${enemy.level}</h2><div class="muted" style="margin:8px 0 5px">${special.description}</div><div class="muted" style="margin-bottom:12px">暴擊 ${enemy.crit||0}%　閃避 ${enemy.dodge||0}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${enemy.hp} / ${enemy.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">特殊戰鬥開始</div>${stop}</section>`;
 }

 function specialFight(enemy){return specialFightCore(enemy);}

 async function animateSpecialFight(r,startPlayerHp,playerMax,enemyMax){
  if(typeof window.animateStructuredCombatPresentation!=="function")throw new Error("Structured Combat Presentation 未載入。");
  await window.animateStructuredCombatPresentation(r,{mode:"special",clearAfter:true,clearReason:"special-battle-end"});
 }

 window.SPECIAL_COMBAT_MARK_PRESENTATION_VERSION=1;

 function fallbackPriorRewardsHtml(ctx){
  if(!ctx?.completed)return "";
  const dungeon=typeof dungeonBattleResultHtml==="function"?dungeonBattleResultHtml(ctx):"";
  const progressText=ctx?.continuous===true?`已完成 ${ctx.completed} 場，連續戰鬥已結束；已取得的獎勵均保留。`:`已完成 ${ctx.completed} / ${ctx.originalCount} 場，剩餘連戰已取消；已取得的獎勵均保留。`;
  return `<div class="notice" style="margin-bottom:10px"><b>主線戰鬥</b><div class="muted" style="margin-top:5px">${progressText}</div></div><div class="stats" style="margin-bottom:10px"><div class="stat">主線 EXP<b>+${ctx.totalXp||0}</b></div><div class="stat">主線金幣<b>+${ctx.totalGold||0}</b></div></div>${ctx.items?.length?dropListHtml(ctx.items):""}${dungeon}`;
 }

 function showSpecialResult(ctx,special,result){
  const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
  if(!title||!detail||!modal)return;
  title.textContent=result.win?"特殊遭遇完成":"特殊遭遇失敗";
  if(typeof mainBattleSettlementHtml==="function"&&typeof specialEncounterSettlementHtml==="function"){
   detail.innerHTML=mainBattleSettlementHtml(ctx,{interrupted:!result.win})+specialEncounterSettlementHtml(ctx);
  }else{
   let body=fallbackPriorRewardsHtml(ctx);
   if(result.win){
    const rewardLabel=result.rewardContext?.randomReward?.label;
    body+=`<div class="notice"><b>✦ ${special.name} 擊破</b>${rewardLabel?`<div class="muted" style="margin-top:5px">特殊獎勵：${rewardLabel}</div>`:""}${result.blackMarketIntelGranted?`<div class="muted" style="margin-top:5px">取得黑市情報：下一次符合條件的主線勝利後，必定觸發另一個特殊遭遇。</div>`:""}</div><div class="stats" style="margin-top:10px"><div class="stat">特殊 EXP<b>+${result.xp}</b></div><div class="stat">特殊金幣<b>+${result.gold}</b></div></div>`;
   }else{
    const lost=result.penalty?.dropped;
    body+=`<div class="notice"><b>特殊遭遇｜✦ ${special.name} 挑戰失敗</b><div class="muted" style="margin-top:5px">本次連續戰鬥立即結束。</div></div><div class="item" style="margin-top:10px"><b>EXP 損失：${result.penalty?.expLost||0}</b></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${gearAbilityHtml(lost,true)}</div><div class="muted">已移至背包的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
   }
   detail.innerHTML=body;
  }
  const btn=modal.querySelector(".controls .btn.primary");if(btn){btn.textContent="確認";btn.onclick=closeBattleResultModal;}
  modal.classList.add("show");
  if(result?.win===false&&typeof window.mainMinimalModeHandleSpecialResult==="function")window.mainMinimalModeHandleSpecialResult(ctx,special,result);
 }

 function specialRewardExpAmount(baseXp,rewardCtx,useTestSpecializations=false){
  const effectBase=ceil((Number(baseXp)||0)*(Number(rewardCtx?.expMultiplier)||1));
  return typeof specializationAdjustedExp==="function"?specializationAdjustedExp(effectBase,useTestSpecializations):effectBase;
 }
 function specialRewardGoldAmount(baseGold,rewardCtx,useTestSpecializations=false){
  const effectBase=ceil((Number(baseGold)||0)*(Number(rewardCtx?.goldMultiplier)||1));
  return typeof specializationAdjustedGold==="function"?specializationAdjustedGold(effectBase,useTestSpecializations):effectBase;
 }
 window.specialRewardExpAmount=specialRewardExpAmount;
 window.specialRewardGoldAmount=specialRewardGoldAmount;

 function grantSpecialReward(rewardCtx,baseXp,baseGold,dropLevel,mapIdx){
  const xpRaw=specialRewardExpAmount(baseXp,rewardCtx);
  const xpPay=specialExpPayout(xpRaw,[]);
  const gold=specialRewardGoldAmount(baseGold,rewardCtx);
  state.gold+=gold;
  const items=specialMakeDrops(rewardCtx,dropLevel,mapIdx);
  let saleEnhancementStones=normalizeEnhancementStoneReward(null);
  const drops=items.map(item=>{
   const ir=addItem(item);
   saleEnhancementStones=mergeEnhancementStoneRewards(saleEnhancementStones,ir.enhancementStones);
   return {item,sold:ir.sold||0};
  });
  return {rewardContext:rewardCtx,xp:xpPay.xp,convertedGold:xpPay.convertedGold,gold,drops,saleEnhancementStones};
 }

 async function fightFormalSpecial(ctx,special){
  const enemyScalingSnapshot=equippedStats();
  const playerSnapshot=playerCombatStats(enemyScalingSnapshot);
  const level=clampGameLevel(state.level);
  const map=MAPS[selectedMap],dropLevel=Math.max(map.min,Math.min(map.max,level));
  const enemy=buildSpecialMonsterFromPlayer(enemyScalingSnapshot,special,level);
  const firstRewardCtx=getSpecialRewardContext(special);
  adventureScreen="combat";
  document.getElementById("main").innerHTML=specialBattlePage(enemy,special);
  await sleep(120);
  const startHp=state.hp,r=specialFight(enemy);
  await animateSpecialFight(r,startHp,playerSnapshot.hp,enemy.hp);
  const result={win:r.win,rewardContext:firstRewardCtx,bonusRewardContext:null,vip10Triggered:false,drops:[],xp:0,gold:0,convertedGold:0,saleEnhancementStones:normalizeEnhancementStoneReward(null),blackMarketIntelGranted:false,penalty:null,combatEndHp:r.combatEndHp};
  if(r.win){
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level));
   const baseGold=goldBase(level);
   const first=grantSpecialReward(firstRewardCtx,baseXp,baseGold,dropLevel,selectedMap);
   result.xp+=first.xp;
   result.convertedGold+=first.convertedGold;
   result.gold+=first.gold;
   result.drops.push(...first.drops);
   result.saleEnhancementStones=mergeEnhancementStoneRewards(result.saleEnhancementStones,first.saleEnhancementStones);

   if(special.id==="bandit_king"){
    state.pendingBlackMarketEncounter=true;
    result.blackMarketIntelGranted=true;
   }

   if((state.vipLevel||0)>=10&&Math.random()<.10){
    result.vip10Triggered=true;
    if(special.id==="bandit_king"){
     const bonusGold=specialRewardGoldAmount(baseGold,firstRewardCtx);
     state.gold+=bonusGold;
     result.gold+=bonusGold;
     result.bonusRewardContext={blackMarketGoldOnly:true};
    }else{
     const bonusCtx=getSpecialRewardContext(special);
     const bonus=grantSpecialReward(bonusCtx,baseXp,baseGold,dropLevel,selectedMap);
     result.bonusRewardContext=bonusCtx;
     result.xp+=bonus.xp;
     result.convertedGold+=bonus.convertedGold;
     result.gold+=bonus.gold;
     result.drops.push(...bonus.drops);
     result.saleEnhancementStones=mergeEnhancementStoneRewards(result.saleEnhancementStones,bonus.saleEnhancementStones);
    }
   }
  }else{
   result.penalty=applyDeathPenalty([]);
  }
  if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});
  else state.hp=playerCombatStats().hp;
  save();
  return result;
 }

 async function maybeHandleSpecialEncounter(ctx,mainResult=null){
  if(mainResult?.win!==true)return false;
  const baseEnemy=mainResult.e||monsterObj(selectedMap,selectedEnemy);
  if(baseEnemy?.kind==="boss")return false;
  if(state.level-(Number(baseEnemy?.level)||0)>=10)return false;

  const forcedByBlackMarket=state.pendingBlackMarketEncounter===true;
  if(!forcedByBlackMarket){
   const encounterRate=SPECIAL_ENCOUNTER_RATE+((state.vipLevel||0)>=6 ? .02 : 0);
   if(Math.random()>=encounterRate)return false;
  }

  const special=rollSpecialMonster(forcedByBlackMarket?["bandit_king"]:null);
  if(!special)return false;
  await showSpecialEncounterAlert(special,forcedByBlackMarket);
  const result=await fightFormalSpecial(ctx,special);
  if(result.win)addBattleEnhancementReward(ctx,"autoSale",result.saleEnhancementStones);
  if(forcedByBlackMarket){
   state.pendingBlackMarketEncounter=false;
   save(false);
  }
  if(!Array.isArray(ctx.specialEncounters))ctx.specialEncounters=[];
  ctx.specialEncounters.push({special,result,forcedByBlackMarket});
  if(!result.win)showSpecialResult(ctx,special,result);
  return {triggered:true,win:result.win,special,result,forcedByBlackMarket};
 }

 window.maybeHandleSpecialEncounter=maybeHandleSpecialEncounter;
 window.MAIN_MINIMAL_MODE_SPECIAL_HOOK_VERSION=1;
 ensureSpecialEncounterAlert();
})();