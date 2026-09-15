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

`backgroundprogress.js` 的 background 指瀏覽器進入背景／失焦後的執行補償，**不是圖片背景 loader**，不可誤刪。正式圖片背景預載是 `backgroundpreload.js`。

---

# 2. 下一個 ChatGPT 修改專案時的固定操作規範

1. **修改前一定重新讀取 GitHub `main` 的相關實際檔案。**不能只靠本文件或聊天記憶。
2. 涉及載入順序、wrapper、全域函式時，必須重新檢查完整 `index.html`。
3. 使用者說「先討論／先不要修改／先檢查」時，**禁止寫入 GitHub**，只分析與回報。
4. 使用者明確說「做／修改／執行／第 N 批」時，可直接修改 GitHub `main`，不必再重複詢問授權。
5. 修改完成後要重新讀取修改後的 `main` 檔案，確認實際內容、載入順序與相依性；不能只相信寫入回傳成功。
6. **JS/CSS 有正式改動時，同步更新 `index.html` 對應 cache-bust query。**若同名正式背景 WebP 被重新產生，`backgrounds.css` 的背景 URL query 也要 bump。
7. 不做需求以外的順手重構，不偷偷改平衡、不偷偷改離線目標、不偷偷改存檔語意。
8. 優先修改真正的正式 owner／正式來源。**不要為了省事再新增 late wrapper、fallback、第二套公式、DOM 文字解析或第二套結算。**若既有功能已有正式入口，直接整併進該入口。
9. 若暫時必須使用 wrapper，要清楚標記技術債，並在正式化批次移除；不要讓兩套來源永久共存。
10. 任何存檔結構改動都要同步檢查 `data.js`、`savemigration.js`、相關 normalizer、`runtimeintegrity.js` 與舊存檔相容性。
11. 桌機與手機 UI 必須一起檢查。
12. 裝備規則特別注意：神話裝備只禁止**AUTO 自動出售**；未鎖定神話仍可被玩家手動單件出售／一鍵出售，不得誤加全面保護。
13. 一次性 GitHub Actions workflow 若只是資產轉換或維護工具：完成、驗證輸出進 `main` 後應刪除 workflow；不要因正式 repo 看不到 workflow 就誤判過去不是用 Actions 製作。

---

# 3. 世界、主線與核心角色能力

- 世界共 10 區、100 張地圖，Lv1～500。
- 地圖由 `registerRegionMaps()` 依固定 region/index 註冊，不依 script push 順序決定位置。
- 普通怪／菁英怪依進度逐步解鎖。
- Boss 固定單場挑戰，不開放連續 Boss。
- 首次擊敗 Boss：只解鎖下一張主線地圖。
- Boss 挑戰失敗後會鎖定再挑戰，需重新擊敗該地圖菁英怪 10 隻。
- 商店已退休，Boss 首殺沒有商店刷新副作用。

`engine.js` 目前正式基礎能力：

- `baseHP(l) = ceil(110 + 12 × (l-1))`
- `baseATK(l) = ceil(15 + 2.2 × (l-1))`
- `baseDEF(l) = ceil(7 + 1.2 × (l-1))`
- VIP 每級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25 percentage point、閃避 +0.25 percentage point。
- `playerCombatStats()` 的順序是：先取得裝備／基礎能力，再套 VIP；強化系統在裝備能力派生階段只補主能力差額。

---

# 4. 商店系統已正式退休

2026-09-14 起原裝備商店完整退休：

- 首頁無商店入口、無商店頁、無商品購買、無刷新／刷新價格／價格重置／冷卻。
- `shopbalance.js`、`shopretirement.js` 已刪除。
- 正式新存檔不含 `state.shop`。
- Schema 12 migration 會移除舊 `shop`。
- Runtime Integrity 的 v11→v12 probe 會驗證舊 `shop` 被移除且 `lostGear` 關鍵資料保留。
- 正式 runtime 不應恢復 `newShopState`、`ensureShop`、`paidShopRefresh`、`freeShopRefresh`、`shopPurchase`、`resetShopPrice`、`specialApplyShopDiscount` 等舊 API。
- `assets/backgrounds/inventory-shop/` 仍保留，現在只作為背包背景；資料夾名稱是歷史命名。

---

# 5. 裝備、背包、鎖定與出售

正式部位：`weapon / helmet / armor / shoes / accessory`＝武器／頭盔／鎧甲／鞋子／飾品。

