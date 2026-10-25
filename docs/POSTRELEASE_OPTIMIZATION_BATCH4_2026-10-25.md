# 《文明戰線》全面優化第4批：歷史資料清理與工程精簡

2026-10-25（Asia/Taipei）。[總規劃 Issue #100](https://github.com/franksky1207/rpg/issues/100)。僅本機驗收；未開PR、未合併main、未執行Actions、未發布Pages，未開始第5批。

## 基準與施工方式

正式main與完工前遠端main均為 `ee1978ea2d9c60cad53a112250b1f5f214fc33ea`。整合分支 `integrate/postrelease-optimization-20261025` 開工HEAD精確為 `c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4`，工作區乾淨，保留第2～3批所有祖先與證據。環境起初僅配置main refspec，首次fetch沒有取得整合分支；核對遠端SHA後補抓指定分支一次，未再重複fetch。已修正本機fetch refspec／upstream，後續可正常承接。

一次集中掃描追蹤文字與路徑，記錄引用及分類；集中刪除與更新規則，之後集中驗收。臨時掃描／runner在忽略的 `work/`，不永久加入工程工具。逐檔刪除位元組、A/B分類與保留原因見 `docs/evidence/optimization-batch4/cleanup-inventory.json`。

## 量化結果

| 指標 | 結果 |
|---|---:|
| 清理前Git追蹤檔案 | 1,893 |
| 清理後Git追蹤檔案 | 1126 |
| 實際刪除 | 775檔 |
| 新增／修改／完全未變 | 8／24／1,094檔 |
| 被刪檔案原始容量（gross） | 307,642,990 bytes（293.39 MiB） |
| 清理前目前樹容量 | 407,440,193 bytes |
| 清理後目前樹容量 | 100,071,308 bytes |
| 目前樹淨減少（含新增證據／文件） | 307,368,885 bytes |

以上為Git追蹤檔案的未壓縮位元組，不是.git pack、GitHub儲存計費或clone流量；未重寫Git歷史。

| 刪除區域 | 檔數 | 原始bytes |
|---|---:|---:|
| `assets/backgrounds-source/` 整包PNG | 32 | 80,071,583 |
| `audio/assets/` 非正式音訊／來源 | 119 | 104,305,098 |
| `development/3d-source/` 退役工程／審圖 | 82 | 26,642,124 |
| `development/combat-animation/` 製圖／候選／截圖／打包／日誌 | 367 | 44,869,207 |
| `development/monster-art/` 來源／ZIP／PNG／重複WebP | 80 | 50,998,024 |
| `development/hybrid-comparison/` 比較頁、CSS、controller與兩份退役模板 | 5 | 26,912 |
| `docs/` 過期規劃／完成報告／archive | 61 | 477,400 |
| `scripts/` 退役製作與比較工具 | 15 | 66,342 |
| `tests/` 退役候選／比較／調色測試 | 11 | 84,625 |
| 舊音訊歷史文件／根目錄3D升級DOCX | 3 | 101,675 |

`development/` 從761檔／165,490,839 bytes降至227檔／42,951,900 bytes；裝備31檔／8,976,994 bytes完整保留。`audio/` 從146檔降至26檔，binary恰好17檔，其餘為現役程式、README及授權provenance。

## 過期檢查與發布規則

- `asset-integrity.js` 不再要求背景PNG存在或比較source容量，改驗32張WebP、16組desktop/mobile、完整CSS引用、Manifest SHA與零失效來源引用。
- 怪物來源驗收不再要求ZIP／PNG／重複WebP存在；保留原始輸出metadata與固定身份資料，直接檢查正式WebP SHA／bytes／尺寸／Alpha／bounds、Boss／1000層異宇宙映射、來源隔離與安全回退。
- 三紀元角色保留核准母圖的固定SHA，檢查正式WebP與Alpha，不要求已退役母圖副本常駐；原始資料可由開工SHA恢復。
- 音訊移除已停用UI click的存在性斷言，驗證正式17檔與11個SFX的原始metadata SHA；播放／場景／生命週期回歸保留。所有作者、CC BY／CC0授權、原始及匯出SHA紀錄保留；metadata的歷史source檔名不等於runtime URL。
- `docs-integrity`／legacy boundary不再要求舊archive或已完成批次文字常駐；改驗目前狀態、歷史SHA追溯、Schema18、all-known舊檔遷移、fail-closed與原lazy邊界。Runtime workflow的文件觸發路徑改為 `docs/**`。
- Functional CI的退役候選分層測試改為現役 `batch7-era-pool.test.mjs`，保留SHA／HTTP／解碼錯誤及lease釋放回歸。
- Pages workflow的「B3預覽」名稱改為現役GM B支援，增加比較入口不得發布的斷言。保留現役 `stage-hybrid-preview.cjs` 的174項request／165項B2 inventory／SHA gate與GM瀏覽器驗證。
- `formal-sprite-publication.cjs`、`gm-sprite-publication.cjs`、`asset-registry.cjs` 與兩份裝備lock未改：已證實仍有有效用途。`publish-assets.cjs`／`publish-build-regression.cjs` 保留來源隔離、missing、權限與fingerprint門檻，沒有停用驗證。
- `resource-manifest.json` 由原產生器重產，移除已刪非正式音訊的失效fingerprint。client／SW／預載白名單及正式資產位元組不改。

`PROJECT_HANDOFF.md`／`PROJECT_PENDING_STATUS.md` 已濃縮成一致現況；README補充未發布整合分支。舊報告追溯集中到 `docs/HISTORICAL_ENGINEERING.md`，相關現役SOP的歷史連結指向開工Git SHA。第2～3批報告／evidence完整保留；完整正式文件封箱留第6批。

## C／D保留候選與去重結論

- **C：GM B renderer閉包**：仍由 `3d-test/gm-battle-simulation.js` 動態載入。保留fixture／playback／renderer、174項SHA資源與vendor；只移除獨立A/B/C比較頁及製作工具。
- **C：裝備來源與lock**：`development/equipment-2_5d/` 31檔仍為確定性GM／formal exporter輸入；包含編譯時權限與路徑轉換，不能把source/runtime視為可刪的相同副本。
- **C：18個登記GLB與registry**：`assets/3d/` 19檔／8,694,575 bytes完整保留，仍被character-assets／GM／fixture使用；skin、socket、LOD、license、source provenance與缺檔／SHA拒絕仍驗證。
- **C：必要小型輸入**：3D只保留rig-contract；monster-art只保留5個metadata；combat-animation只保留7個尺寸基準／可重現測量腳本／culture-plan／未核准突刺負向證據。
- **D：低引用API與跨模組資料合併**：正式root／3d-test／data檔案的SHA分組沒有完全重複檔。固定怪物身份、圖鑑投影、映射與不同權限資料不能只因名稱／欄位近似合併。沒有證明無初始化副作用的runtime模組可移除，故不做大規模重構；Issue #100 #11／#16的高風險合併保留。所有正式數值、裝備、VIP、掉落、稱號、三紀元／異宇宙、序列化與GM隔離不變。

## 本機驗收與失敗處理

最終 62 個不同命令組通過，完整名稱與歷程見 `docs/evidence/optimization-batch4/test-results.json`。採集中初驗、按失敗類型集中修正／重跑、最後整體驗收；未每刪一個目錄重跑全套。

- 352個root runtime／data／3d-test／正式visual檔案逐位元對照開工基準完全相同；兩個裝備publication lock原位元組相同。
- 32張背景、正式17音訊、39個怪物原型、Boss身份與投影、1000層異宇宙／200宇宙／五階、尺寸基準、GLB skin／socket／LOD、GM／formal權限與錯誤回退通過。
- 原始發布流程先驗483檔正式候選，再補現役GM閉包。HTTP逐檔與SHA、17音訊真解碼、桌機／手機設定、101項快取（49 gameplay＋6角色＋39怪物＋7效果模組）、Range、清除與存檔隔離通過。
- 發布後GM C-15五場景、桌機／直向／橫向播放／停止／dispose與零存檔／雲端寫入通過；GM三紀元裝備中心、正式角色戰鬥及18GLB驗證通過。
- 24個正式模式／畫面方向案例通過；T4桌機／直向／橫向與100次頁面切換沒有重建退役裝飾3D。
- 第2批save hook／cloud／mirror失敗回歸、跨模式遲到結算／stale回歸、Schema1～18與future拒絕、Schema18合成存檔local／JSON／mock cloud往返與冪等通過。未讀取正式玩家雲端，本次沒有提供私有真實存檔。
- 第3批原生Cache Storage成本／清除競態、真HTTPS SW兩個並發port均complete、warm preload不重複、既有預載成功／失敗／清除與SHA回歸通過。第2～3批所有root owner位元組未改。
- JS語法／載入順序、修改的Python語法、Markdown有效相對連結、workflow concurrency、發布來源缺檔／來源隔離／新fingerprint回歸通過。

初次失敗分為：舊owner raw SHA／舊archive存在性／歷史單一文化palette期望、退役A/B/C generator，以及本機validator／瀏覽器路徑設定。前者把owner鎖定移至本批開工SHA，保留功能／身份／負向斷言；異宇宙改鎖已核准每階外觀，沒有改正式資料。A/B/C producer只供已退役工程，連同專屬測試移除，現役adapter拒絕篡改／playback／renderer／artifact／真GM回歸繼續執行。`gltf-validator` 使用環境已安裝版本，Playwright明確選 `/usr/bin/chromium` 後原測試通過。新增保護測試初版regex誤把 `.json` 視為 `.js` 前綴，已加結尾界線；正式manifest另以重產及SHA驗證，未排除真正runtime。所有保留的失敗測試已重跑通過。

## GitHub容量、Pages與玩家下載必須分開

| 範圍 | 清理前 | 清理後 | 變化 |
|---|---:|---:|---:|
| Git追蹤目前樹 | 407,440,193 bytes | 100,071,308 bytes | 淨減 307,368,885 bytes |
| 正式Pages核心候選 | 483檔／50,203,680 bytes | 483檔／50,203,680 bytes | 0 |
| 包含現役GM支援的最終候選 | 655檔／83,950,231 bytes | 655檔／83,950,231 bytes | 0 |
| 正式玩家資源／預載集合 | 原資產／101項 | 相同資產／101項 | 0 |

完整候選除了自動產生的candidate marker，其餘654檔的SHA256與清理前逐一相同，baseline ledger在 `docs/evidence/optimization-batch4/published-baseline.json`。原始報告計算483檔核心候選，`stage-hybrid-preview`會另外加172檔／33,746,551 bytes；上表如實列出最終實際上傳範圍，不把核心報告當成最終GM總量。

本批沒有真正減少玩家下載內容，不宣稱整體速度或效能提高293MiB／75%。Pages預期發布內容逐位元不變，尚未實際發布。

## 保存與待辦

17個workflow的push branch條件均不匹配整合分支，沒有open PR；安全盤點見 `docs/evidence/optimization-batch4/workflow-safety.json`。使用單次普通commit與fast-forward push保存原整合分支，不加skip-CI、不停用workflow、不另開平行分支。最終SHA、遠端readback與該SHA的Actions runs查詢結果另記Issue #100留言。

保留項已列C／D，不為追求刪檔繼續追查。真iPhone切App／鎖屏／長時間GPU／耗電、正式帳號／雲端與正式Pages仍待最終驗收；Chromium不是替代。第5批介面與第6批文件封箱／發布工程不在本批執行。
