# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-27（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要、已完成系統索引，以及「尚未實作但已確認」的設計基準。若本檔、舊對話、舊 Word、舊規格或記憶與 current `main` 衝突，**一律以 current `main` 為準**。

---

# 0. 本次交接重新驗證

本次交接不是只靠對話記憶，已重新讀取 current `main` 實際程式碼。

更新本檔前的 main HEAD：

`afa54f79708a4d0fd3b955cb13583989a41a664d`

已重新確認的 current runtime：

- `savemigration.js`：正式 `SAVE_SCHEMA_VERSION = 16`、Load Pipeline V2、Normalization Pipeline V2。
- `worldphase.js`：正式 `WORLD_PHASE_VERSION = 6`，世界為銀河／宇宙／高維三階段。
- `thirdworldphase.js`：正式 `THIRD_WORLD_PHASE_VERSION = 3`，第三紀元 persistent state、七項入場條件、entry reconciliation 均已進 runtime。
- `levelprogression.js`：第三紀元 Lv.1000～2000 與固定 10,000,000 EXP／級已正式完成。
- `thirdworlddata.js`：正式 `THIRD_WORLD_DATA_VERSION = 5`；十王 metadata、階段、能力 descriptor、5pp、總進度、稱號門檻均已完成。
- `vipgm.js`：GM 測試角色已正式支援三紀元，World3 可測 Lv.1000～2000，並使用共用裝備公式產生高維神話預測裝備。
- `civilizationcore.js`：文明最終傷害已改為 World Phase 共用 owner，World2／World3 共用文明倍率，World1 不套用。
- `gmpowerbenchmarkworldphase.js`：既有 GM 戰力基準已接上三紀元 World Phase adapter，沒有另建 World3 戰力引擎。
- Runtime Integrity 最新已完整通過：198 個 JavaScript 檔案、VIP、GM HP lock、背景素材、Documentation Integrity 全數成功。

本次只更新 `PROJECT_HANDOFF.md`，**沒有做其他功能修改**。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先重新讀取相關 actual code，不得只依賴本檔、對話記憶或舊規格。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不需要再問一次確認。
4. 每批修改前：
   - 先重新讀 current `main` 相關 owner；
   - 確認沒有別的 commit 已經改過同一區；
   - 以 current main 為 base。
5. 每批修改後：
   - 重新讀 current main 實碼；
   - compare base → head；
   - 自我檢查 UI／邏輯／資料寫入／舊檔相容；
   - 跑可用的 Integrity／CI；
   - 回報受影響檔案與 exact main HEAD SHA。
6. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。**
7. 優先修改正式 owner；**不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline**。
8. 只有在正式 owner 已存在、且真的需要跨模組銜接時，才允許薄 adapter／policy layer。
9. 第一／第二／第三紀元能共用的規則，優先做 shared owner，不要把三個世界切成三套平行系統。
10. GM sandbox／benchmark state 不得污染正式 save。
11. 若現有架構已有 registry／hook／policy owner，優先掛進既有 owner，不要多層 monkey-patch。
12. 第三紀元未定案內容不可自行補故事、最終結局或競技場正式規則。

---

# 2. 專案定位與正式世界結構

《文明戰線》是純前端、文字／數值養成、科幻星際 RPG，支援桌機與手機；iPhone Safari 是重要實機環境。

正式世界：

- **銀河紀元**：Lv.1～500。
- **宇宙紀元**：Lv.501～1000。
- **高維紀元**：Lv.1000～2000 的第三紀元；目前 foundation、等級 owner、十王 data／規則 owner、GM 測試基礎已完成，**正式高維戰鬥／結算／連戰／loot／offline／玩家 UI 尚未完成**。

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

進入 World3 後：

- World1／World2 仍保留歷史與回顧；
- 不再產生第一／第二紀元正式成長；
- World3 為正式 progression phase。

---

# 3. Save／Migration／第三紀元 persistent state

正式 save key：

`frank_text_rpg_save`

目前版本：

```text
SAVE_SCHEMA_VERSION = 16
SAVE_LOAD_PIPELINE_VERSION = 2
SAVE_NORMALIZATION_PIPELINE_VERSION = 2
SAVE_LEGACY_SUPPORT_POLICY_VERSION = 1
```

future save 採 fail-closed。