主能力：

- 武器：ATK，`ceil((3 + 1.55×level) × qualityMultiplier)`
- 頭盔：HP，`ceil((8 + 2.5×level) × qualityMultiplier)`
- 鎧甲：DEF，`ceil((1 + 0.65×level) × qualityMultiplier)`
- 鞋子：HP，與頭盔同公式
- 飾品：CRIT，不吃 level／品質倍率，依品質區間 `[1–2],[2–3],[3–5],[5–7],[7–9],[9–10]` 隨機。

詞條池：

- weapon：atk / crit / hp
- helmet：hp / def / dodge
- armor：def / hp / dodge
- shoes：dodge / def / hp
- accessory：crit / atk / hp / dodge

`equipmentScore(it)` 仍是**原始裝備評分**：`round1(atk×5 + def×5 + hp + crit×rateWeight + dodge×rateWeight)`，`rateWeight = 20 + 0.5×itemLevel`。**強化不改 item aggregate stats、`mainStat.value` 或 equipmentScore。**

背包目前負責查看、比較、裝備、鎖定／解鎖、單件出售、一鍵裝備、一鍵出售、遺失裝備贖回。

- 鎖定裝備不會被手動出售、一鍵出售或 AUTO 出售。
- 神話 q5 永遠不 AUTO 出售；未鎖定神話仍可手動單件確認出售，也可進入玩家主動的一鍵出售條件。
- 遺失裝備資料在 `state.lostGear`，不是商店資料；可贖回或永久放棄。
- 贖回 UI 已正式整併 `ui.js`；`inventoryredemption.js` 已刪除。

---

# 6. 九大特殊怪與黑市情報

特殊遭遇基礎 8%；VIP6+ 為 10%。九大特殊怪：

1. 稀有資源聚合體：EXP×0.5、金幣×6、不掉裝備。
2. 誘餌補給艙：必掉 1 件，稀有以上品質表 65/27/7/1。
3. 終止協議單元：EXP×4、金幣×4、必掉裝備；史詩65%、傳說30%、神話5%。
4. 機率增幅信標：EXP×0.8、金幣×0.8、必掉 1 件，一般品質表。
5. 封存警戒機：EXP×4、金幣×0.5。
6. 裝備保全單元：必掉，優先弱槽位；普通10%、優良35%、稀有35%、史詩16%、傳說4%。
7. 黑市武裝頭目：金幣×2.5，並取得一次黑市情報。
8. 戰利品回收者：必掉 2 件。
9. 流動交易代理人：隨機財富（金幣×5）、知識（EXP×5）或至少稀有裝備。

特殊怪 EXP／金幣專精只在 payout 層各套一次；Runtime Integrity 有 probe 防止重複乘算。

黑市情報：`state.pendingBlackMarketEncounter=true`。下一次符合一般特殊遭遇條件的主線普通／菁英勝利 100% 觸發特殊怪，排除 `bandit_king`；Boss、不合條件或戰敗不消耗。情報在強制特殊戰鬥完成後才清除並存檔。VIP10 若黑市武裝頭目獎勵重複發動，只再給同公式金幣，不給第二份情報。

黑市結算提示已整併 `settlementui.js`；`blackmarketsettlement.js` 已刪除。

---

# 7. VIP 與專精

VIP：

- 上限 20。
- 門檻：`2500 × VIP level²`；VIP1=2,500，VIP20=1,000,000。
- VIP4+ 副本 VIP 積分 ×1.1；VIP12+ ×1.2。
- VIP6 特殊遭遇 8%→10%。
- VIP10 特殊怪獎勵 10% 再發動；黑市頭目只重複金幣。
- VIP20 防止死亡裝備遺失，EXP 懲罰仍依規則。

8 種專精、各 Lv60：

- training 實戰訓練：EXP +2.5%／Lv
- scavenge 搜刮：怪物金幣 +2.5%／Lv
- appraisal 鑑價：出售價 +2.5%／Lv
- initiative 先制：第一次主動攻擊傷害 +1%／Lv
- combo 連擊：率 +0.5%／Lv，追加 50% 傷害
- penetration 穿透：率 +0.5%／Lv，忽略 25% DEF
- counter 反擊：率 +0.5%／Lv，反擊 40% 傷害
- drain 汲取：率 +0.5%／Lv，回復實際傷害 10% HP

升級到目標 level 的費用：`1000 × level²`。

