'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=new URL('./',process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html');
const report={auth:'isolated SDK session fixture; no real account or cloud save operations',pageErrors:[],cases:[]};
const sdk=`window.supabase={createClient(){return{auth:{onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},async getSession(){return{data:{session:{user:{id:'batch27-preview-test'}}},error:null}}},from(){return{select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})}}}}}};`;
const metadata=page=>page.evaluate(()=>BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter)?.metadata.civilization3dCharacter);
const waitModel=(page,quality,source=null,world=null)=>page.waitForFunction(q=>{
 const s=window.BABYLON?.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter?.assetKind==='skinned-glb');
 const m=s?.metadata.civilization3dCharacter;
 return m&&m.quality===q.quality&&(!q.source||m.appearanceSource===q.source)&&(!q.world||m.world===Number(q.world));
},{quality,source,world},{timeout:60000});
const identity=page=>page.evaluate(()=>JSON.stringify({level:state.level,vip:state.vipLevel,equipment:state.equipment,inventory:state.inventory,enhancement:state.enhancement,second:state.secondWorld,third:state.thirdWorld,reincarnation:state.reincarnation,gm:state.gm,audio:localStorage.getItem('civilization.audio.preferences.v1')}));
async function finishIntro(page){
 await page.locator('#civilizationStoryModal.open').waitFor({state:'visible',timeout:60000});
 const actions=page.locator('#civilizationStoryModal #storyActions');
 for(let i=0;i<100;i++){
  const end=actions.getByRole('button',{name:'結束',exact:true});
  if(await end.count()){
   await end.click();await page.locator('#civilizationStoryModal.open').waitFor({state:'hidden'});
   await page.locator('#civilizationStarterGearModal').getByRole('button',{name:'領取裝備',exact:true}).click();
   await page.locator('#civilizationStarterGearModal').waitFor({state:'hidden'});
   await page.locator('#gameIntroModal.show').waitFor({state:'visible'});
   await page.locator('#gameIntroModal').getByRole('button',{name:'踏上征途',exact:true}).click();
   await page.locator('#gameIntroModal.show').waitFor({state:'hidden'});return;
  }
  await actions.getByRole('button',{name:'下一頁',exact:true}).click();
 }
 throw new Error('Intro did not reach its actual completion button');
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk}));
  const page=await context.newPage();page.on('pageerror',e=>report.pageErrors.push(String(e)));
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');let transferred=0,modelRequests=0;
  cdp.on('Network.loadingFinished',e=>transferred+=e.encodedDataLength);
  page.on('request',r=>{if(/\.glb(?:\?|$)/.test(r.url()))modelRequests++;});
  await page.goto(new URL('index.html',base).href,{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready',null,{timeout:60000});
  report.homeAtReadyTransferredBytes=transferred;
  await page.locator('#civilizationModeChooseText').click();
  await finishIntro(page);console.log('PASS actual intro completed');
  assert.equal(modelRequests,0,'text startup must not request any GLB');report.homeTransferredBytes=transferred;
  await page.evaluate(()=>go('character'));console.log('Character UI entered');const truth=await identity(page);const before=transferred;console.log('Readonly truth captured');
  await page.locator('#civilization3dCharacterToggle').click();console.log('Character UI preview clicked');await waitModel(page,'medium');console.log('PASS medium GLB loaded');
  const model=await metadata(page);assert.equal(model.appearanceSource,'formal');assert.equal(model.assetId,'player.foundation.v1.medium');assert.equal(model.bones,53);assert.equal(Object.keys(model.sockets).length,5);
  assert.equal(model.modelDescriptors.length,5,'retain authoritative equipped descriptors, including empty slots');
  await page.waitForFunction(()=>{
   const s=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter?.assetKind==='skinned-glb');
   return s?.isReady()&&s.textures.every(t=>t.isReady());
  },null,{timeout:60000});
  console.log('Checking PBR/animation readiness');const loaded=await page.evaluate(async()=>{
   const s=BABYLON.EngineStore.Instances.flatMap(e=>e.scenes).find(s=>s.metadata?.civilization3dCharacter?.assetKind==='skinned-glb');
   s.render();const mesh=s.meshes.find(m=>m.skeleton&&m.getTotalVertices()>0),group=s.animationGroups[0];
   group.pause();group.goToFrame(0);s.render();mesh.skeleton.prepare();const first=Array.from(mesh.skeleton.getTransformMatrices(mesh));
   group.goToFrame(15);s.render();mesh.skeleton.prepare();const next=Array.from(mesh.skeleton.getTransformMatrices(mesh));group.play(true);
   return {moved:first.some((v,i)=>Math.abs(v-next[i])>.0001),pbr:s.materials.filter(m=>m instanceof BABYLON.PBRMaterial).length,textures:s.textures.filter(t=>t.getSize().width===512).length};
  });
  assert.equal(loaded.moved,true,'animation must deform the real skeleton');assert.equal(loaded.pbr,5);assert.ok(loaded.textures>=1);
  console.log('PASS deforming skeleton/PBR');report.characterFirstTransferredBytes=transferred-before;report.characterFirst=await page.evaluate(()=>Civilization3DCharacterAssets.snapshot());
  await page.locator('#civilization3dFormalHost').screenshot({path:'/tmp/rpg-b27-character-desktop.png',timeout:60000});
  await page.locator('#civilization3dFormalHost').getByRole('button',{name:'關閉 3D 預覽',exact:true}).click();
  assert.equal(await page.evaluate(()=>Civilization3DCharacterAssets.snapshot().containers),0);
  const hotBefore=transferred,hotRequests=modelRequests;
  await page.locator('#civilization3dCharacterToggle').click();await waitModel(page,'medium');
  report.characterHotTransferredBytes=transferred-hotBefore;assert.equal(modelRequests,hotRequests,'same-page reopen must reuse verified CPU bytes');
  await page.evaluate(()=>civilization3dToggleCharacter());
  for(let i=0;i<10;i++){await page.evaluate(()=>civilization3dToggleCharacter());await waitModel(page,'medium');await page.evaluate(()=>civilization3dToggleCharacter());assert.equal(await page.evaluate(()=>Civilization3DCharacterAssets.snapshot().containers),0);}
  await page.setViewportSize({width:390,height:844});await page.locator('#civilization3dCharacterToggle').click();await waitModel(page,'low');
  report.mobile=await metadata(page);assert.equal(report.mobile.assetId,'player.foundation.v1.low');
  await page.locator('#civilization3dFormalHost').getByRole('button',{name:'放大 3D 預覽',exact:true}).click();
  await page.locator('#civilization3dFormalHost').getByRole('button',{name:'還原 3D 預覽',exact:true}).click();
  await page.locator('#civilization3dFormalHost').screenshot({path:'/tmp/rpg-b27-character-mobile.png',timeout:60000});
  await page.setViewportSize({width:844,height:390});assert.equal(await page.locator('#civilization3dFormalHost canvas').count(),1);
  const lost=await page.evaluate(()=>{const e=BABYLON.EngineStore.Instances[0],ext=e?._gl?.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;});assert.equal(lost,true,'software WebGL must expose context loss for this test');
  await page.waitForFunction(()=>document.querySelector('#civilization3dFormalHost')?.hidden===true);
  assert.equal(await page.evaluate(()=>Civilization3DCharacterAssets.snapshot().containers),0);assert.equal(await identity(page),truth);
  report.released=await page.evaluate(()=>({assets:Civilization3DCharacterAssets.snapshot(),engines:BABYLON.EngineStore.Instances.length,jsHeapUsedBytes:performance.memory?.usedJSHeapSize||null}));assert.equal(report.released.engines,0);assert.ok(report.released.assets.cachedBuffers<=2);
  report.cases.push('formal readonly source, real PBR/skin animation, 10 reopens, mobile low LOD, landscape, actual context loss and release');
  await context.close();

  // Real authorized iframe bridge with an isolated SDK/GM fixture. The parent
  // capture() and same-origin message receiver are production implementations.
  const gmContext=await browser.newContext();await gmContext.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',r=>r.fulfill({status:200,contentType:'text/javascript',body:sdk}));
  await gmContext.addInitScript(()=>{localStorage.setItem('civilization-war-gm-authorized-v2-account-batch27-preview-test','1');localStorage.setItem('civilization-war-presentation-mode-v1:batch27-preview-test','text');});
  const gm=await gmContext.newPage();gm.on('pageerror',e=>report.pageErrors.push(String(e)));
  await gm.goto(new URL('index.html',base).href,{waitUntil:'load'});await gm.waitForFunction(()=>window.CivilizationStartupCoordinator?.snapshot().status==='ready'&&typeof openGm3DPrototype==='function',null,{timeout:60000});
  await finishIntro(gm);console.log('PASS GM intro completed');
  const gmTruth=await identity(gm);assert.equal(await gm.evaluate(()=>openGm3DPrototype()),true);
  await gm.waitForFunction(()=>document.querySelector('#gm3dPrototypeOverlay iframe')?.contentWindow?.Civilization3DTestCenter?.version===5,null,{timeout:60000});
  const frame=gm.frames().find(f=>f.url().includes('/3d-test/'));
  await frame.waitForFunction(()=>window.Civilization3DTestCenter?.version===5,null,{timeout:60000});
  await frame.locator('#categoryList .center-category').filter({hasText:'玩家、裝備與養成'}).click();await frame.locator('#caseList').getByRole('button',{name:'角色全身展示',exact:true}).click();await waitModel(frame,'medium');
  assert.equal((await metadata(frame)).appearanceSource,'formal');assert.equal(await frame.evaluate(()=>Civilization3DTestCenter.getFixture().formalAppearanceReady),true);
  await frame.locator('#appearanceDetails summary').click();await frame.locator('#appearanceFree').click();await waitModel(frame,'medium','fixture');assert.equal((await metadata(frame)).appearanceSource,'fixture');
  for(const world of ['1','2','3']){await frame.locator('#appearanceWorld').selectOption(world);await waitModel(frame,'medium','fixture',world);}
  await frame.locator('#quality').selectOption('high');await waitModel(frame,'high');assert.equal((await metadata(frame)).assetId,'player.foundation.v1.high');
  await frame.locator('#appearanceFormal').click();await waitModel(frame,'high','formal');assert.equal((await metadata(frame)).appearanceSource,'formal');assert.equal(await identity(gm),gmTruth);
  await gm.locator('#gm3dPrototypeOverlay').getByRole('button',{name:'← 返回原本畫面',exact:true}).click();assert.equal(await gm.locator('#gm3dPrototypeOverlay').count(),0);
  report.cases.push('authorized GM iframe formal capture, free fixture, three eras, high LOD, source isolation and close');await gmContext.close();

  // Fault injection must show honest geometry fallback, never a GLB success.
  const faulty=await browser.newContext();await faulty.route('**/player-*.glb*',r=>r.fulfill({status:503,body:'injected model failure'}));const fail=await faulty.newPage();
  fail.on('pageerror',e=>report.pageErrors.push(String(e)));
  await fail.goto(new URL('3d-test/',base).href);await fail.waitForFunction(()=>window.Civilization3DTestCenter?.version===5);
  await fail.locator('#categoryList .center-category').filter({hasText:'玩家、裝備與養成'}).click();await fail.locator('#caseList').getByRole('button',{name:'角色全身展示',exact:true}).click();
  await fail.waitForFunction(()=>document.querySelector('[data-character-asset-kind="geometry-fallback"]'),null,{timeout:60000});
  assert.equal((await metadata(fail)).assetKind,'geometry-fallback');assert.equal(await fail.locator('#status').isVisible(),true);assert.match(await fail.locator('#status').innerText(),/替代外觀/);
  report.cases.push('failed GLB explicit geometry fallback');await faulty.close();
  assert.deepEqual(report.pageErrors,[]);report.passed=true;console.log('PASS Batch 27 actual skinned GLB, formal/GM sources, LOD, on-demand reuse, animation, context loss, fallback and release');
 }catch(error){report.passed=false;report.error=String(error.stack||error);throw error;}
 finally{fs.writeFileSync('3d-player-browser-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
