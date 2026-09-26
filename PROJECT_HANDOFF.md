# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-26（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要，不是第二套規格；若 handoff、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。

最近一次重新確認的**遊戲功能程式碼基準 HEAD**為 `93287fd1f305b96037ab5f658e5b0ff3c2ca6254`。  
此 HEAD 已包含 VIP 無上限正式改版、後續 owner 收斂、GM「主線鎖血」及其 owner／呈現收斂。後續若只有文件 commit，不代表遊戲功能變更；承接時仍必須重新讀 actual `main` 並 compare。

---

# 1. 專案定位

《文明戰線》是純前端、文字／數值養成、科幻星際 RPG，支援桌機與手機；iPhone Safari 是重要實機環境。

目前正式已實作兩個紀元：

- **銀河紀元**：Lv.1～500，10 區、100 地圖，普通／菁英／Boss。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss。
- **第三紀元「高維紀元」**：設計已進入完整規格階段，但尚未實作到 runtime／save。

現行正式世界永久狀態仍以 `secondWorld.entered` 為準；第三紀元尚未建立正式 state／save schema／owner。

---

# 2. 存檔／Migration／相容政策

正式 save key：`frank_text_rpg_save`。

- legacy `SAVE_VERSION = 13`：只供舊相容。
- 正式 `SAVE_SCHEMA_VERSION = 15`，owner：`savemigration.js`。
- `SAVE_LOAD_PIPELINE_VERSION = 2`。
- `SAVE_NORMALIZATION_PIPELINE_VERSION = 1`。
- `SAVE_LEGACY_SUPPORT_POLICY_VERSION = 1`。
- `SAVE_MIN_SUPPORTED_VERSION = 1`。
- `SAVE_LEGACY_SUPPORT_MODE = "all-known"`。
- `SAVE_FUTURE_VERSION_GUARD_VERSION = 1`。

政策：

- 已知 V1+ 舊 save 全部繼續 migration。
- 未來版本 save 必須 fail-closed；Local Load、Cloud Download、GM JSON Import 共用正式版本保護。
- `migrateSave()` 本身也有 future-version 第二層防線。
- Save Write Guard V1 必須保留；local load 未 resolve 前不可覆寫正式 save。
- GM sandbox 不得寫正式 save。
- schema 15 會清理 GM transient 欄位。

正式 normalization 順序：

`worldPhase → worldProgress → level → gear → enhancement → vip → specialization → daily → dungeon → calamity → titles → offline → persistentFlags`

`offlinestatecore.js` 是 Offline save normalization 唯一 owner：`OFFLINE_STATE_NORMALIZATION_VERSION = 1`、`OFFLINE_BATTLE_SAMPLE_VERSION = 3`、每速度最多 8 sample。`offlineprogress.js` 只管 runtime 收益／sample 收集。

`compatibilityowners.js` 管理 legacy compatibility：正式 level cap owner 是 `levelprogression`；正式 Arena state 是 `arenaByWorld`；legacy `MAX_LEVEL=500`、`dungeon.arena` 僅相容用途；`level100balance.js` 已退休。

---

# 3. 世界／主線／等級

## 3.1 銀河紀元

正式 owner：`data.js`、`worldmaps-*.js`、`engine.js`、`battlepipeline.js`。10 區、100 地圖，每圖 5 級範圍、5 隻怪。

## 3.2 宇宙紀元

正式 owner：`secondworlddata.js`、`secondworldmainline.js`、`secondworldcombat.js`、`secondworldrewards.js`。

- 10 區／100 Boss；Boss 等級 505、510、…、1000。
- 入場：Lv.500、銀河最終主線完成、8 專精全60、5部位+20、10印記全10；VIP不限。
- 進入宇宙初始化 `secondWorld` 並切斷銀河離線殘留。

宇宙主線 Boss 正式基準：

```text
BASE_STAT = 2700
HP : ATK : DEF = 12 : 2 : 1
N = 0..99
M(N) = 1 + 0.015*N
HP  = ceil(2700*12*M)
ATK = ceil(2700*2*M)
DEF = ceil(2700*1*M)
```

