// Frozen luma/material painter; specs are fixed, bodyOnly is always used.
import {paintArtSample} from './monster-body-v1.mjs?v=20261024-approved1';
export const BODY_VERSION='approved-body-ab521304';
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
 const body=canvasFactory();body.width=body.height=512;const c=body.getContext('2d');c.drawImage(bitmap,0,0);const original=c.getImageData(0,0,512,512),pixels=c.getImageData(0,0,512,512);recolorRound2Pixels(pixels.data,spec);c.putImageData(pixels,0,0);
 // WebKit can floor premultiplied channels during putImageData. Correct against
 // the actual raster, without relaxing luma tolerance or changing source alpha.
 // Two bounded preparation passes only; no per-frame work or retained buffers.
 for(let pass=0;pass<2;pass++){
  const actual=c.getImageData(0,0,512,512);let changed=false;
  for(let i=0;i<actual.data.length;i+=4){if(original.data[i+3]<192)continue;
   const error=luma(original.data.subarray(i,i+3))-luma(actual.data.subarray(i,i+3));
   if(Math.abs(error)<=.65)continue;
   const green=Math.max(0,Math.min(255,actual.data[i+1]+Math.sign(error)*Math.ceil(Math.abs(error)/.7152+.5)));
   if(green!==actual.data[i+1]){actual.data[i+1]=green;changed=true;}
  }
  if(!changed)break;c.putImageData(actual,0,0);
 }

 if(bodyOnly||!spec.power)return body;
 // Reuse the frozen round-1 exterior painter without recoloring the prepared body.
 const full=paintArtSample(body,asset,{...spec,original:true},{canvasFactory});body.width=body.height=1;return full;
}
