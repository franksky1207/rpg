# 第12批：戰鬥前向突刺、GM 單一介面與整合驗收

狀態：**施工中，突刺素材阻擋；不得正式合併、發布或封箱。** 本批沒有拆成子批次，沒有展開第13批。
基準：重新 fetch GitHub main `9748c72cd17b2c3dd0e8aaf749a4fcd821a1f23a`（PR #42）。
施工分支：`batch12-forward-thrust-final-20261019`。

## 一、修改內容與36項實際狀態

「代表性回歸」只涵蓋列出的自動案例與共用 owner，不等同全模式×裝置×狀態全部實玩。

| 項 | 實際狀態／證據與限制 |
| --- | --- |
| 01 | 已盤點：正式三紀元為 `era-player-sprites.mjs` 三張512px完整持劍WebP；`formal-player-sprites.js` 的G005/G007/G018屬保留歷史裝備依賴，未當新主角。Controller→Owner Clock→Renderer→Actor／Pool既有鏈保留。六張候選來源重新驗SHA並實際檢視三套重組圖及高維身體原圖。 |
| 02 | 已移除：canonical source與發布Actor都刪除半月弧線繪製；不加替代光環。新三紀元測試驗證攻擊沒有arc/stroke，受擊閃白仍存在。 |
| 03 | **阻擋**：沒有把整張角色移動冒充前向突刺；既有攻擊動作尚非新版突刺。 |
| 04 | **阻擋**：握柄固定、輕腕轉與獨立劍平移試算見 `development/combat-animation/batch12/thrust-feasibility.json`；垂臂姿勢不能自然伸臂，高維張掌不能直接握劍。 |
| 05 | **阻擋**：新版刀尖接觸／體型／桌機手機幾何須等合格動作素材；現有角色不得據此宣稱通過。 |
| 06 | 沿用既有敵人hit狀態與正式命中事件，未增加特效；新版突刺命中同步驗收待補。 |
| 07 | 保留三紀元共用Actor、Renderer、Clock；新突刺規則未接線，未建三套引擎。 |
| 08 | 已移除可見分類、案例目錄及搜尋，HTML無categoryList/caseList/caseSearch。 |
| 09 | 預設直接掛載唯一角色預覽，無第二層選單。 |
| 10 | 三紀元下拉沿用隔離SpritePool，無正式外觀偏好或save寫入。 |
| 11 | 同畫面六動作；攻擊誠實標成「突刺待補」，有距離參考目標；**新突刺可觀察驗收未完成**。 |
| 12 | 新增0.5／1／1.5倍速與重播。保留縮放、方向、viewport、SHA缺圖與快取診斷用於回歸。舊五情境戰場測試透過無可見選單的 `selectCase` 自動化入口保留，不刪CI能力；獨立武器正式檢查仍待素材。 |
| 13 | 正式Owner Clock／Controller／Entry完全無diff；GM倍速只縮放GM既有單RAF取樣，不建立戰鬥計時器。 |
| 14 | 原事件與反擊／連擊／暴擊／閃避／死亡契約回歸；沒有新突刺事件驗收。 |
| 15 | 27個數值、回合、收益、背景、時鐘、存檔、雲端與音訊owner逐位元對照本批main基準，新安全測試拒絕差異。 |
| 16 | 既有正式瀏覽器動畫關閉／重開、文字回退案例執行；未加常駐Canvas。 |
| 17 | 既有正式進退場、100-event／100-battle壓力、GM撤權／重入／銷毀案例執行；新攻擊生命週期待補。 |
| 18 | 代表性三紀元正式Sprite、主線／普通與Boss target及事件owner回歸，非所有Boss人工實玩。 |
| 19 | 懸賞競技手機定位、三紀元音訊與高維背景連戰案例回歸；所有排列未人工逐一玩過。 |
| 20 | 鏡像事件／音訊、虛空退出與正式高維副本、災厄catch-up／terminal、回顧重入既有案例回歸。 |
| 21 | 異宇宙正式combat／settlement契約、匹配輸入的真UI controller trace、音訊流程回歸，非真機長時間連戰。 |
| 22 | 外觀契約、轉生save保護、帳號偏好、下場生效與三外觀Sprite回歸，非真雲端帳號操作。 |
| 23 | 背景pending promise、三紀元背景、offline provenance、Fast Catch-up既有案例回歸，收益owner不變。 |
| 24 | 動畫設定／極簡／正式GM速度owner保留原契約；GM本地預覽倍速不接正式速度。 |
| 25 | 第11批音訊程式完全不改；原生音訊生命週期及lazy SFX回歸以實際結果記錄，不以靜態保留冒充播放成功。 |
| 26 | Schema17矩陣、save/load、轉生保護、GM正式state/localStorage無差異；**真帳號雲端登入寫入未測**。 |
| 27 | 正式戰鬥與授權GM桌機／390×844／844×390三viewport回歸；新刀尖幾何未通過。 |
| 28 | 正式HP／透明背景／手機連戰錨點回歸，未恢復戰鬥文字框。 |
| 29 | 沒有新增正式Canvas／RAF／Observer／事件訂閱；Pool預算、refs清零、100個actor生命週期既有測試沿用，非實體裝置長期記憶體斜率。 |
| 30 | 有自動化手機viewport；**iPhone發熱、耗電、熱節流、Safari長時間連戰未測**。 |
| 31 | 三紀元正式素材、候選六層、怪物共用輪廓、32背景、既有音訊與174筆B-only依賴保留；不恢復概念圖、不誤刪舊資產。 |
| 32 | 重新生成canonical發布Actor SHA／bytes與resource-manifest，更新直接module和HTML快取鏈。正式三紀元身體／武器資產未換代，無新舊配對發布。 |
| 33 | **未發布**：本分支只做publish dry-run／stage核對；Pages維持main，不能宣稱新動畫上線。 |
| 34 | 語法、SHA、單元、GM／正式Battle、16類歷史整合回歸執行及修復中；新版突刺驗收阻擋，不能標36/36完成。 |
| 35 | 專用分支／Draft PR保存可審查修改，核對該head Actions；因核心突刺未完成，不合併main，合併後Actions／Pages無本批證據。 |
| 36 | 更新handoff、本報告、素材運動試算及測試文件；**未正式封箱**。 |

