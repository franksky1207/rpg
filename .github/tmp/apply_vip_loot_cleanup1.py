from pathlib import Path


def replace_once(path, old, new):
    p=Path(path)
    s=p.read_text()
    if old not in s:
        raise SystemExit(f"missing target in {path}: {old[:160]!r}")
    if s.count(old)!=1:
        raise SystemExit(f"non-unique target in {path}: {s.count(old)}")
    p.write_text(s.replace(old,new,1))

vip_core='''(function(){
 const VERSION=2;
 const VIP8_LEVEL=8,VIP8_WEAK_SLOT_CHANCE=.15;
 const VIP14_LEVEL=14,VIP14_QUALITY_CHANCE=.05;
 const VIP16_LEVEL=16,VIP16_BOSS_EXTRA_CHANCE=.15;
 const VIP18_LEVEL=18,VIP18_BOSS_QUALITY_CHANCE=.10;
 const MAX_QUALITY=5;

 function normalizedVipLevel(value=null){
  const raw=value==null?(typeof state!=="undefined"?state?.vipLevel:0):value;
  const max=typeof VIP_MAX_LEVEL!=="undefined"?Math.max(0,Math.floor(Number(VIP_MAX_LEVEL)||0)):20;
  return Math.max(0,Math.min(max,Math.floor(Number(raw)||0)));
 }
 function rngFn(value){return typeof value==="function"?value:Math.random;}
 function targetState(value=null){
  if(value&&typeof value==="object")return value;
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}catch(e){return null;}
 }
 function defaultWeakEquipmentTypes(target=null,rng=Math.random){
  const s=targetState(target),random=rngFn(rng);
  if(!s||typeof equipmentScore!=="function"||typeof EQUIPMENT_TYPES==="undefined")return [];
  return EQUIPMENT_TYPES
   .map(type=>({type,value:equipmentScore(s.equipment?.[type]),tie:random()}))
   .sort((a,b)=>a.value-b.value||a.tie-b.tie)
   .map(row=>row.type);
 }
 function vipLootForcedType(options={}){
  const level=normalizedVipLevel(options.vipLevel),rng=rngFn(options.rng);
  if(level<VIP8_LEVEL||rng()>=VIP8_WEAK_SLOT_CHANCE)return null;
  const resolver=typeof options.weakTypesResolver==="function"?options.weakTypesResolver:defaultWeakEquipmentTypes;
  const order=resolver(targetState(options.state),rng);
  return Array.isArray(order)?order[0]||null:null;
 }
 function applyVipLootQualityPromotions(quality,options={}){
  const level=normalizedVipLevel(options.vipLevel),rng=rngFn(options.rng),boss=options.boss===true;
  const max=Math.max(0,Math.floor(Number(options.maxQuality??MAX_QUALITY)||MAX_QUALITY));
  let q=Math.max(0,Math.min(max,Math.floor(Number(quality)||0)));
  const vip14Roll=level>=VIP14_LEVEL&&rng()<VIP14_QUALITY_CHANCE;
  const vip18Roll=boss&&level>=VIP18_LEVEL&&rng()<VIP18_BOSS_QUALITY_CHANCE;
  let vip14Promotion=0,vip18Promotion=0;
  if(vip14Roll&&q<max){q++;vip14Promotion=1;}
  if(vip18Roll&&q<max){q++;vip18Promotion=1;}
  return {quality:q,vip14Roll,vip18Roll,vip14Promotion,vip18Promotion};
 }
 function resolveVipLootModifiers(quality,options={}){
  const rng=rngFn(options.rng),baseQuality=Math.floor(Number(quality)||0);
  const qualityResult=applyVipLootQualityPromotions(baseQuality,{...options,rng});
  const forcedType=vipLootForcedType({...options,rng});
  return {baseQuality,quality:qualityResult.quality,forcedType,vip8WeakSlot:!!forcedType,qualityResult};
 }
 function vipLootBossExtraDropTriggered(options={}){
  const level=normalizedVipLevel(options.vipLevel),rng=rngFn(options.rng);
  return options.boss===true&&level>=VIP16_LEVEL&&rng()<VIP16_BOSS_EXTRA_CHANCE;
 }
 function vipLootPrivilegeSnapshot(value=null){
  const level=normalizedVipLevel(value);
  return {
   vipLevel:level,
   weakSlot:{enabled:level>=VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE},
   quality:{enabled:level>=VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE},
   bossExtra:{enabled:level>=VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE},
   bossQuality:{enabled:level>=VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE}
  };
 }

 window.VIP_LOOT_CORE_VERSION=VERSION;
 window.VIP_LOOT_PRIVILEGE_CONFIG=Object.freeze({
  vip8:Object.freeze({level:VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE}),
  vip14:Object.freeze({level:VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE}),
  vip16:Object.freeze({level:VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE}),
  vip18:Object.freeze({level:VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE})
 });
 window.vipLootDefaultWeakEquipmentTypes=defaultWeakEquipmentTypes;
 window.vipLootForcedType=vipLootForcedType;
 window.applyVipLootQualityPromotions=applyVipLootQualityPromotions;
 window.resolveVipLootModifiers=resolveVipLootModifiers;
 window.vipLootBossExtraDropTriggered=vipLootBossExtraDropTriggered;
 window.vipLootPrivilegeSnapshot=vipLootPrivilegeSnapshot;
})();
'''
Path('viplootcore.js').write_text(vip_core)

