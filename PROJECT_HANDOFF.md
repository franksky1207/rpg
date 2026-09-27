# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-27（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要、已完成系統索引，以及「尚未實作但已確認」的設計基準。若本檔、舊對話、舊 Word、舊規格或記憶與 current `main` 衝突，**一律以 current `main` 為準**。

---

# 0. 本次交接重新驗證

本次不是只靠對話記憶；更新本檔前已重新讀取 current `main` 實碼與近期 Integrity 結果。

更新本檔前的 main HEAD：

`dc00ec431a43de3714ab893e4acadf84e470416a`

重新確認的第三紀元主要 runtime：

```text
SAVE_SCHEMA_VERSION = 16
WORLD_PHASE_VERSION = 6
THIRD_WORLD_PHASE_VERSION = 3
THIRD_WORLD_DATA_VERSION = 5
THIRD_WORLD_COMBAT_VERSION = 5
THIRD_WORLD_COMBAT_RESULT_CONTRACT_VERSION = 2
THIRD_WORLD_COMBAT_SETTLEMENT_BASIS_VERSION = 2
THIRD_WORLD_PROGRESS_VERSION = 4
THIRD_WORLD_SETTLEMENT_VERSION = 4
THIRD_WORLD_RUN_VERSION = 2
THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION = 2
THIRD_WORLD_EQUIPMENT_REWARD_VERSION = 3
SHARED_EQUIPMENT_REWARD_FACTORY_VERSION = 3
SHARED_SETTLEMENT_TRANSACTION_VERSION = 2
LEVEL_PROGRESSION_VERSION = 2
PLAYER_TITLE_CATALOG_VERSION = 3
PLAYER_TITLE_UI_VERSION = 3
CIVILIZATION_THIRD_WORLD_DATA_CONTRACT_EXTENSION_VERSION = 16
```

目前不是「第三紀元只有 foundation」。current main 已完成：

- 第三紀元等級／EXP owner；
- 十王 data／stage／5pp／aggregate／title metadata；
- shared combat 擴充與正式 headless 高維 combat adapter；
- settlement basis 單一 authority；
- 永久 Boss HP、EXP、維度之弦、正式高維裝備、稱號、story stage 的原子結算；
- 第三紀元 100 死連戰 runtime foundation、死亡壓制、pagehide 清理、fast catch-up、runtime blocker；
- 高維稱號已正式併入共用玩家稱號 catalog；
- 第一／第二／第三紀元稱號通知已統一 post-flow owner；
- 高維裝備 base drop／VIP loot／零售價資源政策已有正式 owner；
- GM 三紀元角色測試與 World Phase adapter 基礎已完成。

但**第 7～10 批仍視為尚未正式收尾的施工批次**。其中 current main 已有部分提前完成的底層 owner，下一個對話必須「承接／補完」，不能重做第二套。

本輪使用者再次明確確認：**第 7～10 批屬於目前後續施工的暫定資料庫／交接基準，必須完整保留。**「暫定」代表仍可由使用者之後調整批次內容或順序，不代表下一個對話可以自行改寫規則；若 current main 已提前完成其中部分底層 owner，施工時應直接承接現有正式 owner，而不是照規格文字重做第二套。

本次只更新 `PROJECT_HANDOFF.md`，**不做其他功能修改**。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先重新讀 actual code，不得只依賴本檔、對話記憶或舊規格。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不需要再問一次確認。
4. 每批修改前：
   - 先重新讀 current `main` 相關 owner；
   - 確認沒有較新的 commit 已改同一區；
   - 以 current main 為 base。
5. 每批修改後：
   - 重新讀 current main 實碼；
   - compare base → head；
   - 自我檢查 UI／邏輯／資料寫入／舊檔相容；
   - 跑可用的 Integrity／CI；
   - 回報受影響檔案與 exact main HEAD SHA。
6. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。**
7. 優先修改正式來源；**不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline**。
8. 只有在正式 owner 已存在、且真的需要跨模組銜接時，才允許薄 adapter／policy layer。
9. 第一／第二／第三紀元能共用的規則，優先做 shared owner，不要切成三套平行系統。
10. GM sandbox／benchmark state 不得污染正式 save。
11. 若已有 registry／hook／policy owner，優先掛進既有 owner，不要多層 monkey-patch。
12. 第三紀元未定案故事、最終結局、競技場正式規則、裝備最終名稱，不可自行補成正式內容。
13. **不要動鏡像戰來實作第三紀元。** 鏡像戰可作為玩家能力／敵方能力語意參考，但不要修改鏡像本體，除非使用者明示。
14. 第三紀元 `thirdWorld` persistent state 只存根資料；Boss stage、能力、5pp、稱號階、story tier 等一律由正式 owner 推導。

---

# 2. 專案定位與正式世界結構

《文明戰線》是純前端、文字／數值養成、科幻星際 RPG，支援桌機與手機；iPhone Safari 是重要實機環境。

正式世界：

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

進入 World3 後：

- World1／World2 歷史與回顧保留；
- 第一／第二紀元不再產生正式成長；
- World3 為正式 progression phase。

---

# 3. Save／Migration／第三紀元 persistent state

正式 save key：

`frank_text_rpg_save`

目前：

```text
SAVE_SCHEMA_VERSION = 16
```

Schema16 重要政策：

- Schema1～15 若夾帶 `thirdWorld`，視為不可信開發期資料並丟棄；
- 升 Schema16 前建立 `.pre-schema16-backup-v1` 原始 localStorage 備份；
- `world=3` 裝備只有 source schema ≥16 才接受；
- GM transient test state 不得寫入正式 save；
- future save 採 fail-closed。

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

以下必須保持 transient：

- 本輪玩家死亡數；
- 死亡壓制累積；
- 目前連戰 target；
- pending progression events；
- recent battle summaries；
- combat runtime；
- battle spirit／revenge 等單場狀態。

`thirdworldrun.js` Integrity 已明確檢查上述欄位不得滲入 persistent allowlist。

## 3.2 進入第三紀元條件

全部成立：

1. Lv1000
2. 宇宙紀元已 entered＋第100王擊破＋宇宙最終故事完成
3. 五部位強化 +40
4. 文明等級 Lv10
5. VIP ≥20（以 `vipPoints` source of truth 推導）
6. 8 專精全部 Lv60
7. 10 印記全部 Lv10

進入後保留：

- 等級／EXP
- VIP
- 已裝備與背包
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

`THIRD_WORLD_ENTRY_RECONCILIATION_VERSION = 1`，舊 Schema16 entry 狀態只做一次 reconciliation。

---

# 4. 第三紀元等級／EXP（已完成）

正式 owner：`levelprogression.js`。

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

第三紀元：

```text
Lv1000～1999：每級固定 10,000,000 EXP
Lv2000：EXP need = 0
```

重要 shared API：

```js
thirdWorldExpNeed(level)
effectiveExpNeed(level,target)
effectiveLevelCap(target)
gainEffectiveExpForState(amount,target,logs)
normalizeLevelProgressionState(target)
levelProgressSnapshot(target)
```

Lv2000：

- `state.exp = 0`；
- 不再升級；
- 維度之弦仍可增加；
- Boss HP、loot、稱號、story progression 仍照常。

---

# 5. 第三紀元十王／stage／5pp／aggregate（已完成 data owner）

正式 owner：`thirdworlddata.js`。

## 5.1 十王固定資料

```text
每王最大 HP：1,100,000,000
十王總 HP：11,000,000,000
```

十王 persisted order：

```text
higher-dimensional-boss-01  破界天裁  高攻
higher-dimensional-boss-02  永劫重垣  高防
higher-dimensional-boss-03  宿因天秤  高暴
higher-dimensional-boss-04  無相彼岸  高閃
higher-dimensional-boss-05  萬象迴演  連擊
higher-dimensional-boss-06  維隙之刃  穿透
higher-dimensional-boss-07  逆因輪轉  反擊
higher-dimensional-boss-08  噬界深淵  汲取
higher-dimensional-boss-09  先驗之瞳  先制
higher-dimensional-boss-10  高維原點  均衡
```

共同 base：

