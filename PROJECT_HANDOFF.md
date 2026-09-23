# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-23  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本文件只做交接摘要。若本文件、舊對話、設計稿、記憶與 `main` 有衝突，一律以目前 `main` 為準。任何修改前都必須重新讀取正式 owner、直接相依檔案、相關 Integrity / workflow 與 `index.html` 載入順序。

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
- `SAVE_SCHEMA_VERSION = 15`
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
- Arena 的 legacy dungeon cleanup 由 `savemigration.js` 負責；runtime normalization 不應再自行做破壞性 legacy cleanup。

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
- 世界入口條件：Lv.500、第一世界最終主線完成、8 專精全 60、5 部位 +20、10 印記全 10；VIP 不作入口限制。
- 進入宇宙時初始化正式 `secondWorld`，並切斷第一世界離線殘留；`isSecondWorldEntered()` 保持 pure read。

宇宙 10 區 canonical 名稱：
1. 銀河彼端
2. 本星系群戰爭
3. 星群邊疆
4. 群星會戰
5. 超域邊境
6. 萬域戰線
7. 宇宙纖維帶
8. 星海巨牆
9. 宇宙深域
10. 宇宙統合戰爭

### 宇宙主線 Boss 正式基準

目前已收斂為「單一基準 + 固定 12:2:1 比例」，不要恢復三套獨立 HP/ATK/DEF base：

```js
BASE_STAT = 2700
HP : ATK : DEF = 12 : 2 : 1
N = 0..99
M(N) = 1 + 0.015 * N
HP(N)  = ceil(BASE_STAT * 12 * M(N))
ATK(N) = ceil(BASE_STAT *  2 * M(N))
DEF(N) = ceil(BASE_STAT *  1 * M(N))
```

代表值：
- Lv.505／第 1 隻：32,400 / 5,400 / 2,700。
- Lv.515／第 3 隻：33,372 / 5,562 / 2,781。
- Lv.1000／第 100 隻：80,514 / 13,419 / 6,710。
- 基礎暴擊／閃避 0%，之後仍可受 Boss 特性修改。
- `SECOND_WORLD_BOSS_STAT_FORMULA_VERSION=1`。
- `SECOND_WORLD_CIVILIZATION_COMBAT_VERSION=2`：宇宙主線玩家 final damage 正式套文明倍率。

目前實測狀態：
- `BASE_STAT=2800` 時，Lv.512 完整銀河畢業角色打 Lv.515 100 場約 89% 勝率，偏硬。
- 調至 `BASE_STAT=2700` 後，使用者實測前期約 93～98%，目前作為正式基準繼續測試。
- `STEP_RATE=.015` 尚應以 Lv.550／600～650／750 等中後期實機資料確認；不要因前期已合適就直接假設整段曲線完成。

---

# 3. 等級、EXP、資源、死亡與裝備

## 3.1 等級與 EXP owner

正式 runtime 世界等級上限 owner：`levelprogression.js`。

- `FIRST_WORLD_LEVEL_CAP=500`
- `SECOND_WORLD_LEVEL_CAP=1000`
- `ABSOLUTE_MAX_LEVEL=1000`
- `LEVEL_PROGRESSION_VERSION=1`（公開相容版本刻意維持）
- `LEVEL_RUNTIME_WORLD_CAP_OWNER_VERSION=1`
- `LEGACY_MAX_LEVEL_MIGRATION_ONLY_VERSION=1`

原則：
- runtime 必須走 `effectiveLevelCap()`；legacy `MAX_LEVEL=500` 只允許歷史 migration 相容使用。
- `expNeed / gainExp / clampGameLevel` 已接 world-aware owner。

銀河 legacy EXP：
```js
sameExp(l) = ceil(25 + 4*l)
expProgressionFactor(l) = 5 + 495 * (1 - exp(-(l-1)/142))
expNeed(l) = ceil(sameExp(l) * expProgressionFactor(l))
```

宇宙：
```js
Lv.500～999:
expNeed(L) = ceil((25 + 4*L) * 250)
Lv.1000: 0
```

Integrity probe：
- Lv.500 = 506,250
- Lv.999 = 1,005,250
- Lv.1000 = 0

`levelcap.js`：
- 銀河滿等戰鬥 EXP 仍可 1:1 轉金幣。
- 宇宙滿等不做銀河式金幣轉換；不可把宇宙 EXP 誤轉成金幣。
- `LEVEL_CAP_LEGACY_FALLBACK_VERSION=1`。

