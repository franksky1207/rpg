## 2026-10-10｜五批一致性補修：第 5 批總回歸與舊快取整理

**狀態：程式施工與遠端 main 靜態自我檢查完成；Chromium／真實授權 GM iframe／手機 WebGL／Pages 最新部署仍需實機確認，不能標為完整實測通過。**

- **整體**：沿用補修第 2 批的「同步正式資料／自由測試設定」隔離。只在地圖、災厄、異宇宙、五副本、四戰鬥、七個角色／裝備／養成可觀察場景提供有意義的切換。紀錄與管理維持純唯讀幾何展示。原 GM 八分類、31 項唯一視覺場景不變；禁止 GM 自由測試參數寫回正式 state、存檔或改變戰鬥／轉生／權限。
- **正式角色外觀**：原遊戲按需載入 `Civilization3DAppearance.capture()`，經已授權同源 iframe 回傳；不存在來源或資料不完整時顯示錯誤，不以 free fixture 冒充正式資料。正式裝備五槽顯示實穿名稱，允許混穿不同紀元及空槽。
- **裝備名錄回歸**：銀河 10 × 10 小區域 × 5 名、宇宙 10 × 10 Boss × 5 名、高維 10 階 × 5 名，完整 210 套／1,050 個名稱位置，來自既有 `WORLD_REGIONS/MAPS`、`SECOND_WORLD_REGIONS/secondWorldBoss`、`THIRD_WORLD_EQUIPMENT_NAME_ROWS`。新增 `tests/runtime/3d-b18-coverage-guard.js` 靜態 100/100/10 命名回歸守門；`tests/runtime/gm-3d-test-center-browser.js` 新增受控 postMessage 假快照的三紀元分層選單、來源切換、錯誤回覆與不寫 storage 斷言。**受控假快照測試不等於正式 iframe 已通過實測**。
- **使用者可見 GM 控制**：災厄自由設定僅「第 N 隻＋模擬狀況」，前 N−1 隻自動完成、後面未解鎖；角色和五槽裝備選紀元／大區／小區或 Boss（高維十階）並顯示五件名稱；鍛造與四養成以少量三階外觀選項為主；五副本及四戰鬥視覺只調整有意義的場景條件，正式 HP／盾優先讀 `getCombatPresentationSnapshot()`。各正式場景仍依原 owner 狀態，不得把自由模式的推算當作正式通關。
- **舊快取整理**：僅合併 `index.html` 的 `gm3dprototype.js`、`3d-test/formal-home.js` 與 `3d-test/index.html` 的 `test-center.js/.css` 長年疊加的舊查詢參數，改為單一 `v=20261010-repair5-final`；內容指紋仍須由既有 `resource-manifest.json` 產生流程管理。未清除任何玩家舊存檔、裝備或紀元進度，也不變更戰鬥、計算公式與正式遊戲 schema。
- **待驗重點**：需實際執行兩個 runtime 測試與 31 場景，確認真實授權 GM iframe 中的正式快照不再等待、高維全破角色 W1/W2 回顧焦點、三紀元 210 套裝名稱、異宇宙中斷、W3 懸賞排除、正式戰鬥盾／HP、手機最大化／還原、WebGL context loss 與新資源版本載入。特殊遭遇和正式結算 owner 尚未完整涵蓋，不應宣稱完成全部正式結果快照。
- 原訂第 24 批之前的五批一致性補修已完成**程式施工**，但正式恢復第 24 批前應先把以上實機 gate 核對；未取得通過證據不可標註正式封版。

## 2026-10-10｜3D 一致性補修第 4 批：角色、五槽裝備、養成、紀錄與設定

