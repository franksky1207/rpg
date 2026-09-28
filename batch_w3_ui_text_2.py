from pathlib import Path

TAG='20260928-thirdworld-ui-text-batch2'

def replace(path, old, new, count=1):
    p=Path(path); s=p.read_text(encoding='utf-8')
    actual=s.count(old)
    if actual!=count:
        raise SystemExit(f'{path}: expected {count} matches, got {actual}: {old[:140]}')
    p.write_text(s.replace(old,new,count),encoding='utf-8')

# ui.js: phase-aware inventory/settings presentation; W3 has no lost-gear redemption UI.
replace('ui.js',
'''function lostGearSectionHtml(){
 const lost=Array.isArray(state.lostGear)?state.lostGear:[];''',
'''function lostGearSectionHtml(){
 if(typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true)return "";
 const lost=Array.isArray(state.lostGear)?state.lostGear:[];''')
replace('ui.js',
''' const filterOptions=`<option value="all" ${inventoryFilter==="all"?"selected":""}>全部</option>${EQUIPMENT_TYPES.map(t=>`<option value="${t}" ${inventoryFilter===t?"selected":""}>${equipmentTypeLabel(t)}</option>`).join("")}`;
 const main=`<div class="grid"><div class="card"><h3>目前裝備</h3>${qualityLegend()}${EQUIPMENT_TYPES.map(t=>`<div class="item"><b>${equipmentTypeLabel(t)}</b><br>${itemHtml(state.equipment[t],true)}${state.equipment[t]?gearAbilityHtml(state.equipment[t],true):""}</div>`).join("")}</div>
 <div class="card"><h2>背包（${state.inventory.length} 件）</h2><div class="controls"><select class="btn" onchange="setInventoryFilter(this.value)">${filterOptions}</select><span class="muted" style="align-self:center">排序：評分高→低</span></div><div class="controls"><button class="btn blue" onclick="equipBestAll()">一鍵裝備較強裝備</button><button class="btn" onclick="sellLowerAll()">一鍵賣出較低裝備</button></div>${items.length?`<div style="overflow:auto"><table><thead><tr><th>裝備</th><th>類型</th><th>能力／詞條</th><th>評分</th><th>售價</th></tr></thead><tbody>${items.map(it=>{const quote=typeof window.equipmentSaleQuote==="function"?window.equipmentSaleQuote(it):null;const price=quote&&typeof window.equipmentSaleText==="function"?window.equipmentSaleText(quote):secondWorldActive()?"出售系統未載入":specializationSellValue(it).toLocaleString()+" 金幣";return `<tr onclick="selectItem('${it.id}')" style="cursor:pointer;background:${it.id===selectedItem?"#211d16":"transparent"}"><td>${itemHtml(it,true)}</td><td>${equipmentTypeLabel(it.type)}</td><td>${gearAbilityHtml(it,false)}</td><td>${equipmentScore(it)}</td><td>${price}</td></tr>`;}).join("")}</tbody></table></div>${sel?compareHtml(sel):""}`:`<div class="muted" style="margin-top:12px">${state.inventory.length?"目前篩選沒有裝備。":"背包是空的。"}</div>`}</div></div>`;''',
''' const filterOptions=`<option value="all" ${inventoryFilter==="all"?"selected":""}>全部</option>${EQUIPMENT_TYPES.map(t=>`<option value="${t}" ${inventoryFilter===t?"selected":""}>${equipmentTypeLabel(t)}</option>`).join("")}`;
 const third=typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;
 const lowerAction=third?"一鍵處理較低裝備":"一鍵賣出較低裝備",valueLabel=third?"處理結果":"售價";
 const main=`<div class="grid"><div class="card"><h3>目前裝備</h3>${qualityLegend()}${EQUIPMENT_TYPES.map(t=>`<div class="item"><b>${equipmentTypeLabel(t)}</b><br>${itemHtml(state.equipment[t],true)}${state.equipment[t]?gearAbilityHtml(state.equipment[t],true):""}</div>`).join("")}</div>
 <div class="card"><h2>背包（${state.inventory.length} 件）</h2><div class="controls"><select class="btn" onchange="setInventoryFilter(this.value)">${filterOptions}</select><span class="muted" style="align-self:center">排序：評分高→低</span></div><div class="controls"><button class="btn blue" onclick="equipBestAll()">一鍵裝備較強裝備</button><button class="btn" onclick="sellLowerAll()">${lowerAction}</button></div>${items.length?`<div style="overflow:auto"><table><thead><tr><th>裝備</th><th>類型</th><th>能力／詞條</th><th>評分</th><th>${valueLabel}</th></tr></thead><tbody>${items.map(it=>{const quote=typeof window.equipmentSaleQuote==="function"?window.equipmentSaleQuote(it):null;const price=third?"不產生資源":quote&&typeof window.equipmentSaleText==="function"?window.equipmentSaleText(quote):secondWorldActive()?"出售系統未載入":specializationSellValue(it).toLocaleString()+" 金幣";return `<tr onclick="selectItem('${it.id}')" style="cursor:pointer;background:${it.id===selectedItem?"#211d16":"transparent"}"><td>${itemHtml(it,true)}</td><td>${equipmentTypeLabel(it.type)}</td><td>${gearAbilityHtml(it,false)}</td><td>${equipmentScore(it)}</td><td>${price}</td></tr>`;}).join("")}</tbody></table></div>${sel?compareHtml(sel):""}`:`<div class="muted" style="margin-top:12px">${state.inventory.length?"目前篩選沒有裝備。":"背包是空的。"}</div>`}</div></div>`;''')
