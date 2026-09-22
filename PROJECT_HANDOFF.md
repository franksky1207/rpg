# 《文明戰線》PROJECT HANDOFF
更新日期：2026-09-22  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本文件是交接摘要，不得凌駕於程式碼。若本文件與 `main` 衝突，一律以 `main` 為準，先重新讀取正式 owner 再判斷。

---

# 1. 專案定位

《文明戰線》是純前端網頁文字／數值養成／科幻星際 RPG，支援桌機與手機。

核心：
- **銀河紀元（第一世界）**：Lv.1～500，10 大區、100 張地圖、普通／菁英／Boss。
- **宇宙紀元（第二世界）**：Lv.501～1000，10 大區、100 隻主線 Boss，沒有第一世界的「每圖 5 怪」結構。
- VIP、8 項專精、裝備／強化、印記、稱號。
- 懸賞、競技場、鏡像、虛空、文明災厄。
- 離線收益、GM-only 背景戰鬥、手動 Cloud Save。
- 故事／戰線紀錄、GM 管理／測試／戰力基準。

正式存檔：
- key：`frank_text_rpg_save`
- `SAVE_VERSION = 13`
- `SAVE_SCHEMA_VERSION = 14`
- `SAVE_LOAD_PIPELINE_VERSION = 2`

等級：
- 舊常數 `MAX_LEVEL = 500` **只保留為銀河紀元 legacy constant，不代表全遊戲最高等級**。
- 正式 effective cap 由 `levelprogression.js` 決定：
  - 未進宇宙紀元：Lv.500
  - 已進宇宙紀元：Lv.1000
  - absolute max：1000

正式世界階段：
- 唯一永久旗標：`secondWorld.entered`
- 不使用 `currentWorld` 或第二套 save。

---

# 2. 世界與主線結構

## 銀河紀元

正式 owner：`data.js` + `worldmaps-*.js`。

10 區／100 張地圖：
1. 地球戰爭 Lv.1～50
2. 太陽系戰爭 Lv.51～100
3. 近星戰爭 Lv.101～150
4. 星際邊疆 Lv.151～200
5. 獵戶臂戰爭 Lv.201～250
6. 銀河邊境 Lv.251～300
7. 銀河中域 Lv.301～350
8. 銀河核心外圍 Lv.351～400
9. 銀河核心戰爭 Lv.401～450
10. 銀河統合戰爭 Lv.451～500

每區 10 張地圖，每圖 5 級範圍，每圖 5 隻怪。地圖 index 固定註冊，不能靠 push/splice 或 script 載入順序。

## 宇宙紀元

正式 owner：`secondworlddata.js`。
- 10 大區、100 Boss。
- Boss 等級：505、510、…、1000。
- 每區 10 Boss，**沒有小地圖層**。
- Boss 解鎖：玩家等級 ≥ Boss 等級 - 5，且前一 Boss 已完成；第 1 Boss 只需已正式進入宇宙紀元。
- 10 區：
  1. 銀河彼端
  2. 本星系群戰爭
  3. 星群邊疆
  4. 群星會戰
  5. 超域邊境
  6. 萬域戰線
  7. 宇宙纖維帶
  8. 星海巨牆
  9. 宇宙深域
  10. 宇宙統合戰爭

玩家正式進入宇宙紀元後，主成長永久使用宇宙紀元規則；銀河紀元只允許回顧／封存用途，後續各頁回顧規則仍需逐頁完成。

---

# 3. 主線成長、戰鬥與經濟公式

## 銀河紀元 EXP

`engine.js` legacy owner：

```js
sameExp(l) = ceil(25 + 4*l)
expProgressionFactor(l) = 5 + 495 * (1 - exp(-(l-1)/142))
expNeed(l) = ceil(sameExp(l) * expProgressionFactor(l))
```

怪物等級差 EXP multiplier：
- 怪高玩家 ≥5：1.3
- +3～+4：1.2
- +1～+2：1.1
- 同級：1
- 低 1～2：0.9
- 低 3～5：0.6
- 低 6～10：0.25
- 更低：0.05

類型倍率：普通 1／菁英 2／Boss 5。

## 宇宙紀元玩家 EXP

正式 owner：`levelprogression.js`。
- Lv.1～499：沿用銀河紀元曲線。
- 已進宇宙紀元後，Lv.500～999：
  ```js
  expNeed(L) = ceil((25 + 4*L) * 250)
  ```
- Lv.1000：EXP 固定 0。
- `gainExp()/expNeed()/clampGameLevel()` 已由世界感知 owner 接管。

## 宇宙紀元 Boss

正式 owner：`secondworldcombat.js`。

Boss index `N = 0..99`：
```js
multiplier = 1 + N * 0.015
HP  = 36000 * multiplier
ATK = 6000  * multiplier
DEF = 3000  * multiplier
```

端點：
- Lv.505：36,000 / 6,000 / 3,000
- Lv.1000：89,460 / 14,910 / 7,455

Boss 全部 `kind="boss"`，traits 沿用正式 `traits.js` Boss 機率與 `runCombatCore()`，不另造第二套 combat formula。

## 宇宙紀元主線獎勵

正式 owner：`secondworldrewards.js`。
- EXP：`sameExp(BossLevel) × expLevelFactor(BossLevel, playerLevel)`，**不套銀河 Boss ×5**，再套實戰訓練。
- 暗物質：
  ```js
  base = 20 + 2 * BossIndex
  ```
  再套搜刮技巧。
- 每次主線 Boss 勝利：+1 暗能量。
- 每次勝利固定 1 件 world2 裝備。
- 不給金幣、基礎石、進階石，不觸發銀河特殊遭遇／黑市。

## 死亡／贖回

宇宙紀元：
- EXP 懲罰：目前 effective `expNeed` 的 10%。
- 30% 機率遺失 1 件穿戴裝備。
- VIP20 保護裝備不遺失。
- world2 裝備：贖回成本 = 正式 world2 售價 ×10，使用暗物質。
- **world1 銀河裝備若在宇宙紀元死亡遺失：免費贖回，不再使用金幣。**
- 舊 `redemptionPending/pending` 會 normalization 成 `cost:0 / currency:"free"`。

銀河紀元 legacy death/buy×2 規則只屬第一世界正式流程；不得拿去處理宇宙紀元裝備。

---

# 4. 裝備與出售

品質共 6 階：普通／優良／稀有／史詩／傳說／神話。品質倍率正式 owner 仍是 `data.js -> QUALITY`。

## 銀河紀元
- 正式掉裝／主屬性／詞綴 owner 保持既有 `engine.js` 與裝備 core。
- 普通／菁英／Boss 舊掉落規則不變。

## 宇宙紀元
正式 owner：`secondworldrewards.js`。
- 每 Boss 有 5 件專屬命名，100 Boss 共 500 件。
- 每次主線 Boss 勝利固定 1 件。
- 品質：優良 45%／稀有 35%／史詩 15%／傳說 4.5%／神話 0.5%；普通 0%。
- 裝備等級：`min(playerLevel, bossLevel)`。
- 沿用現有主屬性／詞綴線性公式到 Lv.1000。
- 內部用 `item.world=1/2` 區分來源與經濟。

## 統一 sale owner

正式 API：
- `equipmentSaleQuote()`
- `equipmentSaleBatchQuote()`
- `settleEquipmentSale()`
- `settleEquipmentSaleBatch()`
- `equipmentSaleText()`

宇宙紀元出售：
- world1 裝備收益固定 0。
- world2 售價基準：
  ```js
  N = floor((equipmentLevel - 500) / 5)
  B = 20 + 2*N
  saleDM = ceil(B * qualityMultiplier * appraisalMultiplier)
  ```
- 品質倍率：普通 .10／優良 .15／稀有 .25／史詩 .40／傳說 .70／神話 1.00。
- 神話出售額外 +1 暗能量；鑑價只放大暗物質，不放大暗能量。
- 單賣、批量出售、自動出售、換裝後舊裝整理、戰鬥掉裝、離線裝備出售全部必須走同一 owner。

玩家 UI 永久規則：
- **不要顯示「來源：銀河紀元／宇宙紀元」文字。**
- `item.world` 只做內部辨識。早期只會有少數銀河裝備過渡，玩家介面不需要暴露來源世界。
- `PLAYER_EQUIPMENT_WORLD_SOURCE_UI_HIDDEN_VERSION = 1`。

---

# 5. VIP

正式：
- `VIP_MAX_LEVEL = 20`
- `VIP_PROGRESSION_VERSION = 13`
- `VIP_THRESHOLD_BASE = 1000`

升級門檻：
```js
VIP threshold(level) = 1000 * level^2
VIP level = floor(sqrt(vipPoints / 1000))
```

例如：
- VIP5：25,000
- VIP6：36,000
- VIP20：400,000

副本 VIP point multiplier：
- VIP 0～3：×1.00
- VIP 4～11：×1.10
- VIP 12～20：×1.20

`engine.js` 正式戰鬥加成：
- HP / ATK：每級 +0.5%
- DEF：每級 +0.25%
- 暴擊／閃避：每級 +0.25 個百分點

正式 owner：
- 門檻／等級：`vipprogression.js`
- 戰鬥能力加成：`engine.js -> vipBonusStats()`

不要另造第二套 VIP 公式。

---

# 6. 專精

`SPECIALIZATION_MAX_LEVEL = 60`

8 項：
- 實戰訓練 training：每級 EXP +2.5%
- 搜刮技巧 scavenge：每級怪物金幣 +2.5%
- 鑑價技巧 appraisal：每級裝備售價 +2.5%
- 先制技巧 initiative：每級第一擊傷害 +1%
- 連擊技巧 combo：每級連擊率 +0.5%；追加攻擊 50% 傷害
- 穿透技巧 penetration：每級穿透率 +0.5%；觸發忽略 25% DEF
- 反擊技巧 counter：每級反擊率 +0.5%；反擊 40% 傷害
- 汲取技巧 drain：每級觸發率 +0.5%；回復實際傷害 10%

升級費：
```js
1000 * targetLevel^2
```

正式資料 owner：`specialization.js`。

---

# 7. 裝備強化

正式世界範圍：
- 銀河紀元：+0～+20。
- 宇宙紀元：正式玩家 +20～+40。
- `ENHANCEMENT_MAX_LEVEL = 20` 只保留第一世界／legacy 相容語意。
- `ENHANCEMENT_ABSOLUTE_MAX_LEVEL = 40`。
- `FIRST_WORLD_ENHANCEMENT_CAP = 20`。
- `SECOND_WORLD_ENHANCEMENT_MIN = 20`。
- `SECOND_WORLD_ENHANCEMENT_CAP = 40`。
- `SECOND_WORLD_ENHANCEMENT_EXTENSION_ACTIVE = true`。
- 每級主屬性 +2.5%；+40 = 主屬性 +100%。

倍率：
```js
1 + level * 2.5%
```

銀河 +1～+20 升到目標等級 N 的成本：
- 基礎強化石：`50 * N`
- 進階強化石：`5 * N`

宇宙 +21～+40：
```js
K = targetLevel - 21
darkMatter = 30000 + 12000 * K
darkEnergy = 300 + 10 * K
```
- 純資源制；不綁玩家等級、區域或 Boss 進度。
- 單欄 +20→+40：暗物質 2,880,000、暗能量 7,900。
- 五欄全滿：暗物質 14,400,000、暗能量 39,500。
- 正式玩家宇宙紀元若出現 <+20 屬資料異常；normalization 不會免費補到 +20，而由 Integrity / GM 檢查處理。
- GM 正式管理：銀河 0～20、宇宙 20～40。
- GM 沙盒測試：固定 0～40。
- 玩家宇宙高階強化採 snapshot → 扣資源 → 升級 → save；save 失敗整次 rollback。

主線強化石：
- 玩家與怪物等級差必須 < 10 才有資格。
- 普通：1 基礎石。
- 菁英：70% 1 顆、30% 2 顆基礎石。
- Boss：1 顆進階石。

出售：
- 傳說 q=4：5 基礎石。
- 神話 q=5：1 進階石。

離線戰鬥額外的直接強化石收益為正式期望值的 5%，且只給基礎石；離線出售裝備仍可依正式出售規則拿石頭。

---

# 8. 戰鬥節奏

## Combat Speed

正式 owner：`combatspeed.js`。
- 可用速度：1 / 1.5 / 2。
- 銀河紀元一般玩家：固定 1×。
- 宇宙紀元一般玩家：可選 1×／1.5×，設定寫入正式 state。
- 2×：只屬 GM override，同帳號 localStorage 持續。
- GM override 優先於玩家設定。
- 曾修正 iPhone Safari 1.5× 無法保存：原因是錯把 lexical `state` 當 `globalThis.state`；現在 `combatspeed.js` 直接存取正式 lexical state，不要改回 globalThis 判斷。

## Structured Combat Pacing

`combatfx.js` 共用正式動畫：
- opening 140ms
- impact 70ms
- step 48ms
- end 180ms
- 1.5×／2× 經 `combatSpeedScaledDelay()` 縮放。

銀河主線與宇宙主線都共用 structured presentation；宇宙前景戰鬥會顯示 effective speed。

## Outer Pacing

`combatpacing.js`：
- 所有模式 outer gap 正式統一 140ms。
- outer gap 是場間等待，不隨 structured speed 縮放。
- 不要恢復舊 220/300/350/450ms 或已刪除的 60/80ms 啟動等待。

---

# 9. 背景連戰

`backgroundprogress.js` 正式基準：

- `BACKGROUND_PROGRESS_CORE_VERSION = 1`
- `BACKGROUND_PROGRESS_SINGLE_ACTIVE_FLOW_VERSION = 1`
- `BACKGROUND_PROGRESS_VISIBILITY_OWNER_VERSION = 3`
- `BACKGROUND_PROGRESS_UI_YIELD_VERSION = 3`
- `BACKGROUND_PROGRESS_FAST_CATCH_UP_VERSION = 1`
- `BACKGROUND_PROGRESS_FAST_YIELDS_PER_PAINT = 8`

規則：
- 同時只允許一個 background flow。
- continuous 模式背景累計上限 12 小時。
- 背景時間 credit rate = 0.96。
- 回前景 catch-up 時，每 8 次 UI yield 才真正等待一次 paint boundary，其餘快速讓出 event loop。
- background credit 只加速實際逐場流程，不改戰鬥結果、不用數學近似一次結算。

目前背景系統以穩定與高速度為優先，使用者已接受現有速度。

---

# 10. 離線收益

