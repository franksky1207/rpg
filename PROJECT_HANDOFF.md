# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-25（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要，不是第二套規格。若本檔、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。任何修改前必須重新讀正式 owner、直接相依、Integrity／workflow 與 `index.html` 載入順序。

本次 handoff 更新前 `main` HEAD：`7a53be196e51336e3e48e7f5b057a5cdf590104a`。  
其中最新遊戲功能程式碼 HEAD 仍是 `cf2d03a24866dc580024e8d7903c448a9ffb78a9`；`7a53...` 只更新上一版 `PROJECT_HANDOFF.md`。本次也只更新交接文件，不修改其他遊戲功能。

---

# 1. 專案定位

《文明戰線》為純前端、文字／數值養成、科幻星際 RPG，支援桌機與手機；iPhone Safari 是重要實機環境。

目前**正式已實作**兩個紀元：

- **銀河紀元**：Lv.1～500，10 區、100 地圖，普通／菁英／Boss。
- **宇宙紀元**：Lv.501～1000，10 區、100 隻主線 Boss；沒有銀河「每圖 5 怪」結構。
- **第三紀元「高維紀元」**：目前已重新開啟設計討論，已有完整設計草案，但**尚未實作到 `main`**；不得把本檔中的設計草案誤當現行 runtime 規則。

目前正式世界永久狀態仍以 `secondWorld.entered` 為準，不建立第二套 `currentWorld` save。

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

> 注意：第三紀元雖已設計 Lv.1000→2000 草案，但 `main` 現行 `ABSOLUTE_MAX_LEVEL` 仍是 1000；未實作前不得自行改上限。

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
- VIP2：銀河主線裝備掉落率 +5pp；宇宙主線本來固定掉裝，因此此效果在宇宙沒有額外作用，這是刻意保留的新手期特權。
- VIP4／VIP12：副本 VIP 積分倍率由正式 VIP point owner 統一處理。
- VIP6：特殊遭遇機率 +2pp；兩紀元共用。
- VIP10：特殊獎勵 10% 再發動；兩紀元共用各自正式資源。
- VIP20：死亡裝備保護；兩紀元正式死亡流程都有效。

## 5.2 VIP Loot Core V2

正式 owner：`viplootcore.js`，`VIP_LOOT_CORE_VERSION = 2`。

- VIP8：15% 優先目前最弱裝備部位。
- VIP14：5% 品質 +1。
- VIP16：Boss 15% 額外掉 1 件裝備。
- VIP18：Boss 10% 品質 +1。
- VIP14 與 VIP18 獨立判定，可同時成功合計 +2，但最高封頂神話品質 5。

正式 pipeline：

- `resolveVipLootModifiers(baseQuality,{boss,state,rng,...})` 一次統一處理 VIP8／14／18。
- `vipLootBossExtraDropTriggered(...)` 統一處理 VIP16。
- VIP8 最弱部位依指定 target state 的正式 `equipmentScore()` 計算，可供 GM／模擬 state 注入 resolver。
- 銀河主線、銀河／宇宙懸賞、宇宙主線共用此 owner；不得各自重寫第二套機率。
- 懸賞不是 Boss，因此只套 VIP8／14，不套 VIP16／18。
- 宇宙主線每件基礎／VIP16 額外裝備都各自重新跑 VIP8／14／18。
- 同一可注入 RNG 會傳進 VIP16 與每件裝備 modifier pipeline，方便 deterministic integrity 測試。
- 此次 VIP Loot 沒新增 save 欄位，不需 schema bump 或 migration，也不回溯重製舊裝備。

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

`secondworldcalamityrun.js`：

- `CONTINUOUS_VERSION = 2`
- `SECOND_WORLD_CALAMITY_BACKGROUND_VERSION = 1`
- `SECOND_WORLD_CALAMITY_FAST_CATCH_UP_POLICY_VERSION = 1`

正式行為：

- 連續戰鬥在 GM 背景戰鬥開啟時加入共用 `backgroundProgress` flow。
- 背景回頁支援 fast catch-up；UI 使用 structured duration、consume credit、throttled presentation／render／checkpoint。
- `pagehide` 若背景戰鬥啟用，保留 continuous flow；未啟用則停止。
- minimal mode 共用正式 `runSecondWorldCalamityContinuous()`，不另做第二套。

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

