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
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面版＋手機版；iPhone Safari 是重要真機環境。
- 正式存檔策略：**每台裝置平常仍使用自己的本機存檔；Supabase 雲端只提供玩家主動上傳／下載的跨裝置搬移，不做自動同步、不在登入時自動覆蓋本機。**

`backgroundprogress.js` 的 background 指瀏覽器進入背景／失焦後的執行補償，**不是圖片背景 loader**。正式圖片背景預載是 `backgroundpreload.js`。

---

# 2. 修改專案時固定操作規範

1. 修改前一定重新讀取 GitHub `main` 的相關實際檔案，不能只靠 handoff 或聊天記憶。
2. 涉及載入順序、wrapper、全域函式時，重新檢查完整 `index.html`。
3. 使用者說「先討論／先不要修改／先檢查」時，禁止寫入 GitHub。
4. 使用者明確說「做／修改／執行／第 N 批」時，可直接修改 GitHub `main`，不必再次詢問是否要執行。
5. 修改完成後要重新讀取修改後的 `main`，確認內容、載入順序與相依性；不可只相信寫入工具回傳成功。
6. JS / CSS 正式改動後同步更新 `index.html` cache-bust；同名背景 WebP 重製時同步 bump `backgrounds.css` URL query。
7. 不做需求以外的順手重構，不偷偷改平衡、離線目標、存檔語意或玩家流程。
8. 優先修改真正正式 owner；不要新增 late wrapper、fallback、DOM 文字解析、第二套公式或第二套結算。
9. 存檔結構改動要同步檢查 `data.js`、`savemigration.js`、normalizer、`runtimeintegrity.js` 與舊存檔相容性。
10. 桌機與手機 UI 一起檢查。
11. 神話裝備只禁止 **AUTO 自動出售**；未鎖定神話仍可手動單件確認出售，也可符合玩家主動的一鍵出售條件。
12. 一次性 GitHub Actions workflow 若只做資產轉換，輸出驗證進 `main` 後應刪除 workflow，但保留 source 母圖。
13. 帳號／雲端功能不得引入自動同步語意；上傳與下載都必須由玩家主動操作，並在覆蓋前顯示本機／雲端時間、Lv、EXP。
14. Supabase 前端只能使用 Publishable key；不得把 Secret key／service_role 放進 repo 或前端。
15. 帳號 gate 與設定頁帳號區塊不得恢復持續掃描整個 `#main` 的 `MutationObserver`；曾實際造成桌機與手機主畫面嚴重卡頓。
16. 不可把已退休的 JSON 檔案匯入／匯出重新當成正式玩家搬移流程。

---

# 3. 世界、主線與角色能力

- 10 區、100 張地圖、Lv1～500。
- 地圖由 `registerRegionMaps()` 依固定 region/index 註冊，不依 script push 順序決定位置。
- 普通怪／菁英怪依進度解鎖。
- 普通怪、菁英怪與 Boss 都可選擇單場或連續戰鬥；三者共用同一套主線 continuous pipeline、停止按鈕與結算。
- `ui.js` 是正式主線戰鬥入口 owner：`startBattles()` 讀取 `selectedBattleCount`、執行 `healBeforeBattle()`，再把同一個 count 傳給 `beginCombat(count)`；`hpflow.js` 不再覆寫主線 UI 或戰鬥入口。
- `CONTINUOUS_BATTLE_COUNT = "continuous"` 由 `ui.js` 統一提供；`battlepipeline.js` 只讀取這個正式 marker，不維護第二份字串常數。
- `combatpacing.js` 是主線場間節奏 owner，`MAIN_BATTLE_PACING_VERSION = 1`；`mainBattleGapMs(kind)` 正式提供 normal 140ms、elite 220ms、Boss 140ms。
- Boss 首次擊敗會解鎖下一張地圖；若使用連續戰鬥，仍留在原本地圖繼續挑戰同一隻 Boss，不自動跳圖。
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
- 特殊怪與副本不直接掉落強化石；若其掉落裝備實際被出售，仍可依正式裝備出售規則取得強化石。

---

# 7. VIP 與專精

VIP：

- 上限 20。
- 門檻：`2500 × VIP level²`；VIP1=2,500，VIP20=1,000,000。
- VIP4+ 副本 VIP 積分 ×1.1；VIP12+ ×1.2。
- VIP6 特殊遭遇 8%→10%。
- VIP10 特殊怪獎勵 10% 再發動。
- VIP20 防止死亡裝備遺失，EXP 懲罰仍依規則。

8 種專精、各 Lv60：

- `training`
- `scavenge`
- `appraisal`
- `initiative`
- `combo`
- `penetration`
- `counter`
- `drain`

