"""Measured same-frame images; fixed source-derived luminance regions.
Reports failures; never substitutes a pass threshold for rendering differences.
"""
import pathlib,json,subprocess,io,hashlib
import numpy as np
from PIL import Image,ImageDraw
HERE=pathlib.Path(__file__).resolve().parents[1];out=HERE/'repair-r2';baseline=json.loads((out/'revision.json').read_text())['baselineHEAD']
def old(path):return subprocess.check_output(['git','show',baseline+':development/hybrid-comparison/t2b2-v1/'+path],cwd=HERE)
def source(actor,action,tick,before):
 folder=f'enemies/{actor}/atlases/';meta=json.loads(old(folder+'atlas.json')) if before else json.loads((HERE/folder/'atlas.json').read_text());r=next(r for r in meta['rows'] if r['action']==action);f=r['frames'][tick];x,y,w,h=f['rect'];tx,ty,*_=f['trim'];im=Image.open(io.BytesIO(old(folder+r['rgba']))) if before else Image.open(HERE/folder/r['rgba']);pic=Image.new('RGBA',(256,256));pic.paste(im.crop((x,y,x+w,y+h)),(tx,ty));return pic
def lab(rgb):
 linear=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4)
 xyz=linear@np.array([[.4124564,.2126729,.0193339],[.3575761,.7151522,.1191920],[.1804375,.0721750,.9503041]])
 xyz=xyz/np.array([.95047,1,1.08883]);f=np.where(xyz>(6/29)**3,np.cbrt(xyz),xyz/(3*(6/29)**2)+4/29)
 return np.stack([116*f[:,:,1]-16,500*(f[:,:,0]-f[:,:,1]),200*(f[:,:,1]-f[:,:,2])],axis=-1)
rows=[];pictures=[]
for actor in ['normal','elite','boss']:
 for action in ['idle','attack','hit','dodge','return','defeat']:
  for tick in [0,9,21]:
   images={};metrics={}
   beforeSource=source(actor,action,tick,True);a0=np.asarray(beforeSource)/255;lum=a0[:,:,:3]@np.array([.2126,.7152,.0722])
   for rev in ['r1','r2']:
    a=beforeSource if rev=='r1' else source(actor,action,tick,False)
    b=Image.open(out/('native-aligned-r1' if rev=='r1' else 'native')/f'{actor}-{action}-{tick}-agx.png').convert('RGBA');images[rev]=(a,b)
    aa=np.asarray(a)/255;bb=np.asarray(b)/255;opaque=(aa[:,:,3]>.9)&(bb[:,:,3]>.9);assert opaque.sum()>100
    union=(aa[:,:,3]>.5)|(bb[:,:,3]>.5);inter=(aa[:,:,3]>.5)&(bb[:,:,3]>.5)
    delta=np.linalg.norm(lab(aa[:,:,:3])-lab(bb[:,:,:3]),axis=-1)
    regions={}
    for name,m in [('all',opaque),('dark',opaque&(lum<.15)),('mid',opaque&(lum>=.15)&(lum<.35)),('bright',opaque&(lum>=.35))]:
     regions[name]={'pixels':int(m.sum()),'deltaE76Median':float(np.median(delta[m])) if m.any() else None,'deltaE76P95':float(np.percentile(delta[m],95)) if m.any() else None,'rgbRMSE':float(np.sqrt(np.mean((aa[m,:3]-bb[m,:3])**2))) if m.any() else None,'meanRGBSource':aa[m,:3].mean(0).tolist() if m.any() else None,'meanRGBNative':bb[m,:3].mean(0).tolist() if m.any() else None}
    metrics[rev]={'silhouetteIoU':float(inter.sum()/union.sum()),'regions':regions}
   a1=np.asarray(images['r1'][0])/255;a2=np.asarray(images['r2'][0])/255;sourceMask=(a1[:,:,3]>.9)&(a2[:,:,3]>.9)
   rows.append({'sourceOnlyRGBRMSE':float(np.sqrt(np.mean((a1[sourceMask,:3]-a2[sourceMask,:3])**2))),'actor':actor,'action':action,'tick':tick,'metrics':metrics})
   if tick==9:
    im=Image.new('RGB',(1024,290),(18,26,38));draw=ImageDraw.Draw(im)
    for i,(pic,label) in enumerate([(images['r1'][0],'r1 Blender'),(images['r1'][1],'r1 native'),(images['r2'][0],'r2 Blender'),(images['r2'][1],'r2 native')]):im.paste(pic,(i*256,0),pic);draw.text((i*256+8,260),label,fill='white')
    draw.text((8,278),actor+' '+action+' tick9 / ART NOT APPROVED',fill='white');pictures.append(im)
summary={rev:float(np.mean([r['metrics'][rev]['regions']['all']['rgbRMSE'] for r in rows])) for rev in ['r1','r2']}
byActor={a:{rev:float(np.mean([r['metrics'][rev]['regions']['all']['rgbRMSE'] for r in rows if r['actor']==a])) for rev in ['r1','r2']} for a in ['normal','elite','boss']}
contact=Image.new('RGB',(1024,290*len(pictures)),(18,26,38))
for i,p in enumerate(pictures):contact.paste(p,(0,290*i))
contact.save(out/'same-frame-r1-r2.png',optimize=True)
report={'schema':'cw.t2b2.r2-color-difference','baselineHEAD':baseline,'rows':rows,'meanRGBRMSE':summary,'byActor':byActor,'actualNative':True,'physicalGPU':False,'sameCameraAndTicks':True,'historicalR1MeanWithIncorrectGroupRange':0.21618724813551224,'materialOnlyAttemptWithIncorrectGroupRange':0.21763030939849037,'samplingCorrection':'GLB authored start 1/30s; native frame=(1/30+tick/30)*60, never group.from..to including loader-added zero key','lightRegions':'reference r1 source Rec709 display luminance: dark <.15, mid [.15,.35), bright >=.35; fixed for both revisions; not inferred lamp ownership','display':'same Blender OCIO AgX no exposure fit, same r1 native quadrature/IBL; PBR scalar texture fixed','status':'improved-partial-material-repair-native-parity-unapproved' if summary['r2']<summary['r1'] else 'failed-RMSE-worsened','perceptualMetric':'D65 CIELAB deltaE76, sRGB IEC decode; not deltaE2000 and not subjective art approval','equivalenceGate':'not-passed; material scalar parity alone does not prove light, shadow, per-material appearance equivalence','artApproved':False}
(out/'color-difference.json').write_text(json.dumps(report,indent=2)+'\n');print(summary,byActor,report['status'])
