import {appearanceDesigns} from './monster-appearance-designs.mjs?v=20261024-identity-v1';
// Formal presentation owner. Pure, immutable specifications; no gameplay state or randomness.
import {mappings} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
export const APPEARANCE_VERSION='20261024-identity-v1';
// Twelve deliberately separated body families; eight contrasting accent families.
const bodies=['#db503e','#dc982c','#bbc43b','#43b95e','#28b69c','#349bc9','#4c67d5','#9354cf','#cb4fa6','#d3cba9','#738b99','#9a6446'];
const accents=['#b5f4ed','#ffce67','#ed9dd6','#929fff','#d8f18b','#f5f1e3','#55d1ee','#ff846c'];
const rims=['#effcff','#ffe5a0','#f4b9ff','#b2f9c5','#99caff','#ffad9e'];
const mod=(n,d)=>((n%d)+d)%d;
function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
const groups=new Map();
for(const r of Object.values(mappings)){
 if(r.mode==='alternate'&&r.stageIndex!==0)continue;
 const list=groups.get(r.assetId)||[];list.push(r);groups.set(r.assetId,list);
}
const ordinals=new Map();
for(const rows of groups.values())rows.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0).forEach((r,i)=>ordinals.set(r.id,i));
function strength(r){
 if(r.mode==='alternate')return {rank:7,layer:5+Number(r.visual.appearanceTier>=7),progress:r.visual.appearanceTier};
 if(r.world==='higher')return {rank:6,layer:4+Number(r.bossIndex>=6),progress:r.bossIndex+1};
 if(r.mode==='calamity')return {rank:r.world==='universe'?5:4,layer:r.world==='universe'?4:3,progress:r.bossIndex+1};
 if(['bounty','arena','void'].includes(r.mode))return {rank:3,layer:2+Number(r.world==='universe')+Number(r.bountyTier==='danger'||r.arenaStage===2||r.isBossFloor===true),progress:r.arenaStage??r.bossCycle??Number(r.id.match(/\d+$/)?.[0])};
 if(r.kind==='special')return {rank:2,layer:2,progress:0};
 return {rank:1,layer:r.world==='universe'?2+Number(Number(r.id.slice(-3))>=91):r.kind==='boss'?2:r.kind==='elite'?1:0,progress:r.world==='universe'?Number(r.id.slice(-3)):(r.region-1)*10+r.mapIndex};
}
function freeze(o){Object.values(o).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(o);}
export function resolveMonsterAppearance(input,{designIndex}={}){
 const id=typeof input==='string'?input:input?.id;
 const r=mappings[id?.replace(/^projection-/,'')]||input;
 if(!r?.assetId||!r.visual)throw Error('appearance-identity-required');
 // AU universe, not stage, owns appearance; arena projections resolve the original king.
 const canonical=r.mode==='alternate'?mappings['alternate-depth-'+String((r.universeNumber-1)*5+1).padStart(4,'0')]:r;
 const n=designIndex??appearanceDesigns[canonical.id]??ordinals.get(canonical.id);if(n===undefined)throw Error('appearance-unregistered-identity');
 const seed=hash(r.assetId),s=strength(canonical),au=r.mode==='alternate',version=Number(r.visual.appearanceTier)||0;
 // Coprime strides separate adjacent same-prototype identities. No region palette reset.
 const body=mod(n*5+seed,12),accent=mod(Math.floor(n/12)*3+n+Math.floor(seed/12),8);
 const split=mod(Math.floor(n/12)+Math.floor(seed/19),8);
 const texture=mod(n*3+Math.floor(seed/31),10);
 const field=mod(Math.floor(n/10)+n*7+Math.floor(seed/71),8);
 const spec={version:APPEARANCE_VERSION,assetId:r.assetId,colors:{body:bodies[body],accent:accents[accent],rim:rims[mod(n+seed,6)]},split,texture,field,
  // Strength changes coverage/line hierarchy, never absolute size or animation.
  rank:s.rank,layer:s.layer,progress:s.progress,ink:au?.58:s.rank>=4?.48:s.rank===3?.34:s.rank===2?.40:.34,
  fieldInk:s.rank>=6?.62:s.rank>=4?.46:s.rank===3?.28:.14,
  culture:au?mod(seed,7):0,variant:au?version:0};
 return freeze(spec);
}
// Only fields actually consumed by paintMonsterAppearance enter the fingerprint.
export function appearanceFingerprint(input){
 const s=input?.colors?input:resolveMonsterAppearance(input);
 return JSON.stringify([s.assetId,s.colors,s.split,s.texture,s.field,s.layer,s.ink,s.fieldInk,s.culture]);
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function accentAt(x,y,split){
 return [x>.58,y>.56,x+y>1.06,x-y>.08,Math.abs(x-.5)<.19,Math.abs(y-.5)<.18,(x<.3||x>.72),((Math.floor(x*4)+Math.floor(y*3))%2===0)][split];
}
// One bounded 512px source per active actor; never stored in the decoded prototype pool.
// Real pixel recoloring gives local two-tone surfaces on Safari without Canvas.filter.
export function paintMonsterAppearance(bitmap,asset,spec,{canvasFactory=()=>document.createElement('canvas')}={}){
 const canvas=canvasFactory();canvas.width=canvas.height=512;const c=canvas.getContext('2d',{willReadFrequently:true});
 c.drawImage(bitmap,0,0);const image=c.getImageData(0,0,512,512),p=image.data;
 const primary=rgb(spec.colors.body),secondary=rgb(spec.colors.accent),rim=rgb(spec.colors.rim),[l,t,r,b]=asset.alphaBounds;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4;if(!p[i+3])continue;
  const xx=(x-l)/(r-l),yy=(y-t)/(b-t),color=accentAt(xx,yy,spec.split)?secondary:primary;
  const lum=(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722)/255;
  const shade=.38+lum*.85,highlight=Math.max(0,(lum-.74)/.26)*.38;
  for(let k=0;k<3;k++)p[i+k]=Math.min(255,color[k]*shade*(1-highlight)+rim[k]*highlight);
 }
 c.putImageData(image,0,0);
 c.save();c.globalCompositeOperation='source-atop';c.translate(l,t);c.scale((r-l)/100,(b-t)/100);
 c.strokeStyle=spec.colors.rim;c.fillStyle=spec.colors.accent;c.lineWidth=1.9;c.globalAlpha=spec.ink;
 const line=(x,y,a,b)=>{c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
 switch(spec.texture){
  case 0:for(let y=18;y<100;y+=20)line(0,y,100,y);break;
  case 1:for(let x=-70;x<100;x+=25)line(x,0,x+100,100);break;
  case 2:for(let x=15;x<100;x+=23)line(x,0,x,100);break;
  case 3:for(let y=10;y<100;y+=24){line(0,y,50,y+18);line(50,y+18,100,y);}break;
  case 4:for(let y=12;y<100;y+=25)for(let x=12;x<100;x+=25)c.fillRect(x,y,7,7);break;
  case 5:for(let x=-80;x<100;x+=30){line(x,0,x+100,100);line(x,100,x+100,0);}break;
  case 6:for(let x=18;x<100;x+=27){line(x,0,x,40);line(x,40,x+14,52);line(x+14,52,x+14,100);}break;
  case 7:for(let y=10;y<100;y+=22){line(0,y,32,y);line(68,y+9,100,y+9);}break;
  case 8:for(let a=14;a<60;a+=16)c.strokeRect(50-a,50-a,2*a,2*a);break;
  case 9:for(let a=18;a<70;a+=18){c.beginPath();c.ellipse(50,50,a,a*.65,0,0,Math.PI*2);c.stroke();}break;
 }
 c.globalAlpha=spec.fieldInk;c.lineWidth=spec.rank>=4?2.5:1.5;c.strokeStyle=spec.colors.accent;
 // Distinct closed fields / fixed glyphs, clipped to body alpha: no new body bounds.
 const sides=3+spec.field;
 for(let level=0;level<Math.max(1,spec.layer);level++){
  const radius=45-level*6,turn=(spec.culture%3)*.21;
  c.beginPath();for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2-Math.PI/2+turn,x=50+Math.cos(a)*radius,y=50+Math.sin(a)*radius;if(j)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();
 }
 if(spec.rank>=4){c.fillStyle=spec.colors.rim;for(let j=0;j<spec.layer;j++){const x=34+j*7;c.fillRect(x,14,3,8);}}
 c.restore();return canvas;
}
// The dynamic mirror keeps its player raster/equipment/alpha exactly intact.
// A single crisp cool edge (no blur) and thin shard frame are presentation only.
export function applyMirrorAppearance(canvas){
 canvas.style.filter='drop-shadow(1px 0 0 #87daed)';
 canvas.style.outline='1px solid #a8dcf060';canvas.style.outlineOffset='-7px';
 canvas.style.clipPath='polygon(0 0,96% 0,100% 7%,100% 92%,96% 100%,4% 100%,0 94%)';
 canvas.dataset.effect='mirror-projection';
}
