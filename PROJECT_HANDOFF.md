# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit、模型記憶或任何摘要與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。本文件是交接索引與目前規則摘要，不可取代實際程式碼檢查。

更新日期：**2026-09-17**

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
- `MAX_LEVEL = 500`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 桌面版＋手機版；**iPhone Safari 是重要真機環境**
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 60`
- `ENHANCEMENT_MAX_LEVEL = 20`
- `COMBAT_DAMAGE_MODEL_VERSION = 1`
- `MIRROR_DUNGEON_CONFIG_VERSION = 1`
- `CIVILIZATION_AUTH_VERSION = 6`
- `CIVILIZATION_AUTH_MODE_RENDERER_VERSION = 1`
- `CIVILIZATION_CLOUD_SAVE_VERSION = 2`
- `CLOUD_SAVE_GUIDE_VERSION = 2`
- `ACCOUNT_CLOUD_INTEGRITY_VERSION = 6`

正式存檔策略：**每台裝置平常使用自己的本機存檔；Supabase 雲端只做玩家主動上傳／下載的跨裝置搬移，不做自動同步，也不在登入時自動覆蓋本機。**

`backgroundprogress.js` 的 background 是瀏覽器分頁隱藏／失焦後的主線連戰時間補償，**不是圖片背景 loader**；正式圖片背景預載是 `backgroundpreload.js`。

---

# 2. 下一個 ChatGPT 修改專案時的固定規範

1. **修改前一定先重新讀取 GitHub `main` 的相關正式檔案。** 不可只靠 handoff、模型記憶、上一個對話摘要或舊 commit。
2. 涉及載入順序、全域函式、extension、wrapper 時，必須重新檢查完整 `index.html`。
3. 使用者說「先討論／先不要修改／先檢查」時，**禁止寫入 GitHub**。
4. 使用者明確說「做／修改／執行／第 N 批」時，可以直接修改 GitHub `main`，不用再次詢問是否執行。
5. 修改完成後要重新讀取修改後的 `main`，確認內容、載入順序、版本 marker 與相依性；不可只相信寫入工具回傳成功。
6. **JS / CSS 正式改動後要同步更新 `index.html` cache-bust。** 同名背景 WebP 重製則同步 bump `backgrounds.css` URL query。
7. 純 Markdown 文件（例如本 handoff）修改不需要改 `index.html` cache-bust。
8. 不做需求以外的順手重構，不偷偷改平衡、離線目標、存檔語意或玩家流程。
9. **優先修改正式 owner；不要額外做 late wrapper、fallback、DOM 文字解析、第二套公式、第二套結算、第二套 state owner。**
10. 若正式 owner 已有 extension API，優先使用 extension API，不再包 `render()`／`go()`。
11. 存檔結構改動要同步檢查 `data.js`、`savemigration.js`、normalizer、相關 integrity 與舊存檔相容性。
12. 桌機與手機 UI 一起檢查；手機至少要考慮 iPhone Safari viewport、背景切換、字體與按鈕可讀性。
13. Supabase 前端只能使用 Publishable key；**不得把 Secret key／service_role 放進 repo 或前端。**
14. 帳號 gate 與設定頁不得恢復持續掃描整個 `#main` 的 `MutationObserver`；這曾造成桌機／手機主畫面嚴重卡頓。
15. 不可把已退休的 JSON 檔案匯入／匯出重新當成正式跨裝置流程。
16. 一般主線與鏡像戰基礎傷害以 `combatmath.js` 為唯一公式來源。
17. 鏡像戰場數、解鎖、獎勵、稱號、評語、鏡像專屬比例以 `mirrorconfig.js` 為唯一設定來源。
18. 劇情 Boss 名稱、地圖名稱與區域結構必須以 `WORLD_REGIONS`＋`MAPS` 為正式來源；不要另造第二套世界資料。
19. 正式劇情內容若改動，要重新跑／檢查 Story Data Integrity 與 Story Runtime Integrity。
20. 玩家顯示文字要求「劇情本文全中文」時，**只限制原始正式劇情資料，不限制玩家名稱**；玩家可以取 `Frank`、`Kevin` 等英文名，不能被 UI 改寫。

---

# 3. 世界與主線戰鬥正式基準

## 3.1 世界與地圖

`data.js` 的 `WORLD_REGIONS` 是正式來源，10 區固定如下：

1. `earth`：地球戰爭，Lv1～50，map 0～9
2. `solar`：太陽系戰爭，Lv51～100，map 10～19
3. `nearstar`：近星戰爭，Lv101～150，map 20～29
4. `frontier`：星際邊疆，Lv151～200，map 30～39
5. `orion`：獵戶臂戰爭，Lv201～250，map 40～49
6. `galactic-frontier`：銀河邊境，Lv251～300，map 50～59
7. `galactic-mid`：銀河中域，Lv301～350，map 60～69
8. `core-outer`：銀河核心外圍，Lv351～400，map 70～79
9. `core-war`：銀河核心戰爭，Lv401～450，map 80～89
10. `galactic-unification`：銀河統合戰爭，Lv451～500，map 90～99

地圖由 `registerRegionMaps()` 依固定 region/index 註冊，不依 script push 順序決定位置。

## 3.2 主線單場／連續戰鬥

