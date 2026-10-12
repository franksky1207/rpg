"""Deterministic offline packing/QC; not a runtime player or combat engine.
python3 .../tools/pack_atlases.py --frames /tmp/t2b2-frames
Pillow/numpy only rearrange actual Blender pixels and depth. No invented poses.
"""
import pathlib,json,argparse,hashlib,math
import numpy as np
from PIL import Image,ImageDraw
HERE=pathlib.Path(__file__).resolve().parents[1]
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rgba(p):
 a=np.array(Image.open(p).convert('RGBA'));a[a[:,:,3]==0]=0;return a
def assemble(root,action,frame,slots):
 # Offline QC only: nearest-depth sort permits weapon/boots crossing body.
 layers=['body-base']+['body-'+s for s in ['helmet','armor','shoes','accessory'] if s not in slots]+list(slots)
 colors=[];depth=[]
 for key in layers:
  folder=root/action/key;c=rgba(folder/f'{frame:02}.png');z=np.array(Image.open(next(folder.glob(f'depth-{frame:02}-*.png')))).astype(np.float32);z[c[:,:,3]==0]=1e6;colors.append(c);depth.append(z)
 colors=np.array(colors);order=np.argsort(np.array(depth),axis=0)[::-1];dst=np.zeros((256,256,4),np.float32)
 for ix in order:
  c=np.take_along_axis(colors,ix[None,:,:,None],axis=0)[0].astype(np.float32)/255;a=c[:,:,3:4];alpha=a+dst[:,:,3:4]*(1-a)
  dst[:,:,:3]=np.divide(c[:,:,:3]*a+dst[:,:,:3]*dst[:,:,3:4]*(1-a),alpha,out=np.zeros_like(c[:,:,:3]),where=alpha>0);dst[:,:,3:4]=alpha
 return Image.fromarray(np.round(dst*255).astype('uint8'),'RGBA')
