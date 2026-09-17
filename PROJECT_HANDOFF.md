# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit、模型記憶或任何摘要與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。本文件是交接索引與最新規則摘要，不可取代實際程式碼檢查。

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

正式存檔策略：**每台裝置平常使用自己的本機存檔；Supabase 雲端只做玩家主動上傳／下載的跨裝置搬移，不做自動同步，也不在登入時自動覆蓋本機。**

`backgroundprogress.js` 的 background 是瀏覽器分頁隱藏／失焦後的主線或副本時間補償；正式圖片背景預載是 `backgroundpreload.js`，兩者不可混淆。

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
12. 桌機與手機 UI 一起檢查；手機至少要考慮 iPhone Safari viewport、safe area、文字密度、按鈕可讀性與 cache。
13. Supabase 前端只能使用 Publishable key；**不得把 Secret key／service_role 放進 repo 或前端。**
14. 帳號 gate 與設定頁不得恢復持續掃描整個 `#main` 的 `MutationObserver`；這曾造成嚴重卡頓。
15. 不可把已退休的 JSON 檔案匯入／匯出重新當成正式跨裝置流程。
16. 一般主線與鏡像戰基礎傷害以 `combatmath.js` 為唯一公式來源。
17. 鏡像戰場數、解鎖、獎勵、稱號、評語、鏡像專屬比例以 `mirrorconfig.js` 為唯一設定來源。
18. 劇情 Boss 名稱、地圖名稱與區域結構必須以 `WORLD_REGIONS`＋`MAPS` 為正式來源；不要另造第二套世界資料。
19. 正式劇情內容或故事流程若改動，要重新跑 Story Source Purity、Story Data Integrity、Story Flow Regression；瀏覽器端再檢查 Story Runtime Integrity。
20. 正式劇情「全中文」限制只檢查**原始正式故事資料**；玩家名字可為 `Frank`、`Kevin` 等英文，不得在 UI 被翻譯或清洗。
21. `WORLD_REGIONS`、`MAPS` 是 `data.js` 的頂層 lexical `const`，不是 `window.WORLD_REGIONS/window.MAPS`；跨 classic script 可直接以識別字引用，Story Integrity 曾因誤用 `window.*` 出過問題。
22. 不得宣稱已做 iPhone Safari 真機測試，除非使用者真的回報或實際有裝置測試結果。

---

# 3. 世界、等級、EXP 與主線戰鬥

## 3.1 世界正式結構

`data.js` 的 `WORLD_REGIONS` 是正式來源：

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

地圖由 `registerRegionMaps()` 固定註冊到各區 map slot；不依 script push 順序決定 index。`validateWorldMapRegistration()` 會檢查 10 區與 100 張地圖是否完整。

## 3.2 玩家基礎能力與 VIP

`engine.js` 正式基礎能力：

- `baseHP(l) = ceil(110 + 12 × (l-1))`
- `baseATK(l) = ceil(15 + 2.2 × (l-1))`
- `baseDEF(l) = ceil(7 + 1.2 × (l-1))`

VIP 每級：

- HP +0.5%
- ATK +0.5%
- DEF +0.25%
- 暴擊 +0.25 percentage point
- 閃避 +0.25 percentage point

`playerCombatStats()` 以裝備＋強化後 stats 為基底，再套 VIP；HP/ATK/DEF 最後向上取整，crit/dodge 保留 1 位。

## 3.3 EXP 正式公式

`engine.js` 是唯一正式 EXP owner：

- `sameExp(l) = ceil(25 + 4l)`
- `EXP_CURVE = { killMin:5, killRange:495, scale:142 }`
- `expProgressionFactor(l) = 5 + 495 × (1 - exp(-(l-1)/142))`
- `expNeed(l) = ceil(sameExp(l) × expProgressionFactor(l))`

同級普通怪約需擊殺數可由 `sameLevelNormalKillsToLevel(level)` 查詢；`level100balance.js` 只保留 audit/alias，不再擁有第二套 EXP 曲線。

怪物與玩家等級差的 EXP 倍率 `expLevelFactor(ml,pl)`：

- 怪物高 5+：1.3
- 高 3～4：1.2
- 高 1～2：1.1
- 同級：1
- 玩家高 1～2：0.9
- 玩家高 3～5：0.6
- 玩家高 6～10：0.25
- 玩家高 11+：0.05

## 3.4 共用傷害公式

`combatmath.js` 是主線與鏡像戰共同傷害 owner：

- `COMBAT_DAMAGE_MODEL_VERSION = 1`
- DEF 權重：`0.55`
- 隨機浮動：`0.95 + rng × 0.10`
- `damage = max(1, ceil((ATK - DEF×0.55) × random))`
- `combatDamageWithRng(atk, def, rng)` 可注入 RNG
- `calcDamage()` 只是相容入口，仍轉給同一公式

不得在其他模組複製第二份基礎傷害公式。

## 3.5 主線怪物平衡

`balance.js` 正式基礎怪物：

- `hp = ceil(55 + 24×level)`
- `atk = ceil(9 + 4.2×level)`
- `def = ceil(2.5 + 2.0×level)`

style：

- tank：HP ×1.15、ATK ×0.95
- attack：HP ×0.92、ATK ×1.10

五階段倍率依 enemy index：

1. HP 1.22 / ATK 1.17 / DEF 1.10
2. HP 1.31 / ATK 1.24 / DEF 1.14
3. HP 1.34 / ATK 1.28 / DEF 1.15
4. HP 1.39 / ATK 1.29 / DEF 1.17
5. HP 1.44 / ATK 1.27 / DEF 1.17