## 3.2 宇宙主線獎勵

- EXP：正式 `secondWorldBossExpReward()`，含實戰訓練專精。
- 暗物質：`20 + 2*N` 再套搜刮技巧。
- 每勝 +1 暗能量。
- 每勝固定 1 件 world2 裝備。
- 不給第一世界金幣／強化石。
- world2 裝備品質：優良 45%、稀有 35%、史詩 15%、傳說 4.5%、神話 0.5%。

## 3.3 死亡／贖回

銀河／宇宙統一：
- 所有正式戰鬥死亡／戰敗皆不損失任何既有 EXP；不得因此降級。
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

- 神話出售額外 +1 暗能量；鑑價只放大暗物質。
- 玩家 UI 不顯示裝備來源世界文字；`item.world` 只做內部邏輯。

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
- combo / penetration / counter / drain：各走既有 Combat Core 正式規則。

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
- 正式來源是宇宙文明災厄，不以暗物質／暗能量直接購買。
- 正式唯一戰鬥倍率入口：`civilizationCombatDamageMultiplier({ world, state, civilizationLevel })`。
- `CIVILIZATION_COMBAT_DAMAGE_OWNER_VERSION=1`。

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

宇宙 profile：
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
- `SPECIAL_WORLD_DROP_OWNER_VERSION=2`。
- `SPECIAL_WEAK_SLOT_CONTEXT_VERSION=1`。
- GM weak-slot 使用 explicit 測試裝備 context，不讀正式 `state.equipment`。

---

# 9. 第二世界副本與現行平衡

## 9.1 懸賞：V2 已定案

第二世界懸賞正式存在，且目前 V2 視為已定案；除非使用者明確重開平衡，不要再主動微調。

- tier：普通／高級／危險。
- Boss reward owner 依玩家等級採向上對應 505、510…1000。
- EXP 已含 training，暗物質已含 scavenge，不能二次套用。
- 無直接暗能量。
- shared daily bounty limit 20，進宇宙不重置。
- 失敗不套主線 world2 death penalty。

統一 difficulty curve（d=0/1/2）：
```text
HP     = 1 + 0.67d - 0.19d²
傷害   = 1 + 0.57d - 0.13d²
DEF    = 0.88 + 0.15d - 0.04d²
```

倍率：
- 普通：HP1.00／傷害1.00／DEF0.88
- 高級：HP1.48／傷害1.44／DEF0.99
- 危險：HP1.58／傷害1.62／DEF1.02

文明補償：
- 宇宙懸賞敵方 HP 乘同一文明 final damage 倍率，抵消 player-relative 模式因文明純倍率造成的難度漂移。
- 銀河固定 ×1.00。
- 100,000 場級大量模擬中，普通約 100%、高級約 98%、危險約 83～84%，文明 Lv.0→10 漂移約僅 1 個百分點量級。

版本：
- `BOUNTY_BALANCE_VERSION=2`
- `BOUNTY_DIFFICULTY_FORMULA_VERSION=2`
- `BOUNTY_CIVILIZATION_SCALING_VERSION=1`
- `GM_BOUNTY_CIVILIZATION_SCALING_VERSION=1`
- `DUNGEON_CIVILIZATION_DAMAGE_VERSION=2`
- `BOUNTY_TEST_CONTEXT_VERSION=1`
- `GM_BOUNTY_STATE_ISOLATION_VERSION=1`

## 9.2 競技場：世界 owner 已重整，宇宙 Rank Curve V2

### 正式 state / owner

- canonical state：`state.dungeon.arenaByWorld={1:{...},2:{...}}`，兩世界進度獨立。
- `dungeon.arena` 只保留為**非 enumerable 的 compatibility getter/setter alias**，指向目前世界的 `arenaByWorld[world]`；不要再把它當正式持久 owner。
- `ARENA_BY_WORLD_STATE_VERSION=2`
- `ARENA_BY_WORLD_COMPAT_ALIAS_VERSION=2`
- `ARENA_WORLD_OWNER_VERSION=2`
- `ARENA_REGION_OWNER_VERSION=2`
- `SECOND_WORLD_ARENA_UNLOCK_VERSION=2`
- `DUNGEON_RUNTIME_NORMALIZATION_VERSION=2`
- Arena legacy cleanup 正式 owner：`savemigration.js`。

