# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-23  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本檔是交接摘要，不是第二套規格。若本檔、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。任何修改前必須重新讀正式 owner、直接相依、Integrity / workflow 與 `index.html` 載入順序。

---

# 1. 專案定位／存檔

《文明戰線》為純前端網頁文字／數值養成／科幻星際 RPG，支援桌機與手機。

- **銀河紀元**：Lv.1～500，10 區、100 地圖、普通／菁英／Boss。
- **宇宙紀元**：進入後可升至 Lv.1000，10 區、100 隻主線 Boss；沒有銀河每圖 5 怪結構。
- 世界永久狀態以 `secondWorld.entered` 為準，不建立第二套 `currentWorld` save。
- 正式 save key：`frank_text_rpg_save`。
- `SAVE_VERSION=13`、`SAVE_SCHEMA_VERSION=15`、`SAVE_LOAD_PIPELINE_VERSION=2`、`SAVE_NORMALIZATION_PIPELINE_VERSION=1`。
- Save Write Guard V1 必須保留；local save 未成功 resolve 前不得以新 state 覆蓋。
- parse/root/migration 失敗要 fail protected。
- schema 15 會清掉 GM transient 欄位；GM sandbox 不得寫正式 save。
- Arena legacy dungeon cleanup 的正式 owner 是 `savemigration.js`；runtime normalization 不再做破壞性 legacy cleanup。

正式 normalization 順序：
`worldPhase → worldProgress → level → gear → enhancement → vip → specialization → daily → dungeon → calamity → titles → offline → persistentFlags`。

---

# 2. 世界／主線／等級

## 2.1 銀河紀元

正式 owner：`data.js`、`worldmaps-*.js`、`engine.js`、`battlepipeline.js`。

10 區依序：地球戰爭、太陽系戰爭、近星戰爭、星際邊疆、獵戶臂戰爭、銀河邊境、銀河中域、銀河核心外圍、銀河核心戰爭、銀河統合戰爭。每區 10 地圖，每圖 5 級範圍、5 隻怪。

## 2.2 宇宙紀元

正式 owner：`secondworlddata.js`、`secondworldmainline.js`、`secondworldcombat.js`、`secondworldrewards.js`。

- 10 區／100 Boss；Boss 等級 505、510、…、1000，每區 10 隻。
- canonical 區域：銀河彼端、本星系群戰爭、星群邊疆、群星會戰、超域邊境、萬域戰線、宇宙纖維帶、星海巨牆、宇宙深域、宇宙統合戰爭。
- `secondworlddata.js` 是區域／Boss／裝備名稱／玩家等級→Boss 對應的 canonical data owner；`secondWorldBossIndexForPlayerLevel()`、`secondWorldBossForPlayerLevel()`、`secondWorldRegion()`、`secondWorldRegionVisible()` 等 API 已集中於此。
- 世界入口：Lv.500、第一世界最終主線完成、8 專精全 60、5 部位 +20、10 印記全 10；VIP 不限。
- 進入宇宙時初始化 `secondWorld` 並切斷第一世界離線殘留；`isSecondWorldEntered()` 保持 pure read。

宇宙主線 Boss 正式基準：
```text
BASE_STAT = 2700
HP : ATK : DEF = 12 : 2 : 1
N = 0..99
M(N) = 1 + 0.015*N
HP  = ceil(2700*12*M)
ATK = ceil(2700*2*M)
DEF = ceil(2700*1*M)
```
- Lv.505：32,400 / 5,400 / 2,700。
- Lv.1000：80,514 / 13,419 / 6,710。
- 基礎暴擊／閃避 0%，仍可受特性修改。
- `SECOND_WORLD_BOSS_STAT_FORMULA_VERSION=1`。
- 前期 `BASE_STAT=2700` 使用者實測約 93～98%；`STEP_RATE=.015` 尚需中後期實機驗證。

## 2.3 world-aware 等級 owner

正式 runtime owner：`levelprogression.js`。

- `FIRST_WORLD_LEVEL_CAP=500`
- `SECOND_WORLD_LEVEL_CAP=1000`
- `ABSOLUTE_MAX_LEVEL=1000`
- `LEVEL_PROGRESSION_VERSION=1`（公開相容版本刻意維持）
- `LEVEL_RUNTIME_WORLD_CAP_OWNER_VERSION=1`
- `LEGACY_MAX_LEVEL_MIGRATION_ONLY_VERSION=1`
- runtime 走 `effectiveLevelCap()`；legacy `MAX_LEVEL=500` 只作 migration 相容。
- `expNeed / gainExp / clampGameLevel` 已接 world-aware owner。