Lv.505：32,400 / 5,400 / 2,700。  
Lv.1000：80,514 / 13,419 / 6,710。  
基礎暴擊／閃避 0%，仍可受特性修改。

`.015` 中後期再驗證已取消，除非使用者主動重開。

## 3.3 world-aware 等級

正式 owner：`levelprogression.js`。

- `FIRST_WORLD_LEVEL_CAP = 500`
- `SECOND_WORLD_LEVEL_CAP = 1000`
- `ABSOLUTE_MAX_LEVEL = 1000`
- runtime 使用 `effectiveLevelCap()`。
- 宇宙 Lv.500～999：`ceil((25 + 4*L) * 250)`；Lv.1000：0。

第三紀元已確定設計為 Lv.1000→2000、每級固定1000萬EXP，但 current runtime 仍只到1000；未正式實作前不得自行改 cap。

---

# 4. 宇宙資源／裝備／強化／死亡

- 宇宙資源：暗物質、暗能量。
- 宇宙主線基礎勝利：EXP、暗物質、+1 暗能量、固定 1 件 world2 裝備。
- VIP16 可額外第2件 Boss 裝備；正式結果用 `equipmentRewards[]`。
- `item / itemResult / sale / kept` 只作第一件 legacy projection，新 consumer 不應再依賴。
- world2 品質：優良45%、稀有35%、史詩15%、傳說4.5%、神話0.5%。
- 戰敗不扣既有 EXP、不降級；30%機率遺失穿戴裝備，VIP20完全防止。
- world2 贖回＝正式出售價×10暗物質；world1 裝備在宇宙遺失免費贖回。
- 神話出售額外 +1 暗能量；鑑價只放大暗物質。
- 銀河強化 +0～+20；宇宙正式 +20～+40；GM sandbox 0～40。
- 每級主屬性 +2.5%，+40＝+100%；+21～40 使用暗物質＋暗能量。

第一、第二紀元裝備的主屬性／詞條能力公式共用同一套 owner；第三紀元已確認延續同一數值算法到 Lv.2000，不另造第三套裝備能力公式。

---

# 5. VIP／專精／文明等級

## 5.1 VIP 無上限（正式）

**舊「VIP 最大20／VIP20後積分無用途」敘述已失效並從本 handoff 刪除。**

正式 owner：`vipprogression.js`。

- `VIP_PROGRESSION_VERSION = 14`
- `VIP_UNBOUNDED_LEVEL_VERSION = 1`
- `VIP_PERK_MAX_LEVEL = 20`
- `VIP_POINTS_SOURCE_OF_TRUTH_VERSION = 1`
- `VIP_STATE_RECONCILIATION_VERSION = 1`
- VIP 等級**無上限**。
- 門檻永久為 `1000 × VIP等級²`。
- 每級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25pp、閃避 +0.25pp。
- **VIP20只是特殊特權畢業，不是等級封頂。**
- VIP21+ 不新增特殊特權，但既有特權與每級基本能力持續生效。
- 舊存檔 VIP 真實來源是 `vipPoints`；`vipLevel` 是可重建衍生值，normalize 時依積分重算。
- Save schema 維持15，不需 migration。

VIP特殊：VIP2銀河主線掉裝+5pp；VIP4／12副本積分倍率；VIP6特殊遭遇+2pp；VIP10特殊獎勵10%再發動；VIP20死亡裝備保護。

### VIP Loot Core V2

正式 owner：`viplootcore.js`，`VIP_LOOT_CORE_VERSION = 2`。

- VIP8：15% 優先最弱裝備部位。
- VIP14：5% 品質 +1。
- VIP16：Boss 15% 額外 1 件。
- VIP18：Boss 10% 品質 +1。
- VIP14＋18可獨立疊加，最高品質5。
- VIP21／50／100等高等級完整繼承既有特權，不新增21+ tier。

`resolveVipLootModifiers(...)` 統一 VIP8／14／18；`vipLootBossExtraDropTriggered(...)` 統一 VIP16。銀河主線、銀河／宇宙懸賞、宇宙主線共用 owner；懸賞不是 Boss，因此不套16／18。

