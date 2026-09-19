# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 若本文件、歷史對話、舊截圖、舊規格、舊 commit、模型記憶或任何摘要與目前 `main` 衝突，一律重新讀取 `main` 後，以實際程式碼為準。本文件是交接索引與最新規則摘要，不可取代實際程式碼檢查。

更新日期：**2026-09-19**

---

# 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 架構：純前端 HTML / CSS / JavaScript + `localStorage` + Supabase Auth / Database
- 正式存檔 key：`frank_text_rpg_save`
- `SAVE_VERSION = 13`
- `SAVE_SCHEMA_VERSION = 13`
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
- `CALAMITY_STATE_VERSION = 1`
- `CALAMITY_BALANCE_VERSION = 3`
- `CALAMITY_HP_PER_LEVEL = 500,000`
- `MARK_STATE_VERSION = 1`
- `MARK_CORE_VERSION = 1`
- `MARK_COMBAT_RULE_VERSION = 1`
- `MARK_PROGRESSION_OWNER_VERSION = 1`
- `MARK_DESCRIPTION_OWNER_VERSION = 1`
- `CIVILIZATION_CALAMITY_CONFIG_VERSION = 1`

正式存檔策略：**每台裝置平常使用自己的本機存檔；Supabase 雲端只做玩家主動上傳／下載的跨裝置搬移，不做自動同步，也不在登入時自動覆蓋本機。**

2026-09-19 文明災厄／印記／Combat Presentation 已完成正式建立與後續 5 批大整理：Schema 13、Unified Calamity Config、Mark Core progression／description owner、共用 Combat Core 印記、全模式 structured presentation／護盾／浮字、鏡像印記、Arena Assessment V4（marks）、Civilization Calamity Core V1、Calamity Run V1（Continuous Rule V3）、Calamity UI V3／Minimal V1／Battle View V1、GM 整合、遊戲說明 V14、Runtime Integrity 與 Final Integrity V2 均已建立。

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
- 主線每場勝利的中途存檔只保留一個正式 `save(false)`；下一場 encounter 仍於場間建立。一般完成／戰敗統一由 pipeline 尾端做一次正式 `save()`，只有特殊遭遇失敗的 early-return 分支保留自己的 `save()`。`MAIN_BATTLE_PIPELINE_CLEANUP_VERSION = 1`。
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
- 升到目標 +N 成本：基礎石 `50×N`、進階石 `5×N`。
- 單欄 +0→+20 累積：10,500 基礎＋1,050 進階。

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

## 4.6 十枚文明印記核心（目前正式 owner）

`calamityconfig.js` 是「區域 → 文明災厄 → 印記」唯一配對 owner；`markcore.js` 是印記 progression／效果公式／說明文字 owner。`combatcore.js` 的共用 `runCombatCore()` 正式套用至主線、特殊怪、懸賞、競技場、虛空與文明災厄；鏡像由獨立 `mirrorcombatcore.js` 對稱實作並與同一 Mark Core 規則版本對齊。

- `MARK_CORE_VERSION = 1`
- `MARK_COMBAT_RULE_VERSION = 1`
- 印記最高 Lv.10；Lv.0 無戰鬥效果。
- 正式取得順序：Lv50 護界、Lv100 壓制、Lv150 鎮心、Lv200 不屈、Lv250 韌性、Lv300 戰意、Lv350 吸收、Lv400 復仇、Lv450 反噬、Lv500 無視。
- Lv.0→10 每級所需重複擊殺：`1,1,2,2,3,3,4,4,5,5`；累積重複擊殺：1／2／4／6／9／12／16／20／25／30。
- 護界：開戰啟動率 Lv1～10 = 30%→75%；成功獲得最大 HP 2%×Lv 護盾。
- 壓制：敵方最終閃避 -0.5 percentage point×Lv。
- 鎮心：敵方最終暴擊率 -0.5 percentage point×Lv。
- 不屈：開戰啟動率 30%→75%；成功後該場首次致命傷保留 1 HP。
- 韌性：敵方暴擊額外傷害部分 -3%×Lv。
- 戰意：開戰啟動率 30%→75%；每層 ATK +0.2%×Lv，最多 10 層。
- 吸收：敵方有效命中時 0.5%×Lv 機率取消傷害並回復原計算傷害 25%。
- 復仇：敵方成功暴擊後 5%×Lv 機率使下一次成功命中的玩家攻擊必定暴擊。
- 反噬：玩家實際失血且存活後 1.5%×Lv 機率反射實際 HP 損失 30%。
- 無視：每次玩家攻擊事件 0.5%×Lv 機率令該擊敵 DEF=0。
- `markFormalSnapshot()` 保留 acquired／level／progress；GM test 以 `gmTestMarkLevels` 保存本次工作階段 Lv.0～10，不寫正式 save。
- 專屬回歸：`markcoreintegrity.js`；檢查 10 枚順序、升級需求、31 殺曲線、pure progress snapshot、Lv.10 效果公式與 `markEffectDescription()` 正式文字。名稱／區域／解鎖配對直接依 `CIVILIZATION_CALAMITY_CONFIG`，不再維護第二套 `MARK_DEFS` 公開資料。
- `COMBAT_MARK_INTEGRATION_VERSION = 1`；共用戰鬥核心正式順序為：玩家攻擊先套壓制→無視／穿透→戰意 ATK→先制→復仇／一般暴擊→連擊／反擊倍率→汲取；敵人攻擊依閃避→鎮心→韌性→吸收→護界→HP→不屈→復仇 ready→反噬→專精反擊。
- 護界／不屈／戰意在每次 `runCombatCore()` 開始時獨立重骰；競技場每一戰、虛空每一層都會重新建立該場 battle-local 狀態。
- structured mark events 由 `combatcore.js` 產生；壓制只在真正阻止閃避時發 `preventDodge`、鎮心只在真正阻止暴擊時發 `preventCrit`、韌性只在實際降低暴擊傷害時發 `reduceCritDamage`，其餘印記亦有 activate/trigger/consume/layer 等事件。第 4 批已由 `combatfx.js` 統一消費並在戰鬥兩方框內顯示。
- GM 既有 `useTestSpecializations:true` 模擬會同步採用 session-only `gmTestMarkLevels`；亦可用 `options.markLevels` 明確傳入測試快照，不修改正式存檔。
- `combatmarkintegrity.js` 以固定 RNG 驗證 Lv.0 基準不漂移、10 枚印記核心互動、吸收／反噬／反擊順序與護界／吸收對復仇的邊界規則。
- `COMBAT_MARK_FX_VERSION = 1`；`COMBAT_PRESENTATION_VERSION = 2`；`COMBAT_PRESENTATION_UNIFIED_VERSION = 1`；`COMBAT_STRUCTURED_PRESENTATION_VERSION = 2`；`MIRROR_STRUCTURED_PRESENTATION_VERSION = 1`；`CALAMITY_STRUCTURED_PRESENTATION_VERSION = 2`。 `COMBAT_STRUCTURED_SLEEP_INJECTION_VERSION = 1`；`CALAMITY_BACKGROUND_PRESENTATION_VERSION = 1`。`combatfx.js` 是共用戰鬥呈現 owner；正式 prepare／clear lifecycle、combat-screen 綁定、雙方 HP／shield snapshot 與 structured event animator 已取代舊 log-based HP/pulse 路徑。
- 印記浮字：護界／鎮心／不屈／韌性／吸收／復仇／戰意顯示在玩家框；壓制／反噬／無視顯示在敵方框。戰意層數顯示 `戰意 ×N`，吸收顯示回復 HP，反噬顯示實際反傷。護界使用白色 shield bar 覆蓋原 HP 條；shield 先扣完才扣 HP。
- 五個正式動畫 loop 都補上吸收成功 pulse，但吸收不觸發受擊震動；護盾、吸收、反噬造成的畫面 HP 差異由 `combatfx.js` 依 structured event 校正。
- 模式接線版本：`MAIN_COMBAT_MARK_PRESENTATION_VERSION = 1`、`SPECIAL_COMBAT_MARK_PRESENTATION_VERSION = 1`、`BOUNTY_COMBAT_MARK_PRESENTATION_VERSION = 1`、`ARENA_COMBAT_MARK_PRESENTATION_VERSION = 1`、`VOID_COMBAT_MARK_PRESENTATION_VERSION = 1`。
- `combatfxintegrity.js` 檢查 10 枚印記浮字 target／文字、五模式接線版本與共用 presentation API。




## 4.7 文明災厄 Core（目前正式架構）

