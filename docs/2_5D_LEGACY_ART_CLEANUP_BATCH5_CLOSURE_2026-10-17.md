# 《文明戰線》2.5D 舊美術清理：第 5 批封箱驗收紀錄

日期：2026-10-17（台灣）

## 驗收基準

- GitHub `main` 為唯一真實來源。
- **已完成全綠驗收的程式 SHA：`06572317de8fdf4e41c48a457bb61b8c3b67f258`。**
- 在此 SHA 上，以下 10 項 GitHub Actions 均已 completed / success，沒有失敗或未結束的項目。
- 本文件為驗收紀錄；提交本文件會產生另一個新的 SHA，**不得把舊 SHA 的全綠結果直接冒稱為新 SHA 的 CI 結果**。

## GitHub Actions 實證

| 工作流程 | 驗收結果 | GitHub Run |
|---|---|---|
| Runtime Integrity | ✅ success | [39034179750](https://github.com/franksky1207/rpg/actions/runs/39034179750) |
| Publish Release Gate (Stage 4) | ✅ success | [39034179691](https://github.com/franksky1207/rpg/actions/runs/39034179691) |
| Publish Optimized GitHub Pages | ✅ success | [39034179628](https://github.com/franksky1207/rpg/actions/runs/39034179628) |
| Equipment 2.5D Formal Battle | ✅ success | [39034179747](https://github.com/franksky1207/rpg/actions/runs/39034179747) |
| Equipment 2.5D GM Integration | ✅ success | [39034179697](https://github.com/franksky1207/rpg/actions/runs/39034179697) |
| Batch 2-4 Integration and Regression | ✅ success | [39034179712](https://github.com/franksky1207/rpg/actions/runs/39034179712) |
| Asset Version Manifest | ✅ success | [39034179796](https://github.com/franksky1207/rpg/actions/runs/39034179796) |
| HTML JS CSS Cache Version Guard | ✅ success | [39034179643](https://github.com/franksky1207/rpg/actions/runs/39034179643) |
| Publish Asset Audit (Stage 2) | ✅ success | [39034179670](https://github.com/franksky1207/rpg/actions/runs/39034179670) |
| Publication Dry Run (Stage 3) | ✅ success | [39034179669](https://github.com/franksky1207/rpg/actions/runs/39034179669) |

## 第 5 批處理範圍與保護條件

- 第 2～4 批舊美術清理後的 GM、正式 2.5D、發布與 Runtime 回歸檢查。
- 修正已退役 3D 預覽相關測試的過期假設、GM 沙盒非同步授權測試競態、文件交接與檢查規範。
- 不恢復已移除的概念圖量產、來源鎖與舊預覽入口，不變更正式文字玩法、獎勵、存檔、Schema17、三紀元規則和裝備正式 ID。
- 這份 CI 成功紀錄不代表 iPhone 真機、真帳號雲端寫入或美術人工驗收已完成。

## 封箱判定與後續規則

**第 5 批在上述已驗收 SHA 的 CI 及發布驗證通過。** 封箱紀錄獨立保存，不再藉由無必要的程式／測試修改反覆重啟驗收。

第 6 批不在本次工作範圍；任何新需求應先建立新的明確範圍與保護條件。
