# 現役 GM B renderer 支援資源

獨立 A/B/C 比較頁及製作／調色測量已退役；本目錄仍供 `3d-test/gm-battle-simulation.js` 載入B renderer、fixture adapter及playback。請從GM測試中心進入，不使用已刪除的comparison/index頁。

`manifest.json` 精確保留174項B-only檔案、原始SHA／bytes／vendor及registry。`scripts/stage-hybrid-preview.cjs` 在正式候選通過後補入最小GM閉包，拒絕重新發布比較入口。正式／GM圖像及資產內容未改。

驗證使用 `tests/runtime/hybrid-comparison-playback-contract.cjs`、`hybrid-comparison-renderer-contract.cjs`、`hybrid-comparison-art-contract.cjs` 與正式GM瀏覽器測試。原製作說明與來源見Git歷史 `c0ec18d686d7111b2e5a7fa380c94653a2b8a2e4`。
