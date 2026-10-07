const fs=require("fs"),vm=require("vm"),assert=require("assert");
const migrationSrc=fs.readFileSync("storymigration.js","utf8");
const progressSrc=fs.readFileSync("storyprogress.js","utf8");
const recordSrc=fs.readFileSync("storyrecordtabs.js","utf8");
const indexHtml=fs.readFileSync("index.html","utf8");
const galaxy=Array.from({length:100},(_,i)=>"galaxy-closure-boss-"+(i+1));
const universe=Array.from({length:100},(_,i)=>"universe-closure-boss-"+(i+1));
const higher=["higher-dimensional-intro",...Array.from({length:9},(_,i)=>"higher-dimensional-milestone-"+String(i+1).padStart(2,"0")),"higher-dimensional-final"];
const all=["earth-prologue",...galaxy,...universe,...higher];
const stories=Object.fromEntries(all.map(id=>[id,{id,title:id,location:"測試",chapter:"測試紀元",pages:["正式正文"]}]));
const galaxyRegions=[{id:"galaxy-closure",name:"銀河",stories:galaxy.map(id=>({id}))}];
const universeRegions=[{id:"universe-closure",name:"宇宙",stories:universe.map(id=>({id}))}];
function seed(count,{second=false,third=false,dead=false,history=[],pending=null,stage=0}={}){
 return {level:third?1500:second?600:1,exp:0,gold:1,reincarnation:{count},
  introSeen:true,storyProgress:{pendingStory:pending,completedStories:history.slice(),introCompleted:true,starterGearReceived:true,thirdWorldContentVersion:1},
  secondWorld:{entered:second||third},thirdWorld:{entered:third,completed:false,story:{introSeen:false,unlockedStage:stage,finalSeen:false},bosses:Array.from({length:10},()=>({currentHp:dead?0:1100000000}))}};
}
function browserContext(serialized){
 const writes=[],opened=[],scheduled=[],actions={single:0,continuous:0,settle:0};
 const ctx={console,setTimeout(){},queueMicrotask(fn){scheduled.push(fn);},
  document:{readyState:"loading",hidden:false,addEventListener(){}},addEventListener(){},
  CIVILIZATION_STORIES:stories,CIVILIZATION_STORY_REGIONS:galaxyRegions,CIVILIZATION_UNIVERSE_STORY_REGIONS:universeRegions,
  CIVILIZATION_AUTH_REQUIRED:false,BACKGROUND_PRELOAD_READY:true,WORLD_REGIONS:[{id:"galaxy-closure",mapStart:0,mapEnd:99}],
  thirdWorldStoryTriggerDescriptors:()=>higher.map((storyId,i)=>({storyId,kind:i===0?"intro":i===10?"final":"milestone",stage:i,contentReady:true})),
  storyReincarnationContext(target){const count=Number(target?.reincarnation?.count)||0;return {reincarnationRun:count>0,count};},
  reconcileThirdWorldRerunCombatCompletion(target){if(Number(target?.reincarnation?.count)>0&&target?.thirdWorld?.entered){target.thirdWorld.completed=target.thirdWorld.bosses.length===10&&target.thirdWorld.bosses.every(row=>row.currentHp===0);}return {applied:true};},
  universeStoryIdForBossIndex(i){return universe[i]||null;},universeBossIndexForStoryId(id){const i=universe.indexOf(id);return i<0?null:i;},
  isSecondWorldEntered(){return ctx.state?.secondWorld?.entered===true;},
  isThirdWorldEntered(){return ctx.state?.thirdWorld?.entered===true;},
  settleSecondWorldBossVictory(){actions.settle++;return {ok:true,firstKill:true,bossIndex:0};},
  secondWorldBossKilled(){return false;},
  startSecondWorldBossBattle(){actions.single++;return "single";},
  startSecondWorldBossContinuous(){actions.continuous++;return "continuous";},
  save(){writes.push(JSON.stringify(ctx.state));},render(){},
  openStory(id,options){opened.push({id,options});return true;},
  state:undefined};
 ctx.window=ctx;vm.createContext(ctx);
 vm.runInContext(migrationSrc,ctx,{filename:"storymigration.js"});
 vm.runInContext(progressSrc,ctx,{filename:"storyprogress.js"});
 vm.runInContext(recordSrc,ctx,{filename:"storyrecordtabs.js"});
 ctx.state=JSON.parse(JSON.stringify(serialized));
 return {ctx,opened,writes,actions,progress:ctx.civilizationStoryProgress,flushResume(){ctx.civilizationStoryProgress.resume();for(let guard=0;scheduled.length&&guard<20;guard++)scheduled.shift()();assert.equal(scheduled.length,0,"Story resume must settle without recursive replay");}};
}
function renderCount(ctx,era){
 ctx.setStoryRecordEraView(era);
 const html=ctx.storyRecordPageHtml();
 return (html.match(/class="story-record-entry"/g)||[]).length;
}
function archiveCheck(env,era,expected){
 const {ctx,opened}=env,previous=JSON.stringify(ctx.state);
 assert.equal(renderCount(ctx,era),expected,"archive count "+era);
 let id=era==="galaxy-review"?"earth-prologue":era==="higher-dimensional"?higher[10]:universe[99];
 assert.equal(ctx.replayStoryRecordEntry(id),true,"archive entry must be readable "+era);
 assert.equal(opened.at(-1).options.lifecycleOwner,"generic","archive replay cannot use formal lifecycle");
 assert.equal(Object.prototype.hasOwnProperty.call(opened.at(-1).options,"onComplete"),false,"archive must never run formal completion callback");
 assert.equal(JSON.stringify(ctx.state),previous,"archive render/replay cannot mutate persisted gameplay");
}
async function run(){
 const baseline=indexHtml.match(/storyprogress\.js\?v=[^"]+/)?.[0]||"";
 assert.ok(baseline.includes("20261007-reincarnation-story-batch3"),"Story JS cache must retain Batch3");
 const first=browserContext(seed(0,{third:true,stage:0}));
 first.progress.normalize(first.ctx.state);
 assert.equal(renderCount(first.ctx,"higher-dimensional"),0,"First-life must not expose unplayed W3 stories");
 assert.equal(first.progress.queueThirdWorldEligibleStory({resume:false}),higher[0],"First-life W3 queue must remain live");
 const rerunArchive=["earth-prologue",galaxy[0],universe[0],...higher];
 for(const count of [1,2,3,8]){
  let life=browserContext(seed(count,{history:rerunArchive,pending:galaxy[20]}));
  life.progress.normalize(life.ctx.state);
  assert.equal(life.ctx.state.storyProgress.pendingStory,null,"W1 stale pending repaired after legacy load");
  life.flushResume();assert.equal(life.opened.length,0,"W1 rerun resume must not open formal Story");
  assert.equal(renderCount(life.ctx,"galaxy-review"),101,"W1 all 101 archive at reincarnation without boss");
  archiveCheck(life,"galaxy-review",101);
  assert.equal(life.progress.queueBossStory(30),null,"W1 rerun boss must not create formal Story");
  assert.equal(life.ctx.state.bossKilled,undefined,"W1 Story archive must not synthesize boss clears");
  let saved=JSON.parse(JSON.stringify(life.ctx.state));
  life=browserContext(saved);
  life.progress.normalize(life.ctx.state);
  assert.equal(renderCount(life.ctx,"galaxy-review"),101,"W1 record survives a JSON save/reload");
  life.ctx.state.secondWorld.entered=true;
  assert.equal(renderCount(life.ctx,"universe"),100,"W2 all 100 archive at entrance without boss");
  archiveCheck(life,"universe",100);
  assert.equal(life.ctx.startSecondWorldBossContinuous(0),"continuous","W2 rerun continuous cannot degrade to single");
  assert.equal(life.ctx.settleSecondWorldBossVictory(0).pendingStoryId,undefined,"W2 settlement must not queue formal Story");
  assert.equal(life.progress.queueUniverseBossStory(15),null,"W2 rerun no formal Story queue");
  saved=JSON.parse(JSON.stringify(life.ctx.state));
  life=browserContext(saved);
  life.progress.normalize(life.ctx.state);
  assert.equal(renderCount(life.ctx,"universe"),100,"W2 full archive survives JSON reload");
  life.flushResume();assert.equal(life.opened.length,0,"W2 rerun resume must not open formal Story");
  life.ctx.state.thirdWorld.entered=true;
  const historyBefore=JSON.stringify(life.ctx.state.storyProgress.completedStories);
  life.ctx.state.storyProgress.pendingStory=higher[10];
  life.progress.normalize(life.ctx.state);
  assert.equal(life.ctx.state.storyProgress.pendingStory,null,"W3 historical Final pending repaired");
  life.flushResume();assert.equal(life.opened.length,0,"W3 rerun resume must not open formal Story");
  assert.equal(renderCount(life.ctx,"higher-dimensional"),11,"W3 all 11 archive at entrance without boss");
  archiveCheck(life,"higher-dimensional",11);
  assert.equal(life.ctx.state.thirdWorld.completed,false,"W3 archive must not complete boss conquest");
  assert.equal(life.ctx.state.thirdWorld.story.finalSeen,false,"W3 archive must not complete current-life Final Story");
  assert.equal(life.ctx.state.thirdWorld.story.introSeen,false,"W3 archive must not complete current-life Intro Story");
  assert.equal(life.progress.queueThirdWorldEligibleStory({resume:false}),null,"W3 rerun may not enqueue chapters");
  assert.equal(life.progress.completeStory(higher[10]),false,"W3 rerun may not mark Final as completed");
  const drained=await life.progress.drainThirdWorldPostFlowStories();
  assert.equal(drained.presented,0,"Rerun W3 must not display formal Story");
  assert.equal(JSON.stringify(life.ctx.state.storyProgress.completedStories),historyBefore,"all formal history must stay unchanged");
  assert.equal(renderCount(life.ctx,"universe-review"),100,"W2 review remains visible from W3");
  assert.equal(renderCount(life.ctx,"galaxy-review"),101,"W1 review remains visible from W3");
  const persisted=JSON.parse(JSON.stringify(life.ctx.state));
  const recovered=browserContext(persisted);
  recovered.flushResume();
  assert.equal(recovered.opened.length,0,"W3 rerun reload must not auto-open historical Final");
  recovered.progress.normalize(recovered.ctx.state);
  archiveCheck(recovered,"higher-dimensional",11);
  assert.equal(recovered.ctx.state.thirdWorld.completed,false,"Reload after archived W3 entry must not complete conquest");
  recovered.ctx.state.thirdWorld.bosses.forEach(row=>row.currentHp=0);
  recovered.ctx.state.thirdWorld.story.unlockedStage=0;
  const combat=recovered.progress.consumeThirdWorldSettlement({ok:true,world:3,unlockedStoryStages:[]});
  assert.equal(combat.completion.completionReady,false,"Stage readiness snapshot is separate from true battle completion");
  assert.equal(recovered.ctx.state.thirdWorld.completed,true,"Rerun 10 bosses down must be reflected without Final/story stage");
  assert.equal(recovered.ctx.state.thirdWorld.story.finalSeen,false,"Formal battle completion cannot mark historical Final as reread");
  assert.equal(combat.queuedStoryId,null,"Battle completion cannot queue archived Final");
  assert.equal(recovered.writes.length,0,"Archive normalization/transition should not invoke a separate Story save");
 }
 const dirty=browserContext(seed(2,{third:true,history:[],pending:higher[4]}));
 dirty.progress.normalize(dirty.ctx.state);
 assert.equal(dirty.ctx.state.storyProgress.pendingStory,null,"Legacy W3 pending cleared even if history array is incomplete");
 assert.equal(dirty.ctx.state.storyProgress.completedStories.filter(id=>higher.includes(id)).length,0,"Legacy migration must not fabricate W3 completedStories");
 assert.equal(renderCount(dirty.ctx,"higher-dimensional"),11,"Missing old history still appears in archive for rerun");
 console.log("Three-era reincarnation Story Batch4 closure passed: 0/1/2/3/8, W1=101 W2=100 W3=11, old pending, JSON reload, boss/Final isolation, historical consistency.");
}
run().catch(error=>{console.error(error);process.exitCode=1;});