Normalization order：

```text
worldPhase.secondWorld
→ worldPhase.thirdWorld
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

Schema16 重要規則：

- Schema1～15 若夾帶 `thirdWorld`，視為不可信舊資料並丟棄。
- 升 Schema16 前建立 `.pre-schema16-backup-v1` 原始 localStorage 備份。
- `world=3` 裝備只有 source schema ≥16 才接受。
- GM transient test state 不得寫入正式 save。

## 3.1 ThirdWorld persistent allowlist

`thirdworldphase.js` 正式只允許：

```text
thirdWorld:
- entered
- completed
- entryVersion
- dimensionalStrings
- coreLevel
- bosses[].currentHp
- story.introSeen
- story.unlockedStage
- story.finalSeen
```

以下必須維持 transient，不得存入 save：

- 本輪玩家死亡數
- 死亡壓制層數
- 目前連戰 target
- 當場 combat runtime
- 暫時 ability 狀態
- battle spirit stacks
- revenge pending 狀態
- 其他只屬單場／單輪的 combat context

## 3.2 Entry reconciliation

`THIRD_WORLD_ENTRY_RECONCILIATION_VERSION = 1`

早期 Schema16／GM／測試資料若：

```text
thirdWorld.entered = true
entryVersion < 1
```

會一次性：

- 保證 `secondWorld.entered = true`
- 暗物質清 0
- 暗能量清 0
- lostGear 免費歸還 inventory
- pending black market 清除
- 舊 offline context 截止
- `entryVersion = 1`

之後不重跑。

---

# 4. World Phase 共用架構

正式 owner：`worldphase.js`。

目前共用：

```js
currentWorldPhase()
isWorldEntered()
worldProgressionEnabled()
worldPhaseSnapshot()
primaryWorldResourceSnapshot()
worldPhaseSpecializationRequirement()
worldPhaseEnhancementRequirement()
worldPhaseMarkRequirement()
summarizeWorldEntryRequirements()
runWorldTransition()
```

World metadata：

```text
1 galaxy / 銀河紀元
2 universe / 宇宙紀元 / secondWorld
3 higher-dimensional / 高維紀元 / thirdWorld
```

`worldIndex` 必須為精確整數 1～3。

World3 primary resource：

```text
維度之弦 = state.thirdWorld.dimensionalStrings
```

## 4.1 進入第三紀元七項條件

全部成立才可進入：

1. Lv1000
2. 宇宙紀元已 entered＋第100王擊破＋宇宙最終故事完成
3. 五部位強化 +40
4. 文明等級 Lv10
5. VIP ≥20（由 `vipPoints` source of truth 推導）
6. 8 專精全部 Lv60
7. 10 印記全部 Lv10

進入後保留：

- 等級／EXP
- VIP
- 已裝備與背包裝備
- +40 強化
- 8 專精
- 10 印記
- 文明 Lv10
- 鏡像／虛空進度
- 稱號與歷史紀錄

進入後清除／截止：

- 暗物質
- 暗能量
- pending black market
- World2 offline context／pending settlement
- lost gear 先免費歸還 inventory

---

# 5. 第一／第二紀元仍然是正式共用來源

第三紀元不得把成熟的第一／第二紀元系統複製一份。

目前仍應優先共用：

- `combatcore.js`
- `combatmath.js`
- `specialization.js`
- `markcore.js`
- `vipprogression.js`
- `viplootcore.js`
- 裝備 stat／affix 公式
- `enhancementcore.js`
- `playertitlecore.js`
- `offlinestatecore.js`
- `offlineprogress.js`
- `combatfx.js`
- World Phase／save normalization owner

第二紀元正式主線 Boss 基準仍為：

```text
BASE_STAT = 2700
HP : ATK : DEF = 12 : 2 : 1
N = 0..99
M(N) = 1 + 0.015*N
HP  = ceil(2700*12*M)
ATK = ceil(2700*2*M)
DEF = ceil(2700*1*M)
```

Lv505：

```text
HP 32,400
ATK 5,400
DEF 2,700
```

Lv1000：

```text
HP 80,514
ATK 13,419
DEF 6,710
```

第二紀元第10文明災厄約：

```text
ATK ≈ 14,761
DEF ≈ 7,046
```

這也是第三紀元 Boss 起始 ATK 不宜低於第二紀元畢業內容的重要平衡基準。

---

# 6. 第三紀元等級／EXP owner（已完成）

正式 owner：`levelprogression.js`。

目前：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

`effectiveLevelCap()`：

```text
World1 → 500
World2 → 1000
World3 → 2000
```

第三紀元：

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：EXP need = 0
```

