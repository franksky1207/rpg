# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-25（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要，不是第二套規格。若本檔、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。任何修改前必須重新讀正式 owner、直接相依、Integrity／workflow 與 `index.html` 載入順序。

本次 handoff 更新前的程式碼 HEAD：`cf2d03a24866dc580024e8d7903c448a9ffb78a9`。本次 handoff 更新本身只整理交接資料，不代表額外遊戲規則變更。

---

# 1. 專案定位

《文明戰線》為純前端、文字／數值養成、科幻星際 RPG，支援桌機與手機；iPhone Safari 是重要實機環境。

目前正式兩個紀元：

- **銀河紀元**：Lv.1～500，10 區、100 地圖，普通／菁英／Boss。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss；沒有銀河「每圖 5 怪」結構。
- 第三紀元尚未正式設計／實作；不得自行建立第三紀元 state、公式、資源、UI 或 migration。

世界永久狀態以 `secondWorld.entered` 為準，不建立第二套 `currentWorld` save。

---

# 2. 存檔／Migration／相容政策

正式 save key：`frank_text_rpg_save`。

目前版本：

- legacy `SAVE_VERSION = 13`：只供舊相容。
- 正式 `SAVE_SCHEMA_VERSION = 15`：schema owner 為 `savemigration.js`。
- `SAVE_LOAD_PIPELINE_VERSION = 2`。
- `SAVE_NORMALIZATION_PIPELINE_VERSION = 1`。
- `SAVE_LEGACY_SUPPORT_POLICY_VERSION = 1`。
- `SAVE_MIN_SUPPORTED_VERSION = 1`。
- `SAVE_LEGACY_SUPPORT_MODE = "all-known"`。
- `SAVE_FUTURE_VERSION_GUARD_VERSION = 1`。

政策：

- 已知 V1+ 舊正式 save 全部繼續支援 migration。
- 未來版本 save（高於目前 schema）必須 fail-closed；舊版網頁不得讀入再降版覆寫。
- Local Load、Cloud Download、GM JSON Import 共用正式版本保護。
- `migrateSave()` 本身也有 future-version 第二層防線。
- Save Write Guard V1 必須保留；local load 未 resolve 前不可用新 state 覆蓋正式本機 save。
- GM sandbox 不得寫正式 save。
- schema 15 會清理 GM transient 欄位。

正式 normalization 順序：

`worldPhase → worldProgress → level → gear → enhancement → vip → specialization → daily → dungeon → calamity → titles → offline → persistentFlags`

## 2.1 Offline state owner

`offlinestatecore.js` 是 Offline 存檔格式／normalization 單一 owner：

- `OFFLINE_STATE_NORMALIZATION_VERSION = 1`
- `OFFLINE_BATTLE_SAMPLE_VERSION = 3`
- 每速度最多 8 筆 sample。
- 負責 sample、farmMap／farmEnemy、avgBattleMs、sampleCount、clock 防護等資料正規化。

`offlineprogress.js` 只負責 runtime 離線收益／時間／sample 收集，不再維護第二套 Offline save normalization。

## 2.2 Legacy compatibility owner

`compatibilityowners.js` 明確管理歷史相容概念：

- 正式 Save schema owner：`savemigration`
- 正式 Level cap owner：`levelprogression`
- 正式 Arena state owner：`arenaByWorld`
- legacy `MAX_LEVEL = 500` 只作第一世界 fallback／相容用途；既有 consumer 已由 CI audit 鎖定，禁止繼續擴散。
- legacy `dungeon.arena` 只保留 read-through compatibility；正式資料是 `dungeon.arenaByWorld`。
- `level100balance.js` 已退休；通用 audit 改為 `levelprogressionaudit.js`。

---

# 3. 世界／主線／等級

## 3.1 銀河紀元

正式 owner：`data.js`、`worldmaps-*.js`、`engine.js`、`battlepipeline.js`。

10 區依序：
地球戰爭、太陽系戰爭、近星戰爭、星際邊疆、獵戶臂戰爭、銀河邊境、銀河中域、銀河核心外圍、銀河核心戰爭、銀河統合戰爭。

