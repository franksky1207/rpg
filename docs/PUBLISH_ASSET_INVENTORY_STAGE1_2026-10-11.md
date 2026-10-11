# 《文明戰線》正式網站容量優化｜第 1 階段：GitHub main 全檔案盤點

> 盤點基準 main commit：`85b3a1f7f1c56791be6f14037303783b6b7ce972`（本報告建立前）。本階段只建立容量分類與風險清單；不修改部署、快取、檔案、載入及玩家資料。

## 1. 已核實的 main 資料（GitHub Git Trees API，recursive=true、truncated=false）

- 追蹤 blob 檔案：**664 個**。
- HEAD 檔案邏輯總量：**215,366,091 bytes = 215.37 MB（約 205.39 MiB）**。
- 此數字是檔案大小加總，**不是** git pack/歷史紀錄空間、GitHub Pages 實際發行產物、玩家首次下載量、Service Worker 快取大小。
- 本階段未取得 Pages Settings 之發布模式設定，也未驗證目前網站的實際部署 artifact；不得把下面的「候選」視為可直接刪除的檔案。

| 原始路徑／分類 | 檔數 | 位元組 | MB（十進位） | 階段一分類 |
|---|---:|---:|---:|---|
| `assets/backgrounds-source/` | 32 | 80,071,583 | 80.07 | 開發來源資產候選，**建議未來排除正式發布**，但須先查遍引用及部署 |
| `assets/backgrounds/` | 32 | 4,529,630 | 4.53 | **保留正式使用**的 WebP 背景 |
| `audio/assets/` | 141 | 118,076,105 | 118.08 | **混合資料夾，必須逐檔分類** |
| `vendor/` | 3 | 6,803,761 | 6.80 | 正式引擎與授權，保留需要的檔案 |
| `3d-test/` | 12 | 206,365 | 0.21 | 當前 3D 測試及預覽所需；保留實際載入部分 |
| `docs/` | 13 | 136,776 | 0.14 | 開發文件候選，不影響主流程前先查引用 |
| 其餘根目錄/測試/工具/工作流程等 | 431 | 5,541,871 | 5.54 | 混合：JS/CSS 正式功能不可依目錄直接排除 |
| **合計** | **664** | **215,366,091** | **215.37** | |

**注意：** Git Trees API 的 `size` 是單一版本 blob 資料長度；隨 commit 變化，這份報告為基準快照。

## 2. 現階段保留／排除候選原則

### A. 已辨識應保留（但待正式發布清單機器驗證）

- 根頁 `index.html`、被其直接/間接載入的 `*.js`、`*.css`、正式圖像、正式 3D 測試中心與相關 GLB/引擎（若仍有使用）。
- `assets/backgrounds/` 的 32 張 WebP 圖：共 4.53 MB；對應原始 PNG 32 張共 80.07 MB。
- 正式音樂至少包含 `audio/assets/era-themes/{galaxy,universe,higher}-theme-loop.ogg` 及 `audio/assets/battle-themes/{normal,medium,high}-battle-loop.ogg`；`audio/audio-core.js` 可驗證這六條播放路徑。
- `audio/assets/common-sfx/` 中正式音效路徑須由 `audio-core.js` 及其他音訊程式**逐項解析**，不能把整個資料夾當成可刪。
- 帳號、雲端存檔、GM 管理、背景戰鬥、倍速、回顧及 3D 預覽等有延後載入的程式，玩家入口不常使用也不代表可以排除。

### B. 高信心「開發來源、不需玩家使用」**候選**（本批不排除任何檔案）

- `assets/backgrounds-source/`：32 個 PNG、80.07 MB。此資料夾**不在**目前 `resource-manifest.json` 的已列印路徑中；但 `backgroundpreload.js` 仍含來源字串，必須檢查完整含義後才能確認絕不執行期引用。
- `audio/assets/era-themes/higher-original.zip`：32.46 MB，原始封裝候選。
- `audio/assets/era-themes/higher-source.flac`：6.58 MB，音樂來源候選。
- `audio/assets/battle-themes/normal-original.wav`：8.47 MB，原始音效/音樂候選。
- `audio/assets/era-themes/galaxy-original.mp3`：6.28 MB，來源候選。
- `audio/assets/battle-themes/medium-original.mp3`：3.46 MB，來源候選。
- `audio/assets/common-sfx/heavy-hit/sci-fi-sfx.zip`：2.44 MB，來源封裝候選。
- `audio/assets/common-sfx/critical/independent_nu_ljudbank-hits_and_punches.7z`：1.68 MB，來源封裝候選。
- 其他 `*-original.*`、`*-source.*`、`*.zip`、`*.7z`、未引用的候選曲目及早期音效：**待第 2 階段依賴掃描，不能推測全部無用**。

### C. 需要調查，不能以副檔名判定

- `audio/assets/title_6.mp3`（9.41 MB）、`audio/assets/title_6-balanced.mp3`（8.44 MB）等早期音訊檔，是否仍透過其他正式路徑、舊版模式或測試入口引用。
- `audio/assets/common-sfx/` 106 個檔案，共 7.94 MB；其中正式五種音效和未用候選需區分。
- `tests/`、`.github/`、`scripts/`、文件及來源資產通常不需透過 Pages 提供，但正式依賴與現有 Pages 發布模式尚未全面確認。
- `resource-manifest.json` 是媒體快取系統的檔案指紋清單，並非正式發布白名單；裡面有資產名稱**不等於遊戲實際會播放或需要下載**。

## 3. 初步可節省容量及限制

- 如僅正式發布時排除整個 `assets/backgrounds-source/`（尚待驗證），則理論上可省 **80,071,583 bytes = 80.07 MB**，把現有 HEAD 邏輯檔案量從 215.37 MB 降到 **135.29 MB**。
- 音訊中仍有數十 MB 來源與候選，但不能在未完成靜態/動態依賴掃描前訂定安全排除清單。
- 「只發布運行檔」能降低 Pages artifact；**不會減少 GitHub main 及其 Git 歷史占用**；「按需下載」也不會自動降低發布 artifact。
- 第 27～40 批尚會新增真實 GLB、PBR 貼圖、LOD、怪物、場景與戰鬥特效，必須單獨留容量預算與瀏覽器載入預算。

## 4. 第 2 階段必須先達成的驗證門檻

1. 取得 GitHub Pages 目前實際發布來源設定（branch/root 或 Actions），並測量發行產物；不能推測 Pages 已有精簡機制。
2. 全域搜尋 HTML、JS、CSS、JSON、動態路徑、GM 延後載入、音效 manifest、Service Worker 和啟動畫面對每個候選資產的引用。
3. 建立 **白名單**＋依賴閉包＋缺檔 CI 檢查，無法證明不用的候選仍保留。
4. 輸出「原庫 HEAD bytes／正式 artifact bytes／首頁傳輸 bytes／媒體預載 bytes」四組獨立指標。
5. 第 3 階段先打包測試產物；**第 4 階段通過帳號雲端、文字／3D、GM、音訊、桌機與手機驗收後**才能切換真實 Pages 發布來源。

## 5. 本批驗收與操作界線

- 已完成：核實 main SHA、664 個 blob、215.37 MB、七類分類及大型來源檔案候選。
- 尚未完成：逐檔全量程式依賴掃描、實際 Pages artifact/Settings 查核、GitHub Actions 驗證及實機測試；不應在階段一聲稱「目前正式發布是 52 MB」或「可以直接移除音訊」。
- 未修改：正式 JS/CSS/HTML、背景、音樂、模型、Service Worker、玩家存檔、GitHub Pages 設定。**本階段只新增文件。**
