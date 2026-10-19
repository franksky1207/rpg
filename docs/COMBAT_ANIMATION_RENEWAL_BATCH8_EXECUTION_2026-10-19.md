# 《文明戰線》新版第8批施工與驗收追蹤（2026-10-19）

> **狀態：正式程式與 GitHub Pages 已發布；自動化驗收封箱，真機及擴充覆蓋保留待補。** GitHub `main` 才是唯一真實來源，不把 CI 模擬當作 iPhone 真機通過。

## 使用者正式確認的版面

- 桌機：上方左右戰場；下方玩家及敵方資訊。比例以實際畫面調整，不強制 50:50。
- 手機：方案 B，從上到下為「敵方資訊 → 左右對戰動畫 → 玩家資訊」。
- 玩家在左向右，怪物在右向左；同一組正式事件、Presenter 與 owner clock。
- **不重新加入戰鬥訊息框或戰鬥文字紀錄區**；只保留必要 HP、護盾、戰意、短暫傷害資訊，文字／極簡安全回退依原有正式機制。
- 原三套 512×512 單層 WebP 直接沿用，無需重畫、無需分層或逐指遮擋。
- 第8批只有怪物共用動畫及普通／菁英／Boss 輕量差異，專屬美術第13批以後。

## 24 項驗收矩陣（證據與限制）

| 組別 | 項目 | 必須驗證 |
| --- | --- | --- |
| A DOM / CSS | 01～06 | 全模式戰場容器、人物離開玩家卡、左右站位、桌機上下區、手機 B、安全區與連戰定位 |
| B 動畫 | 07～12 | 三紀元站高、玩家右攻、怪物左攻、六動作、普通／菁英／Boss 區分、無裁切 |
| C 正式事件 | 13～17 | 原 owner clock、不新增傷害計算、HP／盾／浮字、倍速／反擊／連擊／汲取、回退 |
| D 效能／GM | 18～21 | SpritePool、Canvas／RAF／監聽器、進退場清理、GM 雙角色隔離及缺圖測試 |
| E 封箱 | 22～24 | 三紀元／副本動態回歸、Chrome 手機／桌機 viewport、最新 SHA Actions／Pages |

## 本次已提交的程式路徑（需以 PR diff 與最新 SHA 再核對）

- `3d-test/t3b-formal-entry.js`：不再把正式主角 Canvas 插進玩家 HP 卡，改為獨立共用戰場；管理顯示與生命週期。
- `3d-test/t3b-formal-renderer.js`：正式主角和敵方替代輪廓共用同一 sample；怪物身分由正式 enemy identity 優先判定；不另建戰鬥 RAF／clock。
- `3d-test/formal-player-sprites.css`：桌機與手機 B 版面及輕量大小控制；相容保留的舊 combatMessage DOM 不再顯示。
- `dungeonui.js`：連戰定位改以穩定戰鬥標題為錨，避免異步載入動畫後舞台位置改變。
- `index.html`：限縮在新版 Renderer／Entry／CSS 的精確版本指紋。
- `tests/equipment-formal/browser.cjs`：確認實際兩角色、上下卡、舞台邊界。
- 舊清理測試：僅批准本批視覺 CSS 與 cache token 差異，保護其餘正式資產與玩法。

## 絕不可更動

三紀元正式戰鬥、210 套／1,050 槽、HP／盾／戰意／傷害／回合／獎勵、轉生與外觀、Save Schema 17、音樂、背景／離線／Fast Catch-up、極簡、GM 隔離、快取、智慧下載與 Pages；Issue #37 暫緩。


## 合併前驗收紀錄（2026-10-19）

- 施工 SHA：`db5fe59696565673908564c0b952f92a99628154`；同 SHA 六項 PR Actions 全部 success（Batch 5、Batch 6 16 類、Batch 7、正式戰鬥瀏覽器、GM Integration、GM terminology）。
- 01～06：正式 Entry 與 CSS 已改獨立舞台；正式瀏覽器斷言確認左右雙角色、卡片隔離、版面邊界；手機連戰定位另有既有 viewport smoke。**所有不同大小的 iPhone／所有合法模式尚未逐一真機確認。**
- 07～12：Renderer 由同一 sample 驅動雙角色，三套玩家 Sprite、敵方替代輪廓及普通／菁英／Boss 分類已實作；正式戰鬥和 Batch7 browser 回歸成功。**個別 Boss 專屬圖、所有怪物方向與完整連段並未逐一驗收。**
- 13～17：保留 owner clock／正式事件及戰鬥計算檔案；正規 Formal Battle 和 Batch6 16 類整合通過。**不等於所有戰鬥事件與所有回退情境已人工檢視。**
- 18～21：未新增獨立 RAF／時鐘；GM Integration 與 terminology 通過，SpritePool 已有 Batch7 保護。**iPhone 發熱、連戰壓測、GM 缺圖專項操作尚待確認。**
- 22～24：PR 同 SHA 六項自動測試成功；正式 main 合併、同 main SHA 的發布 Actions 與 Pages 對版必須在合併後獨立查證。

