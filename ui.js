let selectedBattleCount=1;
let pendingBattleCount=1;
let adventureScreen="maps";
let riskMode="initial";
let pendingContinuousBattle=null;

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
 if(view==="adventure"&&adventureScreen==="battle"&&battleLogs.length)setTimeout(scrollBattleLogToBottom,0);
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

function adventureStatus(){
 let s=equippedStats(),need=state.level<50?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<50?Math.min(100,state.exp/need*100):100,low=hpPct<30;
 return `<div class="card" style="margin-bottom:16px">
   <div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div></div>
   <div style="margin-top:12px;${low?"color:#ff8585;font-weight:700":""}">HP ${state.hp} / ${s.hp}${low?"　⚠ 戰敗會損失 EXP，並可能遺失裝備":""}<div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div>
   <div style="margin-top:10px">EXP ${state.level>=50?"MAX":state.exp+" / "+need}<div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div>
 </div>`;
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
 return `<div>${adventureStatus()}<div class="card"><h2>冒險地圖</h2><p class="muted">選擇要前往的地圖。進入後才會顯示怪物與戰鬥紀錄。</p>
 <div class="map-list" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin-top:14px">${MAPS.map((m,i)=>{
   let locked=i>state.unlockedMap,status=mapStatusText(i);
   return `<button class="${locked?"locked":""}" ${locked?"disabled":""} onclick="enterMap(${i})" style="min-height:96px">
     <b>${i+1}. ${m.name}</b><div class="muted" style="margin-top:4px">Lv.${m.min}～${m.max}</div><div style="margin-top:9px;color:${locked?"#777":state.bossKilled[i]?"#72c982":"#e5cf9a"}">${status}</div>
   </button>`;
 }).join("")}</div></div></div>`;
}
function adventureBattlePage(){
 selectedMap=Math.min(selectedMap,state.unlockedMap);
 let highest=highestUnlockedEnemy(selectedMap);if(selectedEnemy>highest)selectedEnemy=highest;
 let map=MAPS[selectedMap],e=monsterObj(selectedMap,selectedEnemy);
 let maxBattles=state.level<=10?5:state.level<=20?10:state.level<=30?15:state.level<=40?20:25;
 if(selectedBattleCount>maxBattles)selectedBattleCount=maxBattles;
 let opts=[1,5,10,15,20,25].filter(x=>x===1||x<=maxBattles).map(x=>`<button onclick="setBattleCount(${x},this)" data-bc="${x}" class="${x===selectedBattleCount?"active":""}">${x===1?"單場":x+" 場"}</button>`).join("");
 let battleControls=e.kind==="boss"
  ? `<div class="controls"><button class="btn primary" onclick="startBattles()">挑戰 Boss</button><button class="btn ok" onclick="rest()">回城休息</button></div><input type="hidden" id="battleCount" value="1">`
  : `<h3>連續戰鬥</h3><div class="seg" id="battleSeg">${opts}</div><input type="hidden" id="battleCount" value="${selectedBattleCount}"><div class="controls"><button class="btn primary" onclick="startBattles()">開始戰鬥</button><button class="btn ok" onclick="rest()">回城休息</button></div>`;
 let enemyButtons=map.enemies.map((x,i)=>{
   if(!enemyUnlocked(selectedMap,i))return "";
   let mo=monsterObj(selectedMap,i),badge=mo.kind==="elite"?`<span class="badge elite">菁英</span><span class="badge">Boss 計數</span>`:mo.kind==="boss"?`<span class="badge boss">Boss</span>`:"";
   return `<button class="${i===selectedEnemy?"active":""}" onclick="selectEnemy(${i})">${mo.name} Lv.${mo.level}${badge}<div class="muted">HP ${mo.hp}　攻擊 ${mo.atk}　防禦 ${mo.def}</div></button>`;
 }).join("");
 return `<div>${adventureStatus()}<div class="card"><div class="controls" style="margin-top:0;margin-bottom:12px"><button class="btn" onclick="backToMaps()">← 返回冒險地圖</button></div><h2>${map.name} <span class="muted">Lv.${map.min}～${map.max}</span></h2>
 ${mapProgressHtml(selectedMap)}
 <h3 style="margin-top:18px">選擇怪物</h3><div class="enemy-list">${enemyButtons}</div>
 ${state.bossKilled[selectedMap]?`<div class="notice">Boss 重生進度：${state.bossProgress[selectedMap]}/8 菁英。只有擊敗本地圖的菁英怪才會計數。</div>`:""}
 ${e.kind==="boss"&&state.bossKilled[selectedMap]?`<div class="notice">Boss 再次挑戰條件：同地圖擊敗 8 隻菁英怪（${canBoss(selectedMap)?"可挑戰":state.bossProgress[selectedMap]+"/8 菁英"}）</div>`:""}
 ${battleControls}</div>
 <div class="card" style="margin-top:16px"><h3>戰鬥紀錄</h3><div class="log" id="battleLog">${battleLogs.length?battleLogs.map(x=>`<div>${x}</div>`).join(""):`<div class="muted">尚未進行戰鬥。</div>`}</div></div></div>`;
}
function adventurePage(){return adventureScreen==="maps"?adventureMapPage():adventureBattlePage()}
function enterMap(i){if(i>state.unlockedMap)return;selectedMap=i;selectedEnemy=0;battleLogs=[];adventureScreen="battle";render()}
function backToMaps(){adventureScreen="maps";battleLogs=[];render()}
function setBattleCount(n,el){selectedBattleCount=n;document.getElementById("battleCount").value=n;document.querySelectorAll("#battleSeg button").forEach(b=>b.classList.remove("active"));el.classList.add("active")}
function selectMap(i){enterMap(i)}
function selectEnemy(i){if(!enemyUnlocked(selectedMap,i))return;selectedEnemy=i;battleLogs=[];render()}

