# g082 Codex單階段目視審查

2026-10-16（Asia/Taipei日期）；codex-single-stage。

- `overview-front-side-back.webp` SHA-256 `6fa6783d1e538dcf1beb34cd1002ac4b7eb172cb479501f9c2bb899a2cac249c`
- `equipment-five-slots.webp` SHA-256 `3d85e61b1c8df51b5f0d34498945f335fbe7ff9741cf133ea2209471ee54b8b9`

## officialIdentity

g082 核對main 553aa5583f5cea8e93260ae4fada1ed79d1b07c0 的worldmaps-core-war.js REGION_MAPS[1]、data.js MAPS[81]固定註冊、engine.js makeItem五槽、正式索引與notes。galaxy:core-war:map:1；銀河核心戰爭 → 恆星兵器陣列；五槽：恆星灼刃／日核戰盔／恆星防護甲／光壓推進靴／恆星兵器節點。完整六欄與永久映射未改。

## imageIntegrity

g082 兩次實際獨立image_gen生成，十圖逐份原PNG保存；本套兩PNG及兩WebP經Pillow load完整解碼，皆1536×1024，bytes與SHA逐檔計算。WebP僅RGB quality=92 method=6轉檔，非裁切、複製或舊圖換色。

## contentIdentity

g082 已逐張目視實際三視與五槽原圖：白銅圓盔黑面、蜂巢肩與圓核橢胸、外張散熱腿板、彎身琥珀單刃、雙踝推進厚底鞋、日核放射散熱背節點。正側背頭鞋完整、頭盔全遮臉，刀劍與主要配色一致；背面能看見背飾。五槽具獨立武器、頭盔、鎧甲、帶鞋頭鞋底的成對鞋子及背飾，兩圖主要結構一致。與前批及其他四套有結構差異。

## characterReadability

g082 已逐張目視兩張實際WebP的288×192縮圖：白銅圓盔黑面、蜂巢肩與圓核橢胸、外張散熱腿板、彎身琥珀單刃、雙踝推進厚底鞋、日核放射散熱背節點。刀劍、頭肩胸腿及背飾仍可辨識，五槽能分出鞋子與腿甲。此為概念板縮圖檢查，非正式透明角色、GM或實體手機驗收。

## provenanceLicense

g082 本任務實際呼叫OpenAI image_gen.imagegen兩次；先生成並目視三視，再參考本套原PNG獨立繪製五槽。使用者授權本專案在本次Codex任務以可用OpenAI image_gen.imagegen生成；依適用服務條款使用輸出，僅開發概念。無外部庫圖、第三方角色參考；不宣稱CC、公有領域或獨占授權。 prompt、工具路徑、PNG與WebP SHA及參考鏈見sources/generation.json；原稿與輸出皆只存development。

## advisory

散熱片開合與接縫在視角間有微差，五槽另示鞋底與甲片；主要蜂巢肩、圓核與放射背飾一致，生成小字不作正式命名。

Blocker=0；pass-with-advisory。asset2_5dStatus=not-started、gm2_5dTestStatus=not-tested、formalReleaseAllowed=false。概念批准不代表角色、武器動畫或GM完成。