- 普通怪、菁英怪、Boss 都可選單場或連續戰鬥。
- `ui.js` 是主線戰鬥入口 owner；`CONTINUOUS_BATTLE_COUNT = "continuous"` 由 `ui.js` 提供。
- `battlepipeline.js` 共用同一套 continuous pipeline、停止按鈕與結算。
- `combatpacing.js` 是場間節奏 owner：normal 140ms、elite 220ms、Boss 140ms。
- Boss 首殺解鎖下一張圖；連續戰鬥仍留在原圖繼續打同一 Boss，不自動跳圖。
- Boss 戰敗立即停止連戰、`bossProgress` 歸零並鎖王；需重新擊敗本地圖菁英 10 隻才可再挑戰。
- Boss 不觸發特殊怪，也不消耗黑市情報。
- 商店已退休，Boss 首殺沒有商店刷新副作用。
- `MAIN_BOSS_CONTINUOUS_VERSION = 1`。

## 3.3 瀏覽器背景連戰與離線收益要分清楚

主線普通／菁英／Boss 連續戰鬥都可由 `backgroundprogress.js` 做背景推進：

- `BACKGROUND_PROGRESS_MAIN_SHARED_VERSION = 2`
- 背景時間上限 12 小時
- catch-up credit rate = `0.96`
- 舊 `BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION` 已退休，不得恢復

但**關閉遊戲後的 offline rewards 仍排除 Boss**；Boss 不會成為離線刷怪目標。這兩套系統不可混為一談。

## 3.4 正式基礎能力與共用傷害公式

正式基礎能力：

- `baseHP(l) = ceil(110 + 12 × (l-1))`
- `baseATK(l) = ceil(15 + 2.2 × (l-1))`
- `baseDEF(l) = ceil(7 + 1.2 × (l-1))`

VIP 每級：

- HP +0.5%
- ATK +0.5%
- DEF +0.25%
- 暴擊 +0.25 percentage point
- 閃避 +0.25 percentage point

`combatmath.js` 是主線與鏡像戰共同的傷害公式 owner：

- `COMBAT_DAMAGE_MODEL_VERSION = 1`
- DEF 權重 `0.55`
- 隨機浮動 `0.95 + rng × 0.10`
- `damage = max(1, ceil((ATK - DEF×0.55) × random))`
- `combatDamageWithRng(atk, def, rng)` 可注入 RNG
- `calcDamage()` 只是相容入口，仍轉給同一公式

不得在其他模組再複製第二份 `(ATK - DEF×0.55)` 傷害公式。

---

# 4. 裝備、商店、特殊怪、VIP、專精

## 4.1 商店已正式退休

- 無商店入口、頁面、購買、刷新、價格重置或冷卻。
- 正式新存檔不含 `state.shop`；Save 12 migration 會移除舊 `shop`。
- `shopbalance.js`、`shopretirement.js` 已刪除。
- 不應恢復 `newShopState`、`ensureShop`、`paidShopRefresh`、`freeShopRefresh`、`shopPurchase`、`resetShopPrice`、`specialApplyShopDiscount` 等舊 API。
- `assets/backgrounds/inventory-shop/` 仍保留作背包背景，資料夾名稱只是歷史命名。

## 4.2 裝備與背包

正式部位：`weapon / helmet / armor / shoes / accessory`。

主能力：

- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：HP
- 飾品：CRIT

- `equipmentScore()` 維持原始裝備評分；強化不修改 item aggregate stats、`mainStat.value` 或 equipmentScore。
- 鎖定裝備不會被出售。
- 神話 q5 **只禁止 AUTO 自動出售**；未鎖定神話仍可玩家主動單件出售或符合主動一鍵出售條件。
- `state.lostGear` 可贖回或永久放棄。
- `inventoryredemption.js` 已退休，贖回 UI 已整併 `ui.js`。

## 4.3 特殊怪與黑市情報

- 特殊遭遇基礎 8%；VIP6+ 為 10%。
- 九種特殊怪：稀有資源聚合體、誘餌補給艙、終止協議單元、機率增幅信標、封存警戒機、裝備保全單元、黑市武裝頭目、戰利品回收者、流動交易代理人。
- 黑市武裝頭目勝利可建立 `state.pendingBlackMarketEncounter=true`。
- 下一次符合條件的一般主線普通／菁英勝利會強制觸發另一隻特殊怪，排除黑市武裝頭目。
- Boss、不合條件或戰敗不消耗情報。
- VIP10 若特殊怪獎勵再發動，黑市頭目只重複金幣，不給第二份情報。
- 特殊怪與副本不直接掉強化石；掉落裝備若被正式出售，仍依出售規則取得石頭。

## 4.4 VIP

- 上限 20。
- 升級門檻：`2500 × VIP level²`。
- VIP4+ 一般副本 VIP 積分 ×1.1；VIP12+ ×1.2。
- VIP6：特殊遭遇率 8%→10%。
- VIP10：特殊怪獎勵 10% 再發動。
- VIP20：防止死亡裝備遺失，但 EXP 懲罰仍存在。
- 鏡像戰獎勵不走一般副本倍率。

## 4.5 八種專精，各 Lv60

