# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-23  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要，不是第二套規格。若本檔、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。任何修改前必須重新讀正式 owner、直接相依、Integrity / workflow 與 `index.html` 載入順序。

---

# 1. 專案定位／存檔

《文明戰線》為純前端網頁文字／數值養成／科幻星際 RPG，支援桌機與手機。

- **銀河紀元**：Lv.1～500，10 區、100 地圖、普通／菁英／Boss。
- **宇宙紀元**：Lv.501～1000，正式主線為 10 區／100 Boss；沒有銀河每圖 5 怪結構。
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
- 世界入口：Lv.500、銀河最終主線完成、8 專精全 60、5 部位 +20、10 印記全 10；VIP 不限。
- 進入宇宙時初始化 `secondWorld` 並切斷銀河離線殘留；`isSecondWorldEntered()` 保持 pure read。

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
- 前期 `BASE_STAT=2700` 使用者實測已改善；`STEP_RATE=.015` 仍保留中後期實機驗證項目。

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

文明等級 `secondWorld.civilizationLevel` 0～10；宇宙每級 final damage +5%，Lv.10 ×1.50，銀河 ×1.00。唯一正式入口：`civilizationCombatDamageMultiplier({world,state,civilizationLevel})`。已接宇宙主線、特殊怪、宇宙災厄、懸賞、競技、虛空、鏡像及對應 GM/Benchmark；鏡像雙方同倍率維持對稱。禁止各模式另造文明倍率公式。

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
普通1.00/1.00/.88；高級1.48/1.44/.99；危險1.58/1.62/1.02。宇宙敵方 HP 乘文明 final damage 倍率抵消 player-relative 漂移；銀河 ×1。

## 8.2 競技場 canonical world owner

正式 state：`state.dungeon.arenaByWorld={1:{...},2:{...}}`，兩世界獨立。`dungeon.arena` 只保留 non-enumerable compatibility getter/setter alias，不是正式持久 owner。

- `ARENA_BY_WORLD_STATE_VERSION=2`
- `ARENA_BY_WORLD_COMPAT_ALIAS_VERSION=2`
- `ARENA_WORLD_OWNER_VERSION=2`
- `ARENA_REGION_OWNER_VERSION=2`
- `SECOND_WORLD_ARENA_UNLOCK_VERSION=2`
- `DUNGEON_RUNTIME_NORMALIZATION_VERSION=2`
- legacy cleanup owner=`savemigration.js`。

宇宙10 Rank；正式評估固定500場，至少485/500=97%。解鎖下一 Rank 雙條件：目前最高 Rank 評估≥97% + 下一競技場所屬主線區域已解鎖。選擇視窗只顯示最近最多3個已解鎖 Rank；promotion 後清舊 assessment signature/runs/clears。

宇宙 Rank Curve V2（銀河 curve 不動）：
```text
x=Rank-1
HP   = 1.68 + .05x - .0015x²
傷害 = 1.52 + .04x - .001x²
DEF  = 1.11 + .022x - .0004x²
```
宇宙 Arena 敵方 HP 乘同一文明倍率作耐久補償；GM `buildArenaEnemyForTest(...)` 用 explicit civilization level，不暫改正式 state。

宇宙三連戰敵人：星域戰爭構裝 → 宇宙征戰構裝 → 文明終焉構裝；銀河仍為基礎模擬單元 → 戰術強化單元 → 極限測試平台。UI 顯示目前紀元、canonical 場名、三戰對手、雙條件解鎖。

宇宙 points base：normal570 / hard620 / extreme670；Rank4 起每階 +60。三連戰不回血，新一輪才回血；shared daily arena limit20。

**待實機驗收**：Lv.600／VIP8／+24全身／專精60／印記10／文明Lv.2，在遊戲內 GM 跑 Rank1～3 各500次正式評估；不要逐 Rank 手改。

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

# 10. 正式劇情系統（最新完整狀態）

## 10.1 共用架構

銀河與宇宙共用同一套正式 `CIVILIZATION_STORIES`、`storyProgress`、正式劇情視窗、戰線紀錄與 GM 劇情測試架構，不建立第二套宇宙劇情系統。

