# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-24 11:07（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔是交接摘要，不是第二套規格。若本檔、舊對話、設計稿、記憶與 `main` 衝突，一律以當下 `main` 為準。任何修改前必須重新讀正式 owner、直接相依、Integrity / workflow 與 `index.html` 載入順序。

本次 handoff 更新前的程式碼 HEAD：`c9f7e91766ff510c2efa8c414e42c824fd6b44ba`；該 HEAD 的 Runtime Integrity #279 為 `success`。本檔更新 commit 只修改 `PROJECT_HANDOFF.md`，不代表任何額外功能變更。

---

# 1. 專案定位／存檔

《文明戰線》為純前端網頁文字／數值養成／科幻星際 RPG，支援桌機與手機。

- **銀河紀元**：Lv.1～500，10 區、100 地圖、普通／菁英／Boss。
- **宇宙紀元**：Lv.501～1000，正式主線為 10 區／100 Boss；沒有銀河每圖 5 怪結構。
- 世界永久狀態以 `secondWorld.entered` 為準，不建立第二套 `currentWorld` save。
- 正式 save key：`frank_text_rpg_save`。
- `SAVE_VERSION=13`、`SAVE_SCHEMA_VERSION=15`、`SAVE_LOAD_PIPELINE_VERSION=2`、`SAVE_NORMALIZATION_PIPELINE_VERSION=1`。
- Save Write Guard V1 必須保留；local save 未成功 resolve 前不得以新 state 覆蓋。
- schema 15 會清掉 GM transient 欄位；GM sandbox 不得寫正式 save。
- Arena legacy cleanup 正式 owner 是 `savemigration.js`；runtime normalization 不再做破壞性 legacy cleanup。

正式 normalization 順序：
`worldPhase → worldProgress → level → gear → enhancement → vip → specialization → daily → dungeon → calamity → titles → offline → persistentFlags`。

---

# 2. 世界／主線／等級

## 2.1 銀河紀元

正式 owner：`data.js`、`worldmaps-*.js`、`engine.js`、`battlepipeline.js`。

10 區依序：地球戰爭、太陽系戰爭、近星戰爭、星際邊疆、獵戶臂戰爭、銀河邊境、銀河中域、銀河核心外圍、銀河核心戰爭、銀河統合戰爭。每區 10 地圖，每圖 5 級範圍、5 隻怪。

## 2.2 宇宙紀元

正式 owner：`secondworlddata.js`、`secondworldmainline.js`、`secondworldcombat.js`、`secondworldrewards.js`。

- 10 區／100 Boss；Boss 等級 505、510、…、1000，每區 10 隻。
- canonical 區域：銀河彼端、本星系群戰爭、星群邊疆、群星會戰、超域邊境、萬域戰線、宇宙纖維帶、星海巨牆、宇宙深域、宇宙統合戰爭。
- `secondworlddata.js` 是區域／Boss／裝備名稱／玩家等級→Boss 對應 canonical data owner。
- 世界入口：Lv.500、銀河最終主線完成、8 專精全 60、5 部位 +20、10 印記全 10；VIP 不限。
- 進入宇宙時初始化 `secondWorld` 並切斷銀河離線殘留；`isSecondWorldEntered()` 保持 pure read。

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
- Lv.505：32,400 / 5,400 / 2,700。
- Lv.1000：80,514 / 13,419 / 6,710。
- 基礎暴擊／閃避 0%，仍可受特性修改。
- `SECOND_WORLD_BOSS_STAT_FORMULA_VERSION=1`。
- 此組數值現行直接視為正式基準；除非使用者日後主動重開平衡議題，**不再列中後期平衡驗證為待辦**。

## 2.3 world-aware 等級 owner

正式 runtime owner：`levelprogression.js`。

- `FIRST_WORLD_LEVEL_CAP=500`
- `SECOND_WORLD_LEVEL_CAP=1000`
- `ABSOLUTE_MAX_LEVEL=1000`
- runtime 走 `effectiveLevelCap()`；legacy `MAX_LEVEL=500` 只作 migration 相容。
- 宇宙 Lv.500～999：`ceil((25 + 4*L) * 250)`；Lv.1000：0。
- 銀河滿等 EXP 可 1:1 轉金幣；宇宙滿等不可誤轉金幣。

---

# 3. 宇宙資源／裝備／死亡／強化

