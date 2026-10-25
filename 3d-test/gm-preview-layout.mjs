// GM-only fit. Formal placement/ratios remain owned by the existing adapter.
import {battleSpriteLayout,visibleFootprint,motionFootprint,monsterPose} from './monster-actor.mjs?v=20261024-approved1';
const envelopes=new WeakMap();
function bounds(actor){
 if(envelopes.has(actor))return envelopes.get(actor);
 let result;
 if(!actor.mapping){
  // Approved player motion profiles include the articulated weapon and all six actions.
  result=actor.mirrored?{l:0,t:0,r:1,b:1}:motionFootprint({entry:actor.entry,canvas:{width:192},mirrored:false});
 }else{
  // Read the prepared appearance once, including its static fields. No frame scans.
  const source=actor.appearanceSource,ctx=source.getContext('2d'),n=source.width,d=ctx.getImageData(0,0,n,n).data;
  let l=n,t=n,r=0,b=0;
  for(let i=3;i<d.length;i+=4)if(d[i]>=12){const x=((i-3)/4)%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}
  const [al,at,ar,ab]=actor.entry.visualBounds,k=Math.min(.68/(ar-al),.68/(ab-at))*512;
  const x1=(l/n-(al+ar)/1024)*k,x2=(r/n-(al+ar)/1024)*k;
  const y1=(t/n-(at+ab)/1024)*k,y2=(b/n-(at+ab)/1024)*k;
  const pad=actor.padding/actor.canvas.width,f=actor.logicalSize/actor.canvas.width;
  result={l:Infinity,t:Infinity,r:-Infinity,b:-Infinity};
  // Geometry sampling only; no decoding or pixel scans per pose.
  for(const clip of ['idle','attack','hit','dodge','return','defeat'])for(let ms=0;ms<=700;ms+=14){
   const p=monsterPose(actor.entry.animationType,clip,ms),c=Math.cos(p.rotation),s=Math.sin(p.rotation);
   for(const x of [x1,x2])for(const y of [y1,y2]){
    const xx=pad+f*(.5+p.x+x*p.scaleX*c-y*p.scaleY*s),yy=pad+f*(.5+p.y+x*p.scaleX*s+y*p.scaleY*c);
    result.l=Math.min(result.l,xx);result.r=Math.max(result.r,xx);result.t=Math.min(result.t,yy);result.b=Math.max(result.b,yy);
   }
  }
  // Include native projectile and breath extrema, plus subpixel/filter safety.
  result.l=Math.min(result.l,pad+f*.07);result.r=Math.max(result.r,pad+f*.25);
  for(const key of ['l','t'])result[key]-=.012;
  for(const key of ['r','b'])result[key]+=.012;
 }
 envelopes.set(actor,result);return result;
}
export function fitPreview(player,monster,width,height,mode,visual={}){
 const p=visibleFootprint(player),ratio=monster?battleSpriteLayout(player,monster,1000,1000,visual).ratio:1;
 const actors=[];
 if(mode!=='monster')actors.push({actor:player,body:p,motion:bounds(player),size:1/p.h});
 if(mode!=='player'&&monster){const m=visibleFootprint(monster);actors.push({actor:monster,body:m,motion:bounds(monster),size:ratio/m.h});}
 let edge=0;
 for(const a of actors){a.x=edge-a.body.l*a.size;a.y=-(a.body.t+a.body.b)/2*a.size;edge=a.x+a.body.r*a.size+.035;}
 const left=Math.min(...actors.map(a=>a.x+a.motion.l*a.size)),right=Math.max(...actors.map(a=>a.x+a.motion.r*a.size));
 const top=Math.min(...actors.map(a=>a.y+a.motion.t*a.size)),bottom=Math.max(...actors.map(a=>a.y+a.motion.b*a.size));
 const safety=10,scale=Math.min(Math.max(1,width-2*safety)/(right-left),Math.max(1,height-2*safety)/(bottom-top));
 const ox=(width-(right-left)*scale)/2-left*scale,oy=(height-(bottom-top)*scale)/2-top*scale;
 for(const a of actors)Object.assign(a.actor.canvas.style,{position:'absolute',left:ox+a.x*scale+'px',top:oy+a.y*scale+'px',width:a.size*scale+'px',height:a.size*scale+'px',maxWidth:'none',transform:'none',margin:'0',visibility:'visible'});
 if(mode==='monster')player.canvas.style.visibility='hidden';
 return {ratio,scale,stage:{width,height},union:{left:ox+left*scale,right:ox+right*scale,top:oy+top*scale,bottom:oy+bottom*scale},actors:actors.map(a=>({role:a.actor===player?'player':'monster',motion:a.motion,size:a.size*scale}))};
}
