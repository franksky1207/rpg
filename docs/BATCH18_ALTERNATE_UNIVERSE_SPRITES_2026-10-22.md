# 第18批異宇宙1000層 Boss Sprite

狀態：施工中，尚未宣稱發布或封箱。

開工前以 GitHub 即時資料核對 PR #72 head `10682f67d4ac6b948808fa4459ebcc812b449c65`，五項必要 Actions 全部 success、MERGEABLE/CLEAN，僅三份文件變更。已於2026-10-22T05:49:56Z合併；開工 main SHA `6ca6b863d897d94db92d2e652e88aa013535becb`。分支保護查詢403，未使用 admin bypass；GitHub正常合併成功。

固定範圍：依正式 alternateuniversedata.js 的20文化、200固定宇宙、五階段1000身份。14張沿用加AU-01～AU-06六張新原圖，每文化50身份共用唯一原型，不新增怪物名稱。保留原33張素材位元、695映射及全部玩法owner。重用MonsterActor/Pool、共用boss版面、GM單一中心、正式Renderer及智慧下載。無新動畫時鐘或額外生命週期。PNG僅development。

正式身份解析沿原生visualContext.mode=alternate與location=深度，直接查正式生成映射；不對顯示名稱猜文化。原生事件未提供怪物id/kind/name時保留該契約；若提供則必須精確匹配。GM以文明、宇宙、階段選擇，唯讀原型、動作、配色、實測高度；只載入所選Actor。

完整驗收、提交/PR/Actions/Pages及真實iPhone未測項目將依實際結果補記。不得使用舊SHA、部分通過、取消或跳過冒充完成。

## 自我檢查與測試設計

新增完整等值守衛：開工main的695筆身份、33原型metadata與每張WebP SHA不變；異宇宙資料、挑戰/結算/進度/UI、轉生、戰鬥core、事件bridge、離線owner全檔位元不變。既有總數守衛精確由33/695擴充為39/1695，原身份取樣與上下限斷言不變。第17批scope明確限定原30身份；媒體總數精確88→94，原12圖快取仍逐張受測。歷史PR48守衛只加入兩個明確cache token正規化，完整blob比對保留；不改歷史fixture或數值斷言。

首輪3000測試架使用identity.world=both作為角色外觀紀元，導致正式prepare拒絕；GM尺寸已通過但該輪整體失敗，原始失敗記錄first-harness-failure.json保留。修正測試架指定higher玩家外觀，沒有修改Runtime尺寸/倍率/上下限斷言。

六張人工視覺覆核：冰冠霜甲與晶槍、雷翼分岔槍、海獸鰭鬚、樹靈藤根生命核、紅金龍翼尾、法老砂金符文，輪廓互異、面向左、主體完整。原圖按附件原位元整合，未重新製圖。


## 施工驗收實際結果（尚待最新head Actions與正式發布）

- 1000身份×1365×900／390×844／844×390：3000/3000。真正Canvas Alpha>16，GM/正式共用Renderer量測；倍率1.750003660～1.750365526，GM/正式最大差0.000350308。全部六動作逐35ms取樣、左右分離、Canvas無邊緣裁切、死亡透明與dispose通過；逐筆結果local-all-identities.json。
- 20文化×三視窗60原生異宇宙挑戰：正確depth→culture→asset、實際Alpha、玩家左、血條未遮擋、畫面邊界及真實結算後refs歸零。隔離玩家輸入不代表真人難度驗收。
- 20文化各HTTP／SHA／解碼／下載中離場：80/80；每項原頁恢復並重入兩次，最終refs/pending/bytes歸零。
- GM三視窗189快速選擇；CPU降速4倍：30同原型戰鬥只解碼一次、100反覆戰鬥、200快速切換、6000 sample；最終Player/Monster資源歸零。CPU p95 0.9ms（本測試環境），不代表iPhone溫度/FPS。
- 真正Service Worker/CacheStorage：94/94冷載、暖載saved=0、清除後94/94重載；六新圖逐檔SHA及損毀磁碟修復，開發來源排除。既有第17批12圖同樣沿原測試逐張受測。
- 首head發布Gate/第16/17批均在共用publish-candidate-browser的舊33原型總數守衛失敗；精確更新39，不改SHA/HTTP/Alpha/音訊/Range/存檔隔離斷言。保留失敗log並於後續head完整重跑。
- 原生連戰診斷發現localhost會自動載入integrity group；calamitygmintegrity.js的headless parity會產生mode=calamity/world=1正式事件，覆蓋正在測試的alternate session。原始diagnostic log保留，正式程式不改；原生測試URL使用既有production=1設定（與正式Pages行為一致），完整Runtime完整性診斷另由原Gate執行，並非跳過該驗收。

