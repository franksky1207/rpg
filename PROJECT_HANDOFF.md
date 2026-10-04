# 《文明戰線》PROJECT HANDOFF

更新日期：2026-10-04（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只做交接、索引、已完成現況與尚未施工項目整理。若本檔、舊對話、舊 Word、舊規格、其他 handoff／pending 文件或記憶與 current `main` 衝突，一律以 current `main` 為準。

---

# 0. 本次交接基準

本次更新前重新確認的 current `main` HEAD：

```text
8680cee81671ceeb962414a390f8a2e7d883d3cf
```

本次不是只靠對話記憶整理；已重新 fresh-read／核對 current main 的正式檔案與 owner，至少包含：

```text
PROJECT_HANDOFF.md
PROJECT_PENDING_STATUS.md
worldphase.js
thirdworldphase.js
reincarnationrerunworld1.js
reincarnationrerunworld2.js
reincarnationrerunworld3.js
reincarnationrerunprogress.js
reincarnationdungeonaccess.js
reincarnationoverlevelrewards.js
combatcore.js
playerbatchupgrades.js
offlinestatecore.js
gmhub.js
index.html
tests/runtime/reincarnation-batch6-closure.js
tests/runtime/docs-integrity.js
```

另外重新核對 current main 的 Runtime／Pages 狀態。功能 HEAD `8680cee...` 已確認：

```text
Runtime Integrity #1615：success
Pages build and deployment #5568：success
```

本次 handoff 更新只修改 `PROJECT_HANDOFF.md`，**不修改 JS／CSS／HTML／遊戲功能**，因此不需要更新 `index.html` cache-bust。

目前正式開發狀態：

```text
三大紀元正式 runtime                     ✅ 完成並維護／實測中
裝備自動處理政策                         ✅ 完成
轉生核心資料與首輪隔離                   ✅ 完成
突破系統＋正式轉生                       ✅ 完成
異宇宙 Batch3～4                         ✅ 完成
AU 架構優化第1～3批                      ✅ 完成
Batch5：轉生後 W1／W2／W3 重征服         ✅ 完成
Batch5 後續架構優化                      ✅ 完成
Batch6：越級收益／批次成長／副本／封箱    ✅ 完成
Batch6 程式碼優化第1～5批                ✅ 完成
Batch7：GM／測試工具正式收尾              ⏳ 尚未施工
```

舊 handoff 中「第5批、第6批尚未施工」與「高階 Boss 只記自身、不正式回填前段主線」都已失效，current main 已正式改成下面記錄的現況。

---

# 1. 下一個 ChatGPT 必須遵守的操作規範

1. **`main` 是唯一真實來源。** 每次修改前先 fresh-read current `main` 的 `PROJECT_HANDOFF.md` 與本次會碰到的真正 owner／consumer。
2. 使用者說「先討論／先檢查／先不要修改」時，**不得修改 GitHub**。
3. 使用者說「做／修改／執行／第 N 批」時，可直接修改 `main`，不用再問一次確認。
4. 每批修改後必須重新讀 current main、compare base→head，並自我檢查 UI／邏輯／正式資料寫入／舊檔相容／runtime／Integrity。
5. **任何 JS／CSS production 修改都必須同步更新 `index.html` cache-bust。** Markdown-only 文件更新不需要 cache-bust。
6. **優先修改正式來源，不要額外做 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 phase owner、第二套 migration owner、第二套 completion owner。**
7. 能共用就擴充 shared owner；不要因轉生、突破、異宇宙特殊而複製三紀元既有架構。
8. current main 已有 registry／policy／transaction／normalizer／integrity owner 時，優先延伸正式 owner；不要再疊新的 monkey-patch。
9. 現存相容 bridge／adapter 若是 current main 正式架構的一部分，不要為「形式上零 wrapper」強拆；但未來新增功能要先找真正 owner，不要繼續往外包新層。
10. GM formal management 與 GM test sandbox 必須分離；sandbox／benchmark state 不得污染 formal save。
11. 修改前先找真正 owner／consumer；能改 owner 就不要在 UI 後處理硬蓋。
12. Integrity／Actions 沒有實際回傳 success 時，不可宣稱 CI 已綠。
13. current main 若已完成某規格，承接現況，不重做、不被舊文件倒退。
14. 若設計文件與 main 衝突：**main 決定目前真實狀態；定案文件只決定尚未施工部分的目標行為。**
15. W3 正式 Story／Final 已完成；不可自行重寫、替換或擴增既有 11 篇正式主線。
16. 玩家正式用語固定為 **「10 名高維存在」**。
17. 玩家正式 UI／log 對突破的用語固定為 **「突破等級」**；`B` 只作內部測試 shorthand，玩家畫面不得顯示 `B1`、`B+1`、`永久突破 B`。
18. Arena 相關現行係數一律以 current `thirdworldarena.js`／`dungeonarena.js`／`dungeonprogress.js`／`arenapositioncore.js` 為準。
19. `offlineprogress.js` 仍是 current main 的正式 compatibility／offline consumer；不要擅自另建第二套 Offline pipeline。
20. W3 永久 HP／settlement basis 是高風險正式契約；任何 combat 共用化都不得改變 `formalStartHp → combatEndHp → permanent delta` 語意。
21. GM native section registry 維持 late binding；GM W2/W3 正式進度重建維持 progression management owner；GM 正式資源／副本修改維持 atomic transaction。
22. 轉生／重征服硬原則：**`reincarnation.count = 0` 必須維持首輪既有正式規則；只有 `count > 0` 才能啟用 rerun 分支。**
23. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner；不得分段 mutate、分段 save。
24. AU 200 個正式名稱已進 current main，來源是《文明戰線_轉生與異宇宙系統_完整設計統整_2026-10-03_定案版.docx》；之後如需改名仍應重新核對定案檔，不自行 invent。
25. AU 玩家正式進度單位使用 **「層域」**；內部程式可保留 `U`／`depth`，但玩家 UI 不應重新暴露 `1000U`、`U37` 等內部 shorthand。
26. AU replay/review 已完整移除，不要因舊規格而復活。
27. Batch6 的 overlevel、批次成長、Dungeon access、rerun progress 都已有正式 owner；未來若延伸，先讀這些 owner，**不要再建立平行公式或第二套 eligibility。**
28. Batch7 的 GM 等級設定器若會改正式 level，必須共用突破 milestone owner；首輪不發、轉生輪只對實際跨過的 100／200／…／1000 里程碑發放，降級不扣、已領不重複、Lv.1000以上不再增加本輪突破。