Lv2000 時：

- EXP 不再累積；
- `state.exp = 0`；
- 但未來正式 World3 battle／維度之弦／裝備／Boss 進度仍可繼續。

重要 helper：

```js
thirdWorldExpNeed(level)
effectiveExpNeed(level,target)
effectiveLevelCap(target)
normalizeLevelProgressionState(target)
gainEffectiveExp(amount,logs)
levelProgressSnapshot(target)
```

`thirdWorldExpNeed()` 嚴格邊界：

```text
999 → 0
1000 → 10,000,000
1999 → 10,000,000
2000 → 0
2001 → 0
```

## 6.1 Level cap 舊世界相容

`levelcap.js` 現行：

- World1 滿等後，一般／菁英／Boss EXP 可 1:1 轉金幣。
- World2／World3 滿等不做金幣轉換。
- World2／3 的 cap 行為交由正式 level owner／settlement owner 處理。

## 6.2 Level audit

`levelprogressionaudit.js`：

```text
LEVEL_PROGRESSION_AUDIT_VERSION = 2
```

World3 audit 語意不是「幾隻同級普通怪升級」，而是：

```text
progressionMetric = permanentBossHpDamage
permanentDamageNeeded = 10,000,000
sameLevelNormalKills = null
```

這是之後第6批正式 settlement 的驗證基準。

## 6.3 Save migration regression 已覆蓋

已測：

- Schema16 World3 Lv1000
- Schema16 World3 Lv1500
- Schema16 World3 Lv2000
- 偽造 World2 Lv1500 → clamp 1000
- Schema15 偽造 World3 Lv1500 → 丟棄 thirdWorld，clamp 1000

---

# 7. 第三紀元十王資料 owner（已完成）

正式 owner：`thirdworlddata.js`。

```text
THIRD_WORLD_DATA_VERSION = 5
THIRD_WORLD_DATA_INTEGRITY_VERSION = 3
```

`thirdworldphase.js` 仍是 persistent shape／Boss HP bound owner；`thirdworlddata.js` 不重複持久化資料。

## 7.1 十王固定資料

每王最大 HP：

```text
1,100,000,000
```

十王總 HP：

```text
11,000,000,000
```

十王：

1. 破界天裁 — 高攻
2. 永劫重垣 — 高防
3. 宿因天秤 — 高暴
4. 無相彼岸 — 高閃
5. 萬象迴演 — 連擊
6. 維隙之刃 — 穿透
7. 逆因輪轉 — 反擊
8. 噬界深淵 — 汲取
9. 先驗之瞳 — 先制
10. 高維原點 — 均衡

stable persisted order：

```text
higher-dimensional-boss-01
...
higher-dimensional-boss-10
```

## 7.2 十王共同基準能力

正式 current baseline：

```text
HP：1,100,000,000
ATK：15,000
DEF：10,000
暴擊：10%
閃避：10%
先制 bonus：60%
連擊：30%
穿透：30%
反擊：30%
汲取：30%
```

此 ATK／DEF 已由原草案 8,000／8,000 調整為 current main 的 **15,000／10,000**。

## 7.3 十王個體特化

```text
破界天裁：ATK ×1.15
永劫重垣：DEF ×1.15
宿因天秤：暴擊 +6pp
無相彼岸：閃避 +6pp
萬象迴演：連擊 +10pp
維隙之刃：穿透 +10pp
逆因輪轉：反擊 +10pp
噬界深淵：汲取 +10pp
先驗之瞳：先制 +20pp
高維原點：ATK ×1.08、DEF ×1.08
```

特化是在共同 base＋stage 上套用。

---

# 8. 第三紀元 Boss 階段規則（已完成 data owner）

Boss HP 以正式 `currentHp` 判定 stage：

```text
>90%      stage 0
≤90%      stage 1
≤80%      stage 2
≤70%      stage 3
≤60%      stage 4
≤50%      stage 5
≤40%      stage 6
≤30%      stage 7
≤20%      stage 8
≤10%      stage 9
0%        defeated，但 stage 表示仍為 9
```

