// Shared visual adapter, no battle state or owned timers. Formal activation is separate.
import {pose} from './equipment-sprites-v1/animation.mjs?v=20261019-batch12-rising-cut1';
import {findAsset,palettes,findMapping} from './monster-sprites.mjs?v=20261022-batch18-alternate1';
export {palettes};
export function monsterPose(type,clip,ms){
 const p={...pose(clip,ms,{rootMotion:true})},t=Math.min(1,ms/700),s=Math.sin(Math.PI*t);
 if(clip==='attack'){
  Object.assign(p,{x:0,y:0,rotation:0,scaleX:1,scaleY:1,flash:0});
  if(type==='short-thrust')p.x=-.065*s;
  if(type==='mechanical-strike'){p.x=-.025*s;p.rotation=.025*s;}
  if(type==='ranged-shot')p.x=.025*s;
  if(type==='pounce'){p.x=-.09*s;p.y=-.035*s;}
  if(type==='pulse'||type==='stationary-shot')p.flash=.20*s;
 }
 if(clip==='hit'){p.x=-p.x;p.rotation=-p.rotation;}
 if(clip==='defeat')Object.assign(p,{x:.025*t,y:.02*t,rotation:-.30*t,scaleX:1-.24*t,scaleY:1-.24*t});
 return p;
}
// Maximum visual extents reserve room for every pose before decode completes.
export function visualPlacement(bounds,width,height,scale=1,pivot=[.5,.5],offset=[0,0]){
 const [l,t,r,b]=bounds,w=r-l,h=b-t;
 const fit=Math.min(width*.64/w,height*.62/h)*Math.max(.6,Math.min(1.3,scale));
 return {size:512*fit,x:width/2-((l+w*pivot[0])/512)*512*fit+offset[0],y:height/2-((t+h*pivot[1])/512)*512*fit+offset[1],fit};
}
// Shared stage placement for GM and future formal consumers. Canvas alpha is centered.
export function monsterPlacement(width,height,visual={},scale=visual.scale||1){
 const size=Math.min(width*(visual.maxStageFraction||.47)*2,height*.90)*Math.max(.6,Math.min(1.3,scale));
 const pivot=visual.pivot||[.5,.5];
 return {size,x:(width-size)/2+size*.68*(.5-pivot[0])+(visual.offsetX||0),y:(height-size)/2+size*.68*(.5-pivot[1])+(visual.offsetY||0)};
}

// Formal combat owns the pair's scale. Both consumers fit this same pair uniformly.
const kindScale={
    'dr-02':.92,'hm-01':1,'hm-02':1.06,'hm-04':1.24,'cmd-01':1.24,'cmd-03':1.72,
    'mech-01':1.38,'mech-02':1.53,'mech-03':1.78,'veh-02':1.3,
    'ship-01':1.38,'ship-04':1.78,'fort-01':1.72,'fort-03':1.85,
    'beast-01':1.16,'beast-03':1.65,'bio-02':1.54,'core-01':1.25,'core-03':1.74,'energy-01':1.34
   };
