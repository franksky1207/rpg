# g030 2.5D 概念審查遷移

政策：equipment-2.5d-v3.0；複查日期：2026-10-15；起點main：a232efb3e44e035bea20075762bf6789332d0b14。

正式身份：
```json
{
  "id": "g030",
  "epoch": "galaxy",
  "sourceKey": "galaxy:nearstar:map:9",
  "directory": "development/3d-source/equipment/concepts/galaxy/g030-nearstar-blockade",
  "regionOrBoss": "近星戰爭 → 近星封鎖航域",
  "equipmentNames": {
    "weapon": "星航封鎖刃",
    "helmet": "星航主控盔",
    "armor": "近星主戰甲",
    "shoes": "封鎖曲率靴",
    "accessory": "星航封鎖中樞"
  }
}
```

- overview-front-side-back.webp: `3f714bcd2ef4ba467f01285ab38f564b46dc6c76b6b60ffe8e26d1cd3bbf57b8`
- equipment-five-slots.webp: `0db944610b79e610aea57470d8f8f08341ffc1a6482648c16a09a29a7bdbf128`

ChatGPT初審為歷史助手／代理審查的政策遷移，原始來源 `development/3d-source/equipment/concepts/galaxy/g030-nearstar-blockade/art-review.json`（SHA `2a5a84beec8a95520ff2ac8cb86cedec6963118df8aa8f734dcf542b3d294348`）；沒有聲稱本輪重新呼叫另一名審查者。G006/G007以當前版本代理批准為準，其他舊細節fail依新政策分類為建議。Codex本輪以12張只讀比對圖檢視60原圖及小尺寸參考，獨立核對owner和歷史逐圖記錄。

- officialIdentity: g030 已從正式owner重抽核對epoch/sourceKey/目錄及五槽中文名；galaxy:nearstar:map:9，名稱以notes而非AI小字判定。
- imageIntegrity: g030 兩張WebP完整解碼、bytes/尺寸/SHA符合起始main索引，內容分別為總覽與五槽參考且SHA不同。
- contentIdentity: g030 可見黑紅主戰甲、紅線封鎖刃與X形背框；兩圖主要材質、武器和背件對應，未見錯套或整套缺失。
- characterReadability: g030 主體完整，黑紅主戰甲、紅線封鎖刃與X形背框在縮小參考檢視仍有主要形體；此為概念靜態檢視，不宣稱正式戰鬥或手機實測。
- provenanceLicense: g030 沿用專案既存生成／使用者提供來源聲明，僅開發概念用途；未導入第三方素材，無新增授權衝突證據，不宣稱已取得商用發布授權。

非阻擋建議：g030：甲背空掛座缺獨立圖面證據已由使用者接受；原圖不補證。素材完成與GM實測須另驗。

來源限制：前20套沿用專案歷史來源；G021～G025來源為附件提供者的ChatGPT生成聲明，無獨立原PNG生成追蹤；G026～G030有十次生成記錄。這是開發用途來源審核，不是對著作權的第三方證明；正式發布獨立保持false。

已接受例外：
```json
{
  "exceptionId": "accepted-g030-back-mount",
  "advisoryCode": "backMountDetail",
  "formalIdentity": {
    "id": "g030",
    "epoch": "galaxy",
    "sourceKey": "galaxy:nearstar:map:9",
    "directory": "development/3d-source/equipment/concepts/galaxy/g030-nearstar-blockade",
    "regionOrBoss": "近星戰爭 → 近星封鎖航域",
    "equipmentNames": {
      "weapon": "星航封鎖刃",
      "helmet": "星航主控盔",
      "armor": "近星主戰甲",
      "shoes": "封鎖曲率靴",
      "accessory": "星航封鎖中樞"
    }
  },
  "imageSha256": {
    "overview-front-side-back.webp": "3f714bcd2ef4ba467f01285ab38f564b46dc6c76b6b60ffe8e26d1cd3bbf57b8",
    "equipment-five-slots.webp": "0db944610b79e610aea57470d8f8f08341ffc1a6482648c16a09a29a7bdbf128"
  },
  "acceptedBy": "user",
  "source": "user-explicit-instruction-2026-10-15",
  "scope": "concept-review-only",
  "acceptedAt": "2026-10-15"
}
```

結論：未見新版真正blocker；概念pass-with-advisory，可製作2.5D素材；素材not-started、GM not-tested、正式發布false。G007原3D模型狀態獨立保留，不能當作新2.5D素材完成。