升級到目標 level 的費用為 `1000 × level²`。

---

# 8. 每日副本

每日系統依 UTC+8 日曆日、凌晨 0 點重置。

- 懸賞：Lv5 解鎖，每日最多 20 場真正開始的戰鬥。
- 競技場：Lv15 解鎖，每日最多 20 輪，每輪 3 戰，中間不回血。
- 虛空幻境：Lv25 解鎖，無最高層；起始 `max(1, 歷史最高-100)`；每 10 層 Boss；每日基礎獎勵＝當日最高層×2 VIP積分，每日只能領一次。
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
- elite：70% 1 基礎、30% 2 基礎；理論期望值 1.3。
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

## 9.5 戰鬥結算

- `battlepipeline.js` context 正式累積 battle 與 autoSale 兩類強化石摘要。
- `settlementui.js` 顯示單一全寬「強化石獎勵」橫列。
- 不重複顯示第二層「打怪掉落」「AUTO 出售」說明。
- 同一輪若同時得到基礎＋進階，兩者在同一橫列顯示。
- 戰鬥結算立即換裝後若舊裝 AUTO 出售，因為這筆出售發生在原結算產生之後，仍會另外提示金幣與石頭。

## 9.6 強化 UI 與舊存檔

- 首頁「強化」入口與 `view="enhancement"` render route 已正式整併 `ui.js`。
- `enhancementui.js` 負責頁面、五張欄位卡、確認 modal、實際主能力預覽與強化原子扣款。
- 強化成功後不跳第二個成功 alert，直接 render 最新數值。
- 五張卡桌機維持相同寬度；手機單欄。
- 強化頁 CSS 已移至 `functionuipolish.css`。
- `ENHANCEMENT_UI_VERSION = 4`。
- Save Schema 仍為 12；本輪沒有改存檔語意。
- `engine.js -> newState()` 直接建立 enhancement 初始資料。
- migration pipeline 直接呼叫 `normalizeEnhancementState()`。
- `normalizeEnhancementState()` 會正規化石頭為非負整數、五欄 clamp 0～20，並補齊舊存檔缺少的 enhancement。

---

# 10. 離線收益與強化石

- 最多 12 小時；最短 1 分鐘。
- EXP／金幣／裝備約在線 10%。
- 離線主線強化石效率為正式理論產量的 5%。
- 離線合法目標不含 Boss，因此戰鬥部分不取得進階石。
- 若玩家最後進行的是 Boss，Boss 不覆蓋有效離線刷怪目標；離線收益沿用最近一次有效的普通怪／菁英怪戰鬥紀錄。
- `offlineEnhancementStoneReward()` 只呼叫 `expectedMainlineEnhancementStoneReward()` 取得正式理論值，再套 5%；不手寫第二份 elite EV。
- 整段離線先合計理論量，再 floor；不是每場先 floor。
- 使用與在線相同的 10 級差資格。
- 離線出售裝備的石頭使用正式 `enhancementStoneSaleReward()` 並以共用 merge API 累積。
- `OFFLINE_ENHANCEMENT_PIPELINE_VERSION = 3`。
- `resolveFarmTarget()` 優先最新合法 `battleSamples`，再 fallback `farmMap/farmEnemy`；不是自動搜尋最高已解鎖非 Boss。
- **雲端下載例外：**下載雲端存檔時會把 `offline.lastSettledAt`／`offline.maxObservedWallClock` 重設為下載當下、`timeLockUntil=0`，並清除舊 `pendingSettlement`，避免跨裝置等待時間被誤算或重複發放。

---

# 11. GM 管理與測試

- 設定頁標題連續點擊 3 次可開啟管理功能入口；實際管理密碼不應寫進 handoff。
- `gmhub.js` 是 GM Hub 正式 owner之一，包含強化管理與測試區。
- 強化管理可直接設定五欄正式 +0～+20，不消耗／不改目前強化石。
- `vipgm.js` 正式持有 GM 測試強化狀態與測試玩家快照。
- `gmTestEnhancementLevels` 只存在本頁工作階段，重新整理回 +0。
- 單一「目前狀態」按鈕同步正式 VIP、8 種專精、5 欄強化到測試狀態。
- `gmTestEnhancedEquippedStats()` 使用正式 `equippedStatsWithEnhancementLevels(levels)`，不複製第二套強化公式。
- `gmTestPlayerStats()` 正式整合測試 VIP＋專精＋強化。
- GM 強化 grid CSS 已移到 `functionuipolish.css`。
- `GM_ENHANCEMENT_TEST_PIPELINE_VERSION = 4`。
- `GM_ENHANCEMENT_HUB_VERSION = 4`。

