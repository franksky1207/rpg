# T2-B1｜隔離比較入口、共同舞台與事件播放控制

## 起始基準、來源與範圍

起始 main／HEAD `e28ef6cbca2d818074e4cb441340efa03ad5a007`，工作目錄乾淨、fetch無其他新提交。T2-A六個exact-HEAD Actions全部success（含Runtime、Stage4、Optimized Pages及專用T2-A）。依使用者指定順序核對PROJECT_HANDOFF、路線圖、四份T2-A規格與JSON證據、T1-C/B/A、轉型草案、實作計畫及GM目錄，並重查Bridge／SharedLoader／Runtime／FormalSnapshots／Appearance／CharacterAssets／TestCenter／fixture與量測工具／四份資料／publish policy。

原T2-A `--check`成功，來源SHA無變動，bundle SHA仍為 `5a74c2eeb00014b208bcb175d2bd6f7668e430112dc7ebec8a7b5ac3ced83d99`。**沒有重生或修改Fixture來掩蓋來源差異**。T1-A/B/C正式接線與原廠工廠／模型／音訊／GM保留；真帳號、OS背景、真手機/GPU/音訊長測仍待驗。

本批僅B1技術平台，不是B2美術、B3 Renderer、B4效能採樣或T2-C選型。A/B/C共用同一占位框，明示Renderer未完成、動畫未接、美術／FPS優劣不能評分；原第27～40規格不改。

## 頁面、模組與接口

| 檔案 | 責任 |
|---|---|
| [開發index.html](../development/hybrid-comparison/index.html) | 不登入、不需GM；A/B/C、五場case、33外觀與三LOD；HUD、角色掛載容器、四層預留區、cue、播放按鈕、診斷。CSP禁止media、外部script、object，不載入正式runtime。 |
| [fixture-input.mjs](../development/hybrid-comparison/fixture-input.mjs) | 瀏覽器讀已生成JSON，不import Node fs/vm；核對固定bundle/controls SHA、五case SHA、13個實際來源文本SHA、身份與registry metadata；copy/freeze與WeakSet核准輸入。來源文本只hash，**不執行**。 |
| [playback.mjs](../development/hybrid-comparison/playback.mjs) | 唯讀離線播放；獨立document realm＋instance＋generation；至多一個時鐘timer、有界timeline、暫停／重播／切換／取消與背景快照；消費者與未來Renderer生命週期接口。 |
| [comparison.mjs](../development/hybrid-comparison/comparison.mjs) | DOM與設定通知、原資料選擇、占位框／HP盾／五槽資料呈現、讀取取消／retry、visibility/pagehide、BFCache返回重開；診斷集中在details。 |
| [comparison.css](../development/hybrid-comparison/comparison.css) | 共用舞台／比例／安全區與響應排版。沒有方案專屬背景、材質或VFX；占位框有明確標籤。 |
| [播放契約測試](../tests/runtime/hybrid-comparison-playback-contract.cjs) | 16單元／負向、990輸入比對、原事件保存、100次生命週期、慢/throw/reject、過期factory清理。 |
| [實際頁面測試](../tests/runtime/hybrid-comparison-platform-browser.js) | 五viewport各100次、按鈕效果／布局／隔離／背景快照、資料與source錯誤／retry／晚到載入、真導航返回。 |
| [.github workflow](../.github/workflows/hybrid-comparison-t2b1.yml)、.gitignore | 專用Node／browser／發布隔離CI；本機browser報告排除。 |
| 本報告／TEST_EVIDENCE／PROJECT_HANDOFF／路線圖 | 實測結果、來源不變證據、B1～B4狀態與回復。 |

獨立頁面：`/development/hybrid-comparison/index.html`。**正式index、GM八類31案、SW與發布policy沒改**，沒有新增正式玩家入口或GM案例。頁面只用開發數值／姓名，從不讀取真State、玩家Storage、cookie／帳號／雲端／GM權限，也不呼叫fightOnce、公式、掉落、save或settlement。無Audio／AudioContext、音效重播或第二下載／快取系統。nonce用crypto，與戰鬥亂數無關。

## 資料驗證與公平輸入

固定bundle與controls SHA，必要的Schema1、source whitelist13、三正式怪物姓名／陣列定位（正式ID=null）、Case SHA／完整性、≤32的來源序列、gm-fixture lane、computed-only/partial/drop0、有限HP/盾、18asset registry metadata與授權一致。SHA改動或HTTP失敗清楚報錯，按鈕disable，可重新驗證；沒有假事件補位。開發Loader是read-only validation，不提供另套玩家下載器／cache。

