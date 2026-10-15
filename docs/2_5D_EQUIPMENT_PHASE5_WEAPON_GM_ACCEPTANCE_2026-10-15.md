# 第5批補強：真武器分層及GM原戰場選角

基準main `d247d7bca45b0ee0334a6c48ca4d8f6247c86744`，fetch後乾淨且最新。保留第1～5批及原八類31例。最終提交／exact-HEAD Actions於推送後核對，本報告不拿基準或執行中的CI冒稱交付成功。

## 1. 修改內容

| 套ID／正式鎧甲 | 真正武器 | 攻擊素材 |
|---|---|---|
| G005／生化隔離甲 | 蝕毒軍刃 | 去武器補握拳底圖＋黑紅軍刃透明層 |
| G007／自律護衛甲 | 古代光刃 | 去武器補握拳底圖＋青色青銅光刃透明層 |
| G018／環軌防護甲 | 環帶光刃 | 去武器補握拳底圖＋紫色曲刃透明層 |

先核對正式registry五槽名稱，再實際查看原三張WebP。image_gen以原角色為參考製作真雙面板分層源，新增攻擊底圖及武器，技術匯出分割／等比定位到512透明格點；源PNG、來源SHA、匯出定位參數、逐圖複查及SHA留 `development/equipment-2_5d/weapons-v1/`。原三張角色／概念／G007 GLB逐byte不變。不是空白層、佔位或整圖旋轉冒充；未建立新完整人物／骨架／五GLB。

WholeSuitActor維持原五動作，只有攻擊改用分層。共用四階段蓄力／快速揮擊＋小前衝／命中弧光／收招；各套握點與旋轉角度獨立配置，武器在人物之前，最後重畫握拳小範圍遮罩。不存在同時畫原含武器人物與新武器的分支，兩張底圖皆有完整手部。原圖用於待機／受擊／閃避／死亡及安全回退。

正式B沿原OwnerClock／Renderer／Controller；新增純視覺weaponAttack時間欄位，不碰HP、護盾、傷害、公式、經驗、掉落、結算、音效、存檔或雲端。連擊／反擊的marker仍只顯示原cue，實際source=combo/counter的attack行才揮動，避免提示加播一次攻擊。汲取沿原cue。背景／極簡／文字模式／死亡／停止均沿既有生命週期取消，沒有第二個戰鬥時鐘。

GM現有「戰鬥、動畫與特效→2.5D戰鬥模擬」控制區增加角色來源／套裝／重新同步／速度。正式角色用原授權同源、requestId匹配唯讀快照及相同鎧甲選材；自由直接選三套，不改原五槽fixture或戰力設定。原Renderer增加可選playerFactory，WholeSuitActor在原玩家位置與原敵atlas／場景／命中跳字合成，並非旁邊人物預覽。原五案例／HP盾／播放暫停重播停止／動作檢視保留，速度以同一Playback虛擬時鐘縮放；切角色保留案例及速度，取消舊世代。另保留「原3D裝備測試」選項、獨立角色展示及G007真3D入口。

主角色按需先顯示，兩個武器層非阻塞載入，2.5秒截止；404／SHA／解碼／缺層／未批准只回原圖攻擊，不阻止戰鬥。每次攻擊在開始時固定分層可用性，避免中途跳圖。共用原16MiB、最多兩個不同資源併發、內容SHA快取與引用釋放；三套全熱快取約9MiB decoded，沒有全站預載。背景不運行額外武器RAF。

發布僅新增六張受控WebP，精確GM白名單14檔及獨立正式release沿原機制逐SHA／bytes稽核。正式包410來源＋兩標記412檔，約37.39MB，0缺失引用、32背景／6音樂／11音效不變；原Pages受控B staging另照舊執行。新PNG、複查及新development素材不公開。新增從本次基準串接的精確來源演進鏈，舊phase4／phase5／B1／B2／T4歷史鎖與immutable fixture不改。index／GM iframe及相關JS cache-bust、manifest同步；SW沿既有內容指紋，不清玩家資料。完整舊3D開關仍false。

量產SOP及總計畫新增獨立weaponAnimationStatus：三套complete，其餘207套not-started；不得從概念／角色／GM／發布狀態推導。未來可依武器類型提供少數動作模板或真攻擊姿勢，不要求統一刀法或骨架。G024／G030原接受結果不變。

## 2. 程式自我檢查

可重現：`python3 scripts/equipment-weapon-assets.py`、兩個publication.py的`--check`、`node --test tests/equipment-weapons/runtime.test.mjs tests/equipment-formal/runtime.test.mjs tests/equipment-gm/runtime.test.mjs tests/equipment-sprites/runtime.test.mjs`、`node tests/equipment-weapons/browser.cjs`及正式`browser.cjs/failures.cjs`。瀏覽器對實際`.publish-stage3`，先執行原build及`stage-hybrid-preview.cjs`，HTTP4189；NODE_PATH指向已安裝Playwright。新增CI仍在原正式B workflow執行，不只是孤立動畫。

