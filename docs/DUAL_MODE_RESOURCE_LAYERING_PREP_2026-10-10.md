# 《文明戰線》雙模式前置第 2 批：啟動依賴與資源分層交接

> 2026-10-10，根據 GitHub `main` 的 `index.html`、`scriptgrouploader.js`、`backgroundpreload.js`、`3d-test/formal-home.js`、`3d-test/test-center.js`、`scripts/generate-resource-manifest.py`、前次啟動稽核與雙模式第 1 批契約整理。**本批是依賴盤點與安全遷移方案，非已實作的模式別下載器**。不佔正式 40 批號。

## 1. main 現況（本次重新盤點）

- `index.html` 共有 **161 個一般同步 script**，以及 **97 個 `application/x-civilization-deferred` 宣告**；後者其中 **32 個 GM**。其餘宣告的 story/integrity 具體 owner/重分類（例如 `storyruntimeintegrity.js`）仍依正式 `scriptgrouploader.js`；**不得將 97 說成目前啟動全都執行**。
- `index.html` 在正式頁直接同步引用 `3d-test/runtime.js`、`3d-test/appearance-snapshot.js`、`3d-test/formal-home.js`：目前文字版仍下載這三支 3D 橋接 JS；**並不是**完整按文字/3D 模式分流。
- 本地 `vendor/babylonjs/7.54.3/babylon.js` 與 `3d-test/prototype-engine.js` 由正式 opt-in 預覽動態載入。正式頁 `formal-home.js` 會在 DOMContentLoaded 後預抓 versioned Babylon/scene bytes，並提供 `Civilization3DSharedAssetWarm()`；**預抓不是執行腳本、更不是建立 GPU 場景**。
- `scriptgrouploader.js` 在帳號解析後，僅對有授權的 GM 做 32 個 JS 模組快取驗證、ready 屏障，並可在啟動遮罩內額外預熱 GM 測試中心共用 3D JS bytes；一般玩家不等待這項 GM 工作。GM 權限不是靠 3D 模式識別，不能因選模式就啟用 GM。
- `backgroundpreload.js` 的 `CivilizationStartupCoordinator` 管理 DOM/render ready、當前關鍵背景與註冊啟動任務；畫面百分比是就緒任務比例，**不是下載位元組或每支 script 的百分比**。其背景延後載入政策不等於完整模式專用切割。
- `resource-manifest.json` 目前是部署資產逐檔 SHA-256 截短 24 hex 清單；生成器讀取 HTML 本地 JS/CSS、背景和 3D 部分資源，GM/3D 依 digest 版本化 URL。**不能視為跨檔相依快照的原子部署保證**；正式 GitHub Pages 需實際完成部署才可驗收。
- `3d-test/test-center.js` 是永久 GM 視覺測試中心，與 opt-in 正式預覽共用版本資源，開啟時按需載入 Babylon/runtime/scene，不可因日後文字模式不載 3D 而移除。

## 2. 模式別資源分類與依賴保護

| 層 | 內容 | 未來載入門檻 | 現階段決策 |
| --- | --- | --- | --- |
| L0 最小啟動與選擇 | HTML 最小入口、登入／工作階段與偏好讀取、首次模式選擇／錯誤重試 | 模式尚未決定前 | **目前未建立獨立 L0 入口**；第 17 批設計與實作；不能提前把 `supabaseauth.js` 等移動而破壞時序 |
| L1 共用正式核心 | 帳號權限、`state`、存檔／雲端、紀元、角色裝備、交易、戰鬥、結算、離線 | 選擇模式後載必要核心；單一正式 owner | 依 `index.html` 目前順序保留；必須逐符號解析讀/寫及初始化副作用後才能拆 |
| L2-T 文字完整 UI | 目前完整 HTML/CSS、各頁 DOM renderer、文字戰鬥與必要背景 | 選文字模式；不得下載不必要 GLB/貼圖/Babylon | **永久保留**既有介面；目前啟動頁直接載入部分 3D 橋接 JS，未隔離 |
| L2-3D 首屏 | 本地 Babylon、3D host/router、當前紀元的首屏最小場景／模型、UI | 選正式 3D 模式且身分/核心 ready | **尚未實作正式獨立路由**；不得把既有 formal-home DOM bridge 當正式 router |
| L3 3D 延後資產 | 其他紀元場景／角色裝備／副本／災厄／異宇宙／戰鬥 GLB、材質、動畫、音效 | 進入相應 route 或預測下一頁；不可阻塞首頁 | 第 19～39 批分段製作，版本化且失敗回退／取消舊請求／dispose |
| L4 GM 授權專用 | 32 GM JS、診斷／sandbox、永久 GM 3D 測試中心 | 僅帳號完成解析且既有 GM 授權成立 | 繼續與玩家模式正交；一般玩家不讀取／等待 GM 專層 |