## 二、程式自我檢查與證據界線

- `tests/equipment-gm/no-attack-aura.test.mjs`：三紀元實際Actor取樣，禁止半月arc／stroke、保留Sprite與hit flash。
- `tests/runtime/batch12-presentation-safety.cjs`：27個正式owner與基準main逐位元相等、可見分類不存在、歷史自動入口保留、缺美術不能標允收。
- `tests/equipment-gm/browser.cjs`：三viewport、三外觀、六動作raster、目標／倍速／重播、缺SHA回退、rapid switch、Pool budget／refs、授權撤回、state與localStorage隔離。
- 歷史GM瀏覽器測試只把原可見分類點擊改成程式測試入口；保留五情境、播放／暫停／停止、載入失敗、退出釋放、雲端零請求、最大化及手機還原斷言。舊API版本6等待更新至7，無延長timeout。
- 本機Playwright下載的headless shell所有文字（包括Latin）不繪製；相同頁面改用系統Chromium後原可見性斷言通過。相關測試增加可選 `CHROMIUM_PATH`，CI預設瀏覽器不改。
- 不使用先前invocation資料；整合runner每次重新執行所有不同leaf。初次失敗包括舊API版本等待及原生音訊案例，保留失敗紀錄並重跑完整矩陣，不忽略紅燈。
- 詳細最終數量、SHA、PR與Actions請見本報告後續證據附記及PR checks，不把本段測試清單當成功宣告。

## 三、Actions與發布驗收

必須核對Draft PR最新head各必要Actions；通過也僅代表安全修改回歸，不代表新版突刺美術、刀尖接觸或第12批封箱。
因素材阻擋，**本批無合併後main SHA、無第12批Pages發布**。目前正式main基準是PR #42。
iPhone真機與真帳號雲端操作明確未驗收。

## 四、最少待補素材與提交

以既有靜態垂臂身體為起點，保持握柄不動只能轉腕；三套劍軸仍向下約34～45度。把獨立劍向前移40/512，180px顯示下會離手約14px。這是明顯錯位，不能出貨。

可採兩條最小路徑，擇一補足三紀元即可，無需重繪武器、怪物或背景：

1. 每紀元一張可向前握劍的無武器身體，再分出可轉動的持劍側上臂／前臂閉拳，並補齊其下方身體；共用輕量2D關節／握點規則。
2. 每紀元兩張匹配的無武器攻擊姿勢（短蓄力、向右3/4伸臂突刺），手掌閉合、明確標註握柄座標；可用既有獨立武器配合姿勢切換與小幅插值。此路徑最低六張姿勢圖，不要求像素級手指遮罩。

透明PNG/WebP、512×512、站腳pivot `[0.5,0.9]` 與正式三套身份一致；高維仍無披風／星環／漂浮物。僅有新身體或武器獨立平移不滿足要求。

本批不以未核准候選硬接正式Renderer；不合併或封箱。補齊素材後仍在同一第12批PR續作，完成刀尖幾何、Owner Clock命中與全回歸，再驗證最新main／Pages。

## 驗收追蹤附記（PR #43）

- Draft PR：[43](https://github.com/franksky1207/rpg/pull/43)。初始施工提交 `e24c19a3af706bf793877295be7ba1120b305241`；快取與歷史保護修復 `ff6d38dbd3ac6f48b2489b820bfc323c9b447adc`。報告後續提交會形成新的head，須另查checks，不能拿本節較早SHA代替。
- 本機：JS structural integrity（414檔、Schema17）、31項單元測試、27個正式owner逐位元保護、SHA／資源manifest／發布dry-run與174依賴stage、三viewport授權GM、GM載入／真失敗回退／重啟／手機最大化、原生音訊50案例均通過。完整16類整合結果待最後invocation完成後補記；先前音訊headless-shell失敗未抹除。
- 初始Actions三個失敗同源於歷史guard拒絕 `test-center.css`。現改為精確比對main原CSS加唯一核准的單介面規則，其他CSS差異仍失敗。`ff6d38db` 的Batch7、GM Integration、GM Terminology、Sprite Pipeline實際成功；Batch5在手機scroll測試失敗（initial=0、second=948）。
- 手機scroll根因：測試只睡80ms後讀值，未保證owner已排程RAF執行；在忙碌runner讀到第一場尚未捲動，第二場才取得已提交位置。改等待owner RAF及下一個已提交frame，保留原 `initial>600`、兩場差<25、手動手勢不搶捲動、桌機不捲動全部斷言。沒有更改正式捲動owner或延長timeout。
- 尚無本批合併後main／Runtime／Pages證據，因突刺素材阻擋維持Draft；不以任何自動化綠燈替代美術與真機允收。
