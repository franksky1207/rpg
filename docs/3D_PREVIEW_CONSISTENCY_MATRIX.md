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
| 冒險與宇宙地圖 | 銀河紀元星圖 | `galaxy` | `worldmapui.js;ui.js` | 1，後續回顧 | 區域/目標/解鎖/回顧 | 2 | 正式與 GM 狀態回讀仍需逐路由驗收 |
| 冒險與宇宙地圖 | 宇宙紀元星圖 | `universe` | `worldmapui.js;secondworldmainline.js` | 2，3 可回顧 | 100 Boss、選定區域/已擊敗/可挑戰/回顧 | 2 | 待核對／補修 |
| 冒險與宇宙地圖 | 高維紀元戰線 | `higher` | `thirdworldui.js` | 3 | 十存在、永久 HP、挑戰中/完成 | 2 | 待核對／補修 |
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
| 文明災厄與異宇宙 | 銀河文明災厄封印 | `frontier-galaxy` | `calamityui.js` | 1；後續正式回顧 | 十災厄逐隻解鎖/完成/印記 | 2 | 待核對／補修 |
| 文明災厄與異宇宙 | 宇宙文明災厄封印 | `frontier-universe` | `secondworldcalamityui.js` | 2；3 回顧 | 十災厄逐隻雙條件/文明等級/完成 | 2 | 待核對／補修 |
| 文明災厄與異宇宙 | 異宇宙前線 | `frontier-alternate` | `alternateuniverseui.js` | 3 正式解鎖後 | 200 宇宙×5 深度/20 體系/冷卻與鎖定 | 2 | 待核對／補修 |
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
| 2 | 三紀元地圖／災厄／異宇宙／回顧 | 待開始 |
| 3 | 副本與戰鬥 | 待開始 |
| 4 | 裝備、養成、記錄、服務與管理 | 待開始 |
| 5 | 31 預覽＋正式所有路由／特殊狀態的完整回歸 | 待開始 |

<!-- Unique GM preview rows: 31; categories: 8. -->
