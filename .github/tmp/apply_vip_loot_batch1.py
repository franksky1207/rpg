from pathlib import Path
import re


def sub_once(path, pattern, replacement, flags=0):
    p=Path(path)
    s=p.read_text()
    out,count=re.subn(pattern,replacement,s,count=1,flags=flags)
    if count!=1:
        raise SystemExit(f"replacement count {count} in {path} for {pattern[:120]!r}")
    p.write_text(out)

# Bounty: delegate VIP14 quality and VIP8 weak-slot logic to shared owner.
sub_once(
    "dungeonbounty.js",
    r''' function bountyQualityForEnemy\(enemy\)\{\n  let q=rollBountyQuality\(\);\n  const traitCount=Array\.isArray\(enemy\?\.traits\)\?Math\.min\(2,enemy\.traits\.length\):0,traitChance=traitCount===2\?\.30:traitCount===1\?\.15:0;\n  if\(traitChance>0&&Math\.random\(\)<traitChance&&q<5\)q\+\+;\n  if\(\(state\.vipLevel\|\|0\)>=14&&Math\.random\(\)<\.05&&q<5\)q\+\+;\n  return q;\n \}\n function bountyForcedType\(\)\{\n  if\(\(state\.vipLevel\|\|0\)>=8&&Math\.random\(\)<\.15&&typeof weakEquipmentTypes==="function"\)\{const order=weakEquipmentTypes\(\);return order\[0\]\|\|null;\}\n  return null;\n \}''',
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
 }''')

# Galaxy mainline boss extra drop: delegate VIP16 trigger to shared owner.
sub_once(
    "engine.js",
    r'''  if\(e\.kind==="boss"&&\(state\.vipLevel\|\|0\)>=16&&Math\.random\(\)<\.15\)\{''',
'''  if(typeof window.vipLootBossExtraDropTriggered!=="function")throw new Error("VIP Loot Core 未載入。");
  if(window.vipLootBossExtraDropTriggered({boss:e.kind==="boss"})){''')

# Load owner immediately after VIP progression; update cache busts for modified player files.
sub_once("index.html", r'<script src="vipprogression\.js\?v=20260920-vip-base1000"></script><script src="dailycore\.js\?v=20260914-cleanup3"></script>', '<script src="vipprogression.js?v=20260920-vip-base1000"></script><script src="viplootcore.js?v=20260925-vip-loot-batch1"></script><script src="dailycore.js?v=20260914-cleanup3"></script>')
sub_once("index.html", r'engine\.js\?v=20260922-death-no-exp-batch1', 'engine.js?v=20260925-vip-loot-batch1')
sub_once("index.html", r'traitdrop\.js\?v=20260914-maintenance1', 'traitdrop.js?v=20260925-vip-loot-batch1')
sub_once("index.html", r'dungeonbounty\.js\?v=20260924-universe-bounty-names1', 'dungeonbounty.js?v=20260925-vip-loot-batch1')

# Batch-1 structural integrity.
p=Path("tests/runtime/js-integrity.js")
s=p.read_text()
needle='const inventoryFocus=read("inventoryfocus.js");'
if needle not in s: raise SystemExit("missing integrity read anchor")
s=s.replace(needle,needle+'\nconst vipLootCore=read("viplootcore.js");\nconst traitDrop=read("traitdrop.js");\nconst engine=read("engine.js");',1)
anchor='assert(pos("inventoryfocus.js")>pos("equipmentlock.js")&&pos("inventoryfocus.js")>pos("gearupgrade.js"),"inventoryfocus.js 必須在 equipmentlock.js 與 gearupgrade.js 後載入，以共用正式裝備比較 owner。");'
block='''assert(pos("viplootcore.js")>pos("vipprogression.js")&&pos("viplootcore.js")<pos("traitdrop.js")&&pos("viplootcore.js")<pos("dungeonbounty.js"),"viplootcore.js 必須在 VIP progression 後、正式掉裝 consumer 前載入。");
assert(/VIP_LOOT_CORE_VERSION=VERSION/.test(vipLootCore)&&/const VERSION=1;/.test(vipLootCore),"VIP Loot 共用 owner 應為 V1。");
assert(/vip8:Object\\.freeze\\(\\{level:VIP8_LEVEL,chance:VIP8_WEAK_SLOT_CHANCE\\}\\)/.test(vipLootCore)&&/vip14:Object\\.freeze\\(\\{level:VIP14_LEVEL,chance:VIP14_QUALITY_CHANCE\\}\\)/.test(vipLootCore)&&/vip16:Object\\.freeze\\(\\{level:VIP16_LEVEL,chance:VIP16_BOSS_EXTRA_CHANCE\\}\\)/.test(vipLootCore)&&/vip18:Object\\.freeze\\(\\{level:VIP18_LEVEL,chance:VIP18_BOSS_QUALITY_CHANCE\\}\\)/.test(vipLootCore),"VIP8／14／16／18 裝備特權必須由 viplootcore.js 統一持有。");
assert(/applyVipLootQualityPromotions/.test(traitDrop)&&/vipLootForcedType/.test(traitDrop)&&!/vip14Roll=\\(state\\.vipLevel/.test(traitDrop)&&!/vip18Roll=enemy\\.kind/.test(traitDrop),"銀河主線 VIP8／14／18 必須委派共用 VIP Loot owner。");
assert(/applyVipLootQualityPromotions\\(q,\\{boss:false\\}\\)/.test(bounty)&&/vipLootForcedType\\(\\)/.test(bounty)&&!/\\(state\\.vipLevel\\|\\|0\\)>=14&&Math\\.random\\(\\)<\\.05/.test(bounty)&&!/\\(state\\.vipLevel\\|\\|0\\)>=8&&Math\\.random\\(\\)<\\.15/.test(bounty),"銀河／宇宙懸賞 VIP8／14 必須委派共用 VIP Loot owner。");
assert(/vipLootBossExtraDropTriggered\\(\\{boss:e\\.kind===\\"boss\\"\\}\\)/.test(engine)&&!/e\\.kind===\\"boss\\"&&\\(state\\.vipLevel\\|\\|0\\)>=16&&Math\\.random\\(\\)<\\.15/.test(engine),"銀河主線 VIP16 Boss 額外掉落必須委派共用 VIP Loot owner。");
assert(index.includes('viplootcore.js?v=20260925-vip-loot-batch1')&&index.includes('engine.js?v=20260925-vip-loot-batch1')&&index.includes('traitdrop.js?v=20260925-vip-loot-batch1')&&index.includes('dungeonbounty.js?v=20260925-vip-loot-batch1'),"index.html 必須載入 VIP Loot Batch1 最新 cache-bust。");
'''
if anchor not in s: raise SystemExit("missing integrity insertion anchor")
s=s.replace(anchor,block+anchor,1)
p.write_text(s)
