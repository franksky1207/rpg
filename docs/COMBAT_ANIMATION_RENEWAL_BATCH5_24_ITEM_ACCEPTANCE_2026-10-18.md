# 新版第 5 批：三紀元造型技術契約與集中戰鬥動畫設定

基準 main：`e7947f9b7bd949ddfa0d924488f59c6ca3e6a608`。本批固定 24 項，僅整合技術接線、既有資源盤點、設定及技術規格；**不製作任何美術**。

## 固定範圍、證據與禁止變更

A 01–06：銀河／宇宙／高維各一個未發布外觀 ID。以 `3d-test/era-appearance-contract.js` 純讀取契約區分正式紀元（1/2/3）、已穿戴裝備來源紀元及獨立敵人身份。高維裝備混穿後回銀河仍採高維造型；宇宙裝備高於銀河；沒有已證明的裝備來源不可用裝備名稱猜測。此映射不讀寫角色資料，不增加 210 套／1,050 槽的美術製作、不變更正式裝備 ID 或數值。**未來三套造型仍未有獲准發布的素材**，不得用 G005/G007/G018 舊造型冒充新造型，也不在缺乏裝備身分欄位時猜測已穿戴裝備來源。

B 07–12：`mode-foundation.js` 退役舊完整 3D 先行模式選單、把設定頁命名改為「戰鬥動畫」，以 `civilization-war-combat-animation-v1:<帳號或本機>` 保存開關，預設沿用原開啟狀態，不更動 Save Schema 17。設定頁唯一控制入口；`t3b-formal-entry.js` 取消每場浮動按鈕，以同一偏好決定文字呈現／動畫。改動後發出事件以中止現有 Renderer，保留下一個有效正式事件的重建機會；不修改戰鬥事件、HP、時間與結算。舊 `presentation-mode-v1` 僅保留相容讀取及阻止未發布 3D 功能啟用，不再向玩家展示無法使用的 3D 按鈕。

C 13–17：原 `formal-player-sprites.js` 的 G005/G007/G018、`asset-registry.json` 的 GLB 及 Babylon decoder、正式 `t3b-formal-*` 與 GM `gm-battle-simulation.js` 均維持獨立現役資料來源。未核准三套素材前不改 Registry、不刪現役 GM 測試。正式架構已有 idle／attack／hit／dodge／return／defeat 契約；前向突刺仍以現役動畫規則為準。

D 18–20：敵人、場景均維持原有映射；缺檔、WebGL 不可用、取消、隱藏分頁安全回退，renderer/RAF/observer/計時器清理由既有 owner 負責。本批不修改背景戰鬥或低效能畫質的正式計算。

E 21–22（**只定規格，留美術階段**）：未來三套美術以單一紀元身份發布，各自需要完整角色、待機／攻擊／受擊／閃避／回位／死亡、3/4 視角、手機小畫面可辨識、LOD、資產 SHA、授權、位元組數、fallback 及 GM 對照測試。任何 GLB/WebP 發布須另外取得素材核准並驗收 registry/manifest，不能引用已刪 G001–G095 概念圖。

F 23–24：原 Batch1 12、Batch2 13、Batch3 16、Batch4 19 的現役回歸不可降標；追加 Batch5 固定測試、正式 Battle/GM、Runtime、Publish/Pages、HTML cache guard、歷史清理與資源清單測試。最新分支同 SHA Actions 全綠，合併 main 後重新確認同 SHA 所有必要 Actions 和 Pages，才可正式封箱。

## 規劃風險及測試界線

外觀來源推導使用明確的裝備 epoch 欄位；正式遊戲若無一致的 epoch 欄位，本批不得擅自寫入 Save Schema 或對玩家資產憑名稱推測。現役 Renderer 使用三套已核准舊 Sprite 測試資產是暫行現況，不等於新的三紀元美術已接入。本批以技術契約封箱、不能宣稱三套新造型已完成。iPhone 真機 FPS、發熱、熱節流與長時間異宇宙實測，延至第 6 批封箱後另案。


