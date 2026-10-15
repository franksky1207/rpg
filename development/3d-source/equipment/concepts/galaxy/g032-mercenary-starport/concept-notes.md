# G032｜星際邊疆 → 星際傭兵港｜裝備概念設計

<!-- formal-equipment:start -->
## A. 正式身份（此區由工具維護）
- 套裝 ID：`g032`；紀元：銀河紀元（`galaxy`）
- 正式區域／Boss／階數：星際邊疆 → 星際傭兵港
- 對應等級：Lv.156～160（區域範圍）
- 永久來源鍵：`galaxy:frontier:map:1`

| 槽位 | 正式中文名稱 |
| --- | --- |
| weapon（武器） | 傭兵脈衝刃 |
| helmet（頭盔） | 私軍戰盔 |
| armor（鎧甲） | 雇傭重甲 |
| shoes（鞋子） | 星港突進靴 |
| accessory（飾品） | 傭兵識別牌 |

程式資料來源：
- `worldmaps-frontier.js:4` — `REGION_MAPS[1].gear`
- `data.js:13` — `WORLD_REGIONS / registerRegionMaps`
- `engine.js:132` — `makeItem / MAPS[mapIdx].gear`

狀態：notes 已建立；概念圖 `pass-with-advisory`；概念審查通過 `true`；審查模式 `codex-single-stage`；2.5D素材製作資格 `true`；2.5D素材 `not-started`；GM `not-tested`；正式發布允許 `false`；模型 `not-started`。

<!-- formal-equipment:end -->

## B. G07 已實作美術方向

- 正式身份與五槽名稱見 A 節；圖中數字只作槽位對照，不是名稱 owner。
- 主輪廓與配色：鐵黑／橙；左大右小非對稱重肩、厚分層胸甲、橙窄視窗、厚靴、三橙條大型背部識別牌；橙能量單手短厚刃。
- 刀劍以單手持握、劍尖向外預留共用突刺；三視手部微差見 advisory。
- 後續透明角色鏡位：右向 3/4，全身入框，保留頭盔／肩甲／背飾的本套輪廓。角色及武器分層尚未製作。
- 兩張獨立真生成作品、原始 PNG、來源 SHA、授權用途及單次審查見 generation-provenance.md、sources/generation.json、codex-review.md、review-2_5d.json。

## C. 製作與發布邊界

- 依現行 2.5D SOP，概念階段不要求五個 GLB、53 骨或工程級拆件。
- 武器僅刀劍／能量刃、頭臉全遮蔽、鞋成對；局部視角差異作 advisory。
- 僅開發概念，不加入 Pages、Service Worker 或正式發布名單。既有遊戲、存檔、GM、音訊及舊 3D 不改。

## D. 圖片與審查

- overview-front-side-back.webp：正面、側面、背面完整角色。
- equipment-five-slots.webp：另次獨立繪製五槽單品。
- 兩張均 1536×1024；詳細 bytes／SHA 在索引與 generation.json。
- Codex schema4 單階段；blocker=0；背面識別牌採放大造型以利小尺寸辨識；三視護板磨耗與手部朝向略異，屬局部視角差異。
