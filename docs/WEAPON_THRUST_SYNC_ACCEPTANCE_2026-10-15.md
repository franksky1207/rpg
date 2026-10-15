# 刀劍統一、前衝突刺與戰鬥時間同步驗收

基準 main：`8972b362534018cabc9e34ad7863a0d8dd87f7a6`。本次不生成／修改圖片、不新增骨架或套件、不修改三紀元公式、攻擊間隔、存檔 Schema17、音訊／背景／極簡 owner。最終提交及 exact-HEAD CI／Pages 以交付回報及 GitHub runs 為準，本文件不預填成功。

## 實作

- 重新從正式來源核對210套／1,050槽：銀河100保留，宇宙70改名／30保留，高維H01～H10共10保留抽象名稱。70個逐ID對照及舊名見 [明確映射](WEAPON_NAME_MIGRATION_2026-10-15.json)。所有正式武器名稱無槍／炮／戟／矛／鐮／斧／鎚／錘；銀河及宇宙具刀／劍／刃／鋒語義，210武器名稱唯一。
- `secondworlddata.js` 為正式名稱owner；原gear存檔正規化沿 `savemigration.js` 更新宇宙武器名稱，僅同步同舊名的visualKey，保留自訂視覺鍵。裝備ID、來源Boss、品質、強化、屬性、鎖定、背包及lostGear保留；不清除存檔或雲端資料。自訂名稱與其他紀元／槽位不套映射。
- 生成器／現行索引／可讀總表／70套正式及人工設計文字／180套後續規則／GM catalog同步。`_concept-identities.json`只有永久ID／來源鍵／目錄，無舊武器名稱，不改其身份。原review、manifest、既有圖片、歷史驗證、immutable fixture、舊source鏈不全域取代。新來源鏈逐SHA接本次基準，舊鎖和負例照驗。
- G005／G007／G018共用 `WholeSuitActor`＋`weaponPose`：短蓄力→身體與武器共同快速前衝→命中光效→回位；武器攻擊朝向依既有分層圖定位，腕部連續角度範圍0.10rad（約5.7度），取消大角度風車揮動。沿用原透明WebP、握點遮罩、16MiB上限、兩資源併發、SHA、非阻塞載入、2.5秒可選武器截止與引用釋放。
- 700是既有素材的**標準化取樣座標**，不是等待700ms。正式OwnerClock以原impactDelay／stepDelay映射命中336及回位700；GM以原Playback虛擬時鐘映射相同命中336。速度與暫停沿各自原owner。三套及未來207套共用模板，沒有新增戰鬥事件、傷害、計時器或動畫等待。
- 正式presentation owner於取出事件時記錄 `actionStartedAt=performance.now()`；OwnerClock讀原始起點，不再從首次畫格起算。晚到畫格直接追上事件，不重播攻擊。原缺少起點的測試／舊owner可沿既有取樣起點相容。鏡像播放也記錄起點，並與標準播放一樣提供既有options.sleep測試注入；預設仍使用原structuredSleep。
- SOP／雙階段SOP／總計畫／第28批後續／GM規範已加入當前刀劍規則，歷史段落保留。G001～G030不重製，G024／G030接受結果不變。未來207角色與180套概念仍未製作，不能標為完成。

## 自動化方法與數據

可重現命令與原始結果在 [本次證據](evidence/weapon-thrust-sync)。CI在原正式戰鬥workflow新增names與timing，沒有取代舊測試。

| 檢查 | 結果 |
| --- | --- |
| 概念資料／審查／負例 Python | 68通過、0失敗 |
| 原角色素材 Python | 17通過、0失敗 |
| 共用角色／正式／GM／分層 Node | 37通過、0失敗 |
| 名稱與相容 | 210 ID、1,050槽、70 alias；210個gear容器遷移＋重入冪等、60原圖byte一致、immutable fixture一致 |
| 正式核心 consumer 隔離 | 576組標準核心結果／完整State一致，另48組鏡像核心一致；4測試通過 |
| 真發布包正式UI | 三尺寸三套＋死亡／閃避共11場；HP與owner逐樣本一致，零殘留refs |
| 真發布包GM | 三尺寸三套9場；原31例／8類、速度、暫停、重播、停止、死亡、選角、正式／自由隔離及單Canvas通過 |
| 正式回退／生命週期 | 11情境：無甲／未知／主圖與武器404、SHA、解碼、慢載入／反覆進出；不阻止結算且引用釋放 |
| 高維主線／回顧／虛空／鏡像 | 原正式入口實跑；回顧唯讀State一致，虛空／鏡像正常結算 |
| 背景／極簡 | 高維桌機及手機、銀河／宇宙／虛空Chromium通過，HP／盾持續更新 |
| 音訊 | 原native browser 50案例通過；完整正式角色模式另納入CI驗證 |
| 發布 | 412檔、約37.40MB、0缺失引用；32背景／6音樂／11音效檔保持 |

`node tests/equipment-weapons/timing.cjs` 在實際瀏覽器載入正式JS，對**相同固定事件序列**呼叫實際標準／鏡像presentation owner；使用原sleep注入虛擬時間，加入17ms延遲視覺取樣。不是把RAF畫格當權威時間。涵蓋護盾、4次實際attack、combo／counter提示與後續真攻擊、汲取、閃避及HP歸零；各模式／紀元映射使用共用presentation owner（不是逐一呼叫所有玩法的獎勵交易）。另由原core隔離測試和正式UI測試核對計算與真結算入口。

