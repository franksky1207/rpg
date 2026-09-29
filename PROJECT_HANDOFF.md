# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-29（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本檔只做交接、索引與目前規格摘要；若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次 handoff 更新前的 current `main` 功能 HEAD：

```text
23200a08c8f4524719a3590d9f16c6993d3860cd
```

該 HEAD 已包含：

- 第 9～13 大批：高維紀元 foundation／entry／save／成長／戰鬥／連戰／回顧／Offline／UI／Guide／Story Framework／Final Completion；
- 高維正式 Story 11/11、共 322 頁；
- 第 13 批後 W3 Story content-version migration 與 completion owner 收斂；
- 第 14 批：高維10階稱號專屬視覺 owner 完成，Mirror 15～20 六階視覺差異同步收斂；
- 第 15 批：W3 舊系統／副本整合、Mirror／Void 正式接入、W3 特殊遭遇 fail-closed、W3 高維競技場正式完成；
- 第 15 批後 5 批優化：Arena 中斷安全、正式 Core owner 收斂、GM 500輪測試正式共用 Core、CSS owner 拆分、Integrity／legacy executable owner 清理；
- current exact-head `Runtime Integrity`、`Story Integrity`、`Pages build and deployment` 在功能 HEAD `23200a08...` 均已通過。

本 handoff 更新本身只修改 `PROJECT_HANDOFF.md`，**不修改任何 JS／CSS／HTML／戰鬥／存檔功能**，因此本次不需要改 `index.html` cache-bust。

目前正式開發進度：

```text
第 9～13 批：完成
第14批：完成
第15批：完成
第15批後優化 1～5：完成
第16批：尚未正式施工，主要是 GM 正式管理規則鎖定＋全專案 final closure
```

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先重新讀 current `main` 的 `PROJECT_HANDOFF.md` 與本次會碰到的正式 owner。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須重新讀 current main、compare base→head，並自我檢查 UI／邏輯／資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。** Markdown-only handoff 更新不需要 cache-bust。
6. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner、第二套 completion owner。**
7. 第一／第二／第三紀元能共用的邏輯優先走 shared owner，不要把第三紀元切成孤立系統。
8. current main 已有 shared extension／registry／policy owner 時，優先擴充它，不要再以 monkey-patch 疊另一層。
9. GM sandbox／benchmark state 不得污染 formal save。
10. `thirdWorld` persistent state 只存正式 root；Stage、能力、5% front、稱號 tier、run deaths、active target、run summary、Fast Catch-up state 等 derived/runtime 不得 persist。
11. W3 正式 Story／Final 已定案並完成；**不可自行重寫、替換或擴增既有 11 篇正式主線。**
12. Mirror／Void 在 W3 沿用 shared owner，不另做第三紀元平行副本。
13. current main 若已完成某規格，承接現況，不重做。
14. 若設計文件與 main 衝突：**main 決定現在已實作的真實狀態；文件只保留尚未施工部分的設計方向。**
15. Integrity／Actions 沒有實際回傳綠燈時，不可宣稱 CI 已綠。
16. 玩家正式用語固定為 **「10 名高維存在」**；開發對話簡稱不得進正式玩家文案。
17. Arena 相關規格與係數一律以 current `thirdworldarena.js`／`dungeonarena.js`／`dungeonprogress.js` 為準，不可抄舊對話數字。
18. W3 Story completion history 唯一權威是 shared `storyProgress.completedStories`；`thirdworldphase.js` 只可依 Boss progress reconciliation `story.unlockedStage`。
19. 第14批高維稱號視覺已完成；不得再把高維稱號掛回第一紀元 `player-title--tier-*` 視覺。
20. W3 Arena 已正式上線；不得再把它改回 placeholder／disabled，除非使用者明示。
21. 第16批 GM「正式管理」與 GM「測試沙盒」必須分開處理；正式管理要遵守世界階段合法範圍，測試沙盒不應被誤鎖。
22. 改動前先找真正 owner／consumer；能改 owner 就不要在 UI 後處理硬蓋。

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
- Mirror／Void 為 shared 系統，W3 正式可玩；
- bounty 在 W3 hidden／disabled；
- W3 Arena 已正式可玩；
- W3 不建立新的文明災厄，只保留 W1／W2 歷史災厄回顧入口；
- W3 特殊怪／特殊遭遇正式 flow fail-closed；
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