`offlineprogress.js` 最新有效規則：

- 最短離線：1 分鐘。
- 最長計算：12 小時。
- EXP：正式戰鬥收益的 10%。
- 銀河紀元金幣：10%；宇宙紀元改為暗物質 10%。
- 裝備掉落機率：正式掉落流程的 10%。
- 銀河紀元戰鬥強化石：正式期望收益的 5%；宇宙紀元直接強化資源改為暗能量 5%。
- battle sample 實際戰鬥時間合法值：100ms～300000ms；cycle / adjusted 上限 601000ms。
- `OFFLINE_BATTLE_SAMPLE_VERSION = 3`。
- `OFFLINE_SAMPLE_SELECTION_VERSION = 2`。
- 每個正式速度最多保留 8 筆真實樣本：1× 8 筆、1.5× 8 筆、2× 8 筆。
- `OFFLINE_COMBAT_SPEED_SAMPLE_VERSION = 1`。

正式樣本只來自：
- 銀河紀元：前景主線普通／菁英，必須實際勝利；銀河 Boss 不記樣本。
- 宇宙紀元：前景正式主線 Boss 勝利；以 bossIndex / bossId 辨識，不使用 map / enemy。
- 兩個世界的背景追趕、離線結算、其他副本都不應寫正式 sample。

實戰 sample 等級差修正：
- 玩家高怪 ≤3 級：×1
- ≤6：×1.30
- ≤10：×1.60
- ≤15：×2
- >15：不產生 sample

cycle sample：
```js
cycleMs = actualMs + 主線正式場間 gap
adjustedMs = round(cycleMs * levelGapMultiplier)
```

### 2026-09-21 最新 speed-aware sample 修正

正式 owner：
- `battlepipeline.js`：記錄真實戰鬥樣本；每個速度各保留最新 8 筆。
- `savemigration.js`：V3 sample normalization，依速度各保留 8 筆。
- `offlineprogress.js`：選擇離線 target 與跨速換算。
- `finalintegrity.js`：驗證 V3、每速 8 筆與跨速換算 API。

選樣規則：
1. 優先使用「目前有效速度」下的合法樣本。
2. 同一 farm target 若目前速度沒有樣本，可使用其他速度的同目標樣本換算，不再因切換速度而完全失去離線基準。
3. 跨速換算只縮放實際戰鬥本體 `actualMs`，固定 outer gap 140ms 不縮放。
4. 例如 1× sample：actual 1400ms、cycle 1540ms，換成 2× 時正式結果為 840ms（700 + 140）。
5. 不要恢復舊的「所有速度共用最後幾筆」或舊 sample fallback。

### 宇宙紀元正式離線收益（第 11 批）

- `SECOND_WORLD_OFFLINE_SAMPLE_VERSION = 1`
- `SECOND_WORLD_OFFLINE_SETTLEMENT_VERSION = 1`
- EXP 10%、暗物質 10%、裝備 10%、暗能量 5%。
- world2 離線裝備出售共用正式 `settleEquipmentSaleBatch()`。
- 不產生金幣、第一世界強化石、特殊遭遇或主線首次擊破進度。
- 結果頁依世界切換資源與 target 文案。
- 失敗沿用既有 rollback / retry，不吞掉 pending settlement。

## checkpoint

`offlinefarmtarget.js`：
- checkpoint key：`frank_text_rpg_offline_checkpoint`
- 60 秒 heartbeat。
- pagehide / beforeunload / unload / pageshow 會處理 checkpoint。
- `OFFLINE_CHECKPOINT_RECOVERY_VERSION = 1`

此機制是為了避免 foreground 已玩過的時間被重新算成離線時間。

---

# 11. 帳號與雲端存檔

## Supabase Auth

- `CIVILIZATION_AUTH_VERSION = 6`
- Auth required = true
- 支援登入、建立帳號、忘記密碼、密碼重設。
- session 使用 persistSession + autoRefreshToken + detectSessionInUrl。

## Cloud Save

- `CIVILIZATION_CLOUD_SAVE_VERSION = 2`
- table：`game_saves`

**雲端存檔是手動傳輸，不是自動同步。**

使用者必須自己按：
- 上傳本機存檔
- 下載雲端存檔

UI 會比較：
- 本機存檔時間／等級／EXP
- 雲端存檔時間／等級／EXP

若本機 metadata 顯示屬於另一帳號：
- 禁止直接上傳，避免誤覆蓋。
- 仍允許下載目前登入帳號的雲端存檔。

下載雲端：
- 先 normalize。
- 呼叫 `markSaveLoadResolved("cloud-download")`。
- 寫入本機。
- 重設離線計時基準，避免把跨裝置傳輸時間當離線收益。

---

# 12. 本機存檔防覆寫事故與修正

曾發生一個非常重要的 production incident：

- 稱號系統上線期間，部分 JS 被字串替換寫入字面 `\n`，造成 `Invalid or unexpected token`。
- 頁面外框正常但 `#main` 空白。
- 更危險的是，載入失敗時新 Lv.1 state 曾可能覆蓋舊 localStorage。

目前正式修正：

## Local Save Write Guard V1

`engine.js`：
- `SAVE_WRITE_GUARD_VERSION = 1`
- 啟動時記錄 localStorage 是否已有正式 save。
- 若 boot 時已有 save，在 load 尚未成功 resolve 前，正式 `save()` 禁止覆寫。

`savemigration.js`：
- JSON parse 失敗、root 非物件、migration/finalize 失敗：load 回 false。
- 使用暫時 state 顯示，但不解除正式寫入鎖。
- 完整成功 load 後才 `markSaveLoadResolved("local-load")`。

`cloudsave.js`：
- 合法雲端下載可 `markSaveLoadResolved("cloud-download")`。

**後續只要改 JS，完成後必須重新抓 main 的實際 JS，至少用 parser / `new Function(content)` 驗證所有改動 JS。**

---

# 13. 文明災厄

## Config / State

`calamityconfig.js`：
- `CIVILIZATION_CALAMITY_CONFIG_VERSION = 2`
- 同時是災厄本身與災厄稱號 metadata 的正式 owner。

`calamitystate.js`：
- `CALAMITY_STATE_VERSION = 1`
- `CALAMITY_BALANCE_VERSION = 3`
- `CALAMITY_HP_PER_LEVEL = 500000`

正式 HP：
```js
災厄最大 HP = 500000 * 災厄階級
```

所以 10 階為：
- 50 萬
- 100 萬
- ...
- 500 萬

`calamitycore.js`：
- ATK = 對應主線 Boss ×1.10
- DEF = 對應主線 Boss ×1.05
- 災厄無 EXP、金幣、裝備、VIP、強化石等一般戰利品。
- 災厄剩餘 HP 會跨挑戰保留；**但對應印記已達 Lv.10 後，重打模式不再保留災厄殘血，每一場都從滿 HP 開始。**
- 玩家每次挑戰後由正式 HP restore owner 恢復。
- `CALAMITY_COMBAT_RULE_VERSION = 3`
- `CALAMITY_MAXED_REPLAY_HP_VERSION = 1`

## Run

- `CALAMITY_RUN_VERSION = 1`
- `CALAMITY_CONTINUOUS_RULE_VERSION = 5`
- `CALAMITY_MAXED_MARK_CONTINUOUS_STOP_VERSION = 1`

支援：
- 單場挑戰
- 連續討伐
- 背景連戰
- 極簡模式

若本場真正首次取得災厄稱號：
- 連續討伐立即以 `title-first-kill` 停止。
- 不開始下一場。
- 讓玩家先看到正式稱號取得通知。

印記滿級停止規則：
- 若某一場結算後對應印記已達 Lv.10，連續討伐會在該場結束後以 `mark-maxed` 停止。
- 包含「本場剛升到 Lv.10」與「原本已 Lv.10 後重打」兩種情況。
- 已滿印記的重打若本場未擊殺，也不保存殘血；下一次挑戰仍從災厄滿 HP 開始。

---

# 14. 印記系統

- 共 10 枚，對應 10 個文明災厄。
- `MARK_MAX_LEVEL = 10`
- 初次完整擊殺對應災厄：取得印記 Lv.0。
- 後續完整擊殺累積升級。

升級所需擊殺數：
```
Lv0→1：1
Lv1→2：1
Lv2→3：2
Lv3→4：2
Lv4→5：3
Lv5→6：3
Lv6→7：4
Lv7→8：4
Lv8→9：5
Lv9→10：5
```

啟動型印記共用機率：
```js
Lv1 = 30%
之後每級 +5%
Lv10 = 75%
```

主要效果 owner：`markcore.js`。

目前效果重點：
- 護界 ward：啟動後護盾 = 最大 HP × (Lv×2)%。
- 壓制 suppression：降低敵方最終閃避。
- 鎮心 composure：降低敵方最終暴擊。
- 不屈 indomitable：啟動後，本場第一次致死傷害保留 1 HP。
- 韌性 resilience：降低敵方暴擊額外傷害。
- 戰意 battleSpirit：每層 ATK +0.2%×Lv，最多 10 層。
- 吸收 absorption：每次應命中時觸發率 Lv×0.5%，完全吸收並回復原始傷害 25%。
- 復仇 revenge：敵人暴擊後，Lv×5% 機率使下一次成功命中必定暴擊。
- 反噬 backlash：受實際 HP 傷害且存活後，Lv×1.5% 機率反射實際 HP 損失 30%。
- 無視 ignore：每次玩家攻擊 Lv×0.5% 機率無視敵人 DEF。

正式戰鬥 UI：
- 護盾使用獨立白色 shield bar 疊在 HP bar 上。
- 玩家／怪物 HP 數字與 bar 依 structured presentation 即時更新。
- 戰鬥文字 log 已移除，只保留必要傷害、暴擊、閃避、印記／專精視覺特效。

---

# 15. 鏡像戰

`mirrorconfig.js`：
- version = 1
- unlockLevel = 50
- 每次固定 20 戰
- reward：
```js
VIP points = 20 * wins^2
```

鏡像正式 state：
- `MIRROR_DUNGEON_STATE_VERSION = 2`

鏡像 run：
- `MIRROR_RUN_VERSION = 3`
- 正式不提供中途停止 API。
- 完整 20 戰才正式結算。
- 鏡像使用玩家的正式戰鬥 snapshot，包含專精、印記等。
- Final integrity 會做對稱 smoke test。

歷史：
- `bestWins`
- `bestDate`
- `miracleDates`

20 勝可累積多筆神蹟日期，不去重。

---

# 16. 玩家稱號系統：最新正式架構

目前共 16 個正式稱號：
- 災厄 10
- 鏡像 6

Save Schema 目前為 14；稱號正式 state：

```js
titles: {
  version: 1,
  unlocked: [],
  equipped: null,
  pendingNotice: null
}
```

## 16.1 正式 owner

資料 metadata：
- 災厄稱號：`calamityconfig.js` V2 的 `titleId/titleName`
- 鏡像稱號：`mirrorconfig.js -> titleUnlocks`

核心 state／解鎖：
- `playertitlecore.js`
- `PLAYER_TITLE_STATE_VERSION = 1`

HTML renderer：
- `playertitlerenderer.js`
- `PLAYER_TITLE_RENDERER_VERSION = 1`

UI：
- `playertitleui.js`
- `PLAYER_TITLE_UI_VERSION = 1`

視覺：
- `playertitles.css`

Integrity：
- `PLAYER_TITLE_INTEGRITY_VERSION = 6`

載入順序必須維持：
```
calamityconfig / mirrorconfig
→ playertitlecore
→ playertitlerenderer
→ playertitleui
→ 其他使用者
```

不要把 renderer、picker、通知又塞回 core。

---

# 17. 災厄稱號 10 個

1. `calamity_title_01` 灰潮餘燼
2. `calamity_title_02` 蝕日王冠
3. `calamity_title_03` 星骸殘響
4. `calamity_title_04` 黑域孤星
5. `calamity_title_05` 天環墜落
6. `calamity_title_06` 寂滅遠航
7. `calamity_title_07` 萬域寂滅
8. `calamity_title_08` 黑核權柄
9. `calamity_title_09` 無聲王權
10. `calamity_title_10` 萬星終寂

取得：
- 對應文明災厄真正首次完整擊殺。
- 正式證據沿用印記 settlement 的 `firstAcquisition===true`。
- 只取得一次。

Normalization：
- 若舊存檔已有對應印記 acquired，會靜默補齊災厄稱號。
- 不建立 pending notice。
- additive：不會因來源狀態後來異常而回收既有 unlocked。

---

# 18. 鏡像戰稱號 6 個

15 勝：
- `mirror_title_15` 幸運眷顧

16 勝：
- `mirror_title_16` 天選之刻

17 勝：
- `mirror_title_17` 逆命者

18 勝：
- `mirror_title_18` 傳說之日

19 勝：
- `mirror_title_19` 距神一步

20 勝：
- `mirror_title_20` 神蹟

規則：
- 與災厄共用同一個 `titles.unlocked/equipped`。
- 不是第二個 slot。
- normalization 會依歷史 `bestWins` 靜默 backfill。
- backfill 不建立 pending notice。
- 正式 20 戰結算時才發放。
- 若 14→18：一次解鎖 15～18，但通知只顯示最高新稱號「傳說之日」。
- 若 18→20：解鎖 19、20，只通知「神蹟」。
- 不自動裝備。

角色稱號 picker：
- 「不裝備稱號」固定第一項。
- 只列已解鎖。
- 固定順序：災厄 10 在前、鏡像 6 在後。
- 沒有 X/16 顯示。

---

# 19. 稱號正式 renderer 與安全規則

`playerIdentityNameHtml()`：
- 正式顯示為「稱號 + 玩家名字」。
- 稱號與名字是兩個獨立 span。
- 名字不會被玩家改名偽裝成稱號效果。

正式 renderer 預設：
- 明確傳 `titleId` 時，必須是玩家已擁有的稱號。
- 未擁有就不渲染。
- GM 預覽才可以明確傳 `allowUnownedTitle:true`。

劇情／戰線紀錄：
- 不顯示稱號。
- 維持純玩家名稱。

鏡像敵人：
- 正式會複製玩家目前裝備的稱號。
- 桌機：玩家與鏡像敵人都跑完整稱號動畫。
- 手機 ≤760px：鏡像敵人仍保留完整靜態稱號外觀，但停掉 enemy clone 的稱號動畫；玩家自己的動畫維持完整。
- `MIRROR_TITLE_CLONE_PERFORMANCE_VERSION = 1`

---

