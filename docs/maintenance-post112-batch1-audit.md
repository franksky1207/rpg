# PR #112 後兩批維護｜第一批查核紀錄（2026-10-26）

## 狀態與邊界
- 基準 main：`c9367c2e101cfa1874ac740d0317db79f87245e6`；分支 `integrate/post112-maintenance-two-batches-20261026`。
- 第一批涵蓋原編號 1、2、3、4、5、8、11、12、13、14、15；第二批涵蓋 6、7、9、10。
- 兩批共用一個整合分支；第二批完成後再統一 PR／驗收／合併／發布。任何階段均不得直接改 main。
- 正式戰鬥停止語意、收益、存檔、GM 六動作、CSS 顯示、歷史精確批准與必要 CI gate 均不得為清理而改壞。

## 已確認事實
1. `scripts/ci-suites.json` 目前 19 組、156 個指令；`scripts/ci-command-map.json` 恰有 156 筆，逐筆（含重複次數）相符。新增 `scripts/audit-ci-suite-map.cjs` 可於後續驗收中檢查差異；暫不接 CI gate，不新增 Actions。
2. `mainminimalmode.js` 的 `syncFormalContinuousStopControls()` 於每個 pending slot 都重新查詢所有停止按鈕。屬可優化的局部 DOM 路徑，**但受到 PR #112 的精確保護**；應與相關批准來源、實際九模式測試及 HTML cache-bust 同時變更，不宜孤立修改。
3. 歷史鎖確實以精確來源與批准投影保障戰鬥、GM、CSS。不得單純刪除或放寬；來源鎖整理須先逐條對照失效測試與新現役 owner。
4. Chromium 驗收包含不同歷史批次與 viewport。僅名稱相似不足以判定重複；需要以實際斷言、瀏覽器場景與覆蓋矩陣才可合併。
5. PR #112 使用 owner 狀態與 MutationObserver 同步停止控制，需確認是否存在重複同步後才決定修改；未發現可據此直接刪掉的模式。
8. 舊 batch 名稱表示歷史，不代表測試退役；保留檔案並以功能覆蓋矩陣作治理。
11. GM CSS 在歷史批准保護下，只有計算後樣式與實際尺寸驗證能證明某條可刪；不可依選擇器重複推斷。
12. 極簡與停止控制同在 `mainminimalmode.js`；完整拆模組涉及載入先後和現有歷史投影，尚無證據值得冒風險重構。
13. `scripts/ci-run-suite.cjs` 與 `tests/runtime/gm-functional-suite.cjs` 都輸出秒數與 summary，但執行語意不同；可先統一報告欄位，不宜強行共用 runner。
14. `PROJECT_PENDING_STATUS.md` 仍含先前文件清理分支「尚未完成」文字，與已合併的 PR #108 時序不一致；須在發布前以最新 main 和實際 PR 狀態修訂。
15. CSS 舊選擇器僅在有真實引用與 computed style／三尺寸驗收證據時才清理。

## 第一批目前變更
- 僅新增不會影響 runtime、部署或既有 CI gate 的一致性稽核工具。
- 仍未完成全專案實際瀏覽器／CI 測試，其他候選項目不得宣稱已優化或已刪除。
- 下一步：在此分支完成剩餘有證據支持的變更與局部測試；第二批再繼續資源檢查，最後統一開 PR 驗收。