- 宇宙主線勝利：EXP、暗物質、每勝 +1 暗能量、固定 1 件 world2 裝備；不給銀河金幣／強化石。
- world2 品質：優良45%、稀有35%、史詩15%、傳說4.5%、神話0.5%。
- 所有正式戰鬥死亡／戰敗不扣既有 EXP、不降級；仍有30%機率遺失一件穿戴裝備，VIP20完全防止。
- world2 贖回＝正式出售價×10暗物質；world1 裝備在宇宙死亡遺失後免費贖回。
- 出售 owner：`equipmentSaleQuote / equipmentSaleBatchQuote / settleEquipmentSale / settleEquipmentSaleBatch`。
- world2 神話出售額外 +1 暗能量；鑑價只放大暗物質。
- 強化：銀河正式 +0～+20；宇宙正式 +20～+40；GM sandbox 0～40。每級主屬性 +2.5%，+40＝+100%。
- +21～+40 使用暗物質＋暗能量；宇宙正式若 <+20 視為資料異常，不由 normalization 免費補值。

---

# 4. VIP／專精／文明等級

- VIP 最大20；門檻 `1000*level²`。
- 8 專精最大60；宇宙沿用同一套正式專精效果，不建立第二套公式。
- 文明等級 `secondWorld.civilizationLevel` 0～10；宇宙每級 final damage +5%，Lv.10 ×1.50，銀河 ×1.00。
- 唯一正式入口：`civilizationCombatDamageMultiplier({world,state,civilizationLevel})`。
- 已接宇宙主線、特殊怪、宇宙災厄、懸賞、競技、虛空、鏡像與對應 GM/Benchmark；禁止各模式另造文明倍率公式。

---

# 5. 戰鬥節奏／背景／離線

- 銀河一般 1×；宇宙一般 1×/1.5×；GM 可 2×，localStorage 持續。
- 全模式 outer gap 140ms；不要恢復舊 220/300/350/450ms 或 60/80ms 啟動等待。
- Background 單一 active flow；最長12小時；credit rate 0.96；主線／虛空／災厄等使用共用 fast catch-up 政策。
- Offline：最短1分鐘、最多12小時；EXP 10%；銀河金幣10%／宇宙暗物質10%；裝備掉落流程10%；銀河直接強化石期望5%／宇宙直接暗能量5%。
- 每速度最多8筆真實樣本；1×/1.5×/2× 可跨速換算。
- world2 離線出售走正式 sale owner；不得產生特殊遭遇、首次 Boss 等非法副作用。

---

# 6. 文明災厄／印記／稱號（2026-09-24 最新）

## 6.1 銀河文明災厄／印記

- 銀河災厄10隻；印記10枚、最大Lv.10；正式 owner `markcore.js`。
- 銀河首次正式取得對應印記時，同步取得災厄稱號；連續討伐遇首次稱號取得會停止，避免首殺里程碑被背景流程吃掉。
- 銀河10稱號：灰潮餘燼、蝕日王冠、星骸殘響、黑域孤星、天環墜落、寂滅遠航、萬域寂滅、黑核權柄、無聲王權、萬星終寂。

## 6.2 宇宙文明災厄

正式 owner：`secondworldcalamity.js`、`secondworldcalamityrun.js`。

- 10隻：彼岸黑潮、群星焚爐、邊星獵皇、萬軍葬艦、超域蝕核、無盡兵災、星脈噬巢、巨牆戰堡、深域吞星、終戰天穹。
- 等級：550、600、…、1000。
- 每隻30 true kills完成，30=100%，完成一階 Civilization +1。
- HP：第1隻 1,000,000；每階 +200,000。ATK×1.10、DEF×1.05、暴擊10%、閃避10%。
- 未完成殘血 persistent；完成後重打每場滿血、不再增加 trueKills、不保存敗北殘血、不顯示連續重打。
- 「現身」與「可挑戰」分離：章末 Boss 首殺先通知現身，實際挑戰仍需前一文明完成（第一隻例外）。
- state row 現在有穩定 `calamityId`；normalizer **優先依 ID 對齊，舊檔才 fallback index**。未升 save schema。
- `completed()` 仍可由 `trueKills>=30` 或文明等級已達該階判定；但若 GM 曾直接拉高文明等級、造成某災厄 `completed=true` 且 `trueKills=0`，下一次真正擊殺仍會記錄 `trueKills=1` 並正常取得首殺稱號，**不偽造30擊殺、不再次加文明等級**。

## 6.3 正式稱號系統＝26個

