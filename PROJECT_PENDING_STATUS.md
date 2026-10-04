# 《文明戰線》目前待辦狀態

更新日期：2026-10-04  
分支：`main`

> 本檔記錄真正尚未完成、重要已修紀錄與刻意延後工作。若本檔、舊 handoff、舊對話、舊 Word 或歷史文件與 current `main` 衝突，一律以 current `main` 為準。

## 目前正式狀態

- `SAVE_SCHEMA_VERSION = 17`。
- 銀河紀元、宇宙紀元、高維紀元三紀元正式 runtime 已完成；高維紀元 Lv.1000～2000、10 名高維存在、首輪 5pp、永久削血、維度之弦、界弦核心、Story／Final、Arena、loot／offline 與回顧均已實作。
- 轉生／突破核心、正式轉生流程與優化第1～4批已完成。
- 異宇宙 Batch3～4 已完成。
- 轉生後重征服 Batch5-1～5-5 已完成。
- Batch5 後續架構優化共 4 批已全部完成：第1批「W1 Target Context／prepare 正式 state 隔離」、第2批「W2 visibility owner 收斂」、第3批「共用 UI renderer 收斂」、第4批「完整端到端 regression 封箱」。
- 第6大批已開始；6-1「轉生越級 Online 收益」、6-2「一鍵平均專精／平均最大強化」、6-3「轉生越級 Offline 收益」、6-4「首次轉生後四大副本永久解鎖」已完成；6-5 待做。
- 目前主要施工剩餘：Batch6-5、Batch7。

## 2026-10-04 已修：W1／W2 轉生重征服目標一致性

W1 曾發生轉生後點 Lv.500 Boss，舊 `adventurePreparePage()` 以 `selectedMap = Math.min(selectedMap, state.unlockedMap)` 把 map99 壓回 map0，導致準備頁、戰鬥、實際 encounter 與 `bossKilled` 都變成低階目標，並使 key boss downward coverage／文明災厄無法正確成立。

本次已修正：

- 首輪 `count=0` 完整沿用原本 sequential progression，不改首輪解鎖規則。
- W1 rerun 在 prepare 階段保留玩家真正選定的 map；正式 `state.unlockedMap` 不會被偽造或永久改寫。
- rerun 下普通／菁英／Boss 仍依既有 rerun policy 可直接選擇。
- regression 已固定驗證 map99 + Boss → prepare Lv.500 → combat Lv.500 → encounter Lv.500，且 `unlockedMap` 仍為 0。
- W2 重新檢查後沒有同類 production bug；既有流程仍由 Boss `index` 從 UI → challenge → encounter → combat → settlement 一路直傳。
- W2 regression 已固定驗證 Boss index99 的正式定義與 encounter 均為 Lv.1000 且同一 Boss。

## 2026-10-04 已完成：Batch5 後續架構優化第1批（W1 Target Context）

- 新增正式 `firstWorldReincarnationTargetContext()`，把 rerun 當前 `mapIndex / enemyIndex` 以不可變 context 固定下來。
- W1 rerun prepare 不再直接暫時改寫正式 `state.unlockedMap`。
- prepare 只在同步 render 期間使用 presentation state view 讓既有首輪 UI owner 正常渲染；離開後一定恢復原正式 `state` 參照與原 `selectedMap / selectedEnemy`。
- 首輪 `count=0` 仍完整委派原 `adventurePreparePage()`，首輪 sequential progression 不變。
- regression 已固定驗證 map99 + Boss 的 target context 為 `99 / 4`、prepare 前後正式 state JSON 完全不變、全域 `state` 參照正確恢復、`unlockedMap` 仍為 0。

## 2026-10-04 已完成：Batch5 後續架構優化第2批（W2 Visibility Owner）

