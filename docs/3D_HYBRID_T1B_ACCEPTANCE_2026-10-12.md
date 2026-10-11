# 混合式轉型 T1-B：預覽載入與控制器解耦驗收

起始 main：`a89d5e6fe8dd4783720dcffb0eb72b9651c7e40c`。程式提交：`b2e7b946615f62a9703ef628c1d32426ddeb2a91`。本批只有 T1-B；本機自我檢查完成，exact-HEAD CI／Pages 與真機須依實際結果獨立核對。T1-C、T2～T5 未施工。

## 開始前核對

- 遠端 fetch 與 GitHub main API 均為起始 SHA；工作目錄乾淨。初始 remote-tracking ref 是舊 `8377602a`，fetch 後確認最新 main 已含 T1-A 程式 `c9d11c25` 與文件 `a89d5e6f`，沒有更新的提交。
- `Civilization3DFormalSnapshots` 與正式／GM 接線仍存在；外觀、正式名稱、自由 fixture、GM 授權與 origin／iframe source gate 保留。
- 起始 SHA 的 10 個 Actions 均已 completed/success（包含 Runtime `38179296389`、Stage 4 `38179296403`、Pages `38179296410`）；這只證明起始版本。T1-A 報告中的歷史 pendingSettlement 失敗沒有被本批修寫；本機既有存檔回歸再次通過。
- 真 iPhone／Safari／正式帳號、弱網、長期硬體 GPU 仍未驗。特殊遭遇與結算沒有權威快照的限制仍存在，不建立假資料或事件橋接。

## 責任與依賴

修改前 `formal-home.js` 同時持有 manifest、script loader、GM warm、DOM、Observer 與場景會話；GM bridge／center 又分別載入同一外觀／共用模組，並以 Service／Battle／Chronicle 工廠充當完整性哨兵。

修改後：

| 檔案 | 責任與相容 |
|---|---|
| `3d-test/shared-loader.js`（新增） | 每 document 共用載入 Promise、manifest SHA-96 逐檔版本／原 fallback、必要 API、GM bytes warm 與原 startup opt-in prefetch。只管理 JS 載入，不另建 HTTP／SW／GLB 快取。 |
| `3d-test/formal-dom.js`（新增） | 原按鈕、唯一掛載、晚到帳號／雲端／GM、Observer、頁面通知與副本可見 DOM 過濾。透過控制器 callback／唯讀 getState 操作會話；不 fetch 或建立場景。pagehide disconnect，pageshow 重接同一 Observer。 |
| `3d-test/formal-home.js` | 正式 opt-in 場景會話、ticket／取消、Runtime 開关與釋放、快照轉接、工廠選擇及原全部公開 API。使用共用 loader／DOM。缺少所選工廠明確失敗；其他場景仍可開。錯誤記錄於 host dataset、diagnostic event，並在按鈕旁給可重試提示。 |
| `gm3dprototype.js` | 外觀請求只 `ensure("appearance")`，與同 document 正式請求去重；回覆前再次驗證授權／目前 iframe。原返回位置與同源 gate 不變。 |
| `3d-test/test-center.js` | 同一 loader、每場景工廠檢查、失敗後 restart 可重試；保留八類／31 案例、正式／fixture 隔離、最大化／返回。已載入時不新增 await 延遲同步 controls 更新。 |
| `index.html`、`3d-test/index.html` | 新載入器／DOM 的正確先後；修改入口使用 `20261012-t1b-loader-v1`。原 T1-A 快照版本不變。沒有同步載入 Babylon／Runtime／外觀或 GLB。 |
| `resource-manifest.json` | 由原產生器重新生成；489 個來源內容 SHA 全部逐檔一致。 |
| 測試及三個 workflow | 新 loader 契約、正式 DOM hook、GM 31 真場景／失敗重試；擴充原正式 browser 重開、GPU 釋放、過期結果與缺工廠隔離。原 coverage／manifest guard 移至新的責任 owner，不刪場景斷言。Runtime、Stage 4、Pages 均接新測試。 |

所有 15 個公開場景工廠、正式按鈕、戰鬥／副本 post-render hook 保留。`formal-snapshots.js`、`runtime.js`、`prototype-engine.js`、`appearance-snapshot.js`、`character-assets.js`、GLB／registry／Blender／概念圖及正式數值／音訊／存檔 owner 均無修改。

