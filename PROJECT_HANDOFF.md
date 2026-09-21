# 《文明戰線》PROJECT HANDOFF
更新日期：2026-09-21  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本文件是交接摘要，不得凌駕於程式碼。若本文件與 `main` 衝突，一律以 `main` 為準，先重新讀取正式 owner 再判斷。

---

# 1. 專案定位

《文明戰線》是純前端網頁文字／數值養成／科幻星際 RPG，支援桌機與手機。

核心玩法：
- 主線打怪、升級、裝備掉落。
- 10 個大區域、100 張地圖，Lv.1～500。
- 普通／菁英／Boss。
- VIP、8 項專精、裝備強化。
- 懸賞、競技場、虛空、鏡像戰、文明災厄。
- 離線收益、背景連戰。
- Supabase Auth + 手動雲端存檔。
- 故事／戰線紀錄。
- GM 管理／測試系統。
- 玩家稱號系統：10 個文明災厄稱號 + 6 個鏡像戰稱號。

正式存檔 key：
- `frank_text_rpg_save`

正式存檔版本：
- `SAVE_VERSION = 13`
- `SAVE_SCHEMA_VERSION = 13`
- `SAVE_LOAD_PIPELINE_VERSION = 2`

最高等級：
- `MAX_LEVEL = 500`

---

# 2. 世界與地圖

正式世界由 `data.js` 的 `WORLD_REGIONS` 與各 `worldmaps-*.js` 固定註冊。

10 區：
1. 地球戰爭 Lv.1～50，map 0～9
2. 太陽系戰爭 Lv.51～100，map 10～19
3. 近星戰爭 Lv.101～150，map 20～29
4. 星際邊疆 Lv.151～200，map 30～39
5. 獵戶臂戰爭 Lv.201～250，map 40～49
6. 銀河邊境 Lv.251～300，map 50～59
7. 銀河中域 Lv.301～350，map 60～69
8. 銀河核心外圍 Lv.351～400，map 70～79
9. 銀河核心戰爭 Lv.401～450，map 80～89
10. 銀河統合戰爭 Lv.451～500，map 90～99

每區固定 10 張地圖，每張 5 級範圍。

正式原則：
- 地圖固定依 region id 註冊到指定 index。
- 不依賴 push/splice 或 script 載入順序決定 map index。
- `validateWorldMapRegistration()` 會驗證 100 張地圖完整性。

---

# 3. 主線成長與經濟公式

## EXP

`engine.js`：

```js
sameExp(l) = ceil(25 + 4*l)

expProgressionFactor(l)
= 5 + 495 * (1 - exp(-(l-1)/142))

expNeed(l)
= ceil(sameExp(l) * expProgressionFactor(l))
```

怪物等級差 EXP multiplier：
- 怪物高玩家 ≥5：1.3
- +3～+4：1.2
- +1～+2：1.1
- 同級：1
- 低 1～2：0.9
- 低 3～5：0.6
- 低 6～10：0.25
- 再更低：0.05

怪物 EXP 類型倍率：
- 普通：1
- 菁英：2
- Boss：5

## 金幣

```js
goldBase(l) = ceil(6 + 4*l)
```

類型倍率：
- 普通：1
- 菁英：2.5
- Boss：6

## 死亡

- 未滿 500 級：扣目前等級升級需求的 10% EXP，上限扣至 0。
- 有穿裝備時，30% 機率遺失一件已裝備裝備。
- VIP 20 可免除裝備遺失。
- 遺失裝備可在背包贖回，贖回費用為該裝備買價 ×2。

## 主線怪物正式能力公式

正式 owner：`balance.js`，`MAIN_MONSTER_BALANCE_VERSION = 1`。

基礎：
```js
HP  = ceil(55 + 24 * level)
ATK = ceil(9 + 4.2 * level)
DEF = ceil(2.5 + 2.0 * level)
```

style：
- tank：HP ×1.15、ATK ×0.95、DEF ×1
- attack：HP ×0.92、ATK ×1.10、DEF ×1
- 其他：×1

