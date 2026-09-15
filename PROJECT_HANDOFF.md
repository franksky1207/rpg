# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit、模型記憶或任何摘要與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。本文件是交接索引與目前規則摘要，不可取代實際程式碼檢查。

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
- `ENHANCEMENT_MAX_LEVEL = 20`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面版＋手機版；iPhone Safari 是重要真機環境。
- 目前只有本機存檔，沒有雲端跨裝置同步。

`backgroundprogress.js` 的 background 指瀏覽器進入背景／失焦後的執行補償，**不是圖片背景 loader**。正式圖片背景預載是 `backgroundpreload.js`。

---

# 2. 修改專案時固定操作規範

1. 修改前一定重新讀取 GitHub `main` 的相關實際檔案，不能只靠 handoff 或聊天記憶。
2. 涉及載入順序、wrapper、全域函式時，重新檢查完整 `index.html`。
3. 使用者說「先討論／先不要修改／先檢查」時禁止寫入 GitHub。
4. 使用者明確說「做／修改／執行／第 N 批」時，可直接修改 `main`。
5. 修改完成後要重新讀取修改後的 `main`，確認內容、載入順序與相依性。
6. JS/CSS 正式改動後同步更新 `index.html` cache-bust；同名背景 WebP 重製時同步 bump `backgrounds.css` URL query。
7. 不做需求以外的順手重構，不偷偷改平衡、離線目標或存檔語意。
8. 優先修改真正正式 owner；不要新增 late wrapper、第二套公式、DOM 文字解析或第二套結算。
9. 存檔結構改動要同步檢查 `data.js`、`savemigration.js`、normalizer、`runtimeintegrity.js` 與舊存檔相容性。
10. 桌機與手機 UI 一起檢查。
11. 神話裝備只禁止 **AUTO 自動出售**；未鎖定神話仍可手動單件確認出售，也可符合玩家主動的一鍵出售條件。
12. 一次性 GitHub Actions workflow 若只做資產轉換，輸出驗證進 `main` 後應刪除 workflow，但保留 source 母圖。

---

# 3. 世界、主線與角色能力

- 10 區、100 張地圖、Lv1～500。
- 地圖由 `registerRegionMaps()` 依固定 region/index 註冊，不依 script push 順序決定位置。
- 普通怪／菁英怪依進度解鎖。
- 普通怪、菁英怪與 Boss 都可選擇單場或連續戰鬥；三者共用同一套主線 continuous pipeline、停止按鈕與結算。
- Boss 首次擊敗會解鎖下一張地圖；若當時使用連續戰鬥，仍留在原本地圖繼續挑戰同一隻 Boss，不自動跳圖。
- Boss 戰敗會立即停止連續戰鬥、鎖定再挑戰並把 `bossProgress` 歸零；需重新擊敗該地圖菁英 10 隻才會再次出現。
- Boss 不觸發特殊怪，也不消耗黑市情報。
- Boss 連戰不使用 `backgroundprogress.js` 的主線背景 catch-up；切到背景分頁不會補算 Boss 場次。
- Boss 不會成為離線收益刷怪目標。
- 商店已退休，Boss 首殺沒有商店刷新副作用。
- `MAIN_BOSS_CONTINUOUS_VERSION = 1`。
- `BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION = 1`。

正式基礎能力：

- `baseHP(l) = ceil(110 + 12 × (l-1))`
- `baseATK(l) = ceil(15 + 2.2 × (l-1))`
- `baseDEF(l) = ceil(7 + 1.2 × (l-1))`
- VIP 每級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25 percentage point、閃避 +0.25 percentage point。
- `playerCombatStats()` 先取得裝備／基礎能力，再套 VIP；強化只在裝備能力派生階段增加主能力差額。

---

# 4. 商店已正式退休

2026-09-14 起原裝備商店完整退休：