- `CALAMITY_CORE_VERSION = 1`
- `CALAMITY_COMBAT_RULE_VERSION = 2`
- `COMBAT_PERSISTENT_ENEMY_HP_VERSION = 1`
- `CALAMITY_HP_RESTORE_OWNER_VERSION = 1`
- 10 隻名稱依序：灰潮母巢／日蝕王座／星骸迴廊／黑域牧者／滅世天環／寂滅方舟／萬域蝕潮／深核奇點／無聲裁決／終末之眼。名稱、區域、解鎖 map、印記配對全部由 `calamityconfig.js` 單一來源衍生。
- 解鎖唯一來源：`state.bossKilled[region.mapEnd] === true`；不以玩家等級或 unlockedMap 判定。
- 母體直接呼叫正式主線 `monsterObj(region.mapEnd, 4)`；不複製主線 Boss 公式。
- 戰鬥數值：HP = **500,000 × 災厄等級（第1～10階）**，即 500,000／1,000,000／…／5,000,000；ATK = ceil(母體 ATK ×1.10)；DEF = ceil(母體 DEF ×1.05)；暴擊／閃避固定 10%／10%；不帶 ordinary monster traits。
- `state.calamities.entries[id].currentHp` 只保存剩餘 HP；`null` 代表下一輪滿血。Balance V3 normalizer 會依各災厄的正式最大 HP clamp 舊 `currentHp`；不重置印記、解鎖或其他進度。
- `runCombatCore()` 新增向後相容 `options.enemyStartHp`：`e.hp` 維持真正最大 HP；既有模式不傳時行為不變。
- 災厄單場 adapter：每次玩家滿血開始；失敗只保存災厄剩餘 HP；玩家戰後恢復滿血；不套主線死亡懲罰，不給 EXP／金幣／裝備／VIP／強化石。每場戰後回滿 HP 的唯一 owner 是 `calamitycore.js` settlement；Run 的 begin／finish 不再重複 restore。
- 首殺只取得對應印記 Lv.0，不計入 Lv.0→1；之後依 1,1,2,2,3,3,4,4,5,5 重複擊殺需求提升，總第 31 殺達 Lv.10；Lv.10 後不再累積。
- 戰鬥結果先同步更新災厄 HP／印記／玩家滿血，再做一次 `save(false)`；UI 之後才播放 structured animation。`getCivilizationCalamityCurrentHp()` 與 `getCivilizationCalamityStatus()` 是 pure read，不得在 getter 內 normalize／修改 state。
- `calamitycoreintegrity.js` 會檢查 10 隻定義直接對齊 unified config、區域 final Boss 母體、500,000 × 災厄等級 HP 曲線、攻防倍率、10/10 暴擊閃避、無 traits、pure getter、Mark Core progression 委派與持久敵方 HP；31 殺曲線由 `markcoreintegrity.js` 負責。

## 4.8 文明災厄單場／連續討伐 runtime

- `CALAMITY_RUN_VERSION = 1`
- `CALAMITY_CONTINUOUS_RULE_VERSION = 3`
- `CALAMITY_CONTINUOUS_GAP_MS = 350` 由 `calamityui.js` 擁有，屬 presentation pacing；`calamityrun.js` 不再擁有 UI 節奏常數。
- `calamityrun.js` 是文明災厄單場／連續討伐唯一 runtime owner；不共用主線「敗北即停止」的連戰 pipeline。
- 單場：`runCivilizationCalamitySingle(id)` 只完成 1 場後結束 runtime。
- 連續：正式 signature 固定為 `runCivilizationCalamityContinuous(id, options)`；舊 object-first 雙 signature 已退休。玩家勝敗都算完成一場，死亡不結束 run，下一場仍由 Calamity Core 滿血開始。
- 災厄死亡後 Core 已完成印記結算並把 `currentHp=null`，所以下一場自動進入同一災厄的下一個完整滿血擊殺週期。
- 手動停止：`requestCivilizationCalamityContinuousStop()`。如果已完成本場、正在 UI callback／動畫階段，立即將 runtime 標成 stopped，且不再啟動下一場；如果將來在 fighting phase 收到停止要求，則本場結算後停止。
- 每一場正式 HP／印記先由第 7 批 Core 原子保存，再交給 `onBattleComplete`；動畫途中關頁不會回滾已完成那一場。
- runtime 只存在 JS 記憶體，不寫入 save；重新整理／真正關閉頁面後不恢復連戰。Continuous Rule V3：GM「背景戰鬥」關閉時，`pagehide` 會終止 active run；GM 開啟時保留 active run，並由 `backgroundProgress("calamity")` 套用既有背景時間 credit／continuous 上限。
- Run 每場之間至少 yield 一次瀏覽器 event loop；UI 的 350ms 場間等待不屬 Run。真正關閉網頁後不會有獨立離線災厄推進 owner。
- Snapshot 提供：目前災厄、battleCount、wins／losses／kills、totalTurns／averageTurns、stopRequested、災厄目前／最大 HP、玩家目前／最大 HP、印記狀態與上一場摘要，供第 9 批一般戰鬥畫面與極簡模式共用。
- `calamityrunintegrity.js` 檢查 runtime API、Continuous Rule V3、Calamity Core 單一 HP restore owner、GM 背景戰鬥 gate、頁面啟動不得從 save 恢復 active run、無 active run 的 stop 安全性，以及 run state 不得寫進 `state.calamities`。350ms 節奏改由 `calamityuiintegrity.js` 驗證。

## 4.10 2026-09-19 全戰鬥呈現統一修正（已完成）

- 第 1 批：災厄固定 HP 1,000,000、Combat Presentation V2 lifecycle、shield state 與跨戰鬥 clear。
- 第 2 批：主線＋特殊怪＋懸賞全面改為 structured presentation；恢復專精／印記浮字；護界使用白色 shield overlay。
- 第 3 批：競技場＋虛空改用 structured presentation；鏡像以 `prepareMirrorCombatPresentation()`／`animateMirrorStructuredCombatPresentation()` 對稱接入。
- 第 4 批：災厄也改用 unified structured presentation；正式退休舊 log pulse presentation API 與主線舊 HP writer；Runtime／Combat FX／Final Integrity 鎖定全模式 lifecycle。
- 正式戰鬥呈現模式目前涵蓋：主線、特殊怪、懸賞、競技場、虛空、鏡像、文明災厄。

## 4.9 文明災厄玩家 UI／極簡模式

