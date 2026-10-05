# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-06（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只負責交接、索引、正式現況、已完成工程與仍有效規則整理；若本檔、舊對話、舊設計文件、歷史文件或其他摘要與 current main 衝突，一律以 current main 為準。

---

# 0. 本次交接基準

本次交接已重新 fresh-read current `main` 的實際程式碼、現行 migration／GM／runtime／world semantics／enhancement owner 與 regression。

更新交接前 current gameplay HEAD：

```text
d71aff23c353c34b819bc0a12b3a323be698055c
```

該 exact HEAD 已確認：

```text
Runtime Integrity #1948：success
Story Integrity   #1046：success
GitHub Pages      #5912：success
```

目前正式開發狀態：

```text
三大紀元正式 runtime                              ✅ 完成並維護／實測中
裝備自動處理政策                                  ✅ 完成
轉生核心資料與首輪隔離                            ✅ 完成
突破系統＋正式轉生                                ✅ 完成
異宇宙 Batch3～4                                  ✅ 完成
AU 架構優化第1～3批                               ✅ 完成
Batch5：W1／W2／W3 轉生後重征服                   ✅ 完成
Batch5 後續架構優化／主線向下征服                  ✅ 完成
Batch6：越級收益／批次成長／副本／封箱             ✅ 完成
Batch6 程式碼優化第1～5批                         ✅ 完成
Batch7：GM／測試工具正式收尾 7-1～7-5全部完成       ✅ 完成
Batch7 封箱後程式碼優化第1～4批                    ✅ 完成
第一紀元完整 Target Context 重構 Batch0～6          ✅ 完成
第一紀元 Target Context 重構後優化第1～4批          ✅ 完成
Code Cleanup Batch1～8                             ✅ 完成
轉生／GM／三紀元語義四批優化                       ✅ 完成
第一紀元基礎強化石成本平衡調整                     ✅ 完成
目前已排定工程                                     ✅ 全部完成
```

**目前沒有已經定案、等待施工的下一個功能批次。**

`PROJECT_PENDING_STATUS.md` 目前亦已更新為 Code Cleanup Batch1～8 全部完成、沒有已定案待辦；後續仍以 current main 為準。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前 fresh-read current main 的 `PROJECT_HANDOFF.md`、相關正式 owner／consumer；必要時再讀 `PROJECT_PENDING_STATUS.md`。
2. 使用者說「先討論／先檢查／先不要修改」時不得修改 GitHub；說「修改／做／執行／第N批」時可直接改 `main`，不用重複確認。
3. 每批修改後必須 fresh-read current main、compare base→head，自我檢查 UI／邏輯／正式 state 寫入／舊檔相容／transaction／runtime／Integrity。
4. JS／CSS production 修改必須同步更新 `index.html` cache-bust；Markdown-only 不需要。
5. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式。** 已有 registry／policy／transaction／normalizer／combat／offline／progression／target／world semantics owner 時，必須延伸正式 owner。
6. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark 不得污染 formal save。
7. Integrity／Actions 沒有 exact HEAD 的 success 不可宣稱綠燈。
8. W3 Story／Final 已完成，不自行重寫或擴增既有 11 篇正式主線。
9. 玩家正式用語固定：「10 名高維存在」、「突破等級」、「層域」。
10. `B`、`U37`、`1000U` 等只可作內部 shorthand，不重新出現在玩家正式 UI。
11. `offlineprogress.js` 是正式 compatibility/offline consumer；不得建立第二套 Offline pipeline。
12. W3 永久 HP settlement 契約 `formalStartHp → combatEndHp → permanent delta` 不得改變。
13. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner。
14. 轉生／重征服硬原則：`reincarnation.count = 0` 維持首輪；只有 `count > 0` 啟用 rerun。
15. AU replay/review 已完整移除，不復活。
16. Batch5／6／7、Code Cleanup Batch1～8、W1 Target Context Batch0～6＋優化1～4、2026-10-06 四批優化都已完成，不要因舊文件重做。
17. GM 正式 level 若未來新增／修改控制器，突破 milestone 必須共用正式 owner：首輪不發；轉生輪只在實際跨 100／200／…／1000 時發；已領不重複；降級不扣；Lv.1000 以上不再增加本輪突破。
18. 第一紀元正式 battle authority 是 Target Context；`selectedMap / selectedEnemy` 只作 UI/navigation selection，不得再作 battle execution target authority。
19. Target Context post-prepare execution 必須 fail closed；validator／lifecycle owner 缺失、context stale、identity 不一致時不得 fallback 回 UI selection。
20. 三紀元角色／裝備 world semantics 優先共用 `currentWorldPhase()`、`sharedEquipmentWorld()`、`characterWorldSnapshot()` 的 canonical owner，不自行重算 1/2/3 紀元。

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