Arena compatibility profile 目前：
```text
positionModelVersion = 1
assessmentRuleVersion = 4
assessmentStateVersion = 4
assessmentRuntimeVersion = 4
balanceVersion = 6
rankBalanceVersion = 3
positionApiVersion = 1
enemyProfileVersion = 1
pacingSourceVersion = 1
```

若舊 assessment 的 position/rule/balance 版本不相容，正式 normalization 會讓舊評估失效，不可沿用過時 promotion 結果。

### 解鎖／視窗／評估

- 宇宙 10 Rank。
- 正式評估固定 500 場，至少 485/500 = 97%。
- 解鎖下一競技場需要**雙條件**：
  1. 目前最高已解鎖競技場的 500 場評估 ≥97%。
  2. 下一競技場所屬主線區域已解鎖。
- 競技場選擇視窗只顯示最近最多 3 個已解鎖 Rank；最高 Rank 是評估目標。
- promotion 後會清除舊 assessment signature/runs/clears，下一階重新評估。
- `SECOND_WORLD_ARENA_PROGRESS_RULES_VERSION=3`
- `ARENA_WINDOW_WORLD_OWNER_VERSION=3`
- `ARENA_SECOND_WORLD_REGION_OWNER_VERSION=2`
- `SECOND_WORLD_ARENA_ASSESSMENT_LEVEL_VERSION=2`
- `ARENA_POSITION_WORLD_AWARE_VERSION=3`
- `ARENA_ASSESSMENT_CIVILIZATION_CONTEXT_VERSION=1`
- `ARENA_ASSESSMENT_PROGRESS_OWNER_VERSION=2`

Assessment signature 會綁：world、rank、position、level、civilization、base stats、VIP、戰鬥專精、印記，以及相容版本；角色條件改變後可正確判定舊評估 stale。

### 宇宙 Rank Curve V2

第一世界 `ARENA_RANK_CURVE` 不動。第二世界使用：

```text
x = Rank - 1
HP倍率   = 1.68 + 0.05x - 0.0015x²
傷害倍率 = 1.52 + 0.04x - 0.001x²
DEF倍率  = 1.11 + 0.022x - 0.0004x²
```

- `SECOND_WORLD_ARENA_RANK_CURVE_VERSION=2`
- Rank 1 直接有 base 強度，不再固定 ×1.00 起跳。
- 宇宙 Arena 敵方 HP 乘同一文明 final damage 倍率作耐久補償。
- `SECOND_WORLD_ARENA_CIVILIZATION_SCALING_VERSION=1`。
- GM `buildArenaEnemyForTest(...)` 使用 explicit civilization level；不暫改正式 state。
- `GM_SECOND_WORLD_ARENA_CIVILIZATION_SCALING_VERSION=1`。

Lv.600／VIP8／+24 全身／專精60／印記10／文明 Lv.2 校準前：Rank1～3 各 500 場皆 100%，全通剩餘 HP 約 92～94%，確認過弱。

V2 大量模擬預估全通率約：
- Rank1 99.7%
- Rank2 98.2%
- Rank3 98.1%
- Rank4 96.8%
- Rank5 95.3%
- Rank6 93.2%
- Rank7 91.0%
- Rank8 88.4%
- Rank9 85.6%
- Rank10 82.4%

**尚待實機驗收：**使用相同 Lv.600 校準角色，在遊戲內 GM 再跑 Rank1～3 各 500 次正式評估，確認 V2 真實結果是否符合預期。不要只依離線模擬就宣布平衡永久完成。

### 世界內容／UI

宇宙競技場名稱使用 canonical 第二世界區域：
1. 銀河彼端競技場
2. 本星系群戰爭競技場
3. 星群邊疆競技場
4. 群星會戰競技場
5. 超域邊境競技場
6. 萬域戰線競技場
7. 宇宙纖維帶競技場
8. 星海巨牆競技場
9. 宇宙深域競技場
10. 宇宙統合戰爭競技場

三連戰敵人名稱已依紀元拆分：
- 銀河：基礎模擬單元 → 戰術強化單元 → 極限測試平台。
- 宇宙：星域戰爭構裝 → 宇宙征戰構裝 → 文明終焉構裝。

