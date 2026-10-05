# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-05（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引、正式現況、已完成工程與仍有效規則整理；若本檔、舊對話、舊設計文件或其他摘要與 current main 衝突，一律以 current main 為準。

---

# 0. 本次交接基準

本次交接是在「目前預定工程全部完成」後重新 fresh-read current `main` 實碼整理。

更新交接前的 current gameplay HEAD：

```text
9d928dba7812283b1c3411da2a82693ebf5c7fbc
```

該 HEAD 已確認：

```text
Runtime Integrity #1762：success
GitHub Pages build/deployment #5718：success
```

注意：最後兩個修正 commit 未重新觸發 Story Integrity，因此不能把 Story Integrity 宣稱成上述 exact HEAD 的 success；後續若要宣稱 Story Integrity 綠燈，仍必須核對 exact HEAD。

目前正式開發狀態：

```text
三大紀元正式 runtime                          ✅ 完成並維護／實測中
裝備自動處理政策                              ✅ 完成
轉生核心資料與首輪隔離                        ✅ 完成
突破系統＋正式轉生                            ✅ 完成
異宇宙 Batch3～4                              ✅ 完成
AU 架構優化第1～3批                           ✅ 完成
Batch5：W1／W2／W3 轉生後重征服               ✅ 完成
Batch5 後續架構優化／主線向下征服              ✅ 完成
Batch6：越級收益／批次成長／副本／封箱         ✅ 完成
Batch6 程式碼優化第1～5批                     ✅ 完成
Batch7：GM／測試工具正式收尾 7-1～7-5全部完成   ✅ 完成
Batch7 封箱後程式碼優化第1～4批                ✅ 完成
第一紀元完整 Target Context 重構 Batch0～6      ✅ 完成
第一紀元 Target Context 重構後優化第1～4批      ✅ 完成
目前已排定工程                                 ✅ 全部完成
```

**目前沒有已經定案、等待施工的下一個功能批次。** 之後若使用者提出新功能／新重構，再以 current main 重新分析並建立新的施工範圍。

> `PROJECT_PENDING_STATUS.md` 仍包含「第一紀元 Target Context 尚未施工」的歷史待辦文字；本次使用者明確要求只更新 `PROJECT_HANDOFF.md`，因此沒有同步修改其他文件。下一個 ChatGPT 不得以該舊 pending 敘述覆蓋 current main 與本交接檔的完成狀態。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前 fresh-read current main 的 `PROJECT_HANDOFF.md`、相關正式 owner／consumer；若工作會碰到待辦狀態，再同時檢查 `PROJECT_PENDING_STATUS.md` 是否已過時。
2. 使用者說「先討論／先檢查／先不要修改」時不得修改 GitHub；說「修改／做／執行／第N批」時可直接改 `main`，不用重複詢問確認。
3. 每批修改後必須 fresh-read current main、compare base→head，自我檢查 UI／邏輯／正式 state 寫入／舊檔相容／transaction／runtime／Integrity。
4. JS／CSS production 修改必須同步更新 `index.html` cache-bust；Markdown-only 不需要。
5. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式。** 已有 registry／policy／transaction／normalizer／combat／offline／progression／target owner 時，必須延伸正式 owner，而不是旁邊再疊一層相同責任。
6. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark 不得污染 formal save。
7. Integrity／Actions 沒有 exact HEAD 的 success 不可宣稱綠燈。
8. W3 Story／Final 已完成，不自行重寫或擴增既有 11 篇正式主線。
9. 玩家正式用語：「10 名高維存在」；突破顯示「突破等級」；AU 玩家進度用「層域」。
10. `B`、`U37`、`1000U` 等可作內部 shorthand，但不應重新出現在玩家正式 UI。
11. `offlineprogress.js` 是正式 compatibility/offline consumer；不得建立第二套 Offline pipeline。
12. W3 永久 HP settlement 契約 `formalStartHp → combatEndHp → permanent delta` 不得改變。
13. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner。
14. 轉生／重征服硬原則：`reincarnation.count = 0` 維持首輪；只有 `count > 0` 啟用 rerun。
15. AU replay/review 已完整移除，不復活。
16. AU 200 個正式名稱已進 main；改名需重新核對正式定案來源，不自行 invent。
17. Batch5／6／7、Batch7 封箱後優化、W1 Target Context Batch0～6＋優化1～4都已完成，不要因舊 handoff、舊 pending 或舊對話重做。
18. GM 正式 level 若未來新增／修改控制器，突破 milestone 必須共用正式 owner：首輪不發；轉生輪只在實際跨 100／200／…／1000 時發；已領不重複；降級不扣；Lv.1000 以上不再增加本輪突破。
19. 第一紀元正式 battle authority 現在是 Target Context；`selectedMap / selectedEnemy` 只可視為 UI/navigation selection，不得再作戰鬥執行期 target authority。
20. Target Context post-prepare execution 必須 fail closed；validator／lifecycle owner 缺失、context stale、identity 不一致時不得偷偷 fallback 回 UI selection。

