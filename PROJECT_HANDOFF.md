# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-25（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要，不是第二套規格；若 handoff、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。

最近一次確認的**遊戲功能程式碼基準 HEAD**為 `cf2d03a24866dc580024e8d7903c448a9ffb78a9`。  
`main` 後續可能包含純文件 commit；承接時不得只靠本檔記錄的 SHA 推定 current main，必須重新讀取 actual `main` 並以 compare 確認是否有遊戲功能變更。截至本次文件整理前，`cf2d03...` 之後既有變更僅涉及交接文件，未修改遊戲功能；本次亦只更新文件。

---

# 1. 專案定位

《文明戰線》是純前端、文字／數值養成、科幻星際 RPG，支援桌機與手機；iPhone Safari 是重要實機環境。

目前正式已實作兩個紀元：

- **銀河紀元**：Lv.1～500，10 區、100 地圖，普通／菁英／Boss。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss。
- **第三紀元「高維紀元」**：已進入完整設計討論，但尚未實作到 `main`。

現行正式世界永久狀態仍以 `secondWorld.entered` 為準；第三紀元尚未建立任何正式 state／save schema／owner。

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

第三紀元雖已設計 Lv.1000→2000 草案，但現行程式仍只到1000，未實作前不得自行改 cap。

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

---

# 5. VIP／專精／文明等級

VIP 最大20；門檻 `1000*level²`。每級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25pp、閃避 +0.25pp。角色能力共用正式 `playerCombatStats(...)`。

VIP特殊：VIP2銀河主線掉裝+5pp；VIP4／12副本積分倍率；VIP6特殊遭遇+2pp；VIP10特殊獎勵10%再發動；VIP20死亡裝備保護。

## 5.1 VIP Loot Core V2

正式 owner：`viplootcore.js`，`VIP_LOOT_CORE_VERSION = 2`。

- VIP8：15% 優先最弱裝備部位。
- VIP14：5% 品質 +1。
- VIP16：Boss 15% 額外 1 件。
- VIP18：Boss 10% 品質 +1。
- VIP14＋18可獨立疊加，最高品質5。

`resolveVipLootModifiers(...)` 統一 VIP8／14／18；`vipLootBossExtraDropTriggered(...)` 統一 VIP16。銀河主線、銀河／宇宙懸賞、宇宙主線共用 owner；懸賞不是 Boss，因此不套16／18。宇宙主線每件裝備獨立跑 modifier。此改動無 save 欄位，不需 migration。

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

銀河＋宇宙 Story data 已存在，Story Integrity 持續檢查；雙紀元介面語意總掃描完成。第三紀元目前只有設計門檻，尚無正式 story code／content。

宇宙冒險：頂部通用背包已移除，只在最新／目前 Boss 卡顯示背包；首頁進宇宙冒險、戰鬥結果關閉、從目前Boss背包返回時 one-shot 自動定位最新Boss。

`inventoryfocus.js` V3：進背包一次性優先「遺失裝備 → 實際較強裝備 → 頂端」；贖回後「仍有遺失→遺失區；否則有升級→一鍵裝備；否則不移動」。共用 `isActualGearUpgrade()`，不 monkey-patch navigation。

---

# 10. GM／戰力基準

GM測試／預覽不得污染正式 save。GM Hub 外層預設收合；地圖怪×100子區塊預設收合；冗餘虛空完整重置按鈕已退休。

GM測試角色支援銀河／宇宙：紀元、等級、裝備、強化、8專精、10印記、文明、VIP。`gmTestPlayerStats()` 走正式 `playerCombatStats(equipment,testVip())`。VIP8／14／16／18 是掉裝特權，戰力基準不模擬完整 loot settlement；GM指定產生裝備不受VIP隨機掉裝干涉。

---

# 11. 技術整理／Integrity／素材

- `integritycontract.js`：canonical Integrity Contract。
- `runtimeintegrity.js` V19、`finalintegrity.js` V19；舊 addon 退休。
- `saveversionguard.js` V1，Local／Cloud／JSON fail-closed。
- `compatibilityowners.js` V1 管理 legacy owner、after-save hook、Script Load Policy V1。
- Cloud Save V3 只註冊 `cloud-local-meta` hook，不 monkey-patch `save()`。
- `backgroundpreload.js` Policy V3：首畫面 critical、4.5s timeout、其餘 idle＋2併發 preload。
- `assets/backgrounds-source/` 為原稿；`assets/backgrounds/` 為 runtime WebP；`tests/runtime/asset-integrity.js` 驗證素材政策。
- `tests/runtime/js-integrity.js` 已包含背包定位V3與VIP Loot V2 deterministic behavior tests，以及 `equipmentRewards[]` owner audit。

最近一次確認的遊戲功能程式碼基準 `cf2d03a24866dc580024e8d7903c448a9ffb78a9`：Runtime Integrity #360 success、Story Integrity #574 success。後續若 `main` 再出現新 commit，必須重新 compare；不得因 handoff 內的 SHA 未更新就直接判斷功能有變或沒變。

已知 CI 小缺口：`.github/workflows/runtime-integrity.yml` path filter 仍未單列 `backgrounds.css`；不要偷偷修，除非使用者授權。

