from pathlib import Path
src=Path('.github/auto-processing-batch1.py').read_text()
old="r' window\\.isGearLocked=function\\(item\\)\\{return item\\?\\.locked===true;\\};\\n window\\.shouldAutoSellItem=function\\(item\\)\\{.*?\\n \\};'"
new="r' window\\.isGearLocked=function\\(item\\)\\{return item\\?\\.locked===true;\\};\\n window\\.shouldAutoSellItem=function\\(item\\)\\{[\\s\\S]*?\\n \\};'"
if old not in src:
    raise SystemExit('shouldAutoSell matcher source not found')
src=src.replace(old,new,1)
exec(compile(src,'.github/auto-processing-batch1.py','exec'))