parent 與 GM iframe 各有自己的 JS realm／Promise 與 Scene；共享載入器程式及同源、相同指紋 URL 的既有瀏覽器／SW 快取，不跨 iframe 共享 Babylon Engine 或 GPU 容器。GM boot 原預熱 bytes 範圍保持；GLB／decoder 仍由原 `characterModule()`／CharacterAssets 按場景需要載入。四個共用模組註冊互不依賴，所有必要 API 都完成後才建立 Runtime／場景；人物再按需接原 GLB 管線。

共用完整性檢查驗證 Babylon Engine／Scene、Prototype supported／mount、Runtime create、Appearance capture／scene；**不使用任何裝飾工廠作模組完整性哨兵**。所選場景仍必須有有效 function。可分辨 `module-load-failed`（含 engine／runtime／appearance／scenes 身分）、`module-api-missing`、`scene-capability-missing`、Runtime WebGL/context reason 與人物 geometry-fallback／GLB failure metadata；manifest fallback 會記錄原因，沒有永遠成功或吞全部錯誤。

## 已執行自我檢查

[完整 49 個具名指令與量測](3D_HYBRID_T1B_TEST_EVIDENCE_2026-10-12.json)：34 個非 browser 指令、15 個 browser 指令的最終結果全部通過。下列為主要證據，指令逐項列於 JSON：

- `node tests/runtime/js-integrity.js`：388 個 JS 全部語法／owner 檢查；`3d-b18-coverage-guard.js`、`resource-manifest-integrity.js`、`docs-integrity.js` 及 HTML cache guard self-test 通過。
- `node tests/runtime/3d-shared-loader-contract.cjs`：10／10。純文字零 heavy fetch、同時請求去重、部分成功／失敗、重試、缺引擎／Runtime 真失敗、缺個別裝飾工廠隔離、逐檔版本 fallback、GM warm 範圍／去重／重試。
- `node tests/runtime/3d-formal-snapshots-contract.cjs`：15／15；正式唯讀／混穿空槽／缺 owner／負向 GM 授權及 origin／source 拒絕保留。
- `node tests/runtime/3d-formal-snapshots-browser.js`：正式啟動及 SDK 隔離帳號、桌機／手機各十個真頁面（首頁、角色、背包、強化、專精、冒險、副本、紀錄、設定、說明），每項開／關／重開，完整 state 不變。舊場景延遲完成不能覆蓋新角色；Service 工廠缺失只阻止服務預覽；WebGL loss 後能重開；GM 授權 iframe 正式同步／fixture 隔離通過。
- `node tests/runtime/3d-preview-dom-browser.js`：38 組桌機／手機 DOM fixture，各重複通知及開／關／重開；三紀元／兩回顧、災厄／異宇宙、副本／高維競技場／鏡像／虛空、紀錄／轉生、戰鬥、設定／說明／帳號／雲端／GM；晚掛載 Observer／去重及 story 公開 hook 亦通過。**受控 DOM／快照 fixture 驗證接線，不冒充真解鎖、正式戰鬥或交易。**
- `node tests/runtime/3d-gm-loader-browser.js`：桌機／手機各 31 真場景、八分類；初次 scene script 503，restart 成功。scene script 2 次，其餘 Babylon／Runtime／Appearance 各 1 次；缺 Service／Battle／Chronicle 不阻止角色與星圖，各場景只留 1 engine，pagehide 後 0。
- `node tests/runtime/gm-3d-test-center-browser.js`：原八類／31、上下文 controls、正式／free、手機最大化還原及捲動回歸通過。原 `gm-startup-preload-browser.js`、`gm-first-render-browser.js`、`startup-readiness-browser.js`、`code-cleanup-batch7-lazy-loading.js`、`3d-mode-browser-regression.js`、`galaxy-3d-button-browser.js` 皆通過。
- `3d-equipment-contract.cjs`／`3d-batch28-preflight.cjs`／`3d-asset-registry-integrity.cjs`、18 GLB Khronos 零 error／warning；`3d-player-assets-browser.js`／`3d-equipment-assets-browser.js` 皆在精簡成品通過。53 骨／9 掛點、三 LOD、五槽各穿卸／混穿／空槽／遮面、原生關節、30 次穿卸、GLB 404／錯 SHA 逐槽回退、context loss 與釋放保留。
- 原 save-global-writers／newstate owner、GM auth／preferences／early restore、8 個異宇宙完整性、Schema17 matrix／level migration／`save-load-pipeline-integrity.js` 通過；沒有改存檔測試期待值。
- 原 resource-cache integrity／behavior／prefetch、audio lifecycle 20／20、audio regression 9 owner，以及 `audio-lifecycle-browser.js` 原生 50 案通過（含正式主線／各副本／回顧／GM 隔離／前後景／轉生與本機備份）；沒有新增音訊 owner。
- `python3 -B scripts/equipment-concepts.py validate`：210 套／1,050 槽、40 圖、批准零，無修改。`publish-asset-audit.cjs`／`build-publish-dry-run.cjs`／`publish-build-regression.cjs`／`publish-candidate-browser.js`：384 成品檔全部 HTTP／SHA 核對，missingRefs=0，32 背景、6 音樂＋11 音效；新模組保留、開發素材排除。來源 manifest 489 SHA、成品內容指紋均實驗證。