---

# 8. 每日副本

每日系統依 UTC+8 日曆日、凌晨 0 點重置。

- 懸賞：每天最多 20 場真正開始的戰鬥；Lv5 解鎖。普通45%（EXP×5、金幣×5、2件）、高級35%（×8、×8、3件）、危險20%（×12、×12、5件），裝備最低稀有。
- 競技場：Lv15 解鎖；每天最多開始20輪；每輪3戰，中間不回血；10階。第1～3階基礎總積分普通50／困難100／極限150，第4階起每階+60，第10階470／520／570。VIP 倍率只對整輪基礎積分套一次。戰力評估500次、通過目標485。
- 虛空幻境：Lv25 解鎖；沒有最高層；起始 `max(1, 歷史最高-100)`；每10層Boss；歷史最高永久保存；每日基礎獎勵＝當日最高層×2 VIP積分，每日只能領一次。
- 主線與離線收益不增加副本額度／進度。
- 副本怪物不直接掉強化石。

---

# 9. 裝備欄位強化系統（2026-09-15 正式新增）

## 9.1 持久狀態與核心規則

正式狀態：

```text
state.enhancement = {
  basicStones,
  advancedStones,
  levels: { weapon, helmet, armor, shoes, accessory }
}
```

- 五個欄位各自永久強化，+0～+20。
- 更換裝備、死亡遺失裝備、欄位暫時為空，都不會失去欄位強化等級。
- 每級只提高**目前裝備原始主能力** 2.5%。
- `enhancedMain = originalMain × (1 + enhancementLevel × 0.025)`。
- +20 = +50%。
- 不乘基礎能力、不乘 affix、不乘專精、不乘 VIP、不乘其他來源。
- 飾品主暴擊同樣線性強化；例如原始10%在+20為15%。沒有額外飾品 nerf。
- HP／ATK／DEF 最終 UI／戰鬥整數處理沿既有規則；crit/dodge 顯示一位小數。
- 強化不修改裝備物件原始 `mainStat.value`、aggregate stats 或 `equipmentScore()`。

`enhancementcombat.js` 現在提供共用 `equippedStatsWithEnhancementLevels(levels)`：正式遊戲傳正式 levels；GM 測試可傳任意測試 levels，**共用同一套強化公式**，避免 GM 第二套公式與正式公式漂移。

## 9.2 成本與資源

- 基礎強化石、進階強化石是 `state.enhancement` 的數量 counter，不是背包 item，不占格、不出售、不遺失、無上限。
- 強化只花石頭，不花金幣。
- 100% 成功，沒有失敗、降級、爆裝、保護機制。
- 強化到目標 +N：基礎 `100×N`，進階 `5×N`。
- +1=100/5；+10=1000/50；+20=2000/100。
- 單一欄位 +0→+20 累積 21,000 基礎 +1,050 進階。
- 五欄全滿共 105,000 基礎 +5,250 進階。**5,250 進階是已確認正式數字，不要自行降低。**

## 9.3 主線強化石掉落

只由主線 normal / elite / boss 直接掉落：

- normal：固定 1 基礎。
- elite：70% 1 基礎、30% 2 基礎，EV=1.3。
- boss：固定 1 進階。
- 特殊怪、懸賞、競技場、虛空不直接掉強化石。

等級差限制：`playerLevel - monsterLevel < 10` 才有石頭。也就是**玩家高於怪物10級（含）以上時，不會掉落強化石。**只抑制強化石，不影響 EXP／金幣／其他獎勵。例：Lv115 打 Lv105 無石；Lv106 有資格；Lv500 有效怪物 Lv491～500。

## 9.4 出售裝備取得強化石

所有「實際完成出售」路徑都應由正式出售流程發獎：

- q4 傳說：正常金幣 +5 基礎強化石。
- q5 神話：正常金幣 +1 進階強化石。
- 裝備 level 不影響石頭。
- 不受怪物等級差限制。
- 單件手動、一鍵出售、AUTO-sell 都適用。
- `equipmentlock.js` 是目前正式出售發獎 owner；`enhancementrewardintegration.js` 只補主線掉石整合與單件出售玩家可見訊息，不應再新增第二次出售發獎。
- 已修正過的重大 bug：早期 wrapper 可能讓出售強化石重複發放；現在出售發獎集中於正式出售路徑，避免 double grant。
- 神話仍只禁止 AUTO-sell；玩家主動出售規則保持不變。

