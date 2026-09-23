# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-24  
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
- schema 15 會清掉 GM transient 欄位；GM sandbox 不得寫正式 save。
- Arena legacy cleanup 正式 owner 是 `savemigration.js`；runtime normalization 不再做破壞性 legacy cleanup。

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
- `secondworlddata.js` 是區域／Boss／裝備名稱／玩家等級→Boss 對應 canonical data owner。
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
- 此組數值現行直接視為正式基準；除非使用者日後主動重開平衡議題，**不再列中後期平衡驗證為待辦**。

## 2.3 world-aware 等級 owner

正式 runtime owner：`levelprogression.js`。

- `FIRST_WORLD_LEVEL_CAP=500`
- `SECOND_WORLD_LEVEL_CAP=1000`
- `ABSOLUTE_MAX_LEVEL=1000`
- runtime 走 `effectiveLevelCap()`；legacy `MAX_LEVEL=500` 只作 migration 相容。
- 宇宙 Lv.500～999：`ceil((25 + 4*L) * 250)`；Lv.1000：0。
- 銀河滿等 EXP 可 1:1 轉金幣；宇宙滿等不可誤轉金幣。

---

# 3. 宇宙資源／裝備／死亡／強化

- 宇宙主線勝利：EXP、暗物質、每勝 +1 暗能量、固定 1 件 world2 裝備；不給銀河金幣／強化石。
- world2 品質：優良45%、稀有35%、史詩15%、傳說4.5%、神話0.5%。
- 所有正式戰鬥死亡／戰敗不扣既有 EXP、不降級；仍有30%機率遺失一件穿戴裝備，VIP20完全防止。
- world2 贖回＝正式出售價×10暗物質；world1 裝備在宇宙死亡遺失後免費贖回。
- 出售 owner：`equipmentSaleQuote / equipmentSaleBatchQuote / settleEquipmentSale / settleEquipmentSaleBatch`。
- world2 神話出售額外 +1 暗能量；鑑價只放大暗物質。
- 強化：銀河正式 +0～+20；宇宙正式 +20～+40；GM sandbox 0～40。每級主屬性 +2.5%，+40＝+100%。
- +21～+40 使用暗物質＋暗能量；宇宙正式若 <+20 視為資料異常，不由 normalization 免費補值。

---

# 4. VIP／專精／文明等級

- VIP 最大20；門檻 `1000*level²`。
- 8 專精最大60；宇宙沿用同一套正式專精效果，不建立第二套公式。
- 文明等級 `secondWorld.civilizationLevel` 0～10；宇宙每級 final damage +5%，Lv.10 ×1.50，銀河 ×1.00。
- 唯一正式入口：`civilizationCombatDamageMultiplier({world,state,civilizationLevel})`。
- 已接宇宙主線、特殊怪、宇宙災厄、懸賞、競技、虛空、鏡像與對應 GM/Benchmark；禁止各模式另造文明倍率公式。

---

# 5. 戰鬥節奏／背景／離線

- 銀河一般 1×；宇宙一般 1×/1.5×；GM 可 2×，localStorage 持續。
- 全模式 outer gap 140ms；不要恢復舊 220/300/350/450ms 或 60/80ms 啟動等待。
- Background 單一 active flow；最長12小時；credit rate 0.96；主線／虛空／災厄等使用共用 fast catch-up 政策。
- Offline：最短1分鐘、最多12小時；EXP 10%；銀河金幣10%／宇宙暗物質10%；裝備掉落流程10%；銀河直接強化石期望5%／宇宙直接暗能量5%。
- 每速度最多8筆真實樣本；1×/1.5×/2× 可跨速換算。
- world2 離線出售走正式 sale owner；不得產生特殊遭遇、首次 Boss 等非法副作用。

---

# 6. 文明災厄／印記／稱號

- 銀河災厄10隻；印記10枚、最大Lv.10；正式 owner `markcore.js`。
- 宇宙災厄10隻：550、600、…、1000；每隻30 true kills完成，30=100%，完成一階 Civilization +1。
- 未完成殘血 persistent；完成後重打每場滿血、不再加 trueKills、不保存敗北殘血、不顯示連續重打。
- 「現身」與「可挑戰」分離：章末 Boss 首殺先通知現身，實際挑戰仍需前一文明完成（第一隻例外）。
- 稱號共16個：災厄10 + 鏡像15～20勝6個。

---

# 7. 特殊怪

雙紀元共用同一組9個 ID，不建立第二套系統。

- 遭遇率8%；VIP6 +2%；VIP10 有10%第二次特殊獎勵。
- 宇宙使用正式 second-world EXP／暗物質／裝備 builder；不直接 +1 暗能量。
- world2 特殊怪失敗走正式宇宙死亡懲罰。
- 黑市 pending chain 共用。
- GM weak-slot 必須使用 explicit 測試裝備 context，不讀正式裝備。