---

# 12. Cloud Save

Cloud Save 使用 Supabase；下載走正式版本檢查＋migration，並重設 offline 計時起點。真實跨裝置驗證已取消，不得自動列回 pending。

---

# 13. 第三紀元「高維紀元」完整設計草案（尚未實作）

> 本節是本次對話已確認的設計基準，不是現行 runtime。**禁止自行推導第三紀元**未決定的能力、名稱、公式、state、save schema 或 UI；正式實作前必須重新讀 current main。

## 13.1 定位／入場／世界切換

- 名稱：**高維紀元**。
- 收斂方向：銀河約500敵人 → 宇宙100 Boss → 高維10隻高維存在。
- 預想入場：Lv1000、宇宙主線完成、+40×5、文明Lv10、VIP20；專精8×60、印記10×10原則上維持完成態。
- 進入第三紀元後，第一／第二紀元不能回正式進度；主線與災厄都轉成回顧戰。
- 第三紀元仍保留等級與裝備。

## 13.2 十王／持久HP／5%限制

- 10隻王，非固定順序，玩家可自選。
- 每隻有不同能力；正式名稱、能力細節未定。
- 每隻最大HP暫定**11億**，10隻總HP **110億**。
- 正式削血永久保存；死亡／重整不回滿。
- 王死亡後HP=0，移入回顧戰；回顧戰採最終型態、無正式收益。
- 王剩餘HP越低能力越強，但最大HP不重設、不膨脹。
- 王跨新強化階段：本場先結算 → 強制停止 → 跳強化視窗；若直接打死則死亡優先，不跳強化。

5%戰線限制：比較存活王剩餘HP%。若目標王比目前最高剩餘HP王低達**5pp**，下一場不可開。最高100%時，95.1%可打、95.0%鎖。若開戰前合法但本場打完跨線，本場完整結算、不回滾，戰後停止。只剩最後一王時自然解除。

## 13.3 連戰100死／逐場落帳

「100場」精確定義為：沒有其他中斷條件時，玩家可對同一王連戰到**玩家死亡100次**。

循環：開戰 → 玩家死亡 → 單場正式結算 → 自動恢復 → 同王下一場。若王先死，該場不增加死亡次數，連戰直接停止。

提前停止：王死亡、5%鎖、王跨強化階段、稱號／劇情門檻、玩家手動停止、重整／離頁。

每一場都必須正式寫入王HP、EXP、資源、裝備；不能等整輪100死後才結算。重整後已完成場次不能遺失；重進新的死亡計數從0開始。

## 13.4 死亡處罰＝高維壓制

- VIP20已防掉裝，因此第三紀元死亡不掉裝。
- 不扣EXP、不扣高維資源、不回補王血。
- 每死亡1次，本輪最大HP上限降低**0.5個百分點**，線性、不複利。
- 0死100%、10死95%、20死90%、50死75%、100死50%。
- 連戰中升級後正式最大HP正常增加，但壓制比例不清除。
- 概念：`本輪實際最大HP = 最新正式最大HP × (1 - deaths×0.005)`。
- 本輪停止後壓制清除；下一輪重新100%。

## 13.5 等級／EXP／高維資源／核心

- Lv1000→Lv2000，共1000級。
- 每級固定**1000萬EXP**；升滿共**100億EXP**。
- **1點有效王血傷害 = 1 EXP**。
- 第三紀元只新增1種高維資源，名稱未定；**1點有效王血傷害 = 1高維資源**。
- 只新增1個高維核心／高維能力；Lv0→10，每級**10億資源**，總100億；不做Lv11。
- 高維核心由專屬介面**手動升級**；連戰中即使資源足夠也不自動升。
- 核心名稱／每級效果未定。

因此：十王總HP110億；約100億削血時角色Lv2000＋核心Lv10；最後約10億是滿級後終局收尾。

## 13.6 稱號／劇情＝總血量進度

十王各100%，總剩餘視為1000%。

- 900% → 第1稱號＋第1劇情
- 800% → 第2
- 700% → 第3
- ……
- 100% → 第9
- 0% → 第10稱號＋最終劇情

判定使用 `總剩餘HP% <= 門檻 且尚未取得/觸發`。每下降100%總血量約等於11億總傷害；第9階約99億，第10階110億。

稱號名稱／視覺與10段劇情內容未定。

同場多事件原則：先完成本場正式結算；稱號／劇情沿用前兩紀元敘事優先；王死亡優先於強化階段提示。

## 13.7 裝備／出售／VIP

- 高維裝備只保留**傳說、神話**；正式掉率與數值公式未定。
- 每完成一場正式戰鬥做一次掉裝判定。
- 不把掉率綁削血；故意脫裝快速死刷裝視為可接受的低效率農法，因正式削血／EXP／資源會很慢。
- 連戰途中不能換裝；停止／結算後才能換。
- 賣裝**不給任何資源**，只清掉裝備／騰空間；不給金幣、暗物質、高維資源。
- VIP20為完成態，不開21+。
- 既有VIP特權能自然套用者繼續生效；沒效果的就自然失效，不補償、不轉換。

