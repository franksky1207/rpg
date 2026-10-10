## 2026-10-10｜3D 五批一致性補修第 3 批・副本與戰鬥資料（施工紀錄）

- **沿用第 2 批概念**：GM 預覽以看圖為主。原 31 案例與八分類維持不變；副本中心、懸賞、競技場、鏡像、虛空五個 GM 視覺場景納入「同步正式資料／自由測試設定」。從正式遊戲 GM iframe 開啟預設同步；未拿到正式唯讀快照不得用 GM 模擬資料冒充同步成功。自由模式仍使用既有「類型、階級/難度、定相/異相/三戰、勝場、樓層」等與畫面身份直接有關的選項，**不增加 HP、倍率、獎勵等數值測試操作**。
- **唯讀正式資料**：在 `gm3dprototype.js` 原有同源／iframe source／GM 授權 gate 下回傳正式 `getArenaCoreState`、`getBountyTestSnapshot`、`mirrorDungeonStatus`、`getVoidMirageProgressSnapshot/getVoidMirageRunSnapshot` 與 `dungeonModeAvailability` 的摘要。高維正式角色不能以宇宙懸賞冒充可用；懸賞的高維下拉選項仍完全移除。原正式數值、戰鬥與存檔 schema 未修改。
- **正式 3D 補修**：`3d-test/formal-home.js` 的高維競技場 advanced 快照補入 `higherArenaMode`（從 runtime round/selectedMode 讀取，無來源時 fallback fixed）；沒有戰鬥／結算／特殊遭遇畫面時，戰鬥快照回傳 `battleAvailable:false`、`battleVisualKind:unavailable`，不再憑空展示「滿 HP 正常戰鬥」。既有戰鬥 HP 等其他頁面元素仍屬過渡 DOM 推斷，**不是已完成正式戰鬥 owner 的完整 read-only schema**。
- **自我檢查與後續**：`tests/runtime/gm-3d-test-center-browser.js` 新增五個副本模式來源切換相關斷言，相關入口 JS 快取版本同步更新；未執行真實 Chromium、正式授權 iframe 及手機 WebGL，不能宣稱通過完整第 3 批實機 gate。後續仍須逐種模式比對正式狀態與戰鬥 owner HUD/護盾/結算可靠快照；特別是高維定相/異相模式欄位應以真實 runtime 證據驗收，未知資料不能猜。

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

## 五批一致性補修與 GM 八類驗收（2026-10-10 起生效）

- 現行 GM 8 類、31 唯一場景；修改分類同時更新 `tests/runtime/gm-3d-test-center-browser.js`，保持搜尋、手機觸控/最大化還原和獨立 fixture。
- 以 `docs/3D_PREVIEW_CONSISTENCY_MATRIX.md` 作正式與 GM 雙向契約：每個場景確認對應原始文字 owner、可用紀元、選取/未解鎖/完成/回顧/特殊狀態，不得用一個通用「十大區」推算不同副本。
- 不存在的選項（特別是高維懸賞）須在對應預覽的 DOM `select` **完全不出現**，非僅 disabled；切換其他紀元/場景後不殘留限縮。
- 每批完成必須回報：真實 GitHub main Commit、JS/CSS/index cache-bust、已跑與未跑測試、對照矩陣已核對/待修事項、玩家可實測操作步驟，以及仍未完成的實機/CI 項目。
- 五批是 40 批之外的資料一致性補修，完成後接原正式第 24 批。第 1 批目錄與規格，第 2 批災厄/地圖/回顧，第 3 批副本/戰鬥，第 4 批外觀/養成/其他，第 5 批完整回歸。

## 補修第 2 批：同步正式／自由模擬雙模式驗收

適用 GM 預覽：銀河星圖、宇宙星圖、高維戰線、銀河災厄、宇宙災厄、異宇宙前線。正式資料從原遊戲已授權 GM iframe 同源訊息回傳；僅傳唯讀精簡快照，禁止將自訂 fixture 寫回 save。GM 嵌入頁預設同步正式資料；獨立開啟無正式資料時預設自由測試。未收到正式快照不得以模擬數據冒充。

- 災厄各十隻分別控制：銀河依印記等級，宇宙依文明解鎖雙條件及文明進度；模擬狀態與 HP% 必須不互相覆蓋，整體情境不影響正式資料。
- 異宇宙模擬可挑戰、挑戰中、失敗鎖定、已通關；正式仍由 200 宇宙×5 深度、20 文化以及正式 active/failure/progress owner 決定。
- 宇宙正式 3D 焦點讀取 worldmapui.js 已展開區域（唯讀 getter）；僅無用戶選擇時退回最高解鎖 Boss 所在區。
- 手機／桌機測雙模式切換、重新同步、關閉重開、十災厄逐隻和預設情境切換、切紀元及最大化還原、WebGL 故障回退。
- 瀏覽器測試原始碼增加斷言不等於通過；只有實際 Chromium/授權 GM 整合與 CI 執行成功才可標記通過。修改 JavaScript/CSS 需更新入口快取；GitHub Actions 會依逐檔 SHA-256 自動更新 resource-manifest.json，不可手寫錯誤雜湊來強制重載。
