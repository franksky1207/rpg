# 《文明戰線》新版第 2 批・剩餘 13 類整合驗收紀錄（2026-10-17）

## 施工與變更
正式背景等待修正已經 PR #20 合併；PR #21 同步 `index.html` 快取鍵；PR #22 與 #23 讓歷史清理 guard 僅容許精確且已授權的快取鍵變更，不取消歷史正式程式保護。

本次整合分支 `audit/batch2-final13-20261017` 新增 `scripts/batch2-final13-evidence.cjs` 和手動觸發的 `.github/workflows/batch2-final13-integration.yml`，並將 `tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js` 仍指向 2026-10-13 舊版背景腳本 URL 的斷言更新為已正式發佈的 `20261017-batch2-lifecycle-sleeper1`。這是測試版本依賴修復，不是更動災厄或 Fast Catch-up 計算規則。

## 程式自我檢查與整合結果
- 第一輪 [run 39043305748](https://github.com/franksky1207/rpg/actions/runs/39043305748)：11/13，失敗兩類。
- 第二輪 [run 39043511001](https://github.com/franksky1207/rpg/actions/runs/39043511001)：確認 #04 Fast Catch-up 的根因為 `Cache-bust missing: backgroundprogress.js?v=20261013-background-hud-recovery1`；#12 是其內嵌固定 12 類回歸包含相同舊快取斷言，故同源連鎖失敗。
- 更新原測試版本斷言後，[run 39043757249](https://github.com/franksky1207/rpg/actions/runs/39043757249) **success：13/13 全部通過**。正式執行的是真實 GitHub Actions Node 24 + Playwright Chromium + 本地 HTTP 服務。
- [原始 JSON 測試證據](https://github.com/franksky1207/rpg/actions/runs/39043757249/artifacts/12104104716)。

| 固定驗收項目 | 既有回歸入口 | 結果 |
|---|---|---|
| 01 生命週期 | batch2-background-sleeper-lifecycle.cjs | pass |
| 02 異宇宙 owner | alternate-universe-batch4-3-regression.js | pass |
| 03 背景跨紀元 | cross-era-background-browser.js | pass |
| 04 Fast Catch-up | calamity-shared-terminal-fast-catchup-integrity.js | pass |
| 05 離線交接 | offline-sample-provenance-opt4-integrity.js | pass |
| 06 visibility/page lifecycle | thirdworld-background-browser.js | pass |
| 07 極簡／回顧 | galaxy-review-combat-browser.js | pass |
| 08 GM 授權／隔離 | gm-alternate-universe-management-batch7-3-integrity.js | pass |
| 09 監聽／事件 owner | combat-events-owner-browser.js | pass |
| 10 呈現 owner | combat-events-integration.cjs | pass |
| 11 重複播放／資源契約 | hybrid-comparison-playback-contract.cjs | pass |
| 12 既定廣域回歸 | scripts/batch1-fixed12-evidence.cjs | pass |
| 13 發布資源 | resource-manifest-integrity.js | pass |

## 驗收界線
這 13 項「指定回歸入口」通過，不等於每種正式模式與每種極簡/背景/離線排列的全組合實測，也不等於所有長時間 Memory/DOM 斜率均已量化。沒有證據的問題不能宣稱已修好。**第 2 批既定施工重點是生命週期、背景等待、結算保護、已有功能回歸；第 3 批才負責同事件動畫幀、layout、浮字與異宇宙畫面效能。** 六批完工後另行 iPhone 真機驗證。

本次 GitHub PR 只納入測試、CI 與報告；不變更正式戰鬥與背景 runtime，不改 HP/盾、經驗、掉落、存檔 Schema、GM 倍速或美術。是否可做第 2 批正式最終封箱，仍取決於此 PR 合併後同 SHA 的 Runtime、Formal Battle、GM Integration、Batch 2-4 Regression 與 Pages Actions 最終狀態。
