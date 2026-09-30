# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-30（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引與目前規格摘要；若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次 handoff 更新前的 current `main` **功能 HEAD**：

```text
2d57568b4f19a78c291561c15c5db79223fe2cf9
```

此 HEAD 已完成：

- 第一紀元「銀河紀元」與第二紀元「宇宙紀元」既有正式內容；
- 第三紀元「高維紀元」完整 foundation／entry／save／migration／Lv1000～2000／10 名高維存在／永久削血／100死連戰／界弦核心／Offline／Story／Final Completion；
- 高維正式 Story 11/11、共 322 頁；
- 高維10階稱號專屬視覺、Mirror 15～20 六階視覺；
- W3 Dungeon／Mirror／Void／特殊遭遇 fail-closed／高維競技場；
- 第16批 GM 正式管理三紀元合法範圍鎖定；
- 第16批後 Save Hook／Save Safety／Migration Staircase／Offline V4／Battle Pipeline／World Transition／Script Load Policy／World Combat Adapter／Legacy Global Alias／Save Writer Audit／Browser Smoke 等技術債收斂；
- 2026-09-30 本輪新增完成：第三紀元玩家說明收斂、GM 三紀元產裝與紀元顯示政策、W2/W3 正式進度管理 owner、GM Hub native renderer late binding、GM 正式資源／副本 transaction owner；
- current exact-head `Runtime Integrity #1200`、`Story Integrity #887`、`Pages build and deployment #5141` 均已通過。

本 handoff 更新本身只修改 `PROJECT_HANDOFF.md`，**不修改 JS／CSS／HTML／戰鬥／存檔功能**，所以本次不需要更新 `index.html` cache-bust。

目前正式開發狀態：