- `training`：每級 EXP +2.5%
- `scavenge`：每級怪物金幣 +2.5%
- `appraisal`：每級裝備售價 +2.5%
- `initiative`：每級第一次主動攻擊傷害 +1%
- `combo`：每級連擊率 +0.5%；追加攻擊 50% 傷害，可再次觸發
- `penetration`：每級穿透率 +0.5%；觸發時 DEF ×0.75
- `counter`：每級反擊率 +0.5%；反擊第一擊 40% 傷害
- `drain`：每級汲取率 +0.5%；回復該擊實際傷害 10%

升到目標 level 的費用：`1000 × level²`。

---

# 5. 每日副本與鏡像戰

每日系統依 UTC+8 日曆日、凌晨 0 點重置。

- 懸賞戰：Lv5，每日最多 20 場真正開始的戰鬥；主獎勵 EXP／金幣／裝備。
- 競技場：Lv15，每日最多 20 輪，每輪 3 戰，中間不回血；主獎勵 VIP 積分。
- 虛空幻境：Lv25，無最高層；起始 `max(1, 歷史最高-100)`；每 10 層 Boss；每日基礎獎勵＝當日最高層×2 VIP 積分，每日只能領一次。
- 鏡像戰：Lv50，每日正式挑戰 1 次，固定 20 場。

`dungeonui.js` 提供正式 extension API：

- `registerDungeonViewRenderer()`
- `registerDungeonHomeCardRenderer()`
- `registerDungeonPostRenderHook()`
- `registerDungeonNavigationGuard()`

`DUNGEON_UI_EXTENSION_VERSION = 1`。

## 5.1 鏡像戰單一設定來源

`mirrorconfig.js`：

- Lv50 解鎖
- 固定 20 場
- 勝場獎勵：`20 × wins²` VIP 積分
- 20 勝＝8000 VIP 積分
- 稱號：15 幸運眷顧、16 天選之刻、17 逆命者、18 傳說之日、19 距神一步、20 神蹟
- 0～20 勝共有 21 句結果評語
- 專屬比例：counter 0.40、combo 0.50、penetration DEF multiplier 0.75、drain 0.10

## 5.2 鏡像狀態／安全規則

`state.dungeon.mirror` 正式保存 history 與 daily；`MIRROR_DUNGEON_STATE_VERSION = 2`。

- daily status：`idle / running / completed / failed`
- 開始正式挑戰時先寫 `running`，並要求 `save(false) === true`；失敗則回滾，不耗機會、不開戰。
- 同日 reload 發現舊 running → failed，今日不能重打。
- 跨日舊 running → 新一天 idle。
- 同 session 23:59 開始、00:01 完成仍算開始日，不占新一天機會。
- 正式保留 `bestWins / bestDate / miracleDates`。
- 20 勝每次 append 神蹟日期；GM 重置後同日再 20 勝可保留重複日期。
- Save Schema 仍為 12，不為鏡像升到 13。

## 5.3 鏡像戰鬥核心

- `MIRROR_COMBAT_CORE_VERSION = 3`
- 每場雙方滿血、獨立，50/50 先攻。
- 正式 20 場開始前鎖一份玩家快照，20 場共用。
- 真正能力以 `playerCombatStats()` 最終 stats 為來源。
- 基礎傷害呼叫 `combatDamageWithRng()`，缺少時直接 error，不 fallback。
- combo／counter／penetration／drain／initiative 規則依正式專精與 `mirrorconfig.js`。
- counter 鏈不可再觸發反反擊；死亡後停止未發生 combo/counter。

## 5.4 鏡像流程與 GM

- `MIRROR_RUN_VERSION = 2`
- 正式 20 場無停止 API；進行中由 dungeon navigation guard 阻止站內離開。
- 玩家本體 `state.hp` 不因鏡像戰扣血。
- 單場不發 EXP、金幣、裝備、石頭、特殊怪、主線進度，不套死亡懲罰。
- 完成 20 場自動發獎。
- 結算有 rollback 保護，避免狀態失敗但 VIP 已發放的半套結果。

GM：

- 重置今日鏡像戰：只把今日狀態回 idle，不改歷史。
- 測試 1 次＝20 場；測試 100 次＝2000 場。
- 對稱回歸 64 組＝128 場，固定 RNG、交換先攻，不改正式資料。
- Production final integrity 只跑 8 組 smoke pair＝16 場，完整 64 組留給 GM 手動測試。

---

# 6. 裝備欄位強化系統

`state.enhancement = { basicStones, advancedStones, levels:{weapon,helmet,armor,shoes,accessory} }`

- 五欄永久強化，上限 +20。
- 每級提高目前裝備**原始主能力** 2.5%，+20 = +50%。
- 不乘基礎能力、affix、專精、VIP 或其他來源。
- 強化不修改裝備物件原始值與 equipmentScore。
- 強化到目標 +N 成本：基礎石 `100×N`、進階石 `5×N`。
- 單欄 +0→+20 累積：21,000 基礎＋1,050 進階。
- 100% 成功，只花石頭、不花金幣。

主線掉石：

- normal：1 基礎
- elite：70% 1 基礎、30% 2 基礎，EV=1.3
- boss：1 進階
- 資格：`playerLevel - monsterLevel < 10`
- 高於怪物 10 級（含）以上只取消石頭，不影響其他獎勵

裝備出售：

- q4 傳說：+5 基礎
- q5 神話：+1 進階
- 單件、一鍵、AUTO、換裝舊裝 AUTO 出售都共用正式 grant owner

