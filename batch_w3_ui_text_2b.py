from pathlib import Path
import re

TAG='20260928-thirdworld-ui-text-batch2'

def replace(path, old, new, count=1):
    p=Path(path); s=p.read_text(encoding='utf-8')
    actual=s.count(old)
    if actual!=count:
        raise SystemExit(f'{path}: expected {count} matches, got {actual}: {old[:120]!r}')
    p.write_text(s.replace(old,new,count),encoding='utf-8')

def sub(path, pattern, repl, count=1, flags=0):
    p=Path(path); s=p.read_text(encoding='utf-8')
    out,n=re.subn(pattern,repl,s,count=count,flags=flags)
    if n!=count: raise SystemExit(f'{path}: regex expected {count}, got {n}: {pattern[:120]}')
    p.write_text(out,encoding='utf-8')

# ---- ui.js ----
replace('ui.js','function lostGearSectionHtml(){\n const lost=Array.isArray(state.lostGear)?state.lostGear:[];',
'''function lostGearSectionHtml(){
 if(typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true)return "";
 const lost=Array.isArray(state.lostGear)?state.lostGear:[];''')

replace('ui.js',
' const filterOptions=`<option value="all" ${inventoryFilter==="all"?"selected":""}>全部</option>${EQUIPMENT_TYPES.map(t=>`<option value="${t}" ${inventoryFilter===t?"selected":""}>${equipmentTypeLabel(t)}</option>`).join("")}`;\n const main=',
' const filterOptions=`<option value="all" ${inventoryFilter==="all"?"selected":""}>全部</option>${EQUIPMENT_TYPES.map(t=>`<option value="${t}" ${inventoryFilter===t?"selected":""}>${equipmentTypeLabel(t)}</option>`).join("")}`;\n const third=typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;\n const lowerAction=third?"一鍵處理較低裝備":"一鍵賣出較低裝備",valueLabel=third?"處理結果":"售價";\n const main=')
replace('ui.js','<button class="btn" onclick="sellLowerAll()">一鍵賣出較低裝備</button>','<button class="btn" onclick="sellLowerAll()">${lowerAction}</button>')
replace('ui.js','<th>評分</th><th>售價</th>','<th>評分</th><th>${valueLabel}</th>')
replace('ui.js','const price=quote&&typeof window.equipmentSaleText==="function"?window.equipmentSaleText(quote):secondWorldActive()?"出售系統未載入":specializationSellValue(it).toLocaleString()+" 金幣";',
'const price=third?"不產生資源":quote&&typeof window.equipmentSaleText==="function"?window.equipmentSaleText(quote):secondWorldActive()?"出售系統未載入":specializationSellValue(it).toLocaleString()+" 金幣";')

replace('ui.js',' const body=`<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>\n <h3 style="margin-top:22px">自動出售</h3>',
' const third=typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;\n const autoTitle=third?"自動處理":"自動出售",mythicAuto=third?"不可自動處理":"不可自動出售";\n const body=`<div class="card"><h2 id="settingsTitle">設定</h2><div class="muted">連續點擊「設定」3 下可開啟管理功能。</div>\n <h3 style="margin-top:22px">${autoTitle}</h3>')
replace('ui.js','<span class="muted">不可自動出售</span>','<span class="muted">${mythicAuto}</span>')
replace('ui.js','window.INVENTORY_SALE_DISPLAY_FAIL_CLOSED_VERSION=1;',
'window.INVENTORY_SALE_DISPLAY_FAIL_CLOSED_VERSION=2;\nwindow.THIRD_WORLD_INVENTORY_PROCESSING_UI_VERSION=1;\nwindow.THIRD_WORLD_LOST_GEAR_UI_POLICY_VERSION=1;')

# ---- equipmentlock.js ----
replace('equipmentlock.js',
''' function secondWorldActive(){
  return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;
 }''',
''' function secondWorldActive(){
  return typeof window.isSecondWorldEntered==="function"&&window.isSecondWorldEntered()===true;
 }
 function thirdWorldActive(){return typeof window.isThirdWorldEntered==="function"&&window.isThirdWorldEntered()===true;}''')

