# 第20批整合施工與驗收

狀態：功能已整合於 `batch20/integration`；尚待必要 Actions、單一 PR 合併及正式 Pages 驗收，**尚未封箱／上線**。

基準：GitHub `main` `f0990025`。規格以正式規劃末尾「第20批補充定案｜2026-10-24」及本次使用者完整施工授權為準。第19-4批未納入本次工作。

## 修改及安全界線

- 移除銀河地圖、宇宙主線 Boss、高維十王、銀河災厄、宇宙災厄五類玩家專用無收益回顧戰入口與 UI 流程；刪除其獨立選擇、結果、state 及冒險回顧鎖。舊 handler 不再匯出；世界二／三 combat 舊 `review:true` 一律拒絕，高維 review snapshot 不再建立。
- 保留劇情各紀元回顧／重播、轉生後正式重征服、GM 沙盒、正常主線重複收益、副本與異宇宙。既有 settlement 的防污染判定及歷史版本診斷不作為玩家入口。
- 銀河印記 Lv.10 在 UI、run begin、headless combat、正式 battle 皆拒絕；未滿級仍保留單場及連續討伐。首次印記取得仍為 acquired=true／Lv.0，數值 owner 不變。
- 宇宙階段完成後在正式權限、啟動、UI、battle 層阻擋無收益戰鬥。原完成判準與 30 次完整擊殺升級規則不變；GM ignoreUnlock 沙盒能力保留，明確標為 fixture，不登錄圖鑑。
- 銀河頁依序顯示十印記養成概況、未滿級印記與未解鎖條件、可討伐災厄、已完成收合資訊。宇宙頁顯示文明等級／正式倍率、可討伐災厄、銀河十印記收合區及已完成文明階段收合區。高維第8格「文明傳承」只讀，沿 `markFormalSnapshot`／`markEffectDescription`／`civilizationCombatDamageMultiplier` 顯示當下有效狀態。
- 首頁仍10格；戰線紀錄加入劇情／圖鑑兩頁籤。只修改本批相關說明，驗證後載入 extension 後的三紀元最終文字。

## 圖鑑身份與來源

以 `data/monsters/monster-mappings.json` 為正式來源，`scripts/generate-monster-codex.py --check` 可重現同步資料，沒有新增美術或公式。

| 分類 | 身份數 |
|---|---:|
| 銀河主線 | 500 |
| 宇宙主線 | 100 |
| 高維十王 | 10 |
| 銀河／宇宙文明災厄 | 10／10 |
| 特殊怪 | 9 |
| 懸賞 | 30 |
| 競技場 | 6 |
| 虛空幻境 | 20 |
| 高維競技投影 | 10 |
| 異宇宙 | 1000 |
| 合計 | **1705** |

共享原型不合併身份。高維投影依正式命名及玩法與主線十王分開；鏡像沿玩家分身機制，不虛造怪圖。

`combatcore.js` 僅增加正式遭遇登錄呼叫，不改計算：經正式 owner、world、mode、location、敵人名稱及身份映射驗證；GM／fixture／預覽／review 排除。同步登錄不依動畫、勝敗或事件訂閱佇列；背景／Fast Catch-up 的真正逐敵戰鬥也走相同 core。離線統計樣本沒有此呼叫，不推測遇敵。

`monsterCodex={version:1,encountered:[canonicalId]}` 是 optional additive root；沿現役 Save Schema18 明定 `additive-optional-field` 不升版政策。newState、canonical migration、normalization 均驗證／去重；Future Schema guard 不變；轉生 reset 不涉及此 root。

舊檔沒有圖鑑紀錄時保守維持未知。等級、最高關卡及可被正式重征服向下回填或 GM 調整的 boss flags 不作個別遭遇證明；沒有可靠 provenance 就不補造歷史。JSON 匯入／匯出沿現行正式資料 owner，不新增已退休的玩家檔案匯出入口。雲端完整 clone／canonical migration 保留此 root。

分類每頁20筆，只有點選已遭遇身份才載入一張靜態圖片；使用現有 SHA 驗證與 bounded monster pool，完成後釋放 lease／解碼快取。未知不取圖，讀圖不呼叫正式戰鬥；圖片失敗可重新開啟恢復。保留現役智慧下載／資源快取與原圖片大小政策。

