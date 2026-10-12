# T2-B2 第二次補修 r2｜具體根因修正、失敗證據與 B3 前置 Gate

## 結果與最新來源

重新 fetch GitHub 最新 main `0d7c2307f9e50af2d97dd45c59b650c1d787a4b7`，起始工作目錄乾淨，既有十項 exact-HEAD Actions success；兩個歷史 SHA 不當作最新 main 的假設。按指定文件順序核對交接、路線圖、r1驗收／JSON、原B2、藍圖、T2-A比較／Fixture／38矩陣與B1、原第27～40規格，並檢查實際源工程／六GLB／圖集／工具與來源鎖。提交前再 fetch，main 仍同 SHA。

**本次為部分根因修正，不是兩個主要問題已完全解決。** 粗糙度 scalar 與 native 時間取樣已修正；材質／光影公平性及肩甲／護手接觸仍屬 C，不能建議進 B3。技術檢查通過、人工美術未批准、真手機／GPU未驗、B3整合未做分開記錄。

隔離素材／測試提交 `b3a5ab9f5f0607f965f2ed51bbf66e7056b4cd91`；最終 main 是後續本交接提交，完整 SHA 以 `git rev-parse HEAD`／GitHub main 取得，push 後核對該 exact-HEAD Actions；running 不等於成功，避免在提交內自引用其自身 SHA。

## 實際修改

三敵源稿中的 `Relic_Forged_Panels` 粗糙度 image 原為 sRGB。Blender Shader 解碼為線性值，glTF exporter 卻把原 bytes 裝入線性 metallicRoughness G。接縫 `0.2392157` 的源稿物理值約 `0.0466651`，原GLB卻讀 `0.2392157`。r2將源圖以 IEC sRGB 解碼成 Non-Color scalar、保留同一物理粗糙度（8-bit最近量化，接縫 `0.0470588`），不是把圖改標 Non-Color 後直接使用舊bytes。4096 texel逐值核對 GLB G，量化誤差受精確斷言限制。

同步更新三敵 `.blend`／三C GLB／所有六動作A-B母圖、low／medium衍生與清冊／成本。沒有改敵人幾何、骨架、六動作、700ms／命中時間、鏡頭或光源；GLB所有幾何／法線／UV／skin／動畫 accessor 原始 bytes 不變。玩家源稿與三GLB完全不變；不把未驗證的新姿勢入庫冒充修好了。源稿在本機獨立再export逐byte一致，三敵54對獨立RGBA/depth重新取樣；玩家180對既有再製資料因相同source SHA沿用，總234對精確比對，不冒稱本次重新渲染玩家全部母圖。

Babylon loader 會補零格，原 `group.from..to` 為0..44／60fps（含不屬700ms的前置格）。r2的檢驗工具明確取 `nativeFrame = (1/30 + tick/30) * 60`，核對所有channel為60fps；B3以後也須使用 `clipStart + elapsed`，不能把 group.from 當原動作起點。此修正僅離線資產檢驗，B1／正式事件播放未改。

## 真正渲染與色差結果

| 比較條件 | r1 RMSE | r2 RMSE | 結論 |
|---|---:|---:|---|
| 歷史工具（group範圍含零格） | 0.216187248 | 0.217630309 | 材質單項修正後惡化；保留全部失敗圖片 |
| 正確同時間，r1/r2 GLB真重渲染 | 0.214275032 | 0.214556724 | 仍略惡化，**Gate失敗** |
| normal 正確同時間 | 0.223093566 | 0.223852060 | 惡化 |
| elite 正確同時間 | 0.224782695 | 0.220388158 | 改善 |
| boss 正確同時間 | 0.194948835 | 0.199429956 | 惡化 |

不能拿歷史0.216187與新0.214557直接宣稱美術改善：時間方法不同。54組逐敵／六動作／tick0/9/21、dark/mid/bright固定源亮度區域、每區pixels／RGB RMSE／平均色／D65 DeltaE76 median/p95與輪廓IoU，見 [逐筆數據](../development/hybrid-comparison/t2b2-v1/repair-r2/color-difference.json)。源圖區域界線固定使用r1 source display luminance <.15／.15～.35／≥.35；不是臆測哪盞燈負責的物理照明分類。

實際108張clock-corrected native、15張線性色票、54張source/GLB重匯入Cycles渲染，以及 [同畫格並排](../development/hybrid-comparison/t2b2-v1/repair-r2/same-frame-r1-r2.png) 都保存。最差native輪廓IoU由錯誤取樣約0.902614改善至0.995232；不代表材質公平。三敵同Cycles source/GLB roundtrip max RMSE由r1 0.062168377改善到0.049489593，但殘差仍未完全定位。r1/r2源圖最大RGB RMSE 0.011224036，沒有宣稱PNG逐pixel完全不變。