# Galaxy mainline: one shared modifier resolver.
replace_once('traitdrop.js', ''' if(typeof window.applyVipLootQualityPromotions!=="function")throw new Error("VIP Loot Core 未載入。");
 const vipQuality=window.applyVipLootQualityPromotions(q,{boss:enemy.kind==="boss"});
 q=vipQuality.quality;

 if(typeof window.vipLootForcedType!=="function")throw new Error("VIP Loot Core 未載入。");
 const forcedType=window.vipLootForcedType();
 const vip8WeakSlot=!!forcedType;
''', ''' if(typeof window.resolveVipLootModifiers!=="function")throw new Error("VIP Loot Core 未載入。");
 const vipLoot=window.resolveVipLootModifiers(q,{boss:enemy.kind==="boss",state});
 const vipQuality=vipLoot.qualityResult;
 q=vipLoot.quality;
 const forcedType=vipLoot.forcedType;
 const vip8WeakSlot=vipLoot.vip8WeakSlot;
''')

# Bounty: resolve quality + weak slot together once per item.
replace_once('dungeonbounty.js', ''' function bountyQualityForEnemy(enemy){
  let q=rollBountyQuality();
  const traitCount=Array.isArray(enemy?.traits)?Math.min(2,enemy.traits.length):0,traitChance=traitCount===2?.30:traitCount===1?.15:0;
  if(traitChance>0&&Math.random()<traitChance&&q<5)q++;
  if(typeof window.applyVipLootQualityPromotions!=="function")throw new Error("VIP Loot Core 未載入。");
  return window.applyVipLootQualityPromotions(q,{boss:false}).quality;
 }
 function bountyForcedType(){
  if(typeof window.vipLootForcedType!=="function")throw new Error("VIP Loot Core 未載入。");
  return window.vipLootForcedType();
 }
 function bountyItem(enemy,mapIdx){
  const level=clampGameLevel(enemy?.level??state.level),offset=[-2,-1,0,0,1],lv=Math.max(1,Math.min(MAX_LEVEL,level+offset[Math.floor(Math.random()*offset.length)]));
  return makeItem(lv,mapIdx,"normal",bountyQualityForEnemy(enemy),bountyForcedType());
 }
 function universeBountyItem(enemy,level,bossIndex){
  if(typeof window.makeSecondWorldEquipmentForBoss!=="function")return null;
  const q=bountyQualityForEnemy(enemy),forcedType=bountyForcedType();
  return window.makeSecondWorldEquipmentForBoss(bossIndex,{state,level,forcedQ:q,forcedType});
 }
''', ''' function bountyLootModifiers(enemy){
  let q=rollBountyQuality();
  const traitCount=Array.isArray(enemy?.traits)?Math.min(2,enemy.traits.length):0,traitChance=traitCount===2?.30:traitCount===1?.15:0;
  if(traitChance>0&&Math.random()<traitChance&&q<5)q++;
  if(typeof window.resolveVipLootModifiers!=="function")throw new Error("VIP Loot Core 未載入。");
  return window.resolveVipLootModifiers(q,{boss:false,state});
 }
 function bountyItem(enemy,mapIdx){
  const level=clampGameLevel(enemy?.level??state.level),offset=[-2,-1,0,0,1],lv=Math.max(1,Math.min(MAX_LEVEL,level+offset[Math.floor(Math.random()*offset.length)])),loot=bountyLootModifiers(enemy);
  return makeItem(lv,mapIdx,"normal",loot.quality,loot.forcedType);
 }
 function universeBountyItem(enemy,level,bossIndex){
  if(typeof window.makeSecondWorldEquipmentForBoss!=="function")return null;
  const loot=bountyLootModifiers(enemy);
  return window.makeSecondWorldEquipmentForBoss(bossIndex,{state,level,forcedQ:loot.quality,forcedType:loot.forcedType});
 }
''')