style 與五階段倍率由 `balance.js` 的 frozen 常數表集中管理；`MAIN_MONSTER_BALANCE_VERSION = 1`，數值公式本身不變。

## 3.6 主線單場／連續戰鬥

- 普通、菁英、Boss 都支援單場或連續戰鬥。
- `ui.js` 是主線戰鬥入口 owner；`CONTINUOUS_BATTLE_COUNT = "continuous"`。
- `battlepipeline.js` 是共用連戰 pipeline。
- 主線每場勝利的中途存檔只保留一個正式 `save(false)`；下一場 encounter 仍於場間建立，最終／戰敗／特殊遭遇結束仍依既有正式結算點 `save()`。`MAIN_BATTLE_PIPELINE_CLEANUP_VERSION = 1`。
- `combatpacing.js` 場間節奏：normal 140ms、elite 220ms、Boss 140ms。
- Boss 首殺解鎖下一張地圖；連續戰鬥不自動跳圖。
- Boss 戰敗：立即停止、`bossProgress=0`、`bossLocked=true`；需重新擊敗本圖菁英 10 隻才可再挑戰。
- Boss 不觸發特殊怪，也不消耗黑市情報。
- `MAIN_BOSS_CONTINUOUS_VERSION = 1`。

## 3.7 共用極簡模式（主線／虛空幻境）

- 正式名稱：**極簡模式**；定位是主線連續戰鬥的顯示模式，不是省電保證。
- 正式檔案：`mainminimalmode.js`、`mainminimalmode.css`、`mainminimalmodeintegrity.js`；詳細維護規格另見 `MINIMAL_MODE.md`。
- 只在主線**連續戰鬥**顯示入口；單場不顯示。
- overlay 掛在 `body`，不建立第二套戰鬥、計時、結算、劇情或 state owner。
- `battlepipeline.js` 正式呼叫 `mainMinimalModeEnsureCombatHeader()` 與 `mainMinimalModeHandleBattleResult()`；`specialencounter.js` 在特殊遭遇失敗結算後呼叫 `mainMinimalModeHandleSpecialResult()`。
- 極簡模式不 wrapper `adventureCombatPage()`／`showBattleResult()`，也不以 `MutationObserver` 監看結算 modal。
- 畫面狀態：`running`＝戰鬥持續進行中；`stopped`＝戰鬥已停止／滑動查看戰鬥結果；`story`＝戰鬥已完成／有新的劇情等待查看／滑動繼續。
- 背景政策固定為 `follow-gm-background-setting`：極簡模式本身不呼叫 `backgroundProgressStart()`／`backgroundProgressStop()`，背景時間補償仍由 `backgroundprogress.js` 與 GM「背景戰鬥」開關決定。
- 共用 adapter／控制 API：`registerMinimalModeAdapter()`、`openMinimalMode()`、`closeMinimalMode()`、`syncMinimalMode()`、`setMinimalModeState()`、`isMinimalModeOpen()`；舊 `*MainMinimalMode` 控制 API 暫保留為相容 alias，主線專屬 hook 名稱維持不變。虛空幻境由 `dungeonvoidui.js` 以 `void-mirage` adapter 接入，不複製第二套 overlay/CSS。
- 虛空戰鬥頁 `【虛空幻境】` 標題真正置中，右側顯示「極簡模式」；極簡內容為目前敵人／本次突破／已過樓層／歷史最高，全部置中單欄。
- 虛空戰敗或強制退出正式結束時切到 `stopped`，顯示「戰鬥已停止」與「滑動查看戰鬥結果」，滑掉後顯示既有虛空結果頁。
- 虛空自動爬樓唯一正式 owner 為 `dungeonvoid.js` 的 `runVoidMirageAuto()`；`dungeonvoidui.js` 只透過 `onFloorComplete`／`onEnd` callback 做畫面、動畫、極簡模式與結果頁接線，不得再建立第二套 while-loop 爬樓流程。
- `VOID_MIRAGE_AUTO_OWNER_VERSION = 1`；`VOID_MIRAGE_UI_AUTO_ADAPTER_VERSION = 1`。
- 虛空 run snapshot 對 `playerSnapshot`／`lastEnemy`／`lastResult` 做遞迴脫鉤複製，避免 UI/外部修改 snapshot 反向污染核心 run；`VOID_MIRAGE_SNAPSHOT_ISOLATION_VERSION = 1`。
- 一般怪名稱去重狀態只存在單次 run 的 `previousRegularName`，新 run 從空值開始，不再使用跨 run module 狀態；`VOID_MIRAGE_RUN_LOCAL_NAME_VERSION = 1`。
- 虛空 UI 正式樣式檔為 `dungeonvoid.css`；`dungeonvoidui.js` 不再 runtime 注入 `<style>`，`VOID_MIRAGE_UI_STYLE_VERSION = 1`。
- 虛空專屬 runtime integrity：`dungeonvoidintegrity.js`，`VOID_MIRAGE_INTEGRITY_VERSION = 3`；檢查解鎖 Lv.25、前 100 層起點、每 10 層 Boss、普通／Boss 特性數、勝利後紀錄與樓層前進順序、戰後滿血、退出旗標、唯一 auto-run owner/callback contract、必要 snapshot/API，以及正式 UI style marker。
- `MAIN_MINIMAL_MODE_HOOK_VERSION = 2`；`MAIN_MINIMAL_MODE_ADAPTER_VERSION = 1`；`MINIMAL_MODE_SHARED_API_VERSION = 1`；`VOID_MINIMAL_MODE_HOOK_VERSION = 1`；`MAIN_MINIMAL_MODE_BACKGROUND_POLICY_VERSION = 1`；`MAIN_MINIMAL_MODE_INTEGRITY_VERSION = 4`。
- 舊 `mainpowersave.js`／`mainpowersave.css` 與 `PowerSave`／`power-save` runtime 命名已退休，不得恢復。