- 銀河正式劇情：**101 篇**（序章1 + 100 Boss）。
- 宇宙正式劇情：**100/100 全部完成**，10 區／100 Boss／100 個唯一 story ID。
- 全專案正式目標：**201 篇**。
- 宇宙 Registry 正式 owner：`secondworldstoryregistry.js`，`UNIVERSE_STORY_REGISTRY_VERSION=1`；`UNIVERSE_STORY_REGISTRY_READY` 必須為 true。
- 宇宙 story ID 由 `universeStoryIdForBossIndex()`／`universeBossIndexForStoryId()` 正反向對應；不要在 storydata、UI 或 GM 再複製 ID 推導。
- `CIVILIZATION_STORY_ERAS` 提供 galaxy / universe 兩紀元 Registry。

宇宙10個正式 storydata 容器均已完整填入並由 `index.html` 正式載入：

1. `storydata-universe-galaxy-beyond.js`
2. `storydata-universe-local-group-war.js`
3. `storydata-universe-star-cluster-frontier.js`
4. `storydata-universe-stellar-battlefront.js`
5. `storydata-universe-trans-domain-frontier.js`
6. `storydata-universe-myriad-domain-frontline.js`
7. `storydata-universe-cosmic-filament.js`
8. `storydata-universe-stellar-great-wall.js`
9. `storydata-universe-cosmic-deep-domain.js`
10. `storydata-universe-cosmic-unification-war.js`

## 10.2 正式篇幅硬規格（不可自行修改）

canonical owner：`storyintegrity.js` 的 `STORY_FORMAT_POLICY`；寫作文件 canonical：`STORY_WRITING_RULES.md`。

| 類型 | 頁數 | 每頁可見字數 | 最低自然文字 block |
|---|---:|---:|---:|
| 序章 | **12** | **90～155** | **3** |
| 一般 Boss | **11** | **90～120** | **2** |
| 區域最終 Boss | **15** | **120～155** | **3** |
| 紀元最終 Boss | **31** | **90～155** | **3** |

- 字數算法：各 block 合併後移除空白，以 Unicode 可見字元數計。
- 以上為硬規格，不可改成「約」、不可因單篇需要自行放寬。
- `STORY_BIBLE.md` 已刪除舊的「一般10～15頁／終章15～20頁」歷史規格，避免與正式政策衝突。

## 10.3 canonical 劇情寫作規則

`STORY_WRITING_RULES.md` 現為**跨紀元唯一 canonical 劇情總規則**；`STORY_UNIVERSE_RULES.md` 只保留宇宙紀元專屬歷史／資料約束；`STORY_BIBLE.md` 保留銀河 Lv.1～500 世界觀與長線設定。

重要規則：

- 每篇必須回答：為何現在發生、除了戰鬥還發生什麼、真正任務目標、戰後世界如何改變、下一篇為何自然發生。
- 禁止長期「到新地方→打更強敵人→勝利→更強敵人」。每區要有可追溯事件鏈。
- 玩家正式敘事預設用「你」；必要時可用 `{角色名稱}`，由 Story UI 代入玩家遊戲名稱，適合直接呼喚、正式點名、公開通訊、重逢、告別、重大情緒場景。
- 正式正文不得直接用固定文字「主角」稱呼玩家；設計文件可用「主角」描述角色功能。
- 不強制固定配角隊伍；人物可加入、離開、回家、轉任、決裂、受傷或永久死亡；地方人物不可因一次合作自動加入文明戰線。
- 死亡必須有前因與後續影響；不得下一篇就當沒發生，也不要無伏筆假死復活。
- Boss／敵手不等於一定邪惡或一定死亡；可擊殺、擊退、撤退、平局、俘虜、停火、交換、談判、繞道、工程解法、任務失敗等。
- 戰勝與任務成功不是同一件事；允許真正失敗，且不要立刻安排雪恥戰；同時也必須保留乾淨勝利。
- 搜索、工程、救援、醫療、補給、司法、自治、地圖／航線、地方政治、歷史資料、自然環境等可成為正式主體。
- 被救／合作／共同作戰不等於加入或永久同盟；文明戰線不預設殖民、接管、插旗或取代當地司法。
- 每區終篇要處理本區核心問題，不只是放一個最強敵人；下一區可由星圖、航線、政治邀請、補給、情報、戰爭匯流等自然銜接。
- 最終篇要處理本紀元核心命題，而不是只殺最大 Boss；世界可以被實質改變，但不能因此所有文明突然同一立場。

