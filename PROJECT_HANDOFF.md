# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit、模型記憶或任何摘要與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。本文件是交接索引與目前規則摘要，不可取代實際程式碼檢查。

更新日期：**2026-09-16**

---

# 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 架構：純前端 HTML / CSS / JavaScript + `localStorage` + Supabase Auth / Database
- 正式存檔 key：`frank_text_rpg_save`
- `SAVE_VERSION = 12`
- `SAVE_SCHEMA_VERSION = 12`
- `SAVE_LOAD_PIPELINE_VERSION = 2`
- `VIP_PROGRESSION_VERSION = 12`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 60`
- `ENHANCEMENT_MAX_LEVEL = 20`
- `CIVILIZATION_AUTH_VERSION = 6`
- `CIVILIZATION_AUTH_MODE_RENDERER_VERSION = 1`
- `CIVILIZATION_CLOUD_SAVE_VERSION = 2`
- `CLOUD_SAVE_GUIDE_VERSION = 2`
- `ACCOUNT_CLOUD_INTEGRITY_VERSION = 6`
- `COMBAT_DAMAGE_MODEL_VERSION = 1`
- 世界：10 大區域、100 張主線地圖、Lv1～500。
- 桌面版＋手機版；iPhone Safari 是重要真機環境。
- 正式存檔策略：**每台裝置平常仍使用自己的本機存檔；Supabase 雲端只提供玩家主動上傳／下載的跨裝置搬移，不做自動同步、不在登入時自動覆蓋本機。**

`backgroundprogress.js` 的 background 指瀏覽器進入背景／失焦後的主線連戰時間補償，**不是圖片背景 loader**。正式圖片背景預載是 `backgroundpreload.js`。

---

# 2. 修改專案時固定操作規範

1. 修改前一定重新讀取 GitHub `main` 的相關實際檔案，不能只靠 handoff、模型記憶或上一個對話摘要。
2. 涉及載入順序、全域函式、extension、wrapper 時，重新檢查完整 `index.html`。
3. 使用者說「先討論／先不要修改／先檢查」時，**禁止寫入 GitHub**。
4. 使用者明確說「做／修改／執行／第 N 批」時，可直接修改 GitHub `main`，不必再次詢問是否要執行。
5. 修改完成後要重新讀取修改後的 `main`，確認內容、載入順序與相依性；不可只相信寫入工具回傳成功。
6. JS / CSS 正式改動後同步更新 `index.html` cache-bust；同名背景 WebP 重製時同步 bump `backgrounds.css` URL query。
7. 純 Markdown 文件（例如本 handoff）修改不需要改 `index.html` cache-bust。
8. 不做需求以外的順手重構，不偷偷改平衡、離線目標、存檔語意或玩家流程。
9. **優先修改真正正式 owner；不要額外新增 late wrapper、fallback、DOM 文字解析、第二套公式、第二套結算或第二套 state owner。**
10. 若正式 owner 已有 extension API，優先使用 extension API，不再包 `render()`／`go()`。
11. 存檔結構改動要同步檢查 `data.js`、`savemigration.js`、normalizer、`runtimeintegrity.js` 與舊存檔相容性。
12. 桌機與手機 UI 一起檢查；手機至少要考慮 iPhone Safari 的 viewport、背景切換、動畫與字體可讀性。
13. 神話裝備只禁止 **AUTO 自動出售**；未鎖定神話仍可手動單件確認出售，也可符合玩家主動的一鍵出售條件。
14. 一次性 GitHub Actions workflow 若只做資產轉換，輸出驗證進 `main` 後應刪除 workflow，但保留 source 母圖。
15. 帳號／雲端功能不得引入自動同步語意；上傳與下載都必須由玩家主動操作，並在覆蓋前顯示本機／雲端時間、Lv、EXP。
16. Supabase 前端只能使用 Publishable key；不得把 Secret key／service_role 放進 repo 或前端。
17. 帳號 gate 與設定頁帳號區塊不得恢復持續掃描整個 `#main` 的 `MutationObserver`；曾實際造成桌機與手機主畫面嚴重卡頓。
18. 不可把已退休的 JSON 檔案匯入／匯出重新當成正式玩家搬移流程。
19. 鏡像戰的場數、解鎖等級、獎勵、稱號、評語與鏡像戰專屬戰鬥常數以 `mirrorconfig.js` 為單一設定來源；不要再複製 hardcode。
20. 一般主線與鏡像戰的基礎傷害模型以 `combatmath.js` 為單一公式來源；不要在 Mirror Core 或其他模組再寫第二份 `(ATK - DEF×0.55) × 隨機浮動`。

---

# 3. 世界、主線、角色能力與背景連戰

## 3.1 世界與地圖

- 10 區、100 張地圖、Lv1～500。
- `WORLD_REGIONS` 固定每區 10 張地圖：地球、太陽系、近星、星際邊疆、獵戶臂、銀河邊境、銀河中域、銀河核心外圍、銀河核心戰爭、銀河統合戰爭。
- 地圖由 `registerRegionMaps()` 依固定 region/index 註冊，不依 script push 順序決定位置。
- 普通怪／菁英怪依進度解鎖；首次擊敗目前地圖 Boss 解鎖下一張地圖。

## 3.2 主線單場／連續戰鬥

- 普通怪、菁英怪與 Boss 都可選擇單場或連續戰鬥；三者共用同一套主線 continuous pipeline、停止按鈕與結算。
- `ui.js` 是正式主線戰鬥入口 owner：`startBattles()` 讀取 `selectedBattleCount`、執行 `healBeforeBattle()`，再把同一個 count 傳給 `beginCombat(count)`。
- `CONTINUOUS_BATTLE_COUNT = "continuous"` 由 `ui.js` 統一提供；`battlepipeline.js` 不維護第二份 marker。
- `combatpacing.js` 是主線場間節奏 owner，`MAIN_BATTLE_PACING_VERSION = 1`；`mainBattleGapMs(kind)`：normal 140ms、elite 220ms、Boss 140ms。
- Boss 前景戰鬥 action delay 比一般怪稍長，但場間 gap 仍為 140ms。
- Boss 首次擊敗會解鎖下一張地圖；連續戰鬥仍留在原本地圖持續挑戰同一隻 Boss，不自動跳圖。
- Boss 戰敗會立即停止連續戰鬥、鎖定再挑戰並把 `bossProgress` 歸零；需重新擊敗該地圖菁英 10 隻才再次解鎖 Boss。
- Boss 不觸發特殊怪，也不消耗黑市情報。
- 商店已退休，Boss 首殺沒有商店刷新副作用。
- `MAIN_BOSS_CONTINUOUS_VERSION = 1`。

