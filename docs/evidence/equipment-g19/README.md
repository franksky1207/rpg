# G19 本機驗證證據

基準GitHub main：`1dc5a1a58f31784588e35f7a955a1ea307ebd572`；日期2026-10-17（Asia/Taipei；UTC2026-10-16）。先fetch、切main並ff-only完整checkout，非沿用舊工作樹。

- `g17-png-verification.json`：G081～G085十張歷史PNG在最新main均實體可讀，PNG解碼驗證及重新計算SHA-256全部符合各sources/generation.json；不是遠端缺圖，未重製／覆寫歷史圖。此收據於本批任何生圖前寫入。
- `preflight-000.log`：**生圖前**128項完整概念unittest全通過，包含原先缺G17 PNG而受阻的歷史／來源檢查。全部原有鎖與G024/G030例外、schema3／4均實跑。
- `preflight-results.json`及`preflight-001..119.log`：原G18驗收的99項Runtime及19項保護命令，另加正式publish audit，共20項保護。Runtime首輪48通過、51因Playwright預設headless-shell缺失而失敗；`preflight-browser-000..050.log`以既有system-chromium preloader重跑51項全通過，Runtime最終99全通過。保護20命令首輪全通過，涵蓋先前受阻的builder、audit、發布隔離。全部原log保留，無刪斷言。
- `preflight-browser-results.json`及`preflight-browser-051..059.log`：9項真Chromium，使用完整builder產生的`.publish-stage3`。GM、武器時序、武器瀏覽器初輪因預設4188／4189未開server而ERR_CONNECTION_REFUSED，`preflight-gm-url-retry`／`preflight-timing-url-retry`／`preflight-weapons-url-retry`的log與exit保留，以正式支援RUNTIME_SMOKE_URL指向4173後全通過。9項最終均通過；GM維持121斷言／三尺寸／三套／五動作，音訊50案例，其他含角色、正式戰鬥、故障／生命週期、回顧、高維副本。部分最後瀏覽器補驗與生圖期間重疊；沒有冒稱它們在生圖前全部完成。
- `preflight-final-command-results.json`：上述前置命令各自最終exitCode及實際log；原失敗不覆寫。`local-environment.json`記錄最初fetch代理失敗、network enabled修復、現有Chromium與既有SDK離線測試設定；繼承代理／TLS，不繞過網路限制。
- `image-review-manifest.json`及逐套`sources/generation.json`：十次實際獨立image_gen呼叫、十原PNG、十WebP，全部1536×1024。PNG逐位元組保留，WebP為RGB quality=92 method=6；完整prompt、工具路徑、SHA、bytes、唯一參考SHA及權利依據。十新WebP SHA互異且不與前180圖重複。
- `small-size-review.jpg`：實際兩張288×192 WebP／套的檢查用縮圖，非正式替代素材；原圖及小圖均目視。五套頭盔、肩胸、刀劍、雙鞋、背飾主體可辨，輪廓互異。五筆schema4、equipment-2.5d-v3.0、單一Codex stage；blocker=0，各一條局部視角／接縫advisory，不新增接受例外。
- `history-preservation.json`與`tests/equipment-concepts/g001-g090-sha256.json`：712檔歷史實際SHA全部符合，前90套與G096以後索引逐筆不變，210正式身份與1,050槽保持；所有舊鎖及G007舊3D、G024/G030原例外永久保留。
- `final-000..006.log`：正式generate、validate、G19已完成、G20缺十圖、G024/G030 gate及generate無追蹤漂移均通過。`concept-generate-initial.log`保留最初索引推導結果。95套190圖，剩115套230圖。
- `final-concept-unittest.log`：入庫後完整**133項全通過**，新增G19四項素材／歷史／索引／隔離測試與一項批次完成測試。原先未製作負例移G096，錯身份、SHA、來源、假批准與里程碑斷言保留，舊SHA鎖不減。
- `final-results.json`與`final-007..026.log`：入庫後保護／發布20命令，19項初輪通過；角色Python17項首輪1失敗是舊測試仍用已完成G091作未生成負例。僅將該identity改G096，verified concept阻擋斷言不變；`final-sprite-negative-retry.log`重跑17項全通過。最終20命令皆通過；builder／audit使用已加入Git索引的新素材，development概念source仍被排除。
- `final-027..030.log`：先前缺歷史PNG的Runtime三命令及docs integrity入庫後再跑全部通過。正式JS／CSS、存檔、GM、戰鬥及音訊沒有修改，前置其餘Runtime／瀏覽器結果仍對應相同正式程式。
- `final-published-browser.log`與exit：最終stage再跑正式戰鬥瀏覽器，桌機1365、手機390與橫向844全部通過，保留真像素、owner clock、混穿、HP、死亡／閃避與不下載舊引擎／GLB等原斷言。
- `final-command-results.json`彙整入庫後各命令最終exitCode，`validation-summary.json`提供總數。所有初輪失敗仍保留，不把未執行、受阻或未查證寫成功。

本次僅G091～G095概念批准。角色素材not-started、GM not-tested、formalReleaseAllowed=false；前述GM自動測試僅既有三套，不代表G19素材完成。第29～40批未開始，G096以後未製作；下一批G20＝G096～G100。實體iPhone／Android／Safari、真帳號雲端及熱／記憶體長測未做。

最終提交SHA的Actions於push後實查，不預告成功，不引用舊SHA；結果在最終回覆逐項列出。完整Git追蹤範圍與歷史不變在提交前再核對。