| 管線項目 | 實際核對與目前限制 |
|---|---|
| 色彩空間／sRGB／線性 | scalar誤用sRGB已修；不是事後濾鏡，PBR baseColor與emission讀值保存在材質before/after JSON |
| AgX／曝光／gamma | 同本機Blender OCIO AgX、None look、exposure0、gamma1；15個實際linear ShaderMaterial色票最大單通道誤差0.002783561 < 1/255，不能把此通過當整體PBR通過 |
| PBR／roughness／金屬 | roughness源與GLB 4096值一致，金屬factor.78不變；源Principled、native PBR與重匯入殘差仍需材質ID／UV／法線分項驗證 |
| 燈光／反射 | 3有限AREA燈 vs 27個omnidirectional點取樣＋中心HDR反射；點取樣未包含發光面朝向的cos項，中心HDR不等於各位置近場反射，不能稱真正等效 |
| 陰影／遮蔽 | Cycles有幾何遮蔽／多次反射，native檢驗未建ShadowGenerator／等效動態陰影；亮暗區RMSE證明不能以同一燈方向就假設一致 |

同畫格比較保留同模型、相機、動作時間、源燈方向／色彩基準與PBR品質，沒有降某方案品質、改曝光配分數或替換假圖。共同AgX LUT仍只由本機Blender生成於/tmp，不散布未核對授權的上游LUT；程式是tests-only，未變成B3 Renderer。

視覺等效不要求RMSE零。補充判準是：精確來源／clip／構圖先一致；display reference限制於一個8-bit色階有量化依據；邊界須檢查源pixel的AA差與是否缺部件；RGB搭配per-region／per-material與CIELAB差異，不讓單平均掩蓋暗部或金屬。DeltaE76中位≤2／p95≤5可作小差異預警參考（不是DeltaE2000，也不是本次自動合格門檻，須以同照明色票／材料樣本與人工批准確認）。本批實際全體median約10.9～12.3、RMSE未改善，不能以新標準放行。原有效安全／來源斷言不放寬。

## 全影格穿模／接觸結果

132實際玩家姿勢、全裝備頂點BVH最近面／三方向parity ray／表面對數，原6mm貼合分界與原始signed-nearest數值保留；原方法／r2完整值在 `repair-r2/geometry-after.json`。部件定位見 [contact-localization](../development/hybrid-comparison/t2b2-v1/repair-r2/contact-localization.json)，18張全部模型可見的六動作正／側／背面補拍，並沿用相同player source SHA的r1 72視角與1024近圖。

- 右肩甲vertex141（upper_arm.R）相對身體clavicle.R，在attack作者frame10／return frame1最大49.604mm最近面風險，r2未降低此數值。這是不同骨段隨動的相對幾何問題；單軸±10/20度的15個有限試驗最低仍約36.549mm nearest proxy，沒有入庫破壞握姿／動畫連續性的候選。
- 最大19.831mm在weapon vertex54，連通部件實證為**guard護手**，不是grip。另pommel劍首對forearm.R最大19.474mm；grip對掌／指／部分前臂最大18.691mm。掌／指包柄有必要接觸，但不能把護手／劍首全歸為正常握柄，Gate仍未過。blade一致ray內點>6mm為0但BVH表面對數仍最高22，energy-edge內點與表面對數0；不宣稱整把劍完全沒有接觸。
- 背飾／鞋／頭盔r1修正回歸保留；原腳點+3mm、全關節連續性、528源姿勢minimumZ≥0均通過。這些通過不掩蓋肩甲與護手。

**最近面距離、signed-nearest、parity與表面對數都不是精確穿透深度／Boolean體積證明。** 沒有隱藏模型、縮小裝備失真、改原53骨／9掛點／body拓樸權重或G007正式15GLB。具體最小後續方案見前置表；不再次全面重做動畫／三敵。

## 容量、授權與來源保護

目前清冊 1102檔／91,091,254bytes（清冊自身另計），[逐檔SHA](../development/hybrid-comparison/t2b2-v1/inventory.json)。所有候選publish=false／原創或既有CC0衍生；新PNG、texture、工具與源稿不冒充已批准。`repair-r2/revision.json`記r1全部876檔SHA/bytes，前版實體由baseline Git保存；不是覆寫正式資產。舊`repair-r1/tiers`及成本檔是既有工具的目前衍生位置，已同步r2；原r1內容可由固定baseline取回，不能把r1舊清冊當r2現況。