W3 Story 舊 Schema16 content migration：

```text
THIRD_WORLD_STORY_CONTENT_MIGRATION_VERSION = 1
THIRD_WORLD_STORY_CONTENT_VERSION = 1
```

規則：

- 只重置 W3 Story history refs；
- 移除 `completedStories` 中 `higher-dimensional-*`；
- W3 `pendingStory` 清空；
- W1／W2 Story history 保留；
- W3 Boss HP、Core、strings 等正式進度保留；
- shared queue 依 canonical Stage 從第一個尚未正式完成的 W3 Story 順序補播；
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

---

# 9. W3 Story／Final Completion Framework

正式 Story：

```text
序章：12 頁
Stage 1～9：9 × 31 頁
Final：31 頁
總計：11 篇／322 頁
```

Trigger：

```text
intro ×1
milestone Stage1～9 ×9
Final Stage10 / 0% ×1
總計11
```

0% 是 Final，不存在 ordinary Stage10 milestone。

正式狀態：

- 11 descriptors 全部 `contentReady:true`；
- 11/11 Story data 完整上線；
- shared `pendingStory / completedStories`；
- 不另建 W3 persistent queue；
- pending arbitration 支援 galaxy／universe／higher-dimensional／unknown；
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

Story Record：W3 預設高維；只顯示 completed W3 Story；序章＋Stage1～9＋Final 共11篇；replay 不給收益、不改正式進度。

---

# 10. 玩家稱號 current main：第14批已正式完成

正式稱號 catalog 共36個：

```text
銀河文明災厄 10
宇宙文明災厄 10
鏡像戰 6
高維紀元 10
合計 36
```

高維10階名稱：

```text
1 破界初臨
2 維外行者
3 超界之軀
4 高維真形
5 萬維共鳴
6 界律共主
7 維序凌駕
8 超維至尊
9 諸維唯一
10 萬維之上
```

目前正式 renderer：

```text
player-title--higher-dimensional
player-title--higher-dimensional-1 ... -10
```

**高維稱號不再掛 `player-title--tier-*` 第一紀元視覺 class。**

正式 visual owner：

```text
playertitleshigherdimensional.css
```

視覺規則：

- 高維10稱號為「同級不同理念」，不是 1→10 強弱階梯；
- 1／6／10 為實機視覺錨點，其餘7階已完成各自異象差異；
- 本體文字＋相位文字＋開放式高維異象；禁止回到封閉方框／底板；
- 600px／360px mobile protection 已完成；
- `prefers-reduced-motion` 已完成；
- 選擇器、取得通知、主畫面、戰鬥、Mirror／Void／Arena 身份名稱、GM 36稱號 preview 全部走 shared renderer。

Mirror 15～20：

- stable class ABI 維持 `player-title--mirror-v3`；
- presentation version 與 class ABI 分離；
- 15～20 六階字色、光感、殘影、aura 已重新拉開；
- 鏡像視覺仍維持高於高維稱號的異象層級；
- narrow-mobile protection 已納入 Integrity。

`playertitleintegrity.js` current 正式版本為 V17；legacy executable V13 shim 已退休，只允許 test-only inert marker，不得復活為 runtime owner。

---

# 11. W3 Dungeon／Mirror／Void／速度／特殊遭遇：第15批整合完成

`thirdworlddungeonui.js` current 正式版本：

```text
THIRD_WORLD_DUNGEON_UI_VERSION = 6
DUNGEON_MODE_AVAILABILITY_POLICY_VERSION = 5
DUNGEON_MODE_PRESENTATION_POLICY_VERSION = 4
```

W3 Dungeon policy：

```text
bounty  → hidden + disabled
arena   → visible + enabled，進入高維競技場
mirror  → visible + enabled，shared Mirror
tower   → visible + enabled，shared Void
災厄    → 不建立 W3 災厄；保留 W1/W2 歷史回顧入口
```

W3 副本首頁：

- 顯示高維競技場、鏡像戰、虛空幻境；
- status resource 顯示「維度之弦」；
- bounty 使用 `hidden + display:none!important`，避免舊 flex CSS 把隱藏卡片撐回來；
- navigation guard 對 disabled／hidden 模式 fail-closed；
- 回副本／回主頁文案已依 W3 收斂；
- 舊 executable W3 Dungeon presentation contract 已退休，只保留 inert test token，不再建立第二套 runtime owner。