唯一正式 catalog owner：`playertitlecore.js`。

正式順序固定：
1. 銀河災厄10
2. 宇宙災厄10
3. 鏡像15～20勝6

`PLAYER_TITLE_DEFS / PLAYER_TITLE_IDS / PLAYER_TITLE_CATALOG_DEFS / PLAYER_TITLE_ALL_DEFS` 現在都指向同一份26稱號 canonical catalog，不再維持16與26兩套 catalog。各系列另有 subset：`CIVILIZATION_PLAYER_TITLE_DEFS`、`UNIVERSE_CALAMITY_PLAYER_TITLE_DEFS`、`MIRROR_PLAYER_TITLE_DEFS`。

正式 state 維持單一：
```text
state.titles = {
  version,
  unlocked: [],
  equipped: null,
  pendingNotice: null
}
```
不建立 `secondWorld.titles` 或任何第二套稱號 state。

宇宙10稱號：
1. 越界先驅
2. 寰世銘者
3. 荒境孤鋒
4. 死線歸客
5. 域外凌絕
6. 萬軍獨行
7. 寰宇織者
8. 破界行者
9. 幽域長明
10. 萬界之巔

宇宙稱號首殺規則：正式擊殺且該災厄 `trueKillsBefore===0` 即取得；不必等30/30。連續討伐取得首次稱號後以 `title-first-kill` 停止。稱號與 trueKills 在同一正式 settlement／atomic save 中處理。

舊資料補正：
- 銀河：已取得對應印記者，normalizer補稱號。
- 宇宙：對應災厄 `trueKills>=1` 者，normalizer補稱號；先依 `calamityId` 找 row，找不到才 fallback 舊 index。
- 鏡像：依 history `bestWins` 補15～20勝稱號。
- 補發舊資料只修 `unlocked`，**不製造 pending notice 洗版**。
- 稱號存檔保存 ID，不保存顯示名稱；日後只改名稱時不需要 save migration。

鏡像6稱號：
- 15勝：幸運眷顧
- 16勝：天選之刻
- 17勝：逆命者
- 18勝：傳說之日
- 19勝：距神一步
- 20勝：神蹟

## 6.4 稱號角色穿戴／取得通知／GM預覽

- 角色介面直接使用完整 `getUnlockedPlayerTitleDefinitions()`；26個稱號都走同一 `equipPlayerTitle()`／`state.titles.equipped`，可裝備、替換、卸下。
- 裝備後稱號顯示在玩家名稱前方，正式 renderer 為 `playerIdentityNameHtml()`。
- 取得通知已區分銀河災厄／宇宙災厄／鏡像來源。
- GM「稱號預覽」正式 owner：`playertitlegmpreview.js`，目前版本 V5；完整26個，分銀河10／宇宙10／鏡像6三區，直接走正式 `playerIdentityNameHtml()`。
- GM稱號預覽只做視覺，不解鎖、不裝備、不改正式 state、不寫存檔。

---

# 7. 稱號視覺架構（重要，2026-09-24 最新）

視覺位階原則：**銀河＝華麗；宇宙＝宏大／宇宙法則顯現；鏡像＝不可能／現實異常**，整體順序固定：
`銀河1～10 < 宇宙1～10 < 鏡像15～20`。

- 銀河現有1～10視覺已接受，**不要因鏡像維護去改銀河**。
- 宇宙1～10視覺已接受，使用 `player-title--universe-calamity-*`；**不要因鏡像維護去改宇宙**。
- 宇宙視覺正式檔目前仍是 `playertitlesera.css`；其宇宙規則不要動，除非使用者明確要求。

## 7.1 Mirror V3：目前唯一 active owner

2026-09-24 因 iPhone Safari 上鏡像稱號出現矩形／底板感，已停止以多層 override 疊加修補，重構成獨立 active class：

- renderer 現在只輸出 `player-title--mirror-v3` + `player-title--mirror-v3-15..20`。
- 唯一 active CSS owner：`playertitlesmirror.css`。
- `playertitlesmirrorseal.css` 已正式刪除，不再載入。
- Mirror V3 三層職責：
  1. 主元素＝稱號文字本體／漸層／階級字級。
  2. `::before`＝純文字 clone，只用 `color / opacity / transform`；**不使用 background-image / background-clip:text**，避免 Safari 把 pseudo-element 背景畫成矩形底板。
  3. `::after`＝外圍異象（粒子、斜線、光軌、空間異常），不當文字底板。
