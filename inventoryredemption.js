(function(){
 function lostGearCompareHtml(it){
  const current=state.equipment[it.type];
  const itemScore=equipmentScore(it);
  const currentScore=current?equipmentScore(current):null;
  const diff=current?round1(itemScore-currentScore):itemScore;
  const diffText=current?`${diff>0?"+":""}${diff}`:"目前無裝備";
  const diffColor=!current?"#e5cf9a":diff>0?"#76d587":diff<0?"#e27474":"#ccc";
  const currentHtml=current?`${itemHtml(current,true)}<div class="muted" style="margin-top:4px">評分 ${currentScore}</div>`:`<span class="muted">無</span>`;
  return `<div class="muted">目前</div>${currentHtml}<div style="margin-top:6px"><span class="muted">遺失裝備評分 ${itemScore}</span>　<b style="color:${diffColor}">${diffText}</b></div>`;
 }

 gearAbilityHtml=function(it,withScore=false){
  if(!it)return `<span class="muted">無</span>`;
  const rows=itemAbilityLines(it);
  const body=rows.map(r=>`<div>${r.kind==="main"?`<span class="muted">主能力</span> `:r.kind==="affix"?`<span class="muted">詞條</span> `:""}${r.text}</div>`).join("");
  return `<div class="gear-stat-list">${body}${withScore?`<div class="muted" style="margin-top:5px">評分 ${equipmentScore(it)}</div>`:""}</div>`;
 };

 homePage=function(){
  return `<section class="home-screen">
   <div class="home-title"><h2>文明戰線</h2><div class="muted">打怪、升級、換裝，前往更強的地圖。</div></div>
   <div class="menu-grid">
    <button class="menu-card" onclick="go('adventure')"><b>冒險</b><span>選擇地圖並挑戰怪物</span></button>
    <button class="menu-card" onclick="go('character')"><b>角色</b><span>查看能力與目前裝備</span></button>
    <button class="menu-card" onclick="go('specialization')"><b>專精</b><span>消耗金幣提升永久能力</span></button>
    <button class="menu-card" onclick="go('dungeon')"><b>副本</b><span>挑戰懸賞、競技場與虛空幻境</span></button>
    <button class="menu-card" onclick="go('inventory')"><b>背包</b><span>整理、裝備、出售與贖回遺失裝備</span></button>
    <button class="menu-card" onclick="go('guide')"><b>遊戲說明</b><span>查看玩法與規則</span></button>
    <button class="menu-card" onclick="go('settings')"><b>設定</b><span>自動出售、存檔與遊戲設定</span></button>
   </div>
  </section>`;
 };

 function lostGearSectionHtml(){
  const lost=Array.isArray(state.lostGear)?state.lostGear:[];
  if(!lost.length){
   return `<div class="card lost-gear-card"><h2>遺失裝備贖回</h2><div class="muted">目前沒有遺失裝備。</div></div>`;
  }
  const rows=lost.map((x,i)=>`<tr><td data-label="裝備" class="lost-gear-item-cell">${itemHtml(x.item,true)}</td><td data-label="能力" class="lost-gear-stats-cell">${gearAbilityHtml(x.item,false)}</td><td data-label="比較" class="lost-gear-compare-cell">${lostGearCompareHtml(x.item)}</td><td data-label="贖回價格" class="lost-gear-price-cell">${x.cost.toLocaleString()}</td><td class="lost-gear-action-cell"><div class="controls lost-gear-row-actions"><button class="btn" onclick="redeemGear(${i})">贖回</button><button class="btn danger" onclick="discardLostGear(${i})">放棄</button></div></td></tr>`).join("");
  return `<div class="card lost-gear-card"><h2>遺失裝備贖回</h2><div class="notice">可先和目前裝備比較；不值得贖回的裝備可直接放棄，放棄後永久刪除。</div><div class="lost-gear-table-wrap"><table class="lost-gear-table"><thead><tr><th>裝備</th><th>主能力／詞條</th><th>與目前裝備比較</th><th>贖回價格</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
 }

 inventoryContent=function(){
  const items=state.inventory.filter(it=>inventoryFilter==="all"||it.type===inventoryFilter).slice().sort((a,b)=>equipmentScore(b)-equipmentScore(a)||b.q-a.q||b.level-a.level);
  const sel=items.find(x=>x.id===selectedItem)||items[0];selectedItem=sel?.id||null;
  const filterOptions=`<option value="all" ${inventoryFilter==="all"?"selected":""}>全部</option>${EQUIPMENT_TYPES.map(t=>`<option value="${t}" ${inventoryFilter===t?"selected":""}>${equipmentTypeLabel(t)}</option>`).join("")}`;
  const main=`<div class="grid"><div class="card"><h3>目前裝備</h3>${qualityLegend()}${EQUIPMENT_TYPES.map(t=>`<div class="item"><b>${equipmentTypeLabel(t)}</b><br>${itemHtml(state.equipment[t],true)}${state.equipment[t]?gearAbilityHtml(state.equipment[t],true):""}</div>`).join("")}</div>
  <div class="card"><h2>背包（${state.inventory.length} 件）</h2><div class="controls"><select class="btn" onchange="setInventoryFilter(this.value)">${filterOptions}</select><span class="muted" style="align-self:center">排序：評分高→低</span></div><div class="controls"><button class="btn blue" onclick="equipBestAll()">一鍵裝備較強裝備</button><button class="btn" onclick="sellLowerAll()">一鍵賣出較低裝備</button></div>${items.length?`<div style="overflow:auto"><table><thead><tr><th>裝備</th><th>類型</th><th>能力／詞條</th><th>評分</th><th>售價</th></tr></thead><tbody>${items.map(it=>`<tr onclick="selectItem('${it.id}')" style="cursor:pointer;background:${it.id===selectedItem?"#211d16":"transparent"}"><td>${itemHtml(it,true)}</td><td>${equipmentTypeLabel(it.type)}</td><td>${gearAbilityHtml(it,false)}</td><td>${equipmentScore(it)}</td><td>${specializationSellValue(it)}</td></tr>`).join("")}</tbody></table></div>${sel?compareHtml(sel):""}`:`<div class="muted" style="margin-top:12px">${state.inventory.length?"目前篩選沒有裝備。":"背包是空的。"}</div>`}</div></div>`;
  return `${main}${lostGearSectionHtml()}`;
 };

 inventoryPage=function(){
  const back=inventoryFromAdventure?`<div class="back-home"><button class="btn back-btn" onclick="backToAdventureFromInventory()">← 返回冒險</button></div>`:homeBackHtml();
  return `<div class="function-page inventory-page">${back}${inventoryContent()}</div>`;
 };

 redeemGear=function(i){
  const r=redeemLostGear(i);
  if(!r.ok)return alert(r.reason);
  save();render();
 };

 render=function(){
  renderNav();normalizeHP();ensureSpecializationState();
  const fn={home:homePage,adventure:adventurePage,character:characterPage,specialization:specializationPage,inventory:inventoryPage,guide:gameGuidePage,settings:settingsPage}[view]||homePage;
  document.getElementById("main").innerHTML=fn();wireSettings();setTimeout(compactMobileDom,0);
 };

 render();
 window.INVENTORY_REDEMPTION_UI_VERSION=2;
})();
