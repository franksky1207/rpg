// Shared visual adapter, no battle state or owned timers. Formal activation is separate.
import {pose} from './equipment-sprites-v1/animation.mjs?v=20261019-batch12-rising-cut1';
import {findAsset,palettes,findMapping} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
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

// One measured player-height target for formal combat and GM; identity ratios remain unchanged.
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
// Measured on main 9f9f1668 through three native special encounters, 390x844.
// Upper observed comfortable reference: 146.19596354px / 544.953125px compact combat frame.
// The complete measurement and selection rationale live in the Batch19-1 report.
export const PLAYER_FRAME_HEIGHT=0.2682725482887481;
const measuredPlayerMotion={"era-galaxy":{"l":0.203125,"t":0.041666666666666664,"r":0.9479166666666666,"b":0.9166666666666666},"era-universe":{"l":0.203125,"t":0.041666666666666664,"r":0.9427083333333334,"b":0.9166666666666666},"era-higher":{"l":0.21354166666666666,"t":0.041666666666666664,"r":0.984375,"b":0.9166666666666666}};
const motionFootprints=new WeakMap();
export function motionFootprint(actor,{remeasure=false}={}){
 // Immutable approved art was measured in a real browser before release. Avoid
 // rescanning six actions while a short live owner phase is already running.
 const player=actor.canvas.width===192&&measuredPlayerMotion[actor.entry.id];
 if(!remeasure&&player)return actor.mirrored?{...player,l:1-player.r,r:1-player.l}:player;
 const monster=actor.canvas.width===256&&measuredMonsterProfiles[actor.entry.assetId];
 if(!remeasure&&monster)return monster.motion;
 const key=actor.entry,tier=actor.canvas.width+':'+!!actor.mirrored;
 if(!remeasure&&motionFootprints.get(key)?.has(tier))return motionFootprints.get(key).get(tier);
 const c=actor.canvas,n=c.width;let l=n,t=n,r=-1,b=-1;
 for(const clip of ['idle','attack','hit','dodge','return','defeat'])for(let ms=0;ms<=700;ms+=35){
  actor.draw({clip,elapsedMs:ms,attackElapsedMs:ms,rootMotion:true});
  const data=c.getContext('2d').getImageData(0,0,n,n).data;
  for(let i=3;i<data.length;i+=4)if(data[i]>16){const x=(i-3)/4%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
 }
 actor.draw({clip:'idle',elapsedMs:0});
 const result={l:l/n,t:t/n,r:(r+1)/n,b:(b+1)/n};
 if(!motionFootprints.has(key))motionFootprints.set(key,new Map());motionFootprints.get(key).set(tier,result);return result;
}
// Only the animation stage, names and HP belong to this sizing frame.
// Resource/EXP rows, enemy descriptions, navigation and surrounding panels do not.
export function combatSizingFrame(host){
 const stageHeight=host.clientHeight,screen=host.closest?.('.combat-screen');
 if(!screen)return stageHeight;
 const cards=[...screen.querySelectorAll('.combatant')];
 const outer=e=>{if(!e)return 0;const c=getComputedStyle(e);return e.getBoundingClientRect().height+parseFloat(c.marginTop)+parseFloat(c.marginBottom);};
 const hud=cards.map(e=>{const c=getComputedStyle(e);return outer(e.querySelector('h2'))+outer(e.querySelector('.big-hp'))+parseFloat(c.paddingTop)+parseFloat(c.paddingBottom)+parseFloat(c.borderTopWidth)+parseFloat(c.borderBottomWidth);});
 const stacked=cards.length===2&&Math.abs(cards[0].getBoundingClientRect().left-cards[1].getBoundingClientRect().left)<Math.min(...cards.map(e=>e.getBoundingClientRect().width))/2;
 return stageHeight+(stacked?hud.reduce((a,b)=>a+b,0):Math.max(0,...hud));
}
// Actual 256px Alpha measurements for all 39 unchanged approved prototypes.
// Generated by batch19-1/measure-prototypes.cjs; shared with failed-load outlines.
export const monsterProfileSourceSHA='71e7e29cac9401a3813bd0bc988eac5ab4431fd9c700132fbcba82178153d0de';
export const measuredMonsterProfiles={
"hm-01":{"idle":{"minH":0.625,"maxH":0.6328125,"l":0.296875,"t":0.171875,"r":0.7109375,"b":0.8046875,"w":0.4140625,"h":0.6328125},"motion":{"l":0.203125,"t":0.15625,"r":0.8203125,"b":0.8046875}},
"mech-02":{"idle":{"minH":0.64453125,"maxH":0.65625,"l":0.1640625,"t":0.17578125,"r":0.8359375,"b":0.82421875,"w":0.671875,"h":0.6484375},"motion":{"l":0.06640625,"t":0.1640625,"r":0.9453125,"b":0.828125}},
"ship-01":{"idle":{"minH":0.38671875,"maxH":0.39453125,"l":0.16796875,"t":0.3125,"r":0.8359375,"b":0.703125,"w":0.66796875,"h":0.390625},"motion":{"l":0.06640625,"t":0.296875,"r":0.9375,"b":0.70703125}},
"beast-03":{"idle":{"minH":0.62890625,"maxH":0.63671875,"l":0.1640625,"t":0.17578125,"r":0.8359375,"b":0.80859375,"w":0.671875,"h":0.6328125},"motion":{"l":0.05078125,"t":0.140625,"r":0.93359375,"b":0.80859375}},
"core-01":{"idle":{"minH":0.6640625,"maxH":0.67578125,"l":0.17578125,"t":0.1640625,"r":0.828125,"b":0.8359375,"w":0.65234375,"h":0.671875},"motion":{"l":0.0703125,"t":0.1484375,"r":0.9296875,"b":0.8359375}},
"bio-02":{"idle":{"minH":0.4375,"maxH":0.44921875,"l":0.1640625,"t":0.27734375,"r":0.83984375,"b":0.72265625,"w":0.67578125,"h":0.4453125},"motion":{"l":0.05859375,"t":0.26171875,"r":0.94140625,"b":0.7265625}},
"hm-02":{"idle":{"minH":0.66796875,"maxH":0.6796875,"l":0.25390625,"t":0.1640625,"r":0.7734375,"b":0.8359375,"w":0.51953125,"h":0.671875},"motion":{"l":0.16015625,"t":0.1484375,"r":0.8828125,"b":0.8359375}},
"hm-04":{"idle":{"minH":0.66796875,"maxH":0.6796875,"l":0.1640625,"t":0.1640625,"r":0.8359375,"b":0.8359375,"w":0.671875,"h":0.671875},"motion":{"l":0.07421875,"t":0.1484375,"r":0.94140625,"b":0.84375}},
"cmd-01":{"idle":{"minH":0.58203125,"maxH":0.59375,"l":0.171875,"t":0.20703125,"r":0.8359375,"b":0.796875,"w":0.6640625,"h":0.58984375},"motion":{"l":0.08203125,"t":0.19921875,"r":0.94140625,"b":0.796875}},
"dr-02":{"idle":{"minH":0.44140625,"maxH":0.44921875,"l":0.1640625,"t":0.27734375,"r":0.83984375,"b":0.72265625,"w":0.67578125,"h":0.4453125},"motion":{"l":0.0625,"t":0.24609375,"r":0.9375,"b":0.73046875}},
"mech-01":{"idle":{"minH":0.6171875,"maxH":0.62890625,"l":0.16015625,"t":0.1875,"r":0.83984375,"b":0.8125,"w":0.6796875,"h":0.625},"motion":{"l":0.0625,"t":0.171875,"r":0.94140625,"b":0.81640625}},
"mech-03":{"idle":{"minH":0.67578125,"maxH":0.6875,"l":0.16015625,"t":0.16015625,"r":0.83984375,"b":0.83984375,"w":0.6796875,"h":0.6796875},"motion":{"l":0.06640625,"t":0.13671875,"r":0.9375,"b":0.84375}},
"veh-02":{"idle":{"minH":0.58984375,"maxH":0.6015625,"l":0.1640625,"t":0.203125,"r":0.83984375,"b":0.796875,"w":0.67578125,"h":0.59375},"motion":{"l":0.07421875,"t":0.1640625,"r":0.9453125,"b":0.796875}},
"ship-04":{"idle":{"minH":0.46875,"maxH":0.4765625,"l":0.1640625,"t":0.25,"r":0.8359375,"b":0.72265625,"w":0.671875,"h":0.47265625},"motion":{"l":0.0625,"t":0.234375,"r":0.9375,"b":0.72265625}},
"fort-01":{"idle":{"minH":0.61328125,"maxH":0.625,"l":0.1640625,"t":0.19140625,"r":0.83984375,"b":0.8125,"w":0.67578125,"h":0.62109375},"motion":{"l":0.0625,"t":0.17578125,"r":0.94140625,"b":0.8125}},
"fort-03":{"idle":{"minH":0.6171875,"maxH":0.62890625,"l":0.1640625,"t":0.19140625,"r":0.83984375,"b":0.8125,"w":0.67578125,"h":0.62109375},"motion":{"l":0.06640625,"t":0.17578125,"r":0.94140625,"b":0.8125}},
"cmd-03":{"idle":{"minH":0.66796875,"maxH":0.6796875,"l":0.16015625,"t":0.16015625,"r":0.83984375,"b":0.8359375,"w":0.6796875,"h":0.67578125},"motion":{"l":0.04296875,"t":0.1484375,"r":0.9453125,"b":0.83984375}},
"beast-01":{"idle":{"minH":0.3828125,"maxH":0.390625,"l":0.1640625,"t":0.32421875,"r":0.83984375,"b":0.7109375,"w":0.67578125,"h":0.38671875},"motion":{"l":0.05078125,"t":0.2890625,"r":0.9375,"b":0.72265625}},
"core-03":{"idle":{"minH":0.65625,"maxH":0.66796875,"l":0.1640625,"t":0.16796875,"r":0.83984375,"b":0.83203125,"w":0.67578125,"h":0.6640625},"motion":{"l":0.06640625,"t":0.15234375,"r":0.9375,"b":0.83203125}},
"energy-01":{"idle":{"minH":0.45703125,"maxH":0.46875,"l":0.1796875,"t":0.265625,"r":0.83984375,"b":0.73046875,"w":0.66015625,"h":0.46484375},"motion":{"l":0.0703125,"t":0.25390625,"r":0.94140625,"b":0.734375}},
"void-phantom-v01":{"idle":{"minH":0.67578125,"maxH":0.6875,"l":0.21484375,"t":0.16015625,"r":0.78515625,"b":0.83984375,"w":0.5703125,"h":0.6796875},"motion":{"l":0.078125,"t":0.140625,"r":0.88671875,"b":0.83984375}},
"boss-c-03-v01":{"idle":{"minH":0.67578125,"maxH":0.6875,"l":0.16015625,"t":0.16015625,"r":0.83984375,"b":0.83984375,"w":0.6796875,"h":0.6796875},"motion":{"l":0.05859375,"t":0.1484375,"r":0.9375,"b":0.83984375}},
"boss-c-02-v01":{"idle":{"minH":0.65234375,"maxH":0.6640625,"l":0.16015625,"t":0.171875,"r":0.83984375,"b":0.828125,"w":0.6796875,"h":0.65625},"motion":{"l":0.0703125,"t":0.15234375,"r":0.94140625,"b":0.8359375}},
"boss-u-01-v01":{"idle":{"minH":0.58984375,"maxH":0.59765625,"l":0.16015625,"t":0.203125,"r":0.83984375,"b":0.796875,"w":0.6796875,"h":0.59375},"motion":{"l":0.05859375,"t":0.19140625,"r":0.94140625,"b":0.796875}},
"boss-c-01-v01":{"idle":{"minH":0.640625,"maxH":0.65234375,"l":0.16015625,"t":0.17578125,"r":0.83984375,"b":0.82421875,"w":0.6796875,"h":0.6484375},"motion":{"l":0.05859375,"t":0.1640625,"r":0.94140625,"b":0.82421875}},
"boss-h-01-v01":{"idle":{"minH":0.671875,"maxH":0.68359375,"l":0.16015625,"t":0.16015625,"r":0.83984375,"b":0.8359375,"w":0.6796875,"h":0.67578125},"motion":{"l":0.0546875,"t":0.1484375,"r":0.9375,"b":0.8359375}},
"boss-h-02-v01":{"idle":{"minH":0.67578125,"maxH":0.6875,"l":0.1640625,"t":0.16015625,"r":0.8359375,"b":0.83984375,"w":0.671875,"h":0.6796875},"motion":{"l":0.0625,"t":0.140625,"r":0.94140625,"b":0.859375}},
"boss-h-03-v01":{"idle":{"minH":0.6640625,"maxH":0.67578125,"l":0.16015625,"t":0.1640625,"r":0.83984375,"b":0.8359375,"w":0.6796875,"h":0.671875},"motion":{"l":0.05859375,"t":0.15234375,"r":0.9453125,"b":0.8359375}},
"boss-h-10-v01":{"idle":{"minH":0.671875,"maxH":0.68359375,"l":0.16015625,"t":0.16015625,"r":0.83984375,"b":0.83984375,"w":0.6796875,"h":0.6796875},"motion":{"l":0.06640625,"t":0.14453125,"r":0.9375,"b":0.83984375}},
"boss-h-06-v01":{"idle":{"minH":0.66796875,"maxH":0.6796875,"l":0.1640625,"t":0.1640625,"r":0.83984375,"b":0.8359375,"w":0.67578125,"h":0.671875},"motion":{"l":0.078125,"t":0.1484375,"r":0.94140625,"b":0.83984375}},
"boss-h-07-v01":{"idle":{"minH":0.6640625,"maxH":0.67578125,"l":0.16015625,"t":0.1640625,"r":0.83984375,"b":0.8359375,"w":0.6796875,"h":0.671875},"motion":{"l":0.06640625,"t":0.13671875,"r":0.94140625,"b":0.84765625}},
"boss-h-05-v01":{"idle":{"minH":0.67578125,"maxH":0.68359375,"l":0.16015625,"t":0.16015625,"r":0.83984375,"b":0.83984375,"w":0.6796875,"h":0.6796875},"motion":{"l":0.0703125,"t":0.1484375,"r":0.94140625,"b":0.84375}},
"boss-h-08-v01":{"idle":{"minH":0.67578125,"maxH":0.6875,"l":0.1640625,"t":0.16015625,"r":0.8359375,"b":0.83984375,"w":0.671875,"h":0.6796875},"motion":{"l":0.0546875,"t":0.125,"r":0.94140625,"b":0.8515625}},
"boss-au-01-v01":{"idle":{"minH":0.66796875,"maxH":0.6796875,"l":0.1953125,"t":0.16015625,"r":0.8125,"b":0.8359375,"w":0.6171875,"h":0.67578125},"motion":{"l":0.11328125,"t":0.14453125,"r":0.91796875,"b":0.8359375}},
"boss-au-02-v01":{"idle":{"minH":0.6640625,"maxH":0.67578125,"l":0.16796875,"t":0.1640625,"r":0.8359375,"b":0.8359375,"w":0.66796875,"h":0.671875},"motion":{"l":0.0625,"t":0.140625,"r":0.9375,"b":0.8359375}},
"boss-au-03-v01":{"idle":{"minH":0.5234375,"maxH":0.53515625,"l":0.17578125,"t":0.234375,"r":0.8359375,"b":0.76171875,"w":0.66015625,"h":0.52734375},"motion":{"l":0.078125,"t":0.19921875,"r":0.94140625,"b":0.7734375}},
"boss-au-04-v01":{"idle":{"minH":0.65625,"maxH":0.66796875,"l":0.171875,"t":0.16796875,"r":0.83984375,"b":0.83203125,"w":0.66796875,"h":0.6640625},"motion":{"l":0.078125,"t":0.1484375,"r":0.93359375,"b":0.83203125}},
"boss-au-05-v01":{"idle":{"minH":0.58984375,"maxH":0.6015625,"l":0.1640625,"t":0.19921875,"r":0.83984375,"b":0.79296875,"w":0.67578125,"h":0.59375},"motion":{"l":0.046875,"t":0.16015625,"r":0.94140625,"b":0.79296875}},
"boss-au-06-v01":{"idle":{"minH":0.66796875,"maxH":0.67578125,"l":0.16796875,"t":0.1640625,"r":0.8359375,"b":0.8359375,"w":0.66796875,"h":0.671875},"motion":{"l":0.078125,"t":0.13671875,"r":0.9375,"b":0.84375}}
};
function monsterSlot(profiles){
 const slot={l:Infinity,r:-Infinity,ml:Infinity,mr:-Infinity,mt:Infinity,mb:-Infinity};
 for(const {idle:p,motion:a} of profiles){const cx=(p.l+p.r)/2,cy=(p.t+p.b)/2;
  slot.l=Math.min(slot.l,(p.l-cx)/p.h);slot.r=Math.max(slot.r,(p.r-cx)/p.h);
  slot.ml=Math.min(slot.ml,(a.l-cx)/p.h);slot.mr=Math.max(slot.mr,(a.r-cx)/p.h);
  slot.mt=Math.min(slot.mt,(a.t-cy)/p.h);slot.mb=Math.max(slot.mb,(a.b-cy)/p.h);
 }
 return slot;
}
export function battleSpriteLayout(player,monster,width,height,visual={}){
 const p=visibleFootprint(player),rawM=visibleFootprint(monster),profile=measuredMonsterProfiles[monster.sizingAssetId||monster.entry.assetId];
 const m=monster.isFallback&&profile?profile.idle:rawM;
 let ratio=Math.max(.9*p.maxH/p.h*m.h/m.minH,Math.min(2.3,(kindScale[monster.sizingAssetId||monster.entry.assetId]||1)*(Number(visual.scale)||1)));
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
 // Fit the measured six-action painted envelopes, never the transparent square
 // Canvas borders. Reserve the existing approach gap for both actors in every mode.
 const ps=1/p.h,ms=ratio/rawM.h,pa=motionFootprint(player);
 const slot=monsterSlot([profile,visual.fallbackProfile,{idle:rawM,motion:motionFootprint(monster)}].filter(Boolean));
 const boundedApproach=visual.sizePolicy==='boss'||visual.sizePolicy==='dungeon'||monster.mapping?.kind==='special',gap=boundedApproach?.65:.22;
 const ox=(visual.offsetX||0)/512,oy=(visual.offsetY||0)/512;
 const px=-p.r*ps-(boundedApproach?gap/2:0);
 let mc=-slot.l*ratio+(boundedApproach?gap/2:0)+ox;
 const motionGap=mc+slot.ml*ratio-(px+pa.r*ps);
 if(boundedApproach&&motionGap<.04)mc+=.04-motionGap;
 const mx=mc-(rawM.l+rawM.r)/2*ms;
 const safeGap=mc+slot.ml*ratio-(px+pa.r*ps);
 const py=-(p.t+p.b)/2*ps,my=-(rawM.t+rawM.b)/2*ms+oy;
 const left=px+pa.l*ps,right=mc+slot.mr*ratio;
 const top=Math.min(py+pa.t*ps,slot.mt*ratio+oy),bottom=Math.max(py+pa.b*ps,slot.mb*ratio+oy);
 const frameHeight=Number(visual.frameHeight)||height;
 const target=frameHeight*PLAYER_FRAME_HEIGHT;
 const movementPadding=boundedApproach?0:58.8;
 const widthLimit=Math.max(1,width-8-movementPadding)/(right-left),heightLimit=Math.max(1,height-8)/(bottom-top);
 const scale=Math.min(target,widthLimit,heightLimit);
 const x=(width-(right-left)*scale)/2-left*scale,y=(height-(bottom-top)*scale)/2-top*scale;
 const box=(a,b,size)=>({x:x+a*scale,y:y+b*scale,size:size*scale});
 return {player:box(px-movementPadding/2/scale,py,ps),monster:box(mx+movementPadding/2/scale,my,ms),ratio,
  approachLimit:boundedApproach?safeGap*.15*scale:58.8,
  targetPlayerHeight:target,playerHeight:scale,safetyRetreat:scale<target?(widthLimit<heightLimit?'animation-width':'animation-height'):null};
}
export function applyBattleSpriteLayout(player,monster,width,height,visual={}){
 const layout=battleSpriteLayout(player,monster,width,height,visual);
 for(const [actor,key] of [[player,'player'],[monster,'monster']]){
  const b=layout[key],s=actor.canvas.style;
  Object.assign(s,{position:'absolute',left:b.x+'px',top:b.y+'px',width:b.size+'px',height:b.size+'px',maxWidth:'none',right:'auto'});
 }
 monster.canvas.dataset.actualRatio=String(layout.ratio);
 player.canvas.dataset.targetHeight=String(layout.targetPlayerHeight);
 player.canvas.dataset.paintedHeight=String(layout.playerHeight);
 player.canvas.dataset.safetyRetreat=layout.safetyRetreat||'';
 return layout;
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
