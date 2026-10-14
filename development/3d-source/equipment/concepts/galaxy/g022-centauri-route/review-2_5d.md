# g022 2.5D 概念審查遷移

政策：equipment-2.5d-v3.0；複查日期：2026-10-15；起點main：a232efb3e44e035bea20075762bf6789332d0b14。

正式身份：
```json
{
  "id": "g022",
  "epoch": "galaxy",
  "sourceKey": "galaxy:nearstar:map:1",
  "directory": "development/3d-source/equipment/concepts/galaxy/g022-centauri-route",
  "regionOrBoss": "近星戰爭 → 半人馬座航道",
  "equipmentNames": {
    "weapon": "星路切割刃",
    "helmet": "航道導航盔",
    "armor": "星航防護甲",
    "shoes": "曲率機動靴",
    "accessory": "半人馬導航核"
  }
}
```

- overview-front-side-back.webp: `54ae9c16b0b1f6bb75a879cec5cbc185290b1b28837d7687dd71720e81011b50`
- equipment-five-slots.webp: `7a97da23aa876292399aff350829ba0a69233d1016b0898bde089e89fc881a1c`

ChatGPT初審為歷史助手／代理審查的政策遷移，原始來源 `docs/evidence/batch28-autonomous-review/generation-stage1-review.md`（SHA `fa4100c1062c36c51f813efb8b38a6f437a989230526f3110d543681794602e7`）；沒有聲稱本輪重新呼叫另一名審查者。G006/G007以當前版本代理批准為準，其他舊細節fail依新政策分類為建議。Codex本輪以12張只讀比對圖檢視60原圖及小尺寸參考，獨立核對owner和歷史逐圖記錄。

- officialIdentity: g022 已從正式owner重抽核對epoch/sourceKey/目錄及五槽中文名；galaxy:nearstar:map:1，名稱以notes而非AI小字判定。
- imageIntegrity: g022 兩張WebP完整解碼、bytes/尺寸/SHA符合起始main索引，內容分別為總覽與五槽參考且SHA不同。
- contentIdentity: g022 可見白金長裙、尖冠盔與星芒導航核；兩圖主要材質、武器和背件對應，未見錯套或整套缺失。
- characterReadability: g022 主體完整，白金長裙、尖冠盔與星芒導航核在縮小參考檢視仍有主要形體；此為概念靜態檢視，不宣稱正式戰鬥或手機實測。
- provenanceLicense: g022 沿用專案既存生成／使用者提供來源聲明，僅開發概念用途；未導入第三方素材，無新增授權衝突證據，不宣稱已取得商用發布授權。

非阻擋建議：g022：細長頭冠和衣片後續需像素取捨，不要求獨立GLB。素材完成與GM實測須另驗。

來源限制：前20套沿用專案歷史來源；G021～G025來源為附件提供者的ChatGPT生成聲明，無獨立原PNG生成追蹤；G026～G030有十次生成記錄。這是開發用途來源審核，不是對著作權的第三方證明；正式發布獨立保持false。

結論：未見新版真正blocker；概念pass-with-advisory，可製作2.5D素材；素材not-started、GM not-tested、正式發布false。G007原3D模型狀態獨立保留，不能當作新2.5D素材完成。