---

# 2. current main：三紀元正式基準

## 2.1 世界與等級

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

`currentWorldPhase()` 的正式 mapping：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式 persistent world roots 包含 `secondWorld` 與 `thirdWorld`。

current `levelprogression.js` 仍以：

```text
FIRST_WORLD_LEVEL_CAP = 500
SECOND_WORLD_LEVEL_CAP = 1000
THIRD_WORLD_LEVEL_CAP = 2000
ABSOLUTE_MAX_LEVEL = 2000
THIRD_WORLD_EXP_PER_LEVEL = 10,000,000
```

為正式基準。

W2 Lv.500～999 EXP 維持既有固定約 250 場／級基準；W3 Lv.1000～1999 每級固定 10,000,000 EXP。

## 2.2 第一紀元／第二紀元進入條件

首輪與轉生輪都保留原本「成長條件」；差異只在 rerun 已讀 Story 不再阻塞進入。

W1→W2 current `worldphase.js`：

- Lv.500；
- 最終 W1 Boss 已完成；
- 8 專精全 Lv.60；
- 五部位強化 +20；
- 10 印記全 Lv.10；
- 首輪要求最終 Story 已完成；轉生輪可 bypass 已讀 Story requirement。

W2→W3 current `thirdworldphase.js`：

- Lv.1000；
- 已進入 W2；
- W2 最終 Boss 已完成；
- 五部位強化 +40；
- 文明等級 Lv.10；
- VIP Lv.20；
- 8 專精 Lv.60；
- 10 印記 Lv.10；
- 首輪要求最終 Story；轉生輪可 bypass 已讀 Story requirement。

**轉生不取消 Lv.500／Lv.1000 世界邊界，也不取消養成條件。**

## 2.3 高維紀元

W3 正式內容包括：

- 10 名高維存在；
- 首輪 5% 戰線限制；
- 永久削血與正式 HP settlement；
- 500死連戰、Fast Catch-up、極簡模式；
- 維度之弦、界弦核心；
- W3 loot／offline；
- W3 Story 正式 11 篇／322頁與 Final Completion；
- W3 Arena；
- Mirror／Void shared 系統；
- 稱號、Guide、GM benchmark、正式進度管理。

轉生輪 W3 只取消 5% 戰線限制；其他 Boss HP、階段、能力、永久削血、正式 settlement 都維持原規則。

---

# 3. Save／Migration／資料安全

## 3.1 Schema17

current 正式基準：

```text
SAVE_SCHEMA_VERSION = 17
SAVE_LOAD_PIPELINE_VERSION = 3
SAVE_NORMALIZATION_PIPELINE_VERSION = 3
SAVE_MIN_SUPPORTED_VERSION = 1
SAVE_LEGACY_SUPPORT_MODE = "all-known"
```

目前 Batch5／Batch6／Batch6優化均沒有新增正式 persistent root，因此**仍是 Schema17，不升 Schema18**。

Schema17 正式承認 `reincarnation` persistent root；`thirdWorld` 仍為正式 persistent root。

## 3.2 舊檔原則

- Schema1～16 仍走原 migration；
- pre-Schema17 不會被誤判為已轉生；
- future save fail-closed；
- transient GM test state 不進 formal save；
- current main 的 normalization 必須冪等，不能讓 reload 重複發獎、重複回填或改寫首輪資料。

## 3.3 Reincarnation state

current `reincarnationstate.js` 正式 root 仍包含：

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

