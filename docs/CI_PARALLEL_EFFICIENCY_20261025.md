# CI 平行化與驗收紀錄（2026-10-25，Asia/Taipei）

## 基準與安全條件

- PR #101 已於 2026-10-25 14:11:46 合併，SHA `f5b85e1f1628b02cae076272b7653c1489e75882`。
- [Pages #500](https://github.com/franksky1207/rpg/actions/runs/40168240929) 建置與 deploy 均成功，14:18:04 完成。
- fetch 後施工基準：`19a60010d3252c34bb15d62d40aaff140244cca4`，獨立分支 `optimize/ci-parallel-efficiency-20261025`。
- 只修改 CI orchestration、CI 覆蓋檢查及文件，沒有修改遊戲、存檔、Schema、素材或測試斷言。

## 設計

- M1/M2/M3/M4、R1/R2/R3/R4、F1/F2/F3 共 11 個功能分組，各 runner 隔離。M4 以六個矩陣項目分開跑四批完整身份、正式動畫及故障恢復；每一原命令仍只執行一次。baseline 中四批全身份掃描約 17 分鐘，繼續串行會成為關鍵路徑，因此增加有限的 setup 開銷換取可獨立重跑。
- Runtime 快速核心保留；八支純 Node 回歸移出瀏覽器 job，僅安裝 gltf-validator。實際瀏覽器測試按內容分組；WebKit 只裝於 M3 與 R2。既有兩處一次性瀏覽器重試保留，不新增重試或 timeout。
- `ci-suites.json` 是可執行清單；`ci-command-map.json` 是原命令逐項對照。`ci-run-suite.cjs` 對每個命令用 bash `-e -o pipefail`，保留 env、管線、參數及退出碼，產出 SHA、秒數、exit code 的 JSON 與 Actions summary。失敗立即失敗，不以報告生成掩蓋退出碼。
- 三個原本直接搜尋 workflow 字串的歷史守衛改讀取實際被 workflow 呼叫的 suite；所有原斷言保留。新增對照完整性檢查；分類 job 會執行。
- Functional gate 比對分類輸出：只有 domain=false 才接受 skipped；domain=true 的所有子 job 都必須 success。Runtime/Formal gate 拒絕 failure、cancelled 及 skipped。移除 Runtime 的 stale-head 早退，避免 required job 未執行卻顯示 success。
- PR concurrency 以 workflow + event + PR number 分組，只有 PR 取消舊提交。Pages main 保持獨立固定 concurrency、`cancel-in-progress: false`、main 限制、Pages/OIDC 權限、受保護 environment 與 deploy needs；部署失敗仍直接回報失敗。
- Playwright 1.55.0 瀏覽器快取以 OS、架構、runner image、版本、瀏覽器集合為 key，不設跨版本 fallback。每次仍執行 Playwright 安裝器確認版本及系統依賴。Node modules 不快取，不重用其他 SHA 的測試結果或候選內容。
- Pages 僅刪除單獨 `publish-asset-audit.cjs` 的同來源掃描：它與 builder 都呼叫 `publish-assets.cjs` 的 `policy.inspect(root)`，同樣對 missing dependencies 失敗；builder 額外掃描實際輸出、重算 fingerprint 與報告。保留獨立 publish-policy regression、32 背景/17 音訊/5 音效類別、尺寸、所有瀏覽器與 GM sandbox 驗收。沒有增加跨 workflow 成功結果替代。
- 原本各 workflow 已只有一次候選 build；拆分後選擇各 runner 本地建置，不傳大型 artifact。baseline 建置/資產檢查約數秒，候選傳輸及完整性核對開銷較高。Formal 各組仍 stage SHA-verified GM B 支援。
- GM 約兩分鐘，維持單 job；使用共用 browser cache。與 Formal 重疊的 GM publication、runtime 與 browser 驗收保留，因兩 workflow 獨立觸發，沒有同 SHA/候選內容成功證明，不安全刪除。這是有意保留的重複。
- Pages 新增僅 workflow／共用 action 改動時的 PR preflight，完整執行候選驗收，但 configure/upload-pages/deploy 全限 main。PR 使用獨立 concurrency group，可取消同 PR 舊版；永不佔用或取消 main 發布 group。
- workflow / 共用 action / suite 改動觸發對應驗收。沒有改玩家 Pages 路徑或入口。

## 實測 baseline

完整 job / step 秒數、成功與失敗案例、SHA、event、attempt 見 [baseline JSON](ci/baseline-20261025.json)。runner 分鐘為所有 job 的 started_at→completed_at 秒數加總 /60，未計排隊，亦非 GitHub 帳單的逐 job 向上取整值；workflow 等待含排隊及收尾。

| Workflow | 完整成功 baseline | 等待秒數 | 最慢 job 秒數 | runner 分鐘 |
| --- | --- | ---: | ---: | ---: |
| Functional CI | [40168240909](https://github.com/franksky1207/rpg/actions/runs/40168240909) | 2183 | 2147 | 39.37 |
| Runtime Integrity | [40165934882](https://github.com/franksky1207/rpg/actions/runs/40165934882) | 641 | 639 | 12.63 |
| Equipment 2.5D Formal Battle | [40168240895](https://github.com/franksky1207/rpg/actions/runs/40168240895) | 484 | 481 | 8.02 |
| Publish Optimized GitHub Pages | [40168240929](https://github.com/franksky1207/rpg/actions/runs/40168240929) | 375 | 357 | 6.13 |
| Equipment 2.5D GM Integration | [40168240936](https://github.com/franksky1207/rpg/actions/runs/40168240936) | 118 | 115 | 1.92 |

Runtime main #40168240860 只有約30秒，因舊 freshness 規則略過所有測試，**不作完整 baseline**；採 PR 同代碼完整成功 #40165934882。失敗案例保留 Runtime #40164919571 與 Pages #40113687411。舊 job 通常把安裝、建置與多支測試混在同一 step，無法從 step API 精確拆出個別 build 秒數；新 suite 逐命令計時，避免捏造舊資料。

## 集中驗收與後續量測

先完成本機 actionlint、YAML、shell syntax、逐命令多重集合等值、分類、歷史守衛及 Node 回歸，再建立單一 PR。正式執行與量測以此分支的唯一 PR 的 Checks / Conversation 與合併後 main Pages run 為準；最終測量在 PR 說明中連結，避免為更新報表再跑一次整套 CI。此文件不把尚未執行的 CI 宣稱成功。

可使用 `python3 scripts/ci-measure-runs.py RUN_ID...` 取得同格式報告；實際 test 秒數見 `ci-suite-*.json` artifact。比較時必須是完整成功 run；重跑的單 job attempt 與初次完整 run 分開計算。新分組失敗可用 GitHub Re-run job 或 `gh api -X POST repos/franksky1207/rpg/actions/jobs/JOB_ID/rerun`；gate 也必須重新取得最新結果。絕不為展示重跑故意製造失敗或再次跑整套。

## 11 組逐命令對照

下列保留原命令，包括正式 Canvas 像素、尺寸、生命週期、WebKit、故障注入及歷史資料守衛；沒有改成 mock 或放寬標準。分組名稱的 M4-* 是同一 M4 的 runner 矩陣分片。原 Runtime browser 中純 Node 命令另列於快速核心。

### M1

```bash
python3 tests/runtime/batch13-monster-assets.py
python3 scripts/generate-monster-trial-registry.py --check
python3 scripts/generate-monster-codex.py --check
node --test tests/runtime/batch20-shared-monster-pool.test.mjs
node --test tests/runtime/batch13-monster-pool.test.mjs
node tests/runtime/batch20-notice-protection.cjs
node tests/runtime/three-ui-repairs-browser.cjs
node tests/runtime/batch20-codex-browser.cjs
node tests/runtime/batch20-repair-browser.cjs
node tests/runtime/batch20-bounty-preparation-browser.cjs
node tests/runtime/batch20-save-guide-browser.cjs
node tests/runtime/batch20-cloud-browser.cjs
```

### M2

```bash
python3 tests/runtime/batch17-boss-assets.py
node tests/runtime/batch16-special-contract.cjs
node tests/runtime/batch16-mirror-browser.cjs
node tests/runtime/batch16-live-dungeons-browser.cjs
node tests/runtime/batch17-live-bosses-browser.cjs
```

### M4-18

```bash
python3 tests/runtime/batch18-alternate-assets.py
node tests/runtime/batch20-alternate-ten-stages.mjs
node tests/runtime/batch18-cache.cjs
node tests/runtime/batch18-all-identities-browser.cjs
```

### M3

```bash
node tests/runtime/monster-appearance-contract.mjs
node scripts/audit-monster-appearance.mjs
node tests/runtime/batch16-cache.cjs
node tests/runtime/batch17-cache.cjs
node tests/runtime/batch20-visual-preparation-browser.cjs
node tests/runtime/monster-appearance-browser.cjs
APPEARANCE_BROWSER=webkit node tests/runtime/monster-appearance-browser.cjs
node tests/runtime/monster-approved-sizing-browser.cjs
RESOURCE_TEST_ROOT=.publish-stage3 node tests/runtime/monster-approved-cache-browser.cjs
node tests/runtime/monster-approved-performance.cjs
node tests/runtime/batch20-alternate-colors-browser.cjs
```

### M4-15

```bash
node tests/runtime/batch15-all-identities-browser.cjs
```

### M4-16

```bash
node tests/runtime/batch16-all-identities-browser.cjs
```

### M4-17

```bash
node tests/runtime/batch17-all-identities-browser.cjs
```

### M4-native

```bash
node tests/runtime/batch18-native-live-browser.cjs
```

### M4-recovery

```bash
node tests/runtime/batch18-monster-recovery-browser.cjs
```

### R2

```bash
node tests/runtime/galaxy-review-combat-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-baseline-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-owner-batch1-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-ui-batch2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-combat-batch3-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-continuous-batch4-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-offline-rerun-review-batch5-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-final-batch6-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-optimization-1-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-optimization-2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-optimization-3-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/first-world-target-context-optimization-4-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/thirdworld-rerun-settlement-stage-regression.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/special-fast-catchup-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/unified-mobile-combat-viewport-browser.cjs
if ! node tests/runtime/pr48-mode-matrix-browser.cjs; then
echo 'Viewport mode browser navigation interrupted first attempt; retrying once.'
node tests/runtime/pr48-mode-matrix-browser.cjs
fi
node tests/runtime/pr48-live-combat-browser.cjs
node tests/runtime/foreground-combat-modes-browser.cjs
node tests/runtime/foreground-combat-checkpoints-browser.cjs
node tests/runtime/foreground-combat-recovery-browser.cjs
node tests/runtime/combat-events-browser.js
node tests/runtime/combat-events-owner-browser.js
node tests/runtime/cross-era-background-browser.js
BACKGROUND_BROWSER=webkit node tests/runtime/cross-era-background-browser.js
node tests/runtime/thirdworld-background-browser.js
BACKGROUND_BROWSER=webkit node tests/runtime/thirdworld-background-browser.js
W3_B_VISUAL_FAILURE=1 node tests/runtime/thirdworld-background-browser.js
```

### R3

```bash
node tests/runtime/reincarnation-rerun-entry-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-rerun-world1-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-rerun-world2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-rerun-world3-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-rerun-batch5-closure.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-rerun-batch5-e2e-regression.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-overlevel-batch6-1-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/player-batch-upgrades-batch6-2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-dungeon-access-batch6-4-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-batch6-closure.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-normalization-opt-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/breakthrough-core-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/breakthrough-final-damage-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-breakthrough-management-batch7-1-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-character-breakthrough-batch7-2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-alternate-universe-management-batch7-3-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-alternate-universe-benchmark-batch7-4-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
if ! node tests/runtime/gm-formal-writer-convergence-batch2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt; then
echo 'GM browser navigation interrupted first attempt; retrying once in a fresh browser.' | tee -a runtime-integrity-report.txt
node tests/runtime/gm-formal-writer-convergence-batch2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
fi
node tests/runtime/reincarnation-batch7-closure.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/batch7-post-optimization-1-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/batch7-post-optimization-3-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/batch7-post-optimization-4-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-reset-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-permanent-gear-carryover-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-permanent-gear-formal-flow-regression.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/equipment-world-semantics-batch2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-ui-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-opt-batch2-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-opt-batch3-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-opt-batch4-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-battle-simulation-browser.js
node tests/runtime/gm-atlas-review-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-3d-test-center-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/3d-gm-loader-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-startup-preload-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-first-render-browser.js 2>&1 | tee -a runtime-integrity-report.txt
```

### R1

```bash
node tests/runtime/offline-sample-provenance-opt4-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-save-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/save-level-migration-regression.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/save-schema17-compatibility-matrix.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/reincarnation-transaction-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/newstate-browser-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/save-load-pipeline-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/batch20-save-guide-browser.cjs
```

### R4

```bash
node tests/runtime/alternate-universe-title-batch4-closure.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3b-formal-renderer-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/browser-smoke.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t4-preview-retirement-browser.js
node tests/equipment-formal/browser.cjs 2>&1 | tee -a runtime-integrity-report.txt
RUNTIME_SMOKE_URL=http://127.0.0.1:4173/index.html node tests/equipment-gm/browser.cjs 2>&1 | tee -a runtime-integrity-report.txt 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/3d-mode-browser-regression.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/3d-equipment-assets-browser.js 2>&1 | tee -a runtime-integrity-report.txt
BATCH28_BASE_URL=http://127.0.0.1:4173/ node tests/runtime/batch28-consolidated-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/startup-readiness-browser.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/code-cleanup-batch7-lazy-loading.js 2>&1 | tee -a runtime-integrity-report.txt
```

### runtime-node-regression

```bash
node tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/calamity-terminal-dynamic-opt-batch2.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/calamity-shared-ui-policy-opt-batch3.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/story/reincarnation-three-era-batch4-closure.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/post-reincarnation-cleanup-batch1-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/recent-optimization-batch4-closure.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/3d-glb-validation.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/code-cleanup-batch8-legacy-boundary.js 2>&1 | tee -a runtime-integrity-report.txt
```

### F1

```bash
python3 scripts/equipment-weapon-assets.py
python3 scripts/equipment-gm-publication.py --check
python3 scripts/equipment-formal-publication.py --check
python3 scripts/equipment-formal-fixture-history.py --check
node scripts/equipment-phase6-audit.cjs > /tmp/equipment-phase6-dependencies.json
node tests/equipment-formal/publication.cjs
node tests/equipment-weapons/names.cjs
node --test tests/equipment-gm/no-attack-aura.test.mjs tests/equipment-formal/runtime.test.mjs tests/equipment-gm/runtime.test.mjs tests/equipment-weapons/runtime.test.mjs
node tests/runtime/t3b-formal-owner-clock.cjs
node tests/runtime/t3b-formal-controller.cjs
node tests/equipment-weapons/timing.cjs
node tests/equipment-formal/browser.cjs
node tests/equipment-formal/failures.cjs
node tests/equipment-formal/review.cjs
```

### F3

```bash
node tests/runtime/unified-mobile-combat-viewport.cjs
node tests/equipment-gm/browser.cjs
node tests/runtime/unified-mobile-combat-viewport-browser.cjs
node tests/runtime/batch11-audio-lazy-browser.cjs
FORMAL_SPRITE_ACCEPTANCE=1 node tests/runtime/audio-lifecycle-browser.js
```

### F2

```bash
node tests/runtime/mirror-void-formal-contract.mjs
node tests/runtime/mirror-void-formal-browser.cjs
node tests/runtime/mirror-void-recovery-browser.cjs
node tests/equipment-formal/higher-dungeons.cjs
```

## 原 Runtime 快速核心（原位保留）

```bash
node tests/runtime/batch20-approved-runtime.cjs
node tests/runtime/unified-mobile-combat-viewport.cjs
node tests/runtime/pr48-stop-contract.cjs
node --test tests/runtime/pr48-sprite-warmup.test.mjs
node tests/runtime/js-integrity.js 2>&1 | tee runtime-integrity-report.txt
node tests/runtime/cleanup-batch4-4-final-guard.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/3d-formal-snapshots-contract.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/combat-events-contract.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/combat-events-integration.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/3d-shared-loader-contract.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3a-hybrid-policy.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3b-formal-bridge.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3b-formal-projection.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3b-formal-session.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3b-formal-assets.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3b-formal-renderer.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t3b-formal-controller.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/t4-preview-retirement.cjs
node tests/runtime/cleanup-batch4-3-current-inventory.cjs
node tests/runtime/t3b-formal-owner-clock.cjs 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/resource-manifest-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/save-global-writers.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/newstate-save-owner-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-runtime-early-restore-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/gm-runtime-auth-preferences-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-data-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-attempt-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-combat-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-failure-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-progression-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-ui-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-batch4-3-regression.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/alternate-universe-old-save-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
node tests/runtime/3d-equipment-contract.cjs
node tests/runtime/3d-batch28-preflight.cjs
node tests/runtime/resource-cache-integrity.js
node tests/runtime/resource-cache-behavior.js
node tests/runtime/resource-cache-prefetch-integrity.js
node tests/audio-lifecycle.test.cjs
node tests/audio-regression.test.cjs
node tests/runtime/3d-asset-registry-integrity.cjs
set -o pipefail; node tests/runtime/vip-unbounded-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
set -o pipefail; node tests/runtime/gm-mainline-hp-lock-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
set -o pipefail; node tests/runtime/asset-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
set -o pipefail; node tests/runtime/docs-integrity.js 2>&1 | tee -a runtime-integrity-report.txt
```
