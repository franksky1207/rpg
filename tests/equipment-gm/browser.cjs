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
 const frame=page.frameLocator('#gm3dPrototypeOverlay iframe');await frame.locator('[data-enter]:enabled').waitFor();assert.equal(await frame.locator('canvas').count(),0,'selection defers sprite loading');await frame.locator('[data-enter]').click();await frame.locator('canvas[data-suit]').waitFor();
 await page.waitForTimeout(1200);const truth=await page.evaluate(()=>JSON.stringify(state)),storage=await page.evaluate(()=>JSON.stringify(localStorage));
 assert.equal(await frame.locator('[data-mode],[data-pick="suit"]').count(),0,'no retired equipment controls');
 assert.equal(await frame.locator('#categoryList,#caseList,#caseSearch').count(),0);assert.equal(await frame.locator('[data-target]').count(),0);assert.deepEqual(await frame.locator('[data-speed] option').allTextContents(),['1×','1.5×','2×']);await frame.locator('[data-speed]').selectOption('2');await frame.locator('[data-speed]').selectOption('1');
 for(const id of ['era-galaxy','era-universe','era-higher']){
  await frame.locator('[data-back]').click();await frame.locator('[data-era]').selectOption(id);await frame.locator('[data-enter]').click();await frame.locator(`canvas[data-suit="${id}"]`).waitFor();
  for(const action of ['idle','attack','hit','dodge','return','defeat']){
   await frame.locator('[data-content]').selectOption('player:'+action);
   await frame.locator('canvas').evaluate((c,action)=>new Promise((resolve,reject)=>{const end=performance.now()+5000;function poll(){let n=0;const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<a.length;i+=4)if(a[i]>16)n++;if(c.dataset.clip===action&&(action==='defeat'?n===0:n>500))return resolve();if(performance.now()>end)return reject(Error('raster '+action));requestAnimationFrame(poll);}poll();}),action);
  }
  await frame.locator('[data-content]').selectOption('player:idle');
  assert.equal(await frame.locator('[data-scale],[data-direction],[data-viewport]').count(),0,'retired GM presentation controls stay removed');
  const painted=await frame.locator('canvas').evaluate(c=>{const stage=c.parentElement.getBoundingClientRect(),box=c.getBoundingClientRect(),n=c.width,d=c.getContext('2d').getImageData(0,0,n,n).data;let l=n,t=n,r=0,b=0;for(let i=3;i<d.length;i+=4)if(d[i]>16){let x=((i-3)/4)%n,y=Math.floor((i-3)/4/n);l=Math.min(l,x);r=Math.max(r,x+1);t=Math.min(t,y);b=Math.max(b,y+1);}return {height:(b-t)/n*box.height,contained:box.left+l/n*box.width>=stage.left&&box.right-(n-r)/n*box.width<=stage.right&&box.top+t/n*box.height>=stage.top&&box.bottom-(n-b)/n*box.height<=stage.bottom};});assert.ok(painted.height>100&&painted.contained,'actual player pixels fit the maximized stage');
 }
 await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.testMissing());await frame.locator('[data-status]').filter({hasText:'安全回退'}).waitFor({state:'attached'});assert.equal(await frame.locator('canvas').count(),0);
 await frame.locator('[data-back]').click();await frame.locator('[data-enter]').click();await frame.locator('canvas[data-suit]').waitFor();
 // Rapid settings changes decode nothing; entering keeps exactly one canvas/lease.
 await frame.locator('[data-back]').click();const priorLoads=await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.diagnostics().loads);
 for(let i=0;i<12;i++)await frame.locator('[data-era]').selectOption(['era-galaxy','era-universe','era-higher'][i%3]);
 assert.equal(await frame.locator('canvas').count(),0);assert.equal(await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.diagnostics().loads),priorLoads);await frame.locator('[data-enter]').click();await frame.locator('canvas[data-suit="era-higher"]').waitFor();await page.waitForTimeout(350);
 const diag=await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.diagnostics());assert.equal(diag.refs,1);assert.equal(diag.pending,0);assert.equal(diag.canvases,1);assert.equal(diag.rafs,1);assert.ok(diag.bytes<=diag.limit);
 assert.equal(await frame.locator('body').evaluate(e=>e.classList.contains('gm-preview-open')),true);await frame.locator('[data-back]').click();assert.equal(await frame.locator('body').evaluate(e=>e.classList.contains('gm-preview-open')),false);await frame.locator('[data-enter]').click();await frame.locator('canvas[data-suit]').waitFor();
 const delta=await page.evaluate(t=>{const a=JSON.parse(t),out=[];function walk(a,b,p=''){if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],p+'.'+k);}else if(a!==b)out.push({p,a,b});}walk(a,state);return out;},truth);assert.deepEqual(delta,[],'GM state isolation');assert.equal(await page.evaluate(t=>JSON.stringify(localStorage)===t,storage),true,'GM persistence isolation');
 await page.screenshot({path:`/tmp/gm-phase4-${viewport.width}.png`,fullPage:true});
 await page.evaluate(()=>{state.gm=false;});await frame.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor({state:'attached',timeout:10000});assert.equal(await frame.locator('canvas').count(),0);const revoked=await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.diagnostics());assert.equal(revoked.refs,0);assert.equal(revoked.bytes,0);
 await page.evaluate(()=>{closeGm3DPrototype();state.gm=true;openGm3DPrototype();});await frame.locator('[data-enter]:enabled').waitFor();await frame.locator('[data-enter]').click();await frame.locator('canvas[data-suit]').waitFor();assert.equal(await frame.locator('#categoryList,#caseList,#caseSearch').count(),0,'single direct interface');await frame.locator('body').evaluate(()=>Civilization3DTestCenter.selectCase('C-15-BATTLE'));assert.equal(await frame.locator('.gm-suit').count(),0);await frame.locator('body').evaluate(()=>Civilization3DTestCenter.selectCase('C-08-CHARACTER'));await frame.locator('[data-enter]:enabled').waitFor();await frame.locator('[data-enter]').click();await frame.locator('canvas[data-suit="era-galaxy"]').waitFor();
 await page.evaluate(()=>closeGm3DPrototype());assert.equal(await page.locator('#gm3dPrototypeOverlay').count(),0);assert.deepEqual(errors,[]);reports.push({viewport,diag,revoked,requests,errors});await page.close();console.log('PASS GM era center',viewport.width);
}
const denied=await browser.newPage();await denied.goto(new URL('3d-test/?embedded=1',base).href);await denied.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor();assert.equal(await denied.locator('canvas').count(),0);await denied.close();
}finally{await browser.close();}fs.writeFileSync('/tmp/equipment-gm-era-browser.json',JSON.stringify({passed:true,realDevice:false,reports},null,2));})().catch(e=>{console.error(e);process.exitCode=1;});