AU normalization 仍會：

- `deepestCleared > 0` 時 salvage `unlocked=true`；
- activeAttempt 必須是 `deepestCleared + 1` frontier；
- attempt 若不是 frontier 或該層域已達10敗會清掉；
- 舊 failure 格式可 canonicalize；
- first-run breakthrough 污染會清除。

## 3.4 Save safety／transaction

正式大型 state mutation 仍以 `saveversionguard.js` Save Safety 與 `settlementtransaction.js` shared transaction 為 owner。

正式轉生 precommit backup：

```text
createVerifiedReincarnationBackup()
→ ensureLocalSaveSafetyBackup("formal-reincarnation", raw)
→ verified=true 才能進 transaction
```

backup fail 時不 mutate、不 save。

---

# 4. 【已完成】突破系統

正式 owner：`breakthroughcore.js`。

## 4.1 里程碑

首輪 `count=0`：突破等級永遠 Lv.0。

`count > 0` 後，每輪正式自然升級跨：

```text
Lv.100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 / 900 / 1000
```

各 +1，每輪最多 +10；Lv.1000～2000 不再給突破。

一次升多級會補發所有實際跨過里程碑；reload 不重複；降級不扣。

## 4.2 能力

每 1 級突破：

```text
raw equipment HP / ATK / DEF +2.5%
final damage +0.05
```

正式三圍順序：