- `PLAYER_TITLE_MIRROR_RENDERER_VERSION=3`。
- `index.html` 現載入 `playertitlesmirror.css?v=20260924-mirror-v3-owner1` 並標記 `data-player-title-mirror-owner="3"`。

**重要：目前 V3 已通過 Runtime Integrity #279，但尚待使用者用 iPhone Safari 實機確認「矩形底板」是否完全消失。** 下一個對話先問／等使用者實機結果，不要自動再改。

## 7.2 目前仍存在的 dead Mirror CSS（短期待清理）

為了這次重構不碰已接受的銀河／宇宙視覺，`playertitles.css` 與 `playertitlesera.css` 內仍保留舊 `player-title--mirror*` 規則；因 renderer 已不再輸出舊 class，這些規則目前是 **dead code，不會套用到正式鏡像稱號**。

若使用者確認 Mirror V3 實機正常，下一步建議：
1. 只刪除 `playertitles.css` 內舊 Mirror V1 規則／keyframes。
2. 只刪除 `playertitlesera.css` 內舊 Mirror V2 規則／keyframes。
3. **銀河 tier 1～10 與宇宙 calamity 1～10 active CSS 必須原樣保留，不順手重寫。**
4. 清理後重新 fetch 比對，確認 active Galaxy／Universe rule 未變；更新 `index.html` cache-bust；跑 Runtime Integrity。

Mirror 15～20 的最終階級細修（字色／殘影／異象層次）只有在使用者確認 V3 無底板後且明確要求時才做；不要先自行改。

---

# 8. 特殊怪

雙紀元共用同一組9個 ID，不建立第二套系統。

- 遭遇率8%；VIP6 +2%；VIP10 有10%第二次特殊獎勵。
- 宇宙使用正式 second-world EXP／暗物質／裝備 builder；不直接 +1 暗能量。
- world2 特殊怪失敗走正式宇宙死亡懲罰。
- 黑市 pending chain 共用。
- GM weak-slot 必須使用 explicit 測試裝備 context，不讀正式裝備。

---

# 9. 副本

## 9.1 懸賞 V2

第二世界懸賞已完成並定案；除非使用者明確重開平衡，不主動微調。shared daily bounty limit 20；失敗不套主線 world2 death penalty；無直接暗能量。

2026-09-24 已正式拆分銀河／宇宙懸賞怪名稱池，**只改名稱，不改難度、獎勵或公式**。

銀河：
- 普通：武裝逃逸者、非法改裝兵、黑市護衛、走私突擊手、失控安保機
- 高級：裝甲追緝犯、戰區破壞手、非法火力平台、禁區滲透指揮、深空走私艦長
- 危險：都市級威脅體、殲滅協議載體、戰爭失控核心、軌道破壞平台、深空封鎖母艦

宇宙：
- 普通：界航偷渡者、星群私兵、暗域護運隊、跨域劫運兵、漂流戰械
- 高級：星路私掠者、界域破航兵、暗物質武裝艇、星群滲透官、跨域走私艦主
- 危險：萬域私戰艦、跨域劫掠主機、戰線叛離主機、星路封鎖要塞、跨域掠奪母艦

`buildBountyEnemy()` 先決定 world，再選對應 pool。懸賞名稱不是正式 save state，因此這次名稱變更**不需要舊存檔 migration**。

`bountynameintegrity.js` 會直接透過正式 test API 驗證：兩世界各3×5、每組5個不同名稱、同紀元15名互不重複、兩紀元無交集。結果由 `runtimeintegrityaddon.js` 併入 Runtime report。

## 9.2 競技場 Arena V2

正式 state：`state.dungeon.arenaByWorld={1:{...},2:{...}}`，兩世界獨立。`dungeon.arena` 只保留 compatibility alias。

宇宙10 Rank；正式評估固定500場，至少485/500=97%。解鎖下一 Rank 雙條件：目前最高 Rank 評估≥97% + 下一競技場所屬主線區域已解鎖。

宇宙 Rank Curve V2：
```text
x=Rank-1
HP   = 1.68 + .05x - .0015x²
傷害 = 1.52 + .04x - .001x²
DEF  = 1.11 + .022x - .0004x²
```
宇宙 Arena 敵方 HP 乘同一文明倍率作耐久補償；銀河 curve 不動。

**Arena V2 實機驗收已由使用者取消，不再列為待辦。除非使用者日後主動重開，禁止再次把 Rank1～3 各500次驗收列入後續工作。**

