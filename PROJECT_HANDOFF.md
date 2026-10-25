# 《文明戰線》目前工程交接

> 本文件是正式狀態摘要；以即時 GitHub 最新 `main` 為唯一真實來源，不鎖定特定歷史 SHA。完整施工流程見 `DEVELOPMENT_PROTOCOL.md`。

## 最近正式成果

- PR #101：全面優化第 2～6 批整合發布；Issue #100 結案。
- PR #102：Functional／Runtime／Formal CI 分片與必要 Gate 加速。
- PR #103：GM 動畫測試中心三模式、最大化預覽、六動作、自動對戰與 1／1.5／2 倍速。
- PR #107（Issue #106）：突破每級正式收益 +1%，銀河／宇宙統一發放與離線收益 10%，角色介面顯示「轉生收益加成」；已合併並發布。
- 此後改動以最新 main、PR／Issue 的正式結果核對，不能用上述列表推定未來新提交已發布。

## 正式契約與 owner

- `SAVE_SCHEMA_VERSION = 18`；保留 Schema1～17 遷移，Future schema 必須 fail closed；`frank_text_rpg_save` 為正式 key，所有存取與結算走既有 normalizer／transaction owner，禁止 GM sandbox 寫正式角色。
- `currentWorldPhase()`：1／2／3 對應銀河／宇宙／高維；`thirdWorld` 管理高維。首輪 `reincarnation.count = 0`；只有 `count > 0` 才允許轉生重征服 rerun。
- 異宇宙戰鬥、Boss 永久削血、正式結算／背景／離線與 Fast Catch-up 依現役正式 owner，不建立平行傷害、收益或存檔 pipeline。
- 突破收益：適用銀河 EXP、金幣、兩種強化石；宇宙暗能量、暗物質；先與適用專精加成相加，再後乘既有越級倍率。整數資源依正式取整規則；離線最後乘 10% 的獨立收益率；實際公式以 current main 為準。
- `3d-test/` 是現役正式 renderer 與 GM 模組；MonsterActor 外觀、正式映射、六動作、尺寸、定位及效果一致，GM 測試不能污染正式存檔。
- `development/hybrid-comparison/` 現役 GM B renderer 的 174 項 SHA 資源由 `scripts/stage-hybrid-preview.cjs` 保護；`development/equipment-2_5d/` 是現役裝備美術發布來源，`assets/3d/asset-registry.json` 登記正式 GLB。不可將路徑中舊命名誤當退役訊號。
- 正式背景 32 張 WebP、音訊 6 首 OGG 音樂及 11 音效；來源授權與 SHA 保留。資源快取、預載、清除重下及故障復原機制不得因文件清理破壞。

## 維護與驗收

- 程式／UI／測試契約以現役 owner 與完整性檢查為準；通用施工工具、cache-bust、必要 CI、Pages 與完成回報見 `DEVELOPMENT_PROTOCOL.md`。
- 正式發佈由 `.github/workflows/publish-optimized-pages.yml` 保護；本機、工作分支與 PR 的通過不能取代 main 同 SHA 的必要驗收。
- 已取消的 210 套角色量產及舊獨立 A/B/C 比較頁不可復活；GM B renderer、裝備出版來源與現役 2.5D 仍須保留。