- 第二紀元冒險區域顯示與 Arena 區域資格正式拆成不同語意 owner：`secondWorldAdventureRegionVisible()` 與 `secondWorldArenaRegionEligible()`。
- `secondWorldRegionVisible()` 恢復／保留原本「冒險主線區域是否顯示」的相容語意，不再承擔 Arena qualification。
- `dungeonprogress.js` 的第二紀元 Arena cap 改為優先讀 `secondWorldArenaRegionEligible()`；若新 owner 不存在才 fallback 舊 API。
- rerun 冒險頁不再為了顯示 10 區而暫時覆寫 `window.secondWorldRegionVisible`；所有 10 區直接由 adventure owner 判定為可顯示。
- rerun Arena 仍依本輪最高 key boss downward coverage 限制；零 coverage 時最低仍為第1區，coverage 6 時為前6區，coverage 10 時全10區。
- 首輪 `count=0` 的冒險顯示與 Arena cap 均委派原本第二紀元 progression 規則，不改首輪行為。
- regression 已固定驗證 rerun 冒險 render 前後三個 region owner 函式 identity 不變、正式 state JSON 不變、10區全顯示，而 Arena eligibility 仍依 coverage 分離運作。
- 此批沒有新增存檔欄位、沒有變更 Save Schema，不需要 migration。

## 2026-10-04 已完成：Batch5 後續架構優化第3批（共用 UI Renderer）

- `combatspeed.js` 新增正式共用速度徽章／標頭 renderer：`combatSpeedBadgeHtml()`、`combatSpeedHeaderHtml()`；W1 rerun 戰鬥標頭改由共用 renderer 產出，不再用 regex 改寫首輪 HTML。
- W1 首輪 `count=0` 不顯示額外速度徽章；轉生後 1.5× 解鎖時，rerun 戰鬥標頭使用正式 `.universe-combat-speed` 徽章，Minimal Mode 仍直接讀相同徽章節點。
- W3 rerun 不再對首輪 HTML 使用 `replaceAll()`；改為結構化讀取 `thirdWorldReincarnationRerunContext()` 與各 Boss `challengeStatus.fivePointBypassed`，只改對應 Boss 狀態文字與 rerun 戰鬥規則說明。
- W3 首輪 UI 不經 rerun presentation owner，5% 戰線原規則與文案維持不變；rerun 只在正式 policy 已解除 `five-point-front` 時顯示「可集中攻略」文案。
- regression 已固定驗證 W1 共用速度 renderer、舊 inline／regex 路徑消失；W3 驗證無 `replaceAll()`、確實讀取 `fivePointBypassed`／rerun context，且首輪不被污染。
- 此批只有 UI owner／renderer 收斂；不改 formal combat、settlement、Save Schema 或任何存檔欄位。

## 2026-10-04 已完成：Batch5 後續架構優化第4批（完整端到端 Regression）

- 新增 `tests/runtime/reincarnation-rerun-batch5-e2e-regression.js`，由真實瀏覽器 runtime 驗證，不只做 policy-level probe。
- W1 固定驗證：rerun 真實選 map99 / Boss → prepare 保持 Lv.500 → encounter Lv.500 → `fightOnce()` 正式 combat／settlement → 只寫入 `bossKilled[99]` → downward key coverage = 10 → 第10文明災厄解鎖；不得偽造低階 key boss flag，且 prepare 前後正式 state 不變。
- W2 固定驗證：Boss index99 / Lv.1000 → 正式 combat → `settleSecondWorldBossVictory(99)` → 只寫入實際 Boss99 → downward key coverage = 10 → 首／末宇宙文明災厄 eligibility 正確；不得偽造 Boss9 等低階 key flag。
- W3 固定驗證：rerun 可以且只能 bypass `five-point-front`；`defeated`、`invalid`、`world-locked` 仍維持拒絕。
- 同一支 closure regression 一併封箱首輪隔離、pre-Schema17 normalization、下一輪 reincarnation reset、1×／1.5× speed UI、Minimal Mode 與 W1／W2／W3 Fast Catch-up owner 版本。
- Runtime Integrity workflow 已納入此端到端測試，之後每次相關 JS／文件／workflow push 都會自動重跑。
- 此批只新增／收斂 regression 與文件，不改正式 combat／settlement 規則、不改 Save Schema，不需要 migration，也沒有 production JS／CSS cache-bust 需求。