## 9.3 虛空／鏡像

- 虛空維持無限；宇宙角色文明 final damage 生效。
- 鏡像正式每次20戰；VIP points=`20*wins²`；宇宙文明倍率納入 snapshot 且雙方對稱。

---

# 10. 銀河回顧系統

宇宙紀元可回顧銀河冒險100地圖、文明災厄10隻與戰線紀錄。

- 回顧戰：單場、零收益、零損失、零正式進度／紀錄影響；正式 HP 戰後還原。
- 回顧 selection 與正式銀河 selection 分離。
- 同一頁面 session 內保留回顧選擇；整理／重開網頁才回預設宇宙紀元。
- `galaxyreviewintegrity.js` 提供正式 state safety guard。
- 宇宙冒險／銀河回顧共用頁面 header 已整理：返回左、標題真置中、背包單一右側；Boss卡重複背包按鈕已移除，正式走 `openAdventureInventory()`。

---

# 11. 正式劇情系統

- 銀河正式劇情：101 篇（序章1 + 100 Boss）。
- 宇宙正式劇情：100/100 全部完成，10 區／100 Boss／100 個唯一 story ID。
- 全專案正式目標：201 篇。
- 宇宙 Registry 正式 owner：`secondworldstoryregistry.js`。
- 銀河與宇宙共用 `CIVILIZATION_STORIES`、`storyProgress`、正式劇情視窗、戰線紀錄與 GM 劇情測試架構。
- 宇宙首殺只有 `result.ok && result.firstKill===true` 才 queue 正式劇情。
- 戰線紀錄宇宙進入後預設宇宙紀元，可切銀河回顧。
- GM劇情測試預設紀元現在依 `isSecondWorldEntered()` 決定：未進宇宙預設銀河、已進宇宙預設宇宙；手動切換在同頁 session 內保留，重新整理才回預設。

篇幅硬規格：
- 序章12頁，90～155字／頁，至少3 block。
- 一般 Boss 11頁，90～120字／頁，至少2 block。
- 區域最終 Boss 15頁，120～155字／頁，至少3 block。
- 紀元最終 Boss 31頁，90～155字／頁，至少3 block。

canonical 劇情規則：`STORY_WRITING_RULES.md`；宇宙專屬補充：`STORY_UNIVERSE_RULES.md`；銀河世界觀：`STORY_BIBLE.md`。

Source Purity／Meta Language／Story Integrity 均為正式 CI；`set -o pipefail` 不得移除。

---

# 12. Dungeon UI／近期架構整理

`dungeonui.js` 是副本首頁／共用延伸正式 owner。已完成副本狀態 world-aware EXP／資源、宇宙懸賞與競技場文案、鏡像首頁卡 ownership、Arena world／region／progress／assessment canonical 化。

核心原則：**正式 owner 優先；移除重複推導；compatibility 只保留必要 alias；不新增第二套公式／state／settlement／Registry。**

---

# 13. GM 正式架構

Manage：資料管理 → 背景戰鬥 → 戰鬥速度 → 角色 → 專精 → 強化 → 印記 → 文明等級 → 副本。

Test 頂層：`player-ability-test`、`power-benchmark-test`、`player-title-preview`、`gm-story-test`。

共用 GM 測試角色可獨立設定：紀元、等級、同級5件神話／同步正式裝備、VIP、8專精、5強化、10印記、文明等級。

Session-only：同頁切 GM 區塊後設定與已跑結果保留；browser reload／重新進網頁才重置；不寫正式 save、不寫 localStorage。

GM 戰力基準正式 owner `gmpowerbenchmark.js`，固定7模式：地圖怪、特殊怪、懸賞、競技場、虛空幻境、鏡像戰、文明災厄。

GM 原則：不暫改 `state.secondWorld.entered`；不複製正式公式；使用正式 owner + explicit test context；不得污染 formal state/save。

近期稱號／災厄相關 GM 注意：
- 舊 `calamitygm.js` 16稱號 preview owner 已退休；不要加回。
- `playertitlegmpreview.js` 是26稱號唯一 GM preview owner。
- GM直接改文明等級不會偽造災厄 trueKills；若某宇宙災厄因 GM 文明等級已被視為完成但從未真正擊殺，第一次真實勝利仍可拿首殺稱號。

---

# 14. 雙紀元介面／遊戲說明語意總掃描（完成）

已完成三批：

