# 《文明戰線》目前待辦狀態

更新日期：2026-09-27  
分支：`main`

> 本檔只記錄**真正尚未完成或刻意保留未定**的工作。若本檔、舊 handoff、舊對話或歷史文件與 current `main` 或較新的 `PROJECT_HANDOFF.md` 衝突，**一律以 current `main` 為準**；尚未實作但已確認的第三紀元設計，以最新 `PROJECT_HANDOFF.md` 為準。

## 目前狀態

銀河紀元與宇宙紀元目前均已進入「可完整實際遊玩／封版前體驗」階段。

第三紀元「高維紀元」目前已不是純設計階段：**foundation、Schema16、World Phase、persistent state、Lv1000～2000 等級 owner、十王 data／5pp／階段規則、第三紀元入場條件、部分 GM 測試基礎均已正式進入 current `main` runtime**；但正式高維戰鬥、永久削血結算、loot、offline、玩家 UI 等完整遊戲迴圈仍尚未完成。

已完成的重要正式項目包括：

- Integrity／CI 信任鏈與 owner 收斂。
- Future save fail-closed、Migration／Offline normalization整理。
- `SAVE_SCHEMA_VERSION = 16`，第三紀元 persistent state 已正式納入 save／migration。
- World Phase 已正式擴充為銀河／宇宙／高維三紀元。
- 第三紀元 Lv1000～2000 與固定 10,000,000 EXP／級 owner 已完成。
- 第三紀元十王 metadata、階段規則、5pp、總進度、稱號門檻 data owner 已完成。
- 第三紀元七項入場條件與 entry reconciliation 已完成。
- GM 測試角色已支援高維紀元 Lv1000～2000，既有戰力基準已接上 World Phase adapter。
- VIP 無上限正式改版：VIP20為特權畢業、VIP等級本身無上限。
- GM「主線鎖血」與正式呈現 owner 收斂。
- 虛空幻境 V2 線性公式。
- 銀河／宇宙地圖、災厄、戰線紀錄回顧。
- 雙紀元既有介面與遊戲說明語意整理。

使用者目前仍會親自從頭完整實玩銀河＋宇宙；後續優先處理實玩真正遇到的 bug、流程、UI、平衡與文案，不為了程式碼更漂亮而主動重寫穩定系統。

## 已取消／不得自動復活

除非使用者主動重新開啟，以下不再列 pending：

- Arena V2 額外500場驗收。
- 宇宙主線 `.015` 中後期平衡再驗證。
- Cloud Save 真實跨裝置驗證。
- VIP21+新增特殊特權。
- 第三紀元再新增災厄、懸賞、第二套／第三套貨幣、+41～+60、專精61+、印記11+、文明11+。

---

# 第三紀元「高維紀元」

第三紀元目前已完成正式 foundation 並進入 current `main` runtime／save；**不能再寫成「尚未實作到 runtime／save」**。

目前正式 runtime 基準包括：

- `SAVE_SCHEMA_VERSION = 16`。
- `worldphase.js` 已正式支援第三紀元。
- `thirdworldphase.js` 已正式負責 persistent shape、七項入場條件與 entry reconciliation。
- `thirdworlddata.js` 已正式負責十王 metadata、能力 descriptor、階段、5pp、總進度與高維稱號門檻。
- `levelprogression.js` 已正式負責第三紀元 Lv1000～2000 與固定 10,000,000 EXP／級。
- `civilizationcore.js` 已讓 World2／World3 共用文明最終傷害 owner。
- GM 測試角色與既有戰力基準已具備 World3 foundation／adapter。

完整已完成狀態、現行公式與後續施工順序，以最新 `PROJECT_HANDOFF.md` 為準。本檔只保留真正 pending／未定項目，不再把已完成 foundation 重列成待辦。

## 已確認，不得再誤列為 pending

以下均已定案；其中 foundation／data owner 部分已進 runtime，其餘仍依後述 pending 清單逐批實作：

- 正式名稱：**高維紀元**。
- 入場：Lv1000、宇宙主線完成、+40×5、文明Lv10、VIP≥20、8專精×60、10印記×10。
- 進入後銀河／宇宙永久只剩回顧；暗物質／暗能量清零並退出第三紀元正式介面。
- Lv1000→2000；每級固定1000萬EXP；Lv2000後EXP封頂，但十王進度／維度之弦／裝備仍可繼續。
- 十王各11億HP、總110億；死亡王退出5pp計算。
- 5pp合法開戰後即使本場跨線仍完整結算，下一場才鎖。
- 正式高維戰鬥取消單場，只保留連戰；單輪最多100死；停止連戰／重整後壓制死亡層數清零。
- 第三紀元死亡不掉裝、不需要贖回；VIP20本來就已防掉裝。
- 唯一新資源正式名：**維度之弦**。
- 唯一新養成正式名：**界弦核心**，Lv0～10；每級10億維度之弦；每級把每死壓制降低0.04pp。
- 1點正式永久淨削血 = 1 EXP = 1 維度之弦；汲取只能回本場損失，不能補歷史HP。
- 十王共同100%基準、90→10九次固定四圍強化、70→10七種追加能力均已定。
- 高維王不使用舊隨機trait pool；特殊怪／特殊遭遇第三紀元全部關閉。
- 十王正式名稱、概念與個體特化已定：
  - 破界天裁（高攻）
  - 永劫重垣（高防）
  - 宿因天秤（高暴）
  - 無相彼岸（高閃）
  - 萬象迴演（連擊）
  - 維隙之刃（穿透）
  - 逆因輪轉（反擊）
  - 噬界深淵（汲取）
  - 先驗之瞳（先制）
  - 高維原點（均衡）
