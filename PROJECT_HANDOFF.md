# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-22  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本文件只做交接摘要。若本文件、舊對話、設計稿、記憶與 `main` 有衝突，一律以目前 `main` 為準；修改前必須重新讀正式 owner 與直接相依檔案。

---

# 1. 專案定位與正式存檔

《文明戰線》是純前端網頁文字／數值養成／科幻星際 RPG，支援桌機與手機。

核心世界：
- **銀河紀元（第一世界）**：Lv.1～500，10 大區、100 張地圖、普通／菁英／Boss。
- **宇宙紀元（第二世界）**：Lv.500/501～1000，10 大區、100 隻主線 Boss；正式主線沒有銀河「每圖 5 怪」結構。
- 世界永久旗標使用 `secondWorld.entered`；不要建立第二套 currentWorld save。

正式存檔：
- key：`frank_text_rpg_save`
- `SAVE_VERSION = 13`
- **`SAVE_SCHEMA_VERSION = 15`**
- `SAVE_LOAD_PIPELINE_VERSION = 2`
- `SAVE_NORMALIZATION_PIPELINE_VERSION = 1`
- Save Write Guard V1 必須保留。

正式 normalization 順序：
```text
worldPhase
→ worldProgress
→ level
→ gear
→ enhancement
→ vip
→ specialization
→ daily
→ dungeon
→ calamity
→ titles
→ offline
→ persistentFlags
```

重要 save 安全規則：
- 已有 local save 時，成功 load resolve 前不得用新 state 覆蓋。
- parse/root/migration 失敗時 fail protected，不解除 write guard。
- GM 測試 transient 欄位不得寫入正式 state；schema 15 會清理：
  `gmTestWorld / gmTestLevel / gmTestEquipment / gmTestEquipmentSource / gmTestVipLevel / gmTestEnhancementLevels / gmTestSpecializations / gmTestMarkLevels / gmTestCivilizationLevel / gmPowerBenchmark / gmTestResults`。
- `GM_TEST_SAVE_ISOLATION_VERSION=1`。

---

# 2. 世界與主線

## 2.1 銀河紀元

正式 owner：`data.js`、`worldmaps-*.js`、`engine.js`、`battlepipeline.js`。

10 區：
1. 地球戰爭 Lv.1～50
2. 太陽系戰爭 Lv.51～100
3. 近星戰爭 Lv.101～150
4. 星際邊疆 Lv.151～200
5. 獵戶臂戰爭 Lv.201～250
6. 銀河邊境 Lv.251～300
7. 銀河中域 Lv.301～350
8. 銀河核心外圍 Lv.351～400
9. 銀河核心戰爭 Lv.401～450
10. 銀河統合戰爭 Lv.451～500

每區 10 張地圖，每圖 5 級範圍，每圖 5 隻怪。

## 2.2 宇宙紀元

正式 owner：`secondworlddata.js`、`secondworldmainline.js`、`secondworldcombat.js`、`secondworldrewards.js`。

- 10 區、100 Boss。
- Boss 等級：505、510、…、1000。
- 每區 10 Boss。
- 玩家等級／前置 Boss 共同決定正式主線解鎖。
- 世界入口條件仍以第一世界完成基準為準：Lv.500、第一世界最終主線完成、8 專精全 60、5 部位 +20、10 印記全 10；VIP 不作入口限制。
- 進入宇宙時初始化正式 `secondWorld`，並切斷第一世界離線殘留；`isSecondWorldEntered()` 保持 pure read。

第二世界 Boss 基礎：
```js
N = 0..99
multiplier = 1 + 0.015 * N
HP  = 36000 * multiplier
ATK = 6000  * multiplier
DEF = 3000  * multiplier
```

Lv.505：36,000 / 6,000 / 3,000  
Lv.1000：89,460 / 14,910 / 7,455

---

# 3. 等級、EXP、資源、死亡與裝備

## 3.1 EXP