---

# 4. 裝備、掉落、VIP、專精、強化

## 4.1 裝備品質與主能力

品質順序：普通／優良／稀有／史詩／傳說／神話。

品質主能力倍率 `m`：`1 / 1.15 / 1.35 / 1.6 / 1.95 / 2.4`。

出售倍率 `sm`：`1 / 1.4 / 2 / 3.2 / 5 / 8`。

正式部位：`weapon / helmet / armor / shoes / accessory`。

主能力：

- 武器：ATK，`ceil((3 + 1.55×level) × qualityMultiplier)`
- 頭盔：HP，`ceil((8 + 2.5×level) × qualityMultiplier)`
- 鎧甲：DEF，`ceil((1 + 0.65×level) × qualityMultiplier)`
- 鞋子：HP，同頭盔
- 飾品：CRIT，依品質區間抽值：1～2 / 2～3 / 3～5 / 5～7 / 7～9 / 9～10

`equipmentScore()` 使用裝備原始 aggregate stats；強化不改 item 本身、`mainStat.value` 或 equipmentScore。

鎖定裝備不會出售。神話 q5 只禁止 AUTO 自動出售；未鎖定神話仍可玩家主動出售。`state.lostGear` 可贖回或永久放棄。

## 4.2 商店已退休

- 無商店入口、頁面、購買、刷新、價格重置或冷卻。
- 新存檔不含 `state.shop`；Save 12 migration 會移除舊 `shop`。
- `shopbalance.js`、`shopretirement.js` 已刪除。
- 不得恢復舊商店 API 或 Boss 首殺刷新商店副作用。

## 4.3 VIP

- 上限 20。
- 門檻：`2500 × VIP level²`。
- `vipLevelFromPoints = floor(sqrt(points/2500))`，再 clamp 0～20。
- VIP4+ 一般副本 VIP 積分 ×1.10；VIP12+ ×1.20。
- VIP6：特殊遭遇率 8% → 10%。
- VIP10：特殊怪獎勵有 10% 再發動規則。
- VIP20：防止死亡裝備遺失；EXP 懲罰仍存在。
- 鏡像戰獎勵不走一般副本倍率。

## 4.4 八種專精，各 Lv60

升到目標 Lv.N：`1000 × N²` 金幣。

- `training`：每級 EXP +2.5%
- `scavenge`：每級怪物金幣 +2.5%
- `appraisal`：每級裝備售價 +2.5%
- `initiative`：每級第一擊傷害 +1%
- `combo`：每級連擊率 +0.5%；追加攻擊 50% 傷害，可再次連擊
- `penetration`：每級穿透率 +0.5%；觸發時敵 DEF ×0.75
- `counter`：每級反擊率 +0.5%；反擊第一擊 40% 傷害
- `drain`：每級汲取率 +0.5%；回復該擊實際傷害 10%

## 4.5 五欄永久強化

`state.enhancement = { basicStones, advancedStones, levels:{weapon,helmet,armor,shoes,accessory} }`

- 每欄上限 +20。
- 每級只提高目前裝備**原始主能力** 2.5%；+20 = +50%。
- 不乘基礎能力、affix、專精、VIP 或其他來源。
- 100% 成功，只花石頭，不花金幣。
- 升到目標 +N 成本：基礎石 `100×N`、進階石 `5×N`。
- 單欄 +0→+20 累積：21,000 基礎＋1,050 進階。

主線掉石：

- normal：1 基礎
- elite：70% 1 基礎、30% 2 基礎，EV=1.3
- boss：1 進階
- 資格：`playerLevel - monsterLevel < 10`
- 高於怪物 10 級（含）以上只取消石頭，不取消其他獎勵

裝備出售：

- q4 傳說：+5 基礎
- q5 神話：+1 進階

`enhancementrewards.js` 是掉石／出售石頭正式 owner；離線理論量必須呼叫它的 expected API，不手寫第二套 elite EV。

---

# 5. 特殊怪、黑市情報、離線與背景推進

## 5.1 特殊怪

- 特殊遭遇基礎 8%；VIP6+ 為 10%。
- 九種特殊怪：稀有資源聚合體、誘餌補給艙、終止協議單元、機率增幅信標、封存警戒機、裝備保全單元、黑市武裝頭目、戰利品回收者、流動交易代理人。
- 黑市武裝頭目勝利可建立 `state.pendingBlackMarketEncounter=true`。
- 下一次符合條件的一般主線普通／菁英勝利會強制觸發另一隻特殊怪，排除黑市武裝頭目。
- Boss、不合條件或戰敗不消耗情報。
- 特殊怪與副本不直接掉強化石；其裝備若被正式出售，仍依出售 owner 給石頭。

## 5.2 瀏覽器 background 連戰

主線普通／菁英／Boss 連續戰鬥可由 `backgroundprogress.js` 做背景時間補償：

- 背景時間上限 12 小時
- catch-up credit rate = 0.96
- Boss 目前**不排除** background catch-up
- 舊 `BACKGROUND_PROGRESS_MAIN_BOSS_EXCLUDED_VERSION` 已退休，不得恢復

