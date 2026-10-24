// Local-only export. Never writes formal assets, mappings, or appearance modules.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root='development/monster-art/full-review';
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const p=await browser.newPage();await p.goto('http://127.0.0.1:4173/');
const manifest=await p.evaluate(async()=>{
 const {registry,mappings}=await import('/3d-test/monster-sprites.mjs');
 const {artSamplesV2}=await import('/3d-test/monster-art-samples-v2.mjs');
 const all=Object.values(mappings), canonical=r=>r.mode==='alternate'?'alternate-depth-'+String((r.universeNumber-1)*5+1).padStart(4,'0'):r.id;
 function category(r){return r.mode==='alternate'?'alternate':r.world==='higher'?'higher':r.mode==='calamity'?r.world+'-calamity':['bounty','arena','void'].includes(r.mode)?r.mode:r.kind==='special'?'special':r.id.startsWith('galaxy-map')?'galaxy':'universe';}
 const rows=all.map(r=>({...r,canonical:canonical(r),category:category(r)}));
 const kings=rows.filter(r=>r.category==='higher');for(const r of kings)rows.push({...r,id:'projection-'+r.id,name:r.name+'・競技投影',category:'projection',canonical:r.id});
 return {source:'658d5db2',sampleSource:'a4f8baea6ee64b5509c98733f9a07ff098e4fd9f',assets:registry.assets,rows,samples:artSamplesV2};
});
fs.mkdirSync(root+'/body',{recursive:true});fs.mkdirSync(root+'/full',{recursive:true});fs.mkdirSync(root+'/original',{recursive:true});fs.mkdirSync(root+'/baseline',{recursive:true});
for(const a of manifest.assets)fs.copyFileSync(a.path,root+'/original/'+a.assetId+'.webp');
const refresh=process.argv.includes('--refresh-profiles');let specs=refresh?JSON.parse(fs.readFileSync(root+'/manifest.json')).specs:[];
for(const asset of manifest.assets){
 const rows=manifest.rows.filter(r=>r.assetId===asset.assetId&&r.canonical===r.id).sort((a,b)=>a.id.localeCompare(b.id));
 if(!rows.length)continue;if(refresh&&!rows.some((r,i)=>r.world==='higher'||Math.floor(i/24)>0))continue;
 const result=await p.evaluate(async({asset,rows,samples,refresh})=>{
  const {sourceHSV,recolorRound2Pixels,paintArtSampleV2}=await import('/3d-test/monster-art-samples-v2.mjs');
  const {paintArtSample}=await import('/3d-test/monster-art-samples.mjs');
  const image=new Image();image.src='/'+asset.path;await image.decode();
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const src=ctx.getImageData(0,0,512,512);
  const bins=Array(12).fill(0);let neutral=0;
  for(let i=0;i<src.data.length;i+=4){if(src.data[i+3]<128)continue;const [h,s,v]=sourceHSV(...src.data.subarray(i,i+3));if(v<.15||v>.92)continue;if(s<.25)neutral++;else bins[Math.round(h/30)%12]++;}
  const dominant=bins.indexOf(Math.max(...bins))*30;
  // Curated harmonious body/accent pairs; allocated within each prototype across all modes.
  const palettes=[[160,.36,210,.52,'青銅綠／深藍'],[290,.29,26,.50,'灰梅紫／銅棕'],[22,.42,36,.72,'赭銅／琥珀'],[230,.28,266,.58,'冷銀靛／冰紫'],[185,.38,37,.72,'霧青鋼／琥珀'],[92,.34,45,.48,'苔綠／舊金'],[350,.38,215,.40,'暗絳紅／鋼藍'],[265,.33,180,.48,'灰紫／青玉'],[205,.41,32,.48,'深海藍／暖銅'],[42,.39,168,.46,'砂金／碧青'],[130,.33,285,.38,'翡翠／灰紫'],[320,.32,45,.50,'桑紫／淡金'],[175,.28,250,.42,'灰玉／藍紫'],[10,.33,185,.48,'赤陶／湖青'],[245,.34,38,.48,'暮藍／琥珀'],[65,.30,210,.40,'橄欖／冷鋼'],[305,.27,165,.42,'煙玫紫／青綠'],[200,.26,355,.42,'冰鋼／絳紅'],[30,.28,270,.40,'古銅／紫晶'],[145,.42,40,.60,'深玉／金棕'],[275,.41,220,.48,'紫晶／冰藍'],[355,.29,35,.40,'灰紅／黃銅'],[215,.34,170,.48,'藍鋼／青綠'],[50,.25,295,.42,'香檳銀／梅紫']];
  function power(r){if(r.mode==='alternate')return 6+(r.visual.appearanceTier-1)/12;if(r.world==='higher')return 5+r.bossIndex/20;if(r.mode==='calamity')return r.world==='universe'?4:3;if(['bounty','arena','void'].includes(r.mode))return 2+(r.world==='higher'?1:r.world==='universe'?.6:0)+(r.isBossFloor?.25:0);return r.kind==='special'?2.5:r.kind==='boss'?2:r.kind==='elite'?1:0;}
  return rows.map((r,index)=>{
   if(refresh&&r.world!=='higher'&&Math.floor(index/24)===0)return null;
   let spec=samples.find(s=>s.id===r.id);
   const frozen=!!spec;
   if(!spec){const n=r.world==='higher'?[3,2,0,1,8,9,6,7,10,11][r.bossIndex]:(index*7)%palettes.length,cycle=Math.floor(index/palettes.length),[h,s,ah,as,label]=palettes[n];const shift=(cycle%2?1:-1)*Math.ceil(cycle/2)*8;
    const bodyHue=(h+shift+360)%360, accentHue=(ah+shift+360)%360;
    const rules=[{name:'低彩金屬主體',hue:null,sat:[0,.30],target:[bodyHue,Math.min(.58,Math.max(.18,s+(cycle===1?.12:cycle===2?-.10:cycle>=3?.18:0)))],mix:.92}];
    // Membership is measured in SOURCE color space; every colored family keeps
    // its native hue variation and material shading. No coordinate masks.
    for(let k=0;k<12;k++)if(bins[k]){const dist=Math.abs((k*30-dominant+540)%360-180);rules.push({name:'原圖色群 '+k*30,hue:[k*30,24],sat:[.22,1],target:[dist<=45?(bodyHue+(k*30-dominant+540)%360-180+360)%360:accentHue,dist<=45?Math.min(.64,Math.max(.20,s+.08+(cycle===1?.12:cycle===2?-.10:cycle>=3?.18:0))):as],mix:.96});}
    spec={id:r.id,assetId:asset.assetId,retained:false,original:false,rules,power:power(r),rim:`hsl(${accentHue} 48% 75%)`,note:label+'；依原圖色群調整，保留明暗與材質',paletteIndex:n,paletteCycle:cycle};
   }
   const body=paintArtSampleV2(image,asset,spec,{bodyOnly:true});const full=paintArtSampleV2(image,asset,spec);
   const output={id:r.id,spec,body:body.toDataURL('image/webp',.92).split(',')[1],full:full.toDataURL('image/webp',.92).split(',')[1],frozen};body.width=full.width=1;return output;
  }).filter(Boolean);
 },{asset,rows,samples:manifest.samples,refresh});
 for(const r of result){fs.writeFileSync(root+'/body/'+r.id+'.webp',Buffer.from(r.body,'base64'));fs.writeFileSync(root+'/full/'+r.id+'.webp',Buffer.from(r.full,'base64'));if(r.frozen){for(const mode of ['body','full']){const from=root+'/'+mode+'/'+r.id+'.webp',to=root+'/baseline/'+r.id+'-'+mode+'.webp';if(fs.existsSync(to)){if(!fs.readFileSync(to).equals(fs.readFileSync(from)))throw Error('Frozen baseline mismatch: '+to);}else fs.copyFileSync(from,to);}}specs=specs.filter(s=>s.id!==r.id);specs.push(r.spec);}
 console.log(asset.assetId,rows.length);
}
manifest.specs=specs;delete manifest.samples;
fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2));fs.writeFileSync(root+'/data.js','window.MONSTER_REVIEW='+JSON.stringify(manifest)+';\n');
console.log('Exported',specs.length,'appearances,',manifest.rows.length,'identities');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
