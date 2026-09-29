# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-29（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本檔只做交接、索引與目前規格摘要；若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

第 13 批正式劇情內容與 Story 收尾已完成；其後已完成一次 **W3 Story 舊資料／completion owner 優化**。本次 handoff 更新前的功能 HEAD 為：

```text
829cbb7fd412ab0eae974eec1d0e6527b867d9b7
```

該 HEAD 已包含第 13-1～13-8 批正式 Story Framework／GM 預覽／322 頁高維正文／Final completion／三紀元 Story Record／Story Integrity 最終封口，以及第 13 批後的舊 Schema16 W3 Story history migration 與 completion owner 收斂。此 handoff 本身會再產生 Markdown-only commit，因此下一個對話仍必須重新讀 current `main`，不可把這裡記載的 SHA 當成永久真實來源。

已完成的第 13 批結構：

```text
13-1  Story foundation + GM Story Test
13-2  序章 + Stage 1
13-3  Stage 2 + Stage 3
13-4  Stage 4 + Stage 5
13-5  Stage 6 + Stage 7
13-6  Stage 8 + Stage 9
13-7  Final 31 頁
13-8  Story Record + final Integrity closure
```

高維紀元正式 Story：

```text
序章 12 頁
Stage 1～9：9 × 31 頁
Final：31 頁
總計：11 篇／322 頁
```

目前正式進度：

- 第 9～12 大批及相關優化：高維正式 UI、成長、戰鬥、連戰、回顧、Story Framework 等完成；
- 第 13 大批 13-1～13-8：**正式完成**；高維 11/11 Story、Final completion、GM 預覽、三紀元 Story Record 與 Story Integrity closure 都已進 current main；
- 第 13 批後 Story legacy 優化：**已完成**；舊 Schema16 W3 開發期 Story refs 會一次性重建，Boss／Core／Stage／W1/W2 Story history 保留，W3 completion 收斂到 shared Story Progress owner；
- 宇宙紀元 Arena Rank 8～10 高階平衡已重新校準；
- **剩餘正式施工只剩第 14、15 批。**

重要版本／owner 快速索引：

```text
SAVE_SCHEMA_VERSION = 16
THIRD_WORLD_DATA_VERSION = 7
THIRD_WORLD_BOSS_SPECIALIZATION_PRESENTATION_VERSION = 2
THIRD_WORLD_RUN_VERSION = 7
THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION = 4
THIRD_WORLD_RUN_INTEGRITY_VERSION = 8
CIVILIZATION_STORY_PROGRESS_VERSION = 17
STORY_MIGRATION_VERSION = 6
THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION = 1
THIRD_WORLD_STORY_CONTENT_VERSION = 1
THIRD_WORLD_STORY_COMPLETION_SOURCE_VERSION = 1
STORY_RUNTIME_INTEGRITY_VERSION = 25
STORY_RECORD_TABS_VERSION = 9
STORY_RECORD_WORLD_REVIEW_VERSION = 4
THIRD_WORLD_STORY_RECORD_VERSION = 1
VIP_UI_VERSION = 4
THIRD_WORLD_VIP_PRESENTATION_VERSION = 2
THIRD_WORLD_DUNGEON_UI_VERSION = 2
DUNGEON_MODE_AVAILABILITY_POLICY_VERSION = 2
THIRD_WORLD_ARENA_PROVISIONAL_GATE_VERSION = 2
THIRD_WORLD_OFFLINE_SAMPLE_VERSION = 3
OFFLINE_BATTLE_SAMPLE_VERSION = 4
OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2
GAME_GUIDE_VERSION = 24
GAME_GUIDE_WORLD_AWARE_VERSION = 11
GAME_GUIDE_EXTENSION_REGISTRY_VERSION = 1
GAME_GUIDE_BEHAVIORAL_INTEGRITY_VERSION = 1
GAME_GUIDE_FAST_CATCH_UP_TEXT_VERSION = 1
Arena balanceVersion = 7
Arena rankBalanceVersion = 4
```

版本只做索引；下一個對話仍須重新讀 current `main` owner。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先重新讀 current `main` 的 `PROJECT_HANDOFF.md` 與本次會碰到的正式 owner。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須重新讀 current main、compare base→head，並自我檢查 UI／邏輯／資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。** Markdown-only handoff 更新不需要 cache-bust。
6. **優先修改正式來源。** 不要額外建立 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner、第二套 completion owner。
7. 第一／第二／第三紀元能共用的邏輯優先走 shared owner，不要把第三紀元切成孤立系統。
8. current main 已有 shared extension／registry／policy owner 時，優先擴充它，不要再以 monkey-patch 疊另一層。
9. GM sandbox／benchmark state 不得污染 formal save。
10. `thirdWorld` persistent state 只存正式 root；Stage、能力、5% front、稱號 tier、run deaths、active target、run summary、Fast Catch-up state 等 derived/runtime 不得 persist。
11. W3 正式 Story／Final 已定案並完成；**不可自行重寫、替換或擴增既有 11 篇正式主線。** 仍未定案的 W3 Arena、輪迴／reset、新成長系統等則不得自行補成正式內容。
12. 不修改鏡像戰本體來「另做第三紀元鏡像戰」，除非使用者明示；W3 應沿用 shared Mirror owner。
13. current main 若已完成某規格，承接現況，不重做。
14. 若設計文件與 main 衝突：**main 決定現在已實作的真實狀態；文件只保留尚未施工部分的設計方向。**
15. Integrity／Actions 沒有實際回傳綠燈時，不可宣稱 CI 已綠。
16. 玩家正式用語固定為 **「10 名高維存在」**；開發對話簡稱不得進正式玩家文案。
17. 若 Arena 相關舊對話係數與 current main 衝突，必須重讀 `dungeonarena.js`／`dungeonprogress.js`，不可抄舊係數。
18. W3 Story 完成歷史的唯一權威為 shared `storyProgress.completedStories`；`thirdworldphase.js` 只可依 Boss progress reconciliation `story.unlockedStage`，不得另行決定 Intro／Final completion。

