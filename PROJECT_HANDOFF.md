# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-28（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本檔只做交接與索引；若本檔、舊對話、舊 Word、舊規格或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

第 9 大批、9 優化-1～5、以及第 10 大批 10-1～10-5 已完成。

第 10-5 施工前 main HEAD：

```text
7f62a7b3c1d259d809c39ef27df91fb35457fac3
```

本檔更新後仍可能因 handoff／cache-bust commit 再前進，請下一個 ChatGPT 一律重新讀 current `main`。

目前第三紀元主要版本／owner：

```text
SAVE_SCHEMA_VERSION = 16
SAVE_SCHEMA_EVOLUTION_POLICY_VERSION = 1
WORLD_PHASE_VERSION = 6
THIRD_WORLD_PHASE_VERSION = 5
THIRD_WORLD_DATA_VERSION = 6
THIRD_WORLD_COMBAT_VERSION = 5
THIRD_WORLD_PROGRESS_VERSION = 4
THIRD_WORLD_SETTLEMENT_VERSION = 4
THIRD_WORLD_RUN_VERSION = 6
THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION = 4
THIRD_WORLD_RUN_TOTALS_VERSION = 1
THIRD_WORLD_RUN_INTEGRITY_VERSION = 7
THIRD_WORLD_CORE_PROGRESSION_VERSION = 3
THIRD_WORLD_EQUIPMENT_REWARD_VERSION = 3
THIRD_WORLD_PLAYER_UI_VERSION = 6
THIRD_WORLD_PLAYER_FLOW_VERSION = 4
THIRD_WORLD_PLAYER_FLOW_RUN_SUMMARY_PRESENTATION_VERSION = 1
THIRD_WORLD_PLAYER_FLOW_TITLE_POST_FLOW_SEQUENCE_VERSION = 1
THIRD_WORLD_PLAYER_FLOW_STOP_REASON_PRESENTATION_VERSION = 1
PLAYER_SEMANTICS_UI_VERSION = 9
PLAYER_SEMANTICS_WORLD_PHASE_VERSION = 3
CIVILIZATION_THIRD_WORLD_DATA_CONTRACT_EXTENSION_VERSION = 25
```

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先讀 current main 的相關 owner。
2. 使用者說「先討論／先檢查／先不要修改」時，不得修改 GitHub。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再次確認。
4. 每批修改後重新讀 current main、compare base→head、自我檢查 UI／邏輯／資料寫入／舊檔相容，並查可用 Integrity／CI。
5. **任何 JS／CSS 修改都必須更新 `index.html` cache-bust。**
6. 優先擴充正式 owner；不要新增第二套 formula、combat engine、offline pipeline、phase owner 或 migration pipeline。
7. 第一／第二／第三紀元能共用的邏輯優先走 shared owner。
8. GM sandbox／benchmark state 不得污染 formal save。
9. `thirdWorld` persistent state 只存 root；stage、能力、5pp、稱號 tier、run death／active target／summary 都不得 persist。
10. 未定案的 W3 故事、final ending、競技場規則不得自行補成正式內容。
11. 不修改鏡像戰本體來實作 W3，除非使用者明示。
12. current main 若已完成某規格，承接現況，不重做。

---

