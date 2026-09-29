# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-30（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引與目前規格摘要；若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次 handoff 更新前的 current `main` **功能 HEAD**：

```text
31829f14ba9dd13b569cd091f47ed1ddabd93070
```

此 HEAD 已完成：

- 第一紀元「銀河紀元」與第二紀元「宇宙紀元」既有正式內容；
- 第三紀元「高維紀元」完整 foundation／entry／save／migration／Lv1000～2000／10名高維存在／永久削血／100死連戰／界弦核心／Offline／Story／Final Completion；
- 高維正式 Story 11/11、共 322 頁；
- 高維10階稱號專屬視覺、Mirror 15～20 六階視覺；
- W3 Dungeon／Mirror／Void／特殊遭遇 fail-closed／高維競技場；
- 第16批 GM 正式管理三紀元合法範圍鎖定；
- 第16批後完整優化與技術債收斂：Save Hook／Save Safety／Migration Staircase／Offline sample owner／Battle Pipeline／World Transition guard／Script Load Policy／World Combat Adapter／Legacy Global Alias／Save writer audit／Browser Smoke；
- current exact-head `Runtime Integrity #1150` 與 `Pages build and deployment #5091` 已通過。

本 handoff 更新本身只修改 `PROJECT_HANDOFF.md`，**不修改 JS／CSS／HTML／戰鬥／存檔功能**，所以本次不需要更新 `index.html` cache-bust。

目前正式開發狀態：

