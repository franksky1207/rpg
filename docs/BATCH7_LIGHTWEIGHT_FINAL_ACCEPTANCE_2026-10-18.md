# 第7批輕量戰鬥動畫正式整合驗收（2026-10-18）

## 1. 修改內容

承接既有 PR #38／`batch7-era-player-sprite-20261018`，基準main `29ab70fdc791dbbdce0e276a282f2e6b163f276b`、施工起點 `2ed46b7f8695befb96b99984e5b7911d5b07669f`。依最新輕量允收，直接使用三張核准完整持劍母圖；沒有重新生圖，沒有啟動第8批或修改Issue #37。

正式素材位於 `assets/era-player/v1/`，manifest及 `era-player-sprites.mjs` 由 `scripts/batch7-build-formal-sprites.py` 重建。銀河保留原Alpha並去極低Alpha雜點；宇宙與高維只移除連通到已列種子的中性背景，保護封閉白甲。統一512×512、pivot [0.5,0.9]與右向3/4。來源RGB造型未重繪；高維v2沒有新增任何舊裝飾。無武器身體及獨立武器仍為未發布候選，歷史精密重組報告保留。

| 正式ID | bytes | WebP SHA-256 | 核准來源SHA-256 |
|---|---:|---|---|
| era-galaxy | 95972 | `634aee890ff0e86e42956412050ba424d18fc618f28dd37a46955ed1de439e63` | `06e4bf6bb0ce50f4b90d8111db3608821ef0d582400cc760920abbfb45a54e56` |
| era-universe | 114740 | `b2c424c5523ec4e548e8791f86d1829f964f30c0e16882fe02a1f22add9128be` | `e1b438fb7f7221d05a0468277f3e53e62173e95fd553d22cf333bea31e016239` |
| era-higher | 124158 | `f1d1605f5ffa9b7a714327a1d7e1af8915d854d8fb914dde76ba84412b9a2c98` | `d0a934a3d44bd36f3da12d2169b089020cb37d818cbd41dca8fd2053f24bf661` |

正式 Renderer、共用 SpritePool／WholeSuitActor 沿用現有 Presenter owner時間；無新增正式RAF或戰鬥時鐘。六狀態由位移／縮放／旋轉／閃光／殘影／淡出取樣。整體持劍角色不需獨立武器解碼。死亡縮放與輕度傾斜限制於畫布內；攻擊沿敵方方向前移，回位平滑返回。

外觀完全與五槽裝備脫鉤。首次轉生前按正式world，首次轉生預設高維，再次轉生保留玩家選擇；設定僅本裝置登入帳號，合法匯入／雲端恢復使用正式轉生次數，不把外觀偏好放入存檔。當場固定造型，下一場才讀新設定。

GM角色頁使用新三紀元／六動作，提供方向、縮放、手機／桌機範圍、真Pool缺圖回退與資源診斷；GM戰鬥預覽亦移除舊G套裝選項。GM不寫正式資料，權限撤銷及離開釋放。舊裝備資源保留供必要歷史測試／依賴，沒有重新開放舊選單。舊 `gm-whole-suit.mjs` 已無正式消費者，保留於來源與單元測試，從發布清單及資源manifest排除；依賴稽核仍拒絕任何未分類發布模組。

## 2. 程式自我檢查：固定30項

新版美術允收不再要求逐指遮擋、精準握點、九張核心圖或六張動作圖；工程斷言、正式玩法與Save保護不降低。舊分層隔離測試仍執行，新正式素材以獨立精確路徑與SHA驗證，未將候選旗標直接翻成正式。

