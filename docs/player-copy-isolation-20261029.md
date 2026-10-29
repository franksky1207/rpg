# 玩家文案與內部技術術語隔離驗收（2026-10-29）

基準 main：`0ba4743674f34ef52f77a126f7e6091e71a937ed`。本次只修改玩家文字、錯誤顯示對照與標題；沒有修改玩法、離線公式、樣本判定、結算、遷移、存檔格式或 GM 權限。

## 掃描與判讀

靜態搜尋涵蓋 784 個既有受版本控制的 HTML／JS／CSS／JSON／MJS／CJS／TS 檔案：根目錄 299、3d-test 51、audio 7、data 4、assets 3，以及測試 300、開發 52、文件資料 40、工具 28。搜尋包含英文內部狀態、中文開發詞、模組名稱、動態模板與錯誤輸出。正式來源與開發／GM／診斷分開判讀；不是依關鍵字全部取代。

確認並修正 **45 組玩家顯示問題**（同一提示中多個術語視為一組；共用提示的多個呼叫點不重複計數）。另同步強化階段說明的穩定項目 ID 對照、正常結算標題復原、內建斷言及 17 個資產快取版本。

保留：GM 管理頁與測試能力、GM 匯入失敗詳情、console 原始例外物件、錯誤代碼、結構化遷移／備份報告、DOM/data-owner/pending 等識別碼、完整性檢查。競技場「模擬單元／測試平台」是正式敵人名稱；音樂授權與匯出 JSON 是玩家確實需要的資訊，均保留。

## 逐項修改對照