## 10.4 沉浸感／Source Purity／Meta Language

`tests/story/source-purity.js` 直接讀正式原始 storydata，不依賴 runtime 修字。

永久禁止正式敘事內部用語至少包含：
`小區域、關卡、第幾關、普通怪、菁英怪、Boss、Ｂｏｓｓ、玩家、頁數、遊戲、等級、首領戰`，以及固定「主角」稱呼。

正式顯示 chapter／location／title／Registry label／正文原則上不得含英文字母。

`tests/story/meta-language.js` 另永久阻擋作者／遊戲視角：
- `主線、配角、玩家、遊戲、關卡、頁數、破關、通關、劇情、章節、篇章、讀者、故事要收尾`
- `第X區、第X篇、第X章、最後X場、本區、前幾區、下一區、這一區` 等作品結構語言。

`系統、回合、機制、勝率` 列人工 review，不一刀切；例如導航系統／能源系統可用，遊戲機制語感不可用。

## 10.5 章末 UI／名稱插值

`storyui.js`：
- `{角色名稱}` → `playerName()` 正式流程；沒有有效玩家名時 fallback 為「作戰員」。
- 區域章末標記由共用 Story UI 依 Registry 自動產生；正文不需要硬塞「第N章・區域名稱　完」。
- 若舊正文已包含完全相同章末標記，UI 會辨識並避免重複；plain string 章末也會以 `story-em` 顯示。
- `{em}` 只做重要文字強調，不設固定數量或最低頻率。

## 10.6 首殺觸發／戰線紀錄／GM

`storyprogress.js`：`CIVILIZATION_STORY_PROGRESS_VERSION=12`。

- `queueUniverseBossStory(index)` 共用 `queueStory()`／`pendingStory`／`completedStories`。
- `settleSecondWorldBossVictory` 只有 `result.ok && result.firstKill===true` 才排宇宙正式劇情；`UNIVERSE_STORY_FIRST_CLEAR_HOOK_VERSION=1`。
- 若未首殺且該 Boss 有正式故事，宇宙連續戰會先降為單場，確保首殺故事能中斷顯示；已首殺後恢復原連續流程。
- 銀河 `queueBossStory` owner 不變；`battlepipeline.js` 不得重複排銀河故事。
- 重播／回顧不給獎勵、不改正式進度。

`storyrecordtabs.js`：`STORY_RECORD_TABS_VERSION=7`、`STORY_RECORD_WORLD_REVIEW_VERSION=2`。宇宙進入後預設宇宙紀元，可切「宇宙紀元」／「銀河紀元・回顧」；只列已完成且正式資料存在的故事。

`gmstorytest.js`：`GM_STORY_TEST_VERSION=6`。GM 可切銀河／宇宙、區域、劇情並直接預覽正式 runtime 資料；不再允許 sample loader。介面仍保留「尚未建立」的通用防呆顯示，但目前宇宙100篇已全部存在。

## 10.7 宇宙紀元重要故事連續性

- 韓策在宇宙深域 Lv.925「無光星海帝艦」局部敗戰中，為掩護基地人員、醫療船與資料撤離而永久死亡；無假死、無救生艙翻案。後續保留其空位與影響，辛暫時承接部分前線調度，但不是換皮取代韓策，也不安排立刻雪恥。
- 宇宙紀元最終價值：主角不是要消滅所有戰爭，而是不願再讓人因無法停止的戰爭命令而無故犧牲；最終拆除會讓戰爭自動延續的共同調度核心，把「是否繼續打」的選擇還給各方，期待更多人願意停戰，而不是強迫全宇宙和平。
- 宇宙結束後仍可能有衝突、利益與恩怨；文明戰線沒有成為宇宙統治者。

## 10.8 Story Integrity／CI 與本輪重要 bug 修正

`storyintegrity.js` 現為 VERSION 12；`tests/story/integrity.js` 永久要求銀河101、宇宙100/100、10區／100 Registry、總目標201及硬格式政策。

Story workflow 現行順序：
1. Source Purity
2. Universe Meta Language Audit
3. Story Data Integrity
4. Story Flow Regression

重要修正：