同一張地圖第 1～5 隻怪再套 stage：
1. HP ×1.22、ATK ×1.17、DEF ×1.10
2. HP ×1.31、ATK ×1.24、DEF ×1.14
3. HP ×1.34、ATK ×1.28、DEF ×1.15
4. HP ×1.39、ATK ×1.29、DEF ×1.17
5. HP ×1.44、ATK ×1.27、DEF ×1.17

每層倍率逐步 `ceil`。目前 `kind=normal/elite/boss` 本身沒有額外能力倍率；差異主要來自地圖資料的 style、位置 stage 與正式隨機 traits。

傷害公式 owner：`combatmath.js`：
```js
damage = max(1, ceil((ATK - DEF * 0.55) * random(0.95, 1.05)))
```

**Lv501～1000 的新主線怪物公式尚未正式實作。**
未來若要擴等，先用 GM 戰力基準收集數據，再改正式 `balance.js`；不要建立平行 monster formula。

---

# 4. 裝備

品質共 6 階：
1. 普通 common
2. 優良 uncommon
3. 稀有 rare
4. 史詩 epic
5. 傳說 legendary
6. 神話 mythic

正式品質倍率由 `data.js -> QUALITY` 持有。

掉裝率：
- 普通：25%
- 菁英：60%
- Boss：100%

掉落裝備等級會依怪物類型產生小幅上下浮動。

不要在新檔另建第二套裝備公式；正式 owner 仍以 `engine.js`、裝備相關 core 為準。

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

正式：
- `ENHANCEMENT_MAX_LEVEL = 20`
- 每級主屬性 +2.5%

倍率：
```js
1 + level * 2.5% 
```

升到目標等級 N 的成本：
- 基礎強化石：`50 * N`
- 進階強化石：`5 * N`

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

## Combat Speed 正式 owner

`combatspeed.js`：
- `COMBAT_SPEED_CORE_VERSION = 1`
- `COMBAT_SPEED_PLAYER_RULE_VERSION = 1`
- `COMBAT_SPEED_GM_OVERRIDE_VERSION = 1`
- 允許速度：`1 / 1.5 / 2`
- 正式玩家目前 Lv.1～500 固定為 `1×`。
- GM 可對目前登入帳號設定 `1× / 1.5× / 2×` override，存在 localStorage，登出時清除對應帳號 override。
- 未來若 Lv.500 後要正式解鎖玩家倍速，只應擴充 `combatspeed.js -> playerCombatSpeed()`，不要在各模式另做速度判斷。

## Structured Combat Pacing

`combatfx.js`：
- `STRUCTURED_COMBAT_PACING_VERSION = 2`
- `STRUCTURED_COMBAT_SPEED_AWARE_VERSION = 1`
- 1× 基準：
  - opening：140ms
  - impact：70ms
  - step：48ms
  - end：180ms
- 1.5×／2× 由正式 `combatSpeedScaledDelay()` 按倍速縮放。
- main / bounty / arena / mirror / void / calamity 都使用共用 structured presentation，不要在模式內另造 pacing。

目前已移除過去無必要的額外 60ms／80ms 啟動等待，不要自行恢復。

## Outer Pacing

`combatpacing.js`：
- `COMBAT_OUTER_PACING_VERSION = 2`
- `COMBAT_OUTER_GAP_MS = 140`
- main / bounty / arena / mirror / void / calamity 目前全部統一 140ms。
- Outer gap 是固定場間等待，不跟 Structured Combat Speed 一起縮放。

正式 owner：
- `combatspeed.js`：倍速規則。
- `combatfx.js`：戰鬥內動畫 pacing。
- `combatpacing.js`：場與場之間 pacing。

不要在各模式自己硬編第二套 delay，也不要恢復先前 220ms／300ms／350ms／450ms 等舊值。

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
- 金幣：10%。
- 裝備掉落機率：正式掉落流程的 10%。
- 戰鬥強化石：正式期望收益的 5%。
- battle sample 實際戰鬥時間合法值：100ms～300000ms；cycle / adjusted 上限 601000ms。
- `OFFLINE_BATTLE_SAMPLE_VERSION = 3`。
- `OFFLINE_SAMPLE_SELECTION_VERSION = 2`。
- 每個正式速度最多保留 8 筆真實樣本：1× 8 筆、1.5× 8 筆、2× 8 筆。
- `OFFLINE_COMBAT_SPEED_SAMPLE_VERSION = 1`。

