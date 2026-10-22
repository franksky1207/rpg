'use strict';
// Published GM center: real permission bridge, new era sprites and six actions.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro,assertStartupSprites}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),reports=[];
try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport}),errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/era-player.*webp/.test(r.url()))requests.push(r.url());});
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(ts=>{const RealDate=Date;class FixedDate extends RealDate{constructor(...args){super(...(args.length?args:[ts]));}static now(){return ts;}}window.Date=FixedDate;},Date.now());
 await page.goto(base+'?production=1');await page.evaluate(()=>ensureCivilizationScriptGroup('gm'));await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready'&&typeof openGm3DPrototype==='function');await finishIntro(page);
 await assertStartupSprites(page,requests);assert.equal(await page.evaluate(()=>{state.gm=false;return openGm3DPrototype();}),false);
 await page.evaluate(()=>{state.gm=true;openGm3DPrototype();});
 const frame=page.frameLocator('#gm3dPrototypeOverlay iframe');await frame.locator('canvas[data-suit]').waitFor();
 await page.waitForTimeout(1200);const truth=await page.evaluate(()=>JSON.stringify(state)),storage=await page.evaluate(()=>JSON.stringify(localStorage));
 assert.equal(await frame.locator('[data-mode],[data-pick="suit"]').count(),0,'no retired equipment controls');
 assert.equal(await frame.locator('#categoryList,#caseList,#caseSearch').count(),0);assert.equal(await frame.locator('[data-target]').count(),1);await frame.locator('[data-speed]').selectOption('0.5');await frame.locator('[data-replay]').click();await frame.locator('[data-speed]').selectOption('1');
 for(const id of ['era-galaxy','era-universe','era-higher']){
  await frame.locator('[data-era]').selectOption(id);await frame.locator(`canvas[data-suit="${id}"]`).waitFor();
  for(const action of ['idle','attack','hit','dodge','return','defeat']){
   await frame.locator(`[data-action="${action}"]`).click();
   await frame.locator('canvas').evaluate((c,action)=>new Promise((resolve,reject)=>{const end=performance.now()+5000;function poll(){let n=0;const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<a.length;i+=4)if(a[i]>16)n++;if(c.dataset.clip===action&&(action==='defeat'?n===0:n>500))return resolve();if(performance.now()>end)return reject(Error('raster '+action));requestAnimationFrame(poll);}poll();}),action);
  }
  await frame.locator('[data-action="idle"]').click();
  assert.equal(await frame.locator('[data-scale],[data-direction],[data-viewport]').count(),0,'retired GM presentation controls stay removed');
  const box=await frame.locator('canvas').boundingBox();assert.ok(box.width>100&&box.width<viewport.width);
 }
 await frame.locator('[data-advanced] summary').first().click();await frame.locator('[data-missing]').click();await frame.locator('[data-status]').filter({hasText:'安全回退'}).waitFor();assert.equal(await frame.locator('canvas').count(),0);
 await frame.locator('[data-reload]').click();await frame.locator('canvas[data-suit]').waitFor();
 // Rapid selection cancels obsolete requests and leaves exactly one canvas/lease.
 for(let i=0;i<12;i++)await frame.locator('[data-era]').selectOption(['era-galaxy','era-universe','era-higher'][i%3]);
 await frame.locator('canvas[data-suit="era-higher"]').waitFor();await page.waitForTimeout(350);
 const diag=JSON.parse(await frame.locator('[data-diagnostics]').innerText());assert.equal(diag.refs,1);assert.equal(diag.pending,0);assert.equal(diag.canvases,1);assert.equal(diag.rafs,1);assert.ok(diag.bytes<=diag.limit);
 await frame.locator('#maximizePreview').click();assert.equal(await frame.locator('body').evaluate(e=>e.classList.contains('gm-3d-maximized')),true);await frame.locator('#maximizePreview').click();
 const delta=await page.evaluate(t=>{const a=JSON.parse(t),out=[];function walk(a,b,p=''){if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],p+'.'+k);}else if(a!==b)out.push({p,a,b});}walk(a,state);return out;},truth);assert.deepEqual(delta,[],'GM state isolation');assert.equal(await page.evaluate(t=>JSON.stringify(localStorage)===t,storage),true,'GM persistence isolation');
 await page.screenshot({path:`/tmp/gm-phase4-${viewport.width}.png`,fullPage:true});
 await page.evaluate(()=>{state.gm=false;});await frame.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor({timeout:10000});assert.equal(await frame.locator('canvas').count(),0);const revoked=JSON.parse(await frame.locator('[data-diagnostics]').innerText());assert.equal(revoked.refs,0);assert.equal(revoked.bytes,0);
 await page.evaluate(()=>{closeGm3DPrototype();state.gm=true;openGm3DPrototype();});await frame.locator('canvas[data-suit]').waitFor();assert.equal(await frame.locator('#categoryList,#caseList,#caseSearch').count(),0,'single direct interface');await frame.locator('body').evaluate(()=>Civilization3DTestCenter.selectCase('C-15-BATTLE'));assert.equal(await frame.locator('.gm-suit').count(),0);await frame.locator('body').evaluate(()=>Civilization3DTestCenter.selectCase('C-08-CHARACTER'));await frame.locator('canvas[data-suit="era-galaxy"]').waitFor();
 await page.evaluate(()=>closeGm3DPrototype());assert.equal(await page.locator('#gm3dPrototypeOverlay').count(),0);assert.deepEqual(errors,[]);reports.push({viewport,diag,revoked,requests,errors});await page.close();console.log('PASS GM era center',viewport.width);
}
const denied=await browser.newPage();await denied.goto(new URL('3d-test/?embedded=1',base).href);await denied.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor();assert.equal(await denied.locator('canvas').count(),0);await denied.close();
}finally{await browser.close();}fs.writeFileSync('/tmp/equipment-gm-era-browser.json',JSON.stringify({passed:true,realDevice:false,reports},null,2));})().catch(e=>{console.error(e);process.exitCode=1;});
