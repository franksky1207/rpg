from pathlib import Path
src=Path('.github/auto-processing-batch1.py').read_text()
old="r' window\\.isGearLocked=function\\(item\\)\\{return item\\?\\.locked===true;\\};\\n window\\.shouldAutoSellItem=function\\(item\\)\\{.*?\\n \\};'"
new="r' window\\.isGearLocked=function\\(item\\)\\{return item\\?\\.locked===true;\\};\\n window\\.shouldAutoSellItem=function\\(item\\)\\{[\\s\\S]*?\\n \\};'"
if old not in src:
    raise SystemExit('shouldAutoSell matcher source not found')
src=src.replace(old,new,1)
needle='canonical append owner。")\\n'
replacement='canonical append owner。");\\n'
count=src.count(needle)
if count<2:
    raise SystemExit(f'append-owner helper markers found {count}, expected at least 2')
src=src.replace(needle,replacement)
exec(compile(src,'.github/auto-processing-batch1.py','exec'))
