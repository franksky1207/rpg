# 《文明戰線》新版第 3 批・16 項固定範圍與驗證矩陣（施工中）

> 唯一來源：GitHub main；本分支 PR #25，尚未合併，不得稱封箱。iPhone 真機熱測留六批後。測試 pass 只能代表該入口覆蓋的具體契約，不能當作全面效能改善證明。

| # | 固定項目 | 本批直接驗證／施工入口 | 當前證據界線 |
|---|---|---|---|
| 01 | 異宇宙全流程 | alternate-universe-batch4-3-regression、alternate-universe-combat-integrity | 原有契約回歸；完整實際 UI trace 待補 |
| 02 | 同步 Layout | batch1-animation-frame-trace、combatfx offsetWidth 盤點 | 尚未有可歸因的改前後完整數據，不盲改動畫重啟 |
| 03 | HP／盾 | combatfx MutationObserver 微任務去重、combat-events-integration | 僅呈現層去重；不得更改 HP 數值或序列 |
| 04 | MutationObserver | HP observer Set 改為常駐，單輪 microtask 去重 | 需追蹤長場景 mutation 負載 |
| 05 | 浮字 | combatfx 延遲 timer 取消、batch3-fx-timer-lifecycle | 具體缺陷有 Chromium 回歸 |
| 06 | CSS 動畫合成 | batch1-animation-frame-trace | 目前不得聲稱 compositor 已優化 |
| 07 | Timer／RAF／監聽 | 清浮字計時、舊 presentation token 收尾防護 | RAF 漏出及其他動畫計時器仍需全路徑評估 |
| 08 | DOM／記憶體 | 50 次清理測試、renderer contract | 無長時間 Heap 斜率，需補測 |
| 09 | 戰鬥時鐘 | 不更動 STRUCTURED_COMBAT_PACING、combat-events-owner-browser | 保留正式 owner；測試只驗相關契約 |
| 10 | 共用呈現器 | combat-events-integration、renderer contract | 不能由隔離測試推論全模式相等 |
| 11 | 可量測效能 | batch1-animation-frame-trace 輸出 JSON | 短樣本為 common presenter，不是完整異宇宙真流程 |
| 12 | 正式回歸封箱 | Batch1 fixed12、Batch2 final13、正式戰鬥、GM、Pages | 最終 main 同 SHA Actions 尚未完成 |
| 13 | 音效成本 | audio-lifecycle-browser、audio-settings-persistence-integrity | 行為契約，無音訊 CPU/GPU trace |
| 14 | 2.5D Renderer | hybrid-comparison-renderer-contract、t3b-formal-renderer | 不擅自改正式 sprite/模型 |
| 15 | 場景資源 | loading-resource-policy、resource-manifest、html-cache-version-guard | 快取版本已同步；需核對發布 CI |
| 16 | 特殊呈現器 | mirror animate finalizer token 保護、combat-events-integration | 特殊模式的真畫面時序尚待驗證 |

## 修改內容
1. `combatfx.js`：取消跨戰鬥延遲浮字，無 owner 時也釋放，舊動畫不能清掉新戰鬥；HP observer 去除每批新建 Set 與同微任務內重複排隊。
2. `index.html`：正式 combatfx 快取鍵對齊。
3. `tests/runtime/batch3-fx-timer-lifecycle.cjs`、`scripts/batch3-integrated-evidence.cjs` 及 Actions：建立可重複 Chromium 和 16 類代表性檢查（不是 16 項全部完工的宣告）。

## 自我檢查／正式驗收
請以對應 SHA 的 Actions 最新結果判定，禁止以舊 SHA 通過證據覆寫新 SHA。任何定向失敗先查 job logs，排除配置與真實回歸失敗。

## 剩餘門檻
- 在同等條件下對正式普通主線 vs 異宇宙實際 UI 入口建立獨立 trace，並量化 FPS 間隔、layout、Long Tasks、長時間記憶體變化；目前不可宣稱 iPhone 發熱改善。
- 正式戰鬥與 GM 全綠、Runtime、各資源／發布 Actions、PR 合併後最新 main SHA Pages 成功，才可最終封箱。
- 若缺少正式 UI trace 或比較證據，只能視為階段性修復而不是全 16 項完成。
