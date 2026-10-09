# 《文明戰線》啟動資源盤點：第 1 批（2026-10-10）

> 唯一真實來源：GitHub `main`。此文件為載入治理的施工依據，不是要求立即更改現有同步與延後時序。每次實作前需重新核對 `main` 與整合測試。

## 核對範圍與計數

- `index.html` 共 **258 個帶 src/data-src 的腳本引用**：同步頁面腳本 **161**、GM **32**、劇情實際 **27**、診斷實際 **38**。
- HTML 宣告上 story 為 28、integrity 為 37，但 `scriptgrouploader.js` 的 `effectiveGroup()` 把 `storyruntimeintegrity.js` 改歸 integrity，故執行時計數為 **27／38**。
- 161 是「一般同步 script 標籤數」，**不是 161 項都已證明必需**；含外部 Supabase UMD 一項。檔案數不代表網路位元組或實際耗時。
- 此次僅盤點入口宣告（不是整個儲存庫所有 JS，也不代表 3D 圖片／引擎與材質清單），其他動態載入需另行追蹤。
- `backgroundpreload.js` 只計背景圖片：收集 CSS 背景、選當前畫面關鍵圖片、最長等待約 4500ms，剩餘圖片延後下載，**未與 GM/script 群組就緒整合**。
- `scriptgrouploader.js` 對 GM/story 群組採依檔案順序串行插入並等待 load；GM 的瀏覽器本機授權可復原，但不會阻止背景預載畫面結束。GM 本機授權目前不等於 Supabase 帳號綁定。
- 正式 3D `3d-test/formal-home.js` 的 Babylon 引擎與 prototype 場景目前使用時才下載／建立 WebGL，具預取機制；此動態資源不在上述 258 個腳本引用內。
- `ui.js` 首次初始化會 load → normalize/reconcile → save(false) → render；任何調整需保留首次可用畫面和存檔順序。

## 施工分類（非實測已可搬動）

- **A 啟動核心**：帳號、存檔、版本遷移、角色/世界數值、首次渲染所依賴的正式規則。須在揭露遊戲前 ready；現有同步檔原則上先保留。
- **B 首屏／當前紀元資源**：首屏背景、首次可見介面，以及真正的正式 3D 首屏資源；確定首屏才能界定必要集。
- **C GM 條件必要**：32 個 GM 模組，只在**已驗證且目前啟用的 GM** 啟動前全部 ready；身分提示與實際授權必須隔離。一般玩家保持按需。
- **D 非首屏內容**：27 個劇情有效模組與未進入場景的圖資／3D；需先區分資料註冊依賴、現行自動背景下載以及首次開啟即用的要求。**不要直接把故事內容腳本任意拆序**。
- **E 診斷**：38 個完整性／開發檢查只按明確診斷要求載入，不等同 GM 管理日常必備。

## 第 2～5 批的落地約束

1. **帳號隔離**：先檢查 Supabase session 與 GM 本機標記生命週期、登出／切帳號與授權可信來源。不得以易變更的 localStorage 作為實際管理權限；不應把 GM 身分寫入正式存檔。
2. **啟動 coordinator**：以可追蹤的 ready/failed/retry 狀態，等待「必要初始化＋當前必要資源」；進度百分比按已完成工作，而非虛構流速。**任何狀態字串不得透露 GM、管理或診斷內部名稱**，可只顯示「文明戰線」、「載入中…」、百分比。
3. **GM ready 屏障**：已授權 GM 必須等到整個有效 GM 群組成功結束且正式管理入口可使用才揭露；普通玩家只等待 A/B。載入失敗必須保持遮罩並可重試，不可以 100% 假裝成功。
4. **故事與 3D 分層**：依首次畫面分類 3D engine/scene/model/texture/GPU 初始化，預下載與 GPU 配置分離；故事可逐步預取，但切頁時要等必要資料 ready，不允許空白。
5. **回歸**：GM/一般玩家、未登入／已登入／登出／切帳號、首次進入／重整、失敗重試、GM UI 完整可用、慢網、桌機與 390px 手機、頁面隱私字樣、舊存檔、GitHub Actions。每次 JS/CSS 修改須同步 `index.html` cache-bust。