replace('equipmentlock.js','  return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3>',
'  const action=thirdWorldActive()?"處理":"出售";\n  const lockNote=thirdWorldActive()?"此裝備已鎖定，不會被手動處理、一鍵處理或自動處理。":"此裝備已鎖定，不會被手動出售、一鍵出售或自動出售。";\n  return `<div class="card" style="margin-top:14px"><h3>裝備比較</h3>')
replace('equipmentlock.js','<button class="btn" onclick="sellSelected()" ${locked?"disabled":""}>出售</button>','<button class="btn" onclick="sellSelected()" ${locked?"disabled":""}>${action}</button>')
replace('equipmentlock.js','${locked?`<div class="muted" style="margin-top:7px">此裝備已鎖定，不會被手動出售、一鍵出售或自動出售。</div>`:""}',
'${locked?`<div class="muted" style="margin-top:7px">${lockNote}</div>`:""}')

replace('equipmentlock.js',
'''  if(r.handled?.sale){
   const stoneText=saleEnhancementText(r.enhancementStones),reward=saleText(r.handled.sale);
   alert(`已裝備新裝備。換下裝備自動出售，獲得 ${reward}${stoneText?`，另獲得 ${stoneText}`:""}。`);
  }''',
'''  if(r.handled?.sale){
   if(thirdWorldActive())alert("已裝備新裝備。換下裝備已自動處理，不產生資源。");
   else{const stoneText=saleEnhancementText(r.enhancementStones),reward=saleText(r.handled.sale);alert(`已裝備新裝備。換下裝備自動出售，獲得 ${reward}${stoneText?`，另獲得 ${stoneText}`:""}。`);}
  }''')

sub('equipmentlock.js',
 r'  const soldText=r\.soldCount\?`\\n換下裝備自動出售 \$\{r\.soldCount\} 件，獲得 \$\{saleText\(r\.sale\)\}\$\{stoneText\?`，另獲得 \$\{stoneText\}`:""\}。`:"";',
 '  const soldText=r.soldCount?(thirdWorldActive()?`\\n換下裝備已自動處理 ${r.soldCount} 件，不產生資源。`:`\\n換下裝備自動出售 ${r.soldCount} 件，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`):"";')

replace('equipmentlock.js','  if(r.reason==="locked")return alert("這件裝備已鎖定，請先解鎖後再出售。");',
'  if(r.reason==="locked")return alert(thirdWorldActive()?"這件裝備已鎖定，請先解鎖後再處理。":"這件裝備已鎖定，請先解鎖後再出售。");')
replace('equipmentlock.js','   if(!confirm(`這是神話裝備，出售可獲得 ${saleText(preview)}。確定要出售嗎？`))return;',
'   const question=thirdWorldActive()?"這是神話裝備，處理後將永久移除且不產生資源。確定要處理嗎？":`這是神話裝備，出售可獲得 ${saleText(preview)}。確定要出售嗎？`;\n   if(!confirm(question))return;')
replace('equipmentlock.js','  if(!r.ok)return alert("裝備出售失敗。");','  if(!r.ok)return alert(thirdWorldActive()?"裝備處理失敗。":"裝備出售失敗。");')
replace('equipmentlock.js','  alert(`已出售裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);',
'  if(thirdWorldActive())alert("已處理裝備，不產生資源。");\n  else alert(`已出售裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);')

replace('equipmentlock.js','  if(!preview.targets.length)return alert("沒有可出售的未鎖定較低裝備。");',
'  if(!preview.targets.length)return alert(thirdWorldActive()?"沒有可處理的未鎖定較低裝備。":"沒有可出售的未鎖定較低裝備。");')
replace('equipmentlock.js','  if(!confirm(`將出售 ${preview.targets.length} 件未鎖定的較低或同能力裝備，共獲得 ${saleText(preview.quote)}。確定出售嗎？`))return;',
'  const question=thirdWorldActive()?`將處理 ${preview.targets.length} 件未鎖定的較低或同能力裝備；處理後永久移除且不產生資源。確定處理嗎？`:`將出售 ${preview.targets.length} 件未鎖定的較低或同能力裝備，共獲得 ${saleText(preview.quote)}。確定出售嗎？`;\n  if(!confirm(question))return;')
replace('equipmentlock.js','  const r=equipmentSellLowerAll(preview);if(!r.ok)return alert("批量出售失敗。");save();render();',
'  const r=equipmentSellLowerAll(preview);if(!r.ok)return alert(thirdWorldActive()?"批量處理失敗。":"批量出售失敗。");save();render();')
replace('equipmentlock.js','  alert(`已出售 ${r.count} 件裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);',
'  if(thirdWorldActive())alert(`已處理 ${r.count} 件裝備，不產生資源。`);\n  else alert(`已出售 ${r.count} 件裝備，獲得 ${saleText(r.sale)}${stoneText?`，另獲得 ${stoneText}`:""}。`);')
replace('equipmentlock.js',' window.EQUIPMENT_SALE_FAIL_CLOSED_VERSION=1;',
' window.EQUIPMENT_SALE_FAIL_CLOSED_VERSION=2;\n window.THIRD_WORLD_EQUIPMENT_PROCESSING_UI_VERSION=1;')

