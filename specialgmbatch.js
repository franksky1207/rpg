let gmSpecialBatchSelectedId=(typeof SPECIAL_MONSTERS!=="undefined"&&SPECIAL_MONSTERS[0])?SPECIAL_MONSTERS[0].id:"";
let gmSpecialBatchResult=null;

function gmSpecialMapForLevel(level){return Math.max(0,Math.min(MAPS.length-1,Math.floor((level-1)/5)));}
function gmSpecialTestVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
function gmSpecialVipLabel(){return typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${gmSpecialTestVip()}`;}

function gmSpecialBatchResultHtml(special,summary){
 const rewardRows=Object.entries(summary.randomRewards).map(([name,n])=>`${name} ${n}`).join("　");
 const extraRows=`${summary.vip10Triggers?`<div class="muted" style="margin-top:6px">VIP10 第二次特殊獎勵：${summary.vip10Triggers} 次</div>`:""}${summary.vip20Protected?`<div class="muted" style="margin-top:6px">VIP20 成功保護裝備：${summary.vip20Protected} 次</div>`:""}${summary.shopDown?`<div class="muted" style="margin-top:6px">商店刷新價格共降低 ${summary.shopDown} 級（僅模擬）</div>`:""}${rewardRows?`<div class="muted" style="margin-top:6px">獎勵分布：${rewardRows}</div>`:""}`;
 return `<div class="notice">${gmTestSummaryHtml(special.name,`${GM_TEST_RUNS} 次模擬`,summary.testVipLabel,summary.testSpecLabel)}<div class="muted gm-test-context">敵人生成不含 VIP；玩家戰鬥與 VIP10／VIP20 規則使用本次測試 VIP，戰鬥同時套用本次測試專精。正式角色資料未變更。</div></div>
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
 if(changed){gmSpecialBatchResult=null;const result=document.getElementById("gmSpecialBatchResult");if(result)result.innerHTML="";}
}

async function gmStartSpecialBattle(){
 if(battleBusy)return;
 const select=document.getElementById("gmSpecialMonster");
 const id=select?.value,special=getSpecialMonsterById(id);
 if(!special)return alert("找不到特殊怪資料。");
 gmSpecialBatchSelectedId=special.id;
 const button=document.getElementById("gmSpecialBatchStartBtn");if(button){button.disabled=true;button.textContent="測試中…";}

 const sandbox=gmCreateSandboxSnapshot();
 const level=clampGameLevel(state.level),mapIdx=gmSpecialMapForLevel(level);
 const enemyScalingSnapshot=createSpecialPlayerSnapshot(equippedStats());
 const playerSnapshot=typeof gmTestPlayerStats==="function"?gmTestPlayerStats(enemyScalingSnapshot):createSpecialPlayerSnapshot(playerCombatStats(enemyScalingSnapshot,gmSpecialTestVip()));
 const playerMax=playerSnapshot.hp;
 battleBusy=true;
 const summary={count:GM_TEST_RUNS,wins:0,losses:0,totalXp:0,totalGold:0,convertedGold:0,dropCount:0,totalSellValue:0,qualityCounts:Array(QUALITY.length).fill(0),shopDown:0,deathDrops:0,vip20Protected:0,vip10Triggers:0,winHpTotal:0,randomRewards:{},testVipLabel:gmSpecialVipLabel(),testSpecLabel:gmTestSpecializationLabel()};

 function grant(ctx,baseXp,baseGold){
  const xpRaw=ceil(baseXp*(ctx.expMultiplier||1)),xpPay=specialExpPayout(xpRaw,[]),gold=ceil(baseGold*(ctx.goldMultiplier||1));
  summary.totalXp+=xpPay.xp;summary.convertedGold+=xpPay.convertedGold;summary.totalGold+=gold+xpPay.convertedGold;state.gold+=gold;
  const items=specialMakeDrops(ctx,level,mapIdx);summary.dropCount+=items.length;
  items.forEach(item=>{
   summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;
   summary.totalSellValue+=specializationSellValue(item,true);
   addItem(item,{useTestSpecializations:true});
  });
  summary.shopDown+=specialApplyShopDiscount(ctx.shopRefreshDown);
  if(ctx.randomReward?.label)summary.randomRewards[ctx.randomReward.label]=(summary.randomRewards[ctx.randomReward.label]||0)+1;
 }

 for(let i=0;i<GM_TEST_RUNS;i++){
  gmResetSandbox(sandbox);state.vipLevel=gmSpecialTestVip();state.hp=playerMax;
  const enemy=buildSpecialMonsterFromPlayer(enemyScalingSnapshot,special,level),r=runCombatCore(playerSnapshot,enemy,playerMax,{logs:false,useTestSpecializations:true});state.hp=r.hp;
  if(r.win){
   summary.wins++;summary.winHpTotal+=Math.max(0,state.hp);
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level)),baseGold=goldBase(level);
   grant(getSpecialRewardContext(special,true),baseXp,baseGold);
   if(gmSpecialTestVip()>=10&&Math.random()<.10){summary.vip10Triggers++;grant(getSpecialRewardContext(special,true),baseXp,baseGold);}
  }else{
   summary.losses++;const penalty=applyDeathPenalty([]);if(penalty?.dropped)summary.deathDrops++;if(penalty?.protectedByVip20)summary.vip20Protected++;
  }
 }

 summary.winRate=round1(summary.wins/GM_TEST_RUNS*100);
 summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/playerMax*100):0;
 gmRestoreSandbox(sandbox);battleBusy=false;gmSpecialBatchResult={special,summary};
 const result=document.getElementById("gmSpecialBatchResult");if(result)result.innerHTML=gmSpecialBatchResultHtml(special,summary);
 if(select)select.value=gmSpecialBatchSelectedId;if(button){button.disabled=false;button.textContent=`開始測試（${GM_TEST_RUNS} 次）`;}
}