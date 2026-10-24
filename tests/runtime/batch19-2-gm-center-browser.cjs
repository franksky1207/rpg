'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}),reports=[];
try{for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}]){
 const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>(errors.push(String(e)),console.log('PAGEERROR',String(e))));
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await page.addInitScript(ts=>{const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[ts]));}static now(){return ts;}};},Date.now());
 await page.goto(base+'?production=1');await page.evaluate(()=>ensureCivilizationScriptGroup('gm'));await finishIntro(page);
 await page.evaluate(()=>{state.gm=true;document.querySelector('#main').scrollTop=80;openGm3DPrototype();});
 const frame=page.frameLocator('#gm3dPrototypeOverlay iframe');await frame.locator('canvas[data-suit]').waitFor();
 await page.waitForTimeout(1200);const truth=await page.evaluate(()=>JSON.stringify(state)),storage=await page.evaluate(()=>JSON.stringify(localStorage));
 assert.equal(await frame.locator('[data-advanced]').getAttribute('open'),null);
 assert.deepEqual(await frame.locator('[data-preview-mode] option').allTextContents(),['玩家','怪物','對戰']);
 assert.deepEqual(await frame.locator('.gm-suit-actions button').allTextContents(),['待機','攻擊','受擊','閃避','回位','死亡']);
 assert.equal(await frame.locator('[data-boss-compare]').isVisible(),false);
 const enumerated=new Set(),selections=[];
 for(const era of ['era-galaxy','era-universe','era-higher']){
  await frame.locator('[data-preview-mode]').selectOption('player');
  await frame.locator('[data-era]').selectOption(era);await frame.locator(`canvas[data-suit="${era}"]`).waitFor({state:"attached"});
  for(const clip of ['idle','attack','hit','dodge','return','defeat']){await frame.locator(`[data-action="${clip}"]`).click();await frame.locator(`canvas[data-suit="${era}"][data-clip="${clip}"]`).waitFor();}
  await frame.locator('[data-preview-mode]').selectOption('monster');
  const sources=await frame.locator('[data-source] option').evaluateAll(es=>es.map(e=>e.value));
  if(era==='era-higher')assert.ok(sources.includes('arena'),'high arena retained');
  for(const source of sources){
   console.log('select',viewport.width,era,source);
   await frame.locator('[data-source]').selectOption(source);
   await frame.locator('[data-monster-status][data-ready="true"]').waitFor({state:'attached'});
   if(source==='alternate'){
    assert.equal(await frame.locator('[data-culture] option').count(),20);assert.equal(await frame.locator('[data-universe] option').count(),10);assert.equal(await frame.locator('[data-stage] option').count(),5);
    await frame.locator('[data-culture]').selectOption({index:19});await frame.locator('[data-universe]').selectOption({index:9});await frame.locator('[data-stage]').selectOption({index:4});
    await frame.locator('[data-monster-status][data-ready="true"]').waitFor({state:'attached'});
   }else{
    assert.equal(await frame.locator('[data-alternate]').isVisible(),false);
    const ids=await frame.locator('[data-identity] option').evaluateAll(es=>es.map(e=>e.value));assert.ok(ids.length);ids.forEach(id=>enumerated.add(id));
    console.log('identity',ids.length,ids.at(-1));await frame.locator('[data-identity]').selectOption({index:ids.length-1});console.log(await frame.locator('[data-monster-status]').textContent(),await frame.locator('select[data-monster]').inputValue());await frame.locator('[data-monster-status][data-ready="true"]').waitFor({state:'attached'});
   }
   for(const clip of ['idle','attack','hit','dodge','return','defeat']){
    await frame.locator(`[data-action="${clip}"]`).click();
    await frame.locator('.gm-suit-preview').evaluate((el,clip)=>new Promise((resolve,reject)=>{const end=performance.now()+1500;function check(){const c=el.querySelector('[data-monster],[data-mirror]');if(c?.dataset.clip===clip)return resolve();if(performance.now()>end)return reject(Error('monster action '+clip));requestAnimationFrame(check);}check();}),clip);
   }
   selections.push({era,source});
  }
 }
 const coverage=await frame.locator('body').evaluate(async()=>{const {mappings}=await import('./monster-sprites.mjs');return Object.values(mappings).filter(r=>r.mode!=='alternate').map(r=>r.id);});
 for(const id of coverage)assert.ok(enumerated.has(id),'missing identity '+id);
 await frame.locator('[data-preview-mode]').selectOption('duel');await frame.locator('[data-source]').selectOption('main');await frame.locator('[data-monster-status][data-ready="true"]').waitFor({state:'attached'});
 for(const [button,player,enemy] of [['data-duel','hit','attack'],['data-player-duel','attack','hit']]){
  await frame.locator(`[${button}]`).click();
  await frame.locator('canvas[data-suit]').evaluate((c,clip)=>new Promise((resolve,reject)=>{let n=0;function check(){if(c.dataset.clip===clip)return resolve();if(n++>30)return reject(Error('duel player '+clip));requestAnimationFrame(check);}check();}),player);
 }
 await frame.locator('[data-speed]').selectOption('1.5');await frame.locator('[data-replay]').click();
 assert.equal(await frame.locator('[data-monster-hud]').isVisible(),true);
 for(const mode of ['player','monster','duel']){
  await frame.locator('[data-preview-mode]').selectOption(mode);await frame.locator('canvas[data-suit]').waitFor({state:'attached'});
  await frame.locator('.gm-suit-actions').scrollIntoViewIfNeeded();
  const layout=await frame.locator('.gm-suit').evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...el.querySelectorAll('.gm-suit-actions button')].map(b=>{let r=b.getBoundingClientRect();return {w:r.width,h:r.height,left:r.left,right:r.right};}),text:el.innerText}));
  assert.equal(layout.overflow,false);assert.ok(layout.buttons.every(b=>b.h>=44&&b.left>=0&&b.right<=viewport.width));assert.doesNotMatch(layout.text,/SHA-256|512×512|實測可見倍率|解碼上限|第17批/);
  await frame.locator('[data-advanced]').evaluate(el=>el.open=true);
  assert.doesNotMatch(await frame.locator('.gm-suit').innerText(),/JSON|SHA|Pool|entries|bytes|refs|Registry|實測|使用身份|配色|bio-02/);
  assert.equal(await frame.locator('[data-missing],[data-clear-cache],[data-diagnostics]').count(),0);
  await frame.locator('[data-advanced]').evaluate(el=>el.open=false);
  await frame.locator('[data-action="idle"]').click();
  const painted=await frame.locator('.gm-suit-preview').evaluate(el=>[...el.querySelectorAll('canvas')].filter(c=>getComputedStyle(c).visibility!=='hidden').map(c=>({clip:c.dataset.clip,painted:c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((a,i)=>i%4===3&&a>16)})));assert.ok(painted.length&&painted.every(c=>c.painted),'visible actors must be painted '+JSON.stringify(painted));
  await page.evaluate(()=>window.scrollTo(0,0));await frame.locator('body').evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`/tmp/batch19-2-${viewport.width}-${mode}.png`,fullPage:false});
 }
 const description=await frame.locator('.gm-suit').evaluate(async()=>{const {mappings,registry}=await import('./monster-sprites.mjs');const row=Object.values(mappings).find(r=>r.assetId==='bio-02'&&r.mode==='calamity');return {id:row.id,expected:registry.assets.find(a=>a.assetId===row.assetId).name+'｜大小：玩家的 '+Math.round((row.visual.visibleRatio||row.visual.scale)*100)+'%'};});
 await frame.locator('[data-advanced]').evaluate(el=>el.open=true);
 await frame.locator('select[data-monster]').selectOption('bio-02');await frame.locator('[data-monster-identity]').selectOption(description.id);
 await frame.locator('[data-monster-status][data-ready="true"]').waitFor({state:'attached'});
 assert.equal(await frame.locator('[data-monster-description]').textContent(),description.expected);
 await frame.locator('[data-monster-description]').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/three-ui-gm-advanced-${viewport.width}.png`});
 await frame.locator('[data-advanced]').evaluate(el=>el.open=false);
 await frame.locator('[data-advanced] summary').first().click();assert.equal(await frame.locator('[data-clear-cache],[data-missing],[data-diagnostics]').count(),0);assert.doesNotMatch(await frame.locator('.gm-suit').innerText(),/SHA|JSON|實測|配色|使用身份|entries|bytes|refs|bio-02/);await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.clearPreviewCache());await frame.locator('canvas[data-suit]').waitFor();
 await frame.locator('.gm-suit').evaluate(el=>el.__previewTestApi.testMissing());await frame.locator('[data-status]').filter({hasText:'缺圖或驗證失敗'}).waitFor();await frame.locator('[data-reload]').click();await frame.locator('canvas[data-suit]').waitFor();
 assert.equal(await page.evaluate(()=>JSON.stringify(state)),truth);assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),storage);
 await page.evaluate(()=>state.gm=false);await frame.locator('[data-status]').filter({hasText:'需要 GM 授權'}).waitFor();assert.equal(await frame.locator('canvas').count(),0);
 await page.evaluate(()=>closeGm3DPrototype());assert.deepEqual(errors,[]);reports.push({viewport,identities:coverage.length,alternateIdentities:1000,selections,errors});await page.close();console.log('PASS batch19-2',viewport);
}fs.writeFileSync('/tmp/batch19-2-gm-center.json',JSON.stringify({passed:true,realDevice:false,reports},null,2));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