每區 10 地圖，每圖 5 級範圍、5 隻怪。

## 3.2 宇宙紀元

正式 owner：`secondworlddata.js`、`secondworldmainline.js`、`secondworldcombat.js`、`secondworldrewards.js`。

- 10 區／100 Boss；Boss 等級 505、510、…、1000。
- 區域：銀河彼端、本星系群戰爭、星群邊疆、群星會戰、超域邊境、萬域戰線、宇宙纖維帶、星海巨牆、宇宙深域、宇宙統合戰爭。
- 入場：Lv.500、銀河最終主線完成、8 專精全60、5部位+20、10印記全10；VIP不限。
- 進入宇宙會初始化 `secondWorld` 並切斷銀河離線殘留。

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

除非使用者主動重開平衡議題，不再把 `.015` 中後期驗證列為待辦。

## 3.3 world-aware 等級

正式 owner：`levelprogression.js`。

- `FIRST_WORLD_LEVEL_CAP = 500`
- `SECOND_WORLD_LEVEL_CAP = 1000`
- `ABSOLUTE_MAX_LEVEL = 1000`
- runtime 使用 `effectiveLevelCap()`。
- 宇宙 Lv.500～999：`ceil((25 + 4*L) * 250)`；Lv.1000：0。
- 銀河滿等 EXP 可 1:1 轉金幣；宇宙滿等不可誤轉金幣。

---

# 4. 宇宙資源／裝備／強化／死亡

- 宇宙正式資源：暗物質、暗能量。
- 宇宙主線基礎勝利獎勵：EXP、暗物質、每勝 +1 暗能量、固定 1 件 world2 裝備；不給銀河金幣／強化石。
- VIP16 可能額外再給第 2 件 Boss 裝備；正式結算以 `equipmentRewards[]` 保存所有裝備結果。
- `item / itemResult / sale / kept` 仍保留，但只作 `equipmentRewards[0]` 的 legacy compatibility projection；新的正式 consumer 不應再依賴單件欄位。
- world2 品質：優良45%、稀有35%、史詩15%、傳說4.5%、神話0.5%。
- 所有正式戰鬥死亡／戰敗不扣既有 EXP、不降級。
- 仍有 30% 機率遺失一件穿戴裝備；VIP20 完全防止。
- world2 贖回＝正式出售價×10 暗物質；world1 裝備若在宇宙遺失則免費贖回。
- world2 神話出售額外 +1 暗能量；鑑價只放大暗物質。
- 銀河強化正式 +0～+20；宇宙正式 +20～+40；GM sandbox 可 0～40。
- 每級主屬性 +2.5%，+40＝+100%。
- +21～+40 使用暗物質＋暗能量。

---

# 5. VIP／專精／文明等級

## 5.1 VIP 基礎規則

- VIP 最大20；門檻 `1000*level²`。
- 每 VIP 等級：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25pp、閃避 +0.25pp。
- 角色最終戰鬥能力共用正式 `playerCombatStats(...)`，銀河／宇宙都套用同一套 VIP 基礎能力。
- VIP2：銀河主線裝備掉落率 +5pp；宇宙主線本來固定掉裝，因此此效果在宇宙沒有額外作用，**這是刻意保留的新手期特權，不需另改。**
- VIP4／VIP12：副本 VIP 積分倍率由正式 VIP point owner 統一處理。
- VIP6：特殊遭遇機率 +2pp；兩紀元共用。
- VIP10：特殊獎勵 10% 再發動；兩紀元共用各自正式資源。
- VIP20：死亡裝備保護；兩紀元正式死亡流程都有效。

## 5.2 VIP Loot Core V2

正式 owner：`viplootcore.js`，`VIP_LOOT_CORE_VERSION = 2`。

共用規則：

- VIP8：15% 優先目前最弱裝備部位。
- VIP14：5% 品質 +1。
- VIP16：Boss 15% 額外掉 1 件裝備。
- VIP18：Boss 10% 品質 +1。
- VIP14 與 VIP18 是獨立判定，可同時成功合計 +2，但最高封頂神話品質 5。