## Mirror

- shared Mirror 正式支援 world 1／2／3；
- W3 snapshot 會保存 `world=3`、文明等級與文明最終傷害倍率；
- 玩家正式專精／印記／裝備／強化／VIP 能力照 shared Mirror 規則進入；
- Mirror 不改 W3 10 名高維存在永久 HP；
- 不發 W3 主線 EXP／維度之弦／Core／Story／Completion；
- 高維稱號可在 Mirror 戰鬥身份名稱正常顯示。

## Void

Void 正式線性公式維持：

```text
HP  = ceil(100.0 + 9.6 × floor)
ATK = ceil(10.0 + 1.3 × floor)
DEF = ceil(5.0 + 0.6 × floor)
暴擊基準 10
閃避基準 8
```

W3 Void：

- shared Void 正式支援 world3；
- 玩家文明等級最終傷害倍率照 current world 套用；
- 不改 W3 永久 Boss HP；
- 不推 W3 strings／Core／Story／Completion；
- 沿用原 Void 歷史最高層與 daily reward；
- 高維稱號可在 Void 戰鬥身份名稱正常顯示。

## 戰鬥速度

current player speed policy：

```text
W1：1×
W2：1× / 1.5×
W3：1× / 1.5×
```

玩家不可選2×；GM override 仍可 1×／1.5×／2×，並依登入使用者隔離保存。

## 特殊怪／特殊遭遇

W3 正式 fail-closed：

- `specialEncounterAllowed()` 在 world3 回 false；
- black market pending 在 W3 不可建立／不可消耗為有效特殊遭遇；
- `grantSpecialReward()` world3 直接 blocked／0 reward；
- `fightFormalSpecial()` world3 直接 blocked；
- 不建立 W3 特殊怪進度，不讓 W1／W2 special flow 漏進 W3。

---

# 12. W3 高維競技場：正式完成

正式 owner：

```text
thirdworldarena.js          Core／規則／交易／中斷恢復／獎勵
thirdworldarenaui.js        玩家 UI／連打流程／structured combat presentation
thirdworldarena.css         W3 Arena 獨立樣式 owner
thirdworldarenagm.js        GM 500輪基準測試
thirdworlddungeonui.js      W3 Dungeon 入口 policy
thirdworlddungeonintegrity.js  W3 Dungeon/Arena整合 Integrity
```

## 12.1 兩種正式模式

```text
定相競技場：一輪三戰皆為同一名隨機高維存在投影
異相競技場：一輪三戰為三名不同高維存在投影，保證不重複
```

敵人正式名稱：

```text
高維投影·破界天裁
高維投影·永劫重垣
...
高維投影·高維原點
```

Arena 使用十名存在既有固定 specialization，不套 W3 主線 70%～10% 共通能力，也不建立隨機怪物 traits。

十名存在在 Arena 的個別特化：

```text
破界天裁：ATK ×1.15
永劫重垣：DEF ×1.15
宿因天秤：自身暴擊 +6pt
無相彼岸：自身閃避 +6pt
萬象迴演：連擊 +10pt
維隙之刃：穿透 +10pt
逆因輪轉：反擊 +10pt
噬界深淵：汲取 +10pt
先驗之瞳：先制 +20pt
高維原點：ATK ×1.08、DEF ×1.08
```

## 12.2 敵人能力基準

Arena 敵人由正式玩家快照相對生成，基底走 shared：

```text
specialBaseEnemyFromPlayer(player)
```

三戰 physical multiplier：

```text
第一戰：HP 0.99 / Damage 0.9405 / DEF 1.287
第二戰：HP 1.1385 / Damage 1.056 / DEF 1.320
第三戰：HP 1.287 / Damage 1.2045 / DEF 1.353
```

敵人暴擊／閃避：

- 先取玩家進場正式 numeric panel 暴擊／閃避；
- 不做 stage 成長；
- 宿因天秤再 +6 暴擊；
- 無相彼岸再 +6 閃避；
- W3 Arena **不套 generic monster 30% crit/dodge cap**；
- 不改 global monster cap，只在 W3 Arena owner 內例外。

