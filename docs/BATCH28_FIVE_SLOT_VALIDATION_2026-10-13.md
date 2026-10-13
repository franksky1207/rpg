# 第28批共用五槽契約／設計資料重整驗證｜2026-10-13 UTC

本次為文件／設計資料施工；美術建議與C選項待使用者審核，不修改素材或批准。基準main `5a1b219e33e15f313b620bb8d9984eab87bdf810`。交付：[共用規格](3D_EQUIPMENT_ALL_EPOCH_FIVE_SLOT_CONTRACT_2026-10-13.md)、[20套分類與notes入口](BATCH28_G001_G020_DESIGN_RESTRUCTURE_2026-10-13.md)、[G007精修規格](BATCH28_G007_REFINEMENT_SPEC_2026-10-13.md)。

## 實際命令與結果

| 實際執行命令 | 結果與證據 |
| --- | --- |
| `python3 scripts/equipment-concepts.py validate` | PASS；100／100／10、210／1,050、40圖／20套、0批准、190套無圖；[完整log](evidence/batch28-five-slot-design/concept-validate.log) |
| `python3 -m unittest discover -s tests/equipment-concepts -v` | 27項PASS，包含身份／錯名／缺槽／偽批准／圖片毀損／人工內容保留／重跑及批次續跑；[log](evidence/batch28-five-slot-design/concept-unittest.log) |
| `node tests/runtime/3d-equipment-contract.cjs` | PASS；原15真LOD、五名、遮面雙鞋、53joint／bind／weights、錯名／錯bind負例与原基底不變；[log](evidence/batch28-five-slot-design/equipment-contract.log) |
| `node tests/runtime/3d-batch28-preflight.cjs` | PASS；五槽解析、缺材／空LOD回退、stale取消／卸裝／關閉；[log](evidence/batch28-five-slot-design/preflight.log) |
| `node scripts/publish-asset-audit.cjs` | 首次FAIL為環境`spawnSync git EPERM`，已有stdout且status=0但沙盒子程序回報EPERM；未改工具或測試，以工具網路權限環境重跑PASS、hardMissing=[]。[原失敗](evidence/batch28-five-slot-design/publish-audit-sandbox-failure.log)／[成功](evidence/batch28-five-slot-design/publish-audit.log) |
| `node tests/runtime/docs-integrity.js` | PASS；正式Schema／三紀元及歷史交接規則保留；[log](evidence/batch28-five-slot-design/docs-integrity.log) |
| `python3 /tmp/b28-design-verify.py` | PASS；20原notes全文前綴／A標記區保留、五名及5節齊全；144保護檔原bytes／SHA不變；隔離副本兩次generate、288檔零差異，根目錄索引未寫。[JSON](evidence/batch28-five-slot-design/preservation-and-generator.json)／[完整生成log](evidence/batch28-five-slot-design/generator-isolated.log) |
| `git diff --check` | PASS；沒有格式錯誤；修改範圍僅20notes、交接与授權文件／非權威證據 |

驗證命令原文：[verification-command.py.txt](evidence/batch28-five-slot-design/verification-command.py.txt)。可拷貝至`/tmp/b28-design-verify.py`重跑；基準SHA固定為本次起點，使用原既有DatabaseTests的臨時副本fixture调用**實際正式生成器**，不是用字串模擬生成。JSON非權威索引，不能驅動批准或發布。

保護範圍含40WebP、15装备GLB、人物三GLB、assets registry、G007全部已追蹤來源／blend／測量／歷史review、人物來源、概念identity／index／210主索引及resource manifest。對其餘正式JS／CSS／HTML、190套notes、公式與發布開關，以baseline git diff允許清單驗證無變更；未批准狀態仍全部false／approvalEvidence null，FULL_3D_AVAILABLE與正式B發布限制未動。

## 實作界線與未驗事項

- 新共用契約是後續設計／交付要求。跨套碰撞、非實體例外、新增膝／脛coverage及所有許可偏移未在Runtime新實作，不能報已通過。
- 本次不重新圖審、不啟動Blender匯出、不改40圖／15GLB或人物；依前次真40圖與G007實載證據作設計增補。既有browser／動作長測歷史保留，未聲稱本次重跑完整瀏覽器或真人驗收。
- G006局部圖修、G007背甲小圖圖修與高脛／鑰印方案、G016腿型方案均待後續決定／授權；本次没有候選圖或新模型。
- iPhone直横／3/4手機可讀性、GM原件穿卸／動作、真兩套混穿與30分鐘GPU／熱／弱網須後續真機驗收。文件修改本身不要求重測戰鬥數值或雲端。

## GitHub與承接

起點5a1b219e六項Actions已核對全部success，只作起點健康基準。新提交的exact-HEAD Actions必須推送後另查；本文件不預告綠燈，最後交付回報提供提交SHA／逐流程結果與未完成事項。沒有新增workflow或独立監控。回退只需git revert本次文件提交，不清理或遷移玩家資料。