## 3.3 主線背景戰鬥：普通／菁英／Boss 已統一

**2026-09-16 最新規則：普通怪、菁英怪、Boss 的「連續戰鬥」全部共用 `backgroundprogress.js` 背景推進。**

- 原先 Boss 被明確排除 background catch-up 的舊規則已退休。
- `BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION` 已不得存在。
- 正式 marker：`BACKGROUND_PROGRESS_MAIN_SHARED_VERSION = 2`。
- `backgroundProgressMainBattleAllowsBackground()` 現在對主線連戰統一允許背景推進，不再依怪物 kind 排除 Boss。
- 連續背景時間上限：12 小時。
- 背景 catch-up credit rate：`0.96`。
- 這只是「網頁仍開著，但分頁隱藏／視窗失焦」的連戰時間補償；**不是關閉遊戲後的離線收益**。
- Boss 仍然**不會成為離線收益刷怪目標**；背景連戰與離線收益兩套系統不可混為一談。
- `bosscontinuousintegrity.js` 已升為 `BOSS_CONTINUOUS_INTEGRITY_VERSION = 5`，會反向檢查 Boss 必須與普通／菁英共用背景推進，並檢查舊 exclusion marker 已退休。

## 3.4 正式基礎能力與共用傷害公式

正式基礎能力：

- `baseHP(l) = ceil(110 + 12 × (l-1))`
- `baseATK(l) = ceil(15 + 2.2 × (l-1))`
- `baseDEF(l) = ceil(7 + 1.2 × (l-1))`
- VIP 每級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25 percentage point、閃避 +0.25 percentage point。
- `playerCombatStats()` 先取得裝備／基礎能力，再套 VIP；強化只在裝備能力派生階段增加主能力差額。

`combatmath.js` 是一般主線與鏡像戰共用的基礎傷害公式 owner：

- `COMBAT_DAMAGE_MODEL_VERSION = 1`
- DEF 權重 `0.55`
- 隨機浮動 `0.95 + rng × 0.10`
- 最低傷害 1
- `combatDamageWithRng(atk, def, rng)` 可注入 RNG。
- 舊 `calcDamage(atk,def)` 目前是相容入口，直接轉給同一個共用公式＋`Math.random`。

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
- 特殊怪與副本不直接掉落強化石；若其掉落裝備實際被出售，仍可依正式裝備出售規則取得強化石。

---

# 7. VIP 與專精

## 7.1 VIP

- 上限 20。
- 門檻：`2500 × VIP level²`；VIP1=2,500，VIP20=1,000,000。
- VIP4+ 一般副本 VIP 積分 ×1.1；VIP12+ ×1.2，正式 owner 為 `vipDungeonPointMultiplier()`／`adjustVipDungeonPoints()`。
- VIP6 特殊遭遇 8%→10%。
- VIP10 特殊怪獎勵 10% 再發動。
- VIP20 防止死亡裝備遺失，EXP 懲罰仍依規則。
- **鏡像戰獎勵例外：**鏡像戰正式結算直接 `addVipPoints(20 × 勝場²)`，不走 `addDungeonPoints()`，因此不套 VIP4／VIP12 的一般副本積分倍率。

## 7.2 八種專精，各 Lv60

- `training`：每級 EXP +2.5%。
- `scavenge`：每級怪物金幣 +2.5%。
- `appraisal`：每級裝備售價 +2.5%。
- `initiative`：每級第一次主動攻擊傷害 +1%。
- `combo`：每級連擊率 +0.5%；追加攻擊 50% 傷害，可再次觸發連擊。
- `penetration`：每級穿透率 +0.5%；觸發時忽略 25% DEF。
- `counter`：每級反擊率 +0.5%；反擊第一擊 40% 傷害。
- `drain`：每級汲取率 +0.5%；觸發時回復該擊實際傷害 10%。

升級到目標 level 的費用為 `1000 × level²`。

---

# 8. 每日副本總覽

每日系統依 UTC+8 日曆日、凌晨 0 點重置。

- **懸賞戰**：Lv5 解鎖，每日最多 20 場真正開始的戰鬥；主要獎勵 EXP／金幣／裝備。
- **競技場**：Lv15 解鎖，每日最多 20 輪，每輪 3 戰，中間不回血；主要獎勵 VIP 積分。
- **虛空幻境**：Lv25 解鎖，無最高層；起始 `max(1, 歷史最高-100)`；每 10 層 Boss；每日基礎獎勵＝當日最高層×2 VIP 積分，每日只能領一次。
- **鏡像戰**：Lv50 解鎖，每日只可正式挑戰 1 次，固定 20 場；主要獎勵 VIP 積分，詳見第 9 節。
- 主線與離線收益不增加副本額度／進度。
- 副本怪物不直接掉強化石。
- 懸賞／競技準備頁與鏡像頁返回文字已統一為「← 返回副本列表」。

副本 UI extension：

- `dungeonui.js` 提供 `registerDungeonViewRenderer()`、`registerDungeonHomeCardRenderer()`、`registerDungeonPostRenderHook()`、`registerDungeonNavigationGuard()`。
- `DUNGEON_UI_EXTENSION_VERSION = 1`。
- `DUNGEON_PREP_RETURN_UX_VERSION = 2`。
- 舊 `dungeonreturnux.js` 已刪除，不應恢復用 HTML 關鍵字判斷準備頁的做法。
- `dungeonreturnlabels.js` 目前透過正式 post-render hook 統一返回文字；`dungeonui.js` 本身也仍有返回文字正規化防線。若未來整理，應在專門批次收斂，不要在其他功能中順手拆。

---

# 9. 鏡像戰：正式完整基準

## 9.1 核心定位與集中設定

正式設定 owner：`mirrorconfig.js`。

