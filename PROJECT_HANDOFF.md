# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-29（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本檔只做交接、索引與目前規格摘要；若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次 handoff 更新前的 current `main` 功能 HEAD：

```text
5a40207213e7d23f0a8e27bb312afa0ed8863e19
```

該 HEAD 已包含：

- 第 9～12 大批的高維紀元 foundation／entry／save／成長／戰鬥／連戰／回顧／Offline／UI／Guide 等正式系統；
- 第 13-1～13-8 批完整 Story Framework、GM Story Test、322 頁高維正式正文、Final completion、三紀元 Story Record 與 Story Integrity closure；
- 第 13 批後 W3 Story 舊 Schema16 content-version migration 與 completion owner 收斂；
- 宇宙紀元 Arena Rank 8～10 高階平衡 Balance7／RankBalance4；
- 目前高維稱號 **資料、解鎖、renderer、通知、GM 36 稱號 preview 已存在，但第三紀元專屬視覺 CSS 尚未完成**。

本 handoff 更新本身只修改 `PROJECT_HANDOFF.md`，不改任何 JS／CSS／HTML／戰鬥／存檔功能，因此不需要更新 `index.html` cache-bust。

已完成的第 13 批：

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
序章：12 頁
Stage 1～9：9 × 31 頁
Final：31 頁
總計：11 篇／322 頁
```

目前正式開發進度：

- 第 9～13 大批：**正式完成**；
- 第 13 批後 Story legacy optimization：**正式完成**；
- **剩餘正式施工重新排序為第 14、15、16 三批。**

最終三批：

```text
第14批：第三紀元稱號視覺正式完成
第15批：副本／舊系統整合＋競技場決策
第16批：GM 完整化＋Integrity＋全專案最終封口
```

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
11. W3 正式 Story／Final 已定案並完成；**不可自行重寫、替換或擴增既有 11 篇正式主線。**
12. 不修改鏡像戰本體來「另做第三紀元鏡像戰」，除非使用者明示；W3 應沿用 shared Mirror owner。
13. current main 若已完成某規格，承接現況，不重做。
14. 若設計文件與 main 衝突：**main 決定現在已實作的真實狀態；文件只保留尚未施工部分的設計方向。**
15. Integrity／Actions 沒有實際回傳綠燈時，不可宣稱 CI 已綠。
16. 玩家正式用語固定為 **「10 名高維存在」**；開發對話簡稱不得進正式玩家文案。
17. 若 Arena 相關舊對話係數與 current main 衝突，必須重讀 `dungeonarena.js`／`dungeonprogress.js`，不可抄舊係數。
18. W3 Story completion history 唯一權威是 shared `storyProgress.completedStories`；`thirdworldphase.js` 只可依 Boss progress reconciliation `story.unlockedStage`。
19. 第14批只做第三紀元稱號**視覺 presentation**；不得順手改稱號名稱、ID、解鎖條件、10 階門檻或 title save state。
20. W3 Arena、低維輪迴／reset、新 W3 成長系統若使用者未定案，**不得自行補成正式功能**。

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

進入 W3 後：

- W3 是唯一正式主線成長世界；
- W1／W2 保留歷史與回顧，不再產正式主線成長；
- Mirror／Void 沿用 shared 系統，不分紀元；
- bounty 在 W3 hidden／disabled；
- W3 Arena 尚未定案，current main 顯示「等待高維競技場開放」；
- 不建立 W3 文明災厄；
- 不建立 W3 特殊怪／特殊遭遇正式進度；
- 不新增 W3 專精、印記、文明、強化、強化石、怪物特性等第二套成長系統。

---

# 3. 第三紀元進入條件與世界轉移

正式進入條件：

1. Lv1000；
2. 宇宙紀元已進入；
3. 宇宙主線最終 Boss 完成；
4. 宇宙最終 Story 完成；
5. 五部位強化 +40；
6. 文明 Lv10；
7. VIP ≥20；
8. 8 專精全部 Lv60；
9. 10 印記全部 Lv10。

保留：

- level / exp；
- VIP；
- 已裝備與背包裝備；
- +40；
- 8 專精；
- 10 印記；
- 文明 Lv10；
- Mirror／Void 進度；
- 舊世界歷史／紀錄／稱號。

進入時清理／重整：

- 暗物質歸零；
- 暗能量歸零；
- lost gear 先恢復回背包，再清 transition；
- black market pending 重置；
- Offline checkpoint／pending settlement 重置；
- 不可跨世界 transient runtime 清除；
- `secondWorld.entered` 保留 true；
- `thirdWorld.entryVersion = 2`。

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

Shared Story Progress additive optional marker：

```text
storyProgress.thirdWorldContentVersion = 1
```

不得 persist：

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

Schema16 政策：

- `coreProgress` additive optional；缺少預設 0；
- `storyProgress.thirdWorldContentVersion` additive optional；不需要升 Schema17；
- normalization-only 可同 schema；
- semantic reinterpretation／persistent field removal／incompatible structure 才需升 schema；
- Schema1～15 若夾帶 W3，視為開發期資料並丟棄 W3 state；
- future save fail-closed；
- `world=3` gear 只接受 source schema ≥16；
- Boss persistence 只有 `currentHp`；10 名高維存在順序是 persisted identity，不可任意重排。

Core 信任邊界：

```text
entryVersion 0 / 1 = development-only unpaid core
entryVersion >= 2   = trusted formal core
```

entryVersion <2：Core Lv／progress 歸零、維度之弦保留，reconcile 到 entryVersion2。

entryVersion ≥2：正式投入保留；progress 可 carry-forward；Lv10 overflow 回收至維度之弦。

## 第13批後 W3 Story 舊資料正式邊界

```text
THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION = 1
THIRD_WORLD_STORY_CONTENT_VERSION = 1
```

對已存在 `thirdWorld`、但 `storyProgress.thirdWorldContentVersion` 缺少或低於 1 的舊 Schema16：

- 只重置 W3 Story history refs；
- 移除 `completedStories` 中 `higher-dimensional-*`；
- W3 `pendingStory` 清空；
- W1／W2 Story history 保留；
- W3 Boss HP、Core、Stage、strings 等正式進度保留；
- 寫入 content version 1，只做一次；
- shared Story queue 依 canonical Stage 從第一個尚未正式完成的 W3 Story 順序補播；
- future content version fail-closed，不降版、不清 refs。

Completion owner：

- `storyProgress.completedStories` 是 W3 Story completion 唯一權威；
- `storyprogress.js` 推導 `story.introSeen`、`story.finalSeen`、`thirdWorld.completed`；
- `thirdworldphase.js` 只做 Stage-only reconciliation；
- Final 必須 Boss 全滅＋Stage10＋Formal Final Story 完成才可 `thirdWorld.completed=true`。

---

# 5. 10 名高維存在／Stage／能力／5% 戰線

每名最大 HP：

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

10 名高維存在順序／特化：

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

玩家 presentation 已顯示 `%`，底層仍以 points 正確加算。

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

正式規則：只比較存活目標；落後最高存活 HP 至少 55m 的目標下一場鎖定；已擊破者退出比較；最後一名存活免限制；本場合法開始後可完整結算，下一場再重新判定。

---

# 6. Lv／Combat／Settlement

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

規則：

- 每場以前次正式永久剩餘 HP 為起點；
- 汲取只可回補當場，不能超過 `formalStartHp`；
- 死亡戰若 settlement basis 合法仍可落帳；
- stale settlement 拒絕；
- shared settlement transaction save fail 會 rollback。

Settlement：

```text
validate/stale guard
→ aggregateBefore
→ bosses[].currentHp
→ EXP + strings + level-up
→ post-EXP equipment loot
→ title/story/death/stage/5% progression
→ shared transaction save
→ rollback on failure
```

Boss 全滅只代表 completion-ready／Final eligible，不代表 W3 completed。

---

# 7. 100死連戰／界弦核心／VIP20／Fast Catch-up

```text
最大死亡：100
每死壓制：0.50 percentage-points - coreLv × 0.04 percentage-points
Core Lv0：100死後最大 HP 約50%
Core Lv10：100死後最大 HP 約90%
```

連戰 runtime：

- 每輪 deaths=0；
- 玩家死亡且目標未擊破才 +1；
- successful combat＋settlement 才 +1 battle；
- run start snapshot coreLv／suppression；
- run active 禁止 Core 注入；
- defeat／Stage crossed／5% front／aggregate progress／death-limit 結束整輪；
- manual stop／pagehide／reload 清 transient；
- recent summaries 最多20；
- `runId` identity；
- exception 強制 runtime cleanup；
- history 截斷且 totals 不可信時 fail-closed。

界弦核心：

```text
Lv0～10
每級 1,000,000,000 維度之弦
總投入 10,000,000,000
```

VIP20 death gear protection：仍跑 shared 原30%遺失判定；若原本會掉裝，VIP20 阻止實際遺失；W3 實際為零掉裝；本輪只統計真正攔下的次數。

Fast Catch-up：只加速等待／演出，不額外加發收益；正式進度仍走 combat＋settlement；W3 background／catch-up 不產 Offline sample。

---

# 8. W3 裝備／背包／Offline

Loot：

- 95% 傳說；5% 神話；
- 每場正式可落帳戰鬥至少1件；
- shared VIP loot；
- item level = post-EXP level，最高2000；
- `world=3`；
- 不建立販售經濟；
- 強化沿用+40；
- 50個正式 W3 裝備名已完成；
- name band 依 aggregate remaining HP。

W3 背包玩家語意：處理／一鍵處理較低裝備／自動處理；內部保留 sell／autoSell 名稱做 compatibility。

W3 phase3 任意裝備處理：0金幣／0暗物質／0暗能量；殘留 W1/W2 裝備也不能創造退休資源。

Lost gear：W3 不顯示贖回；進入 W3 時舊 lost gear 已回背包；W3 由 VIP20 阻止掉裝，不建立 W3 贖回經濟。

Offline：

```text
OFFLINE_LEGACY_BATTLE_SAMPLE_VERSION = 3
OFFLINE_BATTLE_SAMPLE_VERSION = 4
OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2
THIRD_WORLD_OFFLINE_SAMPLE_VERSION = 3
```

- 速度池 1／1.5／2 各留最近8筆；
- W3 sample 不記 boss identity；
- 只有 foreground 正式 complete combat＋settlement 可產 sample；
- background／Fast Catch-up 不產；
- W3 Offline 只給裝備機會；
- 不削永久 HP、不給 EXP、不給 strings、不推 Core／Title／Story／Completion；
- 最多12小時。

先前 handoff 所寫「Offline migration version contract mismatch 待修」已失效；目前 contract 已是 V3/V4/MigrationV2，第16批只需重新驗證，不要重做不存在的 bug。

---

# 9. W3 UI／回顧／Story Record／Guide

玩家 UI 原則：描述 W3 現在是什麼，不反覆解釋 W1/W2 退休系統。

已完成：

- 背包：整理、裝備與處理裝備；
- 設定：裝備自動處理、存檔與遊戲設定；
- W3 災厄只做舊世界回顧，不建 W3 災厄；
- 角色頁移除文明等級／+40／專精60／印記10等完成態雜訊；
- W3 強化／專精不再開放新成長；
- 搜刮／鑑價顯示高維無額外效果；
- special guide phase3 gate，不注入特殊怪說明。

Era View：

```text
W3：高維紀元／宇宙紀元・回顧／銀河紀元・回顧
W2：宇宙紀元／銀河紀元・回顧
```

同 session 手動切回顧後普通 render 不自動跳回；reload 才回 current-world 預設；Era View 不 persist。

W3 已擊破目標回顧：固定 Stage9、完整 HP、全部共通能力＋個體特化、單場、0收益、不改正式 W3 state。

Story Record：

- W3 預設高維；
- 只顯示 `completedStories` 已完成 W3 Story；
- 順序直接用 `thirdWorldStoryTriggerDescriptors()`；
- 序章＋Stage1～9＋Final 共11篇；
- W3 不顯示多餘戰區 selector；
- replay generic lifecycle，不給收益、不改正式進度。

Game Guide W3 已涵蓋：10 名高維存在、永久削血、5%戰線、連戰、回顧、Offline、Lv2000、W3裝備、Stage／能力／特化、死亡壓制、strings／Core、VIP20、Mirror／Void、Arena未開放、runtime／save語意。

Guide 已收斂 shared extension registry；Mirror／Cloud 不再 monkey-patch；主要 W3 數值由 canonical snapshot 讀取；behavioral integrity 驗證三紀元。

---

# 10. W3 Story／Final Completion Framework

Trigger：

```text
intro ×1
milestone Stage1～9 ×9 = aggregate 900%～100%
Final Stage10 / 0% ×1
總計11
```

0% 是 Final，不存在 ordinary Stage10 milestone。

正式狀態：

- 11 descriptors 全部 `contentReady:true`；
- 11/11 Story data 完整上線；
- shared `pendingStory / completedStories`；
- 不另建 W3 persistent queue；
- `story.unlockedStage` 由 aggregate/title-tier owner reconciliation；
- pending arbitration 支援 galaxy／universe／higher-dimensional／unknown；
- foreign pending defer、unknown fail-closed；
- formal lifecycle 有 storyId＋session identity＋owner；
- GM／record replay generic lifecycle，不冒充正式 completion；
- post-flow：Run Summary → Story → Title Notice；
- reload recovery／legacy reference cleanup 已完成。

正式 Story data：

```text
storydata-higher-dimensional.js
storydata-higher-dimensional-stage2-3.js
storydata-higher-dimensional-stage4-5.js
storydata-higher-dimensional-stage6-7.js
storydata-higher-dimensional-stage8-9.js
storydata-higher-dimensional-final.js
```

Final gate：

```text
thirdWorld.entered === true
10 名高維存在全部擊破
story.unlockedStage >= 10
Formal Final Story 完成
```

Formal Final 完成後 shared owner 才寫：

```text
story.finalSeen = true
thirdWorld.completed = true
```

---

# 11. 玩家稱號 current main 現況與第14批缺件

正式稱號 catalog 已存在 36 個：

```text
銀河文明災厄 10
宇宙文明災厄 10
鏡像戰 6
高維紀元 10
合計 36
```

目前 W3 稱號邏輯已完成：

- `playertitlecore.js` 已從 `THIRD_WORLD_TITLE_DEFINITIONS` 建立高維10階 definitions；
- series = `higher-dimensional`；
- 依 `thirdWorldTitleTier()` 靜默 backfill；
- 0→多階可一次補齊、只通知最高新階；
- title state／ID／equipped／pendingNotice 沿用 shared player title state；
- GM preview 已可預覽全部36正式稱號；
- `playertitleintegrity.js` 已驗高維 catalog、backfill、notice、renderer、GM preview。

目前 renderer：

```text
player-title--higher-dimensional
player-title--higher-dimensional-1 ... -10
同時仍附加 player-title--tier-1 ... -10
```

**目前缺件：高維專屬 visual CSS owner 尚未建立。**

current `index.html` 目前只載入：

```text
playertitles.css          第一紀元／通用 tier 視覺
playertitlesera.css       第二紀元宇宙稱號專屬視覺
playertitlesmirror.css    鏡像稱號專屬視覺
```

沒有 `playertitleshigherdimensional.css` 或等價 owner，所以 W3 稱號現在實際會落回 `player-title--tier-*` 的第一紀元視覺。這是 presentation 缺失，不是 title logic／save 缺失。

因此：

- 第14批**不需要 Save Schema migration**；
- 不改稱號名稱／ID／解鎖／10階門檻／存檔；
- 要建立 W3 專屬視覺 owner，並讓高維 class 覆蓋通用 tier appearance；
- 需保留既有 shared renderer 與 title state，不另造第二套稱號系統。

---

# 12. Dungeon current main 現況

`thirdworlddungeonui.js` current policy：

```text
bounty → hidden + disabled
arena  → visible + disabled + 高維 placeholder
Mirror → shared
Void   → shared
```

W3 Arena current text：

```text
高維競技場
尚未開放
等待高維競技場開放
```

Navigation guard 會阻擋禁用模式；W3 Dungeon status resource 顯示維度之弦。

第15批不是重做副本，而是做 W3 下 shared Mirror／Void 的完整實戰驗證與跨系統收斂。

---

# 13. VIP current main

W3 玩家可見且仍相關：

```text
VIP4  Void VIP積分 +10%
VIP8  W3主線弱部位優先機率
VIP12 Void VIP積分總加成 +20%
VIP14 W3主線裝備品質升階機率
VIP16 W3主線 Boss 額外掉落機率
VIP18 W3主線 Boss 品質升階機率
VIP20 死亡裝備保護
```

VIP 無上限；VIP20 是最後特殊 perk，之後基礎能力仍成長。

---

# 14. 宇宙紀元 Arena 高階平衡（不是 W3 Arena）

current main 宇宙 Rank 曲線：

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

Compatibility：

```text
balanceVersion = 7
rankBalanceVersion = 4
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485  // 97%
```

舊500場評估因版本不相容會失效重算；97%門檻沒降。

**不得把這套宇宙曲線直接當 W3 Arena 預設。**

---

# 15. GM／測試 current main

既有 owner：

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

- formal／sandbox 分離；
- GM sandbox 不污染 formal save；
- benchmark 有 world-phase adapter，可顯示 W3 與 Lv1000～2000；
- GM background gate 涵蓋三紀元正式連戰；
- GM 2× 只測試，正式 W3 玩家最多1.5×；
- formal 印記管理：W1可未取得／Lv0～10，W2/W3固定10枚Lv10；sandbox可自由測；
- GM Story Test 三紀元；W3 11/11 preview；
- Story preview generic lifecycle，不冒充 formal completion；
- GM player title preview 已支援36個正式稱號，包含高維10階。

尚缺 W3 GM 正式管理／Core控制／高維 benchmark 深化等，留到第16批。

---

# 16. 重要 bug 修正／風險收斂

已完成：

1. W3 處理殘留 W2 裝備可能重新產暗物質／暗能量 → phase3 全裝備 zero-resource。
2. W3 lost gear → 贖回 UI hidden，VIP20 shared death-loss protection。
3. VIP20 體感 → runtime／summary 顯示真正攔截次數。
4. Dungeon stale Universe 文案 → W3 Arena placeholder、bounty hidden。
5. W3 Guide 誤吃 Universe guide → phase resolver。
6. Guide 數值漂移 → canonical rule snapshot。
7. Guide extension 分裂 → Mirror／Cloud shared registry。
8. Guide regex 脆弱 → behavioral regression。
9. Fast Catch-up 文案 → 明確只加速等待／演出，正式 combat／settlement 照常。
10. 玩家正式稱呼 →「10 名高維存在」。
11. Boss 特化 `%` presentation 已完成。
12. Offline migration mismatch 已完成；舊「待修」紀錄失效。
13. 宇宙 Arena Rank9 卡解鎖風險 → Balance7／RankBalance4。
14. Final 第20頁曾超155字 → 已精簡並通過 Story Integrity。
15. W3 Story Record 補齊，正式玩家可重播高維11篇。
16. Schema16 W3 Story 開發期 refs 可能冒充正式完成 → `thirdWorldContentVersion=1` 一次性重建。
17. W3 completion 雙 owner → phase只重建Stage，completion統一 shared Story Progress。
18. 第13批 legacy optimization 自檢曾誤動 unrelated cache marker → 已恢復；current main 保持正確 cache contract。

目前已知尚未完成的玩家可見缺件：

19. **W3 10階稱號缺少第三紀元專屬 CSS visual owner，目前沿用第一紀元 `player-title--tier-*` appearance。** 這是新第14批優先工作。

---

# 17. 尚未定案，不可自行決定

1. 低維輪迴／轉生／reset 設計。
2. **W3 Arena** 正式形式、規則與數值曲線。
3. 額外 W3 背景／動畫／特效若未另行定案。
4. 10 名高維存在大量正式實測後最終平衡。
5. 新 W3 特殊怪、專精、印記、文明、強化、強化石、怪物特性、文明災厄。
6. 已完成的11篇／322頁 W3 Story 不得自行覆寫。

---

# 18. 剩餘正式施工：第14～16批

## 第14批｜第三紀元稱號視覺正式完成

### 不改的東西

- 稱號名稱；
- ID；
- 10階解鎖條件／門檻；
- `titles` save state；
- backfill／notice／equip 邏輯；
- GM 36稱號 catalog；
- shared player title renderer 架構。

### 要做

優先建立獨立高維 visual owner，建議：

```text
playertitleshigherdimensional.css
```

不要把高維樣式硬塞回第一紀元 `playertitles.css`。

視覺語言：

```text
高維、維度錯位、空間折射、幾何異象、因果殘影
```

階級方向：

```text
1～3：較淡的空間錯位／細微殘影
4～6：維度裂面／雙重文字相位／局部幾何異象
7～9：明顯高維場，文字與周圍空間像不在同一平面
10：真正最高階；做在文字與開放式異象，不回封閉方框底板
```

必驗：

- 1～10階差異；
- 與銀河／宇宙／鏡像明顯不同；
- mobile；
- `prefers-reduced-motion`；
- 稱號選擇器；
- 稱號取得通知；
- 主畫面身份名稱；
- 戰鬥身份名稱；
- GM 36稱號 preview；
- renderer class contract；
- 高維 visual integrity；
- `index.html` 正確載入＋cache-bust。

**不需要 Save Schema migration。**

## 第15批｜副本／舊系統整合＋競技場決策

不是再做一套 W3 副本。

current main 已有：bounty hidden、W3 Arena provisional disabled、Mirror／Void shared、W3 resource／navigation policy。

本批驗證：

- W3 Mirror 完整可玩；
- W3 Void 完整可玩；
- resource／return／navigation／speed 語意正確；
- Mirror／Void 不改 W3 永久 Boss HP；
- Mirror／Void 不額外產 W3 主線 strings／Core／Story／Completion progression；
- 特殊怪／特殊遭遇不能進 W3 formal flow；
- 無 W3 文明災厄入口；
- bounty 維持關閉；
- 第14批高維稱號在 Mirror／Void 實戰身份顯示一起做跨系統驗收。

W3 Arena：

- 使用者屆時已定案 → 本批實作；
- 仍未定案 → 保持「等待高維競技場開放」，不得自行設計。

宇宙 Arena Balance7／RankBalance4 只屬 W2，不得直接複製成 W3 Arena。

## 第16批｜GM 完整化＋Integrity＋全專案最終封口

完成 W3 GM：

- 高維正式管理；
- 界弦核心 formal／sandbox 控制；
- 10 名高維存在 benchmark；
- target selection；
- 100%／90…10% Stage 測試；
- 100死模擬；
- 永久淨削血／回血／死亡／剩餘HP／跨Stage輸出。

Formal GM 只改正式 root，例如：

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

以上由 canonical owner 重算。

最終補齊／重驗：

- W3 UI integrity；
- review integrity；
- story／completion integrity；
- dungeon integration integrity；
- GM integrity；
- **高維稱號 visual integrity 納入全專案 final closure**；
- Offline migration contract current V3/V4/MigrationV2 regression；
- Arena compatibility；
- legacy cleanup；
- 全專案 regression；
- Story／Runtime／Pages exact-HEAD closure。

**Offline migration mismatch 已經修正，第16批只驗證 current contract，不重做。**

---

# 19. 下一批施工前必讀 owner

## 第14批：高維稱號視覺

```text
PROJECT_HANDOFF.md
index.html
playertitlecore.js
playertitlerenderer.js
playertitleui.js
playertitles.css
playertitlesera.css
playertitlesmirror.css
playertitleintegrity.js
playertitlegmpreview.js
playertitlegmpreviewintegrity.js
thirdworlddata.js
```

施工前先確認是否已有新增的高維 CSS owner；若沒有再建立 `playertitleshigherdimensional.css`。

## 第15批：Dungeon／舊系統／Arena

```text
PROJECT_HANDOFF.md
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
playertitlerenderer.js
高維稱號 visual owner（第14批完成後）
```

## 第16批：GM／Integrity／最終封口

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
playertitleintegrity.js
高維稱號 visual owner
```