玩家端：

- 使用正式玩家 HP／ATK／DEF／暴擊／閃避；
- 使用正式專精；
- 使用正式印記；
- 使用+40裝備；
- 使用 VIP；
- 使用文明 Lv10 最終傷害倍率；
- **界弦核心不參與 Arena。**

文明最終傷害透過 `civilizationCombatDamageMultiplier({world:3,...})` 套入 `runCombatCore`。

## 12.3 一輪／daily／連打

一輪 = 三次連續戰鬥：

- 一輪開始回滿 HP；
- 三戰之間 HP 連續承接，不回復；
- 該輪勝負結算後才回滿 HP；
- 敗北只結束當前輪；若玩家選 5／10／20 場，下一輪仍繼續，除非玩家按「停止後續場次」；
- 每一輪正式開始才消耗1次 shared Arena daily use；
- shared daily limit = 20／日。

玩家選擇：

```text
單場
5場
10場
20場
```

若剩餘 daily 次數不足對應按鈕，該按鈕 disabled，不做自動縮短批次。

## 12.4 積分公式

Lv1000 base stage points：

```text
第一戰 300
第二戰 400
第三戰 800
三戰全勝共 1500
```

每 +100 Lv：所有 stage points +5%。

```text
levelMultiplier = 1 + 0.05 × floor((level - 1000) / 100)
```

範例：

```text
Lv1000：300 / 400 / 800 = 1500
Lv1100：315 / 420 / 840 = 1575
Lv2000：450 / 600 / 1200 = 2250
```

實際玩家得到的是 shared `addDungeonPoints()` 結算後的 **VIP積分**，會吃既有 VIP dungeon multiplier：

```text
VIP4～11：×1.10
VIP12+：×1.20
```

失敗時保留已通過戰數積分：

```text
第一戰敗北 → 0
第一戰勝、第二戰敗 → 只結第一戰
前兩戰勝、第三戰敗 → 結前兩戰
三戰全勝 → 全部三戰
```

玩家模式卡會直接顯示「三戰全勝可得」的當前實際 VIP積分預覽，已包含角色等級與 VIP 倍率。

## 12.5 中斷／refresh 安全

正式 transaction owner：

```text
state.dungeon.thirdWorldArenaTransaction
```

只做 active round 的安全恢復記錄，不作為第二套 Arena progression。

規則：

- 先完成 round preparation，再 consume daily use；prepare 失敗不扣次數；
- consume daily + 建立 transaction 後立即 save；save fail 會還原 daily used／HP／runtime；
- stage 戰鬥結果可 defer settlement，structured presentation 完成後才正式 settlement；
- stale combat result fail-closed；
- reward owner 缺失時 fail-closed，不誤發積分；
- reload／pagehide／中斷後若偵測 active transaction：該已開始 round 的 daily use 保留為已使用，清除 transaction、回滿 HP、回到可重新選擇狀態；
- 不額外處罰、不追加死亡／掉裝／主線進度；
- 已完成上一輪的積分已正式落帳，不會因下一輪中斷而回滾。

## 12.6 玩家 UI

正式 UI：

- 頂部顯示今日競技場 used／20、剩餘輪數；
- 定相／異相雙卡；
- 每卡顯示三戰全勝實得 VIP積分；
- 單場／5場／10場／20場；
- 戰鬥中顯示三戰進度、lineup、目前輪數、敵人投影名稱／類型；
- 多場可「停止後續場次」，當前輪結束後停止；
- 結算顯示完成輪數、三戰全勝、未全勝、總 VIP積分、最後一輪分戰結果；
- 玩家高維稱號透過 shared `playerIdentityNameHtml()` 顯示。

Arena CSS 已從 JS dynamic `<style>` 拆成：

```text
thirdworldarena.css
```

`thirdworldarenaui.js` current：

```text
THIRD_WORLD_ARENA_UI_VERSION = 4
THIRD_WORLD_ARENA_STYLE_OWNER_VERSION = 1
```

不得復活 `thirdWorldArenaUiStyles` 第二套動態 style owner。

---

# 13. GM／測試 current main

