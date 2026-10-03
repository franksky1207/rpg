# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-03（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引、已完成現況與已定案但尚未施工的規格摘要。若本檔、舊對話、舊 Word、舊規格、其他 handoff 補充檔或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次 handoff 更新前重新檢查的 current `main` 功能 HEAD：

```text
a2f3983742458806ed5dada60e3d9707a6565928
```

本次已 fresh-read／重新核對的正式 owner 包含：

```text
reincarnationstate.js
reincarnationcore.js
breakthroughcore.js
breakthroughui.js
levelprogression.js
enhancementcombat.js
combatmath.js
mirrorcombatcore.js
combatspeed.js
savemigration.js
saveversionguard.js
settlementtransaction.js
newstatecontract.js
playersemanticsui.js
worldphaseui.js
reincarnationui.js
dailycore.js
index.html
相關 runtime integrity / workflow
```

並以舊 handoff 功能基準 `0c17d7ea24e68dbf93ad520597f0317b11474a14` 對 current HEAD 做 compare；期間共 111 commits，正式變更集中在轉生／突破／save migration／shared combat stats／重大轉換 UI／runtime regression，既有 W1/W2/W3 主體、既有 GM 主架構與裝備自動處理政策沒有被本輪推翻。

本次 handoff 更新只修改 `PROJECT_HANDOFF.md`，**不修改 JS／CSS／HTML／遊戲功能**，因此不更新 `index.html` cache-bust。

目前正式開發狀態：

```text
三大紀元既有正式內容：完成並維護／實測中
裝備自動處理政策收斂：完成
轉生核心資料與首輪隔離：完成
突破系統＋正式轉生最小可用流程：完成
轉生／突破後續優化第1～4批：完成
異宇宙實際玩法：尚未施工
轉生後 W1/W2/W3 自由重征服：尚未施工
越級 EXP／資源／離線與四大副本永久解鎖：尚未施工
轉生／異宇宙 GM 管理與完整全系統收尾：尚未施工
```

本次更新前 exact functional HEAD `a2f398...` 已確認：

```text
Runtime Integrity #1365：success
Story Integrity #932：success
Pages build and deployment #5316：success
```

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先 fresh read current `main` 的 `PROJECT_HANDOFF.md` 與本次會碰到的正式 owner／consumer。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須 fresh read current main、compare base→head，並自我檢查 UI／邏輯／資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。** Markdown-only 文件更新不需要 cache-bust。
6. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner、第二套 completion owner。**
7. 能共用就擴充 shared owner；不要因轉生、突破、異宇宙特殊而複製三紀元既有架構。
8. current main 已有 registry／policy／transaction／normalizer／integrity owner 時，優先延伸正式 owner，不疊 monkey-patch。
9. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark state 不得污染 formal save。
10. 修改前先找真正 owner／consumer；能改 owner 就不要在 UI 後處理硬蓋。
11. Integrity／Actions 沒有實際回傳成功時，不可宣稱 CI 已綠。
12. current main 若已完成某規格，承接現況，不重做。
13. 若設計文件與 main 衝突：**main 決定目前真實狀態；定案文件只決定尚未施工部分的目標行為。**
14. W3 正式 Story／Final 已完成；不可自行重寫、替換或擴增既有 11 篇正式主線。
15. 玩家正式用語固定為 **「10 名高維存在」**。
16. 玩家正式 UI／log 對突破的用語固定為 **「突破等級」**；`B` 只作內部設計／測試 shorthand，玩家畫面不得顯示 `B1`、`B+1`、`永久突破 B`。
17. Arena 相關現行係數一律以 current `thirdworldarena.js`／`dungeonarena.js`／`dungeonprogress.js` 為準。
18. `offlineprogress.js` 目前仍是經 audit 允許的 save compatibility wrapper；不要為形式上的「零 wrapper」直接拔除。
19. W3 永久 HP／settlement basis 是高風險正式契約；任何 combat 共用化都不得改變 `formalStartHp → combatEndHp → permanent delta` 語意。
20. GM native section registry 維持 late binding；GM W2/W3 正式進度重建維持 progression management owner；GM 正式資源／副本修改維持 atomic transaction。
21. 轉生／重征服施工的硬原則：**`reincarnation.count = 0` 必須 100% 維持首輪既有正式規則；只有 `count > 0` 才能啟用 rerun 分支。**
22. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner；不得分段 mutate、分段 save。
23. 異宇宙完整 200 名稱仍以《文明戰線_轉生與異宇宙系統_完整設計統整_2026-10-03_定案版.docx》為正式命名來源；未重新核對文件前不可自行 invent 名稱。

