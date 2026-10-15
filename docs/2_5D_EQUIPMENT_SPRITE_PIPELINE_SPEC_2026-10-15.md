## 2026-10-15 武器動畫量產補強（優先於下方 v1 選配描述）

每套仍以整體角色造型為主；另交付真透明武器層及去武器／補手的攻擊專用底圖，或確實製作的攻擊姿勢素材。不得用空圖、重複原角色或整張角色旋轉冒充獨立武器。既有完整角色原檔不覆寫；G024/G030原概念已接受結果不變，不要求重修。

本次G005「蝕毒軍刃」、G007「古代光刃」、G018「環帶光刃」使用 `weapons-v1/registry.json` 獨立記錄 `weaponAnimationStatus=complete`，並綁定兩層WebP／生成源／複查SHA、template、grip、depth、handRadius、windup、strike。概念批准、角色complete、武器動畫complete、GM驗收、正式發布許可五者各自獨立；其他207套沒有因此完成武器動畫。

交付步驟：核對正式名稱和原角色 → 真實分層及遮擋修補（保留生成源）→ 透明512格點及共同腳底、握持點技術匯出 → 實際目視原尺寸／128～180px及四階段 → 登錄SHA及複查 → `python3 scripts/equipment-weapon-assets.py` → GM原戰場事件驗證 → 獨立受控發布。新武器類型可增加少量模板（單手刃／槍械後座／重擊等），不強迫同一揮砍，也不強制五槽GLB、53骨、9掛點或三LOD。

`WholeSuitActor`共用蓄力／揮擊／命中／收招，完全由既有700ms owner時間取樣。原圖用於待機、受擊、閃避及死亡。攻擊底圖不含武器，武器繞握點獨立旋轉，握拳遮罩最後重畫避免浮柄；同次攻擊固定分層可用性，不中途換層。主圖先顯示，武器兩層非阻塞、2.5秒截止、逐SHA／bytes／尺寸驗證；任一失敗只回退原圖攻擊。素材共用原16MiB／兩併發pool，無啟動預載／額外戰鬥時鐘／音效／權威事件。

正式發布新增僅六個確切資源 `g005/g007/g018-attack-body.webp` 和 `-weapon.webp`，由原GM及正式獨立發布清單派生並稽核。來源PNG／複查／development新目錄不公開。可重現測試：`tests/equipment-weapons/runtime.test.mjs`、`browser.cjs`、正式 `browser.cjs/failures.cjs`；瀏覽器操作原GM模擬及真正正式B，不以隔離預覽冒充。

# 整套2.5D角色素材與共用動作規格 v1

基準main：c396acf77c811e89d048479fd8eba37532c1c5c4。適用210個永久套ID；正式五槽仍各自實穿與計算，本規格只管理整套視覺素材，沒有改正式選材邏輯。第4批接GM、第5批接正式B。

## 實際B方案盤點與重用

| 現行模組 | 實際用途／本批處理 |
|---|---|
| `development/hybrid-comparison/t2b3-v1/contract.mjs` | 已有idle/attack/hit/dodge/return/defeat、700ms／22取樣、128/192/256格點、project與placement；本批直接import其CLIPS／GRID／sampleTime |
| 同目錄`renderer.mjs`／`atlas.mjs`／`native.mjs` | 已有Canvas合成、AtlasActor.draw(plan)、NativeActor與同一來源時鐘；全部原樣保留。舊AtlasActor要六動作22格、逐槽RGBA＋16bit depth，不能將新單幀素材偽裝成該格式 |
| `3d-test/t3b-formal-renderer.js` | 正式B準備／弱引用verified token、G007真GLB／53骨retarget、敵atlas、取消與釋放；未改 |
| `3d-test/t3b-formal-controller.js`及事件／session／owner-clock | 原戰鬥時序、HP／盾、可取消視覺、背景與故障文字回退；未改，不增權威事件或音訊 |
| `assets/3d/asset-registry.json`／character-assets／shared-loader | 原G007與B登錄及SHA／loader契約；未改，不把新整套WebP塞進五槽GLB schema |
| `3d-test/atlas-review.js`、GM test-center | 現有GM圖集檢視／授權／自由fixture；本批未整合新素材，保留八類與31案例 |
| publish-assets／publish-asset-audit、resource manifest／SW | 現行按git tracked檔案與依賴閉包發布；新檔全在development，沒有正式引用、manifest或SW項目。必須暫存後實跑稽核，不能只驗未tracked檔案 |

新`WholeSuitActor`只是同一`init / draw(plan) / dispose`介面的可替換角色adapter，回傳Canvas供B原合成器使用，不建立背景、敵人、戰場、engine、RAF或戰鬥時鐘。未修改或複製B頂層renderer。第4／5批須經現有授權／verified selection接線，不以本批隔離頁代替正式功能。

## 固定美術及檔案契約

