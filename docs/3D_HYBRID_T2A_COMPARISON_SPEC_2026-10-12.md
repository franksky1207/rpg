# T2-A｜2D／2.5D 同場比較規格

## 基準、已核對與施工邊界

起始 main／HEAD：`754acf702325f0a136d21a5948b45807ea5db4f2`，工作目錄乾淨，fetch 無其他提交；T1-C 的九個 exact-HEAD Actions 均 success（含 Runtime、Stage4、Optimized Pages）。依指定順序核對交接、路線圖、T1-C 報告／JSON、T1-B／A、轉型草案、實作計畫、19～40驗收、source/publish總規範、GM目錄與預覽矩陣。

實際程式核對：index 的 combat-events 先於combatcore，正式快照由 formal-home／GM讀取，Loader仍按需，Runtime／工廠／CharacterAssets／Appearance／TestCenter／Registry原接線保留。全部T1-C來源仍有visualContext／associate／settlement接點：combatcore、mirrorcombatcore／mirrordungeonrun、secondworldcombat／mainline、thirdworldcombat／progress、dungeoncore／arena／void、thirdworldarena、calamitycore／secondworldcalamityrun／ui、alternateuniversecombat、specialcore／encounter、GM power/worldphase/AUbenchmark；combatfx／battlepipeline／ui／worldmapui生命週期仍在。本批不改上述檔案。

T1-A/B/C 真手機、音訊／GPU硬體、長期背景、真帳號雲端及部分詳細事件仍未驗；success CI不等於這些Gate完成。本批新授權只建立隔離規格／資料，剩餘硬體Gate帶入T2-B／T2-C。本批不製作Renderer、舞台、動畫、美術或選型，不改原第27～40規格。

## 三方案與公平條件

| 方案 | 玩家 | 敵人 | 必須負擔的真實成本 |
|---|---|---|---|
| A 純2D | 五槽獨立分層／影格，保留穿卸與空槽；不能只有一張合成圖 | 同代表美術製成2D影格／分層 | 人物與裝備圖層、遮擋、動作／視角乘數、下載／解碼／紋理，不能把預先烘焙成本藏起來 |
| B 即時玩家＋預渲染敵人 | 現有53骨／9掛點／G007三LOD | 從C共用的3D敵人源稿輸出固定鏡頭圖集 | 圖集、解碼、紋理常駐／mipmap／逐幀播放；玩家仍有GLB與GPU成本 |
| C 即時玩家＋即時敵人 | 與B相同 | 與B同源敵人模型、必要動畫 | GLB、骨架／動畫、材質、shadow／GPU；不能只拿幾何占位物相比B完成美術 |

共用同一fixture SHA、case SHA、外觀variant、背景、鏡頭投影、占屏比例、動作次序與示範節奏、VFX可見範圍／粒子數／陰影強度／透明度、LOD品質tier、viewport/DPR、硬體／瀏覽器／網路條件。資產格式差異是比較變項，不能不同敵人設計或不同數值。缺資產的方案標not-ready，不能先判其他方案贏。

[機器可讀控制參數](../development/hybrid-comparison/t2a-v1/comparison-controls.json)與[事件fixture](../development/hybrid-comparison/t2a-v1/owner-fixtures.json)由三方案共用。A/B/C輪流單獨掛載（不並行污染GPU成本），六種順序輪替，每次同一episode；錄影／截圖也記SHA與外觀variant。無方案已獲勝；本批只有「如何比較」定義。

## 正式身份與資產實況

玩家名稱「T2-A 隔離比較玩家」是開發fixture標籤，不是假正式帳號；外觀由正式唯讀API讀隔離State，數值是明示輸入fixture，**不是由G007圖片推算正式能力**。T2-B若經既有授權讀真外觀，只讀外觀投影，不搬完整State或寫存檔。

| 代表 | 正式ID | 紀元／區域／關卡 | 正式位置、等級與類型 |
|---|---|---|---|
| 遺址守衛機 | unavailable/null | 銀河／地球戰爭／古代科技遺址 | EARTH_MAPS[6].enemies[0] → MAPS[6]，Lv31 normal/balanced |
| 遠古戰爭機甲 | unavailable/null | 同上 | enemies[3]，Lv34 elite/tank |
| 遺址中樞核心 | unavailable/null | 同上 | enemies[4]，Lv35 boss/balanced |

來源為[worldmaps-earth.js](../worldmaps-earth.js)、data的固定region註冊、balance.monsterObj及traits.createMonsterEncounter；三者都正式存在、可合法解鎖。開發fixtureKey只是定位，不冒充正式ID；生成工具用隔離Lv35、map6解鎖／前置10擊殺／Boss未鎖驗證入口合法，不執行fightOnce或獎勵。

直接解析18個GLB與核對完整SHA／授權：玩家low/medium/high各53骨、9掛點（7裝備socket＋2FX）；唯一動畫 `CW_Idle_Breathing_Compatibility`，**沒有attack、受擊、閃避或死亡clip**。G007武器／背飾rigid，頭盔／鎧甲／雙鞋53-bone skinned，五槽×三LOD=15GLB，無獨立動畫。正式名稱：古代光刃、遺物守衛盔、自律護衛甲、遺跡浮行靴、古文明鑰印。技術可用不等於概念圖已批准或美術封版；本批沒有改GLB／骨架。

人物各LOD bytes：741596／1694776／5006948；G007整套各LOD：283084／351184／394592。這是現有檔案實際bytes，非GPU實測或未製作敵人的容量預測；完整逐資產資料在fixture.assets。

