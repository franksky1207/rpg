"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
const failures = [];
function test(name, fn) {
  try {
    fn();
    console.log("PASS", name);
  } catch (e) {
    failures.push(name);
    console.error("FAIL", name, e.message);
  }
}
function fixture() {
  const played = [],
    queued = [],
    ctx = {
      state: { worldPhase: 1 },
      document: { body: {}, querySelector: () => null, addEventListener() {} },
      MutationObserver: class {
        observe() {}
      },
      setTimeout: (fn) => queued.push(fn),
      console,
      isCombatPresentationActive: () => true,
    };
  ctx.window = ctx;
  ctx.CivilizationAudio = {
    settings: () => ({ musicEnabled: true }),
    isSilent: () => false,
    prioritizeEraTheme() {},
    playMusic(id) {
      played.push(id);
      this.id = id;
      return true;
    },
    currentMusicId() {
      return this.id;
    },
    resumeMusic: () => true,
    stopBattleSfx() {},
    warmCombatSfx() {},
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("audio/audio-scenes.js", "utf8"), ctx);
  return { ctx, a: ctx.CivilizationAudioScenes, played, queued };
}
test("combat-looking views never acquire formal ownership", () => {
  const { a } = fixture();
  a.syncView("adventure", "combat");
  assert.equal(a.current().combatLocked, false);
  assert.equal(a.current().music, "era-galaxy-theme");
});
test("formal exit restores theme even with stuck presentation marker", () => {
  const { a } = fixture();
  a.notify("combat-start", { era: "galaxy", mode: "battle", runId: "one" });
  a.notify("combat-exit", { runId: "one" });
  assert.equal(a.current().combatLocked, false);
  assert.equal(a.current().music, "era-galaxy-theme");
});
test("actual main pipeline owns audio independently of result DOM", () => {
  const s = fs.readFileSync("battlepipeline.js", "utf8");
  assert.match(s, /CivilizationAudioScenes\?\.(?:startRun|notify)/);
  assert.match(s, /finally\{[^]*CivilizationAudioScenes\?\.(?:endRun|notify)/);
});
for (const [era, mode, track] of [
  ["galaxy", "normal", "normal"],
  ["galaxy", "elite", "normal"],
  ["galaxy", "boss", "medium"],
  ["universe", "boss", "medium"],
  ["higher", "higher-stage", "high"],
  ["galaxy", "bounty", "normal"],
  ["universe", "bounty", "normal"],
  ["galaxy", "arena", "medium"],
  ["universe", "arena", "medium"],
  ["higher", "arena-fixed", "high"],
  ["galaxy", "mirror", "medium"],
  ["universe", "void", "medium"],
  ["galaxy", "calamity", "high"],
  ["universe", "calamity", "high"],
  ["higher", "alternateBattle", "high"],
])
  test(`${era}/${mode} whole-run and stale-exit safety`, () => {
    const { a, played } = fixture();
    a.notify("combat-start", { era, mode, runId: "old" });
    assert.equal(a.current().music, `battle-${track}-preview`);
    const count = played.length;
    a.notify("combat-end");
    a.syncView("home");
    a.notify("combat-start", { era, mode, runId: "old" });
    assert.equal(played.length, count);
    a.notify("combat-start", { era: "galaxy", mode: "boss", runId: "new" });
    a.notify("combat-exit", { runId: "old" });
    assert.equal(a.current().activeRunId, "new");
    a.notify("combat-exit", { runId: "new" });
    assert.equal(a.current().music, "era-galaxy-theme");
    assert.equal(a.current().combatLocked, false);
  });
test("unlabelled exit and public scene setters cannot acquire/cancel ownership", () => {
  const { a } = fixture();
  a.setContext("galaxy", "battle", { combat: true });
  assert.equal(a.current().combatLocked, false);
  const token = a.startRun({ era: "galaxy", mode: "normal" });
  a.notify("combat-exit");
  a.notify("main");
  assert.equal(a.current().activeRunId, token);
  a.endRun(token);
  assert.equal(a.current().lifecycle, "IDLE");
});
test("reserved/rejected caller token cannot cancel an accepted run", () => {
  const { a } = fixture();
  const accepted = a.startRun({ era: "galaxy", mode: "normal" });
  const reserved = a.createRunToken();
  assert.notEqual(reserved, accepted);
  assert.equal(a.current().activeRunId, accepted);
  assert.equal(a.endRun(reserved), false);
  assert.equal(a.current().activeRunId, accepted);
  a.endRun(accepted);
});
if (failures.length) {
  console.error(`${failures.length} lifecycle failures`);
  process.exitCode = 1;
} else console.log("Audio lifecycle: 20 cases passed");
