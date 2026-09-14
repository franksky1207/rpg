# 文明戰線

《文明戰線》是一款純前端、文字／數值導向的科幻 RPG 網頁遊戲。

目前正式版本特色：

- 純前端 HTML / CSS / JavaScript
- `localStorage` 本機自動存檔，可匯出／匯入 JSON 存檔
- 桌面版與手機版響應式介面，iPhone Safari 為重要實機環境
- 角色等級 Lv.1～500
- 10 大世界區域、100 張主線地圖
- 單場戰鬥與連續戰鬥
- 六種裝備品質、五個裝備部位、詞條與評分系統
- 商店、自動出售、遺失裝備贖回
- 8 種永久專精，最高 Lv.30
- VIP 系統，最高 VIP20
- 副本系統：懸賞戰、競技場、虛空幻境
- 特殊遭遇、離線收益、瀏覽器背景執行補償
- 14 類正式桌機／手機科幻背景圖
- Runtime integrity 自我檢查

正式存檔 key：`frank_text_rpg_save`  
正式 save schema：`10`  
正式 load pipeline：`2`

## 部署

GitHub Pages 可直接使用 `main` 分支根目錄部署，入口為 `index.html`。

## 開發與承接

`main` 的實際程式碼是唯一正式來源。跨對話／跨工作階段承接請先閱讀：

- `PROJECT_HANDOFF.md`：完整專案現況、正式來源與修改規範
- `GM_UI_GUIDE.md`：GM 功能按鈕語意與配色規範

修改前應重新檢查相關正式來源與完整 `index.html`；修改 JS / CSS 後需同步更新 cache-bust，並以 base → head compare 確認變更範圍。
