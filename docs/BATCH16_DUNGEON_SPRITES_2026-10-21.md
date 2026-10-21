# 第16批：副本怪物 Sprite 整合與驗收

狀態：施工候選，尚未封箱。基準main：cff02989（開工時fresh fetch）。

## 稽核與修改

正式來源為dungeonbounty.js的兩組15名稱（dungeoncore.js發出bounty）、dungeonarena.js兩組3名稱及stage、dungeonvoid.js兩組10名稱與floor、mirrordungeonrun.js的鏡像名稱與world。combat-events.js→formal projection/controller→既有正式Renderer傳遞身份；無修改戰鬥計算、獎勵、次數、存檔、VIP、離線或Fast Catch-up owner。

資料沿data/monsters三檔與既有產生器，共665身份（原609不變＋56副本）、21原型。正式resolver僅擴充world1/2的bounty、arena、void；不放寬main、高維、災厄、異宇宙或特殊怪。虛空world3保持原回退。副本體型由現有applyBattleSpriteLayout依真實Alpha與待機1600ms週期計算，限定1.00～1.50；不足空間共同縮小，副本接近位移留在成對間距內。沒有新增尺寸演算法檔。

鏡像沿用WholeSuitActor、正式appearance entry與原動畫sample；單一反射選項使其左向，配冷紫銀白。GM沿原測試中心新增副本→身份篩選，保留原型檢查、唯讀視覺參數與速度／六動作，沒有新增手動倍率／偏移調整。修正鏡像Actor在GM回收時須移除Canvas。

特效保留材質明暗，只用少數局部陰影、細輪廓光、sample驅動的微漂浮、低強度脈動與靜態微殘影。不新增粒子圖片、回合計時器、獨立Renderer或持續濾鏡動畫。資源載入有2500ms可選圖片期限；成對版面完成後一次顯示，失敗不阻止正式戰鬥。

## V-01

- 正式ID：void-phantom-v01；assets/monsters/v1/void/void-phantom-v01.webp。
- 213902 bytes；SHA-256：6b52b6a956847f0ce77c0043187dbc3a85b6e87e12f2026476246187ff8c133d。
- ZIP CRC、路徑安全、manifest雙圖SHA／bytes、WebP格式、512×512、RGBA、Alpha 0～255與bbox [67,31,444,481]已校驗；視覺檢視為左向3/4且完整留邊。
- 幻境遊魂、異相戰影、迷界殘像、空間殘響共用。首次實際截圖發現幽藍偏綠，改為完整sepia基底再著色，維持材質與陰影；沒有改圖或覆蓋energy-01。
- ZIP原文件及透明PNG僅存development/monster-art/batch16-v01，不進Pages或智慧下載。舊manifest的未授權狀態為交接歷史，本次使用者完整施工指令已授權整合。

## 施工驗收

56身份×桌機1365×900、直向390×844、橫向844×390，逐筆正式與GM實際Alpha、配色、邊界、左右分離、六動作、死亡透明及最大接近位移。本機最終結果168/168成功，0失敗；待機實際比例1.079977349～1.430136986，正式／GM最大絕對誤差0.000230123（0.023013個百分點）。每身份包含六動作逐35ms取樣、最大接近位移、邊界與死亡透明。證據：development/combat-animation/batch16/all-identities.json。

原609身份×3＝1827/1827成功（特殊9身份仍GM限定）；最低91.358799%、原地圖倍率／身份資料逐筆不變。21原型全部動作邊界、180次資源壓力及GM切換／撤權／故障回復三視窗通過。鏡像2紀元×3視窗＝6/6，實際水平反射、六動作、尺寸／方向與回收通過。56身份×四故障＝224/224通過，原頁恢復、最終refs/pending/bytes皆0。八個真實index副本公開入口（兩紀元×四模式）通過，確認正式事件身份、對應Sprite、鏡像角色名／appearance與回收。完整Batch6與跨模式回歸待最新候選Actions完成。故障測試逐身份四種故障、每種兩次恢復進出，另保留原Batch15每種12次回歸。

## 發布門檻與未測事項

最新PR head的必要Actions全部成功後才合併，合併後main Runtime／正式／GM／Pages須核對同SHA。進行中、跳過、取消、舊SHA全綠均不等於成功。本文件目前不宣告已發布。

真實iPhone Safari溫度、耗電、長時間動畫流暢度、OS掛起／恢復仍待人工真機；真帳號雲端寫入未測。瀏覽器自動化不代表上述真機項目通過。

## 首輪Actions修復

PR #66首輪head 89da0b81的GM／Formal發布失敗來自手動更新publication lock時JSON欄位順序與原生成器不一致（資料數值相同），已依equipment-gm-publication.py原生成器重建；未放寬SHA／bytes驗證。GM用語Gate與Batch6僅因快取入口斷言仍要求Batch15 token而失敗，已精確更新本批token。全部既有用語與核心斷言保留，下一head必須重跑所有必要Actions。