## 2026-10-04 已完成：第6-1批（轉生越級 Online 收益）

- 新增共用 `reincarnationoverlevelrewards.js` owner；正式倍率為 `M = 1 + 0.03 × (enemyLevel - playerLevel)`，僅 `reincarnation.count > 0` 且敵人等級高於玩家時啟用，無額外 cap。
- 首輪 `count=0` 無論敵我等級差多少，倍率固定為 1；既有 `expReward()`、`goldReward()`、專精與首輪 reward 公式均未改寫。
- 整數 reward 統一採 `ceil(base × M)`。
- W1 Online：在原正式 `fightOnce()` 已完成既有 reward 計算後，只於轉生越級勝利追加差額；套用 EXP、金幣與戰鬥來源的基礎／進階強化石。裝備自動出售所得與出售轉換的強化石不套倍率。
- W2 Online：`secondWorldMainlineRewardPreview()` 在原 EXP／暗物質／暗能量計算完成後才套共用倍率；正式 settlement 依 preview 的最終暗能量數量入帳，不再寫死 +1。首輪 preview 與 settlement 數值維持原值。
- 裝備出售 owner `equipmentSaleQuote()`／出售價值公式完全不接越級倍率。
- `tests/runtime/reincarnation-overlevel-batch6-1-integrity.js` 固定驗證首輪隔離、W1 Lv.100→Lv.500 的 13×、W2 Lv.500→Lv.1000 的 16×、ceil、出售排除與 W2 正式 settlement。
- 此批沒有新增 Save Schema／存檔欄位，不需要 migration。

## 2026-10-04 已完成：第6-2批（一鍵平均專精／平均最大強化）

- 新增唯一共用 `playerbatchupgrades.js`；首輪與轉生輪完全走同一套批次規劃與結算，不以 `reincarnation.count` 分叉。
- 專精「一鍵平均提升」只在第一紀元顯示與可用；每次優先提升目前最低等級的專精，沿用既有 `SPECIALIZATION_KEYS`、`SPECIALIZATION_MAX_LEVEL=60`、`specializationUpgradeCost()` 與金幣資源。第二紀元因進入條件已要求 8 項 Lv.60，不再提供提升按鈕。
- 強化「平均最大強化」在第一、第二紀元共用同一套演算法；每次優先提升目前最低強化欄位，第一紀元沿用 +0～+20 與基礎／進階強化石，第二紀元沿用 +20～+40 與暗物質／暗能量，正式成本與上下限直接讀 `enhancementUpgradeCost()`／`effectiveEnhancementCap()`／正式 state owner。
- 高維紀元不顯示這兩個批次提升按鈕；印記與文明等級不納入本功能。
- 批次操作只新增操作便利性，不修改任何首輪專精／強化成本公式；先建立完整 plan、確認後再重算一次，最後一次正式存檔，若 save 失敗整批 rollback。
- UI 直接放在現有專精總覽與強化總覽，不新增轉生專用頁面；既有逐項升級按鈕完全保留。
- 新增 `tests/runtime/player-batch-upgrades-batch6-2-integrity.js`，固定驗證首輪／轉生同結果、專精僅 W1、強化 W1／W2、W3 禁用、資源扣除與 save rollback。
- 自我檢查移除了一份未載入且功能重複的 `growthbatchui.js` 草稿，避免同功能雙 owner；正式唯一 owner 為 `playerbatchupgrades.js`。
- 此批沒有新增 Save Schema／存檔欄位，不需要 migration。

## 2026-10-04 已完成：第6-3批（轉生越級 Offline 收益）

