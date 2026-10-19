# 《文明戰線》新版第11批｜音效、動畫、資源、舊依賴與手機效能整合

> 施工分支：`batch11-audio-resource-mobile-performance-20261019`。本報告為施工紀錄，並非已合併 main 或 iPhone 真機溫控合格聲明。驗收依據是最新 SHA 的 Actions 與正式 Pages。

## 一、固定施工界線

1. **戰鬥權威不變**：只調整正式 Sprite/Canvas 呈現與音效下載時機；不得更動三紀元、異宇宙的戰鬥 owner、回合、傷害、血盾、獎勵、結算、背景 Fast Catch-up、倍速、Save Schema 17、帳號與雲端。
2. **音樂不重選**：銀河、宇宙、高維三首紀元主題與普通、中等、高等三首戰鬥曲沿用現行選定資產與音量。正常文字模式的音訊依原設定運行，極簡全靜音、分頁隱藏依現有生命週期暫停；UI 點擊音效不恢復。正式戰鬥音效的統一 50% 縮放不變。
3. **Sprite 現役**：沿用第7至10批的三紀元完整角色、透明正式背景及左右站位。角色 Canvas 和怪物替代輪廓只屬呈現層。
4. **舊依賴有條件保留**：`scripts/stage-hybrid-preview.cjs` 明確核對 B3 manifest 中 174 個 B-only SHA 路徑；GM、registry、發布 stage、驗證器仍與其相連。在解除全部現役依賴並建立取代驗證之前，不可刪除這 174 項、GLB、registry、相關 SHA 契約；不因正式 Sprite 不再請求 3D 就整庫刪除。
5. **怪物獨立美術與狀態特效留第13批以後**；第12批仍負責全模式綜合驗收，Issue #37 仍另外追蹤。

## 二、程式變更與異宇宙手機熱點

- `audio/audio-core.js`：首次 pointerdown/unlock、返回前景不再整批預載音效；準備音效延後至真正播放。分頁隱藏釋放 prepared SFX。播放清單、50% 聲音縮放及 GM 預聽隔離不變。
- `audio/audio-scenes.js`：每次正式戰鬥開始不再觸發音效整批 warm，仍以 runId/token 控制戰鬥音樂並在退出後恢復場景。
- `3d-test/t3b-formal-renderer.js`：怪物輪廓相同繪圖時間格與位移不重畫；避免每次取樣更新 renderKey DOM 屬性。角色在保持戰鬥 owner 原始 RAF 節奏與事件順序的前提下，將重複 Canvas 像素的繪製降至動畫約 30 FPS、idle 約 20 FPS；攻擊武器時間仍來自既有官方 frame.weaponAttack；角色位移 transform 小數限精度及值相同時不重設 CSS。
- `index.html`：同步變更正式 Renderer 的瀏覽器快取識別，避免手機混用舊檔。
- 異宇宙由 `alternateuniverseui.js` 的 `animateStructuredCombatPresentation` 進入相同正式 Renderer，不新增第二個 battle loop、不更動它的 reward／settlement。此變更減少頁面上 Canvas 繪製負擔，不代表已量測實體 iPhone 的溫度或能耗。

## 三、依賴核對與取捨

| 依賴 | 本批取捨 |
| --- | --- |
| 正式銀河／宇宙／高維音樂與普通／中等／高等戰鬥曲 | 保留 |
| 5 類現役戰鬥音效與原選曲資源 | 保留；UI click 繼續停用 |
| 三紀元完整角色 Sprite、獨立武器候選和第8批敵人共通動畫 | 保留 |
| 正式 32 組背景與現有手機佈局 | 保留 |
| GM 動畫測試、GLB、registry、B3 174 筆 SHA | 繼續保留；不做高風險刪檔 |
| 已廢棄 G001～G095 歷史概念圖 | 不恢復 |
| 210 套裝備／1050 槽正式資料及存檔 | 完全不變 |

## 四、必要驗收與如實界線

- 檢查 JS 語法、正式 Sprite 尺寸/SHA/生命週期及 Canonical browser test；確認桌機與手機 viewport、正常／極簡／動畫關閉、異宇宙和分頁隱藏/返回、GM、背景及發布資源無回歸。
- PR 的 Actions 全數成功後才能合併；合併後逐一核對最新 `main` 的 Runtime、Formal Battle、GM、Cache、Pages 與 Publisher。尚無可對應的成功結果時，禁止標記封箱。
- 手機長時間連戰、iPhone Safari 真機發熱、耗電及真正帳號雲端操作，未經實測不得聲稱已通過。
- 合併後四段回報須記錄：修改內容、自我檢查、Actions/實機實際覆蓋、SHA 與待補；不得以父 SHA 的成功替代最新 main SHA。