- 無商店入口、頁面、商品購買、刷新、刷新價格、價格重置或冷卻。
- 正式新存檔不含 `state.shop`；Schema 12 migration 會移除舊 `shop`。
- `shopbalance.js`、`shopretirement.js` 已刪除。
- 不應恢復 `newShopState`、`ensureShop`、`paidShopRefresh`、`freeShopRefresh`、`shopPurchase`、`resetShopPrice`、`specialApplyShopDiscount` 等舊 API。
- `assets/backgrounds/inventory-shop/` 仍保留作為背包背景，資料夾名稱只是歷史命名。

---

# 5. 裝備、背包與出售

正式部位：`weapon / helmet / armor / shoes / accessory`＝武器／頭盔／鎧甲／鞋子／飾品。

主能力：

- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：HP
- 飾品：CRIT

`equipmentScore(it)` 維持原始裝備評分；**強化不改 item aggregate stats、`mainStat.value` 或 equipmentScore。**

背包負責查看、比較、裝備、鎖定／解鎖、單件出售、一鍵裝備、一鍵出售、遺失裝備贖回。

- 鎖定裝備不會被手動出售、一鍵出售或 AUTO 出售。
- 神話 q5 永遠不 AUTO 出售；未鎖定神話仍可玩家主動出售。
- 遺失裝備在 `state.lostGear`，可贖回或永久放棄。
- `inventoryredemption.js` 已退休，贖回 UI 已整併 `ui.js`。

---

# 6. 特殊怪與黑市情報

特殊遭遇基礎 8%；VIP6+ 為 10%。共有九種特殊怪：稀有資源聚合體、誘餌補給艙、終止協議單元、機率增幅信標、封存警戒機、裝備保全單元、黑市武裝頭目、戰利品回收者、流動交易代理人。

- 特殊怪 EXP／金幣專精只在 payout 層各套一次。
- 黑市武裝頭目勝利後可建立 `state.pendingBlackMarketEncounter=true`。
- 下一次符合一般特殊遭遇條件的主線普通／菁英勝利會強制觸發另一隻特殊怪，排除黑市武裝頭目。
- Boss、不合條件或戰敗不消耗情報。
- VIP10 若黑市頭目獎勵重複發動，只重複金幣，不給第二份情報。
- `blackmarketsettlement.js` 已退休，提示已整併 `settlementui.js`。

特殊怪與副本**不直接掉落強化石**，但其掉落裝備若實際 AUTO 出售，仍依正式裝備出售規則取得出售強化石，並可納入戰鬥結算摘要。

---

# 7. VIP 與專精

VIP：

- 上限 20。
- 門檻：`2500 × VIP level²`；VIP1=2,500，VIP20=1,000,000。
- VIP4+ 副本 VIP 積分 ×1.1；VIP12+ ×1.2。
- VIP6 特殊遭遇 8%→10%。
- VIP10 特殊怪獎勵 10% 再發動。
- VIP20 防止死亡裝備遺失，EXP 懲罰仍依規則。

8 種專精、各 Lv60：training、scavenge、appraisal、initiative、combo、penetration、counter、drain。升級到目標 level 的費用為 `1000 × level²`。

---

# 8. 每日副本

每日系統依 UTC+8 日曆日、凌晨 0 點重置。

- 懸賞：Lv5 解鎖，每日最多 20 場真正開始的戰鬥。
- 競技場：Lv15 解鎖，每日最多 20 輪，每輪 3 戰，中間不回血。
- 虛空幻境：Lv25 解鎖，無最高層；起始 `max(1, 歷史最高-100)`；每10層 Boss；每日基礎獎勵＝當日最高層×2 VIP積分，每日只能領一次。
- 主線與離線收益不增加副本額度／進度。
- 副本怪物不直接掉強化石。

---

# 9. 裝備欄位強化系統

## 9.1 正式持久資料

```text
state.enhancement = {
  basicStones,
  advancedStones,
  levels: { weapon, helmet, armor, shoes, accessory }
}
```

- 五個欄位永久強化，正式上限 **+20**。
- 更換裝備、死亡遺失裝備、欄位暫時為空都不失去強化等級。
- 每級提高目前裝備**原始主能力** 2.5%，+20 = +50%。
- 不乘基礎能力、affix、專精、VIP 或其他來源。
- 強化不修改裝備物件原始 `mainStat.value`、aggregate stats 或 `equipmentScore()`。
- `rawEquippedStats()` 提供未強化裝備能力。
- `equippedStatsWithEnhancementLevels(levels)` 是正式與 GM 共用的強化能力計算 API。
- `equippedStats()` 正式遊戲直接使用目前持久強化等級。

