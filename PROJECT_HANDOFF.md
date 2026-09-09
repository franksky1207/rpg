# 《文明戰線》正式跨對話交接文件

> **最高原則：GitHub `main` branch 的實際程式碼永遠是唯一真實來源。**
>
> 本文件是給下一個 ChatGPT／後續開發對話使用的「快速承接層」。若本文與 `main` 實際程式碼衝突，**一律以 `main` 為準**；接手後應先讀本文，再重新讀取要修改的正式檔案。

---

## 1. 專案基本資料

- 遊戲名稱：**文明戰線**
- Repository：`franksky1207/rpg`
- 正式分支：`main`
- GitHub Pages：`https://franksky1207.github.io/rpg/`
- 技術：純前端 HTML / CSS / JavaScript + `localStorage`
- `SAVE_KEY="frank_text_rpg_save"`
- `SAVE_VERSION=7`
- 目前正式 `MAX_LEVEL=100`
- GM 密碼：`franksky`
- 必須同時支援桌機與手機

遊戲核心方向：**傳統、簡單、文字型 RPG**。
只保留：打怪、升級、金幣、裝備、地圖、Boss、副本、特殊怪、GM 管理／測試。
目前不要主動加入：職業、技能樹、複雜任務、大量劇情、多角色、PvP、排行榜、登入／每日系統等。

世界規劃：
- Lv1～50：地球戰爭
- Lv51～100：太陽系戰爭
- 未來規劃 Lv101～150：銀河系戰爭
- 之後仍可延伸更高等級

---

## 2. 給下一個 ChatGPT 的操作規範（非常重要）

### 2.1 執行語意

如果使用者說：
- 「做」
- 「修改」
- 「修」
- 「執行」
- 「第一批／第二批／第三批／第四批」
- 「可以」且上下文已是明確執行內容

→ **可以直接修改 GitHub `main`，不需要再要求使用者手動貼程式碼。**

如果使用者說：
- 「先不要改」
- 「先建議」
- 「先討論」
- 「你覺得呢」

→ 只討論，不寫入 GitHub。

### 2.2 每次修改流程

1. 修改前先重新抓 `main` 的相關檔案。
2. 確認目前真正正式來源在哪裡，避免憑舊對話印象直接改。
3. 優先**直接修改正式來源**。
4. 不要為同一功能另做第二套公式、第二套 GM 邏輯、第二套裝備判斷。
5. 修改後重新讀取關鍵變更檔案確認。
6. `.js` / `.css` 有修改時，必須同步更新 `index.html` 的 `?v=` cache-bust。
7. GitHub 修改完成不等於瀏覽器真機測試完成；Pages 實際操作仍由使用者測。
8. 重要功能完成後，更新本文件。

### 2.3 架構原則

- **main 是唯一真實來源。**
- classic `<script>` 頂層 `let/const` 可能互撞；新增獨立模組時優先 IIFE。
- script load order 是架構的一部分，不可隨意重排。
- `ui.js` 歷史上曾因大改造成整頁空白；一般情況下避免大範圍重寫。
- 但若某功能的正式來源本來就在核心檔案，且使用者要求「不要多繞路」，應直接修正式函式，不要新增 `newXXX()` + override。
- **裝備系統尤其禁止保留舊公式 fallback、新舊格式判斷、wrapper 疊舊函式。**
- 現在使用者願意在重大裝備改版後重置，因此不需要為已淘汰的舊裝備格式額外保留 migration。

---

## 3. Lv1～100 世界正式結構

每 5 級 1 張地圖；每張固定：
- 3 隻普通怪
- 1 隻菁英
- 1 隻 Boss

共：
- 20 張地圖
- 100 隻主線怪物
- 每張地圖 5 種對應裝備名稱

### 地球戰爭 Lv1～50

1. 城市淪陷區 Lv1～5
2. 郊區防衛線 Lv6～10
3. 地下軍事設施 Lv11～15
4. 荒漠戰區 Lv16～20
5. 污染禁區 Lv21～25
6. 極地戰線 Lv26～30
7. 古代科技遺址 Lv31～35
8. 火山兵器基地 Lv36～40
9. 全球指揮中心 Lv41～45
10. 地球決戰區 Lv46～50

### 太陽系戰爭 Lv51～100

