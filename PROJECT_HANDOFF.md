# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-28（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本檔只做交接與索引；若本檔、舊對話、舊 Word、舊規格或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次交接前 current `main` HEAD：

```text
410b86acc7bd773e0af1c54b09cacf0df238f2a9
```

目前已完成：

- 第 9 大批與第 9 優化-1～5：高維正式玩家 UI／Core／裝備／離線等收斂；
- 第 10 大批與第 10 優化-1～3：正式連戰玩家流程、事件呈現、runtime 安全、legacy/offline contract；
- 第 11 大批＋11-O1～O3：三紀元冒險 Era View、W3／W2／W1 回顧戰、shared review runtime／W2 legacy transient cleanup；
- 第 12 大批 12-1～12-4：三紀元共用 Story Registry、W3 trigger／queue／reload recovery、settlement→Story、completion-ready、Summary→Story→Title post-flow；
- 第 12-O1：W3 Story 舊資料 reconciliation、失效 Story reference recovery、Schema16 migration regression；
- 第 12-O2：W3 Story completion 單一 owner、formal/generic Story lifecycle identity；
- 第 12-O3：Story normalization 收斂、shared pending arbitration、behavioral regression；
- 第 12-O4：更新交接基準與高維 Boss 特化玩家文案 `%` 收尾。

本檔更新本身會再產生一個新的 handoff commit，因此**下一個對話仍必須重新讀 current `main`，不可只使用本檔記載的 HEAD。**

目前第三紀元／Story 主要版本／owner（current main 摘要）：

```text
SAVE_SCHEMA_VERSION = 16
WORLD_PHASE_VERSION = 6
THIRD_WORLD_PHASE_VERSION = 7
THIRD_WORLD_DATA_VERSION = 7
THIRD_WORLD_BOSS_SPECIALIZATION_PRESENTATION_VERSION = 2
THIRD_WORLD_COMBAT_VERSION = 6
THIRD_WORLD_PROGRESS_VERSION = 5
THIRD_WORLD_SETTLEMENT_VERSION = 5
THIRD_WORLD_RUN_VERSION = 7
THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION = 4
THIRD_WORLD_RUN_INTEGRITY_VERSION = 8
THIRD_WORLD_CORE_PROGRESSION_VERSION = 3
THIRD_WORLD_EQUIPMENT_REWARD_VERSION = 3
THIRD_WORLD_PLAYER_UI_VERSION = 9
THIRD_WORLD_PLAYER_FLOW_VERSION = 6
SAVE_THIRD_WORLD_BOSS_MIGRATION_REGRESSION_VERSION = 5
CIVILIZATION_STORY_PROGRESS_VERSION = 17
STORY_RUNTIME_INTEGRITY_VERSION = 18
STORY_UI_VERSION = 10
STORY_UI_LIFECYCLE_WAIT_VERSION = 2
STORY_UI_INSTANCE_IDENTITY_VERSION = 1
CIVILIZATION_THIRD_WORLD_DATA_CONTRACT_EXTENSION_VERSION = 37
```

> 版本只做快速索引；下一個對話仍必須重新讀 current `main` owner，不能以本表取代實碼。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先重新讀 current main 的 `PROJECT_HANDOFF.md` 與本次會碰到的正式 owner。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須重新讀 current main、compare base→head，並自我檢查 UI／邏輯／資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS 修改都必須更新 `index.html` cache-bust。** Markdown-only handoff 更新不需要 cache-bust。
6. 優先修改正式來源；不要額外新增 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner。
7. 第一／第二／第三紀元能共用的邏輯，優先走 shared owner；不要把第三紀元完全切成孤立系統。
8. GM sandbox／benchmark state 不得污染 formal save。
9. `thirdWorld` persistent state 只存 root；Stage、能力、5% front、稱號 tier、run deaths、active target、run summary、Fast Catch-up state 都不得 persist。
10. 未定案的 W3 劇情正文、final ending、輪迴／轉生、競技場規則不得自行補成正式內容。
11. 不修改鏡像戰本體來實作 W3，除非使用者明示。
12. current main 若已完成某規格，承接現況，不重做。
13. 若規格文件與 main 衝突：**main 決定現在已實作的真實狀態；文件只保留尚未施工部分的設計方向。**
14. 如果 Integrity / Actions 沒有實際回傳綠燈，不可宣稱 CI 已綠。

