# 全站紀元文案驗收（2026-10-29）

基準 main：`ad0b6d9969ba61988eb0f64a145b93354adec805`。範圍限文案、唯讀文案選擇、快取 URL 及測試；未修改紀元門檻、戰鬥、5% 戰線、資源、獎勵、GM 功能或存檔。

## 掃描與語意判讀

完整 tracked HTML/JS/CSS/JSON（含 CJS／MJS／TS／JSX） 來源清單與關鍵詞命中見 `scan.json`，包含正式入口、三紀元、GM、動態提示、設定、說明、地圖、戰線紀錄、3D 測試頁及開發文件。另查英文 review/replay 與回放／重播，以追查動態與兼容路徑。

找到並修正 **13 處文案位置，分布於 6 個正式 JS 檔**：

|來源|處數|問題與處理|
|---|---:|---|
|worldphaseui.js|8|銀河確認「歷史紀錄」、回顧註記；高維確認「歷史與戰線紀錄」、回顧註記；宇宙歡迎既有內容；高維歡迎回顧 banner、舊世界區塊、歷史紀錄，各改為正式功能名稱／實際成長說明|
|gmbackground.js|1|移除主線鎖血說明中的退役回顧戰|
|offlineprogress.js|1|移除高維離線樣本提示中的退役回顧戰語意|
|secondworldcombat.js|1|「宇宙紀元已轉為回顧」改為「目前不在宇宙紀元，無法進行宇宙主線戰鬥。」；未改判斷或錯誤流程|
|playersemanticsui.js|1|兼容主頁卡片「災厄回顧」改為實際的「文明傳承／查看當前文明力量與銀河印記」；現行主頁原本已使用文明傳承|
|storyrecordtabs.js|1|「文明歷史已永久歸檔，可隨時回顧」改為「戰線紀錄已永久歸檔，可隨時查看」|

保留：戰線紀錄內三紀元劇情重播的「回顧」、轉生說明的閱讀歷史、鏡像戰與虛空最高紀錄、故事人物談及歷史的敘事。這些都有對應功能／語意。CSS 註解、測試斷言與退役 API 隔離診斷不屬玩法入口，未刪除兼容防線。正式玩法介面已無過時回顧戰說明；未加入退役公告。

## 首次／轉生差異與重要文案

- 首次銀河 → 宇宙：「鏡像戰與虛空進度完整保留，已解鎖的戰線紀錄亦可繼續查看。」
- 首次宇宙 → 高維：「鏡像戰、虛空進度及既有養成完整保留，已解鎖的戰線紀錄亦可繼續查看。」
- 轉生後兩種轉換：「鏡像戰與虛空永久紀錄、目前進度及本輪既有養成保留；已解鎖的戰線紀錄可繼續查看，並繼續本輪正式重征服。」
- 高維 banner：「接下來將於高維戰線推進正式成長。」；轉生後為「繼續本輪高維紀元正式重征服。」

依正式 `worldReincarnationContext(state).reincarnationRun` 選擇，明確傳入目前 state。檢視 `applyReincarnationResetState` 確認轉生會重置養成與三紀元本輪進度，保留鏡像／虛空永久歷史；`enterSecondWorld`、`applyThirdWorldEntryState` 並不再次執行轉生重置，因此轉換當下的養成與副本狀態仍承接。未把前世本輪進度描述為完整保留。

## 瀏覽器證據

`browser-report.json` 保存每個畫面的實際文字與 DOM 尺寸判斷。`tests/runtime/era-copy-browser.cjs` 可重現。

|情境|確認|歡迎|390×844／1440×900|
|---|---|---|---|
|首次銀河 → 宇宙|通過|通過|通過|
|首次宇宙 → 高維|通過|通過|通過|
|轉生銀河 → 宇宙|通過，正式重征服|通過，正式重征服|通過|
|轉生宇宙 → 高維|通過，正式重征服|通過，正式重征服|通過|

16 個畫面無橫向溢出、卡片位於視窗內、按鈕可見、長文可捲動。使用真實門檻資料驗證 eligible，展示文字前後 state 不變。每種狀態均驗證戰線紀錄清單、已解鎖劇情重播與 state 唯讀。測試直接執行現行程式，不使用歷史投影。

## 回歸

通過：era-copy-browser、reincarnation-rerun-entry-integrity、reincarnation-ui-integrity、reincarnation-reset-integrity、reincarnation-rerun-batch5-closure、tests/story/record、tests/story/flow、alternate-universe-ui-integrity、formal-stop-approved、batch20-approved-runtime。

歷史 byte seal 透過 `era-copy-approved.*` 精確登記 7 個檔案的前後 SHA-256，置於既有投影鏈最前端；所有其他 bytes 及舊斷言仍受保護。只對應快取 URL 與這次文案，不以整體重設歷史基準掩蓋差異。index 的 6 個引用附加 `eraCopy=20261029`，保留原有 query 與載入順序。

本機採既有 Playwright 與系統 Chromium；未改 auth 或雲端資料。PR CI 由現有工作流程正常觸發；未手動派送大量歷史工作流程或繞過保護。
