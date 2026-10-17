# 《文明戰線》第 4-3 批：執行依賴阻擋與施工核對（未完成）

日期：2026-10-17。施工基準：`9f4719a878490624aa0aaa380bd4cb75be736414`（第 4-2 批）。本文件只記錄從實際分支檔案查出的阻擋，**不授權刪除執行檔、不宣稱第 4-3 批完成**。

## 現有依賴
- `3d-test/gm-battle-simulation.js` 的 `mount()` 仍動態 import `fixture-input.mjs`、`playback.mjs`、`t2b3-v1/renderer.mjs` 及 `contract.mjs`。載入失敗時才退回已發布 GM viewer，因此不能直接移除 B3 檔案並宣稱兩種環境等價。
- `scripts/stage-hybrid-preview.cjs` 以現有 `t2b3-v1/manifest.json` 選出精確 174 筆 B 資產、排除 374 筆非 B 資產，並核對固定集合的 SHA256 指紋。它額外明列共用 B3、fixtures、資料 owner、`assets/3d/asset-registry.json`、`rig-contract.json`、`refinement-source-evolution.json` 與 `original-asset-registry.source.txt`。在重算所有引用並以實際測試證明之前，不得刪改這些來源鎖或任意放寬數量及指紋斷言。
- `scripts/asset-registry.cjs` 對資產 SHA／bytes、source.path／source.sha256、53 骨架關節、LOD、socket、GLB 材質與相容性等仍做有效檢查。不得為刪 GLB 或 Blender 直接停用。
- `development/hybrid-comparison/t2b3-v1/source-version.cjs` 仍引用多代來源 evolution、`git show` 與正式 GM 來源核對。單純刪舊檔會破壞安全測試鏈。
- `tests/runtime/t4-preview-retirement.cjs`、`tests/runtime/t4-preview-retirement-browser.js` 等依賴尚在；`development/retired-formal-previews/` 目前不可整包刪除。

## 第 4-2 HEAD 追蹤檔案樹（GitHub recursive tree，truncated=false）
- 全庫：1,882 個追蹤檔案。
- `development/hybrid-comparison/t2b2-v1/` 586 檔／52,802,653 bytes。
- `development/hybrid-comparison/t2b3-v1/` 21 檔／832,314 bytes。
- `development/3d-source/characters/` 54 檔／40,901,755 bytes。
- `development/3d-source/equipment/` 51 檔／34,388,732 bytes。
- `assets/3d/` 19 檔／8,694,575 bytes。
- `development/retired-formal-previews/` 15 檔／287,395 bytes。
- `docs/evidence/` 207 檔／9,476,847 bytes。
- `development/art-candidates/` 已為 0 個追蹤檔。

## 未完成的第 4-3 批施工
1. 建立逐檔「引用者 → 通用安全斷言承接者 → 改造檔 → 可刪檔」矩陣，特別確認 B2/ B3 動態路徑及 fixture 在瀏覽器、GM、CI 中的用途。
2. 在獨立分支先完成真正可替代的 GM／B3 與 source SHA 去耦；保留正式執行的 Sprite/武器 WebP，不碰正式玩法、存檔和 Runtime。
3. 重新計算 manifest、release stage、registry 及 cache 引用；只在缺引用與故障回退測試成功後執行 Git D。
4. 新 HEAD 必須進行 Batch 2-4、正式 2.5D、GM、publish、資源完整性與必要瀏覽器回歸；不能用第 4-2 批成功紀錄代替。

## 本次安全結論
**沒有可據上述檔案就安全宣告無引用的 B3、GLB、Blender、source-version 大類。** 未取得實際完整測試及代用契約驗證前，不執行破壞性刪除。保留安全阻擋而非假稱零殘留。此分支不得合併 main。