```text
base player stats
+ raw equipment HP/ATK/DEF
+ enhancement extra
+ breakthrough bonus
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

## 4.3 玩家 UI

角色頁正式顯示：

```text
突破等級 Lv.X
裝備能力倍率 +XX.X%
最終傷害加成 +XX%
```

玩家 UI 不顯示 `B1` 等內部 shorthand。

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

Story completion 不列入轉生資格。

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
- `count>0` 後永久 1.5× 戰鬥速度使用權。

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

Daily 不因轉生刷新；Mirror／Void permanent history 保留。

---

# 6. 【已完成】異宇宙

異宇宙是終局橫向挑戰，不是第四紀元。

## 6.1 資料與進度

current main 已有：

```text
200 個宇宙
每宇宙 5 層域
共 1000 層域
```

正式五層：

```text
外環 → 神庭 → 聖域 → 天座 → 主宰
```

玩家正式用語是「層域」；內部 `U/depth` 可保留。

## 6.2 敵人固定公式

```text
HP    = 320000 + 30000U + 1500U²
ATK   = 26000 + 600U
DEF   = 12000 + 250U
CRIT  = 20%
DODGE = 20%
```

U 為 internal depth 1～1000。

敵人基礎數值不讀玩家突破做 dynamic scaling；traits 再疊加。

## 6.3 7 種 canonical traits

```text
strong     強壯
ferocious  兇猛
hard       堅硬
swift      迅捷
deadly     致命
berserk    狂暴
giant      巨體
```

每次正式 attempt 固定抽 2 個不同 traits；同一 activeAttempt F5／reload 不重抽。

同一 life、同一 frontier 第10敗鎖定，鎖到下一次正式轉生；正式轉生清 current-life failures／attempt，保留 deepestCleared。

## 6.4 正式 combat／settlement

AU 共用正式 combat engine／stats／specialization／marks／VIP／equipment／breakthrough／final damage／combat speed，不建立第二套 combat engine。

AU 不套 W3 十王專屬 5pp／永久 HP shaving／boss phase。

正式勝負：

```text
win  → deepestCleared +1
loss → current-life failures +1
```

不給 EXP、金幣、暗物質、暗能量、維度之弦、裝備或任何 AU 新貨幣。

第1000層域完成後 terminal；沒有 U1001。

## 6.5 UI／入口

第一次 W3 10 名高維存在全滅後 AU 可永久解鎖；之後任何轉生輪／任何紀元／任何角色等級可進入。

AU replay／review 已完整移除，不得復活。

主畫面 entry composition 回到 `worldphaseui.js`；AU UI 不再 monkey-patch home owner。

---

# 7. 【已完成】Batch5：轉生後自由重征服

Batch5 已完成，首輪與轉生輪現在有明確隔離。

## 7.1 Story／紀元邊界

current `worldphase.js`／`thirdworldphase.js`：

- 首輪仍要求既有 Story 完成；
- `reincarnation.count > 0` 時，已讀 Story 不再阻塞世界進入；
- Lv.500／Lv.1000 與養成條件仍保留；
- 不因 rerun 自動取消原本專精／強化／印記／文明／VIP需求。

## 7.2 W1 rerun

正式 `reincarnationrerunworld1.js`：

- 100 張地圖均可直接進入；
- 普通／菁英／Boss 均可直接挑戰；
- 不受首輪普通／菁英各10次前置限制；
- 不受首輪 `bossLocked` 迴圈限制；
- Boss 不受角色等級門檻限制；
- 地圖 UI 顯示全區可挑戰／已擊敗狀態；
- 戰鬥速度 header 共用正式 `combatSpeedHeaderHtml()`；
- 正式 first-run owner 在 `count=0` 完整保留。

## 7.3 W2 rerun

正式 `reincarnationrerunworld2.js`：

- 100 Boss 都可直接挑戰；
- adventure region 在 rerun 全部可見；
- Arena eligibility 與 adventure visibility 已拆成不同 owner，避免 UI 可見誤等於 Arena 已開；
- 10 個 key bosses：Boss 9／19／…／99，對應 Lv.550／600／…／1000；
- 文明災厄仍保留文明進度鏈，不是全開無條件挑戰。

## 7.4 W3 rerun

正式 `reincarnationrerunworld3.js`：

- 首輪 5% 戰線限制保留；
- `count>0` 時只 bypass `five-point-front` 這一項；
- Boss HP、永久削血、能力、階段、連戰、正式 settlement 完全不改；
- UI 會明確顯示「轉生重征服：已解除 5% 戰線限制」。

---

# 8. 【已完成】Batch5 後主線正式向下征服

原先早期設計曾採「高階 Boss 只記實際最高 Boss、低階只靠 downward eligibility」，但這個語意已被 current main 正式覆蓋。

現在正式規則：**轉生重征服擊敗高階主線 Boss，代表其以前主線內容正式視為已征服。**

正式 owner：`reincarnationrerunprogress.js`。

## 8.1 W1

例如 rerun 擊敗 Lv.500 Boss：

- Map 0～99 普通／菁英進度正式補至完成；
- Boss 前置／Boss lock 正式整理為已征服狀態；
- `bossKilled[0...99] = true`；
- `unlockedMap` 正式回填；
- 只打到中途 Boss 就只回填到該處。

## 8.2 W2

例如 rerun 擊敗 Lv.1000 Boss：

```text
bossKilled[0...99] = true
```

若只擊敗 Boss59，只正式完成 Boss0～59。

這讓 Arena、文明災厄、地圖完成與任何依賴正式主線狀態的功能讀到一致資料，不再維護「最高 Boss flag + 假想 coverage」第二語意。

## 8.3 首輪隔離

`reincarnation.count = 0` 永遠拒絕 rerun backfill；即使測試 fixture 人工塞高階 Boss flag，也不由此 owner補低階進度。

---

# 9. 【已完成】Batch6-1：轉生越級 Online 收益

正式共用 owner：`reincarnationoverlevelrewards.js`。

公式：

```text
M = 1 + 0.03 × (enemyLevel - playerLevel)
```

只在：

```text
reincarnation.count > 0
且 enemyLevel > playerLevel
```

時啟用，否則固定 1×。

整數收益採：

```text
ceil(base × M)
```

沒有額外 hard cap。

## 9.1 W1 Online

可吃倍率：

- EXP；
- 金幣；
- 戰鬥直接掉落的基礎強化石；
- 戰鬥直接掉落的進階強化石。

明確排除：

- 裝備出售收益；
- 出售裝備轉換出的強化石／其他 sale proceeds。

## 9.2 W2 Online

可吃倍率：

- EXP；
- 暗物質；
- 暗能量。

裝備出售收益排除。

首輪 `count=0` 的原始收益公式完全不改。

---

# 10. 【已完成】Batch6-2：一鍵平均專精／平均最大強化

正式 owner：`playerbatchupgrades.js`，current：

```text
PLAYER_BATCH_UPGRADE_VERSION = 2
PLAYER_BATCH_UPGRADE_TRANSACTION_VERSION = 1
```

## 10.1 專精

玩家按鈕：**「一鍵平均提升」**。

位置：第一紀元專精頁標題列右側。

規則：

- 只在第一紀元提供；
- 第二紀元專精已依世界進入條件必須全 Lv.60，因此不再提供提升按鈕；
- 第三紀元不提供；
- 8 專精共用既有 `specializationUpgradeCost()`；
- 每次優先提升目前最低等級專精；
- 直到全 Lv.60 或下一個最低等級專精已無法支付；
- tie 依正式 key 順序穩定處理；
- 首輪／轉生輪共用同一算法與成本，不看 `reincarnation.count` 分叉。

## 10.2 強化

玩家按鈕：**「平均最大強化」**。

位置：強化頁 summary／標題區下方。

規則：

- 第一紀元與第二紀元都有；
- 第一紀元 cap +20；
- 第二紀元 cap +40；
- 第三紀元不提供；
- 五個裝備欄位每次優先提升目前最低強化欄位；
- 共用 `enhancementUpgradeCost()`、`effectiveEnhancementCap()`、既有正式資源；
- W1 使用基礎／進階強化石；
- W2 使用暗物質／暗能量；
- 不納入印記、文明等級。

## 10.3 交易安全

Batch6優化第3批後，兩個批次操作都改用 shared `runSettlementTransaction()`：

- 整批只正式 save 一次；
- `save(false)` false 或 `save()` throw 都完整 rollback；
- rollback 保留 formal `state` root identity；
- 保留既有 `specializations`、`enhancement`、`enhancement.levels` nested reference identity；
- 失敗不留下部分扣款、部分升級、HP normalization 殘留。

---

# 11. 【已完成】Batch6-3：轉生越級 Offline 收益

W1／W2 Offline 共用同一 overlevel multiplier owner，不建立第二套公式。

## 11.1 W1 Offline

越級可影響：

- EXP；
- 直接金幣；
- 戰鬥來源基礎／進階強化石。

裝備 sale proceeds 不吃倍率。

## 11.2 W2 Offline

越級可影響：

- EXP；
- 暗物質；
- 暗能量。

W3 Offline 完全不接這套越級倍率。

## 11.3 Offline provenance 舊資料安全化

`offlinestatecore.js` current：

```text
OFFLINE_BATTLE_SAMPLE_VERSION = 4
OFFLINE_REWARD_CONTEXT_PROVENANCE_VERSION = 1
```

正式策略：

- 舊 V3 sample／pending 只有原始 `playerLevel` 與 `enemyLevel` 都有效，才轉為 `overlevelContextRecorded=true`；
- 缺任何一個等級，不補假的 Lv.1 去參與越級收益；
- 舊 V4 若沒有明確 provenance marker，即使殘留數字等級，也視為不可靠，越級倍率保守 1×；
- 新正式 W1／W2 sample 由唯一 `appendOfflineBattleSample()` owner 自動標記可靠 provenance；
- W3 timing sample 不使用這個越級 reward context；
- 首輪 `count=0` 即使 provenance 可靠，共用 multiplier 仍為 1×。

這批沒有新增 Save Schema 欄位。

---

# 12. 【已完成】Batch6-4：首次轉生後四大副本永久入口

正式 owner：`reincarnationdungeonaccess.js`，current：

```text
REINCARNATION_DUNGEON_ACCESS_VERSION = 2
REINCARNATION_DUNGEON_ACCESS_SNAPSHOT_VERSION = 1
```

共用 API：

```text
dungeonModeAccessSnapshot()
isDungeonModeEntryUnlocked()
```

第一次轉生後 `count>0`：

- 懸賞戰永久可進；
- 競技場永久可進；
- 鏡像戰永久可進；
- 虛空幻境永久可進。

沿用原副本頁／原模式 owner，不建立轉生專用副本 UI。

## 12.1 首輪不動

首輪原門檻仍保留：

```text
懸賞 Lv.5
競技場 Lv.15
虛空 Lv.25
鏡像依既有 config
```

首輪高維紀元懸賞仍關閉。

## 12.2 Daily／歷史／Arena

- Daily 不因轉生重置；
- Mirror／Void permanent history 保留；
- W1/W2 Arena current-life rank 每次轉生重置；
- 永久入口 ≠ 永久全階開放；
- W1 rerun Arena cap 依本輪正式主線征服進度；
- W2 Arena 依 W2 正式 region eligibility owner；
- Arena 晉階驗收仍是 500 場至少 485 勝（97%）。

Batch6優化第2批已移除舊的暫時偽裝 global `state.level` 方案，入口與 UI 改讀同一 access snapshot；正式 `state` identity／`state.level` 不再為了入口顯示被替換。

---

# 13. 【已完成】Batch6-5＋第6大批封箱 regression

Batch6-5 已完成整體封箱與 regression。

正式行為已鎖定：

- 首輪 overlevel 永遠 1×；
- rerun Online／Offline 共用倍率；
- 一鍵專精／強化首輪與轉生輪算法一致；
- 首次轉生 reset 後四副本入口可用但 Daily／歷史規則正確；
- W1／W2 高階 Boss 正式向下征服；
- Arena W1／W2 cap 正確；
- Arena 484 / 500 不可晉階、485 / 500 可晉階；
- 裝備 sale proceeds 不吃 overlevel；
- 舊 Schema17 rerun progression normalization 冪等；
- 首輪不被舊資料修復誤回填。

---

# 14. 【已完成】第6大批程式碼優化第1～5批

## 14.1 優化第1批：Schema17 舊轉生資料一致化

`reincarnationrerunprogress.js` current：

```text
REINCARNATION_RERUN_MAINLINE_BACKFILL_VERSION = 2
REINCARNATION_RERUN_PROGRESS_NORMALIZATION_VERSION = 1
```

`normalizeExistingReincarnationRerunProgress()`：

- 只處理 `reincarnation.count > 0`；
- W1 依最高已完成 Boss 補齊此前 map/boss 進度；
- W2 依最高已完成 Boss 補齊此前 boss flags；
- 冪等；
- 首輪完全隔離；
- `migrateSave()` 後記錄 normalization report；
- 不升 Schema18。

## 14.2 優化第2批：四副本 access owner 收斂

- 共用 `dungeonModeAccessSnapshot()`／`isDungeonModeEntryUnlocked()`；
- 移除暫時 `state.level` presentation hack；
- UI 與正式入口共用相同 eligibility；
- Daily 用完仍 disabled；
- 不建立第二套副本狀態。

## 14.3 優化第3批：批次成長 transaction

- 一鍵專精／強化使用 `runSettlementTransaction()`；
- 成功單一 save；
- save false／exception 完整 rollback；
- root／nested identity 保持。

## 14.4 優化第4批：Offline provenance

- V3/V4 舊樣本依「是否有可驗證玩家／敵人等級來源」判定能否吃越級倍率；
- 不可靠樣本保守 1×；
- 新正式 sample 由唯一 sample owner 標記 provenance。

## 14.5 優化第5批：W1 overlevel settlement owner 收斂

Batch6-1 初版曾由 `reincarnationoverlevelrewards.js` 外包 `fightOnce`，造成主戰鬥先 save、越級 adapter 再補收益再 save。

目前已改為：

- `combatcore.js` 的 W1 `fightOnce` 保持主戰鬥唯一 settlement/save owner；
- 在原本進度、掉落、Story queue 建立後、最終唯一 `save(false)` 前直接呼叫 `applyWorld1OnlineOverlevelReward(...,{persist:false})`；
- overlevel owner 不再包裝 W1 `fightOnce`。

current markers：

```text
MAINLINE_OVERLEVEL_REWARD_INTEGRATION_VERSION = 1
REINCARNATION_OVERLEVEL_W1_ADAPTER_VERSION = 2
REINCARNATION_OVERLEVEL_FIGHT_WRAPPER_RETIRED_VERSION = 1
```

因此 W1 正式戰鬥目前只在最終 settlement save 一次。

注意：`reincarnationrerunprogress.js` 仍有 current main 的 rerun conquest／migration 相容 bridge；未來若要再收斂，先確認 consumer 與回歸，不要另外再疊新 wrapper。

---

# 15. 競技場：本對話的重要 bug 修正與正式現況

曾出現 rerun 擊敗 Lv.500 Boss 後，競技場區域條件顯示達成，但仍只能開第一階；甚至需要再逐一打 Lv.50、100…才開後續階。

根因是早期「高階 Boss 只提供 downward eligibility、低階正式 `bossKilled` 不回填」與既有 Arena 正式資料來源不一致。

目前正式修正不是在 Arena UI 再加例外，而是**高階主線 Boss 勝利正式向下征服**：

- W1 Lv.500 Boss → 前面主線正式回填；
- W2 Lv.1000 Boss → Boss0～99 正式回填；
- Arena 直接讀一致的正式主線資料。

這個修正**只在 rerun `count>0` 生效，首輪完全不動**。

Arena promotion 正式規則維持：

```text
ASSESS_RUNS = 500
ASSESS_CLEAR_TARGET = 485
```

即 97%；484/500 不通過，485/500 通過。

---

# 16. 戰鬥速度與 UI 行為

轉生後 `count>0`，1.5× 戰鬥速度永久可用，即使回到 W1 也可使用。

首輪 W1 保持 1×；W2/W3 維持既有 1×／1.5×；GM 可用 2×。

Rerun W1 的戰鬥 header 共用正式 `combatSpeedHeaderHtml()`，不另外做第二套速度徽章。

副本頁在轉生後永久入口狀態會顯示：

```text
轉生後永久解鎖
```

但 Daily 用完仍停用，不因永久入口繞過每日限制。

---

# 17. 裝備自動處理政策（仍有效）

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

Online／Offline／equipment reward 應共用正式 policy；神話沒有另一套硬編碼豁免。

Batch6 overlevel **不得改變裝備出售公式，也不得讓 sale proceeds 吃倍率。**

---

# 18. GM／測試 current main 現況

重新讀取 current `gmhub.js` 後，現有 GM Hub 仍以「管理／測試」分離架構為主。

現有正式管理／工具包含：

- 角色一般管理；
- VIP；
- 專精；
- 五部位強化；
- 印記；
- 文明等級；
- W1/W2/W3 正式進度管理；
- 產生各紀元裝備；
- 副本管理；
- 匯出／匯入資料；
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
- W2/W3 progression 重建走既有 progression management owner；
- 正式多欄位 mutation 優先 atomic transaction；
- 測試用強化可在 +0～+40 沙盒範圍，不消耗正式資源；
- 角色能力／戰力基準測試應共用正式 combat/stat owner，不建立第二套戰鬥公式。

---

# 19. 【尚未完成】Batch7：GM／測試工具正式收尾

目前 current main 真正主要尚未施工項目是 Batch7。

至少已正式確認的一項硬規則：

## 19.1 GM 等級設定器與突破里程碑

未來 GM 正式設定 level 若跨越突破里程碑，必須共用現有突破 milestone owner：

- 首輪 `count=0`：不增加突破；
- 轉生輪 Lv.1→500：應補 100／200／300／400／500，共 +5；
- Lv.500→1000：再補 600／700／800／900／1000，共 +5；
- 同里程碑不得重複領；
- 降級不扣突破；
- Lv.1000以上不再增加本輪突破；
- 不得由 GM UI 自己寫第二套 milestone 判定。

## 19.2 其餘 Batch7 收尾方向

開始 Batch7 前必須重新 fresh-read current main，再確認哪些已存在、哪些仍缺，不可直接照舊 handoff 盲做。

舊規劃可作為檢查清單，但不是尚未實作的絕對真相：

- 轉生次數／永久突破正式管理；
- 正式轉生 GM transaction；
- AU unlock／deepest 管理；
- 角色測試加入突破值／同步；
- AU benchmark；
- 21 種雙 trait pair diagnostics；
- rerun／overlevel／dungeon／AU 多生命週期 regression；
- 最終跨紀元、轉生、多輪舊檔、Offline、GM formal/sandbox 收尾。

**施工時一定先重新檢查 current main，已存在的不要重做。**

---

# 20. current main 重要 owner 索引

施工前仍要 fresh-search；以下只是目前索引。

## Reincarnation／Breakthrough／Rerun

```text
reincarnationstate.js
reincarnationcore.js
breakthroughcore.js
breakthroughui.js
reincarnationui.js
reincarnationrerunworld1.js
reincarnationrerunworld2.js
reincarnationrerunworld3.js
reincarnationrerunprogress.js
reincarnationoverlevelrewards.js
reincarnationdungeonaccess.js
playerbatchupgrades.js
```

## Alternate Universe

```text
alternateuniversedata.js
alternateuniverseattempt.js
alternateuniversecombat.js
alternateuniverseprogression.js
alternateuniverseaccess.js
alternateuniverseui.js
alternateuniverse.css
traits.js
backgrounds.css
```

## World／Combat／Stats

```text
worldphase.js
thirdworldphase.js
worldtransitionsafety.js
worldphaseui.js
levelprogression.js
enhancementcore.js
enhancementcombat.js
combatmath.js
combatcore.js
secondworldcombat.js
secondworldrewards.js
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
offlinefarmtarget.js
offlineprogress.js
offlineworld3adapter.js
thirdworldcombatsaveguard.js
```

## Dungeon／Arena／Mirror／Void

```text
dailycore.js
dungeonprogress.js
dungeoncore.js
dungeonbounty.js
dungeonarena.js
arenapositioncore.js
arenawindowcore.js
thirdworldarena.js
thirdworldarenaui.js
dungeonvoid.js
dungeonvoidui.js
mirrordungeonstate.js
mirrordungeonrun.js
mirrordungeonui.js
reincarnationdungeonaccess.js
```

## W3

```text
thirdworlddata.js
thirdworldcore.js
thirdworldcombat.js
thirdworldprogress.js
thirdworldrun.js
thirdworldplayerflow.js
thirdworldui.js
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