鏡像稱號：15 幸運眷顧、16 天選之刻、17 逆命者、18 傳說之日、19 距神一步、20 神蹟。

稱號 state 永遠只有一套 `state.titles`，不建立 `secondWorld.titles`。

Renderer：Base Renderer V2、Universe Renderer V1、Mirror Renderer V3。Mirror V3 是單一 active owner；V1／V2 dead CSS 已退休。GM 預覽使用同一 renderer，只做視覺預覽，不改 state／save。

舊資料補正仍保留：銀河依 marks、宇宙依 `trueKills>=1`（ID first/index fallback）、鏡像依 history.bestWins；補正不製造假通知。

---

# 8. 副本

正式模式：懸賞、競技、鏡像、虛空；另有文明災厄。

- 競技場已 world-aware，正式 state 為 `arenaByWorld`；legacy `dungeon.arena` 只作相容。
- 宇宙競技 Arena By World V2、Unlock V2、Rank Curve V2。
- 懸賞正式採 V2 統一難度／公式 owner；VIP8／14 掉裝特權由 `viplootcore.js` 共用。
- 鏡像 15～20 勝稱號系統已完成。
- 已完成銀河／宇宙地圖戰、災厄戰、戰線紀錄回顧；宇宙紀元為預設，但同一 session 內玩家切去回顧後不會被強制跳回預設，除非整理／重開頁面。

## 8.1 虛空幻境 V2

正式 owner：`dungeonvoid.js`。

解鎖 Lv.25；開場樓層：`max(1, highestCleared - 100)`。

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
- Boss 不另外乘隱藏 stat multiplier。
- 每層之間補滿 HP；run 內使用玩家 snapshot。
- 文明最終傷害倍率走正式 `civilizationCombatDamageMultiplier(...)`。
- 舊 `equivalentPower()` 已退休。
- 既有玩家若 `highestCleared > 10000`，不 migration、不重置、不換算；使用者用既有 GM 管理自行處理。
- 使用者已接受目前 V2 體感；先持續實玩到 Lv.1000，再由使用者主動決定是否重開平衡。

---

# 9. 特殊遭遇／Story／UI 語意

## 9.1 特殊遭遇

`specialencounter.js` 正式流程：

`提示特殊遭遇 → 補滿玩家 HP → 進入特殊戰鬥`

- 宇宙 Boss 可觸發特殊遭遇。
- 銀河 Boss 排除特殊遭遇。
- 銀河主線本來每戰後會補血，因此前置 full-heal 是 idempotent。
- 特殊遭遇結束仍有正式 settlement heal。
- 宇宙若剛觸發新文明災厄出現，該次特殊遭遇會依既有規則跳過。

## 9.2 Story／雙紀元語意

- 銀河＋宇宙 Story data 已正式存在，Story Integrity 持續檢查。
- 全介面＋遊戲說明雙紀元語意總掃描已完成。
- 宇宙介面不得殘留銀河金幣／強化石／Lv.500／每圖5怪等錯誤語意。
- 第三紀元劇情目前已有設計門檻草案，但尚未有正式 story code／content；未實作前不得自行補故事內容。

---

# 10. 冒險／背包 UI 行為

## 10.1 宇宙冒險 Boss 背包

- 宇宙冒險頁頂部不再放通用「背包」按鈕。
- 只有目前／最新進度 Boss 卡顯示背包；舊 Boss 卡不顯示。
- 判定使用正式 `secondWorldHighestUnlockedBossIndex()`。
- 即使目前 Boss 暫時不可挑戰，最新卡仍保留背包入口；全通關後保留最後 Boss 卡。
- 銀河冒險既有背包入口維持原行為。

## 10.2 宇宙冒險 one-shot 自動定位

正式 owner：`worldmapui.js`＋`playersemanticsui.js`。

- 首頁 → 宇宙冒險：一次定位到目前／最新 Boss。
- 宇宙 Boss 戰鬥結果關閉：一次定位到新的目前／最新 Boss。
- 從宇宙目前 Boss 背包返回冒險：一次定位回目前／最新 Boss。
- 只在明確 navigation event request 時生效，不會持續搶 scroll。
- 目標使用 `data-second-world-boss` 與 `scrollIntoView({block:"center", inline:"nearest", behavior:"auto"})`。

