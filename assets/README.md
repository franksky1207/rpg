# 《文明戰線》素材管理規範

`backgrounds/`：正式部署素材，固定32張WebP／16組desktop.webp與mobile.webp配對。`backgrounds.css` 是引用owner，`backgroundpreload.js` 沿用原預載規則。

`backgrounds-source/` 原始PNG已於全面優化第4批退役，來源可從Git歷史恢復，不要求目前樹保留。正式HTML／JS／MJS／CSS及Manifest不得引用退役來源。

`tests/runtime/asset-integrity.js` 驗證32張WebP、配對、完整CSS引用及Manifest SHA，不再用來源容量比例作安全門檻。此清理不修改正式圖像位元組。

`assets/3d/asset-registry.json` 與登記GLB仍有正式／GM用途，維持現有SHA、依賴與license檢查；不得整包刪除。授權與來源provenance保留，歷史來源路徑不代表目前樹必須包含原製作檔。