`enhancementrewards.js` 提供正式 expected／grant／sale reward API；離線理論量也必須呼叫正式 expected API，不手寫第二份 elite EV。

---

# 7. 離線收益

- 最多 12 小時；最短 1 分鐘。
- EXP／金幣／裝備約在線 10%。
- 離線主線強化石效率＝正式理論產量 5%。
- 離線合法目標不含 Boss。
- 若最後打的是 Boss，不覆蓋最近有效普通／菁英離線目標。
- `resolveFarmTarget()` 優先最新合法 `battleSamples`，再 fallback `farmMap/farmEnemy`。
- 雲端下載後會重設 offline wall-clock 與 pending settlement，避免跨裝置等待時間誤算／重複發放。

---

# 8. Supabase 帳號與手動雲端存檔

## 8.1 Auth

正式 Supabase project：`civilization-frontline`。

`supabaseauth.js` 是帳號 owner：

- Email + Password
- `persistSession:true`
- `autoRefreshToken:true`
- `detectSessionInUrl:true`
- login / signup / forgot / recovery 四種模式集中由 `AUTH_MODES + renderAuthMode()` 管理
- 登出使用 local scope，只結束目前裝置 session，不刪本機進度
- 忘記密碼以 `resetPasswordForEmail()`；recovery 後 `updateUser({password})`，再重新取得正式 session
- recovery 使用 sessionStorage flag 輔助
- 只清 Auth recovery 相關 URL 參數
- 常見錯誤已繁中化

重要歷史 bug：曾用持續 `MutationObserver` 掃描 `#main`，造成嚴重卡頓，已移除；**禁止恢復**。

## 8.2 Database／Cloud Save

`public.game_saves`：每帳號固定一列，RLS ON，authenticated policy 只允許 `auth.uid()` 存取自己的 `user_id`。

`cloudsave.js` 正式原則：**只手動上傳／下載，不自動同步。**

設定頁：

- 上傳本機存檔
- 下載雲端存檔

覆蓋前顯示：

- 存檔時間
- Lv
- EXP

`revision` 只供內部控制，不顯示玩家。

跨帳號保護：本機已綁 A 帳號時，不允許登入 B 後把 A 的本機進度上傳到 B；仍可下載 B 雲端覆蓋本機，成功後本機 owner 改綁 B。

`cloudsave.js` 目前仍 wrapper 全域 `save()` 以維護獨立本機存檔時間 metadata；這是現有 main 技術債，不要在無關任務中順手拆。

舊 JSON「匯出／匯入存檔」已真正退休；`exportSave()`、`importSave()`、`isImportableSave()`、`legacysaveretirement.js` 都不得恢復。

---

# 9. 圖片背景與預載 SOP

母圖：`assets/backgrounds-source/<功能名稱>/`

Runtime：`assets/backgrounds/<功能名稱>/`

正式轉換規格：Ubuntu runner、Python 3.12、Pillow、RGB、Desktop 最大寬1536、Mobile最大寬1080、LANCZOS、WebP quality=72、method=6。

- `backgrounds.css` 管理正式背景 URL。
- `backgroundpreload.js` 依目前 viewport 有效 media rules 預載 `/assets/backgrounds/`，排除 `/backgrounds-source/`。
- 使用 `Set` 去重＋`new Image()`；最多等待 12 秒。
- 同名 WebP 重製後必須 bump `backgrounds.css` URL query。
- 一次性轉換 workflow 完成後刪除 workflow，source 母圖保留。

---

# 10. 正式劇情系統：2026-09-17 最新基準

這是本次對話新增／完成的最大系統。正式故事已從只有地球章擴充為完整第一部。

## 10.1 故事規模與資料 owner

正式故事總數：**101 篇**。

- 1 篇序章：`earth-prologue`
- 100 個 Boss 首殺正式故事：10 區 × 10 Boss

正式資料檔：

- `storydata-earth.js`（Earth V2，含序章＋10 Boss）
- `storydata-solar.js`
- `storydata-nearstar.js`
- `storydata-frontier.js`
- `storydata-orion.js`
- `storydata-galactic-frontier.js`
- `storydata-galactic-mid.js`
- `storydata-core-outer.js`
- `storydata-core-war.js`
- `storydata-galactic-unification.js`

Earth 會先初始化 `window.CIVILIZATION_STORY_REGIONS`；後九區依序 push 自己的區域資料。

`STORY_BIBLE.md` 是故事設定／創作規範索引，但**真正遊戲資料仍以 `storydata-*.js`＋正式地圖為準**。

## 10.2 故事寫作正式規則

- 主角就是使用者；敘事使用「你」。
- 對話中的玩家名字用 `{角色名稱}`。
- 正式故事本文不得把主角稱為「玩家」。
- 劇情原始資料要求全中文；英文玩家名字是合法動態輸入，不受此限制。
- `storyui.js` 只負責 `{角色名稱}` → 實際玩家名，不再做 `Boss/respected` 等顯示層英文自動替換。
- 玩家可以叫 Frank / Kevin / Sky1207，UI 必須原樣顯示。
- 故事成熟戰爭風、重視代價、責任與選擇；不是爽文式「主角永遠正確」。
- 主角可犯錯、被批評、承擔後果。
- 反派可有合理秩序論點；不是每個敵人都必須哲學化。
- 核心人物可永久死亡，但應少而重。
- 主角不安排戀愛線。
- 科學與技術有邏輯限制，不用教科書式講解。
- 約 60% 外星文明可偏類人，但只是創作偏好，不是程式硬規則。

