# 第19-3批｜正式戰鬥核心區域智慧定位（施工候選，尚未封箱）

基準 main：`1839dd147ac7c54b10db34b7f76bd0de7e7b3fb4`。本批限定視覺定位及小螢幕 HUD 間距，不修改戰鬥 owner、數值、存檔、轉生、GM、素材及第19-1批絕對尺寸。第19-4與20批不施工。

## 已修改候選
- `combat-viewport-coordinator.js`：保留原 stage 找尋、手機視窗、manual gesture、過期 RAF ticket guard；量測玩家／敵人 h2 與 HP、原停止鈕及正式 stage 的共同上下界。能同屏則整體置中；不可能同屏時保護 stage，允許周邊資訊隨頁面捲動，不縮小角色。
- 以畫面與舞台兩者 identity 切換判斷重新定位；同一舞台連續更新不因每次 DOM 動態效果搶奪捲動。沒有戰鬥畫面時清除狀態，手動滾動不再被拉回。
- `battle-mobile-viewport.css`：僅減少短螢幕 HUD 上下 padding／row gap，原按鈕仍在上方、CSS stage 三規格尺寸與50dvh預留、角色大小不變。

## 風險與尚未達到的驗收
- 戰鬥內部若反覆重建 screen/stage 而且未手動捲動，可能再次自動定位；須正式入口觀測是否要加上場次身份與時序去重。
- 對物理短螢幕的全元素同屏不做不實承諾；應逐筆記錄實際 viewport 與 element rect。
- 此提交尚未執行完整 Playwright／Safari Browser、正式三視窗全部模式、Runtime、Actions 與正式 Pages 同 SHA 驗收。不得視為封箱。

## 合併前必要 Gate
1. 原生正式入口：銀河／宇宙／高維、懸賞、競技、虛空、鏡像、文明災厄、特殊怪、異宇宙；依存在的模式驗收。
2. 桌機1365×900、直向390×844、橫向844×390，量測動畫 Alpha、雙方名稱HP、停止鈕可見性及捲動距離。
3. 首次準備→Ready、載入錯誤→回退、連戰換場、返回重入、手動操作、旋轉及 Safari visualViewport 高度變動；背景／極簡／文字模式均不定位。
4. 既有第19-1絕對角色可見高度、Boss倍率、六動作完整包絡、停止原事件、Runtime、GM、舊版資源與全部原有 CI gate 均不能放寬。
5. PR head 全部必要 Actions 成功後方可考慮合併 main；main 同 SHA Runtime／Pages 與正式 HTTP／SHA 證據完成才可宣稱封箱。

目前為受驗證約束的草稿施工成果，**尚未完成第19-3批**。