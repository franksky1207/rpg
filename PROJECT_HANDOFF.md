# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` 的實際程式碼永遠是唯一真實來源。**
>
> 本文件只作為跨對話承接層。若本文、歷史對話、記憶、舊規格或舊截圖與 `main` 衝突，一律以 `main` 為準。

更新日期：**2026-09-11**。

---

## 1. 專案基本資料

- Repository：`franksky1207/rpg`
- 正式分支：`main`
- 遊戲名稱：**文明戰線**
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY = "frank_text_rpg_save"`
- `SAVE_VERSION = 7`
- `MAX_LEVEL = 100`
- `VIP_MAX_LEVEL = 20`
- `SPECIALIZATION_MAX_LEVEL = 30`
- 正式世界：20 張地圖、Lv1～100
- 同時支援桌機與手機；iPhone Safari 是主要真機驗證環境之一

定位：**簡單、傳統、文字型 RPG**。

正式主要系統：主線、裝備、品質／詞條／評分、怪物特性、9 種特殊怪、懸賞／競技場／虛空三副本、VIP0～20、8 專精 Lv0～30、商店、遊戲說明、本機存檔匯出／匯入、GM 管理與測試。

目前不要主動加入職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入、每日系統等，除非使用者明確要求。

---

## 2. 修改規範

- 使用者說「做／修改／修正／執行／做吧」且需求已明確：可直接修改 `main`。
- 使用者說「先不要改／先討論／先建議／你覺得」：只分析，不得寫入。
- 每次修改前重新讀 `main` 相關檔案與 `index.html`。
- 優先直接修改正式來源，不另做第二套公式、第二套 UI、fallback、alias 或不必要 wrapper。
- `.js` / `.css` 修改後必須同步更新 `index.html` cache-bust。
- 修改後重新讀回所有修改檔與 `index.html`。
- GitHub 寫入成功不等於 Pages／Safari 已真機驗證；除非使用者回報，不可宣稱真機已測。

---

## 3. 正式 script 載入順序

```text
data.js
worldmaps-earth.js
worldmaps-solar.js
engine.js
specialization.js
combatcore.js
dungeonprogress.js
dungeoncore.js
gameguide.js
ui.js
vipui.js
settlementui.js
balance.js
traits.js
traitlock.js
traitdrop.js
gmtools.js
shopbalance.js
gearupgrade.js
specialmonsters.js
dungeonbounty.js
dungeonarena.js
dungeonvoid.js
dungeonvoidui.js
levelcap.js
specialcore.js
vipgm.js
specialgmbatch.js
dungeongm.js
gmhub.js
dungeonvoidgmmanage.js
dungeonvoidgmui.js
level100balance.js
specialencounter.js
battlepipeline.js
specialguide.js
levelcapresult.js
dungeonui.js
adventureprogressui.js
combatfx.js
```

目前重要 cache-bust：
- `engine.js?v=20260911-1745-stability12`
- `specialization.js?v=20260911-1745-stability12`
- `dungeonprogress.js?v=20260911-1745-stability12`
- `dungeoncore.js?v=20260911-1745-stability12`
- `gameguide.js?v=20260911-1645-voiduipolish`
- `ui.js?v=20260911-1605-uipolish1`
- `shopbalance.js?v=20260911-1620-shopcooldown`
- `dungeonbounty.js?v=20260911-1605-uipolish1`
- `dungeonarena.js?v=20260911-1605-uipolish1`
- `dungeonvoidui.js?v=20260911-1645-voiduipolish`
- `dungeonvoidgmui.js?v=20260911-1645-voiduipolish`
- `settlementui.js?v=20260911-1535-mainflow1`
- `specialencounter.js?v=20260911-1535-mainflow1`
- `battlepipeline.js?v=20260911-1535-mainflow1`
- `combatfx.js?v=20260911-1415-nobattlelog`

`gameguide.js` 必須在 `ui.js` 前；`combatfx.js` 維持最後，只做 presentation。

---

## 4. 主線與世界

每張地圖 5 級；固定 3 普通＋1 菁英＋1 Boss。

推進：普通1×10 → 普通2×10 → 普通3×10 → 菁英×10 → 達地圖最高等級 → Boss。

Boss：
- 固定單場。
- 首勝解鎖下一圖並免費刷新該新地圖商店。
- Boss 戰敗後鎖定，需再擊敗本圖菁英 10 次。

連戰：Lv1=1、Lv6=5、Lv11=10、Lv16=15、Lv21=20、Lv26+=25。

主線連戰中途死亡時，前面已取得的 EXP、金幣、裝備與副本進度都保留，結算會先顯示保留收益再顯示死亡懲罰。

主線正式怪物來源：`balance.js`。

---

## 5. 玩家、裝備、經濟

玩家基礎：
```js
baseHP(l)  = ceil(110 + 12*(l-1))
baseATK(l) = ceil(15 + 2.2*(l-1))
baseDEF(l) = ceil(7 + 1.2*(l-1))
```

裝備部位：weapon / helmet / armor / shoes / accessory。

品質：普通、優良、稀有、史詩、傳說、神話；神話不可自動出售。

裝備評分：
```js
rateWeight = 20 + 0.5*itemLevel
score = ATK*5 + DEF*5 + HP + crit*rateWeight + dodge*rateWeight
```

鑑價技巧實際售價統一走：
```js
specializationSellValue(item, useTestSpecializations=false)
```

Lv100：目前版本上限；不再累積 EXP，主線 EXP 由 `levelcap.js` 轉成金幣；特殊獎勵走 `specialExpPayout()`。

---

## 6. 怪物特性

7 種：強壯、兇猛、堅硬、迅捷、致命、狂暴、巨體。

正式來源：`traits.js -> applyMonsterTraits()`。

`traitlock.js` 固定主線預覽 traits，避免 re-render 洗特性。

---

## 7. VIP

VIP0～20：
```js
vipThreshold(n) = 1000 * n^2
```

每 VIP1：HP +0.5%、ATK +0.5%、DEF +0.25%、暴擊 +0.25 個百分點、閃避 +0.25 個百分點。

偶數特權：VIP2 掉裝率、4 副本進度、6 特殊怪率、8 弱部位、10 第二套特殊獎勵、12 更高副本進度、14 品質升級、16 Boss 額外裝、18 Boss 品質升級、20 死亡裝備保護。

---

## 8. 專精

8 項、Lv0～30，金幣永久升級，無失敗、無材料、無重置。

內部成本：`1000 * n^2`，玩家說明不公開公式。

目前正式包含：實戰訓練、搜刮、鑑價、先制、連擊、穿透、反擊、汲取。

**2026-09-11 穩定性修正：**專精升級加入短暫交易鎖與升級前後等級一致性檢查，快速連點不會連升兩級或重複扣金幣。

---

## 9. 共用戰鬥核心

正式：`runCombatCore(player, enemy, startHp, options)`。

核心已產出 structured `events`：attack / dodge / combo / counter / drain / berserk；但懸賞、競技場、虛空部分動畫仍解析 `logs`，因此底層 logs 暫不可刪。

玩家端持久戰鬥紀錄已完全取消；`combatfx.js` 只負責浮字 presentation。

---

## 10. 商店

刷新成本：100 → 200 → 400 → 800 → 1600 → 3200 → 6400 → 12800。

- 最高 12,800，可重置回 100，冷卻 1 小時。
- 冷卻基準是裝置 `Date.now()`；商店頁停留時會每秒更新倒數，時間到自動解鎖按鈕。
- 買一件商品刷新價格下降 1 級。
- 首次解鎖新地圖免費刷新。
- 每次刷新 3 件，不出神話。
- 放棄遺失裝備會先要求確認。

**2026-09-11 穩定性修正：**
- 商店只在第一次建立／舊版遷移時自動生成初始 3 件商品。
- 正常買光 3 件後會維持空商店，不再免費補貨；必須自己刷新。
- 重新整理頁面也不會因為商品為 0 件而免費補貨。
- 付費刷新、購買、贖回、刷新價格重置共用短暫交易鎖；快速連點不會造成第二次扣款／第二筆交易。
- `save()` 現在捕捉 `localStorage` 寫入失敗，不再讓例外直接中斷流程；頁首會顯示「存檔失敗」。

---

## 11. 副本共通與中斷安全

解鎖：懸賞 Lv5、競技場 Lv15、虛空 Lv25。

只有主線勝利增加副本進度；每 100 progress +1 挑戰次數。VIP4 / VIP12 提升進度。

正式 lifecycle：`dungeoncore.js`：
- `canStartDungeonRun(cost)`
- `beginDungeonRun({mode,cost})`
- `finishDungeonRun()`

**2026-09-11 正式中斷規則：**
- 真正開始副本時扣次數並寫入 `state.dungeon.activeRun` 持久 marker。
- 同一 runtime 已有 active run 時，`beginDungeonRun()` 會拒絕再次開始，避免快速連點重複扣次數。
- 正常結束時 `finishDungeonRun()` 清掉 runtime 與 persisted marker。
- 若頁面重新整理／瀏覽器意外中斷，下一次 `load()` 發現殘留 marker，視為「上次副本已放棄」。
- **已扣的副本次數不退還**，但角色 HP 回滿並清除殘留 marker，避免半套副本狀態留在存檔。

---

## 12. 懸賞戰

單場；ready 不扣次數，真正開始才扣 1 次。

普通／高級／危險積分：80 / 120 / 180。

玩家端戰鬥畫面已移除重複難度標籤，只保留上方難度資訊。

---

## 13. 競技場

流程：選難度 → 確認頁 → 開始三戰 → 自動第一／第二／第三戰 → 一次結算；任一戰敗立即停。

積分：
- 普通 `[25,35,120]` = 180
- 困難 `[35,45,200]` = 280
- 極限 `[40,60,320]` = 420

三戰不回血；每名新敵人重新取得先制機會；開始時鎖玩家與敵人 scaling snapshot。

UI 已移除 ready 頁無意義的目前 HP；「三戰不回血」只在開始前確認頁提醒。

---

## 14. 虛空幻境

正式：`dungeonvoid.js` + `dungeonvoidui.js`。

- 從下一個尚未通過的樓層繼續。
- 第一層真正開打才扣 1 次。
- 整趟鎖玩家 snapshot；每層開始前滿血。
- 一般層 1 trait；每 10 層 Boss、2 traits。
- 同一樓層正常流程不重打；每突破一層取得該層 VIP 積分。
- 可要求本層結束後退出。

玩家 UI 現在只保留：目前樓層、本次突破、本次 VIP 積分；移除最高通過、平均每層 VIP、平均回合等 GM／分析型資訊。

玩家可見文字不再使用「首通」概念；內部 `firstClearPoints` / `highestCleared` 等名稱為程式資料，不為了字面重構。

---

## 15. 特殊怪

基礎遭遇率 8%，VIP6 後 10%。

只在**主線勝利完成後**檢查；Boss 不觸發；玩家不可高主線怪 10 級以上；戰後 HP 至少 30%；觸發時中止尚未完成的連戰，可挑戰或略過。

9 種特殊怪維持正式設定；定位是額外驚喜，不因 VIP／專精再刻意補強。

---

## 16. 遊戲說明與資訊層級

首頁順序：冒險｜角色｜專精｜副本｜背包｜商店｜遊戲說明｜設定。

首頁 VIP／副本進度放在主功能入口前是刻意設計，用來提高成長動力，不視為 UI 問題。

近期資訊瘦身：
- 競技場 ready 去除目前 HP；三戰不回血只提醒一次。
- 懸賞戰去除敵人卡重複難度標籤。
- 背包品質圖例同頁只顯示一次。
- 商店常駐只提醒最高 12,800／1 小時冷卻與「購買裝備可降低刷新價格」；完整規則移到遊戲說明。
- 虛空移除重複樓層、重複 HP、平均資料與玩家端「首通」文字。

---

## 17. 本機存檔安全

`ui.js` 正式包含：`normalizeSaveItem()`、`normalizeSaveState()`、`normalizeCurrentSaveState()`、`isImportableSave()`。

匯入：
- JSON 必須是物件。
- `level` 必須有效且 >=1。
- 必須有正式存檔識別欄位之一。
- 覆蓋前一定 confirm。
- 確認後 normalize、存入、reload。

`engine.js` 的世界 normalize 現在也會限制負值／異常的主線進度與 Boss 進度；`normalizeHP()` 同時限制 HP 不低於 0、不高於目前最大 HP。

不支援登入、雲端同步或跨裝置自動同步。

---

## 18. 邊界／快速操作稽核（2026-09-11）

已確認或加固：
- 0 副本次數：三種副本都不會開始或扣成負數。
- 副本開始快速連點：由 `dungeoncore` active run guard 阻擋第二次扣次數。
- 商店快速連點：刷新／購買／贖回／重置不會執行第二次交易。
- 專精快速連點：不會連升兩級。
- 商店 0 商品：維持空狀態，不免費再生；付費刷新後恢復 3 件。
- 空背包：原 UI 已有安全空狀態，不會執行不存在物品。
- 遺失裝備：不存在索引會安全返回；永久放棄仍需 confirm。
- Boss 鎖定：`fightOnce()` 與 `enemyUnlocked()` 都會擋住非法挑戰。
- Lv100：EXP 不會繼續累積，正式轉換規則維持。
- 特殊怪連戰最後一場：仍會在該場勝利後正常檢查，不會因 `remaining=0` 漏掉。
- 舊／缺欄位存檔：由 load + UI normalize 補安全值；異常負值被限制。
- `localStorage` 寫入失敗：不再直接拋例外打斷遊戲。

仍屬純前端不可完全防止：
- 玩家手動修改 localStorage／匯出 JSON。
- 修改裝置時間可以影響商店 1 小時冷卻，除非未來改成伺服器可信時間。

---

## 19. GM 與測試

設定頁連點標題 3 次後輸入 GM 密碼。

正式測試：特殊怪、地圖怪、懸賞戰、競技場、虛空幻境。

runtime 測試 VIP／專精不應污染正式 state。

---

## 20. 平衡哲學

```text
主線 = 成長、刷資源、刷裝備
特殊怪 = 額外驚喜／禮物
副本 = 挑戰
```

不要因 VIP／專精自動補強主線或特殊怪；懸賞／競技場若未來被壓平，優先新增更高難度，不回頭膨脹舊三檔；虛空無限爬高即可自然承接角色變強。

---

## 21. 未來可考慮但目前不要主動做

- Lv101+ 世界。
- 雲端跨裝置存檔。
- 將所有戰鬥動畫由文字 logs regex 完整遷移到 structured events。
- 把部分 JS 動態注入 CSS 搬回正式 CSS。
- 整理部分後載入 render/go wrapper；沒有實際問題前不要為了漂亮大重構。

---

## 22. 回歸驗證重點

主線：推進、Boss 鎖定／解鎖、連戰收益、特殊遭遇勝利後觸發。

副本：ready 不誤扣、真正開始只扣一次、重新整理中斷後不退次數但回滿 HP、active marker 被清掉。

商店：初始 3 件、買光後不自動補貨、刷新才重生 3 件、快速連點只交易一次、12,800 重置倒數到點自動解鎖。

專精：一次確認只升一級、快速雙擊不連升、金幣不足不扣款。

存檔：正常／舊版／缺欄位／負值／無效匯入／取消覆蓋；localStorage 寫入失敗時 UI 顯示失敗而非程式中斷。

GM：五種測試不污染正式資料。

---

## 23. 下一對話接手指令

> 先讀 `PROJECT_HANDOFF.md`，但 GitHub `main` 實際程式碼才是唯一真實來源。重新讀 `index.html` 確認正式載入順序與 cache-bust，再讀本次需求涉及的正式檔案。修改後重新讀所有修改檔與 `index.html`；JS/CSS 修改必須 bump cache。不要因舊聊天或交接內容直接假設現況。