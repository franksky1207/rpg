'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
const ids=JSON.parse(fs.readFileSync('data/monsters/monster-assets.json')).assets.map(a=>a.assetId);
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),reports=[];
try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(ts=>{const RealDate=Date;class FixedDate extends RealDate{constructor(...args){super(...(args.length?args:[ts]));}static now(){return ts;}}window.Date=FixedDate;},Date.now());
 await page.goto(base+'?production=1');await page.evaluate(()=>ensureCivilizationScriptGroup('gm'));
 await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready'&&typeof openGm3DPrototype==='function');await finishIntro(page);
 // Playwright routing disables the entire HTTP cache. Remove the SDK bootstrap route
 // after startup so force-cache is measured under real browser cache semantics.
 await page.unroute('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js');
 await page.evaluate(()=>{state.gm=true;openGm3DPrototype();});const frame=page.frameLocator('#gm3dPrototypeOverlay iframe');
 await frame.locator('canvas[data-suit]').waitFor();
 await frame.locator('[data-preview-mode]').selectOption('duel');
 await frame.locator('[data-advanced] summary').first().click();
 await page.waitForTimeout(1200);const truth=await page.evaluate(()=>JSON.stringify(state)),storage=await page.evaluate(()=>JSON.stringify(localStorage));
 const poses=await frame.locator('body').evaluate(async()=>{
  const {registry,plannedAssetId,mappings,findMapping,identitiesForAsset}=await import('./monster-sprites.mjs?v=20261020-twenty-gm1');
  const {createMonsterPool}=await import('./monster-sprite-pool.mjs?v=20261020-twenty-gm1');
  const {MonsterActor}=await import('./monster-actor.mjs?v=20261020-twenty-gm1');
  const pool=createMonsterPool();const results=[];
  const read=c=>{const n=c.width,d=c.getContext('2d').getImageData(0,0,n,n).data;let count=0,border=0,hash=2166136261,x=0,y=0;for(let i=0;i<d.length;i+=4){hash=Math.imul(hash^d[i]^d[i+1]^d[i+2]^d[i+3],16777619);if(d[i+3]>16){const px=i/4%n,py=Math.floor(i/4/n);count++;x+=px;y+=py;if(px===0||px===n-1||py===0||py===n-1)border++;}}return {count,border,hash:hash>>>0,x:x/Math.max(1,count),y:y/Math.max(1,count)};};
  for(const a of registry.assets){const actor=await new MonsterActor(pool,a.assetId).init(),samples={};for(const clip of ['idle','attack','hit','defeat']){actor.draw({clip,elapsedMs:336});samples[clip]=read(actor.canvas);}
   for(const clip of ['idle','attack','hit','defeat'])for(let ms=0;ms<=700;ms+=35){actor.draw({clip,elapsedMs:ms});if(read(actor.canvas).border)throw Error(a.assetId+' clipped '+clip+':'+ms);}
   actor.draw({clip:'defeat',elapsedMs:700});samples.dead=read(actor.canvas);actor.dispose();results.push({id:a.assetId,samples});}
  for(let i=0;i<180;i++){const a=await new MonsterActor(pool,registry.assets[i%registry.assets.length].assetId).init();a.draw({clip:'attack',elapsedMs:336});a.dispose();if(pool.stats().bytes>pool.stats().limit)throw Error('budget');}
  for(const row of Object.values(mappings)){const actor=await new MonsterActor(pool,row.assetId,{identity:row.id}).init();actor.draw();if(actor.canvas.style.filter==='')throw Error('missing palette');actor.dispose();}
  const stress=pool.stats(),transfers=performance.getEntriesByType('resource').filter(e=>e.name.includes('/assets/monsters/v1/')).map(e=>({url:e.name,bytes:e.transferSize}));pool.dispose();return {results,stress,transfers,disposed:pool.stats(),lookup:plannedAssetId('galaxy-map-001')};
 });
 assert.equal(poses.lookup,'hm-01');for(const a of poses.results){const s=a.samples;assert.equal(new Set(Object.values(s).map(v=>v.hash)).size,5);assert.equal(s.dead.count,0);assert.ok(s.idle.count>1000);}
 assert.equal(poses.results.length,39,'all 21 sealed and 12 new prototypes tested');
 assert.ok(poses.transfers.filter(e=>e.bytes>0).length<=39,'LRU re-decode must reuse disk cache, not download again');assert.ok(poses.transfers.filter(e=>e.bytes===0).length>=150,'warm image requests served without network bytes');
 assert.equal(poses.stress.refs,0);assert.equal(poses.stress.pending,0);assert.ok(poses.stress.entries<=2);assert.equal(poses.disposed.bytes,0);
 for(const id of ids){
  const before=await frame.locator('.gm-suit-preview').boundingBox();
  await frame.locator('select[data-monster]').selectOption(id);await frame.locator('[data-monster-status][data-ready="true"]').waitFor({state:'attached'});
  const after=await frame.locator('.gm-suit-preview').boundingBox();assert.equal(before.width,after.width);assert.equal(before.height,after.height,'no decode layout jump');
  const shared=await frame.locator('[data-monster-identity] option').evaluateAll(options=>options.slice(1).map(o=>o.value));assert.ok(shared.length>0,id+" "+await frame.locator('[data-monster-identity]').innerHTML());await frame.locator('[data-monster-identity]').selectOption(shared[0]);await frame.locator('[data-monster-status][data-ready="true"]').waitFor({state:'attached'});
  assert.equal(await frame.locator('[data-monster-scale],[data-monster-palette],[data-monster-next]').count(),0,'retired GM overrides stay removed');
  const appearance=await frame.locator('.gm-suit').evaluate(async el=>{const {mappings,registry,palettes}=await import('./monster-sprites.mjs');const row=mappings[el.querySelector('[data-monster-identity]').value],expected=document.createElement('canvas');expected.style.filter=palettes[row.visual.palette];if(row.visual.sizePolicy==='dungeon'){const {applyDungeonEffects}=await import('./monster-actor.mjs');applyDungeonEffects(expected,row.visual);}return {label:el.querySelector('[data-monster-description]').textContent,expectedLabel:registry.assets.find(a=>a.assetId===row.assetId).name+'｜大小：玩家的 '+Math.round((row.visual.visibleRatio||row.visual.scale)*100)+'%',palette:el.querySelector('canvas[data-monster]').style.filter,expectedPalette:expected.style.filter};});
  assert.equal(appearance.label,appearance.expectedLabel,'identity size is concise read-only text');assert.equal(appearance.palette,appearance.expectedPalette,'formal palette is still applied without a visible engineering code');
  const sharedRatio=await frame.locator('canvas[data-monster]').getAttribute('data-actual-ratio');
  assert.ok(Number(sharedRatio)>=.9,'shared formal/GM ratio contract: '+JSON.stringify({viewport,id,sharedRatio}));
  const layout=await frame.locator('.gm-suit-preview').evaluate(e=>{
   function visual(c){const box=c.getBoundingClientRect(),n=c.width,d=c.getContext('2d').getImageData(0,0,n,n).data;let l=n,r=0,t=n,b=0;for(let i=3;i<d.length;i+=4)if(d[i]>16){const x=(i-3)/4%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return {left:box.left+l/n*box.width,right:box.left+r/n*box.width,top:box.top+t/n*box.height,bottom:box.top+b/n*box.height};}
   const box=e.getBoundingClientRect();return {stage:{left:box.left,right:box.right,top:box.top,bottom:box.bottom},player:visual(e.querySelector('[data-suit]')),enemy:visual(e.querySelector('[data-monster]'))};
  });
  assert.ok(layout.player.right<layout.enemy.left,'player left, monster right');
  assert.ok(layout.enemy.bottom-layout.enemy.top>=.90*(layout.player.bottom-layout.player.top),'GM monster visible height at least 90% of player: '+JSON.stringify({viewport,id,playerHeight:layout.player.bottom-layout.player.top,enemyHeight:layout.enemy.bottom-layout.enemy.top}));for(const box of [layout.player,layout.enemy]){assert.ok(box.left>=layout.stage.left&&box.right<=layout.stage.right);assert.ok(box.top>=layout.stage.top&&box.bottom<=layout.stage.bottom);}
  for(const action of ['idle','attack','hit','defeat']){
   await frame.locator(`[data-monster-action="${action}"]`).dispatchEvent('click');
   await frame.locator(`canvas[data-monster="${id}"]`).evaluate((c,clip)=>new Promise((resolve,reject)=>{const end=performance.now()+3000;function poll(){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let count=0;for(let i=3;i<d.length;i+=4)if(d[i]>16)count++;if(c.dataset.clip===clip&&(clip==='defeat'?count===0:count>500))return resolve();if(performance.now()>end)return reject(Error('UI animation '+clip));requestAnimationFrame(poll);}poll();}),action);
  }
  await frame.locator('[data-monster-action="idle"]').dispatchEvent('click');await frame.locator('[data-duel]').click();await frame.locator('[data-monster-action="idle"]').dispatchEvent('click');
  await frame.locator('[data-action="idle"]').click();
  await frame.locator('.gm-suit-preview').screenshot({path:`/tmp/batch13-${viewport.width}-${id}.png`});
 }
 // Real failure must leave the player and controls usable, then recover in place.
 await page.route('**/assets/monsters/v1/mechanical/mech-02.webp*',r=>r.fulfill({status:200,contentType:'image/webp',body:Buffer.from('corrupt')}));
 await frame.locator('select[data-monster]').selectOption('mech-02');await frame.locator('[data-monster-status]').filter({hasText:'圖片載入失敗'}).waitFor();
 assert.equal(await frame.locator('canvas[data-monster]').count(),0);assert.equal(await frame.locator('canvas[data-suit]').count(),1);
 await page.unroute('**/assets/monsters/v1/mechanical/mech-02.webp*');
 await frame.locator('[data-reload]').click();await frame.locator('canvas[data-monster="mech-02"]').waitFor();
 await frame.locator('[data-player-duel]').click();
 for(let i=0;i<60;i++)await frame.locator('select[data-monster]').selectOption(ids[i%20]);
 await frame.locator('canvas[data-monster="energy-01"]').waitFor();
 const diag=await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.diagnostics());assert.ok(diag.monster.bytes<=diag.monster.limit);assert.equal(diag.monster.refs,1);assert.equal(diag.monster.pending,0);
 await frame.locator('select[data-monster]').selectOption('');assert.equal(await frame.locator('canvas[data-monster]').count(),0);assert.equal(await frame.locator('[data-action]').count(),6);
 assert.equal(await page.evaluate(()=>JSON.stringify(state)),truth,'gameplay isolation');assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),storage,'save isolation');
 await frame.locator('select[data-monster]').selectOption('hm-01');await frame.locator('canvas[data-monster="hm-01"]').waitFor();
 await page.evaluate(()=>state.gm=false);await frame.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor();
 const revoked=await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.diagnostics());assert.equal(revoked.monster.bytes,0);assert.equal(revoked.monster.refs,0);assert.equal(await frame.locator('canvas').count(),0);
 await page.evaluate(()=>closeGm3DPrototype());assert.deepEqual(errors,[]);reports.push({viewport,poses,diag,revoked,errors});await page.close();console.log('PASS twenty monsters, all attack/hit/death rasters, 180 lifecycle, GM left/right layout and isolation',viewport.width);
 }}finally{await browser.close();}fs.writeFileSync('/tmp/batch13-monster-browser.json',JSON.stringify({passed:true,realDevice:false,reports},null,2));})().catch(e=>{console.error(e);process.exitCode=1;});
