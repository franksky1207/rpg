# G14｜G066～G070 五套十張概念圖驗收

日期：2026-10-16 UTC。基準最新main：`5949950599dce60564e16a1ad12e17452ff0c77e`。

正式owner：worldmaps-galactic-mid.js REGION_MAPS[5..9]、data.js WORLD_REGIONS固定註冊（MAPS[65..69]）、engine.js makeItem五槽映射。正式210套第66～70位，210套／1,050槽名稱、永久ID、sourceKey、目錄與開工卡均已逐字核對。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- |
| G066 銀河中域 → 星域競爭帶 | 星域裂光刃／霸權戰盔／競爭主戰甲／區域躍遷靴／星域爭霸權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g066-sector-rivalry/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g066-sector-rivalry/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g066-sector-rivalry/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g066-sector-rivalry/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g066-sector-rivalry/sources/generation.json) |
| G067 銀河中域 → 銀河帝國艦隊區 | 帝國艦刃／艦隊禁衛盔／帝國艦戰甲／艦橋機動靴／艦隊火控中樞 | [三視](../development/3d-source/equipment/concepts/galaxy/g067-imperial-fleet/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g067-imperial-fleet/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g067-imperial-fleet/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g067-imperial-fleet/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g067-imperial-fleet/sources/generation.json) |
| G068 銀河中域 → 文明議會星區 | 議政戒律刃／文明議冠／議會防護甲／議政通行靴／文明議政權限 | [三視](../development/3d-source/equipment/concepts/galaxy/g068-civilization-council/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g068-civilization-council/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g068-civilization-council/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g068-civilization-council/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g068-civilization-council/sources/generation.json) |
| G069 銀河中域 → 霸權核心領地 | 霸權斷星刃／主宰冠盔／主宰王權甲／霸域穿梭靴／霸域統御中樞 | [三視](../development/3d-source/equipment/concepts/galaxy/g069-hegemonic-core/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g069-hegemonic-core/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g069-hegemonic-core/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g069-hegemonic-core/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g069-hegemonic-core/sources/generation.json) |
| G070 銀河中域 → 中域霸權核心 | 中域統御刃／銀河統帥盔／中域主戰甲／中域統御靴／中域統御權限 | [三視](../development/3d-source/equipment/concepts/galaxy/g070-middle-domain-core/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g070-middle-domain-core/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g070-middle-domain-core/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g070-middle-domain-core/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g070-middle-domain-core/sources/generation.json) |

十次實際OpenAI image_gen.imagegen。每套先獨立生成三視、view_image檢視後，以本套原PNG參考另次獨立繪製五槽；沒有裁切、換色、複製舊圖、重排或程式佔位。十原PNG逐位元組保存，十WebP以Pillow RGB quality=92 method=6轉檔；全部1536×1024、完整解碼、各自SHA獨立。工具原路徑、原PNG與WebP尺寸／bytes／SHA、參考原稿SHA及權利依據見各套sources/generation.json。

原圖與實際WebP的288×192縮圖已逐張目視。G066橙青斜胸／六角星印、G067海軍藍橫簷／圓形火控、G068白玉三尖冠／三葉環印、G069黑金厚甲／菱心背核、G070暗紅銀脊／三板指揮架，有配色及頭肩胸靴武器背飾輪廓區別。主武器均為短握柄刀劍／能量刃。G066生成小字字形、G067補充單品及艦刃彎度、G068補充武器近景出框、G069側視角度與構圖邊緣、G070鎧甲背視省略側訊號板及腰甲材質微差均依實際影響記advisory；主五槽與主體完整、飾品獨立展示，不提高AAA或工程級門檻。

五筆schema4各僅一筆Codex stage，由正式驗證器核對正式身份、兩圖SHA、固定政策SHA、來源／證據SHA及fingerprint，blocker=0。asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false；概念批准不代表角色素材完成。

新增G001～G065共487歷史檔SHA鎖；前65筆及G071以後140筆索引與基準一致。舊鎖、原PNG／WebP／schema3／schema4／來源、G024／G030例外、210套／1,050槽順序與映射保留。負向案例改用真正未製作G071，不放寬來源、安全、SHA或發布隔離。新概念、原PNG、審查與證據不進正式Pages。

未修改正式戰鬥介面、手機資訊框、角色站位、原地攻擊動畫、玩法、GM、存檔、背景／文字／極簡或音訊。完整本機結果與限制見[證據README](evidence/equipment-g14/README.md)。最終SHA及實際Actions於任務回覆核對，不引用舊SHA或把pending稱為通過。實體手機與G14正式角色／武器素材、GM及正式發布未製作或驗收。

本機通過：概念108項、角色素材Python17項、角色／GM／正式／武器Node37項；JS結構423檔及資源manifest517項。真Chromium角色三套五動作、GM三viewport121斷言、武器與正式三viewport、缺材／SHA／解碼／慢載入／生命週期、高維review及虛空／鏡像副本；武器時序288組權威差0ms，音訊50情境。