- 繼續採用第 2 批原則：「同步正式資料／自由測試設定」只用於有真實資料來源且可辨識外觀差異的場景，GM 以看 3D 圖為主，不是完整數值測試工具。
- 原本七項角色／裝備／養成場景的正式角色快照仍由 `3d-test/appearance-snapshot.js` 經已授權 GM 同源 iframe 提供；其五槽 `world/quality/visualKey/level/present`、五件強化、八專精、十印記、文明／界弦等級來源不應改寫。正式數值以真實資料為準。
- GM 自由測試：角色／五槽／強化沿用必要的世界、品質、穿戴與強化視覺控制；**八專精、十印記、文明等級、界弦核心**四項改為單一「初始／成長中／已滿級」視覺階段，移除 8+10 個別數值微調欄位，保留不同場景各自的階段記憶；自由設定僅在本次 iframe 預覽有效，絕不可同步寫入正式資料。對應瀏覽器測試更新至三階選取。
- `3d-test/prototype-engine.js` 五槽裝備場景的唯讀 metadata 增加各槽 `present/world/quality/visualKey`，鍛造場景 metadata 增加五槽強化等級／cap，專精與印記 metadata 保留各等級；**目前仍是程式式幾何佔位模型**，真實裝備 visualKey 的模型/貼圖映射尚未完成，不能宣稱已做出不同名稱裝備的正式高階模型。等到原正式第 27～34 批處理精緻外觀時必須沿用這些 owner 欄位。
- 戰線紀錄、劇情、轉生、設定、說明、帳號、雲端、GM 控制台：現有八項 GM 測試僅為唯讀幾何視覺，不是可操作的正式介面。它們本身不需要模擬登入／雲端衝突／實際轉生或再新增冗餘的同步/自由切換；正式 UI 負責操作、權限與確認。此批不更動正式文字戰鬥、轉生條件、帳號、雲端或存檔。
- 本批完成 GitHub `main` 程式提交與 JS 語法/靜態檢查、快取版本更新及 GM 測試斷言改寫；**尚未實跑 exact-HEAD Chromium、手機、授權 GM iframe 與 WebGL 實機驗收**。不應將「程式施工完成」寫成「已驗收通過」。

## 2026-10-10｜補修第 3 批加強：正式戰鬥呈現 owner 接入（本輪最新）

- 不沿用過去從 DOM 寬度猜 HP/護盾的 3D 正式預覽：現在 `3d-test/formal-home.js` 優先讀取 `combatfx.js` 的 `getCombatPresentationSnapshot()`（active 時包含玩家／敵人 HP、maxHP、護盾），無進行中快照時不建立虛構的戰鬥場景。**注意**：這個 owner 提供進行中的戰鬥呈現資料，並不等於所有副本結果／特殊遭遇都已有完整正式結算 schema。
- GM 四個戰鬥視覺預覽（戰場／護盾／特殊遭遇／結算）沿用第 2 批「同步正式／自由測試」資料來源。正式模式只用原本 GM 同源授權 iframe 回傳的活躍戰鬥快照，若缺快照只提示、不得把自由測試的預設戰鬥值當成同步；自由模式繼續以選擇四個場景作為視覺切換，**不新增 HP 等細節調整**。
- 五副本正式資料取 `dungeonModeAvailability()` 統一政策決定可見及可用性，**W3 懸賞戰不可用且不以 W2 快照頂替**。高維競技場優先讀正式 runtime 的 `mode`（定相／異相）、stage；GM 自由模式仍可直接看兩類三戰。歷史最高鏡像勝數、虛空樓層及競技場/懸賞基本狀態以各自 owner 同步。
- 本輪已更新 JavaScript、GM 瀏覽器測試源碼、相關 HTML 快取參數及交接矩陣。**自我檢查僅是最新 main 的 JS 靜態語法、引用與程式碼審查；尚未實際執行 Chromium/授權 GM iframe/手機/長期 GPU 或 exact-HEAD Actions**。剩餘事項：逐項驗證各戰鬥模式的 owner 是否會保留結果/特殊遭遇快照，補上必要的 result/encounter 實際 schema，而非使用 DOM 假值。

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
