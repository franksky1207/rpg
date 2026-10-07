const fs=require("fs");
const assert=require("assert");
const read=path=>fs.readFileSync(path,"utf8");

const background=read("backgroundprogress.js");
const w1Run=read("calamityrun.js");
const w1Core=read("calamitycore.js");
const w1Ui=read("calamityui.js");
const w2Run=read("secondworldcalamityrun.js");
const w2Ui=read("secondworldcalamityui.js");
const index=read("index.html");

assert.ok(background.includes("CONTINUOUS_RUN_BATTLE_PRESENTATION_POLICY_VERSION=1"),"Shared calamity battle presentation owner version missing.");
assert.ok(background.includes("battlePresentationPlan(baseOptions={})"),"Shared continuous-run infrastructure must own battlePresentationPlan.");
assert.ok(background.includes("backgroundProgressCatchUpStep(flowKind)"),"Shared battle presentation plan must consume the catch-up step before combat.");

for(const [name,source] of [["W1",w1Run],["W2",w2Run]]){
  assert.ok(source.includes("battlePresentationPlan(options)"),name+" calamity run must consume shared battle presentation plan.");
  assert.ok(source.includes("presentationPolicy=presentationPlan"),name+" calamity run must carry the pre-battle presentation decision through terminal settlement.");
  assert.ok(source.includes("...presentationPlan.combatOptions"),name+" calamity combat options must come from shared battle presentation plan.");
}
assert.ok(w1Core.includes("preparePresentation:options.preparePresentation!==false"),"W1 calamity core must support headless Fast Catch-up combat presentation.");

assert.ok(w1Ui.includes("const policy=battle?.presentationPolicy||null"),"W1 UI must use the battle-start presentation decision after mark-maxed terminal settlement.");
assert.ok(w1Ui.includes("if(!battle.ended)await consumeCatchUpDelay"),"W1 terminal Fast Catch-up battle must not wait a full structured-combat duration after background flow has stopped.");
assert.ok(!w1Ui.includes("function catchUpStep()"),"W1 UI must not re-decide catch-up presentation after settlement.");

assert.ok(w2Ui.includes("const policy=step?.presentationPolicy||null"),"W2 UI must use the same carried battle-start presentation decision.");
assert.ok(w2Ui.includes("if(!step.ended)await consumeCatchUpDelay"),"W2 terminal Fast Catch-up battle must skip redundant terminal presentation delay.");
assert.ok(!w2Ui.includes("function catchUpStep()"),"W2 UI must not own a second catch-up-step decision.");

for(const token of [
 "backgroundprogress.js?v=20260927-run-opt-batch1&v2=20261007-calamity-terminal-catchup1",
 "calamitycore.js?v=20261004-reincarnation-batch5-2&v2=20261007-calamity-terminal-catchup1",
 "calamityrun.js?v=20260927-run-opt-batch2&v2=20261007-calamity-terminal-catchup1",
 "calamityui.js?v=20260922-universe-calamity-batch2&v2=20261006-calamity-entry-scroll1&v3=20261006-calamity-ui-opt-batch3&v4=20261007-calamity-terminal-catchup1",
 "secondworldcalamityrun.js?v=20260927-run-opt-batch2&v2=20261007-calamity-terminal-catchup1",
 "secondworldcalamityui.js?v=20260927-thirdworld-ui-opt9-2&v2=20261006-calamity-live-ui1&v3=20261006-calamity-entry-scroll1&v4=20261006-calamity-ui-opt-batch3&v5=20261007-calamity-terminal-catchup1"
])assert.ok(index.includes(token),"Cache-bust missing: "+token);

console.log("Calamity shared terminal Fast Catch-up integrity passed:",JSON.stringify({sharedOwner:1,w1:true,w2:true,terminalDecision:"battle-start"}));