---

# 2. 三紀元世界結構與正式成長權限

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()`：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式成長只允許 current phase：

```text
worldProgressionEnabled(world) === (world === currentWorldPhase())
```

進入高維紀元後：

- W3 是唯一正式主線成長世界；
- W1／W2 保留歷史與回顧能力，不再產正式主線成長；
- 鏡像戰／虛空幻境沿用 shared 系統，不分紀元；
- 懸賞戰在 W3 隱藏／關閉；
- **W3 Arena 仍未定案**，維持「等待高維競技場開放」；
- 不建立 W3 文明災厄；
- 不建立 W3 特殊怪／特殊遭遇正式進度；
- 不新增 W3 專精、印記、文明、強化、強化石、怪物特性等第二套成長系統。

注意：2026-09-28 最新 Arena 調整是**第二紀元宇宙 Arena 高階平衡**，不是 W3 Arena 定案。

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
- 已裝備與背包裝備；
- 五部位 +40；
- 8 專精；
- 10 印記；
- 文明 Lv10；
- 鏡像戰／虛空進度；
- 舊世界歷史／紀錄／稱號。

進入時清理／重整：

- 暗物質歸零；
- 暗能量歸零；
- lost gear 先恢復回背包，再清 transition 狀態；
- black market pending 重置；
- Offline checkpoint／pending settlement 重置；
- 不可跨世界的 transient runtime 清除；
- `secondWorld.entered` 保留 true；
- 正式進入後 `thirdWorld.entryVersion = 2`。

進入彈窗可為了說明轉移而提到舊紀元資源；這是 transition 語意，不等於 W3 正式介面仍應持續解釋舊系統。

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

Shared Story Progress 另有 additive optional marker：

```text
storyProgress.thirdWorldContentVersion = 1
```

不得 persist 的 runtime／derived 狀態包含：

```text
deaths
suppression
run / runId
targetBossIndex
pendingEvents
recentBattles
lastBattleSummary
lastFinishedRun / lastFinishedRuntime
coreLevelAtStart
perDeathSuppressionPointsAtStart
runTotals
vip20Protections
catchingUp / catchUpCompleted
playerFlowContext
stopReason
hpCap
Stage / abilities
5% front derived state
title tier
```

Schema 16 政策：

- `coreProgress` 是 additive optional field，舊 Schema16 缺少時預設 0；
- `storyProgress.thirdWorldContentVersion` 也是 additive optional field，因此仍維持 Schema16，不升 Schema17；
- normalization-only 可維持同 schema；
- semantic reinterpretation／persistent field removal／incompatible structure 才需升 schema；
- Schema 1～15 若夾帶 W3，視為開發期資料並丟棄 W3 state；
- future save fail-closed；
- `world=3` gear 只接受 source schema ≥16；
- Boss persistence 只有 `currentHp`；10 名高維存在順序是 persisted identity，不可任意重排。

Core 舊資料信任邊界：

```text
entryVersion 0 / 1 = development-only unpaid core
entryVersion >= 2   = trusted formal core
```

entryVersion <2：

- `coreLevel = 0`；
- `coreProgress = 0`；
- `dimensionalStrings` 保留；
- reconciliation 到 entryVersion 2。

entryVersion ≥2：

- 正式投入保留；
- `coreProgress >= 1,000,000,000` 可 carry-forward 升級；
- Lv10 overflow 回收到 `dimensionalStrings`；
- 不吃掉合法已投入資源。

## 第 13 批後 W3 Story 舊資料正式邊界

第 13 批施工期間，正式 Story ID 已分批存在，因此舊 Schema16 測試存檔可能帶有與現在相同的 `higher-dimensional-*` pending／completed refs。只用 ID 是否仍存在已無法判斷它是開發期完成紀錄還是目前正式內容完成紀錄。

current main 的處理方式：

```text
THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION = 1
THIRD_WORLD_STORY_CONTENT_VERSION = 1
```

對 `thirdWorld` 已存在、但 `storyProgress.thirdWorldContentVersion` 缺少或低於 1 的舊 Schema16 存檔：

- **只重置 W3 Story history refs**：移除 `completedStories` 中 `higher-dimensional-*` 項目；
- 若 `pendingStory` 指向 W3 Story，清成 null；
- W1／W2 的 `completedStories` 與 pending history 不受影響；
- W3 `bosses[].currentHp`、`coreLevel`、`coreProgress`、`dimensionalStrings`、canonical Stage 與其他正式進度全部保留；
- 寫入 `thirdWorldContentVersion = 1`，只做一次；
- 之後 shared Story queue 會依 Boss progress 推導出的 canonical `story.unlockedStage`，從第一個尚未正式完成的 W3 Story 依序補播；
- 如果讀到 **高於目前版本** 的 future `thirdWorldContentVersion`，fail-closed：不降版、不清 refs。

新存檔與目前正式存檔直接標記 version 1，不會反覆清除合法 W3 Story 完成紀錄。

### Completion owner 收斂

- `storyProgress.completedStories` 是 W3 Story completion history 的唯一權威；
- `storyprogress.js` 的 `reconcileThirdWorldStoryCompletionState()` 由正式 completed history 推導 `story.introSeen`、`story.finalSeen` 與 `thirdWorld.completed`；
- `thirdworldphase.js` 的 `reconcileThirdWorldStoryState()` 現在只做 **Stage-only reconciliation**：由 Boss progress 修正 `story.unlockedStage`；
- `thirdworldphase.js` 不再因 contentReady／Boss gate 直接寫 Intro／Final completion flags，避免雙 owner；
- Final 仍必須 Boss 全滅＋Stage10＋正式 Final Story 完成才可 `thirdWorld.completed=true`。

Arena 舊評估則有獨立 compatibility version；見第 13 節。

---

# 5. 10 名高維存在／Stage／能力／5% 戰線

每名高維存在最大 HP：

```text
1,100,000,000
```

總 HP：

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

正式順序／個體特化：

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

玩家 presentation 已統一顯示 `%` 字樣，例如暴擊 `+6%`、連擊率 `+10%`、第一擊加成 `+20%`；底層仍依 points 欄位正確加算，公式未改。

Stage：

```text
>90%   Stage 0
<=90%  Stage 1
<=80%  Stage 2
...
<=10%  Stage 9
```

每 Stage：

```text
ATK +600
DEF +1200
暴擊 +2 percentage-points
閃避 +2 percentage-points
```

共通能力：

```text
70% 鎮心
60% 壓制
50% 韌性
40% 復仇
30% 反噬
20% 無視
10% 戰意
```

5% 戰線：

```text
55,000,000 HP
```

正式規則：

- 只比較仍存活的高維存在；
- 目標若比最高剩餘 HP 的存活目標少至少 55m HP，下一場不可開始；
- 已擊破目標退出比較；
- 最後一名存活目標免限制；
- challenge authority 是 `thirdWorldChallengeStatus()`；
- battle start resolve 一次；
- 本場若合法開始，途中即使跨過 5% 線仍完整結算，下一場才鎖；
- 玩家文案只顯示 5%，不顯示技術型 `pp`。

---

# 6. 等級／Combat／Settlement

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：封頂，EXP 歸零
```

