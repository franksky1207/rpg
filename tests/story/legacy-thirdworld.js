const fs=require('fs');
const vm=require('vm');
function assert(value,message){if(!value)throw new Error(message);}
function clone(value){return JSON.parse(JSON.stringify(value));}
const context={console,Date,Math,JSON,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error};context.window=context;
const w3Ids=['higher-dimensional-intro',...Array.from({length:9},(_,i)=>`higher-dimensional-milestone-${String(i+1).padStart(2,'0')}`),'higher-dimensional-final'];
context.thirdWorldStoryTriggerDescriptor=value=>w3Ids.includes(String(value||''))?{storyId:String(value)}:null;
vm.createContext(context);
vm.runInContext(fs.readFileSync('storymigration.js','utf8'),context,{filename:'storymigration.js'});
assert(context.STORY_MIGRATION_VERSION===7,'Story Migration 必須升為 V7。');
assert(context.THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION===1&&context.THIRD_WORLD_STORY_CONTENT_VERSION===1,'W3 Story content version owner 未就緒。');
const stories={
 'earth-prologue':{},
 'universe-galaxy-beyond-boss-1':{},
 ...Object.fromEntries(w3Ids.map(id=>[id,{}]))
};
const options={introStoryId:'earth-prologue',stories,regions:[],skipBackfill:true};
const bosses=Array.from({length:10},(_,index)=>({currentHp:index<5?0:1100000000}));
const legacy={
 thirdWorld:{entered:true,completed:true,entryVersion:2,dimensionalStrings:1234567890,coreLevel:6,coreProgress:345678901,bosses:clone(bosses),story:{introSeen:true,unlockedStage:5,finalSeen:true}},
 storyProgress:{pendingStory:'higher-dimensional-milestone-05',completedStories:['earth-prologue','universe-galaxy-beyond-boss-1','higher-dimensional-intro','higher-dimensional-milestone-01','higher-dimensional-milestone-02','higher-dimensional-final'],introCompleted:true,starterGearReceived:true}
};
const formalStateBefore=clone(legacy.thirdWorld);
const migrated=context.civilizationStoryMigration.migrate(legacy,options);
assert(migrated.changed===true,'舊 Schema16 W3 story history 應觸發一次 content migration。');
assert(legacy.storyProgress.thirdWorldContentVersion===1,'舊檔 migration 後必須寫入 W3 Story content version。');
assert(legacy.storyProgress.pendingStory===null,'舊開發版 W3 pendingStory 必須清除，讓正式內容依 Stage 重新補播。');
assert(JSON.stringify(legacy.storyProgress.completedStories)===JSON.stringify(['earth-prologue','universe-galaxy-beyond-boss-1']),'舊開發版 W3 completedStories 應全部重置，但 W1／W2 正式歷史必須保留。');
assert(JSON.stringify(legacy.thirdWorld)===JSON.stringify(formalStateBefore),'Story content migration 不得改 Boss HP、Core、Stage 或任何 W3 正式戰鬥進度。');
const report=context.LAST_STORY_CONTENT_MIGRATION_REPORT;
assert(report?.applied===true&&report?.reason==='legacy-w3-story-history-reset','舊 W3 Story migration report 應明確標記正式重播重建。');
assert(report?.removedCompleted?.includes('higher-dimensional-final')&&report?.removedPending==='higher-dimensional-milestone-05','Migration report 必須列出被重置的舊 W3 refs。');

const current={
 thirdWorld:{entered:true,completed:false,entryVersion:2,bosses:clone(bosses),story:{introSeen:true,unlockedStage:5,finalSeen:false}},
 storyProgress:{pendingStory:'higher-dimensional-milestone-05',completedStories:['earth-prologue','higher-dimensional-intro','higher-dimensional-milestone-01'],introCompleted:true,starterGearReceived:true,thirdWorldContentVersion:1}
};
context.civilizationStoryMigration.migrate(current,options);
assert(current.storyProgress.pendingStory==='higher-dimensional-milestone-05','正式 content version 的合法 W3 pendingStory 不得被清除。');
assert(current.storyProgress.completedStories.includes('higher-dimensional-milestone-01'),'正式 content version 的 W3 completedStories 不得被重置。');

const future={
 thirdWorld:{entered:true,entryVersion:2,bosses:clone(bosses),story:{unlockedStage:5}},
 storyProgress:{pendingStory:'higher-dimensional-milestone-05',completedStories:['higher-dimensional-intro'],introCompleted:false,starterGearReceived:false,thirdWorldContentVersion:2}
};
context.civilizationStoryMigration.migrate(future,options);
assert(future.storyProgress.thirdWorldContentVersion===2&&future.storyProgress.pendingStory==='higher-dimensional-milestone-05','未知較新 Story content version 必須 fail-closed，不得降版或刪除 refs。');

const fresh={thirdWorld:{entered:false,entryVersion:0,bosses:clone(bosses),story:{unlockedStage:0}}};
context.civilizationStoryMigration.migrate(fresh,{...options,fresh:true});
assert(fresh.storyProgress.thirdWorldContentVersion===1,'新存檔建立 Story Progress 時必須直接標記目前正式 W3 content version。');

const phase=fs.readFileSync('thirdworldphase.js','utf8');
const progress=fs.readFileSync('storyprogress.js','utf8');
const phaseReconcile=(phase.match(/function reconcileThirdWorldStoryState\(target\)\{[\s\S]*?\n \}\n function reconcileThirdWorldCoreProgressionState/)||[''])[0];
assert(phaseReconcile.includes('stageOnly:true')&&phaseReconcile.includes('completionOwner:"civilizationStoryProgress"'),'W3 phase reconciliation 必須明確為 Stage-only。');
assert(!/story\.introSeen\s*=|story\.finalSeen\s*=|third\.completed\s*=/.test(phaseReconcile),'thirdworldphase 不得再寫入 W3 Story completion flags。');
assert(/function reconcileThirdWorldStoryCompletionState\(target=state\)/.test(progress),'shared Story Progress 必須保有 W3 completion reconciliation owner。');
assert(/third\.story\.introSeen=completed\.has/.test(progress)&&/third\.story\.finalSeen=finalDone;third\.completed=finalDone/.test(progress),'Intro／Final／thirdWorld.completed 必須只由 shared Story completion owner 從 completedStories 推導。');

console.log('LEGACY W3 STORY MIGRATION PASSED | contentVersion=1 | dev story refs reset once | boss/core/stage preserved | shared completion owner only');
