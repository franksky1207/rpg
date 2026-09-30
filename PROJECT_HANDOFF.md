# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-30（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引與目前規格摘要；若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次 handoff 更新前的 current `main` **功能 HEAD**：

```text
977d0bccbb61d65034b0180428a995809922f55c
```

此 HEAD 已完成：

- 第一紀元「銀河紀元」與第二紀元「宇宙紀元」既有正式內容；
- 第三紀元「高維紀元」完整 foundation／entry／save／migration／Lv1000～2000／10 名高維存在／永久削血／500死連戰／界弦核心／Offline／Story／Final Completion；
- 高維正式 Story 11/11、共 322 頁；
- 高維10階稱號專屬視覺、Mirror 15～20 六階視覺；
- W3 Dungeon／Mirror／Void／特殊遭遇 fail-closed／高維競技場；
- 第16批 GM 正式管理三紀元合法範圍鎖定；
- Save Hook／Save Safety／Migration Staircase／Offline V4／Battle Pipeline／World Transition／Script Load Policy／World Combat Adapter／Legacy Global Alias／Save Writer Audit／Browser Smoke 等技術債收斂；
- 第三紀元玩家說明 stable-ID copy、GM 三紀元產裝與紀元顯示政策、W2/W3 正式進度管理 owner、GM Hub native renderer late binding、GM 正式資源／副本 transaction owner；
- 2026-09-30 最近一輪新增完成：角色管理 VIP 重置去重、第三紀元背包返回、極簡模式停止呈現、500死新制、三位小數 HP cap 顯示、敵我雙方 combat FX、GM 高維十王／Stage benchmark、永久削血與能力統計、benchmark consistency／regression；
- exact-head `Runtime Integrity #1233`、`Story Integrity #902`、`Pages build and deployment #5174` 均已通過。

本 handoff 更新本身只修改 `PROJECT_HANDOFF.md`，**不修改 JS／CSS／HTML／戰鬥／存檔功能**，所以本次不需要更新 `index.html` cache-bust。

目前正式開發狀態：

```text
第三紀元主要功能：完成
第14批：完成
第15批：完成
第16批：完成
第16批後架構優化：完成
2026-09-30 Guide／GM 管理收斂：完成
2026-09-30 第三紀元實機流程／500死／GM高維 benchmark 優化：完成
目前進入：實機遊玩／數值觀察／針對性修正／後續設計階段
```

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先重新讀 current `main` 的 `PROJECT_HANDOFF.md` 與本次會碰到的正式 owner。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須重新讀 current main、compare base→head，並自我檢查 UI／邏輯／資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。** Markdown-only 文件更新不需要 cache-bust。
6. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner、第二套 completion owner。**
7. 第一／第二／第三紀元能共用的邏輯優先走 shared owner；不要因 W3 特殊而建立平行架構。
8. current main 已有 shared extension／registry／policy owner 時，優先擴充正式 owner，不再疊 monkey-patch。
9. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark state 不得污染 formal save。
10. `thirdWorld` persistent state 只存正式 root；Stage、能力、5% front、稱號 tier、run deaths、active target、run summary、Fast Catch-up state、GM benchmark result 等 derived/runtime 不得 persist。
11. W3 正式 Story／Final 已定案並完成；**不可自行重寫、替換或擴增既有 11 篇正式主線。**
12. Mirror／Void 在 W3 沿用 shared owner，不另做 W3 平行副本。
13. current main 若已完成某規格，承接現況，不重做。
14. 若設計文件與 main 衝突：**main 決定目前真實狀態；文件只保留尚未施工部分的設計方向。**
15. Integrity／Actions 沒有實際回傳綠燈時，不可宣稱 CI 已綠。
16. 玩家正式用語固定為 **「10 名高維存在」**。
17. Arena 相關規格與係數一律以 current `thirdworldarena.js`／`dungeonarena.js`／`dungeonprogress.js` 為準。
18. W3 Story completion history 唯一權威是 shared `storyProgress.completedStories`；`thirdworldphase.js` 只依 Boss progress reconciliation `story.unlockedStage`。
19. 高維稱號使用獨立高維視覺 owner；不得掛回第一紀元 `player-title--tier-*`。
20. W3 Arena 已正式上線；不得改回 placeholder／disabled，除非使用者明示。
21. 角色等級與裝備等級的 GM 管理**不做三紀元硬鎖**；它們是 GM 數值測試欄位。正常玩家仍受正式 progression／loot 規則限制。
22. 第16批 formal fixed value 不新增舊非法值 migration／repair；目前只有使用者本人測試，舊資料不需為此補修。
23. 改動前先找真正 owner／consumer；能改 owner 就不要在 UI 後處理硬蓋。
24. `offlineprogress.js` 目前是唯一經 audit 允許保留的 save compatibility wrapper；除非先完成等價 Hook Core primitive 與 Browser regression，不可直接拔除。
25. W3 永久 HP／settlement basis 是高風險正式契約；任何 combat 共用化都不得改變 `formalStartHp → combatEndHp → permanent delta` 語意。
26. GM native section registry 已改為 **late binding**；不要再恢復成「註冊時捕捉舊 renderer reference」，也不要重新加回已退休的 replace workaround。
27. GM W2/W3 進度重建邏輯已移到正式 progression management owner；`gmtools.js` 只負責 prompt／驗證／transaction adapter，不要把 Story／Title／Boss 重建公式塞回 UI adapter。
28. 正式 GM 資源與副本多欄位修改已統一走 `gmformaltransaction.js`＋shared settlement transaction；不要再改回直接 state mutation＋中途 save。
29. 第三紀元遊戲說明玩家版由 `thirdworldguidecopy.js` 的 stable item ID／integrity 管理；不要用中文標題字串當唯一 patch key，也不要重新露出 VIP20、掉裝機率、Stage/Core 後台調參數值。
30. 第三紀元主線連戰的最大死亡數與壓制公式只以 `thirdworldrun.js` 為正式 owner；UI／Guide／極簡模式不得另寫第二套公式。
31. 高維戰鬥畫面敵方能力已改為 actor-aware／owner-aware；不要再把 enemy ability 當作 player-only FX 處理。
32. GM 高維 benchmark 的 Boss／Stage／能力必須直接使用正式 W3 data／combat owner；不得另抄十王數值或第三套戰鬥公式。
33. GM 高維 benchmark 結果是 runtime sandbox；任何會改 GM 測試角色能力的操作都必須讓舊結果失效，避免「新角色設定＋舊測試結果」混用。

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
- W3 Arena 正式可玩；
- W3 不建立文明災厄，只保留 W1／W2 歷史災厄回顧；
- W3 特殊怪／特殊遭遇 formal flow fail-closed；
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