```text
第三紀元主要功能：完成
第14批：完成
第15批：完成
第16批：完成
第16批後優化 1～6：完成
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
10. `thirdWorld` persistent state 只存正式 root；Stage、能力、5% front、稱號 tier、run deaths、active target、run summary、Fast Catch-up state 等 derived/runtime 不得 persist。
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
24. `offlineprogress.js` 目前是唯一經 audit 允許保留的 save compatibility wrapper；除非先完成等價的 Hook Core primitive 與 Browser regression，不可直接拔除。
25. W3 永久 HP／settlement basis 是高風險正式契約；任何 combat 共用化都不得改變 `formalStartHp → combatEndHp → permanent delta` 語意。

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

# 4. Save／Migration／Save Safety

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

不得 persist：run/deaths/suppression/active target/recent battle/summary/Fast Catch-up/player flow/Stage/abilities/5% front/title tier 等 runtime／derived state。

Schema16 政策：

- additive optional field、normalization-only 可維持 Schema16；
- semantic reinterpretation、persistent field removal、incompatible structure 才需要 schema bump；
- Schema1～15 若夾帶 W3，視為開發期資料並丟棄 W3 state；
- future save fail-closed；
- `world=3` gear 只信任 source schema ≥16；
- Boss persistence 只有 `currentHp`；10名高維存在順序是 persisted identity，不可任意重排。

Core 信任邊界：

```text
entryVersion 0 / 1 = development-only unpaid core
entryVersion >= 2   = trusted formal core
```

entryVersion <2：Core Lv／progress 歸零、維度之弦保留，reconcile 到 entryVersion2。  
entryVersion ≥2：正式投入保留；progress 可 carry-forward；Lv10 overflow 回收至維度之弦。

## Save Hook Core

```text
SAVE_HOOK_CORE_VERSION = 2
SAVE_HOOK_RUNTIME_OWNER = compatibilityowners
```

正式 registry：

- before-save hooks；
- after-save hooks；
- settlement hooks。

目前 Save Safety 與 W3 transient cleanup 都走正式 hooks，不再各自重包 `save()`。

## Save Safety V2／Capacity Diagnostic

```text
SAVE_SAFETY_VERSION = 2
SAVE_CAPACITY_DIAGNOSTIC_VERSION = 1
warning = 2 MiB
critical = 4 MiB
```

- 存檔前會先做 serialization／容量診斷；
- 寫入後回報成功／失敗與容量級別；
- reset／GM JSON import 前建立 verified safety backup；
- pre-Schema16 load 先建立專用安全備份；備份失敗則 fail-closed，原 localStorage 保留；
- future／too-old save 皆保護原始資料，不誤載。

## Migration Staircase V1

正式 stages：

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

# 5. Legacy global／Save writer 現況

正式 policy：

```text
LEGACY_COMPATIBILITY_OWNER_VERSION = 3
LEGACY_GLOBAL_ALIAS_POLICY_VERSION = 1
policy = read-compatible-no-duplicate-write
```

Legacy compatibility：

```text
SAVE_VERSION legacy read value = 13
Canonical SAVE_SCHEMA_VERSION = 16
MAX_LEVEL legacy/window alias = 500
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
```

不得把 legacy `SAVE_VERSION=13` 誤當正式 schema；不得再由多個 owner 重複寫 `window.MAX_LEVEL`。

Global save writer audit 已永久加入 CI。允許的鏈只有：

```text
engine.js                 → base save()
compatibilityowners.js    → formal Save Hook Core wrapper
offlineprogress.js        → audited Offline checkpoint compatibility wrapper
```

`thirdworldcombatsaveguard.js` 已移除獨立 save wrapper，改走 before-save hook。

---

# 6. Offline current owner

```text
OFFLINE_STATE_NORMALIZATION_VERSION = 4
OFFLINE_BATTLE_SAMPLE_VERSION = 4
OFFLINE_LEGACY_BATTLE_SAMPLE_VERSION = 3
OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2
OFFLINE_SAMPLE_OWNER_VERSION = 2
OFFLINE_SAMPLE_POLICY_VERSION = 1
OFFLINE_RESET_OWNER_VERSION = 1
```

正式 sample policy：

- 速度池：`1 / 1.5 / 2`；
- 每個速度最多保留最近8筆；
- sample actual battle 最小100ms；
- W1 level gap multiplier：
  - gap ≤3 → ×1.00
  - gap ≤6 → ×1.30
  - gap ≤10 → ×1.60
  - gap ≤15 → ×2.00
  - gap ≥16 → 不接受 sample；
- legacy sample V1/V2 不安全，安全丟棄；
- V3 可 canonical normalize 到 V4；
- sample／pending settlement／reset 都由 `offlinestatecore.js` 正式 owner 管理。

W3 Offline：

- 不記 boss identity；
- 只有 foreground 正式 complete combat＋settlement 可產 sample；
- background／Fast Catch-up 不產；
- 最多12小時；
- W3 Offline 只給裝備機會；
- 不削永久HP、不給EXP、不給strings、不推Core／Title／Story／Completion。

`battlepipeline.js` 與 W2/W3 sample consumer 已收斂到 shared `appendOfflineBattleSample()`，不再各自維護第二套 retention owner。

---

# 7. 共用 Combat 與 Battle Pipeline

正式傷害基礎仍為：

```text
DEF weight = 0.55
random = 0.95 ～ 1.05
baseDamage = ceil((ATK - DEF × 0.55) × random)
最低傷害 = 1
```

`combatmath.js` current：

```text
COMBAT_DAMAGE_MODEL_VERSION = 1
COMBAT_WORLD_ADAPTER_VERSION = 1
```

World Combat Adapter 正式工作：

```text
world / state / civilization level
→ civilizationCombatDamageMultiplier
→ playerFinalDamageMultiplier
→ runCombatCore()
```

目前已切入：

- shared Dungeon combat；
- 第二紀元主線 combat。

Chromium regression 使用相同玩家／敵人／RNG／回合上限，比對直接 `runCombatCore()` 與 `runWorldCombatCore()` 的 HP／enemy HP／turns／win 必須一致；W2 文明 Lv10 final damage 仍為 ×1.50。

`battlepipeline.js` 已完成 cleanup：

- 主線連續戰鬥、background lifecycle、Fast Catch-up、minimal mode、offline real-battle sample 走 shared owner；
- background／catch-up 不製造不合法 Offline sample；
- Story pending 會在正式勝利後中止 continuous flow；
- 移除大量重複 pipeline helper，不另建第二套戰鬥引擎。

**W3 主線 permanent-HP combat 尚未切到 World Combat Adapter**，因其多了 formalStartHp／combatEndHp／永久 settlement basis；目前保留已驗證的專用正式鏈。

---

# 8. 高維主線：10名高維存在／Stage／永久削血

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

10名存在固定順序／特化：

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

Stage：

```text
>90% Stage0
<=90% Stage1
<=80% Stage2
...
<=10% Stage9
```

每 Stage：ATK +600、DEF +1200、暴擊 +2pt、閃避 +2pt。

共通能力：70%鎮心／60%壓制／50%韌性／40%復仇／30%反噬／20%無視／10%戰意。

5% 戰線：`55,000,000 HP`。只比較存活目標；落後最高存活 HP 至少55m者下一場鎖定；擊破者退出；最後一名存活免限制。

Lv／settlement：

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：封頂，EXP歸零
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

汲取只回補當場，不能超過 formalStartHp；stale settlement 拒絕；shared settlement transaction save fail 會 rollback。

---

# 9. 100死連戰／界弦核心／VIP20／Fast Catch-up

```text
最大死亡 = 100
每死壓制 = 0.50pt - coreLv × 0.04pt
Core Lv0：100死後最大HP約50%
Core Lv10：100死後最大HP約90%
```

界弦核心：Lv0～10；每級1,000,000,000維度之弦；總投入10,000,000,000。

Run：每輪 deaths=0；玩家死亡且目標未擊破才+1；successful combat＋settlement 才+1 battle；run start snapshot coreLv／suppression；run active 禁止 Core 注入；defeat／Stage crossed／5% front／aggregate progress／death-limit 結束整輪。

VIP20 death gear protection：仍跑 shared 30% loss 判定，但若原本會掉裝則阻止實際遺失；統計真正攔下次數。

Fast Catch-up：只縮短等待／演出，不額外發收益；正式 combat＋settlement 照常；W3 background／catch-up 不產 Offline sample。

---

# 10. W3 裝備／背包

- 95% 傳說、5% 神話；
- 每場正式可落帳戰鬥至少1件；
- shared VIP loot；
- item level = post-EXP level，最高2000；
- `world=3`；
- 不建立販售經濟；
- 強化沿用+40；
- 50個正式 W3 裝備名已完成；
- name band 依 aggregate remaining HP。

W3 phase3 任意裝備處理：0金幣／0暗物質／0暗能量；殘留 W1/W2 裝備不能創造退休資源。

W3 lost gear UI hidden；進入W3時舊lost gear回背包；W3由VIP20阻止掉裝，不建立W3贖回經濟。

---

# 11. W3 Story／Completion

正式 Story：

```text
序章 12頁
Stage1～9：9 × 31頁
Final 31頁
總計 11篇／322頁
```

- 0% 是 Final，不存在普通 Stage10 milestone；
- 11 descriptors 全部 `contentReady:true`；
- shared `pendingStory / completedStories`；
- 不另建 W3 persistent queue；
- formal lifecycle 有 storyId＋session identity＋owner；
- GM／record replay 不冒充正式 completion；
- post-flow：Run Summary → Story → Title Notice；
- reload recovery／legacy reference cleanup 已完成。

Completion owner：

- `storyProgress.completedStories` 是 W3 Story completion 唯一權威；
- `storyprogress.js` 推導 `story.introSeen`、`story.finalSeen`、`thirdWorld.completed`；
- `thirdworldphase.js` 只做 Stage reconciliation；
- Final 必須 Boss全滅＋Stage10＋Formal Final Story完成才可 completed。

W3 Story content migration V1 只重建 W3 history refs，不動 W1/W2 history、Boss HP、Core、strings。

---

# 12. 玩家稱號

正式 catalog 36個：

```text
銀河文明災厄 10
宇宙文明災厄 10
鏡像戰 6
高維紀元 10
```

高維10階：破界初臨／維外行者／超界之軀／高維真形／萬維共鳴／界律共主／維序凌駕／超維至尊／諸維唯一／萬維之上。

高維 renderer：

```text
player-title--higher-dimensional
player-title--higher-dimensional-1 ... -10
```

正式視覺 owner：`playertitleshigherdimensional.css`。高維稱號是同級不同理念，不掛第一紀元 `tier-*`。

Mirror 15～20 stable ABI 為 `player-title--mirror-v3`；六階字色／光感／殘影／aura 已拉開；Mirror異象層級仍高於高維稱號。

---

# 13. W3 Dungeon／Mirror／Void／速度／特殊遭遇

W3 Dungeon：

```text
bounty → hidden + disabled
arena  → visible + enabled
mirror → visible + enabled
void   → visible + enabled
災厄   → 只保留W1/W2歷史回顧，不建W3災厄
```

Mirror／Void 都是 shared owner，正式支援 world3；玩家文明最終傷害倍率照 current world；不改 W3 永久 Boss HP，不發 W3 主線 EXP／strings／Core／Story／Completion。

Void 公式：

```text
HP  = ceil(100 + 9.6 × floor)
ATK = ceil(10 + 1.3 × floor)
DEF = ceil(5 + 0.6 × floor)
暴擊基準10
閃避基準8
```

玩家速度：W1只1×；W2/W3可1×／1.5×；玩家不可2×。GM override仍可1×／1.5×／2×。

W3 special encounter 全面 fail-closed：不能建立有效 pending、reward=0、formal fight blocked。

---

# 14. W3 高維競技場

正式模式：

- 定相：一輪三戰同一名隨機高維存在投影；
- 異相：三名不同投影，保證不重複。

敵人由正式玩家快照相對生成：`specialBaseEnemyFromPlayer(player)`。

三戰倍率：

```text
第一戰 HP 0.99   / Damage 0.9405 / DEF 1.287
第二戰 HP 1.1385 / Damage 1.0560 / DEF 1.320
第三戰 HP 1.287  / Damage 1.2045 / DEF 1.353
```

W3 Arena 不套 generic monster 30% crit/dodge cap；十名存在保留固定 specialization；不套 W3 主線 70%～10% 共通能力；界弦核心不參與 Arena。

一輪三戰：開始回滿HP；三戰間HP連續；輪結束回滿。每日 shared Arena limit 20；玩家可單場／5／10／20場，不足次數按鈕 disabled，不自動縮短。

Lv1000 base points：`300 / 400 / 800 = 1500`。每+100Lv全部stage points +5%。實得為 shared VIP積分並吃既有 VIP dungeon multiplier。

W3 Arena transaction 支援 refresh／pagehide／中斷恢復：prepare成功後才扣daily；save fail rollback；active round中斷保留已消耗daily但清transaction並回滿HP，不追加其他處罰。

GM 500輪測試直接委派 formal Arena player snapshot／enemy builder／civilization combat options，不維護平行公式。

---

# 15. 宇宙紀元 Arena 高階平衡

W2 Rank curve current：

```text
x = Rank - 1
HP     = 1.68 + 0.05x - 0.0027x²
Damage = 1.52 + 0.04x - 0.0019x²
DEF    = 1.11 + 0.022x - 0.00085x²
```

```text
balanceVersion = 7
rankBalanceVersion = 4
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485 // 97%
```

W2 Rank／position／trait 系統與 W3 Arena 完全分開。

---

# 16. GM 正式管理：第16批已完成

正式三紀元養成合法範圍：

| 系統 | W1 銀河 | W2 宇宙 | W3 高維 |
|---|---|---|---|
| 專精 | Lv0～60 | 固定Lv60 | 固定Lv60 |
| 強化 | +0～+20 | +20～+40 | 固定+40 |
| 印記 | 未取得／Lv0～10 | 固定Lv10 | 固定Lv10 |
| 文明等級 | 不啟用 | Lv0～10 | 固定Lv10 |

正式 fixed value UI 規則：控制項保留，但只有唯一合法 option/value、select disabled、正式套用按鈕 disabled。

下層 owner 同步鎖定：

- `enhancementcore.js`：W1 min0/cap20、W2 min20/cap40、W3 min40/cap40；W3 upgrade cost unavailable；
- `civilizationcore.js`：W1 disabled、W2 0～10、W3 10～10 fixed；W3 formal civilization damage = ×1.50；
- specialization formal state：W2/W3 fixed60；
- mark formal state：W2/W3 fixed10。

GM test sandbox 不受 formal lock：

```text
專精 0～60
強化原測試自由範圍（現行0～40）
印記 0～10
文明 0～10
```

角色等級與裝備等級 GM 不做世界階段硬鎖。

第16批 regression：`enhancementworld3integrity.js`、`civilizationintegrity.js`、`gmbatch16integrity.js`。

---

# 17. 第16批後優化 1～6：已完成的架構收斂

以下不再列為 TODO：

1. **Save Hook convergence**：Save Safety／Cloud metadata／W3 transient cleanup 走正式 hook registry；W3 save guard 不再包 `save()`。
2. **Save Safety／Migration Staircase**：容量診斷、verified backup、future/legacy fail-closed、V1/V9/V15/V16 migration fixture regression 完成。
3. **Offline owner convergence**：V4 canonical sample、每倍速8筆、legacy V1/V2 safe discard、V3→V4 migration、W1/W2/W3 sample consumer 收斂。
4. **Battle Pipeline cleanup**：background lifecycle／Fast Catch-up／real battle timing／sample append／story-stop 由 shared owner 統整，移除大量重複 helper。
5. **World Transition single-install guards**：bounty／offline phase guards 不重複安裝，subsystem blocker 與 stale welcome cleanup 完成。
6. **Script Load Policy V3**：GM／Story／Integrity 視為 deferred/low-priority；core/world 保持 startup critical。
7. **Legacy Global Alias cleanup**：SAVE_VERSION／MAX_LEVEL 改成只讀相容語意，不再多 owner duplicate-write。
8. **World Combat Adapter V1**：Dungeon＋W2主線共用文明 final-damage → `runCombatCore()` adapter；fixed-RNG Browser regression 保證結果等價。
9. **Global Save Writer Audit**：CI 永久掃描未授權 save writer。
10. **Runtime Browser Smoke**：不只 source regex，直接啟 real Chromium 驗證正式頁面 owner、hooks、W3 Dungeon、Arena、Save、Offline、Adapter、Legacy alias。

---

# 18. 重要 bug 修正／風險收斂

已完成的重要修正：

1. W3 殘留 W2 裝備處理可能產暗物質／暗能量 → phase3 zero-resource。
2. W3 lost gear → 贖回UI hidden，VIP20 shared protection。
3. Dungeon stale Universe 文案 → W3 phase-aware policy。
4. bounty hidden 被舊 flex CSS 蓋回 → `display:none!important`。
5. W3 Guide 誤吃 Universe guide／數值漂移 → phase resolver＋canonical snapshot。
6. Fast Catch-up → 只加速等待／演出，不額外發收益。
7. Offline migration mismatch → canonical V4 owner 與 migration policy 完成。
8. W2 Arena Rank9 解鎖風險 → Balance7／RankBalance4。
9. Schema16 W3 Story 開發 refs 冒充完成 → content-version migration。
10. W3 completion 雙 owner → shared Story Progress 唯一權威。
11. W3 combat speed 不一致 → 玩家W2/W3只1×／1.5×，GM才2×。
12. W3 special encounter 漏入 → formal flow fail-closed。
13. Mirror／Void 原只辨識W1/W2 → 正式支援W3與文明倍率。
14. 高維稱號誤用銀河tier視覺 → 獨立高維CSS／renderer。
15. Mirror 15～20差異不足 → 六階presentation拉開。
16. W3 Arena placeholder → 正式定相／異相玩法。
17. Arena refresh/pagehide daily／HP/runtime風險 → transaction recovery。
18. Arena prepare失敗先扣daily → prepare後才consume，save fail rollback。
19. Arena reward owner缺失 → fail-closed。
20. GM W3 Arena平行公式 → 委派正式Core。
21. GM W3 benchmark文明Lv10未吃×1.50 → 已修正。
22. Arena UI dynamic style → `thirdworldarena.css`正式owner。
23. W3 Dungeon／Title舊 executable compatibility owner → runtime owner退休。
24. W3強化正式管理曾讓W3可20～40 → W3固定+40。
25. W3文明正式管理曾讓W3可0～10 → W3固定Lv10。
26. W2/W3專精／印記 fixed value UI仍可點套用 → disabled control＋button closure。
27. `compatibilityowners.js`重複寫 `window.MAX_LEVEL` → duplicate write退休。
28. `thirdworldcombatsaveguard.js`後載再包 `save()` → 改成 before-save hook。
29. Save Safety Browser Smoke 一度檢查錯 hook ID → regression 已對齊正式 `save-capacity-diagnostic`。
30. Save writer audit 一度把 `batch5ui.js`區域變數與測試字串判成global writer → audit改成精確白名單／排除test false-positive。

---

# 19. 尚未完成／未來可優化

以下才是 current main 真正尚未完成或有意延後的項目；**不要把已完成的第16批或優化1～6重新做一次。**

## 19.1 已知技術債／可再優化

1. **Offline save compatibility wrapper**  
   `offlineprogress.js` 仍是唯一經 audit 允許的 save wrapper。它有特殊正式語意：離線結算期間 save 要視為成功但不落盤；一般 save 前要刷新 offline checkpoint。未來若要完全零 wrapper，應先擴充 Save Hook Core 提供「skip base write but success」或等價 primitive，再用 Browser regression 證明離線結算、heartbeat、pagehide 行為完全等價，最後才退休 wrapper。

2. **World Transition compatibility guards**  
   `worldtransitionsafety.js` 目前仍以 single-install wrapper 方式為 `enterBountyDungeon`、W2 Offline begin/finish sample 補 phase gate。現況已穩定且有 install report；未來若對應正式 owner 提供原生 phase gate，可把 guard 內移正式 owner，再移除 wrapper。不要先拔 guard。

3. **SaveVersionGuard late wrappers**  
   resetGame／GM import 的 safety backup guard，以及 load／migrate compatibility wrapper 目前仍在 `saveversionguard.js`。它們是資料保護層，不可為了形式上的零 wrapper直接刪除。未來只有在正式 reset/import/load/migration owner 提供 extension point 後，才適合收斂進正式 hook／policy。

4. **W3 主線 Combat Adapter 共用化**  
   W3 主線目前不切 `runWorldCombatCore()`，因永久HP與 settlement basis 比 W1/W2/Dungeon多一層正式契約。未來若要再共用，必須先建立 fixed-RNG＋formalStartHp/combatEndHp＋death settlement regression，證明永久削血、汲取上限、stale guard、rollback皆完全不變；否則保留現行專用鏈較安全。

5. **效能／載入後續觀察**  
   Script Load Policy V3 已完成第一輪分組，但仍應以手機實機載入、首次互動、GM頁／Story頁實際體感為依據再決定是否進一步 code-split／defer；不要只為理論效能增加新 loader owner。

## 19.2 設計上尚未定案

1. 低維輪迴／轉生／reset 系統尚未定案，不可自行新增。
2. 10名高維存在、W3 Arena、W2 Arena 最終數值若要再調整，必須依使用者正式實測資料；目前 main 係數視為正式現況。
3. 額外 W3 背景／動畫／視覺特效未另行定案，不自行擴充。
4. 不新增 W3 特殊怪、專精、印記、文明、強化、強化石、怪物特性、文明災厄第二套系統。
5. 已完成的11篇／322頁 W3 Story 不得自行覆寫。

---

# 20. Integrity／CI 現況

current functional HEAD `31829f14...`：

- Runtime Integrity #1150：success；
- 真實 Chromium Browser Smoke：success；
- Global Save Writer Audit：success；
- Unlimited VIP integrity：success；
- GM mainline HP lock integrity：success；
- Background asset integrity：success；
- Project documentation integrity：success；
- Pages build and deployment #5091：success。

Runtime static integrity 目前解析 233 個 JavaScript files，並驗證：Save Hook Core V2、Script Load Policy V3、World Transition single-install V2、World Combat Adapter V1、Legacy Global Alias Policy V1、Save Safety V2／Capacity V1／Migration Staircase V1、Offline sample owner V2、Arena V7/V4。

Story files在本輪優化未修改；Story正式內容仍沿用先前已通過的11篇／322頁基準。任何未來Story改動仍必須重新確認 Story Integrity。

---

# 21. current main 重要 owner 索引

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
thirdworldcombatsaveguard.js
thirdworldmigrationregression.js
thirdworldintegritycontract.js
```

