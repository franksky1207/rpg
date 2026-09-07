const MONSTER_TRAITS={
 strong:{name:"強壯",desc:"HP +20%",color:"#79c982",border:"#4d8455"},
 ferocious:{name:"兇猛",desc:"攻擊 +15%",color:"#ff7d73",border:"#9c4c46"},
 hard:{name:"堅硬",desc:"防禦 +20%",color:"#8fb3d9",border:"#536e89"},
 swift:{name:"迅捷",desc:"閃避 +8%",color:"#69d9d0",border:"#3e8984"},
 deadly:{name:"致命",desc:"暴擊 +8%",color:"#c58aff",border:"#76529b"},
 berserk:{name:"狂暴",desc:"HP 低於 50% 時攻擊 +20%",color:"#ff9d5c",border:"#9d6038"},
 giant:{name:"巨體",desc:"HP +30%、攻擊 +5%、閃避 -5%",color:"#d9c36b",border:"#88793f"}
};
const MONSTER_TRAIT_IDS=Object.keys(MONSTER_TRAITS);
const baseMonsterObj=monsterObj;
let monsterPreviewCache={};
let currentCombatEncounter=null;
let inventoryFromAdventure=false;

function traitCountForKind(kind){
 let r=Math.random()*100;
 if(kind==="boss")return r<15?0:r<70?1:2;
 if(kind==="elite")return r<35?0:r<85?1:2;
 return r<70?0:r<95?1:2;
}
function rollMonsterTraits(kind){
 let count=traitCountForKind(kind),pool=MONSTER_TRAIT_IDS.slice(),out=[];
 for(let i=0;i<count&&pool.length;i++){
  let n=Math.floor(Math.random()*pool.length);out.push(pool.splice(n,1)[0]);
 }
 return out;
}
function applyMonsterTraits(enemy,traitIds){
 let e={...enemy,traits:traitIds.slice(),crit:0,dodge:0,berserk:false};
 traitIds.forEach(id=>{
  if(id==="strong")e.hp=ceil(e.hp*1.20);
  if(id==="ferocious")e.atk=ceil(e.atk*1.15);
  if(id==="hard")e.def=ceil(e.def*1.20);
  if(id==="swift")e.dodge+=8;
  if(id==="deadly")e.crit+=8;
  if(id==="berserk")e.berserk=true;
  if(id==="giant"){e.hp=ceil(e.hp*1.30);e.atk=ceil(e.atk*1.05);e.dodge-=5;}
 });
 e.crit=round1(Math.max(0,Math.min(MAX_CRIT_RATE,e.crit)));
 e.dodge=round1(Math.max(0,Math.min(MAX_DODGE_RATE,e.dodge)));
 return e;
}
function createMonsterEncounter(mapIdx,eIdx){
 let base=baseMonsterObj(mapIdx,eIdx);
 return applyMonsterTraits(base,rollMonsterTraits(base.kind));
}
function previewKey(mapIdx,eIdx){return `${mapIdx}:${eIdx}`}
function getPreviewEncounter(mapIdx,eIdx){
 let k=previewKey(mapIdx,eIdx);if(!monsterPreviewCache[k])monsterPreviewCache[k]=createMonsterEncounter(mapIdx,eIdx);return monsterPreviewCache[k];
}
function clearPreviewEncounter(mapIdx,eIdx){delete monsterPreviewCache[previewKey(mapIdx,eIdx)]}
function traitDetailsHtml(traits){
 if(!traits?.length)return "";
 return `<div class="trait-details">${traits.map(id=>{let t=MONSTER_TRAITS[id];return `<div class="trait-detail-row"><span class="trait-detail-name" style="border-color:${t.border};color:${t.color}">${t.name}</span><span class="trait-detail-desc">${t.desc}</span></div>`}).join("")}</div>`;
}

window.monsterObj=function(mapIdx,eIdx){return getPreviewEncounter(mapIdx,eIdx)};

const baseGoForAdventureInventory=go;
go=function(v){inventoryFromAdventure=false;return baseGoForAdventureInventory(v)};
function openAdventureInventory(){inventoryFromAdventure=true;view="inventory";render()}
function backToAdventureFromInventory(){inventoryFromAdventure=false;view="adventure";adventureScreen="prepare";render()}
const baseInventoryPageForAdventure=inventoryPage;
inventoryPage=function(){
 let html=baseInventoryPageForAdventure();
 if(!inventoryFromAdventure)return html;
 return html.replace(`onclick="go('home')"`,`onclick="backToAdventureFromInventory()"`).replace("← 返回主頁","← 返回冒險");
};

