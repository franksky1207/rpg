// Shared visual adapter, no battle state or owned timers. Formal activation is separate.
import {pose} from './equipment-sprites-v1/animation.mjs?v=20261019-batch12-rising-cut1';
import {findAsset,palettes,findMapping} from './monster-sprites.mjs?v=20261020-twenty-gm1';
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

// Baseline sizes are expressed against the player's visible 430/512 sprite height.
// Apply each monster's official scale without ever dropping below 90% of the player.
export const PLAYER_VISIBLE_FRACTION=430/512;
export function monsterVisibleSize(entry,visual={}){
 const [l,t,r,b]=entry.visualBounds;
 const subjectHeight=b-t,subjectWidth=r-l;
 const requested=Number.isFinite(visual.scale)?visual.scale:1;
 // Fit to the physical square viewport; avoid clipped wide monsters and allow
 // large units to remain larger when the stage gives enough horizontal room.
 const ratio=subjectWidth/subjectHeight;
 const requestedHeight=Math.max(PLAYER_VISIBLE_FRACTION*.90,Math.min(PLAYER_VISIBLE_FRACTION*1.80,PLAYER_VISIBLE_FRACTION*requested));
 const fitHeight=Math.min(requestedHeight,.96/ratio);
 return {visibleFraction:fitHeight,relativeToPlayer:fitHeight/PLAYER_VISIBLE_FRACTION,scale:requested,clippedByAspect:fitHeight<PLAYER_VISIBLE_FRACTION*.90};
}
export class MonsterActor{
 constructor(pool,id,{signal,identity=null,tier='medium',usage='gm',canvasFactory=()=>document.createElement('canvas')}={}){
  this.mapping=identity?findMapping(identity):null;if(identity&&(!this.mapping||this.mapping.assetId!==id))throw Error('monster-identity-mismatch');this.entry=findAsset(id);if(usage==='formal'&&this.entry?.formalBattleAllowed!==true)throw Error('monster-formal-unapproved');if(!this.entry)throw Error('monster-unavailable');this.pool=pool;this.signal=signal;this.closed=false;this.canvas=canvasFactory();this.canvas.width=this.canvas.height=tier==='high'?512:tier==='low'?128:256;this.ctx=this.canvas.getContext('2d');this.abort=()=>this.dispose();signal?.addEventListener('abort',this.abort,{once:true});
 }
 async init(){try{this.lease=await this.pool.acquire(this.entry.assetId,{signal:this.signal});if(this.closed)throw Error('monster-aborted');if(!this.ctx)throw Error('canvas-unavailable');this.canvas.dataset.monster=this.entry.assetId;return this;}catch(e){this.dispose();throw e;}}
 draw({clip='idle',elapsedMs=0,palette=this.mapping?.visual.palette||'original'}={}){
  if(this.closed||!this.lease)throw Error('monster-unavailable');const c=this.ctx,n=this.canvas.width,a=this.entry,p=monsterPose(a.animationType,clip,elapsedMs),[l,t,r,b]=a.visualBounds;
  // Subject size is driven by approved per-identity scale, with a 90%-of-player minimum.
  const target=monsterVisibleSize(a,this.mapping?.visual||{});
  const size=n*target.visibleFraction*512/(b-t);
  c.clearRect(0,0,n,n);c.save();c.translate(n*(.5+p.x),n*(.5+p.y));c.rotate(p.rotation);c.scale(p.scaleX,p.scaleY);c.globalAlpha=p.alpha;
  c.drawImage(this.lease.bitmap,-(l+r)/1024*size,-(t+b)/1024*size,size,size);
  if(p.flash){c.globalCompositeOperation='source-atop';c.globalAlpha=p.flash;c.fillStyle='#fff';c.fillRect(-n,-n,n*2,n*2);}c.restore();
  // A compact bolt or pulse, never a crescent or a broad blade swing.
  if(clip==='attack'&&['mechanical-strike','ranged-shot','stationary-shot','pulse'].includes(a.animationType)){
   const q=Math.max(0,1-Math.abs(elapsedMs-336)/120);if(q){c.save();c.globalAlpha=q;c.fillStyle=a.animationType==='pulse'?'#c6a1fa':'#b2eaff';const w=n*(a.animationType==='ranged-shot'?.15:.09);c.fillRect(n*.08,n*.49,w,n*.018);c.restore();}
  }
  this.canvas.style.filter=palettes[palette]||palettes.original;this.canvas.dataset.clip=clip;return this.canvas;
 }
 dispose(){if(this.closed)return;this.closed=true;this.signal?.removeEventListener('abort',this.abort);this.lease?.release();this.lease=null;this.canvas.width=this.canvas.height=1;this.canvas.remove();}
}
