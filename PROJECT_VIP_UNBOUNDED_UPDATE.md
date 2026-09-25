# 《文明戰線》VIP 無上限正式更新

更新日期：2026-09-26（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 實際程式碼仍是唯一真實來源。**  
> 本檔是 2026-09-26 VIP 無上限改版的正式補充文件；若舊 `PROJECT_HANDOFF.md`、舊對話或舊文件仍寫「VIP 最大20／VIP20 後積分無用途」，該敘述已失效，以本檔與 current `main` 為準。

## 1. 正式規則

VIP 已由「最高 VIP20」改為：

- **VIP 等級無上限。**
- 升級門檻永久維持：`1000 × VIP等級²`。
- 每提升 1 級 VIP，持續增加：
  - HP +0.5%
  - ATK +0.5%
  - DEF +0.25%
  - 暴擊 +0.25 個百分點
  - 閃避 +0.25 個百分點
- **VIP20 是最後一個特殊特權階段，不是最高 VIP 等級。**
- VIP21 以上不新增特殊特權，但既有 VIP2～20 特權永久保留，基本能力仍持續成長。
- 競技場、虛空幻境等既有 VIP 積分來源繼續有效；第二紀元中後期達到 VIP20 後，玩家仍有繼續取得 VIP 積分的長期動機。

範例：

- 400,000 積分 → VIP20
- 441,000 積分 → VIP21
- 490,000 積分 → VIP22
- 900,000 積分 → VIP30
- 2,500,000 積分 → VIP50
- 10,000,000 積分 → VIP100

## 2. 正式 owner／版本

### VIP progression

`vipprogression.js`

- `VIP_PROGRESSION_VERSION = 14`
- `VIP_UNBOUNDED_LEVEL_VERSION = 1`
- `VIP_PERK_MAX_LEVEL = 20`
- `VIP_POINTS_SOURCE_OF_TRUTH_VERSION = 1`
- `VIP_STATE_RECONCILIATION_VERSION = 1`
- `vipLevelFromPoints(...)` 不再 clamp 到20。
- `normalizeVipState(...)` 直接依既有 `vipPoints` 重算真實 VIP 等級。
- `vipBonusStats(...)` 依真實 VIP 等級計算，不再封頂20。

因此既有存檔不需要 schema migration；原本累積超過 400,000 的積分沒有遺失，更新後會自然算出 VIP21+。

### VIP Loot

`viplootcore.js`

- VIP8／14／16／18 特權門檻不變。
- VIP21+ 仍正常享有已解鎖特權。
- 不新增 VIP21+ 裝備特權。

### 玩家 UI

`vipui.js`

- `VIP_UI_VERSION = 2`
- 移除 `VIP20 MAX`。
- 永遠顯示目前 VIP 與下一級積分門檻。
- VIP20 以上顯示「特殊特權已全部解鎖」，但明確說明 VIP 等級與基本能力仍可持續成長。

### 遊戲說明

`gameguide.js`

- `GAME_GUIDE_VERSION = 19`
- 「副本與 VIP」正式說明 VIP 等級無上限、特權止於20、VIP21+ 仍持續增加基本能力。
- 不再使用「目前最高 VIP20」文字。

## 3. GM 管理／GM 測試

### 正式 VIP 管理

GM Hub 新增獨立「VIP 管理」區塊：

- 顯示正式角色目前 VIP、VIP 積分與下一級門檻。
- 正式資料以「指定 VIP 積分」為入口，不直接硬寫 VIP 等級。
- 套用後由正式 progression owner 自動反推 VIP 等級。
- 修改 VIP 積分時維持目前 HP 比例。
- 保留「重置 VIP（等級＋積分）」功能。

### GM VIP 測試

- `GM_UNBOUNDED_VIP_TEST_VERSION = 1`
- VIP 測試由固定 0～20 下拉改為無上限數字輸入。
- 可直接測 VIP21、30、50、100 等任意非負整數。
- `gmTestPlayerStats(...)` 會真正套用測試 VIP，不再暗中 clamp 20。
- 「同步正式角色到測試設定」可正確同步正式 VIP21+。
- 戰力基準測試 snapshot 會保留真實測試 VIP 等級。

## 4. Integrity／CI

新增 VIP 無上限正式 Runtime probe：

- `VIP_UNBOUNDED_INTEGRITY_VERSION = 1`
- `VIP_UNBOUNDED_INTEGRITY_REPORT`

Runtime probe 會確認：

- VIP progression V14。
- 無上限 owner V1。
- 特權最高階仍為20。
- VIP UI V2。
- GM 無上限 VIP 測試 V1。
- VIP21 門檻 = 441,000。
- VIP50 門檻 = 2,500,000。
- 441,000 → VIP21。
- 2,500,000 → VIP50。
- VIP50 基本能力 = HP/ATK +25%、DEF +12.5%、暴擊/閃避 +12.5pp。
- 490,000 舊積分可正規化為 VIP22。
- GM 測試可設定 VIP50。
- 遊戲說明不再寫「最高 VIP20」。
- GM 正式 VIP 管理入口存在。