正式 pipeline：

- `resolveVipLootModifiers(baseQuality,{boss,state,rng,...})` 一次統一處理 VIP8／14／18。
- `vipLootBossExtraDropTriggered(...)` 統一處理 VIP16。
- VIP8 最弱部位直接依指定 target state 的正式 `equipmentScore()` 計算；不再依賴漂移的舊函式名稱，亦可供 GM／模擬 state 注入 resolver。
- 銀河主線、銀河／宇宙懸賞、宇宙主線都必須共用此 owner；不得各自重寫機率或第二套判斷。
- 懸賞不是 Boss，因此只套 VIP8／14，不套 VIP16／18。
- 宇宙主線每件基礎／VIP16 額外裝備都各自重新跑 VIP8／14／18，不是複製第一件。
- 宇宙主線同一可注入 RNG 會傳進 VIP16 與每件裝備的 VIP modifier pipeline，方便 deterministic integrity 測試。
- 此次 VIP Loot 改動沒有新增 save 欄位，**不需要 Save Schema bump 或 migration，也不回溯重製舊裝備。**

## 5.3 專精／文明等級

- 8 專精最大60；兩紀元共用正式效果。
- 文明等級：`secondWorld.civilizationLevel` 0～10。
- 宇宙每級 final damage +5%，Lv.10 ×1.50；銀河 ×1.00。
- 正式倍率入口：`civilizationCombatDamageMultiplier(...)`；禁止各模式自己另造文明倍率。

---

# 6. 戰鬥節奏／背景戰鬥／離線

- 場內與場間正式基準皆 140ms；不要恢復舊 220/300/350/450ms。
- 舊 60/80ms 啟動等待已退休，不要復活。
- 玩家倍速以 1×／1.5× 為正式使用範圍；GM 可測 2×，同裝置持續。
- Background 單一 active flow，最長 12 小時，credit rate 0.96；主線／虛空／災厄等支援 fast catch-up。
- Offline 最短1分鐘、最多12小時；EXP10%；銀河金幣10%／宇宙暗物質10%；裝備掉落流程10%；銀河直接強化石期望5%／宇宙直接暗能量5%。
- world2 離線出售必須走正式 sale owner，不得製造特殊遭遇／首殺等非法副作用。

## 6.1 宇宙文明災厄背景連續戰鬥

`secondworldcalamityrun.js` 目前：

- `CONTINUOUS_VERSION = 2`
- `SECOND_WORLD_CALAMITY_BACKGROUND_VERSION = 1`
- `SECOND_WORLD_CALAMITY_FAST_CATCH_UP_POLICY_VERSION = 1`

正式行為：

- 連續戰鬥在 GM 背景戰鬥開啟時會加入共用 `backgroundProgress` flow。
- 背景回頁支援 fast catch-up；UI 端使用 structured duration、consume credit、throttled presentation／render／checkpoint。
- `pagehide` 若背景戰鬥啟用，保留 continuous flow；未啟用則停止。
- minimal mode 仍包正式 `runSecondWorldCalamityContinuous()`，所以自然共用背景能力，不另做第二套。

---

# 7. 文明災厄／印記／稱號

## 7.1 銀河災厄／印記

- 銀河災厄10隻；印記10枚、最大Lv.10；`markcore.js` 為 owner。
- 首次正式取得對應印記時同步取得銀河災厄稱號。
- 銀河10稱號：灰潮餘燼、蝕日王冠、星骸殘響、黑域孤星、天環墜落、寂滅遠航、萬域寂滅、黑核權柄、無聲王權、萬星終寂。

## 7.2 宇宙災厄

正式 owner：`secondworldcalamity.js`、`secondworldcalamityrun.js`。

