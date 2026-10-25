# 《文明戰線》完工後全面優化第 3 批驗收報告

2026-10-25（Asia/Taipei）。範圍：Issue #100 的 #4／#5／#10／#12。這是本機施工驗收，尚未執行最後集中 Actions／Pages 驗收，也不是 iPhone 真機驗收。

## 承接與施工結果

- 開工工作區乾淨，已在同一分支 `integrate/postrelease-optimization-20261025`，HEAD 精確為第2批 `9e9ed6292499fd5546842bb8ee55384fcde0bb1e`，沒有另開舊 main 分支或重新還原 base64。
- 重新 fetch 的最新 main：`ee1978ea2d9c60cad53a112250b1f5f214fc33ea`。
- 本批程式提交：`f5ad7c48b21b612094c8e7a4d559490c4975bb13`；之後的驗收文件提交／最終遠端 HEAD 另由 Issue #100 結案留言記錄。
- 實際 runtime 修改僅 `resource-cache-client.js`、`resource-cache-sw.js`；另同步 `index.html` cache token、既有 manifest、測試及精確來源登記。沒有新增 runtime 模組。
- 第2批四個修正 owner（lifecycle、savehook、cloudsave、mirror run）和本批檢查的外觀／啟動 owner 共13檔，與第2批逐位元相同，SHA256見 `evidence/optimization-batch3/preserved-owners.json`。
- 未新增玩法、改公式／速度倍率／獎勵／存檔規則／美術／尺寸／定位／六動作；未刪檔、未進入第4批。

## 已確認問題與最小修正

| 問題 | 修改前證據／根因 | 已完成修正 |
|---|---|---|
| 預載進度反覆掃描整個 Cache Storage | 前端每次 progress 都 `keys`＋逐項 `match`／`blob`，且各掃描可重疊；只有設定頁狀態元素存在時才發生，不把它描述成每次首頁啟動都掃描 | 沿用同一 owner：容量統計只在明確更新／完成時量測；progress 使用最近一次實測容量及原背景下載字尾；同時的設定頁更新共用一個統計 job；相同文字不重寫 DOM |
| 共用 preload job 遺失後續呼叫者通知 | 既有 promise 共用下載工作，但只有第一個 report closure 收到 complete，第二個等待者可能永久 loading | 使用工作期間的小型 reporter Set，向所有呼叫者發相同進度與完成／錯誤；finally 清空 Set。message handler 不再額外重複送 error；沒有新增下載工作或計時器 |
| 清除後容量被舊統計覆蓋 | 真實 Cache API 允許已開啟的舊 cache handle 在命名快取刪除後繼續被讀取；清除同時的舊 keys snapshot 仍回報100個項目 | 清除使記憶體容量 snapshot 失效；等待舊統計結束後重新量測。預載完成也等待舊統計後重掃，避免共用舊 keys snapshot |

新的回歸測試先在第2批來源重現第二等待者沒有完成通知與進度重掃描；瀏覽器比較另重現清除競態。修正後成功、manifest失敗、資源503、清除中止、連續已快取預載、清除後再次預載都通過；完成後 reporter 數為0。

## 修改前後量測

### 背景進度與容量統計

Node固定案例：100個cache項目、30次progress；修改前31次完整掃描／3100次match及blob，修改後1次／100次。這是操作計數，不用微小Node時間差宣稱實際手機加速。

Chromium原生 Cache Storage：100個各32768 bytes的response，共3,276,800 bytes；三個獨立context，各30次progress。包含相同的100ms穩定等待，以下是完整fixture壁鐘耗時，**不是純CPU時間或整體遊戲加速比例**。

| 版本 | 完整掃描 | match | blob | 耗時中位數 ms |
|---|---:|---:|---:|---:|
| before | 33 | 3300 | 3300 | 571.4 |
| after | 2 | 200 | 200 | 201.7 |

