# G08｜G036～G040 概念圖量產驗收

日期：2026-10-15；基準 main：`abd2ca22e3d3fb3d450fd1afaf8e8a4ec4accff6`。

## 正式身份與實機查看清單

各連結可直接查看；不需逐套批准。正式 owner：worldmaps-frontier.js、data.js、engine.js。每套兩張獨立1536×1024真WebP，原始PNG未修改保留。

| ID／區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- |
| G036 星際邊疆 → 外文明接觸區 | 異域共振刃／異文明觀測盔／跨種族防護甲／外交機動靴／文明翻譯模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g036-alien-contact/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g036-alien-contact/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g036-alien-contact/review-2_5d.json) · [實際觀察](../development/3d-source/equipment/concepts/galaxy/g036-alien-contact/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g036-alien-contact/sources/generation.json) |
| G037 星際邊疆 → 邊疆工業星 | 工業震裂刃／重工戰盔／重工強化甲／磁軌作業靴／工業控制器 | [三視](../development/3d-source/equipment/concepts/galaxy/g037-frontier-industry/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g037-frontier-industry/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g037-frontier-industry/review-2_5d.json) · [實際觀察](../development/3d-source/equipment/concepts/galaxy/g037-frontier-industry/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g037-frontier-industry/sources/generation.json) |
| G038 星際邊疆 → 遠域軍閥領地 | 軍閥戰刃／領主禁衛盔／遠域主戰甲／軍閥突襲靴／軍閥指揮權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g038-distant-warlords/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g038-distant-warlords/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g038-distant-warlords/review-2_5d.json) · [實際觀察](../development/3d-source/equipment/concepts/galaxy/g038-distant-warlords/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g038-distant-warlords/sources/generation.json) |
| G039 星際邊疆 → 星際難民航路 | 航路衛刃／難民艦戰盔／長航生存甲／遠航推進靴／航路導航標 | [三視](../development/3d-source/equipment/concepts/galaxy/g039-refugee-route/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g039-refugee-route/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g039-refugee-route/review-2_5d.json) · [實際觀察](../development/3d-source/equipment/concepts/galaxy/g039-refugee-route/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g039-refugee-route/sources/generation.json) |
| G040 星際邊疆 → 邊疆霸權戰場 | 邊疆霸主刃／遠征主控盔／邊疆霸權甲／霸權突進靴／邊疆統帥權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g040-frontier-hegemony/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g040-frontier-hegemony/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g040-frontier-hegemony/review-2_5d.json) · [實際觀察](../development/3d-source/equipment/concepts/galaxy/g040-frontier-hegemony/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g040-frontier-hegemony/sources/generation.json) |

## 製作、審查與狀態

- 十次實際 OpenAI image_gen.imagegen 呼叫；每套先生成三視，目視後以原稿為參考另次繪製五槽。未裁切、重排、換色或填充冒充獨立生成。
- `sources/overview-original.png`、`sources/slots-original.png` 保留工具原始位元組；`sources/generation.json` 記錄真實工具路徑、PNG／WebP SHA-256、bytes、尺寸及參考關係。WebP沿G07以Pillow RGB quality=92 method=6原尺寸編碼。
- 依使用者授權及適用OpenAI服務條款使用生成輸出，僅開發概念；無外部庫圖或CC／公有領域／獨占權宣稱。
- 逐張目視完整圖及288×192縮圖（人物約170px）；異文明卵盔環飾、重工箱甲、軍閥冠裙甲、長航軟甲導航標、霸權橫翼甲的主要輪廓可辨。非實體手機遊戲驗收。
- 五筆schema4，各僅一筆Codex stage，綁定正式身份、五槽、兩圖SHA、固定政策SHA、來源授權、逐項觀察及證據fingerprint；驗證器批准、blocker=0。角度／裝飾／鞋多角度展示差異如實列advisory。
- 概念完成不代表角色素材完成；五套asset2_5dStatus=not-started、GM=not-tested、formalReleaseAllowed=false。未改正式JS/CSS、戰鬥、存檔、GM流程、文字／極簡／背景／音效及介面。

## 本機驗證

全套 `python3 -m unittest discover -s tests/equipment-concepts -v` 最終79項通過。首次78項執行僅批准ID基準仍停在35套而失敗，已更新至40套並全套重跑；未降低斷言或改動歷史SHA。

- generate／validate、G08 plan／全庫status：40套批准、80圖、170套未製作；G08 approvedSets=5、imagesPresent=10、imagesMissing=0。重跑generate changedFiles=0。
- 新G08測試驗證十張PNG／WebP完整解碼、1536×1024、bytes與SHA、十張各自唯一、schema4、來源參考關係及素材／GM／發布狀態；既有負向案例改用真正未製作的G041，沒有放寬驗證標準。
- G001～G035索引紀錄完全相同；217個歷史檔（含巢狀原稿、schema3／4與G024／G030例外）逐SHA核對不變，新增g001-g035-sha256.json回歸鎖。G041與其餘170套資料未動。
- 角色素材17項Python、角色／GM／正式／武器37項Node測試通過；真Chromium三套角色×五動作、128px raster、切換／取消／快取／SHA及404回退通過。角色、武器原始SHA、GM／正式發布manifest、formal fixture歷史、phase6依賴、正式發布、刀劍命名／60原圖、GM發布、T4隔離、正式owner clock及controller契約全通過。
- publish-asset-audit hardMissing=[]；build-publish-dry-run：missingRefs=0。本批45個概念圖／原稿／證據及notes檔全部排除於發布包，沒有擅加Pages或SW。
- 本機Git proxy及Node子程序需在核准既有環境執行；未更換憑證或繞過網路政策。

## GitHub與待補

推送後依該最終commit實際觸發的Actions核對；本文件不預告遠端成功。最終SHA、各CI狀態與連結由任務完成回報提供。角色／武器透明層、GM實機及正式發布不在本批；G041未製作。