- `CALAMITY_UI_VERSION = 3`
- `CALAMITY_MINIMAL_MODE_VERSION = 1`
- `CALAMITY_BATTLE_VIEW_VERSION = 1`
- 首頁正式新增「文明災厄」，順序固定在「副本」後、「遊戲說明」前；手機 2 欄因此自然形成第 4 排「副本／文明災厄」。
- 災厄頁只 render `isCivilizationCalamityUnlocked(id) === true` 的項目；尚未解鎖的災厄名稱與對應印記名稱**完全不出現在 HTML**，不是灰掉／鎖住。
- 已解鎖但尚未首殺時，對應印記顯示「未取得」；首殺後顯示 Lv.0，之後顯示目前 Lv／升級進度，Lv.10 顯示 MAX。
- 印記卡直接顯示能力：未取得時預覽 Lv.1；Lv.0 明示尚未生效並顯示 Lv.1；Lv.1～Lv.9 顯示目前效果＋下一級；Lv.10 顯示目前效果＋MAX。文字與數值由 `markEffectDescription()`／Mark Core 產生，UI 不維護第二套印記規則或文案公式。
- 每隻災厄提供「單場挑戰／連續討伐」；連續戰鬥畫面才顯示「停止連續討伐」與「極簡模式」。
- 正常戰鬥使用正式 `combatPlayerCard / combatEnemyCard / combat-damage` DOM contract，因此共用第 4 批 `combatfx.js` 的印記 structured FX。
- Calamity UI V3：災厄戰鬥 HP／浮字完全由 `prepareCombatPresentation()`＋`animateStructuredCombatPresentation()` 消耗 Combat Core structured events；舊 `consumeCombatPresentationPulseManual()` 已退休。一般戰鬥畫面與極簡模式共用單一 `battleView` snapshot，不再維護四個獨立 HP display 欄位。
- 戰鬥 UI 精簡：所有正式戰鬥共用的 `.combat-message` 文字訊息列已由 `battleflow.css` 隱藏；玩家只看雙方框、HP、傷害／閃避跳字、專精／印記浮字。Combat Core／各模式內部 logs 保留供動畫、除錯與 Integrity，不作玩家可見資訊。
- UI 每場先以 `enemyStartHp / playerStartHp` 預填，再播放動畫，避免 Core 已結算後畫面短暫閃成戰後 HP。連戰標題與極簡模式使用 callback 的 `battleNumber`，不把已完成 `battleCount` 誤當下一場。
- 災厄 structured animation 依 eventCount 動態使用 48／32／20／12ms step delay，opening 90ms、impact 45ms、end 150ms；連戰場間固定 350ms，該常數由 UI owner 管理。
- GM「背景戰鬥」開啟時，`calamityui.js` 會把 background-aware `sleep` 注入 `animateStructuredCombatPresentation()`；opening／impact／step／end 以及場間 350ms 都走 `backgroundProgressSleep("calamity")`，背景時間 credit 可在回前景後完整追趕，不再只保留 active run。
- 極簡模式直接註冊到共用 `mainminimalmode.js` adapter；共用相同 overlay／時鐘／滑動退出配置。內容只顯示：目前敵人、連續戰鬥第 N 場、災厄 HP／最大 HP、玩家 HP／最大 HP；不顯示 EXP／金幣。
- 選擇／印記頁使用既有 `assets/backgrounds/calamity/`；災厄戰鬥直接共用虛空戰鬥 `assets/backgrounds/dungeon-void-battle/`；災厄結算直接共用虛空結算 `assets/backgrounds/dungeon-void/`，桌機與手機皆同規則；不複製背景檔，`backgroundpreload.js` 不需改。
- 區域最後 Boss 首殺流程：戰鬥結算 → pending 正式劇情 → 劇情第一次真正完成 → 顯示「文明災厄已解鎖／災厄名稱／可前往文明災厄挑戰」。提示不新增 save 欄位；利用 story `firstCompletion` 與正式 `bossKilled[region.mapEnd]` 判定。戰線紀錄重播不呼叫 `completeStory()`，因此不重複提示。
- `calamityuiintegrity.js` 檢查首頁順序、UI API、V3／Battle View V1／Minimal V1、350ms UI pacing、structured presentation、可見 IDs、已解鎖災厄／印記同時顯示，以及尚未解鎖名稱完全不洩漏到 renderer。


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
- 競技場升階維持雙條件：正式 500 次戰力評估至少 485 次全通（97%）＋對應主線區域已開放。
- 競技場階層成長維持每階 HP +5%、有效傷害 +1.5%、DEF +3%。
- 2026-09-18 平衡基準：低位物理倍率 1/1/1；中位（Hard）HP 0.96、有效傷害 0.96、DEF 0.98；高位（Extreme）HP 0.90、有效傷害 0.92、DEF 0.96。
- 高位 Extreme 特殊能力同步下修：第1戰暴擊上限11%、閃避9%；第2戰暴擊16%、閃避13%、雙特性25%；第3戰暴擊19%、閃避16%、雙特性30%。
- 競技場評估相容版本正式拆分為 position model / assessment rule / balance；目前為 **1 / 4 / 3**。Assessment State／Runtime 皆為 V4。
- 500 次評估簽章會包含上述版本、`MARK_COMBAT_RULE_VERSION`、角色等級、基礎能力、VIP、戰鬥專精與 **10 枚印記等級**。任一相容版本、正式競技場 balance version、Mark Rule 或相關角色能力改變時，舊評估自動失效重跑；只清除／失效 lastCheck／promotionReady，不重置 highestArenaUnlocked、主線進度或已解鎖競技場。評估開始時會鎖定 marks snapshot，500 次 × 3 戰全部使用同一份印記能力。
- 此競技場機制本身不需要另升 Save Schema；目前全域 Save Schema 已因文明災厄／印記持久資料升為 13。
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

- `MIRROR_COMBAT_CORE_VERSION = 4`
- `MIRROR_COMBAT_MARK_RULE_VERSION = MARK_COMBAT_RULE_VERSION = 1`
- 20 場開始前鎖定玩家快照，正式 stats 來自 `playerCombatStats()`；snapshot 同時保存 10 枚印記等級與 mark rule version。
- 玩家與鏡像使用完全相同的印記等級；護界／不屈／戰意在每一場各自獨立重骰。為維持鏡像對稱，先決定先攻，再依先攻方→後攻方順序骰開場印記。
- 壓制／鎮心／韌性／吸收／復仇／無視／反噬與共用 Combat Core 使用同一 Mark Core 公式；鏡像雙方都可觸發。
- 每場雙方滿血、獨立，50/50 先攻。
- 基礎傷害只呼叫 `combatDamageWithRng()`；缺少就 error，不 fallback。
- counter 不可形成反反擊無限鏈；死亡後停止尚未發生的 combo/counter。
- `MIRROR_RUN_VERSION = 3`、`MIRROR_MARK_PRESENTATION_VERSION = 1`；鏡像戰畫面沿用 `combatMarkFxDescriptor()` 的印記文案／樣式，再依事件 owner/target 顯示在玩家或鏡像框。

正式鏡像單場不發 EXP、金幣、裝備、石頭、特殊怪或主線進度，也不扣玩家本體 `state.hp`。

GM 可重置今日鏡像狀態、跑 1 次／100 次測試、跑對稱回歸；一般模擬使用目前正式角色能力（現已包含印記），64 組對稱回歸則強制滿級戰鬥專精＋10 枚 Lv.10 印記。正式 `mirrorfinalintegrity.js` V5 也會用滿印記做較小 symmetry smoke。

Save Schema 已於 2026-09-19 文明災厄大更新第 1 批升為 13；鏡像與故事本身仍未另外要求升版。

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
- 戰線紀錄 `.story-record-page` 正式共用 `assets/backgrounds/guide-settings/desktop.webp`／`mobile.webp`；不另複製圖片，仍由 `backgrounds.css` 與既有 preload 自動處理。
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

## 9.6 2026-09-18 第一部 Lv1～500 劇情重寫完成狀態

本輪已完成**序章＋十大區域全部正式故事重寫與排版整理**，並已寫入 `main`。目前不是草稿狀態，而是正式 `storydata-*.js` 內容。

固定篇幅政策（以 `storyintegrity.js` 的 `STORY_FORMAT_POLICY` 為唯一正式檢查）：

- `earth-prologue`：12 頁；每頁 90～155 可見字元；至少 3 個自然文字區塊。
- 每個 50 級區域前 9 篇 Boss：各 11 頁；每頁 90～120 可見字元；至少 2 個自然文字區塊。實際正式資料大多以 3 區塊排版。
- 每區第 10 篇區域收尾：15 頁；每頁 120～155 可見字元；至少 3 區塊。
- 最終 `galactic-unification-boss-10`：**31 頁正式長篇特例**；每頁 90～155 可見字元；至少 3 區塊。不要為了縮到 20 頁而破壞收尾節奏。
- 最終篇 31 頁已是正式政策，**不是 warning**。

重寫期間固定遵守：

- 每篇 Boss 故事必須自然包含該地圖正式 5 隻敵人名稱；正式來源直接取 `MAPS`。
- 10 區 × 10 篇 Boss 已由 Integrity 自動保護 50/50（每區）敵人名稱覆蓋。
- 正式本文禁止「小區域、關卡、第幾關、普通怪、菁英怪、Boss、玩家、頁數、遊戲、等級、首領戰」等遊戲內／破壞沉浸感用語。
- 文字已改為自然分段，避免敘事與對話全部擠成單一大段。
- 正式故事不可另造第二套區域／地圖／敵人資料；名稱與順序一律由 `WORLD_REGIONS + MAPS` 對照。
- 區域不是 10 個彼此獨立短篇；前篇必須承接後篇，區域間也要保留人物、制度、錯誤、死亡與政治後果。
- 區域第 10 篇不只處理最後 Boss，還必須收束本區前 9 段累積。
- Lv450 前不得把「外層觀測」講破；第 8～9 區的連續體異常仍只能標記為未知。
- 最終兩句固定訊號與第一部結尾必須原樣保留。

本輪十大區域敘事功能：

