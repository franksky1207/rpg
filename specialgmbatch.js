let gmSpecialBatchSelectedId=(typeof SPECIAL_MONSTERS!=="undefined"&&SPECIAL_MONSTERS[0])?SPECIAL_MONSTERS[0].id:"";
let gmSpecialBatchResult=null;

function gmSpecialMapForLevel(level){return Math.max(0,Math.min(9,Math.floor((level-1)/5)));}

function gmSpecialBatchResultHtml(special,summary){
 const rewardRows=Object.entries(summary.randomRewards).map(([name,n])=>`${name} ${n}`).join("　");
 const extraRows=`${summary.shopDown?`<div class="muted" style="margin-top:6px">商店刷新價格共降低 ${summary.shopDown} 級（僅模擬）</div>`:""}${rewardRows?`<div class="muted" style="margin-top:6px">獎勵分布：${rewardRows}</div>`:""}`;
 return `<div class="notice"><b>${special.name}・${GM_TEST_RUNS} 次模擬</b><div class="muted" style="margin-top:5px">以下 ${GM_TEST_RUNS} 次戰鬥皆以測試開始前完全相同的角色狀態獨立進行；正式角色資料未變更。</div></div>
 <div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
  <div class="stat">勝率<b>${summary.winRate}%</b></div>
  <div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div>
  <div class="stat">死亡掉裝次數<b>${summary.deathDrops}</b></div>
 </div>
 ${gmRewardSummaryHtml(summary,extraRows)}`;
}

function gmSetSpecialBatchSelected(id){
 const special=getSpecialMonsterById(id);
 if(!special)return;
 const changed=gmSpecialBatchSelectedId!==special.id;
 gmSpecialBatchSelectedId=special.id;
 if(changed){
  gmSpecialBatchResult=null;
  const result=document.getElementById("gmSpecialBatchResult");
  if(result)result.innerHTML="";
 }
}

async function gmStartSpecialBattle(){
 if(battleBusy)return;
 const select=document.getElementById("gmSpecialMonster");
 const id=select?.value,special=getSpecialMonsterById(id);
 if(!special)return alert("找不到特殊怪資料。");
 gmSpecialBatchSelectedId=special.id;

 const button=document.getElementById("gmSpecialBatchStartBtn");
 if(button){button.disabled=true;button.textContent="測試中…";}

 const sandbox=gmCreateSandboxSnapshot();
 const level=clampGameLevel(state.level);
 const mapIdx=gmSpecialMapForLevel(level);
 const playerSnapshot=equippedStats();
 const playerMax=playerSnapshot.hp;
 battleBusy=true;

 const summary={count:GM_TEST_RUNS,wins:0,losses:0,totalXp:0,totalGold:0,convertedGold:0,dropCount:0,qualityCounts:Array(QUALITY.length).fill(0),shopDown:0,deathDrops:0,winHpTotal:0,randomRewards:{}};

 for(let i=0;i<GM_TEST_RUNS;i++){
  gmResetSandbox(sandbox);
  state.hp=playerMax;
  const enemy=buildSpecialMonsterFromPlayer(playerSnapshot,special,level);
  const ctx=getSpecialRewardContext(special);
  const r=specialFightCore(enemy);
  if(r.win){
   summary.wins++;
   summary.winHpTotal+=Math.max(0,state.hp);
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level));
   const baseGold=goldBase(level);
   const xpRaw=ceil(baseXp*(ctx.expMultiplier||1));
   const xpPay=specialExpPayout(xpRaw,[]);
   const gold=ceil(baseGold*(ctx.goldMultiplier||1));
   summary.totalXp+=xpPay.xp;
   summary.convertedGold+=xpPay.convertedGold;
   summary.totalGold+=gold+xpPay.convertedGold;
   state.gold+=gold;
   const items=specialMakeDrops(ctx,level,mapIdx);
   summary.dropCount+=items.length;
   items.forEach(item=>{summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;addItem(item)});
   summary.shopDown+=specialApplyShopDiscount(ctx.shopRefreshDown);
   if(ctx.randomReward?.label)summary.randomRewards[ctx.randomReward.label]=(summary.randomRewards[ctx.randomReward.label]||0)+1;
  }else{
   summary.losses++;
   const penalty=applyDeathPenalty([]);
   if(penalty?.dropped)summary.deathDrops++;
  }
 }

 summary.winRate=round1(summary.wins/GM_TEST_RUNS*100);
 summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/playerMax*100):0;

 gmRestoreSandbox(sandbox);
 battleBusy=false;
 gmSpecialBatchResult={special,summary};

 const result=document.getElementById("gmSpecialBatchResult");
 if(result)result.innerHTML=gmSpecialBatchResultHtml(special,summary);
 if(select)select.value=gmSpecialBatchSelectedId;
 if(button){button.disabled=false;button.textContent=`開始測試（${GM_TEST_RUNS} 次）`;}
}
