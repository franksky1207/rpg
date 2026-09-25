from pathlib import Path

p=Path("tests/runtime/js-integrity.js")
s=p.read_text()
# Remove the accidental duplicated read declarations from the diagnostic pass.
dup='''const vipLootCore=read("viplootcore.js");
const traitDrop=read("traitdrop.js");
const combatCore=read("combatcore.js");
const vipLootCore=read("viplootcore.js");
const traitDrop=read("traitdrop.js");
const combatCore=read("combatcore.js");'''
single='''const vipLootCore=read("viplootcore.js");
const traitDrop=read("traitdrop.js");
const combatCore=read("combatcore.js");'''
if dup not in s: raise SystemExit("duplicate read block not found")
s=s.replace(dup,single,1)
# Remove the shorter duplicated static contract block; retain the stronger first block.
short='''assert(pos("viplootcore.js")>pos("vipprogression.js")&&pos("viplootcore.js")<pos("traitdrop.js")&&pos("viplootcore.js")<pos("dungeonbounty.js")&&pos("viplootcore.js")<pos("combatcore.js"),"viplootcore.js 必須在 VIP progression 後、正式掉裝 consumer 前載入。");
assert(/VIP_LOOT_CORE_VERSION=VERSION/.test(vipLootCore)&&/const VERSION=1;/.test(vipLootCore),"VIP Loot 共用 owner 應為 V1。");
assert(/applyVipLootQualityPromotions/.test(traitDrop)&&/vipLootForcedType/.test(traitDrop),"銀河主線 VIP8／14／18 必須委派共用 VIP Loot owner。");
assert(/applyVipLootQualityPromotions\\(q,\\{boss:false\\}\\)/.test(bounty)&&/vipLootForcedType\\(\\)/.test(bounty),"銀河／宇宙懸賞 VIP8／14 必須委派共用 VIP Loot owner。");
assert(/vipLootBossExtraDropTriggered/.test(combatCore),"銀河主線 VIP16 Boss 額外掉落必須委派共用 VIP Loot owner。");
assert(index.includes('viplootcore.js?v=20260925-vip-loot-batch1'),"index.html 必須載入 VIP Loot Batch1 owner。");
'''
if short not in s: raise SystemExit("duplicate short contract block not found")
s=s.replace(short,"",1)
p.write_text(s)

# Mark the canonical owner explicitly on the script tag; this also gives the final cleanup head an index change.
p=Path("index.html"); s=p.read_text()
old='<script src="viplootcore.js?v=20260925-vip-loot-batch1"></script>'
new='<script src="viplootcore.js?v=20260925-vip-loot-batch1" data-vip-loot-owner="1"></script>'
if old not in s: raise SystemExit("viplootcore script tag not found")
p.write_text(s.replace(old,new,1))
