# 第19-4批 Actions 並行控制與正式封箱驗收

本紀錄優先於歷史施工報告的待確認文字。使用者已授權必要修改、驗收成功後正式 PR 合併及發布核對；iPhone 真機未驗收不冒充通過。

## 來源與目前狀態

- 核對 main：`b6d254c2dc9d4fb6b5d3d97ae48bd5db0263348f`。
- 施工前 PR #89 HEAD：`86320c8caa6cf49fbf1bed6b1878109606010c76`；Draft、可合併。新提交後必須重核最新 HEAD，舊成功不抵新驗收。
- main 原22支，PR最新17支 workflow。已退休並從PR移除：audio-localize.yml、battle-theme-localize.yml、era-theme-localize.yml、six-sfx-localize.yml、vendor-babylon-7543.yml。
- equipment-concepts.yml 現為只讀正式210裝備身份契約，不再產概念圖；equipment-sprites.yml 驗證現有sprite與可重現發布，無遠端素材下載或產圖提交。
- 本次僅修改8支workflow的並行設定、Preflight靜態驗收及文件；不改正式遊戲、資源、音效、音樂、存檔或既有測試斷言。

## 永久並行規則

八支PR workflow：equipment-concepts、equipment-formal、equipment-gm、equipment-sprites、fast-development-preflight、functional-ci、gm-animation-center-terminology、runtime-integrity。

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event_name }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

workflow名稱為目前repository內唯一值；event明確隔離PR、push與workflow_dispatch，同PR更新沿同群組取代舊SHA，不同PR或workflow不互取消。main push與手動不取消執行中工作。GitHub concurrency本身最多保留一個pending；此規則不承諾保留每個同群組中間pending版本，正式最新main仍須完整驗收。

Pages維持optimized-pages-publish、Manifest維持asset-version-manifest，全事件共用各自資源鎖、cancel-in-progress:false；發布與寫入必須共用鎖，不能按事件拆鎖。Release Gate及其餘非PR流程未套取消策略、未新增PR事件。Stages2/3/4各有資源稽核／建置／瀏覽器驗收用途，本批不重構或刪除安全驗收。

Manifest僅main push特定正式路徑及手動觸發，contents:write；每次重新fetch最新main、只生成並stage resource-manifest.json，普通non-force push，競態拒絕後重建最多五次。沒有pull --rebase／force push。現有HEAD:main是此唯一受控manifest writer，並非功能分支覆寫；同一資源鎖保留。本次不改指紋或正式素材。

所有17支workflow均無timeout-minutes或shell timeout；沒有重引入人為期限。PR不會觸發已退休的一次性音樂／Babylon下載流程。已有Runtime main freshness機制維持原狀，最終main驗收不能以被略過的中間版本代替。

## 靜態驗收

`node scripts/check-workflow-concurrency.cjs` 全量盤點workflow，強制每支PR流程使用完整唯一群組及PR-only取消、拒絕重複／job級concurrency、PR寫入／部署與無法稽核的inline觸發格式；保護Pages／Manifest資源鎖並拒絕人工期限及rebase。依目前明確YAML block格式fail closed，不新增解析套件。

`node --test tests/ci/workflow-concurrency.test.cjs` 覆蓋缺失設定、身分缺漏、main／manual取消、重複、PR writer、nested設定及inline繞過等反例。兩者接入既有Fast Development Preflight，未新增workflow、安裝步驟或矩陣。本機檢查17支／8支受控通過。

取消減少重複的機制已靜態驗證；不為製造取消示範故意再推多個SHA。尚無新提交後實際重疊run的取消統計，不宣稱量測改善幅度。

## 施工前同SHA成功紀錄（不能冒充新HEAD）

SHA `86320c8caa6cf49fbf1bed6b1878109606010c76`：

| Workflow | Result | Run |
|---|---|---|
| Fast Development Preflight | success | https://github.com/franksky1207/rpg/actions/runs/39971636942 |
| Equipment 2.5D GM Integration | success | https://github.com/franksky1207/rpg/actions/runs/39971636973 |
| GM Animation Center Terminology Gate | success | https://github.com/franksky1207/rpg/actions/runs/39971636896 |
| Runtime Integrity | success | https://github.com/franksky1207/rpg/actions/runs/39971636946 |
| Functional CI | success | https://github.com/franksky1207/rpg/actions/runs/39971636911 |
| Equipment 2.5D Formal Battle | success | https://github.com/franksky1207/rpg/actions/runs/39971637028 |

## 必要功能保護及真機限制

沿用[正式實作報告](BATCH19_4_FOREGROUND_IMPLEMENTATION_2026-10-23.md)及[可重現證據](evidence/batch19-4/acceptance)。最新HEAD的Runtime必須實跑foreground-combat三支Browser與Schema18相關檢查，Functional必須通過lifecycle及所選領域，Formal／GM亦須同HEAD成功。

保護項目：全模式單場中斷、兩災厄已播放永久HP、高維HP與EXP／維度弦原子保存、回血watermark防重、11億最終收益精確對齊、save失敗回滾、stale／重複結算拒絕、GM實際背景開關與Schema1–17升18 byte-exact backup／future19拒絕。沒有修改上述程式或降低斷言。

待iPhone Safari真機：切App、鎖屏、OS終止、原生bfcache、長時間溫度／耗電／記憶體尖峰與實際存檔。Chromium／WebKit自動化不等於真機通過。

## 提交後／合併後必填證據

新PR HEAD、同HEAD各run、合併前base與mergeability、merge commit、最終main（含合法Manifest後續提交）、Functional／Runtime／Formal／GM／Pages run與deployment、正式manifest一致性，須依實際結果補記。此版本尚未合併、尚未發布、不可宣告正式封箱。
