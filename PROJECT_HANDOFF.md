# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-04（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引、已完成現況與尚未施工項目整理；與 current main 衝突時，一律以 current main 為準。

---

# 0. 本次交接基準

Batch7-5 功能封箱前最後確認的功能 HEAD：

```text
9b0480bd1d6835b4cf15647387f0de37f611b496
```

該 HEAD 已確認：

```text
Runtime Integrity #1655：success
Story Integrity #989：success
GitHub Pages build/deploy checks：success
```

Batch7-5 後續只更新交接／待辦文件與 docs integrity 規則，不改玩家 gameplay 公式。

目前正式開發狀態：

```text
三大紀元正式 runtime                     ✅ 完成並維護／實測中
裝備自動處理政策                         ✅ 完成
轉生核心資料與首輪隔離                   ✅ 完成
突破系統＋正式轉生                       ✅ 完成
異宇宙 Batch3～4                         ✅ 完成
AU 架構優化第1～3批                      ✅ 完成
Batch5：W1／W2／W3 轉生後重征服          ✅ 完成
Batch5 後續架構優化／主線向下征服         ✅ 完成
Batch6：越級收益／批次成長／副本／封箱    ✅ 完成
Batch6 程式碼優化第1～5批                ✅ 完成
Batch7：GM／測試工具正式收尾 7-1～7-5     ✅ 完成
第一紀元完整 Target Context 重構          ⏳ 尚未施工
```

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前 fresh-read current main 的 `PROJECT_HANDOFF.md` 與真正 owner／consumer。
2. 使用者說「先討論／先檢查／先不要修改」時不得修改 GitHub；說「修改／做／執行／第N批」時可直接改 `main`。
3. 每批修改後 fresh-read current main、compare base→head、自我檢查 UI／邏輯／正式資料寫入／舊檔相容／runtime／Integrity。
4. JS／CSS production 修改必須同步更新 `index.html` cache-bust；Markdown-only 不需要。
5. 優先延伸正式 registry／policy／transaction／normalizer／combat／offline／progression owner；不要新增第二套公式、combat engine、offline pipeline、migration owner、completion owner。
6. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark 不得污染 formal save。
7. Integrity／Actions 沒有 exact HEAD 的 success 不可宣稱綠燈。
8. W3 Story／Final 已完成，不自行重寫或擴增既有11篇正式主線。
9. 玩家正式用語：「10 名高維存在」；突破用「突破等級」；AU 玩家進度用「層域」。
10. `B`、`U37`、`1000U` 等只可作內部 shorthand，不應重新出現在玩家正式 UI。
11. `offlineprogress.js` 仍是正式 compatibility/offline consumer，不另建第二套 Offline pipeline。
12. W3 永久 HP settlement 契約 `formalStartHp → combatEndHp → permanent delta` 不得改變。
13. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner。
14. 轉生／重征服硬原則：`reincarnation.count = 0` 維持首輪；只有 `count > 0` 啟用 rerun。
15. AU replay/review 已完整移除，不復活。
16. AU 200 個正式名稱已進 main；改名要重新核對正式定案檔，不 invent。
17. Batch5／6／7 都已完成，不要因舊 handoff 或舊對話重做。
18. GM 正式 level 若未來新增／修改控制器，突破 milestone 必須共用正式 owner：首輪不發；轉生輪只跨100／200／…／1000時發；已領不重複；降級不扣；Lv.1000以上不再增加本輪突破。

---

# 2. current main：三紀元正式基準

`currentWorldPhase()` 正式 mapping：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

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

Batch5／6／7 沒有新增正式 persistent root，因此不升 Schema18。

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

AU normalization：deepest>0 salvage unlocked；activeAttempt 必須等於 frontier；該層10敗或非frontier的 attempt 會清除；舊 failure 可 canonicalize；首輪突破污染會清除。

正式大型 mutation 共用 Save Safety＋`runSettlementTransaction()`；正式轉生需 verified backup 後才 mutation。

---

# 4. 突破系統＋正式轉生（已完成）

首輪 `count=0` 突破固定 Lv.0。

轉生輪每一 life 跨：

```text
Lv.100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000
```

各 +1，每輪最多10；Lv1000～2000不再給。一次跨多級補發；已領不重複；降級不扣。

