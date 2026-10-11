# 《文明戰線》發布容量優化｜第 2 階段施工規範與驗收

> 本階段為**分類、清單及 CI 安全檢查**，並非切換正式 GitHub Pages 發布；不得把候選清單當成已發布或已驗證可排除的真實網站檔案。

## 一、目錄規則

| 區域 | 用途 | 第 2 階段動作 |
|---|---|---|
| `index.html`、正式 JS/CSS、`assets/backgrounds/`、`vendor/`、`3d-test/` | 玩家及正式 GM 執行所需路徑 | **保留原位置**，不改網址 |
| `audio/assets/` | 混合正式曲目、音效、原始檔及候選素材 | 正式音訊保留；`*-original.*`、`*-source.*`、zip、7z、flac 列為來源候選，若被執行期參照則強制保留 |
| `assets/backgrounds-source/` | 正式 WebP 所對應的原始 PNG | 未來轉入 `development/backgrounds-source/` 的候選；本階段**不搬檔** |
| `development/audio-source/` | 原始音訊、授權來源封裝的**未來**放置位置 | 僅定義規範，目錄尚未搬入素材 |
| `development/blender-source/` | 第 27～40 批 Blender 建模原始工程的**未來**位置 | 本階段無正式 Blender 檔案 |
| `development/asset-candidates/` | 尚未採用候選素材的**未來**位置 | 不允許遊戲正式執行期直接引用 |
| `docs/`、`tests/`、`.github/`、`scripts/` | 文件、測試、工作流程及建置工具 | 不屬於正式網頁執行資源；**不刪除倉庫內容** |

注意：新增 `development/` 這種資料夾**不會自行讓 branch-root GitHub Pages 排除檔案**；第 3 階段才建測試打包，第 4 階段驗收後切換 Pages。

## 二、正式發布清單的第一版保守策略

新增 `scripts/publish-asset-audit.cjs`：用 `git ls-files` 及本機 Git 工作樹統計檔案大小，形成「預計保留」及「排除候選」兩組集合。

- 只對 `assets/backgrounds-source/`、`development/`、開發目錄、來源音檔/壓縮包採**排除候選**分類。
- 其他檔案原則上**全部保留**，包含音訊、GM 延後腳本、第三紀元、高維、異宇宙與測試中心所需內容。這是防漏策略，不是最終精簡清單。
- 掃描 HTML 的 `src`、`href`、`data-src`；掃描 CSS `url(...)`；掃描正式程式中的部分**完整字面媒體路徑**。候選檔若被引用，強制列入保留與報告。
- HTML 直接引用但缺少 JS/CSS/HTML，或 CSS 直接引用但缺少圖片/字型，會在檢查中報錯並失敗。可能由執行期動態拼接的資源列為待確認，**不宣稱已自動證明完整閉包**。
- `resource-manifest.json` 目前是媒體快取檔案指紋清單，**不可當作完整發布白名單**。
- 可執行指令：`node scripts/publish-asset-audit.cjs`；輸出結構化結果：`node scripts/publish-asset-audit.cjs --json > publish-asset-audit.json`。
- 新增 `.github/workflows/publish-asset-audit.yml`：main push/手動可跑，**只驗證及上傳容量 JSON 報告**；不自動刪除、移動、commit、發布、部署，也不改 Service Worker。

## 三、容量報告的數值定義

1. `totalBytes`：目前 Git 追蹤檔案在 HEAD 工作樹中的邏輯容量。
2. `includedBytes`：依保守分類及掃描引用的**模擬發布集合大小**，不是 Pages artifact。
3. `candidateExcludedBytes`：候選節省量，未通過完整依賴和真實部署驗收之前只能當規劃值。
4. `hardMissing`：已辨識的 HTML/CSS 直接引用缺檔。
5. `reviewNeeded`：無法直接定論的疑似媒體參照；持續人工確認。

GitHub Pages 的**真正發布 artifact bytes**、手機/桌機**首次實際傳輸 bytes**、**媒體預載 bytes**，本階段均尚未實測。第 3 階段產生測試 artifact 後量測前者，第 4 階段瀏覽器驗收量測後兩者。

## 四、安全與非功能變更

- 本階段不移動原始 PNG、不拆分音訊、不修改 `index.html`、JS/CSS、音效、快取、登入/雲端存檔、GM、背景戰鬥、倍速、離線、極簡或正式 3D 測試中心。
- 不改 `main` 的正式程式路徑，維持單一來源。
- **任何待確認檔案先保留，不用容量推算取代功能驗收。**
- CI 已建檔並靜態回讀，但此文件不主張 GitHub Actions 完整執行成功或手機實測通過。
- 第 3 階段可由此清單進行乾跑打包，但真正 Pages 切換仍必須等第 4 階段全模式驗收。

## 五、第 3 階段施工前待補

- 取得 GitHub Pages 發布來源/實際 artifact 設定。
- 針對動態拼接路徑、GM 延遲載入、音效 manifest、第三紀元/異宇宙、資源快取補測試。
- 產生獨立測試產物，做 404、音訊與 3D 資源連線驗證及容量測量；必要時補強嚴格白名單判斷。
- 先確定 GitHub Actions 稽核結果和缺檔風險才准搬動開發素材。
