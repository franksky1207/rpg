# 《文明戰線》新版第 1 批：戰鬥／背景／異宇宙唯讀稽核紀錄（2026-10-17）

> 狀態：**靜態程式與 Git tree 初步稽核已完成；動態效能基線、各模式完整呼叫圖及 iPhone 真機驗收尚未完成。本文件為證據明列的階段紀錄，不代表第 1 批全面封箱。**
>
> 稽核基準 main SHA：`628113af736c8ed4b41377c178413bf578f0b7b9`。新版第 1 批不修改 Runtime、正式玩法、存檔、動畫資源或既有測試。範圍僅限戰鬥及直接影響戰鬥的跨系統依賴，不擴大成全遊戲重構。

## 一、修改內容
- 本批僅新增這份唯讀稽核文件；沒有改動 `*.js`、資產、存檔、測試及 workflow。
- Git tree API 對基準 SHA 回報完整樹 1,253 項（`truncated=false`）。
- 依正式文件與主要程式 owner 建立初步路徑：
  - 正式戰鬥：`combatcore.js`、`combat-events.js`、`combatfx.js`、`combatpacing.js`、`battlepipeline.js`。
  - 異宇宙：`alternateuniversecombat.js` 中 `runAlternateUniverseCombat` 呼叫 `window.runWorldCombatCore`，以 `visualContext.mode="alternate"` 提供呈現上下文；`settleAlternateUniverseCombat` 另檢查 `attemptId`、`depth`、`combatCompleted`、`formalSettlementEligible`，再由異宇宙 owner 結算。**不可把異宇宙當成獨立戰鬥引擎或直接抽掉其結算 owner。**
  - 主線連戰：`battlepipeline.js` 的 `runBattles`，由 `mainFastCatchUp`、`mainCatchUpStep`、`consumeMainCatchUpDelay` 和 `save(false)` 控制補算與節流。
  - 背景：`backgroundprogress.js` 提供 `createContinuousRunInfrastructure`、`backgroundProgressStart/Stop`、`backgroundProgressFastCatchUpActive`；`combatpacing.js` 的主線 sleep 在 active 時轉交 background owner；`gmbackground.js` 是 GM gate。
  - 離線：`offlineprogress.js`、`offlinestatecore.js`、`offlinefarmtarget.js`，離線結算有 `offlineSettlementBusy` 及失敗回滾。離線收益不是背景戰鬥的另一份即時獎勵。
  - GM 動畫：`3d-test/gm-battle-simulation.js` 仍提供 G005、G007、G018 自由套裝選項和 G007 五槽測試。
- 此呼叫圖為**局部靜態路徑**；三紀元其他正式副本、全生命周期各入口與所有引用尚待完整逐函式交叉比對，不能聲稱完全覆蓋。

## 二、靜態發現與優先度
| 優先 | 證據 | 判讀 | 後續 |
|---|---|---|---|
| P0 | 使用者真機描述：異宇宙進入動畫播放後卡頓、發熱；沒有 CPU/GPU trace | **症狀已回報，根因尚未確診** | 新版第 3 批測量長任務、FPS、DOM、GPU/CPU；第 2 批先比對共用生命週期 |
| P1 | `combatfx.js` 中 `restartFxClass`、`directPulse` 使用 `void element.offsetWidth` | 存在強制同步 layout 的潛在成本；是否導致異宇宙熱點尚未確認 | 第 3 批量測後調整，不先刪事件／HP |
| P1 | `combatfx.js` 綁定動畫監聽、MutationObserver；`backgroundprogress.js` 綁定 visibility/focus/pagehide | 須核對多次進出、重播與切換時的監聽、Timer、DOM 清理，現階段**無重複執行確診證據** | 第 2 批生命週期及第 3 批繪製效能 |
| P1 | `backgroundprogress.js` 有 UI 5/10/25/50 場、checkpoint 50/100/200 場節流，並有每 100 場呈現策略 | 已存在優化設計，切勿誤刪；需測不同 owner 與隱藏切換順序 | 第 2 批 |
| P1 | `offlineprogress.js` 有 `offlineSettlementBusy`、rollback、時間回撥護欄；`offlinefarmtarget.js` 有 checkpoint timer 及 pagehide/beforeunload/pageshow | 跨事件儲存順序與雙重結算屬回歸風險，尚無異常確診 | 第 2 批 |
| P2 | `3d-test/gm-battle-simulation.js` 的三套自由造型選單仍存在 | G005/G007/G018 並未全面從 GM 測試概念移除 | 第 4 批整理 GM |
| P2 | 原先概念／源圖另存 `development/equipment-2_5d/` | 不是未來三紀元新造型的必要前提；**不可僅因檔名刪除** | 第 1 批保留待驗，第 4/5 批按引用證據處理 |