完整 VIP 改版紀錄見 `PROJECT_VIP_UNBOUNDED_UPDATE.md`。

## 5.2 專精／文明

8 專精最大60。文明等級 `secondWorld.civilizationLevel` 0～10；宇宙每級 final damage +5%，Lv.10 ×1.50；正式入口 `civilizationCombatDamageMultiplier(...)`。

---

# 6. 戰鬥節奏／背景／離線

- 場內、場間正式基準 140ms；舊 220/300/350/450 與 60/80ms 啟動等待不得復活。
- 玩家 1×／1.5×；GM 可測2×。
- Background 單一 active flow，最長12h，credit 0.96；主線／虛空／災厄支援 fast catch-up。
- Offline 最短1分鐘、最長12h；EXP10%；銀河金幣10%／宇宙暗物質10%；裝備流程10%；銀河直接強化石期望5%／宇宙直接暗能量5%。

宇宙災厄 `secondworldcalamityrun.js`：`CONTINUOUS_VERSION=2`，支援背景、fast catch-up、pagehide、throttled presentation／checkpoint；minimal mode 共用正式 run，不另造第二套。

---

# 7. 災厄／印記／稱號

銀河災厄10隻；印記10枚、最大Lv.10；owner `markcore.js`。銀河10稱號：灰潮餘燼、蝕日王冠、星骸殘響、黑域孤星、天環墜落、寂滅遠航、萬域寂滅、黑核權柄、無聲王權、萬星終寂。

宇宙災厄 owner：`secondworldcalamity.js`、`secondworldcalamityrun.js`。10隻、等級550～1000、每隻30 true kills；第1隻HP100萬、每階+20萬，ATK×1.10、DEF×1.05、暴10%、閃10%。未完成殘血 persistent；完成後 replay 每場滿血、不加 trueKills、不顯示連續重打。狀態以穩定 `calamityId` ID-first 對齊。

玩家正式稱號共26個，canonical catalog：`playertitlecore.js`。順序：銀河10 → 宇宙10 → 鏡像6。Universe Renderer V1、Base V2、Mirror V3；Mirror V1/V2 dead CSS 已退休。稱號 state 只有 `state.titles`。

---

# 8. 副本

正式模式：懸賞、競技、鏡像、虛空，另有文明災厄。

- Arena 正式 state：`arenaByWorld`；legacy `dungeon.arena` 僅相容。
- 宇宙競技 Arena By World V2、Unlock V2、Rank Curve V2。
- 懸賞 V2 統一公式；掉裝 VIP 共用 `viplootcore.js`。
- 鏡像15～20勝稱號完成。
- 銀河／宇宙地圖戰、災厄戰、戰線紀錄回顧完成；同一 session 切回顧後不會被強制跳回預設。

## 8.1 虛空幻境 V2

owner：`dungeonvoid.js`。解鎖Lv25；起始 `max(1,highestCleared-100)`。

```text
HP  = ceil(100 + 9.6F)
ATK = ceil(10 + 1.3F)
DEF = ceil(5 + 0.6F)
Crit=10%
Dodge=8%
```

普通1特性、每10樓Boss 2不同特性；Boss無隱藏倍率；每層補滿HP；run用玩家 snapshot；文明倍率走正式 owner。`equivalentPower()` 已退休。>10000既有紀錄不 migration／不重置。使用者目前接受 V2，等實玩至Lv1000再決定是否重開平衡。

---

# 9. 特殊遭遇／Story／UI

特殊遭遇正式流程：`提示 → 補滿玩家HP → 特殊戰鬥`。宇宙 Boss 可觸發；銀河 Boss 排除；宇宙剛出現新災厄時該次特殊遭遇跳過。

銀河＋宇宙 Story data 已存在，Story Integrity 持續檢查；雙紀元介面語意總掃描完成。第三紀元尚無正式 story code／content。