function enterMap(i){
 if(i>state.unlockedMap)return;
 monsterPreviewCache={};currentCombatEncounter=null;selectedMap=i;selectedEnemy=0;selectedBattleCount=1;adventureScreen="prepare";render();
}
function selectEnemy(i){
 if(!enemyUnlocked(selectedMap,i))return;
 selectedEnemy=i;let e=getPreviewEncounter(selectedMap,selectedEnemy);if(e.kind==="boss")selectedBattleCount=1;render();
}
function adventurePreparePage(){
 selectedMap=Math.min(selectedMap,state.unlockedMap);
 let highest=highestUnlockedEnemy(selectedMap);if(selectedEnemy>highest)selectedEnemy=highest;
 let map=MAPS[selectedMap],e=getPreviewEncounter(selectedMap,selectedEnemy);
 let maxBattles=state.level<=5?1:state.level<=20?5:state.level<=35?10:15;
 if(selectedBattleCount>maxBattles)selectedBattleCount=maxBattles;
 let counts=e.kind==="boss"?[1]:[1,5,10,15].filter(x=>x<=maxBattles);
 let enemies=map.enemies.map((x,i)=>{
  if(!enemyUnlocked(selectedMap,i))return "";
  let mo=getPreviewEncounter(selectedMap,i),badge=mo.kind==="elite"?`<span class="badge elite">菁英</span>`:mo.kind==="boss"?`<span class="badge boss">Boss</span>`:"";
  return `<button class="enemy-card ${i===selectedEnemy?"active":""}" onclick="selectEnemy(${i})"><b>${mo.name} Lv.${mo.level}</b>${badge}${traitDetailsHtml(mo.traits)}<div class="enemy-meta">HP ${mo.hp}　ATK ${mo.atk}　DEF ${mo.def}</div></button>`;
 }).join("");
 return `<section class="prepare-screen"><div class="page-top"><button class="btn back-btn" onclick="backToMaps()">← 返回冒險地圖</button><h2 class="page-title">${map.name}</h2><span></span></div><div class="prepare-layout">${playerStatusHtml()}<div class="card prepare-main"><h3>選擇怪物</h3><div class="enemy-grid">${enemies}</div>${mapProgressHtml(selectedMap)}<h3 class="battle-count-title">戰鬥次數</h3><div class="count-grid">${counts.map(n=>`<button class="count-card ${n===selectedBattleCount?"active":""}" onclick="setBattleCount(${n},this)">${n===1?"單場":n+" 場"}</button>`).join("")}</div><div class="prepare-actions"><button class="btn primary" onclick="startBattles()">${e.kind==="boss"?"挑戰 Boss":"開始戰鬥"}</button><button class="btn blue" onclick="openAdventureInventory()">背包</button><button class="btn ok" onclick="rest()">回城休息</button></div></div></div></section>`;
}
function adventureCombatPage(){
 let e=currentCombatEncounter||getPreviewEncounter(selectedMap,selectedEnemy),s=equippedStats(),need=state.level<50?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<50?Math.min(100,state.exp/need*100):100;
 return `<section class="combat-screen"><div class="combat-head">${combatTotal>1?`第 ${combatRound} / ${combatTotal} 場`:`單場戰鬥`}</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>玩家 Lv.${state.level}</h2><div class="muted">金幣 ${state.gold.toLocaleString()}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div><div class="xp-block"><div class="status-label"><span>EXP</span><span>${state.level>=50?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name} Lv.${e.level}</h2>${traitDetailsHtml(e.traits)}<div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備戰鬥</div></section>`;
}