1. **遊戲說明／共用規則**：修正 `gameguide.js` 中宇宙離線收益、強化石清空、宇宙背包／贖回、宇宙自動出售、Lv.1000 滿等 EXP 等語意；遊戲說明已 world-aware。
2. **玩家正式 UI**：角色、背包、強化、副本、特殊遭遇、宇宙主線、災厄、回顧戰、結算等均重新掃描；共用首頁標語依紀元顯示，副本入口補上鏡像戰。`playersemanticsui.js` 只負責共用玩家 UI 語意顯示，不接管任何戰鬥／資源／存檔公式。
3. **GM／漏網字串／全域回歸**：GM 顯示文字已確認沒有把宇宙正式規則錯寫成銀河規則；高風險字串逐項判斷，銀河限定的「金幣／強化石／普通怪／菁英／Lv.500」保留，跨紀元錯誤語意已清理。

此總掃描現視為**完成**，不再列為待辦。除非使用者日後發現具體錯字／錯誤畫面或主動要求重新掃描，否則不要再次把它列入後續工作。

---

# 15. Integrity／維護流程（2026-09-24 最新）

`.github/workflows/runtime-integrity.yml`：
- 有 stale-head guard。
- 只有當下最新 main HEAD 的 Runtime Integrity `success` 才能宣告功能修改完成。
- `queued`／`in_progress` 不算完成；`failure` 必須先讀 log 修正。
- Runtime command 已使用 `set -o pipefail`。

`.github/workflows/story-integrity.yml`：故事資料／UI／規則／tests／相關 owner 修改時觸發；Story 修改必須同步確認 Story Integrity。

`DEVELOPMENT_PROTOCOL.md` 為正式維護規範：修改前重讀 main；修改後重新 fetch；玩家端 JS/CSS 改動同步 `index.html` cache-bust；本批紅燈不能靠下一批無關 commit 掩過。

近期新增／收斂的 Integrity：
- `playertitleintegrity.js` 已改成直接檢查單一26稱號 canonical catalog，不再驗證舊16 catalog。
- `playertitlegmpreviewintegrity.js` 檢查 GM 26稱號 preview、正式 renderer、且不得污染正式 state/save。
- `playertitleuniverseintegrity.js` 目前 V2：檢查宇宙 renderer、Mirror renderer V3、唯一 `playertitlesmirror.css` active owner、舊 seal 不得載入。
- `secondworldcalamityintegrity.js` 驗證 calamityId normalization、GM文明等級提前完成但0擊殺的真正首殺行為、30擊殺／殘血／完成重打語意。
- `bountynameintegrity.js` 驗證雙紀元懸賞名稱池；`runtimeintegrityaddon.js` 將其併入 `PROJECT_RUNTIME_REPORT`。
- `runtimeintegrity.js` 已把26稱號、宇宙稱號 API、GM預覽與 Universe/Mirror visual integrity 納入核心要求。

---

# 16. 目前已完成的大型功能

銀河完整主線與成長；宇宙世界突破；Lv.501～1000 progression/EXP；100 Boss 宇宙主線；world2 裝備／sale／死亡／贖回；宇宙離線收益；+21～+40；文明0～10；雙紀元特殊怪；兩世界災厄；26稱號 canonical catalog；宇宙災厄首殺稱號；角色統一稱號穿戴；GM 26稱號實戰預覽；宇宙稱號法則視覺；Mirror V3獨立 active owner；第二世界懸賞V2；雙紀元懸賞名稱池；第二世界競技場與Rank Curve V2；Arena world-aware owner；虛空／鏡像；銀河冒險／災厄／戰線紀錄回顧；宇宙冒險／回顧共用 header；GM管理與角色 sandbox；GM七模式戰力基準；session-only 測試設定；save isolation；Runtime Integrity stale-head guard；宇宙10區／100 Boss故事 Registry；宇宙100/100正式故事；宇宙首殺正式故事 hook；雙紀元戰線紀錄與GM劇情測試；Source Purity／Meta Language／Story Integrity CI；跨紀元 canonical 劇情規則；雙紀元介面／遊戲說明語意總掃描；`DEVELOPMENT_PROTOCOL.md`。

---

# 17. 尚未完成／後續項目

目前已取消、且**不得再自行列回待辦**：
- Arena V2 Rank1～3 各500次實機驗收。
- 宇宙主線中後期 `STEP_RATE=.015` 平衡驗證。
- Cloud Save 真實跨裝置驗證。

