# 第12批：依素材選定的正式攻擊動畫、GM 單一介面與整合驗收

本次使用者正式取消「必須前向突刺」，以「依現有三紀元正式素材，自行評估並完成最適合的清楚、自然、流暢的武器攻擊動畫」取代。禁止事項與原回歸、安全、Actions、main／Pages 門檻不降低。仍使用 PR #43 與 `batch12-forward-thrust-final-20261019`，沒有另開批次。

基準：PR #42 main `9748c72cd17b2c3dd0e8aaf749a4fcd821a1f23a`。延續 PR #43 原 head `7f78f80552eed30077d8c6d07053eafa6e8d34e6`。目前選定及實作 **短距離上挑斬（肘部局部轉動、原肘甲遮擋）**；本機完整回歸與本 head Actions／發布狀態由文末與 `verification-summary.json` 記錄，未通過前不得合併。

## 素材與實作

完整檢視三張正式512px WebP、三套原無武器身體與三套獨立武器；重新核對來源 SHA。原完整正式圖與六個輸入原檔不改寫。銀河／宇宙身體是垂臂，宇宙含烘焙棋盤背景；高維身體原圖無 Alpha、有張掌與手臂內側白底。僅對已知外側中性色連通區去底，高維加明確內側 seed；不生成新裝甲、不補繪手指、不引入新劍光。

採用來源身體的前臂／手掌與原獨立武器，先固定為完整局部層，繞肘部轉動；柄、手、前臂始終一起運動，無獨立劍漂移。原肘甲覆蓋轉動接縫。待機到攻擊與回待機使用同一組合外觀，避免全圖／分層切換時跳圖。這是小尺寸2D局部拼接，並非精密骨骼或手指美術。

每紀元一張512×512透明圖集，上半部兩個256px格：靜態身體、完整前臂加劍。各 **38,454／44,544／44,690 bytes**，合計127,688 bytes。每個 Actor 只持有一個1MiB解碼 bitmap，三紀元共3MiB；保留原4MiB GM pool、最多兩個 pending、單Canvas與原RAF／Clock。原完整圖仍保留與驗SHA，不額外預載。失敗會進原文字回退，不能拿舊整圖移動冒充上挑斬。

同一 `WholeSuitActor` 與 `risingCutPose` 用於正式及GM。0→196ms輕蓄力、196→336ms局部上挑、336→420ms命中短停、420→700ms收回。角度0→+0.12→−0.88→0 rad；既有 owner 將真實命中時間映射至336ms，倍速不新增時鐘；Renderer只以時間格跳過重複像素，不再把命中時間向前取整，跨336ms強制更新一次。三紀元僅來源尺寸、握點、肘點不同。

正式 Renderer 改為方形畫布與中央相對定位；仍使用 owner 原有最大58.8px接近量，修復手機橫向舞台太寬而敵人遠離的問題。沒有角色中心穿越、獨立戰鬥引擎、數值／傷害／收益／音訊／存檔改動。27個保護 owner 與基準逐位元相同。

## 實際渲染比較

[可重跑候選實驗室](../development/combat-animation/batch12/candidate-lab.html)、[來源及 SHA](../development/combat-animation/batch12/rendered/trial-inputs.json)、[全部影格索引](../development/combat-animation/batch12/rendered/evidence-index.json)。11個對照（含禁止的整圖平移負例）×3紀元×180／128px×6階段，**66張影格表、396個實際Canvas影格**。沒有把幾何試算當美術驗收。

表中辨識／自然／順暢為同尺寸人工比較（低／中／高），不是客觀美術分數。成本比較以現有共用Canvas為基準；原圖描出的光刃輪廓不是新增特效。

| 實際候選 ID | 辨識／握劍自然／順暢 | 錯位、接觸與淘汰／採用理由 | 成本、複雜度 |
| --- | --- | --- | --- |
| wrist-uppercut | 中／低／中 | 手臂未配合，主要是大角度折腕；淘汰 | 低、低 |
| wrist-diagonal | 高／低／中 | 蓄力折腕過大，肘臂不配合；淘汰 | 低、低 |
| wrist-horizontal | 中／低／中 | 垂臂不支援橫向握劍，壓扁劍圖欠自然；淘汰 | 低、中 |
| dash-cut | 高／中／中 | 前移提升接近感，但肩部轉動露接縫；不以位移掩蓋問題 | 低、中 |
| heavy-blow | 高／低／中 | 抬劍後前臂回折、重擊方向與姿勢不合；淘汰 | 低、中 |
| shoulder-uppercut | 高／中／高 | 肩部露出空洞及裝甲碎邊，放大與手機可見；淘汰 | 低、中 |
| elbow-uppercut | 高／中／高 | 手與劍整體運動較合理，但原肘點切口明顯；進一步修復 | 低、中 |
| compact-arm-cut | 中／中／高 | 比上挑角幅小，仍有肘接縫；進一步修復 | 低、中 |
| capped-compact-cut | 中／高／高 | 接縫可遮擋，但128px攻擊姿態辨識弱於完整上挑；未選 | 低、中 |
| capped-elbow-uppercut | 高／高／高 | **採用**，肘甲遮擋、手臂與劍剛性一體，攻擊姿態明顯，能自然收回；正式舞台再次驗接觸 | 低：單1MiB圖集、每frame三次局部draw；中：無新骨骼依賴 |
| whole-image-control | 低／無局部攻擊／高 | **禁止負例**：僅整圖平移，絕不當正式方案 | 最低，但不合格 |

