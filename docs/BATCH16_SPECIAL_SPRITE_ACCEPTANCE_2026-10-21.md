# 第16批特殊怪正式 Sprite 驗收證據（2026-10-21）

修復 PR：[PR #70](https://github.com/franksky1207/rpg/pull/70)。本報告記錄實際本地發布候選驗收；遠端發布完成與否另以最新提交 Actions、合併 main 及 Pages 部署結果為準，不將等待中工作視為成功。

## 身份與正式入口

測試從正式遭遇進入，保留實際怪物建立、戰鬥、事件、投影、Renderer、獎勵與 save owner；隨機遭遇固定為指定身份。18組均通過名稱、kind、location、原型、實際非透明 Sprite 像素、替代輪廓隱藏、結算及 Fast Catch-up 一致性。

| specialId | 銀河正式名稱 | 宇宙正式名稱 | 原型 | 兩紀元結果 |
|---|---|---|---|---|
| gold_slime | 稀有資源聚合體 | 星源聚合體 | energy-01 | 通過 |
| mimic | 誘餌補給艙 | 虛空誘餌艙 | fort-01 | 通過 |
| reaper | 終止協議單元 | 終焉協議體 | mech-02 | 通過 |
| lucky_rabbit | 機率增幅信標 | 星運增幅信標 | energy-01 | 通過 |
| ancient_guardian | 封存警戒機 | 古域警戒機 | dr-02 | 通過 |
| relic_guardian | 裝備保全單元 | 星藏保全體 | mech-01 | 通過 |
| bandit_king | 黑市武裝頭目 | 暗域黑市王 | cmd-01 | 通過 |
| collector | 戰利品回收者 | 星骸回收者 | hm-02 | 通過 |
| mysterious_traveler | 流動交易代理人 | 界域交易使 | hm-02 | 通過 |

## 自動化結果

| 驗收 | 結果 |
|---|---|
| 精確身份與錯誤ID／名稱／紀元／模式拒絕 | 18組通過 |
| 正式遭遇到結算與 Fast Catch-up 結算一致性 | 18組通過；0 pageerror |
| GM／正式三視窗、六種動畫、像素尺寸與裁切 | 222案例通過 |
| 跨模式／背景清快取／特效降級與連續重入 | 260次通過；結束 refs/pending/bytes 均為0 |
| HTTP／SHA／解碼／下載中離場與兩次連續復原 | 296案例通過 |
| 下載逾時與原頁重入 | 19案例通過，含18種特殊怪 |
| 第15批既有609身份三視窗 | 1827案例通過 |
| 原609筆資料、56筆副本、21張原型與共享資源池 | 既有完整性與8項pool測試通過 |
| 正式懸賞／競技場／虛空／鏡像實際入口 | 銀河／宇宙共8組通過 |
| 三紀元手機直橫向主線、懸賞、競技場、災厄與虛空 | 原有模式矩陣通過，保留既有高維懸賞禁止規則 |
| 發布候選全部HTTP雜湊、17音訊解碼、76媒體快取、Range與存檔隔離 | 通過 |
| 原生Service Worker預載、warm不重載、毀損修復、清除後重載 | 通過 |
| GM三視窗與正式共用系統 | 通過 |

效能僅記錄本環境 Chromium sample CPU：{'samples': 13800, 'p50': 0, 'p95': 0.09999999997671694, 'max': 2, 'gpuAndHardwareThermalsMeasured': False}。不代表 iPhone GPU、溫度、耗電或實機背景喚醒。

## 重現與遠端證據

- `.github/workflows/batch16-dungeon-sprites.yml` 執行新增身份契約、正式入口，以及擴充的版面／切換／故障驗收。產物 `batch16-dungeon-evidence` 保存 JSON 與截圖。
- `Batch13 Twenty Monster GM Integration` 保留第15批與 GM 回歸產物。
- 舊609筆斷言只允許九筆特殊怪狀態改動；舊 presentation guard 僅精確正規化本次三個cache token，所有其他內容仍完整比對。
- 合併前必須檢查 PR 最新 head 的所有必要工作完成 success；合併後必須再檢查 main Runtime、Pages 與實際部署。此報告的本地通過不替代遠端發布驗收。

## 尚未真機驗證

iPhone Safari 直／橫向、長時間連戰、切到背景再返回、低記憶體清除快取、溫度與耗電，均仍需玩家實機確認；未宣稱真機通過。
