# 《文明戰線》PROJECT HANDOFF

更新日期：2026-09-27（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**
> 本檔只做交接與索引。若本檔、舊對話、舊 Word、舊規格、記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

第 9 大批與第 9 優化-1～5 已完成。本檔重寫前重新檢查的 main HEAD：

```text
d0b3728170dfbf8c42eaed353784265c1f9d69e9
```

第 9 優化-5 會再更新 Integrity contract、cache-bust 與本交接檔，因此上述 SHA 是本批施工基準，不是永遠固定值。

目前第三紀元主要版本／owner：

```text
SAVE_SCHEMA_VERSION = 16
SAVE_SCHEMA_EVOLUTION_POLICY_VERSION = 1
WORLD_PHASE_VERSION = 6
THIRD_WORLD_PHASE_VERSION = 5
THIRD_WORLD_PERSISTENCE_POLICY_VERSION = 2
THIRD_WORLD_CORE_PROGRESS_PERSISTENCE_VERSION = 1
THIRD_WORLD_CORE_PROGRESS_NORMALIZATION_VERSION = 2
THIRD_WORLD_DATA_VERSION = 6
THIRD_WORLD_COMBAT_VERSION = 5
THIRD_WORLD_PROGRESS_VERSION = 4
THIRD_WORLD_SETTLEMENT_VERSION = 4
THIRD_WORLD_RUN_VERSION = 5
THIRD_WORLD_CONTINUOUS_RUNTIME_VERSION = 4
THIRD_WORLD_CORE_PROGRESSION_VERSION = 3
THIRD_WORLD_EQUIPMENT_REWARD_VERSION = 3
THIRD_WORLD_PLAYER_UI_VERSION = 5
THIRD_WORLD_PLAYER_UI_CORE_VERSION = 2
PLAYER_SEMANTICS_UI_VERSION = 9
PLAYER_SEMANTICS_WORLD_PHASE_VERSION = 3
CIVILIZATION_THIRD_WORLD_DATA_CONTRACT_EXTENSION_VERSION = 21
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
9. `thirdWorld` persistent state 只存 root；stage、能力、5pp、稱號階等全部推導。
10. 未定案的 W3 故事、final ending、競技場規則、背景／動畫不得自行補成正式內容。
11. 不修改鏡像戰本體來實作 W3，除非使用者明示。
12. current main 若已完成某規格，承接現況，不重做。

---

# 2. 世界結構

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()`：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

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
5. VIP ≥20（由 `vipPoints` 推導）；
6. 8 專精 Lv60；
7. 10 印記 Lv10。

保留：level/exp、VIP、裝備／背包、+40、專精、印記、文明 Lv10、鏡像／虛空、歷史與稱號。

進入時：

- 暗物質／暗能量清零；
- lost gear 免費歸還；
- pending black market 清除；
- W2 offline context／pending settlement 截止；
- 不應跨世界的 transient runtime 清除。

---

# 4. Save／Migration／舊資料政策

正式 schema：

```text
SAVE_SCHEMA_VERSION = 16
```

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

不得 persist：

- run deaths／suppression；
- active target；
- pending run events；
- recent battle summaries；
- Boss stage／abilities；
- 5pp；
- title tier；
- 其他可由 root 推導的狀態。

Schema 16 正式政策：

- `coreProgress` 是 additive optional field；缺少時預設 `0`；
- normalization-only 修改可留在同一 schema；
- `semantic-reinterpretation`、`persistent-field-removal`、`incompatible-structure` 必須升 schema；
- 未知 change kind 不自動猜，policy 回 `null`；
- Schema 1～15 若夾帶 `thirdWorld`，視為開發期資料丟棄；
- pre-Schema16 會建立 `.pre-schema16-backup-v1`；
- future save fail-closed；
- `world=3` gear 只接受 source schema ≥16。

第三紀元 core 舊資料信任邊界：

```text
entryVersion 0 / 1 = 開發期未付款核心資料
entryVersion >= 2    = 正式可信核心資料
```

對 `entryVersion < 2`：

- `coreLevel` → 0；
- `coreProgress` → 0；
- 原本 `dimensionalStrings` 保留；
- 不把未付款核心換成免費維度之弦。

對 `entryVersion >= 2`：

- 核心投入保留；
- `coreProgress >= 1,000,000,000` 會 carry-forward；
- 到 Lv10 後仍多出的 progress 會回收到 `dimensionalStrings`，不吞資源。