## 10.3 全背包智慧定位 V3

正式 owner：`inventoryfocus.js`，`INVENTORY_FOCUS_VERSION = 3`。

正式「進入背包」一次性優先序：

1. 若有遺失裝備 → 遺失裝備／贖回區。
2. 否則若背包有實際較強裝備 → 「一鍵裝備較強裝備」。
3. 否則 → 背包頂端。

成功贖回後：仍有遺失裝備→遺失區；否則有升級裝備→一鍵裝備；否則不額外移動視角。

架構：pending focus 只消耗一次；較強裝備判斷共用正式 `isActualGearUpgrade()`；不 monkey-patch `go()`／`openAdventureInventory()`；DOM scroll 與 target resolver 分離。

---

# 11. GM 管理／戰力基準

- GM 密碼在純前端只能防誤觸，不是真正安全邊界；目前不做 server-side GM 權限重構。
- GM 測試／預覽不得污染正式 save。
- GM Hub 外層 section 預設收合；切頁保留 session 狀態。
- 戰力基準「地圖怪 ×100」子區塊預設收合。
- redundant GM 虛空「完整重置」按鈕已退休。

## 11.1 GM 測試角色與 VIP

GM 測試角色支援銀河／宇宙，同步內容包含：測試紀元／等級、正式角色實穿裝備或同級神話預測裝備、強化、8 專精、10 印記、文明等級、VIP 等級。

`gmTestPlayerStats()` 最後走正式 `playerCombatStats(equipment, testVip())`，所以 VIP 的 HP／ATK／DEF／暴擊／閃避基礎能力在兩紀元 GM 戰力基準都正確套用；同步目前狀態也會把 `state.vipLevel` 同步到 `gmTestVipLevel`。

VIP8／14／16／18 是掉裝特權，目前 GM 戰力基準不模擬完整 loot settlement；GM「指定產生宇宙裝備」也應維持明確指定品質／部位，不被 VIP Loot 隨機規則干涉。

---

# 12. 技術整理／Integrity／素材

## 12.1 Integrity／CI

- `integritycontract.js` 是 canonical Integrity Contract。
- `runtimeintegrity.js` V19、`finalintegrity.js` V19 共用同一 contract。
- 舊 `runtimeintegrityaddon.js` 已退休。
- CI 做全 JS syntax、owner／legacy consumer audit、save／load order contract。

## 12.2 Save future-version 保護

- `saveversionguard.js` V1。
- Local／Cloud／JSON 三入口統一 fail-closed。
- direct `migrateSave()` 也受保護。

## 12.3 Migration／Normalization

- Offline normalization 收斂到 `offlinestatecore.js`。
- 舊存檔政策正式為 V1+ all-known。
- 不因整理任意刪除舊 migration。

## 12.4 Legacy owner

- `compatibilityowners.js` V1。
- `level100balance.js` 已退休。
- `MAX_LEVEL`、`SAVE_VERSION`、Arena alias 的既有 consumer 已由 CI 鎖定，禁止新依賴擴散。

## 12.5 啟動背景效能

`backgroundpreload.js` Policy V3：啟動只等待當前首畫面必要背景；critical timeout 4.5 秒；其餘背景遊戲顯示後以 idle＋最多2併發逐步 preload；reveal 前等待 DOMContentLoaded。

## 12.6 Save Hook／Script Load

`compatibilityowners.js` 提供正式 after-save hook：`registerAfterSaveHook()`、`unregisterAfterSaveHook()`、`getAfterSaveHookIds()`。Cloud Save V3 不再 monkey-patch `save()`，只註冊 `cloud-local-meta` hook。

Script Load Policy V1 分組：`core / world / gm / story / integrity`。Story payload 大量 `defer`；目前不強制把仍有交錯依賴的 GM 全部延遲。

## 12.7 素材政策

- `assets/backgrounds-source/`：原始 PNG authoring source，不得被 runtime 引用。
- `assets/backgrounds/`：正式 WebP runtime。
- `assets/README.md`：素材政策。
- `tests/runtime/asset-integrity.js`：驗證格式、desktop/mobile 配對、CSS 引用存在、禁止 source runtime 引用與體積關係。
- 不做 history rewrite／Git LFS migration；來源素材大幅成長再另案處理。

