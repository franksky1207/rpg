# T2-B2｜共用美術與必要動作候選・施工／驗收

## 起始與實際狀態

起始最新 main `10ef9222427050eadf42b8f61b4d153da7b049b6`，工作目錄乾淨；
fetch／提交前再核對皆無其他提交、沒有舊 B2 實作。B1 九個 exact-HEAD
Actions 全 success，包括 Runtime、發布 Stage4、Pages 與 T2-A/B1。
按使用者順序核對交接、路線圖、藍圖、B1、T2-A三契約／矩陣、實作計畫，
再查兩份實測 JSON、53骨9掛點 Rig、原 Blender／18 GLB／G007十五檔、
正式敵名來源、授權／雙軌發布、B1 playback/bindRenderer 與 SHA。

**候選資產與本機結構／再製驗證完成；美術、穿模、材質一致與真機 Gate
尚未全通過，不標為全面驗收完成。** 原 Fixture／來源 bytes 保持，沒有
重生 Fixture。資產／工具完成 HEAD `507f0385c303742a18afc9a7f9da809c12505d3b`；
其後本交接／證據提交為最終 main，完整 SHA 與 exact-HEAD Actions 在
push 後由 GitHub／交付回報獨立核對，不在文件自我引用自身 commit hash。

本批只 B2，沒有 A/B/C Renderer、B4效能報告、T2-C選型或 T3～T5。
原第27～40規格、人物／五槽、31 GM、正式2D與3D預覽、音訊、公式、
亂數、背景／倍速／Fast Catch-up、存檔／雲端與 SW 全保留。

## 逐檔交付與來源

所有新資產位於 `development/hybrid-comparison/t2b2-v1/`。
[逐檔清冊](../development/hybrid-comparison/t2b2-v1/inventory.json) 記完整
SHA、bytes、GLB面數／材質／關節／clip時間範圍，沒有加入正式 Registry。
[原始來源鎖](../development/hybrid-comparison/t2b2-v1/source-lock.json) 鎖定
73個實際原檔，包括原18 GLB、Rig、Blender、Fixture／B1接口及發布工具。

| 新增檔案／組 | 實際責任／完成度 |
|---|---|
| `enemies/{normal,elite,boss}/source.blend`、`design.json` | 三份可編輯機械模型、UV、材質／原創粗糙度圖、12/12/15關節與六動作；非既有幾何場景，pending美術 |
| 同目錄 `candidate.glb`、`atlases/{atlas.json,六RGBA頁,六深度頁}` | 同源A/B圖集與C GLB；同相機、光向、比例、動作與時間；native材質色差仍列Gate |
| `player/animation-source.blend`、`animation-contract.json`、三 `candidate-{LOD}.glb` | 原人體／五槽參考，新增隔離動作；原網格／權重逐值不變，53骨9掛點與原G007 binds一致；候選不內嵌裝備 |
| `player/atlases/atlas.json`、60 RGBA頁＋60深度頁 | 六動作×五槽與五身體分區，真正獨立動態層；32子集合不用整套合成素材；A為high-reference，非三套LOD圖集 |
| `shared/stage-source.blend`、三背景PNG | 原創遺址後／中／前景，無HUD／人物／方案專屬背景；B3接線仍須實際安全區驗證 |
| `shared/vfx-source.blend`、8 impact PNG、contact-shadow PNG、`effects-contract.json` | 原創碎片命中cue及接地陰影；共同預算、靜音，不觸發計算 |
| `textures/original-panel-roughness.png` | 原創64²粗糙度圖，內嵌三敵GLB；無第三方素材 |
| `atlas-index.json`、`layer-contract.json`、`source-lock.json`、`inventory.json`、`LICENSE.md`、`README.md` | 對位／深度／空槽／缺材／時間與授權／重製規則，全部prototype/pending |
| `review.html`、`review/*` | 四套六動作真實contact sheet、33穿卸QC、Blender姿勢／穿模風險、ground修正、234再製像素、54同源GLB比對、六張真Babylon圖與資料 |
| `tools/art.py`、`build_enemies.py`、`build_player.py`、`build_stage.py` | 原創建置工具，已有候選時預設拒絕覆蓋；明示rebuild才重建開發候選，不寫原source |
| `tools/ground_candidates.py`、`reexport.py`、`render_frames.py`、`render_glb_review.py` | 實際變形根骨接地、新源工程匯出、Cycles32 RGBA/depth烘焙、真GLB再匯入渲染 |
| `tools/pack_atlases.py`、`inventory.py`、`verify_pixels.py`、`verify_reproduction.py`、`validate_blender.py` | 離線packing／深度QC、sourceSHA／容量、真像素／獨立再製、可編輯網格／rig／風險檢查；不建立戰鬥引擎 |
| `tests/runtime/hybrid-comparison-art-contract.cjs`、`hybrid-comparison-art-browser.js` | 六GLB Khronos／來源／發布契約；五viewport真圖像解碼、測試專用native檢驗、三LOD／99組五槽綁定及清理 |
| `.github/workflows/hybrid-comparison-t2b2.yml` | CI重驗原SHA、pixels、GLB、B1／核心／發布及browser；本機Blender再製與真硬體分別記錄，不假稱CI有做完整Blender烘焙 |
| 本報告／TEST_EVIDENCE／PROJECT_HANDOFF／路線圖 | 起始／程式HEAD、實際結果、未過Gate與停止點 |

