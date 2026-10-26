# PR #112 後兩批維護｜第一批查核紀錄（2026-10-26）

## 狀態與邊界
- 基準 main：`c9367c2e101cfa1874ac740d0317db79f87245e6`；分支 `integrate/post112-maintenance-two-batches-20261026`。
- 第一批涵蓋原編號 1、2、3、4、5、8、11、12、13、14、15；第二批涵蓋 6、7、9、10。
- 兩批共用一個整合分支；第二批完成後再統一 PR／驗收／合併／發布。任何階段均不得直接改 main。
- 正式戰鬥停止語意、收益、存檔、GM 六動作、CSS 顯示、歷史精確批准與必要 CI gate 均不得為清理而改壞。

## 已確認事實
1. `scripts/ci-suites.json` 目前 19 組、156 個指令；`scripts/ci-command-map.json` 恰有 156 筆，逐筆（含重複次數）相符。原有 `tests/ci-suites.test.cjs` 已逐筆檢查映射，故不另外新增重複的稽核入口；保留 156 條指令及必要 CI Gate。
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

## 第一批修改與處置
- 修改 `scripts/ci-run-suite.cjs`：失敗時仍保持 fail-fast，但先保存最終失敗報告與 GitHub Step Summary，包含 PASS/FAIL 與退出碼；原 156 條測試指令、執行順序、失敗退出碼和 CI Gate 不變。
- 新增 `tests/ci-suite-report.test.cjs`：以隔離的 runner 模擬驗證成功與失敗報告，不呼叫實際瀏覽器；正式 Node 測試尚待驗收。
- 修正 `PROJECT_PENDING_STATUS.md` 對 PR #108 的過期待辦紀錄。
- 項目 2、3、5、11、12、15 涉及已批准停止控制、正式 CSS 與歷史來源鎖；目前效益未有足夠證據，保留現況、不做冒險重構。
- 項目 4、8 為批次名稱相似的測試；並未證實斷言及使用情境完全重疊，不移除或重新命名。
- 項目 13 維持獨立 runner，不改 GM 5 個測試入口；CI suite summary 輸出與 GM 一樣可辨識成功與失敗。
- 項目 14 已修正一處過時 pending 標記，其他文件未發現須為第一批改動的可靠理由。

## 驗收界線
- 已靜態核對來源修改與分支提交；未執行 Node、Chromium、Runtime Integrity 等正式測試，不宣稱 CI 綠燈。
- 第二批繼續在同分支進行資源與 101 個下載項目的完整引用盤點；兩批完成後才統一 PR、必要 CI、合併與 Pages 發布。