```text
ATK 15,000
DEF 10,000
暴擊 10%
閃避 10%
先制 bonus 60%
連擊 30%
穿透 30%
反擊 30%
汲取 30%
```

個體特化：

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

## 5.2 Stage

```text
>90%  stage0
≤90%  stage1
≤80%  stage2
≤70%  stage3
≤60%  stage4
≤50%  stage5
≤40%  stage6
≤30%  stage7
≤20%  stage8
≤10%  stage9
0%    defeated（stage 表示仍為9）
```

每跨一階：

```text
ATK +600
DEF +1,200
暴擊 +2pp
閃避 +2pp
```

Stage abilities：

```text
70% 鎮心
60% 壓制
50% 韌性
40% 復仇
30% 反噬
20% 無視
10% 戰意
```

這七項現在已不是只有 descriptor；`thirdworldcombat.js` 會把它們轉成 shared `combatcore.js` effect profile，數值語意直接讀 max-level mark owner，不建立第二套效果常數。

## 5.3 5pp 戰線

每王 5pp：

```text
1,100,000,000 × 5% = 55,000,000 HP
```

正式規則：

> 若目標王比「最高存活王」少 55,000,000 HP 以上，下一場不可挑戰。

權威欄位：

```text
allowed
gapHp
fivePointHpGap
```

`gapPoints`／顯示百分比只供 UI。

- 只計存活 Boss；
- 已死亡 Boss 退出 5pp；
- 只剩最後一王時不受 5pp；
- challenge legality 只在 battle start resolve；
- 合法開打後即使本場跨過 5pp，也完整打完再結算；下一場再重判。

## 5.4 Aggregate／稱號門檻

`thirdWorldBossAggregateSnapshot()`：

```text
overallRemainingPercent：十王總HP相對110億的 0～100%
remainingPercentSum：十王各自百分比加總，滿血 = 1000%
```

高維稱號：

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

稱號 tier 的正式 HP authority 仍由 `thirdworlddata.js` 持有，不允許 UI／story／GM 另算一套。

---

# 6. 第 5 批：高維正式戰鬥核心（已完成）

正式檔：

```text
thirdworldcombat.js
thirdworldcombatintegrity.js
thirdworldcombatsaveguard.js
thirdworldcombatfinalize.js
```

shared owner：

```text
combatcore.js
combatmath.js
specialization.js
markcore.js
civilizationcore.js
```

## 6.1 shared combat 擴充

`combatcore.js` 現在同時支援 player／enemy：

- initiative
- combo
- penetration
- counter
- drain
- effect profiles
- enemyStartHp／enemyHealCap
- playerHealCap
- player final damage multiplier
- action safety budget

共用能力基準：

```text
comboScale = 0.50
penetrationDefMultiplier = 0.75
counterScale = 0.40
drainRatio = 0.10
```

Boss 端 7 個高維 stage effect 直接借用 max-level mark effect semantics；Boss 不擁有也不提升玩家印記 state。

## 6.2 高維 Boss 汲取永久削血保護

正式戰鬥明確區分：

```text
formalStartHp
combatEndHp
enemyHealCap = formalStartHp
```

所以 Boss 本場可汲取回復，但只能回到本場開始的正式 HP，**不能補回之前戰鬥已永久削掉的 HP**。

## 6.3 settlement authority

`settlementBasis` 是唯一正式結算 authority。

```text
combat / snapshot / challengeStatus = diagnostic-only
top-level settlement 欄位 = convenience-only
```

正式 public APIs 只保留：

```js
createThirdWorldBossCombatSnapshot()
thirdWorldSettlementBasisFromResult()
canRunThirdWorldBossCombat()
runThirdWorldBossCombat()
```

舊 private helper 已由 finalize owner 退休。

---

# 7. 第 6 批：永久削血＋EXP＋維度之弦＋正式結算（已完成）

正式 owner：`thirdworldprogress.js`。

核心公式：

