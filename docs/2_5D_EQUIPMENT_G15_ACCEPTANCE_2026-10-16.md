# G15｜G071～G075 五套十張概念圖驗收

日期：2026-10-16 UTC。基準GitHub main：`56d95987e9115cf74a4967492bae4e38606b8f87`。

正式owner：worldmaps-core-outer.js REGION_MAPS[0..4]、data.js WORLD_REGIONS固定註冊（MAPS[70..74]）、engine.js makeItem五槽映射。210套第71～75位，完整210套／1,050槽順序與正式身份逐字核對，未改名稱、永久ID、sourceKey或目錄。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- |
| G071 銀河核心外圍 → 高密度星區 | 星壓切界刃／星壓戰盔／核心外圍甲／重力穩定靴／星密度控制核 | [三視](../development/3d-source/equipment/concepts/galaxy/g071-dense-star-sector/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g071-dense-star-sector/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g071-dense-star-sector/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g071-dense-star-sector/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g071-dense-star-sector/sources/generation.json) |
| G072 銀河核心外圍 → 引力異常帶 | 引力斷裂刃／重力抑制盔／引力防護甲／重力偏移靴／引力穩定器 | [三視](../development/3d-source/equipment/concepts/galaxy/g072-gravity-anomaly/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g072-gravity-anomaly/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g072-gravity-anomaly/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g072-gravity-anomaly/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g072-gravity-anomaly/sources/generation.json) |
| G073 銀河核心外圍 → 黑洞採能區 | 黑洞切界刃／視界戰盔／奇點防護甲／事件視界靴／黑洞採能節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g073-black-hole-energy/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g073-black-hole-energy/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g073-black-hole-energy/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g073-black-hole-energy/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g073-black-hole-energy/sources/generation.json) |
| G074 銀河核心外圍 → 奇點兵器工廠 | 奇點震裂刃／兵器核心盔／奇點主戰甲／空間折躍靴／奇點兵器節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g074-singularity-weapons/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g074-singularity-weapons/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g074-singularity-weapons/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g074-singularity-weapons/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g074-singularity-weapons/sources/generation.json) |
| G075 銀河核心外圍 → 時空擾動區 | 時空切割刃／時間穩定盔／時空防護甲／相位機動靴／時空校準器 | [三視](../development/3d-source/equipment/concepts/galaxy/g075-spacetime-disturbance/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g075-spacetime-disturbance/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g075-spacetime-disturbance/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g075-spacetime-disturbance/codex-review.md) · [原PNG／來源SHA](../development/3d-source/equipment/concepts/galaxy/g075-spacetime-disturbance/sources/generation.json) |

十次實際OpenAI image_gen.imagegen。各套先獨立生成三視並以view_image檢視，再以本套原PNG為參考另次獨立繪製五槽，未裁切、換色、複製舊圖、重排或用程式佔位。十原PNG逐位元組保存，十WebP以Pillow RGB quality=92 method=6轉檔；全部1536×1024、完整解碼、各自SHA獨立。原工具路徑、原PNG／WebP尺寸、bytes、SHA、參考原稿SHA與權利依據見各套sources/generation.json。

原圖與實際WebP的288×192縮圖已逐張目視。G071珠白深藍同心星壓層甲／衛星珠圓核；G072赭黃楔盔／月牙肩與偏移雙環；G073黑銀視界環盔／採能盤與寬矮靴；G074銅鋼工廠壓床甲／厚刃與四翼兵器節點；G075青瓷白斜疊輕甲／雙時間翼與沙漏菱框。五套具頭肩胸靴刀劍背飾輪廓及配色差異，銀河核心外圍科技語言有別於前批帝國／聯邦／霸權。主武器均短握柄刀劍／能量刃。

各套advisory依實際影像記錄：G071三視板附小五槽與文字，G072鎧甲下緣淡出，G073視界環／採能盤局部視角，G074側視略偏3/4與補充局部圖，G075三視刀劍獨立展示且五槽板兩甲視角偏正面。G075背部可由完整三視及獨立飾品核對；不將局部視角差異提高為AAA或工程級拆件門檻。

五筆schema4皆僅一筆Codex stage，正式驗證器核對正式身份、兩圖SHA、固定政策SHA、來源與證據SHA及fingerprint，blocker=0。沒有手改索引批准繞過驗證。asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false；概念批准不代表角色素材完成。

新增G001～G070共532歷史檔SHA鎖；前70筆與G076以後135筆索引同基準。舊鎖、PNG／WebP、schema3／schema4、來源、G024／G030接受例外及完整正式映射保留。負向案例改用未製作G076，未放寬來源、安全、歷史SHA或發布隔離斷言。G076及後續未製圖。

本批概念、原PNG、審查與來源證據不進正式Pages。正式戰鬥介面、手機資訊框、角色固定站位、原地攻擊動畫、玩法、GM、存檔、背景／文字／極簡與音訊均未修改。完整本機驗證與環境限制見[證據README](evidence/equipment-g15/README.md)。最終SHA及實際Actions於任務回覆核對，不引用舊SHA或把pending稱為通過。角色／武器素材、GM與實體手機驗收均非本批產出。

本機全部通過：概念113項、角色素材Python17項、角色／GM／正式／武器Node37項；JS結構423檔、manifest517項。真Chromium三套角色五動作、GM三viewport121斷言、武器及正式三viewport、故障回退與生命週期、高維回顧與虛空／鏡像副本、音訊50情境；武器時序288組權威差0ms。發布政策回歸與歷史／發布隔離比對通過。