---

# 2. current main：三紀元正式基準

`currentWorldPhase()` 正式 mapping：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式 persistent world roots 維持 `secondWorld` 與 `thirdWorld`；不得以 UI 暫態或相容層取代正式 root。

正式等級：

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

current `levelprogression.js`：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

W1→W2：Lv500＋W1 final boss＋8專精60＋五部位+20＋10印記10；首輪要求 final Story，rerun Story bypass。

W2→W3：Lv1000＋W2 entered/final boss＋五部位+40＋文明10＋VIP20＋8專精60＋10印記10；首輪要求 final Story，rerun Story bypass。

轉生不取消 Lv500／Lv1000世界邊界與養成條件。

W3 正式包含10名高維存在、首輪5%戰線限制、永久削血／正式HP settlement、500死連戰、Fast Catch-up、極簡模式、維度之弦、界弦核心、W3 loot/offline、11篇322頁 Story＋Final、W3 Arena、Mirror／Void shared 系統、稱號／Guide／GM benchmark。

---

# 3. Save／Migration／資料安全

current 正式基準：

```text
SAVE_SCHEMA_VERSION = 17
SAVE_LOAD_PIPELINE_VERSION = 3
SAVE_NORMALIZATION_PIPELINE_VERSION = 3
SAVE_MIN_SUPPORTED_VERSION = 1
SAVE_LEGACY_SUPPORT_MODE = "all-known"
```

目前完成的 Batch5／6／7、Batch7 後優化與 W1 Target Context 重構都沒有新增必要 persistent root，因此 **仍不升 Schema18**。

Schema17 正式 `reincarnation`：

```text
reincarnation: {
  count,
  breakthrough: {
    permanent,
    milestoneLifeId,
    milestones: {100,200,...,1000}
  },
  alternateUniverse: {
    unlocked,
    deepestCleared,
    activeAttempt,
    lifeFailures: {lifeId, failures:{...}}
  }
}
```

AU normalization：deepest>0 salvage unlocked；activeAttempt 必須等於 frontier；該層10敗或非frontier attempt 會清除；舊 failure canonicalize；首輪突破污染清除。

正式大型 mutation 共用 Save Safety＋`runSettlementTransaction()`；正式轉生需 verified backup 後才 mutation。

## Schema17 compatibility matrix（Batch7 封箱後優化第2批）

`tests/runtime/save-schema17-compatibility-matrix.js` 已永久納入 Runtime Integrity，鎖定：

- Schema1／9／15／16 legacy 可支援並 migration 至17。
- pre17 不信任／不帶入轉生、突破、AU注入資料。
- missing `saveVersion` 走最低支援版本保守 migration。
- Schema17 normalization 冪等。
- stale life 的突破 milestone、AU attempt/failure 依 current life 修復。
- AU non-frontier attempt fail closed。
- Schema18 目前仍屬 future schema，`FUTURE_SAVE_VERSION` fail closed。
- compatibility diagnostics 不污染 formal state／localStorage。
- GM test／benchmark transient 不進 formal save。

---

# 4. 突破系統＋正式轉生（已完成）

首輪 `count=0` 突破固定 Lv.0。

轉生輪每一 life 跨：

```text
Lv.100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000
```

各 +1，每輪最多10；Lv1000～2000不再給。一次跨多級補發；已領不重複；降級不扣。

每1突破：raw equipment HP／ATK／DEF +2.5%，final damage +0.05。

正式轉生資格：Lv2000＋本輪10名高維存在全滅＋界弦核心Lv10；Story completion 不列資格。