- 早期 Story / Runtime workflow 曾使用 `node ... | tee ...` 而未 `pipefail`，可能造成 Node 失敗卻被 `tee` 偽裝 success。現已改為 `set -o pipefail; node ... | tee ...`；不得移除。
- Runtime Integrity 同樣已修正 pipefail，並保留 stale-head guard；最新 main head 才算正式驗收。
- 第四區曾由 GM 真實抓到23個字數／禁詞問題；已全部修正，並順便清掉銀河舊故事5處固定「主角」。這次事件是建立 Source Purity／真 CI 驗收的重要原因。
- 完成前90篇後，曾全面掃描 meta 語言並修正27處出戲文字；隨後新增永久 `tests/story/meta-language.js`。
- 第十區最後曾有2處對話結尾缺 JavaScript 引號；已修正、`node --check` 通過並更新第十區 cache-bust 至 `storydata-universe-cosmic-unification-war.js?v=20260923-universe-region10-final2`。
- 所有本輪一次性 story 修補 workflow 都已刪除，不要恢復。
- 最後一次涉及正式 story JS 的完整驗證：Story Integrity 與 Runtime Integrity 均 success；之後只更新 Markdown 規則文件，未改 runtime/story JS。

## 10.9 未來第三紀元建立方式

開始任何第三紀元正式正文以前，先決定並落檔：
1. 紀元核心命題。
2. 總篇數／區域數。
3. 篇幅硬規格（若使用者未明確改，沿用現行12/11/15/31與字數/block規則）。
4. 每區事件鏈。
5. 全篇結果矩陣（勝／敗／撤退／死亡／停火／逃脫／工程／未解問題）。
6. 角色流動表。
7. 主角價值觀與不可越線行為。
8. 文明／政治／俘虜／自治原則。
9. 禁止套路表。
10. Meta 禁詞／沉浸感規則。
11. Registry／Story ID／資料容器／load order。
12. CI／Integrity 驗收條件。

原則：**先定規則、矩陣、Registry 與檢查器，再開始第一篇。**

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

GM 劇情測試：銀河／宇宙雙紀元；直接讀正式 storydata；可重跑 Data / Runtime story integrity；不寫進度、不記已讀。

GM 原則：不暫改 `state.secondWorld.entered`；不複製正式公式；使用正式 owner + explicit test context；不得污染 formal state/save。

已退休 API 不加回 wrapper：`gmMapMonsterTestHtml`、`getMapMonsterGmTestHtml`、`gmStartMapMonsterTest`、`getSecondWorldBossGmSelection`、`getSecondWorldBossGmRegionOptions`、`getSecondWorldBossGmOptions`、`gmStartSecondWorldBossTest`、`gmArenaTestHtml`、`getArenaGmTestHtml`、`gmSimulateArena`、`refreshArenaGm5`。

---

# 13. Integrity／維護流程

Runtime／Final Integrity 持續檢查 SAVE13/SCHEMA15、Save Write Guard、world-aware level owner、第二世界 Boss 12:2:1 + BASE2700、文明倍率 owner、Bounty V2、Arena world state/curve/civilization/owner isolation、GM session-only/legacy retirement、宇宙災厄完整鏈等。

`.github/workflows/runtime-integrity.yml`：
- 有 stale-head guard；連續修改中的舊 intermediate commit 可跳過正式檢查。
- 只有當下最新 main HEAD 的 Runtime Integrity `success` 才能宣告完成。
- `queued`／`in_progress` 不算完成；`failure` 必須先讀 log 修正。
- Runtime command 已使用 `set -o pipefail`，避免 `tee` false-green。

`.github/workflows/story-integrity.yml`：
- 故事資料／UI／規則／tests／相關 owner 修改時觸發。
- Source Purity／Meta Language／Data Integrity 均使用 `set -o pipefail`。
- Story 修改必須同時確認 Story Integrity 最終 success。

`DEVELOPMENT_PROTOCOL.md` 為正式維護規範：修改前重讀 main；修改後重新 fetch；JS/CSS 改動同步 `index.html` cache-bust；本批紅燈不能靠下一批無關 commit 掩過。

---

# 14. 本輪主要已完成修改