## 5.3 關閉遊戲後離線收益

- 最多 12 小時；最短 1 分鐘。
- EXP／金幣／裝備約在線 10%。
- 離線主線強化石效率＝正式理論產量 5%。
- 離線合法目標只含普通／菁英，不含 Boss。
- 最後若打 Boss，不應覆蓋最近合法普通／菁英 farm target。
- `resolveFarmTarget()` 優先最新合法 `battleSamples`，再 fallback `farmMap/farmEnemy`。
- 雲端下載後重設 offline wall-clock 與 pending settlement，避免跨裝置傳輸時間被算成離線收益。

注意：background 連戰與真正 offline reward 是兩套不同系統。

---

# 6. 每日副本與鏡像戰

每日系統依 UTC+8 日曆日、凌晨 0 點重置。

- 懸賞戰：Lv5，每日最多 20 場真正開始的戰鬥；主獎勵 EXP／金幣／裝備。
- 競技場：Lv15，每日最多 20 輪，每輪 3 戰，中間不回血；主獎勵 VIP 積分。
- 虛空幻境：Lv25，無固定最高層；起始 `max(1, 歷史最高-100)`；每 10 層 Boss；每日基礎獎勵＝當日最高層×2 VIP 積分，每日只能領一次。
- 鏡像戰：Lv50，每日正式挑戰 1 次，固定 20 場。

`dungeonui.js` 有正式 extension API；若要新增副本 UI，優先用既有 renderer/home-card/post-render/navigation-guard API，不要再 wrapper `go()`。

## 6.1 鏡像唯一設定 owner

`mirrorconfig.js`：

- `MIRROR_DUNGEON_CONFIG_VERSION = 1`
- Lv50 解鎖
- 20 場
- 獎勵：`20 × wins²` VIP 積分
- 20 勝＝8000 VIP 積分
- 15～20 勝稱號：幸運眷顧／天選之刻／逆命者／傳說之日／距神一步／神蹟
- 0～20 勝共有 21 句結果評語
- 專屬比例：counter 0.40、combo 0.50、penetration DEF multiplier 0.75、drain 0.10

`mirrorcombatcore.js`：

- `MIRROR_COMBAT_CORE_VERSION = 3`
- 20 場開始前鎖定玩家快照，正式 stats 來自 `playerCombatStats()`。
- 每場雙方滿血、獨立，50/50 先攻。
- 基礎傷害只呼叫 `combatDamageWithRng()`；缺少就 error，不 fallback。
- counter 不可形成反反擊無限鏈；死亡後停止尚未發生的 combo/counter。

正式鏡像單場不發 EXP、金幣、裝備、石頭、特殊怪或主線進度，也不扣玩家本體 `state.hp`。

GM 可重置今日鏡像狀態、跑 1 次／100 次測試、跑對稱回歸；正式 production integrity 只做較小 smoke，完整壓測留 GM。

Save Schema 仍是 12，沒有因鏡像或故事升到 13。

---

# 7. Supabase 帳號與手動雲端存檔

## 7.1 Auth

`supabaseauth.js` 是帳號 owner：

- `AUTH_VERSION = 6`
- login / signup / forgot / recovery 四種模式集中管理
- `persistSession:true`
- `autoRefreshToken:true`
- `detectSessionInUrl:true`
- 登出使用 local scope，只結束目前裝置 session，不刪本機進度
- 忘記密碼走 `resetPasswordForEmail()`；recovery 後 `updateUser({password})`
- recovery 使用 sessionStorage flag 輔助
- 常見錯誤繁中化

重要歷史 bug：曾用持續 `MutationObserver` 掃整個 `#main`，造成嚴重卡頓；已移除，禁止恢復。

## 7.2 Cloud Save

`cloudsave.js`：

- `CIVILIZATION_CLOUD_SAVE_VERSION = 2`
- 資料表 `public.game_saves`
- 每帳號一列；RLS 應只允許 authenticated user 存取自己的 `user_id`
- 只手動上傳／下載，不自動同步
- 設定頁顯示本機與雲端的存檔時間、Lv、EXP
- `revision` 只供內部控制，不顯示玩家
- 本機存檔若綁 A 帳號，登入 B 後禁止把 A 的本機資料上傳到 B；仍可下載 B 雲端覆蓋本機
- 雲端下載成功後會重新載入，並重設 offline 計時起點

`cloudsave.js` 目前仍 wrapper 全域 `save()` 以維護本機存檔時間 metadata；這是現存技術債，不要在無關任務中順手拆。

舊 JSON 匯出／匯入已退休，不得恢復成正式跨裝置流程。

---

# 8. 圖片背景與預載

- 母圖：`assets/backgrounds-source/<功能名稱>/`
- Runtime：`assets/backgrounds/<功能名稱>/`
- 正式轉換慣例：Desktop 最大寬1536、Mobile最大寬1080、WebP quality 72、method 6、LANCZOS。
- `backgrounds.css` 管理正式背景 URL。
- `backgroundpreload.js` 依目前 viewport 預載正式 runtime 背景，不預載 source 母圖。
- 同名 WebP 重製後必須 bump `backgrounds.css` URL query。
- 一次性轉換 workflow 完成後要刪除 workflow；source 母圖保留。

---

# 9. 正式劇情世界觀與創作基準

## 9.1 整體規模

正式故事總數：**101 篇**。

- `earth-prologue`：1 篇序章
- 100 個 Boss 首殺故事：10 區 × 10 Boss

正式資料檔：