replace('ui.js',
''' const body=`<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>
 <h3 style="margin-top:22px">自動出售</h3>${QUALITY.slice(0,5).map((q,i)=>`<div class="setting-row"><label><input type="checkbox" data-autosell="${i}" ${s.autoSell[i]?"checked":""}> <span class="${qClass(i)}">${q.n}</span></label></div>`).join("")}<div class="setting-row"><span class="q-mythic">神話</span><span class="muted">不可自動出售</span></div>''',
''' const third=typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;
 const autoTitle=third?"自動處理":"自動出售",mythicAuto=third?"不可自動處理":"不可自動出售";
 const body=`<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>
 <h3 style="margin-top:22px">${autoTitle}</h3>${QUALITY.slice(0,5).map((q,i)=>`<div class="setting-row"><label><input type="checkbox" data-autosell="${i}" ${s.autoSell[i]?"checked":""}> <span class="${qClass(i)}">${q.n}</span></label></div>`).join("")}<div class="setting-row"><span class="q-mythic">神話</span><span class="muted">${mythicAuto}</span></div>''')
replace('ui.js','window.INVENTORY_SALE_DISPLAY_FAIL_CLOSED_VERSION=1;','window.INVENTORY_SALE_DISPLAY_FAIL_CLOSED_VERSION=2;\nwindow.THIRD_WORLD_INVENTORY_PROCESSING_UI_VERSION=1;\nwindow.THIRD_WORLD_LOST_GEAR_UI_POLICY_VERSION=1;')

# equipmentlock.js: keep API/save field names, change only W3 player-facing semantics.
replace('equipmentlock.js',
''' function secondWorldActive(){
  return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;
 }''',
''' function secondWorldActive(){
  return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;
 }
 function thirdWorldActive(){return typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;}
 function processingRewardText(value){return thirdWorldActive()?"不產生資源":saleText(value);}''')
replace('equipmentlock.js',
'''  return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3><div class="grid3"><div><div class="muted">目前</div>${itemHtml(old,true)}${old?gearAbilityHtml(old,true):""}</div><div><div class="muted">新裝備</div>${itemHtml(it,true)}${gearAbilityHtml(it,true)}</div><div><div class="muted">整體比較</div><div>目前 ${old?oldScore:"無"}</div><div>新裝備 ${newScore}</div><b style="color:${diff>0?"#76d587":diff<0?"#e27474":"#ccc"}">${diff>0?"+":""}${diff}</b></div></div><div class="controls"><button class="btn blue" onclick="equipSelected()">裝備</button><button class="btn ${locked?"ok":""}" onclick="toggleSelectedItemLock()">${locked?"🔒 已鎖定｜點擊解鎖":"🔓 鎖定裝備"}</button><button class="btn" onclick="sellSelected()" ${locked?"disabled":""}>出售</button></div>${locked?`<div class="muted" style="margin-top:7px">此裝備已鎖定，不會被手動出售、一鍵出售或自動出售。</div>`:""}</div>`;''',
'''  const action=thirdWorldActive()?"處理":"出售";
  const lockNote=thirdWorldActive()?"此裝備已鎖定，不會被手動處理、一鍵處理或自動處理。":"此裝備已鎖定，不會被手動出售、一鍵出售或自動出售。";
  return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3><div class="grid3"><div><div class="muted">目前</div>${itemHtml(old,true)}${old?gearAbilityHtml(old,true):""}</div><div><div class="muted">新裝備</div>${itemHtml(it,true)}${gearAbilityHtml(it,true)}</div><div><div class="muted">整體比較</div><div>目前 ${old?oldScore:"無"}</div><div>新裝備 ${newScore}</div><b style="color:${diff>0?"#76d587":diff<0?"#e27474":"#ccc"}">${diff>0?"+":""}${diff}</b></div></div><div class="controls"><button class="btn blue" onclick="equipSelected()">裝備</button><button class="btn ${locked?"ok":""}" onclick="toggleSelectedItemLock()">${locked?"🔒 已鎖定｜點擊解鎖":"🔓 鎖定裝備"}</button><button class="btn" onclick="sellSelected()" ${locked?"disabled":""}>${action}</button></div>${locked?`<div class="muted" style="margin-top:7px">${lockNote}</div>`:""}</div>`;''')