三敵身份與T2-A完全相同：古代科技遺址 `EARTH_MAPS[6]`／`MAPS[6]`，
普通 enemies[0]「遺址守衛機」Lv31、菁英 enemies[3]「遠古戰爭機甲」Lv34、
Boss enemies[4]「遺址中樞核心」Lv35；正式 ID unavailable/null。
新造型是原創候選視覺，不增加正式技能。原Fixture裡的modelAvailability
是T2-A時的歷史紀錄，不改它冒充正式已登錄；B2可用性從本清冊提供。

### 六個候選 GLB 的實測容量／面數／SHA

| 路徑（本開發目錄下） | bytes | triangles | joints | SHA256 |
|---|---:|---:|---:|---|
| enemies/boss/candidate.glb | 383468 | 2648 | 15 | `fa740613ed56d81d6848cc9076b18bb7503f68100b50d068b4dbefbd8cddce50` |
| enemies/elite/candidate.glb | 382400 | 2848 | 12 | `9b3a1c4eef040d6730abb2b215553544caada1596e5cc1b6754be5fe88e1fd8f` |
| enemies/normal/candidate.glb | 358296 | 2680 | 12 | `d63b126cb0eef3e64c5d09c49e01db2883bf876e65680c200fabb5d18722c1c4` |
| player/candidate-high.glb | 5261964 | 108566 | 53 | `67b985396fe552ca1befcb15e2262d378256d0dee7d36dbb1a263350c8ec66a4` |
| player/candidate-low.glb | 995696 | 8480 | 53 | `717cd639519c2baa91a89bc29bdf7d4060936ba9231fc7993504a3ef5378b2a7` |
| player/candidate-medium.glb | 1949792 | 27140 | 53 | `cbb08d02b5cd8ea0502b92ae8ab51179de6ae037d02416845c32eafd7da76521` |

清冊納管306檔共46,773,880 bytes，清冊自身另計；largest file為玩家
可編輯工程6,195,525 bytes。完整實際PNG／源工程／圖集容量在清冊，
不是估計工時或正式下載量。授權為本批原創CC0／原CC0人體裝備衍生，
無外部模型、圖片、動畫、字型或音訊，**授權不等於美術批准**。

## 動作、圖集、五槽與相容

四actor都有 `B2_idle/attack/hit/dodge/return/defeat`，真正多關節變形，
不是idle改名、靜態位移或整體旋轉。每clip700ms；GLB原作者frame1
時間起點為1/30s、終點22/30s，**elapsed=end-start**，不能加初始等待。
Atlas22取樣0..21 tick／30fps，含700ms端點，端點不另加影格停留。
attack／hit／dodge／return／defeat是視覺資產，不造正式事件／HP／勝負。

鏡頭固定ortho、abs yaw35°／pitch15°，玩家鏡像視向screen-right，
敵人screen-left。各源保存camera／燈光，RGBA源格256²、Cycles CPU32，
依同動作全部格的union trim，保留3px透明餘量與2px cell padding，
不啟用mipmap。每格完整pivot／trim原位置／UV/page／fps/frameCount，
RGBA8 straight-alpha／sRGB，透明RGB=0；PNG16 depth是6～14m線性相機
距離，透明=65535。encoded實際file bytes與decoded plane bytes都保存；
**後者不是實測GPU/RAM**。A/B敵人直接共用同頁，不用兩套優劣不同素材。

