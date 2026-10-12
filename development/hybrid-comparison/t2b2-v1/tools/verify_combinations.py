"""All 33 fixture appearances x six actions x 22 actual decoded atlas poses.
Vectorized independent-layer depth composition; no new runtime renderer.
"""
import pathlib,json,hashlib,math
import numpy as np
from PIL import Image,ImageDraw
HERE=pathlib.Path(__file__).resolve().parents[1];root=HERE/'player/atlases';meta=json.loads((root/'atlas.json').read_text());fixture=json.loads((HERE.parent/'t2a-v1/owner-fixtures.json').read_text());variants=fixture['appearanceVariants'];slots=['weapon','helmet','armor','shoes','accessory'];layers=['body-base','body-helmet','body-armor','body-shoes','body-accessory']+slots
selected=[]
for v in variants:
    worn=[s for s in slots if v['appearance']['equipment'][s]['present'] and v['resolved']['high'][slots.index(s)]['assetKind']=='equipment-glb']
    selected.append(['body-base']+['body-'+s for s in ['helmet','armor','shoes','accessory'] if s not in worn]+worn)
membership=np.array([[l in s for l in layers] for s in selected]);rows=[];pictures=[];labels=[];yy,xx=np.mgrid[0:256,0:256]
for action in ['idle','attack','hit','dodge','return','defeat']:
    entries={r['layer']:r for r in meta['rows'] if r['action']==action};pages={l:(Image.open(root/r['rgba']),Image.open(root/r['depth'])) for l,r in entries.items()}
    for frame in range(22):
        colors=[];depths=[]
        for l in layers:
            f=entries[l]['frames'][frame];x,y,w,h=f['rect'];tx,ty,tw,th=f['trim'];color=np.zeros((256,256,4),np.uint8);z=np.full((256,256),65535,np.uint16);color[ty:ty+h,tx:tx+w]=np.asarray(pages[l][0].crop((x,y,x+w,y+h)));z[ty:ty+h,tx:tx+w]=np.asarray(pages[l][1].crop((x,y,x+w,y+h)));z[color[:,:,3]==0]=65535;colors.append(color);depths.append(z)
        colors=np.array(colors,dtype=np.float32)/255;order=np.argsort(np.array(depths),axis=0)[::-1];dst=np.zeros((33,256,256,4),np.float32)
        for indices in order:
            c=colors[indices,yy,xx];active=membership[:,indices];alpha=c[None,:,:,3:4]*active[:,:,:,None];outAlpha=alpha+dst[:,:,:,3:4]*(1-alpha)
            dst[:,:,:,:3]=np.divide(c[None,:,:,:3]*alpha+dst[:,:,:,:3]*dst[:,:,:,3:4]*(1-alpha),outAlpha,out=np.zeros_like(dst[:,:,:,:3]),where=outAlpha>0);dst[:,:,:,3:4]=outAlpha
        rgba=np.round(np.clip(dst,0,1)*255).astype('uint8')
        for i,v in enumerate(variants):
            assert np.count_nonzero(rgba[i,:,:,3])>100,'Blank composition'
            rows.append({'variant':v['id'],'action':action,'frame':frame,'sha256':hashlib.sha256(rgba[i].tobytes()).hexdigest(),'selectedLayers':selected[i]})
            if frame==9:pictures.append(Image.fromarray(rgba[i]));labels.append(action+' / '+v['id'])
    print('PASS actual 33 combinations / 22 poses',action,flush=True)
sheet=Image.new('RGB',(1536,math.ceil(len(pictures)/6)*282),(18,26,38));draw=ImageDraw.Draw(sheet)
for i,(im,label) in enumerate(zip(pictures,labels)):
    x=i%6*256;y=i//6*282;sheet.paste(im,(x,y),im);draw.text((x+6,y+260),label,fill='white')
sheet.save(HERE/'repair-r1/all-appearance-actions.png',optimize=True)
(HERE/'repair-r1/all-appearance-poses.json').write_text(json.dumps({'schema':'cw.t2b2.all-appearance-poses','version':1,'sourceSHA':meta['sourceSHA'],'actualCompositions':len(rows),'rows':rows,'fallback':'mixed G006 helmet remains unavailable/uncovered plus mandatory text; not a G006 model','artApproved':False},indent=2)+'\n')
print('PASS 4356 actual independent-layer compositions; no art approval')