1. 文明 final damage 單一 owner 已全面接入宇宙主線、特殊怪、災厄、懸賞、競技、虛空、鏡像及 GM/Benchmark。
2. 懸賞 V2 定案：統一曲線＋宇宙文明 HP 補償，不逐 tier 手改。
3. 宇宙主線 Boss 基準收斂：`BASE_STAT=2700` + 12:2:1；`STEP_RATE=.015`。
4. Arena V2：宇宙 Rank Curve V2、文明耐久補償、explicit GM context；銀河 curve 不動。
5. Arena owner 清理：`arenaByWorld` canonical；world/region/progress/assessment/UI 收斂；legacy cleanup 移到 migration；不相容舊評估失效。
6. 宇宙副本 UI 修正：宇宙 EXP、競技場紀元文案／canonical 區域／三敵 lineup、鏡像首頁卡 ownership。
7. 銀河回顧完整化：冒險、災厄、戰線紀錄回顧；session 選擇保留；零收益／零損失／零正式紀錄；formal-state pollution restore guard。
8. 死亡規則統一：死亡／戰敗不再扣既有 EXP；30%裝備遺失與 VIP20保護保留。
9. world-aware level runtime owner 收斂至 `levelprogression.js`。
10. Dungeon normalization / Arena migration 分工：runtime 不再做破壞性 legacy cleanup，migration 負責歷史清理。
11. 第二世界資料 owner 維持完整10區、100 Boss、500件裝備名稱與 level→Boss API。
12. 維護流程強化：最新 HEAD 才算正式 Runtime Integrity；owner 優先、禁止第二套公式／state／settlement。
13. 宇宙劇情正式 Registry 完成：10區／100 Boss／100唯一ID，與銀河共用 Progress / Record / GM 架構。
14. 宇宙首殺正式故事流程完成：firstKill 才 queue；未首殺有正式故事時連續戰先降單場；銀河原 owner 不變。
15. 雙紀元戰線紀錄完成：宇宙預設、銀河回顧；重播零獎勵／零進度。
16. GM 劇情測試雙紀元化：直接預覽正式資料，sample loader 退休。
17. **宇宙10區／100篇正式故事全部完成**，由銀河彼端 Lv.505 至宇宙統合戰爭 Lv.1000。
18. 宇宙故事風格完成統一：對話／旁白／動作／人物反應自然混合；角色自由流動；真失敗與乾淨勝利並存；非戰鬥任務正式化。
19. 韓策於 Lv.925 永久死亡並保留長期影響；不安排假死或立即雪恥。
20. 第十區終局確立：「不是結束所有戰爭，而是讓各方重新擁有停手選擇，讓更多人願意停戰」。
21. 90篇完成後全面清理作者／遊戲 meta 語言，並新增永久 Meta Language Audit。
22. Source Purity 擴充：固定「主角」稱呼、內部遊戲詞、英文正式顯示文字均會擋下。
23. Story / Runtime CI `tee` false-green 已根治：永久使用 `set -o pipefail`。
24. 第四區曾抓到23項真實 Integrity 錯誤並全部修正；銀河舊故事5處固定「主角」同步清理。
25. 第十區兩處對話結尾 JS 引號缺失已修正並更新 cache-bust。
26. `STORY_WRITING_RULES.md` 已重整為跨紀元 canonical 劇情總規則；`STORY_UNIVERSE_RULES.md` 縮成宇宙專屬補充；`STORY_BIBLE.md` 移除與硬規格衝突的舊篇幅數字。
27. 主角稱呼規則定案：正文預設「你」；必要時 `{角色名稱}` 套玩家名稱；禁止正文直接用固定「主角」。

---

# 15. 目前已完成的大型功能

銀河完整主線與成長；宇宙世界突破；Lv.501～1000 progression/EXP；100 Boss 宇宙主線；world2 裝備／sale／死亡／贖回；宇宙離線收益；+21～+40；文明0～10；雙紀元特殊怪；兩世界災厄；16稱號；第二世界懸賞V2；第二世界競技場與Rank Curve V2；Arena world-aware owner；虛空／鏡像；銀河冒險／災厄／戰線紀錄回顧；GM管理與角色 sandbox；GM七模式戰力基準；session-only 測試設定；save isolation；Runtime Integrity stale-head guard；宇宙10區／100 Boss故事 Registry；宇宙100/100正式故事；宇宙首殺正式故事 hook；雙紀元戰線紀錄與GM劇情測試；Source Purity／Meta Language／Story Integrity CI；跨紀元 canonical 劇情規則；`DEVELOPMENT_PROTOCOL.md`。