current 正式 level owners：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

W1→W2：Lv500＋W1 final boss＋8專精60＋五部位+20＋10印記10；首輪要求 final Story，rerun Story bypass。

W2→W3：Lv1000＋W2 entered/final boss＋五部位+40＋文明10＋VIP20＋8專精60＋10印記10；首輪要求 final Story，rerun Story bypass。

轉生不取消 Lv500／Lv1000 世界邊界與養成條件。

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

目前所有後續優化與平衡修改都沒有新增必要 persistent root，因此 **仍不升 Schema18**。

正式相容邊界：

- Schema1～16：legacy import，必須走 canonical migration pipeline。
- Schema17：current canonical schema。
- Schema18+：未明示支援前 fail closed。
- legacy `SAVE_VERSION = 13`、`MAX_LEVEL = 500` 只作 compatibility alias，不是 current schema／absolute level owner。
- legacy cleanup 只由 `migrateSave()` 正式路徑持有，不建立第二套 runtime cleanup pipeline。

## GM transient save cleanup（2026-10-06 第4批完成）

`savemigration.js` current：

```text
GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION = 2
```

正式 migration inventory 共 11 個歷史 GM-only transient root：

```text
gmTestWorld
gmTestLevel
gmTestEquipment
gmTestEquipmentSource
gmTestVipLevel
gmTestEnhancementLevels
gmTestSpecializations
gmTestMarkLevels
gmTestCivilizationLevel
gmPowerBenchmark
gmTestResults
```

`cleanupTransientGmTestState()` 只在 migration owner 處理，並輸出 `LAST_GM_TEST_TRANSIENT_CLEANUP_REPORT` diagnostics；不新增正式 save state。

`tests/runtime/save-schema17-compatibility-matrix.js` 已擴充成：

```text
Schema1～17 × 全11個 GM transient keys
```

全部必須 migration 後清空，並驗證 diagnostics、formal runtime state 與 localStorage 不被 compatibility diagnostics 污染。

---

# 4. 突破系統＋正式轉生

首輪 `count=0` 突破固定 Lv.0。

轉生輪每一 life 跨：

```text
Lv.100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000
```

各 +1，每輪最多10；Lv1000～2000不再給。一次跨多級補發；已領不重複；降級不扣。

每1突破：

```text
raw equipment HP / ATK / DEF +2.5%
final damage +0.05
```

正式轉生資格：Lv2000＋本輪10名高維存在全滅＋界弦核心Lv10；Story completion 不列資格。

轉生保留：VIP、永久突破、稱號、設定、daily、Story／戰線閱讀歷史、Mirror／Void永久歷史、AU unlock/deepest、符合規則的W3 Lv2000裝備、1.5×永久使用權。

轉生重置：Lv/EXP、W1/W2/W3本輪進度、強化、專精、印記、文明、本輪Arena、資源、offline sample/pending、pending encounter、lostGear、AU activeAttempt/current-life failures、本輪突破 milestones。

---

# 5. 轉生永久裝備安全邊界（2026-10-06 四批優化第1批）

`reincarnationpermanentgearguard.js` current：

```text
VERSION = 3
POLICY = "evidence-gated-fallback-only"
REQUIRED_WORLD = 3
REQUIRED_LEVEL = 2000
```

只在「已轉生、尚未重新進入 W3 的 lower-world rerun」檢查 W3 永久裝備。

只接受以下證據作歷史損壞修復：