宇宙冒險：頂部通用背包已移除，只在最新／目前 Boss 卡顯示背包；首頁進宇宙冒險、戰鬥結果關閉、從目前Boss背包返回時 one-shot 自動定位最新Boss。

`inventoryfocus.js` V3：進背包一次性優先「遺失裝備 → 實際較強裝備 → 頂端」；贖回後「仍有遺失→遺失區；否則有升級→一鍵裝備；否則不移動」。共用 `isActualGearUpgrade()`，不 monkey-patch navigation。

---

# 10. GM／戰力基準／主線鎖血

GM測試／預覽不得污染正式 save。GM Hub 外層預設收合；地圖怪×100子區塊預設收合；冗餘虛空完整重置按鈕已退休。

GM測試角色支援銀河／宇宙：紀元、等級、裝備、強化、8專精、10印記、文明、VIP。`gmTestPlayerStats()` 走正式 `playerCombatStats(equipment,testVip())`。VIP8／14／16／18 是掉裝特權，戰力基準不模擬完整 loot settlement；GM指定產生裝備不受VIP隨機掉裝干涉。

## 10.1 GM 管理順序

目前管理頁重要順序：**背景戰鬥 → 主線鎖血 → 戰鬥速度**，其後才接一般管理與其他 GM 區塊。GM 管理預設不自行開啟。

## 10.2 GM 主線鎖血（正式）

正式設定 owner：`gmbackground.js`；正式 gate：`gmMainlineHpLockActive(scope)`。

- localStorage key：`civilization_frontline_gm_mainline_hp_lock_v1_<userId>`。
- 只保存在目前裝置、依登入帳號隔離；沒有登入時 fail-closed。
- 不寫角色 save、Cloud Save、GM JSON 匯出；Save schema 維持15，不需 migration。
- 只作用於：銀河正式主線、宇宙正式主線、正式主線 context 內的特殊怪。
- 不作用於：懸賞、競技、鏡像、虛空、銀河災厄、宇宙文明災厄、回顧戰、GM benchmark／測試／sandbox。
- `combatcore.js` 仍保留真實承傷事件與護盾、不屈、反噬、反擊等正式機制；鎖血後每次敵方攻擊結算完再把玩家 HP 正規化回最大值。
- 非滿血進場且鎖血開啟時，正式 `playerStartHp` 直接正規化為最大 HP。
- `combatfx.js` 是呈現 owner：血條／數字保持滿血，但 `actualDamage` 仍保留真實戰鬥事件語意；不得再由 GM 模組 monkey-patch presentation 或把 `actualDamage` 改成0。
- 背景戰鬥與主線鎖血共用 `GM_DEVICE_BOOLEAN_PREFERENCE_VERSION = 1` 的 device boolean preference helper，但 storage prefix 分離。
- 專用 `tests/runtime/gm-mainline-hp-lock-integrity.js` 已納入 Runtime Integrity。

---

# 11. 技術整理／Integrity／素材

- `integritycontract.js`：canonical Integrity Contract。
- `runtimeintegrity.js`／`finalintegrity.js` 共用正式 contract；舊 addon 退休。
- `saveversionguard.js` V1，Local／Cloud／JSON fail-closed。
- `compatibilityowners.js` V1 管理 legacy owner、after-save hook、Script Load Policy V1。
- Cloud Save V3 只註冊 `cloud-local-meta` hook，不 monkey-patch `save()`。
- `backgroundpreload.js` Policy V3：首畫面 critical、4.5s timeout、其餘 idle＋2併發 preload。
- `assets/backgrounds-source/` 為原稿；`assets/backgrounds/` 為 runtime WebP；`tests/runtime/asset-integrity.js` 驗證素材政策。
- Runtime Integrity 已包含 VIP 無上限與 GM 主線鎖血專用測試。

功能基準 `93287fd1f305b96037ab5f658e5b0ff3c2ca6254`：Runtime Integrity #416 success、Story Integrity #583 success。後續若 `main` 再出現新 commit，必須重新 compare；不得只靠本檔 SHA 判定 current 狀態。

已知 CI 小缺口：`.github/workflows/runtime-integrity.yml` path filter 仍未單列 `backgrounds.css`；不要偷偷修，除非使用者授權。