1. 地球：從失控、救援與觀測節點，建立「誰在控制我們」。
2. 太陽系：拆隔離時發現守門者也曾阻擋外來戰爭；人類第一次犯下較大錯誤。
3. 近星：人類第一次被外文明視為新的武裝文明；瑟安線建立。
4. 星際邊疆：沒有最高中心同時帶來自由、剝削、殖民、難民與責任真空。
5. 獵戶臂：文明戰線成為真正能改變區域秩序的力量；指揮官於 Lv250 永久死亡，犧牲不洗白先前越權爭議。
6. 銀河邊境：秩序制度確實起源於真實文明災難，也確實製造受害者；伊芮正式進入長線。
7. 銀河中域：權力誘惑；副官因監控爭議離開後回歸，並保留公開異議。
8. 銀河核心外圍：物理未知、黑洞／奇點／時空限制；「不知道」正式成為資料狀態，不把未知硬解釋成敵意。
9. 銀河核心戰爭：自由真的毀過文明、秩序真的救過文明、秩序也抹除過無辜世界；情報官曾進入裁決體系內部改革後回歸。
10. 銀河統合戰爭：不再只問如何反抗，而是如何用可退出、可覆核、可撤回的多中心制度接住原本由最高中樞維持的公共功能。

最終戰正式結論：

- 不把銀河征服中樞寫成單純瘋狂反派。
- 不主張「自由必然比較安全」。
- 不把所有秩序、監測、隔離、緊急能力全部拆掉。
- 真正拆除的是**不可撤回、不可覆核、不可退出的最高答案**。
- 必要公共功能（危險技術監測、航道同步、巨構／黑洞安全、有限緊急聯合指揮等）改由可監督的多中心機制接手。
- 最終不設新王座，也不把最高權力轉交給主角。

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

- `STORY_MIGRATION_VERSION = 5`
- 專責 storyProgress container、欄位正規化與舊存檔 backfill。
- `historyBackfillRegions` 已正式列入 `legacyFields`，但現在是**退休欄位**。
- 新 storyProgress 不再建立 `historyBackfillRegions`。
- 舊存檔若帶有此欄位，migration 會先依 `bossKilled`／`pendingStory`／`completedStories` 修復缺失故事，再刪除該 legacy 欄位。
- 舊存檔若 `bossKilled=true` 但 `completedStories` 缺故事，仍會補回。
- 若該故事正是 `pendingStory`，backfill 不得把它補成 completed。
- 不得再把 `historyBackfillRegions` 恢復成 repair lock、完成判斷或新存檔欄位。

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

- `STORY_INTEGRITY_VERSION = 9`
- 現在是**純檢查器**，不再先修改／翻譯 story data。
- 每次 `runCivilizationStoryIntegrity()` 都重新掃描最新資料。
- 檢查 10 個 WORLD_REGIONS、10 個 story registry、區域順序與名稱。
- Earth 必須 11 筆（序章＋10 Boss），其他區各 10 筆。
- 正式 stories 必須 101、Boss stories 必須 100。
- title／registry label 必須等於正式 Boss 名稱；location 必須等於正式地圖名；chapter 必須包含正式區域名。
- 正式顯示資料若含 A-Z/a-z → error。
- 正式本文若含「小區域／關卡／普通怪／菁英怪／Boss／玩家／頁數／遊戲／等級／首領戰」等內部敘事詞 → error。
- 每篇 Boss 故事都必須包含該地圖正式 5 隻敵人名稱；來源直接使用 `MAPS`，不另造第二套敵人資料。
- 版面規格集中在單一 `STORY_FORMAT_POLICY`：序章 12 頁、一般 Boss 11 頁、區域收尾 15 頁、最終 Boss 31 頁；字數與最少自然文字區塊也由同一政策集中定義。
- 最終兩句固定訊號存在與順序受保護。
- 10 支 storydata 的 `*_DATA_VERSION` 現在明確視為**模組格式相容版本**，不是故事內容修訂版；純文字內容更新靠 `index.html` cache-bust，不要求 10 支檔案同步升版。
- 目前正式 Story Data 應為 **0 warning**；CI 會把未列入 allowlist 的新 warning 視為失敗。

## 10.8 Story Runtime Integrity

`storyruntimeintegrity.js`：

- `STORY_RUNTIME_INTEGRITY_VERSION = 9`
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

1. **Verify story integrity structure**：確認 `story.css`、`storyintegrity.js`、`storymigration.js`、`storyruntimeintegrity.js`、三支 tests 都存在；root 舊 CI 檔不得回來；並核對目前正式 Story cache tag 與 `index.html` 一致。
2. **Raw story source purity**：在 `storyintegrity.js` 執行前掃原始 storydata；正式文案若有英文或遊戲內部敘事禁詞直接 fail，避免檢查器掩蓋問題。
3. **Story data integrity**：10 區／101 stories／100 Boss mapping／每篇 5 敵人名稱覆蓋／正式頁數字數分段政策／final signals／0 unexpected warning。
4. **Story flow regressions**：首殺 pending、重打不重播、pending 保護、legacy repair、`historyBackfillRegions` 退休清除、pure get、正式 storyrecord 入口、CSS 外移、version gate warning-only 等。

目前 workflow 也會鎖定集中式 `STORY_FORMAT_POLICY` 與 `DATA_VERSION` 的「模組格式相容版本」語意，避免後續又把內容版次與格式版次混用。

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

修正：V4 migration 先把 `historyBackfillRegions` 降為 legacy informational field，避免它再阻止 repair pass；V5 進一步正式退休此欄位，新資料不再建立，舊資料修復後即刪除。

## 12.6 戰線紀錄 go wrapper 已清除

舊 `storyrecordtabs.js` 包 `window.go` 來做「重新進頁選最新區」。

修正：正式 hook 收回 `ui.js go(v)`，record tabs 不再 wrapper global navigation。

## 12.7 CSS 與 CI 結構整理

- 劇情視窗、戰線紀錄、初始裝備 CSS 集中 `story.css`。
- 三支 story CI 搬到 `tests/story/`。
- Actions Node 20 → 24。
- Runtime Integrity 改能力／行為為主，版本只 warning。

## 12.8 2026-09-18 劇情重寫後四批維護整理

第一批：**把人工驗收規則正式程式化**

- `STORY_INTEGRITY_VERSION 7 → 8`，之後再集中政策升到 V9。
- 正式加入頁數／字數／最少自然文字區塊硬檢查。
- 正式加入每篇 Boss 對應 5 隻 `MAPS` 敵人名稱覆蓋檢查。
- Story Source Purity 與 Data Integrity 都加入遊戲內部敘事禁詞。
- CI 對未知 warning 採 fail；目前 allowlist 為空，正常正式狀態應 0 warning。

第二批：**退休 `historyBackfillRegions`**

- `STORY_MIGRATION_VERSION 4 → 5`。
- 新 storyProgress 不再建立此欄位。
- 舊存檔先依 `bossKilled/pendingStory/completedStories` 修復，再刪除此 legacy 欄位。
- `STORY_RUNTIME_INTEGRITY_VERSION 8 → 9`，新增舊資料 repair＋欄位移除＋新資料不得重建的回歸。
- 當時 Story Migration 批次本身未要求升版；目前全域 Save Schema 已因文明災厄／印記持久資料升為 13。

第三批：**集中 Story Policy 與釐清版本語意**

- `STORY_INTEGRITY_VERSION 8 → 9`。
- 頁數／字數／區塊規格集中到單一 `STORY_FORMAT_POLICY`。
- CI 明確鎖定該政策。
- 10 支 storydata 的 `*_DATA_VERSION` 明確定義為「模組格式相容版本」，不是內容修訂號；故事文字更新由 `index.html` cache-bust 管理。
- 更新 handoff 中 migration、integrity、runtime 舊版本與最終 31 頁 warning 舊說法。

第四批：**Story CI／handoff 最後清理**

- Actions step 舊名 `Verify story batch 4 layout` 改為 `Verify story integrity structure`。
- 結構檢查同步核對 `storyintegrity.js`、`storymigration.js`、`storyruntimeintegrity.js` 的正式 cache tag。
- handoff 補正 V4→V5 `historyBackfillRegions` 歷史與 2026-09-18 完整性鏈日期。
- 這四批當時都沒有改故事文字、UI、戰鬥平衡或 Save Schema；之後 2026-09-19 才因文明災厄／印記持久資料升為 13。

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
- 10 枚印記正式管理：每枚可設為「未取得」或 Lv.0～Lv.10；套用時該枚 progress 歸 0 並寫入正式存檔。
- 10 枚印記測試：只提供 Lv.0～Lv.10；未取得與 Lv.0 在戰鬥效果上等價。`gmTestMarkLevels` 只存在本次網頁工作階段。
- GM「目前狀態」一次同步 VIP／專精／強化／印記；既有戰鬥測試摘要會顯示四類能力。
- 文明災厄 GM：可任選 10 隻，不受正式解鎖限制；提供「單次挑戰模擬」與「完整擊殺模擬」。完整擊殺逐場呼叫正式 Combat Core、玩家每場滿血、Boss HP 跨場延續，不以平均傷害外推；100000 場只作瀏覽器安全上限，碰到時明確回報未完成。
- 文明災厄 GM 不提供解鎖 toggle、HP setter、近死／瀕死、擊殺數等作弊控制；所有模擬皆為沙盒，不修改正式災厄 HP、印記或存檔。
- `calamitygm.js` 使用 `registerGmHubSection()` extension API，沒有再疊新的 `gmHtml()` wrapper。
- 舊 HP×500 平衡 smoke 已被 Balance V2 淘汰，不再作目前災厄擊殺場數依據；目前 10 隻災厄最大 HP 改為 500,000 × 災厄等級（第1階 500,000；第10階 5,000,000）。
- 副本相關管理／測試。
- 鏡像：重置今日、20 場測試、100 次統計、對稱回歸。
- 劇情 GM V3：10 區／101 stories 純預覽、前後導航、integrity 明細與重跑。

