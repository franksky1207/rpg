# PR #112 後兩批整合｜第二批資源查核（2026-10-26）

## 範圍與唯一基準
本次第二批涵蓋原編號 6、7、9、10。基準是正式 main `c9367c2e101cfa1874ac740d0317db79f87245e6`；兩批共同整合分支 `integrate/post112-maintenance-two-batches-20261026`。資源檢查採保留安全的必要資源為原則，**不是以減少 101 為目標**。

## 發現與決策

### 6｜舊 3D GLB
- `resource-manifest.json` 中仍有 `assets/3d/characters/player-v1/` 三個 GLB、`assets/3d/equipment/ancient-ruins-v1/` 十五個 GLB 以及 `assets/3d/asset-registry.json`。
- `3d-test/character-assets.js` 會讀取 `assets/3d/asset-registry.json`，並存在 GLB 的 Babylon 容器載入路徑；因此不得以「目前使用 2.5D」為由認定所有 GLB 均已退役。
- 18 個 GLB **完全不在目前的 101 個背景預載資源內**；不浪費該批智慧下載額度。保持 GLB 與 registry 不變。

### 7｜怪物舊版繪製模組
- `monster-body-v2.mjs` 仍 import `monster-body-v1.mjs`；`monster-appearance.mjs` 仍 import v2、核准外觀與靜態效果；`monster-appearance-manager.mjs` 與 `monstercodeximage.mjs` 使用共用外觀管線。
- 這些是正式戰鬥、圖鑑、GM 共用外觀路徑的實際依賴；v1 檔名不代表已退役。不刪除七個外觀模組。

### 9｜歷史 CI／GM JSON
- `docs/ci/baseline-20261025.json`（約 30,836 字元）保存前期 CI 成本基準。
- `docs/evidence/gm-preview-20261025.json`（約 64,606 字元）保存 GM 多視窗／動作驗收證據，資料註明當時 realIPhone=false。
- 兩者屬歷史證據，不能僅憑檔案較大而判定為不需要；檔案位於 docs 亦不是 101 個預載成員。本批不刪除或移動歷史證據，以免破壞稽核可追溯性。

### 10｜101 個背景下載資源
- 實際白名單在 `resource-cache-sw.js` 的 `shouldPreload()`；`resource-manifest.json` 包含 469 個受管理檔案，不等於全部預下載。
- 101 個預載精確分組：怪物 39、背景 32、玩家姿態／攻擊圖集 6、音樂及音效 17、核准外觀模組 7。
- 對照 GitHub 目前 main 的完整 tree：**101／101 皆存在**，469／469 manifest 路徑皆存在，101 個不包含 GLB。
- 不移除或增加任何下載資源，保持正式白名單、資源 digest、cache generation 和 fail-open 行為不變。
- 新增 `tests/runtime/resource-preload-closure.test.cjs`，直接從正式 Service Worker 原始程式擷取與執行真實 `shouldPreload()`、檢查 Manifest 完整性、101 個資源分類、禁止 GM／GLB 誤預載，以及外觀與 GLB 活躍依賴。未來變更時可有效抓出預載回歸。

## 修改範圍與驗收
- 第二批僅新增一個測試檔與本記錄；不動正式遊戲、圖片、音效、快取、Manifest、CSS、戰鬥數值或存檔。
- 已以連線 GitHub main tree + 真實 Service Worker 規則交叉核對 101 個預載與 469 個 manifest 路徑，沒有遺漏；測試程式通過 JavaScript 語法檢查。
- 此處不宣稱 Node 測試、Chromium 或 Actions 已成功：完整整合驗收交由兩批同一 PR 的既有工作流程，未經正式 CI 不合併／發布。