第一輪接觸實驗的目標刻意分開以比較輪廓，不據此判斷正式距離；正式允收只使用實際 Renderer／CSS／敵人 alpha。保留舊 `thrust-feasibility.json` 作歷史突刺試算，`productionThrustAccepted=false` 不代表新規格被阻擋。

## 正式影格與視覺允收

使用真正 `CivilizationFormalBRenderer`、發布 `WholeSuitActor`、原CSS與實際敵人輪廓；1365×900、390×844、844×390 × 三紀元 × 普通／菁英／Boss 共27組。每組保留待機、蓄力、攻擊、命中、短停、收回、回待機；普通敵人另實際逐35ms取樣產生9個GIF，**不合成中間影格**。共333個正式實際影格，完整像素報告及每檔SHA見索引。這是自動化viewport及人工影格檢視，不是iPhone實體裝置測試。

- [銀河手機完整影格](../development/combat-animation/batch12/rendered/accepted-390-galaxy-normal.png)／[動畫GIF](../development/combat-animation/batch12/rendered/accepted-390-galaxy.gif)
- [宇宙手機完整影格](../development/combat-animation/batch12/rendered/accepted-390-universe-normal.png)／[動畫GIF](../development/combat-animation/batch12/rendered/accepted-390-universe.gif)
- [高維手機完整影格](../development/combat-animation/batch12/rendered/accepted-390-higher-normal.png)／[動畫GIF](../development/combat-animation/batch12/rendered/accepted-390-higher.gif)
- [桌機銀河](../development/combat-animation/batch12/rendered/accepted-1365-galaxy-normal.png)、[橫向高維](../development/combat-animation/batch12/rendered/accepted-844-higher-normal.png)、[正式像素報告](../development/combat-animation/batch12/rendered/formal-visual-report.json)

實際發現並修復：第一輪肩／肘接縫；預覽root motion時刀尖被Canvas裁切（等比例縮短原獨立武器後保留原零裁切斷言）；正式普通敵人刀刃差1–22px、橫向相隔400px（修正視覺定位，未加長接近量或改owner）。最終27組均有真實刀刃藍色像素與敵人alpha重合、無Canvas邊緣裁切、角色中心不穿越敵人、refs歸零，清快取bytes歸零。沒有降低接觸斷言為「看起來接近」。

## 36項驗收矩陣

「代表性回歸」涵蓋原自動案例與共用owner，不宣稱全模式×裝置×狀態所有排列人工實玩。完成標記僅適用表列範圍；原真機／真雲端未測界線保持。

