# 《文明戰線》修改與自我檢查必要流程

更新日期：2026-10-25
分支：`main`

> 本文件是《文明戰線》GitHub 倉庫的正式維護規範。`main` 的實際程式碼仍是唯一真實來源。

## 修改前

1. 先重新讀取 `main` 中本次修改的正式 owner、直接相依檔案與相關 integrity／workflow；不得只依賴舊對話、記憶或舊交接檔。
2. 使用者說「先討論／先檢查／先列出」時不得修改；使用者明確授權「做／修改／執行／修正」後才可施工；多批整合應先寫入工作分支，僅在正式驗收、合併授權與分支保護符合時更新 `main`。
3. 先確認修改範圍、適用紀元（銀河／宇宙／高維／異宇宙）、正式 state 與 GM sandbox 是否需要隔離。

## 修改後自我檢查（必要步驟）

使用者要求「修改後自我檢查」時，以下全部完成才可宣告該批完成：

1. **重新讀取實際修改分支**：確認提交內容及相依檔案；若已正式合併，再重新讀取最新 `main`，不可把分支完成冒充 main 發布。
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

## 工具選擇與 Codex 額度節約（2026-10-25）

**ChatGPT 優先、Codex 必要才使用；測試依變更風險與受影響範圍決定，不依專案總規模決定。**

1. **預設由 ChatGPT 施工**：能透過已連接 GitHub 完成的盤點、程式／文字／數值／UI 修改、靜態檢查、PR、合併與 Pages 核對，應直接處理。多檔案不自動等於必須用 Codex；以實際複雜度判斷。
2. **Codex 使用門檻**：大型重構、跨系統難題，或必要的 Node／瀏覽器整合測試因 ChatGPT 執行環境受限而無法合理完成時，才建議 Codex。提出前先完成 ChatGPT 能做的部分，明確指出剩餘工作、無法完成的原因、必要性及最省額度範圍；不得把整批可自行處理的工作轉交。
3. **風險分級驗收**：純文案／小型 UI 以差異、語法、顯示與局部互動檢查為主；收益／公式／戰鬥修改檢查共用 owner、數值與實際呼叫模式；存檔／離線／背景／交易修改則加驗 schema、舊資料、失敗復原和去重。無關測試不因換批次就全部重跑。
4. **精準補測，不削弱保護**：先跑最小必要測試，定位失敗後只重跑受影響項目；正式整合時再完成現有必要 CI 與分支保護。不得刪除、跳過或放寬必要完整性／安全斷言來減少時間。
5. **Actions／PR 省工**：相關修改盡量集中同一整合分支及單一 PR；避免每次小修都觸發完整 Actions。不必要的工作流程不手動 dispatch；同 PR 有新提交時沿用既有取消過期 Actions 的機制。正式 main 發布所需的 Runtime Integrity、適用 Gate 與 Pages 驗證仍按本文件原規則執行，不以局部綠燈取代。
6. **區分驗收等級**：回報需清楚區分「靜態檢查」「實際本機／瀏覽器功能測試」「正式 CI／Pages 通過」，禁止虛報。ChatGPT 無法執行全套瀏覽器測試，不代表不能先完成程式檢查與局部驗收，也不代表每次都必須交 Codex。
7. **使用者成本優先**：Codex 額度屬有限開發資源；不能因方便、保守或套用固定冗長流程而浪費。除使用者明確要求外，不把 Codex 當每批固定的最後驗收者；給 Codex 的指令只包含確有必要的剩餘工作。

以上規範補充工具與測試的**選擇方式**，不取代本文件既有的正式 `main` 完成條件、CI Gate、cache-bust 及必要安全保護。

## 唯一施工流程與 CI 分工

1. **明確範圍**：依最新 main 盤點 owner、相依、正式入口與安全守衛；先列必改、不得改、受影響測試與人工真機限制。
2. **單一整合**：相關變更集中同一工作分支與 PR；程式、必要測試、HTML cache-bust、規範及證據同步處理，不為取得綠燈關閉守衛或單純放寬 timeout。
3. **分層驗收**：先靜態／語法／快取預檢，再依修改影響跑最小功能測試；涉及瀏覽器行為才補相關 Browser；正式合併需滿足 PR 上既有必要 Gate，main 發布後再核對適用 Runtime、Pages 與同 SHA 證據。
4. **失敗修正**：分析第一個失敗根因，掃描相同原因，修正原 PR 後只補跑必要項目；不能以跳過測試或無關後續提交掩蓋失敗。
5. **CI 分流**：`.github/workflows/functional-ci.yml` 依功能影響分類，常設 `functional-ci-gate`；測試檔名稱含舊批次不等於仍需專屬批次流程。未知路徑與工作流程修改應採保守分類，不因文件精簡削弱實際 CI Gate。`runtime-integrity.yml`、`story-integrity.yml`、資源與 Pages 工作流程維持現役必要條件。路徑／執行命令以實際 workflow 和 `scripts/ci-impact.cjs` 為準。
6. **封箱回報**：清楚分開已提交工作分支、PR 檢查、合併 main、Pages 發布與 iPhone 人工實測，列成功、失敗、未執行，不因本機通過宣稱正式部署成功。

## 文件權責與優先順序

最新 `main` 的正式程式、資料契約、資源 Manifest 及實際完整性測試是行為真實來源；本檔唯一管理通用施工／驗收方式。`STORY_WRITING_RULES.md`、`STORY_BIBLE.md`、`STORY_UNIVERSE_RULES.md`、`GM_UI_GUIDE.md`、`MINIMAL_MODE.md`、怪物美術規範及來源／授權文件只管理各自專業規則。`README.md`、`PROJECT_HANDOFF.md`、`PROJECT_PENDING_STATUS.md` 僅記錄正式現況與待辦，不另制定相衝突的通用流程。舊 Git Commit、Issue、PR、已完成施工報告只能供追溯，不再當作現行施工命令。若文件和現役 owner／安全斷言不符，先核對原因，不得逕自放寬安全條件。