宇宙 EXP：
```text
Lv.500～999：ceil((25 + 4*L) * 250)
Lv.1000：0
```
Integrity 基準：Lv.500=506,250；Lv.999=1,005,250；Lv.1000=0。銀河滿等 EXP 可 1:1 轉金幣；宇宙滿等不可誤轉金幣。

---

# 3. 宇宙資源／裝備／死亡／強化

宇宙主線勝利：EXP 走 `secondWorldBossExpReward()`（含 training）；暗物質 `20 + 2*N` 再套 scavenge；每勝 +1 暗能量；每勝固定 1 件 world2 裝備；不給銀河金幣／強化石。world2 品質：優良45%、稀有35%、史詩15%、傳說4.5%、神話0.5%。

死亡：所有正式戰鬥死亡／戰敗不扣既有 EXP、不降級；仍有30%機率遺失一件穿戴裝備，VIP20完全防止。world2 贖回＝正式出售價×10暗物質；world1 裝備在宇宙死亡遺失後免費贖回。

出售 owner：`equipmentSaleQuote / equipmentSaleBatchQuote / settleEquipmentSale / settleEquipmentSaleBatch`。world2：`N=floor((equipmentLevel-500)/5)`、`B=20+2N`、`saleDM=ceil(B*qualityMultiplier*appraisalMultiplier)`；神話出售額外 +1 暗能量，鑑價只放大暗物質。

強化：銀河正式 +0～+20；宇宙正式 +20～+40；GM sandbox 0～40。每級主屬性 +2.5%，+40＝+100%。+21～+40：`K=targetLevel-21`；暗物質=`30000+12000K`；暗能量=`300+10K`。+20→+40 五欄總成本：暗物質14,400,000、暗能量39,500。宇宙正式若 <+20 視為資料異常，不由 normalization 免費補值。

---

# 4. VIP／專精／文明等級

VIP 最大20；門檻 `1000*level²`。HP/ATK 每級 +0.5%，DEF +0.25%，暴擊／閃避各 +0.25 個百分點。副本積分倍率：VIP0～3 ×1.00、4～11 ×1.10、12～20 ×1.20。

8 專精最大60；training/scavenge/appraisal 各 +2.5%/Lv，initiative 第一擊 +1%/Lv；combo/penetration/counter/drain 走 Combat Core 正式規則。宇宙不建立第二套專精公式。

文明等級 `secondWorld.civilizationLevel` 0～10；宇宙每級 final damage +5%，Lv.10 ×1.50，銀河 ×1.00。唯一正式入口：`civilizationCombatDamageMultiplier({world,state,civilizationLevel})`。已接宇宙主線、特殊怪、宇宙災厄、懸賞、競技、虛空、鏡像與對應 GM/Benchmark；鏡像雙方同倍率維持對稱。禁止各模式另造文明倍率公式。

---

# 5. 戰鬥節奏／背景／離線

- 銀河一般 1×；宇宙一般 1×/1.5×；GM 可 2×，localStorage 持續。
- 全模式 outer gap 140ms；不要恢復舊 220/300/350/450ms 或 60/80ms 啟動等待。
- Background 單一 active flow；最長12小時；credit rate 0.96；主線／虛空／災厄等使用共用 fast catch-up 政策。
- 宇宙主線逐場 atomic save 刻意保留。
- Offline：最短1分鐘、最多12小時；EXP 10%；銀河金幣10%／宇宙暗物質10%；裝備掉落流程10%；銀河直接強化石期望5%／宇宙直接暗能量5%。
- 每速度最多8筆真實樣本；1×/1.5×/2× 可跨速換算，只縮 actual combat time，140ms outer gap 不縮。
- world2 離線出售走正式 sale owner；不得產生特殊遭遇、首次 Boss 等非法副作用。

---

# 6. 文明災厄／印記／稱號

銀河災厄10隻：HP=`500000*階級`，ATK 對應 Boss×1.10、DEF×1.05；無一般戰利品。印記未滿殘血保存；印記 Lv.10 後只允許單場重打、每場滿 HP、敗北不保存殘血。

印記10枚、最大Lv.10；升級擊殺數 1,1,2,2,3,3,4,4,5,5；正式 owner `markcore.js`。

宇宙災厄10隻：解鎖節點550、600、…、1000，對應章末 Boss index 9、19、…、99；HP 1,000,000 起每隻 +200,000 至2,800,000，ATK×1.10、DEF×1.05、暴／閃10%。每隻30 true kills完成，1 kill=3.33%，30=100%，完成一階 Civilization +1。未完成殘血 persistent；完成後重打每場滿血、不再加 trueKills、不保存敗北殘血、不顯示連續重打。「現身」與「可挑戰」分離：章末 Boss 首殺先通知現身，實際挑戰仍需前一文明完成（第一隻例外）。