- 主交付：一張整套角色透明WebP，512×512；原生成PNG留source。可選未來獨立武器層，本版不強制五槽拆件、骨架、GLB或LOD。
- 固定右向3/4戰鬥鏡位、完整遮面、完整雙腳、主體約400px高，腳底y=461±13、共同畫布pivot=[0.5,0.9]。不同武器／姿勢保留自身輪廓，pivot是共同畫布定位，不是宣稱兩隻腳同一像素或3D世界座標量測。
- 技術匯出不裁切概念圖：只接收真透明單角色PNG，依全alpha bounds等比縮放／透明補畫布、lossless WebP。生成原稿不改；沒有原稿或真透明alpha則拒絕，不生成假人物。
- 實際alpha必須有0透明及>=250近不透明主體（生成工具可能最高254，非要求強改成255）；四角透明、主體留8px以上邊界、合理比例。可解碼、每張<=800,000bytes、512格點；128/180/256格點有alpha輪廓面積檢查。面積檢查不是美術批准，另須真目視複查。
- 本批三WebP合計272,992bytes，decoded bitmap每張1MiB，三套共3MiB；pool上限16MiB，包括正在使用的圖。無全210套預載，最多兩張不同素材同時fetch/decode，超額明確拒絕供呼叫端稍後重試；同ID/version/SHA併發共用一次fetch/decode，引用計數、LRU、idle清理與dispose。
- 失敗／404／版本／尺寸／SHA錯誤，不顯示別套或佔位人物；呼叫端取得unavailable／錯誤並清空本角色。第5批須銜接既有正式文字回退，不能由本adapter修改正式狀態。

## 登錄、資格與完成

`development/equipment-2_5d/v1/registry.json`是開發素材清冊；正式身份從原catalog owner讀取，逐字綁id、epoch、sourceKey、directory、regionOrBoss與五槽名，並綁兩概念SHA。登錄version=1.0.0、右向、pivot、輸出path／bytes／SHA／alpha／尺寸、生成source原檔SHA／prompt／授權用途、複查Markdown SHA與五項目視檢查。

- `not-started`：只有已審概念與明確製作計畫，無素材／無假檔。
- `awaiting-art-review`：真圖與技術檢查完成，但未取得綁定當前SHA的素材目視複查。
- `complete`：真素材、技術與本批小尺寸目視證據均通過。不是GM通過或正式發布。
- `gmTestStatus=not-tested`、`formalReleaseAllowed=false`、`publish=false`固定於本批；概念通過／製作資格仍各自從原驗證器推導。舊G007 modelStatus獨立保留。

政策不能阻止有寫repo權限者偽造藝術文字；驗證器負責版本／證據一致性，視覺審查者對實際所見負責。不能由程式面積檢查自動批准造型。

## 可重複量產命令

```bash
python3 scripts/equipment-concepts.py validate
python3 scripts/equipment-asset-production-gate.py --set G026
python3 scripts/equipment-sprites.py plan --set G026 --reason '已核對該套的白色環冠與其他套輪廓差異，準備下一批素材'
python3 scripts/equipment-sprites.py import --set G026 --source /path/to/real-generated-character.png --prompt-file /path/to/actual-generation-prompt.txt
# 匯入只到awaiting-art-review；真正查看原圖及小尺寸後建立綁定SHA的review，再由validate驗證complete。
python3 scripts/equipment-sprites.py validate
python3 scripts/equipment-concepts.py generate
python3 scripts/equipment-concepts.py validate
```

沒有`approve --force`或由圖片存在自動complete的指令；匯入拒絕覆寫已存在版本。未來第二版須另立版本目錄／契約，不能以1.0.0覆寫已提交版本。重跑generate不改圖片／source／審查／人工notes。

## 共用五動作

`animation.mjs`沿用B的700ms取樣，沒有RAF／setTimeout或戰鬥owner；`animationController`由外部now取樣，處理play／eventId去重／中斷／cancel／dispose。非死亡單次動作完成回idle，死亡終點保持透明。

| 動作 | 小尺寸整套表現 |
|---|---|
| idle | 輕微呼吸縮放／浮動 |
| attack | 前進、整體揮擊傾斜與共用弧光、返回；不是新增逐肢美術或武器骨架 |
| hit | 後仰、短震與遮罩內閃白 |
| dodge | 側移、短暫淡化與殘影 |
| defeat | 傾倒、淡出退場，死亡保持終點 |

B的project已計算approach，actor預設rootMotion=false避免雙重位移；隔離人工演示才明確設true。動畫模板可執行是工程事實；每套素材是否完成另看登錄與實際圖，不能用模板測試冒充角色已製作。

## 本機隔離入口

在repo根執行`python3 -m http.server 4187 --bind 127.0.0.1`，開啟`http://127.0.0.1:4187/development/equipment-2_5d/v1/`，可選三套、五動作、重播、中斷、釋放及128/256格點參考。此入口不進Pages，不加GM案例，不讀登入／存檔／正式裝備。手機須由使用者在自己的可信本機環境提供可達的測試服務；本批沒有公開部署開發入口。