本機以 Playwright 1.55／Chromium 140／SwiftShader，桌機 1280×800、手機 viewport 390×844。實體手機 Safari／硬體 GPU 不在上述通過範圍。

最初受 sandbox 子程序／socket 限制，重新在正常權限下執行。預設環境的 system-ui 指到無法供 Chromium 正常繪製的字體，造成整頁文字空白／高度零、GM 摘要／fallback 文字斷言及普通帳號狀態失敗；起始 main 同樣重現摘要失敗。隔離 FONTCONFIG_FILE 只使用標準 TTF／OTF 後，原測試均通過，未更改期待值、移除 gate 或改 CSS 來製造通過。新增 DOM fixture 的 UTF-8 宣告及新增靜態 guard 的函式邊界定位錯誤已修正；無未處理的本批測試失敗。

## 效能與釋放證據／限制

- 本機人物首次 ready 3067 ms、同頁重開 2213 ms、重開 transfer 0 bytes；純文字 startup 無 GLB request。這是單次軟體 GPU 樣本，**不宣稱前後變快**。
- GM boot 冷／熱樣本 1987／1734 ms，33 已宣告資源重新驗證、33 unchanged、0 changed；沒有將速度差當產品效能改善。
- 人物 10 次重開與裝備 30 次穿卸後，場景關閉／context loss 的 engine、人物／裝備容器、pending 皆 0；保留 CPU buffer 3 份／2,724,647 bytes，在原 8 buffers／16 MiB 上限內。JS heap 60,300,000 bytes 是單點代理值，不能代替長期 memory/GPU 測量。
- 此次產物 36,456,413 bytes；沒有新增模型、預載模型、重置全部快取或改 SW／發布策略。責任拆檔增加兩個必要的小型 JS 入口，不增加 Babylon／GLB 首屏下載。

## 玩家實機待驗

桌機與手機都以自己的正常帳號操作：
1. 首頁、三紀元地圖與回顧、角色／背包、強化／專精／印記／文明／核心，各預覽開→關→再開，再切回原 2D 按鈕。
2. 副本、競技場、鏡像、虛空、文明災厄與異宇宙，在自己已解鎖的頁面操作預覽並來回切頁；確認正式挑戰、獎勵與解鎖不變。
3. 紀錄／劇情／轉生、設定／帳號／雲端／GM 預覽，確認彈窗、手機安全區、捲動及返回正常；不要為驗收清存檔或覆蓋雲端。
4. 正式戰鬥中開關既有預覽，確認原 HUD／結算／音樂正常；缺乏權威特殊遭遇／結算快照仍會 unavailable，不應拿自由圖當正式結果。
5. GM 八類／31 案例、正式同步／自由設定、三 LOD／G007 五槽、混穿／空槽；手機最大化→還原→換分類→返回原頁，確認原位置保留。
6. 直橫切換、背景切回、弱網失敗後重試與多次重開；注意畫面、聲音及手機發熱。真機 context restored／瀏覽器崩潰及長時 GPU 仍待驗。

## 提交、風險與回復

程式 commit 如上；交接文件 commit 由最新 main／交付回報辨識。推送後須使用 main SHA 查詢 `gh api repos/franksky1207/rpg/actions/runs?head_sha=<SHA>`，不可用舊綠燈；本文件建立時 T1-B exact-HEAD Actions／Pages 待確認。

回復採 `git revert` 本批交接與程式兩個提交，將 HTML、共用 loader／DOM、測試及 manifest 一起回復；沒有資料遷移，也無需清除玩家資料。不要單獨回復某個入口而留下跨版本模組。

T1-C 前保留待補：上述實機 gate、特殊遭遇／結算的正式事件與唯一性契約（屬 T1-C）、長測／弱網／真帳號與 GPU。T1-B 程式與本機驗收完成不等於所有真機或轉型選型封版。到此停止，T1-C／T2～T5 維持未施工。
