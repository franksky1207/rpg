# G15 本機驗證證據

基準GitHub main：56d95987e9115cf74a4967492bae4e38606b8f87；生成及審查日期2026-10-16 UTC。本目錄為本任務實際紀錄，不代表遠端CI或實體手機驗收。

- generate-initial.json、concept-validate.json、generate-final.json、plan-final.log、status-final.json：75套批准／150張概念圖／135套未製作；G15五套批准、十圖、缺圖0；G076未製作。重跑changedFiles=0。已完成批次的plan輸出為空。
- concepts-tests.log：113項完整概念測試全部通過，涵蓋正式身份、schema4單階段、來源／SHA／fingerprint與偽造拒絕、歷史來源鏈、PNG／WebP解碼、G076負向案例、發布隔離及五套批次。
- sprite-tests.log：17項角色素材Python測試全部通過；既有三套正式素材保留，概念批准不自動推導素材完成或發布。
- protection-full.log：角色／武器來源、GM與正式publication、歷史fixture、phase6、武器身份與210套／1,050槽映射、角色／GM／正式／武器37項Node測試、T4、owner clock／controller、舊3D裝備契約、423檔JS結構、517項資源manifest及staging全部通過。
- history-release-check.log、publish-audit.json：532歷史檔SHA、前70筆及後135筆索引與全部正式身份保留；G15全部45個概念、來源PNG、審查、證據與notes明確排除且不在Pages staging；hardMissing=[]。發布稽核前先git add，避免遺漏未追蹤圖片。
- sprite-browser.log、equipment-gm-browser.log、equipment-weapons-{timing,browser}.log、equipment-formal-{browser,failures,review,higher-dungeons}.log、audio-browser.log：本輪真Chromium全部通過：三套角色五動作、GM三viewport121斷言、武器與正式三viewport、缺材／SHA／解碼／慢載入／生命週期、高維回顧與虛空／鏡像副本、武器時序288組權威差0ms、音訊50情境。

十次真image_gen：每套先生成三視、view_image檢視後參考本套原PNG另次獨立生成五槽。原PNG逐位元組保存，十WebP以Pillow RGB quality=92 method=6轉檔，全部1536×1024完整解碼、SHA各自獨立。兩圖原稿與288×192 WebP縮圖已逐張目視；advisory依影像實際差異記錄於逐套Codex證據，不提高AAA／工程級拆件門檻。

環境與初輪診斷保留：protection-initial-sandbox.log為Node啟動git子程序遭EPERM；protection-during-import.log為G071圖片已寫入、正式generate尚未完成時的stale notes檢查。完成入庫後以支援的額外權限重跑全套，未修改檢查斷言。equipment-gm-initial-browser-path.log為測試明確傳入undefined覆蓋本機預載器預設瀏覽器路徑，修正本機命令CHROMIUM_PATH=/usr/bin/chromium後重跑，未修改GM測試或Runtime。

沿用/workspace/.rpg-tools/system-chromium.cjs指定已安裝Chromium；Playwright context對固定SDK網址提供既有真實CDN SDK原始位元組（SHA-256 d6a5c4414a5d4ce646d9c1de223aa7067d3ff664c15394ffeb7fcffc763354a3），不是stub，不改正式程式、網路代理或TLS。上述本機工具及SDK不入庫、不發布。CI使用原始工作流程。保留完整歷史checkout、GM截圖穩定性及先staging再依序執行瀏覽器測試的流程。

最終提交SHA與其實際觸發Actions於任務回覆核對，不引用舊SHA或將pending稱為通過。角色／武器素材未製作，asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。未修改正式玩法、戰鬥UI、手機資訊框、角色固定站位、原地攻擊動畫、存檔、文字／極簡／背景或音訊。
