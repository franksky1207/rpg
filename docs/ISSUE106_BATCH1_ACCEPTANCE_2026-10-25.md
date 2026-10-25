# Issue #106 第 1 批本機驗收

日期：2026-10-25（Asia/Taipei）。只完成收益核心與本機驗收；第 2 批角色介面未施工。

## 基準與範圍

- 正式規格與基準 main：`314fe6814ea17e3ff2cd8deafe25ef6943204513`。
- 既有整合分支：`feature/issue-106-reincarnation-offline-yield`，fetch 後核對承接 `1db38568ea90cfaea1a186e9a391167e4fa0e27b`，保留原 12 個施工 commits。
- 全部施工在同一分支；未建 PR、未呼叫 Actions、未合併 main、未發布 Pages。commit/push 採 `[skip ci]`，且既有 push workflows 限定 main。
- `DEVELOPMENT_PROTOCOL.md` 的正式 main CI／Pages 完成條件仍保留；本報告是使用者明確限定的本機第 1 批驗收，不冒稱正式發布驗收。

## 程式盤點與實際 owner

| Owner | 呼叫路徑及處理 |
| --- | --- |
| `reincarnationoverlevelrewards.js` | `calculateReincarnationYield` 唯一原始收益計算器；只讀既有 `reincarnation.breakthrough.permanent`。保留舊越級資格。 |
| `engine.js`、`combatcore.js` | `firstWorldMainlineRewardPreview` 共用銀河主線原始 EXP／金幣，正式單場、deferred settlement、連戰、背景、文字基礎模式沿用既有 fight／settlement owner。先算完整收益再發放；素材使用 EXP 發放前快照。掉落 RNG 次序、裝備 owner、進度、存檔及戰鬥核心保持原路徑。 |
| `secondworldrewards.js` | 宇宙主線 preview／正式 transaction／離線共用 preview。EXP、暗物質、暗能量先算後發。正式出售與批次出售共用 `equipmentSaleQuote`。 |
| `enhancementrewards.js`、`equipmentlock.js` | 手動出售、自動出售、換裝自動出售、批次出售沿用既有報價／素材發放 owner。缺出售 owner 時 fail closed，不能走不含突破的舊金幣 fallback。 |
| `offlineprogress.js` | 唯一常數 `OFFLINE_REWARD_RATE=.10`，唯一折算入口 `offlineReward(value)`。兩紀元呼叫正式 preview 的未取整值再折算；銀河與宇宙離線裝備都走 `settleEquipmentSaleBatch`，素材保持既有發放 owner。 |
| `specialization.js` | 新增 explicit target 的唯讀專精倍率，使用既有專精等級換算函式。`useTest` 只讀 GM 測試專精；不正規化／改寫正式或傳入 state。 |
| `dungeonbounty.js`、`specialencounter.js`、`specialgmbatch.js` | 懸賞與特殊遭遇的實際共用 EXP／金幣／暗物質 helper 亦接入突破；保留原 tier、特殊效果及專精規則，不新增越級資格。宇宙已調整過的基礎收益不再次套專精。GM 只讀測試專精。 |
| `secondWorldEquipmentSaleDarkMatter` | 剩餘合法呼叫為既有裝備贖回成本與診斷；保留原贖回經濟。正式出售不經此舊贖回參考值再次加成。 |
| `backgroundprogress.js`、`battlepipeline.js`、`settlementtransaction.js` | 盤點後保留既有正式 pipeline／transaction；不新增第二套戰鬥、背景或存檔 owner。 |

## 數值與取整契約

未取整收益：`raw × (1 + 適用專精加成 + 永久突破 × .01) × 合格越級倍率`。所有傳入值均為專精前原始值。

- 訓練／搜刮／鑑價的適用範圍維持原規則；素材不套專精。出售沒有越級倍率。
- 歷史整數基準 `legacy = ceil(ceil(raw × specMultiplier) × overlevel)`。
- EXP／貨幣：`max(legacy, ceil(完整收益))`；突破 Lv.0 精確保留舊版雙階段 ceil。歷史取整下限避免低單位收益在 Lv.1 反而少於 Lv.0。
- 基礎／進階強化石、暗能量：`max(legacy, floor(完整收益))`。這是每次整數發放的契約，不存小數餘額；Lv.1 無越級的單位 1 仍為 1，不無條件翻倍。Lv.130 的單位 1 發 2；既有合格越級 ceil 下限保留。
- 離線：使用未取整公式，先乘共用 10%，EXP／貨幣逐場累積小數，素材依期望值及場次，暗能量依場次；總額最後 floor。修正 1.3 等浮點數的整數邊界誤差。離線資格維持銀河普通／菁英，不能從主線 Boss 新增離線進階石；出售素材來源保留。
- 離線裝備仍為原抽樣機率及 gear accumulator。抽到後的出售走正式完整報價，不再對出售所得折 10% 或套第二次突破。
- Lv.130／對應專精 Lv.60：原始 100 → 380；無專精資源原始 100 → 230；越級倍率最後相乘。
- 主線直接收益於本次 settlement 前讀取突破；銀河 EXP 跨里程碑後不回頭改本場直接素材。裝備出售在各自既有交易發生時讀取突破。離線直接收益在區段開始結算時讀取，不從舊樣本保存新倍率。