1. `reincarnationPermanentGear` marker 明確標記 retainedWorld=3、retainedLevel=2000。
2. legacy reward id 符合 `reward-3-2000-`。

有證據但 level 錯誤才修復為 Lv2000；模糊的 W3 裝備只記錄 warning，**不自動猜測修復**。

before-save hook：

```text
reincarnation-permanent-gear-levels
```

`savemigration.js` 已正式標記舊的 permanent gear load repair 退休：

```text
REINCARNATION_PERMANENT_GEAR_LOAD_REPAIR_RETIRED_VERSION = 1
```

shared equipment factory／world semantics 已改為依 W1/W2/W3 正式紀元上限，不再把 W3 裝備語義壓回兩紀元。

---

# 6. 異宇宙

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

# 7. Batch5／Batch6 正式現況

## Batch5 rerun

- W1/W2/W3 轉生後重征服完成。
- W1/W2 高階 Boss 勝利正式向下回填前段主線。
- W3 rerun 只解除5%戰線限制；Boss HP／能力／phase／永久HP settlement維持。

## Batch6 overlevel

正式 owner `reincarnationoverlevelrewards.js`：

```text
M = 1 + 0.03 × (enemyLevel - playerLevel)
```

只在 `count>0 && enemyLevel>playerLevel`；整數收益 `ceil(base × M)`；無 hard cap；裝備出售收益排除；W3 Offline 不接。

## Batch6 批次成長

`playerbatchupgrades.js`：

- W1 一鍵平均專精。
- W1/W2 平均最大強化。
- 共用正式成本與 shared transaction。
- W3 不提供。

## Batch6 四大副本永久入口

第一次轉生後 bounty／arena／mirror／void 入口永久；Daily 不刷新；Mirror/Void歷史保留；W1/W2 Arena current-life reset；永久入口不等於永久全 rank 解鎖。

## Batch6 Offline provenance

`OFFLINE_BATTLE_SAMPLE_VERSION = 4`；只有可靠 player/enemy level provenance 才可吃 overlevel；舊不可靠 sample／pending 固定1×。

---

# 8. Batch7：GM／測試工具正式收尾

## 7-1 GM 正式突破管理

- 只有 `count>0` 才顯示／可用。
- GM只設定總突破次數；系統 canonical rebuild 轉生次數與本輪 milestones。
- 可上下調；正式能力、存檔、戰鬥與相關UI同步。

## 7-2 角色能力測試同步突破

- 突破是測試角色能力，不是獨立模式。
- 「同步正式角色到測試設定」同步正式突破等級。
- sandbox 不寫正式 save。

## 7-3 GM 異宇宙正式管理

- 只設定「最深已完成層域」。
- 正數正式進度自動維持／建立解鎖。
- 正式操作走 shared transaction。
- 調整 frontier 會清理舊 attempt/current-life failures。

## 7-4 AU benchmark＋21雙trait diagnostics

- 異宇宙是既有戰力基準第8模式。
- GM UI 不暴露 21 trait diagnostics 操作面板。
- benchmark 共用正式 AU enemy/trait/combat/stat owner。

## 7-5 multi-life closure

鎖定首輪隔離、突破 milestone、AU deepest 跨life保留、offline reset、Arena current-life reset、Mirror/Void history、永久副本入口、overlevel、GM sandbox 隔離與8模式 benchmark。

---

# 9. GM 正式寫入與授權／lazy runtime（2026-10-06 四批優化第2～3批）

## 第2批：GM formal write 收斂

`gmformaltransaction.js` current：

```text
VERSION = 3
ENHANCEMENT_VERSION = 2
UI_CONVERGENCE_VERSION = 1
```

formal GM mutation 以 `runSettlementTransaction()` 為正式交易 owner；transaction owner 缺失時 fail closed。

已集中處理：

- 角色等級。
- W1正式進度。
- 金幣／暗物質／暗能量／維度之弦。
- 強化等級。
- 正式生成裝備。
- VIP reset。
- 副本正式值。
- Daily dungeon reset。
- 其他既有 formal writers。

GM Hub／GM tools 應以 UI／input 為主，不再維護第二套 `state → save()` 正式寫入責任。

## 第3批：GM 授權與 lazy runtime