- `MIRROR_DUNGEON_CONFIG_VERSION = 1`
- Lv50 解鎖。
- 每日 1 次正式挑戰。
- 每次固定連戰 20 場。
- 對手名稱：`鏡像・玩家名`。
- 勝場獎勵：`20 × 勝場²` VIP 積分。
- 例：0→0、1→20、5→500、10→2000、15→4500、18→6480、19→7220、20→8000。
- 20 場每場理論 50% 時，理論每日平均獎勵為 2100 VIP 積分。
- `mirrorconfig.js` 也是 15～20 勝稱號、0～20 勝 21 句每日評語、鏡像戰專屬 counter/combo/penetration/drain 比例的唯一設定來源。

歷史最高稱號：

- 15：幸運眷顧
- 16：天選之刻
- 17：逆命者
- 18：傳說之日
- 19：距神一步
- 20：神蹟
- 0～14：無稱號

## 9.2 每日狀態與持久資料

`MIRROR_DUNGEON_STATE_VERSION = 2`。

正式資料位於：

```text
state.dungeon.mirror = {
  version,
  history: {
    bestWins,
    bestDate,
    miracleDates
  },
  daily: {
    dateKey,
    status,
    challengeDate,
    startedAt,
    wins,
    losses,
    completedAt
  }
}
```

`daily.status`：`idle / running / completed / failed`。

- 正式開始前必須是 `idle`。
- 按下正式開始時，先把 daily 寫成 `running`，再要求 `save(false) === true`。
- **開始存檔失敗時會回滾原 daily，不消耗機會，也不啟動戰鬥。**
- 同日重新載入發現舊 `running` → `failed`，今日不能重打、無成績、無獎勵。
- 舊 `running` 跨日重新載入 → 新一天 `idle`。
- 同一工作階段 23:59 開始、00:01 完成 → 仍維持開始日 `challengeDate`，不占新一天機會。
- 單純 `visibilitychange`／切背景不直接判定鏡像戰中斷；真正頁面重新載入後才由存檔狀態恢復規則處理。
- 第 20 場完成但正式結算尚未成功寫入前若中斷，仍視為未完整完成，不補發。

## 9.3 歷史資料與舊存檔修復

只正式保留：

- `bestWins`
- `bestDate`
- `miracleDates`

規則：

- 第一次完整完成 20 場，即使 0 勝，也建立 `bestDate`。
- `bestDate === null` 才代表「從未有正式紀錄」，所以真實 0 勝紀錄不會和沒玩過混淆。
- 新成績 > `bestWins` 才更新最高與首次達成日期；平手不覆蓋第一次日期。
- 每次 20 勝都 append 一筆 `miracleDates`；同一天 GM 重置後再次 20 勝也可保留重複日期，不去重。

State v2 normalizer 已加強：

- 日期不只檢查 `YYYY-MM-DD` 格式，會驗證實際 Gregorian 日期；`2026-02-30`、`2026-99-99` 等視為非法。
- 非 idle 狀態若沒有合法 `dateKey/challengeDate`，回復當日 idle，不會把壞掉的舊完成資料誤搬成今天紀錄。
- history 含合法神蹟日期但 `bestWins` 錯誤時，自動修為 20 勝；重複神蹟日期保留。
- 舊資料若 `bestWins=20`＋合法 `bestDate` 但 `miracleDates=[]`，會補至少一筆神蹟日期。
- 舊 Save 12 完全沒有 mirror state 時，正式 migration／dungeon normalizer 會自動建立鏡像資料。
- **不需要升 Save Schema 13；全遊戲仍是 Save 12。**

`dungeonprogress.js` 是 dungeon normalization owner；鏡像 state 不再自己包第二層 `normalizeDungeonSaveState()`／`finalizeDungeonLoadedState()`。

`LAST_SAVE_LOAD_REPORT` 已包含 `recoveredInterruptedMirrorRun`，方便除錯鏡像中斷恢復。

## 9.4 鏡像戰鬥核心

- `MIRROR_COMBAT_CORE_VERSION = 3`
- 每場雙方滿血、獨立。
- 每場 50% 玩家先攻／50% 鏡像先攻。
- 唯一先天不對稱是每場開始的 50/50 先攻抽籤。
- 開始正式 20 場前鎖定一份角色快照，20 場共用同一份快照。
- 快照保存玩家名、level、VIP、最終 HP/ATK/DEF/crit/dodge、戰鬥專精等級與 bonus、強化等級、裝備 clone、damage model version。
- 真正戰鬥能力以 `playerCombatStats()` 的最終 stats 為來源；快照 audit 會核對 VIP、五種戰鬥專精、五欄強化、裝備與傷害模型版本。

共用傷害：

- Mirror Core 不再有第二份基礎傷害公式。
- 每一下基礎傷害都呼叫 `combatDamageWithRng()`；缺少共用公式時直接 error，不 fallback。
- 一般主線與鏡像因此共用 `combatmath.js` 的 DEF 0.55 與 0.95～1.05 浮動模型。

事件規則：

- `initiative`：雙方各自第一次「主動攻擊」用一次；反擊不消耗；即使第一次主動攻擊被閃避，也視為已使用。
- 閃避成功：0 傷害、不汲取、不形成有效受擊；該攻擊鏈仍可繼續判 combo。
- 穿透：每一擊獨立判定；成功時該擊 DEF ×0.75。
- 暴擊：每一擊獨立判定。
- 汲取：每一擊造成實際傷害後獨立判定；回復實際傷害 10%，不超 max HP；每擊先傷害／汲取，再判死亡。
- combo：追加 50% 傷害，可遞迴直到失敗或敵方死亡。
- 一條攻擊鏈＝主動普攻＋後續 combo。
- 攻擊鏈結束後，防守方最多判一次 counter；整串至少一擊實際傷害 >0 才有反擊資格。
- counter 第一擊 40%，之後可閃避／穿透／暴擊／汲取／combo。
- counter 後的 combo 仍是正常 50%，不是 20%。
- counter 鏈不可再引起另一方 counter，避免無限反反擊。
- 死亡後不處理尚未發生的 combo/counter；無復活。
- 對稱核心理論上不存在真正同時死亡，每場必有勝者。

## 9.5 正式 20 場流程與結算

- `MIRROR_RUN_VERSION = 2`。
- 正式開始先建立快照，再 `beginMirrorDungeonState()`；只有 running 成功持久化後才啟動。
- 20 場無停止 API；正式 run active 時透過 `registerDungeonNavigationGuard()` 阻止站內離開。
- 玩家本體 `state.hp` 不因鏡像戰扣血。
- 單場不發 EXP、金幣、裝備、強化石、特殊怪、主線進度，不套死亡懲罰／lostGear／Boss 鎖定。
- 完成 20 場後自動發獎，不手動領。
- 結算採 rollback 保護：先記錄 mirror completion（`save:false`）→ `addVipPoints(reward)` → 最後 `save(false)`；任何步驟丟錯時還原 mirror、VIP points、VIP level、HP。
- 避免出現「狀態失敗但 VIP 已經拿到」的半套結算。