---

# 12. Cloud Save

Cloud Save 使用 Supabase；下載走正式版本檢查＋migration，並重設 offline 計時起點。真實跨裝置驗證已取消，不得自動列回 pending。

---

# 13. 第三紀元「高維紀元」最新設計基準（尚未實作）

> 本節是 2026-09-26 已確認的設計規格，不是現行 runtime。**禁止自行推導未決定的名稱、掉率、劇情、UI、state、save schema 或 owner。** 正式實作前必須重新讀 current main。

## 13.1 定位／入場／世界切換

- 名稱：**高維紀元**。
- 銀河約500敵人 → 宇宙100 Boss → 高維10隻高維存在。
- 入場：Lv1000、宇宙主線完成、+40×5、文明Lv10、最低VIP20、專精8×60、印記10×10。
- VIP20只代表特殊特權畢業；VIP等級仍無上限，VIP21+基礎能力繼續成長。
- 進入第三紀元後，第一／第二紀元不能回正式進度；主線與災厄轉回顧戰。
- 第三紀元仍保留等級與裝備成長。

## 13.2 十王／持久HP／5pp限制

- 10隻王，非固定順序，玩家可自由選擇合法目標。
- **每隻最大HP固定11億；10隻總HP固定110億。任何個體特化都不得改HP。**
- 正式削血永久保存；死亡／重整不回滿。
- 王死亡後HP=0，移入回顧戰；回顧戰採最終型態、無正式收益。
- 5pp戰線限制：若目標王比目前存活王最高剩餘HP低達5pp，下一場不可開。100%對95.1%可打，95.0%鎖。
- 開戰前合法但本場跨線：本場完整結算、不回滾；戰後停止。
- 只剩最後一王時解除5pp限制。

## 13.3 連戰100死／逐場落帳

- 同一王可連戰到玩家累積死亡100次，除非其他停止條件先發生。
- 循環：開戰 → 玩家死亡 → 單場正式結算 → 自動恢復 → 下一場。
- 王先死則立即停止；該場不增加玩家死亡次數。
- 提前停止：王死亡、5pp鎖、跨王強化階段、跨稱號／劇情門檻、玩家手動停止、重整／離頁。
- 每一場都必須正式寫入王HP、EXP、資源、裝備；不能等整輪100死才一次結算。
- 重整後已完成場次不能遺失；新的連戰死亡計數從0開始。

## 13.4 高維壓制＋高維核心

第三紀元死亡：不掉裝、不扣EXP、不扣高維資源、不回補歷史王血。

原始高維壓制：每死亡1次，本輪最大HP上限降低0.50pp；100死後剩50%。本輪停止後壓制清除。

高維核心：Lv0→10、每級10億高維資源、總100億，玩家手動升級；連戰中不自動升。

**核心正式效果已確定：每升1級，使每次死亡的高維壓制減少0.04pp。**

```text
每死一次壓制 = 0.50pp - 核心Lv × 0.04pp
Lv0  = -0.50pp / 死，100死後50%
Lv5  = -0.30pp / 死，100死後70%
Lv10 = -0.10pp / 死，100死後90%
```

核心不直接增加HP／ATK／DEF／暴擊／閃避，也不另加最終傷害；定位是「適應高維環境、對抗高維壓制」。正式名稱與所在UI仍未定。

## 13.5 等級／EXP／高維資源

- Lv1000→Lv2000，共1000級。
- 每級固定1000萬EXP；升滿共100億EXP。
- 第三紀元只新增1種高維資源，正式名稱未定。
- **1點真正永久削掉的王血 = 1 EXP = 1 高維資源。**
- 十王總HP110億；約100億淨削血時角色Lv2000且核心可升滿，最後約10億為滿級收尾。

## 13.6 裝備