# Universe reward pipeline: shared modifiers + injectable RNG + normalized reward rows.
replace_once('secondworldrewards.js',' const VERSION=4;',' const VERSION=5;')
replace_once('secondworldrewards.js', ''' function makeSecondWorldMainlineBossEquipment(value,options={}){
  if(typeof window.applyVipLootQualityPromotions!=="function"||typeof window.vipLootForcedType!=="function")throw new Error("VIP Loot Core 未載入。");
  const rng=typeof options.rng==="function"?options.rng:Math.random;
  const baseQuality=secondWorldEquipmentQualityRoll(rng);
  const qualityResult=window.applyVipLootQualityPromotions(baseQuality,{boss:true,rng,vipLevel:options.vipLevel});
  const forcedType=window.vipLootForcedType({rng,vipLevel:options.vipLevel});
  const item=makeSecondWorldEquipmentForBoss(value,{state:options.state||currentState(),level:options.level,forcedQ:qualityResult.quality,forcedType,rng});
  return {item,baseQuality,qualityResult,forcedType};
 }
''', ''' function makeSecondWorldMainlineBossEquipment(value,options={}){
  if(typeof window.resolveVipLootModifiers!=="function")throw new Error("VIP Loot Core 未載入。");
  const rng=typeof options.rng==="function"?options.rng:Math.random,stateTarget=options.state||currentState();
  const baseQuality=secondWorldEquipmentQualityRoll(rng);
  const loot=window.resolveVipLootModifiers(baseQuality,{boss:true,rng,vipLevel:options.vipLevel,state:stateTarget,weakTypesResolver:options.weakTypesResolver});
  const item=makeSecondWorldEquipmentForBoss(value,{state:stateTarget,level:options.level,forcedQ:loot.quality,forcedType:loot.forcedType,rng});
  return {item,baseQuality,qualityResult:loot.qualityResult,forcedType:loot.forcedType};
 }
 function secondWorldEquipmentRewardRows(result){
  if(Array.isArray(result?.equipmentRewards)&&result.equipmentRewards.length)return result.equipmentRewards;
  return result?.item?[{item:result.item,itemResult:result.itemResult||null,sale:result.sale||null,kept:result.kept===true,vip16Extra:false}]:[];
 }
''')
replace_once('secondworldrewards.js', '''  const before=snapshotState();
  const reward=secondWorldMainlineRewardPreview(index,{state:s,useTestSpecializations:false});
  const primaryDrop=makeSecondWorldMainlineBossEquipment(index,{state:s});
  const drops=primaryDrop?.item?[{...primaryDrop,vip16Extra:false}]:[];
  if(typeof window.vipLootBossExtraDropTriggered!=="function")throw new Error("VIP Loot Core 未載入。");
  if(window.vipLootBossExtraDropTriggered({boss:true})){
   const extraDrop=makeSecondWorldMainlineBossEquipment(index,{state:s});
''', '''  const before=snapshotState();
  const reward=secondWorldMainlineRewardPreview(index,{state:s,useTestSpecializations:false});
  const rng=typeof options.rng==="function"?options.rng:Math.random;
  const lootOptions={state:s,rng,vipLevel:options.vipLevel,weakTypesResolver:options.weakTypesResolver};
  const primaryDrop=makeSecondWorldMainlineBossEquipment(index,lootOptions);
  const drops=primaryDrop?.item?[{...primaryDrop,vip16Extra:false}]:[];
  if(typeof window.vipLootBossExtraDropTriggered!=="function")throw new Error("VIP Loot Core 未載入。");
  if(window.vipLootBossExtraDropTriggered({boss:true,rng,vipLevel:options.vipLevel})){
   const extraDrop=makeSecondWorldMainlineBossEquipment(index,lootOptions);
''')
replace_once('secondworldrewards.js', ' window.makeSecondWorldMainlineBossEquipment=makeSecondWorldMainlineBossEquipment;\n window.secondWorldMainlineRewardPreview=secondWorldMainlineRewardPreview;', ' window.makeSecondWorldMainlineBossEquipment=makeSecondWorldMainlineBossEquipment;\n window.secondWorldEquipmentRewardRows=secondWorldEquipmentRewardRows;\n window.secondWorldMainlineRewardPreview=secondWorldMainlineRewardPreview;')

