# 《文明戰線》目前待辦狀態

更新日期：2026-10-05（UTC+8）  
分支：`main`

> **最高原則：GitHub `main` 的實際程式碼是唯一真實來源。**  
> 本檔只保留 current main 的正式現況、仍有效相容策略，以及真正尚未完成工程。若本檔、舊對話、舊設計文件或其他摘要與 current main 衝突，一律以 current main 為準。

---

# 目前正式狀態

目前主要既定工程均已完成：

```text
三大紀元正式 runtime                          ✅ 完成並維護／實測中
裝備自動處理政策                              ✅ 完成
轉生核心資料與首輪隔離                        ✅ 完成
突破系統＋正式轉生                            ✅ 完成
異宇宙 Batch3～4                              ✅ 完成
AU 架構優化第1～3批                           ✅ 完成
Batch5：W1／W2／W3 轉生後重征服               ✅ 完成
Batch5 後續架構優化／主線向下征服              ✅ 完成
Batch6：越級收益／批次成長／副本／封箱         ✅ 完成
Batch6 程式碼優化第1～5批                     ✅ 完成
Batch7：GM／測試工具正式收尾 7-1～7-5全部完成   ✅ 完成
Batch7 封箱後程式碼優化第1～4批                ✅ 完成
第一紀元完整 Target Context 重構 Batch0～6      ✅ 完成
第一紀元 Target Context 重構後優化第1～4批      ✅ 完成
目前已排定工程                                 ✅ 全部完成
```

**目前沒有已經定案、等待施工的下一個功能批次。**

後續若使用者提出新功能、新平衡、新 UI 或新重構，必須重新 fresh-read current main 後再建立新的施工範圍，不得把已完成的舊批次重新當成待辦。

---

# Current main 重要正式基準

## 三紀元

`currentWorldPhase()` 正式 mapping：

```text
1 = 銀河紀元
2 = 宇宙紀元
3 = 高維紀元
```

正式等級：

```text
銀河紀元：Lv.1～500
宇宙紀元：Lv.501～1000
高維紀元：Lv.1000～2000
```

正式 persistent world roots 維持 `secondWorld` 與 `thirdWorld`。

## Save／Migration

```text
SAVE_SCHEMA_VERSION = 17
SAVE_LOAD_PIPELINE_VERSION = 3
SAVE_NORMALIZATION_PIPELINE_VERSION = 3
SAVE_MIN_SUPPORTED_VERSION = 1
SAVE_LEGACY_SUPPORT_MODE = "all-known"
```

目前完成的 Batch5／6／7、Batch7 後優化與 W1 Target Context 重構都沒有新增必要 persistent root，因此仍不升 Schema18。

Future schema 必須 fail closed；正式大型 mutation 必須共用 Save Safety 與 transaction owner。

## 轉生／突破

- 首輪 `reincarnation.count = 0`，突破固定 Lv.0。
- 只有 `count > 0` 啟用 rerun。
- 轉生輪跨 Lv.100／200／…／1000，各取得1突破；每輪最多10。
- Lv.1000以上不再增加本輪突破。
- 已領不重複、降級不扣。
- 正式轉生資格：Lv.2000＋本輪10名高維存在全滅＋界弦核心 Lv.10。
- Story completion 不列正式轉生資格。
- 正式轉生需 verified backup，再走 shared settlement transaction。

## 異宇宙

- 異宇宙不是第四紀元。
- 200宇宙 × 5層域 = 1000層域。
- 第一次 W3 10名高維存在全滅後永久解鎖。
- AU replay／review 已完整移除，不得自行復活。
- 玩家／GM正式進度用語固定為「層域」。

---

# 第一紀元 Target Context：已完成，不是待辦

第一紀元完整 Target Context 重構已完成 Batch0～6，後續優化第1～4批亦已完成。

現在 W1 battle authority 已由 Target Context 正式接管：

```text
UI → prepare → encounter → combat → settlement → progression
```