---

# 2. current main：三紀元正式基準

## 2.1 世界與等級

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()` 的 `1／2／3 對應銀河／宇宙／高維`，亦即：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

`levelprogression.js` current：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

W2 Lv.500～999 的 EXP 仍採既有固定約 250 場／級基準；W3 Lv.1000～1999 每級固定 10,000,000 EXP。

## 2.2 第三紀元既有內容

現行 W3 正式內容仍包含：

- 10 名高維存在；
- Stage／能力／首輪 5pp 戰線；
- 永久削血與正式 HP settlement；
- 500死連戰、Fast Catch-up、極簡模式；
- 維度之弦、界弦核心；
- W3 loot／offline；
- W3 Story 正式 11 篇／322頁與 Final Completion；
- W3 Arena；
- Mirror／Void shared 系統；
- 稱號、Guide、GM benchmark、正式進度管理。

W3 bounty 首輪仍維持 hidden／disabled；「首次轉生後四大副本永久解鎖」尚未施工。

## 2.3 現行首輪 W1→W2／W2→W3

首輪世界突破行為仍維持既有規則，轉生系統沒有直接改寫首輪 progression。

W2 entry 仍走既有銀河主線／養成要求；W3 entry 仍走既有宇宙主線／故事／+40／文明10／VIP20／專精／印記要求。

轉生後「故事不再阻塞、自由重征服」是後續 rerun 批次，current main 尚未實作。

## 2.4 W2 Arena 正式係數

```text
x = Rank - 1
HP     = 1.68 + 0.05x - 0.0027x²
Damage = 1.52 + 0.04x - 0.0019x²
DEF    = 1.11 + 0.022x - 0.00085x²
ARENA_ASSESS_RUNS = 500
ARENA_ASSESS_CLEAR_TARGET = 485   // 97%
```

---

# 3. current main：Save／Migration／資料安全

## 3.1 正式版本已升到 Schema17

current `savemigration.js`：

```text
SAVE_SCHEMA_VERSION = 17
SAVE_LOAD_PIPELINE_VERSION = 3
SAVE_NORMALIZATION_PIPELINE_VERSION = 3
SAVE_MIN_SUPPORTED_VERSION = 1
SAVE_LEGACY_SUPPORT_MODE = "all-known"
```

**舊 handoff 曾寫 `SAVE_SCHEMA_VERSION = 16`；此敘述已失效，current main 正式值是 17。**

Schema17 的關鍵用途是正式加入 `reincarnation` persistent root。

### 舊 Documentation Integrity 相容標記（不是 current 值）

目前 `tests/runtime/docs-integrity.js` 仍保留 pre-Schema17 的字串契約；以下字串只為相容既有文件測試，**不得解讀為目前正式版本或新規格**：

```text
SAVE_SCHEMA_VERSION = 16
currentWorldPhase()
1／2／3 對應銀河／宇宙／高維
thirdWorld
main` 的實際程式碼是唯一真實來源
```

current 正式 Save Schema 仍是 **17**；其中 `thirdWorld` 只是既有 persistent root／CI 搜尋字串。日後若正式更新 `tests/runtime/docs-integrity.js` 到 Schema17 契約，可刪除此相容註記。

## 3.2 pre-Schema17 安全政策

- Schema1～16 仍支援 migration；
- **任何 pre-Schema17 存檔即使意外含有 `reincarnation` root，也一律丟棄該 root，normalize 為首輪 `count=0`**，避免舊檔被誤判成已轉生；
- Schema17 才承認正式 reincarnation data；
- future save 仍 fail-closed；
- load pipeline 先 reincarnation normalization，再進 world phase／progression／level／gear／其他 subsystem；
- transient GM test state 持續不進 formal save。

## 3.3 Save safety

`saveversionguard.js` current Save Safety V2 仍提供 rolling verified local safety backup、容量診斷、舊 schema strict backup、future／legacy guard。

正式轉生另外直接使用這個 existing safety owner；沒有做第二套 storage backup 系統。

## 3.4 New-state normalizer contract

本輪新增 `newstatecontract.js`：

```text
NEW_STATE_NORMALIZER_CONTRACT_VERSION = 1
```

用途：若某 subsystem normalizer 錯誤回傳子物件而不是完整 root state，會拒絕用該物件取代整個 newState root，避免設定／裝備／inventory／progress 等被整包洗掉。