GM 測試功能應盡量不修改正式玩家進度；若是「管理」模式才明確寫正式 state。
- 2026-09-19 GM 區塊開合狀態改為 session-only：所有管理／測試 section 在重新整理或重新開網頁後一律預設收起；同一網頁工作階段中，玩家切遊戲頁面、切 GM 管理／測試分頁、關閉後再開 GM，都保留各 section 最後的展開／收起狀態。狀態只存在 `gmhub.js` module memory 的 `gmHubOpenSections`，不寫正式存檔、不寫 localStorage／雲端。核心與 extension section 共用 `gmHubSectionToggle()`／`gmHubSectionIsOpen()`；`GM_HUB_SECTION_STATE_VERSION=1`。先前預設展開的「一般管理」「背景戰鬥」「特殊怪測試」「劇情測試」已全部改為初始收起。


---

# 14. UI 與玩家流程重要行為

主頁功能：冒險／戰線紀錄／角色／背包／強化／專精／副本／文明災厄／遊戲說明／設定。

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
戰線紀錄的場景背景由 `backgrounds.css` 管理，正式共用「遊戲說明／設定」的 `guide-settings` 背景。

---

# 15. 完整性檢查鏈

實際載入順序永遠以最新 `index.html` 為準。2026-09-19 main 的主要完整性鏈：

1. `worldmapregistrycheck.js`：世界地圖註冊。
2. `storyintegrity.js`：101 篇正式故事 Data Integrity。
3. `mirrordungeonintegrity.js`：鏡像 config／API／快照／共用傷害／10 枚印記與鏡像浮字 target。
4. `enhancementintegrity.js`：強化核心、成本、掉石、出售、離線、UI、GM。
5. `bosscontinuousintegrity.js`：Boss 單場／連戰、鎖王、背景推進、離線排除等。
6. `mainminimalmodeintegrity.js`：主線極簡模式 hook／背景政策／舊 PowerSave API 退休。
7. `accountcloudintegrity.js`：Auth／Cloud Save／舊 JSON API 退休。
8. `calamitystateintegrity.js`：Schema 13 災厄／印記持久 state、舊存檔 migration。
9. `markcoreintegrity.js`：10 枚印記順序、來源區域、升級需求與效果公式。
10. `calamitycoreintegrity.js`：10 隻文明災厄母體／倍率／解鎖／持久 HP／pure getter 與 Mark Core progression 委派；31 殺印記曲線由 `markcoreintegrity.js` 負責。
11. `calamityrunintegrity.js`：文明災厄單場／連續討伐 runtime、停止／pagehide 與非持久 run state。
12. `calamityuiintegrity.js`：文明災厄首頁順序、UI／極簡 API、可見性與鎖定內容不洩漏。
13. `calamitygmintegrity.js`：印記正式／測試管理、災厄兩種 GM 模擬、禁止作弊控制與安全上限。
14. `combatmarkintegrity.js`：共用 Combat Core 印記順序、structured events、Lv.0 基準與交互回歸。
15. `combatfxintegrity.js`：10 枚印記浮字 target／文字、五模式接線與 presentation API。
16. `runtimeintegrity.js`：專案主 runtime 檢查。
17. `mirrorfinalintegrity.js` V5：鏡像最終 state／舊資料／滿印記 symmetry smoke 回歸。
18. `storymigration.js`
19. `storyprogress.js`
20. `storyrecordtabs.js`
21. `storyruntimeintegrity.js`：故事最終 runtime 行為檢查。
22. `backgroundpreload.js` 最後處理正式背景 reveal。
23. `finalintegrity.js` V2：最尾端匯總 Calamity／Mark／Combat FX／GM／主 runtime／Mirror Final／Story Runtime 報告，鎖定 Save13、Guide V14、災厄／印記 owner 與 Unified Presentation 版本鏈，並以實際 DOM `getComputedStyle()` 驗證戰線紀錄解析到 `guide-settings` 背景。

故事資料的 10 支 `storydata-*` 必須全部先於 `storyintegrity.js` 載入；story migration 必須先於 story progress；`storyruntimeintegrity.js` 必須在 story progress／record tabs 後。

---

# 16. 已知技術債／尚未完成項目

目前沒有已知「玩家正式功能必須立刻完成」的阻斷項目。第一部 Lv1～500 正式故事已完成本輪重寫；使用者已實際回報 GM 劇情測試可正常預覽，並曾確認 Lv100 Boss 首殺故事正常跳出。使用者目前是「大致閱讀沒有問題，但尚未逐篇細看全部 101 篇」的狀態。

仍存在但**不要在無關任務中順手重構**的技術債：

- `cloudsave.js` wrapper `save()` 維護本機存檔時間 metadata。
- `gmhubextensions.js` 仍集中 wrapper `gmHtml()`。
- `backgroundprogress.js` 仍有既有戰鬥流程 wrapper／時間補償整合。
- 2026-09-19 已修正災厄連戰背景戰鬥接線：先前僅 GM gate／active run 有接上，structured animation 仍用普通 `setTimeout`，造成背景 credit 無法完整消耗；目前已透過可注入 sleep 修正，並由 Combat FX／Calamity UI／Runtime／Final Integrity 鎖定。
- `dungeonui.js` 與 `dungeonreturnlabels.js` 有少量返回文字正規化重複。
- `offlineprogress.js` 有 inline modal styles。
- `gmhub.js`、`specialization.js`、部分鏡像／GM UI 仍注入局部 CSS。
- GM 劇情測試本身仍使用少量 inline style；不影響正式故事 CSS owner。
- Story Data Integrity 現在會硬性檢查頁數、字數範圍與最少自然文字區塊；不會自動改寫或拆頁，手機實際閱讀仍以真機為準。
- 最終 Boss 31 頁已是正式 `STORY_FORMAT_POLICY` 特例，不再產生 Story Data warning。
- 101 篇正式故事尚未全部由使用者逐篇在 iPhone Safari 實機閱讀驗證；不可把 CI PASS 說成全篇真機驗收。
- 真機若看到 stale JS/CSS，先檢查 `index.html` cache-bust 與 Safari cache，再判斷邏輯問題。
- 2026-09-19 災厄大整理第 1 批：`getCivilizationCalamityCurrentHp()`／`getCivilizationCalamityStatus()` 已改為 pure read，不再在 getter 內 normalize／修改 state；寫入前正規化仍由 battle／settlement 明確入口負責。`calamitystate.js` 已移除未使用的 balanceVersion 暫存變數與重複 `CALAMITY_FIXED_HP` export；Calamity Core Integrity 新增 getter purity 回歸。Save Schema、戰鬥平衡、UI 與印記效果皆未變更。
- 2026-09-19 災厄大整理第 2 批：新增 `calamityconfig.js` 作為唯一「區域→文明災厄→印記」配對 owner，`calamitystate.js`、`markcore.js`、`calamitycore.js` 均改由此設定衍生；Mark progression（pure snapshot、31 殺升級曲線、正式擊殺 settlement）正式收回 `markcore.js`，Calamity Core 僅委派擊殺 settlement；災厄正式 Boss 母體與敵人 template 改為 module cache 後回傳 copy。當時暫留的舊 Calamity 命名相容 alias 已於第 5 批正式退休。Save Schema、平衡數值、UI 與印記效果皆未變更。
- 2026-09-19 災厄大整理第 3 批：每場戰後回滿 HP 的唯一 owner 固定為 `calamitycore.js` settlement（`CALAMITY_HP_RESTORE_OWNER_VERSION=1`），`calamityrun.js` 的 begin／finish 不再重複 restore；連續討伐 API 收斂為 `runCivilizationCalamityContinuous(id, options)` 單一 signature，`CALAMITY_CONTINUOUS_RULE_VERSION` 升為 3；350ms 場間等待改由 `calamityui.js` presentation pacing owner 提供。同步移除 Calamity UI Integrity 對已退休 log-pulse API 的舊要求，改鎖 structured presentation。Save Schema、平衡數值、戰鬥結果與玩家操作流程不變。
- 2026-09-19 災厄大整理第 4 批：印記效果說明正式收回 `markcore.js`（`MARK_DESCRIPTION_OWNER_VERSION=1`／`markEffectDescription()`），`calamityui.js` 不再複製 10 枚印記文字規則；災厄戰鬥 UI 的 4 個獨立 HP 顯示欄位收斂為單一 `battleView` snapshot（`CALAMITY_BATTLE_VIEW_VERSION=1`），一般戰鬥畫面與極簡模式共用；`calamitygm.js` 印記清單改直接使用 unified calamity config（`GM_MARK_CONFIG_OWNER_VERSION=1`），不再自行由 MARK_KEYS/MARK_DEFS 重建配對。Integrity／Runtime／Final 已同步鎖定。Save Schema、平衡數值、印記效果與戰鬥流程不變。
- 2026-09-19 災厄大整理第 5 批：完成 dead API／Integrity／版本收尾。正式退休 `normalizeCivilizationMarkProgressForCore`、`advanceCivilizationCalamityMarkEntry`、`settleCivilizationCalamityMarkKill`、`markAcquired`、`markProgress`、`window.MARK_DEFS`、`window.CALAMITY_DEFS`；Runtime Integrity 反向鎖定這些舊 API 不得回來。Mark／Calamity Core Integrity 改直接依 unified config 驗證，不再維護第二套名稱／配對陣列；`prepareCivilizationCalamityEntry()` 的重複 presentation clear 已移除。五支災厄分層 Integrity 保留，因各自仍對應 State／Core／Run／UI／GM 的獨立責任。版本常數經檢查後保留現有 state／balance／rule／owner 邊界，未為清理而無意義升版。Save Schema 仍為 13，玩法與數值不變。

