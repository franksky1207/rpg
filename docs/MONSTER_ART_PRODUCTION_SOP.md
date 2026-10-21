# 《文明戰線》怪物製圖與正式整合 SOP v1.1

> 生效：2026-10-21。依第13批20圖整合、第15-1～15-4批驗收歸納。每批開工前先讀最新 main、PROJECT_HANDOFF.md、本文件、實際資料與相關測試；main 是唯一正式真實來源。未授權不得自行擴大正式啟用範圍。

## 1. 成功定義與固定規格
- 怪物美術採科幻2.5D／3/4視角，清楚易辨、適合小尺寸戰鬥；不追求過度精細3D或複雜骨架。
- 素材512×512，背景必須有真正Alpha透明；怪物原生面向左，完整主體與輪廓不能截斷。正式部署使用透明WebP，PNG原始素材、來源與SHA留在開發區，不能誤放入Pages／智慧下載。
- 每張圖先描述輪廓、武器、機械／生物特徵、與既有原型的差別，再逐張製圖、逐張人工確認。背景、朝向、造型有錯先修圖，不能以CSS掩飾。美術核准不等於程式驗收。
- 相似身份共用原型，重要Boss及明顯不同外觀需單獨評估；身份差異可用有限配色、體型與偏移表達，但不能讓名稱與外型嚴重不符。
- 玩家在左、怪物在右；正式戰鬥與GM的怪物／玩家**實際可見高度比例相同**。地圖怪物不低於玩家可見高度90%；授權副本身份以第16批規則限定1.00～1.50倍；空間不足時雙方一起等比例縮小，禁止GM單獨補倍率。特殊巨型身份可大於玩家。

## 2. 逐批工作順序
1. **來源盤點**：讀正式地圖、Boss、特殊身份與現有原型；依名稱意義分類、列共用關係及例外Boss，確認本批範圍和正式Sprite啟用範圍。
2. **原型設計**：先核對已存在圖，避免重畫；逐張提出造型描述、辨識重點、面向、透明背景要求；每張獲得使用者確認後才繼續下一張。
3. **封裝與素材校驗**：原圖與部署WebP分離；核對ZIP CRC／路徑安全、512×512、真實Alpha、邊界、WebP格式、bytes、SHA-256、唯一ID與路徑；保留原六張等既有素材的雜湊，不得無故重壓。
4. **身份映射**：以 data/monsters/monster-assets.json、monster-mappings.json、monster-variants.json 為來源，透過 scripts/generate-monster-trial-registry.py 生成正式登錄。逐筆核對正式名稱、地圖索引、slot、Boss ID、specialId、assetId、palette、scale、offset與動作。歷史plannedAssetId僅供追溯，實際以有效mapping為準。
5. **GM先驗**：使用既有角色與動作測試中心；以「原型→使用此原型的怪物身份」選取，配色／大小／原型摘要唯讀，速度可保留；勿恢復一大堆人工配色與倍率選單。逐身份檢查顏色辨識、比例、左右對打、四動作與切換回收。
6. **正式整合**：只有明確授權的怪物與戰鬥模式才開正式Sprite。重用現役MonsterActor、MonsterPool、正式Renderer與同一版面owner；不能另外建立GM尺寸算法或補丁檔。保留背景、極簡、連戰、數值、獎勵、存檔及智慧下載既有owner。
7. **驗收**：每個實際身份均跑桌機1365×900、手機直向390×844、橫向844×390；量測真實Canvas不透明像素、玩家與怪物相對高度、地圖90%下限／副本1.00～1.50倍、GM／正式比例誤差、舞台越界、左右分離、配色與身份。未正式啟用的身份必須明列「GM通過、正式不適用」，不能算成正式Sprite通過。
8. **故障與跨模式**：測試HTTP／SHA／解碼失敗、清除資源重下載、下載中離場、快速換怪、初始化中dispose、晚到lease釋放、背景切換、跨戰鬥、背景／離線／Fast Catch-up、連戰、文明災厄；確保可原頁恢復，refs／pending／bytes不殘留，不動玩法資料。
9. **發布封箱**：每批一次完整施工、自我檢查、最新PR head同SHA必要Actions、合併main、合併後Runtime與Pages實際發布核對。失敗須讀log修根因；取消、執行中、舊SHA綠燈皆不等於通過。輸出修改內容、逐身份結果、失敗清單、Actions、main SHA、Pages及真機未測項目。

