# T2-B3 開工前置判定｜T2-B2 r2

本表僅判定前置條件，沒有開始 B3。A=已完成且技術驗證通過；B=不阻礙 Renderer 開發，但正式比較前需驗收；C=破壞正確性／公平性，必須先修。**仍有兩項 C，不建議進入 B3。** 真手機 FPS／完整 HUD／GPU 長測不要求 B2 提前完成；人工美術由使用者批准。

| 類別 | 項目 | 判定與證據／責任 |
|---|---|---|
| A | 三敵 scalar 材質與原幾何／動畫保護 | 4096 roughness texels match GLB G; all original geometry/animation accessors exact; 53/9/3LOD/formal15 unchanged |
| A | 共同顯示基準與時間取樣 | 15 actual linear reference renders max AgX error 0.002783561 < 1/255; source clipStart 1/30s explicitly sampled; native silhouette IoU min 0.995231832 |
| A | 來源／Fixture／B1／正式核心／五槽及發布隔離 | original source lock, unchanged player, 32 subsets+mixed+empty, six clips, tiers/fallback/cues, no production files modified; see r2 test evidence |
| B | 人工美術／Boss重量感／自然度與遮臉 | 主觀批准須由使用者檢視真圖／動作；不由技術綠燈封版 |
| B | 真 iOS／Android FPS、GPU記憶體／溫度與30分鐘長測 | B3/B4/T2-C後續責任；SwiftShader／viewport不是實機，不要求B2提前完成 |
| B | 完整 B1 舞台／HUD安全區／換裝與取消的Renderer整合 | B3才接入；本批保存固定鏡頭／姿勢，不施工Renderer |
| B | G006 真正可穿戴模型與最終美術 | 文字降級契約可用，不冒充G007；正式比較須清楚顯示缺材範圍 |
| C | native 材質／光影公平性 | 同正確時間與同源鏡頭：r1 0.214275032 -> r2 0.214556724；非等效陰影與近場area/IBL反射仍存在，source/GLB Cycles roundtrip max RMSE 0.049489593亦待拆解 |
| C | 肩甲與護手／劍首不合理接觸 | attack10/return1 shoulder vertex141 upper_arm.R against clavicle.R 49.604mm nearest-surface risk；hit7 weapon vertex54是guard不是grip，19.831mm；grip-finger contact需保留但guard/pommel尚未批准 |

## C 類最小後續修正

- **native 材質／光影公平性**：先以一敵固定idle、材質ID／法線／粗糙度pass拆解source-reimport殘差；再以有限面燈白／灰／金屬球、等效陰影確認能量與反射方向，通過後才重測三敵六動作。不要重新設計敵人或改曝光去配分數
- **肩甲與護手／劍首不合理接觸**：只製作隔離候選肩甲的關節掛載／局部修型及護手／劍首微調，保留正式15GLB和body53骨拓樸權重；三LOD映射與source/A层/B-C绑定同步，再做全132格部件级BVH+ray及近距離姿勢驗收。角度單變量±20度已測仍未清除，不再盲目重做整套動畫

沒有 C 才可建議另行授權 B3；B 類留在正式比較 Gate，不能自行選定 A/B/C。完整數據見 [r2驗收](3D_HYBRID_T2B2_REPAIR_R2_ACCEPTANCE_2026-10-12.md)／[機器證據](3D_HYBRID_T2B2_REPAIR_R2_TEST_EVIDENCE_2026-10-12.json)。