已完成、不再列為待辦：
- 全介面＋遊戲說明雙紀元語意總掃描。
- 16→26稱號 catalog 收斂。
- 宇宙災厄首殺稱號、角色穿戴、GM 26稱號預覽。
- 懸賞雙紀元名稱池與 Integrity。
- Mirror seal override 已退休；目前 active owner 已改為 V3獨立 class/CSS。

## 17.1 下一個對話近期優先處理

1. **先等使用者實機確認 Mirror V3。** 目前最後一個使用者回報前已把鏡像改成 V3單一 active owner；下一步不是直接再改，而是確認 iPhone Safari 的 15～20勝（尤其17、19）是否已沒有矩形／底板。
2. **若使用者確認正常，再做 dead CSS 純清潔。** 只移除 `playertitles.css` 的舊 Mirror V1 與 `playertitlesera.css` 的舊 Mirror V2 規則／keyframes；銀河與宇宙 active CSS 不可改。清理後更新 cache-bust、重新 fetch 比對、Runtime Integrity success。
3. **Mirror 15～20 視覺細修不是自動待辦。** 只有使用者看完 V3 並明確要求，才再調階級差異；不可碰銀河／宇宙稱號視覺。

## 17.2 大型未完成方向

- **第三紀元尚未設計／實作**：已有 canonical 劇情規則與建立流程，但尚未定核心命題、總篇數、區域、結果矩陣、Registry、數值系統或 runtime；不要自行假設第三紀元內容。

除非使用者主動提出新需求，**不要自行創造新的驗收／平衡／跨裝置待辦。**

---

# 18. 正式 owner 速查

- 基礎世界／品質：`data.js`
- 核心 state／銀河：`engine.js`
- migration/load：`savemigration.js`
- 世界階段：`worldphase.js`
- 等級：`levelprogression.js`；滿等語意：`levelcap.js`
- 銀河戰鬥：`battlepipeline.js`
- 文明倍率：`civilizationcore.js`
- Offline：`offlineprogress.js` / `offlinefarmtarget.js`
- 冒險／回顧：`worldmapui.js` + `ui.js`；回顧 guard：`galaxyreviewintegrity.js`
- 專精：`specialization.js`；VIP：`vipprogression.js`；強化：`enhancementcore.js`
- 裝備 mutation/sale：`equipmentlock.js`
- 特殊怪：`specialmonsters.js` / `specialcore.js` / `specialencounter.js`
- 宇宙資料：`secondworlddata.js`；主線：`secondworldmainline.js`；combat：`secondworldcombat.js`；reward：`secondworldrewards.js`
- 銀河災厄：`calamityconfig.js` / `calamitystate.js` / `calamitycore.js` / `calamityrun.js` / `calamityui.js`
- 印記：`markcore.js`
- 宇宙災厄：`secondworldcalamity.js` / `secondworldcalamityrun.js`
- 稱號 canonical state/catalog：`playertitlecore.js`
- 稱號 renderer：`playertitlerenderer.js`；角色／取得通知 UI：`playertitleui.js`
- 銀河稱號 active CSS：`playertitles.css`
- 宇宙稱號 active CSS：`playertitlesera.css`
- Mirror V3唯一 active CSS：`playertitlesmirror.css`
- GM稱號預覽：`playertitlegmpreview.js`
- 副本 UI：`dungeonui.js`；副本進度／Arena state：`dungeonprogress.js`
- 懸賞：`dungeonbounty.js`；懸賞名稱 Integrity：`bountynameintegrity.js`
- 競技：`dungeonarena.js`；assessment：`arenapositioncore.js`；window：`arenawindowcore.js`
- 鏡像：`mirrorconfig.js` / `mirrordungeonstate.js` / `mirrordungeonrun.js` / `mirrordungeonui.js`
- Story progress：`storyprogress.js`；UI：`storyui.js`；戰線紀錄：`storyrecordtabs.js`
- 宇宙 Registry：`secondworldstoryregistry.js`；宇宙 storydata：`storydata-universe-*.js`
- Story 格式 owner：`storyintegrity.js`
- GM Story：`gmstorytest.js`
- GM Hub：`gmhub.js` / `gmhubextensions.js`；戰力基準：`gmpowerbenchmark.js`
- Runtime：`runtimeintegrity.js` + `runtimeintegrityaddon.js` + `tests/runtime/js-integrity.js`；Final：`finalintegrity.js`
- 維護規範：`DEVELOPMENT_PROTOCOL.md`
- load order / cache-bust：`index.html`

