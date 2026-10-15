# G12 本機驗證證據

基準main：89738447f133ce8497731ee5e9cddd63d66328a7。生成／審查日期2026-10-15 UTC。本目錄為實際本機紀錄，不是實體手機或遠端CI結果。

- generate-final.json、concept-validate.json、plan-final.log、status-final.json：正式產生器、驗證器及批次狀態。G12 plan完成後為空；status明列approvedSets=5／imagesPresent=10／imagesMissing=0，全庫60套批准、120圖、150套未製作，重跑changedFiles=0。
- concepts-tests.log：完整概念unittest 98項通過，含schema4真實來源、失敗拒絕、歷史SHA及原PNG完整性。
- protection-full.log：角色素材17項Python、角色／GM／正式／武器四個Node檔37項測試、角色與武器來源、GM／正式publication、歷史fixture、phase6、發布契約、武器身份、T4、owner clock／controller、舊裝備及完整staging驗證。
- runtime-integrity.log：423個JS結構與517個資源manifest完整性通過。
- publish-audit.json、history-release-check.log：hardMissing=[]，全部45個G12圖／原稿／來源／審查／notes檔排除且不在staging；397歷史檔SHA、前55套及後150套索引不變，G061未製作。
- 真Chromium結果記於sprite-browser.log、equipment-gm-browser.log、equipment-weapons-{timing,browser}.log、equipment-formal-{browser,failures,review,higher-dungeons}.log及audio-browser.log；本輪全數通過，GM共121斷言、武器時序288組權威差0ms、音訊50情境；初次環境逾時另保留environment-initial-gm.log。

執行修正：一般沙箱無法連到已配置proxy且Node子程序Git曾遭EPERM；改用正常網路權限後fetch與保護檢查成功，未繞過proxy或關閉TLS。角色素材測試仍用G056作未批准負向案例，改用真正未製作G061，保留原拒絕斷言。

瀏覽器環境修正：初次GM因Chromium回報ERR_CERT_AUTHORITY_INVALID，外部SDK未載入，startup等待60秒逾時。永久加入代理CA的要求被自動審核拒絕，未執行該變更。改以curl正常HTTPS／既有CA信任下載實際CDN原始SDK（SHA-256 d6a5c4414a5d4ce646d9c1de223aa7067d3ff664c15394ffeb7fcffc763354a3），僅在本任務Playwright context對該固定SDK網址回傳原始位元組；不是SDK stub、未關閉TLS、未改遊戲或測試斷言。SDK和transport hook僅在/workspace/scratch/g12，未入庫、未發布；本機瀏覽器結果具有此傳輸限制，GitHub CI仍跑原始測試。

沿用完整歷史checkout、GM截圖穩定性，先完成staging才依序瀏覽器回歸。原PNG、工具原路徑、參考SHA、轉檔方式與權利依據見各套sources/generation.json。原圖與288×192實際WebP縮圖已目視；角色／武器素材not-started、GM not-tested、formalReleaseAllowed=false。

GitHub Actions須推送後依最終SHA核對，不以pending、舊SHA或本機結果代替。實體手機及G12正式素材未製作或驗收。
