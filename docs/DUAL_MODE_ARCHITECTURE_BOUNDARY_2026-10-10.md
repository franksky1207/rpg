# 《文明戰線》雙模式前置第 1 批：展示架構邊界契約

> 日期：2026-10-10；依 GitHub main 實際程式 fresh-read。這是 **40 批之外的前置整合**，不佔用第 16 批；本批交付為**依賴盤點與可執行的施工邊界規範**，沒有宣稱建立模式切換器、登入閘門或完成正式 3D 模式。若日後 main 變更，重新讀實碼核對。

## 1. 全域不變條件

- 文字模式是**永久完整的正式遊戲模式**；3D 模式是另套完整正式呈現，**不是取代文字版**。目前產品仍為文字遊戲加 opt-in 3D 幾何預覽。
- 登入與帳號、同份角色存檔、遊戲狀態、紀元、進度、裝備、交易、戰鬥公式及結算、離線收益與權限判定只有原本的正式 owner。3D 畫面不得自行建立平行 Save、傷害公式、獎勵、交易入口。
- 所有呈現消費同一份正式**唯讀、可序列化且不暴露可變 state 參考**的快照；GM fixture 僅留本次測試中心 session，不得轉寫正式角色。
- 模式管理者未實作前，不得將現有 DOM 插入型預覽誤稱完整雙模式、不准刪除任何既有文字介面與導航。

## 2. main 實際依賴盤點（第 01～15 批）

| 範圍 | main 程式 / 介面 | 目前實況 | 模式分離所需動作 |
| --- | --- | --- | --- |
| 01 引擎 | `vendor/babylonjs/7.54.3/babylon.js`, `3d-test/prototype-engine.js` | 本地 Babylon 資源，正式與 GM 以動態／版本化 URL 共用，場景工廠主要為幾何原型 | 限 3D/GM 按需載入；未來模型分場景分包 |
| 02 Canvas | `3d-test/runtime.js` | `Civilization3DRuntime.create({host,...})`；`show`、`dispose`、epoch／AbortSignal／WebGL 回退，非正式 Save owner | 保留作為 3D 呈現生命週期；不可在文字模式預設建立 GPU |
| 03～07 首頁／星圖 | `3d-test/formal-home.js`, `index.html` | `civilization3dHomeRouteRendered(view)` 隨原文字頁 render 更新；動態插入預覽控制並呼叫 `toggle`；host 位於 `#main` 外 | **目前 DOM 強耦合**，未來 3D 模式必須有獨立畫面路由／host，不再以掃描文字版 DOM 作正式 3D 導航 |
| 08～11 角色／裝備／養成 | `3d-test/appearance-snapshot.js` | `Civilization3DAppearance.capture()`／`scene(kind,appearance)` 是唯讀 v2 外觀入口；正式角色資料與 GM 自訂不同來源 | 延伸單一來源的快照契約，補明不變性及版本；不得第二套角色／裝備公式 |
| 12～14 副本／災厄／異宇宙 | `3d-test/formal-home.js`, `3d-test/prototype-engine.js`, `alternateuniversedata.js` | 以正式畫面 hook、可辨識 DOM 與正式資料做 opt-in 預覽；異宇宙 20 體系×10 宇宙×5 深度 | 正式 3D 導航須讀共用狀態／正式資料，不可依文字按鈕是否存在判定解鎖 |
| 15 戰鬥與結算 | `3d-test/prototype-engine.js`, `3d-test/formal-home.js` | 戰鬥 HUD／護盾／遭遇／戰利品僅視覺原型，未接管完整正式戰鬥 | 第 35～39 批建立**正式事件唯讀 adapter**；演出延遲、倍速、跳過、WebGL 失效均不影響結算 |
| GM | `3d-test/test-center.js`, `3d-test/index.html` | 永久保留的 24 項可選視覺預覽與 iframe session fixture，與正式角色分隔 | 保留永久測試中心與授權隔離，別把測試 fixture 當玩家資料 |
| 啟動與版本 | `index.html`, `backgroundpreload.js`, `scriptgrouploader.js`, `resource-manifest.json` | 一般文字版仍有大量同步 JS；3D runtime/appearance/formal-home 在正式 index 直接引用，Babylon/場景 bytes 可預抓但未開場景不占 GPU | 第 17 批模式決定在專用資產之前；前置第 2 批進行符號級依賴盤點後才安全拆腳本 |

