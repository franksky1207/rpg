const fs=require("fs"),vm=require("vm"),assert=require("assert");
const background=fs.readFileSync("backgroundprogress.js","utf8");
const galaxy=fs.readFileSync("calamityui.js","utf8");
const universe=fs.readFileSync("secondworldcalamityui.js","utf8");
const gRun=fs.readFileSync("calamityrun.js","utf8");
const uRun=fs.readFileSync("secondworldcalamityrun.js","utf8");
const ctx={console,document:{visibilityState:"visible",hasFocus(){return true;},addEventListener(){}},addEventListener(){},setTimeout(){return 1;},clearTimeout(){}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(background,ctx,{filename:"backgroundprogress.js"});
const decision=ctx.calamityContinuousUiDecision;
assert.equal(ctx.CALAMITY_CONTINUOUS_UI_POLICY_VERSION,1);
const scenarios=[
 {name:"normal",policy:{fastCatchUp:false,shouldPresentBattle:true,shouldRefreshUi:true},ended:false,expected:[false,true,false,true,false]},
 {name:"fast-preview",policy:{fastCatchUp:true,shouldPresentBattle:true,shouldRefreshUi:false},ended:false,expected:[true,true,false,true,false]},
 {name:"fast-skip",policy:{fastCatchUp:true,shouldPresentBattle:false,shouldRefreshUi:false},ended:false,expected:[true,false,false,false,true]},
 {name:"fast-refresh",policy:{fastCatchUp:true,shouldPresentBattle:false,shouldRefreshUi:true},ended:false,expected:[true,false,true,true,true]},
 {name:"fast-terminal",policy:{fastCatchUp:true,shouldPresentBattle:false,shouldRefreshUi:true},ended:true,expected:[true,false,false,true,false]},
 {name:"fast-terminal-no-refresh",policy:{fastCatchUp:true,shouldPresentBattle:false,shouldRefreshUi:false},ended:true,expected:[true,false,false,false,false]}
];
for(const {name,policy,ended,expected} of scenarios){
 const before=JSON.stringify(policy),a=decision(policy,ended);
 assert.deepEqual([a.fastCatchUp,a.shouldPresentBattle,a.shouldRefreshUi,a.shouldYield,a.shouldConsumeDuration],expected,"policy case "+name);
 assert(Object.isFrozen(a),"immutable shared UI decision "+name);
 assert.equal(JSON.stringify(policy),before,"policy should remain read-only "+name);
}
for(const [era,source] of [["W1",galaxy],["W2",universe]]){
 for(const token of ["window.calamityContinuousUiDecision(policy,","uiDecision.shouldPresentBattle","uiDecision.shouldRefreshUi","uiDecision.shouldYield","uiDecision.shouldConsumeDuration"])
  assert(source.includes(token),era+" UI should delegate "+token);
 assert(!source.includes("const fast=policy?.fastCatchUp===true;"),era+" UI must not duplicate presentation policy parsing");
}
for(const [era,source] of [["W1",gRun],["W2",uRun]]){
 assert(!source.includes("function catchUpPreviewPolicy()"),era+" unused run-local catchUpPreviewPolicy must be removed");
 assert(source.includes("battlePresentationPlan(options)"),era+" canonical pre-battle shared policy must remain");
}
console.log("CALAMITY SHARED UI POLICY OPT BATCH3 PASSED",JSON.stringify(scenarios.map(x=>x.name)));
