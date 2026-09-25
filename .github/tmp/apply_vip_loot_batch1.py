from pathlib import Path

p=Path("tests/runtime/js-integrity.js")
lines=p.read_text().splitlines()
seen_reads=set()
seen_vip_asserts=set()
out=[]
for line in lines:
    if line in {
        'const vipLootCore=read("viplootcore.js");',
        'const traitDrop=read("traitdrop.js");',
        'const combatCore=read("combatcore.js");'
    }:
        if line in seen_reads:
            continue
        seen_reads.add(line)
    if line.startswith('assert(') and ('viplootcore.js' in line or 'VIP Loot' in line or 'VIP8／14' in line or 'VIP16 Boss' in line):
        if line in seen_vip_asserts:
            continue
        seen_vip_asserts.add(line)
    out.append(line)
p.write_text('\n'.join(out)+'\n')

p=Path("index.html")
s=p.read_text()
old='<script src="viplootcore.js?v=20260925-vip-loot-batch1"></script>'
new='<script src="viplootcore.js?v=20260925-vip-loot-batch1" data-vip-loot-owner="1"></script>'
if old in s:
    s=s.replace(old,new,1)
p.write_text(s)
