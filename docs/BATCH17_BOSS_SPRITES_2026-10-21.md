# 第17批：文明災厄與高維十王 Sprite 整合與驗收

狀態：第17批工程封箱完成；功能已合併並發布，必要自動化與正式Pages驗收成功。真實iPhone人工項目仍待測。開工最新 main：`f2d37f4c382248e3130f66d400246dc5e42e3639`。

## 修改內容

附件24張圖片通過ZIP CRC／路徑安全、逐檔SHA-256／bytes、512×512、真Alpha與manifest邊界核對。12張正式WebP原位元複製，沒有重新生成或壓縮。原PNG、交接metadata、預覽及驗證收據僅存development/monster-art/batch17，正式候選排除所有開發來源。

沿原三份JSON與generate-monster-trial-registry.py，新增12原型及30身份，總33原型／695身份。舊665筆映射及21原型與開工main逐筆等值；不改Boss名稱、數值、能力、存檔、獎勵與挑戰條件。事件bridge僅將既有calamityId／higherDimensionalBossId投影到既有enemy.id欄位。正式resolver依mode／world／kind／id／location／精確名稱白名單；高維投影另校驗關卡0～2與高維投影·正式名。

MonsterActor共用版面owner使用真正Canvas Alpha待機週期極值限定1.5～2.0，額外保留0.002倍 CSS次像素取整餘裕。雙方同時等比例縮放，完整Canvas envelope限制橫向占用；沿既有approachLimit限制接近位移。不新增動畫時鐘、粒子或半月光波，舊地圖及副本尺寸分支不變。

GM沿既有測試中心提供銀河災厄／宇宙災厄／高維十王、唯讀原型／配色／建議與實測倍率／動作。30身份並排使用序列單次Actor快照，立即dispose，不建立30個持續Actor；沿用原Pool與RAF。12張WebP加入原manifest與SW精確白名單，沒有第二套快取。

## 12張正式新圖

| 代號 | 正式ID | bytes | SHA-256 |
|---|---|---:|---|
| C-03 | boss-c-03-v01 | 72172 | `3ff6ddbcb85286251fa6bc916b21009dffc0141f4c958a35f0b24d291fadcbb2` |
| C-02 | boss-c-02-v01 | 235982 | `dd7ef08b6812efa58b2a4c49c19f73e59ecd56ae300efd565a00ae4bd0880514` |
| U-01 | boss-u-01-v01 | 70734 | `d08377240a9b980a04082a3aa4323f3a1e91030ee8f58cd6c204e318524901e8` |
| C-01 | boss-c-01-v01 | 86402 | `4e7f57536f8d1de03efae8a0b8c4c93551cee843fe28c73092a5f512330ee5cc` |
| H-01 | boss-h-01-v01 | 224668 | `cb8b54c688304d2b74999da3c1a05cc3ed28be64fe924bd514709f3dad243a71` |
| H-02 | boss-h-02-v01 | 316152 | `a126d7dfa3968cbb5d296fad447077a6ad58c7799652b83467897813b4624ddc` |
| H-03 | boss-h-03-v01 | 263766 | `8829a03f1f9376c4d85ef1850b18a2b06327e5a6f6ae89db2c7ea8178e1e2eb9` |
| H-10 | boss-h-10-v01 | 115804 | `1958c30ff60b0daf1c67e741cb12c5ec76195336ecc00128e209076ae851df2b` |
| H-06 | boss-h-06-v01 | 114110 | `8ad12a2400b606c50e54c19b205fd8f94ca80a30c8ad30377baa631007245bd8` |
| H-07 | boss-h-07-v01 | 320138 | `d7712eeb98710f7e2a2d50875cc457dc72f3c483b21f418a6e2a0118ac3cddb2` |
| H-05 | boss-h-05-v01 | 310582 | `f26afd315cab5b3bf00628bbbc683989b136ea12ff70b4bbfe1eb02ee10bd445` |
| H-08 | boss-h-08-v01 | 127376 | `e4af3ba99ebb64d6b5abe3c5704e93f09a1f37642357ecc88264d1fa669d68f0` |

