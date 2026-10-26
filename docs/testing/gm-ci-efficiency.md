# GM Functional CI coverage and timing

Baseline: `f239249a27e0c0b0a1106a3bfa540ee85bb2e7a8` (latest main at start).
Implementation scope: test orchestration, browser tests, CI only. No shipped sources,
source registrations, historical seals or release configuration will change.

## Coverage plan recorded before editing tests

| Existing acceptance / assertions | Before | Planned after |
| --- | --- | --- |
| GM terminology contract | GM entry 1 | unchanged |
| Readonly player snapshot | GM entry 2 | unchanged |
| Early GM runtime restoration | GM entry 3 | unchanged |
| batch19-2 wrapper | GM entry 4, maximized then bridge | same order, both retained |
| GM 3D center navigation, retired controls, unauthenticated access, battle disposal, maximize/Escape/scroll restore | GM entry 5 | unchanged |
| Live bridge: parent header, Escape/settings, gallery cancellation, state and localStorage byte equality | separate browser in entry 4 | unchanged, clean environment retained |
| Three modes: player, monster, duel; six specified actions; fit union, actual alpha bounds, no timers/HUD/legacy buttons | all 3 viewports | full in portrait; all modes and six actions retained in other viewports |
| Speed options and live 2×/1.5×/1× changes without reload | all viewports/modes | full in portrait |
| Attack repeats, defeat resets/repeats, ordered six-action loop, duel auto sequence | all viewports/modes | full real-time cycles in portrait, condition wait on observed transitions |
| Stop holds sequence, restart resumes; pixels and screenshots | all viewports/modes | all viewports/modes |
| Galaxy/universe/higher × existing main/calamity/bounty/arena/void/alternate samples; normal/elite/boss/special; ratios 1/1.5/1.75/2; ship-04/beast-03/core-03 | all viewports, six actions, five pixel scans/action | all original unique identity/era/source combinations and six actions in portrait; other viewports use union of kind/ratio/shape representatives, attack/dodge/defeat and actual alpha scans over full 700ms owner duration (all six actions also checked in each mode) |
| Human-readable identity/caption, no raw asset paths | every sample | every executed sample |
| Alternate: 20 cultures, 5 stages, final culture/universe/stage, effects screenshot | all viewports | all viewports |
| Formal mirror | all viewports | all viewports |
| Selection loads zero, enter readiness, release refs/canvases/RAF, cached reentry | all viewports | all viewports, add monster-ref release check |
| Rotate and restore viewport; actual pixels within stage | all viewports | all viewports, wait for measured layout |
| Sustained playback, increasing sequence, constant loads/refs, final pixels | 60s portrait, 3s others | unchanged durations |
| Missing assets and recovery | all viewports | all viewports |
| Revoke GM auth, status + stopped RAF/canvases | all viewports | all viewports, wait for actual disposal |
| Page errors | all viewports + bridge + center | unchanged |
| Evidence report / PNG paths | `GM_PREVIEW_EVIDENCE` or `/tmp/gm-preview-evidence`, report.json and width-mode / width-alternate-effects PNGs | same paths and existing report fields; additive coverage/timing metadata |

All three viewport pages keep isolated contexts. One Chromium process is already
shared inside maximized acceptance; cross-test context sharing is unnecessary and
would weaken authorization/storage isolation. No parallel browser workloads are
planned, avoiding contention and changes to test ordering.

## Dependency and gate audit

- Functional CI invokes five entries in the order above. `batch19-2` synchronously
  executes maximized preview then live bridge and propagates failure.
- `gm-3d-test-center-browser.js` also runs via Runtime Integrity's suite manifest
  and the existing standalone GM workflow. Keep its CLI contract intact.
- Repository search found no consumer parsing maximized `report.json`; preserve
  `passed`, `reports`, `viewport`, `samples`, `realIPhone` and `passed` in each row.
- Artifact name `gm-preview-${run_attempt}`, evidence directory and screenshots
  stay intact. Add timings to existing report/Artifact and Actions summary.
- `gm-preview-approved.cjs` projects six exact registered production sources and
  checks a seventh new layout source; it chains Issue106 seals. No registrations
  or sealed files need changing for this test-only work.
- Existing Functional CI classification/gate remains authoritative; workflow edits
  select all domains. Do not weaken routing or mandatory gate logic.
- Branch protection API returned HTTP 403 for the integration. Required-check
  configuration cannot be independently inspected; inspect actual PR checks and
  report that limitation. Never merge or deploy in this task.

## Wait audit and design

- Replace 220ms action readiness with requested state and a subsequent actual
  canvas draw; replace 1400ms repeat delay with sequence transition.
- Replace 56 × 165ms polling with in-frame requestAnimationFrame observation of
  the complete ordered loop; keep real time, no clock acceleration.
- Keep finite-duration pixel observations (at least 700ms at 1×), stop hold
  (1300ms), and long run (60000ms/3000ms). These measure elapsed-time behavior.
- Replace 50ms auto readiness and 300/100ms rotation delays with draw/layout
  conditions; replace 2300ms after revoked status with resource disposal condition.
- Keep browser fixture and clean contexts; measure entry/loading, pixel checks,
  release, sampling, modes and sustained playback without introducing retries.

## Timing evidence

