# 第20批補修：兩階段驗收紀錄

基準：遠端 main `3470f9fb273d8646ac5741fe56a95ac47c15fb4d`。本批依使用者完整施工指令，先完成異宇宙正式外觀並獨立提交，再施工圖鑑／GM／視覺共用。第19-4批不在範圍。

## 第一階段：異宇宙十階外觀

- 依 `monster-mappings.json` 的正式宇宙順序統計各 assetId 出現次數，200宇宙／1000身份、20原型各10次；每宇宙五層域共用同階。生成器現在驗證此不變條件，禁止以20宇宙分組推算圖片。
- `monster-variants.json` 登錄20組獨立色相路徑與飽和度／明度／對比演進，共200個確定性配色。正式 MonsterActor／Renderer／GM沿原 palettes owner使用；第1階與原圖有差異，第10階最鮮明。採靜態低成本色彩filter，沒有額外粒子、計時器、逐幀畫布變色或200張新圖。
- 原始39張WebP與其他695映射逐位元／逐欄位不變；異宇宙只改visual.palette並新增appearanceTier/version。原倍率1.75、朝向、Alpha、動作、定位及戰鬥數值owner保持原值。
- 正式入口與模組cache token同步修訂；圖鑑生成資料僅由Registry同步，不另造外觀。圖鑑分類／UI尚未進入本階段。
- 本機已通過：1000逐身份／200宇宙／20×10確定性契約；8項解碼池共享、LRU、取消、晚到lease、故障及清除回歸；34提示owner保護；JavaScript structural integrity；resource manifest；PR48停止owner。
- 實際200色像素檢查：200個渲染結果雜湊互異、每階與原圖有色差、所有Alpha不變、解碼池不超過2MiB，dispose後歸零。此為Chromium，並非iPhone真機。
- 80項故障恢復、60個原生異宇宙入口（三視窗）、原圖SHA與Alpha、既有圖鑑、3項暖機與智慧下載清除／重試回歸全部通過。三視窗3000逐身份／六動作驗收全部通過（桌機1365×900、直向390×844、橫向844×390），零失敗。

## 第二階段：圖鑑、GM與共用視覺預備

- 五類固定順序：主線→特殊遭遇→副本→文明災厄→異宇宙。銀河區域／地圖直接讀 `WORLD_REGIONS`／`MAPS`；宇宙讀 `SECOND_WORLD_REGIONS`，不另建名稱表。副本按正式mode/world分類。
- 1705底層身份未變，1000異宇宙身份以正式universeNumber合併成200代表項目，實算905項；分子分母都按展示身份計數。五層域任一遭遇即可開代表。特殊怪沿用9個both身份，兩紀元子分類呈現各自正式名稱，共用解鎖且只計一次，不增加身份。
- 異宇宙十群僅供清單分組；圖片一律由代表正式ID讀Registry。清單無圖片，詳細頁只建立一個靜態Canvas；折疊與返回捲動保留。介面去除Registry ID、內部world代碼。
- 全39原型於桌機／直向／橫向的實際可見Alpha寬高最大均為79.296875%，不裁切、無變形、置中。透明淡邊在縮放後會改變可見範圍，因此準備時量測縮放後像素、整數平移置中；至多39個SHA幾何紀錄，不保留額外變色圖片，不使用戰鬥倍率或動畫。
- GM→管理→資料管理新增「開啟全圖鑑」，沿既有assertGm權限／confirm／save(false)。測試非GM、取消、成功、1705身份、905展示全開、重複、寫入失敗回復、正式localStorage、正式轉生保留；除monsterCodex外遊戲state保持相同，無戰鬥或獎勵結算。
- 正式Renderer與圖鑑透過同一全域版本singleton重用既有SHA驗證monster pool，最多2張512² decoded bitmap／2MiB，跨玩法／模組URL去重。LRU、目前戰鬥優先取消不同預備、最多一個預備、離場／隱藏／登出／清除資源取消。被引用圖於release後清除，清除後可重下載。
- 已確定目前敵人於prepareSuit提早準備，與玩家資源並行；原兩紀元三階競技場僅準備正式固定下一階的一個原型。隨機懸賞／特殊怪／高維投影不猜候選，不向啟動Coordinator增加任何等待。所有正式玩法共用此入口。
- 第一階段採靜態palette filter而無逐幀變色計算，所以不新增另一層位圖外觀快取；正式／圖鑑共讀同一palette、原型SHA、appearanceVersion。相同filter不重複寫入樣式。
- 設定→本機資源管理的原文案、總數／容量及按鈕均不變；clear只新增內部事件使decoded pool失效。原SW、下載白名單、音效、背景與存檔owner不變。
- 本機驗收：三視窗分類／圖鑑／GM／117原型尺寸案例通過；13跨模式正式Renderer、8原生副本、5原生高維／災厄、80故障恢復、8既有pool、1共用pool、3玩家暖機、22存檔／轉生說明、1735既有圖鑑檢查及智慧下載／發布預檢通過。固定下一階競技場使用同一bitmap，離場／clear後refs、pending、bytes歸零。
- 單次本機Chromium冷／暖圖鑑準備：直向13.1／1.0ms、桌機16.2／5.0ms、橫向14.5／1.1ms；第二次無新增fetch/decode。這不是舊版／新版FPS對照、長時間性能基準或iPhone結果。

- CPU×4壓力驗收通過：30次同原型戰鬥只解碼1次、100場重複戰鬥、200次快速切換；6000次sample的p95約0.7ms、最大14.7ms，最終玩家／怪物refs、pending與bytes全部歸零。heap由約0.70MiB至4.06MiB的量測包含首次模組初始化，不能據此宣稱長時間記憶體不增長；真機溫控未測。

## 提交與Actions

- PR：[#91](https://github.com/franksky1207/rpg/pull/91)。第一階段提交：`0b3fe8de42b28bb6735b40a8e464625958f0a638`。
- 第一階段Fast Preflight、Functional CI（六分支）、Equipment GM、GM Terminology、Equipment Formal成功。必要[Runtime](https://github.com/franksky1207/rpg/actions/runs/40054748031)瀏覽器回歸仍執行中；不列為成功。
- 第二階段獨立提交與最終同SHA Actions／main／Pages待補。

## 發布及真機界線

PR、同SHA Actions、main合併與Pages尚未完成，不得封箱。iPhone長時間流暢度、溫度、耗電與實際記憶體仍需真機；上述2MiB僅為受控decoded bitmap預算，不代表瀏覽器總記憶體。