稱號共16個：災厄10 + 鏡像15～20勝6個。

---

# 7. 特殊怪

雙紀元共用同一組9個 ID，不建立第二套系統。宇宙名稱：星源聚合體、虛空誘餌艙、終焉協議體、星運增幅信標、古域警戒機、星藏保全體、暗域黑市王、星骸回收者、界域交易使。

- 遭遇率8%；VIP6 +2%；VIP10 有10%第二次特殊獎勵。
- 宇宙使用正式 second-world EXP／暗物質／裝備 builder；不直接 +1 暗能量。
- world2 特殊怪失敗走正式宇宙死亡懲罰。
- 黑市 pending chain 共用；章末災厄現身通知優先。
- `SPECIAL_WORLD_DROP_OWNER_VERSION=2`、`SPECIAL_WEAK_SLOT_CONTEXT_VERSION=1`。
- GM weak-slot 必須使用 explicit 測試裝備 context，不讀正式裝備。

---

# 8. 副本

## 8.1 懸賞 V2（已定案）

第二世界懸賞已完成；除非使用者明確重開平衡，不主動微調。shared daily bounty limit 20，進宇宙不重置；失敗不套主線 world2 death penalty；無直接暗能量。

`d=0/1/2`：
```text
HP   = 1 + .67d - .19d²
傷害 = 1 + .57d - .13d²
DEF  = .88 + .15d - .04d²
```
普通1.00/1.00/.88；高級1.48/1.44/.99；危險1.58/1.62/1.02。宇宙敵方 HP 乘文明 final damage 倍率抵消 player-relative 漂移；銀河 ×1。大量模擬約普通100%、高級98%、危險83～84%。

## 8.2 競技場 canonical world owner

正式 state：`state.dungeon.arenaByWorld={1:{...},2:{...}}`，兩世界獨立。`dungeon.arena` 只保留 non-enumerable compatibility getter/setter alias，不是正式持久 owner。

- `ARENA_BY_WORLD_STATE_VERSION=2`
- `ARENA_BY_WORLD_COMPAT_ALIAS_VERSION=2`
- `ARENA_WORLD_OWNER_VERSION=2`
- `ARENA_REGION_OWNER_VERSION=2`
- `SECOND_WORLD_ARENA_UNLOCK_VERSION=2`
- `DUNGEON_RUNTIME_NORMALIZATION_VERSION=2`
- legacy cleanup owner=`savemigration.js`。

Arena compatibility profile：positionModel1 / assessmentRule4 / assessmentState4 / assessmentRuntime4 / balance6 / rankBalance3 / positionApi1 / enemyProfile1 / pacingSource1。不相容舊 assessment 會失效。

宇宙10 Rank；正式評估固定500場，至少485/500=97%。解鎖下一 Rank 雙條件：目前最高 Rank 評估≥97% + 下一競技場所屬主線區域已解鎖。選擇視窗只顯示最近最多3個已解鎖 Rank；promotion 後清舊 assessment signature/runs/clears。

宇宙 Rank Curve V2（第一世界 curve 不動）：
```text
x=Rank-1
HP   = 1.68 + .05x - .0015x²
傷害 = 1.52 + .04x - .001x²
DEF  = 1.11 + .022x - .0004x²
```
宇宙 Arena 敵方 HP 乘同一文明倍率作耐久補償；GM `buildArenaEnemyForTest(...)` 用 explicit civilization level，不暫改正式 state。

大量模擬預估 Rank1～10 全通率：約99.7、98.2、98.1、96.8、95.3、93.2、91.0、88.4、85.6、82.4%。**尚待實機驗收**：Lv.600／VIP8／+24全身／專精60／印記10／文明Lv.2，在遊戲內 GM 跑 Rank1～3 各500次正式評估。

宇宙三連戰敵人：星域戰爭構裝 → 宇宙征戰構裝 → 文明終焉構裝；銀河仍為基礎模擬單元 → 戰術強化單元 → 極限測試平台。UI 顯示目前紀元、canonical 場名、三戰對手、雙條件解鎖。

宇宙 points base：normal570 / hard620 / extreme670；Rank4 起每階 +60。三連戰不回血，新一輪才回血；shared daily arena limit20。

## 8.3 虛空／鏡像

虛空維持無限；GM 不分紀元 selector。宇宙角色文明 final damage 生效；GM 可指定樓層預覽／連爬。

