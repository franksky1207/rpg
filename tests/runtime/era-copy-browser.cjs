'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[];const output=process.env.ERA_COPY_EVIDENCE_DIR||'/tmp/rpg-era-copy';fs.mkdirSync(output,{recursive:true});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof worldReincarnationContext==='function'&&typeof showWorldPhaseWelcome==='function'&&typeof storyRecordPageHtml==='function');
  // Match existing isolated UI browser fixtures; no login or remote save calls.
  await page.evaluate(()=>{
   document.getElementById("civilizationAuthGate")?.remove();
   document.getElementById("gameIntroModal")?.classList.remove("show");
   document.body.classList.remove("auth-gate-open","background-preloading");
  });
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
   await page.setViewportSize(viewport);
   for(const count of [0,1])for(const world of [2,3]){
    const fixture=await page.evaluate(({count,world})=>{
     state=newState();state.reincarnation.count=count;
     state.level=world===2?500:1000;state.vipPoints=1e12;
     state.specializations=Object.fromEntries(SPECIALIZATION_KEYS.map(key=>[key,60]));
     state.enhancement.levels=Object.fromEntries(ENHANCEMENT_SLOTS.map(key=>[key,world===2?20:40]));
     for(const id of CIVILIZATION_MARK_IDS)state.marks.entries[id]={level:10};
     state.bossKilled=Array(MAPS.length).fill(true);
     state.secondWorld=createBlankSecondWorldState();state.secondWorld.entered=world===3;
     state.secondWorld.mainline.bossKilled=Array(100).fill(true);state.secondWorld.civilizationLevel=10;
     state.storyProgress.completedStories=[finalFirstWorldStoryId(),finalSecondWorldStoryId()];
     const requirements=world===2?secondWorldEntryRequirements():thirdWorldEntryRequirements();
     const before=JSON.stringify(state);openWorldPhaseConfirmation(world);
     return {eligible:requirements.eligible,rerun:worldReincarnationContext(state).reincarnationRun,unchanged:before===JSON.stringify(state)};
    },{count,world});
    assert.equal(fixture.eligible,true,JSON.stringify(fixture));assert.equal(fixture.rerun,count>0);assert.equal(fixture.unchanged,true);
    for(const screen of ['confirm','welcome']){
     if(screen==='welcome')await page.evaluate(world=>{
      closeWorldPhaseConfirmation();if(world===3){state.thirdWorld=createBlankThirdWorldState();state.thirdWorld.entered=true;}else state.secondWorld.entered=true;
      sessionStorage.setItem(worldPhaseWelcomeMarkerKey(world),'1');showWorldPhaseWelcome(world);
     },world);
     const selector=screen==='confirm'?'#worldPhaseConfirmModal':'#secondWorldWelcomeModal';
     const modal=page.locator(selector);const text=await modal.innerText();
     assert.ok(text.includes('戰線紀錄'));assert.doesNotMatch(text,/回顧|歷史|舊世界/);
     if(count)assert.ok(text.includes('本輪正式重征服')||text.includes('本輪高維紀元正式重征服'));
     else assert.ok(text.includes(world===2?'鏡像戰與虛空進度完整保留，已解鎖的戰線紀錄亦可繼續查看。':'鏡像戰、虛空進度及既有養成完整保留，已解鎖的戰線紀錄亦可繼續查看。'));
     const layout=await modal.evaluate(el=>{
      const card=el.querySelector('.world-phase-card'),scroll=el.querySelector('.world-phase-scroll'),action=el.querySelector('.world-phase-modal-actions');const rect=card.getBoundingClientRect(),button=action.getBoundingClientRect();
      return {horizontal:card.scrollWidth<=card.clientWidth&&scroll.scrollWidth<=scroll.clientWidth,inViewport:rect.left>=0&&rect.right<=innerWidth&&rect.top>=0&&rect.bottom<=innerHeight,buttonsVisible:button.bottom<=innerHeight,unobscured:el.contains(document.elementFromPoint(button.left+button.width/2,button.top+button.height/2)),scrollable:scroll.scrollHeight>=scroll.clientHeight};
     });assert.ok(Object.values(layout).every(Boolean),JSON.stringify(layout));
     await modal.screenshot({path:`${output}/${viewport.width}-${count?'rerun':'first'}-${world}-${screen}.png`});
     results.push({viewport:viewport.width,count,world,screen,text,layout});
    }
    const record=await page.evaluate(()=>{
     closeWorldPhaseWelcome();const before=JSON.stringify(state);const html=storyRecordPageHtml();const id=finalFirstWorldStoryId();setStoryRecordEraView('galaxy-review');const galaxy=storyRecordPageHtml();const open=window.openStory;let called=null;window.openStory=(key)=>{called=key;return true;};const replay=replayStoryRecordEntry(id);window.openStory=open;
     return {heading:html.includes('戰線紀錄'),entry:galaxy.includes(id),replay,called,id,unchanged:before===JSON.stringify(state)};
    });assert.ok(record.heading&&record.entry&&record.replay&&record.unchanged);assert.equal(record.called,record.id);
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${output}/report.json`,JSON.stringify({passed:true,results,errors},null,2));
  console.log(`Era copy acceptance passed: ${results.length} rendered screens; record listing/replay, state purity, 390px/1440px layout.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
