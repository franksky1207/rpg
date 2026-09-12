# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 本文件只做跨對話承接。若本文、歷史對話、記憶、舊截圖或舊規格與目前 `main` 衝突，一律重新讀取 `main` 並以實際程式碼為準。

更新日期：**2026-09-12**

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `data.js` legacy `SAVE_VERSION = 9`
- 正式存檔 schema：`savemigration.js` 的 `SAVE_SCHEMA_VERSION = 10`
- `MAX_LEVEL = 500`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 世界：10 大區域、100 張主線地圖、Lv1～500
- 每張地圖固定 5 級、5 隻敵人：普通×3、菁英×1、Boss×1
- 桌面與手機都要支援；iPhone Safari 是重要真機環境

遊戲定位：簡單、傳統、文字型 RPG。核心循環為打怪、升級、拿裝備、推地圖。不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者明確要求。

---

## 2. 下一個 ChatGPT 的硬性操作規範

1. 修改前必須重新讀目前 GitHub `main` 的相關正式檔案，並重新讀完整 `index.html`。
2. 公式、狀態、UI 共用函式、save/load、戰鬥流程或跨檔行為，先搜尋引用點。
3. 使用者說「先不要改／先討論／先分析／先檢查」時不得寫 GitHub。
4. 使用者明確說「修改／開始／做」且規格已清楚，可直接修改 `main`。
5. 優先修改正式來源；避免平行第二套公式。若使用 presentation/enhancement layer，必須只處理呈現，不得複製戰鬥公式。
6. JS/CSS 修改後同步更新 `index.html` cache-bust。
7. 修改後重新讀回改動檔；JS/CSS 有變更時再重讀完整 `index.html`。
8. 多檔修改後用 compare 檢查差異。
9. GitHub 寫入成功不等於 GitHub Pages、桌機或 iPhone Safari runtime 驗證完成；沒實測就不可宣稱已驗證。
10. 本 handoff 與 `main` 衝突時，以 `main` 為準。

---

## 3. 世界區域與地圖

`WORLD_REGIONS` 為 10 大區域唯一正式來源：

1. Lv1–50 地球戰爭，Map1–10
2. Lv51–100 太陽系戰爭，Map11–20
3. Lv101–150 近星戰爭，Map21–30
4. Lv151–200 星際邊疆，Map31–40
5. Lv201–250 獵戶臂戰爭，Map41–50
6. Lv251–300 銀河邊境，Map51–60
7. Lv301–350 銀河中域，Map61–70
8. Lv351–400 銀河核心外圍，Map71–80
9. Lv401–450 銀河核心戰爭，Map81–90
10. Lv451–500 銀河統合戰爭，Map91–100

地圖資料依區域拆成 `worldmaps-*.js` 十個檔案。`worldmapui.js` 負責玩家區域式地圖 UI：尚未到達的大區域與未解鎖地圖不顯示，最高已解鎖區域預設展開，舊區域預設收合但可手動展開；展開狀態只存在當次 UI session。

主線固定流程：普通1×10 → 普通2×10 → 普通3×10 → 菁英×10 → 達本圖最高等級 → Boss。Boss 固定單場；首次擊敗解鎖下一圖並免費刷新新圖商店；Boss 戰敗後需再打本圖菁英10次才能重挑。

---

## 4. 主線戰鬥模式

玩家正式只有：

- 單場戰鬥
- 連續戰鬥

兩者 Lv1 開放。Boss 永遠單場。

連續戰鬥會一直挑戰目前選擇的敵人；玩家要求停止時，打完目前這場才停止；戰敗立即結束。背景持續最多 12 小時。

主要檔案：
- `battlepipeline.js`
- `continuousbattle.js`
- `backgroundprogress.js`

舊 `infinitebattle.js` 已刪除，但 `battlepipeline.js` / `specialencounter.js` 仍可能保留舊 `infinite` 相容命名。這只是內部相容，不代表玩家仍有第三種戰鬥模式。

---

## 5. Lv500、EXP、金幣

角色基礎：

