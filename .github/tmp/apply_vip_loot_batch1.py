from pathlib import Path

p=Path("tests/runtime/js-integrity.js")
s=p.read_text()

reads='''const vipLootCore=read("viplootcore.js");
const traitDrop=read("traitdrop.js");
const combatCore=read("combatcore.js");'''
double=reads+'\n'+reads
if double not in s:
    raise SystemExit("duplicate VIP read declarations not found")
s=s.replace(double,reads,1)

marker='assert(pos("viplootcore.js")>pos("vipprogression.js")&&pos("viplootcore.js")<pos("traitdrop.js")&&pos("viplootcore.js")<pos("dungeonbounty.js")&&pos("viplootcore.js")<pos("combatcore.js"),"viplootcore.js 必須在 VIP progression 後、正式掉裝 consumer 前載入。");'
first=s.find(marker)
second=s.find(marker,first+len(marker)) if first>=0 else -1
if first<0 or second<0:
    raise SystemExit(f"expected two VIP contract blocks, got first={first}, second={second}")
end_line='assert(index.includes(\'viplootcore.js?v=20260925-vip-loot-batch1\'),"index.html 必須載入 VIP Loot Batch1 owner。");'
end=s.find(end_line,second)
if end<0:
    raise SystemExit("short VIP contract end marker not found")
end += len(end_line)
if end < len(s) and s[end]=='\n': end+=1
s=s[:second]+s[end:]
p.write_text(s)

p=Path("index.html")
s=p.read_text()
old='<script src="viplootcore.js?v=20260925-vip-loot-batch1"></script>'
new='<script src="viplootcore.js?v=20260925-vip-loot-batch1" data-vip-loot-owner="1"></script>'
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit("viplootcore script tag not found")
p.write_text(s)
