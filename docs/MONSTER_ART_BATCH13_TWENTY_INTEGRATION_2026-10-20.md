# 第13批：20 張地圖怪物 GM 整合

## 修改內容

本批以最新 GitHub main `b6fb5632aa6928b277deb0b1df765a89aebe22e4`（PR #58）為基準。使用者明確授權匯入剩餘14圖、完整609對應及既有GM擴充；此授權覆蓋歷史文件的僅規劃／六圖限制。沒有重新製圖，沒有副本／災厄／高維十王／異宇宙製圖。

三份 ZIP 實際讀取、CRC、路徑安全與全部 SHA 清單驗證通過。14張WebP原樣匯入；原六張、原六張來源備份及歷史 runtime-lock 保留不動。14張PNG與原始交接manifest僅保存在 `development/monster-art/batch13-twenty/batch{1,2,3}/`，不加入Pages或智慧下載清單。新增部署WebP共 2,690,914 bytes；20張合計以登錄的bytes總和為準。

`data/monsters/monster-assets.json` 是20圖單一登錄；`monster-mappings.json` 是609個可追溯來源身份；`monster-variants.json` 是有限色彩濾鏡與倍率契約。`scripts/generate-monster-trial-registry.py` 確定生成共用不可變模組。歷史規劃表仍保留，`plannedAssetId` 保留原查詢；實際校訂身份使用 `findMapping`，不得把歷史規劃當實際登錄。

## 來源核對與外觀修正

`tests/runtime/batch13-monster-mappings.cjs` 執行正式十個worldmaps檔的 `registerRegionMaps` 資料、`SECOND_WORLD_BOSSES` 及 `SPECIAL_MONSTERS`，用source／region／mapIndex／slot、Boss ID、specialId逐欄精確核對名稱、等級、種類與戰鬥類型。特殊怪同一ID的宇宙名稱覆蓋另核對，不增加身份。

**銀河500＋宇宙100＋特殊9＝609身份、609有效對應、0漏配、0無效assetId。** 20圖均有使用。逐組檢視全部609完整名稱及來源後，修正63筆明顯外型錯配；完整逐筆前後ID與原因見 `development/monster-art/batch13-twenty/mapping-review.json`。例如中樞警衛兵改人形、帝國艦隊提督改軍官、火山攻城兵器改巨像。抽象或未明指外型者保留既有輪廓；依使用者省圖偏好保留誘餌艙共用堡壘、信標共用能量體等既定取捨。

規劃的腳底pivot `[0.5,0.82]` 不符合現役以alpha區域置中的Actor，因此609筆統一為視覺中心 `[0.5,0.5]`，offset保持0；浮空艦／核心不會錯用落地錨點。倍率限制0.6～1.3，色彩採小幅濾鏡，動作依登錄輪廓共用。炮台／堡壘保留 `stationary-shot`，新增固定主體的小型射擊效果，不位移、不新增clock。

## GM、資源與保護

沿用同一GM中心、MonsterActor、MonsterPool及單一RAF。圖片選擇動態從登錄產生；可依圖片ID查看完整共用身份清單、選擇某身份套用配色與倍率、下一張連續切換、四動作、雙向對打、重新載入。新增共用 `monsterPlacement`，GM及未來正式消費者使用同一定位規則。圖片原生左向，玩家左／怪物右。

池仍最多兩張512px解碼影像（2 MiB）、最多兩個載入；內容SHA／尺寸／bytes驗證、同圖共用、LRU close、取消／晚到解碼、磁碟快取、隱藏清理及權限撤銷沿用。失敗保留玩家與控制項，可原地重載恢復。

**總開關 `formalBattleEnabled=false`，每圖 `formalBattleAllowed=false`。** 正式戰鬥、背景／極簡、連戰、跨模式、玩家數值、公式、獎勵、存檔Schema17與正式Renderer不修改。正式啟用須待使用者確認GM畫面後另行授權。

## 程式自我檢查

- 20張WebP：真實格式、512×512、RGBA、alpha 0..255、邊界、SHA、bytes、唯一ID及唯一部署路徑；全部附件checksum與原六張checksum保護。
- 609正式來源精確對應；合法palette、scale、pivot、方向、動作；63筆修正可追溯。
- 池單元測試：共用載入、記憶體預算、取消及晚到close、損壞／未知圖／dispose安全；609種定位×3視窗×3倍率、固定巨構不突進。
- 真瀏覽器三viewport：1365×900／390×844／844×390；20圖四動作raster、每35ms無裁切；每viewport 180次生命週期＋609身份實際解碼繪製、20種身份UI預覽、60次切換、雙向對打、最大倍率、快取重用、損壞圖片重載恢復、權限撤銷與state/localStorage不變。
- 原三紀元GM回歸；Runtime全套、正式owner鎖、資源／智慧下載、發布候選與Pages測試依現役workflow執行。CI與Pages需以PR最後head及合併main相同SHA最終成功為準。

