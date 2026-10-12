"""Actual same-frame before/after and source/native comparisons, no art vote."""
import pathlib,json,hashlib
import numpy as np
from PIL import Image,ImageDraw
HERE=pathlib.Path(__file__).resolve().parents[1];OUT=HERE/'repair-r1';BASE=pathlib.Path('/tmp/t2b2-baseline/assets')
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
for actor in ['normal','elite','boss','player']:
    before=Image.open(BASE/f'review/{actor}-motion-contact.png');after=Image.open(HERE/f'review/{actor}-motion-contact.png')
    im=Image.new('RGB',(before.width+after.width,max(before.height,after.height)+32),(18,26,38));im.paste(before,(0,32));im.paste(after,(before.width,32));draw=ImageDraw.Draw(im);draw.text((12,10),'BEFORE eff0a6be',fill='white');draw.text((before.width+12,10),'AFTER repair r1 / ART PENDING',fill='white');im.save(OUT/f'{actor}-before-after.png',optimize=True)
before=json.loads((OUT/'geometry-before.json').read_text());after=json.loads((OUT/'geometry-after.json').read_text());summary=[]
for mesh in ['CW_Relic_accessory','CW_Relic_armor','CW_Relic_helmet','CW_Relic_shoes','CW_Relic_weapon']:
    metrics=[]
    for version,data in [('before',before),('after',after)]:
        slots=[s for row in data['frames'] for s in row['slots'] if s['mesh']==mesh]
        metrics.append({'revision':version,'surfacePairMax':max(s['surfaceTrianglePairs'] for s in slots),'threeRayInsideMaxMetres':max(s['maxThreeRayInsideMetres'] for s in slots),'signedNearestMaxMetres':max(s['signedNearestMaxMetres'] for s in slots),'rayDisagreements':sum(s['rayDisagreementCount'] for s in slots),'minimumZMetres':min(s['minimumZMetres'] for s in slots)})
    summary.append({'mesh':mesh,'metrics':metrics})
write(OUT/'geometry-difference.json',{'schema':'cw.t2b2.repair-difference','version':1,'slots':summary,'ankleDisplacementMaxMetres':{label:max(a['headDisplacementMetres'] for r in data['frames'] for a in r['ankles'].values()) for label,data in [('before',before),('after',after)]},'backAccessoryConclusion':'all 132 before and after samples: zero surface pairs and zero unanimous parity-inside points; old signed-nearest proxy is not confirmed penetration','remainingGate':'armor/weapon protected rest contacts and animated intersections remain; no all-clear or art approval'})
native=OUT/'native/report.json'
if native.exists():
    report=json.loads(native.read_text());differences=[];images=[];labels=[]
    for row in report['results']:
        actor,action,tick=row['actor'],row['action'],row['tick'];meta=json.loads((HERE/f'enemies/{actor}/atlases/atlas.json').read_text());entry=next(r for r in meta['rows'] if r['action']==action);f=entry['frames'][tick];x,y,w,h=f['rect'];tx,ty,tw,th=f['trim'];source=Image.new('RGBA',(256,256));source.paste(Image.open(HERE/f'enemies/{actor}/atlases'/entry['rgba']).crop((x,y,x+w,y+h)),(tx,ty));candidate=Image.open(OUT/'native'/row['file']).convert('RGBA');a=np.asarray(source)/255;b=np.asarray(candidate)/255;mask=(a[:,:,3]>.9)&(b[:,:,3]>.9);union=(a[:,:,3]>.5)|(b[:,:,3]>.5);inter=(a[:,:,3]>.5)&(b[:,:,3]>.5)
        assert mask.sum()>100,'Blank/misaligned native image'
        differences.append({'actor':actor,'action':action,'tick':tick,'calibrated':row['calibrated'],'silhouetteIoU':float(inter.sum()/union.sum()),'rgbRMSEOnCommonOpaque':float(np.sqrt(np.mean((a[mask,:3]-b[mask,:3])**2))),'meanRGBSource':a[mask,:3].mean(0).tolist(),'meanRGBNative':b[mask,:3].mean(0).tolist(),'opaquePixels':int(mask.sum())})
        if row['calibrated'] and tick==9:
            im=Image.new('RGB',(768,280),(18,26,38));old=Image.open(OUT/'native'/row['file'].replace('-agx.png','-before.png')).convert('RGBA');draw=ImageDraw.Draw(im)
            for ix,(pic,label) in enumerate([(source,'A/B source'),(old,'C prior light/transform'),(candidate,'C source light + local AgX')]):im.paste(pic,(ix*256,0),pic);draw.text((ix*256+8,260),label,fill='white')
            images.append(im);labels.append(actor+' '+action)
    contact=Image.new('RGB',(768,len(images)*302),(18,26,38));draw=ImageDraw.Draw(contact)
    for i,(im,label) in enumerate(zip(images,labels)):contact.paste(im,(0,i*302));draw.text((8,i*302+283),label,fill='white')
    contact.save(OUT/'same-frame-native-comparison.png',optimize=True)
    means={label:float(np.mean([r['rgbRMSEOnCommonOpaque'] for r in differences if r['calibrated']==flag])) for label,flag in [('before',False),('agx',True)]}
    write(OUT/'native-color-difference.json',{'schema':'cw.t2b2.native-color-difference','version':1,'rows':differences,'meanRMSE':means,'actualNative':True,'physicalGPU':False,'calibratedMeaning':'attempted source light/AgX settings, not passed parity','gate':'failed-native-color-parity: RMSE increased; no quality approval' if means['agx']>=means['before'] else 'improved but pending parity/art review; local LUT redistribution unavailable'})
roundtrip=[]
for actor in ['normal','elite','boss']:
    folder=HERE/f'enemies/{actor}';meta=json.loads((folder/'atlases/atlas.json').read_text())
    for entry in meta['rows']:
        for tick in [0,9,21]:
            f=entry['frames'][tick];x,y,w,h=f['rect'];tx,ty,tw,th=f['trim'];source=Image.new('RGBA',(256,256));source.paste(Image.open(folder/'atlases'/entry['rgba']).crop((x,y,x+w,y+h)),(tx,ty))
            imported=Image.open(HERE/f'review/glb-roundtrip/{actor}/{entry["action"]}-{tick:02}.png').convert('RGBA');a=np.asarray(source)/255;b=np.asarray(imported)/255;mask=(a[:,:,3]>.9)&(b[:,:,3]>.9);union=(a[:,:,3]>.5)|(b[:,:,3]>.5);intersection=(a[:,:,3]>.5)&(b[:,:,3]>.5)
            roundtrip.append({'actor':actor,'action':entry['action'],'tick':tick,'sourceSHA':meta['sourceSHA'],'silhouetteIoU':float(intersection.sum()/union.sum()),'sharedOpaqueRGB_RMSE':float(np.sqrt(np.mean((a[mask,:3]-b[mask,:3])**2)))})
write(HERE/'review/source-vs-glb-pixels.json',{'schema':'cw.t2b2.source-vs-glb-pixels','version':1,'method':'actual saved-source Cycles32 vs real reimported candidate GLB Cycles32; same camera and frame; alpha>.5 silhouette/shared opaque RGB, not native GPU','rows':roundtrip,'minimumIoU':min(r['silhouetteIoU'] for r in roundtrip),'maximumRGBRMSE':max(r['sharedOpaqueRGB_RMSE'] for r in roundtrip),'nativeParity':'not implied; see repair-r1/native-color-difference.json'})
print('PASS actual before/after contact sheets and measured geometry/native differences; art still pending')
