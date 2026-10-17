'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
// Retired T4 entry points must stay absent. Modern CI separately pins formal
// runtime hashes, approved GM modules and published assets; no archived source
// copies or historical Git snapshots are needed for this retirement check.
const retired=['3d-test/formal-home.js','3d-test/formal-dom.js','3d-test/preview-expand.css'];
for(const p of retired)assert.equal(fs.existsSync(p),false,p+' must remain retired');
for(const p of ['index.html','ui.js','worldmapui.js','storyui.js','alternateuniverseui.js','story.css']){
 const s=fs.readFileSync(p,'utf8');assert.doesNotMatch(s,/civilization3d(?:FormalHost|StoryHost|HomeToggle|GalaxyToggle|Toggle|HideStoryPreview|HomeRouteRendered)|galaxy3dPreviewControl|formal-home\.js|formal-dom\.js|preview-expand\.css|story-3d-preview/,p+' decorative dependency');
}
const index=fs.readFileSync('index.html','utf8');assert.match(index,/t3b-formal-entry.js\?v=/);assert.match(index,/gm3dprototype.js/);
for(const p of ['3d-test/prototype-engine.js','3d-test/runtime.js','3d-test/test-center.js','3d-test/character-assets.js','3d-test/shared-loader.js','3d-test/formal-snapshots.js'])assert.ok(fs.existsSync(p),'GM/formal shared retained '+p);
const plan=require('../../scripts/publish-assets.cjs').inspect(process.cwd());assert.equal(plan.missing.length,0);assert.ok(!plan.keep.some(p=>p.startsWith('development/')));
console.log('PASS T4 current retired entry points absent, no formal decoration references, shared GM/B preserved, publish isolated');