正式樣本只來自：
- 前景主線普通／菁英。
- 必須實際勝利。
- Boss 不記樣本。
- 背景追趕、離線結算、其他副本不應寫正式 sample。

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
- 災厄剩餘 HP 會跨挑戰保留。
- 玩家每次挑戰後由正式 HP restore owner 恢復。

## Run

- `CALAMITY_RUN_VERSION = 1`
- `CALAMITY_CONTINUOUS_RULE_VERSION = 4`

支援：
- 單場挑戰
- 連續討伐
- 背景連戰
- 極簡模式

若本場真正首次取得災厄稱號：
- 連續討伐立即以 `title-first-kill` 停止。
- 不開始下一場。
- 讓玩家先看到正式稱號取得通知。

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

Save Schema 仍是 13；正式 state：

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

## 24.1 GM Hub registry

`gmhub.js` 只負責 Hub 外框、管理／測試分頁、section 展開狀態、共用樣式與關閉按鈕。

`gmhubextensions.js` 是正式 section registry owner：
- `GM_HUB_EXTENSION_VERSION = 7`
- `GM_HUB_REGISTRY_VERSION = 1`
- `registerGmHubSection()`
- `gmHubRegisteredSectionsHtml(mode)`
- `gmHubRegisteredSectionIds(mode)`

舊架構已退休：
- 不再先產整份 GM HTML 再用 `<template>` parse。
- 不再 `reorderSections()`。
- 不再由 extension 第二次 override `gmHtml()`。
- 所有原生與擴充 section 都走同一 registry。

管理頁正式順序：
1. 資料管理
2. 背景戰鬥
3. 角色管理
4. 專精管理
5. 強化管理
6. 印記管理
7. 副本管理

測試頁正式順序：
1. VIP 測試
2. 專精測試
3. 強化測試
4. 印記測試
5. 戰力基準測試
6. 地圖怪測試
7. 特殊怪測試
8. 懸賞戰測試
9. 競技場測試
10. 虛空幻境測試
11. 鏡像戰測試
12. 文明災厄測試
13. 稱號預覽
14. 劇情測試

section 展開／收合狀態由 `gmHubOpenSections` 保存於本次頁面生命週期。

## 24.2 GM 共用測試狀態

`vipgm.js`：
- `GM_TEST_STATE_VERSION = 1`
- `GM_ENHANCEMENT_TEST_PIPELINE_VERSION = 5`

`gmhub.js`：
- `GM_ENHANCEMENT_HUB_VERSION = 5`

共用測試狀態：VIP、8 項專精、5 個裝備欄位強化、10 枚印記。

上方按鈕正式名稱：**「同步角色到測試設定」**。

`gmUseCurrentTestStatus()` 先同步四類 test state，最後只做一次 `gmRefreshTestControls()`。測試 setter 可用 `refresh=false` 做批次同步，避免每改一項就重複操作 DOM。

GM 測試 state 只存在本次網頁工作階段；重新整理回預設。**不得 save、不得修改正式角色。**

## 24.3 戰力基準測試

正式 owner：`gmpowerbenchmark.js`

目前：
- `GM_POWER_BENCHMARK_VERSION = 9`
- `GM_POWER_BENCHMARK_BATCH_SIZE = 25`

用途：完整平衡分析，不是一般快速單怪測試。

選擇層級：
- 大階段
- 大區域
- 地圖
- 怪物
- 測試量 100 / 1000

「目前角色基準」顯示正式角色：
- Lv / VIP / VIP 積分
- HP / ATK / DEF / 暴擊 / 閃避
- 強化
- 專精
- 印記
- 裝備

每次執行輸出、承傷、主線實戰時都自動重新 `captureSnapshot()`；不需要手動同步按鈕。

