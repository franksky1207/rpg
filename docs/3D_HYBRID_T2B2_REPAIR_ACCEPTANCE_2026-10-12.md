# T2-B2 補修 r1｜美術、動畫穿模與公平性（候選已提交，全面 Gate 未過）

## 最新真實來源與範圍

起始 fetch 最新 main `eff0a6becf4f9dbf3d90c33df157aef13a98f355`，工作目錄乾淨，前版十個 exact-HEAD Actions success。
環境原停在 B1，不假設文件舊 SHA 是 main；快轉後依交接／路線圖／藍圖／B2報告和JSON／B1／T2-A三契約及38矩陣／原27～40規格核對。
提交前再 fetch，remote 仍為此 SHA。資產／工具提交 `42182d61d0e3b7963f81198e087d94ce5d5687f7`。
最終 main 為隨後交接提交，完整 HEAD 與 Actions 在 push 後獨立核對，不能在文件中自引用自身 SHA。

**這是可追溯的部分補修，不是全部目標已修好。** 結構、再製、回歸技術檢查通過；
肩甲／握柄接觸及 native 材質公平性仍阻塞，不能宣稱 B2 全面通過或安全直接進 B3。
所有改動僅 B2隔離素材、製作／檢驗工具、原B2測試與workflow、清冊及交接證據。
未改正式3D預覽、31 GM、53骨9掛點、原人體拓樸/權重/三LOD、原18GLB/G00715、210套1050槽名稱、
T2-A Fixture或來源SHA、B1控制器/事件/取消、戰鬥三紀元/異宇宙/回顧/轉生/副本/GM/存檔/雲端/離線/音訊、
Manifest/SW/智慧下載/source-publish隔離/cache-bust。沒有新播放器／下載器／正式入口。

## 實際修改與前後差異

- 玩家六動作重新作者化：分散軀幹轉動、連續握柄、多關節屈身／受擊／閃避與回位。
  原兩骨腿鏈逐格求解，足點固定為原踝點+[0,0,0.003]m，清除原權重在新姿勢造成的裸腳局部下穿。
  原rest/骨數/掛點局部矩陣/拓樸/權重不動。攻擊第9 tick與return第0 tick及五動作回idle的關節連續性有精確斷言。
- 三敵同源工程／C GLB／A-B母圖集同步。普通維持巡守輪廓，菁英減少輕浮擺動，
  Boss反應爐橫向體積+13%但不放大整體舞台/3.2m高度/既有鏡頭；角度反應收斂與第5～7格蓄勢停留，
  仍第10作者格命中、700ms，無正式節奏/事件/數值變更。重量感和壓迫感待人工批准。
- 全部4×6×22=528實際Blender姿勢加嚴至最低點≥0，之前普通/菁英8.7mm/45.8mm與玩家2.3mm負地面值已實際修正。
- 舊hit背飾約0.146m只屬signed-nearest proxy。全頂點/三方向射線/BVH對照的132格前後皆零背飾表面交集與一致內點；
  擴大取樣的前版nearest最高0.182823m，修正後0。保留舊數字與方法，沒有改成碰撞深度或刪掉風險。
- 肩甲/裝甲最大一致射線內點距離0.0617576→0.0496042m，表面對數最大1642→1312，仍未過無穿模Gate；
  握柄區約0.0198312m仍需區分持柄接觸與不合理遮蔽。頭盔/鞋一致射線內點>6mm為零，
  仍有原受保護模型表面接觸，不宣稱全部無交集。射線/最近面不是精確體積Boolean，人工看圖不可省。
- A low/medium以同high母圖逐格做精確面積降採樣，線性sRGB/預乘透明度，深度採最近有效覆蓋樣本；
  再打包而不是縮整頁混入padding，保留原trim/pivot/700ms/22格，A/B敵人同頁。
  B/C必須於B3用同128/192/256來源pixel grid與構圖/VFX；目前沒有宣稱原生三LOD畫質完全相同。
- G006正式Registry／來源鎖沒有相容已批准GLB，概念圖不是已完成可穿模型；選文字降級：
  「G006極寒封閉盔：素材unavailable，顯示原始裸頭（非裝備外觀）」。與空槽區分，不拿G007冒充。
- crit/combo/counter沿六動作中的attack與真來源seq，drain沿idle＋獨立綠色cue，原創VFX有三份可編輯源稿/24 PNG。
  crit/revengeCrit是合法來源flag，替換基礎cue而不增加第二sprite；counter保留來源actor/target。
  不推HP/治療、不捏造技能/事件/額外命中/音效；未宣稱另有四個獨立clip或已接B3。