## 退役、失敗修復及完整性保護

1. 移除無合法呼叫者的 adjusted-input 計算器、戰後補差額實作。保留 `applyWorld1OnlineOverlevelReward` 為無副作用相容 alias，正式路徑不再呼叫，舊呼叫不能二次發獎。
2. 退役全部五個分離的離線比例名稱、兩個 5% 特例、舊離線整數 overlevel helper、舊銀河離線出售 fallback；結果文案與強化完整性斷言同步為 10%。
3. 新增測試先重現 Lv.1 單位素材 1→2，再修計算器；測試涵蓋 B0／B1 取整下限及純小數公式。
4. 離線最終 `save(false)` 回傳 false 原本未被視為失敗；現在與 exception 一樣回復區段前 state，保留 pending 供重試。銀河／宇宙 × V3／V4 pending 均測試故障、重載重試及再次重載不重發。
5. `reincarnation-overlevel-batch6-1-integrity` 的離線 oracle 改與新的未取整共用 owner 一致，保留 first-run、正式越級、出售隔離、目標身份及 legacy pending 防護。
6. `mainminimalmodeintegrity` 對已退役 gate API 的斷言改驗現役 lifecycle、背景 start/stop、可見性 API；沒有取消文字基礎模式與正式戰鬥保護。離線與高維 sample adapter 的 canonical owner 版本改為既有 V2。
7. 強化診斷中的舊成本、舊 UI 版本、舊 newState normalizer 數量斷言對照當前 main 更新；成本本體完全未改。保留 +20～+40、非法低等級偵測、root-preserving normalizer 與素材資格測試。
8. 新增 `issue106-approved-sources.{cjs,json}` 精確 live→main SHA256 對照，僅供歷史來源 seal。既有歷史 SHA、數值與原始碼預期不改；另封存完整傷害核心、存檔遷移、轉生／突破及高維經濟 owner。行為測試一律執行 live code。
9. 額外舊 Batch16 測試在未修改 main 同樣失敗，原因是仍禁止現役高維 void／mirror；依當前正式 whitelist 更新為精確身份驗證，補 world4／未授權拒絕，並使用既有 exact-source adapter 保留 cff02989 歷史字節。未修改 resolver、怪物身份或 renderer。
10. Playwright 預設瀏覽器未安裝，改用已安裝 `/usr/bin/chromium`；Schema18 測試另需已備妥的 Supabase SDK 測試路由，排除外部 CDN 等待。Structural 的首次 timeout 來自對每個語法子程序注入 Playwright preload；移除此不必要 preload 後通過。均未把環境失敗算成成功。
11. 全部變更的玩家端 JS 同步 cache token；resource manifest 僅重算本次 13 個 JS 指紋，不改快取策略或資源集合。

## 存檔與高維

- Schema 18；沒有新增持久倍率、資源欄位或 Schema bump。既有資源、轉生與突破里程碑不追補、不重置。
- Schema1～17 migration、Schema17 matrix、Schema18 local／JSON／cloud full-field roundtrip、save hook 故障、轉生 transaction 及 pending migration／retry／去重通過。雲端往返使用本機 mock，未寫入外部帳號。
- 高維 EXP、維度之弦、核心、Boss 傷害與其他經濟 owner 保持 main 字節。測試將新收益計算器替換為會丟錯的函式，高維離線仍成功且只增加合法裝備；不新增高維離線 EXP／弦。
- 本機測試使用隔離瀏覽器 context 與 synthetic saves；未讀寫玩家實際存檔。

## 實際指令與結果

驗收以獨立指令為單位（不把內部 assertion 數冒稱測試數）：**57 通過／0 失敗／0 個本批必要項目未執行**。中途失敗及修復如上。未執行整庫所有不相關測試、GitHub Actions、PR、main 合併、Pages 及實機 Safari；這些不是本批授權範圍。

瀏覽器測試使用本機 HTTP server：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

本環境的瀏覽器指令前綴：

```sh
CHROMIUM_EXECUTABLE=/usr/bin/chromium \
NODE_PATH=/workspace/.rpg-tools/node_modules \
NODE_OPTIONS=--require=/workspace/.rpg-tools/system-chromium.cjs \
RPG_OFFLINE_SDK=1 node tests/runtime/issue106-reward-yield-browser.cjs
```