`selectInput(pack,{scheme,caseId,variantId,lod})`只接受已驗證pack；A/B/C選擇在input外，三方案的input內容**完全相同**。五case×33variant×三LOD×B/C對A=990次一致性比對。input與每個frame copy/freeze；Controller只接核准input，拒絕手製／竄改資料或selection不一致。

fixture來源battleId/seq/eventId/source保留。播放ID與generation是開發會話，不新增正式事件；重新播放只重用原event。start盾null顯示未知，不改0；所有中間步驟保持原start HP/盾，只有outcome切原final，不從傷害推HP。source crit/dodge/combo/counter/drain直接依原欄；dodge的實際閃避者取原target（actor是攻擊者）。

Boss敗北case的PHP=0顯「玩家HP歸零，僅計算」；effects case兩方仍存活且actionBudgetReached，顯「動作上限中止，不是已結算敗北」。沒有死亡clip／勝負動畫或收益。effects能力為隔離輸入，不冒稱該正式怪原有技能。G00732subset與mixed的五槽身份、empty、registered-but-not-rendered與G006 helmet fallback都可查，LOD只選資料不假裝已渲染模型。

## 舞台、控制與安全區

相機參考yaw35°/pitch15°、orthographic比較基準，**本批沒有真正3D相機**。靜態足點玩家(.25,.78)、敵人(.74,.78)，player高.38H；normal .36H、elite .42H、Boss .56H，直式最高.50H。背景0～.30、中景.30～.82、前景.82～1，Boss(.44,.14)～(.93,.78)安全區；角色、動畫、特效容器均可供B3接入。

HUD及控制在stage容器之外，safe-area與流式排版；文字16px、觸控按鈕≥44px，窄窗自然捲動，无scroll lock／新全螢幕控制。五個規格viewport實際檢查HUD不被stage蓋、兩占位框在範圍內、足點誤差<.01 UV、控件在舞台之後、无水平溢出。3/4只作固定構圖參考，CSS占位不是高品質2.5D。

播放、暫停、繼續、重播、停止均有真正狀態效果。ready→idle→prepare→approach→strike→known-effect→return→idle→outcome→closed；prepare120ms／approach180／strike100／effect120／return180＝共同700ms。這是離線示範節奏，與正式速度／等待無關。prepare/approach/strike/return的框位變化是純視覺cue，不是新權威事件或已存在的attack clip；sourceEvent只在已知來源步驟交付。

## 取消、背景與未來Renderer接口

- 每controller至多1個timer、timeline≤256，訂閱最多16、每訂閱1 in-flight＋1最新pending（舊frame合併，coalesced有診斷），沒有無上限動畫佇列。永不resolve consumer跨100場仍只一個in-flight，不阻塞主UI／時鐘；throw/reject計數並保留首警告。
- 每次scheme/case/variant/LOD切換使舊generation失效、abort lifetime與delivery、dispose session-owned consumer/resource、清timer與pending。即使舊timer執行或Promise晚到，也不改新stage。暫停保留remaining delay，只取消動畫delivery，session資源可保留，繼續不重播已交付source event。
- 播放／暫停中進背景：abort舊會話、略過剩餘visual/source action，顯原computed-final checkpoint；前台只顯snapshot，SourceEvent=null、不補播攻擊或聲音。尚未播放的ready進背景保持ready／start。測試包含模擬visibility，不宣稱真OS背景節流已驗。
- Fixture reload有獨立loadTicket與AbortSignal；快速切case只保留目前選擇，不重算／重fetch每次切換。重驗時清input／舊HUD，late reply無權提交；晚到錯誤不蓋新成功頁。無Observer，十二個DOM/lifecycle listener只安裝一次，replay不增。
- pagehide清理input/pack、timer、訂閱與listener。BFCache持久化時留**單次pageshow恢復hook**，返回自動重載、重新驗證與初始化，執行後移除；不是長期timer或重複Observer。顯式dispose測試12→0 listener。
- `subscribe(fn,{signal,dispose,sessionOwned})`給frozen frame與`{signal,isCurrent}`；使用者可abort／dispose同一callback去重，sessionOwned會隨會話釋放。晚到async動畫必須再驗token，不能自行修改新stage。
- `bindRenderer(factory)`是接線接口（沒有A/B/CRenderer）。factory收到只讀input/selection、lifetime signal/isCurrent，回`{onFrame,dispose}`；未完成factory至多1個，錯誤可重試、不堵播放；stale完成自動dispose一次。factory本身也須尊重AbortSignal並釋放尚未回傳的資源；JS無法強制結束不合作的never Promise。dispose會撤回controller所有權，late返回仍釋放。

本批只測control、source與mock／DOM占位資源，**不是GPU回收測試**。原角色／裝備browser回歸是舊正式3D系統證據，不是新Renderer已完成。