每跨一階固定增加：

```text
ATK +600
DEF +1,200
暴擊 +2pp
閃避 +2pp
```

共同 Boss stage9（未算個體特化）：

```text
ATK 20,400
DEF 20,800
暴擊 28%
閃避 28%
```

階段能力 descriptor：

```text
70%：鎮心
    玩家最終暴擊率 -5pp

60%：壓制
    玩家最終閃避率 -5pp

50%：韌性
    玩家「暴擊額外傷害部分」降低 30%

40%：復仇
    玩家暴擊後，Boss 下一次成功命中的攻擊必定暴擊

30%：反噬
    玩家受到實際 HP 傷害後，15% 機率反射其中 30%

20%：無視
    Boss 攻擊 5% 機率完全無視玩家 DEF

10%：戰意
    戰鬥開始 75% 機率啟動
    每回合 ATK +2%
    最多 10 層
```

目前這些只是 **descriptor／data owner**；真正的戰鬥執行要在第5批接進 shared `combatcore.js`，不得在 data 檔內執行戰鬥。

---

# 9. 5pp 高維戰線規則（已完成 data owner）

正式 5pp 判斷使用 HP 整數差，不以浮點顯示百分比當 authority。

每王 5pp 對應：

```text
1,100,000,000 × 5% = 55,000,000 HP
```

規則：

> 若目標王目前 HP 比「最高存活王」少 **55,000,000 HP 以上**，則下一場不可挑戰。

等價例：

```text
100.0% vs 95.1% → 可打
100.0% vs 95.0% → 鎖定
```

重要：

- 只計算存活 Boss。
- 已死亡 Boss 退出 5pp。
- 只剩最後一隻存活 Boss 時，不受 5pp 限制。
- 已死亡 Boss 不可作為正式 challenge target；未來回顧另走 review mode。
- challenge legality 只在 battle start resolve。
- 一場已合法開始的戰鬥，即使途中跨過 5pp，也要完整打完並結算；下一場才重新判定。

正式 API：

```js
thirdWorldChallengeStatus()
thirdWorldChallengeAllowed()
canChallengeThirdWorldBoss()
```

`allowed`＋`gapHp` 是 authoritative；`gapPoints`／顯示百分比只供 UI。

Snapshot policy：

```text
battle start resolve 一次
同一 combat run 重用
settlement 後 refresh
Boss HP mutation 後 refresh
不做 global cache
不在每 combat tick 重算
```

---

# 10. 第三紀元總進度／稱號 metadata（data owner 已完成）

Aggregate snapshot：

```js
thirdWorldBossAggregateSnapshot()
```

會提供：

- bossCount
- aliveCount
- defeatedCount
- currentHp
- maxHp
- overallRemainingPercent（0～100）
- remainingPercentSum（0～1000）
- aliveBossIndexes
- defeatedBossIndexes
- bosses[]

注意兩種百分比語意：

```text
overallRemainingPercent：十王總 HP 相對 110 億的 0～100%
remainingPercentSum：十王每隻百分比相加，滿血 = 1000%
```

高維十稱號 metadata／門檻：

```text
≤900%  破界初臨
≤800%  維外行者
≤700%  超界之軀
≤600%  高維真形
≤500%  萬維共鳴
≤400%  界律共主
≤300%  維序凌駕
≤200%  超維至尊
≤100%  諸維唯一
0%     萬維之上
```

目前只有 pure metadata／tier derivation；**尚未正式 grant 到玩家稱號 state**。

稱號正式授予與 UI 要在後續接 `playertitlecore.js`，不可另建 `thirdWorld.titles`。

---

# 11. 第三紀元自然進度與平衡基準

十王總 HP：

```text
11,000,000,000
```

Lv1000 → Lv2000 所需總 EXP：

```text
10,000,000 × 1000 = 10,000,000,000
```

未來第6批正式規則：

```text
1 點有效永久淨削血 = 1 EXP = 1 維度之弦
```

因此若 5pp 讓十王大致均衡推進，總進度和等級天然接近：

