# 《文明戰線》極簡模式正式架構

更新日期：2026-09-17

## 定位

極簡模式是主線連續戰鬥的顯示模式，只簡化畫面，不建立第二套戰鬥流程，也不自行取得背景戰鬥能力。

玩家在主線連續戰鬥中可切換到純黑極簡畫面，保留時間、目前敵人、連續戰鬥場次、角色等級、EXP、金幣與戰鬥狀態。滑動可退出；退出極簡模式不等於停止連續戰鬥。

## 正式檔案

- `mainminimalmode.js`：極簡模式 overlay、資料同步、滑動退出、狀態切換與正式 hook。
- `mainminimalmode.css`：極簡模式桌機／手機版面、safe area、低動態樣式。
- `mainminimalmodeintegrity.js`：正式完整性檢查。
- `gameguide.js`：玩家可見的極簡模式說明。

舊名稱 `mainpowersave.js`、`mainpowersave.css` 已退休並從 repo 移除；正式 runtime 不再使用 `PowerSave`／`power-save` 命名。

## 正式流程

`battlepipeline.js` 在主線連續戰鬥 render 後呼叫：

- `mainMinimalModeEnsureCombatHeader({continuous:true})`

正式主線結算完成後呼叫：

- `mainMinimalModeHandleBattleResult(ctx, defeat)`

`specialencounter.js` 在特殊遭遇失敗結算建立完成後呼叫：

- `mainMinimalModeHandleSpecialResult(ctx, special, result)`

極簡模式不 wrapper `adventureCombatPage()`、不 wrapper `showBattleResult()`，也不使用 `MutationObserver` 監看結算 modal。

## 三種畫面狀態

- `running`：顯示「戰鬥持續進行中」，滑動文字為「滑動退出極簡模式」。
- `stopped`：顯示「戰鬥已停止」，滑動文字為「滑動查看戰鬥結果」。
- `story`：顯示「戰鬥已完成」與「有新的劇情等待查看」，滑動文字為「滑動繼續」。

戰敗／特殊遭遇失敗／正式結算仍由原本 owner 建立；極簡模式只覆蓋在上層並切換狀態，玩家滑動後才看到既有正式結果。

## 背景規則

正式政策：`follow-gm-background-setting`。

極簡模式本身不呼叫 `backgroundProgressStart()` 或 `backgroundProgressStop()`。分頁隱藏、失焦、鎖屏後是否能使用背景時間補償，完全由既有 `backgroundprogress.js` 與 GM「背景戰鬥」設定決定。

極簡模式仍可透過 `backgroundProgressOnEnvironmentChange()` 在回到前景時同步顯示資料，但不擁有 background flow。

## 版本 marker

- `MAIN_MINIMAL_MODE_HOOK_VERSION = 2`
- `MAIN_MINIMAL_MODE_BACKGROUND_POLICY_VERSION = 1`
- `MAIN_MINIMAL_MODE_PIPELINE_HOOK_VERSION = 1`
- `MAIN_MINIMAL_MODE_SPECIAL_HOOK_VERSION = 1`
- `MAIN_MINIMAL_MODE_INTEGRITY_VERSION = 2`

## 維護規則

1. 極簡模式只限主線連續戰鬥；單場不得顯示入口。
2. 不建立第二套戰鬥計時、結算、故事或 state owner。
3. 不恢復 `mainpowersave.*` 舊檔或 `PowerSave` 舊 global API。
4. 不用 broad `MutationObserver` 掃描 `#main`，也不監看結算 modal 來判斷狀態。
5. 是否允許背景時間補償必須留給正式背景系統／GM gate，極簡模式不可自行開啟。
6. JS／CSS 修改後同步 bump `index.html` cache-bust。
7. iPhone Safari 真機結果只能依實際測試回報，不可用程式檢查冒充真機驗收。