# 20. 稱號 UI 與 save rollback

`playertitleui.js` 是唯一共用 UI owner，負責：
- 稱號 picker。
- 裝備／卸下。
- 取得稱號 modal。
- pending notice replay。
- visibilitychange 後重新顯示 pending notice。
- save / render。

裝備稱號：
- 先保留舊 `equipped`。
- 若 `save(false)===false`，rollback。
- save 成功才關閉 picker / render。

關閉取得通知：
- 先清除 pending。
- 若 save 失敗，恢復原 pending。
- save 成功才真正關閉。

此 rollback 是正式資料一致性保護，不要拿掉。

---

# 21. 稱號取得通知

共用 `pendingNotice`。

災厄：
- 文案：「首次擊敗對應文明災厄後取得。」

鏡像：
- 文案：「鏡像戰歷史最高達 N 勝後取得。」

背景狀態：
- `document.hidden` 時不彈。
- 回到前景或下次可見載入會 replay。

通知只告知，不自動裝備、不跳角色頁。

---

# 22. 稱號視覺最新基準

## 災厄

固定原則：
- 科幻／宇宙史詩。
- 開放式 aura，不是封閉框。
- 不加 `〔〕`、`⟦⟧`、`✦✦` 等符號包裝。
- `::before` / `::after` 是正式 aura / field owner。
- 低階克制，高階逐步增加異象。
- tier 8 黑核／引力。
- tier 9 王權／冠冕殘場。
- tier 10 萬星終末場。

使用者已明確喜歡目前災厄開放式效果，不要隨意改回封閉框。

## 鏡像

視覺位階必須明顯高於災厄 8～10。

正式概念：
- 15 幸運眷顧＝概率
- 16 天選之刻＝時間
- 17 逆命者＝因果斷裂
- 18 傳說之日＝歷史／晨曦
- 19 距神一步＝神性門檻
- 20 神蹟＝現實法則失常

目前字級：
- 15：1.13em
- 16：1.14em
- 17：1.16em
- 18：1.18em
- 19：1.22em
- 20：1.28em

19、20 必須比 15～18 更浮誇；20 是目前整套稱號中最高辨識、最異常的一個。

20 目前包含：
- 虹彩折射
- 星點
- 雙側現實裂解
- 中央重組場
- 空間切片
- 高密度多層 gradient
- Reality Warp / Split

`prefers-reduced-motion`：
- 全部稱號動畫停用，但保留靜態辨識。

---

# 23. 玩家名稱規則

`PLAYER_NAME_RULE_VERSION = 2`

最大 12 格：
- 漢字：2 格
- Unicode 全形字：2 格
- 其他：1 格

舊存檔既有名稱：
- normalization / migration 不應再直接 `.slice(0,12)` 強制截短。
- 玩家下次主動改名時才套正式 12 格驗證。

---

# 24. GM 管理／測試系統：最新正式架構

## 24.1 GM Hub

`gmhub.js` + `gmhubextensions.js`：
- 管理／測試分頁與 section registry。
- test state 只存本頁生命週期，不 save、不污染正式角色。
- 每批正式功能都必須同步檢查 GM 管理、GM 測試、戰力基準、Integrity 是否需要更新。

## 24.2 角色／世界管理

GM 角色等級使用 effective cap：
- 銀河：1～500
- 宇宙：1～1000

資源按世界顯示：
- 銀河：指定金幣
- 宇宙：指定暗物質／指定暗能量

宇宙裝備產生器：
- 區域 → Boss → 品質 → 部位
- 直接走正式 world2 equipment owner。

## 24.3 地圖怪／Boss 快速測試

銀河：
- 區域 → 地圖 → 怪物。

宇宙：
- 區域 → 怪物（Boss）。
- **沒有地圖層**，因每區就是 10 隻 Boss。
- 沙盒 100 場，零 EXP／資源／裝備／主線進度。

## 24.4 戰力基準測試

正式 owner：`gmpowerbenchmark.js`。
- `GM_POWER_BENCHMARK_VERSION=17`
- `GM_POWER_BENCHMARK_BATCH_SIZE = 25`

第一層先選紀元。

銀河：
`紀元 → 大區域 → 地圖 → 怪物 → 測試量 100/1000`

宇宙：
`紀元 → 區域 → 怪物 → 測試量 100/1000`

共用三種測試：
1. 輸出基準
2. 承傷／生存基準
3. 現行主線實戰基準

銀河實戰：
- 可測目前選擇怪物。
- 可測本地圖 5 隻全部。

宇宙實戰：
- 只測目前選擇 Boss。
- **沒有「本地圖 5 隻全部」**。
- 正式路徑：
  `gmPowerBenchmarkRunCombat("single") → runCombatTask() → universeCombatRow() → secondWorldBossEncounter() → runCombatCore()`
- 每場重新抽正式 Boss traits。

輸出／承傷：
- 銀河可用目前怪、本地圖普通／菁英／Boss、自訂。
- 宇宙只提供目前 Boss／自訂，避免不存在的本地圖來源。
- 宇宙輸出使用 Boss 基礎 DEF；承傷使用 Boss 基礎 ATK/DEF/crit/dodge，與既有木樁測試語意一致，不抽 traits。

摘要：
- 只顯示目前紀元，不再同時顯示銀河與宇宙兩套勝率。
- 顯示目前基準怪物。
- 銀河標示單隻怪／地圖 5 隻；宇宙標示單隻 Boss。
- 舊 `universeCombatResult`、`runUniverseCombatBenchmark()`、`gmPowerBenchmarkRunUniverseCombat` 已完全移除。
- Final Integrity 反向要求 legacy universe runner 不得再存在。

## 24.5 背景戰鬥

`gmbackground.js` 是唯一 GM background gate。
- **背景戰鬥只能由 GM 管理開啟。**
- 玩家介面沒有背景戰鬥開關。
- 銀河／宇宙共用同一 `main` background flow。

## 24.6 其他 GM

仍保留並沿正式 owner：
- VIP／專精／強化／印記測試。
- 懸賞／競技／虛空／鏡像測試。
- 文明災厄測試。
- 稱號預覽。
- 劇情測試。
- JSON 匯出／匯入。

---

# 25. 稱號 integrity 架構

`PLAYER_TITLE_INTEGRITY_VERSION = 6`

專屬 integrity 負責詳細檢查：
- Calamity Config V2 metadata owner。
- Renderer V1。
- UI V1。
- Mirror clone mobile performance V1。
- 災厄 10 + 鏡像 6 + 總 16。
- config 與 runtime 定義一致。
- normalization idempotent。
- 舊檔 backfill 靜默。
- additive unlock。
- 災厄首殺只發一次。
- 鏡像跨階解鎖只通知最高新稱號。
- 正式 renderer 阻擋未擁有 title。
- GM preview bypass 可顯示未擁有 title。
- GM preview 不改 state / localStorage。

`runtimeintegrity.js`、`finalintegrity.js` 已刻意降低耦合：
- 不再硬鎖每個 GM/UI 小版本。
- 主要信任 `PLAYER_TITLE_INTEGRITY.passed`。
- 仍保留 10 / 6 / 16 公開定義數量檢查。

不要重新把所有小版本硬編進 runtime/final，否則每次 UI 微調又會變成多檔同步升版。

---

# 26. UI 與戰鬥顯示的重要基準

- 玩家正式身分顯示可包含稱號。
- 劇情與戰線紀錄刻意不包含稱號。
- 手機戰鬥稱號與名字可 wrap。
- 高階稱號不能因戰鬥卡 overflow 被裁掉。
- GM preview 是實戰名稱測試工具，不是解鎖工具。
- 戰鬥文字 log 已移除；正式畫面重點是 HP、shield、傷害／暴擊／閃避與能力 FX。
- 文明災厄支援極簡模式。
- 背景圖／手機圖以原生對應版為主，不要拿橫圖硬裁手機。

---

# 27. 重要已修 Bug

## A. JS parser / 空白主畫面
曾因 source 被寫入字面 `\n` 造成 parser error。所有 JS 修改後必須重新 fetch main 並 parse，不能只相信 update API 成功。

## B. 載入失敗覆蓋舊存檔
已由 Save Write Guard V1 解決。existing save 在成功 load resolve 前禁止正式 `save()` 覆蓋。

## C. 戰鬥 HP / shield 不更新
已由 structured combat presentation 統一；不要再在各模式寫第二套 HP bar。

## D. GM 稱號預覽
已修正成正式「稱號 + 玩家名」，並處理 WebKit text-fill 問題。

## E. 手機鏡像高階稱號效能
手機保留 enemy clone 靜態稱號外觀，但停止 clone 稱號動畫；玩家自己的稱號動畫維持。

## F. iPhone Safari 宇宙 1.5× 設定失敗
原因：`combatspeed.js` 曾誤讀 `globalThis.state`，但正式 state 是 top-level lexical `let state`。已改成正式 state 存取並加入 Integrity。

## G. Story Integrity CI 持續失敗
原因：`storyprogress.js` 已升到 `CIVILIZATION_STORY_PROGRESS_VERSION=10`，但 `tests/story/flow.js` 還硬性要求 9。
已修：
- CI contract 改驗證 V10。
- 額外驗證 `handleSecondWorldStoryCompletion(id)` hook 不得遺失。
- 修正後 GitHub Actions 的 **Story Integrity 已實際完成 success / 綠燈**。

---

# 28. 第二世界 Lv.501～1000：最新設計基準（**部分已實作**）

> 這一節保存 2026-09-21 的第二世界完整設計基準。**是否已實作仍以 GitHub `main` 為唯一真實來源。**  
> 目前已完成「銀河紀元 → 宇宙紀元」世界突破 milestone：World Phase、入場條件／確認 UI、原子轉換、舊資源與離線殘留切斷、reload 歡迎視窗、宇宙紀元 1×／1.5×玩家速度皆已進 main 並完成手機實機驗收。  
> Lv.501～1000 主線、100 Boss、第二世界裝備／經濟／強化／災厄／副本等仍待後續依第 29 節順序實作；不可把尚未實作的設計文字當成既有 API。

## 28.1 世界定位與入場

第二世界舞台：
- 從銀河系之外一路擴張到物質宇宙尺度。
- 不走高維、因果、時間法則、形上世界；仍是物質宇宙／天體／星系／巨構／文明戰爭。
- 第二世界遭遇的外部文明／實體全部是敵對方，不走外交、結盟、共存主線。

入場條件目前已定：
- Lv.500。
- 第一世界主線完成。
- 8 項專精全部 Lv.60。
- 5 個強化欄位全部 +20。
- 10 枚印記全部 Lv.10。
- VIP **不列入**第二世界入場條件。

等級門檻：
- 尚未正式進入第二世界前，Lv.500 仍是硬上限，不可取得 501+ EXP。
- 正式進入後才解除 Lv.500 封頂，最高延伸到 Lv.1000。
- 實作時不可只是把 `MAX_LEVEL` 從 500 改成 1000；必須有「絕對上限 1000 + 是否已進第二世界決定目前 cap 500/1000」的正式 owner。

主頁入口命名目前建議：
- 固定入口：**銀河彼端**
- 第一次正式突破按鈕：**突破銀河邊界**
- 這兩個 UI 文案目前是建議方向，尚未寫入 main。

## 28.2 第二世界區域／主線結構

結構：
- 共 100 隻主線敵人，全部都是 gameplay Boss。
- 等級：505、510、515……1000，共 100 個節點。
- 10 大區 × 每區 10 Boss。
- 不再有第一世界「大區 → 10 張小地圖 → 每圖 5 隻」的小地圖層。
- 第二世界冒險頁：大區 → 直接顯示該區 10 隻 Boss。
- 手機預計 2×5；桌機 5×2。
- 尚未開放的大區／Boss **不顯示**，不是灰色鎖卡。
- Boss 解鎖：玩家等級 ≥ Boss 等級 - 5，因此 Lv.500 可挑戰 Lv.505；Lv.995 可挑戰 Lv.1000。

10 大區正式名稱：
1. 銀河彼端（505～550）
2. 本星系群戰爭（555～600）
3. 星群邊疆（605～650）
4. 群星會戰（655～700）
5. 超域邊境（705～750）
6. 萬域戰線（755～800）
7. 宇宙纖維帶（805～850）
8. 星海巨牆（855～900）
9. 宇宙深域（905～950）
10. 宇宙統合戰爭（955～1000）

## 28.3 第二世界主線 Boss 能力公式

目前採用的第一版正式設計公式（尚未寫 code）：

```text
L = Boss level ∈ {505,510,...,1000}
N = (L - 505) / 5
multiplier = 1 + N * 0.015

HP  = 36,000 * multiplier
ATK =  6,000 * multiplier
DEF =  3,000 * multiplier
```

代表值：
- 505：36,000 / 6,000 / 3,000
- 550：40,860 / 6,810 / 3,405
- 600：46,260 / 7,710 / 3,855
- 750：62,460 / 10,410 / 5,205
- 900：78,660 / 13,110 / 6,555
- 1000：89,460 / 14,910 / 7,455

規則：
- 不使用第一世界 `monsterBase()`。
- 不使用第一世界 normal/elite/boss stage multiplier。
- 第二世界主線 100 隻雖然都是 Boss，仍預計沿用現有 Boss 隨機 traits。
- 正式整數 rounding 實作時再統一決定，不要各模組各自取整。

以目前 Lv.500 畢業角色基準做過方向性估算，首戰勝率約從 505 的 85% 左右，逐步升到 1000 的 95% 左右；這只是設計估算，不是 GM 實測正式數據。

## 28.4 第二世界 EXP

第一世界 Lv.1～499 完全不改。

正式進入第二世界後：
```text
for 500 <= L < 1000:
expNeed(L) = ceil(sameExp(L) * 250)
```

其他：
- `sameExp(L)=ceil(25+4L)` 沿用。
- `expLevelFactor` 完全沿用第一世界現行版本。
- 實戰訓練 Lv.60 必定已滿，EXP ×2.5。
- 第二世界「Boss」只是顯示／敵人身分，不套第一世界 Boss EXP ×5。
- 第二世界同級標準 Boss 約 100 勝升 1 級。
- Lv.1000 EXP 固定停止。
- 第二世界死亡仍規劃扣目前第二世界等級 `expNeed` 的 10%。
- 若一直打可挑戰的最高 Boss，500→1000 粗估約 42,500～42,554 場主線勝利。

## 28.5 第二世界資源

### 暗物質
第二世界主貨幣，定位類似第一世界金幣，但經濟分離。

