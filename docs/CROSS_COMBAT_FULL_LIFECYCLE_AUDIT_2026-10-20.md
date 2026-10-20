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

## 2026-10-20 最終狀況更新（僅紀錄，不更動遊戲程式）

最新核對正式 `main`：`a3133bb5ba78ca3941bddacb56c450a7ac909de1`。PR #51～#55 的已知修復已合併；玩家已親測懸賞／競技連戰之後可直接進入文明災厄。

### 正式版 Actions
該 SHA 的 8 個工作流程均為 `completed/success`：Runtime Integrity、Batch 6 Final 16 Integration、Equipment 2.5D Formal Battle、Equipment 2.5D GM Integration、Batch 7 Candidate Safety and Appearance、Batch 12 Material Selected Attack Acceptance、Batch 2-4 Integration and Regression、Publish Optimized GitHub Pages。

### 第一階段稽核結果與證據界線
- 已檢視 `worldtransitionsafety.js`、`backgroundprogress.js` 的共用互斥／fail-closed 回歸路徑及 `battlepipeline.js` 延遲結算回呼修正。
- `tests/runtime/cross-combat-stale-continuous-regression.cjs`、`unified-combat-runtime-contract.cjs`、`cross-mode-late-settlement-regression.cjs` 經 Batch6 工作流執行；相關失敗未見於正式版上述成功工作流程。
- `tests/runtime/pr48-mode-matrix-browser.cjs` 是多紀元／多模式的停止按鈕與版面驗證；`cross-era-background-browser.js`、`thirdworld-background-browser.js` 有真瀏覽器背景戰鬥驗證，但**不能把這些視為全部模式 A→B 連續實際切換**。
- `alternate-universe-combat-integrity.js` 等異宇宙檢查主要是契約／狀態驗證，也**不是全路徑異宇宙→其他模式 UI 切換**。
- 在現有證據可支持的驗收範圍內沒有發現需要再修改正式遊戲的錯誤；因此本次不做遊戲程式修改，也不新增不必要 PR。

### 第二階段結論
**既有回歸／正式版 CI／Pages：通過，狀況已更新；全合法模式兩兩切換矩陣：未完整執行，不宣告完全封箱。** 仍待執行項目含高維與異宇宙跨模式 UI、A 結束／停止／敗北→B 啟動、極簡／背景／離線與舊非同步回呼隔離，以及真機 iPhone 驗收。本輪僅狀況紀錄，未對遊戲功能進行施工。
