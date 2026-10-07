const fs=require("fs"),vm=require("vm"),assert=require("assert");
const migrationSource=fs.readFileSync("storymigration.js","utf8");
const progressSource=fs.readFileSync("storyprogress.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const ids=["higher-dimensional-intro",...Array.from({length:9},(_,i)=>"higher-dimensional-milestone-"+String(i+1).padStart(2,"0")),"higher-dimensional-final"];
const allStories=Object.fromEntries(["earth-prologue",...ids].map(id=>[id,{id,pages:["正式劇情"]}]));
function setup(count,{allDead=false,stage=0,history=ids,pending="higher-dimensional-final"}={}){
 const calls={save:0,open:0};
 const target={reincarnation:{count},level:1500,introSeen:true,storyProgress:{pendingStory:pending,completedStories:["earth-prologue",...history],introCompleted:true,starterGearReceived:true,thirdWorldContentVersion:1},
  thirdWorld:{entered:true,completed:false,story:{introSeen:true,unlockedStage:stage,finalSeen:false},bosses:Array.from({length:10},()=>({currentHp:allDead?0:1100000000})),coreLevel:0}};
 const ctx={console,document:{readyState:"loading",hidden:false,addEventListener(){}},setTimeout(){},queueMicrotask(){},
  CIVILIZATION_STORIES:allStories,CIVILIZATION_STORY_REGIONS:[],CIVILIZATION_AUTH_REQUIRED:false,BACKGROUND_PRELOAD_READY:true,
  WORLD_REGIONS:[],state:undefined,registerNewStateNormalizer(){},
  thirdWorldStoryTriggerDescriptors:()=>ids.map((storyId,i)=>({storyId,kind:i===0?"intro":i===10?"final":"milestone",stage:i,contentReady:true})),
  storyReincarnationContext(x){const n=Number(x?.reincarnation?.count)||0;return {reincarnationRun:n>0,firstRun:n===0,count:n};},
  save(){calls.save++;return true;},addEventListener(){},openStory(){calls.open++;return true;}
 };
 ctx.window=ctx;
 vm.createContext(ctx);
 vm.runInContext(migrationSource,ctx,{filename:"storymigration.js"});
 vm.runInContext(progressSource,ctx,{filename:"storyprogress.js"});
 ctx.state=target;
 return {ctx,target,calls,api:ctx.civilizationStoryProgress};
}
async function main(){
 const first=setup(0,{allDead:false,stage:0,history:[],pending:null});
 first.api.normalize(first.target);
 const firstRows=first.api.thirdWorldEligibility(first.target);
 assert.equal(firstRows.nextQueueableId,"higher-dimensional-intro","首輪 W3 序章仍應可排入");
 assert.equal(first.api.queueThirdWorldEligibleStory({resume:false}),"higher-dimensional-intro","首輪 W3 queue unchanged");
 assert.equal(first.target.storyProgress.pendingStory,"higher-dimensional-intro","首輪正式 pending remains");
 const fullFirst=setup(0,{allDead:true,stage:10,history:ids,pending:null});
 fullFirst.api.normalize(fullFirst.target);
 assert.equal(fullFirst.target.thirdWorld.completed,true,"首輪 Final 與正式 Boss completion 原有判定不變");
 assert.equal(fullFirst.target.thirdWorld.story.finalSeen,true,"首輪 finalSeen 仍由正式完成故事判定");
 assert.equal(fullFirst.target.thirdWorld.story.introSeen,true,"首輪 introSeen 仍由正式完成故事判定");
 const blockedFirst=setup(0,{allDead:false,stage:10,history:ids,pending:null});
 blockedFirst.api.normalize(blockedFirst.target);
 assert.equal(blockedFirst.target.thirdWorld.completed,false,"首輪 Final history 不能越過 Boss gate");
 for(const count of [1,2,3,7]){
  const {ctx,target,calls,api}=setup(count,{allDead:false,stage:0,history:ids,pending:"higher-dimensional-final"});
  const priorHistory=JSON.stringify(target.storyProgress.completedStories);
  api.normalize(target);
  assert.equal(target.storyProgress.pendingStory,null,"轉生 W3 殘留 pending 必須在 migration/normalization 清理");
  assert.equal(JSON.stringify(target.storyProgress.completedStories),priorHistory,"歷史高維11篇不能因本輪重征服更動");
  assert.equal(target.thirdWorld.story.introSeen,false,"轉生重征服不得從歷史序章推導本輪 introSeen");
  assert.equal(target.thirdWorld.story.finalSeen,false,"轉生重征服不得從歷史 Final 推導本輪 finalSeen");
  assert.equal(target.thirdWorld.completed,false,"新一輪10王尚未擊敗不得通關");
  assert.equal(api.queueThirdWorldEligibleStory({resume:false}),null,"轉生不得重排 W3 序章或階段");
  assert.equal(api.queueStory("higher-dimensional-milestone-05"),null,"直接 W3 queue API 也必須隔離");
  assert.equal(api.setPending("higher-dimensional-final"),false,"直接 setPending 也不得建立 W3 重播");
  assert.equal(api.completeStory("higher-dimensional-final"),false,"轉生 W3 不得呼叫 formal completeStory");
  const gate=api.thirdWorldStoryCompletionGate("higher-dimensional-final",target);
  assert.equal(gate.allowed,false,"轉生 Final 正式 Story gate 應封閉");
  assert.equal(api.applyThirdWorldStoryCompletion("higher-dimensional-final",target,{handled:true,allowed:true,kind:"final"}).applied,false,"外來 allow gate 不可繞過轉生隔離");
  const eligible=api.thirdWorldEligibility(target);
  assert.equal(eligible.rows.length,11,"正式11篇 registry 保持");
  assert.equal(eligible.rows.some(x=>x.eligible||x.queueable),false,"轉生11篇不得出現 formal queueable");
  assert.equal(api.thirdWorldCompletionFramework(target).finalQueueable,false,"戰鬥完成框架不應要求 W3 Final 播放");
  const ignored=api.consumeThirdWorldSettlement({ok:true,world:3,unlockedStoryStages:[1]});
  assert.equal(ignored.accepted,true,"正式 W3 戰鬥 settlement 仍需接受");
  assert.equal(ignored.queuedStoryId,null,"W3 stage settlement 不應重播");
  assert.equal(ignored.completion.storedCompleted,false,"擊殺未達10王不可提前 completed");
  const drained=await api.drainThirdWorldPostFlowStories();
  assert.equal(drained.reason,"reincarnation-story-archived","W3 post-flow drain should finish without presentation");
  assert.equal(drained.presented,0,"W3 重征服不可補播高維故事");
  assert.equal(calls.open,0,"不得自動顯示故事");
  assert.equal(calls.save,0,"Story history isolation should not create standalone save writes");
  target.thirdWorld.bosses.forEach(x=>x.currentHp=0);
  target.thirdWorld.story.unlockedStage=10;
  const battle=api.consumeThirdWorldSettlement({ok:true,world:3,unlockedStoryStages:[10]});
  assert.equal(battle.completion.completionReady,true,"本輪10王全滅仍正常報告 completion-ready");
  assert.equal(target.thirdWorld.completed,true,"轉生後完成標記只能依本輪10王與 stage10 實際進度");
  assert.equal(target.thirdWorld.story.finalSeen,false,"本輪 Boss 打完也不可將歷史 Final 標為重新播放");
  assert.equal(target.thirdWorld.story.introSeen,false,"本輪序章未重播");
  assert.equal(battle.queuedStoryId,null,"戰鬥完成不觸發 W3 Final");
  assert.equal(JSON.stringify(target.storyProgress.completedStories),priorHistory,"本輪 Boss 全滅不能影響永久 Story archive");
  const staleStage=setup(count,{allDead:true,stage:0,history:ids,pending:null});
  staleStage.api.normalize(staleStage.target);
  assert.equal(staleStage.target.thirdWorld.completed,true,"10王確實全滅時，轉生通關不得依賴舊 Story stage");
  assert.equal(staleStage.target.thirdWorld.story.unlockedStage,0,"Story isolation owner 不得擅自補寫本輪 stage");
  assert.equal(staleStage.target.thirdWorld.story.finalSeen,false,"歷史 Final 不得將 stale-stage rerun 冒充為已播放");
 }
 assert.equal(first.ctx.STORY_REINCARNATION_W3_ISOLATION_VERSION,1);
 assert.ok(index.includes("storyprogress.js?v=20260928-thirdworld-batch12-o3&v2=20261007-reincarnation-story-batch2&v3=20261007-reincarnation-story-batch3"),"Story Batch3 cache-bust missing");
 console.log("Story reincarnation W3 Batch3 passed: first-run queue/Final unchanged; 1/2/3/7 life no playback; stale W3 pending removed; all 11 archived; actual 10 Boss battle completion independent of history and stale story stage.");
}
main().catch(e=>{console.error(e);process.exitCode=1});