`js-integrity.js` 不加 `NODE_OPTIONS`，避免逐檔語法子程序重載 Playwright。其餘 Node-only tests 也不需要瀏覽器環境。依相同方式實際執行以下完整清單：

```sh
node tests/runtime/asset-integrity.js
node tests/runtime/batch12-presentation-safety.cjs
node tests/runtime/batch16-dungeon-contract.cjs
node tests/runtime/batch17-boss-contract.cjs
node tests/runtime/batch18-alternate-contract.cjs
node tests/runtime/batch19-absolute-sizing-contract.cjs
node tests/runtime/batch20-alternate-ten-stages.mjs
node tests/runtime/batch20-approved-runtime.cjs
node tests/runtime/breakthrough-core-integrity.js
node tests/runtime/breakthrough-final-damage-integrity.js
node tests/runtime/cleanup-batch2-4-integration.cjs
node tests/runtime/cross-era-background-browser.js
node tests/runtime/cross-mode-late-settlement-regression.cjs
node tests/runtime/docs-integrity.js
node tests/runtime/equipment-world-semantics-batch2-integrity.js
node tests/runtime/first-world-target-context-baseline-integrity.js
node tests/runtime/first-world-target-context-combat-batch3-integrity.js
node tests/runtime/first-world-target-context-continuous-batch4-integrity.js
node tests/runtime/first-world-target-context-final-batch6-integrity.js
node tests/runtime/first-world-target-context-offline-rerun-review-batch5-integrity.js
node tests/runtime/first-world-target-context-optimization-1-integrity.js
node tests/runtime/first-world-target-context-optimization-2-integrity.js
node tests/runtime/first-world-target-context-optimization-3-integrity.js
node tests/runtime/first-world-target-context-optimization-4-integrity.js
node tests/runtime/first-world-target-context-owner-batch1-integrity.js
node tests/runtime/first-world-target-context-ui-batch2-integrity.js
node tests/runtime/foreground-combat-lifecycle.cjs
node tests/runtime/foreground-combat-modes-browser.cjs
node tests/runtime/gm-character-breakthrough-batch7-2-integrity.js
node tests/runtime/gm-mainline-hp-lock-integrity.js
node tests/runtime/issue106-approved-sources.cjs
node tests/runtime/issue106-reward-yield-browser.cjs
node tests/runtime/issue106-reward-yield-integrity.js
node tests/runtime/js-integrity.js
node tests/runtime/mirror-void-formal-contract.mjs
node tests/runtime/monster-appearance-contract.mjs
node tests/runtime/newstate-save-owner-integrity.js
node tests/runtime/offline-sample-provenance-opt4-integrity.js
node tests/runtime/pr48-stop-contract.cjs
node tests/runtime/publish-build-regression.cjs
node tests/runtime/reincarnation-overlevel-batch6-1-integrity.js
node tests/runtime/reincarnation-save-integrity.js
node tests/runtime/reincarnation-transaction-integrity.js
node tests/runtime/resource-cache-integrity.js
node tests/runtime/resource-manifest-integrity.js
node tests/runtime/save-global-writers.js
node tests/runtime/save-hook-failure-regression.cjs
node tests/runtime/save-level-migration-regression.js
node tests/runtime/save-load-pipeline-integrity.js
node tests/runtime/save-migration-staircase.js
node tests/runtime/save-schema17-compatibility-matrix.js
node tests/runtime/schema18-save-roundtrip-browser.cjs
node scripts/build-publish-dry-run.cjs
node tests/runtime/special-fast-catchup-integrity.js
node tests/runtime/thirdworld-rerun-settlement-stage-regression.js
node tests/runtime/vip-unbounded-integrity.js
node tests/runtime/html-cache-version-guard.js origin/main HEAD
```

新增瀏覽器矩陣：80 場兩紀元正式戰鬥、180 次手動／自動／批次出售、20 組離線小數累積；另驗 4 組離線素材出售、里程碑跨越快照、GM 狀態隔離、素材資格、文字基礎模式與強化診斷、高維隔離，以及兩紀元 × V3/V4 pending 故障重試與去重。突破測 Lv.0／1／10／130／500，對應專精 Lv.0／60，越級／非越級、普通／菁英／Boss。

封裝 dry run：`deploy=false`、missing refs=0，32 張正式背景、6 首音樂、11 個音效檔維持原集合；沒有發布。

**判定：第 1 批收益核心與必要本機驗收完成，可進入第 2 批。第 2 批 UI、單 PR 與正式 CI／發布仍須另按後續授權執行。**
