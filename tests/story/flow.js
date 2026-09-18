// 永久回歸檢查：首領首殺劇情排隊、重打不重播、pending 保護、舊紀錄補回、純讀取、正式入口與故事結構整理。
const fs=require('fs');
const vm=require('vm');

function assert(condition,message){
 if(!condition)throw new Error(message);
}

const combatCoreSource=fs.readFileSync('combatcore.js','utf8');
const battlePipelineSource=fs.readFileSync('battlepipeline.js','utf8');
const storyProgressSource=fs.readFileSync('storyprogress.js','utf8');
const storyRecordSource=fs.readFileSync('storyrecordtabs.js','utf8');
const storyUiSource=fs.readFileSync('storyui.js','utf8');
const runtimeIntegritySource=fs.readFileSync('storyruntimeintegrity.js','utf8');
const storyCssSource=fs.readFileSync('story.css','utf8');
const uiSource=fs.readFileSync('ui.js','utf8');
const migrationSource=fs.readFileSync('storymigration.js','utf8');

// Owner contract: combatcore is the only runtime owner that queues a first-clear story.
assert((combatCoreSource.match(/queueBossStory/g)||[]).length===2,'combatcore.js 應只有 queueBossStory 能力檢查與一次實際呼叫');
assert(/if\(firstBossKill&&window\.civilizationStoryProgress\?\.queueBossStory\)pendingStoryId=window\.civilizationStoryProgress\.queueBossStory\(mapIdx\)/.test(combatCoreSource),'combatcore.js 首殺排隊契約不存在');
assert(!/queueBossStory/.test(battlePipelineSource),'battlepipeline.js 不得再次呼叫 queueBossStory');
assert(/result\.pendingStoryId/.test(battlePipelineSource),'battlepipeline.js 必須只消費 fightOnce 回傳的 pendingStoryId');
assert(/MAINLINE_BOSS_STORY_PIPELINE_VERSION=2/.test(battlePipelineSource),'battlepipeline.js 劇情管線版本應為 2');