保留：level／exp、VIP、已裝備與背包裝備、+40、8專精、10印記、文明Lv10、Mirror／Void進度、舊世界歷史／紀錄／稱號。

進入時：

- 暗物質歸零；
- 暗能量歸零；
- lost gear 先恢復回背包；
- black market pending 重置；
- Offline checkpoint／pending settlement 重置；
- 清除不可跨世界 transient runtime；
- `secondWorld.entered` 保留 true；
- `thirdWorld.entryVersion = 2`。

World Transition Safety current：

```text
WORLD_TRANSITION_SUBSYSTEM_SAFETY_VERSION = 5
WORLD_TRANSITION_GUARD_INSTALL_VERSION = 2
```

正式 guard 會阻擋 bounty／arena／mirror／void／W1災厄／W2災厄／special encounter active 時的世界轉換；W3 bounty gate 與 W2 Offline sample phase guard 為 single-install compatibility guards。

---

# 4. Save／Migration／Save Safety／舊資料政策

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

Shared Story marker：

```text
storyProgress.thirdWorldContentVersion = 1
```

不得 persist：run/deaths/suppression/active target/recent battle/summary/Fast Catch-up/player flow/Stage/abilities/5% front/title tier/GM benchmark result 等 runtime／derived state。

Schema16 政策：

- additive optional field、normalization-only 可維持 Schema16；
- semantic reinterpretation、persistent field removal、incompatible structure 才需要 schema bump；
- Schema1～15 若夾帶 W3，視為開發期資料並丟棄 W3 state；
- future save fail-closed；
- `world=3` gear 只信任 source schema ≥16；
- Boss persistence 只有 `currentHp`；10 名高維存在順序是 persisted identity，不可任意重排。

Core 信任邊界：

```text
entryVersion 0 / 1 = development-only unpaid core
entryVersion >= 2   = trusted formal core
```

entryVersion <2：Core Lv／progress 歸零、維度之弦保留，reconcile 到 entryVersion2。  
entryVersion ≥2：正式投入保留；progress 可 carry-forward；Lv10 overflow 回收至維度之弦。

## 2026-09-30 最近功能的舊資料結論

最近完成的背包返回、500死、極簡模式、HP cap 顯示、actor-aware FX、GM 高維 benchmark／summary／regression **全部不新增 persistent 欄位**，因此：

- **不升 Save Schema；**
- **不新增 migration；**
- 第三紀元背包 return context 是 runtime；
- 第三紀元連戰 deaths／HP suppression 是 runtime，每輪重新從 deaths=0 開始；
- 500死新制只改正式連戰規則，不重新解讀舊 persistent state；
- GM W3 benchmark result／角色 run-time snapshot 只存在 GM runtime，不寫 formal save；
- combat event 新增 `dodge.initiative` 只是 event contract 擴充，不改存檔；
- actor-aware combat FX 只改 presentation，不改 combat result persistence；
- 既有 Schema16 正式 W3 Boss HP、Core、strings、Story、Title、裝備資料都照原規則保留。

原有 GM／Guide 舊資料結論仍有效：

- W2 GM 進度重建只操作既有 `secondWorld.mainline.bossKilled` 與 shared Story history；
- W3 GM 進度重建只操作既有 Boss HP／Story／Title／completed；
- W3 `introSeen` 以 `thirdWorld.story.introSeen === true` 或 shared completedStories 含 intro ID 任一成立視為已看過；
- GM formal transaction 只改既有資源／daily／dungeon欄位，save 失敗由 shared transaction rollback；
- 第16批 formal fixed value 不新增舊非法值 repair。

## Save Hook Core

```text
SAVE_HOOK_CORE_VERSION = 2
SAVE_HOOK_RUNTIME_OWNER = compatibilityowners
```

正式 registry：before-save hooks／after-save hooks／settlement hooks。Save Safety 與 W3 transient cleanup 都走正式 hooks，不再各自重包 `save()`。

## Save Safety V2／Capacity Diagnostic

```text
SAVE_SAFETY_VERSION = 2
SAVE_CAPACITY_DIAGNOSTIC_VERSION = 1
warning = 2 MiB
critical = 4 MiB
```

- 存檔前 serialization／容量診斷；
- 寫入後回報成功／失敗與容量級別；
- reset／GM JSON import 前建立 verified safety backup；
- pre-Schema16 load 先建立專用安全備份；備份失敗 fail-closed；
- future／too-old save 保護原始資料，不誤載。

Migration Staircase V1：

```text
legacy-exp-progress
pre-schema16-compatibility
canonical-normalization
world-phase-normalization
subsystem-normalization
finalize-current-schema
```

V1／V9／V15／V16 fixture regression 已納入 Runtime Integrity。

---

# 5. Legacy global／Save writer／Offline 現況

正式 policy：

```text
LEGACY_COMPATIBILITY_OWNER_VERSION = 3
LEGACY_GLOBAL_ALIAS_POLICY_VERSION = 1
policy = read-compatible-no-duplicate-write
```