---

# 5. 十王／Stage／能力／5pp

每王最大 HP：`1,100,000,000`；十王總 HP：`11,000,000,000`。

100% 基準：

```text
ATK 15,000
DEF 10,000
暴擊 10%
閃避 10%
先制 +60%
連擊 30%
穿透 30%
反擊 30%
汲取 30%
```

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

Stage：

```text
>90% stage0
≤90% stage1
≤80% stage2
≤70% stage3
≤60% stage4
≤50% stage5
≤40% stage6
≤30% stage7
≤20% stage8
≤10% stage9
```

每階：ATK +600、DEF +1200、暴擊 +2pp、閃避 +2pp。

能力門檻：

```text
70% 鎮心
60% 壓制
50% 韌性
40% 復仇
30% 反噬
20% 無視
10% 戰意
```

5pp：`55,000,000 HP`。

- 只比較存活王；
- 目標王比最高存活王少 ≥55m，下一場不可開始；
- 死亡王退出比較；
- 最後一王免 5pp；
- battle start resolve 一次；
- 本場合法開始後即使跨線仍完整結算，下一場才鎖。

---

# 6. 等級／Combat／Settlement

Lv1000～1999 每級固定 `10,000,000 EXP`；Lv2000 時 EXP 歸零封頂。

正式永久削血：

```text
有效永久削血 = max(0, formalStartHp - combatEndHp)
EXP = 有效永久削血
維度之弦 = 有效永久削血
```

Boss 汲取不能回補前幾場已永久削掉的歷史 HP；死亡戰只要 settlement 合法，仍可落帳該場淨削血。

正式順序：

```text
validate basis / stale guard
→ aggregateBefore
→ 寫 Boss currentHp
→ EXP + 維度之弦 + 升級
→ post-EXP level loot
→ title / story stage / death / stage / 5pp progression
→ shared transaction save
```

save 失敗完整 rollback。

十王全滅目前只產生 `completionReady = true`；`thirdWorld.completed` 的 final owner 尚未施工。

---

# 7. 100 死連戰／界弦核心底層

`thirdworldrun.js`：

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
- Boss death／stage crossed／5pp front／progress-event／death-limit 都結束整輪；
- manual stop／pagehide／reload 清 transient；
- recent summaries 最多 20；
- last-finished 只在 module memory，不 persist；
- W1/W2/W3 共用 continuous/background/Fast Catch-up infra。

界弦核心：

```text
Lv0～10
每級 1,000,000,000 維度之弦
總投入 10,000,000,000
```

第 9 批後正式採「注入制」：

- `thirdWorld.coreProgress` 永久保存本級部分進度；
- 可把目前可投入的維度之弦全部注入；
- 可一次跨多級；
- Lv10 停止吸收，多餘維度之弦保留；
- 正式 transaction owner：`injectAllThirdWorldCoreStrings()`；
- 舊 `upgradeThirdWorldCore()` 只是委派，不保留第二套規則。

---

# 8. W3 裝備／Offline

正式 W3 loot：

```text
傳說 95% / 神話 5%
每場至少 1 件
VIP loot 沿用
item level = post-EXP player level，最高 2000
world = 3
sell = 0
buy = 0
強化仍封頂 +40
```

50 個正式裝備名稱已定，名稱 band 只看十王 aggregate remaining HP。

Offline：

```text
OFFLINE_BATTLE_SAMPLE_VERSION = 4
每速度最近 8 筆
速度池 1 / 1.5 / 2
W3 sample type = higher-dimensional，不記 boss identity
```

W3 Offline 只給 gear opportunity：

- 不削 Boss HP；
- 不給 EXP；
- 不給維度之弦；
- 不推 core／title／story／completion；
- 普通傳說每部位只留最佳件；神話全留；其他丟棄且無資源收益。

Known mismatch 尚待第 15 批：

```text
offlinestatecore.js: OFFLINE_BATTLE_SAMPLE_MIGRATION_VERSION = 2
offlineworld3adapter.js validate(): 仍期待 1
```

---

# 9. 第 9 大批：高維正式玩家 UI（已完成）

## 9.1 三紀元 routing／共用語意

`playersemanticsui.js` 現在：

