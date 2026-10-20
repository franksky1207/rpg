# 跨戰鬥模式殘留連戰旗標阻擋文明災厄（2026-10-20）

## 基準與問題
基準 main `d9b278ab0b5bccc0c1ed9c3f2a17ef986b261713`。玩家於銀元（正式程式第二紀元：宇宙）測試：懸賞或競技場連戰後，切換文明災厄時 UI 顯示「目前無法開始文明災厄挑戰。」；重新啟動可恢復。

## 已由正式程式驗證的根因路徑
1. `calamityui.js` 的 `runSingleUi` 收到 `runCivilizationCalamitySingle` 失敗後，以統一訊息顯示；原始 reason 並未傳達給 UI。
2. `calamityrun.js` 的 `begin` 透過 `runtimeConflictStatus()` 與 `continuousRunConflictStatus()` 執行互斥。
3. `backgroundprogress.js` 的共用檢查讀取 `worldTransitionRuntimeStatus()`。
4. `worldtransitionsafety.js` 原本把 `bounty?.continuous===true` 和 `arena?.continuous===true` **不論 phase 一律列為 active**；懸賞與競技結算頁保留 continuous 供結果畫面使用，導致離開結算頁仍被阻擋。
5. 重啟會重設這些 JS 記憶體中的臨時 UI 狀態，因此符合「重啟後恢復」症狀。此推論已由程式路徑支持，仍須正式瀏覽器重現確認同一玩家路徑。

## 修正
只將**實際仍在該模式的操作畫面**或 **combat / transition** 判為阻擋；不再以舊 continuous 或離場後 ready 單獨判斷。所有其他 blocker、例外 fail-closed、世界與模式解鎖、獎勵及結算均保留。

## 驗證與未完成
`tests/runtime/cross-combat-stale-continuous-regression.cjs` 提供 vm 執行正式 `worldtransitionsafety.js` 的行為測試，涵蓋停止/自然完成、active combat、跨模式、其他 blocker 與例外。已接入 Batch 6 workflow。GitHub PR #51 正式 Actions、三紀元完整 Playwright 跨模式矩陣、Cache/Manifest、合併後 main 與 Pages、iPhone 真機均**尚未完成**；不可將 queued/pending/in_progress 視為成功，也不可先合併。
