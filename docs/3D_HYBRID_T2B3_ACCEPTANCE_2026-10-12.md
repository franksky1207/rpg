# T2-B3：A／B／C 完整隔離戰鬥展示

本批只完成開發展示，**不是正式公平選型、美術封版或效能驗收**。開工以 fetch 後 main `e094f4e8704a808c94551acd9226c2982c67c537` 為基準，乾淨工作目錄、該 HEAD 十項 Actions 成功；提交前再次 fetch 確認無遠端新提交。最終提交及 exact-HEAD Actions 以提交後 GitHub 狀態與最終回報為準，機器證據不寫自我參照 SHA。

使用者本次明確授權在 B2 r2 兩項 C 未過的情況下執行 **B3 開發展示**。原 r2 前置表、失敗指標、圖片、GLB、原始工程與圖集不改成通過，也不覆蓋。正式比較仍受這兩項 Gate 阻擋。

## 接入範圍

沿用 [既有比較頁](../development/hybrid-comparison/index.html)，没有另一套播放器。A 為五槽獨立 PNG16 深度組裝的玩家圖集＋敵人圖集；B 為即時 GLB 玩家＋同源敵人圖集；C 為即時 GLB 玩家與敵人。B/C 用既有 Babylon.js 7.54.3 本地 vendor，SRI 核對；WebGL 每畫格實際渲染後進入同一 Canvas2D 舞台。A 首次使用不載入 Babylon、不建立 WebGL。

三方案共用 source camera、角色站位、128／192／256 tier 可見像素、舞台背景／中景／前景、接地影、HUD、傷害數字、crit／combo／counter／drain cue、事件投影、取消與釋放接口。Boss 用原 stage／portrait cap，HUD 不被角色覆蓋。場景是開發展示 UI，非正式 UI 定版。

- 玩家保留原53骨、9掛點與三LOD。G007十五個正式GLB及210套／1050槽映射不改；32子集合、混穿與空槽可看。skinned掛載核對骨名／bind matrix，rigid掛到實際socket；沿用正式 covered-only 裝備遮蔽政策，未以遮蔽假裝解決碰撞。
- A 使用 B2 high 母圖集及既有 low／medium；每pixel深度保持16bit，不以固定slot順序造成武器／肢體遮蔽錯誤。
- G006僅「unavailable／原始裸頭，非裝備外觀」文字降級，不拿G007冒充。
- 普通遺址守衛機Lv31、菁英遠古戰爭機甲Lv34、Boss遺址中樞核心Lv35，三敵六動作均使用B2實際素材，不重設計或量產。
- 基本六動作以來源事件合法映射；counter／combo marker只顯cue，後續原attack事件才顯命中；drain數字只用來源healed，傷害只用actualDamage。不推算未知中間HP，不新增技能／事件／正式結算。收到原actor-defeated後，HUD以該來源確認HP0，未修改owner快照或正式狀態。
- defeat完整700ms僅由原actor-defeated事件及computed final HP為0時顯示；action-limit／停止／背景不假裝死亡。computed與committed仍有清楚區分。

## 時序、所有權及故障

B1 `fixture-input.mjs`與T2-A Fixture逐byte不變。Playback只在原owner clock增加原actor-defeated事件700ms視覺步驟，取消／所有權／來源不變；與原B1 HTML／CSS／UI共四檔獲授權演進，以固定main Git blob before SHA與目前after SHA核對；B2原source-lock完整保留，其餘来源繼續嚴格核對。

只有B1 owner elapsed clock：700ms、source clipStart=1/30s、22格含端點；native frame=(tick+1)*2／60fps，排除loader零格。共同視覺phase中attack至300ms保持impact，520ms起return將源700ms取樣映射到180ms；hit於impact後映射，三方案相同。clip檢視／slider是明示純視覺，不製造戰鬥事件。rAF只讀owner，不排程戰鬥事件。

signal／isCurrent／dispose與B1 lifetime一致；晚到資產不可覆蓋目前選擇，factory最多一個pending。載入期間也掛接abort釋放；native readiness等待可被同一signal取消，GPU不必等晚到通知才釋放。暫停凍結、背景略過中間事件與音效，返回只顯有效checkpoint。停止釋放GPU／場景／rAF，只留一張明示停止的stage畫格，下一selection或page dispose移除。SHA／HTTP／vendor／WebGL錯誤明示，不能把占位當完成；可改選A或重新驗證。靜音且禁止Storage／正式state／Audio訪問，沒有新音訊播放器或玩家下載入口。