const footprints=new WeakMap();
export function visibleFootprint(actor){
 const key=actor.entry,tier=actor.canvas.width+':'+!!actor.mirrored;
 if(footprints.get(key)?.has(tier))return footprints.get(key).get(tier);
 actor.draw({clip:'idle',elapsedMs:0});
 const c=actor.canvas,n=c.width,data=c.getContext('2d').getImageData(0,0,n,n).data;
 let l=n,t=n,r=-1,b=-1;
 for(let i=3;i<data.length;i+=4)if(data[i]>16){const x=(i-3)/4%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 if(r<l||b<t)throw Error('empty-sprite-footprint');
 let minH=Infinity,maxH=0;
 for(let ms=0;ms<1600;ms+=25){
  actor.draw({clip:'idle',elapsedMs:ms});const d=c.getContext('2d').getImageData(0,0,n,n).data;let top=n,bottom=-1;
  for(let i=3;i<d.length;i+=4)if(d[i]>16){const y=Math.floor((i-3)/4/n);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  const h=(bottom-top+1)/n;minH=Math.min(minH,h);maxH=Math.max(maxH,h);
 }
 actor.draw({clip:'idle',elapsedMs:0});
 const result={minH,maxH,l:l/n,t:t/n,r:(r+1)/n,b:(b+1)/n,w:(r-l+1)/n,h:(b-t+1)/n};
 if(!footprints.has(key))footprints.set(key,new Map());footprints.get(key).set(tier,result);return result;
}
export function battleSpriteLayout(player,monster,width,height,visual={}){
 const p=visibleFootprint(player),m=visibleFootprint(monster);
 let ratio=Math.max(.9*p.maxH/p.h*m.h/m.minH,Math.min(2.3,(kindScale[monster.entry.assetId]||1)*(Number(visual.scale)||1)));
 if(visual.sizePolicy==='boss'){
  // Reserve 0.2% for CSS subpixel quantization while respecting the measured idle envelope.
  const min=1.502*p.maxH/p.h*m.h/m.minH,max=1.998*p.minH/p.h*m.h/m.maxH;
  if(min>max)throw Error('boss-size-envelope');
  ratio=Math.max(min,Math.min(max,Number(visual.visibleRatio)||1.75));
 }
 if(visual.sizePolicy==='dungeon'){
  // Measured cycle extrema, excluding CSS glow, bound every idle sample to [1,1.5].
  const min=p.maxH/p.h*m.h/m.minH,max=1.5*p.minH/p.h*m.h/m.maxH;
  if(min>max)throw Error('dungeon-size-envelope');
  ratio=Math.max(min,Math.min(max,Number(visual.visibleRatio)||1.1));
 }
 // Unit = the player's painted idle height. Offsets retain their 512px design units.
 const ps=1/p.h,ms=ratio/m.h,boundedApproach=visual.sizePolicy==='boss'||visual.sizePolicy==='dungeon'||monster.mapping?.kind==='special',gap=boundedApproach?.65:.22;
 const ox=(visual.offsetX||0)/512,oy=(visual.offsetY||0)/512;
 const px=-(p.l+p.r)/2*ps-p.w*ps/2-gap/2;
 const mx=-(m.l+m.r)/2*ms+m.w*ms/2+gap/2+ox;
 const py=-(p.t+p.b)/2*ps,my=-(m.t+m.b)/2*ms+oy;
 // Fit canvas envelopes as well as alpha: animated poses stay within the stage.
 const left=Math.min(px,mx),right=Math.max(px+ps,mx+ms);
 const top=Math.min(py,my),bottom=Math.max(py+ps,my+ms);
 const scale=Math.min(width/(right-left),height/(bottom-top));
 const x=(width-(right-left)*scale)/2-left*scale,y=(height-(bottom-top)*scale)/2-top*scale;
 const box=(a,b,size)=>({x:x+a*scale,y:y+b*scale,size:size*scale});
 return {player:box(px,py,ps),monster:box(mx,my,ms),ratio,approachLimit:boundedApproach?gap*.15*scale:Infinity};
}
export function applyBattleSpriteLayout(player,monster,width,height,visual={}){
 const layout=battleSpriteLayout(player,monster,width,height,visual);
 for(const [actor,key] of [[player,'player'],[monster,'monster']]){
  const b=layout[key],s=actor.canvas.style;
  Object.assign(s,{position:'absolute',left:b.x+'px',top:b.y+'px',width:b.size+'px',height:b.size+'px',maxWidth:'none',right:'auto'});
 }
 monster.canvas.dataset.actualRatio=String(layout.ratio);return layout;
}

export class MonsterActor{
 constructor(pool,id,{signal,identity=null,tier='medium',usage='gm',canvasFactory=()=>document.createElement('canvas')}={}){
  this.mapping=identity?findMapping(identity):null;if(identity&&(!this.mapping||this.mapping.assetId!==id))throw Error('monster-identity-mismatch');this.entry=findAsset(id);if(usage==='formal'&&this.entry?.formalBattleAllowed!==true)throw Error('monster-formal-unapproved');if(!this.entry)throw Error('monster-unavailable');this.pool=pool;this.signal=signal;this.closed=false;this.canvas=canvasFactory();this.canvas.width=this.canvas.height=tier==='high'?512:tier==='low'?128:256;this.ctx=this.canvas.getContext('2d');this.abort=()=>this.dispose();signal?.addEventListener('abort',this.abort,{once:true});
 }
 async init(){try{const lease=await this.pool.acquire(this.entry.assetId,{signal:this.signal});if(this.closed){lease.release();throw Error('monster-aborted');}this.lease=lease;if(!this.ctx)throw Error('canvas-unavailable');this.canvas.dataset.monster=this.entry.assetId;return this;}catch(e){this.dispose();throw e;}}
 draw({clip='idle',elapsedMs=0,palette=this.mapping?.visual.palette||'original'}={}){
  if(this.closed||!this.lease)throw Error('monster-unavailable');const c=this.ctx,n=this.canvas.width,a=this.entry,p=monsterPose(a.animationType,clip,elapsedMs),[l,t,r,b]=a.visualBounds;
  const effects=this.mapping?.visual.sizePolicy==='dungeon'&&dungeonEffectsEnabled(this.canvas);
  if(effects&&clip==='idle'&&this.mapping?.visual.effect==='float')p.y-=.008*Math.sin(elapsedMs/1600*Math.PI*2);
  if(effects&&clip==='idle'&&this.mapping?.visual.effect==='pulse')p.flash+=.035*(1+Math.sin(elapsedMs/1600*Math.PI*2))/2;
  // Center the actual alpha region; contain the full subject with pose margins.
  const size=Math.min(n*.68/(r-l),n*.68/(b-t))*512;
  c.clearRect(0,0,n,n);c.save();c.translate(n*(.5+p.x),n*(.5+p.y));c.rotate(p.rotation);c.scale(p.scaleX,p.scaleY);c.globalAlpha=p.alpha;
  c.drawImage(this.lease.bitmap,-(l+r)/1024*size,-(t+b)/1024*size,size,size);
  if(p.flash){c.globalCompositeOperation='source-atop';c.globalAlpha=p.flash;c.fillStyle='#fff';c.fillRect(-n,-n,n*2,n*2);}c.restore();
  // A compact bolt or pulse, never a crescent or a broad blade swing.
  if(clip==='attack'&&['mechanical-strike','ranged-shot','stationary-shot','pulse'].includes(a.animationType)){
   const q=Math.max(0,1-Math.abs(elapsedMs-336)/120);if(q){c.save();c.globalAlpha=q;c.fillStyle=a.animationType==='pulse'?'#c6a1fa':'#b2eaff';const w=n*(a.animationType==='ranged-shot'?.15:.09);c.fillRect(n*.08,n*.49,w,n*.018);c.restore();}
  }
  this.canvas.style.filter=palettes[palette]||palettes.original;if(this.mapping?.visual.sizePolicy==='dungeon')applyDungeonEffects(this.canvas,this.mapping.visual);this.canvas.dataset.clip=clip;return this.canvas;
 }
 dispose(){if(this.closed)return;this.closed=true;this.signal?.removeEventListener('abort',this.abort);this.lease?.release();this.lease=null;this.canvas.width=this.canvas.height=1;this.canvas.remove();}
}

// CSS effects live outside the painted canvas, never participate in body measurements.
// Reduced motion, explicit effects-off and low-end devices retain only base palette.
function dungeonEffectsEnabled(canvas){
 const disabled=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||globalThis.navigator?.hardwareConcurrency<=2||canvas.closest?.('[data-effects="off"]');
 return !disabled;
}
export function applyDungeonEffects(canvas,visual={}){
 const glow=visual.sizePolicy==='dungeon'&&dungeonEffectsEnabled(canvas);
 canvas.style.filter=(palettes[visual.palette]||'none')+(glow?' drop-shadow(0 0 '+(visual.energy===3?3:2)+'px '+(visual.palette?.includes('crimson')?'#833459':'#505b90')+')':'');
 if(glow&&visual.effect==='afterimage')canvas.style.filter+=' drop-shadow(2px 0 1px #453a6540)';
 canvas.dataset.effect=glow?visual.effect||'rim':'off';
}