鏡像不分紀元 selector；正式每次20戰；VIP points=`20*wins²`。宇宙文明倍率納入 snapshot 且雙方對稱。GM 鏡像讀 GM 測試角色 snapshot。鏡像首頁卡正式由 `dungeonui.js` 擁有，`mirrordungeonui.js` 聚焦鏡像頁本身。

---

# 9. 銀河回顧系統

宇宙紀元可回顧銀河冒險100地圖、文明災厄10隻與戰線紀錄。

- 回顧戰：單場、零收益、零損失、零正式進度／紀錄影響；正式 HP 戰後還原。
- 回顧 selection 與正式銀河 `selectedMap/selectedEnemy` 分離。
- 冒險背包 return context 區分銀河正式／銀河回顧／宇宙主線。
- 宇宙 Boss 卡有背包入口。
- 回顧選擇在同一頁面 session 內保留；整理／重開網頁才回預設宇宙紀元，不要每次切頁自動跳回。
- `galaxyreviewintegrity.js` 提供最後一道正式 state safety guard：回顧前 snapshot，若流程誤改正式 state 自動 restore 並重新 normalize dungeon state。
- 重要版本：`GALAXY_REVIEW_FORMAL_STATE_GUARD_VERSION=1`、`GALAXY_REVIEW_SELECTION_OWNER_VERSION=1`、`GALAXY_REVIEW_SELECTION_ISOLATION_VERSION=1`、`GALAXY_REVIEW_BATTLE_RUNTIME_VERSION=3`、`GALAXY_ADVENTURE_REVIEW_BATTLE_VERSION=2`。

---

# 10. 正式劇情系統（本次對話新增重點）

## 10.1 共用架構

銀河與宇宙共用同一套正式 `CIVILIZATION_STORIES`、`storyProgress`、正式劇情視窗、戰線紀錄與 GM 劇情測試架構，不建立第二套宇宙劇情系統。

- 銀河正式劇情維持 **101 篇**：序章1 + 100 Boss。
- 宇宙紀元正式 Registry 已建立 **10 區／100 Boss／100 個唯一 story ID**，最終全專案目標為 **201 篇**。
- 宇宙 Registry 正式 owner：`secondworldstoryregistry.js`，`UNIVERSE_STORY_REGISTRY_VERSION=1`；`UNIVERSE_STORY_REGISTRY_READY` 必須為 true。
- 宇宙 story ID 由 `universeStoryIdForBossIndex()`／`universeBossIndexForStoryId()` 正反向對應；不要在 storydata、UI 或 GM 再複製 ID 推導。
- `CIVILIZATION_STORY_ERAS` 已正式提供 galaxy / universe 兩紀元 Registry。

## 10.2 宇宙正式劇情資料現況

10 個正式資料容器已全部建立並由 `index.html` 正式載入：

1. `storydata-universe-galaxy-beyond.js`
2. `storydata-universe-local-group-war.js`
3. `storydata-universe-star-cluster-frontier.js`
4. `storydata-universe-stellar-battlefront.js`
5. `storydata-universe-cosmic-filament.js`
6. `storydata-universe-stellar-great-wall.js`
7. `storydata-universe-cosmic-deep-domain.js`
8. `storydata-universe-trans-domain-frontier.js`
9. `storydata-universe-myriad-domain-frontline.js`
10. `storydata-universe-cosmic-unification-war.js`

目前正式文字已完成 **3/100**：`universe-galaxy-beyond-boss-1`、`boss-2`、`boss-10`；其餘容器目前只建立正式結構／註解，尚未填入正式故事文字。不要把「100篇已完成」寫入狀態。

正式格式政策：序章12頁、一般 Boss 11頁、區域終章15頁、最終 Boss 31頁；頁面字數與自然文字區塊規範由 `storyintegrity.js` 的 `STORY_FORMAT_POLICY` 管理。正式顯示文字不得含英文，敘事內不得混入「小區域、關卡、第幾關、普通怪、菁英怪、Boss、玩家、頁數、遊戲、等級、首領戰」等內部遊戲用語。

## 10.3 宇宙首殺觸發／流程

`storyprogress.js` 為共用 progress owner，`CIVILIZATION_STORY_PROGRESS_VERSION=12`。