## 9.5 強化頁 UI

首頁排列目前為：

- 冒險｜角色
- 背包｜強化
- 專精｜副本
- 遊戲說明｜設定

強化副標：`永久提升裝備欄位主能力`。

強化頁：

- 顯示基礎／進階強化石。
- 顯示總進度 X/100。
- 五張欄位卡，顯示 +N/20、目前裝備或空欄、原始主能力、目前實際主能力、下一級預覽、成本。
- 空欄仍可強化。
- +20 顯示 MAX。
- 點強化後先開**自製遊戲 modal 二次確認**，第一次點擊不扣資源。
- modal 顯示欄位、目前→下一級、加成%、成本；若有裝備，`enhancementfinalize.js` 會補「實際主能力目前→下一級」。
- 最終確認會重新檢查等級與資源，再原子扣款；取消不改資料。

目前 `enhancementui.js` 仍以 JS 注入自身樣式；`enhancementnav.js` 仍是首頁／render 的 late override。這兩點屬**尚可再正式化的技術債**，不要誤以為已完全整併進 `ui.js`／正式 CSS。

## 9.6 舊存檔相容

- `enhancementcore.js` 的 `normalizeEnhancementState()` 會重建合法結構：石頭非負整數、五欄 levels clamp 0～20。
- 舊存檔沒有 enhancement 時，自動得到 0 石、五欄 +0。
- `enhancementmigration.js` 包住正式 migrate 後做 enhancement normalization。
- 強化是 additive state，**目前沒有因此提高 SAVE_VERSION；仍為 12。**
- 強化不新增第5個正式 newState normalizer；正式 normalizer count 仍是4。
- 舊裝備只要有既有 `mainStat` 就可直接套欄位強化，不需改裝備 schema。

---

# 10. 離線收益與強化石（已完成第一批正式化）

- 最多12小時；最短1分鐘。
- EXP／金幣／裝備約在線10%。
- 強化基礎石效率 5%。
- 不取得 Boss 進階石，因離線合法目標不含 Boss。
- normal 理論1基礎／戰；elite 理論EV1.3／戰。
- **整段離線先合計理論量，再 `floor(total×0.05)`；不是每場先 floor。**
- 使用與在線相同的10級差資格，只有石頭被抑制。
- 離線出售 q4/q5 裝備也會依正式出售石頭規則累計 secondary reward。

2026-09-15 已完成重要 bug／架構修正：早期 `enhancementoffline.js` 曾用 `MutationObserver`、解析 `.offline-battle-count`／`.offline-enemy-line`、攔 `specializationSellValue` 等 DOM／modal workaround 推算強化石。**這套做法已被正式淘汰。**目前強化石直接在 `offlineprogress.js` 的離線 settlement 中計算與發放，不應恢復 DOM 文字解析版。

重要既有行為：`resolveFarmTarget()` 目前優先使用最新合法 `battleSamples` 的 map/enemy，再 fallback `farmMap/farmEnemy`；**它不是自動搜尋「最高已解鎖非 Boss」。**這是目前 main 的既有行為，除非使用者明確決定改，不能順手變更。

---

# 11. GM 管理與測試（含強化）

既有 GM Hub 保留 VIP、專精、主線／特殊怪／副本測試等功能。

強化 GM：

- 「強化管理」：五個下拉選單，武器／頭盔／鎧甲／鞋子／飾品，各 +0～+20。套用後直接修改正式 `state.enhancement.levels` 並存檔；**不消耗／不改變目前強化石數量。**
- 「強化測試」：五個 +0～+20 下拉，只存在本次頁面工作階段；不消耗石、不改正式角色資料，重新整理回 +0。
- GM 測試 levels 在 `window.gmTestEnhancementLevels`。
- 既有單一「目前狀態」按鈕現在會同步：正式 VIP → 測試 VIP、8種正式專精 → 測試專精、5欄正式強化 → 測試強化。**不要新增第二顆強化專用目前狀態按鈕。**
- 所有既有 GM 戰鬥測試透過 `gmTestPlayerStats()` 取得玩家測試快照，現在會同時套用測試 VIP＋專精＋強化。
- `gmTestEnhancedEquippedStats()` 使用 `equippedStatsWithEnhancementLevels(levels)`，因此正式與 GM 強化共用一套裝備主能力計算。

