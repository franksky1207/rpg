# 《文明戰線》新版第 2 批・戰鬥生命週期／背景安全施工紀錄（2026-10-17）

## 基準與原則
- 初始正式 main `10c5332f0fd7282047db43eb16451faba8eb6432`，固定 15 項範圍，不追加第 16 項。iPhone 真機留到六批完成後。
- 本批已找到的明確執行缺陷：`backgroundprogress.js` 的單一 `flow.sleeper` 在同一 flow 發生重疊 `backgroundProgressSleep()` 呼叫時，後一 Promise 會覆蓋前一 sleeper，導致前一等待無法再由 timer／stop 正常結束。缺陷為靜態可證及新增隔離動態測試可重現的生命週期風險，**沒有聲稱曾在正式帳號發生**。

## 一、修改內容
- `backgroundprogress.js`：重疊等待依先後序列執行；第一等待完結後再開始下一等待，不以覆蓋舊 sleeper 的方式遺失 Promise。中間若 flow 已停止或替換，不把等待移交新的戰鬥 run。
- `tests/runtime/batch2-background-sleeper-lifecycle.cjs`：隔離執行正式背景模組，驗證等待順序、stop 時取消、切換到另一種 kind 時無懸掛、核心政策完整性及 listener 不重複安裝。
- `.github/workflows/batch2-lifecycle-regression.yml`：使用 Node 24 + Playwright Chromium，在本地 HTTP 測試環境執行語法、背景等待、安全與 Fast Catch-up、事件／異宇宙、資源完整性和第 1 批 12 項固定回歸。
- 正式玩法／傷害／HP／盾／獎勵／離線樣本／Schema 17／音訊／美術均未修改；單一戰鬥原有等待時間與倍率沒有更動。

## 二、15 項固定範圍對照（如實分級）
| 編號 | 項目 | 施工／驗收證據 | 判定 |
|---|---|---|---|
| 1 | 戰鬥生命週期 | 修正重疊背景等待與取消／替換；新增定向回歸 | 部分修正 |
| 2 | 全模式整合 | 第 1 批 12 項已建立代表性回歸，本次重新執行 | 回歸覆蓋，未改所有 owner |
| 3 | 異宇宙流程 | `alternate-universe-combat-integrity` 等既有測試 | 保留原結算，不做無證據重構 |
| 4 | 背景戰鬥 | 主動等待生命週期釋放／重疊修復；跨紀元瀏覽器回歸 | 已修一處確定漏洞 |
| 5 | Fast Catch-up | 原始 credit、checkpoint、UI 節流數值未修改；災厄與特殊怪原回歸 | 契約保護 |
| 6 | 離線收益 | 原離線 owner 未修改；第 1 批離線樣本回歸 | 契約保護 |
| 7 | 頁面生命週期 | `backgroundprogress` visibility/focus/pagehide 原 owner 未改，加入 stop／切 kind 測試 | 部分 |
| 8 | 極簡模式 | 原極簡及音訊政策不動；高維與跨紀元測試 | 回歸保護 |
| 9 | GM 背景與倍速 | 原 GM gate 及 speed 1/1.5/2 不動；無新增設定 | 回歸保護 |
| 10 | Timer／監聽清理 | 隔離同步測試重疊 timer 解決與單次監聽器安裝 | 已修一處 |
| 11 | 戰鬥呈現同步 | 未修改共用 `combatfx.js`／文字 owner，防止第 3 批視覺效能越界 | 無直接更動 |
| 12 | 存檔獎勵保護 | 未改獎勵計算與 Save Schema | 契約保護 |
| 13 | 效能與資源回歸 | 以第 1 批隔離 12 項基線重跑功能；無可比全模式 CPU/Heap 斜率 | 功能回歸，效能部分未量化 |
| 14 | 全模式功能回歸 | 已建測試採樣；正式真帳號／全部合法 mode × 狀態組合無法在 CI 全覆蓋 | 代表性測試 |
| 15 | 發布／封箱 | 本報告、GitHub Actions、PR、同 SHA 證據 | 依最終 Actions 為準 |

**這張表避免把「每一類有一條測試通過」偽稱「15 個正式系統全部完成優化」。** 第 2 批的完整既定目標未必能僅憑一個確診 bug 的修正封箱。

## 三、測試證據及限制
- 第一輪 CI：https://github.com/franksky1207/rpg/actions/runs/39042001121 — failure：新增背景 lifecycle 單測及災厄 Fast Catch-up 通過，後續 `playwright` 模組未安裝，屬測試環境配置問題。
- 第二輪 CI：https://github.com/franksky1207/rpg/actions/runs/39042042328 — success：補 Playwright 與本地 HTTP 測試後通過。
- 第三輪整合 CI：https://github.com/franksky1207/rpg/actions/runs/39042113355 — 加入第 1 批固定 12 項回歸；最終結果須待 Actions 記錄核對，不能預填成功。
- iPhone 真機熱測與動畫端 full trace：仍依既定計畫在六批完成後實施；畫面效能視覺層交由第 3 批。

## 四、封箱條件
- 本文件是**施工與驗收中紀錄**。只有 GitHub 最終整合測試、相關正式 Runtime／GM／發布 Actions 逐 SHA 驗證成功，且 15 項確定必做項目均落地或證實不需改動，才能聲稱「第 2 批封箱」。
- 若存在尚未覆蓋的正式模式／獎勵／計時安全測試，必須保留風險與下一步，不得用文件標題或測試名稱冒稱完成。