# 21. Runtime／Integrity current baseline

current Runtime Integrity 會檢查：

- 全 JS syntax／owner integrity；
- save/global writer 相關 integrity；
- real browser runtime smoke；
- Reincarnation／Breakthrough；
- AU data／attempt／combat／failure／progression／UI／old-save；
- Batch5 rerun E2E；
- Batch6 overlevel Online／Offline；
- player batch upgrades；
- dungeon permanent access；
- Schema17 rerun normalization；
- Offline provenance；
- Batch6 closure regression；
- VIP unbounded；
- GM mainline HP lock；
- asset integrity；
- documentation integrity。

Batch6 closure 已從部分 source-string 檢查提升成 browser 行為 regression，包含：

- Arena 484/500 vs 485/500；
- W1 真實 rerun `fightOnce` 越級收益；
- W1 正式 save 單次；
- sale proceeds 隔離；
- 主線向下征服；
- 四副本永久入口；
- 批次成長首輪／轉生一致；
- reset lifecycle。

功能 HEAD `8680cee...`：

```text
Runtime Integrity #1615：success
Pages build and deployment #5568：success
```

---

# 22. 明確不要自行復活／擴充的方向

1. 不把異宇宙做成 Lv.2001+ 或第四紀元。
2. 不讓 AU enemy 讀突破等級 dynamic scaling。
3. 不新增 AU 專用刷裝貨幣或資源收益。
4. 不要求轉生後重看已讀舊劇情。
5. 不要求 rerun W1/W2 按首輪逐圖解鎖。
6. 不取消 Lv.500／Lv.1000 紀元邊界與既有養成條件。
7. 不為 overlevel 自行加 hard cap／單場升級 cap。
8. 不讓裝備出售收益吃 overlevel multiplier。
9. 不讓 AU 套 W3 十王專屬 5pp／永久削血／boss phase。
10. AU 每場正式 attempt 固定2 traits，不升3／4個。
11. 不復活 AU replay／review。
12. 不讓 UI／GM 自己維護 lifeId／lock／speed永久解鎖等可衍生 flag。
13. 不重做第二套 final damage、equipment stat、transaction、save backup、phase UI owner。
14. `lostGear` 在正式轉生直接清空；不要重新發明 W3 lostGear 特殊保留機制。
15. 玩家 UI 不顯示內部 `B` shorthand；使用「突破等級」。
16. 玩家 AU 進度使用「層域」，不要重新顯示 `1000U`／`Uxx`。
17. 不把 AU UI 改回 runtime CSS owner、home monkey-patch 或多一個 battle busy owner。
18. 不恢復「高階 Boss 只記自身、不正式回填前段主線」舊規則。
19. 不把四副本「永久入口」誤做成「所有 Arena rank／所有內部階級永久全開」。
20. 不讓首輪 `count=0` 吃 rerun backfill、Story bypass、W3 5% bypass 或 overlevel multiplier。
21. 不為一鍵專精／強化再寫第二套成本公式。
22. 不讓 W2 專精再出現提升按鈕；正式成長已在 W1 完成。
23. 不讓 W3 出現玩家強化升級或一鍵強化操作；W3 沿用已完成的 +40 裝備強化狀態。
24. VIP 特殊特權目前到 VIP20；不要自行新增 VIP21+ 特殊特權。