- `storydata-earth.js`（Earth V2；序章＋10 Boss）
- `storydata-solar.js`
- `storydata-nearstar.js`
- `storydata-frontier.js`
- `storydata-orion.js`
- `storydata-galactic-frontier.js`
- `storydata-galactic-mid.js`
- `storydata-core-outer.js`
- `storydata-core-war.js`
- `storydata-galactic-unification.js`

`STORY_BIBLE.md` 是創作設定索引；正式遊戲資料仍以 `storydata-*.js`、`WORLD_REGIONS`、`MAPS` 為準。

## 9.2 寫作規則

- 主角就是使用者；敘事稱「你」。
- 對話中的玩家名字用 `{角色名稱}`。
- 正式故事本文不得稱主角為「玩家」。
- 原始正式故事資料不得含 A-Z/a-z；**玩家實際名字可英文**。
- `storyui.js` 只做 `{角色名稱}` → 玩家名字；空名或字面「玩家」才 fallback「作戰員」。
- 不再做 `Boss`、`respected` 等顯示層自動翻譯／清洗。
- 成熟戰爭風；主角可犯錯、被批評、承擔後果。
- 反派可有合理秩序論點；不是每個敵人都必須哲學化。
- 核心人物可永久死亡，但少而重。
- 主角不安排戀愛線。
- 科學／技術有邏輯與限制，避免教科書式說明。

## 9.3 十區主題曲線

1. 地球：恐懼、合作、生存
2. 太陽系：勝利後的不安、隔離／守門
3. 近星：人類開始被其他文明看見與評判
4. 星際邊疆：自由的真實成本
5. 獵戶臂：擁有力量後的責任
6. 銀河邊境：歷史、制度與秩序的罪／功
7. 銀河中域：集中權力的誘惑
8. 銀河核心外圍：未知、物理極限、人類其實很小
9. 銀河核心戰爭：沒有乾淨答案
10. 銀河統合戰爭：選擇權本身的價值

核心問題：**一個文明是否值得保有犯錯、失敗、爭吵與重新選擇的權利？**

最終立場不是「所有秩序都錯」：秩序曾救過文明，自由也曾造成災難；但任何最高答案都必須能被拒絕、覆核、撤回。

## 9.4 長線角色與固定事件

- 地球核心角色：指揮官、副官、情報官、工程官、醫療官等。
- 近星的重要跨文明角色：瑟安。
- 銀河邊境的重要跨文明角色：伊芮；保留公開反對主角的權利，不是主角隨從。
- 獵戶臂最終戰：原指揮官永久死亡；過去爭議不因犧牲被洗白。
- 銀河中域：副官曾因緊急監控爭議離開前線，後回歸但保留異議。
- 核心戰爭：情報官曾離隊進裁決系統內部改革，後續回歸。

## 9.5 最終固定設定

最終 Boss 正式名稱：**銀河征服中樞**。

最終固定訊號必須精確存在且依序出現：

1. `本地連續體封閉狀態解除。`
2. `外層觀測開始。`

第一部結尾：`《文明戰線》第一部　完`。

外層／多重宇宙只做極輕伏筆，不在 Lv500 前搶走第一部主題。

---

# 10. 劇情執行流程：目前 main 正式架構

## 10.1 首殺劇情 owner 已收斂

**唯一排 Boss 首殺劇情的戰鬥 owner 是 `combatcore.js`。**

流程：

1. `fightOnce()` 確認 Boss 勝利。
2. `firstBossKill = !state.bossKilled[mapIdx]`。
3. 只有 `firstBossKill === true` 才呼叫 `civilizationStoryProgress.queueBossStory(mapIdx)`。
4. 回傳 `pendingStoryId`。
5. `battlepipeline.js` **只消費** `result.pendingStoryId`，不再第二次呼叫 `queueBossStory()`。
6. 若連續戰鬥收到 pending story，該輪結束後停止連戰，進戰鬥結算，再由正式 resume 流程播放故事。

`MAINLINE_BOSS_FIRST_CLEAR_SIGNAL_VERSION = 2`。
`MAINLINE_BOSS_STORY_PIPELINE_VERSION = 2`。

已擊敗 Boss 用 GM 或手動退回重打：**不得再次自動跳劇情**；重看應走「戰線紀錄」。

## 10.2 Story UI

`storyui.js`：

- `STORY_UI_VERSION = 6`
- 正方形／近正方形 modal，上一頁／下一頁／結束。
- `{角色名稱}` 動態代入實際玩家名。
- `openStory(storyId, options)`；正式播放透過 `onComplete` 才把故事記為完成。
- GM 預覽直接 `openStory(id)`，不帶 completion callback，因此不改進度。
- CSS 已移到 `story.css`，JS 不再 runtime 注入劇情／戰線紀錄／初始裝備 CSS。

## 10.3 Story Progress

`storyprogress.js`：

- `CIVILIZATION_STORY_PROGRESS_VERSION = 9`
- `get()` 現在是**純讀取**：直接 `readProgress()`，不在 getter 偷跑 migration/backfill。
- 真正需要修復／正規化的入口才呼叫 `ensureProgress()`／`normalizeProgress()`。
- `queueBossStory()` 先以 `skipBackfill:true` 保護當次首殺，避免 `bossKilled=true` 後被歷史 backfill 先吃成 completed。
- pending 正式故事只有走到最後一頁、`closeStory()` 觸發 `onComplete` 後才加入 completed 並清 pending。
- 序章完成後發初始裝備；初始裝備 modal 樣式也已移到 `story.css`。

