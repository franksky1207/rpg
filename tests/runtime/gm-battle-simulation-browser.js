'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const reports=[];
 try{for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:844,height:390}].filter(v=>!process.env.GM_B_WIDTH||v.width===Number(process.env.GM_B_WIDTH))){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push(r.url()));
 await page.goto(new URL('3d-test/',base).href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>Civilization3DTestCenter?.version===5);
 assert.equal(await page.locator('#caseList .center-case').count(),31);assert.equal(await page.evaluate(()=>Civilization3DTestCenter.categoryIds.length),8);
 const stored=await page.evaluate(()=>JSON.stringify(localStorage));
 await page.locator('#caseList').getByRole('button',{name:'2.5D 戰鬥模擬',exact:true}).click();
 const ready=async()=>page.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==='true'&&!document.querySelector('[data-b="play"]').disabled,null,{timeout:90000});
 await ready();const diag=()=>page.evaluate(()=>{const d=document.getElementById('prototypeHost').__gmBattleSimulation.diagnostics();return {scheme:d.scheme,failed:d.failed,rendererLoading:d.rendererLoading,playback:d.playback,resources:d.renderer,current:d.current,mode:d.frame?.mode,caseId:d.frame?.selection?.caseId};});
 assert.equal((await diag()).current.actorKinds.player,'NativeActor');assert.equal((await diag()).current.actorKinds.enemy,'AtlasActor');
 assert.equal(await page.locator('[data-b="scheme"]').count(),0);assert.equal(await page.locator('#scenarioFormal').isVisible(),false,'simulation cannot imply formal snapshot input');
 const cases=[];
 for(const id of ['normal-baseline','elite-baseline','boss-baseline','boss-player-defeat','elite-effects-owner-input']){
  await page.locator('[data-b="clip"]').selectOption('source');await page.locator('[data-b="case"]').selectOption(id);await ready();await page.locator('[data-b="play"]').click();
  await page.waitForFunction(()=>document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics().frame?.mode==='playing',null,{timeout:10000}).catch(async error=>{console.error('play did not start',id,await diag());throw error;});
  assert.equal(await page.locator('[data-b="pause"]').isEnabled(),true);await page.locator('[data-b="pause"]').click({force:true}).catch(async error=>{console.error('pause failure',id,await diag(),await page.evaluate(()=>({paused:document.querySelector('[data-b="pause"]').disabled,play:document.querySelector('[data-b="play"]').disabled,hidden:document.hidden})));await page.screenshot({path:'/tmp/gm-pause-failure.png'});throw error;});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const paused=await diag();await page.waitForTimeout(180);assert.equal((await diag()).playback.generation,paused.playback.generation);assert.equal((await diag()).mode,'paused');assert.deepEqual((await diag()).current.plan.roles,paused.current.plan.roles,'paused Renderer pose remains frozen');
  await page.locator('[data-b="resume"]').click();assert.equal((await diag()).mode,'playing');
  await page.waitForFunction(()=>document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics().current?.sourceFrames>0&&document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics().current?.cueFrames>0,null,{timeout:15000}).catch(async error=>{console.error('GM B playback failure',id,viewport,await diag());throw error;});

  if(id==='normal-baseline'){
   // Regression: actual recorded hits must change both HP displays before the outcome.
   await page.waitForFunction(()=>{
    const host=document.querySelector('#prototypeHost'),api=host?.__gmBattleSimulation,frame=api?.diagnostics().frame;
    const hp=role=>Number(host.querySelector('[data-b="'+role+'-bar"]')?.value);
    return frame?.mode==='playing'&&hp('player')<1600&&hp('enemy')<975;
   },null,{timeout:20000});
   assert.match(await page.locator('[data-b="player-hp"]').innerText(),/模擬/);
   assert.match(await page.locator('[data-b="enemy-hp"]').innerText(),/模擬/);
  }
  await page.locator('[data-b="clip"]').selectOption('attack');await page.locator('[data-b="time"]').evaluate(e=>{e.value='300';e.dispatchEvent(new Event('input',{bubbles:true}));});
  // Inspect the actual asynchronously rendered frame, not the previous source
  // event's pose after an arbitrary 60ms sleep on a software GPU.
  await page.waitForFunction(()=>{const plan=document.getElementById('prototypeHost').__gmBattleSimulation?.diagnostics().current?.plan,time=Number(document.querySelector('[data-b="time"]').value);return plan?.inspection===true&&plan.roles.player.clip==='attack'&&Math.abs(plan.roles.player.ms-time)<1e-6;},null,{timeout:15000});
  const current=(await diag()).current;assert.equal(current.scheme,'B');assert.equal(current.plan.roles.player.clip,'attack');assert.ok(current.frames>1);cases.push({id,actors:current.actorKinds,frames:current.frames,sourceFrames:current.sourceFrames,cueFrames:current.cueFrames});
  await page.locator('[data-b="stop"]').click();assert.equal((await diag()).resources.engines,0);assert.equal((await diag()).resources.rafs,0);
 }
 const appearances=[];
 for(const tier of ['low','medium','high']){
  await page.locator('[data-b="lod"]').selectOption(tier);await ready();assert.equal((await diag()).resources.engines,1);
  for(const variant of ['g007-subset-0','g007-subset-1','g007-subset-2','g007-subset-4','g007-subset-8','g007-subset-16','g007-subset-31','mixed-g006-g007-empty-accessory']){
   await page.locator('[data-b="equipment"]').selectOption(variant);await ready();const d=await diag();const expected=variant.endsWith('-0')?0:variant.endsWith('-31')?5:variant.startsWith('mixed')?3:1;assert.equal(d.current.mounted.length,expected);appearances.push({tier,variant,mounted:d.current.mounted});
  }
 }
 await page.locator('[data-b="equipment"]').selectOption('g007-subset-0');await page.locator('[data-b="equipment"]').selectOption('g007-subset-31');await ready();assert.equal((await diag()).current.mounted.length,5,'late old load cannot overwrite newest equipment');
 await page.locator('[data-b="replay"]').click();await page.waitForFunction(()=>document.getElementById('prototypeHost').__gmBattleSimulation.diagnostics().frame.mode==='playing');
 await page.locator('#maximizePreview').scrollIntoViewIfNeeded();
 const scroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));await page.locator('#maximizePreview').click();assert.equal(await page.evaluate(()=>Civilization3DTestCenter.isMaximized()),true);
 const bounds=await page.evaluate(()=>({overflow:document.querySelector('.gm-b-simulation').scrollWidth-document.querySelector('.gm-b-simulation').clientWidth,buttons:[...document.querySelectorAll('.gm-b-buttons button')].map(b=>{const r=b.getBoundingClientRect();return [r.left,r.right];})}));assert.ok(bounds.overflow<=2);assert.ok(bounds.buttons.every(([l,r])=>l>=0&&r<=viewport.width+1));
 await page.locator('#maximizePreview').click();await page.waitForFunction(({x,y})=>Math.abs(scrollX-x)<1&&Math.abs(scrollY-y)<1,scroll,{timeout:5000});const restored=await page.evaluate(()=>({x:scrollX,y:scrollY}));assert.deepEqual(restored,scroll);
 await page.locator('#gmBattleViewPicker').getByRole('button',{name:'戰場與生命顯示',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#prototypeHost [data-state="active"]'));assert.equal(await page.evaluate(()=>BABYLON.EngineStore.Instances.length),1);
 await page.locator('#caseList').getByRole('button',{name:'三紀元主畫面',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#prototypeHost [data-state="active"]'));assert.equal(await page.locator('.gm-b-simulation').count(),0);
 assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),stored);assert.ok(!requests.some(u=>/auth\/|rest\/v1|cloudsave/.test(u)));assert.equal(requests.filter(u=>new URL(u).pathname==='/vendor/babylonjs/7.54.3/babylon.js').length,1,'GM reuses one local engine download');assert.deepEqual(errors,[]);
 reports.push({viewport,cases,appearances,bounds,restored,engineReuse:true,saveUnchanged:true});console.log('PASS actual GM B five cases, slots/LOD, controls, mobile maximum/return',viewport);await context.close();

 }
 // Exercise the real authorized parent/iframe bridge with a disposable SDK user.
 const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'gm-b-sandbox-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
 const context=await browser.newContext({viewport:{width:390,height:844}}),parent=await context.newPage(),errors=[];
 await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
 await context.addInitScript(()=>{localStorage.setItem('civilization-war-gm-authorized-v2-account-gm-b-sandbox-test','1');localStorage.setItem('civilization-war-presentation-mode-v1:gm-b-sandbox-test','text');});
 parent.on('pageerror',e=>errors.push(String(e)));await parent.goto(base,{waitUntil:'domcontentloaded'});await parent.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready'&&typeof openGm3DPrototype==='function',null,{timeout:60000});
 await parent.locator('#civilizationStoryModal.open').waitFor({state:'visible',timeout:60000});
 for(let i=0;i<100;i++){const actions=parent.locator('#civilizationStoryModal #storyActions');const end=actions.getByRole('button',{name:'結束',exact:true});if(await end.count()){await end.click();await parent.locator('#civilizationStarterGearModal').getByRole('button',{name:'領取裝備',exact:true}).click();await parent.locator('#gameIntroModal').getByRole('button',{name:'踏上征途',exact:true}).click();break;}await actions.getByRole('button',{name:'下一頁',exact:true}).click();}
 const identity=()=>parent.evaluate(()=>JSON.stringify({level:state.level,hp:state.hp,exp:state.exp,gold:state.gold,inventory:state.inventory,equipment:state.equipment,specializations:state.specializations,thirdWorld:state.thirdWorld,secondWorld:state.secondWorld,reincarnation:state.reincarnation}));
 const truth=await identity();await parent.evaluate(()=>{window.__gmBSaves=0;const owner=save;window.save=function(...args){__gmBSaves++;return owner.apply(this,args);};});
 assert.equal(await parent.evaluate(()=>openGm3DPrototype()),true);await parent.waitForFunction(()=>document.querySelector('#gm3dPrototypeOverlay iframe')?.contentWindow?.Civilization3DTestCenter?.version===5);
 const frame=parent.frames().find(f=>f.url().includes('/3d-test/'));frame.on('pageerror',e=>errors.push(String(e)));
 await frame.locator('#caseList').getByRole('button',{name:'2.5D 戰鬥模擬',exact:true}).click();await frame.waitForFunction(()=>document.querySelector('[data-b="stage"]')?.dataset.renderReady==='true',null,{timeout:90000});
 await frame.locator('#maximizePreview').click();
 await frame.waitForFunction(()=>document.getElementById('prototypeHost').__gmBattleSimulation.diagnostics().current?.frames>0,null,{timeout:15000});
 await frame.locator('[data-b="play"]').click();
 await frame.waitForFunction(()=>document.getElementById('prototypeHost').__gmBattleSimulation.diagnostics().current.sourceFrames>0,null,{timeout:15000}).catch(async error=>{console.error('authorized iframe actual-draw failure',await frame.evaluate(()=>({hidden:document.hidden,visible:document.querySelector('[data-b="stage"]').getBoundingClientRect().toJSON(),diagnostics:document.getElementById('prototypeHost').__gmBattleSimulation.diagnostics(),status:document.querySelector('[data-b="status"]').textContent})));throw error;});assert.equal(await identity(),truth);assert.equal(await parent.evaluate(()=>__gmBSaves),0);
 await parent.locator('#gm3dPrototypeOverlay').getByRole('button',{name:'← 返回原本畫面',exact:true}).click();assert.equal(await parent.locator('#gm3dPrototypeOverlay').count(),0);assert.equal(await identity(),truth);assert.deepEqual(errors,[]);reports.push({embedded:true,authorizedParent:true,formalIdentityUnchanged:true,noSaveCalls:true,returned:true});await context.close();console.log('PASS real authorized GM B iframe, formal identity/save isolation and return');
 }finally{await browser.close();}
 fs.writeFileSync(process.env.GM_B_REPORT||'/tmp/gm-battle-simulation-browser.json',JSON.stringify({passed:true,reports,physicalGPU:false},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
