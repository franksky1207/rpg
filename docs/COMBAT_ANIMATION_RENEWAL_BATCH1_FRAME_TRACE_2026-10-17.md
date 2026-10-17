# 《文明戰線》新版第 1 批・共用戰鬥動畫幀／版面基線（2026-10-17）

## 一、修改內容
- 基準正式 main：`7d77e7930c226463bbc6ea9801a4c2d7b866b20a`。
- 新增 `tests/runtime/batch1-animation-frame-trace.cjs`：在 GitHub runner Playwright Chromium 載入**正式原始 `combatfx.js`**，用隔離 DOM/HUD、390×844 視窗、相同 12 個合成 attack 事件，呼叫 `prepareCombatPresentation` 與 `animateStructuredCombatPresentation`；每 sleep 注入一致 24ms，收集實際 `requestAnimationFrame` 間隔、PerformanceObserver Long Task、MutationObserver 變動記錄、Chromium DevTools trace 中 Layout/UpdateLayoutTree/Style 等完成事件數和耗時。
- 新增手動 GitHub Action `.github/workflows/batch1-animation-frame-trace.yml`；不增加平常 main push 的耗時，沒有更動正式 Runtime、正式事件、音樂、數值、資產和正式遊戲畫面。
- 三個標籤只表示相同的**共用呈現器隔離場景**：`main-common-presentation`、`alternate-common-presentation`、`main-common-presentation-repeat`，**它們沒有執行正式異宇宙 UI/attempt/結算 owner，不能假稱異宇宙整條生命週期同樣快**。

## 二、自我檢查與實際結果
- 測試分支 SHA `412699c38aec8c2f880d2cd39a1b5decfecface3`：[Actions #39041058229](https://github.com/franksky1207/rpg/actions/runs/39041058229) **success**；[trace JSON artifact #12103798579](https://github.com/franksky1207/rpg/actions/runs/39041058229/artifacts/12103798579)。
- 實際 log：

| 場景 | RAF 間隔樣本 | 幀間隔 p95 | CDP Layout 次數 | CDP UpdateLayoutTree 次數 | Long Task 次數 |
|---|---:|---:|---:|---:|---:|
| main-common-presentation | 86 | 16.70 ms | 31 | 108 | 0 |
| alternate-common-presentation | 86 | 16.80 ms | 31 | 109 | 0 |
| main-common-presentation-repeat | 85 | 16.80 ms | 31 | 110 | 0 |

- 測試強制要求三個場景事件皆為 12 個、至少 16 筆 RAF 樣本、trace 內確實有 Layout 或 UpdateLayoutTree 事件、動畫正式清理後 active=false 且 FX floater 0 個。結果通過。
- Frame interval p95 約 16.7～16.8ms 是**這個 CI 隔離環境中的 RAF 採樣結果**，不是官方 FPS，亦不代表 iPhone 或完整正式異宇宙的表現。
- Trace 資料另含各類完成事件耗時統計、MutationObserver 紀錄、總執行時間，詳見 artifact JSON；Long Task=0 只表示受測短樣本未觀察到大於規範門檻的 Performance Long Task，不能推論完全沒有卡頓。

## 三、實機／Actions 驗收
- GitHub Actions 已實際完成隔離 Chromium 動態測量。沒有真實 iPhone，也沒有修改正式存檔、登入、獎勵。
- **下一階段必要工作：** 把此追蹤器延伸至正式普通主線與異宇宙的完整 UI 進出流程，使用同一批可重播的事件，分辨共用動畫成本與 UI/attempt/audio/settlement 的額外成本；並擴增長時間／高密度、不同模式、記憶體成長曲線。這些尚未量化，不可混寫成已完成。

## 四、提交與封箱
- 本次屬新版第 1 批的**幀時間／版面／長任務量測基線初版**，不是整個第 1 批全面封箱。
- 原先 18 項跨模式 CI 回歸已獨立在 [run #39040519589](https://github.com/franksky1207/rpg/actions/runs/39040519589) 成功；兩份資料必須分別解讀。
- iPhone 真機驗收按使用者決定留在六批完成後，非本批封箱前置條件。