```text
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

玩家死亡仍會結算當場已造成的有效永久削血；0 淨削血則 EXP／維度之弦皆為 0。

## 7.1 stale／replay protection

正式 settlement 前必須：

```text
persisted boss currentHp === settlementBasis.formalStartHp
```

不一致即拒絕 stale／duplicate result。

同一 `settlementBasis` 物件完成後不可重複落帳。

## 7.2 原子結算

共用 owner：`settlementtransaction.js` V2。

任何 mutate／save 失敗：

- 回復結算前 state；
- 保持 root object identity；
- nested references 亦維持；
- 不允許半套 HP／EXP／裝備已寫入。

World2 settlement 也已接同一 shared transaction owner。

## 7.3 current main 的實際 settlement 順序

以 current code 為準：

```text
1. 驗證 settlementBasis / stale guard
2. 取得 aggregateBefore
3. 寫回 Boss persistent currentHp
4. 依永久淨削血發 EXP + 維度之弦
   - gainEffectiveExpForState() 在這一步直接處理升級
5. 建立並加入正式高維裝備
   - item level 使用此時角色 current level
   - 因此前一步若升級，裝備等級是「post-EXP 等級」
6. aggregate progression
   - 高維稱號 grant
   - story.unlockedStage
   - Boss death derived
   - stage crossing
   - post-settlement 5pp
   - continuation decision / eventSequence
