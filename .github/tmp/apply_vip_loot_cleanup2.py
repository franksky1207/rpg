from pathlib import Path

p=Path('tests/runtime/js-integrity.js')
s=p.read_text()
marker='const vm=require("vm");\n'
if marker not in s:
    raise SystemExit('vm marker missing')
if 'VIP Loot behavior contract' in s:
    print('VIP Loot behavior contract already present; no patch needed')
    raise SystemExit(0)
block=r'''// VIP Loot behavior contract: execute the shared owner with deterministic RNG.
function createVipLootHarness({vipLevel=0,equipment=null}={}){
 const context={
  state:{vipLevel,equipment:equipment||{weapon:{score:50},helmet:{score:40},armor:{score:30},shoes:{score:20},accessory:{score:10}}},
  VIP_MAX_LEVEL:20,
  EQUIPMENT_TYPES:["weapon","helmet","armor","shoes","accessory"],
  equipmentScore:item=>Number(item?.score)||0,
  Math,
  console
 };
 context.window={};
 vm.createContext(context);
 vm.runInContext(vipLootCore,context,{filename:"viplootcore.js"});
 return context;
}
function sequenceRng(values,fallback=.99){let i=0;return ()=>i<values.length?values[i++]:fallback;}
{
 const h=createVipLootHarness({vipLevel:7});
 const r=h.window.resolveVipLootModifiers(3,{boss:false,rng:()=>0,weakTypesResolver:()=>["accessory"]});
 assert(r.forcedType===null&&r.quality===3,"VIP7 不得提前取得 VIP8／14 裝備特權。");
}
{
 const h=createVipLootHarness({vipLevel:8});
 const hit=h.window.resolveVipLootModifiers(3,{boss:false,rng:()=>.149,weakTypesResolver:()=>["accessory"]});
 const miss=h.window.resolveVipLootModifiers(3,{boss:false,rng:()=>.15,weakTypesResolver:()=>["accessory"]});
 assert(hit.forcedType==="accessory"&&hit.vip8WeakSlot===true,"VIP8 15% 邊界內必須命中最弱部位。");
 assert(miss.forcedType===null&&miss.vip8WeakSlot===false,"VIP8 在 15% 邊界值不得誤觸發。");
}
{
 const h=createVipLootHarness({vipLevel:14});
 const hit=h.window.resolveVipLootModifiers(3,{boss:false,rng:sequenceRng([.049,.99]),weakTypesResolver:()=>["accessory"]});
 const miss=h.window.resolveVipLootModifiers(3,{boss:false,rng:sequenceRng([.05,.99]),weakTypesResolver:()=>["accessory"]});
 assert(hit.quality===4&&hit.qualityResult.vip14Promotion===1,"VIP14 5% 邊界內必須品質 +1。");
 assert(miss.quality===3&&miss.qualityResult.vip14Promotion===0,"VIP14 在 5% 邊界值不得誤升階。");
}
{
 const h=createVipLootHarness({vipLevel:16});
 assert(h.window.vipLootBossExtraDropTriggered({boss:true,rng:()=>.149})===true,"VIP16 Boss 15% 邊界內必須可額外掉落。");
 assert(h.window.vipLootBossExtraDropTriggered({boss:true,rng:()=>.15})===false,"VIP16 Boss 在 15% 邊界值不得誤觸發。");
 assert(h.window.vipLootBossExtraDropTriggered({boss:false,rng:()=>0})===false,"VIP16 不得套用到非 Boss 掉落。");
}
{
 const h=createVipLootHarness({vipLevel:18});
 const boss=h.window.resolveVipLootModifiers(3,{boss:true,rng:sequenceRng([.99,.099,.99]),weakTypesResolver:()=>["accessory"]});
 const nonBoss=h.window.resolveVipLootModifiers(3,{boss:false,rng:sequenceRng([.99,.099]),weakTypesResolver:()=>["accessory"]});
 assert(boss.quality===4&&boss.qualityResult.vip18Promotion===1,"VIP18 Boss 10% 邊界內必須品質 +1。");
 assert(nonBoss.quality===3&&nonBoss.qualityResult.vip18Promotion===0,"VIP18 不得套用到非 Boss 掉落。");
 const double=h.window.resolveVipLootModifiers(3,{boss:true,rng:sequenceRng([.01,.01,.99]),weakTypesResolver:()=>["accessory"]});
 assert(double.quality===5&&double.qualityResult.vip14Promotion===1&&double.qualityResult.vip18Promotion===1,"VIP14／18 必須可獨立同時觸發並合計 +2。");
 const cap=h.window.resolveVipLootModifiers(5,{boss:true,rng:sequenceRng([0,0,.99]),weakTypesResolver:()=>["accessory"]});
 assert(cap.quality===5&&cap.qualityResult.vip14Promotion===0&&cap.qualityResult.vip18Promotion===0,"VIP 品質升階不得超過神話品質 5。");
}
{
 const equipment={weapon:{score:90},helmet:{score:70},armor:{score:50},shoes:{score:30},accessory:{score:10}};
 const h=createVipLootHarness({vipLevel:8,equipment});
 const order=h.window.vipLootDefaultWeakEquipmentTypes({equipment},()=>.5);
 assert(order[0]==="accessory","VIP8 預設最弱部位必須依傳入 target state 判斷，而不是偷讀其他角色裝備。");
 let seenState=null;
 const target={vipLevel:8,equipment};
 const forced=h.window.resolveVipLootModifiers(2,{state:target,vipLevel:8,boss:false,rng:()=>0,weakTypesResolver:s=>{seenState=s;return ["shoes"];}});
 assert(seenState===target&&forced.forcedType==="shoes","VIP8 自訂 resolver 必須收到指定 target state 並決定部位。");
}
assert(/function secondWorldEquipmentRewardRows\(result\)/.test(secondWorldRewards)&&/result\?\.equipmentRewards/.test(secondWorldRewards)&&/result\?\.item/.test(secondWorldRewards),"宇宙主線裝備結果必須以 equipmentRewards 為正式陣列 owner，並保留舊單件 fallback 相容層。");
assert(/item:primary\?\.item\|\|null/.test(secondWorldRewards)&&/itemResult:primary\?\.itemResult\|\|null/.test(secondWorldRewards)&&/sale:primary\?\.sale\|\|null/.test(secondWorldRewards)&&/kept:primary\?\.kept===true/.test(secondWorldRewards),"宇宙主線舊 item／itemResult／sale／kept 欄位必須維持 equipmentRewards[0] 相容投影，不得另生第二套資料。");

'''
s=s.replace(marker,marker+block,1)
p.write_text(s)
