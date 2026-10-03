# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-03（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引、已完成現況與尚未施工規格摘要。若本檔、舊對話、舊 Word、舊規格、其他 handoff／pending 文件或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次更新前重新確認的 current `main` 功能 HEAD：

```text
113c75a3e55e02fee1f412988b88db88aca95ae7
```

本次不是靠舊對話記憶整理；已重新 fresh-read／核對 current main 的正式 owner／consumer，包含：

```text
PROJECT_HANDOFF.md
PROJECT_PENDING_STATUS.md
alternateuniversedata.js
alternateuniverseattempt.js
alternateuniversecombat.js
alternateuniverseprogression.js
alternateuniverseaccess.js
alternateuniverseui.js
alternateuniverse.css
reincarnationstate.js
reincarnationcore.js
playersemanticsui.js
worldphaseui.js
backgrounds.css
traits.js
index.html
tests/runtime/docs-integrity.js
tests/runtime/alternate-universe-*.js
.github/workflows/runtime-integrity.yml
```

並以舊 handoff 功能 HEAD `a2f3983742458806ed5dada60e3d9707a6565928` 對 current HEAD compare；中間 99 commits 的正式變更主要集中在：

- 異宇宙資料／挑戰／戰鬥／進度／UI／舊檔修復；
- 異宇宙第4批平衡與完整 lifecycle regression；
- 玩家突破顯示；
- AU 背景與正式戰鬥 presentation；
- trait identity、loader、CSS、home entry、transient state owner 收斂；
- Runtime Integrity 顯式 AU 測試鏈。

本次 handoff 更新只修改 `PROJECT_HANDOFF.md`，**不修改 JS／CSS／HTML／遊戲功能**，所以不更新 `index.html` cache-bust。

目前正式開發狀態：

```text
三大紀元既有正式內容：完成並維護／實測中
裝備自動處理政策：完成
轉生核心資料與首輪隔離：完成
突破系統＋正式轉生最小可用流程：完成
轉生／突破優化第1～4批：完成
原第3批「異宇宙最小可玩版」：完成
原第4批「異宇宙完整化／平衡／UI／regression」：完成
AU 後續架構優化第1～3批：完成
原第5批「轉生後 W1/W2/W3 自由重征服」：尚未施工
原第6批「越級 EXP／資源／離線＋四副本永久解鎖」：尚未施工
原第7批「GM 管理／測試／完整收尾」：尚未施工
```

舊 handoff 中「**異宇宙實際玩法：尚未施工**」這句現在已失效；current main 已經有正式可玩的 AU runtime。

功能 HEAD `113c75a...` 已實際確認：

```text
Runtime Integrity #1462：success
Pages build and deployment #5415：success
```

其中 Runtime #1462 已包含 real browser runtime smoke、AU 全套 Integrity、Reincarnation／Breakthrough regression、VIP、GM HP lock、asset、docs 等檢查。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先 fresh-read current `main` 的 `PROJECT_HANDOFF.md` 與本次會碰到的真正 owner／consumer。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須重新讀 current main、compare base→head，並自我檢查 UI／邏輯／正式資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS 修改都必須同步更新 `index.html` cache-bust。** Markdown-only 文件更新不需要 cache-bust。
6. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner、第二套 completion owner。**
7. 能共用就擴充 shared owner；不要因轉生、突破、異宇宙特殊而複製三紀元既有架構。
8. current main 已有 registry／policy／transaction／normalizer／integrity owner 時，優先延伸正式 owner；**不要再疊 monkey-patch。**
9. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark state 不得污染 formal save。
10. 修改前先找真正 owner／consumer；能改 owner 就不要在 UI 後處理硬蓋。
11. Integrity／Actions 沒有實際回傳 success 時，不可宣稱 CI 已綠。
12. current main 若已完成某規格，承接現況，不重做、不被舊文件倒退。
13. 若設計文件與 main 衝突：**main 決定目前真實狀態；定案文件只決定尚未施工部分的目標行為。**
14. W3 正式 Story／Final 已完成；不可自行重寫、替換或擴增既有 11 篇正式主線。
15. 玩家正式用語固定為 **「10 名高維存在」**。
16. 玩家正式 UI／log 對突破的用語固定為 **「突破等級」**；`B` 只作內部測試 shorthand，玩家畫面不得顯示 `B1`、`B+1`、`永久突破 B`。
17. Arena 相關現行係數一律以 current `thirdworldarena.js`／`dungeonarena.js`／`dungeonprogress.js` 為準。
18. `offlineprogress.js` 目前仍是 audit 允許的 save compatibility wrapper；不要為形式上的「零 wrapper」直接拔除。
19. W3 永久 HP／settlement basis 是高風險正式契約；任何 combat 共用化都不得改變 `formalStartHp → combatEndHp → permanent delta` 語意。
20. GM native section registry 維持 late binding；GM W2/W3 正式進度重建維持 progression management owner；GM 正式資源／副本修改維持 atomic transaction。
21. 轉生／重征服施工硬原則：**`reincarnation.count = 0` 必須維持首輪既有正式規則；只有 `count > 0` 才能啟用 rerun 分支。**
22. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner；不得分段 mutate、分段 save。
23. AU 200 個正式名稱已進 current main，來源是《文明戰線_轉生與異宇宙系統_完整設計統整_2026-10-03_定案版.docx》；之後如需改名仍應重新核對該定案檔，不自行 invent。
24. AU 玩家正式進度單位目前使用 **「層域」**；內部程式仍可保留 `U`／`depth`，但玩家 UI 不應重新暴露 `1000U`、`U37` 等內部 shorthand。
25. AU 已完成的 replay/review 路徑是「完整移除」，不要因為舊規格而復活。