- 10隻：彼岸黑潮、群星焚爐、邊星獵皇、萬軍葬艦、超域蝕核、無盡兵災、星脈噬巢、巨牆戰堡、深域吞星、終戰天穹。
- 等級 550、600、…、1000。
- 每隻30 true kills完成；完成一階 Civilization +1。
- HP：第1隻1,000,000；每階+200,000。ATK×1.10、DEF×1.05、暴10%、閃10%。
- 未完成殘血 persistent；完成後 replay 每場滿血、不再加 trueKills、不保存敗北殘血、不顯示連續重打。
- 章末 Boss 首殺先提示災厄「現身」，真正可挑戰仍需雙條件。
- state row 使用穩定 `calamityId`，normalizer 優先依 ID 對齊、舊檔才 fallback index。

## 7.3 玩家稱號＝26個

唯一 canonical catalog owner：`playertitlecore.js`。

順序固定：銀河災厄10 → 宇宙災厄10 → 鏡像15～20勝6。

宇宙10稱號：越界先驅、寰世銘者、荒境孤鋒、死線歸客、域外凌絕、萬軍獨行、寰宇織者、破界行者、幽域長明、萬界之巔。

鏡像稱號：

- 15 幸運眷顧
- 16 天選之刻
- 17 逆命者
- 18 傳說之日
- 19 距神一步
- 20 神蹟

稱號 state 永遠只有一套 `state.titles`，不建立 `secondWorld.titles`。

Renderer：

- Base Renderer V2
- Universe Renderer V1
- Mirror Renderer V3
- Mirror V3 是單一 active owner；V1／V2 dead CSS 已退休。
- GM 預覽使用同一 renderer，僅視覺預覽，不改 state／save。

舊資料補正仍保留：銀河依 marks、宇宙依 `trueKills>=1`（ID first/index fallback）、鏡像依 history.bestWins；補正本身不製造假通知。

---

# 8. 副本

正式模式：懸賞、競技、鏡像、虛空；另有文明災厄。

- 競技場已 world-aware，正式 state 為 `arenaByWorld`；legacy `dungeon.arena` 只作相容。
- 宇宙競技 Arena By World V2、Unlock V2、Rank Curve V2。
- 懸賞正式採 V2 統一難度／公式 owner；VIP8／14 掉裝特權由 `viplootcore.js` 共用，銀河／宇宙不分紀元。
- 鏡像 15～20 勝稱號系統已完成。
- 已完成銀河／宇宙地圖戰、災厄戰、戰線紀錄回顧；宇宙紀元為預設，但同一 session 內玩家切去回顧後不會被強制跳回預設，除非整理／重開頁面。

## 8.1 虛空幻境 V2

正式 owner：`dungeonvoid.js`。

解鎖 Lv.25；開場樓層仍為：

`max(1, highestCleared - 100)`

V2 純線性怪物公式：

```text
F = floor
HP  = ceil(100.0 + 9.6*F)
ATK = ceil(10.0  + 1.3*F)
DEF = ceil(5.0   + 0.6*F)
Crit = 10%
Dodge = 8%
```

- `getVoidMirageConfig().formulaVersion = 2`。
- 普通樓層 1 特性；每 10 樓 Boss 2 個不同特性。
- Boss 不另外乘隱藏 stat multiplier；差異只來自 Boss 特性等正式系統。
- 每層之間補滿 HP；run 內使用玩家 snapshot。
- 文明最終傷害倍率走正式 `civilizationCombatDamageMultiplier(...)`。
- 舊 `equivalentPower()` 已退休，不再作第二套難度公式。
- 既有玩家若 `highestCleared > 10000`，**不做 migration、不重置、不換算**；使用者會用既有 GM 管理自行處理。
- 使用者已用 Lv.583 左右宇宙角色實測 V2 約 F4200～4600，現階段接受；先繼續實玩到 Lv.1000，再由使用者主動決定是否重開平衡。

---

# 9. 特殊遭遇／Story／UI 語意

## 9.1 特殊遭遇

`specialencounter.js` 正式流程已整理為：

`提示特殊遭遇 → 補滿玩家 HP → 進入特殊戰鬥`

