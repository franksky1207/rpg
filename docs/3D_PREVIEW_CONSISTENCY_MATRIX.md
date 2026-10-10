## 2026-10-10｜補修第 3 批加強：正式戰鬥呈現 owner 接入（本輪最新）

- 不沿用過去從 DOM 寬度猜 HP/護盾的 3D 正式預覽：現在 `3d-test/formal-home.js` 優先讀取 `combatfx.js` 的 `getCombatPresentationSnapshot()`（active 時包含玩家／敵人 HP、maxHP、護盾），無進行中快照時不建立虛構的戰鬥場景。**注意**：這個 owner 提供進行中的戰鬥呈現資料，並不等於所有副本結果／特殊遭遇都已有完整正式結算 schema。
- GM 四個戰鬥視覺預覽（戰場／護盾／特殊遭遇／結算）沿用第 2 批「同步正式／自由測試」資料來源。正式模式只用原本 GM 同源授權 iframe 回傳的活躍戰鬥快照，若缺快照只提示、不得把自由測試的預設戰鬥值當成同步；自由模式繼續以選擇四個場景作為視覺切換，**不新增 HP 等細節調整**。
- 五副本正式資料取 `dungeonModeAvailability()` 統一政策決定可見及可用性，**W3 懸賞戰不可用且不以 W2 快照頂替**。高維競技場優先讀正式 runtime 的 `mode`（定相／異相）、stage；GM 自由模式仍可直接看兩類三戰。歷史最高鏡像勝數、虛空樓層及競技場/懸賞基本狀態以各自 owner 同步。
- 本輪已更新 JavaScript、GM 瀏覽器測試源碼、相關 HTML 快取參數及交接矩陣。**自我檢查僅是最新 main 的 JS 靜態語法、引用與程式碼審查；尚未實際執行 Chromium/授權 GM iframe/手機/長期 GPU 或 exact-HEAD Actions**。剩餘事項：逐項驗證各戰鬥模式的 owner 是否會保留結果/特殊遭遇快照，補上必要的 result/encounter 實際 schema，而非使用 DOM 假值。

## 2026-10-10｜3D 五批一致性補修第 3 批・副本與戰鬥資料（施工紀錄）

- **沿用第 2 批概念**：GM 預覽以看圖為主。原 31 案例與八分類維持不變；副本中心、懸賞、競技場、鏡像、虛空五個 GM 視覺場景納入「同步正式資料／自由測試設定」。從正式遊戲 GM iframe 開啟預設同步；未拿到正式唯讀快照不得用 GM 模擬資料冒充同步成功。自由模式仍使用既有「類型、階級/難度、定相/異相/三戰、勝場、樓層」等與畫面身份直接有關的選項，**不增加 HP、倍率、獎勵等數值測試操作**。
- **唯讀正式資料**：在 `gm3dprototype.js` 原有同源／iframe source／GM 授權 gate 下回傳正式 `getArenaCoreState`、`getBountyTestSnapshot`、`mirrorDungeonStatus`、`getVoidMirageProgressSnapshot/getVoidMirageRunSnapshot` 與 `dungeonModeAvailability` 的摘要。高維正式角色不能以宇宙懸賞冒充可用；懸賞的高維下拉選項仍完全移除。原正式數值、戰鬥與存檔 schema 未修改。
- **正式 3D 補修**：`3d-test/formal-home.js` 的高維競技場 advanced 快照補入 `higherArenaMode`（從 runtime round/selectedMode 讀取，無來源時 fallback fixed）；沒有戰鬥／結算／特殊遭遇畫面時，戰鬥快照回傳 `battleAvailable:false`、`battleVisualKind:unavailable`，不再憑空展示「滿 HP 正常戰鬥」。既有戰鬥 HP 等其他頁面元素仍屬過渡 DOM 推斷，**不是已完成正式戰鬥 owner 的完整 read-only schema**。
- **自我檢查與後續**：`tests/runtime/gm-3d-test-center-browser.js` 新增五個副本模式來源切換相關斷言，相關入口 JS 快取版本同步更新；未執行真實 Chromium、正式授權 iframe 及手機 WebGL，不能宣稱通過完整第 3 批實機 gate。後續仍須逐種模式比對正式狀態與戰鬥 owner HUD/護盾/結算可靠快照；特別是高維定相/異相模式欄位應以真實 runtime 證據驗收，未知資料不能猜。