---

# 4. 【已完成】轉生核心資料與首輪隔離

正式 owner：`reincarnationstate.js`。

current version：

```text
REINCARNATION_STATE_VERSION = 6
REINCARNATION_LIFECYCLE_POLICY_VERSION = 1
REINCARNATION_DOMAIN_CONTEXT_VERSION = 1
REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION = 2
ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION = 2
```

## 4.1 persistent root

```text
reincarnation: {
  count,
  breakthrough: {
    permanent,
    milestoneLifeId,
    milestones: {100,200,...,1000}
  },
  alternateUniverse: {
    unlocked,
    deepestCleared,
    activeAttempt,
    lifeFailures: {lifeId, failures:{...}}
  }
}
```

`lifeId` 不另存一個可漂移 flag；正式生命 identity 由 `reincarnation.count` 衍生。

## 4.2 首輪隔離

正式 shared lifecycle：

```text
reincarnation.count = 0 → first-run
reincarnation.count > 0 → reincarnation-run
```

並已提供 world／level／story／dungeon／speed domain context helper。

首輪污染保護：

- `count=0` 時突破 permanent／milestones 強制清成0；
- pre-Schema17 一律視為未轉生；
- milestone ownership 與當前 lifeId 不一致時清除本輪 milestone，防跨生命殘留；
- 同 Schema17 舊格式缺 milestone owner 時會做安全 reconciliation。

## 4.3 異宇宙資料骨架已存在，但玩法尚未上線

已正式定義：

```text
ALTERNATE_UNIVERSE_MAX_DEPTH = 1000
traits = strong / ferocious / hard / swift / deadly / berserk / giant
中文 = 強壯／兇猛／堅硬／迅捷／致命／狂暴／巨體
```

active attempt normalization 已要求：

- lifeId 必須是當前生命；
- depth 1～1000；
- attemptId 非空；
- **恰好2個不同且合法的特性**；
- 1個／3個／重複／未知特性全部 fail-closed。

失敗紀錄已改為 canonical：

```text
lifeFailures: {
  lifeId,
  failures: { "U": 1..10 }
}
```

並已有 `alternateUniverseFailureCount()`、`alternateUniverseDepthLocked()`。

注意：這只是 state／normalization 骨架，**異宇宙資料表、入口、戰鬥、敵人公式、正式挑戰／結算、1000U progression 都還沒施工。**

---

# 5. 【已完成】突破系統

正式 owner：`breakthroughcore.js`，戰力 consumer 由 `enhancementcombat.js`、`combatmath.js`、Mirror shared combat 接入。

## 5.1 正式里程碑

首次遊戲尚未轉生：突破等級永遠為 Lv.0。

`count > 0` 後，每一輪自然升級跨過：

```text
Lv.100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000
```

各 +1，每輪最多 +10；Lv.1000～2000 不給突破。

`levelprogression.js` 是自然 EXP bridge owner：

- 先記錄此次自然升級的 startLevel；
- 一次升多級時比較 `startLevel → finalLevel`；
- Lv.73→312 會一次補 100／200／300，共 +3；
- milestones 寫入本輪生命 owner，reload 不重複；
- **GM／直接指定 level 不會經此 bridge，因此不會偷發正式突破。**

## 5.2 玩家正式用語

玩家 log／UI 固定：

```text
突破成功！
突破等級提升 N 級
目前突破等級 Lv.X
```

禁止玩家 UI 顯示 `B+1`、`B10` 等內部 shorthand。

## 5.3 裝備三圍公式

每 1 級突破：

```text
raw equipment HP / ATK / DEF +2.5%
```

只吃裝備原始 HP／ATK／DEF：

- base player stats 不吃；
- crit／dodge 不吃；
- enhancement 額外值不再吃突破；
- 突破與強化都各自從 raw equipment 推導，**彼此不複利**。

`enhancementcombat.js` current 正式結構：

```text
base player stats
+ raw equipment HP/ATK/DEF
+ enhancement extra（由 mainStat raw 獨立推導）
+ breakthrough bonus（由 aggregate raw equipment HP/ATK/DEF 推導）
→ VIP
→ 最終 character stat ceil
```

突破 bonus 在聚合 raw gear 後計算，不逐件 ceil；fraction 會保留到最後正式 character stat rounding。

## 5.4 最終傷害 shared owner

`combatmath.js` current：

