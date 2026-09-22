(function(){
 const specialFlowSleep=ms=>typeof window.mainBattleFlowSleep==="function"?window.mainBattleFlowSleep(ms):new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(ms)||0)));
 const SPECIAL_BATTLE_READY_DELAY_1X=140;
 function specialBattleReadyDelay(){
  return typeof window.combatSpeedScaledDelay==="function"?window.combatSpeedScaledDelay(SPECIAL_BATTLE_READY_DELAY_1X):SPECIAL_BATTLE_READY_DELAY_1X;
 }
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
  await specialFlowSleep(850);
  el.classList.remove("show");
  await specialFlowSleep(140);
 }

 function specialBattlePage(enemy,special){
  const s=playerCombatStats(),hpPct=s.hp?state.hp/s.hp*100:0;
  const world2=state?.secondWorld?.entered===true&&window.activeSecondWorldMainlineContext;
  const active=world2?window.activeSecondWorldMainlineContext:window.activeMainBattleContext;
  const continuous=active?.continuous===true,requested=world2?active?.stopRequested===true:active?.exitRequested===true;
  const stop=continuous?`<div class="continuous-stop-wrap"><button id="continuousBattleStopBtn" class="btn danger" onclick="${world2?"requestSecondWorldContinuousStop()":"requestContinuousBattleStop()"}" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連續戰鬥"}</button></div>`:"";
  return `<section class="combat-screen"><div class="combat-head">⚠ 特殊遭遇</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${typeof window.playerIdentityNameHtml==="function"?window.playerIdentityNameHtml({compact:true}):escapePlayerName(currentPlayerName())} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard" style="border-color:#c99b45;box-shadow:0 0 22px rgba(201,155,69,.22)"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">✦ ${special.name} Lv.${enemy.level}</h2><div class="muted" style="margin:8px 0 5px">${special.description}</div><div class="muted" style="margin-bottom:12px">暴擊 ${enemy.crit||0}%　閃避 ${enemy.dodge||0}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${enemy.hp} / ${enemy.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">特殊戰鬥開始</div>${stop}</section>`;
 }

 function specialFight(enemy,world=1){return specialFightCore(enemy,{world});}
 function pendingBlackMarketActive(target=state){return target?.pendingBlackMarketEncounter===true;}
 function grantPendingBlackMarket(target=state){if(!target||typeof target!=="object")return false;target.pendingBlackMarketEncounter=true;return true;}
 function consumePendingBlackMarket(target=state){if(!target||typeof target!=="object")return false;const active=pendingBlackMarketActive(target);target.pendingBlackMarketEncounter=false;return active;}
 function specialWorld(options={}){
  if(Number(options.world)===1)return 1;
  if(Number(options.world)===2)return 2;
  return state?.secondWorld?.entered===true?2:1;
 }

 async function animateSpecialFight(r,startPlayerHp,playerMax,enemyMax){
  if(typeof window.animateStructuredCombatPresentation!=="function")throw new Error("Structured Combat Presentation 未載入。");
  await window.animateStructuredCombatPresentation(r,{mode:"special",clearAfter:true,clearReason:"special-battle-end"});
 }

 window.SPECIAL_COMBAT_MARK_PRESENTATION_VERSION=1;
 window.SPECIAL_ENCOUNTER_FLOW_PACING_VERSION=1;
 window.SPECIAL_ENCOUNTER_COMBAT_SPEED_VERSION=1;

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
  if(Number(result?.world)===2){
   const rewardLabel=result.rewardContext?.randomReward?.label;
   const saleCount=(result.drops||[]).filter(x=>x?.sale).length;
   const keptCount=(result.drops||[]).filter(x=>x?.kept===true).length;
   const penalty=result.penalty||null,lost=penalty?.dropped;
   detail.innerHTML=result.win
    ?`<div class="notice"><b>✦ ${special.name} 擊破</b>${rewardLabel?`<div class="muted" style="margin-top:5px">特殊獎勵：${rewardLabel}</div>`:""}${result.blackMarketIntelGranted?`<div class="muted" style="margin-top:5px">取得暗域黑市情報：下一次符合條件的主線勝利後，必定觸發另一個特殊遭遇。</div>`:""}</div><div class="stats" style="margin-top:10px"><div class="stat">特殊 EXP<b>+${Number(result.xp)||0}</b></div><div class="stat">特殊暗物質<b>+${Number(result.darkMatter)||0}</b></div><div class="stat">特殊暗能量<b>+${Number(result.darkEnergy)||0}</b></div><div class="stat">保留裝備<b>${keptCount}</b></div><div class="stat">自動出售<b>${saleCount}</b></div></div>`
    :`<div class="notice"><b>特殊遭遇｜✦ ${special.name} 挑戰失敗</b><div class="muted" style="margin-top:5px">本次連續戰鬥立即結束。</div></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${typeof gearAbilityHtml==="function"?gearAbilityHtml(lost,true):""}</div><div class="muted">${Number(lost.world)===2&&Number.isFinite(Number(penalty?.cost))?`贖回成本：${Number(penalty.cost).toLocaleString()} 暗物質`:"可前往背包的「遺失裝備贖回」取回。"}</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
  }else if(typeof mainBattleSettlementHtml==="function"&&typeof specialEncounterSettlementHtml==="function"){
   detail.innerHTML=mainBattleSettlementHtml(ctx,{interrupted:!result.win})+specialEncounterSettlementHtml(ctx);
  }else{
   let body=fallbackPriorRewardsHtml(ctx);
   if(result.win){
    const rewardLabel=result.rewardContext?.randomReward?.label;
    body+=`<div class="notice"><b>✦ ${special.name} 擊破</b>${rewardLabel?`<div class="muted" style="margin-top:5px">特殊獎勵：${rewardLabel}</div>`:""}${result.blackMarketIntelGranted?`<div class="muted" style="margin-top:5px">取得黑市情報：下一次符合條件的主線勝利後，必定觸發另一個特殊遭遇。</div>`:""}</div><div class="stats" style="margin-top:10px"><div class="stat">特殊 EXP<b>+${result.xp}</b></div><div class="stat">特殊金幣<b>+${result.gold}</b></div></div>`;
   }else{
    const lost=result.penalty?.dropped;
    body+=`<div class="notice"><b>特殊遭遇｜✦ ${special.name} 挑戰失敗</b><div class="muted" style="margin-top:5px">本次連續戰鬥立即結束。</div></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${gearAbilityHtml(lost,true)}</div><div class="muted">已移至背包的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
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

 function grantSpecialReward(rewardCtx,baseXp,baseGold,dropLevel,mapIdx,options={}){
  const world=specialWorld(options);
  const xpRaw=world===2?ceil((Number(baseXp)||0)*(Number(rewardCtx?.expMultiplier)||1)):specialRewardExpAmount(baseXp,rewardCtx);
  const xpPay=specialExpPayout(xpRaw,[]);
  const gold=world===2?0:specialRewardGoldAmount(baseGold,rewardCtx);
  const darkMatter=world===2?ceil((Number(baseGold)||0)*(Number(rewardCtx?.goldMultiplier)||1)):0;
  if(world===2)state.secondWorld.darkMatter=Math.max(0,Math.floor(Number(state.secondWorld.darkMatter)||0))+darkMatter;
  else state.gold+=gold;
  const items=specialMakeDrops(rewardCtx,dropLevel,mapIdx,{world,bossIndex:options.bossIndex,state});
  let saleEnhancementStones=normalizeEnhancementStoneReward(null);
  const drops=items.map(item=>{
   const ir=addItem(item);
   saleEnhancementStones=mergeEnhancementStoneRewards(saleEnhancementStones,ir.enhancementStones);
   return {item,sold:ir.sold||0,kept:ir.kept===true,sale:ir.sale||null};
  });
  let saleDarkMatter=0,saleDarkEnergy=0;
  const resolvedDrops=drops.map(row=>{
   if(world!==2)return row;
   const quote=row?.sale?.quote||row?.sale||null;
   saleDarkMatter+=Math.max(0,Number(quote?.darkMatter)||0);
   saleDarkEnergy+=Math.max(0,Number(quote?.darkEnergy)||0);
   return row;
  });
  return {rewardContext:rewardCtx,xp:xpPay.xp,convertedGold:xpPay.convertedGold,gold,darkMatter,drops:resolvedDrops,saleEnhancementStones,saleDarkMatter,saleDarkEnergy};
 }

 async function fightFormalSpecial(ctx,special,options={}){
  const enemyScalingSnapshot=equippedStats();
  const playerSnapshot=playerCombatStats(enemyScalingSnapshot);
  const world=specialWorld(options);
  const level=world===2?Math.max(500,Math.min(1000,Math.floor(Number(state.level)||500))):clampGameLevel(state.level);
  const map=world===1?MAPS[selectedMap]:null;
  const dropLevel=world===2?level:Math.max(map.min,Math.min(map.max,level));
  const bossIndex=world===2?(Number.isInteger(options.bossIndex)?options.bossIndex:(typeof window.secondWorldBossIndexForPlayerLevel==="function"?window.secondWorldBossIndexForPlayerLevel(level):-1)):-1;
  const resolvedSpecial=typeof window.specialMonsterForWorld==="function"?window.specialMonsterForWorld(special,world):special;
  const enemy=buildSpecialMonsterFromPlayer(enemyScalingSnapshot,resolvedSpecial,level);
  const firstRewardCtx=getSpecialRewardContext(resolvedSpecial,world);
  adventureScreen="combat";
  document.getElementById("main").innerHTML=specialBattlePage(enemy,special);
  await specialFlowSleep(specialBattleReadyDelay());
  const startHp=state.hp,r=specialFight(enemy,world);
  await animateSpecialFight(r,startHp,playerSnapshot.hp,enemy.hp);
  const result={win:r.win,world,rewardContext:firstRewardCtx,bonusRewardContext:null,vip10Triggered:false,drops:[],xp:0,gold:0,darkMatter:0,darkEnergy:0,convertedGold:0,saleEnhancementStones:normalizeEnhancementStoneReward(null),blackMarketIntelGranted:false,penalty:null,combatEndHp:r.combatEndHp};
  if(r.win){
   const baseXp=world===2&&typeof window.secondWorldBossExpReward==="function"?window.secondWorldBossExpReward(bossIndex,false,state):ceil(sameExp(level)*expLevelFactor(level,state.level));
   const baseGold=world===2&&typeof window.secondWorldBossDarkMatterReward==="function"?window.secondWorldBossDarkMatterReward(bossIndex,false):goldBase(level);
   const first=grantSpecialReward(firstRewardCtx,baseXp,baseGold,dropLevel,world===1?selectedMap:null,{world,bossIndex});
   result.xp+=first.xp;
   result.convertedGold+=first.convertedGold;
   result.gold+=first.gold;
   result.darkMatter+=first.darkMatter+first.saleDarkMatter;
   result.darkEnergy+=first.saleDarkEnergy;
   result.drops.push(...first.drops);
   result.saleEnhancementStones=mergeEnhancementStoneRewards(result.saleEnhancementStones,first.saleEnhancementStones);

   if(special.id==="bandit_king"){
    grantPendingBlackMarket(state);
    result.blackMarketIntelGranted=true;
   }

   if((state.vipLevel||0)>=10&&Math.random()<.10){
    result.vip10Triggered=true;
    if(special.id==="bandit_king"){
     const bonusGold=world===2?0:specialRewardGoldAmount(baseGold,firstRewardCtx);
     const bonusDarkMatter=world===2?ceil((Number(baseGold)||0)*(Number(firstRewardCtx?.goldMultiplier)||1)):0;
     if(world===2){
      state.secondWorld.darkMatter=Math.max(0,Math.floor(Number(state.secondWorld.darkMatter)||0))+bonusDarkMatter;
      result.darkMatter+=bonusDarkMatter;
     }else{
      state.gold+=bonusGold;
      result.gold+=bonusGold;
     }
     result.bonusRewardContext={blackMarketGoldOnly:world===1,blackMarketResourceOnly:true};
    }else{
     const bonusCtx=getSpecialRewardContext(resolvedSpecial,world);
     const bonus=grantSpecialReward(bonusCtx,baseXp,baseGold,dropLevel,world===1?selectedMap:null,{world,bossIndex});
     result.bonusRewardContext=bonusCtx;
     result.xp+=bonus.xp;
     result.convertedGold+=bonus.convertedGold;
     result.gold+=bonus.gold;
     result.darkMatter+=bonus.darkMatter+bonus.saleDarkMatter;
     result.darkEnergy+=bonus.saleDarkEnergy;
     result.drops.push(...bonus.drops);
     result.saleEnhancementStones=mergeEnhancementStoneRewards(result.saleEnhancementStones,bonus.saleEnhancementStones);
    }
   }
  }else{
   result.penalty=world===2&&typeof window.applySecondWorldDeathPenalty==="function"?window.applySecondWorldDeathPenalty():applyDeathPenalty([]);
  }
  if(typeof restorePlayerHp==="function")restorePlayerHp({save:false});
  else state.hp=playerCombatStats().hp;
  save();
  return result;
 }

 async function maybeHandleSpecialEncounter(ctx,mainResult=null,options={}){
  if(mainResult?.win!==true)return false;
  const world=specialWorld(options);
  const baseEnemy=mainResult.e||(world===1?monsterObj(selectedMap,selectedEnemy):null);
  if(world===1&&baseEnemy?.kind==="boss")return false;
  if(world===1&&state.level-(Number(baseEnemy?.level)||0)>=10)return false;

  const forcedByBlackMarket=pendingBlackMarketActive(state);
  if(!forcedByBlackMarket){
   const encounterRate=SPECIAL_ENCOUNTER_RATE+((state.vipLevel||0)>=6 ? .02 : 0);
   if(Math.random()>=encounterRate)return false;
  }

  const special=rollSpecialMonster(forcedByBlackMarket?["bandit_king"]:null,world);
  if(!special)return false;
  await showSpecialEncounterAlert(special,forcedByBlackMarket);
  const result=await fightFormalSpecial(ctx,special,{world,bossIndex:options.bossIndex});
  if(result.win&&world===1&&typeof addBattleEnhancementReward==="function")addBattleEnhancementReward(ctx,"autoSale",result.saleEnhancementStones);
  if(result.win&&world===2&&ctx){
   ctx.totalXp=Math.max(0,Number(ctx.totalXp)||0)+Math.max(0,Number(result.xp)||0);
   ctx.totalDarkMatter=Math.max(0,Number(ctx.totalDarkMatter)||0)+Math.max(0,Number(result.darkMatter)||0);
   ctx.totalDarkEnergy=Math.max(0,Number(ctx.totalDarkEnergy)||0)+Math.max(0,Number(result.darkEnergy)||0);
   for(const row of result.drops||[]){
    if(row?.item&&row?.kept!==false&&!row?.sale)ctx.items?.push?.(row.item);
    else if(row?.sale)ctx.autoSoldCount=Math.max(0,Number(ctx.autoSoldCount)||0)+1;
   }
  }
  if(forcedByBlackMarket){
   consumePendingBlackMarket(state);
   save(false);
  }
  if(!Array.isArray(ctx.specialEncounters))ctx.specialEncounters=[];
  ctx.specialEncounters.push({special,result,forcedByBlackMarket});
  if(!result.win||(world===2&&ctx?.continuous!==true))showSpecialResult(ctx,special,result);
  return {triggered:true,win:result.win,special,result,forcedByBlackMarket};
 }

 window.maybeHandleSpecialEncounter=maybeHandleSpecialEncounter;
 window.MAIN_MINIMAL_MODE_SPECIAL_HOOK_VERSION=1;
 window.SPECIAL_WORLD_FORMAL_FLOW_VERSION=1;
 window.pendingBlackMarketActive=pendingBlackMarketActive;
 window.PENDING_BLACK_MARKET_CURRENT_PHASE_VERSION=1;
 ensureSpecialEncounterAlert();
})();