# Universe mainline UI/summary consume the single reward-row owner.
replace_once('secondworldmainline.js',' const VERSION=7;',' const VERSION=8;')
replace_once('secondworldmainline.js', ''' function rewardRows(result){
  const rows=Array.isArray(result?.equipmentRewards)&&result.equipmentRewards.length?result.equipmentRewards:(result?.item?[{item:result.item,kept:result.kept===true,sale:result.sale||null,vip16Extra:false}]:[]);
  return rows.map(row=>{
''', ''' function rewardRows(result){
  const rows=typeof window.secondWorldEquipmentRewardRows==="function"?window.secondWorldEquipmentRewardRows(result):[];
  return rows.map(row=>{
''')
replace_once('secondworldmainline.js', '''  const rows=Array.isArray(settled.equipmentRewards)&&settled.equipmentRewards.length?settled.equipmentRewards:(settled.item?[{item:settled.item,kept:settled.kept===true,sale:settled.sale||null}]:[]);
  rows.forEach(row=>{
''', '''  const rows=typeof window.secondWorldEquipmentRewardRows==="function"?window.secondWorldEquipmentRewardRows(settled):[];
  rows.forEach(row=>{
''')

# Cache busts.
index=Path('index.html').read_text()
replacements={
 'viplootcore.js?v=20260925-vip-loot-batch1':'viplootcore.js?v=20260925-vip-loot-cleanup1',
 'traitdrop.js?v=20260925-vip-loot-batch1':'traitdrop.js?v=20260925-vip-loot-cleanup1',
 'dungeonbounty.js?v=20260925-vip-loot-batch1':'dungeonbounty.js?v=20260925-vip-loot-cleanup1',
 'secondworldrewards.js?v=20260925-vip-loot-batch2':'secondworldrewards.js?v=20260925-vip-loot-cleanup1',
 'secondworldmainline.js?v=20260925-vip-loot-batch2':'secondworldmainline.js?v=20260925-vip-loot-cleanup1',
}
for old,new in replacements.items():
    if old not in index: raise SystemExit('missing index cache '+old)
    index=index.replace(old,new,1)
Path('index.html').write_text(index)