新增玩家原studio HDR與可編輯actor-free `.blend`，由原B2玩家光源工程實際Blender產生；不借外部HDR，也不當動畫／姿勢證據。依原原創照明CC0記錄於lighting contract與inventory，B2原工程未改。

## 驗證與證據

[機器證據](3D_HYBRID_T2B3_TEST_EVIDENCE_2026-10-12.json)列實際命令、結果、報告／log SHA。包含T1-A/B/C、T2-A、B1、B2原契約、正式核心576／鏡像48、GM八類31、角色／裝備、音訊與存檔隔離、發布dry-run及成品HTTP SHA。本機通過：B3契約12項、B1原契約16項、五種viewport中A/B/C三敵六動作810對取樣（0／300／700ms）、33外觀×三方案99例、九scheme/tier、暫停／重播／背景／停止釋放、晚到載入、錯誤SHA及100次切換；取消native readiness可在晚到通知前釋放GPU，最後factory／renderer／engine／rAF皆0。原核心576／鏡像48、GM31、音訊50、成品385 HTTP SHA通過。B3清冊135檔／12,227,229 bytes（不含inventory自身；非GPU實測），62張實際截圖，圖冊57張在1280／390寬實際解碼無溢出。

原B1無Renderer網路／12listener斷言在同頁 `?renderer=none` 保留，原斷言未刪除；預設B3由新增browser實測，不能以B1模式充當接入驗收。B2 verify_r2仍明示兩項VISUAL GATE FAILED；它的資料完整性exit0不等於美術Gate通過。

實際展示照片與測試報告位於 [B3證據圖冊](../development/hybrid-comparison/t2b3-v1/review.html)，均由實際browser截取，不是假圖片。Chromium／SwiftShader與五種viewport只是本機技術與版面驗證，**非真手機、GPU、FPS或長測證據**。自動測試不批准好看、重量感或最終美術。

## 未過Gate與後續責任

| 狀態 | 項目 | 判定 |
|---|---|---|
| 本批技術驗證 | 同頁三Renderer、來源與播放、換裝、HUD／cue、隔離／取消 | 依機器證據記錄本批結果 |
| C仍未過 | native材質／光影公平性 | r2同時間RMSE .214275032→.214556724仍惡化；本B3使用Babylon ACES對源AgX，AREA近似／IBL／陰影不同，不能當公平選型證據；本B3未量測新RMSE，歷史r2數值不冒稱B3量測 |
| C仍未過 | 肩甲／護手／劍首接觸 | 原49.604／19.831／19.474mm代理值保留，不冒稱精確穿透深度；未為Renderer改正式裝備或掩蓋風險 |
| 待人工 | 三敵美術、Boss壓迫感、臉／握姿、HUD偏好 | 使用者查看實際圖與互動後批准 |
| B4／T2-C待授權 | 真手機FPS、GPU／熱／記憶體長測、正式公平比較及選型 | 本批不施工、不選勝者 |

## 進入、驗收與回復

Repo root 執行 `python3 -m http.server 4173 --bind 127.0.0.1`，開 `http://127.0.0.1:4173/development/hybrid-comparison/index.html`。手機可用localhost USB／HTTPS轉送開同頁，不登入、不讀正式存檔。正式Pages不發布此頁；不要以正式玩家網址期待載入開發素材。

選A/B/C、普通／菁英／Boss、五槽子集合或G006混穿、low／medium／high，播放／暫停／繼續／重播／停止。用六clip與slider看attack／hit／dodge／return極端姿勢；用特殊效果fixture看crit／combo／counter／drain，該fixture能力輸入不代表敵人正式新增技能。特別留意色差、局部接觸、手機Boss安全区及觸控可見性。

本批回復：對本批提交執行 `git revert <T2-B3 commit>`；不revert先前r2，不動玩家存檔／cache。來源鎖、前版素材與Git SHA可追溯。提交後停止，未執行B4／T2-C／T3～T5。