`integritycontract.js` 已同步鎖定：

- `VIP_PROGRESSION_VERSION = 14`
- `VIP_UNBOUNDED_LEVEL_VERSION = 1`
- `VIP_PERK_MAX_LEVEL = 20`
- `VIP_POINTS_SOURCE_OF_TRUTH_VERSION = 1`
- `VIP_STATE_RECONCILIATION_VERSION = 1`
- `VIP_ADD_POINTS_OWNER_REQUIRED_VERSION = 1`
- `VIP_UI_VERSION = 2`
- `GM_UNBOUNDED_VIP_TEST_VERSION = 1`
- `VIP_UNBOUNDED_INTEGRITY_VERSION = 1`
- `GAME_GUIDE_VERSION = 19`

新增 CI：

- `tests/runtime/vip-unbounded-integrity.js`
- `.github/workflows/runtime-integrity.yml` 會在既有 `js-integrity.js` 後執行 VIP 無上限專用測試。

## 5. Cache-bust

`index.html` 已更新本次變更相關載入版本：

- `engine.js`
- `vipprogression.js`
- `viplootcore.js`
- `gameguide.js`
- `vipui.js`
- `vipgm.js`
- `gmhubextensions.js`
- `integritycontract.js`

其中 `viplootcore.js` 保留既有 `20260925-vip-loot-cleanup1` 字首，再追加本次版本尾碼，以維持既有 owner audit 的相容性。

## 6. 第三紀元設計同步

舊高維紀元設計中下列敘述正式失效：

- 「VIP20 為完成態，不開21+」
- 「VIP20 後 VIP 積分可無用途」

新正式基準：

- VIP 特殊特權於 VIP20 完成。
- VIP 等級本身無上限。
- 第三紀元仍可延續競技場／虛空等既有玩法提供的 VIP 積分，作為跨紀元永久長線成長。
- 第三紀元不需要因此新增 VIP21+ 特殊特權，也不需要把 VIP 積分轉換成高維資源。

## 7. 本次自我檢查

本次修改分三批完成：

1. 正式 VIP progression／基本能力／VIP Loot 核心。
2. 玩家 VIP UI、遊戲說明、GM 管理與 GM 測試。
3. Integrity／CI／cache-bust／文件同步。

第3批自我檢查特別確認：

- `index.html` 僅保留本次應更新的 VIP／Guide／GM／Integrity cache-bust。
- 自我檢查曾抓到 `worldmaps-core-war.js` 的無關 cache-bust 漂移，已立即還原，不納入正式變更。
- Save schema 維持15，沒有新增 VIP save 欄位，不需要 migration。
- VIP20 死亡保護及 VIP2～18 既有特殊特權門檻沒有改變。
- 高維紀元 runtime 仍未實作，本次只修正其 VIP 設計前提。

## 8. 2026-09-26 後續 owner／舊資料收斂

針對 VIP 無上限改版再做一次維護檢查後，已追加以下正式收斂：

- `engine.js` 不再持有 `VIP_MAX_LEVEL` 或第二套 `vipBonusStats()`；VIP 基本能力正式唯一 owner 為 `vipprogression.js`。
- `vipgm.js` 本體直接支援無上限 VIP 測試；`gmhubextensions.js` 不再透過 runtime override 修正 VIP 測試。
- `addVipPoints(...)` 不再保留自己的 vipPoints／vipLevel fallback；若正式 `normalizeVipState` 或 `vipLevelFromPoints` owner 未載入，直接 fail-fast，避免第二套 progression 漂移。
- `VIP_ADD_POINTS_OWNER_REQUIRED_VERSION = 1` 標記上述依賴政策。
- **舊存檔的 VIP 真實來源正式定義為 `vipPoints`。** `vipLevel` 為可重建衍生值；載入與正規化時一律依積分重算。
- 舊資料測試已涵蓋：
  - `vipPoints = 490,000`、舊 `vipLevel = 20` → VIP22。
  - `vipPoints = 441,000`、缺少 `vipLevel` → VIP21。
  - `vipPoints = 400,000`、錯誤 `vipLevel = 99` → VIP20。
  - 只有 `vipLevel = 50`、缺少 `vipPoints` → 視為 0 積分並重建為 VIP0；不信任無積分依據的孤立等級值。
- 不升 Save Schema；上述皆由現有 normalization owner 處理。
- VIP Loot 追加回歸測試：VIP21／50／100 均完整繼承 VIP8／14／16／18 既有特權與原機率，但特權表仍只有 `vip8 / vip14 / vip16 / vip18`，不得因無限等級自行新增 VIP21+ tier。

CI 最終結果應以 current main 最新 HEAD 的 GitHub Actions `Runtime Integrity` 為準；若後續文件 commit 使中間 commit 被 freshness guard 略過，應查看最後一個 current-head run。