## 10.3 十區主題／情緒曲線

1. 地球：恐懼 → 人類第一次合作
2. 太陽系：勝利後的不安、隔離／守門問題
3. 近星：人類開始被其他文明看見與評判
4. 星際邊疆：自由的真實成本
5. 獵戶臂：擁有力量後的責任
6. 銀河邊境：歷史與秩序制度的罪／功
7. 銀河中域：集中權力的誘惑
8. 核心外圍：未知、物理極限、人類其實很小
9. 銀河核心戰爭：沒有乾淨答案
10. 銀河統合戰爭：選擇權本身的價值

核心哲學問題：**一個文明是否值得保有犯錯、失敗、爭吵與重新選擇的權利？**

最終不是「所有秩序都錯」，而是：秩序確實救過文明；自由確實會造成死亡；但任何最高答案都必須能被拒絕、覆核、撤回。

## 10.4 重要角色／長線事件

- 原地球核心角色包含指揮官、副官、情報官、工程官、醫療官。
- 近星加入伊薩文明調停者「瑟安」，後續成為跨文明長線角色。
- 銀河邊境加入流亡文明代表「伊芮」，保留公開反對主角的權利，不是主角隨從。
- 獵戶臂最終戰中，**原指揮官永久死亡**；其先前爭議／違規紀錄不因犧牲而被洗白，後面章節持續保留其空缺與影響。
- 銀河中域中副官曾因主角批准緊急監控而離開前線數週，之後回歸但仍保留不同意見。
- 核心戰爭中情報官曾離開文明戰線，進入裁決系統內部改革；不是背叛，後續揭露政治操弄後回歸。

## 10.5 最終主線固定設定

最終 Boss 正式名稱：**銀河征服中樞**。

它不是突然發瘋的 AI，而是數萬年緊急治理、風險模型、文明授權與自動化權限一層層累積形成的最高系統。

最終解法不是把所有公共系統炸掉：

- 航道同步保留
- 黑洞／巨構安全保留
- 危險技術監測保留
- 緊急聯合指揮保留
- 移除的是不可撤回、不可覆核、不可退出的最高強制權

最終兩句固定訊號必須依序存在：

1. `本地連續體封閉狀態解除。`
2. `外層觀測開始。`

第一部不解釋「外層」是什麼；只留更大世界接口。

正式結尾為：`《文明戰線》第一部　完`。

## 10.6 首殺觸發與 pending 流程

- `combatcore.js`：Boss 首次擊敗會產生 `firstBossKill=true`、`bossMapIndex`，並嘗試 queue 正式故事。
- `MAINLINE_BOSS_FIRST_CLEAR_SIGNAL_VERSION = 2`。
- `battlepipeline.js`：`queueFirstClearStory()` 會把故事寫入 context `pendingStoryId`；連續戰鬥若遇首殺故事會要求本場後停止。
- `MAINLINE_BOSS_STORY_PIPELINE_VERSION = 1`。
- 正式進度存在 `state.storyProgress`。
- pending 必須持久化；故事真正看完才加入 completed 並清除 pending。
- 首次 Boss 劇情會中止連戰，避免故事期間背景繼續刷王。
- 重播 completed story 不給獎勵、不改進度。

## 10.7 Story UI

`storyui.js`：

- `STORY_UI_VERSION = 5`
- 固定近正方形 story modal，無內部捲動。
- 每頁以分頁呈現，不把整篇塞進長卷軸。
- 顯示 chapter / location / title / page number。
- 最後一頁按「結束」，只有真的停在最後一頁關閉才觸發 onComplete。
- `{角色名稱}` 在顯示時換成實際玩家名；若無正式名字，以「作戰員」顯示。

序章是強制 onboarding：新玩家先看 `earth-prologue`，之後才完成初始裝備發放與進主畫面。

## 10.8 Story Migration／舊玩家回填

`storymigration.js`：

- `STORY_MIGRATION_VERSION = 1`
- 專門負責建立／正規化 `storyProgress` 與歷史 Boss 劇情回填。

`storyprogress.js`：

- `CIVILIZATION_STORY_PROGRESS_VERSION = 6`
- 主要負責 pending、completed、序章、初始裝備、Boss story mapping、正式 resume。

舊玩家回填規則：

- 舊存檔沒有 storyProgress 時，不會被當成新角色強制重看序章。
- 只有 `bossKilled[mapIdx] === true` 才會補 completed story。
- pending 的那篇不會被回填成 completed。
- 已完成的不重複加入。
- 每區只做一次歷史 backfill，記錄在 `historyBackfillRegions`。
- `completedStories`、`historyBackfillRegions` 都會去重。
- Save Schema **仍是 12**；故事系統沒有為此升 Schema。

## 10.9 戰線紀錄 UI

正式 owner：`storyrecordtabs.js`。

- `STORY_RECORD_TABS_VERSION = 3`
- 序章獨立顯示。
- 10 大區域作為區域分頁。
- **尚未有任何已完成 Boss 劇情的區域完全不顯示**，不放 `???`，避免劇透。
- 區內只顯示已完成故事。
- 手機：固定兩欄，完整十區時為 5 排 × 2 欄。
- 桌機：flex 自然橫向排列並自動換行，不硬切兩欄。
- 每次從其他頁重新進入「戰線紀錄」都會自動選擇目前最新有紀錄的區域。
- 同一次停留在戰線紀錄頁內手動切區，只 `render()`，不會被強制跳回最新區。
- 重播不給獎勵、不改 completed/pending。