## 30身份核對

| 紀元 | 正式Boss ID | 名稱 | 原型 | 配色 | 建議倍率 | 動作 |
|---|---|---|---|---|---:|---|
| galaxy | earth | 灰潮母巢 | bio-02 | earth | 1.75× | pulse |
| galaxy | solar | 日蝕王座 | boss-c-01-v01 | original | 1.75× | pulse |
| galaxy | nearstar | 星骸迴廊 | fort-03 | steel | 1.8× | stationary-shot |
| galaxy | frontier | 黑域牧者 | cmd-03 | violet | 1.65× | short-thrust |
| galaxy | orion | 滅世天環 | boss-c-02-v01 | original | 1.9× | pulse |
| galaxy | galactic-frontier | 寂滅方舟 | ship-04 | deep-space | 1.85× | ranged-shot |
| galaxy | galactic-mid | 萬域蝕潮 | energy-01 | crimson | 1.75× | pulse |
| galaxy | core-outer | 深核奇點 | core-03 | cyan | 1.85× | pulse |
| galaxy | core-war | 無聲裁決 | cmd-03 | white | 1.7× | short-thrust |
| galaxy | galactic-unification | 終末之眼 | boss-c-03-v01 | boss-eye-red | 1.9× | pulse |
| universe | universe-calamity-01 | 彼岸黑潮 | energy-01 | deep-violet | 1.7× | pulse |
| universe | universe-calamity-02 | 群星焚爐 | core-03 | rust | 1.8× | pulse |
| universe | universe-calamity-03 | 邊星獵皇 | cmd-03 | gold | 1.75× | short-thrust |
| universe | universe-calamity-04 | 萬軍葬艦 | ship-04 | steel | 1.9× | ranged-shot |
| universe | universe-calamity-05 | 超域蝕核 | core-03 | violet | 1.85× | pulse |
| universe | universe-calamity-06 | 無盡兵災 | mech-03 | crimson | 1.85× | mechanical-strike |
| universe | universe-calamity-07 | 星脈噬巢 | bio-02 | earth | 1.85× | pulse |
| universe | universe-calamity-08 | 巨牆戰堡 | fort-01 | sand | 1.95× | stationary-shot |
| universe | universe-calamity-09 | 深域吞星 | beast-03 | deep-space | 1.9× | pounce |
| universe | universe-calamity-10 | 終戰天穹 | boss-u-01-v01 | original | 2.0× | ranged-shot |
| higher | higher-dimensional-boss-01 | 破界天裁 | boss-h-01-v01 | ice | 1.75× | short-thrust |
| higher | higher-dimensional-boss-02 | 永劫重垣 | boss-h-02-v01 | gold | 1.95× | pulse |
| higher | higher-dimensional-boss-03 | 宿因天秤 | boss-h-03-v01 | original | 1.8× | pulse |
| higher | higher-dimensional-boss-04 | 無相彼岸 | void-phantom-v01 | spectral-blue | 1.65× | pulse |
| higher | higher-dimensional-boss-05 | 萬象迴演 | boss-h-05-v01 | violet | 1.8× | short-thrust |
| higher | higher-dimensional-boss-06 | 維隙之刃 | boss-h-06-v01 | cyan | 1.75× | short-thrust |
| higher | higher-dimensional-boss-07 | 逆因輪轉 | boss-h-07-v01 | original | 1.85× | pulse |
| higher | higher-dimensional-boss-08 | 噬界深淵 | boss-h-08-v01 | deep-violet | 1.95× | pounce |
| higher | higher-dimensional-boss-09 | 先驗之瞳 | boss-c-03-v01 | boss-eye-cyan | 1.85× | pulse |
| higher | higher-dimensional-boss-10 | 高維原點 | boss-h-10-v01 | original | 2.0× | pulse |

## 程式自我檢查與自動化

