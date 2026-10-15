# G10 本機驗證證據

基準 main：78f1fd2a7666f4d86b35e153bd4e2d32e78eef3f。日期2026-10-16（臺灣）。逐套原PNG、生成來源與SHA、WebP及schema4在正式概念目錄；此目錄為本機執行紀錄，不代表實體手機或遠端CI。

- `equipment-concepts.py generate`／`validate`、`equipment-concept-batches.py plan --batch G10`／`status`：見對應JSON與空plan（完成批次無缺圖開工項）。
- `python3 -m unittest discover -s tests/equipment-concepts -v`：concepts-tests.log。
- `equipment-sprites.py validate`、17項Python素材測試及角色／GM／正式／武器四個Node測試檔：sprites.log（Node 37項）。
- `equipment-weapon-assets.py`、GM／正式發布manifest、formal-fixture-history、phase6依賴、正式／GM publication、武器名稱、T4隔離、owner clock／controller、build-publish-dry-run與stage-hybrid-preview：protection-full.log。
- 正式發布資產稽核：publish-audit.json；本批45檔排除及歷史307 SHA／索引逐筆比對：history-release-check.log。
- 真Chromium：sprite-browser.log、equipment-gm-browser.log、equipment-weapons-{timing,browser}.log、equipment-formal-{browser,failures,review,higher-dungeons}.log、audio-browser.log。

必要修正與環境紀錄：一般沙箱Git網路代理不可達、Node子程序Git EPERM，改用已獲准正常權限執行；未修改正式程式。首次GM測試在完整staging完成前啟動而找不到iframe操作，原log保存為gm-initial-stage-missing.log，待staging完成後全套依序重跑。首次概念測試87項中一項仍寫死45套批准而失敗，保留concepts-tests-initial.log，更新成正式50套並新增總數／隔離檢查後重跑。角色未批准負向案例另由G046改為G051，保留全部安全斷言。未使用關閉TLS或降低斷言處理環境問題。

GitHub Actions需推送後依最終SHA另外核對，不把pending、舊SHA或本機成功冒稱遠端成功。

最終概念unittest 88項通過。音訊本機以work/g10-chromium.cjs僅覆寫Playwright launch的executablePath=/usr/bin/chromium及no-sandbox，原測試／斷言不改；首次缺預設瀏覽器log保存audio-initial-browser-missing.log。work執行器不提交或發布。

最終音訊原測試50情境通過；使用官方CDN經瀏覽器TLS，沒有修改SDK或關閉TLS。