- `queueUniverseBossStory(index)` 直接共用 `queueStory()`／`pendingStory`／`completedStories`。
- `settleSecondWorldBossVictory` 的 firstKill hook：只有 `result.ok && result.firstKill===true` 才排入對應宇宙正式劇情；`UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION=1`。
- 若該 Boss 尚未首殺且已有正式故事資料，宇宙連續戰會先降為單場，確保首殺故事能正常中斷並顯示；已首殺後才恢復原連續流程。
- 銀河既有 `queueBossStory` owner 保持不變，`battlepipeline.js` 不得重複排銀河故事。
- 完成故事仍走共用 `completeStory()`，可接既有災厄通知／第二世界故事完成 hook。

## 10.4 戰線紀錄／GM

`storyrecordtabs.js`：`STORY_RECORD_TABS_VERSION=7`、`STORY_RECORD_WORLD_REVIEW_VERSION=2`。進入宇宙後戰線紀錄預設宇宙紀元，可切「宇宙紀元」／「銀河紀元・回顧」；只顯示已完成且正式資料存在的故事；重播零獎勵、零進度變更。

`gmstorytest.js`：`GM_STORY_TEST_VERSION=6`。GM 劇情測試可切銀河／宇宙紀元、區域與劇情；宇宙100個 Registry 項目都可看到，尚未建立正式文字者標示「尚未建立」且不可預覽。GM 預覽直接使用正式 runtime 已載入資料，**不再動態載入 sample story**，也不得恢復 `loadUniverseSample`／`data-universe-story-sample`。

## 10.5 Integrity／CI

- `storyintegrity.js` / `tests/story/integrity.js`：驗證銀河101、宇宙10區／100 Registry、目前宇宙正式文字3/100、最終目標201、格式政策、title/location/chapter/頁數/字數/區塊等。
- `storyruntimeintegrity.js`：驗證 Registry、100 Boss 505～1000 等級序列、story ID 正反向 mapping、共用 progress/record/GM API、first-clear hook 與 pending story。
- `tests/story/source-purity.js`：直接讀正式 storydata 與雙紀元 Registry，檢查顯示文字本身為中文且敘事無內部遊戲用語；不得依賴 runtime 修字。
- `tests/story/flow.js`：鎖定銀河 owner 不回歸、宇宙 firstKill hook、共用 queue、10 個宇宙資料容器、正式 load order、GM 不得恢復 sample loader。
- `.github/workflows/story-integrity.yml` 正式流程：Source Purity → Story Data Integrity → Flow Regression；診斷報告以 artifact 暫存。
- 先前為修正檔名／載入路徑而建立的一次性 workflow 已在完成後刪除；不要恢復。
- `index.html` 正式載入順序：`secondworldstoryregistry.js` 必須早於10個宇宙 storydata；10個宇宙 storydata 必須早於 `storyintegrity.js`。

---

# 11. Dungeon UI／近期架構整理

`dungeonui.js` 是副本首頁／共用延伸正式 owner，提供 `registerDungeonViewRenderer`、`registerDungeonHomeCardRenderer`、`registerDungeonPostRenderHook`、`registerDungeonNavigationGuard`；`DUNGEON_UI_EXTENSION_VERSION=1`。

近期已完成：副本狀態 EXP 改走 `levelProgressSnapshot(state)`；副本／Arena 文案紀元感知；鏡像 home-card ownership 收斂至 `dungeonui.js`；Arena world／region／progress／assessment／UI 改走 canonical world-aware owner；第二世界10區／100 Boss／玩家等級→Boss lookup 由 `secondworlddata.js` canonical API 擁有。不要在 UI、Arena、GM 再複製區域表或 `(level-500)/5` 第二套推導。

核心原則：**正式 owner 優先；移除重複推導；compatibility 只保留必要 alias；不新增 wrapper/fallback 來掩蓋 owner 問題。**

---

# 12. GM 正式架構

Manage：資料管理 → 背景戰鬥 → 戰鬥速度 → 角色 → 專精 → 強化 → 印記 → 文明等級 → 副本。

Test 頂層只保留：`player-ability-test`、`power-benchmark-test`、`player-title-preview`、`gm-story-test`。舊獨立 map/special/bounty/arena/void/mirror/calamity test section 已退休，不恢復。

共用 GM 測試角色可獨立設定：紀元、等級、同級5件神話／同步正式裝備、VIP、8專精、5強化、10印記、文明等級。同步正式角色必須完整 clone 裝備與養成，不能只同步總能力。

Session-only：同頁切 GM 區塊後設定與已跑結果保留；browser reload／重新進網頁才重置；不寫正式 save、不寫 localStorage。`gmTestArchitectureManifest()` 必須維持 sessionOnly/batchSync/benchmark/stateIsolation/legacyRetired=true，persistedTransientKeys=[]。