永久削血：

```text
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

正式規則：

- 每場戰鬥 HP 以上一場正式永久剩餘 HP 為起點；
- 汲取只能在當場回補，不能超過 `formalStartHp`，不能把歷史永久削血補回；
- 玩家死亡戰只要 settlement basis 合法仍可落帳；
- stale settlement 因 stored `currentHp` 與 `formalStartHp` 不一致會拒絕；
- save 失敗走 shared settlement transaction rollback。

Settlement 順序：

```text
validate basis / stale guard
→ aggregateBefore
→ 寫 bosses[].currentHp
→ EXP + 維度之弦 + 升級
→ post-EXP equipment loot
→ aggregate title / story / death / stage / 5% progression
→ shared transaction save
→ rollback on failure
```

`eventSequence` 可包含：

```text
aggregate-progress
boss-defeated
stage-crossed
five-point-front
completion-ready
```

10 名高維存在全部擊破只代表：

```text
completionReady = true
final eligibility = true
```

不等於第三紀元已完成；settlement 不可偷寫 `thirdWorld.completed`。

---

# 7. 100 死連戰／界弦核心／VIP20／Fast Catch-up

```text
最大死亡：100
每死壓制：0.50 percentage-points - coreLv × 0.04 percentage-points
Core Lv0：100 死後最大 HP 約 50%
Core Lv10：100 死後最大 HP 約 90%
```

玩家 UI 顯示 `%`，不顯示每死 `pp` 技術字樣。

Runtime：

- 每輪 `deaths=0`；
- 玩家死亡且目標尚未擊破才 +1 death；
- 成功 combat＋settlement 才 +1 battle；
- run start snapshot `coreLevelAtStart` 與 suppression；
- run active 禁止 Core 注入；
- defeat／Stage crossed／5% front／aggregate progress／death-limit 結束整輪；
- manual stop／pagehide／reload 清 transient；
- recent summaries 最多 20；
- totals 由 run loop transient 累積；
- 每輪有 `runId`，last-finished snapshot 必須 match expected runId；
- exception 強制 `clearRuntime("battle-error")`；
- history 截斷且 totals 不可用時 fail-closed，不偽造收益。

界弦核心：

```text
Lv0～10
每級 1,000,000,000 維度之弦
總投入 10,000,000,000
```

- 全部注入可用量；
- partial progress 永久保存；
- `coreProgress` 可跨級 carry；
- Lv10 停止吸收，多餘 strings 保留；
- 高維連戰 active 時不可注入。

## VIP20 死亡裝備保護

第三紀元仍沿用 shared death-equipment policy：

```text
原死亡裝備遺失判定 = 30%
```

W3 因進入條件必須 VIP20：

- 每次符合死亡條件仍執行原 30% 判定；
- 若本次本來會遺失裝備，VIP20 阻止實際遺失；
- W3 實際結果仍是零裝備遺失；
- `thirdworldrun.js` 只在本輪 runtime 累計 `vip20Protections`；
- 不 persist；
- 連戰結算顯示「VIP20｜裝備保護」與本輪攔下次數；
- 本輪若未抽中原掉裝判定，不偽造保護次數。

## Fast Catch-up 正式語意

W1/W2/W3 共用 continuous/background/Fast Catch-up infrastructure。

**快速追趕只加速等待與演出，不會因補播機制額外加發正式進度或收益；實際戰鬥仍依正式 combat＋settlement 流程落帳。**

W3 background／Fast Catch-up 不產 Offline sample。

---

# 8. W3 裝備／背包處理／Offline

正式 loot：

- 95% 傳說；
- 5% 神話；
- 每場正式可落帳戰鬥至少 1 件；
- 沿用 shared VIP loot；
- item level = post-EXP player level，最高 2000；
- `world=3`；
- W3 不建立販售經濟；
- 強化沿用 +40；
- 50 個正式 W3 裝備名稱已完成；
- name band 依 aggregate remaining HP 決定。

W3 玩家背包語意：

```text
處理
一鍵處理較低裝備
自動處理
不可自動處理
處理結果
```

內部函式／save key 仍保留 `sell`／`autoSell` 名稱以維持 compatibility。

W3 裝備處理：

- 0 金幣；
- 0 暗物質；
- 0 暗能量；
- 在 W3 處理殘留 W1／W2 裝備也不得重新創造退休資源。

這個邊界 bug 已在 shared `secondworldrewards.js` 修正：`phase===3` 時任何裝備處理 quote 都是 zero-resource。

W3 lost gear：

- W3 背包不顯示贖回區；
- 進入 W3 時舊 lost gear 已先恢復再清 transition；
- 正式 W3 必須 VIP20，死亡遺失由 VIP20 阻止，不建立 W3 贖回經濟。

Offline：

- canonical battle sample = V4；
- W3 adapter version = 3；
- 速度池 1 / 1.5 / 2 各保留最近 8 筆；
- W3 sample 不記 boss identity；
- 只有 foreground 正式 complete combat＋settlement 可產 sample；
- background／Fast Catch-up 不產 W3 sample；
- W3 Offline 只給裝備機會；
- 不削永久 HP；
- 不給 EXP；
- 不給維度之弦；
- 不推 Core／Title／Story／Completion；
- 最多 12 小時。

Offline migration contract current main：

```text
OFFLINE_LEGACY_BATTLE_SAMPLE_VERSION = 3
OFFLINE_BATTLE_SAMPLE_VERSION = 4
OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2
```

舊 handoff 所列「第15批還要修 migration version 2 vs 1」已失效。第15批只重新驗證 current contract，不重做不存在的 bug。

---

# 9. 第三紀元玩家 UI／文字語意

W3 正式介面原則：**描述第三紀元現在是什麼，不反覆解釋第一／二紀元哪些系統已退休。**

已完成：

- 主畫面背包：`整理、裝備與處理裝備`；
- 設定：`裝備自動處理、存檔與遊戲設定`；
- W3 災厄只做舊世界回顧語意，不建 W3 災厄；
- 角色頁移除文明等級／最終傷害／+40／專精60／印記10 等完成態雜訊；
- 強化頁：沿用已完成 +40，W3 不再開放強化升級；
- 專精頁：8 項維持 Lv60，W3 不再開放專精升級；
- 搜刮／鑑價在 W3 顯示「高維紀元無額外效果」；
- `specialguide.js` 有 phase3 gate，W3 不注入特殊怪說明。

## 三紀元 Story Record（第 13-8 批完成）

進入 W3 後，戰線紀錄預設顯示：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

高維紀元紀錄：

- 只顯示正式 `completedStories` 中已完成的 W3 Story；
- 順序直接取 `thirdWorldStoryTriggerDescriptors()`，不另建第二套 W3 registry；
- 完整可呈現序章＋Stage 1～9＋Final，共 11 篇；
- W3 只有一組正式 Story 序列，因此不顯示多餘的單一「戰區紀錄」選擇器；
- replay 仍走共用 generic Story lifecycle，不給收益、不改正式進度；
- 同 session 手動切到宇宙／銀河回顧後，普通 render 不會強制跳回高維；reload／重開才回 current-world 預設。

W3 Dungeon：

- bounty hidden；
- arena 顯示 `高維競技場／尚未開放／等待高維競技場開放`；
- 不殘留 Universe Arena 解鎖／獎勵文字；
- Mirror／Void 走 shared owner。

W3 VIP 玩家可見且仍相關特殊特權：

```text
VIP4  虛空幻境 VIP 積分 +10%
VIP8  高維主線弱部位優先機率
VIP12 虛空幻境 VIP 積分總加成 +20%
VIP14 高維主線裝備品質升階機率
VIP16 高維主線 Boss 額外掉落機率
VIP18 高維主線 Boss 品質升階機率
VIP20 死亡裝備保護
```

VIP 等級無上限；VIP20 是最後一個特殊特權階段，之後基礎能力仍持續成長。

---

# 10. Game Guide 三紀元重構與優化 1～3

`gameguide.js` 已依 current phase 提供銀河／宇宙／高維不同說明；W3 不再誤吃 Universe guide。

W3 Guide 已涵蓋：

- 10 名高維存在；
- 永久削血；
- 5% 戰線；
- 高維連戰；
- 回顧戰；
- 高維 Offline；
- Lv2000；
- 高維裝備；
- Stage／共通能力／個體特化；
- 死亡壓制；
- 維度之弦／界弦核心；
- VIP20；
- Mirror／Void；
- Arena 未開放；
- session-only runtime／存檔語意。

W3 Guide 不應出現暗物質、暗能量、強化石、文明災厄、特殊怪、懸賞戰、印記等舊紀元正式成長說明。

## Guide Opt1

`thirdWorldGuideRuleSnapshot(target)` 改讀 canonical owner：

- level cap／EXP；
- enhancement cap；
- entry level／VIP；
- death loss chance；
- W3 loot quality；
- Offline max time；
- boss count／max HP／5% gap／max deaths／max Stage／name-band count。

`offlineprogress.js` 僅新增唯讀 presentation export：

```text
OFFLINE_PROGRESS_MAX_MS
OFFLINE_PROGRESS_MAX_HOURS
OFFLINE_DURATION_POLICY_VERSION = 1
```

Offline 算法未改。

`guidePhase()` 以 `currentWorldPhase()` 為主要 owner；`setGameGuideCategory()` 依當前紀元實際 categories 驗證。

## Guide Opt2

`gameguide.js` 是唯一 Guide assembly owner：

```text
registerGameGuideExtension()
applyGameGuideCategoryExtensions()
gameGuideBeforeLayoutHtml()
gameGuideExtensionIds()
```

- Mirror 不再 mutate `GAME_GUIDE_CATEGORIES`，改註冊 extension；
- Cloud 不再 monkey-patch `window.gameGuidePage`，改註冊 page extension；
- W1/W2/W3 走同一 assembly；
- 三紀元 Mirror／Cloud 說明都只能出現一份。

## Guide Opt3

`tests/runtime/gameguide-extension-integrity.js` 實際執行 phase1／2／3 Guide，驗證：

- categories 正確；
- W3 無 `special` category；
- W3 不含舊紀元禁用成長語意；
- W3 顯示 canonical owner 實際數值；
- 正式用語為「10 名高維存在」；
- Fast Catch-up 文案符合正式 settlement 語意；
- Cloud／Mirror extension 唯一且不 monkey-patch；
- Save Schema 仍 16。

重要版本：

```text
GAME_GUIDE_VERSION = 24
GAME_GUIDE_WORLD_AWARE_VERSION = 11
GAME_GUIDE_WORLD_PHASE_OWNER_VERSION = 2
GAME_GUIDE_THIRD_WORLD_RULE_SNAPSHOT_VERSION = 1
GAME_GUIDE_CURRENT_CATEGORY_VALIDATION_VERSION = 1
GAME_GUIDE_EXTENSION_REGISTRY_VERSION = 1
GAME_GUIDE_CATEGORY_RESOLVER_VERSION = 1
GAME_GUIDE_PAGE_EXTENSION_VERSION = 1
GAME_GUIDE_BEHAVIORAL_INTEGRITY_VERSION = 1
GAME_GUIDE_FAST_CATCH_UP_TEXT_VERSION = 1
```

---

# 11. 三紀元回顧與高維 Story／Completion Framework

Era View：

- W3 冒險回顧：高維紀元／宇宙紀元・回顧／銀河紀元・回顧；
- W3 Story Record：高維紀元／宇宙紀元・回顧／銀河紀元・回顧；
- W2：宇宙紀元／銀河紀元・回顧；
- 同 session 手動切回顧後普通 render 不自動跳回；
- reload／重開才回 current-world 預設；
- Era View 不 persist。

W3 已擊破目標回顧：

- 固定 Stage 9；
- 完整 HP 開場；
- 全共通能力＋個體特化；
- 單場；
- 0 EXP／0 維度之弦／0 裝備；
- 不改永久 HP／Title／Story／Completion／正式 W3 state。

## Story trigger mapping

```text
intro ×1
milestone stage 1～9 ×9   = aggregate 900%～100%
final stage 10 / 0% ×1
總計 11 triggers
```

**0% 是 Final，不存在另一篇 ordinary stage10 milestone。**

目前正式狀態：

- 11 個 descriptors 全部 `contentReady:true`；
- 高維正式 Story data 已完整上線 11/11；
- 三紀元共用 `storyProgress.pendingStory / completedStories`；
- W3 不另建 persistent story queue；
- `story.unlockedStage` 由 aggregate/title-tier owner reconciliation；
- shared pending arbitration 辨識 galaxy／universe／higher-dimensional／unknown；
- foreign pending defer；unknown fail-closed；
- Story lifecycle 使用 storyId＋session identity＋formal/generic owner；
- GM replay／紀錄 replay 不得冒充正式 completion；
- post-flow：`Run Summary → Story → Title Notice`；
- reload recovery／pending recovery／legacy reference cleanup 已完成；
- 舊 Schema16 W3 開發期 Story refs 由 `thirdWorldContentVersion` migration 一次性重建；
- Story Record 使用相同正式 Story catalog 與 completed history，不建立獨立完成狀態。

正式資料檔：

```text
storydata-higher-dimensional.js                    序章 + Stage 1
storydata-higher-dimensional-stage2-3.js          Stage 2 + 3
storydata-higher-dimensional-stage4-5.js          Stage 4 + 5
storydata-higher-dimensional-stage6-7.js          Stage 6 + 7
storydata-higher-dimensional-stage8-9.js          Stage 8 + 9
storydata-higher-dimensional-final.js             Final
```

## Completion 單一 owner

`storyprogress.js` 是 W3 Story completion framework 正式 shared owner，`storyProgress.completedStories` 是正式 completion history authority。

`thirdworldphase.js` 只負責從 Boss progress 重建 `story.unlockedStage`，不得再直接清寫 Intro／Final／`thirdWorld.completed`。

Final gate：

```text
thirdWorld.entered === true
10 名高維存在全部擊破
story.unlockedStage >= 10
Final Story 有正式 content 且由正式流程完成
```

Final 正式完成才由 shared owner 原子寫：

```text
thirdWorld.story.finalSeen = true
thirdWorld.completed = true
```

Intro completion 同樣由 shared completed history 同步：

```text
thirdWorld.story.introSeen = completedStories.has("higher-dimensional-intro")
```

10 名高維存在全部擊破、Stage10、Final eligibility 都不會自行把 `thirdWorld.completed` 寫成 true；必須真正完成 Formal Final Story lifecycle。

---

# 12. Dungeon／VIP current main 現況

`thirdworlddungeonui.js`：

```text
bounty  → hidden / disabled
arena   → visible / disabled / 高維未開放 placeholder
void    → shared mode
mirror  → shared mode
```

W3 Arena current text：

```text
高維競技場
尚未開放
等待高維競技場開放
```

Navigation guard 會阻擋禁用模式；W3 Dungeon status resource 使用維度之弦 presentation。

VIP：

- `VIP_UI_VERSION = 4`；
- `THIRD_WORLD_VIP_PRESENTATION_VERSION = 2`；
- W3 只投影仍相關 perk；
- VIP20 明確說明原 30% 判定仍存在但被完全阻止；
- W3 VIP8／14／16／18 掉裝效果共用 shared VIP Loot owner；
- Void 使用既有 VIP4／12 積分加成。

---

# 13. 最新宇宙紀元 Arena 高階平衡（2026-09-28 current main）

這是 current main 的第二紀元宇宙 Arena 高階平衡，**不是 W3 Arena。**

舊公式下 Lv1000 滿裝角色 500 場正式評估：

```text
Rank 8：489 / 500 = 97.8%
Rank 9：478 / 500 = 95.6%
Rank10：482 / 500 = 96.4%
```

Rank10 解鎖要求前一階至少：

```text
485 / 500 = 97%
```

current main `dungeonarena.js` 的宇宙 Rank 曲線：

```text
x = Rank - 1
HP     = 1.68 + 0.05x - 0.0027x²
Damage = 1.52 + 0.04x - 0.0019x²
DEF    = 1.11 + 0.022x - 0.00085x²
```

高階倍率：

```text
Rank7  HP 1.8828 / Damage 1.6916 / DEF 1.2114
Rank8  HP 1.8977 / Damage 1.7069 / DEF 1.2224
Rank9  HP 1.9072 / Damage 1.7184 / DEF 1.2316
Rank10 HP 1.9113 / Damage 1.7261 / DEF 1.2392
```

相容版本 `dungeonprogress.js`：

```text
balanceVersion = 7
rankBalanceVersion = 4
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485
```

因此舊 500 場評估會因 balance compatibility 失效，需依新公式重評；**97% 正式門檻沒有降低。**

除非使用者重新開啟平衡討論，不要自行再改 `-.0027 / -.0019 / -.00085`。

---

# 14. GM／測試 current main 現況

已存在並應沿用：

```text
gmhub.js
gmhubextensions.js
gmdata.js
gmtools.js
gmbackground.js
gmcombatspeed.js
gmpowerbenchmark.js
gmpowerbenchmarkstate.js
gmpowerbenchmarkworldphase.js
gmstorytest.js
```

目前：

- 正式角色與測試角色分離；
- GM sandbox 不污染 formal save；
- benchmark 有 world-phase adapter，可顯示 W3 character world 與 Lv1000～2000；
- GM background gate 涵蓋 W1/W2/W3 正式連戰；
- GM 2× 只測試，正式 W3 玩家最多 1.5×；
- 正式印記管理：銀河可未取得／Lv0～10；宇宙／高維 formal 固定 10 枚 Lv10；sandbox 可自由測；
- GM Story Test 已支援銀河／宇宙／高維三紀元；
- 高維 GM Story Test 可直接預覽完整 11/11 正式 Story；
- GM Story preview/replay 走 generic lifecycle，不得冒充正式 completion。

`gmpowerbenchmarkworldphase.js` 仍是既有 phase adapter；第15批若觸碰這區，優先收斂到正式 owner，不再疊新 wrapper／第二套 benchmark formula。

尚未完成 W3 GM 內容見第17節。

---

# 15. 重要 bug 修正／風險收斂

1. W3 處理殘留 W2 裝備可能重新產暗物質／暗能量 → 已修成 phase3 全裝備 zero-resource。
2. W3 lost gear 語意 → 贖回 UI 隱藏，死亡裝備保護由 VIP20 提供。
3. VIP20 體感不足 → 共用原 30% death-equipment check，W3 runtime／結算顯示實際攔截次數。
4. W3 Dungeon stale Universe 文案 → Arena placeholder 第三紀元化、bounty 隱藏。
5. W3 Guide 誤吃 Universe guide → 三紀元 phase resolver。
6. Guide 數值漂移 → 主要 W3 數值改讀 canonical snapshot。
7. Guide extension 分裂 → Mirror／Cloud 收斂 shared extension registry。
8. Guide static-regex 脆弱 → 核心改 behavioral regression。
9. Fast Catch-up 誤解 → 說明改為只加速等待／演出，正式 combat／settlement 照常落帳。
10. 正式稱呼 → 玩家統一「10 名高維存在」。
11. Boss 特化 `%` 顯示 → 已完成；舊 handoff「尚未改」失效。
12. Offline migration mismatch → 已完成；舊 handoff「第15批待修」失效。
13. 宇宙 Arena Rank9 卡解鎖風險 → Rank 8～10 曲線已放鬆，版本升 Balance7／RankBalance4，舊評估自動失效重算。
14. 第 13-7 初版 Final 第 20 頁超過 W3 155 字上限 → 已精簡並由 Story Integrity 綠燈驗證。
15. 第 13-8 補上正式高維 Story Record，避免 W3 11/11 正文完成後只能從 GM 或即時流程查看、玩家紀錄頁仍缺高維入口。
16. 第 13 批施工期 Schema16 W3 Story ID 與最終正式 ID 相同，舊測試 completed/pending refs 可能誤被視為正式完成 → 已用 `thirdWorldContentVersion=1` 一次性清理 W3 Story refs，保留 Boss／Core／Stage／W1/W2 history，並由 shared queue 正式補播。
17. W3 completion 曾同時由 `thirdworldphase.js` 與 `storyprogress.js` reconciliation 涉及 → 已收斂；phase 只重建 Stage，Intro／Final／completed 只由 shared Story Progress completion history 推導。
18. 本次自我檢查曾發現 `index.html` 誤動 `calamitystateintegrity.js` cache-bust → 已立即恢復原值；同時保留既有 Runtime Integrity 舊 cache-bust contract marker，實際載入仍使用新的 W3 Story optimization cache-bust。

---

# 16. 尚未定案，不可自行決定

1. 是否銜接低維輪迴／轉生與任何 reset 設計。
2. **W3 Arena** 正式形式、規則與數值曲線；宇宙 Arena 調整不代表 W3 Arena 已定案。
3. 高維專屬背景／動畫／特效額外細節（若未另外定案）。
4. 10 名高維存在大量實測後的最終平衡調整。
5. 任何新的 W3 特殊怪、專精、印記、文明、強化、強化石、怪物特性、文明災厄系統；目前都不是既定 W3 正式成長內容。
6. 已完成的 11 篇高維正式 Story 不得因舊 handoff／舊 Word／舊對話而自行覆寫。

---

# 17. 剩餘正式施工：第14～15批

## 第13批：正式劇情內容＋最終通關流程 —— 已完成

正式完成項目：

- 高維序章 12 頁；
- 900／800／700／600／500／400／300／200／100% 九段進度 Story，各 31 頁；
- 0% Final 31 頁；
- 共 11 篇／322 頁；
- descriptors 11/11 `contentReady:true`；
- GM Story Test 三紀元與高維 11/11 preview；
- shared pending／queue／reload recovery；
- Final eligibility／queue／completion owner；
- `story.finalSeen`＋`thirdWorld.completed` 只由 shared completion owner 在 Formal Final 完成時寫入；
- 高維 Story Record＋宇宙／銀河回顧；
- Story source purity／meta language／format／flow／record behavioral regression；
- 第 13 批後 legacy Story optimization：W3 content version boundary、舊 Schema16 W3 refs 一次性重建、completion owner 收斂、`tests/story/legacy-thirdworld.js` regression。

## 第14批：副本／舊系統整合＋W3 競技場決策

不是再做一套高維副本。

current main 已有：

- bounty hidden；
- W3 Arena provisional disabled；
- Mirror／Void shared；
- W3 resource／navigation policy。

本批實際驗證：

- W3 Mirror 完整可玩；
- W3 Void 完整可玩；
- resource／return／navigation／speed 語意正確；
- Mirror／Void 不改 10 名高維存在永久 HP；
- Mirror／Void 不因身處 W3 額外產 W3 主線 strings／Core／Story／Completion progression；
- 特殊怪／特殊遭遇不能進 W3 正式流程；
- 無 W3 文明災厄入口；
- bounty 維持關閉。

W3 Arena：

- 使用者屆時已定案 → 第14批實作；
- 仍未定案 → 保持「等待高維競技場開放」，不擅自設計。

注意：第13節的新曲線只屬**宇宙紀元 Arena**，不得拿來當 W3 Arena 預設公式。

## 第15批：GM 完整化＋Integrity＋最終封口

完成 W3 GM：

- 高維正式管理；
- 界弦核心正式／測試控制；
- 高維存在 benchmark；
- 10 名高維存在選擇；
- 100%／90%…10% Stage 測試；
- 100 死模擬；
- 永久淨削血／回血／死亡／剩餘 HP／跨 Stage 輸出。

正式 GM 管理只改 formal root，例如：

```text
thirdWorld.entered
thirdWorld.completed
player level
thirdWorld.dimensionalStrings
thirdWorld.coreLevel
thirdWorld.coreProgress
thirdWorld.bosses[].currentHp
```

不得直接 persist：

```text
Stage
abilities
5% front derived state
title tier
story tier
run deaths
active target
run summaries
```

由正式 owner 重算。

最後補齊／重驗：

- W3 UI integrity；
- review integrity；
- story／completion integrity；
- dungeon integration integrity；
- GM integrity；
- Offline contract regression；
- Arena current compatibility（含宇宙 Balance7／RankBalance4）；
- legacy cleanup；
- 全專案 regression；
- Pages／Runtime／Story exact-HEAD closure。

**Offline migration mismatch 已修正；第15批只驗證，不重做。**

---

# 18. 下一批施工前建議必讀 owner

## 第13批（已完成；日後維護 Story 時）

```text
PROJECT_HANDOFF.md
index.html
secondworldstoryregistry.js
storydata-higher-dimensional*.js
storyprogress.js
storymigration.js
storyruntimeintegrity.js
storyui.js
storyrecordtabs.js
gmstorytest.js
thirdworldphase.js
thirdworldmigrationregression.js
thirdworldprogress.js
tests/story/*
```

## 第14批

```text
PROJECT_HANDOFF.md
PROJECT_HANDOFF_UPDATE_2026-09-28_ARENA.md
thirdworlddungeonui.js
dungeonui.js
dungeonprogress.js
dungeonarena.js
dungeonvoid.js
dungeonvoidui.js
mirrordungeonrun.js
mirrordungeonui.js
mirrorcombatcore.js
specialencounter.js
specialcore.js
worldphase.js
combatspeed.js
playersemanticsui.js
```

## 第15批

```text
PROJECT_HANDOFF.md
gmhub.js
gmhubextensions.js
gmdata.js
gmtools.js
gmbackground.js
gmcombatspeed.js
gmpowerbenchmark.js
gmpowerbenchmarkstate.js
gmpowerbenchmarkworldphase.js
gmstorytest.js
thirdworlddata.js
thirdworldcore.js
thirdworldprogress.js
thirdworldrun.js
thirdworldintegritycontract.js
savemigration.js
storymigration.js
storyprogress.js
thirdworldphase.js
thirdworldmigrationregression.js
offlinestatecore.js
offlineworld3adapter.js
runtimeintegrity.js
dungeonarena.js
dungeonprogress.js
```

以上只列最低限度；修改前仍要依 current main 搜尋真正 owner 與 consumer。

---

# 19. 目前正式完成鏈

```text
W3 foundation / entry / save / migration
→ Lv1000～2000
→ 10 名高維存在 / Stage / abilities / 5% front
→ combat / permanent-damage settlement
→ strings / String Core / loot / offline
→ high-dimensional front UI
→ formal 100-death continuous run
→ shared combat presentation / Minimal Mode
→ Stage / ability / 5% / defeat / aggregate events
→ GM background gate / Fast Catch-up
→ run summary / title post-flow
→ run identity / exception cleanup / totals fail-closed
→ three-era review / Era View
→ shared Story Registry / W3 trigger / queue / reload recovery
→ settlement→Story / completion-ready / post-flow
→ Story normalization / pending arbitration / formal lifecycle identity
→ W3 Story content-version legacy migration / canonical replay
→ W3 Story completion owner convergence to shared Story Progress
→ W3 player semantics cleanup
→ W3 inventory processing / zero-resource policy
→ W3 Dungeon / VIP phase-aware presentation
→ VIP20 shared death-loss protection presentation
→ three-era Game Guide
→ canonical Guide rule snapshot
→ shared Guide extension registry
→ Guide behavioral integrity / Fast Catch-up wording closure
→ Universe Arena high-rank balance V7 / RankBalance V4
→ W3 formal Story 11/11 / 322 pages
→ W3 Final queue / formal completion owner
→ W3 three-era Story Record
→ Story Integrity / Runtime Story closure
```

下一個正式開發階段：

```text
第14批：副本／舊系統整合＋W3 競技場決策
第15批：GM 完整化＋Integrity＋最終封口
```

---

# 20. 下一個對話如何接手（標準指令）

若新對話要承接並先檢查第14批，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff 或舊對話記憶。第13批 Story 已完成 13-1～13-8，高維正式內容為 11/11；第13批後已完成 W3 Story content-version 舊資料重建與 completion owner 收斂。現在剩第14～15批。先重新讀 Dungeon／Mirror／Void／Special／Arena 相關正式 owner，確認 W3 現有 bounty hidden、Arena provisional disabled、Mirror／Void shared、Story／Completion 不受副本污染，再和我討論或執行第14批。現在若我說先不要修改，就只能檢查與分析。

若使用者明確要求直接施工第14批，可改成：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，重新檢查 current `main` 的相關正式 owner，直接執行第14批。不要重做第13批，不要自行設計尚未定案的 W3 Arena；修改後重新確認 current main、更新必要 cache-bust，完成 Runtime／相關 Integrity exact-head 自我檢查。