function lowHp(){let s=equippedStats();return s.hp>0&&state.hp/s.hp<.30}
function scrollBattleLogToBottom(){let log=document.getElementById("battleLog");if(log)log.scrollTop=log.scrollHeight}
function showRiskModal(mode,remaining=0){
 riskMode=mode;
 let modal=document.getElementById("riskModal"),msg=document.getElementById("riskMessage"),continueBtn=document.getElementById("riskContinueBtn"),stopBtn=document.getElementById("riskStopBtn");
 if(mode==="continuous"){
   if(msg)msg.innerHTML=`目前 HP 已低於 30%。連續戰鬥已暫停，尚有 <b>${remaining}</b> 場。<br>若繼續後戰敗，將損失目前等級升級所需 EXP 的 10%，並有 30% 機率遺失目前裝備中的 1 件。`;
   if(continueBtn)continueBtn.textContent=`繼續剩餘 ${remaining} 場`;
   if(stopBtn)stopBtn.style.display="inline-block";
 }else{
   if(msg)msg.innerHTML=`目前 HP 已低於 30%。<br>若戰敗，將損失目前等級升級所需 EXP 的 10%，並有 30% 機率遺失目前裝備中的 1 件。`;
   if(continueBtn)continueBtn.textContent="仍要繼續戰鬥";
   if(stopBtn)stopBtn.style.display="none";
 }
 if(modal)modal.classList.add("show");
}
function startBattles(){
 if(battleBusy)return;
 let count=+(document.getElementById("battleCount")?.value||1);
 if(lowHp()){
   pendingBattleCount=count;
   pendingContinuousBattle=null;
   showRiskModal("initial");
   return;
 }
 runBattles(count);
}
function closeRiskModal(){let m=document.getElementById("riskModal");if(m)m.classList.remove("show")}
function continueRiskBattle(){
 closeRiskModal();
 if(riskMode==="continuous"&&pendingContinuousBattle){let ctx=pendingContinuousBattle;pendingContinuousBattle=null;runBattles(ctx.remaining,ctx);return}
 let count=pendingBattleCount;runBattles(count);
}
function stopContinuousBattle(){
 if(!pendingContinuousBattle)return closeRiskModal();
 let ctx=pendingContinuousBattle;pendingContinuousBattle=null;closeRiskModal();
 ctx.summary.push(`連續戰鬥已手動結束。`);
 ctx.summary.push(`結算：勝利 ${ctx.wins}/${ctx.originalCount}，EXP +${ctx.totalXp}，金幣 +${ctx.totalGold}，掉落 ${ctx.drops} 件。`);
 battleLogs=ctx.summary;save();render();
}
function riskRest(){
 if(riskMode==="continuous"&&pendingContinuousBattle){
   let ctx=pendingContinuousBattle;pendingContinuousBattle=null;
   ctx.summary.push(`因低血量返回城鎮，連續戰鬥已結束。`);
   ctx.summary.push(`結算：勝利 ${ctx.wins}/${ctx.originalCount}，EXP +${ctx.totalXp}，金幣 +${ctx.totalGold}，掉落 ${ctx.drops} 件。`);
   battleLogs=ctx.summary;
 }
 closeRiskModal();state.hp=equippedStats().hp;save();render();
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function animateLogs(logs,kind){
 let log=document.getElementById("battleLog");if(!log)return;
 log.innerHTML="";
 let delay=kind==="boss"?280:kind==="elite"?220:160;
 for(let line of logs){log.insertAdjacentHTML("beforeend",`<div>${line}</div>`);scrollBattleLogToBottom();await sleep(delay)}
 scrollBattleLogToBottom();
}
async function runBattles(count,ctx=null){
 if(battleBusy)return;battleBusy=true;
 if(!ctx)ctx={summary:[],wins:0,totalXp:0,totalGold:0,drops:0,originalCount:count,completed:0,remaining:count};
 for(let local=1;local<=count;local++){
   let roundNo=ctx.completed+1,r=fightOnce(selectedMap,selectedEnemy);
   if(!r.ok){ctx.summary.push(r.reason);break}
   if(ctx.originalCount===1){
     battleLogs=r.logs.slice();render();await animateLogs(r.logs,r.e.kind);
     if(r.win){ctx.wins++;ctx.totalXp+=r.xp;ctx.totalGold+=r.gold;if(r.item)ctx.drops++}
   }else if(r.win){
     ctx.wins++;ctx.totalXp+=r.xp;ctx.totalGold+=r.gold;if(r.item)ctx.drops++;
     ctx.summary.push(`第 ${roundNo} 場：勝利${r.item?`，${r.sold?"裝備自動出售":"掉落 "+itemHtmlPlain(r.item)}`:""}`);
     battleLogs=ctx.summary.slice();render();scrollBattleLogToBottom();
     await sleep(r.e.kind==="elite"?800:500);
   }else{
     ctx.summary.push(`第 ${roundNo} 場：戰敗，連續戰鬥中止。`);
     ctx.summary.push(...r.logs.slice(-3));
     battleLogs=ctx.summary.slice();render();scrollBattleLogToBottom();
     ctx.completed++;ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
     break;
   }
   ctx.completed++;ctx.remaining=Math.max(0,ctx.originalCount-ctx.completed);
   if(!r.win)break;
   if(ctx.originalCount>1&&ctx.remaining>0&&lowHp()){
     pendingContinuousBattle=ctx;battleBusy=false;save();battleLogs=ctx.summary.slice();render();scrollBattleLogToBottom();showRiskModal("continuous",ctx.remaining);return;
   }
 }
 if(ctx.originalCount>1)ctx.summary.push(`結算：勝利 ${ctx.wins}/${ctx.originalCount}，EXP +${ctx.totalXp}，金幣 +${ctx.totalGold}，掉落 ${ctx.drops} 件。`);
 if(ctx.originalCount>1)battleLogs=ctx.summary;
 save();battleBusy=false;render();scrollBattleLogToBottom();
}

function characterPage(){
 let s=equippedStats(),need=state.level<50?expNeed(state.level):0,hpPct=s.hp?state.hp/s.hp*100:0,expPct=state.level<50?Math.min(100,state.exp/need*100):100;
 let stats=`<div class="card"><h2>角色</h2><div class="grid3"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div><div class="stat">總攻擊<b>${s.atk}</b></div><div class="stat">總防禦<b>${s.def}</b></div></div><div style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:10px"><span>HP</span><span>${state.hp} / ${s.hp}</span></div><div class="bar"><span class="hp" style="width:${hpPct}%"></span></div></div><div style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:10px"><span>EXP</span><span>${state.level>=50?"MAX":state.exp+" / "+need}</span></div><div class="bar"><span class="xp" style="width:${expPct}%"></span></div></div></div>`;
 let equips=`<div class="card"><h3>目前裝備</h3>${qualityLegend()}<div class="item">武器：${itemHtml(state.equipment.weapon,true)}</div><div class="item">防具：${itemHtml(state.equipment.armor,true)}</div><div class="item">飾品：${itemHtml(state.equipment.accessory,true)}</div></div>`;
 return wrapFunctionPage(`<div style="display:grid;gap:16px">${stats}${equips}</div>`);
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

function shopCooldownText(){
 let left=Math.max(0,(state.shop.resetAvailableAt||0)-Date.now());if(!left)return "可重置";
 let m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);return `${m} 分 ${String(s).padStart(2,"0")} 秒`;
}
function shopPage(){
 ensureShop();let cost=shopRefreshCost(),maxed=(state.shop.refreshIndex||0)>=7;
 let lost=state.lostGear||[];
 return `<div class="card"><h2>商店</h2>
 <div class="notice">商店商品會保存在存檔中，重新整理頁面不會更換。刷新價格會逐次提高；每購買 1 件裝備，刷新價格下降一階。</div>
 <div class="controls"><button class="btn" onclick="refreshShop()">刷新商店（${cost.toLocaleString()}）</button>
 ${maxed?`<button class="btn blue" onclick="manualResetShopPrice()" ${canResetShopPrice()?"":"disabled"}>重置刷新價格${canResetShopPrice()?"":"（"+shopCooldownText()+"）"}</button>`:""}
 <span class="muted">持有金幣：${state.gold.toLocaleString()}</span></div>
 <div style="overflow:auto;margin-top:10px"><table><thead><tr><th>商品</th><th>能力</th><th>價格</th><th></th></tr></thead><tbody>${state.shop.items.map((it,i)=>`<tr><td>${itemHtml(it,true)}</td><td>${statLine(it)}</td><td>${it.buy.toLocaleString()}</td><td><button class="btn" onclick="buyItem(${i})">購買</button></td></tr>`).join("")}</tbody></table></div>
 ${lost.length?`<h3 style="margin-top:24px">遺失裝備贖回</h3><div class="notice">死亡時遺失的裝備會暫存在此，可用金幣贖回。</div><div style="overflow:auto"><table><thead><tr><th>裝備</th><th>能力</th><th>贖回價格</th><th></th></tr></thead><tbody>${lost.map((x,i)=>`<tr><td>${itemHtml(x.item,true)}</td><td>${statLine(x.item)}</td><td>${x.cost.toLocaleString()}</td><td><button class="btn" onclick="redeemGear(${i})">贖回</button></td></tr>`).join("")}</tbody></table></div>`:""}
 </div>`;
}
function refreshShop(){let r=paidShopRefresh();if(!r.ok)return alert(r.reason);save();render()}
function buyItem(i){let r=shopPurchase(i);if(!r.ok)return alert(r.reason);save();render()}
function manualResetShopPrice(){let r=resetShopPrice();if(!r.ok)return alert(r.reason);save();render()}
function redeemGear(i){let r=redeemLostGear(i);if(!r.ok)return alert(r.reason);save();render()}

function settingsPage(){
 let s=state.settings;return `<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>
 <h3 style="margin-top:22px">自動出售</h3>${QUALITY.slice(0,5).map((q,i)=>`<div class="setting-row"><label><input type="checkbox" data-autosell="${i}" ${s.autoSell[i]?"checked":""}> <span class="${qClass(i)}">${q.n}</span></label></div>`).join("")}<div class="setting-row"><span class="q-mythic">神話</span><span class="muted">不可自動出售</span></div>
 <h3 style="margin-top:22px">遊戲設定</h3><div class="setting-row"><label><input id="keepUpgrade" type="checkbox" ${s.keepUpgrade?"checked":""}> 若新裝備比目前裝備強，自動保留</label></div>
 <h3 style="margin-top:22px">遊戲資料</h3><div class="setting-row"><span>本機自動存檔</span><span style="color:#72c982">已啟用</span></div><div class="controls"><button class="btn" onclick="exportSave()">匯出存檔</button><label class="btn">匯入存檔<input type="file" accept=".json" hidden onchange="importSave(event)"></label></div>
 ${state.gm?gmHtml():""}<div class="danger-zone"><b>危險操作</b><p class="muted">會清除目前全部遊戲進度。</p><button class="btn danger" onclick="resetGame()">重置遊戲</button></div></div>`;
}
function wireSettings(){
 let title=document.getElementById("settingsTitle");if(title){title.onclick=(ev)=>{if(ev.detail===3)openGMModal()}}
 document.querySelectorAll("[data-autosell]").forEach(el=>el.onchange=()=>{state.settings.autoSell[+el.dataset.autosell]=el.checked;save()});
 let el=document.getElementById("keepUpgrade");if(el)el.onchange=()=>{state.settings.keepUpgrade=el.checked;save()};
}
function gmHtml(){return `<div class="gm"><h3>管理／GM 模式</h3><div class="controls"><button class="btn" onclick="gmLevel()">指定等級</button><button class="btn" onclick="gmGold()">+10,000 金幣</button><button class="btn" onclick="rest()">補滿 HP</button><button class="btn" onclick="gmUnlock()">解鎖全部地圖</button><button class="btn" onclick="gmGear(3)">產生史詩裝</button><button class="btn" onclick="gmGear(4)">產生傳說裝</button><button class="btn" onclick="gmGear(5)">產生神話裝</button><button class="btn" onclick="gmBoss()">重生目前 Boss</button></div><h3 style="margin-top:16px">模擬測試</h3><div class="controls"><button class="btn blue" onclick="gmSim(100)">模擬 100 場</button><button class="btn blue" onclick="gmSim(1000)">模擬 1,000 場</button><button class="btn" onclick="state.gm=false;save();render()">關閉管理模式</button></div><div id="gmResult" class="notice">模擬不會修改正式存檔。</div></div>`}
function rest(){state.hp=equippedStats().hp;save();render()}
function openGMModal(){document.getElementById("passwordModal").classList.add("show");document.getElementById("gmPassword").focus()}
function closeGMModal(){document.getElementById("passwordModal").classList.remove("show")}
function unlockGM(){if(document.getElementById("gmPassword").value===GM_PASSWORD){state.gm=true;save();closeGMModal();render()}else alert("密碼錯誤。")}
function gmLevel(){let n=+prompt("指定等級（1～50）",state.level);if(!n)return;n=Math.max(1,Math.min(50,ceil(n)));state.level=n;state.exp=0;state.hp=equippedStats().hp;save();render()}
function gmGold(){state.gold+=10000;save();render()}
function gmUnlock(){state.unlockedMap=9;save();render()}
function gmGear(q){let mi=Math.min(9,Math.floor((state.level-1)/5));state.inventory.push(makeItem(state.level,mi,"normal",q));save();render()}
function gmBoss(){state.bossKilled[selectedMap]=true;state.bossProgress[selectedMap]=8;save();render()}
function gmSim(n){
 let e=monsterObj(selectedMap,selectedEnemy),ps=equippedStats(),wins=0,hpRemain=0,turns=0;
 for(let k=0;k<n;k++){let php=ps.hp,ehp=e.hp,t=0;while(php>0&&ehp>0&&t<200){t++;ehp-=calcDamage(ps.atk,e.def);if(ehp<=0)break;php-=calcDamage(e.atk,ps.def)}if(php>0){wins++;hpRemain+=php/ps.hp*100}turns+=t}
 document.getElementById("gmResult").innerHTML=`${e.name} × ${n.toLocaleString()} 場<br>勝率：${(wins/n*100).toFixed(1)}%<br>勝利時平均剩餘 HP：${wins?(hpRemain/wins).toFixed(1):0}%<br>平均回合：${(turns/n).toFixed(1)}`;
}
function exportSave(){let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rpg-save.json";a.click();URL.revokeObjectURL(a.href)}
function importSave(ev){let f=ev.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.level)throw 0;state=x;save();location.reload()}catch(e){alert("存檔格式不正確。")}};r.readAsText(f)}
function resetGame(){if(confirm("確定要清除全部遊戲進度嗎？此操作無法復原。")){state=newState();selectedMap=0;selectedEnemy=0;battleLogs=[];adventureScreen="maps";pendingContinuousBattle=null;save();view="home";render()}}
document.getElementById("brandTitle").onclick=()=>go("home");
load();render();