| # | 檔案 | 修改前 | 修改後 |
|---|---|---|---|
| 1 | offlineprogress.js | 為避免大量 DOM 造成卡頓不在此逐件展開。 | 可前往背包查看其餘裝備。 |
| 2 | offlineprogress.js | 完成一場符合條件的主線普通／菁英戰鬥後，即可建立離線收益基準。Boss、副本與背景 catch-up 不會建立此樣本。 | 在遊戲畫面中完成一場銀河紀元主線普通怪或菁英怪戰鬥並獲勝後，即可開始累積離線收益。敵人等級最多可比角色低 15 級。 |
| 3 | offlineprogress.js | 完成一場宇宙紀元主線 Boss 正式前景勝利後，即可建立離線收益基準。背景戰鬥、回頁 catch-up 與副本不會建立此樣本。 | 在遊戲畫面中完成一場宇宙紀元主線 Boss 戰鬥並獲勝後，即可開始累積離線收益。 |
| 4 | offlineprogress.js | 完成一場高維紀元正式前景戰鬥並成功結算後，即可建立高維離線裝備樣本。背景戰鬥、回頁 catch-up、GM 測試不會建立此樣本。 | 在遊戲畫面中完成一場高維紀元的正式戰鬥並成功結算後，即可開始累積離線裝備收益。 |
| 5 | offlineprogress.js | 偵測到舊版 Offline battle sample V${Math.max(0,Number(migration.sourceSampleVersion)\|\|0)}。因舊格式無法安全對應目前三紀元實戰樣本，僅淘汰該離線樣本與 pending，不會修改角色、裝備或正式進度。 | 部分舊版離線紀錄無法沿用，本次已重新開始計算離線時間。角色、裝備及遊戲進度不受影響。 |
| 6 | offlineprogress.js | 尚無可用的主線實戰樣本 | 離線收益說明 |
| 7 | offlineprogress.js | 本次離線區段因沒有可計算的實戰基準而不發放收益，已建立新的離線起點；之後只要有有效樣本，離線結算就會正常出現。 | 本次離線期間沒有符合條件的收益紀錄，因此沒有取得收益。離線時間已重新開始計算。 |
| 8 | offlineprogress.js | detail.innerHTML=&#96;<div class="offline-duration">離線 ${formatDuration(info?.elapsedUsed\|\|info?.elapsedRaw\|\|0)} | page.querySelector(".offline-page-title").textContent="本次沒有離線收益";<br>  detail.innerHTML=&#96;<div class="offline-duration">離線 ${formatDuration(info?.elapsedUsed\|\|info?.elapsedRaw\|\|0)} |
| 9 | offlineprogress.js | 次裝備模擬基準 | 次裝備掉落機會 |
| 10 | offlineprogress.js | 依最近正式高維戰鬥樣本估算；不指定 Boss，也不造成任何 Boss HP 傷害。 | 依最近完成的高維戰鬥估算，不會對任何 Boss 造成傷害。 |
| 11 | offlineprogress.js | 高維離線只模擬裝備掉落機會： | 高維離線只會獲得裝備： |
| 12 | gameguide.js | 進入下一個 Stage，最高 Stage ${snapshot.maxStage}。每提升 1 Stage： | 進入下一個強化階段，最高為第 ${snapshot.maxStage} 階段。每提升 1 階段： |
| 13 | gameguide.js | Boss 擊破、Stage 跨越、 | Boss 擊破、強化階段改變、 |
| 14 | gameguide.js | 完成正式前景高維戰鬥並成功結算後，可建立高維離線裝備樣本。離線只模擬裝備掉落機會， | 在遊戲畫面中完成高維紀元正式戰鬥並成功結算後，即可開始累積離線裝備收益。離線只會獲得裝備， |
| 15 | gameguide.js | ["Stage 強化",thirdWorldStageGuideText(rules)] | ["強化階段",thirdWorldStageGuideText(rules)] |
| 16 | gameguide.js | 高維連戰的死亡次數只在本輪 runtime 中累積，不寫入存檔。 | 高維連戰的死亡次數只在本輪戰鬥中累積，不會保留至下一輪。 |
| 17 | gameguide.js | ；GM 測試速度不改變正式玩家規則。 | 。 |
| 18 | gameguide.js | 進入第三紀元前已完成的角色養成會依正式戰鬥 owner 繼續生效； | 原有養成效果將繼續生效； |
| 19 | gameguide.js | 依最近的宇宙主線戰鬥樣本取得部分 | 依最近獲勝的宇宙主線 Boss 戰鬥取得部分 |
| 20 | thirdworldguidecopy.js | 會逐步進入更高 Stage， | 會逐步進入更高的強化階段， |
| 21 | playersemanticsui.js | 高維紀元已由共用玩家 UI 正確接管；十王正式玩家 UI 將由第三紀元介面 owner 提供。 | 高維戰線載入未完成，請重新整理後再試。 |
| 22 | thirdworldplayerflow.js | ：Stage ${whole(event.from)} → Stage ${whole(event.to)} | ：強化階段 ${whole(event.from)} → ${whole(event.to)} |
| 23 | thirdworldplayerflow.js | "Stage 已改變" | "強化階段已改變" |
| 24 | thirdworldplayerflow.js | "active-runtime":"其他正式流程接管" | "active-runtime":"目前有其他戰鬥正在進行" |
| 25 | thirdworldui.js | >Stage ${whole(snap.stage)}</div> | >階段 ${whole(snap.stage)}</div> |
| 26 | thirdworldui.js | if(result?.ok===false){alert(String(result?.reason\|\|"目前無法開始高維連戰。"));return false;} | if(result?.ok===false){console.warn("[文明戰線] 高維連戰未能開始",result);const messages={"找不到高維 Boss。":"找不到此高維存在，請重新整理後再試。","高維連戰進行中，必須先停止目前連戰才能更換目標。":"請先停止目前連戰，再選擇其他高維存在。","已有其他正式戰鬥／背景流程進行中，無法開始高維連戰。":"目前有其他戰鬥正在進行，請先結束後再挑戰。"};alert(messages[String(result.reason\|\|"")]\|\|"高維連戰暫時無法開始，請重新整理後再試。");return false;} |
| 27 | thirdworldarenaui.js | ${esc(rt.stopReason\|\|"")}</div></section></div>&#96;;} | 若問題持續，請先匯出存檔備份。</div></section></div>&#96;;} |
| 28 | reincarnationui.js | 離線樣本與未結算戰鬥暫態 | 離線紀錄與尚未結算的戰鬥 |
| 29 | reincarnationui.js | 目前仍有戰鬥、戰鬥介面或背景流程正在執行，請先結束後再進行轉生。 | 目前仍有戰鬥或結算尚未結束，請先結束戰鬥並關閉戰鬥畫面，再進行轉生。 |
| 30 | reincarnationui.js | 轉生安全交易元件尚未完整載入，請重新整理後再試。 | 轉生功能尚未載入完成，請重新整理後再試。 |
| 31 | worldphaseui.js | 世界轉換元件尚未完整載入，請重新整理後再試。 | 突破功能尚未載入完成，請重新整理後再試。 |
| 32 | mirrordungeonguide.js | 離開前景 | 切換到其他分頁或離開遊戲畫面 |
| 33 | mirrordungeonui.js | 離開前景 | 切換到其他分頁或離開遊戲畫面 |
| 34 | mirrordungeonrun.js | 鏡像戰模組尚未載入， | 鏡像戰尚未載入完成， |
| 35 | mirrordungeonui.js | 鏡像戰模組尚未載入， | 鏡像戰尚未載入完成， |
| 36 | mirrordungeonui.js | 鏡像戰戰鬥模組尚未載入， | 鏡像戰尚未載入完成， |
| 37 | mirrordungeonrun.js | 鏡像戰快照暫不可用， | 目前無法準備鏡像對手， |
| 38 | mirrordungeonrun.js | 請返回遊戲前景後再繼續鏡像戰； | 請返回遊戲畫面後再繼續鏡像戰； |
| 39 | enhancementui.js | 系統不會自動補強化等級，請使用 GM／存檔檢查處理。 | 系統不會自動調整強化等級，請先匯出存檔備份。 |
| 40 | enhancementui.js | alert(result.reason\|\|"強化失敗。") | alert(result.reason==="無法建立強化前存檔快照。"?"強化前的存檔備份無法完成，請先匯出存檔並重新整理後再試。":result.reason\|\|"強化失敗。") |
| 41 | playerbatchupgrades.js | 強化資料異常，請先使用 GM／存檔檢查處理。 | 強化資料異常，請先匯出存檔備份，重新整理後再試。 |
| 42 | cloudsave.js |  function errorText(error){<br>  const raw=String(error?.message\|\|error\|\|"").trim();<br>  if(!raw)return "雲端存檔操作失敗，請稍後再試。";<br>  if(raw.toLowerCase().includes("row-level security"))return "雲端存檔權限驗證失敗，請重新登入後再試。";<br>  return raw;<br> }<br> |  function errorText(error){<br>  console.error("[文明戰線] Cloud save operation failed",error);<br>  const raw=String(error?.message\|\|error\|\|"").trim();<br>  if(raw.toLowerCase().includes("row-level security"))return "雲端存檔權限驗證失敗，請重新登入後再試。";<br>  if(error?.code==="FUTURE_SAVE_VERSION")return "雲端存檔來自較新的遊戲版本，請更新遊戲後再試。";<br>  if(error?.code==="UNSUPPORTED_LEGACY_SAVE_VERSION")return "這份雲端存檔版本過舊，目前無法安全讀取。請先保留備份。";<br>  const known=new Set(["登入帳號已變更，請重新操作雲端存檔。","本機存檔所屬帳號已變更，已取消上傳。","本機存檔失敗，已取消上傳。","雲端存檔內容無效。","下載後寫入本機存檔失敗。"]);<br>  if(known.has(raw))return raw;<br>  if(raw==="本機存檔無法整理成雲端資料。")return "無法讀取本機存檔，請先匯出備份並重新整理後再試。";<br>  if(raw==="正式存檔 migration 尚未載入。"\|\|raw==="正式存檔版本保護尚未載入。")return "存檔功能尚未載入完成，請重新整理後再試。";<br>  return "雲端存檔操作未完成，請確認網路與登入狀態後再試。";<br> }<br> |
| 43 | supabaseauth.js | 重設密碼工作階段已失效，請返回登入頁重新寄送重設密碼信。 | 重設密碼連結已失效，請返回登入頁重新寄送重設密碼信。 |
| 44 | supabaseauth.js |   return raw;<br> }<br><br> function setStatus |   console.error("[文明戰線] Account operation failed",error);<br>  if(raw==="帳號服務尚未初始化。")return "帳號服務尚未載入完成，請重新整理後再試。";<br>  if(raw==="登入未取得有效工作階段，請再試一次。")return "登入未完成，請重新登入後再試。";<br>  return "帳號操作未完成，請確認網路連線後再試。";<br> }<br><br> function setStatus |
| 45 | saveversionguard.js | ${backup.error\|\|"請先匯出 JSON 或清理瀏覽器儲存空間。"} | 請先匯出存檔備份，或清理瀏覽器儲存空間後再試。 |