11. 月面登陸區 Lv51～55
12. 月球軌道站 Lv56～60
13. 火星殖民區 Lv61～65
14. 火星赤原戰場 Lv66～70
15. 小行星採礦帶 Lv71～75
16. 木衛戰區 Lv76～80
17. 木星軌道圈 Lv81～85
18. 土星環防線 Lv86～90
19. 外太陽系邊境 Lv91～95
20. 太陽系終極戰線 Lv96～100

正式怪物／裝備名稱一律以：
- `worldmaps-earth.js`
- `worldmaps-solar.js`

為準，不要從舊 `data.js` 的歷史地圖名稱推斷正式內容。

---

## 4. 玩家、主線怪、傷害

### 玩家基礎能力

```js
baseHP(l)=ceil(110+12*(l-1))
baseATK(l)=ceil(15+2.2*(l-1))
baseDEF(l)=ceil(7+1.2*(l-1))
```

### 主線怪正式有效基礎（`balance.js`）

```js
hp=ceil(62+16.2*l)
atk=ceil(10.5+2.45*l)
def=ceil(3.2+.92*l)
```

階段倍率 HP / ATK / DEF：
- 第1普通：1.00 / 1.00 / 1.00
- 第2普通：1.12 / 1.10 / 1.08
- 第3普通：1.30 / 1.22 / 1.16
- 菁英：1.62 / 1.36 / 1.24
- Boss：2.12 / 1.48 / 1.30

怪物 style：
- tank：HP ×1.25、ATK ×0.9
- attack：HP ×0.85、ATK ×1.2

傷害公式：

```js
max(1,ceil((atk-def*.55)*random(.95~1.05)))
```

暴擊傷害：1.5×。

---

## 5. EXP 與獎勵

### EXP

`sameExp(l)=ceil(25+4*l)`。

正式永久曲線在 `level100balance.js`：

```js
const x=Math.pow(level-1,1.8);
const mid=Math.pow(64,1.8);
factor=5+195*(x/(x+mid));
expNeed(level)=ceil(sameExp(level)*factor);
```

同級普通怪約需擊殺：
- Lv1：5
- Lv10：約10.5
- Lv20：約24.7
- Lv30：約42.8
- Lv40：約61.7
- Lv50：約79.5
- Lv60：約95.4
- Lv75：約115.2
- Lv100：約138.9
- 高等漸近約200隻

等級差 EXP 倍率：
- 怪高玩家 ≥5：1.3
- +3～4：1.2
- +1～2：1.1
- 同級：1
- -1～-2：0.9
- -3～-5：0.6
- -6～-10：0.25
- < -10：0.05

怪物種類 EXP 倍率：普通1／菁英2／Boss5。

### 金幣

```js
goldBase(l)=ceil(6+4*l)
```

種類倍率：普通1／菁英2.5／Boss6。

---

## 6. 裝備系統 —— 2026-09-09 最新正式基準

這一節非常重要，舊裝備公式已淘汰。

### 6.1 品質

品質：
- 普通 q0：倍率1
- 優良 q1：1.15
- 稀有 q2：1.35
- 史詩 q3：1.6
- 傳說 q4：1.95
- 神話 q5：2.4

出售倍率：1 / 1.4 / 2 / 3.2 / 5 / 8。
神話永不自動出售。

### 6.2 正式部位

```js
EQUIPMENT_TYPES=["weapon","helmet","armor","shoes","accessory"]
```

主能力：
- 武器：ATK
- 頭盔：HP
- 鎧甲：DEF
- 鞋子：**HP**（舊制主閃避已淘汰）
- 飾品：**暴擊**

### 6.3 ATK / DEF / HP 主能力

```js
weapon = ceil((3+1.55*level)*qualityMultiplier)
helmet = ceil((8+2.5*level)*qualityMultiplier)
armor  = ceil((1+0.65*level)*qualityMultiplier)
shoes  = ceil((8+2.5*level)*qualityMultiplier)
```

鞋子目前與頭盔使用同一套 HP 主能力公式。

### 6.4 飾品主暴擊（只看品質，不看裝備 Lv）

- 普通：1～2%
- 優良：2～3%
- 稀有：3～5%
- 史詩：5～7%
- 傳說：7～9%
- 神話：9～10%

