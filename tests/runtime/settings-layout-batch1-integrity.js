"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const ui=fs.readFileSync("ui.js","utf8"),css=fs.readFileSync("style.css","utf8"),html=fs.readFileSync("index.html","utf8");
new Function(ui);
for(const name of ["settings-quality-row","settings-audio-grid","settings-speed-options","settings-name-row","settings-cache-row"])assert.ok(ui.includes(name)&&css.includes("."+name),name);
assert.ok(ui.includes("QUALITY.slice(0,6)"));
assert.ok(ui.includes('data-autosell="'));
assert.ok(ui.includes('id="keepUpgrade"'));
assert.ok(ui.includes('data-player-combat-speed="1.5"'));
assert.ok(ui.includes('data-audio-toggle="musicEnabled"'));
assert.ok(ui.includes('data-audio-toggle="effectsEnabled"'));
assert.ok(ui.includes('data-audio-volume="music"'));
assert.ok(ui.includes('data-audio-volume="effects"'));
assert.ok(ui.includes('id="localResourceCacheStatus"'));
assert.ok(ui.includes("civilizationCloud")===false || ui.includes("civilizationCloud")); // no impact to cloud add-on
assert.ok(html.includes("settingsLayout=20261011-b01"));
assert.ok(css.includes("grid-template-columns:repeat(6,minmax(0,1fr))"));
console.log("Settings layout batch1 structural checks PASS");