24個適用模式／紀元組合 × 3速度 × 正常／中途重綁切換／極簡／背景四種取樣情境＝288組。逐筆比對開始事件index／類型／時間、HP與盾變化時間、播放返回總長。權威容許誤差 **0ms**；結果最大差 **0ms**，無遺漏／重複。取樣座標容許浮點誤差1e-9，實測0。1×總長1150ms、1.5×768ms、2×575ms；兩模式各組完全相同。此固定序列是可重現測試資料，並非宣稱所有實際戰鬥都耗時相同。

瀏覽器真畫格沒有0ms顯示保證：測試刻意延遲17ms後，要求畫格追上原起點；另OwnerClock負例直接驗證首次取樣已過命中仍呈現hit／return，不重新蓄力。原GM實際暫停150ms角度保持，原Playback測試繼續驗證暫停／繼續／速度；正式戰鬥不新增暫停功能。背景／極簡測試不以視覺播放作結算門檻。虛擬時間不量測實體手機系統排程；30分鐘熱／GPU與真機App切換仍需實測。

過程修正：舊揮動測試原要求大角度旋轉，現改為突刺階段、共同位移及明確角度上限；保留HP、死亡、故障、SHA、釋放與存檔斷言。正式2倍速首畫格可能已在return，斷言接受帶真武器階段的attack或return，另純取樣驗證完整四階段，不迫使owner等待畫格。鏡像原測試曾注入立即完成的sleep，現支援注入後會跳過畫格；該測試保留正式pacing以保留角色證據，所有原斷言不變。原來源保護的篡改負例新增精確新來源鏈錯誤類別，未放寬SHA。首次本機網路／child-process sandbox、未選模式遮罩、音訊Playwright預設瀏覽器缺失均屬測試環境設定，修正後重跑，未因此改遊戲數值。

## 使用者實機驗收

1. 已授權GM→GM測試頁→3D測試中心→戰鬥、動畫與特效→2.5D戰鬥模擬→自由測試。依序選G005／G007／G018，播放並切1／1.5／2倍；人物連武器前衝，刀刃不大角度旋轉，HP／盾與跳字正常。暫停／繼續／重播／停止及快速選角後只有一個人物。
2. 桌機與手機直／橫向，在同頁最大化／還原、選Boss擊敗玩家；死亡HP歸零、角色消失或倒下後正常停止，沒有殘留刀層。
3. 正式背包穿三套任一鎧甲，進已解鎖主線／回顧／虛空，切文字、2.5D、極簡；切App再回來後HP／盾繼續更新，正常結算、音樂與音效正常。
4. 原有宇宙舊武器存檔直接載入：名稱變刀劍新名，ID／品質／強化／屬性／數量保留；不必清資料。真帳號雲端往返與長時間連戰由使用者實機核對。

## GitHub與待補

最終SHA的所有已觸發Actions及Pages須推送後核對，未結束不宣稱通過。未完成的真機驗收：實體iPhone／Android、Safari觸控與App系統切換、30分鐘熱／記憶體／GPU、真帳號雲端往返。其他207套角色／獨立武器與180套概念是未來美術工作，本次未生成。回退可revert本次提交；舊名alias設計不要求重置玩家資料。

## Runtime CI 收尾

最新指紋提交 `a25755ccd8fe05cbfd3d8aef4306191c9867534c` 的 Runtime run `38687415989` 失敗於 `post-reincarnation-cleanup-batch1-integrity.js:40`：斷言仍要求2026-10-05～10-08的完整舊savemigration URL，而正式index已因本次改名相容更新為 `savemigration.js?v=20261015-thrust1`。本次只將此一**確切版本網址**期望值同步為現行值，沒有改為任意版本／正則萬用字元，也未刪除原轉生、normalizer、Schema17、gear carryover、namespace、載入次序與failure斷言。原失敗尾端證據保留在本目錄 `evidence/weapon-thrust-sync/runtime-cache-token-failure.log`。遊戲程式及正式index不需回改舊版本。修正提交須另核對最新HEAD完整Actions；失敗SHA不能視為全綠。

後續測試預跑另發現 `recent-optimization-batch4-closure.js` 同樣鎖死舊 `v4=20261007-migration-diagnostics-batch3`；一併同步為完整、確切的現行savemigration URL，原diagnostics欄位、Schema17、舊存檔matrix等所有斷言保留。這是版本期望更新，正式程式及manifest均無新增變更。

本機後段預跑完成：Runtime失敗點之後列出的62個命令入口全部通過（62/62、0失敗），包含真實點擊回顧、三紀元轉生、Schema17舊存檔matrix、carryover、load pipeline及文件／資產驗證。使用系統Chromium及一次性guest SDK、root HTTP4173；初次本機瀏覽器缺失／部分測試固定4173的設定修正後重跑，結果詳 `runtime-tail-final-summary.json` 與 `runtime-tail-rerun.log`。這些是62個命令入口，不等同62個單一測試案例；最終CI仍須在最新HEAD完整實跑。
