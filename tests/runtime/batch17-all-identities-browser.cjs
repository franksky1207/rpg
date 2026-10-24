'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 const report={passed:false,realDevice:false,rows:[],failures:[]};
 try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
  const page=await browser.newPage({viewport});
  await page.route('**/batch15-harness.html',r=>r.fulfill({contentType:'text/html',body:'<iframe style="border:0;width:100%;height:100vh" src="batch15-frame.html?embedded=1"></iframe>'}));
  await page.route('**/batch15-frame.html?embedded=1',r=>r.fulfill({contentType:'text/html',body:`<base href="./3d-test/"><link rel="stylesheet" href="formal-player-sprites.css"><div id="gm"></div><div id="formal" class="formal-b-shared-stage" style="background:#101729;position:relative;height:${viewport.width>viewport.height?180:320}px;overflow:hidden"></div>`}));
  await page.goto(new URL('batch15-harness.html',base).href);
  await page.evaluate(()=>addEventListener('message',e=>{if(e.data?.type==='civilization3d:sprite-auth')e.source.postMessage({type:'civilization3d:sprite-auth-response',requestId:e.data.requestId,authorized:true},location.origin);}));
  const frame=page.frames()[1];await frame.waitForLoadState();
  await frame.addScriptTag({url:new URL('3d-test/t3b-formal-renderer.js',base).href});
  await page.exposeFunction('captureBatch17',async id=>{if(true)await frame.locator('#formal').screenshot({path:'/tmp/batch17-'+viewport.width+'-'+id+'.png'});});
  const result=await frame.evaluate(async specialRows=>{
   window.requestAnimationFrame=()=>0; // Freeze both consumers at the same canonical idle frame.
   const {mount}=await import('./gm-era-sprites.mjs');
   const {mappings,registry}=await import('./monster-sprites.mjs');
   const {resolveFormalMonster}=await import('./monster-formal-resolver.mjs');
   const {palettes,applyDungeonEffects}= await import('./monster-actor.mjs');
   const {appearanceFingerprint}=await import('./monster-appearance.mjs');
   function sameAppearancePixels(a,b){if(a.width!==b.width||a.height!==b.height)return false;const x=a.getContext('2d').getImageData(0,0,a.width,a.height).data,y=b.getContext('2d').getImageData(0,0,b.width,b.height).data;return x.every((v,i)=>v===y[i]);}
   const gm=document.querySelector('#gm'),formal=document.querySelector('#formal');
   const mounted=await mount({host:gm,quality:'medium'}),rows=[];
   const wait=async(fn)=>{const end=performance.now()+10000;while(!fn()){if(performance.now()>end)throw Error('load-timeout');await new Promise(r=>setTimeout(r,1));}};
   function read(c){const n=c.width,d=c.getContext('2d').getImageData(0,0,n,n).data,box=c.getBoundingClientRect();let l=n,t=n,r=-1,b=-1;for(let i=3;i<d.length;i+=4)if(d[i]>16){const x=(i-3)/4%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return {height:(b-t+1)/n*box.height,left:box.left+l/n*box.width,right:box.left+(r+1)/n*box.width,top:box.top+t/n*box.height,bottom:box.top+(b+1)/n*box.height};}
   function pair(host,p,m){const player=read(p),monster=read(m),stage=host.getBoundingClientRect();return {playerHeight:player.height,monsterHeight:monster.height,ratio:monster.height/player.height,contained:[player,monster].every(b=>b.left>=stage.left-.01&&b.right<=stage.right+.01&&b.top>=stage.top-.01&&b.bottom<=stage.bottom+.01),separated:player.right<monster.left};}
   async function select(selector,value){const e=gm.querySelector(selector);e.value=value;e.dispatchEvent(new Event('change'));}
   const bosses=Object.values(mappings).filter(r=>r.status==='batch17-formal-enabled');
   const cases=[...bosses,...bosses.filter(r=>r.world==='higher').flatMap(r=>[0,1,2].map(stage=>({...r,projectionStage:stage})))];
   for(const row of cases){
    const errors=[];let view=null,battle=null,formalSupported=false;
    const world=row.world==='higher'?3:row.world==='universe'?2:1;
    const identity={mode:row.mode,world,name:row.name,kind:row.kind,id:row.bossId,location:row.mode==='calamity'?row.bossId:row.world==='higher'?String(row.bossIndex):row.mode==='special'?row.specialId:row.mode==='arena'?String(row.arenaStage):row.mode==='void'?String(row.isBossFloor?(row.bossCycle+1)*10:1):null};
    if(row.projectionStage!==undefined)Object.assign(identity,{mode:'arena',kind:'dungeon-arena-third-world',name:'高維投影·'+row.name,location:String(row.projectionStage)});
    const ac=new AbortController();let renderer;
    try{
     const era='era-'+(row.world);
     if(gm.querySelector('[data-era]').value!==era){await select('[data-era]',era);await wait(()=>gm.querySelector('canvas[data-suit]'));}
     await select('select[data-monster]',row.assetId);await wait(()=>gm.querySelector('canvas[data-monster]'));
     await select('[data-monster-identity]',row.id);await wait(()=>gm.querySelector('canvas[data-monster]'));
     const enemy=gm.querySelector('canvas[data-monster]');
     view=pair(gm.querySelector('.gm-suit-preview'),gm.querySelector('canvas[data-suit]'),enemy);
     const expectedFingerprint=appearanceFingerprint(row);
     // Painted local colors replace the obsolete whole-image CSS palette.
     if(enemy.dataset.appearance!==expectedFingerprint)errors.push('appearance-spec');
     if(enemy.style.filter!=='none')errors.push('unexpected-secondary-palette');
     if(!view.contained||!view.separated||view.ratio<1.5||view.ratio>2.0)errors.push('gm-layout');
     const approved=resolveFormalMonster(identity);formalSupported=!!approved;
     if(!approved)errors.push('formal-resolution');
     if(approved){
      if(approved.asset.assetId!==row.assetId||approved.mapping.id!==row.id)errors.push('identity');
      const api=window.CivilizationFormalBRenderer;
      const bundle=await api.prepare({wholeSuit:true,eraVisualId:row.world,identity,signal:ac.signal});
      renderer=await api.create({bundle,host:formal,signal:ac.signal,isCurrent:()=>true});
      const sample=()=>renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip:'idle',elapsedMs:0}});sample();
      await wait(()=>{sample();return formal.querySelector('.formal-b-verified-monster');});
      battle=pair(formal,formal.querySelector('[data-suit]'),formal.querySelector('[data-monster]'));
      if(!battle.contained||!battle.separated||battle.ratio<1.5||battle.ratio>2.0)errors.push('formal-layout');
      if(Math.abs(battle.ratio-view.ratio)>(1+Math.max(battle.ratio,view.ratio))/64/Math.min(battle.playerHeight,view.playerHeight))errors.push('ratio-mismatch');
      const formalCanvas=formal.querySelector('[data-monster]');
      if(formalCanvas.dataset.appearance!==expectedFingerprint||formalCanvas.style.filter!==enemy.style.filter||!sameAppearancePixels(formalCanvas,enemy))errors.push('formal-palette-pixels');
      await window.captureBatch17(row.id);
      for(const clip of ['idle','attack','hit','dodge','return','defeat'])for(let ms=0;ms<=700;ms+=35){
       renderer.sample({player:{clip:'idle',elapsedMs:0},enemy:{clip,elapsedMs:ms,approach:.42}});
       const poses=pair(formal,formal.querySelector('[data-suit]'),formal.querySelector('[data-monster]'));if(clip!=='defeat'&&(!poses.contained||!poses.separated))throw Error('pose-layout '+clip+':'+ms);
       const c=formal.querySelector('[data-monster]'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,n=c.width;
       for(let i=3;i<d.length;i+=4)if(d[i]>16){const x=(i-3)/4%n,y=Math.floor((i-3)/4/n);if(x===0||y===0||x===n-1||y===n-1)throw Error('clipped '+clip+':'+ms);}
       if(clip==='defeat'&&ms===700&&d.some((x,i)=>i%4===3&&x>16))throw Error('death-not-empty');
      }

     }
    }catch(e){errors.push(String(e));}finally{renderer?.dispose();ac.abort();}
    rows.push({id:row.id,projectionStage:row.projectionStage,assetId:row.assetId,world:row.world,kind:row.kind,formalSupported,formalNA:formalSupported?null:'resolver excludes special identities',gm:view,formal:battle,errors});
   }
   for(const group of ['galaxy/calamity','universe/calamity','higher/main']){
    await select('[data-dungeon]',group);
    await wait(()=>gm.querySelector('[data-monster-identity]').options.length===10&&mappings[gm.querySelector('[data-monster-identity]').value]?.world===group.split('/')[0]&&gm.querySelector('canvas[data-suit]')?.dataset.suit==='era-'+group.split('/')[0]&&gm.querySelector('canvas[data-monster]')?.dataset.monster===mappings[gm.querySelector('[data-monster-identity]').value]?.assetId);
    const names=[...gm.querySelector('[data-monster-identity]').options].map(o=>o.value);
    if(names.some(id=>mappings[id].world!==group.split('/')[0]))throw Error('gm-boss-group');
   }
   gm.querySelector('[data-advanced]').open=true;gm.querySelector('[data-boss-compare]').click();
   await wait(()=>gm.querySelectorAll('[data-boss-gallery] figure').length===30);
   if(gm.querySelectorAll('.gm-suit-preview canvas').length!==2)throw Error('gallery-persistent-actors');
   const diagnostics=gm.querySelector('.gm-suit').__previewTestApi.diagnostics();
   if(diagnostics.monster.refs>2||diagnostics.monster.entries>2)throw Error('gallery-pool-budget');
   mounted.dispose();window.CivilizationFormalBRenderer.clearSpriteCache();
   return {rows,stats:window.CivilizationFormalBRenderer.monsterStats(),total:Object.keys(mappings).length,assets:registry.assets.length};
  },[]);
  for(const row of result.rows){report.rows.push({viewport,...row});if(row.errors.length)report.failures.push({viewport,id:row.id,errors:row.errors});}
  console.log('identities',viewport.width,result.total,'failures',result.rows.filter(r=>r.errors.length).length,result.rows.filter(r=>r.errors.length).slice(0,2));await page.close();
 }
 const rows=report.rows,ratios=rows.map(r=>r.gm?.ratio).filter(Number.isFinite),errors=rows.filter(r=>r.formal&&r.gm).map(r=>Math.abs(r.formal.ratio-r.gm.ratio));
 report.summary={identities:new Set(rows.map(r=>r.id)).size,cases:rows.length,success:rows.filter(r=>!r.errors.length).length,failed:report.failures.length,minRatio:Math.min(...ratios),maxRatio:Math.max(...ratios),maxRatioError:Math.max(...errors),groups:{}};
 for(const row of rows){const key=row.world+'/'+row.kind,g=report.summary.groups[key]||={cases:0,success:0,failed:0,formalNA:0};g.cases++;g.success+=!row.errors.length;g.failed+=!!row.errors.length;g.formalNA+=!row.formalSupported;}
 assert.equal(report.rows.length,180,'30 bosses plus 10 projections × 3 arena stages × 3 viewports');
 report.passed=!report.failures.length;assert.equal(report.failures.length,0,JSON.stringify(report.failures.slice(0,10)));
 }finally{fs.writeFileSync('/tmp/batch17-all-identities.json',JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