---

# 2. current main：三紀元正式基準

## 2.1 世界與等級

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()` 的 `1／2／3 對應銀河／宇宙／高維`：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

current `levelprogression.js` 正式值仍是：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

W2 Lv.500～999 EXP 維持既有固定約 250 場／級基準；W3 Lv.1000～1999 每級固定 10,000,000 EXP。

## 2.2 第三紀元既有內容

W3 正式內容仍包含：

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

W3 bounty 首輪仍 hidden／disabled；「首次轉生後四大副本永久解鎖」仍屬後續第6批，尚未施工。

## 2.3 首輪世界突破

首輪 W1→W2、W2→W3 行為目前仍維持既有正式規則；轉生系統沒有直接改寫首輪 progression。

轉生後「故事不再阻塞／自由重征服」尚未施工，歸原第5批。

---

# 3. Save／Migration／資料安全

## 3.1 Schema17

current `savemigration.js` 正式基準：

```text
SAVE_SCHEMA_VERSION = 17
SAVE_LOAD_PIPELINE_VERSION = 3
SAVE_NORMALIZATION_PIPELINE_VERSION = 3
SAVE_MIN_SUPPORTED_VERSION = 1
SAVE_LEGACY_SUPPORT_MODE = "all-known"
```

Schema17 正式加入 `reincarnation` persistent root。

`thirdWorld` 仍是正式 persistent root；三紀元與轉生資料都受既有 save/load pipeline 管理。

## 3.2 pre-Schema17

- Schema1～16 仍支援 migration；
- pre-Schema17 即使意外含 `reincarnation` root，也會丟棄該 root，回到首輪 `count=0`；
- Schema17 才承認正式 reincarnation data；
- future save fail-closed；
- transient GM test state 不進 formal save。

## 3.3 Reincarnation state 已升 VERSION 7

current `reincarnationstate.js`：

```text
REINCARNATION_STATE_VERSION = 7
REINCARNATION_LIFECYCLE_POLICY_VERSION = 1
REINCARNATION_DOMAIN_CONTEXT_VERSION = 1
REINCARNATION_BREAKTHROUGH_LIFE_OWNERSHIP_VERSION = 2
ALTERNATE_UNIVERSE_STATE_FORMAT_VERSION = 2
ALTERNATE_UNIVERSE_ACTIVE_ATTEMPT_REPAIR_VERSION = 1
ALTERNATE_UNIVERSE_MAX_DEPTH = 1000
```

正式 root：

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

AU normalization 現在除了 exactly-2-traits／life owner 外，還會：

- `deepestCleared > 0` 時 salvage `unlocked=true`；
- activeAttempt 必須是當前正式 frontier `deepestCleared + 1`；
- attempt 若已不是 frontier 或該層域已達10敗，會自動清掉；
- 舊 failure 格式仍可 canonicalize；
- first-run breakthrough 污染仍會清除。

## 3.4 Save safety／transaction

`saveversionguard.js` Save Safety V2 與 `settlementtransaction.js` shared transaction 仍是大型 mutation 正式 owner。

正式轉生 precommit backup：

```text
createVerifiedReincarnationBackup()
→ ensureLocalSaveSafetyBackup("formal-reincarnation", raw)
→ verified=true 才能進 transaction
```

backup fail 時不 mutate、不 save。

---

# 4. 【已完成】突破系統

正式 owner：`breakthroughcore.js`，正式 consumer 包含 `enhancementcombat.js`、`combatmath.js`、shared world combat、Mirror。

## 4.1 里程碑

首輪 `count=0`：突破等級永遠 Lv.0。

`count > 0` 後，每輪自然升級跨：

```text
Lv.100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000
```

各 +1，每輪最多 +10；Lv.1000～2000 不再給突破。

一次自然升多級會補發所有跨過的里程碑；reload 不重複；GM 直接改 level 不會偷發正式突破。

## 4.2 裝備能力與最終傷害

每 1 級突破：

```text
raw equipment HP / ATK / DEF +2.5%
final damage +0.05
```

正式三圍順序：

```text
base player stats
+ raw equipment HP/ATK/DEF
+ enhancement extra（由 raw mainStat 獨立推導）
+ breakthrough bonus（由 aggregate raw equipment HP/ATK/DEF 推導）
→ VIP
→ final ceil
```

突破與強化彼此不複利。

最終傷害 shared owner：

```text
finalDamageMultiplier
= 1
+ civilization final-damage add
+ breakthrough final-damage add
```

不是乘法疊乘。

## 4.3 玩家顯示已補完整最低需求

`playersemanticsui.js` current：

```text
CHARACTER_BREAKTHROUGH_UI_VERSION = 2
```

角色頁目前正式顯示三項：

```text
突破等級 Lv.X
裝備能力倍率 +XX.X%
最終傷害加成 +XX%
```

不顯示實際 HP／ATK／DEF 增量拆分；更大的「完整養成狀態／戰鬥加成總覽」仍屬後續可選優化，不是 current 必要功能。

---

# 5. 【已完成】正式轉生

正式 owner：`reincarnationcore.js` + `settlementtransaction.js` + `reincarnationui.js`。

## 5.1 資格

```text
角色 Lv.2000
+ 本輪10名高維存在全滅
+ 本輪界弦核心 Lv.10
= 可正式轉生
```

Story completion 不列入資格。

## 5.2 保留

- VIP 點數／等級；
- 永久突破等級；
- 稱號；
- settings／UI preference；
- daily 當日狀態；
- Story／戰線閱讀歷史；
- Mirror／Void 永久歷史；
- AU `unlocked`／`deepestCleared`；
- 已裝備與背包中 `world===3 && level===2000` 裝備；
- 1.5× 戰鬥速度永久可用（`count>0`）。

## 5.3 重置

- Lv.1、EXP=0、HP 依 reset 後正式 stats 回滿；
- 強化、8專精、10印記、文明成長、本輪災厄；
- W1 map／boss progress；
- W2 blank；
- W3 blank，含維度之弦／界弦核心；
- W1/W2 Arena current-life；
- 金幣／暗物質／暗能量／強化資源；
- pending encounter／offline sample／pending settlement 等跨輪暫態；
- `lostGear=[]`；
- AU activeAttempt／本輪 failures；
- 本輪突破 milestones。

AU permanent unlock／deepest 不清；轉生前若10名 W3 已全滅但 unlock 尚未落盤，mutation 會先 salvage unlock proof。

## 5.4 runtime／transaction

正式轉生會阻擋：

- mainline active；
- Minimal Mode；
- background flow；
- special encounter／其他 transition blocker；
- transaction busy；
- 已 commit 等待 reload 的二次點擊。

成功後 `count+1`，save 成功才算完成，session marker 寫入並預設 reload。

---

# 6. 【已完成】異宇宙資料層

正式 owner：`alternateuniversedata.js`。

current：

```text
ALTERNATE_UNIVERSE_DATA_VERSION = 1
ALTERNATE_UNIVERSE_UNIVERSE_COUNT = 200
ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE = 5
ALTERNATE_UNIVERSE_DATA_MAX_DEPTH = 1000
ALTERNATE_UNIVERSE_BASE_CRIT = 20
ALTERNATE_UNIVERSE_BASE_DODGE = 20
```

正式五層：

```text
外環 → 神庭 → 聖域 → 天座 → 主宰
```

current main 已收錄：

- 20 類文化；
- 200 個正式宇宙名稱；
- 每個宇宙對應文化；
- 1～1000 internal depth mapping；
- universe number／stage／culture lookup；
- U1000 = 第200宇宙第5層域，無 U1001。

玩家 UI 現在不再使用 `1000U` 作正式顯示；玩家正式稱 **「層域」**，例如「第 38 層域」。程式內 `depth`／U shorthand 可保留。

## 6.1 敵人固定公式（第4-3批已鎖定）

current 正式曲線：

```text
HP   = 320000 + 30000U + 1500U²
ATK  = 26000 + 600U
DEF  = 12000 + 250U
CRIT = 20%
DODGE = 20%
```

其中 U 是 internal depth 1～1000。

正式 regression 會在 1／10／100／500／1000 檢查公式不得漂移。

敵人基礎數值只看 U，不讀玩家突破等級做 dynamic scaling；traits 再疊在基礎敵人之上。

---

# 7. 【已完成】異宇宙 traits／activeAttempt／失敗生命週期

## 7.1 7 種 trait 單一 identity owner

current canonical identity 在 `reincarnationstate.js`：

```text
strong     強壯
ferocious  兇猛
hard       堅硬
swift      迅捷
deadly     致命
berserk    狂暴
giant      巨體
```

`traits.js` 不再維護第二份名稱 identity，只維護 presentation／效果，並重用 canonical rows。

正式效果仍是：

```text
強壯：HP +20%
兇猛：攻擊 +15%
堅硬：防禦 +20%
迅捷：閃避 +8%
致命：暴擊 +8%
狂暴：HP 低於50%時攻擊 +20%
巨體：HP +30%、攻擊 +5%、閃避 -5%
```

## 7.2 attempt owner

`alternateuniverseattempt.js` current：

```text
ALTERNATE_UNIVERSE_ATTEMPT_VERSION = 4
ALTERNATE_UNIVERSE_ATTEMPT_TRAIT_COUNT = 2
ALTERNATE_UNIVERSE_FAILURE_LIMIT = 10
ALTERNATE_UNIVERSE_FAILURE_POLICY_VERSION = 1
```

正式挑戰每次固定抽 **2 個不同 trait**。

規則：

- 新 attempt 建立時抽2個；
- 同一 activeAttempt F5／reload 後保持原2個，不重抽；
- 只有 settlement 後新 attempt 才重抽；
- attemptId 必須匹配；
- active attempt 只能是當前 frontier；
- cleared layer 不能 replay；
- 未到達 layer 不能跳挑。

## 7.3 10敗鎖定

同一 life、同一 frontier：

- 第1～9敗可重打；
- 第10敗鎖定；
- lock 只到下一次正式轉生；
- 正式轉生清 current-life failure／attempt，保留 deepestCleared；
- 明確「放棄尚未結算挑戰」會算 1 敗；
- F5／關頁／navigation／presentation error 本身不算敗，只保留 activeAttempt。

---

# 8. 【已完成】異宇宙正式戰鬥／結算

正式 owner：`alternateuniversecombat.js`。

current：

```text
ALTERNATE_UNIVERSE_COMBAT_VERSION = 2
ALTERNATE_UNIVERSE_COMBAT_ADAPTER_VERSION = 1
ALTERNATE_UNIVERSE_COMBAT_SETTLEMENT_VERSION = 1
settlement authority = "alternate-universe-combat-basis"
```

## 8.1 不建立第二套 combat engine

AU 直接共用：

```text
playerCombatStats()
runWorldCombatCore()
shared final damage owner
shared specializations / marks / VIP / equipment / breakthrough
shared structured combat presenter
shared combat speed
```

AU 不套 W3 十王專屬：

- 5pp；
- 永久 HP shaving；
- W3 boss phase；
- W3 十王專用 UI／progress owner。

## 8.2 一鍵挑戰

正式玩家流程：

```text
點「挑戰第 N 層域」
→ 沒 attempt 就建立／有 attempt 就 resume
→ 固定2 traits
→ 直接進正式 battle screen
→ 戰鬥畫面揭示 traits
→ structured presentation
→ combat basis
→ 正式 win/loss settlement
→ 回 AU 頁顯示結果
```

沒有 precombat trait preview，也沒有第二次「開始戰鬥」確認。

AU 正式挑戰以該場完整玩家 HP 起戰：

```text
startHp = player.hp
playerHealCap = player.hp
```

不另建 AU 永久 HP 系統。

## 8.3 settlement

只有 combat completed 且 basis／attemptId 對得上才可結算。

```text
win  → deepestCleared +1（只推進一層域）
loss → current-life failures +1
```

正式勝負不給：

- EXP；
- 金幣；
- 暗物質；
- 暗能量；
- 維度之弦；
- 裝備；
- 任何 AU 新貨幣。

AU 是橫向終局進度，不是第四紀元刷資源系統。

---

# 9. 【已完成】AU progression／completion／no replay

`alternateuniverseprogression.js` current：

```text
ALTERNATE_UNIVERSE_PROGRESSION_VERSION = 3
ALTERNATE_UNIVERSE_COMPLETION_VERSION = 1
ALTERNATE_UNIVERSE_PLAYER_UI_LOADER_VERSION = 4
```

正式規則：

```text
nextDepth = deepestCleared + 1
```

只允許嚴格 +1，不可跳層。

`U1000`／第1000層域勝利後：

```text
deepestCleared = 1000
completed = true
nextDepth = null
remainingDepths = 0
completedUniverses = 200
```

沒有 U1001、Final Story、新貨幣、新等級層。

## 9.1 replay／review 已完整移除

第4-1批已決定 AU cleared progression 只作歷史，**不能重打／回顧戰**。

現在不是「UI 隱藏 replay」而已，而是：

- attempt 無 review API；
- progression 無 review access；
- combat 無 review encounter；
- regression 明確禁止 replay/review owner 回流。

不要從舊規格復活。

---

# 10. 【已完成】AU 永久入口與玩家 UI

## 10.1 解鎖

`alternateuniverseaccess.js` current：

```text
ALTERNATE_UNIVERSE_ACCESS_VERSION = 1
```

第一次 W3 10 名高維存在全滅後，AU home entry 即可出現；第一次實際進入時會以 shared transaction 寫入 permanent `unlocked=true`。

另外有兩層安全 salvage：

1. 轉生 mutation 在清 W3 前會保存「10王全滅」證據；
2. normalization 若 `deepestCleared>0` 會自動 salvage unlock。

一旦永久解鎖，之後任何轉生輪／任何紀元／任何角色等級都可進入。

## 10.2 主畫面 owner 已收斂

AU 不再 monkey-patch `secondWorldHomeEntryHtml()`。

current `worldphaseui.js`：

```text
UI_VERSION = 5
SHARED_UI_VERSION = 4
MAJOR_TRANSITION_UI_VERSION = 1
```

`worldphaseui.js` 正式負責把 world-phase entry 與 `alternateUniverseHomeEntryHtml()` 組合進主畫面；AU UI 只提供自己的 entry HTML。

## 10.3 AU 頁正式玩家文案

`alternateuniverseui.js` current：

```text
ALTERNATE_UNIVERSE_PLAYER_UI_VERSION = 5
ALTERNATE_UNIVERSE_COMBAT_PRESENTATION_VERSION = 1
```

正式首頁顯示：

- 征服層域 `x / 1000`；
- 已征服宇宙 `x / 200`；
- 下一層域；
- 剩餘層域；
- 目前正式前線的宇宙名稱／文化／五層 stage；
- 敵方 HP／ATK／DEF／暴擊／閃避；
- 本輪失敗 `x / 10` 與接近鎖定警告；
- 一個主要挑戰按鈕；
- activeAttempt 存在時可明確放棄。

已移除／不得復活的玩家技術文案：

- `Alternate Universe` 英文 kicker；
- `1000U`／`U37` 這類 internal shorthand；
- 重複說明「基礎暴擊20%／閃避20%」；
- prebattle traits 技術說明。

## 10.4 正式背景

`backgrounds.css` 是正式 scene background owner。

AU 首頁：

```text
.alternate-universe-page
→ 共用 adventure-map desktop/mobile 背景
```

AU 戰鬥：

```text
.combat-screen.au-combat-screen
→ 共用 battle-main desktop/mobile 背景
```

桌機曾發生 battle background 只覆蓋左半邊；根因是 AU 自己 `max-width:980px` 與正式 full-viewport `.combat-screen` layout 衝突。已修成：

```css
.au-combat-screen{max-width:none}
```

因此 AU 只控制內部視覺，不再搶正式 combat-screen 的全寬 owner。

---

# 11. 本對話重要 AU bug 修正／架構優化

## 11.1 戰鬥 presentation 初始化 bug

曾經 UI 以：

```text
runAlternateUniverseCombat({preparePresentation:false})
→ animateStructuredCombatPresentation()
```

造成正式瀏覽器 runtime 報「Combat Presentation 尚未初始化」。

current 已改成：

```text
preparePresentation:true
```

並由 AU UI Integrity 鎖定，避免回歸。

## 11.2 桌機戰鬥背景半屏

已如上修掉 `max-width:980px`，沿用正式 full-width battle background owner。

## 11.3 activeAttempt 舊檔修復

`REINCARNATION_STATE_VERSION=7` 新增 active attempt repair：

- attempt 不是 `deepest+1` → 清；
- attempt 所在層已10敗 lock → 清；
- unknown／duplicate／1個／3個 trait → fail closed。

## 11.4 traits identity 去重

- canonical trait id/name 移到 `reincarnationstate.js`；
- `traits.js` 只補 presentation／效果；
- 避免 AU 與主線怪各維護一份名稱 identity。

## 11.5 AU CSS／loader owner 收斂

- AU 專屬樣式移到 `alternateuniverse.css`；
- UI JS 不再 runtime inject `<style>`；
- `alternateuniverseprogression.js` 是 CSS/access/UI loader owner；
- CSS/access/UI 共用 progression script 自己的 query/cache-bust，不再各維護第二組硬編碼版本。

## 11.6 home entry monkey-patch 移除

- AU 不再覆寫 `secondWorldHomeEntryHtml`；
- `worldphaseui.js` 正式組合 supplemental AU entry。

## 11.7 transient battle state 去重

- 移除多餘 `battleBusy`；
- `battleContext` 是 AU UI 唯一「本頁正在戰鬥」 transient state；
- formal `activeAttempt` 仍屬 persistent gameplay state，兩者角色不同。

## 11.8 Integrity 拆責任

- progression integrity 不再隱式 `require()` UI integrity；
- Runtime workflow 明確逐一執行 AU data／attempt／combat／failure／progression／UI／batch4-3／old-save tests。

---

# 12. 原第3批＋第4批：目前正式完成度

## 第3批：異宇宙最小可玩版 —— 完成

已完成子批次：

```text
3-1：AU data owner、200正式名稱、20文化、1000 mapping、敵人公式
3-2：activeAttempt lifecycle、固定2 traits、F5不重抽
3-3：formal combat adapter、共用 combat core、正式 settlement
3-4：1～10敗、10敗 lock、轉生清 current-life、放棄規則
3-5：strict deepestCleared progression、U1000 terminal completion
3-6：主畫面永久入口、玩家 AU UI、migration／first-run regression
```

## 第4批：異宇宙完整化／平衡／UI —— 完成

```text
4-1：一鍵直接挑戰、正式 battle screen、完整移除 replay/review
4-2：突破三項顯示、AU 背景／文案／層域用語、失敗／lock UX
4-3：正式敵人曲線鎖定、21 trait pair lifecycle 基礎、10敗/U1000/reincarnation regression
```

第4-3 current main 的正式 curve 仍是第6.1節那一組，並已有 regression lock。

## AU 架構優化第1～3批 —— 完成

完成後 current 架構重點：

- AU CSS 有單獨正式檔案；
- loader query single owner；
- traits identity single owner；
- home entry composition 回到 `worldphaseui.js`；
- transient state 只用 `battleContext`；
- AU UI／progression Integrity 顯式拆開；
- Runtime workflow 直接執行 AU UI test。

---

# 13. 裝備自動處理政策（仍有效）

`settings.autoSell` 六格：

```text
普通／優良／稀有／史詩／傳說／神話
```

shared owner：

```text
equipmentDropDisposition(item, state)
```

優先序：

1. locked → 保留；
2. `keepUpgrade` 且新裝較強 → 保留；
3. 該品質 auto-process → 處理；
4. 其餘保留。

online/offline/equipment reward 都應共用正式 policy；神話沒有另一套硬編碼豁免。

---

# 14. GM／測試現況

本次 AU／轉生開發 **沒有新增正式 GM AU／轉生管理頁**；從舊 handoff 功能 HEAD 到 current HEAD 的正式變更也沒有 GM owner 檔案變動。

現有 GM Hub 仍有：

- 角色、VIP、專精、強化、印記、文明管理；
- W1/W2/W3 正式進度管理；
- 副本管理；
- 匯出／匯入；
- 背景戰鬥；
- 主線鎖血；
- GM 1×／1.5×／2×；
- 角色能力測試；
- 戰力基準測試；
- 稱號預覽；
- 劇情測試。

正式原則：

- formal management 才寫正式 save；
- sandbox／benchmark 不污染 formal save；
- W2/W3 progression 重建走既有 owner；
- 正式多欄位 mutation 用 atomic transaction；
- GM 直接改 level 不觸發正式突破里程碑。

### 尚未施工的 GM／測試項目

- 指定轉生次數；
- 指定永久突破等級；
- GM 正式轉生 transaction 按鈕；
- AU permanent unlock／deepest 層域管理；
- 角色測試新增突破值／同步；
- AU benchmark（層域／traits／runs）；
- 21 種雙 trait pair diagnostic 報表；
- rerun／overlevel／dungeon 全生命週期 GM regression。

---

# 15. current main 重要 owner 索引

施工前仍要 fresh-search；以下只是現行索引。

## Reincarnation／Breakthrough

```text
reincarnationstate.js
reincarnationcore.js
breakthroughcore.js
breakthroughui.js
reincarnationui.js
playersemanticsui.js
```

## Alternate Universe

```text
alternateuniversedata.js          // 200名稱、20文化、5層、1～1000 mapping、敵人曲線
alternateuniverseattempt.js       // activeAttempt、2 traits、failure／abandon lifecycle
alternateuniversecombat.js        // shared combat adapter、settlement basis
alternateuniverseprogression.js   // strict frontier／completion + CSS/access/UI loader
alternateuniverseaccess.js        // W3全滅 proof、permanent unlock
alternateuniverseui.js            // 玩家 entry／AU page／formal battle presentation
alternateuniverse.css             // AU 專屬 UI 材質／layout
traits.js                         // 共用 trait presentation／effects
backgrounds.css                   // 正式場景背景 owner
```

## World／Combat／Stats

```text
worldphase.js
worldtransitionsafety.js
worldphaseui.js
levelprogression.js
enhancementcombat.js
combatmath.js
combatcore.js
battlepipeline.js
mirrorcombatcore.js
civilizationcore.js
specialization.js
markcore.js
settlementtransaction.js
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