- 共用Node37項通過（新武器10＋正式7＋GM11＋原Sprite9），0失敗；含非阻塞主圖、同攻擊不切層、真三層引用／釋放、四階段、缺層／跨套拒絕、404／SHA／解碼／慢載入回退。原素材Python17、概念68通過。
- GM實際發布包3 viewport×3角色＝9場，沿真正fixture事件、像素／角度／敵atlas／HP動態／暫停不動／1×1.5×2×，死亡五動作、快速切換、保留案例及速度、單Canvas、正式隱藏自由選單不能覆寫、最大化與捲動還原、退出釋放通過。完整正式state／存檔與save呼叫0；只排除原資源版本檢查器正常更新的cache索引。
- 正式主線三套×3尺寸＋真死亡／閃避共11場，正常戰鬥實際獨立武器角度變化、原位置／HUD不重疊、HP逐格等於owner、死亡後正常結算通過。2倍速某個不足一個60Hz畫格的階段可能未被20ms採樣；以實際分離武器角度變化驗證，純取樣另測四階段，未刪掉角色／HP／死亡斷言。
- 正式回退及生命週期11情境：原無甲／未知／主圖404／SHA／解碼／慢載入，新增武器404／SHA／解碼／慢載入，另9次重複進出／文字切換／場內改裝仍沿快照。都正常結算，離場0 refs／0 bitmap，原音訊dispatch逐筆等於events。
- 最高優先：高維桌機／手機背景循環、極簡與HP盾；銀河／宇宙／虛空真背景與極簡通過。50項原生正式音訊瀏覽器全流程重跑通過（主線、回顧、競技場／鏡像／虛空／災厄／AU及清理）；音訊單元20、owner9、正式快照15、B renderer12／Playback16與發布／SW／T4／01～27相容通過。
- 原GM五案例、五槽LOD、手機最大化、授權iframe且正式存檔不變回歸通過；原8類31例及G007真3D三LOD／五單槽／遮蔽／姿勢／dispose瀏覽器回歸通過，最終CI另核對。Linux Chromium／SwiftShader不等於實體手機GPU或Safari真機。

證據在 `docs/evidence/equipment-phase5-weapons/`（實際GM三尺寸報告、正式11場／11回退、背景／音訊及原GM報告、揮動截圖），CI artifact另上傳。施工失敗已處理：首次測試模式選擇遮擋／GM延遲載入入口、發布測試漏原受控staging、快速選角多個ready等待者重綁、可選武器阻塞主圖、超短階段採樣、資源cache索引正常更新誤判為存檔。原音訊首次災厄極短場景取樣失敗，完整重跑50項通過；不是改音訊或取消斷言。原測試的錯埠／缺NODE_PATH環境亦修正後重跑。

## 3. 使用者實機驗收清單

正式遊戲→已授權GM→GM測試頁→進入3D測試中心→「戰鬥、動畫與特效」→「2.5D戰鬥模擬」。在同一控制區選「自由測試」→G005生化隔離甲／G007自律護衛甲／G018環軌防護甲→播放。預期角色站在原玩家位置、武器抬起並獨立轉向敵人、命中弧光後收招；敵人、HP／盾、傷害跳字仍在原戰場。無需回背包換裝。

三套快速互切，改1／1.5／2倍速、暫停／繼續／重播；選Boss擊敗玩家看死亡與HP歸零。直向、橫向、最大化／還原、返回應無雙角色／殘留武器／多Canvas，案例速度保留、捲動位置還原。選「正式角色」只讀目前鎧甲，未知素材明示回退；自由不寫存檔，也不影響正式戰鬥選材。

正式戰鬥由玩家自行在背包穿任一對應鎧甲，再冒險／回顧／原已解鎖副本；其他槽混穿照常。確認同樣武器效果、文字切換、極簡及切App回來後HP／盾仍動、結算與音訊正常。本批沒有代改玩家存檔或新增GM配裝寫入捷徑。

## 4. GitHub提交與待補

完成後推送main並核對exact HEAD所有已觸發Actions；提交SHA／最終Actions及Pages結果列最終回報，不自引用未生成SHA。尚待實體iPhone／Android、Safari觸控、App系統切換、30分鐘熱／記憶體／GPU及真帳號雲端長測；自動化不是這些真機結果。第6批接整體封版、真機效能與長測，其餘207套真角色／武器仍未製作。回復本次補強提交即可，不需Save Schema遷移或玩家資料清除。
