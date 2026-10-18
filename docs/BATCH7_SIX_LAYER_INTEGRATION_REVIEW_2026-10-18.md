# 第7批六張補圖整合驗證：未封箱、禁止發布候選

## 1. 修改內容

承接原 [PR #38](https://github.com/franksky1207/rpg/pull/38)／`batch7-era-player-sprite-20261018`，fresh-read main `29ab70fdc791dbbdce0e276a282f2e6b163f276b`、PR HEAD `d1d2df60716fd8b3150966a37d99125b87f95594` 及其10個成功工作流程。先透過連接器取得並核對完整 tree `7cb2c5a489beb4088ad15ffa296a7c8d14de3864`，再以 Git 正常 fetch 同步歷史；不是從舊工作區重建 PR。

實際解壓附件，六張原始補圖、原 manifest／README 逐 byte 保存於 `development/combat-animation/batch7/layer-sources/`；三張 approved master 與先前 WebP 均未覆寫。來源 ZIP 3,400,125 bytes，SHA-256 `e0b07a1c2012ab7ec0bc940119a046635d794c300b5a4b7976966b891f4bc459`。

新增 `scripts/batch7-review-layers.py`，固定核對來源 SHA、格式、尺寸、bytes、實際 Alpha、四邊 Alpha，產生可重建的512座標比較、原劍局部及握點重組圖。`layer-review/review.json` 記錄三套各8項人工視覺檢查、來源、圖證 SHA、暫定定位及六動作阻擋；暫定定位不進正式 Renderer。候選 manifest 與重建腳本連結同一份 review，沒有放寬發布旗標。

新增測試直接呼叫**現役** SpritePool 與 WholeSuitActor，確認三套未允收候選在 formal／GM 兩種 usage 均拒絕、零 fetch／decode／引用、Actor init 失敗釋放 Canvas；即使單一旗標誤開也拒絕。安全 workflow 新增來源與 review 驗證、三項新測試及圖證 artifact，沒有關閉既有測試。

**高維披風依使用者追加指示選擇最簡方案：獨立靜態後景層、與身體共享整體變換、不做布料模擬。** 不再要求為披風擺動補出整片隱藏紋理；禁止披風／身體相對變形以免露出未畫結構。星環仍需前後層，四顆外部星體仍需獨立 Alpha；此方案是施工約束，尚不是已完成的圖層。低負載方案不增加粒子、模糊 filter、獨立 RAF 或額外戰鬥時鐘。

未把六張補圖直接換成新角色。正式 Renderer／Presenter／Actor／Pool／GM 及其舊發布資源未更動；外觀設定契約、Save Schema17、玩法與音效保持原狀。未進第8批或修改 Issue #37。

## 2. 程式與素材自我檢查

### 原始檔案校驗

| 原始補圖 | 尺寸／格式 | bytes | SHA-256 |
|---|---|---:|---|
| galaxy_attack_body.jpeg | 1254×1254 JPEG RGB | 244984 | `425771d77267b4c71a621b025cc1cfebfdccf9b23fa1c5882a76dd53f6d5bc04` |
| galaxy_weapon.png | 1254×1254 PNG RGBA | 684261 | `a7826c8251cac295c18e407c9754c0bdb71a597a2427d36b086305a6e3edae2d` |
| universe_attack_body.jpeg | 1254×1254 JPEG RGB | 586797 | `80fb84f81ff41cedd9be2da1d49e7e5cf79d50474d11f167002687350957ec42` |
| universe_weapon.png | 1254×1254 PNG RGBA | 612210 | `5e19114ece1139e673cd3e8f0af77c4a0e3bf8a1ae09426a34b46bbeaf983fad` |
| higher_attack_body.jpeg | 1024×1536 JPEG RGB | 612102 | `6f78638a2a7885bda96dd29c384629bc421873dc0cce7e3978f8f020d5bfac6f` |
| higher_weapon.png | 1024×1536 PNG RGBA | 802796 | `30baa0c3a02ba9abb54301de06f3b3db4f04aa5b042d28c27d6e89bb5f911b52` |

六檔均與附件 manifest 一致。三張身體**均沒有 Alpha**；宇宙棋盤已烘進 JPEG，不是透明顯示。三張武器有實際透明像素，四條邊最大 Alpha 均0；銀河／宇宙範圍0–255，高維0–254。高維沒有255不代表格式錯誤，也不代表已驗收光暈。三張核准母圖及先前候選 SHA 另由原 `batch7-source-assets.cjs` 與 `batch7-audit-images.py` 繼續鎖定。

### 可視化重組與8項檢查

圖證：[銀河](../development/combat-animation/batch7/layer-review/galaxy-review.png)、[宇宙](../development/combat-animation/batch7/layer-review/universe-review.png)、[高維](../development/combat-animation/batch7/layer-review/higher-review.png)。每張包含核准母圖、補圖身體、重組假設、原武器局部、新武器端點對齊及拳／柄放大。背景刻意保留，不能把這些診斷圖當透明 Sprite。

| 檢查 | 銀河 | 宇宙 | 高維 |
|---|---|---|---|
| 1 身份／盔／甲／色／右向3/4 | 大致相符，僅作局部修補來源 | 大致相符，但右拳／右腳也被重畫 | 大致相符，白金甲／披風／星體仍在 |
| 2 補齊手與腿甲 | 有閉合拳、腿甲；精準局部遮罩與前手層未過 | 有補甲；另一側右拳及右腳形變，不能整張替母圖 | 補出腿部；手與武器前後層仍缺 |
| 3 完整柄／護手／刃／光 | 可見 | 可見 | 可見，但不是已證明同設計 |
| 4 夾帶人物 | 未見明顯手／甲；非像素級去邊允收 | 未見明顯手／甲；非像素級去邊允收 | 未見明顯手／甲；非像素級去邊允收 |
| 5 尺寸比例角度 | 需要縮放／旋轉，握點未定 | 需要縮放／旋轉，握點未定 | 需要縮放／旋轉，握點未定 |
| 6 接近原定稿重組 | 直接疊圖柄穿拳，未過 | 直接疊圖柄穿拳且輪廓變動，未過 | 護手彎鉤／刃根負空間變動，未過 |
| 7 Alpha／光暈／白邊／裁切 | 身體白底未允收，武器有Alpha | 棋盤JPEG不可直接上線 | 白底細金線、星環／星體未分離 |
| 8 512輪廓 | 已作同512座標診斷；正式透明輪廓未過 | 同左 | 同左，靜態披風方案仍未輸出合格層 |

端點對齊採**人工估計的護手中心與劍尖**，僅用等比旋轉／縮放，沒有把武器非等比拉長以隱藏差異。擬合後估計握點對身體拳心距離約銀河13.4／宇宙15.7／高維11.6個512座標像素。這些值受人工 landmark 影響，**不是精準握點、不是單憑誤差判定無法修正，也不能當動畫允收**；具體拳／柄遮擋問題見放大圖。最終 `finalGrip=null`、`depthAccepted=false`。

有實際嘗試銀河透明去背，輸出1254×1254 RGBA、Alpha 0–255，但不透明區對輸入 JPEG 的 RGB 平均絕對差約19.94/255，僅24.38%的不透明像素三通道差均≤8，不能證明只改背景，故拒用、不入庫、不轉正式WebP。試稿 SHA `82c01629bdd47097b72f0c0eaabba131246eea193394ee9fbacdd522b8ec2cc1`；不以生成圖冒充原來源。

因此本次新增**0張正式候選WebP、0個核定握點、0套已允收六動作**。不是漏填：在素材重組／手遮擋尚未通過時，不能把完整補圖或去背試稿冒充正式動畫圖層。六動作逐套為：銀河／宇宙／高維的待機、攻擊、受擊、閃避、回位、死亡全部 `blocked-not-accepted`。現役舊角色的六動作回歸不計入這18項新造型允收。

### 第7批固定30項

| 項 | 本次結果與界線 |
|---|---|
| 01 | fresh-read main／PR／Actions；盤點現役 contract／formal sprites／Renderer／Actor／Pool／GM／publish，保留舊依賴。 |
| 02 | 外觀設定契約與五槽脫鉤維持；正式舊Renderer選圖未替換，新的三套顯示仍阻擋。 |
| 03 | 正式紀元外觀契約回歸；新Sprite實際顯示未允收。 |
| 04 | 正式lexical state、歷史轉生、合法匯入與owner隔離回歸；不借GM解鎖。 |
| 05 | 首次高維預設／再轉生保留選擇的既有契約回歸；新視覺未上線。 |
| 06 | 本裝置帳號偏好與儲存失敗策略維持；不承諾跨裝置。 |
| 07 | 銀河母圖保留；新補圖入庫及重組完成，Alpha／前手遮擋未允收。 |
| 08 | 宇宙母圖保留；確認烘焙棋盤及右拳／右腳變動，整套未允收。 |
| 09 | 高維母圖保留；採靜態披風，環前後層與四星體Alpha仍缺，未允收。 |
| 10 | 三把武器來源校驗；高維護手／刃根設計差異須精修，固定武器未正式登錄。 |
| 11 | 512比較與pivot假設有紀錄；未把原JPEG／整合高維圖認列分層。 |
| 12 | 逐套與母圖對照及小尺寸診斷；不以整張補圖取代角色設計。 |
| 13 | 三套×六動作均阻擋；未把靜態圖或舊角色動作當完成。 |
| 14 | 沿用獨立era-*候選ID；未冒名G005/G007/G018；正式登錄仍阻擋。 |
| 15 | 來源SHA／bytes／格式／Alpha通過；精準matte、握點與深度未過。 |
| 16 | 現役Pool對三套候選formal／GM零下載解碼驗證；新正式負載未測。 |
| 17 | 沿現役架構稽核；新素材未接線，不改HP／盾／事件／時鐘。 |
| 18 | GM現役功能回歸；三套新角色六動作／握點尚不能宣稱可用。 |
| 19 | 桌機／390×844設定契約回歸；新造型仍顯示未正式推出。 |
| 20 | 帳號A/B、owner mismatch、登出登入、reload及本機服務替身驗證；真雲端未測。 |
| 21 | 新候選在實際Pool拒絕；現役缺圖／極簡／文字回退回歸。 |
| 22 | 新候選Actor init失敗釋放Canvas、無leases；現役生命週期回歸。 |
| 23 | 舊檔／合法Schema17匯入與轉生相容回歸；Schema17不變。 |
| 24 | 設定不重建進行中戰鬥、next-battle契約維持；新Sprite安全套用未測。 |
| 25 | 512／腳點假設／拳劍局部對照；最終握點、深度、反向與攻擊位移未過。 |
| 26 | 六原圖及manifest無損保存、圖證SHA、可重建稽核與精確補圖要求完成。 |
| 27 | 新來源／圖證不進正式資源或stage；無正式JS變更故不亂改SW／manifest指紋；新正式資源快取未驗收。 |
| 28 | 不授權候選GM載入；實際GM usage候選拒絕驗證，舊GM隔離回歸。 |
| 29 | 現役手機／連戰／背景／Pool壓力回歸；新三套解碼與真機發熱未測。 |
| 30 | **未通過封箱**：圖層／正式動作未允收，PR保持Draft、不合併、不部署候選。 |

## 3. GitHub Actions與實機驗收

本機結果與**本次最新施工SHA**的Actions執行URL統一記在 [PR #38 說明](https://github.com/franksky1207/rpg/pull/38)，避免為寫入本文件自身SHA再產生未測新提交。既有 `d1d2df60` 的10個success只作基準，不冒充本次新提交驗收。新增測試成功僅表示來源／阻擋邊界正確。

本機瀏覽器使用系統Chromium及既有Playwright；既有測試若未接受executablePath，僅用工作區外預載器選系統Chromium。遠端SDK使用本機測試替身，不改測試斷言，不宣稱真帳號上下載。最初sandbox阻擋socket／瀏覽器，及缺預設Playwright下載的啟動失敗均不是通過，允許本機測試後重新執行並如實記錄。

未測／未允收：新三套正式Renderer及GM六動作、精準Alpha／握點、公開新素材／快取版本、iPhone／Safari真機、發熱／熱節流、真帳號雲端。手機viewport不冒充實機。Pages僅檢查既有main部署，不發布候選。

## 4. GitHub提交與待補

唯一PR為#38；施工提交、最新SHA與Actions以該PR當次說明為準。沒有另開PR，沒有合併main，沒有部署候選。需要的精確補圖在 [PATCH_REQUESTS.md](../development/combat-animation/batch7/PATCH_REQUESTS.md)。

- 銀河：提供母圖原座標局部去劍修補／透明遮罩，保留未遮擋盔甲；提供握柄後方與前手指節的可重組層，附原位重組圖。
- 宇宙：去除烘焙棋盤並保留銀甲／紫青邊光的真正Alpha；恢復母圖未遮擋右拳、右腳，不要把去劍變成整張重畫；補前手遮擋。
- 高維：從原母圖精確分離／補全同一把相位刃，尤其護手彎鉤、刃根負空間；另給純身體、靜態可見披風Alpha、前／後環線及四顆外部星體獨立Alpha。採靜態共變換方案，**不再要求完整隱藏披風補繪或動態布料幀**；若要披風／身體相對動作再補隱藏結構。

三套均要求原尺寸、原座標、修補遮罩、原位重組預覽及握點標記；不擅自批准不同武器／角色，不用替代素材補缺。
