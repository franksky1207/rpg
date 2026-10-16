# G19｜G091～G095 五套十張概念圖驗收

完成日期：2026-10-17（Asia/Taipei；執行UTC日期2026-10-16）。同步並完整checkout之基準GitHub main：`1dc5a1a58f31784588e35f7a955a1ea307ebd572`。

本批是原正式第28批內的小批次G19，不是正式第19批。正式owner：worldmaps-galactic-unification.js REGION_MAPS[0..4]、data.js固定MAPS[90..94]、engine.js makeItem五槽順序。210套／1,050槽正式身份與名稱未變。

| ID／正式區域 | 五槽（武器／頭盔／鎧甲／鞋子／背部飾品） | 圖片與來源／審查 |
| --- | --- | --- |
| G091 銀河統合戰爭 → 銀河聯盟前線 | 聯盟星河刃／文明聯軍盔／銀河聯軍甲／星海聯軍靴／銀河聯盟權印 | [三視](../development/3d-source/equipment/concepts/galaxy/g091-galactic-alliance-front/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g091-galactic-alliance-front/equipment-five-slots.webp) · [PNG／SHA](../development/3d-source/equipment/concepts/galaxy/g091-galactic-alliance-front/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g091-galactic-alliance-front/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g091-galactic-alliance-front/codex-review.md) |
| G092 銀河統合戰爭 → 文明聯軍戰區 | 文明聯軍刃／聯軍統帥盔／文明聯戰甲／聯軍突進靴／文明聯軍戰略節點 | [三視](../development/3d-source/equipment/concepts/galaxy/g092-allied-civilizations/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g092-allied-civilizations/equipment-five-slots.webp) · [PNG／SHA](../development/3d-source/equipment/concepts/galaxy/g092-allied-civilizations/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g092-allied-civilizations/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g092-allied-civilizations/codex-review.md) |
| G093 銀河統合戰爭 → 星海統御疆域 | 星海霸權刃／霸權主冠盔／星海領域甲／霸權相位靴／星海統御權柄 | [三視](../development/3d-source/equipment/concepts/galaxy/g093-stellar-dominion/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g093-stellar-dominion/equipment-five-slots.webp) · [PNG／SHA](../development/3d-source/equipment/concepts/galaxy/g093-stellar-dominion/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g093-stellar-dominion/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g093-stellar-dominion/codex-review.md) |
| G094 銀河統合戰爭 → 銀河統合要塞 | 統合斷星刃／銀河要塞盔／統合防衛甲／要塞機動靴／銀河要塞權限 | [三視](../development/3d-source/equipment/concepts/galaxy/g094-unification-fortress/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g094-unification-fortress/equipment-five-slots.webp) · [PNG／SHA](../development/3d-source/equipment/concepts/galaxy/g094-unification-fortress/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g094-unification-fortress/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g094-unification-fortress/codex-review.md) |
| G095 銀河統合戰爭 → 銀河統合議政區 | 議會星河刃／統合議政冠／議會統御甲／議會相位靴／統合議會中樞 | [三視](../development/3d-source/equipment/concepts/galaxy/g095-unification-council/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g095-unification-council/equipment-five-slots.webp) · [PNG／SHA](../development/3d-source/equipment/concepts/galaxy/g095-unification-council/sources/generation.json) · [schema4](../development/3d-source/equipment/concepts/galaxy/g095-unification-council/review-2_5d.json) · [目視](../development/3d-source/equipment/concepts/galaxy/g095-unification-council/codex-review.md) |

十次實際獨立OpenAI image_gen.imagegen呼叫。每套先目視三視原圖，再以本套原PNG唯一參考另次獨立繪製五槽；沒有裁切、拼貼、舊圖換色或鏡射。十原PNG逐位元組保存，十WebP僅Pillow RGB quality=92 method=6編碼，全部1536×1024完整解碼；prompt、工具路徑、原稿／WebP bytes與SHA、參考SHA與權利依據存入逐套sources/generation.json。

