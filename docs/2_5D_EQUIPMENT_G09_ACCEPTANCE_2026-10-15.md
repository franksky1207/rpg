# G09｜G041～G045 概念圖量產驗收

日期：2026-10-15；基準 main：`1c00f711feb897772dad671cdfc73b3aafa461ea`。

## 正式身份與查看清單

正式來源為 `worldmaps-orion.js` 的 REGION_MAPS[0..4]、`data.js` 的固定註冊及 `engine.js` 的五槽makeItem映射；對應210套第41～45位、MAPS[40..44]。名稱逐字對照正式索引、identity ledger與逐套notes開工卡，未更改任何正式名稱。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／飾品） | 圖片、審查及來源 |
| --- | --- | --- |
| G041 獵戶臂戰爭 → 獵戶臂前線 | 獵戶星刃／旋臂戰盔／星區主戰甲／獵戶躍遷靴／旋臂導航標 | [三視](../development/3d-source/equipment/concepts/galaxy/g041-orion-front/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g041-orion-front/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g041-orion-front/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g041-orion-front/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g041-orion-front/sources/generation.json) |
| G042 獵戶臂戰爭 → 星門防衛區 | 星門切割刃／門衛戰盔／星門防護甲／空間穿越靴／星門控制節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g042-stargate-defense/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g042-stargate-defense/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g042-stargate-defense/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g042-stargate-defense/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g042-stargate-defense/sources/generation.json) |
| G043 獵戶臂戰爭 → 跨星航道 | 航道裂光刃／跨星導航盔／航路複合甲／超光速推進靴／跨星座標核 | [三視](../development/3d-source/equipment/concepts/galaxy/g043-interstellar-route/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g043-interstellar-route/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g043-interstellar-route/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g043-interstellar-route/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g043-interstellar-route/sources/generation.json) |
| G044 獵戶臂戰爭 → 文明邊境線 | 文明戰刃／邊境冠盔／文明防衛甲／星區機動靴／文明識別印 | [三視](../development/3d-source/equipment/concepts/galaxy/g044-civilization-border/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g044-civilization-border/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g044-civilization-border/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g044-civilization-border/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g044-civilization-border/sources/generation.json) |
| G045 獵戶臂戰爭 → 獵戶臂殖民群 | 群星環切刃／殖民群戰盔／群星防護甲／群域推進靴／殖民群調度節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g045-orion-colonies/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g045-orion-colonies/equipment-five-slots.webp) · [schema4](../development/3d-source/equipment/concepts/galaxy/g045-orion-colonies/review-2_5d.json) · [目視證據](../development/3d-source/equipment/concepts/galaxy/g045-orion-colonies/codex-review.md) · [來源SHA](../development/3d-source/equipment/concepts/galaxy/g045-orion-colonies/sources/generation.json) |

## 真實生成與單階段審查

- 本任務十次實際 `OpenAI image_gen.imagegen` 呼叫，每套先生成並目視三視，再參考該套三視另次獨立繪製五槽。未使用既有套裝裁切、複製、換色、重排或佔位圖。
- 每張1536×1024。`sources/overview-original.png`、`sources/slots-original.png`保留工具原始PNG位元組。`sources/generation.json`記錄工具輸出路徑、原稿／WebP SHA-256、bytes、尺寸、參考SHA、設計摘要與權利依據；`generation-provenance.md`提供來源聲明。
- 沿用G08以Pillow RGB WebP quality=92 method=6原尺寸編碼，沒有裁切、補邊或重排。原PNG和WebP皆完整解碼，十張原稿與十張WebP分別SHA唯一。
- 權利依據為使用者授權本專案透過可用OpenAI工具生成並依適用服務條款使用輸出，僅開發概念；無外部庫圖、第三方角色參考或CC／公有領域／獨占授權宣稱。
- 逐張完整圖與288×192縮圖目視（角色約170px高）。G041雙翼盔／旋臂圓盤、G042門框甲／方核、G043流線甲／環架座標核、G044冠盔／六角識別印、G045圓頂盔／三聯節點可分辨。所有武器均刀劍／能量刃。
- 五筆schema4均僅一筆真實Codex stage；綁定正式身份、五槽、兩圖SHA、政策SHA、來源與證據SHA及fingerprint，正式驗證器通過，blocker=0。G042劍旁列、鞋子角度、背飾接點或多角度細部差異如實記advisory，未追加AAA或工程級美術門檻。
- 五套角色／武器素材仍not-started，GM not-tested，formalReleaseAllowed=false。概念批准不代表素材完成；未修改正式戰鬥畫面、手機資訊框、固定站位、攻擊動畫、公式、存檔、文字／極簡／背景、音訊或GM流程。

