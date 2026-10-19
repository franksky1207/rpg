"use strict";
// Batch10: presentational regressions, no gameplay or save mutation.
const fs=require("node:fs"),assert=require("node:assert/strict");
const css=fs.readFileSync("battle-mobile-viewport.css","utf8");
const html=fs.readFileSync("index.html","utf8");
const mode=fs.readFileSync("3d-test/mode-foundation.js","utf8");
const dungeon=fs.readFileSync("dungeonui.js","utf8");
for(const s of [
 "#main .function-page .setting-row",
 "#main .function-page .setting-row input[type=\"range\"]",
 "#main .dungeon-bounty-combat .controls",
 "#main .enhancement-page .enhance-slot-card",
 "#main .combat-screen .combatant"
])assert.ok(css.includes(s),"Responsive selector missing: "+s);
assert.match(css,/@media\(max-width:820px\)/);
assert.match(html,/battle-mobile-viewport\.css\?v=20261019-batch10-usability1/);
assert.match(mode,/關閉後使用文字戰鬥/);
assert.match(mode,/civilization-war-combat-animation-v1:/);
assert.match(dungeon,/battleViewportGestureAt/);
assert.match(dungeon,/positionActiveDungeonCombat\(main\)/);
assert.match(dungeon,/querySelector\(\"\.combat-head\"\)/);
console.log("PASS batch10 mobile and formal-settings compatibility contract");
