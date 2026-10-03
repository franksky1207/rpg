const { chromium } = require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(`pageerror:${error.message}`));
 await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof window.secondWorldEntryRequirements==='function'&&typeof window.thirdWorldEntryRequirements==='function'&&typeof window.worldEntryStoryRequirement==='function'&&typeof window.worldEntryRerunContext==='function');
 const result=await page.evaluate(()=>{
  const specKeys=Array.isArray(window.SPECIALIZATION_KEYS)?Array.from(window.SPECIALIZATION_KEYS):[];
  const markIds=Array.from(window.CIVILIZATION_MARK_IDS||[]);
  const slots=Array.isArray(window.ENHANCEMENT_SLOTS)?Array.from(window.ENHANCEMENT_SLOTS):['weapon','helmet','armor','shoes','accessory'];
  function reincarnation(count){return {count,breakthrough:{permanent:0,milestoneLifeId:count,milestones:{}},alternateUniverse:{unlocked:false,deepestCleared:0,activeAttempt:null,lifeFailures:{lifeId:count,failures:{}}}};}
  function fullSpecs(level=60){return Object.fromEntries(specKeys.map(key=>[key,level]));}
  function fullEnhancement(level){return {levels:Object.fromEntries(slots.map(slot=>[slot,level]))};}
  function fullMarks(level=10){return {entries:Object.fromEntries(markIds.map(id=>[id,{level}]))};}
  function firstWorldState(count){
   const bossKilled=Array.from({length:Math.max(100,Array.isArray(window.MAPS)?window.MAPS.length:100)},()=>false);bossKilled[bossKilled.length-1]=true;
   return {level:500,reincarnation:reincarnation(count),bossKilled,storyProgress:{completedStories:[]},specializations:fullSpecs(),enhancement:fullEnhancement(20),marks:fullMarks()};
  }
  function secondWorldState(count){
   const bossCount=Math.max(100,Number(window.SECOND_WORLD_MAIN_BOSS_COUNT)||100),bossKilled=Array.from({length:bossCount},()=>false);bossKilled[bossCount-1]=true;
   return {level:1000,reincarnation:reincarnation(count),storyProgress:{completedStories:[]},specializations:fullSpecs(),enhancement:fullEnhancement(40),marks:fullMarks(),vipPoints:1e12,vipLevel:99,secondWorld:{entered:true,civilizationLevel:10,mainline:{bossKilled},darkMatter:0,darkEnergy:0,calamities:Array.from({length:10},()=>({currentHp:null,trueKills:30}))}};
  }
  const w1First=firstWorldState(0),w1Rerun=firstWorldState(1);
  const w1FirstReq=window.secondWorldEntryRequirements(w1First),w1RerunReq=window.secondWorldEntryRequirements(w1Rerun);
  const w1MissingSpec=firstWorldState(1);if(specKeys[0])w1MissingSpec.specializations[specKeys[0]]=59;
  const w1MissingEnh=firstWorldState(1);w1MissingEnh.enhancement.levels[slots[0]]=19;
  const w1MissingMark=firstWorldState(1);if(markIds[0])w1MissingMark.marks.entries[markIds[0]].level=9;
  const w1MissingBoss=firstWorldState(1);w1MissingBoss.bossKilled[w1MissingBoss.bossKilled.length-1]=false;

  const w2First=secondWorldState(0),w2Rerun=secondWorldState(1);
  const w2FirstReq=window.thirdWorldEntryRequirements(w2First),w2RerunReq=window.thirdWorldEntryRequirements(w2Rerun);
  const w2MissingEnh=secondWorldState(1);w2MissingEnh.enhancement.levels[slots[0]]=39;
  const w2MissingCiv=secondWorldState(1);w2MissingCiv.secondWorld.civilizationLevel=9;w2MissingCiv.secondWorld.calamities[9].trueKills=0;
  const w2MissingSpec=secondWorldState(1);if(specKeys[0])w2MissingSpec.specializations[specKeys[0]]=59;
  const w2MissingMark=secondWorldState(1);if(markIds[0])w2MissingMark.marks.entries[markIds[0]].level=9;
  const w2MissingBoss=secondWorldState(1);w2MissingBoss.secondWorld.mainline.bossKilled[w2MissingBoss.secondWorld.mainline.bossKilled.length-1]=false;

  return {
   owner:{version:window.WORLD_PHASE_RERUN_ENTRY_POLICY_VERSION||0,first:window.worldEntryRerunContext(w1First),rerun:window.worldEntryRerunContext(w1Rerun)},
   w1:{first:w1FirstReq,rerun:w1RerunReq,missingSpec:window.secondWorldEntryRequirements(w1MissingSpec),missingEnh:window.secondWorldEntryRequirements(w1MissingEnh),missingMark:window.secondWorldEntryRequirements(w1MissingMark),missingBoss:window.secondWorldEntryRequirements(w1MissingBoss)},
   w2:{first:w2FirstReq,rerun:w2RerunReq,missingEnh:window.thirdWorldEntryRequirements(w2MissingEnh),missingCiv:window.thirdWorldEntryRequirements(w2MissingCiv),missingSpec:window.thirdWorldEntryRequirements(w2MissingSpec),missingMark:window.thirdWorldEntryRequirements(w2MissingMark),missingBoss:window.thirdWorldEntryRequirements(w2MissingBoss)},
   counts:{specKeys:specKeys.length,markIds:markIds.length,slots:slots.length}
  };
 });
 const fail=(code,detail)=>{throw new Error(`${code}: ${JSON.stringify(detail)}`);};
 if(errors.length)fail('PAGE_ERRORS',errors);
 if(result.owner.version!==1||result.owner.first.firstRun!==true||result.owner.first.reincarnationRun!==false||result.owner.rerun.reincarnationRun!==true)fail('RERUN_OWNER',result.owner);
 if(result.counts.specKeys!==8||result.counts.markIds!==10||result.counts.slots!==5)fail('REQUIREMENT_OWNER_COUNTS',result.counts);
 if(result.w1.first.mainline.storyRequirement?.ok!==false||result.w1.first.eligible!==false)fail('W1_FIRST_RUN_STORY_GATE',result.w1.first);
 if(result.w1.rerun.mainline.storyRequirement?.ok!==true||result.w1.rerun.mainline.storyRequirement?.bypassedForRerun!==true||result.w1.rerun.eligible!==true)fail('W1_RERUN_STORY_BYPASS',result.w1.rerun);
 for(const [name,row] of Object.entries({missingSpec:result.w1.missingSpec,missingEnh:result.w1.missingEnh,missingMark:result.w1.missingMark,missingBoss:result.w1.missingBoss}))if(row.eligible!==false)fail(`W1_OTHER_GATE_${name}`,row);
 if(result.w2.first.mainline.storyRequirement?.ok!==false||result.w2.first.eligible!==false)fail('W2_FIRST_RUN_STORY_GATE',result.w2.first);
 if(result.w2.rerun.mainline.storyRequirement?.ok!==true||result.w2.rerun.mainline.storyRequirement?.bypassedForRerun!==true||result.w2.rerun.eligible!==true)fail('W2_RERUN_STORY_BYPASS',result.w2.rerun);
 for(const [name,row] of Object.entries({missingEnh:result.w2.missingEnh,missingCiv:result.w2.missingCiv,missingSpec:result.w2.missingSpec,missingMark:result.w2.missingMark,missingBoss:result.w2.missingBoss}))if(row.eligible!==false)fail(`W2_OTHER_GATE_${name}`,row);
 console.log('Reincarnation rerun entry integrity passed.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