- Adventure 依 `currentWorldPhase()` 分流；
- W3 直接進高維戰線，不再因 `secondWorld.entered=true` 誤進 Universe 主線；
- 首頁、角色、設定、冒險語意辨識三紀元；
- 角色頁 W3 顯示維度之弦、文明 Lv10、界弦核心；
- 強化／專精正式 renderer 已 phase-aware，W3 不再先生成 Universe 語意再 DOM 補丁；
- W3 進入宇宙主線／災厄時改成歷史回顧語意。

仍允許 `playersemanticsui.js` 做必要跨模組 presentation，但不要再把正式 gameplay owner 搬進 DOM patch。

## 9.2 高維戰線 UI

`thirdworldui.js` 已正式存在。

頁面結構：

1. 高維戰線 aggregate 摘要；
2. 共通能力收合區；
3. 高維連續戰鬥規則說明；
4. 十王卡；
5. 十王下方直接接界弦核心，不另開一個永久主功能頁。

桌機十王 `2 × 5`；手機單欄。

頂部顯示：

- 十王總剩餘 HP／%；
- 已擊破數；
- 高維稱號；
- 維度之弦；
- 界弦核心 Lv。

單王卡：

- 名稱；
- 個體特化；
- **只顯示剩餘 HP，不顯示單王最大 HP**；
- HP bar／%；
- Stage；
- 已解鎖能力完整名稱；
- 可挑戰／5pp lock／最終存活／已擊破狀態。

UI 不重算 Stage／5pp／title；讀正式 data owner。

十王「開始連續戰鬥」按鈕目前仍為 disabled 骨架，正式玩家 runtime 接線屬第 10 批。

## 9.3 共通能力

十王共同能力只在上方收合區顯示一次，不在每張卡重複詳細規則。

每張王卡只列該王目前實際已解鎖的能力名稱。

## 9.4 界弦核心玩家 UI

十王下方直接顯示：

- Core Lv.X / 10；
- 本級注入進度；
- 維度之弦持有量；
- 本次可注入量；
- 每死壓制；
- 下一級壓制；
- 注入後預覽。

「全部注入」已加入不可逆確認：

- 本次注入量；
- Lv.X → Lv.Y；
- 注入後本級 progress；
- 剩餘維度之弦；
- 確認時會重新比對 plan，狀態變更即要求重新確認。

UI 只呼叫正式 `injectAllThirdWorldCoreStrings()`，不自行寫 state。

Core feedback 只在當次高維戰線 session 顯示；離頁再回來會清除舊訊息。

## 9.5 災厄歷史回顧語意

W3 進入「文明災厄」後：

- Universe 災厄轉為單場 sandbox 回顧；
- Galaxy 災厄亦保留回顧；
- 回顧無 EXP／資源／裝備／正式 HP／文明／印記／稱號進度；
- Universe review 使用 shared `runCombatCore()`，不呼叫正式 W2 calamity settlement；
- W3 也不再 queue 新的 Universe calamity 出現通知。

---

# 10. 第 9 優化-1～5（已完成）

## 優化-1：owner／phase 收斂

- 強化頁改 current-phase aware；
- 專精分離「曾進 W2」與「目前 phase」；
- 移除大量 W3 強化／專精 post-render DOM 補丁；
- Boss 個體特化 presentation 移至 `thirdworlddata.js` owner；
- UI magic number 改讀正式常數。

## 優化-2：玩家語意／舊紀元入口

- 專精展開說明 W3 語意一致；
- W3 文明災厄正式轉 review-only；
- Universe calamity formal action 在 W3 有 gate；
- Core feedback lifecycle 修正。

## 優化-3：Core 操作安全／資料保值

- 全部注入增加確認；
- `coreProgress >= 1b` 改 carry-forward；
- Lv10 overflow 回收到維度之弦；
- migration regression 擴充；
- core snapshot／plan／save normalize 共用 normalization owner。

## 優化-4：舊資料／schema policy 凍結

- `entryVersion < 2` 固定為 development-only unpaid core；
- `entryVersion >= 2` 正式可信；
- Schema 16 optional `coreProgress` policy 明文化；
- schema bump 邊界正式 owner 化；
- migration regression 覆蓋 V0/V1/V2/future entryVersion 與 schema boundary。

## 優化-5：Integrity／handoff closure

- `thirdworldintegritycontract.js` 納入第 9 批玩家 UI、Core confirmation、三紀元 semantics、Schema evolution policy、legacy core policy 與 persistent allowlist；
- `PROJECT_HANDOFF.md` 更新到第 9 大批完成狀態；
- JS cache-bust 同步更新；
- 第 9 大批不再列為 pending。

