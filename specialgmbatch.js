let gmSpecialBatchSelectedId=(typeof SPECIAL_MONSTERS!=="undefined"&&SPECIAL_MONSTERS[0])?SPECIAL_MONSTERS[0].id:"";
let gmSpecialBatchWorld=Number(window.gmTestWorld)===2?2:1;
let gmSpecialBatchResult=null;
let gmSpecialBatchResults={};

function gmSpecialBatchWorldValue(){return Number(gmSpecialBatchWorld)===2?2:1;}
function gmSpecialBatchLevel(){
 const raw=Math.floor(Number(window.gmTestLevel)||Number(state?.level)||1);
 return gmSpecialBatchWorldValue()===2?Math.max(500,Math.min(1000,raw)):Math.max(1,Math.min(500,raw));
}
function gmSpecialMapForLevel(level){
 if(!Array.isArray(MAPS)||!MAPS.length)return 0;
 const lv=Math.max(1,Math.min(500,Math.floor(Number(level)||1)));
 let found=MAPS.findIndex(map=>lv>=Math.max(1,Number(map?.min)||1)&&lv<=Math.max(1,Number(map?.max)||1));
 if(found>=0)return found;
 let best=0;MAPS.forEach((map,index)=>{if((Number(map?.min)||1)<=lv)best=index;});return best;
}
function gmSpecialTestVip(){return Math.max(0,Math.min(VIP_MAX_LEVEL,Math.floor(Number(window.gmTestVipLevel)||0)));}
function gmSpecialVipLabel(){return typeof gmTestVipLabel==="function"?gmTestVipLabel():`VIP${gmSpecialTestVip()}`;}
function gmSpecialResolved(id=gmSpecialBatchSelectedId){
 return typeof getSpecialMonsterById==="function"?getSpecialMonsterById(id,gmSpecialBatchWorldValue()):null;
}
function gmSpecialOptionsHtml(){
 const tierLabel={low:"低",mid:"中",high:"高"},world=gmSpecialBatchWorldValue();
 return (Array.isArray(SPECIAL_MONSTERS)?SPECIAL_MONSTERS:[]).map(base=>{
  const x=typeof specialMonsterForWorld==="function"?specialMonsterForWorld(base,world):base;
  return `<option value="${base.id}" ${base.id===gmSpecialBatchSelectedId?"selected":""}>${x.name}（${tierLabel[x.tier]||"低"}）</option>`;
 }).join("");
}
function gmSpecialWorldOptionsHtml(){
 const world=gmSpecialBatchWorldValue();
 return `<option value="1" ${world===1?"selected":""}>銀河紀元</option><option value="2" ${world===2?"selected":""}>宇宙紀元</option>`;
}
function gmSpecialQualityText(counts){
 const rows=(Array.isArray(counts)?counts:[]).map((n,i)=>n>0?`${QUALITY?.[i]?.n||("Q"+i)} ${n}`:"").filter(Boolean);
 return rows.length?rows.join("　"):"無";
}
function gmSpecialBatchResultHtml(special,summary){
 const rewardRows=Object.entries(summary.randomRewards||{}).map(([name,n])=>`${name} ${n}`).join("　");
 const resourceLabel=summary.world===2?"暗物質":"金幣";
 return `<div class="notice">${gmTestSummaryHtml(special.name,`${GM_TEST_RUNS} 次模擬`,summary.testVipLabel,summary.testSpecLabel)}<div class="muted gm-test-context">${summary.world===2?"宇宙紀元":"銀河紀元"}｜測試角色 Lv.${summary.level}｜使用 GM 測試角色裝備、VIP、專精、強化、印記${summary.world===2?"與文明等級":""}；不修改正式角色、獎勵或進度。</div></div>
 <div class="stats" style="margin-top:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
  <div class="stat">勝率<b>${summary.winRate}%</b></div>
  <div class="stat">平均回合<b>${summary.avgTurns}</b></div>
  <div class="stat">勝利平均剩餘 HP<b>${summary.avgWinHp}%</b></div>
  <div class="stat">平均 EXP<b>${Math.round(summary.totalXp/Math.max(1,summary.wins)).toLocaleString()}</b></div>
  <div class="stat">平均${resourceLabel}<b>${Math.round(summary.totalResource/Math.max(1,summary.wins)).toLocaleString()}</b></div>
  <div class="stat">裝備掉落<b>${summary.dropCount}</b></div>
 </div>
 <div class="muted" style="margin-top:8px">品質分布：${gmSpecialQualityText(summary.qualityCounts)}</div>
 ${summary.vip10Triggers?`<div class="muted" style="margin-top:6px">VIP10 第二次特殊獎勵：${summary.vip10Triggers} 次</div>`:""}
 ${rewardRows?`<div class="muted" style="margin-top:6px">隨機獎勵分布：${rewardRows}</div>`:""}`;
}
function gmSetSpecialBatchWorld(value){
 const next=Number(value)===2?2:1;
 if(next===gmSpecialBatchWorld)return;
 gmSpecialBatchWorld=next;gmSpecialBatchResult=null;
 if(typeof render==="function")render();
}
function gmSetSpecialBatchSelected(id){
 const base=(Array.isArray(SPECIAL_MONSTERS)?SPECIAL_MONSTERS:[]).find(x=>x.id===id);
 if(!base)return;
 const changed=gmSpecialBatchSelectedId!==base.id;
 gmSpecialBatchSelectedId=base.id;
 if(changed){gmSpecialBatchResult=null;const result=document.getElementById("gmSpecialBatchResult");if(result)result.innerHTML="";}
}
async function gmStartSpecialBattle(){
 if(battleBusy)return;
 const select=document.getElementById("gmSpecialMonster"),id=select?.value||gmSpecialBatchSelectedId;
 const special=gmSpecialResolved(id);
 if(!special)return alert("找不到特殊怪資料。");
 gmSpecialBatchSelectedId=special.id;
 const button=document.getElementById("gmSpecialBatchStartBtn");if(button){button.disabled=true;button.textContent="測試中…";}

 const world=gmSpecialBatchWorldValue(),level=gmSpecialBatchLevel(),mapIdx=gmSpecialMapForLevel(level);
 const bossIndex=world===2&&typeof window.secondWorldBossIndexForPlayerLevel==="function"?window.secondWorldBossIndexForPlayerLevel(level):-1;
 const enemyScalingSnapshot=typeof window.gmTestEnhancedEquippedStats==="function"?window.gmTestEnhancedEquippedStats():createSpecialPlayerSnapshot(equippedStats());
 const playerSnapshot=typeof window.gmTestPlayerStats==="function"?window.gmTestPlayerStats(enemyScalingSnapshot):createSpecialPlayerSnapshot(playerCombatStats(enemyScalingSnapshot,gmSpecialTestVip()));
 const playerMax=playerSnapshot.hp;
 const marks=typeof window.markLevelsSnapshot==="function"?window.markLevelsSnapshot(true):{};
 const civLevel=world===2&&typeof window.gmTestCivilizationLevelValue==="function"?window.gmTestCivilizationLevelValue():0;
 const civMultiplier=typeof window.civilizationCombatDamageMultiplier==="function"?window.civilizationCombatDamageMultiplier({world,civilizationLevel:civLevel}):1;
 battleBusy=true;
 const summary={world,level,count:GM_TEST_RUNS,wins:0,losses:0,totalTurns:0,totalXp:0,totalResource:0,dropCount:0,qualityCounts:Array(QUALITY.length).fill(0),vip10Triggers:0,winHpTotal:0,randomRewards:{},testVipLabel:gmSpecialVipLabel(),testSpecLabel:gmTestSpecializationLabel()};

 function rewardOnce(ctx){
  let xp=0,resource=0;
  if(world===2){
   const baseXp=typeof window.secondWorldBossExpReward==="function"?window.secondWorldBossExpReward(bossIndex,true,state):0;
   const baseDm=typeof window.secondWorldBossDarkMatterReward==="function"?window.secondWorldBossDarkMatterReward(bossIndex,true):0;
   xp=Math.ceil(baseXp*(Number(ctx?.expMultiplier)||1));
   resource=Math.ceil(baseDm*(Number(ctx?.goldMultiplier)||1));
  }else{
   const baseXp=ceil(sameExp(level)*expLevelFactor(level,level)),baseGold=goldBase(level);
   xp=specialRewardExpAmount(baseXp,ctx,true);
   resource=specialRewardGoldAmount(baseGold,ctx,true);
  }
  summary.totalXp+=xp;summary.totalResource+=resource;
  const items=specialMakeDrops(ctx,level,world===1?mapIdx:null,{world,bossIndex,state,equipment:window.gmTestEquipment||null});
  summary.dropCount+=items.length;
  items.forEach(item=>{summary.qualityCounts[item.q]=(summary.qualityCounts[item.q]||0)+1;});
  if(ctx?.randomReward?.label)summary.randomRewards[ctx.randomReward.label]=(summary.randomRewards[ctx.randomReward.label]||0)+1;
 }
 function blackMarketResourceOnly(ctx){
  if(world===2){
   const base=typeof window.secondWorldBossDarkMatterReward==="function"?window.secondWorldBossDarkMatterReward(bossIndex,true):0;
   summary.totalResource+=Math.ceil(base*(Number(ctx?.goldMultiplier)||1));
  }else{
   summary.totalResource+=specialRewardGoldAmount(goldBase(level),ctx,true);
  }
 }

 try{
  for(let i=0;i<GM_TEST_RUNS;i++){
   const enemy=buildSpecialMonsterFromPlayer(enemyScalingSnapshot,special,level);
   const r=runCombatCore(playerSnapshot,enemy,playerMax,{logs:false,preparePresentation:false,useTestSpecializations:true,useTestMarks:true,markLevels:marks,playerFinalDamageMultiplier:civMultiplier});
   summary.totalTurns+=Math.max(0,Number(r.turns)||0);
   if(r.win){
    summary.wins++;summary.winHpTotal+=Math.max(0,Number(r.hp)||0);
    const firstCtx=getSpecialRewardContext(special,world);rewardOnce(firstCtx);
    if(gmSpecialTestVip()>=10&&Math.random()<.10){
     summary.vip10Triggers++;
     if(special.id==="bandit_king")blackMarketResourceOnly(firstCtx);
     else rewardOnce(getSpecialRewardContext(special,world));
    }
   }else summary.losses++;
   if((i+1)%25===0&&i+1<GM_TEST_RUNS)await new Promise(resolve=>setTimeout(resolve,0));
  }
  summary.winRate=round1(summary.wins/GM_TEST_RUNS*100);
  summary.avgWinHp=summary.wins?round1(summary.winHpTotal/summary.wins/playerMax*100):0;
  summary.avgTurns=round1(summary.totalTurns/GM_TEST_RUNS);
  gmSpecialBatchResult={special,summary};
  gmSpecialBatchResults[(summary.world===2?"2":"1")+":"+special.id]=JSON.parse(JSON.stringify(gmSpecialBatchResult));
 }finally{
  battleBusy=false;
 }
 const result=document.getElementById("gmSpecialBatchResult");if(result&&gmSpecialBatchResult)result.innerHTML=gmSpecialBatchResultHtml(gmSpecialBatchResult.special,gmSpecialBatchResult.summary);
 if(select)select.value=gmSpecialBatchSelectedId;if(button){button.disabled=false;button.textContent=`開始測試（${GM_TEST_RUNS} 次）`;}if(typeof window.gmPowerBenchmarkRefreshSummary==="function")window.gmPowerBenchmarkRefreshSummary();
}

window.gmSpecialBatchWorldValue=gmSpecialBatchWorldValue;
window.gmSpecialWorldOptionsHtml=gmSpecialWorldOptionsHtml;
window.gmSpecialBatchOptionsHtml=gmSpecialOptionsHtml;
window.gmSetSpecialBatchWorld=gmSetSpecialBatchWorld;
window.gmSpecialBatchResultSnapshot=function(){const rows=Object.values(gmSpecialBatchResults);return rows.length?JSON.parse(JSON.stringify(rows)):null;};
window.gmClearSpecialBatchResult=function(){gmSpecialBatchResult=null;gmSpecialBatchResults={};return true;};
window.GM_SPECIAL_WORLD_BENCHMARK_VERSION=1;
window.GM_SPECIAL_SUMMARY_EXPORT_VERSION=1;
window.GM_SPECIAL_WEAK_SLOT_SANDBOX_VERSION=1;
window.GM_SPECIAL_CIVILIZATION_COMBAT_OWNER_VERSION=1;
