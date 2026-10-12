# T2-A｜A/B/C共用 T2-B／T2-C 驗收矩陣

所有項目目前是**待T2-B原型／T2-C量測**，checkbox不是已通過。資料與相同條件定義見[比較規格](3D_HYBRID_T2A_COMPARISON_SPEC_2026-10-12.md)、[fixture契約](3D_HYBRID_T2A_FIXTURE_CONTRACT_2026-10-12.md)及[controls](../development/hybrid-comparison/t2a-v1/comparison-controls.json)。每次驗收記scheme、case/controls/assetSHA、variant、硬體／DPR、冷熱cache、證據及實際結果；不存在的素材／API記not-ready/unavailable，不能填0。

「同條件」下的D/M表示桌機／手機皆適用；實機欄「是」需真硬體，頭less／SwiftShader不能取代。量測Gate先要求可靠資料與共同條件，數值預算是提案而非A/B/C預設勝負。

## 硬性Gate（任何方案失敗先修，不能用畫質抵銷）

| 勾選／測試名稱 | 資料來源 | A/B/C同條件 | 方法／D/M | 通過標準 | 失敗修正策略 | 實機 |
|---|---|---|---|---|---|---|
| [ ] H01 State唯讀 | owner-fixtures/core原結果 | 同case+SHA | 自動／D/M | State、來源event及computed前後byte不變，無交易／儲存寫入 | 修掉consumer寫入，回到fixture輸入 | 否 |
| [ ] H02 事件公平 | event.seq/eventId/caseSHA | 同episode、同appearance | 自動／D/M | A/B/C收到相同序列、數值、HP盾與勝負 | 修輸入／cachekey，不重算core | 否 |
| [ ] H03 partial真實 | capture/Bridge dropped | 256/32原限制 | 自動／D/M | omitted/drop有標記、未知HP不造历史、incomplete不叫敗北 | 降為snapshot-only，換小fixture | 否 |
| [ ] H04 舊場次晚到 | 原source ID＋playback generation | 快速case/scheme切換100次 | 自動／D/M | stale async不掛scene／不播音；取消後回零 | 補token與dispose所有權 | 否 |
| [ ] H05 consumer異常 | throw/reject/never-resolve | 同故障consumer | 自動／D/M | 無正式計算等待，有限隊列，其他consumer可用 | 隔離錯誤／不await Renderer | 否 |
| [ ] H06 背景恢復 | current checkpoint | 同背景時長／次數 | 自動＋人工／D/M | 不補播過期action／音效，顯當前狀態 | 清backlog／重新快照 | 是 |
| [ ] H07 音訊唯一 | 原CivilizationAudio | 基本比較全靜音 | 自動＋聆聽／D/M | Bridge/replay零音訊；授權聲音測試單voice、無結算雙播 | 取消非正式audio來源 | 是 |
| [ ] H08 GM／帳號隔離 | 原GM gate／同源iframe | 同隔離帳號/fixture | 自動／D/M | 錯origin／iframe／未授權拒絕，不傳完整State | 沿用既有GM授權channel | 否 |
| [ ] H09 原UI與safe area | 原HUD/button矩形 | 同viewport／orientation | browser＋人工／D/M | 按鈕、彈窗、捲動／返回正常，文字／極簡正常 | 重排canvas可用區，保留原DOM | 是 |
| [ ] H10 WebGL降級 | 原Runtime故障契約 | B/C contextloss；A對應素材失敗 | 自動＋人工／D/M | 清楚故障並可回文字／重開，不假裝場景已復原 | dispose後重建，逐資產合法fallback | 是 |
| [ ] H11 五槽身份 | G00732subsets＋mixed | 同variant／LOD／名稱 | 自動＋人工／D/M | 穿卸、空槽、混穿不串件；缺模型標fallback | 修resolver／覆蓋遮蔽／分層 | 是 |
| [ ] H12 computed/committed | outcome／settlement欄 | 同無transaction fixture | 自動／D/M | 只示計算結果、不發掉落／收益；無假結算 | 分離result與committed欄 | 否 |

## 量測Gate（數據真實、可重現、可比較）

