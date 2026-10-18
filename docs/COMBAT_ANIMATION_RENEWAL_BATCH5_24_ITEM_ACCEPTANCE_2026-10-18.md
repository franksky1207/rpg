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