目前技術債：`enhancementgm.js` 仍會 wrap `gmUseCurrentTestStatus`、覆寫 `gmTestPlayerStats`、wrap `gmHtml()` 注入區塊，並在 JS 注入 GM 強化樣式。核心公式已共用，但 UI ownership 尚未完全整併進 `gmhub.js`。未來若整理，應直接正式化 owner，而不是再加第三層 wrapper。

---

# 12. 遊戲說明與 Runtime Integrity

- `GAME_GUIDE_VERSION = 8`。
- 強化說明已正式寫入 `gameguide.js` 的「角色與裝備」，不再由 `enhancementfinalize.js` late wrapper 動態插入。
- 正式說明包含：欄位強化 +20／每級2.5%、強化石主線掉落與10級差、q4/q5出售石、離線5%基礎石。
- 遊戲說明不得恢復商店商品、刷新、Boss 免費刷新商店、前往商店贖回、黑市降低商店費用等舊規則。

`runtimeintegrity.js` 已正式納管強化核心，會檢查至少：

- 強化上限20。
- 每級2.5%。
- +20成本2000基礎／100進階。
- Lv115 vs Lv105/106 的10級差邊界。
- q4出售5基礎、q5出售1進階。
- `equippedStatsWithEnhancementLevels()` 存在。
- GM 強化測試 API 存在。
- Game Guide 必須包含強化正式規則。
- 既有 Save schema12、世界、VIP、專精、每日、副本、虛空、退休商店、migration、特殊怪 payout 等檢查維持。

`enhancementmigration.js` 另有 `ENHANCEMENT_INTEGRITY_REPORT`；`enhancementfinalize.js` 目前仍保留 `ENHANCEMENT_FINAL_INTEGRITY` 額外回歸檢查。這是目前 main 的雙保險，不要誤刪；若未來要合併，需先確認 Runtime Integrity 已完整覆蓋。

正式 runtime 報告：`PROJECT_RUNTIME_REPORT = { passed, clean, errors, warnings, checkedAt }`。

---

# 13. 正式背景圖製作與預載 SOP（重要，未來新增任何背景必讀）

這一節是 2026-09-15 新增強化頁背景時，經多次嘗試後確認與既有背景一致的**正式標準流程**。這次曾一度走錯成其他 WebP 轉換／Runtime source PNG 路徑；最後才確認以下流程才是本專案既有背景的正確做法。未來不要重新研究或自行換另一套轉檔方式。

## 13.1 資料夾 ownership

原始母圖：

```text
assets/backgrounds-source/<功能名稱>/
```

正式 Runtime 圖：

```text
assets/backgrounds/<功能名稱>/
```

強化頁實例：

```text
assets/backgrounds-source/enhancement/desktop.PNG
assets/backgrounds-source/enhancement/mobile.PNG
            ↓ 轉換
assets/backgrounds/enhancement/desktop.webp
assets/backgrounds/enhancement/mobile.webp
```

**母圖不可直接成為 Runtime 背景。**`backgrounds-source` 是保存／再輸出的來源；正式遊戲只引用 `assets/backgrounds/` 下的壓縮 WebP。

## 13.2 Desktop／Mobile 原圖

- Desktop、Mobile 各自準備一張原始圖。
- 兩張母圖都保留在 `backgrounds-source/<page>/`。
- 正式遊戲引用各自轉換後 WebP。
- Desktop／Mobile 是獨立構圖，不應把同一張圖只靠 CSS 裁切當成兩版。
- 背景整體仍以 `background-size: cover` 運作，因此構圖需預留 UI 空間與安全裁切區。

## 13.3 正式 WebP 轉換規格

**必須沿用這次確認的既有背景轉換方式：**

- GitHub Actions
- Ubuntu runner
- Python 3.12
- Pillow
- `Image.open(...)`
- `.convert("RGB")`
- Desktop 最大寬度：1536
- Mobile 最大寬度：1080
- 只有超過最大寬度才依比例縮放
- resize：`Image.Resampling.LANCZOS`
- WebP：`quality=72`
- WebP：`method=6`

強化正式輸出曾驗證：

- desktop.webp：148,264 bytes；blob SHA `7154c31add6ebeee88d121c215320278306a684e`
- mobile.webp：149,782 bytes；blob SHA `7a08b282963e6b4fe65793dfd2bfb65e6382106b`

這些 SHA 只記錄本次強化圖的既有輸出，不代表未來重製後仍必須相同；若重新產圖，應以新 main 為準並 bump cache query。

