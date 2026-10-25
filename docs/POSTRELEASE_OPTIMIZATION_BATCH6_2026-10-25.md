# 《文明戰線》全面優化第 6 批｜工程、CI 與發布準備

> 2026-10-25，僅整合分支施工。正式 main 尚未改動；本檔不是正式 Pages 驗收通過證明。

## 核心決策

- 正式來源與使用者看到的穩定版仍是 `main`；全面優化第 2～6 批保存在 `integrate/postrelease-optimization-20261025`，先經最終 PR／集中驗收才合併／發布。
- 正式 `.github/workflows/publish-optimized-pages.yml` 仍於 main push 執行正式候選建置、資產完整性、瀏覽器 smoke 與 Pages 部署，**不得繞過這道安全門檻**。
- `publish-release-gate.yml` 已改為 **僅 workflow_dispatch** 的孤立診斷工具。以前它在 main push 同時重跑幾乎相同的發布與瀏覽器測試，現不再自動重複消耗 Actions。
- 歷史 `gm-animation-center-terminology.yml` 已移除對已結束修復分支的 push 監控，保留 PR 差異檢查。
- 既有 PR workflow 沿用 per-PR concurrency 與舊提交取消；沒有 PR 事件的檢查則採工作流程／ref 序列化且 `cancel-in-progress: false`，不能取消正式保護。正式 Pages 發布同樣維持串行不取消。
- 沒有經過部署候選的實際引用／Manifest／Service Worker 全量確認，不刪任何現役 Pages、GM B renderer、怪物圖鑑或正式音訊。第 4 批的來源清理不等於下載量下降。

## 三級測試原則

1. **快速開發自檢**：`node scripts/ci-impact.cjs --self-test`、`node scripts/check-workflow-concurrency.cjs`、`node tests/runtime/html-cache-version-guard.js --self-test`；依變更補 JS、文件或資產檢查。
2. **受影響模組回歸**：Functional CI 依 `scripts/ci-impact.cjs` 分為 combat／monster／gm／equipment／background／resource；現役 GM／裝備／Story／Runtime 必須保留有效回歸。
3. **正式集中驗收**：候選發佈的 `publish-asset-audit.cjs`、`publish-build-regression.cjs`、`build-publish-dry-run.cjs`、資源快取、音訊、正式戰鬥與 GM 測試、完整瀏覽器 smoke；最後合併 main 後由正式 Pages workflow 發布。

不得把 workflow 靜態存在性檢查稱為本機完整測試通過；亦不得用 Chromium 代表 iPhone Safari 真機。

## 最終發布流程（尚未執行）

1. 檢查最新 main 與整合分支的 head SHA；確認第 2～6 批、Schema18、遷移、GM 沙盒、動態資產／音效與快取一致。
2. 建立 **單一整合 PR** 到 main；先以變更分類跑必要 PR 檢查。必要時僅重跑失敗的 job，避免無意義的重複 Actions。
3. 對準備合併的 **同一最終 head SHA** 執行必要的 Runtime、Story、正式存檔、GM、圖鑑、資產、快取及瀏覽器／發布預驗收。成功證據須能對上 SHA；不能把前批別的 SHA 成績當正式成功。
4. 全部必要檢查通過且沒有明確阻擋後合併 main。確認正式 `publish-optimized-pages.yml` 在新 main SHA 成功並驗證 Pages 版本一致。
5. Pages 出問題時停止追加變更，先記錄失敗 SHA、日誌、問題功能與部署 run；依實際失敗範圍選擇 revert 本次合併或修復後新提交，避免回滾玩家存檔 Schema 或進行不相容降版。
6. 正式上線後由使用者自行回報 iPhone Safari 真機問題（真機不是第 6 批施工的硬性門檻）。

## 未覆蓋與風險

- 本批不直接執行 GitHub Actions／Pages、也未建立 PR 或合併 main。
- GitHub connector 的靜態檔案分析不能等同 `npm`／Playwright 完整運行；若無可執行 CI 環境，完整測試列在最終整合階段。
- 正式發布體積未重新量測，因此不宣稱玩家下載量下降。
- 不任意移除非正式路徑名但實際仍使用的 `3d-test`、`assets/3d`、GM B 及裝備素材閉包。
