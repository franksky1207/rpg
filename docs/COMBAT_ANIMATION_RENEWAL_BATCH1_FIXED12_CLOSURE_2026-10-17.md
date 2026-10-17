# 《文明戰線》新版第 1 批・固定 12 項整合驗收與封箱紀錄（2026-10-17）

## 一、修改內容
- 按使用者已核准且**不再增加項目**的 12 類檢查執行一次整合驗收。程式基準 main：`f8856eb3300833a0018f88829109fd4a9d1ed5af`。
- 新增 `scripts/batch1-fixed12-evidence.cjs`，逐項呼叫已有的正式回歸測試、以獨立程序記錄 exit code/耗時/失敗尾端記錄並輸出 JSON；新增手動觸發 Action `.github/workflows/batch1-fixed12-audit.yml`。沒有改 `combatfx.js`、任何正式戰鬥、資源、Save Schema 或玩法。
- 第 1 批稽核完成交付包含先前的架構盤點、18 項動態 CI 回歸基線、三次同事件共用動畫 Chromium CDP trace 與本次 12 類整合 gate。

## 二、程式自我檢查
- [整合 Actions #39041436301](https://github.com/franksky1207/rpg/actions/runs/39041436301) **success**，基準 SHA `aa3ab466dc8686edd8cb2937a5eb57140531d0c3`，12/12 現有回歸入口均通過。
- [JSON 證據 artifact #12103664671](https://github.com/franksky1207/rpg/actions/runs/39041436301/artifacts/12103664671)。
- 每項實際執行入口：
  1. 架構／事件：`tests/runtime/combat-events-integration.cjs` pass
  2. 生命週期：`tests/runtime/combat-events-owner-browser.js` pass
  3. 異宇宙：`tests/runtime/alternate-universe-batch4-3-regression.js` pass
  4. 幀／重排／長任務：`tests/runtime/batch1-animation-frame-trace.cjs` pass
  5. 重複播放控制：`tests/runtime/hybrid-comparison-playback-contract.cjs` pass
  6. 背景：`tests/runtime/cross-era-background-browser.js` pass
  7. Fast Catch-up：`tests/runtime/calamity-shared-terminal-fast-catchup-integrity.js` pass
  8. 離線樣本：`tests/runtime/offline-sample-provenance-opt4-integrity.js` pass
  9. 高維極簡／背景：`tests/runtime/thirdworld-background-browser.js` pass
  10. B2 素材存量：`tests/runtime/cleanup-batch4-3-current-inventory.cjs` pass
  11. 渲染器釋放契約：`tests/runtime/hybrid-comparison-renderer-contract.cjs` pass
  12. 發布資源清單：`tests/runtime/resource-manifest-integrity.js` pass
- **證據界線（重要）：** 12 項全部 pass 僅代表指定回歸入口通過，**不是**全 12 類所有真實路徑已完全量化或模擬。尤其 #3 為異宇宙契約而非完整 UI 渲染壓力；#5 為隔離播放控制壓力而非長時間真實畫面熱測；#10 為素材存量而非 G005/G007/G018 每一條 Runtime/GM 引用逐一清零；#11 為釋放契約而非長時記憶體斜率；#12 非替代所有發布 Actions。未知與未量測項目留在明確風險表，不擴大第 1 批驗收清單。
- 共用呈現器前次量測：12 個合成事件的 Chrome RAF p95 約 16.7–16.8ms、CDP Layout=31、style tree 108–110，短樣本 LongTask 0；**沒有完整正式異宇宙進出與一般模式同條件 FPS trace**。不得宣稱 iPhone 發熱已排除。

## 三、實機／GitHub Actions 驗收
- 已驗證：12 類合併 gate Actions 成功，以及前次 18 項跨模式回歸 [#39040519589](https://github.com/franksky1207/rpg/actions/runs/39040519589) 成功、共用動畫 trace [#39041058229](https://github.com/franksky1207/rpg/actions/runs/39041058229) 成功。
- GitHub Actions runner 的 Chromium/headless 是程式層測試，不是手機；**依使用者明確決定，iPhone 真機驗證延期至六批完成後**。
- 本次報告及手動 workflow 變更會產生另外的 SHA，需獨立確認正式 main 必要 Actions，不能將前述測試成功視為新 SHA 全綠。

## 四、封箱決定與第 2～5 批施工對照
**第 1 批固定 12 項的「靜態盤點／現有回歸／隔離 CI 動態 baseline」執行已完成；有證據的 12/12 驗收入口均成功。** 但本文件不宣稱異宇宙完整真實頁面與主線的同事件比較、極長時間 DOM leak／GPU 或 G005/G007/G018 的逐檔刪除安全審核已量化，亦不宣稱真機問題已解決。未取得的驗收資料將作為後續施工的風險與目標，不再無限增加第 1 批事項。

| 後續批次 | 使用第 1 批證據確立的工作 |
|---|---|
| 第 2 批 | 共用戰鬥生命週期、背景/離線、Fast Catch-up、GM 倍速、重入及資源釋放；以已通過的 #2/#6/#7/#8/#9/#11 作回歸 |
| 第 3 批 | 同等輸入比對正式主線／異宇宙整條動畫流程，處理 `combatfx.js` 的同步 layout 和額外 DOM/浮字/MutationObserver 成本；以 #4 的 RAF/CDP baseline 作回歸，不改戰鬥數值 |
| 第 4 批 | 動畫與 GM UI/資源引用整理，G005/G007/G018 每個檔案是否可清理要有 runtime/GM/發布引用證據 |
| 第 5 批 | 三紀元各一套新造型僅訂技術接口、裝備紀元與轉生顯示契約；不製作美術 |
| 第 6 批 | 全部正式 Modes、Assets、Pages、Actions 整合發布與封箱；六批後另做 iPhone 真機測試 |

正式 Runtime 零修改。第 1 批固定稽核範圍不再增列第 13 項。  
