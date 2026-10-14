# 《文明戰線》第28批｜裝備概念圖製作、入庫與 Actions 驗證 SOP v1.0
日期：2026-10-14。適用：G026～G100、U001～U100、H01～H10；每批五套。以每次工作開始時 GitHub 最新 main 為唯一真實來源。本文件為作業規範，不表示任何概念圖已獲批准，也不變更正式遊戲功能。

## 一、固定交付規格
- 每批五套、每套兩張 WebP，共十張；角色正／側／背總覽 `overview-front-side-back.webp` 與五槽拆件 `equipment-five-slots.webp`。
- 正式身份與名稱由 `development/3d-source/equipment/concepts/_concept-index.json`、相關 identities、套裝 notes 與 `docs/3D_EQUIPMENT_ALL_EPOCH_FIVE_SLOT_CONTRACT_2026-10-13.md` 核對；武器、頭盔、鎧甲、鞋子、飾品五槽不得杜撰或串套。
- 銀河 G001～G100、宇宙 U001～U100、高維 **H01～H10**（絕非 H001～H010）。來源映射以 sourceKey 為準，不能僅憑顯示名稱判定。
- 新入庫概念圖維持 `conceptApproved=false`、未建模狀態；入庫≠藝術批准；開發圖不得進入正式發布包。既有已批准套裝不得被批次規則反向取消。
- 既有其他套裝、正式玩法、存檔、GM、背景／極簡、音訊、發布限制及 2.5D 功能均不在概念圖入庫修改範圍。

## 二、一次五套的操作流程
1. **一般 ChatGPT 先讀 main**：讀取 `PROJECT_HANDOFF.md`、索引、五槽契約、五套 notes 與既有風格；先確認目錄、正式區域與五槽名稱。
2. **製作十張圖**：每套角色正側背與五槽拆件各一張；保持既有科幻美術、全罩頭盔、完整左右鞋與清楚分槽。圖可顯示在對話，不需逐張停下等指令。
3. **交付素材**：盡可能產出正確檔名的 WebP 與單一 ZIP；若當次工具無法直接製作 ZIP 或轉檔，須明確告知，不能假稱已完成。跨對話至 Work 時需附加素材；不得假設圖片已自動傳遞。
4. **Work 整批入庫**：自行重新讀取最新 main；使用原圖、不擅自重生；核對五套目錄與身份；上傳十張 WebP，更新索引、指定 notes、必要總表與 handoff；維持未批准狀態。
5. **必要預檢**：先檢查格式、尺寸、檔名、bytes、SHA-256、五槽對應、索引一致性、開發／正式發布隔離；再依修改實際影響範圍執行相關單元測試與契約驗證。已知錯誤先修復才提交。
6. **提交**：原則上整合為單一 main commit，先核對差異範圍；不將無關程式、歷史來源或已批准資料夾帶修改。
7. **Actions 驗證**：以新 commit exact HEAD 查詢應觸發工作流程的結果；區分成功、失敗、執行中、未觸發；失敗則讀 job log、查根因與連帶依賴、修復並重新核對。未觸發不可算成功。
8. **固定回報**：修改內容（含五套、十圖）、程式自我檢查、實機驗收清單、提交 SHA 與 Actions、待補／限制。

## 三、避免本次 CI 重複失敗的注意事項
2026-10-14 的修復經驗：
- GM 快取引用 `20261014-b28-hp-visual1` 已變更，但 `development/hybrid-comparison/t2b3-v1/source-version.cjs` 仍期待舊值；來源版本鎖不一致會連帶造成 Runtime Integrity、T2-B2、T2-B3 失敗。修改相關 JS 引用或驗證器時，先比對唯一允許的版本差異及歷史來源鎖。
- 修改 `source-version.cjs` 後，`development/hybrid-comparison/t2b3-v1/inventory.json` 的 SHA-256、bytes、totalBytes 未同步，造成 B3 再失敗。凡修改受 inventory 追蹤的檔案，必須依既有 inventory 工具重新計算並驗證，不能只更新一個 SHA。
- 保留嚴格來源／歷史 SHA 契約，不得停用 workflow、刪除檢查、放寬來源鎖或偽造全綠。
- Runtime Integrity 存在 paths 觸發限制：某 commit 未觸發，不可說該 commit 的 Runtime Integrity 已通過；若本次變更確實涉及它的契約，應補做對應檢查。
- **不強制**建立 ChatGPT／Work／Codex 共用的統一預檢入口；**不強制**每批無條件跑所有無關測試。依修改影響範圍做必要預檢，保留後續自動化彈性。
- 2026-10-14 已驗證的 CI 修復 HEAD `4a97a578db98025419fb7194087041f26f8ca6c5`：該 SHA 觸發的六項 Actions 全成功；Runtime Integrity 未觸發，不列入六項成功。

## 四、可複用指令 A｜一般 ChatGPT 生圖
> 請承接 GitHub `franksky1207/rpg` 第28批裝備概念圖 SOP，以最新 main 為唯一來源。本次製作【五套編號】，共五套十張。先讀取 handoff、正式索引、五槽契約、五套 notes 與既有美術風格；每套製作正側背總覽與五槽拆件，嚴守正式名稱和身份映射。圖片可出現在對話，但不要逐張停下要求確認；盡可能一次整理成十張 WebP 與單一 ZIP。不要修改正式遊戲程式、擅自批准或解除發布限制；工具無法交付的部分如實說明。

## 五、可複用指令 B｜Work 入庫
> 請將附加 ZIP 中【五套編號】的十張 WebP 入庫 `franksky1207/rpg` 最新 main。先讀取本 SOP、handoff、正式索引、五槽契約與五套 notes；使用原圖，核對目錄、五槽名稱、尺寸、bytes、SHA-256；更新索引、notes、必要總表與 handoff，維持未批准與未建模狀態，不影響其他套裝、正式玩法與發布資產。提交前依修改範圍執行必要預檢，特別檢查來源版本鎖、快取版本、受追蹤檔案的 inventory SHA／bytes／總量及發布隔離；原則上整合為單一 commit 提交 main。提交後核對 exact-HEAD Actions；失敗讀 log 並修復根因與連帶問題，不得停用檢查。最後回報修改內容、自我檢查、實機驗收、commit、Actions 及待補。不要反覆要求使用者手動完成中間步驟，只有實際工具或權限限制才中止說明。

## 六、目前交接
截至本 SOP 建立前，概念圖已入庫 G001～G025，共 25/210 套；下一批 G026～G030（五套十張），其後每批五套。既有批准／模型狀態須依索引逐套判斷，不以「已入庫」取代審查。