GM 戰力基準正式 owner `gmpowerbenchmark.js`，`GM_POWER_BENCHMARK_VERSION=21`，固定7模式：地圖怪、特殊怪、懸賞、競技場、虛空幻境、鏡像戰、文明災厄。地圖／特殊／懸賞／競技／災厄有銀河／宇宙 selector；虛空／鏡像不分 selector。Arena 可跑100次三連戰與500次正式評估。

GM 原則：不暫改 `state.secondWorld.entered`；不複製正式公式；使用正式 owner + explicit test context；不得污染 formal state/save。

已退休 API 不加回 wrapper：`gmMapMonsterTestHtml`、`getMapMonsterGmTestHtml`、`gmStartMapMonsterTest`、`getSecondWorldBossGmSelection`、`getSecondWorldBossGmRegionOptions`、`getSecondWorldBossGmOptions`、`gmStartSecondWorldBossTest`、`gmArenaTestHtml`、`getArenaGmTestHtml`、`gmSimulateArena`、`refreshArenaGm5`。

---

# 13. Integrity／維護流程

Runtime／Final Integrity 持續檢查 SAVE13/SCHEMA15、Save Write Guard、world-aware level owner、第二世界 Boss 12:2:1 + BASE2700、文明倍率 owner、Bounty V2、Arena world state/curve/civilization/owner isolation、GM session-only/legacy retirement、宇宙災厄完整鏈等。

`.github/workflows/runtime-integrity.yml` 有 stale-head guard：連續修改中的舊 intermediate commit 可跳過正式檢查；**只有當下最新 main HEAD 的 Runtime Integrity success 才能宣告完成**。queued/in_progress 不算完成，failure 必須先修。

故事另有 `.github/workflows/story-integrity.yml`；Story 修改必須同時確認 Story Integrity。`DEVELOPMENT_PROTOCOL.md` 為正式維護規範：修改前重讀 main；修改後重新 fetch；JS/CSS 改動同步 `index.html` cache-bust；本批紅燈不能靠下一批無關 commit 掩過。

---

# 14. 本次對話／本輪主要已完成修改

1. 文明 final damage 單一 owner全面接入宇宙主線、特殊怪、災厄、懸賞、競技、虛空、鏡像及 GM/Benchmark。
2. 懸賞 V2 定案：統一曲線＋宇宙文明 HP 補償，不逐 tier 手改。
3. 宇宙主線 Boss 基準收斂：`BASE_STAT=2700` + 12:2:1；前期實測改善，STEP_RATE 留待中後期。
4. Arena V2：宇宙 Rank Curve V2、文明耐久補償、explicit GM context；第一世界 curve 不動。
5. Arena owner 清理：`arenaByWorld` canonical；world/region/progress/assessment/UI 收斂；legacy cleanup 移到 migration；不相容舊評估失效。
6. 宇宙副本 UI 修正：宇宙 EXP、競技場紀元文案／canonical 區域／三敵 lineup、鏡像首頁卡 ownership。
7. 銀河回顧完整化：冒險、災厄、戰線紀錄回顧；session 選擇保留；零收益／零損失／零正式紀錄；formal-state pollution restore guard。
8. 死亡規則統一：死亡／戰敗不再扣既有 EXP；30%裝備遺失與 VIP20保護保留。
9. world-aware level runtime owner 收斂至 `levelprogression.js`。
10. Dungeon normalization / Arena migration 分工：runtime 不再做破壞性 legacy cleanup，migration 負責歷史清理。
11. 第二世界資料 owner 維持完整10區、100 Boss、500件裝備名稱與 level→Boss API；曾抓到一次中途錯誤寫入並還原 canonical blob，錯誤版本不作正式基準。
12. 維護流程強化：最新 HEAD 才算正式 Runtime Integrity；owner 優先、禁止第二套公式／state／settlement。
13. **宇宙劇情正式 Registry 完成**：`secondworldstoryregistry.js` 建立10區／100 Boss／100唯一ID，與銀河共用 Story Progress / Record / GM 架構。
14. **宇宙首殺故事流程完成**：firstKill 才 queue；有正式故事時首殺會中斷連續戰，避免故事被略過；銀河原 owner 不變。
15. **宇宙戰線紀錄完成雙紀元切換**：宇宙預設、銀河回顧；只列已完成且有正式資料者。
16. **GM 劇情測試雙紀元化**：可瀏覽宇宙100 Registry；未完成文字顯示「尚未建立」；移除 sample 動態載入。
17. **宇宙正式 storydata runtime 路徑完成**：10個資料容器全由 `index.html` 正式載入；目前正式文字3/100。
18. **Story Integrity / Source Purity / Flow Regression 完成**：CI 鎖定雙紀元架構、格式、中文顯示、內部用語、載入順序與 owner 不回歸；一次性修正 workflow 已清除。