---

# 11. 尚未定案，不可自行決定

1. 高維序章具體故事文本。
2. 10 個高維 milestone 的完整故事／事件內容。
3. 十王全滅後最終通關故事／畫面。
4. 是否銜接低維輪迴／轉生。
5. W3 Arena 正式形式與數值曲線。
6. 高維專屬背景／動畫／特效細節。
7. 十王大量實測後的最終平衡。

50 個 W3 裝備名稱已完成，不在未定清單。

---

# 12. 後續施工順序：第 10～15 批

## 第 10 批：正式連戰玩家流程與事件呈現

把已完成的 `thirdworldrun.js` runtime 接到玩家 UI：

- 開始／停止 run；
- deaths / 100；
- 當前 HP cap／suppression；
- background／Fast Catch-up／回頁呈現；
- stage crossing 合併 modal；
- 新能力解鎖提示；
- 5pp lock；
- Boss death；
- shared title post-flow；
- 保持 progress-event terminal stop 語意。

注意：正式規則是「一輪最多 **100 次死亡**」，不是 100 場戰鬥。

## 第 11 批：高維回顧＋三紀元歷史切換

高維已擊破王 review：

```text
固定 10% 最終型態（stage9）
滿 HP
單場
無收益／無 progression
```

建立 session-only tabs：

```text
高維紀元
宇宙紀元・回顧
銀河紀元・回顧
```

同 session 手動切換後普通 render 不跳回 current-world；reload 才回預設。不得 persist。

## 第 12 批：Story Trigger + Completion Framework

只做架構，不寫未定故事：

- intro trigger；
- 900～0% milestone trigger；
- presentation queue；
- final completion framework；
- shared title post-flow 排序。

## 第 13 批：正式故事內容＋最終通關

**必須先與使用者討論並定案故事。**

才可實作：intro、10 段主劇情、final event、`finalSeen`、`thirdWorld.completed` 正式原子寫入、最終畫面。

## 第 14 批：副本／舊系統整合＋Arena 決策

- 實測 Mirror／Void；
- 驗證 resource／return／nav／speed；
- 確認 W3 不產特殊怪／特殊遭遇；
- 確認 Mirror/Void 不產 W3 mainline 維度之弦或十王永久削血；
- bounty 保持關閉；
- Arena 若仍未定，保持「等待高維競技場開放」disabled。

## 第 15 批：GM 完整化＋最終 Integrity／legacy closure

GM character：W3 Lv1000～2000、Core Lv0～10。

GM benchmark 正式新增高維存在：十王、Stage、runs、100-death simulation；輸出勝率、回合、總傷害、永久淨削血、回血、死亡、剩餘 HP、跨 Stage、Core 差異。

GM 正式管理只寫 root：

```text
thirdWorld.entered
thirdWorld.completed
state.level
thirdWorld.dimensionalStrings
thirdWorld.coreLevel
thirdWorld.coreProgress
thirdWorld.bosses[].currentHp
```

Boss preset 只寫 currentHp，不直接寫 stage／ability／5pp／title tier。

最終 Integrity 優先修正 Offline migration version mismatch，並檢查 GM sandbox、review、story/completion、dungeon policy、offline allowlist、W3 gear factory 等。

---

# 13. 第 10 批施工前必讀 owner

至少重新讀：

```text
PROJECT_HANDOFF.md
index.html
thirdworldui.js
thirdworldui.css
playersemanticsui.js
thirdworldrun.js
thirdworldcombat.js
thirdworldprogress.js
thirdworlddata.js
thirdworldcore.js
backgroundprogress.js
settlementui.js
playertitleui.js
thirdworldintegritycontract.js
```

不要從本 handoff 的舊描述推測實作；仍需以 current main 實碼為準。

---

# 14. 最後提醒

第 9 大批目前已經完成的是：

**三紀元 routing → 高維戰線 2×5 十王 UI → 共通能力 → 5pp inline 狀態 → 界弦核心注入 UI／確認 → W3 角色／強化／專精語意 → 舊紀元災厄 review 語意 → Core 舊檔保值／schema policy → 第 9 批 Integrity closure。**

下一步不是再重做高維戰線骨架，而是 **第 10 批：把正式連戰 runtime 接上玩家操作與事件 presentation。**