每1突破：raw equipment HP／ATK／DEF +2.5%，final damage +0.05。

正式轉生資格：Lv2000＋本輪10名高維存在全滅＋界弦核心Lv10；Story completion不列資格。

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
- W1/W2 高階 Boss 勝利會正式向下回填前段主線，不維護「最高flag＋假coverage」第二語意。
- W3 rerun 只解除5%戰線限制；Boss HP／能力／phase／永久HP settlement維持。

## Batch6 overlevel

正式 owner `reincarnationoverlevelrewards.js`：

```text
M = 1 + 0.03 × (enemyLevel - playerLevel)
```

只在 `count>0 && enemyLevel>playerLevel`；整數收益 `ceil(base × M)`；無hard cap；裝備出售收益排除；W3 Offline不接。

## Batch6 批次成長

`playerbatchupgrades.js`：W1一鍵平均專精；W1/W2平均最大強化；共用正式成本與 shared transaction；W3不提供。

## Batch6 四大副本永久入口

第一次轉生後 bounty／arena／mirror／void 入口永久；Daily不刷新；Mirror/Void歷史保留；W1/W2 Arena current-life reset；永久入口不等於永久全rank解鎖。

## Batch6 Offline provenance

`OFFLINE_BATTLE_SAMPLE_VERSION=4`；只有可靠 player/enemy level provenance 才可吃 overlevel，舊不可靠sample／pending固定1×。

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
- benchmark共用正式 AU enemy/trait/combat/stat owner。

## 7-5 最終封箱

新增 `tests/runtime/reincarnation-batch7-closure.js` 並納入 Runtime Integrity，實際鎖定：

- 首輪突破隔離。
- Life1跨100～1000得到10突破、重複不發、Lv1000以上不再發。
- Life2永久突破保留、本輪milestones重置；降級不扣／不重發。
- AU deepest跨life保留；activeAttempt/current-life failures重置。
- Offline samples/pending settlement 轉生清除。
- W1/W2 Arena current-life reset；Mirror/Void history保留。
- 四副本永久入口與 overlevel 在多生命週期維持。
- GM AU formal snapshot read-only；GM test breakthrough與AU benchmark不污染formal state、不formal save。
- 戰力基準正式8模式；清空 `0 / 8`，AU測完 `1 / 8`。
- 角色能力設定變更後舊benchmark結果立即失效回 `0 / 8`，修正未測卻殘留 `1 / 7`。
- AU王編號同頁保留，reload/new page回1。

current版本重點：

```text
GM_ALTERNATE_UNIVERSE_BENCHMARK_VERSION = 2
GM_ALTERNATE_UNIVERSE_BENCHMARK_INTEGRATION_VERSION = 2
GM_POWER_BENCHMARK_MODE_STATE_VERSION = 2
正式 benchmark modes = 8
```

---

# 8. GM current main 原則

GM Hub 維持「管理／測試」分離。

正式管理包含一般角色、VIP、專精、強化、印記、文明、W1/W2/W3正式進度、突破、AU正式進度、副本、匯出匯入等。

測試包含角色能力、8種戰力基準、稱號預覽、劇情等；所有測試 sandbox 不污染 formal save。

異宇宙第8戰力模式直接使用角色能力測試 snapshot；突破能力跟著同步正式角色進測試設定。

---

# 9. Runtime／Integrity current baseline

Runtime Integrity current 包含：

- 全JS syntax／owner integrity。
- Save/global writer／new-state/load pipeline。
- 真實Chromium browser smoke。
- AU data／attempt／combat／failure／progression／UI／old-save。
- Batch5 rerun closure＋E2E。
- Batch6 overlevel／Offline provenance／batch upgrades／dungeon access／Batch6 closure。
- Breakthrough core／final damage。
- Batch7-1 GM突破。
- Batch7-2 GM角色突破sandbox。
- Batch7-3 AU正式管理。
- Batch7-4 AU benchmark＋21 trait diagnostics。
- Batch7-5 `reincarnation-batch7-closure.js`。
- 正式轉生 reset／transaction／UI／save migration。

功能 HEAD `9b0480bd...` 已實際確認 Runtime Integrity #1655 success；GitHub Pages build/deploy check success。

---