Reference Actions run 40255227510, GM job 121355623801: 522s (8m42s).
User's original per-viewport measurements: 206s / 146s / 148s, approximately
500s maximized test. Local baseline and optimized measurements will be recorded
separately because hardware, Chromium version and cache differ from Actions.

Registry audit found that explicit `visibleRatio` 1 and 1.5 have no matching rows;
the original conditional sampler silently skipped both. Preserve every original
row and require existing 1.75/2 ratio representatives explicitly. The four kinds
and three named assets are also mandatory in the cross-viewport matrix. Each
cross-viewport sample uses attack/dodge/defeat, while each viewport still checks
all six actions in all three modes. This avoids repeating the full Cartesian
matrix outside the portrait functional run.

Exact duplicate tuples are consolidated in the primary matrix: 19 original rows
represent 17 unique identity/era/source combinations (`galaxy-map-001` and
`galaxy-calamity-01` each occurred twice). Every unique case and its assertions
remain. Primary six-action mode checks now validate every speed for each action,
including constant player AND monster load counts, beyond the old attack-only
speed switch assertion.

Historical Actions logs independently confirm portrait/landscape/desktop completion
at 01:43:06.113Z / 01:45:32.417Z / 01:48:00.068Z, with bridge and center
passing at 01:48:04.768Z and 01:48:07.652Z. Run/job URLs:
https://github.com/franksky1207/rpg/actions/runs/40255227510/job/121355623801

The original maximized script uses one browser already. Keep it; each `newPage`
creates a fresh context. Browser reuse across independently executable tests was
rejected because the existing separation protects storage/auth contracts and
its few seconds cannot explain the eight-minute bottleneck.

### Draw readiness and instrumentation

Requested-action readiness checks both animation state and a new draw on every
actor canvas. A test-local wrapper observes each canvas context's `clearRect`
call; it delegates unchanged to the original method, changes no prototype and
expires with that actor/context. Capture counters after selection's synchronous
stop/idle redraw, so that redraw cannot be mistaken for the requested animation.
No virtual clock, reduced playback duration, production diagnostic API or retry
is introduced. Resource release remains checked after every sample.

Timing output adds one `timings.json` beside the existing `report.json`; existing
PNG names and Artifact configuration remain intact. Per-viewport details extend
`report.json`. Cost categories for load/decode, alpha scanning and release are
inclusive subsets, not additive phase totals. Actions summary labels suite time,
job elapsed through acceptance (checkout/setup included), and the exclusions for
artifact upload/post-job cleanup; full job time comes from Actions job metadata.

Local original-script baseline passed all three viewports in **509.243s**
(8m29.243s), Chromium 154.0.8037.57 / Playwright 1.55.0. A short concurrent
mode smoke and static checks ran during this baseline, so use the historical
Actions timings for the primary CI comparison; do not treat local seconds as a
hardware-controlled benchmark.

During development the first condition-only repeat assertion exposed the exact
state/draw race this work must prevent: sequence had advanced after a death clip,
while its canvas still held the previous transparent endpoint. The test failed
rather than skipping pixels. Repeat readiness now waits for a subsequent actual
canvas draw before asserting painted pixels. No retry or assertion removal was
used. Final complete runs below supersede these intermediate failures.

The stronger per-frame visibility assertion explicitly accounts for intended
700ms death fade: both actors must paint during entry and the early/middle
samples; at the monster's death endpoint, the player must still paint and all
remaining alpha bounds must stay inside the stage. Requiring a visible monster
at alpha zero would incorrectly reject the unchanged renderer. The old clipping
assertions remain at that endpoint too.

Additional local checks passed: GM terminology, readonly snapshot, early restore,
GM exact-source seal, Issue106 seals, Batch20 protected runtime, Batch12 safety,
cleanup 4-4 / 2-4 guards, preview retirement, JavaScript structural integrity,
resource manifest, CI impact self-test, CI suite inventory tests, HTML cache
version guard and workflow YAML parsing. No source-lock approval was needed
because no registered production bytes changed.

## Completed local validation (first full passing run)

| Metric | Seconds |
| --- | ---: |
| Original maximized script | 509.243 |
| Optimized maximized phases | 280.640 |
| Optimized five-entry suite | 295.617 |

| Viewport | Total s | Mode/six-action s | Monster/action sampling s | Stability s | Load/decode s | Pixel s | Release s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 390×844 / full | 194.657 | 43.905 | 85.430 | 60.017 | 5.876 | 5.501 | 1.561 |
| 844×390 / display | 42.161 | 9.755 | 24.456 | 3.026 | 3.577 | 1.512 | 0.939 |
| 1365×900 / display | 43.761 | 10.573 | 24.596 | 3.021 | 3.592 | 1.784 | 1.102 |

All five entry tests passed. Evidence comparison against the original report
confirmed the same 17 unique original cases in the full matrix, all mandatory
representative categories in each display matrix, actual 60s/3s stability holds,
12 identical PNG filenames and preserved report fields. Sampling operations
reduce from 342 monster/action combinations to 156, each with five real alpha
scans. Only exact duplicates and repetition across viewports are consolidated.

A second local complete run and this PR’s Actions results are recorded in the PR
acceptance report after the tested commit is pushed, avoiding another CI run for
a report-only commit. Full job duration uses Actions start/completion metadata.
