# G16｜G076～G080 五套十張概念圖驗收

日期：2026-10-16 UTC。基準GitHub main：`c59fdd72c210c298131c5527b06ea5938a28a2dd`。

正式owner：worldmaps-core-outer.js REGION_MAPS[5..9]、data.js WORLD_REGIONS固定註冊MAPS[75..79]、engine.js makeItem五槽映射。完整210套／1,050槽與永久身份保持不變。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片及來源 |
| --- | --- | --- |
| G076 銀河核心外圍 → 核心文明邊界 | 核域斷光刃／文明冠盔／核域文明甲／核域穿行靴／核心文明權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g076-core-civilization-border/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g076-core-civilization-border/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g076-core-civilization-border/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g076-core-civilization-border/codex-review.md) · [PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g076-core-civilization-border/sources/generation.json) |
| G077 銀河核心外圍 → 黑洞防衛圈 | 黑洞戰刃／視界禁衛盔／黑洞防衛甲／引力推進靴／視界防衛節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g077-black-hole-defense/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g077-black-hole-defense/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g077-black-hole-defense/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g077-black-hole-defense/codex-review.md) · [PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g077-black-hole-defense/sources/generation.json) |
| G078 銀河核心外圍 → 奇點研究區 | 奇點解析刃／研究密封盔／實驗時空甲／相位實驗靴／奇點研究模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g078-singularity-research/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g078-singularity-research/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g078-singularity-research/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g078-singularity-research/codex-review.md) · [PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g078-singularity-research/sources/generation.json) |
| G079 銀河核心外圍 → 核心戰爭前哨 | 核心裂星刃／前哨禁衛盔／核心主戰甲／核心相位靴／核心戰術模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g079-core-war-outpost/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g079-core-war-outpost/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g079-core-war-outpost/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g079-core-war-outpost/codex-review.md) · [PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g079-core-war-outpost/sources/generation.json) |
| G080 銀河核心外圍 → 銀河核心門戶 | 核心門斷界刃／銀河門衛盔／門域重裝甲／時空穿越靴／銀河核心門鑰 | [三視](../development/3d-source/equipment/concepts/galaxy/g080-galactic-core-gateway/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g080-galactic-core-gateway/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g080-galactic-core-gateway/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g080-galactic-core-gateway/codex-review.md) · [PNG與SHA](../development/3d-source/equipment/concepts/galaxy/g080-galactic-core-gateway/sources/generation.json) |

十次實際OpenAI image_gen.imagegen：每套三視獨立生成並檢視，再參考本套原PNG另次獨立繪製五槽。沒有裁切冒充、換色或複製舊圖。十原PNG逐位元組保存；十WebP使用Pillow RGB quality=92 method=6，全部1536×1024完整解碼，尺寸／bytes／SHA／prompt／工具原路徑／參考原稿SHA及權利依據見逐套sources/generation.json。

逐張實際目視生成圖與288×192 WebP縮圖：G076紫金冠印與扇層肩裙；G077深藍銀堡壘肩與馬蹄防衛環；G078綠白研究盔與軌道實驗艙；G079灰紅平頂盔、楔胸與方形戰術背包；G080象牙青綠柱肩門框甲與直立門鑰。角色全遮臉、頭鞋完整、背飾可見，五槽獨立鞋子具腳掌鞋底，全部武器是短握柄刀劍。

五筆schema4各僅一筆Codex stage，policyVersion=equipment-2.5d-v3.0，blocker=0；局部視角、甲縫、天線開合及圖片小字列advisory。G078透明劍縮圖較淡但紫色輪廓可辨。正式名稱由owner核對，不以生成小字作權威。固定policy SHA、來源SHA、evidence SHA與fingerprint由現行驗證器核對，索引由generate推導。

新增G001～G075共577檔歷史SHA鎖，舊鎖完全保留；前75筆及G081以後130筆索引、全210筆正式六欄身份保持一致。原G024/G030例外、schema3/schema4、G007舊3D及相容檢查保留。原以G076為未生成負例的測試移至G081；未刪測試或放寬驗證，另增G16原稿與單階段來源鏈測試。

asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。累計80／210套、160／420張概念圖；剩130套260張。下一批G17＝G081～G085，未製圖。正式第28批仍進行，第29～40批未因此開始。未改正式遊戲、GM、戰鬥、背景、極簡、文字模式、音訊、存檔、雲端或發布資產。

本機驗證詳[證據README](evidence/equipment-g16/README.md)。最終main SHA及Actions於提交後按實際結果查核，不沿用舊SHA成功紀錄。角色／武器素材、GM與實機驗收不屬本批產出。

本機最終驗證通過：概念unittest 118項、角色Python17項、角色／GM／正式／武器Node37項、保護命令20項、Runtime工作流程99項命令、九項真Chromium檢查。發布稽核hardMissing=[]；歷史577檔及正式身份皆保留；generate changedFiles=0。首輪環境失敗與修正未隱藏，見證據README。