| 項 | 新規格下的驗收與證據 |
| --- | --- |
| 01 | 三套正式完整圖、原身體與獨立武器、Controller→Clock→Renderer→Actor／Pool已完整檢視，SHA保留。 |
| 02 | 原PR移除半月光環保留；無刀氣、大型攻擊特效；三紀元attack無arc／stroke回歸。 |
| 03 | 依素材選定正式短距離上挑斬，前臂與劍有明顯姿態變化，非整圖平移。 |
| 04 | 前臂、手掌、握柄預先固定於同一局部層；原肘甲遮擋。 |
| 05 | 三viewport×三紀元×三敵人體型實際alpha接觸、零裁切、中心不穿越。 |
| 06 | 原命中映射336ms與敵人hit／HP事件保留，沒有新傷害或命中特效。 |
| 07 | 正式／GM共用Actor、Pool、risingCutPose，三紀元僅局部素材參數。 |
| 08 | 原可見分類、目錄、搜尋移除保留。 |
| 09 | 原GM單一角色預覽入口保留。 |
| 10 | 三紀元隔離預覽，不讀寫正式外觀偏好或save。 |
| 11 | 同畫面六動作，攻擊名稱更新為「攻擊（短距離上挑斬）」。 |
| 12 | 原倍速／重播／方向／縮放／viewport／缺圖功能保留；缺圖故障改注入實際使用的attack atlas SHA；保留舊戰場自動入口。 |
| 13 | 正式Clock／Controller／Entry逐位元不變；無新戰鬥計時器。 |
| 14 | 原事件／連擊／反擊／暴擊／閃避／死亡與timing回歸。 |
| 15 | 27個數值、回合、收益、背景、時鐘、存檔、雲端與音訊owner逐位元保護。 |
| 16 | 動畫關閉／重開與缺圖、404、SHA、decode、Canvas失敗進原文字回退；故障注入更新至實際圖集URL，未刪原案例。 |
| 17 | 正式進退場、GM撤權／重入／銷毀、原100 actor生命週期與零refs／bytes。 |
| 18 | 原主線／普通／Boss與三紀元正式Sprite案例；非所有Boss人工實玩。 |
| 19 | 原懸賞／競技手機UI、三紀元音訊與高維背景連戰回歸。 |
| 20 | 原鏡像／虛空／災厄／回顧事件、音訊及terminal回歸。 |
| 21 | 原異宇宙combat／settlement、真UI controller trace及音訊回歸。 |
| 22 | 原外觀契約、轉生save、帳號偏好、下場生效回歸。 |
| 23 | 原pending promise、背景、offline provenance、Fast Catch-up回歸。 |
| 24 | 原動畫／極簡／正式GM速度owner不改；GM預覽速度不接正式速度。 |
| 25 | 第11批音訊owner逐位元不變；原生音訊50案例與lazy SFX回歸。 |
| 26 | 原Schema17／save-load／轉生／GM隔離回歸；真帳號雲端寫入未測。 |
| 27 | 1365×900、390×844、844×390正式與授權GM；另180／128px候選對照。 |
| 28 | 原HP／透明正式背景／手機捲動回歸；不恢復戰鬥文字框。 |
| 29 | 原4MiB GM與16MiB正式pool上限；三個紀元仍各一張1MiB bitmap，原3次decode與100 actor測試不放寬；無新Canvas／RAF／Observer／訂閱。 |
| 30 | 自動化手機viewport與圖集成本通過；iPhone發熱、耗電、熱節流、Safari長時間連戰未測。 |
| 31 | 三套原正式完整圖與六來源不變、32背景／17音訊／既有SFX及174筆B-only依賴保留。 |
| 32 | 新增三張38–45KB正式圖集及精確SHA／bytes allowlist，更新canonical發布Actor／Pool／Animation與HTML／module快取鏈。 |
| 33 | 發布dry-run及Pages需綁定最新正式提交，狀態見文末；分支綠燈不等於正式發布。 |
| 34 | 語法、單元、素材、原16類完整回歸及新27組實際渲染均需成功，結果見機器摘要。 |
| 35 | 延續PR #43，必要Actions全綠才轉ready／合併；合併main後Actions與Pages另驗，不預先宣稱。 |
| 36 | 本報告／handoff／候選實驗室／影格SHA／機器摘要更新；是否封箱依下節最終證據。 |

## 回歸與提交追蹤

舊head `7f78f805` 的9個Actions成功、32/32整合與36個leaf屬上次規格，只作歷史，不替代本次重跑。本次本機完整重跑32/32、36個不同leaf全部成功（原budgets保留、priorRunEvidenceUsed=false）；37個單元成功、27個原owner逐位元相同；原三viewport正式／授權GM、10種正式故障與生命週期、發布產物的timing／回顧／高維副本／lazy音訊均成功。最終Renderer精確336ms命中與GM目標定位另以最新發布產物與333個影格重驗；同head完整CI不以本機較早invocation冒充。機器摘要見 `development/combat-animation/batch12/verification-summary.json`。

**最終Actions、main合併SHA、合併後Actions與Pages部署／實站驗收，以[PR #43封箱附記](https://github.com/franksky1207/rpg/pull/43)記錄並綁定實際提交**；此連結避免把報告自己的提交SHA誤當之後的main合併SHA。未通過任何必要門檻均不得合併。

原動作與圖集資源測試仍保持：18種真raster姿態、全部六動作加死亡終態不同、零邊緣裁切、原4MiB限制、100 actor生命週期、恰好3次decode。原正式故障案例仍注入404／SHA／decode／slow／Canvas，不以新URL逃過故障。無生成式AI素材、無補圖要求。

`tests/runtime/batch12-presentation-safety.cjs` 保護27個原owner；`scripts/batch12-visual-evidence.cjs` 實際渲染正式Renderer；新增 Batch12 Material Selected Attack Acceptance Actions 重建來源衍生圖集及渲染。原Batch5、Batch6、Batch7、GM、Formal、Sprite、Runtime、Publication等workflow保留。