UI 會顯示目前紀元名稱、競技場 canonical 名稱、該紀元三戰對手、雙條件解鎖卡。
- `ARENA_UNIVERSE_PLAYER_FLOW_UI_VERSION=2`
- `ARENA_WORLD_LABEL_UI_VERSION=3`
- `ARENA_ENEMY_LINEUP_UI_VERSION=1`
- `ARENA_WORLD_CONTENT_VERSION=1`

### 積分與戰鬥規則

- 宇宙 points base：normal 570 / hard 620 / extreme 670；Rank 4 起每階 +60。
- 三連戰不回血；新一輪才回血。
- shared daily arena limit 20。
- 宇宙玩家 final damage 套文明倍率；銀河固定 ×1.00。
- `ARENA_CIVILIZATION_DAMAGE_VERSION=2`
- `GM_ARENA_CIVILIZATION_DAMAGE_VERSION=2`
- `ARENA_EXPLICIT_WORLD_CONTEXT_VERSION=1`
- `GM_ARENA_STATE_ISOLATION_VERSION=1`

## 9.3 虛空
- 維持無限模式。
- GM 戰力基準不提供紀元 selector，視為共用模式。
- 玩家／GM 測試角色若處於宇宙紀元，文明等級 final damage 正式生效；銀河為 ×1.00。
- GM 可預覽指定樓層／從指定樓層連爬。
- `VOID_MIRAGE_CIVILIZATION_DAMAGE_VERSION=2`
- `GM_DUNGEON_CIVILIZATION_DAMAGE_VERSION=2`

## 9.4 鏡像
- 不分紀元 selector。
- 正式每次 20 戰；VIP points = `20 * wins^2`。
- 宇宙紀元文明 final damage 納入鏡像 snapshot，玩家與鏡像雙方套相同倍率，維持對稱。
- GM 鏡像測試讀 GM 測試角色 snapshot，不讀正式角色。
- 100 次實戰與 64 組對稱回歸可同時保留。
- 鏡像副本首頁卡片目前由 `dungeonui.js` 擁有；`mirrordungeonui.js` 聚焦鏡像副本頁本身，避免重複 home-card owner。

---

# 10. 冒險回顧／災厄回顧／正式 state 保護

宇宙紀元可回顧銀河內容：
- 冒險頁「銀河紀元・回顧」可進第一世界 10 大區、100 地圖。
- 回顧戰單場、零收益、零損失、不影響宇宙正式進度；正式 HP 戰後還原。
- 回顧 selection 與正式銀河 `selectedMap / selectedEnemy` 分離。
- 冒險背包 return context 明確區分銀河正式／銀河回顧／宇宙主線。
- 宇宙 Boss 卡有背包入口。
- 戰線紀錄與災厄回顧入口已完成，不再列為未完成功能。

重要安全補強：`galaxyreviewintegrity.js`
- `GALAXY_REVIEW_FORMAL_STATE_GUARD_VERSION=1`。
- 會保護 `startGalaxyReviewBattle` 與 `startGalaxyCalamityReview`。
- 回顧前 snapshot 正式 `state`；若回顧流程意外改動正式 state，會自動 restore，並重新 normalize dungeon state。
- 這是最後一道 zero-impact safety guard，不應用來合理化正式 review owner 直接亂寫 state；正式 owner 本身仍應保持回顧隔離。

既有版本：
- `GALAXY_REVIEW_SELECTION_OWNER_VERSION=1`
- `GALAXY_REVIEW_SELECTION_ISOLATION_VERSION=1`
- `GALAXY_REVIEW_BATTLE_RUNTIME_VERSION=3`
- `ADVENTURE_INVENTORY_RETURN_CONTEXT_VERSION=1`
- `SECOND_WORLD_ADVENTURE_UI_VERSION=4`
- `SECOND_WORLD_ADVENTURE_REVIEW_VIEW_VERSION=3`
- `GALAXY_ADVENTURE_REVIEW_BATTLE_VERSION=2`
- `PREPARE_MOBILE_CONTROLS_VERSION=2`

---

# 11. Dungeon UI／世界語意近期整理

`dungeonui.js` 已成為副本首頁／共用延伸的正式 owner，提供：
- `registerDungeonViewRenderer`
- `registerDungeonHomeCardRenderer`
- `registerDungeonPostRenderHook`
- `registerDungeonNavigationGuard`
- `DUNGEON_UI_EXTENSION_VERSION=1`
- `DUNGEON_PREP_RETURN_UX_VERSION=2`

