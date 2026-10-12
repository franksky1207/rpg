"""Offline, per-frame linear-premultiplied area reduction of one master atlas.
Depth chooses nearest covered contributor, never averages foreground with air.
No GPU measurement, downloader, player or alternate battle clock.
"""
import json,pathlib,hashlib,math
import numpy as np
from PIL import Image
HERE=pathlib.Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def linear(c):return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
def srgb(c):return np.where(c<=.0031308,c*12.92,1.055*np.maximum(c,0)**(1/2.4)-.055)
def reduce(rgba,depth,width,height):
    a=np.asarray(rgba,dtype=float)/255;z=np.asarray(depth,dtype=np.uint16)
    color=np.concatenate([linear(a[:,:,:3])*a[:,:,3:4],a[:,:,3:4]],axis=2)
    target=np.zeros((height,width,4));nearest=np.full((height,width),65535,np.uint16)
    # Exact rectangular source coverage. Same rule handles arbitrary union trims.
    for y in range(height):
        y0=y*a.shape[0]/height;y1=(y+1)*a.shape[0]/height
        for x in range(width):
            x0=x*a.shape[1]/width;x1=(x+1)*a.shape[1]/width
            total=np.zeros(4);zs=[]
            for sy in range(math.floor(y0),math.ceil(y1)):
                for sx in range(math.floor(x0),math.ceil(x1)):
                    w=(min(sy+1,y1)-max(sy,y0))*(min(sx+1,x1)-max(sx,x0))
                    total+=color[sy,sx]*w
                    if a[sy,sx,3]>0:zs.append(z[sy,sx])
            target[y,x]=total/((x1-x0)*(y1-y0))
            if zs:nearest[y,x]=min(zs)
    alpha=target[:,:,3:4];rgb=np.divide(target[:,:,:3],alpha,out=np.zeros_like(target[:,:,:3]),where=alpha>0)
    out=np.round(np.clip(np.concatenate([srgb(rgb),alpha],axis=2),0,1)*255).astype('uint8');out[out[:,:,3]==0]=0;nearest[out[:,:,3]==0]=65535
    return Image.fromarray(out),Image.fromarray(nearest)
summary={'schema':'cw.t2b2.repair-quality','version':1,'basis':'one repaired high master, no inferior A-only source','method':'exact area, linear sRGB/premultiplied RGBA; depth nearest covered sample; independent cells before packing','tiers':{},'gpuMeasured':False,'comparisonGate':'B3 must render B/C to matching 128/192/256 actor-source pixel grids, same visible size/camera/VFX; current 3D LOD geometry difference still requires visual comparison','highStrategy':'original shared high master; no duplicate files'}
for tier,scale in [('low',.5),('medium',.75),('high',1)]:
    files=[]
    for actor in ['player','normal','elite','boss']:
        origin=HERE/('player' if actor=='player' else 'enemies/'+actor)/'atlases';meta=json.loads((origin/'atlas.json').read_text())
        if tier=='high':
            for row in meta['rows']:
                for key in ['rgba','depth']:
                    p=origin/row[key];im=Image.open(p);files.append({'path':str(p.relative_to(HERE)),'bytes':p.stat().st_size,'sha256':sha(p),'decodedPlaneBytesEstimate':im.width*im.height*(4 if key=='rgba' else 2)})
            continue
        dest=HERE/'repair-r1/tiers'/tier/actor;rows=[]
        for row in meta['rows']:
            color=Image.open(origin/row['rgba']);depth=Image.open(origin/row['depth']);fw,fh=[max(1,math.ceil(n*scale)) for n in row['frameDimensions']];pw,ph=(fw+4)*7,(fh+4)*4
            page=Image.new('RGBA',(pw,ph));zpage=Image.new('I;16',(pw,ph),65535);frames=[]
            for f in row['frames']:
                x,y,w,h=f['rect'];c,z=reduce(color.crop((x,y,x+w,y+h)),depth.crop((x,y,x+w,y+h)),fw,fh);nx=f['frame']%7*(fw+4)+2;ny=f['frame']//7*(fh+4)+2;page.paste(c,(nx,ny));zpage.paste(z,(nx,ny))
                frames.append({'frame':f['frame'],'timeMs':f['timeMs'],'rect':[nx,ny,fw,fh],'uv':[nx/pw,ny/ph,(nx+fw)/pw,(ny+fh)/ph],'masterTrim':f['trim'],'masterPivot':f['pivot'],'displayRule':'map reduced rect to original masterTrim extent, preserve original pivot and stage size'})
            dest.mkdir(parents=True,exist_ok=True)
            for key,im in [('rgba',page),('depth',zpage)]:
                path=dest/row[key];im.save(path,optimize=True);files.append({'path':str(path.relative_to(HERE)),'bytes':path.stat().st_size,'sha256':sha(path),'decodedPlaneBytesEstimate':pw*ph*(4 if key=='rgba' else 2)})
            rows.append({'action':row['action'],'layer':row['layer'],'rgba':row['rgba'],'depth':row['depth'],'dimensions':[pw,ph],'frameDimensions':[fw,fh],'padding':2,'mipmap':False,'frames':frames,'durationMs':700,'frameCount':22,'fps':30})
        write(dest/'atlas.json',{'schema':'cw.t2b2.repair-tier-atlas','version':1,'masterMetadata':str((origin/'atlas.json').relative_to(HERE)),'masterSHA':sha(origin/'atlas.json'),'sourceSHA':meta['sourceSHA'],'scale':scale,'sourcePixelBudget':round(256*scale),'rows':rows})
    summary['tiers'][tier]={'sourcePixelBudget':round(256*scale),'files':files,'encodedBytes':sum(f['bytes'] for f in files),'decodedPlaneBytesEstimate':sum(f['decodedPlaneBytesEstimate'] for f in files),'gpuBytes':'unavailable; estimates exclude driver/mip/upload overhead'}
write(HERE/'repair-r1/quality-tiers.json',summary)
print('PASS reproducible same-master tier candidates, actual encoded bytes and decoded estimates')