轉生保留：VIP、永久突破、稱號、設定、daily、Story／戰線閱讀歷史、Mirror／Void永久歷史、AU unlock/deepest、符合規則的W3 Lv2000裝備、1.5×永久使用權。

轉生重置：Lv/EXP、W1/W2/W3本輪進度、強化、專精、印記、文明、本輪Arena、資源、offline sample/pending、pending encounter、lostGear、AU activeAttempt/current-life failures、本輪突破 milestones。

---

# 5. 異宇宙（已完成）

異宇宙不是第四紀元：200宇宙×5層域＝1000層域。

敵人固定基礎公式：

```text
HP    = 320000 + 30000U + 1500U²
ATK   = 26000 + 600U
DEF   = 12000 + 250U
CRIT  = 20%
DODGE = 20%
```

7種 canonical traits：strong／ferocious／hard／swift／deadly／berserk／giant；每次正式 attempt 固定2個不同 traits。

同一 life 同一 frontier 第10敗鎖到下一次轉生。正式轉生保留 deepestCleared，清 current-life attempt/failures。

AU 共用正式 combat/stat/specialization/marks/VIP/equipment/breakthrough/final-damage owner；不建立第二套戰鬥公式；不給 EXP／資源／裝備收益。

第一次 W3 10名高維存在全滅後永久解鎖；之後任何轉生輪／任何紀元／任何等級可進。

---

# 6. Batch5／Batch6 正式現況（已完成）

## Batch5 rerun

- W1/W2/W3 轉生後重征服完成。
- W1/W2 高階 Boss 勝利會正式向下回填前段主線，不維護「最高 flag＋假 coverage」第二語意。
- W3 rerun 只解除5%戰線限制；Boss HP／能力／phase／永久HP settlement維持。

## Batch6 overlevel

正式 owner `reincarnationoverlevelrewards.js`：

```text
M = 1 + 0.03 × (enemyLevel - playerLevel)
```

只在 `count>0 && enemyLevel>playerLevel`；整數收益 `ceil(base × M)`；無 hard cap；裝備出售收益排除；W3 Offline 不接。

## Batch6 批次成長

`playerbatchupgrades.js`：W1一鍵平均專精；W1/W2平均最大強化；共用正式成本與 shared transaction；W3不提供。

## Batch6 四大副本永久入口

第一次轉生後 bounty／arena／mirror／void 入口永久；Daily不刷新；Mirror/Void歷史保留；W1/W2 Arena current-life reset；永久入口不等於永久全 rank 解鎖。

## Batch6 Offline provenance

`OFFLINE_BATTLE_SAMPLE_VERSION = 4`；只有可靠 player/enemy level provenance 才可吃 overlevel，舊不可靠 sample／pending 固定1×。

---

# 7. Batch7：GM／測試工具正式收尾（7-1～7-5全部完成）

## 7-1 GM 正式突破管理

- 只有 `count>0` 才顯示／可用，首輪完全隔離。
- GM只設定總突破次數；系統 canonical rebuild 轉生次數與本輪 milestones。
- 例：突破25＝第3次轉生＋本輪5突破。
- 可上下調；正式能力、存檔、戰鬥與相關UI同步。

## 7-2 角色能力測試同步突破

- 突破是測試角色能力，不是獨立戰鬥模式。
- 「同步正式角色到測試設定」會同步正式突破等級；首輪為0。
- sandbox 不寫正式 save。

## 7-3 GM 異宇宙正式管理

- 只設定「最深已完成層域」；不再手動選已解鎖／未解鎖。
- 正數正式進度自動維持／建立解鎖；0不任意反轉既有解鎖。
- 正式操作走 shared transaction；調整 frontier 會清理舊 attempt/current-life failures。

## 7-4 AU benchmark＋21雙trait diagnostics

- 異宇宙整合進既有戰力基準，正式第8模式，不另開第9個測試大區塊。
- 直接輸入王編號1～1000＋上一隻／下一隻；同頁session保留，reload／new page回第1隻。
- 7 traits 兩兩 `C(7,2)=21` 全部 internal diagnostics；GM UI不暴露診斷面板。
- benchmark 共用正式 AU enemy/trait/combat/stat owner。

## 7-5 最終封箱