## 9.2 成本

- 強化石是 `state.enhancement` counter，不是背包 item。
- 強化只花石頭，不花金幣；100% 成功。
- 強化到目標 +N：基礎 `100×N`、進階 `5×N`。
- +20 單次成本：2000 基礎＋100 進階。
- 單欄 +0→+20 累積：21,000 基礎＋1,050 進階。

## 9.3 主線掉石

正式 owner：`enhancementrewards.js`＋`combatcore.js`。

- normal：1 基礎。
- elite：70% 1 基礎、30% 2 基礎。
- boss：1 進階。
- 資格：`playerLevel - monsterLevel < 10`。
- 玩家高於怪物 10 級（含）以上時不掉強化石，只抑制石頭，不影響其他獎勵。
- `expectedMainlineEnhancementStoneReward()` 提供理論產量，離線與線上共用同一份機率來源。
- `MAINLINE_ENHANCEMENT_PIPELINE_VERSION = 2`。

## 9.4 出售裝備取得強化石

正式發獎 owner：`equipmentlock.js`，共用公式在 `enhancementrewards.js`。

- q4 傳說：+5 基礎。
- q5 神話：+1 進階。
- 單件手動、一鍵出售、AUTO-sell、換裝後舊裝 AUTO 出售都走同一套規則。
- `addItem()`／`handleUnequippedItem()` 回傳實際已發放的 `enhancementStones`；戰鬥／UI 只統計與顯示，不重新按品質計算或二次 grant。
- 批次出售使用 `enhancementStoneSaleRewards()`／`grantEnhancementStoneSaleRewards()`。
- `EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION = 2`。
- `enhancementrewardintegration.js` 已退休並刪除，不得恢復第二層出售 grant。

## 9.5 戰鬥結算

- `battlepipeline.js` 的 context 正式累積 `battle` 與 `autoSale` 兩類強化石摘要。
- `settlementui.js` 顯示單一全寬「強化石獎勵」橫列。
- 不再顯示重複的「打怪掉落」「AUTO 出售」第二層說明。
- 單一種類只顯示實際取得的石頭；若同一輪不同來源同時得到基礎＋進階，兩者在同一橫列顯示。
- 戰鬥結算立即換裝後若舊裝 AUTO 出售，因為這筆出售發生在原結算產生之後，仍會另外提示金幣與石頭。

## 9.6 強化 UI 正式 owner

- 首頁「強化」入口與 `view="enhancement"` render route 已正式整併 `ui.js`。
- `enhancementnav.js` 已刪除。
- `enhancementui.js` 正式負責頁面、五張欄位卡、確認 modal、實際主能力預覽與強化原子扣款。
- 強化成功後不跳第二個成功 alert，直接重新 render 最新數值。
- 五張卡桌機版維持相同寬度；第五張不跨滿整列；手機維持單欄。
- 強化頁 CSS 已移至 `functionuipolish.css`，不再由 `enhancementui.js` 注入 `<style>`。
- `ENHANCEMENT_UI_VERSION = 4`。
- `enhancementfinalize.js` 已刪除；「實際主能力」確認列已直接整併 `enhancementui.js`。

## 9.7 舊存檔相容

- Save Schema 仍為 12，本輪優化沒有改存檔語意，所以不升版。
- `engine.js -> newState()` 已直接建立 enhancement 初始資料，不再由 enhancement wrapper 補。
- 正式 migration pipeline 直接呼叫 `normalizeEnhancementState()`。
- `normalizeEnhancementState()` 會把石頭正規化為非負整數、五欄等級 clamp 0～20，並補齊舊存檔缺少的 enhancement。
- 正式 newState normalizer count 維持 4。
- `enhancementmigration.js` 現在只負責 enhancement 存檔相容性 probe，不再重複測整套平衡／戰鬥規則。

