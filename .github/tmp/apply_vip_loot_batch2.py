from pathlib import Path


def replace_once(path, old, new):
    p=Path(path)
    s=p.read_text()
    if old not in s:
        raise SystemExit(f"missing target in {path}: {old[:120]!r}")
    if s.count(old)!=1:
        raise SystemExit(f"non-unique target in {path}: {s.count(old)}")
    p.write_text(s.replace(old,new,1))

# secondworldrewards.js: Universe mainline Boss equipment now consumes the shared VIP loot owner.
replace_once("secondworldrewards.js", " const VERSION=3;", " const VERSION=4;")

marker=''' function secondWorldMainlineRewardPreview(value,options={}){\n'''
insert=''' function makeSecondWorldMainlineBossEquipment(value,options={}){\n  if(typeof window.applyVipLootQualityPromotions!=="function"||typeof window.vipLootForcedType!=="function")throw new Error("VIP Loot Core 未載入。");\n  const rng=typeof options.rng==="function"?options.rng:Math.random;\n  const baseQuality=secondWorldEquipmentQualityRoll(rng);\n  const qualityResult=window.applyVipLootQualityPromotions(baseQuality,{boss:true,rng,vipLevel:options.vipLevel});\n  const forcedType=window.vipLootForcedType({rng,vipLevel:options.vipLevel});\n  const item=makeSecondWorldEquipmentForBoss(value,{state:options.state||currentState(),level:options.level,forcedQ:qualityResult.quality,forcedType,rng});\n  return {item,baseQuality,qualityResult,forcedType};\n }\n'''+marker
replace_once("secondworldrewards.js", marker, insert)

old='''  const before=snapshotState();\n  const reward=secondWorldMainlineRewardPreview(index,{state:s,useTestSpecializations:false});\n  const item=makeSecondWorldEquipmentForBoss(index,{state:s});\n  const firstKill=s.secondWorld.mainline.bossKilled[index]!==true;\n  const logs=[];\n  const levelBefore=s.level;\n  if(typeof window.gainEffectiveExp==="function")window.gainEffectiveExp(reward.xp,logs);else gainExp(reward.xp,logs);\n  s.secondWorld.darkMatter=Math.max(0,Math.floor(Number(s.secondWorld.darkMatter)||0))+reward.darkMatter;\n  s.secondWorld.darkEnergy=Math.max(0,Math.floor(Number(s.secondWorld.darkEnergy)||0))+1;\n  const itemResult=item?addItem(item):{kept:false,sold:0,sale:null};\n  s.secondWorld.mainline.bossKilled[index]=true;\n  if(!saveAtomicOrRollback(before))return {ok:false,reason:"存檔失敗，已回復戰鬥前狀態。"};\n  return {ok:true,bossIndex:index,boss,firstKill,xp:reward.xp,darkMatter:reward.darkMatter,darkEnergy:1,item,itemResult,sale:itemResult?.sale||null,kept:itemResult?.kept===true,levelBefore,levelAfter:state.level,logs};\n'''
new='''  const before=snapshotState();\n  const reward=secondWorldMainlineRewardPreview(index,{state:s,useTestSpecializations:false});\n  const primaryDrop=makeSecondWorldMainlineBossEquipment(index,{state:s});\n  const drops=primaryDrop?.item?[{...primaryDrop,vip16Extra:false}]:[];\n  if(typeof window.vipLootBossExtraDropTriggered!=="function")throw new Error("VIP Loot Core 未載入。");\n  if(window.vipLootBossExtraDropTriggered({boss:true})){\n   const extraDrop=makeSecondWorldMainlineBossEquipment(index,{state:s});\n   if(extraDrop?.item)drops.push({...extraDrop,vip16Extra:true});\n  }\n  const firstKill=s.secondWorld.mainline.bossKilled[index]!==true;\n  const logs=[];\n  const levelBefore=s.level;\n  if(typeof window.gainEffectiveExp==="function")window.gainEffectiveExp(reward.xp,logs);else gainExp(reward.xp,logs);\n  s.secondWorld.darkMatter=Math.max(0,Math.floor(Number(s.secondWorld.darkMatter)||0))+reward.darkMatter;\n  s.secondWorld.darkEnergy=Math.max(0,Math.floor(Number(s.secondWorld.darkEnergy)||0))+1;\n  const equipmentRewards=drops.map(drop=>{\n   const itemResult=addItem(drop.item);\n   return {item:drop.item,itemResult,sale:itemResult?.sale||null,kept:itemResult?.kept===true,vip16Extra:drop.vip16Extra===true,baseQuality:drop.baseQuality,qualityResult:drop.qualityResult,forcedType:drop.forcedType};\n  });\n  const primary=equipmentRewards[0]||null;\n  s.secondWorld.mainline.bossKilled[index]=true;\n  if(!saveAtomicOrRollback(before))return {ok:false,reason:"存檔失敗，已回復戰鬥前狀態。"};\n  return {ok:true,bossIndex:index,boss,firstKill,xp:reward.xp,darkMatter:reward.darkMatter,darkEnergy:1,item:primary?.item||null,itemResult:primary?.itemResult||null,sale:primary?.sale||null,kept:primary?.kept===true,equipmentRewards,levelBefore,levelAfter:state.level,logs};\n'''
replace_once("secondworldrewards.js", old, new)
replace_once(
    "secondworldrewards.js",
    " window.makeSecondWorldEquipmentForBoss=makeSecondWorldEquipmentForBoss;\n window.secondWorldMainlineRewardPreview=secondWorldMainlineRewardPreview;",
    " window.makeSecondWorldEquipmentForBoss=makeSecondWorldEquipmentForBoss;\n window.makeSecondWorldMainlineBossEquipment=makeSecondWorldMainlineBossEquipment;\n window.secondWorldMainlineRewardPreview=secondWorldMainlineRewardPreview;"
)
replace_once(
    "secondworldrewards.js",
    " window.SECOND_WORLD_SPECIALIZATION_ECONOMY_VERSION=1;",
    " window.SECOND_WORLD_SPECIALIZATION_ECONOMY_VERSION=1;\n window.SECOND_WORLD_VIP_LOOT_PIPELINE_VERSION=1;"
)