銀河 legacy：
```js
sameExp(l) = ceil(25 + 4*l)
expProgressionFactor(l) = 5 + 495 * (1 - exp(-(l-1)/142))
expNeed(l) = ceil(sameExp(l) * expProgressionFactor(l))
```

宇宙：
- Lv.500～999：
```js
expNeed(L) = ceil((25 + 4*L) * 250)
```
- Lv.1000 EXP 固定 0。
- 正式 cap 必須走 world-aware progression owner；不要把 legacy `MAX_LEVEL=500` 當全遊戲上限。

## 3.2 宇宙主線獎勵

- EXP：正式 `secondWorldBossExpReward()`，含實戰訓練專精。
- 暗物質：`20 + 2*N` 再套搜刮技巧。
- 每勝 +1 暗能量。
- 每勝固定 1 件 world2 裝備。
- 不給第一世界金幣／強化石。
- world2 裝備品質：優良 45%、稀有 35%、史詩 15%、傳說 4.5%、神話 0.5%。

## 3.3 死亡／贖回

銀河／宇宙統一：
- 所有正式戰鬥死亡／戰敗皆不損失任何既有 EXP；不得扣除目前 EXP，也不得因此降級。
- 正式死亡流程維持 30% 機率遺失一件已穿戴裝備。
- VIP20 完全防止死亡時遺失裝備。
- world2 裝備贖回 = 正式出售價 ×10 暗物質。
- world1 裝備在宇宙死亡遺失後免費贖回。

## 3.4 裝備出售

正式 sale owner：
- `equipmentSaleQuote()`
- `equipmentSaleBatchQuote()`
- `settleEquipmentSale()`
- `settleEquipmentSaleBatch()`

宇宙 world2 裝備售價：
```js
N = floor((equipmentLevel - 500) / 5)
B = 20 + 2*N
saleDM = ceil(B * qualityMultiplier * appraisalMultiplier)
```

神話出售額外 +1 暗能量；鑑價只放大暗物質。

玩家 UI 不顯示裝備來源世界文字；`item.world` 只做內部邏輯。

---

# 4. VIP、專精、強化、文明等級

## VIP
- 最大 20。
- 門檻：`1000 * level^2`。
- 戰鬥：HP/ATK 每級 +0.5%；DEF 每級 +0.25%；暴擊／閃避每級 +0.25 個百分點。
- 副本積分倍率：VIP0～3 ×1.00；VIP4～11 ×1.10；VIP12～20 ×1.20。

## 專精
8 項，最大 Lv.60：
- training：EXP +2.5% / Lv.
- scavenge：銀河怪物金幣／宇宙主線暗物質 +2.5% / Lv.
- appraisal：裝備售價 +2.5% / Lv.
- initiative：第一擊傷害 +1% / Lv.
- combo / penetration / counter / drain：各自既有正式 Combat Core 規則。

宇宙入口要求 8×60；不要另造第二套宇宙專精公式。

## 強化
- 銀河正式：+0～+20。
- 宇宙正式：+20～+40。
- GM sandbox：0～40。
- 每級主屬性 +2.5%；+40 = +100%。

+21～+40 成本：
```js
K = targetLevel - 21
darkMatter = 30000 + 12000*K
darkEnergy = 300 + 10*K
```

+20→+40 五欄總成本：
- 暗物質 14,400,000
- 暗能量 39,500

正式宇宙若出現 <+20 視為資料異常，normalization 不免費補值。

## 文明等級
- `secondWorld.civilizationLevel`，Lv.0～10。
- 宇宙戰鬥每級 final damage +5%。
- Lv.10 = ×1.50。
- 銀河不套。
- 不以暗物質／暗能量直接購買；正式來源是宇宙文明災厄。

---

# 5. 戰鬥節奏、背景、離線

## 戰鬥速度
- 一般銀河：1×。
- 一般宇宙：1× / 1.5×。
- GM 可 2×，localStorage 持續。
- outer gap 全模式 140ms。
- 不恢復舊 220/300/350/450ms 或 60/80ms 啟動等待。