### 輸出基準
敵人不還手，可用目前怪、最高普通怪、菁英、Boss 或自訂 DEF。統計：
- 平均每回合有效輸出
- 平均單次命中
- 最低／最高單次
- 實際暴擊率
- 平均普通攻擊
- 平均暴擊傷害
- 每回合平均連擊
- 連擊傷害占比
- 穿透觸發率
- 無視 DEF 觸發率
- 先制平均傷害
- 汲取觸發率

### 承傷／生存基準
玩家不主動攻擊，每場滿 HP 開始直到倒下；保留正式閃避、護盾、吸收、不屈、反擊、反噬。統計：
- 平均可承受回合
- 平均每回合 HP 損失
- 平均命中後 HP 損失
- 最低／最高單次 HP 損失
- 玩家實際閃避率
- 敵人命中後暴擊率
- 護盾平均吸收／場
- 吸收印記觸發率
- 反擊平均次數／場
- 反噬平均傷害／場
- 不屈救命率
- 達測試上限場數

### 現行主線實戰基準
可測單隻或整張地圖 5 隻。每場重新生成正式主線怪與隨機 traits，直接走正式 `runCombatCore()`。每隻怪統計：
- 隨機特性後平均 HP / ATK / DEF / 暴擊 / 閃避
- 勝率、勝敗場數
- 平均／最短／最長回合
- 勝利平均剩餘 HP
- 失敗時敵人平均剩餘 HP
- 玩家／敵人平均總傷害
- 玩家／敵人每回合傷害
- 雙方暴擊／閃避
- 專精平均觸發／場
- 印記事件平均／場
- 怪物特性出現率

### 摘要一致性
畫面與複製摘要共用正式欄位定義：
- `outputFields()`
- `defenseFields()`
- `combatPrimaryFields()`
- `combatDetailFields()`
- `combatEventGroups()`

複製摘要包含畫面已產生的完整測試結果。印記名稱統一走 `markcore.js -> markDisplayName()`，不再顯示 ward / suppression 等內部 key。

### 效能與 busy
100／1000 場分批執行，每 25 場讓出一次 event loop。測試期間：
- 執行按鈕顯示「測試中…」
- 基準選擇、重置、其他測試按鈕暫時 disabled
- 完成或錯誤後在 `finally` 解鎖

`combatcore.js` 沒有為此修改正式戰鬥規則；benchmark 仍讀正式 events 統計。輸出測試已由多次 filter 改成單次走訪 events。

## 24.4 地圖怪測試與戰力基準分工

- **地圖怪測試**：快速單怪功能測試，可直接指定任何已實作主線怪。
- **戰力基準測試**：100／1000 場量化平衡分析，包含輸出、承傷、實戰與完整摘要。

兩者都保留。

## 24.5 GM 資料管理

`gmdata.js`：
- `GM_DATA_MANAGEMENT_VERSION = 1`
- GM only
- 匯出正式本機 save JSON
- 匯入前先驗證並走正式 migration / normalization
- 確認後才覆蓋
- 匯入後重設離線基準，避免把檔案保存期間算成離線收益
- 不包含 Supabase session／帳號登入資料

## 24.6 GM 背景戰鬥

`gmbackground.js`：
- `GM_BACKGROUND_BATTLE_VERSION = 1`
- `GM_BACKGROUND_BATTLE_ALL_COMBAT_GATE_VERSION = 1`

GM 背景開關統一控制正式背景 gate；不要在個別模式再造第二個 GM gate。

## 24.7 角色／副本管理與小型效能收尾

角色管理：
- 指定等級
- 指定金幣
- 指定解鎖到等級關卡
- 重置 VIP（等級＋積分）
- 產生裝備

產生裝備的等級已改為數字輸入：
- `GM_GEAR_LEVEL_INPUT_VERSION = 1`
- min=1
- max=`MAX_LEVEL`
- 不再生成 Lv1～MAX_LEVEL 的超長 option list
- `gmCreateGear()` 仍驗證整數與範圍

副本管理：
- 套用副本／VIP 資料
- 重置今日副本
- 重置全部虛空紀錄
- 鏡像戰管理

`batch5ui.js`：
- `BATCH5_CLOCK_CACHE_VERSION = 1`
- 每日時鐘快取 `gameDailyClock` / `gameDailyClockTime` DOM reference；正常存在時每秒 tick 不再重複 lookup。

