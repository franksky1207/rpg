# 第17批：文明災厄與高維十王 Sprite 整合與驗收

狀態：施工驗收中，尚未合併或封箱。開工最新 main：`f2d37f4c382248e3130f66d400246dc5e42e3639`。

## 修改內容

附件24張圖片通過ZIP CRC／路徑安全、逐檔SHA-256／bytes、512×512、真Alpha與manifest邊界核對。12張正式WebP原位元複製，沒有重新生成或壓縮。原PNG、交接metadata、預覽及驗證收據僅存development/monster-art/batch17，正式候選排除所有開發來源。

沿原三份JSON與generate-monster-trial-registry.py，新增12原型及30身份，總33原型／695身份。舊665筆映射及21原型與開工main逐筆等值；不改Boss名稱、數值、能力、存檔、獎勵與挑戰條件。事件bridge僅將既有calamityId／higherDimensionalBossId投影到既有enemy.id欄位。正式resolver依mode／world／kind／id／location／精確名稱白名單；高維投影另校驗關卡0～2與高維投影·正式名。

MonsterActor共用版面owner使用真正Canvas Alpha待機週期極值限定1.5～2.0，額外保留0.2% CSS次像素取整餘裕。雙方同時等比例縮放，完整Canvas envelope限制橫向占用；沿既有approachLimit限制接近位移。不新增動畫時鐘、粒子或半月光波，舊地圖及副本尺寸分支不變。

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

PR編號與連結、最新head、各測試實測結果、合併main SHA、Runtime／Pages與正式資源指紋須在驗收完成後補記。此施工狀態不代表封箱；進行中、取消、跳過或舊SHA綠燈均不能代替成功。

真實iPhone Safari長時間流暢度、溫度、耗電、記憶體、OS背景掛起／恢復及真帳號雲端寫入仍待人工。Chromium自動化不代表真機通過。