Boss 直接基礎：
```text
N = (BossLevel - 505) / 5
darkMatterBase = 20 + 2*N
```

例：
- 505：20
- 550：38
- 750：118
- 1000：218

專精延續：
- 搜刮技巧 Lv.60 ×2.5。
- 第二世界搜刮技巧作用目標改為暗物質，不再是金幣。

### 暗能量
- 每擊殺 1 隻第二世界**主線 Boss**固定 +1。
- 出售第二世界神話裝額外 +1。
- 不做拆解系統。
- 第二世界文明災厄不掉暗能量。
- 鑑價不放大暗能量。

第一世界金幣／基礎強化石／進階強化石不作為第二世界主要養成資源。

## 28.6 第二世界裝備規則

每隻主線 Boss：
- 固定掉 1 件裝備。
- 品質使用現行 Boss table：普通 0%、優良 45%、稀有 35%、史詩 15%、傳說 4.5%、神話 0.5%。
- 裝備主屬性／詞綴的既有線性公式延伸到 Lv.1000，目前不另做第二套屬性公式。

裝備等級：
```text
equipmentLevel = min(currentPlayerLevel, BossLevel)
```

第二世界不使用第一世界 Boss 的 `[-1,0,0,+1,+2]` 裝備等級偏移。

出售暗物質：
```text
N = floor((equipmentLevel - 500) / 5)
B = 20 + 2*N
saleDarkMatter = ceil(B * qualityMultiplier * appraisalMultiplier)
```

quality multiplier：
- common 0.10
- uncommon 0.15
- rare 0.25
- epic 0.40
- legendary 0.70
- mythic 1.00

鑑價 Lv.60 = ×2.5；神話出售再 +1 暗能量。

## 28.7 第二世界強化 +21～+40

第一世界 +20 效果保留。
- 5 個 slot-based 強化欄位延續，不綁裝備本體。
- 第二世界最高 +40。
- 每級主屬性仍 +2.5%。
- +20 = +50%、+25 = +62.5%、+30 = +75%、+35 = +87.5%、+40 = +100%。

每個欄位單次升級成本：
```text
K = targetEnhancementLevel - 21   // 0..19
darkMatterCost = 30,000 + 12,000*K
darkEnergyCost = 300 + 10*K
```

單一 target：
- +21：30,000 / 300
- +25：78,000 / 340
- +30：138,000 / 390
- +35：198,000 / 440
- +40：258,000 / 490

5 欄全部 +20→+40：
- 暗物質 14,400,000
- 暗能量 39,500

## 28.8 文明等級

第二世界新增 Civilization Lv.0～10：
- 入場起始 Lv.0。
- 完成每一階第二世界文明災厄後 +1。
- 每級 +5% **最終傷害**。

```text
finalDamageMultiplier = 1 + 0.05 * civilizationLevel
```

Lv.0 = +0%；Lv.10 = +50%。

實作時應放在 late/final damage layer：ATK/DEF、穿透、無視、防禦、戰意、暴擊、先制、連擊／反擊等既有傷害計算後，再套文明 final damage；不要在多個地方重複乘。

正常主線預期：
- 505～550：文明 0
- 555～600：文明 1
- …
- 955～1000：文明 9
- Lv.1000 主線打完仍不是完整畢業；完成第 10 隻文明災厄後文明 10 才完整。

## 28.9 第二世界文明災厄

共 10 隻，每 50 級／每章結尾開放：
- 550、600、650、700、750、800、850、900、950、1000。
- 第 2 隻起使用雙條件：對應章末主線 Boss 完成 + 前一文明等級完成。
- 若章末條件到了但前一文明未完成，可顯示鎖定與缺少條件。

沿用第一世界 persistent huge-HP encounter 架構：
- 一場打不死，剩餘 HP 保留到下一場。
- 只有 HP 真正歸零才算 1 次 true kill。
- 玩家每場後恢復。
- 每一隻需要 **30 次 true kills**，不是 30 場。
- UI 顯示百分比，不顯示 X/30：1 次 3.33%、2 次 6.67%……30 次 100%。

HP：
```text
calamityHP(index) = 1,000,000 + (index - 1) * 200,000
```

10 隻：
1. 1,000,000
2. 1,200,000
3. 1,400,000
4. 1,600,000
5. 1,800,000
6. 2,000,000
7. 2,200,000
8. 2,400,000
9. 2,600,000
10. 2,800,000

戰鬥：
- ATK = 對應章末第二世界主線 Boss ATK ×1.10。
- DEF = 對應章末第二世界主線 Boss DEF ×1.05。
- 暴擊 10%、閃避 10%。
- 不掉暗能量。

10 隻災厄正式命名：
| 階 | 等級 | 區域 | 名稱 |
|---:|---:|---|---|
| 1 | 550 | 銀河彼端 | 彼岸黑潮 |
| 2 | 600 | 本星系群戰爭 | 群星焚爐 |
| 3 | 650 | 星群邊疆 | 邊星獵皇 |
| 4 | 700 | 群星會戰 | 萬軍葬艦 |
| 5 | 750 | 超域邊境 | 超域蝕核 |
| 6 | 800 | 萬域戰線 | 無盡兵災 |
| 7 | 850 | 宇宙纖維帶 | 星脈噬巢 |
| 8 | 900 | 星海巨牆 | 巨牆戰堡 |
| 9 | 950 | 宇宙深域 | 深域吞星 |
| 10 | 1000 | 宇宙統合戰爭 | 終戰天穹 |

全部 4 字，刻意避免第一世界／第二世界災厄之間同模板後綴大量重複。

## 28.10 100 Boss + 500 件專屬裝備命名

規則已定：
- 第二世界每一隻 Boss 都有自己 5 件專屬裝備名稱，所以 100 Boss × 5 = 500 名稱。
- 不沿用第一世界「每張地圖 5 隻怪共用一組裝備名」的命名方式。
- 裝備名稱必須同時呼應所在區域與 Boss。
- 第二世界命名位階要高於第一世界 Lv.1～500。
- 刻意降低「XX刃／XX盔／XX甲／XX靴／XX核心」模板重複，尤其足部不再幾乎全部叫「靴」。
- 名稱可使用劍／戟／矛／槍／鐮／斧／鎚／炮刃、冕／環／面甲、鎧／戰衣／外骨骼／護殼、履／足鎧／步甲／脛鎧／步裝／足具，以及星圖／矩陣／權印／節點／徽記等，提高辨識度。
- 以下已由使用者確認可用：