## 24.8 文明災厄／印記／稱號 GM

`calamitygm.js`：
- `GM_CALAMITY_TEST_VERSION = 1`
- `GM_MARK_MANAGEMENT_VERSION = 1`
- `GM_MARK_CONFIG_OWNER_VERSION = 1`
- `GM_PLAYER_TITLE_PREVIEW_VERSION = 3`

災厄 GM：
- 單次挑戰模擬
- 完整擊殺模擬
- 沙盒，不修改正式災厄 HP／印記

印記：
- 正式管理與測試分離
- `markcore.js` 正式公開 `markDefinition()`、`markDisplayName()`
- GM / benchmark 應透過 mark owner 取得名稱

稱號 GM 預覽：
- 顯示「稱號 + 目前正式玩家名字」
- 走正式 renderer
- 可用 `allowUnownedTitle:true` 預覽未擁有稱號
- 不解鎖、不裝備、不 save

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
曾因字面 `\n` 出現在 JS source 中造成 parser error。
修正後的工作規範：
- 所有改動 JS 必須重新 fetch main 後 parse。
- 不可只相信 update 成功。
- 不要做全域 `\n` replace；只能修明確的非法 source。

## B. 載入失敗覆蓋舊存檔
已由 Save Write Guard V1 正式解決。

## C. 災厄／一般戰鬥 HP bar 不更新
目前 structured combat presentation 已統一處理玩家／敵人 HP 與 shield UI。
若未來又出現，優先查 presentation owner，不要在各模式另寫一套血條更新。

## D. GM 稱號預覽只有稱號沒有玩家名
原因與 WebKit text fill 繼承／透明漸層有關。
目前 `.player-identity-name` 已有明確文字填色保護。

## E. 高階鏡像稱號手機效能
正式保留鏡像稱號複製語意，但手機停 enemy clone 動畫，避免同時跑兩套 19/20 完整動畫。

---

# 28. 第二世界 Lv.501～1000：最新規劃（**尚未寫入程式**）

> 這一節是 2026-09-21 最新設計基準，**不是目前 main 已實作功能**。目前正式程式仍只有第一世界 Lv.1～500，`MAX_LEVEL=500`、100 張 `MAPS`。  
> 實作時必須沿用正式 owner 與現有 save migration；不可直接把規劃文字當成已存在 API，也不可為省事建立平行公式／平行 save。

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

## 28.11 第二世界掛進現有 save / state 的設計方向

目前 main：
- 仍只有一份 save：`frank_text_rpg_save`。
- `SAVE_VERSION=13`、`SAVE_SCHEMA_VERSION=13`。
- 第一世界 `mapProgress / bossProgress / bossLocked / bossKilled / unlockedMap` 都依現有 100 張 `MAPS` 工作。
- 不建議把第二世界 100 Boss 直接硬塞到現有 `MAPS` index 100～199，避免污染第一世界 map index、offline sample 與既有邏輯。

最新設計方向是「**一份 save、一個角色、第一世界既有欄位不搬家，新增 secondWorld 區塊**」。

預計最少需要：
```js
currentWorld: 1, // 1 or 2

secondWorld: {
  entered: false,
  // 第二世界主線進度
  // darkMatter
  // darkEnergy
  // civilizationLevel
  // 第二世界災厄 10 隻的 currentHp / trueKills
  // 第二世界副本各自進度（待各模式規則定稿）
}
```

正式實作要求：
- 舊第一世界存檔欄位不改語意、不搬資料。
- 新欄位透過 `savemigration.js` / normalizer 補預設值。
- 不拆成「第一世界 save」與「第二世界 save」兩份 localStorage。
- Cloud save 仍整包傳同一份 state。
- 第一世界世界進度與第二世界世界進度不可共用同一組 index-based state。

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

## 28.13 仍未設計／未實作的第二世界項目

