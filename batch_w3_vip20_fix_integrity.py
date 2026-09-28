from pathlib import Path
p=Path('tests/runtime/js-integrity.js')
s=p.read_text(encoding='utf-8')
replacements=[
 ("assert(index.includes('vipui.js?v=20260928-thirdworld-ui-text-batch3')&&index.includes('thirdworlddungeonui.js?v=20260928-thirdworld-ui-text-batch3'),\"W3 Batch 3 touched JS 必須同步 cache-bust。\");","assert(index.includes('vipui.js?v=20260928-thirdworld-vip20-death-protection1')&&index.includes('thirdworlddungeonui.js?v=20260928-thirdworld-ui-text-batch3'),\"W3 Batch 3／VIP20 touched JS 必須同步 cache-bust。\");"),
 ('src="thirdworldplayerflow.js?v=20260928-thirdworld-batch12-4"','src="thirdworldplayerflow.js?v=20260928-thirdworld-vip20-death-protection1"'),
 ('src="thirdworldrun.js?v=20260928-thirdworld-batch10-opt1"','src="thirdworldrun.js?v=20260928-thirdworld-vip20-death-protection1"')
]
for old,new in replacements:
    if s.count(old)!=1: raise SystemExit(f'expected cache assertion token once, got {s.count(old)}: {old}')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

p=Path('tests/runtime/vip-unbounded-integrity.js')
s=p.read_text(encoding='utf-8')
old='assert(/THIRD_WORLD_VIP_PRESENTATION_VERSION=1/.test(vipUi),"W3 VIP 呈現 policy 應存在。");'
new='assert(/THIRD_WORLD_VIP_PRESENTATION_VERSION=2/.test(vipUi),"W3 VIP 呈現 policy 應為 V2，包含 VIP20 死亡保護。");'
if s.count(old)!=1: raise SystemExit(f'expected W3 VIP presentation assertion once, got {s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('cache and VIP presentation integrity assertions updated')