## Background / catch-up
- 單一 active flow。
- 最長 12 小時。
- background credit rate 0.96。
- Fast catch-up 共用政策已接主線／虛空／災厄等正式流程。
- 宇宙主線逐場 atomic save **刻意保留**；不要只為效能拔掉。

## Offline
- 最短 1 分鐘、最多 12 小時。
- EXP 10%。
- 銀河金幣 10%；宇宙暗物質 10%。
- 裝備掉落流程 10%。
- 銀河直接強化石期望 5%；宇宙直接暗能量 5%。
- 每速度保留最多 8 筆真實樣本。
- 1× / 1.5× / 2× 可跨速換算；只縮放 actual combat time，outer gap 140ms 不縮。
- world2 離線出售走正式 sale owner。
- 不產生特殊遭遇、首次 Boss 進度等不合法副作用。

---

# 6. 第一世界文明災厄／印記／稱號

第一世界文明災厄：
- 10 隻。
- HP = `500000 * 災厄階級`，50 萬～500 萬。
- ATK = 對應 Boss ×1.10。
- DEF = ×1.05。
- 無一般戰利品。
- 印記未滿時殘血跨挑戰保存。
- 對應印記 Lv.10 後只允許單場重打、每場滿 HP，敗北不保存殘血。

印記：
- 10 枚、最大 Lv.10。
- 升級擊殺數：1,1,2,2,3,3,4,4,5,5。
- 正式效果 owner：`markcore.js`。

稱號：
- 正式共 16 個：災厄 10 + 鏡像 6。
- 災厄首殺稱號、鏡像 15～20 勝稱號已完成。
- 玩家名與稱號視覺 owner 仍以正式 renderer / CSS 為準。

---

# 7. 宇宙文明災厄

已正式完成 10 隻：
- 解鎖節點：550、600、…、1000 對應章末 Boss index 9、19、…、99。
- HP：1,000,000 起，每隻 +200,000，至 2,800,000。
- ATK ×1.10、DEF ×1.05、暴擊／閃避 10%。
- 每隻 30 true kills 完成。
- 1 kill = 3.33%，30 = 100%。
- 完成一階 Civilization +1。
- 未完成時殘血 persistent。
- 完成後重打每場滿 HP、不再加 trueKills、不保存敗北殘血。
- 完成後只顯示單場重打，不顯示連續重打。

「現身」與「可挑戰」拆開：
- 章末 Boss 首殺 → 災厄現身通知。
- 真正能挑戰還需前一文明階段完成；第一隻無前置文明需求。
- 主線章末 Boss 若同時觸發災厄現身，現身通知優先於該場特殊遭遇。

---

# 8. 特殊怪：雙紀元共用系統

正式共用同一組 9 個 ID，不建立第二套特殊怪系統。

銀河原有 9 怪保留；宇宙 profile：
- gold_slime → 星源聚合體
- mimic → 虛空誘餌艙
- reaper → 終焉協議體
- lucky_rabbit → 星運增幅信標
- ancient_guardian → 古域警戒機
- relic_guardian → 星藏保全體
- bandit_king → 暗域黑市王
- collector → 星骸回收者
- mysterious_traveler → 界域交易使

正式重點：
- 遭遇率仍 8%；VIP6 +2%。
- VIP10 10% 第二次特殊獎勵。
- 第一世界 Boss 排除、舊 overlevel 規則保留。
- 宇宙特殊怪使用正式 second-world EXP／暗物質／裝備 builder。
- 宇宙不額外直接 +1 暗能量；神話出售的暗能量照 sale owner。
- world2 特殊怪失敗走正式宇宙死亡懲罰。
- 黑市 pending chain 共用。
- 宇宙主線章末災厄現身通知優先，pending 黑市留到下一次 eligible battle。

