# G033｜星際邊疆 → 遠征補給線｜裝備概念設計

<!-- formal-equipment:start -->
## A. 正式身份（此區由工具維護）
- 套裝 ID：`g033`；紀元：銀河紀元（`galaxy`）
- 正式區域／Boss／階數：星際邊疆 → 遠征補給線
- 對應等級：Lv.161～165（區域範圍）
- 永久來源鍵：`galaxy:frontier:map:2`

| 槽位 | 正式中文名稱 |
| --- | --- |
| weapon（武器） | 遠征切割刃 |
| helmet（頭盔） | 補給戰盔 |
| armor（鎧甲） | 遠征防護甲 |
| shoes（鞋子） | 航線推進靴 |
| accessory（飾品） | 補給調度模組 |

程式資料來源：
- `worldmaps-frontier.js:5` — `REGION_MAPS[2].gear`
- `data.js:13` — `WORLD_REGIONS / registerRegionMaps`
- `engine.js:132` — `makeItem / MAPS[mapIdx].gear`

狀態：notes 已建立；概念圖 `pass-with-advisory`；概念審查通過 `true`；審查模式 `codex-single-stage`；2.5D素材製作資格 `true`；2.5D素材 `not-started`；GM `not-tested`；正式發布允許 `false`；模型 `not-started`。

<!-- formal-equipment:end -->

## B. G07 已實作美術方向

- 正式身份與五槽名稱見 A 節；圖中數字只作槽位對照，不是名稱 owner。
- 主輪廓與配色：灰白／黃；窄肩輕甲、胸前四格補給盒、封閉大面罩、流線推進靴、六角中心三向黃板調度節點；黃刃工具直劍。
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
- Codex schema4 單階段；blocker=0；調度節點在五槽圖有正背兩個獨立繪製視角，局部板片厚度與三視略異；三視握劍手朝向差異不影響主體辨識。