## 12.8 最新 Runtime 行為測試

`tests/runtime/js-integrity.js` 已包含：

- 背包定位 V3 VM 行為測試。
- VIP Loot V2 deterministic VM 行為測試：VIP7 無提前特權、VIP8 15% 邊界、VIP14 5% 邊界、VIP16 Boss 15% 邊界、VIP18 Boss 10% 邊界、VIP14＋18 疊加、神話封頂、VIP8 target state／resolver。
- Universe settlement audit：`equipmentRewards[]` 正式陣列 owner；舊單件欄位只是第一件相容投影。

最新功能程式碼 exact-head `cf2d03a24866dc580024e8d7903c448a9ffb78a9`：Runtime Integrity #360 success；Story Integrity #574 success。上一版 handoff 文件 commit `7a53...` 之後沒有遊戲功能程式碼變更。

## 12.9 已知 CI 小缺口

`.github/workflows/runtime-integrity.yml` 的 path filters 仍沒有單獨列出 `backgrounds.css`。若未來只改 `backgrounds.css` 而沒有其他觸發檔案，可能不會自動跑 Runtime CI；目前不要偷偷改，除非使用者明確授權。

---

# 13. Cloud Save

- Cloud Save 以 Supabase 為後端；下載走正式版本檢查＋migration pipeline，並重設 offline 計時起點。
- Cloud Save 真實跨裝置驗證已由使用者取消，不得自動列回 pending。

---

# 14. 第三紀元「高維紀元」設計草案（2026-09-25，尚未實作）

> **重要：本節是已討論確認的設計基準，不是 `main` 現行程式。實作前仍要重新讀 current main，再正式設計 state／save schema／owners／UI。**

## 14.1 定位／入場／世界切換

- 第三紀元名稱：**高維紀元**。
- 設計方向：銀河約500主線敵人 → 宇宙100 Boss → 高維只剩10隻高維存在；系統數量繼續收斂。
- 預想入場：Lv.1000、宇宙主線完成、強化 +40×5、文明 Lv.10、VIP20；專精8×60與印記10×10原則上延續宇宙入場完成態。
- 進入高維紀元後，第一／第二紀元不再作為正式進度世界切回；其主線與災厄改為**回顧戰**。
- 高維紀元仍保留角色等級與裝備成長。

## 14.2 十隻高維存在／持久血量

- 只有10隻高維存在，**非固定線性順序，玩家可自選挑戰目標**。
- 每隻要有不同能力／機制；正式名稱、能力細節尚未定。
- 每隻暫定最大 HP **11 億**；10隻總 HP **110 億**。
- 王血為持久進度；每次正式傷害都永久保存，不因玩家死亡／重整回滿。
- 王死亡後正式 HP=0，移入回顧戰；回顧戰採該王**最終型態**，無正式收益。
- 王剩餘 HP 越低，能力越強；最大 HP 不重設、不膨脹。
- 具體強化階段數／門檻／倍率尚未定。
- 王跨進新強化階段時：本場先完整結算 → 強制停止連戰 → 跳提示視窗 → 玩家再決定是否重開。
- 若同一場直接把王打死，死亡優先，不再跳強化提示。

## 14.3 5% 戰線限制

- 10王不得讓單一王被一路壓到底；比較**存活王的剩餘 HP 百分比**。
- 若目標王剩餘 HP% 已比目前存活王中的最高剩餘 HP%低達 **5 個百分點（5pp）**，下一場不可再開。
- 例：最高王100%，目標95.1%可打；95.0%即鎖。
- 若開戰前合法、該場打完才跨過5pp：**該場完整結算、不回滾傷害，戰後停止**。
- 王死亡後可退出比較池；只剩最後一王時自然解除其他王造成的5%限制。

## 14.4 連續戰鬥／死亡計數

「連續戰鬥100場」正式概念應理解為：