```text
FORMAL_PLAYER_FINAL_DAMAGE_OWNER_VERSION = 1
finalDamageMultiplier
= 1
+ civilization final-damage add
+ breakthrough final-damage add
```

突破每級：

```text
+0.05 final damage
```

文明等級仍由正式 civilization owner 提供，所以文明 Lv.10 時等價：

```text
Final = 1.5 + 0.05 * 突破等級
```

不是乘法疊乘。

W1/W2/W3 shared world combat 與 Mirror snapshot／combat 已改讀同一 formal final-damage owner；GM benchmark 未新增另一套突破公式。

## 5.5 玩家突破提示與角色頁

新增 `breakthroughui.js`：

- 自然升級實際獲得突破時排隊顯示；
- 若其他 modal／正式 runtime busy，先延後，不硬蓋戰鬥 modal；
- 顯示跨越的里程碑、提升級數、目前突破等級、裝備三圍加成%、最終傷害加成%。

`playersemanticsui.js` 角色頁已加入唯讀：

```text
突破等級 Lv.X
```

目前只先加突破等級；原設計中更完整的「養成狀態／戰鬥加成總覽」尚未全部完成。

---

# 6. 【已完成】正式轉生最小可用流程

正式 owner：`reincarnationcore.js` + `settlementtransaction.js` + `reincarnationui.js`。

## 6.1 正式轉生資格

current main 已實作：

```text
角色 Lv.2000
+ 本輪第三紀元 10 名高維存在全滅
+ 本輪界弦核心 Lv.10
= 可正式轉生
```

**Story completion 不列入轉生資格。**

## 6.2 轉生時永久保留

current mutation 已保留：

- VIP 點數／等級；
- `reincarnation.breakthrough.permanent`；
- 稱號；
- settings／UI preference；
- daily 當日狀態；
- Story／戰線閱讀歷史；
- Mirror／Void 永久歷史；
- 異宇宙 permanent unlock／deepestCleared；
- 已裝備與背包中 `world===3 && level===2000` 的裝備。

1.5× 玩家速度由 `combatspeed.js` 直接以 `reincarnation.count > 0` 視為永久解鎖，因此轉生後即使回到 W1 仍可選 1×／1.5×。

## 6.3 轉生時重置

current mutation 已做：

- Lv.1、EXP=0、HP 依 reset 後正式 stats 回滿；
- 強化歸0；
- 8 專精歸0；
- 10 印記／W1 calamity state 重置；
- W1 正式 map／boss progress 重置；
- W2 state 重建 blank；
- W3 state 重建 blank，界弦核心／維度之弦回0；
- W1/W2 Arena current-life state 重置；
- 金幣、暗物質、暗能量與強化資源依 blank owner 歸零；
- pending black market／offline sample／pending settlement 等跨輪暫態清除；
- `lostGear=[]`；
- 異宇宙 activeAttempt／本輪 failures 清空並改綁新 lifeId；
- 本輪突破 milestones 全 false，permanent breakthrough 保留。

不合格的已裝備物會補正式 Lv.1 starter item；inventory 只保留符合 W3 Lv.2000 條件者。

## 6.4 異宇宙永久解鎖 proof salvage

正式轉生 mutation 在清掉 W3 bosses 前先讀「10 名高維存在已全滅」；若當下尚未寫 `alternateUniverse.unlocked`，會在轉生 commit 前把永久 unlock 記住，避免因 reset W3 而失去首次全滅證據。

目前仍沒有「擊敗第10名時立即開異宇宙入口」的完整玩法；真正 AU unlock UI／gameplay 在後續異宇宙批次做。

## 6.5 轉生 runtime blockers

轉生會讀 existing `worldTransitionRuntimeStatus()` 並額外檢查 background flow。

已驗證會阻擋：

- mainline active；
- Minimal Mode；
- background flow；
- special encounter／其他 world-transition safety subsystem；
- transaction busy；
- 已成功 commit、等待 reload 時的重複點擊。

## 6.6 shared transaction／rollback

`settlementtransaction.js` 已升 VERSION 2：

- snapshot root；
- mutation；
- root identity drift guard；
- save；
- save exception／save false／mutation failure 時 rollback；
- rollback 盡可能維持原 root 與 nested object reference identity，避免 consumer 持有舊 reference 後失效；
- nested concurrent transaction 回 `transaction-busy`。

正式轉生不另寫第二套 transaction engine。

## 6.7 轉生前 verified safety backup

第4批優化已加入：

```text
REINCARNATION_PRECOMMIT_BACKUP_VERSION = 1
createVerifiedReincarnationBackup()
```

