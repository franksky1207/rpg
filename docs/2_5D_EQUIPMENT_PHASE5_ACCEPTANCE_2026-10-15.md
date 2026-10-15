# 第5批：正式 B 鎧甲角色整合驗收

基準 main：`fbe46d9004eb38afbac55b8de03f832237ca56df`；施工前該 SHA 的17項已觸發 Actions 全為 success。本報告記錄工程與自動化驗收；交付 commit／exact-HEAD Actions 以推送後最終回報及 GitHub 為準，不把基準結果套用到交付版本。

## 1. 修改內容

正式 `index.html` 啟用獨立、受控的 **playerSpritesEnabled**，只允許 G005／G007／G018。沿用 `CivilizationFormalBEntry → Controller → Renderer`、正式事件橋、Projection、OwnerClock，以及第3～4批 `WholeSuitActor`／五動作模板／素材池；在原 renderer 增加可替換 actor 分支，沒有建立第二個戰鬥 renderer、權威事件、音效播放器或戰鬥時鐘。角色在原玩家卡片內、名稱與 HP 之前，既有敵方、護盾、跳字、操作及背景保留。新角色生效時停用舊玩家整卡位移，避免雙重攻擊動畫。

| 正式套裝 | 實穿鎧甲 | 來源 | 本批正式用途 |
|---|---|---|---|
| G005 | 生化隔離甲 | 地球戰爭／污染禁區 | 原透明 WebP 整套角色 |
| G007 | 自律護衛甲 | 地球戰爭／古代科技遺址 | 原透明 WebP 整套角色 |
| G018 | 環軌防護甲 | 太陽系戰爭／土星環防線 | 原透明 WebP 整套角色 |

共用純函式 `CivilizationArmorSelection.select(snapshot, sets)` 以正式 version2 快照、鎧甲槽的正式名稱與裝備自身紀元，唯一映射到 catalog 永久套 ID。裝備實例隨機 id 不是套 ID；當前角色紀元也不覆寫鎧甲紀元。其他四槽完全不參與視覺選材，仍由原 owner 計算數值、強化及效果。鎧甲原紀元無效／缺失不猜成銀河；無甲、未知、歧義及未完成素材安全回退。

正式事件 capture 同步保存 detached equipmentSnapshot，與 battleId／生命週期綁定；異步載入完成時不重讀當前裝備。戰鬥中改裝不會把別套人物覆蓋本場快照，更不影響計算。GM 正式快照模式委派同一選材函式，改為鎧甲決定；GM 自由展示及其 requestId／世代／授權防護繼續隔離。

正式五動作來自既有播放 owner 的 token、index、pacing 與當前 normalized action。computed outcome 不直接播放，背景補算不回播；連擊、反擊及汲取仍沿原事件。當前動作由既有 `getCombatPresentationSnapshot()` 提供，避免長戰鬥早期佇列省略造成漏動畫。標準 Core 沒有原始 battleEnd 行，因此死亡依**呈現中的零 HP**驅動，不能依提前算完的結果猜測。恢復時零 HP 取死亡終點，不重播死亡或音效。

本批實測修正：登入後重新掛事件訂閱；persisted pagehide 保留事件訂閱、只暫停視覺，真離頁仍取消；虛空使用原 `voidPlayerCard`；極簡立即 suspend；離開戰鬥即清除無引用 bitmap；原 owner 先 headless 計算／再建 DOM、或同場 replace 呈現 token，可依正式活躍 token 重新掛載。舊 delivery signal 只取消舊視覺，不能永久封死之後的合法呈現。

## 2. 載入、回退與發布

三圖原 bytes 不變，合計272,992 bytes。正式 bitmap 16MiB上限、最多兩張不同素材併發，按需 SHA／bytes／尺寸／解碼驗證，載入5秒取消；未成功仍由原文字 HUD 正常戰鬥。同一內容地址共用 bitmap，正式 HTTP URL 帶 SHA、force-cache；熱戰鬥不重複下載／解碼。停止、舊世代、切換文字、極簡、背景及離場取消 RAF／lease／Canvas；離場清除 decoded cache。沒有全站角色圖預載。

發布權限分層：

- 第4批 `gm-publication.json`／gmPreviewAllowed 仍是 GM 資源許可，原 registry 的 formalReleaseAllowed=false／not-tested 保留為歷史製作階段紀錄。
- 新 `formal-publication.json`／`formal-player-sprites.js` 明確、獨立批准三個 ID 的 formalBattleAllowed=true；生成器、發布稽核逐檔 SHA／bytes 並核對固定三套與正式身份。其他207套沒有角色、沒有批准。
- `FULL_3D_AVAILABLE=false`、`FORMAL_B_RELEASED=false`、舊 rendererReleased=false 維持，沒有解除完整3D、敵人圖集或舊全局封鎖。
- 正式 JS/CSS、GM iframe、原 B import graph 更新 cache-bust；resource manifest 更新內容指紋。沿用既有 SW 逐資源內容地址及版本更新流程，不新增預載群組／存檔欄位。

原 B fixture 必須保持逐 byte 可重現。兩個已演進的公開 JS owner 以 `3d-test/fixture-owner-history.json` 保存精確舊公開程式文字及新舊 SHA，B fixture 解析器固定整份歷史包 SHA，並核對當前 source、歷史 source 與原 fixture 指紋；正式角色不讀此包。沒有把新來源硬當舊 SHA，沒有再生成 fixture 數值或放寬驗證。歷史 B1／B2／T4／G007 鎖保留，新增 phase5 精確演進鏈；B2／B3盤點、manifest 及 import 指紋同步。

