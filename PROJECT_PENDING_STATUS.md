# 《文明戰線》工程狀態

> 2026-10-25 最新已核對 `main`：`238a845aac6a41eb45d9df6e6d81c77d13cead4b`；未來仍須先取最新 HEAD。

## 已完成／封箱

- PR #101：全面優化第4批／第5批／第6批與先前第2～3批整合，合併、必要 Actions、Pages 成功；Issue #100 已結案。
- PR #102：CI 工作分片、瀏覽器快取及嚴格 Gate 完成；不得回退為舊版冗長流程。
- PR #103：GM 玩家／怪物／對戰，最大化預覽、視覺含特效的智慧縮放、六動作與自動對戰循環、1／1.5／2 倍速；合併、必要 Actions、Pages 成功。使用者回報 iPhone Safari 真機測試正常。
- 舊 3D 升級、210套角色美術量產、2.5D／怪物整合等已取消或已完成的計畫不是待施工項目。

## 現役安全契約

- `SAVE_SCHEMA_VERSION = 18`，保留 Schema1～17 舊檔遷移；Future schema 必須 fail closed，任何寫入走既有 transaction owner。
- 高維紀元：Lv.1000～2000；首輪 `reincarnation.count = 0`，只有 `count > 0` 啟用 rerun。不可影響三紀元、異宇宙、Boss 永久削血、收益及正式存檔。
- 現役 GM B renderer、裝備來源發布閉包、18 個已登記 GLB、正式怪物身份與視覺映射都需保留。iPhone 個別功能真機回報不等於所有未測項目自動通過。

## 本次精準維護決策

1. CSS：只移除經核對完全相同、仍保留有效後置版本的重複規則；不清除未證實無用的覆蓋樣式。
2. 版本參數：維持所有正式 `index.html` 資源 URL 不變，避免快取失效、大量重新下載或新舊版本混用。僅保留盤點結論，不為美觀重寫網址。
3. 文件：把曾經記在 `integrate/postrelease-optimization-20261025` 的第4批、第5批、第6批「尚待發布」資訊歸為歷史，現況以本文件與 `PROJECT_HANDOFF.md` 為準。

目前沒有經本次盤點證實的新增正式遊戲缺陷；後續如有修改，仍依受影響模組驗收、嚴格 CI Gate 與 Pages 發布規則辦理。歷史記錄見 `docs/HISTORICAL_ENGINEERING.md`。