---

# 2. 世界結構與正式成長權限

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()`：1 / 2 / 3 分別代表銀河／宇宙／高維。

正式成長只允許 current phase：

```text
worldProgressionEnabled(world) === (world === currentWorldPhase())
```

進入高維紀元後：

- W3 是唯一正式成長世界；
- W1/W2 保留歷史與回顧能力，不再產正式成長；
- 鏡像戰／虛空沿用，不分紀元；
- 懸賞戰在 W3 關閉；
- W3 Arena 規則仍未定，維持 disabled；
- 不建立 W3 文明災厄；
- 不建立 W3 特殊怪／特殊遭遇正式進度。

---

# 3. 第三紀元進入條件與轉移

正式進入條件：

1. Lv1000；
2. 宇宙紀元已進入；
3. 宇宙主線最終 Boss 完成；
4. 宇宙最終故事完成；
5. 五部位強化 +40；
6. 文明 Lv10；
7. VIP ≥20；
8. 8 專精全部 Lv60；
9. 10 印記全部 Lv10。

保留：

- level / exp；
- VIP；
- 已裝備／背包裝備；
- +40；
- 8 專精；
- 10 印記；
- 文明 Lv10；
- 鏡像戰／虛空進度；
- 舊世界歷史／紀錄／稱號。

進入時清理／重整：

- 宇宙暗物質歸零；
- 宇宙暗能量歸零；
- lost gear 先恢復再清 transition 狀態；
- black market pending 狀態重置；
- Offline checkpoint／pending settlement 重置；
- 不可跨世界的 transient runtime 清除；
- `secondWorld.entered` 保留 true；
- `thirdWorld.entryVersion` 正式進入即為 2。

---

# 4. Save／Migration／舊資料政策

正式 schema：

```text
SAVE_SCHEMA_VERSION = 16
```

`thirdWorld` persistent allowlist：

```text
entered
completed
entryVersion
dimensionalStrings
coreLevel
coreProgress
bosses[].currentHp
story.introSeen
story.unlockedStage
story.finalSeen
```

不得 persist 的 runtime／derived 狀態包含但不限於：

```text
deaths
suppression
run
runId
targetBossIndex
pendingEvents
recentBattles
lastBattleSummary
lastFinishedRun
lastFinishedRuntime
coreLevelAtStart
perDeathSuppressionPointsAtStart
runTotals
catchingUp
catchUpCompleted
playerFlowContext
stopReason
hpCap
Boss stage / abilities
5% front derived state
title tier
```

Schema 16 正式政策：

- `coreProgress` 是 additive optional field，舊 Schema16 缺少時預設 0；
- normalization-only 可維持同 schema；
- semantic reinterpretation／persistent-field-removal／incompatible-structure 必須升 schema；
- Schema 1～15 若夾帶 W3，視為開發期資料並丟棄；
- future save fail-closed；
- `world=3` gear 只接受 source schema ≥16；
- Boss persistence 只有 `currentHp`，Boss 順序是正式 persisted identity，不可任意重排。

Core 舊資料信任邊界：

```text
entryVersion 0 / 1 = development-only unpaid core
entryVersion >= 2    = trusted formal core
```

對 entryVersion <2：

- `coreLevel = 0`；
- `coreProgress = 0`；
- `dimensionalStrings` 保留；
- entryVersion reconciliation 到 2。

對 entryVersion ≥2：

- 正式投入保留；
- `coreProgress >= 1b` 可 carry-forward 升級；
- Lv10 時 overflow 回收到 `dimensionalStrings`；
- 不會吃掉合法已投入資源。

第 10 優化-2 已擴大 migration regression，會確認第 10 批新增的 runtime／Fast Catch-up／run totals／run identity transient 欄位全部被 normalization 丟棄，不寫入正式存檔。

---

# 5. 高維10 名高維存在／Stage／能力／5% 戰線

每王最大 HP：

```text
1,100,000,000
```

10 名高維存在總 HP：

```text
11,000,000,000
```

100% 基準能力：

```text
ATK 15,000
DEF 10,000
暴擊 10%
閃避 10%
先制 +60%
連擊 30%
穿透 30%
反擊 30%
汲取 30%
```

10 名高維存在正式順序／特化：

```text
01 破界天裁：ATK ×1.15
02 永劫重垣：DEF ×1.15
03 宿因天秤：暴擊 +6 percentage-points
04 無相彼岸：閃避 +6 percentage-points
05 萬象迴演：連擊 +10 percentage-points
06 維隙之刃：穿透 +10 percentage-points
07 逆因輪轉：反擊 +10 percentage-points
08 噬界深淵：汲取 +10 percentage-points
09 先驗之瞳：先制 +20 percentage-points
10 高維原點：ATK ×1.08、DEF ×1.08
```

Stage：

```text
>90%        Stage 0
<=90%       Stage 1
<=80%       Stage 2
...
<=10%       Stage 9
```

每 Stage：

```text
ATK +600
DEF +1200
暴擊 +2 percentage-points
閃避 +2 percentage-points
```

共通能力解鎖：

```text
70% 鎮心
60% 壓制
50% 韌性
40% 復仇
30% 反噬
20% 無視
10% 戰意
```

5% 戰線正式判定：

```text
FIVE_POINT_HP_GAP = 55,000,000 HP
```

規則：

- 只比較存活王；
- 目標王比最高存活王少至少 55m HP，下一場不可開始；
- 死亡王退出比較；
- 最後一名存活王免限制；
- challenge status 由 `thirdWorldChallengeStatus()` 單一 owner 決定；
- battle start resolve 一次；
- 本場合法開始後即使跨線仍完整結算，下一場才鎖；
- 玩家戰線文案使用 **5%**，不顯示 `5pp`。

**玩家顯示政策（第 12-O4 已完成）：** `thirdWorldBossSpecializationPresentation()` 對暴擊／閃避／連擊／穿透／反擊／汲取／先制的玩家可見特化效果統一顯示 `%`；底層仍以 points 欄位做數值加成，未改任何戰鬥公式。5% 戰線也繼續只顯示 `%`。

---


# 5A. 第 11／12 大批：三紀元回顧與共用 Story Framework

冒險／回顧：

- `adventureEraView` 是 session-only 共用 Era View owner；W3 可切高維／宇宙回顧／銀河回顧，W2 可切宇宙／銀河回顧；
- W3 defeated boss review、W2 100 Boss real review、W1 review 共用 review runtime lock／source owner；回顧一律零正式收益、零正式進度；
- W2 normalization 保留未知 future fields，只清明確退休 transient；Schema 16 不因 cleanup 升版。

高維 Story Framework：

- Trigger 共 11 個：`intro ×1 + milestone(stage 1～9) ×9 + final(stage 10 / 0%) ×1`；**0% 不另有第 10 篇 milestone**；
- W3 descriptor 在正式正文加入前維持 `contentReady:false`，placeholder 不得進 shared `pendingStory`；
- 三紀元共用 `storyProgress.pendingStory / completedStories`，W3 不另建 persistent queue；
- `story.unlockedStage` 由10 名高維存在 canonical aggregate/title tier owner reconciliation，不另寫 900／800／…／0 公式；
- Story 舊資料會清理不存在／placeholder reference；合法 W1／W2 reference 必須保留；
- W3 Story completion 單一 owner：Intro 完成同步 `introSeen`；Final 只有在10 名高維存在全滅＋stage10 後讀完，才原子寫入 `finalSeen=true` 與 `thirdWorld.completed=true`；
- Story lifecycle 使用 session token＋storyId＋`formal/generic` owner，GM／戰線紀錄 replay 不得冒充正式流程；
- W3 正式 post-flow：`Run Summary → Story → Title Notice`；title hold 為 session-only；
- shared pending arbitration 能辨識 galaxy／universe／higher-dimensional／unknown；W3 遇 foreign pending 只 defer，不搶、不清；unknown fail-closed；
- `CIVILIZATION_STORY_PROGRESS_VERSION=17` 已收斂重複 normalization，並由 Story Runtime Integrity 實際執行 behavioral regression。

**尚未完成／不得自行創作：** 高維序章正文、900～100% 九段 milestone 正文、0% Final 正文與最終畫面仍屬第 13 批內容，現在只有 framework。

---

# 6. 等級／Combat／Settlement

等級：

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：封頂，EXP 歸零
```

