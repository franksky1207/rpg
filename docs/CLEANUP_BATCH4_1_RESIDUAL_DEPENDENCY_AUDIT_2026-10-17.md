# 《文明戰線》第 4-1 批：剩餘歷史美術逐類盤點（只讀基準）

日期：2026-10-17。基準：第 3-4 批驗收提交 `8370a2a3c737b38151bdc556af3f0eece912257f`。本批**不刪除任何檔案、不改正式 Runtime、不部署或合併 main**。清單與判斷須在第 4-2 批取得更新的 Git tree 後重新核對。

## 1. 最新施工檔案樹

在第 3-4 批 SHA 的 GitHub recursive tree 直接讀得 **2,104 個追蹤檔案**、**388,556,280 bytes**；`truncated=false`。原 `main` SHA 為 `5bfb00a44fd18263e3fe79581255871024f4396c`，尚未合併施工成果。第 3 批累計已實際刪除 2,454 個舊美術／證據檔案。

第 4-1 批新增 `scripts/cleanup-batch4-1-audit.cjs`：從**實際 Git HEAD tracked tree** 取得路徑、大小及 Git blob SHA，依 B3 現存 manifest 的 `files`／`vendor` 與分類產生 `cleanup-batch4-1-inventory.json`；分類是**保守審核狀態，不是自動刪檔授權**。CI 驗收後產物供第 4-2 批使用，不留在正式 Pages。

## 2. 遺留大類（可重現的實際數量）

| 目前路徑 | 檔案 | bytes | 第 4-2 批狀態 |
|---|---:|---:|---|
| `development/hybrid-comparison/t2b2-v1/` | 586 | 52,802,653 | **依賴門檻**：B3 的 174 項固定 B 請求及 manifest 登錄資產不可直接刪；其他仍應逐項核對來源測試／SHA／GM 的動態載入 |
| `development/hybrid-comparison/t2b3-v1/` | 21 | 832,314 | **依賴門檻**：renderer、native、contract、manifest／source-version 仍直接由 GM 或 CI 引用 |
| `development/3d-source/characters/` | 54 | 40,901,755 | **依賴門檻**：玩家來源圖及 Blender 資源要核對 GLB／Sprite 驗證與 Git SHA 契約後再退役 |
| `development/3d-source/equipment/` | 51 | 34,388,732 | **依賴門檻**：G007 rig、來源 evolution、fixture、建模資料與目前權威測試交錯；不可整包移除 |
| `assets/3d/` | 19 | 8,694,575 | **執行/驗證依賴門檻**：註冊 GLB 與 `asset-registry.json` 保留到正式發布及 GM 驗證完成脫鉤 |
| `development/art-candidates/` | 12 | 3,407,229 | **候選清理**：沒有列入目前 B3 manifest；仍需掃描腳本與測試引用再決定 |
| `development/retired-formal-previews/` | 15 | 287,395 | **歷史鎖審查**：目前 T4 退役來源完整性測試仍直接使用，不可先刪 |
| `docs/evidence/` | 420 | 19,243,536 | **候選清理**：舊證據仍散落多個領域，必須區分正式 runtime 和純歷史藝術/CI 證據 |

補充：`assets/backgrounds-source/` 32 檔／80,071,583 bytes、`audio/assets/` 141 檔／118,076,105 bytes 屬現行場景／音訊資產來源，本次**不可因容量大就列為舊美術刪除項**。

## 3. 已確認的關鍵依賴（需要先拆除而非直接刪）

1. `3d-test/gm-battle-simulation.js` 仍動態載入 `development/hybrid-comparison/t2b3-v1/renderer.mjs` 與 `contract.mjs`。GM B 尚未完全去依賴，因此 B3 runtime 不可直接刪除。
2. `scripts/stage-hybrid-preview.cjs` 仍使用 B3 `manifest.json`、其 `vendor`、174 個固定 B 路徑與 GM 共用程式及原來源完整性資料；刪任一路徑前須更新正確的 stage 與等效驗證。
3. `scripts/publish-assets.cjs` 與 `scripts/asset-registry.cjs` 仍維護 `assets/3d/` 登錄及 SHA；不得靠停用驗證器來刪模型。
4. `development/hybrid-comparison/t2b3-v1/source-version.cjs` 在退役史料及 GM、G007 原來源 SHA 上執行完整性查核；`tests/runtime/t4-preview-retirement.cjs` 等測試會直接呼叫。
5. 現行正式 210 套／1,050 槽裝備身份 owner 不依賴已刪的舊概念圖，因此正式身份資料應繼續保護。已在正式發布／GM 使用的 G005／G007／G018 Sprite WebP 維持保留。

## 4. 第 4-2 批優先序與不可逾越界線

先移除**證明無引用**的 art-candidates、純歷史比對 fixture、舊視覺 evidence／腳本，再逐步減小 B3 保留閉包；對仍由上述動態載入、SHA、測試、註冊檔保護的 GLB／Blender，僅在實際驗證等效替代後刪。不能直接用 `truncated=false` 的 tree 作推斷「未被任何人使用」。同步處理指向已刪檔的無效檢查與文件，但保留原有效安全斷言。

**目前不滿足「全庫零殘留」**：很多舊 3D 來源和歷史比較程式仍在施工分支，且有具體被引用的模組。第 4-1 批的產物是供逐檔施工的待確認清單，而非宣告可一鍵刪除的清單。

## 5. 後續驗收

- 本批 Actions 必須在**最新施工 SHA** 重建 tracked inventory 並輸出檔案清單供下載；不可引用先前 SHA 的綠燈。
- 正式玩法 owner 與存檔不可修改；現有第 2-4 批整合回歸、GM／正式戰鬥驗證需保持。
- 缺少 iPhone 真機、實際登入/雲端帳號的驗證，必須標為未測。