## 收益條件核對

- 銀河：遊戲畫面中主線普通／菁英戰鬥獲勝，敵人等級最多比角色低 15 級；不包含 Boss 或副本。
- 宇宙：遊戲畫面中的主線 Boss 戰鬥獲勝。
- 高維：正式戰鬥成功結算即可，不要求擊殺；仍只有裝備收益，沒有 EXP、維度之弦、核心、稱號、劇情或 Boss 傷害／進度。
- 既有有效時間、戰速與背景判定不變。10% 計算、12 小時上限、三紀元差異與過等級收益處理不變。
- 舊 V1/V2 資料先淘汰離線樣本與 pending；無可用紀錄且達結算時間時，原流程重新設置離線起點，再顯示相容提示。因此提示限於該顯示路徑，沒有宣稱每次正規化都重置時間。

## 驗收方式

- `player-copy-boundaries.cjs`：計算、發獎、計時、存檔程式區段與基準逐位元相同；GM／integrity 全檔不變；雲端與帳號顯示轉換仍保留原始錯誤物件。
- `player-copy-browser.cjs`：Playwright 1.55 Chromium／WebKit，各 18 個實際顯示畫面（390×844、1440×900；三紀元無收益／舊資料提示／正常結算）。斷言可見文字、無技術術語、無水平溢出、所有存檔欄位不被顯示函式修改。
- 實際呼叫三紀元發獎函式，以固定隨機值排除裝備隨機性，對照 10 場 × 10% 的正式收益預覽；高維無裝備命中時全存檔不變，EXP／弦／核心均為零。
- 轉生完成／阻擋／載入失敗、連戰停止說明、共用頁面備援與所有遊戲說明分類內容均加入回歸斷言。
- 既有離線來源、舊存檔遷移、轉生重置／交易／UI、存檔 hook 與雲端失敗回歸測試保持原斷言。
- 封存來源檢查透過逐一列舉替換＋替換次數＋前後 SHA-256 投影回既有封存；不改任何歷史基準、不放寬容差。實際瀏覽器與行為測試使用現行檔案。

測試 JSON 與截圖由既有 Runtime R2 工作用 artifact 留存。最終 CI／合併／部署證據補於 PR；正式網站驗收使用隔離瀏覽器與測試資料，不操作玩家存檔。