## 10.4 Story Migration

`storymigration.js`：

- `STORY_MIGRATION_VERSION = 4`
- 專責 storyProgress container、欄位正規化與舊存檔 backfill。
- `historyBackfillRegions` 已正式列入 `legacyFields`。
- **`historyBackfillRegions` 只保留資訊相容用途，不再控制是否允許 backfill，也不決定故事是否完成。**
- 舊存檔若 `bossKilled=true` 但 `completedStories` 缺故事，會補回。
- 若該故事正是 `pendingStory`，backfill 不得把它補成 completed。
- 尚未擊敗任何 Boss 的未來區域不應被提前標記成已 backfill。

## 10.5 戰線紀錄

`storyrecordtabs.js`：

- `STORY_RECORD_TABS_VERSION = 5`
- 序章獨立顯示。
- 區域分頁只顯示**至少有一篇已完成 Boss 故事**的區域。
- 未到達／未完成區域完全隱藏，不用 `???`，避免劇透。
- 區內只顯示 completed stories。
- 手機區域 tab 兩欄；桌機 flex 自然排列。
- 每次從其他頁重新進戰線紀錄，預設最新有紀錄的區域。
- 同一次停留頁面內手動切到舊區域，只 render，不會被強制跳回最新區。
- 重播不發獎、不改進度。

**舊 `storyrecordtabs.js` wrapper `window.go()` 已退休。** 現在由 `ui.js` 正式 `go(v)` 在 `v==="storyrecord"` 時呼叫 `prepareStoryRecordEntry()`；不要再恢復 wrapper。

## 10.6 GM 劇情測試

`gmstorytest.js`：

- `GM_STORY_TEST_VERSION = 3`
- 10 區都可直接選，不受玩家實際進度限制。
- 可選區域／故事、上一區／下一區、上一篇／下一篇。
- 顯示正式 story ID、本區位置、總頁數。
- 預覽不改角色 storyProgress、不發獎。
- 顯示資料完整性與執行期完整性。
- 「重新檢查完整性」會真正重新執行 Data Integrity＋Runtime Integrity。
- **失敗時會直接列每一筆 `code + message`；warning 也會列出。**

## 10.7 Story Data Integrity

`storyintegrity.js`：

- `STORY_INTEGRITY_VERSION = 6`
- 現在是**純檢查器**，不再先修改／翻譯 story data。
- 每次 `runCivilizationStoryIntegrity()` 都重新掃描最新資料。
- 檢查 10 個 WORLD_REGIONS、10 個 story registry、區域順序與名稱。
- Earth 必須 11 筆（序章＋10 Boss），其他區各 10 筆。
- 正式 stories 必須 101、Boss stories 必須 100。
- title／registry label 必須等於正式 Boss 名稱；location 必須等於正式地圖名；chapter 必須包含正式區域名。
- 正式顯示資料若含 A-Z/a-z → error。
- 正式本文若含「玩家」→ error。
- 每 Boss 至少 7 頁；超過 20 頁 warning。
- 單頁可見字數超過約 230 → warning。
- 最終兩句固定訊號存在與順序受保護。
- 10 支 storydata 版本 marker 必須載入。

目前唯一已知 Story Data warning：最終 Boss `galactic-unification-boss-10` 共 31 頁，超過一般建議 20 頁；**這是警告，不是錯誤，且符合最終章較長的設計，不應為了消 warning 砍內容。**

## 10.8 Story Runtime Integrity

`storyruntimeintegrity.js`：

- `STORY_RUNTIME_INTEGRITY_VERSION = 8`
- 會先重新跑 Data Integrity。
- 硬性檢查 10 區、101 篇、100 Boss。
- 檢查 Story UI、migration、progress、戰線紀錄、GM 必要 API。
- 檢查 100 張地圖都能 `bossStoryId(mapIdx)` → 存在的正式故事。
- 會做 pending/backfill/legacy/future-region 行為回歸。
- 會驗證 `progress.get()` 不修改 `storyProgress`。
- 會抓舊 `go.__storyRecordLatestWrapped`，若存在直接 error。
- **版本號現在只是 `versionHint` warning；真正的能力／行為失敗才是 error。**

---

# 11. Story CI：永久防回歸

正式 workflow：`.github/workflows/story-integrity.yml`

- GitHub Actions `ubuntu-latest`
- `actions/setup-node@v4`
- Node **24**
- story 相關正式檔、`index.html` 或 `tests/story/**` 變更會觸發
- 也可 `workflow_dispatch`

測試檔已集中到：

- `tests/story/source-purity.js`
- `tests/story/integrity.js`
- `tests/story/flow.js`

repo root 舊測試檔：

- `story-source-purity-ci.js`
- `story-integrity-ci.js`
- `story-flow-ci.js`

已退休／不存在；workflow 會檢查它們不可回來。

永久 CI 四層：

1. **Verify story batch 4 layout**：確認 `story.css`、三支 tests、root 舊檔不存在、`index.html` 有正確 story.css cache-bust。
2. **Raw story source purity**：在 `storyintegrity.js` 執行前就掃原始 storydata；原始正式文案有英文直接 fail，避免檢查器掩蓋問題。
3. **Story data integrity**：10 區／101 stories／100 Boss mapping／final signals。
4. **Story flow regressions**：首殺 pending、重打不重播、pending 保護、legacy backfill、pure get、正式 storyrecord 入口、CSS 外移、version gate warning-only 等。

最新 Story Integrity workflow 已在目前 main 成功通過。

---