- batch17-boss-assets.py：24交接圖片與12正式WebP原位元、SHA／bytes／Alpha／安全留白及manifest來源排除。
- batch17-boss-contract.cjs：30個實際owner身份、30個投影關卡、錯誤ID／模式／紀元／名稱拒絕，665舊身份、21舊原型與玩法owner保護。
- batch17-all-identities-browser.cjs：30身份×三視窗90案例，另10投影×三關卡×三視窗90案例。真實Canvas Alpha、正式／GM比例、左右分離、六動作逐35ms取樣、越界、死亡透明、群組選單與30靜態縮圖。
- batch17-monster-recovery-browser.cjs：30身份×HTTP／SHA／解碼／下載中離場120案例；同頁恢復、兩次清快取重入與最終refs／pending／bytes歸零。
- batch17-cache.cjs：12原型逐一智慧預下載、warm重用、毀損磁碟、HTTP／SHA失敗、清除重下載。
- batch17-native-cache-browser.cjs：真正Chromium Service Worker／CacheStorage、88正式媒體、12新圖逐一毀損修復／SHA／重下載，開發來源排除。
- batch17-live-bosses-browser.cjs：真實index的銀河災厄、宇宙災厄、高維十王、固定／異相高維競技五入口，正式事件身份／Sprite／回收；不冒充完整真人遊玩。
- 原第15批1827身份視窗、第16批56副本＋18特殊怪三視窗、33原型動作／Pool、完整Batch6與既有發布Gate仍須同head成功。

首輪並行驗收發生資源競爭與逾時，已改為序列完整重跑，失敗／中止不計通過。曾因2.0002倍CSS取整越界失敗，修正共用owner，保留原上下限斷言。新增批次後舊總數守衛精確更新為33／695；第16批改依原dungeon sizePolicy取樣並新增56筆與開工main完全等值守衛，所有原身份仍受測，沒有刪除舊斷言。

## 實機／Actions／發布門檻

最終PR／main同SHA Actions、Runtime與Pages證據見下方「合併與發布驗收」。進行中、取消、跳過或舊SHA綠燈均不能代替成功。

真實iPhone Safari長時間流暢度、溫度、耗電、記憶體、OS背景掛起／恢復及真帳號雲端寫入仍待人工。Chromium自動化不代表真機通過。

## 合併與發布驗收（2026-10-22，臺灣）