## 3. 變更前的必要依賴核對與移動策略

1. 先從 `index.html` 建立每支 sync script 的精確位置、宣告／消費的全域符號、載入副作用（事件註冊、補丁式 wrapper、DOM 初始化、狀態變更），標明 L0/L1/L2-T/L2-3D/L3/L4；需兼顧其他檔案動態 `script()` 與 deferred GM/story/integrity。**本批僅給分類方案；尚未有每支檔案完整符號級證據**。
2. 第 17 批先在登入與模式決策前建立安全的 boot gate；有同帳號同裝置偏好時直接選擇，否則首次選擇；在舊模式完整可用的同時逐段拆開。未開放正式 3D 時只允許開發／GM 預覽。
3. 第一個可安全抽出的候選是**正式文字模式不需要執行的 3D 展示橋接**（`runtime.js`、`appearance-snapshot.js`、`formal-home.js`）；但必須先確認各正式頁的 `civilization3dHomeRouteRendered` hook 在未載入橋接時可安全 no-op，且舊文字介面 render、回顧、GM 快照不受影響。不可僅因檔名在 `3d-test/` 就直接移除。
4. 對仍需驗證的核心與文字 UI，採**逐小批遷移＋可回復的開關**，每移一次均跑原文字版完整核心操作與登入／GM／離線／銀河回顧／異宇宙回歸。切勿一次搬走 161 個同步 script。
5. 3D 模式首屏真正建立後，依模式調整 Coordinator ready barrier：必須等待當前模式必要核心及首屏 ready，非必要場景延後；GPU 只在正式渲染時建立。GM ready 仍只對 GM 必需，一般玩家不可受拖累。
6. manifest 隨資產 GLB/貼圖/動畫上線擴增，採 digest URL 與部署驗證，檢查 GitHub Pages 部署時序；如需強版本一致性，必須另做部署 release snapshot/pinning，不能僅依生成 hash 以為原子。

## 4. 必須驗證的測試矩陣（本批未執行瀏覽器/實機）

- **文字冷啟動／熱啟動**：一般帳號重整、舊帳號與首次使用、不下載 Babylon/GLB/動畫、所有文字 UI 功能可點、進度百分比及重試。
- **3D 開發預覽**：首開、再開、切頁、WebGL 不支援／context lost／網路錯誤、Canvas 與 GPU dispose、快取命中；正式完整 3D 模式未上線，不應對一般玩家提供空殼。
- **帳號偏好**：帳號 A/B 在同瀏覽器隔離、A 在不同裝置獨立、私密模式與清除儲存、首登選擇、設定切換安全保存後重新載入；模式不是正式遊戲進度。
- **正式遊戲回歸**：銀河回顧實際開戰／結算／重打、三紀元導航、異宇宙 200×5 正式映射、死亡贖回、交易、離線樣本、背景連戰／Fast Catch-up 與同一存檔一致性。
- **GM**：非 GM 不阻塞於 32 模組；GM 帳號就緒、測試中心顯示及快取、退出返回、不同帳號不能沿用授權、GM fixture 不回寫正式存檔。
- **效能**：DevTools network/hard reload 與 cache hit、不同模式實際下載 bytes、首屏可操作時間、手機直橫向與長時間 GPU，需標記 exact HEAD CI vs 真機數據。

## 5. 本批交付與後續

**前置第 2 批已完成的是** main 現狀盤點、分層與安全切分順序、回歸矩陣文件，**並未**完成符號級全 161 檔依賴圖、獨立 boot gate、分流下載或使用者選擇畫面；後者由第 17 批前的施工準備與第 17～18 批完成。不能將本檔視為已量測的效能改善。

**不得變更**：現有 `index.html` script 執行順序、啟動協調器、正式文字版、3D opt-in 預覽、GM ready、Save Schema 或任何交易／戰鬥。後續提交程式修改時須更新 cache-bust 並採 exact-HEAD CI / 瀏覽器回歸。

接下來原定 **3D 第 16 批**，之後第 17 批依本檔落實模式選擇與資源分流；40 批總數不增加。