既有主要 owner：

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
thirdworldarenagm.js
```

目前：

- formal／sandbox 分離；
- GM sandbox 不污染 formal save；
- benchmark 可選 W3／Lv1000～2000；
- GM background gate 涵蓋三紀元正式連戰；
- GM 2× 只測試，玩家 W3 最多1.5×；
- GM Story Test 三紀元；W3 11/11 preview；
- GM player title preview 支援36個正式稱號；
- W3 benchmark Civilization Lv10 最終傷害現在正式套用 `×1.50`；
- W3 benchmark 的角色紀元、文明倍率、複製摘要文字已收斂為高維語意；
- 使用「同步正式角色到測試設定」後，benchmark 畫面會立即 refresh。

## W3 Arena GM 500輪測試

`thirdworldarenagm.js` current：

```text
GM_THIRD_WORLD_ARENA_TEST_VERSION = 2
GM_THIRD_WORLD_ARENA_CORE_DELEGATION_VERSION = 1
GM_THIRD_WORLD_ARENA_FORMAL_SNAPSHOT_VERSION = 1
GM_THIRD_WORLD_ARENA_FORMAL_OPTIONS_VERSION = 1
```

正式測試規則：

- 第三紀元 Arena 不使用 Rank／升階；
- 測試角色直接沿用 GM 角色能力測試設定；
- 高維核心不參與 Arena；
- 玩家快照、敵人建構、文明 final-damage options 直接委派正式 W3 Arena Core；
- 定相可指定單一存在，或一次跑10名存在各500輪；
- 異相跑500輪，每輪三名不同存在；
- 顯示第一戰通過率、第二戰累積通過率、第三戰／完整三連勝、平均 VIP實得積分、全通平均剩餘 HP、平均總回合；
- benchmark summary 已能輸出高維 Arena 語意。

## 第16批尚未做的 GM 正式管理鎖定

正式目標：

```text
W1：專精 0～60；強化 0～20；印記未取得／0～10；無文明正式管理
W2：專精固定60；強化 20～40；印記固定10；文明 0～10
W3：專精固定60；強化固定40；印記固定10；文明固定10
```

current main 狀態：

- 專精 formal 管理已符合 W1 0～60、W2/W3 固定60；
- 印記 formal 管理已符合 W1 可管理、W2/W3 固定10；
- **強化 formal 管理仍只分 W1 0～20、W2/W3 20～40；第16批要把 W3 正式鎖為 +40；**
- **文明 formal 管理仍只分 W1不可管理、W2/W3 0～10；第16批要把 W3 正式鎖為 Lv10。**

第16批實作時必須同時鎖 UI 與下層正式 range／mutation owner；不可只 disabled 畫面。GM 測試 sandbox 仍要保留測試自由度。

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

W2 Arena 的 Rank／position／trait 系統與 W3 Arena 完全分開；不得把這套 Rank curve 套回 W3。

---

# 15. 重要 bug 修正／風險收斂

目前已完成的重要修正：

1. W3 處理殘留 W2 裝備可能重新產暗物質／暗能量 → phase3 全裝備 zero-resource。
2. W3 lost gear → 贖回 UI hidden，VIP20 shared death-loss protection。
3. VIP20 體感 → runtime／summary 顯示真正攔截次數。
4. Dungeon stale Universe 文案 → W3 phase-aware Dungeon policy。
5. bounty `hidden` 被舊 flex CSS 蓋回來 → `display:none!important` fail-closed。
6. W3 災厄卡一度被錯誤隱藏 → 恢復 W1／W2 歷史災厄回顧入口，不新增 W3 災厄。
7. W3 Guide 誤吃 Universe guide → phase resolver。
8. Guide 數值漂移 → canonical rule snapshot。
9. Guide extension 分裂 → Mirror／Cloud shared registry。
10. Fast Catch-up 文案／行為 → 只加速等待／演出，正式 combat／settlement 照常。
11. Offline migration mismatch 已完成；舊「待修」紀錄失效。
12. 宇宙 Arena Rank9 卡解鎖風險 → Balance7／RankBalance4。
13. Final 第20頁曾超155字 → 已精簡並通過 Story Integrity。
14. Schema16 W3 Story 開發期 refs 可能冒充正式完成 → `thirdWorldContentVersion=1` 一次性重建。
15. W3 completion 雙 owner → phase只重建Stage，completion統一 shared Story Progress。
16. W3 combat speed 一度繼承不一致 → W2/W3正式玩家皆只允許 1×／1.5×，GM 才能2×。
17. W3 special encounter 可能漏入正式 flow → world3 fail-closed，reward／fight 同時封鎖。
18. Mirror／Void 原本只辨識 W1/W2 → 正式 world-phase 擴充到 W3，文明 final damage 正確套用。
19. 高維稱號原本落回銀河 `tier-*` 視覺 → 獨立 `playertitleshigherdimensional.css`＋renderer 解耦。
20. Mirror 15～20 視覺差異不足 → 六階 presentation 重新拉開，仍不回封閉底板。
21. W3 Arena placeholder → 已轉成正式定相／異相玩法。
22. W3 Arena refresh／pagehide 可能造成 daily／HP／runtime 異常 → transaction recovery owner 完成。
23. Arena prepare 失敗可能先扣 daily → 改為先 prepare，再 consume daily，save fail 可 rollback。
24. Arena reward owner 缺失可能錯發／半結算 → reward fail-closed。
25. GM W3 Arena 一度使用平行公式／測試角色語意不完整 → 正式共用 W3 Arena Core snapshot／enemy／combat options。
26. GM World3 benchmark 文明 Lv10 未吃×1.50 → `gmpowerbenchmarkworldphase.js` 修正。
27. W3 Arena UI dynamic style 技術債 → 拆為 `thirdworldarena.css` 唯一正式樣式 owner。
28. W3 Dungeon／Title 舊 executable compatibility owner 技術債 → runtime owner 已退休，只保留必要 inert source-test marker。
29. 第15批優化自檢曾誤動 unrelated `worldmapui.css` cache marker → 已恢復；final compare 不留該無關改動。

---

# 16. 尚未完成／不可自行決定

目前真正尚未完成：

1. **第16批 GM 正式管理 phase lock：W3 強化固定+40、文明固定Lv10，且下層 mutation owner 也要拒絕非法值。**
2. 第16批全專案 final Integrity／legacy cleanup／exact-head closure；執行時要以 current main 為準，不重做已完成的第14／15批。
3. 低維輪迴／轉生／reset 設計仍未定案，不可自行新增。
4. 10 名高維存在大量正式實測後若要最終平衡，必須由使用者提供／同意新數據；目前 Arena／主線 current main 係數皆視為正式現況。
5. 額外 W3 背景／動畫／特效若未另行定案，不自行加。
6. 不新增 W3 特殊怪、專精、印記、文明、強化、強化石、怪物特性、文明災厄第二套系統。
7. 已完成的11篇／322頁 W3 Story 不得自行覆寫。

已失效、不得再當 TODO：

- 「W3 稱號缺專屬 CSS」→ 已完成；
- 「W3 Arena 尚未定案／尚未開放」→ 已完成；
- 「Mirror／Void W3 尚待接入」→ 已完成；
- 「W3 special encounter 尚待阻擋」→ 已完成；
- 「GM W3 Arena 尚待建立」→ 已完成；
- 「Arena UI style 還在 JS dynamic style」→ 已完成；
- 「Offline migration mismatch 待修」→ 已完成。

---

# 17. current main 重要 owner 索引

## W3 Foundation／Combat／Progress

```text
thirdworldphase.js
thirdworlddata.js
thirdworldcore.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldplayerflow.js
thirdworldcombatsaveguard.js
thirdworldmigrationregression.js
thirdworldintegritycontract.js
```

## Story

```text
storyprogress.js
storymigration.js
storyui.js
storyrecordtabs.js
storyruntimeintegrity.js
storydata-higher-dimensional*.js
```

## Title

```text
playertitlecore.js
playertitlerenderer.js
playertitleui.js
playertitles.css
playertitlesera.css
playertitlesmirror.css
playertitleshigherdimensional.css
playertitleintegrity.js
playertitlegmpreview.js
playertitlegmpreviewintegrity.js
```

## Dungeon／Mirror／Void／Arena

```text
thirdworlddungeonui.js
thirdworlddungeonintegrity.js
dungeonprogress.js
dungeonarena.js
thirdworldarena.js
thirdworldarenaui.js
thirdworldarena.css
thirdworldarenagm.js
mirrorcombatcore.js
mirrordungeonrun.js
mirrordungeonui.js
mirrordungeonintegrity.js
dungeonvoid.js
dungeonvoidui.js
dungeonvoidintegrity.js
specialencounter.js
combatspeed.js
combatspeedintegrity.js
```

## GM

```text
gmhub.js
gmhubextensions.js
gmtools.js
gmdata.js
gmbackground.js
gmcombatspeed.js
gmpowerbenchmark.js
gmpowerbenchmarkstate.js
gmpowerbenchmarkworldphase.js
gmstorytest.js
thirdworldarenagm.js
batch5ui.js
```

## Save／Offline

```text
savemigration.js
saveversionguard.js
offlinestatecore.js
offlineprogress.js
offlineworld3adapter.js
settlementtransaction.js
```

每次施工前仍要搜尋 current main 的真正 consumer，不能只看本索引猜 owner。

---

# 18. 目前正式完成鏈

```text
W3 foundation / entry / save / migration
→ Lv1000～2000
→ 10 名高維存在 / Stage / abilities / 5% front
→ combat / permanent-damage settlement
→ strings / String Core / loot / offline
→ formal 100-death continuous run
→ Fast Catch-up / review / three-era Era View
→ Story Framework / 11篇322頁 / Final completion
→ Story content-version legacy migration / completion owner convergence
→ W3 player semantics / inventory zero-resource policy
→ high-dimensional title catalog / renderer / dedicated visual owner
→ mirror title 15～20 visual convergence
→ W3 Dungeon phase policy
→ Mirror W3 formal integration
→ Void W3 formal integration
→ W3 special encounter fail-closed
→ W3 combat speed semantics
→ W3 Arena formal Core
→ W3 Arena fixed/varied player flow
→ W3 Arena VIP points / 1-5-10-20 runs / interruption recovery
→ W3 Arena GM 500-run formal-core benchmark
→ Arena CSS dedicated owner
→ Dungeon/Title legacy executable owner retirement
→ Runtime / Story / Pages exact-head green at functional HEAD 23200a08...
```

目前剩餘鏈：

```text
第16批 GM正式管理 phase lock
→ 全專案 final Integrity / legacy cleanup / exact-head closure
```

---

# 19. 第16批施工方向

第16批不是再開新 W3 玩家系統，主軸是**GM 正式管理合法性＋最終封口**。

優先處理：

1. 強化 formal 管理 range owner world-aware：
   - W1 `+0～+20`
   - W2 `+20～+40`
   - W3 固定 `+40`
2. 文明 formal 管理／mutation owner phase-aware：
   - W1 不可管理
   - W2 `Lv0～10`
   - W3 固定 `Lv10`
3. 專精／印記既有 W1/W2/W3規則只做 regression；不要重寫已正確邏輯。
4. GM sandbox 不受上述 formal lock 誤傷。
5. 最終重驗：
   - W3 UI integrity；
   - title visual integrity；
   - Mirror／Void／Arena integration；
   - story／completion；
   - save／migration／offline；
   - GM integrity；
   - W1/W2 regression；
   - Runtime／Story／Pages exact-head closure。

修改 JS／CSS 後照規則更新 `index.html` cache-bust。

---

# 20. 下一個對話如何接手（標準指令）

若新對話只要承接、暫不修改，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff 或舊對話記憶。第14批高維稱號視覺與第15批副本／Mirror／Void／高維競技場均已正式完成，第15批後優化1～5也已完成；目前下一個正式工作是第16批 GM 正式管理世界階段鎖定與全專案 final closure。請先重新讀相關正式 owner、確認 current main，再回報承接狀態；現在先不要修改。

若使用者明確要求執行第16批，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，重新檢查 current `main` 的 GM formal management、enhancement、civilization、specialization、mark、W3 Arena／Dungeon／Title／Story／Save／Offline／Integrity 正式 owner，直接執行第16批。優先修改正式 owner，不要新增 wrapper、fallback、第二套公式。W3 formal 管理強化固定+40、文明固定Lv10；W1/W2合法範圍不得回歸，GM sandbox不得被誤鎖。JS／CSS 修改同步更新 `index.html` cache-bust。修改後重新讀 current main、compare base→head、自我檢查並確認 exact-head Actions。