`tests/runtime/reincarnation-batch7-closure.js` 鎖定：

- 首輪突破隔離。
- Life1跨100～1000得到10突破、重複不發、Lv1000以上不再發。
- Life2永久突破保留、本輪milestones重置；降級不扣／不重發。
- AU deepest跨life保留；activeAttempt/current-life failures重置。
- Offline samples/pending settlement 轉生清除。
- W1/W2 Arena current-life reset；Mirror/Void history保留。
- 四副本永久入口與 overlevel 在多生命週期維持。
- GM AU formal snapshot read-only；GM test breakthrough與AU benchmark不污染formal state、不formal save。
- 戰力基準正式8模式；清空 `0 / 8`，AU測完 `1 / 8`。
- 角色能力設定變更後舊benchmark結果立即失效回 `0 / 8`。
- AU王編號同頁保留，reload/new page回1。

current版本重點：

```text
GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION = 2
GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRATION_VERSION = 2
GM_POWER_BENCHMARK_MODE_STATE_VERSION = 2
正式 benchmark modes = 8
```

---

# 8. Batch7 封箱後程式碼優化第1～4批（全部完成）

## 第1批：GM 正式 owner／transaction 收斂

- `gmbreakthroughmanage.js` 不再自己推導／重建轉生 count 與 milestones，改委派正式 breakthrough canonical rebuild owner。
- `rebuildBreakthroughFromPermanentTotal()` 成為正式 canonical rebuild 路徑；首輪仍 fail closed。
- 同一 derived life 內調整突破總量時，既有 AU current-life attempt/failures 維持原語意；跨 life 時才依正式 lifecycle 清除。
- GM 正式強化 mutation 走 formal transaction；成功只 save 一次，`save(false)` 或 exception 都 rollback，formal state 不留半套結果。

## 第2批：Schema17 舊資料 consistency diagnostics

- 新增 `save-schema17-compatibility-matrix.js`，詳見本檔 Save／Migration 節。
- 對 Schema1/9/15/16/17/18、missing version、future schema、normalization冪等、sandbox transient 做永久 CI guard。

## 第3批：轉生生命週期 owner＋AU GM snapshot 收斂

- `reincarnationstate.js` 統一 life-change reconciliation 與 read-only AU lifecycle snapshot。
- `breakthroughcore.js` life change 委派正式 owner，不自己清 AU。
- `gmalternateuniversemanage.js` GM formal snapshot 改吃正式 lifecycle owner；公開 management version 維持相容。
- formal lifecycle 與 GM read-only snapshot 不再維護第二套語意。

## 第4批：AU benchmark prepared context／效能收斂

`gmalternateuniversebenchmark.js` current：

```text
GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION = 2
GM_ALTERNATE_UNIVERSE_BENCHMARK_OPTIMIZATION_VERSION = 1
GM_ALTERNATE_UNIVERSE_BENCHMARK_FORMAL_STATE_GUARD_VERSION = 1
GM_ALTERNATE_UNIVERSE_BENCHMARK_PREPARED_CONTEXT_VERSION = 1
```

- 一批 100／500／1000 場 benchmark 只建立一次 player context、base enemy、21 trait pairs。
- 每場只套 trait＋呼叫正式 `runWorldCombatCore`，不再每場重算 GM test character/stats/civilization context。
- 21雙trait diagnostics 共用 prepared context。
- runtime formal-state guard 改為 deterministic lightweight fingerprint；CI仍保留完整 `JSON.stringify` before/after exact compare，因此效能改善但驗證強度不降低。
- benchmark、diagnostics 都仍走正式 combat owner；沒有改 AU trait、Boss 曲線、勝率公式或 formal save。

---

# 9. 第一紀元完整 Target Context 重構（Batch0～6 已完成）

這個工程原本是 Batch7 後的下一個大型重構，現在已全部完成。目標是「架構改、玩法語意不變」，把 W1 同一次 battle 的 target authority 從 mutable UI selection 收斂成單一 canonical Target Context。

正式鏈路：

```text
UI / selection
→ prepare Target Context
→ encounter
→ battle context lock
→ combat
→ special / continuous / fast catch-up
→ settlement / progression / offline sample
```

核心 identity：

```text
world = 1
mapIndex
 enemyIndex
```

正式 mode：

