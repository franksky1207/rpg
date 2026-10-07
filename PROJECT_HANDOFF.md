# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-07（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只負責交接、索引與正式現況整理；若本檔、舊對話、舊設計文件、歷史文件或其他摘要與 current main 衝突，一律以 current main 為準。

---

# 0. 本次交接基準

本次交接已重新 fresh-read current `main` 的實際程式碼、近期 125 個 commit、正式 owner／consumer、Save migration、GM、稱號、異宇宙、鏡像戰、第三紀元副本／重征服與 Runtime regression。

更新本交接檔前的 gameplay HEAD：

```text
3555bd7e8014837e6c241da054efe541a20ec413
```

該 exact HEAD 已確認：

```text
Runtime Integrity #2073 = success
GitHub Pages      #6038 = success
```

Runtime Integrity #2073 的 syntax／owner、Chromium browser smoke、VIP、GM mainline HP lock、asset、documentation 與新增 closure regression 全部 success。

目前正式開發狀態：

```text
三大紀元正式 runtime                                   ✅ 完成並維護／實測中
裝備自動處理政策                                       ✅ 完成
轉生核心資料與首輪隔離                                 ✅ 完成
突破系統＋正式轉生                                     ✅ 完成
異宇宙 Batch3～4                                       ✅ 完成
AU 架構優化第1～3批                                    ✅ 完成
Batch5：W1／W2／W3 轉生後重征服                        ✅ 完成
Batch6：越級收益／批次成長／副本／封箱                 ✅ 完成
Batch7：GM／測試工具正式收尾 7-1～7-5全部完成             ✅ 完成
第一紀元完整 Target Context 重構 Batch0～6＋優化1～4     ✅ 完成
Code Cleanup Batch1～8                                  ✅ 完成
轉生／GM／三紀元語義四批優化                            ✅ 完成
異宇宙稱號 Batch1～4                                   ✅ 完成
GM 異宇宙重複稱號快速預覽入口退休                      ✅ 完成
第三紀元副本 era／qualification access 收斂             ✅ 完成
鏡像戰正式 settlement／GM 正式裁定收斂                  ✅ 完成
AU 稱號門檻 data owner／migration diagnostics 收斂       ✅ 完成
Schema17 舊檔相容矩陣＋近期優化 Batch4 closure          ✅ 完成
目前已排定工程                                          ✅ 全部完成
```

**劇情／轉生隔離新工程第1～4批已全部完成：戰線紀錄唯讀解鎖、三紀元轉生後劇情觸發分流、高維本輪10王戰鬥完成判定、Schema17 舊檔與跨紀元重新載入整體回歸均已封箱。**

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
16. 第一紀元正式 battle authority 是 Target Context；`selectedMap / selectedEnemy` 只作 UI/navigation selection，不得再作 battle execution target authority。
17. Target Context post-prepare execution 必須 fail closed；validator／lifecycle owner 缺失、context stale、identity 不一致時不得 fallback 回 UI selection。
18. 三紀元角色／裝備 world semantics 優先共用 `currentWorldPhase()`、`sharedEquipmentWorld()`、`characterWorldSnapshot()`。
19. 異宇宙稱號門檻以 `alternateuniversedata.js` 的 `depthThreshold` 為唯一資料來源，不得重新寫 `depth/100` 第二套公式。
20. 第三紀元副本「永久資格」不得繞過紀元 availability；尤其懸賞戰在 W3 必須保持關閉。
21. 鏡像玩家結算與 GM 正式裁定共用 `settleMirrorDungeonResult()`，不得重做第二套歷史／稱號 settlement。

---

# 2. 三紀元正式基準

`currentWorldPhase()`：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式 persistent world roots 維持 `secondWorld` 與 `thirdWorld`。

正式等級：

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

正式 level owner：