## 9.6 UI／UX

- 副本列表加入鏡像卡片，桌面副本列表兩欄；手機單欄。
- 主色為鏡銀／冷紫／冰紫。
- 主頁顯示：規則、今日狀態、歷史最高、首次日期、稱號、神蹟次數與日期。
- 正式開始前二次 confirm：每日僅 1 次、固定 20 場、自動進行、不可停止、中斷今日結束、完成後自動結算。
- 戰鬥中顯示 `第 X / 20 戰`、`目前 X 勝 X 敗`。
- 手機可讀性修正：進度字 `#EDE7FF`；主文字 `#F5EEDC`；勝場 `#7CFF9A`；敗場 `#FF8A8A`；字重 800＋深色 shadow。
- 玩家名輸出會 escape，避免特殊字元破壞 HTML。
- 今日已 completed 時回主頁仍可查看今日勝敗、獎勵與評語；failed 時顯示今日已結束且無成績／獎勵。
- 返回文字統一為「返回副本列表」。

## 9.7 GM

鏡像 GM 透過 `registerGmHubSection()` 掛入 GM Hub：

正式管理：

- `重置今日鏡像戰`：只把今日狀態回到 idle，讓今天可重新正式挑戰；不改 `bestWins/bestDate/miracleDates`。
- 進行中的正式鏡像戰不可重置。

純測試：

- `測試 1 次`＝1 組完整 20 場。
- `測試 100 次`＝100 組＝2,000 場。
- 不耗正式機會、不發 VIP、不改歷史／神蹟。
- 顯示平均勝場、總勝率、玩家先攻勝率、鏡像先攻時玩家勝率、平均回合、勝場分布、五種戰鬥專精觸發統計。
- `對稱回歸（64 組）`＝固定 RNG、滿級戰鬥專精、交換先攻，總計 128 場，不修改正式資料。

## 9.8 鏡像完整性檢查與效能

- `mirrordungeonintegrity.js` 檢查 config、必要 API、共用傷害、快照來源、獎勵抽查、稱號、評語、newState、停止 API 不存在、Dungeon UI extension／GM extension／Guide 等。
- `MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION = 4`。
- Production final integrity 只跑 **8 組對稱 smoke pair＝16 場**，避免每次玩家載入都白跑原本 128 場。
- 完整 64 組／128 場對稱回歸保留在 GM 手動測試。
- Final integrity 另外測：同日 running recovery、跨日 recovery、跨午夜同 session、0 勝紀錄、重複神蹟、非法日期清理、神蹟 history repair、舊 20 勝補神蹟、全獎勵表、21 句不同評語、viewport、normalizer count=4 等。

---

# 10. 裝備欄位強化系統

## 10.1 正式持久資料

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

## 10.2 成本

- 強化石是 `state.enhancement` counter，不是背包 item。
- 強化只花石頭，不花金幣；100% 成功。
- 強化到目標 +N：基礎 `100×N`、進階 `5×N`。
- +20 單次成本：2000 基礎＋100 進階。
- 單欄 +0→+20 累積：21,000 基礎＋1,050 進階。

## 10.3 主線掉石

正式 owner：`enhancementrewards.js`＋`combatcore.js`。

- normal：1 基礎。
- elite：70% 1 基礎、30% 2 基礎；理論期望值 1.3。
- boss：1 進階。
- 資格：`playerLevel - monsterLevel < 10`。
- 玩家高於怪物 10 級（含）以上時不掉強化石，只抑制石頭，不影響其他獎勵。
- `expectedMainlineEnhancementStoneReward()` 提供理論產量，離線與線上共用同一份機率來源。
- `MAINLINE_ENHANCEMENT_PIPELINE_VERSION = 2`。

## 10.4 出售裝備取得強化石

正式發獎 owner：`equipmentlock.js`，共用公式在 `enhancementrewards.js`。

- q4 傳說：+5 基礎。
- q5 神話：+1 進階。
- 單件手動、一鍵出售、AUTO-sell、換裝後舊裝 AUTO 出售都走同一套規則。
- `addItem()`／`handleUnequippedItem()` 回傳實際已發放的 `enhancementStones`；戰鬥／UI 只統計與顯示，不重新按品質計算或二次 grant。
- 批次出售使用 `enhancementStoneSaleRewards()`／`grantEnhancementStoneSaleRewards()`。
- `EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION = 2`。

## 10.5 戰鬥結算

- `battlepipeline.js` context 正式累積 battle 與 autoSale 兩類強化石摘要。
- `settlementui.js` 顯示單一全寬「強化石獎勵」橫列。
- 不重複顯示第二層「打怪掉落」「AUTO 出售」說明。
- 同一輪若同時得到基礎＋進階，兩者在同一橫列顯示。
- 戰鬥結算立即換裝後若舊裝 AUTO 出售，因為這筆出售發生在原結算產生之後，仍會另外提示金幣與石頭。

## 10.6 強化 UI 與舊存檔

- 首頁「強化」入口與 `view="enhancement"` render route 已正式整併 `ui.js`。
- `enhancementui.js` 負責頁面、五張欄位卡、確認 modal、實際主能力預覽與強化原子扣款。
- 強化成功後不跳第二個成功 alert，直接 render 最新數值。
- 五張卡桌機維持相同寬度；手機單欄。
- 強化頁 CSS 已移至 `functionuipolish.css`。
- `ENHANCEMENT_UI_VERSION = 4`。
- Save Schema 仍為 12。
- `engine.js -> newState()` 直接建立 enhancement 初始資料。
- migration pipeline 直接呼叫 `normalizeEnhancementState()`。
- `normalizeEnhancementState()` 正規化石頭為非負整數、五欄 clamp 0～20，並補齊舊存檔缺少的 enhancement。

---

# 11. 離線收益與強化石