GM authorization current 採 browser-local runtime semantics，不把授權本身作正式 save 進度。

正式原則：

- `state.gm` 只保留 runtime compatibility 用途。
- formal save 前暫時剝離 GM runtime authorization，save 後再還原 runtime flag。
- stale legacy save authorization 會被清除。
- lazy GM script group 失敗後可 retry，不把 rejected promise 永久卡死。
- 已授權 browser runtime reload 時可重新 lazy-load GM，再恢復 runtime GM 狀態。
- Story／GM／Integrity lazy-loading boundary 是 Code Cleanup 後刻意保留的 ownership boundary，不要為了減少檔案硬合併。

---

# 10. 角色／裝備三紀元 snapshot semantics（2026-10-06 四批優化第4批）

`playersemanticsui.js` current：

```text
PLAYER_SEMANTICS_UI_VERSION = 15
CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION = 1
CHARACTER_WORLD_SNAPSHOT_OWNER = "playersemanticsui"
```

`window.characterWorldSnapshot()` 的 runtime canonical result 現在正式以 `currentWorldPhase()` 為優先，輸出：

```text
W1 → world=1 / 銀河紀元 / cap=500
W2 → world=2 / 宇宙紀元 / cap=1000
W3 → world=3 / 高維紀元 / cap=2000
```

角色裝備來源共用 `sharedEquipmentWorld(item)` 的 1/2/3 紀元 semantics。

因此後續不得再自行用「是否 entered secondWorld」二分 character world，也不得重新建立兩紀元 snapshot fallback。

`tests/runtime/equipment-world-semantics-batch2-integrity.js` 與 Schema17 compatibility matrix 都已鎖定 W1/W2/W3 snapshot。

---

# 11. 第一紀元強化正式成本（2026-10-06 最新平衡）

current `enhancementcore.js`：

```text
FIRST_WORLD_ENHANCEMENT_CAP = 20
SECOND_WORLD_ENHANCEMENT_CAP = 40
BONUS_PERCENT_PER_LEVEL = 2.5

BASIC_COST_PER_TARGET_LEVEL = 25
ADVANCED_COST_PER_TARGET_LEVEL = 5
```

第一紀元 +1～+20 單次成本：

```text
基礎強化石 = 25 × 目標強化等級
進階強化石 = 5 × 目標強化等級
```

這個成本**首輪第一紀元與所有轉生後第一紀元共用**，不做轉生特例。

單一部位 +0→+20：

```text
基礎強化石：5,250
進階強化石：1,050
```

五部位全部 +20：

```text
基礎強化石：26,250
進階強化石：5,250
```

本次只把基礎石需求從原本 `50 × 目標等級` 減半為 `25 × 目標等級`；以下完全不變：

- 進階強化石公式。
- 每級 +2.5% 主能力。
- +20／+40 上限。
- 第二紀元 +21～+40 暗物質／暗能量成本。
- 強化石掉落量。
- 越級收益倍率。
- Save Schema。

`enhancementintegrity.js` current 已鎖定：

```text
+20 單次：basic=500 / advanced=100
單欄 +0→+20：basic=5250 / advanced=1050
```

`tests/runtime/player-batch-upgrades-batch6-2-integrity.js` 已同步新成本。

---