- 開工 main：`f2d37f4c382248e3130f66d400246dc5e42e3639`。
- [PR #71](https://github.com/franksky1207/rpg/pull/71) 最終head：`18774098c2f9cbdb2e21f5f2a1eb82a87115183c`，10／10必要Actions全部完成成功，才進行合併。
- 功能封箱 main SHA：`32bd7cf23eab8026a884040ced9f3789a2d0a583`，23／23 Actions全部完成成功，沒有以取消、跳過、進行中或舊SHA代替。
- [Runtime Integrity](https://github.com/franksky1207/rpg/actions/runs/39688213411)：合併SHA成功，含Chromium／WebKit、正式戰鬥、GM、跨模式、背景、極簡、離線、存檔及Fast Catch-up回歸。
- [正式Pages建置與部署](https://github.com/franksky1207/rpg/actions/runs/39688213476)：build-and-verify及deploy均成功。[正式網址](https://franksky1207.github.io/rpg/)。
- 文件補記後最新main與同SHA驗收由[PR #71最終發布紀錄](https://github.com/franksky1207/rpg/pull/71)補記；此節SHA明確指本批功能合併。

完整清單：[PR同head十項](../development/combat-animation/batch17/approved-pr-checks.json)、[合併main二十三項](../development/combat-animation/batch17/merged-main-checks.json)。

| 驗收範圍 | 結果與證據 |
|---|---|
| 30 Boss本體×三視窗 | 90／90；真正Canvas Alpha、六動作、左右分離、越界、死亡透明與回收 |
| 高維競技投影 | 10王×三關卡×三視窗90／90；另從實際固定／異相入口驗證，非以本體取代 |
| 正式／GM一致 | 180／180；倍率1.650033531～1.972784977，最大差0.000429974；兩眼紅／青配色不同 |
| GM介面與比較 | 三組各10身份、33原型、速度／動作測試；30靜態縮圖序列快照，不維持30 Actor；關閉清除縮圖 |
| 資源故障與生命週期 | 30×HTTP／SHA／解碼／下載離場120／120；同頁恢復、清除重入、最終refs／pending／bytes歸零 |
| 初始化dispose／晚到lease | 原MonsterPool8／8；晚到bitmap、初始化dispose、重複進出及lease釋放 |
| 快速切換 | 三視窗279次；共用眼型最後配色正確，單一Actor與有界Pool |
| 第15批回歸 | 609原身份×三視窗1827／1827；665舊映射、21舊原型完整等值守衛 |
| 第16批回歸 | 56副本＋18特殊紀元組合×三視窗222／222；原尺寸分支未改，故障／鏡像／遭遇／Fast Catch-up原Gate成功 |
| 跨模式 | 260次正式Renderer既有切換；銀河／宇宙地圖、懸賞、競技、災厄、高維、虛空、鏡像、異宇宙；背景清理／極簡／重入lease歸零 |
| 完整Batch6 | 同PR head GitHub32／32，36個不同原始測試，同次執行、無取用前輪結果；合併main同Gate亦成功 |
| 連戰後文明災厄重入 | cross-combat-stale-continuous-regression、unified-combat-runtime-contract、cross-mode-late-settlement與calamity Fast Catch-up原守衛通過 |
| 發布候選 | 464檔逐檔HTTP／bytes／SHA、17音訊解碼、88媒體cache、Range206、清除與存檔隔離通過 |

## 正式Pages實測

發布後直接對正式網址驗證，不以本機候選冒充：

- 12張新WebP逐檔HTTP、bytes、SHA完全吻合；7個核心模組與main原位元相同，入口含本批快取token。
- 正式網址載入的Renderer／GM共180案例全部通過；銀河災厄、宇宙災厄、高維十王、固定／異相高維競技五個真實入口成功，正式身份及回收正確。
- 真正Service Worker／CacheStorage冷載88／88、暖載saved=0、清除重載88／88，12新圖逐一磁碟毀損修復及SHA成功；沒有PNG原稿、預覽或報告進入智慧下載。
- 全部30 Boss×三視窗真實入口90／90通過：原始ID、正式名稱、Sprite、實際Canvas Alpha倍率、左右分離、兩個HP條未遮擋、可見主體位於視窗內，離場refs歸零。這是同一次完整成功輪次，沒有拼接中止或失敗輪次。

12張PNG原稿、預覽及報告共15個正式Pages路徑實測404，沒有開發資料外洩至Pages；證據見pages-source-exclusions.json。

證據：[Pages HTTP](../development/combat-animation/batch17/pages-http.json)、[Pages 180版面](../development/combat-animation/batch17/pages-all-identities.json)、[Pages五入口](../development/combat-animation/batch17/pages-live-bosses.json)、[Pages原生快取](../development/combat-animation/batch17/pages-native-cache.json)。

## 失敗追查、授權與測試限制

初期Actions有七項失敗，根因為enemy.id新增既有calamityId／higherDimensionalBossId後，現役摘要與歷史守衛未同步。自動核准審查要求明確授權，使用者於2026-10-22回覆「是」後，使用原生成器精確同步；歷史fixture原文與beforeSHA256完全不變。守衛以整份開工main檔案位元比較，只允許這兩欄位fallback；其餘玩法owner保護不變。具體差異保留於proposed-fixture-guard.patch，已在18774098實作並通過全部必要Actions。

本機早期環境缺預設Playwright瀏覽器，修正為既有system Chromium及本機SDK適配；未變更斷言。最後完整本機Batch6為31／32（正式戰鬥15秒觀測逾時），保留local-batch6-incomplete-31-of-32.json／log；單項原樣重跑三視窗成功（local-formal-isolated-rerun-pass.log），不混算成同輪32／32。GitHub完整同head32／32紀錄另存approved-batch6-ci.log。補充90入口測試曾被環境重啟中止；另一次在18／90因啟動檢查直接存取尚未建立的全域物件而拋錯，保留兩輪原始證據。改為window.CivilizationStartupCoordinator的安全等待，仍須原60秒內真正ready，未放寬版面斷言；另有61／90輪次的橫向案例誤用桌機pointer fine，未啟動既有手機定位，保留失敗及診斷。修正為桌機fine／手機touch及coarse明確斷言，並等待原定位完成；沒有放寬越界斷言或修改遊戲。最終從零90／90同輪通過。

真實iPhone Safari仍待人工：長時間FPS／卡頓、溫度、耗電、記憶體與系統回收、快速切換與清資源後重入、OS背景掛起／恢復；真帳號雲端寫入亦未測。Chromium／WebKit自動化不代表iPhone實機通過。

## 30隻Boss三視窗共用Renderer逐筆驗收

倍率以正式Canvas中Alpha > 16的實際可見高度計算；表內依序為1365×900、390×844、844×390。各列均已驗證GM一致、左右分離、舞台完整、六動作與死亡回收。沒有低於1.5倍或高於2.0倍的例外。高維競技場另計90投影案例，不混入下表90個本體案例。

| 身份 | 桌機 | 手機直向 | 手機橫向 | 驗收 |
|---|---:|---:|---:|---|
| 灰潮母巢 | 1.750492× | 1.750153× | 1.750492× | 通過 |
| 日蝕王座 | 1.750004× | 1.750042× | 1.750004× | 通過 |
| 星骸迴廊 | 1.800080× | 1.800083× | 1.800080× | 通過 |
| 黑域牧者 | 1.650182× | 1.650010× | 1.650182× | 通過 |
| 滅世天環 | 1.900348× | 1.900015× | 1.900348× | 通過 |
| 寂滅方舟 | 1.850474× | 1.850084× | 1.850474× | 通過 |
| 萬域蝕潮 | 1.750203× | 1.749939× | 1.750203× | 通過 |
| 深核奇點 | 1.850317× | 1.850110× | 1.850317× | 通過 |
| 無聲裁決 | 1.700048× | 1.700085× | 1.700048× | 通過 |
| 終末之眼 | 1.900096× | 1.899923× | 1.900096× | 通過 |
| 彼岸黑潮 | 1.700152× | 1.700039× | 1.700152× | 通過 |
| 群星焚爐 | 1.800013× | 1.800116× | 1.800013× | 通過 |
| 邊星獵皇 | 1.750126× | 1.750175× | 1.750126× | 通過 |
| 萬軍葬艦 | 1.900275× | 1.900204× | 1.900275× | 通過 |
| 超域蝕核 | 1.850340× | 1.849971× | 1.850340× | 通過 |
| 無盡兵災 | 1.850080× | 1.850128× | 1.850080× | 通過 |
| 星脈噬巢 | 1.850274× | 1.849985× | 1.850274× | 通過 |
| 巨牆戰堡 | 1.950322× | 1.949948× | 1.950322× | 通過 |
| 深域吞星 | 1.900154× | 1.900007× | 1.900154× | 通過 |
| 終戰天穹 | 1.972905× | 1.972780× | 1.972905× | 通過 |
| 破界天裁 | 1.750012× | 1.750144× | 1.750012× | 通過 |
| 永劫重垣 | 1.950321× | 1.949943× | 1.950321× | 通過 |
| 宿因天秤 | 1.800011× | 1.800040× | 1.800011× | 通過 |
| 無相彼岸 | 1.650218× | 1.650086× | 1.650218× | 通過 |
| 萬象迴演 | 1.800325× | 1.800028× | 1.800325× | 通過 |
| 維隙之刃 | 1.750251× | 1.750155× | 1.750251× | 通過 |
| 逆因輪轉 | 1.850052× | 1.850014× | 1.850052× | 通過 |
| 噬界深淵 | 1.950321× | 1.949943× | 1.950321× | 通過 |
| 先驗之瞳 | 1.850164× | 1.850142× | 1.850164× | 通過 |
| 高維原點 | 1.962355× | 1.962329× | 1.962355× | 通過 |

## 正式Pages原始戰鬥入口90案例最終結果

[完整90筆結果](../development/combat-animation/batch17/pages-live90.json)；[可重現自動化程式](../development/combat-animation/batch17/live-all-bosses-browser.cjs)。以正式網址實際UI入口逐一啟動30隻Boss，每種視窗各30筆；不是只替換Renderer測試架中的身份。原始Boss ID／正式名／資產ID逐一精確相等，玩家左、敵人右，兩個HP條未被Canvas可見主體遮擋，Alpha主體在實際視窗內，離場Player／Monster lease均歸零。

實際戰鬥當下Canvas Alpha倍率範圍：1.650002403～1.973203517倍；全部符合1.5～2.0，沒有未達標例外。上方共用Renderer表為固定待機樣本；下表為實際戰鬥動作當下取樣，因此數值可小幅不同。

| Boss | 桌機 | 手機直向 | 手機橫向 | 血條／邊界／回收 |
|---|---:|---:|---:|---|
| 灰潮母巢 | 1.750172× | 1.750210× | 1.750068× | 通過 |
| 日蝕王座 | 1.750040× | 1.749964× | 1.750060× | 通過 |
| 星骸迴廊 | 1.800040× | 1.800153× | 1.800382× | 通過 |
| 黑域牧者 | 1.650073× | 1.650039× | 1.659753× | 通過 |
| 滅世天環 | 1.900007× | 1.900165× | 1.900315× | 通過 |
| 寂滅方舟 | 1.850024× | 1.849951× | 1.850358× | 通過 |
| 萬域蝕潮 | 1.750100× | 1.750209× | 1.750373× | 通過 |
| 深核奇點 | 1.850117× | 1.850009× | 1.850420× | 通過 |
| 無聲裁決 | 1.700148× | 1.700054× | 1.700074× | 通過 |
| 終末之眼 | 1.900014× | 1.900108× | 1.900128× | 通過 |
| 彼岸黑潮 | 1.700080× | 1.699934× | 1.700349× | 通過 |
| 群星焚爐 | 1.800070× | 1.800079× | 1.800245× | 通過 |
| 邊星獵皇 | 1.750092× | 1.750121× | 1.750028× | 通過 |
| 萬軍葬艦 | 1.900098× | 1.900182× | 1.900456× | 通過 |
| 超域蝕核 | 1.850141× | 1.850182× | 1.850289× | 通過 |
| 無盡兵災 | 1.850157× | 1.850071× | 1.850199× | 通過 |
| 星脈噬巢 | 1.850096× | 1.850131× | 1.850152× | 通過 |
| 巨牆戰堡 | 1.950133× | 1.950086× | 1.950334× | 通過 |
| 深域吞星 | 1.900000× | 1.900164× | 1.900482× | 通過 |
| 終戰天穹 | 1.972930× | 1.972743× | 1.973204× | 通過 |
| 破界天裁 | 1.750012× | 1.749956× | 1.750192× | 通過 |
| 永劫重垣 | 1.950126× | 1.950273× | 1.950466× | 通過 |
| 宿因天秤 | 1.800104× | 1.800019× | 1.800251× | 通過 |
| 無相彼岸 | 1.650078× | 1.650105× | 1.650002× | 通過 |
| 萬象迴演 | 1.800085× | 1.800112× | 1.800003× | 通過 |
| 維隙之刃 | 1.750091× | 1.749956× | 1.750232× | 通過 |
| 逆因輪轉 | 1.850091× | 1.850086× | 1.850011× | 通過 |
| 噬界深淵 | 1.950126× | 1.950273× | 1.950466× | 通過 |
| 先驗之瞳 | 1.850066× | 1.850060× | 1.850064× | 通過 |
| 高維原點 | 1.962355× | 1.962277× | 1.962580× | 通過 |