replace('equipmentlock.js',
'''  if(r.handled?.sale){
   const stoneText=saleEnhancementText(r.enhancementStones),reward=saleText(r.handled.sale);
   alert(`已裝備新裝備。換下裝備自動出售，獲得 ${reward}${stoneText?`，另獲得 ${stoneText}`:""}。`);
  }''',
'''  if(r.handled?.sale){
   if(thirdWorldActive())alert("已裝備新裝備。換下裝備已自動處理，不產生資源。");
   else{const stoneText=saleEnhancementText(r.enhancementStones),reward=saleText(r.handled.sale);alert(`已裝備新裝備。換下裝備自動出售，獲得 ${reward}${stoneText?`，另獲得 ${stoneText}`:""}。`);}
  }''')
replace('equipmentlock.js',
'''  const stoneText=saleEnhancementText(r.enhancementStones);
  const soldText=r.soldCount?`\n換下裝備自動出售 ${r.soldCount} 件，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`:"";
  alert(`已更換 ${r.changed} 件較強裝備。${soldText}`);''',
'''  const stoneText=saleEnhancementText(r.enhancementStones);
  const soldText=r.soldCount?(thirdWorldActive()?`\n換下裝備已自動處理 ${r.soldCount} 件，不產生資源。`:`\n換下裝備自動出售 ${r.soldCount} 件，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`):"";
  alert(`已更換 ${r.changed} 件較強裝備。${soldText}`);''')
replace('equipmentlock.js',
'''  if(r.reason==="locked")return alert("這件裝備已鎖定，請先解鎖後再出售。");
  if(r.reason==="mythic"){
   const preview=saleQuote(r.item);
   if(!confirm(`這是神話裝備，出售可獲得 ${saleText(preview)}。確定要出售嗎？`))return;
   r=equipmentSellSelected({confirmMythic:true});
  }
  if(!r.ok)return alert("裝備出售失敗。");
  const stoneText=saleEnhancementText(r.enhancementStones);
  save();render();
  alert(`已出售裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);''',
'''  if(r.reason==="locked")return alert(thirdWorldActive()?"這件裝備已鎖定，請先解鎖後再處理。":"這件裝備已鎖定，請先解鎖後再出售。");
  if(r.reason==="mythic"){
   const preview=saleQuote(r.item);
   const question=thirdWorldActive()?"這是神話裝備，處理後將永久移除且不產生資源。確定要處理嗎？":`這是神話裝備，出售可獲得 ${saleText(preview)}。確定要出售嗎？`;
   if(!confirm(question))return;
   r=equipmentSellSelected({confirmMythic:true});
  }
  if(!r.ok)return alert(thirdWorldActive()?"裝備處理失敗。":"裝備出售失敗。");
  const stoneText=saleEnhancementText(r.enhancementStones);
  save();render();
  if(thirdWorldActive())alert("已處理裝備，不產生資源。");
  else alert(`已出售裝備，獲得 ${processingRewardText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);''')
replace('equipmentlock.js',
'''  if(!preview.targets.length)return alert("沒有可出售的未鎖定較低裝備。");
  if(!confirm(`將出售 ${preview.targets.length} 件未鎖定的較低或同能力裝備，共獲得 ${saleText(preview.quote)}。確定出售嗎？`))return;
  const r=equipmentSellLowerAll(preview);if(!r.ok)return alert("批量出售失敗。");save();render();
  const stoneText=saleEnhancementText(r.enhancementStones);
  alert(`已出售 ${r.count} 件裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);''',
'''  if(!preview.targets.length)return alert(thirdWorldActive()?"沒有可處理的未鎖定較低裝備。":"沒有可出售的未鎖定較低裝備。");
  const question=thirdWorldActive()?`將處理 ${preview.targets.length} 件未鎖定的較低或同能力裝備；處理後永久移除且不產生資源。確定處理嗎？`:`將出售 ${preview.targets.length} 件未鎖定的較低或同能力裝備，共獲得 ${saleText(preview.quote)}。確定出售嗎？`;
  if(!confirm(question))return;
  const r=equipmentSellLowerAll(preview);if(!r.ok)return alert(thirdWorldActive()?"批量處理失敗。":"批量出售失敗。");save();render();
  const stoneText=saleEnhancementText(r.enhancementStones);
  if(thirdWorldActive())alert(`已處理 ${r.count} 件裝備，不產生資源。`);
  else alert(`已出售 ${r.count} 件裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);''')
