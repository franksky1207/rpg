# G17 本機驗證證據

基準main：553aa5583f5cea8e93260ae4fada1ed79d1b07c0；日期2026-10-16（Asia/Taipei）。此為實際本機驗證，最終main SHA及Actions於提交後另核對，不以本機或舊SHA代替。

- generate-initial.json、concept-validate{,-final}.json、generate-final.json：210套／1,050槽；85套批准、170圖、125套未製作；重跑changedFiles=0。
- status-final.json、plan-final.log與plan-next.log：G17完整五套十圖，G18＝G086～G090仍缺十圖；未開始下批或正式第29批。
- concepts-initial-tests.log：完整118項首輪117通過，唯一失敗為舊80套批准期待值；改為精確G001～G085後concepts-counts-retry.log單項通過。g17-artifacts-tests.log另4項原稿、SHA、schema4、歷史及隔離通過；g17-planner-test.log另1項完成／未生成批次檢查通過，合計123項覆蓋。未刪任何測試或安全斷言。
- protection-results.json：20項命令，其中JS結構掃描初輪逾時；js-integrity-retry.log不載入不必要的瀏覽器preloader後通過（423檔）。其餘19項原輪通過，包括角色Python17項、Node角色／GM／正式／武器37項、210套五槽武器名稱、G007舊3D、owner clock/controller、發布政策及staging。
- runtime-results.json與runtime-000..098.log：Runtime工作流程99項命令全部實際通過，含正式owner、存檔、轉生、GM、音訊、manifest及文件完整性。
- browser-results.json：9項真Chromium最終通過。GM初輪失敗詳initial-failures.md；gm-scroll-diagnostic.log完整三viewport／三套／五動作診斷通過，gm-browser-verify.log正式重跑121斷言通過，未刪State、storage、授權或回退斷言。其他8項含角色動畫、武器時序／GM實戰、正式戰鬥、故障回退／生命週期、回顧、高維副本及50項音訊原生事件。
- final-command-results.json逐命令記錄實際最終證據與初輪失敗；validation-summary.json彙總。初輪log皆保留，不能把初輪失敗當作首輪成功。
- history-release-check.json：G001～G080共622歷史檔SHA、前80與後125筆索引、210套正式身份及1,050槽保持不變。G024/G030接受例外正例見兩個gate檔；所有舊鎖與schema3／schema4、G007舊資產保留。
- publish-audit.json：圖片與證據git add後正式稽核hardMissing=[]；概念及原PNG不進Pages staging，build與stage命令通過。
- image-review-manifest.json與逐套sources/generation.json：十次實際image_gen，十PNG與十WebP全部1536×1024完整解碼；RGB quality=92 method=6；逐檔bytes／SHA、完整prompt、工具路徑、參考原稿SHA及權利依據可查。二十遠端blob git object SHA亦已對照本機相符。原圖與288×192 WebP縮圖逐張目視；五筆schema4各單一Codex stage，blocker=0，5條advisory。

初輪網路／sandbox／轉存目錄／錯命令／期待值／GM測試時序與重跑細節見[initial-failures.md](initial-failures.md)。GM測試只修同步取樣與等待精確像素條件，不改正式GM、Runtime或玩法。捲動首輪仍曾失敗，完整最終重跑三尺寸均回到原位置；不宣稱已證明消除所有時序波動。

本機環境見local-environment.json；既有system-chromium preloader及真SDK本地副本只用於測試，未入庫、未更換代理或TLS；測試帳號fixture不是正式雲端真帳號驗收。iPhone／Android／Safari、熱／記憶體長測未做。

概念批准不代表角色或發布：asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。正式第28批仍進行，第29～40批未開始；G18未製圖。最終main Actions須查提交後該SHA的實際結果。