- 在沒有其他特殊中斷條件時，玩家可對同一王持續戰鬥，直到**玩家累積死亡100次**。
- 正常流程：開戰 → 玩家死亡 → 單場正式結算 → 自動恢復 → 同王下一場。
- 100計的是玩家死亡次數；若王先死，該場不增加死亡次數，但連戰直接結束。

提前停止條件已確認：

- 王死亡。
- 5%限制。
- 王跨入新強化階段。
- 觸發稱號／劇情門檻，需要一次性事件展示。
- 玩家手動停止。
- 重整／離頁等實際執行中斷。

逐場落帳原則：

- 每一場完成後，王 HP、EXP、高維資源、裝備結果都要正式登記／保存，不能等100死整輪結束才一次結算。
- 即使重整，已完成場次的收益與王血傷害都不能遺失。
- 重進後新的100死計數重新從0開始。

## 14.5 死亡處罰＝高維壓制

- 高維紀元入場已要求 VIP20，所以死亡**不再掉裝**。
- 暫不扣 EXP、資源、裝備或回補王血，避免破壞110億封閉數學。
- 死亡改採本輪暫時性「高維壓制」：**每死亡1次，本輪最大 HP 上限下降0.5個百分點**。
- 線性、不複利：0死100%、1死99.5%、10死95%、20死90%、50死75%、100死50%。
- 連戰中升級後，正式最大 HP 仍正常變高，但既有壓制比例不清除。
- 概念：`本輪實際最大HP = 最新正式最大HP × (1 - 死亡次數×0.005)`。
- 本輪因任何原因停止後，壓制清除；下一輪從100%最大HP重新開始。

## 14.6 等級／EXP

- 高維紀元：Lv.1000 → Lv.2000，共升1000級。
- **每級固定 10,000,000 EXP**。
- 升滿總需求：**100 億 EXP**。
- EXP只認正式王血傷害：**1 點有效 HP 傷害 = 1 EXP**。
- 因十王總HP為110億，角色約在累積削掉100億王血時到Lv.2000，仍留約10億總王血作滿級後終局收尾。
- 這是設計草案；現行 `levelprogression.js` 尚未支援Lv.2000。

## 14.7 單一高維資源／高維核心

- 第三紀元只新增**1種高維資源**，名稱尚未定。
- 同樣遵守：**1 點有效王血傷害 = 1 高維資源**。
- 只新增**1個高維核心／高維能力**作新養成。
- 核心 Lv.0→10，**每級10億資源**，總計100億；不做Lv.11。
- 高維核心在專屬介面由玩家**手動升級**；連戰中即使資源足夠也不自動升。
- 核心正式名稱與每級效果尚未定。

## 14.8 110億封閉進度

高維紀元希望維持單一守恆主軸：

- 十王總HP＝110億。
- Lv.1000→2000＝100億EXP。
- 高維核心Lv.0→10＝100億資源。
- 1HP傷害＝1EXP＝1高維資源。
- 約99億總傷害取得第9稱號／第9劇情。
- 約100億總傷害達Lv.2000＋核心Lv.10。
- 最後約10億是滿級後的終局收尾；110億全削完才十王全滅。

任何第三紀元其他系統都不應憑空產出 EXP／高維資源，否則會破壞此守恆。

## 14.9 稱號／劇情

十王各100%，總剩餘血量視為**1000%**。

稱號10階與劇情10段共用同一門檻：

- 總剩餘900% → 第1稱號＋第1劇情。
- 800% → 第2。
- 700% → 第3。
- ……
- 100% → 第9。
- 0% → 第10稱號＋最終劇情。

判定用 `總剩餘HP% <= 門檻 且尚未取得/觸發`，不能要求剛好命中整數門檻。

粗略對應：每跨100%總血量＝約11億總傷害。第9階約99億；第10階為110億、十王全滅。

稱號名稱、視覺、10段劇情內容尚未設計。

若同一場跨多個事件：先完成本場正式結算；稱號／劇情沿用前兩紀元敘事優先原則；王死亡優先於強化階段提示。

## 14.10 裝備／出售／VIP

