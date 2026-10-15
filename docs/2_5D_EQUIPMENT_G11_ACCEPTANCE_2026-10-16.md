# G11｜G051～G055 五套十張概念圖驗收

日期：2026-10-15 UTC／2026-10-16 臺灣。基準最新 main：`038e07c124645eb7db0d4886b12e6a551c09da17`。

## 正式身份與圖片驗收清單

正式owner為 worldmaps-galactic-frontier.js REGION_MAPS[0..4]、data.js WORLD_REGIONS固定註冊、engine.js makeItem五槽映射。對應210套第51～55位、MAPS[50..54]；210套／1,050槽、sourceKey、永久目錄及正式名稱逐字核對未改。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- |
| G051 銀河邊境 → 銀河邊境帶 | 邊境星河刃／銀河遠域盔／邊境文明甲／星海推進靴／邊境航標 | [三視](../development/3d-source/equipment/concepts/galaxy/g051-galactic-border/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g051-galactic-border/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g051-galactic-border/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g051-galactic-border/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g051-galactic-border/sources/generation.json) |
| G052 銀河邊境 → 古文明遺跡群 | 古星遺刃／遺物冠盔／遠古文明甲／遺跡浮躍靴／古文明鑰核 | [三視](../development/3d-source/equipment/concepts/galaxy/g052-ancient-ruins-cluster/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g052-ancient-ruins-cluster/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g052-ancient-ruins-cluster/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g052-ancient-ruins-cluster/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g052-ancient-ruins-cluster/sources/generation.json) |
| G053 銀河邊境 → 失落星系殖民地 | 失落光刃／流亡戰盔／廢墟殖民甲／流亡航跡靴／失落殖民刻印 | [三視](../development/3d-source/equipment/concepts/galaxy/g053-lost-system-colony/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g053-lost-system-colony/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g053-lost-system-colony/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g053-lost-system-colony/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g053-lost-system-colony/sources/generation.json) |
| G054 銀河邊境 → 銀河海盜領域 | 星海劫掠刃／海盜王戰盔／掠奪主戰甲／星海漂移靴／劫掠航標 | [三視](../development/3d-source/equipment/concepts/galaxy/g054-galactic-pirates/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g054-galactic-pirates/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g054-galactic-pirates/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g054-galactic-pirates/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g054-galactic-pirates/sources/generation.json) |
| G055 銀河邊境 → 遺跡兵器墓場 | 遺兵斷裂刃／墓場戰盔／殘骸戰甲／殘星推進靴／兵器殘骸索引 | [三視](../development/3d-source/equipment/concepts/galaxy/g055-relic-weapons-graveyard/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g055-relic-weapons-graveyard/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g055-relic-weapons-graveyard/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g055-relic-weapons-graveyard/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g055-relic-weapons-graveyard/sources/generation.json) |

## 真實生成與單階段審查

本任務十次實際 OpenAI image_gen.imagegen。每套先生成並目視完整三視，再以本套原始PNG作參考另次獨立繪製五槽；未裁切、換色、複製歷史圖、重排或程式佔位。原始PNG逐位元組保存在sources，generation.json記錄工具輸出路徑、原稿與WebP的尺寸／bytes／SHA-256、五槽對三視原稿的參考SHA、權利依據及轉檔參數。

沿用G10的1536×1024、Pillow RGB WebP quality=92 method=6，無縮放、拼貼或補邊。十原PNG及十WebP分別完整解碼且SHA各自獨立。原始生成圖與實際WebP的288×192縮圖已逐張目視。G051圓罩探索甲／音叉航標，G052三叉冠／青銅玉綠階梯甲／鑰核，G053陶橘拼裝甲／殖民背牌，G054展翼盔／非對稱重肩／彎刀，G055骨灰殘骸方甲／紫斷刃／三層索引可區別，未沿用獵戶臂五套共用模板。

每套一筆schema4、僅一筆真實Codex stage；正式驗證器檢查身份、兩圖SHA、固定政策SHA、來源／證據SHA及fingerprint通過，blocker=0。局部標籤字形、背甲重肩方向、裝飾與接點微差均如實記advisory，未提升AAA門檻。正式中文名稱以owner和審查中的formalIdentity為準，不以生成圖小字取代。

概念批准不代表正式角色素材：asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。未修改正式戰鬥介面、手機資訊框、角色站位、動畫、戰鬥、存檔、背景／文字／極簡或音訊程式。

## 完整驗證與歷史保護

完整執行紀錄見[本機證據](evidence/equipment-g11/README.md)。generate／validate：55套批准、110圖、155套未製作；重跑changedFiles=0。G11 approvedSets=5、imagesPresent=10、imagesMissing=0，G056及後續未製作。

新增G001～G050共352歷史檔SHA鎖；前50筆歷史索引與G056後155筆索引等同基準。G07～G10原鎖、schema3／4、原PNG／WebP及G024／G030已接受例外均保留。舊負向案例改用真正未製作的G056，批准集合與總數依55套更新，安全／來源／SHA／發布隔離斷言保留。新增G11原PNG、參考鏈、圖像獨立性、schema4、歷史／總數與發布隔離測試。

保留G09/G10完整歷史checkout、GM截圖穩定性及完成staging後依序測試流程。本批45檔概念圖、原PNG、來源、審查及notes均列發布排除且不存在於Pages staging。

本機最終概念完整unittest **93項通過**；角色素材Python **17項通過**；角色／GM／正式／武器四個Node測試檔 **37項通過**。真Chromium角色三套五動作、GM三viewport共121斷言、武器三viewport、正式戰鬥三viewport、缺材／SHA／解碼／慢載入與生命週期、高維review及虛空／鏡像副本均通過。288組武器時序權威差0ms；原音訊生命週期50情境通過。Runtime結構／資源manifest及發布稽核通過，missingRefs=0，未放寬斷言。

## GitHub與待補

驗證後直接提交推送main；最終SHA的Actions結果於本任務完成回覆列明，僅以該SHA實際結果為準，不引用舊成功或將pending稱通過。

實體手機、G11透明角色／武器素材、GM與正式戰鬥發布均未製作或驗收，不在本批概念圖範圍。
