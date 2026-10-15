# G10｜G046～G050 概念圖量產驗收

日期：2026-10-16（臺灣）。基準 main：`78f1fd2a7666f4d86b35e153bd4e2d32e78eef3f`。

## 正式身份與查看清單

正式owner：worldmaps-orion.js REGION_MAPS[5..9]、data.js註冊、engine.js makeItem；對應210套第46～50位、MAPS[45..49]，210套／1,050槽正式名稱未改。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- |
| G046 獵戶臂戰爭 → 星際聯盟戰區 | 聯盟脈衝刃／聯軍戰盔／聯盟主戰甲／聯合作戰靴／聯盟戰術模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g046-alliance-warzone/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g046-alliance-warzone/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g046-alliance-warzone/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g046-alliance-warzone/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g046-alliance-warzone/sources/generation.json) |
| G047 獵戶臂戰爭 → 星區軍械庫 | 軍械震裂刃／兵器庫戰盔／軍規重甲／武裝推進靴／軍械火控節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g047-sector-arsenal/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g047-sector-arsenal/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g047-sector-arsenal/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g047-sector-arsenal/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g047-sector-arsenal/sources/generation.json) |
| G048 獵戶臂戰爭 → 獵戶臂要塞 | 要塞重刃／堡壘戰盔／要塞重裝甲／堡區機動靴／要塞權限模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g048-orion-fortress/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g048-orion-fortress/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g048-orion-fortress/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g048-orion-fortress/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g048-orion-fortress/sources/generation.json) |
| G049 獵戶臂戰爭 → 星區霸權領域 | 霸權制衡刃／統御戰盔／星區霸權甲／霸權越界靴／星區霸權權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g049-sector-hegemony/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g049-sector-hegemony/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g049-sector-hegemony/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g049-sector-hegemony/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g049-sector-hegemony/sources/generation.json) |
| G050 獵戶臂戰爭 → 獵戶臂主戰場 | 旋臂決勝刃／旋臂主控盔／獵戶主戰甲／旋臂決勝靴／旋臂戰略中樞 | [三視](../development/3d-source/equipment/concepts/galaxy/g050-orion-main-battle/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g050-orion-main-battle/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g050-orion-main-battle/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g050-orion-main-battle/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g050-orion-main-battle/sources/generation.json) |

## 真實生成與單階段審查

十次實際OpenAI image_gen.imagegen；每套先生成並目視三視，再以本套原PNG為參考另次獨立生成五槽。1536×1024原PNG位元組保存於sources，generation.json記錄原工具路徑、參考SHA、原PNG及WebP SHA、bytes、尺寸與權利依據。Pillow RGB WebP quality=92 method=6，原尺寸無裁切、換色或拼貼；十PNG與十WebP各自SHA唯一且完整解碼。

原圖與實際WebP 288×192縮圖已逐張目視。藍白聯軍雙模組、橙黑軍械六角核、深綠黃銅城垛肩、黑紫金冠盔菱印、紅銀旋臂圓盤可區分，武器均刀劍。G046附小圖未拿來裁切五槽；G047鞋多角度、G048標籤配置、G049劍旁列、G050背面誤標SIDE均如實記advisory。

五筆schema4均僅一筆真實Codex stage，正式驗證器核對身份、圖片SHA、政策SHA、證據SHA及fingerprint通過，blocker=0。透明角色／武器not-started、GM not-tested、formalReleaseAllowed=false。未修改正式戰鬥介面、手機框、站位、動畫、公式、存檔或音訊。

## 完整驗證與歷史保護

generate／validate：50套批准、100圖、160套未製作；重跑changedFiles=0。G10 approvedSets=5、imagesPresent=10、imagesMissing=0。G001～G045共307歷史檔新增SHA鎖；舊G07～G09鎖、schema3／4、G024／G030例外保留。前45筆歷史索引及G051後160筆等同基準，G051無圖未批准。

測試基準更新為G051未製作及50套批准；保留安全、SHA、來源、發布隔離斷言。新增G10原稿／獨立性／schema4／歷史／總數測試。命令結果見[證據目錄](evidence/equipment-g10/)。

本機概念完整unittest **88項通過**；角色素材Python **17項通過**；角色／GM／正式／武器四個Node測試檔 **37項通過**。真Chromium角色三套五動作、GM三viewport 121斷言、武器三viewport、正式戰鬥三viewport、全部故障與生命週期、高維review與虛空／鏡像副本均通過。288組武器時序差為0ms；原音訊生命週期真Chromium 50情境通過。歷史SHA、來源、發布資產、owner clock及controller檢查通過；build-publish-dry-run missingRefs=0，本批45檔全部excluded且staging不存在。

初次環境Git／子程序權限、GM提前開始而staging未完成、音訊預設瀏覽器缺少，以及測試舊批准集合，皆據實保留紀錄。後續在完整staging後依序重跑，修正負向案例與集合，未放寬原安全斷言或改正式Runtime。

## GitHub與待補

本機必要驗證完成後直接推送main，最終SHA與exact-HEAD Actions結果於任務回覆列出；不以舊G09成功或pending冒稱通過。實體手機、G10透明角色、遊戲內GM／正式戰鬥發布未製作或驗收，屬後續素材工作。
