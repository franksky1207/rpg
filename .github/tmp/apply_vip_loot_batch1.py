from pathlib import Path

notes=[]
def replace_once(path, old, new, label):
    p=Path(path); s=p.read_text(); count=s.count(old)
    notes.append(f"{label}: {count}")
    if count==1: p.write_text(s.replace(old,new,1))

replace_once("dungeonbounty.js",
''' function bountyQualityForEnemy(enemy){
  let q=rollBountyQuality();
  const traitCount=Array.isArray(enemy?.traits)?Math.min(2,enemy.traits.length):0,traitChance=traitCount===2?.30:traitCount===1?.15:0;
  if(traitChance>0&&Math.random()<traitChance&&q<5)q++;
  if((state.vipLevel||0)>=14&&Math.random()<.05&&q<5)q++;
  return q;
 }
 function bountyForcedType(){
  if((state.vipLevel||0)>=8&&Math.random()<.15&&typeof weakEquipmentTypes==="function"){const order=weakEquipmentTypes();return order[0]||null;}
  return null;
 }''',
''' function bountyQualityForEnemy(enemy){
  let q=rollBountyQuality();
  const traitCount=Array.isArray(enemy?.traits)?Math.min(2,enemy.traits.length):0,traitChance=traitCount===2?.30:traitCount===1?.15:0;
  if(traitChance>0&&Math.random()<traitChance&&q<5)q++;
  if(typeof window.applyVipLootQualityPromotions!=="function")throw new Error("VIP Loot Core 未載入。");
  return window.applyVipLootQualityPromotions(q,{boss:false}).quality;
 }
 function bountyForcedType(){
  if(typeof window.vipLootForcedType!=="function")throw new Error("VIP Loot Core 未載入。");
  return window.vipLootForcedType();
 }''',"bounty")

replace_once("combatcore.js",'  if(e.kind==="boss"&&(state.vipLevel||0)>=16&&Math.random()<.15){','  if(typeof window.vipLootBossExtraDropTriggered!=="function")throw new Error("VIP Loot Core 未載入。");\n  if(window.vipLootBossExtraDropTriggered({boss:e.kind==="boss"})){',"combatcore")
replace_once("index.html",'<script src="vipprogression.js?v=20260920-vip-base1000"></script><script src="dailycore.js?v=20260914-cleanup3"></script>','<script src="vipprogression.js?v=20260920-vip-base1000"></script><script src="viplootcore.js?v=20260925-vip-loot-batch1"></script><script src="dailycore.js?v=20260914-cleanup3"></script>',"index-owner")
replace_once("index.html",'combatcore.js?v=20260922-civilization-core-batch1','combatcore.js?v=20260925-vip-loot-batch1',"index-combat")
replace_once("index.html",'traitdrop.js?v=20260914-maintenance1','traitdrop.js?v=20260925-vip-loot-batch1',"index-trait")
replace_once("index.html",'dungeonbounty.js?v=20260924-universe-bounty-names1','dungeonbounty.js?v=20260925-vip-loot-batch1',"index-bounty")

p=Path("tests/runtime/js-integrity.js"); s=p.read_text()
needle='const inventoryFocus=read("inventoryfocus.js");'
notes.append(f"integrity-read: {s.count(needle)}")
if s.count(needle)==1:
    s=s.replace(needle,needle+'\nconst vipLootCore=read("viplootcore.js");\nconst traitDrop=read("traitdrop.js");\nconst combatCore=read("combatcore.js");',1)
anchor='assert(pos("inventoryfocus.js")>pos("equipmentlock.js")&&pos("inventoryfocus.js")>pos("gearupgrade.js"),"inventoryfocus.js 必須在 equipmentlock.js 與 gearupgrade.js 後載入，以共用正式裝備比較 owner。");'
notes.append(f"integrity-anchor: {s.count(anchor)}")
block='''assert(pos("viplootcore.js")>pos("vipprogression.js")&&pos("viplootcore.js")<pos("traitdrop.js")&&pos("viplootcore.js")<pos("dungeonbounty.js")&&pos("viplootcore.js")<pos("combatcore.js"),"viplootcore.js 必須在 VIP progression 後、正式掉裝 consumer 前載入。");
assert(/VIP_LOOT_CORE_VERSION=VERSION/.test(vipLootCore)&&/const VERSION=1;/.test(vipLootCore),"VIP Loot 共用 owner 應為 V1。");
assert(/applyVipLootQualityPromotions/.test(traitDrop)&&/vipLootForcedType/.test(traitDrop),"銀河主線 VIP8／14／18 必須委派共用 VIP Loot owner。");
assert(/applyVipLootQualityPromotions\\(q,\\{boss:false\\}\\)/.test(bounty)&&/vipLootForcedType\\(\\)/.test(bounty),"銀河／宇宙懸賞 VIP8／14 必須委派共用 VIP Loot owner。");
assert(/vipLootBossExtraDropTriggered/.test(combatCore),"銀河主線 VIP16 Boss 額外掉落必須委派共用 VIP Loot owner。");
assert(index.includes('viplootcore.js?v=20260925-vip-loot-batch1'),"index.html 必須載入 VIP Loot Batch1 owner。");
'''
if s.count(anchor)==1: s=s.replace(anchor,block+anchor,1)
p.write_text(s)
Path('.github/tmp/vip_loot_batch1_diag.txt').write_text('\n'.join(notes)+'\n')