- `offlineprogress.js` 不另寫倍率公式；W1／W2 Offline 直接共用第6-1批唯一 owner `reincarnationOverlevelRewardMultiplier()` 與整數收益 owner `applyReincarnationOverlevelIntegerReward()`。
- 首輪 `count=0` 仍由共用 owner 固定返回 1×，因此既有 Offline EXP／金幣／暗物質／暗能量計算不變；沒有改寫首輪 reward 公式。
- W1 Offline：EXP、金幣與戰鬥來源強化石套用轉生越級倍率；裝備出售金幣與出售轉換的強化石維持原出售 owner，不套倍率。
- W2 Offline：EXP、暗物質、暗能量套用轉生越級倍率；裝備出售所得暗物質／暗能量仍由 `settleEquipmentSaleBatch()` 原 owner 結算，不套倍率。
- W1 強化石 Offline 原本使用期望值模型；為避免首輪被 `ceil()` 改變，期望值直接乘第6-1正式 multiplier 後再套既有 5% Offline rate，而不是複製倍率公式或把首輪期望值強制整數化。
- W1／W2 正式前景樣本中的 `playerLevel / enemyLevel` 現在一路傳到 farm target 與 pending settlement；離線結算使用「建立該實戰樣本時」的玩家／敵人等級，不會因離線結算途中升級而改變 multiplier。
- 舊 pending 若沒有 `playerLevel / enemyLevel`，視為沒有可驗證的越級 context，保守維持 1× 舊收益，不做推測性 retroactive bonus；不需要 Save Schema migration。
- W3 Offline 完全不接越級倍率，仍維持 gear-only allow-list settlement。
- 既有 `tests/runtime/reincarnation-overlevel-batch6-1-integrity.js` 已延伸為 Batch6-1／6-3 browser regression，固定驗證首輪 Offline 1×、W1／W2 rerun Offline 共用 owner、W2 暗能量、sample target identity、舊 pending 1× 相容與出售排除。
- `index.html` 已同步更新 `offlineprogress.js` cache-bust；此批沒有新增存檔欄位或 Save Schema。

## 2026-10-04 已完成：第6-4批（首次轉生後四大副本永久解鎖）

- 新增 `reincarnationdungeonaccess.js` 作為轉生副本 access adapter；永久資格只由既有 `dungeonReincarnationContext()` 的 `reincarnationRun` 派生，不新增 Save 欄位、不另建生命週期判定。
- 首輪 `count=0` 完整沿用原本等級解鎖與高維紀元副本規則；首次轉生後，懸賞戰、競技場、鏡像戰、虛空幻境四個入口永久可使用，並沿用既有副本首頁與各模式 UI。
- 轉生後即使角色重回 Lv.1，四個入口仍可開啟；adapter 僅在呼叫原副本 owner 的初始入口期間使用舊解鎖等級作 presentation floor，正式角色 `state.level` 不會被寫入、保存或永久改變。
- 首輪高維紀元仍維持「懸賞戰關閉」；只有 `reincarnation.count > 0` 的高維紀元重征服會恢復懸賞入口。`worldtransitionsafety.js` 仍維持 World Transition Safety V5，只把具體 `BOUNTY_WORLD_PHASE_GATE_VERSION` 升為 2。
- Daily 使用次數與獎勵狀態不因轉生刷新；正式轉生 reset 既有 owner 仍保留 Mirror／Void permanent history，並重置 W1／W2 本輪 Arena Rank，沒有新增第二套 reset。
- W1 Arena 區域上限正式補齊：轉生輪改讀既有 `firstWorldRerunKeyBossCoverage()`，只依實際 key Boss 勝利向下推導 eligibility；coverage 0／6／10 對應 rank cap 1／6／10，不偽造任何較低階 `bossKilled`。W2 仍沿用 Batch5-3 已完成的 `secondWorldArenaRegionEligible()`。
- 原 Arena 戰鬥、晉階與 97% 驗收公式完全未改；本批只處理入口資格與區域 cap。
- 新增 `tests/runtime/reincarnation-dungeon-access-batch6-4-integrity.js`，真實瀏覽器固定驗證首輪隔離、轉生 Lv.1 四入口、正式等級不被 adapter 污染、W1 downward coverage、首輪／轉生 W3 懸賞差異，以及版本契約。
- `index.html` 已同步加入 adapter 與 `worldtransitionsafety.js` cache-bust；此批沒有新增 Save Schema／存檔欄位，不需要 migration。

