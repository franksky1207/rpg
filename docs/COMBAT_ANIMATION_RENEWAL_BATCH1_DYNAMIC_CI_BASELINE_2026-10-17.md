# 《文明戰線》新版第 1 批：跨模式動態 CI 基線與施工對照（2026-10-17）

## 一、修改內容
- 最新程式基準：`ec146fc910ca8464c8224b826edc10e0d83e2a31`（分支自此 SHA 起，不修改正式 gameplay）。新增 `scripts/batch1-dynamic-ci-baseline.cjs`，使用現有隔離測試入口於獨立 Node 子程序實際執行，以 `performance.now()` 記錄整場子程序耗時、exit code、尾端紀錄與每次實際執行環境，輸出 `batch1-dynamic-ci-baseline.json`。
- 新增 `.github/workflows/batch1-dynamic-ci-baseline.yml`，在 GitHub ubuntu runner 安裝 Playwright Chromium、啟動本地測試 HTTP server，執行 18 個測試入口並上傳 JSON 證據。正式版為 **workflow_dispatch 手動觸發**，不額外拖慢日常 main push。
- 修改既有總規劃：明確記錄 **iPhone 真機效能／發熱驗證延期至六批全部完工後另案測試**；第 5 批僅技術與外觀契約，不進行美術。
- 以上均為 **CI 測試工具與文件**，沒有更動遊戲正式 Runtime、戰鬥數值、Schema、HP/盾、獎勵、資源、美術或登入雲端。