- 宇宙 Boss 可觸發特殊遭遇。
- 銀河 Boss 排除特殊遭遇。
- 銀河主線本來每戰後會補血，因此前置 full-heal 是 idempotent。
- 特殊遭遇結束仍有正式 settlement heal。
- 宇宙若剛觸發新文明災厄出現，該次特殊遭遇會依既有規則跳過。

## 9.2 Story／雙紀元語意

- 銀河＋宇宙 Story data 已正式存在，Story Integrity 持續檢查。
- 全介面＋遊戲說明雙紀元語意總掃描已完成，不再列 pending。
- 宇宙介面不得殘留銀河金幣／強化石／Lv.500／每圖5怪等錯誤語意。
- 第三紀元劇情或規則不得自行推導。

---

# 10. 冒險／背包 UI 行為

## 10.1 宇宙冒險目前 Boss 背包

- 宇宙冒險頁頂部不再放通用「背包」按鈕。
- **只有目前／最新進度 Boss 卡**顯示背包按鈕；舊 Boss 卡不顯示。
- 判定使用正式 `secondWorldHighestUnlockedBossIndex()`。
- 即使目前 Boss 暫時不可挑戰，該最新卡仍保留背包入口；全通關後保留最後 Boss 卡。
- 銀河冒險既有背包入口維持原行為。

## 10.2 宇宙冒險 one-shot 自動定位

正式 owner 由 `worldmapui.js`＋`playersemanticsui.js` 配合：

- 首頁 → 宇宙冒險：一次定位到目前／最新 Boss。
- 宇宙 Boss 戰鬥結果關閉：一次定位到新的目前／最新 Boss。
- 從宇宙目前 Boss 背包返回冒險：一次定位回目前／最新 Boss。
- 只在明確 navigation event request 時生效，不會在玩家正常瀏覽時持續搶 scroll。
- 目標使用 `data-second-world-boss` 與 `scrollIntoView({block:"center", inline:"nearest", behavior:"auto"})`。
- 銀河不受影響。

## 10.3 全背包智慧定位 V3

正式 owner：`inventoryfocus.js`，`INVENTORY_FOCUS_VERSION = 3`。

任何正式「進入背包」入口都遵守一次性優先序：

1. 若有遺失裝備 → 定位「遺失裝備／贖回」區。
2. 否則若背包有實際較強裝備 → 定位「一鍵裝備較強裝備」。
3. 否則 → 背包頂端。

成功贖回後：

1. 若仍有遺失裝備 → 留在／定位遺失裝備區。
2. 若已無遺失裝備但存在升級裝備 → 定位一鍵裝備。
3. 否則 → **不額外移動視角**。

架構規則：

- pending focus 只消耗一次；後續 equip／sell／filter／render 不得持續跳動。
- 較強裝備判斷共用正式 `isActualGearUpgrade()`，不再重寫 `equipmentScore` 比較公式。
- `inventoryfocus.js` 不 monkey-patch `go()`／`openAdventureInventory()`；正式 `ui.js` 入口直接 request → render → apply。
- `resolveInventoryFocusTarget()` 是純 target resolver；DOM scroll 與判斷分離。
- Runtime Integrity 已用 VM 行為測試驗證 entry／post-redeem 六種主要狀況與 one-shot pending。

---

# 11. GM 管理／戰力基準

- GM 密碼在純前端只能防誤觸，不是真正安全邊界；目前不做 server-side GM 權限重構。
- GM 測試／預覽不得污染正式 save。
- GM Hub 外層 section 預設收合；切頁保留 session 狀態。
- 戰力基準中的「地圖怪 ×100」子區塊預設收合，避免 GM 頁面開啟時過長。
- redundant 的 GM 虛空「完整重置」按鈕已退休；既有最高樓層可用正式管理方式處理。

## 11.1 GM 測試角色與 VIP

GM 測試角色支援銀河／宇宙，正式同步內容包含：

- 測試紀元／等級
- 正式角色實穿裝備或同級神話預測裝備
- 強化
- 8 專精
- 10 印記
- 文明等級
- VIP 等級

`gmTestPlayerStats()` 最後仍走正式：

`playerCombatStats(equipment, testVip())`