# 2. 世界結構

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()`：1 / 2 / 3 分別代表銀河／宇宙／高維。

正式成長只允許 current phase：

```text
worldProgressionEnabled(world) === (world === currentWorldPhase())
```

進入高維紀元後：

- W1/W2 保留歷史與回顧；
- W3 為唯一正式成長世界；
- 鏡像／虛空沿用；
- 懸賞關閉；
- W3 Arena 尚未定案，維持 disabled。

---

# 3. 第三紀元進入條件與保留／清除

正式條件：

1. Lv1000；
2. 宇宙主線最終 Boss 完成＋最終故事完成；
3. 五部位 +40；
4. 文明 Lv10；
5. VIP ≥20；
6. 8 專精 Lv60；
7. 10 印記 Lv10。

保留：level/exp、VIP、裝備／背包、+40、專精、印記、文明 Lv10、鏡像／虛空、歷史與稱號。

進入時清理：暗物質／暗能量、lost gear、black market、W2 offline context／pending settlement、不可跨世界的 transient runtime。

---

# 4. Save／Migration／舊資料政策

正式 schema：`SAVE_SCHEMA_VERSION = 16`。

`thirdWorld` persistent allowlist：

```text
entered
completed
entryVersion
dimensionalStrings
coreLevel
coreProgress
bosses[].currentHp
story.introSeen
story.unlockedStage
story.finalSeen
```

不得 persist：run deaths／suppression、active target、pending events、recent summaries、run totals、Boss stage／abilities、5pp、title tier 等可推導狀態。

Schema 16 正式政策：

- `coreProgress` 是 additive optional field，缺少時預設 0；
- normalization-only 可留同一 schema；
- semantic reinterpretation／persistent-field-removal／incompatible-structure 必須升 schema；
- Schema 1～15 若夾帶 W3，視為開發期資料丟棄；
- future save fail-closed；
- `world=3` gear 只接受 source schema ≥16。

Core 舊資料信任邊界：

```text
entryVersion 0 / 1 = development-only unpaid core
entryVersion >= 2    = trusted formal core
```

對 entryVersion <2：coreLevel/coreProgress 歸零、dimensionalStrings 保留。
對 entryVersion ≥2：投入保留，progress 可 carry-forward，Lv10 overflow 回收為 dimensionalStrings。

---

# 5. 十王／Stage／能力／5%

每王最大 HP `1,100,000,000`；總 HP `11,000,000,000`。

100% 基準：ATK 15,000、DEF 10,000、暴擊 10%、閃避 10%、先制 +60%、連擊／穿透／反擊／汲取各 30%。

十王：

```text
01 破界天裁：ATK ×1.15
02 永劫重垣：DEF ×1.15
03 宿因天秤：暴擊 +6pp
04 無相彼岸：閃避 +6pp
05 萬象迴演：連擊 +10pp
06 維隙之刃：穿透 +10pp
07 逆因輪轉：反擊 +10pp
08 噬界深淵：汲取 +10pp
09 先驗之瞳：先制 +20pp
10 高維原點：ATK ×1.08、DEF ×1.08
```

Stage：>90% stage0；≤90/80/.../10% 對應 stage1～9。每階 ATK +600、DEF +1200、暴擊 +2pp、閃避 +2pp。

能力門檻：70 鎮心、60 壓制、50 韌性、40 復仇、30 反噬、20 無視、10 戰意。

戰線差距門檻：`55,000,000 HP`（設計概念 5pp）。玩家介面優先用 `%` 表示，不要把 pp 當一般玩家顯示單位。

- 只比較存活王；
- 目標王比最高存活王少 ≥55m，下一場不可開始；
- 死亡王退出比較；
- 最後一王免限制；
- battle start resolve 一次；
- 本場合法開始後即使跨線仍完整結算，下一場才鎖。

---

# 6. 等級／Combat／Settlement

Lv1000～1999 每級固定 `10,000,000 EXP`；Lv2000 EXP 歸零封頂。

正式永久削血：

```text
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

Boss 汲取不能回補歷史已削掉的永久 HP；死亡戰只要 settlement 合法仍可落帳。

正式順序：validate basis/stale guard → aggregateBefore → 寫 Boss currentHp → EXP/strings/升級 → post-EXP loot → title/story/death/stage/5% progression → shared transaction save。save 失敗完整 rollback。

十王全滅目前只產生 `completionReady=true`；`thirdWorld.completed` final owner 尚未施工。

---

# 7. 100 死連戰／界弦核心

正式連戰：

```text
最大死亡：100
每死壓制：0.50pp - coreLv × 0.04pp
Core Lv0：100死後約剩 50% MaxHP
Core Lv10：100死後約剩 90% MaxHP
```

- 新 run deaths=0；
- 玩家死亡且 Boss 未死才 +1 death；
- 成功 combat＋settlement 才 +1 battle；
- run start snapshot coreLevel／suppression；
- run active 禁止注入 core；
- Boss death／stage crossed／5% front／aggregate progress／death-limit 都結束整輪；
- manual stop／pagehide／reload 清 transient；
- recent summaries 最多 20；
- last-finished 只在 module memory；
- 第 10-5 起 run loop 另回傳 transient `totals`：永久削血、EXP、維度之弦、裝備數，用於玩家結算，不寫 save；
- W1/W2/W3 共用 continuous/background/Fast Catch-up infra。

