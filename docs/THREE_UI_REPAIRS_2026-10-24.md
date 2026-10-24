# 三項介面補修｜施工與驗收

基準：GitHub main `2474c486312578be3308132f69b7800350b6abd0`。同一分支、單一 PR；本次使用者授權包含驗收後合併與 Pages 發布。已讀 PROJECT_HANDOFF、怪物製圖 SOP、第19-2／19-3及第20批驗收交接，並以正式程式核對 owner。

## 修改與根因

- **圖鑑**：`monstercodex.js` 的共用 group 產生器加入分支容器與共用階層樣式。桌機每層14px、窄手機12px，淡色引導線；名稱可換行、查看鈕不壓縮。五類沿相同規則。原 opened Set、詳細頁返回捲動、身份、解鎖及圖片 owner 不變。
- **兩紀元災厄連戰**：`calamityui.js`／`secondworldcalamityui.js` 的 beforeBattle 與 onBattleComplete 曾反覆呼叫全頁 render，包含已 prePresented 場次；render 以 innerHTML 刪除正式舞台。雖然 Renderer onRetire 已保留 pending 舞台空間，下一次整頁 render 又把空間一起刪掉，直至下場事件重建舞台，造成資訊框回到文字排版再移回正式排版。主線與災厄皆 clearAfter，清理本身不是唯一原因。
- 修正為兩紀元共用的小範圍 DOM 更新：保留 combat screen、正式舞台與資訊框節點，只更新場次、統計、停止狀態、名稱與 HP 等內容；已播放場次顯示結束 HP，不再重置到開場 HP。結果／退出仍走原整頁 render。`combatfx.js`、兩個 run owner、正式 Renderer／Controller／Viewport／Actor、尺寸與清理邏輯完全未改；沒有常駐 Canvas、額外計時器或第二套 Renderer。
- **GM**：`3d-test/gm-era-sprites.mjs` 將「進階診斷」收斂為「更多預覽選項」，移除一般畫面的 JSON／工程參數、內部代碼與兩個按鈕。原型與正式怪物選單、快照比較仍保留；描述為「原型名稱｜大小：玩家的 N%」。內部 diagnostics／testMissing／clearPreviewCache API 保留真實 Pool／SHA失敗與回收路徑，測試改接該 API，沒有刪除原資源／隔離斷言。三模式、六動作、雙向攻擊、速度／重播、最大化／還原與 GM 權限不變。
- `index.html`、`3d-test/index.html`、`3d-test/test-center.js` 僅同步精確 cache query；resource-manifest 使用既有生成器更新，避免合併後 bot 再補一輪提交。

## 驗收方式與證據

新增 `tests/runtime/three-ui-repairs-browser.cjs`，納入既有 Functional CI 的 monster job，沿用同 PR 過時執行自動取消設定，未新增 workflow。報告與截圖併入原 artifact。

- Chromium：1365×900桌機、390×844直向、844×390橫向。五類所有 details 層級、十個宇宙群、展開／收合、詳細頁返回及 scroll、無水平溢出與按鈕邊界；1705身份／905展示項目不變。
- 銀河／宇宙各四場正式 UI 連續討伐，每個 requestAnimationFrame 採樣舞台與雙方資訊框的文件座標，涵蓋場內與完整場間空檔。要求每幀舞台及資訊框非零高度、各自 top 差值不超過1px，驗證原停止與結算後 Canvas／RAF／短暫特效回收。
- 根因反證：只把兩個 UI 檔以相同基準 main 內容供給相同 Chromium 幾何測試，原斷言確實失敗 `stage never collapses`；修正版本三視窗均通過。未放寬幾何斷言。
- GM 三視窗：玩家／怪物／對戰、原型／正式身份、六動作、速度／重播、雙向攻擊、進階區展開後仍無工程資訊、簡潔描述、內部快取清理與缺圖／重新載入、GM 撤銷及 state／localStorage 隔離。既有 equipment GM 驗證最大化／還原與相容測試入口。
- 既有檢查：圖鑑1735檢查、279 Boss及189異宇宙快速切換／Pool上限與釋放、前景各模式取消、背景／快速追趕策略與終止、跨戰鬥／跨模式遲到結算、正式 Renderer／Controller、JavaScript結構、提示及數值owner保護、Publish dry-run。
- 歷史來源鎖沿原鏈保留，僅在 `three-ui-approved-sources.json` 精確登記兩個UI及兩個HTML入口的前後SHA，再還原至本批基準供原斷言繼續驗證；未知更動仍失敗。未修改任何數值、存檔、身份映射或素材。

首輪 Actions 的 GM terminology 歷史來源鎖拒絕 `3d-test/index.html` 新 cache query；補入同一份精確前後 SHA 登記，原歷史逐位元斷言仍完整執行，未修改產品程式或放寬斷言。

本機額外嘗試的舊 `batch19-absolute-sizing-contract.cjs` 鎖定第19-1批歷史 mappings，與本次開始前的 main 已有差異；它不是現役 Actions gate，未改寫該斷言。現役尺寸／Renderer與正式owner保護使用現役工作流驗證。

逐筆摘要見 [acceptance.json](evidence/three-ui-repairs/acceptance.json)；本機24場、986個未被新手視窗遮擋的取樣幀，六組舞台／雙方資訊框 top 差值均為0px。完整逐幀資料與畫面由既有 CI artifact 保存。

## 發布與人工界線

PR、最終 HEAD、合併 main、同 SHA Actions 與 Pages 成功紀錄以本次 PR 最終說明及交付回報為準，不以啟動工作流代替成功。

Chromium 手機模擬不等於 iPhone／Android 真機：Safari visualViewport、旋轉、觸控、鎖屏／切 App、OS 終止、長時間溫度／耗電／記憶體仍待人工。登入 SDK 在瀏覽器測試使用既有隔離替身，未以真帳號執行雲端寫入。