近期重要行為：
- 副本狀態列 EXP 改走 `levelProgressSnapshot(state)`，宇宙 Lv.501～1000 不再被銀河 Lv.500 語意卡住；滿等才顯示 MAX。
- 副本／Arena 文案已做紀元感知清理，移除過時的 home text override。
- 鏡像首頁卡 ownership 移到 `dungeonui.js`，避免多重 renderer。
- Arena 世界名稱、區域名稱、敵人 lineup 已統一走 canonical world-aware owner。

---

# 12. GM 架構：目前正式基準

## 12.1 GM 頂層

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

Test 頂層只剩：
1. `player-ability-test`
2. `power-benchmark-test`
3. `player-title-preview`
4. `gm-story-test`

舊獨立 map/special/bounty/arena/void/mirror/calamity test section 已退休，不要恢復。

## 12.2 共用 GM 測試角色

角色能力測試可獨立設定：
- 紀元
- 等級
- 同級 5 件神話裝備／同步正式實穿裝備
- VIP
- 8 專精
- 5 部位強化
- 10 印記
- 文明等級

手動改紀元／等級時可建立同級神話裝備；同步正式角色時要完整 clone 目前裝備與養成，不得只同步總能力。

## 12.3 Session-only / Save isolation

使用者明確要求：
- 同一頁面工作階段內切 GM 區塊、離開再回來，測試設定保留。
- browser reload／重新進網頁才回初始值。
- 不寫正式 save、不寫 localStorage。

目前 session-only 保留：
- 測試角色紀元／等級／裝備／VIP／專精／強化／印記／文明。
- 地圖 benchmark 選擇。
- 特殊怪紀元／目標。
- 懸賞紀元。
- Arena 紀元／Rank／位置。
- Void 指定樓層。
- 銀河／宇宙災厄目標與 unlock probe。
- 已跑測試結果。

`gmTestArchitectureManifest()` 必須維持：
- sessionOnly true
- batchSync true
- benchmark true
- stateIsolation true
- legacyRetired true
- persistedTransientKeys 空陣列

---

# 13. GM 戰力基準 V21

正式 owner：`gmpowerbenchmark.js`。

版本：
- `GM_POWER_BENCHMARK_VERSION=21`
- `GM_POWER_BENCHMARK_GROUP_VERSION=2`
- `GM_POWER_BENCHMARK_ALL_MODES_VERSION=1`
- `GM_POWER_BENCHMARK_UNIFIED_SUMMARY_VERSION=2`
- `GM_POWER_BENCHMARK_LIVE_REFRESH_VERSION=1`
- `GM_POWER_BENCHMARK_BATCH_SIZE=25`

固定 7 模式：
1. 地圖怪
2. 特殊怪
3. 懸賞
4. 競技場
5. 虛空幻境
6. 鏡像戰
7. 文明災厄

紀元 selector：
- 地圖怪／特殊怪／懸賞／競技／災厄：銀河／宇宙。
- 虛空／鏡像：不分紀元 selector。

重點：
- GM 測試紀元與正式角色世界脫鉤。
- 地圖怪保留輸出／承傷診斷；其他模式以完整實戰模擬為主。
- Arena 可跑 100 次三連戰與 500 次正式評估；摘要含各戰條件勝率、全通率、平均回合、剩餘 HP、基礎／VIP 積分。
- Arena GM 目前 explicit 傳入 world + civilizationLevel，與正式 V2 enemy builder 同公式。
- 統一摘要只輸出本 session 實際跑過的模式。
- GM 測試角色條件變動時，舊結果要清除，避免摘要混用舊角色。

---

# 14. GM 舊路徑退休與 state isolation

不要恢復：
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
- 不為 GM 模擬暫改 `state.secondWorld.entered`。
- 不複製正式公式到 GM；GM 呼叫正式 owner + explicit test context。
- 特殊怪 weak-slot 用傳入 test equipment context。
- GM 測試不得污染 formal state/save。

---

# 15. Integrity／維護流程

## 15.1 Runtime / Story Integrity

Runtime／Final Integrity 持續檢查：
- SAVE_VERSION 13 / SCHEMA 15
- Save Write Guard V1
- world-aware level owner
- 第二世界 Boss 12:2:1 + BASE_STAT 2700
- civilization combat owner
- Bounty V2
- Arena world state / curve / civilization scaling / owner isolation
- GM session-only / batch sync / legacy retirement
- 宇宙文明災厄完整鏈

