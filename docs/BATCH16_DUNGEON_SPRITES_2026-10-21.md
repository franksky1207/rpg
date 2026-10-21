# 第16批：副本怪物 Sprite 整合與驗收

狀態：工程驗收通過；最終候選Actions、正式main／Pages封箱證據以 [PR #66最新紀錄](https://github.com/franksky1207/rpg/pull/66) 為準。基準main：cff02989（開工時fresh fetch）。

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

原609身份×3＝1827/1827成功（特殊9身份仍GM限定）；最低91.358799%、原地圖倍率／身份資料逐筆不變。21原型全部動作邊界、180次資源壓力及GM切換／撤權／故障回復三視窗通過。鏡像2紀元×3視窗＝6/6，實際水平反射、六動作、尺寸／方向與回收通過。56身份×四故障＝224/224通過，原頁恢復、最終refs/pending/bytes皆0。八個真實index副本公開入口（兩紀元×四模式）通過，確認正式事件身份、對應Sprite、鏡像角色名／appearance與回收。本機完整Batch6為32/32、16類、36個不同原始測試，同次執行、沒有沿用舊證據；原始log與報告存於本批cross-mode.json及batch6-final16-logs。另通過cross-combat-stale-continuous、unified-combat-runtime、cross-mode-late-settlement與pr48-stop-contract。故障測試逐身份四種故障、每種兩次恢復進出，另保留原Batch15每種12次回歸。

## 發布門檻與未測事項

最新PR head的必要Actions全部成功後才合併，合併後main Runtime／正式／GM／Pages須核對同SHA。進行中、跳過、取消、舊SHA全綠均不等於成功。本文件由候選分支產生，合併SHA與實際Pages指紋不能預填，完整最終發布紀錄以PR #66最新說明及對應同SHA Actions核對。

真實iPhone Safari溫度、耗電、長時間動畫流暢度、OS掛起／恢復仍待人工真機；真帳號雲端寫入未測。瀏覽器自動化不代表上述真機項目通過。

## 首輪Actions修復

PR #66首輪head 89da0b81的GM／Formal發布失敗來自手動更新publication lock時JSON欄位順序與原生成器不一致（資料數值相同），已依equipment-gm-publication.py原生成器重建；未放寬SHA／bytes驗證。GM用語Gate與Batch6僅因快取入口斷言仍要求Batch15 token而失敗，已精確更新本批token。全部既有用語與核心斷言保留，下一head必須重跑所有必要Actions。

## 智慧下載與視覺跨模式補驗

稽核發現既有SW預載／formal sprite磁碟修復只包含原八個素材目錄；V-01雖已在manifest，仍需要兩處精確白名單。resource-cache-sw.js僅新增V-01正式完整路徑，沒有泛開void資料夾。batch16-cache.cjs實際執行原SW函式，驗證背景首次下載、warm重用、清除後重下載、毀損磁碟內容重新驗SHA並修復、HTTP與SHA失敗重試；預覽PNG及未授權void圖片均排除。原SW／資源測試維持通過。

另於同一正式舞台執行10輪地圖→懸賞→競技→虛空→鏡像→災厄→高維競技→異宇宙，共80次替換、停止／重新建立、活躍lease清快取與特效降級；只有授權模式有新Sprite，最終pool refs/pending/bytes歸零。這是正式Renderer跨模式測試；完整玩法流程、極簡、背景、離線、Fast Catch-up仍由Batch6與專用owner回歸驗證，不將隔離舞台宣稱為全流程真人遊玩。

## 最終工程驗收索引

- all-identities.json：56身份／168案例。map-regression.json：原609身份／1827案例。
- monster-recovery.json：56×四故障＝224案例。resource-timeout.json：V-01超時回退與後續兩次重入。
- mirror.json：兩紀元×三視窗六案例。live-dungeons.json：兩紀元×四種副本八個真實入口。
- visual-cross-mode.json：80次正式Sprite舞台切換、背景快取清理、效果關閉、不啟用災厄／高維競技／異宇宙；3000次取樣CPU p50 0ms、p95 0.2ms、最大2.6ms（此執行環境，非GPU／iPhone耗電測試）。
- cross-mode.json／batch6-final16-logs：32/32、16類、36個不同原始測試；screenshots：三視窗正式實際截圖。
- SW測試：batch16-cache.cjs執行真實SW函式與Cache API替身；不將替身宣稱為真機或完整瀏覽器SW驗收。Pages上線後另核對實際資源指紋與真實入口。

PR #66中間head 203492b0的10項Actions全成功。追加的V-01 SW白名單、快取測試、80次視覺切換、資源超時及完整證據必須以其後最終head重新驗收；203492b0綠燈不能代替最終head。發布前不改傷害／HP／ATK／DEF／掉落／存檔／VIP／離線或Fast計算。

## 原生SW與完整效果降級

另以真正Chromium Service Worker／CacheStorage實測76個選定媒體：首次預載saved76／failed0；warm再預載saved0；V-01磁碟毀損重新驗SHA並修復；清除後重新預載saved76／failed0；開發PNG不入快取。測試已納入batch16-native-cache-browser.cjs，仍不代表iPhone OS背景或耗電測試。效果關閉策略由同一Actor helper共用，除了CSS輪廓光，亦停用本批新增的漂浮與脈動；四個V-01身份在效果關閉時Canvas像素與無特效原型逐位元一致，保留基本配色與原有動作。這些追加檢查須以最終PR head的Actions確認。

## 合併後發布Gate補修（仍屬第16批）

PR #66最終head 66ef32b8的10項Actions全成功後合併為dddb4c81。合併後僅在main執行的Pages／Stage4 Gate讀log確認，失敗來自publish-candidate-browser.js舊預載斷言仍為49＋6＋20＝75，而新V-01使實際總數為76。遊戲／候選建置與素材校驗成功，但Pages部署被正確擋下，沒有誤稱發布。

必要補修：預載數量改為49＋6＋正式21原型，並新增21原型數量、V-01正式路徑與逐資產manifest存在性斷言；保留failed0、精確entries、Range206、清除後0及存檔隔離斷言。此完整publish-candidate-browser.js測試亦納入第16批PR Gate，避免再次只在main才發現。最終發布main SHA與全部Actions，仍以第16批PR最新說明核對。

## 最終名稱／輪廓語義覆核

逐筆覆核56身份，修正三項宇宙懸賞原型：暗物質武裝艇由固定砲台veh-02改為巡弋艦ship-01；萬域私戰艦由巨型機甲mech-03改為母艦／帝艦ship-04；跨域劫掠主機由重機甲mech-02改為防衛核心core-01，並同步沿來源更新動作類型。虛境帝皇改深紫，與同原型的幻域支配者幽藍形成可辨配色。

這些是視覺資料修正，21圖位元、56正式名稱、玩法owner、事件、獎勵與存檔均不變。補上人工語義覆核的艦艇／核心契約斷言，所有新增繪製消費鏈精確更新到dungeons2快取版；歷史守衛只逆轉該精確token，不放寬其他內容。須重跑全部168、原1827、資源與正式／GM／發布驗收，最終head／main與Pages仍以PR #66封箱紀錄為準。

語義修正後重新量測：168/168、0失敗；可見比例 1.079977349188901～1.4301369863013698；GM／正式最大絕對誤差 0.00023012278292933175。逐筆證據已更新all-identities.json；56筆語義覆核表見development/monster-art/batch16-v01/identity-review.json。

線上驗收另定位到原隔離測試角色在宇宙競技場被一擊擊倒，畫面於冷載入前結束，屬觀察視窗不足；僅把該測試案例改為可觀察多回合的隔離輸入。正式戰鬥owner／HP／ATK／DEF規則沒有修改。這項測試修正亦納入本次最終head，避免依靠低延遲localhost偶然通過。
