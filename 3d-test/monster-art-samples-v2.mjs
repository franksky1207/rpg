// Round 1 remains byte-for-byte frozen in monster-art-samples.mjs (f674c144).
// These material/color groups never use coordinates, regions, RNG or identity hashes.
import {artSamples as firstRound,resolveArtSample,paintArtSample} from './monster-art-samples.mjs';
export const ROUND2_ROUTE='art-samples-12-v2';
export const FIRST_ROUND_SHA256='d7f805f168887f36dd9ef2f05dfd310f4da9d7b5f0ce5b22946f116275965aa5';
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
// Source HSV membership: hue center/width, saturation interval. Endpoints feather.
// Low-chroma metal is a real source material family, including its warm cream pixels;
// it is not inferred from location. White speculars and deepest shadows are protected.
const metal=(h,s)=>({name:'主要裝甲／低彩金屬',hue:null,sat:[0,.38],target:[h,s],mix:.92});
const warm=(h,s,max=1)=>({name:'暖色甲片／金屬邊飾',hue:[40,30],sat:[.20,max],target:[h,s],mix:.92});
const color=(name,source,width,h,s)=>({name,hue:[source,width],sat:[.18,1],target:[h,s],mix:1});
const edits={
 'galaxy-map-009':{note:'主裝甲改為霧青鋼；能源與暖色接縫統一琥珀，保留槍管陰影與金屬反光',rim:'#92c9c1',rules:[metal(185,.38),color('橙色能源／接縫',20,38,37,.80)]},
 'universe-boss-001':{note:'彼岸守門者：青銅綠甲、深藍披風、冷青能源；主裝甲與披風同步協調',rim:'#a1d6c5',rules:[metal(160,.32),warm(160,.40),color('披風',355,30,215,.50),color('能源',222,48,176,.75)]},
 'universe-boss-011':{note:'蒼環執政官：灰梅紫甲、銅棕披風、琥珀能源；與守門者形成主體差異',rim:'#d3b6cf',rules:[metal(290,.28),warm(290,.34),color('披風',355,30,26,.55),color('能源',222,48,38,.80)]},
 'higher-dimensional-boss-01':{note:'破界天裁：主體金甲轉冷銀靛、能源保留冰紫；以金屬亮暗呈現神性',rim:'#c5ccf2',rules:[metal(230,.24),warm(230,.36),color('神力',222,48,266,.68)]},
 'alternate-depth-0026':{note:'星神：青玉甲片、少量舊金邊、青綠能源；不只改核心',rim:'#a3e3cb',rules:[metal(155,.38),warm(155,.42,.58),color('能源',222,48,164,.80)]},
 'alternate-depth-0191':{note:'萬星：赭銅甲片、暖銅邊、琥珀能源；保留白色高光與黑鐵骨架',rim:'#ebc49e',rules:[metal(22,.40),warm(24,.50),color('能源',222,48,34,.88)]},
 'alternate-depth-0201':{note:'星墓：灰紫甲片、冷銀紫邊、幽紫能源；與青玉／赭銅版本有本體差異',rim:'#d3b9e7',rules:[metal(270,.30),warm(255,.30),color('能源',222,48,280,.65)]}
};
export const artSamplesV2=freeze(firstRound.map(s=>({...s,...edits[s.id],retained:!edits[s.id],version:'art-samples-12-v2',route:ROUND2_ROUTE})));
export function resolveArtSampleV2(input){const old=resolveArtSample(input);return old?artSamplesV2.find(s=>s.id===old.id):null;}
export function sourceHSV(r,g,b){r/=255;g/=255;b/=255;const v=Math.max(r,g,b),d=v-Math.min(r,g,b);let h=0;if(d){if(v===r)h=60*((g-b)/d%6);else if(v===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);}return [(h+360)%360,v?d/v:0,v];}
const distance=(a,b)=>Math.abs((a-b+540)%360-180);
const ramp=(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a)));
export function ruleWeight(h,s,v,rule){
 const hue=rule.hue?Math.min(1,Math.max(0,(rule.hue[1]-distance(h,rule.hue[0]))/10)):1;
 const [lo,hi]=rule.sat,lower=lo===0?1:ramp(s,lo-.04,lo+.04),upper=hi===1?1:1-ramp(s,hi-.04,hi+.04);
 // Preserve ink-like crevices, neutral white reflections and brightest speculars.
 return hue*lower*upper*ramp(v,.08,.23)*(1-ramp(v,.88,1))*(v>.88?Math.min(1,s/.15):1)*rule.mix;
}
function targetRGB(h,s){const x=1-Math.abs(h/60%2-1),m=1-s;return (h<60?[1,x,0]:h<120?[x,1,0]:h<180?[0,1,x]:h<240?[0,x,1]:h<300?[x,0,1]:[1,0,x]).map(c=>(c*s+m)*255);}
const luma=p=>p[0]*.2126+p[1]*.7152+p[2]*.0722;
// Luma-preserving chroma replacement: scalar shade/texture survives exactly.
// Gamut compression reduces chroma instead of clipping highlights or crushing shadows.
export function recolorRound2Pixels(data,spec){
 if(spec.retained)throw Error('retained-sample-uses-frozen-v1-painter');
 for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const src=[data[i],data[i+1],data[i+2]],[h,s,v]=sourceHSV(...src);
  let rule,weight=0;for(const candidate of spec.rules){const w=ruleWeight(h,s,v,candidate);if(w>weight){rule=candidate;weight=w;}}
  if(!weight)continue;
  const target=targetRGB(...rule.target),y=luma(src),ty=luma(target),chroma=target.map(c=>(c-ty)*(y/Math.max(ty,1)));
  let gamut=1;for(const c of chroma){if(c>0)gamut=Math.min(gamut,(255-y)/c);if(c<0)gamut=Math.min(gamut,-y/c);}
  for(let k=0;k<3;k++)data[i+k]=Math.round(src[k]*(1-weight)+(y+chroma[k]*gamut)*weight);
 }return data;
}
export function paintArtSampleV2(bitmap,asset,spec,{canvasFactory=()=>document.createElement('canvas'),bodyOnly=false}={}){
 if(spec.retained)return paintArtSample(bitmap,asset,spec,{canvasFactory,bodyOnly});
 const body=canvasFactory();body.width=body.height=512;const c=body.getContext('2d',{willReadFrequently:true});c.drawImage(bitmap,0,0);const pixels=c.getImageData(0,0,512,512);recolorRound2Pixels(pixels.data,spec);c.putImageData(pixels,0,0);
 if(bodyOnly||!spec.power)return body;
 // Reuse the frozen round-1 exterior painter without recoloring the prepared body.
 const full=paintArtSample(body,asset,{...spec,original:true},{canvasFactory});body.width=body.height=1;return full;
}