```text
formal
rerun
review
```

## Target Context owner

`firstworldtargetcontext.js` 現在統一負責：

- immutable identity。
- `contextId`。
- formal／rerun／review mode。
- lifecycle snapshot 與 current phase authorization。
- target metadata（map/enemy name、level、type）。
- policy gate。
- current-context validator。
- prepared context／prepared session。
- encounter bridge。
- persisted W1 offline target adapter。

context 不保存 `state`、mutable map reference 或 mutable enemy reference；identity／policy／metadata 都採 read-only/frozen snapshot。

## 正式 policy

formal/rerun合法 target 可依 target type取得正式權限；review 使用 deny policy。

目前 policy 欄位：

```text
formalRewardsAllowed
formalProgressAllowed
offlineSampleAllowed
specialEncounterAllowed
storyAllowed
deathPenaltyAllowed
```

Boss 的 offline sample 與 special encounter 不允許；review 的正式收益／正式進度全部不允許。

## Batch0：pre-refactor baseline regression

先把重構前行為鎖住，再施工；涵蓋 normal／elite／boss、單場／連續、rerun、review、offline、special、minimal、fast catch-up、story、unlock 等既有語意。

## Batch1：唯一 First World Target Context owner

- 建立 canonical W1 Target Context、identity、policy、lifecycle delegate。
- context immutable、非法 identity fail closed。
- `selectedMap / selectedEnemy` 不再被視為戰鬥正式 authority。

## Batch2：UI／Prepare／Encounter 接入

- prepare page／combat preview／begin combat 改由 prepared Target Context 驅動。
- UI selection 改變會建立新的 prepared context；同一 selection 重複 render 不會無意重建 target。
- review 有獨立 mode 與 selection來源。

## Batch3：Combat／Settlement 全鏈接入

- `battlepipeline.js` 的 `runBattles()` 執行期鎖定 `targetContext`、`targetIdentity`、`targetSessionId`。
- `fightOnce()`、real battle timing、encounter regeneration、preview clear、settlement 都使用鎖定 identity。
- 戰鬥中即使 UI selection 被改掉，仍打原本 target，避免 Target Drift。
- stale count／life／formal-life mismatch fail closed。

## Batch4：Continuous／Minimal／Fast Catch-up／Special

- continuous 全程共用同一 locked target。
- Minimal Mode 顯示 active target，不再從 `selectedMap / selectedEnemy` 重建戰鬥 target。
- Fast Catch-up 每輪沿用 battle context target。
- Special Encounter 使用 explicit parent Target Context；特殊戰後不靠 UI selection 猜原主線 target。
- 退休 Batch4 內多餘 runBattles／special wrapper 與 selection projection。

## Batch5：Offline／Rerun／Review 收斂

- W1 Offline sample/pending 透過 persisted map/enemy identity 回 canonical Target Context。
- rerun 執行期優先／要求 prepared canonical context，不在 battle execution 階段讀 mutable UI selection。
- Galaxy review 使用 review-mode Target Context；formal state／正式選擇／正式收益／正式進度維持隔離。
- `OFFLINE_BATTLE_SAMPLE_VERSION` 保持4，不因這次重構升格式。

## Batch6：Fallback retirement／Target Drift final closure

- post-prepare execution 不允許重新由 selection reconstruction target。
- execution validator 驗 world／mode／authorization／policy／current lifecycle。
- validator 缺失直接 fail closed。
- rerun 若沒有合法 prepared target，回 `prepared-target-required`，不偷偷 fallback。
- closure snapshot 可確認 owner／identity／batch4／batch5／batch6／drift guard／policy／lifecycle／Save Schema 狀態。

---

# 10. 第一紀元 Target Context 重構後優化第1～4批（全部完成）

## 優化第1批：Execution Authority／Validator 收斂

- `specialencounter.js` W1 special 不再讀 `selectedMap / selectedEnemy`；只吃 explicit W1 target。
- Batch4 不再做 selection projection，也不再包 `runBattles`／`maybeHandleSpecialEncounter`。
- Batch5／Batch6 必須依 `validateCurrentFirstWorldTargetContext`；owner 缺失時 fail closed，不退回較弱 local validator。
- Offline persisted target 在 current validator 缺失時也回 `null`。