近期重要修正：
- `SPECIAL_WORLD_DROP_OWNER_VERSION=2`。
- `SPECIAL_WEAK_SLOT_CONTEXT_VERSION=1`。
- weak-slot 特殊掉落可顯式使用 GM 測試裝備 context，不再偷偷讀正式 `state.equipment`。
- `GM_SPECIAL_WEAK_SLOT_SANDBOX_VERSION=1`。

---

# 9. 第二世界副本：懸賞與競技場已完成

> 舊 handoff 曾寫「尚未完整實作」，已失效。

## 9.1 懸賞
- 第二世界懸賞正式存在。
- tier：
  - 普通：倍率 5、2 件裝備
  - 高級：倍率 8、3 件
  - 危險：倍率 12、5 件
- Boss reward owner 依玩家等級採向上對應：
  - 500～504 → 505
  - 505～509 → 510
  - …
  - 995～1000 → 1000
- 正式 EXP 已含 training，暗物質已含 scavenge，不能二次套用。
- 無直接暗能量。
- shared daily bounty limit 20，進宇宙不重置。
- 失敗不套主線 world2 death penalty。
- GM 已用 explicit world context，不能靠暫改正式 `state.secondWorld.entered` 模擬。
- `BOUNTY_TEST_CONTEXT_VERSION=1`
- `GM_BOUNTY_STATE_ISOLATION_VERSION=1`

## 9.2 競技場
- `state.dungeon.arenaByWorld={1:{...},2:{...}}`，兩世界 Rank 獨立。
- 宇宙 10 Rank。
- 下一階解鎖仍依區域 + 500 場評估至少 485/500（97%）。
- 宇宙 points base：normal 570 / hard 620 / extreme 670；Rank 4 起每階 +60。
- Rank curve 第二世界獨立，但正式 helper 統一。
- 三連戰不回血；新一輪才回血。
- shared daily arena limit 20。
- GM 使用 explicit world context，已移除暫改正式 state 的舊路徑。
- `ARENA_EXPLICIT_WORLD_CONTEXT_VERSION=1`
- `GM_ARENA_STATE_ISOLATION_VERSION=1`

## 9.3 虛空
- 維持無限模式。
- GM 戰力基準不提供紀元 selector，視為共用模式。
- GM 可預覽指定樓層／從指定樓層連爬；起始樓層設定在同一頁面工作階段保留。

## 9.4 鏡像
- 不分紀元 selector。
- 正式每次 20 戰；VIP points = `20 * wins^2`。
- GM 鏡像測試現在讀取「GM 測試角色」snapshot，而不是正式角色。
- 100 次實戰與 64 組對稱回歸可同時保留結果。

---

# 10. GM 架構：目前正式基準

## 10.1 GM 頂層

Manage 排序：
1. 資料管理
2. 背景戰鬥
3. 戰鬥速度
4. 角色
5. 專精
6. 強化
7. 印記
8. 文明等級
9. 副本

Test 頂層 **只剩 4 個**：
1. `player-ability-test` 角色能力測試
2. `power-benchmark-test` 戰力基準測試
3. `player-title-preview` 稱號預覽
4. `gm-story-test` 劇情測試

舊的獨立 map/special/bounty/arena/void/mirror/calamity test section 已退休，不要恢復。

正式排序 owner：`gmhubextensions.js`。
- `GM_HUB_EXTENSION_VERSION=11`
- `GM_POWER_BENCHMARK_GROUP_REGISTRY_VERSION=2`

## 10.2 角色能力測試 = 共用 GM 測試角色

子區：
1. 角色基準
2. VIP
3. 專精
4. 強化
5. 印記
6. 文明等級

角色基準：
- 測試紀元與正式角色世界完全脫鉤。
- 測試等級：
  - 銀河 1～500
  - 宇宙 500～1000
- 手動改紀元／等級時，自動建立「同級 5 件神話裝備」。
- 詞條走正式隨機 builder。
- 可重新隨機神話裝備。

「同步正式角色到測試設定」必須完整同步：
- 紀元
- 等級
- 五件實穿裝備（完整 clone，含品質／主屬性／詞條）
- VIP
- 8 專精
- 5 部位強化
- 10 印記
- 文明等級

