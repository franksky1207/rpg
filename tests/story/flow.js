// 永久回歸檢查：銀河既有 owner 不回歸，宇宙紀元共用同一 Story Progress / Record / GM 架構。
const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const combat=fs.readFileSync('combatcore.js','utf8');
const pipeline=fs.readFileSync('battlepipeline.js','utf8');
const progress=fs.readFileSync('storyprogress.js','utf8');
const record=fs.readFileSync('storyrecordtabs.js','utf8');
const gm=fs.readFileSync('gmstorytest.js','utf8');
const runtime=fs.readFileSync('storyruntimeintegrity.js','utf8');
const integrity=fs.readFileSync('storyintegrity.js','utf8');
assert((combat.match(/queueBossStory/g)||[]).length===2,'銀河 combatcore queueBossStory owner 契約改變');
assert(!/queueBossStory/.test(pipeline),'battlepipeline 不得再次排銀河故事');
assert(/function queueUniverseBossStory\(index\)/.test(progress),'storyprogress 缺少宇宙首殺 queue owner');
assert(/queueStory\(universeBossStoryId\(index\)\)/.test(progress),'宇宙首殺必須共用 queueStory/pending/completed');
assert(/UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION=1/.test(progress),'宇宙首殺 hook 版本遺失');
assert(/result\?\.ok&&result\.firstKill===true/.test(progress),'宇宙首殺 hook 未綁 firstKill');
assert(/completedStories/.test(progress)&&/pendingStory/.test(progress),'共用 storyProgress 欄位遺失');
assert(/storyRecordEraView="universe"/.test(record)&&/CIVILIZATION_UNIVERSE_STORY_REGIONS/.test(record),'戰線紀錄未支援宇宙紀元');
assert(/gmStoryChangeEra/.test(gm)&&/宇宙紀元/.test(gm),'GM 劇情測試未支援紀元切換');
assert(/universeStoriesExpected/.test(integrity)&&/totalStoriesTarget:201/.test(integrity),'資料 Integrity 未納入 201 篇最終目標');
assert(/UNIVERSE_STORY_REGISTRY_READY/.test(runtime)&&/UNIVERSE_STORY_FIRST_CLEAR_HOOK/.test(runtime),'Runtime Integrity 未驗證宇宙 Registry／首殺 hook');
assert(/CIVILIZATION_STORY_PROGRESS_VERSION=12/.test(progress),'story progress 版本應為 12');
assert(/STORY_RECORD_TABS_VERSION=7/.test(record),'story record tabs 版本應為 7');
console.log('STORY FLOW PASSED | galaxy owner preserved | universe shared architecture=yes | target=201');
