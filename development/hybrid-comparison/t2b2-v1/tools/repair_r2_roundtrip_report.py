"""Recompute source/reimport comparison from actual current rendered pixels."""
import pathlib,json,numpy as np
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parents[1];rows=[]
for actor in ['normal','elite','boss']:
 folder=HERE/'enemies'/actor;meta=json.loads((folder/'atlases/atlas.json').read_text())
 for entry in meta['rows']:
  for tick in [0,9,21]:
   f=entry['frames'][tick];x,y,w,h=f['rect'];tx,ty,*_=f['trim'];source=Image.new('RGBA',(256,256));source.paste(Image.open(folder/'atlases'/entry['rgba']).crop((x,y,x+w,y+h)),(tx,ty));imported=Image.open(HERE/f'review/glb-roundtrip/{actor}/{entry["action"]}-{tick:02}.png').convert('RGBA');a=np.asarray(source)/255;b=np.asarray(imported)/255;mask=(a[:,:,3]>.9)&(b[:,:,3]>.9);union=(a[:,:,3]>.5)|(b[:,:,3]>.5);inter=(a[:,:,3]>.5)&(b[:,:,3]>.5)
   rows.append({'actor':actor,'action':entry['action'],'tick':tick,'sourceSHA':meta['sourceSHA'],'silhouetteIoU':float(inter.sum()/union.sum()),'sharedOpaqueRGB_RMSE':float(np.sqrt(np.mean((a[mask,:3]-b[mask,:3])**2)))})
report={'schema':'cw.t2b2.source-vs-glb-pixels','version':1,'method':'actual current saved-source and reimported GLB Cycles32, identical camera/time/AgX; not native GPU','rows':rows,'minimumIoU':min(r['silhouetteIoU'] for r in rows),'maximumRGBRMSE':max(r['sharedOpaqueRGB_RMSE'] for r in rows),'nativeParity':'not implied; r2 native-color Gate still failed'}
for p in [HERE/'review/source-vs-glb-pixels.json',HERE/'repair-r2/roundtrip-difference.json']:p.write_text(json.dumps(report,indent=2)+'\n')
print(report['minimumIoU'],report['maximumRGBRMSE'])