### 合併判斷

本批「共用左右戰場」的必要程式回歸具備六項綠燈，可進行受控 main 合併並驗證部署；24 項中無法從現有 CI 直接證明的真機／全模式覆蓋不冒充成功，列為待補實測。此紀錄不代表 24／24 全部實測通過。

## 封箱門檻

1. 本批 **24 項逐項有證據**；尚未驗證者標示待補，不能整批宣告通過。
2. HTML/CSS/JS 語法與必要 Runtime、正式戰鬥、GM、Sprite、Cache、發布流程自我檢查。
3. 施工 SHA 與合併後 main SHA 分開核對；必須查正式 Pages 的當次版本。
4. 沒有 iPhone 真機／熱節流數值不得聲稱真機流暢驗收；CI viewport 不算。
5. 成功後才填寫四段最終報告：修改內容、程式自檢、Actions／實機、提交 SHA 與待補事項。

## 第8批正式發布封箱紀錄（2026-10-19）

### 一、修改內容
- PR [#39](https://github.com/franksky1207/rpg/pull/39) 已合併，合併提交 `0396005e9acfd4b837c74051ebc2e4fa12097487`。
- 正式主角 Sprite 脫離玩家資訊卡，在獨立舞台左側面向右；右側使用與正式 owner sample 同步的怪物共用輕量 Canvas 輪廓，並依正式敵方身分區分普通／菁英／Boss。
- 桌機為戰場上方＋雙方資訊下方；手機為敵方資訊／左右戰場／玩家資訊。已隱藏舊戰鬥文字訊息框，保留文字及極簡模式的正式回退。
- 副本手機連戰維持以穩定戰鬥標題為捲動錨；沒有更動正式戰鬥計算、轉生、獎勵、存檔或 Save Schema 17。

### 二、程式自我檢查與24項證據界線
- **01～06**：正式 DOM、CSS、手機 B、桌機左右雙角與邊界已由 Formal Battle Playwright 斷言及既有副本 viewport smoke 覆蓋；全面實機尺寸仍待補。
- **07～12**：三紀元 Sprite、玩家動作、怪物替代輪廓及怪物分級已提交；Batch7 圖片安全測試、Formal Battle 回歸成功。全部怪物專屬圖、完整左攻細節及逐隻 Boss 真機回歸不宣稱通過。
- **13～17**：保留共用 formal owner clock、正式 Presenter、HP／護盾計算與回退架構；正式戰鬥及 Batch6 16 類整合成功。未涵蓋的特殊事件人工觀察列待補。
- **18～21**：未新增第二套 RAF 或戰鬥時鐘；SpritePool 與 GM 正式整合回歸成功。真機熱節流、GM 全缺圖情境及長時間連戰待補。
- **22～24**：已確認同 SHA GitHub Actions、Pages 建置與部署結果；Chrome viewport 不等於真機。以上分類為既有測試支持的證據與限制，並非聲稱24項全部逐項真機通過。

### 三、GitHub Actions、Pages 及驗收
- PR 頭部 `db5fe59696565673908564c0b952f92a99628154`：六項同 SHA 的 PR Actions success。
- 合併 SHA `0396005e9acfd4b837c74051ebc2e4fa12097487`：發現 HTML JS CSS Cache Version Guard 失敗，已在主分支後續修復，不以該合併 SHA 宣稱全綠。
- 修復後 main SHA `2a7a9ed6bd6a329439ab49dd2bf5e2c44e274dea`：查核到 **14／14 項當次 GitHub Actions success**，含 Runtime Integrity、Formal Battle、Batch6 16 類、GM、Batch7、Cache Version Guard、Publish Asset Audit、Publish Release Gate、Publication Dry Run、Publish Optimized GitHub Pages。
- GitHub Pages 正式發佈：[Publish Optimized GitHub Pages run #39176357053](https://github.com/franksky1207/rpg/actions/runs/39176357053)；當次 build-and-verify 及 deploy 工作均 success。
- 正式 URL：<https://franksky1207.github.io/rpg/>。本紀錄證明 GitHub Actions 發佈成功；沒有 iPhone 本機載入、溫度或帳號存檔的真機驗證證據。

### 四、提交、封箱界線與待補
- 第8批**程式整合、自動化回歸與 Pages 發佈已達可發布狀態**；第8批的 **真機及完整覆蓋驗收仍列待補**，不標示 24／24 全數通過。
- 待補：iPhone Safari 真機長時間連戰／熱節流、各大小裝置完整畫面、三紀元所有合法副本與特殊 Boss、GM 雙角缺圖回退逐項操作。
- 延後議題：高維十王 Issue #37 仍不在本批修改範圍。
- 本次文件補記本身若另產生新的 main SHA，須再以新 SHA 核對 Actions 與 Pages，不能拿先前 SHA 的綠燈代替。

## 目前明確未完成的事項

施工 SHA 六項 Actions 已通過。GM 雙角色更多專項操作、各種怪物缺圖、全部副本的真機覆蓋仍待補；正式 main／Pages 的發布驗收必須在合併後執行。