```text
十王 100% → 玩家約 Lv1000
十王 90%  → 玩家約 Lv1110
十王 80%  → 玩家約 Lv1220
十王 70%  → 玩家約 Lv1330
十王 60%  → 玩家約 Lv1440
十王 50%  → 玩家約 Lv1550
十王 40%  → 玩家約 Lv1660
十王 30%  → 玩家約 Lv1770
十王 20%  → 玩家約 Lv1880
十王 10%  → 玩家約 Lv1990
```

這個同步目前視為正式設計優點，不要任意改第三紀元 EXP 曲線。

## 11.1 目前同級神話＋40＋文明10＋既有養成的能力參考

現有正式 formula 下，約為：

```text
Lv1000  HP 49,336  ATK 13,019  DEF 6,067
Lv1100  HP 54,246  ATK 14,317  DEF 6,672
Lv1200  HP 59,156  ATK 15,615  DEF 7,277
Lv1300  HP 64,067  ATK 16,913  DEF 7,882
Lv1400  HP 68,977  ATK 18,211  DEF 8,487
Lv1500  HP 73,887  ATK 19,509  DEF 9,091
Lv1600  HP 78,798  ATK 20,807  DEF 9,696
Lv1700  HP 83,708  ATK 22,105  DEF 10,301
Lv1800  HP 88,619  ATK 23,403  DEF 10,906
Lv1900  HP 93,529  ATK 24,701  DEF 11,511
Lv2000  HP 98,440  ATK 25,999  DEF 12,115
```

JS 浮點＋`Math.ceil` 可能使部分 HP 比舊設計表高 1 點，屬正常公式結果。

現有傷害公式核心：

```text
max(1, ceil((ATK - DEF × 0.55) × random(0.95～1.05)))
```

文明 Lv10 正式最終傷害倍率：

```text
+50% = ×1.50
```

---

# 12. GM 三紀元測試基礎（已完成，但高維正式 GM 尚未完成）

## 12.1 GM 測試角色

`vipgm.js` 已正式支援：

```text
銀河紀元：Lv1～500
宇宙紀元：Lv500～1000
高維紀元：Lv1000～2000
```

GM 測試角色與正式 progression 解鎖脫鉤，不修改正式角色。

切換紀元／等級時：

- World1：沿用既有 Boss 裝備生成。
- World2：沿用第二紀元 Boss 裝備 owner。
- World3：使用既有正式裝備 stat／affix formula 生成同級神話預測裝備。

World3 預測裝備直接共用：

```js
mainStatForType()
mainStatValue()
rollAffixes()
addItemStat()
```

固定 `q = 5` 神話，只是測試預測，不是正式掉落 owner。

沒有建立第二套：

```text
gmThirdWorldPlayer
thirdWorldTestStats
thirdWorldTestEquipmentFormula
```

## 12.2 文明傷害共用 owner

`civilizationcore.js`：

```js
civilizationCombatDamageMultiplier({ world, civilizationLevel })
```

規則：

```text
World1 → ×1
World2 → 套文明等級
World3 → 套保留下來的文明等級
```

World2／3 共用一套文明傷害 owner。

## 12.3 GM 戰力基準 World Phase adapter

`gmpowerbenchmarkworldphase.js` 已新增，但它只是薄 adapter，不是新戰鬥引擎。

它把既有：

```js
gmPowerBenchmarkRunOutput()
gmPowerBenchmarkRunCombat()
gmPowerBenchmarkSnapshot()
gmPowerBenchmarkSummaryText()
gmPowerBenchmarkHtml()
```

接上目前測試 World Phase。

可正確顯示：

```text
高維紀元角色｜Lv.xxxx
角色紀元：高維紀元
文明等級：Lv.x｜高維紀元最終傷害
```

注意：**這不等於第10批正式高維 Boss／100死 benchmark 已完成。**

目前只完成「三紀元測試角色基礎＋共用文明倍率＋World Phase adapter」。

---

# 13. Runtime Integrity／本次對話的重要修正

本次對話期間，除了完成 World3 等級／資料／GM foundation，也整理了多個已過期的 CI assertion。

已修正：

