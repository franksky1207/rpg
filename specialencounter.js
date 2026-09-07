(function(){
 let encounterResolver=null;

 function ensureSpecialEncounterModal(){
  if(document.getElementById("specialEncounterModal"))return;
  const el=document.createElement("div");
  el.className="modal";
  el.id="specialEncounterModal";
  el.innerHTML=`<div class="modal-box"><h3>⚠ 未知特殊遭遇</h3><div class="muted">你察覺到一股不同尋常的氣息。要挑戰這場未知遭遇嗎？</div><div class="controls" style="margin-top:14px"><button class="btn primary" onclick="specialEncounterChoose(true)">挑戰</button><button class="btn ok" onclick="specialEncounterChoose(false)">略過</button></div></div>`;
  document.body.appendChild(el);
 }

 function askSpecialEncounter(){
  ensureSpecialEncounterModal();
  return new Promise(resolve=>{
   encounterResolver=resolve;
   document.getElementById("specialEncounterModal")?.classList.add("show");
  });
 }

 window.specialEncounterChoose=function(challenge){
  document.getElementById("specialEncounterModal")?.classList.remove("show");
  const resolve=encounterResolver;encounterResolver=null;
  if(resolve)resolve(!!challenge);
 };

 function specialBattlePage(enemy,special){
  const s=equippedStats(),hpPct=s.hp?state.hp/s.hp*100:0;
  return `<section class="combat-screen"><div class="combat-head">⚠ 特殊遭遇</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${state.playerName||"玩家"} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard" style="border-color:#c99b45;box-shadow:0 0 22px rgba(201,155,69,.22);background:linear-gradient(180deg,rgba(201,155,69,.10),rgba(0,0,0,0))"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">✦ ${special.name} Lv.${enemy.level}</h2><div class="muted" style="margin:8px 0 5px">${special.description}</div><div class="muted" style="margin-bottom:12px">暴擊 ${enemy.crit||0}%　閃避 ${enemy.dodge||0}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${enemy.hp} / ${enemy.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">特殊戰鬥開始</div></section>`;
 }

 function specialFight(enemy){
  const ps=equippedStats();let ehp=enemy.hp,php=state.hp,logs=[],turn=0;
  while(php>0&&ehp>0&&turn<200){
   turn++;
   if(Math.random()*100<(enemy.dodge||0))logs.push(`${enemy.name}閃避了你的攻擊。`);
   else{
    let pd=calcDamage(ps.atk,enemy.def),crit=Math.random()*100<ps.crit;
    if(crit)pd=ceil(pd*CRIT_DAMAGE_MULTIPLIER);
    ehp-=pd;logs.push(crit?`你攻擊${enemy.name}，暴擊造成 ${pd} 點傷害。`:`你攻擊${enemy.name}，造成 ${pd} 點傷害。`);
   }
   if(ehp<=0)break;
   if(Math.random()*100<ps.dodge){logs.push(`${enemy.name}攻擊你，你閃避了攻擊。`);continue}
   let ed=calcDamage(enemy.atk,ps.def),enemyCrit=Math.random()*100<(enemy.crit||0);
   if(enemyCrit)ed=ceil(ed*CRIT_DAMAGE_MULTIPLIER);
   php-=ed;logs.push(enemyCrit?`${enemy.name}攻擊你，暴擊造成 ${ed} 點傷害。`:`${enemy.name}攻擊你，造成 ${ed} 點傷害。`);
  }
  state.hp=Math.max(0,php);
  return {win:php>0,logs,e:enemy};
 }

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

 function priorRewardsHtml(ctx){
  if(!ctx?.completed)return "";
  return `<div class="notice" style="margin-bottom:10px"><b>原連續戰鬥已提前結束</b><div class="muted" style="margin-top:5px">已完成 ${ctx.completed} / ${ctx.originalCount} 場；先前取得的 EXP、金幣與裝備均保留。</div></div><div class="stats" style="margin-bottom:10px"><div class="stat">前段 EXP<b>+${ctx.totalXp||0}</b></div><div class="stat">前段金幣<b>+${ctx.totalGold||0}</b></div></div>${ctx.items?.length?dropListHtml(ctx.items):""}`;
 }

 function showSkipSettlement(ctx){
  if(!ctx?.completed){adventureScreen="prepare";render();return;}
  const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
  if(!title||!detail||!modal)return;
  title.textContent="特殊遭遇已略過";
  detail.innerHTML=`<div class="notice"><b>已完成 ${ctx.completed} / ${ctx.originalCount} 場</b><div class="muted" style="margin-top:5px">未知特殊遭遇已略過，剩餘戰鬥取消；以下獎勵已保留。</div></div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${ctx.totalXp||0}</b></div><div class="stat">金幣<b>+${ctx.totalGold||0}</b></div></div>${dropListHtml(ctx.items||[])}`;
  const btn=modal.querySelector(".controls .btn.primary");if(btn){btn.textContent="確認";btn.onclick=closeBattleResultModal;}
  modal.classList.add("show");
 }

 function showSpecialResult(ctx,special,result){
  const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
  if(!title||!detail||!modal)return;
  title.textContent=result.win?"特殊遭遇完成":"特殊遭遇失敗";
  let body=priorRewardsHtml(ctx);
  if(result.win){
   const rewardLabel=result.rewardContext?.randomReward?.label;
   body+=`<div class="notice"><b>✦ ${special.name} 擊破</b>${rewardLabel?`<div class="muted" style="margin-top:5px">神秘旅人獎勵：${rewardLabel}</div>`:""}</div><div class="stats" style="margin-top:10px"><div class="stat">特殊 EXP<b>+${result.xp}</b></div><div class="stat">特殊金幣<b>+${result.gold}</b></div></div>${result.shopDown?`<div class="notice" style="margin-top:10px">商店刷新價格降低 ${result.shopDown} 級。</div>`:""}<div style="margin-top:12px"><b>特殊獎勵</b>${result.drops.length?result.drops.map(x=>`<div class="item">${itemHtml(x.item,true)}${gearAbilityHtml(x.item,true)}${x.sold?`<div class="muted">自動出售 +${x.sold} 金幣</div>`:""}</div>`).join(""):`<div class="muted" style="margin-top:6px">本次沒有裝備掉落。</div>`}</div>`;
  }else{
   const lost=result.penalty?.dropped;
   body+=`<div class="notice"><b>✦ ${special.name} 挑戰失敗</b></div><div class="item" style="margin-top:10px"><b>EXP 損失：${result.penalty?.expLost||0}</b></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${gearAbilityHtml(lost,true)}</div><div class="muted">已移至商店的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
  }
  detail.innerHTML=body;
  const btn=modal.querySelector(".controls .btn.primary");if(btn){btn.textContent="確認";btn.onclick=closeBattleResultModal;}
  modal.classList.add("show");
 }

 async function fightFormalSpecial(ctx,special){
  const playerSnapshot=equippedStats();
  state.hp=playerSnapshot.hp;
  const level=Math.max(1,Math.min(50,state.level));
  const map=MAPS[selectedMap],dropLevel=Math.max(map.min,Math.min(map.max,level));
  const enemy=buildSpecialMonsterFromPlayer(playerSnapshot,special,level),rewardCtx=getSpecialRewardContext(special);
  adventureScreen="combat";
  document.getElementById("main").innerHTML=specialBattlePage(enemy,special);
  await sleep(120);
  const startHp=state.hp,r=specialFight(enemy);
  await animateSpecialFight(r,startHp,playerSnapshot.hp,enemy.hp);
  const result={win:r.win,rewardContext:rewardCtx,drops:[],xp:0,gold:0,shopDown:0,penalty:null};
  if(r.win){
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level));
   const baseGold=goldBase(level);
   result.xp=ceil(baseXp*(rewardCtx.expMultiplier||1));
   result.gold=ceil(baseGold*(rewardCtx.goldMultiplier||1));
   state.gold+=result.gold;gainExp(result.xp,[]);
   const items=gmSpecialMakeDrops(rewardCtx,dropLevel,selectedMap);
   result.drops=items.map(item=>{const ir=addItem(item);return {item,sold:ir.sold||0};});
   result.shopDown=gmSpecialApplyShopDiscount(rewardCtx.shopRefreshDown);
  }else result.penalty=applyDeathPenalty([]);
  save();
  showSpecialResult(ctx,special,result);
 }

 async function maybeHandleSpecialEncounter(ctx){
  const baseEnemy=monsterObj(selectedMap,selectedEnemy);
  if(baseEnemy?.kind==="boss")return false;
  if(state.level-(Number(baseEnemy?.level)||0)>=10)return false;
  const s=equippedStats();
  if(!s.hp||state.hp/s.hp<.30)return false;
  if(Math.random()>=SPECIAL_ENCOUNTER_RATE)return false;
  const challenge=await askSpecialEncounter();
  if(!challenge){showSkipSettlement(ctx);return true;}
  const special=rollSpecialMonster();
  if(!special)return false;
  state.hp=equippedStats().hp;
  save(false);
  await fightFormalSpecial(ctx,special);
  return true;
 }

 window.maybeHandleSpecialEncounter=maybeHandleSpecialEncounter;

 runBattles=async function(count,ctx=null){
  if(battleBusy)return;
  battleBusy=true;
  if(!ctx)ctx={wins:0,totalXp:0,totalGold:0,items:[],originalCount:count,completed:0,remaining:count};
  let defeat=null;
  for(let local=1;local<=count;local++){
   if(await maybeHandleSpecialEncounter(ctx)){battleBusy=false;save();return;}
   combatRound=ctx.completed+1;combatTotal=ctx.originalCount;adventureScreen="combat";render();await sleep(60);
   let psBefore=equippedStats(),startPlayerHp=state.hp,eBefore=monsterObj(selectedMap,selectedEnemy),r=fightOnce(selectedMap,selectedEnemy);
   if(!r.ok){alert(r.reason);break}
   await animateFight(r,startPlayerHp,psBefore.hp,eBefore.hp,ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"");
   if(r.win){ctx.wins++;ctx.totalXp+=r.xp;ctx.totalGold+=r.gold;if(r.item)ctx.items.push({item:r.item,sold:r.sold||0})}else defeat=r;
   ctx.completed++;ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);save();
   if(!r.win)break;
   if(ctx.originalCount>1&&ctx.remaining>0&&lowHp()){render();pendingContinuousBattle=ctx;battleBusy=false;showRiskModal("continuous",ctx.remaining);return}
   if(ctx.remaining>0)await sleep(r.e.kind==="elite"?220:140);
  }
  battleBusy=false;save();render();setTimeout(()=>showBattleResult(ctx,defeat),0);
 };

 ensureSpecialEncounterModal();
})();
