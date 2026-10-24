# 本機載入／資源比較

同一390px桌機模擬、同一測量腳本的單次結果；不是實體iPhone或穩定平均值。時間從元件prepare到首張verified畫面；共用模組載入另列，首次合計在JSON的includingInitialModuleLoadMs。並行系統負載可能影響數字，不宣稱全面變快。

| 情境 | 整合前 ms | 整合後 ms |
|---|---:|---:|
| first-map-battle | 618.2 | 231.0 |
| repeat-same-battle | 51.7 | 7.4 |
| continuous-galaxy-map-004 | 306.9 | 305.5 |
| continuous-galaxy-map-008 | 10.6 | 158.1 |
| continuous-galaxy-map-009 | 65.8 | 202.4 |
| first-codex | 44.7 | 177.3 |
| codex-next-universe-boss-002 | 55.8 | 1.2 |
| codex-next-universe-boss-001 | 6.2 | 1.3 |
| codex-next-universe-boss-002 | 9.3 | 1.2 |
| gm-replay-galaxy-map-003 | 35.2 | 0.6 |
| gm-replay-galaxy-map-009 | 68.6 | 182.6 |
| gm-replay-galaxy-map-003 | 26.1 | 0.6 |
| alternate-alternate-depth-0001 | 321.1 | 334.7 |
| alternate-alternate-depth-0002 | 32.1 | 6.6 |
| alternate-alternate-depth-0006 | 51.8 | 220.2 |
| alternate-alternate-depth-0011 | 79.1 | 185.7 |
| after-resource-clear | 79.3 | 70.1 |

共用模組載入：前 430.0ms，後 339.3ms。本機HTTP未壓縮傳輸，正式主機壓縮行為不同。

完整新外觀冷製作有額外調色、WebP與靜態效果預繪成本；部分首次項目較慢。熱命中圖鑑約1ms、GM重播約1ms，跳過重複製作。快取只保留近期2～4套；低記憶體裝置取消推測預繪。

發布包約48.905→50.202MB，+5正式模組，無新增895張成品圖。持久白名單7模組約1.31MB原始資料／152KiB gzip估算；執行期Canvas快取4～8MiB／window，加原型解碼最多2MiB與活動畫布；不是整個瀏覽器程序記憶體。JS heap與命中／製作次數詳見JSON。

[整合前JSON](performance-before.json) · [整合後JSON](performance-after.json) · [模組成本](module-cost.json) · [真實SW清除／離線／恢復](cache.json)
