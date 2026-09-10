(function(){
 window.gmTestVipLevel=0;
 function testVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
 window.gmSetTestVipLevel=function(value){window.gmTestVipLevel=Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(value)||0)));};
 window.gmTestPlayerStats=function(baseStats=null){return createSpecialPlayerSnapshot(playerCombatStats(baseStats||equippedStats(),testVip()));};
 function vipLabel(){const lv=testVip();return `VIP${lv}｜HP/ATK/DEF +${lv*2}%｜暴擊/閃避 +${round1(lv*.5)}%`;}
 function vipOptions(){return Array.from({length:VIP_MAX_LEVEL+1},(_,i)=>`<option value="${i}" ${i===testVip()?"selected":""}>VIP${i}</option>`).join("");}

 if(typeof gmHtml==="function"){
  const baseGmHtml=gmHtml;
  gmHtml=function(){
   const html=baseGmHtml();
   const marker='<div class="gm-hub-tabs">';
   const start=html.indexOf(marker);if(start<0)return html;
   const end=html.indexOf('</div>',start);if(end<0)return html;
   const panel=`<div class="item" style="margin:0 0 12px"><b>測試 VIP 等級</b><div class="controls" style="margin-top:8px;align-items:end"><label>VIP<br><select id="gmTestVipLevel" class="btn" onchange="gmSetTestVipLevel(this.value)">${vipOptions()}</select></label><span class="muted">${vipLabel()}<br>僅本次網頁工作階段保留；重新整理或重開後回 VIP0。</span></div></div>`;
   return html.slice(0,end+6)+panel+html.slice(end+6);
  };
  window.gmHtml=gmHtml;
 }

 if(typeof gmApplyDungeonValues==="function"){
  window.gmApplyDungeonValues=function(){
   const progress=Number(document.getElementById("gmDungeonProgress")?.value);
   const attempts=Math.floor(Number(document.getElementById("gmDungeonAttempts")?.value));
   const points=Math.floor(Number(document.getElementById("gmDungeonPoints")?.value));
   if(!Number.isFinite(progress)||progress<0||!Number.isFinite(attempts)||attempts<0||!Number.isFinite(points)||points<0){alert("請輸入 0 以上的數字。");return;}
   const d=ensureDungeonProgressState();
   d.progress=progress;d.attempts=attempts;state.vipPoints=points;d.points=points;
   normalizeVipState(state);ensureDungeonProgressState();save();render();
  };
 }

 function simulate(player,enemy,startHp=player.hp){return runCombatCore(player,enemy,startHp,{logs:false});}
 function pct(n,total=GM_TEST_RUNS){return total?round1(n/total*100):0;}
 function setResult(id,html){const el=document.getElementById(id);if(el)el.innerHTML=html;}

 window.gmStartMapMonsterTest=function(){
  if(battleBusy)return;
  const mapSelect=document.getElementById("gmMapMonsterMap"),enemySelect=document.getElementById("gmMapMonsterEnemy");
  const mapIdx=Math.max(0,Math.min(MAPS.length-1,Number(mapSelect?.value)||0));
  const eIdx=Math.max(0,Math.min(MAPS[mapIdx].enemies.length-1,Number(enemySelect?.value)||0));
  const button=document.getElementById("gmMapMonsterStartBtn");if(button){button.disabled=true;button.textContent="測試中…";}
  const sandbox=gmCreateSandboxSnapshot(),basePlayer=createSpecialPlayerSnapshot(equippedStats()),player=gmTestPlayerStats(basePlayer);
  const summary={wins:0,losses:0,winHpTotal:0,deathDrops:0,vip20Protected:0,totalXp:0,totalGold:0,convertedGold:0,dropCount:0,qualityCounts:Array(QUALITY.length).fill(0)};
  battleBusy=true;
  for(let i=0;i<GM_TEST_RUNS;i++){
   gmResetSandbox(sandbox);state.vipLevel=testVip();state.hp=player.hp;
   let enemy=null;try{enemy=typeof createMonsterEncounter==="function"?createMonsterEncounter(mapIdx,eIdx):monsterObj(mapIdx,eIdx);}catch(e){}
   if(!enemy)continue;
   const r=simulate(player,enemy,player.hp);
   if(r.win){
    summary.wins++;summary.winHpTotal+=r.hp;
    const xp=Math.max(0,Math.ceil(Number(expReward(enemy))||0)),gold=Math.max(0,Math.ceil(Number(goldReward(enemy))||0));
    if(state.level>=MAX_LEVEL){summary.convertedGold+=xp;summary.totalGold+=gold+xp;}else{summary.totalXp+=xp;summary.totalGold+=gold;}
    const drops=[];const first=dropItem(enemy,mapIdx);if(first)drops.push(first);
    if(enemy.kind==="boss"&&testVip()>=16&&Math.random()<.15){const extra=dropItem(enemy,mapIdx);if(extra)drops.push(extra);}
    drops.forEach(item=>{summary.dropCount++;summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;});
   }else{
    summary.losses++;state.hp=0;const p=applyDeathPenalty([]);if(p?.dropped)summary.deathDrops++;if(p?.protectedByVip20)summary.vip20Protected++;
   }
  }
  summary.winRate=pct(summary.wins);summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0;
  gmRestoreSandbox(sandbox);battleBusy=false;
  const map=MAPS[mapIdx],base=map.enemies[eIdx];
  const extra=summary.vip20Protected?`<div class="muted" style="margin-top:6px">VIP20 成功保護裝備 ${summary.vip20Protected} 次</div>`:"";
  const html=`<div class="notice"><b>${map.name}｜${base[0]}・${vipLabel()}・${GM_TEST_RUNS} 次模擬</b><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">勝率<b>${summary.winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div><div class="stat">死亡掉裝次數<b>${summary.deathDrops}</b></div></div>${extra}${gmRewardSummaryHtml(summary)}</div>`;
  setResult("gmMapMonsterTestResult",html);
  if(button){button.disabled=false;button.textContent=`開始測試（${GM_TEST_RUNS} 次）`;}
 };

 window.gmSimulateBounty100=function(tierId){
  const tier=getBountyTierConfig(tierId);if(!tier)return alert("找不到懸賞資料。");
  const base=createSpecialPlayerSnapshot(equippedStats()),player=gmTestPlayerStats(base),summary={wins:0,totalTurns:0,winHpTotal:0};
  for(let i=0;i<GM_TEST_RUNS;i++){
   const enemy=buildBountyEnemyForTest(tierId,base,state.level),r=simulate(player,enemy);summary.totalTurns+=r.turns;if(r.win){summary.wins++;summary.winHpTotal+=r.hp;}
  }
  const winRate=pct(summary.wins),avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0,avgTurns=round1(summary.totalTurns/GM_TEST_RUNS);
  setResult("gmBountyTestResult",`<div class="notice"><b>${tier.name}・${vipLabel()}・${GM_TEST_RUNS} 次模擬</b><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">勝率<b>${winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${avgWinHp}%</b></div><div class="stat">平均回合<b>${avgTurns}</b></div></div></div>`);
 };

 window.gmSimulateArena100=function(difficultyId){
  const cfg=(typeof getArenaDifficultyConfigs==="function"?getArenaDifficultyConfigs():[]).find(x=>x.id===difficultyId);if(!cfg)return alert("找不到競技場資料。");
  const base=createSpecialPlayerSnapshot(equippedStats()),player=gmTestPlayerStats(base),reached=[GM_TEST_RUNS,0,0],wins=[0,0,0];
  let totalPoints=0,clearHpTotal=0,totalTurns=0;
  for(let run=0;run<GM_TEST_RUNS;run++){
   let hp=player.hp,points=0,cleared=true;
   for(let stage=0;stage<3;stage++){
    if(stage>0)reached[stage]++;
    const enemy=buildArenaEnemyForTest(difficultyId,stage,base,state.level),r=simulate(player,enemy,hp);totalTurns+=r.turns;
    if(r.win){wins[stage]++;hp=r.hp;points+=Number(cfg.stagePoints?.[stage])||0;}else{cleared=false;break;}
   }
   if(cleared)clearHpTotal+=hp;totalPoints+=points;
  }
  const clear=wins[2],avgPoints=round1(totalPoints/GM_TEST_RUNS),avgHp=clear?round1(clearHpTotal/clear/player.hp*100):0,avgTurns=round1(totalTurns/GM_TEST_RUNS),cond=s=>pct(wins[s],reached[s]);
  setResult("gmArenaTestResult",`<div class="notice"><b>${cfg.name}・${vipLabel()}・${GM_TEST_RUNS} 次完整三連戰</b><div class="stats" style="margin-top:10px"><div class="stat">第1戰通過<b>${pct(wins[0])}%</b></div><div class="stat">第2戰到達<b>${pct(reached[1])}%</b></div><div class="stat">第2戰條件通過<b>${cond(1)}%</b></div><div class="stat">第3戰到達<b>${pct(reached[2])}%</b></div><div class="stat">第3戰條件通過<b>${cond(2)}%</b></div><div class="stat">全通率<b>${pct(clear)}%</b></div><div class="stat">平均積分<b>${avgPoints}</b></div><div class="stat">全通平均剩餘 HP<b>${avgHp}%</b></div><div class="stat">平均總回合<b>${avgTurns}</b></div></div></div>`);
 };

 window.gmSimulateVoidMirageClimb=function(){
  const raw=Number(document.getElementById("gmVoidMirageFloor")?.value),start=Number.isFinite(raw)&&raw>=1?Math.floor(raw):null;if(!start)return alert("請輸入 1 以上的起始樓層。");
  const player=gmTestPlayerStats(),limit=10000;let floor=start,cleared=0,totalPoints=0,totalTurns=0,lastHp=player.hp,lastFloor=start-1,previousName="",failed=null;
  while(cleared<limit){const enemy=buildVoidMirageEnemy(floor,{previousName});if(!enemy.isBossFloor)previousName=enemy.name;const r=simulate(player,enemy,player.hp);totalTurns+=r.turns;if(!r.win){failed=enemy;break;}cleared++;lastFloor=floor;lastHp=r.hp;totalPoints+=voidMirageFirstClearPoints(floor);floor++;}
  const avgPoints=cleared?round1(totalPoints/cleared):0,avgTurns=cleared?round1(totalTurns/cleared):0,lastPct=cleared?round1(lastHp/player.hp*100):0,stop=failed?.floor||floor;
  setResult("gmVoidMirageTestResult",`<div class="notice"><b>虛空幻境・${vipLabel()}・從第 ${start} 層連續爬塔</b><div class="stats" style="margin-top:10px"><div class="stat">成功層數<b>${cleared}</b></div><div class="stat">最後成功樓層<b>${cleared?lastFloor:"—"}</b></div><div class="stat">停止／失敗樓層<b>${stop}</b></div><div class="stat">本次總積分<b>${totalPoints}</b></div><div class="stat">平均每層積分<b>${avgPoints}</b></div><div class="stat">平均戰鬥回合<b>${avgTurns}</b></div><div class="stat">最後成功剩餘 HP<b>${cleared?`${lastHp}（${lastPct}%）`:"—"}</b></div></div></div>`);
 };

 window.gmSpecialBatchResultHtml=function(special,summary){
  const rewardRows=Object.entries(summary.randomRewards||{}).map(([name,n])=>`${name} ${n}`).join("　");
  const extraRows=`${summary.vip10Triggers?`<div class="muted" style="margin-top:6px">VIP10 第二次特殊獎勵：${summary.vip10Triggers} 次</div>`:""}${summary.vip20Protected?`<div class="muted" style="margin-top:6px">VIP20 成功保護裝備：${summary.vip20Protected} 次</div>`:""}${summary.shopDown?`<div class="muted" style="margin-top:6px">商店刷新價格共降低 ${summary.shopDown} 級（僅模擬）</div>`:""}${rewardRows?`<div class="muted" style="margin-top:6px">獎勵分布：${rewardRows}</div>`:""}`;
  return `<div class="notice"><b>${special.name}・${vipLabel()}・${GM_TEST_RUNS} 次模擬</b><div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))"><div class="stat">勝率<b>${summary.winRate}%</b></div><div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div><div class="stat">死亡掉裝次數<b>${summary.deathDrops}</b></div></div>${gmRewardSummaryHtml(summary,extraRows)}</div>`;
 };

 window.gmStartSpecialBattle=async function(){
  if(battleBusy)return;
  const select=document.getElementById("gmSpecialMonster"),special=getSpecialMonsterById(select?.value);if(!special)return alert("找不到特殊怪資料。");
  gmSpecialBatchSelectedId=special.id;const button=document.getElementById("gmSpecialBatchStartBtn");if(button){button.disabled=true;button.textContent="測試中…";}
  const sandbox=gmCreateSandboxSnapshot(),level=clampGameLevel(state.level),mapIdx=Math.max(0,Math.min(MAPS.length-1,Math.floor((level-1)/5))),base=createSpecialPlayerSnapshot(equippedStats()),player=gmTestPlayerStats(base);
  const summary={count:GM_TEST_RUNS,wins:0,losses:0,totalXp:0,totalGold:0,convertedGold:0,dropCount:0,qualityCounts:Array(QUALITY.length).fill(0),shopDown:0,deathDrops:0,vip20Protected:0,vip10Triggers:0,winHpTotal:0,randomRewards:{}};
  function grant(ctx){
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level)),baseGold=goldBase(level),xpRaw=ceil(baseXp*(ctx.expMultiplier||1)),xpPay=specialExpPayout(xpRaw,[]),gold=ceil(baseGold*(ctx.goldMultiplier||1));
   summary.totalXp+=xpPay.xp;summary.convertedGold+=xpPay.convertedGold;summary.totalGold+=gold+xpPay.convertedGold;state.gold+=gold;
   const items=specialMakeDrops(ctx,level,mapIdx);summary.dropCount+=items.length;items.forEach(item=>{summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;addItem(item);});
   summary.shopDown+=specialApplyShopDiscount(ctx.shopRefreshDown);if(ctx.randomReward?.label)summary.randomRewards[ctx.randomReward.label]=(summary.randomRewards[ctx.randomReward.label]||0)+1;
  }
  battleBusy=true;
  for(let i=0;i<GM_TEST_RUNS;i++){
   gmResetSandbox(sandbox);state.vipLevel=testVip();state.hp=player.hp;
   const enemy=buildSpecialMonsterFromPlayer(base,special,level),r=simulate(player,enemy,player.hp);
   if(r.win){summary.wins++;summary.winHpTotal+=r.hp;grant(getSpecialRewardContext(special));if(testVip()>=10&&Math.random()<.10){summary.vip10Triggers++;grant(getSpecialRewardContext(special));}}
   else{summary.losses++;state.hp=0;const p=applyDeathPenalty([]);if(p?.dropped)summary.deathDrops++;if(p?.protectedByVip20)summary.vip20Protected++;}
  }
  summary.winRate=round1(summary.wins/GM_TEST_RUNS*100);summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/player.hp*100):0;
  gmRestoreSandbox(sandbox);battleBusy=false;gmSpecialBatchResult={special,summary};setResult("gmSpecialBatchResult",gmSpecialBatchResultHtml(special,summary));if(select)select.value=gmSpecialBatchSelectedId;if(button){button.disabled=false;button.textContent=`開始測試（${GM_TEST_RUNS} 次）`;}
 };
})();