---

# 8. 副本

## 8.1 懸賞 V2

第二世界懸賞已完成並定案；除非使用者明確重開平衡，不主動微調。shared daily bounty limit 20；失敗不套主線 world2 death penalty；無直接暗能量。

## 8.2 競技場 Arena V2

正式 state：`state.dungeon.arenaByWorld={1:{...},2:{...}}`，兩世界獨立。`dungeon.arena` 只保留 compatibility alias。

宇宙10 Rank；正式評估固定500場，至少485/500=97%。解鎖下一 Rank 雙條件：目前最高 Rank 評估≥97% + 下一競技場所屬主線區域已解鎖。

宇宙 Rank Curve V2：
```text
x=Rank-1
HP   = 1.68 + .05x - .0015x²
傷害 = 1.52 + .04x - .001x²
DEF  = 1.11 + .022x - .0004x²
```
宇宙 Arena 敵方 HP 乘同一文明倍率作耐久補償；銀河 curve 不動。

**Arena V2 實機驗收已由使用者取消，不再列為待辦。除非使用者日後主動重開，禁止再次把 Rank1～3 各500次驗收列入後續工作。**

## 8.3 虛空／鏡像

- 虛空維持無限；宇宙角色文明 final damage 生效。
- 鏡像正式每次20戰；VIP points=`20*wins²`；宇宙文明倍率納入 snapshot 且雙方對稱。

---

# 9. 銀河回顧系統

宇宙紀元可回顧銀河冒險100地圖、文明災厄10隻與戰線紀錄。

- 回顧戰：單場、零收益、零損失、零正式進度／紀錄影響；正式 HP 戰後還原。
- 回顧 selection 與正式銀河 selection 分離。
- 同一頁面 session 內保留回顧選擇；整理／重開網頁才回預設宇宙紀元。
- `galaxyreviewintegrity.js` 提供正式 state safety guard。

---

# 10. 正式劇情系統

- 銀河正式劇情：101 篇（序章1 + 100 Boss）。
- 宇宙正式劇情：100/100 全部完成，10 區／100 Boss／100 個唯一 story ID。
- 全專案正式目標：201 篇。
- 宇宙 Registry 正式 owner：`secondworldstoryregistry.js`。
- 銀河與宇宙共用 `CIVILIZATION_STORIES`、`storyProgress`、正式劇情視窗、戰線紀錄與 GM 劇情測試架構。
- 宇宙首殺只有 `result.ok && result.firstKill===true` 才 queue 正式劇情。
- 戰線紀錄宇宙進入後預設宇宙紀元，可切銀河回顧。

篇幅硬規格：
- 序章12頁，90～155字／頁，至少3 block。
- 一般 Boss 11頁，90～120字／頁，至少2 block。
- 區域最終 Boss 15頁，120～155字／頁，至少3 block。
- 紀元最終 Boss 31頁，90～155字／頁，至少3 block。

canonical 劇情規則：`STORY_WRITING_RULES.md`；宇宙專屬補充：`STORY_UNIVERSE_RULES.md`；銀河世界觀：`STORY_BIBLE.md`。

Source Purity／Meta Language／Story Integrity 均為正式 CI；`set -o pipefail` 不得移除。

---

# 11. Dungeon UI／近期架構整理

`dungeonui.js` 是副本首頁／共用延伸正式 owner。近期已完成副本狀態 world-aware EXP／資源、宇宙懸賞與競技場文案、鏡像首頁卡 ownership、Arena world／region／progress／assessment canonical 化。

核心原則：**正式 owner 優先；移除重複推導；compatibility 只保留必要 alias；不新增第二套公式／state／settlement／Registry。**

---

# 12. GM 正式架構

Manage：資料管理 → 背景戰鬥 → 戰鬥速度 → 角色 → 專精 → 強化 → 印記 → 文明等級 → 副本。

Test 頂層：`player-ability-test`、`power-benchmark-test`、`player-title-preview`、`gm-story-test`。

共用 GM 測試角色可獨立設定：紀元、等級、同級5件神話／同步正式裝備、VIP、8專精、5強化、10印記、文明等級。

Session-only：同頁切 GM 區塊後設定與已跑結果保留；browser reload／重新進網頁才重置；不寫正式 save、不寫 localStorage。

GM 戰力基準正式 owner `gmpowerbenchmark.js`，固定7模式：地圖怪、特殊怪、懸賞、競技場、虛空幻境、鏡像戰、文明災厄。

GM 原則：不暫改 `state.secondWorld.entered`；不複製正式公式；使用正式 owner + explicit test context；不得污染 formal state/save。

