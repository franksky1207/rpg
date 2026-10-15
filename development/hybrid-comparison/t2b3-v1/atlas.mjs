import {atlasFolder} from './assets.mjs?v=20261015-phase4-lock1';
import {CLIPS,GRID} from './contract.mjs?v=20261012-t2b3-v1';
// Development-only LRU of fully decoded atlas pages. Never retains WebGL resources.
const DECODED_LIMIT=32*1024*1024, decodedPages=new Map();
let decodedBytes=0, decodedHits=0;
export const decodedAtlasStats=()=>Object.freeze({entries:decodedPages.size,bytes:decodedBytes,limit:DECODED_LIMIT,hits:decodedHits});
function getDecoded(key){
 const page=decodedPages.get(key);
 if(!page)return null;
 decodedPages.delete(key);decodedPages.set(key,page);decodedHits++;
 return page;
}
function keepDecoded(key,page){
 const bytes=page.rgba.byteLength+page.depth.byteLength;
 if(bytes>DECODED_LIMIT)return;
 const old=decodedPages.get(key);
 if(old){decodedBytes-=old.rgba.byteLength+old.depth.byteLength;decodedPages.delete(key);}
 decodedPages.set(key,page);decodedBytes+=bytes;
 while(decodedBytes>DECODED_LIMIT){
  const first=decodedPages.keys().next().value,evicted=decodedPages.get(first);
  decodedBytes-=evicted.rgba.byteLength+evicted.depth.byteLength;decodedPages.delete(first);
 }
}
// Lossless PNG16 grayscale depth; browser canvas alone would truncate to 8 bits.
export async function decodeDepth(bytes){
 const a=new Uint8Array(bytes),v=new DataView(bytes);if(a.slice(0,8).join(',')!=='137,80,78,71,13,10,26,10')throw Error('Bad PNG depth signature');let width,height,parts=[];
 for(let p=8;p<a.length;){const n=v.getUint32(p),type=String.fromCharCode(...a.slice(p+4,p+8));if(p+n+12>a.length)throw Error('Truncated PNG');if(type==='IHDR'){width=v.getUint32(p+8);height=v.getUint32(p+12);if(a[p+16]!==16||a[p+17]!==0||a[p+20]!==0)throw Error('Expected noninterlaced PNG16 grayscale');}if(type==='IDAT')parts.push(a.slice(p+8,p+8+n));p+=n+12;}
 if(!width||!height||width*height>16e6)throw Error('Invalid depth dimensions');const raw=new Uint8Array(await new Response(new Blob(parts).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());const stride=width*2;if(raw.length!==(stride+1)*height)throw Error('Bad depth scanlines');const decoded=new Uint8Array(stride*height);let pos=0;
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[pos++];if(filter>4)throw Error('Bad PNG filter');for(let x=0;x<stride;x++){const i=y*stride+x,left=x>=2?decoded[i-2]:0,up=y?decoded[i-stride]:0,corner=y&&x>=2?decoded[i-stride-2]:0;const add=[0,left,up,Math.floor((left+up)/2),paeth(left,up,corner)][filter];decoded[i]=(raw[pos++]+add)&255;}}
 const data=new Uint16Array(width*height);for(let i=0;i<data.length;i++)data[i]=decoded[i*2]*256+decoded[i*2+1];return {width,height,data};
}
export class AtlasActor{
 constructor(assets,actor,tier,layers){this.assets=assets;this.actor=actor;this.tier=tier;this.layers=layers;this.pages=[];this.canvas=document.createElement('canvas');this.canvas.width=this.canvas.height=GRID[tier];this.ctx=this.canvas.getContext('2d');this.lastKey=null;this.closed=false;}
 async init(){const folder=atlasFolder(this.actor,this.tier);this.meta=await this.assets.json(folder+'atlas.json');const masterFolder=atlasFolder(this.actor,'high');this.master=this.tier==='high'?this.meta:await this.assets.json(masterFolder+'atlas.json');this.pivot=this.master.pivotPixels.map(v=>v/256);
 // Bounded batches limit transient decode objects and abort promptly.
 for(const action of CLIPS)for(const layer of this.layers){this.assets.signal.throwIfAborted();const row=this.meta.rows.find(r=>r.action===action&&r.layer===layer);if(!row||row.frameCount!==22||row.durationMs!==700)throw Error('Missing actual atlas action/layer');const key=folder+row.rgba+'|'+row.depth;
  let page=getDecoded(key);
  if(!page){
   const bitmap=await this.assets.bitmap(folder+row.rgba);
   try{
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(bitmap,0,0);
    const rgba=c.getImageData(0,0,canvas.width,canvas.height).data;
    const depth=await decodeDepth(await this.assets.bytes(folder+row.depth));
    if(depth.width!==canvas.width||depth.height!==canvas.height)throw Error('Depth/RGBA dimensions mismatch');
    page={rgba,depth:depth.data,width:canvas.width};
    this.assets.signal.throwIfAborted();
    if(this.closed)throw Error('Atlas actor disposed');
    keepDecoded(key,page);
   }finally{bitmap.close();}
  }
  this.assets.signal.throwIfAborted();if(this.closed)throw Error('Atlas actor disposed');
  this.pages.push({row,...page});}
 return this;
 }
 draw({clip,tick}){const key=clip+':'+tick;if(key===this.lastKey)return this.canvas;this.lastKey=key;const n=this.canvas.width,output=this.ctx.createImageData(n,n),pixels=output.data,pages=this.pages.filter(p=>p.row.action===clip),coverage=[];
 for(const page of pages){const f=page.row.frames[tick],rect=f.rect,trim=f.trim||f.masterTrim;coverage.push({page,rect,x:Math.round(trim[0]*n/256),y:Math.round(trim[1]*n/256),w:Math.max(1,Math.round(trim[2]*n/256)),h:Math.max(1,Math.round(trim[3]*n/256))});}
 // Correct depth per pixel; never fixed slot painter order or 32 baked outfits.
 const hits=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++){hits.length=0;for(const p of coverage){if(x<p.x||x>=p.x+p.w||y<p.y||y>=p.y+p.h)continue;const sx=p.rect[0]+Math.min(p.rect[2]-1,Math.floor((x-p.x)*p.rect[2]/p.w)),sy=p.rect[1]+Math.min(p.rect[3]-1,Math.floor((y-p.y)*p.rect[3]/p.h)),i=sy*p.page.width+sx;if(p.page.rgba[i*4+3])hits.push({p:p.page,i,z:p.page.depth[i]});}hits.sort((a,b)=>b.z-a.z);let r=0,g=0,b=0,a=0;for(const hit of hits){const q=hit.p.rgba,i=hit.i*4,alpha=q[i+3]/255,newAlpha=alpha+a*(1-alpha);r=(q[i]*alpha+r*a*(1-alpha))/newAlpha;g=(q[i+1]*alpha+g*a*(1-alpha))/newAlpha;b=(q[i+2]*alpha+b*a*(1-alpha))/newAlpha;a=newAlpha;}const i=(y*n+x)*4;pixels[i]=r;pixels[i+1]=g;pixels[i+2]=b;pixels[i+3]=a*255;}
 this.ctx.putImageData(output,0,0);return this.canvas;
 }
 dispose(){if(this.closed)return;this.closed=true;this.pages.length=0;this.canvas.width=this.canvas.height=1;}
}