- 2026-09-19 競技場 Rank Balance V3：在公式化架構不變的前提下，因實測勝率仍偏高，將後段二次成長再加重。令 `x = rank - 1`：HP = `1 + 0.025x + 0.0075x²`；Damage = `1 + 0.005x + 0.0031x²`；DEF = `1 + 0.016x + 0.004x²`。Rank1 仍為 1.0；前段只小幅提高，Rank7～10 增幅更明顯。Arena Balance 升為 V6；97%／485-of-500 升階門檻、位置模板、三戰規則、玩家專精／印記／VIP／強化本身皆未修改。Balance compatibility 同步升為 6，舊 V5 評估結果會視為 stale 並依新公式重測。Save Schema 不變。

- 2026-09-19 懸賞戰 Balance V1／Difficulty Formula V1：普通／高級／危險不再各自持有一整排戰鬥 magic numbers。三檔只保留 difficulty 0／1／2 與出現率、EXP、金幣、裝備數等獎勵資料；戰鬥能力統一由 `bountyDifficultyProfile()` 計算。正式曲線：HP = `1 + 0.07d + 0.03d²`；Damage = `1 + 0.055d + 0.0225d²`；DEF = `0.88 + 0.035d`。暴擊／閃避 scale、add、cap 與額外特性機率亦由同一 difficulty 產生；普通／高級固定 1 特性，危險為 50% 1 特性／50% 2 特性。敵人仍以不含 VIP 的 `equippedStats()` 建立基準，因此裝備與強化自然被吸收；不額外依專精、印記或 VIP 動態追趕玩家。出現率仍為 45%／35%／20%，獎勵仍為 EXP／金幣 5／8／12 倍、裝備 2／3／5 件。Save Schema 不變。

- 2026-09-19 競技場／懸賞整理第 1 批：純舊碼與舊命名清理，不改任何平衡數值。正式刪除 `dungeonarena.js`、`dungeonbounty.js` 中已由 Unified Structured Combat Presentation 取代且無呼叫的 `setHpUi()`／`pulse()`；GM 模擬 API 由綁死歷史名稱的 `gmSimulateArena100()`／`gmSimulateBounty100()` 改為 `gmSimulateArena()`／`gmSimulateBounty()`，實際模擬次數仍由 `GM_TEST_RUNS` 決定，`gmhub.js` 呼叫同步更新。Save Schema、Arena/Bounty 平衡公式、獎勵與玩家流程皆未變更。

- 2026-09-19 競技場／懸賞整理第 2 批：只整理競技場架構與語意，不改任何平衡值。Arena 正式 runtime／GM／player flow 改以 `position` 表示 normal／hard／extreme，新增 `getArenaPositionConfigs()` 與單一 `getArenaEnemyProfile(rank, positionId, stageIndex)`／內部 `arenaEnemyProfile()` owner，統一組合 Rank Curve × Stage Physical × Position Physical × crit/dodge/trait profile；`buildArenaEnemy()` 改只消費此 profile。既有 `getArenaDifficultyConfigs`、enemy snapshot 的 `arenaDifficulty` 與 assessment signature 內歷史 difficulty 欄位暫保留相容，避免無必要讓既有 500 次升階評估失效；正式呼叫路徑已不再使用舊 difficulty API。normal/hard/extreme 物理倍率仍原封不動為 1/1/1、.96/.96/.98、.90/.92/.96，Runtime Integrity 會鎖定避免架構整理誤改平衡。Arena presentation pacing 改直接讀 `result.events.length`，不再依賴 global presentation snapshot。新增 `ARENA_POSITION_API_VERSION=1`、`ARENA_ENEMY_PROFILE_VERSION=1`、`ARENA_PRESENTATION_PACING_SOURCE_VERSION=1`。Arena Balance 仍 V6、Rank Balance 仍 V3、Assessment compatibility 仍 6，Save Schema 不變。

- 2026-09-19 競技場／懸賞整理第 3 批：完成共用化、版本與 Integrity 收尾，不改任何 Arena／Bounty 平衡值。Arena/Bounty 的 rate 計算改共用既有 `specialRateFromPlayer()`，唯一 trait 抽取改由 `specialmonsters.js` 的 `rollUniqueMonsterTraits()` 共用，`SPECIAL_ENEMY_SHARED_HELPERS_VERSION=1`。Arena 版本常數集中到 `dungeonprogress.js` 的單一 `ARENA_COMPATIBILITY_PROFILE`／`getArenaVersionProfile()`，Arena balance、rank balance、position/profile/pacing、assessment state/runtime 均由此 profile 對齊；assessment signature 內既有 `positionDifficulty` key 為避免讓既有 500 次評估無故 stale 而暫保留純序列化相容，不再作 runtime API。正式退休 `getArenaDifficultyConfigs()`、`getArenaPositionDifficultyId()` 與 enemy snapshot 的 `arenaDifficulty`；Runtime／Final Integrity 反向鎖定舊 API 不得回來。Bounty 設定正式命名為 `BOUNTY_TIER_META`，新增 `BOUNTY_TIER_META_VERSION=1`、`getBountyTierMeta()`／`getBountyTierMetadata()`，退休舊 `getBountyTierConfig(s)` API，GM 同步改讀正式 metadata。Arena Balance 仍 V6、Rank Balance 仍 V3、Bounty Balance 仍 V1／Difficulty Formula V1、Save Schema 仍 13。

- 2026-09-19 主線 iPhone Safari 可見頁卡住修正：`backgroundprogress.js` 的正式背景判定改以 Page Visibility／pagehide 為 owner；Safari 在頁面仍可見時可能回報 `document.hasFocus()===false`，因此 blur／hasFocus 不再單獨把可見頁判為背景。這修正主線連續戰鬥在背景戰鬥開啟時，第一個 `await sleep(60)` 可能永遠等待而停在滿血戰鬥畫面的問題；真正 visibility hidden/pagehide 仍維持 background catch-up。新增 `BACKGROUND_PROGRESS_VISIBILITY_OWNER_VERSION=1` 並由 Boss Continuous Integrity 鎖定。副本、災厄、平衡、獎勵、Save Schema 皆不變。