注意：目前 `storyrecordtabs.js` 為了實現「重新進頁＝最新區」會 wrapper `window.go`；功能正確，但這是現存技術債。未來若 UI 有正式 route-enter hook，應專門批次改用 owner API，不要再疊第二層 wrapper。

## 10.10 劇情 GM 測試

`gmstorytest.js`：

- `GM_STORY_TEST_VERSION = 2`
- 純預覽，不改角色進度、不記錄已讀、不發獎。
- 可選區域／故事。
- 顯示 story ID。
- 顯示本區第幾篇／總篇數。
- 顯示總頁數。
- 上一區／下一區。
- 上一篇／下一篇。
- 顯示 Story Data Integrity 狀態與 `101/101` 故事數。
- 顯示 Story Runtime Integrity 狀態。
- 有「重新檢查完整性」按鈕，會真正重新執行 data integrity＋runtime integrity。

## 10.11 Story Data Integrity

`storyintegrity.js`：

- `STORY_INTEGRITY_VERSION = 4`
- `runCivilizationStoryIntegrity()` **每次呼叫都真正重新掃描資料**，不是回傳第一次載入時的舊 report。
- report 含 `checkedAt`。
- 檢查世界 10 區、故事 registry 10 區、順序、名稱。
- Earth 必須 11 筆（序章＋10 Boss），其他區各 10 筆。
- 正式故事總數必須正好 101。
- 正式 Boss story 必須正好 100。
- 反向抓未登錄／多出的 story ID。
- story ID、Boss title、map location、chapter 必須和正式 `WORLD_REGIONS`／`MAPS` 一致。
- 每個 Boss 故事最低 7 頁；超過 20 頁 warning。
- 單頁可見文字超過約 230 字 warning，提醒手機實機確認。
- 正式原始劇情若含「玩家」直接 error。
- 正式原始顯示資料若含 A-Z / a-z 直接 `STORY_ENGLISH_DISPLAY_TEXT` error。
- **英文檢查只掃原始故事資料，不掃玩家名字代換後的畫面。**
- 檢查最終兩句固定訊號存在且順序正確。
- 檢查十個 storydata 版本皆載入。

## 10.12 Story Runtime Integrity

`storyruntimeintegrity.js`：

- `STORY_RUNTIME_INTEGRITY_VERSION = 2`
- 放在 migration、progress、戰線紀錄之後執行。
- 會先重新執行 Story Data Integrity。
- 檢查 Story UI、migration、progress、戰線紀錄、GM 測試必要 API 與最低版本。
- 檢查 100 張地圖全部能透過 `bossStoryId(mapIdx)` 對應到存在的正式故事。
- 檢查目前 completed／pending／historyBackfillRegions 格式。
- completed 若含找不到資料的舊 ID 會 warning；pending 指向不存在資料則 error。

重要 bug 修正：`WORLD_REGIONS` 與 `MAPS` 在 `data.js` 是頂層 `const`，**不是 `window.WORLD_REGIONS/window.MAPS`**。Story Integrity／Runtime Integrity 已改回讀正式 lexical global；未來不可再誤改成只讀 `window.*`。

---

# 11. GM 管理總覽

- 設定頁標題連點 3 次可開管理入口；實際管理密碼不要寫進 handoff。
- `gmhub.js` 是主要 owner。
- `gmhubextensions.js` 提供 `registerGmHubSection(mode,title,renderer,options)`；新 GM 模組優先使用這個 API。
- `gmhubextensions.js` 目前內部仍以集中 wrapper 延伸 `gmHtml()`，屬現存技術債；不要再疊另一套 wrapper。

強化 GM：

- 可設定五欄正式 +0～+20，不消耗強化石。
- 測試玩家可同步正式 VIP、8 專精、5 欄強化。
- GM 強化能力必須呼叫正式 `equippedStatsWithEnhancementLevels()`，不可複製第二套公式。

鏡像 GM：見第 5 節。

劇情 GM：見第 10.10 節。

---

# 12. 完整性檢查最新層次

目前主要完整性鏈（實際順序仍以最新 `index.html` 為準）：

1. `worldmapregistrycheck.js`：世界地圖註冊。
2. `storyintegrity.js`：101 篇正式故事 Data Integrity。
3. `mirrordungeonintegrity.js`：鏡像 config／API／快照／共用傷害等。
4. `enhancementintegrity.js`：強化核心、成本、掉石、出售、離線、UI、GM。
5. `bosscontinuousintegrity.js`：Boss 單場／連戰、鎖王、三種怪共用背景推進、Boss 離線排除等。
6. `accountcloudintegrity.js`：Auth／Cloud Save／舊 JSON API 已退休。
7. `runtimeintegrity.js`：專案主 runtime 檢查。
8. `mirrorfinalintegrity.js`：鏡像最終 state／舊資料／smoke 回歸。
9. `storyruntimeintegrity.js`：故事 UI／migration／progress／戰線紀錄／GM／100 Boss mapping 最終 runtime 檢查。