## 色彩校準失敗仍如實交付

保存三敵6動作×3畫格×兩設定=108張真正native截圖，同相機/同時間、原創同源面光源HDR與本機Blender AgX顯示轉換。
27取樣燈的UBO限制改用普通uniform，保留所有燈及PBR計算，不降低任一方案品質。
**共同不透明像素平均RGB RMSE：0.183218398→0.216187248，校準未改善，Gate失敗。**
[同畫格並排圖](../development/hybrid-comparison/t2b2-v1/repair-r1/same-frame-native-comparison.png)與
[逐筆數據](../development/hybrid-comparison/t2b2-v1/repair-r1/native-color-difference.json)保留，不能拿來宣布美術一致/勝者。
原創HDR不是外借素材；AgX上游明示散布授權未取得，LUT只在/tmp生成，沒有以CC0名義入庫。
shader檢驗只在tests，沒有B3 Renderer。玩家A/B/C材質及完整stage-shadow/遮擋同場一致仍待驗，不能用三敵數字冒稱涵蓋玩家。

## 容量、SHA與來源保護

[最新逐檔清冊](../development/hybrid-comparison/t2b2-v1/inventory.json)：876檔，82,394,324bytes（清冊自身另計），全部publish=false／prototype-pending。
[版本機制](../development/hybrid-comparison/t2b2-v1/repair-r1/revision.json)從固定eff0a6be讀307原檔SHA/bytes；Git保存原.blend/GLB/PNG/metadata。
原73來源與Fixture bundle `5a74c2eeb00014b208bcb175d2bd6f7668e430112dc7ebec8a7b5ac3ced83d99`不變，computed/committed區別保留。
新美術/動作/環境/cue為原CC0參考衍生或原創CC0；沒有外借模型/音訊/貼圖/字型，授權不等於批准。

| 六候選路徑 | bytes | SHA256 |
|---|---:|---|
| `enemies/boss/candidate.glb` | 383512 | `4bdc98e901aa576cc4d0231b91f1a8d28a386c6ebc26ab37cafccb3dfdc0e495` |
| `enemies/elite/candidate.glb` | 382400 | `4ef0ba15a1c7624df5383356ea3dd3b3dc030b0302461195f5f18c81a40f3539` |
| `enemies/normal/candidate.glb` | 358296 | `e45a6a9d2135100fe172a9e7ec5a821761f18c337a39f2f34c60b29518830bcb` |
| `player/candidate-high.glb` | 5272512 | `b0439995939ef91b94c7046ab81828d1adde51fedde0ed5dc21420eef7e1f748` |
| `player/candidate-low.glb` | 1006244 | `8a9c9d7a538a0000d1a178f968cd3471dd45ad6ec8af60a47c69ab48de7125c6` |
| `player/candidate-medium.glb` | 1960336 | `032019eab46d99a5a23ff7615dfa1fe878c2fff60cb9f4cb627dc8d6bfce26a2` |

| A/B共用母圖候選tier | 來源grid | RGBA+depth實際encoded bytes | decoded-plane估算bytes |
|---|---:|---:|---:|
| low | 128² | 4996088 | 25577496 |
| medium | 192² | 9803386 | 54704832 |
| high | 256² | 15313938 | 93755592 |

下表為三代表/六動作/G007整套五槽與共同背景/cue的完整候選素材庫，非當場最小請求／HTTP實測。
[每檔成本明細](../development/hybrid-comparison/t2b2-v1/repair-r1/resource-cost-comparison.json)另分GLB宣告buffer估算及圖像plane。
GPU/driver/壓縮/mip/上傳成本不可得，不冒稱GPU實測，不據此選型。

| tier | A實際encoded bytes | B實際encoded bytes | C實際encoded bytes |
|---|---:|---:|---:|
| low | 6737509 | 6489951 | 4154957 |
| medium | 11544807 | 10897188 | 5177149 |
| high | 17055359 | 18365122 | 8532733 |

## 程式自我檢查與實際證據

[機器證據](3D_HYBRID_T2B2_REPAIR_TEST_EVIDENCE_2026-10-12.json)和`docs/evidence/t2b2-repair-r1/`保存指令/結果/log SHA。
主要命令：Blender `validate_blender.py`、`repair_geometry_qc.py`、`repair_pose_views.py`、saved-source `reexport.py`/`render_frames.py`；
Python `inventory.py --check`、`verify_pixels.py`、`verify_repair.py`、`verify_combinations.py`、`verify_reproduction.py`；
Node原T1/T2-A/B1/核心/GM/人物/裝備/音訊/發布回歸與原B2 art contract/browser。