replace('equipmentlock.js','window.EQUIPMENT_SALE_FAIL_CLOSED_VERSION=1;','window.EQUIPMENT_SALE_FAIL_CLOSED_VERSION=2;\n window.THIRD_WORLD_EQUIPMENT_PROCESSING_UI_VERSION=1;')

# secondworldrewards.js: same shared sale API, but phase 3 processing must never recreate retired currencies.
replace('secondworldrewards.js',
'''  const rawWorld=Math.floor(Number(item.world)||1),world=rawWorld===3?3:(rawWorld===2?2:1);
  if(world===3)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world:3,phase};
  if(phase>=2){''',
'''  const rawWorld=Math.floor(Number(item.world)||1),world=rawWorld===3?3:(rawWorld===2?2:1);
  if(phase===3)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world,phase};
  if(world===3)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world:3,phase};
  if(phase===2){''')
replace('secondworldrewards.js','window.SECOND_WORLD_REWARD_VERSION=VERSION;','window.SECOND_WORLD_REWARD_VERSION=VERSION;\n window.THIRD_WORLD_EQUIPMENT_PROCESSING_REWARD_POLICY_VERSION=1;')

# Runtime integrity: protect Batch 2 semantics and current cache-busts.
replace('tests/runtime/js-integrity.js','const inventoryFocus=read("inventoryfocus.js");','const inventoryFocus=read("inventoryfocus.js");\nconst equipmentLock=read("equipmentlock.js");')
replace('tests/runtime/js-integrity.js',
'''assert(index.includes('secondworldrewards.js?v=20260925-vip-loot-cleanup1')&&index.includes('secondworldmainline.js?v=20260928-thirdworld-batch11-o3'),"index.html 必須載入 VIP Loot Cleanup1 最新宇宙主線 cache-bust。");''',
'''assert(index.includes('secondworldrewards.js?v=20260928-thirdworld-ui-text-batch2')&&index.includes('secondworldmainline.js?v=20260928-thirdworld-batch11-o3'),"index.html 必須載入目前宇宙／高維共用裝備處理 reward owner cache-bust。");''')
insert='''assert(/THIRD_WORLD_INVENTORY_PROCESSING_UI_VERSION=1/.test(ui)&&/THIRD_WORLD_LOST_GEAR_UI_POLICY_VERSION=1/.test(ui)&&/一鍵處理較低裝備/.test(ui)&&/不產生資源/.test(ui),"W3 背包必須使用處理語意、零資源顯示與無贖回 UI policy。\n");'''
# avoid accidental embedded newline typo in assertion message by inserting a clean line below inventory focus cache check
insert='assert(/THIRD_WORLD_INVENTORY_PROCESSING_UI_VERSION=1/.test(ui)&&/THIRD_WORLD_LOST_GEAR_UI_POLICY_VERSION=1/.test(ui)&&/一鍵處理較低裝備/.test(ui)&&/不產生資源/.test(ui),"W3 背包必須使用處理語意、零資源顯示與無贖回 UI policy。");\nassert(/THIRD_WORLD_EQUIPMENT_PROCESSING_UI_VERSION=1/.test(equipmentLock)&&/處理後將永久移除且不產生資源/.test(equipmentLock)&&/不會被手動處理、一鍵處理或自動處理/.test(equipmentLock),"W3 裝備操作提示必須統一使用處理語意。\");\nassert(/THIRD_WORLD_EQUIPMENT_PROCESSING_REWARD_POLICY_VERSION=1/.test(secondWorldRewards)&&/if\\(phase===3\\)return \\{currency:\"none\",amount:0,gold:0,darkMatter:0,darkEnergy:0,world,phase\\}/.test(secondWorldRewards),"W3 裝備處理不得產生金幣、暗物質或暗能量。\");\nassert(index.includes(\'ui.js?v=20260928-thirdworld-ui-text-batch2\')&&index.includes(\'equipmentlock.js?v=20260928-thirdworld-ui-text-batch2\'),"W3 Batch 2 玩家背包／設定 owner 必須同步 cache-bust。\");\n'
anchor='assert(index.includes(\'inventoryfocus.js?v=20260925-inventory-focus-cleanup1\'),"index.html 必須載入正式 inventoryfocus.js cache-bust。\");\n'
replace('tests/runtime/js-integrity.js',anchor,anchor+insert)

# index cache-bust.
cache={
 'ui.js?v=20260928-thirdworld-batch11-o3':f'ui.js?v={TAG}',
 'equipmentlock.js?v=20260922-equipment-owner-batch3fix1':f'equipmentlock.js?v={TAG}',
 'secondworldrewards.js?v=20260925-vip-loot-cleanup1-20260927-thirdworld-progress-batch6-3':f'secondworldrewards.js?v={TAG}',
}
for old,new in cache.items(): replace('index.html',old,new)

print('batch 2 W3 inventory/settings processing semantics applied')