近期 bug 修正：
- 同步後戰力基準角色卡會立即重建 snapshot，不再只更新等級／總能力而養成明細顯示舊值。
- `GM_TEST_SYNC_BENCHMARK_REFRESH_VERSION=1`。

## 10.3 GM 測試狀態生命週期

使用者明確要求：
- **同一次頁面工作階段內，切換 GM 區塊／切到遊戲其他頁再回來，設定不能跑掉。**
- 只有 browser reload／重新進網頁才回初始值。
- 不寫入正式 save、不寫 localStorage。

目前 session-only 保留：
- 測試角色紀元／等級／裝備／VIP／專精／強化／印記／文明。
- 地圖 benchmark 選擇。
- 特殊怪紀元／目標。
- 懸賞紀元。
- Arena 紀元／Rank／位置。
- Void 指定樓層。
- 銀河災厄目標。
- 宇宙災厄目標與 unlock probe 的章末 Boss 已完成／未完成。
- 已跑測試結果。

架構標記：
- `GM_TEST_SESSION_ONLY_VERSION=1`
- `GM_TEST_SAVE_ISOLATION_VERSION=1`
- `GM_TEST_BATCH_SYNC_VERSION=1`
- `GM_MARK_TEST_BATCH_SYNC_VERSION=1`
- `GM_CIVILIZATION_TEST_BATCH_SYNC_VERSION=1`
- `GM_TEST_ARCHITECTURE_MANIFEST_VERSION=1`

`gmTestArchitectureManifest()` 必須回報：
- sessionOnly true
- batchSync true
- benchmark true
- stateIsolation true
- legacyRetired true
- persistedTransientKeys 空陣列

---

# 11. GM 戰力基準 V21

正式 owner：`gmpowerbenchmark.js`。

版本：
- `GM_POWER_BENCHMARK_VERSION=21`
- `GM_POWER_BENCHMARK_GROUP_VERSION=2`
- `GM_POWER_BENCHMARK_ALL_MODES_VERSION=1`
- `GM_POWER_BENCHMARK_UNIFIED_SUMMARY_VERSION=2`
- `GM_POWER_BENCHMARK_LIVE_REFRESH_VERSION=1`
- `GM_POWER_BENCHMARK_BATCH_SIZE=25`

固定 7 個子區：
1. 地圖怪測試
2. 特殊怪測試
3. 懸賞戰測試
4. 競技場測試
5. 虛空幻境測試
6. 鏡像戰測試
7. 文明災厄測試

紀元 selector：
- 地圖怪：銀河／宇宙
- 特殊怪：銀河／宇宙
- 懸賞：銀河／宇宙
- 競技：銀河／宇宙
- 災厄：銀河／宇宙
- 虛空：不分紀元
- 鏡像：不分紀元

**GM 測試紀元必須與正式角色世界脫鉤。**  
正式角色還在銀河，也能測 Lv.750 宇宙；正式角色進宇宙，也能回測銀河。

## 地圖怪
- 實戰為主要測試。
- 只有地圖怪保留「輸出／承傷」進階診斷。
- 銀河可選區／圖／怪；宇宙對應 100 Boss。
- 「使用最高」以測試角色等級對應 target，不讀正式解鎖進度。

## 特殊怪
- 使用同一 9 怪正式 owner。
- 可跨紀元。
- 顯示勝率、回合、剩餘 HP、EXP、金幣／暗物質、掉裝與品質分布、VIP10 額外獎勵等。

## 懸賞
- 可跨紀元。
- 會保留同一 session 多個 tier／world 的結果。
- 宇宙摘要可顯示對應 Boss、EXP、暗物質、裝備數。

## 競技
- 可跨紀元。
- 可跑 100 次完整三連戰與 500 次正式評估。
- 摘要有第 1 戰、第 2/3 戰條件勝率、全通率、平均回合、剩餘 HP、平均基礎積分、**平均 VIP 實得積分**。
- 同一 session 可保留不同 world/rank/position/runs 結果。

