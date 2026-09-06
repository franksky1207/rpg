function renderNav(){
 let h=navs.map(([k,n])=>`<button class="${view===k?"active":""}" onclick="go('${k}')">${n}</button>`).join("");
 document.getElementById("topNav").innerHTML=h;document.getElementById("bottomNav").innerHTML=h;
}
function go(v){view=v;render()}
function render(){renderNav();normalizeHP();let fn={home:homePage,adventure:adventurePage,character:characterPage,inventory:inventoryPage,shop:shopPage,settings:settingsPage}[view];document.getElementById("main").innerHTML=fn();wireSettings()}
function sideCharacter(){
 let s=equippedStats(),need=state.level<50?expNeed(state.level):0,pct=state.level<50?Math.min(100,state.exp/need*100):100;
 return `<div class="card"><h3>角色資訊</h3><div class="stats"><div class="stat">等級<b>Lv.${state.level}</b></div><div class="stat">金幣<b>${state.gold.toLocaleString()}</b></div><div class="stat">攻擊<b>${s.atk}</b></div><div class="stat">防禦<b>${s.def}</b></div></div>
 <div style="margin-top:12px">HP ${state.hp} / ${s.hp}<div class="bar"><span class="hp" style="width:${state.hp/s.hp*100}%"></span></div></div>
 <div style="margin-top:10px">EXP ${state.level>=50?"MAX":state.exp+" / "+need}<div class="bar"><span class="xp" style="width:${pct}%"></span></div></div>
 <h3 style="margin-top:18px">目前裝備</h3>
 <div class="item">武器：${itemHtml(state.equipment.weapon,true)}</div><div class="item">防具：${itemHtml(state.equipment.armor,true)}</div><div class="item">飾品：${itemHtml(state.equipment.accessory,true)}</div></div>`;
}
function homePage(){return `<div class="grid">${sideCharacter()}<div class="card hero"><div class="muted">傳統、單純、純文字</div><h2>冒險者，歡迎回城</h2><p class="muted">打怪、升級、換裝，然後挑戰更強的敵人。</p><div class="hero-actions"><button class="btn primary" onclick="go('adventure')">前往冒險</button><button class="btn ok" onclick="rest()">休息・恢復全部 HP</button><button class="btn blue" onclick="go('inventory')">整理背包</button></div></div></div>`}
function adventurePage(){
 selectedMap=Math.min(selectedMap,state.unlockedMap);let map=MAPS[selectedMap],e=monsterObj(selectedMap,selectedEnemy);let maxBattles=state.level<=10?5:state.level<=20?10:state.level<=30?15:state.level<=40?20:25;
 let opts=[1,5,10,15,20,25].filter(x=>x===1||x<=maxBattles).map(x=>`<button onclick="setBattleCount(${x},this)" data-bc="${x}" class="${x===1?"active":""}">${x===1?"單場":x+" 場"}</button>`).join("");
 return `<div class="grid"><div class="card map-list"><h3>地圖</h3>${MAPS.map((m,i)=>`<button class="${i===selectedMap?"active":""} ${i>state.unlockedMap?"locked":""}" ${i>state.unlockedMap?"disabled":""} onclick="selectMap(${i})">${i+1}. ${m.name}<div class="muted">Lv.${m.min}～${m.max}</div></button>`).join("")}</div>
 <div><div class="card"><h2>${map.name} <span class="muted">Lv.${map.min}～${map.max}</span></h2><div class="enemy-list">${map.enemies.map((x,i)=>{let mo=monsterObj(selectedMap,i),badge=mo.kind==="elite"?`<span class="badge elite">菁英</span>`:mo.kind==="boss"?`<span class="badge boss">Boss</span>`:"";return `<button class="${i===selectedEnemy?"active":""}" onclick="selectEnemy(${i})">${mo.name} Lv.${mo.level}${badge}<div class="muted">HP ${mo.hp}　攻擊 ${mo.atk}　防禦 ${mo.def}</div></button>`}).join("")}</div>
 ${e.kind==="boss"?`<div class="notice">${state.level<map.max?`需要 Lv.${map.max} 才能挑戰 Boss。`:`Boss 再次挑戰條件：擊敗 8 隻非 Boss 敵人（${canBoss(selectedMap)?"可挑戰":state.bossProgress[selectedMap]+"/8"}）`}</div>`:""}
 <h3>連續戰鬥</h3><div class="seg" id="battleSeg">${opts}</div><input type="hidden" id="battleCount" value="1"><div class="controls"><button class="btn primary" onclick="startBattles()">開始戰鬥</button><button class="btn ok" onclick="rest()">回城休息</button></div></div>
 <div class="card" style="margin-top:16px"><h3>戰鬥紀錄</h3><div class="log">${battleLogs.length?battleLogs.map(x=>`<div>${x}</div>`).join(""):`<div class="muted">尚未進行戰鬥。</div>`}</div></div></div></div>`;
}
function setBattleCount(n,el){document.getElementById("battleCount").value=n;document.querySelectorAll("#battleSeg button").forEach(b=>b.classList.remove("active"));el.classList.add("active")}
function selectMap(i){selectedMap=i;selectedEnemy=0;battleLogs=[];render()}
function selectEnemy(i){selectedEnemy=i;battleLogs=[];render()}
async function startBattles(){
 if(battleBusy)return;battleBusy=true;let count=+(document.getElementById("battleCount")?.value||1),summary=[],wins=0,totalXp=0,totalGold=0,drops=0;
 for(let i=1;i<=count;i++){
   let r=fightOnce(selectedMap,selectedEnemy);
   if(!r.ok){summary.push(r.reason);break}
   if(r.win){wins++;totalXp+=r.xp;totalGold+=r.gold;if(r.item)drops++;if(count===1&&state.settings.fullLog)summary.push(...r.logs);else summary.push(`第 ${i} 場：勝利${r.item?`，${r.sold?"裝備自動出售":"掉落 "+itemHtmlPlain(r.item)}`:""}`)}
   else{if(count===1&&state.settings.fullLog)summary.push(...r.logs);else summary.push(`第 ${i} 場：戰敗，連續戰鬥中止。`);break}
   if(!state.settings.fastBattle)await new Promise(res=>setTimeout(res,Math.min(650,120+state.level*4)));
 }
 battleLogs=summary;
 if(count>1)battleLogs.push(`結算：勝利 ${wins}/${count}，EXP +${totalXp}，金幣 +${totalGold}，掉落 ${drops} 件。`);
 save();battleBusy=false;render();
}
function characterPage(){let s=equippedStats();return `<div class="grid">${sideCharacter()}<div class="card"><h2>角色</h2><div class="grid3"><div class="stat">最大 HP<b>${s.hp}</b></div><div class="stat">總攻擊<b>${s.atk}</b></div><div class="stat">總防禦<b>${s.def}</b></div></div><h3 style="margin-top:18px">裝備</h3>${["weapon","armor","accessory"].map(t=>`<div class="item">${t==="weapon"?"武器":t==="armor"?"防具":"飾品"}：${itemHtml(state.equipment[t])}</div>`).join("")}</div></div>`}
function inventoryPage(){
 let items=state.inventory.slice().sort((a,b)=>b.q-a.q||b.level-a.level);let sel=items.find(x=>x.id===selectedItem)||items[0];selectedItem=sel?.id||null;
 return `<div class="grid"><div class="card"><h3>目前裝備</h3>${["weapon","armor","accessory"].map(t=>`<div class="item">${t==="weapon"?"武器":t==="armor"?"防具":"飾品"}<br>${itemHtml(state.equipment[t])}</div>`).join("")}</div>
 <div class="card"><h2>背包（${state.inventory.length} 件）</h2>${items.length?`<div style="overflow:auto"><table><thead><tr><th>裝備</th><th>類型</th><th>能力</th><th>售價</th></tr></thead><tbody>${items.map(it=>`<tr onclick="selectItem('${it.id}')" style="cursor:pointer;background:${it.id===selectedItem?"#211d16":"transparent"}"><td>${it.locked?"🔒 ":""}${itemHtml(it,true)}</td><td>${it.type==="weapon"?"武器":it.type==="armor"?"防具":"飾品"}</td><td>${statLine(it)}</td><td>${it.sell}</td></tr>`).join("")}</tbody></table></div>${sel?compareHtml(sel):""}`:`<div class="muted">背包是空的。</div>`}</div></div>`;
}
function compareHtml(it){let old=state.equipment[it.type],diff=equipmentScore(it)-equipmentScore(old);return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3><div class="grid3"><div><div class="muted">目前</div>${itemHtml(old)}</div><div><div class="muted">新裝備</div>${itemHtml(it)}</div><div><div class="muted">整體比較</div><b style="color:${diff>0?"#76d587":diff<0?"#e27474":"#ccc"}">${diff>0?"+":""}${diff}</b></div></div><div class="controls"><button class="btn blue" onclick="equipSelected()">裝備</button><button class="btn" onclick="sellSelected()">出售</button><button class="btn" onclick="toggleLock()">${it.locked?"解除鎖定":"鎖定"}</button></div></div>`}
function selectItem(id){selectedItem=id;render()}
function equipSelected(){let i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return;let it=state.inventory.splice(i,1)[0],old=state.equipment[it.type];state.equipment[it.type]=it;if(old)state.inventory.push(old);normalizeHP();save();render()}
function sellSelected(){let i=state.inventory.findIndex(x=>x.id===selectedItem);if(i<0)return;let it=state.inventory[i];if(it.locked)return alert("這件裝備已鎖定，請先解除鎖定。");if(it.q===5&&!confirm("這是神話裝備，確定要出售嗎？"))return;state.inventory.splice(i,1);state.gold+=it.sell;selectedItem=null;save();render()}
function toggleLock(){let it=state.inventory.find(x=>x.id===selectedItem);if(!it)return;it.locked=!it.locked;save();render()}
function generateShop(){
 let mapIdx=Math.min(state.unlockedMap,Math.floor((state.level-1)/5)),m=MAPS[mapIdx];shopItems=[];
 for(let i=0;i<6;i++){let lv=Math.max(m.min,Math.min(m.max,state.level+Math.floor(Math.random()*3)-1));let r=Math.random()*100,q=r<48?0:r<82?1:r<96?2:r<99.3?3:r<99.9?4:4;shopItems.push(makeItem(lv,mapIdx,"normal",q))}
}
function shopPage(){if(!shopItems.length)generateShop();return `<div class="card"><h2>商店</h2><div class="notice">刷新商品：1,000 金幣。商店不販售神話裝備。</div><div class="controls"><button class="btn" onclick="refreshShop()">刷新商店（1,000）</button><span class="muted">持有金幣：${state.gold.toLocaleString()}</span></div><div style="overflow:auto;margin-top:10px"><table><thead><tr><th>商品</th><th>能力</th><th>價格</th><th></th></tr></thead><tbody>${shopItems.map((it,i)=>`<tr><td>${itemHtml(it,true)}</td><td>${statLine(it)}</td><td>${it.buy.toLocaleString()}</td><td><button class="btn" onclick="buyItem(${i})">購買</button></td></tr>`).join("")}</tbody></table></div></div>`}
function refreshShop(){if(state.gold<1000)return alert("金幣不足。");state.gold-=1000;generateShop();save();render()}
function buyItem(i){let it=shopItems[i];if(!it)return;if(state.gold<it.buy)return alert("金幣不足。");state.gold-=it.buy;state.inventory.push(it);shopItems.splice(i,1);save();render()}
function settingsPage(){
 let s=state.settings;return `<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>
 <h3 style="margin-top:22px">自動出售</h3>${QUALITY.slice(0,5).map((q,i)=>`<div class="setting-row"><label><input type="checkbox" data-autosell="${i}" ${s.autoSell[i]?"checked":""}> <span class="${qClass(i)}">${q.n}</span></label></div>`).join("")}<div class="setting-row"><span class="q-mythic">神話</span><span class="muted">不可自動出售</span></div>
 <h3 style="margin-top:22px">遊戲設定</h3><div class="setting-row"><label><input id="keepUpgrade" type="checkbox" ${s.keepUpgrade?"checked":""}> 若新裝備比目前裝備強，自動保留</label></div><div class="setting-row"><label><input id="fastBattle" type="checkbox" ${s.fastBattle?"checked":""}> 快速結算</label></div><div class="setting-row"><label><input id="fullLog" type="checkbox" ${s.fullLog?"checked":""}> 顯示完整單場戰鬥紀錄</label></div>
 <h3 style="margin-top:22px">遊戲資料</h3><div class="setting-row"><span>本機自動存檔</span><span style="color:#72c982">已啟用</span></div><div class="controls"><button class="btn" onclick="exportSave()">匯出存檔</button><label class="btn">匯入存檔<input type="file" accept=".json" hidden onchange="importSave(event)"></label></div>
 ${state.gm?gmHtml():""}<div class="danger-zone"><b>危險操作</b><p class="muted">會清除目前全部遊戲進度。</p><button class="btn danger" onclick="resetGame()">重置遊戲</button></div></div>`;
}
function wireSettings(){
 let title=document.getElementById("settingsTitle");if(title){title.onclick=(ev)=>{if(ev.detail===3)openGMModal()}}
 document.querySelectorAll("[data-autosell]").forEach(el=>el.onchange=()=>{state.settings.autoSell[+el.dataset.autosell]=el.checked;save()});
 ["keepUpgrade","fastBattle","fullLog"].forEach(id=>{let el=document.getElementById(id);if(el)el.onchange=()=>{state.settings[id]=el.checked;save()}});
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
function importSave(ev){let f=ev.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.level)throw 0;state=x;save();render();alert("存檔匯入完成。")}catch(e){alert("存檔格式不正確。")}};r.readAsText(f)}
function resetGame(){if(confirm("確定要清除全部遊戲進度嗎？此操作無法復原。")){state=newState();selectedMap=0;selectedEnemy=0;battleLogs=[];shopItems=[];save();view="home";render()}}
document.getElementById("brandTitle").onclick=()=>go("home");
load();render();