## 逐檔清冊（A/B? 代表需實證，非准許搬動）

| # | 檔案或 URL | 目前有效群組 | 初步責任 | 依賴風險／備註 |
|---:|---|---|---|---|
| 1 | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 2 | `supabaseauth.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 3 | `combatspeed.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 4 | `gmdevicepreferences.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 5 | `data.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 6 | `worldmaps-earth.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 7 | `worldmaps-solar.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 8 | `worldmaps-nearstar.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 9 | `worldmaps-frontier.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 10 | `worldmaps-orion.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 11 | `worldmaps-galactic-frontier.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 12 | `worldmaps-galactic-mid.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 13 | `worldmaps-core-outer.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 14 | `worldmaps-core-war.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 15 | `worldmaps-galactic-unification.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 16 | `worldmapregistrycheck.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 17 | `worldnamingrules.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 18 | `engine.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 19 | `newstatecontract.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 20 | `reincarnationstate.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 21 | `alternateuniversedata.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 22 | `alternateuniverseprogression.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 23 | `breakthroughcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 24 | `combatmath.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 25 | `enhancementcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 26 | `enhancementcombat.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 27 | `enhancementrewards.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 28 | `vipprogression.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 29 | `viplootcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 30 | `dailycore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 31 | `specialization.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 32 | `calamityconfig.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 33 | `calamitystate.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 34 | `markcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 35 | `worldphase.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 36 | `thirdworldphase.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 37 | `thirdworlddata.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 38 | `civilizationcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 39 | `secondworlddata.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 40 | `secondworldstoryregistry.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 41 | `secondworldcalamity.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 42 | `levelprogression.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 43 | `equipmentrewardcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 44 | `mirrorconfig.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 45 | `playertitlecore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 46 | `playertitlerenderer.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 47 | `playertitleui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 48 | `combatcore.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 49 | `reincarnationoverlevelrewards.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 50 | `thirdworldcombat.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 51 | `mirrorcombatcore.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 52 | `dungeonprogress.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 53 | `savehookcore.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 54 | `gmruntimeauthorization.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 55 | `compatibilityowners.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 56 | `mirrordungeonstate.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 57 | `offlinestatecore.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 58 | `reincarnationcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 59 | `reincarnationpermanentgearguard.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 60 | `savemigration.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 61 | `saveversionguard.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 62 | `savebackupretention.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 63 | `thirdworldcombatsaveguard.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 64 | `settlementtransaction.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 65 | `thirdworldcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 66 | `thirdworldloot.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 67 | `thirdworldprogress.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 68 | `enhancementmigration.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 69 | `dungeoncore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 70 | `gameguide.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 71 | `thirdworldguidecopy.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 72 | `mirrordungeonguide.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 73 | `cloudsaveguide.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 74 | `gameguidearena5.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 75 | `enhancementui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 76 | `ui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 77 | `playerbatchupgrades.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 78 | `worldphaseui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 79 | `reincarnationui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 80 | `playernamerules.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 81 | `preparemobilecontrols.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 82 | `worldmapui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 83 | `firstworldtargetcontext.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 84 | `reincarnationrerunworld1.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 85 | `runtimeapi.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 86 | `reincarnationrerunworld2.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 87 | `thirdworldui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 88 | `reincarnationrerunworld3.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 89 | `hpflow.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 90 | `vipui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 91 | `settlementui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 92 | `mainminimalmode.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 93 | `balance.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 94 | `calamitycore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 95 | `calamityrun.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 96 | `calamityui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 97 | `traits.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 98 | `alternateuniverseattempt.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 99 | `alternateuniversecombat.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 100 | `alternateuniverseui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 101 | `traitlock.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 102 | `secondworldcombat.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 103 | `secondworldrewards.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 104 | `secondworldmainline.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 105 | `secondworldminimalmode.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 106 | `secondworldcalamityrun.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 107 | `secondworldcalamityui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 108 | `secondworldcalamityminimalmode.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 109 | `traitdrop.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 110 | `gmtools.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 111 | `secondworldprogressmanagement.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 112 | `thirdworldprogressmanagement.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 113 | `gearupgrade.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 114 | `equipmentlock.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 115 | `inventoryfocus.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 116 | `specialmonsters.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 117 | `dungeonbounty.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 118 | `dungeonarena.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 119 | `thirdworldarena.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 120 | `thirdworldarenaui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 121 | `arenapositioncore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 122 | `arenawindowcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 123 | `dungeonvoid.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 124 | `dungeonvoidui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 125 | `levelcap.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 126 | `specialcore.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 127 | `vipgm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 128 | `civilizationgm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 129 | `specialgmbatch.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 130 | `dungeongm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 131 | `arenagm5.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 132 | `dungeonvoidgmmanage.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 133 | `batch5ui.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 134 | `gmhub.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 135 | `enhancementworld3gm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 136 | `gmhubextensions.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 137 | `gm3dprototype.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 138 | `gmformaltransaction.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 139 | `gmbreakthroughmanage.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 140 | `gmalternateuniversemanage.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 141 | `gmpowerbenchmark.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 142 | `gmpowerbenchmarkstate.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 143 | `gmpowerbenchmarkworldphase.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 144 | `gmalternateuniversebenchmark.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 145 | `thirdworldarenagm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 146 | `secondworldcalamitygm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 147 | `calamitygm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 148 | `gmbatch16formalcontrols.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 149 | `storydata-earth.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 150 | `storydata-solar.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 151 | `storydata-nearstar.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 152 | `storydata-frontier.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 153 | `storydata-orion.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 154 | `storydata-galactic-frontier.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 155 | `storydata-galactic-mid.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 156 | `storydata-core-outer.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 157 | `storydata-core-war.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 158 | `storydata-galactic-unification.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 159 | `storydata-universe-galaxy-beyond.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 160 | `storydata-universe-local-group-war.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 161 | `storydata-universe-star-cluster-frontier.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 162 | `storydata-universe-stellar-battlefront.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 163 | `storydata-universe-cosmic-filament.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 164 | `storydata-universe-stellar-great-wall.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 165 | `storydata-universe-cosmic-deep-domain.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 166 | `storydata-universe-trans-domain-frontier.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 167 | `storydata-universe-myriad-domain-frontline.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 168 | `storydata-universe-cosmic-unification-war.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 169 | `storydata-higher-dimensional.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 170 | `storydata-higher-dimensional-stage2-3.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 171 | `storydata-higher-dimensional-stage4-5.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 172 | `storydata-higher-dimensional-stage6-7.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 173 | `storydata-higher-dimensional-stage8-9.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 174 | `storydata-higher-dimensional-final.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 175 | `storyintegrity.js` | story | D | 劇情候選分段；需先查詢註冊順序／呼叫點 |
| 176 | `storyui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 177 | `gmstorytest.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 178 | `gmbackground.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 179 | `gmcombatspeed.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 180 | `gmdata.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 181 | `mirrordungeongm.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 182 | `levelprogressionaudit.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 183 | `specialencounter.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 184 | `combatpacing.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 185 | `battlepipeline.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 186 | `firstworldtargetcontextbatch4.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 187 | `backgroundprogress.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 188 | `thirdworldrun.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 189 | `offlinefarmtarget.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 190 | `offlineprogress.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 191 | `firstworldtargetcontextbatch5.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 192 | `firstworldtargetcontextbatch6.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 193 | `worldtransitionsafety.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 194 | `offlineworld3adapter.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 195 | `cloudsave.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 196 | `specialguide.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 197 | `levelcapresult.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 198 | `dungeonui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 199 | `reincarnationrerunprogress.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 200 | `thirdworlddungeonui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 201 | `reincarnationdungeonaccess.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 202 | `dungeonreturnlabels.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 203 | `mirrordungeonui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 204 | `dungeonplayerui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 205 | `arenaplayerflow2.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 206 | `adventureprogressui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 207 | `playersemanticsui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 208 | `breakthroughui.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 209 | `combatfx.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 210 | `thirdworldplayerflow.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 211 | `mirrordungeonrun.js` | blocking | A/B? | 現有同步載入：暫不搬動，待依賴證據確認 |
| 212 | `mirrordungeonintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 213 | `enhancementintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 214 | `enhancementworld3integrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 215 | `bosscontinuousintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 216 | `mainminimalmodeintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 217 | `dungeonvoidintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 218 | `thirdworlddungeonintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 219 | `accountcloudintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 220 | `calamitystateintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 221 | `markcoreintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 222 | `combatmarkintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 223 | `thirdworldcombatintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 224 | `thirdworldcombatfinalize.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 225 | `combatfxintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 226 | `combatspeedintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 227 | `calamitycoreintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 228 | `calamityrunintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 229 | `calamityuiintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 230 | `calamitygmintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 231 | `playertitlegmpreview.js` | gm | C | 條件必載（已授權 GM）；需保留依賴順序 |
| 232 | `playertitleintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 233 | `playertitlegmpreviewintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 234 | `playertitleuniverseintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 235 | `civilizationintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 236 | `gmbatch16integrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 237 | `secondworldcalamityuiintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 238 | `secondworldcalamitygmintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 239 | `secondworldcalamityintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 240 | `continuousrunintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 241 | `galaxyreviewintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 242 | `bountynameintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 243 | `thirdworldentryoptintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 244 | `integritycontract.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 245 | `thirdworldsubsystemintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 246 | `thirdworldintegritycontract.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 247 | `runtimeintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 248 | `mirrorfinalintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 249 | `storymigration.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 250 | `storyprogress.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 251 | `storyrecordtabs.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 252 | `storyruntimeintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |
| 253 | `3d-test/runtime.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 254 | `3d-test/appearance-snapshot.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 255 | `3d-test/formal-home.js` | blocking | B/D | 首次所需視圖／延後候選；依玩家場景決定 |
| 256 | `scriptgrouploader.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 257 | `backgroundpreload.js` | blocking | A | 核心候選必載；尚需實際啟動測試驗證 |
| 258 | `finalintegrity.js` | integrity | E | 診斷按需；避免生產啟動阻塞 |

## 驗收限制

這批為**清單與依賴風險分類**：只由真實 HTML/script loader 的宣告和啟動語意佐證；未完成 258 檔內部所有 symbol-level import/call graph，也未測量每檔網路 waterfall 或處理 3D 未來資產。後續對 A/B? 改序前，必須加上靜態引用檢查、Playwright 首次載入／導航、和正式功能回歸。這份盤點避免將「有 97 個 deferred 宣告」誤判成「97 個都應該前置」。

## 第 2 批後續快取與載入規格（2026-10-10 追加）

- 第 2 批修復的 GM 授權採「已登入 Supabase 使用者 ID + 此瀏覽器本機授權」雙條件，舊的無帳號歸屬授權不做跨帳號移轉；原使用者更新後需重新驗證一次 GM 密碼。登出時撤銷當前帳號的本機授權，避免借出裝置顯示 GM 身分。
- 第 3 批：建立必要資源就緒屏障與**只顯示中性讀取進度百分比**；不在任何等待 UI 文字展示 GM、管理、診斷或帳號角色。失敗保留重試選項，不偽裝 100%。
- 第 4 批：已授權 GM 的 32 個腳本在進入遊戲前完成加載，非 GM 仍按需；加入同帳號同瀏覽器「熱啟動」的快取，嚴格分離公開靜態 JS 快取與授權／密碼／存檔；優先量測後再優化依賴順序。
- 第 4 批快取驗收強制：**逐檔內容雜湊或獨立版本識別**、只更新有變更的檔案、必要相依版本一致、已部署版本而非未完成部署的 main 作為有效來源；重覆進入時沿用未變更資源，不能長期留舊版本。禁止以整個 Git commit SHA 為每個檔案的統一版本。
- 第 5 批：完整的正式 3D 模型／材質／場景按實際首屏與依賴分層；測量冷啟動與熱啟動，檢查重整、同帳號／跨帳號、GM 退出、載入錯誤、差異更新、部署中途版本一致性與手機效能。首次載入引擎及模型與額外場景下載分離。