界弦核心：Lv0～10，每級 1b 維度之弦，總投入 10b。採注入制；`coreProgress` 永久保存，可跨級；Lv10 停止吸收，多餘 strings 保留。

---

# 8. W3 裝備／Offline

正式 loot：95% 傳說／5% 神話；每場至少 1 件；沿用 VIP loot；item level = post-EXP player level（最高2000）；world=3；sell/buy=0；強化封頂 +40。

50 個正式裝備名稱已定，名稱 band 看十王 aggregate remaining HP。

Offline：sample V4，每速度最近8筆，速度池1/1.5/2，不記 boss identity；只給 gear opportunity，不削 Boss HP、不給 EXP／strings、不推 core/title/story/completion。

Known mismatch 尚待第15批：

```text
offlinestatecore.js: OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2
offlineworld3adapter.js validate(): 仍期待 1
```

---

# 9. 第 9 大批：高維正式玩家 UI（完成）

- Adventure 依 current phase routing；W3 直接進高維戰線。
- 高維戰線：aggregate 摘要、共通能力、連戰規則、2×5 十王卡、界弦核心。
- 單王卡只顯示剩餘 HP，不顯示單王 max HP；Stage／能力／5% 都讀 data owner。
- 頂部功能列真正三等分：左返回主頁／中「高維戰線」真正置中／右固定背包；背包不跟 Boss 位置走。
- Core inline：Lv、進度、strings、注入預覽、不可逆確認；UI 只呼叫正式 core transaction owner。
- W3 進入舊災厄頁為 review-only；Universe review 不呼叫正式 settlement。

第 9 優化-1～5 已完成 owner/phase 收斂、舊紀元語意、Core 安全與保值、Schema/legacy policy、Integrity/handoff closure。

---

# 10. 第 10 大批：正式連戰玩家流程與事件呈現（已完成）

## 10-1 連戰入口／選王頁

- 十王按鈕正式接 `startThirdWorldContinuousRun` / `stopThirdWorldContinuousRun`；
- 連戰時鎖其他王，不可中途換目標；
- 選王頁只顯示必要狀態：目標、死亡 X/100、目前最大 HP X%；
- 玩家顯示壓制統一用 `%`，不顯示 pp；
- 頂部三等分＋固定背包已完成。

## 10-2 共用戰鬥呈現／極簡模式

- `thirdworldplayerflow.js` 接既有 `prepareCombatPresentation()` / `animateStructuredCombatPresentation()`；
- 不建立第三套 combat renderer；
- 戰鬥頁精簡顯示 Boss、第幾場、死亡 X/100、目前最大 HP X%、速度；
- HP cap 真正作為玩家戰鬥血條 max；
- W3 透過 `registerMinimalModeAdapter()` 共用既有極簡模式。

## 10-3 進度事件

- Stage 多門檻一次跨越會合併單一事件 modal；
- 新能力解鎖併入同一 Stage 事件；
- 5% front、Boss death、aggregate progress 都由正式 settlement `eventSequence` 呈現；
- Fast Catch-up 不得吞終止事件；
- 十王全滅只提示 `completionReady`，不偷做 final story/completed。

## 10-4 背景／Fast Catch-up

- W3 與 W1/W2 共用 GM「背景戰鬥」gate；
- GM 背景關閉：進背景後不開始下一場，回前景續跑；
- GM 背景開啟：使用 shared `backgroundprogress.js` credit/Fast Catch-up；
- 回前景立即顯示快速補算；checkpoint 更新死亡、HP cap、Boss 永久 HP、Lv/EXP/strings；
- final sync 完整 render；
- pagehide/reload 仍清 transient，不 persist run。

## 10-5 連戰結算／停止原因／稱號排序