區間內抽**整數百分比**。

### 6.5 一般詞條

詞條池：
- 武器：ATK / 暴擊 / HP
- 頭盔：HP / DEF / 閃避
- 鎧甲：DEF / HP / 閃避
- 鞋子：閃避 / DEF / HP
- 飾品：暴擊 / ATK / HP / 閃避

詞條數：
- 普通：0
- 優良：1
- 稀有：50% 1條 / 50% 2條
- 史詩：2
- 傳說：50% 2條 / 50% 3條
- 神話：3

**同一件裝備的詞條禁止重複。**
`rollAffixes()` 目前直接從 pool `splice()` 抽走，舊 `(used[stat]||0)<2` 已移除。

ATK / DEF / HP 詞條仍隨 Lv + 品質成長：

```js
ATK = ceil((1+0.45*level)*m)
DEF = ceil((0.5+0.20*level)*m)
HP  = ceil((3+0.9*level)*m)
```

暴擊／閃避詞條**不再跟 Lv 成長**，只依品質：
- 普通：沒有詞條
- 優良：1%
- 稀有：1～2%
- 史詩：2～3%
- 傳說：3～4%
- 神話：4～5%

舊 `.04*level`、舊鞋／飾 `.12*level` 都不應再出現。

### 6.6 暴擊／閃避自然來源上限概念

裝備來源理論最大：
- 暴擊：武器暴擊詞條5 + 飾品主暴10 + 飾品暴擊詞條5 = **20%**
- 閃避：頭盔5 + 鎧甲5 + 鞋5 + 飾品5 = **20%**

未來 VIP 規劃（尚未實作）：
- V0～V20
- 每級 +0.5% 暴擊、+0.5% 閃避
- V20 再 +10% / +10%

所以未來玩家自然理論值：20%裝備 +10%VIP = 30%。

**玩家端目前 `equippedStats()` 不做舊 30/25 硬截斷。**
只做 >=0 的正常化，讓未來 VIP 可自然疊加。

### 6.7 怪物安全 cap 與玩家分離

目前怪物端獨立使用：

```js
MONSTER_MAX_CRIT_RATE=30
MONSTER_MAX_DODGE_RATE=30
```

用途是怪物安全上限，不等於玩家上限。
特殊怪、懸賞、競技場、虛空幻境、怪物特性都應使用怪物專用 cap，不要重新拿它去截玩家。

### 6.8 正式裝備評分（唯一公式）

```text
Score =
ATK × 5
+ DEF × 5
+ HP
+ 暴擊 × (20 + 0.5 × 裝備Lv)
+ 閃避 × (20 + 0.5 × 裝備Lv)
```

暴擊與閃避同權重，且權重隨 item level 成長。

這一套 `equipmentScore()` 是整個遊戲唯一正式裝備比較公式，應用於：
- 是否為升級裝
- 自動保留升級裝
- 一鍵裝備較強裝備
- 一鍵出售較低裝備
- 背包排序／比較
- 商店比較
- 遺失裝備比較
- 「可提升」提示
- 特殊怪弱勢部位判斷
- 任何 GM 若需要裝備評分的地方

`gearupgrade.js` 已移除舊 `projectedStats()/combatValue()` 另一套戰力公式。

### 6.9 裝備舊制清理狀態

已刻意清掉：
- 舊鞋子主閃避公式
- 舊飾品主暴擊隨 Lv 公式
- 舊暴／閃詞條隨 Lv 公式
- 同詞條可重複兩次邏輯
- 舊裝備 `legacy` 顯示 fallback
- `worldexpansion.js` 的舊裝備名稱 migration
- `level100.js` 對 `gmCreateGear()` 的後載入覆寫

不要再為舊裝備格式加回 fallback；若測試需要，直接重置存檔。

---

## 7. 怪物特性

7種：
- 強壯：HP +20%
- 兇猛：ATK +15%
- 堅硬：DEF +20%
- 迅捷：閃避 +8%
- 致命：暴擊 +8%
- 狂暴：HP <50% 後 ATK +20%
- 巨體：HP +30%、ATK +5%、閃避 -5%

主線特性數：
- Boss：15% 0條 / 55% 1條 / 30% 2條
- 菁英：35 / 50 / 15
- 普通：70 / 25 / 5

