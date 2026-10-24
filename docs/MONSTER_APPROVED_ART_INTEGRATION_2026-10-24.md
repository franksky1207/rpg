# 已認可怪物外觀正式整合候選

本分支以 main `658d5db2c14cd10598e648e2fafdfe3ad75f80dd` 為基準，承接已認可 review `20c7f286b32da7fc3533d34ed7561266f6969cc4`（美術核心 `7b76706d`）。只準備單一整合 PR，**未合併、未發布正式 Pages**。最終 Actions 結果與 SHA 以 PR checks 為準。

## 共用外觀

`monster-appearance.mjs` 解析固定身份與規格；`monster-appearance-manager.mjs` 統一預繪、租用、版本 key、LRU、取消與釋放。戰鬥及 GM 的 MonsterActor、圖鑑的靜態 renderer 都經此入口。GM 的隔離 iframe 使用相同模組與資料，執行期快取按 window 隔離，持久資源快取共用原有 Service Worker。

895 套固定本體／效果規格直接從認可提交無損轉入；48 元件的實際 painter 保留，移除 review 的配置產生器與 UI。沒有重選顏色、原色代表、元件或556組配置。原型、遊戲身份／數值／存檔／掉落、六動作與鏡像玩家邏輯未變。

異宇宙五階映射同 canonical，十王與投影同 canonical，共用同一預繪 entry。圖鑑原容器、導航、解鎖及 GM 全圖鑑功能未變。正式包不依賴 review 成品圖。

## 大小與動畫

既有 body footprint、PLAYER_FRAME_HEIGHT、monsterPose、battleSpriteLayout 數學保持；外圍效果不參與本體尺寸量測。為容納原動畫位移，怪物輸出 Canvas 增加透明留白，尺寸與座標按同一比例補償，**本體在畫面上的尺寸、座標及動作保持原值**。舞台另有受 viewport 限制、最多12px的水平效果裁切留白；離開時還原容器，沒有新增地面效果或獨立動畫循環。

預繪只做一次，六動作逐幀只 drawImage，沒有效果專用 timer/RAF 或逐幀 getImageData。原型示例與正式身份在 GM 選項中區分。

## 資源與快取

- 原有持久 media cache 新增精確7個模組白名單，沿用 manifest SHA、損壞修復、背景下載、容量與清除功能，其他 JS/CSS 不擴大快取。
- 這7檔合計約1.31MB未壓縮；gzip估算約152KiB，實際傳輸取決於主機壓縮。新增外觀成品圖下載：0。
- 每套執行期 entry 為2張512px Canvas（本體／完整，邏輯像素2MiB）。未知／較低規格裝置保守2套，高規格最多4套；低記憶體、saveData、隱藏頁面不做相鄰預繪。原型解碼池仍最多2張、2MiB。
- 一個明確的已解鎖圖鑑鄰項或既知競技對手可有限預熱；沒有200宇宙全解碼。活動租用不被清除破壞，釋放後 stale entry 銷毀。
- cache key 包含原型 SHA、本體版本／SHA、效果引擎／配置版本及配置 SHA。版本不一致拒絕混用。
- 預繪暫存、瀏覽器／GPU與JS heap另計；上述不是整個程序記憶體承諾。中品質動畫 Canvas 透明留白增加約144KiB／活動怪物。

## 本機驗證與量測

證據位於 [monster-approved-integration](monster-approved-integration/)。全量1695正式映射＋10投影解析為895外觀，逐項對照認可調色／效果規格 SHA；原型檔與遊戲 owner 位元組保持。

Chromium與WebKit本機各實際準備895套；35個固定review圖對照覆蓋48元件與12認可樣本。Chromium Alpha完全一致，最大平均RGB通道差小於0.89／255；WebKit因Canvas/WebP及向量抗鋸齒有差異，最大平均RGB差小於1.98／255；規格與形態配置完全固定，沒有為追求指紋重新設計。

39原型本體邊界逐項對照舊profile，702代表性六動作畫布邊界檢查；另補驗實際發現的390px寬型艦回位與異宇宙閃避邊界。全身份保留靜態GM／戰鬥一致性，異宇宙完整動畫依原型前／後期版本代表抽驗，避免同宇宙五階重複播放。

真實 HTTPS Service Worker 測試覆蓋7模組持久快取、損壞修復、已載入頁面內離線重用、活動租用清除安全、清除後重新下載恢復，以及逐幀0像素讀取。沿用原本network-fresh HTML策略，**不宣稱離線首次開啟整個遊戲**。

[載入比較](monster-approved-integration/performance-comparison.md) 記錄相同測量腳本的首次戰鬥、重複戰鬥、連戰、圖鑑前後切換、GM重播、異宇宙切換與清空後恢復。冷外觀需要自然調色／預繪，部分首次項目較慢；命中後免重繪，圖鑑／GM切換顯著較快。單機單次測量不能當手機耗時保證。

發布候選由48.905MB／479檔增加至約50.205MB／484檔，增加5個正式模組，沒有新增怪物圖包；development、work、測試與稽核資料不進入發布包。

## 驗收界線

同一整合 PR 執行必要 Functional CI、Runtime Integrity 與既有 Publication Dry Run 候選包驗證，沿用新提交取消舊PR執行機制，不新增任意執行時間限制。候選包驗證不是正式 Pages 部署。

實體 iPhone、長時間溫度／耗電／實際程序記憶體與正式站發布後驗證，仍需使用者批准合併發布後進行；本機WebKit與390px／橫向回歸不冒充真機驗收。不要自行合併 main。
