# 《文明戰線》PROJECT HANDOFF
更新日期：2026-09-19  
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
- `VIP_PROGRESSION_VERSION = 12`
- `VIP_THRESHOLD_BASE = 2500`

升級門檻：
```js
VIP threshold(level) = 2500 * level^2
VIP level = floor(sqrt(vipPoints / 2500))
```

副本 VIP point multiplier：
- VIP 0～3：×1.00
- VIP 4～11：×1.10
- VIP 12～20：×1.20

VIP stat bonus 的正式數值 owner 仍在 `engine.js`，不要另造第二套。

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

## Structured Combat Pacing

`combatfx.js`：
- `STRUCTURED_COMBAT_PACING_VERSION = 2`
- opening：70ms
- impact：35ms
- step：24ms
- end：90ms

目前已移除過去無必要的額外 60ms 啟動等待，不要自行恢復。

## Outer Pacing

`combatpacing.js`：
- 主線普通：140ms
- 主線菁英：220ms
- 主線 Boss：140ms
- 虛空 floor：350ms
- 文明災厄 battle：350ms

正式 owner：
- `combatfx.js`：戰鬥內動畫 pacing
- `combatpacing.js`：場與場之間 pacing

不要在各模式自己硬編第二套 delay。

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
- battle sample 合法時間：100ms～601000ms。
- battle sample 最多保留 20 筆。
- `OFFLINE_BATTLE_SAMPLE_VERSION = 2`。

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

Offline target 使用合法 V2 sample；不要恢復舊 sample fallback。

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

# 24. GM：文明災厄／印記／稱號

`calamitygm.js`：

- `GM_CALAMITY_TEST_VERSION = 1`
- `GM_MARK_MANAGEMENT_VERSION = 1`
- `GM_MARK_CONFIG_OWNER_VERSION = 1`
- `GM_PLAYER_TITLE_PREVIEW_VERSION = 3`

## 災厄 GM
- 單次挑戰模擬。
- 完整擊殺模擬。
- 沙盒，不修改正式災厄 HP／印記。

## 印記 GM
- 正式管理與測試仍以既有 mark owner 為準。
- 測試狀態與正式 state 分離。

## 稱號 GM 預覽
目前不是「純稱號」預覽，而是：

**實戰名稱預覽 = 稱號 + 目前正式玩家名字**

- 直接使用正式 `playerIdentityNameHtml()`。
- 放進接近實戰的 `.combatant.player > h2` 結構。
- 有 HP 100/100 作尺寸參考。
- 前 10 災厄、後 6 鏡像。
- 16 個全部可預覽。
- 明確使用 `allowUnownedTitle:true`。
- 不解鎖、不裝備、不寫 `state.titles`、不 save。

玩家名字曾在預覽中因 `-webkit-text-fill-color` 被吃掉，現已修正：
- 正式 `.player-identity-name` 明確鎖 `-webkit-text-fill-color: currentColor`
- GM 預覽另有金色可見 fallback。

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

# 28. 目前沒有完成／仍需實機觀察的項目

目前本輪稱號系統的程式改造已完成，沒有已知必做的程式 TODO。

仍建議下一輪實測觀察：
- iPhone Safari 上裝備「距神一步／神蹟」打鏡像戰的 FPS、發熱與視覺裁切。
- 16 個稱號在不同長度玩家名、桌機／手機實戰卡中的排版。
- background catch-up 長時間後的實際速度與 UI 流暢度。
- 雲端下載救援 + Save Write Guard 的真實跨裝置流程。

**舊存檔處理目前不要主動重構。**  
本輪優化時使用者明確要求「舊檔案的處理先不要修改」。只有出現具體舊檔 bug 證據時再處理。

---

# 29. 正式 owner 速查

- 世界／品質：`data.js`
- 主成長／裝備／save：`engine.js`
- save migration / load：`savemigration.js`
- Auth：`supabaseauth.js`
- Cloud save：`cloudsave.js`
- 主戰鬥 pipeline：`battlepipeline.js`
- Structured FX：`combatfx.js`
- Outer pacing：`combatpacing.js`
- Background：`backgroundprogress.js`
- Offline：`offlineprogress.js`
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
- 全域 runtime integrity：`runtimeintegrity.js`
- final integrity：`finalintegrity.js`
- script / CSS 載入順序與 cache-bust：`index.html`

---

# 30. 下一個 ChatGPT 必須遵守的操作規範

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

# 31. 下一個對話如何接手

把以下指令直接貼到新對話：

> 讀取 `franksky1207/rpg` 的 `PROJECT_HANDOFF.md`，再重新檢查 GitHub `main` 的實際程式碼與 `index.html` 載入順序，完整承接《文明戰線》專案。  
> `main` 是唯一真實來源；handoff 只作摘要。  
> 現在先不要修改任何檔案，先確認最新狀態與正式 owner，然後等我的下一個指令。
