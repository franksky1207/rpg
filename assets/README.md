# 《文明戰線》素材管理規範

本目錄將背景素材明確分成兩個角色，避免原始大圖與正式網站資源混用。

## `backgrounds-source/`：原始製作素材

- 僅供美術保存、重新壓縮、重新裁切與日後再輸出。
- 目前保留原始 PNG，不是正式網頁 runtime 資源。
- HTML／CSS／玩家端 JavaScript 不得直接引用這個目錄。
- 不因 repo 整理直接刪除原圖；既有 Git history 也不會因刪除工作樹檔案而真正縮小。

## `backgrounds/`：正式部署素材

- 玩家實際下載的背景只從這個目錄取得。
- 正式格式固定為 WebP。
- 每個正式背景場景維持 `desktop.webp` 與 `mobile.webp` 配對。
- `backgrounds.css` 是正式背景引用 owner；`backgroundpreload.js` 只預載此目錄中的正式背景。

## Repo 體積政策

目前採取「保留 source + 部署 WebP」的非破壞式政策。原始 PNG 通常遠大於正式 WebP，因此未來若 source 數量大幅成長，再另案評估 Git LFS 或獨立素材 repo；那屬於 repository migration，不應和一般程式碼整理混在一起執行。

## 自動檢查

`tests/runtime/asset-integrity.js` 會在 Runtime Integrity CI 中驗證：

- 正式背景目錄只能部署 WebP。
- 每個正式場景具備 desktop/mobile 配對。
- `backgrounds.css` 不得引用 source 目錄，且所有正式背景引用都必須實際存在。
- HTML／CSS／玩家端 JavaScript 不得直接引用 `assets/backgrounds-source/`。
- 正式 WebP 總體積必須小於保留的 source 素材總體積。

這份規範只定義目前 main 的素材角色，不會改變任何遊戲畫面或背景美術內容。