怪物特性後暴／閃以怪物專用 `MONSTER_MAX_*` 做安全限制。

---

## 8. 主線推進與冒險 UI

主線每張地圖：
- 前4隻怪每隻需要 10 次擊殺推進
- Boss 解鎖另受角色等級與 Boss 重挑戰規則限制

`adventureprogressui.js` 已把舊的「地圖推進折疊區」概念改掉：
- 進度直接顯示在目前可見怪物卡片上
- 不再另外使用舊 progress fold 作為主要呈現

GM 有「指定解鎖到等級關卡」：
- 輸入 target Lv
- target 以前視為已完成
- target 本身保持「剛開始」
- target 若為 5 的倍數，代表 Boss 已出現但未擊殺（仍受角色等級顯示規則約束）
- 不修改角色等級／EXP／金幣／裝備／副本資料

---

## 9. 副本共通系統

正式用語：
- 副本次數累積進度
- 副本可挑戰次數
- 副本積分

```js
state.dungeon={progress:0,attempts:0,points:0}
```

每滿100%換1次挑戰，overflow 保留；attempts 可囤。

主線勝利取得副本進度：

```text
(敵人最大HP / 玩家該場開始等級 baseHP) * 1.5%
+ 本場實際損血率 * 4%
```

敗北、timeout、特殊怪、真正副本不給副本進度。

共通副本規則：
- 進場消耗1次
- 不給主線 EXP／金幣／一般裝備
- 不影響主線 kill／Boss／地圖進度
- 副本死亡不吃主線死亡懲罰
- 結束後預設滿血
- 200回合保護由 `dungeoncore.js`

解鎖：
- 懸賞戰 Lv5
- 競技場 Lv15
- 虛空幻境 Lv25

---

## 10. 懸賞戰 —— 平衡凍結

Lv5 解鎖。

出現率：
- 普通45%
- 高級35%
- 危險20%

積分：80 / 120 / 180。

正式名稱：
- 普通：武裝逃逸者／非法改裝兵／黑市護衛／走私突擊手／失控安保機
- 高級：裝甲追緝犯／戰區破壞手／非法火力平台／禁區滲透指揮／深空走私艦長
- 危險：都市級威脅體／殲滅協議載體／戰爭失控核心／軌道破壞平台／深空封鎖母艦

目前平衡已多輪測試，除非使用者明確重開，**不要主動改平衡**。

怪物暴／閃由玩家能力縮放，但有各 tier 自己 cap，再套怪物安全 cap。

---

## 11. 競技場 —— 平衡接受

Lv15 解鎖；三場之間不回血。

敵名：
- 基礎模擬單元
- 戰術強化單元
- 極限測試平台

積分：
- 普通 30 / 40 / 50 +40 =160
- 困難 40 / 55 / 70 +65 =230
- 極限 50 / 70 / 95 +105 =320

目前平衡已接受，除非使用者明確要求，不要無理由調整。

---

## 12. 特殊怪

正式名稱：
- 稀有資源聚合體
- 誘餌補給艙
- 終止協議單元
- 機率增幅信標
- 封存警戒機
- 裝備保全單元
- 黑市武裝頭目
- 戰利品回收者
- 流動交易代理人

特殊怪能力主要由玩家實際能力動態建立，暴／閃已使用怪物專用上限。

GM 可進行特殊怪 ×100 沙盒測試，不修改正式角色資料。

---

## 13. 虛空幻境 —— 正式可玩

Lv25 解鎖，無限樓層。

### 13.1 核心能力

敵人不看玩家等級／能力，只看樓層 `F`：

```js
E = 24 + F / 10
HP  = ceil((62 + 16.2 * E) * 2.40)
ATK = ceil((10.5 + 2.45 * E) * 2.15)
DEF = ceil((3.2 + 0.92 * E) * 2.65)
```

- 基礎暴擊10%
- 基礎閃避8%
- 普通層1個特性
- 每10層 Boss 2個不同特性
- 特性後再套怪物安全 cap
- 失敗後重打同層，特性重新抽

### 13.2 首通積分

```js
points = round(15 + 1.75 * sqrt(floor - 1))
if (floor % 10 === 0) points *= 2
```

只在首次成功通過該層時發放。

### 13.3 正式流程

