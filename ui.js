let selectedBattleCount=1;
let pendingBattleCount=1;
let adventureScreen="maps";
let riskMode="initial";
let pendingContinuousBattle=null;
let pendingResultAfterRest=null;
let combatRound=1;
let combatTotal=1;
let gmTapCount=0;
let gmTapTimer=null;

function compactMobileDom(){
 const mobile=window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
 document.querySelectorAll(".map-progress-fold").forEach(el=>{if(!mobile)el.open=true});
 if(mobile){
  document.querySelectorAll(".enemy-meta").forEach(el=>{
   let m=el.textContent.match(/HP\s*(\d+).*攻擊\s*(\d+).*防禦\s*(\d+)/s);
   if(m)el.textContent=`HP ${m[1]}　ATK ${m[2]}　DEF ${m[3]}`;
  });
 }
}

function renderNav(){
 const top=document.getElementById("topNav"),bottom=document.getElementById("bottomNav");
 if(top)top.innerHTML="";
 if(bottom)bottom.innerHTML="";
}
function go(v){if(v==="adventure")adventureScreen="maps";view=v;render()}
function render(){
 renderNav();normalizeHP();
 let fn={home:homePage,adventure:adventurePage,character:characterPage,inventory:inventoryPage,shop:shopPage,settings:settingsPage}[view];
 document.getElementById("main").innerHTML=fn();wireSettings();setTimeout(compactMobileDom,0);
}
function qualityLegend(){return `<div class="muted quality-legend" style="margin:6px 0 12px">品質：<span class="q-common">普通</span>／<span class="q-uncommon">優良</span>／<span class="q-rare">稀有</span>／<span class="q-epic">史詩</span>／<span class="q-legendary">傳說</span>／<span class="q-mythic">神話</span></div>`}
function homeBackHtml(){return `<div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>`}
function wrapFunctionPage(html){return `<div class="function-page">${homeBackHtml()}${html}</div>`}

function homePage(){
 return `<section class="home-screen">
  <div class="home-title"><h2>純文字 RPG</h2><div class="muted">打怪、升級、換裝，前往更強的地圖。</div></div>
  <div class="menu-grid">
   <button class="menu-card" onclick="go('adventure')"><b>冒險</b><span>選擇地圖並挑戰怪物</span></button>
   <button class="menu-card" onclick="go('character')"><b>角色</b><span>查看能力與目前裝備</span></button>
   <button class="menu-card" onclick="go('inventory')"><b>背包</b><span>整理、裝備與出售道具</span></button>
   <button class="menu-card" onclick="go('shop')"><b>商店</b><span>購買裝備與贖回遺失裝備</span></button>
   <button class="menu-card" onclick="go('settings')"><b>設定</b><span>自動出售、存檔與遊戲設定</span></button>
  </div>
 </section>`;
}