## 已實際執行的本機檢查

- JavaScript structural integrity、newState／save owner、共用災厄 terminal Fast Catch-up 契約通過。
- `batch20-codex-browser.cjs`：1735 檢查通過；1705逐身份、fixture排除、headless戰敗解鎖、去重、舊檔不虛構、完成後兩紀元UI／battle拒絕、三紀元首頁10格；另驗證真實靜態圖片 alpha、失敗回退／恢復與讀圖不新增登錄。
- `batch20-save-guide-browser.cjs`：22檢查通過；local save、canonical migration、正式轉生 reset、實際印記清除、optional schema policy、future schema拒絕、三紀元最終 guide、初獲Lv.0／下次Lv.1；另驗文明Lv.0／1／10的原現身提示內容及確認關閉保持原樣。
- `batch20-cloud-browser.cjs`：以原 `civilizationCloudSave` owner 加記憶體 transport，upload、GM合法 import validation、download 保留圖鑑均通過。**未以真帳號寫入雲端**。
- 既有 native live bosses 5入口、live dungeons 兩紀元8入口通過；宇宙災厄測試 fixture 由「已完成Lv.1」改成「未完成Lv.0」，保留原正常挑戰及渲染斷言。
- Browser runtime smoke 通過。現有舊版診斷 warning 不等於正式 hard gate；未改動無關舊診斷以消音。
- `batch20-notice-protection.cjs` 對基準 SHA 逐位元比較災厄解鎖／現身提示、核心確認、通知 owner、音訊／樣式及正式數值／轉生 owner；formal combat core 除登錄呼叫外逐位元一致。
- Publish dry-run：新模組及靜態圖片依賴可發布，missingRefs=0；正式 Pages 尚待合併後驗收。

## CI 契約相容修復

PR [#90](https://github.com/franksky1207/rpg/pull/90) 首輪 `0a08a3c0` 的 Functional／Runtime／GM terminology 來源鎖拒絕本批合法差異；正式裝備測試仍要求已退場的高維回顧 handler。這些失敗未視為通過。新增獨立 `batch20-approved-runtime.json` 與 reader，逐檔鎖住本批前後 SHA，串接未修改的歷史來源鎖；舊檔及斷言全保留，不使用 wildcard 或無條件放行。必要測試改驗退場 handler／runtime／音訊不可建立；原高維回顧視覺測試改驗正式遭遇後的只讀圖鑑靜態圖片、完整 state／combat token 不變及零額外引擎。正式技能、數值與圖片大小不變。GM 開發 fixture reader 僅新增精確 live SHA＋移除唯一登錄行後還原原 SHA 的雙重驗證；原樣本、五種測試情境與模擬邏輯不變，桌機原生 GM 五情境重新通過。AU 舊版 HTML query 契約容許本批額外 cache token，但原 token 仍逐項檢查；新的 HTML before/after guard 繼續驗證實際版本變更。

熱路徑用 WeakMap 管理每份合法圖鑑 root 的去重 Set，避免 Fast Catch-up 每場重新排序／複製全部已遭遇身份。合成 state／測試 RNG／GM mark overrides 會標記 fixture，避免診斷測試補登正式圖鑑。

本機原生音訊回歸另通過46案例（隔離登入SDK替身、原生media playing事件、單一音軌及雲端阻擋）；正常三紀元音訊 owner 檢查改為實際的 battlepipeline／secondworldmainline／thirdworldrun，避免誤把已刪除的 UI 回顧音訊當成正式主線 owner。音訊實作本身完全未修改。必要 Runtime 現在直接執行第20批來源及提示保護回歸。

補強提示相依保護：status 的原 unlock 快照維持不變供現身提示使用；正式 canChallenge／啟動／結果UI各自阻擋已完成階段，避免完成後阻擋改變任何舊提示的判定輸入。

## 發布紀錄（待補）

PR、功能提交 SHA、合併 SHA、必要 Actions URL 與 Pages 結果在實際完成後補記，不能把本機測試當作正式上線。

## 人工待驗證

iPhone Safari 真機長時間記憶體、流暢度、溫度與耗電未測；真帳號雲端往返未測。瀏覽器手機 viewport 與記憶體 transport 不代表以上人工項目通過。
