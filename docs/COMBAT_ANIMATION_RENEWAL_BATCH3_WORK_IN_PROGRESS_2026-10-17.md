# 新版第 3 批施工紀錄（進行中，未封箱）

- 基準 `main`: `1db8b9b2db656e7aedec78041af01eca506382d6`
- 施工分支：`feat/combat-animation-batch3-20261017`
- 本批固定 16 項：01 異宇宙完整流程、02 強制 Layout、03 HP/盾、04 MutationObserver、05 浮字、06 CSS 合成、07 Timer/RAF/監聽、08 DOM/記憶體、09 戰鬥時鐘、10 共用呈現器、11 效能量測、12 正式回歸與封箱、13 音效、14 2.5D renderer、15 場景資源、16 特殊呈現器。

## 已實際修改
- `combatfx.js`：新增延遲浮字 timer 登錄，切換/清除 combat presentation 時取消尚未執行的浮字並移除殘留浮字節點；callback 亦檢查所屬 presentation token，避免舊戰鬥視覺污染新戰鬥。未改攻擊計算、獎勵、HP、盾、時間常數、存檔。
- `tests/runtime/batch3-fx-timer-lifecycle.cjs`：50 次替換/清理，驗證延遲浮字不跨戰鬥，正常浮字仍可出現，清理後節點為零。
- `.github/workflows/batch3-fx-lifecycle.yml`：在分支觸發 Chromium 定向回歸。

## 尚未完成（不得宣稱通過）
- 第 3 批剩餘 15 個面向的正式 UI 與異宇宙同事件追蹤、layout/LongTask/Heap 前後量測、音效/Sprite/資源負荷、三紀元與全副本壓力、既有完整 regression、正式 PR 合併後同 SHA 必要 Actions/Pages。前述項目未有可驗證證據前不可標示 pass。
- iPhone 真機熱測仍延至六批結束後。

## 封箱門檻
- 定向 CI + 第 1 批固定 12、第 2 批 13 類相關保護、正式戰鬥/GM/資源/Pages 驗收；結果要綁定實際 commit SHA。
- 尚未封箱，未修改 `main`。