# 12. 第一紀元完整 Target Context 重構（Batch0～6＋優化1～4 已完成）

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
mode = formal / rerun / review
```

`selectedMap / selectedEnemy` 只作 UI/navigation selection。

正式 hard rules：

- post-prepare execution 不回頭用 selection reconstruction target。
- validator／lifecycle owner 缺失 fail closed。
- context stale、identity、life/count 不一致 fail closed。
- review formalRewards/formalProgress=false。
- rerun 沒有合法 prepared target 回 `prepared-target-required`。
- Special Encounter 吃 explicit parent Target Context。
- W1 Offline persisted map/enemy identity 轉 canonical Target Context。
- Offline sample 格式仍 V4，不因 Target Context 重構升版。
- Boss 不進 W1 offline sample。
- 重構沒有改 EXP、金幣、掉落率、Boss能力、special機率、Fast Catch-up 規則。

---

# 13. Code Cleanup Batch1～8（全部完成）

current `PROJECT_PENDING_STATUS.md` 已確認 Code Cleanup Batch1～8 全部完成。

核心正式邊界：

- legacy Schema1～17 支援保留。
- legacy cleanup 只屬 migration owner。
- Story／GM／Integrity lazy-loading boundary 保留。
- 歷史文件集中 `docs/archive/`，只供追溯，不作 current runtime owner。
- Runtime Integrity 有專門 regression 守住 legacy boundary。
- runtime API／compatibility owner／save hook owner 已收斂，不應再新增同責任 second owner。

---

# 14. Runtime／Integrity current baseline

`.github/workflows/runtime-integrity.yml` current 涵蓋：

- 全 JS syntax／owner integrity。
- Save/global writer／new-state/load pipeline。
- 真實 Chromium browser smoke。
- AU data／attempt／combat／failure／progression／UI／old-save。
- Batch5 rerun closure＋E2E。
- Batch6 overlevel／Offline provenance／batch upgrades／dungeon access／closure。
- Breakthrough core／final damage。
- Batch7 GM突破／角色sandbox／AU管理／AU benchmark／multi-life closure。
- Schema17 compatibility matrix。
- GM transient Schema1～17 cleanup matrix。
- 三紀元 character/equipment world semantics。
- 正式轉生 reset／transaction／UI／save migration。
- W1 Target Context Batch0～6＋優化1～4。
- VIP unlimited integrity。
- GM mainline HP lock integrity。
- asset integrity。
- documentation integrity。
- 第一紀元 batch enhancement regression。

current exact gameplay HEAD `d71aff23c353c34b819bc0a12b3a323be698055c`：

```text
Runtime Integrity #1948 = success
Story Integrity   #1046 = success
GitHub Pages      #5912 = success
```

---

# 15. current owner 索引

## World／Player semantics

`worldphase.js`、`thirdworldphase.js`、`levelprogression.js`、`playersemanticsui.js`、`equipmentrewardcore.js`。

## Reincarnation／Breakthrough

`reincarnationstate.js`、`reincarnationcore.js`、`breakthroughcore.js`、`reincarnationui.js`、`reincarnationrerunworld1.js`、`reincarnationrerunworld2.js`、`reincarnationrerunworld3.js`、`reincarnationrerunprogress.js`、`reincarnationoverlevelrewards.js`、`reincarnationdungeonaccess.js`、`reincarnationpermanentgearguard.js`。

## First World Target Context

`firstworldtargetcontext.js`、`battlepipeline.js`、`firstworldtargetcontextbatch4.js`、`firstworldtargetcontextbatch5.js`、`firstworldtargetcontextbatch6.js`、`specialencounter.js`、`offlineprogress.js`、`offlinestatecore.js`。

## Enhancement

`enhancementcore.js`、`enhancementui.js`、`enhancementrewards.js`、`enhancementcombat.js`、`playerbatchupgrades.js`、`enhancementintegrity.js`。

## Alternate Universe

`alternateuniversedata.js`、`alternateuniverseattempt.js`、`alternateuniversecombat.js`、`alternateuniverseprogression.js`、`alternateuniverseaccess.js`、`alternateuniverseui.js`、`traits.js`。

## Save／Offline／Runtime

`savemigration.js`、`saveversionguard.js`、`savehookcore.js`、`settlementtransaction.js`、`compatibilityowners.js`、`runtimeapi.js`、`scriptgrouploader.js`、`offlinestatecore.js`、`offlinefarmtarget.js`、`offlineprogress.js`、`offlineworld3adapter.js`。

## GM

`gmhub.js`、`gmhubextensions.js`、`gmformaltransaction.js`、`gmbreakthroughmanage.js`、`gmalternateuniversemanage.js`、`gmpowerbenchmark.js`、`gmpowerbenchmarkstate.js`、`gmpowerbenchmarkworldphase.js`、`gmalternateuniversebenchmark.js`、`vipgm.js`、`thirdworldarenagm.js`、`gmbatch16formalcontrols.js`。

---

# 16. 重要 bug 修正／防倒退規則

1. **永久 W3 裝備誤修**：只依 evidence-backed marker／legacy id 修歷史錯誤，ambiguous item 不猜測。
2. **GM formal writer 重複 owner**：正式 mutation 走 `gmformaltransaction.js`／shared transaction，不回復 direct `state→save()` 第二套寫入。
3. **GM lazy-load failure 卡死**：rejected lazy promise 必須可清除後 retry。
4. **GM 授權污染 save**：browser-local runtime authorization 不得當成正式玩家存檔進度。
5. **Schema1～17 GM test junk**：11個歷史 transient keys 全部 migration 清除。
6. **Character snapshot W3 被判成 W2**：canonical `characterWorldSnapshot()` 必須回正確 1/2/3 phase。
7. **Target Drift**：戰鬥開始後 UI selection 改變不得改變 active target。
8. **missing validator fallback**：正式 Target Context validator 缺失時 fail closed。
9. **review 污染 formal progression**：review 不得給 formal rewards/progress。
10. **rerun post-prepare 回讀 selection**：禁止。
11. **第一紀元基礎強化石過重**：正式成本已由 50×target 降為 25×target；不要讓 regression／guide／UI 回到舊公式。

---

# 17. 明確不要自行復活／擴充

1. 不把 AU 做成 Lv2001+ 或第四紀元。
2. 不讓 AU 敵人依玩家突破 dynamic scaling。
3. 不新增 AU 刷裝貨幣／資源收益。
4. 不要求轉生後重看已讀劇情。
5. 不取消 Lv500／Lv1000 紀元邊界與養成條件。
6. 不讓裝備出售收益吃 overlevel。
7. 不復活 AU replay/review。
8. 不讓 UI／GM 自行維護可衍生 lifeId／lock 等第二套狀態。
9. 不重做第二套 final damage、transaction、save backup、combat、offline、progression、target、world semantics owner。
10. 不恢復高階 Boss 只記自身、不正式回填前段主線的舊規則。
11. 不把四副本永久入口誤做成全部 Arena rank 永久全開。
12. 首輪 `count=0` 不可吃 rerun backfill、Story bypass、W3 5% bypass、overlevel 或突破。
13. 不把21 trait diagnostics塞進 GM 操作介面。
14. 不把戰力基準退回7模式；current正式為8模式。
15. 不讓 W1 battle execution 回頭用 `selectedMap / selectedEnemy` 作 target fallback。
16. 不把舊 GM transient test state 重新寫進 formal save。
17. 不因純 migration cleanup、runtime-only snapshot、GM runtime auth 而升 Schema18。
18. 不把第一紀元基礎強化石成本改回 50×target，除非使用者重新做平衡決策。

---

# 18. 目前尚未完成項目

**目前沒有已定案、等待施工的功能批次。**

現階段屬於正式遊玩／轉生實測與持續平衡調整期；後續若使用者提出新功能、新平衡、新 UI 或新重構，需重新 fresh-read current main 後再建立施工範圍。

---

# 19. 下一個對話如何接手

新對話請直接使用以下標準指令：

```text
讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，
再重新檢查 main 的實際程式碼與這次要處理功能的正式 owner／consumer，
完整承接《文明戰線》專案。

以 GitHub main 為唯一真實來源；不要只靠對話記憶、舊交接檔或歷史設計文件。
先確認目前 HEAD、Save Schema、相關 runtime/integrity、current world semantics 與既有正式 owner。

已完成的 Batch5／6／7、Batch7 封箱後優化、Code Cleanup Batch1～8、
第一紀元 Target Context Batch0～6與優化1～4、
轉生／GM／三紀元語義四批優化都不得重做或倒退。

若我說「先討論／先檢查／先不要修改」，只分析不要改 GitHub；
若我說「修改／做／執行／第N批」，可直接修改 main。

修改時優先改正式來源，不要另外堆 wrapper、fallback、第二套公式或第二套 owner。
JS／CSS production 改動要同步更新 index.html cache-bust。
修改後 fresh-read、compare base→head、自我檢查，
並以 exact HEAD 的 Runtime／Story／Pages Actions 結果為準。

現在先不要修改。
```
