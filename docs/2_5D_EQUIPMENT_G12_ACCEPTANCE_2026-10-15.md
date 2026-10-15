# G12｜G056～G060 五套十張概念圖驗收

日期：2026-10-15 UTC。基準最新main：`89738447f133ce8497731ee5e9cddd63d66328a7`。

## 正式身份與圖片驗收清單

正式owner為worldmaps-galactic-frontier.js REGION_MAPS[5..9]、data.js WORLD_REGIONS固定註冊與engine.js makeItem五槽映射；對應210套第56～60位、MAPS[55..59]。正式索引、永久sourceKey與開工卡逐字一致，全庫210套／1,050槽順序及名稱未改。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- |
| G056 銀河邊境 → 星海流亡區 | 流亡星刃／漂泊者戰盔／星海生存甲／遠漂躍遷靴／流亡航標 | [三視](../development/3d-source/equipment/concepts/galaxy/g056-stellar-exile/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g056-stellar-exile/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g056-stellar-exile/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g056-stellar-exile/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g056-stellar-exile/sources/generation.json) |
| G057 銀河邊境 → 銀河商路樞紐 | 商路護衛刃／交易戰盔／商隊防護甲／高速航運靴／商路交易節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g057-galactic-trade-hub/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g057-galactic-trade-hub/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g057-galactic-trade-hub/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g057-galactic-trade-hub/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g057-galactic-trade-hub/sources/generation.json) |
| G058 銀河邊境 → 古代星門網 | 古門切界刃／星門遺盔／空間遺甲／古門穿界靴／遠古星門遺核 | [三視](../development/3d-source/equipment/concepts/galaxy/g058-ancient-stargate-network/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g058-ancient-stargate-network/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g058-ancient-stargate-network/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g058-ancient-stargate-network/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g058-ancient-stargate-network/sources/generation.json) |
| G059 銀河邊境 → 邊境文明戰場 | 文明裂星刃／邊境王冠盔／文明重戰甲／星域突進靴／邊境統御核 | [三視](../development/3d-source/equipment/concepts/galaxy/g059-border-civilizations/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g059-border-civilizations/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g059-border-civilizations/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g059-border-civilizations/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g059-border-civilizations/sources/generation.json) |
| G060 銀河邊境 → 銀河邊境裁決區 | 邊境裁決刃／銀河遠征盔／邊境裁定甲／裁決航行靴／邊境裁決權限 | [三視](../development/3d-source/equipment/concepts/galaxy/g060-galactic-border-judgment/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g060-galactic-border-judgment/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g060-galactic-border-judgment/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g060-galactic-border-judgment/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g060-galactic-border-judgment/sources/generation.json) |

## 真實生成與單階段審查

本任務實際呼叫OpenAI image_gen.imagegen十次；每套先獨立生成三視、以view_image目視後，再提供本套原PNG作參考另次獨立繪製五槽。未裁切、換色、重排、複製舊圖或用程式佔位。原PNG逐位元組保存，sources/generation.json記錄工具原輸出路徑、原稿與WebP的尺寸／bytes／SHA-256、五槽對三視原稿參考SHA、權利依據與轉檔參數。

沿用G11的1536×1024、Pillow RGB WebP quality=92 method=6，無縮放、補邊或拼貼。十PNG與十WebP均完整解碼、各自SHA獨立；原稿與288×192實際WebP縮圖逐張目視。G056青砂兜帽／雙菱航標、G057白金方甲／六角節點、G058銀紫弧冠／星門環、G059紅銅王冠重甲／三角統御核、G060黑銀楔盔／雙直立權限板可明確區分。主武器均短握柄刀劍／能量刃。

每套schema4僅一筆Codex stage，固定政策SHA、六欄正式身份、兩圖SHA、證據／來源SHA及fingerprint經正式驗證器通過，blocker=0。補充視角、裝飾接點、G058展示底座等微差如實記advisory；不提高AAA或工程級拆件要求。

asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。概念圖不等同透明角色、武器動畫或正式素材完成。未修改正式戰鬥介面、手機框、固定站位、攻擊動畫、玩法、存檔、背景／文字／極簡或音訊系統。

## 完整驗證與歷史保護

實際命令與結果見[本機證據](evidence/equipment-g12/README.md)。generate／validate：60套批准、120張概念圖、150套未製作；重跑changedFiles=0。G12 approvedSets=5、imagesPresent=10、imagesMissing=0，G061及後續未生成。

新增G001～G055共397檔SHA鎖；前55筆歷史索引與G061後150筆索引保持基準。原PNG、WebP、schema3／schema4、來源與G024／G030例外保留；G07～G11原鎖和斷言不變。舊未批准案例改為真正未製作G061，總數基準更新；不放寬來源、安全、歷史SHA或發布隔離。新增G12原PNG／參考鏈／獨立性／schema4／歷史與發布隔離測試。

本機概念完整unittest 98項通過，角色素材Python 17項通過，角色／GM／正式／武器四個Node測試檔37項通過。JavaScript結構與資源manifest完整性通過。真Chromium三套五動作、GM三viewport共121斷言、武器及正式戰鬥三viewport、缺材／SHA／解碼／慢載入／生命週期、高維review及虛空／鏡像副本皆通過；武器時序288組權威差0ms，音訊50情境通過。瀏覽器本機CDN傳輸限制見本機證據README，不等同實體手機驗收。

保留完整歷史checkout與GM截圖穩定性、先完成staging後依序瀏覽器測試流程。新概念、原PNG、審查及來源證據只在development，不擅自進入Pages發布包。

## GitHub與待補

驗證完成後直接提交推送main；最終commit SHA與該SHA的實際Actions結果以任務完成回覆列出，不引用舊SHA成功或將pending稱為通過。實體手機、G12透明角色／武器素材、GM與正式發布均未製作或驗收，不在本批概念範圍。