## Combat／Battle

```text
combatcore.js
combatmath.js
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
dungeonvoid.js
dungeonvoidui.js
specialencounter.js
combatspeed.js
```

## GM formal／sandbox

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
enhancementworld3gm.js
enhancementworld3integrity.js
civilizationgm.js
civilizationintegrity.js
gmbatch16formalcontrols.js
gmbatch16integrity.js
thirdworldarenagm.js
```

每次施工前仍要搜尋 current main 的真正 owner／consumer，不能只看本索引猜 owner。

---

# 22. 目前正式完成鏈

```text
W1/W2 existing formal game
→ W3 foundation / entry / save / migration
→ Lv1000～2000
→ 10名高維存在 / Stage / abilities / 5% front
→ permanent-damage combat / settlement
→ strings / String Core / loot / offline
→ 100-death continuous run / Fast Catch-up / review
→ Story Framework / 11篇322頁 / Final completion
→ Story content migration / completion owner convergence
→ high-dimensional title / Mirror15～20 visuals
→ W3 Dungeon / Mirror / Void / special fail-closed
→ W3 Arena formal Core / UI / transaction recovery / GM500-run
→ 第16批 GM formal phase lock
→ Save Hook / Save Safety / Migration Staircase
→ Offline V4 owner convergence
→ Battle Pipeline cleanup
→ World Transition single-install safety
→ Script Load Policy V3
→ Legacy Global Alias cleanup
→ World Combat Adapter V1
→ Global Save Writer Audit
→ real Chromium Runtime Smoke
→ exact-head Runtime / Pages green
```

目前沒有下一個必做的「第17批功能」。下一階段以實機遊玩、數值觀察、使用者指定的新功能，或第19節列出的延後技術債為主。

---

# 23. 下一個對話如何接手（標準指令）

新對話若只要承接、先不修改，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff、舊對話或舊設計文件。第三紀元主要功能、第14～16批與後續優化1～6均已完成；請先確認 current main 的正式 owner、Save／Offline／Combat／GM／Arena／Story／Integrity 現況，以及 handoff 第19節真正尚未完成／未來可優化項目。現在先不要修改，只回報承接狀態與你重新檢查後的現況。

若之後使用者要求修改，標準施工原則：

> 修改前 fresh read current `main` 的相關正式 owner；優先改正式來源，不新增 wrapper、fallback、第二套公式或第二套 owner。使用者說「先討論」就不能改；說「做／修改／執行」即可直接改 main。JS／CSS 改動同步更新 `index.html` cache-bust。修改後 fresh read、compare base→head、自我檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Story（若相關）／Pages，只有 Actions 實際回傳成功才可宣稱綠燈。