## 本批施工後驗收（分支階段，主線封箱另依合併 SHA）

### 一、修改內容
- 重新整理舊 `3d-test/mode-foundation.js`：登錄玩家不再看到早已取消的完整 3D 選擇彈窗；設定區名稱改為「戰鬥動畫」，唯一控制位置在設定頁，設定儲存於裝置 localStorage 的帳號專屬鍵，預設開啟。
- `3d-test/t3b-formal-entry.js` 移除戰鬥內每場開關，改讀單一動畫偏好。改變偏好時通知正式角色呈現層中止舊渲染並清快取，極簡／背景 owner 不變。
- 新 `3d-test/era-appearance-contract.js`：三紀元 read-only resolver，包括高維裝備轉生持續顯示高維身份、混穿優先權、敵人隔離、未核准美術不宣稱已發布。未綁定尚未完成的三套圖，因此現役 Sprite 仍可由現有公開授權資源承接；未建立新套裝視覺資產。
- 更新 `index.html` 的精確 cache key／新契約載入，兩個歷史 guard 只明列批准的差異並維持原有來源逐字保護。
- 更新模式瀏覽器回歸及正式 Battle 缺材／生命週期瀏覽器測試，以設定頁偏好代替被移除的戰鬥按鈕。加入 Batch5 專用 GitHub Actions。

### 二、程式自我檢查
- `Batch 5 Era Appearance and Animation Settings` 在分支 HEAD `4b8d5c580db5381bda666127ddea37ff25438675`：run [39083435244](https://github.com/franksky1207/rpg/actions/runs/39083435244) 與 [39083437933](https://github.com/franksky1207/rpg/actions/runs/39083437933) success。涵蓋 JS syntax、外觀 read-only、三紀元混穿／高維轉生、設定持久化與帳號隔離、舊 HTML 與清理 guard、Renderer controller、資源清單、桌機／手機戰鬥定位。
- 原始 `210 套／1,050 槽` 正式資料來源與 `Save Schema 17` 未被修改，未增加美術資產，未修改 gameplay、背景／離線結算與音效。
- 24 項為整合施工＋盤點＋預留美術規格的固定範圍，不代表 24 項都必須改寫程式。新外觀素材未獲准、美術製作與真機熱驗仍屬後續項目。

### 三、GitHub Actions 與實機界線
- `Equipment 2.5D GM Integration` [39083437948](https://github.com/franksky1207/rpg/actions/runs/39083437948)：success。
- `Equipment 2.5D Formal Battle` [39083437918](https://github.com/franksky1207/rpg/actions/runs/39083437918)：success。最初驗收在舊測試要求被退役的場內切換鈕時失敗；修正既有測試改用正式設定 API，仍驗證 Canvas/資源清理與結算，沒有停用測試。
- 所有測試均為 GitHub Node/Chromium（包含手機 viewport 模擬），**未進行 iPhone 真機發熱/FPS、真帳號雲端寫入或新美術人工核准**。不能將其當成完成。
- 正式 main 的 Runtime、正式 Battle、GM、Publish/Pages、歷史 guard 將在 PR 合併後以實際新 SHA 重新驗收，不使用舊 SHA 綠燈冒充。

### 四、提交、已知限制與封箱門檻
- 施工分支：`feat/combat-renewal-batch5-integrated-20261018`，PR [#32](https://github.com/franksky1207/rpg/pull/32)。
- 高維轉生的外觀優先權規格由純契約保護；現役裝備資料不一定完整帶 `epoch` 欄位，故此批**不宣稱新三紀元外觀已在所有真實玩家存檔上實際出圖**。缺少身份來源則拒絕猜測，等三套美術核准後再由正式裝備 owner 完整接入。
- 只有最新提交的同 SHA 必要 Actions 全綠、PR 合併且正式 main Actions 和 Pages 最終成功，才可宣告第 5 批程式層封箱；**第 6 批不得自動開始**。