# ---- shared sale owner ----
replace('secondworldrewards.js',
'''  const rawWorld=Math.floor(Number(item.world)||1),world=rawWorld===3?3:(rawWorld===2?2:1);
  if(world===3)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world:3,phase};
  if(phase>=2){''',
'''  const rawWorld=Math.floor(Number(item.world)||1),world=rawWorld===3?3:(rawWorld===2?2:1);
  if(phase===3)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world,phase};
  if(world===3)return {currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world:3,phase};
  if(phase===2){''')
replace('secondworldrewards.js','window.SECOND_WORLD_REWARD_VERSION=VERSION;',
'window.SECOND_WORLD_REWARD_VERSION=VERSION;\n window.THIRD_WORLD_EQUIPMENT_PROCESSING_REWARD_POLICY_VERSION=1;')

# ---- Runtime regression ----
replace('tests/runtime/js-integrity.js','const inventoryFocus=read("inventoryfocus.js");',
'const inventoryFocus=read("inventoryfocus.js");\nconst equipmentLock=read("equipmentlock.js");')
replace('tests/runtime/js-integrity.js',
'''assert(index.includes('secondworldrewards.js?v=20260925-vip-loot-cleanup1')&&index.includes('secondworldmainline.js?v=20260928-thirdworld-batch11-o3'),"index.html 必須載入 VIP Loot Cleanup1 最新宇宙主線 cache-bust。");''',
'''assert(index.includes('secondworldrewards.js?v=20260928-thirdworld-ui-text-batch2')&&index.includes('secondworldmainline.js?v=20260928-thirdworld-batch11-o3'),"index.html 必須載入目前宇宙／高維共用裝備處理 reward owner cache-bust。");''')
anchor='assert(index.includes(\'inventoryfocus.js?v=20260925-inventory-focus-cleanup1\'),"index.html 必須載入正式 inventoryfocus.js cache-bust。");\n'
extra='''assert(/THIRD_WORLD_INVENTORY_PROCESSING_UI_VERSION=1/.test(ui)&&/THIRD_WORLD_LOST_GEAR_UI_POLICY_VERSION=1/.test(ui)&&/一鍵處理較低裝備/.test(ui)&&/不產生資源/.test(ui),"W3 背包必須使用處理語意、零資源顯示與無贖回 UI policy。");
assert(/THIRD_WORLD_EQUIPMENT_PROCESSING_UI_VERSION=1/.test(equipmentLock)&&/處理後將永久移除且不產生資源/.test(equipmentLock)&&/不會被手動處理、一鍵處理或自動處理/.test(equipmentLock),"W3 裝備操作提示必須統一使用處理語意。");
assert(/THIRD_WORLD_EQUIPMENT_PROCESSING_REWARD_POLICY_VERSION=1/.test(secondWorldRewards)&&/if\(phase===3\)return \{currency:"none",amount:0,gold:0,darkMatter:0,darkEnergy:0,world,phase\}/.test(secondWorldRewards),"W3 裝備處理不得產生金幣、暗物質或暗能量。");
assert(index.includes('ui.js?v=20260928-thirdworld-ui-text-batch2')&&index.includes('equipmentlock.js?v=20260928-thirdworld-ui-text-batch2'),"W3 Batch 2 玩家背包／設定 owner 必須同步 cache-bust。");
'''
replace('tests/runtime/js-integrity.js',anchor,anchor+extra)

# ---- cache bust ----
for old,new in {
 'ui.js?v=20260928-thirdworld-batch11-o3':f'ui.js?v={TAG}',
 'equipmentlock.js?v=20260922-equipment-owner-batch3fix1':f'equipmentlock.js?v={TAG}',
 'secondworldrewards.js?v=20260925-vip-loot-cleanup1-20260927-thirdworld-progress-batch6-3':f'secondworldrewards.js?v={TAG}',
}.items(): replace('index.html',old,new)

print('batch 2 corrected patch applied')