7. shared transaction save
```

這個順序已取代舊 handoff 中「裝備後才升級」的舊描述。

## 7.4 稱號與 story stage 已正式接上

高維稱號不放 `thirdWorld.titles`。

`playertitlecore.js` 目前正式 catalog：

```text
銀河10 + 宇宙10 + 鏡像6 + 高維10 = 36 個稱號
```

`grantPlayerTitlesForThirdWorldTier()`：

- 可一次跨多階；
- 補齊所有缺少的低階稱號；
- pending notice 只指向本次最高新稱號。

`thirdWorld.story.unlockedStage` 使用同一 aggregate tier，不另做 story threshold formula。

舊存檔 normalization 會依目前十王總 HP 靜默 backfill 高維稱號，不產生通知。

## 7.5 進度事件／continuation

Settlement 現在會輸出：

```text
aggregateBefore / aggregateAfter
titleTierBefore / titleTierAfter
unlockedTitles
titleNoticeId
storyStageBefore / storyStageAfter
unlockedStoryStages
bossDefeatedNow
stageTransition
fivePointStatus
fivePointBlocked
completionReady
eventSequence
continuation
```

注意：

- Boss death 不建立 persisted `bossKilled`；以 `currentHp === 0` 推導。
- 十王全滅目前只得到 `completionReady = true`；**尚未由正式 completion owner 寫入 `thirdWorld.completed`／最終事件**。

---

# 8. 高維裝備 current main 現況（底層已提前完成，完整第8批仍未結案）

正式共用 factory：`equipmentrewardcore.js` V3。  
高維 policy adapter：`thirdworldloot.js` V3。

目前已完成：

```text
品質：傳說95% / 神話5%
每場正式 settlement：100% 至少1件
VIP8 / 14 / 16 / 18：共用 viplootcore.js
VIP16：可額外1件
品質上限：神話 q5
item level：post-EXP 的玩家目前等級
world = 3
sell = 0
buy = 0
```

裝備 stat／affix 直接共用：

```text
mainStatForType()
mainStatValue()
rollAffixes()
addItemStat()
```

共享 RNG pipeline 已完成 deterministic integrity；相同注入 RNG 可重現掉落內容。

高維裝備出售／自售的 shared quote 已接既有 `equipmentSaleQuote()`：

```text
currency = none
amount = 0
gold = 0
darkMatter = 0
darkEnergy = 0
```

**尚未完成的第8批部分：**

- 高維 10 套名稱池尚未改成「十王總剩餘 HP 區間」；current `thirdworldloot.js` 仍以 Boss 名＋部位當名稱。
- World3 offline sample／settlement 尚未接進正式 offline pipeline。

因此第8批施工時**不能重做 base drop／VIP／stat formula**，只補命名 policy＋offline integration 與必要 UI 呈現。

---

# 9. 100死連戰／界弦核心 current main 現況（第7批已有 runtime foundation，但尚未正式結案）

正式 runtime：`thirdworldrun.js` V2。

已存在：

```text
THIRD_WORLD_RUN_MAX_DEATHS = 100
BASE_SUPPRESSION_PER_DEATH = 0.50pp
CORE_REDUCTION_PER_LEVEL = 0.04pp
RECENT_HISTORY_LIMIT = 20
```

死亡壓制公式：

```text
每死壓制 = 0.50pp - coreLv × 0.04pp
```

端點：

```text
Lv0  → 0.50pp / 死
Lv10 → 0.10pp / 死
100死：Lv0 約剩50%最大HP；Lv10約剩90%
```

目前 runtime 已具備：

- 開始連戰時 deaths = 0；
- 最多 100 死；
- 玩家死亡但 Boss 未死才計一次 death；
- 每場 startHp／playerHealCap 套當前死亡壓制後的 HP cap；
- Boss death 停止；
- stage crossing 停止；
- 5pp blocked 停止；
- 100 death limit 停止；
- manual stop 會清 runtime；
- 換王時若已有 active run 會拒絕，必須先停止；
- pagehide 透過 shared `backgroundProgressOnPageHide()` 清 transient runtime；
- reload 因 runtime 純記憶體資料而自然歸零；
- shared background-progress / fast catch-up；
- shared world-transition runtime blocker；
- bounded recent battle summaries，不把完整 combat results 無限堆在記憶體。

### 9.1 第7批仍要修正／補完的地方

使用者最新定案的第7批要求是：

> **稱號／劇情門檻要「停止本輪」而不是只 pause 後續跑。**

current `thirdworldrun.js` 對 `progress-event` 的現況是：

```text
pauseForProgressEvents()
→ paused = true
→ acknowledgeThirdWorldContinuousRunEvents()
→ 可在同一 runtime / 同一 deaths 計數下繼續
```

這與最新第7批「門檻停止、下一輪 deaths 從0開始」仍有差距。

因此正式第7批要把 progression event 行為收斂成：

```text
settle
→ 寫回進度
→ 停止本輪 / 清 transient deaths
→ 顯示 milestone
→ 使用者再開始新一輪時 deaths = 0
```

另外目前只有 `coreLevel` persistent 根資料＋run 時的壓制計算；**尚缺正式界弦核心升級消費 owner**：

```text
Lv0～10
每升1級消耗 1,000,000,000 維度之弦
總成本 10,000,000,000
```

核心不是一般 player stat，不要塞進通用角色能力公式；它只調節高維連戰死亡後的 HP cap。

### 9.2 正式玩家模式與 headless API 的區分

`runThirdWorldBossCombat()` 仍必須保留 headless 單場 API，供 settlement／Integrity／GM／run owner 使用。

但**玩家正式 UI 不提供單場正式挑戰**；正式入口只允許第7批的 continuous run。

---

# 10. Offline current main 現況

現有正式 owner：

```text
offlinestatecore.js
offlineprogress.js
```

目前 sample normalization／selection 正式支援：

```text
World1：mapEnemy
World2：boss
```

尚未支援 World3。

World3 offline 第8批要接同一 pipeline，不另建第二套 `thirdworldoffline.js`；若需要新檔，只能是非常薄的 World3 adapter／policy。

正式 World3 offline 規則見第 13 節。

---

# 11. 稱號通知與 UI lifecycle：本次對話的重要 bug 修正

最近已修正第二紀元取得稱號後「已可裝備，但通知很久後才突然跳出」的問題。

`playertitleui.js` V3 現在提供三紀元共用 post-flow owner：

```js
flushPendingPlayerTitleNoticeAfterFlow()
getPlayerTitlePostFlowStatus()
```

正式支援：

```text
galaxy
universe
higher-dimensional
```

行為：

- 戰鬥／結算只建立 `pendingNotice`；
- 動畫／結果／progression presentation 結束後再 flush；
- document hidden 時不彈；
- 回前景後補顯示；
- 防止重複 queue／重複 modal；
- 舊 `queuePendingPlayerTitleNotice()` 已變成 shared owner delegate。

第一紀元原有 call site 不需要重寫；第二紀元文明災厄 UI 已正式補接 post-flow flush。

第三紀元目前還沒有正式玩家 UI，所以 contract 已先標記 `THIRD_WORLD_POST_FLOW_READY`；第9批做 progression presentation 後，必須沿用同一 shared post-flow owner，不得另做第三套 title modal。

---

# 12. GM current main 現況

## 12.1 已完成 foundation

`vipgm.js` 已支援三紀元測試角色：

```text
銀河紀元：Lv1～500
宇宙紀元：Lv500～1000
高維紀元：Lv1000～2000
```

World3 測試裝備共用正式裝備 stat／affix formula，預設可生成同級神話預測裝備；不寫正式角色 save。

`civilizationcore.js` 的文明最終傷害 owner：

```text
World1 → ×1
World2 → 套文明等級
World3 → 套保留下來的文明等級
```

`gmpowerbenchmarkworldphase.js` 已存在三紀元 World Phase adapter；它只是既有 benchmark 的薄 adapter，不是第二套戰鬥引擎。

## 12.2 尚未完成的正式高維 GM

仍缺第10批：

- 高維 Boss／stage 選擇；
- 100死連戰 benchmark；
- 永久淨削血／回血／死亡／跨階完整輸出；
- 高維正式管理頁；
- core Lv0～10 的正式測試控制與輸出。

GM 正式管理只允許改根資料，不得直接寫派生資料，見第15節。

---

# 13. 暫定施工批次：第 7～第 10 批（使用者最新指定，必須保留）

> 這四批是目前正式後續施工資料庫／交接基準。current main 已有部分提前完成 owner，施工時要承接，不得 duplicate。

## 第 7 批：100死連戰＋界弦核心

### 連戰

正式玩家模式：

- 不提供單場正式挑戰；
- 只提供連續戰鬥；
- 每次開始死亡數 = 0；
- 最多 100 死；
- 停止即清零；
- reload 也清零；
- 換王必須中止目前連戰。

### 界弦核心

```text
Lv0～10
每級 1,000,000,000 維度之弦
```

死亡壓制：

```text
0.50pp - coreLv × 0.04pp
```

例如：

```text
Lv0  → 每死一次 -0.50pp
Lv10 → 每死一次 -0.10pp
```

本批停止條件：

- 100死自動停止；
- 王死亡停止；
- 跨階停止；
- 稱號／劇情門檻停止；
- 5pp鎖停止；
- 手動停止；
- pagehide／reload transient 清理。

**界弦核心是「高維連戰死亡狀態調節器」，不是一般角色 stat。**

### 第7批接手注意

current main 已有 `thirdworldrun.js` foundation。正式施工應：

1. 先重新審核 run V2；
2. 把 progress-event 的「pause＋resume」改成最新定案的「停止本輪」；
3. 增加正式 core upgrade spending owner；
4. 保留 transient／pagehide／active-flow／fast-catch-up 共用架構；
5. 不重做 combat／settlement。

---

## 第 8 批：高維裝備＋掉落＋離線

### 裝備

延伸既有裝備公式到 Lv2000：

- 只有傳說／神話；
- 95%／5%；
- 每場 100% 至少1件；
- VIP8／14／16／18照常；
- 不開 +41～+60；
- 強化仍停 +40；
- item level 跟玩家正式 current level。

**名稱池依十王總剩餘 HP 區間，不依單王。**

能力公式不變，只有名稱語意改變。

current main 已有正式 base drop／VIP／shared equipment formula，**不可重做**。

### 離線

第三紀元 offline：

- 來源：近期正式高維 sample；
- 不分王；
- 不削王 HP；
- 不給 EXP；
- 不給維度之弦；
- 不推稱號；
- 不推劇情；
- 不推核心；
- 只模擬裝備掉落機會；
- VIP loot 照常套用。

必須接：

```text
offlinestatecore.js
offlineprogress.js
```

不要另建第二套 pipeline；若有 `thirdworldoffline.js`，只能是薄 adapter。

---

## 第 9 批：正式 UI／回顧／稱號／劇情框架

建立／正式化：

```text
thirdworldui.js
```

### 主畫面

新增：

```text
新紀元｜高維紀元
```

### 冒險

不做 10 區，直接：

```text
高維戰線
```

桌機 2×5 十王卡。

頂部摘要：

- 總剩餘 HP；
- 高維稱號；
- 維度之弦；
- 界弦核心。

王卡：

- 王名；
- 個體特化；
- HP；
- %；
- 階段；
- 可挑戰／5pp鎖；
- 已擊破／回顧。

### 回顧

已擊破王：

- 10% 最終型態；
- 滿 HP；
- 單場；
- 無收益；
- 不改正式 HP／EXP／維度之弦／裝備／稱號／story。

### 分頁

session-only：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

同一次 session 內切換後不要自動跳回預設；reload／重開後才回 current world 預設。

### 稱號／劇情 trigger framework

只做 milestone trigger：

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

具體故事文本目前未定，**不可自行寫**。

高維稱號 grant 已在 current settlement／shared title owner 完成；第9批主要補玩家 presentation／event framework，並使用既有 shared post-flow title notification。

---

## 第 10 批：GM＋Integrity＋收尾

正式高維玩家系統穩定後才做完整 GM，避免 duplicate logic。

### GM 角色能力測試

補正式高維語意：

```text
高維紀元
Lv1000～2000
界弦核心 Lv0～10
```

### GM 戰力基準

新增「高維存在」模式，可選：

- 王；
- 100／90／80…10% stage；
- runs；
- 模擬100死連戰。

輸出：

- 勝率；
- 回合；
- 總傷害；
- 永久淨削血；
- 王回血；
- 玩家死亡；
- 剩餘HP；
- 跨階段資訊。

高維平衡重點：

- 平均每死可打幾回合；
- 每條命平均永久削血；
- 100死總永久削血；
- 100死大約提升多少等級。

不要只看單場勝率。

### GM 正式管理

只允許直接調根資料：

```text
thirdWorld.entered
thirdWorld.completed
state.level
thirdWorld.dimensionalStrings
thirdWorld.coreLevel
thirdWorld.bosses[].currentHp
```

可做 Boss HP preset，但最終只寫 `currentHp`。

不得直接改：

- Boss stage；
- Boss ability；
- 5pp；
- title tier；
- story tier。

全部由正式 owner 推導。

---

# 14. 目前尚未完成／禁止誤認為已完成

目前仍未正式完成：

- 第7批正式 closure：progress milestone 要停止整輪而非 pause-resume；
- 正式界弦核心升級／扣維度之弦 owner；
- 第8批十王總 HP 區間裝備名稱池；
- World3 offline sample／offline gear-only settlement；
- 正式 `thirdworldui.js` 玩家介面；
- 已死十王回顧戰；
- 高維 milestone presentation framework；
- 高維具體故事文本；
- 十王全滅 final completion owner／最終事件；
- `thirdWorld.completed` 的正式最終寫入流程；
- 第三紀元競技場正式規則；
- 第10批完整高維 GM benchmark／管理頁；
- 高維專屬背景／動畫／最終稱號視覺微調；
- 十王大量實測後的最終平衡微調。

以下已完成，**不要重做**：

- `thirdworldcombat.js` 正式 headless combat adapter；
- shared Boss-side combat hooks；
- heal cap；
- settlementBasis authority；
- 永久淨削血 settlement；
- EXP／維度之弦結算；
- base 高維裝備掉落／VIP loot；
- 高維稱號正式 grant／backfill；
- story unlockedStage settlement；
- stage／5pp continuation contract；
- `thirdworldrun.js` 100死 runtime foundation；
- 三紀元稱號 post-flow notification owner。

---

# 15. 第三紀元仍未定案的內容

除非使用者之後明確定案，以下不可自行決定：

1. 高維序章具體故事文本。
2. 10 個高維 milestone 的完整故事／事件文本。
3. 十王全滅後最終通關事件／畫面。
4. 是否銜接低維輪迴／轉生。
5. 第三紀元競技場正式形式與數值曲線。
6. 10 套高維裝備的最終具體名稱。
7. 高維專屬背景／動畫／稱號視覺細節。
8. 十王實測後最終數值微調。

---

# 16. Integrity／CI 與近期重要修正

第三紀元已有集中 Integrity：

```text
thirdworldcombatintegrity.js
thirdworldcombatsaveguard.js
thirdworldcombatfinalize.js
thirdworldsubsystemintegrity.js
thirdworldintegritycontract.js
thirdworldmigrationregression.js
```

`thirdworldsubsystemintegrity.js` 分：

```text
data
combat
progression
run
```

目前 contract 會檢查：

- Schema16；
- third-world migration；
- 5pp authority；
- snapshot policy；
- shared mark／specialization combat rules；
- action safety；
- settlement basis authority；
- shared settlement transaction rollback identity；
- deterministic equipment pipeline；
- zero-sale policy；
- title catalog/backfill；
- run 100死／壓制／fast catch-up／pagehide／active-flow guard。

近期重要修正：

1. 第二紀元稱號通知漏接已修：取得稱號後在 post-flow 正常彈出，不再延遲到之後某次 UI lifecycle 才顯示。
2. 三紀元 title notification lifecycle 已統一 shared owner。
3. Runtime Integrity 曾因舊測試硬鎖第二紀元災厄 UI 舊 cache-bust 失敗；已只更新該 static contract，沒有把正式 cache 退回舊版。
4. current main `dc00ec4...` 的 Runtime Integrity 已成功。
5. 最近 Story Integrity 與 GitHub Pages deployment 亦成功。

---

# 17. 下一個對話如何接手

目前後續正式施工不是第5／第6批；它們已完成。

下一個主要施工起點：

> **第7批：100死連戰＋界弦核心收尾。**

第一步必須重新讀 current `main`：

```text
PROJECT_HANDOFF.md
thirdworldphase.js
thirdworlddata.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldloot.js
settlementtransaction.js
playertitlecore.js
playertitleui.js
backgroundprogress.js（或 current shared background-progress owner）
worldphase.js
offlinestatecore.js
offlineprogress.js
thirdworldsubsystemintegrity.js
thirdworldintegritycontract.js
index.html
```

第7批最重要差異：

```text
current：progress-event pause → acknowledge → 同一輪續戰
最新定案：progress-event 必須停止本輪 → transient deaths 清0 → 下次重新開一輪
```

同時補正式界弦核心升級：

```text
每級 1,000,000,000 維度之弦
Lv0～10
```

不要重做 combat／settlement／loot base owner。

---

# 18. 「下一個對話如何接手」標準指令

請在新對話直接貼：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 current `main` 的實際程式碼，完整承接《文明戰線》專案。  
> `main` 是唯一真實來源；若 handoff 與 current main 衝突，以 current main 為準。  
> 第5批高維 combat 與第6批正式 settlement 已完成；目前從 **第7批：100死連戰＋界弦核心收尾** 接手。  
> 先讀 `thirdworldphase.js`、`thirdworlddata.js`、`thirdworldcombat.js`、`thirdworldprogress.js`、`thirdworldrun.js`、`thirdworldloot.js`、`settlementtransaction.js`、`playertitlecore.js`、`playertitleui.js`、World Phase／background progress／offline owners、`thirdworldsubsystemintegrity.js`、`thirdworldintegritycontract.js` 與 `index.html`。  
> 特別確認 current `thirdworldrun.js` 已有 100死、死亡壓制、pagehide、fast catch-up、runtime blocker foundation，但目前 progress-event 是 pause＋resume；最新規則要求稱號／劇情門檻直接停止本輪，下一輪死亡數從0開始。  
> 界弦核心正式升級為 Lv0～10，每級消耗 10 億維度之弦；它只影響高維連戰死亡壓制，不是一般角色 stat。  
> 後續第8批要承接現有 `thirdworldloot.js`／shared equipment owner，只補總HP區間命名與 World3 offline，不得重做掉落公式。第9批做正式 UI／回顧／milestone presentation；第10批最後做完整高維 GM／Integrity 收尾。  
> 使用者若說「先討論／先檢查」就不要修改；若說「第7批／修改／執行」即可直接改 GitHub `main`。  
> 優先修改正式 owner，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline。JS／CSS 修改後更新 `index.html` cache-bust；完成後重新讀 main、compare base→head、自我檢查並回報 exact HEAD SHA。
