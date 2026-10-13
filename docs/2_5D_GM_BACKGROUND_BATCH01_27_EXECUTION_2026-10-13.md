# 2.5D GM／背景同步／原第01～27批相容性補查驗收

起始 main：`b2e4f3c69a387f7c86412ed4cd4687f6b13a6552`；施工前對照：`615abc47d60eca493f772086af494213a9890045`。首次修正提交：`c846461b`。A／B／C程式施工與本機自我檢查完成；最終推送HEAD的Actions必須獨立核對，不能把起始14項綠燈或前一SHA結果套用。機器證據見 `docs/evidence/gm-background-compatibility/acceptance-summary.json`。

## A：GM單一B入口

八分類／31案例保留，原C-15-BATTLE整併為「2.5D 戰鬥模擬」，另可切回原「戰場與生命顯示」及atlas-review。新入口沒有A/C切換，沒有比較頁iframe：直接重用既有Fixture驗證、Playback、B Renderer與NativeActor/AtlasActor，於原GM舞台掛載。五種基準戰／敵敗玩家／菁英效果、五槽混穿／空槽、三LOD／圖集品質、六動作／畫格、播放／暫停／繼續／重播／停止均實際驗證。

真B在1280×800、390×844、844×390播放；每案例有實際draw的sourceFrames與cueFrames，不是只載入空Canvas。三品質各測空槽、五個單槽、全穿與G006/G007混穿；G006缺材明示，不冒用G007。切案例／快速換裝／停止／舊工廠晚到釋放，原31案例、唯讀正式快照及圖集能力仍保留。

修正GM/比較管線共用Babylon的重載：現成或仍在載入的共用engine均重用，僅補本地GLB decoder；修正最大化呼叫沒有resize方法的B適配器，以及還原時固定跳舞台而未保留啟動位置。手機按鈕與選單不溢出，還原後等待正式layout frame確認原捲動位置。取消後不保留舊fixture API、listener、RAF或GPU。

真授權父頁／同源iframe驗證：正式角色能力、EXP、裝備／背包、三紀元與轉生身份不變，正式save呼叫0、可正常返回。B永遠是靜音fixture，不接正式戰鬥/音效owner、不發收益或寫雲端。正式候選與原Pages的隔離開發閉包stage後，於4181執行同一實際GM測試（三視窗＋授權iframe）通過；不把publish=false資料冒充正式已批准素材。

## B：真正重現的同步缺陷

使用者確認背景仍正式結算，症狀是敵我HUD與極簡數字不同步、補算提示殘留。實際瀏覽器重現同一presentation token已HP=0，新DOM仍1000/1000；根因為回前景／checkpoint重建`.combat-screen`後，HP owner仍綁舊screen並被guard擋下，FX卻按新的DOM id繼續顯示。

新HUD只有同token、舊screen確已斷開才可重綁，新場次或其他route不能接收舊呈現。極簡以同runId的正式runtime計數／死亡／cap及正式EXP、等級、維度之弦同步；final catch-up恢復最後正式step／snapshot並清除提示。背景跳過的戰鬥計入既有structured呈現時間及原outer gap，沿用原0.96 credit、12小時上限、速度與結算owner；沒有另一套戰鬥或傷害公式。

進入背景只取消高維已結算step的過期presentation；回來不重播舊傷害／音效，標準呈現owner在await後確認p.active才畫打擊。下一場使用新的token，敵我逐擊HP與護盾恢復。提示只有真補算期間存在，完成後移除，不殘留checkpoint框。

另一個已重現缺陷：persisted pagehide原本清空高維runtime。改為保留可恢復頁面，非persisted真離頁仍清理；reload的新document不恢復舊runtime或重複結算。共享背景owner只把原事件傳给既有回呼，其餘流程保持。

`thirdworldrun.js`與`combatfx.js`在615abc47及起始main逐byte相同；不能僅據檔案日期斷言T3改了傷害或停了計算。上述是實際重現的DOM／生命週期／補算缺陷；未冒稱已捕捉真人iOS App切換的完整OS事件順序。

## C：01～27補查與必要修正

逐批KEEP／FIX／MOVE-TO-GM／DELETE／HISTORICAL／FUTURE-28-40台帳：`docs/3D_BATCH01_27_B_COMPATIBILITY_LEDGER_2026-10-13.md`。`scripts/batch01-27-compatibility-audit.py`可重製module/factory反向依賴、19登錄資產SHA／bytes／license、三GLB的53骨／9掛點／LOD、40張概念圖、歷史原件與發布邊界。

十五共用factory全部有GM consumer，沒有依檔名刪除。T4退場的正式host／控制／hook／專用預覽CSS仍退場；有用途的正式2D背景、入口、快照、裝備、場景、音訊／雲端owner保留。跨紀元診斷改查現存battlePresentationPlan與真正的原renderer/runner，仍驗證極簡decorator委派原owner；修正舊last-finished版本1與正式版本2的不一致，沒有放寬測試責任。

