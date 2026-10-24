// Review-only, hand-authored identities. No region/hash palette generation.
import {mappings} from './monster-sprites.mjs?v=20261024-au-ten-stages1';
export const SAMPLE_VERSION='art-samples-12-v1';
const definitions=[
 ['galaxy-map-003','銀河普通','原型代表：保留士兵原裝甲與所有細節',[],null,0],
 ['galaxy-map-009','銀河菁英','機甲橙色能源改為冷青；灰鐵裝甲不動',[[20,38,175,.85]],'#79c9c4',1],
 ['galaxy-map-025','銀河 Boss','污染母體：紅色組織轉苔綠，暖色囊體保留',[[345,38,92,.65]],'#b6c57b',2],
 ['universe-boss-001','宇宙主線 Boss','彼岸守門者：藍色能源轉青，金屬與披風保留',[[222,48,176,.85]],'#87d8ce',2],
 ['universe-boss-011','宇宙主線 Boss','蒼環執政官：藍色能源轉蒼紫，紅披風轉深靛',[[222,48,257,.85],[355,30,235,.65]],'#b6acf1',2],
 ['galaxy-calamity-01','銀河文明災厄','灰潮母巢：紅組織轉灰紫，囊體轉低彩琥珀',[[345,38,285,.40],[28,26,40,.65]],'#c5a0bb',3],
 ['universe-calamity-01','宇宙文明災厄','彼岸黑潮：紫藍能量轉深海青，亮核保留明度',[[245,65,180,.78]],'#6ed6cf',4],
 ['higher-dimensional-boss-01','高維十王','破界天裁：金甲保留，藍色神力轉冰紫',[[222,48,266,.72]],'#d4c0ff',5],
 ['alternate-depth-0026','異宇宙・星神','星神：青玉能源，金屬與金邊保持原圖',[[222,48,164,.80]],'#83edce',6],
 ['alternate-depth-0191','異宇宙・萬星','萬星：琥珀能源，金屬與金邊保持原圖',[[222,48,34,.88]],'#ffd394',6],
 ['alternate-depth-0201','異宇宙・星墓','星墓：幽紫能源，金屬與金邊保持原圖',[[222,48,280,.65]],'#d3aaf0',6],
 ['special-gold_slime','特殊怪','稀有資源：原有紫藍能量色群轉金色，保留亮核與絲狀明暗',[[245,65,43,.80]],'#e9ce8c',2.5]
];
export const artSamples=Object.freeze(definitions.map(([id,category,note,groups,rim,power])=>Object.freeze({id,assetId:mappings[id].assetId,name:mappings[id].name,category,note,groups:Object.freeze(groups.map(Object.freeze)),rim,power,version:SAMPLE_VERSION,route:'art-samples-12',original:groups.length===0})));
export function resolveArtSample(input){
 const id=typeof input==='string'?input:input?.id;
 const row=mappings[id?.replace(/^projection-/,'')];if(!row)return null;
 // Five encounters in one AU universe and king/projection MUST share one appearance.
 const canonical=row.mode==='alternate'?'alternate-depth-'+String((row.universeNumber-1)*5+1).padStart(4,'0'):row.id;
 return artSamples.find(s=>s.id===canonical)||null;
}
function hsv(r,g,b){r/=255;g/=255;b/=255;const v=Math.max(r,g,b),d=v-Math.min(r,g,b);let h=0;if(d){if(v===r)h=60*((g-b)/d%6);else if(v===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);}return [(h+360)%360,v?d/v:0,v];}
function rgb(h,s,v){const c=v*s,x=c*(1-Math.abs(h/60%2-1)),m=v-c;return (h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x]).map(n=>Math.round((n+m)*255));}
const distance=(a,b)=>Math.abs((a-b+540)%360-180);
// Masks follow SOURCE hue/chroma, never coordinates. V and alpha remain exact;
// near-neutral metal, white highlights and dark detail are protected.
export function recolorSamplePixels(data,spec){
 if(spec.original)return data;
 for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const [h,s,v]=hsv(data[i],data[i+1],data[i+2]);if(s<.18||v<.08)continue;
  const group=spec.groups.find(([source,width])=>distance(h,source)<width);if(!group)continue;
  const [source,width,target,saturation]=group,edge=Math.min(1,(width-distance(h,source))/10),chroma=Math.min(1,(s-.18)/.18),weight=edge*chroma;
  const delta=(target-source+540)%360-180;
  const color=rgb((h+delta*weight+360)%360,s*(1-weight+weight*saturation),v);
  for(let k=0;k<3;k++)data[i+k]=color[k];
 }return data;
}
export function paintArtSample(bitmap,asset,spec,{canvasFactory=()=>document.createElement('canvas'),bodyOnly=false}={}){
 const body=canvasFactory();body.width=body.height=512;const c=body.getContext('2d',{willReadFrequently:true});c.drawImage(bitmap,0,0);
 const original=c.getImageData(0,0,512,512),pixels=c.getImageData(0,0,512,512);recolorSamplePixels(pixels.data,spec);c.putImageData(pixels,0,0);
 if(bodyOnly||!spec.power)return body;
 const fx=canvasFactory();fx.width=fx.height=512;const f=fx.getContext('2d');
 // Static silhouette glow plus complete thin orbital rings; no crescents, timers or particles.
 f.shadowColor=spec.rim;f.shadowBlur=3+spec.power*1.4;f.globalAlpha=.18+spec.power*.035;f.drawImage(body,0,0);f.shadowBlur=0;
 const [l,t,r,b]=asset.alphaBounds,cx=(l+r)/2,cy=(t+b)/2;
 f.strokeStyle=spec.rim;f.lineWidth=1+spec.power*.12;
 if(spec.power>=2){f.globalAlpha=.16+spec.power*.025;f.beginPath();f.ellipse(cx,cy,(r-l)/2+15,(b-t)/2+15,0,0,Math.PI*2);f.stroke();}
 if(spec.power>=4){f.globalAlpha=.15;f.beginPath();f.ellipse(cx,cy,(r-l)/2+25,(b-t)/2+22,0,0,Math.PI*2);f.stroke();}
 if(spec.power>=5){f.globalAlpha=.50;for(const y of [cy-50,cy,cy+50]){f.beginPath();f.arc(r+28,y,2.5,0,Math.PI*2);f.fillStyle=spec.rim;f.fill();}}
 // Enforce exterior-only pixels, including semitransparent source edges.
 const effect=f.getImageData(0,0,512,512);for(let i=0;i<effect.data.length;i+=4)if(original.data[i+3])effect.data.fill(0,i,i+4);f.putImageData(effect,0,0);
 f.globalAlpha=1;f.drawImage(body,0,0);body.width=body.height=1;return fx;
}
