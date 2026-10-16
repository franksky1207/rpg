# G13 本機驗證證據

基準main：4d072565adcf1d2e309fab8ef5d8e0df452982e4。生成／審查日期2026-10-16 UTC。本目錄為本任務實際本機紀錄，不是遠端CI或實體手機結果。

- generate-final.json、concept-validate.json、plan-final.log、status-final.json：65套批准／130張圖／145套未製作；G13五套批准、十圖齊全、缺圖0，G066未製作；重跑changedFiles=0。完成後plan為空。
- concepts-tests.log：103項完整概念測試通過，包括schema4單階段、正式身份、來源、拒絕偽造、原PNG參考鏈、歷史SHA及發布隔離。
- g13-final-review-tests.log：最後G064構圖advisory精確記錄後，G13四項驗證重跑通過；兩圖與原PNG不變。
- protection-full.log：角色素材17項Python與角色／GM／正式／武器37項Node測試通過；角色／武器來源、GM／正式publication、歷史fixture、phase6、武器名稱、T4、owner clock／controller、舊3D裝備契約、JS／manifest與完整staging檢查。
- publish-audit.json：hardMissing=[]；新45個G13概念、原稿、來源、審查與notes全部明確排除且不在Pages staging。稽核以git ls-files讀追蹤檔，已先git add新檔再重跑，不把未追蹤漏列誤當安全通過。
- history-release-check.log：442歷史檔SHA、前60套與後145套索引、210套／1,050槽名稱與映射均不變；G066未製作。
- sprite-browser.log：三套既有角色、五動作、128px raster、切換／取消／快取及SHA／404故障回退通過。
- equipment-gm-browser.log、equipment-weapons-{timing,browser}.log、equipment-formal-{browser,failures,review,higher-dungeons}.log、audio-browser.log：實際Chromium回歸全部通過：GM三viewport121斷言、武器與正式三viewport、故障／生命週期、高維review與虛空／鏡像副本；武器時序288組權威差0ms，音訊50情境。

環境處理：一般沙箱網路及Node子程序Git有EPERM，使用正常額外網路權限執行fetch、Git稽核及瀏覽器；沒有繞過proxy或關閉TLS。初次GM外部SDK載入逾時保留environment-initial-gm.log。沿用G12方式以curl正常HTTPS／既有CA下載實際CDN SDK（SHA-256 d6a5c4414a5d4ce646d9c1de223aa7067d3ff664c15394ffeb7fcffc763354a3），僅在本任務Playwright context對固定SDK網址回傳相同原始位元組。非SDK stub、不關TLS、不改遊戲或測試斷言；hook與SDK只在/workspace/scratch/g13，不入庫或發布。音訊測試首次因Playwright預設headless-shell未安裝而中止，environment-initial-audio.log保留；以本機launcher指定已安裝的/usr/bin/chromium重跑，不改測試或斷言。其餘正式測試沿用既有fixture。GitHub CI跑原始流程，與此本機傳輸限制分開。

保留完整歷史checkout、GM截圖穩定性，以及先完成staging後依序執行瀏覽器流程。原PNG逐位元組保存；十張實際WebP的288×192縮圖已逐張目視。概念不等於角色完成：asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。

最終提交SHA與實際觸發Actions結果於完成回覆核對；不引用舊SHA或以pending代替通過。G13正式角色、武器、GM／正式發布及實體手機均未製作或驗收。