# secondworldmainline.js: render and aggregate every Universe Boss reward item, including VIP16 extras.
replace_once("secondworldmainline.js", " const VERSION=6;", " const VERSION=7;")
replace_once(
    "secondworldmainline.js",
''' function rewardItemHtml(item){\n  if(!item)return '<div class="muted">裝備：無</div>';\n  const base=typeof itemHtml==="function"?itemHtml(item,true):item.name;\n  const ability=typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):"";\n  return `<div style="margin-top:10px"><b>主線裝備</b><div class="item">${base}${ability}</div></div>`;\n }\n''',
''' function rewardItemHtml(item,label="主線裝備"){\n  if(!item)return '<div class="muted">裝備：無</div>';\n  const base=typeof itemHtml==="function"?itemHtml(item,true):item.name;\n  const ability=typeof gearAbilityHtml==="function"?gearAbilityHtml(item,true):"";\n  return `<div style="margin-top:10px"><b>${label}</b><div class="item">${base}${ability}</div></div>`;\n }\n function rewardRows(result){\n  const rows=Array.isArray(result?.equipmentRewards)&&result.equipmentRewards.length?result.equipmentRewards:(result?.item?[{item:result.item,kept:result.kept===true,sale:result.sale||null,vip16Extra:false}]:[]);\n  return rows.map(row=>{\n   const label=row.vip16Extra?"VIP16 額外主線裝備":"主線裝備";\n   if(row.kept)return rewardItemHtml(row.item,label);\n   if(row.sale&&typeof window.equipmentSaleText==="function")return `<div class="notice" style="margin-top:10px"><b>${label}已依自動出售設定處理</b><div class="muted" style="margin-top:5px">獲得 ${window.equipmentSaleText(row.sale)}</div></div>`;\n   return rewardItemHtml(row.item,label);\n  }).join("");\n }\n''')
replace_once(
    "secondworldmainline.js",
'''  const saleText=result.sale&&typeof window.equipmentSaleText==="function"?window.equipmentSaleText(result.sale):"";\n  const gearHtml=result.kept?rewardItemHtml(result.item):result.sale?`<div class="notice" style="margin-top:10px"><b>主線裝備已依自動出售設定處理</b><div class="muted" style="margin-top:5px">獲得 ${saleText}</div></div>`:rewardItemHtml(result.item);\n''',
'''  const gearHtml=rewardRows(result);\n''')
replace_once(
    "secondworldmainline.js",
''' function accumulate(ctx,settled){\n  ctx.wins++;ctx.totalXp+=Math.max(0,Number(settled.xp)||0);\n  ctx.totalDarkMatter+=Math.max(0,Number(settled.darkMatter)||0)+Math.max(0,Number(settled.sale?.quote?.darkMatter)||0);\n  ctx.totalDarkEnergy+=Math.max(0,Number(settled.darkEnergy)||0)+Math.max(0,Number(settled.sale?.quote?.darkEnergy)||0);\n  if(settled.kept&&settled.item)ctx.items.push(settled.item);\n  else if(settled.sale)ctx.autoSoldCount++;\n }\n''',
''' function accumulate(ctx,settled){\n  ctx.wins++;ctx.totalXp+=Math.max(0,Number(settled.xp)||0);\n  ctx.totalDarkMatter+=Math.max(0,Number(settled.darkMatter)||0);\n  ctx.totalDarkEnergy+=Math.max(0,Number(settled.darkEnergy)||0);\n  const rows=Array.isArray(settled.equipmentRewards)&&settled.equipmentRewards.length?settled.equipmentRewards:(settled.item?[{item:settled.item,kept:settled.kept===true,sale:settled.sale||null}]:[]);\n  rows.forEach(row=>{\n   ctx.totalDarkMatter+=Math.max(0,Number(row.sale?.quote?.darkMatter)||0);\n   ctx.totalDarkEnergy+=Math.max(0,Number(row.sale?.quote?.darkEnergy)||0);\n   if(row.kept&&row.item)ctx.items.push(row.item);\n   else if(row.sale)ctx.autoSoldCount++;\n  });\n }\n''')