| 區域 | Lv. | Boss | 武器 | 頭部 | 身體 | 足部 | 飾品 |
|---|---:|---|---|---|---|---|---|
| 銀河彼端 | 505 | 彼岸守門者 | 彼岸界門劍 | 遠界守門面甲 | 彼岸封域鎧 | 界外星履 | 彼岸鑰印 |
| 銀河彼端 | 510 | 裂星王座 | 裂星王權戟 | 裂星王冕 | 王座統御戰衣 | 王域步甲 | 裂星權柄 |
| 銀河彼端 | 515 | 黑潮母艦 | 黑潮艦斬槍 | 母艦戰鬥環 | 黑潮艦體裝甲 | 深潮航履 | 黑潮主控矩陣 |
| 銀河彼端 | 520 | 逐日征服者 | 逐日征服劍 | 日冕征服面罩 | 逐日遠征外骨骼 | 追日光履 | 征服者徽記 |
| 銀河彼端 | 525 | 天穹殲滅體 | 天穹殲星炮刃 | 殲滅感知環 | 天穹滅域護殼 | 穹頂脛鎧 | 殲滅晶體 |
| 銀河彼端 | 530 | 銀河殘光主腦 | 殘光智械鐮 | 主腦思維環 | 殘光神經戰衣 | 銀河折躍足具 | 殘光智核 |
| 銀河彼端 | 535 | 星海霸皇 | 星海霸皇戟 | 霸皇星冕 | 星海皇權鎧 | 皇域踏星履 | 星海霸印 |
| 銀河彼端 | 540 | 遠境戰爭中樞 | 遠境戰爭矛 | 中樞指揮面甲 | 遠境軍勢裝甲 | 戰線推進足鎧 | 遠境戰略節點 |
| 銀河彼端 | 545 | 群星墓主 | 葬星墓主鐮 | 群星冥面 | 墓域星骸護甲 | 幽航步裝 | 墓主星碑 |
| 銀河彼端 | 550 | 彼岸統合體 | 彼岸統合聖劍 | 統合天環 | 彼岸統合戰鎧 | 統合越界履 | 彼岸統御樞 |
| 本星系群戰爭 | 555 | 蒼環執政官 | 蒼環政令劍 | 執政官環冕 | 蒼環統治戰袍 | 政域巡行履 | 蒼環政令章 |
| 本星系群戰爭 | 560 | 赤星天堡 | 赤星攻城鎚 | 天堡防衛面甲 | 赤星城塞鎧 | 堡壘重踏甲 | 赤星堡壘核心 |
| 本星系群戰爭 | 565 | 暗河獵界者 | 暗河獵界槍 | 獵界追蹤目鏡 | 暗河獵行外骨骼 | 獵界疾行足具 | 暗河獵星盤 |
| 本星系群戰爭 | 570 | 碎月戰皇 | 碎月皇戰斧 | 戰皇月冕 | 碎月皇鎧 | 月影戰履 | 碎月皇徽 |
| 本星系群戰爭 | 575 | 星門鎮壓核心 | 星門鎮界矛 | 星門封鎖頭環 | 星門禁制裝甲 | 星門穿界步甲 | 鎮壓控制器 |
| 本星系群戰爭 | 580 | 銀冠母巢 | 銀冠巢牙刃 | 母巢感應冠 | 銀冠生體護殼 | 巢群蔓生足鎧 | 銀冠孵化腺核 |
| 本星系群戰爭 | 585 | 永夜遠征艦 | 永夜艦戰槍 | 遠征艦橋面甲 | 永夜艦兵裝甲 | 遠征深航脛甲 | 永夜航路星圖 |
| 本星系群戰爭 | 590 | 群星審判者 | 群星審判劍 | 審判官星冕 | 群星裁定戰衣 | 審判追星履 | 裁決天秤 |
| 本星系群戰爭 | 595 | 黑域戰爭主機 | 黑域戰爭鐮 | 主機同步環 | 黑域機戰外殼 | 戰域機動足具 | 黑域戰術模組 |
| 本星系群戰爭 | 600 | 星群滅絕皇座 | 星群滅絕戟 | 滅星皇冠 | 星群終滅帝鎧 | 皇座巡星步裝 | 滅絕王權印 |
| 星群邊疆 | 605 | 邊疆吞星獸 | 吞星獠牙刃 | 吞星獸首甲 | 邊疆獸皇護殼 | 荒星獸足鎧 | 吞星心核 |
| 星群邊疆 | 610 | 赤界戰爭元帥 | 赤界元帥軍刀 | 元帥指揮冠 | 赤界軍勢戰衣 | 遠征將履 | 赤界帥令 |
| 星群邊疆 | 615 | 星骸航行者 | 星骸漂流劍 | 航行者星面 | 星骸遠航戰甲 | 骸域漂泊履 | 星骸航標 |
| 星群邊疆 | 620 | 天河破城艦 | 天河破城炮槍 | 破城艦橋環 | 天河艦體重鎧 | 攻城推進足鎧 | 天河火控儀 |
| 星群邊疆 | 625 | 黑冠殖民母體 | 黑冠殖域鐮 | 殖民母冠 | 黑冠生殖護甲 | 殖域蔓延足具 | 黑冠殖民囊 |
| 星群邊疆 | 630 | 裂域霸主 | 裂域霸權戰斧 | 霸主裂界冠 | 裂域王鎧 | 霸域跨星履 | 裂域霸印 |
| 星群邊疆 | 635 | 蒼星焚滅器 | 蒼星焚滅槍 | 焚滅觀測面甲 | 蒼星灼能裝甲 | 焚星突進步甲 | 蒼星熔能爐 |
| 星群邊疆 | 640 | 遠星文明主腦 | 遠星文明劍 | 文明思維冠 | 遠星智械戰衣 | 文明星行履 | 遠星智識矩陣 |
| 星群邊疆 | 645 | 萬艦統帥 | 萬艦統帥戟 | 艦群指揮環 | 萬艦統御鎧 | 旗艦航戰足具 | 萬艦司令牌 |
| 星群邊疆 | 650 | 星群終戰核心 | 星群終戰巨刃 | 終戰星冕 | 星群決戰裝甲 | 終戰跨域履 | 星群終戰樞紐 |
| 群星會戰 | 655 | 千星戰王 | 千星戰王長戟 | 戰王星冕 | 千星王戰鎧 | 星戰踏域履 | 千星王令 |
| 群星會戰 | 660 | 蒼穹母皇 | 蒼穹母皇鐮 | 母皇天冠 | 蒼穹生體戰衣 | 母皇星步 | 蒼穹皇卵核 |
| 群星會戰 | 665 | 黑日殲星艦 | 黑日殲星炮劍 | 殲星戰術面甲 | 黑日艦兵裝甲 | 黑日航戰脛甲 | 殲星火控矩陣 |
| 群星會戰 | 670 | 戰域裁決者 | 戰域裁決劍 | 裁決官面罩 | 戰域審判鎧 | 裁決追跡履 | 戰域裁印 |
| 群星會戰 | 675 | 星辰吞噬體 | 星辰吞噬矛 | 吞噬感應環 | 星辰噬能護殼 | 吞星步裝 | 星辰噬能晶體 |
| 群星會戰 | 680 | 群星鐵壁 | 群星破壁鎚 | 鐵壁壁冠 | 群星堡壘重鎧 | 壁壘鎮星足甲 | 群星防禦矩陣 |
| 群星會戰 | 685 | 赤環戰爭智核 | 赤環智戰鐮 | 智核同步冠 | 赤環戰略外骨骼 | 智域調度履 | 赤環戰術智晶 |
| 群星會戰 | 690 | 萬軍征伐皇 | 萬軍征伐戰斧 | 征伐皇冕 | 萬軍皇戰甲 | 征伐遠行步甲 | 萬軍皇旗 |
| 群星會戰 | 695 | 天域滅星機構 | 天域滅星炮槍 | 機構控制面甲 | 天域殲滅機甲 | 滅星推進足具 | 天域殲星節點 |
| 群星會戰 | 700 | 群星霸權王庭 | 群星霸權劍 | 王庭御冠 | 群星王權戰袍 | 王庭巡域星履 | 霸權王璽 |
| 超域邊境 | 705 | 超域鎮界者 | 超域鎮界槍 | 鎮界環冠 | 超域封疆鎧 | 鎮界跨域步裝 | 超域界碑 |
| 超域邊境 | 710 | 黑曜星堡 | 黑曜破堡重刃 | 星堡曜面 | 黑曜堡壘裝甲 | 星堡磁行足具 | 黑曜堡權章 |
| 超域邊境 | 715 | 裂空帝艦 | 裂空帝艦矛 | 帝艦艦橋冠 | 裂空艦皇甲 | 帝艦破空履 | 裂空航戰星圖 |
| 超域邊境 | 720 | 蒼白吞界獸 | 蒼白吞界牙 | 吞界獸面甲 | 蒼白獸皇護殼 | 吞界踏星足鎧 | 蒼白獸心 |
| 超域邊境 | 725 | 星海萬機母體 | 萬機解構鐮 | 母體機械環 | 星海機群外骨骼 | 萬機躍行步甲 | 萬機演算矩陣 |
| 超域邊境 | 730 | 天幕戰爭君王 | 天幕君王戟 | 戰爭王冕 | 天幕王戰鎧 | 君王御域履 | 天幕王令 |
| 超域邊境 | 735 | 赤界文明熔爐 | 赤界熔爐炮刃 | 文明爐心冠 | 赤界熔戰裝甲 | 熔爐熱流足具 | 文明熔鑄核 |
| 超域邊境 | 740 | 永夜星域之主 | 永夜域主劍 | 星域主冕 | 永夜主宰戰衣 | 域主深航履 | 永夜星圖 |
| 超域邊境 | 745 | 萬星殲滅樞紐 | 萬星殲滅槍 | 樞紐感知面甲 | 萬星滅域鎧 | 殲滅突進脛甲 | 萬星連結節點 |
| 超域邊境 | 750 | 超域霸權主艦 | 超域霸權巨刃 | 主艦統御環 | 超域艦王裝甲 | 霸權遠征足鎧 | 超域艦隊權印 |
| 萬域戰線 | 755 | 萬域開戰者 | 萬域開戰矛 | 開戰者軍冠 | 萬域軍勢鎧 | 戰線先鋒履 | 萬域開戰令 |
| 萬域戰線 | 760 | 星海黑塔 | 黑塔裂星鎚 | 星海塔面甲 | 黑塔鎮域裝甲 | 黑塔浮航足具 | 黑塔座標儀 |
| 萬域戰線 | 765 | 焚界遠征母艦 | 焚界遠征槍 | 遠征母艦環冠 | 焚界艦戰鎧 | 遠征焚星脛甲 | 焚界航路矩陣 |
| 萬域戰線 | 770 | 蒼穹軍勢統領 | 蒼穹統領戟 | 軍勢指揮環 | 蒼穹軍戰甲 | 統領跨星步甲 | 軍勢統帥章 |
| 萬域戰線 | 775 | 群星掠奪皇 | 群星掠奪戰斧 | 掠奪皇冕 | 群星劫戰鎧 | 掠奪追星履 | 群星戰利徽 |
| 萬域戰線 | 780 | 黑潮文明巢心 | 黑潮巢心鐮 | 文明巢面 | 黑潮孵化護殼 | 巢群蔓延足甲 | 黑潮巢心珠 |
| 萬域戰線 | 785 | 裂宇戰爭巨構 | 裂宇巨構劍 | 巨構控制冠 | 裂宇構裝重甲 | 巨構跨域足具 | 裂宇構造節點 |
| 萬域戰線 | 790 | 星域滅絕執行官 | 星域執行槍 | 滅絕官面甲 | 星域執行戰衣 | 滅絕追跡履 | 星域執行令 |
| 萬域戰線 | 795 | 萬域征戰樞機 | 萬域征戰刃 | 樞機指揮環 | 萬域征伐鎧 | 樞機調度步裝 | 萬域征戰星圖 |
| 萬域戰線 | 800 | 無盡戰線總督 | 無盡戰線長戟 | 總督統治冕 | 無盡軍政戰袍 | 戰線督軍足鎧 | 無盡總督璽 |
| 宇宙纖維帶 | 805 | 纖維帶守望者 | 星脈守望劍 | 纖維觀測環 | 星脈守域戰衣 | 脈絡巡航履 | 守望星脈圖 |
| 宇宙纖維帶 | 810 | 黑鏈天體 | 黑鏈天體槍 | 鏈域引力冠 | 黑鏈重構護甲 | 鏈星牽引足具 | 黑鏈軌道盤 |
| 宇宙纖維帶 | 815 | 星脈繁殖母巢 | 星脈孵化鐮 | 繁殖巢面甲 | 星脈母巢護殼 | 巢脈蔓生足甲 | 星脈孵化囊 |
| 宇宙纖維帶 | 820 | 裂河戰爭巨艦 | 裂河巨艦炮刃 | 戰艦導航環 | 裂河艦體裝甲 | 巨艦穿流脛鎧 | 裂河航道儀 |
| 宇宙纖維帶 | 825 | 赤脈文明節點 | 赤脈節點矛 | 文明脈冠 | 赤脈節裝甲 | 脈網轉移履 | 赤脈節點晶 |
| 宇宙纖維帶 | 830 | 星橋毀滅者 | 星橋毀滅戟 | 星橋觀測面 | 星橋斷域鎧 | 星橋跨越步甲 | 毀滅橋樞 |
| 宇宙纖維帶 | 835 | 蒼穹巨構帝君 | 蒼穹帝君劍 | 巨構帝冕 | 蒼穹帝構甲 | 帝君巡宇履 | 巨構帝令 |
| 宇宙纖維帶 | 840 | 萬星侵略主機 | 萬星侵略槍 | 主機同步環 | 萬星侵戰外骨骼 | 侵略躍遷足具 | 萬星侵略模組 |
| 宇宙纖維帶 | 845 | 暗流吞噬皇體 | 暗流吞噬鐮 | 皇體暗冠 | 暗流噬星護殼 | 吞噬流轉足鎧 | 暗流皇晶 |
| 宇宙纖維帶 | 850 | 宇宙脈絡霸主 | 脈絡霸主戟 | 宇宙脈冕 | 脈絡霸權鎧 | 宇脈跨域星履 | 脈絡統御環 |
| 星海巨牆 | 855 | 巨牆鎮守者 | 巨牆鎮守矛 | 鎮守壁面甲 | 巨牆壁壘鎧 | 壁線巡防足具 | 巨牆守備令 |
| 星海巨牆 | 860 | 萬星壁壘 | 萬星破壘鎚 | 壁壘星冠 | 萬星城防裝甲 | 壁壘重行足甲 | 萬星防衛矩陣 |
| 星海巨牆 | 865 | 黑曜天幕戰艦 | 黑曜天幕炮槍 | 戰艦曜環 | 黑曜艦戰鎧 | 天幕巡航脛甲 | 黑曜艦橋儀 |
| 星海巨牆 | 870 | 星海裂界皇 | 星海裂界劍 | 裂界皇冕 | 星海皇戰甲 | 裂界越域履 | 星海皇璽 |
| 星海巨牆 | 875 | 蒼白文明堡壘 | 蒼白破堡戰斧 | 文明堡冠 | 蒼白堡壘重鎧 | 堡域鎮守步甲 | 蒼白堡壘章 |
| 星海巨牆 | 880 | 赤環滅域裝置 | 赤環滅域鐮 | 裝置控制面甲 | 赤環滅域外殼 | 滅域機動足具 | 赤環滅域模組 |
| 星海巨牆 | 885 | 群星封鎖司令 | 群星封鎖槍 | 封鎖司令環 | 群星禁域戰衣 | 封鎖巡弋履 | 群星封鎖令 |
| 星海巨牆 | 890 | 無盡城塞 | 無盡破城巨刃 | 城塞統御冠 | 無盡要塞裝甲 | 城塞重踏足鎧 | 無盡城塞權印 |
| 星海巨牆 | 895 | 宇宙壁壘破界者 | 宇宙破界戟 | 壁壘破界面 | 宇宙破壁鎧 | 破界突進步裝 | 宇宙破壁節點 |
| 星海巨牆 | 900 | 星海巨牆之心 | 巨牆心刃 | 星海心環 | 巨牆心核戰甲 | 星海壁行履 | 巨牆之心 |
| 宇宙深域 | 905 | 深域航行王 | 深域航王劍 | 航行王冕 | 深域航戰衣 | 航王遠渡履 | 深域星圖 |
| 宇宙深域 | 910 | 黑星遠征母體 | 黑星遠征鐮 | 母體遠征環 | 黑星母戰護殼 | 遠征深空足甲 | 黑星母體晶 |
| 宇宙深域 | 915 | 宇宙深井巨獸 | 深井巨獸牙 | 巨獸深淵面甲 | 深井獸皇護甲 | 淵域踏星足鎧 | 深井獸心 |
| 宇宙深域 | 920 | 蒼穹遠征樞紐 | 蒼穹遠征槍 | 樞紐天冠 | 蒼穹遠征裝甲 | 樞紐長航脛甲 | 遠征航路節點 |
| 宇宙深域 | 925 | 無光星海帝艦 | 無光帝艦戟 | 星海帝冕 | 無光艦皇鎧 | 帝艦暗航履 | 無光艦隊星盤 |
| 宇宙深域 | 930 | 深空文明智核 | 深空文明劍 | 智核星環 | 深空智戰外骨骼 | 文明探域足具 | 深空智識晶 |
| 宇宙深域 | 935 | 萬域吞星皇 | 萬域吞星戰斧 | 吞星皇冕 | 萬域皇戰鎧 | 吞星凌空步甲 | 萬域皇令 |
| 宇宙深域 | 940 | 暗界戰爭天體 | 暗界天體槍 | 戰爭天環 | 暗界天體裝甲 | 天體軌行足具 | 暗界軌道盤 |
| 宇宙深域 | 945 | 群星深淵統帥 | 深淵統帥戟 | 群星深淵冠 | 深淵軍勢戰甲 | 統帥深航履 | 深淵帥旗 |
| 宇宙深域 | 950 | 宇宙深域皇座 | 深域皇座劍 | 宇宙皇冠 | 深域王座鎧 | 皇座巡宇步裝 | 深域皇權印 |
| 宇宙統合戰爭 | 955 | 萬星統治者 | 萬星統治戟 | 統治星冕 | 萬星統御戰袍 | 統治巡域履 | 萬星統治令 |
| 宇宙統合戰爭 | 960 | 宇宙征服母艦 | 宇宙征服炮槍 | 母艦帝環 | 宇宙征戰裝甲 | 征服遠航脛鎧 | 宇宙艦權矩陣 |
| 宇宙統合戰爭 | 965 | 黑冠文明皇帝 | 黑冠帝皇劍 | 文明帝冕 | 黑冠帝戰鎧 | 帝皇跨宇星履 | 文明帝璽 |
| 宇宙統合戰爭 | 970 | 群星終戰巨構 | 群星終戰巨刃 | 終戰巨構環 | 群星巨構裝甲 | 終戰跨域足具 | 群星構造核心 |
| 宇宙統合戰爭 | 975 | 萬域殲滅主機 | 萬域殲滅鐮 | 主機帝冠 | 萬域滅絕外骨骼 | 殲滅巡宇步甲 | 萬域殲滅模組 |
| 宇宙統合戰爭 | 980 | 宇宙霸權帝座 | 宇宙霸權戟 | 帝座王冕 | 宇宙帝權鎧 | 帝座天行履 | 霸權帝印 |
| 宇宙統合戰爭 | 985 | 星海統合母體 | 星海統合槍 | 母體統合環 | 星海母皇護殼 | 統合越界足鎧 | 星海統合晶 |
| 宇宙統合戰爭 | 990 | 億星戰爭中樞 | 億星戰爭劍 | 中樞帝冠 | 億星終戰裝甲 | 戰爭跨宇足具 | 億星戰略樞 |
| 宇宙統合戰爭 | 995 | 宇宙征服者 | 宇宙征服戰斧 | 征服者帝冕 | 宇宙霸戰鎧 | 征服破域步裝 | 宇宙征服權柄 |
| 宇宙統合戰爭 | 1000 | 文明終焉核心 | 文明終焉聖劍 | 終焉統御天環 | 文明終焉神鎧 | 終焉超越星履 | 文明終焉之心 |

## 28.11 第二世界 save / state：目前 main 已採用的方向

目前已實作：
- 仍只有一份本機／雲端 save，不拆世界存檔。
- `SAVE_SCHEMA_VERSION=14`。
- 正式世界階段旗標為 `secondWorld.entered`；**沒有 `currentWorld`**。
- `worldphase.js` 為世界階段與突破條件 owner。
- `secondWorld` 已有基礎 state：`entered`、100 Boss 的 `bossKilled`、`darkMatter`、`darkEnergy`、10 隻第二世界災厄基礎欄位。
- 舊裝備缺少 `item.world` 時 migration 視為世界 1。
- 正式突破只可由 `enterSecondWorld()` 完成；符合條件不代表已進入，不能由 migration／load 自動推導 `entered=true`。
- 世界突破已實作原子流程：重新驗證 → rollback snapshot → 清舊資源／殘留 → 一次正式 save → save 失敗回復 → save 成功後 reload。
- 銀河紀元金幣、基礎／進階強化石、待贖回裝備、特殊遭遇 pending、舊離線樣本／checkpoint、第一世界災厄殘 HP 已在正式突破時切斷。
- 裝備、背包、VIP、專精、+20 強化、印記、稱號、鏡像、虛空、故事／歷史資料保留。
- 玩家戰鬥速度：銀河紀元正式 1×；宇宙紀元一般玩家可選 1×／1.5×；2×仍只屬 GM override。

後續要求：
- 第二世界主線進度不可與第一世界 `MAPS` index 共用。
- Cloud save 仍整包傳同一份 state。
- 新功能要擴充既有 `secondWorld` 與正式 owner，不新增 `currentWorld`、平行 save 或第二套世界旗標。

## 28.12 回第一世界：封存模式最新方向

使用者目前傾向：正式進入第二世界後仍可回第一世界，但為避免跨世界平衡與 save 例外爆炸，第一世界改成「封存模式」。

目前已明確希望：
- 第一世界可以回去。
- 回去後不管用什麼系統，**不能得到東西／資源**。
- 第一世界不能賣出物品。
- 目的主要剩回顧、測試、展示。

