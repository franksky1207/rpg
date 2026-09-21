(function(){
 const VERSION=1;
 const BOSS_COUNT=100;
 const REGION_COUNT=10;
 const EQUIPMENT_SLOTS=Object.freeze(["weapon","helmet","armor","shoes","accessory"]);
 const REGIONS=Object.freeze([
  {
    "index": 0,
    "id": "galaxy-beyond",
    "name": "銀河彼端",
    "minLevel": 505,
    "maxLevel": 550,
    "firstBossIndex": 0,
    "lastBossIndex": 9
  },
  {
    "index": 1,
    "id": "local-group-war",
    "name": "本星系群戰爭",
    "minLevel": 555,
    "maxLevel": 600,
    "firstBossIndex": 10,
    "lastBossIndex": 19
  },
  {
    "index": 2,
    "id": "star-cluster-frontier",
    "name": "星群邊疆",
    "minLevel": 605,
    "maxLevel": 650,
    "firstBossIndex": 20,
    "lastBossIndex": 29
  },
  {
    "index": 3,
    "id": "stellar-battlefront",
    "name": "群星會戰",
    "minLevel": 655,
    "maxLevel": 700,
    "firstBossIndex": 30,
    "lastBossIndex": 39
  },
  {
    "index": 4,
    "id": "trans-domain-frontier",
    "name": "超域邊境",
    "minLevel": 705,
    "maxLevel": 750,
    "firstBossIndex": 40,
    "lastBossIndex": 49
  },
  {
    "index": 5,
    "id": "myriad-domain-frontline",
    "name": "萬域戰線",
    "minLevel": 755,
    "maxLevel": 800,
    "firstBossIndex": 50,
    "lastBossIndex": 59
  },
  {
    "index": 6,
    "id": "cosmic-filament",
    "name": "宇宙纖維帶",
    "minLevel": 805,
    "maxLevel": 850,
    "firstBossIndex": 60,
    "lastBossIndex": 69
  },
  {
    "index": 7,
    "id": "stellar-great-wall",
    "name": "星海巨牆",
    "minLevel": 855,
    "maxLevel": 900,
    "firstBossIndex": 70,
    "lastBossIndex": 79
  },
  {
    "index": 8,
    "id": "cosmic-deep-domain",
    "name": "宇宙深域",
    "minLevel": 905,
    "maxLevel": 950,
    "firstBossIndex": 80,
    "lastBossIndex": 89
  },
  {
    "index": 9,
    "id": "cosmic-unification-war",
    "name": "宇宙統合戰爭",
    "minLevel": 955,
    "maxLevel": 1000,
    "firstBossIndex": 90,
    "lastBossIndex": 99
  }
].map(row=>Object.freeze({...row})));
 const BOSSES=Object.freeze([
  {
    "index": 0,
    "id": "universe-boss-001",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 505,
    "name": "彼岸守門者",
    "equipment": {
      "weapon": "彼岸界門劍",
      "helmet": "遠界守門面甲",
      "armor": "彼岸封域鎧",
      "shoes": "界外星履",
      "accessory": "彼岸鑰印"
    }
  },
  {
    "index": 1,
    "id": "universe-boss-002",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 510,
    "name": "裂星王座",
    "equipment": {
      "weapon": "裂星王權戟",
      "helmet": "裂星王冕",
      "armor": "王座統御戰衣",
      "shoes": "王域步甲",
      "accessory": "裂星權柄"
    }
  },
  {
    "index": 2,
    "id": "universe-boss-003",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 515,
    "name": "黑潮母艦",
    "equipment": {
      "weapon": "黑潮艦斬槍",
      "helmet": "母艦戰鬥環",
      "armor": "黑潮艦體裝甲",
      "shoes": "深潮航履",
      "accessory": "黑潮主控矩陣"
    }
  },
  {
    "index": 3,
    "id": "universe-boss-004",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 520,
    "name": "逐日征服者",
    "equipment": {
      "weapon": "逐日征服劍",
      "helmet": "日冕征服面罩",
      "armor": "逐日遠征外骨骼",
      "shoes": "追日光履",
      "accessory": "征服者徽記"
    }
  },
  {
    "index": 4,
    "id": "universe-boss-005",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 525,
    "name": "天穹殲滅體",
    "equipment": {
      "weapon": "天穹殲星炮刃",
      "helmet": "殲滅感知環",
      "armor": "天穹滅域護殼",
      "shoes": "穹頂脛鎧",
      "accessory": "殲滅晶體"
    }
  },
  {
    "index": 5,
    "id": "universe-boss-006",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 530,
    "name": "銀河殘光主腦",
    "equipment": {
      "weapon": "殘光智械鐮",
      "helmet": "主腦思維環",
      "armor": "殘光神經戰衣",
      "shoes": "銀河折躍足具",
      "accessory": "殘光智核"
    }
  },
  {
    "index": 6,
    "id": "universe-boss-007",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 535,
    "name": "星海霸皇",
    "equipment": {
      "weapon": "星海霸皇戟",
      "helmet": "霸皇星冕",
      "armor": "星海皇權鎧",
      "shoes": "皇域踏星履",
      "accessory": "星海霸印"
    }
  },
  {
    "index": 7,
    "id": "universe-boss-008",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 540,
    "name": "遠境戰爭中樞",
    "equipment": {
      "weapon": "遠境戰爭矛",
      "helmet": "中樞指揮面甲",
      "armor": "遠境軍勢裝甲",
      "shoes": "戰線推進足鎧",
      "accessory": "遠境戰略節點"
    }
  },
  {
    "index": 8,
    "id": "universe-boss-009",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 545,
    "name": "群星墓主",
    "equipment": {
      "weapon": "葬星墓主鐮",
      "helmet": "群星冥面",
      "armor": "墓域星骸護甲",
      "shoes": "幽航步裝",
      "accessory": "墓主星碑"
    }
  },
  {
    "index": 9,
    "id": "universe-boss-010",
    "regionIndex": 0,
    "regionId": "galaxy-beyond",
    "regionName": "銀河彼端",
    "level": 550,
    "name": "彼岸統合體",
    "equipment": {
      "weapon": "彼岸統合聖劍",
      "helmet": "統合天環",
      "armor": "彼岸統合戰鎧",
      "shoes": "統合越界履",
      "accessory": "彼岸統御樞"
    }
  },
  {
    "index": 10,
    "id": "universe-boss-011",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 555,
    "name": "蒼環執政官",
    "equipment": {
      "weapon": "蒼環政令劍",
      "helmet": "執政官環冕",
      "armor": "蒼環統治戰袍",
      "shoes": "政域巡行履",
      "accessory": "蒼環政令章"
    }
  },
  {
    "index": 11,
    "id": "universe-boss-012",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 560,
    "name": "赤星天堡",
    "equipment": {
      "weapon": "赤星攻城鎚",
      "helmet": "天堡防衛面甲",
      "armor": "赤星城塞鎧",
      "shoes": "堡壘重踏甲",
      "accessory": "赤星堡壘核心"
    }
  },
  {
    "index": 12,
    "id": "universe-boss-013",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 565,
    "name": "暗河獵界者",
    "equipment": {
      "weapon": "暗河獵界槍",
      "helmet": "獵界追蹤目鏡",
      "armor": "暗河獵行外骨骼",
      "shoes": "獵界疾行足具",
      "accessory": "暗河獵星盤"
    }
  },
  {
    "index": 13,
    "id": "universe-boss-014",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 570,
    "name": "碎月戰皇",
    "equipment": {
      "weapon": "碎月皇戰斧",
      "helmet": "戰皇月冕",
      "armor": "碎月皇鎧",
      "shoes": "月影戰履",
      "accessory": "碎月皇徽"
    }
  },
  {
    "index": 14,
    "id": "universe-boss-015",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 575,
    "name": "星門鎮壓核心",
    "equipment": {
      "weapon": "星門鎮界矛",
      "helmet": "星門封鎖頭環",
      "armor": "星門禁制裝甲",
      "shoes": "星門穿界步甲",
      "accessory": "鎮壓控制器"
    }
  },
  {
    "index": 15,
    "id": "universe-boss-016",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 580,
    "name": "銀冠母巢",
    "equipment": {
      "weapon": "銀冠巢牙刃",
      "helmet": "母巢感應冠",
      "armor": "銀冠生體護殼",
      "shoes": "巢群蔓生足鎧",
      "accessory": "銀冠孵化腺核"
    }
  },
  {
    "index": 16,
    "id": "universe-boss-017",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 585,
    "name": "永夜遠征艦",
    "equipment": {
      "weapon": "永夜艦戰槍",
      "helmet": "遠征艦橋面甲",
      "armor": "永夜艦兵裝甲",
      "shoes": "遠征深航脛甲",
      "accessory": "永夜航路星圖"
    }
  },
  {
    "index": 17,
    "id": "universe-boss-018",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 590,
    "name": "群星審判者",
    "equipment": {
      "weapon": "群星審判劍",
      "helmet": "審判官星冕",
      "armor": "群星裁定戰衣",
      "shoes": "審判追星履",
      "accessory": "裁決天秤"
    }
  },
  {
    "index": 18,
    "id": "universe-boss-019",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 595,
    "name": "黑域戰爭主機",
    "equipment": {
      "weapon": "黑域戰爭鐮",
      "helmet": "主機同步環",
      "armor": "黑域機戰外殼",
      "shoes": "戰域機動足具",
      "accessory": "黑域戰術模組"
    }
  },
  {
    "index": 19,
    "id": "universe-boss-020",
    "regionIndex": 1,
    "regionId": "local-group-war",
    "regionName": "本星系群戰爭",
    "level": 600,
    "name": "星群滅絕皇座",
    "equipment": {
      "weapon": "星群滅絕戟",
      "helmet": "滅星皇冠",
      "armor": "星群終滅帝鎧",
      "shoes": "皇座巡星步裝",
      "accessory": "滅絕王權印"
    }
  },
  {
    "index": 20,
    "id": "universe-boss-021",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 605,
    "name": "邊疆吞星獸",
    "equipment": {
      "weapon": "吞星獠牙刃",
      "helmet": "吞星獸首甲",
      "armor": "邊疆獸皇護殼",
      "shoes": "荒星獸足鎧",
      "accessory": "吞星心核"
    }
  },
  {
    "index": 21,
    "id": "universe-boss-022",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 610,
    "name": "赤界戰爭元帥",
    "equipment": {
      "weapon": "赤界元帥軍刀",
      "helmet": "元帥指揮冠",
      "armor": "赤界軍勢戰衣",
      "shoes": "遠征將履",
      "accessory": "赤界帥令"
    }
  },
  {
    "index": 22,
    "id": "universe-boss-023",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 615,
    "name": "星骸航行者",
    "equipment": {
      "weapon": "星骸漂流劍",
      "helmet": "航行者星面",
      "armor": "星骸遠航戰甲",
      "shoes": "骸域漂泊履",
      "accessory": "星骸航標"
    }
  },
  {
    "index": 23,
    "id": "universe-boss-024",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 620,
    "name": "天河破城艦",
    "equipment": {
      "weapon": "天河破城炮槍",
      "helmet": "破城艦橋環",
      "armor": "天河艦體重鎧",
      "shoes": "攻城推進足鎧",
      "accessory": "天河火控儀"
    }
  },
  {
    "index": 24,
    "id": "universe-boss-025",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 625,
    "name": "黑冠殖民母體",
    "equipment": {
      "weapon": "黑冠殖域鐮",
      "helmet": "殖民母冠",
      "armor": "黑冠生殖護甲",
      "shoes": "殖域蔓延足具",
      "accessory": "黑冠殖民囊"
    }
  },
  {
    "index": 25,
    "id": "universe-boss-026",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 630,
    "name": "裂域霸主",
    "equipment": {
      "weapon": "裂域霸權戰斧",
      "helmet": "霸主裂界冠",
      "armor": "裂域王鎧",
      "shoes": "霸域跨星履",
      "accessory": "裂域霸印"
    }
  },
  {
    "index": 26,
    "id": "universe-boss-027",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 635,
    "name": "蒼星焚滅器",
    "equipment": {
      "weapon": "蒼星焚滅槍",
      "helmet": "焚滅觀測面甲",
      "armor": "蒼星灼能裝甲",
      "shoes": "焚星突進步甲",
      "accessory": "蒼星熔能爐"
    }
  },
  {
    "index": 27,
    "id": "universe-boss-028",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 640,
    "name": "遠星文明主腦",
    "equipment": {
      "weapon": "遠星文明劍",
      "helmet": "文明思維冠",
      "armor": "遠星智械戰衣",
      "shoes": "文明星行履",
      "accessory": "遠星智識矩陣"
    }
  },
  {
    "index": 28,
    "id": "universe-boss-029",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 645,
    "name": "萬艦統帥",
    "equipment": {
      "weapon": "萬艦統帥戟",
      "helmet": "艦群指揮環",
      "armor": "萬艦統御鎧",
      "shoes": "旗艦航戰足具",
      "accessory": "萬艦司令牌"
    }
  },
  {
    "index": 29,
    "id": "universe-boss-030",
    "regionIndex": 2,
    "regionId": "star-cluster-frontier",
    "regionName": "星群邊疆",
    "level": 650,
    "name": "星群終戰核心",
    "equipment": {
      "weapon": "星群終戰巨刃",
      "helmet": "終戰星冕",
      "armor": "星群決戰裝甲",
      "shoes": "終戰跨域履",
      "accessory": "星群終戰樞紐"
    }
  },
  {
    "index": 30,
    "id": "universe-boss-031",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 655,
    "name": "千星戰王",
    "equipment": {
      "weapon": "千星戰王長戟",
      "helmet": "戰王星冕",
      "armor": "千星王戰鎧",
      "shoes": "星戰踏域履",
      "accessory": "千星王令"
    }
  },
  {
    "index": 31,
    "id": "universe-boss-032",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 660,
    "name": "蒼穹母皇",
    "equipment": {
      "weapon": "蒼穹母皇鐮",
      "helmet": "母皇天冠",
      "armor": "蒼穹生體戰衣",
      "shoes": "母皇星步",
      "accessory": "蒼穹皇卵核"
    }
  },
  {
    "index": 32,
    "id": "universe-boss-033",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 665,
    "name": "黑日殲星艦",
    "equipment": {
      "weapon": "黑日殲星炮劍",
      "helmet": "殲星戰術面甲",
      "armor": "黑日艦兵裝甲",
      "shoes": "黑日航戰脛甲",
      "accessory": "殲星火控矩陣"
    }
  },
  {
    "index": 33,
    "id": "universe-boss-034",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 670,
    "name": "戰域裁決者",
    "equipment": {
      "weapon": "戰域裁決劍",
      "helmet": "裁決官面罩",
      "armor": "戰域審判鎧",
      "shoes": "裁決追跡履",
      "accessory": "戰域裁印"
    }
  },
  {
    "index": 34,
    "id": "universe-boss-035",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 675,
    "name": "星辰吞噬體",
    "equipment": {
      "weapon": "星辰吞噬矛",
      "helmet": "吞噬感應環",
      "armor": "星辰噬能護殼",
      "shoes": "吞星步裝",
      "accessory": "星辰噬能晶體"
    }
  },
  {
    "index": 35,
    "id": "universe-boss-036",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 680,
    "name": "群星鐵壁",
    "equipment": {
      "weapon": "群星破壁鎚",
      "helmet": "鐵壁壁冠",
      "armor": "群星堡壘重鎧",
      "shoes": "壁壘鎮星足甲",
      "accessory": "群星防禦矩陣"
    }
  },
  {
    "index": 36,
    "id": "universe-boss-037",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 685,
    "name": "赤環戰爭智核",
    "equipment": {
      "weapon": "赤環智戰鐮",
      "helmet": "智核同步冠",
      "armor": "赤環戰略外骨骼",
      "shoes": "智域調度履",
      "accessory": "赤環戰術智晶"
    }
  },
  {
    "index": 37,
    "id": "universe-boss-038",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 690,
    "name": "萬軍征伐皇",
    "equipment": {
      "weapon": "萬軍征伐戰斧",
      "helmet": "征伐皇冕",
      "armor": "萬軍皇戰甲",
      "shoes": "征伐遠行步甲",
      "accessory": "萬軍皇旗"
    }
  },
  {
    "index": 38,
    "id": "universe-boss-039",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 695,
    "name": "天域滅星機構",
    "equipment": {
      "weapon": "天域滅星炮槍",
      "helmet": "機構控制面甲",
      "armor": "天域殲滅機甲",
      "shoes": "滅星推進足具",
      "accessory": "天域殲星節點"
    }
  },
  {
    "index": 39,
    "id": "universe-boss-040",
    "regionIndex": 3,
    "regionId": "stellar-battlefront",
    "regionName": "群星會戰",
    "level": 700,
    "name": "群星霸權王庭",
    "equipment": {
      "weapon": "群星霸權劍",
      "helmet": "王庭御冠",
      "armor": "群星王權戰袍",
      "shoes": "王庭巡域星履",
      "accessory": "霸權王璽"
    }
  },
  {
    "index": 40,
    "id": "universe-boss-041",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 705,
    "name": "超域鎮界者",
    "equipment": {
      "weapon": "超域鎮界槍",
      "helmet": "鎮界環冠",
      "armor": "超域封疆鎧",
      "shoes": "鎮界跨域步裝",
      "accessory": "超域界碑"
    }
  },
  {
    "index": 41,
    "id": "universe-boss-042",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 710,
    "name": "黑曜星堡",
    "equipment": {
      "weapon": "黑曜破堡重刃",
      "helmet": "星堡曜面",
      "armor": "黑曜堡壘裝甲",
      "shoes": "星堡磁行足具",
      "accessory": "黑曜堡權章"
    }
  },
  {
    "index": 42,
    "id": "universe-boss-043",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 715,
    "name": "裂空帝艦",
    "equipment": {
      "weapon": "裂空帝艦矛",
      "helmet": "帝艦艦橋冠",
      "armor": "裂空艦皇甲",
      "shoes": "帝艦破空履",
      "accessory": "裂空航戰星圖"
    }
  },
  {
    "index": 43,
    "id": "universe-boss-044",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 720,
    "name": "蒼白吞界獸",
    "equipment": {
      "weapon": "蒼白吞界牙",
      "helmet": "吞界獸面甲",
      "armor": "蒼白獸皇護殼",
      "shoes": "吞界踏星足鎧",
      "accessory": "蒼白獸心"
    }
  },
  {
    "index": 44,
    "id": "universe-boss-045",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 725,
    "name": "星海萬機母體",
    "equipment": {
      "weapon": "萬機解構鐮",
      "helmet": "母體機械環",
      "armor": "星海機群外骨骼",
      "shoes": "萬機躍行步甲",
      "accessory": "萬機演算矩陣"
    }
  },
  {
    "index": 45,
    "id": "universe-boss-046",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 730,
    "name": "天幕戰爭君王",
    "equipment": {
      "weapon": "天幕君王戟",
      "helmet": "戰爭王冕",
      "armor": "天幕王戰鎧",
      "shoes": "君王御域履",
      "accessory": "天幕王令"
    }
  },
  {
    "index": 46,
    "id": "universe-boss-047",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 735,
    "name": "赤界文明熔爐",
    "equipment": {
      "weapon": "赤界熔爐炮刃",
      "helmet": "文明爐心冠",
      "armor": "赤界熔戰裝甲",
      "shoes": "熔爐熱流足具",
      "accessory": "文明熔鑄核"
    }
  },
  {
    "index": 47,
    "id": "universe-boss-048",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 740,
    "name": "永夜星域之主",
    "equipment": {
      "weapon": "永夜域主劍",
      "helmet": "星域主冕",
      "armor": "永夜主宰戰衣",
      "shoes": "域主深航履",
      "accessory": "永夜星圖"
    }
  },
  {
    "index": 48,
    "id": "universe-boss-049",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 745,
    "name": "萬星殲滅樞紐",
    "equipment": {
      "weapon": "萬星殲滅槍",
      "helmet": "樞紐感知面甲",
      "armor": "萬星滅域鎧",
      "shoes": "殲滅突進脛甲",
      "accessory": "萬星連結節點"
    }
  },
  {
    "index": 49,
    "id": "universe-boss-050",
    "regionIndex": 4,
    "regionId": "trans-domain-frontier",
    "regionName": "超域邊境",
    "level": 750,
    "name": "超域霸權主艦",
    "equipment": {
      "weapon": "超域霸權巨刃",
      "helmet": "主艦統御環",
      "armor": "超域艦王裝甲",
      "shoes": "霸權遠征足鎧",
      "accessory": "超域艦隊權印"
    }
  },
  {
    "index": 50,
    "id": "universe-boss-051",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 755,
    "name": "萬域開戰者",
    "equipment": {
      "weapon": "萬域開戰矛",
      "helmet": "開戰者軍冠",
      "armor": "萬域軍勢鎧",
      "shoes": "戰線先鋒履",
      "accessory": "萬域開戰令"
    }
  },
  {
    "index": 51,
    "id": "universe-boss-052",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 760,
    "name": "星海黑塔",
    "equipment": {
      "weapon": "黑塔裂星鎚",
      "helmet": "星海塔面甲",
      "armor": "黑塔鎮域裝甲",
      "shoes": "黑塔浮航足具",
      "accessory": "黑塔座標儀"
    }
  },
  {
    "index": 52,
    "id": "universe-boss-053",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 765,
    "name": "焚界遠征母艦",
    "equipment": {
      "weapon": "焚界遠征槍",
      "helmet": "遠征母艦環冠",
      "armor": "焚界艦戰鎧",
      "shoes": "遠征焚星脛甲",
      "accessory": "焚界航路矩陣"
    }
  },
  {
    "index": 53,
    "id": "universe-boss-054",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 770,
    "name": "蒼穹軍勢統領",
    "equipment": {
      "weapon": "蒼穹統領戟",
      "helmet": "軍勢指揮環",
      "armor": "蒼穹軍戰甲",
      "shoes": "統領跨星步甲",
      "accessory": "軍勢統帥章"
    }
  },
  {
    "index": 54,
    "id": "universe-boss-055",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 775,
    "name": "群星掠奪皇",
    "equipment": {
      "weapon": "群星掠奪戰斧",
      "helmet": "掠奪皇冕",
      "armor": "群星劫戰鎧",
      "shoes": "掠奪追星履",
      "accessory": "群星戰利徽"
    }
  },
  {
    "index": 55,
    "id": "universe-boss-056",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 780,
    "name": "黑潮文明巢心",
    "equipment": {
      "weapon": "黑潮巢心鐮",
      "helmet": "文明巢面",
      "armor": "黑潮孵化護殼",
      "shoes": "巢群蔓延足甲",
      "accessory": "黑潮巢心珠"
    }
  },
  {
    "index": 56,
    "id": "universe-boss-057",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 785,
    "name": "裂宇戰爭巨構",
    "equipment": {
      "weapon": "裂宇巨構劍",
      "helmet": "巨構控制冠",
      "armor": "裂宇構裝重甲",
      "shoes": "巨構跨域足具",
      "accessory": "裂宇構造節點"
    }
  },
  {
    "index": 57,
    "id": "universe-boss-058",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 790,
    "name": "星域滅絕執行官",
    "equipment": {
      "weapon": "星域執行槍",
      "helmet": "滅絕官面甲",
      "armor": "星域執行戰衣",
      "shoes": "滅絕追跡履",
      "accessory": "星域執行令"
    }
  },
  {
    "index": 58,
    "id": "universe-boss-059",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 795,
    "name": "萬域征戰樞機",
    "equipment": {
      "weapon": "萬域征戰刃",
      "helmet": "樞機指揮環",
      "armor": "萬域征伐鎧",
      "shoes": "樞機調度步裝",
      "accessory": "萬域征戰星圖"
    }
  },
  {
    "index": 59,
    "id": "universe-boss-060",
    "regionIndex": 5,
    "regionId": "myriad-domain-frontline",
    "regionName": "萬域戰線",
    "level": 800,
    "name": "無盡戰線總督",
    "equipment": {
      "weapon": "無盡戰線長戟",
      "helmet": "總督統治冕",
      "armor": "無盡軍政戰袍",
      "shoes": "戰線督軍足鎧",
      "accessory": "無盡總督璽"
    }
  },
  {
    "index": 60,
    "id": "universe-boss-061",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 805,
    "name": "纖維帶守望者",
    "equipment": {
      "weapon": "星脈守望劍",
      "helmet": "纖維觀測環",
      "armor": "星脈守域戰衣",
      "shoes": "脈絡巡航履",
      "accessory": "守望星脈圖"
    }
  },
  {
    "index": 61,
    "id": "universe-boss-062",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 810,
    "name": "黑鏈天體",
    "equipment": {
      "weapon": "黑鏈天體槍",
      "helmet": "鏈域引力冠",
      "armor": "黑鏈重構護甲",
      "shoes": "鏈星牽引足具",
      "accessory": "黑鏈軌道盤"
    }
  },
  {
    "index": 62,
    "id": "universe-boss-063",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 815,
    "name": "星脈繁殖母巢",
    "equipment": {
      "weapon": "星脈孵化鐮",
      "helmet": "繁殖巢面甲",
      "armor": "星脈母巢護殼",
      "shoes": "巢脈蔓生足甲",
      "accessory": "星脈孵化囊"
    }
  },
  {
    "index": 63,
    "id": "universe-boss-064",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 820,
    "name": "裂河戰爭巨艦",
    "equipment": {
      "weapon": "裂河巨艦炮刃",
      "helmet": "戰艦導航環",
      "armor": "裂河艦體裝甲",
      "shoes": "巨艦穿流脛鎧",
      "accessory": "裂河航道儀"
    }
  },
  {
    "index": 64,
    "id": "universe-boss-065",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 825,
    "name": "赤脈文明節點",
    "equipment": {
      "weapon": "赤脈節點矛",
      "helmet": "文明脈冠",
      "armor": "赤脈節裝甲",
      "shoes": "脈網轉移履",
      "accessory": "赤脈節點晶"
    }
  },
  {
    "index": 65,
    "id": "universe-boss-066",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 830,
    "name": "星橋毀滅者",
    "equipment": {
      "weapon": "星橋毀滅戟",
      "helmet": "星橋觀測面",
      "armor": "星橋斷域鎧",
      "shoes": "星橋跨越步甲",
      "accessory": "毀滅橋樞"
    }
  },
  {
    "index": 66,
    "id": "universe-boss-067",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 835,
    "name": "蒼穹巨構帝君",
    "equipment": {
      "weapon": "蒼穹帝君劍",
      "helmet": "巨構帝冕",
      "armor": "蒼穹帝構甲",
      "shoes": "帝君巡宇履",
      "accessory": "巨構帝令"
    }
  },
  {
    "index": 67,
    "id": "universe-boss-068",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 840,
    "name": "萬星侵略主機",
    "equipment": {
      "weapon": "萬星侵略槍",
      "helmet": "主機同步環",
      "armor": "萬星侵戰外骨骼",
      "shoes": "侵略躍遷足具",
      "accessory": "萬星侵略模組"
    }
  },
  {
    "index": 68,
    "id": "universe-boss-069",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 845,
    "name": "暗流吞噬皇體",
    "equipment": {
      "weapon": "暗流吞噬鐮",
      "helmet": "皇體暗冠",
      "armor": "暗流噬星護殼",
      "shoes": "吞噬流轉足鎧",
      "accessory": "暗流皇晶"
    }
  },
  {
    "index": 69,
    "id": "universe-boss-070",
    "regionIndex": 6,
    "regionId": "cosmic-filament",
    "regionName": "宇宙纖維帶",
    "level": 850,
    "name": "宇宙脈絡霸主",
    "equipment": {
      "weapon": "脈絡霸主戟",
      "helmet": "宇宙脈冕",
      "armor": "脈絡霸權鎧",
      "shoes": "宇脈跨域星履",
      "accessory": "脈絡統御環"
    }
  },
  {
    "index": 70,
    "id": "universe-boss-071",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 855,
    "name": "巨牆鎮守者",
    "equipment": {
      "weapon": "巨牆鎮守矛",
      "helmet": "鎮守壁面甲",
      "armor": "巨牆壁壘鎧",
      "shoes": "壁線巡防足具",
      "accessory": "巨牆守備令"
    }
  },
  {
    "index": 71,
    "id": "universe-boss-072",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 860,
    "name": "萬星壁壘",
    "equipment": {
      "weapon": "萬星破壘鎚",
      "helmet": "壁壘星冠",
      "armor": "萬星城防裝甲",
      "shoes": "壁壘重行足甲",
      "accessory": "萬星防衛矩陣"
    }
  },
  {
    "index": 72,
    "id": "universe-boss-073",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 865,
    "name": "黑曜天幕戰艦",
    "equipment": {
      "weapon": "黑曜天幕炮槍",
      "helmet": "戰艦曜環",
      "armor": "黑曜艦戰鎧",
      "shoes": "天幕巡航脛甲",
      "accessory": "黑曜艦橋儀"
    }
  },
  {
    "index": 73,
    "id": "universe-boss-074",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 870,
    "name": "星海裂界皇",
    "equipment": {
      "weapon": "星海裂界劍",
      "helmet": "裂界皇冕",
      "armor": "星海皇戰甲",
      "shoes": "裂界越域履",
      "accessory": "星海皇璽"
    }
  },
  {
    "index": 74,
    "id": "universe-boss-075",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 875,
    "name": "蒼白文明堡壘",
    "equipment": {
      "weapon": "蒼白破堡戰斧",
      "helmet": "文明堡冠",
      "armor": "蒼白堡壘重鎧",
      "shoes": "堡域鎮守步甲",
      "accessory": "蒼白堡壘章"
    }
  },
  {
    "index": 75,
    "id": "universe-boss-076",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 880,
    "name": "赤環滅域裝置",
    "equipment": {
      "weapon": "赤環滅域鐮",
      "helmet": "裝置控制面甲",
      "armor": "赤環滅域外殼",
      "shoes": "滅域機動足具",
      "accessory": "赤環滅域模組"
    }
  },
  {
    "index": 76,
    "id": "universe-boss-077",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 885,
    "name": "群星封鎖司令",
    "equipment": {
      "weapon": "群星封鎖槍",
      "helmet": "封鎖司令環",
      "armor": "群星禁域戰衣",
      "shoes": "封鎖巡弋履",
      "accessory": "群星封鎖令"
    }
  },
  {
    "index": 77,
    "id": "universe-boss-078",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 890,
    "name": "無盡城塞",
    "equipment": {
      "weapon": "無盡破城巨刃",
      "helmet": "城塞統御冠",
      "armor": "無盡要塞裝甲",
      "shoes": "城塞重踏足鎧",
      "accessory": "無盡城塞權印"
    }
  },
  {
    "index": 78,
    "id": "universe-boss-079",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 895,
    "name": "宇宙壁壘破界者",
    "equipment": {
      "weapon": "宇宙破界戟",
      "helmet": "壁壘破界面",
      "armor": "宇宙破壁鎧",
      "shoes": "破界突進步裝",
      "accessory": "宇宙破壁節點"
    }
  },
  {
    "index": 79,
    "id": "universe-boss-080",
    "regionIndex": 7,
    "regionId": "stellar-great-wall",
    "regionName": "星海巨牆",
    "level": 900,
    "name": "星海巨牆之心",
    "equipment": {
      "weapon": "巨牆心刃",
      "helmet": "星海心環",
      "armor": "巨牆心核戰甲",
      "shoes": "星海壁行履",
      "accessory": "巨牆之心"
    }
  },
  {
    "index": 80,
    "id": "universe-boss-081",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 905,
    "name": "深域航行王",
    "equipment": {
      "weapon": "深域航王劍",
      "helmet": "航行王冕",
      "armor": "深域航戰衣",
      "shoes": "航王遠渡履",
      "accessory": "深域星圖"
    }
  },
  {
    "index": 81,
    "id": "universe-boss-082",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 910,
    "name": "黑星遠征母體",
    "equipment": {
      "weapon": "黑星遠征鐮",
      "helmet": "母體遠征環",
      "armor": "黑星母戰護殼",
      "shoes": "遠征深空足甲",
      "accessory": "黑星母體晶"
    }
  },
  {
    "index": 82,
    "id": "universe-boss-083",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 915,
    "name": "宇宙深井巨獸",
    "equipment": {
      "weapon": "深井巨獸牙",
      "helmet": "巨獸深淵面甲",
      "armor": "深井獸皇護甲",
      "shoes": "淵域踏星足鎧",
      "accessory": "深井獸心"
    }
  },
  {
    "index": 83,
    "id": "universe-boss-084",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 920,
    "name": "蒼穹遠征樞紐",
    "equipment": {
      "weapon": "蒼穹遠征槍",
      "helmet": "樞紐天冠",
      "armor": "蒼穹遠征裝甲",
      "shoes": "樞紐長航脛甲",
      "accessory": "遠征航路節點"
    }
  },
  {
    "index": 84,
    "id": "universe-boss-085",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 925,
    "name": "無光星海帝艦",
    "equipment": {
      "weapon": "無光帝艦戟",
      "helmet": "星海帝冕",
      "armor": "無光艦皇鎧",
      "shoes": "帝艦暗航履",
      "accessory": "無光艦隊星盤"
    }
  },
  {
    "index": 85,
    "id": "universe-boss-086",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 930,
    "name": "深空文明智核",
    "equipment": {
      "weapon": "深空文明劍",
      "helmet": "智核星環",
      "armor": "深空智戰外骨骼",
      "shoes": "文明探域足具",
      "accessory": "深空智識晶"
    }
  },
  {
    "index": 86,
    "id": "universe-boss-087",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 935,
    "name": "萬域吞星皇",
    "equipment": {
      "weapon": "萬域吞星戰斧",
      "helmet": "吞星皇冕",
      "armor": "萬域皇戰鎧",
      "shoes": "吞星凌空步甲",
      "accessory": "萬域皇令"
    }
  },
  {
    "index": 87,
    "id": "universe-boss-088",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 940,
    "name": "暗界戰爭天體",
    "equipment": {
      "weapon": "暗界天體槍",
      "helmet": "戰爭天環",
      "armor": "暗界天體裝甲",
      "shoes": "天體軌行足具",
      "accessory": "暗界軌道盤"
    }
  },
  {
    "index": 88,
    "id": "universe-boss-089",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 945,
    "name": "群星深淵統帥",
    "equipment": {
      "weapon": "深淵統帥戟",
      "helmet": "群星深淵冠",
      "armor": "深淵軍勢戰甲",
      "shoes": "統帥深航履",
      "accessory": "深淵帥旗"
    }
  },
  {
    "index": 89,
    "id": "universe-boss-090",
    "regionIndex": 8,
    "regionId": "cosmic-deep-domain",
    "regionName": "宇宙深域",
    "level": 950,
    "name": "宇宙深域皇座",
    "equipment": {
      "weapon": "深域皇座劍",
      "helmet": "宇宙皇冠",
      "armor": "深域王座鎧",
      "shoes": "皇座巡宇步裝",
      "accessory": "深域皇權印"
    }
  },
  {
    "index": 90,
    "id": "universe-boss-091",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 955,
    "name": "萬星統治者",
    "equipment": {
      "weapon": "萬星統治戟",
      "helmet": "統治星冕",
      "armor": "萬星統御戰袍",
      "shoes": "統治巡域履",
      "accessory": "萬星統治令"
    }
  },
  {
    "index": 91,
    "id": "universe-boss-092",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 960,
    "name": "宇宙征服母艦",
    "equipment": {
      "weapon": "宇宙征服炮槍",
      "helmet": "母艦帝環",
      "armor": "宇宙征戰裝甲",
      "shoes": "征服遠航脛鎧",
      "accessory": "宇宙艦權矩陣"
    }
  },
  {
    "index": 92,
    "id": "universe-boss-093",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 965,
    "name": "黑冠文明皇帝",
    "equipment": {
      "weapon": "黑冠帝皇劍",
      "helmet": "文明帝冕",
      "armor": "黑冠帝戰鎧",
      "shoes": "帝皇跨宇星履",
      "accessory": "文明帝璽"
    }
  },
  {
    "index": 93,
    "id": "universe-boss-094",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 970,
    "name": "群星終戰巨構",
    "equipment": {
      "weapon": "群星終戰巨刃",
      "helmet": "終戰巨構環",
      "armor": "群星巨構裝甲",
      "shoes": "終戰跨域足具",
      "accessory": "群星構造核心"
    }
  },
  {
    "index": 94,
    "id": "universe-boss-095",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 975,
    "name": "萬域殲滅主機",
    "equipment": {
      "weapon": "萬域殲滅鐮",
      "helmet": "主機帝冠",
      "armor": "萬域滅絕外骨骼",
      "shoes": "殲滅巡宇步甲",
      "accessory": "萬域殲滅模組"
    }
  },
  {
    "index": 95,
    "id": "universe-boss-096",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 980,
    "name": "宇宙霸權帝座",
    "equipment": {
      "weapon": "宇宙霸權戟",
      "helmet": "帝座王冕",
      "armor": "宇宙帝權鎧",
      "shoes": "帝座天行履",
      "accessory": "霸權帝印"
    }
  },
  {
    "index": 96,
    "id": "universe-boss-097",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 985,
    "name": "星海統合母體",
    "equipment": {
      "weapon": "星海統合槍",
      "helmet": "母體統合環",
      "armor": "星海母皇護殼",
      "shoes": "統合越界足鎧",
      "accessory": "星海統合晶"
    }
  },
  {
    "index": 97,
    "id": "universe-boss-098",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 990,
    "name": "億星戰爭中樞",
    "equipment": {
      "weapon": "億星戰爭劍",
      "helmet": "中樞帝冠",
      "armor": "億星終戰裝甲",
      "shoes": "戰爭跨宇足具",
      "accessory": "億星戰略樞"
    }
  },
  {
    "index": 98,
    "id": "universe-boss-099",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 995,
    "name": "宇宙征服者",
    "equipment": {
      "weapon": "宇宙征服戰斧",
      "helmet": "征服者帝冕",
      "armor": "宇宙霸戰鎧",
      "shoes": "征服破域步裝",
      "accessory": "宇宙征服權柄"
    }
  },
  {
    "index": 99,
    "id": "universe-boss-100",
    "regionIndex": 9,
    "regionId": "cosmic-unification-war",
    "regionName": "宇宙統合戰爭",
    "level": 1000,
    "name": "文明終焉核心",
    "equipment": {
      "weapon": "文明終焉聖劍",
      "helmet": "終焉統御天環",
      "armor": "文明終焉神鎧",
      "shoes": "終焉超越星履",
      "accessory": "文明終焉之心"
    }
  }
].map(row=>Object.freeze({...row,equipment:Object.freeze({...row.equipment})})));

 function currentState(){
  try{return typeof state!=="undefined"&&state&&typeof state==="object"?state:null;}
  catch(e){return null;}
 }
 function targetState(target){return target&&typeof target==="object"?target:currentState();}
 function bossIndex(value){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=0&&n<BOSS_COUNT?n:-1;
 }
 function regionIndex(value){
  if(typeof value==="string"){
   const byId=REGIONS.findIndex(row=>row.id===value);
   if(byId>=0)return byId;
  }
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=0&&n<REGION_COUNT?n:-1;
 }
 function secondWorldBoss(value){
  const index=bossIndex(value);
  return index>=0?BOSSES[index]:null;
 }
 function secondWorldRegion(value){
  const index=regionIndex(value);
  return index>=0?REGIONS[index]:null;
 }
 function secondWorldBossesForRegion(value){
  const region=secondWorldRegion(value);
  return region?BOSSES.slice(region.firstBossIndex,region.lastBossIndex+1):[];
 }
 function secondWorldBossKilled(value,target=null){
  const index=bossIndex(value),s=targetState(target);
  return index>=0&&s?.secondWorld?.mainline?.bossKilled?.[index]===true;
 }
 function secondWorldBossLevelRequirement(value){
  const boss=secondWorldBoss(value);
  return boss?Math.max(500,boss.level-5):null;
 }
 function canChallengeSecondWorldBoss(value,target=null){
  const index=bossIndex(value),s=targetState(target);
  if(index<0||!s)return false;
  if(s?.secondWorld?.entered!==true)return false;
  const boss=BOSSES[index];
  const playerLevel=Math.max(1,Math.floor(Number(s.level)||1));
  if(playerLevel<boss.level-5)return false;
  return index===0||s?.secondWorld?.mainline?.bossKilled?.[index-1]===true;
 }
 function secondWorldBossVisible(value,target=null){
  const index=bossIndex(value),s=targetState(target);
  if(index<0||!s||s?.secondWorld?.entered!==true)return false;
  return secondWorldBossKilled(index,s)||canChallengeSecondWorldBoss(index,s);
 }
 function secondWorldHighestClearedBossIndex(target=null){
  const s=targetState(target);
  if(!s)return -1;
  let highest=-1;
  for(let i=0;i<BOSS_COUNT;i++){
   if(s?.secondWorld?.mainline?.bossKilled?.[i]===true)highest=i;
   else break;
  }
  return highest;
 }
 function secondWorldHighestUnlockedBossIndex(target=null){
  const s=targetState(target);
  if(!s||s?.secondWorld?.entered!==true)return -1;
  let highest=-1;
  for(let i=0;i<BOSS_COUNT;i++){
   if(secondWorldBossKilled(i,s)||canChallengeSecondWorldBoss(i,s))highest=i;
   else break;
  }
  return highest;
 }
 function secondWorldRegionVisible(value,target=null){
  const region=secondWorldRegion(value);
  if(!region)return false;
  for(let i=region.firstBossIndex;i<=region.lastBossIndex;i++){
   if(secondWorldBossVisible(i,target))return true;
  }
  return false;
 }
 function secondWorldEquipmentNamesForBoss(value){
  const boss=secondWorldBoss(value);
  return boss?{...boss.equipment}:null;
 }
 function validateSecondWorldData(){
  const errors=[],warnings=[];
  if(REGIONS.length!==REGION_COUNT)errors.push({code:"REGION_COUNT",actual:REGIONS.length});
  if(BOSSES.length!==BOSS_COUNT)errors.push({code:"BOSS_COUNT",actual:BOSSES.length});
  const expectedLevels=Array.from({length:BOSS_COUNT},(_,i)=>505+i*5);
  const actualLevels=BOSSES.map(row=>row.level);
  if(JSON.stringify(actualLevels)!==JSON.stringify(expectedLevels))errors.push({code:"LEVEL_SEQUENCE"});
  REGIONS.forEach((region,index)=>{
   const rows=secondWorldBossesForRegion(index);
   if(rows.length!==10)errors.push({code:"REGION_BOSS_COUNT",region:index,actual:rows.length});
   if(rows.some(row=>row.regionIndex!==index||row.regionId!==region.id||row.regionName!==region.name))errors.push({code:"REGION_LINK",region:index});
   if(rows[0]?.level!==region.minLevel||rows[rows.length-1]?.level!==region.maxLevel)errors.push({code:"REGION_LEVEL_RANGE",region:index});
  });
  const bossIds=new Set(BOSSES.map(row=>row.id));
  const bossNames=new Set(BOSSES.map(row=>row.name));
  if(bossIds.size!==BOSS_COUNT)errors.push({code:"BOSS_ID_DUPLICATE"});
  if(bossNames.size!==BOSS_COUNT)errors.push({code:"BOSS_NAME_DUPLICATE"});
  const gearNames=BOSSES.flatMap(row=>EQUIPMENT_SLOTS.map(slot=>row.equipment?.[slot])).filter(Boolean);
  if(gearNames.length!==BOSS_COUNT*EQUIPMENT_SLOTS.length)errors.push({code:"GEAR_COUNT",actual:gearNames.length});
  const duplicateGearNames=[...new Set(gearNames.filter((name,index,all)=>all.indexOf(name)!==index))];
  if(duplicateGearNames.length)warnings.push({code:"GEAR_NAME_DUPLICATE",names:duplicateGearNames});
  BOSSES.forEach((boss,index)=>{
   if(boss.index!==index)errors.push({code:"BOSS_INDEX",index});
   EQUIPMENT_SLOTS.forEach(slot=>{if(typeof boss.equipment?.[slot]!=="string"||!boss.equipment[slot])errors.push({code:"GEAR_NAME_MISSING",index,slot});});
  });
  return {passed:errors.length===0,version:VERSION,regionCount:REGIONS.length,bossCount:BOSSES.length,equipmentNameCount:gearNames.length,errors,warnings};
 }

 window.SECOND_WORLD_DATA_VERSION=VERSION;
 window.SECOND_WORLD_REGION_COUNT=REGION_COUNT;
 window.SECOND_WORLD_BOSS_COUNT=BOSS_COUNT;
 window.SECOND_WORLD_EQUIPMENT_SLOTS=EQUIPMENT_SLOTS.slice();
 window.SECOND_WORLD_REGIONS=REGIONS;
 window.SECOND_WORLD_BOSSES=BOSSES;
 window.secondWorldBoss=secondWorldBoss;
 window.secondWorldRegion=secondWorldRegion;
 window.secondWorldBossesForRegion=secondWorldBossesForRegion;
 window.secondWorldBossKilled=secondWorldBossKilled;
 window.secondWorldBossLevelRequirement=secondWorldBossLevelRequirement;
 window.canChallengeSecondWorldBoss=canChallengeSecondWorldBoss;
 window.secondWorldBossVisible=secondWorldBossVisible;
 window.secondWorldRegionVisible=secondWorldRegionVisible;
 window.secondWorldHighestClearedBossIndex=secondWorldHighestClearedBossIndex;
 window.secondWorldHighestUnlockedBossIndex=secondWorldHighestUnlockedBossIndex;
 window.secondWorldEquipmentNamesForBoss=secondWorldEquipmentNamesForBoss;
 window.validateSecondWorldData=validateSecondWorldData;
 window.SECOND_WORLD_DATA_INTEGRITY=validateSecondWorldData();
 if(!window.SECOND_WORLD_DATA_INTEGRITY.passed)console.error("[文明戰線] Second World data integrity error",window.SECOND_WORLD_DATA_INTEGRITY.errors);else if(window.SECOND_WORLD_DATA_INTEGRITY.warnings?.length)console.warn("[文明戰線] Second World data integrity warning",window.SECOND_WORLD_DATA_INTEGRITY.warnings);
})();
