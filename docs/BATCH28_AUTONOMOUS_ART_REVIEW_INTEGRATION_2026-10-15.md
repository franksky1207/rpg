# 第28批：自動美術審查制度整合與G024局部修圖紀錄

日期：2026-10-15；唯一開工來源 GitHub main `26d953f7ff42f4d56546970dfc48abe6dd0b4e1e`。本次直接main施工，無逐套人工美術批准門檻。

## 實際结果

| 套裝 | 兩張正式概念圖 | 審查／建模入口 |
| --- | --- | --- |
| G024 沃夫359防線 | 原圖兩張均保留；兩個真影像修圖候選未採用 | needs-local-correction / false |
| G026 天狼星殖民環 | 原圖兩張保留，未重新生成 | auto-art-reviewed / true |
| G027 南河三星港 | 原圖兩張保留，未重新生成 | auto-art-reviewed / true |
| G028 織女星觀測區 | 原圖兩張保留，未重新生成 | auto-art-reviewed / true |
| G029 近星文明遺址 | 原圖兩張保留，未重新生成 | auto-art-reviewed / true |
| G030 近星封鎖線 | 原圖兩張保留，拆件未展示完整甲背空掛座 | needs-art-evidence / false |

G024拆件原SHA `a4e2fa69aa573ad92f5a25702bbe0334fa76faf5440f1bfee4f2cb0266a56de3`，1491×1055、217974 bytes，未覆寫。第一新候選由真影像工具去盤，再由ImageMagick遮罩合成保留原像素；非目標差異零但靴口不自然斷面，故不通過。第二影像工具候選改出新的側護片，亦未通過。沒有將SVG、程式畫圖、換色或佔位圖入庫。遮罩只是界定真影像修補素材的合成範圍，不是生成裝備。

候選及量測：[失敗候選WebP](evidence/batch28-autonomous-review/g024-rejected-mask.webp)、[實測差異JSON](evidence/batch28-autonomous-review/g024-local-attempts.json)。候選只存docs/evidence，不能被當正式拆件或已批准圖片。上次失敗證據仍完整保留。

## 新狀態與契約

雙階段SOP v2.0 正式取代只允許使用者批准的舊概念門檻。既有G006、G007原始批准、代理授權及歷史證據逐位元保留；新增G026～G029各有schema2審查JSON及完整Markdown。兩階段逐項核對十類，綁定正式身份、當前兩圖、SOP、初審來源與審查文件SHA；缺項、過期、未解缺陷、fail/unverified不能批准。沒有把210套批量true。程式驗證的是可追溯證據與版本，不假稱具有自動美感辨識或兩個獨立模型代理的簽章。

共210套／1050槽、60圖／30套完整、6套經驗證批准：G006、G007、G026～G029。其他204套不批准，含180套缺圖。G024原膝盤與G030原缺甲背版本有防偽通過檢查，任意改true／檢查結果不能洗成合格。

`conceptApproved`／`conceptStatus`只表示概念審查；`modelingEligible`是開始建模資格；`modelStatus`仍按真模型證據推導；`formalReleaseAllowed=false`，與正式發布Gate分開。新唯讀 `equipment-modeling-gate.py --set ID` 重驗全catalog再提供建模身份，拒絕未批准與篡改索引。沒有生成新模型或改舊GLB／Blender／registry／正式開關。

全210套notes只重建工具A節，以免舊「使用者批准」標籤誤導；六套追加新結論，人工歷史與既有批准不清空。新舊SOP、資料庫維護、美術方向、命名及五槽契約同步修正。批次工具取消逐套人工要求並重驗catalog；概念CI安裝固定Pillow解碼，新增helper／SOP／workflow自身的觸發路徑。

## 自我檢查與限制

- generate／validate通過，重跑changedFiles=0；正式身份210／五槽1050均由真owner核對。
- 裝備47項unittest通過，含雙階段正例、缺階段／缺項／過期SHA／未解缺陷／偽造true／G024未修圖／G030缺證據的拒絕、實測像素越界及唯讀建模入口。
- 五槽runtime契約、Batch28 preflight、3D registry真資產清冊、JavaScript结构、正式資產、文件一致性與publish asset audit通過；裝備三世界語義瀏覽器測試以本機既有Chromium執行原斷言通過。
- 60張正式概念WebP全部原位元保留；G006/G007批准證據、永久identity、正式JS/CSS/HTML/GLB/Blend皆未修改。發布稽核排除development/docs，概念不進Pages／SW；不改resource-manifest／版本鎖／正式inventory，既有清冊SHA/bytes核對通過。
- **既有相容性稽核未通過**：歷史source-evolution記錄的afterSHA對`3d-test/test-center.js`及`3d-test/index.html`已過期，最新main原檔本來即不符。保留此失敗，不改無關GM／2.5D檔案，不移除雜湊檢查。原腳本對前20套全部未批准的舊假設已改成讀實際審查旗標且要求正式發布false。
- 不要求使用者美術批准；可直接看G024正式原圖／失敗候選及G026～G030概念與各套審查。G024仍需更精確局部影像編輯；G030仍需真實甲背空座視覺證據；接口毫米量測、模型／LOD／混穿動作與真手機仍屬後續工程工作。

完整命令結果與保留指紋：[validation-and-preservation.json](evidence/batch28-autonomous-review/validation-and-preservation.json)。提交與exact-HEAD Actions由GitHub該次提交及最終回報記錄；未觸發不算成功。
