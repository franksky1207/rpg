# 《文明戰線》新版第10批・正式介面與手機操作整合（2026-10-19）

## 施工基準
起始 main `9d59f464d6c1aa7b11bf27a9b2f78fbee60beeb9`。本批依20項核對，僅有證據的問題才動正式介面；不重繪、不擴大 DOM/JS owner。

## 範圍 01–05：各頁
首頁／冒險／角色／背包／裝備／強化／副本／設定沿用既有版面與背景，集中處理 820px 以下 function-page、enhancement-page、dungeon-page-shell、combat-screen 容器溢出。長裝備名稱、卡片、統計及表單控制允許換行並限制最大寬度。此 CSS 不重構正常桌機介面。

## 範圍 06–11：戰鬥與手機
保留第8～9批正式左右戰場：桌機舞台在上雙卡在下、手機敵方資訊→左右動畫→玩家資訊。現有 `dungeonui.js` 的主動捲動定位會保護觸控／滾輪／指標事件、避免連戰重複搶捲動，並按 bounty／arena／void 作區分；本批避免第二套 listener 或新增 RAF。增加手機戰鬥控制列換行防溢出。動畫開關透過 mode-foundation 原契約回文字呈現，不改模式 owner。

## 範圍 12–16：設定
確認 `3d-test/mode-foundation.js` 的角色外觀設定與戰鬥動畫開關是兩個獨立設定；未轉生選項受限；偏好存本機帳號，無雲端同步承諾。CSS 調整設定列、標籤、下拉、音量滑桿、小螢幕文字與核取方塊寬度；未更動音效大小、曲目、儲存鍵值與 Save Schema17。

## 範圍 17–20：驗收與回歸
無新 timer、RAF、observer、事件監聽器或重算；保留背景、極簡、離線、Fast Catch-up、倍速、GM 與數值 owner。版本更新只限 `battle-mobile-viewport.css` 快取，歷史安全測試精確正規化相同 token；補一份靜態契約測試。

### 驗收界線
自動測試／GitHub Actions／Pages 以實際同 SHA 結果為準，未執行 iPhone 真機觸控與熱度量測。大型視覺設計、音訊資源與全模式總驗收分別留第11、12批；高維十王 Issue #37 不納入。
