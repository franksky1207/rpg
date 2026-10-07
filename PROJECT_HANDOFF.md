# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-07（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只負責交接、索引與正式現況整理；若本檔、舊對話、舊設計文件、歷史文件或其他摘要與 current main 衝突，一律以 current main 為準。

---

# 0. 本次交接基準

本次交接以 **2026-10-07 current `main`** 的實際檔案為依據，重新讀取本交接檔與 Story migration／progress／record、兩紀元文明災厄 core／run／UI、共用 Background Progress、第三紀元 phase／正式 settlement、轉生 lifecycle／core、HTML 引用與最近新增的測試。其他較早完工的正式 GM／異宇宙／裝備／突破／副本細節，仍依本檔下方 owner 索引與 current main 驗證，**不把早期交接當作實碼已重新驗證的替代品**。

此次僅更新 `PROJECT_HANDOFF.md`。更新交接檔前的 gameplay HEAD：

```text
4e0c521940c915972a4f6a9ddb15d7cc80951e58
```

該 exact HEAD：

```text
Runtime Integrity #2155 = success
GitHub Pages      #6124 = success
```

最近一次 Story Integrity #1111 = success，對應較早 gameplay HEAD `a54691cf1f4ebe06afab3b81acf7d2613c8e0294`；**不是**上述最終 HEAD 的 Story CI，不能混稱同 SHA。後續 Runtime 靜態契約修正不涉及 Story production JS，且 exact HEAD Runtime browser smoke／Story 相容測試已通過。

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
劇情轉生分流 Batch1～4（W1 101／W2 100／W3 11）          ✅ 完成
劇情／災厄後續優化 Batch1～3（原優先項目1～12）           ✅ 完成
災厄最後一場 Fast Catch-up／checkpoint 動態回歸          ✅ 完成
目前已排定工程                                          ✅ 全部完成
```

**截至本次 gameplay HEAD，劇情／轉生分流四批＋劇情／災厄安全與效能優化三批皆已封箱。** 轉生後只在戰線紀錄回顧歷史，劇情不參與本輪正式戰鬥／養成／通關；兩紀元災厄最後一場共用 Fast Catch-up 呈現判定、checkpoint 安全及 UI 決策。首輪劇情流程、Schema17、戰鬥公式、GM 正式與 sandbox 邊界不因此改動。

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

本次已驗證 gameplay HEAD（交接檔更新前）：

```text
4e0c521940c915972a4f6a9ddb15d7cc80951e58
Runtime Integrity #2155 = success
GitHub Pages #6124 = success
Story Integrity #1111 = success（較早的 a54691cf...，非上述 exact HEAD）
```

Runtime Integrity 現已包含 `tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js`、`calamity-terminal-dynamic-opt-batch2.js`、`calamity-shared-ui-policy-opt-batch3.js`，及三紀元 Story／Schema17 closure。Story Integrity 則包含 W1/W2/W3 首輪與轉生、11篇高維、舊版歷史遷移和戰線紀錄回顧測試。**執行新修改時重新看新 HEAD 的 Actions，不沿用上述結果。**

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

## Story／三紀元轉生後歷史
`reincarnationstate.js`（唯一轉生 context）、`storymigration.js`（舊 ID、待播資料安全）、`storyprogress.js`（首輪正式劇情／轉生不重播）、`storyrecordtabs.js`（唯讀歷史 UI）、`secondworldstoryregistry.js`（宇宙／高維 registry）、`thirdworldphase.js`（轉生後十王通關 owner）、`thirdworldprogress.js`（正式 HP／通關同交易）。

## 兩紀元文明災厄／背景連戰
`calamitycore.js`、`calamityrun.js`、`calamityui.js`、`secondworldcalamityrun.js`、`secondworldcalamityui.js`、`backgroundprogress.js`（共用 presentation／UI policy 與 Fast Catch-up）及 `tests/runtime/calamity-*.js`。

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
21. 轉生後 W1／W2／W3 歷史直接開放戰線紀錄，**不補寫 completedStories**、不自動 queue／播放正式劇情。
22. 轉生後 W3 十王通關只能由正式 W3 phase／settlement owner 判定，不因歷史 Final 設 `thirdWorld.completed`；首輪維持舊正式劇情完成契約。
23. Story group 尚未 ready，不可清理尚未完整載入的合法歷史；舊 W3 content migration 應保護 rerun 已完成的11篇。
24. 兩紀元災厄 terminal 最多一次正常 checkpoint，跳過 checkpoint 的終止場必補存；W1 正式存檔失敗回報須保留補存，W2 正式存檔回復快照不可取消。
25. 災厄最後一場 headless Fast Catch-up 不多等待 structured duration；兩 UI 決策共用既有 `backgroundprogress.js`，不可退回各自重複公式。

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

**劇情／轉生隔離第1～4批維持封箱；後續優化工程第1～3批（舊資料與高維 owner、安全存檔與最後一場動態回歸、共用 UI／Story Record 收斂）已完成。**

現階段也是正式遊玩／轉生實測與持續平衡調整期。本次新工程以劇情歷史回顧／正式成長完全分離為硬規則。後續若使用者提出新功能、新平衡、新 UI 或新重構，必須重新 fresh-read current main 後再建立施工範圍。

`PROJECT_PENDING_STATUS.md` 的「沒有已定案待辦」結論仍有效；其更新日期比本檔早，因此若其中缺少本次已完成的 AU title／Mirror／W3 access／Schema17 closure 細節，以本檔與 current main 為準。

---


## 2026-10-07 劇情／轉生隔離：第1批已完成

- `storyrecordtabs.js` 在正式 `storyReincarnationContext(state).reincarnationRun===true` 時，用「現已進入的紀元」與正式 Story catalog **唯讀推導**戰線紀錄：銀河101、宇宙100、高維11；同時保留既有 completed 歷史。
- 不寫 `storyProgress.completedStories`、不寫 `pendingStory`、不改 `thirdWorld.story`、`thirdWorld.completed`，也不觸發 `completeStory()` 或任何 formal progress；回顧使用 generic `openStory`、沒有 onComplete callback。
- 首輪 `count=0` 仍按既有已完成紀錄顯示。正式故事資料尚未就緒時，不把缺少 pages 的新回顧條目提前加入。
- 第1批僅處理**紀錄顯示與回顧**；第一、二紀元轉生後的正式劇情排隊／播放與舊 pending 清理由第2批完成；高維自動 queue、Final 與本輪完成完全隔離由第3批完成。
- 新增 `tests/story/record.js` 的 count 0／1／2／3、101／100／11、未入世界不提前開放、唯讀、高維 Final generic replay 驗證；`index.html` 更新 cache-bust。


## 2026-10-07 劇情／轉生隔離：第2批已完成

- `storyprogress.js` 接入正式 `storyReincarnationContext(target)` 生命週期 owner，新增 `STORY_REINCARNATION_W1_W2_SUPPRESSION_VERSION=1`，由同一個 `suppressRerunStory()` 判定銀河／宇宙故事是否停止 formal queue。
- 轉生 `count>=1` 後，W1 `queueBossStory()` 與 W2 `queueUniverseBossStory()` 不再建立 `pendingStory`／播放；首輪 `count=0` 維持原有首殺 Story 流程。
- 宇宙 `settleSecondWorldBossVictory` 仍執行原正式 Boss 結算，但轉生輪不再追加劇情排隊；宇宙 `startSecondWorldBossContinuous` 不再因首殺劇情強制改為單場。
- Story Progress normalization 清理轉生輪已辨識的 W1/W2 舊 `pendingStory`，不補寫 `completedStories`、不呼叫 `completeStory`、不發通知；W3 pending 清理由後續第3批實作並已完成。轉生輪停止依本輪 W1 Boss 擊殺補寫 Story history，由唯讀戰線紀錄顯示。
- `resume()` 的 W1 序章強制播放只對首輪執行；保留配裝等其他原有流程。W3 pending 在尚未進 W3 時不於低紀元提前顯示。
- 新增 `tests/story/reincarnation-trigger-batch2.js`（count 0／1／2／3／7、首輪保留、W1/W2 首殺及 W2 連戰、舊 pending、安全保留既有銀河序章；第3批後 W3 pending 同樣清除）；加入 Story Integrity CI；`index.html` cache-bust 已更新。Save Schema 仍為17。
- **此段為第2批施工沿革；第3／4批均已完成，不存在待做的 W3 pending／closure。**


## 2026-10-07 劇情／轉生隔離：第3批已完成

- 仍用 `storyprogress.js` 正式 Story Progress owner 與既有 `storyReincarnationContext()`，`STORY_REINCARNATION_W3_ISOLATION_VERSION=1`；不新增 persistent story 欄位、第二套進度 owner 或 Schema18。
- 轉生 `count>=1` 時，11篇 W3 正式劇情僅由第1批 `storyrecordtabs.js` 以唯讀方式提供回顧；`queueStory()`／`setPending()`／`completeStory()`／`queueThirdWorldEligibleStory()`／`drainThirdWorldPostFlowStories()`／`consumeThirdWorldSettlement()` 均不再建立／播出 W3 正式劇情，也不會藉高維 Final 的故事歷史污染本輪完成判定。
- Story Progress normalization 會清理轉生輪已辨識 W3 舊 `pendingStory`，但保留既有 `completedStories` 永久歷史；首輪仍保留原 W3 順序隊列、序章／階段／Final 正式完成與原結算。
- 轉生輪 `thirdWorld.story.introSeen=false`、`thirdWorld.story.finalSeen=false` 表示**本輪不重新播放**，不能從永久故事歷史推導；`thirdWorld.completed` **只由本輪10名高維存在正式血量全歸零**推導，並由後續優化移至 `thirdworldphase.js` 正式 owner、於 `thirdworldprogress.js` 正式戰鬥 transaction 同步落帳；即使 `story.unlockedStage` 因舊檔落後也不阻擋 Boss 完成判定。不得用 `completedStories` 的歷史 Final 當成本輪通關條件。
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
- **施工沿革備註：** 第2批當時沒有改 6／8／10／11／12；這些已在後續第3批完成，不再是待辦。


## 2026-10-07 劇情／災厄檢查後優化：第3批（原清單6、8、10、11、12）

- `storyrecordtabs.js` 的轉生歸檔可見性改為**直接委派** `storyReincarnationContext(state).reincarnationRun`，不再自算轉生 count，與正式 Story owner 一致；未新增持久化狀態。單次 `storyRecordPageHtml()` 重用同一組 `completedIds()` 計算結果，避免 render 內反覆建立 Set；不新增快取。
- 轉生後戰線紀錄文案改為「文明歷史已永久歸檔，可隨時回顧；不播放正式劇情、不給予獎勵，也不影響本輪任何進度。」首輪仍維持原先已完成正式劇情說明。
- `backgroundprogress.js` 既有共用 owner 新增純唯讀 `calamityContinuousUiDecision(policy,ended)`，集中解讀 W1／W2 災厄 UI 的 Fast Catch-up 呈現、刷新、yield 與最後一場略過 structured duration 條件；`calamityui.js` 與 `secondworldcalamityui.js` 使用同一判定，但各自保留原有美術動畫、render、UI、資源與正式結算，不另建第三套 UI runner／wrapper。
- `calamityrun.js`、`secondworldcalamityrun.js` 移除未被呼叫的 **run-local** `catchUpPreviewPolicy()`；保留共用 `backgroundprogress.js` 的 `previewCatchUp()` 公開 API，避免破壞其他 consumer 與 Integrity 契約。
- 新增 `tests/runtime/calamity-shared-ui-policy-opt-batch3.js`，覆蓋普通、Fast 預覽／跳過／刷新、最後一場的 immutable decision 與兩 UI consumer 接線；加入 Runtime Integrity。同步擴增 `tests/story/record.js`，測正式轉生 Context／文案／首輪不受影響。
- JS/CSS cache-bust 在 `index.html` 已更新；Save Schema 維持17，舊資料不需要遷移，永久 Story 紀錄與災厄養成欄位沒有任何新增或清空。本批完成後原清單1～12均已處理或明確保留既有正確機制。


## 2026-10-07 最終功能狀態統整（跨七批正式封箱）

### 一、目前唯一生效的劇情／轉生規則

| 條件 | W1 銀河 | W2 宇宙 | W3 高維 |
|---|---|---|---|
| 首輪（`count=0`） | 101篇依原劇情流程解鎖、播放 | 100篇依 Boss 首殺劇情解鎖、播放 | 序章＋9篇階段＋Final 共11篇依原流程 |
| 轉生（`count>0`） | 轉生完成立即在戰線紀錄開放101篇 | 再入宇宙立即在戰線紀錄開放100篇 | 再入高維立即在戰線紀錄開放11篇 |
| 轉生後正式劇情 | 不排隊、不自動播放、不需打 Boss | 不排隊、不自動播放、首殺不切斷連戰 | 不排隊、不自動播放、不補播 Final |
| 歷史回顧 | `openStory(id,{lifecycleOwner:"generic"})`，純閱讀，不產生正式完成事件 | 同左 | 同左，包含 Final |

- 可回顧的212篇是各紀元進入時由正式 registry／catalog **唯讀衍生**；不得批次向 `completedStories` 寫入212篇，也不得因閱讀觸發獎勵、Boss、災厄、印記、文明、核心、突破、存檔進度改動。首輪的正式 `completedStories` 仍保留其原有意義。
- `storyrecordtabs.js` 以 `storyReincarnationContext()` 判定轉生、單次 render 共用 completed Set；首輪保留原說明，轉生輪顯示「文明歷史已永久歸檔，可隨時回顧；不播放正式劇情、不給予獎勵，也不影響本輪任何進度。」
- W3 轉生輪 `introSeen/finalSeen` 不從舊歷史改寫；正式 `thirdWorld.completed` 由本輪10名高維存在的**永久 HP 全部歸零**決定。owner 是 `thirdworldphase.js` 的 `reconcileThirdWorldRerunCombatCompletion()`；`thirdworldprogress.js` 正式 `runSettlementTransaction` 同筆落帳，載入 normalization 亦由 W3 phase 調和。**Story Progress 不得回頭擁有通關寫入。**
- `storyprogress.js` 統一阻擋轉生後三紀元 `queueStory`、`setPending`、`completeStory`、W3 eligible/drain 及 W2 首殺 queue；無法用直接 API 呼叫繞過。正常首輪／配裝／世界進入條件不變。

### 二、舊存檔與 Story migration 安全邊界

- **Save Schema17** 不升版，不新增永久解鎖欄位。首輪／轉生輪皆保留合法的 `completedStories`；轉生輪載入時清除 W1／W2／W3 舊正式 `pendingStory`，避免重播。
- `storymigration.js` 只在正式延遲 Story group 回報 `ready` 後執行未知 ID 清理；目錄部分載入時不能刪合法歷史。對 `thirdWorldContentVersion<1` 的 rerun 舊存檔，以正式11篇 trigger descriptor 保留合法 W3 已完成紀錄、處理退休 ID；descriptor 尚未完整時延後版本遷移。首輪舊開發版 W3 migration 路線保留。
- `LAST_STORY_PENDING_MIGRATION_REPAIR` 與 `LAST_STORY_PENDING_RERUN_REPAIR` 是**runtime-only 唯讀診斷**，不持久化、不造成 Schema18。
- 三紀元 JSON round-trip／重新整理、轉生 count 0／1／2／3／8、進入紀元不打王即有歷史、W3 Final 只回顧不通關皆有 VM／CI 封箱測試；不應自行再寫一套 migration/backfill 或把 legacy 開發版紀錄當本輪成長。

### 三、災厄最後一場、背景 Fast Catch-up、checkpoint

- W1 `calamitycore.js` 回報 `settlement.checkpointSaved`；W1 `calamityrun.js` 與 W2 `secondworldcalamityrun.js` 的 `finish(reason,{checkpoint})` 避免同一場已保存又重複保存；`save:false` 的終止場（滿級／文明完成／首次稱號／單場／停止）須補一次 checkpoint。W1 首次存檔**明確失敗**須保留 terminal 補存路徑。
- W2 只有 `options.save!==false` 才執行完整 `JSON.stringify(state)` rollback 快照；真正的 checkpoint 場仍有 `saveAtomic(before)` 回復保障；背景非 checkpoint 場只在記憶體累進，由終止或後續正式 checkpoint 保存。**不可為減少快照而破壞 rollback。**
- 兩紀元都在戰鬥開始前取得共用 `battlePresentationPlan(options)`，用 pre-battle policy 決定呈現、structured duration、刷新與 checkpoint；最後一場即使背景 flow 在 `finish()` 停止，也不得又等待完整戰鬥動畫時間。
- 共用 `backgroundprogress.js` 的 `calamityContinuousUiDecision(policy,ended)` 是純 policy 判定，W1 `calamityui.js`、W2 `secondworldcalamityui.js` 共同採用；W1／W2 各自動畫、畫面、獎勵、災厄 state／Boss settlement 保持獨立，不新增 UI wrapper。兩個 runner 沒用到的 local `catchUpPreviewPolicy()` 已刪；共用 infra `previewCatchUp()` API **仍保留**。
- Runtime 動態 CI 同時測 W1 印記滿級／W2 文明完成最後場、前景／背景 headless、非終止場、首次稱號、手動停止、terminal 存檔一次、W1 save retry、W2 rollback；並有 shared UI policy 六情境與舊 static integrity 對齊新 owner。

### 四、其他正式數值、GM／UI 基準（沿用既有 owner，不在七批重算）

- W1 Lv1～500、W2 Lv501～1000、W3 Lv1000～2000；世界進入條件依本檔第2節，絕不能以永久故事回顧繞過 Boss／專精／強化／印記／文明／VIP 條件。
- W3 每級 EXP `10,000,000`（正式 `levelprogression.js`）；W1 強化基礎石 `25×目標等級`、進階石 `5×目標等級`、+20上限；W2 +40；強化每級能力加成2.5%。不得復活舊 50×。
- 轉生越級收益：`M=1+0.03×(enemyLevel-playerLevel)` 僅 rerun 且對方等級較高；適用範圍、向上取整、Offline provenance、裝備出售排除依第13節正式 owner。
- GM 正式修改必須走 shared transaction；GM 測試／預測角色／AU benchmark 與正式角色分離；原有 GM 突破、鏡像正式裁定、異宇宙管理與 benchmark 八模式、VIP 無上限但特殊特權至20、稱號視覺／AU title 門檻 owner 均維持原規則。這七批**沒有**更改這些 GM／平衡公式。
- 三紀元入口／回顧、災厄 UI、戰線紀錄回顧與轉生文案，仍按本檔 UI 索引與 `index.html` 正式資產載入；JS 改動已做 cache-bust。任何舊設計文檔與本段有衝突，請直接 fresh-read 正式 source。

### 五、CI、已知風險與待辦邊界

- 本對話**沒有未完成的已核准工程批次**；劇情四批、後續安全／災厄／UI 三批均完成。後續剩正式遊玩實測、效能與平衡觀察；不因歷史編號再自動開一批。
- 最新已驗證 gameplay HEAD `4e0c521940c915972a4f6a9ddb15d7cc80951e58`：Runtime Integrity **#2155 success**（含 Chrome browser smoke、新災厄測試、docs integrity），GitHub Pages **#6124 success**；Story Integrity **#1111 success** 位於前一 gameplay HEAD `a54691cf...`。之後只修改 Runtime 靜態契約測試；**不要誤稱 Story #1111 為最終 SHA 的 exact-HEAD success**。
- 尚無經實機存檔重現而確認的本批新 Bug；VM／CI 模擬不等同所有玩家設備的實際操作。若用戶回報現場問題，請先讀 `main` 與明確的實際數據／存檔，再查相關 owner，勿先宣稱無問題。
- 此次**只更新交接 Markdown，不修改任何正式 JS、CSS、Schema、GM、UI 或測試**；GitHub workflow 若只因文件變更而重新執行，也應比對新的 exact HEAD 狀態。

## 2026-10-07 銀河紀元文明災厄 HP 平衡調整（本次定案）

- 使用者確認**直接將銀河紀元 10 階災厄 HP 全部砍半**，首輪與轉生輪共用：正式唯一血量 owner `calamitystate.js` 的 `CALAMITY_HP_PER_LEVEL` 由 `500000` 調為 **`250000`**；血量公式 **`HP = 250,000 × 階級`**，第1階 250,000，第10階 2,500,000。
- `calamitycore.js` 同步對齊防禦性備援值，`calamitystateintegrity.js` 與 `calamitycoreintegrity.js` 同步修改端點、敵方戰鬥數值與 normalization clamp 測試；`index.html` 已更新上述 JS 的 cache-bust。
- **僅銀河 HP 調整**：銀河印記首次取得＋後續30次完整擊殺（合計31次）、ATK／DEF／暴擊／閃避、解鎖、Fast Catch-up、結算與存檔流程皆維持不變；宇宙紀元災厄仍維持 `1,000,000 + (階級−1)×200,000`、每隻30次完整擊殺。
- 使用者表示目前只有本人測試，**不要另外新增舊存檔災厄殘餘 HP 百分比換算或專用 migration**；既有 normalizer 仍照新上限 clamp 舊數值即可，不升 Save Schema17。
- 先前「銀河第10階500萬」等數字均視為**歷史測試基準、已失效**；之後平衡與 GM 實測應以最新 main 的250萬為準。

## 2026-10-08 GM 戰力基準／突破最終傷害修正

- 發現「同步正式角色 → GM 角色能力測試 → 戰力基準測試」原本只把突破對裝備 HP／ATK／DEF 的加成帶入 `gmTestPlayerStats()`，但多個 GM 戰鬥模式仍只傳文明倍率，**漏掉永久突破每級 +5% 的正式 final damage layer**；戰力基準純文字摘要也沒有列出突破等級。
- `vipgm.js` 新增 GM 測試共用 `gmTestFinalDamageSnapshot()`／`gmTestFinalDamageMultiplier()`，**直接委派正式 `formalPlayerFinalDamageSnapshot()`**；不得在 GM 各模式另寫 `突破×5%` 第二套公式。
- `gmpowerbenchmark.js` snapshot 現保存 `breakthroughLevel`、突破裝備加成、突破 final-damage add、`finalDamageMultiplier`；銀河／宇宙地圖怪、輸出診斷及戰力基準實戰一律使用總 final multiplier。摘要新增「突破 Lv.」「突破裝備加成／最終傷害」與「總最終傷害倍率」。
- `gmpowerbenchmarkworldphase.js` 高維 adapter 同樣使用 GM 共用正式 final-damage owner；高維角色快照文字會列突破與總 final multiplier。
- 同步修正 GM 模式：銀河／宇宙文明災厄、特殊怪、競技場、懸賞／虛空等 dungeon GM simulation，以及鏡像 GM snapshot；鏡像 snapshot 現明確攜帶 `breakthroughLevel`，由既有 mirror formal final-damage owner 正規化。
- 文明倍率欄位仍保留作為「文明單獨加成」的診斷值；真正戰鬥使用 `finalDamageMultiplier = 1 + civilizationAdd + breakthroughAdd` 的正式 owner 結果。**不是把兩個 multiplier 相乘。**
- 更新 `tests/runtime/gm-character-breakthrough-batch7-2-integrity.js`：鎖住 GM final owner＝正式 owner、戰力基準 snapshot 必須保存突破、B25 銀河總 final damage 為 ×2.25，且摘要必須顯示突破與總倍率。
- 本批不改正式角色突破公式、不改文明公式、不改 Save Schema17；只修 GM sandbox／benchmark 對正式 owner 的引用與顯示。相關 GM JS 已更新 `index.html` cache-bust。


## 2026-10-08 銀河災厄／GM 測試優化第1批（項目1、11）

- 正式第一紀元文明災厄 `calamitycore.js` 現在在進入 Combat Core 前直接呼叫正式唯一 final-damage owner：`formalPlayerFinalDamageMultiplier({world:1,state})`，並把結果作為 `playerFinalDamageMultiplier` 傳入 `runCombatCore()`。因此轉生後永久突破每級 +5% 最終傷害會正式套用到銀河災厄，不再出現「GM 有算突破、正式災厄沒算」的落差。
- 新增 `CALAMITY_FORMAL_FINAL_DAMAGE_VERSION=1`；若正式 final-damage owner 未載入，銀河災厄直接 fail closed，不另寫突破公式或使用第二套 fallback。
- `calamitygm.js` 的銀河災厄單場／完整擊殺結果 snapshot 現保存該次測試的 `breakthroughLevel` 與 `finalDamageMultiplier`。
- `gmpowerbenchmark.js` 的銀河文明災厄摘要現在會顯示「突破 Lv.X｜總最終傷害 ×X.XX」，與宇宙災厄的倍率資訊一致。
- `calamitycoreintegrity.js` 同步修正既有 Core V2 版本檢查，並新增正式 final-damage owner 契約檢查。
- `index.html` 已更新 `calamitycore.js`、`calamitygm.js`、`gmpowerbenchmark.js`、`calamitycoreintegrity.js` cache-bust。
- 本批沒有修改災厄 HP 250,000×階級、印記升級、舊 HP clamp、Save Schema17、GM 正式印記寫入、GM stale-result 管理與完整擊殺 no-progress；後者仍屬後續批次。



## 2026-10-08 GM 測試結果可信度優化第2批（項目2、8、9）

- 新增共用 GM 測試 context owner（`GM_TEST_CONTEXT_OWNER_VERSION=1`）：以 session-only `revision` 管理角色測試設定變更，`gmTestContextSnapshot()` 會保存角色紀元／等級／裝備來源與裝備、VIP、突破、強化、專精、文明、印記、能力值與正式 final-damage snapshot。
- VIP／突破／強化／角色紀元／等級／重新生成裝備／專精／印記／文明等級，以及「同步正式角色到測試設定」，統一改走 `gmNotifyTestConfigurationChanged()`；不再由各 setter 分散直接呼叫 benchmark invalidation。批次同步使用 `refresh=false` 時只在最後統一通知一次。
- `gmpowerbenchmark.js` 新增 `gmPowerBenchmarkInvalidateTestContext()`（`GM_POWER_BENCHMARK_TEST_CONTEXT_INVALIDATION_VERSION=1`）；角色測試設定一變更會同時清除 benchmark snapshot、地圖輸出／承傷／實戰結果與所有外部模式結果，再重新擷取目前角色 snapshot／刷新摘要。舊 `gmPowerBenchmarkInvalidateSnapshot()` 保留為相容別名並委派新 owner。
- 移除戰力基準宇宙文明等級下拉原本的「setter 後再手動 invalidate」重複清除，避免同一次設定變更重複 invalidation。
- 銀河文明災厄 GM 單場／完整擊殺結果現在保存完整 `testContext`；完整擊殺長迴圈用 context revision guard，若測試中途變更角色設定，該次結果直接作廢，不會在清除後又回填成舊結果。
- 宇宙文明災厄 GM 同步保存完整 `testContext` 並加入同樣的長迴圈 stale-result guard；context 僅作為 metadata／revision guard，不改原本 Combat Core、測試專精／印記或 benchmark snapshot 的戰鬥來源。
- `calamitygmintegrity.js`、`secondworldcalamitygmintegrity.js` 已加入 test-context／stale-result 契約檢查；相關 JS／integrity 已更新 `index.html` cache-bust。
- 本批仍不修改正式存檔、Save Schema17、正式災厄／印記資料、GM 正式管理 transaction、舊 HP migration、印記 progress canonical 與完整擊殺 no-progress；這些屬後續批次。



## 2026-10-08 GM result-context／舊資料安全優化第3批

- GM 測試結果全面採用共用 `testContext` envelope：`vipgm.js` 的 `gmAttachTestResultContext()` 為統一結果包裝入口，會把當次角色紀元／等級／裝備、VIP、突破、強化、專精、文明、印記、能力值與 final-damage snapshot 一起封進 result。
- 已套用於特殊怪、懸賞、虛空、銀河／宇宙／高維競技場、鏡像、銀河／宇宙災厄、地圖／輸出／承傷 benchmark、高維地圖怪，以及異宇宙 benchmark；結果 snapshot 可以自證「當時用什麼角色設定跑的」，摘要不再只能依賴目前畫面設定。
- 高維競技場、高維地圖怪與異宇宙 benchmark 補上 context revision guard；批次／非同步測試中途若改變 GM 角色設定，舊執行不得在 invalidation 後重新回填結果。
- `gmpowerbenchmark.js` 的 test-context invalidation 升為 V2，新增 listener registry（`GM_POWER_BENCHMARK_TEST_CONTEXT_INVALIDATION_REGISTRY_VERSION=1`）；高維地圖與異宇宙等延伸模式以 listener 註冊自己的 result clear，不再只靠包裝舊 `gmPowerBenchmarkInvalidateSnapshot()`。後續新增模式應註冊 listener，而不是再堆 wrapper。
- GM 正式印記修改已收斂到 `gmformaltransaction.js` 的 `gmCommitFormalMarkMutation()`，由 shared `runSettlementTransaction` 負責存檔與 rollback；`calamitygm.js` 不再直接修改正式 `state.marks` 後自行 save。
- `calamitystate.js` 的 persisted mark progress normalization 已 canonicalize：未取得固定 0、滿級固定 0、Lv.0～9 依 `MARK_UPGRADE_KILLS` 把 progress clamp 到下一級需求以下；`MARK_STATE_PROGRESS_CANONICAL_VERSION=1`。
- 舊存檔仍維持銀河災厄 HP 依新最大值直接 clamp，不做舊血量比例換算、不升 Save Schema17。
- `savemigration.js` 的 GM transient cleanup inventory 已涵蓋 `gmTestBreakthroughLevel`、`gmTestContext`、`gmTestContextRevision`、benchmark／result 暫存等 GM-only key；載入舊檔若曾誤存這些欄位會清除，正式 save 不會保存 GM sandbox context。
- 相關 integrity 與 `index.html` cache-bust 已同步。完整擊殺 no-progress 提前停止與 formal-vs-GM 災厄同條件 regression 留給第4批。



## 2026-10-08 銀河災厄／GM 測試優化第4批（項目4、12）

- 銀河文明災厄 GM「完整擊殺模擬」新增 no-progress guard：若連續 **100 場**完全造成 0 傷害，提前停止，不再空轉至 100,000 場安全上限；100,000 場 safety limit 仍保留作最後防線。UI 與統一摘要會明確顯示「無有效進度」及連續零傷害場數。
- 新增純判定 API `gmCalamityShouldStopForNoProgress()`，integrity 鎖住 99 場不停止、100 場停止；`GM_CALAMITY_NO_PROGRESS_GUARD_VERSION=1`。
- `calamitycore.js` 新增唯讀正式 headless combat owner：`runCivilizationCalamityHeadlessCombat()`（`CALAMITY_HEADLESS_COMBAT_VERSION=1`）。它只建立正式玩家／敵人／印記／final-damage Combat Core 輸入並回傳 combat，不做 settlement、不改災厄 HP、不升印記、不存檔。
- 正式 `runCivilizationCalamityBattle()` 已委派此 headless owner 執行 Combat Core，再走原本 settlement；並維持原先「進 Combat Core 前先把正式角色 HP 回滿」的時序。
- `calamitygmintegrity.js` 新增 formal-vs-GM 同條件 parity regression：以同一正式玩家能力、正式印記等級 map、相同災厄、相同 enemyStartHp、相同正式 final-damage multiplier、相同固定 RNG 序列，對比正式 headless 與 GM 單場沙盒的 win／enemyHp／playerHp／turns／倍率；GM regression 明確關閉 test specialization，避免拿 GM 專精污染正式對照。
- `calamitycoreintegrity.js` 鎖住正式 headless owner 契約；相關 JS／integrity／benchmark summary 已更新 `index.html` cache-bust。
- 本批不改正式災厄 HP、ATK／DEF、印記升級規則、Save Schema17、正式 settlement 與舊資料 migration。



## 2026-10-08 GM 授權／runtime gate 早期恢復第1批

- 問題根因：GM 授權雖已保存在 browser-local `localStorage`（`civilization-war-gm-authorized-v1`），但舊流程要等 `window load` + 120ms，再等整個 deferred GM group 載完後才把 `state.gm=true`；因此同裝置已輸入過密碼，剛進遊戲仍可能暫時呈現未授權，甚至 GM group 某次載入失敗時看起來像「GM 消失」。
- `scriptgrouploader.js` 新增 `GM_EARLY_RUNTIME_RESTORE_VERSION=1` 與 `restoreAuthorizedGmFlagEarly()`：loader 一執行就先讀 browser-local 授權並恢復 runtime `state.gm`，不再等待 31 支 GM deferred scripts 全部完成。
- `ensureAuthorizedGmRuntime()` 現在先恢復 runtime flag，再背景載入 GM group；若 GM group 載入失敗，既有 browser-local 授權仍保持為 runtime 已授權，不把載入錯誤誤判成授權失效。
- 密碼首次通過後，`authorizeGmRuntime()` 也先設 runtime GM flag，再載完整 GM group；授權與管理 UI 載入正式拆開。
- 已授權時再次打開密碼 modal，retry 路徑改走 `ensureAuthorizedGmRuntime()`，成功後會重新補齊 runtime 授權，而不是只單純 retry `loadGroup("gm")`。
- 原 save boundary 完整保留：`state.gm` 仍是 runtime-only，不寫入角色 save／Cloud Save。
- 新增 `tests/runtime/gm-runtime-early-restore-integrity.js` 並加入 Runtime Integrity workflow，鎖住「已授權在 window load／GM group 完成前即恢復」以及「未授權 fail closed」。
- 本批尚未改背景戰鬥、GM 2×、主線鎖血這三個帳號／裝置 preference owner 與 auth-ready 同步；這些留待第2批。



## 2026-10-08 GM runtime preference／auth-ready 同步第2批

- 新增早期常駐 `gmdevicepreferences.js`（`GM_RUNTIME_DEVICE_PREFERENCE_CORE_VERSION=1`）：背景戰鬥與主線鎖血的 localStorage key 格式完全不變，但正式 gate／storage helper 不再依賴 deferred `gmbackground.js` 才存在；帳號 session 未就緒時 fail closed，`civilization-auth-ready` 後立即按目前 user id 讀回既有偏好並廣播 `gm-runtime-preferences-ready`。
- `gmbackground.js` 升為 UI delegate V2，只保留 GM 管理介面與寫入操作，正式 `gmBackgroundBattleEnabled()`／`gmMainlineHpLockActive()` owner 移至早期 runtime core；不提前載整個 GM Hub。
- `combatspeed.js` 新增 `COMBAT_SPEED_GM_AUTH_SYNC_VERSION=1`／`gmSyncCombatSpeedFromAuth()`；帳號 session ready 後立即重新讀取 `civilization_frontline_gm_combat_speed_v1_<userId>`，並送出 `combat-speed-change`，因此既有 GM 2× 不必等下一次戰鬥流程才重新取得。
- 新增 `tests/runtime/gm-runtime-auth-preferences-integrity.js`：鎖住未登入時背景／鎖血／2× fail closed，以及 auth-ready 後同帳號既有 background=true、HP lock=true、2× 都立即恢復並廣播。
- `tests/runtime/gm-mainline-hp-lock-integrity.js` 已同步新 owner；`GM_DEVICE_BOOLEAN_PREFERENCE_VERSION` 升為 V2。
- `scriptgrouploader.js` 補 `GM_AUTHORIZED_GROUP_RETRY_VERSION=1`：已授權 GM group 首次載入失敗後 250ms 自動重試一次；兩次都失敗仍保留已恢復的 runtime GM 授權，不把載入錯誤誤判為密碼失效。
- 本批不改三個既有 localStorage key、不寫角色 save／Cloud Save、不改正式戰鬥公式與 Save Schema17；完整 GM 管理仍維持 deferred。



## 2026-10-08 GM 載入優化第1批（首次 render／legacy cleanup／browser regression）

- 新增極小 startup owner `gmruntimeauthorization.js`（`GM_RUNTIME_AUTHORIZATION_CORE_VERSION=1`、`GM_RUNTIME_EARLY_RESTORE_VERSION=2`）：正式擁有 browser-local GM 授權 key、runtime flag reconcile 與 save boundary；完整 GM 管理仍維持 deferred。
- `index.html` 將此 owner 放在 `savehookcore.js` 之後、`ui.js` 之前。正式啟動流程現在為：`load()` → normalize → `gmReconcileRuntimeAuthorizationAfterLoad(state)` → 原本的 `save(false)` → 第一次 `render()`。因此已授權裝置第一次 main render 時 `state.gm` 就必須為 true，不再等頁面之後切換／重繪。
- 未授權但舊存檔殘留 `state.gm=true` 時，同一 reconcile 只在記憶體把它清為 false；由既有啟動 `save(false)` 順手保存乾淨狀態，不再由 deferred loader 額外做一次 `stripLegacySaveAuthorization() + save(false)`。
- `scriptgrouploader.js` 已移除自己的授權 key／legacy save cleanup／save-boundary owner，改委派 `gmruntimeauthorization.js`；仍負責 deferred GM group 載入、retry 與 password bridge。
- save boundary 仍使用原 ID `gm-runtime-authorization-v1`，正式 save 前移除 runtime `state.gm`，settlement 後恢復；不把授權寫入角色 save／Cloud Save，Save Schema17 不變。
- `tests/runtime/gm-runtime-early-restore-integrity.js` 已改為鎖住 owner 順序、authorized／legacy／clean 三種 reconcile 與 save-boundary single install。
- 新增 Playwright `tests/runtime/gm-first-render-browser.js`：預先寫入 GM authorization localStorage，直接攔截 `#main` 第一次 innerHTML render，要求該瞬間 authorization=true、runtimeFlag=true、startup owner V1、early restore V2；已加入 Runtime Integrity browser smoke。