因此 VIP 的 HP／ATK／DEF／暴擊／閃避基礎能力，在銀河與宇宙 GM 戰力基準都會正確套用；「同步目前狀態」也會把 `state.vipLevel` 同步到 `gmTestVipLevel`。

VIP8／14／16／18 是**掉裝特權**，目前 GM 戰力基準不另外模擬完整 loot settlement，這是刻意保留；GM 的「指定產生宇宙裝備」也是明確指定品質／部位的管理工具，不應被 VIP Loot 隨機規則干涉。

---

# 12. 2026-09-24～09-25 技術整理／Integrity

## 12.1 既有 8 批全站技術整理

### Integrity／CI

- `integritycontract.js` 是 canonical Integrity Contract。
- `runtimeintegrity.js` V19、`finalintegrity.js` V19 共用同一 contract。
- 舊 `runtimeintegrityaddon.js` 已退休。
- CI 做全 JS syntax、owner／legacy consumer audit、save／load order contract。

### Save future-version 保護

- `saveversionguard.js` V1。
- Local／Cloud／JSON 三入口統一 fail-closed。
- direct `migrateSave()` 也受保護。

### Migration／Normalization

- Offline normalization 收斂到 `offlinestatecore.js`。
- 舊存檔政策正式為 V1+ all-known。
- 不因整理任意刪除舊 migration。

### Legacy owner

- `compatibilityowners.js` V1。
- `level100balance.js` 已退休。
- `MAX_LEVEL`、`SAVE_VERSION`、Arena alias 的既有 consumer 已由 CI 鎖定，禁止新依賴擴散。

### 啟動背景效能

`backgroundpreload.js` Policy V3：

- 啟動只等待當前首畫面必要背景。
- critical timeout 4.5 秒。
- 其他背景遊戲顯示後以 idle＋最多2併發逐步 preload。
- reveal 前會等待 DOMContentLoaded，避免 deferred script 尚未完成就讓玩家操作。

### Save Hook／Script Load

`compatibilityowners.js` 提供正式 after-save hook：

- `registerAfterSaveHook()`
- `unregisterAfterSaveHook()`
- `getAfterSaveHookIds()`

Cloud Save V3 不再自行 monkey-patch `save()`，只註冊 `cloud-local-meta` hook。

Script Load Policy V1 分組：`core / world / gm / story / integrity`。大量 Story payload 已 `defer`；不強制把仍有交錯依賴的 GM 全部延遲，避免 race。

### 素材政策

- `assets/backgrounds-source/`：原始 PNG authoring source，不得被 runtime 引用。
- `assets/backgrounds/`：正式 WebP runtime。
- `assets/README.md` 是素材政策說明。
- `tests/runtime/asset-integrity.js` 驗證格式、desktop/mobile 配對、CSS 引用存在、禁止 source runtime 引用與體積關係。
- 不做 history rewrite／Git LFS migration；若未來來源素材大幅成長，另案處理。

## 12.2 最新 Runtime 行為測試

`tests/runtime/js-integrity.js` 已包含：

- 背包定位 V3 真正 VM 行為測試，而非只靠 source-string if 順序。
- VIP Loot V2 deterministic VM 行為測試：
  - VIP7 不得提前取得 VIP8／14。
  - VIP8 15% 邊界。
  - VIP14 5% 邊界。
  - VIP16 只限 Boss 且 15% 邊界。
  - VIP18 只限 Boss 且 10% 邊界。
  - VIP14＋18 可獨立同時觸發並合計 +2。
  - 神話品質封頂 5。
  - VIP8 必須使用指定 target state／resolver。
- Universe settlement audit：`equipmentRewards[]` 是正式陣列 owner；舊 `item / itemResult / sale / kept` 只能是第一件相容投影。

更新 handoff 前最新 exact-head `cf2d03a24866dc580024e8d7903c448a9ffb78a9`：

- Runtime Integrity #360：success。
- Story Integrity #574：success。

## 12.3 已知 CI 小缺口