## 2026-10-10｜補修第 2 批 GM 災厄視覺控制精簡（最新有效）

- 銀河／宇宙災厄 GM **自由測試**只保留「選擇第 N 隻文明災厄（1～10）」及「模擬狀況」兩個操作欄位；已移除 HP%、成長等級、全部封印預設情境。
- 選第 N 隻自動推算：**1～N-1 視覺已完成、第 N 隻使用模擬狀況、N+1～10 尚未解鎖／未現身**。不保存逐隻任意狀態以免違反循序推進；銀河和宇宙各自保留目前選定 N 與模擬狀況。宇宙多「已現身但不可挑戰」狀態。
- 「同步正式資料」仍使用遊戲原正式狀態，**不套用 GM 自由模式的前後自動完成假設**；GM fixture 不寫入正式角色、存檔或戰鬥。
- 已更新 `3d-test/test-center.js`、`3d-test/index.html` cache-bust 及 `tests/runtime/gm-3d-test-center-browser.js` 的十封印序列和舊欄位消失斷言。靜態語法及 main 回讀可驗；真實 Chromium/手機/WebGL 仍待驗收。

## 2026-10-10｜補修第 2 批再次施工狀態

- 六項適用預覽（銀河／宇宙／高維地圖、銀河／宇宙災厄、異宇宙）支援正式同步／自由測試雙模式；正式同步只經已授權 GM iframe，同源 read-only 資料，不會寫入角色存檔。
- GM 十災厄可逐隻設定狀態、HP 百分比及相應印記／文明進度；異宇宙可設定可挑戰／進行中／鎖定／已通關，正式同步取既有進度與限制。宇宙星圖正式焦點優先讀取 `worldmapui.js` 展開區域；無值才退回正式進度。
- 上述為程式碼施工狀態，**沒有確認真實 GM iframe／手機/WebGL/CI 已全部通過**。若來源仍缺少特定紀元歷史戰鬥所需欄位，應保留待核對，不得用 GM fixture 誤認正式資料。

# 《文明戰線》正式 3D／GM 3D 預覽一致性矩陣

> 基準：2026-10-10 GitHub `main`。本文件列出 31 項唯一預覽與主要正式 owner；屬**靜態來源對照與補修待辦**，不是 31 項已經通過實機驗收。每批執行前必須 fresh-read main。

## 使用規範

- 正式 3D 必須唯讀取正式 owner；GM 3D 使用隔離 session fixture。錯誤/空資料/鎖定/通關/回顧，必須依正式功能種類決定，不可套用其他頁面進度。
- 狀態欄「待核對／補修」不能誤當成功；請在補修 2～5 批回填真實測試紀錄、必要時修訂檔名與規則。
- 高維紀元沒有懸賞戰，懸賞的 GM 紀元下拉完全不顯示高維 option。競技場保留三紀元但各紀元模式不同。

## 全部預覽逐項對照

