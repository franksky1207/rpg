# 第 7 批｜已定稿三紀元主角原圖・Codex 素材承接契約

狀態：**三張原始母圖已逐 byte 驗證並於 PR #38 候選來源區入庫；候選去背 WebP 不等於正式 Sprite。必要攻擊身體／武器／高維遮擋補層仍未通過，禁止發布與合併。**

承接：草稿 PR [#38](https://github.com/franksky1207/rpg/pull/38)，分支 `batch7-era-player-sprite-20261018`。必須 fresh-read 最新分支與 main，不得覆蓋已完成的轉生外觀程式／測試；絕不可直接合併 main。

## 使用者定稿原圖（逐 byte 保留）

Chat 已將三張使用者核准的母圖封裝為 `civilization_batch7_approved_character_sources.zip`，內含 `manifest.json`、本說明與以下原圖。**本次已取得使用者實際上傳 ZIP，原圖與原 manifest 位於 `development/combat-animation/batch7/approved-sources/`**；Codex 需要使用者在 Codex 工作階段上傳此 ZIP，或由未來具有檔案上傳能力的流程放入工作目錄。不得將檔名存在誤認為可存取 ZIP。

| 紀元 | ZIP 內路徑 | 尺寸 | 格式 | 原檔位元組 | SHA-256 |
|---|---|---|---|---:|---|
| 銀河 | `sources/galaxy_approved_master.png` | 1254×1254 | PNG RGBA 透明 | 963810 | `06e4bf6bb0ce50f4b90d8111db3608821ef0d582400cc760920abbfb45a54e56` |
| 宇宙 | `sources/universe_approved_master.jpeg` | 1254×1254 | JPEG RGB 白底 | 294184 | `e1b438fb7f7221d05a0468277f3e53e62173e95fd553d22cf333bea31e016239` |
| 高維 | `sources/higher_approved_master.jpeg` | 1024×1536 | JPEG RGB 白底 | 587032 | `43e80f7a84ccc41f9716a1f5aba6f08d4b9fd2c969c74010fb3422b61c54f3b6` |

## 分層施工與驗收

1. 必須先逐 byte 驗證原圖 SHA-256，存入**候選素材區**（例如 `development/combat-animation/batch7/approved-sources/`），嚴禁先將未分層母圖當作正式 Renderer 圖像。採無損保留並且不要提交重複拷貝。
2. 三套為使用者**已確認的造型**：不能改色、換頭盔、變姿勢成另一位主角、改劍造型、重做新的大張角色圖，亦不可用舊 G005／G007／G018 冒充。
3. 銀河原本已有 Alpha，需驗證透明度與邊界；宇宙、高維為 RGB 白底，應精準去背，保護藍紫光暈、刀刃亮部與淺色鎧甲，防止白邊與透明孔洞。
4. 需要真正**可動畫的分層**：完整角色、攻擊身體、獨立武器為最低起點；高維依需求把星河披風、星環、星體、金線視覺元素拆成獨立表現圖層，並設手機輕量替代或靜態模式；不得僅為符合九張張數而假造分層。
5. 角色視角右向 3/4，保持同一主角身份、7–7.5 頭身、中等機動甲，三紀元進化與適度漸增發光；依現有 Sprite runtime 設定對齊 pivot 約 [0.5,0.9]、握點、站位、縮放與武器攻擊線。
6. 現有圖片都是**站姿持劍**，不能從單張站姿圖自動保證六動作（待機／攻擊／受擊／閃避／回位／死亡）正確。若純裁切無法補足攻擊身體、遮擋與動作切換，需回到 GPT 依母圖**精確補生局部素材**，不得讓 Codex 任意重畫或從網路找替代圖。
7. 分離母圖與正式 WebP 發行物；對正式輸出核對尺寸、透明度、容量、來源、可重建性、各 SHA、license、manifest、下載及快取策略；新素材未完整與現役 Presenter／Renderer、GM／Runtime／Pages 驗收前禁止上線。
8. 核對三紀元、第一次轉生及歷史轉生後外觀選擇、正式五槽不影響角色外觀、舊存檔／雲端／離線與 GM 分離；再執行最新同 SHA Actions、Pages 完整驗收與四段封箱報告。Issue #37 仍另外追蹤。

## 目前 GitHub 已做到與沒有做到的界線

- **已做到**：本母圖身份與 SHA-256 交接、PR #38 中外觀身份契約與轉生設定基礎、部分 CI 回歸。
- **本次已做到**：ZIP 三檔 SHA／格式／尺寸核對、逐 byte 原圖入庫、銀河 Alpha 檢查、可重建候選遮罩與 512×512 WebP、候選 SHA／容量／定位紀錄。
- **未做到**：精準去背允收、可動畫 Sprite 分層、正式新動畫、GM 與 Pages 新素材驗收；不得宣告第7批封箱。候選與待補圖詳見 `docs/BATCH7_INTEGRATED_ENGINEERING_REPORT_2026-10-18.md`。
- Code／測試／原始美術以最新 main 與分支內容為準；本文件不授權繞過任何驗證器。