## 3. 第一次20原型／609身份成功基準
- 第13批：20張透明WebP（原六張＋新增十四張）；609身份（銀河500、宇宙Boss100、特殊9）有效映射，20原型均有使用；63筆名稱／外型錯配已修正。
- 第15-4批：以3d-test/monster-actor.mjs的共用 applyBattleSpriteLayout 為版面owner，正式Renderer及GM直接重用；真實Actor 256px待機Alpha>16像素與1600ms待機週期量測，避免畫布透明邊與動畫造成誤判。量測資料按素材／tier快取，不能逐動畫幀讀回。
- 609身份×3視窗＝1827案例全過，最小可見高度比例91.3588%，正式／GM最大比例差0.041807個百分點。600身份屬當批正式Sprite適用範圍；9特殊身份GM通過、正式resolver不適用。**不得推論高維、異宇宙或所有副本都已啟用Sprite。**
- 資源故障恢復、Batch6跨模式回歸及正式／GM瀏覽器測試通過；真實iPhone溫度、耗電、OS背景掛起、真帳號雲端仍須另行真機驗證。

## 4. 失敗模式與禁止回退
| 過去失敗 | 固定解法 |
|---|---|
| 背景假透明、造型重複、面向錯 | 原始Alpha與實際像素驗證；逐張描述與核准，不能反覆盲畫 |
| 只看20原型導致身份錯配 | 全部正式來源身份逐筆映射及名稱／外型檢查 |
| GM選項過多、顏色差異不清 | 原型→身份兩層唯讀預覽，有限但清楚的身份配色 |
| GM怪物比正式小、90%檢查失敗 | 共用Actor版面owner，量測真實Alpha；雙方共同縮放 |
| 以0.68估算透明內容、92%／99%補倍率 | 禁止猜測補償倍率；不得恢復已刪 monster-visible-size.mjs |
| 載入後動畫消失、清除快取後失效 | 共享資源池、SHA、late lease釋放、重試與故障注入 |
| 歷史守衛與快取版本測試失敗 | 僅精確允許合法範圍與版本token，禁止放寬整個守衛 |
| Actions未結束就宣告完成 | 同SHA全綠、main合併、Runtime與Pages核對後才封箱 |

## 5. 重要程式與報告入口
- 資料：data/monsters/monster-assets.json、monster-mappings.json、monster-variants.json
- 生成：scripts/generate-monster-trial-registry.py
- 共用Actor／版面：3d-test/monster-actor.mjs
- GM：3d-test/gm-era-sprites.mjs
- 正式Renderer：3d-test/t3b-formal-renderer.js
- 測試：tests/runtime/batch13-monster-browser.cjs、batch13-monster-mappings.cjs、batch13-monster-pool.test.mjs
- 基準報告：docs/MONSTER_ART_BATCH13_TWENTY_INTEGRATION_2026-10-20.md、docs/BATCH15_4_FORMAL_GM_ACCEPTANCE_2026-10-21.md
- 全身份證據：development/combat-animation/batch15/all-identities.json

本SOP適用後續怪物製圖與整合；如現役main實作更新，須先稽核差異、經確認後同步修訂SOP，不能依舊文件覆寫新程式。

## 6. 第16批副本擴充
- 固定56身份：銀河／宇宙懸賞各15、競技場各3，虛空一般10／Boss10；精確mode、world、kind及正式名稱匹配。競技場校驗stage，虛空校驗floor及Boss循環。高維、災厄、異宇宙及special仍排除。
- 新原型void-phantom-v01沿用既有資料生成流程，僅四個正式虛空身份共用；20個既有原型WebP不可重壓。
- 副本visual.sizePolicy=dungeon使用原monster-actor.mjs版面owner，以實際待機Alpha週期極值限制1.00～1.50；地圖原90%下限與原身份資料不變。CSS局部光效不計入本體高度。
- 鏡像使用同一WholeSuitActor的水平反射選項與正式appearance entry；不新增玩家動畫、資源池或計時器。GM與正式同版面、同配色、同朝向。
- 光效採局部drop-shadow與現有sample驅動的微漂浮／低強度脈動；reduced-motion、低核心裝置、data-effects=off停非必要光效。極簡／背景仍由既有正式policy回退。
- 新驗收入口：batch16-dungeon-contract.cjs、batch16-all-identities-browser.cjs、batch16-mirror-browser.cjs、batch16-monster-recovery-browser.cjs。原609身份1827案例與既有Batch13／Batch6測試須保持通過。
- 最終候選是否封箱，以第16批報告、最新PR head及合併後main的Actions／Pages實際結果為準。

