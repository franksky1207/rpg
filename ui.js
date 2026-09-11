let selectedBattleCount=1;
let adventureScreen="maps";
let combatRound=1;
let combatTotal=1;
let gmTapCount=0;
let gmTapTimer=null;
let inventoryFilter="all";
let inventoryFromAdventure=false;

const BATTLE_COUNT_UNLOCKS=[
 {level:1,count:1},
 {level:6,count:5},
 {level:11,count:10},
 {level:16,count:15},
 {level:21,count:20},
 {level:26,count:25}
];
function battleCountsForLevel(level){
 const lv=Math.max(1,Math.floor(Number(level)||1));
 return BATTLE_COUNT_UNLOCKS.filter(x=>lv>=x.level).map(x=>x.count);
}
function nextBattleCountUnlock(level){
 const lv=Math.max(1,Math.floor(Number(level)||1));
 return BATTLE_COUNT_UNLOCKS.find(x=>x.level>lv)||null;
}
function currentPlayerName(){
 const name=typeof state?.playerName==="string"?state.playerName.trim():"";
 return name||"玩家";
}
function escapePlayerName(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function playerNameHtml(){return escapePlayerName(currentPlayerName())}
function savePlayerName(){
 const input=document.getElementById("playerNameInput");
 let name=(input?.value||"").trim();
 if(!name)name="玩家";
 state.playerName=name.slice(0,12);
 save();render();
}

function compactMobileDom(){
 const mobile=window.matchMedia&&window.matchMedia("(max-width:760px)").matches;
 if(mobile){
  document.querySelectorAll(".enemy-meta").forEach(el=>{
   const m=el.textContent.match(/HP\s*(\d+).*攻擊\s*(\d+).*防禦\s*(\d+)/s);
   if(m)el.textContent=`HP ${m[1]}　ATK ${m[2]}　DEF ${m[3]}`;
  });
 }
}

function renderNav(){
 const top=document.getElementById("topNav"),bottom=document.getElementById("bottomNav");
 if(top)top.innerHTML="";
 if(bottom)bottom.innerHTML="";
}
function go(v){inventoryFromAdventure=false;if(v==="adventure")adventureScreen="maps";view=v;render()}
function render(){
 renderNav();normalizeHP();ensureSpecializationState();
 const fn={home:homePage,adventure:adventurePage,character:characterPage,specialization:specializationPage,inventory:inventoryPage,shop:shopPage,settings:settingsPage}[view]||homePage;
 document.getElementById("main").innerHTML=fn();wireSettings();setTimeout(compactMobileDom,0);
}
function qualityLegend(){return `<div class="muted quality-legend" style="margin:6px 0 12px">品質：<span class="q-common">普通</span>／<span class="q-uncommon">優良</span>／<span class="q-rare">稀有</span>／<span class="q-epic">史詩</span>／<span class="q-legendary">傳說</span>／<span class="q-mythic">神話</span></div>`}
function homeBackHtml(){return `<div class="back-home"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button></div>`}
function wrapFunctionPage(html){return `<div class="function-page">${homeBackHtml()}${html}</div>`}
function gearAbilityHtml(it,withScore=false){
 if(!it)return `<span class="muted">無</span>`;
 const rows=itemAbilityLines(it),body=rows.map(r=>`<div>${r.kind==="main"?`<span class="muted">主能力</span> `:r.kind==="affix"?`<span class="muted">詞條</span> `:""}${r.text}</div>`).join("");
 return `<div class="shop-stat-list">${body}${withScore?`<div class="muted" style="margin-top:5px">評分 ${equipmentScore(it)}</div>`:""}</div>`;
}

function homePage(){
 return `<section class="home-screen">
  <div class="home-title"><h2>文明戰線</h2><div class="muted">打怪、升級、換裝，前往更強的地圖。</div></div>
  <div class="menu-grid">
   <button class="menu-card" onclick="go('adventure')"><b>冒險</b><span>選擇地圖並挑戰怪物</span></button>
   <button class="menu-card" onclick="go('character')"><b>角色</b><span>查看能力與目前裝備</span></button>
   <button class="menu-card" onclick="go('specialization')"><b>專精</b><span>消耗金幣提升永久能力</span></button>
   <button class="menu-card" onclick="go('dungeon')"><b>副本</b><span>挑戰懸賞、競技場與虛空幻境</span></button>
   <button class="menu-card" onclick="go('inventory')"><b>背包</b><span>整理、裝備與出售道具</span></button>
   <button class="menu-card" onclick="go('shop')"><b>商店</b><span>購買裝備與贖回遺失裝備</span></button>
   <button class="menu-card" onclick="go('settings')"><b>設定</b><span>自動出售、存檔與遊戲設定</span></button>
  </div>
 </section>`;
}

function playerStatusHtml(){
 const s=playerCombatStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100,low=hpPct<50;
 return `<div class="card player-status-card"><div style="font-size:18px;font-weight:700;color:#f0d494;margin-bottom:9px">${playerNameHtml()}</div><div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div></div><div class="status-line ${low?"q-mythic":""}"><div class="status-label"><span>HP${low?"　⚠ 低血量":""}</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div class="status-line"><div class="status-label"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
}
function mapStatusText(i){
 if(i>state.unlockedMap)return "未解鎖";
 if(state.bossKilled[i])return "已通關";
 const h=highestUnlockedEnemy(i);
 if(h===0)return "攻略中・第 1 隻怪";
 if(h===1)return "攻略中・第 2 隻怪";
 if(h===2)return "攻略中・第 3 隻怪";
 if(h===3)return "攻略中・菁英";
 return state.level>=MAPS[i].max?"Boss 可挑戰":"等待達到 Boss 等級";
}
function adventureMapPage(){
 return `<section class="map-screen"><div class="page-top"><button class="btn back-btn" onclick="go('home')">← 返回主頁</button><h2 class="page-title">冒險地圖</h2><span></span></div><div class="map-grid">${MAPS.map((m,i)=>{const locked=i>state.unlockedMap,status=mapStatusText(i),cleared=state.bossKilled[i];return `<button class="map-card ${locked?"locked":""} ${cleared?"cleared":""}" ${locked?"disabled":""} onclick="enterMap(${i})"><b>${i+1}. ${m.name}</b><div class="muted">Lv.${m.min}～${m.max}</div><div class="map-status">${status}</div></button>`;}).join("")}</div></section>`;
}
function enterMap(i){
 if(i>state.unlockedMap)return;
 if(typeof resetMonsterPreviewCache==="function")resetMonsterPreviewCache();
 selectedMap=i;selectedEnemy=0;selectedBattleCount=1;adventureScreen="prepare";render();
}
function backToMaps(){adventureScreen="maps";render()}
function setBattleCount(n,el){selectedBattleCount=n;document.querySelectorAll(".count-card").forEach(b=>b.classList.remove("active"));if(el)el.classList.add("active")}
function selectEnemy(i){if(!enemyUnlocked(selectedMap,i))return;selectedEnemy=i;const e=monsterObj(selectedMap,selectedEnemy);if(e.kind==="boss")selectedBattleCount=1;render()}
function enemyProgressValue(mapIdx,enemyIdx){
 const p=state.mapProgress?.[mapIdx]||[0,0,0,0];
 if(enemyIdx<3)return Math.min(10,Math.max(0,Math.floor(Number(p[enemyIdx])||0)));
 if(enemyIdx===3){
  if(state.bossLocked?.[mapIdx])return Math.min(10,Math.max(0,Math.floor(Number(state.bossProgress?.[mapIdx])||0)));
  return Math.min(10,Math.max(0,Math.floor(Number(p[3])||0)));
 }
 return 0;
}
function enemyProgressHtml(mapIdx,enemyIdx){
 if(enemyIdx<4){const n=enemyProgressValue(mapIdx,enemyIdx);return `<div class="enemy-card-progress ${n>=10?"complete":"in-progress"}">${n}/10</div>`;}
 return `<div class="enemy-card-progress boss-ready">${state.bossKilled?.[mapIdx]?"已擊敗・可再次挑戰":"可挑戰首領"}</div>`;
}
function enemyNoteHtml(mapIdx,enemyIdx){
 if(enemyIdx===3){
  const map=MAPS[mapIdx],p=state.mapProgress?.[mapIdx]||[0,0,0,0],done=(Number(p[3])||0)>=10,levelNeeded=Number(map?.max)||Number(map?.enemies?.[4]?.[1])||1;
  const bossVisible=enemyUnlocked(mapIdx,4);
  if(done&&!state.bossLocked?.[mapIdx]&&!state.bossKilled?.[mapIdx]&&!bossVisible&&Number(state.level)<levelNeeded)return `<div class="enemy-card-note level-note">菁英進度完成・角色達 Lv.${levelNeeded} 後首領出現。</div>`;
 }
 if(enemyIdx===4)return `<div class="enemy-card-note boss-note">${state.bossKilled?.[mapIdx]?"可再次挑戰首領；若戰敗，需重新擊敗菁英 10 次後才能再次挑戰。":"勝利後可繼續挑戰首領；若戰敗，需重新擊敗菁英 10 次後才能再次挑戰。"}</div>`;
 return "";
}
function openAdventureInventory(){inventoryFromAdventure=true;view="inventory";render()}
function backToAdventureFromInventory(){inventoryFromAdventure=false;view="adventure";adventureScreen="prepare";render()}
function adventurePreparePage(){
 selectedMap=Math.min(selectedMap,state.unlockedMap);
 const highest=highestUnlockedEnemy(selectedMap);if(selectedEnemy>highest)selectedEnemy=highest;
 const map=MAPS[selectedMap],e=monsterObj(selectedMap,selectedEnemy);
 const counts=e.kind==="boss"?[1]:battleCountsForLevel(state.level);
 if(!counts.includes(selectedBattleCount))selectedBattleCount=counts[counts.length-1]||1;
 const nextUnlock=e.kind==="boss"?null:nextBattleCountUnlock(state.level);
 const nextUnlockHtml=nextUnlock?`<div class="battle-count-next">Lv.${nextUnlock.level} 將開放 ${nextUnlock.count} 場</div>`:"";
 const enemies=map.enemies.map((x,i)=>{
  if(!enemyUnlocked(selectedMap,i))return "";
  const mo=monsterObj(selectedMap,i),badge=mo.kind==="elite"?`<span class="badge elite">菁英</span>`:mo.kind==="boss"?`<span class="badge boss">Boss</span>`:"";
  const traits=typeof traitDetailsHtml==="function"?traitDetailsHtml(mo.traits):"";
  return `<button class="enemy-card ${i===selectedEnemy?"active":""}" onclick="selectEnemy(${i})"><div class="enemy-card-top"><div class="enemy-card-title"><b>${mo.name} Lv.${mo.level}</b>${badge}</div>${enemyProgressHtml(selectedMap,i)}</div>${traits}<div class="enemy-meta">HP ${mo.hp}　ATK ${mo.atk}　DEF ${mo.def}</div>${enemyNoteHtml(selectedMap,i)}</button>`;
 }).join("");
 return `<section class="prepare-screen"><div class="page-top"><button class="btn back-btn" onclick="backToMaps()">← 返回冒險地圖</button><h2 class="page-title">${map.name}</h2><span></span></div><div class="prepare-layout">${playerStatusHtml()}<div class="card prepare-main"><h3>選擇怪物</h3><div class="enemy-grid">${enemies}</div><h3 class="battle-count-title">戰鬥次數</h3><div class="battle-count-panel"><div class="count-grid" style="--battle-count-columns:${counts.length}">${counts.map(n=>`<button class="count-card ${n===selectedBattleCount?"active":""}" onclick="setBattleCount(${n},this)">${n===1?"單場":n+" 場"}</button>`).join("")}</div>${nextUnlockHtml}</div><div class="prepare-actions"><button class="btn primary" onclick="startBattles()">${e.kind==="boss"?"回血並挑戰 Boss":"回血並開始戰鬥"}</button><button class="btn blue" onclick="openAdventureInventory()">背包</button></div></div></div></section>`;
}
function adventureCombatPage(){
 const e=monsterObj(selectedMap,selectedEnemy),s=playerCombatStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100;
 return `<section class="combat-screen"><div class="combat-head">${combatTotal>1?`第 ${combatRound} / ${combatTotal} 場`:`單場戰鬥`}</div><div class="combat-arena"><div class="combatant player" id="combatPlayerCard"><div class="combat-damage" id="combatPlayerDamage"></div><h2>${playerNameHtml()} Lv.${state.level}</h2><div class="muted">金幣 ${state.gold.toLocaleString()}</div><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatPlayerHp">${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" id="combatPlayerBar" style="width:${hpPct}%"></span></div></div><div class="xp-block"><div class="status-label"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div><div class="combat-vs">VS</div><div class="combatant enemy" id="combatEnemyCard"><div class="combat-damage" id="combatEnemyDamage"></div><h2 id="combatEnemyName">${e.name} Lv.${e.level}</h2><div class="big-hp"><div class="status-label"><span>HP</span><span id="combatEnemyHp">${e.hp} / ${e.hp}</span></div><div class="bar"><span class="hp" id="combatEnemyBar" style="width:100%"></span></div></div></div></div><div class="combat-message" id="combatMessage">準備戰鬥</div></section>`;
}
function adventurePage(){if(adventureScreen==="maps")return adventureMapPage();if(adventureScreen==="combat")return adventureCombatPage();return adventurePreparePage()}

function healBeforeBattle(){state.hp=playerCombatStats().hp;save(false)}
function startBattles(){
 if(battleBusy)return;
 const e=typeof getPreviewEncounter==="function"?getPreviewEncounter(selectedMap,selectedEnemy):monsterObj(selectedMap,selectedEnemy);
 const count=e.kind==="boss"?1:selectedBattleCount;
 healBeforeBattle();beginCombat(count);
}
function beginCombat(count){
 combatRound=1;combatTotal=count;
 if(typeof getPreviewEncounter==="function")currentCombatEncounter=getPreviewEncounter(selectedMap,selectedEnemy);
 adventureScreen="combat";render();setTimeout(()=>runBattles(count),60);
}
function setCombatHp(enemyHp,enemyMax,playerHp,playerMax,message){
 const eb=document.getElementById("combatEnemyBar"),eh=document.getElementById("combatEnemyHp"),pb=document.getElementById("combatPlayerBar"),ph=document.getElementById("combatPlayerHp"),msg=document.getElementById("combatMessage");
 if(eb)eb.style.width=`${Math.max(0,Math.min(100,enemyHp/enemyMax*100))}%`;
 if(eh)eh.textContent=`${Math.max(0,enemyHp)} / ${enemyMax}`;
 if(pb)pb.style.width=`${Math.max(0,Math.min(100,playerHp/playerMax*100))}%`;
 if(ph)ph.textContent=`${Math.max(0,playerHp)} / ${playerMax}`;
 if(msg)msg.textContent=message;
}
function flashCombatText(target,text){
 const card=document.getElementById(target==="enemy"?"combatEnemyCard":"combatPlayerCard"),dmg=document.getElementById(target==="enemy"?"combatEnemyDamage":"combatPlayerDamage");
 if(card&&text!=="閃避"){card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");setTimeout(()=>card.classList.remove("hit"),260)}
 if(dmg){dmg.textContent=text;dmg.classList.remove("show");void dmg.offsetWidth;dmg.classList.add("show")}
}
function flashDamage(target,amount){flashCombatText(target,`-${amount}`)}
function attackMotion(attacker){
 const card=document.getElementById(attacker==="player"?"combatPlayerCard":"combatEnemyCard");
 if(card){card.classList.remove("attacking");void card.offsetWidth;card.classList.add("attacking");setTimeout(()=>card.classList.remove("attacking"),340)}
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function animateFight(r,startPlayerHp,playerMax,enemyMax,roundText=""){
 let ehp=enemyMax,php=startPlayerHp;
 setCombatHp(ehp,enemyMax,php,playerMax,roundText?`${roundText}・開始戰鬥`:"開始戰鬥");await sleep(180);
 for(const line of r.logs){
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
function dropListHtml(items){
 if(!items.length)return `<div class="muted">裝備：無</div>`;
 return `<div style="margin-top:10px"><b>裝備</b>${items.map(x=>`<div class="item">${itemHtml(x.item,true)}${gearAbilityHtml(x.item,true)}${x.sold?`<div class="muted">自動出售 +${x.sold} 金幣</div>`:""}</div>`).join("")}</div>`;
}
function showBattleResult(ctx,defeat=null){
 const title=document.getElementById("battleResultTitle"),detail=document.getElementById("battleResultDetail"),modal=document.getElementById("battleResultModal");
 if(!title||!detail||!modal)return;
 if(defeat){
  title.textContent="戰鬥失敗";
  const lost=defeat.penalty?.dropped;
  detail.innerHTML=`<div class="item"><b>EXP 損失：${defeat.penalty?.expLost||0}</b></div>${lost?`<div style="margin-top:10px"><b>遺失裝備</b><div class="item">${itemHtml(lost,true)}${gearAbilityHtml(lost,true)}</div><div class="muted">已移至商店的「遺失裝備贖回」。</div></div>`:`<div class="muted" style="margin-top:10px">本次沒有遺失裝備。</div>`}`;
 }else{
  title.textContent=ctx.originalCount>1?"連續戰鬥結算":"戰鬥勝利";
  detail.innerHTML=`${ctx.originalCount>1?`<div class="item"><b>勝利 ${ctx.wins} / ${ctx.originalCount} 場</b></div>`:""}<div class="stats" style="margin-top:10px"><div class="stat">EXP<b>+${ctx.totalXp}</b></div><div class="stat">金幣<b>+${ctx.totalGold}</b></div></div>${dropListHtml(ctx.items)}`;
 }
 modal.classList.add("show");
}
function closeBattleResultModal(){const modal=document.getElementById("battleResultModal");if(modal)modal.classList.remove("show");adventureScreen="prepare";render()}

function characterPage(){
 const s=playerCombatStats(),need=state.level<MAX_LEVEL?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<MAX_LEVEL?Math.min(100,state.exp/need*100):100;
 const stats=`<div class="card character-stats-card"><h2>角色｜${playerNameHtml()}</h2><div class="grid3 character-stats-grid"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div><div class="stat">總攻擊<b>${s.atk}</b></div><div class="stat">總防禦<b>${s.def}</b></div><div class="stat">暴擊率<b>${s.crit||0}%</b></div><div class="stat">閃避率<b>${s.dodge||0}%</b></div></div><div style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:10px"><span>HP</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:10px"><span>EXP</span><span>${state.level>=MAX_LEVEL?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
 const equips=`<div class="card character-equipment-card"><h3>目前裝備</h3>${qualityLegend()}${EQUIPMENT_TYPES.map(t=>`<div class="item"><b>${equipmentTypeLabel(t)}</b><br>${itemHtml(state.equipment[t],true)}${state.equipment[t]?gearAbilityHtml(state.equipment[t],true):""}</div>`).join("")}</div>`;
 return wrapFunctionPage(`<div class="character-layout">${stats}${equips}</div>`);
}
function setInventoryFilter(v){inventoryFilter=v;selectedItem=null;render()}
function inventoryContent(){
 const items=state.inventory.filter(it=>inventoryFilter==="all"||it.type===inventoryFilter).slice().sort((a,b)=>equipmentScore(b)-equipmentScore(a)||b.q-a.q||b.level-a.level);
 const sel=items.find(x=>x.id===selectedItem)||items[0];selectedItem=sel?.id||null;
 const filterOptions=`<option value="all" ${inventoryFilter==="all"?"selected":""}>全部</option>${EQUIPMENT_TYPES.map(t=>`<option value="${t}" ${inventoryFilter===t?"selected":""}>${equipmentTypeLabel(t)}</option>`).join("")}`;
 return `<div class="grid"><div class="card"><h3>目前裝備</h3>${qualityLegend()}${EQUIPMENT_TYPES.map(t=>`<div class="item"><b>${equipmentTypeLabel(t)}</b><br>${itemHtml(state.equipment[t],true)}${state.equipment[t]?gearAbilityHtml(state.equipment[t],true):""}</div>`).join("")}</div>
 <div class="card"><h2>背包（${state.inventory.length} 件）</h2>${qualityLegend()}<div class="controls"><select class="btn" onchange="setInventoryFilter(this.value)">${filterOptions}</select><span class="muted" style="align-self:center">排序：評分高→低</span></div><div class="controls"><button class="btn blue" onclick="equipBestAll()">一鍵裝備較強裝備</button><button class="btn" onclick="sellLowerAll()">一鍵賣出較低裝備</button></div>${items.length?`<div style="overflow:auto"><table><thead><tr><th>裝備</th><th>類型</th><th>能力／詞條</th><th>評分</th><th>售價</th></tr></thead><tbody>${items.map(it=>`<tr onclick="selectItem('${it.id}')" style="cursor:pointer;background:${it.id===selectedItem?"#211d16":"transparent"}"><td>${itemHtml(it,true)}</td><td>${equipmentTypeLabel(it.type)}</td><td>${gearAbilityHtml(it,false)}</td><td>${equipmentScore(it)}</td><td>${specializationSellValue(it)}</td></tr>`).join("")}</tbody></table></div>${sel?compareHtml(sel):""}`:`<div class="muted" style="margin-top:12px">${state.inventory.length?"目前篩選沒有裝備。":"背包是空的。"}</div>`}</div></div>`;
}
function inventoryPage(){
 const back=inventoryFromAdventure?`<div class="back-home"><button class="btn back-btn" onclick="backToAdventureFromInventory()">← 返回冒險</button></div>`:homeBackHtml();
 return `<div class="function-page">${back}${inventoryContent()}</div>`;
}
function equipBestAll(){
 let changed=0;
 EQUIPMENT_TYPES.forEach(type=>{
  const current=state.equipment[type];let best=current,bestScore=equipmentScore(current);
  state.inventory.filter(it=>it.type===type).forEach(it=>{const sc=equipmentScore(it);if(sc>bestScore){best=it;bestScore=sc}});
  if(best&&best!==current){const idx=state.inventory.findIndex(it=>it.id===best.id);if(idx>=0){state.inventory.splice(idx,1);if(current)state.inventory.push(current);state.equipment[type]=best;changed++}}
 });
 normalizeHP();selectedItem=null;save();render();alert(changed?`已更換 ${changed} 件較強裝備。`:"目前裝備已是最佳。");
}
function sellLowerAll(){
 const targets=state.inventory.filter(it=>{if(it.q===5)return false;const current=state.equipment[it.type];if(!current)return false;return equipmentScore(it)<=equipmentScore(current)});
 if(!targets.length)return alert("沒有可出售的較低裝備。");
 const total=targets.reduce((a,it)=>a+specializationSellValue(it),0);
 if(!confirm(`將出售 ${targets.length} 件較低或同能力裝備，共獲得 ${total.toLocaleString()} 金幣。確定出售嗎？`))return;
 const ids=new Set(targets.map(it=>it.id));state.inventory=state.inventory.filter(it=>!ids.has(it.id));state.gold+=total;selectedItem=null;save();render();alert(`已出售 ${targets.length} 件裝備，獲得 ${total.toLocaleString()} 金幣。`);
}
function compareHtml(it){
 const old=state.equipment[it.type],newScore=equipmentScore(it),oldScore=equipmentScore(old),diff=round1(old?newScore-oldScore:newScore);
 return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3><div class="grid3"><div><div class="muted">目前</div>${itemHtml(old,true)}${old?gearAbilityHtml(old,true):""}</div><div><div class="muted">新裝備</div>${itemHtml(it,true)}${gearAbilityHtml(it,true)}</div><div><div class="muted">整體比較</div><div>目前 ${old?oldScore:"無"}</div><div>新裝備 ${newScore}</div><b style="color:${diff>0?"#76d587":diff<0?"#e27474":"#ccc"}">${diff>0?"+":""}${diff}</b></div></div><div class="controls"><button class="btn blue" onclick="equipSelected()">裝備</button><button class="btn" onclick="sellSelected()">出售</button></div></div>`;
}
function selectItem(id){selectedItem=id;render()}
function equipSelected(){const i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return;const it=state.inventory.splice(i,1)[0],old=state.equipment[it.type];state.equipment[it.type]=it;if(old)state.inventory.push(old);normalizeHP();save();render()}
function sellSelected(){const i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return;const it=state.inventory[i];if(it.q===5&&!confirm("這是神話裝備，確定要出售嗎？"))return;state.inventory.splice(i,1);state.gold+=specializationSellValue(it);selectedItem=null;save();render()}

function shopCooldownText(){
 const left=Math.max(0,(state.shop.resetAvailableAt||0)-Date.now());if(!left)return "可重置";
 const m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);return `${m} 分 ${String(s).padStart(2,"0")} 秒`;
}
function compareGearHtml(it,label="商品評分"){
 const current=state.equipment[it.type],itemScore=equipmentScore(it),currentScore=current?equipmentScore(current):null,diff=current?round1(itemScore-currentScore):itemScore;
 const diffText=current?`${diff>0?"+":""}${diff}`:"目前無裝備",diffColor=!current?"#e5cf9a":diff>0?"#76d587":diff<0?"#e27474":"#ccc";
 const currentHtml=current?`${itemHtml(current,true)}<div class="muted" style="margin-top:4px">評分 ${currentScore}</div>`:`<span class="muted">無</span>`;
 return `<div class="muted">目前</div>${currentHtml}<div style="margin-top:6px"><span class="muted">${label} ${itemScore}</span>　<b style="color:${diffColor}">${diffText}</b></div>`;
}
function shopStatHtml(it){return gearAbilityHtml(it,false)}
function discardLostGear(i){const lost=state.lostGear?.[i];if(!lost)return;state.lostGear.splice(i,1);save();render()}
function shopPage(){
 ensureShop();
 if(state.shop.items.length>3){state.shop.items=state.shop.items.slice(0,3);save(false)}
 const cost=shopRefreshCost(),maxed=(state.shop.refreshIndex||0)>=7,lost=state.lostGear||[];
 const rows=state.shop.items.map((it,i)=>`<tr><td data-label="商品" class="shop-item-cell">${itemHtml(it,true)}</td><td data-label="能力" class="shop-stats-cell">${shopStatHtml(it)}</td><td data-label="比較" class="shop-compare-cell">${compareGearHtml(it,"商品評分")}</td><td data-label="價格" class="shop-price-cell">${it.buy.toLocaleString()}</td><td class="shop-action-cell"><button class="btn" onclick="buyItem(${i})">購買</button></td></tr>`).join("");
 const lostRows=lost.map((x,i)=>`<tr><td data-label="裝備" class="shop-item-cell">${itemHtml(x.item,true)}</td><td data-label="能力" class="shop-stats-cell">${shopStatHtml(x.item)}</td><td data-label="比較" class="shop-compare-cell">${compareGearHtml(x.item,"遺失裝備評分")}</td><td data-label="贖回價格" class="shop-price-cell">${x.cost.toLocaleString()}</td><td class="shop-action-cell"><div class="controls shop-row-actions"><button class="btn" onclick="redeemGear(${i})">贖回</button><button class="btn danger" onclick="discardLostGear(${i})">放棄</button></div></td></tr>`).join("");
 const body=`<div class="card"><h2>商店</h2><div class="notice"><div>• 刷新越多次，價格越高；買裝備可降低刷新價格。</div><div>• 最高 12,800，可重置回 100，冷卻 1 小時。</div><div>• 首次解鎖新地圖時免費刷新；商店不會出現神話裝備。</div></div><div class="controls"><button class="btn" onclick="refreshShop()">刷新商店（${cost.toLocaleString()}）</button>${maxed?`<button class="btn blue" onclick="manualResetShopPrice()" ${canResetShopPrice()?"":"disabled"}>重置刷新價格${canResetShopPrice()?"":"（"+shopCooldownText()+"）"}</button>`:""}<span class="muted">持有金幣：${state.gold.toLocaleString()}</span></div><div class="shop-table-wrap"><table class="shop-table"><thead><tr><th>商品</th><th>主能力／詞條</th><th>與目前裝備比較</th><th>價格</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>${lost.length?`<h3 style="margin-top:24px">遺失裝備贖回</h3><div class="notice">可先和目前裝備比較；不值得贖回的裝備可直接放棄，放棄後永久刪除。</div><div class="shop-table-wrap"><table class="shop-table lost-gear-table"><thead><tr><th>裝備</th><th>主能力／詞條</th><th>與目前裝備比較</th><th>贖回價格</th><th></th></tr></thead><tbody>${lostRows}</tbody></table></div>`:""}</div>`;
 return wrapFunctionPage(body);
}
function refreshShop(){const r=paidShopRefresh();if(!r.ok)return alert(r.reason);save();render()}
function buyItem(i){const r=shopPurchase(i);if(!r.ok)return alert(r.reason);save();render()}
function manualResetShopPrice(){const r=resetShopPrice();if(!r.ok)return alert(r.reason);save();render()}
function redeemGear(i){const r=redeemLostGear(i);if(!r.ok)return alert(r.reason);save();render()}

function settingsPage(){
 const s=state.settings,name=playerNameHtml();
 const body=`<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>
 <h3 style="margin-top:22px">自動出售</h3>${QUALITY.slice(0,5).map((q,i)=>`<div class="setting-row"><label><input type="checkbox" data-autosell="${i}" ${s.autoSell[i]?"checked":""}> <span class="${qClass(i)}">${q.n}</span></label></div>`).join("")}<div class="setting-row"><span class="q-mythic">神話</span><span class="muted">不可自動出售</span></div>
 <h3 style="margin-top:22px">遊戲設定</h3><div class="setting-row" style="align-items:flex-end"><div style="flex:1"><div style="margin-bottom:6px">角色名稱</div><input id="playerNameInput" type="text" maxlength="12" value="${name}" placeholder="玩家" style="width:100%;padding:10px 11px;border-radius:8px;border:1px solid #424850;background:#0e1217;color:#fff"></div><button class="btn blue" onclick="savePlayerName()">儲存名稱</button></div><div class="muted" style="margin-top:6px">最多 12 個字；空白名稱儲存時會自動恢復成「玩家」。</div><div class="setting-row"><label><input id="keepUpgrade" type="checkbox" ${s.keepUpgrade?"checked":""}> 若新裝備比目前裝備強，自動保留</label></div>
 <h3 style="margin-top:22px">遊戲資料</h3><div class="setting-row"><span>本機自動存檔</span><span style="color:#72c982">已啟用</span></div><div class="controls"><button class="btn" onclick="exportSave()">匯出存檔</button><label class="btn">匯入存檔<input type="file" accept=".json" hidden onchange="importSave(event)"></label></div>
 ${state.gm&&typeof gmHtml==="function"?gmHtml():""}<div class="danger-zone"><b>危險操作</b><p class="muted">會清除目前全部遊戲進度。</p><button class="btn danger" onclick="resetGame()">重置遊戲</button></div></div>`;
 return wrapFunctionPage(body);
}
function wireSettings(){
 const title=document.getElementById("settingsTitle");
 if(title){
  title.onclick=()=>{gmTapCount++;clearTimeout(gmTapTimer);if(gmTapCount>=3){gmTapCount=0;openGMModal();return}gmTapTimer=setTimeout(()=>{gmTapCount=0},1000)};
  title.style.touchAction="manipulation";title.style.userSelect="none";title.style.webkitUserSelect="none";
 }
 document.querySelectorAll("[data-autosell]").forEach(el=>el.onchange=()=>{state.settings.autoSell[+el.dataset.autosell]=el.checked;save()});
 const keep=document.getElementById("keepUpgrade");if(keep)keep.onchange=()=>{state.settings.keepUpgrade=keep.checked;save()};
}
function openGMModal(){document.getElementById("passwordModal").classList.add("show");document.getElementById("gmPassword").focus()}
function closeGMModal(){document.getElementById("passwordModal").classList.remove("show")}
function unlockGM(){if(document.getElementById("gmPassword").value===GM_PASSWORD){state.gm=true;save();closeGMModal();render()}else alert("密碼錯誤。")}
function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rpg-save.json";a.click();URL.revokeObjectURL(a.href)}
function importSave(ev){const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.level)throw 0;state=x;save();location.reload()}catch(e){alert("存檔格式不正確。")}};r.readAsText(f)}
function resetGame(){if(confirm("確定要清除全部遊戲進度嗎？此操作無法復原。")){state=newState();selectedMap=0;selectedEnemy=0;battleLogs=[];adventureScreen="maps";inventoryFilter="all";inventoryFromAdventure=false;save();view="home";render()}}
document.getElementById("brandTitle").onclick=()=>go("home");
load();render();