# 《文明戰線》極簡模式正式架構

更新日期：2026-09-24

## 定位

極簡模式是連續戰鬥／連續討伐共用的顯示模式，只簡化畫面，不建立第二套戰鬥流程，也不自行取得背景戰鬥能力。

目前正式支援：

- 銀河紀元主線連續戰鬥。
- 宇宙紀元主線連續戰鬥。
- 虛空幻境自動挑戰（雙紀元共用）。
- 銀河紀元文明災厄連續討伐。
- 宇宙紀元文明災厄連續討伐。

主線單場、文明災厄單場、銀河回顧戰與各模式待機／結果頁不得顯示極簡入口。

## 正式檔案

- `mainminimalmode.js`：共用極簡模式 overlay、資料同步、滑動退出、狀態切換與 adapter API。
- `mainminimalmode.css`：極簡模式桌機／手機版面、safe area、低動態樣式。
- `mainminimalmodeintegrity.js`：共用極簡模式完整性檢查。
- `secondworldminimalmode.js`：宇宙主線連續戰鬥 adapter。
- `secondworldcalamityminimalmode.js`：宇宙文明災厄連續討伐 adapter。
- `dungeonvoidui.js`：虛空幻境 adapter。
- `calamityui.js`：銀河文明災厄 adapter。
- `gameguide.js`：玩家可見的極簡模式說明。

舊名稱 `mainpowersave.js`、`mainpowersave.css` 已退休並從 repo 移除；正式 runtime 不再使用 `PowerSave`／`power-save` 命名。

## 共用控制 API

- `registerMinimalModeAdapter(id, adapter)`
- `openMinimalMode(adapterId)`
- `closeMinimalMode()`
- `syncMinimalMode()`
- `setMinimalModeState(mode)`
- `isMinimalModeOpen()`
- `getMinimalModeAdapterId()`

舊 `*MainMinimalMode` 控制 API 暫保留為相容 alias，銀河主線專屬 hook 名稱維持不變。

## 三種共用畫面狀態

- `running`：顯示各 adapter 的持續作戰狀態，滑動文字為「滑動退出極簡模式」。
- `stopped`：顯示「戰鬥已停止」，滑動文字為「滑動查看戰鬥結果」。
- `story`：顯示「戰鬥已完成」與「有新的劇情等待查看」，滑動文字為「滑動繼續」。

正式戰敗／結算／故事仍由原本 owner 建立；極簡模式只覆蓋在上層並切換狀態，玩家滑動後才看到既有正式結果。

宇宙文明災厄達成 30 / 30 時屬正常文明階段完成，不是劇情模式；其 adapter 以 `stopped` 的結果滑動行為為基礎，將完成狀態顯示為「文明階段已完成」，並依正式 settlement 顯示「文明等級已提升」或「文明進度已達 100%」。

## 銀河主線

`battlepipeline.js` 在主線連續戰鬥 render 後呼叫 `mainMinimalModeEnsureCombatHeader({continuous:true})`。

正式主線結算完成後呼叫 `mainMinimalModeHandleBattleResult(ctx, defeat)`；`specialencounter.js` 在特殊遭遇失敗結算建立完成後呼叫 `mainMinimalModeHandleSpecialResult(ctx, special, result)`。

銀河主線極簡模式不 wrapper `adventureCombatPage()`、不 wrapper `showBattleResult()`，也不使用 `MutationObserver` 監看結算 modal。

## 宇宙主線 adapter

- `secondworldminimalmode.js` 透過 `registerMinimalModeAdapter("second-world-mainline", ...)` 接入共用 overlay。
- 只在宇宙主線「連續戰鬥」的正式戰鬥畫面顯示入口；單場不顯示。
- 內容：目前 Boss、連續場次、角色等級、EXP、暗物質、暗能量。
- 持續狀態：`宇宙主線持續戰鬥中`。
- 正式 run 結束後保留最後一份純顯示 context，避免 owner 清除 active context 後畫面回退；此快照不寫 save、不成為新的戰鬥 state owner。
- 若正式 story progress 產生新的 `pendingStory`，overlay 切為 `story`；一般停止／死亡切為 `stopped`。
- `SECOND_WORLD_MAINLINE_MINIMAL_MODE_VERSION = 2`。

## 虛空幻境 adapter

