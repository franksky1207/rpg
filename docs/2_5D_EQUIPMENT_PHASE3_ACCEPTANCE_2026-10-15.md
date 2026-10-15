# 第3批：三套真角色、共用動作與素材產線驗收

起點main `c396acf77c811e89d048479fd8eba37532c1c5c4`。開工時確認此SHA八項已觸發Actions全部success（含第2批Equipment／Runtime／B3／Pages），再施工；本批提交的Actions另核對。

## 實際完成

| 套裝 | 正式來源 | 輪廓選擇理由 | 新素材 | GM | 發布 |
|---|---|---|---|---|---|
| G007 | galaxy:earth:map:6 古代科技遺址 | 固定基準，石墨分節甲／青銅邊／青光刃 | complete | not-tested | false |
| G005 | galaxy:earth:map:4 污染禁區 | 圓罩防化盔／軟隔離服／紅罐，明顯不同於硬甲 | complete | not-tested | false |
| G018 | galaxy:solar:map:7 土星環防線 | 尖葉層甲／長裙／尖冠／土星環，窄長放射輪廓 | complete | not-tested | false |

實際執行image_gen：G007依其概念新生成一張；G005依其概念新生成再以生成角色作透明清理；G018依其概念新生成。四次均取得真PNG，沒有用概念板直接裁切、複製換色或程式假人物。原檔在`development/equipment-2_5d/v1/sources/`，G005初稿亦保留。工具原稿仍留workspace generated_images，repo僅複製保存。完整prompt／來源SHA／兩概念SHA及逐套複查在registry與review.md。

新WebP為512方圖透明整套角色，共272,992bytes；128/256格點實際約100/200px人物高，三套靜態深底對照已目視檢查，輪廓清楚、原五槽身份及主要造型相符。微小飾件／背件遮擋列建議，不要求工程級三視零差異。四次生成不代表五幅逐肢動作美術；五動作使用共用整體姿態模板，未聲稱獨立骨骼動畫或真手機驗收。

[素材與產線規格](2_5D_EQUIPMENT_SPRITE_PIPELINE_SPEC_2026-10-15.md)列出B現況盤點、可重複plan/import/validate流程、透明／腳底／朝向／格點與容量、16MiB引用計數快取、取消與回退，以及WholeSuitActor如何沿用B的draw(plan)介面。既有B renderer、官方loader／registry、G007模型與Runtime皆未改，沒有新增另一個戰鬥renderer／clock。

## 驗證與已修正問題

實跑結果保存於`docs/evidence/equipment-phase3/`，未完成的檢查不計為通過：

- 素材Python負例：17項通過，含正式身份／概念版本／SHA／缺損／跨套誤用／假完成／缺複查、GM及發布偷設true、空白／不透明假素材、匯入不覆寫及未審概念不得plan。
- 共用動畫及loader Node：9項通過，含五動作／死亡終點、重播去重／中斷／取消、共享載入、一個subscriber取消不影響另一個、晚到decode關閉、404／SHA／decode錯誤、記憶體上限與30次載入釋放。
- 原裝備資料庫：68項通過；原G024/G030接受例外、G006/G007歷史審查完整保留。僅三套asset2_5dStatus改為complete，概念批准仍30／未生成180，GM未測及正式發布false。
- 真Chromium raster：三套×五動作有實際像素變化；128px實際解碼繪製，390×844與1365×900 CSS viewport、切換／取消、20次warm reuse、SHA及404回退、release清零、page errors=0。是headless瀏覽器，非實體手機／GPU長測。
- 22條既有G007／B／T3～T4／正式Runtime／GM／發布與來源鎖回歸全部exit 0，結果見regressions.json。既有GM/G007真瀏覽器另通過三LOD、五單槽／空槽／遮蔽恢復、頭轉／深蹲／跨步及釋放，證據為g007-gm-browser.json；這不是新素材GM整合通過。
- 與CI相同Pillow11.3.0隔離驗證三套素材成功；generate重跑零差異。

初次Node測試在沙箱無法建立測試子程序；正常權限後發現attack終點sin(pi)約1e-17殘值，已令終點精確回零。瀏覽器發現pre診斷造成手機橫向溢出，已修正換行並加無溢出斷言。原生成工具的透明PNG可能最高alpha254，驗證接受>=250近不透明主體，仍強制真0透明及邊界／覆蓋，不以此接受不透明背景或空圖。初始getdata棄用警告改以等價histogram計數，資料未變。

## 保存與施工邊界

60原概念圖、舊審查、全部assets/3d與3d-test、index.html／manifest／SW／正式資料owner均以起點逐byte核對；人工notes標記外內容保留。新程式皆為development的mjs／隔離HTML及Python，沒有修改正式JS/CSS或任何由正式index載入的模組，因此不需正式cache-bust。新專用Equipment 2.5D Sprite Pipeline CI與原Equipment Concept Database觸發範圍同步。

發布稽核在暫存所有新檔後執行；新素材、原稿、preview及adapter全部excluded，沒有Pages／SW引用。正式發布資格不因素材完成而變true。第4／5批仍須按正式發布／版本契約接線，不能直接引用development網址。

## 使用者現在可驗收與第4批交接

目前可查看三套角色WebP／原PNG及本批瀏覽器證據；具備本機repo者可按規格開啟隔離頁，試三套、五動作、重播／中斷／釋放。正式遊戲與GM尚無新選項，沒有需要現在測的帳號、戰鬥、存檔或音訊變更。

第4批在既有GM相關案例接入此actor adapter與已驗證清冊，保持正式唯讀快照／自由fixture隔離、八類31案例、選紀元／區域／套ID、缺材明示回退及手機放大返回；接入時才產生可驗證gmTestStatus，不能將本批獨立頁測試當GM已過。第5批才施工鎧甲ID選材與正式B，必須沿原source clock驅動，避免重複approach與音效。

尚缺：其餘207套真角色（其中27套已通過概念、180套尚無概念）、GM整合、正式B接線與真機長測。可選武器層及逐肢手繪動畫未製作，並非本批硬門檻。回退git revert本批提交，不遷移玩家資料。exact-HEAD Actions以提交後查詢為準，不能由以上本機結果推定。