- `state.dungeon.voidMirage.highestCleared` 記錄最高通關樓層
- 1 次副本可挑戰次數 = 1 次完整爬塔
- 從 `highestCleared + 1` 開始
- 每層開始前滿血
- 勝利：存進度、給首通分、滿血、下一層
- 敗北／200回合未決：本次結束
- 可強制退出；已取得樓層與積分保留，不退次數

### 13.4 UI

正式 UI 由 `dungeonvoidui.js` + `uifix.js` 等目前載入層共同呈現。
目前使用者已接受手機版虛空 UI。

### 13.5 GM

已有：
- 查看指定樓層能力
- 從指定樓層連續爬塔模擬
- 虛空樓層管理（重設／移動／爬樓並依規則給分）

相關：
- `dungeonvoidgmmanage.js`
- `dungeonvoidgmui.js`
- `dungeongm.js`
- `gmhub.js`

---

## 14. 裝備掉落與戰鬥結算 UI

`settlementui.js` 是目前正式的「簡潔掉落清單」共用來源。

主線／風險／特殊結算掉落列表目前原則：
- 只顯示裝備名稱／品質／等級
- 自動出售顯示金幣
- 不在結算逐件顯示完整能力／評分／升級標記
- 整體「有可提升裝備」提示仍保留

`risksettlement.js` 與 `specialencounter.js` 會委派到共用結算呈現。

**死亡遺失裝備**與**商店贖回／比較**仍保留完整裝備能力與評分，不跟掉落簡化一起刪。

舊 `settlementuifix.js` 已刪除，不要重新加 MutationObserver 類補丁。

---

## 15. GM Hub —— 目前正式狀態

頂層頁籤：
- 管理
- 測試

`GM_UI_GUIDE.md` 為視覺規範。

### 管理

已支援：
- 指定等級 Lv1～100
- 指定金幣
- 指定解鎖到等級關卡
- 補滿 HP
- 清空背包
- 商店刷新／重置
- 副本進度／次數／積分直接設定
- 虛空幻境樓層管理

### 產生裝備

欄位：
- 品質
- 等級
- 部位

部位包含：
- 武器
- 頭盔
- 鎧甲
- 鞋子
- 飾品
- **全部**

選「全部」時：
- 一次生成 5 件
- 同品質、同等級
- 各自對應五部位
- 直接進背包
- 不自動穿上
- **全部直接呼叫正式 `makeItem()`**
- 不存在 GM 專用第二套裝備算法

### 測試

已有：
- 特殊怪測試（含 ×100）
- 副本進度 Debug
- 懸賞生成／×100
- 競技場 ×100
- 虛空幻境單層／連續爬塔

不需要為裝備額外做複雜統計測試；使用者偏好直接 GM 生裝 + 實際測。

---

## 16. 手機／桌機 UI 最新修正

### 16.1 hover 假雙框

iPhone Safari 曾因 `:hover` 殘留，在冒險怪物卡造成「真正 selected + 另一個假金框」。

現在 hover 限制為：

```css
@media (hover:hover) and (pointer:fine) { ... }
```

所以只有真正有滑鼠的裝置套 hover；手機只看 `.active`。

### 16.2 禁止雙擊放大、保留雙指縮放

全頁 `html, body` 已套：

```css
touch-action: manipulation;
```

目的：
- 手機任一位置快速雙擊不要觸發 Safari double-tap zoom
- 正常單指捲動保留
- **雙指 pinch zoom 保留**
- 沒有使用 `user-scalable=no`

### 16.3 手機一般要求

- 不可水平溢出
- Modal 可垂直捲動
- input/select 不超寬
- 長文字可換行
- iPhone safe area 保留
- 冒險準備頁手機下方有固定戰鬥次數與操作區

---

## 17. 現存 wrapper／相容層：哪些可以存在、哪些不要新增

本專案歷史上有不少後載入相容層。
目前仍存在且有用途的例如：
- `level100.js`：將舊核心的 Lv50 邏輯延伸到 Lv100
- `worldexpansion.js`：將世界進度結構校正為目前 20 張地圖
- `level100balance.js`：覆蓋 EXP 曲線
- `balance.js`：主怪正式平衡
- 一些 dungeon／UI module 的路由與後載入包裝