## 13.4 CSS 正式 owner

- **所有正式場景背景 URL 統一由 `backgrounds.css` 管理。**
- JS 不應另外為同一頁注入 background URL。
- 強化頁目前正式 selector：`#main>.enhancement-page`。
- Desktop：`assets/backgrounds/enhancement/desktop.webp?v=20260915-enhancement-desktop1`
- Mobile：`assets/backgrounds/enhancement/mobile.webp?v=20260915-enhancement-mobile1`
- 這與首頁、冒險、角色、背包、副本等背景架構一致。

曾經的錯誤做法：`enhancementfinalize.js` 動態注入 source PNG 背景。**已移除，不得恢復。**

## 13.5 預載流程

不是進到強化頁才載入。玩家一進網站，`backgroundpreload.js` 會與其他正式背景一起處理：

1. 掃描 `document.styleSheets`。
2. 遞迴掃描 CSS rules。
3. 遇到 media query 時，用 `matchMedia()` 只處理目前 viewport 有效的 Desktop／Mobile 規則。
4. 解析有效 rule 的 `background-image` URL。
5. 只收錄 pathname 含 `/assets/backgrounds/` 的正式資產。
6. 明確排除 `/backgrounds-source/`。
7. 使用 `Set` 去除重複 URL。
8. 每張以 `new Image()` 預載，`decoding="async"`。
9. 顯示背景載入進度。
10. 等全部完成，或最多等待 12,000ms。
11. 設 `BACKGROUND_PRELOAD_READY=true`，解除 body 的 `background-preloading` 並顯示遊戲。
12. 收集結果可由 `BACKGROUND_PRELOAD_URLS` 檢查。

`index.html` 的 `backgroundpreload.js` 必須維持在足以讀到正式 stylesheets 的載入位置；目前在 script 最後。

## 13.6 為什麼不能直接用 source PNG

- `backgrounds-source` 是母圖保存區，不是正式 Runtime 資產區。
- Runtime 直接用 PNG 會繞過本專案既有正式背景資產管理慣例。
- 預載器刻意排除 `/backgrounds-source/`。
- PNG 通常增加初次載入量。
- 會讓 CSS ownership、快取與資產輸出流程變得不一致。

## 13.7 一次性轉換 workflow

正式操作模式：

```text
建立一次性 GitHub Actions workflow
→ Actions 以 Python/Pillow 轉換
→ 驗證輸出成功
→ 確認 desktop.webp / mobile.webp 已進 main
→ 確認 backgrounds.css 正式引用
→ 確認 preload 能收錄
→ 刪除一次性 workflow
→ 保留 source 母圖
```

強化頁這次曾建立一次性 workflow，成功 run ID：`34930590973`；workflow 建立 commit `57c73b...`，刪除後 commit `f8ac866...`。workflow 被刪除是**刻意的正常流程**，不是遺失工具。

## 13.8 母圖保留與 cache-bust

- WebP 成功後，`backgrounds-source` 的 Desktop／Mobile PNG **不要刪**。
- 母圖是未來重新壓縮、改尺寸、重新輸出的來源。
- 刪的是一次性 workflow，不是母圖。
- 若重新產生同名 `desktop.webp`／`mobile.webp`，必須同步 bump `backgrounds.css` URL query，例如 `?v=20260915-enhancement-desktop1` → 新版本，避免瀏覽器／CDN 顯示舊圖。

## 13.9 未來新增背景的固定順序

**產生 Desktop/Mobile 母圖 → 放 `assets/backgrounds-source/<page>/` → 用 GitHub Actions + Python3.12 + Pillow（RGB、1536/1080、LANCZOS、WebP quality72 method6）轉 WebP → 輸出 `assets/backgrounds/<page>/` → `backgrounds.css` 加 Desktop/Mobile selector 與 cache query → 確認 `backgroundpreload.js` 自動收錄／`BACKGROUND_PRELOAD_URLS` → 檢查桌機與手機畫面 → 確認 main 輸出 → 刪除一次性 workflow → 保留母圖。**

---

# 14. 本輪強化系統四批優化已完成的重點

