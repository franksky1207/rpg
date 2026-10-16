# G18 初次失敗與環境限制

- git fetch origin main 多次實際失敗：`Failed to connect to proxy port 8080 ... Could not connect to server`。改用已連接GitHub工具核對main、取得文字與WebP；保留代理及TLS設定，沒有繞過代理。最新commit/tree物件按遠端SHA精確重建，不改其內容或歷史。
- GitHub fetch_file(base64)對超過1MiB的G17 PNG回傳空content；fetch_blob及fetch git/blobs回報非UTF-8。沒有用假PNG替補、刪除歷史檔、重畫或編造SHA。遠端十PNG沿用原blob；本機索引仍追蹤其原SHA，工作樹顯示缺檔，提交時明確不送出任何刪除。
- 完整概念unittest首輪127項，125通過、2項FileNotFoundError，均為本機缺G081原PNG的歷史／原稿檢查。之後新增保留G17批次正例另實跑通過，共128項覆蓋。本機不能冒稱全部128項通過；完整checkout的最終SHA CI須再查。
- Runtime與保護命令首輪部分spawnSync git EPERM及Playwright下載版Chromium不存在。使用既有system-chromium preloader、真實本機SDK及必要的執行權限重跑，未更改正式程式或斷言。GM瀏覽器首次executablePath=undefined覆蓋preloader預設路徑，另明確設定CHROMIUM_PATH重跑。原始log及重跑log均保留。
- 本機publish-assets.inspect嚴格要求每個追蹤source檔存在，因此建置／稽核及其相依命令被缺失G17原PNG阻擋。既有舊.publish-stage3另有GLB SHA不符，未拿該舊stage當驗收成果。沒有降低驗證器、移除source追蹤、生成佔位圖或改正式遊戲規避。瀏覽器使用當前真實source；發布stage與完整歷史鎖交由最終SHA GitHub CI查驗。

各命令原始exitCode及log見results檔；未成功的本機命令維持原失敗，不以文字改成pass。最終main CI狀態須另以該SHA查詢，不引用G17舊成功。

GM桌機完整原測試重跑曾在捲動還原291→102失敗。診斷採真頁面同點擊前／還原後的scrollY、scrollHeight與innerHeight，顯示291→291／1122／831且診斷通過；再跑未改斷言的完整三尺寸原測試，最終121斷言通過。保留失敗、診斷與最終log；不宣稱已排除所有時序波動。
