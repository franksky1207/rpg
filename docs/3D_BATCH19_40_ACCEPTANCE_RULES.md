# 《文明戰線》正式 3D 第 19～40 批共用施工與驗收規範

日期：2026-10-10。唯一真實來源：GitHub `franksky1207/rpg` 的 `main`。

## 施工前
1. 逐次回讀 `main` 的當批範圍、正式 owner、Canvas/Runtime/場景、GM 預覽、既有測試與快取引用；不要只依賴交接文件。
2. 文字模式、正式遊戲數值、存檔 schema、GM 授權及雲端交易仍由既有 owner 維護。未通過第 40 批最終 gate，不得啟用正式完整 3D 模式。
3. 確認該批是否新增真正獨立的可觀察視覺；只在必要時擴充 GM 3D 測試中心，避免新增工程診斷選單、重複場景或開發代碼。
4. 對新增場景定義唯讀快照 schema，正式介面與 GM 測試中心共用同一場景工廠；GM 自訂 fixture 不得寫回正式資料。

## 程式修改
5. 所有正式路由與子視圖要保留空／未解鎖／完成、回顧、戰鬥、結果與 modal 狀態，不能用簡單 DOM 存在判斷取代正式 owner 規則。
6. 3D 預覽按鈕及 Canvas 應具唯一掛載、切頁及同路由重繪清理、載入中的 ticket/epoch 防過期、WebGL/context fallback、重試及 GPU/事件釋放。
7. 使用 `resource-manifest.json` 的部署版本識別改動過的 3D 資源；修改 JS/CSS 同步更新 `index.html` 或 `3d-test/index.html` 的必要 cache-bust；不要為未驗證的資源直接清除本機快取／玩家存檔。
8. 文字模式按需載入 3D，開發期 3D 預覽可選擇開啟，GM 中心永久保留；不要把測試中的 Canvas 或狀態持續掛在首頁。

## 每批自我檢查與驗收
9. 先做 JavaScript 語法、舊引用與版本 URL、資源清單、存檔 owner、GM 授權等靜態檢查，並確認 GitHub main 回讀與 Commit。
10. GitHub Runtime Integrity 應執行 `tests/runtime/3d-b18-coverage-guard.js`、`tests/runtime/gm-3d-test-center-browser.js`、`tests/runtime/3d-mode-browser-regression.js`。視覺案例數變動時，更新對應案例數與測試。
11. 每批有實際視覺變更時，在桌機及手機尺寸下實測首次進入、關閉重開、跨頁、快速連點、縮放還原、登入及登出；適用時測 WebGL 故障回退、連續場次、轉生/紀元切換與長時間釋放。
12. **不以靜態檢查替代實機**：把已執行的測試、GitHub Actions exact-HEAD 狀態，以及待使用者真實帳號/裝置驗收事項分開回報，不能在缺少證據時宣稱全綠。
13. 修改後更新 `3D_IMPLEMENTATION_PLAN.md` 與 `PROJECT_HANDOFF.md`；如本批涉及 GM 視覺分類，更新 `3D_GM_TEST_CENTER_CATALOG.md`。如使用者說「先討論」則不修改，說「修改／執行」才可直接推 main。

## A1／整合優化驗收邊界
- 第 01～18 批及額外整合優化第 1～6 批的**施工完成**不等於全桌機/手機場景已實測，也不等於完整版 3D 上線。
- 第 19～40 批的正式施工可使用以上共同規範，但不能因為 CI 一次通過就略過相關新場景的實際操作驗收。
