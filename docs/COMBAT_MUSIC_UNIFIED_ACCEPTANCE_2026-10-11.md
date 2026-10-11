# 全戰鬥音樂統一修復與驗收（2026-10-11）

## 基準與範圍

起始 main：`7f57531dda638d2fa1d37355e2ba9ac9c2214157`，實際 fetch 核對；先在 `fix/unified-combat-music` 隔離施工／驗證，整合前再 fetch main。沿用既有 Pages workflow/source，不切換發布來源。第 27 批 Blender／GLB／registry／LOD／1,050 裝備位置資料全部保留。

## 實際根因

1. `ui.js` 的 beginCombat 音樂通知被後載入的 `firstworldtargetcontext.js`／`levelcapresult.js` 入口覆寫；真正執行的 `battlepipeline.js` 沒有正式音樂開始／結束事件。歷史補丁改成由 `syncView` 的 combat 畫面補啟動，建立第二個 owner。畫面、解鎖及渲染時序因此能干擾普通／Boss 配樂。
2. 主線退出原本掛在 `showBattleResult`，結果 DOM 不存在時先 return，音樂不退出；演出或流程例外也無獨立音樂 finally。畫面仍為 combat 時又能重新取得 lock。
3. 舊退出使用演出旗標輪詢（50 ms、最多 300 次），混合正式結算與視覺尾奏；卡住標記會延遲恢復。無 token 的舊退出也無法辨識新舊連戰。
4. 高維已有 `thirdworldrun.js` 的正式 begin/clearRuntime，因此較不依賴銀河 UI 補丁；宇宙主線／回顧則沒有完整正式通知。銀河回顧未傳來源紀元，會被高維玩家階段誤判成高等戰鬥曲。
5. 取得真實失敗日誌：Runtime Integrity `38116622874`、Stage 4 `38116623696` 都在舊音樂斷言第 76 行失敗（medium 與 normal）；起始 SHA 的既有 optimized Pages `38116727852` 成功。沒有回退前人修正的競技場精確選取器、GM 測試中心網址、3D 外觀來源及 loader v16。

## 修正合約

- `audio/audio-scenes.js` V8：唯一正式控制器；`startRun` 回傳整輪 token，`endRun(token)` 只接受相符 token。狀態 `IDLE → COMBAT → SETTLING → IDLE`。渲染／解鎖／設定／返回前景都只恢復已選曲目，不建立正式 battle lock；公開 setContext 不能取得 lock，無 token 的 exit 拒絕。
- 不以秒數或演出旗標判斷正式退出。每輪 combat-end／presentation-end 不結束連戰；正式 owner 的 finally／terminal 事件才退出。曲目相同沿用播放來源，不在每次 render 重播。
- 銀河放在真正的 battlepipeline owner，含特殊遭遇／手動停／死亡／例外；結果 modal 不再持有音樂 authority。宇宙主線、三紀元回顧、高維原生 runId、懸賞、競技場、鏡像、虛空、災厄、高維競技場、異宇宙各自保存瞬時 token。
- 災厄核心仍支援直接／headless 執行。正式玩家 UI 只預留 token，將同一 token 傳入核心；核心驗證／接受成功才播放（拒絕挑戰不接管現有連戰），整個正式 UI 流程以 finally 退出，避免同步核心結果讓單場演出尚未開始就恢復主題曲。這是明確的流程所有權，不等待全域動畫旗標；異常立即解除音樂。
- 回顧使用真正來源紀元選戰鬥曲；退出返回當下有效的冒險／災厄紀元分頁，返回首頁再恢復玩家目前階段主題曲。

| 正式來源 | 曲目 |
| --- | --- |
| 銀河普通／菁英、銀河／宇宙懸賞 | 普通 |
| 銀河／宇宙 Boss、一般競技場、鏡像、虛空 | 中等 |
| 高維主線／回顧／競技場、兩紀元災厄／災厄回顧、異宇宙 | 高等 |

`audio-core.js` 的單一正式 music voice、GM 獨立試聽、偏好保存、50% SFX、最小模式／背景抑制已實讀與原生播放驗證，保留既有核心，沒有另建播放器。未修改戰鬥、成長、裝備、紀元、掉落、交易、存檔公式。

## 可重跑的證據

