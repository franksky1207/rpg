// Frozen painter from approved PR98; no palette allocation.
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
