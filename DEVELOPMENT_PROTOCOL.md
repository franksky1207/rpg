# 《文明戰線》修改與自我檢查必要流程

更新日期：2026-09-23
分支：`main`

> 本文件是《文明戰線》GitHub 倉庫的正式維護規範。`main` 的實際程式碼仍是唯一真實來源。

## 修改前

1. 先重新讀取 `main` 中本次修改的正式 owner、直接相依檔案與相關 integrity／workflow；不得只依賴舊對話、記憶或舊交接檔。
2. 使用者說「先討論／先檢查／先列出」時不得修改；使用者明確說「做／修改／執行／修正」後才可寫入 `main`。
3. 先確認修改範圍、世界別（銀河紀元／宇宙紀元）、正式 state 與 GM sandbox 是否需要隔離。

## 修改後自我檢查（必要步驟）

使用者要求「修改後自我檢查」時，以下全部完成才可宣告該批完成：

1. **重新讀取修改後的 `main`**：確認實際寫入內容與預期一致，不以剛送出的內容自行假定成功。
2. **檢查直接相依與 owner**：確認沒有重複 owner、世界判定錯置、正式 state 污染、舊 fallback 蓋過新規則等問題。
3. **JavaScript／CSS cache-bust**：凡玩家端載入的 JS／CSS 有改動，必須同步更新 `index.html` 對應 `?v=`；不得遺漏，也不得誤改無關檔案的版本標記。
4. **Runtime Integrity 必須綠燈**：JS、`index.html` 或 Runtime Integrity 涵蓋檔案有修改時，必須查看該次最新 `main` commit 的 GitHub Actions `Runtime Integrity` 最終結果。
   - `success`：才可把該批標示為完成。
   - `failure`：必須讀取失敗 job／log、修正後重新檢查；**不得對使用者宣告該批已完成**。
   - `queued`／`in_progress`：仍屬未完成；必須等待最終結果後再下結論。
   - 若後續 commit 已取代前一個中間 commit，以目前最新 `main` head 的結果為準，但不得忽略最新 head 的失敗。
5. **Story Integrity（適用時）**：故事資料、故事 UI、故事規則或其 workflow 有修改時，同樣必須確認最新相關 Action 最終為 `success`。
6. **錯誤不得帶入下一批**：若本批 CI 已紅燈，不得只靠下一批無關修改再次觸發 CI；應先修掉目前錯誤，再繼續後續工作。

## CI 失敗通知原則

GitHub Actions 失敗 Email 不應以關閉通知來掩蓋。目標是讓語法錯誤、owner integrity 錯誤等問題在宣告完成前被發現並修正。連續修改時，workflow 的 stale-head 防護可跳過已被新 `main` 取代的中間 commit；但最新 `main` head 的 Runtime Integrity 必須實際通過。

## 完成回報最低內容

每批完成時至少確認：
- 修改檔案已重新讀取。
- JS／CSS 有改時 cache-bust 已同步。
- Runtime Integrity（以及適用的其他 integrity workflow）最終結果。
- 若 CI 尚未完成，不使用「已完成」作為結論。
