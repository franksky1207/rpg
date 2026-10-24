// Offline build-time pixel refinement; never runs in the game or changes formal identities.
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await browser.newPage();await p.goto('http://127.0.0.1:4173/');const report=JSON.parse(fs.readFileSync('work/visual-integration/pixels-chromium.json'));
 const result=await p.evaluate(async suspects=>{
  const {mappings,findAsset}=await import('./3d-test/monster-sprites.mjs'),{resolveMonsterAppearance,paintMonsterAppearance}=await import('./3d-test/monster-appearance.mjs'),{createMonsterPool}=await import('./3d-test/monster-sprite-pool.mjs');
  const {appearanceDesigns}=await import('./3d-test/monster-appearance-designs.mjs');
  const pool=createMonsterPool({usage:'formal'}),designs={...appearanceDesigns},records=[],targets=[...new Set(suspects.map(r=>r.b))];
  for(const id of targets){
   const row=mappings[id],asset=findAsset(row.assetId),lease=await pool.acquire(row.assetId),rows=Object.values(mappings).filter(r=>r.assetId===row.assetId&&r.id!==id&&(r.mode!=='alternate'||r.stageIndex===0));
   function pixels(spec){const source=paintMonsterAppearance(lease.bitmap,asset,spec),c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.drawImage(source,0,0,64,64);source.width=source.height=1;return ctx.getImageData(0,0,64,64).data;}
   const references=rows.map(r=>pixels(resolveMonsterAppearance(r,designs[r.id]===undefined?{}:{designIndex:designs[r.id]})));
   let best=null;for(let index=0;index<192;index++){
    const spec=resolveMonsterAppearance(row,{designIndex:index});
    if(row.mode==='alternate'&&rows.filter(r=>r.mode==='alternate').some(r=>{const other=resolveMonsterAppearance(r,designs[r.id]===undefined?{}:{designIndex:designs[r.id]});return JSON.stringify(spec.colors)===JSON.stringify(other.colors)||JSON.stringify([spec.texture,spec.field,spec.culture])===JSON.stringify([other.texture,other.field,other.culture]);}))continue;
    const candidate=pixels(spec);let worst=Infinity;
    for(const other of references){let sum=0,n=0,changed=0;for(let i=0;i<candidate.length;i+=4)if(candidate[i+3]>32&&other[i+3]>32){const d=(Math.abs(candidate[i]-other[i])+Math.abs(candidate[i+1]-other[i+1])+Math.abs(candidate[i+2]-other[i+2]))/3;sum+=d;n++;if(d>20)changed++;}worst=Math.min(worst,sum/n,changed/n*60);}
    if(!best||worst>best.score)best={index,score:worst};
   }
   designs[id]=best.index;records.push({id,...best});lease.release();
  }pool.dispose();return {designs,records};
 },report.suspects.length?report.suspects:report.nearest.filter(r=>r.mean<22||r.changed<.35));
 fs.writeFileSync('3d-test/monster-appearance-designs.mjs','// Build-time 64px same-prototype maximin refinement; runtime remains deterministic.\nexport const appearanceDesigns=Object.freeze('+JSON.stringify(result.designs,null,2)+');\n');
 fs.writeFileSync('work/visual-integration/refinement.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