- 第三紀元仍保留裝備。
- 高維裝備品質只保留：**傳說、神話**；正式掉率／數值公式未定。
- 每完成一場正式戰鬥就做一次裝備掉落判定。
- 不把掉率直接綁傷害量；若玩家故意脫裝快速死亡農掉落次數，視為可接受的低效率農裝策略，代價是削王慢、EXP少、資源少、正式進度慢。
- 連戰中不能換裝；停止／結算後才能換，沿用前兩紀元操作邏輯。
- 高維紀元賣裝**不給任何資源**：不給金幣、不給暗物質、不給高維資源；純粹清掉不需要的裝備／騰空間。UI最後可決定仍叫「出售」或改名。
- VIP20為完成態，不開VIP21+。
- 既有VIP特權能自然套用第三紀元者就繼續生效；沒有效果的自然失效，不補償、不轉換、不硬造新用途。
- 尤其可自然沿用戰鬥屬性、相容的掉裝／品質／額外掉落特權；金幣／暗物質／舊副本／VIP積分等沒對應用途者就算了。

## 14.11 舊養成系統完成態

第三紀元目前方向：

- 強化 +40 封頂，不開 +41～+60。
- 專精 Lv.60 封頂。
- 印記 Lv.10 封頂。
- 文明 Lv.10 封頂。
- VIP20 封頂。
- 新增養成只保留單一高維核心。

## 14.12 離線收益

第三紀元離線不能給：EXP、高維資源、王血傷害、稱號、劇情、高維核心進度。

只做**裝備掉落結算**，並沿用目前約10%離線收益哲學。

高維離線樣本只需考慮：

1. 平均一場耗時。
2. 裝備掉落判定效率。

離線只代表取得部分裝備機會，不代表正式削減高維王。

## 14.13 副本／舊玩法

- 不做第三紀元版懸賞。
- 不做第三紀元版競技場。
- 不另做第三紀元文明災厄；10隻高維存在本身就是終局主體。
- **鏡像保留**。
- 虛空既有無限挑戰可保留，但不作高維EXP／資源來源。
- VIP20後虛空／鏡像的VIP積分沒有實際養成用途，可以視為系統畢業，不必硬轉成高維資源。
- 十王全滅後，回顧戰、虛空、鏡像、裝備蒐集等仍可繼續。

## 14.14 回顧戰／十王全滅

- 王死亡後移入回顧戰，使用最終型態、無正式收益。
- 十王全滅後的最終完成態**尚未完全定案**。
- 目前偏向：十王全滅 → 第10稱號＋最終劇情／最終事件／最終畫面 → 完成後才正式標記高維紀元完成。

## 14.15 執行順序草案

目前接受的單場結算方向：

1. 本場完整打完。
2. 寫入王最新HP。
3. 依本場實際削血發EXP與高維資源。
4. 做本場裝備掉落判定。
5. 檢查角色升級。
6. 檢查總血量稱號／劇情門檻並處理一次性事件。
7. 檢查王死亡；若死亡，進死亡／回顧流程，不再做強化提示。
8. 若未死，檢查王是否跨新強化階段；若是，強制停止並跳提示。
9. 檢查5%戰線限制；若鎖定，停止下一場。
10. 若皆未觸發且死亡次數<100，恢復後進下一場。

實作時仍要依 current main 的戰鬥／story／settlement owner 調整正式責任，不要直接照此清單生硬複製第二套 pipeline。

## 14.16 GM／自動測試／人工驗收分工

不能把所有第三紀元驗證都塞進GM。

GM適合直接控制：王HP%、死亡／存活、玩家等級、高維資源、高維核心等級、必要測試角色狀態。

自動測試／Integrity應鎖：5%邊界、合法跨線後本場結算／下一場停止、王跨階停止、同場多事件順序、王死亡優先、100死計數與重進重置、高維壓制0.5pp且升級不清除、離線不產正式高維進度、回顧戰無收益。

人工驗收：100死連戰體感、高維壓制體感、王強化跳窗頻率、5%是否真的促進輪流攻略、傳說／神話掉裝量、後期王強度是否追得上Lv.1000→2000成長。

## 14.17 尚未定案的第三紀元細節

- 10隻高維存在正式名稱。
- 各自能力／機制。
- 強化階段數、HP門檻、能力倍率。
- 高維裝備正式公式與傳說／神話掉率。
- 高維資源名稱。
- 高維核心名稱／每級效果。
- 10個稱號名稱／視覺。
- 10段劇情內容。
- 十王全滅後最終事件／畫面／完成旗標。
- GM最終控制項與正式玩家UI。
- 第三紀元 save schema、migration、正式 owners、index load order。