`.github/workflows/runtime-integrity.yml`：
- 會對 JS、`index.html`、指定 CSS、workflow 自身變動觸發。
- 先確認本次 push 是否仍為遠端 `main` 最新 HEAD。
- 若只是連續修改中的 stale intermediate commit，正常跳過正式 Runtime Integrity，避免半成品中間 commit 造成大量假失敗 Email。
- **只有目前最新 main HEAD 的正式檢查成功，才能宣告該批完成。**

之前 Email 狂跳問題根因：連續多 commit 修改時，中間 commit 已改正式值但 Integrity 還沒同步，例如 Boss base 已切 2800 而 runtime guard 尚在 2900。stale-head guard 已補上；不能用關通知掩蓋真正最新 HEAD 的失敗。

## 15.2 DEVELOPMENT_PROTOCOL.md

Repo 已新增正式維護規範 `DEVELOPMENT_PROTOCOL.md`，後續 ChatGPT 必須一起遵守：
- 修改前重新讀 main 正式 owner、直接相依、Integrity/workflow。
- 「先討論／先檢查／先列出」不得修改。
- 修改後重新讀回 main，不能只相信 update API 成功。
- JS/CSS 有改動必須同步 `index.html` cache-bust。
- 最新 HEAD Runtime Integrity 必須 success 才能說完成；queued/in_progress 仍不算完成。
- Story 相關修改同理確認 Story Integrity。
- 本批紅燈必須先修，不能靠下一批無關 commit 掩過。

---

# 16. 本輪 2026-09-23 主要完成項

## 16.1 文明 final damage 統一 owner

正式唯一入口：`civilizationCombatDamageMultiplier({ world, state, civilizationLevel })`。

已接：
- 宇宙主線
- 特殊怪
- 宇宙災厄
- 懸賞
- 競技
- 虛空
- 鏡像（雙方同倍率維持對稱）
- 各 GM／Benchmark 對應測試

禁止各模式重新直接呼叫舊倍率 helper 形成第二套判斷。

## 16.2 懸賞 V2 定案

- 單一 difficulty curve，非逐 tier 手改。
- 宇宙敵方 HP 有文明補償。
- GM explicit civilization context。
- 大量模擬已驗證，現在視為 frozen baseline。

## 16.3 宇宙主線 Boss 基準統一與降至 2700

- 三套 base 收斂成 `BASE_STAT` + `12:2:1`。
- 3000 → 2800 → 2700。
- 目前 2700 前期實測約 93～98%。
- `STEP_RATE=.015` 暫不動，待中後期測試。

## 16.4 宇宙 Arena Rank Curve V2

- 第一世界 curve 不動。
- 第二世界改 V2 base+線性+二次公式。
- 宇宙 enemy HP 補文明倍率。
- GM explicit civilization level。
- 尚待遊戲內 500 場 Rank1～3 實測驗收。

## 16.5 Arena 架構清理／世界 owner 統一

在 V2 平衡後，main 又完成一輪大幅 owner 收斂：
- `arenaByWorld` 成為 canonical state，legacy `dungeon.arena` 只作 non-enumerable compatibility alias。
- world／region／progress／assessment owner 集中，刪除重複推導。
- assessment compatibility profile 升級；不相容舊結果會失效。
- 宇宙競技場名稱直接吃 canonical 第二世界區域。
- 三連戰敵人內容依紀元拆分。
- 選擇 UI、評估 UI、雙條件解鎖、最近 3 個場地視窗改走 canonical owner。
- Universe EXP 在副本 status 正確顯示。
- mirror home card ownership 收斂至 `dungeonui.js`。

## 16.6 回顧正式 state safety guard

新增 `galaxyreviewintegrity.js`，保護冒險回顧與災厄回顧 zero-impact 語意；偵測正式 state 被意外改動會自動 restore。

---

# 17. 目前已完成的大型功能

截至目前 main：
- 第一世界完整主線與成長。
- 宇宙世界突破。
- Lv.501～1000 world-aware progression／EXP。
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
- 第二世界懸賞 V2。
- 第二世界競技場與 Rank Curve V2。
- Arena world-aware state / progress / assessment / UI owner 重整。
- 鏡像、虛空正式模式。
- 銀河冒險／災厄／戰線紀錄回顧。
- 回顧正式 state safety guard。
- GM 管理重整。
- GM 角色能力 sandbox。
- GM 戰力基準 7 模式集中。
- GM session-only 設定保留。
- 統一測試摘要與 live refresh。
- GM save isolation / explicit test context / legacy cleanup。
- Runtime Integrity + stale-head guard。
- DEVELOPMENT_PROTOCOL 正式維護規範。