瀏覽器原版在「舊統計進行中清除」後仍顯示100個資源；新版三次均顯示0個，重新放入資源後顯示1個／8B。設定介面、確認與完成提示文字未更動。

真實HTTPS Service Worker：兩個同時發出的MessagePort均收到complete，101個原有預載資源全部通過；後續warm preload的saved=0。Node可計數控制案例仍只fetch30個資源，warm再請求fetch=0；兩個等待者各收到一次terminal，失敗與清除也不遺失通知。

### 首次／再次載入

Linux Chromium、390×844、4倍CPU節流、loopback HTTPS；每版本3個新context，各做cold／同context warm訪問。外部登入SDK使用既有測試替身，因此不是正式帳號網路登入時間。ready是既有 `civilization-background-ready-before-reveal`；ScriptDuration讀取至story group ready。兩者不是同一時點的成本，不能相加。

| 版本／訪問 | ready中位數 ms | ScriptDuration中位數 ms | 每次SW回應數 |
|---|---:|---:|---|
| before / cold | 2326.5 | 1212.9 | 6, 0, 17 |
| before / warm | 1817.7 | 936.8 | 20, 20, 20 |
| after / cold | 2288.2 | 1209.0 | 0, 15, 15 |
| after / warm | 1832.3 | 925.8 | 20, 20, 20 |

首次等待範圍重疊，warm新版也未優於原版；**沒有宣稱啟動速度提升**。所有樣本 story=ready、GM及integrity=pending，既有延後載入有效。`monstercodexdata.js` 實際791,206 bytes；獨立trace捕捉其背景parse約 77.471 ms，streamed compile很短。背景parse、等待與巢狀compile事件不可累加成主執行緒阻塞時間。

`monstercodex.js` 在載入時建立正式catalog／byId，`savemigration` 目前會在正式載入中呼叫圖鑑正規化。沒有以新增另一份ID表／新異步normalizer換取未證明的啟動收益。`backgroundpreload.js` 的critical/deferred分流與並行2、`scriptgrouploader.js` 的story／GM／integrity策略均保留。

### 外觀合成、解碼與命中

使用同一既有 `monster-approved-performance.cjs` 場景、同viewport。這是各一輪探索性配對，不把時間差當成外觀優化收益；上述外觀owner全部未修改。

| 場景 | before ms | after ms | 原型新增解碼 before/after |
|---|---:|---:|---:|
| first-map-battle | 264.8 | 257.0 | 1/1 |
| repeat-same-battle | 9.0 | 8.6 | 0/0 |
| continuous-galaxy-map-008 | 167.4 | 144.5 | 0/0 |
| codex-next-universe-boss-001 | 1.1 | 1.2 | 0/0 |
| gm-replay-galaxy-map-003 | 0.4 | 0.5 | 0/0 |
| alternate-alternate-depth-0002 | 6.7 | 6.8 | 0/0 |
| after-resource-clear | 77.1 | 69.8 | 1/1 |

固定混合序列兩版本均為appearance hits=13、misses=12、prepare=12，即此特定刻意切換／LRU淘汰序列命中率52%；不是玩家全局命中率。同原型不同外觀可共用原型解碼，但新的調色／效果仍必須合成；同一怪重打、圖鑑切回、GM切回及異宇宙同宇宙五階已能共用準備結果，不合併不同外觀。原WebP .92材質匹配、效果合成、512原圖與所有動作完全保留。

沒有擴充智慧下載清單，沒有895張完整外觀下載／全量解碼。原七個小型外觀模組與既有媒體白名單保留；manifest schema／SHA96／原型SHA256、損壞修復、range回應、離線可用性及清除後恢復均通過。

## 連戰、切換、計時器與記憶體

每個profile模擬100次正式renderer建立／六動作sample／abort、60次GM MonsterActor切換、100次帶取消的圖鑑切換，隱藏／pagehide／clear後再進入第101場；低記憶體profile提供deviceMemory=2、hardwareConcurrency=2。圖鑑是快速請求／取消壓測，不宣稱100次都完整呈現。這是加速場次模擬，不是數小時真機遊玩。

