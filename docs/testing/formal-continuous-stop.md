# Formal continuous stop unification

Baseline: latest main `215cb89207363b0ed16e08fae9b8532ee67390a3`, after PR111 merge.
New branch: `integrate/formal-continuous-stop-20261026`. No old branch inherited.

## Pre-edit inventory and integration plan

| Formal mode | Original HTML / position | Original request → owner | Actual boundary / state | Existing coverage |
| --- | --- | --- | --- | --- |
| Galaxy normal / elite / boss | ui.js battlePage; below heading | requestContinuousBattleStop → activeMainBattleContext.exitRequested | finish encounter incl special reward, then stop; main GM/background rules | bosscontinuous, foreground lifecycle, mode matrix |
| Universe main | worldmapui.js; below heading + home boss action | requestSecondWorldContinuousStop → activeContext.stopRequested | finish encounter, preserve settlement, clear context | mode matrix / second-world integrity |
| Special galaxy / universe | specialencounter.js specialBattlePage; **after combatMessage** | respective main/universe request | same parent context, finish special then parent decides next encounter | special fast-catchup; missing actual stop geometry regression |
| Galaxy calamity | calamityui.js; between run stats and combat | stopCivilizationCalamityContinuousUI → requestCivilizationCalamityContinuousStop | activeRun.stopRequested; finish current fighting phase, else immediate finish; permanent HP/mark unchanged | pr48 live / calamity and terminal tests |
| Universe calamity | secondworldcalamityui.js; between stats and combat | stopSecondWorldCalamityContinuousUI → requestSecondWorldCalamityStop | activeRun same boundary; permanent HP/progress preserved | mode matrix / terminal regressions |
| Higher ten kings | thirdworldui.js; below heading + home boss action | stopThirdWorldRunFromPlayerUi → stopThirdWorldContinuousRun | presentingBattle → pending stop; otherwise clearRuntime; death/suppression/progress rules unchanged | higher run / mode matrix |
| Galaxy/universe bounty | dungeonbounty.js combatHtml; below heading | requestBountyContinuousStop → bountyState.stopRequested | finish current fight, normal reward/daily-use settlement then summary | dungeon cores / mode matrix |
| Galaxy/universe arena | dungeonarena.js combatHtml; below progress | requestArenaContinuousStop → arenaState.stopRequested | finish three-fight round, preserve daily use/points | arena / mode matrix |
| Higher fixed/varied arena | thirdworldarenaui.js combatHtml; below lineup | requestThirdWorldArenaUiStop → requestThirdWorldArenaStop | finish current round; requestedRuns>1 only; transaction/points unchanged | pr48 live two full rounds |
| Void all supported eras | dungeonvoidui.js; outer panel above inner combat heading | requestVoidMirageExitUI → requestVoidMirageExit | finish current floor, then exit; duplicated UI exitAfterFloor flag | mirror/void recovery + mode matrix |
| Mirror | no stop UI | explicitly forbidden stop API | finite formal encounter; keep absent | mirrorfinal / mirrordungeon integrity |
| Alternate universe | no continuous/stop UI found | single challenge/settlement owner | do not invent stop or continuous feature | AU formal / identity tests |
| Higher bounty | existing unavailable entry | none | do not invent a higher bounty mode | matrix asserts unavailable |

All applicable modes inherit existing foreground interruption / GM background policy.
Existing minimal-mode adapters are display-only and are retained, including the
Void four fields, order and status copy. They are not a stop dispatcher.

Design: reuse mainminimalmode.js for one renderer, dispatcher and owner-derived
state projection. Register read/request adapters at real owners, accessing their
actual private run objects rather than cloned snapshots or a second battle state.
Use an ephemeral WeakMap identity lease and lifecycle epoch on DOM controls to
reject stale controls after run/mode changes. An in-flight guard prevents reentrant
side effects; requested flags remain exclusively in existing owners. Preserve
owner-specific stop functions as adapter capabilities. Compatibility UI aliases
route into the shared dispatcher. One observer reconciles controls after renders;
lifecycle notifications refresh them after begin/cancel/finish.

Move special stop interpolation before its arena in real authored HTML. Remove
its :has/element-order CSS patch. Use one explicit wrapper/class/data structure
for all active stop UI. Keep mode-specific pending labels (round/floor) in adapters.
No math, reward, daily counter, persistent schema, or core settlement changes.

## Historical seals audit

- Issue106 historicalBytes is the outer source projection used by GM/appearance
  and Batch20 chains; index has exact prior combatUi token counts.
- Batch20 composes foreground, appearance, Mirror/Void, three-UI and optimization
  exact hashes. Preserve every historical registration and baseline.
- pr48 stop contract directly requires old button attributes; update its historical
  view through the exact projection and separately test the new LIVE shared API.
- mobile viewport static tests currently require literal data attributes in every
  UI file; migrate that check to explicit shared renderer calls plus LIVE geometry.
- Notice/function seals, third-world death/progress, resource manifest and all
  existing source guards remain active. Any necessary projection must record
  named UI functions / registration hooks as exact literal substitutions, verify
  whole-file before/after digests, reconstruct latest-main bytes exactly and reject
  unrelated edits. No blanket source bypass or hash-only arbitrary approval.