---

# 10. 離線收益與強化石

- 最多 12 小時；最短 1 分鐘。
- EXP／金幣／裝備約在線 10%。
- 離線主線強化石效率為正式理論產量的 5%。
- 離線合法目標不含 Boss，因此戰鬥部分不取得進階石。
- 若玩家最後進行的是 Boss 戰鬥，Boss 不會覆蓋有效離線刷怪目標；離線收益會沿用最近一次有效的普通怪或菁英怪戰鬥紀錄。
- `offlineEnhancementStoneReward()` 只呼叫 `expectedMainlineEnhancementStoneReward()` 取得正式理論值，再套 5%；`offlineprogress.js` 不再手寫菁英 EV 1.3。
- 整段離線先合計理論量，再 floor；不是每場先 floor。
- 使用與在線相同的 10 級差資格。
- 離線出售裝備的石頭使用正式 `enhancementStoneSaleReward()` 並用 `mergeEnhancementStoneRewards()` 累積。
- `OFFLINE_ENHANCEMENT_PIPELINE_VERSION = 3`。
- 舊 `enhancementoffline.js` DOM Observer／文字解析 workaround 已退休，不得恢復。
- `resolveFarmTarget()` 仍優先最新合法 `battleSamples`，再 fallback `farmMap/farmEnemy`；不是自動搜尋最高已解鎖非 Boss。

---

# 11. GM 管理與測試（含強化）

強化 GM 已正式整併，不再使用 `enhancementgm.js`：

- `gmhub.js` 直接提供「強化管理」與「強化測試」區塊。
- 強化管理可直接設定五欄正式 +0～+20，不消耗／不改目前強化石。
- `vipgm.js` 正式持有 GM 測試強化狀態與測試玩家快照。
- `gmTestEnhancementLevels` 只存在本頁工作階段，重新整理回 +0。
- 單一「目前狀態」按鈕同步正式 VIP、8 種專精、5 欄強化到測試狀態。
- `gmTestEnhancedEquippedStats()` 使用正式 `equippedStatsWithEnhancementLevels(levels)`，不複製第二套強化公式。
- `gmTestPlayerStats()` 正式整合測試 VIP＋專精＋強化。
- GM 強化 grid CSS 已移到 `functionuipolish.css`，不再 JS 注入 enhancement GM styles。
- `GM_ENHANCEMENT_TEST_PIPELINE_VERSION = 4`。
- `GM_ENHANCEMENT_HUB_VERSION = 4`。
- `enhancementgm.js` 已刪除。

---

# 12. 遊戲說明與完整性檢查

- `GAME_GUIDE_VERSION = 10`。
- 「冒險入門」正式說明普通怪、菁英怪與 Boss 都可單場／連續戰鬥。
- Boss 說明包含：首殺解鎖下一張地圖、連戰可留在原地繼續刷王、戰敗立即停止並需重新擊敗菁英 10 隻。
- 「特殊遭遇」仍明確說明 Boss 不會觸發特殊怪。
- 「離線收益」新增獨立備註區塊，說明 Boss 不作為離線刷怪目標；若最後進行 Boss 戰鬥，沿用最近一次有效的普通怪／菁英怪紀錄。
- 「角色與裝備」目前只保留兩個強化相關項目：
  - 裝備欄位強化：說明五欄永久強化、更換／遺失不消失、正式最高 +20。
  - 強化石：說明可由主線、部分裝備出售、離線取得；離線只少量基礎石；10級差限制；特殊怪與副本不直接掉石。
- 原本獨立的「離線強化石」項目已併入「強化石」。
- 玩家指南不再列每級2.5%、每種怪幾顆、出售幾顆、離線5%等過細計算規格；這些仍保留在程式／handoff 技術規則中。

完整性檢查現在分三層：