## 三、G005／G007／G018 Git tree 盤點
在 `assets/gm-equipment-2_5d/v1/` 每套仍有 `<id>.webp`、`<id>-attack-body.webp`、`<id>-weapon.webp`，共 9 件。
在 `development/equipment-2_5d/v1/characters/<id>/v1/` 各有 `character.webp`、`review.md`。
在 `development/equipment-2_5d/v1/sources/`，G005 有 `generated.png` 與 `initial-generated.png`；G007/G018 各有 `generated.png`。
在 `development/equipment-2_5d/weapons-v1/<id>/` 各有 `attack-body.webp`、`weapon.webp`、`separation-source.png`、`review.md`。
三套以上列出的**檔案總數為 30 件**（不含資料夾及可能在其他命名下的關聯檔）。
現階段已確認 GM 模擬選單有直接名稱引用，但**沒有逐一完成資產 runtime 載入與發布依賴交叉檢查**，所以沒有提出刪檔清單，不動任何檔案。

## 四、效能量測基線：已知與缺口
| 指標 | 現階段 |
|---|---|
| 普通／異宇宙戰鬥事件量、攻擊與傷害序列比較 | 尚無執行追蹤 |
| iPhone 每秒畫面、長任務、CPU/GPU、溫度／發熱 | 尚無真機 trace |
| 動畫 DOM 節點數、浮字最大同時數、layout / paint 次數 | 尚無動態量測 |
| 戰鬥離開後監聽器、timer、記憶體回收 | 尚無動態量測 |
| 背景→前景→離線→Fast Catch-up 反覆切換 | 尚無端到端執行證據 |
| 原碼靜態跡證 | 已取得上述 owner、節流與視覺熱點候選 |

**第 2 批進場條件：** 對異宇宙與代表性主線建立事件／生命週期對照、斷言同一攻擊/傷害/HP/獎勵不變；補背景、GM 倍速、極簡、跨紀元與雙重結算場景。
**第 3 批進場條件：** 先以可重複的普通／異宇宙場景量測 DOM 更新、樣式／layout、動畫取消和資源釋放；沒有 iPhone trace 時不得宣稱真機問題解決。
**第 4 批：** GM 舊測試資源應採直接引用／載入證據分級，不盲刪。
**第 5 批：** 三紀元各一套外觀僅建立技術契約，不製圖。

## 五、自我檢查
- 本報告將已確認原碼現象、風險推測與尚未量測的項目分開，沒有把風險寫成確診。
- 保護正式玩法、三紀元、210 套正式裝備 ID／1,050 槽、戰鬥 owner、HP、獎勵、Schema 17、音效、GM、背景與文字安全回退。
- 本次沒有修改正式 Runtime、測試、工作流程、資產，也沒有刪除 G005/G007/G018。

## 六、GitHub Actions 基線與封箱狀態
以下是稽核基準 SHA `628113af...` 已核對的工作流程：
- Runtime Integrity: success — https://github.com/franksky1207/rpg/actions/runs/39037324921
- Equipment 2.5D Formal Battle: success — https://github.com/franksky1207/rpg/actions/runs/39037324928
- Equipment 2.5D GM Integration: success — https://github.com/franksky1207/rpg/actions/runs/39037324897
- Batch 2-4 Integration and Regression: success — https://github.com/franksky1207/rpg/actions/runs/39037325059
- Hybrid Comparison T2-A: **failure**（Validate isolated fixture, references and comparison contracts）— https://github.com/franksky1207/rpg/actions/runs/39037324944
- Hybrid Comparison T2-B1: **failure**（Verify unchanged source fixtures and browser modules）— https://github.com/franksky1207/rpg/actions/runs/39037324940
- Publish Optimized GitHub Pages: 最近一次查核仍為 **in_progress** — https://github.com/franksky1207/rpg/actions/runs/39037324900

這些失敗／進行中是既有基準 SHA 的事實，不是本批新增的 Runtime 缺陷證據，也不應冒稱全綠。此報告提交會形成**新 SHA**；報告 SHA 不等於上述已驗收的程式 SHA。

## 七、結論與未完成事項
- **已完成：** 主路徑靜態盤點、異宇宙核心與獨立結算契約確認、背景／離線重要 owner 與節流機制定位、3 套舊素材 30 個具名檔案 Git tree 盤點、現有 Actions 基線。
- **尚未完成：** 全模式逐函式完整架構圖、完整跨模態回歸矩陣、定量效能基線、所有舊素材 runtime/發布引用掃描、真機／桌機壓測、Actions 全綠。
- 因此**新版第 1 批不可宣稱完全封箱，也不可無條件啟動第 2 批**；報告後續必須根據實證補齊。
