# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-24 15:35（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要，不是第二套規格。若本檔、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。任何修改前必須重新讀正式 owner、直接相依、Integrity／workflow 與 `index.html` 載入順序。

本次 handoff 更新前的程式碼／文件 HEAD：`799ab6c90a8ce70726f2a10d9d02614b6fd2ac46`。本次 handoff 更新本身只整理交接資料，不代表額外遊戲規則變更。

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
- 宇宙主線勝利：EXP、暗物質、每勝 +1 暗能量、固定 1 件 world2 裝備；不給銀河金幣／強化石。
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

- VIP 最大20；門檻 `1000*level²`。
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
- 懸賞正式採 V2 統一難度／公式 owner。
- 鏡像 15～20 勝稱號系統已完成。
- 虛空維持無限型副本。
- 已完成銀河／宇宙地圖戰、災厄戰、戰線紀錄回顧；宇宙紀元為預設，但同一 session 內玩家切去回顧後不會被強制跳回預設，除非整理／重開頁面。

---

# 9. Story／UI 語意

- 銀河＋宇宙 Story data 已正式存在，Story Integrity 持續檢查。
- 全介面＋遊戲說明雙紀元語意總掃描已完成，不再列 pending。
- 宇宙介面不得殘留銀河金幣／強化石／Lv.500／每圖5怪等錯誤語意。
- 第三紀元劇情或規則不得自行推導。

---

# 10. 2026-09-24 全站技術整理結果

本次在銀河＋宇宙接近封版後完成 8 批大型整理。

## 10.1 Integrity／CI

- 建立 `integritycontract.js` 作 canonical Integrity Contract。
- `runtimeintegrity.js` V19、`finalintegrity.js` V19 共用同一 contract。
- 舊 `runtimeintegrityaddon.js` 已退休。
- CI 會做全 JS syntax、owner／legacy consumer audit、save／load order contract。
- 舊錯誤文字／版本漂移已整理。

## 10.2 Save future-version 保護

- `saveversionguard.js` V1。
- Local／Cloud／JSON 三入口統一 fail-closed。
- direct `migrateSave()` 也受保護。

## 10.3 Migration／Normalization

- Offline normalization 收斂到 `offlinestatecore.js`。
- 舊存檔政策正式為 V1+ all-known。
- 不因整理任意刪除舊 migration。

## 10.4 Legacy owner

- `compatibilityowners.js` V1。
- `level100balance.js` 已退休。
- `MAX_LEVEL`、`SAVE_VERSION`、Arena alias 的既有 consumer 已由 CI 鎖定，禁止新依賴擴散。

## 10.5 啟動背景效能

`backgroundpreload.js` Policy V3：

- 啟動只等待當前首畫面必要背景。
- critical timeout 4.5 秒。
- 其他背景遊戲顯示後以 idle＋最多2併發逐步 preload。
- reveal 前會等待 DOMContentLoaded，避免 deferred script 尚未完成就讓玩家操作。

## 10.6 Save Hook／Script Load

`compatibilityowners.js` 提供正式 after-save hook：

- `registerAfterSaveHook()`
- `unregisterAfterSaveHook()`
- `getAfterSaveHookIds()`

Cloud Save V3 不再自行 monkey-patch `save()`，只註冊 `cloud-local-meta` hook。

Script Load Policy V1 分組：`core / world / gm / story / integrity`。大量 Story payload 已 `defer`；不強制把仍有交錯依賴的 GM 全部延遲，避免 race。

## 10.7 素材政策

- `assets/backgrounds-source/`：原始 PNG authoring source，不得被 runtime 引用。
- `assets/backgrounds/`：正式 WebP runtime。
- `assets/README.md` 是素材政策說明。
- `tests/runtime/asset-integrity.js` 驗證格式、desktop/mobile 配對、CSS 引用存在、禁止 source runtime 引用與體積關係。
- 目前約：source 32 張／76.36MB；runtime WebP 32 張／4.32MB，約 source 的5.7%。
- 不做 history rewrite／Git LFS migration；若未來源素材大幅成長，另案處理。

---

# 11. Cloud Save／GM

- Cloud Save 以 Supabase 為後端；下載會走正式版本檢查＋migration pipeline，並重設 offline 計時起點。
- Cloud Save 真實跨裝置驗證已由使用者取消，不得自動列回 pending。
- GM 密碼在純前端只能防誤觸，不是真正安全邊界；目前不做 server-side GM 權限重構。
- GM 測試／預覽不得污染正式 save。

---

# 12. 目前真正 Pending

目前主要工作不是繼續擴功能，而是：

**使用者親自從頭完整玩一次銀河紀元＋宇宙紀元。**

實玩期間只處理真正遇到的：

- bug
- 流程不順
- 手機／桌機 UI 問題
- 平衡體感
- 文案／語意問題

不要為了程式碼更漂亮而重寫穩定系統。

已取消、不得自行復活：

- Arena V2 額外500場驗收。
- 宇宙 `.015` 中後期平衡再驗證。
- Cloud Save 真實跨裝置驗證。

第三紀元等待使用者實玩兩紀元後主動重開。

---

# 13. 下一個 ChatGPT／維護者操作規範

1. **先讀 current `main`，不要只靠本檔或對話記憶。**
2. 修改前讀相關正式 owner、直接相依、Integrity／workflow、`index.html`。
3. 使用者說「先討論／先檢查／先列出」時，**不能修改**。
4. 使用者說「做／修改／執行／第N批」時，可直接修改 GitHub `main`。
5. JS／CSS 修改後更新 `index.html` cache-bust；純文件不需要 cache-bust。
6. 修改後重新讀 actual main，並做 base→head compare，確認沒有誤動無關檔案。
7. 不要刪舊 migration，除非先正式改最低支援 save policy。
8. 不要建立第二套稱號 state、文明倍率、Offline normalization、Arena progress owner。
9. 不要復活 `level100balance.js`、Mirror V1/V2 CSS、runtimeintegrityaddon.js 或舊速度等待。
10. 完成前必須等**最新 main HEAD** 的 Runtime Integrity 成功；若涉及 Story，再確認 Story Integrity。
11. 若改背景／素材，Runtime CI 的 Asset Integrity 必須通過。
12. 第三紀元沒有正式規格前，禁止自行推導。

---

# 14. 文件角色

- `README.md`：對外簡介與目前版本總覽。
- `PROJECT_HANDOFF.md`：跨工作階段承接摘要。
- `PROJECT_PENDING_STATUS.md`：真正尚未完成／已取消事項。
- `assets/README.md`：背景素材政策。
- `LEVEL100_EXPANSION.md`：純歷史文件，不是 current 規格。

再次強調：**任何衝突一律以 current GitHub `main` 實際程式碼為準。**