## 優化第2批：Prepared Session／Battle Lock 收斂

```text
FIRST_WORLD_PREPARED_TARGET_SESSION_VERSION = 1
MAIN_BATTLE_TARGET_LOCK_OWNER_VERSION = 1
MAIN_BATTLE_PREPARED_SESSION_BINDING_VERSION = 1
MAIN_BATTLE_UI_SELECTION_FALLBACK_RETIRED_VERSION = 1
```

- prepared context＋session 全部 runtime-only，不寫 formal `state`、不升 Save Schema。
- 相同 selection／life 重複 prepare 會重用同一 context/session。
- battle context 透過 `Object.defineProperty` 鎖定 target reference／identity／session id。
- UI selection 變更後新 prepare 會生成新 context/session。
- prepared context 被清除後，執行期 resolver 不再 fallback UI selection。

## 優化第3批：Lifecycle／Policy Owner 去重

- W1 Target Context lifecycle 委派 `worldReincarnationContext`，不自己讀／重算 `reincarnation.count`。
- rerun UI/context、Batch5、Batch6 都改吃同一 lifecycle snapshot。
- policy 判斷統一走 `firstWorldTargetPolicyAllows()`。
- lifecycle owner 缺失時 context 不授權、current validation fail closed。

## 優化第4批：Offline persisted target／Target Metadata 收斂

current：

```text
FIRST_WORLD_TARGET_METADATA_VERSION = 1
FIRST_WORLD_PERSISTED_TARGET_ADAPTER_VERSION = 1
FIRST_WORLD_OFFLINE_TARGET_METADATA_BRIDGE_VERSION = 1
FIRST_WORLD_OFFLINE_PERSISTED_TARGET_DELEGATE_VERSION = 1
OFFLINE_BATTLE_SAMPLE_VERSION = 4
SAVE_SCHEMA_VERSION = 17
```

- `firstworldtargetcontext.js` 成為 W1 persisted map/enemy → Target Context 正式 owner。
- runtime Target Metadata 統一輸出 world/mapIndex/enemyIndex/targetType/enemyLevel/mapName/enemyName。
- W1 Offline consumer 不再維護第二套 raw map/enemy 解析。
- `{map, enemy}` 舊 V4 persistent 格式維持；runtime 也接受 `{mapIndex, enemyIndex}` alias。
- Boss／invalid persisted target fail closed。
- 舊 V3 sample migration 成 V4 後仍可解析 canonical Target Context。
- Batch5 Offline bridge 可附帶 `targetContext`／`targetIdentity`／`targetMetadata`，但不新增 persistent save 欄位。
- Direct/internal `grantFirstWorldOfflineRewards(pending, enemy)` caller 的既有相容路徑保留：若 canonical persisted target可解就優先 canonical enemy；若 caller 已提供正式 enemy，不能因 target-context 收斂而把舊 direct caller 破壞掉。

---

# 11. 本輪重構的重要 bug 修正／防倒退規則

1. **Target Drift**：戰鬥開始後即使 `selectedMap / selectedEnemy` 被 render、切頁、測試或其他 UI 改掉，combat／drop／progress／offline sample／rerun backfill／story 必須仍指向原 context target。
2. **missing validator fail closed**：current validator 被拿掉或未載入，不得使用較弱 fallback validator繼續正式流程。
3. **special target 明確 parent**：特殊遭遇不得再投影 UI selection 來維持主線目標。
4. **review 隔離**：review context formalRewards/formalProgress= false；不能污染正式主線。
5. **rerun execution 不讀 selection**：post-prepare rerun target 必須來自合法 prepared context。
6. **prepared context runtime-only**：不能因重構新增 save root／persistent session。
7. **Offline compatibility**：仍保留 V4 sample格式與舊 direct reward caller；Target Context只是 runtime canonicalization，不重寫 Offline pipeline。
8. **Boss Offline 排除**：W1 persisted offline target仍只接受 enemy 0～3，Boss不進offline sample。
9. **重構不改玩法數值**：沒有改 EXP、金幣、掉落率、強化石、Boss能力、special機率、Fast Catch-up速度規則。

---

# 12. GM current main 原則

GM Hub 維持「管理／測試」分離。

正式管理包含一般角色、VIP、專精、強化、印記、文明、W1/W2/W3正式進度、突破、AU正式進度、副本、匯出匯入等。

