# 《文明戰線》210 套正式裝備｜概念圖與來源目錄命名規範

建立：2026-10-11。適用第 28-C、29、30 批與之後 210 套裝備概念設計。**正式裝備名稱一律讀取遊戲 main 原資料，資料夾短名只供檔案管理，不能成為新的遊戲身份。**

## 唯一穩定序號
- 銀河：`galaxy/g001-<slug>` 至 `galaxy/g100-<slug>`；序號 = `MAPS` 正式 index + 1（每個小區域一套），對應 10 大區 × 10 小區域。地球戰爭第 7 小區域「古代科技遺址」為 **`galaxy/g007-ancient-tech-ruins`**。
- 宇宙：`universe/u001-<slug>` 至 `universe/u100-<slug>`；序號 = `SECOND_WORLD_BOSSES` 正式 index + 1（每 Boss 一套），資料權威 `secondworlddata.js`，slug 依正式 Boss/套裝主題。
- 高維：`higher/h01-<slug>` 至 `higher/h10-<slug>`；序號 = `THIRD_WORLD_EQUIPMENT_NAME_ROWS[].band`（每階一套），資料權威 `thirdworldloot.js`，slug 依正式主題。

## 統一階層
```text
development/3d-source/equipment/
  concepts/
    galaxy/g007-ancient-tech-ruins/
      concept-notes.md
      overview-front-side-back.webp      # 完成生成後可入庫待審
      equipment-five-slots.webp          # 完成生成後可入庫待審
    universe/u001-<slug>/
    higher/h01-<slug>/
  ancient-ruins-v1/                       # 已存在第 28-C Blender / 原資產來源，暫不搬動
```

- 目錄只用英文小寫 `a-z0-9-`，固定序號與紀元前綴，避免手機檔案系統與 URL 問題；slug 可讀、但身份以固定序號與程式 index 決定。
- 所有套裝保持 `concept-notes.md`、`overview-front-side-back.webp`、`equipment-five-slots.webp` 這組一致檔名，方便 Codex 批次掃描。目前 210 套目錄與 notes 均已建立，G001～G020 均已有兩張待審概念圖。
- 版本不可藏在唯一身份目錄名（不要無限制建立 `ancient-ruins-v2/v3/v4`）：美術版本寫在 `concept-notes.md` 和 Git commit；如需多候選可在 `drafts/` 下短暫存放，兩張待使用者審核的正式候選圖採標準檔名；批准另需明確證據。
- 圖片是美術參考，不等於可直接推導的 Blender 準確尺度、左右對稱、權重、LOD 或 GLB 交付。先由使用者美術確認，再讓 Codex 做幾何和 rig 驗證。
- 概念參考 WebP 與必要的 `.blend`／驗收素材置於 GitHub 開發目錄；高容量原始無損概念圖可外部封存，**不得進 Pages、Service Worker 的 49 預載項**；發布只含批准、優化且登錄 registry 的正式必要模型。
- 若主遊戲改了套裝名稱、順序或正式來源，先依最新 main 核對並修正 note；不得透過資料夾名稱覆寫正式遊戲資料。

## 目前狀態與批次 SOP

現已建立全部 210 套目錄與 notes；詳見 [總索引](3D_EQUIPMENT_210_SET_MASTER_INDEX.md)、[維護規格](3D_EQUIPMENT_210_SET_DATABASE_MAINTENANCE.md)及[批次概念美術流程](3D_EQUIPMENT_CONCEPT_BATCH_ART_WORKFLOW_2026-10-11.md)。G007 兩張 WebP 已存在，**尚待使用者批准**；G001～G020 的試跑、批次 A 與 B01 兩圖均已入庫待審，其餘 190 套尚未製圖。**入庫待審與批准是不同狀態**，固定 ID／sourceKey 為身份，英文 slug 僅為標籤。

## 跨批次入口
- 後續裝備量產須同時遵守 [跨資產量產總規範](3D_ASSET_PRODUCTION_MASTER_RULES.md)及[三紀元裝備美術方向](3D_EQUIPMENT_ART_DIRECTION.md)。
- 各批進度以正式資料 owner、現有圖片檔及腳本衍生 `_concept-index.json` 為準，不新增需人工同步的第二份真實狀態。已生成、待審、批准、建模需分開判斷。