- `thirdworldrun.js` 每輪回傳完整 transient totals：永久削血、EXP、strings、裝備取得件數；不受 recent 20 筆截斷影響；
- 連戰結束會顯示：戰鬥場數、死亡數、永久削血、EXP、維度之弦、裝備數、Boss 剩餘 HP、停止原因；
- 停止原因分類仍使用 shared `continuousRunStopReasonMeta()`，玩家層只做文字呈現；
- pagehide/reload 不強制彈玩家結算；
- 正確順序：戰鬥／進度事件 → 連戰結算 → render → shared title post-flow；
- W3 不建立第三套稱號 modal，仍呼叫 `flushPendingPlayerTitleNoticeAfterFlow()`；
- Third World Integrity Contract 已納入 run totals、summary、stop reason presentation、title post-flow sequence。

**第 10 大批已正式收尾。**

---

# 11. 最近小修（第 10 批前）

- GM 正式角色印記：銀河可 0～10；宇宙／高維固定 Lv10；GM 測試 sandbox 仍可自由調整。
- 宇宙紀元遊戲說明的特殊怪名稱改讀正式 `specialmonsters.js` profile，不再寫死銀河名稱。

---

# 12. 尚未定案，不可自行決定

1. 高維序章具體故事文本。
2. 10 個高維 milestone 的完整故事／事件內容。
3. 十王全滅後最終通關故事／畫面。
4. 是否銜接低維輪迴／轉生。
5. W3 Arena 正式形式與數值曲線。
6. 高維專屬背景／動畫／特效細節。
7. 十王大量實測後的最終平衡。

50 個 W3 裝備名稱已完成，不在未定清單。

---

# 13. 後續施工順序：第 11～15 批

## 第 11 批：高維回顧＋三紀元歷史切換

高維已擊破王 review：固定最終 10% 型態（stage9）、滿 HP、單場、無收益／無 progression；不提供 Stage 選擇。

建立 session-only tabs：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

同 session 手動切換後普通 render 不跳回 current-world；reload 才回預設。不得 persist。

## 第 12 批：Story Trigger + Completion Framework

只做架構，不寫未定故事：intro trigger、900～0% milestone trigger、presentation queue、final completion framework、shared title post-flow 排序。

## 第 13 批：正式故事內容＋最終通關

**必須先與使用者討論並定案故事。** 才可實作 intro、10 段主劇情、final event、`finalSeen`、`thirdWorld.completed` 正式原子寫入與最終畫面。

## 第 14 批：副本／舊系統整合＋Arena 決策

實測 Mirror／Void；驗證 resource／return／nav／speed；確認 W3 不產特殊怪／特殊遭遇；Mirror/Void 不產 W3 mainline strings 或十王永久削血；bounty 保持關閉；Arena 未定則維持 disabled。

## 第 15 批：GM 完整化＋最終 Integrity／legacy closure

GM character：W3 Lv1000～2000、Core 0～10。Benchmark 新增高維存在：十王、Stage、runs、100-death simulation；輸出勝率、回合、總傷害、永久淨削血、回血、死亡、剩餘 HP、跨 Stage、Core 差異。

GM 正式管理只寫 root，不直接寫 stage／ability／5%／title tier。

最終 Integrity 優先修 Offline migration version mismatch，再檢查 GM sandbox、review、story/completion、dungeon policy、offline allowlist、W3 gear factory。

---

# 14. 第 11 批施工前必讀 owner

至少重新讀：

```text
PROJECT_HANDOFF.md
index.html
thirdworldui.js
thirdworldui.css
thirdworldplayerflow.js
thirdworldrun.js
thirdworlddata.js
thirdworldprogress.js
thirdworldcombat.js
worldmapui.js
playersemanticsui.js
storyrecordtabs.js
playertitleui.js
backgroundprogress.js
thirdworldintegritycontract.js
```

不要從本 handoff 的舊描述推測實作；仍需以 current main 實碼為準。

---

# 15. 最後提醒

目前已完成：

**W3 foundation → entry/save/migration → Lv1000～2000 → combat/settlement → Core/loot/offline → 高維戰線 UI → 正式 100 死連戰 → shared combat/minimal mode → Stage/5%/Boss/aggregate events → GM background gate/Fast Catch-up → 連戰總結 → shared title post-flow closure。**

下一步是 **第 11 批：高維回顧＋三紀元歷史切換**，不是再重做第 10 批玩家連戰流程。
