# 《文明戰線》工程狀態

2026-10-25（Asia/Taipei）。正式 main 基準 `ee1978ea2d9c60cad53a112250b1f5f214fc33ea`；未發布的工作保存在 `integrate/postrelease-optimization-20261025`。完整 owner 與安全契約見 `PROJECT_HANDOFF.md`。

- 全面優化第2～3批已完成並保留驗收文件／證據；第4批歷史資料清理見 `docs/POSTRELEASE_OPTIMIZATION_BATCH4_2026-10-25.md`。
- 第5批玩家／GM 介面文字與錯誤提示已在整合分支修改，隔離測試及回報見 Issue #100；第6批工程整理已施工。尚待使用者另行授權最終整合 PR、集中 Actions、合併 main 與 Pages 發布。
- 不再把舊 3D 升級、210套角色美術量產、已完成的 2.5D／怪物整合或舊 Target Context 工程列為待施工。
- 現役 GM B renderer、裝備來源發布閉包與18個已登記 GLB仍保留；不能依舊路徑名刪除。
- `SAVE_SCHEMA_VERSION = 18`，高維紀元：Lv.1000～2000。Future schema 必須 fail closed；所有存檔變更走既有 transaction owner。首輪 `reincarnation.count = 0`，只有 `count > 0` 啟用 rerun。
- 真 iPhone 切App／鎖屏／長時間GPU、正式登入／雲端與正式 Pages 尚未由本批驗收；不得以本機 Chromium 取代。