## 二、動態 CI 執行結果
- 第一次實際測試：分支 SHA `64699881611e7bc84c9995f6fd8e4713780a4b07`；[run #39040339238](https://github.com/franksky1207/rpg/actions/runs/39040339238) **success**，14/14 通過，artifact #12103608043。
- 擴增第二次：分支 SHA `fccdf31b19fbb3db545820033f24fbd486bb68ff`；[run #39040519589](https://github.com/franksky1207/rpg/actions/runs/39040519589) **success**，18/18 通過，artifact [#12103892246](https://github.com/franksky1207/rpg/actions/runs/39040519589/artifacts/12103892246)。
- 實際 runner：GitHub Actions Ubuntu、Node 24、Playwright Chromium。場景執行為隔離回歸測試，無用戶正式登入、雲端存檔或手機裝置。
- 下表 **每個數字都是「啟動一個測試 Node 子程序直到退出」的牆鐘耗時，單位 ms**；包括 Node 啟動、測試 setup、瀏覽器 launch/load/await/assert 等，**不是正式玩家每場戰鬥耗時，絕不是 FPS、frame time、CPU/GPU、溫度或性能排名**。不可用 33,156ms 與 30ms 比較哪種正式戰鬥比較卡：所執行的測試種類和負擔完全不同。

| 場景（第 2 次） | 測試入口類型 | 實測子程序耗時 (ms) | 結果 |
|---|---|---:|---|
| 銀河主線目標／戰鬥上下文 | 瀏覽器整合 | 2694.95 | pass |
| 宇宙及跨紀元背景 | 跨紀元瀏覽器整合 | 33155.68 | pass |
| 高維背景 | 瀏覽器整合 | 21365.96 | pass |
| 高維重跑正式結算 | 瀏覽器整合 | 1239.32 | pass |
| 異宇宙戰鬥核心 | Node 隔離契約 | 30.95 | pass |
| 異宇宙試次 owner | Node 隔離契約 | 33.23 | pass |
| 異宇宙介面契約 | Node 隔離契約 | 29.14 | pass |
| 異宇宙故障保護 | Node 隔離契約 | 33.58 | pass |
| 災厄終結／Fast Catch-up | Node 契約 | 27.93 | pass |
| 災厄共用 UI 政策 | Node 契約 | 31.84 | pass |
| 離線樣本來源 | 瀏覽器／整合 | 1245.27 | pass |
| 銀河回顧戰 | 瀏覽器整合 | 2542.82 | pass |
| 戰鬥事件 owner | 瀏覽器整合 | 6353.29 | pass |
| 虛空相關目標／離線／回顧契約 | 瀏覽器整合 | 1119.71 | pass |
| 高維副本（含懸賞／競技／虛空） | 裝備／副本整合 | 16172.40 | pass |
| 特殊怪 Fast Catch-up | Node／隔離整合 | 1070.76 | pass |
| 轉生副本開放資格 | Node／隔離整合 | 1136.50 | pass |
| 異宇宙完整回歸 | Node 契約 | 35.12 | pass |

## 三、程式自我檢查
- 18 個現有隔離測試入口在 GitHub Actions **實際全部 pass**；證據是 workflow job log 和 artifact，不是根據原始碼猜測。
- 原有獨立 T2-A/T2-B1 測試於先前 PR #15 修復，PR #16 補齊下游 SHA。此處未停用原有正式品質閘門。
- 全程不連正式帳號或雲端，測試不可修改正式玩家資料。
- runner 測試時間不能取代 frame 診斷。瀏覽器整合測試 **有實際跑進瀏覽器**，但並不等同每種正式模式動畫皆曾在螢幕渲染完整戰鬥，也不能由其耗時推導異宇宙 iPhone 發熱原因。
- 本輪覆蓋到跨紀元、異宇宙、災厄、回顧、離線、Fast Catch-up、特殊怪、轉生副本、高維副本與戰鬥事件；鏡像、部分銀河／宇宙懸賞／競技，以及每一種動畫形態尚無完全同條件的獨立呈現效能測試，因此不能稱全模式真正動畫 FPS 基線已全面完成。

## 四、剩餘缺口與施工對照
| 缺口 | 證據層次 | 對應處置 |
|---|---|---|
| 異宇宙 vs 主線 **同事件數、同動作數** 的幀耗時 p50/p95/p99 | 尚無 Chromium Performance trace | 新版第 3 批的顯示層測試，必須分離模式流程差異 |
| layout/paint、forced reflow、MutationObserver 數及大量浮字負荷 | `combatfx.js` 有 `offsetWidth` 靜態風險；尚無量化 | 第 3 批，先量測再優化 |
| 反覆背景／前景／頁面回復與內存釋放 | 現有跨紀元背景瀏覽器回歸通過；無 leak slope | 第 2 批生命週期負荷測試 |
| 所有不同副本在**相同呈現條件**下的逐場動畫基線 | 目前為 18 個不同目標之回歸入口，非統一場景 | 第 2 批整合後、第 3 批添加統一 benchmark adapter |
| iPhone Safari 熱節流及發熱驗證 | 無真機證據 | **六批完工之後**由使用者另案實測；不得作為前六批封箱前置門檻 |

### 第 2 批與第 3 批不可變更契約
1. 同樣的正式戰鬥輸入／seed 時，HP、盾、傷害、特殊效果、回合、獎勵、存檔、離線收益及連戰時間語意保持不變。
2. 異宇宙 `attemptId`／`depth` 與高維永久 HP 的結算 owner 不能被視覺生命週期接管。
3. `backgroundprogress.js` 目前已存在不同 UI／checkpoint 間隔，不准一律認定為冗餘；先用回歸證據確認後再優化。
4. 刪除 G005/G007/G018 需完成正式 Runtime/GM 資源引用掃描，本基線不刪素材。

## 五、封箱與 SHA
- 本文件承認**「18 項 GitHub Runner 動態隔離回歸基線」已完成**，不承認**「全模式動畫性能 baseline 已量化」**或**「iPhone 發熱已修好」**。
- 實際成功 Actions 與測試基準：`fccdf31b19fbb3db545820033f24fbd486bb68ff`、[run 39040519589](https://github.com/franksky1207/rpg/actions/runs/39040519589)。
- 本報告及主規劃修改形成後續提交 SHA；其 GitHub Actions 結果應獨立核對。**新版第1批整體是否封箱：待第1批剩餘同條件動畫基線及全模式引用稽核證據；iPhone 真機驗收不列入。**
