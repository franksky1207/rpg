# G17｜G081～G085 五套十張概念圖驗收

日期：2026-10-16（Asia/Taipei）。基準GitHub main：`553aa5583f5cea8e93260ae4fada1ed79d1b07c0`。

正式owner：worldmaps-core-war.js REGION_MAPS[0..4]、data.js固定MAPS[80..84]、engine.js makeItem五槽順序。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／背部飾品） | 圖片與證據 |
| --- | --- | --- |
| G081 銀河核心戰爭 → 核心文明戰區 | 星河戰刃／核心冠盔／文明核心甲／星河跨域靴／文明核心權限 | [三視](../development/3d-source/equipment/concepts/galaxy/g081-core-civilization-war/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g081-core-civilization-war/equipment-five-slots.webp) · [原PNG及SHA](../development/3d-source/equipment/concepts/galaxy/g081-core-civilization-war/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g081-core-civilization-war/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g081-core-civilization-war/codex-review.md) |
| G082 銀河核心戰爭 → 恆星兵器陣列 | 恆星灼刃／日核戰盔／恆星防護甲／光壓推進靴／恆星兵器節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g082-stellar-weapons-array/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g082-stellar-weapons-array/equipment-five-slots.webp) · [原PNG及SHA](../development/3d-source/equipment/concepts/galaxy/g082-stellar-weapons-array/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g082-stellar-weapons-array/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g082-stellar-weapons-array/codex-review.md) |
| G083 銀河核心戰爭 → 星河艦隊戰場 | 星河艦刃／艦隊統帥盔／星河艦戰甲／艦橋躍遷靴／星河艦隊權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g083-stellar-fleet-battle/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g083-stellar-fleet-battle/equipment-five-slots.webp) · [原PNG及SHA](../development/3d-source/equipment/concepts/galaxy/g083-stellar-fleet-battle/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g083-stellar-fleet-battle/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g083-stellar-fleet-battle/codex-review.md) |
| G084 銀河核心戰爭 → 文明終結區 | 滅界執行刃／滅文明戰盔／終結主戰甲／毀滅相位靴／終結協議權限 | [三視](../development/3d-source/equipment/concepts/galaxy/g084-civilization-end/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g084-civilization-end/equipment-five-slots.webp) · [原PNG及SHA](../development/3d-source/equipment/concepts/galaxy/g084-civilization-end/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g084-civilization-end/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g084-civilization-end/codex-review.md) |
| G085 銀河核心戰爭 → 核心巨構帶 | 巨構切界刃／巨構控制盔／星河巨構甲／巨構機動靴／巨構控制節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g085-core-megastructures/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g085-core-megastructures/equipment-five-slots.webp) · [原PNG及SHA](../development/3d-source/equipment/concepts/galaxy/g085-core-megastructures/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g085-core-megastructures/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g085-core-megastructures/codex-review.md) |

十次實際OpenAI image_gen.imagegen，三視逐張目視後以本套原PNG參考另次生成五槽；無裁切冒充、換色或前批複製。十原PNG逐位元組保存；十WebP僅以Pillow RGB quality=92 method=6轉檔，皆1536×1024完整解碼。prompt、工具路徑、原稿及WebP尺寸／bytes／SHA、參考原稿SHA、使用者授權及適用服務條款依據見逐套sources/generation.json。

逐張原圖與288×192 WebP縮圖已實際目視：藍銀五齒冠三菱章、白銅蜂巢放射散熱、靛銀艦橋V雙桅、黑白終結倒三角鎖條、青綠巨構不對稱桁架。全遮臉、頭鞋完整、刀劍可辨，五槽雙鞋具有獨立鞋頭及鞋底，背飾與三視主要結構相符。長甲尾、側面角度、甲縫、接點與小字列advisory。

五筆schema4、policyVersion=equipment-2.5d-v3.0、單一Codex stage，blocker=0；SHA、policy、evidence與fingerprint由現行驗證器核對。索引由generate推導，並非手動批准。G001～G080共622檔新增SHA鎖，所有舊鎖與G024/G030接受例外、schema3歷史及G007舊3D保留。未生成負例移至確認未製作的G086，保留防偽批准及安全斷言。

累計85／210套、170／420張，剩125套250張；下一批G18＝G086～G090未製圖。asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。正式第28批仍進行，第29～40批未因此開始；未改正式遊戲玩法、Runtime、GM、音訊、存檔與發布開關。

本機最終驗證已收斂：概念123項覆蓋（118項全套首輪的一項舊範圍期待值修正後單項通過，另新增5項通過）、保護命令20項、Runtime99項命令、九項真Chromium檢查皆最終通過，GM保留121斷言；初輪失敗未隱藏。詳[證據README](evidence/equipment-g17/README.md)與逐命令結果為準。最終main SHA及Actions須於提交後按實際結果查核，不沿用舊SHA。實體iPhone／Android／Safari與熱／記憶體長測未做，本批不製作角色素材或動畫。
