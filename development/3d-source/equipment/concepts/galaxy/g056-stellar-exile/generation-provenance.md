# g056 真實生成來源

基準 main：89738447f133ce8497731ee5e9cddd63d66328a7；生成及檢查日期：2026-10-15 UTC。

本任務兩次實際呼叫 OpenAI image_gen.imagegen。先獨立生成三視，使用view_image目視本套原始PNG後，再以該PNG作referenced_image_paths另次繪製五槽。未用裁切、換色、舊圖複製或程式佔位。

正式區域：銀河邊境 → 星海流亡區；sourceKey：galaxy:galactic-frontier:map:5。
五槽：流亡星刃／漂泊者戰盔／星海生存甲／遠漂躍遷靴／流亡航標。

設計：深青砂色生存甲、兜帽全罩盔、破損半披布、青色彎刃、躍遷靴及雙菱形高桅航標。

原稿位元組及工具輸出路徑、PNG與WebP尺寸／bytes／SHA、參考關係見 sources/generation.json；Pillow RGB WebP quality=92 method=6，1536×1024原尺寸，無縮放、拼貼或補邊。實際WebP在288×192縮圖目視，並非遊戲內或實體手機驗收。

權利依據：使用者授權本專案透過本任務可用 OpenAI image_gen.imagegen 生成，依適用服務條款使用輸出，僅開發概念；無外部庫圖或第三方角色參考，未宣稱CC、公有領域或獨占授權。

- overview: 原PNG `/workspace/generated_images/exec-ed88bf91-6af3-4a83-b074-09d3fd6a5c3d.png` SHA `4992d30fac8f3495d1882c257dc3cade466d963c1d83e8efa05a450ef2e780a4`；WebP `overview-front-side-back.webp` SHA `0e0a03e8623e43e579c4557cf6fef0f094afa0fd3542ade0e1d4a59172597a3f`；參考原PNG SHA `None`。
- slots: 原PNG `/workspace/generated_images/exec-c2ad8e7a-f38b-4449-be47-7e60af603da4.png` SHA `f4d66c4e8ac568617005df46c9f5a8fd3facb8a367933027ddb32aecc46d9771`；WebP `equipment-five-slots.webp` SHA `e60a59d760a5904474a50ec14504ded501c0311ebf17b638a9e9f7cad19e9a52`；參考原PNG SHA `4992d30fac8f3495d1882c257dc3cade466d963c1d83e8efa05a450ef2e780a4`。