- 最多 12 小時；最短 1 分鐘。
- EXP／金幣／裝備約在線 10%。
- 離線主線強化石效率為正式理論產量的 5%。
- **離線合法目標仍不含 Boss**，因此關閉遊戲後的離線戰鬥部分不取得 Boss 進階石。
- 若玩家最後進行的是 Boss，Boss 不覆蓋有效離線刷怪目標；離線收益沿用最近一次有效的普通怪／菁英怪戰鬥紀錄。
- 這條離線 Boss 排除與第 3.3 節「Boss 可背景連戰」並不衝突：背景連戰＝網頁仍開著；離線收益＝關閉／離開後的獨立結算。
- `offlineEnhancementStoneReward()` 只呼叫 `expectedMainlineEnhancementStoneReward()` 取得正式理論值，再套 5%；不手寫第二份 elite EV。
- 整段離線先合計理論量，再 floor；不是每場先 floor。
- 使用與在線相同的 10 級差資格。
- 離線出售裝備的石頭使用正式 `enhancementStoneSaleReward()` 並以共用 merge API 累積。
- `OFFLINE_ENHANCEMENT_PIPELINE_VERSION = 3`。
- `resolveFarmTarget()` 優先最新合法 `battleSamples`，再 fallback `farmMap/farmEnemy`；不是自動搜尋最高已解鎖非 Boss。
- **雲端下載例外：**下載雲端存檔時會把 `offline.lastSettledAt`／`offline.maxObservedWallClock` 重設為下載當下、`timeLockUntil=0`，並清除舊 `pendingSettlement`，避免跨裝置等待時間被誤算或重複發放。

---

# 12. GM 管理與測試

- 設定頁標題連續點擊 3 次可開啟管理功能入口；實際管理密碼不應寫進 handoff。
- `gmhub.js` 是 GM Hub 主要 owner。
- `gmhubextensions.js` 提供 `registerGmHubSection(mode,title,renderer,options)`；`GM_HUB_EXTENSION_VERSION = 1`，鏡像戰管理／測試透過此入口註冊。
- 現有 `gmhubextensions.js` 內部仍以集中 wrapper 延伸 `gmHtml()`；這是目前 main 的實際結構。未來若收斂 owner，應另開專門批次，不要新增另一層 wrapper。

強化 GM：

- 可直接設定五欄正式 +0～+20，不消耗／不改目前強化石。
- `vipgm.js` 正式持有 GM 測試強化狀態與測試玩家快照。
- `gmTestEnhancementLevels` 只存在本頁工作階段，重新整理回 +0。
- 單一「目前狀態」按鈕同步正式 VIP、8 種專精、5 欄強化到測試狀態。
- `gmTestEnhancedEquippedStats()` 使用正式 `equippedStatsWithEnhancementLevels(levels)`，不複製第二套強化公式。
- `gmTestPlayerStats()` 正式整合測試 VIP＋專精＋強化。
- `GM_ENHANCEMENT_TEST_PIPELINE_VERSION = 4`。
- `GM_ENHANCEMENT_HUB_VERSION = 4`。

鏡像 GM：詳見第 9.7 節。

---

# 13. 遊戲說明、extension 與完整性檢查

## 13.1 遊戲說明

- `GAME_GUIDE_VERSION = 10`。
- 「冒險入門」說明普通怪、菁英怪、Boss 都可單場／連續戰鬥。
- Boss 說明包含：首殺解鎖下一張地圖、連戰可留在原地繼續刷王、戰敗立即停止並需重新擊敗菁英 10 隻。
- 「特殊遭遇」明確說明 Boss 不會觸發特殊怪。
- 「離線收益」仍明確說明 Boss 不作為**離線**刷怪目標，並沿用最近普通／菁英有效紀錄；這不代表 Boss 不能做瀏覽器背景連戰。
- `MIRROR_DUNGEON_GUIDE_VERSION = 2`；副本說明目前共有四種副本，鏡像戰規則由集中 config 產生場數／解鎖等級文字。
- `CLOUD_SAVE_GUIDE_VERSION = 2`；另有「帳號與雲端存檔」區塊，說明手動上傳／下載、覆蓋風險、跨裝置流程與離線收益規則。
- 換裝置重要提醒使用原文字顏色與字體，只以框線、留白與警示符號提高辨識度。

## 13.2 完整性檢查目前正式層次

主要載入順序依 `index.html`：

1. `mirrordungeonintegrity.js`：鏡像基礎 API／config／傷害／快照／UI extension／GM／Guide 檢查，輸出 `MIRROR_DUNGEON_INTEGRITY`。
2. `enhancementintegrity.js`：集中驗證強化核心、成本、掉石、出售、離線、戰鬥能力、UI、GM、指南與摘要，輸出 `ENHANCEMENT_FINAL_INTEGRITY`。
3. `bosscontinuousintegrity.js`：`BOSS_CONTINUOUS_INTEGRITY_VERSION = 5`；驗證 Boss 單場／連戰、10 隻菁英重開、停止邊界、特殊怪排除、**三種主線怪共用 background catch-up**、Boss 離線收益仍排除、共用 marker／pacing owner 等，輸出 `BOSS_CONTINUOUS_INTEGRITY`。
4. `accountcloudintegrity.js`：`ACCOUNT_CLOUD_INTEGRITY_VERSION = 6`；驗證 Auth v6、Auth mode renderer v1、Cloud Save v2、Cloud Guide v2、登入／登出／忘記密碼／recovery session refresh、上傳／下載 API，以及舊 JSON 匯入／匯出 API、UI、退休 wrapper 都已不存在，輸出 `ACCOUNT_CLOUD_INTEGRITY_REPORT`。
5. `runtimeintegrity.js`：要求 `ENHANCEMENT_FINAL_INTEGRITY.passed === true`、`BOSS_CONTINUOUS_INTEGRITY.passed === true`，並與世界、Save12、VIP、專精、每日、副本、虛空、退休商店、特殊怪 payout、Guide v10 等形成 `PROJECT_RUNTIME_REPORT`。
6. `mirrorfinalintegrity.js`：`MIRROR_DUNGEON_FINAL_INTEGRITY_VERSION = 4`；在 runtime report 之後跑鏡像 state／舊資料／對稱 smoke／獎勵／評語／extension 最終回歸，輸出 `MIRROR_DUNGEON_FINAL_INTEGRITY`。

另外：

