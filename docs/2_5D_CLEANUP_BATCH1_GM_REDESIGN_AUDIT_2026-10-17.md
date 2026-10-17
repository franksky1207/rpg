# 《文明戰線》清理第1批盤點與GM測試中心改版規劃

日期：2026-10-17（臺灣）。**只完成盤點、基線測試與規劃；未執行第2～4批，未修改遊戲、GM介面、資料或資產，未刪任何追蹤檔。**

基準：`franksky1207/rpg` main `5bfb00a44fd18263e3fe79581255871024f4396c`；完整tree `ef2ffe3910908c5021729252f370822a3745e1c2`。原工作目錄保持不動；獨立副本實際fetch該SHA後測試。已讀指定五份文件，但施工現況依程式、tree及實測；10/17四批清理決策優先於舊G20／210角色／420概念圖義務。

## 交付與讀取

同目錄 `cleanup-batch1-gm-audit-2026-10-17.json.gz` 是完整機器可讀清單與測試證據，gzip僅減少本次報告容量，不是將舊資產搬移封存。下載後以 `gzip -dk` 或Python `gzip.open(..., 'rt')` 讀JSON。

- `inventory.files`：全部4,549個追蹤檔的完整路徑、bytes、SHA-256、類別、Runtime／GM／發布必要性、處置、理由、批次、逐檔引用（來源、行號、類型、摘錄）。其中3,859檔與本次相關，其他690檔明確保留。
- `inventory.conditionalVanishingDirectories`：完整預計消失目錄；`gmFeatures`：31場景及全部偵測UI控制、來源與建議；`gmRelatedFiles`：測試中心相關逐檔清單。
- `gmBRequestClosure`：固定B的174項manifest請求並集、374項非B集合、推導程式與限制。
- `dynamicEvidence`、`publicationClosure`、`workflowSources`：動態載入、實際發布閉包、全部工作流；`formalEquipmentBaseline`：從正式owner擷取的210套／1,050槽，不是新權威資料庫。
- `testAttempts`、`effectiveTests`、`logs`、`ci`、`selfCheck`：實際命令／exit／時間／失敗輸出、保留的初輪失敗、exact-SHA Actions與零變更驗證。

## 全庫結果與刪除邊界

完整追蹤檔4,549個，共801,394,111 bytes。每檔另有用途、宣告說明或資料schema欄位；`batch=null`表示保留且未排入清理，2／3／4則須合併處置欄位閱讀。掃描2,821個文字／DOCX XML／GLB JSON內容；其他1,728檔計算實體大小及SHA。另檢查1,590筆圖片標頭、Blender內嵌路徑提示與壓縮檔目錄，未發現圖片標頭讀取錯誤；Blender提示不是完整語義依賴證明。涵蓋隱藏workflow、根目錄正式程式、development、assets、3d-test、docs、tests、scripts、發布、manifest及SW。引用包括完整／相對路徑、唯一basename提示、SHA、索引與目錄組合、實際builder及staging閉包。**文字命中不是執行證明；未命中也不是可刪證明。** basename提示在清單中另外標記，不能單獨授權刪除。動態路徑以實際manifest／registry與瀏覽器測試補查；未驗證分支保守保留／待確認。

| 處置 | 檔案 | bytes |
|---|---:|---:|
|必須保留|1043|263852936|
|拆除依賴後刪除|3446|529682899|
|待確認|60|7858276|
|可直接刪除|0|0|

「拆依賴後刪除」為第2批移交有效契約並驗證後的**條件式估計**，不是現在可執行的刪檔指令；共529,682,899 bytes，約529.68 MB／505.14 MiB。預計355個Git目錄可消失（包括巢狀目錄，不是355個頂層資料夾）；正式保留檔／新文件落點改變時須重算。容量以最新tree逐檔bytes計算；Git歷史維持，Pages與clone容量須另外量測。60個待確認共7,858,276 bytes，不計入預估刪除容量；主要是B2/B3原稿、工具、授權、source-lock及再生成契約，未證明可退役前禁止刪除。

| 條件式刪除類別 | 檔案 | bytes |
|---|---:|---:|
|CI／Pages／資源產線|1|3795|
|舊3D原稿／建模工具／審查歷史|115|38369853|
|3D registry要求的來源／授權SHA|2|37070048|
|舊210套概念／索引／原PNG／WebP／審查／notes|874|352471565|
|2.5D開發角色／武器／來源／驗證模組|27|8960250|
|舊A/C比較或過度發布的素材與展示頁|377|11828396|
|GM／正式B混合預覽與圖集|638|50719345|
|舊美術規劃／驗收／證據|1378|29170215|
|舊210套量產／審查專用工具|5|53710|
|舊概念／歷史SHA測試|29|1035722|