| 項 | 類別 | 結果 | 證據／範圍 |
|---|---|---|---|
| 01 | 工程 | 已完成 | 盤點正式 entry/controller/owner clock/Renderer/Actor/Pool、GM、舊發布依賴；必要舊素材保留。 |
| 02 | 工程 | 通過 | 正式 Renderer 按 era identity 選圖，不再呼叫 ArmorSelection；混穿／未知／無鎧甲仍顯示角色。 |
| 03 | 工程 | 通過 | 正式 world 1/2/3 契約與真頁面三紀元測試；轉生前按當前紀元。 |
| 04 | 工程 | 通過 | 正式 lexical state.reincarnation.count；歷史轉生、合法匯入與 owner mismatch 拒絕越權。 |
| 05 | 工程 | 通過 | 首次預設高維、再次轉生保留已選值；真頁面重載與匯入測試。 |
| 06 | 工程 | 通過 | 現有本裝置／登入帳號設定 owner；不宣稱跨裝置同步，不寫 Schema17。 |
| 07 | 新版美術 | 通過 | 核准銀河完整持劍母圖 → 512透明WebP；手機尺寸輪廓清楚。 |
| 08 | 新版美術 | 通過 | 核准宇宙完整持劍母圖 → 連通區去白底／透明WebP；不採JPEG補圖。 |
| 09 | 新版美術 | 通過 | 僅高維 complete_master_v2，去中性背景；無披風／星環／漂浮星體。 |
| 10 | 新版美術 | 通過 | 固定母圖代表劍，完整持劍人物單層；實穿武器不更換外觀。 |
| 11 | 新版美術 | 通過 | 三套單層Sprite，無強制分層；未重新生圖／補手指／重組腿甲。 |
| 12 | 新版美術 | 通過 | 保留來源造型與配色，統一畫布／站高／腳點；以128px及正式戰鬥尺寸檢查。 |
| 13 | 美術＋工程 | 通過 | 18組實際Canvas取樣：待機浮動、攻擊前進、受擊閃光後仰、閃避側移殘影、平滑回位、死亡傾倒淡出；不是僅改狀態。 |
| 14 | 工程 | 通過 | era-galaxy／era-universe／era-higher 獨立登錄；舊G ID未冒名。 |
| 15 | 美術＋工程 | 通過 | 原圖SHA固定，正式WebP SHA／bytes／512×512／RGBA及四邊全透明；無明顯背景、裁切與大破洞。 |
| 16 | 工程 | 通過 | 同一SHA共享promise與bitmap、最多2筆pending、記憶體上限；100次Actor只有3次解碼。 |
| 17 | 工程 | 通過 | 同一正式Renderer／Presenter／事件／owner clock，未修改HP、護盾、傷害或結算；真戰鬥HP HUD對照。 |
| 18 | 工程 | 通過 | GM中心新角色選擇與六動作、方向／縮放／手機範圍、缺圖回退、Pool診斷；戰鬥預覽亦用新三紀元。 |
| 19 | 工程 | 通過 | 設定頁轉生鎖定與三選一、桌機／390×844可操作；動畫開關維持獨立。 |
| 20 | 工程 | 通過 | 登入帳號A/B、登出／再登入、local owner mismatch 與雲端服務替身upload/download；真帳號遠端未測。 |
| 21 | 工程 | 通過 | 關閉動畫／極簡保持文字；404／SHA／decode／Canvas失敗及慢載入均不阻斷正式勝敗與原音訊事件。 |
| 22 | 工程 | 通過 | 戰鬥結束refs=0；連戰共享cache，離頁bytes=0；載入取消、舊Actor及RAF由現有controller釋放。 |
| 23 | 工程 | 通過 | Schema1/9/15/16/17相容矩陣及future18拒絕；合法舊轉生直接解鎖；Schema17未變。 |
| 24 | 工程 | 通過 | 每場route固定eraVisualId；設定只在下一場生效，背景重掛也不更換當場外觀。 |
| 25 | 新版美術 | 通過 | 右向3/4、正式前移／回位、六動作無Canvas邊界裁切；桌機與手機直橫向HP區不遮擋。 |
| 26 | 工程 | 已保存 | 完整來源／SHA／去背種子／threshold／縮放／腳點／版本／用途可追溯；六張補圖仍隔離候選。 |
| 27 | 工程 | 通過 | 新增精確發布allowlist與SHA gate、resource manifest／HTML及模組指紋；SW既有按需cache，不把三圖加入全域預載。 |
| 28 | 工程 | 通過 | GM parent+origin+requestId授權；拒絕獨立網址、權限撤銷清空lease與cache；正式state及storage隔離。 |
| 29 | 工程 | 通過 | 100次Actor、8場正式連戰、GM快速切換、桌機1365×900／390×844／844×390；CI不是iPhone發熱測試。 |
| 30 | 封箱 | 待同SHA Actions／Pages最終核對 | 本機工程驗收完成；施工與main實際SHA、Actions URL及Pages核對結果以PR #38最新四段報告為準。未全綠不合併。 |

測試入口：`batch7-formal-assets.py`、`batch7-era-pool.test.mjs`、`batch7-formal-sprites-browser.cjs`、`batch7-appearance-browser.cjs`、正式 `tests/equipment-formal/`、GM `tests/equipment-gm/browser.cjs`、既有Runtime／Batch6／Sprite／Cache／Save／Publish suite。

新規格取代舊「五動作／實穿鎧甲／必備獨立武器」的視覺斷言；對應測試改驗六動作、裝備不影響外觀、單層真實前進及故障回退。舊獨立武器單元仍保留。歷史清理測試僅登錄本次授權的精確視覺檔案與cache token，正式遊戲owner的逐byte保護未撤銷。

## 3. GitHub Actions與實機界線

本檔隨實作提交；當次施工SHA及合併後main SHA的工作流程URL、結果與Pages逐byte核對統一記錄於 [PR #38](https://github.com/franksky1207/rpg/pull/38) 最新說明，避免為回填自身SHA新增未驗收提交。Runtime、正式Battle、GM、Sprite、外觀、Batch6、Publish Dry Run與Release Gate必須成功後才能合併；合併後重新核對同main SHA的Actions／Pages。

本機Chromium及CI桌機／手機viewport只證明自動化呈現、數值與生命週期安全。**未測：iPhone／Safari真機、長時間發熱／熱節流、真帳號遠端雲端寫入與跨裝置偏好同步。** 雲端測試為本機服務替身，非真帳號證據。小尺寸視覺檢查不代表使用者另行人工美術簽核。

## 4. 提交與待補

唯一PR為 #38；施工與main SHA、是否合併／封箱、最新Actions及Pages狀態以PR最終報告為準。尚未通過正式工程／發布門檻時保持Draft，不以本文件宣稱部署成功。未把舊手指／握柄／腿甲精密差異列為必要發布阻擋；未施工第8批及Issue #37。
