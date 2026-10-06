const fs=require("fs");
const assert=require("assert");
const read=path=>fs.readFileSync(path,"utf8");

const third=read("thirdworlddungeonui.js");
const access=read("reincarnationdungeonaccess.js");
const mirror=read("mirrordungeonstate.js");
const mirrorGm=read("mirrordungeongm.js");
const title=read("playertitlecore.js");
const auGm=read("gmalternateuniversemanage.js");
const migration=read("savemigration.js");
const matrix=read("tests/runtime/save-schema17-compatibility-matrix.js");
const index=read("index.html");

assert.ok(/const VERSION=7;/.test(third)&&/THIRD_WORLD_DUNGEON_ERA_POLICY_OWNER="thirdworlddungeonui"/.test(third),"Batch1 W3 era policy owner drifted.");
assert.ok(/const VERSION=4;/.test(access)&&/ACCESS_SNAPSHOT_VERSION=2/.test(access),"Batch1 reincarnation dungeon access version drifted.");
assert.ok(!access.includes("unregisterDungeonModeAvailabilityPolicy")&&!access.includes('registerDungeonModeAvailabilityPolicy("third-world"'),"Batch1 reincarnation access must not own W3 era policy.");
for(const key of ["qualificationUnlocked","permanentUnlocked","eraAllowed","effectiveEnabled"])assert.ok(access.includes(key),`Batch1 effective access field missing: ${key}`);

assert.ok(/MIRROR_DUNGEON_STATE_VERSION=3/.test(mirror)&&/MIRROR_DUNGEON_SETTLEMENT_OWNER_VERSION=1/.test(mirror)&&/MIRROR_MIRACLE_DATE_DEDUP_VERSION=1/.test(mirror),"Batch2 mirror settlement owner drifted.");
assert.ok(/function settleMirrorDungeonResult(/.test(mirror)&&/settleMirrorDungeonResult\(state,wins,timestamp,\{requireRunning:true\}\)/.test(mirror),"Player mirror completion must delegate to canonical settlement.");
assert.ok(/Array\.from\(new Set\(history\.miracleDates/.test(mirror),"Mirror old-save miracle dates must dedupe.");
assert.ok(/GM_MIRROR_FORMAL_RESULT_VERSION=2/.test(mirrorGm)&&/GM_MIRROR_FORMAL_MIN_WINS=15/.test(mirrorGm),"GM mirror formal range drifted.");
assert.ok(/settleMirrorDungeonResult\(target,w,timestamp,\{requireRunning:false,requireUpgrade:true\}\)/.test(mirrorGm),"GM mirror result must delegate to canonical settlement.");

assert.ok(/PLAYER_TITLE_ALTERNATE_UNIVERSE_THRESHOLD_OWNER_VERSION=1/.test(title)&&/PLAYER_TITLE_NORMALIZATION_DIAGNOSTICS_VERSION=1/.test(title),"Batch3 title threshold/diagnostics owner drifted.");
assert.ok(!title.includes("deepest/100")&&!title.includes("currentDepth/100")&&!title.includes("previousDepth/100"),"AU title core must remain depthThreshold-driven.");
assert.ok(/GM_ALTERNATE_UNIVERSE_TITLE_THRESHOLD_OWNER_VERSION=TITLE_THRESHOLD_OWNER_VERSION/.test(auGm)&&!auGm.includes("deepest/100")&&!auGm.includes("next.deepestCleared/100"),"GM AU title thresholds must remain data-driven.");
assert.ok(/SAVE_MIGRATION_DIAGNOSTICS_VERSION=1/.test(migration),"Batch3 save migration diagnostics owner missing.");
for(const key of ["alternateUniverseTitlesBackfilled","alternateUniverseTitlesBackfilledIds","mirrorHistoryRepaired","mirrorMiracleDatesRemoved"])assert.ok(migration.includes(key),`Migration diagnostic missing: ${key}`);

assert.ok(/const SAVE_SCHEMA_VERSION=17;/.test(migration),"Batch4 closure must not bump Schema17.");
for(const token of ["const old36=","mirror_title_19","mirror_title_20","const auHonor=","const w3Rerun=","alternateUniverseTitlesBackfilled,8","effectiveEnabled,false"])assert.ok(matrix.includes(token),`Batch4 Schema17 closure case missing: ${token}`);
assert.ok(index.includes("v4=20261007-migration-diagnostics-batch3"),"Batch3 migration cache-bust must remain active.");

console.log("Recent optimization Batch4 closure passed:",JSON.stringify({schema:17,w3AccessOwner:"thirdworlddungeonui",mirrorSettlementOwner:1,auThresholdOwner:1,migrationDiagnostics:1,oldSaveMatrix:"expanded"}));
