const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const source=fs.readFileSync("alternateuniversedata.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const sandbox={window:{},console,Math,Number,Object,Set};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:"alternateuniversedata.js"});
const w=sandbox.window;
const report=w.runAlternateUniverseDataIntegrity();
assert(report&&report.ok===true,"異宇宙資料 owner 自我檢查失敗："+JSON.stringify(report?.errors||[]));
assert(w.ALTERNATE_UNIVERSE_DATA_VERSION===2,"異宇宙資料 owner 版本必須為 V2。");
assert(w.ALTERNATE_UNIVERSE_TITLE_DATA_VERSION===1,"異宇宙稱號資料 contract 必須為 V1。");
assert(w.ALTERNATE_UNIVERSE_UNIVERSE_COUNT===200,"異宇宙正式數量必須為 200。");
assert(w.ALTERNATE_UNIVERSE_DEPTHS_PER_UNIVERSE===5,"每個異宇宙必須固定 5 深度。");
assert(Array.isArray(w.ALTERNATE_UNIVERSE_NAMES)&&w.ALTERNATE_UNIVERSE_NAMES.length===200,"正式異宇宙名稱必須完整 200 筆。");
assert(new Set(w.ALTERNATE_UNIVERSE_NAMES).size===200,"正式異宇宙名稱不得重複。");
assert(Array.isArray(w.ALTERNATE_UNIVERSE_CULTURES)&&w.ALTERNATE_UNIVERSE_CULTURES.length===20,"文化類別必須正好 20 類。");
for(const culture of w.ALTERNATE_UNIVERSE_CULTURES){
 const count=w.ALTERNATE_UNIVERSE_NAME_CULTURES.filter(row=>row===culture).length;
 assert(count===10,`文化 ${culture} 必須正好配置 10 個宇宙，實際 ${count}。`);
}
assert(w.ALTERNATE_UNIVERSE_DEPTH_LABELS.join("|")==="外環|神庭|聖域|天座|主宰","五深度順序錯誤。");
const titleNames=["異界凌越","萬界破境","異律掌御","諸宇錯序","萬律凌駕","諸界超脫","萬宇無疆","諸界歸一","宇外凌絕","宇外無極"];
assert(Array.isArray(w.ALTERNATE_UNIVERSE_TITLE_ROWS)&&w.ALTERNATE_UNIVERSE_TITLE_ROWS.length===10,"異宇宙正式稱號必須正好 10 個。");
w.ALTERNATE_UNIVERSE_TITLE_ROWS.forEach((row,index)=>{assert(row.id===`alternate-universe-title-${String(index+1).padStart(2,"0")}`&&row.name===titleNames[index]&&row.tier===index+1&&row.depthThreshold===(index+1)*100&&row.series==="alternate-universe",`異宇宙第 ${index+1} 階稱號 metadata 錯誤。`);});

assert(w.alternateUniverseDepthInfo(1).displayName==="幽都宇宙・外環","U1 mapping 錯誤。");
assert(w.alternateUniverseDepthInfo(5).displayName==="幽都宇宙・主宰","U5 mapping 錯誤。");
assert(w.alternateUniverseDepthInfo(6).displayName==="血月宇宙・外環","U6 mapping 錯誤。");
assert(w.alternateUniverseDepthInfo(500).universeNumber===100&&w.alternateUniverseDepthInfo(500).stageName==="主宰","U500 邊界 mapping 錯誤。");
assert(w.alternateUniverseDepthInfo(1000).displayName==="無盡海神宇宙・主宰","U1000 mapping 錯誤。");
assert(w.alternateUniverseDepthFromUniverse(200,5)===1000,"宇宙／深度反查 U1000 錯誤。");
assert(w.alternateUniverseDepthInfo(0)===null&&w.alternateUniverseDepthFromUniverse(201,1)===0,"非法深度／宇宙必須 fail closed。");
const u1=w.alternateUniverseEnemyStats(1),u1000=w.alternateUniverseEnemyStats(1000);
assert(u1.hp===351500&&u1.atk===26600&&u1.def===12250,"U1 HP/ATK/DEF 公式錯誤。");
assert(u1000.hp===1530320000&&u1000.atk===626000&&u1000.def===262000,"U1000 HP/ATK/DEF 公式錯誤。");
assert(u1.crit===20&&u1.dodge===20&&u1000.crit===20&&u1000.dodge===20,"異宇宙 Boss baseline 必須固定暴擊20%／閃避20%。");
const pos=name=>index.indexOf('src="'+name+'?v=');
assert(pos("reincarnationstate.js")>=0&&pos("alternateuniversedata.js")>pos("reincarnationstate.js"),"alternateuniversedata.js 必須在 reincarnationstate.js 後載入。");
assert(pos("alternateuniversedata.js")<pos("breakthroughcore.js"),"alternateuniversedata.js 必須在後續轉生／AU consumer 前載入。");
assert(/alternateuniversedata\.js\?v=20261003-reincarnation-batch3-1[^"]*v2=20261006-au-title-batch1/.test(index),"異宇宙稱號第1批必須更新 alternateuniversedata.js cache-bust。");
assert(!/reward|gold|darkMatter|darkEnergy|dimensionString|loot/i.test(source),"第3-1資料 owner 不得偷帶收益／掉落邏輯。");
console.log("Alternate Universe Data Integrity OK");
console.log("200 universes / 1000U mapping / 20 cultures / five depths / enemy curve / 20% crit-dodge baseline are synchronized.");