function fightOnce(mapIdx,eIdx,encounter=null){
 if(!enemyUnlocked(mapIdx,eIdx)){
  if(eIdx===4&&state.bossLocked?.[mapIdx])return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
  return {ok:false,reason:"這隻怪物尚未解鎖。"};
 }
 let e=encounter||createMonsterEncounter(mapIdx,eIdx);
 if(e.kind==="boss"&&!canBoss(mapIdx))return {ok:false,reason:`Boss 挑戰暫時鎖定，請先擊敗本地圖菁英怪 10 隻（${state.bossProgress[mapIdx]||0}/10）。`};
 let ps=equippedStats(),ehp=e.hp,php=state.hp,logs=[],turn=0;
 while(php>0&&ehp>0&&turn<200){
  turn++;
  if(Math.random()*100<e.dodge){logs.push(`你攻擊${e.name}，${e.name}閃避了攻擊。`)}
  else{
   let pd=calcDamage(ps.atk,e.def),crit=Math.random()*100<ps.crit;if(crit)pd=ceil(pd*CRIT_DAMAGE_MULTIPLIER);
   ehp-=pd;logs.push(crit?`你攻擊${e.name}，暴擊造成 ${pd} 點傷害。`:`你攻擊${e.name}，造成 ${pd} 點傷害。`);
  }
  if(ehp<=0)break;
  if(Math.random()*100<ps.dodge){logs.push(`${e.name}攻擊你，你閃避了攻擊。`);continue}
  let enemyAtk=e.berserk&&ehp/e.hp<.5?ceil(e.atk*1.20):e.atk;
  let ed=calcDamage(enemyAtk,ps.def),enemyCrit=Math.random()*100<e.crit;if(enemyCrit)ed=ceil(ed*CRIT_DAMAGE_MULTIPLIER);
  php-=ed;logs.push(enemyCrit?`${e.name}攻擊你，暴擊造成 ${ed} 點傷害。`:`${e.name}攻擊你，造成 ${ed} 點傷害。`);
 }
 state.hp=Math.max(0,php);
 if(php<=0){
  logs.push(`你被${e.name}擊敗。`);
  if(e.kind==="boss"){state.bossLocked[mapIdx]=true;state.bossProgress[mapIdx]=0;logs.push(`Boss 再挑戰已鎖定：需再擊敗本地圖菁英怪 10 隻。`)}
  let penalty=applyDeathPenalty(logs);save(false);return {ok:true,win:false,logs,e,penalty};
 }
 let xp=expReward(e),gold=goldReward(e);state.gold+=gold;gainExp(xp,logs);
 if(e.kind==="boss"){
  let first=!state.bossKilled[mapIdx];state.bossKilled[mapIdx]=true;state.bossLocked[mapIdx]=false;state.bossProgress[mapIdx]=0;
  if(first&&mapIdx<9){state.unlockedMap=Math.max(state.unlockedMap,mapIdx+1);freeShopRefresh(mapIdx+1)}
 }else{progressEnemyKill(mapIdx,eIdx);addProgress(mapIdx,e.kind)}
 let it=dropItem(e,mapIdx),ir=addItem(it);
 logs.push(`${e.name}被擊敗。獲得 EXP +${xp}、金幣 +${gold}。`);
 if(e.kind==="normal"&&eIdx<2&&state.mapProgress[mapIdx][eIdx]===10)logs.push(`新敵人已出現：${MAPS[mapIdx].enemies[eIdx+1][0]}。`);
 if(e.kind==="normal"&&eIdx===2&&state.mapProgress[mapIdx][2]===10)logs.push(`菁英敵人已出現：${MAPS[mapIdx].enemies[3][0]}。`);
 if(e.kind==="elite"&&!state.bossKilled[mapIdx]&&!state.bossLocked[mapIdx]&&state.mapProgress[mapIdx][3]>=10)logs.push(state.level>=MAPS[mapIdx].max?`Boss 已出現：${MAPS[mapIdx].enemies[4][0]}。`:`菁英進度完成；達到 Lv.${MAPS[mapIdx].max} 後 Boss 才會出現。`);
 if(e.kind==="elite"&&state.bossLocked[mapIdx])logs.push(`Boss 再挑戰進度：${state.bossProgress[mapIdx]}/10 菁英。`);
 if(e.kind==="elite"&&!state.bossLocked[mapIdx]&&state.bossProgress[mapIdx]>=10)logs.push(`Boss 已重新開放，可以再次挑戰。`);
 if(it)logs.push(`${ir.sold?`自動出售 ${itemHtmlPlain(it)}，金幣 +${ir.sold}`:`獲得裝備 ${itemHtmlPlain(it)}`}`);
 save(false);return {ok:true,win:true,logs,e,xp,gold,item:it,sold:ir.sold};
}