五槽可獨立組裝：`body-base`＋未穿可用槽的原身體patch＋實際選中槽。
保守patch沿原registry判定，不刪整頭／胸／腳；per-pixel depth決定武器、
兩腳、背飾的動態遮擋，不能固定整個武器永遠在人物前。pivot可在小圖層
trim外，B3不得丟掉trim offset或把每槽放大成整人高度。

32 G007穿卸有32個不同實際像素結果，另驗混穿／空飾品。G006「極寒
封閉盔」仍沒有真模型，**不拿G007冒充**；本批離線QC為未覆蓋基座+
明示unavailable，B3必須採明示通用回退或文字降級。未宣稱G006已製作。
A目前high-reference，不宣稱已製作low/medium專屬圖集；三3D LOD皆與
原G007十五檔實際bind一致，原rig／掛點／網格／權重／原GLB不覆寫。

背景、陰影、VFX共享且無audio。原controlsSHA、角色足點(.25,.78)、
敵(.74,.78)、normal/elite/boss高度與portrait cap、HUD/Boss safeUV保持。
**沒有接入B1舞台，不宣稱新美術在五viewport的完整stage安全已驗收**；
目前驗的是原B1 HUD／操作與新圖冊可讀性，B3必須用實際stage重驗。

## 自我檢查與真實證據

完整57筆通過指令紀錄、原SHA、browser／發布摘要與未過Gate見
[TEST_EVIDENCE](3D_HYBRID_T2B2_TEST_EVIDENCE_2026-10-12.json)。57是指令
紀錄數，不是57個全部美術Gate。主要可重跑命令：

```sh
python3 development/hybrid-comparison/t2b2-v1/tools/inventory.py --check
python3 development/hybrid-comparison/t2b2-v1/tools/verify_pixels.py
python3 development/hybrid-comparison/t2b2-v1/tools/verify_reproduction.py --exports /tmp/t2b2-reexport --frames /tmp/t2b2-repro-frames
blender -b --python-exit-code 1 --python development/hybrid-comparison/t2b2-v1/tools/validate_blender.py
node tests/runtime/hybrid-comparison-art-contract.cjs
node tests/runtime/hybrid-comparison-art-browser.js
node scripts/hybrid-comparison-fixtures.cjs --check
node tests/runtime/hybrid-comparison-contract.cjs
node tests/runtime/hybrid-comparison-playback-contract.cjs
node tests/runtime/combat-events-integration.cjs
node tests/runtime/gm-3d-test-center-browser.js
node tests/runtime/3d-player-assets-browser.js
node tests/runtime/3d-equipment-assets-browser.js
node tests/audio-lifecycle.test.cjs
node tests/audio-regression.test.cjs
node scripts/build-publish-dry-run.cjs
node tests/runtime/publish-build-regression.cjs
RUNTIME_SMOKE_URL=http://127.0.0.1:4180/index.html node tests/runtime/publish-candidate-browser.js
```

| 實際檢查 | 結果／範圍 |
|---|---|
| Fixture／來源／授權 | 73原檔byte/SHA不變，原fixture `5a74c2eeb00014b208bcb175d2bd6f7668e430112dc7ebec8a7b5ac3ced83d99`，未重生 |
| Blender實際工程與變形 | 四actor24clip、144姿勢取樣，finite／可編輯真網格UV／材質；53骨9掛點及原網格權重逐值一致；根骨修正後sample最低點皆不低於地面 |
| GLB／atlas | 六候選Khronos零error/warning；78layer-action×22=1716 RGBA格及同數depth格，實解碼UV/padding/alpha/動作檢查通過 |
| 精確再製 | 六GLB從保存源獨立匯出byte相同，234組RGBA/depth獨立重渲染與圖集對位逐像素相同 |
| 同源輪廓 | 三敵54個source／GLB再匯入影格IoU最低0.99986955；RGB RMSE最高0.06356418，沒有完全色彩一致宣稱 |
| 原核心契約／State | T2-A/B1＋T1-A/B/C合88；正式core576完整結果／State、鏡像48結果一致；990 A/B/C共用輸入與B1五viewport500切換通過 |
| 新browser | 五viewport真圖像解碼／無橫向溢出；六GLB108clip取樣、三LOD99外觀bind；真GPU raster每個>1000前景pixel，owned scene回零；SwiftShader不當真硬體 |
| 原GM／模型／音訊／save/cache | GM桌機手機各31；原18GLB、角色／五槽／LOD／context loss／fallback原browser通過；29Node音訊與17成品解碼、存檔／快取owner回歸通過 |
| 發布／Manifest | fresh source490指紋byte相同；383copied＋兩marker=385成品、36,482,365bytes；全部385HTTP bytes/SHA、49cached媒體/Range/save隔離通過；development完全排除 |
| 語法／引用 | JS新測試語法、既有完整性、Python AST／YAML、圖冊實際引用與git diff-check通過；正式JS/CSS未改，不另改正式cache-bust |