概念目錄874檔／352,471,565 bytes：192 WebP（190張現行概念＋2張舊版本）、130 PNG、173 JSON、379 Markdown。不能用文件的190張概念推定所有WebP／原PNG數量。預計整個`development/3d-source/equipment/concepts/`、`tests/equipment-concepts/`、`development/retired-formal-previews/`及逐批歷史證據目錄消失；B2/B3當前GM閉包不能整包刪。

正式210套ID、中文五槽、屬性／掉落／品質／強化／混穿及規則一律保護。既有`formal_sets()`從`data.js`、`worldmaps-*.js`、`engine.js`、`secondworlddata.js`／rewards、`thirdworldloot.js`／data擷取：G001～G100、U001～U100、H01～H10，共210套／1,050槽通過。全部正式來源的bytes／SHA也已鎖入盤點；本批沒有改名、重算或遷移存檔。

## 必須先拆除的實際依賴

1. `equipment-concepts.py`混合正式owner擷取與concept ledger／notes／審查；`equipment-concept-batches.py`讀索引、要求兩圖與notes；`equipment-art-review.py`綁schema／來源與歷史SHA。退役專用流程前，先將仍有效的身份、來源完整性與發布隔離斷言移交到既有正式測試，不能刪掉有效覆蓋。
2. `equipment-sprites.py`動態import concepts；`equipment_sprite_assets.py:51–75`檢查身份、概念批准、conceptSha256、PNG／review／parent來源。`equipment-weapon-assets.py:11–32`讀兩個development registry，硬編碼三套並檢查來源／review。須拆舊制度，保留圖像解碼、透明／尺寸、SHA／bytes、授權、版本、回退與角色／武器層檢查。
3. `equipment-gm-publication.py:13`直接讀`_concept-index.json`，並由`verified_entry()`繫結舊批准／來源鏈，輸出9張WebP、catalog與4個共用模組；`equipment-formal-publication.py`從GM catalog派生正式三套批准。這是「概念圖不進正式下載，但刪除仍可令發布失敗」的明確鏈。
4. `publish-assets.cjs`先執行`gm-sprite-publication.cjs`／`formal-sprite-publication.cjs`及`asset-registry.cjs`。必留`development/equipment-2_5d/gm-publication.json`、`formal-publication.json`及其精確allowlist。`asset-registry.cjs`亦驗證Blender `asset.source.path`／SHA；兩份Blender目前是發布驗證依賴，必須先去耦才可退役。第三方`vendor/.../SOURCE.md`、LICENSE不是廢棄美術，保留。
5. `equipment-phase6-audit.cjs`目前斷言G007的15個GLB、Blender來源、工廠consumer與正式不下載舊引擎等；須移交仍有效的正式／GM隔離、回退與資源斷言，再退役舊固定模型數要求，不能整支關閉。
6. `gm-battle-simulation.js:37–40`動態載入`fixture-input.mjs`／`playback.mjs`／B3 renderer。`fixture-input.mjs:77–80`組合owner-fixtures／comparison-controls路徑，驗證正式來源、rig-contract、source-evolution與原registry。B3 `assets.mjs:20–26`驗證manifest SHA並組合B2 atlas路徑。因此先保護固定B所需174項manifest檔及共用程式；其餘374項先拆舊A/C、完整manifest與staging依賴，不以路徑或發布選入單獨決定保留。
7. `stage-hybrid-preview.cjs:23–28`加入manifest.files／vendor及明確依賴。Pages流程先完成正式候選稽核，再加入受控GM預覽，最終上傳含此閉包的同一stage。原正式builder為412輸出檔／37,397,489 bytes、0缺引用、32背景、6音樂、11音效；stage另加551檔／45,787,144 bytes。進一步由GM固定scheme B、renderer commonPaths、NativeActor玩家分支與AtlasActor的三敵人×六動作×三tier／master metadata推導：manifest.files的548項中，174項屬固定B請求閉包，374項只供舊A/C或過度發布；另有獨立比較頁HTML／JS／CSS三檔。這377檔共11,828,396 bytes列拆依賴後刪除，先撤舊入口、移交有效斷言、縮窄manifest及atlas metadata並更新MANIFEST_SHA，才可刪檔。174項只是manifest部分，不含父bridge、fixture、Playback、共用renderer、9張WebP等其他必要依賴。不能只看前段正式manifest就斷言Pages沒有development檔。
8. 正式`index.html`／entry／renderer共用`armor-selection.js`、formal-player-sprites、sprite actor／pool／animation／contract。**保護**`assets/gm-equipment-2_5d/v1/`的g005／g007／g018各角色、attack-body、weapon共9張WebP及必要catalog。G005／G007／G018舊概念、歷史審查與資格仍列退役，不將它們當未來三紀元來源。
9. `shared-loader.js`動態載入引擎／scene／runtime／appearance；`character-assets.js`由registry的asset.path組合下載。現有18個玩家／G007 GLB及必要registry／引擎／loader仍有GM／B分支consumer，本次保護。`prototype-engine.js`工廠、`runtime.js`、formal snapshots／owner-clock等不能隨展示入口整檔刪除；需要修改正式Runtime才可移除時須另案授權。
10. `resource-cache-client.js`／`resource-cache-sw.js`以manifest內容指紋及媒體白名單管理快取；不重設玩家storage或改cache政策。第2批拆除相關workflow的concept `generate`、舊gate及正常工具再生入口；現`generate`可重建notes／索引，不會替代真生圖。第3批重建發布stage／manifest，第4批核對cache及舊路徑零殘留。

