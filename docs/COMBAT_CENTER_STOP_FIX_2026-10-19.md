# 《文明戰線》PR #48 修復與驗收記錄（最終同 SHA 驗收待完成）

本批沿用 PR #48 與 `fix/combat-center-stop-and-sprite-warmup-20261019`，沒有建立新 PR 或重建系統。程式已修正並合併；在所有必要 Actions 取得最終成功前，不宣稱封箱。

## 已核對的基準與提交

- 接手 main：`39620ae6599096b3648688508bd80d567fe58e6e`。
- 接手 PR head：`276408d1dacb1437c2dfdd87566786c049014e3b`。
- 合併前修正 head：`a9407dc27b7aacd3bd418ef2e137c620832422dd`，九項同 head Actions 全部實際完成並成功後才合併。
- PR #48 已合併，程式合併 main：`7b8138bff0fa414037ffe72ab864848cc7a05f79`。
- 本次補充僅加強測試、觸發條件與驗收文件，正式遊戲程式／素材／快取版本與上述程式 SHA 相同。

## 修改與真正根因

1. 修正兩個開始災厄按鈕誤標為停止、真正災厄停止與銀河主線／虛空退出漏標。九個原停止 owner 使用 `data-combat-action="stop-continuous"`，原鈕直接輸出在動畫前；不在 Ready 後搬移，不新增重複鈕。原文字、class、style、事件、disabled、停止／結算規則保留。
2. 手機只以實際 Ready 舞台中心對準 visualViewport 高度與 offset；不以停止鈕、標題或 HP 算中心。保留載入／退休舞台空間，等待穩定布局，取消過期 RAF，避免短連戰縮減頁面造成 scroll clamp／anchoring。換場不重複自動定位，手動滑動後不拉回，旋轉仍尊重手動操作，桌機不套用手機定位。
3. 沿用原智慧下載、HTTP／SW 快取與六張 Sprite pool。idle 只循序預備當前紀元／轉生外觀兩張圖，初次解碼 2 MiB，零 actor／canvas／GPU 引擎，不一次解碼三紀元。修正匯出／映射、戰鬥期爭用、同外觀事件清空重用、離場後立即回填；保留 AbortController 與錯誤回退。
4. 舊 byte／HTML 驗證基準未包含本批合法模板與 cache URL 差異，現在以不可變 main 加精確核准差異逐字驗證，再延續舊保護；另逐字驗證原鈕全部屬性及其餘 UI／玩法碼。沒有刪有效測試／assertion、停用 workflow 或降低門檻。
5. 修正測試錯誤：1 ms 回顧動畫觀察競態改用測試 latch；解碼 fault 在共用 pool 建立前注入；GM fixture 等真正 startup ready。封箱自檢另發現原三連戰案例只看總場數，可能把中途落敗誤算為完整三戰；已加嚴為六場逐場勝利與順序、兩輪全通、零失敗輪、manual 停止，未改正式戰鬥 owner。

未改戰鬥公式、HP／獎勵、Schema 17、存檔、轉生、背景／離線／Fast Catch-up、極簡、音訊、美術、人物站位；未新增戰鬥文字框或訊息框。高維正式懸賞不可用規則保留，沒有為測試新增高維懸賞或災厄連戰。

## 已實際執行

- 真正式模式手機直／橫向 22 例，另 2 例驗證高維懸賞不可用；最大舞台中心偏差 0.4765625 px。
- 42 個布局／Ready 前後／原鈕單一與 handler／換場／手動滑動／旋轉／桌機案例。
- 日蝕王座連續討伐原停止成功；高維異相嚴格六戰：第一輪三戰全勝、自動進下一輪第一戰，按停止後完成該輪另兩戰；`startedRuns=2, finishedRuns=2, fullClears=2, failedRuns=0, stopReason=manual`。
- Sprite Node 三例，涵蓋實際模組匯出、三紀元／轉生、去重、2 MiB、錯誤重試、Abort／隱藏／清空與戰鬥期不預載；六張原素材 bytes／SHA-256 全吻合。
- 正式 Pages 候選上的正式戰鬥三 viewport、GM 三紀元六動作、十種原有失敗回退與八場快取重用、精確音效、零租約及離場清空均實跑通過。
- Batch6 CI 16 類、32/32、36 個不同原始測試；原 child budget、當次執行及失敗傳遞保留。Runtime、Batch5／7／12、正式／GM、整合、語法、保護、快取與發布閉包均已執行。

## 發布與當前外部狀態

正式站 https://franksky1207.github.io/rpg/ 已實際取回本批 HTML、最佳化 manifest 與 26 個變動資源／依賴，bytes／SHA／JS MIME 均與正式候選吻合；含六張原 Sprite、共用模組、SW 與 client。最佳化 manifest 為 413 個指紋，原始庫完整 manifest 為 528 個，不能混為同一份。候選 37,862,709 bytes，32 張背景、17 個音訊、5 類 SFX，零遺漏依賴。

GitHub 聚合狀態曾與實際執行紀錄不一致：Runtime 的 attempt 1 API 已為 completed/success、完整 log 已完成所有測試／upload／cleanup，但部分 run/job 聚合仍顯示 in_progress；Pages deploy log 已 `Reported success`，Pages deployment API 為 `succeed`、正式資產已驗證，但 workflow 聚合仍 waiting／queued。已確認環境允許 main、無人工 reviewer；review API 回 403、取消／強制取消回 409、直接重跑回「already running」。沒有因此修改部署保護、停用 workflow 或跳過測試。新的驗收提交將再次跑必要 CI；最終同 SHA 成功狀態及封箱結果必須重新核對，不能以此段描述代替成功終態。

## 證據

- 原 PR：https://github.com/franksky1207/rpg/pull/48
- 合併前 Runtime：https://github.com/franksky1207/rpg/actions/runs/39275377309
- 合併前 Batch6：https://github.com/franksky1207/rpg/actions/runs/39275365874
- 合併後 Runtime attempt：https://github.com/franksky1207/rpg/actions/runs/39277113458/attempts/1
- 合併後 Pages：https://github.com/franksky1207/rpg/actions/runs/39277113399
- Pages deploy job：https://github.com/franksky1207/rpg/actions/runs/39277113399/job/118147361937

## 真機待驗收

iPhone Safari 實際畫面、動態工具列／可視中心、手機直橫向、長時間連戰與手動滑動、溫度、耗電及流暢度仍需實機驗收。Chromium／WebKit 自動化不代表已測實體 iPhone，本批不作此宣稱。