## 虛空
- 指定樓層預覽或連爬結果可納入摘要。

## 鏡像
- GM 測試角色 snapshot。
- 實戰結果與 symmetry result 可共存。

## 災厄
- 銀河／宇宙各自呼叫正式 owner。
- 不另造共用假公式。
- 兩紀元都測過時，統一摘要可同時保留兩邊。

---

# 12. 統一測試摘要

戰力基準最下方有：
- 「複製測試摘要」
- 「清除全部測試結果」

摘要固定帶角色測試設定：
- 角色來源（同步正式／GM 神話預測）
- 角色紀元
- 等級
- VIP
- HP / ATK / DEF / 暴擊 / 閃避
- 強化
- 專精
- 印記
- 文明等級
- 五件裝備

只輸出**實際跑過的模式**，不塞「未測試」雜訊。

重要近期 bug 修正：
1. 非地圖模式原本測完後結果物件有資料，但統一摘要 DOM 不會即時刷新；現在特殊怪／懸賞／競技／虛空／鏡像／兩紀元災厄測完都會呼叫共用 live refresh。
2. 正式角色同步後 benchmark snapshot 會立即刷新完整養成資訊。
3. GM 測試角色條件改變時，舊戰鬥結果會失效清除，避免「畫面是新角色、摘要卻是舊結果」混資料。

---

# 13. GM 舊路徑退休與 state isolation

不要恢復這些已退休 GM 戰鬥 API／renderer：
- `gmMapMonsterTestHtml`
- `getMapMonsterGmTestHtml`
- `gmStartMapMonsterTest`
- `getSecondWorldBossGmSelection`
- `getSecondWorldBossGmRegionOptions`
- `getSecondWorldBossGmOptions`
- `gmStartSecondWorldBossTest`
- `gmArenaTestHtml`
- `getArenaGmTestHtml`
- `gmSimulateArena`
- `refreshArenaGm5`

正式 retirement：
- `GM_ARENA_LEGACY_INJECTION_RETIRED_VERSION=1`
- `GM_LEGACY_MAP_ARENA_TESTS_RETIRED_VERSION=1`
- `GM_HUB_LEGACY_COMBAT_RENDERERS_RETIRED_VERSION=1`
- `GM_POWER_BENCHMARK_LEGACY_FALLBACK_RETIRED_VERSION=1`

原則：
- 不為 GM 模擬去暫改正式 `state.secondWorld.entered`。
- 懸賞、競技已改 explicit world/test context。
- 特殊怪 weak-slot 計算要用傳入的 test equipment context。
- GM 測試不能污染 formal state/save。

---

# 14. Integrity / Guide

Runtime／Final Integrity 已對齊：
- SAVE_VERSION 13
- SAVE_SCHEMA_VERSION 15
- GM Benchmark V21
- Unified Summary V2
- GM session-only / batch sync / architecture manifest
- 特殊怪 world2 drop context
- Bounty/Arena state isolation
- legacy GM combat retirement
- 宇宙文明災厄完整鏈
- Save Write Guard V1

Game Guide：
- `GAME_GUIDE_VERSION=18`
- world-aware specialization / civilization / calamity / bounty / arena 語意已接正式 owner。
- 最終仍需做全介面＋遊戲說明雙紀元總掃描，見「尚未完成」。

---

# 15. 目前已完成的大型功能

截至目前 `main`：
- 第一世界完整主線與成長。
- 宇宙世界突破。
- Lv.501～1000 成長／EXP。
- 100 Boss 宇宙主線。
- world2 裝備、sale、死亡／贖回。
- 宇宙離線收益與 speed-aware sample。
- 強化 +21～+40。
- 專精宇宙語意。
- 文明等級 0～10。
- 第一世界文明災厄／印記。
- 第二世界文明災厄 10 隻。
- 16 種稱號。
- 特殊怪雙紀元共用正式系統。
- 第二世界懸賞。
- 第二世界競技場。
- 鏡像、虛空既有正式模式。
- GM 管理重整。
- GM 角色能力 sandbox。
- GM 戰力基準 7 模式集中。
- GM session-only 設定保留。
- 統一測試摘要與 live refresh。
- GM 測試 save isolation / explicit test context / legacy cleanup。

