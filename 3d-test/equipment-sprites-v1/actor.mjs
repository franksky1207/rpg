// Drop-in B draw(plan) actor adapter, not another battle renderer or clock.
import {pose,weaponPose,risingCutPose,GRID} from './animation.mjs?v=20261019-batch12-rising-cut1';
export class WholeSuitActor{
 constructor(pool,entry,{tier='medium',signal,canvasFactory=()=>document.createElement('canvas')}={}){
  if(!GRID[tier])throw Error('invalid-sprite-tier');this.pool=pool;this.entry=entry;this.signal=signal;this.pivot=[.5,.9];this.closed=false;this.lease=null;this.layers=[];this.weaponReady=false;this.canvas=canvasFactory();this.canvas.width=this.canvas.height=GRID[tier];this.ctx=this.canvas.getContext('2d');this.abort=()=>this.dispose();signal?.addEventListener('abort',this.abort,{once:true});
 }
 async init(){try{if(!this.ctx)throw Error('canvas-unavailable');const joint=this.entry.weaponAnimation?.template==='short-rising-cut';const lease=await this.pool.acquire(this.entry,{signal:this.signal,...(joint?{layer:'body'}:{})});if(this.closed){lease.release();throw Error('sprite-aborted');}this.lease=lease;if(joint){this.weaponReady=true;return this;}
   if(this.entry.weaponAnimation?.weaponAnimationStatus==='complete'){
    this.weaponLoad=(async()=>{
    const own=new AbortController();this.weaponAbort=own;const cancel=()=>own.abort();this.signal?.addEventListener('abort',cancel,{once:true});const timeout=setTimeout(cancel,2500);
    try{for(const layer of ['body','weapon']){const part=await this.pool.acquire(this.entry,{signal:own.signal,layer});if(this.closed){part.release();throw Error('sprite-aborted');}this.layers.push(part);}this.weaponReady=true;}
    catch{for(const part of this.layers)part.release();this.layers=[];this.weaponReady=false;}
    finally{clearTimeout(timeout);this.signal?.removeEventListener('abort',cancel);}
    })();
   }
   if(this.closed)throw Error('sprite-aborted');return this;}catch(error){this.dispose();throw error;}}
 draw(plan){
  if(this.closed||!this.lease||this.pool.stats().closed)throw Error('sprite-unavailable');
  // B projection already owns approach displacement. Its adapter uses rootMotion=false.
  let p=pose(plan.clip,plan.elapsedMs??plan.ms??0,{rootMotion:plan.rootMotion===true}),n=this.canvas.width,c=this.ctx;
  const rig=this.weaponReady&&this.entry.weaponAnimation?.template==='short-rising-cut';
  if(rig&&['attack','return'].includes(plan.clip))p=Object.freeze({...p,rotation:0,scaleX:1,scaleY:1});
  if(this.entry.singleLayer&&plan.clip==='hit')p=Object.freeze({...p,rotation:-p.rotation});
  if(this.entry.singleLayer&&plan.clip==='defeat'){const t=Math.min(1,(plan.elapsedMs??plan.ms??0)/700);p=Object.freeze({...p,rotation:.65*t,x:-.10*t,y:-.05*t,scaleX:1-.5*t,scaleY:1-.5*t});}
  c.clearRect(0,0,n,n);c.save();c.translate(n*(.5+p.x),n*(.9+p.y));c.rotate(plan.clip==='attack'&&!this.entry.singleLayer?0:p.rotation);c.scale(p.scaleX,p.scaleY);
  if(p.trail&&!rig){c.globalAlpha=p.trail;c.drawImage(this.lease.bitmap,-n*.5-n*.035,-n*.9,n,n);}
  c.globalAlpha=p.alpha;
  const attack=plan.clip==='attack'||plan.clip==='return'&&Number.isFinite(plan.attackElapsedMs),attackMs=plan.attackElapsedMs??plan.elapsedMs??plan.ms??0;
  if(attack&&(!this.wasAttack||attackMs<this.lastAttackMs))this.attackLayered=this.weaponReady;
  this.wasAttack=attack;this.lastAttackMs=attackMs;
  const separated=attack&&this.attackLayered&&this.weaponReady,config=this.entry.weaponAnimation;
  this.canvas.dataset&&(this.canvas.dataset.weaponReady=String(this.weaponReady));
  if(rig){
   const config=this.entry.weaponAnimation,w=risingCutPose(attack?attackMs:0,config),[jx,jy]=config.joint;
   this.canvas.dataset&&(this.canvas.dataset.weaponStage=attack?w.stage:'idle',this.canvas.dataset.weaponAngle=String(w.angle));
   c.drawImage(this.lease.bitmap,...config.atlas.body,-n*.5,-n*.9,n,n);
   c.save();c.translate(n*(jx-.5),n*(jy-.9));c.rotate(w.angle);c.drawImage(this.lease.bitmap,...config.atlas.arm,-n*jx,-n*jy,n,n);c.restore();
   // Original elbow plate occludes the overlapping local joint. No attack effect.
   const r=config.capRadius;c.save();c.beginPath();c.rect(n*(jx-.5-r),n*(jy-.9-r),n*r*2,n*r*2);c.clip();c.drawImage(this.lease.bitmap,...config.atlas.body,-n*.5,-n*.9,n,n);c.restore();
  }else if(separated){
   const w=weaponPose(plan.attackElapsedMs??plan.elapsedMs??plan.ms??0,config),[gx,gy]=config.grip;
   this.canvas.dataset&&(this.canvas.dataset.weaponStage=w.stage,this.canvas.dataset.weaponAngle=String(w.angle));
   c.translate(n*w.approach,0);c.drawImage(this.layers[0].bitmap,-n*.5,-n*.9,n,n);
   c.save();c.translate(n*(gx-.5),n*(gy-.9));c.rotate(w.angle);c.drawImage(this.layers[1].bitmap,-n*gx,-n*gy,n,n);c.restore();
   // Repaint the intact fist above the small wrist adjustment.
   const radius=config.handRadius;c.save();c.beginPath();c.arc(n*(gx-.5),n*(gy-.9),n*radius,0,Math.PI*2);c.clip();c.drawImage(this.layers[0].bitmap,-n*.5,-n*.9,n,n);c.restore();
  }else{this.canvas.dataset&&(this.canvas.dataset.weaponStage='inactive');c.drawImage(this.lease.bitmap,-n*.5,-n*.9,n,n);}
  if(p.flash){c.globalCompositeOperation='source-atop';c.globalAlpha=p.flash;c.fillStyle='#fff';c.fillRect(-n*.5,-n*.9,n,n);}
  c.restore();
  return this.canvas;
 }
 dispose(){if(this.closed)return;this.closed=true;this.weaponAbort?.abort();this.signal?.removeEventListener('abort',this.abort);this.lease?.release();this.lease=null;for(const part of this.layers)part.release();this.layers=[];this.weaponReady=false;this.canvas.width=this.canvas.height=1;}
}