## GM現況逐項處置

實際`test-center.js:5–40`為8類31場景；舊六類說法失效。以下是**場景入口**分類，詳細UI、程式、來源、用途、按鈕與依賴在`gmFeatures`。另將無核准來源的圖集列待確認，不能冒稱已可展示全部怪物。

| 現有場景 | 建議 | 邊界 |
|---|---|---|
|三紀元主畫面|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|銀河紀元星圖|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|宇宙紀元星圖|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|高維紀元戰線|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|角色全身展示|建議整合|保留2.5D分支、整合角色頁；移除舊3D分支|
|五槽裝備陳列|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|強化鍛造台|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|八種專精星環|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|十印記星環|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|文明等級核心|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|界弦核心|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|副本作戰中心|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|懸賞戰準備區|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|競技場|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|鏡像戰紀錄|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|虛空幻境樓層|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|銀河文明災厄封印|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|宇宙文明災厄封印|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|異宇宙前線|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|2.5D 戰鬥模擬|必須保留|保留實際2.5D對戰、播放與速度|
|護盾防護演出|建議整合|併入同一對戰畫面；舊幾何展示退役|
|特殊遭遇演出|建議整合|併入同一對戰畫面；舊幾何展示退役|
|結算與戰利品|建議整合|併入同一對戰畫面；舊幾何展示退役|
|文明戰線紀錄|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|文明劇情閱讀|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|文明轉生|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|設定中心|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|遊戲說明|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|帳號中心|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|雲端存檔中心|建議移除|退役舊幾何展示入口，正式玩法／管理保留|
|GM 管理中心|建議移除|退役舊幾何展示入口，正式玩法／管理保留|

共26個建議移除、4個整合、1個保留核心場景。三紀元主畫面、星圖、養成星環、副本／封印進度、故事／轉生、設定／帳號／雲端／GM控制台目前是舊幾何象徵展示，不是正式功能本身；移除展示不刪正式玩法或GM管理。

另建議退役直接URL的`development/hybrid-comparison/index.html`舊A/B/C比較展示、comparison.mjs／css；它不在現行GM的A/C切換選單，保留GM固定B共用程式。原A/C測試中仍有效的暫停、SHA、事件、釋放、背景與存檔隔離斷言必須移交；不保留舊全3D對比義務。

UI整理：移除舊八類／全部／搜尋、原3D角色與五槽GLB／32種subset／LOD展示、重複角色入口、幾何進度／養成控制、開發診斷長說明。保留GM同源授權、撤權、requestId、唯讀／自由隔離、退出／焦點／捲動、失敗重試及dispose；正式GM其他transaction與管理不動。合併兩處畫質、播放與角色來源控制；Atlas檢視需有效approved／publish catalog，否則顯示「尚無素材」，不偽造來源。

## 新定位與介面（只規劃）

建議名稱「GM視覺測試中心」，**兩類即可**：