# 10. 真正下一個尚未完成工程：第一紀元完整 Target Context 重構

**這是 Batch7 之後獨立大型工程，目前尚未施工。**

不是玩法重做，而是把 W1 target data propagation 收斂為同一次 battle 使用同一份明確 context：

```text
UI → prepare → encounter → combat → settlement → progression
```

核心 identity：

```text
mapIndex / enemyIndex
```

需覆蓋：普通、菁英、Boss、單場、連續、Minimal Mode、Fast Catch-up、特殊遭遇、Offline sample、回顧戰隔離、settlement、progression。

必須保留：首輪 sequential progression、地圖／Boss解鎖、回顧戰零收益／零正式紀錄、rerun向下征服、越級收益、Offline、特殊遭遇、Fast Catch-up。

不可建立第二套 progression/combat/offline/target owner。

開工前先 fresh-read W1 battle／encounter／settlement／offline／progression consumer，並先用現有 regression 當 baseline，證明「架構改、玩法語意不變」。

---

# 11. 重要 owner 索引

## Reincarnation／Breakthrough
`reincarnationstate.js`、`reincarnationcore.js`、`breakthroughcore.js`、`reincarnationui.js`、`reincarnationrerunworld1.js`、`reincarnationrerunworld2.js`、`reincarnationrerunworld3.js`、`reincarnationrerunprogress.js`、`reincarnationoverlevelrewards.js`、`reincarnationdungeonaccess.js`。

## Alternate Universe
`alternateuniversedata.js`、`alternateuniverseattempt.js`、`alternateuniversecombat.js`、`alternateuniverseprogression.js`、`alternateuniverseaccess.js`、`alternateuniverseui.js`、`traits.js`。

## Save／Offline
`savemigration.js`、`saveversionguard.js`、`settlementtransaction.js`、`offlinestatecore.js`、`offlinefarmtarget.js`、`offlineprogress.js`、`offlineworld3adapter.js`。

## GM
`gmhub.js`、`gmhubextensions.js`、`gmformaltransaction.js`、`gmbreakthroughmanage.js`、`gmalternateuniversemanage.js`、`gmpowerbenchmark.js`、`gmpowerbenchmarkstate.js`、`gmpowerbenchmarkworldphase.js`、`gmalternateuniversebenchmark.js`、`vipgm.js`、`thirdworldarenagm.js`。

---

# 12. 明確不要自行復活／擴充

1. 不把AU做成Lv2001+或第四紀元。
2. 不讓AU敵人依玩家突破dynamic scaling。
3. 不新增AU刷裝貨幣／資源收益。
4. 不要求轉生後重看已讀劇情。
5. 不取消Lv500／Lv1000紀元邊界與養成條件。
6. 不讓裝備出售收益吃overlevel。
7. 不復活AU replay/review。
8. 不讓UI／GM自行維護可衍生lifeId／lock等第二套狀態。
9. 不重做第二套final damage、transaction、save backup、combat、offline owner。
10. 不恢復「高階Boss只記自身、不正式回填前段主線」舊規則。
11. 不把四副本永久入口誤做成全部Arena rank永久全開。
12. 首輪`count=0`不可吃rerun backfill、Story bypass、W3 5% bypass、overlevel或突破。
13. 不把21 trait diagnostics塞進GM操作介面。
14. 不把戰力基準退回7模式；current正式為8模式。

---

# 13. 原定7大批最新進度

```text
第1批：轉生核心資料與首輪隔離                     ✅ 完成
第2批：突破系統＋正式轉生                         ✅ 完成
第2批後優化1～4                                   ✅ 完成
第3批：異宇宙最小可玩版                           ✅ 完成
第4批：異宇宙完整化／UI／平衡／Regression          ✅ 完成
AU 架構優化第1～3批                               ✅ 完成
第5批：W1／W2／W3 轉生後重征服                    ✅ 完成
第5批後架構優化／主線向下回填                     ✅ 完成
第6批：越級收益／批次成長／Offline／四副本／封箱   ✅ 完成
第6大批程式碼優化第1～5批                        ✅ 完成
第7批：GM／測試／完整Integrity收尾 7-1～7-5        ✅ 完成
```

**下一個主要正式工程：第一紀元完整 Target Context 重構。**
