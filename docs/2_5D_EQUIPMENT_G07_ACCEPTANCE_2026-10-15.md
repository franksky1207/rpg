# G07｜G031～G035 概念圖量產驗收

日期：2026-10-15。基準 main：`da80fc41a117a3d900fab34e9430928af887b3a5`。

## 圖片及正式身份

共五套、十張獨立生成 WebP（每張 1536×1024），另保留十份未修改原始 PNG。正式名稱以 `worldmaps-frontier.js`、`data.js`、`engine.js` 為 owner，非圖片小字。

| ID | 區域 | 五槽正式名稱（武器／頭盔／鎧甲／鞋子／飾品） | 圖片與證據 |
| --- | --- | --- | --- |
| G031 | 星際邊疆 → 邊疆殖民帶 | 邊疆戰刃／殖民戰術盔／遠域殖民甲／邊境推進靴／殖民指揮模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g031-frontier-colonies/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g031-frontier-colonies/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g031-frontier-colonies/review-2_5d.json) · [觀察](../development/3d-source/equipment/concepts/galaxy/g031-frontier-colonies/codex-review.md) · [來源](../development/3d-source/equipment/concepts/galaxy/g031-frontier-colonies/sources/generation.json) |
| G032 | 星際邊疆 → 星際傭兵港 | 傭兵脈衝刃／私軍戰盔／雇傭重甲／星港突進靴／傭兵識別牌 | [三視](../development/3d-source/equipment/concepts/galaxy/g032-mercenary-starport/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g032-mercenary-starport/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g032-mercenary-starport/review-2_5d.json) · [觀察](../development/3d-source/equipment/concepts/galaxy/g032-mercenary-starport/codex-review.md) · [來源](../development/3d-source/equipment/concepts/galaxy/g032-mercenary-starport/sources/generation.json) |
| G033 | 星際邊疆 → 遠征補給線 | 遠征切割刃／補給戰盔／遠征防護甲／航線推進靴／補給調度模組 | [三視](../development/3d-source/equipment/concepts/galaxy/g033-expedition-supply/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g033-expedition-supply/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g033-expedition-supply/review-2_5d.json) · [觀察](../development/3d-source/equipment/concepts/galaxy/g033-expedition-supply/codex-review.md) · [來源](../development/3d-source/equipment/concepts/galaxy/g033-expedition-supply/sources/generation.json) |
| G034 | 星際邊疆 → 異星叢林殖民地 | 異星獵刃／生態戰盔／殖民適應甲／叢林機動靴／異星生態儀 | [三視](../development/3d-source/equipment/concepts/galaxy/g034-alien-jungle-colony/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g034-alien-jungle-colony/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g034-alien-jungle-colony/review-2_5d.json) · [觀察](../development/3d-source/equipment/concepts/galaxy/g034-alien-jungle-colony/codex-review.md) · [來源](../development/3d-source/equipment/concepts/galaxy/g034-alien-jungle-colony/sources/generation.json) |
| G035 | 星際邊疆 → 邊境海盜星域 | 海盜裂星刃／掠奪戰盔／黑市戰甲／漂移推進靴／海盜導航核 | [三視](../development/3d-source/equipment/concepts/galaxy/g035-frontier-pirates/overview-front-side-back.webp) · [五槽](../development/3d-source/equipment/concepts/galaxy/g035-frontier-pirates/equipment-five-slots.webp) · [審查](../development/3d-source/equipment/concepts/galaxy/g035-frontier-pirates/review-2_5d.json) · [觀察](../development/3d-source/equipment/concepts/galaxy/g035-frontier-pirates/codex-review.md) · [來源](../development/3d-source/equipment/concepts/galaxy/g035-frontier-pirates/sources/generation.json) |

## 來源及審查

- 真實工具：本任務可用的 OpenAI `image_gen.imagegen`。每套先產三視，再以已目視的同套三視為參考另次繪製五槽，未以裁切、重排或換色充數。
- `sources/overview-original.png`、`sources/slots-original.png` 保留原始位元組；`sources/generation.json` 記錄原始路徑、SHA、bytes、轉檔方式、參考來源及輸出 SHA。WebP 為原尺寸 RGB、quality=92、method=6 編碼。
- 由使用者授權產製，生成輸出依可用 OpenAI 服務條款使用，僅開發概念；無外部庫圖，也不宣稱 CC 授權或獨占權。逐套 `generation-provenance.md` 記錄權利使用基礎。
- 每套 `review-2_5d.json` 採 schema4，stages 僅一筆 Codex，綁定正式身份、兩圖 SHA、固定政策 SHA、日期、逐項觀察、來源、證據 SHA 及 fingerprint。blocker=0，微小視角／裝飾差異列 advisory；未虛構 ChatGPT 初審。
- 已目視十張完整圖及 288×192 縮圖（角色約170px高）；可辨殖民方肩盒、傭兵重肩牌、補給三向節點、生態葉肩鏡頭與海盜紅核破片。小尺寸檢視是本機圖像檢查，不等於實體手機遊戲驗收。

## 驗證範圍

- `python3 scripts/equipment-concepts.py generate`、`validate`；全庫 70 圖、35 套批准、175 套未製作；再次 generate 的 changedFiles=0，對已暫存概念與主索引執行 git diff --exit-code 為零。
- G07 plan 無缺圖項目；status=approved、imagesPresent=10、imagesMissing=0、approvedSets=5。G036 無圖，未提前製作。
- `python3 -m unittest discover -s tests/equipment-concepts -v`，包含 G07 原始 PNG 完整解碼、來源 SHA、十張獨立性、WebP 尺寸／bytes／SHA、schema4 與歷史／負向檢查。最終本機重跑 76 項全通過（91.987秒）；本提交遠端執行仍須另查 exact-HEAD Actions。
- 舊30套頂層168檔 SHA 保護快照全相同；Git 差異亦確認歷史目錄、schema3、G024/G030接受證據及舊3D無變更。
- `node scripts/publish-asset-audit.cjs --json`：hardMissing=[]，本批五套45個檔案全部被既有發布規則排除；原 Pages／SW／registry／發布開關無修改。
- CI 契約檢查保留 Pillow 完整解碼、validate、全套 unittest、G07 plan、generate及 git diff 無差異檢查。既有測試依實際35套進度更新；部分續作治具明確建立「一張存在／其餘缺圖／未批准」，保留防覆蓋與拒絕偽批准斷言。

## 環境與待驗

- 本機 Git 代理及 Node 子程序最初受沙箱限制，使用核准的既有執行環境後 Git fetch 與發布稽核正常；沒有繞過網路政策或更換憑證。
- 本報告不預先宣稱未完成的 exact-HEAD Actions 成功；推送後須核對該 commit 實際觸發的執行。
- 概念已完成不等於角色透明層、武器分層、GM或正式戰鬥發布完成；以上均不在本批。使用者可直接在 GitHub 查看十張圖與逐套證據，不需逐套批准。