測試包含角色能力、8種戰力基準、稱號預覽、劇情等；所有測試 sandbox 不污染 formal save。

異宇宙第8戰力模式直接使用角色能力測試 snapshot；突破能力跟著同步正式角色進測試設定。

AU benchmark current 優化後：100／500／1000 run 只建一次 prepared player/base-enemy context，21 trait pair diagnostics共用 context；仍共用正式 `runWorldCombatCore`。

---

# 13. Runtime／Integrity current baseline

`.github/workflows/runtime-integrity.yml` current 已包含：

- 全 JS syntax／owner integrity。
- Save/global writer／new-state/load pipeline。
- 真實 Chromium browser smoke。
- AU data／attempt／combat／failure／progression／UI／old-save。
- Batch5 rerun closure＋E2E。
- Batch6 overlevel／Offline provenance／batch upgrades／dungeon access／Batch6 closure。
- Breakthrough core／final damage。
- Batch7-1 GM突破。
- Batch7-2 GM角色突破sandbox。
- Batch7-3 AU正式管理。
- Batch7-4 AU benchmark＋21 trait diagnostics。
- Batch7-5 multi-life closure。
- Batch7 post-optimization 1／3／4與 Schema17 compatibility matrix。
- 正式轉生 reset／transaction／UI／save migration。
- W1 Target Context pre-refactor baseline。
- W1 Target Context Batch1～6。
- W1 Target Context optimization 1～4。
- VIP unlimited integrity。
- GM mainline HP lock integrity。
- asset integrity。
- documentation integrity。

更新本交接前 exact gameplay HEAD `9d928dba...` 已確認 Runtime Integrity #1762 success、Pages #5718 success。

---

# 14. 第一紀元 Target Context current owner 索引

## 正式 owner／bridge

`firstworldtargetcontext.js`：canonical identity／mode／policy／lifecycle／prepared session／metadata／persisted adapter。  
`battlepipeline.js`：正式 battle target lock、continuous、Fast Catch-up、real sample timing、special parent傳遞。  
`firstworldtargetcontextbatch4.js`：continuous/fast/special boundary bridge；已退休 wrapper與selection projection。  
`firstworldtargetcontextbatch5.js`：Offline persisted bridge、rerun prepared boundary、review boundary。  
`firstworldtargetcontextbatch6.js`：execution validator、drift guard、fallback retirement、final closure snapshot。  
`mainminimalmode.js`：W1 Minimal Mode active target display。  
`specialencounter.js`：explicit W1 target special flow。  
`reincarnationrerunworld1.js`：W1 rerun UI／policy consumer；target lifecycle委派canonical owner。  
`offlineprogress.js`／`offlinestatecore.js`：Offline正式 consumer／sample owner，格式仍V4。

## Runtime regression

```text
tests/runtime/first-world-target-context-baseline-integrity.js
tests/runtime/first-world-target-context-owner-batch1-integrity.js
tests/runtime/first-world-target-context-ui-batch2-integrity.js
tests/runtime/first-world-target-context-combat-batch3-integrity.js
tests/runtime/first-world-target-context-continuous-batch4-integrity.js
tests/runtime/first-world-target-context-offline-rerun-review-batch5-integrity.js
tests/runtime/first-world-target-context-final-batch6-integrity.js
tests/runtime/first-world-target-context-optimization-1-integrity.js
tests/runtime/first-world-target-context-optimization-2-integrity.js
tests/runtime/first-world-target-context-optimization-3-integrity.js
tests/runtime/first-world-target-context-optimization-4-integrity.js
```

---

# 15. 其他重要 owner 索引

## Reincarnation／Breakthrough

`reincarnationstate.js`、`reincarnationcore.js`、`breakthroughcore.js`、`reincarnationui.js`、`reincarnationrerunworld1.js`、`reincarnationrerunworld2.js`、`reincarnationrerunworld3.js`、`reincarnationrerunprogress.js`、`reincarnationoverlevelrewards.js`、`reincarnationdungeonaccess.js`。

## Alternate Universe

`alternateuniversedata.js`、`alternateuniverseattempt.js`、`alternateuniversecombat.js`、`alternateuniverseprogression.js`、`alternateuniverseaccess.js`、`alternateuniverseui.js`、`traits.js`。