function playerStatusHtml(){
 let s=equippedStats(),need=state.level<50?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<50?Math.min(100,state.exp/need*100):100,low=hpPct<50;
 return `<div class="card player-status-card"><div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div></div><div class="status-line ${low?"q-mythic":""}"><div class="status-label"><span>HP${low?"　⚠ 低血量":""}</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div class="status-line"><div class="status-label"><span>EXP</span><span>${state.level>=50?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
}
function mapProgressHtml(mapIdx){
 let p=state.mapProgress[mapIdx]||[0,0,0,0],map=MAPS[mapIdx];
 let bossText=state.bossLocked?.[mapIdx]?`需再擊敗菁英 ${state.bossProgress[mapIdx]||0}/10`:state.bossKilled[mapIdx]?"已擊敗・可再次挑戰":enemyUnlocked(mapIdx,4)?"可挑戰":"未出現";
 let rows=[
  `${map.enemies[0][0]}：${Math.min(10,p[0])}/10`,
  `${map.enemies[1][0]}：${enemyUnlocked(mapIdx,1)?Math.min(10,p[1])+"/10":"未出現"}`,
  `${map.enemies[2][0]}：${enemyUnlocked(mapIdx,2)?Math.min(10,p[2])+"/10":"未出現"}`,
  `${map.enemies[3][0]}：${enemyUnlocked(mapIdx,3)?Math.min(10,p[3])+"/10":"未出現"}`,
  `${map.enemies[4][0]}：${bossText}`
 ];
 return `<details class="map-progress-fold"><summary>地圖推進</summary><div class="notice">${rows.join("　｜　")}</div></details>`;
}
function mapStatusText(i){
 if(i>state.unlockedMap)return "未解鎖";
 if(state.bossKilled[i])return "已通關";
 let h=highestUnlockedEnemy(i);
 if(h===0)return "攻略中・第 1 隻怪";
 if(h===1)return "攻略中・第 2 隻怪";
 if(h===2)return "攻略中・第 3 隻怪";
 if(h===3)return "攻略中・菁英";
 return state.level>=MAPS[i].max?"Boss 可挑戰":"等待達到 Boss 等級";
}
function adventureMapPage(){
 return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險地圖</h2><span></span></div><div class="map-grid">${MAPS.map((m,i)=>{let locked=i>state.unlockedMap,status=mapStatusText(i),cleared=state.bossKilled[i];return `<button class="map-card ${locked?"locked":""} ${cleared?"cleared":""}" ${locked?"disabled":""} onclick="enterMap(${i})"><b>${i+1}. ${m.name}</b><div class="muted">Lv.${m.min}～${m.max}</div><div class="map-status">${status}</div></button>`;}).join("")}</div></section>`;
}
function enterMap(i){if(i>state.unlockedMap)return;selectedMap=i;selectedEnemy=0;selectedBattleCount=1;adventureScreen="prepare";render()}
function backToMaps(){adventureScreen="maps";render()}
function setBattleCount(n,el){selectedBattleCount=n;document.querySelectorAll(".count-card").forEach(b=>b.classList.remove("active"));if(el)el.classList.add("active")}
function selectEnemy(i){if(!enemyUnlocked(selectedMap,i))return;selectedEnemy=i;let e=monsterObj(selectedMap,selectedEnemy);if(e.kind==="boss")selectedBattleCount=1;render()}
function adventurePreparePage(){
 selectedMap=Math.min(selectedMap,state.unlockedMap);
 let highest=highestUnlockedEnemy(selectedMap);if(selectedEnemy>highest)selectedEnemy=highest;
 let map=MAPS[selectedMap],e=monsterObj(selectedMap,selectedEnemy);
 let maxBattles=state.level<=5?1:state.level<=20?5:state.level<=35?10:15;
 if(selectedBattleCount>maxBattles)selectedBattleCount=maxBattles;
 let counts=e.kind==="boss"?[1]:[1,5,10,15].filter(x=>x<=maxBattles);
 let enemies=map.enemies.map((x,i)=>{if(!enemyUnlocked(selectedMap,i))return "";let mo=monsterObj(selectedMap,i),badge=mo.kind==="elite"?`<span class="badge elite">菁英</span>`:mo.kind==="boss"?`<span class="badge boss">Boss</span>`:"";return `<button class="enemy-card ${i===selectedEnemy?"active":""}" onclick="selectEnemy(${i})"><b>${mo.name} Lv.${mo.level}</b>${badge}<div class="enemy-meta">HP ${mo.hp}　ATK ${mo.atk}　DEF ${mo.def}</div></button>`;}).join("");
 return `<section class="prepare-screen"><div class="page-top"><button class="btn back-btn" onclick="backToMaps()">← 返回冒險地圖</button><h2 class="page-title">${map.name}</h2><span></span></div><div class="prepare-layout">${playerStatusHtml()}<div class="card prepare-main"><h3>選擇怪物</h3><div class="enemy-grid">${enemies}</div>${mapProgressHtml(selectedMap)}<h3 class="battle-count-title">戰鬥次數</h3><div class="count-grid">${counts.map(n=>`<button class="count-card ${n===selectedBattleCount?"active":""}" onclick="setBattleCount(${n},this)">${n===1?"單場":n+" 場"}</button>`).join("")}</div><div class="prepare-actions"><button class="btn primary" onclick="startBattles()">${e.kind==="boss"?"挑戰 Boss":"開始戰鬥"}</button><button class="btn ok" onclick="rest()">回城休息</button></div></div></div></section>`;
}
function adventureCombatPage(){
 let e=monsterObj(selectedMap,selectedEnemy),s=equippedStats(),need=state.level<50?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<50?Math.min(100,state.exp/need*100):100;
 return `<section class="combat-screen"><div class="combat-head">${combatTotal>1?`第 ${combatRound} / ${combatTotal} 場`:`單場戰鬥`}</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>玩家 Lv.${state.level}</h2><div class="muted">金幣 ${state.gold.toLocaleString()}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div><div class="xp-block"><div class="status-label"><span>EXP</span><span>${state.level>=50?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name} Lv.${e.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備戰鬥</div></section>`;
}
function adventurePage(){if(adventureScreen==="maps")return adventureMapPage();if(adventureScreen==="combat")return adventureCombatPage();return adventurePreparePage()}

