# 第15-4批：正式戰鬥與GM共同尺寸驗收

基準：GitHub main `c7912b94e84f6df4374cf4e7b1dfdf558e56e85d`。沿用PR #65，原15提交全部保留追溯，清除其最終錯誤補丁。尚須同SHA Actions、合併與Pages成功才可封箱。

## 稽核

- 15-1已合併：原型體型與身份scale、90%下限已寫入正式Renderer；但使用宣告alphaBounds與估計的0.68內容高度，沒有逐身份實際像素驗證，不能認定視覺下限完成。
- 15-2已合併：14組CSS配色、來源JSON與產生器一致；本批保留資料與生成registry原位元。
- 15-3已合併：原型→身份唯讀選單、動作測試與身份摘要；本批保留，沒有恢復手動倍率／配色覆寫。
- 基準main同SHA有12項成功Actions（含正式、GM、Batch6、Batch12、Batch13、發布Gate及Pages）。這些是前置證據，不能代替本次結果。
- 原PR共有15提交，104個workflow紀錄涵蓋13個觸發SHA；快速相鄰提交沒有各自觸發紀錄，取消不視為通過。26個失敗工作逐一讀取：13個Batch13、12個歷史範圍保護、1個發布未分類模組。完整失敗索引及實際錯誤見 `development/combat-animation/batch15/pr65-failure-audit.json`；最早一個失敗日誌未取得有效錯誤行，保留空列不推測。
- 最新PR實際失敗是beast-01的106.86/150.41px，約71%；下載DNS失敗後已fallback下載成功，不是阻擋根因。

## 修改

刪除新建的monster-visible-size.mjs、所有執行引用及其歷史白名單。保留monster-actor.mjs既有版面owner，將正式Renderer原型體型表移入此模組；正式與GM直接呼叫同一個applyBattleSpriteLayout，不再各算怪物尺寸。

以真實Actor的256px待機畫面量測alpha>16的可見範圍，並量測1600ms待機週期極值；只有90%共同下限與原15-1的體型／身份倍率，沒有92%、99%或人工安全係數。測量數字依素材entry與tier快取，不保留影像資源、不逐動畫幀讀回。兩個角色作為同一組等比例容納；保留正式配色、左向、身份偏移與動作。GM首幀明確繪製，避免命中版面快取時空白。所有玩法owner、數值、獎勵、存檔與資源池邏輯不變。

更新正式與GM整條懶載入快取入口。歷史HTML保護只精確接受本次cache token，仍逐位元檢查其餘內容。原PR新增的尺寸檔白名單已完全還原。

## 全身份實際瀏覽器結果

完整每筆結果：`development/combat-animation/batch15/all-identities.json`。桌機1365×900、手機390×844及844×390；GM舞台240px，正式舞台桌機／橫向180px、直向320px，驗證不同舞台共同縮放。

609身份，1827案例，1827成功，0失敗。可見高度比例91.3588%～230.0441%；GM／正式最大比例絕對誤差0.00041807（0.041807個百分點），由CSS 1/64像素座標量化造成。斷言使用同一CSS像素量化上界，沒有放寬90%可見高度下限。

|身份組別|身份數|三viewport成功／失敗|正式Sprite|
|---|---:|---:|---|
|銀河普通|300|900／0|啟用|
|銀河菁英|100|300／0|啟用|
|銀河地圖Boss|100|300／0|啟用|
|宇宙Boss|100|300／0|啟用|
|特殊身份|9|27／0|GM通過；正式resolver排除，不適用|

各身份實際經過GM mount選單、正式prepare/create/sample、真實圖片SHA資源池及Canvas像素讀取；比對圖片身份、瀏覽器正規化配色、左右分離與舞台邊界。9個特殊身份未宣稱正式Sprite啟用。20原型的全動作邊界、死亡透明、180次資源壓力及GM故障恢復沿用Batch13嚴格測試，三viewport通過。

## 故障與跨模式

`monster-recovery.json`保存正式Renderer的HTTP503、同長度破壞SHA、解碼失敗與下載中離場；各自原頁恢復後連續12次進出，最終refs/pending/bytes皆0。資源池單元另測首次失敗、長度驗證、清除後重下載、晚到bitmap關閉與活躍lease清除。既有GM測試涵蓋60次換怪、回收、重新載入與撤權；visibilitychange自動化不等於手機OS實測。

正式Sprite範圍仍僅銀河／宇宙main：高維、異宇宙、懸賞、競技、文明災厄、十王、虛空／鏡像沿用原正式替代輪廓／文字模式，禁止杜撰新Sprite啟用結果。完整既有Batch6的16類回歸與cross-combat-stale-continuous、unified-combat-runtime、cross-mode-late-settlement另行驗收背景、離線、Fast Catch-up、三紀元連戰與晚到結算。

真實iPhone溫度、耗電、OS背景掛起及真帳號雲端未測；不得稱為真機通過。

## 發布門檻

施工中：待最新提交Actions、合併後Runtime Integrity與Pages實際檔案指紋確認。不得據本文件提前宣告封箱。