Canonical caps：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
```

Global save writer audit 允許鏈：

```text
engine.js                 → base save()
compatibilityowners.js    → formal Save Hook Core wrapper
offlineprogress.js        → audited Offline checkpoint compatibility wrapper
```

Offline current：

```text
OFFLINE_STATE_NORMALIZATION_VERSION = 4
OFFLINE_BATTLE_SAMPLE_VERSION = 4
OFFLINE_LEGACY_BATTLE_SAMPLE_VERSION = 3
OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2
OFFLINE_SAMPLE_OWNER_VERSION = 2
```

正式 sample policy：

- 速度池 `1 / 1.5 / 2`；
- 每速度最多最近8筆；
- actual battle 最小100ms；
- W1 level gap multiplier：gap≤3 ×1.00、≤6 ×1.30、≤10 ×1.60、≤15 ×2.00、≥16不接受；
- legacy V1/V2 safe discard；V3 canonical normalize 到V4；
- sample／pending settlement／reset 由 `offlinestatecore.js` 正式 owner 管理。

W3 Offline：

- 不記 boss identity；
- 只有 foreground 正式 complete combat＋settlement 可產 sample；
- background／Fast Catch-up 不產；
- 最多12小時；
- W3 Offline 只給裝備機會；
- 不削永久HP、不給EXP、不給strings、不推Core／Title／Story／Completion。

---

# 6. 共用 Combat／Battle Pipeline／呈現層

正式傷害基礎：

```text
DEF weight = 0.55
random = 0.95 ～ 1.05
baseDamage = ceil((ATK - DEF × 0.55) × random)
最低傷害 = 1
```

`combatmath.js`：

```text
COMBAT_DAMAGE_MODEL_VERSION = 1
COMBAT_WORLD_ADAPTER_VERSION = 1
```

World Combat Adapter：world／state／civilization level → civilizationCombatDamageMultiplier → playerFinalDamageMultiplier → `runCombatCore()`。

目前已切入 shared Dungeon combat、第二紀元主線 combat；W2 文明 Lv10 final damage 仍為 ×1.50。

`battlepipeline.js` 已統整主線連續戰鬥、background lifecycle、Fast Catch-up、minimal mode、offline real-battle sample 與 Story-stop。

**W3 主線 permanent-HP combat 尚未切到 World Combat Adapter**，因其有 formalStartHp／combatEndHp／永久 settlement basis；目前保留已驗證的專用正式鏈。

## 6.1 Combat actor-aware presentation（2026-09-30）

`combatfx.js` current：

```text
COMBAT_PRESENTATION_VERSION = 3
ACTOR_AWARE_PRESENTATION_VERSION = 1
```

一般 structured renderer 已從 player-only 假設改為 actor-aware／owner-aware：

- 敵人先制／連擊／穿透／反擊／汲取可正確顯示；
- enemy drain 回復 Boss 畫面 HP，不再錯補玩家；
- 護界、吸收、反噬等 HP／shield presentation 依 owner／target 同步正確側；
- Boss 的鎮心／韌性／復仇／戰意顯示在 Boss 側；壓制／反噬／無視依 target 顯示；
- 玩家原有專精／印記呈現與 Mirror owner-aware 行為保留。

`combatfxintegrity.js` 已同步 actor-aware regression。

## 6.2 dodge initiative event contract（2026-09-30）

`combatcore.js` 新增：

```text
COMBAT_DODGE_INITIATIVE_EVENT_VERSION = 1
```

第一次正常攻擊若帶 initiative 但被閃避，`dodge` event 也會帶 `initiative:true`。這只擴充事件語意，不改命中、閃避、先制傷害或 RNG 公式；GM benchmark 可因此正確統計「先制第一擊被閃避」的情況。

---

# 7. 高維主線：10 名高維存在／Stage／永久削血

每名最大 HP：`1,100,000,000`；總 HP：`11,000,000,000`。

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

10 名存在固定順序／特化：

```text
01 破界天裁：ATK ×1.15
02 永劫重垣：DEF ×1.15
03 宿因天秤：暴擊 +6pt
04 無相彼岸：閃避 +6pt
05 萬象迴演：連擊 +10pt
06 維隙之刃：穿透 +10pt
07 逆因輪轉：反擊 +10pt
08 噬界深淵：汲取 +10pt
09 先驗之瞳：先制 +20pt
10 高維原點：ATK ×1.08、DEF ×1.08
```

Stage：`>90% Stage0`，`<=90% Stage1`，每下降10%再+1，`<=10% Stage9`。每 Stage：ATK +600、DEF +1200、暴擊 +2pt、閃避 +2pt。

共通能力：70%鎮心／60%壓制／50%韌性／40%復仇／30%反噬／20%無視／10%戰意。

十王固定五能力、個體特化與上述 Stage 能力都會正式傳入 `runCombatCore()`；不是只做 UI。高維 combat integrity 已實戰驗證先制／連擊／穿透／反擊／汲取與 Stage ability matrix。

5% 戰線：`55,000,000 HP`；只比較存活目標；落後最高存活 HP 至少55m者下一場鎖定；擊破者退出；最後一名存活免限制。

Lv／settlement：

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：封頂，EXP歸零
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

汲取只回補當場，不能超過 formalStartHp；stale settlement 拒絕；shared settlement transaction save fail rollback。

---

# 8. 500死連戰／界弦核心／極簡模式／Fast Catch-up

## 8.1 最新正式公式（舊100死規則已失效）

`thirdworldrun.js` current：

```text
MAX_DEATHS = 500
BASE_SUPPRESSION_PER_DEATH = 0.100 pt
CORE_REDUCTION_PER_LEVEL = 0.008 pt
suppressionPerDeath = round3(0.100 - coreLv × 0.008)
```

Core Lv0～10 對應每死壓制：

```text
Lv0  0.100%
Lv1  0.092%
Lv2  0.084%
Lv3  0.076%
Lv4  0.068%
Lv5  0.060%
Lv6  0.052%
Lv7  0.044%
Lv8  0.036%
Lv9  0.028%
Lv10 0.020%
```

500死最終壓制與舊制難度等價：

```text
Core Lv0：500死 → HP cap 50.000%
Core Lv10：500死 → HP cap 90.000%
Core Lv5：250死 → HP cap 85.000%
```

計算使用 `round3()`；玩家可見的每死壓制、累積壓制與目前最大 HP 百分比統一顯示到 **小數第3位**。

Run：

- 每輪 deaths=0；
- 玩家死亡且目標未擊破才+1；
- successful combat＋settlement 才+1 battle；
- run start snapshot coreLv／per-death suppression；
- run active 禁止 Core 注入；
- boss defeat／Stage crossed／5% front／aggregate progress／death-limit 結束整輪；
- `MAX_DEATHS` 是唯一正式上限 owner，Guide／UI／極簡模式讀正式值。

## 8.2 HP cap 顯示修正

曾出現理論應為 `99.100%` 卻顯示 `99.098%`，原因是 UI 用 `Math.floor()` 後的整數 HP 反推百分比。

current main：

- 優先顯示 `thirdworldrun.js` 正式 `hpCapPercent`；
- `thirdworldplayerflow.js` fallback 先呼叫 `thirdWorldRunHpCapSnapshot()`；
- 只有正式 owner 不可用時才最後退回整數 HP ratio；
- 實際戰鬥 HP 仍維持整數化，沒有改平衡。

## 8.3 極簡模式

第三紀元 own minimal adapter：`third-world-mainline`。

已修正：

- 開極簡模式本身不再讓正式 W3 run 因 `minimal-mode-open` runtime conflict 自動停止；
- 背景戰鬥／Fast Catch-up 仍依正式 GM background gate；
- 正式 terminal 發生時，極簡模式先顯示醒目 **「戰鬥已停止」**，下方顯示玩家可讀原因；
- 典型原因：`戰線進度已更新`、`Stage 已改變`、`已達本輪 500 次死亡上限`、`高維存在已擊破`；
- 5% 戰線事件不再看起來像畫面卡死；玩家離開極簡後可接續正式高維進度事件 modal。

## 8.4 Fast Catch-up／background

- Fast Catch-up 只縮短等待／演出，不額外發收益；
- 正式 combat＋settlement 照常；
- W3 background／catch-up 不產 Offline sample；
- own minimal mode 不應自行中止 background flow；
- GM background battle 關閉時，W3 連戰在背景等待 foreground，不自行額外結算。

界弦核心：Lv0～10；每級1,000,000,000維度之弦；總投入10,000,000,000。

VIP20 death gear protection：正式引擎仍跑 shared 掉裝判定並阻止實際遺失；玩家遊戲說明不公開掉裝機率／VIP20攔截後台細節。

---

# 9. 第三紀元背包返回／戰鬥後導航

W1／W2 既有行為：戰鬥頁開背包後按返回，回原冒險／戰鬥上下文。

W3 current main 已補正式 runtime return context：

```text
THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_VERSION = 2
THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_MODE = "third-world-main"
```

正式 owner：`inventoryfocus.js`。

行為：

- 從第三紀元戰鬥／高維戰線進背包前，若 W3 continuous run active，先走正式 `stopThirdWorldRunFromPlayerUi()`；
- 共用 `openAdventureInventory()` 仍是背包入口，不複製第二套背包流程；
- 開啟後將 runtime `inventoryReturnContext` 明確標成 `third-world-main`；
- 返回時不再假裝成 `universe-main`，也不會誤觸 `requestSecondWorldAdventureProgressFocus()`；
- `THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_INTEGRITY` 防止未來退回 W2 alias。

這是純 runtime navigation，不需要 save migration。

---

# 10. W3 裝備／背包／GM 產裝

正式 W3 掉落：

```text
傳說 95%
神話 5%
```

- 每場正式可落帳戰鬥至少1件；
- shared VIP loot；
- item level = post-EXP level，最高2000；
- `world=3`；
- 不建立販售經濟；
- 強化沿用+40；
- 50個正式 W3 裝備名已完成；
- name band 依 aggregate remaining HP；
- 正式 factory 只允許 q=4/5。

W3 phase3 任意裝備處理：0金幣／0暗物質／0暗能量；殘留 W1/W2 裝備不能創造退休資源。

W3 lost gear UI hidden；進入W3時舊lost gear回背包；W3由VIP20阻止實際掉裝，不建立W3贖回經濟。

GM「產生高維紀元裝備」：

- W3 才顯示；
- 可選 10 名高維存在、品質、部位；
- 品質只有傳說／神話；預設神話；
- 使用正式 `makeThirdWorldEquipmentForBoss()`／W3 equipment factory；
- 裝備等級採目前角色等級（W3 1000～2000）；
- 名稱依正式高維整體進度 band。

---

# 11. W3 Story／Completion／Guide／Title

正式 Story：序章12頁；Stage1～9 各31頁；Final31頁；總計11篇／322頁。

- 0% 是 Final，不存在普通 Stage10 milestone；
- 11 descriptors 全部 `contentReady:true`；
- shared `pendingStory / completedStories`；
- formal lifecycle 有 storyId＋session identity＋owner；
- GM／record replay 不冒充正式 completion；
- post-flow：Run Summary → Story → Title Notice；
- Completion 唯一權威：`storyProgress.completedStories`；
- `thirdworldphase.js` 只做 Stage reconciliation；
- Final 必須 Boss全滅＋Stage10＋Formal Final Story完成才可 completed。

## Guide player copy

```text
THIRD_WORLD_GUIDE_PLAYER_COPY_VERSION = 2
THIRD_WORLD_GUIDE_COPY_INTEGRITY_VERSION = 1
```

玩家版：

- 移除獨立 VIP20 裝備保護條目；
- 不公開掉裝機率／VIP20攔截細節；
- 十王個體特化／Stage／Core 採玩家導向說明；
- 不公開後台精確調參；
- 高維競技場顯示為正式已開放；
- 高維連續戰鬥的死亡上限由 `THIRD_WORLD_RUN_MAX_DEATHS` 動態讀取，因此 current 顯示500；
- 極簡模式說明包含正式停止狀態與原因。

`THIRD_WORLD_GUIDE_COPY_INTEGRITY_REPORT` 防止 VIP／掉裝／Stage／Core 後台數值重新外洩。

## 玩家稱號

正式 catalog 36個：銀河災厄10／宇宙災厄10／鏡像6／高維10。

高維10階：破界初臨／維外行者／超界之軀／高維真形／萬維共鳴／界律共主／維序凌駕／超維至尊／諸維唯一／萬維之上。

高維 renderer 使用獨立 `player-title--higher-dimensional-*`；Mirror15～20 使用 `player-title--mirror-v3`，六階差異已拉開。

---

# 12. W3 Dungeon／Mirror／Void／速度／特殊遭遇

W3 Dungeon：

```text
bounty → hidden + disabled
arena  → visible + enabled
mirror → visible + enabled
void   → visible + enabled
災厄   → 只保留W1/W2歷史回顧，不建W3災厄
```

Mirror／Void shared owner 正式支援 world3；文明 final damage 使用 current world；不改 W3 永久 Boss HP，不發 W3 主線 EXP／strings／Core／Story／Completion。

Void：

```text
HP  = ceil(100 + 9.6 × floor)
ATK = ceil(10 + 1.3 × floor)
DEF = ceil(5 + 0.6 × floor)
暴擊基準10
閃避基準8
```

玩家速度：W1只1×；W2/W3可1×／1.5×；玩家不可2×。GM override可1×／1.5×／2×。

W3 special encounter formal flow fail-closed：不能建立有效 pending、reward=0、formal fight blocked。

---

# 13. W3 高維競技場／W2 Arena

W3 Arena 正式模式：

- 定相＝一輪三戰同一名隨機高維存在投影；
- 異相＝三名不同投影、保證不重複。

三戰倍率：

```text
第一戰 HP 0.99   / Damage 0.9405 / DEF 1.287
第二戰 HP 1.1385 / Damage 1.0560 / DEF 1.320
第三戰 HP 1.287  / Damage 1.2045 / DEF 1.353
```

W3 Arena：

- 不套 generic monster 30% crit/dodge cap；
- 十名存在保留固定 specialization；
- 不套 W3 主線 70%～10% 共通能力；
- 界弦核心不參與；
- 一輪三戰：開始回滿HP、三戰間HP連續、輪結束回滿；
- shared Arena daily 20；玩家可選1／5／10／20輪；
- Lv1000 points `300/400/800=1500`，每+100Lv全 stage points +5%；
- transaction 支援 refresh／pagehide／中斷恢復；prepare成功後才扣daily，save fail rollback。

W2 Arena current：

```text
x = Rank - 1
HP     = 1.68 + 0.05x - 0.0027x²
Damage = 1.52 + 0.04x - 0.0019x²
DEF    = 1.11 + 0.022x - 0.00085x²
balanceVersion = 7
rankBalanceVersion = 4
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485 // 97%
```

W2 Rank／position／trait 與 W3 Arena 分離。除非使用者明確要求，不自行調 Arena 平衡。

---

# 14. GM 正式管理：三紀元政策

## 14.1 正式養成合法範圍

| 系統 | W1 銀河 | W2 宇宙 | W3 高維 |
|---|---|---|---|
| 專精 | Lv0～60，可管理 | 固定Lv60 | 固定Lv60 |
| 強化 | +0～+20，可管理 | +20～+40，可管理 | 固定+40 |
| 印記 | 未取得／Lv0～10，可管理 | 固定Lv10 | 固定Lv10 |
| 文明等級 | 整區不顯示 | Lv0～10，可管理 | 固定Lv10 |

fixed value UI：純固定值 `<div class="gm-formal-fixed-value">`，不產生 select／下拉箭頭／套用按鈕；sandbox 不受影響。

## 14.2 角色管理顯示政策

| 當前紀元 | 正式資源 | 正式進度 | 可產裝 |
|---|---|---|---|
| W1 | 金幣 | 銀河 | 銀河 |
| W2 | 暗物質＋暗能量 | 宇宙 | 銀河＋宇宙 |
| W3 | 維度之弦 | 高維 | 銀河＋宇宙＋高維 |

`GM_MANAGEMENT_PHASE_POLICY_VERSION = 1`。

### VIP 重置去重（2026-09-30）

角色管理原先也有「重置 VIP（等級＋積分）」按鈕，與獨立 VIP 管理重複。current main 已移除角色管理那顆，只保留 **VIP 管理**內的重置入口；`gmResetVip()` 函式仍保留供 VIP 管理使用，重置時維持原 HP 比例／滿血狀態語意。

## 14.3 W2/W3 正式進度管理

`secondworldprogressmanagement.js`：GM 輸入已擊破 Boss 數0～100，重建連續 bossKilled prefix、宇宙 Story completion、pending story、災厄出現條件；不改文明 trueKills／角色Lv／EXP／資源。

`thirdworldprogressmanagement.js`：GM 輸入攻略完成度0～100%，十王統一永久 HP 完成度；正式 Stage／aggregate title／milestone story／Final completion 自然同步；不改角色Lv／EXP／strings／Core／裝備。

W3 intro defensive reconciliation：`story.introSeen===true || completedStories includes introId`。

## 14.4 GM Hub native late binding

`gmhubextensions.js` native sections 使用 `lateWindowRenderer(name)`；每次 render 才抓最新 `window.gm...Html`。不要改回 captured reference；已退休的 native replace workaround 不要加回。

## 14.5 GM formal transaction

`gmformaltransaction.js`：

```text
GM_FORMAL_TRANSACTION_OWNER_VERSION = 1
GM_FORMAL_RESOURCE_TRANSACTION_VERSION = 1
GM_FORMAL_DUNGEON_TRANSACTION_VERSION = 1
GM_FORMAL_DAILY_RESET_TRANSACTION_VERSION = 1
```

資源 phase guard：W1金幣、W2暗物質／暗能量、W3維度之弦。副本／VIP多欄位為 atomic transaction；daily reset 同步處理 bounty／arena／void／mirror daily，保留歷史最高／神蹟；save fail rollback。

---

# 15. GM 高維紀元戰力基準測試（2026-09-30 最新）

正式 adapter／owner：`gmpowerbenchmarkworldphase.js`。

Current versions：

```text
GM_POWER_BENCHMARK_WORLD_PHASE_ADAPTER_VERSION = 10
GM_POWER_BENCHMARK_WORLD3_MAP_TEST_VERSION = 3
GM_POWER_BENCHMARK_WORLD3_ANALYTICS_VERSION = 3
GM_POWER_BENCHMARK_WORLD3_RESULT_CONSISTENCY_VERSION = 1
GM_POWER_BENCHMARK_WORLD3_ANALYTICS_REGRESSION_VERSION = 1
```

## 15.1 地圖怪測試加入 W3

「戰力基準測試 → 地圖怪」可切：銀河／宇宙／高維。

W3 可選：

- 10 名正式高維存在；
- Stage 0～9；
- 測試量100／1000場。

Boss 名稱、HP／ATK／DEF／crit／dodge、固定五能力、specialization、Stage abilities 都直接讀正式：

```text
thirdWorldBoss()
thirdWorldBossStats()
thirdWorldBossAbilities()
thirdWorldBossSpecializationPresentation()
```

實戰直接呼叫正式 `runThirdWorldBossCombat(..., ignoreUnlock:true)`，使用 GM sandbox player／專精／印記／文明；不 settlement、不寫正式十王永久 HP。

## 15.2 W3 benchmark 核心報表

第三紀元不再以「勝率」為主要平衡指標，正式顯示：

- 平均每場永久削血；
- 平均每回合削血；
- 平均存活回合；
- 測試總削血；
- 等效 Boss HP 削減%；
- **依目前 Stage 效率推估擊破**；
- Stage0～8：預估推進下一 Stage；
- Stage9：不顯示不存在的下一 Stage，改以擊破推估為準。

## 15.3 玩家／Boss 五能力實測

分別統計：

- 先制；
- 連擊；
- 穿透；
- 反擊；
- 汲取；
- 汲取回血量；
- 玩家實際暴擊率／閃避率。

先制統計同時接受：

```text
attack event + initiative
或
dodge event + initiative
```

因此第一擊被閃避不會漏算。

## 15.4 Stage 能力實測

依當前 Stage active abilities 統計：

- 鎮心：實際阻止暴擊次數；
- 壓制：實際阻止閃避次數；
- 韌性：觸發次數＋累計減傷；
- 復仇：ready／consume；
- 反噬：觸發次數＋累計實際傷害；
- 無視：觸發次數；
- 戰意：啟動場數＋平均最高層數。

## 15.5 result consistency／角色快照／失敗統計

- W3 result 保存本次 run-time 角色快照；
- GM 測試角色任何影響戰力的修改會透過 `gmPowerBenchmarkInvalidateSnapshot()` 同步清除舊 W3 result；
- UI／複製摘要使用 result 內角色快照，避免新角色設定與舊結果混用；
- 所有「每場平均」以 `completed` 有效完成場數為分母；
- 顯示要求場數／有效完成／失敗場數／第一個失敗原因。

## 15.6 統一複製摘要

最下面「複製測試摘要」會把 W3 高維測試完整帶出：

- 目標／Stage／個體特化／階段能力；
- 本次角色快照；
- 要求／有效／失敗場數；
- 永久削血效率；
- 擊破／下一 Stage 推估；
- 玩家五能力；
- Boss 五能力；
- Stage 能力。

可直接貼回 ChatGPT 做十王／Stage／角色配置比較。

## 15.7 deterministic analytics regression

`GM_POWER_BENCHMARK_WORLD3_ANALYTICS_REGRESSION` 會驗：

- 五能力 event counting；
- Stage ability counting；
- dodge initiative contract；
- completed 分母；
- failed／firstFailureReason；
- Stage9 summary 語意；
- result invalidation；
- 真正呼叫 `runThirdWorldBossCombat(ignoreUnlock)` 後正式 Boss `currentHp` 不變；
- `effectivePermanentDamage = formalStartHp - combatEndHp` settlement basis 契約。

---

# 16. 最近完成的重要 bug 修正／風險收斂

以下已完成，不再列 TODO：

1. W3 殘留 W2 裝備可能產暗物質／暗能量 → phase3 zero-resource。
2. W3 lost gear → 贖回UI hidden，VIP20 shared protection。
3. Dungeon stale Universe 文案 → W3 phase-aware policy。
4. bounty hidden 被舊 flex CSS 蓋回 → hidden policy固定。
5. W3 Guide 誤吃 Universe guide／數值漂移 → phase resolver＋canonical snapshot。
6. Fast Catch-up 只加速等待／演出，不額外發收益。
7. Offline migration mismatch → canonical V4 owner。
8. W2 Arena Rank9 解鎖風險 → Balance7／RankBalance4。
9. Schema16 W3 Story 開發 refs 冒充完成 → content-version migration。
10. W3 completion 雙 owner → shared Story Progress 唯一權威。
11. W3 combat speed 不一致 → 玩家W2/W3只1×／1.5×，GM才2×。
12. W3 special encounter 漏入 → fail-closed。
13. Mirror／Void 原只辨識W1/W2 → 正式支援W3。
14. 高維稱號誤用銀河tier視覺 → 獨立高維CSS／renderer。
15. Mirror15～20差異不足 → 六階presentation拉開。
16. W3 Arena placeholder → 正式定相／異相。
17. Arena refresh/pagehide／prepare/save rollback 風險 → transaction recovery。
18. GM W3 Arena平行公式 → 委派正式 Core。
19. W3固定專精／印記／強化／文明曾可點 → 純 fixed-value UI。
20. GM Hub registry 捕捉舊 renderer → native late binding。
21. `compatibilityowners.js`重複寫 `window.MAX_LEVEL` → duplicate write退休。
22. W3 save guard 再包 `save()` → before-save hook。
23. GM resource/progress顯示錯紀元 → current-phase policy。
24. W2/W3 缺正式進度管理 → world progress management owner。
25. GM 正式多欄位直接 mutation／中途save → atomic transaction。
26. GM 高維裝備產生缺失 → 正式 factory／legendary+mythic。
27. W3 Guide 洩漏 VIP／Stage／Core 後台數值 → stable-ID copy integrity。
28. 角色管理與 VIP 管理重複「重置 VIP」 → 角色管理移除，只留 VIP 管理。
29. W3 開背包返回主畫面而非高維戰線 → `third-world-main` return context。
30. 開高維極簡模式會讓 run 誤判 runtime conflict 而停止 → own minimal mode guard。
31. 5%戰線／Stage等正式 terminal 在極簡畫面看似卡死 → 大黃字「戰鬥已停止」＋中文原因。
32. 100死節奏過快 → 正式改為500死；0.5%／0.04% 同比例改為0.100%／0.008%。
33. HP cap 顯示 `99.098%` 等整數反推誤差 → 直接讀正式 `hpCapPercent`，顯示三位小數。
34. 敵方先制／穿透無飄字、enemy drain錯補玩家、Boss印記FX錯側 → combat presentation actor-aware／owner-aware。
35. GM 地圖怪測試沒有 W3 十王 → 加入十王＋Stage0～9。
36. W3 benchmark 原本勝率／Boss剩餘HP等指標無意義 → 改永久削血效率／能力事件統計。
37. W3 benchmark 角色設定改後可能混用舊結果 → shared invalidation＋run-time character snapshot。
38. benchmark 平均值使用要求 runs 而非有效 completed → 全部改 completed 分母並新增失敗統計。
39. 「預估擊破」容易誤認全程精準 → 明確標示依目前 Stage 效率推估；Stage9不顯示下一Stage。
40. 先制第一擊被閃避會漏算 → dodge event 加 `initiative`＋benchmark counter更新。
41. W3 benchmark integrity過淺 → deterministic analytics regression＋正式 Boss HP non-mutation regression。

---

# 17. 尚未完成／未來可優化

以下才是 current main 真正尚未完成或有意延後的項目；不要重做上面已完成項目。

## 17.1 已知技術債／可再優化

1. **Offline save compatibility wrapper**  
   `offlineprogress.js` 仍是唯一經 audit 允許的 save wrapper。若要完全零 wrapper，先擴充 Save Hook Core 提供等價 primitive，再做 Browser regression。

2. **World Transition compatibility guards**  
   `worldtransitionsafety.js` 仍以 single-install compatibility guard 補 bounty／W2 Offline phase gate；只有正式 owner 有原生 phase gate 後才可移除。

3. **SaveVersionGuard late wrappers**  
   resetGame／GM import safety backup guard、load／migrate compatibility wrapper 仍在 `saveversionguard.js`；屬資料保護層，不可為形式上的零 wrapper直接刪除。

4. **W3 主線 Combat Adapter 共用化**  
   若要切 `runWorldCombatCore()`，必須先建立 fixed-RNG＋formalStartHp/combatEndHp＋death settlement regression，證明永久削血、汲取上限、stale guard、rollback完全不變。

5. **手機實機效能／載入觀察**  
   Script Load Policy V3 已完成第一輪分組；後續依手機首次互動、GM頁／Story頁體感決定是否再 code-split／defer。

6. **GM Hub 檔案責任偏大（低優先）**  
   若未來管理功能再大幅增加，可考慮每世界提供 fragment renderer；現況功能正常，不急拆。

7. **formal fixed-value inline style（低優先）**  
   可日後純 CSS class 化，屬整潔度。

8. **500死玩家層少量 numeric fallback（低優先）**  
   `thirdworldui.js`／`thirdworldplayerflow.js` 仍保留 `THIRD_WORLD_RUN_MAX_DEATHS || 500` 類 fail-safe；正式正常路徑都讀 owner。若未來常改上限，可再收斂成單一 accessor；目前不是功能 bug。

9. **GM W3 1000場效能（低優先，只有實測卡頓才做）**  
   每場正式 `runThirdWorldBossCombat()` 仍建立完整 result／events／diagnostics。若手機 GM 1000場明顯卡，可考慮在正式 combat owner 增加 compact diagnostics option；不得另抄戰鬥公式。

## 17.2 設計上尚未定案

1. 低維輪迴／轉生／reset 系統尚未定案，不可自行新增。
2. 十名高維存在、W3 Arena、W2 Arena 最終數值若要再調整，必須依使用者正式實測資料；目前 main 係數視為正式現況。
3. 額外 W3 背景／動畫／視覺特效未另行定案，不自行擴充。
4. 不新增 W3 特殊怪、專精、印記、文明、強化、強化石、怪物特性、文明災厄第二套系統。
5. 已完成的11篇／322頁 W3 Story 不得自行覆寫。

---

# 18. Integrity／CI 現況

current functional HEAD：

```text
977d0bccbb61d65034b0180428a995809922f55c
```

exact-head：

- Runtime Integrity #1233：success；
- real Browser Runtime Smoke：success；
- Unlimited VIP integrity：success；
- GM mainline HP lock integrity：success；
- Background asset integrity：success；
- Project documentation integrity：success；
- Story Integrity #902：success；
- Pages build and deployment #5174：success。

近期重要 integrity／regression：

```text
THIRD_WORLD_GUIDE_COPY_INTEGRITY
THIRD_WORLD_ADVENTURE_INVENTORY_RETURN_INTEGRITY
THIRD_WORLD_RUN_INTEGRITY（500死／0.100／0.008）
COMBAT_ACTOR_AWARE_PRESENTATION_INTEGRITY
COMBAT_DODGE_INITIATIVE_EVENT_VERSION
GM_HUB_NATIVE_LATE_BINDING_INTEGRITY
SECOND_WORLD_PROGRESS_MANAGEMENT_INTEGRITY
THIRD_WORLD_PROGRESS_MANAGEMENT_INTEGRITY
GM_FORMAL_TRANSACTION_INTEGRITY
GM_POWER_BENCHMARK_WORLD3_MAP_TEST_INTEGRITY
GM_POWER_BENCHMARK_WORLD3_ANALYTICS_REGRESSION
GMBATCH16 / enhancement / civilization existing regressions
```

未來任何功能修改仍以 exact current HEAD Actions 為準，不得沿用本節綠燈宣稱新提交已綠。

---

# 19. current main 重要 owner 索引

## World／W3

```text
worldphase.js
worldtransitionsafety.js
thirdworldphase.js
thirdworlddata.js
thirdworldcore.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldplayerflow.js
thirdworldui.js
inventoryfocus.js
thirdworldcombatsaveguard.js
thirdworldmigrationregression.js
thirdworldintegritycontract.js
```

## Combat／Battle／Presentation

```text
combatcore.js
combatmath.js
combatfx.js
combatfxintegrity.js
battlepipeline.js
dungeoncore.js
secondworldcombat.js
settlementtransaction.js
```

## Save／Migration／Offline

```text
savemigration.js
saveversionguard.js
compatibilityowners.js
offlinestatecore.js
offlineprogress.js
offlineworld3adapter.js
thirdworldcombatsaveguard.js
```

## Guide／Story／Title

```text
gameguide.js
thirdworldguidecopy.js
mirrordungeonguide.js
cloudsaveguide.js
storyprogress.js
storymigration.js
storyui.js
storyrecordtabs.js
storyruntimeintegrity.js
storydata-higher-dimensional*.js
playertitlecore.js
playertitlerenderer.js
playertitleui.js
playertitleshigherdimensional.css
playertitlesmirror.css
playertitleintegrity.js
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
mirrordungeonstate.js
mirrordungeonrun.js
mirrordungeonui.js
dungeonvoid.js
dungeonvoidui.js
specialencounter.js
combatspeed.js
```

## GM formal／sandbox／benchmark

```text
gmhub.js
gmhubextensions.js
gmtools.js
gmformaltransaction.js
secondworldprogressmanagement.js
thirdworldprogressmanagement.js
gmdata.js
gmbackground.js
gmcombatspeed.js
gmpowerbenchmark.js
gmpowerbenchmarkstate.js
gmpowerbenchmarkworldphase.js
gmstorytest.js
enhancementworld3gm.js
enhancementworld3integrity.js
civilizationgm.js
civilizationintegrity.js
gmbatch16formalcontrols.js
gmbatch16integrity.js
batch5ui.js
thirdworldarenagm.js
```

每次施工前仍要搜尋 current main 的真正 owner／consumer，不能只看本索引猜 owner。

---

# 20. 目前正式完成鏈

```text
W1/W2 existing formal game
→ W3 foundation / entry / save / migration
→ Lv1000～2000
→ 10名高維存在 / Stage / abilities / 5% front
→ permanent-damage combat / settlement
→ strings / String Core / loot / offline
→ 500-death continuous run / Fast Catch-up / review
→ minimal-mode terminal presentation / 3-decimal HP cap
→ W3 inventory explicit return context
→ Story Framework / 11篇322頁 / Final completion
→ Story content migration / completion owner convergence
→ high-dimensional title / Mirror15～20 visuals
→ W3 Dungeon / Mirror / Void / special fail-closed
→ W3 Arena formal Core / UI / transaction recovery / GM500-run
→ 第16批 GM formal phase lock
→ pure fixed-value formal UI
→ Save Hook / Save Safety / Migration Staircase
→ Offline V4 owner convergence
→ Battle Pipeline cleanup
→ World Transition single-install safety
→ Script Load Policy V3
→ Legacy Global Alias cleanup
→ World Combat Adapter V1
→ Global Save Writer Audit
→ real Chromium Runtime Smoke
→ W3 player Guide stable-ID copy / integrity
→ GM phase-aware resource/progress/gear visibility
→ W3 GM gear generator
→ W2/W3 formal progress management owner
→ GM Hub native renderer late binding
→ GM formal resource/dungeon transaction owner
→ duplicate VIP reset removed from Character Management
→ combat presentation actor-aware / owner-aware
→ W3 GM benchmark: 10 bosses / Stage0～9 / 100-1000 runs
→ permanent-damage / five-ability / Stage-ability analytics
→ result snapshot invalidation / completed denominator / failure reporting
→ dodge initiative event contract / deterministic W3 analytics regression
→ exact-head Runtime / Story / Pages green
```

目前沒有下一個必做的功能批次。下一階段以實機遊玩、十王與各 Stage 數值觀察、使用者指定的新功能，或第17節延後技術債為主。

---

# 21. 下一個對話如何接手（標準指令）

新對話若只要承接、先不修改，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff、舊對話或舊設計文件。請先確認 current main 的正式 owner、Save／Offline／Combat／第三紀元500死連戰／背包返回／極簡模式／GM高維benchmark／Arena／Story／Guide／Integrity 現況，以及 handoff 第17節真正尚未完成／未來可優化項目。現在先不要修改，只回報承接狀態與你重新檢查後的現況。

若之後使用者要求修改，標準施工原則：

> 修改前 fresh read current `main` 的相關正式 owner；優先改正式來源，不新增 wrapper、fallback、第二套公式或第二套 owner。使用者說「先討論／先檢查／先不要修改」就不能改；說「做／修改／執行／第 N 批」即可直接改 main。JS／CSS 改動同步更新 `index.html` cache-bust。修改後 fresh read、compare base→head、自我檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Story（若相關）／Pages，只有 Actions 實際回傳成功才可宣稱綠燈。