1. `enhancementmigration.js`：只驗新舊存檔與 enhancement normalization 相容性，輸出 `ENHANCEMENT_INTEGRITY_REPORT`。
2. `enhancementintegrity.js`：集中驗證強化核心、成本、掉石、出售、離線、戰鬥能力、UI owner、GM owner、指南與戰鬥摘要，輸出 `ENHANCEMENT_FINAL_INTEGRITY`。
3. `bosscontinuousintegrity.js`：集中驗證 Boss 單場／連戰共用模式、取消舊單場強制、戰敗鎖王／歸零、連戰死亡停止、同目標續戰、Boss 特殊怪排除、background catch-up 排除、離線不產生 Boss 進階石、共用結算與 Guide v10 文案，輸出 `BOSS_CONTINUOUS_INTEGRITY`。

`runtimeintegrity.js` 會要求 `ENHANCEMENT_FINAL_INTEGRITY.passed === true` 與 `BOSS_CONTINUOUS_INTEGRITY.passed === true`，再和全專案世界、Save12、VIP、專精、每日、副本、虛空、退休商店、特殊怪 payout、Guide v10 等檢查一起形成 `PROJECT_RUNTIME_REPORT`。

已移除歷史 marker：`ENHANCEMENT_UI_SUCCESS_ALERT_DISABLED`、`ENHANCEMENT_UI_UNIFORM_GRID`。現在直接以正式 UI version／DOM style absence／owner API 做回歸檢查。

---

# 13. 強化四批正式化（2026-09-15）

## 第 1 批：核心 owner 正式化

- enhancement 初始 state 直接進 `newState()`。
- enhancement normalization 直接進正式 migration pipeline。
- `rawEquippedStats()`／`equippedStatsWithEnhancementLevels()`／`equippedStats()` 正式化。
- 移除 `newState()`、`migrateSave()`、`equippedStats()` 的 enhancement late wrapper。

## 第 2 批：強化石取得與出售資料流

- 主線掉石正式進 `combatcore.js`。
- 出售發石集中 `equipmentlock.js`。
- 單件／一鍵／AUTO／換裝 AUTO 共用 sale reward API。
- 戰鬥摘要直接使用實際發放回傳值，不重算、不 double grant。
- `enhancementrewardintegration.js` 刪除。

## 第 3 批：離線與線上理論產量共用

- 菁英 70/30 機率表集中 `enhancementrewards.js`。
- `expectedMainlineEnhancementStoneReward()` 成為唯一理論產量來源。
- 離線移除手寫 `1.3`，只套正式期望值 ×5%。

## 第 4 批：UI／GM／舊檔／Integrity 收尾

- 強化 route 正式進 `ui.js`。
- 確認 modal 實際主能力列正式進 `enhancementui.js`。
- enhancement CSS／GM enhancement grid CSS 移到 `functionuipolish.css`。
- GM 強化狀態正式進 `vipgm.js`，管理／測試 UI 正式進 `gmhub.js`。
- 指南精簡並合併離線強化石項目。
- Integrity 拆成存檔相容 probe＋集中 enhancement integration probe。
- 刪除 `enhancementnav.js`、`enhancementgm.js`、`enhancementfinalize.js`。

## Boss 連戰三批正式化（2026-09-15）

### 第 1 批：主線核心共用

- `ui.js` 移除 Boss 只能單場的三個限制，Boss 正式使用既有 continuous pipeline。
- Boss 戰敗沿用原 `bossLocked=true`、`bossProgress=0` 與死亡懲罰；pipeline 在該場失敗後立即停止。
- Boss 保留特殊怪硬排除。
- `backgroundprogress.js` 新增 Boss 主線背景補進度排除，避免切背景時自動補刷 Boss。
- Save Schema 不變。

### 第 2 批：Guide／玩家說明

- `GAME_GUIDE_VERSION` 升為 10。
- Boss 與戰鬥模式文字改為可單場／連續。
- 離線收益補上 Boss 排除與沿用最近普通／菁英有效紀錄的備註區塊。
- Guide 備註只用排版／邊框／淡背景區隔，不另外改文字顏色。

### 第 3 批：Integrity／交接

