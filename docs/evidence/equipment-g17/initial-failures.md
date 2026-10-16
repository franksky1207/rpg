# G17 初輪失敗與處理

以下為本任務實際觀察，未隱藏或改寫為成功：

- 預設 sandbox 的 `git fetch origin main` 與 curl 無法連 proxy:8080。改以 GitHub connector 確認 main=553aa558；其後使用支援的額外 network 權限，git fetch 與 gh API 均成功。未變更代理、TLS或憑證。
- `http.server 4173` 首輪 socket PermissionError；以額外 network 權限啟動成功。
- archive.py 首輪已完成十圖原稿轉存與WebP，最後寫 docs/evidence/equipment-g17/image-review-manifest.json 因目錄未建立而 FileNotFoundError。建立目錄後重跑，原PNG保持同位元組、二十圖完整解碼，SHA按實際檔案計算。
- 發布稽核首次命令錯用不存在的 scripts/audit-publish-assets.cjs；錯誤保留於 publish-audit-initial.log。改用正式 scripts/publish-asset-audit.cjs 後，預設 sandbox 的 Node spawnSync git EPERM；額外 network 權限下正式稽核通過，hardMissing=[]。未改發布策略。
- protection-015.log 的JS結構掃描因runner 360秒限制逾時。瀏覽器preloader被繼承到每個node --check子程序造成不必要負載；獨立不預載瀏覽器重跑通過，見js-integrity-retry.log。Runtime原工作流程同命令亦實際通過；沒有刪掉423檔語法檢查。
- GM初輪 browser-001.log 捲動位置 291→102，原斷言失敗。把取樣移至真click事件仍曾失敗，見gm-browser-final.log；不能宣稱單靠該調整已解決。gm-browser-retry.log 另遇敗北像素取樣時序失敗。測試改以requestAnimationFrame等待相同精確像素條件，再保留原始像素斷言；不刪五動作、三套角色、三viewport或任何State／storage／權限斷言。完整診斷與最終重跑另見各log。
- 自動審核曾拒絕縮短版診斷命令，認為可能削弱GM驗證；該命令未執行。替代方案只將完整測試複製到work並增加尺寸／捲動診斷，保留全部驗證範圍。未要求額外使用者批准，也未修改正式GM程式。
- 概念完整unittest首輪118項：117項通過，test_actual_counts_names_statuses仍預期range(1,81)，對真實新增五套報錯。改為精確range(1,86)（G001～G085），保留其餘正式名稱／狀態斷言後單項重跑；另有G17四項原稿／歷史／來源測試及一項完成／未完成批次規劃測試。


提交後CI補查：首個提交cd31fd98868bdead9425c51b0fafd193f0900d11之正式戰鬥Action run38914347022在higher-dungeons.cjs因角色已結算移除、第二次IPC讀dataset得到null而失敗；先前正式三viewport、全部故障回退與回顧已通過。保留完整github-formal-initial-failure.log與actions-first-commit.json。測試改同一瀏覽器取樣綁定實際可見G007角色、combat mode/world及diagnostics，保留原W3不變、錯誤空陣列與結算斷言；沒有延長戰鬥或改正式程式。兩種副本本機重跑通過，見higher-dungeons-ci-fix.log；最後再核對修正後main SHA之Actions。
