# 文明戰線

《文明戰線》是一款純前端、文字／數值導向的科幻 RPG 網頁遊戲，正式支援桌面版與手機版。

## 目前正式版本

- **銀河紀元**：Lv.1～500，10 區、100 張主線地圖，普通／菁英／Boss 結構。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss。
- 角色系統：5 裝備部位、6 品質、詞條、裝備評分、鎖定、遺失裝備贖回。
- 養成系統：8 種專精（各 Lv.60）、VIP20、銀河強化 +20、宇宙強化 +40、10 印記、宇宙文明等級 Lv.10。
- 副本／戰鬥：懸賞、競技、鏡像、虛空、文明災厄，以及主線／特殊怪。
- 正式玩家稱號共 26 個：銀河災厄 10、宇宙災厄 10、鏡像 15～20 勝 6。
- 戰鬥倍速：一般玩家 1×／1.5×（依紀元與模式）；GM 可測 2×。
- 離線收益、瀏覽器背景戰鬥與快速追趕已支援雙紀元。
- Cloud Save 使用 Supabase；本機正式 save 仍以 `localStorage` 為基礎。
- 桌機／手機各自使用正式 WebP 科幻背景；原始 PNG 僅保留為 authoring source。

## 存檔

- 正式 key：`frank_text_rpg_save`
- 正式 `SAVE_SCHEMA_VERSION = 15`
- legacy `SAVE_VERSION = 13` 僅供舊相容，不是目前 schema owner。
- 正式舊存檔政策：已知 V1+ 皆支援 migration。
- 未來版本存檔會 fail-closed；舊版網頁不得把新版存檔降版覆寫。
- Save Write Guard 必須保留；GM sandbox 不得寫正式玩家存檔。

## Integrity／維護

目前有 Runtime Integrity、Story Integrity、Asset Integrity 與各系統專屬 Integrity。

- Runtime／Final 共用 canonical Integrity Contract。
- Save migration、Offline state、舊 compatibility、Arena alias 等都有 owner audit。
- 正式背景只能從 `assets/backgrounds/` 讀取 WebP；`assets/backgrounds-source/` 不得被玩家端 runtime 引用。
- `main` 的實際程式碼永遠是唯一真實來源。

## 部署

GitHub Pages 可直接使用 `main` 分支根目錄部署，入口為 `index.html`。

## 開發與承接

跨對話／跨工作階段承接前請先閱讀：

- `PROJECT_HANDOFF.md`：目前正式系統、owner、版本與修改規範。
- `PROJECT_PENDING_STATUS.md`：目前真正尚未完成／已取消的工作。
- `assets/README.md`：背景 source／runtime 素材政策。
- `GM_UI_GUIDE.md`：GM 功能按鈕語意與配色規範。

修改前必須重新讀 current `main` 的相關 owner、直接相依、Integrity／workflow 與 `index.html`。JS／CSS 改動需同步更新 cache-bust；修改後要重新確認 actual main，並以最新 HEAD 的 Runtime Integrity 成功為完成條件。

第三紀元目前尚未正式設計／實作；先以完整實際遊玩銀河＋宇宙兩紀元為下一階段。
