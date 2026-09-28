from pathlib import Path

TAG='20260928-thirdworld-entity-term1'

def replace(path, old, new, count=None):
    p=Path(path); s=p.read_text(encoding='utf-8')
    n=s.count(old)
    if count is not None and n!=count:
        raise SystemExit(f'{path}: expected {count} matches, got {n}: {old}')
    if n:
        p.write_text(s.replace(old,new),encoding='utf-8')
    return n

# Player-facing W3 Guide terminology: "十王" is conversation shorthand only.
replacements={
    '十王戰線':'10 名高維存在',
    '十王個體特化':'10 名高維存在的個體特化',
    '目前十王基準':'目前 10 名高維存在的基準',
    '十王整體永久 HP 進度':'10 名高維存在的整體永久 HP 進度',
    '十王整體永久 HP':'10 名高維存在的總剩餘 HP',
    '十王總剩餘 HP':'10 名高維存在的總剩餘 HP',
    '十王整體進度':'10 名高維存在的整體進度',
}
for old,new in replacements.items():
    replace('gameguide.js',old,new)

# Internal integrity wording follows the formal terminology too.
replace('tests/runtime/js-integrity.js','W3 Guide 必須涵蓋十王正式核心規則','W3 Guide 必須涵蓋 10 名高維存在的正式核心規則')
replace('tests/runtime/js-integrity.js','W3 Guide 的十王特化','W3 Guide 的高維存在特化')

# Formal handoff should not promote the conversational shorthand.
replace('PROJECT_HANDOFF.md','十王','10 名高維存在')

# Update cache-bust for touched player-facing JS.
replace('index.html','gameguide.js?v=20260928-thirdworld-guide-batch4',f'gameguide.js?v={TAG}',1)

# Permanent guard: player-facing W3 guide must not contain the shorthand.
p=Path('tests/runtime/js-integrity.js')
s=p.read_text(encoding='utf-8')
anchor='assert(index.includes(\'gameguide.js?v=20260928-thirdworld-guide-batch4\'),"第4批修改 gameguide.js 後必須同步更新 index.html cache-bust。");'
if anchor not in s:
    raise SystemExit('old gameguide cache assertion missing')
s=s.replace(anchor,
'''assert(!/十王/.test(thirdWorldGuideSource),"玩家可見的 W3 Guide 不得使用對話簡稱『十王』，正式用語統一為 10 名高維存在。");
assert(/10 名高維存在/.test(thirdWorldGuideSource),"W3 Guide 必須使用正式稱呼『10 名高維存在』。");
assert(index.includes('gameguide.js?v=20260928-thirdworld-entity-term1'),"W3 正式用語修正後必須同步更新 gameguide.js cache-bust。");''',1)
p.write_text(s,encoding='utf-8')

print('formal terminology normalized')