| 分類 | GM 預覽 | 場景 kind | 正式主要資料來源 | 可見紀元／範圍 | 關鍵狀態及驗收 | 補修批 | 狀態 |
|---|---|---|---|---|---|---|---|
| 主畫面與紀元場景 | 三紀元主畫面 | `epoch` | `worldphaseui.js;ui.js` | 1/2/3 | 紀元入口/轉生條件/顯示紀元 | 4 | 待核對／補修 |
| 冒險與宇宙地圖 | 銀河紀元星圖 | `galaxy` | `worldmapui.js;ui.js` | 1，後續回顧 | 區域/目標/解鎖/回顧 | 2 | 雙模式/唯讀來源已施工；瀏覽器實測待驗 |
| 冒險與宇宙地圖 | 宇宙紀元星圖 | `universe` | `worldmapui.js;secondworldmainline.js` | 2，3 可回顧 | 100 Boss、選定區域/已擊敗/可挑戰/回顧 | 2 | 雙模式/唯讀來源已施工；瀏覽器實測待驗 |
| 冒險與宇宙地圖 | 高維紀元戰線 | `higher` | `thirdworldui.js` | 3 | 十存在、永久 HP、挑戰中/完成 | 2 | 雙模式/唯讀來源已施工；瀏覽器實測待驗 |
| 玩家、裝備與養成 | 角色全身展示 | `character` | `ui.js;playersemanticsui.js;3d-test/appearance-snapshot.js` | 依已進入紀元 | 正式角色、稱號/突破、五槽穿戴 | 4 | 待核對／補修 |
| 玩家、裝備與養成 | 五槽裝備陳列 | `equipment` | `ui.js;inventoryfocus.js;3d-test/appearance-snapshot.js` | 1/2/3 | 裝備世界/品質/穿戴/背包/鎖定 | 4 | 待核對／補修 |
| 玩家、裝備與養成 | 強化鍛造台 | `forge` | `enhancementui.js;enhancementcore.js` | 依正式強化規則 | 五裝備強化/上限/不可交易預覽 | 4 | 待核對／補修 |
| 玩家、裝備與養成 | 八種專精星環 | `specialization` | `specialization.js` | 按正式可見頁 | 八專精各級數/上限 | 4 | 待核對／補修 |
| 玩家、裝備與養成 | 十印記星環 | `marks` | `calamityui.js` | 第一紀元與相應回顧 | 十印記等級與效果狀態 | 4 | 待核對／補修 |
| 玩家、裝備與養成 | 文明等級核心 | `civilization` | `secondworldcalamityui.js` | 第二紀元與正式可見回顧 | 文明等級/災厄來源 | 4 | 待核對／補修 |
| 玩家、裝備與養成 | 界弦核心 | `core` | `thirdworldui.js` | 3 | 核心等級/注入確認/可見性 | 4 | 待核對／補修 |
| 戰鬥、動畫與特效 | 戰場與生命顯示 | `battle-battle` | `combatfx.js;各正式戰鬥 owner` | 按正式戰鬥模式 | HP/目標/戰鬥事件/不干擾 Fast Catch-up | 3 | 待核對／補修 |
| 戰鬥、動畫與特效 | 護盾防護演出 | `battle-shield` | `combatfx.js;各正式戰鬥 owner` | 按正式護盾可用狀態 | 護盾有無/實際護盾量/HP | 3 | 待核對／補修 |
| 戰鬥、動畫與特效 | 特殊遭遇演出 | `battle-encounter` | `specialencounter.js` | 正式特殊遭遇可見時 | 特殊遭遇類型/開始/關閉 | 3 | 待核對／補修 |
| 戰鬥、動畫與特效 | 結算與戰利品 | `battle-settlement` | `settlementui.js;各結算 owner` | 按正式結算模式 | 勝負/獎勵/贖回/離線樣本安全 | 3 | 待核對／補修 |
| 副本與競技場 | 副本作戰中心 | `dungeon-hub` | `dungeonui.js;thirdworlddungeonui.js` | 1/2/3 | 可見/可進入/次數/高維無懸賞 | 3 | 待核對／補修 |
| 副本與競技場 | 懸賞戰準備區 | `dungeon-bounty` | `dungeonbounty.js;thirdworlddungeonui.js` | 1/2；3 必須無選項 | 普通/高級/危險/每日次數 | 1+3 | 分類/下拉已補；其餘待驗收 |
| 副本與競技場 | 競技場 | `dungeon-arena` | `dungeonarena.js;thirdworldarenaui.js` | 1/2/3 | 1/2 階級/位置；3 定相/異相/三戰 | 1+3 | 分類/下拉已補；其餘待驗收 |
| 副本與競技場 | 鏡像戰紀錄 | `advanced-mirror` | `mirrordungeonui.js` | 正式解鎖後跨紀元 | 0～20 勝/當日挑戰/歷史紀錄 | 3 | 待核對／補修 |
| 副本與競技場 | 虛空幻境樓層 | `advanced-void` | `dungeonvoidui.js` | 跨紀元承接 | 無限樓層/目前/歷史/每日結算 | 3 | 待核對／補修 |
| 文明災厄與異宇宙 | 銀河文明災厄封印 | `frontier-galaxy` | `calamityui.js` | 1；後續正式回顧 | 十災厄逐隻解鎖/完成/印記 | 2 | 雙模式/唯讀來源已施工；瀏覽器實測待驗 |
| 文明災厄與異宇宙 | 宇宙文明災厄封印 | `frontier-universe` | `secondworldcalamityui.js` | 2；3 回顧 | 十災厄逐隻雙條件/文明等級/完成 | 2 | 雙模式/唯讀來源已施工；瀏覽器實測待驗 |
| 文明災厄與異宇宙 | 異宇宙前線 | `frontier-alternate` | `alternateuniverseui.js` | 3 正式解鎖後 | 200 宇宙×5 深度/20 體系/冷卻與鎖定 | 2 | 雙模式/唯讀來源已施工；瀏覽器實測待驗 |
| 文明紀錄與轉生 | 文明戰線紀錄 | `chronicle-record` | `storyrecordtabs.js;ui.js` | 依正式紀元/回顧 | 紀元分類/可回顧歷史/空記錄 | 4 | 待核對／補修 |
| 文明紀錄與轉生 | 文明劇情閱讀 | `chronicle-story` | `storyui.js` | 按劇情解鎖 | 劇情內容/播放/中斷/空資料 | 4 | 待核對／補修 |
| 文明紀錄與轉生 | 文明轉生 | `chronicle-reincarnation` | `reincarnationui.js;worldphaseui.js` | 符合正式轉生入口 | 進入條件/不可逆確認/完成/回顧 | 4 | 待核對／補修 |
| 設定與管理 | 設定中心 | `service-settings` | `ui.js` | 登入後可用設定 | 模式/速度/設定原 owner | 4 | 待核對／補修 |
| 設定與管理 | 遊戲說明 | `service-guide` | `gameguide.js` | 正式可見時 | 說明與教學/版本 | 4 | 待核對／補修 |
| 設定與管理 | 帳號中心 | `service-account` | `supabaseauth.js` | 正式帳號狀態 | 登入/登出/錯誤/權限 | 4 | 待核對／補修 |
| 設定與管理 | 雲端存檔中心 | `service-cloud` | `cloudsave.js` | 正式帳號權限 | 雲端/本機/衝突/安全回退 | 4 | 待核對／補修 |
| 設定與管理 | GM 管理中心 | `service-gm` | `gmhub.js;gmhubextensions.js` | 僅 GM 授權 | 唯讀視覺/正式操作保留權限 | 4 | 待核對／補修 |

## 五批完成紀錄

| 批次 | 修正與測試 | 狀態 |
|---|---|---|
| 1 | 八類 31 項；懸賞高維 option 不存在；完善施工規格與矩陣 | 程式與文件已施工；實機及 CI 待驗收 |
| 2 | GM 正式同步與自由模擬；十災厄獨立狀態、宇宙區域展開焦點、異宇宙狀態 | 程式施工完成；授權 GM iframe／各進度存檔／手機及 CI 實測待驗 |
| 3 | GM 五副本雙來源及高維競技場模式已施工；正式完整戰鬥 owner 快照未完成 | 程式部分完成；實機/CI 待驗收 |
| 4 | 裝備、養成、記錄、服務與管理 | 待開始 |
| 5 | 31 預覽＋正式所有路由／特殊狀態的完整回歸 | 待開始 |

<!-- Unique GM preview rows: 31; categories: 8. -->