三代表**沒有已登錄真實敵人GLB／圖集**；既有戰鬥場景幾何是回退。T2-B待製作同源敵人稿、動作、A分層玩家／五槽素材、B圖集、C發布模型及背景/VFX。玩家攻擊極端姿勢／穿模也待素材與驗收，idle不得當作已完成攻擊。

## 固定3/4鏡頭與舞台基準（初始提案）

採orthographic，yaw35°／pitch15°；可調yaw30～45°、pitch12～22°，每次變更control version且三方案一起改。不是已實測定案。B的預渲染鏡頭與C投影一致；A以同一投影參考輸出層，不能用別的近景機位。

Canvas UV原點左上：玩家足點(0.25,0.78)、敵人(0.74,0.78)，相向站立；玩家高0.38H，普通0.36H、菁英0.42H、Boss0.56H，直式Boss封頂0.50H。超大Boss以縮比／深度／上半身安全特寫（另獨立同場case）處理，不任意擠掉HUD。無自由鏡頭、人物移動或導航要求。

前景y0.82～1、中景0.30～0.82、背景0～0.30；背景同稿、同視差幅度，不因C多幾層就改評分條件。動作向接觸點前進≤0.12W、擊退≤0.04W，回原足點；不移動HUD，不以移動距離代表數值傷害。純示範節奏每known action700ms，prepare120／impact300／return180；這是視覺比較腳本，**不是正式戰鬥等待／1×規則**。

遮擋：遠景→地面陰影→後方肢體／裝備→主軀幹→前方武器／手臂→接觸VFX→傷害文字→血／盾／狀態／名稱→原操作HUD。A必須處理左右腳、背飾、武器與頭盔遮面，空槽恢復基底；B/C按深度同規則，VFX不得蓋正式名字／血條。文字至少16CSS px、對比≥4.5:1，色彩不能是唯一狀態線索；未知盾不補成0。Boss特演限UV(0.44,0.14)～(0.93,0.78)，避開傷害文字與HUD。

Viewport共用1280×720(16:9)、1440×1080(4:3)、390×844／360×800直式、844×390橫式。Canvas在既有HUD與操作列之間；先扣safe-area inset及原按钮矩形，不能把按鈕浮蓋舞台。直式使用上下HUD、橫式以可用中間舞台縮放；安全區不足則縮小／letterbox，不壓縮按鈕或新增捲動鎖。以上尺寸／角度須T2-B實際畫面調整、T2-C真機驗證。

## 量測與成本方法

三暖機、十量測episode；分別記冷載（全新隔離profile）、同tab熱載、重整熱載與更新後版本，不清真玩家Cache。硬體、OS、browser、DPR、螢幕refresh、電源／溫度、網路throttle、資產／control／caseSHA都入報告。不能以B之熱快取對C之冷下載。

rAF raw intervals記median/p95/p99、>50ms數量、elapsed FPS；CPU／GPU只有可用正式工具或profiling證據才記，否則null＋原因。`performance.memory`為瀏覽器特有JS heap proxy，不是全程序記憶體；GPU/texture API不足時記unavailable。RGBA W×H×4、mipmap×4/3只能另外記estimate，不能寫入observed GPU欄。

Resource Timing＋HTTP bytes／CDP可取得時區分transfer/encoded/decoded bytes、file數；B記圖集compressed bytes、createImageBitmap解碼時間、decoded尺寸、upload proxy、frame切換；C記GLB fetch／parse／animation／shader／shadow成本。跨origin timing缺資料就unavailable，不拿0當免費。

100次開關/換裝/scene重建，檢查scene/container/texture proxy回零、CPU cache有界，不要求共享cache清零；30分鐘連戰、前背景切換、orientation、context loss／restore、低畫質與文字回退。暫提desktop60/mobile30FPS目標，尚未量測，不能據此宣稱達標；T2-C用真裝置結果修訂共同預算後才選型。

美術記實際工作log（建模／UV貼圖／綁定／動畫／導出／QC／返工），每個敵人動作數、frame數、atlas尺寸／pages／壓縮格式／padding/mip、GLB bones/materials/triangles與licenses。210套／1050槽全獨立換裝的A層×動作×視角組合、B/C掛裝／遮蔽／體型適配要列可追溯成本模型與假設；**未製作的工時／bytes欄全not-run，不填無依據估值**。source包括.blend/貼圖/動畫/輸出設定，publish僅核准註冊成品與授權。

## 驗收、證據與續接

- [Fixture契約](3D_HYBRID_T2A_FIXTURE_CONTRACT_2026-10-12.md)
- [逐項驗收矩陣](3D_HYBRID_T2A_ACCEPTANCE_MATRIX_2026-10-12.md)
- [T2-B詳細藍圖](3D_HYBRID_T2A_T2B_IMPLEMENTATION_BLUEPRINT_2026-10-12.md)
- [本批實測證據](3D_HYBRID_T2A_TEST_EVIDENCE_2026-10-12.json)

本批規格／工具／資料完成提交 `8e13fb19582dd8217044a28189b71008ca171f68`；起始HEAD見首節。其後的驗收證據／交接提交為最終main，exact-HEAD Actions與完整SHA由GitHub main及交付回報獨立查核，避免文件自我引用。已執行17項T2-A、T1-A15/T1-B10/T1-C26/整合4共72契約、330資料一致性比對、正式core576/鏡像48比較、385檔HTTP/SHA。最初掛點/seed/VM bootstrap與本機HTTP故障已修正重跑，未放寬斷言；所有指令與未驗項見實測JSON。回復revert本批程式／資料與交接提交，不改存檔／雲端／快取。**T2-B、T2-C、T3～T5未施工；本批停止。**
