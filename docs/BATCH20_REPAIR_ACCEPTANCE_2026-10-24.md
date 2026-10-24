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

## 發布及真機界線

PR、同SHA Actions、main合併與Pages尚未完成，不得封箱。iPhone長時間流暢度、溫度、耗電與實際記憶體仍需真機；上述2MiB僅為受控decoded bitmap預算，不代表瀏覽器總記憶體。
