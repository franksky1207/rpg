# 《文明戰線》發布容量優化・第 3 階段：精簡發布測試成品

## 本批範圍與安全
- 新增 `scripts/build-publish-dry-run.cjs`、`.github/workflows/publish-dry-run.yml`：在 GitHub Actions checkout 後產生隔離的 `.publish-stage3/` 測試網站與 `publish-stage3-report.json`，**不執行 GitHub Pages deploy、不搬檔、不刪 main 來源、不修改遊戲程式、帳號、雲端、存檔或 Service Worker**。
- 從 Git 追蹤的正式資料保守打包，排除 `.github/`、`docs/`、`tests/`、`scripts/`、`development/`、`assets/backgrounds-source/`、DOCX 與非正式音訊候選。其餘程式及 GM/3D 延後腳本保留原路徑。
- 正式背景：`assets/backgrounds/` 32 張 WebP；若數目與預期不符則停止。
- **正式音訊概念是 6 首配樂＋5 種音效，共 11 種聲音；但實際音效播放池共使用 11 個 OGG 實體檔，因此打包共需 17 個音檔。** 音效池為普通攻擊 001～003、暴擊 001～003、閃避 001、重擊 004/005/029、勝利 001。實際程式來源是 `audio/audio-core.js` 的 `warmChoices`。若池與打包清單不一致即停止，避免精簡後隨機音效壞掉；介面點擊音效不納入。
- 從既有 `resource-manifest.json` 保留確實在測試成品內存在的 hash 項目，避免原版媒體清單要求沒有打包的來源音訊；正式長期方案仍應重新從成品產生完整內容指紋並驗證。
- 掃描測試成品的 HTML `src/href/data-src` 與 CSS 靜態 `url()`，已知直接引用資源如缺檔則失敗並輸出檔名；動態產生的路徑、異宇宙、GM 功能、WebGL/行動裝置和帳號雲端仍需瀏覽器驗收。

## 核對 main 檔案樹的初步試算（非實際 Actions artifact）
- 第 3 階段新增流程後，GitHub main 树共有約 670 個 blob（隨後文件提交會變動）。
- 已以 main Git Tree 核對 17 個正式音訊實體檔**全部存在**，總約 **12,045,408 bytes = 12.05 MB**。
- 32 張正式 WebP 背景存在。
- 依新流程的排除前綴和明確音訊清單，以當前 Git Tree `size` 靜態試算，**約 28,234,689 bytes = 28.23 MB**（此為候選值，非實際乾跑產物量；實際 JSON manifest 重建會略有差異）。
- GitHub main 全檔案約 215 MB，亦會隨新增文件和程式更新。原始素材仍留在 main 且 Git 歷史也不會縮小。
- GitHub Actions 實際執行結果尚未取得；本執行環境無法對 GitHub 執行 `git clone`，所以不宣稱網站可完整運行或 Pages 已成功縮小。

## 第 4 階段前的強制驗收
1. Actions `Publication Dry Run (Stage 3)` 成功，下載報告並核對正式測試成品容量、缺檔報告。
2. 先在獨立預覽環境跑文字／GM／3D、登入／登出／雲端存檔及重置保護，不直接替換玩家目前網頁。
3. 實測手機/桌機音樂 3＋3、音效 5 類與隨機音效選擇，離線收益、倍速、背景戰鬥及主線／災厄／副本。
4. 確定 Pages 建置來源設定及切換/回退方案，再切換正式 Pages；未完成前保持原網頁發布方式。
