"use strict";
// Source-preserving mask/export engineering. These are NOT releasable layers.
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process"),crypto=require("node:crypto"),os=require("node:os"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),base="development/combat-animation/batch7";
const recipe=JSON.parse(fs.readFileSync(path.join(root,base,"mask-recipe.json")));
const sourceManifest=JSON.parse(fs.readFileSync(path.join(root,base,"approved-sources/manifest.json")));
const hash=b=>crypto.createHash("sha256").update(b).digest("hex");
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"cw-batch7-"));
const run=args=>cp.execFileSync("magick",args,{maxBuffer:24*1024*1024});
const output=path.join(root,base,"candidates");fs.mkdirSync(output,{recursive:true});
const rows=[];
try{for(const row of recipe.entries){
 const src=path.join(root,base,"approved-sources",row.file),raw=fs.readFileSync(src),expected=sourceManifest.files.find(f=>f.epoch===row.epoch);
 assert.equal(hash(raw),expected.sha256);assert.equal(raw.length,expected.bytes);
 const [w,h]=row.size;assert.equal(`${w} ${h}`,run([src,"-format","%w %h","info:"]).toString());
 const rgba=run([src,"-depth","8","rgba:-"]),original=Buffer.from(rgba);assert.equal(rgba.length,w*h*4);
 const visited=new Uint8Array(w*h),queue=new Int32Array(w*h);let removed=0;
 const white=p=>{const c=rgba.subarray(p*4,p*4+3);return Math.min(...c)>=recipe.background.minChannel&&Math.max(...c)-Math.min(...c)<=recipe.background.maxChroma;};
 for(const [sx,sy] of row.backgroundSeeds){
  const start=sy*w+sx;assert.ok(white(start),"Invalid background seed");if(visited[start])continue;
  let head=0,tail=1;queue[0]=start;visited[start]=1;
  while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);rgba[p*4+3]=0;removed++;
   for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1])if(n>=0&&!visited[n]&&white(n)){visited[n]=1;queue[tail++]=n;}
  }
 }
 // No geometry generation, global white key, color substitution or lost armor.
 for(let i=0;i<rgba.length;i++)if(i%4!==3)assert.equal(rgba[i],original[i]);
 const rawPath=path.join(temp,row.epoch+".rgba");fs.writeFileSync(rawPath,rgba);
 const alphaPath=path.join(temp,row.epoch+".png");run(["-size",`${w}x${h}`,"-depth","8","rgba:"+rawPath,alphaPath]);
 const scale=430/(row.footAnchor[1]-row.headY),sw=Math.round(w*scale),sh=Math.round(h*scale);
 const x=Math.round(256-row.footAnchor[0]*scale),y=Math.round(461-row.footAnchor[1]*scale);
 const out=path.join(output,row.epoch+"-full-candidate.webp");
 run(["-size","512x512","xc:none","(",alphaPath,"-resize",`${sw}x${sh}!`,")","-geometry",`${x>=0?"+":""}${x}${y>=0?"+":""}${y}`,"-compose","over","-composite","-define","webp:lossless=true",out]);
 const bytes=fs.readFileSync(out);
 rows.push({id:row.id,epoch:row.epoch,status:"candidate-only",formalBattleAllowed:false,gmPreviewAllowed:false,source:{path:base+"/approved-sources/"+row.file,sha256:expected.sha256},asset:{path:base+"/candidates/"+path.basename(out),width:512,height:512,bytes:bytes.length,sha256:hash(bytes)},pivot:[0.5,0.9],facing:"right-3/4",normalization:{sourceFootAnchor:row.footAnchor,scale,offset:[x,y],standingHeight:430},mask:{removedPixels:removed,sourceRgbPreservedBeforeResize:true},acceptedLayers:[],missingLayers:["attack-body","independent-weapon",...(row.epoch==="higher"?["cape-with-hidden-continuity","orbit-rings-with-hidden-continuity","celestial-bodies"]:[])],blockers:row.notes});
}}finally{fs.rmSync(temp,{recursive:true,force:true});}
const manifest={schema:"cw.batch7.candidate-assets.v1",batch:7,formalReleaseAllowed:false,supplementalLayerReview:"development/combat-animation/batch7/layer-review/review.json",license:"User-provided approved character masters; derivative engineering for this project. No third-party license claim.",recipe:base+"/mask-recipe.json",note:"Full-image cutouts are engineering candidates, not animation layers. Missing body/weapon/occluded ornamental layers must block formal release. No runtime references permitted.",entries:rows};
fs.writeFileSync(path.join(output,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log("Prepared 3 candidate-only WebP cutouts; formal release remains blocked.");