---

# 16. 尚未完成／後續優先項目

**不要再把宇宙正式劇情文字、第二世界懸賞／競技場、銀河回顧、宇宙 Story Registry／首殺 hook／正式載入路徑列為未完成。**

1. **Arena V2 實機驗收**：Lv.600／VIP8／+24／專精60／印記10／文明Lv.2，Rank1～3 各500次正式評估，核對全通率、剩餘HP、回合數；不要逐 Rank 手改。
2. **宇宙主線中後期平衡**：`BASE_STAT=2700` 前期已合適，仍需 Lv.550、600～650、750 及後段驗證 `STEP_RATE=.015`。
3. **Cloud Save 真實跨裝置驗證**：宇宙存檔上傳→乾淨環境／另一裝置下載→reload→核對 secondWorld、world2 gear、+21～40、文明、arenaByWorld、災厄、offline/pending settlement、storyProgress、Save Write Guard。
4. **全介面＋遊戲說明雙紀元語意總掃描**：首頁、主線／冒險、角色、背包、強化、專精、離線、死亡／贖回、所有副本、災厄、戰線紀錄、設定、GM、結算文案、遊戲說明。宇宙不可殘留銀河金幣／強化石／Lv.500／每圖5怪等錯誤語意。
5. **第三紀元尚未設計／實作**：已有 canonical 劇情規則與建立流程，但尚未定核心命題、總篇數、區域、結果矩陣、Registry、數值系統或 runtime；不要自行假設第三紀元內容。

---

# 17. 正式 owner 速查

- 基礎世界／品質：`data.js`
- 核心 state／銀河：`engine.js`
- migration/load：`savemigration.js`
- 世界階段：`worldphase.js`
- 等級：`levelprogression.js`；滿等語意：`levelcap.js`
- 銀河戰鬥：`battlepipeline.js`
- 文明倍率：`civilizationcore.js`
- FX／節奏／背景／速度：`combatfx.js` / `combatpacing.js` / `backgroundprogress.js` / `combatspeed.js`
- Offline：`offlineprogress.js` / `offlinefarmtarget.js`
- 冒險／回顧：`worldmapui.js` + `ui.js`；回顧 guard：`galaxyreviewintegrity.js`
- 專精：`specialization.js`；VIP：`vipprogression.js` + `engine.js`；強化：`enhancementcore.js`
- 裝備 mutation/sale：`equipmentlock.js`
- 特殊怪：`specialmonsters.js` / `specialcore.js` / `specialencounter.js`
- 宇宙資料：`secondworlddata.js`；主線：`secondworldmainline.js`；combat：`secondworldcombat.js`；reward：`secondworldrewards.js`
- 銀河災厄：`calamityconfig.js` / `calamitystate.js` / `calamitycore.js` / `calamityrun.js` / `calamityui.js`
- 印記：`markcore.js`；宇宙災厄：`secondworldcalamity.js` / `secondworldcalamityrun.js`
- 副本 UI：`dungeonui.js`；副本進度／Arena canonical state：`dungeonprogress.js`
- 懸賞：`dungeonbounty.js`；競技：`dungeonarena.js`；assessment：`arenapositioncore.js`；window：`arenawindowcore.js`；player UI：`arenaplayerflow2.js`
- 鏡像：`mirrorconfig.js` / `mirrordungeonstate.js` / `mirrordungeonrun.js` / `mirrordungeonui.js`
- 正式故事資料總表：`CIVILIZATION_STORIES`；宇宙 Registry：`secondworldstoryregistry.js`
- Story progress：`storyprogress.js`；migration：`storymigration.js`；UI：`storyui.js`；戰線紀錄：`storyrecordtabs.js`
- 宇宙 storydata：`storydata-universe-*.js`
- Story 格式 owner：`storyintegrity.js`
- Story tests：`tests/story/source-purity.js` / `tests/story/meta-language.js` / `tests/story/integrity.js` / `tests/story/flow.js`
- Story rules canonical：`STORY_WRITING_RULES.md`；宇宙專屬補充：`STORY_UNIVERSE_RULES.md`；銀河世界觀：`STORY_BIBLE.md`
- GM Story：`gmstorytest.js`；Story workflow：`.github/workflows/story-integrity.yml`
- GM Hub：`gmhub.js` / `gmhubextensions.js`；戰力基準：`gmpowerbenchmark.js`（VERSION 21）
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
5. **優先修改正式來源。** 不用 wrapper/fallback 掩蓋 owner 問題；不新增第二套 state、第二套公式、第二套 settlement、第二套 Registry 或 sample story。
6. GM 不複製正式公式；使用正式 owner + explicit test context，且不得污染正式 save。
7. 修改後重新 fetch 最新 `main` 自我檢查，不能只相信 update API。
8. JS 至少做 parser/syntax，再做範圍相符的 functional/static probe。
9. **玩家端 JS/CSS 改動必須同步更新 `index.html` cache-bust。** 新 script 同時確認 load order。
10. 最新 main HEAD Runtime Integrity 必須 success 才能宣告完成；queued/in_progress 不算，failure 必須先修。
11. Story 修改同步確認 Story Integrity；正式 storydata 必須走 runtime load path，禁止 sample loader／動態補載。
12. Story CI 的 `set -o pipefail` 不得移除；Source Purity、Meta Language、Data Integrity、Flow Regression 都是正式防回歸的一部分。
13. **劇情硬規格不得自行改動**：序章12頁90～155字/3 block；一般11頁90～120字/2 block；區域終篇15頁120～155字/3 block；紀元終篇31頁90～155字/3 block。
14. Save Write Guard V1 不可破壞。
15. 不自行重構舊存檔，除非使用者明確要求或有可重現 production bug。
16. 一批只做核准範圍，不順手改 balance、故事、schema 或其他功能。
17. 已退休 API 不為相容而加回 wrapper。
18. 同時遵守 `DEVELOPMENT_PROTOCOL.md`。