---

# 目前真正 pending

## 1. 第6-5批：Batch6 完整封箱 Regression

- 首輪 reward 計算隔離。
- Online／Offline 同倍率 owner 與同目標 identity。
- 一鍵專精／強化首輪與轉生共用 owner，專精僅 W1、強化 W1／W2。
- Daily 保留、Mirror／Void 保留、W1／W2 Arena reset。
- 四副本入口永久資格、Arena key boss downward coverage、97% 晉階規則。
- 裝備出售與出售轉換資源不得被越級倍率污染。

## 2. 第7批：GM／測試／完整 Integrity 收尾

- GM 指定轉生次數／永久突破等級。
- GM 正式轉生 transaction 按鈕。
- GM AU unlock／deepest。
- **GM 指定角色等級時，若目前為轉生輪次，必須依實際跨越的 Lv.100／200／…／1000 突破里程碑同步增加本輪突破；直接沿用 `grantBreakthroughMilestonesForLevelCrossing(fromLevel, toLevel, state)` 正式 owner，不另寫公式。**
  - 首輪 `count=0`：GM 調等級不得增加突破。
  - 轉生輪 `Lv.1 → Lv.500`：應增加 5 級突破。
  - `Lv.500 → Lv.1000`：再增加 5 級突破。
  - 已取得里程碑不得重複給予。
  - GM 往下調等級不得倒扣突破。
  - Lv.1000 以上不再增加本輪突破。
- 角色能力測試新增突破值與正式角色同步。
- AU benchmark。
- 21 種雙 trait diagnostic。
- rerun／overlevel／dungeon／AU 全生命週期 regression。
- 最終完整 closure。

---

# 原定 7 大批進度

```text
第1批：轉生核心資料與首輪隔離                 完成
第2批：突破系統＋正式轉生最小可用流程         完成
第2批後優化1～4                               完成
第3批：異宇宙最小可玩版                       完成
第4批：異宇宙完整化與平衡測試                 完成
第5批：第一、第二、第三紀元轉生後重征服規則   完成（5-1～5-5）
第6批：越級 EXP／資源／離線＋共用批次成長＋四副本永久解鎖  進行中（6-1、6-2、6-3、6-4 完成）
第7批：GM 管理／測試／完整 Integrity 收尾      未開始
```

Batch5 後續架構優化為獨立 4 批；第1～4批已全部完成，不與原第6／7批混寫。

---

# 已取消／不得自動復活

除非使用者主動重新開啟：

- AU 作為 Lv.2001+ 或第四紀元。
- AU dynamic breakthrough scaling。
- AU 經濟／掉落。
- AU replay／review。
- forced old Story rereading。
- 取消 Lv.500／Lv.1000 紀元邊界。
- 越級 multiplier 額外 cap。
- 裝備出售收入套越級 multiplier。
- AU 套用 W3 5pp／永久削血／階段機制。
- AU 超過 2 traits。
- 保留 `lostGear` 跨轉生。
- 玩家介面顯示內部 B／U 縮寫。
- VIP21+ 新增特殊特權。
- 高維紀元新增第二套／第三套貨幣、+41～+60、專精61+、印記11+、文明11+。

---

## 承接規則

- `main` 是唯一真實來源。
- 修改前 fresh-read 真正 owner／consumer。
- 「先討論／先檢查／先不要修改」不得修改。
- 「做／修改／執行／第 N 批」可直接施工。
- JS／CSS 修改必須同步更新 `index.html` cache-bust。
- 每批完成後重新讀 current main，檢查 UI／邏輯／資料寫入／舊檔相容／Runtime／Integrity。
- 已完成規格不得因舊文件或舊對話自動復活。