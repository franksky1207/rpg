# 《文明戰線》發布容量優化・第 4 階段全面驗收與修復

## 真實基準與安全界線

- 承接 main：`f4a4e13662f2ac804ba4402ccdf31796d1876f3d`。已查原始碼、Actions 與 Pages API；後續提交及最終 CI 結果列於本次驗收回報。
- Pages API 回傳 `build_type=legacy`、`source.branch=main`、`source.path=/`、`https_enforced=true`；本次不 PATCH Pages、不呼叫 deploy-pages、不切換發布來源。修正提交 main 後既有 branch-root 發布仍會依原流程更新，精簡成品只是驗收 artifact。
- 原始 PNG、音訊母檔、壓縮包與未選候選全部保留在 main。沒有更動戰鬥／成長／裝備公式、紀元規則、玩家／雲端資料或 GM 設定。

## 真正根因及修復

| 項目 | 實際證據 | 修復 |
|---|---|---|
| Stage 4 Release Gate | run 38105955126：`index.html3d-test/mode-foundation.js` 載入失敗 | 以 URL API 從入口解析目錄，再等真正的 GM test-center 初始化；保留模式／帳號隔離斷言 |
| GM 3D Browser | run 38105949262：appearance-error 發送後立即讀 DOM 的斷言失敗 | 等待 postMessage receiver 完成，再驗證正式來源失敗提示及狀態；場景按鈕限 `#caseList` 並精確匹配 |
| Galaxy 3D Browser | job 114291927899：lazy runtime 尚未載入就呼叫 `.create` | 透過正式首頁預覽 owner 按需載入、關閉，再檢查相機控制；不提前改玩家文字啟動 |
| 音訊 regression | 測試仍要求已取消的 UI click 類別及 GM 選項 | 改驗證取消狀態，同時保留素材來源、九個戰鬥 owner、GM 隔離、50% 音量及場景接線斷言 |
| 快取 behavior | Node URL 沒有 `.url`、synthetic Response 是 `default` | 測試替身支援 URL.href 與真正 basic response/clone 語意；重要完整性檢查保留 |
| Range | SW 正規式把數字寫成字面反斜線 | 正確解析數字與 suffix/open-ended ranges，新增 206、Content-Range、bytes 及免網路回歸 |
| 快取結構測試 | 舊測試要求已取消的 message status 與過期 client token | 改驗證實際 Cache Storage Blob 容量與現行 prefetch-fix1 引用；不放寬行為斷言 |
| 成品指紋／容量 | 舊流程沿用來源 hash，savedBytes 沒包含 manifest 大小變動 | 從輸出成品重新算所有 JS/CSS/媒體 hash，walk 真實產物算 bytes、檔數與節省量 |

另已修正 GM preload 以 HTML 現行 33 個模組清單核對載入及暖快取；轉生倍速測試改驗證現行 data-player-combat-speed 控制；災厄與 Batch 1 測試同步 main 已有的 cache token。JS 與 save-writer 掃描排除生成成品，避免把第二份未提交網站誤判為新的正式 owner。

Script Group Loader 的 v16、共用外觀來源 fixed-string 修正已存在且結構檢查通過；沒有重新覆寫。

## 發布成品與依賴檢查

- `scripts/publish-assets.cjs` 是 audit/build 共用政策。HTML src/href/data-src、CSS url、JS 完整檔名字面引用會核對；候選被正式程式引用就保留，禁止按音訊數量盲目刪除其他依賴。
- `audio/audio-core.js` 是正式選曲及五類隨機池來源；現行六首音樂、十一個音效＝十七 OGG。點擊音效、來源音檔及 manifests 開發資料不發布；作者／授權／來源資訊仍在正式 audio core，Babylon LICENSE/SOURCE 保留。
- `scripts/build-publish-dry-run.cjs` 只重建有識別標記的 `.publish-stage*` 目錄，不接受 source/tests/vendor 等路徑，不覆寫未知目錄。成品與 JSON 由 gitignore 排除，絕不提交第二份完整遊戲來源。
- `resource-manifest.json` 原庫保留開發素材指紋用途；成品 manifest 只列實際成品的 current bytes。JS/CSS 仍不進 SW 持久 cache-first；worker 的 updateViaCache=none 保留。
- Stage 2/3/4 改為正式資源／程式／成品政策變更均會觸發。Stage 3/4 上傳可下載的網站候選 artifact，不是 Pages 發布。Stage 4 上傳容量及瀏覽器診斷報告。