1. **離線正式化**：強化石直接整合 `offlineprogress.js` settlement，淘汰 DOM MutationObserver／文字解析 workaround。
2. **出售發獎正式化**：出售強化石集中在正式 equipment sale 流程，避免 wrapper 重複發獎；單件／一鍵／AUTO 都有一致 secondary reward 規則與玩家可見訊息。
3. **GM／公式正式化**：新增共用 `equippedStatsWithEnhancementLevels(levels)`，正式與 GM 測試不再各算一套強化主能力；GM 測試不污染正式 enhancement state。
4. **Guide／Integrity 正式化**：強化說明直接進 `gameguide.js`；移除 guide late wrapper；`runtimeintegrity.js` 正式檢查強化核心與 GM API。

注意：這四批解決的是上述高風險問題，不代表所有 enhancement 檔都已完全零 wrapper。`enhancementnav.js`、`enhancementgm.js`、`enhancementfinalize.js` 的部分 late ownership 與 JS inline styles 仍存在，列入下一節技術債。

---

# 15. 尚未完成／可再優化項目

目前 main 已可運作，但下一個對話若要繼續結構清理，優先檢查：

- `enhancementnav.js` 仍 wrap `homePage`／`render`；長期應考慮把強化入口與 render case 正式整併 `ui.js`，再刪 wrapper。
- `enhancementgm.js` 仍 wrap `gmHtml`／`gmUseCurrentTestStatus` 並覆寫 `gmTestPlayerStats`；核心公式已共用，但 GM UI ownership 尚未完全進 `gmhub.js`。
- `enhancementui.js`、`enhancementgm.js` 仍以 JS 注入大段 CSS；可在不改視覺的前提下移入正式 stylesheet，但必須同步 cache-bust。
- `enhancementfinalize.js` 仍 wrap `openEnhancementConfirm` 來補實際主能力列，且仍保留獨立 `ENHANCEMENT_FINAL_INTEGRITY`；未來可考慮直接把確認列整併 `enhancementui.js`，並在 Runtime Integrity 覆蓋完整後再決定是否刪重複 integrity。
- 強化新 state 目前透過 `enhancementcore.js` wrap `newState()`、`enhancementmigration.js` wrap `migrateSave()`，且刻意不增加第5個 normalizer。這是目前 main 實況；若未來正式整併，必須保持舊存檔相容與 normalizer count 4，除非使用者明確同意 schema 架構改版。
- `offlineprogress.js` 本身仍含 inline offline modal styles，這是既有架構，不是本輪強化新增技術債；不要在無關需求中順手改。
- 真機瀏覽器行為仍以使用者實測為重要依據；背景流程本輪主要做 source／Actions／程式碼驗證，若之後出現 stale image，先檢查 cache query，而不是重做整套背景架構。

---

# 16. 已退休／不得從舊資料恢復

- 裝備商店商品系統、商店刷新／價格重置、Boss 首殺免費刷新、黑市降低商店刷新成本、`state.shop`。
- `shopbalance.js`、`shopretirement.js`。
- `inventoryredemption.js`（已整併 `ui.js`）。
- `blackmarketsettlement.js`（已整併 `settlementui.js`）。
- `shopRefreshDown`。
- 舊共享副本 `progress / attempts / activeRun / points`。
- 舊 VIP `1000 × Lv²`。
- 專精 Lv30 上限。
- 虛空逐層首通 VIP 積分、虛空最高5000層、`getVoidMirageNextFloor`、`voidMirageFirstClearPoints`、`VOID_MIRAGE_GM_UI_V2`。
- `continuousbattle.js`。
- 舊 `dungeonvoidgmui.js`。
- 強化離線的 `enhancementoffline.js` DOM Observer／文字解析 workaround。
- JS 動態引用 `assets/backgrounds-source/enhancement/*.PNG` 作 Runtime 背景的做法。
- GM 自己複製一套強化主能力公式的做法。
- 出售強化石在多層 wrapper 重複 grant 的做法。
- 強化遊戲說明由 `enhancementfinalize.js` 字串搜尋後動態插入的做法。

---

# 17. 下一個對話如何接手（標準指令）

可直接在新對話貼：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際相關程式碼與 `index.html` 載入順序，完整承接《文明戰線》專案。`main` 是唯一真實來源；若 handoff 與 main 衝突，以 main 為準。現在先不要修改，先告訴我你已讀到的目前正式狀態、重要技術債與下一步可處理項目。**

若使用者在新對話直接要求某項修改，則仍先讀 handoff＋相關 main，再依本文件第2節操作規範執行；不需要要求使用者重新解釋已寫入 handoff 的正式規則。
