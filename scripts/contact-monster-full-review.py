"""Local contact sheets; uses the same exported candidate files as the review page."""
import json, math, html
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path('development/monster-art/full-review');d=json.loads((root/'manifest.json').read_text());out=root/'sheets';out.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',14);small=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',11)
rows=[r for r in d['rows'] if r.get('mode')!='alternate' or r.get('stageIndex')==0]
groups={}
for r in rows:groups.setdefault(r['category'],[]).append(r)
for a in d['assets']:groups['prototype-'+a['assetId']]=[r for r in rows if r['assetId']==a['assetId']]
groups['alternate-20']=[next(r for r in rows if r['category']=='alternate' and r['assetId']==a) for a in dict.fromkeys(r['assetId'] for r in rows if r['category']=='alternate')]
labels={'galaxy':'銀河主線','universe':'宇宙主線','special':'特殊怪','bounty':'懸賞','arena':'競技場','void':'虛空','galaxy-calamity':'銀河文明災厄','universe-calamity':'宇宙文明災厄','higher':'高維十王','projection':'高維競技投影','alternate':'異宇宙全部版本','alternate-20':'異宇宙二十原型'}
items=[]
for name,rs in groups.items():
 for start in range(0,len(rs),40):
  chunk=rs[start:start+40]
  for mode in ['body','full']:
   sheet=Image.new('RGB',(1200,70+math.ceil(len(chunk)/5)*224),'#141e28');draw=ImageDraw.Draw(sheet);draw.text((20,15),f'{labels.get(name,name)} · {mode} · {start+1}–{start+len(chunk)} / {len(rs)}',font=font,fill='#e2edf2')
   for i,r in enumerate(chunk):
    x=(i%5)*240;y=60+(i//5)*224
    im=Image.open(root/mode/(r['canonical']+'.webp')).convert('RGBA');im.thumbnail((170,170));sheet.paste(im,(x+(240-im.width)//2,y),im)
    draw.text((x+8,y+170),r['name'][:17],font=font,fill='#e0ebf0');draw.text((x+8,y+192),r['id'],font=small,fill='#b3c7d3');draw.text((x+8,y+208),r['assetId'],font=small,fill='#a9bebd')
   filename=f'{name}-{start//40+1:02d}-{mode}.jpg';sheet.save(out/filename,quality=88);items.append((labels.get(name,name),filename,mode))
links=''.join(f'<a href="{f}"><img loading="lazy" src="{f}" alt="{html.escape(n)} {m}"><span>{html.escape(n)} · {m}</span></a>' for n,f,m in items)
(out/'index.html').write_text('<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>全量總覽圖</title><style>body{background:#111a23;color:#dce8ef;font:16px system-ui;padding:20px}a{color:#a5dfda}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}img{width:100%;display:block}span{display:block;padding:10px}</style><h1>全量總覽圖 / Contact sheets</h1><p><a href="../index.html">回分類檢視</a> · 每分類與每原型提供本體／完整兩版；點圖放大。</p><main>'+links+'</main></html>')
(out/'index.json').write_text(json.dumps(items,ensure_ascii=False,indent=2));print('Sheets',len(items))
