# 《文明戰線》發布容量優化・第 4 階段：正式發布驗收與切換關卡

## 本批已施工（僅驗收系統；正式 Pages 未切換）
- 新增 `.github/workflows/publish-release-gate.yml`：以現行 main 建立隔離 `.publish-stage3/` 精簡測試網站，啟動本機 HTTP 伺服器，執行 Playwright Chromium 瀏覽器測試（`browser-smoke.js`、`startup-readiness-browser.js`、`gm-3d-test-center-browser.js`、`3d-mode-browser-regression.js`），並留存 `publish-stage3-report.json`。
- 加入首次推送觸發與 `workflow_dispatch`，**不呼叫 Pages deploy，也不變動 Pages 設定、不移動來源素材、不刪除或清除玩家資料**。
- 從 GitHub Repo metadata 已確認 `has_pages=true`，但此連接器無法取得目前 Pages build source 設定與工作流程實際執行結果。絕不推測已完成切換。
- 第 3 階段規劃之 32 張 WebP 背景、6 首音樂及 5 個 SFX 類別對應的 11 個實際 OGG 音效，仍是精簡測試包的音訊基準；不得因「11 種聲音」只包 11 個實體音檔。

## 驗收與正式發布的強制阻擋條件

1. **CI 關卡**：必須能在 GitHub Actions 看到 Release Gate 成功、報告 `missingDirectRefs=[]`，瀏覽器測試通過；若失敗先修復缺檔及程式碼，重新測試。
2. **帳號和雲端**：需使用隔離測試帳號核對登入／登出、手動上傳與下載、不同帳號上傳保護、下載覆蓋確認、離線起點重設。不得直接拿正式玩家存檔做具破壞性的測試。
3. **桌機與手機**：實際 Chromium / Android / iPhone Safari 開啟精簡站點；檢查首次載入、橫直、WebGL 故障回退、正式 3D 預覽、角色與介面。
4. **功能完整**：文字模式、主線、各紀元副本、災厄、回顧、GM 控制、GM 背景戰鬥、1×/1.5×/2×、Fast Catch-up、極簡模式、所有正式資料身份及對照。
5. **聲音驗收**：3 紀元音樂、3 個戰鬥層級、5 類 SFX 與其隨機播放池完整；主畫面與戰鬥切換不重播、不中斷、無重疊。
6. **容量與實際發布**：記錄原始 main、乾跑成品及 Pages 真正 artifact bytes；確認 Pages 設定、部署流程與回退方法。只有完成以上全部關卡，才允許真正變更 Pages 發布來源。

## 切換與回退（尚未執行）

- 備份切換前 main HEAD、Pages 設定、原網站資源清單；先建立獨立測試預覽環境。
- 正式切換將由現有 Pages Branch 發布調整至驗證過的 Actions Artifact 發布（或依實際 Pages 設定選擇兼容方案）；主程式路徑、`resource-manifest.json` 與 Service Worker 需核對版本，避免桌機手機資源舊版混用。
- 如正式網站異常，立即恢復已確認的原發布來源/版本；原始碼 main 唯一來源及玩家的本機與雲端存檔保持不變。

## 當前結果

- 已提交並回讀第 4 階段 CI 工作流程檔案。
- **未能取得 GitHub Actions 真實執行結果、未能完成真機及正式登入雲端驗收、未能取得 Pages Source Settings。故本批驗收未通過，不得正式切換網站。**
- 目前只能稱「第 4 階段的自動測試機制已施工」，不能稱「精簡版已正式發布」。