## W3／Dungeon／Arena／Mirror／Void

```text
thirdworldphase.js
thirdworlddata.js
thirdworldcore.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldplayerflow.js
thirdworldui.js
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

# 16. 【尚未完成】原第5批：轉生後 W1／W2／W3 自由重征服

這是 current main 下一個主要正式 gameplay 批次。

## 16.1 W1 rerun

定案方向：

- 全地圖普通／菁英／Boss 可直接挑戰；
- 不要求普通／菁英各10次前置；
- 不走首輪 bossLocked 迴圈；
- 不用角色等級當 Boss challenge gate；
- `bossKilled` 只記實際勝利，不假填；
- Lv.50／100／…／500 為 key bosses；
- 高階 key boss 勝利可向下涵蓋災厄／Arena 區域 eligibility；
- 但不得偽造低階 Boss kill history。

## 16.2 W2 rerun

- 100 Boss 可直接挑戰；
- `bossKilled` 仍只記實際勝利；
- 550／600／…／1000 為10個 key bosses；
- 高階 key win 向下涵蓋災厄／Arena 區域資格；
- 文明災厄實際攻略鏈仍存在。

## 16.3 紀元邊界／Story

```text
W1→W2：仍需 Lv.500
W2→W3：仍需 Lv.1000
```

轉生後已體驗故事／過場／災厄提示／紀元說明不應自動阻塞或一直跳；閱讀歷史仍可回顧。

首輪 W3 維持 5pp；轉生後 W3 rerun 目標為取消 5pp，可集中攻略單王。

**以上 current main 尚未施工。**

---

# 17. 【尚未完成】原第6批：越級 EXP／資源／Offline＋四副本永久解鎖

## 17.1 越級倍率定案第一版

```text
M = 1 + 0.03 * (enemyLevel - playerLevel)
```

只在 `enemyLevel > playerLevel` 使用。

目標套用：

- W1：EXP、金幣、基礎強化石、進階強化石；
- W2：EXP、暗物質、暗能量。

裝備 sale proceeds 不吃 M。

online／offline 必須共用同一正式 overlevel multiplier owner；目前尚未建立。

## 17.2 四大副本永久解鎖

首次正式轉生後目標：

- 懸賞、競技場、鏡像、虛空永久可進；
- daily 不因轉生刷新；
- Mirror／Void permanent history 保留；
- W1/W2 Arena Rank 每輪重置；
- eligibility 依本輪最高 key boss downward coverage；
- 原97%晉階驗收保留。

目前已完成的只有轉生 mutation 對 daily／Mirror／Void history 的保留；低等級永久入口與 rerun eligibility 尚未施工。

---

# 18. 【尚未完成】原第7批：GM／測試／全系統收尾

待辦：

- GM reincarnation count／permanent breakthrough；
- GM 正式 reincarnation transaction；
- GM AU unlock／deepest；
- 突破 test value／同步正式角色；
- AU benchmark；
- 21 trait-pair diagnostics；
- rerun／overlevel／dungeon／AU 全生命週期 regression；
- 最終跨紀元、轉生、多輪舊檔、offline、GM formal/sandbox 全面收尾。

AU 本身已有大量 regression，不代表第7批已全部完成。

---

# 19. Runtime／Integrity 現況

current `.github/workflows/runtime-integrity.yml` 已直接執行 AU：

```text
alternate-universe-data-integrity.js
alternate-universe-attempt-integrity.js
alternate-universe-combat-integrity.js
alternate-universe-failure-integrity.js
alternate-universe-progression-integrity.js
alternate-universe-ui-integrity.js
alternate-universe-batch4-3-regression.js
alternate-universe-old-save-integrity.js
```

並繼續執行：

- 全 JS syntax／owner integrity；
- save global writer audit；
- new-state save owner；
- real browser runtime smoke；
- Reincarnation save／normalization／reset／transaction／UI／opt batch2～4；
- Breakthrough core／final damage；
- new-state browser；
- save-load pipeline；
- VIP unbounded；
- GM mainline HP lock；
- asset integrity；
- docs integrity。

AU regression 已鎖定：

- 200×5=1000；
- 五層 mapping；
- 7 canonical traits；
- 固定敵人公式；
- 20% CRIT/DODGE baseline；
- F5/resume traits 不變；
- win 只推進1層域；
- 無任何資源／裝備收益；
- 10敗 lock；
- 轉生保留 deepest/unlock 並清 current-life；
- U1000 terminal；
- 無 replay／review／U1001；
- AU player UI 不暴露 internal U；
- AU background／combat full-width owner；
- home entry 不再 monkey-patch；
- `battleContext` 為 UI transient owner。

功能 HEAD `113c75a...` 的 Runtime #1462 已 success，且包含 real browser smoke。

---

# 20. 明確不要自行復活／擴充的方向

1. 不把異宇宙做成 Lv.2001+ 第四紀元。
2. 不讓 AU enemy 讀突破等級 dynamic scaling。
3. 不新增 AU 專用刷裝貨幣或資源收益。
4. 不要求轉生後重看已讀舊劇情。
5. 不要求 rerun W1/W2 按首輪逐圖解鎖。
6. 不取消 Lv.500／Lv.1000 紀元邊界。
7. 不為 overlevel 未經討論自行加 hard cap／單場升級 cap。
8. 不讓裝備出售收益吃 overlevel multiplier。
9. 不讓 AU 套 W3 十王專屬5pp／永久削血／boss phase。
10. AU 每場正式 attempt 固定2 traits，不升3／4個。
11. 不復活 AU replay／review。
12. 不讓 UI／GM 自己維護 lifeId／lock／speed永久解鎖等可衍生 flag。
13. 不重做第二套 final damage、equipment stat、transaction、save backup、phase UI owner。
14. `lostGear` 在正式轉生直接清空；不要重新發明 W3 lostGear 特殊保留機制。
15. 玩家 UI 不顯示內部 `B` shorthand；使用「突破等級」。
16. 玩家 AU 進度使用「層域」，不要重新顯示 `1000U`／`Uxx`。
17. 不把 `alternateuniverseui.js` 再改回 runtime CSS owner、home monkey-patch 或多一個 `battleBusy`。

---

# 21. 原定 7 大批最新進度

```text
第1批：轉生核心資料與首輪隔離                 ✅ 完成
第2批：突破系統＋正式轉生最小可用流程         ✅ 完成
第2批後優化1～4                               ✅ 完成
第3批：異宇宙最小可玩版                       ✅ 完成
第4批：異宇宙完整化／UI／平衡／Regression      ✅ 完成
AU 架構優化第1～3批                           ✅ 完成
第5批：W1／W2／W3 轉生後重征服                ⏳ 尚未施工
第6批：越級 EXP／資源／Offline＋四副本永久解鎖 ⏳ 尚未施工
第7批：GM／測試／完整 Integrity 收尾           ⏳ 尚未施工
```

目前下一個正式大批應從 **第5批** 開始，不要重做 AU 第3／4批。

---

# 22. 下一個對話如何接手

可直接貼以下標準指令：

```text
請讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，並重新 fresh-read GitHub main 的實際程式碼，完整承接《文明戰線》專案。