發布包本機：404個選定來源，加原標記後406檔，約37.07MB；0缺失引用，32背景、6音樂、11音效檔。新資源沒有公開原始 PNG、概念圖、review、docs/evidence 或整個 development；原本獨立、精確控制的 B 比較預覽發布流程保留。

## 3. 程式自我檢查與證據

可重現命令與逐命令結果在 `docs/evidence/equipment-phase5/regressions.json` 及 `browser-regressions.json`，新 CI：`.github/workflows/equipment-formal.yml`。

- 23組程式／素材／發布／音訊／SW回歸命令通過，0組失敗。含正式新測試7、GM11、原Sprite9（合計27），素材Python17、原概念68、正式快照15、共用loader10、戰鬥事件26／整合4，以及 G007、發布與快取檢查。
- 原 B renderer12／Playback16、immutable fixture逐 byte重現、原美術GLB／source、01～27相容稽核通過。原真 renderer 瀏覽器保留32換裝子集合、100次實際 engine 建立／釋放，非只 mock計數。
- 新正式發布包瀏覽器：三套×桌機1365×900／手機390×844／橫向844×390，加實際閃避及死亡，共11場正式主線；真像素、原玩家位置、HP動態、敵方不重疊、1×／1.5×／2×、死亡後結算正常。
- 正式回退瀏覽器7情境：無鎧甲、未知身份、404、損毀SHA、解碼失敗、6秒慢載入、生命週期。生命週期包含本場裝備變更不換快照、實際文字切換、9場反覆進出、熱快取及離場0 refs／0 bitmap；原音訊 dispatch 數逐筆等於正式 events，無重播。故障不阻止正式勝利結算。
- 最高優先回歸：G007跨紀元鎧甲在高維正式連戰、銀河主線／宇宙主線／虛空真背景與極簡運作；原 HP、盾吸收、重建 HUD、背景循環補算、停止重開與極簡數字斷言保留。手機及桌機 Chromium 不冒稱真 iPhone。
- 既有原生音訊／正式 owner 全流程涵蓋三紀元主線、回顧、懸賞／競技場／鏡像／虛空／災厄／異宇宙；對適用模式採集角色像素。高維回顧另外以正式 UI、正常播放驗證；高維虛空／鏡像另驗角色及結算，第三紀元永久 Boss／核心不變。原音訊50情境、獨立 owner parity（高維競技場 fixed／varied、特殊遭遇1／2、1000 AU身份）保留。
- GM實際發布包121斷言、八分類31案例、三尺寸最大化／還原、正式／自由及撤權隔離；原 G007三LOD、五單槽／遮蔽／姿勢與 dispose 通過。

驗收中找到並修正的失敗不隱藏：死亡無battleEnd、虛空卡片ID、離場 bitmap、同場 token／headless轉呈現、不可變fixture來源演進均如上。最初 GM 測試連錯本機4188埠的失敗獨立保留，正式發布包4189重跑121斷言通過。音訊套件把播放等待加速為0，不能用其短到未採樣的高維回顧當作像素失敗或假稱通過；另用正常正式回顧測試補驗。沒有刪掉原回顧／音訊斷言。音訊測試另把四個測試訂閱者與一個正式B訂閱者分別計入總容量，原每訂閱者32筆上限不變，50情境完整重跑通過。

## 4. 使用者實機入口與第6批交接

入口：正式遊戲 → 背包，實際穿上上述任一鎧甲 → 冒險單場或連戰。武器／頭盔／鞋／飾品可以不同套、不同紀元；預期人物由鎧甲決定，其他四槽數值照常。沒有適用鎧甲時保持原正式 B／文字 HUD，不顯示另一套假人物。

手機直向／橫向及桌機操作：確認人物位於玩家卡、名稱HP與敵方可見；觀看攻擊、受擊、閃避，戰敗後仍有結算；按戰鬥畫面的「切換文字戰鬥」再「顯示角色戰鬥」，戰鬥與HP持續正常；連戰開極簡再關閉、切App／回前景，敵我 HP／盾與場數繼續變動。使用現有已解鎖的回顧、虛空、鏡像、災厄及各紀元副本，不繞過正式解鎖。

GM不改正式存檔的檢查：GM測試中心 → 角色全身展示／2.5D角色與動畫 → 自由展示選三套看素材；切正式模式只讀目前實穿鎧甲。自由展示不能把該套帶入正式戰鬥。本批不新增「GM指定鎧甲直接寫存檔」捷徑；需要正式配裝時由玩家在背包手動穿戴，或使用原本明確授權的正式GM交易功能。

待補為實體 iPhone／Android App切換、Safari真機觸控、30分鐘熱／記憶體／GPU及真帳號雲端長測；Linux headless／SwiftShader不代表完成這些。其餘207套美術仍缺；本批未重新製圖、建模或量產。第6批接手本批最終HEAD與CI證據、整體相容封版、真機效能及發布長測，不重做前三套／戰鬥計算，也不擅自開啟舊完整3D。回退整組本批提交即可，無 Save Schema17 遷移或永久新開關。

## 首次推送CI收尾

首次提交 `54e897baca38aab556ab13c97aab3042b902dab7` 的新增正式戰鬥CI、GM整合及素材／來源等檢查已成功；Runtime Integrity run `38672716724` 失敗於原 `W3_B_VISUAL_FAILURE=1` 故障注入情境。原生音訊50項、三紀元背景與極簡、Chromium／WebKit高維正常情境均已先通過；失敗為本批新增斷言在「刻意禁用B視覺」時仍等待G007。已將正常情境要求角色、故障情境要求回退提示且0角色，兩者全部原HP／盾／補算／停止斷言保留。不是修計算公式或放寬正式素材許可。失敗原始log留證；新HEAD需重新核對Actions，首次SHA不得宣稱全綠。