流程：

```text
requirements
→ runtime preflight
→ JSON 序列化「轉生前完整 state」
→ existing ensureLocalSaveSafetyBackup("formal-reincarnation", raw)
→ 必須 verified=true 且 failed!=true
→ 才進 runSettlementTransaction()
```

若 backup 失敗：

- 不 mutation；
- 不 save；
- 原 state 不變；
- UI 顯示「無法建立轉生前安全備份，已取消轉生」。

## 6.8 成功 commit

成功後：

- `reincarnation.count +1`；
- save 成功才視為正式完成；
- session marker 寫入；
- 預設安排 reload；
- 同一頁面重複執行會回 `reincarnation-committed`，防 double commit。

---

# 7. 【已完成】重大轉換 UI 共用化

本輪沒有建立第二套轉生 modal framework。

`worldphaseui.js` current 同時擁有重大轉換 shared shell helper：

```text
majorTransitionEscape
majorTransitionEnsureOverlay
majorTransitionCloseOverlay
majorTransitionStatusMark
majorTransitionRequirementRow
majorTransitionRequirementSummary
majorTransitionRequirementsCardHtml
majorTransitionConfirmationCardHtml
```

`reincarnationui.js` 直接使用上述 shell；獨立 `majortransitionui.js` 已收回／刪除，不留第二 owner。

轉生 UI current：

- W3 home 在本輪10名高維存在已全滅後顯示「文明轉生」卡；
- requirement rows：Lv.2000／10名高維存在／界弦核心 Lv.10；
- ready 才出「開始轉生」；
- confirmation 清楚列「會保留／會重置／轉生後突破」；
- confirm button 防 double-click；
- failure message 分 backup failed／save failed／active runtime／transaction busy 等。

共用化 regression 另外鎖住 W1→W2、W2→W3 原本 requirement／confirmation 文案與按鈕，避免為了轉生 UI 而漂移既有世界突破行為。

---

# 8. 2026-10-02 已完成：裝備自動處理政策

這部分仍是正式 current main，沒有因轉生更新而失效。

## 8.1 六品質自動處理

`engine.js`：

- `settings.autoSell` 正式六格：普通／優良／稀有／史詩／傳說／神話；
- 舊五格資料補神話 `false`；
- newState 六格預設 false。

## 8.2 shared equipment disposition owner

`equipmentlock.js`：

```text
equipmentDropDisposition(item, state)
```

正式優先序：

1. locked → 保留；
2. `keepUpgrade` 且新裝較強 → 保留；
3. 該品質 auto-process → 處理；
4. 其餘保留。

神話沒有額外硬編碼；手動神話出售額外確認已退休。

## 8.3 Offline

`offlineprogress.js` 的 W1/W2/W3 裝備判定共用 `equipmentDropDisposition`；offline 只負責聚合／結算，不再維護第二套 Mythic 判定。

---

# 9. current main：GM／測試現況

本輪轉生／突破施工 **沒有新增正式 GM 轉生管理頁**；compare 可確認 GM 主檔沒有因這輪被修改。

目前 GM Hub 仍分「管理／測試」。既有正式能力包含：

- 角色、VIP、專精、強化、印記、文明管理；
- W1/W2/W3 正式進度管理；
- 副本管理；
- 資料匯出／匯入；
- 背景戰鬥；
- 主線鎖血；
- GM 戰鬥速度 1×／1.5×／2×；
- 角色能力測試；
- 戰力基準測試；
- 稱號預覽；
- 劇情測試。

既有原則仍有效：

- formal management 才寫正式 save；test sandbox 不污染正式 save；
- W2/W3 progress management 由正式 owner 重建；
- 正式 resource／dungeon 多欄位改動用 atomic transaction；
- W3 benchmark 共用正式 data／combat owner；
- benchmark result／test character 有 invalidation；
- 劇情測試即使未來做 rerun story suppression，仍必須保留人工播放能力。

### 尚未施工的 GM 轉生／異宇宙項目

- 指定轉生次數；
- 指定永久突破等級；
- GM 按鈕執行正式轉生 transaction；
- 指定 AU 永久解鎖／deepest U；
- 角色能力測試新增突破值與正式角色同步；
- 戰力 benchmark 新增異宇宙 U／traits／runs；
- 21種雙特性組合 diagnostic。

注意：GM 直接改角色 level **目前已不會觸發突破里程碑**，這點已由 progression design 保證；但正式 GM「突破測試欄位」尚未做。