- 第三紀元裝備能力算法沿用第一、第二紀元同一套主屬性／詞條公式，自然延伸到Lv2000。
- 品質只保留傳說、神話；正式掉率／比例未定。
- 強化+40為完成態，不開+41～+60。
- 每完成一場正式戰鬥做一次掉裝判定；不按削血量縮放。
- 連戰途中不能換裝；停止／結算後才能更換。
- 賣裝不給金幣、暗物質、高維資源或其他貨幣，只作清理。

第二紀元畢業、第三紀元入場用平衡基準：約 HP49,335／ATK13,019／DEF6,067／暴35%／閃25%，另有文明Lv10最終傷害×1.50、專精8×60、印記10×10。

按現行裝備／角色公式自然延伸時，約每100級：HP+4,910、ATK+1,298、DEF+605；Lv2000約 HP98,439／ATK25,999／DEF12,115（設計估算，runtime尚未延伸到2000）。

## 13.7 高維王100%共同基準與初始能力

所有王100% HP的共同基準：

```text
HP    = 1,100,000,000（固定）
ATK   = 8,000
DEF   = 8,000
Crit  = 10%
Dodge = 10%
```

所有王從100%起固定擁有5種既有滿級戰鬥能力；UI只顯示能力名稱，不顯示「專精」字樣：

- 先制：第一擊+60%。
- 連擊：30%，追加50%傷害，可再次連擊。
- 穿透：30%，忽略25% DEF。
- 反擊：30%，造成40%傷害。
- 汲取：30%，回復本次實際傷害10%。

第三紀元王**不使用第一、第二紀元怪物 trait pool／隨機怪物特性**。

## 13.8 王90%→10%九次固定強化

每隻王首次跨入90%、80%、70%……10%時共強化9次。每次固定：

- ATK +600
- DEF +1200
- 暴擊 +2pp
- 閃避 +2pp

共同四圍：

```text
100%  ATK  8000 / DEF  8000 / Crit10 / Dodge10
 90%  ATK  8600 / DEF  9200 / Crit12 / Dodge12
 80%  ATK  9200 / DEF 10400 / Crit14 / Dodge14
 70%  ATK  9800 / DEF 11600 / Crit16 / Dodge16
 60%  ATK 10400 / DEF 12800 / Crit18 / Dodge18
 50%  ATK 11000 / DEF 14000 / Crit20 / Dodge20
 40%  ATK 11600 / DEF 15200 / Crit22 / Dodge22
 30%  ATK 12200 / DEF 16400 / Crit24 / Dodge24
 20%  ATK 12800 / DEF 17600 / Crit26 / Dodge26
 10%  ATK 13400 / DEF 18800 / Crit28 / Dodge28
```

90%與80%只做數值強化。70%開始依序加入7個**既有滿級印記能力**，不另做Boss版能力：

- 70%：鎮心（玩家最終暴擊率 -5pp）
- 60%：壓制（玩家最終閃避率 -5pp）
- 50%：韌性（玩家暴擊額外傷害部分降低30%）
- 40%：復仇（玩家暴擊後50%機率使王下一次成功命中必暴）
- 30%：反噬（15%機率反射本次實際HP損失30%）
- 20%：無視（每次攻擊5%機率完全無視玩家DEF）
- 10%：戰意（75%開場啟動；每回合ATK+2%，最多10層＝+20%）

不屈、護界、吸收不給高維王；不修改其原印記效果，也不建立第二套版本。

跨新階段的那一場先完整結算，戰後才停止並提示；階段一旦解鎖永久有效，不因汲取回血倒退。若同場直接打死王，死亡優先，不再顯示強化提示。

10%時王共有12種能力：初始5種＋後7種。

## 13.9 十王個體特化（名稱尚未定）

10隻王仍各11億HP，不附帶負面補償；只在共同基準上各自固定一項特化：

1. 高攻型：ATK ×1.15。
2. 高防型：DEF ×1.15。
3. 高暴型：暴擊 +6pp。
4. 高閃型：閃避 +6pp。
5. 連擊型：連擊率30%→40%。
6. 穿透型：穿透率30%→40%。
7. 反擊型：反擊率30%→40%。
8. 汲取型：汲取率30%→40%。
9. 先制型：第一擊+60%→+80%。
10. 均衡型：ATK ×1.08、DEF ×1.08。