# Cache bust modified player-side files.
p=Path("index.html"); s=p.read_text()
for old,new in [
    ("secondworldrewards.js?v=20260922-death-no-exp-batch1","secondworldrewards.js?v=20260925-vip-loot-batch2"),
    ("secondworldmainline.js?v=20260922-death-no-exp-batch1","secondworldmainline.js?v=20260925-vip-loot-batch2"),
]:
    if old not in s: raise SystemExit(f"missing index cache bust: {old}")
    s=s.replace(old,new,1)
p.write_text(s)

# Permanent Runtime Integrity contract for Batch 2.
p=Path("tests/runtime/js-integrity.js"); s=p.read_text()
read_anchor='const combatCore=read("combatcore.js");\n'
read_block=read_anchor+'const secondWorldRewards=read("secondworldrewards.js");\nconst secondWorldMainline=read("secondworldmainline.js");\n'
if read_anchor not in s: raise SystemExit("missing runtime read anchor")
s=s.replace(read_anchor,read_block,1)
anchor='assert(index.includes(\'viplootcore.js?v=20260925-vip-loot-batch1\')&&index.includes(\'combatcore.js?v=20260925-vip-loot-batch1\')&&index.includes(\'traitdrop.js?v=20260925-vip-loot-batch1\')&&index.includes(\'dungeonbounty.js?v=20260925-vip-loot-batch1\'),"index.html 必須載入 VIP Loot Batch1 最新 cache-bust。");\n'
block='''assert(/const VERSION=4;/.test(secondWorldRewards)&&/SECOND_WORLD_VIP_LOOT_PIPELINE_VERSION=1/.test(secondWorldRewards),"宇宙主線 VIP Loot pipeline 應為正式 V1。\n");\n'''
# avoid accidental newline inside message by building separately
block = '''assert(/const VERSION=4;/.test(secondWorldRewards)&&/SECOND_WORLD_VIP_LOOT_PIPELINE_VERSION=1/.test(secondWorldRewards),"宇宙主線 VIP Loot pipeline 應為正式 V1。");\nassert(/applyVipLootQualityPromotions\(baseQuality,\{boss:true/.test(secondWorldRewards)&&/vipLootForcedType\(\{rng/.test(secondWorldRewards),"宇宙主線固定 Boss 裝備必須套用共用 VIP8／14／18 owner。");\nassert(/vipLootBossExtraDropTriggered\(\{boss:true\}\)/.test(secondWorldRewards)&&/vip16Extra:true/.test(secondWorldRewards),"宇宙主線 VIP16 必須由共用 owner 產生額外 Boss 裝備。");\nassert(/equipmentRewards=drops\.map/.test(secondWorldRewards)&&/equipmentRewards,levelBefore/.test(secondWorldRewards),"宇宙主線結算必須保留所有基礎／VIP16 額外裝備結果。");\nassert(/function rewardRows\(result\)/.test(secondWorldMainline)&&/VIP16 額外主線裝備/.test(secondWorldMainline),"宇宙主線單場結算必須呈現 VIP16 額外裝備。");\nassert(/rows\.forEach\(row=>/.test(secondWorldMainline)&&/row\.sale\?\.quote\?\.darkMatter/.test(secondWorldMainline)&&/row\.sale\?\.quote\?\.darkEnergy/.test(secondWorldMainline),"宇宙主線連續戰鬥必須逐件統計保留／自售與暗物質／暗能量。");\nassert(index.includes('secondworldrewards.js?v=20260925-vip-loot-batch2')&&index.includes('secondworldmainline.js?v=20260925-vip-loot-batch2'),"index.html 必須載入 VIP Loot Batch2 最新 cache-bust。");\n'''
if anchor not in s: raise SystemExit("missing VIP runtime contract anchor")
s=s.replace(anchor,anchor+block,1)
p.write_text(s)