核心 identity：

```text
world = 1
mapIndex
敵人索引 enemyIndex
lifeId
reincarnation count
mode = formal / rerun / review
```

正式規則：

- `selectedMap / selectedEnemy` 只作 UI／navigation selection，不再作戰鬥執行期 target authority。
- Target Context post-prepare execution 必須 fail closed。
- lifecycle owner 缺失、context stale、life/count 不一致、identity 不一致時不得 fallback 回 UI selection。
- formal／rerun／review policy 已集中於 Target Context owner。
- W1 單場、連戰、Fast Catch-up、offline sample、rerun、review、settlement／progression 已有對應 regression coverage。
- 不建立第二套 progression／combat／offline／target owner。

因此，任何「第一紀元 Target Context 尚未施工」、「Target Context 是下一個大型工程」的舊敘述均已失效。

---

# 仍有效的既有硬規則

## 第6大批

- 轉生越級收益共用 `reincarnationoverlevelrewards.js`。
- 倍率 `M = 1 + 0.03 × (enemyLevel - playerLevel)`，僅在 `reincarnation.count > 0` 且敵人高於玩家時啟用。
- 首輪永遠 1×。
- W1／W2 Online 與 Offline 依正式 provenance 規則處理；舊 sample 無可靠 provenance 時保守 1×。
- W3 Offline 不接越級倍率。
- 共用批次成長 owner：`playerbatchupgrades.js`。
- 第一次轉生後四大副本永久入口可用；首輪高維紀元仍維持懸賞戰關閉。
- W1／W2 rerun 高階 Boss 正式向下回填前段主線；首輪禁止此 rerun 回填。

## Batch7

- GM formal management 與 GM test sandbox 永遠分離。
- 突破正式用語固定「突破等級」。
- AU 正式進度用語固定「層域」。
- 戰力基準 current = 8 模式。
- GM 正式 level 若未來新增／修改控制器，突破 milestone 必須共用正式 owner。

## 高維紀元

- W3 Story／Final 已完成，不自行重寫或擴增既有11篇正式主線。
- 玩家正式用語：「10 名高維存在」。
- W3 永久 HP settlement 契約不得改變：

```text
formalStartHp → combatEndHp → permanent delta
```

---

# 已取消／不得自動復活

- AU 作為 Lv.2001+ 或第四紀元。
- VIP21+ 新增特殊特權。
- AU replay／review。
- 高階 Boss 只記自身、不正式回填前段主線的舊規則。
- 任何 GM sandbox 寫正式 save 的做法。
- 以 `selectedMap / selectedEnemy` 重新作為 W1 battle execution authority。
- 已完成的 Batch5／6／7 或 Target Context 工程重新列成待辦。

---

# 後續操作規範

1. `main` 是唯一真實來源；每次修改前 fresh-read current main 的相關正式 owner／consumer。
2. 使用者說「先討論／先檢查／先不要修改」時不得修改 GitHub；說「修改／做／執行／第N批」時可直接改 `main`。
3. JS／CSS production 修改必須同步更新 `index.html` cache-bust；Markdown-only 不需要。
4. 每批修改後 fresh-read current main、compare base→head，自我檢查 UI／邏輯／正式 state／舊檔相容／transaction／runtime／Integrity。
5. Integrity／Actions 沒有 exact HEAD 的 success 不可宣稱綠燈。
6. 優先延伸正式 registry／policy／transaction／normalizer／combat／offline／progression／target owner，不建立第二套相同責任的 wrapper 或 fallback。
7. `offlineprogress.js` 是正式 compatibility/offline consumer；不得建立第二套 Offline pipeline。
8. 正式轉生與其他大型 state mutation 必須走 shared transaction／backup owner。

---

# 真正待辦

**目前沒有已定案、等待施工的功能批次。**

下一個工作應由使用者的新需求開始，重新依 current main 分析、定義範圍與分批施工。