// Read-only Canvas prototypes. Shares normalized 700ms/336ms impact contract.
// No runtime imports, no gameplay state, no production registration.
const root=new URL('../../../',import.meta.url),base=new URL('./rendered/',import.meta.url);
const input=await(await fetch(new URL('trial-inputs.json',base))).json();
export const candidates=[
 {id:'wrist-uppercut',label:'Short rising cut / wrist',kind:'wrist',keys:[0,.18,-.72,-.72,0]},
 {id:'wrist-diagonal',label:'Diagonal cut / wrist',kind:'wrist',keys:[0,-1.10,.12,.12,0]},
 {id:'wrist-horizontal',label:'Horizontal cut / wrist',kind:'wrist',keys:[0,-.75,-.75,-.75,0],squash:true},
 {id:'dash-cut',label:'Advancing cut / shoulder',kind:'shoulder',keys:[0,.10,-.60,-.60,0],advance:45},
 {id:'heavy-blow',label:'Short heavy blow / elbow',kind:'elbow',keys:[0,-1.35,-.10,-.10,0]},
 {id:'shoulder-uppercut',label:'Rising cut / shoulder',kind:'shoulder',keys:[0,.12,-.85,-.85,0]},
 {id:'elbow-uppercut',label:'Rising cut / elbow',kind:'elbow',keys:[0,.18,-1.05,-1.05,0]},
 {id:'compact-arm-cut',label:'Compact arm cut + wrist',kind:'elbow',keys:[0,.10,-.48,-.48,0],wrist:-.30},
 {id:'capped-elbow-uppercut',label:'Overlapping elbow plate / rising cut',kind:'elbow',keys:[0,.12,-.88,-.88,0],cap:true},
 {id:'capped-compact-cut',label:'Overlapping elbow plate / compact cut',kind:'elbow',keys:[0,.10,-.58,-.58,0],wrist:-.20,cap:true},
 {id:'whole-image-control',label:'Whole image control (forbidden)',kind:'whole',keys:[0,0,0,0,0],advance:45}
];
const times=[0,196,336,420,560,700],names=['idle/start','windup','attack/impact','contact hold','recover','idle/end'];
function sample(a,ms){const ts=[0,196,336,420,700];let i=0;while(i<3&&ms>ts[i+1])i++;let q=Math.max(0,Math.min(1,(ms-ts[i])/(ts[i+1]-ts[i])));q=q*q*(3-2*q);return a.keys[i]+(a.keys[i+1]-a.keys[i])*q;}
const load=async url=>{const im=new Image();im.src=url;await im.decode();return im;};
const entries=await Promise.all(input.entries.map(async e=>({...e,bodyImage:await load(new URL(e.body,base)),weaponImage:await load(new URL(e.weapon,root)),formalImage:await load(new URL(e.formal,root))})));
function polygon(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function armShape(e,kind){const [sx,sy]=e.shoulder,[gx,gy]=e.grip,[ex,ey]=e.elbow;
 return kind==='shoulder'?[[sx-25,sy-8],[sx+16,sy+8],[ex+19,ey],[gx+22,gy+18],[gx-22,gy+24],[gx-30,gy-25],[ex-25,ey-12]]:[[ex-20,ey-8],[ex+18,ey-5],[gx+21,gy+18],[gx-23,gy+24],[gx-28,gy-24]];
}
export function render(e,a,ms,canvas,size=180){
 canvas.width=canvas.height=512;const c=canvas.getContext('2d'),theta=sample(a,ms),activity=ms<196?ms/196:ms<420?1:Math.max(0,(700-ms)/280),reach=(a.advance||0)*activity;
 c.clearRect(0,0,512,512);c.save();c.translate(reach,-Math.sin(ms/700*Math.PI)*2);
 if(a.kind==='whole'){c.drawImage(e.formalImage,0,0);c.restore();return;}
 let pivot=e.grip,shape;
 if(a.kind!=='wrist'){
  shape=armShape(e,a.kind);pivot=a.kind==='shoulder'?e.shoulder:e.elbow;
  // Remove the moving limb from static body, do not invent hidden armor.
  c.save();c.drawImage(e.bodyImage,0,0);c.globalCompositeOperation='destination-out';polygon(c,shape);c.fill();c.restore();
  c.save();c.translate(...pivot);c.rotate(theta);c.translate(-pivot[0],-pivot[1]);c.save();polygon(c,shape);c.clip();c.drawImage(e.bodyImage,0,0);c.restore();
 }else c.drawImage(e.bodyImage,0,0);
 const [gx,gy]=e.grip,[wgx,wgy]=e.weaponGrip,dx=e.weaponTip[0]-wgx,dy=e.weaponTip[1]-wgy;
 const scale=e.weaponLength/Math.hypot(dx,dy),baseAngle=Math.atan2(dy,dx),desired=.66+(a.kind==='wrist'?theta:(a.wrist||0)*activity);
 c.save();c.translate(gx,gy);c.rotate(desired-baseAngle);c.scale(scale,a.squash?scale*.50:scale);c.drawImage(e.weaponImage,-wgx,-wgy);c.restore();
 // Original body hand drawn above original independent handle; no generated fist.
 c.save();c.beginPath();c.rect(gx-16,gy-17,30,30);c.clip();c.drawImage(e.bodyImage,0,0);c.restore();
 if(a.kind!=='wrist'){c.restore();if(a.cap){c.save();c.beginPath();c.arc(pivot[0],pivot[1],19,0,Math.PI*2);c.clip();c.drawImage(e.bodyImage,0,0);c.restore();}}c.restore();
}
export function scene(e,a,ms,display=180){const canvas=document.createElement('canvas');canvas.width=480;canvas.height=240;const c=canvas.getContext('2d');c.fillStyle='#202c40';c.fillRect(0,0,480,240);const actor=document.createElement('canvas');render(e,a,ms,actor);const x=display===180?100:130,y=210-display;
 // Fixed enemy silhouette at a common 70px base separation. A visible gap is evidence.
 const enemyX=x+display*.80+70;c.fillStyle=ms>=336&&ms<=420?'#c68a94':'#6e7f98';c.fillRect(enemyX,95,40,100);c.fillRect(enemyX+5,65,30,35);c.fillRect(enemyX,190,14,20);c.fillRect(enemyX+26,190,14,20);
 c.drawImage(actor,x,y,display,display);c.fillStyle='#eee';c.font='12px sans-serif';c.fillText(e.era+' / '+a.id,8,16);c.fillText(ms+'ms / '+display+'px',8,32);return canvas;}
window.lab={entries,candidates,render,scene,times,names,ready:true};
for(const e of entries){const h=document.createElement('h2');h.textContent=e.era;document.querySelector('#lab').append(h);for(const a of candidates){const canvas=scene(e,a,336);document.querySelector('#lab').append(canvas);}}
