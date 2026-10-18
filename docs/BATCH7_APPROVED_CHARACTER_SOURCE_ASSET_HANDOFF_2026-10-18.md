# 第7批正式來源交接（高維v2替換）

> **高維正式替換 v2**：無披風、無星環、無漂浮星體；舊高維補圖與分層要求全部失效。只需完整角色、無武器身體、獨立武器。三張來源已保存，透明 Alpha／持劍手遮擋未允收；不得宣稱第7批完成。詳見 [新版替換報告](BATCH7_HIGHER_V2_REPLACEMENT_REVIEW_2026-10-18.md)。

沿用 PR #38／batch7-era-player-sprite-20261018。銀河與宇宙母圖、分層補圖原檔及其 SHA 不變；高維只用本次 replacement-pack/manifest.json 所列三張 PNG。

- approved-sources/manifest.json 是目前三紀元母圖索引。
- layer-sources/manifest.json 是目前六張身體／武器來源索引。
- replacement-pack/manifest.json 與 README.txt 逐 byte 保留附件原始記錄。
- source-history.json 保留原始來源 manifest，不是有效素材索引；舊高維二進位已移除，僅 Git 歷史可追溯。
- higher-v2-removal-record.json 列出刪除路徑與撤銷規則。

精準去背不得破壞白金甲與光效；原始PNG不覆寫。先以原座標核對完整圖、身體與獨立武器，核定握點與前後手遮擋，才可輸出512×512透明WebP並接現役 SpritePool／WholeSuitActor／Presenter／GM。不得以候選切圖冒充六動作。

三紀元來源身份、轉生外觀偏好、帳號隔離、Save Schema17及五槽數值保護維持現有契約。新素材未允收前，正式Renderer、GM、資源快取與Pages不發布候選；第8批及Issue #37不在施工範圍。
