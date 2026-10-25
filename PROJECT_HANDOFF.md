# 《文明戰線》目前工程交接

## 2026-10-25 GM 動畫測試中心

GM 三模式改為選擇頁與網頁內最大化預覽，新增連續六動作／自動對戰、統一 1／1.5／2 倍速及 GM 專用聯合可視範圍縮放。正式 Actor、映射、配色／特效、尺寸倍率與戰鬥／存檔 owner 不變。施工基準為包含 PR #101／#102 的 `98ff788b`；實作及驗收方式見 [改版紀錄](docs/GM_ANIMATION_CENTER_20261025.md)，合併／Actions／Pages 狀態以唯一整合 PR 的實際結果為準，不以本機結果宣稱發布。


## 2026-10-25 CI 效率工程更新

PR #101（`integrate/postrelease-optimization-20261025`，第4批／第5批／第6批等整合）已合併，正式 Pages [#500](https://github.com/franksky1207/rpg/actions/runs/40168240929) 成功。以下舊整合待發布描述是歷史交接，已由此更新取代。CI 本次從 fetch 後最新 main `19a60010d3252c34bb15d62d40aaff140244cca4` 施工，分支 `optimize/ci-parallel-efficiency-20261025`；遊戲及存檔契約未修改。

11 個功能分組、完整原命令對照、可靠 gate、快取與量測規則見 [CI 工程紀錄](docs/CI_PARALLEL_EFFICIENCY_20261025.md)。實際 Actions 驗收與合併後 Pages 結果以該分支唯一 PR 的 Checks / Conversation 及最終回報為準，未完成前不可宣稱發布成功。M4 有六個獨立 runner 分片；必要失敗／取消／非預期 skipped 都阻止 gate。正式 Pages 仍由原安全發布 workflow 控管，PR concurrency 不取消 main 部署。


2026-10-25（Asia/Taipei）。正式版本以 GitHub `main` 的實際程式碼為準；尚未發布的優化成果以整合分支為準，不把本機測試宣稱為正式發布。

- 正式 main 基準：`ee1978ea2d9c60cad53a112250b1f5f214fc33ea`。
- 唯一整合分支：`integrate/postrelease-optimization-20261025`；總規劃 [Issue #100](https://github.com/franksky1207/rpg/issues/100)。
- 全面優化第2批：已完成核心穩定與存檔修正；第3批：已完成快取／預載優化。報告與證據保留於 `docs/POSTRELEASE_OPTIMIZATION_BATCH2_2026-10-25.md`、`docs/POSTRELEASE_OPTIMIZATION_BATCH3_2026-10-25.md` 與各自 evidence 目錄。
- 第4批：歷史資料清理，詳見 `docs/POSTRELEASE_OPTIMIZATION_BATCH4_2026-10-25.md`。未開 PR、未合併 main、未執行 Actions、未發布 Pages。第5批玩家／GM 文字與錯誤提示已完成整合分支施工及隔離驗收（Issue #100）；第6批工程／正式文件整理已施工，正式集中 Actions／Pages 發布仍待授權。

## 正式契約與 owner

- `SAVE_SCHEMA_VERSION = 18`，Schema1～17 舊檔遷移保留，Future schema 必須 fail closed。正式 key 為 `frank_text_rpg_save`；本機、JSON、備份與雲端使用現有 normalizer／transaction owner。不得直接操作正式玩家資料。
- `currentWorldPhase()` 的 1／2／3 對應銀河／宇宙／高維；高維狀態由 `thirdWorld` 正式 owner 管理。三紀元等級、玩法、裝備、VIP、轉生 `reincarnation`、突破與異宇宙規則見 README 及實際程式。
- 首輪 `reincarnation.count = 0`；只有 `count > 0` 啟用 rerun。戰鬥結算走現有 transaction owner，不能新增第二套傷害／收益／存檔 pipeline。
- `3d-test/` 是現役正式 renderer 與 GM 模組路徑。保護固定怪物身份／映射、正式外觀、六動作、尺寸、定位與效果。GM sandbox 不得寫入正式存檔。
- `development/hybrid-comparison/` 的現役 B renderer、174項 SHA鎖定資源與 fixture 仍為 GM 沙盒依賴；獨立 A/B/C 比較頁已退役。`scripts/stage-hybrid-preview.cjs` 只補入必要 B 閉包，不發布比較頁。
- `development/equipment-2_5d/` 仍是精確 GM／正式裝備發布來源；保留兩份 publication lock。正式 3D GLB 以 `assets/3d/asset-registry.json` 登記與驗證。
- 背景僅用32張正式 WebP；音訊僅6首音樂及11個音效。來源素材不再要求存在，授權與原始 SHA provenance 保留。
- 第3批快取 snapshot、共用 preload 回報、損壞 SHA 修復與清除後恢復不得取消；既有 preload 範圍不擴張。

## 本機驗收與發布

使用 `node tests/runtime/js-integrity.js`、`node tests/runtime/asset-integrity.js`、`node tests/runtime/docs-integrity.js`、`node tests/runtime/publish-build-regression.cjs` 及 `node scripts/build-publish-dry-run.cjs`，再按變更執行受影響功能測試。GM完整候選需接續 `node scripts/stage-hybrid-preview.cjs`。瀏覽器回歸使用本機4173 server；第2～3批特定fixture設定見各批報告。

正式 Pages 仍由 `.github/workflows/publish-optimized-pages.yml` 在 main 發布；整合分支 push 不匹配任何既有 Actions push 分支。發布前必須另行完成最終集中驗收。本機 Chromium 結果不代表真 iPhone、正式登入／雲端或 Pages 已驗收。

歷史取消規劃與已完成報告已濃縮至 `docs/HISTORICAL_ENGINEERING.md`；不得把歷史施工狀態當成目前待辦。第6批文件封箱以本整合分支為準；完成後尚須正式整合 PR、Actions 與 Pages 發布驗收。
