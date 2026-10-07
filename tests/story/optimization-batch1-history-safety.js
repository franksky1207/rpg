const fs=require("fs"),vm=require("vm"),assert=require("assert");
const migration=fs.readFileSync("storymigration.js","utf8");
const phase=fs.readFileSync("thirdworldphase.js","utf8");
const formalProgress=fs.readFileSync("thirdworldprogress.js","utf8");
const storyProgress=fs.readFileSync("storyprogress.js","utf8");
const intro="higher-dimensional-intro",final="higher-dimensional-final";
const w3=[intro,...Array.from({length:9},(_,i)=>"higher-dimensional-milestone-"+String(i+1).padStart(2,"0")),final];
function load(){
 const ctx={console,document:{readyState:"loading",addEventListener(){}},addEventListener(){},setTimeout(){},registerNewStateNormalizer(){},
  storyReincarnationContext(x){return {reincarnationRun:Number(x?.reincarnation?.count)>=1};},
  thirdWorldStoryTriggerDescriptors:()=>w3.map(storyId=>({storyId})),
  thirdWorldStoryTriggerDescriptor:id=>w3.includes(id)?{storyId:id}:null,
  civilizationScriptGroupSnapshot:()=>({groups:{story:{status:ctx.groupStatus}}}),
  groupStatus:"loading",state:null};
 ctx.window=ctx;vm.createContext(ctx);
 vm.runInContext(migration,ctx,{filename:"storymigration.js"});
 vm.runInContext(phase,ctx,{filename:"thirdworldphase.js"});
 return ctx;
}
function state(count,{version=1,dead=false}={}){
 return {reincarnation:{count},introSeen:true,storyProgress:{completedStories:["earth-prologue",intro,final,"universe-boss-1"],pendingStory:"universe-boss-2",introCompleted:true,starterGearReceived:true,thirdWorldContentVersion:version},
  secondWorld:{entered:true},thirdWorld:{entered:true,completed:false,entryVersion:2,coreLevel:0,coreProgress:0,dimensionalStrings:0,
   story:{introSeen:false,finalSeen:false,unlockedStage:0},bosses:Array.from({length:10},()=>({currentHp:dead?0:1100000000}))}};
}
assert.ok(formalProgress.includes("window.reconcileThirdWorldRerunCombatCompletion?.(liveState);"),"W3 formal HP transaction must commit current-life completion");
assert.ok(!storyProgress.includes("window.reconcileThirdWorldRerunCombatCompletion?.(state);"),"Story settlement must not own W3 gameplay completion");
const ctx=load();
const catalog={"earth-prologue":{},"universe-boss-1":{},"universe-boss-2":{},...Object.fromEntries(w3.map(id=>[id,{}]))};
const sparse={"earth-prologue":{}};
const p=state(2);
ctx.civilizationStoryMigration.migrate(p,{stories:sparse,skipBackfill:true});
assert.deepEqual(Array.from(p.storyProgress.completedStories),["earth-prologue",intro,final,"universe-boss-1"],"partial deferred catalog may not delete permanent history");
assert.equal(p.storyProgress.pendingStory,"universe-boss-2","partial deferred catalog may not delete pending");
ctx.groupStatus="ready";
ctx.civilizationStoryMigration.migrate(p,{stories:catalog,skipBackfill:true});
assert.ok(p.storyProgress.completedStories.includes(final),"ready catalog must preserve known W3 Final");
assert.equal(p.storyProgress.pendingStory,"universe-boss-2","valid pending survives catalog validation");
p.storyProgress.pendingStory="retired-story-probe";
ctx.civilizationStoryMigration.migrate(p,{stories:catalog,skipBackfill:true});
assert.equal(p.storyProgress.pendingStory,null,"retired pending removed only after catalog ready");
assert.equal(ctx.LAST_STORY_PENDING_MIGRATION_REPAIR.originalId,"retired-story-probe","retired pending repair has diagnostic ID");
const old=state(3,{version:0});old.storyProgress.pendingStory="higher-dimensional-final";
old.storyProgress.completedStories.push("higher-dimensional-retired-xx");
ctx.civilizationStoryMigration.migrate(old,{stories:catalog,skipBackfill:true});
assert.equal(old.storyProgress.thirdWorldContentVersion,1,"legacy W3 rerun content version reconciled");
assert.equal(old.storyProgress.completedStories.includes(intro),true,"canonical W3 intro retained on rerun");
assert.equal(old.storyProgress.completedStories.includes(final),true,"canonical W3 Final retained on rerun");
assert.equal(old.storyProgress.completedStories.includes("higher-dimensional-retired-xx"),false,"retired W3 ref removed on old rerun");
assert.equal(old.storyProgress.pendingStory,null,"stale W3 pending removed on old rerun");
assert.equal(ctx.LAST_STORY_CONTENT_MIGRATION_REPORT.reason,"rerun-w3-preserve-canonical-history","old rerun report describes preservation");
const oldWithoutCatalog=load();oldWithoutCatalog.thirdWorldStoryTriggerDescriptors=undefined;
const deferred=state(2,{version:0});oldWithoutCatalog.civilizationStoryMigration.migrate(deferred,{stories:sparse,skipBackfill:true});
assert.equal(deferred.storyProgress.thirdWorldContentVersion,0,"legacy W3 rerun must defer version bump until canonical registry ready");
assert.equal(deferred.storyProgress.completedStories.includes(final),true,"deferred canonical history cannot be deleted");
const combatState=state(2,{dead:false});ctx.state=combatState;
const untouchedHistory=JSON.stringify(combatState.storyProgress);
ctx.reconcileThirdWorldRerunCombatCompletion(combatState);
assert.equal(combatState.thirdWorld.completed,false,"no boss defeated cannot complete W3");
combatState.thirdWorld.bosses.forEach(row=>row.currentHp=0);
ctx.reconcileThirdWorldRerunCombatCompletion(combatState);
assert.equal(combatState.thirdWorld.completed,true,"formal W3 owner completes on 10 bosses down, independent of stories");
assert.equal(JSON.stringify(combatState.storyProgress),untouchedHistory,"formal W3 completion must not modify Story progress");
assert.equal(combatState.thirdWorld.story.finalSeen,false,"formal W3 completion must not mark historical Final");
const first=state(0,{dead:true});first.thirdWorld.completed=false;
ctx.reconcileThirdWorldRerunCombatCompletion(first);
assert.equal(first.thirdWorld.completed,false,"first life remains under original formal Final Story completion");
assert.equal(ctx.STORY_REFERENCE_CATALOG_SAFETY_VERSION,1);
assert.equal(ctx.THIRD_WORLD_RERUN_COMBAT_COMPLETION_OWNER_VERSION,1);
console.log("STORY OPT BATCH1 PASSED: deferred catalog, Schema17 old rerun, canonical W3 history, pending diagnostics, formal W3 combat-only completion");