## Save／Offline

`savemigration.js`、`saveversionguard.js`、`settlementtransaction.js`、`offlinestatecore.js`、`offlinefarmtarget.js`、`offlineprogress.js`、`offlineworld3adapter.js`。

## GM

`gmhub.js`、`gmhubextensions.js`、`gmformaltransaction.js`、`gmbreakthroughmanage.js`、`gmalternateuniversemanage.js`、`gmpowerbenchmark.js`、`gmpowerbenchmarkstate.js`、`gmpowerbenchmarkworldphase.js`、`gmalternateuniversebenchmark.js`、`vipgm.js`、`thirdworldarenagm.js`。

---

# 16. 明確不要自行復活／擴充

1. 不把 AU 做成 Lv2001+ 或第四紀元。
2. 不讓 AU 敵人依玩家突破 dynamic scaling。
3. 不新增 AU 刷裝貨幣／資源收益。
4. 不要求轉生後重看已讀劇情。
5. 不取消 Lv500／Lv1000 紀元邊界與養成條件。
6. 不讓裝備出售收益吃 overlevel。
7. 不復活 AU replay/review。
8. 不讓 UI／GM 自行維護可衍生 lifeId／lock 等第二套狀態。
9. 不重做第二套 final damage、transaction、save backup、combat、offline、progression、target owner。
10. 不恢復「高階 Boss 只記自身、不正式回填前段主線」舊規則。
11. 不把四副本永久入口誤做成全部 Arena rank 永久全開。
12. 首輪 `count=0` 不可吃 rerun backfill、Story bypass、W3 5% bypass、overlevel 或突破。
13. 不把21 trait diagnostics塞進GM操作介面。
14. 不把戰力基準退回7模式；current正式為8模式。
15. 不讓 W1 battle execution 回頭用 `selectedMap / selectedEnemy` 作 target fallback。
16. 不讓特殊遭遇靠 selection projection 暫時改 UI cursor 來維持 parent target。
17. 不因 Target Context 重構升 Offline sample version 或 Save Schema，除非未來真的新增不可缺的 persistent contract。

---

# 17. 原定大型工程最新進度

```text
第1批：轉生核心資料與首輪隔離                         ✅ 完成
第2批：突破系統＋正式轉生                             ✅ 完成
第2批後優化1～4                                       ✅ 完成
第3批：異宇宙最小可玩版                               ✅ 完成
第4批：異宇宙完整化／UI／平衡／Regression              ✅ 完成
AU 架構優化第1～3批                                   ✅ 完成
第5批：W1／W2／W3 轉生後重征服                        ✅ 完成
第5批後架構優化／主線向下回填                         ✅ 完成
第6批：越級收益／批次成長／Offline／四副本／封箱       ✅ 完成
第6大批程式碼優化第1～5批                            ✅ 完成
第7批：GM／測試／完整Integrity收尾 7-1～7-5            ✅ 完成
Batch7 封箱後程式碼優化第1～4批                       ✅ 完成
第一紀元完整 Target Context 重構 Batch0～6             ✅ 完成
第一紀元 Target Context 重構後優化第1～4批             ✅ 完成
```

**目前預定工程全部完成；沒有下一個已定案功能批次。**

---

# 18. 下一個對話如何接手

新對話請直接使用以下標準指令：

```text
讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，
再重新檢查 main 的實際程式碼與這次要處理功能的正式 owner／consumer，
完整承接《文明戰線》專案。

以 GitHub main 為唯一真實來源；不要只靠對話記憶或舊文件。
先確認目前 HEAD、Save Schema、相關 runtime/integrity 與既有正式 owner。
已完成的 Batch5／6／7、Batch7 封箱後優化、第一紀元 Target Context Batch0～6與優化1～4不得重做或倒退。
若我說「先討論／先檢查／先不要修改」，只分析不要改 GitHub；
若我說「修改／做／執行／第N批」，可直接修改 main。
修改時優先改正式來源，不要另外堆 wrapper、fallback、第二套公式或第二套 owner。
JS／CSS production 改動要同步更新 index.html cache-bust；
修改後 fresh-read、compare base→head、自我檢查，並以 exact HEAD 的 Actions 結果為準。
現在先不要修改。
```