## Acceptance plan

Unit: every adapter dispatch, invalid/missing adapter, duplicate/reentrant request,
owner-derived states, single-fight omission, old-run/old-epoch DOM rejection,
control dedup and lifecycle sync. Mutation tests must reject unauthorized source
and patch drift. Compare protected core math, reward and save bytes to baseline.

Browser: actual published UI/owners, galaxy normal/elite/boss, universe, forced
special in both worlds, both calamities, higher kings, bounty/arena variants,
all supported Void eras; portrait 390×844, landscape 844×390, desktop 1365×900.
Record getBoundingClientRect for heading, stop and actual animation stage, count,
request effects and terminal states. Special must be heading → stop → stage in
actual Chromium, non-overlapping, with no CSS rescue. No string-only pass.
Use real settlement/pacing owners with numerical fixtures, not mocked stop APIs.
Run existing foreground/GM policy, minimal, reward, dungeon and recovery tests,
then Functional, Runtime, Equipment and relevant browser CI on one final PR.

## Implementation and acceptance evidence

### Final shared call chain

Every authored control now calls `requestFormalContinuousStopFromControl(element)`
→ `requestFormalContinuousStop(mode, {control})` → registered owner adapter →
the original mode capability. `renderContinuousStopControl({mode})` is the only
HTML constructor. Controls carry explicit mode/run/lifecycle identity; an old,
disconnected, duplicate, reentrant or already requested control cannot call an
owner again. State is read from the existing private owner; there is no second
battle-state store. A WeakMap holds only ephemeral owner identity, and a WeakSet
holds only synchronous in-flight dispatch. Lifecycle begin/finish/invalidate and
DOM reconciliation remove obsolete controls without moving UI.

| Adapter ID | Registered in | Original capability retained | Exception retained |
| --- | --- | --- | --- |
| main | battlepipeline.js | requestContinuousBattleStop | finish current encounter, including special; existing GM background policy |
| second-world-mainline | secondworldmainline.js | requestSecondWorldContinuousStop | finish encounter, including universe special |
| calamity | calamityrun.js | requestCivilizationCalamityContinuousStop | fighting phase finishes; permanent Boss HP/mark untouched |
| second-world-calamity | secondworldcalamityrun.js | requestSecondWorldCalamityStop | original permanent HP, persistence and finish boundary |
| higher-stage | thirdworldrun.js | stopThirdWorldPlayerFlow("manual"), existing core fallback | existing player-flow reason/death/king progression |
| bounty | dungeonbounty.js | requestBountyContinuousStop | finish current encounter, original daily-use/reward settlement |
| arena | dungeonarena.js | requestArenaContinuousStop | finish the entire three-fight round |
| higher-arena | thirdworldarena.js | requestThirdWorldArenaStop | finish the entire three-fight round; fixed and varied queues |
| void | dungeonvoid.js | requestVoidMirageExit | finish current floor then exit, original recovery rules |

Special encounters deliberately use their actual parent `main` or
`second-world-mainline` owner. Compatibility UI aliases remain only where runtime
symbol contracts require them and delegate to the shared entry; they do not own
stop state. Missing adapter, unavailable owner and single fights safely omit the
control. Mirror, alternate-universe finite battles and unavailable higher bounty
do not gain a new stop capability.

### Retired implementations and layout

- Removed duplicated stop-button HTML in the ten formal UI constructors and
  per-mode button-disable/text mutations in main, bounty and arena.
- Removed Void UI `exitAfterFloor`; actual owner `exitRequested` is authoritative.
  Void minimal-mode four fields/order/status section remains byte-identical.
- Removed special `:has()`/adjacent-element ordering rescue, obsolete Void,
  calamity and higher home stop styles, and redundant stop order overrides.
- Retired universe-calamity string-injection decorator. Its minimal-mode entry is
  authored in the actual combat heading; its display adapter remains functional.
- No entire production file was deleted: retained modules still own formal
  behavior or historical contracts. Internal stop capabilities remain adapters,
  rather than being replaced by a second settlement implementation.
- Real DOM order is heading → stop → animation → messages. Migrated roots use
  `.formal-continuous-combat`; finite legacy stages retain their original layout.
  The viewport coordinator measures the actual sticky header and prioritizes
  the shared control plus stage when the whole HUD cannot fit. It never reparents
  controls or changes animation dimensions, battle clocks or rewards.

### Chromium coordinate evidence

All **54/54** cases passed on actual Chromium rendering. Each cell is
`heading bottom / button top–bottom / animation top` in CSS pixels, measured with
`getBoundingClientRect()`. Each also asserts one control, real DOM order, no
heading/button/stage overlap, horizontal bounds, complete animation viewport
visibility and exclusion of the actual sticky header (52px portrait, 68px
landscape/desktop). Actual pointer clicks dispatch exactly once, disable the
control, leave persistence unchanged at request time, finish the existing legal
encounter/round/floor, remove the obsolete control and restore home navigation.
The test waits for original settlement rather than mocking a stop or advancing
its battle clock. Arena assertions verify all three fights in one completed round.