---

# 16. 尚未完成／後續優先項目

目前不要再把「第二世界懸賞／競技」列為未完成，它們已落地。

仍應保留的後續：

## 16.1 銀河封存／回顧跨頁收尾
統一要求：
- 回顧零 EXP／金幣／強化石／裝備／VIP／印記／稱號／養成進度。
- 回顧死亡零損失。
- 不寫 offline sample／farm target。
- 不觸發特殊遭遇／黑市。
- 第一世界災厄回顧不得污染正式 persistent HP。
- 戰線紀錄只回顧、不重發獎勵。

## 16.2 Cloud Save 真實跨裝置驗證
至少實測：
1. 宇宙存檔上傳。
2. 乾淨環境／另一裝置下載。
3. reload。
4. 核對 secondWorld、world2 gear、+21～40、文明、arenaByWorld、災厄、offline/pending settlement。
5. 不破壞 Save Write Guard。

## 16.3 全介面＋遊戲說明雙紀元語意總掃描
這是使用者明確保留的必做項。

至少掃：
- 首頁
- 主線／冒險
- 角色
- 背包／裝備
- 強化
- 專精
- 離線收益
- 死亡／贖回
- 懸賞／競技／鏡像／虛空
- 文明災厄
- 戰線紀錄
- 設定
- GM
- 所有結算文案
- 遊戲說明

原則：
- 宇宙不能殘留銀河金幣／強化石／Lv.500／每圖 5 怪等錯誤語意。
- 同一功能跨世界不同文字／規則時，優先共用 world-aware semantic/helper owner，不要各頁硬寫字串。

## 16.4 實際玩家測試後的 balance
目前 GM 工具已足以用同一套角色 snapshot 測各模式；後續 balance 應先跑資料再調，不要直接逐階手改怪物。

---

# 17. 正式 owner 速查

- 基礎世界／品質：`data.js`
- 第一世界主成長／核心 state：`engine.js`
- save migration/load：`savemigration.js`
- 世界階段：`worldphase.js`
- 等級 progression：`levelprogression.js`
- 第一世界戰鬥 pipeline：`battlepipeline.js`
- Combat Core：正式 combat owner（依目前 main 實際檔案重新讀）
- Structured FX：`combatfx.js`
- Outer pacing：`combatpacing.js`
- Background：`backgroundprogress.js`
- Combat speed：`combatspeed.js`
- Offline：`offlineprogress.js`
- Offline target/checkpoint：`offlinefarmtarget.js`
- 專精：`specialization.js`
- VIP：`vipprogression.js` + `engine.js`
- 強化：`enhancementcore.js`
- 裝備正式 mutation/sale：`equipmentlock.js`
- 特殊怪 metadata：`specialmonsters.js`
- 特殊怪 drop/core：`specialcore.js`
- 特殊怪正式 flow：`specialencounter.js`
- 宇宙資料：`secondworlddata.js`
- 宇宙主線：`secondworldmainline.js`
- 宇宙 combat：`secondworldcombat.js`
- 宇宙 reward／裝備：`secondworldrewards.js`
- 第一世界災厄 metadata：`calamityconfig.js`
- 第一世界災厄 state/core/run/UI：`calamitystate.js` / `calamitycore.js` / `calamityrun.js` / `calamityui.js`
- 印記：`markcore.js`
- 宇宙災厄：`secondworldcalamity.js` / `secondworldcalamityrun.js`
- 懸賞：`dungeonbounty.js`
- 競技：`dungeonarena.js`
- 鏡像：`mirrorconfig.js` / `mirrordungeonstate.js` / `mirrordungeonrun.js`
- GM Hub：`gmhub.js`
- GM registry/order：`gmhubextensions.js`
- GM 測試角色：`vipgm.js` + 各養成正式 owner 的 test state
- GM 特殊怪：`specialgmbatch.js`
- GM 懸賞／虛空：`dungeongm.js`
- GM 競技：`arenagm5.js`
- GM 鏡像：`mirrordungeongm.js`
- GM 災厄：`calamitygm.js` / `secondworldcalamitygm.js`
- GM 戰力基準：`gmpowerbenchmark.js`
- Runtime integrity：`runtimeintegrity.js`
- Final integrity：`finalintegrity.js`
- load order / cache-bust：`index.html`