## 20文化固定映射

| 文化 | 唯一原型 | 身份數 | 動作 |
|---|---|---:|---|
| 冰霜神系 | `boss-au-01-v01` | 50 | short-thrust |
| 太陽火焰 | `boss-c-01-v01` | 50 | pulse |
| 雷霆天穹 | `boss-au-02-v01` | 50 | ranged-shot |
| 冥界死亡 | `void-phantom-v01` | 50 | pulse |
| 海洋深淵 | `boss-au-03-v01` | 50 | pounce |
| 自然生命 | `boss-au-04-v01` | 50 | pulse |
| 龍族神權 | `boss-au-05-v01` | 50 | pounce |
| 機械神性 | `mech-03` | 50 | mechanical-strike |
| 命運時間 | `boss-h-07-v01` | 50 | pulse |
| 星辰宇宙 | `core-03` | 50 | pulse |
| 戰爭兵器 | `ship-04` | 50 | ranged-shot |
| 秩序審判 | `boss-h-03-v01` | 50 | pulse |
| 混沌虛無 | `boss-h-08-v01` | 50 | pounce |
| 夢境心靈 | `boss-h-05-v01` | 50 | short-thrust |
| 光明聖界 | `boss-h-01-v01` | 50 | short-thrust |
| 黑暗血月 | `boss-c-03-v01` | 50 | pulse |
| 巨人泰坦 | `boss-h-02-v01` | 50 | pulse |
| 沙漠古文明 | `boss-au-06-v01` | 50 | pulse |
| 蟲群生體 | `bio-02` | 50 | pulse |
| 超維法則 | `boss-h-10-v01` | 50 | pulse |

## 六張正式素材 SHA-256

| 代號 | bytes | SHA-256 |
|---|---:|---|
| AU-01 | 208562 | `c5c217d299b702c336a7d0f790886aa62718dea6e61fe29dec3104948aca7435` |
| AU-02 | 203258 | `60967b4b112ab6f4a4f7b2bd84140eca0b6800757d606a9bd6c89b1642043721` |
| AU-03 | 194208 | `51224c9ed2894864e01892b051965738b387d923cef1410ee990c4d2001d10aa` |
| AU-04 | 277622 | `c3717b9ff9ab7ef34eef90d61d0ed142fe0c11d9370a33f4635f6f6f9a34c0f4` |
| AU-05 | 244246 | `c2b606601cc3a1698a52d24279bb59bd814e699bf36357dfa60eafcbc23f7fdf` |
| AU-06 | 267950 | `bc9ebaad63ef95782c772f72f8bdd2db56e2a15521927f6b0b0ebdc9e0e60ff7` |

真實iPhone Safari長時間FPS/卡頓、溫度、耗電、記憶體與OS回收、背景掛起/恢復、清資源後重入仍待人工。自動化Chromium/WebKit不代表真機通過。

原生正式設定下同一頁連續15層征服通過；每戰保留真正attempt、兩個不同隨機特性、戰鬥core、presentation與settlement；深度逐層1→15、attempt清空、Player/Monster refs歸零，沒有重啟Renderer/Entry/event bridge。最後清快取bytes/pending歸零。失敗診斷中的mode=calamity/world=1證明來源是localhost自動完整性測試，不是異宇宙身份解析；production=1僅選用現有正式載入政策。