- `enhancementmigration.js` 負責舊／新存檔與 enhancement normalization 相容性，輸出 `ENHANCEMENT_INTEGRITY_REPORT`。
- 帳號／雲端完整性仍由獨立 `ACCOUNT_CLOUD_INTEGRITY_REPORT` 補充，不改 Save Schema。
- 鏡像 final integrity 刻意放在 `runtimeintegrity.js` 後，因為會檢查 `PROJECT_RUNTIME_REPORT.passed`；不要無故調換載入順序。

已退休歷史 marker 包含：`ENHANCEMENT_UI_SUCCESS_ALERT_DISABLED`、`ENHANCEMENT_UI_UNIFORM_GRID`、`HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION`、`LEGACY_FILE_SAVE_RETIRED_VERSION`、`BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION`。

---

# 14. Supabase 帳號與手動雲端存檔

## 14.1 帳號 Auth

正式 project：`civilization-frontline`。

Auth 設定基準：

- Email provider ON
- User signups ON
- Confirm email ON
- Anonymous OFF
- 密碼至少 8 字元
- Site URL／Redirect URL 指向 GitHub Pages 正式遊戲網址

`supabaseauth.js` 是帳號正式 owner：

- `CIVILIZATION_AUTH_VERSION = 6`
- `CIVILIZATION_AUTH_MODE_RENDERER_VERSION = 1`
- 使用 Supabase Email + Password Auth。
- `persistSession:true`
- `autoRefreshToken:true`
- `detectSessionInUrl:true`
- 同一裝置登入成功後維持 session，只有主動登出才回登入 gate。
- 登出使用 local scope，只結束這台裝置，不刪本機遊戲進度，也不自動登出其他裝置。
- 設定頁顯示目前登入 Email 與「登出」。

帳號 gate 四種狀態統一由 `AUTH_MODES + renderAuthMode()` 管理：

- login：Email＋密碼
- signup：Email＋密碼＋再次輸入密碼
- forgot：Email，寄送重設密碼信
- recovery：新密碼＋再次輸入新密碼

忘記密碼／Recovery：

- 登入頁有「忘記密碼？」。
- `resetPasswordForEmail()` 寄送 recovery 信。
- 點信件連結回遊戲後進入「設定新密碼」。
- 使用 `updateUser({password})` 更新後，再以 `getSession()` 重新取得正式 session。
- recovery 狀態以 `civilization_frontline_password_recovery_v1` sessionStorage flag 輔助維持。
- 完成後只清除 Auth recovery 相關 URL 參數，不把其他 query 一起清掉。
- 常見錯誤已繁中化：登入失敗、Email 未驗證、重複註冊、密碼過短、rate limit、Email 格式錯誤、recovery token 過期／無效、session 失效、新密碼與舊密碼相同。
- 忘記密碼寄送結果使用中性訊息，不直接暴露某 Email 是否已註冊。

重要 Auth bug 修正：

- 曾經以持續 `MutationObserver` 監看 `#main`，造成桌機／手機主畫面嚴重卡頓；已移除，現在使用 render hook。禁止恢復廣域持續 Observer。
- 登入畫面的「再次輸入密碼」曾因 `.civilization-auth-form label{display:block}` 蓋掉 browser `[hidden]` 行為而錯誤顯示；`supabaseauth.css` 已加入 `.civilization-auth-form [hidden]{display:none!important}`。

## 14.2 Supabase Database

前端只使用 Publishable key；**不得使用 Secret key／service_role**。

`public.game_saves`：

- `id` int8 PK
- `created_at` timestamptz default `now()`
- `user_id` uuid NOT NULL UNIQUE，FK → `auth.users.id`，delete cascade
- `save_data` jsonb NOT NULL
- `revision` int8 NOT NULL default 1（內部欄位，不顯示給玩家）
- `updated_at` timestamptz NOT NULL default `now()`
- `level` int8 NOT NULL default 1
- `exp` int8 NOT NULL default 0

Backend 規則：

- RLS ON
- Realtime OFF
- Data API ON
- SELECT / INSERT / UPDATE / DELETE 四個 authenticated policy 都限制目前 `auth.uid()` 只能讀寫自己的 `user_id`。

## 14.3 手動雲端搬移

`cloudsave.js` 是正式雲端傳輸 owner；`CIVILIZATION_CLOUD_SAVE_VERSION = 2`。

正式原則：**本機與雲端分離，只手動搬移，絕不自動同步。**

設定頁只提供：

- 「上傳本機存檔」
- 「下載雲端存檔」

不提供玩家可見的「重新整理雲端資訊」按鈕；程式會在需要時自行刷新 metadata。

玩家可見比較資訊只顯示：

- 存檔時間
- Lv
- EXP

`revision` 只做內部版本控制，不顯示。

上傳流程：

- 先重新查詢目前雲端 metadata。
- 顯示本機／雲端時間、Lv、EXP 覆蓋確認。
- 執行本機 `save(false)`。
- 以 clone 後的目前 state 作為 `save_data`。
- 明確寫入 `updated_at`。
- `upsert(...,{onConflict:"user_id"})`，每個帳號固定一列。
- 有既有雲端資料時 `revision + 1`，否則從 1 開始。

下載流程：

- 重新讀取完整 `save_data, updated_at, level, exp, revision`。
- 覆蓋前顯示本機／雲端時間、Lv、EXP。
- 保留覆蓋前 state clone 作 recovery safety。
- 對下載 state 執行正式 normalization／migration。
- 綁定目前帳號為本機 save owner。
- `save(false)` 後 reload。

本機額外 metadata：

- 存檔時間 key：`civilization_frontline_local_save_meta_v1`
- 本機帳號 owner key：`civilization_frontline_local_owner_v1`

跨帳號保護：

- 若本機存檔已綁 A 帳號，而目前登入 B，禁止把 A 的本機進度上傳到 B。
- 仍可下載 B 的雲端存檔覆蓋本機；下載成功後本機 owner 改綁 B。

`cloudsave.js` 目前會 wrapper 全域 `save()` 以維護獨立本機存檔時間 metadata；這是刻意避免升 Save Schema 的相容設計。若未來要重構，必須另開專門批次，不能在無關功能中順手拆。

## 14.4 雲端下載與離線收益

下載雲端存檔時，會：

- `offline.lastSettledAt = 下載當下`
- `offline.maxObservedWallClock = 下載當下`
- `timeLockUntil = 0`
- 清除舊 `pendingSettlement`

因此「原裝置上傳後 → 新裝置下載前」的等待時間**不補發離線收益**。