# Runtime integrity static contract follows architecture V2; behavior tests are Batch2.
t=Path('tests/runtime/js-integrity.js').read_text()
t=t.replace('assert(/VIP_LOOT_CORE_VERSION=VERSION/.test(vipLootCore)&&/const VERSION=1;/.test(vipLootCore),"VIP Loot 共用 owner 應為 V1。");','assert(/VIP_LOOT_CORE_VERSION=VERSION/.test(vipLootCore)&&/const VERSION=2;/.test(vipLootCore),"VIP Loot 共用 owner 應為 V2。");')
t=t.replace('assert(/applyVipLootQualityPromotions/.test(traitDrop)&&/vipLootForcedType/.test(traitDrop)&&!/vip14Roll=\\(state\\.vipLevel/.test(traitDrop)&&!/vip18Roll=enemy\\.kind/.test(traitDrop),"銀河主線 VIP8／14／18 必須委派共用 VIP Loot owner。");','assert(/resolveVipLootModifiers/.test(traitDrop)&&!/applyVipLootQualityPromotions/.test(traitDrop)&&!/vipLootForcedType/.test(traitDrop),"銀河主線 VIP8／14／18 必須只委派單一 VIP Loot modifier resolver。");')
t=t.replace('assert(/applyVipLootQualityPromotions\\(q,\\{boss:false\\}\\)/.test(bounty)&&/vipLootForcedType\\(\\)/.test(bounty)&&!/\\(state\\.vipLevel\\|\\|0\\)>=14&&Math\\.random\\(\\)<\\.05/.test(bounty)&&!/\\(state\\.vipLevel\\|\\|0\\)>=8&&Math\\.random\\(\\)<\\.15/.test(bounty),"銀河／宇宙懸賞 VIP8／14 必須委派共用 VIP Loot owner。");','assert(/function bountyLootModifiers\\(enemy\\)/.test(bounty)&&/resolveVipLootModifiers\\(q,\\{boss:false,state\\}\\)/.test(bounty)&&!/bountyForcedType/.test(bounty),"銀河／宇宙懸賞 VIP8／14 必須共用單一 VIP Loot modifier resolver。");')
t=t.replace("assert(index.includes('viplootcore.js?v=20260925-vip-loot-batch1')&&index.includes('combatcore.js?v=20260925-vip-loot-batch1')&&index.includes('traitdrop.js?v=20260925-vip-loot-batch1')&&index.includes('dungeonbounty.js?v=20260925-vip-loot-batch1'),\"index.html 必須載入 VIP Loot Batch1 最新 cache-bust。\");", "assert(index.includes('viplootcore.js?v=20260925-vip-loot-cleanup1')&&index.includes('traitdrop.js?v=20260925-vip-loot-cleanup1')&&index.includes('dungeonbounty.js?v=20260925-vip-loot-cleanup1'),\"index.html 必須載入 VIP Loot Cleanup1 最新共用 owner cache-bust。\");")
t=t.replace('assert(/const VERSION=4;/.test(secondWorldRewards)&&/SECOND_WORLD_VIP_LOOT_PIPELINE_VERSION=1/.test(secondWorldRewards),"宇宙主線 VIP Loot pipeline 應為正式 V1。");','assert(/const VERSION=5;/.test(secondWorldRewards)&&/SECOND_WORLD_VIP_LOOT_PIPELINE_VERSION=1/.test(secondWorldRewards),"宇宙主線 VIP Loot pipeline 應使用 Reward V5。");')
t=t.replace('assert(/applyVipLootQualityPromotions\\(baseQuality,\\{boss:true/.test(secondWorldRewards)&&/vipLootForcedType\\(\\{rng/.test(secondWorldRewards),"宇宙主線固定 Boss 裝備必須套用共用 VIP8／14／18 owner。");','assert(/resolveVipLootModifiers\\(baseQuality,\\{boss:true,rng/.test(secondWorldRewards)&&/weakTypesResolver:options\\.weakTypesResolver/.test(secondWorldRewards),"宇宙主線固定 Boss 裝備必須套用單一 VIP8／14／18 resolver，且支援 target state／resolver。");')
t=t.replace('assert(/vipLootBossExtraDropTriggered\\(\\{boss:true\\}\\)/.test(secondWorldRewards)&&/vip16Extra:true/.test(secondWorldRewards),"宇宙主線 VIP16 必須由共用 owner 產生額外 Boss 裝備。");','assert(/vipLootBossExtraDropTriggered\\(\\{boss:true,rng,vipLevel:options\\.vipLevel\\}\\)/.test(secondWorldRewards)&&/vip16Extra:true/.test(secondWorldRewards),"宇宙主線 VIP16 必須由共用 owner 產生額外 Boss 裝備，並共用可注入 RNG。");')
t=t.replace('assert(/function rewardRows\\(result\\)/.test(secondWorldMainline)&&/VIP16 額外主線裝備/.test(secondWorldMainline),"宇宙主線單場結算必須呈現 VIP16 額外裝備。");','assert(/function secondWorldEquipmentRewardRows\\(result\\)/.test(secondWorldRewards)&&/function rewardRows\\(result\\)/.test(secondWorldMainline)&&/secondWorldEquipmentRewardRows\\(result\\)/.test(secondWorldMainline)&&/VIP16 額外主線裝備/.test(secondWorldMainline),"宇宙主線單場結算必須共用 reward-row owner 並呈現 VIP16 額外裝備。");')
t=t.replace('assert(/rows\\.forEach\\(row=>/.test(secondWorldMainline)&&/row\\.sale\\?\\.quote\\?\\.darkMatter/.test(secondWorldMainline)&&/row\\.sale\\?\\.quote\\?\\.darkEnergy/.test(secondWorldMainline),"宇宙主線連續戰鬥必須逐件統計保留／自售與暗物質／暗能量。");','assert(/secondWorldEquipmentRewardRows\\(settled\\)/.test(secondWorldMainline)&&/rows\\.forEach\\(row=>/.test(secondWorldMainline)&&/row\\.sale\\?\\.quote\\?\\.darkMatter/.test(secondWorldMainline)&&/row\\.sale\\?\\.quote\\?\\.darkEnergy/.test(secondWorldMainline),"宇宙主線連續戰鬥必須共用 reward-row owner 並逐件統計保留／自售與暗物質／暗能量。");')
t=t.replace("assert(index.includes('secondworldrewards.js?v=20260925-vip-loot-batch2')&&index.includes('secondworldmainline.js?v=20260925-vip-loot-batch2'),\"index.html 必須載入 VIP Loot Batch2 最新 cache-bust。\");", "assert(index.includes('secondworldrewards.js?v=20260925-vip-loot-cleanup1')&&index.includes('secondworldmainline.js?v=20260925-vip-loot-cleanup1'),\"index.html 必須載入 VIP Loot Cleanup1 最新宇宙主線 cache-bust。\");")
needle='assert(/vip8:Object\\.freeze\\(\\{level:VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE\\}\\)/.test(vipLootCore)&&/vip14:Object\\.freeze\\(\\{level:VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE\\}\\)/.test(vipLootCore)&&/vip16:Object\\.freeze\\(\\{level:VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE\\}\\)/.test(vipLootCore)&&/vip18:Object\\.freeze\\(\\{level:VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE\\}\\)/.test(vipLootCore),"VIP8／14／16／18 裝備特權必須由 viplootcore.js 統一持有。");\n'
extra='assert(/resolveVipLootModifiers=resolveVipLootModifiers/.test(vipLootCore)&&/defaultWeakEquipmentTypes/.test(vipLootCore)&&/options\\.state/.test(vipLootCore)&&/weakTypesResolver/.test(vipLootCore)&&!/weakEquipmentTypes\\(/.test(vipLootCore),"VIP Loot V2 必須統一 modifiers，VIP8 最弱部位必須支援 target state／resolver 且不得依賴漂移舊名稱。\");\n'
if needle not in t: raise SystemExit('missing runtime insertion point')
t=t.replace(needle,needle+extra,1)
Path('tests/runtime/js-integrity.js').write_text(t)
