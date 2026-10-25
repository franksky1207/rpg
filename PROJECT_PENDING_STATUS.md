# 《文明戰線》工程狀態

## 2026-10-25 GM 動畫測試中心

GM 三模式改為選擇頁與網頁內最大化預覽，新增連續六動作／自動對戰、統一 1／1.5／2 倍速及 GM 專用聯合可視範圍縮放。正式 Actor、映射、配色／特效、尺寸倍率與戰鬥／存檔 owner 不變。施工基準為包含 PR #101／#102 的 `98ff788b`；實作及驗收方式見 [改版紀錄](docs/GM_ANIMATION_CENTER_20261025.md)，合併／Actions／Pages 狀態以唯一整合 PR 的實際結果為準，不以本機結果宣稱發布。


## 2026-10-25 CI 效率工程更新

PR #101（`integrate/postrelease-optimization-20261025`，第4批／第5批／第6批等整合）已合併，正式 Pages [#500](https://github.com/franksky1207/rpg/actions/runs/40168240929) 成功。以下舊整合待發布描述是歷史交接，已由此更新取代。CI 本次從 fetch 後最新 main `19a60010d3252c34bb15d62d40aaff140244cca4` 施工，分支 `optimize/ci-parallel-efficiency-20261025`；遊戲及存檔契約未修改。

11 個功能分組、完整原命令對照、可靠 gate、快取與量測規則見 [CI 工程紀錄](docs/CI_PARALLEL_EFFICIENCY_20261025.md)。實際 Actions 驗收與合併後 Pages 結果以該分支唯一 PR 的 Checks / Conversation 及最終回報為準，未完成前不可宣稱發布成功。M4 有六個獨立 runner 分片；必要失敗／取消／非預期 skipped 都阻止 gate。正式 Pages 仍由原安全發布 workflow 控管，PR concurrency 不取消 main 部署。


2026-10-25（Asia/Taipei）。正式 main 基準 `ee1978ea2d9c60cad53a112250b1f5f214fc33ea`；未發布的工作保存在 `integrate/postrelease-optimization-20261025`。完整 owner 與安全契約見 `PROJECT_HANDOFF.md`。

- 全面優化第2～3批已完成並保留驗收文件／證據；第4批歷史資料清理見 `docs/POSTRELEASE_OPTIMIZATION_BATCH4_2026-10-25.md`。
- 第5批玩家／GM 介面文字與錯誤提示已在整合分支修改，隔離測試及回報見 Issue #100；第6批工程整理已施工。尚待使用者另行授權最終整合 PR、集中 Actions、合併 main 與 Pages 發布。
- 不再把舊 3D 升級、210套角色美術量產、已完成的 2.5D／怪物整合或舊 Target Context 工程列為待施工。
- 現役 GM B renderer、裝備來源發布閉包與18個已登記 GLB仍保留；不能依舊路徑名刪除。
- `SAVE_SCHEMA_VERSION = 18`，高維紀元：Lv.1000～2000。Future schema 必須 fail closed；所有存檔變更走既有 transaction owner。首輪 `reincarnation.count = 0`，只有 `count > 0` 啟用 rerun。
- 真 iPhone 切App／鎖屏／長時間GPU、正式登入／雲端與正式 Pages 尚未由本批驗收；不得以本機 Chromium 取代。