---

# 15. 目前真正 Pending

現行銀河／宇宙部分，主要仍是使用者親自完整實玩並回報真實 bug／流程／手機桌機UI／平衡／文案問題。

近期已明確接受／暫緩：

- 虛空幻境 V2 目前先不再調，等持續玩到 Lv.1000 後再看。
- 既有 >10000 虛空紀錄不 migration、不重置。
- GM 戰力基準不新增 VIP Loot 掉裝模擬。
- VIP2 宇宙紀元不另造新效果。

已取消、不得自行復活：

- Arena V2 額外500場驗收。
- 宇宙 `.015` 中後期平衡再驗證。
- Cloud Save 真實跨裝置驗證。

第三紀元部分：**已重新開啟設計，不再是「等待使用者主動重開」狀態；但仍完全未實作。** 下一步若繼續討論，優先完成14.17尚未定案項目；若使用者正式說「做／修改／執行」，才進入 main 實作規劃。

---

# 16. 下一個 ChatGPT／維護者操作規範

1. **先讀 current `main`，不要只靠本檔或對話記憶。**
2. 修改前讀相關正式 owner、直接相依、Integrity／workflow、`index.html`。
3. 使用者說「先討論／先檢查／先列出／先不要修改」時，**不能修改**。
4. 使用者說「做／修改／執行／第N批」時，可直接修改 GitHub `main`。
5. **優先修改正式來源／canonical owner；不要額外做 wrapper、fallback、第二套公式、第二套 state 或第二套 pipeline。** 只有已有明確 legacy compatibility contract 時才保留相容投影，且不得讓新 consumer 擴散依賴。
6. JS／CSS 修改後更新 `index.html` cache-bust；純文件不需要 cache-bust。
7. 修改後重新讀 actual main，並做 base→head compare，確認沒有誤動無關檔案。
8. 不要刪舊 migration，除非先正式改最低支援 save policy。
9. 不要建立第二套稱號 state、文明倍率、VIP Loot 規則、Offline normalization、Arena progress owner。
10. 不要復活 `level100balance.js`、Mirror V1/V2 CSS、`runtimeintegrityaddon.js`、Void `equivalentPower()` 或舊速度等待。
11. 完成前必須等**最新 main HEAD** 的 Runtime Integrity 成功；若涉及 Story code／content 或 `index.html`，再確認 exact-head Story Integrity。
12. 若改背景／素材，Runtime CI 的 Asset Integrity 必須通過。
13. 第三紀元設計已存在，但**尚未實作**；不得因本檔草案就擅自新增 state／migration／owner。實作前必須重新讀 current main 並把草案映射到正式 owner。
14. 使用者親自實玩期間，以修真 bug／UI／流程／平衡優先，不要只為程式碼漂亮而重寫穩定系統。

---

# 17. 文件角色

- `README.md`：對外簡介與目前版本總覽。
- `PROJECT_HANDOFF.md`：跨工作階段承接摘要。
- `PROJECT_PENDING_STATUS.md`：真正尚未完成／已取消事項。
- `assets/README.md`：背景素材政策。
- `LEVEL100_EXPANSION.md`：純歷史文件，不是 current 規格。

再次強調：**任何衝突一律以 current GitHub `main` 實際程式碼為準。** 第三紀元設計草案只有在正式實作到 main 後才成為 runtime 真實來源。

---

# 18. 下一個對話如何接手（標準指令）

請在新的 ChatGPT 對話直接貼以下文字：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查目前 GitHub `main` 的實際程式碼與相關正式 owner／相依／Integrity／`index.html`，完整承接《文明戰線》專案。  
> 以 `main` 為唯一真實來源；若 handoff、舊對話、設計稿或記憶與 `main` 衝突，以 `main` 為準。  
> 第三紀元「高維紀元」目前只有 handoff 中的設計草案，尚未實作；不要自行把草案當成現行程式。  
> 現在先不要修改，先告訴我你已承接完成，以及目前真正 pending、第三紀元尚未定案項目、最近需要注意的風險。