1. **角色與動作**：單一角色選擇、待機／攻擊／受擊／閃避／死亡、重播／重置；武器層及命中效果依現有能力顯示。當前只有G005／G007／G018三套試行素材；目前五動作主要是單張人物平移／縮放／傾斜／透明加武器層，沒有獨立走路動畫。移動／返回只按實際模板標示。未來銀河／宇宙／高維三外觀為待製作，不能用這三套冒充三紀元成品，也不製作新圖。
2. **戰場與對戰**：同一2.5D畫面選可用場景、對手／普通怪／菁英／Boss、角色與比例，觀察武器／命中、HP／盾與結束效果。三紀元只是選取維度，僅展示已有素材；B2/B3目前的普通／菁英／Boss代表素材不等於三紀元全部怪物已完成。沒有正式來源者明示未提供。保留播放、暫停／繼續、重播、停止與1／1.5／2倍速。圖集逐格檢查放單一收合進階區；目前全庫僅測試有注入`CivilizationGMApprovedAtlasCatalog`，未找到正式賦值，空入口應退場，通用驗證能力另保護。不另堆副本、災厄、養成UI。

桌機上方兩頁籤、左側少量設定、右側大預覽；手機上下排列、設定可收合、觸控區至少44px、底部一列播放控制，支援直橫向與最大化／還原、Esc／鍵盤焦點；提供「遊戲大小／放大檢視」即可觀察角色、武器與Boss比例，避免增加工程尺度選單。一般畫面只顯繁體中文正式名稱、動作及可用／缺素材提示；不顯G批次／schema／SHA／LOD／引擎版本／開發診斷。來源只留「正式角色／自由預覽」一組，正式快照失敗不能默認fixture。預覽只消費既有renderer／Playback與正式唯讀資料，不改正式戰鬥時鐘、HP、死亡、傷害或收益。

## 測試基線與限制

本機實際嘗試與最終結果以機器清單為準；最終整理出182個不同命令／環境組合：177通過、3失敗／逾時、2環境阻擋。執行環境Node24.19.0、Python3.12.14、Pillow12.3.0、Playwright1.55.0配系統Chromium154（與CI下載瀏覽器及Pillow11.3.0有差異）。使用本機HTTP及測試既有fixture／Supabase SDK攔截，不是真帳號雲端驗收。

首輪程序沙箱造成`spawnSync git EPERM`與Chromium socket失敗，完整初輪log保留；取得遠端歷史與解除已確認的程序限制後重跑。首輪執行器230秒上限造成完整concept／js-integrity未完成，保留紀錄並完整重跑；未完成者絕不計通過。cache版本守門首次缺CI環境SHA參數，已用實際前後SHA補跑，沒有改測試。

| 重點基線 | 實際結果 |
|---|---|
| 整庫Runtime | 423份JS語法／owner與載入契約通過；正式browser-smoke通過 |
| 正式裝備 | 210套／1,050槽、三紀元ID順序與五槽名稱通過；來源SHA無變更 |
| 舊概念／歷史 | 133項完整unittest通過（1102.821秒），原SHA與負例斷言保留 |
| 文字／極簡／背景／離線／倍速 | VM／Chromium三紀元與故障回退測試通過；WebKit環境阻擋 |
| 正式2.5D／武器 | 實際正式戰鬥、缺材／錯SHA／解碼／慢載入回退、高維副本與武器時序通過 |
| GM發布與操作 | 最後串行GM測試121斷言通過；三角色、五動作、三尺寸、正式／自由、撤權、返回／重開通過；武器戰鬥串行通過 |
| 音樂音效 | 靜態／生命週期測試及50個實際瀏覽器情境通過；含formal sprite驗收變體 |
| 存檔／轉生 | 既有Schema17、遷移、保留裝備、三紀元轉生與GM交易契約通過；真雲端未測 |
| 發布／快取 | builder／audit／412檔HTTP bytes、17音訊解碼、49媒體快取、Range、清除不動存檔通過 |
| 仍用舊3D與GM共用能力 | 31場景、G007裝備、角色GLB、圖集負例、formal snapshots、batch28整合通過；完整A/B/C展示仍有逾時／操作失敗 |

未通過／未完成命令（如有）：

- `node tests/runtime/hybrid-comparison-renderer-browser.js`：exit 124。完整輸出見機器清單 `logs["test-logs/node_tests_runtime_hybrid-comparison-renderer-browser.js.log"]`。
- `node tests/runtime/hybrid-comparison-renderer-comparison-browser.js`：exit 1。完整輸出見機器清單 `logs["test-logs/node_tests_runtime_hybrid-comparison-renderer-comparison-browser.js.log"]`。
- `node tests/runtime/t4-preview-retirement-browser.js`：exit 1。完整輸出見機器清單 `logs["test-logs/node_tests_runtime_t4-preview-retirement-browser.js.log"]`。
- `BACKGROUND_BROWSER=webkit node tests/runtime/cross-era-background-browser.js`：exit 1。完整輸出見機器清單 `logs["test-logs/webkit-installed-cross-era-background-browser.js.log"]`。
- `BACKGROUND_BROWSER=webkit node tests/runtime/thirdworld-background-browser.js`：exit 1。完整輸出見機器清單 `logs["test-logs/webkit-installed-thirdworld-background-browser.js.log"]`。