```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

正式 EXP 曲線在 `engine.js`：

```js
const EXP_CURVE = { killMin:5, killRange:495, scale:142 };
sameExp(l) = ceil(25 + 4*l);
expNeed(l) = ceil(sameExp(l) * (5 + 495*(1-exp(-(l-1)/142))));
```

Lv500 為滿等。Lv500 不再累積 EXP；原本可取得 EXP 以 1:1 轉金幣。Lv500 死亡沒有 EXP 損失，但裝備遺失仍照常，除非 VIP20。

---

## 6. 裝備、掉落、專精、VIP

裝備部位：武器、頭盔、鎧甲、鞋子、飾品。
品質：普通、優良、稀有、史詩、傳說、神話。
裝備最高 Lv500。

主線 Boss 品質表：`[0,45,35,15,4.5,0.5]`。
`traitdrop.js`：
- 1 特性：15% 品質提升
- 2 特性：30%
- VIP14：5%
- VIP18 主線 Boss：10%
- VIP8 弱部位優先：15%
- 品質最高神話

專精共 8 種，最高 Lv30：訓練、搜刮、鑑價、先制、連擊、穿透、反擊、汲取。戰鬥專精由 `runCombatCore()` 正式處理。

VIP 最高 20。每級基礎能力：HP/ATK +0.5%、DEF +0.25%、暴擊/閃避 +0.25%。VIP20 合計 HP/ATK +10%、DEF +5%、暴擊/閃避 +5%。

---

## 7. 副本總覽

- Lv5：懸賞戰
- Lv15：競技場
- Lv25：虛空幻境

副本次數由主線勝利累積進度換得；VIP4 / VIP12 提高取得速度。

---

## 8. 懸賞戰：目前正式基準

定位：**高 EXP、高金幣、多裝備**。

Tier 內部正式數值：
- 普通：45%，EXP×5、金幣×5、2件
- 高級：35%，EXP×8、金幣×8、3件
- 危險：20%，EXP×12、金幣×12、5件

品質：稀有60%、史詩35%、傳說4.5%、神話0.5%，普通/優良0%。Trait、VIP14、VIP8仍可作用；VIP18不作用於懸賞。

**玩家 UI / guide 不公開 Tier 權重與品質百分比。**

### 懸賞單次／連續挑戰

- 玩家可選單次或連續。
- 懸賞一場＝一個連續單位。
- 每一場真正開始前才消耗 1 次副本次數，不預扣多次。
- 每場結束後正常 `finishDungeonRun()`，所以新一場重新滿血。
- 停止條件：死亡、次數不足、玩家手動停止。
- 手動停止在目前這場打完後生效。
- 連續模式中間不進完整結算；真正停止時才顯示總結算。
- 總結算累積：場數、勝場、總 EXP、懸賞金幣、滿等 EXP 轉金幣、自動出售金幣、裝備總數、保留/出售件數、停止原因。

`dungeonplayerui.js` 已將懸賞戰前精確 EXP／金幣／裝備件數預覽從玩家畫面移除，改顯示「高 EXP・高金幣・多裝備」。底層 `dungeonbounty.js` 仍保留計算函式與舊 DOM 產生邏輯，presentation layer 會在正式玩家畫面移除精確預覽。

---

## 9. 競技場：2026-09-12 五批改版後正式基準

### 9.1 十大競技場階級

競技場大階名稱直接對應 `WORLD_REGIONS`：

1. 地球戰爭級
2. 太陽系戰爭級
3. 近星戰爭級
4. 星際邊疆級
5. 獵戶臂戰爭級
6. 銀河邊境級
7. 銀河中域級
8. 銀河核心外圍級
9. 銀河核心戰爭級
10. 銀河統合戰爭級

`arenaRank <= 已解鎖主線區域數`。主線只決定競技場最高可達 Rank，不會自動晉升。

舊存檔沒有 Rank 時由 `dungeonprogress.js` 正規化為 Rank1。

正式永久資料：
- `state.dungeon.arena.rank`
- `promotionReady`
- `lastCheckSignature`
- `lastCheckRuns`
- `lastCheckClearCount`

### 9.2 每階三種玩家難度

玩家名稱：
- 低難：穩定挑戰／安全收益
- 中難：較高收益／明顯風險
- 高難：最高風險／晉升評估基準

內部 difficulty id 仍是 `normal / hard / extreme`，且 `dungeonarena.js` 的內部 name 仍可能保留普通／困難／極限，供相容與底層資料使用；玩家 UI 由 `dungeonplayerui.js` 顯示低／中／高。不要因內部 ID/舊 name 還存在就判斷玩家制度未改。

每次一輪固定三戰，三戰之間不回血；任一戰失敗該輪立即失敗。每個新敵人可重新觸發先制。

### 9.3 Rank HP / 傷害 / DEF 成長

令 `R = arenaRank`：

```text
RankHp     = 1 + 0.05*(R-1)
RankDamage = 1 + 0.015*(R-1)
RankDef    = 1 + 0.03*(R-1)
```

正式敵人：

```text
EnemyHP = BaseEnemyHP(P) × difficultyHp[stage] × RankHp
EnemyDamageComponent = BaseEnemyDamage(P) × difficultyDamage[stage] × RankDamage
EnemyATK = ceil(EnemyDamageComponent + P.def*0.55)
EnemyDEF = BaseEnemyDEF(P) × difficultyDef[stage] × RankDef
```

`P` 是玩家目前基礎＋裝備快照，**不含 VIP、不含戰鬥專精**。

正式戰鬥玩家端才套 VIP 與戰鬥專精，因此 VIP／專精是真正用來逐步征服競技場 Rank 的額外成長。

### 9.4 暴擊／閃避：Rank 永遠不成長

這是使用者明確鎖定的規則。玩家暴擊/閃避頂端約25%，因此競技場 Rank 不得再提高暴閃模板。

低難：
- S1 crit = playerCrit×0.25 cap5；dodge = playerDodge×0.20 cap4
- S2 crit ×0.35 cap7；dodge ×0.30 cap6
- S3 crit ×0.45 cap9；dodge ×0.40 cap8

中難：
- S1 crit ×0.40 cap8；dodge ×0.35 cap7
- S2 crit ×0.55+1 cap12；dodge ×0.50+1 cap10
- S3 crit ×0.70+2 cap16；dodge ×0.65+1 cap14

高難：
- S1 crit ×0.55+1 cap12；dodge ×0.50+1 cap10
- S2 crit ×0.75+2 cap18；dodge ×0.70+1 cap15
- S3 crit ×0.90+3 cap23；dodge ×0.85+2 cap20

**Rank1～Rank10都完全相同；未來擴 Rank 也不要隨 Rank 提高暴閃。**

### 9.5 特性

目前特性模板也固定只跟低／中／高難度走，不隨 Rank 增長：
- 低 S1：70%0 /30%1
- 低 S2：50%0 /50%1
- 低 S3：固定1
- 中 S1/S2：固定1
- 中 S3：75%1 /25%2
- 高 S1：固定1
- 高 S2：60%1 /40%2
- 高 S3：50%1 /50%2

最高仍 2 特性。

### 9.6 VIP 積分

全通總積分：

```text
低難 = 180 + 130*(Rank-1)
中難 = 300 + 130*(Rank-1)
高難 = 420 + 130*(Rank-1)
```

Rank1～10：
- R1 180 / 300 / 420
- R2 310 / 430 / 550
- R3 440 / 560 / 680
- R4 570 / 690 / 810
- R5 700 / 820 / 940
- R6 830 / 950 / 1070
- R7 960 / 1080 / 1200
- R8 1090 / 1210 / 1330
- R9 1220 / 1340 / 1460
- R10 1350 / 1470 / 1590

三戰積分依 Rank1 原比例一起放大，不是只增加第三戰。

### 9.7 晉升評估

只有目前 Rank 的**高難**可取得晉升資格。

- 模擬 500 次完整三連戰。
- 每次滿血開始。
- 三戰殘血連續。
- 任一戰死亡即該次未全通。
- `clearCount >= 450` 才達標（≥90%）。
- 模擬不扣副本次數、不給 VIP 積分、不改正式 HP。
- 評估使用目前裝備基準生成敵人；玩家套正式 VIP＋戰鬥專精。
- `promotionReady=true` 後資格永久保留，直到真正晉升。
- 真正晉升必須：有資格 + 主線已開下一區 + 尚未最高 Rank。
- 晉升是玩家手動操作，不自動升階。
- 晉升後 Rank+1，清空上次評估結果，重新評估新 Rank。
- 戰力簽章包含 Rank、角色等級、裝備後 HP/ATK/DEF/crit/dodge、VIP、5個戰鬥專精；尚未取得資格時，戰力改變會讓舊評估標示 stale，可重評。

### 9.8 競技場單次／連續挑戰

- 玩家可選單次或連續。
- 競技場一個完整三連戰＝一輪。
- 連續模式鎖定開始時的 Rank＋難度，不會中途自動升階或換難度。
- 三戰內不回血；整輪結束後 `finishDungeonRun()`，下一輪重新滿血。
- 下一輪真正開始前才扣下一次副本次數。
- 停止：該輪失敗/死亡、次數不足、玩家手動停止。
- 手動停止會完成目前整輪三連戰後才停。
- 連續模式中間不跳正式結算，最後總結算顯示輪數、全通/失敗輪數、總 VIP 積分、停止原因。

### 9.9 玩家介面

`dungeonplayerui.js` + `dungeonplayerui.css` 為競技場/懸賞玩家 presentation layer：
- 顯示目前競技場 Rank 名稱。
- 顯示 Rank / 主線開放上限。
- 顯示下一階與主線卡階提示。
- 顯示 500 次晉升評估狀態與進度條。
- 玩家顯示低／中／高難，不主打舊普通／困難／極限名稱。
- 準備頁解釋單次／連續。
- 連續戰鬥顯示已完成輪/場數。
- 總結算顯示停止原因。
- 已做手機窄版 CSS。

---

## 10. 虛空幻境

虛空幻境維持既有無限爬層設計；每10層 Boss、逐層 VIP 積分、每層戰後回滿 HP。相關檔：`dungeonvoid.js`、`dungeonvoidui.js`、`dungeonvoidgmmanage.js`、`dungeonvoidgmui.js`。

---

## 11. GM 管理與測試

GM 主線測試：`區域 → 地圖 → 怪物`，GM 可看全部10區/100圖，不受正式角色探索限制；正式大量測試預設 `GM_TEST_RUNS=100`。

競技場第五批新增 `arenagm5.js`，在現有 GM hub 的「競技場測試」區塊提供：
- Rank1～Rank10 下拉選擇，不受正式角色 Rank/主線解鎖限制。
- 低／中／高難下拉。
- 100 次完整三連戰測試。
- 500 次晉升評估；固定使用高難，450/500 判定達標。
- 使用上方 GM 測試 VIP 與測試專精。
- 敵人用不含 VIP/專精的裝備基準。
- 顯示第1戰通過率、第2/3戰到達率與條件通過率、全通率、平均積分、全通平均剩餘 HP、平均總回合。
- 500次另顯示 clearCount / 500 與是否達標。
- GM 測試不扣副本次數、不給正式 VIP 積分、不替正式角色取得 promotionReady。

現有 `dungeongm.js` 仍保留舊 `gmSimulateArena100()` 與普通/困難/極限內部測試入口供相容；正式 GM 畫面由 `arenagm5.js` 升級後呈現 Rank 版。不要直接刪除舊函式，除非之後做專門清理並驗證所有引用。

---

## 12. 遊戲說明與玩家文字

`gameguide.js` 是原始說明資料；第五批新增 `gameguidearena5.js` 更新副本頁正式呈現：
- 懸賞定位改為高 EXP／高金幣／多裝備。
- 懸賞單次／連續規則。
- 競技場十大 Rank 與主線上限。
- 低／中／高難定位。
- 500次／450次晉升規則。
- 競技場單次／連續規則。
- Rank 積分公式。

原始 `gameguide.js` 內仍可能保留舊「懸賞為單場」「普通／困難／極限競技場」文字，正式玩家說明會由 `gameguidearena5.js` 替換呈現。這是相容 presentation patch；若未來重構，可再把新文字直接併回 `gameguide.js` 後刪除此 patch。

---

## 13. 重要檔案載入與新檔

競技場/副本相關重要檔：
- `dungeonprogress.js`：副本進度、arena永久狀態正規化
- `dungeoncore.js`：副本 begin/finish run
- `dungeonbounty.js`：懸賞核心與連續流程
- `dungeonarena.js`：競技場 Rank、難度、晉升評估、正式戰鬥、連續流程
- `dungeonui.js`：副本主頁與懸賞基礎 UI/CSS 注入
- `dungeonplayerui.js` / `.css`：玩家競技場/懸賞 presentation layer
- `dungeongm.js`：原 GM 測試核心
- `gmhub.js`：GM hub
- `arenagm5.js`：Rank版競技場 GM 測試 UI + 模擬
- `gameguidearena5.js`：新版競技場/懸賞 guide presentation patch

修改上述 JS/CSS 要同步更新 `index.html` cache-bust。

---

## 14. 2026-09-12 競技場改版五批紀錄

### 第一批：核心 Rank / 數值 / 存檔
- arenaRank、promotionReady、signature欄位
- Rank受主線區域上限
- HP +5%/階、傷害 +1.5%/階、DEF +3%/階
- 暴閃與特性不隨 Rank
- Rank積分公式

### 第二批：晉升制度
- 高難500次完整三連戰
- 450/500門檻
- 手動晉升
- 戰力簽章與 stale
- 主線卡階

### 第三批：副本連續挑戰
- 懸賞單次/連續
- 競技場單次/連續
- 死亡/次數不足/手動停止
- 最終總結算

### 第四批：玩家 UI
- 新增 `dungeonplayerui.js/.css`
- 競技場 Rank/主線/晉升儀表板
- 玩家低中高難文字
- 連續模式狀態
- 懸賞移除精確戰前獎勵預覽
- 手機版整理

### 第五批：GM / guide / handoff
- 新增 `arenagm5.js`
- GM Rank1～10 + 100次 + 500次晉升測試
- 新增 `gameguidearena5.js`
- 副本/競技場說明更新
- 本 handoff 全面更新

---

## 15. 已知技術債與不要誤判的地方

1. `ui.js` 仍可能保留舊 1/5/10/15/20/25 battle-count unlock 基礎設定，但正式玩家戰鬥數由 `continuousbattle.js` runtime override 為單場/連續。不要宣稱所有舊 battle-count code 已刪。
2. `specialencounter.js` / `battlepipeline.js` 仍有舊 infinite 相容命名。
3. `dungeonarena.js` 內部 difficulty ids/names 仍是 normal/hard/extreme 與普通/困難/極限，正式玩家畫面由 `dungeonplayerui.js` 顯示低/中/高。
4. `dungeongm.js` 舊競技場100次函式仍存在，正式 GM Rank 版由 `arenagm5.js` 提供。
5. `gameguide.js` 舊副本文字可能仍存在，正式玩家 guide 由 `gameguidearena5.js` 替換呈現。
6. 第四、五批採 presentation enhancement layer，未複製正式怪物/戰鬥公式；所有敵人數值仍應以 `dungeonarena.js` / `buildArenaEnemyForTest()` 為準。

---

## 16. 驗證狀態

截至本次 handoff 更新：
- GitHub `main` 寫入與靜態程式回讀已完成。
- 五批改版均有 commit range 檢查。
- **尚未實際完成 GitHub Pages / 桌機瀏覽器 / iPhone Safari 的完整 runtime 驗證。**

下一個對話若要承接，第一步仍應：

> 讀 `PROJECT_HANDOFF.md`，再重新讀 `main` 的 `dungeonarena.js`、`dungeonbounty.js`、`dungeonplayerui.js`、`arenagm5.js`、`gameguidearena5.js` 與完整 `index.html`，以 `main` 為唯一真實來源。