# 12. 這個對話期間的重要故事 bug 與修正歷史

## 12.1 四區故事整支沒載入

症狀：

- 打到太陽系 Boss 沒跳故事。
- 戰線紀錄退回只剩第一區。
- GM 劇情測試只看得到部分區域。

真正根因：先前清理正式故事英文時，4 支 storydata 最後一頁陣列被誤多加 `}`，造成 JavaScript parse failure，整支檔案完全沒執行。

受影響：

- `storydata-solar.js`
- `storydata-nearstar.js`
- `storydata-frontier.js`
- `storydata-core-outer.js`

處理：恢復到各自最後合法版本，再做正式 source-level 中文清理；不是在 runtime 用 fallback 掩蓋。

## 12.2 Integrity 曾把問題藏起來

舊 V5 會在檢查前自動把 `Boss` 類字串改成中文，導致「原始 storydata 仍有英文，但 Integrity PASS」。

修正：

- 原始 storydata 真正清乾淨。
- `storyintegrity.js` V6 改純檢查、不修改資料。
- 新增 raw source purity CI，在 Integrity 執行前掃原始資料。

曾抓出並修正的地球殘留英文：

- `OBSERVATION NODE : ACTIVE` → `觀測節點：運作中`
- `OBSERVATION NODE` → `觀測節點`
- `UNKNOWN` → `未知節點`

也曾抓出 7 處被舊 V5 掩蓋的 `Boss` 文案，已直接修進正式 storydata。

## 12.3 首殺故事雙 owner

舊架構：`combatcore.js` 排一次，`battlepipeline.js` 又可能再呼叫一次 `queueBossStory()`。

修正：

- `combatcore.js` 是唯一 queue owner。
- `battlepipeline.js` 只消費 `result.pendingStoryId`。
- 永久 Flow CI 會檢查 battlepipeline 不得重新出現 `queueBossStory`。

## 12.4 Story getter 有副作用

舊 `civilizationStoryProgress.get()` 每次讀取都會順便 normalize/backfill。

修正：V9 `get()` 純讀；migration 只在明確入口執行。Flow CI 比較 getter 前後 JSON，若修改資料即 fail。

## 12.5 historyBackfillRegions 曾成為錯誤硬鎖

舊邏輯可能因「這區曾標記 backfill 過」而拒絕再次補漏，造成 Boss 已擊敗但戰線紀錄缺故事。

修正：V4 migration 把 `historyBackfillRegions` 降為 legacy informational field；永遠不能阻止 repair pass。

## 12.6 戰線紀錄 go wrapper 已清除

舊 `storyrecordtabs.js` 包 `window.go` 來做「重新進頁選最新區」。

修正：正式 hook 收回 `ui.js go(v)`，record tabs 不再 wrapper global navigation。

## 12.7 CSS 與 CI 結構整理

- 劇情視窗、戰線紀錄、初始裝備 CSS 集中 `story.css`。
- 三支 story CI 搬到 `tests/story/`。
- Actions Node 20 → 24。
- Runtime Integrity 改能力／行為為主，版本只 warning。

---

# 13. GM 管理總覽

- 設定頁標題連點 3 次可開管理入口；實際管理密碼不要寫入 handoff。
- `gmhub.js` 是主要 owner。
- `gmhubextensions.js` 提供 `registerGmHubSection(mode,title,renderer,options)`；新增 GM 模組優先使用 extension API。
- `gmhubextensions.js` 內部仍以集中 wrapper 延伸 `gmHtml()`，屬現存技術債；不要再疊另一套 wrapper。

重要 GM 能力包括：

- 角色／等級／資源等既有管理工具。
- VIP 管理與測試。
- 8 專精正式值與測試值。
- 五欄強化正式 +0～+20；測試能力必須呼叫 `equippedStatsWithEnhancementLevels()`，不可複製強化公式。
- 副本相關管理／測試。
- 鏡像：重置今日、20 場測試、100 次統計、對稱回歸。
- 劇情 GM V3：10 區／101 stories 純預覽、前後導航、integrity 明細與重跑。

GM 測試功能應盡量不修改正式玩家進度；若是「管理」模式才明確寫正式 state。

---

# 14. UI 與玩家流程重要行為

主頁功能：冒險／戰線紀錄／角色／背包／強化／專精／副本／遊戲說明／設定。

主線地圖：

- 地圖卡顯示未解鎖／攻略進度／已通關。
- 每張地圖前三隻普通敵人、菁英、Boss 依正式進度解鎖。
- Boss 已擊敗仍可再次挑戰；若重打失敗仍會鎖王並要求 10 菁英重開。
- 戰鬥模式固定單場／連續。

劇情：

- 首殺故事在戰鬥結算之後接續。
- 重打已完成 Boss 不再自動跳故事。
- 戰線紀錄只顯示完成內容，未來區域不劇透。
- 重新進戰線紀錄預設最新完成區，同頁切換保留玩家選擇。

故事／戰線紀錄／初始裝備樣式都由 `story.css` 管理。

---

# 15. 完整性檢查鏈

實際載入順序永遠以最新 `index.html` 為準。2026-09-17 main 的主要完整性鏈：