---

# 12. 遊戲說明與完整性檢查

- `GAME_GUIDE_VERSION = 10`。
- 「冒險入門」說明普通怪、菁英怪、Boss 都可單場／連續戰鬥。
- Boss 說明包含：首殺解鎖下一張地圖、連戰可留在原地繼續刷王、戰敗立即停止並需重新擊敗菁英 10 隻。
- 「特殊遭遇」明確說明 Boss 不會觸發特殊怪。
- 「離線收益」說明 Boss 不作為離線刷怪目標，並沿用最近普通／菁英有效紀錄。
- `CLOUD_SAVE_GUIDE_VERSION = 2`；遊戲說明另有「帳號與雲端存檔」區塊，說明手動上傳／下載、覆蓋風險、跨裝置流程與離線收益規則。
- 換裝置重要提醒使用原文字顏色與字體，只以框線、留白與警示符號提高辨識度。

完整性檢查目前分四層：

1. `enhancementmigration.js`：舊／新存檔與 enhancement normalization 相容性，輸出 `ENHANCEMENT_INTEGRITY_REPORT`。
2. `enhancementintegrity.js`：集中驗證強化核心、成本、掉石、出售、離線、戰鬥能力、UI、GM、指南與摘要，輸出 `ENHANCEMENT_FINAL_INTEGRITY`。
3. `bosscontinuousintegrity.js`：`BOSS_CONTINUOUS_INTEGRITY_VERSION = 4`；驗證主線 Boss 單場／連戰共用模式、10 隻菁英重開 Boss、停止邊界、特殊怪排除、background catch-up 排除、離線 Boss 排除、共用 marker／pacing owner 等，輸出 `BOSS_CONTINUOUS_INTEGRITY`。
4. `accountcloudintegrity.js`：`ACCOUNT_CLOUD_INTEGRITY_VERSION = 6`；驗證 Auth v6、統一 Auth mode renderer v1、Cloud Save v2、Cloud Guide v2、登入／登出／忘記密碼／recovery session refresh、上傳／下載 API，以及舊 JSON 匯入／匯出 API、UI、退休 wrapper 都已不存在，輸出 `ACCOUNT_CLOUD_INTEGRITY_REPORT`。

`runtimeintegrity.js` 會要求 `ENHANCEMENT_FINAL_INTEGRITY.passed === true` 與 `BOSS_CONTINUOUS_INTEGRITY.passed === true`，再和世界、Save12、VIP、專精、每日、副本、虛空、退休商店、特殊怪 payout、Guide v10 等檢查形成 `PROJECT_RUNTIME_REPORT`。帳號／雲端完整性目前仍由獨立的 `ACCOUNT_CLOUD_INTEGRITY_REPORT` 補充，不改 Save Schema。

已退休歷史 marker 包含：`ENHANCEMENT_UI_SUCCESS_ALERT_DISABLED`、`ENHANCEMENT_UI_UNIFORM_GRID`、`HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION`、`LEGACY_FILE_SAVE_RETIRED_VERSION`。

---

# 13. Supabase 帳號與手動雲端存檔

## 13.1 帳號 Auth

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
- 登出使用 `scope:"local"`，只結束這台裝置，不刪本機遊戲進度，也不自動登出其他裝置。
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

- 曾經以持續 `MutationObserver` 監看 `#main`，造成桌機／手機主畫面嚴重卡頓；已移除，現在使用 render hook。使用者已實測確認卡頓消失，禁止恢復廣域持續 Observer。
- 登入畫面的「再次輸入密碼」曾因 `.civilization-auth-form label{display:block}` 蓋掉 browser `[hidden]` 行為而錯誤顯示；`supabaseauth.css` 已加入 `.civilization-auth-form [hidden]{display:none!important}`。使用者已實測確認修正。

## 13.2 Supabase Database

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

## 13.3 手動雲端搬移

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
- 顯示本機／雲端的時間、Lv、EXP 覆蓋確認。
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

## 13.4 雲端下載與離線收益

下載雲端存檔時，會：

- `offline.lastSettledAt = 下載當下`
- `offline.maxObservedWallClock = 下載當下`
- `timeLockUntil = 0`
- 清除舊 `pendingSettlement`

因此「原裝置上傳後 → 新裝置下載前」的等待時間**不補發離線收益**。

正式換裝置流程：

**原裝置開遊戲 → 完成當次離線收益結算 → 上傳本機存檔 → 新裝置登入同帳號 → 比對時間／Lv／EXP → 下載雲端存檔。**

`cloudsaveguide.js` 已以明顯但不改字色／字體的框線提醒這件事。