---

# 18. 尚未完成／後續優先項目

不要再把「第二世界懸賞／競技」、「銀河冒險／災厄／戰線紀錄回顧」列成未完成。

目前真正後續：

## 18.1 Arena V2 實機驗收

用同一組 Lv.600／VIP8／+24／專精60／印記10／文明 Lv.2 GM 預測角色，至少再跑：
- Rank1 500 次正式評估
- Rank2 500 次正式評估
- Rank3 500 次正式評估

確認實際全通率、剩餘 HP、回合數，再判斷是否定案。不要逐 Rank 手改。

## 18.2 宇宙主線中後期平衡

`BASE_STAT=2700` 前期已較合適；後續需在 Lv.550、600～650、750 甚至更後段檢查 `STEP_RATE=.015` 是否合理。

## 18.3 Cloud Save 真實跨裝置驗證

至少：
1. 宇宙存檔上傳。
2. 乾淨環境／另一裝置下載。
3. reload。
4. 核對 secondWorld、world2 gear、+21～40、文明、arenaByWorld、災厄、offline/pending settlement。
5. 確認 Save Write Guard 不被破壞。

## 18.4 全介面＋遊戲說明雙紀元語意總掃描

至少掃：首頁、主線／冒險、角色、背包／裝備、強化、專精、離線收益、死亡／贖回、懸賞／競技／鏡像／虛空、文明災厄、戰線紀錄、設定、GM、所有結算文案、遊戲說明。

原則：
- 宇宙不能殘留銀河金幣／強化石／Lv.500／每圖 5 怪等錯誤語意。
- 同功能跨世界不同文字／規則時，優先共用 world-aware semantic/helper owner，不各頁硬寫。

---

# 19. 正式 owner 速查

- 基礎世界／品質：`data.js`
- 第一世界主成長／核心 state：`engine.js`
- save migration/load：`savemigration.js`
- 世界階段：`worldphase.js`
- 等級 progression：`levelprogression.js`
- 滿等額外語意：`levelcap.js`
- 第一世界戰鬥 pipeline：`battlepipeline.js`
- Combat Core：依 main 正式 combat owner 重新讀取
- 文明戰鬥倍率：`civilizationcore.js`
- Structured FX：`combatfx.js`
- Outer pacing：`combatpacing.js`
- Background：`backgroundprogress.js`
- Combat speed：`combatspeed.js`
- Offline：`offlineprogress.js`
- Offline target/checkpoint：`offlinefarmtarget.js`
- 冒險／雙紀元回顧：`worldmapui.js` + `ui.js`
- 回顧 state guard：`galaxyreviewintegrity.js`
- 手機冒險固定控制：`preparemobilecontrols.js` + `adventureuipolish.css`
- 專精：`specialization.js`
- VIP：`vipprogression.js` + `engine.js`
- 強化：`enhancementcore.js`
- 裝備 mutation/sale：`equipmentlock.js`
- 特殊怪 metadata：`specialmonsters.js`
- 特殊怪 drop/core：`specialcore.js`
- 特殊怪正式 flow：`specialencounter.js`
- 宇宙資料：`secondworlddata.js`
- 宇宙主線：`secondworldmainline.js`
- 宇宙 combat：`secondworldcombat.js`
- 宇宙 reward／裝備：`secondworldrewards.js`
- 第一世界災厄：`calamityconfig.js` / `calamitystate.js` / `calamitycore.js` / `calamityrun.js` / `calamityui.js`
- 印記：`markcore.js`
- 宇宙災厄：`secondworldcalamity.js` / `secondworldcalamityrun.js`
- 副本共用 UI：`dungeonui.js`
- 副本進度／Arena canonical world state：`dungeonprogress.js`
- 懸賞：`dungeonbounty.js`
- 競技戰鬥：`dungeonarena.js`
- Arena assessment：`arenapositioncore.js`
- Arena window/progress：`arenawindowcore.js`
- Arena player UI：`arenaplayerflow2.js`
- 鏡像：`mirrorconfig.js` / `mirrordungeonstate.js` / `mirrordungeonrun.js` / `mirrordungeonui.js`
- GM Hub：`gmhub.js`
- GM registry/order：`gmhubextensions.js`
- GM 測試角色：`vipgm.js` + 各正式養成 owner 的 test state
- GM 特殊怪：`specialgmbatch.js`
- GM 懸賞／虛空：`dungeongm.js`
- GM 競技：`arenagm5.js`
- GM 鏡像：`mirrordungeongm.js`
- GM 災厄：`calamitygm.js` / `secondworldcalamitygm.js`
- GM 戰力基準：`gmpowerbenchmark.js`
- Runtime integrity：`runtimeintegrity.js` + `tests/runtime/js-integrity.js`
- Final integrity：`finalintegrity.js`
- Runtime workflow：`.github/workflows/runtime-integrity.yml`
- 正式修改流程：`DEVELOPMENT_PROTOCOL.md`
- load order / cache-bust：`index.html`