function flashCombatText(target,text){
 let card=document.getElementById(target==="enemy"?"combatEnemyCard":"combatPlayerCard"),dmg=document.getElementById(target==="enemy"?"combatEnemyDamage":"combatPlayerDamage");
 if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260)}
 if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show")}
}
async function animateFight(r,startPlayerHp,playerMax,enemyMax,roundText=""){
 let ehp=enemyMax,php=startPlayerHp;
 setCombatHp(ehp,enemyMax,php,playerMax,roundText?`${roundText}・開始戰鬥`:"開始戰鬥");await sleep(180);
 for(let line of r.logs){
  let m=line.match(/^你攻擊.+，暴擊造成 (\d+) 點傷害。$/);
  if(m){attackMotion("player");await sleep(120);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`暴擊！你造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^你攻擊.+，造成 (\d+) 點傷害。$/);
  if(m){attackMotion("player");await sleep(120);ehp=Math.max(0,ehp-(+m[1]));flashCombatText("enemy",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`你造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^你攻擊.+，.+閃避了攻擊。$/);
  if(m){attackMotion("player");await sleep(120);flashCombatText("enemy","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}閃避了你的攻擊`);await sleep(190);continue}
  m=line.match(/^.+攻擊你，暴擊造成 (\d+) 點傷害。$/);
  if(m){attackMotion("enemy");await sleep(120);php=Math.max(0,php-(+m[1]));flashCombatText("player",`暴擊 -${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}暴擊造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^.+攻擊你，造成 (\d+) 點傷害。$/);
  if(m){attackMotion("enemy");await sleep(120);php=Math.max(0,php-(+m[1]));flashCombatText("player",`-${m[1]}`);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^.+攻擊你，你閃避了攻擊。$/);
  if(m){attackMotion("enemy");await sleep(120);flashCombatText("player","閃避");setCombatHp(ehp,enemyMax,php,playerMax,`你閃避了${r.e.name}的攻擊`);await sleep(190)}
 }
 setCombatHp(ehp,enemyMax,php,playerMax,r.win?"戰鬥勝利！":"戰敗！");await sleep(250);
}

function beginCombat(count){
 combatRound=1;combatTotal=count;currentCombatEncounter=getPreviewEncounter(selectedMap,selectedEnemy);adventureScreen="combat";render();setTimeout(()=>runBattles(count),60);
}
async function runBattles(count,ctx=null){
 if(battleBusy)return;
 battleBusy=true;
 if(!ctx)ctx={wins:0,totalXp:0,totalGold:0,items:[],originalCount:count,completed:0,remaining:count};
 let defeat=null;
 for(let local=1;local<=count;local++){
  let encounter=currentCombatEncounter||createMonsterEncounter(selectedMap,selectedEnemy);currentCombatEncounter=encounter;
  combatRound=ctx.completed+1;combatTotal=ctx.originalCount;adventureScreen="combat";render();await sleep(60);
  let psBefore=equippedStats(),startPlayerHp=state.hp,r=fightOnce(selectedMap,selectedEnemy,encounter);
  if(!r.ok){alert(r.reason);break}
  await animateFight(r,startPlayerHp,psBefore.hp,encounter.hp,ctx.originalCount>1?`第 ${combatRound} / ${ctx.originalCount} 場`:"");
  if(r.win){ctx.wins++;ctx.totalXp+=r.xp;ctx.totalGold+=r.gold;if(r.item)ctx.items.push({item:r.item,sold:r.sold||0})}else defeat=r;
  ctx.completed++;ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);save();clearPreviewEncounter(selectedMap,selectedEnemy);currentCombatEncounter=null;
  if(!r.win)break;
  if(ctx.originalCount>1&&ctx.remaining>0&&lowHp()){render();pendingContinuousBattle=ctx;battleBusy=false;showRiskModal("continuous",ctx.remaining);return}
  if(ctx.remaining>0){currentCombatEncounter=createMonsterEncounter(selectedMap,selectedEnemy);await sleep(r.e.kind==="elite"?220:140)}
 }
 battleBusy=false;save();render();setTimeout(()=>showBattleResult(ctx,defeat),0);
}

render();