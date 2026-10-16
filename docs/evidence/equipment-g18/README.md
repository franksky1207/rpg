# G18 本機驗證證據

基準main：`a81f2f3d5a95dbbcfa7cd33c7d59be5c290eb54d`；執行2026-10-16～17（Asia/Taipei）。本機與最終SHA GitHub CI分開記錄，不引用G17舊成功。

- `image-review-manifest.json`、`remote-binary-blobs.json`與逐套sources/generation.json：十次實際獨立image_gen、十原PNG、十正式WebP；20檔1536×1024完整解碼、PNG逐位元組保留、RGB quality=92 method=6、bytes／SHA／完整prompt／工具路徑／參考SHA及權利依據。20個遠端blob Git SHA皆對上本機。逐張原圖與288×192 WebP縮圖已目視，五套主輪廓互異；五筆schema4單一Codex，blocker=0、各一條advisory。新十WebP SHA亦未與前170張重複。
- `concept-000..006.log`：現行validate、G024/G030接受例外正例、批次status、G18完成、G19十圖缺失、generate重跑changedFiles=0皆通過。210套／1,050槽；90套／180圖，剩120套240圖。G091～G095沒有提前製作。
- `concepts-initial-tests.log`：首輪127項中125通過、2項因本機缺G17原PNG而FileNotFoundError。`g17-planner-preservation.log`新增保留G17完成正例另通過，合計128項覆蓋；不冒稱本機128項全綠。錯身份、錯SHA、來源變更、假批准、未製作及里程碑、G024/G030例外等原安全斷言保留；負例移至實際未製作的G091。
- `runtime-results.json`及`runtime-retry-results.json`：99命令首輪及失敗重跑；最終96通過，3命令因發布來源檢查需要本機缺失的G17 PNG而受阻。Chromium路徑與執行權限修正，沒有改正式程式、縮減斷言或遊戲時間。JS結構檢查用原純Node環境，不套不必要的瀏覽器preloader。
- `protection-results.json`及`protection-retry-results.json`：19命令最終14通過、5受缺歷史source／舊stage阻擋。包含角色Python17項、Node角色／GM／正式／武器37項、正式身份／刀劍、G007舊3D與owner clock等實際成功檢查。完整builder／publish audit不可在缺source時冒稱成功；驗證器未放寬，完整checkout須由最終main CI再查。
- `browser-results.json`與`gm-browser-final.log`：9項真Chromium最終全部通過，使用當前source伺服器。GM原121斷言、三尺寸／三套／五動作、State／storage／授權／回退全保留。首輪Chromium路徑失敗；重跑桌機捲動曾291→102失敗，`gm-scroll-diagnostic.log`同頁實際量測還原291→291、頁高1122及視窗831，診斷通過；完整原測試再跑三尺寸最終通過，沒有改GM或斷言，也不宣稱消除所有時序波動。其他八項含角色動畫、武器時序及GM實戰、正式三尺寸、故障／生命週期、回顧、高維副本與音訊。高維副本保留G17同次取樣修正，兩模式實測角色及結算通過。
- `remote-tree-preservation.json`：已從GitHub回讀完整候選tree，667個歷史blob SHA全數與基準main相同、20張新PNG／WebP及所有提交blob均對上本機；沒有刪檔或範圍外修改。本收據及本行加入後再次核對最終tree。
- `history-local.json`及`historical-png-unavailable.json`：新667檔鎖中657檔本機實際SHA核對；10個歷史PNG本機無法取得，SHA來自既有SHA-bound來源，提交保留遠端原blob。前85及G091以後索引逐筆相同，正式210身份與1,050槽不變；所有舊鎖與G007舊3D、schema3／4、G024/G030原例外保留。完整實際PNG位元組鎖由最終SHA CI核驗。
- `final-command-results.json`保留每命令實際最終exitCode、log與分類；`validation-summary.json`彙總。所有初輪log仍在，環境阻擋未改成pass。環境設定與限制見`local-environment.json`、`initial-failures.md`。

角色素材not-started、GM not-tested、formalReleaseAllowed=false；原正式第28批繼續，第29～40批未開始。實體iPhone／Android／Safari、真帳號雲端、熱／記憶體長測未做。最終main SHA之Actions由提交後API實查，不能以本機source瀏覽器結果代替發布stage CI。