正式換裝置流程：

**原裝置開遊戲 → 完成當次離線收益結算 → 上傳本機存檔 → 新裝置登入同帳號 → 比對時間／Lv／EXP → 下載雲端存檔。**

## 14.5 舊 JSON 檔案匯入／匯出已正式退休

這部分目前已是「真正刪除」，不是隱藏：

- 設定頁舊「匯出存檔／匯入存檔」已直接從 `ui.js` 移除。
- `exportSave()` 已刪除。
- `importSave()` 已刪除。
- 只供檔案匯入驗證的 `isImportableSave()` 已刪除。
- `legacysaveretirement.js` 已刪除。
- `index.html` 不再載入該 wrapper。
- `LEGACY_FILE_SAVE_RETIRED_VERSION` 已退休，Integrity 反而要求它不得存在。

仍保留：

- `normalizeSaveItem()`
- `normalizeSaveState()`
- `normalizeCurrentSaveState()`

因為這些仍是本機舊存檔與雲端下載後 migration／normalization 的正式共用能力，不屬於舊檔案匯入功能。

跨裝置正式方式只有 Supabase 手動雲端上傳／下載。

## 14.6 使用者實測狀態

2026-09-16 使用者已在正式頁實測並確認：

- 帳號登入／建立帳號 UI 可用。
- 移除廣域 MutationObserver 後，桌機／手機卡頓問題消失。
- 登入頁「再次輸入密碼」錯誤顯示問題已修正。
- 雲端上傳成功。
- 雲端下載可正確覆蓋並載入。
- 忘記密碼入口已出現，recovery 流程可進入使用。
- 鏡像戰正式 20 場流程可完成。
- 鏡像戰手機勝敗文字配色已實測可讀。
- Boss 連續戰鬥切背景後，使用者已實測確認會像普通／菁英一樣背景推進。

這些屬於使用者真機／正式頁實測；不得誤寫成模型已做瀏覽器 runtime 測試。

---

# 15. 背景圖製作與預載 SOP

原始母圖：

```text
assets/backgrounds-source/<功能名稱>/
```

正式 Runtime 圖：

```text
assets/backgrounds/<功能名稱>/
```

正式轉換規格：GitHub Actions、Ubuntu runner、Python 3.12、Pillow、RGB、Desktop 最大寬1536、Mobile最大寬1080、LANCZOS、WebP quality=72、method=6。

- 正式場景背景 URL 統一由 `backgrounds.css` 管理。
- `backgrounds-source` 只保存母圖，不作 Runtime 背景。
- `backgroundpreload.js` 掃描目前 viewport 有效 CSS media rules，只預載 `/assets/backgrounds/`、排除 `/backgrounds-source/`，使用 `Set` 去重與 `new Image()`，最多等 12 秒。
- 同名 WebP 重製後必須 bump `backgrounds.css` URL query。
- 一次性轉換 workflow 成功、驗證、輸出進 main 後刪除；source 母圖保留。

---

# 16. 2026-09-16 本對話已完成的重要修改

本節只作「這輪改了什麼」的交接摘要；若和前面正式規則或 main 衝突，仍以 main 為準。

## 16.1 鏡像戰從零到正式完成

已完成：

- 新增 Lv50 每日鏡像戰、20 場、純對稱 Mirror Combat、VIP 獎勵、歷史最高、神蹟、21 句評語、15～20 稱號。
- 新增 state／combat core／run／UI／guide／GM／integrity／final integrity。
- 新增 GM 正式重置、1 次／100 次沙盒測試、64 組對稱回歸。
- 鏡像戰玩家名 escape、手機勝敗配色、返回文字統一。
- 懸賞／競技準備頁返回「副本列表」也統一。

## 16.2 鏡像戰四批優化

第 1 批：存檔安全＋state owner

- 正式開始要求 running 狀態成功 `save(false)` 才啟動；失敗回滾 idle。
- 鏡像 normalization 收斂進 `dungeonprogress.js` owner，移除鏡像 state 自己的 dungeon normalizer/finalizer wrapper。
- `LAST_SAVE_LOAD_REPORT` 新增 `recoveredInterruptedMirrorRun`。

第 2 批：共用傷害＋快照來源

- 新增 `combatmath.js` 單一傷害模型 owner。
- Mirror Core 不再複製主線基礎傷害公式。
- 鏡像專精 bonus 優先讀正式 `specializationPercentBonus()`。
- 新增快照來源 audit，核對 stats／VIP／專精／強化／裝備／damage model。

第 3 批：Dungeon UI／GM extension 與返回 UX

- `dungeonui.js` 新增正式 view/card/post-render/navigation guard extension API。
- 鏡像 UI／run 不再自己包全域 `render()`／`go()`。
- 舊 `dungeonreturnux.js` 刪除；準備頁返回改以正式 phase 判斷。
- 建立 `gmhubextensions.js` 與鏡像 GM section 註冊入口。

第 4 批：config 集中＋Integrity 瘦身＋舊資料防呆

- 新增 `mirrorconfig.js`，集中 Lv50／20 場／獎勵／稱號／評語／戰鬥專屬常數。
- Mirror state 升 Version 2，增加實際日期驗證與 history consistency repair。
- Production 對稱回歸由 64 組縮到 8 組 smoke；完整 64 組移到 GM 手動測試。
- Save Schema 維持 12，不升 13。

## 16.3 Boss 背景連戰統一

- 找到 Boss 原本被 `backgroundprogress.js` 明確排除 background catch-up。
- 正式改成普通／菁英／Boss 三者連續戰鬥共用背景推進。
- `BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION` 退休。
- 新正式 marker：`BACKGROUND_PROGRESS_MAIN_SHARED_VERSION = 2`。
- `bosscontinuousintegrity.js` 升 Version 5，改為檢查 Boss 背景連戰必須啟用。
- **離線收益仍排除 Boss，未改。**

---

# 17. 目前已知技術債／尚未完成項目

目前沒有已知「玩家正式功能尚未完成」的必做項目；鏡像戰、Boss 背景連戰、帳號與手動雲端均已進 main，並有使用者實測。

仍存在但**不要在無關任務中順手重構**的技術債：

