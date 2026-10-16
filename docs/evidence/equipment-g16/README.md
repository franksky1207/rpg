# G16 本機驗證證據

基準main：c59fdd72c210c298131c5527b06ea5938a28a2dd；日期2026-10-16 UTC。本目錄為實際本機驗證，最終main SHA與Actions於提交後查核，不能用本機或舊提交取代。

- generate-initial.json、concept-validate.json、generate-final.json、status-final.json、plan-final.log與plan-next.log：210套／1,050槽、80套批准／160圖、130套未製作；G16完整五套十圖，G17五套仍缺十圖；重跑changedFiles=0。
- concepts-final-tests.log：118項完整unittest最終通過（全套117項通過，僅舊批准範圍期待值仍為75套的一項失敗；改為精確80套後concepts-counts-retry.log單項重跑通過），涵蓋正式六欄身份、schema4單一Codex、SHA／來源／fingerprint與安全負例、G024/G030接受原圖、全部歷史鎖、G16十原PNG與WebP獨立解碼、未製作G081防偽批准與發布隔離。
- protection-full.log與protection-results.json：20項命令全通過，含角色Python17項、角色／GM／正式／武器Node37項、來源與publication、歷史fixture、phase6、武器210套／1,050槽映射、T4／owner clock／controller／G007舊3D、423檔JS結構、517項manifest及發布政策回歸與staging。
- runtime-cli.log、runtime-cli-results.json、runtime-retry.log、runtime-retry-results.json、runtime-final-retry.log、runtime-final-retry-results.json：Runtime Integrity工作流程99項命令最終全通過；52項首輪缺gltf-validator模組選擇或Chromium執行檔路徑，補齊本機環境後逐項重跑；closure另修測試啟動隔離，其餘測試與全部Runtime不改。
- sprite-browser.log、equipment-gm-browser.log、equipment-weapons-{timing,browser}.log、equipment-formal-{browser,failures,review,higher-dungeons}.log與audio-browser.log：九項真Chromium檢查最終全通過，包含既有三套角色／五動作、GM三viewport、武器時序、正式視角、故障與生命週期、高維回顧及副本、音訊。這些測試保護既有素材，並非宣稱G16角色素材或GM已完成。
- history-release-check.json：577歷史檔SHA、前75及後130筆索引、210套正式身份保持不變；G16共45個概念／原稿／審查／notes來源檔均未進Pages staging。
- publish-audit.json：git add圖片及證據後執行，hardMissing=[]，來源與原PNG／WebP不進正式發布。g024-gate.json、g030-gate.json保留接受例外的正例。
- image-review-manifest.json及逐套sources/generation.json：十次實際image_gen，原PNG逐位元組保存；WebP採RGB quality=92 method=6，全部1536×1024完整解碼；完整prompt／來源工具路徑／PNG與WebP bytes及SHA／參考原稿SHA／權利依據可查。生成原圖及288×192實際WebP縮圖已逐張目視；五套schema4單階段blocker=0，局部細節列advisory。

初輪及自我修正紀錄保留：concepts-initial-incomplete.log為入庫未完全結束時啟動的測試，已停止該輪並在最終狀態完整重跑；該全套的一項舊75套期待值修正後再單項驗證；initial-*及retry-before-fix-*瀏覽器log與equipment-gm-initial-port.log保留本機服務port未統一及長時間測試的背景checkpoint時間戳差異。GM測試停在外部登入畫面，已沿用既有equipment-formal/helpers.cjs固定測試帳號與finishIntro，並使用production=1隔離開發自動診斷；正式登入／GM程式不改，原121斷言保留。GM僅固定父頁Date.now；武器以page.clock.setFixedTime固定Date，均取既有checkpoint的ts；計時器與performance.now持續前進，避免背景checkpoint心跳只改ts造成假失敗；精確localStorage／正式State／saveCalls=0斷言全保留。異宇宙closure則明確載入GM owner並隔離自動診斷，避免診斷在50次讓步後改變GM context revision而正確觸發stale；保留100次與完整State斷言。正式角色layout在同一次瀏覽器取樣內核對套裝與位置，避免快戰結束後DOM已釋放；兩紀元災厄音訊以當次trace游標綁定真native playing事件及同一時刻的track／單voice／未暫停／readyState≥2證據，不沿用舊事件。原安全斷言保留。最終以明確RUNTIME_SMOKE_URL、正確Chromium與依賴設定依序重跑，沒有刪除斷言、放寬身份或改歷史SHA。

本機工具設定見local-environment.json。沿用/workspace/.rpg-tools/system-chromium.cjs與已安裝Chromium，固定SDK請求供應現有真實SDK原始位元組（SHA d6a5c4414a5d4ce646d9c1de223aa7067d3ff664c15394ffeb7fcffc763354a3），是網路SDK本機副本；GM與正式戰鬥測試另依既有helpers使用明確測試帳號fixture，不視為真帳號驗收；不改正式程式、代理或TLS。工具及SDK不入庫。實體iPhone／Android／Safari及長時間熱／記憶體未在本批驗收。

概念批准不等於正式素材或發布：asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。正式第28批仍進行中，第29～40批未開始；下一批G17＝G081～G085，未製圖。

最終逐命令結果見final-command-results.json，每項標示其實際重跑結果來源。Runtime依初輪→環境重跑→closure最終重跑；瀏覽器依初輪→各輪修正重跑→GM最終重跑合併。所有初輪失敗保留，不把失敗標為成功；validation-summary.json列最終已收斂的檢查數。