正式永久削血：

```text
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

重要規則：

- Boss 戰鬥 HP 以上一場正式永久剩餘 HP 為起點；
- Boss 汲取只能回補本場，不可超過 `formalStartHp`，不能把歷史削血補回；
- 玩家死亡戰只要 settlement basis 合法仍可落帳；
- stale settlement 會因正式 Boss currentHp 與 formalStartHp 不一致而拒絕；
- save 失敗走 shared settlement transaction rollback。

正式 settlement 順序：

```text
validate basis / stale guard
→ aggregateBefore
→ 寫 Boss currentHp
→ EXP + 維度之弦 + 升級
→ post-EXP equipment loot
→ aggregate title/story/death/stage/5% progression
→ shared transaction save
→ rollback on failure
```

Settlement `eventSequence` 可產生：

```text
aggregate-progress
boss-defeated
stage-crossed
five-point-front
completion-ready
```

10 名高維存在全滅會形成：

```text
completionReady = true
final eligibility = true
```

但**10 名高維存在全滅本身不直接完成第三紀元**。只有正式 Final Story 在「10 名高維存在全滅＋stage10」條件下真正完成後，shared Story completion owner 才原子寫入 `story.finalSeen=true` 與 `thirdWorld.completed=true`。目前 Final 正文仍是 placeholder，因此不會提前完成。

---

# 7. 100 死連戰／界弦核心／Runtime

正式連戰：

```text
最大死亡：100
每死壓制：0.50 percentage-points - coreLv × 0.04 percentage-points
Core Lv0：100死後最大 HP 約 50%
Core Lv10：100死後最大 HP 約 90%
```

玩家介面顯示使用 `%`，例如「目前最大 HP 95.92%」，不顯示每死 `pp` 技術字樣。

正式 runtime 行為：

- 每輪 `deaths=0`；
- 玩家死亡且 Boss 未死才 +1 death；
- 成功 combat＋settlement 才 +1 battle；
- run start snapshot `coreLevelAtStart` 與 suppression；
- run active 禁止 Core 注入；
- Boss death／stage crossed／5% front／aggregate progress／death-limit 都結束整輪；
- manual stop／pagehide／reload 清 transient；
- recent summaries 最多 20；
-完整 totals 另由 run loop transient 累計，不受 recent 20 筆截斷影響；
- last-finished runtime 只存在 module memory；
- W1/W2/W3 共用 continuous/background/Fast Catch-up infrastructure。

第 10 優化-1 已完成 runtime 安全收斂：

- 每輪有 transient `runId`；
- `thirdWorldLastFinishedRunSnapshot(expectedRunId)` 只接受同一輪 snapshot；
- combat／settlement／player callback 若 throw，loop 會 `clearRuntime("battle-error")`，避免幽靈連戰；
- 異常結束不會誤拿上一輪 `lastFinishedRuntime`；
- totals 缺失時只有「recent history 未截斷」才允許 fallback 加總；
- `resultsTruncated=true` 且 totals 不可用時，玩家結算 fail-closed 顯示「無法完整還原」，不偽造總收益。

第 10 優化-3 已收斂 start owner：

```text
thirdworldplayerflow.js
→ 只呼叫 runThirdWorldContinuousLoop()
→ run loop 自己 startRun()
```

玩家層不再先呼叫 `startThirdWorldContinuousRun()` 再讓 loop 重複 start。

界弦核心：

```text
Lv0～10
每級 1,000,000,000 維度之弦
總投入 10,000,000,000
```

採「全部注入可用量」設計，但允許 partial progress 永久保存；`coreProgress` 可跨級 carry；Lv10 停止吸收，多餘 strings 保留。

---

# 8. W3 裝備／Offline／舊資料處理

正式 loot：

- 95% 傳說；
- 5% 神話；
- 每場正式戰鬥至少 1 件；
- 沿用 VIP loot；
- item level = post-EXP player level，最高 2000；
- `world=3`；
- `sell=0 / buy=0`；
- 強化封頂 +40；
- 50 個正式 W3 裝備名稱已完成；
- 名稱 band 依10 名高維存在 aggregate remaining HP 決定。

Offline：

- sample V4；
- 速度池 1 / 1.5 / 2 各保留最近 8 筆；
- W3 sample 不記 boss identity；
- 只有 foreground 正式 complete combat＋settlement 才可產 sample；
- background / Fast Catch-up 不產正式 sample；
- W3 Offline **只給裝備機會**；
- 不削 Boss 永久 HP；
- 不給 EXP；
- 不給維度之弦；
- 不推 Core／Title／Story／Completion。

第 10 優化-2 已修正原先的 Offline migration contract mismatch：

```text
offlinestatecore.js:
OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2

