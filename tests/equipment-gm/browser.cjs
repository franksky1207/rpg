'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4188/index.html';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--no-sandbox']});let checks=0;
 const check=(value,message)=>{assert.ok(value,message);checks++;};
 try{
  for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:844,height:390}].filter(v=>!process.env.GM_TEST_WIDTH||v.width===Number(process.env.GM_TEST_WIDTH))){
   const page=await browser.newPage({viewport}),errors=[],spriteRequests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/gm-equipment-2_5d.*webp/.test(r.url()))spriteRequests.push(r.url());});
   await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
   await page.addInitScript(()=>localStorage.setItem('civilization-war-presentation-mode-v1:t1a-snapshot-test','text'));
   await page.goto(base+(base.includes('?')?'&':'?')+'production=1',{waitUntil:'domcontentloaded',timeout:60000});
   await page.evaluate(()=>ensureCivilizationScriptGroup('gm'));
   await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready'&&typeof openGm3DPrototype==='function',null,{timeout:60000});
   await finishIntro(page);
   await page.evaluate(()=>{const ts=JSON.parse(localStorage.getItem('frank_text_rpg_offline_checkpoint')).ts;Date.now=()=>ts;});
   check(spriteRequests.length===0,'no sprite load on game startup');
   check(await page.evaluate(()=>{state.gm=false;return openGm3DPrototype()===false;}),'non GM denied');
   await page.evaluate(()=>{state.gm=true;openGm3DPrototype();});const frame=page.frameLocator('#gm3dPrototypeOverlay iframe');
   await frame.locator('#caseList').getByRole('button',{name:'角色與五種動作',exact:true}).click();
   await frame.locator('.gm-suit-status').filter({hasText:/回退|待製作/}).waitFor();
   const truth=await page.evaluate(()=>JSON.stringify(state)),storage=await page.evaluate(()=>JSON.stringify(localStorage));
   await frame.locator('[data-mode="free"]').click();await frame.locator('[data-pick="suit"] option[value="g005"]').waitFor({state:'attached'});
   for(const id of ['g005','g007','g018']){
    if(id==='g018')await frame.locator('[data-pick="region"]').selectOption('太陽系戰爭');
    await frame.locator('[data-pick="suit"]').selectOption(id);await frame.locator('.gm-suit-status').filter({hasText:'已完成'}).waitFor();
    check(await frame.locator('.gm-suit-preview canvas').getAttribute('aria-label')===id.toUpperCase()+' 透明整套角色','correct suit');
    console.log('raster',viewport.width,id);
    const box=await frame.locator('.gm-suit-preview canvas').boundingBox();check(box.height>=240&&box.width<=viewport.width,'readable preview');
    for(const action of ['idle','attack','hit','dodge','defeat']){
     await frame.locator(`[data-action="${action}"]`).click();
     // Wait for the same exact raster condition under loaded CI scheduling.
     await frame.locator('.gm-suit-preview canvas').evaluate((c,action)=>new Promise((resolve,reject)=>{const deadline=performance.now()+5000;function poll(){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>16)n++;if(action==='defeat'?n===0:n>500)return resolve();if(performance.now()>deadline)return reject(Error('animation raster timeout '+action));requestAnimationFrame(poll);}poll();}),action);
     const visible=await frame.locator('.gm-suit-preview canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>16)n++;return n;});check(action==='defeat'?visible===0:visible>500,'actual animation raster '+action);
    }
    await frame.locator('[data-action="replay"]').click();await frame.locator('[data-action="reset"]').click();
    for(let i=0;i<8;i++)await frame.locator('[data-action="attack"]').click();await frame.locator('[data-action="dodge"]').click();
    await frame.locator('[data-action="reset"]').click();
   }
   await frame.locator('[data-pick="suit"]').selectOption('g011');await frame.locator('.gm-suit-status').filter({hasText:'待製作'}).waitFor();check(await frame.locator('.gm-suit-preview canvas').count()===0,'no invented sprite');
   // Hold valid parent replies to reproduce retry/free -> formal races deterministically.
   await frame.locator('[data-pick="region"]').selectOption('地球戰爭');await frame.locator('[data-pick="suit"]').selectOption('g007');await frame.locator('.gm-suit-status').filter({hasText:'已完成'}).waitFor();
   await page.evaluate(()=>{const win=document.querySelector('#gm3dPrototypeOverlay iframe').contentWindow,send=win.postMessage.bind(win);win.__originalSpritePost=win.postMessage;win.postMessage=(message,origin)=>{const delay=message?.type==='civilization3d:sprite-auth-response'?200:message?.type==='civilization3d:sprite-snapshot-response'?600:0;if(delay)setTimeout(()=>send(message,origin),delay);else send(message,origin);};});
   await frame.getByRole('button',{name:'重新載入／同步'}).click();
   await frame.locator('[data-mode="formal"]').click();await frame.locator('.gm-suit-status').filter({hasText:/回退|待製作/}).waitFor();check(await frame.locator('.gm-suit-preview canvas').count()===0,'formal no stale free suit');
   await page.waitForTimeout(300);check(await frame.locator('.gm-suit-preview canvas').count()===0,'late free retry cannot overwrite formal mode');
   await frame.locator('[data-pick=suit]').evaluate(e=>{e.value='g005';e.dispatchEvent(new Event('change'));});check(await frame.locator('.gm-suit-preview canvas').count()===0,'hidden free selector cannot change formal suit');
   await page.evaluate(()=>{const win=document.querySelector('#gm3dPrototypeOverlay iframe').contentWindow;win.postMessage=win.__originalSpritePost;});
   check(spriteRequests.length<=9,'cached sprite reuse');
   check(await page.evaluate(t=>JSON.stringify(state)===t,truth),'state unchanged');check(await page.evaluate(t=>JSON.stringify(localStorage)===t,storage),'storage unchanged');
   // Test-only real equipment setup, then exercise the real authoritative capture bridge.
   await page.evaluate(async()=>{const c=await(await fetch('assets/gm-equipment-2_5d/v1/catalog.json')).json(),e=c.sets.find(e=>e.id==='g007');state.equipment=Object.fromEntries(Object.entries(e.equipmentNames).map(([slot,name])=>[slot,{name,world:1,q:1,level:1}]));});
   await frame.getByRole('button',{name:'重新載入／同步'}).click();await frame.locator('.gm-suit-status').filter({hasText:'已完成'}).waitFor();check((await frame.locator('.gm-suit-name').innerText()).includes('G007'),'actual formal equipped suit');
   // Capture the actual scroll at the click event, after Playwright's actionability scrolling.
   await frame.locator('#maximizePreview').scrollIntoViewIfNeeded();await frame.locator('#maximizePreview').evaluate(button=>button.addEventListener('click',()=>{window.__maximizeScrollBefore=scrollY;},{capture:true,once:true}));await frame.locator('#maximizePreview').click();const beforeScroll=await frame.locator('body').evaluate(()=>window.__maximizeScrollBefore);check(await frame.locator('body').evaluate(e=>e.classList.contains('gm-3d-maximized')),'maximize');await frame.locator('#maximizePreview').click();await page.waitForTimeout(250);const afterScroll=await frame.locator('body').evaluate(()=>scrollY);console.log('scroll restore',viewport.width,beforeScroll,afterScroll);check(Math.abs(afterScroll-beforeScroll)<5,'restore scroll');
   await page.evaluate(()=>{state.gm=false;});await frame.locator('.gm-suit-status').filter({hasText:'需要 GM 授權'}).waitFor({timeout:10000});check(await frame.locator('.gm-suit-preview canvas').count()===0,'revocation clears sprite');
   await page.evaluate(()=>closeGm3DPrototype());check(await page.locator('#gm3dPrototypeOverlay').count()===0,'closed');
   await page.evaluate(()=>{state.gm=true;openGm3DPrototype();});await frame.locator('.gm-suit-status').filter({hasText:'已完成'}).waitFor();
   check(await frame.locator('#caseList .center-case').count()===1,'one battle preview');check(errors.length===0,JSON.stringify(errors));
   // Only screenshot capture may re-resolve after the async auth refresh replaces the panel.
   // Assertion failures and every other screenshot error still fail immediately.
   for(let captureAttempt=0;;captureAttempt++){
    try{await frame.locator('.gm-suit').screenshot({path:`/tmp/gm-panel-${viewport.width}.png`});break;}
    catch(error){
     if(captureAttempt>=2||!/Element is not attached|Element is not connected|element was detached/i.test(error.message))throw error;
     await frame.locator('.gm-suit-status').filter({hasText:'已完成'}).waitFor();
    }
   }
   await frame.locator('#categoryList').getByRole('button',{name:/戰場與對戰/}).click();check(await frame.locator('.gm-suit').count()===0,'category switch removes sprite state');await frame.locator('#categoryList').getByRole('button',{name:/角色與動作/}).click();await frame.locator('.gm-suit-status').filter({hasText:/已完成|回退|待製作/}).waitFor({timeout:30000});check(await frame.locator('[data-mode=free]').getAttribute('aria-pressed')==='false','reenter resets formal mode');
   if(viewport.width===1365){
    for(const fault of ['404','sha','decode']){
     await page.evaluate(()=>{closeGm3DPrototype();openGm3DPrototype();});
     await page.route('**/gm-equipment-2_5d/v1/g005.webp',async route=>{if(fault==='404')return route.fulfill({status:404});const r=await route.fetch(),raw=await r.body();if(fault==='sha'){raw[20]^=255;return route.fulfill({response:r,body:raw});}return route.fulfill({response:r,body:raw});});
     if(fault==='decode')await page.addInitScript(()=>{window.createImageBitmap=async()=>{throw Error('injected decoder failure');};});
     if(fault==='decode')await page.evaluate(()=>{closeGm3DPrototype();openGm3DPrototype();});
     await frame.locator('#caseList').getByRole('button',{name:'角色與五種動作',exact:true}).click();await frame.locator('.gm-suit-status').filter({hasText:fault==='decode'?'載入失敗':'已完成'}).waitFor();
     await frame.locator('[data-mode=free]').click();await frame.locator('[data-pick=suit]').selectOption('g005');await frame.locator('.gm-suit-status').filter({hasText:'載入失敗'}).waitFor();check(await frame.locator('.gm-suit-preview canvas').count()===0,'safe '+fault+' fallback');
     await page.unroute('**/gm-equipment-2_5d/v1/g005.webp');
    }
   }
   await page.screenshot({path:`/tmp/gm-phase4-${viewport.width}.png`,fullPage:true});await page.close();
  }
  // Direct URL cannot obtain published sprites by pretending to be embedded.
  const denied=await browser.newPage();await denied.goto(new URL('3d-test/?embedded=1',base).href);await denied.locator('#caseList').getByRole('button',{name:'角色與五種動作',exact:true}).click();await denied.locator('.gm-suit-status').filter({hasText:'需要 GM 授權'}).waitFor();check(await denied.locator('.gm-suit-preview canvas').count()===0,'direct page denied');await denied.close();
  console.log('PASS GM published browser:',checks,'assertions, desktop/portrait/landscape, three real sprites, five actions, formal/free, revoke, reopen');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