舊成長系統完成態：+40封頂、專精60、印記10、文明10、VIP20；第三紀元只新增單一高維核心。

## 13.8 離線／副本／回顧

第三紀元離線不給EXP、不給高維資源、不削王血、不推稱號／劇情／核心；只做**裝備掉落結算**，沿用約10%離線哲學。離線樣本只需平均單場耗時＋裝備掉落判定效率。

不做第三紀元版懸賞、競技場、文明災厄。鏡像保留；虛空既有無限挑戰保留，但不產高維EXP／資源。VIP20後VIP積分沒實際用途可接受，不轉高維資源。

十王全滅後，回顧戰、虛空、鏡像、裝備蒐集等都可繼續。

## 13.9 十王全滅／完成態

尚未完全定案。目前偏向：十王全滅 → 第10稱號＋最終劇情／事件／畫面 → 完成後才標記第三紀元完成。

## 13.10 單場結算順序草案

1. 本場完整打完。
2. 寫入王最新HP。
3. 依實際削血發EXP與高維資源。
4. 裝備掉落判定。
5. 角色升級。
6. 稱號／劇情門檻。
7. 王死亡判定；死亡則進回顧流程。
8. 未死亡才判王是否跨強化階段；跨階則停止＋提示。
9. 判5%戰線限制。
10. 皆未觸發且死亡數<100則進下一場。

實作時不得直接複製出第二套 settlement pipeline；要映射到 current main 的正式 owner。

## 13.11 測試分工

GM適合控制：王HP%、死亡／存活、玩家等級、高維資源、高維核心、必要測試角色狀態。

自動測試／Integrity要鎖：5%邊界、跨線後本場結算／下一場停止、跨強化階段停止、多事件順序、王死亡優先、100死重進重置、高維壓制0.5pp且升級不清除、離線不產高維正式進度、回顧戰無收益。

人工驗收：100死體感、高維壓制體感、強化跳窗頻率、5%輪流攻略效果、掉裝量、後期王強度。

## 13.12 尚未定案

- 10王名稱與各自能力。
- 強化階段數／門檻／倍率。
- 高維裝備公式、傳說／神話掉率。
- 高維資源名稱。
- 高維核心名稱與每級效果。
- 10個稱號名稱／視覺。
- 10段劇情內容。
- 十王全滅後最終事件／畫面／完成旗標。
- 第三紀元 GM／正式UI細節。
- save schema、migration、正式 owners、script load order。

---

# 14. 目前真正 Pending

**使用者親自從頭完整玩一次銀河紀元＋宇宙紀元**仍是現行已實作內容的主要實機驗收方向；實玩期間只處理真正遇到的 bug、流程、手機／桌機UI、平衡、文案問題。

近期接受／暫緩：虛空V2先不調；>10000紀錄不migration；GM戰力基準不加VIP Loot模擬；VIP2宇宙不另造新效果。

已取消、不得自行復活：Arena V2額外500場驗收、宇宙`.015`中後期再驗證、Cloud Save真實跨裝置驗證。

第三紀元已重新開啟設計，不再是「等待使用者主動重開」；但仍完全未實作。下一步若繼續討論，優先完成13.12；若使用者明確說「做／修改／執行」，才進入main實作。

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
9. 不要建立第二套稱號 state、文明倍率、VIP Loot、Offline normalization、Arena progress owner。
10. 不要復活 `level100balance.js`、Mirror V1/V2 CSS、`runtimeintegrityaddon.js`、Void `equivalentPower()` 或舊速度等待。
11. 完成前等最新 main HEAD Runtime Integrity 成功；若改 Story code/content 或 `index.html`，再確認 exact-head Story Integrity。
12. 若改背景／素材，Asset Integrity 必須通過。
13. 第三紀元設計已存在但尚未實作；**禁止自行推導第三紀元**未定規則，也不得擅自建立 save／state／migration／owner。
14. 實玩期間優先修真 bug／UI／流程／平衡，不要只為程式碼漂亮重寫穩定系統。

---

# 16. 文件角色

- `README.md`：對外簡介與目前版本總覽。
- `PROJECT_HANDOFF.md`：跨工作階段承接摘要。
- `PROJECT_PENDING_STATUS.md`：真正尚未完成／已取消事項。
- `assets/README.md`：背景素材政策。
- `LEVEL100_EXPANSION.md`：歷史文件，不是 current 規格。

再次強調：**任何衝突一律以 current GitHub `main` 實際程式碼為準。**

---

# 17. 下一個對話如何接手（標準指令）

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查目前 GitHub `main` 的實際程式碼與相關正式 owner／相依／Integrity／`index.html`，完整承接《文明戰線》專案。  
> 以 `main` 為唯一真實來源；若 handoff、舊對話、設計稿或記憶與 `main` 衝突，以 `main` 為準。  
> 第三紀元「高維紀元」目前只有 handoff 中的設計草案，尚未實作；禁止自行推導未定內容，也不要自行把草案當成現行程式。  
> 現在先不要修改，先告訴我你已承接完成，以及目前真正 pending、第三紀元尚未定案項目、最近需要注意的風險。