以上是最低限度；每次修改前仍要搜尋 current main 的真正 owner／consumer。

---

# 20. 目前正式完成鏈

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
→ Universe Arena high-rank Balance7 / RankBalance4
→ W3 formal Story 11/11 / 322 pages
→ W3 Final queue / formal completion owner
→ W3 three-era Story Record
→ Story Integrity / Runtime Story closure
```

目前剩餘鏈：

```text
第14批 高維稱號專屬視覺
→ 第15批 W3 Dungeon／舊系統整合＋Arena決策
→ 第16批 GM完整化＋Integrity＋全專案封口
```

---

# 21. 下一個對話如何接手（標準指令）

若新對話先承接、暫不修改，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff 或舊對話記憶。第13批 Story 已完成 13-1～13-8，高維正式 Story 為 11/11、322 頁；第13批後 W3 Story content-version 舊資料 migration 與 completion owner 收斂也已完成。現在正式剩第14～16批：第14批高維稱號視覺、第15批副本／舊系統整合＋競技場決策、第16批 GM＋Integrity＋全專案封口。先重新讀相關正式 owner，現在先不要修改。

若使用者明確要求施工第14批，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，重新檢查 current `main` 的 title core／renderer／UI／CSS／GM preview／Integrity 與 `index.html`，直接執行第14批「第三紀元稱號視覺正式完成」。不改稱號名稱、ID、解鎖條件、10階門檻與存檔；建立高維專屬 visual owner，完成1～10階差異、mobile、reduced-motion、選擇器、通知、主畫面、戰鬥、GM36稱號 preview 與 visual integrity。JS／CSS 改動更新 `index.html` cache-bust。修改後重讀 current main、compare base→head、自我檢查並確認相關 Actions。

若使用者直接要求第15或16批，仍必須先確認前一批已完成且 current main 已包含其結果，不得跳過依賴或重做已完成系統。