- 2026-09-19 主線戰鬥卡住根因修正：`combatpacing.js` 仍殘留舊 `window.animateFight` override，會覆蓋 `ui.js` 已改為 Structured Presentation 的正式 `animateFight()`；舊 override 又呼叫已退休的 `setCombatHp()`／`attackMotion()`／`flashCombatText()`，因此 `fightOnce()` 已完成結算與 `save(false)` 後，在動畫階段拋錯，造成單場與連續戰鬥畫面停在滿血起始狀態，但重整後已看到擊殺進度／獎勵生效。現已完全刪除該舊動畫 override，`combatpacing.js` 只保留 sleep／場間 pacing／特殊遭遇 pacing，主線唯一動畫 owner 恢復為 `ui.js -> animateStructuredCombatPresentation()`；新增 `MAIN_BATTLE_STRUCTURED_PRESENTATION_OWNER_VERSION=1`，`combatfxintegrity.js` 會反向檢查不得再出現舊 log parser／HP writer owner。Save Schema、戰鬥數值與獎勵不變。

- 2026-09-19 iPhone Safari 主線背景戰鬥判定 V2：上一版完全排除 blur 後，部分 iOS Safari 真正切到背景時只送 blur、未可靠送 visibility hidden，導致主線連續戰鬥不再吃背景時間。現在改成「Page Visibility/pagehide 優先＋800ms sustained-blur fallback」：hidden/pagehide 立刻進背景；可見頁單純 blur 先等待 800ms，若 focus 回來即取消，只有持續失焦才視為背景。恢復主線連戰的背景 catch-up，同時避免短暫 hasFocus=false 再把前景戰鬥卡住。版本為 `BACKGROUND_PROGRESS_VISIBILITY_OWNER_VERSION=2`、`BACKGROUND_PROGRESS_BLUR_FALLBACK_VERSION=1`。戰鬥數值、獎勵、Save Schema 不變。

- 2026-09-19 主線背景戰鬥正式接回 Structured Presentation：主線舊 `animateFight` 退休後，`ui.js -> animateStructuredCombatPresentation()` 曾未注入 background-aware sleep，導致 `backgroundProgressStart("main")` 雖有啟動，但動畫仍用普通 setTimeout，切背景時無法像虛空／災厄一樣消耗背景時間。現在由 `combatpacing.js` 正式提供 `mainBattlePresentationSleep()`，內部共用既有 `mainFlowSleep()`／`backgroundProgressSleep("main")`，`ui.js` 以 `sleep` option 注入 Structured Presentation；新增 `MAIN_BATTLE_BACKGROUND_PRESENTATION_VERSION=1` 並由 Combat FX Integrity 鎖定。背景偵測本身不再變更，主線與災厄採同一類「presentation sleep injection」接法。戰鬥數值、獎勵、Save Schema 不變。

- 2026-09-19 背景戰鬥重新統一修正：嚴格比對修改前正常版本與目前主線／虛空／災厄後，將 `backgroundprogress.js` 背景判定恢復為已驗證的 `pageHidden || windowBlurred`，正式退休先前誤加的 800ms blur fallback；原先主線卡住的真正根因已確認是退休動畫 override，故不再以延遲 blur workaround 處理。Catch-up credit 被消耗時每次 `backgroundProgressSleep()` 都會 `setTimeout(0)` 讓出 event loop，不再使用每 24 次才 yield 的 `instantSkips` 節流；另新增 `backgroundProgressUiYield(kind)`／`BACKGROUND_PROGRESS_UI_YIELD_VERSION=1`，主線每場、虛空每層、災厄每場完成後在 catch-up 期間至少讓 UI paint 一次，避免場次／EXP／金幣由 20→28→37→114 批次跳號。虛空 Structured Presentation 補上正式 `sleep` injection，`VOID_BACKGROUND_PRESENTATION_VERSION=1`，與主線／災厄同樣消耗各自的 background credit。背景 owner 版本為 `BACKGROUND_PROGRESS_VISIBILITY_OWNER_VERSION=3`。戰鬥數值、獎勵、Save Schema 不變。

- 2026-09-19 全模式戰鬥內動畫速度統一：`combatfx.js` 新增唯一 pacing owner `getStructuredCombatPacing(eventCount)`／`STRUCTURED_COMBAT_PACING_VERSION=1`。主線、特殊怪、懸賞、競技場、虛空、文明災厄、鏡像戰均不再自行維護 opening／impact／step／end delay。正式統一節奏：opening 90ms、impact 45ms、end 120ms；step 依 structured event 數為 ≤55:48ms、56～90:32ms、91～140:20ms、>140:12ms。各模式的場間等待、樓層／階段切換、特殊遭遇提示與背景 sleep injection 仍保留各自流程，不屬於戰鬥內動畫 pacing。Combat FX／Runtime／Final Integrity 已鎖定共用 owner 與 profile。戰鬥數值、獎勵、Save Schema 不變。

- 2026-09-19 Structured Combat Pacing V2：依使用者「所有戰鬥內統一且要快」的目標，正式退休 V1 依 eventCount 使用 48／32／20／12ms 的動態 step 變速。現在主線、特殊怪、懸賞、競技場、虛空、文明災厄、鏡像戰全部固定使用同一高速節奏：opening 70ms、impact 35ms、step 24ms、end 90ms；eventCount 僅保留在 pacing snapshot，不再影響速度。唯一 owner 仍為 `combatfx.js -> getStructuredCombatPacing()`，版本升為 `STRUCTURED_COMBAT_PACING_VERSION=2`。各模式戰鬥外的場間等待／樓層切換／提示時間與背景 sleep injection 不變。Combat FX／Runtime／Final Integrity 已同步鎖定 V2 固定值。戰鬥數值、獎勵、Save Schema 不變。

- 2026-09-19 Combat／Background Cleanup 第1批：GM「背景戰鬥」正式統一控制 main／void／calamity；虛空不再無條件啟動 background flow，GM 關閉時會一併 stop void。主線移除 beginCombat 60ms 與 battlepipeline 每場 60ms 的重複開場等待，Structured Combat Pacing V2 的 opening 70ms 成為唯一戰鬥內開場節奏。Combat FX 退休 attacking 340ms／hit 260ms 固定 cleanup timer，改由實際 CSS animationend lifecycle 清理，避免高速連擊時舊 timer 干擾新一擊。離線實戰速度樣本升為 OFFLINE_BATTLE_SAMPLE_VERSION=2／MAIN_REAL_BATTLE_SAMPLE_VERSION=2；舊未版本化 battleSamples、legacy avgBattleMs fallback、舊 pendingSettlement 均不再參與 V2 離線收益，新 sample／pending 均帶 sampleVersion。Save Schema 維持 13。

- 2026-09-19 Combat／Background Cleanup 第2批：主線 background lifecycle 正式收回 `battlepipeline.js`。連續主線且 GM「背景戰鬥」開啟時，由 pipeline 自己 `backgroundProgressStart("main",{mode:"continuous"})`，並以 `try/finally` 保證所有正常完成、early return 或例外路徑最後 stop main flow；GM 關閉或非連續模式不啟用。共用 `backgroundprogress.js` 已退休 `beginCombat/runBattles` late wrapper、`mainBattleMode()`、`mainBattleAllowsBackground()` 與 `BACKGROUND_PROGRESS_MAIN_SHARED_VERSION/BACKGROUND_PROGRESS_GM_GATE_VERSION`，現在只負責 visibility／blur 環境偵測、flow、credit、sleep、UI yield 等共用 engine API，正式 marker 為 `BACKGROUND_PROGRESS_CORE_VERSION=1`。主線正式 lifecycle marker 為 `MAIN_BATTLE_BACKGROUND_LIFECYCLE_VERSION=1`。既有 Visibility Owner V3、background credit 0.96、continuous 12h cap、UI yield 與 main／void／calamity GM gate 行為均不變。Save Schema 維持 13。

- 2026-09-19 Combat／Background Cleanup 第3批：`combatpacing.js` 退休舊主線動畫速度模型與隱性 sleep wrapper，包括 `MAIN_START_DELAY/MAIN_WINDUP_DELAY/MAIN_NORMAL_DELAY/MAIN_BOSS_DELAY/MAIN_END_DELAY/MAIN_PRE_DELAY`、`estimateMainBattleDurationMs()`、`SPECIAL_DELAY_MAP`、`specialPacingActive` 與全域 `window.sleep` override。正式保留的主線 flow pacing 僅為 normal/boss 140ms、elite 220ms 場間等待，以及明確 API `mainBattleFlowSleep(ms)`／`mainBattlePresentationSleep(ms)`；`MAIN_BATTLE_PACING_VERSION=2`、`MAIN_BATTLE_FLOW_SLEEP_VERSION=1`。battlepipeline 場間等待直接呼叫 background-aware `battleFlowSleep`；特殊遭遇提示與進戰等待改為明確 flow sleep，正式值 850ms／140ms／70ms，`SPECIAL_ENCOUNTER_FLOW_PACING_VERSION=1`，不再靠全域 sleep 偷換 120→70。Structured Combat Pacing V2 70/35/24/90 不變，背景 credit/catch-up 行為不變，Save Schema 維持 13。