---

# 10. 重要正式 owner 索引

施工前仍必須 fresh-search current main；以下只是現行索引。

## 轉生／突破

```text
reincarnationstate.js        // persistent lifecycle / normalization / AU state skeleton
breakthroughcore.js          // 突破里程碑、raw gear bonus、終傷 additive
reincarnationcore.js         // eligibility / reset / runtime guard / backup / formal commit
breakthroughui.js            // 玩家突破提示
reincarnationui.js           // 轉生 entry / requirements / confirmation
```

## World／Progression／UI

```text
worldphase.js
worldtransitionsafety.js
worldphaseui.js
levelprogression.js
playersemanticsui.js
thirdworldphase.js
thirdworlddata.js
thirdworldcore.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldplayerflow.js
thirdworldui.js
secondworldmainline.js
```

## Combat／Stats／Rewards

```text
engine.js
enhancementcore.js
enhancementcombat.js
combatmath.js
combatcore.js
battlepipeline.js
mirrorcombatcore.js
civilizationcore.js
specialization.js
markcore.js
settlementtransaction.js
equipmentlock.js
equipmentrewardcore.js
```

## Save／Migration／Offline

```text
savemigration.js
saveversionguard.js
newstatecontract.js
compatibilityowners.js
offlinestatecore.js
offlineprogress.js
offlineworld3adapter.js
thirdworldcombatsaveguard.js
```

## Dungeon／Arena／Mirror／Void

```text
dailycore.js
dungeonprogress.js
dungeonarena.js
thirdworldarena.js
thirdworldarenaui.js
dungeonbounty.js
dungeonvoid.js
dungeonvoidui.js
mirrordungeonstate.js
mirrordungeonrun.js
mirrordungeonui.js
mirrorcombatcore.js
```

## GM

```text
gmhub.js
gmhubextensions.js
gmtools.js
gmformaltransaction.js
gmdata.js
gmbackground.js
gmcombatspeed.js
gmpowerbenchmark.js
gmpowerbenchmarkstate.js
gmpowerbenchmarkworldphase.js
gmstorytest.js
secondworldprogressmanagement.js
thirdworldprogressmanagement.js
```

---

# 11. 轉生／異宇宙已定案但【尚未完成】的正式規格

尚未施工部分仍以《文明戰線_轉生與異宇宙系統_完整設計統整_2026-10-03_定案版.docx》為設計基準；下面只列 current main 尚缺的部分。

## 11.1 異宇宙實際玩法

定位：不是第四紀元，不新增 Lv.2001+、新裝備階級或新刷裝貨幣。

正式規模：

```text
200 個異宇宙 × 每宇宙5深度 = 1000U
外環 → 神庭 → 聖域 → 天座 → 主宰
```

20 類文化、200 名稱需從定案 Word 原文核對後寫入，不自行命名。

固定敵人曲線：

```text
HP  = 320000 + 30000U + 1500U²
ATK = 26000 + 600U
DEF = 12000 + 250U
```

敵人只看 U，不讀玩家突破等級做 dynamic scaling。

首次永久解鎖：第一次擊敗 W3 全10名高維存在。

一旦 unlocked：之後任何轉生輪／任何紀元／任何角色等級都可進入。

正式 challenge：

- 每次建立 active attempt 隨機2個不同特性；
- F5 不重抽；
- settlement 後下一場才重抽；
- 主動放棄未結算挑戰算1敗；
- 同一 U、同一 life 第1～9敗可重打；第10敗鎖該 U 到下次轉生；
- 不套 W3 十王專屬 specialization／marks。

state skeleton 已有；**gameplay owner 尚未建立。**

## 11.2 轉生後 W1/W2/W3 自由重征服

### W1 rerun

- 全地圖／普通／菁英／Boss 可直接挑戰；
- 不要求普通／菁英各10次前置；
- 不走首輪 bossLocked 迴圈；
- 不用角色等級當 Boss challenge gate；
- `bossKilled` 只記實際勝利，不假填；
- Lv.50／100／…／500 為關鍵節點；
- 高階關鍵王勝利向下涵蓋災厄／Arena 區域資格，但不偽造低階 boss kill history。

### W2 rerun

- 100 Boss 全部可直接挑戰；
- bossKilled 仍只記實際勝利；
- 550／600／…／1000 為10個 key bosses；
- 高階 key win 向下涵蓋災厄／Arena 區域資格；
- 文明災厄實際攻略鏈仍存在。

