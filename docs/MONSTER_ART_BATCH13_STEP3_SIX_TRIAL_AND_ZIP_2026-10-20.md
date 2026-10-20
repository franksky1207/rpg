# 第13批第3步：GPT 六張代表怪試作與 ZIP 交接契約（2026-10-20）

> **狀態：試作規格與 ZIP 驗證工具已建立；正式 GPT 生成的六張圖仍未產生。禁止將本文件視為六圖完成或正式 Runtime 驗收。** 所有正式名稱／ID 取自最新 main 的 [609 筆規劃映射](./MONSTER_MAP_MAPPING_BATCH13_STEP1_2026-10-20.json)；現有候選共 **20** 張，不回升至 38/40。此次僅規劃／離線交接工具，不修改遊戲程式、GM 或 Pages。

## 1. 六張試作品（納入最終20張，不另外加圖）
| 固定 assetId | 分類路徑 | 概念畫面 | 對應範例 |
|---|---|---|---|
| hm-01 | humanoid/hm-01.webp | 銀灰軍事輕甲人形；頭盔、右手小型武器，實戰小比例辨識；左向 3/4 | 武裝暴徒、突擊士兵、沙地偵察兵 |
| mech-02 | mechanical/mech-02.webp | 重甲雙足攻城機甲，厚肩甲、粗壯腿、短武器；不要做成戰車 | 重型機甲兵、主戰攻堅機甲、輕型戰車（接受粗略共用） |
| ship-01 | starship/ship-01.webp | 橫向星際巡弋／戰鬥艦，艦首朝畫面左，輪廓分明 | 黑域追擊艦、天狼環戰艦 |
| beast-03 | creature/beast-03.webp | 大型吞星異獸，明顯非人形／非機甲，頭朝左，可顯示獠牙與鱗甲 | 邊疆吞星獸、蒼白吞界獸、宇宙深井巨獸 |
| core-01 | core/core-01.webp | 懸浮多面體戰爭核心，有機械護環及中央光源，非人形 | 設施防衛核心、遺址中樞核心 |
| bio-02 | biological/bio-02.webp | 固定式生化母巢，帶菌絲／甲殼，朝左之正面攻擊部分 | 污染母體、銀冠母巢 |

### 共用 GPT 製圖規格
- 同套 2.5D 科幻 RPG 小型戰鬥立繪風格，3/4 視角，輪廓易辨、畫面清楚，非高精細3D。**怪物朝左、玩家朝右**。六張統一光源方向、適中明暗、主體形狀明顯。
- **單一怪物，完整主體在畫面內，透明背景，沒有地板／光暈背景／文字／浮水印／UI／血條**。戰艦可橫向但不可切斷艦首艦尾；完整身體且留透明邊界，避免觸邊。
- 大型Boss也先同 512×512 透明 WebP 正式輸出，不在圖中烙入巨大縮放或色彩變體；不同怪物的配色和顯示比例由 609 筆對應決定。先做六張試作、人工驗證後才批次剩下14張。
- 攻擊模板：hm-01=short-thrust，mech-02=mechanical-strike，ship-01=ranged-shot，beast-03=pounce，core-01=pulse，bio-02=pulse。**不需要另外六張攻擊圖，不用半月光環**。
- 生成時保存**實際可下載原檔**（如 PNG/WebP），將檔名固定為 `hm-01.png` 等；若工具不產生可處理檔案，需先轉存，不能宣告 ZIP 完成。

## 2. 打包資料目錄（防止 Codex 手動找圖）
```text
approved/                  # GPT 生成且人工核准的原檔，非遊戲 Runtime
  hm-01.png
  mech-02.png
  ship-01.png
  beast-03.png
  core-01.png
  bio-02.png
civilization-monsters-step3-six-test.zip
  assets/monsters/v1/{humanoid,mechanical,starship,creature,core,biological}/*.webp
  data/monsters/step3-asset-manifest.json
  sources/                 # 原檔只放交接 ZIP；Codex 不部署進 Pages
  manifest.sha256
  README-CODEX.md
```
- 隨每張實體 WebP 記錄 `assetId, path, width, height, bytes, sha256, alphaBounds`。原圖要保留供修改重製；不能用空白檔或占位圖代替。
- 使用可下載的交接 ZIP。**ChatGPT 沙盒的路徑不是 Codex 工作區路徑**；使用者將 ZIP 附到 Codex 對話／可存取的工作區，再由 Codex 解壓，不能只貼 `sandbox:/...` 給 Codex 猜檔案。
- 對大量正式整合，等 20 張都經確認後再產出**一份完整正式 ZIP**，內含 20 個 WebP、609 身份映射、色彩／scale／pivot、manifest、驗證報告、README-CODEX；六張試作 ZIP 僅為技術驗證，不能誤當成最終20張。

## 3. 自動打包與驗收規格
- 以離線 Python/Pillow 腳本批次將已確認且帶透明通道的來源圖轉成 512×512 無失真拉伸之 WebP，原始比例保留，置於透明畫布中央（正式 pivot/alphaBounds 依試作目視再修）。
- 逐圖必查：來源實際存在、至少256px、確實具透明通道（非全不透明）、非空主體；輸出為可解碼的 512×512 WebP；記錄大小/sha256/alphaBounds；若圖片缺少或不符合，**拒絕生成 ZIP**。
- 包裝：只用相對路徑及固定英文字元檔名；生成 ZIP 後再解開每張檢驗 SHA、尺寸、格式與整包完整性；產出 manifest.sha256。
- **防錯核心**：image-to-asset ID 一對一；每個 ID 不重複；最後完整包要求 20 圖皆存在且 609 筆身份都能連至合法 assetId；六圖驗證包只檢查指定六圖，不能宣稱已通過609張畫面測試。
- 交付 Codex 後：先讀 README／映射與既有 Renderer、GM、智慧下載現況；整合時使用同一資料表；不新增副本／災厄圖片、不動戰鬥數值／存檔／極簡／背景流程，Actions 通過後回報，iPhone 真機另驗。

## 4. 圖像試作驗收
- [ ] 六張有 **真正** GPT 原圖與固定 assetId；不得以示意圖／程式畫的替代圖宣稱 GPT 美術已完成。
- [ ] 六張皆面左、背景透明、符合原定2.5D；人形/機甲/星艦/獸/核心/母巢六形分明。
- [ ] 以512px及手機戰鬥顯示比例檢視，無過密細節、截肢、左右朝向錯誤。
- [ ] 跨形態大小、透明邊界、錨點及動畫模板不導致版面跳動。
- [ ] 六圖測試 ZIP 真實可讀，所有 hash 與 WebP 尺寸核對一致。
- [ ] 只在試作真正驗收成功後，才進入後14張製圖與最後完整交接包。
