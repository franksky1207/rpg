# G11 本機驗證證據

基準main：038e07c124645eb7db0d4886b12e6a551c09da17。生成／審查日期2026-10-15 UTC（臺灣2026-10-16）。本目錄為實際本機紀錄；不是實體手機或遠端CI結果。

- generate-final.json、concept-validate.json、plan-final.log、status-final.json：正式產生器與驗證器、G11缺圖計畫與全庫批次狀態。完成批次plan為空，status明列approvedSets=5／imagesPresent=10／imagesMissing=0。
- concepts-tests.log：第一輪完整92項通過。新增G11批次完成斷言後，最終完整版本見concepts-tests-final.log；批次專項見batch-planner-final.log。
- protection-full.log：角色素材驗證、17項Python測試、四個Node測試檔共37項、武器來源／原角色SHA、GM／正式publication、歷史fixture、phase6依賴、發布契約、武器身份、T4隔離、owner clock／controller、發布build與完整staging。
- runtime-integrity.log：JavaScript結構與資源manifest完整性。
- publish-audit.json、history-release-check.log：正式發布hardMissing=[]；G11全部45個概念／原稿／證據／notes檔排除且不在staging；352歷史檔SHA、前50套索引及155套未製作索引等同基準。
- 真Chromium：sprite-browser.log、equipment-gm-browser.log、equipment-weapons-{timing,browser}.log、equipment-formal-{browser,failures,review,higher-dungeons}.log、audio-browser.log。

瀏覽器沿用已安裝Playwright與/usr/bin/chromium。音訊僅透過既有/workspace/.rpg-tools/system-chromium.cjs指定本機Chromium執行路徑，未設定RPG_OFFLINE_SDK，未修改原測試或斷言。依序完成staging後才開始瀏覽器，保留G09／G10的GM截圖穩定性修正與完整歷史checkout。

環境與核對修正：一般沙箱Git連線無法連到已配置proxy；改用獲准的正常權限後fetch成功，未繞過proxy或關閉TLS。發布稽核的excluded為物件陣列，核對腳本改讀path；稽核依Git追蹤清單，故先暫存45個新批次檔，再驗證全部排除。這些核對腳本修正沒有修改發布政策、正式Runtime、圖片或審查。

原PNG、工具原路徑、參考SHA、WebP轉檔與權利依據在各套sources/generation.json；原圖與288×192實際WebP縮圖均已目視。概念通過後，角色／武器仍not-started、GM not-tested、formalReleaseAllowed=false。

GitHub Actions須推送後依最終SHA核對，不以pending、舊SHA或本機成功代替。實體手機與G11正式素材仍未製作或驗收。
