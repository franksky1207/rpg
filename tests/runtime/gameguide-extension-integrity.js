const fs=require("fs");
const vm=require("vm");
function assert(condition,message){if(!condition)throw new Error(message);}
const context={console,Math,JSON,Object,Array,Set,Map,String,Number,Boolean,RegExp,Error,Date};
context.window=context;
context.MIRROR_DUNGEON_CONFIG={runBattles:20};
context.currentWorldPhase=target=>target?.thirdWorld?.entered===true?3:(target?.secondWorld?.entered===true?2:1);
vm.createContext(context);
for(const file of ["gameguide.js","mirrordungeonguide.js","cloudsaveguide.js"])vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
assert(typeof context.registerGameGuideExtension==="function","Guide shared extension registry missing.");
assert(JSON.stringify(context.gameGuideExtensionIds())===JSON.stringify(["mirror-dungeon","cloud-save"]),"Guide extension registration/order drift.");
for(const phase of [1,2,3]){
 context.state={level:phase===3?1000:phase===2?501:1,secondWorld:{entered:phase>=2},thirdWorld:{entered:phase===3}};
 const categories=context.gameGuideCategoriesForState(context.state),dungeon=categories.find(row=>row?.id==="dungeon");
 assert(dungeon&&Array.isArray(dungeon.items),`Phase ${phase} dungeon guide missing.`);
 assert(dungeon.items.filter(item=>Array.isArray(item)&&item[0]==="鏡像戰").length===1,`Phase ${phase} mirror guide must appear exactly once.`);
 const html=context.gameGuidePage();
 assert((html.match(/帳號與雲端存檔/g)||[]).length===1,`Phase ${phase} cloud guide must appear exactly once.`);
}
const cloud=fs.readFileSync("cloudsaveguide.js","utf8"),mirror=fs.readFileSync("mirrordungeonguide.js","utf8");
assert(!/window\.gameGuidePage\s*=/.test(cloud),"Cloud guide must not monkey-patch gameGuidePage.");
assert(!/GAME_GUIDE_CATEGORIES/.test(mirror),"Mirror guide must not mutate legacy base categories directly.");
console.log("GAME GUIDE EXTENSION INTEGRITY PASSED");