要求：
1. main 是唯一真實來源，不可只靠交接檔、舊對話或記憶。
2. 先重新確認 current main HEAD。
3. 先讀 PROJECT_HANDOFF.md，再讀本次要處理功能的正式 owner／consumer。
4. 若 handoff 與 current main 衝突，以 current main 為準並指出差異。
5. 修改前先找正式 owner，優先修改 owner，不新增 wrapper、fallback、第二套公式、第二套 combat engine 或第二套 pipeline。
6. JS／CSS 有修改時同步更新 index.html cache-bust。
7. 每批修改後 fresh-read current main、compare base→head、自我檢查 UI／邏輯／正式資料寫入／舊檔相容，並查 exact HEAD 的 Runtime／Story／Pages 狀態；沒有實際 success 不可宣稱綠燈。
8. 我說「先討論／先檢查／先不要修改」時不得改 GitHub；我說「做／修改／執行／第N批」時可直接修改 main。
9. 玩家突破正式用語為「突破等級」，內部 B shorthand 不出現在玩家 UI。
10. 玩家異宇宙正式進度單位為「層域」；程式內可保留 U/depth，但玩家 UI 不顯示 1000U/Uxx。
11. 異宇宙第3批、第4批與架構優化第1～3批都已完成；不要重做。AU replay/review 已完整移除。
12. 下一個主要正式批次是第5批「轉生後 W1／W2／W3 自由重征服」。在施工前，先 fresh-read W1/W2/W3 progression、story、boss gate、arena/calamity eligibility 的正式 owner。
13. 如尚未施工規格需要精確設計細節，重新核對《文明戰線_轉生與異宇宙系統_完整設計統整_2026-10-03_定案版.docx》，不要自行補規則或名稱。

現在先不要修改，先告訴我你讀到的 current main 現況、已完成項目、真正尚未完成項目，以及第5批應該先讀哪些正式 owner。
```