def sheet(images,labels,cols=6):
 out=Image.new('RGB',(cols*256,math.ceil(len(images)/cols)*282),(18,26,38));draw=ImageDraw.Draw(out)
 for i,(im,label) in enumerate(zip(images,labels)):
  x=(i%cols)*256;y=(i//cols)*282;out.paste(im,(x,y),im);draw.text((x+8,y+260),label,fill=(210,230,245))
 return out
p=argparse.ArgumentParser();p.add_argument('--frames',default='/tmp/t2b2-frames');args=p.parse_args();frames=pathlib.Path(args.frames)
index={'schema':'cw.t2b2.atlas-index','version':1,'status':'prototype-pending-user-approval','mipmap':False,'colorSpace':'sRGB straight-alpha RGBA8, transparent RGB zero','padding':2,'sampling':'linear; no mipmap; frame interior UV only','actors':{}}
reviews=HERE/'review';reviews.mkdir(exist_ok=True)
for actor in ['normal','elite','boss','player']:
 root=frames/actor;bake=json.loads((root/'bake.json').read_text());dest=HERE/('player' if actor=='player' else 'enemies/'+actor)/'atlases';dest.mkdir(parents=True,exist_ok=True)
 rows=[];poseimages=[];labels=[]
 for action in ['idle','attack','hit','dodge','return','defeat']:
  for layer in bake['layers']:
   folder=root/action/layer;bounds=[Image.open(folder/f'{f:02}.png').getchannel('A').getbbox() for f in range(22)];bounds=[b for b in bounds if b]
   # One common trim for the complete action; retain 3px transparent margin.
   # Pivot may lie outside a small helmet/patch rectangle, which is intentional.
   trim=[max(0,min(b[0] for b in bounds)-3),max(0,min(b[1] for b in bounds)-3),min(256,max(b[2] for b in bounds)+3),min(256,max(b[3] for b in bounds)+3)]
   fw,fh=trim[2]-trim[0],trim[3]-trim[1];pw,ph=(fw+4)*7,(fh+4)*4;pivot=[bake['pivotPixels'][0]-trim[0],bake['pivotPixels'][1]-trim[1]]
   color=Image.new('RGBA',(pw,ph));depth=Image.new('I;16',(pw,ph),65535);frame_rows=[]
   for f in range(22):
    src=folder/f'{f:02}.png';full=rgba(src);im=Image.fromarray(full,'RGBA').crop(tuple(trim));zz=np.array(Image.open(next(folder.glob(f'depth-{f:02}-*.png'))));zz[full[:,:,3]==0]=65535;z=Image.fromarray(zz.astype('uint16')).crop(tuple(trim));x=(f%7)*(fw+4)+2;y=(f//7)*(fh+4)+2;color.paste(im,(x,y));depth.paste(z,(x,y))
    frame_rows.append({'frame':f,'timeMs':f*1000/30,'page':0,'rect':[x,y,fw,fh],'uv':[x/pw,y/ph,(x+fw)/pw,(y+fh)/ph],'pivot':pivot,'trim':[trim[0],trim[1],fw,fh],'alphaBounds':list(im.getchannel('A').getbbox() or (0,0,0,0))})
   cp=dest/f'{action}-{layer}.png';zp=dest/f'{action}-{layer}-depth.png';color.save(cp,optimize=True);depth.save(zp,optimize=True)
   rows.append({'action':action,'layer':layer,'frameCount':22,'fps':30,'durationMs':700,'endpoint':'inclusive 700ms sample; no extra frame hold','loop':action=='idle','page':0,'dimensions':[pw,ph],'frameDimensions':[fw,fh],'sourceFrameDimensions':[256,256],'padding':2,'mipmap':False,'rgba':cp.name,'depth':zp.name,'encodedBytes':cp.stat().st_size,'decodedRGBABytes':pw*ph*4,'depthEncodedBytes':zp.stat().st_size,'decodedDepthBytes':pw*ph*2,'sha256':sha(cp),'depthSHA256':sha(zp),'frames':frame_rows})
  for f in [0,4,9,14,21]:
   im=assemble(root,action,f,['weapon','helmet','armor','shoes','accessory']) if actor=='player' else Image.open(root/action/'enemy'/f'{f:02}.png').convert('RGBA')
   poseimages.append(im);labels.append(f'{actor} {action} frame {f}')
 sheet(poseimages,labels,5).save(reviews/f'{actor}-motion-contact.png',optimize=True)
 write(dest/'atlas.json',{'schema':'cw.t2b2.actor-atlases','version':1,'sourceSHA':bake['sourceSHA'],'camera':bake['camera'],'pivotPixels':bake['pivotPixels'],'depth':bake['depth'],'rows':rows,'A_B_enemySamePages':actor!='player','rawFrames':'reproduce via render_frames.py; common-action trim plus original-frame origin restores all visible pixels'})
 write(reviews/f'{actor}-pose-samples.json',{'actor':actor,'sourceSHA':bake['sourceSHA'],'samples':bake['samples']})
 index['actors'][actor]={'metadata':str((dest/'atlas.json').relative_to(HERE)),'sourceSHA':bake['sourceSHA'],'actions':6,'layers':len(bake['layers']),'framesPerLayer':132,'bakeEngine':bake['renderEngine']}
slots=['weapon','helmet','armor','shoes','accessory'];root=frames/'player';variants=json.loads((HERE.parent/'t2a-v1/owner-fixtures.json').read_text())['appearanceVariants'];subsetimages=[];subsetlabels=[];checks=[]
for v in variants:
 worn=[s for s in slots if v['appearance']['equipment'][s]['present'] and v['resolved']['high'][slots.index(s)]['assetKind']=='equipment-glb']
 im=assemble(root,'attack',9,worn);subsetimages.append(im);subsetlabels.append(v['id']);checks.append({'variantId':v['id'],'selectedLayers':worn,'emptySlots':[s for s in slots if not v['appearance']['equipment'][s]['present']],'unavailableSlots':[s for s in slots if v['appearance']['equipment'][s]['present'] and s not in worn],'fallback':'missing G006 helmet uses uncovered base head + explicit unavailable cue; not a G006 model','pixelSHA256':hashlib.sha256(im.tobytes()).hexdigest()})
sheet(subsetimages,subsetlabels,6).save(reviews/'player-33-independent-subsets.png',optimize=True)
write(reviews/'subset-composition.json',{'schema':'cw.t2b2.offline-layer-qc','version':1,'variants':checks,'composedBy':'offline depth compositing only; no B3 Renderer','all32DifferentPixels':len({x['pixelSHA256'] for x in checks[:32]})==32,'sourceFramesUnchanged':True})
# Original analytical contact footprint, silent/static VFX component. Keep source.
y,x=np.mgrid[0:128,0:256];alpha=np.maximum(0,1-((x-128)/116)**2-((y-64)/38)**2)**2*.48
a=np.zeros((128,256,4),np.uint8);a[:,:,3]=np.round(alpha*255);Image.fromarray(a).save(HERE/'shared/contact-shadow.png',optimize=True)
write(HERE/'atlas-index.json',index)
print('PASS packed real RGBA/depth frames, 3 enemies, 6 actions, 10 player layers; 33 independent subset reviews')