---

# 18. 下一個 ChatGPT 必須遵守的操作規範

1. **GitHub `main` 的實際程式碼是唯一真實來源。**
   - HANDOFF 只作摘要。
   - 每次工作前重新讀 formal owner、直接依賴與 `index.html`。

2. **使用者說「先討論／先查／先看／先檢查／先不要修改」時，不得寫 GitHub。**

3. **使用者說「做／修改／執行／第 N 批」時，可直接修改 GitHub `main`。**

4. **優先修改正式來源。**
   - 不用 wrapper / fallback 掩蓋 owner 問題。
   - 不新增第二套 state、第二套公式、第二套 settlement。
   - 不複製正式公式到 GM；GM 應呼叫正式 owner 並給 explicit test context。

5. **修改後必須重新 fetch `main` 自我檢查。**
   - JS：至少 parser / `new Function`。
   - 再做與修改範圍相符的 functional/static probe。
   - 不能只因 GitHub update API 成功就宣稱完成。

6. **任何 JS/CSS 改動都要更新 `index.html` cache-bust。**
   - 新 script 要確認 load order。
   - 不要遺留同檔多次載入或舊 cache tag。

7. **每批都檢查 GM／Integrity／Save isolation。**
   - GM 測試不得寫正式 save。
   - GM 管理若改正式 state，要走正式 save/rollback 語意。

8. **Save Write Guard V1 不可破壞。**

9. **不要自行重構舊存檔。**
   - 除非使用者明確要求，或有可重現 production bug。

10. **一批只做核准範圍。**
    - 不順手改 balance、故事、schema 或其他未授權功能。

11. **已退休 API 不要為了相容再加回 wrapper。**
    - Runtime / Final Integrity 已明確把部分舊 GM combat API 當錯誤。

---

# 19. 下一個對話如何接手

標準指令：

> 讀取 GitHub `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查目前 `main` 的實際程式碼與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> **`main` 是唯一真實來源，HANDOFF 只作摘要。**  
> 修改前先讀正式 owner 與直接相依檔案；修改後重新 fetch `main` 自我檢查。JS/CSS 有改動時同步更新 `index.html` cache-bust。  
> 我說「先討論／先查／先看／先檢查／先不要修改」時不得寫 GitHub；我說「做／修改／執行／第 N 批」時可直接修改 GitHub `main`。  
> 優先修改正式來源，不要額外建立 wrapper、fallback、第二套 state、第二套公式或第二套 settlement。GM 測試要使用正式 owner＋explicit test context，不得污染正式 save。  
> 目前宇宙紀元已完成：世界突破、Lv.501～1000、100 Boss 主線、world2 裝備／經濟、離線收益、強化 +21～+40、專精宇宙語意、文明等級、第二世界文明災厄、雙紀元特殊怪、第二世界懸賞／競技，以及 GM 角色 sandbox／7 模式戰力基準／統一摘要。  
> 目前主要後續是：銀河封存／回顧跨頁收尾、Cloud Save 宇宙存檔真實跨裝置驗證、全介面＋遊戲說明雙紀元語意總掃描，以及依 GM 測試資料進行 balance。  
> 現在先不要修改任何功能；先確認最新 main、正式 owner 與目前未完成項目，再等我的下一個指令。