倍率／加成在所有強化階段持續套用。現階段數值檢查未發現Lv1000入場玩家「一開始就打不了」或後期王「完全打不動玩家」的結構性問題；真正需實測的是汲取型與反擊型的體感。

## 13.10 汲取與淨削血結算

因王會汲取回血，第三紀元**不得把戰鬥中的累積傷害直接當EXP／資源**。

正式概念：

```text
本場有效削血 = max(0, 場初正式王HP - 場末正式王HP)
EXP = 本場有效削血
高維資源 = 本場有效削血
```

- 王本場所有回血的上限＝本場開始時的正式HP。
- 王不能靠汲取補回前幾場已經永久削掉的歷史HP。
- 任何未來王回血能力都遵守「只能回本場損失，不能回歷史損失」。

## 13.11 共通能力UI

- 冒險介面固定提供一份「高維存在共通能力」說明，不為10隻王重複建立。
- 說明列出初始5能力與70%→10%的7能力、各門檻與正式效果。
- 戰鬥節奏快，戰鬥畫面不要求點擊能力看tooltip；戰鬥框只顯示目前已啟用的短名稱。
- 名稱只顯示「先制／連擊／穿透／反擊／汲取／鎮心……」，不顯示「專精／印記」分類字樣。

## 13.12 稱號／劇情＝十王總血量進度

十王各100%，總剩餘視為1000%。

- 900% → 第1稱號＋第1劇情
- 800% → 第2
- 700% → 第3
- ……
- 100% → 第9
- 0% → 第10稱號＋最終劇情

判定使用 `總剩餘HP% <= 門檻 且尚未取得/觸發`。每下降100%總血量約11億淨削血；第9階約99億，第10階110億。

同場多事件：先完成本場正式結算；稱號／劇情優先於王強化提示；王死亡優先於強化提示。

## 13.13 離線／副本／回顧

- 第三紀元離線不給EXP、不給高維資源、不削王血、不推稱號／劇情／核心；只做裝備掉落結算，沿用約10%離線哲學。
- 不做第三紀元版懸賞、競技場、文明災厄。
- 鏡像保留；虛空保留，但不產高維EXP／資源。
- VIP積分仍有無上限VIP的跨紀元長期成長用途；不轉換成高維資源。
- 十王全滅後，回顧戰、虛空、鏡像、裝備蒐集可繼續。

## 13.14 單場結算／測試重點

概念順序：

1. 本場完整打完。
2. 以場初HP作王回血上限，得到場末HP。
3. 寫入王最新正式HP。
4. 以場初－場末計算淨削血。
5. 發同量EXP與高維資源。
6. 裝備掉落判定。
7. 角色升級。
8. 總血量稱號／劇情門檻。
9. 王死亡判定；死亡則進回顧。
10. 未死亡才判強化階段；跨階則永久解鎖、停止＋提示。
11. 判5pp戰線限制。
12. 皆未觸發且死亡數<100則依高維核心計算下一場HP上限並續戰。

正式實作時不得複製第二套 settlement pipeline，要映射 current main 的 canonical owner。

Integrity至少要鎖：5pp邊界、九階四圍、七種能力解鎖與永久性、事件優先順序、汲取淨削血、高維核心壓制公式、100死重置、離線／回顧無正式收益、第三紀元不接舊trait pool、連擊／反擊不得形成無限遞迴。

## 13.15 目前尚未定案

以下舊 pending 已完成，**不要再列回待定**：十王個體能力方向、九次強化門檻與四圍倍率、高維裝備能力公式、高維核心每級效果。

仍未定案：

- 10隻高維存在正式名稱與美術定位。
- 高維資源正式名稱。
- 高維核心正式名稱與所在UI。
- 傳說／神話正式掉率與比例。
- 10個高維稱號名稱／視覺。
- 10段劇情內容。
- 十王全滅後最終事件／畫面／完成旗標。
- 第三紀元GM與正式UI細節。
- save schema、migration、正式 owners、script load order。

---

# 14. 目前真正 Pending