未完成：
- 第二世界正式資料 owner / JS 檔案架構。
- save schema version bump 與 migration。
- `currentWorld` / `secondWorld` 正式 state。
- 主頁「銀河彼端」入口與突破條件 UI。
- 第二世界冒險頁 10 區 / 100 Boss UI。
- 第二世界主線戰鬥、獎勵 settlement。
- 暗物質／暗能量 UI。
- +21～+40 強化正式程式。
- Civilization final damage 正式 integration。
- 第二世界災厄 state / run / UI。
- 第二世界懸賞、競技、鏡像、虛空等副本具體規則。
- 第二世界故事／戰線紀錄。
- 第二世界遊戲說明。
- 第二世界災厄是否給新稱號／其他獎勵。
- 第三世界條件（若有）尚未定案。

實作順序建議仍是：
1. save/state 與世界識別。
2. 第二世界 core data / Boss registration。
3. 冒險 UI。
4. 主線 combat / EXP / dark matter / dark energy / gear settlement。
5. +21～+40 強化。
6. 文明等級 + 第二世界災厄。
7. character / inventory / sale UI。
8. 第二世界副本。
9. 故事／說明／設定／主頁收尾。

---

# 29. 尚未完成／仍需實機觀察

目前這一輪 GM 管理／測試優化 1～12 已全部完成，沒有尚未做完的 GM 結構改造。

第二世界 Lv.501～1000 的規劃已大幅完成，且 **main 已開始第一階段骨架實作**。完整設計見第 28 節；實際功能仍以 main 為準。現況：
- `MAX_LEVEL=500`。
- `WORLD_REGIONS` 仍只有第一世界 10 區。
- `MAPS` 仍只有第一世界 100 張地圖。
- `balance.js MAIN_MONSTER_BALANCE_VERSION=1` 仍是第一世界正式主線能力 owner。
- `SAVE_SCHEMA_VERSION=14`；已新增 `worldphase.js` 與正式 `secondWorld.entered`／第二世界基礎 state。沒有 `currentWorld`，世界階段以 `secondWorld.entered` 為唯一正式旗標。
- 第 1 批目前只建立 World Phase / migration 骨架；`enterSecondWorld()` 仍刻意鎖定為 `transition-not-enabled`，尚未真的轉換世界或清資源。不可把第 28 節其餘規劃誤認為已存在程式功能。

仍建議實機觀察：
- iPhone Safari 跑戰力基準 1000 場、尤其「整張地圖 5 隻全部」時的 UI 流暢度、發熱與執行時間。
- iPhone Safari 上裝備「距神一步／神蹟」打鏡像戰的 FPS、發熱與視覺裁切。
- 16 個稱號在不同長度玩家名、桌機／手機實戰卡中的排版。
- background catch-up 長時間後的實際速度與 UI 流暢度。
- 雲端下載救援 + Save Write Guard 的真實跨裝置流程。

**舊存檔／舊資料處理目前不要主動重構。**
只有使用者明確要求，或出現可重現的舊檔 bug 證據時才處理。


## 29.1 宇宙紀元「舊資源殘留」延後改造清單（跨對話必讀）

> 這一節只記錄 **不屬於目前世界突破 4 批、必須延後到對應系統開發時處理** 的項目。  
> 目前 4 批內能處理的主畫面／角色／戰鬥狀態列／設定／基本世界轉換顯示，不在此重複。  
> **遊戲說明也刻意不列入；使用者會之後另行處理。**

### A. 背包出售／自動出售：延後到第二世界裝備與出售 owner 批次
目前第一世界正式流程仍直接使用 `state.gold`：
- `engine.js -> addItem()`：自動出售直接 `state.gold += sold`。
- `ui.js -> sellSelected()`、批量出售：直接增加金幣，確認／提示文字也固定寫「金幣」。
- `settlementui.js`：掉落自動出售顯示固定為「+X 金幣」。
- `enhancementrewards.js`：出售裝備目前還可能附帶第一世界強化石收益。

第二世界正式出售規則實作時必須統一改成單一 sale owner：
- `item.world===1` 且已進宇宙紀元：可刪除／出售，但 **收益 0**；不得回流金幣／第一世界強化石。
- `item.world===2`：出售取得暗物質；神話裝備另依正式規則取得暗能量。
- 手動出售、批量出售、自動出售、戰鬥結算出售、離線出售全部必須走同一 owner，禁止各自算一套。