// Read/entry contracts: get() must be pure, story record must not wrap global go(), and ui.go owns the entry hook.
assert(/get:\(\)=>readProgress\(\)/.test(storyProgressSource),'storyprogress.get 必須直接純讀 readProgress()');
assert(!/function progress\(\)\{normalizeProgress\(state\)/.test(storyProgressSource),'storyprogress 不得在一般 getter 中執行 migration');
assert(/CIVILIZATION_STORY_PROGRESS_VERSION=9/.test(storyProgressSource),'story progress 版本應為 9');
assert(!/__storyRecordLatestWrapped|originalGo/.test(storyRecordSource),'storyrecordtabs.js 不得再包裝全域 go()');
assert(/STORY_RECORD_TABS_VERSION=5/.test(storyRecordSource),'story record tabs 版本應為 5');
assert(/v===\"storyrecord\"&&typeof window\.prepareStoryRecordEntry===\"function\"/.test(uiSource),'ui.go 必須在進入戰線紀錄時呼叫正式 prepareStoryRecordEntry hook');
assert(/legacyFields:LEGACY_FIELDS\.slice\(\)/.test(migrationSource),'storymigration 必須公開 legacyFields');
assert(/LEGACY_FIELDS=\["historyBackfillRegions"\]/.test(migrationSource),'historyBackfillRegions legacy 相容欄位標記遺失');
assert(/delete p\.historyBackfillRegions/.test(migrationSource),'storymigration 必須正式移除 historyBackfillRegions');
assert(/STORY_MIGRATION_VERSION=VERSION/.test(migrationSource),'story migration 版本輸出遺失');

// Structure contracts: story CSS must live in story.css, not be injected by runtime JS.
for(const [name,source] of [['storyui.js',storyUiSource],['storyrecordtabs.js',storyRecordSource],['storyprogress.js',storyProgressSource]]){
 assert(!/createElement\(["']style["']\)|\.textContent=`\s*\.story-|\.textContent=`\s*\.starter-gear-/.test(source),`${name} 不得再 runtime 注入故事 CSS`);
}
for(const selector of ['.story-overlay','.story-record-page','.starter-gear-overlay'])assert(storyCssSource.includes(selector),`story.css 缺少必要 selector：${selector}`);
assert(/STORY_UI_VERSION=6/.test(storyUiSource),'story UI 版本應為 6');

// Runtime integrity: behavior/capability failures are authoritative; version age is warning-only.
assert(/const versionHint=/.test(runtimeIntegritySource),'storyruntimeintegrity 應以 versionHint 提供版本警告');
assert(/warn\("STORY_RUNTIME_VERSION_HINT"/.test(runtimeIntegritySource),'版本落後應只產生 warning');
assert(!/if\(Number\(window\.[A-Z0-9_]+\)<\d+\)fail/.test(runtimeIntegritySource),'Runtime Integrity 不得再只因版本號較舊就 fail');
assert(/STORY_RUNTIME_INTEGRITY_VERSION=VERSION/.test(runtimeIntegritySource),'Runtime Integrity 版本輸出遺失');

const context={
 console,
 setTimeout:()=>0,
 clearTimeout:()=>{},
 queueMicrotask:()=>{},
 requestAnimationFrame:fn=>{if(typeof fn==='function')fn();},
 Date,
 Math,
 JSON,
 Object,
 Array,
 Set,
 Map,
 String,
 Number,
 Boolean,
 RegExp,
 Error,
 Buffer,
 atob:s=>Buffer.from(String(s),'base64').toString('binary'),
 btoa:s=>Buffer.from(String(s),'binary').toString('base64'),
 save:()=>{},
 registerNewStateNormalizer:()=>{},
 LAST_SAVE_LOAD_REPORT:{hadRaw:true},
 BACKGROUND_PRELOAD_READY:false,
 CIVILIZATION_AUTH_REQUIRED:false,
 addEventListener:()=>{},
 document:{
  readyState:'loading',
  addEventListener:()=>{},
  getElementById:()=>null,
  createElement:()=>({style:{},classList:{add(){},remove(){}},setAttribute(){},remove(){}}),
  head:{appendChild(){}},
  body:{appendChild(){}}
 }
};
context.window=context;
vm.createContext(context);

const files=[
 'data.js',
 'worldmaps-earth.js','worldmaps-solar.js','worldmaps-nearstar.js','worldmaps-frontier.js','worldmaps-orion.js','worldmaps-galactic-frontier.js','worldmaps-galactic-mid.js','worldmaps-core-outer.js','worldmaps-core-war.js','worldmaps-galactic-unification.js',
 'storydata-earth.js','storydata-solar.js','storydata-nearstar.js','storydata-frontier.js','storydata-orion.js','storydata-galactic-frontier.js','storydata-galactic-mid.js','storydata-core-outer.js','storydata-core-war.js','storydata-galactic-unification.js',
 'storyintegrity.js','storymigration.js'
];

for(const file of files){
 vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
vm.runInContext('var EQUIPMENT_TYPES=[];',context);

function baseState(){
 return {
  level:100,exp:0,gold:0,unlockedMap:19,inventory:[],equipment:{},hp:1,
  bossKilled:Array(100).fill(false),
  bossLocked:Array(100).fill(false),
  bossProgress:Array(100).fill(0),
  mapProgress:Array.from({length:100},()=>[0,0,0,0]),
  storyProgress:{pendingStory:null,completedStories:['earth-prologue'],introCompleted:true,starterGearReceived:true},
  introSeen:true
 };
}

context.state=baseState();
vm.runInContext(fs.readFileSync('storyprogress.js','utf8'),context,{filename:'storyprogress.js'});

const progress=context.civilizationStoryProgress;
assert(progress&&typeof progress.queueBossStory==='function','storyprogress.js 未提供 queueBossStory');
assert(Number(context.CIVILIZATION_STORY_PROGRESS_VERSION)>=9,'story progress 版本不足');
assert(Number(context.STORY_MIGRATION_VERSION)>=5,'story migration 版本不足');
assert(Array.isArray(context.civilizationStoryMigration?.legacyFields)&&context.civilizationStoryMigration.legacyFields.includes('historyBackfillRegions'),'historyBackfillRegions 未標成 legacy 相容欄位');

// 0. Pure getter: deliberately malformed-but-readable data must not be normalized just because it is read.
context.state=baseState();
context.state.storyProgress.completedStories=['earth-prologue','earth-prologue'];
context.state.storyProgress.historyBackfillRegions=['solar','solar'];
const beforePureRead=JSON.stringify(context.state.storyProgress);
const readValue=progress.get();
const afterPureRead=JSON.stringify(context.state.storyProgress);
assert(readValue===context.state.storyProgress,'get() 應直接回傳目前 storyProgress 參照');
assert(beforePureRead===afterPureRead,'get() 不得修改、去重、回填或清除 legacy 欄位');

const mapIdx=19;
const storyId='solar-boss-10';
assert(context.CIVILIZATION_STORIES?.[storyId],'測試故事 solar-boss-10 不存在');

// 1. 首殺：combatcore 先把 bossKilled=true，再由唯一 owner 排 pending；不得被 backfill 提前吃掉。
context.state=baseState();
context.state.bossKilled[mapIdx]=true;
let queued=progress.queueBossStory(mapIdx);
assert(queued===storyId,`首殺應排入 ${storyId}，實際 ${queued}`);
assert(context.state.storyProgress.pendingStory===storyId,'首殺後 pendingStory 應存在');
assert(!context.state.storyProgress.completedStories.includes(storyId),'首殺 pending 不得被 backfill 提前標成 completed');

// 2. 看完後重打：故事已 completed 時，不得再次排 pending。
progress.completeStory(storyId);
assert(context.state.storyProgress.pendingStory===null,'完成故事後 pendingStory 應清除');
assert(context.state.storyProgress.completedStories.includes(storyId),'完成故事後 completedStories 應包含故事');
queued=progress.queueBossStory(mapIdx);
assert(queued===null,'已完成的首領故事不得再次排隊');
assert(context.state.storyProgress.pendingStory===null,'重打已完成首領不得建立 pendingStory');

// 3. pending 保護：一般 migration/backfill 不得把正在等待播放的首殺故事標成 completed。
context.state=baseState();
context.state.bossKilled[mapIdx]=true;
context.state.storyProgress.pendingStory=storyId;
progress.normalize(context.state);
assert(context.state.storyProgress.pendingStory===storyId,'migration 後 pendingStory 不得遺失');
assert(!context.state.storyProgress.completedStories.includes(storyId),'migration 不得把 pendingStory 回填成 completed');

// 4. 舊紀錄補回＋退休欄位清除：legacy historyBackfillRegions 不得阻止 repair，migration 後也不再保留。
context.state=baseState();
context.state.bossKilled[mapIdx]=true;
context.state.storyProgress.historyBackfillRegions=['solar'];
progress.normalize(context.state);
assert(context.state.storyProgress.completedStories.includes(storyId),'舊存檔缺失的已擊敗 Boss 劇情必須補回');
assert(!Object.prototype.hasOwnProperty.call(context.state.storyProgress,'historyBackfillRegions'),'migration 後必須移除 historyBackfillRegions');

// 5. 新資料不得重新產生退休欄位。
context.state=baseState();
progress.normalize(context.state);
assert(!Object.prototype.hasOwnProperty.call(context.state.storyProgress,'historyBackfillRegions'),'新 storyProgress 不得建立 historyBackfillRegions');

console.log('STORY FLOW PASSED');
console.log('owner=combatcore pureGet=yes recordEntry=ui-hook css=external versionGate=warning repeat=no-replay pending=protected legacy=repaired-and-removed');