```text
第三紀元主要功能：完成
第14批：完成
第15批：完成
第16批：完成
第16批後優化 1～6：完成
2026-09-30 遊戲說明／GM 管理收斂 4 批：完成
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
26. GM native section registry 已改為 **late binding**；不要再恢復成「註冊時捕捉舊 renderer reference」，也不要重新加回已退休的 replace workaround。
27. GM W2/W3 進度重建邏輯已移到正式 progression management owner；`gmtools.js` 只負責 prompt／驗證／transaction adapter，不要把 Story／Title／Boss 重建公式塞回 UI adapter。
28. 正式 GM 資源與副本多欄位修改已統一走 `gmformaltransaction.js`＋shared settlement transaction；不要再改回直接 state mutation＋中途 save。
29. 第三紀元遊戲說明玩家版由 `thirdworldguidecopy.js` 的 stable item ID／integrity 管理；不要用中文標題字串當唯一 patch key，也不要重新露出 VIP20、30%掉裝、Stage/Core 後台數值。

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

不得 persist：run/deaths/suppression/active target/recent battle/summary/Fast Catch-up/player flow/Stage/abilities/5% front/title tier 等 runtime／derived state。

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

## 2026-09-30 GM／Guide 本輪舊資料結論

本輪新增的 Guide copy、GM phase UI、W2/W3 GM progress owner、GM transaction owner **都不改 persistent schema**，因此：

- 不升 Save Schema；
- 不新增 migration；
- 不替第16批 formal fixed value 加舊非法值 repair；
- W2 GM 進度重建只操作既有 `secondWorld.mainline.bossKilled` 與 shared Story history；
- W3 GM 進度重建只操作既有 Boss HP／Story／Title／completed；
- W3 `introSeen` 以 `thirdWorld.story.introSeen === true` **或** shared completedStories 含 intro ID 任一成立視為已看過，屬 apply-time defensive reconciliation，不是 migration；
- GM formal transaction 只改既有資源／daily／dungeon欄位，save 失敗由 shared transaction rollback。

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

- 存檔前做 serialization／容量診斷；
- 寫入後回報成功／失敗與容量級別；
- reset／GM JSON import 前建立 verified safety backup；
- pre-Schema16 load 先建立專用安全備份；備份失敗 fail-closed，原 localStorage 保留；
- future／too-old save 保護原始資料，不誤載。

## Migration Staircase V1

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

Global save writer audit 允許的鏈只有：

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

`battlepipeline.js` 與 W2/W3 sample consumer 已收斂到 shared `appendOfflineBattleSample()`。

---

# 7. 共用 Combat 與 Battle Pipeline

正式傷害基礎：

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

World Combat Adapter：world／state／civilization level → civilizationCombatDamageMultiplier → playerFinalDamageMultiplier → `runCombatCore()`。

目前已切入 shared Dungeon combat、第二紀元主線 combat；W2 文明 Lv10 final damage 仍為 ×1.50。

`battlepipeline.js` 已統整主線連續戰鬥、background lifecycle、Fast Catch-up、minimal mode、offline real-battle sample 與 Story-stop。

**W3 主線 permanent-HP combat 尚未切到 World Combat Adapter**，因其多了 formalStartHp／combatEndHp／永久 settlement basis；目前保留已驗證的專用正式鏈。

---

# 8. 高維主線：10 名高維存在／Stage／永久削血

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

# 9. 100死連戰／界弦核心／VIP20／Fast Catch-up

```text
最大死亡 = 100
每死壓制 = 0.50pt - coreLv × 0.04pt
Core Lv0：100死後最大HP約50%
Core Lv10：100死後最大HP約90%
```

界弦核心：Lv0～10；每級1,000,000,000維度之弦；總投入10,000,000,000。

Run：每輪 deaths=0；玩家死亡且目標未擊破才+1；successful combat＋settlement 才+1 battle；run start snapshot coreLv／suppression；run active 禁止 Core 注入；defeat／Stage crossed／5% front／aggregate progress／death-limit 結束整輪。

VIP20 death gear protection：正式引擎仍跑 shared 掉裝判定並阻止實際遺失；**玩家遊戲說明已不再公開 30%／VIP20 攔截等後台細節**。

Fast Catch-up：只縮短等待／演出，不額外發收益；正式 combat＋settlement 照常；W3 background／catch-up 不產 Offline sample。

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
- `thirdworldloot.js` 正式 factory 只允許 q=4/5。

W3 phase3 任意裝備處理：0金幣／0暗物質／0暗能量；殘留 W1/W2 裝備不能創造退休資源。

W3 lost gear UI hidden；進入W3時舊lost gear回背包；W3由VIP20阻止實際掉裝，不建立W3贖回經濟。

GM「產生高維紀元裝備」已正式加入角色管理：

- W3 才顯示；
- 可選 10 名高維存在、品質、部位；
- 品質只有傳說／神話；
- **預設神話**；
- 產裝使用正式 `makeThirdWorldEquipmentForBoss()`／W3 equipment factory，不維護平行裝備公式；
- 裝備等級採目前角色等級（W3 1000～2000）；
- 名稱依正式高維整體進度 band；
- GM UI 文案已移除 `sale owner` 等內部開發術語。

---

# 11. W3 Story／Completion

正式 Story：序章12頁；Stage1～9 各31頁；Final31頁；總計11篇／322頁。

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

# 12. 第三紀元玩家遊戲說明：2026-09-30 收斂完成

正式玩家 copy extension：

```text
THIRD_WORLD_GUIDE_PLAYER_COPY_VERSION = 2
THIRD_WORLD_GUIDE_COPY_INTEGRITY_VERSION = 1
```

`thirdworldguidecopy.js` 已替 W3 Guide item 建立 stable ID，不再只靠中文標題做定位。玩家版說明目前：

- 移除獨立 `VIP20 裝備保護`／`VIP 裝備保護` 條目；
- 不公開 30% 掉裝判定或 VIP20 攔截細節；
- 10 名高維存在個體特化只說明「各自不同，詳細看 Boss 卡」；
- Stage／共通能力不公開精確 ATK／DEF／百分比／門檻調參數值，詳細看 Boss 卡；
- 高維競技場正式顯示為已開放，不得退回「尚未開放」；
- 維度之弦／界弦核心／核心注入／高維稱號改成玩家導向說明，不公開 10億、0.50%、0.04% 等後台調參數值；
- 既有養成／極簡模式／存檔文案移除 owner/runtime 等開發用語。

`THIRD_WORLD_GUIDE_COPY_INTEGRITY_REPORT` 會檢查 stable ID、11個 replacement、2個 removal，以及 VIP20／30%／Stage／Core 後台數值是否重新洩漏。

`gameguide.js` 仍保留 canonical game rules snapshot；玩家 W3 copy 由正式 extension layer 控制。不要再新增標題字串 monkey-patch。

---

# 13. 玩家稱號

正式 catalog 36個：銀河文明災厄10／宇宙文明災厄10／鏡像戰6／高維紀元10。

高維10階：破界初臨／維外行者／超界之軀／高維真形／萬維共鳴／界律共主／維序凌駕／超維至尊／諸維唯一／萬維之上。

高維 renderer：

```text
player-title--higher-dimensional
player-title--higher-dimensional-1 ... -10
```

正式視覺 owner：`playertitleshigherdimensional.css`。高維稱號是同級不同理念，不掛第一紀元 `tier-*`。

Mirror 15～20 stable ABI 為 `player-title--mirror-v3`；六階字色／光感／殘影／aura 已拉開；Mirror異象層級仍高於高維稱號。

---

# 14. W3 Dungeon／Mirror／Void／速度／特殊遭遇

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

# 15. W3 高維競技場

正式模式：定相＝一輪三戰同一名隨機高維存在投影；異相＝三名不同投影、保證不重複。

三戰倍率：

```text
第一戰 HP 0.99   / Damage 0.9405 / DEF 1.287
第二戰 HP 1.1385 / Damage 1.0560 / DEF 1.320
第三戰 HP 1.287  / Damage 1.2045 / DEF 1.353
```

W3 Arena 不套 generic monster 30% crit/dodge cap；十名存在保留固定 specialization；不套 W3 主線 70%～10% 共通能力；界弦核心不參與 Arena。

一輪三戰：開始回滿HP；三戰間HP連續；輪結束回滿。每日 shared Arena limit 20；玩家可選 1／5／10／20 輪，不足次數 disabled，不自動縮短。

Lv1000 base points：`300 / 400 / 800 = 1500`。每+100Lv全部stage points +5%。實得為 shared VIP積分並吃既有 VIP dungeon multiplier。

W3 Arena transaction 支援 refresh／pagehide／中斷恢復：prepare成功後才扣daily；save fail rollback；active round中斷保留已消耗daily但清transaction並回滿HP，不追加其他處罰。

GM 500輪測試直接委派 formal Arena player snapshot／enemy builder／civilization combat options，不維護平行公式。

---

# 16. 宇宙紀元 Arena 高階平衡

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

# 17. GM 正式管理：最新三紀元政策

## 17.1 正式養成合法範圍

| 系統 | W1 銀河 | W2 宇宙 | W3 高維 |
|---|---|---|---|
| 專精 | Lv0～60，可管理 | 固定Lv60 | 固定Lv60 |
| 強化 | +0～+20，可管理 | +20～+40，可管理 | 固定+40 |
| 印記 | 未取得／Lv0～10，可管理 | 固定Lv10 | 固定Lv10 |
| 文明等級 | **整區不顯示** | Lv0～10，可管理 | 固定Lv10 |

### fixed value UI 最新規則

舊 handoff 的「disabled select＋disabled button」已失效。current main 最新規則：

- W2/W3 固定專精、固定印記，以及 W3 固定強化／文明，使用 **純固定值 `<div class="gm-formal-fixed-value">` 顯示**；
- **不產生 `<select>`、沒有下拉箭頭、iOS 不會跳 picker、沒有正式套用按鈕**；
- formal mutation 下層鎖仍保留；
- GM test sandbox 完全不受影響：專精0～60、強化0～40、印記0～10、文明0～10。

版本：

```text
GM_BATCH16_FORMAL_CONTROLS_VERSION = 1
GM_BATCH16_FIXED_VALUE_UI_VERSION = 2
GM_ENHANCEMENT_WORLD3_LOCK_VERSION = 1
GM_ENHANCEMENT_WORLD3_FIXED_VALUE_UI_VERSION = 1
```

## 17.2 角色管理：紀元顯示政策

**資源與主線進度只顯示「當前紀元」；歷史紀元產裝則累積保留供 GM 回測。**

| 當前紀元 | 正式資源按鈕 | 正式進度按鈕 | 可產生裝備 |
|---|---|---|---|
| W1 | 指定金幣 | 指定銀河紀元解鎖進度 | 銀河 |
| W2 | 指定暗物質＋指定暗能量 | 指定宇宙紀元進度 | 銀河＋宇宙 |
| W3 | 指定維度之弦 | 指定高維紀元進度 | 銀河＋宇宙＋高維 |

`GM_MANAGEMENT_PHASE_POLICY_VERSION = 1`。W1 完全隱藏文明等級 section；副本管理說明文字依 W1/W2/W3 phase-aware，不提前提未進入紀元。

## 17.3 宇宙紀元正式進度管理

正式 owner：`secondworldprogressmanagement.js`

```text
SECOND_WORLD_PROGRESS_MANAGEMENT_OWNER_VERSION = 1
GM adapter version = 2
```

GM 輸入：**已擊破 Boss 數 0～100**。

重建時：

- `secondWorld.mainline.bossKilled[100]` 重建成連續 true prefix；
- 前 N 隻 Boss 對應的100段宇宙 Story completion 同步；
- 往回調會移除超過進度的宇宙故事，但保留其他紀元 completedStories；
- pending universe story 清除；
- 呼叫 `normalizeSecondWorldCalamityState()` 讓災厄「出現」條件跟章末Boss同步；
- **不改文明等級、不改災厄 trueKills／30場養成、不改角色等級／EXP／資源。**

GM adapter 用 shared `runSettlementTransaction("gm-second-world-progress")` 落帳。

## 17.4 高維紀元正式進度管理

正式 owner：`thirdworldprogressmanagement.js`

```text
THIRD_WORLD_PROGRESS_MANAGEMENT_OWNER_VERSION = 1
GM adapter version = 2
```

GM 輸入：**攻略完成度 0～100% 整數**。

重建方式：

- 10 名 Boss 全部統一設定成相同完成度的永久剩餘 HP；
- 個別 Stage 由正式 Boss HP owner 自然推導；
- aggregate title tier、`story.unlockedStage`、高維 milestone stories、高維 titles 同步；
- 100% 時同步 Final Story、`story.finalSeen=true`、`thirdWorld.completed=true`；
- 往回調會收回超出目前 tier 的高維稱號與 milestone completion，但保留 W1/W2/Mirror 等其他稱號與故事；
- 高維 intro 已看判定為 `thirdWorld.story.introSeen===true || completedStories includes introId`；往回調到0%不會誤清已看 intro；
- **不改角色等級、EXP、維度之弦、Core Lv／progress、裝備、其他紀元資料。**

GM adapter 用 shared `runSettlementTransaction("gm-third-world-progress")` 落帳。

## 17.5 GM Hub renderer late binding

`gmhubextensions.js` native sections 現在註冊 `lateWindowRenderer(name)`，每次 render 才讀取當下最新 `window.gm...Html`，不再在 registry 註冊時捕捉舊 function reference。

```text
GM_HUB_NATIVE_LATE_BINDING_VERSION = 1
GM_HUB_NATIVE_LATE_BINDING_INTEGRITY_VERSION = 1
```

已退休：`gmbatch16formalcontrols.js`／`enhancementworld3gm.js` 針對 native section 的 `replaceGmHubSectionRenderer()` workaround。`replaceGmHubSectionRenderer()` API 本身保留給真正需要動態替換的 extension。

## 17.6 GM 正式 transaction owner

正式 owner：`gmformaltransaction.js`

```text
GM_FORMAL_TRANSACTION_OWNER_VERSION = 1
GM_FORMAL_RESOURCE_TRANSACTION_VERSION = 1
GM_FORMAL_DUNGEON_TRANSACTION_VERSION = 1
GM_FORMAL_DAILY_RESET_TRANSACTION_VERSION = 1
```

正式資源：

- W1 金幣；
- W2 暗物質／暗能量；
- W3 維度之弦；
- 嚴格 phase guard，輸入必須為0以上整數；
- 走 shared `runSettlementTransaction()`，save fail／mutation fail rollback。

副本／VIP多欄位套用現在為單一 atomic transaction：VIP積分、懸賞daily used、Arena daily used、Void歷史最高、Void當日最高、Void claimed 一次落帳。

「重置今日副本」現在單一 transaction 同步重置：懸賞／競技場／Void daily／Mirror daily；Void歷史最高、Mirror歷史最高與神蹟紀錄保留。transaction 中不再呼叫會自行中途 `save()` 的舊 wrapper，因此只在整批 mutation 成功後存一次。

`GM_FORMAL_TRANSACTION_INTEGRITY` 會測 W1/W2/W3 資源 phase guard 與 dungeon atomic mutation。

---

# 18. 第16批後與 2026-09-30 已完成的架構收斂

以下不再列為 TODO：

1. Save Hook convergence：Save Safety／Cloud metadata／W3 transient cleanup 走正式 hook registry；W3 save guard 不再包 `save()`。
2. Save Safety／Migration Staircase：容量診斷、verified backup、future/legacy fail-closed、V1/V9/V15/V16 migration fixture regression 完成。
3. Offline owner convergence：V4 canonical sample、每倍速8筆、legacy V1/V2 safe discard、V3→V4 migration、W1/W2/W3 sample consumer 收斂。
4. Battle Pipeline cleanup：background lifecycle／Fast Catch-up／real battle timing／sample append／story-stop shared owner。
5. World Transition single-install guards：bounty／offline phase guards 不重複安裝。
6. Script Load Policy V3：GM／Story／Integrity deferred/low-priority；core/world startup critical。
7. Legacy Global Alias cleanup：SAVE_VERSION／MAX_LEVEL read-compatible-no-duplicate-write。
8. World Combat Adapter V1：Dungeon＋W2主線共用文明 final-damage → `runCombatCore()` adapter。
9. Global Save Writer Audit：CI 永久掃描未授權 save writer。
10. Runtime Browser Smoke：真實 Chromium 驗證正式頁面 owner、hooks、W3 Dungeon、Arena、Save、Offline、Adapter、Legacy alias。
11. W3 玩家遊戲說明 stable item ID／player-copy／copy integrity 收斂。
12. GM Hub native renderer late binding；native replace workaround 退休。
13. W2/W3 GM progress rebuild 從 `gmtools.js` 收回正式 world progress management owner。
14. GM 正式資源／副本 management 走 shared transaction／rollback owner。
15. GM 管理頁三紀元 resource／progress／gear visibility policy 收斂。

---

# 19. 重要 bug 修正／風險收斂

已完成的重要修正包括：

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
26. W2/W3專精／印記 fixed value UI仍可點 → **改成純固定值 div、無 select、無套用按鈕**。
27. GM Hub registry 曾保存舊 renderer reference，導致 iOS 還跳 picker → native late binding，replace workaround退休。
28. `compatibilityowners.js`重複寫 `window.MAX_LEVEL` → duplicate write退休。
29. `thirdworldcombatsaveguard.js`後載再包 `save()` → before-save hook。
30. Save Safety Browser Smoke 曾檢查錯 hook ID → 對齊正式 `save-capacity-diagnostic`。
31. Save writer audit 曾把區域變數／測試字串誤判 global writer → 精確白名單／排除 false-positive。
32. GM 角色管理在 W2/W3 顯示錯紀元資源／銀河進度 → current-phase resource/progress policy。
33. W1 提前顯示「文明等級管理」 → W1整區隱藏。
34. 副本 GM 說明提前暴露高紀元 → phase-aware copy。
35. W2 缺正式「指定宇宙紀元進度」 → `secondworldprogressmanagement.js` owner＋Story sync。
36. W3 缺正式「指定高維紀元進度」 → `thirdworldprogressmanagement.js` owner＋Boss HP／Title／Story sync。
37. W3 GM progress 早期 Schema16 `introSeen=true` 但 completedStories缺 intro 時可能被清 → OR-compatible defensive reconciliation。
38. GM 資源／副本多欄位直接 mutation、wrapper 中途save可能半套落帳 → `gmformaltransaction.js` atomic transaction。
39. GM「產生高維紀元裝備」缺失 → 正式 factory、只傳說／神話、預設神話。
40. W3 玩家 Guide 仍洩漏 VIP20／30%／Stage／Core 後台調參 → stable ID player-copy＋integrity 防退化。

---

# 20. 尚未完成／未來可優化

以下才是 current main 真正尚未完成或有意延後的項目；**不要把已完成的第16批、優化1～6、或 2026-09-30 GM／Guide 4批重新做一次。**

## 20.1 已知技術債／可再優化

1. **Offline save compatibility wrapper**  
   `offlineprogress.js` 仍是唯一經 audit 允許的 save wrapper。未來若要完全零 wrapper，先擴充 Save Hook Core 提供「skip base write but success」或等價 primitive，再以 Browser regression 證明 offline settlement／heartbeat／pagehide 完全等價。

2. **World Transition compatibility guards**  
   `worldtransitionsafety.js` 仍以 single-install wrapper 為 bounty／W2 Offline begin/finish sample 補 phase gate。只有對應正式 owner 有原生 phase gate 後才可移除。

3. **SaveVersionGuard late wrappers**  
   resetGame／GM import safety backup guard、load／migrate compatibility wrapper 仍在 `saveversionguard.js`；屬資料保護層，不可為形式上的零 wrapper直接刪除。

4. **W3 主線 Combat Adapter 共用化**  
   若要把 W3 主線切 `runWorldCombatCore()`，必須先建立 fixed-RNG＋formalStartHp/combatEndHp＋death settlement regression，證明永久削血、汲取上限、stale guard、rollback 完全不變。

5. **效能／載入後續觀察**  
   Script Load Policy V3 已完成第一輪分組；後續以手機實機載入、首次互動、GM頁／Story頁體感決定是否再 code-split／defer。

6. **GM Hub 檔案責任仍偏大（低優先）**  
   `gmhub.js` 同時承擔三紀元角色管理 UI、產裝與多種 test renderer；未來若有第四紀元或管理功能再增長，可考慮每世界提供管理 fragment renderer，再由 Hub 組裝。現況功能正常，不急拆。

7. **formal fixed-value inline style（低優先）**  
   `gm-formal-fixed-value` 仍含少量 inline style；未來可純 CSS class 化。這只是整潔度，不是功能問題。

## 20.2 設計上尚未定案

1. 低維輪迴／轉生／reset 系統尚未定案，不可自行新增。
2. 10 名高維存在、W3 Arena、W2 Arena 最終數值若要再調整，必須依使用者正式實測資料；目前 main 係數視為正式現況。
3. 額外 W3 背景／動畫／視覺特效未另行定案，不自行擴充。
4. 不新增 W3 特殊怪、專精、印記、文明、強化、強化石、怪物特性、文明災厄第二套系統。
5. 已完成的11篇／322頁 W3 Story 不得自行覆寫。

---

# 21. Integrity／CI 現況

current functional HEAD `2d57568b4f19a78c291561c15c5db79223fe2cf9`：

- Runtime Integrity #1200：success；
- 真實 Chromium Browser Runtime Smoke：success；
- Unlimited VIP integrity：success；
- GM mainline HP lock integrity：success；
- Background asset integrity：success；
- Project documentation integrity：success；
- Story Integrity #887：success；
- Pages build and deployment #5141：success。

本輪新增／重要 integrity：

```text
THIRD_WORLD_GUIDE_COPY_INTEGRITY
GM_HUB_NATIVE_LATE_BINDING_INTEGRITY
SECOND_WORLD_PROGRESS_MANAGEMENT_INTEGRITY
THIRD_WORLD_PROGRESS_MANAGEMENT_INTEGRITY
GM_FORMAL_TRANSACTION_INTEGRITY
GMBATCH16 / enhancement / civilization existing regressions
```

任何未來功能修改仍要以 exact current HEAD Actions 回傳為準，不可沿用本節舊綠燈宣稱新提交已綠。

---

# 22. current main 重要 owner 索引

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

## Guide

```text
gameguide.js
thirdworldguidecopy.js
mirrordungeonguide.js
cloudsaveguide.js
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
mirrordungeonstate.js
mirrordungeonrun.js
mirrordungeonui.js
dungeonvoid.js
dungeonvoidui.js
specialencounter.js
combatspeed.js
```

## GM formal／sandbox／progress management

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

# 23. 目前正式完成鏈

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
→ pure fixed-value formal UI（無select／無套用）
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
→ W3 GM gear generator（legendary/mythic，default mythic）
→ W2 formal progress management owner
→ W3 formal progress management owner
→ GM Hub native renderer late binding
→ GM formal resource/dungeon transaction owner
→ exact-head Runtime / Story / Pages green
```

目前沒有下一個必做的「功能批次」。下一階段以實機遊玩、數值觀察、使用者指定的新功能，或第20節列出的延後技術債為主。

---

# 24. 下一個對話如何接手（標準指令）

新對話若只要承接、先不修改，直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。`main` 是唯一真實來源，不要只靠 handoff、舊對話或舊設計文件。請先確認 current main 的正式 owner、Save／Offline／Combat／GM／Arena／Story／Guide／Integrity 現況，以及 handoff 第20節真正尚未完成／未來可優化項目。現在先不要修改，只回報承接狀態與你重新檢查後的現況。

若之後使用者要求修改，標準施工原則：

> 修改前 fresh read current `main` 的相關正式 owner；優先改正式來源，不新增 wrapper、fallback、第二套公式或第二套 owner。使用者說「先討論／先檢查／先不要修改」就不能改；說「做／修改／執行／第 N 批」即可直接改 main。JS／CSS 改動同步更新 `index.html` cache-bust。修改後 fresh read、compare base→head、自我檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Story（若相關）／Pages，只有 Actions 實際回傳成功才可宣稱綠燈。