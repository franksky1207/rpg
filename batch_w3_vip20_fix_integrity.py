from pathlib import Path
p=Path('tests/runtime/js-integrity.js')
s=p.read_text(encoding='utf-8')
old="assert(index.includes('vipui.js?v=20260928-thirdworld-ui-text-batch3')&&index.includes('thirdworlddungeonui.js?v=20260928-thirdworld-ui-text-batch3'),\"W3 Batch 3 touched JS 必須同步 cache-bust。\");"
new="assert(index.includes('vipui.js?v=20260928-thirdworld-vip20-death-protection1')&&index.includes('thirdworlddungeonui.js?v=20260928-thirdworld-ui-text-batch3'),\"W3 Batch 3／VIP20 touched JS 必須同步 cache-bust。\");"
if s.count(old)!=1: raise SystemExit(f'expected old cache assertion once, got {s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('cache integrity assertion updated')