# 25. 下一個對話如何接手

新對話請直接使用以下標準指令：

```text
讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，
再重新檢查 main 的實際程式碼與這次要處理功能的正式 owner／consumer，
完整承接《文明戰線》專案。

以 GitHub main 為唯一真實來源；不要只靠對話記憶、舊交接檔或歷史設計文件。
先確認目前 HEAD、Save Schema、相關 runtime/integrity、current world semantics 與既有正式 owner；不要把歷史 CI 當成當前 HEAD 的驗證。

已完成的 Batch5／6／7、Code Cleanup Batch1～8、
第一紀元 Target Context Batch0～6與優化1～4、
轉生／GM／三紀元語義四批優化、
異宇宙稱號 Batch1～4、
第三紀元副本 access 收斂、
鏡像 canonical settlement／GM正式裁定、
AU threshold owner／migration diagnostics、
Schema17 舊檔相容矩陣與近期 Batch4 closure，
本次劇情轉生四批（101／100／11篇唯讀回顧、W3十王正式通關）、
劇情／災厄優化三批（Story migration舊檔安全、W1/W2最後一場存檔與Fast Catch-up、共用 UI policy），
都不得因舊文件重新施工或倒退。

若我說「先討論／先檢查／先不要修改」，只分析不要改 GitHub；
若我說「修改／做／執行／第N批」，可直接修改 main。

修改時優先改正式來源，不要另外堆 wrapper、fallback、第二套公式或第二套 owner。
JS／CSS production 改動要同步更新 index.html cache-bust。
修改後 fresh-read、compare base→head、自我檢查，
並以 exact HEAD 的 Runtime／Story（若該變更有觸發）／Pages Actions 結果為準。
轉生後劇情只進戰線紀錄，不補入 formal completedStories、不重播；
W3 完成只看本輪10王正式 HP；災厄最後一場勿重複存檔／額外等待。

現在先不要修改。
```