### 紀元邊界

```text
W1→W2：仍需 Lv.500
W2→W3：仍需 Lv.1000
```

轉生後故事完成不再額外阻塞世界突破。

### Story／W3 rerun

- 已體驗主線／過場／災厄提示／紀元說明不自動彈；
- 不阻塞 continuous battle／progression；
- 閱讀歷史仍保留回顧；
- 首輪 W3 維持5pp；轉生後 W3 rerun 取消5pp，可集中單王。

以上 current main **尚未施工**。

## 11.3 越級 EXP／核心資源

定案第一版：

```text
M = 1 + 0.03 * (enemyLevel - playerLevel)
```

只在 enemyLevel > playerLevel 時使用；目前不設 hard cap、也不設單場升級級數 hard cap。

同 M 套戰鬥直接產出：

- W1：金幣、基礎強化石、進階強化石；
- W2：暗物質、暗能量。

不套裝備 sale proceeds，避免雙重膨脹。

online／offline 必須共用一個正式 overlevel multiplier owner。

current main **尚未施工**。

## 11.4 四大副本永久解鎖

首次轉生後：

- 懸賞、競技場、鏡像、虛空永久解鎖；
- daily 不因轉生刷新；
- Mirror／Void permanent history 保留；
- W1/W2 Arena Rank 每輪重置；
- 區域資格依本輪最高 key boss downward coverage；
- 原 97% 晉階檢驗保留。

目前 current main 只完成：daily／Mirror／Void history 在正式轉生 mutation 中保留；**四副本低等級永久入口與 rerun Arena eligibility 尚未完成。**

## 11.5 更完整角色總覽／GM／AU regression

尚需補：

- 角色頁完整養成狀態與戰鬥加成 breakdown；
- AU home entry／最深U摘要；
- GM 轉生管理；
- GM breakthrough test value；
- GM AU benchmark；
- AU 21 trait-pair diagnostics；
- rerun／overlevel／dungeon／AU 全生命週期 regression。

---

# 12. 原定 7 大批：目前完成度

原施工順序：

```text
第1批：轉生核心資料與首輪隔離
第2批：突破系統＋正式轉生最小可用流程
第3批：異宇宙最小可玩版
第4批：異宇宙完整化與平衡測試
第5批：第一、第二、第三紀元轉生後重征服規則
第6批：越級 EXP／資源／離線整合＋四大副本永久解鎖
第7批：GM 管理／GM 測試／完整 Integrity／全系統回歸收尾
```

current main 實際進度：

```text
第1批：完成
第2批：完成
第2批後優化1～4：完成
第3批：未開始
第4批：未開始
第5批：未開始
第6批：未開始
第7批：未開始（但第1～2批相關 runtime regression 已先大量補齊）
```

不要把「第4批優化」誤認成原7大批的「第4批異宇宙完整化」；本對話最後完成的是**轉生／突破已完成部分的第4批優化**，不是 AU 第4大批。

---

# 13. 本輪轉生／突破優化第1～4批：已完成重點

## 優化第1批

- reincarnation lifecycle／domain context 收斂；
- Schema17 first-run isolation／milestone life ownership 加固；
- new-state normalizer root contract；
- AU trait canonicalization／failure owner normalization 基礎持續加固。

## 優化第2批

- 正式 combat stats 改成 target-state aware owner；
- 突破裝備三圍與 enhancement non-compounding／rounding 收斂；
- reset 後 HP 用 state-aware formal stats 計算；
- Mirror 正式 snapshot 接 breakthrough／shared final damage；
- 相關 first-run／detached-state regression 補齊。

## 優化第3批

- 玩家「突破成功」modal；
- 多里程碑通知；
- 角色頁顯示突破等級；
- 玩家正式文案全面用「突破等級」，不顯示內部 B shorthand。

## 優化第4批

- 正式轉生 precommit verified safety backup；
- backup fail-closed，失敗不 mutate／不 save；
- W1→W2、W2→W3、文明轉生重大轉換 UI shell 收斂到 `worldphaseui.js`；
- `reincarnationui.js` 使用 shared shell；
- 中間獨立 `majortransitionui.js` 已刪除，避免第二 owner；
- regression 鎖住 W2/W3 原文案與按鈕；
- 最後自我檢查補上 `reincarnationcore.js`／`worldphaseui.js`／`reincarnationui.js` 的 `index.html` cache-bust。

---

# 14. Runtime／Integrity 現況

本輪新增／擴充的主要 regression：