1. 使用者親自從頭完整玩一次銀河紀元＋宇宙紀元；只處理真實遇到的 bug、流程、UI、平衡、文案。
2. 第三紀元繼續完成 13.15 尚未定案項目；目前仍未進入程式實作。

近期接受／暫緩：虛空V2先不調；>10000紀錄不migration；GM戰力基準不加VIP Loot模擬；VIP2宇宙不另造新效果。

已取消、不得自行復活：Arena V2額外500場驗收、宇宙`.015`中後期再驗證、Cloud Save真實跨裝置驗證。

---

# 15. 下一個 ChatGPT／維護者操作規範

1. **先讀 current `main`，不要只靠本檔或記憶。**
2. 修改前讀相關正式 owner、直接相依、Integrity／workflow、`index.html`。
3. 使用者說「先討論／先檢查／先列出／先不要修改」時，**不能修改**。
4. 使用者說「做／修改／執行／第N批」時，可直接修改 GitHub `main`。
5. **優先修改正式來源／canonical owner；不要額外做 wrapper、fallback、第二套公式、第二套 state、第二套 pipeline。** 只有正式 legacy compatibility contract 才保留相容投影。
6. JS／CSS 改動要更新 `index.html` cache-bust；純文件不需要。
7. 修改後重新讀 actual main，做 base→head compare，確認沒有誤動無關檔案。
8. 不要刪舊 migration，除非先正式改最低支援 save policy。
9. 不要建立第二套稱號 state、文明倍率、VIP progression／VIP Loot、Offline normalization、Arena progress owner。
10. 不要復活 `level100balance.js`、Mirror V1/V2 CSS、`runtimeintegrityaddon.js`、Void `equivalentPower()` 或舊速度等待。
11. 不要把 GM 主線鎖血寫入角色save／cloud／GM JSON，也不要重新把 presentation monkey-patch 放回 `gmbackground.js`。
12. 完成前等最新 main HEAD Runtime Integrity 成功；若改 Story code/content 或 `index.html`，再確認 exact-head Story Integrity。
13. 若改背景／素材，Asset Integrity 必須通過。
14. 第三紀元設計已存在但尚未實作；**禁止自行推導第三紀元未定規則，也不得擅自建立 save／state／migration／owner。**
15. 實玩期間優先修真 bug／UI／流程／平衡，不要只為程式碼漂亮重寫穩定系統。

---

# 16. 文件角色

- `README.md`：對外簡介與目前版本總覽。
- `PROJECT_HANDOFF.md`：跨工作階段承接摘要；第三紀元最新設計基準也記在本檔第13節。
- `PROJECT_PENDING_STATUS.md`：真正尚未完成／已取消事項。
- `PROJECT_VIP_UNBOUNDED_UPDATE.md`：VIP 無上限改版與 owner／舊資料收斂的詳細紀錄。
- `GM_UI_GUIDE.md`：GM 介面語意／配色與目前管理區塊規範。
- `assets/README.md`：背景素材政策。
- `LEVEL100_EXPANSION.md`：歷史文件，不是 current 規格。

再次強調：**任何現行實作衝突一律以 current GitHub `main` 實際程式碼為準；第三紀元尚未實作的部分，以本 handoff 最新已確認設計為準。**

---

# 17. 下一個對話如何接手（標準指令）

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查目前 GitHub `main` 的實際程式碼與相關正式 owner／相依／Integrity／`index.html`，完整承接《文明戰線》專案。  
> 以 `main` 為唯一真實來源；若 handoff、舊對話、設計稿或記憶與 `main` 衝突，以 `main` 為準。  
> VIP 已無上限，VIP20僅為特殊特權畢業；GM主線鎖血已正式完成並有獨立local device preference／scope gate。  
> 第三紀元「高維紀元」目前仍未實作，但第13節所列十王基準、九次強化、個體特化、高維核心與淨削血規則已確認；禁止自行推導仍未定項目。  
> 現在先不要修改，先告訴我你已承接完成，以及目前真正 pending、第三紀元尚未定案項目、最近需要注意的風險。