---

# 13. 雙紀元介面／遊戲說明語意總掃描（2026-09-24 完成）

本輪已完成三批：

1. **遊戲說明／共用規則**：修正 `gameguide.js` 中宇宙離線收益、強化石清空、宇宙背包／贖回、宇宙自動出售、Lv.1000 滿等 EXP 等語意；遊戲說明已 world-aware。
2. **玩家正式 UI**：角色、背包、強化、副本、特殊遭遇、宇宙主線、災厄、回顧戰、結算等均重新掃描；共用首頁標語依紀元顯示，副本入口補上鏡像戰。`playersemanticsui.js` 目前只負責共用玩家 UI 語意顯示，不接管任何戰鬥／資源／存檔公式。
3. **GM／漏網字串／全域回歸**：GM 顯示文字已確認沒有把宇宙正式規則錯寫成銀河規則；高風險字串逐項判斷，銀河限定的「金幣／強化石／普通怪／菁英／Lv.500」保留，跨紀元錯誤語意已清理。

此總掃描現視為**完成**，不再列為待辦。除非使用者日後發現具體錯字／錯誤畫面或主動要求重新掃描，否則不要再次把它列入後續工作。

---

# 14. Integrity／維護流程

`.github/workflows/runtime-integrity.yml`：
- 有 stale-head guard。
- 只有當下最新 main HEAD 的 Runtime Integrity `success` 才能宣告完成。
- `queued`／`in_progress` 不算完成；`failure` 必須先讀 log 修正。
- Runtime command 已使用 `set -o pipefail`。

`.github/workflows/story-integrity.yml`：故事資料／UI／規則／tests／相關 owner 修改時觸發；Story 修改必須同步確認 Story Integrity。

`DEVELOPMENT_PROTOCOL.md` 為正式維護規範：修改前重讀 main；修改後重新 fetch；JS/CSS 改動同步 `index.html` cache-bust；本批紅燈不能靠下一批無關 commit 掩過。

---

# 15. 目前已完成的大型功能

銀河完整主線與成長；宇宙世界突破；Lv.501～1000 progression/EXP；100 Boss 宇宙主線；world2 裝備／sale／死亡／贖回；宇宙離線收益；+21～+40；文明0～10；雙紀元特殊怪；兩世界災厄；16稱號；第二世界懸賞V2；第二世界競技場與Rank Curve V2；Arena world-aware owner；虛空／鏡像；銀河冒險／災厄／戰線紀錄回顧；GM管理與角色 sandbox；GM七模式戰力基準；session-only 測試設定；save isolation；Runtime Integrity stale-head guard；宇宙10區／100 Boss故事 Registry；宇宙100/100正式故事；宇宙首殺正式故事 hook；雙紀元戰線紀錄與GM劇情測試；Source Purity／Meta Language／Story Integrity CI；跨紀元 canonical 劇情規則；雙紀元介面／遊戲說明語意總掃描；`DEVELOPMENT_PROTOCOL.md`。

---

# 16. 尚未完成／後續項目

目前已取消、且**不得再自行列回待辦**：
- Arena V2 Rank1～3 各500次實機驗收。
- 宇宙主線中後期 `STEP_RATE=.015` 平衡驗證。
- Cloud Save 真實跨裝置驗證。

已完成、不再列為待辦：
- 全介面＋遊戲說明雙紀元語意總掃描。

目前唯一明確的大型未完成方向：
1. **第三紀元尚未設計／實作**：已有 canonical 劇情規則與建立流程，但尚未定核心命題、總篇數、區域、結果矩陣、Registry、數值系統或 runtime；不要自行假設第三紀元內容。

除非使用者主動提出新需求，**不要自行創造新的驗收／平衡／跨裝置待辦。**

---

# 17. 正式 owner 速查