### B. 懸賞戰：延後到第二世界懸賞正式實作
`dungeonbounty.js` 目前仍完整使用第一世界經濟：
- `goldMult / rewardGold / totalGold / soldGold`
- 勝利直接 `state.gold += rewardGold`
- UI 有「高金幣」「懸賞金幣」等文字。

第二世界懸賞開放前必須：
- 改為宇宙紀元正式暗物質獎勵。
- 不得產生金幣或第一世界強化石。
- 裝備出售必須改走第二世界統一 sale owner。
- 每日使用次數沿用既有 daily owner；不要另建平行 daily state。

### C. 離線收益：延後到第二世界 offline 批次
`offlineprogress.js` 目前仍會：
- 給金幣。
- 離線出售換金幣。
- 給基礎／進階強化石。
- UI 顯示金幣與強化石。

第二世界 offline 正式實作時必須：
- 完整沿用第一世界 offline 架構／速度樣本概念，但經濟軸改為暗物質。
- 第二世界 Boss 可建立正式 offline sample。
- 第二世界離線出售必須走統一 sale owner；世界 2 神話裝備若正式規則允許，暗能量也由同一 settlement 處理。
- 禁止任何 `state.gold`、`basicStones`、`advancedStones` 在宇宙紀元離線流程中增加。
- 世界突破時第一世界舊 sample / farm target / pending settlement / checkpoint 必須切斷；這部分屬目前世界突破批次，不是本節延後項目。

### D. 特殊遭遇／黑市：延後到世界 2 主線 gate / special encounter 清理批次
`specialencounter.js` 現在仍會產生：
- 金幣。
- 滿等 EXP 轉金幣。
- 裝備出售金幣。
- 第一世界強化石。
- 黑市情報 pending。

已定規則：**宇宙紀元沒有第一世界特殊遭遇／黑市特殊怪。**
因此未來不是把它改成暗物質版，而是：
- 宇宙紀元正式主線完全禁止此流程觸發。
- 世界突破時清掉 `pendingBlackMarketEncounter`。
- 銀河紀元回顧模式也不得觸發特殊遭遇。

### E. 死亡／遺失裝備／贖回：延後到第二世界死亡規則批次
`engine.js -> redeemLostGear()` 目前只會：
- 檢查 `state.gold`
- 扣金幣
- 使用既有第一世界贖回成本

宇宙紀元正式死亡／贖回實作前必須改掉：
- 第二世界贖回貨幣為暗物質。
- 世界 2 裝備贖回成本基準：正式第二世界出售價 × 已定倍率（目前設計基準為 ×10，實作前仍需重新核對最新決議）。
- **未解決問題：若宇宙紀元穿著 world=1 裝備並死亡遺失，因其宇宙紀元出售價為 0，贖回成本不能直接推成 0。實作這批前必須再問使用者，禁止自行決定。**
- 銀河紀元回顧戰不得造成正式死亡損失。

### F. Lv.500 / Lv.1000 滿等 EXP 轉換：延後到第二世界等級／EXP 批次
`levelcap.js`、`levelcapresult.js` 現在的正式規則仍是：
- Lv.500 滿等後部分 EXP 1:1 轉金幣。
- 結算會顯示「滿等 EXP 轉金幣」。

第二世界等級系統接入時必須：
- Lv.500 在正式進入宇宙紀元後不再是全域滿等。
- 禁止 Lv.501～1000 成長流程誤走「EXP → 金幣」。
- Lv.1000 的最終滿等處理不得自動沿用第一世界「轉金幣」規則；要依第二世界最終設計另定。
- `MAX_LEVEL` 不可只粗暴改成 1000；必須保留 500/1000 effective cap 的世界階段判定。

### G. 第二世界副本共用經濟
除懸賞外，未來任何第二世界副本 settlement 若需要一般資源：
- 不得直接引用第一世界 `goldReward()`／`state.gold`／強化石 reward。
- 競技場、鏡像、虛空是否給一般經濟資源，以各自正式規則為準，不得因「宇宙紀元」就自行補暗物質。
- GM 測試介面可保留銀河紀元金幣測試能力；未來若測第二世界，必須明確分世界，不得把 GM 全域文字直接改名造成第一世界測試失真。