- `cloudsave.js` 仍以 wrapper 方式延伸 `save()` 維護獨立本機存檔時間 metadata；這是刻意避免升 Save Schema 的相容設計。
- `supabaseauth.js` 仍以集中 render hook 延伸 `render()` 來掛帳號設定；不要再疊另一層廣域 DOM Observer。
- `gmhubextensions.js` 仍以集中 wrapper 延伸 `gmHtml()`；已有 `registerGmHubSection()` API，新功能應使用 API，不再新增另一套 GM wrapper。
- `backgroundprogress.js` 仍以 wrapper 接 `beginCombat()`／`runBattles()`；現在三種主線怪已統一背景推進。若未來要完全收回主 owner，應另開專門批次。
- `dungeonui.js` 與 `dungeonreturnlabels.js` 目前都有返回文字正規化防線，功能無問題但有輕微重複；若未來收斂，應另開專門批次。
- `cloudsaveguide.js` 仍是對遊戲說明的相容 extension。
- `offlineprogress.js` 仍含 inline offline modal styles。
- `gmhub.js` 仍以 JS 建立部分 GM Hub 通用 styles。
- `specialization.js` 仍含 specialization UI inline style 建立邏輯。
- 鏡像 UI／run 目前也各自注入自己的局部 CSS；功能已完成，若要 CSS owner 收斂應另開 UI cleanup 批次。
- 真機瀏覽器行為仍以實測為重要依據；若出現 stale JS/CSS／背景，先檢查 cache-bust，再判斷其他原因。

目前沒有要求升 Save Schema；不要為了鏡像戰擅自改到 Schema 13。

---

# 18. 已退休／不得從舊資料恢復

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
- 強化 UI／GM 以 JS 注入專屬 enhancement CSS 的舊做法。
- GM 自己複製一套強化主能力公式的做法。
- 出售強化石多層 wrapper 重複 grant 的做法。
- Boss 固定只能單場挑戰的舊規則。
- Boss 連戰排除瀏覽器背景 catch-up 的舊規則。
- `BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION`。
- `hpflow.js` 覆寫 `startBattles()`／`adventurePreparePage()`／`playerStatusHtml()` 的舊做法。
- `HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION`。
- `battlepipeline.js` 自己維護第二份 `"continuous"` marker 或 normal／elite 場間 gap 常數的做法。
- 鏡像戰自己的第二份基礎傷害公式。
- 鏡像 state 自己包 `normalizeDungeonSaveState()`／`finalizeDungeonLoadedState()` 的舊做法。
- 鏡像 UI／run 自己包全域 `render()`／`go()` 的舊做法。
- `dungeonreturnux.js` 與依 HTML「單次挑戰／連續挑戰」文字判斷準備頁的舊做法。
- Production 每次載入都跑 64 組／128 場完整鏡像對稱測試的舊做法。
- 玩家可見的 JSON 檔案「匯出存檔／匯入存檔」正式搬移流程。
- `exportSave()`、`importSave()`、`isImportableSave()`。
- `legacysaveretirement.js` 與 `LEGACY_FILE_SAVE_RETIRED_VERSION`。
- 登入後自動下載、自動上傳、背景自動同步或以雲端直接覆蓋本機的做法。
- 玩家可見的「重新整理雲端資訊」按鈕。
- 帳號 gate／設定頁以持續廣域 `MutationObserver` 掃描 `#main` 的做法。

---

# 19. 重要載入順序與近期 cache-bust

不要只看本節；每次修改仍要重讀最新 `index.html`。

目前重要依賴順序：

- `engine.js`
- `combatmath.js`
- enhancement／VIP／daily／specialization
- `combatcore.js`
- `mirrorconfig.js`
- `mirrorcombatcore.js`
- `dungeonprogress.js`
- `mirrordungeonstate.js`
- `savemigration.js`
- `gameguide.js`
- `mirrordungeonguide.js`
- `ui.js`
- 主線／副本／GM／offline／cloud 等模組
- `dungeonui.js`
- `dungeonreturnlabels.js`
- `mirrordungeonui.js`
- `mirrordungeonrun.js`
- `mirrordungeonintegrity.js`
- `enhancementintegrity.js`
- `bosscontinuousintegrity.js`
- `accountcloudintegrity.js`
- `runtimeintegrity.js`
- `mirrorfinalintegrity.js`
- `backgroundpreload.js`

近期正式 cache keys：

- `combatmath.js?v=20260916-mirror-opt-batch2`
- `mirrorconfig.js?v=20260916-mirror-opt-batch4b`
- `mirrorcombatcore.js?v=20260916-mirror-opt-batch4b`
- `mirrordungeonstate.js?v=20260916-mirror-opt-batch4b`
- `mirrordungeonguide.js?v=20260916-mirror-opt-batch4b`
- `mirrordungeongm.js?v=20260916-mirror-opt-batch4b`
- `mirrordungeonui.js?v=20260916-mirror-opt-batch4b`
- `mirrordungeonrun.js?v=20260916-mirror-opt-batch4b`
- `mirrordungeonintegrity.js?v=20260916-mirror-opt-batch4b`
- `mirrorfinalintegrity.js?v=20260916-mirror-opt-batch4b`
- `gmhubextensions.js?v=20260916-mirror-opt-batch3`
- `dungeonui.js?v=20260916-mirror-opt-batch3`
- `dungeonreturnlabels.js?v=20260916-mirror-opt-batch3`
- `backgroundprogress.js?v=20260916-boss-background-shared1`
- `bosscontinuousintegrity.js?v=20260916-boss-background-shared1`

---

# 20. 下一個對話如何接手

標準接手指令：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際相關程式碼與完整 `index.html` 載入順序，完整承接《文明戰線》專案。`main` 是唯一真實來源；若 handoff、聊天記憶、舊規格或舊 commit 與 main 衝突，以 main 為準。現在先不要修改。**

若下一個對話直接要求修改，則使用：

> **先讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新讀取本次需求涉及的 `main` 正式 owner、相依檔案與 `index.html`。確認現況後直接依需求修改 GitHub `main`；修改後重新讀取 main 自我檢查，JS/CSS 改動同步更新 `index.html` cache-bust。不要新增不必要 wrapper、fallback、第二套公式或第二套 state owner。**

執行規範仍以第 2 節為準：

- 使用者說「先討論／先不要修改／先檢查」→ 不可寫 GitHub。
- 使用者說「做／修改／執行／第 N 批」→ 可直接修改 `main`。
- 每次都要先讀 main、改正式 owner、改完再讀 main 驗證。
