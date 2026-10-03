# 文明戰線

《文明戰線》是一款純前端、文字／數值導向的科幻 RPG 網頁遊戲，正式支援桌面版與手機版。

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本 README 只提供高階導覽；完整 current baseline、owner、施工規範與 pending 狀態請以 `PROJECT_HANDOFF.md` 為準。

## 目前正式版本

- **銀河紀元**：Lv.1～500，10 區、100 張主線地圖，普通／菁英／Boss 結構。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss。
- **高維紀元**：Lv.1000～2000，10 名高維存在、5pp 戰線、永久削血、維度之弦、界弦核心、正式 Story／Final、Arena、loot／offline 與回顧均已進入 runtime。
- 角色系統：5 裝備部位、6 品質、詞條、裝備評分、鎖定、遺失裝備與跨紀元裝備處理。
- 養成系統：8 種專精（各 Lv.60）、**VIP 等級無上限（特殊特權至 VIP20）**、銀河強化 +20、宇宙／高維強化 +40、10 印記、宇宙文明等級 Lv.10，以及轉生後永久突破等級。
- 副本／戰鬥：懸賞、競技場、鏡像、虛空、文明災厄、主線／特殊怪與高維正式戰鬥。
- 戰鬥倍速：依正式世界／轉生解鎖規則提供玩家 1×／1.5×；GM 可測 2×。
- 離線收益、背景戰鬥、Fast Catch-up、回顧戰、GM 正式管理與 sandbox 測試均已有正式 owner。
- Cloud Save 使用 Supabase；本機正式 save 仍以 `localStorage` 為基礎。

## 目前 Save／轉生基準

- 正式 key：`frank_text_rpg_save`
- **目前 runtime `SAVE_SCHEMA_VERSION = 17`**。
- Schema17 正式加入 `reincarnation` persistent root。
- Schema1～16 仍支援 migration；pre-Schema17 即使意外帶有 `reincarnation` root，也會依正式 migration policy 視為首輪並丟棄該污染資料。
- Future save 維持 fail-closed；舊版網頁不得把新版存檔降版覆寫。
- GM sandbox／benchmark transient state 不得寫入正式玩家 save。

目前正式轉生資格：

```text
Lv.2000
+ 本輪 10 名高維存在全滅
+ 界弦核心 Lv.10
= 可正式轉生
```

Story completion 不列入轉生資格。正式轉生會先做 verified safety backup，再透過 shared settlement transaction 原子提交；失敗時不得留下半套 mutation。

## 突破系統

首次遊戲 `reincarnation.count = 0` 時突破等級固定為 Lv.0。

轉生後每輪自然升級跨過 Lv.100／200／…／1000 時各取得 1 級突破，每輪最多 +10。每級正式效果：

- raw equipment HP／ATK／DEF +2.5%；
- final damage additive +0.05。

突破與裝備強化各自從 raw equipment 正式 owner 推導，不互相複利；GM 直接指定角色等級不會觸發自然升級里程碑。

## VIP 長期成長

- VIP 升級門檻：`1000 × VIP等級²`。
- VIP 等級本身沒有上限。
- 每級持續提供 HP／ATK +0.5%、DEF +0.25%、暴擊／閃避 +0.25 個百分點。
- VIP2～VIP20 依既有規則解鎖特殊特權；VIP20 是最後一個特殊特權階段。
- VIP21 以上不新增特權，但既有特權與每級基本能力成長持續有效。

完整 VIP 改版紀錄見 `PROJECT_VIP_UNBOUNDED_UPDATE.md`。

## 目前後續開發主線

既有三紀元正式內容目前以維護／實測為主。轉生核心資料、突破系統、正式轉生最小可用流程與其後優化已完成。

目前尚未完成的主要工作依 `PROJECT_HANDOFF.md` 為準，核心包括：

1. 異宇宙 1000U 實際玩法與完整化；
2. 轉生後 W1／W2／W3 自由重征服；
3. 越級 EXP／核心資源／offline 共用倍率；
4. 首次轉生後四大副本永久解鎖與 rerun eligibility；
5. 更完整角色總覽、GM 轉生／突破／異宇宙管理與全生命週期 regression。

## Integrity／維護

目前有 Runtime Integrity、Story Integrity、Asset Integrity 與各系統專屬 Integrity。

- Runtime／Final 共用 canonical Integrity Contract。
- Save migration、Offline state、world phase、轉生、突破、裝備處理、Arena、Mirror／Void、GM 等均有對應正式 owner／regression。
- `tests/runtime/docs-integrity.js` 應驗證**目前**文件基準，不得要求過時 Schema 或「尚未實作」敘述繼續存在。
- 正式背景只能從 `assets/backgrounds/` 讀取部署素材；source 素材不得被玩家端 runtime 誤用。

## 部署

GitHub Pages 可直接使用 `main` 分支根目錄部署，入口為 `index.html`。

## 開發與承接

跨對話／跨工作階段承接前請先閱讀：

- `PROJECT_HANDOFF.md`：current main 的完整交接基準、正式 owner、版本、已完成與尚未施工項目。
- `PROJECT_PENDING_STATUS.md`：目前真正 pending／已取消工作摘要。
- `PROJECT_VIP_UNBOUNDED_UPDATE.md`：VIP 無上限正式更新紀錄。
- `assets/README.md`：背景 source／runtime 素材政策。
- `GM_UI_GUIDE.md`：現行 GM 功能按鈕語意、配色與管理區塊原則。

修改前必須 fresh-read current `main` 的相關 owner／consumer；JS／CSS 改動需同步更新 `index.html` cache-bust。使用者說「先討論／先檢查」時不得修改；明確說「做／修改／執行／第 N 批」時可直接施工，完成後重新確認 actual main 與 Integrity。