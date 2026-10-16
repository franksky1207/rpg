# G18｜G086～G090 五套十張概念圖驗收

批次日期：2026-10-16；執行跨2026-10-16～17（Asia/Taipei）。基準GitHub main：`a81f2f3d5a95dbbcfa7cd33c7d59be5c290eb54d`。

正式owner：worldmaps-core-war.js REGION_MAPS[5..9]、data.js固定MAPS[85..89]、engine.js makeItem五槽順序；210套／1,050槽身份與名稱不變。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／背部飾品） | 圖片與證據 |
| --- | --- | --- |
| G086 銀河核心戰爭 → 銀河禁衛領域 | 禁衛鎮界刃／銀河禁衛冠／禁衛主戰甲／銀河相位靴／禁衛權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g086-galactic-royal-guard/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g086-galactic-royal-guard/equipment-five-slots.webp) · [原PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g086-galactic-royal-guard/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g086-galactic-royal-guard/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g086-galactic-royal-guard/codex-review.md) |
| G087 銀河核心戰爭 → 星河裁決區 | 星河裁決刃／裁決官冠盔／星河審判甲／裁決追跡靴／星河裁決權柄 | [三視](../development/3d-source/equipment/concepts/galaxy/g087-stellar-judgment/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g087-stellar-judgment/equipment-five-slots.webp) · [原PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g087-stellar-judgment/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g087-stellar-judgment/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g087-stellar-judgment/codex-review.md) |
| G088 銀河核心戰爭 → 銀河核心王座區 | 王權星刃／核心王冠盔／王座統御甲／王權相位靴／銀河王座權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g088-galactic-core-throne/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g088-galactic-core-throne/equipment-five-slots.webp) · [原PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g088-galactic-core-throne/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g088-galactic-core-throne/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g088-galactic-core-throne/codex-review.md) |
| G089 銀河核心戰爭 → 星河霸權決戰線 | 霸權斷界刃／星河統御盔／星河征服甲／霸權征途靴／星河霸權權柄 | [三視](../development/3d-source/equipment/concepts/galaxy/g089-stellar-final-front/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g089-stellar-final-front/equipment-five-slots.webp) · [原PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g089-stellar-final-front/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g089-stellar-final-front/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g089-stellar-final-front/codex-review.md) |
| G090 銀河核心戰爭 → 銀河核心王戰區 | 核心王戰刃／銀河主控盔／核心終戰甲／王座決戰靴／銀河核心權柄 | [三視](../development/3d-source/equipment/concepts/galaxy/g090-core-king-battle/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g090-core-king-battle/equipment-five-slots.webp) · [原PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g090-core-king-battle/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g090-core-king-battle/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g090-core-king-battle/codex-review.md) |

十次實際OpenAI image_gen.imagegen；每套先生成並目視三視，再以本套原PNG參考另次獨立生成五槽。十原PNG逐位元組保存、十WebP以Pillow RGB quality=92 method=6轉檔，全部1536×1024完整解碼；逐檔bytes、SHA、prompt、工具路徑、參考SHA及使用者授權／適用服務條款依據存入正式目錄。沒有裁切冒充、幾何佔位、前批複製或換色。20個遠端blob的Git SHA已逐一對照本機相符。

逐張原圖及288×192 WebP縮圖目視完成：綠鉑圓盾冠印、白金階肩雙懸牌、紫金扇冠三拱、紅黑非對稱重肩側旗、黑銀柱盔雙環。全遮臉、頭鞋完整，刀劍、鞋頭鞋底及獨立背飾可辨。每套在notes記錄設計卡、與G081～G085及本批差異、實際生成偏差與後續右向3/4交接。局部視角、護手、甲縫、腿鞋分界及背環邊數列advisory，不假稱工程拆件一致。

五筆schema4、equipment-2.5d-v3.0、單一Codex stage；blocker=0，各一條advisory，無新增接受例外。現行驗證器核對完整身份、圖片／policy／source／evidence SHA及fingerprint；索引由generate推導，重跑changedFiles=0，非手改批准狀態。

G001～G085新增667檔SHA回歸鎖；657檔本機實際核對，G17十原PNG因連線／工具限制無法在本機取得，SHA沿用既有SHA-bound來源宣告且遠端blob不變，完整位元組檢查交由最終SHA CI。舊鎖、G024/G030接受例外、schema3／4及G007舊3D保留。G086已製作，未生成安全負例移到確定未製作的G091，錯身份、錯SHA、假批准與里程碑斷言仍保留。G17高維副本同次瀏覽器取樣修正及原斷言未動，未延長戰鬥。

本機完整概念首輪127項有2項因缺歷史PNG而error，其餘125項通過；新增G17批次保存正例另通過，合計128項覆蓋。本機Runtime、保護／發布、真Chromium各命令的初輪及重跑結果見[本機證據](evidence/equipment-g18/README.md)。環境失敗均保留，沒有將無法執行項冒稱通過。瀏覽器使用當前source伺服器；本機完整發布builder／audit被缺歷史source阻擋，正式stage與完整SHA鎖須由完整checkout的最終main CI實跑查核。

累計90／210套、180／420張；剩120套240張。下一批G19＝G091～G095僅身份／notes與規劃準備好，尚未製圖。asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。原正式第28批仍進行中，第29～40批未因此開始；未改正式玩法、Runtime、音訊、存檔或發布開關。實體iPhone／Android／Safari及熱／記憶體長測未做。

最終main SHA與Actions於提交後逐項實查；本文不預告CI成功，不沿用任何舊SHA。最終回覆提供該SHA實際success／failure／pending／未觸發／無法查證結果。
