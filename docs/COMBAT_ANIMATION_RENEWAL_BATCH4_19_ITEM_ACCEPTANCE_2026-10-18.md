# 《文明戰線》新版第 4 批・19 項整合施工與驗收（2026-10-18）

依最新 main 基準 `fb182111da17eec2bea0c23afbe4083078db6446`，本批固定 19 項，僅改正式戰鬥「呈現／命名／手機定位」、GM 動畫測試中心及其直接保護測試，不碰核心玩法、戰鬥 owner、音樂音效、角色造型、美術或存檔。

## 一、19 項完整結果矩陣

| # | 工作 | 變更或核對證據 |
|---|---|---|
| 01 | 正式名稱 | 現役角色動畫開關改為「開啟／關閉戰鬥動畫」；GM tab、GM 子頁統一「GM 動畫測試中心」 |
| 02 | 正式文字核心／動畫 | 原 `t3b-formal-entry.js` 的正式事件 owner、文字 UI、可選角色動畫保留，只有標籤／正常回退提示異動 |
| 03 | 動畫開關及持久化 | 延用原本角色動畫層會話切換，不自行建立新儲存鍵或改更大設定頁（避免改動持久化）；此開關原有的跨次持久化行為不應冒稱已有 |
| 04 | 戰鬥中按鈕 | 原 `data-player-sprite-toggle` 唯一按鈕保留，不另加複本；名稱改成開啟／關閉戰鬥動畫 |
| 05 | 功能文字 | 玩家正常模式不稱 3D/2.5D；GM 作為測試例外仍保留必要技術說明及素材警告 |
| 06 | 文字戰鬥 | 文字核心始終為正式來源；預期 `text-or-minimal-policy` 不建立工程式回退通知 |
| 07 | 極簡 | `main-minimal-mode-open` 不自動移動視窗，原靜音與戰鬥契約不變 |
| 08 | 背景／離線 | 背景分頁、GM 背景時不捲動；不改 fast catch-up、離線／保存 |
| 09 | iPhone 戰鬥布局 | 新 `battle-mobile-viewport.css` 將懸賞、競技、虛空戰鬥框限制在可用寬度 |
| 10 | HP／護盾／文字 | 手機玩家與敵人欄位可斷行、數值不強制向外撐寬，未變更 HP／護盾運算 |
| 11 | 浮字及狀態 | 限制 mobile combat damage 元素可見寬度，無碰撞判定不可靠的 GPU 動畫承諾 |
| 12 | 安全區 | 套用 CSS safe-area-inset 於戰鬥下方操作區，避免 Home Indicator |
| 13 | 手機／桌機 | CSS 僅作用於窄螢幕；viewport manager 桌機寬於 820px 不介入 |
| 14 | GM 中心命名 | `3d-test/index.html`、`gmhubextensions.js` 改為 GM 動畫測試中心 |
| 15 | GM 現役功能 | 仍保留 `C-08-CHARACTER`、`C-15-BATTLE`，不復原已清理的舊 case、不刪 renderer/sprite/asset registry |
| 16 | GM 安全回退／釋放 | 測試中心原本 `dispose/release/fallback` 保留；通過 GM 測試中心既有驗證 |
| 17 | 回歸測試 | `scripts/batch4-19-item-gate.cjs` 加原 Batch 3 行為／Renderer／資源回歸，正式 Battle／GM／Runtime／Pages 逐同 SHA 核對 |
| 18 | GitHub 封箱 | 分支合併 main 並核對最新 SHA CI + Pages 後才可封箱，PR 留存完整結果 |
| 19 | 三紀元連戰／虛空自動定位 | `dungeonui.js` 統一戰鬥入口定位；真正的 `.combat-arena`（高維三戰 lineup 下方），不定位外部清單；手機只有未在可見處／進新戰時定位，保護手動手勢、桌機、極簡／GM 背景、隱藏頁；虛空採一次進場錨定，不逐層搶捲動 |

## 二、程式自我檢查

- 原始碼不動 `combatfx.js`、`combatcore.js`、`dungeonarena.js`、`dungeonbounty.js`、`thirdworldarenaui.js`、`dungeonvoidui.js`、`mainminimalmode.js`、`backgroundprogress.js`。
- 確保 `index.html`、`3d-test/index.html` 變動的 script/css 引用均更新 cache key，且兩條歷史清理 guard 僅容許逐字已知的新 cache 引用與單一 stylesheet，其他 markup／舊素材 guard 不放寬。
- 新增 Chromium `tests/runtime/batch4-mobile-combat-viewport.cjs`：高維競技場三組敵人卡片在上、實際戰鬥在下，檢查進戰定位、跨場已可見畫面穩定、使用者手動操作不被搶回、桌機不自動捲動。
- 只提供 Chromium 手機仿真及靜態契約測試，不把它冒充真機 iPhone Safari 測試。

## 三、實機／Actions 驗收

待完成最新分支 SHA 對應 CI、正式 2.5D Battle／GM，以及合併 main 之後的 Runtime、歷史清理回歸與 Pages。未取得最終成功紀錄前不可宣告正式封箱。

## 四、提交與待補

後續以 GitHub PR 及合併 main 的實際 SHA 回報。iPhone 真機熱量及各裝置人工外觀驗收依第6批後實測，不在此虛構。