---

# 15. 目前已完成的大型功能

第一世界完整主線與成長；宇宙世界突破；Lv.501～1000 progression/EXP；100 Boss 宇宙主線；world2 裝備／sale／死亡／贖回；宇宙離線收益；+21～+40；文明0～10；雙紀元特殊怪；兩世界災厄；16稱號；第二世界懸賞V2；第二世界競技場與Rank Curve V2；Arena world-aware owner；虛空／鏡像；銀河冒險／災厄／戰線紀錄回顧；GM管理與角色 sandbox；GM七模式戰力基準；session-only 測試設定；save isolation；Runtime Integrity stale-head guard；宇宙10區／100 Boss故事 Registry；宇宙首殺正式故事 hook；雙紀元戰線紀錄與GM劇情測試；Story Integrity CI；`DEVELOPMENT_PROTOCOL.md`。

---

# 16. 尚未完成／後續優先項目

不要再把「第二世界懸賞／競技場」、「銀河冒險／災厄／戰線紀錄回顧」、「宇宙劇情 Registry／首殺 hook／正式載入路徑」列為未完成。

1. **宇宙正式劇情文字補完**：Registry 100篇已建，但正式文字目前只有3/100；剩餘97篇依既定格式政策逐批撰寫。每批必須跑 Source Purity、Story Integrity、Flow Regression，不得以 sample loader 或 runtime patch 代替正式 storydata。
2. **Arena V2 實機驗收**：Lv.600／VIP8／+24／專精60／印記10／文明Lv.2，Rank1～3 各500次正式評估，核對全通率、剩餘HP、回合數；不要逐 Rank 手改。
3. **宇宙主線中後期平衡**：`BASE_STAT=2700` 前期已合適，仍需 Lv.550、600～650、750 甚至後段驗證 `STEP_RATE=.015`。
4. **Cloud Save 真實跨裝置驗證**：宇宙存檔上傳→乾淨環境／另一裝置下載→reload→核對 secondWorld、world2 gear、+21～40、文明、arenaByWorld、災厄、offline/pending settlement、storyProgress、Save Write Guard。
5. **全介面＋遊戲說明雙紀元語意總掃描**：首頁、主線／冒險、角色、背包、強化、專精、離線、死亡／贖回、所有副本、災厄、戰線紀錄、設定、GM、結算文案、遊戲說明。宇宙不可殘留銀河金幣／強化石／Lv.500／每圖5怪等錯誤語意。

---

# 17. 正式 owner 速查

- 基礎世界／品質：`data.js`
- 核心 state／第一世界：`engine.js`
- migration/load：`savemigration.js`
- 世界階段：`worldphase.js`
- 等級：`levelprogression.js`；滿等語意：`levelcap.js`
- 第一世界戰鬥：`battlepipeline.js`
- 文明倍率：`civilizationcore.js`
- FX／節奏／背景／速度：`combatfx.js` / `combatpacing.js` / `backgroundprogress.js` / `combatspeed.js`
- Offline：`offlineprogress.js` / `offlinefarmtarget.js`
- 冒險／回顧：`worldmapui.js` + `ui.js`；回顧 guard：`galaxyreviewintegrity.js`
- 專精：`specialization.js`；VIP：`vipprogression.js` + `engine.js`；強化：`enhancementcore.js`
- 裝備 mutation/sale：`equipmentlock.js`
- 特殊怪：`specialmonsters.js` / `specialcore.js` / `specialencounter.js`
- 宇宙資料：`secondworlddata.js`；主線：`secondworldmainline.js`；combat：`secondworldcombat.js`；reward：`secondworldrewards.js`
- 第一世界災厄：`calamityconfig.js` / `calamitystate.js` / `calamitycore.js` / `calamityrun.js` / `calamityui.js`
- 印記：`markcore.js`；宇宙災厄：`secondworldcalamity.js` / `secondworldcalamityrun.js`
- 副本 UI：`dungeonui.js`；副本進度／Arena canonical state：`dungeonprogress.js`
- 懸賞：`dungeonbounty.js`；競技：`dungeonarena.js`；assessment：`arenapositioncore.js`；window：`arenawindowcore.js`；player UI：`arenaplayerflow2.js`
- 鏡像：`mirrorconfig.js` / `mirrordungeonstate.js` / `mirrordungeonrun.js` / `mirrordungeonui.js`
- 正式故事資料總表：`CIVILIZATION_STORIES`；宇宙 Registry：`secondworldstoryregistry.js`
- Story progress：`storyprogress.js`；migration：`storymigration.js`；UI：`storyui.js`；戰線紀錄：`storyrecordtabs.js`
- 宇宙 storydata：`storydata-universe-*.js`；Story Integrity：`storyintegrity.js` / `storyruntimeintegrity.js` / `tests/story/*`
- GM Story：`gmstorytest.js`；Story workflow：`.github/workflows/story-integrity.yml`
- GM Hub：`gmhub.js` / `gmhubextensions.js`；戰力基準：`gmpowerbenchmark.js`
- Runtime：`runtimeintegrity.js` + `tests/runtime/js-integrity.js`；Final：`finalintegrity.js`
- Runtime workflow：`.github/workflows/runtime-integrity.yml`
- 維護規範：`DEVELOPMENT_PROTOCOL.md`
- load order / cache-bust：`index.html`