- 全528源姿勢/原mesh-weight逐值signature/53骨9掛點/三LOD/73來源保護；六GLB Khronos零error、零warning。
- 78 layer-action/1716真RGBA與同數depth解碼、UV/padding/透明RGB/真關節動作；33外觀×6動作×22格=4356真深度組裝。
- 六GLB獨立再匯出逐byte相同，234對RGBA/depth獨立再渲染逐pixel相同。
  三敵54 source/GLB重匯入IoU最低1.000000000，RGB RMSE最高0.062168377；不等於native一致。
- 72未隱藏完整模型正/側/背面真渲染＋6張1024²細節圖；五viewport實際23圖解碼，六native GLB108 clip/三LOD99 bind/owned scenes回零。
- 原88契約、core576／鏡像48完整結果/State、B1五viewport500循環、GM桌機/手機各31、原18GLB/五槽/LOD/context-loss/fallback通過。
- 音訊29 Node＋50 native browser＋17成品解碼；存檔/雲端隔離/快取/Range回歸通過，未用真帳號寫入冒充驗收。
- source490指紋與正式JS/CSS/模型/audio byte不變；383copied+2markers=385成品/36,482,365bytes，全部HTTP/SHA通過，B2完全排除發布。
- 原斷言未刪、未放寬、未吞錯。抓到並修正`.001`舊動作選取、源改稿後舊ground lift、暫時清冊來源誤讀、23圖證據硬編碼8。
  沙箱EPERM改在允許本機子程序/socket的環境重跑；Shader UBO錯誤修正保留全部燈；所有失敗經重跑或保留未過Gate。

## Gate與停止點（分開記錄）

| Gate | 真實狀態 |
|---|---|
| 結構/再製/接地/契約/正式回歸技術檢查 | 通過，不等於全部B2技術風險已解 |
| 肩甲/握柄/遮蔽的全面無穿模 | 未過；原idle受保護模型亦有接觸，不能本批改原15GLB/拓樸去假裝全零 |
| native材質/光影公平性 | 校準失敗；必須補正，不能直接盲評 |
| 人工美術/六動作自然度/全遮臉/Boss壓迫感 | 未批准，保存真實前後與細節圖供確認 |
| G006 | unavailable文字降級交付，真模型未交付 |
| A分級與cue素材 | 候選交付；B/C可見pixel公平與事件接線仍未驗 |
| 真iOS/Android/桌機GPU、OS背景/30分鐘/熱量/記憶體 | 未驗，不把viewport/SwiftShader當實機 |
| B3舞台/HUD safe-area/故障/取消整合 | 未施工未驗；保留原camera/stage限制，不宣稱新Boss已在完整HUD實測 |
| 最終exact-HEAD Actions | push後核對；running或取不到就是待確認 |

**目前仍有阻塞Gate，不應把B2當全過而直接開始B3。** 使用者可先看圖確認非阻塞美術意見，
但肩甲/握柄極端姿勢與native色差仍須完成；正式公平比較前還要補三方案各tier像素/影/VFX一致、
完整舞台/HUD/取消、真硬體及至少兩人畫質審核。沒有選A/B/C勝者，不自動開始B3/B4/T2-C或量產其餘敵人/裝備。

## 玩家／開發者實機驗收與回復

正式玩家畫面沒有B2入口或新下載。repo root啟動`python3 -m http.server 4173 --bind 127.0.0.1`，
開`/development/hybrid-comparison/t2b2-v1/review.html`；手機用HTTPS開發轉送，不放正式Pages。
逐看六動作/4356穿卸檢驗表、頭盔遮臉、握柄/肩肘/髖膝/鞋/背飾、普通/菁英/Boss辨識/蓄勢重量。
以Blender開4份源稿播放真正Action；細節圖要看實際像素，不從JSON通過推測好看。
G006混穿必須顯示unavailable/裸頭不是裝備外觀。真手機仍需方向/safe-area/OS背景等；FPS/長測要另授權後續批次，不在本批杜撰。

回復：先revert隨後交接/證據提交，再revert `42182d61d0e3b7963f81198e087d94ce5d5687f7`，回到eff0a6be B2。
不清玩家存檔、雲端或cache；原T2-A Fixture、B1與正式模型保留。本批停止。