注意：`storyruntimeintegrity.js` 是後加的故事專用最終檢查，載入於 `storyrecordtabs.js` 後。

---

# 13. 2026-09-17 本對話期間完成的修改

## 13.1 100 Boss 完整主線故事

- 保留／延續既有 Earth 序章＋10 Boss。
- 新增 Solar～Galactic Unification 共 90 Boss 正式故事。
- 新增 `STORY_BIBLE.md`。
- 第一部 10 區完整敘事、長線角色、跨區後果與最終結局皆已落入 main。
- 最終 Boss＝銀河征服中樞。
- 最終固定訊號與「第一部完」已正式寫入。

## 13.2 全中文故事資料清理

- 清除正式故事中的 `respected`、`Boss戰`、`最後Boss`、`因Boss倒下` 等英中混字。
- `storyui.js` 移除顯示層英文自動替換補丁。
- 玩家英文名字不受全中文規則限制。
- Story Integrity 將正式原始顯示文字中的英文字母列為 error。

## 13.3 戰線紀錄重做

- 舊的一路向下 100 篇長列表已退休。
- 新增 `storyrecordtabs.js` 作正式戰線紀錄 UI owner。
- 手機兩欄五排上限；桌機自然排列。
- 未打到區域完全不顯示。
- 每次重新進頁自動跳最新區。
- 舊 `storyprogress.js` 內的戰線紀錄 renderer／CSS 已移除。

## 13.4 Story migration／integrity 分層

- 新增 `storymigration.js`，把 legacy/backfill 從 `storyprogress.js` 分離。
- `storyprogress.js` 升 V6。
- `storyintegrity.js` 改成真正可重跑 V4。
- 新增 `storyruntimeintegrity.js` V2。
- 自我檢查過程曾抓到 `WORLD_REGIONS/MAPS` lexical global 取用錯誤，已修正。

## 13.5 GM 劇情測試 V2

- 新增 integrity 狀態、重新檢查按鈕、story ID、頁數、上一篇／下一篇、上一區／下一區。
- 維持純預覽，不改正式 storyProgress。

## 13.6 本對話中故事相關自我回歸

已重新確認：

- 10 個 storydata 載入順序正確。
- Story Data Integrity 在所有 storydata 後。
- migration 在 storyprogress 前。
- storyrecordtabs 在 storyprogress 後。
- storyruntimeintegrity 在 storyrecordtabs 後。
- 100 Boss ID／Boss 名稱／map location 由 integrity 交叉檢查。
- 最終兩句固定訊號順序受 integrity 保護。
- Save Schema 沒有因故事系統升級。

---

# 14. 目前已知技術債／尚未完成項目

目前沒有已知「玩家正式功能必須立刻完成」的阻斷項目；故事第一部、鏡像戰、Boss 背景連戰、帳號與手動雲端都已進 main。

仍存在但**不要在無關任務中順手重構**的技術債：

- `cloudsave.js` wrapper `save()` 維護本機存檔時間 metadata。
- `supabaseauth.js` 以集中 render hook 延伸帳號設定；禁止再疊廣域 DOM Observer。
- `gmhubextensions.js` 仍以集中 wrapper 延伸 `gmHtml()`。
- `backgroundprogress.js` 仍 wrapper `beginCombat()`／`runBattles()`。
- `storyrecordtabs.js` 目前 wrapper `window.go` 來實作「每次進戰線紀錄跳最新區」。若未來有正式 route-enter extension，應專案式收斂，不再包第二層。
- `dungeonui.js` 與 `dungeonreturnlabels.js` 有少量返回文字正規化重複。
- `cloudsaveguide.js` 仍是遊戲說明 extension。
- `offlineprogress.js` 有 inline modal styles。
- `gmhub.js`、`specialization.js`、部分鏡像 UI/run 仍注入局部 CSS。
- Story Data Integrity 的文字密度目前只 warning，不會自動拆頁；真正手機閱讀密度仍應以實機為準。
- 使用者目前只實際玩到前段／太陽系附近；**101 篇不是全部都已由使用者逐篇真機閱讀測試**。
- 第 3 批 GM V2 與最新 story runtime integrity 已做程式碼回讀／自我檢查，但不得誤寫成模型已在 iPhone Safari 實機完整點過所有按鈕。
- 真機若看見 stale JS/CSS，先檢查 cache-bust／瀏覽器快取，再判斷其他原因。

目前沒有理由升 Save Schema；不要擅自改成 13。

---

# 15. 已退休／不得從舊資料恢復