初輪並行的GM scroll restore與武器切換曾失敗；兩者在其他完整套件結束後以原測試串行重跑均通過，初輪log仍保留。舊B沙盒亦在520.25秒完整串行複測通過，涵蓋三尺寸、五種戰況與真正授權父頁iframe；不因重跑成功抹除原失敗。所有來源均未改，不能把觀察直接定性為歷史產品bug或環境假警報。

T4「routes wrote formal state」失敗經JSON比對，僅`offline.lastSettledAt`及`offline.maxObservedWallClock`增加376ms，未發現裝備／獎勵欄位差異；沒有放寬斷言或記為通過。舊A/B/C比較工具曾卡在停用的「停止／取消」按鈕；另一完整展示套件900秒逾時，只完成部分桌機區段，剩餘三個手機尺寸、全部subset／tier段未完成，不得冒稱通過。這些是第2批移交有效覆蓋前須釐清的基線風險。

另以原`generate-resource-manifest.py`產生517項root內容指紋，與既有manifest逐項完全一致（0差異），沒有寫回正式manifest。此source manifest與builder重建的正式候選manifest用途不同。

同一基準SHA的Actions： [GM整合 success](https://github.com/franksky1207/rpg/actions/runs/38985213284)、[正式2.5D success](https://github.com/franksky1207/rpg/actions/runs/38985213106)、[Pages success](https://github.com/franksky1207/rpg/actions/runs/38985213247)。已進一步核對上述job／瀏覽器／部署步驟實際success；不是僅看總狀態。此基準main SHA只有這3個run；沒有exact-SHA Runtime workflow不能寫成Runtime CI全綠。本機Runtime命令結果另外列出。真iPhone／Android／Safari、真系統切換、30分鐘熱／記憶體、實際登入／雲端／跨裝置存檔均未測。已在work下載WebKit並實際嘗試兩個背景套件，但缺GTK4／Graphene／woff2／harfbuzz-icu／hyphen／manette／GLESv2，列為環境阻擋。

## 第2～4批施工順序與停止條件

**第2批先拆契約，再精簡GM入口**：先移交正式210套身份核對與有效斷言；去耦concept／review／歷史SHA／G024-G030例外及三套舊來源資格；保留通用素材、授權、SHA、發布白名單、回退及正式／GM隔離。把GM舊入口退場與所屬測試同步規劃，保留兩類真正可見預覽；對60待確認檔逐項確認再生成用途。不得改正式共用Runtime來湊刪除量。若依賴移除與刪檔不能分提交保持正常，須合成同一可驗收提交。

**第3批才實刪**：按重新核對後逐檔清單刪concept、原PNG／WebP、審查／notes、舊專用工具／fixture／SOP／證據；保留當前9張WebP、正式共用模組、發布鎖與必要GM閉包。不可移到archive／legacy／backup；以D而非R、最新tree與355個條件式目錄清單核對，容量按實際變更重算。

**第4批零殘留與回歸**：確認正常命令不再生成舊目錄，精簡handoff／舊規劃及GM目錄；核對正式owner／五槽／規則與存檔SHA差異、文字／極簡／背景／倍速／三紀元／GM／音訊／正式2.5D，build／asset audit／manifest／SW及最終SHA Actions／Pages。失敗、404、未授權、文字回退、時鐘／HP／獎勵差異或有效覆蓋降低均須停止。待確認項與真機未測不能包裝成封版成功。

輸出存於`audit/cleanup-batch1-gm-2026-10-17`報告分支，僅新增本文件與必要機器清單，未合併main。兩份B2/B3素材來源授權聲明已確認仍有用途，改列保留並規劃精簡舊條款；因此最終待確認為60檔。

本批自檢：原工作目錄與測試副本的tracked diff／cached diff均空、無D／R、無GM修改、無正式資產／資料變更；完整hash盤點可供後續比對。本次GitHub輸出僅新增本文件與機器清單，不改既有規劃。**下一步只建議先處理基線未解風險並核准第2批；本次沒有開始施工。**

機器清單SHA-256：`909c3db7847b125320d7e59cd3d2fd1e3f8751f1d3a969b291f4a8ba5c65b713`。
