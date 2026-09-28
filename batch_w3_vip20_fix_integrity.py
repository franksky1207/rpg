from pathlib import Path
p=Path('tests/runtime/js-integrity.js')
s=p.read_text(encoding='utf-8')
old="assert(index.includes('vipui.js?v=20260928-thirdworld-ui-text-batch3')&&index.includes('thirdworlddungeonui.js?v=20260928-thirdworld-ui-text-batch3'),\"W3 Batch 3 touched JS 必須同步 cache-bust。\");"
new="assert(index.includes('vipui.js?v=20260928-thirdworld-vip20-death-protection1')&&index.includes('thirdworlddungeonui.js?v=20260928-thirdworld-ui-text-batch3'),\"W3 Batch 3／VIP20 touched JS 必須同步 cache-bust。\");"
if s.count(old)!=1: raise SystemExit(f'expected old cache assertion once, got {s.count(old)}')
s=s.replace(old,new,1)
old_flow='src="thirdworldplayerflow.js?v=20260928-thirdworld-batch12-4"'
new_flow='src="thirdworldplayerflow.js?v=20260928-thirdworld-vip20-death-protection1"'
if s.count(old_flow)!=1: raise SystemExit(f'expected old playerflow cache assertion once, got {s.count(old_flow)}')
s=s.replace(old_flow,new_flow,1)
p.write_text(s,encoding='utf-8')
print('cache integrity assertions updated')