為了保持規則一致，最新設計建議一起封：
- 第一世界 EXP = 0。
- 金幣 = 0。
- 基礎／進階強化石 = 0。
- 裝備掉落 = 0。
- VIP 積分 = 0。
- 印記／稱號／其他養成進度不再由封存第一世界取得。
- 第一世界離線收益停用。
- 第一世界死亡不扣第二世界 EXP、不遺失第二世界裝備。
- 第一世界所有販售／回收／贖回等經濟操作停用。
- 世界切換本身不應補血或發獎勵。

這樣可一次避免：
- Lv.501+ 回第一世界刷 EXP。
- Lv.500 Boss 因未來全域 cap 變 1000 而掉 Lv.501/502 舊世界裝。
- Lv.700+ 回第一世界懸賞／特殊遭遇產生高等第一世界裝備。
- 第一世界死亡把第二世界裝備丟進第一世界金幣贖回。
- 第一世界金幣與第二世界暗物質／暗能量互相轉換。
- 離線樣本／收益跨世界串錯。

### 第一世界副本

這是本次對話最後正在討論的項目，**還沒有寫 code，且「完全鎖死入口」或「封存但可進」尚未由使用者最後確認**。

已確定的原則：
- 第二世界的懸賞／競技／鏡像／災厄等未必沿用第一世界規則，因此不能把第二世界副本視為單純數值升級版。
- 第二世界副本應有自己的規則／進度／獎勵 owner，不應共用第一世界副本的正式進度。
- 若保留第一世界副本入口，必須處於封存模式：零收益、零正式養成進度。
- 若之後決定完全鎖死第一世界副本入口，則 UI 可以更簡單；待下一輪討論確認。
- 第二世界尚未設計完的副本可以先不開，不應阻塞第二世界主線先實作。

## 28.13 尚未完成的宇宙紀元主體

已完成並不再列待辦：
- World Phase／原子突破／Save schema 14。
- Lv.501～1000 effective cap / EXP。
- 100 Boss 主線資料、戰鬥、獎勵、裝備、單場／連戰、完整戰鬥 UI。
- GM-only background / catch-up。
- 角色頁、背包 sale owner、死亡／贖回。
- world2 offline sample 與正式離線收益。
- GM 宇宙 Boss 快速測試。
- GM 戰力基準雙世界完整重構。

真正仍未完成：
1. **第二世界文明災厄 10 隻**：每 50 級、30 true kills、persistent HP、文明等級升級。
2. **第二世界副本**：懸賞、競技等正式規則／進度／獎勵尚未完整落地；daily 必須沿用共用 owner。
3. **銀河紀元封存／回顧跨頁完整收尾**：尤其災厄、副本、戰線紀錄。
4. **戰線紀錄、設定、遊戲說明** 的宇宙紀元 UX 收尾。
5. **Cloud Save / migration 真實跨裝置救援驗證**：至少一次宇宙存檔上傳→乾淨環境下載→reload。
6. 宇宙主要架構接近完成後做 **全介面＋遊戲說明雙紀元語意總掃描**。
7. 全部完成後做一次 **GM／Integrity final sweep**。

不要再把「宇宙主線／角色／背包／離線收益／強化 +21～+40／專精第二世界 UX／文明等級 0～10／GM 戰力基準」列成未完成。


---

# 29. 宇宙紀元最新完成狀態與後續順序

> 本節只記目前有效狀態與真正剩餘工作。歷史批次若已被後續實作覆蓋，不再保留「當時尚未開放」之類過期敘述。

## 29.1 已完成：世界突破

- `worldphase.js` 正式 owner，唯一永久旗標 `secondWorld.entered`。
- 入場條件：Lv.500、銀河主線／最終故事完成、8 專精全 60、5 強化全 +20、10 印記全 10；VIP 不限。
- 符合條件 ≠ 已進入；必須玩家按正式入場確認。
- `enterSecondWorld()` 原子轉換：重新驗證 → snapshot → 清舊資源／舊離線殘留 → 一次 save → 失敗 rollback → 成功 reload。
- 不由 migration 自動推導 `entered=true`。

## 29.2 已完成：冒險主線（本對話第 1～7 批）

- `secondworlddata.js`：10 區／100 Boss／500 專屬裝備名稱。
- `levelprogression.js`：effective cap 500/1000、宇宙 EXP。
- `secondworldcombat.js`：Boss 基礎能力、traits、`runCombatCore()`。
- `secondworldrewards.js`：EXP／暗物質／暗能量／world2 裝備／死亡。
- `secondworldmainline.js`：正式單場、連續戰鬥、GM background、catch-up、完整 presentation。
- 玩家正式戰鬥 UI：HP 數字／血條、traits、浮字、暴擊／閃避／護盾／專精／印記演出。
- 正常 foreground 播完整演出；真正 background/catch-up 跳視覺但不跳正式 combat/settlement。
- 背景戰鬥 **GM only**，玩家無開關。

## 29.3 已完成：角色（第 8 批）

- `CHARACTER_WORLD_UI_VERSION=1`。
- 角色頁顯示目前紀元、effective cap、宇宙 EXP、暗物質／暗能量。
- 能力仍只讀 `playerCombatStats()`。
- 玩家 UI **不顯示裝備來源世界**；world 只做內部辨識。
- GM 角色管理依世界提供等級／金幣或暗物質／暗能量控制。

## 29.4 已完成：背包／sale owner（第 9 批）

- 單件／批量／自動出售／換裝整理／離線出售統一走正式 sale owner。
- 宇宙 world1 裝備出售收益 0。
- world2 出售暗物質；神話額外 +1 暗能量。
- 鑑價只放大暗物質。
- 鎖定裝備與神話自動出售保護保留。
- 玩家介面不顯示 world 來源文字。

## 29.5 已完成：offline sample（第 10 批）

- 宇宙 Boss 正式 foreground 勝利寫 `world:2 / targetType:"boss" / bossIndex / bossId` sample。
- 1×／1.5×／2× 各保留最近 8 筆。
- background、catch-up、戰鬥中途切背景、戰敗都不記 sample。
- migration 保留 world1 舊 sample 與 world2 Boss sample。

同批定案：
- **宇宙紀元內遺失的銀河裝備免費贖回；不再使用金幣。**

## 29.6 已完成：正式宇宙離線收益（第 11 批）

`SECOND_WORLD_OFFLINE_SETTLEMENT_VERSION=1`。
- 1 分鐘下限／12 小時上限。
- EXP：正式 Boss 收益 10%。
- 暗物質：正式 Boss 收益 10%。
- 裝備：正式 world2 掉裝 10%。
- 暗能量：直接強化資源 5%。
- 裝備出售走 `settleEquipmentSaleBatch()`。
- 不碰金幣、基礎／進階強化石、特殊遭遇、黑市、Boss 首殺進度。
- 失敗保留 rollback / retry / pending settlement。

## 29.7 已完成：GM 戰力基準三批重構

`GM_POWER_BENCHMARK_VERSION=17`。
- 先選紀元。
- 銀河：區域 → 地圖 → 怪物。
- 宇宙：區域 → Boss，沒有地圖層。
- 輸出／承傷／實戰共用目前選擇怪物。
- 銀河保留「本地圖 5 隻全部」；宇宙只有單 Boss。
- 摘要世界感知，只顯示目前紀元。
- legacy `universeCombatResult` / `gmPowerBenchmarkRunUniverseCombat` 已完全移除。
- Final Integrity 明確禁止舊 universe runner 回流。

## 29.8 已完成的重要維護

- Story Integrity CI 已同步 Story Progress V10，並實際確認 GitHub Actions 綠燈。
- Combat Speed iOS lexical-state bug 已修。
- Final Integrity 目前為 V17。
- 每批 JS/CSS 皆需 cache-bust。

## 29.9 已完成：強化 +21～+40

已正式實作：
- +21～+40 使用暗物質＋暗能量。
- target level `T=21..40`，`K=T-21`：
  ```js
  darkMatter = 30000 + 12000*K
  darkEnergy = 300 + 10*K
  ```
- 每級仍 +2.5% 主屬性；+40 總強化倍率 +100%。
- +20 銀河效果完整保留。
- 宇宙正式玩家範圍 +20～+40；純資源制，不設等級／區域／Boss 門檻。
- 玩家正式 UI、atomic rollback、migration、GM 正式管理、GM 沙盒 0～40、GM 戰力基準與 Integrity 已同步。

## 29.10 已完成：專精第二世界 UX／語意收尾

正式規則：
- training → EXP，Lv.60 = +150%。
- scavenge → 銀河怪物金幣／宇宙主線 Boss 直接暗物質，Lv.60 = +150%。
- appraisal → 銀河裝備金幣售價／宇宙 world2 裝備暗物質售價，Lv.60 = +150%；不放大暗能量。
- 其餘先制／連擊／穿透／反擊／汲取跨世界沿用原戰鬥效果。

玩家：
- 專精頁使用同一個 world-aware 語意 owner，自動依紀元顯示金幣或暗物質。
- 宇宙紀元顯示專精已完成；進入宇宙前 8 項必須全 Lv.60，不再以金幣繼續升級。
- 遊戲說明已建立 `gameGuideCategoriesForState(target)`，專精相關說明會依目前紀元自動換詞。

GM：
- 正式管理：銀河 Lv.0～60；宇宙正式固定 Lv.60，不允許製造 <60 的正式宇宙專精。
- 沙盒測試固定 Lv.0～60。
- 宇宙 Boss GM 測試與 GM 戰力基準摘要會使用宇宙專精經濟語意。
- `GM_POWER_BENCHMARK_VERSION=17`。

正式 owner／標記：
- `SPECIALIZATION_WORLD_SEMANTICS_VERSION=1`
- `SPECIALIZATION_PLAYER_WORLD_UI_VERSION=1`
- `SPECIALIZATION_GM_WORLD_SEMANTICS_VERSION=1`
- `GM_SPECIALIZATION_FORMAL_RANGE_VERSION=1`
- `GM_SPECIALIZATION_TEST_RANGE_VERSION=1`
- `SPECIALIZATION_WORLD_INTEGRITY_VERSION=1`
- `SECOND_WORLD_SPECIALIZATION_ECONOMY_VERSION=1`
- `SECOND_WORLD_GM_SPECIALIZATION_SEMANTICS_VERSION=1`
- `GAME_GUIDE_WORLD_AWARE_VERSION=1`
- `GAME_GUIDE_SPECIALIZATION_WORLD_VERSION=1`

## 29.11 已完成：文明等級 0～10

正式規則：
- state：`secondWorld.civilizationLevel`，範圍 Lv.0～10；進入宇宙起始 Lv.0。
- 每級玩家宇宙戰鬥 **最終傷害 +5%**。
- Lv.0 / 1 / 5 / 10 = ×1.00 / ×1.05 / ×1.25 / ×1.50。
- 文明倍率位於 Combat Core 的 late/final player damage layer，不寫入 ATK，也不影響 HP、DEF、暴擊、閃避。
- 銀河紀元永遠不套文明倍率。
- 不以暗物質／暗能量直接購買；正式升級來源保留給第二世界文明災厄。

玩家：
- 宇宙角色頁顯示文明等級、最終傷害加成與倍率；銀河角色頁不顯示。
- `CHARACTER_CIVILIZATION_UI_VERSION=1`。
- 遊戲說明 V16 已加入 world-aware 文明等級說明。

GM：
- 正式宇宙文明管理 Lv.0～10；銀河沒有正式文明等級管理值。
- 共用 GM 沙盒文明 Lv.0～10，不修改正式 state。
- 「同步角色到測試設定」已包含文明等級。
- 宇宙 Boss GM 測試會把測試文明等級傳入正式 final-damage layer。
- GM 戰力基準 V17：銀河固定 ×1.00；宇宙使用 GM 測試文明等級，輸出木樁與宇宙 Boss 實戰皆一致套用。

Migration / Integrity：
- `SECOND_WORLD_CIVILIZATION_MIGRATION_VERSION=1`。
- 舊 secondWorld 存檔缺欄位時補 `civilizationLevel=0`，不升 Save Schema。
- `CIVILIZATION_LEVEL_INTEGRITY_VERSION=1` 對 Lv.0/1/5/10、0～10 clamp、銀河隔離、舊存檔 migration、Combat Core 1.50× final layer、GM／Benchmark owner 做回歸。
- Runtime / Final Integrity 必須要求上述專屬 integrity report 通過。

正式 owner／版本：
- `SECOND_WORLD_CIVILIZATION_STATE_VERSION=1`
- `CIVILIZATION_CORE_VERSION=1`
- `CIVILIZATION_FINAL_DAMAGE_LAYER_VERSION=1`
- `COMBAT_PLAYER_FINAL_DAMAGE_LAYER_VERSION=1`
- `SECOND_WORLD_CIVILIZATION_COMBAT_VERSION=1`
- `CHARACTER_CIVILIZATION_UI_VERSION=1`
- `GM_CIVILIZATION_VERSION=1`
- `GM_CIVILIZATION_FORMAL_RANGE_VERSION=1`
- `GM_CIVILIZATION_TEST_RANGE_VERSION=1`
- `SECOND_WORLD_GM_CIVILIZATION_TEST_VERSION=1`
- `GM_POWER_BENCHMARK_VERSION=17`
- `GM_POWER_BENCHMARK_CIVILIZATION_VERSION=1`
- `GAME_GUIDE_VERSION=16`
- `GAME_GUIDE_CIVILIZATION_WORLD_VERSION=1`
- `CIVILIZATION_LEVEL_INTEGRITY_VERSION=1`

## 29.12 已完成：第二世界文明災厄（第 1～5 批完成）

第 1 批正式 owner：`secondworldcalamity.js`。

已完成：
- 10 隻正式 metadata：550、600…1000。
- 正式名稱依第 28.9 節：彼岸黑潮、群星焚爐、邊星獵皇、萬軍葬艦、超域蝕核、無盡兵災、星脈噬巢、巨牆戰堡、深域吞星、終戰天穹。
- 對應章末 Boss index：9、19、29、39、49、59、69、79、89、99。
- 每隻 `trueKills` 正規化範圍 0～30。
- HP：第 1 隻 1,000,000；之後每隻 +200,000，至第 10 隻 2,800,000。
- 正式戰鬥 metadata：ATK ×1.10、DEF ×1.05、crit/dodge 10%。
- 雙解鎖：已進宇宙 + 對應章末 Boss 完成；第 2 隻起另需前一文明等級完成。
- 進度 helper：1 kill = 3.33%、2 = 6.67%、30 = 100%。
- 未完成時 current HP 採 persistent。
- **完成 30 true kills 或對應文明等級已達成後，重打比照第一世界滿印記規則：每場從滿 HP 開始，殘血不再保存。**
- **完成狀態的連續討伐 policy 已定：本場結束後必須停止；包含「本場剛完成第 30 kill」與「原本已完成後重打」。真正 runtime 接線留第 2 批。**