---

# 19. 下一個對話如何接手

標準指令：

> 讀取 GitHub `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`、`DEVELOPMENT_PROTOCOL.md`；若工作涉及正式劇情，再同時讀 `STORY_WRITING_RULES.md`。之後重新檢查目前 `main` 的實際程式碼、正式 owner、直接相依、Integrity workflow 與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> **GitHub `main` 是唯一真實來源，HANDOFF 只作摘要。**  
> 修改前先讀相關正式 owner；修改後重新 fetch 最新 `main` 自我檢查。玩家端 JS/CSS 有改動時同步更新 `index.html` cache-bust，並確認最新 main HEAD 的 Runtime Integrity 最終為 success；故事相關修改同時確認 Story Integrity。  
> 我說「先討論／先查／先看／先檢查／先列出／先不要修改」時不得寫 GitHub；我說「做／修改／執行／修正／第 N 批」時可直接修改 GitHub `main`。  
> 優先修改正式來源，不要額外建立 wrapper、fallback、第二套 state、第二套公式、第二套 settlement、第二套 Registry 或 sample story。GM 測試使用正式 owner＋explicit test context，不得污染正式 save。  
> 目前宇宙主線 Boss 基準為 `BASE_STAT=2700`、`HP:ATK:DEF=12:2:1`、`STEP_RATE=.015`；懸賞 V2 已定案；宇宙競技場使用 Rank Curve V2。宇宙正式劇情已完成 **10區／100篇／100%**，並已接共用首殺、戰線紀錄、GM、Source Purity、Meta Language、Story Integrity 與 Runtime Integrity。  
> 劇情硬規格不可自行改：序章12頁90～155字/3 block；一般11頁90～120字/2 block；區域終篇15頁120～155字/3 block；紀元終篇31頁90～155字/3 block。正式敘事預設使用「你」，必要時用 `{角色名稱}` 套玩家名稱；禁止正文直接用固定「主角」或遊戲／作者 meta 用語。  
> 目前主要未完成項目：Arena V2 Rank1～3 各500次實機驗收、宇宙主線中後期平衡、Cloud Save 跨裝置驗證、全介面＋遊戲說明雙紀元語意總掃描；第三紀元尚未設計，只有 canonical 劇情規則與建立流程已準備完成。  
> 現在先不要修改任何功能；先確認最新 main 與未完成項目，再等我的下一個指令。