## 3. 共用「正式核心 → 展示介面」契約（未來 adapter 施工規格）

| 介面能力 | 來源與輸出要求 | 允許的展示行為 | 禁止的行為 |
| --- | --- | --- | --- |
| 帳號／模式偏好 | 帳號 owner 提供已驗證帳號 ID；未來偏好 key 與 ID、裝置瀏覽器綁定 | 決定文字或 3D UI 入口，無偏好才詢問 | 3D 介面存帳密、跨帳號共用 key、在正式 Save 複製角色 |
| 角色／裝備外觀 | 以現有 `Civilization3DAppearance` 唯讀入口及正式角色／裝備 owner 派生快照 | 角色模型、五裝備槽、稱號、品質與強化呈現 | 新增第二套戰力公式、直接修改 `state`、讓 GM 自訂覆蓋正式角色 |
| 世界、地圖與戰線 | 正式世界／區域／進度／災厄／異宇宙 owner 輸出快照與只讀狀態 | 兩種模式各自建導航與場景，統一解鎖與進度事實 | 依文字 DOM/按鈕猜測可進入條件或推動正式進度 |
| 戰鬥事件 | 正式 `runCombatCore` 與結算 owner 的實際事件和結果 | 文字 log 或 3D 動畫／HP／盾／技能浮字 | 畫面重算傷害、等待動畫才結算、由 3D 場景觸發 reward/save |
| 命令與交易 | 由正式唯一 owner 受理並驗證身分、狀態、扣款與寫入 | 兩個 UI 可以觸發**同一**正式 action，呈現其真實結果 | 新建 3D 交易／每日次數／離線計算或繞過 guard |
| 場景生命週期 | `Civilization3DRuntime` 與未來場景路由 | show/stop/dispose；失敗提示後可切換文字模式 | 使用者未選 3D 就建立 WebGL；無限重試或自動悄悄改偏好 |

資料契約最小需求：每個快照要有明確 schema version、source（正式或 GM fixture）、world/route、必要 ID／顯示名稱／數值、只讀語意；更新來源只由正式 owner 發生。若需要導覽／攻擊／購買等動作，呼叫**原正式命令**並等待其權威結果，不在 3D layer 定義平行狀態。具體 JS API 需等第 17 批辨識正式 owner 後確定；本文件**不假冒已實作 API**。

## 4. 前置第 2 批與第 16～18 批施工交棒

1. 前置第 2 批：檢查 `index.html` 所有 sync/deferred 腳本、依賴順序、模式別 CSS/JS/背景/3D 資產；提出安全切分計畫、冷熱啟動與回退驗證。未驗證依賴不得直接搬動。
2. 第 16 批：劇情、戰線紀錄、轉生與銀河回顧以既有正式 owner 保持文字版全部操作；3D 可預覽但不變更結果。
3. 第 17 批：建立登入後模式偏好／首次選擇／安全設定切換與重載；模式狀態與正式 Save 分離；未完成的正式 3D 不開放一般玩家。
4. 第 18 批：所有既有 route、子頁、modal、登入、GM、手機回歸；檢查從文字 DOM 耦合走向獨立 3D router 的準備程度，但不得提前宣稱最終 3D 全部完成。
5. 第 19～40 批：依資源分層建場景／GLB／動畫與動態戰鬥，第 40 批驗收同帳號同存檔之完整雙模式。

## 5. 本批驗收與限制

- 已依 2026-10-10 `main` 的正式 JS、HTML、3D 模組與兩份規劃核對上述介面及依賴；本批**不修改執行期 JS、CSS、HTML、Save Schema 或遊戲功能**，因此現有文字模式與 opt-in 預覽行為不變。
- 不聲稱完成模式選擇、完整獨立 3D router、載入模式分流或實機功能驗收；此等均屬未來批次。若實際開發發現某快照引用原始可變物件，須在該 owner 旁修正並附測試。
- 文件完成後需同步更新 `3D_IMPLEMENTATION_PLAN.md` 與 `PROJECT_HANDOFF.md`，並重新回讀 main；前置整合不推進正式第 16 批號。