---

# 18. 下一個 ChatGPT 必須遵守的操作規範

1. **GitHub `main` 實際程式碼是唯一真實來源。** HANDOFF 只作摘要；工作前重新讀 main。
2. **修改前先讀相關正式 owner、直接相依、Integrity/workflow 與 `index.html`。**
3. 使用者說「先討論／先查／先看／先檢查／先列出／先不要修改」時，**不得寫 GitHub**。
4. 使用者說「做／修改／執行／修正／第 N 批」時，可直接修改 GitHub `main`。
5. **優先修改正式來源。** 不用 wrapper/fallback 掩蓋 owner 問題；不新增第二套 state、第二套公式、第二套 settlement。
6. GM 不複製正式公式；使用正式 owner + explicit test context，且不得污染正式 save。
7. 修改後重新 fetch 最新 `main` 自我檢查，不能只相信 update API。
8. JS 至少做 parser/syntax，再做範圍相符的 functional/static probe。
9. **玩家端 JS/CSS 改動必須同步更新 `index.html` cache-bust。** 新 script 同時確認 load order。
10. 最新 main HEAD Runtime Integrity 必須 success 才能宣告完成；queued/in_progress 不算，failure 必須先修。
11. Story 修改同步確認 Story Integrity；宇宙 storydata 必須走正式 runtime load path，禁止 sample loader／動態補載。
12. Save Write Guard V1 不可破壞。
13. 不自行重構舊存檔，除非使用者明確要求或有可重現 production bug。
14. 一批只做核准範圍，不順手改 balance、故事、schema 或其他功能。
15. 已退休 API 不為相容而加回 wrapper。
16. 同時遵守 `DEVELOPMENT_PROTOCOL.md`。

---

# 19. 下一個對話如何接手

標準指令：

> 讀取 GitHub `franksky1207/rpg` 的 `PROJECT_HANDOFF.md` 與 `DEVELOPMENT_PROTOCOL.md`，再重新檢查目前 `main` 的實際程式碼、正式 owner、直接相依、Integrity workflow 與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> **`main` 是唯一真實來源，HANDOFF 只作摘要。**  
> 修改前先讀相關正式 owner；修改後重新 fetch 最新 `main` 自我檢查。玩家端 JS/CSS 有改動時同步更新 `index.html` cache-bust，並確認最新 main HEAD 的 Runtime Integrity 最終為 success；故事相關修改同時確認 Story Integrity。  
> 我說「先討論／先查／先看／先檢查／先列出／先不要修改」時不得寫 GitHub；我說「做／修改／執行／修正／第 N 批」時可直接修改 GitHub `main`。  
> 優先修改正式來源，不要額外建立 wrapper、fallback、第二套 state、第二套公式或第二套 settlement。GM 測試使用正式 owner＋explicit test context，不得污染正式 save。  
> 目前宇宙主線 Boss 基準為 `BASE_STAT=2700`、`HP:ATK:DEF=12:2:1`、`STEP_RATE=.015`；懸賞 V2 已定案；宇宙競技場使用 Rank Curve V2。宇宙正式劇情 Registry 已完成10區／100 Boss並接共用首殺、戰線紀錄、GM與 Integrity 架構，但正式故事文字目前只有3/100，剩餘97篇尚待逐批完成。  
> 下一步優先項目依需求選擇：補完宇宙正式劇情文字、Arena Rank1～3各500次實機驗收、宇宙主線中後期平衡、Cloud Save跨裝置驗證、全介面＋遊戲說明雙紀元語意總掃描。  
> 現在先不要修改任何功能；先確認最新 main 與未完成項目，再等我的下一個指令。