offlineworld3adapter.js validate():
現在也正式要求 OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION === 2
```

因此**舊 handoff 所寫「第15批再修 migration version 2 vs 1」已失效，已刪除。**

Offline legacy policy 仍為：

- V1/V2 unsafe sample：安全丟棄，不影響其他角色資料；
- V3：轉成 V4 compatible normalization；
- V4：canonical；
- reset owner 只重置 offline state，不應污染正式 W3 progression。

---

# 9. 第 9 大批：高維正式玩家 UI（已完成）

Adventure：

- 依 current phase routing；
- W3 直接進高維戰線，不再有 10 大區域階層。

高維戰線首頁：

- aggregate 摘要；
- 共通能力折疊區；
- 正式連戰規則；
- 2×5 10 名高維存在卡；
- inline 界弦核心；
- 頂部功能列真正三等分：
  - 左 1/3：返回主頁；
  - 中 1/3：「高維戰線」幾何置中；
  - 右 1/3：固定背包；
- 背包不跟著最高 Boss 走。

Boss 卡：

- 顯示永久剩餘 HP／%；
- Stage；
- 個體特化；
- 已解鎖能力；
- challenge status；
- 已擊破王目前仍只顯示「已擊破」，正式「已擊破／回顧」要到第 11 批。

Core UI：

- Lv；
- 本級進度；
- strings；
- 可注入量；
- 注入後預覽；
- 不可逆確認；
- run active 鎖定；
- UI 只呼叫正式 Core transaction owner，不自行計算正式資源寫入。

第 9 優化-1～5 已完成 phase/owner 收斂、舊紀元語意、Core 保值與安全、Schema/legacy policy、Integrity closure。

---

# 10. 第 10 大批：正式連戰玩家流程與事件呈現（已完成）

## 10-1 連戰入口／選王頁

- 10 名高維存在正式接 player flow；
- 連戰時鎖其他王，不可中途換目標；
- active 王可停止連戰；
- 選王頁只顯示必要資訊：目標、死亡 X/100、目前最大 HP X%；
- 頂部三等分與固定背包完成。

## 10-2 共用戰鬥呈現／極簡模式

`thirdworldplayerflow.js` 接既有：

```text
prepareCombatPresentation()
animateStructuredCombatPresentation()
```

不建立第三套 combat renderer。

正式戰鬥頁精簡顯示：

- Boss；
- 第幾場；
- 死亡 X/100；
- 目前最大 HP X%；
- 速度。

HP cap 真的作為本場玩家可用最大 HP；不是只加一行文字。

W3 透過 `registerMinimalModeAdapter()` 共用既有 Minimal Mode，不建立 W3 專屬 overlay。

## 10-3 Stage／能力／5%／Boss／aggregate 事件

- 單場跨多個 Stage 門檻只顯示一個合併 modal；
- 新能力解鎖併在 Stage 事件；
- 5% front、Boss death、aggregate progress 直接使用 settlement `eventSequence`；
- Fast Catch-up 不得吞終止事件；
- 10 名高維存在全滅只提示 `completionReady`，不寫 final story/completed；
- 高維稱號不做第三套 modal。

## 10-4 背景／Fast Catch-up

- W3 與 W1/W2 共用 GM「背景戰鬥」gate；
- GM 背景關閉：進背景後等待，不開始下一場，回前景再續；
- GM 背景開啟：使用 shared `backgroundprogress.js` credit / Fast Catch-up；
- 回前景顯示快速補算；
- checkpoint 更新 deaths、HP cap、Boss 永久 HP、Lv／EXP／strings；
- final sync 後完整 render；
- pagehide/reload 仍清 transient，不 persist run。

## 10-5 連戰結算／停止原因／稱號排序

每輪 transient totals：

```text
永久削血
EXP
維度之弦
裝備取得件數
```

正式結算顯示：

- 戰鬥場數；
- 死亡數；
- 永久削血；
- EXP；
- 維度之弦；
- 裝備數；
- Boss 剩餘 HP；
- 中文停止原因。

停止原因分類仍由 shared `continuousRunStopReasonMeta()` 提供 internal semantics。

正式順序：

```text
戰鬥／進度事件
→ 連戰結算
→ render
→ shared title post-flow
```

仍呼叫：

```text
flushPendingPlayerTitleNoticeAfterFlow()
```

不建立第三套高維稱號 modal。

---

# 11. 第 10 優化-1～3（已完成）

## 第 10 優化-1：Runtime 安全／run identity／totals fail-closed

已完成：

- exception 強制收尾，避免 `runtime.active=true` 的幽靈連戰；
- 每輪 transient `runId`；
- last-finished snapshot 必須 match expected runId；
- >20 場時不再用 bounded recent history 偽裝完整 totals；
- totals 缺失且 history truncated 時 fail-closed；
- run/subsystem/integrity contract 已更新到 current versions。

## 第 10 優化-2：Offline legacy contract／migration regression

已完成：

- W3 Offline adapter migration contract 從錯誤的 `1` 對齊 canonical `2`；
- migration regression 補第 10 批 runtime／Fast Catch-up／run totals／identity transient 欄位；
- **不升 Save Schema，仍為 16**；
- **不改 migration 語意，只補 contract 與 regression coverage。**

## 第 10 優化-3：5% 玩家用語／start owner 收斂／結算 internal category 隱藏

已完成：

- 高維戰線規則與 5% event 玩家文案不再顯示 `5pp`；
- player flow 不再先 start runtime；`runThirdWorldContinuousLoop()` 成為唯一正式 start owner；
- 玩家連戰結算不再顯示 `completion / progression / interruption / error` 等 internal category；
- Player UI / Player Flow Integrity 增加防止 `5pp` 戰線文案與 duplicate start owner 回歸的 guard。

---

# 12. GM／測試現況

目前已存在並可沿用的 GM 架構：

- 角色測試與正式角色分離；
- GM sandbox 不修改正式存檔；
- 戰力基準測試已有世界 phase adapter，可帶 W3 character world / Lv1000～2000 語意；
- 正式角色與測試角色可分開設定；
- GM 背景戰鬥 gate 已同時涵蓋銀河／宇宙／高維正式連戰；
- GM 2× 仍為測試用途，正式玩家 W3 最多 1.5×；
- 正式印記管理：
  - 銀河紀元可「未取得／Lv0～10」；
  - 宇宙紀元／高維紀元正式角色固定 10 枚 Lv10，不可向下改；
  - GM 測試 sandbox 仍可自由 Lv0～10；
- GM 測試的印記調整不污染 formal save。

尚未完成、留到第 15 批的 W3 GM：

- 高維正式管理頁完整化；
- 界弦核心正式／測試控制整合；
- 高維10 名高維存在 benchmark 模式；
- 100%／90%…10% Stage 選擇；
- 100 死模擬；
- 永久淨削血／回血／死亡／剩餘 HP／跨階詳細輸出；
- 正式管理只寫 root，派生值全部由正式 owner 重算。

---

# 13. 其他已完成的重要現況／小修

- GM 正式角色印記 phase lock 已完成：Galaxy 可調；Universe/W3 固定 Lv10；測試 sandbox 自由調。
- 遊戲說明的特殊怪名稱／敘述改讀正式 era profile，不再硬編銀河名稱。
- W3 Title 已併入 shared player title catalog／renderer／post-flow。
- W3 Dungeon policy 已存在：
  - bounty 隱藏；
  - Arena 顯示但 disabled，文字「等待高維競技場開放」；
  - Mirror／Void／tower 類既有入口仍可見；
  - W3 dungeon status 主資源使用維度之弦；
  - navigation guard 會阻擋被禁模式。
- W3 目前沒有正式災厄主進度；舊災厄／舊世界只做回顧語意。
- W3 50 個裝備名稱已完成，不屬於未定項目。

---

# 14. 尚未定案，不可自行決定

1. 高維序章具體故事文本。
2. 10 個高維 milestone 的完整劇情／事件內容。
3. 10 名高維存在全滅後的最終通關故事／畫面。
4. 是否銜接低維輪迴／轉生，以及任何 reset 設計。
5. W3 Arena 正式形式與數值曲線。
6. 高維專屬背景／動畫／特效細節。
7. 10 名高維存在大量實測後的最終平衡。
8. 若要把 Boss 個體特化 presentation 中仍存在的 `pp` 全部改成玩家 `%` 顯示，需另外明確處理；目前 main 尚未改。

---

# 15. 接下來五大批正式施工順序：第 11～15 批

## 第 11 批：高維回顧＋三紀元歷史切換

### 高維已擊破王回顧

已擊破高維王原卡改成「已擊破／回顧」。

回顧正式規則：

- 固定 10% 最終型態，也就是 Stage 9；
- 滿 HP 開場；
- 單場；
- 套用全部共通能力＋該王個體特化；
- 無 EXP；
- 無維度之弦；
- 無裝備；
- 無 Boss 永久削血；
- 無 Title／Story／Completion progression；
- 絕不改正式 `thirdWorld` state；
- 不提供 Stage 選擇。

### 三紀元歷史切換

建立 session-only tabs：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

規則：

- current world 是預設；
- 同 session 玩家手動切到哪個紀元，普通 render 不自動跳回 current world；
- reload／重開才回 current-world 預設；
- 不 persist 到 save；
- 銀河既有回顧保護 owner 已存在，不重做；
- 優先延伸既有 review/history owner，不另做第三套回顧安全層。

## 第 12 批：高維劇情 Trigger Framework＋Completion Framework

**只做架構，不自行寫故事。**

接：

```text
story.introSeen
story.unlockedStage
story.finalSeen
```

建立：

- 序章 trigger；
- 900／800／700／600／500／400／300／200／100／0% milestone trigger；
- 讓 settlement 已產生的 `story.unlockedStage` 真正進入 presentation queue；
- 10 名高維存在全滅 → final flow 的 completion framework；
- placeholder registry／empty content contract；
- shared title post-flow 與 story queue 的正式順序。

本批不得自行撰寫高維正式台詞／劇情。

## 第 13 批：正式劇情內容＋最終通關流程

**必須先與使用者另外討論並定案：高維序章、10 段主劇情、10 名高維存在全滅事件。**

定案後才可實作：

- 正式 story data files；
- intro 正文；
- 10 段 milestone 劇情；
- 10 名高維存在全滅 final event；
- `story.finalSeen`；
- `thirdWorld.completed` 正式原子寫入；
- 最終畫面／正式事件順序；
- completion owner。

原則：`completed` 只能在10 名高維存在全滅且 final flow 正式完成後由 completion owner 寫入，不能由 settlement 偷寫。

## 第 14 批：副本／舊系統整合＋競技場決策

這一批**不是再做一套高維副本**。

目前 `thirdworlddungeonui.js` 已經有：

- bounty hidden；
- Arena provisional disabled；
- Mirror／Void 保留；
- W3 resource/nav policy。

本批要實際驗證／收斂：

- W3 下鏡像戰完整可玩；
- W3 下虛空完整可玩；
- resource／return／navigation／speed 語意正確；
- Mirror/Void 不產 W3 維度之弦；
- Mirror/Void 不修改10 名高維存在永久 HP；
- 特殊怪／特殊遭遇不進 W3 正式流程；
- 沒有 W3 文明災厄入口；
- bounty 維持關閉。

Arena：

- 若屆時已定案 → 在本批實作；
- 若仍未定案 → 保持「等待高維競技場開放」，不得自行設計。

## 第 15 批：GM 完整化＋Integrity＋最終封口

完成：

- 高維 GM 正式管理；
- 界弦核心測試控制；
- 高維存在 benchmark；
- 10 名高維存在選擇；
- 100%／90%…10% Stage；
- 100 死模擬；
- 永久淨削血／回血／死亡／剩餘 HP／跨 Stage 輸出；
- 正式管理只改 root：
  - entered；
  - completed；
  - player level；
  - dimensionalStrings；
  - coreLevel / coreProgress；
  - bosses[].currentHp；
- Stage／abilities／5% front／title tier／story tier 由 owner 推導，不直接寫。

最後補：

- W3 UI integrity；
- review integrity；
- story/completion integrity；
- dungeon integration integrity；
- GM integrity；
- legacy cleanup；
- 全專案 regression；
- Pages／Runtime／Story exact-HEAD closure。

**注意：Offline migration version `2 vs 1` mismatch 已在第 10 優化-2 修掉。第 15 批只需要重新驗證 offline contract，不要再把它當待修 bug 重做。**

---

# 16. 第 11 批施工前至少必讀 owner

下一個對話若從第 11 批開始，至少重新讀：

```text
PROJECT_HANDOFF.md
index.html
thirdworldphase.js
thirdworlddata.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldui.js
thirdworldui.css
thirdworldplayerflow.js
worldmapui.js
playersemanticsui.js
storyrecordtabs.js
playertitleui.js
backgroundprogress.js
thirdworlddungeonui.js
galaxyreviewintegrity.js
thirdworldintegritycontract.js
```

另外要先搜尋 current main 已存在的 Galaxy／Universe review owner、歷史 tabs/session owner、single-battle review combat adapter，再決定擴充點。

不要從舊 handoff 或舊對話推測函式名稱；必須重新讀 current main 實碼。

---

# 17. 第 11 批前的風險／注意事項

1. 第 11 批回顧必須完全無收益，不能只「UI 不顯示」但底層仍走正式 settlement。
2. 高維回顧 Boss 必須用固定 10% 最終型態滿 HP，不使用正式 currentHp 當回顧血量。
3. 三紀元切換只能 session-only，不能新增 persistent save field。
4. 同 session 玩家已切到回顧後，不應因普通 `render()` 被 current phase 自動推回 W3。
5. reload 才重設成 current-world 預設。
6. 回顧與正式 challenge 必須使用不同 permission path，避免已擊破 Boss 因 `thirdWorldChallengeStatus().reason === defeated` 而誤走正式戰鬥。
7. 回顧不得建立第二套 combat engine；優先走 shared `runCombatCore` / structured presentation，但禁止正式 settlement。
8. W3 正式連戰目前已穩定使用 runId／exception cleanup／totals fail-closed；第 11 批不可破壞第 10 批 closure。

---

# 18. 本階段完成總結

目前正式完成鏈：

```text
W3 foundation
→ entry / save / migration
→ Lv1000～2000
→ ten-boss data / stage / abilities / 5% front
→ combat / settlement
→ Core / loot / offline
→ high-dimensional front UI
→ formal 100-death continuous run
→ shared combat presentation / Minimal Mode
→ Stage / ability / 5% / Boss / aggregate events
→ GM background gate / Fast Catch-up
→ run summary / shared title post-flow
→ run identity / exception cleanup / totals fail-closed
→ offline legacy contract alignment / transient migration regression
→ player 5% front terminology / duplicate-start owner convergence
```

下一步正式是：

```text
第 11 批：高維回顧＋三紀元歷史切換
```

不是再重做第 10 批連戰流程。

---

# 19. 下一個對話如何接手（標準指令）

請在新對話直接貼下面這段：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff 或舊對話記憶。接下來從第 11 批「高維回顧＋三紀元歷史切換」開始；先重新讀 handoff 列出的相關 owner、既有銀河／宇宙回顧與歷史切換程式，再告訴我檢查結果與建議。現在先不要修改。

若新對話已經準備直接施工，可把最後一句改成：

> 第 11 批，修改完後自我檢查。
