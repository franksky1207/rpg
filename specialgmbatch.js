const baseGmHtmlForSpecialBatch=gmHtml;
const baseGmStartSpecialBattleSingle=gmStartSpecialBattle;

gmHtml=function(){
 const html=baseGmHtmlForSpecialBatch();
 return html.replace(
  '<button class="btn primary" onclick="gmStartSpecialBattle()">開始測試</button>',
  '<label>測試次數<br><input id="gmSpecialTestCount" class="btn" type="number" min="1" max="100" value="1" style="width:90px"></label><button class="btn primary" onclick="gmStartSpecialBattle()">開始測試</button>'
 );
};

function gmSpecialBatchResultHtml(special,summary){
 const qualityRows=summary.qualityCounts.map((n,i)=>n?`<span class="${qClass(i)}">${QUALITY[i].n} ${n}</span>`:"").filter(Boolean).join("　")||"無";
 const travelerRows=Object.entries(summary.randomRewards).map(([name,n])=>`${name} ${n}`).join("　");
 return `<div class="notice"><b>GM 沙盒批次測試</b><div class="muted" style="margin-top:5px">以下 ${summary.count} 次戰鬥皆以測試開始前完全相同的角色狀態獨立進行；正式角色資料未變更。</div></div>
 <div class="notice" style="margin-top:10px"><b>✦ ${special.name}</b></div>
 <div class="stats" style="margin-top:10px">
  <div class="stat">測試次數<b>${summary.count}</b></div>
  <div class="stat">勝利<b>${summary.wins}</b></div>
  <div class="stat">失敗<b>${summary.losses}</b></div>
  <div class="stat">勝率<b>${summary.winRate}%</b></div>
  <div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div>
  <div class="stat">死亡掉裝次數<b>${summary.deathDrops}</b></div>
 </div>
 <div class="notice" style="margin-top:10px"><b>模擬獎勵合計</b><div style="margin-top:6px">EXP +${summary.totalXp.toLocaleString()}　金幣 +${summary.totalGold.toLocaleString()}</div><div class="muted" style="margin-top:6px">裝備掉落 ${summary.dropCount} 件：${qualityRows}</div>${summary.shopDown?`<div class="muted" style="margin-top:6px">商店刷新價格共降低 ${summary.shopDown} 級（僅模擬）</div>`:""}${travelerRows?`<div class="muted" style="margin-top:6px">神秘旅人獎勵分布：${travelerRows}</div>`:""}</div>`;
}

async function gmStartSpecialBattle(){
 if(battleBusy)return;
 const countRaw=Number(document.getElementById("gmSpecialTestCount")?.value||1);
 const count=Math.max(1,Math.min(100,Math.floor(countRaw)));
 if(count===1)return baseGmStartSpecialBattleSingle();

 const id=document.getElementById("gmSpecialMonster")?.value,special=getSpecialMonsterById(id);
 if(!special)return alert("找不到特殊怪資料。");

 const snapshot=JSON.stringify(state);
 const upgradeSnapshot=upgradeDropNoticePending;
 const level=Math.max(1,Math.min(50,state.level));
 const mapIdx=gmSpecialMapForLevel(level);
 const playerSnapshot=equippedStats();
 const playerMax=playerSnapshot.hp;
 battleBusy=true;gmSpecialTestActive=true;gmSpecialTestMonster=special;

 const summary={count,wins:0,losses:0,totalXp:0,totalGold:0,dropCount:0,qualityCounts:Array(QUALITY.length).fill(0),shopDown:0,deathDrops:0,winHpTotal:0,randomRewards:{}};

 for(let i=0;i<count;i++){
  state=JSON.parse(snapshot);
  upgradeDropNoticePending=upgradeSnapshot;
  state.hp=playerMax;
  const enemy=buildSpecialMonsterFromPlayer(playerSnapshot,special,level);
  const ctx=getSpecialRewardContext(special);
  const r=gmSpecialFight(enemy);
  if(r.win){
   summary.wins++;
   summary.winHpTotal+=Math.max(0,state.hp);
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level));
   const baseGold=goldBase(level);
   const xp=ceil(baseXp*(ctx.expMultiplier||1));
   const gold=ceil(baseGold*(ctx.goldMultiplier||1));
   summary.totalXp+=xp;summary.totalGold+=gold;
   state.gold+=gold;gainExp(xp,[]);
   const items=gmSpecialMakeDrops(ctx,level,mapIdx);
   summary.dropCount+=items.length;
   items.forEach(item=>{summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;addItem(item)});
   summary.shopDown+=gmSpecialApplyShopDiscount(ctx.shopRefreshDown);
   if(ctx.randomReward?.label)summary.randomRewards[ctx.randomReward.label]=(summary.randomRewards[ctx.randomReward.label]||0)+1;
  }else{
   summary.losses++;
   const penalty=applyDeathPenalty([]);
   if(penalty?.dropped)summary.deathDrops++;
  }
 }

 summary.winRate=round1(summary.wins/count*100);
 summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/playerMax*100):0;

 state=JSON.parse(snapshot);
 upgradeDropNoticePending=upgradeSnapshot;
 save(false);
 battleBusy=false;
 gmSpecialTestStateSnapshot=null;
 gmSpecialTestUpgradeNoticeSnapshot=upgradeSnapshot;

 const modal=document.getElementById("battleResultModal"),title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail");
 if(title)title.textContent="特殊怪批次測試";
 if(detail)detail.innerHTML=gmSpecialBatchResultHtml(special,summary);
 const btn=modal?.querySelector(".controls .btn.primary");if(btn)btn.onclick=gmCloseSpecialResult;
 if(modal)modal.classList.add("show");
}