- 基礎世界／品質：`data.js`
- 核心 state／銀河：`engine.js`
- migration/load：`savemigration.js`
- 世界階段：`worldphase.js`
- 等級：`levelprogression.js`；滿等語意：`levelcap.js`
- 銀河戰鬥：`battlepipeline.js`
- 文明倍率：`civilizationcore.js`
- Offline：`offlineprogress.js` / `offlinefarmtarget.js`
- 冒險／回顧：`worldmapui.js` + `ui.js`；回顧 guard：`galaxyreviewintegrity.js`
- 專精：`specialization.js`；VIP：`vipprogression.js`；強化：`enhancementcore.js`
- 裝備 mutation/sale：`equipmentlock.js`
- 特殊怪：`specialmonsters.js` / `specialcore.js` / `specialencounter.js`
- 宇宙資料：`secondworlddata.js`；主線：`secondworldmainline.js`；combat：`secondworldcombat.js`；reward：`secondworldrewards.js`
- 銀河災厄：`calamityconfig.js` / `calamitystate.js` / `calamitycore.js` / `calamityrun.js` / `calamityui.js`
- 印記：`markcore.js`；宇宙災厄：`secondworldcalamity.js` / `secondworldcalamityrun.js`
- 副本 UI：`dungeonui.js`；副本進度／Arena state：`dungeonprogress.js`
- 懸賞：`dungeonbounty.js`；競技：`dungeonarena.js`；assessment：`arenapositioncore.js`；window：`arenawindowcore.js`
- 鏡像：`mirrorconfig.js` / `mirrordungeonstate.js` / `mirrordungeonrun.js` / `mirrordungeonui.js`
- Story progress：`storyprogress.js`；UI：`storyui.js`；戰線紀錄：`storyrecordtabs.js`
- 宇宙 Registry：`secondworldstoryregistry.js`；宇宙 storydata：`storydata-universe-*.js`
- Story 格式 owner：`storyintegrity.js`
- GM Story：`gmstorytest.js`
- GM Hub：`gmhub.js` / `gmhubextensions.js`；戰力基準：`gmpowerbenchmark.js`
- Runtime：`runtimeintegrity.js` + `tests/runtime/js-integrity.js`；Final：`finalintegrity.js`
- 維護規範：`DEVELOPMENT_PROTOCOL.md`
- load order / cache-bust：`index.html`

---

# 18. 下一個 ChatGPT 必須遵守的操作規範

1. **GitHub `main` 實際程式碼是唯一真實來源。** HANDOFF 只作摘要；工作前重新讀 main。
2. 修改前先讀相關正式 owner、直接相依、Integrity/workflow 與 `index.html`。
3. 使用者說「先討論／先查／先看／先檢查／先列出／先不要修改」時，**不得寫 GitHub**。
4. 使用者說「做／修改／執行／修正／第 N 批」時，可直接修改 GitHub `main`。
5. **優先修改正式來源。** 不用 wrapper/fallback 掩蓋 owner 問題；不新增第二套 state、第二套公式、第二套 settlement、第二套 Registry 或 sample story。
6. GM 不複製正式公式；使用正式 owner + explicit test context，且不得污染正式 save。
7. 修改後重新 fetch 最新 `main` 自我檢查，不能只相信 update API。
8. JS 至少做 parser/syntax，再做範圍相符的 functional/static probe。
9. **玩家端 JS/CSS 改動必須同步更新 `index.html` cache-bust。** 新 script 同時確認 load order。
10. 最新 main HEAD Runtime Integrity 必須 success 才能宣告完成；queued/in_progress 不算，failure 必須先修。
11. Story 修改同步確認 Story Integrity。
12. Save Write Guard V1 不可破壞。
13. 不自行重構舊存檔，除非使用者明確要求或有可重現 production bug。
14. 一批只做核准範圍，不順手改 balance、故事、schema 或其他功能。
15. 已退休 API 不為相容而加回 wrapper。
16. 同時遵守 `DEVELOPMENT_PROTOCOL.md`。

---

# 19. 下一個對話如何接手

標準指令：

> 讀取 GitHub `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`、`DEVELOPMENT_PROTOCOL.md`；若工作涉及正式劇情，再同時讀 `STORY_WRITING_RULES.md`。之後重新檢查目前 `main` 的實際程式碼、正式 owner、直接相依、Integrity workflow 與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> **GitHub `main` 是唯一真實來源，HANDOFF 只作摘要。**  
> 修改前先讀相關正式 owner；修改後重新 fetch 最新 `main` 自我檢查。玩家端 JS/CSS 有改動時同步更新 `index.html` cache-bust，並確認最新 main HEAD 的 Runtime Integrity 最終為 success。  
> 我說「先討論／先查／先看／先檢查／先列出／先不要修改」時不得寫 GitHub；我說「做／修改／執行／修正／第 N 批」時可直接修改 GitHub `main`。  
> 目前宇宙主線 Boss 基準為 `BASE_STAT=2700`、`HP:ATK:DEF=12:2:1`、`STEP_RATE=.015`；懸賞 V2 已定案；宇宙競技場使用 Rank Curve V2；雙紀元介面／遊戲說明語意總掃描已完成。  
> Arena V2 額外實機驗收、宇宙主線中後期平衡驗證、Cloud Save 跨裝置驗證均已由使用者取消，不得自行再列成待辦。  
> 目前唯一明確的大型未完成方向是第三紀元尚未設計；不要自行假設內容或建立新待辦。  
> 現在先不要修改任何功能；先確認最新 main，再等我的下一個指令。