## 實際容量（十進位 MB）

以下以最終提交前／CI 報告更新，皆是實際檔案大小加總：

- 原始 main 工作樹追蹤 blob 邏輯容量：**215425605 bytes**。
- 精簡成品：**27574144 bytes**，**360 個檔案**。
- 實際節省：**187851461 bytes**；排除原始來源／開發檔 **319 個**。
- 正式媒體共 49 個：32 WebP ＋17 OGG；實際快取總量 **16,575,038 bytes**。
- 這不是 Git 歷史、git pack、壓縮 ZIP 大小或既有 Pages 發布 artifact 大小。既有 Pages 尚未使用此成品，不能宣稱正式網站已縮小。
- 首次傳輸由 Chromium CDP loadingFinished 真實累積，包含當次頁面在就緒前完成的回應；值與瀏覽器/時間有關，見 `publish-stage4-browser-report.json`，不冒充全遊戲下載量。

## 自動化證據及重跑

在 checkout 執行：

```sh
node tests/runtime/publish-build-regression.cjs
node scripts/publish-asset-audit.cjs --json > publish-asset-audit.json
node scripts/build-publish-dry-run.cjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory .publish-stage3
```

另一個 shell，安裝 CI 的 Playwright 1.55.0/Chromium 後：

```sh
export RUNTIME_SMOKE_URL=http://127.0.0.1:4173/index.html
export SMOKE_URL=$RUNTIME_SMOKE_URL
node tests/runtime/browser-smoke.js
node tests/runtime/startup-readiness-browser.js
node tests/runtime/gm-3d-test-center-browser.js
node tests/runtime/3d-mode-browser-regression.js
node tests/runtime/save-load-pipeline-integrity.js
node tests/runtime/galaxy-3d-button-browser.js
node tests/runtime/publish-candidate-browser.js
```

- 成品 browser test 已實際通過：所有檔案 200 且 bytes/hash 完全相符、17 個音檔 metadata 解碼、桌機及手機尺寸的正式設定頁、49 個實際 SW cache entries、fingerprinted audio 的 206 Range、清除後零筆及存檔／偏好 sentinel 不變。
- HTTP localhost 手動註冊真 worker 以測受控制的後續訪問；正式 client 僅在 HTTPS 自動啟用。沒有停用 TLS、音檔驗證或重要斷言。
- 本機使用已安裝 Chromium 154，CI 使用 Playwright 固定 Chromium；兩者結果分別回報。完整 Runtime／Story 回歸及 GitHub exact-head 結果見此次最終回報，不能用歷史綠燈替代。

## 必須由使用者確認的驗收清單

1. **隔離帳號／雲端**：使用測試帳號開候選網站 → 設定 → 帳號管理，登入／登出；存檔管理用無正式進度的測試資料上傳與下載。核對異帳號上傳阻擋、下載取消／覆蓋確認、重新登入與離線計時起點。不得使用正式玩家資料做覆蓋或刪除測試。
2. **真手機與 WebGL**：Android Chrome、iPhone Safari 開候選網站，檢查首次／再訪、橫直轉向；進 GM → 3D 視覺測試中心，切三紀元角色／裝備、星圖、災厄／異宇宙，最大化／還原與關閉；預期控制不超出畫面、資料與文字版一致、關閉無卡住、WebGL 失敗有回退。長時間 GPU、電量及儲存配額不能由手機 viewport 自動測試取代。
3. **真人聲音**：三紀元主畫面及普通／中等／高等戰鬥試聽三＋三首曲目，觸發五種戰鬥音效、連戰停止／結算、切頁與背景；預期無 UI 點擊聲、無疊播／斷音／突變音量。設定改音量開關後重新開頁，確認偏好保留。
4. **真機遊戲回歸**：測試資料在文字模式走主線／副本／災厄／三紀元及異宇宙、回顧、離線收益、背景連戰、玩家 1×/1.5× 與 GM 2×；確認顯示、進度與既有正式規則一致。設定 → 本機資源管理等背景下載後檢查容量，清除資源不應清角色、帳號、GM 或聲音偏好。

## 切換與回退仍未授權

全部自動化、隔離帳號、真機與聽感驗收完成後，才能另行請使用者確認 Pages source 切換。切換前保存當時 main SHA、legacy main:/ 設定及原網站清單；若切換有異常恢復原 source/版本。這次不做切換。
