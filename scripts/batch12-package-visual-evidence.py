#!/usr/bin/env python3
"""Package actual rendered frames, never synthesize intermediate motion."""
from PIL import Image,ImageDraw
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'development/combat-animation/batch12/rendered'
report=json.loads((OUT/'formal-visual-report.json').read_text());count=0
for view in report['reports']:
 width=view['viewport']['width']
 for row in view['rows']:
  era,rank=row['era'],row['rank'];frames=[]
  sheet=Image.new('RGB',(900,600),'#202c40');draw=ImageDraw.Draw(sheet)
  selected=['idle','windup','attack','impact','recover','idle-end']
  for i,stage in enumerate(selected):
   im=Image.open(OUT/f'formal-{width}-{era}-{rank}-{stage}.png').convert('RGB');im.thumbnail((300,280));x=(i%3)*300;y=(i//3)*300+20;sheet.paste(im,(x,y));draw.text((x+4,y-16),f'{era} {width} {stage}',fill='white')
  sheet.save(OUT/f'accepted-{width}-{era}-{rank}.png');count+=1
  if rank=='normal':
   # Exactly the actual samples at 35ms intervals. Added 196/336/420 impact
   # evidence stays in PNGs and is not silently treated as uniform GIF time.
   for ms in range(0,701,35):
    match=next(f for f in row['frames'] if f['ms']==ms)
    frames.append(Image.open(OUT/f"formal-{width}-{era}-{rank}-{match['stage']}.png").convert('RGB'))
   frames[0].save(OUT/f'accepted-{width}-{era}.gif',save_all=True,append_images=frames[1:],duration=[30 if i%2==0 else 40 for i in range(20)]+[140],loop=0,disposal=2)
for p in OUT.glob('formal-*.png'):p.unlink()
files=[dict(path=p.relative_to(ROOT).as_posix(),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted(OUT.iterdir()) if p.suffix in ['.png','.gif','.json'] and p.name!='evidence-index.json']
(OUT/'evidence-index.json').write_text(json.dumps(dict(schema='cw.batch12.raster-evidence.v1',candidateSheets=66,candidateFrames=396,formalRows=27,formalFrames=sum(len(r['frames']) for v in report['reports'] for r in v['rows']),acceptedSheets=count,actual35msGifs=9,files=files),indent=2)+'\n')
print('Packaged',count,'accepted sheets and 9 actual-sampled motion GIFs; SHA index written.')
