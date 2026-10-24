/* Review-only static vector engine. Frozen body pixels are INPUT, never painted.
 * No timers, animation loops, gameplay imports, textures, or runtime asset pack.
 * Coordinates are 512px sprite-local; nothing here is a world/ground plane.
 */
(function(root){
'use strict';
const VERSION='static-effects-v1-20261024',TAU=Math.PI*2;
const families={energy:'能量',technology:'科技護盾',mechanical:'機械構造',crystal:'晶體',organic:'生物氣場',stellar:'星際天體',spatial:'空間維度',sovereign:'文明權能'};
const familiesTags={energy:['all'],technology:['machine','humanoid','structure','ship','commander','core'],mechanical:['machine','ship','structure','humanoid','commander','core'],crystal:['core','energy','creature','commander','boss','humanoid'],organic:['creature','organic','void'],stellar:['all'],spatial:['energy','void','core','boss','commander','humanoid'],sovereign:['commander','boss','structure']};
function line(c,points,close=false,fill=false){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();if(fill)c.fill();c.stroke();}
function poly(c,x,y,r,n,turn=0,fill=false){line(c,Array.from({length:n},(_,i)=>[x+Math.cos(i*TAU/n+turn)*r,y+Math.sin(i*TAU/n+turn)*r]),true,fill);}
function ellipse(c,x,y,rx,ry,a=0,start=0,end=TAU){c.beginPath();c.ellipse(x,y,rx,ry,a,start,end);c.stroke();}
function dot(c,x,y,r){c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function star(c,x,y,r){line(c,[[x,y-r],[x+r*.23,y-r*.23],[x+r,y],[x+r*.23,y+r*.23],[x,y+r],[x-r*.23,y+r*.23],[x-r,y],[x-r*.23,y-r*.23]],true,true);}
// Each painter below has distinct geometry; color/size/rotation are NOT library IDs.
const painters={
 contour(c,p){c.save();c.shadowColor=p.color;c.shadowBlur=4+p.level*1.1;c.globalAlpha=.5;c.drawImage(p.body,0,0);c.restore();},
 aura(c,p){const g=c.createRadialGradient(256,256,155,256,256,244);g.addColorStop(0,'transparent');g.addColorStop(.72,p.color);g.addColorStop(1,'transparent');c.globalAlpha*=.35;c.fillStyle=g;c.fillRect(12,12,488,488);},
 lightning(c,p){motifs(c,p,(c,s)=>{line(c,[[-s*.6,s*.8],[-s*.2,s*.18],[-s*.5,0],[s*.3,-s*.8],[s*.1,-s*.15],[s*.55,-s*.25]]);line(c,[[-s*.2,s*.18],[s*.6,s*.5],[s*.8,s*.2]]);});},
 solarRays(c,p){if(p.level===5){rim(c,p,(c,x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);c.globalAlpha*=.45;line(c,[[-3,-32],[0,27],[3,-32]],true,true);c.restore();},8);}rim(c,p,(c,x,y,a,i)=>{c.save();c.translate(x,y);c.rotate(a);const s=p.scale*(i%2?1:.65);line(c,[[0,-s],[0,s]]);line(c,[[-3,-s*.6],[-3,s*.5]]);c.restore();},8+p.density*3);},
 fanSheets(c,p){motifs(c,p,(c,s)=>{for(let k=-1;k<=1;k++){c.globalAlpha=.16;line(c,[[0,s*.7],[k*s*.55-s*.18,-s],[k*s*.55+s*.12,-s]],true,true);}c.globalAlpha=.8;line(c,[[-s*.9,-s],[0,s*.7],[s*.9,-s]]);});},
 lightPillars(c,p){motifs(c,p,(c,s)=>{for(let k=-1;k<=1;k++){const h=s*(k===0?1:.65);c.globalAlpha=k===0?.7:.3;const g=c.createLinearGradient(0,-h,0,h);g.addColorStop(0,'transparent');g.addColorStop(.5,p.color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(k*8-2,-h,4,h*2);} });},
 shieldPanels(c,p){motifs(c,p,(c,s)=>{c.globalAlpha=.2;line(c,[[-s*.7,-s*.65],[s*.7,-s*.65],[s*.55,s*.35],[0,s],[-s*.55,s*.35]],true,true);c.globalAlpha=.85;line(c,[[-s*.7,-s*.65],[s*.7,-s*.65],[s*.55,s*.35],[0,s],[-s*.55,s*.35]],true);line(c,[[-s*.35,-s*.35],[s*.35,-s*.35]]);});},
 hexCells(c,p){motifs(c,p,(c,s)=>{poly(c,0,0,s*.48,6);poly(c,s*.75,0,s*.35,6);poly(c,-s*.75,0,s*.35,6);poly(c,0,s*.72,s*.29,6);});},
 circuitBranches(c,p){motifs(c,p,(c,s)=>{line(c,[[-s,s*.7],[-s*.5,s*.7],[-s*.5,0],[0,-s*.5],[s*.7,-s*.5],[s,-s]]);line(c,[[-s*.5,0],[s*.4,0],[s*.4,s*.7]]);dot(c,s,-s,3);dot(c,s*.4,s*.7,2.5);});},
 scanBrackets(c,p){if(p.level===5)for(const [x,y,tx,ty] of [[65,65,1,1],[447,65,-1,1],[65,447,1,-1],[447,447,-1,-1]])line(c,[[x+tx*50,y],[x,y],[x,y+ty*50]]);for(const [x,y,tx,ty] of [[50,50,1,1],[462,50,-1,1],[50,462,1,-1],[462,462,-1,-1]])line(c,[[x+tx*p.scale,y],[x,y],[x,y+ty*p.scale]]);},
 shutterBars(c,p){motifs(c,p,(c,s)=>{for(let k=-2;k<=2;k++)line(c,[[-s*(.5+.1*(k+2)),k*7],[s*(.5+.1*(k+2)),k*7]]);});},
 railFrame(c,p){if(p.level===5){line(c,[[26,330],[26,410],[102,486],[182,486]]);line(c,[[486,182],[486,102],[410,26],[330,26]]);}const inset=25+p.variant*3;line(c,[[inset,160],[inset,86],[90,inset],[175,inset]]);line(c,[[512-inset,352],[512-inset,426],[422,512-inset],[337,512-inset]]);for(let i=0;i<4;i++){dot(c,inset+5+i*8,145,2);dot(c,512-inset-5-i*8,367,2);}},
 orbitalDrones(c,p){motifs(c,p,(c,s)=>{poly(c,0,0,s*.34,4,Math.PI/4,true);line(c,[[-s,-s*.25],[-s*.4,-s*.25],[-s*.4,s*.25],[-s,s*.25]],true);line(c,[[s,-s*.25],[s*.4,-s*.25],[s*.4,s*.25],[s,s*.25]],true);dot(c,0,0,3);});},
 floatingPlates(c,p){motifs(c,p,(c,s)=>{for(let k=-1;k<=1;k++){const x=k*s*.6;line(c,[[x-s*.22,-s*.7],[x+s*.22,-s*.5],[x+s*.22,s*.7],[x-s*.22,s*.5]],true,k===0);}});},
 satelliteArms(c,p){motifs(c,p,(c,s)=>{ellipse(c,0,0,s*.3,s*.3);for(const a of [0,TAU/3,TAU*2/3]){const x=Math.cos(a)*s*.8,y=Math.sin(a)*s*.8;line(c,[[0,0],[x*.6,y*.6],[x,y]]);poly(c,x,y,s*.22,4,Math.PI/4);}});},
 segmentedCage(c,p){for(const a of Array.from({length:p.level===5?8:4},(_,i)=>i*TAU/(p.level===5?8:4))){const x=256+Math.cos(a)*205,y=256+Math.sin(a)*205;c.save();c.translate(x,y);c.rotate(a);line(c,[[0,-40],[18,-25],[18,25],[0,40]]);for(let k=-1;k<=1;k++)line(c,[[23,k*15],[32,k*15]]);c.restore();}},
 antennaArray(c,p){motifs(c,p,(c,s)=>{line(c,[[-s*.8,s*.7],[s*.8,s*.7]]);for(let k=-1;k<=1;k++){const x=k*s*.6,h=k?-.4*s:-s;line(c,[[x,s*.7],[x,h]]);poly(c,x,h,4,4);} });},
 reactorClamps(c,p){motifs(c,p,(c,s)=>{line(c,[[-s,-s*.7],[-s*.35,-s*.7],[-s*.35,-s*.35],[-s*.7,-s*.35],[-s*.7,s*.35],[-s*.35,s*.35],[-s*.35,s*.7],[-s,s*.7]]);line(c,[[s,-s*.7],[s*.35,-s*.7],[s*.35,s*.7],[s,s*.7]]);});},
 diamonds(c,p){motifs(c,p,(c,s)=>{line(c,[[0,-s],[s*.5,0],[0,s],[-s*.5,0]],true);line(c,[[0,-s],[0,s]]);line(c,[[-s*.5,0],[0,s*.25],[s*.5,0]]);});},
 crystalCluster(c,p){motifs(c,p,(c,s)=>{for(const [x,h] of [[-s*.48,.65],[0,1],[s*.48,.7]]){line(c,[[x,s*.75],[x-s*.25,-s*h*.5],[x,-s*h],[x+s*.25,-s*h*.5]],true);line(c,[[x,-s*h],[x,s*.75]]);}});},
 needleSpikes(c,p){rim(c,p,(c,x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);const s=p.scale;line(c,[[0,-s],[-s*.15,s*.8],[s*.15,s*.8]],true,true);c.restore();},6+p.density*2);},
 crystalGuard(c,p){motifs(c,p,(c,s)=>{line(c,[[0,-s],[s*.7,-s*.3],[s*.45,s*.7],[0,s],[-s*.45,s*.7],[-s*.7,-s*.3]],true);line(c,[[-s*.7,-s*.3],[0,0],[s*.7,-s*.3]]);line(c,[[0,-s],[0,s]]);});},
 prismFans(c,p){motifs(c,p,(c,s)=>{for(let k=-1;k<=1;k++){line(c,[[0,s*.8],[k*s*.7-s*.22,-s*.7],[k*s*.7+s*.22,-s*.7]],true);line(c,[[0,s*.8],[k*s*.7,-s*.7]]);}});},
 shards(c,p){motifs(c,p,(c,s)=>{line(c,[[-s,-s*.6],[-s*.3,-s],[0,-s*.25]],true,true);line(c,[[s*.2,-s*.3],[s,s*.1],[s*.5,s*.6]],true);line(c,[[-s*.5,s*.1],[-s*.7,s],[s*.1,s*.6]],true);});},
 sporeCloud(c,p){motifs(c,p,(c,s)=>{for(let i=0;i<7+p.density*3;i++){const a=i*2.4,r=s*(.25+.7*(i%4)/3);c.globalAlpha=.3+(i%3)*.2;ellipse(c,Math.cos(a)*r,Math.sin(a)*r,2+i%3,2+i%3);}});},
 tendrils(c,p){motifs(c,p,(c,s)=>{for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(k*s*.2,s);c.bezierCurveTo(-s,s*.1,s,-s*.3,k*s*.65,-s);c.stroke();dot(c,k*s*.65,-s,2);}});},
 petalBlades(c,p){motifs(c,p,(c,s)=>{for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-s*.5,-s*.8,0,-s);c.quadraticCurveTo(s*.2,-s*.6,0,0);c.stroke();c.restore();}});},
 membraneLobes(c,p){motifs(c,p,(c,s)=>{c.beginPath();c.moveTo(0,-s);c.bezierCurveTo(s*1.2,-s*.9,s*1.2,s*.7,0,s);c.bezierCurveTo(-s*.9,s*.7,-s*.9,-s*.5,0,-s);c.stroke();for(let k=-1;k<=1;k++)line(c,[[0,-s*.7],[k*s*.6,s*.3],[0,s*.8]]);});},
 rootArcs(c,p){motifs(c,p,(c,s)=>{for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(0,s*.8);c.quadraticCurveTo(k*s*.8,s*.1,k*s*.9,-s*.8);c.stroke();line(c,[[k*s*.65,-s*.1],[k*s*.85,-s*.1-s*.3]]);}});},
 pollenSprays(c,p){motifs(c,p,(c,s)=>{for(let i=0;i<5;i++){const a=-Math.PI+i*Math.PI/4;const x=Math.cos(a)*s,y=Math.sin(a)*s;line(c,[[0,s*.5],[x*.6,y*.7]]);dot(c,x,y,2+i%2);dot(c,x*.8,y+6,1.5);}});},
 stars(c,p){motifs(c,p,(c,s)=>{star(c,0,0,s*.6);star(c,s*.8,-s*.7,s*.18);star(c,-s*.7,s*.6,s*.25);});},
 constellation(c,p){motifs(c,p,(c,s)=>{const ps=[[-s,-s*.6],[-s*.1,-s],[s*.8,-s*.3],[s*.3,s*.3],[s*.7,s]];line(c,ps);ps.forEach(([x,y],i)=>i%2?dot(c,x,y,2.5):star(c,x,y,4));});},
 comets(c,p){motifs(c,p,(c,s)=>{star(c,s*.5,-s*.45,5);for(let k=-1;k<=1;k++)line(c,[[s*.3+k*4,-s*.2],[-s+k*4,s*.8]]);star(c,-s*.3,-s*.6,2);});},
 lensArcs(c,p){for(let i=0;i<2+p.density;i++){const r=198+i*10;ellipse(c,256,256,r,r*.66,(p.variant%3-1)*.35,Math.PI*.05,Math.PI*.9);ellipse(c,256,256,r,r*.66,(p.variant%3-1)*.35,Math.PI*1.05,Math.PI*1.9);}},
 gravityWell(c,p){motifs(c,p,(c,s)=>{for(let k=0;k<4;k++)ellipse(c,0,k*5-s*.3,s*(1-k*.2),s*.25);line(c,[[-s,-s*.3],[0,s*.8],[s,-s*.3]]);});},
 starCompass(c,p){motifs(c,p,(c,s)=>{star(c,0,0,s);poly(c,0,0,s*.45,4,Math.PI/4);for(let i=0;i<4;i++){const a=i*TAU/4+Math.PI/4;dot(c,Math.cos(a)*s*.8,Math.sin(a)*s*.8,2);}});},
 rift(c,p){motifs(c,p,(c,s)=>{line(c,[[-s*.2,-s],[s*.1,-s*.45],[-s*.3,-s*.1],[s*.15,s*.25],[-s*.1,s]]);line(c,[[s*.3,-s*.8],[s*.45,-s*.3],[s*.2,0],[s*.5,s*.5]]);line(c,[[-s*.5,-s*.6],[-s*.6,s*.1],[-s*.35,s*.65]]);});},
 faultPlanes(c,p){motifs(c,p,(c,s)=>{line(c,[[-s,-s*.8],[s*.3,-s*.8],[s,-s*.1],[-s*.3,-s*.1]],true);line(c,[[-s*.8,s*.2],[s*.6,s*.2],[s*.9,s*.8],[-s*.5,s*.8]],true);});},
 portalCorners(c,p){for(const a of (p.level===5?[Math.PI/4,Math.PI*.75,Math.PI*1.25,Math.PI*1.75]:[Math.PI/4,Math.PI*1.25])){c.save();c.translate(256+Math.cos(a)*205,256+Math.sin(a)*205);c.rotate(a);line(c,[[-18,-35],[18,-35],[18,35],[-18,35]]);line(c,[[24,-25],[30,-25],[30,25],[24,25]]);c.restore();}},
 echo(c,p){c.save();c.globalAlpha=.25;for(const dx of (p.level===5?[-17,-9,9,17]:[-6-p.level,6+p.level]))c.drawImage(p.body,dx,0);c.restore();},
 foldedGrid(c,p){motifs(c,p,(c,s)=>{const ps=[[-s,-s*.5],[0,-s],[s,-s*.5],[0,0],[-s,s*.5],[0,s],[s,s*.5]];line(c,ps);line(c,[[0,-s],[0,s]]);line(c,[[-s,-s*.5],[-s,s*.5]]);line(c,[[s,-s*.5],[s,s*.5]]);line(c,[[0,0],[s,s*.5]]);});},
 dimensionalKnots(c,p){motifs(c,p,(c,s)=>{line(c,[[-s,-s*.5],[s*.5,-s*.5],[s*.5,s],[-s,-s*.5],[s,-s],[s,s*.5],[-s*.5,s*.5],[s,-s]]);dot(c,s*.5,s,2);});},
 crown(c,p){motifs(c,p,(c,s)=>{line(c,[[-s,s*.5],[-s,-s*.5],[-s*.4,0],[0,-s],[s*.4,0],[s,-s*.5],[s,s*.5]],true);line(c,[[-s,s*.8],[s,s*.8]]);});},
 wings(c,p){for(const side of [-1,1]){for(let k=0;k<(p.level===5?4:3);k++){const x=256+side*(130+k*28),y=145+k*30;line(c,[[x,y+90],[x+side*(38-k*6),y-65],[x+side*14,y+35]],true);}}},
 sigil(c,p){motifs(c,p,(c,s)=>{poly(c,0,0,s*.85,6,Math.PI/6);line(c,[[-s*.5,s*.4],[0,-s*.5],[s*.5,s*.4],[-s*.5,s*.4]]);line(c,[[0,-s],[0,-s*1.2]]);dot(c,0,0,3);});},
 domainGates(c,p){if(p.level===5){line(c,[[40,116],[115,38],[397,38],[472,116]]);line(c,[[55,132],[127,55],[385,55],[457,132]]);}const x=38,w=32;for(const side of [0,1]){c.save();if(side){c.translate(512,0);c.scale(-1,1);}line(c,[[x,350],[x,135],[x+w,105],[x+w,380]]);line(c,[[x-7,350],[x-7,145]]);poly(c,x+w*.5,124,7,4);c.restore();}},
 sentinelTotems(c,p){motifs(c,p,(c,s)=>{poly(c,0,-s*.5,s*.4,4,Math.PI/4);line(c,[[0,-s*.1],[0,s]]);line(c,[[-s*.4,s*.4],[s*.4,s*.4]]);poly(c,0,s*.65,s*.22,4,Math.PI/4);});},
 mandateSeals(c,p){motifs(c,p,(c,s)=>{poly(c,0,0,s*.8,8,Math.PI/8);for(const k of [-1,1])line(c,[[k*s*.45,-s*.35],[k*s*.15,-s*.35],[k*s*.15,s*.4],[k*s*.5,s*.4]]);line(c,[[-s*.35,0],[s*.35,0]]);});}
};
const definitions=[
['energy','contour','輪廓光','outline','all'],['energy','aura','擴散氣場','field','all'],['energy','lightning','外部電弧','motif','diagonal'],['energy','solarRays','放射光束','field','orbit'],['energy','fanSheets','扇形光幕','motif','top'],['energy','lightPillars','分離光柱','motif','flanks'],
['technology','shieldPanels','護盾片','motif','flanks'],['technology','hexCells','六角護盾簇','motif','diagonal'],['technology','circuitBranches','分岔電路節點','motif','flanks'],['technology','scanBrackets','掃描角框','frame','corners'],['technology','shutterBars','斷續光柵','motif','flanks'],['technology','railFrame','錯位科技導軌','frame','diagonal'],
['mechanical','orbitalDrones','軌道無人機','motif','flanks'],['mechanical','floatingPlates','浮空機械片','motif','diagonal'],['mechanical','satelliteArms','衛星支臂','motif','corners'],['mechanical','segmentedCage','分段裝置籠','frame','orbit'],['mechanical','antennaArray','天線陣列','motif','top'],['mechanical','reactorClamps','反應爐夾具','motif','flanks'],
['crystal','diamonds','浮空稜晶','motif','diagonal'],['crystal','crystalCluster','晶簇','motif','top'],['crystal','needleSpikes','外緣晶刺','field','orbit'],['crystal','crystalGuard','晶體護衛','motif','flanks'],['crystal','prismFans','稜鏡扇片','motif','top'],['crystal','shards','非對稱碎晶','motif','corners'],
['organic','sporeCloud','孢子氣場','motif','diagonal'],['organic','tendrils','外部能量觸鬚','motif','flanks'],['organic','petalBlades','放射花瓣','motif','corners'],['organic','membraneLobes','生物膜瓣','motif','flanks'],['organic','rootArcs','根系能量枝','motif','diagonal'],['organic','pollenSprays','花粉光簇','motif','top'],
['stellar','stars','星群','motif','corners'],['stellar','constellation','星座連線','motif','diagonal'],['stellar','comets','彗星束','motif','flanks'],['stellar','lensArcs','空間透鏡弧','field','orbit'],['stellar','gravityWell','重力井','motif','top'],['stellar','starCompass','星際羅盤','motif','corners'],
['spatial','rift','空間裂隙','motif','flanks'],['spatial','faultPlanes','空間斷層','motif','diagonal'],['spatial','portalCorners','錯位門框','frame','diagonal'],['spatial','echo','靜態外緣殘像','outline','all'],['spatial','foldedGrid','折疊空間構造','motif','corners'],['spatial','dimensionalKnots','維度結','motif','diagonal'],
['sovereign','crown','高維光冠','motif','top'],['sovereign','wings','背部光翼','field','back'],['sovereign','sigil','文明符印','motif','corners'],['sovereign','domainGates','領域雙門','frame','flanks'],['sovereign','sentinelTotems','守衛光碑','motif','flanks'],['sovereign','mandateSeals','文明權印','motif','diagonal']];
const library=definitions.map(([family,id,name,space,position])=>Object.freeze({id,family,name,space,positions:space==='motif'?['top','flanks','diagonal','corners','bottom']:[position],defaultPosition:position,applicableTags:familiesTags[family],shapes:['tall','wide','compact'],levels:[0,5],parameters:{scale:[14,40],density:[1,3],opacity:[.32,.85],direction:[-Math.PI,Math.PI],morphology:['symmetric','asymmetric','split']},compatibility:{exclusiveSpace:space==='motif'?null:space,notWith:space==='outline'?['outline']:[],maxLargeFields:1},spaceRequirement:space==='motif'?{width:82,height:82}:{width:490,height:490},estimatedCost:{drawCalls:space==='motif'?36:56,preparationPasses:space==='outline'?1:0,retainedBytes:512*512*4},attachment:'sprite-local; no fixed ground',painter:id}));
const libraryMap=Object.fromEntries(library.map(e=>[e.id,e]));
function anchors(position,variant,density){const choices={top:[[216,38],[296,38]],bottom:[[216,474],[296,474]],flanks:[[38,216],[474,296]],diagonal:[[65,65],[447,447]],corners:[[65,447],[447,65]]};let ps=(choices[position]||choices.diagonal).map(p=>p.slice());if(variant%2)ps=ps.map(([x,y])=>[512-x,y]);if(density===1)ps=ps.slice(variant%2,variant%2+1);return ps;}
function motifs(c,p,fn){const ps=p.anchors||anchors(p.position,p.variant,p.density);for(let i=0;i<ps.length;i++){const [x,y]=ps[i];c.save();c.translate(x,y);c.rotate(p.direction+(p.morphology==='asymmetric'&&i?Math.PI/7:0));c.scale(p.morphology==='split'&&i?.78:1,1);fn(c,p.scale);c.restore();}}
function rim(c,p,fn,count){for(let i=0;i<count;i++){const a=i*TAU/count+(p.variant%2)*.14;const rx=213-p.scale*.25,ry=213-p.scale*.25;fn(c,256+Math.cos(a)*rx,256+Math.sin(a)*ry,a+Math.PI/2,i);}}
function tagsFor(asset){const id=asset.assetId,tags=[];if(/^(hm|cmd)-/.test(id))tags.push('humanoid','machine');if(/^cmd-/.test(id))tags.push('commander');if(/^(mech|dr)-/.test(id))tags.push('machine');if(/^(ship|veh)-/.test(id))tags.push('ship','machine');if(/^fort-/.test(id))tags.push('structure','machine');if(/^bio-/.test(id))tags.push('organic','creature');if(/^beast-/.test(id))tags.push('creature');if(/^core-/.test(id))tags.push('core','machine');if(/^energy-/.test(id))tags.push('energy');if(/^void-/.test(id))tags.push('void','energy','creature');if(/^boss-/.test(id))tags.push('boss','energy','core');const b=asset.alphaBounds;return {tags,shape:(b[2]-b[0])/(b[3]-b[1])>1.3?'wide':(b[3]-b[1])/(b[2]-b[0])>1.2?'tall':'compact'};}
function compatible(component,asset,chosen){const {tags}=tagsFor(asset);if(!component.applicableTags.some(t=>t==='all'||tags.includes(t)))return false;if(chosen.some(x=>x.id===component.id||component.space!=='motif'&&x.space===component.space))return false;return true;}
function levelFor(r){if(r.mode==='alternate')return {level:5,strength:5.1+(r.visual.appearanceTier-1)*.035};if(r.world==='higher')return {level:4,strength:4.55+(r.bossIndex||0)*.025};if(r.mode==='calamity')return {level:r.world==='universe'?4:3,strength:(r.world==='universe'?4.05:3.4)+(r.bossIndex||0)*.015};if(['bounty','arena','void'].includes(r.mode))return {level:r.world==='universe'?3:2,strength:2.45+(r.world==='universe'?.45:0)+(r.isBossFloor||r.bountyTier==='danger'?.12:0)};if(r.kind==='special')return {level:2,strength:2.05};if(r.kind==='boss')return {level:1,strength:r.world==='universe'?1.5+Number(r.id.slice(-3))*.002:1.2+(r.region||0)*.01};if(r.kind==='elite')return {level:1,strength:.85+(r.region||0)*.01};return {level:0,strength:.35+(r.region||0)*.015};}
function makeConfig(row,asset,bodySpec,index,usage,seen){
 const {level,strength}=levelFor(row),chosen=[],members=[];
 const count=level===0?1+Number(index%3===0):level===1?2:level===2?2:level===3?2+Number(index%2===0):level===4?3:([2,3,2,3,3,2,4,3,3,4][row.visual.appearanceTier-1]);
 const color=bodySpec.rim||'#a6d3df',hue=bodySpec.rules?.[0]?.target?.[0]??bodySpec.groups?.[0]?.[2];
 const secondary=hue===undefined?color:`hsl(${hue} 40% 72%)`,tags=tagsFor(asset).tags;
 for(let k=0;k<count;k++){
  const eligible=library.filter(c=>compatible(c,asset,chosen)&&!chosen.some(x=>x.family===c.family)&&!(level===0&&k===1&&c.space==='field')&&(usage.families[c.family]||0)<Math.ceil(usage.total*.34));
  const scored=eligible.map((c,i)=>{
   const macroPreference=level>=3&&k===0&&c.space!=='motif'?-55:0;
   const familyScore=(usage.families[c.family]||0)*.7,componentScore=(usage.components[c.id]||0)*4;
   const novelty=(usage.byAsset[asset.assetId+'|'+c.id]||0)*18;
   const thematic=(tags.includes('organic')&&c.family==='organic'||tags.includes('machine')&&['technology','mechanical'].includes(c.family)||tags.includes('void')&&c.family==='spatial')?-10:0;
   const combo=chosen.map(x=>x.id).concat(c.id).sort().join('+');
   return {c,score:macroPreference+familyScore+componentScore+novelty+thematic+(seen.has(asset.assetId+'|'+combo)?65:0)+(i+index*7)%13*.21};
  }).sort((a,b)=>a.score-b.score||a.c.id.localeCompare(b.c.id));
  if(!scored.length)throw Error('No compatible component for '+row.id);
  const c=scored[0].c;chosen.push(c);const motifPositions=c.positions;
  let position=motifPositions[(index+k*2)%motifPositions.length];
  if(c.space==='motif'){const occupied=members.filter(m=>libraryMap[m.id].space==='motif').map(m=>m.position);position=motifPositions[(index+k)%motifPositions.length];for(let j=0;occupied.includes(position)&&j<motifPositions.length;j++)position=motifPositions[(index+k+j+1)%motifPositions.length];}
  const variant=Math.floor(index/5)%4,morphology=['symmetric','asymmetric','split'][(index+k)%3];
  members.push({id:c.id,position,variant,morphology,density:level===0?1:Math.min(3,1+Math.floor(strength/2)),scale:Math.min(37,18+strength*2.5+(k?0:3)),opacity:Math.min(.82,.42+strength*.065),direction:c.space==='motif'?[-.18,0,.18,0][(index+k)%4]:0,color:k%2?secondary:color});
  usage.components[c.id]=(usage.components[c.id]||0)+1;usage.families[c.family]=(usage.families[c.family]||0)+1;const ak=asset.assetId+'|'+c.id;usage.byAsset[ak]=(usage.byAsset[ak]||0)+1;
 }
 const combination=members.map(m=>m.id).sort().join('+');seen.add(asset.assetId+'|'+combination);
 return {id:row.id,assetId:asset.assetId,level,strength,combination,families:[...new Set(chosen.map(c=>c.family))],members,version:VERSION,attachment:'sprite-local',bodySource:'body/'+row.id+'.webp'};
}
function createCanvas(factory){const c=factory?factory():document.createElement('canvas');c.width=c.height=512;return c;}
function render(body,config,{canvasFactory,details=false}={}){
 const bodyCanvas=createCanvas(canvasFactory),bc=bodyCanvas.getContext('2d',{willReadFrequently:true});bc.drawImage(body,0,0,512,512);const original=bc.getImageData(0,0,512,512);
 const canvas=createCanvas(canvasFactory),ctx=canvas.getContext('2d',{willReadFrequently:true}),metrics=[];
 for(const member of config.members){
  const info=libraryMap[member.id];if(!info)throw Error('Unknown static component '+member.id);
  const layer=createCanvas(canvasFactory),c=layer.getContext('2d',{willReadFrequently:true});
  c.save();c.beginPath();c.rect(7,7,498,498);c.clip();c.strokeStyle=member.color;c.fillStyle=member.color;c.lineWidth=1.1+config.strength*.42;c.lineJoin='round';c.lineCap='round';c.globalAlpha=member.opacity;
  painters[member.id](c,{...member,level:config.level,body:bodyCanvas});c.restore();
  const pixels=c.getImageData(0,0,512,512);let visible=0,overlap=0;
  for(let i=0;i<pixels.data.length;i+=4){const x=(i/4)%512,y=Math.floor(i/4/512);if(original.data[i+3]||x<8||x>503||y<8||y>503){if(original.data[i+3]&&pixels.data[i+3])overlap++;pixels.data.fill(0,i,i+4);}else if(pixels.data[i+3]>12)visible++;}
  c.putImageData(pixels,0,0);ctx.drawImage(layer,0,0);metrics.push({id:member.id,visiblePixels:visible,maskedBodyPixels:overlap});layer.width=layer.height=1;
 }
 // Source-over antialiasing never resurrects masked body pixels; enforce again.
 const out=ctx.getImageData(0,0,512,512);for(let i=0;i<out.data.length;i+=4)if(original.data[i+3])out.data.fill(0,i,i+4);ctx.putImageData(out,0,0);bodyCanvas.width=bodyCanvas.height=1;
 return details?{canvas,metrics}:canvas;
}
class EffectCache{
 constructor({maxBytes=8*1024*1024}={}){this.maxBytes=maxBytes;this.entries=new Map();this.bytes=0;}
 get(bodyKey,config,body,options){const key=bodyKey+'|'+JSON.stringify(config);if(this.entries.has(key)){const v=this.entries.get(key);this.entries.delete(key);this.entries.set(key,v);return v;}const result=render(body,config,options),c=result.canvas||result;const size=c.width*c.height*4;if(size>this.maxBytes)return c;while(this.bytes+size>this.maxBytes&&this.entries.size){const k=this.entries.keys().next().value,v=this.entries.get(k);this.bytes-=v.width*v.height*4;v.width=v.height=1;this.entries.delete(k);}this.entries.set(key,c);this.bytes+=size;return c;}
 clear(){for(const c of this.entries.values())c.width=c.height=1;this.entries.clear();this.bytes=0;}
}
const api={VERSION,families,library,libraryMap,tagsFor,compatible,levelFor,makeConfig,render,EffectCache};if(typeof module==='object'&&module.exports)module.exports=api;else root.MonsterStaticEffects=api;
})(typeof globalThis==='object'?globalThis:this);