版本：
- `SECOND_WORLD_CALAMITY_DATA_VERSION=1`
- `SECOND_WORLD_CALAMITY_STATE_VERSION=1`
- `SECOND_WORLD_CALAMITY_UNLOCK_VERSION=1`
- `SECOND_WORLD_CALAMITY_REPLAY_POLICY_VERSION=1`
- `SECOND_WORLD_CALAMITY_COUNT=10`
- `SECOND_WORLD_CALAMITY_TRUE_KILLS_REQUIRED=30`

第 2 批已完成：
- 「已現身」與「可挑戰」正式拆開：
  - 已現身／可見 = 對應區域最後 Boss 已首次擊破。
  - 可挑戰 = 已現身 + 前一文明等級完成。
  - 第 1 隻前置文明為 Lv.0，因此章末 Boss 完成後立即可打。
- 章末 Boss 首次擊破時，會排入一次「文明災厄已現身」通知；通知文字不宣稱已可挑戰。
- 若章末 Boss 在連續主線中首次擊破並使災厄現身，該場後停止主線連戰，先完成結算，再於關閉結算視窗後顯示現身通知。
- 正式 combat／settlement owner：`secondworldcalamityrun.js`。
- 未完成災厄戰敗時保存 persistent HP；下一場由殘血開始。
- 真正 HP 歸零才算 1 次 true kill。
- 第 30 次 true kill：`trueKills=30`、對應 Civilization +1、殘血清除。
- 玩家每場後恢復滿 HP；災厄不給 EXP／暗物質／暗能量／裝備等一般獎勵。
- 完成後重打每場從滿 HP 開始、敗北也不保存殘血、不再增加 trueKills／文明進度。
- 完成狀態若從 continuous runtime 進入，只打一場便以 civilization-complete 結束。
- 第二世界玩家頁已可看到「已現身但尚不可挑戰／可挑戰／文明階段已完成」三種狀態。
- 未完成：顯示單場挑戰＋連續討伐；完成：只顯示「單場重打」，不顯示連續重打。
- 第一世界同步：對應印記 Lv.10 後，災厄卡片與結果頁只保留「單場重打」，不再顯示連續討伐。

第 2 批版本：
- `SECOND_WORLD_CALAMITY_UNLOCK_VERSION=2`
- `SECOND_WORLD_CALAMITY_DISCOVERY_VERSION=1`
- `SECOND_WORLD_CALAMITY_COMBAT_VERSION=1`
- `SECOND_WORLD_CALAMITY_SETTLEMENT_VERSION=1`
- `SECOND_WORLD_CALAMITY_CONTINUOUS_VERSION=1`
- `SECOND_WORLD_CALAMITY_UI_VERSION=1`
- `SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION=1`
- `SECOND_WORLD_CALAMITY_APPEARANCE_TRIGGER_VERSION=1`
- `SECOND_WORLD_MAINLINE_VERSION=6`
- `CALAMITY_MAXED_REPLAY_SINGLE_ONLY_UI_VERSION=1`

第 3 批玩家 UI 收尾已完成：
- 第二世界首頁「文明災厄」入口改為宇宙語意：「討伐宇宙文明級威脅並提升文明等級」，不再顯示第一世界「培養永久印記」。
- 進入第二世界災厄頁不再誤呼叫第一世界 `prepareCivilizationCalamityEntry()`；新增 `prepareSecondWorldCivilizationCalamityEntry()`。
- 災厄頁頂部顯示目前文明 Lv.X / 10 與「每級宇宙最終傷害 +5%」。
- 第一隻災厄文明條件改為「無前置文明需求 ✓」，不再顯示沒有意義的「需要文明 Lv.0」。
- 戰鬥頁玩家卡補齊正式玩家名稱、ATK／DEF／暴擊／閃避資訊。
- 第 30 次 true kill 若使文明升級，結果頁明確顯示「文明等級提升至 Lv.X」與「宇宙戰鬥最終傷害永久提升 5%」。
- 現身通知 V2 除了「文明災厄已現身」，也會顯示當下是否已符合挑戰條件；未符合時顯示需要的前置文明等級，但不會誤稱已解鎖可打。
- 完成狀態仍只保留「單場重打」；未完成且可挑戰才顯示「單場挑戰／連續討伐」。
- 新增 `secondworldcalamityuiintegrity.js`，鎖住玩家 UI V2、現身通知 V2、挑戰 gate 與完成後單場重打 wiring。

第 3 批版本：
- `SECOND_WORLD_CALAMITY_UI_VERSION=2`
- `SECOND_WORLD_CALAMITY_PLAYER_SEMANTICS_VERSION=1`
- `SECOND_WORLD_CALAMITY_APPEARANCE_NOTICE_VERSION=2`
- `SECOND_WORLD_CALAMITY_UI_INTEGRITY_VERSION=1`

第 4 批 GM／測試／戰力基準已完成：
- 新增 `secondworldcalamitygm.js`，正式 GM 管理可選 10 隻宇宙文明災厄。
- 正式管理可直接調整 `trueKills 0～30` 與目前 HP。
- 提供「滿血」「瀕死 1 HP」「重置進度資料（保留文明）」與「同步文明等級」。
- GM 設 `trueKills=30` 時，會至少把正式文明等級提升到該災厄對應 Lv.，並清除 persistent HP。
- 「同步文明等級」只依 **從第 1 隻起連續完成 30 true kills** 的最高階重新計算 Civilization Lv.，避免跳階災厄誤推進文明。
- 新增宇宙文明災厄沙盒測試：不受正式解鎖限制，使用共用 GM 測試 VIP／專精／強化／印記／文明等級，不修改正式 HP、trueKills、文明等級或存檔。
- 沙盒提供單場與完整擊殺測試。
- 新增雙條件解鎖 probe，可測「章末 Boss 是否完成 + GM 測試文明等級」對已現身／可挑戰的影響。
- 戰力基準升級為 V18；宇宙紀元 Benchmark 內加入「文明災厄基準」。
- 災厄 Benchmark 使用同一份 `gmPowerBenchmarkSnapshot()`、文明倍率與印記 snapshot，提供 100／1000 場測試，輸出平均單場傷害、平均剩餘 HP、平均回合、單場擊殺率、玩家存活率。
- GM Hub 新增「宇宙文明災厄管理／測試」並納入正式排序。
- 新增 `secondworldcalamitygmintegrity.js`，鎖住 GM owner、Hub 註冊、正式 Combat Core 重用與 GM 測試專精／印記接線。

第 4 批版本：
- `GM_SECOND_WORLD_CALAMITY_VERSION=1`
- `GM_SECOND_WORLD_CALAMITY_FORMAL_VERSION=1`
- `GM_SECOND_WORLD_CALAMITY_TEST_VERSION=1`
- `GM_POWER_BENCHMARK_CALAMITY_VERSION=1`
- `GM_POWER_BENCHMARK_CALAMITY_INTEGRATION_VERSION=1`
- `GM_SECOND_WORLD_CALAMITY_INTEGRITY_VERSION=1`
- `GM_POWER_BENCHMARK_VERSION=18`
- `GM_HUB_EXTENSION_VERSION=9`

第 5 批完整 Integrity／Guide／handoff 收尾已完成：
- 新增 `secondworldcalamityintegrity.js`，作為第二世界文明災厄全鏈正式完整性檢查。
- 完整 Integrity 覆蓋：
  - 10 隻正式名稱、Lv.550～1000、章末 Boss index 9／19／…／99。
  - HP 1,000,000～2,800,000 曲線。
  - ATK ×1.10、DEF ×1.05、crit/dodge 10%。
  - State normalize／trueKills 0～30／完成後 currentHp 清除。
  - 「已現身」與「可挑戰」雙層判定。
  - 第 1 隻無前置文明需求，第 2～10 隻需前一文明等級。
  - 1／2／30 true kills 對應 3.33%／6.67%／100%。
  - 正式災厄敵人直接對齊章末 Boss 母體。
  - 未擊殺 persistent HP 寫回。
  - 第 30 次 true kill → Civilization +1。
  - 完成後滿 HP 重打、敗北不留殘血、不再增加進度。
  - 玩家每戰滿 HP、零 EXP／暗物質／暗能量／裝備。
  - 完成後連續討伐停止 wiring。
  - Atomic save／HP restore wiring。
  - 玩家 UI V2、GM V1、Benchmark V18 全鏈。
  - Game Guide 銀河／宇宙雙紀元文明災厄語意。
- `gameguide.js` 升級至 V17，新增 `GAME_GUIDE_CALAMITY_WORLD_VERSION=1`。
- 銀河紀元文明災厄說明維持：印記 Lv.10、未滿時 persistent HP、無一般獎勵、滿印記後只可單場重打且每場滿 HP。
- 宇宙紀元文明災厄說明改為正式規則：10 隻、章末 Boss 現身、前置文明雙條件、30 true kills、百分比進度、persistent HP、文明 +1、完成後滿血單場重打、無一般獎勵。
- 修正 `civilizationintegrity.js` 對 Benchmark 的舊 V17 期待，正式同步至 V18。
- Runtime Integrity／Final Integrity 已要求 `SECOND_WORLD_CALAMITY_FULL_INTEGRITY_REPORT.passed === true`。
- 至此第二世界文明災厄 5 批正式完成。

第 5 批版本：
- `SECOND_WORLD_CALAMITY_FULL_INTEGRITY_VERSION=1`
- `GAME_GUIDE_VERSION=17`
- `GAME_GUIDE_CALAMITY_WORLD_VERSION=1`

後續第二世界大型項目：
- 副本正式第二世界版。
- 銀河封存／回顧跨頁收尾。
- 戰線紀錄／設定／遊戲說明最後總掃描。
- 依第 32.11 節，在第二世界主要架構接近完成時必須執行雙紀元 UI／文案總掃描。

## 29.13 後續：副本

- 懸賞：第二世界版正式規則尚未完整實作。
- 競技：第二世界 1～10 階、對應區域開放＋評估門檻；正式 balance curve 尚不能自行發明。
- 鏡像：沿用正式永久能力 snapshot，新能力必須納入。
- 虛空：延續無限模式。
- daily 仍共用 `dailycore.js`；進宇宙不重置當日已使用次數。
- 銀河副本進宇宙後到底「封存可進」或「鎖入口」若仍未定，實作前詢問使用者，不能自行決定。

## 29.13 後續：銀河封存／回顧跨頁收尾

統一要求：
- 回顧零 EXP／金幣／強化石／裝備／VIP／印記／稱號／養成進度。
- 回顧死亡零損失。
- 不寫 offline sample／farm target。
- 不觸發特殊遭遇／黑市。
- 第一世界災厄回顧使用 runtime HP，不碰正式 persistent HP。
- 戰線紀錄只回顧，不重發獎勵。

## 29.14 後續：戰線紀錄／設定／遊戲說明

- 戰線紀錄加入兩紀元回顧 UX。
- 設定統一檢查宇宙 speed / world-aware 文案。
- 遊戲說明最後更新，只描述已正式落地規則，不把設計稿寫成已實作。

## 29.15 後續：Cloud Save／跨裝置

- 仍是整包單一 state。
- 驗證 secondWorld、world2 裝備、未來 +21～40、文明等級、副本進度完整保存。
- 舊 schema 只能 migration 補預設，不得自動判 `entered=true`。
- offline clock / pending settlement 與 cloud download 要相容。
- Save Write Guard V1 不可移除。
- 至少實測一次：宇宙存檔上傳 → 乾淨裝置／環境下載 → reload。

## 29.16 固定跨批規則

每一批正式功能修改後都要檢查：
1. GM 管理。
2. GM 測試。
3. 戰力基準。
4. Integrity。
5. 世界識別與文案。
6. save / rollback。
7. cache-bust。
8. 功能 probe。

禁止：
- 宇宙正式流程碰第一世界金幣／強化石。
- 銀河回顧產生任何正式收益／損失。
- duplicate owner / wrapper / fallback / 第二套公式／第二套 settlement。

---

# 30. 正式 owner 速查

- 世界／品質：`data.js`
- 主成長／裝備／save：`engine.js`
- save migration / load：`savemigration.js`
- Auth：`supabaseauth.js`
- Cloud save：`cloudsave.js`
- 主戰鬥 pipeline：`battlepipeline.js`
- Structured FX：`combatfx.js`
- Outer pacing：`combatpacing.js`
- Background：`backgroundprogress.js`
- Combat speed：`combatspeed.js`
- Offline：`offlineprogress.js`
- Offline sample producer：`battlepipeline.js`
- Offline checkpoint：`offlinefarmtarget.js`
- 專精：`specialization.js`
- VIP：`vipprogression.js`
- 強化 core：`enhancementcore.js`
- 強化石 reward：`enhancementrewards.js`
- 災厄 metadata：`calamityconfig.js`
- 災厄 state：`calamitystate.js`
- 印記：`markcore.js`
- 災厄 battle：`calamitycore.js`
- 災厄 run：`calamityrun.js`
- 災厄 UI：`calamityui.js`
- 災厄 / title GM：`calamitygm.js`
- 鏡像 config：`mirrorconfig.js`
- 鏡像 state：`mirrordungeonstate.js`
- 鏡像 run：`mirrordungeonrun.js`
- 稱號 state / unlock：`playertitlecore.js`
- 稱號 renderer：`playertitlerenderer.js`
- 稱號 UI：`playertitleui.js`
- 稱號 CSS：`playertitles.css`
- 稱號 integrity：`playertitleintegrity.js`
- GM Hub 外框／原生 renderer：`gmhub.js`
- GM section registry／排序：`gmhubextensions.js`
- GM 共用測試 state：`vipgm.js`
- GM 戰力基準：`gmpowerbenchmark.js`
- GM save JSON 管理：`gmdata.js`
- GM 背景戰鬥 gate：`gmbackground.js`
- GM 災厄／印記／稱號：`calamitygm.js`
- GM 鏡像：`mirrordungeongm.js`
- GM 劇情測試：`gmstorytest.js`
- 每日時鐘／副本管理 UI：`batch5ui.js`
- 全域 runtime integrity：`runtimeintegrity.js`
- final integrity：`finalintegrity.js`
- script / CSS 載入順序與 cache-bust：`index.html`