| profile／檢查點 | GC後JS heap bytes | listeners | 外觀/原型refs | 外觀entries |
|---|---:|---:|---:|---:|
| after / initial | 6,787,924 | 29 | 0/0 | 0 |
| after / 30 battles | 7,675,232 | 29 | 0/0 | 2 |
| after / 100 battles | 7,755,348 | 29 | 0/0 | 2 |
| after / 100 codex switches | 7,786,168 | 29 | 0/0 | 2 |
| after / clear | 7,777,676 | 29 | 0/0 | 0 |
| after / reentered | 7,781,076 | 29 | 0/0 | 2 |
| low-memory / initial | 6,788,908 | 29 | 0/0 | 0 |
| low-memory / 30 battles | 7,672,952 | 29 | 0/0 | 2 |
| low-memory / 100 battles | 7,757,284 | 29 | 0/0 | 2 |
| low-memory / 100 codex switches | 7,788,132 | 29 | 0/0 | 2 |
| low-memory / clear | 7,779,624 | 29 | 0/0 | 0 |
| low-memory / reentered | 7,782,848 | 29 | 0/0 | 2 |

每個檢查點pending=0、refs=0、DOM只保留fixture圖鑑canvas；兩種profile外觀容量上限4MiB、原型2MiB，均未超限。LRU內保留的2個已準備外觀是刻意重用，不在每場結束清空。JS heap不包含native bitmap／Canvas／GPU／全部程序記憶體；暖機及測試紀錄會增加heap，不宣稱零成長或證明無限期無洩漏。

六動作sample之JS同步部分P95約0.1ms；不包含完整GPU合成／螢幕更新，不能換算成iPhone FPS。既有真Cache/SW測試另外驗證播放六動作時pixel read=0。

`3d-test/t3b-formal-controller.js` 已在retire／dispose取消RAF、abort與上游listener，visibility／pagehide有既有規則；`monster-actor` dispose移除abort listener、release lease並縮小移除canvas；`combatfx`已有浮字timer清理。相關controller／clock／stop契約和第19-4批真入口中斷回歸均通過，未重寫動畫系統或加入新常駐timer。

## 本機測試與失敗追查

72個最終測試／量測執行項通過（包含私有／合成Schema18 fixture與低記憶體profile），完整名稱與歷程見 `evidence/optimization-batch3/test-results.json`。

- 第2批六類修正的四個owner逐位元保留，failure regressions、Schema18真實／合成存檔的local／JSON／mock cloud全欄位往返及冪等全部通過；未操作正式玩家雲端。
- 全部1000異宇宙層、648戰鬥定義勝敗、永久HP／收益防重／crash恢復、鏡像結算失敗與重複拒絕、跨紀元背景／停止、三紀元鏡像／虛空、GM隔離均通過。
- 另通過新預載單元／真HTTPS並發、Cache Storage成本／清除競態、啟動、compile、standard／低記憶體stress、既有損壞SHA修復／離線／cache清除、lazy loading、controller clock／stop、JS語法／結構、manifest重產逐位元相同、HTML cache版本guard與docs檢查。
- 初次將兩個runner各並行3支（最多6個瀏覽器）時，既有 `mirror-void-formal-browser.cjs` 通過9個鏡像案例，於虛空第9層的45秒觀察窗逾時。保留原失敗紀錄；原檔、全部18案例、45秒與所有斷言不變，單獨重跑完整通過（120.64秒）。失敗發生於HTTP fixture，client的HTTPS快取增強不啟動，涉及的戰鬥／renderer owner均未改。未捕捉到當下完整狀態，**不把精確原因冒稱已證實**；大量並行下短場次觀察時序列為測試負載限制。
- 一次runner列入不存在的 `resource-cache-browser.js`，回傳module-not-found；這是選取命令錯誤，已改查實際檔案清單並執行既有resource-cache-behavior／monster-approved-cache-browser。沒有新增空測試來製造通過。
- baseline量測最初假設第二等待者有terminal，恰因原缺陷讀到undefined；修正量測報表表示缺失為null，修正後的回歸斷言仍強制每人恰好一次terminal／完整失敗數。