| 候選 | 補修前 bytes → r2 bytes | r2 SHA256 |
|---|---:|---|
| `enemies/boss/candidate.glb` | 383512 → 383416 | `0864517604250abbc1da96280c0fe9dd834e649147f5102c10674b97f5c8a4f4` |
| `enemies/elite/candidate.glb` | 382400 → 382300 | `de2fc6a6791fa3e7b027bbd9f00037e724d92d0ed917099a1fa7752964a4680a` |
| `enemies/normal/candidate.glb` | 358296 → 358196 | `17e60c1a1f6075502d12cfaa6aac1e2d617a749bc90ee7eaa091f8eb9d301d81` |
| `player/candidate-high.glb` | 5272512 → 5272512 | `b0439995939ef91b94c7046ab81828d1adde51fedde0ed5dc21420eef7e1f748` |
| `player/candidate-low.glb` | 1006244 → 1006244 | `8a9c9d7a538a0000d1a178f968cd3471dd45ad6ec8af60a47c69ab48de7125c6` |
| `player/candidate-medium.glb` | 1960336 → 1960336 | `032019eab46d99a5a23ff7615dfa1fe878c2fff60cb9f4cb627dc8d6bfce26a2` |

母圖／tier逐檔bytes與解碼plane估算見 [quality-tiers](../development/hybrid-comparison/t2b2-v1/repair-r1/quality-tiers.json)／[ABC成本](../development/hybrid-comparison/t2b2-v1/repair-r1/resource-cost-comparison.json)。是encoded實際檔案容量與宣告buffer／decoded估算，不是GPU實測。73原來源、T2-A Fixture bundle `5a74c2eeb00014b208bcb175d2bd6f7668e430112dc7ebec8a7b5ac3ced83d99`、computed/committed、B1事件與取消、210套1050槽名稱及正式G007五槽映射不變。

## 程式自我檢查與限制

[機器證據](3D_HYBRID_T2B2_REPAIR_R2_TEST_EVIDENCE_2026-10-12.json)保存逐命令／exit／實際log與SHA；瀏覽器用系統Chromium、SwiftShader，無真手機／GPU／FPS宣稱。Blender 4.3.2／Cycles32，正式來源不變。

- 原26回歸命令、T1ABC／T2A／B1共88契約、core576／mirror48、GM八類桌機手機各31、B1五viewport500操作、原18GLB／五槽／LOD／音訊／存檔隔離／cache／publish通過。
- 六候選Khronos0error/0warning，所有原敵幾何與動畫accessor逐byte一致；源稿六動作真多關節、全528實際幾何姿勢，三LOD/原body權重與53骨9掛點仍核對。
- 78 layer-action／實際RGBA-depth、4356真深度穿卸組裝、low/medium/high來源一致、G006 unavailable文字與合法crit/combo/counter/drain cue回歸通過。未新增戰鬥事件／技能或獨立假動作。
- 圖冊五viewport27圖解碼、六native GLB108安全sample／99 G007 bind／owned scene釋放；新native108正確取樣另做色差，15共用reference。
- 音訊29 Node／50實際browser／17成品decode，存檔／雲端隔離；成品385HTTP SHA與36,482,365bytes、490source Manifest重算一致。所有開發素材排除，正式runtime／preview／場景工廠／SW／智慧下載／cache-bust／Pages策略未改。
- 原音訊首次時序斷言失敗、default sandbox EPERM與本機server未開等失敗有紀錄；原斷言保持、以相同測試重跑通過。首次診斷腳本path括號錯誤不當成成功，後續Blender QC／再製使用`--python-exit-code 1`。沒有吞掉色差失敗。

## B3判定、實機與停止

[完整A／B／C表](3D_HYBRID_T2B3_PREREQUISITES_R2_2026-10-12.md)：A技術通過；B人工美術、真裝置效能／GPU長測與B3完整HUD整合待驗，不要求B2越界施工；C為native光影公平性與肩甲／護手／劍首未解。**仍有2項C，不建議安全進B3。** 人工美術未批准，B3/B4/T2-C未施工，不選勝者。

玩家正式頁面沒有新功能／下載。開發者repo root啟動`python3 -m http.server 4173 --bind 127.0.0.1`，開 `/development/hybrid-comparison/t2b2-v1/review.html`，手機用HTTPS開發轉送，檢視r2並排、六動作與肩甲／護手／頭盔／腳／背飾、33外觀及G006明示文字。真手機效能／長測留給另行授權後續批，不能拿viewport／SwiftShader冒充。

回復：先revert本r2交接提交，再revert `b3a5ab9f5f0607f965f2ed51bbf66e7056b4cd91`；前版為 `0d7c2307f9e50af2d97dd45c59b650c1d787a4b7`，不清玩家存檔／雲端／cache。提交後按最終HEAD查Actions；running／查不到只記待確認。**本批到此停止。**
