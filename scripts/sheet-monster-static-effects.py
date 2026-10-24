"""Review sheets are exports of the SAME frozen-body/effect files, never a painter."""
import json,math,html
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
r=Path('development/monster-art/full-review');d=json.loads((r/'manifest.json').read_text());e=json.loads((r/'effects-manifest.json').read_text());configs={c['id']:c for c in e['configs']};out=r/'effect-sheets';out.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',13);small=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',10)
rows=[x for x in d['rows'] if x.get('mode')!='alternate' or x.get('stageIndex')==0];groups={}
for x in rows:groups.setdefault(x['category'],[]).append(x)
for a in d['assets']:groups['prototype-'+a['assetId']]=[x for x in rows if x['assetId']==a['assetId']]
for level in range(6):groups['L'+str(level)]=[x for x in rows if configs[x['canonical']]['level']==level]
labels={'galaxy':'銀河主線','universe':'宇宙主線','special':'特殊怪','bounty':'懸賞','arena':'競技場','void':'虛空','galaxy-calamity':'銀河文明災厄','universe-calamity':'宇宙文明災厄','higher':'高維十王','projection':'高維競技投影','alternate':'異宇宙'}
items=[]
for name,rs in groups.items():
 for start in range(0,len(rs),40):
  chunk=rs[start:start+40]
  for mode,folder,ext in [('full','effects-full','webp'),('effects','effects','png')]:
   sheet=Image.new('RGB',(1200,60+math.ceil(len(chunk)/5)*244),'#14212b');draw=ImageDraw.Draw(sheet);draw.text((20,15),f'{labels.get(name,name)} · {mode} · {start+1}–{start+len(chunk)} / {len(rs)}',font=font,fill='#dce9ed')
   for i,x in enumerate(chunk):
    config=configs[x['canonical']];px=i%5*240;py=55+i//5*244;im=Image.open(r/folder/(x['canonical']+'.'+ext)).convert('RGBA');im.thumbnail((195,195));sheet.paste(im,(px+(240-im.width)//2,py),im);draw.text((px+5,py+195),f"L{config['level']} · {x['name'][:16]}",font=font,fill='#daeded');draw.text((px+5,py+214),x['id'],font=small,fill='#b2ced0');draw.text((px+5,py+228),'+'.join(m['id'][:10] for m in config['members'])[:39],font=small,fill='#a4bcc5')
   filename=f'{name}-{start//40+1:02d}-{mode}.jpg';sheet.save(out/filename,quality=89);items.append((labels.get(name,name),filename,mode))
# 48 real component geometries, independent of palette variants.
for mode,level in [('L0',0),('L2',2),('L5',5)]:
 sheet=Image.new('RGB',(1200,8*180+60),'#14212b');draw=ImageDraw.Draw(sheet);draw.text((20,15),'48 元件庫 · '+mode,font=font,fill='white')
 for i,c in enumerate(e['library']):
  im=Image.open(r/'effect-library'/(c['id']+'-L'+str(level)+'.png')).convert('RGBA');im.thumbnail((145,145));px=i%6*200;py=50+i//6*180;sheet.paste(im,(px+25,py),im);draw.text((px+8,py+145),c['name'],font=font,fill='#cce1e4')
 filename='library-'+mode+'.jpg';sheet.save(out/filename,quality=92);items.insert(0,('48 個基礎元件',filename,mode))
links=''.join(f'<a href="{f}"><img loading="lazy" src="{f}" alt="{html.escape(n)} {mode}"><span>{html.escape(n)} · {mode}</span></a>' for n,f,mode in items)
(out/'index.html').write_text('<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>全量靜態效果總覽圖</title><style>body{background:#101a23;color:#deebf0;font:16px system-ui;padding:20px}a{color:#a3d9d3}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}img{width:100%;display:block}span{display:block;padding:10px}</style></head><body><h1>全量靜態效果總覽圖</h1><p><a href="../index.html">回分類頁</a> · <a href="../effect-library.html">元件庫</a> · 點圖放大；提供完整／效果獨立兩版，本體不變。</p><main>'+links+'</main></body></html>')
(out/'index.json').write_text(json.dumps(items,ensure_ascii=False,indent=2));print('Effects sheets:',len(items))