- Runtime Integrity 不再要求舊 `SAVE_SCHEMA_VERSION = 15`。
- Level Progression Audit assertion 已由 V1 對齊 V2。
- `MAX_LEVEL` audit whitelist 已允許 canonical integrity owners。
- Handoff docs-integrity 不再強迫舊的「雙紀元下一階段」文字。
- Pending docs-integrity 不再用舊開發階段句型卡住 current third-world implementation。
- 沒有為了讓 CI 綠燈而把正式 runtime 降回舊版本。

最後確認的 Runtime Integrity：

```text
198 JavaScript files parsed ✅
Canonical source contract ✅
Save compatibility policy ✅
GM World3 test character ✅
Load order ✅
Unlimited VIP Integrity ✅
GM mainline HP lock Integrity ✅
Background Asset Integrity ✅
Documentation Integrity ✅
Runtime Integrity workflow SUCCESS ✅
Pages deployment SUCCESS ✅
```

本次對話完成後的 functional baseline 仍以 current main 為準。

---

# 14. 尚未完成／禁止誤認為已完成

目前 **尚未完成**：

- `thirdworldcombat.js` 正式高維戰鬥 core
- Boss 端 ability 真正 combat execution
- 正式永久削血 settlement
- 維度之弦正式發放
- World3 正式 EXP settlement
- World3 正式 loot/drop
- 100 死連戰
- 界弦核心升級／死亡壓制 runtime
- World3 正式 offline loot settlement
- World3 玩家高維戰線 UI
- 已死十王正式回顧模式
- 高維稱號正式 grant
- 高維劇情 trigger framework
- 高維具體故事文本
- 十王全滅最終事件
- 第三紀元競技場正式規則
- 第10批完整高維 GM benchmark／管理頁

目前 `thirdworlddata.js` 是 pure rule/data owner，**不能把它誤當正式 combat／settlement 已完成**。

---

# 15. 後續施工順序：第5～第10批

以下為下一個對話正式承接順序。

## 第 5 批：高維正式戰鬥核心

這是第三紀元最關鍵的一批。

建立：

```text
thirdworldcombat.js
```

但**不得自己重做一套 combat engine**。

要盡量接：

- `combatcore.js`
- `combatmath.js`
- `specialization.js`
- `markcore.js`
- VIP combat／stats owner
- 裝備能力
- enhancement combat owner
- civilization damage owner
- `combatfx.js`

第三紀元只增加 Boss 端 World3 規則：

基礎戰鬥能力：

- 先制
- 連擊
- 穿透
- 反擊
- 汲取

高維階段能力：

- 鎮心
- 壓制
- 韌性
- 復仇
- 反噬
- 無視
- 戰意

以及十王各自特化。

### 第5批最重要規則

高維 Boss 汲取：

```text
本場回血上限 = 本場開始正式 HP
```

例如某王歷史上已從 11 億削到 8 億，本場開始正式 HP = 8 億；本場即使汲取，也只能回到 8 億，**不能補回歷史永久削掉的 3 億**。

因此 `thirdworldcombat.js` 必須把：

```text
formalStartHp
combatCurrentHp
healCap = formalStartHp
```

分清楚。

### 第5批完成標準

先做到：

> 一次 **headless 高維單場戰鬥** 可以正確跑完並回傳結果。

這一批：

- 可以建立正式 combat adapter／context；
- 可以跑玩家 vs 高維 Boss；
- 必須正確吃現有玩家能力；
- 必須正確執行 Boss ability；
- 必須正確處理 Boss heal cap；
- **先不要做 UI 連戰**；
- **先不要做永久削血正式 settlement**。

### 第5批架構原則

建議：

```text
thirdworlddata.js
    ↓ metadata / stage / ability descriptors
thirdworldcombat.js
    ↓ 將 descriptor 轉成 shared combatcore 可理解的 options/context
combatcore.js
    ↓ 實際共用戰鬥
```

如果 shared `combatcore.js` 缺 Boss-side hook，優先擴充 shared combat option／hook，而不是在 `thirdworldcombat.js` 複製整個回合引擎。

---

## 第 6 批：永久削血＋維度之弦＋正式結算

建立：

```text
thirdworldprogress.js
```

核心：

```text
有效永久削血
= max(0, 場初正式 HP - 場末正式 HP)
```

獎勵：

