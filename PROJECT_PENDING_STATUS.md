# 《文明戰線》工程狀態

> 僅記錄當前已知狀態；下次施工須讀取即時 main 與開放 Issue，不能把本文 SHA 或歷史批次當成最新真實來源。

## 最近完成

- PR #101：全面優化第 2～6 批正式整合；Issue #100 結案。
- PR #102：必要 CI 並行與嚴格 Gate。
- PR #103：GM 動畫中心改版及已回報的 iPhone Safari 功能實測。
- PR #107：Issue #106 收益與角色介面完成，含突破收益加成、離線 10% 及角色顯示。
- 舊 3D 全面升級、210 套角色量產與早期怪物整合批次已取消或完成，不再當待辦。

## 現役安全契約

- `SAVE_SCHEMA_VERSION = 18`；舊存檔正規化／遷移、Future schema 必須 fail closed；所有寫入使用正式 transaction owner。
- 高維紀元：Lv.1000～2000；首輪 `reincarnation.count = 0`，只有 `count > 0` 啟用 rerun。異宇宙、Boss 永久削血、獎勵及存檔 owner 不可因文件整理更動。
- 現役 GM B renderer、174 項 SHA 資源、裝備來源、正式 GLB／怪物映射及發佈鎖定保留。

## 後續方向

- 實際待辦以最新 main、尚未結案 Issue 與使用者新指示為準；過去曾列為未發布的整合分支與已完成報告都不是現役待辦。
- 文件瘦身仍在 `chore/docs-governance-cleanup-20261025` 工作分支，第 4 批必要驗收／PR／合併完成以前，不能說 main 已包含這批文件清理。
- 各類風險分級驗收、Codex 額度節約及必要 Pages Gate 以 `DEVELOPMENT_PROTOCOL.md` 為準。