## 正規Git保存與交接

已審查17個workflows，全部未改：push只匹配main或另一條固定舊分支，本整合分支不匹配；查詢無open PR。普通Git push已成功，以**同名非PR遠端整合分支**保存第2／3批提交祖先；遠端readback與本機HEAD相同，REST查詢該head的workflow runs為0。最終文件提交後再次核對的HEAD與結果記錄Issue #100結案留言；沒有靠skip-CI、改／停用workflow或PR設定繞過驗收。

本批驗收文件、數值與可重現測試隨分支提交。Issue只保存摘要／SHA／結果，不再儲存base64 bundle。第4批可正常執行：

```bash
git remote set-branches --add origin integrate/postrelease-optimization-20261025
git fetch origin
git switch integrate/postrelease-optimization-20261025
# 新環境若尚無本機分支：
# git switch --track origin/integrate/postrelease-optimization-20261025
git pull --ff-only origin integrate/postrelease-optimization-20261025
git rev-parse HEAD
```

原工作區是只追蹤main的clone，已補上整合分支的fetch refspec；上述set-branches也讓同類新環境能建立origin的追蹤參照。先核對Issue所列本批最終SHA再施工，不從main另起而漏掉第2／3批。

## 重現與第4批依賴

一般功能測試沿用4173本機HTTP server。新量測測試的8443／8444為本機自簽HTTPS（不作正式服務）：

```bash
mkdir -p work/batch3
openssl req -x509 -newkey rsa:2048 -nodes -keyout work/batch3/key.pem -out work/batch3/cert.pem -days 1 -subj /CN=localhost
python3 tests/runtime/optimization-batch3-https-server.py 8443
# 另一終端：python3 tests/runtime/optimization-batch3-https-server.py 8444 baseline
# 另一終端：python3 -m http.server 4173 --bind 127.0.0.1
```

依序執行 `optimization-batch3-startup-browser.cjs`、`optimization-batch3-cache-browser.cjs`、`optimization-batch3-compile-browser.cjs`、`optimization-batch3-preload-browser.cjs`；避免與其他瀏覽器負載混跑量測。stress可用 `LOW_MEMORY=1 STRESS_OUT=work/batch3/stress-low-memory.json` 重跑。私有Schema18檔不在Git，使用 `RPG_SAVE_FIXTURE` 指向使用者提供的本機檔案。

baseline HTTPS fixture僅將本批修改的client／SW還原成第2批來源，其餘檔案本批未改，因此適用本批比較；不要把它誤用成未來任意分支的全樹歷史重現器。

第4批不能因 `3d-test` 舊命名刪掉正式renderer、shared pool／appearance、codex image或其七模組閉包；不要把容量snapshot當成存檔欄位、擴增預載或取消SHA驗證。保留本批回歸與測試HTTPS fixture、原manifest產生器及各批精確來源登記；歷史source seals需要完整Git祖先。新測試尚未加進Actions job（本批不改workflow）；集中驗收時須明確執行，不能假設舊CI已覆蓋。

## 尚未完成與範圍界線

未測真iPhone Safari切App／鎖屏／OS終止／原生bfcache／溫度／耗電／長時間GPU／程序記憶體；Chromium低記憶體與CPU節流不是替代。沒有實測正式帳號登入或正式雲端，也沒有正式Pages驗收；Actions刻意未執行。

變更檔案數、runtime與測試／證據增減量、最終SHA與遠端保存位置以Issue結案統計為準。第3批到此停止，未開PR、未合併main、未發布Pages，也未自動開始第4批。
