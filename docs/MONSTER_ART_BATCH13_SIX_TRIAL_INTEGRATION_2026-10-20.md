# 第13批六張怪物 Sprite 測試整合

## 範圍與基準

施工起點為 GitHub 當時最新 main `671f533d1d5c0b371b1088cdfe7b52df70fb852c`。單一分支 `batch13-six-monster-sprite-test`、單一 PR。使用者本次明確授權六圖 GM 實作，覆蓋舊規劃文件的「僅規劃」限制；不開始剩餘14張或609種正式怪物切換。

附件 `civilization-monsters-step3-six-test.zip` 實際可讀，ZIP CRC 與14個 SHA-256 清單項目全部通過。六張 WebP 原樣匯入既有路徑，512×512、RGBA、alpha 0..255、非空主體、alphaBounds 與清單完全一致；未裁切、拉伸、翻轉或重製素材。六張原圖與原始 README/hash 清單留存 `development/monster-art/batch13-six/`，不在 Pages 或智慧下載清單中。

## 登錄、動畫與定位

| ID | 名稱 | 共用攻擊模板 |
|---|---|---|
| hm-01 | 輕裝士兵 | short-thrust，短距離前移 |
| mech-02 | 重型機甲 | mechanical-strike，輕微機械後座／武器射擊 |
| ship-01 | 星際巡弋艦 | ranged-shot，艦砲與輕微後座 |
| beast-03 | 吞星獸 | pounce，短距離前撲 |
| core-01 | 防衛核心 | pulse，固定主體能量脈衝 |
| bio-02 | 生化母巢 | pulse，固定主體脈衝 |

`data/monsters/monster-assets.json` 是六圖登錄。`monster-sprites.mjs` 由該檔與既有609筆規劃映射確定產生；`plannedAssetId(identity)` 可找規劃圖片 ID，找不到回傳 null。全部 `formalBattleAllowed=false`、總開關 `formalBattleEnabled=false`。正式怪物 Renderer、數值、傷害、掉落、存檔、背景及極簡 owner 不變。

`MonsterActor` 共用動畫與可視範圍計算，使用現役 pose/animationController 的700ms時間取樣、受擊閃白與死亡淡出，依怪物類型提供有限位移與小型砲擊／脈衝，不含半月光環或大揮刀。無每怪獨立戰鬥流程、無新戰鬥 clock。

既有角色與動作測試中心新增「怪物測試」六選一／關閉、冷暖原色、80/100/130%倍率、待機／攻擊／受擊／死亡，以及雙向攻擊測試。保留三紀元角色、武器、方向、速度、六動作、缺圖回退、重載、最大化與原 GM 功能。怪物開啟時玩家固定左／右向、怪物右／原生左向；角色模式仍保留方向控制。可視邊界置中與預留動作空間，載入前即固定舞台尺寸，兩個測試血條及按鈕在舞台外。

## 資源與生命週期

怪物池獨立於玩家白名單，最多兩張512px解碼影像（2 MiB）、最多兩個進行中載入；SHA/bytes/尺寸驗證通過才可顯示。相同圖共用進行中工作與引用，零引用 LRU 淘汰會呼叫 bitmap.close。使用帶內容摘要 URL 的 force-cache 與既有 SW 按需媒體快取，素材加入資源指紋，但不擴大正式背景預載白名單。圖片落盤不代表解碼常駐。

切圖取消過期載入；隱藏頁面取消 RAF、清理怪物實例與池，恢復時重新授權並載入當前圖；GM 權限失效清空玩家與怪物，退出時 dispose 所有池、canvas、控制器、observer 與事件監聽。預覽以約30fps取樣並共用既有單一 RAF。診斷顯示實際 bytes、refs、pending、hits、loads、各圖片解碼狀態。

## 驗收與限制

- 素材驗證：`python3 tests/runtime/batch13-monster-assets.py`。
- 登錄／609規劃查詢：`python3 scripts/generate-monster-trial-registry.py --check`。
- 池／錯誤／取消／晚到解碼／固定母巢：`node --test tests/runtime/batch13-monster-pool.test.mjs`。
- 真實 GM 瀏覽器：`tests/runtime/batch13-monster-browser.cjs`，三 viewport 1365×900、390×844、844×390；六種動作 raster、逐35ms無邊界裁切、每viewport 180個 actor 生命週期、36次介面切換、最大倍率、故障恢復、權限撤銷、資料隔離。
- 既有 GM 三紀元／六動作／缺圖／最大化／權限與退出測試：`tests/equipment-gm/browser.cjs`。
- Pages 建置與發布排除、智慧下載／快取、Batch12正式owner保護及正式Renderer／跨模式回歸皆依現役測試執行。
- PR／Actions／正式 main 與 Pages 最終結果，以本批 PR 與同 SHA workflow 證據為準；未結束或未通過不得當成功。
- iPhone Safari 真機溫度、耗電、觸控、長時間流暢度與人工美術允收未執行。Chromium 手機 viewport 不等同真機驗收。
