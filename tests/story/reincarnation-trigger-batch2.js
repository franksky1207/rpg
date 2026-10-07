
const fs=require("fs"),vm=require("vm"),assert=require("assert");
const migrationSource=fs.readFileSync("storymigration.js","utf8");
const progressSource=fs.readFileSync("storyprogress.js","utf8");
const galaxyId="galaxy-probe-boss-1",universeId="universe-probe-boss-1",higherId="higher-dimensional-intro";
function setup(count){
 const log={single:0,continuous:0,settle:0,storyOpen:0,save:0};
 const stories=Object.fromEntries([galaxyId,universeId,higherId,"earth-prologue"].map(id=>[id,{id,pages:["page"]}]));
 const ctx={console,document:{readyState:"loading",addEventListener(){}},setTimeout(){},queueMicrotask(){},WORLD_REGIONS:[{id:"galaxy-probe",mapStart:0,mapEnd:0}],CIVILIZATION_STORY_REGIONS:[{id:"galaxy-probe",stories:[{id:galaxyId}]}],CIVILIZATION_STORIES:stories,CIVILIZATION_AUTH_REQUIRED:false,BACKGROUND_PRELOAD_READY:true,
  SECOND_WORLD_REGIONS:[],startSecondWorldBossBattle(){log.single++;return "single";},startSecondWorldBossContinuous(){log.continuous++;return "continuous";},secondWorldBossKilled(){return false;},
  settleSecondWorldBossVictory(){log.settle++;return {ok:true,firstKill:true,bossIndex:0}},
  universeStoryIdForBossIndex(index){return index===0?universeId:null;},
  universeBossIndexForStoryId(id){return id===universeId?0:null;},
  thirdWorldStoryTriggerDescriptors(){return [{storyId:higherId,kind:"intro",stage:0,contentReady:true}];},
  storyReincarnationContext(target){const n=Number(target?.reincarnation?.count)||0;return {count:n,reincarnationRun:n>0,firstRun:n===0};},
  save(){log.save++;return true;},addEventListener(){},
  openStory(){log.storyOpen++;return true;}
 };
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(migrationSource,ctx,{filename:"storymigration.js"});vm.runInContext(progressSource,ctx,{filename:"storyprogress.js"});
 ctx.state={level:600,exp:0,gold:1,reincarnation:{count},secondWorld:{entered:true},thirdWorld:{entered:false},
  storyProgress:{pendingStory:null,completedStories:[],introCompleted:true,starterGearReceived:true,thirdWorldContentVersion:1}};
 return {ctx,log,galaxyId,universeId,higherId};
}
const first=setup(0),s=first.ctx.civilizationStoryProgress;
assert.equal(s.queueBossStory(0),galaxyId,"首輪 W1 Boss should queue");
first.ctx.state.storyProgress.pendingStory=null;
assert.equal(s.queueUniverseBossStory(0),universeId,"首輪 W2 Boss should queue");
first.ctx.state.storyProgress.pendingStory=null;
assert.equal(first.ctx.startSecondWorldBossContinuous(0),"single","首輪 W2 first-clear should force single");
first.ctx.state.storyProgress.pendingStory=null;
const f=first.ctx.settleSecondWorldBossVictory(0);
assert.equal(f.pendingStoryId,universeId,"首輪 W2 settlement should queue Story");
assert.equal(first.log.settle,1,"首輪 W2 settlement must run");

for(const count of [1,2,3,7]){
 const {ctx,log}=setup(count),p=ctx.civilizationStoryProgress,source=ctx.state.storyProgress;
 assert.equal(p.queueBossStory(0),null,`轉生${count}: W1 may not queue`);
 assert.equal(p.queueUniverseBossStory(0),null,`轉生${count}: W2 may not queue`);
 assert.equal(source.pendingStory,null,"No new rerun story pending");
 assert.equal(ctx.startSecondWorldBossContinuous(0),"continuous","W2 rerun may not force single for Story");
 const win=ctx.settleSecondWorldBossVictory(0);
 assert.equal(win.ok,true,"W2 rerun settlement still executed");
 assert.equal(win.pendingStoryId,undefined,"W2 rerun settlement may not queue Story");
 assert.equal(log.settle,1,"W2 formal settlement must remain operational");
 source.pendingStory=galaxyId;p.normalize(ctx.state);
 assert.equal(source.pendingStory,null,"W1 historic pending must be cleared on rerun load");
 source.pendingStory=universeId;p.normalize(ctx.state);
 assert.equal(source.pendingStory,null,"W2 historic pending must be cleared on rerun load");
 source.pendingStory=higherId;p.normalize(ctx.state);
 assert.equal(source.pendingStory,higherId,"W3 pending stays untouched until Batch3");
 assert.deepEqual(Array.from(source.completedStories),["earth-prologue"],"Rerun suppression must preserve legacy intro but not fabricate W1/W2 Boss history");
 assert.equal(log.storyOpen,0,"Rerun must not replay formal W1 or W2 story");
 assert.equal(ctx.state.thirdWorld.entered,false,"Rerun must not unlock W3");
 assert.equal(log.save,0,"Normalization of test state does not trigger save or formal side effects");
}
assert.equal(first.ctx.STORY_REINCARNATION_W1_W2_SUPPRESSION_VERSION,1);
assert.equal(first.ctx.UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION,1);
console.log("Story rerun W1/W2 trigger isolation Batch2 passed: first-run preserved, reincarnation 1/2/3/7 isolated, W2 continuous restored, stale pending safely cleared, W3 deferred");
