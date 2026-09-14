# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit 或任何記憶內容與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。

更新日期：**2026-09-15**

---

# 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 架構：純前端 HTML / CSS / JavaScript + `localStorage`
- 正式存檔 key：`frank_text_rpg_save`
- `SAVE_VERSION = 12`
- `SAVE_SCHEMA_VERSION = 12`
- `SAVE_LOAD_PIPELINE_VERSION = 2`
- `VIP_PROGRESSION_VERSION = 12`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 60`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面版＋手機版；iPhone Safari 是重要真機環境。
- 目前只有本機存檔，沒有雲端跨裝置同步。

`backgroundprogress.js` 的 background 指瀏覽器進入背景／失焦後的執行補償，**不是圖片背景 loader**，不可誤刪。

---

# 2. 修改專案時的固定規範

1. 修改前重新讀取 `main` 實際程式碼，不能只依聊天記憶。
2. 重新檢查完整 `index.html` 載入順序。
3. 不做需求以外的順手重構。
4. 每一批完成後重新讀取修改後檔案並檢查相依性。
5. 任何存檔結構改動都必須同步檢查 `data.js`、`savemigration.js`、`ui.js`、`runtimeintegrity.js`。
6. 桌機與手機 UI 必須一起檢查。
7. 裝備規則特別注意：神話裝備只禁止**自動出售**；未鎖定神話仍可被玩家手動出售／一鍵出售，不得誤加全面保護。
8. 正式功能完成整併後，優先移除 late override／過渡 wrapper，避免同一頁面或結算存在兩套正式來源。

---

# 3. 世界與主線

- 世界共 10 區、100 張地圖，Lv1～500。
- 地圖由 `registerRegionMaps()` 依固定 region/index 註冊，不依 script push 順序決定位置。
- 普通怪／菁英怪依進度逐步解鎖。
- Boss 固定單場挑戰。
- 首次擊敗 Boss：**只解鎖下一張主線地圖**。
- 商店已退休，Boss 首殺不再有任何商店刷新副作用。
- Boss 挑戰失敗後會鎖定再挑戰，需重新擊敗該地圖菁英怪 10 隻。

---

# 4. 商店系統已正式退休

2026-09-14 起，原本的裝備商店商品系統完整退休。

正式現況：

- 首頁沒有商店入口。
- 沒有商店頁面。
- 不再購買商店裝備。
- 不再有商店刷新、刷新價格、刷新價格重置或冷卻。
- `shopbalance.js` 已刪除。
- `shopretirement.js` 過渡層已刪除。
- 正式新存檔不含 `state.shop`。
- Schema 12 migration 會把舊存檔中的 `shop` 欄位視為退休資料並移除。
- Runtime Integrity 內有 v11 → v12 migration probe，會實際驗證舊 `shop` 被移除而 `lostGear` 的 id、價格、時間與裝備 id 完整保留。
- 正式 runtime 不應存在 `newShopState`、`ensureShop`、`paidShopRefresh`、`freeShopRefresh`、`shopPurchase`、`resetShopPrice`、`specialApplyShopDiscount` 等舊商店 API。

原本與背包共用的 `assets/backgrounds/inventory-shop/` 美術資產**保留**，但現在只作為背包背景使用；資料夾名稱是歷史命名，不代表商店仍存在。

---

# 5. 背包與遺失裝備贖回

背包目前負責：

- 查看目前裝備
- 查看背包裝備
- 裝備／比較
- 鎖定／解鎖
- 單件手動出售
- 一鍵裝備較強裝備
- 一鍵出售符合條件裝備
- **遺失裝備贖回**

戰敗可能遺失已裝備裝備，資料存於獨立的 `state.lostGear`，不是商店資料。

背包中的「遺失裝備贖回」可以：

- 查看遺失裝備能力
- 與目前同部位裝備比較
- 花費原規則金幣贖回
- 永久放棄

贖回核心使用獨立的 lost-gear mutation lock，不依賴任何商店功能。

2026-09-15 結構優化後：

- 贖回 UI 已正式整併進 `ui.js`。
- `inventoryredemption.js` late override 已刪除。
- 首頁、背包與 `render()` 不再有第二套覆蓋來源。
- `inventoryredemption.css` 保留，作為背包遺失裝備贖回區的正式樣式檔。

---

# 6. 九大特殊怪與黑市情報

特殊遭遇基礎機率：8%。
VIP6：特殊遭遇率 +2%，所以 VIP6+ 為 10%。

九大特殊怪：

1. 稀有資源聚合體：EXP ×0.5、金幣 ×6、不掉裝備。
2. 誘餌補給艙：必掉 1 件，稀有以上品質表 65/27/7/1。
3. 終止協議單元：EXP ×4、金幣 ×4、必掉裝備；史詩65%、傳說30%、神話5%。
4. 機率增幅信標：EXP ×0.8、金幣 ×0.8、必掉 1 件，品質使用一般表。
5. 封存警戒機：EXP ×4、金幣 ×0.5。
6. 裝備保全單元：必掉裝備，優先弱槽位；普通10%、優良35%、稀有35%、史詩16%、傳說4%。
7. **黑市武裝頭目**：金幣 ×2.5；擊敗後取得一次黑市情報。
8. 戰利品回收者：必掉 2 件，品質使用一般表。
9. 流動交易代理人：隨機財富（金幣×5）、知識（EXP×5）或裝備（至少稀有）。

## 特殊怪獎勵計算正式規則

- `getSpecialRewardContext()` 只負責特殊怪本身的倍率／掉落效果，不提前套用專精。
- `specialRewardExpAmount()` 與 `specialRewardGoldAmount()` 是正式 payout 計算入口。
- 實戰訓練與搜刮技巧只在 payout 層各套用**一次**，不得重複乘算。
- Runtime Integrity 有公式 probe，會檢查特殊怪 EXP／金幣專精只套用一次。

## 黑市情報正式規則

- 擊敗黑市武裝頭目後：`state.pendingBlackMarketEncounter = true`。
- 下一次**符合一般特殊遭遇條件**的主線勝利會 100% 觸發特殊怪。
- 只適用一般怪／菁英怪；Boss 不觸發也不消耗。
- 等級差不符合特殊遭遇條件時不消耗。
- 戰敗不消耗。
- 強制抽選排除 `bandit_king` 本身，因此不會由此效果連續抽到黑市武裝頭目。
- 黑市情報會在被強制觸發的特殊戰鬥**完成後**才清除並存檔；若警告／戰鬥中途重新整理或關閉頁面，情報仍會保留，避免獎勵被白白消耗。
- 關閉／重新載入遊戲後，尚未使用的黑市情報會保留。
- `pendingBlackMarketEncounter` 是正式持久狀態 boolean；`normalizePersistentFlags()` 同時加入 new-state normalizer 與 migration/load normalization。
- VIP10 對黑市武裝頭目若發動「獎勵再次發動」，**只再給一次黑市金幣獎勵，不會再給第二份黑市情報**。
- VIP10 第二份黑市金幣與第一份使用同一個 `specialRewardGoldAmount()` 公式，因此套用搜刮技巧後兩份金額規則完全一致。

2026-09-15 結構優化後：

- 黑市情報結算提示已直接整併進 `settlementui.js`。
- `blackmarketsettlement.js` late wrapper 已刪除。
- `specialguide.js` 已移除退休的 `shopRefreshDown` 分支。

---

# 7. VIP

- VIP 上限 20。
- 門檻公式：`2500 × VIP 等級²`。
- VIP1：2,500。
- VIP20：1,000,000。
- VIP4+ 副本 VIP 積分 ×1.1。
- VIP12+ 副本 VIP 積分 ×1.2。
- VIP6：特殊遭遇率 +2%。
- VIP10：擊敗特殊怪後 10% 機率讓該特殊怪獎勵再次發動；黑市武裝頭目採上節特例。
- VIP20：死亡時可防止裝備遺失，但 EXP 懲罰仍照規則處理。

---

# 8. 專精

共 8 種，每種最高 Lv60：

- 實戰訓練：EXP +2.5%／Lv
- 搜刮技巧：怪物金幣 +2.5%／Lv
- 鑑價技巧：裝備出售價 +2.5%／Lv
- 先制技巧：第一次主動攻擊傷害 +1%／Lv
- 連擊技巧：連擊率 +0.5%／Lv；追加攻擊 50% 傷害
- 穿透技巧：觸發率 +0.5%／Lv；忽略 25% 防禦
- 反擊技巧：觸發率 +0.5%／Lv；反擊 40% 傷害
- 汲取技巧：觸發率 +0.5%／Lv；回復實際傷害 10% HP

升級目標等級費用：`1000 × level²`。

---

# 9. 每日副本

每日系統依 UTC+8／臺灣日曆日，凌晨 0 點重置。

- 懸賞：每天最多 20 場真正開始的戰鬥。
- 競技場：每天最多開始 20 輪。
- 虛空：記錄當日最高層與是否已領獎。
- 主線／離線收益不增加副本額度或進度。

## 懸賞

- Lv5 解鎖。
- 普通：45%，EXP×5、金幣×5、2 件裝備。
- 高級：35%，EXP×8、金幣×8、3 件裝備。
- 危險：20%，EXP×12、金幣×12、5 件裝備。
- 懸賞裝備最低稀有。

## 競技場

- Lv15 解鎖。
- 每輪 3 戰，中間不回血。
- 10 個階級。
- 第1～3階基礎總積分：普通50／困難100／極限150。
- 第4階起每階 +60；第10階為 470／520／570。
- VIP 倍率只對整輪累積基礎積分套用一次。
- 戰力評估需 500 次模擬，通過目標 485。

## 虛空幻境

- Lv25 解鎖。
- 沒有最高層數。
- 起始層：`max(1, 歷史最高 - 100)`。
- 每 10 層為 Boss。
- 歷史最高永久保存。
- 每日基礎獎勵＝當日最高層 ×2 VIP 積分，每天只能領一次。

---

# 10. 離線收益

- 最多 12 小時。
- 最短 1 分鐘才結算。
- EXP／金幣／裝備效率約在線戰鬥的 10%。
- 依真實戰鬥樣本估算速度。
- 有 heartbeat、pending settlement、rollback 防護。
- 不增加每日副本額度、進度或 VIP 積分。
- Lv500 時離線 EXP 依既有滿等規則轉換為金幣。

---

# 11. 背景與 UI 美術

統一風格：科幻戰略風＋宇宙史詩風；深藍、黑、鐵灰、銀灰、科技藍，輔以紫藍、能量紫、青藍與少量金色。

避免：過亮、過度霓虹、卡通兒童感、純寫實軍武、現代都市、過度雜亂、電影海報感。

背景預設 16:9，須兼顧桌機與手機 `background-size: cover` 裁切；中央盡量保留 UI 空間。

`backgroundpreload.js` 會從正式 CSS 掃描 `/assets/backgrounds/` 資產，排除 `/backgrounds-source/`，最多等待 12 秒。

---

# 12. 遊戲說明與 Runtime Integrity

- `GAME_GUIDE_VERSION = 8`。
- 遊戲說明不得再出現商店商品、商店刷新、Boss 免費刷新商店、前往商店贖回、黑市降低商店費用等舊規則。
- 正式死亡／特殊戰敗文字都應指向背包的「遺失裝備贖回」。
- 正式 `newState()` normalizer 數量目前為 **4**：VIP、每日、正式副本狀態、持久旗標（黑市情報）。
- Runtime Integrity 應檢查：
  - Save schema 12
  - fresh state 不含 `shop`
  - fresh state 的 `pendingBlackMarketEncounter === false`
  - loaded state 不含 `shop`
  - 舊商店 API 不存在
  - v11 → v12 migration 能移除 `shop` 並完整保留 `lostGear`
  - 黑市武裝頭目金幣倍率 2.5
  - 黑市武裝頭目沒有任何 shop 類型 effect
  - 特殊怪 EXP／金幣專精只套用一次
  - 黑市 VIP10 第二份金幣使用與第一份相同公式
  - `pendingBlackMarketEncounter` 為 boolean
  - Game Guide v8 且沒有舊商店規則文字
  - 既有世界、VIP、專精、每日、副本與虛空檢查維持通過

正式 runtime 完成後應有：

`PROJECT_RUNTIME_REPORT = { passed, clean, errors, warnings, checkedAt }`

---

# 13. 已退休資料不得恢復

以下內容均視為歷史／退休，不得因舊聊天或舊程式片段重新加入：

- 裝備商店商品系統
- 商店刷新與價格重置
- Boss 首殺免費刷新商店
- 黑市武裝頭目降低商店刷新成本
- `state.shop`
- `shopbalance.js`
- `shopretirement.js`
- `inventoryredemption.js`（贖回 UI 已正式整併至 `ui.js`）
- `blackmarketsettlement.js`（黑市提示已正式整併至 `settlementui.js`）
- `shopRefreshDown`
- 舊共享副本 `progress / attempts / activeRun / points`
- 舊 VIP `1000 × Lv²`
- 專精 Lv30 上限
- 虛空逐層首通 VIP 積分
- 虛空最高 5000 層
- `getVoidMirageNextFloor`
- `voidMirageFirstClearPoints`
- `VOID_MIRAGE_GM_UI_V2`
- `continuousbattle.js`
- 舊 `dungeonvoidgmui.js`

---

# 14. 後續對話承接方式

新對話若要承接本專案：

1. 先讀本 `PROJECT_HANDOFF.md`。
2. 再重新讀取 GitHub `main` 的實際相關程式碼。
3. `main` 與本文件若有任何差異，以 `main` 為準。
4. 在使用者明確說「修改」以前，不自行提交變更。
