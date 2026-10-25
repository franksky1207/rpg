'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('playersemanticsui.js','utf8');
const adventure=fs.readFileSync('thirdworldui.js','utf8');
const expected='突破每級：裝備原始 HP／攻擊／防禦 +2.5%、最終傷害 +5%、轉生收益 +1%。';
assert.ok(source.includes(expected),'Character breakthrough caption must match approved copy');
assert.match(source,/ensureCharacterStat\(grid,"轉生收益加成",/);
assert.match(source,/damageRow\.insertAdjacentElement\("afterend",yieldRow\)/,'Yield should appear directly after final damage');
assert.match(source,/const duplicateCore=statByLabel\(grid,"界弦核心"\);if\(duplicateCore\)duplicateCore\.remove\(\);/);
assert.ok(!source.includes('ensureCharacterStat(grid,"界弦核心"'),'Character page should not recreate duplicate core');
assert.ok(adventure.includes('界弦核心')&&adventure.includes('third-world-core-progress'),'Higher-dimensional adventure core remains available');
for(const level of [0,1,10,130,500]){
 const formatted='+'+Math.max(0,Math.floor(Number(level)||0))+'%';
 assert.equal(formatted,'+'+level+'%');
}
console.log('PASS Issue106 character UI static integrity: labels, ordering, captions, core ownership, sample levels.');

const {chromium}=require('playwright');
const {sdk,finishIntro}=require('../equipment-formal/helpers.cjs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
 const page=await browser.newPage(),pageErrors=[],reports=[];
 page.on('pageerror',e=>pageErrors.push(String(e)));
 try{
  await page.route('**/supabase.js',r=>r.fulfill({contentType:'text/javascript',body:sdk}));
  await page.goto(process.env.RUNTIME_SMOKE_URL||'http://127.0.0.1:4173/index.html?production=1');
  await page.waitForFunction(()=>typeof applyCharacterWorldPhaseSemantics==='function'&&typeof thirdWorldAdventurePageHtml==='function');
  await page.waitForFunction(()=>CivilizationStartupCoordinator.snapshot().status==='ready');
  await page.evaluate(async()=>{await ensureCivilizationScriptGroup('story');civilizationStoryProgress.resume();});
  await page.locator('#civilizationStoryModal.open').waitFor();
  await finishIntro(page);
  for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   for(const world of [1,2,3])for(const level of [0,1,10,130,500]){
    reports.push(await page.evaluate(({world,level,expected})=>{
     const check=(ok,msg)=>{if(!ok)throw Error(msg);};
     const original=state,oldView=view;
     try{
      state=newState();state.introSeen=true;state.storyProgress=structuredClone(original.storyProgress);state.level=world===3?1000:world===2?600:100;
      state.secondWorld.entered=world>=2;state.thirdWorld.entered=world===3;
      state.reincarnation.count=50;state.reincarnation.breakthrough.permanent=level;
      state.thirdWorld.entryVersion=2;state.thirdWorld.coreLevel=3;state.thirdWorld.coreProgress=12345;state.thirdWorld.dimensionalStrings=45678;
      view='character';render();
      const before=JSON.stringify(state);
      for(let repeat=0;repeat<5;repeat++){
       view='home';render();view='character';render();
       applyCharacterWorldPhaseSemantics();applyCharacterWorldPhaseSemantics();
       const card=document.querySelector('.character-stats-card'),grid=card?.querySelector('.character-stats-grid');
       check(!!grid,'actual character grid');
       const rows=[...grid.querySelectorAll('.stat')],label=r=>String(r.childNodes[0]?.textContent||'').trim();
       const yields=rows.filter(r=>label(r)==='轉生收益加成'),damage=rows.find(r=>label(r)==='突破最終傷害');
       check(yields.length===1,'exactly one yield field after repeated navigation and rendering');
       check(yields[0].querySelector('b')?.textContent===`+${level}%`,'yield value comes from permanent breakthrough');
       check(damage?.nextElementSibling===yields[0],'yield directly follows final damage');
       check(rows.every(r=>!label(r).startsWith('界弦核心')),'no duplicate character core row');
       const notes=card.querySelectorAll('[data-character-breakthrough-note="1"]');
       check(notes.length===1&&notes[0].textContent===expected,'one exact approved caption');
       yields[0].scrollIntoView({block:'center',behavior:'instant'});
       const rect=yields[0].getBoundingClientRect(),value=yields[0].querySelector('b').getBoundingClientRect();
       check(rect.width>0&&rect.height>0&&rect.left>=-1&&rect.right<=innerWidth+1,'yield field visible and within viewport');
       const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
       check(hit&&yields[0].contains(hit),`yield actually visible: world=${world}, level=${level}, viewport=${innerWidth}x${innerHeight}, hit=${hit?.id||hit?.className||'none'}`);
       check(value.left>=rect.left-1&&value.right<=rect.right+1,'yield value fits its field');
       check(document.documentElement.scrollWidth<=innerWidth+1,'character page has no horizontal overflow');
       check(JSON.stringify(state)===before,'UI renders do not mutate save state');
      }
      if(world===3){
       view='adventure';render();
       check(!!document.querySelector('.third-world-core-progress'),'adventure core progress remains visible');
       check(document.querySelector('#main').textContent.includes('界弦核心'),'adventure core label retained');
       check(!!document.querySelector('[onclick="injectThirdWorldCoreFromPlayerUi()"]'),'adventure core injection button retained');
       check(JSON.stringify(state)===before,'adventure navigation preserves core level/progress/strings');
      }
      return {world,level,width:innerWidth,height:innerHeight,repeats:5};
     }finally{state=original;view=oldView;render();}
    },{world,level,expected}));
   }
  }
  // Exercise the actual injection confirmation and transaction on a synthetic save.
  const injection=await page.evaluate(()=>{
   const original=state,oldView=view;
   try{
    state=newState();state.introSeen=true;state.storyProgress=structuredClone(original.storyProgress);state.level=1000;state.secondWorld.entered=true;state.thirdWorld.entered=true;
    state.thirdWorld.entryVersion=2;state.thirdWorld.coreLevel=3;state.thirdWorld.coreProgress=900000000;state.thirdWorld.dimensionalStrings=200000000;
    view='adventure';render();
    if(!openThirdWorldCoreInjectionConfirm())throw Error('core confirmation did not open');
    const visible=document.getElementById('thirdWorldCoreInjectionConfirmModal')?.classList.contains('show');
    const result=confirmThirdWorldCoreInjection();
    const after={level:state.thirdWorld.coreLevel,progress:state.thirdWorld.coreProgress,strings:state.thirdWorld.dimensionalStrings};
    return {visible,result:result!==false,after};
   }finally{state=original;view=oldView;render();}
  });
  assert.deepEqual(injection,{visible:true,result:true,after:{level:4,progress:100000000,strings:0}},'adventure core injection retains its existing economic contract');
  assert.deepEqual(pageErrors,[]);assert.equal(reports.length,45);
  console.log('PASS Issue106 actual character UI:',JSON.stringify({cases:reports.length,worlds:3,levels:[0,1,10,130,500],viewports:3,rerenders:225,coreInjection:true,stateUnchanged:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
