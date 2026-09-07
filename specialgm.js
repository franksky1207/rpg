let gmSpecialTestActive=false;
let gmSpecialTestMonster=null;
let gmSpecialTestReward=null;
let gmSpecialTestStateSnapshot=null;
let gmSpecialTestUpgradeNoticeSnapshot=false;

const baseGmHtmlForSpecialTest=gmHtml;
gmHtml=function(){
 const base=baseGmHtmlForSpecialTest();
 const options=SPECIAL_MONSTERS.map(x=>`<option value="${x.id}">${x.name}</option>`).join("");
 return `${base}<div class="gm" style="margin-top:14px"><h3>特殊怪測試</h3><div class="muted">選擇特殊怪後會依目前角色的實際能力直接生成並進入測試戰鬥，不經過自然遭遇機率。GM 測試為沙盒模式，戰鬥中的 HP、EXP、金幣、裝備、背包、商店等變化會在離開結算後全部還原。</div><div class="controls" style="margin-top:10px;align-items:end"><label>特殊怪<br><select id="gmSpecialMonster" class="btn">${options}</select></label><button class="btn primary" onclick="gmStartSpecialBattle()">開始測試</button></div></div>`;
};

function gmSpecialMapForLevel(level){return Math.max(0,Math.min(9,Math.floor((level-1)/5)));}
function gmSpecialQualityFromTable(table){
 if(!Array.isArray(table)||!table.length)return qualityRoll("normal");
 let total=table.reduce((a,n)=>a+Math.max(0,Number(n)||0),0);
 if(total<=0)return qualityRoll("normal");
 let r=Math.random()*total;
 for(let i=0;i<table.length;i++){r-=Math.max(0,Number(table[i])||0);if(r<0)return Math.min(5,i);}
 return 0;
}
function gmSpecialWeakTypes(){
 const rows=EQUIPMENT_TYPES.map(type=>({type,score:equipmentScore(state.equipment[type])}));
 for(let i=rows.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
 rows.sort((a,b)=>a.score-b.score);
 return rows.map(x=>x.type);
}
function gmSpecialDropType(ctx){
 if(!ctx.weakSlotDrop)return null;
 const order=gmSpecialWeakTypes(),p=ctx.weakSlotDrop.primary??70;
 return Math.random()*100<p?(order[0]||null):(order[1]||order[0]||null);
}
function gmSpecialRollQuality(ctx){
 let q=ctx.qualityTable?gmSpecialQualityFromTable(ctx.qualityTable):qualityRoll(ctx.qualitySource==="normal"?"normal":"normal");
 return Math.max(q,ctx.minQuality||0);
}
function gmSpecialMakeDrops(ctx,level,mapIdx){
 const chance=ctx.dropChance==null?.25:ctx.dropChance;
 if(Math.random()>chance)return [];
 const count=Math.max(1,ctx.dropCount||1),drops=[];
 for(let i=0;i<count;i++){
  const q=gmSpecialRollQuality(ctx),type=gmSpecialDropType(ctx);
  drops.push(makeItem(level,mapIdx,"normal",q,type));
 }
 return drops;
}
function gmSpecialApplyShopDiscount(levels){
 const n=Math.max(0,Math.floor(levels||0));
 if(!n)return 0;
 const before=state.shop.refreshIndex||0;
 state.shop.refreshIndex=Math.max(0,before-n);
 return before-state.shop.refreshIndex;
}
function gmSpecialFight(enemy){
 const ps=equippedStats();let ehp=enemy.hp,php=state.hp,logs=[],turn=0;
 while(php>0&&ehp>0&&turn<200){
  turn++;
  if(Math.random()*100<(enemy.dodge||0)){
   logs.push(`${enemy.name}閃避了你的攻擊。`);
  }else{
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
function gmSpecialBattlePage(enemy,special){
 const s=equippedStats(),hpPct=s.hp?state.hp/s.hp*100:0;
 return `<section class="combat-screen"><div class="combat-head">⚠ 特殊遭遇</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${state.playerName||"玩家"} Lv.${state.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard" style="border-color:#c99b45;box-shadow:0 0 22px rgba(201,155,69,.22);background:linear-gradient(180deg,rgba(201,155,69,.10),rgba(0,0,0,0))"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">✦ ${special.name} Lv.${enemy.level}</h2><div class="muted" style="margin:8px 0 5px">${special.description}</div><div class="muted" style="margin-bottom:12px">暴擊 ${enemy.crit||0}%　閃避 ${enemy.dodge||0}%</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${enemy.hp} / ${enemy.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">特殊戰鬥開始</div></section>`;
}
function gmSpecialResultHtml(special,result){
 const sandbox=`<div class="notice" style="margin-bottom:10px"><b>GM 沙盒測試</b><div class="muted" style="margin-top:5px">以下為本次測試結果；按下確認後，所有角色與遊戲資料都會還原為測試前狀態。</div></div>`;
 if(!result.win){
  const lost=result.penalty?.dropped;
  return `${sandbox}<div class="notice"><b>特殊遭遇失敗</b></div><div class="stats" style="margin-top:10px"><div class="stat">EXP 損失<b>${result.penalty?.expLost||0}</b></div><div class="stat">裝備遺失<b>${lost?itemHtmlPlain(lost):"無"}</b></div></div>`;
 }
 const drops=result.drops||[];
 const rewardLabel=result.rewardContext?.randomReward?.label;
 return `${sandbox}<div class="notice"><b>✦ ${special.name} 擊破</b>${rewardLabel?`<div class="muted" style="margin-top:5px">神秘旅人獎勵：${rewardLabel}</div>`:""}</div><div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${result.xp}</b></div><div class="stat">金幣<b>+${result.gold}</b></div></div>${result.shopDown?`<div class="notice" style="margin-top:10px">商店刷新價格降低 ${result.shopDown} 級。</div>`:""}<div style="margin-top:12px"><b>特殊獎勵</b>${drops.length?drops.map(x=>`<div class="item">${itemHtml(x.item,true)}<div class="muted">${x.sold?`自動出售 +${x.sold} 金幣`:"測試掉落"}</div></div>`).join(""):`<div class="muted" style="margin-top:6px">本次沒有裝備掉落。</div>`}</div>`;
}
function gmRestoreSpecialSandbox(){
 if(gmSpecialTestStateSnapshot){
  state=JSON.parse(gmSpecialTestStateSnapshot);
  upgradeDropNoticePending=gmSpecialTestUpgradeNoticeSnapshot;
  gmSpecialTestStateSnapshot=null;
  save(false);
 }
}
function gmCloseSpecialResult(){
 const modal=document.getElementById("battleResultModal");if(modal)modal.classList.remove("show");
 gmRestoreSpecialSandbox();
 gmSpecialTestActive=false;gmSpecialTestMonster=null;gmSpecialTestReward=null;view="settings";render();
}
async function gmStartSpecialBattle(){
 if(battleBusy)return;
 const id=document.getElementById("gmSpecialMonster")?.value,special=getSpecialMonsterById(id);
 if(!special)return alert("找不到特殊怪資料。");
 gmSpecialTestStateSnapshot=JSON.stringify(state);
 gmSpecialTestUpgradeNoticeSnapshot=upgradeDropNoticePending;
 battleBusy=true;gmSpecialTestActive=true;gmSpecialTestMonster=special;
 const level=Math.max(1,Math.min(50,state.level)),mapIdx=gmSpecialMapForLevel(level),playerSnapshot=equippedStats();
 const enemy=buildSpecialMonsterFromPlayer(playerSnapshot,special,level),ctx=getSpecialRewardContext(special);
 gmSpecialTestReward=ctx;
 state.hp=playerSnapshot.hp;
 document.getElementById("main").innerHTML=gmSpecialBattlePage(enemy,special);
 await sleep(120);
 const startHp=state.hp,playerMax=playerSnapshot.hp,r=gmSpecialFight(enemy);
 await animateFight(r,startHp,playerMax,enemy.hp,"");
 let result={win:r.win,rewardContext:ctx,drops:[],xp:0,gold:0,shopDown:0,penalty:null};
 if(r.win){
  const baseXp=ceil(sameExp(level)*expLevelFactor(level,state.level));
  const baseGold=goldBase(level);
  result.xp=ceil(baseXp*(ctx.expMultiplier||1));
  result.gold=ceil(baseGold*(ctx.goldMultiplier||1));
  state.gold+=result.gold;gainExp(result.xp,[]);
  const items=gmSpecialMakeDrops(ctx,level,mapIdx);
  result.drops=items.map(item=>{const ir=addItem(item);return {item,sold:ir.sold||0};});
  result.shopDown=gmSpecialApplyShopDiscount(ctx.shopRefreshDown);
 }else{
  result.penalty=applyDeathPenalty([]);
 }
 battleBusy=false;
 const modal=document.getElementById("battleResultModal"),title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail");
 if(title)title.textContent=r.win?"特殊遭遇完成":"特殊遭遇失敗";
 if(detail)detail.innerHTML=gmSpecialResultHtml(special,result);
 const btn=modal?.querySelector(".controls .btn.primary");if(btn)btn.onclick=gmCloseSpecialResult;
 if(modal)modal.classList.add("show");
}