---

# 23. 原定 7 大批最新進度

```text
第1批：轉生核心資料與首輪隔離                     ✅ 完成
第2批：突破系統＋正式轉生                         ✅ 完成
第2批後優化1～4                                   ✅ 完成
第3批：異宇宙最小可玩版                           ✅ 完成
第4批：異宇宙完整化／UI／平衡／Regression          ✅ 完成
AU 架構優化第1～3批                               ✅ 完成
第5批：W1／W2／W3 轉生後重征服                    ✅ 完成
第5批後架構優化／主線回填                         ✅ 完成
第6批：越級收益／批次成長／Offline／四副本／封箱    ✅ 完成
第6大批程式碼優化第1～5批                        ✅ 完成
第7批：GM／測試／完整 Integrity 收尾               ⏳ 尚未施工
```

**下一個主要正式批次是 Batch7。**

---

# 24. 下一個對話如何接手

可直接貼以下標準指令：

```text
請讀取 franksky1207/rpg 的 PROJECT_HANDOFF.md，並重新 fresh-read GitHub main 的實際程式碼，完整承接《文明戰線》專案。

要求：
1. main 是唯一真實來源，不可只靠交接檔、舊對話或記憶。
2. 先重新確認 current main HEAD。
3. 先讀 PROJECT_HANDOFF.md，再讀本次要處理功能的正式 owner／consumer。
4. 若 handoff 與 current main 衝突，以 current main 為準並指出差異。
5. 修改前先找正式 owner，優先修改 owner，不新增 wrapper、fallback、第二套公式、第二套 combat engine、第二套 offline pipeline、第二套 migration／completion owner。
6. JS／CSS 有修改時同步更新 index.html cache-bust。
7. 每批修改後 fresh-read current main、compare base→head、自我檢查 UI／邏輯／正式資料寫入／舊檔相容／transaction／regression，並查 exact HEAD 的 Runtime／Pages；Story 僅在相關 production 變更時檢查。沒有實際 success 不可宣稱綠燈。
8. 我說「先討論／先檢查／先不要修改」時不得改 GitHub；我說「做／修改／執行／第N批」時可直接修改 main。
9. 首輪 reincarnation.count=0 必須完全維持既有正式規則；rerun 規則只在 count>0 啟用。
10. 玩家突破正式用語為「突破等級」，內部 B shorthand 不出現在玩家 UI。
11. 玩家異宇宙正式進度單位為「層域」；程式內可保留 U/depth，但玩家 UI 不顯示 1000U/Uxx。
12. 異宇宙 replay/review 已完整移除；不要復活。
13. Batch5 與 Batch6、以及第6大批程式碼優化第1～5批都已完成，不要重做。
14. rerun 高階 Boss 勝利現在會正式向下征服／回填前段主線；舊『只記最高 Boss flag』規則已失效。
15. Batch6 overlevel 正式公式為 M = 1 + 0.03 × (enemyLevel - playerLevel)，只在 count>0 且 enemyLevel>playerLevel；整數收益 ceil；裝備出售收益排除。
16. 一鍵專精只在 W1；平均最大強化只在 W1/W2；兩者都走 shared transaction。
17. 首次轉生後四大副本入口永久可用，但 Daily、Arena rank progression、Mirror/Void history 各自維持正式 owner，不等於全階永久解鎖。
18. 下一個主要正式批次是 Batch7：GM／測試工具正式收尾。開始前先 fresh-read GM level setter、breakthrough milestone owner、GM formal transaction、AU／rerun／dungeon test owners，再提出分批方案。
19. GM 等級設定器若改正式 level，必須共用突破 milestone owner：首輪不發；轉生輪跨 100／200／…／1000 才發；降級不扣、已領不重複、1000以上不再增加本輪突破。
20. 若尚未施工規格需要精確設計細節，再重新核對正式定案檔，不要自行補規則或名稱。

現在先不要修改，先告訴我你讀到的 current main 現況、已完成項目、真正尚未完成項目，以及 Batch7 應先讀哪些正式 owner。
```