function lowHp(){let s=equippedStats();return s.hp>0&&state.hp/s.hp<.5}
function closeRiskModal(){let m=document.getElementById("riskModal");if(m)m.classList.remove("show")}
function showRiskModal(mode,remaining=0){
 riskMode=mode;
 let modal=document.getElementById("riskModal"),msg=document.getElementById("riskMessage"),continueBtn=document.getElementById("riskContinueBtn");
 if(mode==="continuous"){
  if(msg)msg.innerHTML=`目前 HP 已低於 50%。連續戰鬥已暫停，尚有 <b>${remaining}</b> 場。<br>若繼續後戰敗，將損失目前等級升級所需 EXP 的 10%，並有 30% 機率遺失目前裝備中的 1 件。`;
  if(continueBtn)continueBtn.textContent=`繼續剩餘 ${remaining} 場`;
 }else{
  if(msg)msg.innerHTML=`目前 HP 已低於 50%。<br>若戰敗，將損失目前等級升級所需 EXP 的 10%，並有 30% 機率遺失目前裝備中的 1 件。`;
  if(continueBtn)continueBtn.textContent="仍要繼續戰鬥";
 }
 if(modal)modal.classList.add("show");
}
function beginCombat(count){combatRound=1;combatTotal=count;adventureScreen="combat";render();setTimeout(()=>runBattles(count),60)}
function startBattles(){
 if(battleBusy)return;
 let e=monsterObj(selectedMap,selectedEnemy),count=e.kind==="boss"?1:selectedBattleCount;
 if(lowHp()){pendingBattleCount=count;pendingContinuousBattle=null;showRiskModal("initial");return}
 beginCombat(count);
}
function continueRiskBattle(){
 closeRiskModal();
 if(riskMode==="continuous"&&pendingContinuousBattle){let ctx=pendingContinuousBattle;pendingContinuousBattle=null;adventureScreen="combat";render();setTimeout(()=>runBattles(ctx.remaining,ctx),60);return}
 beginCombat(pendingBattleCount||1);
}
function setCombatHp(enemyHp,enemyMax,playerHp,playerMax,message){
 let eb=document.getElementById("combatEnemyBar"),eh=document.getElementById("combatEnemyHp"),pb=document.getElementById("combatPlayerBar"),ph=document.getElementById("combatPlayerHp"),msg=document.getElementById("combatMessage");
 if(eb)eb.style.width=`${Math.max(0,Math.min(100,enemyHp/enemyMax*100))}%`;
 if(eh)eh.textContent=`${Math.max(0,enemyHp)} / ${enemyMax}`;
 if(pb)pb.style.width=`${Math.max(0,Math.min(100,playerHp/playerMax*100))}%`;
 if(ph)ph.textContent=`${Math.max(0,playerHp)} / ${playerMax}`;
 if(msg)msg.textContent=message;
}
function flashDamage(target,amount){
 let card=document.getElementById(target==="enemy"?"combatEnemyCard":"combatPlayerCard"),dmg=document.getElementById(target==="enemy"?"combatEnemyDamage":"combatPlayerDamage");
 if(card){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260)}
 if(dmg){dmg.textContent=`-${amount}`;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show")}
}
function attackMotion(attacker){
 let card=document.getElementById(attacker==="player"?"combatPlayerCard":"combatEnemyCard");
 if(card){card.classList.remove("attacking");void card.offsetWidth;card.classList.add("attacking");setTimeout(()=>card.classList.remove("attacking"),340)}
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function animateFight(r,startPlayerHp,playerMax,enemyMax,roundText=""){
 let ehp=enemyMax,php=startPlayerHp;
 setCombatHp(ehp,enemyMax,php,playerMax,roundText?`${roundText}・開始戰鬥`:"開始戰鬥");
 await sleep(180);
 for(let line of r.logs){
  let m=line.match(/^你攻擊.+，造成 (\d+) 點傷害。$/);
  if(m){attackMotion("player");await sleep(120);ehp=Math.max(0,ehp-(+m[1]));flashDamage("enemy",m[1]);setCombatHp(ehp,enemyMax,php,playerMax,`你造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190);continue}
  m=line.match(/^.+攻擊你，造成 (\d+) 點傷害。$/);
  if(m){attackMotion("enemy");await sleep(120);php=Math.max(0,php-(+m[1]));flashDamage("player",m[1]);setCombatHp(ehp,enemyMax,php,playerMax,`${r.e.name}造成 ${m[1]} 點傷害`);await sleep(r.e.kind==="boss"?260:190)}
 }
 setCombatHp(ehp,enemyMax,php,playerMax,r.win?"戰鬥勝利！":"戰敗！");
 await sleep(250);
}
function dropListHtml(items){
 if(!items.length)return `<div class="muted">裝備：無</div>`;
 return `<div style="margin-top:10px"><b>裝備</b>${items.map(x=>`<div class="item">${itemHtml(x.item,true)}<div class="muted">${statLine(x.item)}${x.sold?`　・自動出售 +${x.sold} 金幣`:""}</div></div>`).join("")}</div>`;
}
function showBattleResult(ctx,defeat=null){
 let title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
 if(!title||!detail||!modal)return;
 if(defeat){
  title.textContent="戰鬥失敗";
  let lost=defeat.penalty?.dropped;
  detail.innerHTML=`<div class="item"><b>EXP 損失：${defeat.penalty?.expLost||0}</b></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}<div class="muted">${statLine(lost)}</div></div><div class="muted">已移至商店的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
 }else{
  title.textContent=ctx.originalCount>1?"連續戰鬥結算":"戰鬥勝利";
  detail.innerHTML=`${ctx.originalCount>1?`<div class="item"><b>勝利 ${ctx.wins} / ${ctx.originalCount} 場</b></div>`:""}<div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${ctx.totalXp}</b></div><div class="stat">金幣<b>+${ctx.totalGold}</b></div></div>${dropListHtml(ctx.items)}`;
 }
 modal.classList.add("show");
}
function closeBattleResultModal(){let modal=document.getElementById("battleResultModal");if(modal)modal.classList.remove("show");adventureScreen="prepare";render()}
function riskRest(){
 if(riskMode==="continuous"&&pendingContinuousBattle){pendingResultAfterRest=pendingContinuousBattle;pendingContinuousBattle=null}
 closeRiskModal();state.hp=equippedStats().hp;adventureScreen="prepare";save();render();
 if(pendingResultAfterRest){let ctx=pendingResultAfterRest;pendingResultAfterRest=null;setTimeout(()=>showBattleResult(ctx),0)}
}
async function runBattles(count,ctx=null){
 if(battleBusy)return;
 battleBusy=true;
 if(!ctx)ctx={wins:0,totalXp:0,totalGold:0,items:[],originalCount:count,completed:0,remaining:count};
 let defeat=null;
 for(let local=1;local<=count;local++){
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
}

function characterPage(){
 let s=equippedStats(),need=state.level<50?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<50?Math.min(100,state.exp/need*100):100;
 let stats=`<div class="card character-stats-card"><h2>角色</h2><div class="grid3 character-stats-grid"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div><div class="stat">總攻擊<b>${s.atk}</b></div><div class="stat">總防禦<b>${s.def}</b></div></div><div style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:10px"><span>HP</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:10px"><span>EXP</span><span>${state.level>=50?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
 let equips=`<div class="card character-equipment-card"><h3>目前裝備</h3>${qualityLegend()}<div class="item">武器：${itemHtml(state.equipment.weapon,true)}</div><div class="item">防具：${itemHtml(state.equipment.armor,true)}</div><div class="item">飾品：${itemHtml(state.equipment.accessory,true)}</div></div>`;
 return wrapFunctionPage(`<div class="character-layout">${stats}${equips}</div>`);
}
function inventoryContent(){
 let items=state.inventory.slice().sort((a,b)=>b.q-a.q||b.level-a.level),sel=items.find(x=>x.id===selectedItem)||items[0];selectedItem=sel?.id||null;
 return `<div class="grid"><div class="card"><h3>目前裝備</h3>${qualityLegend()}${["weapon","armor","accessory"].map(t=>`<div class="item">${t==="weapon"?"武器":t==="armor"?"防具":"飾品"}<br>${itemHtml(state.equipment[t])}</div>`).join("")}</div>
 <div class="card"><h2>背包（${state.inventory.length} 件）</h2>${qualityLegend()}<div class="controls"><button class="btn blue" onclick="equipBestAll()">一鍵裝備較強裝備</button><button class="btn" onclick="sellLowerAll()">一鍵賣出較低裝備</button></div>${items.length?`<div style="overflow:auto"><table><thead><tr><th>裝備</th><th>類型</th><th>能力</th><th>售價</th></tr></thead><tbody>${items.map(it=>`<tr onclick="selectItem('${it.id}')" style="cursor:pointer;background:${it.id===selectedItem?"#211d16":"transparent"}"><td>${itemHtml(it,true)}</td><td>${it.type==="weapon"?"武器":it.type==="armor"?"防具":"飾品"}</td><td>${statLine(it)}</td><td>${it.sell}</td></tr>`).join("")}</tbody></table></div>${sel?compareHtml(sel):""}`:`<div class="muted">背包是空的。</div>`}</div></div>`;
}
function inventoryPage(){return wrapFunctionPage(inventoryContent())}
function equipBestAll(){
 let changed=0;
 ["weapon","armor","accessory"].forEach(type=>{
   let current=state.equipment[type],best=current,bestScore=equipmentScore(current);
   state.inventory.filter(it=>it.type===type).forEach(it=>{let sc=equipmentScore(it);if(sc>bestScore){best=it;bestScore=sc}});
   if(best&&best!==current){
     let idx=state.inventory.findIndex(it=>it.id===best.id);if(idx>=0){state.inventory.splice(idx,1);if(current)state.inventory.push(current);state.equipment[type]=best;changed++}
   }
 });
 normalizeHP();selectedItem=null;save();render();alert(changed?`已更換 ${changed} 件較強裝備。`:"目前裝備已是最佳。");
}
function sellLowerAll(){
 let targets=state.inventory.filter(it=>{
   if(it.q===5)return false;
   let current=state.equipment[it.type];if(!current)return false;
   return equipmentScore(it)<=equipmentScore(current);
 });
 if(!targets.length)return alert("沒有可出售的較低裝備。");
 let total=targets.reduce((a,it)=>a+(it.sell||0),0);
 if(!confirm(`將出售 ${targets.length} 件較低或同能力裝備，共獲得 ${total.toLocaleString()} 金幣。確定出售嗎？`))return;
 let ids=new Set(targets.map(it=>it.id));state.inventory=state.inventory.filter(it=>!ids.has(it.id));state.gold+=total;selectedItem=null;save();render();
 alert(`已出售 ${targets.length} 件裝備，獲得 ${total.toLocaleString()} 金幣。`);
}
function compareHtml(it){
 let old=state.equipment[it.type],diff=equipmentScore(it)-equipmentScore(old);
 return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3><div class="grid3"><div><div class="muted">目前</div>${itemHtml(old)}</div><div><div class="muted">新裝備</div>${itemHtml(it)}</div><div><div class="muted">整體比較</div><b style="color:${diff>0?"#76d587":diff<0?"#e27474":"#ccc"}">${diff>0?"+":""}${diff}</b></div></div><div class="controls"><button class="btn blue" onclick="equipSelected()">裝備</button><button class="btn" onclick="sellSelected()">出售</button></div></div>`;
}
function selectItem(id){selectedItem=id;render()}
function equipSelected(){let i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return;let it=state.inventory.splice(i,1)[0],old=state.equipment[it.type];state.equipment[it.type]=it;if(old)state.inventory.push(old);normalizeHP();save();render()}
function sellSelected(){let i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return;let it=state.inventory[i];if(it.q===5&&!confirm("這是神話裝備，確定要出售嗎？"))return;state.inventory.splice(i,1);state.gold+=it.sell;selectedItem=null;save();render()}

function makeShopItems(mapIdx=currentShopMap()){
 let m=MAPS[mapIdx],arr=[];
 for(let i=0;i<3;i++){
  let lv=Math.max(m.min,Math.min(m.max,state.level+Math.floor(Math.random()*3)-1));
  let r=Math.random()*100,q=r<48?0:r<82?1:r<96?2:r<99.3?3:4;
  arr.push(makeItem(lv,mapIdx,"normal",q));
 }
 return arr;
}
function shopCooldownText(){
 let left=Math.max(0,(state.shop.resetAvailableAt||0)-Date.now());if(!left)return "可重置";
 let m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);return `${m} 分 ${String(s).padStart(2,"0")} 秒`;
}
function compareGearHtml(it,label="商品分數"){
 let current=state.equipment[it.type],itemScore=equipmentScore(it),currentScore=current?equipmentScore(current):null,diff=current?itemScore-currentScore:itemScore;
 let diffText=current?`${diff>0?"+":""}${diff}`:"目前無裝備";
 let diffColor=!current?"#e5cf9a":diff>0?"#76d587":diff<0?"#e27474":"#ccc";
 let currentHtml=current?`${itemHtml(current,true)}<div class="muted" style="margin-top:4px">分數 ${currentScore}</div>`:`<span class="muted">無</span>`;
 return `<div class="muted">目前</div>${currentHtml}<div style="margin-top:6px"><span class="muted">${label} ${itemScore}</span>　<b style="color:${diffColor}">${diffText}</b></div>`;
}
function discardLostGear(i){let lost=state.lostGear?.[i];if(!lost)return;state.lostGear.splice(i,1);save();render()}
function shopPage(){
 ensureShop();
 if(state.shop.items.length>3){state.shop.items=state.shop.items.slice(0,3);save(false)}
 let cost=shopRefreshCost(),maxed=(state.shop.refreshIndex||0)>=7,lost=state.lostGear||[];
 let rows=state.shop.items.map((it,i)=>`<tr><td>${itemHtml(it,true)}</td><td>${statLine(it)}</td><td>${compareGearHtml(it,"商品分數")}</td><td>${it.buy.toLocaleString()}</td><td><button class="btn" onclick="buyItem(${i})">購買</button></td></tr>`).join("");
 let lostRows=lost.map((x,i)=>`<tr><td>${itemHtml(x.item,true)}</td><td>${statLine(x.item)}</td><td>${compareGearHtml(x.item,"遺失裝備分數")}</td><td>${x.cost.toLocaleString()}</td><td><div class="controls" style="margin-top:0"><button class="btn" onclick="redeemGear(${i})">贖回</button><button class="btn danger" onclick="discardLostGear(${i})">放棄</button></div></td></tr>`).join("");
 let body=`<div class="card"><h2>商店</h2><div class="notice">商店每次只提供 3 件裝備。商品會保存在存檔中，重新整理頁面不會更換。刷新價格會逐次提高；每購買 1 件裝備，刷新價格下降一階。</div><div class="controls"><button class="btn" onclick="refreshShop()">刷新商店（${cost.toLocaleString()}）</button>${maxed?`<button class="btn blue" onclick="manualResetShopPrice()" ${canResetShopPrice()?"":"disabled"}>重置刷新價格${canResetShopPrice()?"":"（"+shopCooldownText()+"）"}</button>`:""}<span class="muted">持有金幣：${state.gold.toLocaleString()}</span></div><div style="overflow:auto;margin-top:10px"><table><thead><tr><th>商品</th><th>能力</th><th>與目前裝備比較</th><th>價格</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>${lost.length?`<h3 style="margin-top:24px">遺失裝備贖回</h3><div class="notice">可先和目前裝備比較；不值得贖回的裝備可直接放棄，放棄後永久刪除。</div><div style="overflow:auto"><table><thead><tr><th>裝備</th><th>能力</th><th>與目前裝備比較</th><th>贖回價格</th><th></th></tr></thead><tbody>${lostRows}</tbody></table></div>`:""}</div>`;
 return wrapFunctionPage(body);
}
function refreshShop(){let r=paidShopRefresh();if(!r.ok)return alert(r.reason);save();render()}
function buyItem(i){let r=shopPurchase(i);if(!r.ok)return alert(r.reason);save();render()}
function manualResetShopPrice(){let r=resetShopPrice();if(!r.ok)return alert(r.reason);save();render()}
function redeemGear(i){let r=redeemLostGear(i);if(!r.ok)return alert(r.reason);save();render()}

function settingsPage(){
 let s=state.settings;
 let body=`<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>
 <h3 style="margin-top:22px">自動出售</h3>${QUALITY.slice(0,5).map((q,i)=>`<div class="setting-row"><label><input type="checkbox" data-autosell="${i}" ${s.autoSell[i]?"checked":""}> <span class="${qClass(i)}">${q.n}</span></label></div>`).join("")}<div class="setting-row"><span class="q-mythic">神話</span><span class="muted">不可自動出售</span></div>
 <h3 style="margin-top:22px">遊戲設定</h3><div class="setting-row"><label><input id="keepUpgrade" type="checkbox" ${s.keepUpgrade?"checked":""}> 若新裝備比目前裝備強，自動保留</label></div>
 <h3 style="margin-top:22px">遊戲資料</h3><div class="setting-row"><span>本機自動存檔</span><span style="color:#72c982">已啟用</span></div><div class="controls"><button class="btn" onclick="exportSave()">匯出存檔</button><label class="btn">匯入存檔<input type="file" accept=".json" hidden onchange="importSave(event)"></label></div>
 ${state.gm?gmHtml():""}<div class="danger-zone"><b>危險操作</b><p class="muted">會清除目前全部遊戲進度。</p><button class="btn danger" onclick="resetGame()">重置遊戲</button></div></div>`;
 return wrapFunctionPage(body);
}
function wireSettings(){
 let title=document.getElementById("settingsTitle");
 if(title){
  title.onclick=()=>{gmTapCount++;clearTimeout(gmTapTimer);if(gmTapCount>=3){gmTapCount=0;openGMModal();return}gmTapTimer=setTimeout(()=>{gmTapCount=0},1000)};
  title.style.touchAction="manipulation";
  title.style.userSelect="none";
  title.style.webkitUserSelect="none";
 }
 document.querySelectorAll("[data-autosell]").forEach(el=>el.onchange=()=>{state.settings.autoSell[+el.dataset.autosell]=el.checked;save()});
 let keep=document.getElementById("keepUpgrade");if(keep)keep.onchange=()=>{state.settings.keepUpgrade=keep.checked;save()};
}
function gmHtml(){return `<div class="gm"><h3>管理／GM 模式</h3><div class="controls"><button class="btn" onclick="gmLevel()">指定等級</button><button class="btn" onclick="gmGold()">+10,000 金幣</button><button class="btn" onclick="gmUnlock()">解鎖全部地圖</button><button class="btn" onclick="gmGear(3)">產生史詩裝</button><button class="btn" onclick="gmGear(4)">產生傳說裝</button><button class="btn" onclick="gmGear(5)">產生神話裝</button><button class="btn" onclick="gmBoss()">重生目前 Boss</button><button class="btn" onclick="state.gm=false;save();render()">關閉管理模式</button></div></div>`}
function rest(){state.hp=equippedStats().hp;save();render()}
function openGMModal(){document.getElementById("passwordModal").classList.add("show");document.getElementById("gmPassword").focus()}
function closeGMModal(){document.getElementById("passwordModal").classList.remove("show")}
function unlockGM(){if(document.getElementById("gmPassword").value===GM_PASSWORD){state.gm=true;save();closeGMModal();render()}else alert("密碼錯誤。")}
function gmLevel(){let n=+prompt("指定等級（1～50）",state.level);if(!n)return;n=Math.max(1,Math.min(50,ceil(n)));state.level=n;state.exp=0;state.hp=equippedStats().hp;save();render()}
function gmGold(){state.gold+=10000;save();render()}
function gmUnlock(){state.unlockedMap=9;save();render()}
function gmGear(q){let mi=Math.min(9,Math.floor((state.level-1)/5));state.inventory.push(makeItem(state.level,mi,"normal",q));save();render()}
function gmBoss(){state.bossKilled[selectedMap]=true;state.bossProgress[selectedMap]=8;save();render()}
function exportSave(){let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rpg-save.json";a.click();URL.revokeObjectURL(a.href)}
function importSave(ev){let f=ev.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.level)throw 0;state=x;save();location.reload()}catch(e){alert("存檔格式不正確。")}};r.readAsText(f)}
function resetGame(){if(confirm("確定要清除全部遊戲進度嗎？此操作無法復原。")){state=newState();selectedMap=0;selectedEnemy=0;battleLogs=[];adventureScreen="maps";pendingContinuousBattle=null;save();view="home";render()}}
document.getElementById("brandTitle").onclick=()=>go("home");
load();render();