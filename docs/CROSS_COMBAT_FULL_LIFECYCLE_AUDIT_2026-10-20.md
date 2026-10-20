# 全戰鬥生命週期交叉檢查（2026-10-20）

基準：main `f22ac17d6ebf9922508686cbc9b31ce99e1da257`。已獲玩家正式版驗證：PR #51 懸賞/競技 → 文明災厄故障解除。PR #52 共用 Runtime 異常狀態保護已合併。本報告是後續交叉檢查，不代表完成真機全模式矩陣。

## 程式查核
- 銀河主線：`battlepipeline.js` 在釋放 `battleBusy` 與 `activeMainBattleContext`、render 後仍使用 `setTimeout(...,0)` 延後顯示舊結算。此時下個戰鬥已可能開始，舊回呼不應越權改畫面。**本 PR 修復**：延後回呼在任何新 `battleBusy` 或銀河/宇宙正式主線 context 占用時捨棄舊結算的 UI 回呼；不改既有戰鬥結果、獎勵或 save。
- 宇宙主線：`worldphase.js` 已將 `activeSecondWorldMainlineContext` 納入共用阻擋。仍需完整的跨模式 Live UI 實戰。
- 高維：`thirdworldrun.js` 使用 `runSerial` 和 `clearRuntime` 在停止或錯誤時隔離舊連戰；需要瀏覽器停止/轉場驗證。
- 異宇宙：`alternateuniversecombat.js` 有 formal attempt 驗證；不等同已確認所有 UI 入口皆納入共用 Runtime 互斥。
- 懸賞、競技、文明災厄、虛空、鏡像：既有 `worldtransitionsafety.js` active 判斷與 `backgroundprogress.js` 共用衝突判斷已納入 PR #51/#52 行為回歸；現有 `pr48-mode-matrix-browser.cjs` 包含正式手機尺寸停止按鈕但**非跨模式切換**。

## 本 PR 可驗證項目
`tests/runtime/cross-mode-late-settlement-regression.cjs` 實際執行由正式 source 擷取的 0ms 結算回呼，檢查無新 owner 時正常執行、有忙碌主戰鬥或銀河/宇宙新 context 時不執行。接入 Batch 6 CI。

## 嚴格未完成項目
- 真瀏覽器依序 A 結算→B 開始：銀河/宇宙/高維/異宇宙主線與懸賞/競技/災厄/鏡像/虛空/背景，各合法組合及停止、敗北、錯誤、重新進入。
- 確認跨模式非同步舊回呼在高維/異宇宙/宇宙主線的實際隔離。
- CI 全綠、合併 main 後 Runtime、正式戰鬥、Pages、快取版本核對與 iPhone 真機測試。

**結論：不得將這份稽核視為全戰鬥驗收封箱；若 CI 失敗應先修。**