---

# 31. 下一個 ChatGPT 必須遵守的操作規範

1. **GitHub `main` 的實際程式碼是唯一真實來源。**
   - PROJECT_HANDOFF 只是摘要。
   - 修改前必須重新讀正式 owner、直接相依檔案與 `index.html`。

2. **使用者說「先討論／先查／先看／先檢查／先不要修改」時，不得寫 GitHub。**

3. **使用者說「做／修改／執行／第 N 批」時，可直接修改 GitHub `main`。**

4. **優先修改正式來源。**
   - 不用 wrapper/fallback 掩蓋 owner 問題。
   - 不新增 duplicate API、第二套 state、第二套公式、第二套 settlement。
   - 不因方便把宇宙資料硬塞進銀河 `MAPS/WORLD_REGIONS`。

5. **修改後必須重新 fetch `main` 自我檢查。**
   - JS：parse / `new Function` + 功能 probe。
   - CSS：brace balance + selector/animation 檢查。
   - 不能只因 update API 成功就宣稱完成。

6. **任何 JS/CSS 改動都要更新 `index.html` cache-bust。**
   - 新 JS 還要確認正式 load order。

7. **每批都檢查 GM／Integrity。**
   - GM 沙盒不得污染正式 save。
   - GM 管理若寫正式 state，必須走正式 save／rollback 語意。

8. **Save Write Guard V1 不可破壞。**
   - existing save 在成功 load resolve 前，不得被新 state 覆蓋。

9. **不要主動重構舊存檔語意。**
   - 除非使用者明確要求，或有可重現 bug。

10. **一批只做核准範圍。**
    - 不順手改 balance、故事、schema 或其他未授權功能。

---

# 32. 2026-09-22 宇宙紀元全面健檢／五批維護後最新基準

> 本節為目前 `main` 的最新維護基準。若前文與本節衝突，以 `main` 與本節較新的狀態為準。

## 32.1 Save／migration 世界感知安全

已完成：
- `SAVE_NORMALIZATION_WORLD_AWARE_VERSION=1`。
- `normalizeSaveState(target)` 與裝備 normalization 不再依賴尚未切換完成的 global `state` 判定世界。
- Lv.501～999 宇宙存檔不會再被 legacy `MAX_LEVEL=500` 清 EXP。
- Lv.500+ world2 裝備不會在 load / migration 時被壓回 Lv.500。
- 正式回歸 probe 已覆蓋 Lv.501／750／1000 與 Lv.505／750／1000 world2 裝備。
- Save schema 仍為 14；Save Write Guard V1 不可破壞。

## 32.2 Runtime／Final Integrity 已對齊 main

已清理過時檢查：
- Offline checkpoint recovery 正式為 V2。
- GM Power Benchmark 正式為 V14。
- Runtime 不再要求 Save Schema 13／Offline V1／Benchmark V9。
- Runtime / Final 都會檢查共用 Fast Catch-up owner 與四條正式接入路徑。

## 32.3 背包／裝備／sale owner 最新狀態

正式 mutation / sale owner 集中於 `equipmentlock.js`：
- `EQUIPMENT_ENHANCEMENT_PIPELINE_VERSION=4`。
- `EQUIPMENT_SALE_FAIL_CLOSED_VERSION=1`。
- `EQUIPMENT_LOST_GEAR_ECONOMY_NORMALIZATION_VERSION=1`。
- `ui.js` 舊 `equipBestAll / sellLowerAll / compareHtml / equipSelected / sellSelected / discardLostGear` mutation 實作已退休，只保留 UI。
- 宇宙紀元若正式 sale owner 未載入：不出售、不加金幣、不刪裝備；自動出售失敗時裝備保留。
- lostGear 正式規則：
  - world2 → 暗物質贖回，正式成本 = world2 出售價 ×10。
  - world1 + 已進宇宙紀元 → 免費贖回。
  - world1 + 銀河紀元 → 保留金幣贖回語意。

## 32.4 強化 cap owner／宇宙入口

正式世界範圍：
- `FIRST_WORLD_ENHANCEMENT_CAP=20`。
- `SECOND_WORLD_ENHANCEMENT_MIN=20`。
- `SECOND_WORLD_ENHANCEMENT_CAP=40`。
- `SECOND_WORLD_ENHANCEMENT_EXTENSION_ACTIVE=true`。
- `ENHANCEMENT_MAX_LEVEL=20` 只保留第一世界／legacy 相容；絕對上限由 `ENHANCEMENT_ABSOLUTE_MAX_LEVEL=40` 管理。
- `effectiveEnhancementMin(target)` / `effectiveEnhancementCap(target)` 是正式世界感知 owner。
- normalization 只做 0～cap 資料安全，不會把宇宙 <+20 異常免費補到 +20；`enhancementFormalStateIssues()` 負責非破壞式偵測。
- 宇宙紀元入口仍只讀第一世界完成門檻 +20，不會因第二世界 cap 40 而誤改成 +40。
- `WORLD_PHASE_ENHANCEMENT_REQUIREMENT_OWNER_VERSION=1`。

## 32.5 Save normalization 正式順序

`SAVE_NORMALIZATION_PIPELINE_VERSION=1`，正式順序：

```text
worldPhase
→ worldProgress
→ level
→ gear
→ enhancement
→ vip
→ specialization
→ daily
→ dungeon
→ calamity
→ titles
→ offline
→ persistentFlags
```

Root normalizer 與 `migrateSave()` 都採 world-first：
1. `normalizeSecondWorldState`
2. `normalizeWorldSaveState`
3. `normalizeLevelProgressionState`
4. gear
5. enhancement
6. 其餘系統

禁止恢復「先用第一世界規則碰資料，再由第二世界 owner 補救」的舊順序。

## 32.6 Fast Catch-up 共用政策

Background 仍只有一個 Single Active Flow。

共用 Fast Catch-up Policy：
- 1～30 場：每 5 場刷新 UI。
- 31～100：每 10 場。
- 101～500：每 25 場。
- 501+：每 50 場。
- checkpoint：前 100 每 50 場；101～500 每 100 場；501+ 每 200 場。
- 抽樣完整 presentation：每 100 場。
- 無畫面場次仍依 Structured Combat Pacing 消耗正式 background credit，不能因跳 DOM 而多算場數。

正式接入：
- 銀河主線。
- 宇宙主線。
- 文明災厄。
- 虛空幻境。

## 32.7 宇宙主線 atomic save：刻意保留

本次健檢後決定 **不把宇宙主線逐場 atomic save 批次化**。

理由：
- `settleSecondWorldBossVictory()` 每場採 snapshot → settlement → save → save 失敗整場 rollback。
- 這是正式資料安全邊界，不只是多餘 localStorage I/O。
- Fast Catch-up 已批次化 presentation / DOM / yield，但宇宙主線 settlement 仍逐場 atomic save。
- `SECOND_WORLD_ATOMIC_SETTLEMENT_VERSION=1`。
- `SECOND_WORLD_FAST_CATCH_UP_ATOMIC_SAVE_POLICY_VERSION=1`。
- 未來只有在設計完整「批次 transaction + rollback + interruption recovery」後才可考慮改，不能單純拔掉逐場 save。

## 32.8 secondworlddata 重複 region metadata：保留

100 Boss 目前每筆保留 `regionIndex / regionId / regionName`。
本次評估後不做去重，原因：
- 正式 registry 可自包含查詢，UI／GM 不需每次二次 join。
- `validateSecondWorldData()` 已有 `REGION_LINK` 檢查，逐區確認 Boss metadata 與 `REGIONS` 一致。
- 因此目前不存在「重複欄位無防護」問題；不為純粹減少欄位而增加所有 consumer 的查表耦合。

## 32.9 目前下一個真正大型功能

強化 +21～+40、專精第二世界 UX／語意收尾、文明等級 0～10 皆已完成。後續建議依序：
1. 第二世界文明災厄 10 隻。
2. 第二世界懸賞／競技等副本。
3. 銀河封存／回顧跨頁收尾。
4. Cloud Save 宇宙存檔真實跨裝置驗證。
5. **宇宙架構接近完成時，執行「全介面＋遊戲說明雙紀元語意總掃描」**。

目前只有使用者本人進行測試；健檢優先順序以資料安全、邏輯正確、效能、正式 owner、舊程式殘留為主，不需要為一般玩家尚未存在的 UX 誤解額外提高優先度。

---

# 32.10 2026-09-22 宇宙紀元強化 +21～+40 四批實作完成基準

正式 owner／版本：
- `ENHANCEMENT_WORLD_AWARE_CORE_VERSION=2`
- `ENHANCEMENT_FORMAL_RANGE_VERSION=2`
- `SECOND_WORLD_ENHANCEMENT_COST_VERSION=1`
- `ENHANCEMENT_MIGRATION_WORLD_AWARE_VERSION=2`
- `ENHANCEMENT_UI_VERSION=6`
- `SECOND_WORLD_ENHANCEMENT_PLAYER_FLOW_VERSION=1`
- `SECOND_WORLD_ENHANCEMENT_ATOMIC_UPGRADE_VERSION=1`
- `ENHANCEMENT_PLAYER_FORMAL_RANGE_VERSION=1`
- `GM_ENHANCEMENT_TEST_PIPELINE_VERSION=6`
- `GM_ENHANCEMENT_TEST_RANGE_VERSION=1`
- `GM_ENHANCEMENT_HUB_VERSION=5`
- `GM_ENHANCEMENT_FORMAL_RANGE_VERSION=1`
- `ENHANCEMENT_EXPLICIT_LEVEL_CAP_VERSION=1`
- `GM_POWER_BENCHMARK_VERSION=17`
- `GM_POWER_BENCHMARK_ENHANCEMENT_RANGE_VERSION=1`
- `ENHANCEMENT_FINAL_INTEGRITY_VERSION=2`

重要規則：
- 銀河正式玩家 +0～+20；宇宙正式玩家 +20～+40。
- 宇宙 +21～+40 為純資源制，不綁等級、區域或 Boss 進度。
- 成本維持：+21 30,000/300；+30 138,000/390；+40 258,000/490。
- 五欄 +20→+40 總成本：暗物質 14,400,000、暗能量 39,500。
- 正常宇宙 500→1000 滿專精主線生命週期資源已重新驗算，成本可成立，不需下修。
- 玩家高階強化採 atomic save rollback。
- 宇宙正式 <+20 是異常資料；不自動補值。
- GM 正式管理跟世界範圍；GM sandbox 固定可測 0～40。
- `engine.js` explicit enhancement test level 已改用絕對上限 40，避免 GM 選 +40 實際只算 +20。
- migration / Final Integrity 已對 +21/+30/+40、成本、+40=100%、正式最低 +20 與 reload 保留做回歸。

---

# 32.11 必做備忘：宇宙架構完成前的全介面／遊戲說明雙紀元語意總掃描

**這是使用者明確要求保留在 GitHub 的後續提醒，不可遺漏。**

當宇宙紀元主要架構（至少文明等級、第二世界文明災厄、主要第二世界副本／功能）大致完成後，必須主動提醒使用者安排一批「雙紀元 UI／文案總掃描」。

目標：
- 所有玩家介面依目前紀元使用正確詞彙與規則，不應把銀河的金幣／強化石／Lv.500／普通怪地圖結構帶進宇宙介面。
- 所有遊戲說明依目前紀元顯示對應版本；不只是專精。
- GM 正式管理、GM 測試、戰力基準摘要也要區分「正式角色所在紀元」與「測試選擇紀元」。
- 對同一功能若兩個紀元規則不同，優先使用共用 world-aware semantic/helper owner，不要在各頁散落手寫替換字串。
- 最後應掃描至少：首頁、主線／冒險、角色、裝備／背包、強化、專精、離線收益、死亡／贖回、副本、文明災厄、設定、GM、所有遊戲說明與結算文案。

目前已先完成的 world-aware 範例：
- 專精頁。
- 專精相關遊戲說明。
- GM 專精經濟摘要。
- GM 戰力基準專精語意。
- 文明等級角色頁。
- 文明等級相關遊戲說明。
- GM 文明等級正式／沙盒與戰力基準語意。

**不要因這些局部完成就把本項視為完成；必須等宇宙主要架構接近完成後再做全專案總掃描。**

---

# 32.12 2026-09-22 文明等級 0～10 四批實作完成基準

- Core / State / Migration / final damage layer 已完成。
- 玩家角色頁文明等級顯示已完成。
- GM 正式管理、GM 共用沙盒、宇宙 Boss GM 測試、GM 戰力基準 V17 已完成。
- 遊戲說明已 world-aware：銀河說明「不套用」、宇宙說明 Lv.0～10／每級 +5% final damage。
- 專屬 `civilizationintegrity.js` 已對公式、migration、銀河隔離與 Combat Core final layer 做非破壞回歸。
- **目前沒有正式升級途徑是刻意狀態**；下一個系統「第二世界文明災厄」完成後，才由 30 true kills 推進對應文明等級。

---

# 33. 下一個對話如何接手

標準指令：

> 讀取 GitHub `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查目前 `main` 的實際程式碼與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> **`main` 是唯一真實來源，handoff 只作摘要。**  
> 修改前先讀正式 owner 與直接相依檔案；修改後重新 fetch `main` 自我檢查。JS/CSS 有改動時同步更新 `index.html` cache-bust。  
> 我說「先討論／先查／先看／先檢查／先不要修改」時不得寫 GitHub；我說「做／修改／執行／第 N 批」時可直接修改 GitHub `main`。  
> 優先修改正式來源，不要額外建立 wrapper、fallback、第二套 state、第二套公式或第二套 settlement。  
> 目前宇宙紀元已完成：世界突破、Lv.501～1000 等級／EXP、100 Boss 主線、獎勵／world2 裝備、單場／連戰、完整戰鬥 UI、GM-only background/catch-up、角色、背包 sale owner、死亡／贖回、world2 offline sample、正式離線收益、強化 +21～+40、專精第二世界 UX／語意收尾、文明等級 0～10，以及 GM 戰力基準銀河／宇宙雙世界重構。  
> 真正下一批優先看 handoff 第 29 節；目前建議進入 **第二世界文明災厄 10 隻**。宇宙主要架構接近完成時，務必依第 32.11 節提醒使用者做全介面＋遊戲說明雙紀元語意總掃描。  
> 現在先不要修改任何檔案，先確認最新 main 狀態、正式 owner 與下一個未完成項目，再等我的下一個指令。

---

