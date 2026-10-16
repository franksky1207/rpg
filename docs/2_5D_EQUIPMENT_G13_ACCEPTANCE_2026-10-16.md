# G13｜G061～G065 五套十張概念圖驗收

日期：2026-10-16 UTC。基準最新main：`4d072565adcf1d2e309fab8ef5d8e0df452982e4`。

正式owner：worldmaps-galactic-mid.js REGION_MAPS[0..4]、data.js WORLD_REGIONS固定註冊（MAPS[60..64]）、engine.js makeItem五槽映射。正式210套第61～65位，210套／1,050槽名稱、永久ID、sourceKey與目錄已逐字核對。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- |
| G061 銀河中域 → 帝國外環領地 | 帝國御鋒／外環禁衛盔／帝國主戰甲／領域躍遷靴／帝國權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g061-imperial-outer-ring/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g061-imperial-outer-ring/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g061-imperial-outer-ring/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g061-imperial-outer-ring/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g061-imperial-outer-ring/sources/generation.json) |
| G062 銀河中域 → 聯邦星域 | 聯邦制式刃／星域戰盔／聯邦防護甲／聯邦航躍靴／聯邦戰術模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g062-federation-domain/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g062-federation-domain/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g062-federation-domain/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g062-federation-domain/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g062-federation-domain/sources/generation.json) |
| G063 銀河中域 → 星域軍團前線 | 軍團重刃／軍團戰盔／星域軍團甲／戰線機動靴／軍團指揮節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g063-sector-legion-front/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g063-sector-legion-front/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g063-sector-legion-front/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g063-sector-legion-front/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g063-sector-legion-front/sources/generation.json) |
| G064 銀河中域 → 帝國工業世界 | 帝國工業刃／重工禁衛盔／工業主戰甲／磁軌戰靴／帝國生產權限 | [三視](../development/3d-source/equipment/concepts/galaxy/g064-imperial-industrial-world/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g064-imperial-industrial-world/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g064-imperial-industrial-world/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g064-imperial-industrial-world/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g064-imperial-industrial-world/sources/generation.json) |
| G065 銀河中域 → 聯邦首都圈 | 首都禁衛刃／聯邦冠盔／首都防衛甲／首都機動靴／聯邦中樞權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g065-federation-capital/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g065-federation-capital/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g065-federation-capital/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g065-federation-capital/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g065-federation-capital/sources/generation.json) |

十次實際OpenAI image_gen.imagegen。每套先獨立生成三視、view_image檢視後，以本套原PNG參考另次獨立繪製五槽；沒有裁切、換色、複製舊圖、重排或程式佔位。十原PNG逐位元組保存，十WebP以Pillow RGB quality=92 method=6轉檔；全部1536×1024、完整解碼、各自SHA獨立。工具原路徑、原PNG與WebP尺寸／bytes／SHA、參考原稿SHA及權利依據見各套sources/generation.json。

原圖與實際WebP的288×192縮圖已逐張目視。G061紅金尖冠／菱印、G062白藍低圓盔／矩形模組、G063橄欖重甲／三翼圓盤、G064銅橙護領／磁軌靴／權限牌、G065銀紫環冠／三瓣權印，有配色與輪廓區別。銀河中域正規帝國／聯邦裝甲有別於銀河邊境的流亡、商路、遺跡與海盜。所有主武器為短握柄刀劍／能量刃。

五筆schema4各僅一筆Codex stage，由正式驗證器核對正式身份、兩圖SHA、固定政策SHA、來源／證據SHA及fingerprint，blocker=0。局部視角、標籤字形與裝飾差異如實記advisory，未提升AAA或工程級拆件標準。asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。

新增G001～G060共442歷史檔SHA鎖；前60筆及G066後145筆索引與基準一致。原PNG／WebP／schema3／schema4／來源、G024／G030例外、G07～G12舊鎖與安全斷言保留。負向案例改用真正未製作G066，未放寬來源、安全、SHA或發布隔離。新概念、原PNG、審查與證據不進正式Pages。

未修改正式戰鬥介面、手機資訊框、角色站位、原地攻擊動畫、玩法、GM、存檔、背景／文字／極簡或音訊。完整本機結果與限制見[證據README](evidence/equipment-g13/README.md)。最終SHA及其實際Actions於任務回覆核對，不引用舊SHA或把pending稱為通過。實體手機與G13正式角色／武器素材、GM及正式發布未製作或驗收。

本機已通過概念103項完整測試、G13最終審查4項、角色素材Python17項、角色／GM／正式／武器Node37項；JS結構423檔與資源manifest517項通過。真Chromium角色三套五動作、GM三viewport121斷言、武器與正式戰鬥三viewport、缺材／SHA／解碼／慢載入／生命週期、高維review及虛空／鏡像副本通過；武器時序288組權威差0ms。音訊50情境全部通過。
