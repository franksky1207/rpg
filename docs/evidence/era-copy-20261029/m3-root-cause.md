# M3 Chromium 根因與最小修正

基準 main：ad0b6d9969ba61988eb0f64a145b93354adec805。
診斷提交：402727adbcd4cb0a8e493e0b808db9d08d8077f4。
證據：https://github.com/franksky1207/rpg/actions/runs/40824697301/job/123285068435

## 已證實的原因

setup-ci-browser 安裝 Playwright 1.55.0 的 Chromium 140.0.7339.16，但 M3 測試只要發現 /usr/bin/chromium 就覆蓋 executablePath。失敗 runner 實際啟動 Chromium 156.0.8078.0，固定版本安裝與測試執行脫節。

同一 runner、同一瀏覽器，直接從 origin/main 提供原始模組與素材，以及從 PR 提供模組與素材，均產生完全相同的 33 個 alpha 差異（RGBA 與座標見同目錄 m3-failure-evidence.json）。兩者外觀 spec key 相同。所有差異位於 x=53..73、y=157..169 的主體外特效邊緣，bodyAlpha 全為 0；不存在主體透明度被改寫。meanAlphaError=0.00019073486328125，meanChannelError=0.031283669012375635。切換 willReadFrequently 不改變結果，排除單純讀回路徑差異。

本機同環境 main／PR 完整原始 M3 各 895 外觀、35 golden、48 特效組件均通過，且 comparisons 完全一致。void-boss-06 alphaDifferences 均為 0，meanChannelError 均為 0.031021596699830137。另在系統 Chromium 154、Playwright Chromium 140（含 headless shell）、Ubuntu 24.04／Playwright 1.55.0 容器的相同素材對照中均為 0。原 golden WebP SHA-256 為 b209367c7d315669ae9101e1ab82de042d77f345bb3f4fae29b6524093ad13f2，已與原 Git 物件核對。

這是像素測試誤用非固定瀏覽器造成的既有 main 測試缺陷；不是 PR 文案、素材、配色、動畫或正式渲染程式的差異。不能由這些證據推論 Chromium 156 所有渲染都錯誤；本修正只恢復既有像素驗收的固定工具鏈。

## 修正

只修改 monster-appearance-browser.cjs 的啟動區段：移除系統 Chromium 覆蓋，使用 Playwright 自身固定版本；啟動後比對實際 browser.version() 與該套件 browsers.json 的 browserVersion，版本不符即失敗。將實際／預期版本寫入 CI artifact。保留 WebKit 啟動方式。

所有既有 appearance evaluate、895／48 計數、alphaDifferences===0、RGB 門檻、角色／圖鑑同源、六動作、別名、記憶體與引用釋放斷言逐字保留。未提高容許誤差、未改基準圖、未改正式 renderer 或任何玩法。調查用臨時診斷程式已移除，原始診斷資料保存在 JSON 與 Actions artifact。

## 驗收狀態

修正前對照與根因證據已完成。修正後 M3 Chromium／WebKit 與最新 SHA 必要 CI 以 GitHub Actions 結果為準；本紀錄建立時尚待執行，不預先宣稱通過。後續最終結果與部署 SHA 記錄於 PR #114。