`.github/workflows/runtime-integrity.yml` 的 path filters 仍沒有單獨列出 `backgrounds.css`。  
因此若未來只改 `backgrounds.css` 而沒有其他會觸發 Runtime workflow 的檔案，可能不會自動跑 Runtime CI；目前不要偷偷改，除非使用者明確授權。

---

# 13. Cloud Save

- Cloud Save 以 Supabase 為後端；下載會走正式版本檢查＋migration pipeline，並重設 offline 計時起點。
- Cloud Save 真實跨裝置驗證已由使用者取消，不得自動列回 pending。

---

# 14. 目前真正 Pending

目前主要工作不是繼續擴功能，而是：

**使用者親自從頭完整玩一次銀河紀元＋宇宙紀元。**

實玩期間只處理真正遇到的：

- bug
- 流程不順
- 手機／桌機 UI 問題
- 平衡體感
- 文案／語意問題

近期已明確接受／暫緩：

- 虛空幻境 V2 目前先不再調整，等使用者持續玩到 Lv.1000 後再看體感。
- 既有 >10000 虛空紀錄不 migration、不重置。
- GM 戰力基準目前不新增 VIP Loot 掉裝模擬。
- VIP2 宇宙紀元不另造新效果。

已取消、不得自行復活：

- Arena V2 額外500場驗收。
- 宇宙 `.015` 中後期平衡再驗證。
- Cloud Save 真實跨裝置驗證。

第三紀元等待使用者實玩兩紀元後主動重開。

---

# 15. 下一個 ChatGPT／維護者操作規範

1. **先讀 current `main`，不要只靠本檔或對話記憶。**
2. 修改前讀相關正式 owner、直接相依、Integrity／workflow、`index.html`。
3. 使用者說「先討論／先檢查／先列出」時，**不能修改**。
4. 使用者說「做／修改／執行／第N批」時，可直接修改 GitHub `main`。
5. **優先修改正式來源／canonical owner；不要額外做 wrapper、fallback、第二套公式、第二套 state 或第二套 pipeline。** 只有已有明確 legacy compatibility contract 時才保留相容投影，且不得讓新 consumer 擴散依賴。
6. JS／CSS 修改後更新 `index.html` cache-bust；純文件不需要 cache-bust。
7. 修改後重新讀 actual main，並做 base→head compare，確認沒有誤動無關檔案。
8. 不要刪舊 migration，除非先正式改最低支援 save policy。
9. 不要建立第二套稱號 state、文明倍率、VIP Loot 規則、Offline normalization、Arena progress owner。
10. 不要復活 `level100balance.js`、Mirror V1/V2 CSS、runtimeintegrityaddon.js、Void `equivalentPower()` 或舊速度等待。
11. 完成前必須等**最新 main HEAD** 的 Runtime Integrity 成功；若涉及 Story code／content 或 `index.html`，再確認 exact-head Story Integrity。
12. 若改背景／素材，Runtime CI 的 Asset Integrity 必須通過。
13. 第三紀元沒有正式規格前，禁止自行推導。
14. 使用者親自實玩期間，以「修真 bug／UI／流程／平衡」優先，不要只為了程式碼漂亮而重寫穩定系統。

---

# 16. 文件角色

- `README.md`：對外簡介與目前版本總覽。
- `PROJECT_HANDOFF.md`：跨工作階段承接摘要。
- `PROJECT_PENDING_STATUS.md`：真正尚未完成／已取消事項。
- `assets/README.md`：背景素材政策。
- `LEVEL100_EXPANSION.md`：純歷史文件，不是 current 規格。

再次強調：**任何衝突一律以 current GitHub `main` 實際程式碼為準。**

---

# 17. 下一個對話如何接手（標準指令）

請在新的 ChatGPT 對話直接貼以下文字：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查目前 GitHub `main` 的實際程式碼與相關正式 owner／相依／Integrity／`index.html`，完整承接《文明戰線》專案。  
> 以 `main` 為唯一真實來源；若 handoff、舊對話或記憶與 `main` 衝突，以 `main` 為準。  
> 現在先不要修改，先告訴我你已承接完成，以及目前真正 pending／最近需要注意的風險。
