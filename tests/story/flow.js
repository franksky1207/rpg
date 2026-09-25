// 永久回歸檢查：銀河既有 owner 不回歸，宇宙紀元共用同一 Story Progress / Record / GM 架構。
// 維護註記：此測試亦作為跨模組重構後的 exact-head 最終驗證觸發點。
const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const combat=fs.readFileSync('combatcore.js','utf8');
const pipeline=fs.readFileSync('battlepipeline.js','utf8');
const progress=fs.readFileSync('storyprogress.js','utf8');
const record=fs.readFileSync('storyrecordtabs.js','utf8');
const gm=fs.readFileSync('gmstorytest.js','utf8');
const runtime=fs.readFileSync('storyruntimeintegrity.js','utf8');
const integrity=fs.readFileSync('storyintegrity.js','utf8');
const storyui=fs.readFileSync('storyui.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const region5=fs.readFileSync('storydata-universe-trans-domain-frontier.js','utf8');
assert((combat.match(/queueBossStory/g)||[]).length===2,'銀河 combatcore queueBossStory owner 契約改變');
assert(!/queueBossStory/.test(pipeline),'battlepipeline 不得再次排銀河故事');
assert(/function queueUniverseBossStory\(index\)/.test(progress),'storyprogress 缺少宇宙首殺 queue owner');
assert(/queueStory\(universeBossStoryId\(index\)\)/.test(progress),'宇宙首殺必須共用 queueStory/pending/completed');
assert(/UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION=1/.test(progress),'宇宙首殺 hook 版本遺失');
assert(/result\?\.ok&&result\.firstKill===true/.test(progress),'宇宙首殺 hook 未綁 firstKill');
assert(/completedStories/.test(progress)&&/pendingStory/.test(progress),'共用 storyProgress 欄位遺失');
assert(/storyRecordEraView="universe"/.test(record)&&/CIVILIZATION_UNIVERSE_STORY_REGIONS/.test(record),'戰線紀錄未支援宇宙紀元');
assert(/gmStoryChangeEra/.test(gm)&&/宇宙紀元/.test(gm),'GM 劇情測試未支援紀元切換');
assert(!/loadUniverseSample|data-universe-story-sample/.test(gm),'GM 不得再動態載入宇宙 sample 劇情');
assert(/GM_STORY_TEST_VERSION=6/.test(gm),'GM 劇情測試版本應為 6');
assert(/universeStoriesExpected/.test(integrity)&&/totalStoriesTarget:201/.test(integrity),'資料 Integrity 未納入 201 篇最終目標');
assert(/UNIVERSE_STORY_REGISTRY_READY/.test(runtime)&&/UNIVERSE_STORY_FIRST_CLEAR_HOOK/.test(runtime),'Runtime Integrity 未驗證宇宙 Registry／首殺 hook');
assert(/CIVILIZATION_STORY_PROGRESS_VERSION=12/.test(progress),'story progress 版本應為 12');
assert(/STORY_RECORD_TABS_VERSION=7/.test(record),'story record tabs 版本應為 7');
const universeFiles=['storydata-universe-galaxy-beyond.js','storydata-universe-local-group-war.js','storydata-universe-star-cluster-frontier.js','storydata-universe-stellar-battlefront.js','storydata-universe-cosmic-filament.js','storydata-universe-stellar-great-wall.js','storydata-universe-cosmic-deep-domain.js','storydata-universe-trans-domain-frontier.js','storydata-universe-myriad-domain-frontline.js','storydata-universe-cosmic-unification-war.js'];
assert(index.includes('secondworldstoryregistry.js?v='),'index.html 必須正式載入 secondworldstoryregistry.js');
universeFiles.forEach(file=>{assert(fs.existsSync(file),'缺少宇宙正式劇情資料容器：'+file);assert(index.includes(file+'?v='),'index.html 缺少宇宙正式劇情資料檔：'+file);});
assert(index.indexOf('secondworldstoryregistry.js?v=')<index.indexOf('storydata-universe-galaxy-beyond.js?v='),'宇宙 Registry 必須早於正式劇情資料載入');
assert(index.indexOf('storydata-universe-cosmic-unification-war.js?v=')<index.indexOf('storyintegrity.js?v='),'10 區宇宙劇情資料必須在 storyintegrity 前載入');
assert((region5.match(/add\("universe-trans-domain-frontier-boss-\d+"/g)||[]).length===10,'第五章・超域邊境必須有 10 篇正式劇情');
assert(/function regionFinaleLabel\(story\)/.test(storyui)&&/story-em/.test(storyui),'宇宙區域完成標記必須由共用 Story UI 自動產生');
assert(index.includes('storydata-universe-trans-domain-frontier.js?v=20260923-universe-region5-meta1'),'第五章・超域邊境 cache-bust 未更新');
console.log('STORY FLOW PASSED | galaxy owner preserved | universe formal runtime load=yes | containers=10 | region5=10 | shared finale marker=yes | target=201');
