> **整合更新**：本候選v1已經使用者授權ChatGPT代理美術審查選用，正式G006／G007拆件圖與此候選逐byte一致；原圖留各套history/2026-10-14。下文「未批准／未取代」是候選交付時的歷史狀態，最新證據見docs/BATCH28_CONSOLIDATED_ACCEPTANCE_2026-10-14.md與正式art-review.json。

# G006／G007 局部修圖候選 v1｜2026-10-14

**僅供使用者逐圖美術審核；非正式概念版本、未批准、publish=false（文字標示，不更動正式開關）。** 原始圖與concept-index保持不變，不能從本目錄自動入庫或發布。

| 套裝 | 原圖 | 候選完整圖 | 左原／右候選局部對照 | 實際像素差異圖 |
| --- | --- | --- | --- | --- |
| G006 | [原拆解图](../../3d-source/equipment/concepts/galaxy/g006-polar-front/equipment-five-slots.webp) | [候選v1](g006/equipment-five-slots.candidate-v1.webp) | [四段脛部](g006/before-after-detail.png) | [差異圖](g006/difference-map.png) |
| G007 | [原拆解图](../../3d-source/equipment/concepts/galaxy/g007-ancient-tech-ruins/equipment-five-slots.webp) | [候選v1](g007/equipment-five-slots.candidate-v1.webp) | [背甲小圖](g007/before-after-detail.png) | [差異圖](g007/difference-map.png) |

G006四段硬脛殼／硬踝套改為帶縫線、皺褶與柔軟體積的保溫內襯；鞋欄長脛殼與冰爪像素不變。G007背甲的青色鑰印核心、金屬框與下柄移除，換為分節背板及小型空機械掛座；独立飾品与高脛靴像素不變。實際影像編修僅對兩塊裁切進行，未重新生成整張圖，沒有用色塊遮蓋或文字代替。

`edited-local-patch.png`是影像編修結果按原裁切尺寸適配的局部原件；`edit-mask.png`是合成用灰階選區／邊缘羽化圖，**不是候選圖中畫上的遮蓋色塊**。候選採lossless WebP，完整解碼尺寸維持1491×1055；因需保留編修區外全部原像素，各約1MB，僅存開發區不加入Pages／預載。未為800KB建議值犧牲像素保留或自行壓縮正式圖。

[來源／指紋／精確差異JSON](review-evidence.json)與[施工／目視報告](../../../docs/BATCH28_G006_G007_LOCAL_ART_CANDIDATES_2026-10-14.md)。PNG局部對照放大僅供檢查，不增加候選原生細節，不冒充新高分辨率全圖。使用者確認候選版本後，更新權威圖與索引仍須另有明確指示。
