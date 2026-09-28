from pathlib import Path
p=Path('tests/runtime/js-integrity.js')
s=p.read_text(encoding='utf-8')
old='const thirdWorldGuideSource=(gameGuideSource.match(/function thirdWorldGuideCategories[\\s\\S]*?function guideUniverse/)||[""])[0];'
new='const thirdWorldGuideSource=(gameGuideSource.match(/function thirdWorldBossSpecializationGuideText[\\s\\S]*?function guideUniverse/)||[""])[0];'
if s.count(old)!=1: raise SystemExit(f'thirdWorldGuideSource old count={s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('batch4 guide integrity extraction fixed')