| 勾選／測試名稱 | 資料來源 | A/B/C同條件 | 方法／D/M | 通過標準 | 失敗修正策略 | 實機 |
|---|---|---|---|---|---|---|
| [ ] M01 首次／再次載入 | performance marks＋HTTP | 冷profile/同tab熱/重整熱分開，10次 | 自動／D/M | 每次entry/ready有raw evidence、同硬體網路；尚無虛構ms達標 | 區分download/parse/upload，先補資料 | 是 |
| [ ] M02 FPS／frame time | raw rAF timestamps | 同display刷新/DPR、3暖機10量測 | 自動／D/M | count/elapsed/p50/p95/p99/>50ms一致算法；記未達60/30提案，不直接判優勝 | 降同品質budget後重比三方案 | 是 |
| [ ] M03 CPU／GPU | profiler／可靠系統工具 | 同episode／同錄製開銷 | profiling／D/M | 有工具/方法/trace或unavailable；不能拿GPU estimate當實測 | 補工具與采樣說明 | 是 |
| [ ] M04 JS heap | browser memory API/CDP | 同GC觀察策略、非強制清玩家 | 自動／D/M | proxy範圍明示，100次曲線有界，不當全程序值 | 找listener/cache常駐與未dispose | 是 |
| [ ] M05 紋理／GPU記憶體 | runtime count＋可靠工具 | 同解析度／品質／素材 | 自動＋profiling／D/M | bytes只在可可靠量測時observed，公式另estimate | 補decoded尺寸／格式／mip，減atlas/pages | 是 |
| [ ] M06 下載成本 | Resource Timing/HTTP/CDP | 同network throttle/cachephase | 自動／D/M | file/transfer/encoded/decoded區分、有SHA與失敗請求；不漏lazy素材 | 納入動態resource台帳，修發布閉包 | 是 |
| [ ] M07 B圖集負擔 | image decode marks／atlas metadata | B與其他同screen/動作數 | 自動／D/M | 解碼／upload proxy／frame切換皆有證據；非B記not-applicable | 分pages、padding/mip與壓縮後重比 | 是 |
| [ ] M08 C與玩家GLB負擔 | load/parse/animation/shader traces | B/C同玩家LOD，A同可見輪廓 | 自動＋profiling／D/M | fetch/parse/動畫／shadow分項，非GLB記not-applicable | 共用loader，減骨架／材質／陰影品質 | 是 |
| [ ] M09 資源回收 | scene/container/texture counters | 100開關／換裝／切scheme | 自動／D/M | owned resource回基線、共享CPUcache有界；無舊canvas | 清訂閱／GPUcontainer所有權 | 是 |
| [ ] M10 30分鐘連戰 | raw周期曲線／溫度／崩潰紀錄 | 相同循環／電源／網路 | 自動＋實機／D/M | 無跨場／崩潰／無界成長，溫度與掉幀實記 | 減共用品質budget，修leak後再長測 | 是 |
| [ ] M11 前景／橫直恢復 | lifecycle marks | 同背景間隔／orientation序列 | 自動＋實機／D/M | current-state不舊動作；恢復ms實記 | 清backlog、resize、再啟session | 是 |
| [ ] M12 低效能降級 | tier/故障案例 | 同low/medium/high+text條件 | 自動＋人工／D/M | 正式結果與UI不變，tier缺素材不假合格 | 安全文字/原幾何回退，不補算傷害 | 是 |

## 美術Gate（同素材完成度、盲評、不能用沒有事件來扣分）

每項1～5分：1=無法辨識/明顯破綻、3=基本可讀但可改善、5=清楚自然且無明顯問題。至少兩位評分者、匿名方案順序、相同片段與frame；記各人分數與文字理由，不先平均成選型結論。缺素材記not-ready而非0。事件不包含某效果時，另用標示純視覺示範，不能偽稱正式效果。

