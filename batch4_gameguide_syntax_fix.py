from pathlib import Path
p=Path('gameguide.js')
s=p.read_text(encoding='utf-8')
old='maxDeaths=Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||100);'
new='maxDeaths=Math.max(1,Math.floor(Number(window.THIRD_WORLD_RUN_MAX_DEATHS)||100));'
if s.count(old)!=1: raise SystemExit(f'maxDeaths syntax token count={s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('batch4 guide syntax fixed')