```text
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

注意 Boss 本場汲取後，必須用**本場最終正式 HP**算淨削血，不是用玩家總輸出。

正式 settlement 順序固定：

1. 戰鬥完成
2. 王 HP 寫回
3. 算永久淨削血
4. 發 EXP
5. 發維度之弦
6. 裝備掉落
7. 升級
8. 稱號／劇情
9. 王死亡
10. 強化跨階
11. 5pp
12. 決定是否續戰

若實作時需要更細的內部 sub-step，可以拆，但對外語意與副作用順序不得顛倒。

Lv2000：

- EXP 不再增加；
- 維度之弦照發；
- Boss HP 照削；
- loot／稱號／劇情照常處理。

這一批完成後，第三紀元才真正具備正式遊戲核心。

---

## 第 7 批：100死連戰＋界弦核心

正式高維模式：

- 不提供單場正式挑戰
- 正式玩家入口只提供連續戰鬥
- 每次開始死亡數 = 0
- 最多 100 死
- 停止即清零
- reload 也清零
- 換王必須先中止本輪

界弦核心：

```text
Lv0～10
每級 1,000,000,000 維度之弦
總成本 10,000,000,000
```

死亡壓制：

```text
每死壓制 = 0.50pp - coreLv × 0.04pp
```

對照：

```text
Lv0  → -0.50pp／死
Lv1  → -0.46pp／死
Lv2  → -0.42pp／死
...
Lv9  → -0.14pp／死
Lv10 → -0.10pp／死
```

100 死後對應可用最大 HP：

```text
Lv0  約 50%
Lv10 約 90%
```

本批必須處理停止條件：

- 100死自動停止
- 王死亡停止
- 跨階停止
- 稱號／劇情門檻停止
- 5pp鎖停止
- 手動停止
- pagehide／reload transient 清理

跨階原則：

```text
settle
→ 寫回進度
→ 強制停止
→ milestone prompt
→ 下一輪死亡／壓制 transient 從 0 開始
```

界弦核心不是一般角色 stat；它是「高維連戰死亡狀態調節器」，所以不能提早塞進一般 player stat owner。

---

## 第 8 批：高維裝備＋掉落＋離線

### 高維正式裝備

延伸現有裝備公式至 Lv2000：

- 只有傳說／神話
- 基礎品質池 95%／5%
- 每場正式高維戰鬥 100% 至少 1 件
- VIP8／14／16／18 照常套用既有 loot owner
- 不開 +41～+60
- 強化仍停 +40
- item level = 正式角色等級

名稱池依：

> **十王總剩餘 HP 區間**

不是依單一 Boss。

10 套命名區間對應總 remaining percent sum：

```text
1000%
900%
800%
...
100%
```

能力公式不變，只有名稱語意改變。

裝備出售／清理：

```text
不產金幣
不產暗物質
不產維度之弦
```

第三紀元不建立新商店經濟。

### 高維 offline

必須接既有：

- `offlinestatecore.js`
- `offlineprogress.js`

不要另建第二套 `thirdworldoffline.js` pipeline；若有該檔只能是非常薄的 adapter。

第三紀元 offline：

- 來源：近期正式高維戰鬥 sample
- 不分王
- 不削 Boss HP
- 不給 EXP
- 不給維度之弦
- 不推稱號
- 不推劇情
- 不推界弦核心
- 只模擬裝備掉落機會
- VIP loot 照常套用

---

## 第 9 批：正式 UI／回顧／稱號／劇情框架

建立：

```text
thirdworldui.js
```

### 主畫面

新增／正式化：

```text
新紀元｜高維紀元
```

### 冒險

不做 10 區。

直接進：

```text
高維戰線
```

桌機：2×5 十王卡。

頂部摘要：

- 十王總剩餘 HP
- 高維稱號
- 維度之弦
- 界弦核心

王卡：

- 王名
- 個體特化
- HP
- %
- 階段
- 可挑戰／5pp鎖
- 已擊破／回顧

### 回顧

已擊破高維王：

- 10% 最終型態
- 滿 HP
- 單場
- 無 EXP
- 無維度之弦
- 無裝備
- 無正式進度
- 不寫回 Boss persistent HP

### 分頁

Session-only 瀏覽狀態：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

在同一次 session 中，使用者切到回顧後不要自動跳回高維；reload／重開後才回 current world 預設。

### 稱號／劇情 trigger framework

先完成 milestone trigger：

```text
900%
800%
700%
600%
500%
400%
300%
200%
100%
0%
```

具體第三紀元故事文本尚未定，**不可自行寫故事內容**。

高維 title grant 必須接 `playertitlecore.js`，不要把稱號塞進 `thirdWorld` state。

---

## 第 10 批：GM＋Integrity＋收尾

正式高維系統穩定後才做完整 GM，避免先做出 duplicate logic。

### GM 角色能力測試

現有三紀元基礎已完成；本批再補：

- 高維紀元正式語意
- Lv1000～2000
- 界弦核心 Lv0～10

### GM 戰力基準

新增正式「高維」模式，可選：

- Boss
- 100／90／80…10% stage
- runs
- 模擬 100 死連戰

輸出：

- 勝率
- 回合
- 總傷害
- 永久淨削血
- Boss 回血
- 玩家死亡
- 剩餘 HP
- 跨階段資訊

高維平衡主要看：

- 平均每死可打幾回合
- 每條命平均永久削血
- 100死總永久削血
- 100死大約提升多少等級

不要只看單場勝率。

### GM 正式管理

只允許直接調根資料：

- `thirdWorld.entered`
- `thirdWorld.completed`
- `state.level`
- `thirdWorld.dimensionalStrings`
- `thirdWorld.coreLevel`
- `thirdWorld.bosses[].currentHp`

可以做 Boss HP preset，但 preset 最終仍只寫 `currentHp`。

不得直接改派生資料：

- Boss stage
- Boss ability
- 5pp
- title tier
- story tier

這些全部由正式 owner 自動推導。

---

# 16. 第三紀元仍未定案的內容

以下目前不得自行決定：

1. 高維序章具體故事文本。
2. 10 個高維 milestone 的完整故事／事件文本。
3. 十王全滅後最終通關事件／畫面。
4. 是否銜接低維輪迴／轉生。
5. 第三紀元競技場正式形式與數值曲線。
6. 10 套高維裝備的最終具體名稱。
7. 高維專屬背景／動畫／稱號視覺細節。
8. 十王實測後的最終數值微調。

只要使用者未明確定案，不可把推測寫成正式規則。

---

# 17. 下一個對話最先要做什麼

下一個對話不是再做 foundation，也不是再做 GM。

正式起點：

> **第 5 批：高維正式戰鬥核心**

第一步應重新讀 current `main`：

```text
PROJECT_HANDOFF.md
thirdworldphase.js
thirdworlddata.js
combatcore.js
combatmath.js
specialization.js
markcore.js
vipprogression.js
civilizationcore.js
enhancementcombat.js
裝備能力相關 owner
combatfx.js
index.html
```

並檢查現有 `combatcore.js` 能不能直接承接 Boss-side：

- initiative
- combo
- penetration
- counter
- drain
- composure
- suppression
- resilience
- revenge
- backlash
- ignore
- battleSpirit

若缺 hook：

> 優先擴充 shared combat option／event hook；不要複製整個 combat loop。

第5批目標只做到：

> **headless 單次高維正式戰鬥可以正確算完。**

不要在第5批提前做：

- 正式連戰 UI
- 100死
- 核心升級
- 正式 loot
- offline
- 正式高維玩家 UI
- 完整 GM benchmark

---

# 18. 「下一個對話如何接手」標準指令

請在新對話直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。  
> `main` 是唯一真實來源；若 handoff 與 current main 衝突，以 current main 為準。  
> 這次從 **第5批：高維正式戰鬥核心** 接手。先讀 `thirdworldphase.js`、`thirdworlddata.js`、`combatcore.js`、`combatmath.js`、`specialization.js`、`markcore.js`、VIP／文明／裝備／強化 combat owner、`combatfx.js` 與 `index.html`。  
> 先分析 shared combat core 能否承接第三紀元 Boss 端能力，優先共用既有 owner，不要另做第二套 combat engine、公式或 fallback。  
> 高維 Boss 汲取必須遵守「本場回血上限 = 本場開始正式 HP」，不能補回歷史永久削血。  
> 使用者若說「先討論／先檢查」就不要修改；若說「第5批／修改／執行」即可直接改 GitHub `main`。  
> JS／CSS 修改後更新 `index.html` cache-bust；完成後重新讀 main、compare base→head、自我檢查並回報 exact HEAD SHA。