**不要把「不要 wrapper」理解成整個 repo 必須一次重構。**
真正禁止的是：為剛改完的正式裝備規則又建立第二套舊／新雙軌。

裝備這次已清理成：
- 正式 `mainStatValue()`
- 正式 `affixStatValue()`
- 正式 `rollAffixes()`
- 正式 `equipmentScore()`
- GM 直接 `makeItem()`

未來若改裝備，直接改這些正式來源。

---

## 18. world/save 相容現況

`worldexpansion.js` 現在仍會校正：
- `mapProgress`
- `bossProgress`
- `bossLocked`
- `bossKilled`
- `unlockedMap`

以支援 20 張世界地圖。

但**舊裝備名稱 migration 已移除**。
`itemAbilityLines()` 的舊裝備 legacy fallback 也已移除。

因此重大裝備改版測試建議：**直接重置存檔，從 Lv1 開始。**

---

## 19. 關鍵檔案職責

- `data.js`：SAVE_KEY／SAVE_VERSION／品質與舊基礎資料容器
- `worldmaps-earth.js`：Lv1～50 正式世界資料
- `worldmaps-solar.js`：Lv51～100 正式世界資料
- `engine.js`：核心玩家／裝備／戰鬥／商店等基礎正式函式
- `balance.js`：主線怪正式平衡
- `traits.js`：怪物特性
- `gearupgrade.js`：所有裝備升級／最佳／出售較弱等比較，統一使用 `equipmentScore()`
- `level100.js`：Lv100 相容層；目前不再覆寫 `gmCreateGear()`
- `worldexpansion.js`：20 地圖世界狀態校正與跨地圖解鎖
- `level100balance.js`：永久 EXP 曲線
- `ui.js`：主 UI 核心，避免無必要大改
- `adventureprogressui.js`：主線怪物卡進度呈現
- `settlementui.js`：共用簡潔掉落列表
- `risksettlement.js`：風險戰鬥結算整合
- `specialencounter.js`：特殊遭遇正式流程／結算整合
- `specialmonsters.js`：特殊怪能力生成
- `specialcore.js`：特殊怪正式戰鬥核心
- `specialgm.js` / `specialgmbatch.js`：特殊怪 GM 沙盒與 ×100
- `dungeonprogress.js`：副本進度／次數／積分
- `dungeoncore.js`：副本共通進場／結束／戰鬥核心
- `dungeonbounty.js`：懸賞戰
- `dungeonarena.js`：競技場
- `dungeonvoid.js`：虛空幻境核心
- `dungeonvoidui.js`：虛空正式 UI／動畫
- `dungeongm.js`：副本測試 Debug
- `dungeonvoidgmmanage.js`：虛空 GM 樓層管理
- `dungeonvoidgmui.js`：虛空 GM 管理 UI
- `gmtools.js`：GM 一般管理 + 正式裝備生成
- `gmhub.js`：GM Hub 最終整合
- `dungeonui.js`：副本首頁／入口／路由
- `uifix.js`：後段 UI 修正
- `style.css`：全域桌機／手機樣式；含 hover 限制與 touch-action
- `GM_UI_GUIDE.md`：GM 視覺規範

---

## 20. 目前 `index.html` 正式載入順序與 cache 版本（2026-09-09）

CSS：
```text
style.css?v=20260909-1758
dungeonarena.css?v=20260908-2245
```

JS：
```text
data.js?v=20260908-2247b2
worldmaps-earth.js?v=20260908-2247b2
worldmaps-solar.js?v=20260908-2247b2
engine.js?v=20260909-1535
dungeonprogress.js?v=20260908-1937
dungeoncore.js?v=20260908-1958
ui.js?v=20260907-2033
settlementui.js?v=20260909-1015
balance.js?v=20260907-2033
traits.js?v=20260909-1515
traitlock.js?v=20260907-2033
battlelimit.js?v=20260908-1341
playername.js?v=20260907-2033
battleflow.js?v=20260907-2033
traitdrop.js?v=20260907-2033
gmtools.js?v=20260909-1515
shopbalance.js?v=20260907-2052
gearupgrade.js?v=20260909-1450
specialmonsters.js?v=20260909-1515
dungeonbounty.js?v=20260909-1515
dungeonarena.js?v=20260909-1515
dungeonvoid.js?v=20260909-1515
dungeonvoidui.js?v=20260909-0732
levelcap.js?v=20260908-0752
specialgm.js?v=20260908-0721
specialcore.js?v=20260908-0701
specialgmbatch.js?v=20260908-0721
dungeongm.js?v=20260909-0750
gmhub.js?v=20260909-1515
dungeonvoidgmmanage.js?v=20260909-0915
dungeonvoidgmui.js?v=20260909-0915
level100.js?v=20260909-1535
worldexpansion.js?v=20260909-1535
level100balance.js?v=20260908-2325
risksettlement.js?v=20260909-1015
specialencounter.js?v=20260909-1015
battlepipeline.js?v=20260908-1341
specialguide.js?v=20260908-0047
levelcapresult.js?v=20260908-0803
dungeonui.js?v=20260909-0732
adventureprogressui.js?v=20260909-0928
uifix.js?v=20260909-0901
```