## 程式自我檢查

- `equipment-concepts.py generate`／`validate`：210套、1,050槽、45套批准、90圖、165套未製作；重跑generate changedFiles=0。
- G09 plan／status：approvedSets=5、imagesPresent=10、imagesMissing=0。批准後plan不再輸出缺圖開工項，status保留明確計數。
- 新增G09測試驗證真PNG／WebP完整解碼、尺寸／bytes／SHA、獨立性、來源參考鏈、schema4及素材／GM／發布狀態；G046負向案例保留原安全斷言。
- 新增G001～G040歷史262檔SHA鎖；檢查歷史索引前40套與G046以後165套逐筆等同基準。既有G07／G08鎖與原schema3／4、G024／G030接受例外均未改。
- 概念資料庫完整unittest **83項通過**（含schema4錯誤／篡改／來源負向案例）；角色素材Python **17項通過**，角色／GM／正式／武器Node **4個測試檔全部通過**。
- 真Chromium角色測試通過：三套既有角色×五動作、128px raster、切換／取消／快取、SHA／404回退。原角色／武器SHA、GM／正式發布manifest、formal fixture歷史、phase6依賴、武器身份與舊60圖、GM發布、T4隔離、正式owner clock及controller契約均通過。
- staged發布資產稽核 hardMissing=[]，build-publish-dry-run missingRefs=0；本批45個概念／原PNG／證據／notes檔全部列excluded且未出現在發布目錄。重建與瀏覽器測試依序執行，防止測試中途重建目錄。
- 本機初次Git／Node子程序因環境限制失敗，使用既有環境核准執行後通過；GM首次啟動遇Chromium代理CA不受信任，僅於本機測試以正常TLS驗證下載同一份公開SDK並載入，沒有關閉TLS驗證、改正式程式或放寬測試。初次武器瀏覽器測試與發布重建並行而缺少測試依賴，改為完成staging後依序重跑。GM最終重跑桌機／直向／橫向121項斷言通過。武器三viewport、正式戰鬥三viewport、none／unknown／404／SHA／decode／slow與武器對應故障、生命週期、高維review及虛空／鏡像副本最終全部通過。288組武器時序權威差值0ms。未放寬任何斷言。

完整本機命令結果及摘要見 [G09證據目錄](evidence/equipment-g09/)。

## GitHub與待補

本任務驗證後直接推送main。最終SHA與Actions以推送後該提交實際執行結果為準，不引用舊SHA成功。真實手機／遊戲內G09驗收、透明角色、GM與正式戰鬥發布均未完成，且不在本批範圍。G046未製作。

## 首次推送CI與必要修正

首次提交 `e1a16ba417e9a667667ac5cea4f8b5cffdbd0b8c`：

- [Equipment Concept Database 38754428155](https://github.com/franksky1207/rpg/actions/runs/38754428155) 的83項中82項通過，新G09歷史索引測試因checkout預設fetch-depth=1而無法git show固定G08基準。將此workflow checkout明確設為fetch-depth=0，與既有GM／Formal歷史驗證做法一致。保留原測試與全部205筆歷史／未製作索引逐筆比較，不改SHA鎖、不跳過檢查。補跑G09三項測試及validate／generate通過，最終SHA須再查完整CI。
- [GM Integration 38754428166](https://github.com/franksky1207/rpg/actions/runs/38754428166/attempts/1) 先前來源驗證及前段互動通過，截圖前scrollIntoViewIfNeeded於browser.cjs:51遇DOM元素已脫離。本機121斷言通過，對同SHA重跑原CI；不刪斷言或修改Runtime。
- 原失敗log保存在[證據目錄](evidence/equipment-g09/)。修正只影響CI歷史取得方式及本報告，不修改十張圖片、原PNG、來源、schema4證據或政策。

### GM截圖定位修正

`488b5c0bca23ed8fc99a09786d87138ef24c1f11` 的 [GM 38755278397](https://github.com/franksky1207/rpg/actions/runs/38755278397) 在三viewport角色與還原檢查後，仍於同一截圖前顯式scrollIntoViewIfNeeded遇DOM替換。移除冗餘的獨立scroll動作，改由原Locator.screenshot內建捲動與穩定性處理；只有截圖時的DOM脫離錯誤允許最多三次重新定位，每次仍等待已完成狀態，其他錯誤立即失敗；截圖目標／路徑、121項斷言、正式／自由隔離、狀態不變、GM撤銷與SHA／缺檔檢查全保留。沒有重試整套測試以掩蓋失敗，也未修改正式UI或Runtime。原失敗log保留；已重新執行最終版本完整GM三viewport，121項斷言全部通過，log已保存；最終SHA另核對CI。