- `dungeonvoidui.js` 透過 `registerMinimalModeAdapter("void-mirage", ...)` 接入共用 overlay，不建立第二套極簡 UI。
- 虛空戰鬥中的 `【虛空幻境】` 標題維持真正置中，右側顯示共用樣式的「極簡模式」按鈕。
- 虛空極簡內容固定為置中單欄：目前敵人、本次突破、已過樓層、歷史最高。
- `已過樓層` 使用 `lastClearedFloor`；`歷史最高` 使用 `historicalHighest`，突破舊紀錄後同步上升。
- 虛空戰敗或玩家要求強制退出並正式結束 run 時，overlay 切為 `stopped`；滑掉後露出原本虛空結果頁。
- `VOID_MINIMAL_MODE_HOOK_VERSION = 1`。

## 銀河文明災厄 adapter

- `calamityui.js` 透過共用 adapter 接入極簡模式。
- 只在銀河文明災厄連續討伐時顯示入口；單場挑戰不顯示。
- 正式災厄 HP、玩家 HP 與連續討伐狀態由原本災厄 owner 提供，極簡模式不擁有災厄 state。

## 宇宙文明災厄 adapter

- `secondworldcalamityminimalmode.js` 透過 `registerMinimalModeAdapter("second-world-calamity", ...)` 接入共用 overlay。
- 只在宇宙文明災厄「連續討伐」的正式戰鬥畫面顯示入口；單場／回顧不顯示。
- 正常戰鬥標題列右側顯示「極簡模式」，原本「停止連續討伐」控制維持不變。
- 極簡內容：目前災厄、連續討伐場次、災厄 HP、玩家 HP、文明進度、完整擊殺 X / 30。
- 持續狀態：`文明災厄連續討伐中`。
- 手動停止或其他正式結束：切為 `stopped`，滑動查看原本討伐結果。
- 30 / 30 正常完成：顯示 `文明階段已完成`，並顯示文明等級提升／100% 完成提示；滑動後仍回到正式結果頁。
- adapter 只包正式 `runSecondWorldCalamityContinuous()` 的 callbacks 以同步顯示，不改 battle／settlement／文明等級 owner。
- `SECOND_WORLD_CALAMITY_MINIMAL_MODE_VERSION = 1`。

## 背景規則

正式政策：`follow-gm-background-setting`。

極簡模式本身不呼叫 `backgroundProgressStart()` 或 `backgroundProgressStop()`。分頁隱藏、失焦、鎖屏後是否能使用背景時間補償，完全由既有 `backgroundprogress.js` 與 GM「背景戰鬥」設定決定。

極簡模式仍可透過 `backgroundProgressOnEnvironmentChange()` 在回到前景時同步顯示資料，但不擁有 background flow。

## 版本 marker

- `MAIN_MINIMAL_MODE_HOOK_VERSION = 2`
- `MAIN_MINIMAL_MODE_BACKGROUND_POLICY_VERSION = 1`
- `MAIN_MINIMAL_MODE_PIPELINE_HOOK_VERSION = 1`
- `MAIN_MINIMAL_MODE_SPECIAL_HOOK_VERSION = 1`
- `MAIN_MINIMAL_MODE_ADAPTER_VERSION = 1`
- `MINIMAL_MODE_SHARED_API_VERSION = 1`
- `SECOND_WORLD_MAINLINE_MINIMAL_MODE_VERSION = 2`
- `SECOND_WORLD_CALAMITY_MINIMAL_MODE_VERSION = 1`
- `VOID_MINIMAL_MODE_HOOK_VERSION = 1`
- `MAIN_MINIMAL_MODE_INTEGRITY_VERSION = 4`

## 維護規則

1. 極簡模式只顯示於正式連續戰鬥／連續討伐／虛空自動挑戰；單場、回顧、待機與結果頁不得顯示入口。
2. 不建立第二套戰鬥計時、結算、故事或 state owner。
3. 不恢復 `mainpowersave.*` 舊檔或 `PowerSave` 舊 global API。
4. 不用 broad `MutationObserver` 掃描 `#main`，也不監看結算 modal 來判斷狀態。
5. 是否允許背景時間補償必須留給正式背景系統／GM gate，極簡模式不可自行開啟。
6. JS／CSS 修改後同步 bump `index.html` cache-bust。
7. iPhone Safari 真機結果只能依實際測試回報，不可用程式檢查冒充真機驗收。
