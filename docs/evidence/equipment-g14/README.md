# G14 本機驗證證據

基準main：5949950599dce60564e16a1ad12e17452ff0c77e。生成與審查日期2026-10-16 UTC。本目錄為本任務實際本機紀錄，非遠端CI或實體手機結果。

- generate-final.json、concept-validate.json、plan-final.log、status-final.json：70套批准／140張圖／140套未製作；G14五套批准、十圖、缺圖0，G071未製作；重跑changedFiles=0。已完成plan為空。
- concepts-tests.log：108項完整概念測試全數通過；涵蓋schema4單階段、身份、來源、拒絕偽造、原PNG參考鏈、歷史SHA及發布隔離。
- concepts-initial-stale-baseline.log：首輪測試在import舊65套總數後，執行期間檔案改為70；traceback顯示新原文但記憶體仍為舊基準，唯一失敗是五個新批准ID。保留實際失敗log；最後完整重跑，不放寬斷言。
- protection-full.log：角色素材Python17項與角色／GM／正式／武器Node37項通過；角色與武器來源、GM／正式publication、歷史fixture、phase6、武器身份、T4、owner clock／controller、舊3D裝備契約、JS／manifest與staging。執行器初次誤填不存在的js-structure-check.js，保留MODULE_NOT_FOUND紀錄，其後以工作流程正式入口js-integrity.js續跑並通過；未改遊戲或測試。
- publish-build-regression.log、publish-audit.json、history-release-check.log：發布政策、hardMissing=[]；487歷史檔SHA、前65套與後140套索引、210套／1,050槽身份映射不變，G071未製作；G14全部45個概念／來源／審查／notes明確排除且不在Pages staging。稽核前git add，避免未追蹤檔漏列。
- sprite-browser.log、equipment-gm-browser.log、equipment-weapons-{timing,browser}.log、equipment-formal-{browser,failures,review,higher-dungeons}.log、audio-browser.log：本輪真Chromium全部通過：角色三套五動作、GM三viewport121斷言、武器／正式三viewport、故障回退與生命週期、高維review及虛空／鏡像副本、武器時序288組權威差0ms、音訊50情境。

環境：一般沙箱proxy:8080不可連，使用工具正常額外網路權限完成Git與瀏覽器，無繞過proxy或停用TLS。沿用既有/workspace/.rpg-tools/system-chromium.cjs指定已安裝/usr/bin/chromium；Playwright context對固定SDK網址提供既有真實CDN SDK原始位元組（SHA-256 d6a5c4414a5d4ce646d9c1de223aa7067d3ff664c15394ffeb7fcffc763354a3），非stub，不改正式遊戲或測試斷言。工具與SDK不入庫或發布。CI跑原始流程。

保留完整歷史checkout、GM穩定截圖與先staging再依序瀏覽器測試流程。十PNG逐位元組保存，十WebP及288×192縮圖已逐張目視。G066字形、G067補充單品與刀彎度、G068補充近景、G069側視角度、G070背視省略側板及腰甲材質微差依實際影響記advisory，blocker=0。

最終提交SHA與實際觸發Actions於任務回覆核對，不引用舊SHA或把pending稱為通過。G14正式角色／武器素材與GM未製作：asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。