## 13.5 舊 JSON 檔案匯入／匯出已正式退休

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

## 13.6 帳號／雲端本輪三批正式化

第 1 批：

- 舊 JSON 匯入／匯出從 `ui.js` 正式刪除。
- 刪除 `legacysaveretirement.js`。
- Integrity 改為檢查舊 API／UI／wrapper 必須不存在。

第 2 批：

- 帳號 login / signup / forgot / recovery 四種 mode 收斂為單一 renderer。
- 補 recovery 常見繁中錯誤。
- recovery URL 改成精細清理。
- 更新密碼後重新取得正式 session，不再自己拼 session 副本。
- Auth 升到 v6。

第 3 批：

- `ACCOUNT_CLOUD_INTEGRITY_VERSION` 升到 6。
- Integrity 追加 Auth version、mode renderer、recovery refresh 與 legacy wrapper absence 檢查。
- 更新 handoff 與 cache-bust。
- Save Schema、雲端手動搬移語意、離線收益規則、遊戲平衡都未改動。

## 13.7 使用者實測狀態

2026-09-16 使用者已在正式頁實測並確認：

- 帳號登入／建立帳號 UI 可用。
- 移除廣域 MutationObserver 後，桌機／手機卡頓問題消失。
- 登入頁「再次輸入密碼」錯誤顯示問題已修正。
- 雲端上傳成功。
- 雲端下載可正確覆蓋並載入。
- 忘記密碼入口已出現，recovery 流程可進入使用。

這些屬於使用者真機／正式頁實測；不得誤寫成模型已做瀏覽器 runtime 測試。

---

# 14. 背景圖製作與預載 SOP

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

# 15. 目前仍可再優化，但不是未完成功能

目前帳號＋雲端功能沒有待完成的功能需求；剩下主要是架構型技術債，除非使用者明確指定，否則不要順手改：

- `cloudsave.js` 仍以 wrapper 方式延伸 `save()` 來維護獨立的本機存檔時間 metadata；這是刻意避免升 Save Schema 的相容設計。
- `cloudsaveguide.js` 仍是對 `gameGuidePage()` 的相容 extension。若未來要 owner 收斂，可另開專門批次把內容整併到 `gameguide.js`，保持玩家行為完全不變。
- `offlineprogress.js` 仍含 inline offline modal styles，屬既有離線 UI 架構。
- `gmhub.js` 仍以 JS 建立部分 GM Hub 通用 styles，屬既有 ownership。
- `specialization.js` 目前仍含部分 specialization UI inline style 建立邏輯；這不是本輪帳號／雲端問題。
- `backgroundprogress.js` 仍以 wrapper 方式接主線背景執行補償；Boss 已正式排除，未來若重構應獨立開範圍。
- 真機瀏覽器行為仍以實測為重要依據；若出現 stale JS/CSS／背景，先檢查 cache-bust，再判斷其他原因。

**已失效的舊技術債描述：**`legacysaveretirement.js` 已刪除，不再是待收斂 extension；不可再把它列為仍存在的 wrapper。

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
- 強化 UI／GM 以 JS 注入專屬 enhancement CSS 的做法。
- GM 自己複製一套強化主能力公式的做法。
- 出售強化石多層 wrapper 重複 grant 的做法。
- Boss 固定只能單場挑戰的舊規則。
- `hpflow.js` 覆寫 `startBattles()`／`adventurePreparePage()`／`playerStatusHtml()` 的舊做法。
- `HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION` 歷史修補 marker。
- `battlepipeline.js` 自己維護第二份 `"continuous"` marker 或 normal／elite 場間 gap 常數的做法。
- 玩家可見的 JSON 檔案「匯出存檔／匯入存檔」正式搬移流程。
- `exportSave()`、`importSave()`、`isImportableSave()`。
- `legacysaveretirement.js` 與 `LEGACY_FILE_SAVE_RETIRED_VERSION`。
- 登入後自動下載、自動上傳、背景自動同步或以雲端直接覆蓋本機的做法。
- 玩家可見的「重新整理雲端資訊」按鈕。
- 帳號 gate／設定頁以持續廣域 `MutationObserver` 掃描 `#main` 的做法。

---

# 17. 下一個對話如何接手

可直接貼：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際相關程式碼與 `index.html` 載入順序，完整承接《文明戰線》專案。`main` 是唯一真實來源；若 handoff 與 main 衝突，以 main 為準。現在先不要修改。**

若下一個對話直接要求修改，也必須先讀 handoff＋相關 `main`，再依第 2 節規範執行，不需要使用者重新解釋已寫入 handoff 的正式規則。