已目視全部原圖及288×192正式WebP縮圖，五套分別為藍白雙翼六角背印、橙黑單脊非對稱Y節點、紫金月肩菱核、橄欖方堡三燈背板、白紅拱冠七牌議政。全遮臉、頭鞋完整、刀劍主體及獨立鞋／背飾可辨。每套schema4、equipment-2.5d-v3.0、僅一筆Codex stage，blocker=0，各一條實際局部視角／接縫advisory，無新增接受例外。完整六欄identity、五checks、source／evidence SHA及fingerprint由原驗證器核驗；索引由generate推導，不手改批准。

## G17硬前提前置驗證

先git fetch、切換main並ff-only到上述SHA後，重新定位G081～G085目錄，十張sources/overview-original.png及slots-original.png全部實體可讀、Pillow PNG驗證通過，逐一重新計算SHA-256並與各generation.json originalSha256符合。見[g17-png-verification.json](evidence/equipment-g19/g17-png-verification.json)。沒有重生或覆寫歷史PNG。

**在開始本批生圖前**已實際補跑：概念unittest 128項全通過、Runtime 99命令最終全通過、保護／發布20命令全通過。涵蓋完整舊SHA鎖、原先受阻的3項Runtime及builder／audit／隔離等檢查。Chromium首輪與重跑均保留log；前置瀏覽器9命令最終全通過，部分瀏覽器最後補跑與本批生圖期間重疊，沒有將當時尚在執行的項目寫成通過。

初次git fetch在無額外網路的shell因proxy:8080不可達而失敗；以執行器支援的network enabled正常代理路徑成功，沒有繞過代理。Runtime首輪51命令因Playwright預設headless-shell不存在而失敗，使用既有system-chromium preloader及環境Chromium後全部通過。三項瀏覽器首輪因預設4188／4189未提供server而ERR_CONNECTION_REFUSED，設定正式支援的RUNTIME_SMOKE_URL到4173發布stage後重跑通過。所有原失敗log保留，無刪斷言、延長正式戰鬥或修改遊戲。

## 歷史與發布保護

新增G001～G090全712檔SHA回歸鎖，實際本機逐檔核對；包括notes、PNG、WebP、來源、schema3／schema4與G024／G030接受例外，原有全部鎖保留。原G007舊3D、正式owner及存檔未動。索引前90筆與G096以後逐筆保持基準相同；只變G091～G095五筆，未生成安全負例移到G096，錯身份／SHA／來源／假批准與里程碑斷言維持。新增G19四項素材／完整歷史／索引／隔離測試及一項批次完成測試，不放寬原安全門檻。入庫後角色管線17項首輪有1項因仍用已製作G091當未製作負例而失敗；僅將該負例移至G096，原verified concept阻擋斷言不變，重跑17項全通過，初輪log保留。

入庫後generate／validate、G19完成、G20十圖缺失、G024／G030接受例外及generate無追蹤漂移，與完整概念unittest 133項全通過、保護／發布20命令最終全通過及相關Runtime4命令全通過結果，均見[本機驗證證據](evidence/equipment-g19/README.md)及逐命令實際exitCode。完整builder／audit使用已加入Git索引的新圖檔，確認development概念source不進發布。未改JS／CSS，無需cache-bust。

累計95／210套、190／420張；剩115套230張。下一批仍為G20＝G096～G100，未提前製作。G19角色素材not-started、GM not-tested、formalReleaseAllowed=false；前述GM瀏覽器測試只驗既有三套，不能當G19角色驗收。本次沒有開始第29～40批，也沒有把概念圖完成誤寫成角色、GM或正式發布完成。iPhone／Android／Safari、真帳號雲端及熱／記憶體長測未執行。

最終提交SHA之GitHub Actions於push後實查；本文不預告CI成功、不引用舊SHA。最終回覆列出該SHA實際success／failure／pending／not triggered／blocked結果。