### 驗收原則
等以上各延後系統逐一實作時，都要額外檢查：
1. 宇宙紀元玩家流程不會新增／扣除 `state.gold`。
2. 宇宙紀元玩家流程不會新增第一世界 `basicStones / advancedStones`。
3. UI 不會把舊資源當成宇宙紀元現役獎勵。
4. 世界 1 回顧不產生任何正式經濟收益或損失。
5. 新世界經濟統一走正式 owner，不新增第二套散落 settlement。

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

1. **永遠先讀 GitHub `main` 的實際程式碼。**
   - 不可只根據 PROJECT_HANDOFF、聊天記憶或舊 commit 判斷。
   - 至少先讀要修改的正式 owner、直接相依檔案與 `index.html`。

2. **使用者說「先討論／先看／先檢查／先不要修改」時，禁止寫 GitHub。**
   - 只能分析與提供建議。

3. **使用者說「做／修改／執行／第 N 批／寫入 GitHub」時，直接執行。**
   - 不要先用泛化理由說「無法寫 GitHub」。
   - GitHub 工具可用時應先實際執行。
   - 只有實際 GitHub 操作回傳錯誤時，才回報具體錯誤。

4. **優先修改正式 owner。**
   - 不新增第二套 state。
   - 不新增第二套公式。
   - 不新增第二套 settlement。
   - 不用 wrapper/fallback 掩蓋正式 owner 的問題。
   - 除非架構上真的需要，否則不要加 duplicate API。

5. **修改前先找唯一 owner。**
   - 例如 pacing 去 `combatpacing.js/combatfx.js`。
   - 稱號 state 去 `playertitlecore.js`。
   - 稱號 HTML 去 `playertitlerenderer.js`。
   - 稱號 UI 去 `playertitleui.js`。
   - 災厄 title metadata 去 `calamityconfig.js`。

6. **修改後必須重新 fetch `main` 自我檢查。**
   - 不能只根據 update API 成功就宣稱完成。

7. **JS 修改後：**
   - 重新 fetch 每一支改動 JS。
   - 用 parser / `new Function(content)` 驗證。
   - 檢查正式 API、owner、版本鏈與必要功能 probe。

8. **CSS 修改後：**
   - 重新 fetch CSS。
   - 檢查 brace balance。
   - 檢查 selector / animation / reduced-motion。
   - 確認沒有誤改其他系列。

9. **任何 JS/CSS 改動都要同步更新 `index.html` cache-bust。**
   - 新增 JS 也要確認正式載入順序。

10. **修改後自我檢查要針對需求，不只是語法。**
    - 例如 save rollback、GM 無副作用、背景單 flow、稱號權限等，都應做功能 probe。

11. **避免無關重構。**
    - 一批只做該批核准範圍。
    - 使用者沒要求的 balance、save schema、故事資料不要順手改。

12. **不要主動碰舊存檔語意。**
    - 除非使用者明確要求，或有可重現的舊檔 bug。

---

# 32. 下一個對話如何接手

把以下標準指令直接貼到新對話：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際程式碼與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> `main` 是唯一真實來源；handoff 只作摘要。  
> 修改前先讀正式 owner 與直接相依檔案；修改後重新 fetch `main` 自我檢查。JS/CSS 有改動時同步更新 `index.html` cache-bust。  
> 我說「先討論／先看／先檢查／先不要修改」時不得寫 GitHub；我說「做／修改／執行／第 N 批」時可直接修改 GitHub `main`。  
> 優先修改正式來源，不要額外建立 wrapper、fallback、第二套 state、第二套公式或第二套 settlement。  
> 第二世界 Lv.501～1000 目前仍是規劃、尚未寫入 main；先讀 handoff 第 28 節，再重新確認現有第一世界 save/state/owner，絕對不要把規劃當成已存在 API。  
> 現在先不要修改任何檔案，先確認最新狀態與正式 owner，然後等我的下一個指令。