## 實際自我檢查與限制

完整逐指令、源碼SHA與browser摘要見[TEST_EVIDENCE](3D_HYBRID_T2B1_TEST_EVIDENCE_2026-10-12.json)。主要指令：

```sh
node scripts/hybrid-comparison-fixtures.cjs --check
node tests/runtime/hybrid-comparison-playback-contract.cjs
node tests/runtime/hybrid-comparison-platform-browser.js
node tests/runtime/hybrid-comparison-contract.cjs
node tests/runtime/3d-formal-snapshots-contract.cjs
node tests/runtime/3d-shared-loader-contract.cjs
node tests/runtime/combat-events-contract.cjs
node tests/runtime/combat-events-integration.cjs
node tests/runtime/gm-3d-test-center-browser.js
node tests/runtime/3d-player-assets-browser.js
node tests/runtime/3d-equipment-assets-browser.js
node scripts/build-publish-dry-run.cjs
node tests/runtime/publish-candidate-browser.js
```

16新契約通過（990一致比較）；T2-A17/T1-A15/T1-B10/T1-C26/整合4共88核心契約通過，標準core576／鏡像48結果比較不變。五尺寸各100次＝500次實際按鈕／資料切換，另100次控制器fake-clock生命週期，source/schema fail／retry、晚到載入、真導航/返回/重開通過。JS與三mjs語法、HTML cache-bust、490 manifest指紋、18 GLB、29音訊Node測試、save/cache／publish policy通過；GM桌機手機各31、玩家／G007原browser回歸通過。

精簡成品仍385檔/36482365 bytes，全部HTTP/bytes/SHA、17音訊解碼／49媒體cache/Range/save隔離通過。開發HTML/mjs/css/fixture／測試都排除，正式index/resource-manifest、資產／SW不變，玩家沒有新下載。未宣稱改善性能。

自我檢查修正：暫停與session取消拆開signal；未驗證input與不一致selection拒絕；慢consumer不能因切會話重置busy而累積Promise；BFCache返回需重新初始化；手機占位文字縮短避免溢出；dodge UI取target。最初 immutable command使用`*.js/css`誤含開發測試，改成top glob只檢正式根檔；這是驗證範圍修正，不改產品或放寬有意義斷言。

環境為Chromium/SwiftShader與隔離標準TTF/OTF Fontconfig；真iOS/Android、硬體safe-area／橫直、OS背景節流仍需實機。沒有新WebGL Renderer、animation／美術、FPS/GPU/長期效能測試；B2/B3/B4與T2-C全部未施工。原50場native音訊本批不重跑（正式音訊源byte不變、起始exact-HEAD Runtime已全過），本批29音訊契約＋17解碼與開發頁禁止storage/audio/雲端/GLB網路行為補足隔離證據。

## 玩家／開發者操作

正式玩家網站沒有新按鈕或畫面，不需要測新的2.5D。開發者從repo root：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

桌機開 `http://127.0.0.1:4173/development/hybrid-comparison/index.html`，不能直接file雙擊HTML。手機用開發環境的**HTTPS轉發**URL＋相同路徑；Android可USB localhost轉送後用localhost。普通LAN明文HTTP的crypto.subtle可能不可用，頁面會清楚報錯，不跳過SHA；不需真帳號或GM密碼，不能拿正式Pages路徑當開發發布。

依序切A/B/C、五場case、33外觀／三LOD；播放／暫停／繼續／重播／取消；播放中換設定／切背景／返回，確認只顯當前快照。檢查HUD與按鈕不互蓋、開始盾未知、effects中止不演死亡、PHP0 case只顯計算結果、G006頭盔fallback和空飾品。占位框不是角色／敵人模型，沒有真正攻擊動畫。

## 提交、回復與B2前置

程式施工完成HEAD：`2f7f1fd94220174d89dfbf8cef66becf6666d1cb`；起始HEAD見首節。最終main為其後的交接／證據提交（parent為此程式SHA），exact-HEAD CI由該完整SHA獨立查核，避免提交内自我引用。running不可宣稱通過；完整SHA及狀態見交付回報。

回復依序revert本批交接／證據與程式提交（開發入口/模組/CSS/測試/workflow一起），不清正式State、帳號、Cache或雲端。B2須另行授權，先核對B1 final CI與實機限制；按T2-A定義提供原創/合法A五槽層、同源三敵.blend/動畫/B圖集/C GLB、53骨相容玩家attack/受擊/dodge/return、G007極端姿勢與未封版美術。此頁的mount容器與Renderer contract供B3接入；B4才量效能，T2-C才選型。**本批停止，不自動進B2。**