| Actual formal case | 390×844 | 844×390 | 1365×900 |
| --- | --- | --- | --- |
| Galaxy normal | 66 / 88–132 / 150 | 106 / 128–174 / 184 | 139 / 161–207 / 217 |
| Galaxy elite | 102 / 124–168 / 186 | 106 / 128–174 / 184 | 139 / 161–207 / 217 |
| Galaxy Boss | 102 / 124–168 / 186 | 106 / 128–174 / 184 | 139 / 161–207 / 217 |
| Universe main | 102 / 124–168 / 186 | 106 / 128–174 / 184 | 139 / 161–207 / 217 |
| Galaxy special | 96 / 118–162 / 180 | 95 / 117–163 / 173 | 128 / 150–196 / 206 |
| Universe special | 96 / 118–162 / 180 | 95 / 117–163 / 173 | 128 / 150–196 / 206 |
| Galaxy calamity | 248 / 270–314 / 332 | 101 / 123–169 / 179 | 266 / 288–334 / 344 |
| Universe calamity | 113 / 125–169 / 187 | 111 / 123–169 / 179 | 150 / 162–208 / 218 |
| Higher ten kings | 110.8 / 132.8–176.8 / 194.8 | 77.2 / 99.2–145.2 / 155.2 | 147.2 / 169.2–215.2 / 225.2 |
| Galaxy bounty | 97 / 170–214 / 232 | 27 / 100–146 / 156 | 131 / 204–250 / 260 |
| Galaxy arena | 9 / 133–177 / 195 | -6 / 100–146 / 156 | 123 / 229–275 / 285 |
| Universe bounty | 97 / 170–214 / 232 | 27 / 100–146 / 156 | 131 / 204–250 / 260 |
| Universe arena | 9 / 133–177 / 195 | -6 / 100–146 / 156 | 123 / 229–275 / 285 |
| Higher fixed arena | -248 / 133–177 / 195 | -95 / 100–146 / 156 | 123 / 318–364 / 374 |
| Higher varied arena | -248 / 133–177 / 195 | -95 / 100–146 / 156 | 123 / 318–364 / 374 |
| Galaxy Void | 249.2 / 264.2–308.2 / 326.2 | 106.6 / 116.6–162.6 / 172.6 | 313.6 / 323.6–369.6 / 379.6 |
| Universe Void | 249.2 / 264.2–308.2 / 326.2 | 106.6 / 116.6–162.6 / 172.6 | 313.6 / 323.6–369.6 / 379.6 |
| Higher Void | 249.2 / 264.2–308.2 / 326.2 | 106.6 / 116.6–162.6 / 172.6 | 313.6 / 323.6–369.6 / 379.6 |

The six special-case screenshots accompany the single JSON report in the existing
Runtime R2 artifact `/tmp/formal-continuous-stop/`; no extra CI job was created.
`FORMAL_STOP_FILTER` is only a local diagnostic option and is rejected in CI.
The browser suite has no retry.

### Source protection and regression evidence

`formal-stop-approved.json` records 111 named literal substitutions across exactly
28 production files against baseline `215cb89207363b0ed16e08fae9b8532ee67390a3`.
The verifier reconstructs each approved source from immutable Git baseline bytes,
checks each exact substitution occurs once, checks before/after SHA256, and
rejects every other byte. The existing Issue106 → appearance/GM → Batch20 →
foreground/Mirror/Void protection chain remains active. Historical source views
use this reversible projection; live function and browser tests use actual code.
Mutation tests append unauthorized bytes to every approved file and require
rejection. The old PR48 historical contract remains, alongside live new tests.

The resource manifest keeps its schema, path set and algorithm; only the 27
changed shipped fingerprints are regenerated. Index cache versions are updated
for affected assets. Fifteen numerical, reward/save/progress owner files and the
Void minimal-mode section are checked byte-for-byte against baseline.

Local verification completed before opening the PR:

- 16 new unit/contract tests, including every actual adapter, single-fight omission,
  idempotence, stale controls, missing adapter and unauthorized-source mutations.
- 54 new actual formal-browser cases, three sizes; special screenshots visually
  inspected including sticky-header occlusion.
- Existing viewport 45-case matrix; PR48 24-mode matrix; actual full three-fight
  arena rounds and calamity presentation; foreground interruption/checkpoints;
  Mirror/Void recovery; 80-battle/180-sale/20-offline/20-preview reward matrix.
- Runtime Node regression suite (all eight commands), source/notice/function seals,
  JS integrity, resource manifest, CI command inventory, and 28 equipment unit tests.
- Chromium cross-era background/minimal: galaxy, universe and Void all passed
  with two background cycles each. Higher background/HUD/minimal passed at
  1280×800 and 390×844, including original recovery and GM policy assertions.

### Limits and review

Browser evidence covers actual Chromium at three viewports; it is not a physical
phone or real iOS app-switch test. Existing WebKit/background CI remains required.
Fixtures provide deterministic strong player stats and isolated SDK sessions;
production combat formulas, drop rates, saves and progression were not changed.
CI URLs and final commit are supplied in the PR acceptance report. No merge or
Pages publication is performed by this change.