- 2026-09-19 Combat／Background Cleanup 第4批：完成低優先與防回歸收尾。Background Progress 正式定義為 single-active-flow policy（`BACKGROUND_PROGRESS_SINGLE_ACTIVE_FLOW_VERSION=1`），同時間只允許 main／void／calamity 其中一個 active flow；新 flow 依既有語意取代舊 flow，並提供 `backgroundProgressActiveKind()`。前景 catch-up UI yield 升為 V2，優先使用 `requestAnimationFrame()` 等待下一個 paint boundary，並保留 80ms timer fallback，避免 Safari 剛切背景時 rAF 暫停造成流程卡死。戰鬥外場間等待集中至 `combatpacing.js` 的 `COMBAT_OUTER_PACING_VERSION=1`／`combatOuterGapMs()`：主線 normal 140ms、elite 220ms、boss 140ms；虛空樓層 350ms；文明災厄場間 350ms。虛空與災厄 UI 改直接讀共用 owner；舊 `CALAMITY_CONTINUOUS_GAP_MS` 第二數字 owner 已退休。虛空舊未使用 `pulse()`／250ms cleanup timer 亦移除。Boss Continuous Integrity 的舊 GAME_GUIDE_VERSION V10 檢查已修正為正式 V14。相關 Void／Calamity／Boss／Runtime／Final Integrity 均同步更新。Structured Combat Pacing V2 70/35/24/90、GM background gate、offline sample V2、Save Schema 13 均不變。

- 2026-09-19 Background Fast Catch-up V1：依實際體感恢復早期「逐場數字高速追趕」效果，同時保留防卡死保護。\`backgroundProgressUiYield()\` 升為 V3；catch-up credit 存在時，每一場／層仍先以 \`setTimeout(0)\` 輕量讓出 event loop，使場次能 21→22→23…快速連續逼近；每 8 次 yield 強制一次 \`requestAnimationFrame\` paint boundary，並沿用 80ms timer fallback，避免 iPhone Safari 長時間只跑 JS 或 rAF 暫停造成畫面卡死。新增 \`BACKGROUND_PROGRESS_FAST_CATCH_UP_VERSION=1\` 與 \`BACKGROUND_PROGRESS_FAST_YIELDS_PER_PAINT=8\`，main／void／calamity 共用同一 owner。背景 credit 0.96、12h cap、戰鬥數值、獎勵、Save Schema 均不變。\n\n- 2026-09-19 文明災厄 HP Balance V3：依 GM 實測不同階災厄總討伐回合過於接近，將原本 10 隻統一 1,000,000 HP 改為 `500,000 × 災厄等級`（第1～10階依序 500,000 至 5,000,000）。`calamitystate.js` 成為 HP 曲線 owner，正式常數為 `CALAMITY_HP_PER_LEVEL=500000`，並提供 `getCivilizationCalamityConfiguredMaxHp(id)`；舊 `CALAMITY_FIXED_HP` 正式退休。Balance 升為 V3，舊 `currentHp` 只依各階新上限 clamp，不重置印記、解鎖或其他進度。ATK×1.10、DEF×1.05、暴擊10%、閃避10%、獎勵與連續討伐規則均不變。Save Schema 維持 13。\n\n- 2026-09-19 Offline checkpoint recovery 修正：`offlinefarmtarget.js` 將 persisted checkpoint 與 `state.offline.lastSettledAt` 的比較恢復為舊版已驗證語意：當 persisted checkpoint **較早**（`persistedCheckpoint < current`）時，恢復較早的離線起點，避免載入流程中的 save/checkpoint 先把 `lastSettledAt` 推到目前時間而吃掉離線區段。此次只恢復既有 recovery 邏輯，不恢復舊 fallback farm target、不更動 V2 battle samples、收益倍率、12h cap 或 Save Schema。\n\n- 2026-09-19 Offline V2 sample migration 修正：`battlepipeline.js` 正確寫入 `sampleVersion:2`，但 `savemigration.js -> normalizeRealBattleSamples()` 重建 sample 時遺漏 `sampleVersion`，導致重新開遊戲後 `offlineprogress.js` 將所有樣本視為非 V2 並過濾，`resolveFarmTarget()` 回傳 null，離線結算因此不出現。現已在 migration normalize 回傳 shape 中保留 `sampleVersion:2`。只修正式 sample owner，不恢復舊 fallback target、不更動收益倍率、clock guard、12h cap 或 Save Schema。\n\n- 2026-09-19 Offline 防回歸整理第 1 批：`OFFLINE_BATTLE_SAMPLE_VERSION=2` 正式 owner 移至較早載入的 `savemigration.js`，並由該檔 export `window.OFFLINE_BATTLE_SAMPLE_VERSION`；`savemigration.js -> normalizeRealBattleSamples()` 與後載入的 `offlineprogress.js` 均改讀同一 owner，不再各自硬寫版本數字。`runtimeintegrity.js` 新增 migration probe：建立合法 V2 sample，經正式 `migrateSave()`／offline normalization 後驗證 `battleSampleVersion` 與 row `sampleVersion` 仍等於正式 owner，防止再次發生載入時版本欄位被洗掉。未更動離線收益倍率、farm target、clock guard、12h cap、checkpoint 語意或 Save Schema。\n\nSave Schema 現為 13；後續仍不得在無關任務中擅自升版。

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
- 災厄／印記舊相容 API：`normalizeCivilizationMarkProgressForCore()`、`advanceCivilizationCalamityMarkEntry()`、`settleCivilizationCalamityMarkKill()`、`markAcquired()`、`markProgress()`、`window.MARK_DEFS`、`window.CALAMITY_DEFS`。
- `gmSimulateArena100()`／`gmSimulateBounty100()` 舊 GM 測試 API 命名。
- Arena 舊 difficulty API：`getArenaDifficultyConfigs()`、`getArenaPositionDifficultyId()`、enemy snapshot `arenaDifficulty`。
- Bounty 舊 tier config API：`getBountyTierConfig()`、`getBountyTierConfigs()`。

---

# 18. 本次交接更新前已重新核對的 main 正式來源

本次不是只靠聊天記憶，已重新讀取／核對目前 main 的至少下列正式來源：

- `PROJECT_HANDOFF.md`（舊版）
- `index.html`
- `.github/workflows/story-integrity.yml`
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
- `worldmaps-earth.js` ～ `worldmaps-galactic-unification.js`（10 區正式地圖來源）
- `storydata-earth.js` ～ `storydata-galactic-unification.js`（10 區正式故事來源）
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

目前可視為穩定基線：**Save 13、Lv1～500、10 區 100 地圖、101 篇正式故事、文明災厄／印記持久 state V1、Mark Core V1、Combat Mark Integration V1、Combat Mark FX V1、Combat Presentation V2＋Unified Structured Presentation V1（第二批完成主線／特殊怪／懸賞；第三批完成競技場／虛空與鏡像對稱 adapter；第四批完成災厄統一、退休舊 log pulse API／主線舊 HP writer，並由 Combat FX／Runtime／Final Integrity V2 鎖定全模式 lifecycle）、Mirror Combat Core V4（marks）、Arena Assessment V4（marks）、Civilization Calamity Core V1、Calamity Run V1、Calamity UI V3／Minimal V1、Calamity GM V1／Mark GM V1、Game Guide V14、Final Integrity V2、Story Integrity V9、Story Migration V5、Story Runtime Integrity V9；Story CI 正常狀態應 0 warning。** 下一個對話仍必須重新讀取 main，不可只靠這句摘要。

標準接手指令：

> **讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際相關程式碼與完整 `index.html` 載入順序，完整承接《文明戰線》專案。`main` 是唯一真實來源；若 handoff、聊天記憶、舊規格或舊 commit 與 main 衝突，以 main 為準。現在先不要修改。**

若下一個對話直接要求修改，使用：

> **先讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新讀取本次需求涉及的 `main` 正式 owner、相依檔案與完整 `index.html`。確認現況後直接依需求修改 GitHub `main`；修改後重新讀取 main 自我檢查，JS/CSS 改動同步更新 `index.html` cache-bust。優先修改正式來源，不要新增不必要 wrapper、fallback、第二套公式、第二套結算或第二套 state owner。**