## 實機／Actions驗收與剩餘事項

瀏覽器證據由本批workflow上傳 `batch13-twenty-monster-evidence`，含三版面截圖及 `/tmp/batch13-monster-browser.json`。Actions、PR與最終main SHA於PR交付紀錄查核；執行中不等於成功。

iPhone Safari真機溫度、耗電、觸控、長時間流暢度與使用者人工畫面確認尚未執行；Chromium手機viewport不等同真機驗收。此批僅GM可見新素材，正式戰鬥維持原狀。

## 20圖登錄

所有圖片均512×512透明WebP、原生左向、GM可用／正式停用。下列SHA對應未修改原檔。

|assetId|路徑|bytes|SHA-256|模板|
|---|---|---:|---|---|
|hm-01|assets/monsters/v1/humanoid/hm-01.webp|75458|8cf609169310d0e81a244675fe9e1612b6932285a31d3fd138d229cf7bf91b28|short-thrust|
|mech-02|assets/monsters/v1/mechanical/mech-02.webp|192414|9bb4cc17c794bfd53b7d8384132fa687ca952721e71d18f23ea3f988528e734c|mechanical-strike|
|ship-01|assets/monsters/v1/starship/ship-01.webp|111612|d9e44757158ec1b87a8bae5acd4467c6564d0573935e3059ce7d3fe66effac6b|ranged-shot|
|beast-03|assets/monsters/v1/creature/beast-03.webp|246048|21e21590aeb7037e57985e7100ef5e3f1a5237113ef519694f6d84963b982bb9|pounce|
|core-01|assets/monsters/v1/core/core-01.webp|241636|f6aa423e3b5a6e07deda2705698427b1a018c1acd7b9bc7d14649e5554ad1d38|pulse|
|bio-02|assets/monsters/v1/biological/bio-02.webp|191300|2315c417eb6e14ddeefcb7f2e80eacede6e7a0334d40d5d5f0fd0e2ecad699ce|pulse|
|hm-02|assets/monsters/v1/humanoid/hm-02.webp|108680|222faefcec6533414e10f52dab148340d71d3fab2633875fc60942a15dd2278d|short-thrust|
|hm-04|assets/monsters/v1/humanoid/hm-04.webp|129048|e92605f9c04f611108a2c6bcff6dbeff73f937b5d39c4b5ca1f0e97dc2234c91|short-thrust|
|cmd-01|assets/monsters/v1/humanoid/cmd-01.webp|181120|c9e919910bc80bdd0a51c72e3e6576027506db09a615c4db044d1deab8524d35|short-thrust|
|dr-02|assets/monsters/v1/mechanical/dr-02.webp|144238|3b17ac4bfd878daa2ddd535a034865031f94bf0e4cc960947ade556d1f41ee2e|mechanical-strike|
|mech-01|assets/monsters/v1/mechanical/mech-01.webp|238054|5cc137aad2ead71073aedc567ae13a56dae00d458c7560e3ce31642579f8b166|mechanical-strike|
|mech-03|assets/monsters/v1/mechanical/mech-03.webp|271572|3064d8f3c79d1f38340a37204b98581769c9b238cc713b20f73fe41a74b9ce32|mechanical-strike|
|veh-02|assets/monsters/v1/mechanical/veh-02.webp|233024|e1d15a044c5af2a8e87ee1c278725d361204501902926dfedee3c8281ff6887a|stationary-shot|
|ship-04|assets/monsters/v1/starship/ship-04.webp|156170|250600278e6d3f1924b7dd96b0d5e97402f35c2199d7bdc0ca4b65ac790c14a0|ranged-shot|
|fort-01|assets/monsters/v1/structure/fort-01.webp|175996|f58b4e47af146c2e3deaa400cb401dd99781a7a2157cc47a61f2022a8f390b1b|stationary-shot|
|fort-03|assets/monsters/v1/structure/fort-03.webp|198470|ea98eca12e63e0b7d4b1b418342ae9c08be7b1663b459672e5c7579a0c57f68e|stationary-shot|
|cmd-03|assets/monsters/v1/humanoid/cmd-03.webp|277890|95725d758dceed5c47c37366324853953ca3d5a3c128857d0dbada499428d096|short-thrust|
|beast-01|assets/monsters/v1/biological/beast-01.webp|102738|25f799509743011aaa4d0514e9de07981d87276051a04a5b4bd5178e8c167b4b|pounce|
|core-03|assets/monsters/v1/core/core-03.webp|305476|dee77c6332340ade3f2c265b32e065d4ea81f0b63fba1e95ec3227431fa7da97|pulse|
|energy-01|assets/monsters/v1/energy/energy-01.webp|168438|9b90dddd04eb58af93868b03be2c2b48bffbf550789adf55529451183fe4b477|pulse|