**不要僅因文件寫了這些版本就假設仍最新；下一個對話一定先重新抓 `index.html`。**

---

## 21. 重要踩雷／不要回復的舊行為

- 不要把玩家閃避重新 cap 在 25%。
- 不要讓玩家和怪物共用同一個暴／閃上限語意。
- 不要把鞋子主能力改回閃避。
- 不要讓暴擊／閃避詞條重新跟裝備 Lv 成長。
- 不要允許同件裝備同詞條重複。
- 不要恢復舊 `combatValue()` 第二套裝備比較。
- 不要在 `level100.js` 再覆寫一套 GM 裝備生成。
- 不要為舊裝備格式加 migration / fallback。
- 不要恢復 `settlementuifix.js` MutationObserver 類補丁。
- 不要把手機 hover 套回所有觸控裝置。
- 不要用 `user-scalable=no` 禁止雙指縮放。
- 200回合曾有假勝利問題；不可恢復。
- `dungeonui.js` 後段主動 render／路由整合有歷史用途，改前先查。
- 懸賞、競技場平衡已測過，除非使用者明確要求，不要擅自重算。

---

## 22. 尚未實作／未定案

### 尚未實作
- 副本積分商店
- 副本積分抽獎
- VIP 系統
- Lv101～150 銀河系戰爭
- 更高等世界

### VIP 目前只確定的部分
- V0～V20
- 每級 +0.5% 暴擊
- 每級 +0.5% 閃避
- V20 = +10% / +10%

VIP 的 HP／ATK／DEF／掉寶等其他加成**尚未定案**，不要自行沿用早期「每級 +10%」想法。

---

## 23. 新對話建議第一句

可直接貼：

> 這是《文明戰線》網頁遊戲專案，GitHub repository：`franksky1207/rpg`，正式分支：`main`。請先連接 GitHub，讀取 `PROJECT_HANDOFF.md`，再重新檢查目前 `main` 的實際程式碼，以 `main` 為唯一正式基準。這是持續開發專案；之後我若說「做、修改、修、執行、第一批、第二批」等明確執行指令，可以直接修改 GitHub main。每次修改前先抓最新相關檔案，修改後重新驗證；JS/CSS 修改要更新 `index.html` cache-bust。優先直接修改正式來源，不要新增舊新雙軌、fallback 或重複公式。現在先不要修改任何東西，先完成專案承接後告訴我目前狀態。

---

## 24. 接手完成的判準

下一個 ChatGPT 在正式開始改功能前，至少應掌握：

1. main 是唯一真實來源。
2. 目前 Lv1～100 / 20 地圖。
3. 最新裝備品質制暴／閃規則。
4. 鞋主 HP、飾品主暴擊品質區間。
5. 唯一 `equipmentScore()` 公式。
6. 玩家無舊 25% 閃避 cap，怪物另有 30/30 安全 cap。
7. GM 產裝支援「全部」且直接走 `makeItem()`。
8. 虛空幻境、懸賞、競技場、特殊怪目前狀態。
9. `adventureprogressui.js`、`settlementui.js` 等近期 UI 架構。
10. 手機 hover 假雙框與雙擊放大已修。
11. 裝備舊 migration / fallback 已清除。
12. 修改 JS/CSS 必須 cache-bust。

只要以上重新從 `main` 核對無誤，就可以像本對話一樣繼續直接開發。