第27批基座未重製；原模型、三LOD、15件五槽GLB、動畫重定向與SHA授權保留。概念索引實際在 `development/3d-source/equipment/concepts/_concept-index.json`；G001～G020／20套／40張WebP与conceptApproved=false完整保留。未開始29～40量產，後續承接28既有五槽／概念成果。

## 自我檢查與失敗修復

- Chromium／WebKit：真高維連戰、部分扣血／敵方逐擊／血條、護盾啟動與吸收、極簡數字、三次背景循環、final提示移除、新token恢復、GM關閉暫停、停止重開、可恢復／真離頁。另在正式B visual resolver失敗時同一實際高維流程仍通過。
- Chromium／WebKit：銀河主線、宇宙主線與虛空的真背景／極簡、兩次返回及停止。正常虛空原檔不改。
- GM真B三視窗、24個槽位／tier條件、五案例實際動作與cue、暫停後穩定畫格、快速取消、最大化／還原、授權iframe與已stage發布包；原GM8/31、atlas六動作pixels通過。
- 原正式B Renderer：原登錄GLB、32種可見五槽組合、100次真engine建立釋放、六動作、真Core/presentation owner、晚到DOM、WebGL context loss、缺材文字回退、State／save／audio隔離通過。
- 原玩家／裝備browser、Khronos／registry／53骨9掛點／LOD／缺材與hash拒絕、唯讀快照／1050名稱、Source locks、原不可變Fixture、36個必要静態/VM命令通過（含Core576／Mirror parity、存檔／快取／音訊契約）；最後變動後必要檢查再次执行。
- 修前失敗log保留。c846461b的CI B2／B3因combatfx舊源鎖拒絕，Runtime因靜態測試要求舊backgroundprogress URL失敗；已讀實際log、保留原combatfx精確原件及原鎖，登錄授權新SHA，測試精確對齊新cache URL。不刪/放寬原必要測試，最終HEAD需另看Actions。

原件檔含原來的空白，逐byte保留以證實歷史SHA；不為消除archive的diff空白提示改掉原證據。Linux WebKit測試環境以工作目錄函式庫補齊，不動系統與遊戲；不是iPhone實機或GPU效能批准。

## 真人驗收與回退

iPhone：第三紀元GM背景開啟→切其他App數分鐘→返回，補算完成提示消失、敌我HP／盾重新隨傷害變化、死亡／復活合理，重新開極簡後場數／死亡／cap／EXP／維度之弦持續變動；多次切換、停止重開，GM背景關閉遵守原限制。虛空仍正常；銀河／宇宙各合法背景連戰與極簡操作。

手機與桌機GM：新B五戰況、三品質與混穿空槽、五播放控制、最大化還原／返回，以及原31案例／正式唯讀快照。正式帳號雲端往返、實體GPU／弱網／30分鐘發熱与美術最終批准仍待真人，不冒認。

FULL_3D_AVAILABLE=false、formalReleased=false、Stage40未批准。回退反序git revert本任務提交，連同HTML cache-bust／manifest／source lock恢復，不reset main、不刪存檔。下一正式階段：承接28既有20套／40概念圖與五槽成果，再29～40。

## 最終 CI iframe 檢查修正

0059bb05 Runtime 的三紀元 Chromium／WebKit、W3逐擊HP／盾／極簡／視覺故障與GM三視窗均通過，但授權iframe來源畫格等待逾時；原log收錄`ci-runtime-0059-failure.log`。原檢查僅等待素材載入dataset，未確認首張實際繪製。授權iframe測試改為展開可見舞台，先驗證Renderer實際frames>0，再操作播放，維持原15秒sourceFrames>0、正式身份／save不變斷言，並補完整失敗診斷。本機實際授權iframe重跑通過；這是瀏覽器測試前置修正，不改播放引擎或正式遊戲，不延長逾時。CI具體觸發條件未完全證實，最新修正HEAD仍須確認。GM工作流程補該測試檔paths，維持統一既有工作流程。

## GM來源讀取與腳本載入的相容性驗收

e2c29bdd共有13項Actions成功（含完整B3／GM／Pages／Stage4），Runtime正式三紀元／HP／極簡／故障與授權iframe通過後，原loader測試把appearance source原文fetch與script載入合併計數而失敗。Immutable Fixture原本必須以no-store讀源做精確SHA驗證，不可刪除或省略。測試現依request.resourceType區分，仍嚴格要求Babylon／Runtime／appearance腳本各一次、注入故障的scenes模組剛好重試一次；完整來源另嚴格要求appearance原文驗證剛好一次。沒有development的Stage3候選則要求原文讀取零次、B安全回退後原31案例正常；既有post-stage發布包真B正向測試不改、不省略。

本機完整repo與獨立`.publish-stage-loader-test`候選各在1280×800／390×844實際通過，log分別`gm-loader-source-purpose-pass.log`／`gm-loader-unstaged-candidate-pass.log`，失敗原log`ci-runtime-e2-failure.log`保留。必要的單次模組與原source-SHA檢查保留，不重新製作／改Fixture。GM既有工作流程增加此原loader回歸並先執行，讓loader缺陷能提早被看見；未建立額外監控。最新收尾HEAD需再次逐項驗證Actions。