- **先失敗再修正**：新增 `tests/audio-lifecycle.test.cjs`，舊 main 重現 18 個失敗；追加無 token／公開 setter authority 及預留 token 拒絕接管測試，修正後 20 項全通過。這是可執行 VM 控制器測試，不只 grep。
- `tests/audio-regression.test.cjs` 保留 9 正式來源、UI click 取消、SFX 50%、GM 隔離及 stale-token 斷言；移除的是錯誤的「畫面應取得正式 owner」期待，改為嚴格拒絕，而非放寬。
- **原生 Chromium 音訊（50 案例通過）**：`tests/runtime/audio-lifecycle-browser.js` 不替換 Audio／play 解碼器，攔截只記錄並呼叫原生方法，檢查真正 `playing`、readyState、paused、正式 voice 數與所有可播放 music elements。保留真正入口、target context、combat core、reward／settlement；只加速演出等待。獨立瀏覽器 storage，封鎖 Supabase 雲端端點，不使用正式帳號。
- 真實流程：銀河普通／菁英／Boss／再次挑戰；兩輪銀河連戰（整輪僅一次 play）與手動停止；宇宙 Boss；高維開始／正式單輪／停止；兩紀元懸賞、競技場、鏡像各 15 場、虛空手動退出、災厄單場；高維競技場、異宇宙；銀河／宇宙／高維回顧、回顧正式 state 不變；音樂開關、GM 試聽回復、原生聲源停止／恢復；演出例外、missing result DOM；隔離角色實際轉生交易／備份及重新載入後首場普通／Boss。
- 額外 17 組 browser-native 控制器模式矩陣明確屬合約測試，**不冒充各模式玩法**。visibility 事件由測試模擬，媒體播放仍原生；真實 OS 背景／手機權限仍需玩家驗收。
- localhost 會自動載入 integrity，自身演出探測可清除 presentation；新驗收先 ensure integrity 完整執行，再啟動正式戰鬥，沒有停用測試。舊 galaxy review browser 等真正 startup ready，再明確開啟地圖 0，保留真實 enemy/start 點擊及唯讀 state 斷言，避免點擊折疊清單隱藏的第一個按鈕。
- Runtime／Story／Stage 4 工作流程的 **93 個不同檢查**全部執行；最初 6 個失敗經根因處理後重跑成功。含 3D GLB validator、實際骨架／LOD／GM preview、各紀元公式與交易／存檔／轉生／Fast Catch-up、browser readiness、cache／發布完整性。後續修改再跑必要關聯檢查。
- Runtime、Stage 4、optimized Pages build 都直接加入新的 VM 和 native browser 驗收；後兩者在 `.publish-stage3` 成品跑。報告 `audio-lifecycle-browser-report.json` 由 Actions 保存為 artifact。

## 環境與限制

本機 Node 24.19／Chromium 154／Playwright 1.55，外部測試工具置於 `/workspace/.rpg-tools`，遊戲無新套件依賴。Chromium 不信任環境代理 CA，影響外部 SDK，不是遊戲音樂 OGG。永久新增 CA 被自動審核拒絕後未執行，也沒有關閉 TLS。以系統 curl 的正常 HTTPS／TLS 驗證取得官方 SDK，與既有 SDK 完整 SHA-256 相同：`d6a5c4414a5d4ce646d9c1de223aa7067d3ff664c15394ffeb7fcffc763354a3`。本機 browser 以此官方 dependency fixture 重跑；CI 直接走正常官方 CDN。這不替換音訊、戰鬥或正式帳號。

```sh
node tests/audio-lifecycle.test.cjs
node tests/audio-regression.test.cjs
python3 scripts/generate-resource-manifest.py > resource-manifest.json
node scripts/publish-asset-audit.cjs
node scripts/build-publish-dry-run.cjs
node tests/runtime/audio-lifecycle-browser.js
```

browser 前先依現有 workflow 啟動 HTTP server；成品驗收設 `RUNTIME_SMOKE_URL`／`SMOKE_URL` 指向 `.publish-stage3` server。本機需要既有 system-Chromium helper 及經 TLS 驗證的 SDK fixture；這些參數不加入正式來源或 CI 以掩蓋錯誤。

## 發布容量與安全

最終容量以 `publish-stage3-report.json` 成品逐檔 bytes 為準（提交前重新生成），不是 28 MB 的舊靜態候選值，也不包括 Git history／packfiles。audit/build 根據實際依賴保留正式資源；成品保留 32 WebP、6 音樂＋11 SFX 實體，共 17 OGG。resource-manifest 指紋隨修改重新產生，所有修改的直接 HTML JS 引用同步 cache-bust。SW／client 保持既有逐檔摘要驗證、Range 206、49 selected media 預載、存檔隔離；JS/CSS 不新增持久快取。

所有排除的素材、開發文件、母檔仍留在 GitHub；Batch 27 模型資料沒有更動。核對 main 再整合，必須等待同一 SHA 的 Actions 與 Pages 成功，結果及連結於交付回報列示。


- 最新實測 tracked working tree：223,420,968 bytes（223.42 MB，不含 Git history）。
- 精簡成品：33,698,840 bytes（33.70 MB），366 檔；節省 189.72 MB；排除 337 檔；缺少直接依賴 0。
- 完整 HTTP／digest／17 音訊解碼、49 媒體預載、206 Range、clear/save isolation 的 Stage 4 browser 已實際執行；以最終 CI artifact 的 bytes 作為部署追溯數值。

## 玩家真機驗收

1. 桌機與手機各重整、以真實點擊／觸控解鎖；先銀河普通→結算，再 Boss→結算，再各重跑一次，確認普通／中等及銀河主題曲循環、音量與接縫。
2. 各紀元連戰、手動停、失敗、每日額度耗盡；切換文字／WebGL／3D、極簡、倍速與背景後返回，確認同一輪不中斷／不重疊，正式結束正確恢復。
3. 依可進入的正式進度驗收懸賞、競技場、鏡像、虛空、災厄、回顧、異宇宙；高維回顧銀河／宇宙時，確認來源戰鬥曲與返回紀元分頁配樂。
4. 音樂開關與滑桿，GM 試聽開關前後；手機 Safari／Chrome 的鎖屏、切 app、耳機、靜音模式與返回首次播放須真機確認。
5. 確認跨裝置新版本提示、現有資源快取命中與主題 OGG。正式帳號登入／雲端保存僅由玩家操作；本次沒有對正式雲端資料執行測試、覆蓋或刪除。
