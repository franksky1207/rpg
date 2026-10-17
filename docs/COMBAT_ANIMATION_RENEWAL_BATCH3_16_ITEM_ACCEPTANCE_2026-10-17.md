# 《文明戰線》新版第 3 批・動畫與異宇宙效能整合驗收報告（PR 階段）

日期：2026-10-17（臺灣時間）。本報告固定 16 項，不另拆零碎小批。以 `main` 基準 `1db8b9b2db656e7aedec78041af01eca506382d6` 及 [PR #25](https://github.com/franksky1207/rpg/pull/25) 真實差異為準。

**嚴格定義：**本批可封閉「已可重現的動畫生命週期錯誤、渲染排程低風險優化及自動化效能基線／契約測試」；不能宣稱已證明異宇宙 iPhone 發燙完全解除、所有戰鬥全路徑於真機完成壓力測試，或 GPU 有確定降幅。手機真機實測依六批總計畫留至第 6 批完成後。

## 一、修改內容

1. `combatfx.js`：延遲浮字計時器集合管理、結束／切換戰鬥即取消、DOM 節點清除；無 active owner 也會釋放；浮字 timer callback 使用戰鬥 token 阻止舊戰鬥污染新畫面。
2. `combatfx.js`：一般結構化及鏡像戰動畫收尾 `clearAfter`，驗證 token 仍為本戰鬥才清除，避免舊非同步播放刪除新戰鬥。
3. `combatfx.js`：HP observer 的識別 ID Set 移出 callback，重複 mutation microtask 合併為一次；盡量監聽持續存在的 `#main`，不用監控整個 body。攻擊／HP／護盾的 owner 資料及 DOM 值未變更。
4. `index.html`：`combatfx.js` 網頁快取版本鍵更新。
5. 新增 `tests/runtime/batch3-fx-timer-lifecycle.cjs`、`batch3-presenter-pressure.cjs`、`batch3-alternate-controller-trace.cjs`，及 `scripts/batch3-integrated-evidence.cjs`、`scripts/batch3-compare-frame-trace.cjs`；配套新建兩條 Batch3 GitHub Actions。沒有修改戰鬥計算、獎勵、三紀元資料、Save Schema v17、背景戰鬥／Fast Catch-up 規則或 2.5D 美術資產。

## 二、16 項逐項檢查與證據

| 項次 | 項目 | 實際檢查結果、邊界 |
|---|---|---|
| 01 | 異宇宙完整流程 | `alternateuniverseui.js` 以主畫面 `innerHTML` 在進入／退場兩次切換；正式異宇宙挑戰 owner 契約測試通過；真 UI controller+DOM 有 matched-event Chromium trace（owner 計算為 stub，不能稱真機端對端） |
| 02 | 同步 Layout | 實際找到 `restartFxClass/directPulse` 的 `offsetWidth` 強制 animation restart；未有等價無風險替代證據，暫保留避免破壞擊中動作；baseline/current 同樣隔離 trace 記錄重排次數 |
| 03 | HP／護盾 | observer microtask 合併、不改傷害／護盾數值；正式戰鬥、事件 owner、原 Batch1/2 回歸保護 |
| 04 | MutationObserver | 識別 Set 移出熱路徑、同批 mutation 合併、監看 root 從 body 縮至 `#main` |
| 05 | 傷害與浮字 | timer 清除與 token 綁定；50 次 + 100 次替換與 50 次出入測試 |
| 06 | CSS 合成 | 保持原動作樣式及既定效果；檢查同事件 trace 的 Layout／UpdateLayoutTree；沒有虛構 GPU 改善 |
| 07 | Timer／RAF／監聽 | 取消延遲浮字與 stale finalizer；演出／音訊 lifecycle、combat-event owner regression 通過 |
| 08 | DOM／記憶體 | 100-event 壓力、100 場替換、50 次退出後 stale FX DOM=0；長期 Heap 斜率未於此 isolated 測試證明 |
| 09 | 1×及 GM 變速／時鐘 | 不改 `STRUCTURED_COMBAT_PACING_1X` 或結算時鐘，既有 owner／Batch2 背景與時鐘回歸通過 |
| 10 | 全模式共用呈現器 | 一般與異宇宙使用同一 `animateStructuredCombatPresentation`；鏡像獨立 presenter 也套 token 收尾保護 |
| 11 | 前後量測與壓力 | 同樣 headless 390×844、24ms synthetic events，執行舊 main vs 本分支 CDP；另增加異宇宙實際 controller+HTML、同事件 vs main trace |
| 12 | 綜合測試／封箱 | 18 組整合檢查（另比對前後 trace）；保留原 Batch1 12 項、Batch2 13 類，一致 SHA GitHub Actions，合併後 main／Pages 另行驗收 |
| 13 | 音效效能 | `audio-lifecycle-browser`、音效設定／播放生命週期測試通過；無相符故障證據，不改正式音效觸發或音量 |
| 14 | 2.5D 角色／Renderer | Hybrid Renderer、Playback、正式 Renderer 契約測試通過；不擅動 GM 的 B Renderer/fixture、Sprite |
| 15 | 場景與資源 | resource manifest、loading policy、HTML version guard self-test 與正式快取鍵；不復活已清理舊素材 |
| 16 | 特殊呈現器 | Mirror presenter 收尾 token guard、鏡像／combat-events 專用回歸；保護虛空等的現有 owner |

## 三、自我檢查與已確認的 Actions

在施工 SHA `0341466d2150ea1e67d3ab537607574c2e105a26`，四條相關 Actions 均 `success`：

- [Batch3 Integrated #39047483937](https://github.com/franksky1207/rpg/actions/runs/39047483937)：整合內逐項 pass（浮字、100+100+50 壓力、異宇宙 controller、12-event 共用 trace、異宇宙 owner、Mirror、Audio、Renderer、資源、Batch1 fixed12、Batch2 final13），以及前後 trace 成功。
- [Batch3 FX lifecycle #39047483921](https://github.com/franksky1207/rpg/actions/runs/39047483921)：pass。
- [Equipment 2.5D GM #39047489643](https://github.com/franksky1207/rpg/actions/runs/39047489643)：pass。
- [Equipment 2.5D Formal Battle #39047489710](https://github.com/franksky1207/rpg/actions/runs/39047489710)：pass。

前後 isolated common presenter trace 皆約 p95 16.7～16.8ms、每段 Layout=31、取樣 Long Task=0；這代表**未觀察到隔離樣本顯著回歸，也沒有證明 p95 改善**，不應宣稱解除 iPhone 發熱。異宇宙真 controller trace 的戰鬥 owner 為注入的可控事件，與真機／完整真實戰鬥必須明確區分。

## 四、提交與封箱邊界

- 所有實質程式修改與上述單一批次測試均在 PR #25；待這份文件 commit 的分支最新 SHA 綠燈後，再合併 main 並核對正式 Pages。
- 第 4 批才處理命名、手機布局／GM 動畫測試中心體驗；第 5 批只做三紀元造型技術契約；第 6 批做全模式整合。真機 iPhone 卡頓、發燙測試依正式規劃保留在六批之後。
- 本文可作為「第 3 批程式碼與 CI 驗收」證據；不應當成「異宇宙 iPhone 效能問題已完全解決」的保證。