```text
reincarnation-save-integrity.js
reincarnation-normalization-opt-integrity.js
breakthrough-core-integrity.js
breakthrough-final-damage-integrity.js
reincarnation-reset-integrity.js
reincarnation-transaction-integrity.js
reincarnation-ui-integrity.js
reincarnation-opt-batch2-integrity.js
reincarnation-opt-batch3-integrity.js
reincarnation-opt-batch4-integrity.js
newstate-browser-integrity.js
newstate-save-owner-integrity.js
save-load-pipeline-integrity.js
```

已實際覆蓋：

- Schema1／9／15／16→17 migration；
- pre17 reincarnation contamination discard；
- first-run zero breakthrough pollution；
- milestone life ownership；
- AU exactly-2-traits normalization；
- AU failure canonicalization；
- natural multi-level breakthrough awards／duplicate guard／GM direct-level no-award；
- raw equipment breakthrough formula；
- enhancement + breakthrough non-compounding；
- shared final damage formula；
- formal reset preserve/reset matrix；
- W3 Lv2000 equipment filter；
- daily／VIP／Story／Mirror／Void preservation；
- runtime blockers；
- transaction rollback identity；
- double-commit guard；
- reincarnation UI；
- 1.5× after reincarnation；
- precommit backup success／forced failure；
- W1→W2／W2→W3 UI regression；
- new-state root normalizer protection；
- save-load fail-closed。

功能 HEAD `a2f398...` 最後確認：

```text
Runtime Integrity #1365 success
Story Integrity #932 success
Pages #5316 success
```

注意：任何後續 commit 都要看**新 HEAD**的 workflow，不得沿用這組舊綠燈。

---

# 15. 明確不要自行復活／擴充的方向

1. 不把異宇宙做成 Lv.2001+ 第四紀元。
2. 不讓 AU enemy 直接讀突破等級動態同步變強。
3. 不用無限拉高強化／專精／印記／文明上限取代突破。
4. 不要求轉生後重看已讀舊劇情。
5. 不要求 rerun W1/W2 照首輪逐圖解鎖。
6. 不取消 Lv.500／Lv.1000 紀元邊界。
7. 不為 overlevel 先加固定倍率 hard cap／單場升級 hard cap。
8. 不把 W1 Boss 改成所有資源都掉；基礎石仍屬普通／菁英，進階石仍屬 Boss。
9. 不讓裝備出售收益吃 overlevel multiplier。
10. 不讓 AU Boss 套 W3 十王專屬 specialization／marks。
11. AU 每場正式 attempt 固定2特性，不升3／4個。
12. 不讓 UI／GM 自己維護 lifeId／lock／story suppression／speed永久解鎖等可衍生 flag。
13. 不重做第二套 final damage、equipment stat、transaction、save backup、phase UI owner。
14. `lostGear` 在正式轉生直接清空；不要重新發明 W3 lostGear 特殊保留機制。
15. 玩家 UI 不顯示內部 `B` shorthand；使用「突破等級」。

---

# 16. 下一個對話如何接手

可直接貼以下標準指令：

```text
請讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，並重新 fresh-read GitHub main 的實際程式碼，完整承接《文明戰線》專案。

要求：
1. main 是唯一真實來源，不可只靠交接檔或舊對話記憶。
2. 先重新確認 current main HEAD。
3. 先讀 PROJECT_HANDOFF.md，再讀本次要處理功能的正式 owner／consumer。
4. 若 handoff 與 current main 衝突，以 current main 為準並指出差異。
5. 修改前先找正式 owner，優先修改 owner，不新增 wrapper、fallback 或第二套公式。
6. JS／CSS 有修改時同步更新 index.html cache-bust。
7. 每批修改後 fresh-read、compare base→head、自我檢查，並查 exact HEAD 的 Runtime／Story／Pages 狀態；沒有實際 success 不可宣稱綠燈。
8. 我說「先討論／先檢查／先不要修改」時不得改 GitHub；我說「做／修改／執行／第N批」時可直接修改 main。
9. 玩家突破正式用語為「突破等級」，內部 B shorthand 不出現在玩家 UI。
10. 尚未施工的轉生／異宇宙規格，如需精確 AU 名稱或設計細節，重新核對《文明戰線_轉生與異宇宙系統_完整設計統整_2026-10-03_定案版.docx》，不要自行補名字。

現在先不要修改，先告訴我你讀到的 current main 現況、已完成項目與下一個尚未完成的正式批次。
```
