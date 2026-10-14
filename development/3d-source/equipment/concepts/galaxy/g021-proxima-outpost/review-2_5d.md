# g021 2.5D 概念審查遷移

政策：equipment-2.5d-v3.0；複查日期：2026-10-15；起點main：a232efb3e44e035bea20075762bf6789332d0b14。

正式身份：
```json
{
  "id": "g021",
  "epoch": "galaxy",
  "sourceKey": "galaxy:nearstar:map:0",
  "directory": "development/3d-source/equipment/concepts/galaxy/g021-proxima-outpost",
  "regionOrBoss": "近星戰爭 → 比鄰星前哨區",
  "equipmentNames": {
    "weapon": "比鄰星航刃",
    "helmet": "紅矮星作戰盔",
    "armor": "近星複合甲",
    "shoes": "光帆推進靴",
    "accessory": "比鄰座標器"
  }
}
```

- overview-front-side-back.webp: `3f4d9ab3e39e5f85d511e0ef99795ae54788a85248869f797f2fa8be9a199696`
- equipment-five-slots.webp: `8d147c7293db4768797a5f905ca74455266d783ca6c5f99096e22a8ec6508442`

ChatGPT初審為歷史助手／代理審查的政策遷移，原始來源 `docs/evidence/batch28-autonomous-review/generation-stage1-review.md`（SHA `fa4100c1062c36c51f813efb8b38a6f437a989230526f3110d543681794602e7`）；沒有聲稱本輪重新呼叫另一名審查者。G006/G007以當前版本代理批准為準，其他舊細節fail依新政策分類為建議。Codex本輪以12張只讀比對圖檢視60原圖及小尺寸參考，獨立核對owner和歷史逐圖記錄。

- officialIdentity: g021 已從正式owner重抽核對epoch/sourceKey/目錄及五槽中文名；galaxy:nearstar:map:0，名稱以notes而非AI小字判定。
- imageIntegrity: g021 兩張WebP完整解碼、bytes/尺寸/SHA符合起始main索引，內容分別為總覽與五槽參考且SHA不同。
- contentIdentity: g021 可見青線航刃、灰白偵察裙甲與雙天線圓盤；兩圖主要材質、武器和背件對應，未見錯套或整套缺失。
- characterReadability: g021 主體完整，青線航刃、灰白偵察裙甲與雙天線圓盤在縮小參考檢視仍有主要形體；此為概念靜態檢視，不宣稱正式戰鬥或手機實測。
- provenanceLicense: g021 沿用專案既存生成／使用者提供來源聲明，僅開發概念用途；未導入第三方素材，無新增授權衝突證據，不宣稱已取得商用發布授權。

非阻擋建議：g021：甲背空座未獨立畫出、膝靴止口未剖，不阻擋整套概念。素材完成與GM實測須另驗。

來源限制：前20套沿用專案歷史來源；G021～G025來源為附件提供者的ChatGPT生成聲明，無獨立原PNG生成追蹤；G026～G030有十次生成記錄。這是開發用途來源審核，不是對著作權的第三方證明；正式發布獨立保持false。

結論：未見新版真正blocker；概念pass-with-advisory，可製作2.5D素材；素材not-started、GM not-tested、正式發布false。G007原3D模型狀態獨立保留，不能當作新2.5D素材完成。
