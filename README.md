# 文明戰線

《文明戰線》是一款純前端、文字／數值導向的科幻 RPG 網頁遊戲，正式支援桌面版與手機版。

## 目前正式版本

- **銀河紀元**：Lv.1～500，10 區、100 張主線地圖，普通／菁英／Boss 結構。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss。
- **高維紀元**：主要系統設計已完成，但尚未實作到 runtime／save。
- 角色系統：5 裝備部位、6 品質、詞條、裝備評分、鎖定、遺失裝備贖回。
- 養成系統：8 種專精（各 Lv.60）、**VIP 等級無上限（特殊特權至 VIP20）**、銀河強化 +20、宇宙強化 +40、10 印記、宇宙文明等級 Lv.10。
- 副本／戰鬥：懸賞、競技、鏡像、虛空、文明災厄，以及主線／特殊怪。
- 正式玩家稱號共 26 個：銀河災厄 10、宇宙災厄 10、鏡像 15～20 勝 6。
- 戰鬥倍速：一般玩家 1×／1.5×；GM 可測 2×。
- 離線收益、瀏覽器背景戰鬥與快速追趕已支援雙紀元。
- GM 管理另有本機帳號隔離的「主線鎖血」測試開關，只作用於正式主線／主線特殊怪，不寫入角色 save 或 Cloud Save。
- Cloud Save 使用 Supabase；本機正式 save 仍以 `localStorage` 為基礎。
- 桌機／手機各自使用正式 WebP 科幻背景；原始 PNG 僅保留為 authoring source。

## VIP 長期成長

- VIP 升級門檻：`1000 × VIP等級²`。
- VIP 等級本身沒有上限。
- 每級持續提供 HP／ATK +0.5%、DEF +0.25%、暴擊／閃避 +0.25 個百分點。
- VIP2～VIP20 依既有規則解鎖特殊特權；VIP20 是最後一個特殊特權階段。
- VIP21 以上不新增特權，但既有特權與每級基本能力成長持續有效。
- 競技場、虛空幻境等既有 VIP 積分來源仍具有長期用途。

完整實作、GM、Integrity 與自我檢查紀錄見 `PROJECT_VIP_UNBOUNDED_UPDATE.md`。

## 高維紀元設計狀態

高維紀元尚未進入 runtime 實作，但主要系統骨架已定案：

- Lv.1000→2000；每級固定 1000 萬 EXP，Lv.2000 後 EXP 封頂。
- 入場要求 Lv.1000、宇宙主線完成、+40×5、文明 Lv.10、VIP≥20、8 專精×60、10 印記×10。
- 10 隻高維存在，各固定 11 億 HP，總 HP 110 億；5pp 戰線限制只比較存活王。
- 十王正式名稱：破界天裁、永劫重垣、宿因天秤、無相彼岸、萬象迴演、維隙之刃、逆因輪轉、噬界深淵、先驗之瞳、高維原點。
- 正式高維戰鬥只保留連戰；單輪最多 100 死；停止連戰或重整後高維壓制死亡層數清零。
- 1 點正式永久淨削血 = 1 EXP = 1 **維度之弦**。
- **界弦核心** Lv.0→10，每級 10 億維度之弦，用來降低每次死亡造成的高維壓制。
- 所有王 100% 共同基準 ATK8000／DEF8000／暴10%／閃10%；90%→10% 共 9 次固定強化。
- 開場共有先制、連擊、穿透、反擊、汲取 5 種能力；70%→10% 依序加入鎮心、壓制、韌性、復仇、反噬、無視、戰意。
- 第三紀元裝備數值算法沿用既有公式到 Lv.2000；只生成傳說／神話；每場正式高維戰鬥 100% 至少掉 1 件，十王共用基礎品質池：傳說95%／神話5%；既有 VIP Boss loot 特權照常套用。
- 裝備名稱依十王總剩餘 HP 分 10 套名稱池（1000%→100%），只換名稱語意，不改數值公式。
- 高維十稱號已定：破界初臨、維外行者、超界之軀、高維真形、萬維共鳴、界律共主、維序凌駕、超維至尊、諸維唯一、萬維之上。
- 進入第三紀元後，銀河／宇宙永久只剩回顧；暗物質／暗能量清零並退出第三紀元正式介面。
- 第三紀元關閉懸賞與特殊遭遇；鏡像、虛空保留；競技場的第三紀元正式形式仍待後續決定。
- 高維離線只依近期正式高維戰鬥 sample 結算裝備，不給 EXP、維度之弦、不削王血；VIP loot 照常套用。
- 已擊破十王可回顧；回顧採滿 HP 的 10% 最終型態，無正式收益。
- GM 測試／管理、預定 save schema 16、`thirdWorld` 根狀態與 owner 分工都已完成設計，但尚未寫入 runtime。

完整設計基準以最新 `PROJECT_HANDOFF.md` 第 13 節為準。目前真正刻意保留未定的大項只有：**高維序章／10 段主劇情具體內容、十王全滅後最終通關事件，以及第三紀元競技場正式形式／數值曲線**。

## 存檔

- 正式 key：`frank_text_rpg_save`
- **目前 runtime** `SAVE_SCHEMA_VERSION = 15`
- legacy `SAVE_VERSION = 13` 僅供舊相容，不是目前 schema owner。
- 正式舊存檔政策：已知 V1+ 皆支援 migration。
- 未來版本存檔會 fail-closed；舊版網頁不得把新版存檔降版覆寫。
- Save Write Guard 必須保留；GM sandbox 不得寫正式玩家存檔。
- VIP 無上限不新增 save 欄位、不升 schema；既有 `vipPoints` 會依正式公式自然重算 VIP21+。
- GM 主線鎖血是裝置＋帳號偏好，不屬於角色 save schema。
- 第三紀元正式加入 persistent state 時，設計上預計升到 schema 16；目前尚未實作，不能把 16 當作 current runtime。

## Integrity／維護

目前有 Runtime Integrity、Story Integrity、Asset Integrity 與各系統專屬 Integrity。

- Runtime／Final 共用 canonical Integrity Contract。
- VIP 無上限另有專用 runtime probe 與 `tests/runtime/vip-unbounded-integrity.js`。
- GM 主線鎖血有 `tests/runtime/gm-mainline-hp-lock-integrity.js`。
- Save migration、Offline state、舊 compatibility、Arena alias 等都有 owner audit。
- 正式背景只能從 `assets/backgrounds/` 讀取 WebP；`assets/backgrounds-source/` 不得被玩家端 runtime 引用。
- `main` 的實際程式碼永遠是唯一真實來源。

## 部署

GitHub Pages 可直接使用 `main` 分支根目錄部署，入口為 `index.html`。

## 開發與承接

跨對話／跨工作階段承接前請先閱讀：

- `PROJECT_HANDOFF.md`：目前正式系統、owner、版本、第三紀元最新完整設計與修改規範。
- `PROJECT_VIP_UNBOUNDED_UPDATE.md`：VIP 無上限正式更新紀錄。
- `PROJECT_PENDING_STATUS.md`：目前真正尚未完成／已取消的工作。
- `assets/README.md`：背景 source／runtime 素材政策。
- `GM_UI_GUIDE.md`：現行 GM 功能按鈕語意、配色與管理區塊原則。

修改前必須重新讀 current `main` 的相關 owner、直接相依、Integrity／workflow 與 `index.html`。JS／CSS 改動需同步更新 cache-bust；修改後要重新確認 actual main。

高維紀元目前只有設計規格，尚未實作；只有使用者明確說「做／修改／執行」後才可進入正式程式實作。