---

# 20. 下一個 ChatGPT 必須遵守的操作規範

1. **GitHub `main` 的實際程式碼是唯一真實來源。** HANDOFF 只作摘要；任何工作前重新讀 main。
2. **修改前先讀相關正式 owner、直接相依、Integrity/workflow 與 `index.html`。**
3. 使用者說「先討論／先查／先看／先檢查／先列出／先不要修改」時，**不得寫 GitHub**。
4. 使用者說「做／修改／執行／修正／第 N 批」時，可直接修改 GitHub `main`。
5. **優先修改正式來源。** 不用 wrapper／fallback 掩蓋 owner 問題；不新增第二套 state、第二套公式、第二套 settlement。
6. GM 不複製正式公式；使用正式 owner + explicit test context，且不得污染正式 save。
7. 修改後必須重新 fetch 最新 `main` 自我檢查，不能只因 update API 成功就宣稱完成。
8. JS 至少做 parser / syntax；再做與修改範圍相符的 functional/static probe。
9. **任何玩家端 JS/CSS 改動都同步更新 `index.html` cache-bust。** 新 script 同時確認 load order，避免同檔重複載入。
10. Runtime Integrity 最新 main HEAD 必須是 success 才能說該批完成；queued/in_progress 不算完成；failure 必須先修。
11. Story 相關修改需同步確認 Story Integrity。
12. Save Write Guard V1 不可破壞。
13. 不自行重構舊存檔，除非使用者明確要求或有可重現 production bug。
14. 一批只做核准範圍，不順手改 balance、故事、schema 或其他未授權功能。
15. 已退休 API 不為相容而加回 wrapper。
16. `DEVELOPMENT_PROTOCOL.md` 是 repo 內正式維護規範，與本節一起遵守。

---

# 21. 下一個對話如何接手

標準指令：

> 讀取 GitHub `franksky1207/rpg` 的 `PROJECT_HANDOFF.md` 與 `DEVELOPMENT_PROTOCOL.md`，再重新檢查目前 `main` 的實際程式碼、正式 owner、直接相依、Integrity workflow 與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> **`main` 是唯一真實來源，HANDOFF 只作摘要。**  
> 修改前先讀相關正式 owner；修改後重新 fetch 最新 `main` 自我檢查。玩家端 JS/CSS 有改動時同步更新 `index.html` cache-bust，並確認最新 main HEAD 的 Runtime Integrity 最終為 success；故事相關修改同時確認 Story Integrity。  
> 我說「先討論／先查／先看／先檢查／先列出／先不要修改」時不得寫 GitHub；我說「做／修改／執行／修正／第 N 批」時可直接修改 GitHub `main`。  
> 優先修改正式來源，不要額外建立 wrapper、fallback、第二套 state、第二套公式或第二套 settlement。GM 測試要使用正式 owner＋explicit test context，不得污染正式 save。  
> 目前宇宙主線 Boss 正式基準為 `BASE_STAT=2700`、`HP:ATK:DEF=12:2:1`、`STEP_RATE=.015`；前期實測約 93～98%，中後段仍需驗證。懸賞 V2 已定案，除非明確要求不要再調。宇宙競技場使用 Rank Curve V2，Arena state／region／assessment／UI 已做 world-aware owner 收斂；下一步優先用同一 Lv.600 校準角色實機跑 Rank1～3 各 500 次驗收。  
> 目前另外保留 Cloud Save 真實跨裝置驗證，以及全介面＋遊戲說明雙紀元語意總掃描。  
> 現在先不要修改任何功能；先確認最新 main 與目前未完成項目，再等我的下一個指令。