第16批追加身份語義守衛：名稱明確以艦／艇結尾者使用starship輪廓；核心／主機使用core輪廓；艦長／艦主等指揮官本人不誤判成艦艇。自動尺寸／配色測試不能代替名稱與輪廓逐筆覆核，封箱前須檢視56筆identity-review.json及GM實際圖像。

## 第16批補修：特殊怪正式 Sprite（2026-10-21）
- 將已完成GM映射的9隻特殊怪正式啟用，銀河／宇宙各9個身份組合。第二紀元有獨立正式名稱，仍以原本specialId作為唯一身份owner，不做模糊名稱推測。
- `specialcore.js`在既有`visualContext`以`location=enemy.specialId`傳送唯一身份；`monster-formal-resolver.mjs`明確限制9個ID及各紀元名稱；正式Renderer另開`special`模式白名單。
- 9筆`monster-mappings.json`與生成登錄的狀態改為`special-formal-enabled`，**不增加圖片、不改經驗／傷害／獎勵／掉落／存檔／戰鬥算法**。高維特殊遭遇仍被原邏輯禁止。
- 驗收須涵蓋18個身份／紀元組合、3種視窗、正式／GM共同版面、模式切換、背景／Fast Catch-up、資源失敗回退、智慧下載與cache清除。靜態契約通過不代表實際瀏覽器、iPhone或Pages已驗收，須記錄真實結果。

### 第16批特殊怪追加修復與可重現驗收
- 補齊首頁 `specialcore.js`／正式 Renderer 以及 GM 入口的 URL 版本；共用 monster pool、Actor、resolver 使用同版登錄，避免舊快取繼續漏圖。
- special resolver 限定啟用狀態、九個精確 specialId、各紀元正式名稱；若另外提供 id，必須與 specialId 或正式 mapping id 一致。未知身份安全保留替代輪廓。
- 共用 `battleSpriteLayout` 對特殊怪保留接近距離與動作空間，修復窄舞台靠近時角色重疊；不改 mapping 尺寸、不降低 90% 最小可見高度、不新增 Renderer／計時器／圖片。
- `batch16-special-contract.cjs` 從實際 gameplay owner 讀取名稱，驗證18組身份、原型、面向、錯誤欄位拒絕及 specialFightCore 的 context／結果。
- `batch16-all-identities-browser.cjs` 現涵蓋56個副本身份與18個特殊怪紀元身份，共74組×3視窗=222案例；逐個檢查 GM／正式像素、尺寸、包含、間距、idle/attack/hit/dodge/return/defeat 全動畫與死亡清空。
- `batch16-special-live-browser.cjs` 經真正 maybeHandleSpecialEncounter → buildSpecialMonsterFromPlayer → specialFightCore → combat events → 正式投影／Renderer → 結算／save，驗證18組正式Sprite可見且替代輪廓隱藏；再對18組檢查 Fast Catch-up 不建立Sprite並保持結算一致。僅固定隨機遭遇選擇，未替換戰鬥／獎勵／存檔 owner。
- `batch16-cross-mode-browser.cjs` 擴至260次模式切換，包含18種特殊怪組合、地圖、懸賞、競技場、虛空、鏡像與既有排除模式；檢查背景清快取、重入、降級與零殘留 lease。
- `batch16-monster-recovery-browser.cjs` 擴至74組×4故障=296案例，HTTP／SHA／解碼／載入離場後原頁復原、連續重入與清除；`batch16-resource-timeout-browser.cjs` 加入18組特殊怪逾時復原。
- 原609筆對照基準僅允許九筆指定狀態改動，其餘欄位保持逐筆 deepEqual，並保留56筆副本、原型SHA與既有第15批回歸；不可用刪除測試取代驗收。
- 自動化證據：PR #70 最新提交的 **Batch16 Dungeon Sprite Acceptance** artifact `batch16-dungeon-evidence`（`/tmp/batch16-*.json` 與畫面）；第15批／GM證據由 **Batch13 Twenty Monster GM Integration** 保存。最新提交全部必要 Actions 完成 success 後才可合併，合併後另核對 main Runtime／Pages；queued／in_progress／skipped／cancelled 皆不代表通過。
- 此處記錄測試範圍與重現方式，實際發布結論以對應 SHA 的 Actions／部署為準。Chromium桌機與手機視窗模擬不等同 iPhone Safari 真機；GPU、溫度、電池、長時間背景恢復須玩家真機確認。
