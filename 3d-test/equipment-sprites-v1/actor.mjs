// Drop-in B draw(plan) actor adapter, not another battle renderer or clock.
import {pose,GRID} from './animation.mjs';
export class WholeSuitActor{
 constructor(pool,entry,{tier='medium',signal,canvasFactory=()=>document.createElement('canvas')}={}){
  if(!GRID[tier])throw Error('invalid-sprite-tier');this.pool=pool;this.entry=entry;this.signal=signal;this.pivot=[.5,.9];this.closed=false;this.lease=null;this.canvas=canvasFactory();this.canvas.width=this.canvas.height=GRID[tier];this.ctx=this.canvas.getContext('2d');this.abort=()=>this.dispose();signal?.addEventListener('abort',this.abort,{once:true});
 }
 async init(){try{const lease=await this.pool.acquire(this.entry,{signal:this.signal});if(this.closed){lease.release();throw Error('sprite-aborted');}this.lease=lease;return this;}catch(error){this.dispose();throw error;}}
 draw(plan){
  if(this.closed||!this.lease||this.pool.stats().closed)throw Error('sprite-unavailable');
  // B projection already owns approach displacement. Its adapter uses rootMotion=false.
  const p=pose(plan.clip,plan.elapsedMs??plan.ms??0,{rootMotion:plan.rootMotion===true}),n=this.canvas.width,c=this.ctx;
  c.clearRect(0,0,n,n);c.save();c.translate(n*(.5+p.x),n*(.9+p.y));c.rotate(p.rotation);c.scale(p.scaleX,p.scaleY);
  if(p.trail){c.globalAlpha=p.trail;c.drawImage(this.lease.bitmap,-n*.5-n*.035,-n*.9,n,n);}
  c.globalAlpha=p.alpha;c.drawImage(this.lease.bitmap,-n*.5,-n*.9,n,n);
  if(p.flash){c.globalCompositeOperation='source-atop';c.globalAlpha=p.flash;c.fillStyle='#fff';c.fillRect(-n*.5,-n*.9,n,n);}
  c.restore();
  if(p.slash){c.save();c.globalAlpha=p.slash*.6;c.strokeStyle='#c5efff';c.lineWidth=n*.018;c.beginPath();c.arc(n*.58,n*.43,n*.25,-1.1,1.1);c.stroke();c.restore();}
  return this.canvas;
 }
 dispose(){if(this.closed)return;this.closed=true;this.signal?.removeEventListener('abort',this.abort);this.lease?.release();this.lease=null;this.canvas.width=this.canvas.height=1;}
}