- 第三紀元裝備公式沿用既有算法到Lv2000；只傳說／神話；+40封頂。
- 每場正式高維戰鬥100%至少掉1件；十王共用品質池：基礎傳說95%／神話5%；既有VIP14／16／18 Boss loot效果照常套用。
- 裝備清理／出售不產任何貨幣；第三紀元不建立新商店經濟。
- 高維裝備名稱依十王總剩餘HP分10套名稱池：1000%、900%……100%；能力公式不變，只有命名語意不同。
- 高維十稱號正式名稱與門檻已定：
  - ≤900% 破界初臨
  - ≤800% 維外行者
  - ≤700% 超界之軀
  - ≤600% 高維真形
  - ≤500% 萬維共鳴
  - ≤400% 界律共主
  - ≤300% 維序凌駕
  - ≤200% 超維至尊
  - ≤100% 諸維唯一
  - 0%／十王全滅 萬維之上
- 第三紀元UI原則：不創造新interaction paradigm，沿用既有紀元入口、冒險卡、收合說明、modal、強化頁與回顧分頁結構。
- 已擊破高維王保留在原卡回顧；回顧採滿HP的10%最終型態，無EXP／維度之弦／裝備／正式進度。
- 高維離線只用近期正式高維戰鬥sample，不分十王；只產裝備，不給EXP／維度之弦／王傷害；VIP loot照常套用。
- 玩家戰鬥速度最高仍1.5×；GM可既有2×。
- 懸賞第三紀元關閉；鏡像／虛空保留；不新增第三紀元文明災厄。
- GM測試方向已定：整合既有角色能力測試／戰力基準；可選高維紀元、Lv1000～2000、界弦核心、十王與100→10%階段，另可模擬100死連戰。
- GM管理方向已定：只調根資料（entered／completed、角色等級、維度之弦、界弦核心、十王HP與preset），派生狀態全部自動重算。
- 第三紀元 persistent state 已正式採 `thirdWorld`，只持久化 entered／completed、entryVersion、維度之弦、核心Lv、十王currentHp、story里程碑；王階段／能力／5pp／暫態連戰等不存。
- `savemigration.js` 只管 schema／load pipeline；第三紀元 persistent state 已正式採 Schema16。

## 目前真正尚未完成的第三紀元實作

以下才是 current `main` 真正尚未完成的 runtime／玩家流程：

- `thirdworldcombat.js` 正式高維戰鬥 core。
- Boss 端能力真正 combat execution。
- 正式永久削血 settlement。
- 維度之弦正式發放。
- World3 正式 EXP settlement。
- World3 正式 loot／drop。
- 100 死連戰。
- 界弦核心升級／死亡壓制 runtime。
- World3 正式 offline loot settlement。
- World3 玩家高維戰線 UI。
- 已死十王正式回顧模式。
- 高維稱號正式 grant 到 `playertitlecore.js`。
- 高維劇情 trigger framework。
- 十王全滅最終事件。
- 第三紀元競技場正式規則。
- 完整高維 GM benchmark／管理頁。

後續施工順序以最新 `PROJECT_HANDOFF.md` 第5～第10批規劃為準；不得因本檔舊文字把 data owner 誤認為正式 combat／settlement 已完成。

## 目前真正尚未定案的大項

以下屬「規格仍未定」，與上面的「已定但尚未實作」要分開：

1. **高維序章＋10段主劇情的具體文本／事件內容。**
2. **十王全滅後的最終通關事件／最終畫面，以及是否銜接低維輪迴／轉生。**
3. **第三紀元競技場的正式形式與數值曲線。**

## 實作階段才需要決定的細節

以下屬細節，不是大型系統 pending：

- 10套高維裝備的具體名稱。
- 第三紀元背景、美術、動畫、稱號視覺。
- UI微文案與排版微調。
- 十王實測後的數值微調。
- script load order、實際檔案拆分的最後調整。

## 實作限制

- 第三紀元 foundation 已是 current runtime；不得再宣稱整個第三紀元仍只有設計。
- 正式實作每一批前仍必須重新讀 current `main`、`PROJECT_HANDOFF.md` 與相關 canonical owner。
- 不得另造 duplicate save state、settlement、loot、offline、story、combat pipeline。
- 能共用第一／第二紀元 owner 的規則，優先共用，不建立平行第三套系統。
- 使用者說「先討論／先檢查／先不要修改」不可寫；使用者說「做／修改／執行／第N批」即可直接改 `main`。
- JS／CSS改動必須更新 `index.html` cache-bust；每批修改後重新讀main、compare base→head並執行對應Integrity。

---

# 目前真正 Pending 摘要

1. 使用者從頭完整實玩銀河＋宇宙，期間只處理實際問題。
2. 第三紀元 foundation／Schema16／World Phase／等級 owner／十王 data owner／入場條件／GM 基礎已進 current `main`，不得再列回 pending。
3. 第三紀元目前真正待實作的是：正式 combat → settlement／EXP／維度之弦 → 100死連戰／界弦核心 → loot／offline → 玩家 UI／回顧／稱號／劇情 trigger → 完整 GM 工具等後續批次。
4. 真正尚未定案的大項仍只有：高維具體劇情文本、十王全滅最終事件／是否轉生、第三紀元競技場正式規則。