1. `worldmapregistrycheck.js`：世界地圖註冊。
2. `storyintegrity.js`：101 篇正式故事 Data Integrity。
3. `mirrordungeonintegrity.js`：鏡像 config／API／快照／共用傷害。
4. `enhancementintegrity.js`：強化核心、成本、掉石、出售、離線、UI、GM。
5. `bosscontinuousintegrity.js`：Boss 單場／連戰、鎖王、背景推進、離線排除等。
6. `mainminimalmodeintegrity.js`：主線極簡模式 hook／背景政策／舊 PowerSave API 退休。
7. `accountcloudintegrity.js`：Auth／Cloud Save／舊 JSON API 退休。
8. `runtimeintegrity.js`：專案主 runtime 檢查。
9. `mirrorfinalintegrity.js`：鏡像最終 state／舊資料／smoke 回歸。
10. `storymigration.js`
11. `storyprogress.js`
12. `storyrecordtabs.js`
13. `storyruntimeintegrity.js`：故事最終 runtime 行為檢查。
14. `backgroundpreload.js` 最後處理正式背景 reveal。

故事資料的 10 支 `storydata-*` 必須全部先於 `storyintegrity.js` 載入；migration 必須先於 progress；runtime integrity 必須在 progress／record tabs 後。

---

# 16. 已知技術債／尚未完成項目

目前沒有已知「玩家正式功能必須立刻完成」的阻斷項目。使用者已實際回報：Lv100 Boss 首殺故事正常跳出，GM 劇情測試目前正常。

仍存在但**不要在無關任務中順手重構**的技術債：

- `cloudsave.js` wrapper `save()` 維護本機存檔時間 metadata。
- `gmhubextensions.js` 仍集中 wrapper `gmHtml()`。
- `backgroundprogress.js` 仍有既有戰鬥流程 wrapper／時間補償整合。
- `dungeonui.js` 與 `dungeonreturnlabels.js` 有少量返回文字正規化重複。
- `offlineprogress.js` 有 inline modal styles。
- `gmhub.js`、`specialization.js`、部分鏡像／GM UI 仍注入局部 CSS。
- GM 劇情測試本身仍使用少量 inline style；不影響正式故事 CSS owner。
- Story Data Integrity 的頁面密度只 warning，不會自動拆頁；手機實際閱讀仍以真機為準。
- 最終 Boss 31 頁是目前唯一已知 Story Data warning，屬設計性長章，不是 bug。
- 101 篇正式故事尚未全部由使用者逐篇在 iPhone Safari 實機閱讀驗證；不可把 CI PASS 說成全篇真機驗收。
- 真機若看到 stale JS/CSS，先檢查 `index.html` cache-bust 與 Safari cache，再判斷邏輯問題。

目前沒有理由把 Save Schema 從 12 升到 13；不要擅自升版。

---

# 17. 已退休／不得從舊資料恢復

- 裝備商店商品系統、刷新、Boss 首殺商店刷新、黑市商店折扣、`state.shop`。
- `shopbalance.js`、`shopretirement.js`。
- `inventoryredemption.js`（功能已整併正式 UI）。
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
- `mainpowersave.js`／`mainpowersave.css` 舊省電模式命名與 `PowerSave`／`power-save` runtime API／selector。
- 舊 JSON `exportSave()`／`importSave()`／`isImportableSave()` 正式跨裝置流程。
- Story Integrity 檢查前自動改寫 `Boss`／英文的 V5 正規化做法。
- `storyrecordtabs.js` 包裝 `window.go()`。
- `storyprogress.get()` 讀取時自動 migration/backfill。
- `historyBackfillRegions` 作為 repair lock。
- `battlepipeline.js` 第二次 queue Boss story 的雙 owner。
- root 的 `story-source-purity-ci.js`、`story-integrity-ci.js`、`story-flow-ci.js`。

---

# 18. 本次交接更新前已重新核對的 main 正式來源

本次不是只靠聊天記憶，已重新讀取／核對目前 main 的至少下列正式來源：

- `PROJECT_HANDOFF.md`（舊版）
- `index.html`
- `data.js`
- `engine.js`
- `combatmath.js`
- `balance.js`
- `level100balance.js`
- `vipprogression.js`
- `specialization.js`
- `enhancementcore.js`
- `enhancementrewards.js`
- `savemigration.js`
- `dungeonprogress.js`
- `dungeonbounty.js`
- `mirrorconfig.js`
- `mirrorcombatcore.js`
- `supabaseauth.js`
- `cloudsave.js`
- `combatcore.js`
- `battlepipeline.js`
- `mainminimalmodeintegrity.js`
- `mainminimalmode.css`
- `mainminimalmode.js`
- `MINIMAL_MODE.md`
- `ui.js`
- `storyintegrity.js`
- `storyui.js`
- `storymigration.js`
- `storyprogress.js`
- `storyrecordtabs.js`
- `storyruntimeintegrity.js`
- `gmstorytest.js`
- `story.css`
- `.github/workflows/story-integrity.yml`
- `tests/story/flow.js`
- `tests/story/source-purity.js`
- `tests/story/integrity.js`

未來仍要依需求重新讀取相關檔案，不可因本節列過就省略。

---

# 19. 下一個對話如何接手

標準接手指令：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際相關程式碼與完整 `index.html` 載入順序，完整承接《文明戰線》專案。`main` 是唯一真實來源；若 handoff、聊天記憶、舊規格或舊 commit 與 main 衝突，以 main 為準。現在先不要修改。**

若下一個對話直接要求修改，使用：

> **先讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新讀取本次需求涉及的 `main` 正式 owner、相依檔案與完整 `index.html`。確認現況後直接依需求修改 GitHub `main`；修改後重新讀取 main 自我檢查，JS/CSS 改動同步更新 `index.html` cache-bust。優先修改正式來源，不要新增不必要 wrapper、fallback、第二套公式、第二套結算或第二套 state owner。**