- 新增 `bosscontinuousintegrity.js`。
- `index.html` 在 `runtimeintegrity.js` 前載入 Boss 專屬 Integrity。
- `runtimeintegrity.js` 正式要求 `BOSS_CONTINUOUS_INTEGRITY.passed === true`，並把 Guide 基準更新到 v10。
- `PROJECT_HANDOFF.md` 正式更新 Boss 連戰、背景／離線排除、Guide v10 與 Integrity 規則。

---

# 14. 正式背景圖製作與預載 SOP

原始母圖：

```text
assets/backgrounds-source/<功能名稱>/
```

正式 Runtime 圖：

```text
assets/backgrounds/<功能名稱>/
```

強化頁：

```text
assets/backgrounds-source/enhancement/desktop.PNG
assets/backgrounds-source/enhancement/mobile.PNG
            ↓
assets/backgrounds/enhancement/desktop.webp
assets/backgrounds/enhancement/mobile.webp
```

正式轉換規格：GitHub Actions、Ubuntu runner、Python 3.12、Pillow、RGB、Desktop 最大寬1536、Mobile最大寬1080、LANCZOS、WebP quality=72、method=6。

- 正式場景背景 URL 統一由 `backgrounds.css` 管理。
- `backgrounds-source` 只保存母圖，不作 Runtime 背景。
- `backgroundpreload.js` 掃描目前 viewport 有效 CSS media rules，只預載 `/assets/backgrounds/`、排除 `/backgrounds-source/`，使用 `Set` 去重與 `new Image()`，最多等 12 秒。
- 強化正式 selector：`#main>.enhancement-page`。
- 同名 WebP 重製後必須 bump `backgrounds.css` URL query。
- 一次性轉換 workflow 成功、驗證、輸出進 main 後刪除；source 母圖保留。

---

# 15. 目前仍可再優化，但不要順手亂改

本輪 enhancement A/B 優先度整理已完成。仍存在的其他專案級技術債不代表強化功能有錯：

- `offlineprogress.js` 本身仍含 inline offline modal styles，這是既有離線 UI 架構，不是 enhancement wrapper。
- `gmhub.js` 本身仍以 JS 建立 GM Hub 通用 styles，這是 GM Hub 既有 ownership；本輪只把 enhancement 專屬 grid CSS 移出 enhancement JS。
- `enhancementcombat.js` 仍保留相容 helper 名稱，但不再覆寫正式 `equippedStats()` owner。
- 真機瀏覽器行為仍以實測為重要依據；若出現 stale JS/CSS／背景，先檢查 cache-bust，再考慮其他原因。

---

# 16. 已退休／不得從舊資料恢復

- 裝備商店商品系統、商店刷新／價格重置、Boss 首殺免費刷新、黑市降低商店成本、`state.shop`。
- `shopbalance.js`、`shopretirement.js`。
- `inventoryredemption.js`。
- `blackmarketsettlement.js`。
- 舊共享副本 `progress / attempts / activeRun / points`。
- 舊 VIP `1000 × Lv²`。
- 專精 Lv30 上限。
- 虛空逐層首通 VIP 積分、虛空最高5000層、`getVoidMirageNextFloor`、`voidMirageFirstClearPoints`、`VOID_MIRAGE_GM_UI_V2`。
- `continuousbattle.js`。
- 舊 `dungeonvoidgmui.js`。
- 強化離線 `enhancementoffline.js` DOM Observer／文字解析 workaround。
- `enhancementrewardintegration.js`。
- `enhancementnav.js`。
- `enhancementgm.js`。
- `enhancementfinalize.js`。
- 強化 UI／GM 以 JS 注入專屬 CSS 的做法。
- GM 自己複製一套強化主能力公式的做法。
- 出售強化石多層 wrapper 重複 grant 的做法。
- Boss 固定只能單場挑戰的舊規則。

---

# 17. 下一個對話如何接手

可直接貼：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際相關程式碼與 `index.html` 載入順序，完整承接《文明戰線》專案。`main` 是唯一真實來源；若 handoff 與 main 衝突，以 main 為準。現在先不要修改。**

若直接要求修改，也先讀 handoff＋相關 main，再依第2節規範執行，不需要使用者重新解釋已寫入 handoff 的正式規則。
