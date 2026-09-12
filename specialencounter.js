(function(){
 function ensureSpecialEncounterAlert(){
  if(document.getElementById("specialEncounterAlert"))return;
  const style=document.createElement("style");
  style.id="special-encounter-alert-styles";
  style.textContent=`
   #specialEncounterAlert{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(3,6,10,.82);opacity:0;pointer-events:none;transition:opacity .16s ease;backdrop-filter:blur(3px)}
   #specialEncounterAlert.show{opacity:1}
   .special-alert-card{width:min(620px,92vw);padding:28px 24px;text-align:center;border:1px solid #c99b45;border-radius:16px;background:radial-gradient(circle at 50% 25%,rgba(201,155,69,.20),rgba(17,20,25,.96) 62%);box-shadow:0 0 34px rgba(201,155,69,.34),inset 0 0 26px rgba(201,155,69,.08);transform:scale(.94);animation:specialEncounterPulse .82s ease-in-out both}
   .special-alert-title{font-size:clamp(30px,6vw,48px);font-weight:900;letter-spacing:.06em;color:#ffd36f;text-shadow:0 0 18px rgba(255,193,67,.42)}
   .special-alert-sub{margin-top:10px;font-size:clamp(15px,2.8vw,19px);color:#e8dcc0;letter-spacing:.08em}
   .special-alert-name{margin-top:13px;font-size:clamp(20px,4vw,30px);font-weight:800;color:#fff2c2}
   @keyframes specialEncounterPulse{0%{transform:scale(.92);filter:brightness(.75)}35%{transform:scale(1.025);filter:brightness(1.18)}70%{transform:scale(.995);filter:brightness(1)}100%{transform:scale(1);filter:brightness(1)}}
   @media(max-width:760px){#specialEncounterAlert{padding:14px}.special-alert-card{padding:24px 16px}}
  `;
  document.head.appendChild(style);
  const el=document.createElement("div");
  el.id="specialEncounterAlert";
  el.innerHTML=`<div class="special-alert-card"><div class="special-alert-title">⚠ 特殊遭遇！</div><div class="special-alert-sub">偵測到異常敵影</div><div class="special-alert-name" id="specialEncounterAlertName"></div></div>`;
  document.body.appendChild(el);
 }

 async function showSpecialEncounterAlert(special){
  ensureSpecialEncounterAlert();
  const el=document.getElementById("specialEncounterAlert"),name=document.getElementById("specialEncounterAlertName");
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
  const infinite=window.activeMainBattleContext?.infinite===true,requested=window.activeMainBattleContext?.exitRequested===true;
  const stop=infinite?`<div class="infinite-stop-wrap"><button id="infiniteBattleStopBtn" class="btn danger" onclick="requestInfiniteBattleStop()" ${requested?"disabled":""}>${requested?"本場結束後停止":"停止連戰"}</button></div>`:"";
  return `<section class="combat-screen"><div class="combat-head">⚠ 特殊遭遇</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${state.playerName||"玩家"} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard" style="border-color:#c99b45;box-shadow:0 0 22px rgba(201,155,69,.22);background:linear-gradient(180deg,rgba(201,155,69,.10),rgba(0,0,0,0))"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">✦ ${special.name} Lv.${enemy.level}</h2><div class="muted" style="margin:8px 0 5px">${special.description}</div><div class="muted" style="margin-bottom:12px">暴擊 ${enemy.crit||0}%　閃避 ${enemy.dodge||0}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${enemy.hp} / ${enemy.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">特殊戰鬥開始</div>${stop}</section>`;
 }

 function specialFight(enemy){return specialFightCore(enemy);}

 async function animateSpecialFight(r,startPlayerHp,playerMax,enemyMax){
  let ehp=enemyMax,php=startPlayerHp;
  setCombatHp(ehp,enemyMax,php,playerMax,"特殊戰鬥開始");
  await sleep(180);
  for(const line of r.logs){
   let m=line.match(/^你攻擊.+，暴擊造成 (\d+) 點傷害。$/);
   if(m){attackMotion("player");await sleep(120);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`暴擊！你造成 ${m[1]} 點傷害`);await sleep(220);continue}
   m=line.match(/^你攻擊.+，造成 (\d+) 點傷害。$/);
   if(m){attackMotion("player");await sleep(120);ehp=Math.max(0,ehp-(+m[1]));flashDamage("enemy",m[1]);setCombatHp(ehp,enemyMax,php,playerMax,`你造成 ${m[1]} 點傷害`);await sleep(190);continue}
   m=line.match(/^.+閃避了你的攻擊。$/);
   if(m){attackMotion("player");await sleep(120);flashCombatText("enemy","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}閃避了你的攻擊`);await sleep(190);continue}
   m=line.match(/^.+攻擊你，你閃避了攻擊。$/);
   if(m){attackMotion("enemy");await sleep(120);flashCombatText("player","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`你閃避了${r.e.name}的攻擊`);await sleep(190);continue}
   m=line.match(/^.+攻擊你，暴擊造成 (\d+) 點傷害。$/);
   if(m){attackMotion("enemy");await sleep(120);php=Math.max(0,php-(+m[1]));flashCombatText("player",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}暴擊造成 ${m[1]} 點傷害`);await sleep(220);continue}
   m=line.match(/^.+攻擊你，造成 (\d+) 點傷害。$/);
   if(m){attackMotion("enemy");await sleep(120);php=Math.max(0,php-(+m[1]));flashDamage("player",m[1]);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}造成 ${m[1]} 點傷害`);await sleep(190)}
  }
  setCombatHp(ehp,enemyMax,php,playerMax,r.win?"特殊遭遇勝利！":"特殊遭遇失敗！");
  await sleep(250);
 }

 function fallbackPriorRewardsHtml(ctx){
  if(!ctx?.completed)return "";
  const dungeon=typeof dungeonBattleResultHtml==="function"?dungeonBattleResultHtml(ctx):"";
  return `<div class="notice" style="margin-bottom:10px"><b>主線戰鬥</b><div class="muted" style="margin-top:5px">已完成 ${ctx.completed} / ${ctx.originalCount} 場，剩餘連戰已取消；已取得的獎勵與副本進度均保留。</div></div><div class="stats" style="margin-bottom:10px"><div class="stat">主線 EXP<b>+${ctx.totalXp||0}</b></div><div class="stat">主線金幣<b>+${ctx.totalGold||0}</b></div></div>${ctx.items?.length?dropListHtml(ctx.items):""}${dungeon}`;
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
    body+=`<div class="notice"><b>✦ ${special.name} 擊破</b>${rewardLabel?`<div class="muted" style="margin-top:5px">特殊獎勵：${rewardLabel}</div>`:""}</div><div class="stats" style="margin-top:10px"><div class="stat">特殊 EXP<b>+${result.xp}</b></div><div class="stat">特殊金幣<b>+${result.gold}</b></div></div>`;
   }else{
    const lost=result.penalty?.dropped;
    body+=`<div class="notice"><b>特殊遭遇｜✦ ${special.name} 挑戰失敗</b><div class="muted" style="margin-top:5px">本次連續戰鬥立即結束。</div></div><div class="item" style="margin-top:10px"><b>EXP 損失：${result.penalty?.expLost||0}</b></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${gearAbilityHtml(lost,true)}</div><div class="muted">已移至商店的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
   }
   detail.innerHTML=body;
  }
  const btn=modal.querySelector(".controls .btn.primary");if(btn){btn.textContent="確認";btn.onclick=closeBattleResultModal;}
  modal.classList.add("show");
 }

 function grantSpecialReward(rewardCtx,baseXp,baseGold,dropLevel,mapIdx){
  const xpBase=ceil(baseXp*(rewardCtx.expMultiplier||1));
  const xpRaw=typeof specializationAdjustedExp==="function"?specializationAdjustedExp(xpBase):xpBase;
  const xpPay=specialExpPayout(xpRaw,[]);
  const goldBaseReward=ceil(baseGold*(rewardCtx.goldMultiplier||1));
  const gold=typeof specializationAdjustedGold==="function"?specializationAdjustedGold(goldBaseReward):goldBaseReward;
  state.gold+=gold;
  const items=specialMakeDrops(rewardCtx,dropLevel,mapIdx);
  const drops=items.map(item=>{const ir=addItem(item);return {item,sold:ir.sold||0};});
  const shopDown=specialApplyShopDiscount(rewardCtx.shopRefreshDown);
  return {rewardContext:rewardCtx,xp:xpPay.xp,convertedGold:xpPay.convertedGold,gold,drops,shopDown};
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
  const result={win:r.win,rewardContext:firstRewardCtx,bonusRewardContext:null,vip10Triggered:false,drops:[],xp:0,gold:0,convertedGold:0,shopDown:0,penalty:null,combatEndHp:r.combatEndHp};
  if(r.win){
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level));
   const baseGold=goldBase(level);
   const first=grantSpecialReward(firstRewardCtx,baseXp,baseGold,dropLevel,selectedMap);
   result.xp+=first.xp;
   result.convertedGold+=first.convertedGold;
   result.gold+=first.gold;
   result.drops.push(...first.drops);
   result.shopDown+=first.shopDown;

   if((state.vipLevel||0)>=10&&Math.random()<.10){
    const bonusCtx=getSpecialRewardContext(special);
    const bonus=grantSpecialReward(bonusCtx,baseXp,baseGold,dropLevel,selectedMap);
    result.vip10Triggered=true;
    result.bonusRewardContext=bonusCtx;
    result.xp+=bonus.xp;
    result.convertedGold+=bonus.convertedGold;
    result.gold+=bonus.gold;
    result.drops.push(...bonus.drops);
    result.shopDown+=bonus.shopDown;
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
  const encounterRate=SPECIAL_ENCOUNTER_RATE+((state.vipLevel||0)>=6 ? .02 : 0);
  if(Math.random()>=encounterRate)return false;
  const special=rollSpecialMonster();
  if(!special)return false;
  await showSpecialEncounterAlert(special);
  const result=await fightFormalSpecial(ctx,special);
  if(!Array.isArray(ctx.specialEncounters))ctx.specialEncounters=[];
  ctx.specialEncounters.push({special,result});
  if(!result.win)showSpecialResult(ctx,special,result);
  return {triggered:true,win:result.win,special,result};
 }

 window.maybeHandleSpecialEncounter=maybeHandleSpecialEncounter;
 ensureSpecialEncounterAlert();
})();