- 裝備商店商品系統、刷新、Boss 首殺商店刷新、黑市商店折扣、`state.shop`。
- `shopbalance.js`、`shopretirement.js`。
- `inventoryredemption.js`。
- `blackmarketsettlement.js`。
- 舊共享副本 `progress / attempts / activeRun / points`。
- 舊 VIP `1000 × Lv²`。
- 專精 Lv30 上限。
- 虛空最高5000層／逐層首通 VIP／舊 void API。
- `continuousbattle.js`。
- 舊 `dungeonvoidgmui.js`。
- 強化離線 DOM Observer／文字解析 workaround。
- `enhancementrewardintegration.js`、`enhancementnav.js`、`enhancementgm.js`、`enhancementfinalize.js`。
- GM 自己複製強化主能力公式。
- 出售強化石多層 wrapper 重複 grant。
- Boss 固定只能單場。
- Boss 排除瀏覽器 background catch-up。
- `BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION`。
- `hpflow.js` 覆寫主線入口／狀態 UI 的舊做法。
- `HP_FLOW_BOSS_CONTINUOUS_FIX_VERSION`。
- `battlepipeline.js` 自己維護第二份 continuous marker 或場間 gap 常數。
- 鏡像戰第二份基礎傷害公式。
- 鏡像 state 自己包 dungeon normalizer/finalizer。
- 鏡像 UI/run 自己包全域 render/go 的舊做法。
- `dungeonreturnux.js` 與用 HTML 文字判斷 phase 的舊做法。
- Production 每次載入跑完整 64 組／128 場鏡像回歸。
- 玩家可見 JSON 匯出／匯入搬移流程。
- `exportSave()`、`importSave()`、`isImportableSave()`、`legacysaveretirement.js`。
- 登入後自動下載／上傳／背景同步或雲端自動覆蓋本機。
- 玩家可見「重新整理雲端資訊」按鈕。
- 帳號 gate／設定頁持續廣域 MutationObserver。
- 舊「所有戰線紀錄 100 篇一路往下拉」UI。
- `storyprogress.js` 內舊 `storyRecordPageHtml()`／舊戰線紀錄 CSS。
- `storyui.js` 顯示端 `formalChineseText()` 英文替換補丁。
- Story Integrity 只在載入時算一次、之後回傳舊 report 的舊做法。

---

# 16. 最新重要載入順序與 cache-bust

**不要只看本節；每次修改仍要重讀完整 `index.html`。**

目前故事相關正式順序：

1. 十個 `storydata-*.js`
2. `storyintegrity.js`
3. `storyui.js`
4. `gmstorytest.js`
5. 其他戰鬥／offline／cloud／dungeon 模組與專案 integrity
6. `storymigration.js`
7. `storyprogress.js`
8. `storyrecordtabs.js`
9. `storyruntimeintegrity.js`
10. `backgroundpreload.js`

目前故事相關 cache keys：

- `storydata-earth.js?v=20260916-story-earth2`
- `storydata-solar.js?v=20260917-story-clean1`
- `storydata-nearstar.js?v=20260917-story-clean1`
- `storydata-frontier.js?v=20260917-story-clean1`
- `storydata-orion.js?v=20260916-story-full2`
- `storydata-galactic-frontier.js?v=20260917-story-clean1`
- `storydata-galactic-mid.js?v=20260916-story-full1`
- `storydata-core-outer.js?v=20260917-story-clean1`
- `storydata-core-war.js?v=20260917-story-clean1`
- `storydata-galactic-unification.js?v=20260917-story-clean1`
- `storyintegrity.js?v=20260917-story-integrity3`
- `storyui.js?v=20260917-story-clean1`
- `gmstorytest.js?v=20260917-story-gm2`
- `storymigration.js?v=20260917-story-runtime3`
- `storyprogress.js?v=20260917-story-runtime3`
- `storyrecordtabs.js?v=20260917-story-record-tabs3`
- `storyruntimeintegrity.js?v=20260917-story-runtime4`

其他重要 owner 仍包含：

- `engine.js`
- `combatmath.js`
- `combatcore.js`
- `mirrorconfig.js`
- `mirrorcombatcore.js`
- `dungeonprogress.js`
- `savemigration.js`
- `enhancementrewards.js`
- `battlepipeline.js`
- `backgroundprogress.js`
- `offlineprogress.js`
- `cloudsave.js`
- `dungeonui.js`
- `mirrordungeonrun.js`
- `mirrordungeonintegrity.js`
- `enhancementintegrity.js`
- `bosscontinuousintegrity.js`
- `accountcloudintegrity.js`
- `runtimeintegrity.js`
- `mirrorfinalintegrity.js`

---

# 17. 使用者已確認／實測的重要狀態

截至目前對話中已明確確認：

- 帳號登入／建立帳號 UI 可用。
- 移除廣域 MutationObserver 後桌機／手機卡頓問題消失。
- 雲端上傳／下載可運作。
- 忘記密碼／recovery 流程可進入。
- 鏡像戰正式 20 場流程可完成。
- 鏡像戰手機勝敗文字可讀。
- Boss 連續戰鬥切背景後會像普通／菁英一樣背景推進。
- 故事 modal 在手機已有實際遊玩經驗。
- 戰線紀錄分區 UI 已由使用者確認「OK」，之後才進行 1～3 批程式整理。

這些屬於使用者回報／真機實測；**不要誤寫成模型自己完成瀏覽器 runtime 實測。**

---

# 18. 下一個對話如何接手

標準接手指令：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際相關程式碼與完整 `index.html` 載入順序，完整承接《文明戰線》專案。`main` 是唯一真實來源；若 handoff、聊天記憶、舊規格或舊 commit 與 main 衝突，以 main 為準。現在先不要修改。**

若下一個對話直接要求修改，則使用：

> **先讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新讀取本次需求涉及的 `main` 正式 owner、相依檔案與完整 `index.html`。確認現況後直接依需求修改 GitHub `main`；修改後重新讀取 main 自我檢查，JS/CSS 改動同步更新 `index.html` cache-bust。優先修改正式來源，不要新增不必要 wrapper、fallback、第二套公式、第二套結算或第二套 state owner。**