| 勾選／測試名稱 | 資料來源 | A/B/C同條件 | 方法／D/M | 通過標準 | 修正策略 | 實機 |
|---|---|---|---|---|---|---|
| [ ] V01 立體感／人物與背景融合 | 三代表同稿／鏡頭 | 同光照／地面影／視差 | 盲評／D/M | 至少3分且人物落地、不飄浮；記不足 | 修投影／陰影／接地，不加敵人數值 | 是 |
| [ ] V02 五槽／武器辨識 | 33 variants/G007名冊 | 同動作／大小／LOD | 盲評＋穿卸／D/M | 能辨五槽變化、頭盔不露臉、空槽恢復 | 分層與遮蔽／剛體掛點調整 | 是 |
| [ ] V03 普通／菁英／Boss差異 | 三正式代表 | 同背景、同曝光 | 盲評／D/M | 名字／輪廓／量體可區分，不靠換名字假差異 | 同源美術強化silhouette | 是 |
| [ ] V04 重量感／流暢／非兩圖碰撞 | known actions＋另visual-script | 同節奏／位移上限 | 盲評／D/M | 至少3分，有準備/命中/回位pose，無滑動圖卡感 | 補原創clip/層動畫；idle不能冒充attack | 是 |
| [ ] V05 命中／暴擊／閃避／反擊／連擊 | raw flags或示範channel | 同具體event與cue | 盲評／D/M | 正式已知者與示範清楚分別，可辨動作／受擊 | 修cue、節奏／遮挡；不猜crit | 是 |
| [ ] V06 Boss壓迫／特殊演出 | boss-baseline／safeUV | 同尺度上限／安全區 | 盲評／D/M | 至少3分且不蓋HUD、超體型可讀 | 改構圖／縮比或另同場特寫case | 是 |
| [ ] V07 名稱／血盾／狀態／傷害字 | exact owner names/known values | 同字體16px＋對比4.5:1 | 自動＋盲評／D/M | 小手機也清楚，未知盾/HP不造數字 | 改文字層與位置，保留unknown標示 | 是 |
| [ ] V08 聲畫同步可行性 | impact cue timestamps／原音訊路徑 | 基本全靜音；另授權同一clip | 時間trace＋聆聽／D/M | cue可對齊且不雙播；未授權只記可行性待驗 | 改視覺cue，不新建音訊播放器 | 是 |

## 維護Gate

| 勾選／測試名稱 | 資料來源 | A/B/C同條件 | 方法／D/M | 通過標準 | 修正策略 | 實機 |
|---|---|---|---|---|---|---|
| [ ] K01 源稿／發布容量 | .blend/atlas/GLB inventory | 同3敵＋玩家五槽／動作要求 | 自動／D/M | source/publish分開實測bytes，所有lazy closure／SHA完整 | 補manifest/registry與動態引用測試 | 否 |
| [ ] K02 每敵人製作工作量 | 工時log／返工記錄 | 同3敵動作／質量完成度 | 人工／D/M | 實際小时可追溯，未做=not-run | 補time log、不填假估值 | 否 |
| [ ] K03 210套/1050槽擴充 | 正式名稱映射／層或掛點需求 | 同獨立穿卸／混穿／空槽 | 設计review／D/M | 清楚列動作/視角乘數、遮擋/體型成本及假設 | 不用整套合成圖迴避五槽，縮原型範圍不縮需求 | 否 |
| [ ] K04 新敵人／特殊Boss維護 | 同源模版／相机可調參數 | 同新體型case | 人工review／D/M | 模板、姿態、尺度、atlas重製／實時動畫變更可查 | 補特殊體型case／共用來源 | 否 |
| [ ] K05 授權／正式命名 | Registry與正式source locators | 同approved lineage要求 | 自動＋review／D/M | 授權來源可驗、null ID不捏造、幾何placeholder標示 | 未授權拒收／補name mapping | 否 |
| [ ] K06 版本更新與回復 | event/control/asset SHA、音訊owner | 同更新一項資產的演練 | 自動／D/M | 不需改公式/存檔，更新閉包可重製與revert | 分開variant key／cache fingerprint，保留原UI | 否 |

T2-B交付每方案的勾選表、截圖/錄影、raw量測、源稿/授權/bytes；T2-C完成真機與公平比較後由使用者決定，不以分數機械宣告勝者。本批只驗規格／fixture與既有核心相容。