初期真正問題／環境問題已分開記：GLB父層警告修正、根骨接地修正；
原裝備無UV的QC假設改為更強的原拓樸權重比對；static圖冊CSP拒blob
時保留CSP，改用測試隔離document；等待真shader ready後再截圖並檢
非空像素；時間測試用真elapsed而非假設0起點；copied／generated數量
分開；.nojekyll404因用錯HTTP目錄，改正成品伺服器後原斷言全通過。
沒有移除有意義的既有測試、改正式期待值、吞掉資產錯誤或重生Fixture。

## 尚未通過／未執行 Gate（不能當成功）

1. **人工美術／動作方向、重量感、Boss壓迫感、全遮臉／手腳武器批准**未驗。
2. **極端穿模未全面通過**：肩甲、背飾有signed-nearest表面風險，最大
   hit/back-accessory proxy約0.146m；這是風險探針而非精確體積碰撞判定。
   見 `review/blender-qc.json` 的動作／frame／mesh；需源動畫精修與人工看圖。
3. **native材質／光照顏色**仍有差異，來源／輪廓同源已驗，但B3要校準
   native shader/light，不能拿較亮／較暗的方案直接盲評或宣稱某方案優勝。
4. G006真頭盔與通用fallback美術未交付；低/中LOD專屬A atlas未交付；
   獨立crit/combo/counter/drain clip未交付。六基礎動作可用，不偽稱更多。
5. 真iOS/Android/桌機GPU、真OS背景／直橫／safe-area、30分鐘、FPS／heap／
   解碼與紋理GPU成本未量測；原50native音訊本批未重跑，已跑29契約＋17解碼，
   原來源與起始九CI不變。不寫真帳號／雲端／交易以冒充測試。
6. B1完整舞台新美術構圖／Boss安全區與Renderer故障／GPU100次釋放屬B3/B4，
   未施工，不能以本批static圖冊／owned scene數取代。

## 玩家／開發者操作、B3前置與回復

正式玩家網站無新畫面／按鈕／下載；不需在正式帳號測新戰鬥。
repo root啟動 `python3 -m http.server 4173 --bind 127.0.0.1`，開
`/development/hybrid-comparison/t2b2-v1/review.html`。手機用HTTPS開發
轉送同路徑。圖冊是實際資產與動作候選；B1仍技術占位，沒有完整2.5D。

看六動作與33穿卸的頭盔／握柄／肩肘／鞋／背飾、三敵差異與Boss造型；
以Blender開源稿play Action可以檢查完整clip。技術工具重跑方式見
[README](../development/hybrid-comparison/t2b2-v1/README.md)，不要直接
重建覆蓋手工改稿。完整工時未記人工hours，不能用自動工具牆鐘當美術工時。

B3前置：先修／人工核對上述穿模與動作、材質光照、fallback／A tier策略，
保留source/fixtureSHA；另行授權B3後才把asset paths按需餵B1 bindRenderer，
以signal/isCurrent/dispose維持所有權，驗原事件與computed，不碰原Owner。
新GLB載入後按名稱選B2_idle，不能假設第一個AnimationGroup是idle；先停
自動播放，再由共同700ms clock選clip與elapsed，不能另開第二個戰鬥時鐘。
不得為解決素材缺失改RigContract或重生Fixture；需要改正式契約時先停說明。

回復：先revert本批最終交接／證據提交，再revert
`507f0385c303742a18afc9a7f9da809c12505d3b`；只移除隔離候選／測試／CI，
不清玩家資料／cache。最終main／Actions提交後核對，執行中即待確認。
**本批停止；B3、B4、T2-C、T3～T5未施工，沒有選定A/B/C勝者。**
