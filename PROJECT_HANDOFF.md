# 《文明戰線》目前工程交接

> 更新基準：2026-10-25；以即時 GitHub `main` 為唯一真實來源。上一已核對 HEAD：`238a845aac6a41eb45d9df6e6d81c77d13cead4b`（#103 合併後的資源 Manifest 自動提交）；不得把此 SHA 當成未來固定 HEAD。

## 正式成果（均已合併並發布）

- **PR #101**：全面優化第2～6批；存檔安全、資源／快取、退役檔案清理與介面整理；Issue #100 已結案。
- **PR #102**：Functional／Runtime／Formal CI 平行化與嚴格彙總 Gate，保留全部必要驗收；正式 Pages 依舊由 main 安全發布。
- **PR #103**：GM 玩家／怪物／對戰三模式的選擇頁與網頁內最大化預覽、連續六動作／自動對戰、1／1.5／2 倍速、包含靜態特效的聯合可視範圍縮放；未更動正式存檔或戰鬥 owner。
- 上述 PR 的 Actions／Pages 結果與 SHA 以各 PR 的正式驗收紀錄為準。使用者已回報 #103 iPhone Safari 真機測試正常，不把此回報擴張成所有裝置的保證。

## 正式契約與 owner

- `SAVE_SCHEMA_VERSION = 18`，Schema1～17 舊檔遷移保留，Future schema 必須 fail closed。正式 key 為 `frank_text_rpg_save`；本機、JSON、備份與雲端使用現有 normalizer／transaction owner。不得直接操作正式玩家資料。
- `currentWorldPhase()` 的 1／2／3 對應銀河／宇宙／高維；高維狀態由 `thirdWorld` 正式 owner 管理。三紀元等級、玩法、裝備、VIP、轉生 `reincarnation`、突破與異宇宙規則見 README 及實際程式。
- 首輪 `reincarnation.count = 0`；只有 `count > 0` 啟用 rerun。戰鬥結算走現有 transaction owner，不能新增第二套傷害／收益／存檔 pipeline。
- `3d-test/` 是現役正式 renderer 與 GM 模組路徑。保護固定怪物身份／映射、正式外觀、六動作、尺寸、定位與效果。GM sandbox 不得寫入正式存檔。
- `development/hybrid-comparison/` 的現役 B renderer、174項 SHA鎖定資源與 fixture 仍為 GM 沙盒依賴；獨立 A/B/C 比較頁已退役。`scripts/stage-hybrid-preview.cjs` 只補入必要 B 閉包，不發布比較頁。
- `development/equipment-2_5d/` 仍是精確 GM／正式裝備發布來源；保留兩份 publication lock。正式 3D GLB 以 `assets/3d/asset-registry.json` 登記與驗證。
- 背景僅用32張正式 WebP；音訊僅6首音樂及11個音效。來源素材不再要求存在，授權與原始 SHA provenance 保留。
- 第3批快取 snapshot、共用 preload 回報、損壞 SHA 修復與清除後恢復不得取消；既有 preload 範圍不擴張。

## 開發、驗收與發布守則

- 優先保留第2～3批資源快取、快照、清除／重新下載與預載機制，不以盲目 lazy loading 追求數字改善。
- 本機預檢：`node tests/runtime/js-integrity.js`、`node tests/runtime/asset-integrity.js`、`node tests/runtime/docs-integrity.js`、`node tests/runtime/publish-build-regression.cjs`、`node scripts/build-publish-dry-run.cjs`，再依受影響模組補測；正式 CI Gate／Pages 不能以本機綠燈取代。
- GM 完整候選需保留 `scripts/stage-hybrid-preview.cjs` 的現役 B 閉包。不得把現役 `3d-test/`、正式映射、`assets/3d/` 或 `development/equipment-2_5d/` 當作退役垃圾。
- `.github/workflows/publish-optimized-pages.yml` 仍須由 main 安全發布；正式驗收全部成功才能合併，合併後必須檢查 Pages 部署。

## 2026-10-25 維護盤點：CSS／版本參數／文件

- CSS：僅刪除 `3d-test/test-center.css` 中早期手機 media block 的一條**完全重複**規則；保留稍後相同條件與相同宣告的現役規則，不調整顯示優先序或設計。
- 版本網址：`index.html` 的累積 `?v=...&v2=...` 等參數雖長，仍可能涉及 HTML 版本守衛、Service Worker、智慧快取與 fingerprint；**未證實可等效替換，因此本次完全不改 URL、Manifest、下載規則及快取 key**。
- 交接文件以本節正式狀態為準；歷史批次描述與施工前狀態請看 `docs/HISTORICAL_ENGINEERING.md` 及各批原始報告。不得將歷史整合分支 `integrate/postrelease-optimization-20261025` 的舊「未發布」文字當成新待辦。