```text
FIRST_WORLD_LEVEL_CAP  = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP  = 2000
ABSOLUTE_MAX_LEVEL     = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

W1→W2：Lv500＋W1 final boss＋8專精60＋五部位+20＋10印記10；首輪要求 final Story，rerun Story bypass。

W2→W3：Lv1000＋W2 entered/final boss＋五部位+40＋文明10＋VIP20＋8專精60＋10印記10；首輪要求 final Story，rerun Story bypass。

轉生不取消 Lv500／Lv1000 世界邊界與養成條件。

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

仍**不升 Schema18**。異宇宙稱號沿用既有 `titles` root：

```js
{ version: 1, unlocked: [], equipped: null, pendingNotice: null }
```

相容邊界：

- Schema1～16：legacy import，走 canonical migration。
- Schema17：current canonical schema。
- Schema18+：未明示支援前 fail closed。
- legacy `SAVE_VERSION=13`、`MAX_LEVEL=500` 只作 compatibility alias。
- legacy cleanup 只屬 `migrateSave()` 正式 migration owner。

## GM transient cleanup

`GM_TEST_TRANSIENT_KEY_INVENTORY_VERSION = 2`，正式 migration 清除 11 個歷史 GM-only transient keys：

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

## 2026-10-07 migration diagnostics

`SAVE_MIGRATION_DIAGNOSTICS_VERSION = 1`。

`LAST_SAVE_MIGRATION_REPORT` 現在另外記錄：

- `alternateUniverseTitlesBackfilled`
- `alternateUniverseTitlesBackfilledIds`
- `mirrorHistoryInitialized`
- `mirrorHistoryRepaired`
- `mirrorMiracleDatesRemoved`

用途是讓舊存檔稱號／鏡像歷史修復可被 regression 明確驗證，不建立新的 persistent state。

---

# 4. 突破系統＋正式轉生

首輪 `count=0` 突破固定 Lv.0。

轉生輪跨 Lv.100／200／…／1000，各 +1，每輪最多10；Lv1000～2000不再給。一次跨多級補發；已領不重複；降級不扣。

每1突破：

```text
raw equipment HP / ATK / DEF +2.5%
final damage +0.05
```

正式轉生資格：Lv2000＋本輪10名高維存在全滅＋界弦核心Lv10；Story completion 不列資格。

轉生保留：VIP、永久突破、稱號、設定、daily、Story／戰線閱讀歷史、Mirror／Void永久歷史、AU unlock/deepest、符合規則的W3 Lv2000裝備、1.5×永久使用權。

轉生重置：Lv/EXP、W1/W2/W3本輪進度、強化、專精、印記、文明、本輪Arena、資源、offline sample/pending、pending encounter、lostGear、AU activeAttempt/current-life failures、本輪突破 milestones。

---

# 5. 轉生永久裝備安全邊界

`reincarnationpermanentgearguard.js`：

```text
VERSION = 3
POLICY = "evidence-gated-fallback-only"
REQUIRED_WORLD = 3
REQUIRED_LEVEL = 2000
```

只在「已轉生、尚未重新進入 W3 的 lower-world rerun」檢查 W3 永久裝備。

只接受明確 marker 或 legacy `reward-3-2000-` 證據作歷史損壞修復；模糊 W3 裝備只 warning，不猜測修復。

---

# 6. 異宇宙正式基準

異宇宙不是第四紀元：200宇宙 × 5層域 = 1000層域。

正式敵人基礎公式：

```text
HP    = 320000 + 30000U + 1500U²
ATK   = 26000 + 600U
DEF   = 12000 + 250U
CRIT  = 20%
DODGE = 20%
```

7種 canonical traits：

```text
strong / ferocious / hard / swift / deadly / berserk / giant
```

每次正式 attempt 固定2個不同 traits。

同一 life、同一 frontier 第10敗鎖到下一次轉生。正式轉生保留 deepestCleared，清 activeAttempt/current-life failures。

AU 共用正式 combat/stat/specialization/marks/VIP/equipment/breakthrough/final-damage owner；無 EXP／資源／裝備收益。

第一次 W3 10名高維存在全滅後永久解鎖；之後任何轉生輪／任何紀元／任何等級可進。

---

# 7. 異宇宙稱號系統（2026-10-06～10-07，Batch1～4 完成）

## 正式 catalog

`playertitlecore.js` current：

```text
PLAYER_TITLE_STATE_VERSION = 1
PLAYER_TITLE_CATALOG_VERSION = 5
PLAYER_TITLE_CANONICAL_CATALOG_VERSION = 4
PLAYER_TITLE_THIRD_WORLD_CATALOG_EXTENSION_VERSION = 1
PLAYER_TITLE_ALTERNATE_UNIVERSE_CATALOG_EXTENSION_VERSION = 1
PLAYER_TITLE_UNIFIED_DEFS_VERSION = 2
PLAYER_TITLE_MIRROR_LAST_ORDER_VERSION = 1
PLAYER_TITLE_ALTERNATE_UNIVERSE_THRESHOLD_OWNER_VERSION = 1
PLAYER_TITLE_NORMALIZATION_DIAGNOSTICS_VERSION = 1
```

正式稱號共 **46 個**：

```text
銀河災厄 10
宇宙災厄 10
高維 10
異宇宙 10
鏡像戰 6
```

正式顯示／持久化順序固定：

```text
銀河 → 宇宙 → 高維 → 異宇宙 → 鏡像
```

鏡像稱號永遠最後，保留其最稀有系列定位。

## 異宇宙10階門檻與名稱

唯一資料來源是 `alternateuniversedata.js` 的 `ALTERNATE_UNIVERSE_TITLE_ROWS`：

```text
100  層域：異界凌越
200  層域：萬界破境
300  層域：異律掌御
400  層域：諸宇錯序
500  層域：萬律凌駕
600  層域：諸界超脫
700  層域：萬宇無疆
800  層域：諸界歸一
900  層域：宇外凌絕
1000 層域：宇外無極
```

稱號 owner 依 `depthThreshold` 判定，不再維護 `deepest/100` 第二套推導。

## 取得／補發／永久性

- 正式越過門檻時可一次補齊跨過的多階稱號。
- 若一次跨多階，只把**最高新階**設成 `pendingNotice`。
- 舊存檔 normalization 會依正式 deepestCleared **靜默補發**應有 AU 稱號，不建立 pending notice。
- 已取得 AU 稱號是永久榮譽；之後 deepestCleared 降低也不回收 `unlocked`、`equipped`、`pendingNotice`。
- 正式轉生保留 AU 稱號、裝備中的稱號與待通知狀態。
- `LAST_PLAYER_TITLE_NORMALIZATION_REPORT` 會記錄 AU backfill IDs。

## 視覺

`playertitlesalternateuniverse.css` 是 AU 稱號專屬視覺 owner，10階各自有正式 selector；風格語義為重疊宇宙／法則干涉／phase displacement，不回到封閉方框。含 600px 與 360px mobile protection。

renderer current：

```text
PLAYER_TITLE_RENDERER_VERSION = 5
PLAYER_TITLE_ALTERNATE_UNIVERSE_RENDERER_VERSION = 1
PLAYER_TITLE_ALTERNATE_UNIVERSE_PRESENTATION_VERSION = 1
```

---

# 8. GM 稱號預覽與異宇宙正式管理

## GM 稱號預覽：只保留單一46稱號選單

`playertitlegmpreview.js` current：

```text
GM_PLAYER_TITLE_PREVIEW_VERSION = 11
GM_PLAYER_TITLE_PREVIEW_ALL_CATALOG_VERSION = 6
GM_PLAYER_TITLE_PREVIEW_CANONICAL_CATALOG_VERSION = 6
GM_PLAYER_TITLE_PREVIEW_DISPLAY_ORDER_VERSION = 4
GM_PLAYER_TITLE_PREVIEW_REDUNDANT_AU_QUICK_RETIRED_VERSION = 1
```

目前 GM 稱號預覽只有既有的**完整46稱號下拉選單**＋實戰名稱預覽。

先前曾新增的「異宇宙 1～10 階快速視覺測試」十顆按鈕已確認與上方下拉重複，已完整退休；相關 integrity 也已改成明確禁止該區塊復活。

GM 稱號預覽是 sandbox：

- 不解鎖正式稱號。
- 不改 equipped。
- 不改 AU deepest。
- 不改正式 save。

## GM 異宇宙正式管理

`gmalternateuniversemanage.js` current：

```text
GM_ALTERNATE_UNIVERSE_MANAGEMENT_VERSION = 4
GM_ALTERNATE_UNIVERSE_CANONICAL_MUTATION_VERSION = 3
GM_ALTERNATE_UNIVERSE_TRANSACTION_VERSION = 1
GM_ALTERNATE_UNIVERSE_FORMAL_SNAPSHOT_OWNER_VERSION = 2
GM_ALTERNATE_UNIVERSE_TITLE_SYNC_VERSION = 2
GM_ALTERNATE_UNIVERSE_TITLE_THRESHOLD_OWNER_VERSION = 1
```

正式管理只設定「最深已完成層域」：

- 正數 progress 會維持／建立 AU unlock。
- 同一 shared transaction 內同步補發達標 AU 稱號。
- 降低 progress 不回收已取得 AU 稱號。
- 調整 formal frontier 會清 activeAttempt 與 current-life failures。
- 0 不會把已解鎖 AU 自動鎖回。
- UI 會顯示目前稱號、下一稱號與門檻。

---

# 9. 鏡像戰：正式 settlement 與 GM 裁定收斂

`mirrordungeonstate.js` current：

```text
MIRROR_DUNGEON_STATE_VERSION = 3
MIRROR_DUNGEON_SETTLEMENT_OWNER_VERSION = 1
MIRROR_MIRACLE_DATE_DEDUP_VERSION = 1
```

玩家正式鏡像戰完成統一走：

```js
settleMirrorDungeonResult(...)
```

該 owner 同時負責：

- daily 結束狀態。
- history bestWins／bestDate。
- 15～20勝稱號 settlement。
- 20勝神蹟日期。
- miracleDates 去重。

舊存檔若有重複神蹟日期，normalization 會去重並由 migration diagnostics 回報移除數量。

## GM 正式鏡像戰結果

`mirrordungeongm.js`：

```text
GM_MIRROR_FORMAL_RESULT_VERSION = 2
GM_MIRROR_FORMAL_MIN_WINS = 15
```

GM 正式裁定：

- 只接受 **15～20勝**。
- 只允許提升歷史最高，不能降。
- 直接委派給 `settleMirrorDungeonResult(..., {requireRunning:false, requireUpgrade:true})`。
- 同步正式歷史與稱號。
- 20勝同步神蹟紀錄。
- 不補發 VIP 積分。
- 鏡像戰正在進行時不得介入正式結果。

GM 副本管理頁已正式接入 15～20 勝裁定按鈕。

---

# 10. 第三紀元副本 access 收斂

第三紀元副本紀元規則唯一 owner 是：

```text
thirdworlddungeonui.js
THIRD_WORLD_DUNGEON_ERA_POLICY_OWNER = "thirdworlddungeonui"
```

current：

```text
THIRD_WORLD_DUNGEON_UI_VERSION = 7
DUNGEON_MODE_AVAILABILITY_POLICY_VERSION = 5
THIRD_WORLD_DUNGEON_BOUNTY_HIDDEN_VERSION = 2
```

`reincarnationdungeonaccess.js` current：

```text
REINCARNATION_DUNGEON_ACCESS_VERSION = 4
REINCARNATION_DUNGEON_ERA_RESTRICTION_VERSION = 2
REINCARNATION_DUNGEON_ERA_POLICY_DELEGATION_VERSION = 1
REINCARNATION_DUNGEON_ACCESS_SNAPSHOT_VERSION = 2
```

access 已正式拆成兩層：

1. **qualification**：等級或「轉生後永久入口資格」。
2. **era availability**：目前紀元是否允許該副本。

snapshot 明確提供：

```text
permanentUnlocked
levelUnlocked
qualificationUnlocked
eraVisible
eraEnabled
eraAllowed
effectiveEnabled
unlocked = effectiveEnabled
```

因此「第一次轉生後永久入口」只代表 qualification 永久成立，**不能繞過紀元禁用**。

最重要的 current 規則：

> **高維紀元懸賞戰仍關閉。即使玩家已轉生、permanentUnlocked=true，W3 仍必須 eraAllowed=false、effectiveEnabled=false、visible=false、enabled=false。**

Arena／Void／Mirror 依各自 current era policy，不可把「永久入口」誤解成所有紀元無條件可用。

---

# 11. W3 重征服／settlement continuation 最新規則

W3 rerun 仍只對 `count>0` 生效；首輪不吃 rerun bypass。

`thirdworldprogress.js` current：

```text
THIRD_WORLD_PROGRESS_VERSION = 7
THIRD_WORLD_SETTLEMENT_VERSION = 5
THIRD_WORLD_STAGE_CROSSING_SETTLEMENT_VERSION = 2
THIRD_WORLD_REINCARNATION_STAGE_CONTINUATION_VERSION = 2
THIRD_WORLD_REINCARNATION_PROGRESS_EVENT_CONTINUATION_VERSION = 1
THIRD_WORLD_CONTINUATION_DECISION_VERSION = 2
```

正式 rerun policy 由 reincarnation lifecycle 的 `worldRerunPolicy` 提供；owner 缺失時 fail closed。

rerun current 行為：

- 仍解除首輪 5% 戰線限制。
- Boss HP／能力／phase／永久 HP settlement 不變。
- rerun 中跨 boss stage 時，不再因首輪能力解鎖 stage transition 強制中斷連續戰鬥。
- rerun 中 title/story aggregate progress event 可 bypass presentation stop，不重複把已完成首輪流程當成必要停點。
- **Boss 正式擊破仍是 terminal reason，不能被 rerun continuation 吃掉。**
- 首輪仍保留正常 title/story/stage event presentation。

新增 regression 鎖住：stage crossing、progress event、boss defeat、5% front 與正式 settlement 的順序不可倒退。

---

# 12. 災厄／戰鬥入口 transient UI 收斂

近期 UI 優化把戰鬥入口 viewport reset 收斂成共用 owner：

```js
resetBattleEntryViewport()
```

銀河文明災厄與宇宙文明災厄進戰鬥後共用該 owner，不再各自維護不同 scroll reset。

宇宙文明災厄 current：

```text
SECOND_WORLD_CALAMITY_UI_VERSION = 7
SECOND_WORLD_CALAMITY_BATTLE_ENTRY_SCROLL_RESET_VERSION = 2
SECOND_WORLD_CALAMITY_UI_TRANSIENT_STATE_VERSION = 1
SECOND_WORLD_CALAMITY_LIVE_PRESENTATION_VERSION = 1
SECOND_WORLD_CALAMITY_MINIMAL_MODE_VERSION = 3
```

transient UI lifecycle 已收斂，live／minimal mode 完成後同步正式畫面，不把 UI 暫態資料寫進 formal save。

第一紀元特殊遭遇也已接入共用 Fast Catch-up presentation policy：

```text
SPECIAL_ENCOUNTER_FAST_CATCH_UP_PRESENTATION_VERSION = 1
SPECIAL_ENCOUNTER_W1_EXPLICIT_TARGET_VERSION = 1
SPECIAL_ENCOUNTER_THIRD_WORLD_GUARD_VERSION = 1
```

---

# 13. Batch5／6／7 仍有效基準

## Batch5 rerun

- W1/W2/W3 轉生後重征服完成。
- W1/W2 高階 Boss 勝利正式向下回填前段主線。
- W3 rerun 只解除5%戰線限制；Boss能力與永久HP settlement維持。

## Batch6 overlevel

`reincarnationoverlevelrewards.js`：

```text
M = 1 + 0.03 × (enemyLevel - playerLevel)
```

只在 `count>0 && enemyLevel>playerLevel`；整數收益 `ceil(base × M)`；無 hard cap；裝備出售排除；W3 Offline 不接。

## Batch6 批次成長

`playerbatchupgrades.js`：

- W1 一鍵平均專精。
- W1/W2 平均最大強化。
- 共用正式成本與 shared transaction。
- W3 不提供。

## Batch6 Offline provenance

`OFFLINE_BATTLE_SAMPLE_VERSION = 4`；只有可靠 player/enemy level provenance 才可吃 overlevel；舊不可靠 sample／pending 固定1×。

## Batch7 GM

- GM 正式突破管理 only count>0。
- 角色能力測試突破是 sandbox，不污染 save。
- AU benchmark 是戰力基準第8模式。
- 21 trait diagnostics 不暴露成 GM 操作面板。
- multi-life closure 鎖定 milestone、AU deepest、Offline reset、Arena reset、Mirror/Void history、永久副本資格、overlevel、sandbox 隔離。

---

# 14. GM 正式寫入／授權／lazy runtime

`gmformaltransaction.js`：

```text
VERSION = 3
ENHANCEMENT_VERSION = 2
UI_CONVERGENCE_VERSION = 1
```

formal GM mutation 以 `runSettlementTransaction()` 為正式交易 owner；缺失時 fail closed。

GM authorization 採 browser-local runtime semantics，不把授權本身作正式玩家進度。

正式原則：

- formal save 前剝離 GM runtime authorization，save 後還原 runtime flag。
- stale legacy save authorization 會清除。
- lazy GM script group 失敗後可 retry。
- Story／GM／Integrity lazy-loading boundary 是正式 runtime ownership boundary，不硬合併。

---

# 15. 三紀元角色／裝備 semantics

`playersemanticsui.js`：

```text
PLAYER_SEMANTICS_UI_VERSION = 15
CHARACTER_WORLD_SNAPSHOT_CANONICAL_PHASE_VERSION = 1
CHARACTER_WORLD_SNAPSHOT_OWNER = "playersemanticsui"
```

`characterWorldSnapshot()` 優先用 `currentWorldPhase()`：

```text
W1 → world=1 / 銀河紀元 / cap=500
W2 → world=2 / 宇宙紀元 / cap=1000
W3 → world=3 / 高維紀元 / cap=2000
```

裝備來源共用 `sharedEquipmentWorld(item)`；不要回到「是否 entered secondWorld」二分法。

---

# 16. 第一紀元強化正式成本

`enhancementcore.js`：

```text
FIRST_WORLD_ENHANCEMENT_CAP = 20
SECOND_WORLD_ENHANCEMENT_CAP = 40
BONUS_PERCENT_PER_LEVEL = 2.5
BASIC_COST_PER_TARGET_LEVEL = 25
ADVANCED_COST_PER_TARGET_LEVEL = 5
```

W1 +1～+20 單次：

```text
基礎強化石 = 25 × 目標強化等級
進階強化石 = 5 × 目標強化等級
```

單部位 +0→+20：

```text
基礎 5,250
進階 1,050
```

五部位：

```text
基礎 26,250
進階 5,250
```

不要自行改回舊的 50×target。

---

# 17. 第一紀元 Target Context

正式鏈路：

```text
UI / selection
→ prepare Target Context
→ encounter
→ battle context lock
→ combat
→ special / continuous / Fast Catch-up
→ settlement / progression / offline sample
```

核心 identity：

```text
world=1
mapIndex
enemyIndex
mode=formal / rerun / review
lifeId
reincarnation count
```

hard rules：

- `selectedMap / selectedEnemy` 只作 UI/navigation。
- post-prepare 不回頭用 selection reconstruction target。
- validator／lifecycle owner 缺失 fail closed。
- stale／identity／life/count mismatch fail closed。
- review 不給 formal rewards/progress。
- rerun 無合法 prepared target → `prepared-target-required`。
- Special Encounter 吃 explicit parent context。
- W1 Offline persisted identity 轉 canonical Target Context。
- Boss 不進 W1 offline sample。

---

# 18. Code Cleanup Batch1～8

全部完成。

核心邊界：

- legacy Schema1～17 支援保留。
- legacy cleanup 只屬 migration owner。
- Story／GM／Integrity lazy-loading boundary 保留。
- `docs/archive/` 只供歷史追溯。
- runtime API／compatibility owner／save hook owner 已收斂，不再新增同責任 second owner。

---

# 19. Schema17 舊檔相容矩陣與近期四批封箱（2026-10-07）

`tests/runtime/save-schema17-compatibility-matrix.js` 已加入以下正式 regression：

## 舊36稱號 catalog → AU稱號擴充

模擬舊 catalog：

```text
銀河10 + 宇宙10 + 高維10 + 鏡像6 = 36
```

若舊存檔 AU deepest=850：

- 舊36稱號完整保留。
- 靜默補發 AU 前8階。
- 總數 = 44。
- 已裝備 `mirror_title_19` 保留。
- `pendingNotice=mirror_title_20` 保留。
- 鏡像20勝歷史保留。
- migration diagnostics 回報補發8個 AU 稱號。

## AU 永久榮譽舊檔

即使現在 deepestCleared 比過去低，已取得／已裝備／pending AU 稱號不回收。

## W3 rerun 懸賞戰

Schema17 轉生角色即使：

```text
permanentUnlocked = true
qualificationUnlocked = true
```

W3 仍必須：

```text
eraAllowed = false
effectiveEnabled = false
unlocked = false
visible = false
enabled = false
```

## 鏡像 history repair

重複 miracleDates 會去重，migration diagnostics 會回報修復與移除數量。

## Recent optimization Batch4 closure

新增：

```text
tests/runtime/recent-optimization-batch4-closure.js
```

永久鎖定：

- W3 era policy 單一 owner。
- dungeon qualification／era availability 分離。
- 玩家／GM 鏡像共用 canonical settlement。
- miracleDates 去重。
- GM鏡像15～20勝範圍。
- AU title threshold data owner。
- migration diagnostics。
- Schema17 不升版。
- 第4批 old-save matrix 不得被移除。

該 closure 已加入 Runtime Integrity 並於 exact HEAD #2073 實際通過。

---

# 20. Runtime／Integrity current baseline

`.github/workflows/runtime-integrity.yml` current 涵蓋：

- 全 JS syntax／owner integrity。
- 真實 Chromium browser smoke。
- Save/global writer/new-state/load pipeline。
- Schema17 compatibility matrix。
- AU data／attempt／combat／failure／progression／UI／old-save。
- AU title Batch4 closure。
- W3 rerun settlement stage regression。
- Batch5／6／7 closure。
- Breakthrough core／final damage。
- GM突破／角色sandbox／AU管理／AU benchmark。
- 鏡像正式 settlement／GM adjudication。
- W3 dungeon effective access。
- W1 Target Context Batch0～6＋優化1～4。
- VIP unlimited。
- GM mainline HP lock。
- asset integrity。
- documentation integrity。
- recent optimization Batch4 closure。

最新已驗證 gameplay HEAD：

```text
3555bd7e8014837e6c241da054efe541a20ec413
Runtime Integrity #2073 = success
GitHub Pages #6038 = success
```

---

# 21. current owner 索引

## World／Player semantics
`worldphase.js`、`thirdworldphase.js`、`levelprogression.js`、`playersemanticsui.js`、`equipmentrewardcore.js`。

## Reincarnation／Breakthrough
`reincarnationstate.js`、`reincarnationcore.js`、`breakthroughcore.js`、`reincarnationui.js`、`reincarnationrerunworld1.js`、`reincarnationrerunworld2.js`、`reincarnationrerunworld3.js`、`reincarnationrerunprogress.js`、`reincarnationoverlevelrewards.js`、`reincarnationdungeonaccess.js`、`reincarnationpermanentgearguard.js`。

## W3 progression／dungeon
`thirdworldprogress.js`、`thirdworlddungeonui.js`、`thirdworldarena.js`、`thirdworldarenaui.js`。

## First World Target Context
`firstworldtargetcontext.js`、`battlepipeline.js`、`firstworldtargetcontextbatch4.js`、`firstworldtargetcontextbatch5.js`、`firstworldtargetcontextbatch6.js`、`specialencounter.js`、`offlineprogress.js`、`offlinestatecore.js`。

## Enhancement
`enhancementcore.js`、`enhancementui.js`、`enhancementrewards.js`、`enhancementcombat.js`、`playerbatchupgrades.js`、`enhancementintegrity.js`。

## Alternate Universe
`alternateuniversedata.js`、`alternateuniverseattempt.js`、`alternateuniversecombat.js`、`alternateuniverseprogression.js`、`alternateuniverseaccess.js`、`alternateuniverseui.js`、`traits.js`。

## Player titles
`playertitlecore.js`、`playertitlerenderer.js`、`playertitleui.js`、`playertitleintegrity.js`、`playertitlesalternateuniverse.css`、`playertitlesmirror.css`、`playertitleshigherdimensional.css`。

## Mirror
`mirrorconfig.js`、`mirrordungeonstate.js`、`mirrorcombatcore.js`、`mirrordungeongm.js`。

## Save／Offline／Runtime
`savemigration.js`、`saveversionguard.js`、`savehookcore.js`、`settlementtransaction.js`、`compatibilityowners.js`、`runtimeapi.js`、`scriptgrouploader.js`、`offlinestatecore.js`、`offlinefarmtarget.js`、`offlineprogress.js`、`offlineworld3adapter.js`。

## GM
`gmhub.js`、`gmhubextensions.js`、`gmformaltransaction.js`、`gmbreakthroughmanage.js`、`gmalternateuniversemanage.js`、`playertitlegmpreview.js`、`mirrordungeongm.js`、`gmpowerbenchmark.js`、`gmpowerbenchmarkstate.js`、`gmpowerbenchmarkworldphase.js`、`gmalternateuniversebenchmark.js`、`vipgm.js`、`thirdworldarenagm.js`、`gmbatch16formalcontrols.js`。

---

# 22. 重要 bug 修正／防倒退規則

1. 永久 W3 裝備只依 evidence 修復，ambiguous item 不猜。
2. GM formal mutation 共用 shared transaction，不回復 direct `state→save()` 第二 owner。
3. GM lazy-load rejected promise 必須可 retry。
4. GM authorization 不得污染 formal save。
5. Schema1～17 歷史 GM test transient keys 全部 migration 清除。
6. W3 character snapshot 不得再誤判 W2。
7. W1 Target Drift：戰鬥開始後 UI selection 不得改 active target。
8. Target Context validator 缺失必須 fail closed。
9. review 不得污染 formal progression。
10. rerun post-prepare 禁止回讀 selection。
11. W1 基礎強化成本維持 25×target。
12. W3 rerun stage/progress event continuation 不得把「Boss正式擊破」當成可 bypass 的中間事件。
13. 轉生永久副本資格不得重開 W3 懸賞戰。
14. GM 鏡像正式裁定不得建立自己的 history/title 結算。
15. mirror miracleDates 必須去重。
16. AU 稱號門檻不得重新寫 `deepest/100`。
17. AU 稱號已取得後不得因 progress 降低或轉生回收。
18. GM 稱號預覽不得復活第二套 AU 1～10 快速按鈕。
19. 鏡像稱號必須保持 catalog 最後一組。
20. migration／runtime-only diagnostics 不得因此升 Schema18。

---

# 23. 明確不要自行復活／擴充

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
11. 不把四副本永久入口誤做成全部 Arena rank 永久全開或 W3 bounty 永久可用。
12. 首輪 `count=0` 不可吃 rerun backfill、Story bypass、W3 5% bypass、overlevel 或突破。
13. 不把21 trait diagnostics塞進 GM 操作介面。
14. 不把戰力基準退回7模式；current正式為8模式。
15. 不讓 W1 battle execution 回頭用 `selectedMap / selectedEnemy` fallback。
16. 不把舊 GM transient test state 重新寫進 formal save。
17. 不因 migration cleanup、runtime-only snapshot、GM runtime auth、AU titles 而升 Schema18。
18. 不把 W1 基礎強化石成本改回 50×target，除非使用者重新做平衡決策。
19. 不復活 GM 稱號預覽「異宇宙1～10階快速視覺測試」按鈕區。
20. 不把 AU 稱號門檻 hardcode 成另一份 100倍數公式；正式資料只看 `depthThreshold`。
21. 不讓 reincarnation permanent qualification 覆蓋 `thirdworlddungeonui` 的 era policy。
22. 不讓 GM mirror 直接改 history/titles；必須委派 canonical settlement。

---

# 24. 目前尚未完成項目

**劇情／轉生隔離第1～4批維持封箱；新增優化工程第1批（舊歷史安全／高維通關 owner／待播診斷）已施工。其餘先前建議的災厄與程式整理優化尚未施工。**

現階段也是正式遊玩／轉生實測與持續平衡調整期。本次新工程以劇情歷史回顧／正式成長完全分離為硬規則。後續若使用者提出新功能、新平衡、新 UI 或新重構，必須重新 fresh-read current main 後再建立施工範圍。

`PROJECT_PENDING_STATUS.md` 的「沒有已定案待辦」結論仍有效；其更新日期比本檔早，因此若其中缺少本次已完成的 AU title／Mirror／W3 access／Schema17 closure 細節，以本檔與 current main 為準。

---


## 2026-10-07 劇情／轉生隔離：第1批已完成

- `storyrecordtabs.js` 在 `reincarnation.count >= 1` 時，用「現已進入的紀元」與正式 Story catalog **唯讀推導**戰線紀錄：銀河101、宇宙100、高維11；同時保留既有 completed 歷史。
- 不寫 `storyProgress.completedStories`、不寫 `pendingStory`、不改 `thirdWorld.story`、`thirdWorld.completed`，也不觸發 `completeStory()` 或任何 formal progress；回顧使用 generic `openStory`、沒有 onComplete callback。
- 首輪 `count=0` 仍按既有已完成紀錄顯示。正式故事資料尚未就緒時，不把缺少 pages 的新回顧條目提前加入。
- 第1批僅處理**紀錄顯示與回顧**；第一、二紀元轉生後的正式劇情排隊／播放與舊 pending 清理由第2批完成；高維自動 queue、Final 與本輪完成完全隔離由第3批完成。
- 新增 `tests/story/record.js` 的 count 0／1／2／3、101／100／11、未入世界不提前開放、唯讀、高維 Final generic replay 驗證；`index.html` 更新 cache-bust。


## 2026-10-07 劇情／轉生隔離：第2批已完成

- `storyprogress.js` 接入正式 `storyReincarnationContext(target)` 生命週期 owner，新增 `STORY_REINCARNATION_W1_W2_SUPPRESSION_VERSION=1`，由同一個 `suppressRerunStory()` 判定銀河／宇宙故事是否停止 formal queue。
- 轉生 `count>=1` 後，W1 `queueBossStory()` 與 W2 `queueUniverseBossStory()` 不再建立 `pendingStory`／播放；首輪 `count=0` 維持原有首殺 Story 流程。
- 宇宙 `settleSecondWorldBossVictory` 仍執行原正式 Boss 結算，但轉生輪不再追加劇情排隊；宇宙 `startSecondWorldBossContinuous` 不再因首殺劇情強制改為單場。
- Story Progress normalization 對已轉生存檔只清理已辨識的 W1/W2 舊 `pendingStory`，不改 `completedStories`、不呼叫 `completeStory`、不發通知；W3 pending／正式 W3 Story 流程保持原狀等待第3批。轉生輪也停止依本輪 W1 Boss 擊殺補寫 Story history，交由第1批唯讀戰線紀錄顯示。
- `resume()` 的 W1 序章強制播放只對首輪執行；保留配裝等其他原有流程。W3 pending 在尚未進 W3 時不於低紀元提前顯示。
- 新增 `tests/story/reincarnation-trigger-batch2.js`（count 0／1／2／3／7、首輪保留、W1/W2 首殺及 W2 連戰、舊 pending、安全保留既有銀河序章與 W3 pending）；加入 Story Integrity CI；`index.html` cache-bust 已更新。Save Schema 仍為17。
- **已完成：第3批高維劇情與本輪 Final／成長隔離。尚未完成：第4批三紀元舊檔和整體回歸。**


## 2026-10-07 劇情／轉生隔離：第3批已完成

- 仍用 `storyprogress.js` 正式 Story Progress owner 與既有 `storyReincarnationContext()`，`STORY_REINCARNATION_W3_ISOLATION_VERSION=1`；不新增 persistent story 欄位、第二套進度 owner 或 Schema18。
- 轉生 `count>=1` 時，11篇 W3 正式劇情僅由第1批 `storyrecordtabs.js` 以唯讀方式提供回顧；`queueStory()`／`setPending()`／`completeStory()`／`queueThirdWorldEligibleStory()`／`drainThirdWorldPostFlowStories()`／`consumeThirdWorldSettlement()` 均不再建立／播出 W3 正式劇情，也不會藉高維 Final 的故事歷史污染本輪完成判定。
- Story Progress normalization 會清理轉生輪已辨識 W3 舊 `pendingStory`，但保留既有 `completedStories` 永久歷史；首輪仍保留原 W3 順序隊列、序章／階段／Final 正式完成與原結算。
- 轉生輪 `thirdWorld.story.introSeen=false`、`thirdWorld.story.finalSeen=false` 表示**本輪不重新播放**，不能從永久故事歷史推導；`thirdWorld.completed` **只由本輪10名高維存在正式血量全歸零**推導，並於接受 W3 戰鬥 settlement 時同步；即使 `story.unlockedStage` 因舊檔而落後也不阻擋 Boss 完成判定。不得用 `completedStories` 的歷史 Final 當成本輪通關條件。
- 高維10王、永久血量、維度之弦／核心、突破／轉生資格與正式戰鬥公式未改動。轉生輪達到本輪十王全滅時 `thirdWorld.completed` 可正常成立，但 `finalSeen` 仍不被冒充為重播過 Final。
- 新增 `tests/story/reincarnation-higher-dimensional-batch3.js`：首輪流程、轉生1／2／3／7次、歷史11篇全保留、舊 W3 pending 清理、W3 queue／drain／formal completeStory 阻擋、Boss 未打與全部打完的區別、Final gate 不得繞過、零自動播放及無額外 Story save；加入 Story Integrity CI。生產 JS cache-bust 已更新。
- **第4批三紀元舊檔、跨紀元與重新載入回歸已完成並納入 Story／Runtime Integrity。**



## 2026-10-07 劇情／轉生隔離：第4批整體封箱已完成

- 新增 `tests/story/reincarnation-three-era-batch4-closure.js`，以正式 `storymigration.js`、`storyprogress.js`、`storyrecordtabs.js` 三個 owner 組成實際 VM 整合測試；不是只比對字串。
- 覆蓋首輪 count=0 與轉生 count=1／2／3／8：在轉生後不打 Boss，銀河101篇、宇宙100篇、高維11篇在進入對應紀元後即由唯讀戰線紀錄開放；首輪 W3 未完成故事仍鎖定且可照原規則 queue。
- 模擬 Schema17 既有欄位結構與 JSON 存檔／重新載入：W1/W2/W3 舊 `pendingStory` 清理、Story resume／reload 不自動播放、切換紀元後回顧前紀元仍有效、`completedStories` 永久歷史不被覆寫、不額外產生 Story formal save。
- 高維 Final 只以 `generic` 生命周期由戰線紀錄回顧，沒有 `onComplete`；未擊敗本輪10王時 `thirdWorld.completed=false`，十王全滅時即使 `story.unlockedStage=0` 也完成正式戰鬥判定，且不設定 `finalSeen`、不自動 queue Final。
- 宇宙首殺不再迫使轉生後連戰切為單場；正式 Boss settlement 照常運作，Story 只是紀錄展示，不干預養成、戰鬥、世界進入與轉生資格。
- 封箱 regression 已加入 `.github/workflows/story-integrity.yml` 與 `.github/workflows/runtime-integrity.yml`（Schema17相容矩陣後執行），避免後續非 Story 程式修改造成倒退。
- 本批只動測試、CI 與本交接檔；前3批 production 行為已由 latest main 確認，不需重改；沒有修改正式 Boss/Story/Save JS、不需 index cache-bust，Save Schema 仍為17。
- 注意：`PROJECT_HANDOFF.md` 為狀態索引，不取代 current `main` 正式 owner；後續改動仍需 fresh-read 並核對 exact HEAD Actions。


## 2026-10-07 劇情／災厄檢查後優化：第1批（項目1、2、7、9）

- **劇情 reference 資料安全：** `storymigration.js` 的 `normalizeFields()` 僅在正式 Story group 已回報 `ready` 時清理已退休的 `completedStories`／`pendingStory` ID；部分延遲載入的 catalog 不再被誤當成完整目錄。非 browser 的 VM 測試仍可透過 `catalogReady` 指定判定；未建立 Script Group Loader 的舊測試 harness 維持兼容。
- **舊版高維歷史：** 當 `thirdWorldContentVersion<1` 且玩家已轉生，migration 會用正式高維11篇 trigger descriptor 保留合法的歷史 completed ID；只清理退休 W3 ID／舊 pending。若正式 descriptor 尚未完整就緒，延後版本遷移，不先刪除也不先將 content version 標為最新。首輪 `count=0` 的舊開發版 W3 歷史重建政策維持原樣。
- **轉生高維正式完成 owner：** `thirdworldphase.js` 新增 `reconcileThirdWorldRerunCombatCompletion()`，由正式 W3 phase normalizer 和 `thirdworldprogress.js` 的共用 `runSettlementTransaction` mutation 內呼叫，以本輪10名高維存在永久 HP 全歸零更新 `thirdWorld.completed`，與本輪 HP 結算原子落帳。Story Progress 不再直接寫入或觸發轉生輪 `completed`，僅對 `introSeen/finalSeen` 遵循不重播政策。首輪 Final 正式流程不變。
- **待播診斷：** `LAST_STORY_PENDING_MIGRATION_REPAIR`、`LAST_STORY_PENDING_RERUN_REPAIR` 僅為 runtime 診斷，分別標記 catalogue-ready 退休 ID 與轉生歷史 Story pending 清理；不新增永久存檔欄位、不升 Schema17。
- **驗證：** 新增 `tests/story/optimization-batch1-history-safety.js`，加入 Story Integrity；更新 W3 Batch3/Batch4 harness 與 legacy/source-owner 合約。正式 JS 修改已更新 `index.html` cache-bust。**災厄 Fast Catch-up、重複存檔及 W2 snapshot 優化均未在本批修改。**


## 2026-10-07 災厄最後一場與轉生劇情工程：第2批優化

- 本批處理既定清單 **3／4／5**：宇宙災厄非 checkpoint 場次避免整份 state 快照、W1/W2 最後一場真正的動態 Fast Catch-up 回歸，以及連戰 terminal 不重複存檔。**未修改**首輪／轉生劇情歸檔、W3 生命週期或既有 Story schema。
- `secondworldcalamityrun.js` 的 `settle()` 只有在 `options.save!==false` 實際進行正式存檔時才 `JSON.stringify(state)` 建立 rollback 快照；需要存檔的場次仍保留完整 `saveAtomic(before)` 與失敗回復。非 checkpoint 場次只更新記憶體中的正式進度，最後終止時強制補一次存檔。
- `calamityrun.js`／`secondworldcalamityrun.js` 的 `finish(reason,{checkpoint})` 在已完成該場 checkpoint 時不重複寫入；原本 `save:false` 且因印記滿級、文明完成、首次稱號、單場或該場末尾手動停止而終止時，改由 `finish()` **只做一次** terminal checkpoint。第一紀元 `calamitycore.js` 會回報 `checkpointSaved`，若正常場次的第一個存檔明確失敗，terminal runner 會補存一次，避免消除重複存檔時損害既有失敗重試能力。非戰鬥停止／錯誤仍保留終止安全存檔。
- 新增 `tests/runtime/calamity-terminal-dynamic-opt-batch2.js`，使用真正的 `backgroundprogress.js` 共用 Fast Catch-up owner 與 W1/W2 正式 run/settle owner，在 VM 中模擬前景、背景回播、最後一場印記滿級／文明完成、初次稱號、手動停止、checkpoint 失敗回復及 save 次數。測試納入 `.github/workflows/runtime-integrity.yml`。
- JS 改動已更新 `index.html` cache-bust。兩紀元仍共用原有戰前 `battlePresentationPlan()`，未修改 UI 內容、戰鬥傷害、30次擊殺或 Save Schema17。
- 原清單其他編號（6／8／10／11／12）未在本批修改；往後依使用者指示再確認優先度。 

# 25. 下一個對話如何接手

新對話請直接使用以下標準指令：

```text
讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，
再重新檢查 main 的實際程式碼與這次要處理功能的正式 owner／consumer，
完整承接《文明戰線》專案。

以 GitHub main 為唯一真實來源；不要只靠對話記憶、舊交接檔或歷史設計文件。
先確認目前 HEAD、Save Schema、相關 runtime/integrity、current world semantics 與既有正式 owner。

已完成的 Batch5／6／7、Code Cleanup Batch1～8、
第一紀元 Target Context Batch0～6與優化1～4、
轉生／GM／三紀元語義四批優化、
異宇宙稱號 Batch1～4、
第三紀元副本 access 收斂、
鏡像 canonical settlement／GM正式裁定、
AU threshold owner／migration diagnostics、
Schema17 舊檔相容矩陣與近期 Batch4 closure，
都不得因舊文件重新施工或倒退。

若我說「先討論／先檢查／先不要修改」，只分析不要改 GitHub；
若我說「修改／做／執行／第N批」，可直接修改 main。

修改時優先改正式來源，不要另外堆 wrapper、fallback、第二套公式或第二套 owner。
JS／CSS production 改動要同步更新 index.html cache-bust。
修改後 fresh-read、compare base→head、自我檢查，
並以 exact HEAD 的 Runtime／Story（若該變更有觸發）／Pages Actions 結果為準。

現在先不要修改。
```