---

# 19. 下一個 ChatGPT 必須遵守的操作規範

1. **GitHub `main` 實際程式碼是唯一真實來源。** HANDOFF 只作摘要；工作前重新讀 main。
2. 修改前先讀相關正式 owner、直接相依、Integrity/workflow 與 `index.html`。
3. 使用者說「先討論／先查／先看／先檢查／先列出／先不要修改」時，**不得寫 GitHub**。
4. 使用者說「做／修改／執行／修正／第 N 批」時，可直接修改 GitHub `main`。
5. **優先修改正式來源。** 不用 wrapper/fallback 掩蓋 owner 問題；不新增第二套 state、第二套公式、第二套 settlement、第二套 Registry、第二套 title catalog 或 sample story。
6. 遇到舊 owner／過渡碼問題，優先退休舊正式來源並收斂成一個 owner；不要持續新增 override／seal／wrapper 疊加。
7. GM 不複製正式公式；使用正式 owner + explicit test context，且不得污染正式 save。
8. 修改後重新 fetch 最新 `main` 自我檢查，不能只相信 update API。
9. JS 至少做 parser/syntax，再做範圍相符的 functional/static probe。
10. **玩家端 JS/CSS 改動必須同步更新 `index.html` cache-bust。** 新 script／stylesheet 同時確認 load order。
11. 最新 main HEAD Runtime Integrity 必須 success 才能宣告功能修改完成；queued/in_progress 不算，failure 必須先修。
12. Story 修改同步確認 Story Integrity。
13. Save Write Guard V1 不可破壞。
14. 不自行重構舊存檔，除非使用者明確要求或有可重現 production bug；名稱類變更若 ID／state shape 不變通常不需要 migration。
15. 一批只做核准範圍，不順手改 balance、故事、schema 或其他功能。
16. 已退休 API／CSS owner 不為相容而加回 wrapper。
17. 同時遵守 `DEVELOPMENT_PROTOCOL.md`。

---

# 20. 下一個對話如何接手

標準指令：

> 讀取 GitHub `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`、`DEVELOPMENT_PROTOCOL.md`；若工作涉及正式劇情，再同時讀 `STORY_WRITING_RULES.md`。之後重新檢查目前 `main` 的實際程式碼、正式 owner、直接相依、Integrity workflow 與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> **GitHub `main` 是唯一真實來源，HANDOFF 只作摘要。**  
> 修改前先讀相關正式 owner；修改後重新 fetch 最新 `main` 自我檢查。玩家端 JS/CSS 有改動時同步更新 `index.html` cache-bust，並確認最新 main HEAD 的 Runtime Integrity 最終為 success。  
> 我說「先討論／先查／先看／先檢查／先列出／先不要修改」時不得寫 GitHub；我說「做／修改／執行／修正／第 N 批」時可直接修改 GitHub `main`。優先修改正式來源，不要用 wrapper、fallback、seal 或第二套公式／state／catalog 掩蓋 owner 問題。  
> 目前宇宙主線 Boss 基準為 `BASE_STAT=2700`、`HP:ATK:DEF=12:2:1`、`STEP_RATE=.015`；懸賞 V2 已定案，並已拆銀河／宇宙名稱池；宇宙競技場使用 Rank Curve V2；雙紀元介面／遊戲說明語意總掃描已完成。  
> 正式稱號現在是26個單一 canonical catalog：銀河災厄10＋宇宙災厄10＋鏡像6。宇宙災厄首次真正擊殺即可取得對應稱號，角色頁可穿戴，GM可預覽完整26稱號。  
> Mirror稱號目前已重構為 `playertitlesmirror.css` V3單一 active owner，renderer只輸出 `player-title--mirror-v3*`；舊 `playertitlesmirrorseal.css` 已刪除。下一步先等我確認 iPhone Safari 實機是否已沒有矩形底板；若確認正常，再只清掉 `playertitles.css`／`playertitlesera.css` 內不再生效的舊 Mirror dead CSS，銀河／宇宙 active CSS不要動。  
> Arena V2 額外實機驗收、宇宙主線中後期平衡驗證、Cloud Save 跨裝置驗證均已由使用者取消，不得自行再列成待辦。大型未完成方向只有第三紀元尚未設計；不要自行假設內容或建立新待辦。  
> 現在先不要修改任何功能；先確認最新 main，再等我的下一個指令。