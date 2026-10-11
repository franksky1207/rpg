/* Controlled route/DOM fixtures exercise production DOM/controller/Runtime and real factories.
   They verify hook contracts, not real progression, account transactions or combat events. */
"use strict";
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
 try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 await page.route('**/t1b-dom-fixture.html',r=>r.fulfill({contentType:'text/html',body:'<meta charset="utf-8"><body><main id="main"></main><div id="civilization3dFormalHost" style="height:300px" hidden></div><div id="civilization3dStoryHost" style="height:300px" hidden></div></body>'}));
 await page.goto(new URL('t1b-dom-fixture.html',base).href);
 await page.evaluate(()=>{
  window.__phase=1;window.__era='galaxy';window.currentWorldPhase=()=>__phase;window.getAdventureEraView=()=>__era;
  window.gmRuntimeAuthorizationAuthorized=()=>true;window.getArenaCoreState=()=>({phase:'select'});
  window.Civilization3DFormalSnapshots={galaxy:()=>({}),universe:()=>({}),higher:()=>({}),growth:()=>({growthLevels:[]}),dungeon:()=>({dungeonVisibleModes:['arena'],dungeonAvailableModes:[false,true,false,false]}),calamity:()=>({}),alternate:()=>({}),battle:()=>({battleAvailable:true,playerHpRatio:.8,enemyHpRatio:.5,shieldRatio:.2})};
 });
 for(const file of ['shared-loader.js','formal-dom.js','formal-home.js'])await page.addScriptTag({url:new URL('3d-test/'+file,base).href});
 const fixtures=[
 ['adventure',1,'galaxy','<section class="map-screen"><div class="world-region-list"></div></section>','civilization3dGalaxyToggle'],
 ['adventure',2,'galaxy-review','<section class="galaxy-review-adventure-screen"><div class="galaxy-review-region-list"></div></section>','civilization3dGalaxyToggle'],
 ['adventure',2,'universe','<section class="universe-adventure-screen"><div class="universe-region-list"></div></section>','civilization3dUniverseToggle'],
 ['adventure',3,'universe-review','<section class="universe-adventure-screen"><div class="universe-region-list"></div></section>','civilization3dUniverseToggle'],
 ['adventure',3,'higher-dimensional','<section class="third-world-adventure-screen"><div class="map-grid"><div class="third-world-boss-card"></div></div></section>','civilization3dHigherToggle'],
 ['calamity',1,'','<section class="calamity-shell calamity-home"><div class="calamity-mark-grid"></div></section>','civilization3dFrontierToggle'],
 ['alternateuniverse',3,'','<section class="alternate-universe-page"></section>','civilization3dFrontierToggle'],
 ['dungeon',2,'','<section class="dungeon-page-shell"><div class="dungeon-mode-arena"><button class="dungeon-entry-btn">正式按鈕</button></div></section>','civilization3dDungeonToggle'],
 ['dungeon-arena',3,'','<section class="w3-arena-shell"></section>','civilization3dAdvancedToggle'],
 ['dungeon-mirror',2,'','<section class="mirror-page"></section>','civilization3dAdvancedToggle'],
 ['dungeon-void-mirage',2,'','<section class="void-shell"></section>','civilization3dAdvancedToggle'],
 ['storyrecord',2,'','<section class="story-record-page"></section>','[data-chronicle-preview]'],
 ['home',3,'','<section data-major-transition="reincarnation"></section>','[data-chronicle-preview]'],
 ['adventure',1,'galaxy','<section class="combat-screen"></section>','civilization3dBattleToggle'],
 ['settings',1,'','<section class="function-page"><div class="card"><h2 id="settingsTitle">設定</h2></div><div id="civilizationAccountSettings"></div><div id="civilizationCloudSaveSettings"></div><div id="gmStartupSlot"></div></section>','[data-service3d-preview="account"] button'],
 ['guide',1,'','<section class="function-page"></section>','[data-service3d-preview="guide"] button'],
 ['settings',1,'','<section class="function-page"><div class="card"><h2 id="settingsTitle">設定</h2></div><div id="civilizationAccountSettings"></div><div id="civilizationCloudSaveSettings"></div><div id="gmStartupSlot"></div></section>','[data-service3d-preview="settings"] button'],
 ['settings',1,'','<section class="function-page"><div class="card"><h2 id="settingsTitle">設定</h2></div><div id="civilizationAccountSettings"></div><div id="civilizationCloudSaveSettings"></div><div id="gmStartupSlot"></div></section>','[data-service3d-preview="cloud"] button'],
 ['settings',1,'','<section class="function-page"><div class="card"><h2 id="settingsTitle">設定</h2></div><div id="civilizationAccountSettings"></div><div id="civilizationCloudSaveSettings"></div><div id="gmStartupSlot"></div></section>','[data-service3d-preview="gm"] button']
 ];
 for(const [route,world,era,html,id] of fixtures){
  await page.evaluate(({route,world,era,html})=>{__phase=world;__era=era;document.getElementById('main').innerHTML=html;civilization3dHomeRouteRendered(route);civilization3dHomeRouteRendered(route);},{route,world,era,html});
  const button=page.locator(id.startsWith('[')?'#main '+id:'#'+id);assert.equal(await button.count(),1,route+' '+era);
  for(let i=0;i<2;i++){
   await button.click();await page.waitForFunction(()=>document.getElementById('civilization3dFormalHost').dataset.threeDFormalMount==='active',null,{timeout:60000});
   await page.locator('#civilization3dFormalHost').getByRole('button',{name:'關閉 3D 預覽',exact:true}).click();
   assert.equal(await page.evaluate(()=>BABYLON.EngineStore.Instances.length),0);
  }
  console.log('PASS DOM hook fixture',viewport.width,route,era);
 }
 // Late account/cloud mounts are observed without duplicate controls/listeners.
 await page.evaluate(()=>{document.getElementById('main').innerHTML='<section class="function-page"><div class="card"><h2 id="settingsTitle">設定</h2></div></section>';civilization3dHomeRouteRendered('settings');document.querySelector('.function-page').insertAdjacentHTML('beforeend','<div id="civilizationAccountSettings"></div><div id="civilizationCloudSaveSettings"></div>');});
 await page.waitForFunction(()=>document.querySelectorAll('[data-service3d-preview="account"]').length===1&&document.querySelectorAll('[data-service3d-preview="cloud"]').length===1);
 await page.evaluate(()=>{civilization3dHomeRouteRendered('settings');civilization3dHomeRouteRendered('settings');});
 assert.equal(await page.locator('[data-service3d-preview="account"]').count(),1);
 await page.evaluate(()=>civilization3dToggleStory());
 await page.waitForFunction(()=>document.getElementById('civilization3dStoryHost').dataset.threeDFormalMount==='active');
 await page.evaluate(()=>civilization3dHideStoryPreview());
 assert.equal(await page.evaluate(()=>BABYLON.EngineStore.Instances.length),0);
 await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
